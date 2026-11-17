/* Mô phỏng: cửa sổ thời gian, sự kiện đến trễ và watermark */
(function () {
  'use strict';
  var DE = window.DE, el = DE.el, ui = DE.ui;
  var N = 180, SPAN = 60;

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  /* Bộ sự kiện cố định: mỗi sự kiện có 3 số ngẫu nhiên, nên kéo thanh trượt không làm xáo dữ liệu */
  var base = (function () {
    var r = rng(20261116), out = [];
    for (var i = 0; i < N; i++) out.push({ t: r() * SPAN, u: r(), d: r() });
    return out;
  })();

  function compute(s) {
    var events = base.map(function (b) {
      var late = b.u < s.late / 100;
      var delay = late ? 4 + b.d * 26 : b.d * 2.5;
      return { t: b.t, arrive: b.t + delay, late: late };
    });
    var wins = [];
    for (var a = 0; a < SPAN; a += s.win) wins.push({ from: a, to: a + s.win, truth: 0, naive: 0, wm: 0 });
    var dropped = 0;
    events.forEach(function (e) {
      var w = wins[Math.min(wins.length - 1, Math.floor(e.t / s.win))];
      w.truth++;
      var kept = e.arrive <= w.to + s.wm;
      if (kept) w.wm++; else dropped++;
      e.kept = kept;
      var nw = wins[Math.floor(e.arrive / s.win)];
      if (nw) nw.naive++;
    });
    var naiveErr = wins.reduce(function (n, w) { return n + Math.abs(w.naive - w.truth); }, 0);
    return { events: events, wins: wins, dropped: dropped, naiveErr: naiveErr, total: N };
  }
  DE._streamCompute = compute;

  DE.addSim('stream', {
    title: 'Batch, streaming và dữ liệu đến trễ',
    desc: '180 sự kiện xảy ra trong 60 giây, một phần đến hệ thống muộn. Đếm số sự kiện theo từng cửa sổ thời gian và xem ba cách tính cho ra kết quả khác nhau thế nào.',
    lessons: ['3-2', '6-2'],
    takeaways: [
      'Đếm theo **thời điểm nhận** thì nhanh nhưng xếp sự kiện vào sai cửa sổ: số của cửa sổ này bị dồn sang cửa sổ sau.',
      'Đếm theo **thời điểm xảy ra** thì phải quyết định chờ bao lâu. Watermark càng dài, càng ít sự kiện bị bỏ sót, và kết quả càng ra chậm.',
      'Không có cài đặt nào vừa tức thời vừa đủ. Batch chạy sau một giờ chính là watermark rất dài: đúng, và chậm.',
      'Con số "bị bỏ sót" là thứ nghiệp vụ phải quyết định có chấp nhận hay không, không phải kỹ thuật tự quyết.'
    ],
    mount: function (root) {
      var s = { win: 15, wm: 3, late: 15 };
      var out = el('div');
      root.appendChild(el('div', { class: 'controls' },
        ui.select({ label: 'Độ dài cửa sổ', value: '15', options: [['10', '10 giây'], ['15', '15 giây'], ['20', '20 giây'], ['30', '30 giây']], onchange: function (v) { s.win = +v; render(); } }),
        ui.slider({ label: 'Watermark: chờ thêm sau khi cửa sổ đóng', min: 0, max: 30, value: s.wm, fmt: function (v) { return v + ' giây'; }, oninput: function (v) { s.wm = v; render(); } }),
        ui.slider({ label: 'Tỷ lệ sự kiện đến trễ', min: 0, max: 50, value: s.late, fmt: function (v) { return v + '%'; }, oninput: function (v) { s.late = v; render(); } })));
      root.appendChild(out);

      function render() {
        var r = compute(s);
        out.innerHTML = '';

        var strip = el('div', { class: 'strip', role: 'img', 'aria-label': 'Các sự kiện trên trục thời gian xảy ra' });
        r.wins.forEach(function (w) { strip.appendChild(el('b', { style: 'left:' + (w.from / SPAN) * 100 + '%' })); });
        r.events.forEach(function (e) {
          strip.appendChild(el('i', { class: !e.kept ? 'sw-b' : e.late ? 'sw-w' : 'sw-a', style: 'left:' + (e.t / SPAN) * 100 + '%' }));
        });
        out.appendChild(el('div', { class: 'legend' },
          el('span', null, el('i', { class: 'sw-a' }), 'đến đúng lúc'),
          el('span', null, el('i', { class: 'sw-w' }), 'đến trễ, vẫn kịp watermark'),
          el('span', null, el('i', { class: 'sw-b' }), 'đến sau watermark: bị bỏ sót')));
        out.appendChild(strip);
        out.appendChild(el('p', { class: 'muted', style: 'font-size:.8rem;margin:0 0 14px', text: 'Mỗi chấm là một sự kiện, đặt theo thời điểm nó xảy ra (0 đến 60 giây). Vạch đứt là ranh giới cửa sổ.' }));

        var max = Math.max.apply(null, r.wins.map(function (w) { return Math.max(w.truth, w.naive, w.wm); })) || 1;
        out.appendChild(el('div', { class: 'legend' },
          el('span', null, el('i', { class: 'sw-m' }), 'sự thật (theo lúc xảy ra, biết hết)'),
          el('span', null, el('i', { class: 'sw-w' }), 'đếm theo lúc nhận'),
          el('span', null, el('i', { class: 'sw-a' }), 'đếm theo lúc xảy ra + watermark')));
        out.appendChild(el('div', { class: 'vbars' }, r.wins.map(function (w) {
          function bar(v, tone) {
            return el('div', { class: 'tone-' + tone, style: 'height:' + (v / max) * 100 + '%' }, el('span', { text: v }));
          }
          return el('div', { class: 'vgroup' },
            el('div', { class: 'vgroup-bars' }, bar(w.truth, 'm'), bar(w.naive, 'w'), bar(w.wm, 'a')),
            el('div', { class: 'vbar-name', text: w.from + '–' + w.to + 's' }));
        })));

        var pct = Math.round(((r.total - r.dropped) / r.total) * 100);
        out.appendChild(el('div', { class: 'stats' },
          ui.stat('Bị bỏ sót', r.dropped + ' / ' + r.total, r.dropped ? (r.dropped > 9 ? 'bad' : 'warn') : 'good', 'đến sau watermark'),
          ui.stat('Độ đầy đủ', pct + '%', pct >= 99 ? 'good' : pct >= 95 ? 'warn' : 'bad'),
          ui.stat('Kết quả ra chậm', s.wm + ' giây', s.wm > 15 ? 'warn' : '', 'sau khi cửa sổ đóng'),
          ui.stat('Sai lệch nếu đếm theo lúc nhận', r.naiveErr, r.naiveErr > 10 ? 'bad' : 'warn', 'tổng chênh qua các cửa sổ')));

        var msg, cls;
        if (r.dropped === 0) { msg = 'Không sự kiện nào bị bỏ sót, nhưng mỗi cửa sổ phải chờ thêm ' + s.wm + ' giây mới chốt được. Thử giảm watermark xem mất bao nhiêu.'; cls = 'good'; }
        else if (s.wm === 0) { msg = 'Không chờ gì cả: kết quả ra ngay khi cửa sổ đóng, và ' + r.dropped + ' sự kiện đến muộn bị bỏ. Đây là giá của "tức thời".'; cls = 'bad'; }
        else { msg = 'Chờ ' + s.wm + ' giây vẫn bỏ sót ' + r.dropped + ' sự kiện. Muốn đủ hơn phải chờ lâu hơn, hoặc xử lý bù các sự kiện muộn bằng một nhánh riêng.'; cls = 'warn'; }
        out.appendChild(el('p', { class: 'verdict ' + cls, text: msg }));
      }
      render();
    }
  });
})();
