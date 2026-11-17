/* Render bài học từ các khối nội dung trong content/stage-*.js */
(function () {
  'use strict';
  var DE = window.DE, el = DE.el;

  DE.renderBlocks = function (blocks) {
    var frag = document.createDocumentFragment();
    (blocks || []).forEach(function (b) {
      if (typeof b === 'string') {
        frag.appendChild(el('p', { html: DE.inline(b) }));
      } else if (b.h) {
        frag.appendChild(el('h3', { html: DE.inline(b.h) }));
      } else if (b.ul) {
        frag.appendChild(el('ul', null, b.ul.map(function (x) { return el('li', { html: DE.inline(x) }); })));
      } else if (b.tip) {
        frag.appendChild(el('div', { class: 'callout tip' },
          el('div', { class: 'callout-tag', text: 'Tư duy' }), el('p', { html: DE.inline(b.tip) })));
      } else if (b.warn) {
        frag.appendChild(el('div', { class: 'callout warn' },
          el('div', { class: 'callout-tag', text: 'Cẩn thận' }), el('p', { html: DE.inline(b.warn) })));
      } else if (b.table) {
        var head = b.table[0], rows = b.table.slice(1);
        frag.appendChild(el('div', { class: 'table-wrap' },
          el('table', null,
            el('thead', null, el('tr', null, head.map(function (c) { return el('th', { html: DE.inline(c) }); }))),
            el('tbody', null, rows.map(function (r) {
              return el('tr', null, r.map(function (c) { return el('td', { html: DE.inline(c) }); }));
            })))));
      } else if (b.flow) {
        var parts = [];
        b.flow.forEach(function (x, i) {
          if (i) parts.push(el('span', { class: 'flow-arrow', 'aria-hidden': 'true', text: '→' }));
          parts.push(el('span', { class: 'flow-box', html: DE.inline(x) }));
        });
        frag.appendChild(el('div', { class: 'flow' }, parts));
      } else if (b.fig) {
        var f = DE.renderFig(b.fig, b.cap);
        if (f) frag.appendChild(f);
      } else if (b.code) {
        frag.appendChild(el('pre', null, el('code', { text: b.code })));
      }
    });
    return frag;
  };

  DE.views.lesson = function (main, id) {
    var lesson = DE.findLesson(id);
    if (!lesson) { location.hash = '#/'; return; }
    var all = DE.allLessons();
    var idx = all.indexOf(lesson);
    var prev = all[idx - 1], next = all[idx + 1];
    var done = !!DE.state.done[lesson.id];

    var art = el('article', { class: 'lesson' });
    art.appendChild(el('p', { class: 'crumb' },
      el('a', { href: '#/', text: 'Lộ trình' }), ' / Chặng ' + lesson.stage.n + ': ' + lesson.stage.title));
    art.appendChild(el('h1', { text: lesson.title }));
    art.appendChild(el('p', { class: 'meta', text: 'Khoảng ' + lesson.min + ' phút đọc' + (done ? ' · Đã hoàn thành' : '') }));
    art.appendChild(el('p', { class: 'hook', html: DE.inline(lesson.hook) }));

    var core = el('section', null, el('h2', { text: 'Cốt lõi' }));
    core.appendChild(DE.renderBlocks(lesson.core));
    art.appendChild(core);

    if (lesson.deep && lesson.deep.length) {
      var deep = el('details', { class: 'deep', open: DE.state.deep },
        el('summary', null, el('span', { class: 'deep-title', text: 'Đào sâu' }),
          el('span', { class: 'deep-sub', text: 'trade-off và bẫy thực tế, dành cho người đã đi làm' })));
      deep.appendChild(DE.renderBlocks(lesson.deep));
      art.appendChild(deep);
    }

    if (lesson.mistakes && lesson.mistakes.length) {
      art.appendChild(el('section', { class: 'mistakes' },
        el('h2', { text: 'Sai lầm thường gặp' }),
        el('ul', null, lesson.mistakes.map(function (m) { return el('li', { html: DE.inline(m) }); }))));
    }

    if (lesson.check && lesson.check.length) {
      var chk = el('section', null, el('h2', { text: 'Tự kiểm tra' }),
        el('p', { class: 'muted', text: 'Tự trả lời thành lời trước khi mở gợi ý.' }));
      lesson.check.forEach(function (c) {
        chk.appendChild(el('details', { class: 'check' },
          el('summary', { html: DE.inline(c[0]) }), el('p', { html: DE.inline(c[1]) })));
      });
      art.appendChild(chk);
    }

    var links = el('div', { class: 'links' });
    if (lesson.sim && DE.sims[lesson.sim]) {
      links.appendChild(el('a', { class: 'btn', href: '#/sim/' + lesson.sim, text: 'Thử mô phỏng: ' + DE.sims[lesson.sim].title }));
    }
    if (lesson.cards && lesson.cards.length) {
      links.appendChild(el('a', { class: 'btn', href: '#/cards/' + lesson.stage.id, text: 'Ôn ' + lesson.stage.lessons.reduce(function (n, l) { return n + (l.cards || []).length; }, 0) + ' thẻ của chặng này' }));
    }
    if (links.childNodes.length) art.appendChild(links);

    var doneBtn = el('button', {
      class: 'btn ' + (done ? '' : 'btn-primary'), type: 'button',
      text: done ? 'Bỏ đánh dấu hoàn thành' : 'Đánh dấu đã học xong',
      onclick: function () {
        if (DE.state.done[lesson.id]) delete DE.state.done[lesson.id]; else DE.state.done[lesson.id] = true;
        DE.save();
        DE.views.lesson((main.innerHTML = '', main), id);
        DE.refreshNav();
      }
    });
    art.appendChild(el('div', { class: 'lesson-end' }, doneBtn));

    art.appendChild(el('nav', { class: 'pager', 'aria-label': 'Bài trước và bài sau' },
      prev ? el('a', { href: '#/lesson/' + prev.id }, el('span', { class: 'pager-dir', text: 'Bài trước' }), el('span', { text: prev.title })) : el('span'),
      next ? el('a', { class: 'pager-next', href: '#/lesson/' + next.id }, el('span', { class: 'pager-dir', text: 'Bài tiếp' }), el('span', { text: next.title })) : el('span')));

    main.appendChild(art);
  };
})();
