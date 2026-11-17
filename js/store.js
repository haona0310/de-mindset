/* Lõi dùng chung: namespace DE, lưu trạng thái, helper DOM và định dạng số.
   Không dùng ES module để app chạy được khi mở thẳng bằng file:// */
(function () {
  'use strict';

  var DE = (window.DE = { stages: [], sims: {}, simOrder: [], tasks: [], views: {}, ui: {}, fmt: {} });

  /* ---------- Đăng ký nội dung ---------- */
  DE.addStage = function (s) { DE.stages.push(s); };
  DE.addSim = function (id, def) { def.id = id; DE.sims[id] = def; DE.simOrder.push(id); };
  DE.addTask = function (t) { DE.tasks.push(t); };

  DE.allLessons = function () {
    var out = [];
    DE.stages.forEach(function (s) {
      s.lessons.forEach(function (l) { l.stage = s; out.push(l); });
    });
    return out;
  };
  DE.findLesson = function (id) {
    return DE.allLessons().filter(function (l) { return l.id === id; })[0] || null;
  };
  DE.allCards = function () {
    var out = [];
    DE.allLessons().forEach(function (l) {
      (l.cards || []).forEach(function (c, i) {
        out.push({ id: l.id + '#' + i, q: c[0], a: c[1], lesson: l });
      });
    });
    return out;
  };

  /* ---------- Trạng thái (localStorage) ---------- */
  var KEY = 'de-mindset-v1';
  var state = { done: {}, deep: false, cards: {}, designs: {}, scores: {}, theme: '', newDay: 0, newCount: 0 };
  try {
    var raw = window.localStorage.getItem(KEY);
    if (raw) {
      var saved = JSON.parse(raw);
      for (var k in saved) if (Object.prototype.hasOwnProperty.call(saved, k)) state[k] = saved[k];
    }
  } catch (e) { /* không có storage: app vẫn chạy, chỉ không lưu tiến độ */ }
  DE.state = state;
  DE.save = function () {
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* bỏ qua */ }
  };

  /* Số thứ tự ngày theo giờ địa phương, dùng cho lịch ôn flashcard */
  DE.today = function () {
    var d = new Date();
    return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000);
  };

  /* ---------- Helper DOM ---------- */
  function append(parent, child) {
    if (child == null || child === false) return;
    if (Array.isArray(child)) { child.forEach(function (c) { append(parent, c); }); return; }
    parent.appendChild(typeof child === 'object' ? child : document.createTextNode(String(child)));
  }
  function make(ns) {
    return function (tag, attrs) {
      var e = ns ? document.createElementNS(ns, tag) : document.createElement(tag);
      if (attrs) {
        for (var k in attrs) {
          var v = attrs[k];
          if (v == null || v === false) continue;
          if (k === 'class') e.setAttribute('class', v);
          else if (k === 'html') e.innerHTML = v;
          else if (k === 'text') e.textContent = v;
          else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
          else e.setAttribute(k, v === true ? '' : v);
        }
      }
      for (var i = 2; i < arguments.length; i++) append(e, arguments[i]);
      return e;
    };
  }
  DE.el = make(null);
  DE.svg = make('http://www.w3.org/2000/svg');

  DE.esc = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  /* Cú pháp nhỏ trong nội dung: **đậm** và [[code]] */
  DE.inline = function (s) {
    return DE.esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[\[(.+?)\]\]/g, '<code>$1</code>');
  };
  /* Bỏ dấu tiếng Việt để tìm kiếm không phân biệt dấu */
  DE.fold = function (s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  };

  /* ---------- Định dạng số ---------- */
  DE.fmt.num = function (n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };
  DE.fmt.short = function (n) {
    if (n >= 1e9) return trim(n / 1e9) + ' tỷ';
    if (n >= 1e6) return trim(n / 1e6) + ' triệu';
    if (n >= 1e3) return trim(n / 1e3) + ' nghìn';
    return String(Math.round(n));
  };
  DE.fmt.bytes = function (b) {
    var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    var i = 0;
    while (b >= 1000 && i < units.length - 1) { b /= 1000; i++; }
    return trim(b) + ' ' + units[i];
  };
  DE.fmt.money = function (n) {
    if (n >= 100) return '$' + DE.fmt.num(n);
    return '$' + n.toFixed(2).replace('.', ',');
  };
  DE.fmt.time = function (sec) {
    if (sec < 1) return Math.max(1, Math.round(sec * 1000)) + ' ms';
    if (sec < 90) return trim(sec) + ' giây';
    if (sec < 5400) return trim(sec / 60) + ' phút';
    if (sec < 172800) return trim(sec / 3600) + ' giờ';
    return trim(sec / 86400) + ' ngày';
  };
  function trim(x) {
    var s = x >= 100 ? x.toFixed(0) : x >= 10 ? x.toFixed(1) : x.toFixed(2);
    return s.replace(/\.?0+$/, '').replace('.', ',');
  }

  /* ---------- Thành phần giao diện cho mô phỏng ---------- */
  var el = DE.el;
  DE.ui.slider = function (o) {
    var fmt = o.fmt || function (v) { return v; };
    var out = el('output', { text: fmt(o.value) });
    var input = el('input', {
      type: 'range', min: o.min, max: o.max, step: o.step || 1, value: o.value,
      oninput: function () { out.textContent = fmt(+input.value); o.oninput(+input.value); }
    });
    return el('label', { class: 'ctl' },
      el('span', { class: 'ctl-top' }, el('span', { text: o.label }), out), input);
  };
  DE.ui.select = function (o) {
    var sel = el('select', { onchange: function () { o.onchange(sel.value); } },
      o.options.map(function (op) {
        return el('option', { value: op[0], text: op[1], selected: op[0] === o.value });
      }));
    return el('label', { class: 'ctl' }, el('span', { class: 'ctl-top' }, el('span', { text: o.label })), sel);
  };
  DE.ui.check = function (o) {
    var box = el('input', { type: 'checkbox', checked: !!o.value, onchange: function () { o.onchange(box.checked); } });
    return el('label', { class: 'ctl ctl-check' }, box, el('span', { text: o.label }));
  };
  DE.ui.stat = function (label, value, tone, note) {
    return el('div', { class: 'stat' + (tone ? ' stat-' + tone : '') },
      el('div', { class: 'stat-label', text: label }),
      el('div', { class: 'stat-value', text: value }),
      note ? el('div', { class: 'stat-note', text: note }) : null);
  };
  /* Thanh ngang so sánh: rows = [{label, value, text, tone}] */
  DE.ui.hbars = function (rows) {
    var max = Math.max.apply(null, rows.map(function (r) { return r.value; })) || 1;
    return el('div', { class: 'hbars' }, rows.map(function (r) {
      var pct = Math.max(0.6, (r.value / max) * 100);
      return el('div', { class: 'hbar-row' },
        el('div', { class: 'hbar-label', text: r.label }),
        el('div', { class: 'hbar-track' },
          el('div', { class: 'hbar-fill' + (r.tone ? ' tone-' + r.tone : ''), style: 'width:' + pct + '%' })),
        el('div', { class: 'hbar-text', text: r.text }));
    }));
  };
})();
