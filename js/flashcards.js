/* Flashcard ôn lặp lại ngắt quãng (SM-2 rút gọn). Thẻ lấy từ trường cards của từng bài học. */
(function () {
  'use strict';
  var DE = window.DE, el = DE.el, ui = DE.ui;
  var NEW_PER_DAY = 15;

  /* Tính trạng thái mới của một thẻ sau khi chấm. g: 0 Quên, 1 Khó, 2 Nhớ, 3 Dễ */
  function next(s, g, today) {
    s = s || { ef: 2.5, int: 0, reps: 0 };
    var ef = s.ef, int = s.int, reps = s.reps;
    if (g === 0) { reps = 0; int = 0; ef = Math.max(1.3, ef - 0.2); }
    else if (g === 1) { int = reps === 0 ? 1 : Math.max(1, Math.round(int * 1.2)); ef = Math.max(1.3, ef - 0.15); reps++; }
    else if (g === 2) { int = reps === 0 ? 1 : reps === 1 ? 3 : Math.round(int * ef); reps++; }
    else { int = reps === 0 ? 4 : Math.round(Math.max(int, 1) * ef * 1.3); ef = ef + 0.15; reps++; }
    return { ef: Math.round(ef * 100) / 100, int: int, reps: reps, due: today + int };
  }
  DE._cardNext = next;

  function label(days) {
    if (days <= 0) return 'ngay trong phiên';
    if (days < 30) return days + ' ngày';
    return Math.round(days / 30) + ' tháng';
  }

  DE.views.cards = function (main, arg) {
    var all = DE.allCards();
    var today = DE.today();
    var st = DE.state;
    if (st.newDay !== today) { st.newDay = today; st.newCount = 0; }
    var filter = arg || 'all';
    var queue = [], flipped = false, extra = 0;

    function pool() { return all.filter(function (c) { return filter === 'all' || c.lesson.stage.id === filter; }); }
    function build() {
      var p = pool();
      var due = p.filter(function (c) { return st.cards[c.id] && st.cards[c.id].due <= today; });
      var allowance = Math.max(0, NEW_PER_DAY - st.newCount) + extra;
      var fresh = p.filter(function (c) { return !st.cards[c.id]; }).slice(0, allowance);
      queue = due.concat(fresh);
      flipped = false;
    }

    function grade(g) {
      var card = queue.shift();
      if (!st.cards[card.id]) { st.newCount++; if (extra > 0) extra--; }
      st.cards[card.id] = next(st.cards[card.id], g, today);
      if (g === 0) queue.push(card);
      DE.save();
      flipped = false;
      render();
    }

    function onKey(e) {
      if (/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(e.target.tagName) && e.key !== ' ') return;
      if (!queue.length) return;
      if (!flipped && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); flipped = true; render(); }
      else if (flipped && /^[1-4]$/.test(e.key)) { e.preventDefault(); grade(+e.key - 1); }
    }
    document.addEventListener('keydown', onKey);
    DE.cleanup = function () { document.removeEventListener('keydown', onKey); };

    var body = el('div');
    main.appendChild(el('header', { class: 'page-head' },
      el('h1', { text: 'Flashcard' }),
      el('p', { class: 'lead', text: 'Thẻ bạn nhớ tốt sẽ xuất hiện thưa dần, thẻ hay quên sẽ quay lại sớm. Mỗi ngày vài phút hiệu quả hơn dồn một buổi dài.' })));
    main.appendChild(body);

    function render() {
      body.innerHTML = '';
      var p = pool();
      var seen = p.filter(function (c) { return st.cards[c.id]; });
      var solid = seen.filter(function (c) { return st.cards[c.id].int >= 7; });
      var unseen = p.length - seen.length;

      body.appendChild(el('div', { class: 'fc-bar' },
        ui.select({
          label: 'Bộ thẻ', value: filter,
          options: [['all', 'Tất cả các chặng']].concat(DE.stages.map(function (s) { return [s.id, 'Chặng ' + s.n + ': ' + s.title]; })),
          onchange: function (v) { location.hash = v === 'all' ? '#/cards' : '#/cards/' + v; }
        })));
      body.appendChild(el('div', { class: 'stats' },
        ui.stat('Trong bộ này', p.length, '', 'thẻ'),
        ui.stat('Đã học', seen.length),
        ui.stat('Đã thuộc', solid.length, solid.length ? 'good' : '', 'khoảng ôn từ 7 ngày'),
        ui.stat('Còn trong phiên', queue.length, queue.length ? 'warn' : 'good')));

      if (!queue.length) {
        body.appendChild(el('div', { class: 'empty' },
          el('p', { text: unseen ? 'Hết thẻ đến hạn hôm nay. Còn ' + unseen + ' thẻ chưa học trong bộ này.' : 'Hết thẻ đến hạn hôm nay, và bạn đã học qua mọi thẻ của bộ này. Quay lại vào ngày mai.' }),
          unseen ? el('button', {
            class: 'btn btn-primary', type: 'button', text: 'Học thêm ' + Math.min(10, unseen) + ' thẻ mới',
            onclick: function () { extra = 10; build(); render(); }
          }) : null));
        return;
      }

      var card = queue[0], s = st.cards[card.id];
      var face = el('div', {
        class: 'fc-card', tabindex: flipped ? null : '0', role: flipped ? null : 'button',
        'aria-label': flipped ? null : 'Lật thẻ để xem đáp án',
        onclick: function () { if (!flipped) { flipped = true; render(); } }
      },
        el('div', { class: 'fc-from', text: 'Chặng ' + card.lesson.stage.n + ' · ' + card.lesson.title }),
        el('div', { class: 'fc-q', text: card.q }),
        flipped ? el('div', { class: 'fc-a', html: DE.inline(card.a) }) : el('div', { class: 'fc-hint', text: 'Tự trả lời thành lời, rồi bấm hoặc nhấn phím cách để xem đáp án.' }));
      body.appendChild(face);

      if (flipped) {
        var names = ['Quên', 'Khó', 'Nhớ', 'Dễ'];
        body.appendChild(el('div', { class: 'fc-grades' }, names.map(function (n, g) {
          return el('button', { class: 'btn' + (g === 2 ? ' btn-primary' : ''), type: 'button', onclick: function () { grade(g); } },
            el('span', { text: (g + 1) + ' · ' + n }),
            el('small', { style: g === 2 ? 'color:inherit;opacity:.8' : null, text: label(next(s, g, today).int) }));
        })));
        body.appendChild(el('p', { class: 'links' }, el('a', { class: 'btn btn-quiet', href: '#/lesson/' + card.lesson.id, text: 'Xem lại bài: ' + card.lesson.title })));
      }
    }

    build();
    render();
  };
})();
