/* Bài tập thiết kế hệ thống: đặt các khối lên canvas, nối lại, chấm theo luật của từng đề */
(function () {
  'use strict';
  var DE = window.DE, el = DE.el, S = DE.svg;
  var W = 1000, H = 440, NW = 150, NH = 44, COL = 165, X0 = 12, Y0 = 44, ROW = 56;

  function comp(id) { return DE.components.filter(function (c) { return c.id === id; })[0]; }
  function layerIndex(layer) { return DE.layers.map(function (l) { return l[0]; }).indexOf(layer); }
  function arr(x) { return Array.isArray(x) ? x : [x]; }

  /* Đối tượng đồ thị đưa cho các luật chấm điểm */
  function graph(d) {
    var adj = {};
    d.edges.forEach(function (e) { (adj[e[0]] = adj[e[0]] || []).push(e[1]); });
    function has(id) { return !!d.nodes[id]; }
    function path(from, to) {
      var targets = arr(to).filter(has), seen = {}, queue = [];
      arr(from).filter(has).forEach(function (f) { (adj[f] || []).forEach(function (n) { queue.push(n); }); });
      while (queue.length) {
        var n = queue.shift();
        if (seen[n]) continue;
        seen[n] = true;
        if (targets.indexOf(n) >= 0) return true;
        (adj[n] || []).forEach(function (m) { queue.push(m); });
      }
      return false;
    }
    return {
      has: has,
      any: function (ids) { return ids.some(has); },
      path: path,
      via: function (a, v, b) { return path(a, v) && path(v, b); }
    };
  }

  function grade(task, d) {
    var g = graph(d), mustTotal = 0, got = 0;
    var rows = task.rules.map(function (r) {
      var ok = !!r.ok(g);
      if (r.t === 'must') { mustTotal += r.w; if (ok) got += r.w; }
      if (r.t === 'avoid' && !ok) got -= r.w;
      return { t: r.t, ok: ok, text: ok ? r.pass : r.fail };
    });
    return { pct: Math.max(0, Math.min(100, Math.round((got / mustTotal) * 100))), rows: rows };
  }
  DE._designGrade = grade;

  /* Xếp các khối theo cột của tầng, dùng cho lời giải mẫu */
  function layout(sample) {
    var count = {}, nodes = {};
    sample.nodes.forEach(function (id) {
      var li = layerIndex(comp(id).layer);
      count[li] = count[li] || 0;
      nodes[id] = { x: X0 + li * COL, y: Y0 + count[li] * ROW };
      count[li]++;
    });
    return { nodes: nodes, edges: sample.edges.map(function (e) { return e.slice(); }) };
  }
  DE._designLayout = layout;

  function wrap(label) {
    var words = label.split(' '), lines = [''];
    words.forEach(function (w) {
      var cur = lines[lines.length - 1];
      if (cur && (cur + ' ' + w).length > 19 && lines.length < 2) lines.push(w);
      else lines[lines.length - 1] = cur ? cur + ' ' + w : w;
    });
    return lines;
  }

  /* ---------- Danh sách đề ---------- */
  function index(main) {
    main.appendChild(el('header', { class: 'page-head' },
      el('h1', { text: 'Thiết kế hệ thống' }),
      el('p', { class: 'lead', text: 'Mỗi đề là một yêu cầu thật. Bạn chọn thành phần, nối chúng lại, rồi được chấm theo tiêu chí: đáp ứng yêu cầu chưa, có thừa độ phức tạp không, có bỏ sót rủi ro nào không.' })));
    main.appendChild(el('div', { class: 'grid' }, DE.tasks.map(function (t) {
      var best = DE.state.scores[t.id];
      return el('a', { class: 'card', href: '#/design/' + t.id },
        el('span', { class: 'tag', text: 'Mức: ' + t.level + (best != null ? ' · Điểm cao nhất: ' + best + '%' : '') }),
        el('h2', { text: t.title }), el('p', { text: t.brief }));
    })));
  }

  /* ---------- Một đề ---------- */
  function taskView(main, task) {
    var st = DE.state;
    var d = st.designs[task.id] || { nodes: {}, edges: [] };
    var sel = null, drag = null, result = null;

    function persist() { st.designs[task.id] = d; DE.save(); }

    main.appendChild(el('header', { class: 'page-head' },
      el('p', { class: 'crumb' }, el('a', { href: '#/design', text: 'Thiết kế hệ thống' }), ' / Mức: ' + task.level),
      el('h1', { text: task.title })));
    main.appendChild(el('section', { class: 'brief' },
      el('p', { text: task.brief }),
      el('ul', null, task.needs.map(function (n) { return el('li', { text: n }); }))));

    var palette = el('div', { class: 'palette', 'aria-label': 'Các thành phần có thể dùng' });
    var svg = S('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'application', 'aria-label': 'Vùng vẽ kiến trúc', tabindex: '0' });
    var linkRow = el('div', { class: 'toolbar' });
    var resultBox = el('div', { class: 'result', 'aria-live': 'polite' });

    main.appendChild(el('p', { class: 'muted', style: 'margin-top:18px', text: 'Bấm một thành phần để đặt lên vùng vẽ. Kéo để di chuyển. Kéo từ chấm tròn bên phải một khối sang khối khác để nối. Các khối ở cột "Vận hành, quản trị" chỉ cần có mặt, không cần nối.' }));
    main.appendChild(palette);
    main.appendChild(el('div', { class: 'canvas-wrap' }, svg));
    main.appendChild(linkRow);
    main.appendChild(el('div', { class: 'toolbar' },
      el('button', { class: 'btn btn-primary', type: 'button', text: 'Chấm điểm', onclick: function () { doGrade(); } }),
      el('button', { class: 'btn', type: 'button', text: 'Xóa mục đang chọn', onclick: function () { removeSel(); } }),
      el('button', { class: 'btn btn-quiet', type: 'button', text: 'Xóa hết', onclick: function () { d = { nodes: {}, edges: [] }; sel = null; result = null; persist(); draw(); } })));
    main.appendChild(resultBox);

    function addNode(id) {
      if (d.nodes[id]) { sel = { node: id }; draw(); return; }
      var li = layerIndex(comp(id).layer);
      var used = Object.keys(d.nodes).filter(function (k) { return layerIndex(comp(k).layer) === li; }).length;
      d.nodes[id] = { x: X0 + li * COL, y: Math.min(H - NH - 4, Y0 + used * ROW) };
      sel = { node: id };
      persist(); draw();
    }
    function addEdge(a, b) {
      if (a === b || !d.nodes[a] || !d.nodes[b]) return;
      if (d.edges.some(function (e) { return e[0] === a && e[1] === b; })) return;
      d.edges.push([a, b]);
      persist();
    }
    function removeSel() {
      if (!sel) return;
      if (sel.node) {
        delete d.nodes[sel.node];
        d.edges = d.edges.filter(function (e) { return e[0] !== sel.node && e[1] !== sel.node; });
      } else if (sel.edge != null) d.edges.splice(sel.edge, 1);
      sel = null; persist(); draw();
    }
    function doGrade() {
      result = grade(task, d);
      if (st.scores[task.id] == null || result.pct > st.scores[task.id]) { st.scores[task.id] = result.pct; DE.save(); }
      draw();
      resultBox.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    function drawPalette() {
      palette.innerHTML = '';
      DE.layers.forEach(function (l) {
        palette.appendChild(el('div', { class: 'palette-row' },
          el('div', { class: 'palette-name', text: l[1] }),
          el('div', { class: 'palette-items' }, DE.components.filter(function (c) { return c.layer === l[0]; }).map(function (c) {
            return el('button', {
              type: 'button', class: 'chip' + (d.nodes[c.id] ? ' used' : ''), 'aria-pressed': d.nodes[c.id] ? 'true' : 'false', text: c.label,
              onclick: function () { addNode(c.id); }
            });
          }))));
      });
    }

    function drawSvg() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      svg.appendChild(S('defs', null, S('marker', { id: 'de-arrow', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' },
        S('path', { d: 'M0,0 L10,5 L0,10 z', class: 'fg-head' }))));
      DE.layers.forEach(function (l, i) {
        svg.appendChild(S('text', { x: X0 + i * COL + 2, y: 24, class: 'col-label', text: l[1].toUpperCase() }));
        if (i) svg.appendChild(S('line', { x1: X0 + i * COL - 8, y1: 10, x2: X0 + i * COL - 8, y2: H - 10, class: 'col-line' }));
      });
      if (!Object.keys(d.nodes).length) {
        svg.appendChild(S('text', { x: W / 2, y: H / 2, 'text-anchor': 'middle', class: 'col-label', text: 'Chưa có khối nào. Bấm một thành phần ở trên để bắt đầu.' }));
      }
      d.edges.forEach(function (e, i) {
        var a = d.nodes[e[0]], b = d.nodes[e[1]];
        if (!a || !b) return;
        var sx = a.x + NW, sy = a.y + NH / 2, tx = b.x, ty = b.y + NH / 2;
        var k = Math.max(30, Math.abs(tx - sx) / 2);
        var path = 'M' + sx + ',' + sy + ' C' + (sx + k) + ',' + sy + ' ' + (tx - k) + ',' + ty + ' ' + tx + ',' + ty;
        svg.appendChild(S('path', { d: path, class: 'de-edge' + (sel && sel.edge === i ? ' sel' : ''), 'marker-end': 'url(#de-arrow)' }));
        svg.appendChild(S('path', { d: path, class: 'de-edge-hit', 'data-edge': i }));
      });
      if (drag && drag.type === 'link') {
        var f = d.nodes[drag.from];
        svg.appendChild(S('line', { x1: f.x + NW, y1: f.y + NH / 2, x2: drag.x, y2: drag.y, class: 'de-edge fg-dash' }));
      }
      Object.keys(d.nodes).forEach(function (id) {
        var n = d.nodes[id], lines = wrap(comp(id).label);
        var g = S('g', { class: 'dn' + (sel && sel.node === id ? ' sel' : ''), transform: 'translate(' + n.x + ',' + n.y + ')', 'data-node': id },
          S('rect', { width: NW, height: NH, rx: 8 }));
        lines.forEach(function (ln, i) {
          g.appendChild(S('text', { x: NW / 2 - 4, y: NH / 2 + (i - (lines.length - 1) / 2) * 15, 'text-anchor': 'middle', 'dominant-baseline': 'central', text: ln }));
        });
        g.appendChild(S('circle', { cx: NW, cy: NH / 2, r: 6, class: 'port' }));
        g.appendChild(S('circle', { cx: NW, cy: NH / 2, r: 14, class: 'port-hit', 'data-port': id }));
        svg.appendChild(g);
      });
    }

    function drawLinkRow() {
      linkRow.innerHTML = '';
      if (!sel || !sel.node) return;
      var others = Object.keys(d.nodes).filter(function (k) { return k !== sel.node; });
      if (!others.length) return;
      var pick = el('select', { 'aria-label': 'Khối đích' }, others.map(function (k) { return el('option', { value: k, text: comp(k).label }); }));
      linkRow.appendChild(el('span', { class: 'muted', style: 'align-self:center;font-size:.9rem', text: 'Nối "' + comp(sel.node).label + '" tới' }));
      linkRow.appendChild(el('label', { class: 'ctl' }, pick));
      linkRow.appendChild(el('button', { class: 'btn', type: 'button', text: 'Nối', onclick: function () { addEdge(sel.node, pick.value); draw(); } }));
    }

    function drawResult() {
      resultBox.innerHTML = '';
      if (!result) return;
      var tone = result.pct >= 85 ? 'good' : result.pct >= 50 ? 'warn' : 'bad';
      resultBox.appendChild(el('h2', { text: 'Kết quả' }));
      resultBox.appendChild(el('p', { class: 'score stat-' + tone }, el('span', { class: 'stat-value', style: 'font-size:inherit', text: result.pct + '%' })));
      resultBox.appendChild(el('ul', { class: 'rules' }, result.rows.map(function (r) {
        var cls = r.t === 'bonus' ? (r.ok ? 'pass' : 'note') : (r.ok ? 'pass' : 'fail');
        var mark = r.ok ? '✓' : r.t === 'bonus' ? '+' : '✗';
        var kind = r.t === 'must' ? 'Cần có' : r.t === 'avoid' ? 'Nên tránh' : 'Điểm cộng';
        return el('li', { class: cls }, el('span', { class: 'mark', 'aria-hidden': 'true', text: mark }),
          el('span', null, el('strong', { text: kind + (r.ok ? ', đạt: ' : r.t === 'bonus' ? ', gợi ý: ' : ', chưa đạt: ') }), r.text));
      })));
      resultBox.appendChild(el('div', { class: 'sample' },
        el('h3', { style: 'margin-top:0', text: 'Lời giải mẫu và lý do' }),
        el('p', { html: DE.inline(task.notes) }),
        el('button', {
          class: 'btn', type: 'button', text: 'Thay bản vẽ bằng lời giải mẫu',
          onclick: function () { d = layout(task.sample); sel = null; persist(); result = grade(task, d); draw(); }
        })));
    }

    function draw() { drawPalette(); drawSvg(); drawLinkRow(); drawResult(); }

    /* ---------- Thao tác chuột và cảm ứng ---------- */
    function pt(e) {
      var p = svg.createSVGPoint();
      p.x = e.clientX; p.y = e.clientY;
      return p.matrixTransform(svg.getScreenCTM().inverse());
    }
    function nodeAt(p) {
      var hit = null;
      Object.keys(d.nodes).forEach(function (id) {
        var n = d.nodes[id];
        if (p.x >= n.x && p.x <= n.x + NW && p.y >= n.y && p.y <= n.y + NH) hit = id;
      });
      return hit;
    }
    function closest(target, attr) {
      while (target && target !== svg) {
        if (target.getAttribute && target.getAttribute(attr) != null) return target.getAttribute(attr);
        target = target.parentNode;
      }
      return null;
    }
    svg.addEventListener('pointerdown', function (e) {
      var p = pt(e);
      var port = closest(e.target, 'data-port'), node = closest(e.target, 'data-node'), edge = closest(e.target, 'data-edge');
      if (port) drag = { type: 'link', from: port, x: p.x, y: p.y };
      else if (node) { drag = { type: 'move', id: node, dx: p.x - d.nodes[node].x, dy: p.y - d.nodes[node].y }; sel = { node: node }; }
      else if (edge != null) sel = { edge: +edge };
      else sel = null;
      if (drag) { try { svg.setPointerCapture(e.pointerId); } catch (err) { /* bỏ qua */ } e.preventDefault(); }
      draw();
    });
    svg.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var p = pt(e);
      if (drag.type === 'move') {
        var n = d.nodes[drag.id];
        n.x = Math.round(Math.max(2, Math.min(W - NW - 8, p.x - drag.dx)));
        n.y = Math.round(Math.max(30, Math.min(H - NH - 2, p.y - drag.dy)));
      } else { drag.x = p.x; drag.y = p.y; }
      drawSvg();
    });
    function end(e) {
      if (!drag) return;
      if (drag.type === 'link') {
        var target = nodeAt(pt(e));
        if (target) addEdge(drag.from, target);
      }
      drag = null;
      persist(); draw();
    }
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', function () { drag = null; draw(); });
    svg.addEventListener('keydown', function (e) {
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); removeSel(); }
    });

    draw();
  }

  DE.views.design = function (main, id) {
    var task = DE.tasks.filter(function (t) { return t.id === id; })[0];
    if (task) taskView(main, task); else index(main);
  };
})();
