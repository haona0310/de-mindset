/* Router theo hash, thanh điều hướng, trang lộ trình, danh sách mô phỏng, tìm kiếm */
(function () {
  'use strict';
  var DE = window.DE, el = DE.el;

  var NAV = [
    ['#/', 'Lộ trình', ['home', 'lesson']],
    ['#/sims', 'Mô phỏng', ['sims', 'sim']],
    ['#/cards', 'Flashcard', ['cards']],
    ['#/design', 'Thiết kế hệ thống', ['design']]
  ];
  var current = 'home';

  DE.progress = function () {
    var all = DE.allLessons();
    var done = all.filter(function (l) { return DE.state.done[l.id]; }).length;
    return { done: done, total: all.length, pct: all.length ? Math.round((done / all.length) * 100) : 0 };
  };

  function effectiveTheme() {
    if (DE.state.theme) return DE.state.theme;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function applyTheme() {
    if (DE.state.theme) document.documentElement.setAttribute('data-theme', DE.state.theme);
    else document.documentElement.removeAttribute('data-theme');
  }

  function renderNav() {
    var nav = document.getElementById('nav');
    nav.innerHTML = '';
    var p = DE.progress();

    nav.appendChild(el('a', { class: 'brand', href: '#/' },
      el('span', { class: 'brand-mark', 'aria-hidden': 'true', text: 'DE' }),
      el('span', null, el('span', { class: 'brand-name', text: 'Tư duy Data Engineer' }),
        el('span', { class: 'brand-sub', text: 'thời big data, từ A đến Z' }))));

    nav.appendChild(el('ul', { class: 'nav-list' }, NAV.map(function (n) {
      var active = n[2].indexOf(current) >= 0;
      return el('li', null, el('a', { href: n[0], class: active ? 'active' : '', 'aria-current': active ? 'page' : null, text: n[1] }));
    })));

    var q = el('input', { type: 'search', placeholder: 'Tìm thuật ngữ, ví dụ: idempotent', 'aria-label': 'Tìm trong bài học và thẻ' });
    nav.appendChild(el('form', {
      class: 'search', role: 'search',
      onsubmit: function (e) {
        e.preventDefault();
        if (q.value.trim()) location.hash = '#/search/' + encodeURIComponent(q.value.trim());
      }
    }, q));

    nav.appendChild(el('div', { class: 'side-box' },
      el('div', { class: 'side-label', text: 'Tiến độ: ' + p.done + '/' + p.total + ' bài' }),
      el('div', { class: 'meter', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': p.pct },
        el('div', { class: 'meter-fill', style: 'width:' + p.pct + '%' }))));

    function seg(label, value) {
      return el('button', {
        type: 'button', class: DE.state.deep === value ? 'on' : '', 'aria-pressed': DE.state.deep === value ? 'true' : 'false', text: label,
        onclick: function () { DE.state.deep = value; DE.save(); route(); }
      });
    }
    nav.appendChild(el('div', { class: 'side-box' },
      el('div', { class: 'side-label', text: 'Độ sâu bài học' }),
      el('div', { class: 'seg' }, seg('Cốt lõi', false), seg('Đào sâu', true))));

    nav.appendChild(el('button', {
      type: 'button', class: 'btn btn-quiet theme-btn',
      text: effectiveTheme() === 'dark' ? 'Chuyển nền sáng' : 'Chuyển nền tối',
      onclick: function () { DE.state.theme = effectiveTheme() === 'dark' ? 'light' : 'dark'; DE.save(); applyTheme(); renderNav(); }
    }));
  }
  DE.refreshNav = renderNav;

  /* ---------- Trang lộ trình ---------- */
  DE.views.home = function (main) {
    var p = DE.progress();
    var all = DE.allLessons();
    var nextUp = all.filter(function (l) { return !DE.state.done[l.id]; })[0];

    main.appendChild(el('header', { class: 'hero' },
      el('p', { class: 'eyebrow', text: 'Khóa tự học · ' + all.length + ' bài · ' + DE.simOrder.length + ' mô phỏng · ' + DE.allCards().length + ' thẻ ôn' }),
      el('h1', { text: 'Học cách nghĩ như một Data Engineer' }),
      el('p', { class: 'lead', text: 'Công cụ thay đổi vài năm một lần. Cách đặt câu hỏi về dữ liệu, độ trễ, chi phí và độ tin cậy thì dùng được cả đời làm nghề. Khóa này dạy phần thứ hai.' }),
      el('div', { class: 'hero-actions' },
        nextUp
          ? el('a', { class: 'btn btn-primary', href: '#/lesson/' + nextUp.id, text: (p.done ? 'Học tiếp: ' : 'Bắt đầu: ') + nextUp.title })
          : el('a', { class: 'btn btn-primary', href: '#/design', text: 'Đã học hết. Sang bài tập thiết kế' }),
        el('a', { class: 'btn', href: '#/sims', text: 'Xem các mô phỏng' }))));

    var list = el('ol', { class: 'stages' });
    DE.stages.forEach(function (s) {
      var doneCount = s.lessons.filter(function (l) { return DE.state.done[l.id]; }).length;
      list.appendChild(el('li', { class: 'stage' },
        el('div', { class: 'stage-head' },
          el('span', { class: 'stage-n', text: s.n }),
          el('div', null,
            el('h2', { text: s.title }),
            el('p', { class: 'stage-goal', html: DE.inline(s.goal) })),
          el('span', { class: 'stage-count', text: doneCount + '/' + s.lessons.length })),
        el('ul', { class: 'lesson-list' }, s.lessons.map(function (l) {
          var d = !!DE.state.done[l.id];
          return el('li', null, el('a', { href: '#/lesson/' + l.id, class: d ? 'done' : '' },
            el('span', { class: 'tick', 'aria-hidden': 'true', text: d ? '✓' : '' }),
            el('span', { class: 'lesson-title', text: l.title }),
            el('span', { class: 'lesson-min', text: l.min + ' phút' }),
            d ? el('span', { class: 'sr', text: ' (đã học)' }) : null));
        }))));
    });
    main.appendChild(list);
  };

  /* ---------- Mô phỏng ---------- */
  DE.views.sims = function (main) {
    main.appendChild(el('header', { class: 'page-head' },
      el('h1', { text: 'Mô phỏng' }),
      el('p', { class: 'lead', text: 'Kéo thanh trượt và xem hệ thống phản ứng. Mỗi mô phỏng là một mô hình đơn giản hóa, đủ để hình thành trực giác trước khi gặp hệ thống thật.' })));
    main.appendChild(el('div', { class: 'grid' }, DE.simOrder.map(function (id) {
      var s = DE.sims[id];
      return el('a', { class: 'card', href: '#/sim/' + id },
        el('h2', { text: s.title }), el('p', { text: s.desc }));
    })));
  };

  DE.views.sim = function (main, id) {
    var s = DE.sims[id];
    if (!s) { location.hash = '#/sims'; return; }
    main.appendChild(el('header', { class: 'page-head' },
      el('p', { class: 'crumb' }, el('a', { href: '#/sims', text: 'Mô phỏng' })),
      el('h1', { text: s.title }),
      el('p', { class: 'lead', text: s.desc })));
    var root = el('div', { class: 'sim' });
    main.appendChild(root);
    s.mount(root);
    if (s.takeaways) {
      main.appendChild(el('section', { class: 'takeaways' },
        el('h2', { text: 'Điều cần rút ra' }),
        el('ul', null, s.takeaways.map(function (t) { return el('li', { html: DE.inline(t) }); }))));
    }
    var rel = (s.lessons || []).map(DE.findLesson).filter(Boolean);
    if (rel.length) {
      main.appendChild(el('p', { class: 'links' }, rel.map(function (l) {
        return el('a', { class: 'btn', href: '#/lesson/' + l.id, text: 'Bài: ' + l.title });
      })));
    }
  };

  /* ---------- Tìm kiếm ---------- */
  function blockText(blocks) {
    return (blocks || []).map(function (b) {
      if (typeof b === 'string') return b;
      if (b.ul) return b.ul.join(' ');
      if (b.table) return b.table.map(function (r) { return r.join(' '); }).join(' ');
      if (b.flow) return b.flow.join(' ');
      return b.h || b.tip || b.warn || b.code || '';
    }).join(' ');
  }
  function snippet(text, q) {
    var plain = text.replace(/\*\*|\[\[|\]\]/g, '');
    var i = DE.fold(plain).indexOf(q);
    if (i < 0) return '';
    var a = Math.max(0, i - 60), b = Math.min(plain.length, i + q.length + 90);
    return (a ? '…' : '') + plain.slice(a, b) + (b < plain.length ? '…' : '');
  }
  DE.views.search = function (main, query) {
    var q = DE.fold(query || '');
    main.appendChild(el('header', { class: 'page-head' },
      el('h1', { text: 'Kết quả cho "' + query + '"' })));
    var hits = [];
    DE.allLessons().forEach(function (l) {
      var text = [l.title, l.hook, blockText(l.core), blockText(l.deep), (l.mistakes || []).join(' ')].join(' ');
      if (DE.fold(text).indexOf(q) >= 0) {
        hits.push(el('li', null, el('a', { href: '#/lesson/' + l.id },
          el('span', { class: 'hit-kind', text: 'Bài học · Chặng ' + l.stage.n }),
          el('span', { class: 'hit-title', text: l.title }),
          el('span', { class: 'hit-text', text: snippet(text, q) }))));
      }
    });
    DE.allCards().forEach(function (c) {
      if (DE.fold(c.q + ' ' + c.a).indexOf(q) >= 0) {
        hits.push(el('li', null, el('a', { href: '#/lesson/' + c.lesson.id },
          el('span', { class: 'hit-kind', text: 'Thẻ ôn · ' + c.lesson.title }),
          el('span', { class: 'hit-title', text: c.q }),
          el('span', { class: 'hit-text', text: c.a }))));
      }
    });
    main.appendChild(hits.length
      ? el('ul', { class: 'hits' }, hits)
      : el('p', { class: 'empty', text: 'Không thấy kết quả. Thử từ ngắn hơn hoặc thuật ngữ tiếng Anh (ví dụ: partition, CDC, lakehouse).' }));
  };

  /* ---------- Router ---------- */
  function route() {
    var h = location.hash.replace(/^#\/?/, '');
    var parts = h.split('/');
    var name = parts[0] || 'home';
    var arg = '';
    try { arg = decodeURIComponent(parts.slice(1).join('/')); } catch (e) { arg = parts.slice(1).join('/'); }
    if (!DE.views[name]) name = 'home';
    if (DE.cleanup) { DE.cleanup(); DE.cleanup = null; }
    current = name;
    var main = document.getElementById('main');
    main.innerHTML = '';
    main.className = 'view-' + name;
    DE.views[name](main, arg);
    renderNav();
  }

  window.addEventListener('hashchange', function () { route(); window.scrollTo(0, 0); });
  applyTheme();
  route();
})();
