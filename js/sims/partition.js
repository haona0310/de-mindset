/* Mô phỏng: phân mảnh theo key, data skew và chi phí shuffle khi join */
(function () {
  'use strict';
  var DE = window.DE, el = DE.el, ui = DE.ui, fmt = DE.fmt;
  var TOTAL = 2400, KEYS = 60;

  function hashKey(k) {
    var x = Math.imul(k + 1, 2654435761) >>> 0;
    x ^= x >>> 15;
    return x >>> 0;
  }

  /* Trả về số bản ghi mỗi node, tách riêng phần của key nóng */
  function compute(s) {
    var hot = Math.round((TOTAL * s.skew) / 100);
    var rest = TOTAL - hot;
    var base = Math.floor(rest / (KEYS - 1)), extra = rest - base * (KEYS - 1);
    var nodes = [];
    for (var i = 0; i < s.nodes; i++) nodes.push({ hot: 0, other: 0 });

    if (s.strat === 'rr') {
      var per = Math.floor(TOTAL / s.nodes), left = TOTAL - per * s.nodes;
      var hotPer = Math.floor(hot / s.nodes), hotLeft = hot - hotPer * s.nodes;
      nodes.forEach(function (n, i) {
        var total = per + (i < left ? 1 : 0);
        n.hot = hotPer + (i < hotLeft ? 1 : 0);
        n.other = total - n.hot;
      });
    } else {
      for (var k = 1; k < KEYS; k++) {
        nodes[hashKey(k) % s.nodes].other += base + (k <= extra ? 1 : 0);
      }
      if (s.strat === 'salt') {
        var hp = Math.floor(hot / s.nodes), hl = hot - hp * s.nodes;
        nodes.forEach(function (n, i) { n.hot = hp + (i < hl ? 1 : 0); });
      } else {
        nodes[hashKey(0) % s.nodes].hot = hot;
      }
    }
    var totals = nodes.map(function (n) { return n.hot + n.other; });
    var max = Math.max.apply(null, totals), avg = TOTAL / s.nodes;
    var shuffle = s.strat === 'rr' ? Math.round((TOTAL * (s.nodes - 1)) / s.nodes) : 0;
    return { nodes: nodes, totals: totals, max: max, avg: avg, factor: max / avg, shuffle: shuffle, sum: totals.reduce(function (a, b) { return a + b; }, 0) };
  }
  DE._partitionCompute = compute;

  DE.addSim('partition', {
    title: 'Partition, skew và shuffle',
    desc: 'Chia 2.400 bản ghi của 60 khách hàng cho các node. Một khách hàng "nóng" chiếm phần lớn bản ghi. Xem node nào gánh, và join theo khách hàng tốn bao nhiêu shuffle.',
    lessons: ['2-1', '2-2'],
    takeaways: [
      'Chia theo hash của key: mọi bản ghi của key nóng dồn về **một node**. Thêm node không làm cột cao nhất thấp đi.',
      'Thời gian job gần bằng thời gian của **node bận nhất**, nên hệ số lệch 4 lần nghĩa là chậm khoảng 4 lần so với lý tưởng.',
      'Xoay vòng chia đều tuyệt đối, nhưng khi cần join hoặc group theo key thì gần như toàn bộ dữ liệu phải **shuffle**.',
      'Salting rải key nóng ra nhiều node. Cái giá: bảng bên kia của phép join phải nhân bản dòng của key nóng tương ứng.'
    ],
    mount: function (root) {
      var s = { nodes: 4, skew: 40, strat: 'hash' };
      var out = el('div');
      root.appendChild(el('div', { class: 'controls' },
        ui.slider({ label: 'Số node', min: 2, max: 8, value: s.nodes, oninput: function (v) { s.nodes = v; render(); } }),
        ui.slider({ label: 'Tỷ trọng của khách hàng nóng', min: 2, max: 90, value: s.skew, fmt: function (v) { return v + '%'; }, oninput: function (v) { s.skew = v; render(); } }),
        ui.select({
          label: 'Cách chia', value: s.strat,
          options: [['hash', 'Hash theo mã khách hàng'], ['salt', 'Hash, có salting cho key nóng'], ['rr', 'Xoay vòng (không theo key)']],
          onchange: function (v) { s.strat = v; render(); }
        })));
      root.appendChild(out);

      function render() {
        var r = compute(s);
        out.innerHTML = '';
        out.appendChild(el('div', { class: 'legend' },
          el('span', null, el('i', { class: 'sw-w' }), 'bản ghi của khách hàng nóng'),
          el('span', null, el('i', { class: 'sw-a' }), 'bản ghi của 59 khách hàng còn lại')));
        out.appendChild(el('div', { class: 'vbars', role: 'img', 'aria-label': 'Số bản ghi trên mỗi node: ' + r.totals.join(', ') },
          r.nodes.map(function (n, i) {
            return el('div', { class: 'vbar' },
              el('div', { class: 'vbar-num', text: fmt.num(r.totals[i]) }),
              el('div', { class: 'vbar-seg hot', style: 'height:' + (n.hot / r.max) * 100 + '%' }),
              el('div', { class: 'vbar-seg', style: 'height:' + (n.other / r.max) * 100 + '%' }),
              el('div', { class: 'vbar-name', text: 'Node ' + (i + 1) }));
          })));
        var tone = r.factor > 2 ? 'bad' : r.factor > 1.3 ? 'warn' : 'good';
        out.appendChild(el('div', { class: 'stats' },
          ui.stat('Node bận nhất', fmt.num(r.max), tone, 'trung bình ' + fmt.num(r.avg)),
          ui.stat('Hệ số lệch', r.factor.toFixed(2).replace('.', ',') + '×', tone, 'bận nhất chia trung bình'),
          ui.stat('Shuffle khi join theo khách hàng', fmt.num(r.shuffle), r.shuffle ? 'bad' : 'good', 'bản ghi phải đi qua mạng'),
          ui.stat('Tổng kiểm', fmt.num(r.sum), '', 'luôn bằng ' + fmt.num(TOTAL))));

        var msg, cls = tone;
        if (s.strat === 'rr') {
          msg = 'Chia đều tuyệt đối, nhưng các bản ghi của cùng một khách hàng nằm rải mọi node. Muốn join hay group theo khách hàng, khoảng ' + fmt.num(r.shuffle) + ' trên ' + fmt.num(TOTAL) + ' bản ghi phải chuyển chỗ. Sau shuffle, key nóng lại dồn về một node như cách chia theo hash.';
          cls = 'warn';
        } else if (s.strat === 'salt') {
          msg = 'Key nóng được gắn thêm số ngẫu nhiên nên rải đều ra ' + s.nodes + ' node. Để join đúng, bảng bên kia phải nhân bản dòng của key nóng thành ' + s.nodes + ' bản, mỗi bản một giá trị salt.';
        } else if (r.factor > 2) {
          msg = 'Một node gánh ' + fmt.num(r.max) + ' bản ghi trong khi trung bình là ' + fmt.num(r.avg) + '. Job sẽ chạy lâu gấp khoảng ' + r.factor.toFixed(1).replace('.', ',') + ' lần mức lý tưởng, và node đó có nguy cơ hết bộ nhớ. Thử tăng số node: cột cao nhất không đổi.';
        } else {
          msg = 'Phân bố tương đối đều. Dữ liệu đã nằm sẵn theo key nên join theo khách hàng không cần shuffle bảng này.';
        }
        out.appendChild(el('p', { class: 'verdict ' + cls, text: msg }));
      }
      render();
    }
  });
})();
