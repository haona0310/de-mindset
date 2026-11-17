/* Hình minh họa vẽ bằng SVG. Mỗi hình có khung rộng 640, màu lấy từ biến CSS nên tự đổi theo nền sáng/tối.
   Dùng trong bài học bằng khối { fig: 'ten-hinh', cap: 'chú thích' }. */
(function () {
  'use strict';
  var DE = window.DE, S = DE.svg, el = DE.el;
  var counter = 0;
  DE.figs = {};
  function fig(id, h, draw) { DE.figs[id] = { h: h, draw: draw }; }

  /* ---------- Bộ vẽ ---------- */
  function G(svg, n) { this.s = svg; this.n = n; }
  G.prototype.text = function (x, y, str, o) {
    o = o || {};
    var lines = String(str).split('\n'), lh = o.lh || 16;
    var t = S('text', {
      x: x, y: y - ((lines.length - 1) * lh) / 2, 'text-anchor': o.anchor || 'middle',
      'dominant-baseline': 'central', class: 'fg-t' + (o.cls ? ' ' + o.cls : '')
    });
    lines.forEach(function (l, i) { t.appendChild(S('tspan', { x: x, dy: i ? lh : 0, text: l })); });
    this.s.appendChild(t);
    return this;
  };
  G.prototype.box = function (x, y, w, h, label, tone, o) {
    o = o || {};
    this.s.appendChild(S('rect', {
      x: x, y: y, width: w, height: h, rx: o.rx == null ? 8 : o.rx,
      class: 'fg-b' + (tone ? ' fg-' + tone : '') + (o.dash ? ' fg-dash' : '')
    }));
    if (label != null && label !== '') this.text(x + w / 2, y + h / 2, label, { cls: o.cls });
    return this;
  };
  G.prototype.cell = function (x, y, w, h, label, tone, cls) {
    return this.box(x, y, w, h, label, tone, { rx: 2, cls: cls || 'small' });
  };
  G.prototype.arrow = function (x1, y1, x2, y2, o) {
    o = o || {};
    this.s.appendChild(S('line', {
      x1: x1, y1: y1, x2: x2, y2: y2,
      class: 'fg-l' + (o.tone ? ' ' + o.tone : '') + (o.dash ? ' fg-dash' : ''),
      'marker-end': o.plain ? null : 'url(#fg' + (o.tone === 'w' ? 'w' : 'a') + this.n + ')'
    }));
    if (o.label) this.text((x1 + x2) / 2, (y1 + y2) / 2 - 10, o.label, { cls: 'small' });
    return this;
  };
  G.prototype.line = function (x1, y1, x2, y2, o) {
    o = o || {}; o.plain = true;
    return this.arrow(x1, y1, x2, y2, o);
  };
  G.prototype.dot = function (x, y, r, tone) {
    this.s.appendChild(S('circle', { cx: x, cy: y, r: r, class: 'fg-dot-' + (tone || 'm') }));
    return this;
  };
  G.prototype.cyl = function (x, y, w, h, label, tone) {
    var ry = 9, cls = 'fg-b' + (tone ? ' fg-' + tone : '');
    this.s.appendChild(S('path', {
      d: 'M' + x + ',' + (y + ry) + ' V' + (y + h - ry) + ' A' + w / 2 + ',' + ry + ' 0 0 0 ' + (x + w) + ',' + (y + h - ry) + ' V' + (y + ry),
      class: cls
    }));
    this.s.appendChild(S('ellipse', { cx: x + w / 2, cy: y + ry, rx: w / 2, ry: ry, class: cls }));
    this.text(x + w / 2, y + h / 2 + 6, label);
    return this;
  };
  /* Bảng nhỏ: rows là mảng các dòng, tones(r, c) trả về tông màu của ô */
  G.prototype.grid = function (x, y, cw, ch, rows, tones, cls) {
    var self = this;
    rows.forEach(function (row, r) {
      row.forEach(function (v, c) {
        self.cell(x + c * cw, y + r * ch, cw, ch, v, tones ? tones(r, c) : (r === 0 ? 'm' : ''), cls);
      });
    });
    return this;
  };

  DE.renderFig = function (id, cap) {
    var f = DE.figs[id];
    if (!f) return null;
    counter++;
    var svg = S('svg', { viewBox: '0 0 640 ' + f.h, role: 'img', 'aria-label': (cap || '').replace(/\*\*|\[\[|\]\]/g, '') });
    function marker(kind) {
      return S('marker', { id: 'fg' + kind + counter, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' },
        S('path', { d: 'M0,0 L10,5 L0,10 z', class: 'fg-head' + (kind === 'w' ? ' w' : '') }));
    }
    svg.appendChild(S('defs', null, marker('a'), marker('w')));
    f.draw(new G(svg, counter));
    return el('figure', { class: 'figure' }, svg, cap ? el('figcaption', { html: DE.inline(cap) }) : null);
  };

  /* ================= Chặng 0 ================= */
  fig('de-role', 220, function (g) {
    g.text(85, 14, 'Nơi sinh dữ liệu', { cls: 'small' }).text(555, 14, 'Người dùng dữ liệu', { cls: 'small' });
    ['Ứng dụng', 'CSDL giao dịch', 'Sự kiện, log'].forEach(function (t, i) {
      g.box(20, 30 + i * 60, 130, 40, t).arrow(150, 50 + i * 60, 233, 110);
    });
    g.box(235, 55, 170, 110, 'Data Engineer\nthu nạp · lưu trữ\nbiến đổi · phục vụ', 'a');
    ['Phân tích, BI', 'Machine learning', 'Sản phẩm, vận hành'].forEach(function (t, i) {
      g.box(490, 30 + i * 60, 130, 40, t).arrow(405, 110, 488, 50 + i * 60);
    });
  });

  fig('lifecycle', 225, function (g) {
    ['Sinh ra\n(Generation)', 'Thu nạp\n(Ingestion)', 'Biến đổi\n(Transformation)', 'Phục vụ\n(Serving)'].forEach(function (t, i) {
      g.box(20 + i * 155, 14, 140, 52, t);
      if (i) g.arrow(5 + i * 155, 40, 18 + i * 155, 40);
    });
    g.box(175, 78, 450, 34, 'Lưu trữ (Storage): nền của mọi giai đoạn', 'a');
    g.text(320, 138, '6 dòng chảy ngầm chạy xuyên suốt', { cls: 'small' });
    ['Bảo mật', 'Quản trị\ndữ liệu', 'DataOps', 'Kiến trúc', 'Điều phối', 'Kỹ nghệ\nphần mềm'].forEach(function (t, i) {
      g.box(20 + i * 101, 156, 95, 48, t, 'm');
    });
  });

  /* ================= Chặng 1 ================= */
  fig('oltp-olap', 222, function (g) {
    g.text(160, 16, 'OLTP: rất nhiều thao tác nhỏ', { cls: 'title' });
    [70, 115, 160, 205, 250].forEach(function (x) { g.arrow(x, 40, 130 + (x - 70) / 3, 112); });
    g.cyl(110, 116, 100, 66, 'CSDL\ngiao dịch');
    g.text(160, 205, 'mỗi thao tác chạm vài dòng', { cls: 'small' });
    g.line(320, 10, 320, 212, { dash: true });
    g.text(480, 16, 'OLAP: ít truy vấn, quét rất nhiều', { cls: 'title' });
    for (var r = 0; r < 7; r++) for (var c = 0; c < 8; c++) {
      g.cell(380 + c * 25, 44 + r * 19, 25, 19, '', c === 2 || c === 5 ? 'a' : '');
    }
    g.text(480, 205, 'một truy vấn quét hàng triệu dòng', { cls: 'small' });
  });

  fig('row-col', 226, function (g) {
    var rows = [['id', 'tên', 'tiền', 'ngày'], ['1', 'An', '120', '01/3'], ['2', 'Bình', '80', '01/3'], ['3', 'Chi', '310', '02/3']];
    g.text(150, 16, 'Lưu theo dòng', { cls: 'title' });
    g.grid(40, 40, 55, 28, rows, function (r) { return r === 0 ? 'm' : 'w'; });
    g.text(150, 176, 'Cần mỗi cột "tiền" vẫn phải\nđọc toàn bộ từng dòng', { cls: 'small' });
    g.text(490, 16, 'Lưu theo cột', { cls: 'title' });
    g.grid(380, 40, 55, 28, rows, function (r, c) { return r === 0 ? 'm' : c === 2 ? 'a' : ''; });
    g.text(490, 176, 'Chỉ đọc đúng cột "tiền",\nbỏ qua ba cột còn lại', { cls: 'small' });
    g.line(320, 10, 320, 216, { dash: true });
  });

  fig('scale', 212, function (g) {
    g.text(150, 16, 'Scale up: đổi sang máy to hơn', { cls: 'title' });
    g.box(30, 120, 40, 40, '').arrow(76, 140, 96, 140).box(100, 95, 60, 65, '').arrow(166, 128, 186, 128).box(190, 55, 95, 105, '', 'w');
    g.text(150, 186, 'có trần, càng to càng đắt', { cls: 'small' });
    g.line(320, 10, 320, 202, { dash: true });
    g.text(480, 16, 'Scale out: thêm nhiều máy thường', { cls: 'title' });
    for (var r = 0; r < 2; r++) for (var c = 0; c < 4; c++) g.box(370 + c * 58, 55 + r * 56, 44, 44, '', 'a');
    g.text(480, 186, 'gần như không trần,\nđổi lại là độ phức tạp phân tán', { cls: 'small' });
  });

  fig('temperature', 196, function (g) {
    g.box(20, 24, 190, 84, 'Nóng\ntruy cập liên tục\nSSD, bộ nhớ', 'w');
    g.box(225, 24, 190, 84, 'Ấm\nvài lần mỗi tuần\nobject storage chuẩn', '');
    g.box(430, 24, 190, 84, 'Lạnh\nhiếm khi đọc lại\nlưu trữ archive', 'a');
    g.arrow(30, 140, 610, 140, { label: 'càng sang phải: mỗi GB càng rẻ' });
    g.arrow(610, 176, 30, 176, { label: 'càng sang trái: đọc càng nhanh' });
  });

  /* ================= Chặng 2 ================= */
  fig('partition-replica', 222, function (g) {
    g.box(210, 8, 220, 36, 'Bảng đơn hàng: 1 tỷ dòng', 'm');
    var copies = ['P3', 'P1', 'P2'];
    [0, 1, 2].forEach(function (i) {
      var x = 20 + i * 210;
      g.arrow(320, 44, x + 90, 82);
      g.box(x, 84, 180, 126, '').text(x + 90, 100, 'Node ' + (i + 1), { cls: 'small' });
      g.box(x + 14, 114, 152, 38, 'Partition P' + (i + 1), 'a');
      g.box(x + 14, 160, 152, 38, 'bản sao của ' + copies[i], 'm', { dash: true });
    });
  });

  fig('shuffle', 244, function (g) {
    var left = [['a', 'w', 'a', 'g', 'a', 'w'], ['a', 'a', 'g', 'w', 'a', 'g'], ['w', 'a', 'a', 'g', 'a', 'w']];
    var right = [['a', 9], ['w', 5], ['g', 4]];
    g.text(105, 12, 'Trước: mỗi node giữ lẫn lộn các key', { cls: 'small' });
    g.text(535, 12, 'Sau: cùng key về cùng node', { cls: 'small' });
    g.text(320, 232, 'shuffle: dữ liệu phải đi qua mạng', { cls: 'small' });
    left.forEach(function (dots, i) {
      var y = 26 + i * 68;
      g.box(30, y, 150, 54, '');
      dots.forEach(function (t, k) { g.dot(52 + k * 21, y + 27, 7, t); });
      right.forEach(function (_, j) { g.arrow(180, y + 27, 458, 53 + j * 68); });
    });
    right.forEach(function (r, j) {
      var y = 26 + j * 68;
      g.box(460, y, 150, 54, '', j === 0 ? 'w' : '');
      for (var k = 0; k < r[1]; k++) g.dot(476 + (k % 7) * 19, y + (r[1] > 7 ? 17 : 27) + Math.floor(k / 7) * 20, 7, r[0]);
    });
  });

  fig('cap', 204, function (g) {
    g.box(100, 66, 140, 60, 'Node A\nsố dư = 50 (mới)', 'a');
    g.box(400, 66, 140, 60, 'Node B\nsố dư = 100 (cũ)');
    g.line(240, 96, 300, 96, { tone: 'w', dash: true }).line(340, 96, 400, 96, { tone: 'w', dash: true });
    g.line(310, 84, 330, 108, { tone: 'w' }).line(330, 84, 310, 108, { tone: 'w' });
    g.text(320, 66, 'mạng đứt', { cls: 'small' });
    g.text(470, 14, 'Khách hỏi: số dư bao nhiêu?', { cls: 'small' }).arrow(470, 26, 470, 64);
    g.text(320, 156, 'Chọn nhất quán (C): từ chối trả lời cho tới khi mạng nối lại');
    g.text(320, 182, 'Chọn sẵn sàng (A): trả lời 100, chấp nhận có thể sai');
  });

  /* ================= Chặng 3 ================= */
  fig('snapshot-vs-log', 212, function (g) {
    g.text(150, 16, 'Snapshot: ảnh chụp trạng thái', { cls: 'title' });
    g.grid(50, 60, 100, 30, [['ma_don', 'trang_thai'], ['17', 'đã giao']]);
    g.text(150, 160, 'chỉ thấy kết quả cuối,\nmất các bước ở giữa', { cls: 'small' });
    g.line(320, 10, 320, 202, { dash: true });
    g.text(480, 16, 'Log thay đổi (CDC): mọi bước', { cls: 'title' });
    ['09:00  tạo đơn 17', '09:05  đã thanh toán', '14:20  đã giao'].forEach(function (t, i) {
      g.box(370, 38 + i * 42, 220, 30, t, i === 2 ? 'a' : '', { cls: 'mono' });
      if (i) g.arrow(480, 26 + i * 42, 480, 37 + i * 42);
    });
    g.text(480, 178, 'dựng lại được trạng thái ở bất kỳ thời điểm nào', { cls: 'small' });
  });

  fig('batch-stream', 214, function (g) {
    var xs = [60, 95, 140, 170, 230, 290, 345, 380, 430, 500, 545, 590];
    g.text(30, 14, 'Batch: gom lại, xử lý theo lô', { cls: 'title', anchor: 'start' });
    g.box(40, 32, 270, 30, '', 'm', { dash: true }).box(325, 32, 285, 30, '', 'm', { dash: true });
    xs.forEach(function (x) { g.dot(x, 47, 5, 'a'); });
    g.arrow(175, 62, 175, 80).arrow(467, 62, 467, 80);
    g.text(175, 92, 'chạy 1 lần cho cả lô', { cls: 'small' }).text(467, 92, 'chạy 1 lần cho cả lô', { cls: 'small' });
    g.text(30, 124, 'Streaming: xử lý từng sự kiện khi nó đến', { cls: 'title', anchor: 'start' });
    xs.forEach(function (x) { g.dot(x, 148, 5, 'a').arrow(x, 155, x, 172); });
    g.box(40, 174, 570, 26, 'bộ xử lý chạy liên tục, không bao giờ "xong"', 'a', { cls: 'small' });
  });

  fig('etl-elt', 186, function (g) {
    g.text(20, 50, 'ETL', { cls: 'title', anchor: 'start' });
    g.box(80, 26, 150, 48, 'Nguồn').arrow(230, 50, 258, 50)
      .box(260, 26, 150, 48, 'Biến đổi\n(trên máy riêng)', 'w').arrow(410, 50, 438, 50)
      .box(440, 26, 180, 48, 'Kho: chỉ có\ndữ liệu đã sạch');
    g.text(20, 134, 'ELT', { cls: 'title', anchor: 'start' });
    g.box(80, 110, 150, 48, 'Nguồn').arrow(230, 134, 258, 134)
      .box(260, 110, 150, 48, 'Kho: nạp\nnguyên dữ liệu thô').arrow(410, 134, 438, 134)
      .box(440, 110, 180, 48, 'Biến đổi bằng SQL\nngay trong kho', 'a');
  });

  fig('serving', 216, function (g) {
    g.box(30, 80, 140, 50, 'Hệ thống nguồn').arrow(170, 105, 238, 105);
    g.box(240, 80, 160, 50, 'Dữ liệu đã\nmô hình hóa', 'a');
    g.box(470, 14, 150, 46, 'BI, báo cáo').box(470, 82, 150, 46, 'Mô hình ML').box(470, 150, 150, 46, 'Reverse ETL');
    g.arrow(400, 95, 468, 40).arrow(400, 105, 468, 105).arrow(400, 115, 468, 170);
    g.box(30, 150, 140, 46, 'CRM, app\nvận hành', 'm');
    g.arrow(470, 180, 172, 180, { label: 'đẩy ngược kết quả về nơi người ta làm việc' });
  });

  /* ================= Chặng 4 ================= */
  fig('star', 240, function (g) {
    g.line(320, 50, 320, 90).line(320, 150, 320, 190).line(180, 120, 240, 120).line(400, 120, 460, 120);
    g.box(240, 90, 160, 60, 'fact_ban_hang\nsố lượng, doanh thu', 'a');
    g.box(250, 10, 140, 40, 'dim_ngay').box(250, 190, 140, 40, 'dim_cua_hang');
    g.box(30, 100, 150, 40, 'dim_san_pham').box(460, 100, 150, 40, 'dim_khach_hang');
    g.text(110, 160, 'ai, cái gì, ở đâu, khi nào', { cls: 'small' });
    g.text(530, 160, 'mỗi dimension\nlà một cách cắt số liệu', { cls: 'small' });
  });

  fig('scd2', 172, function (g) {
    g.grid(20, 20, 120, 32, [
      ['ma_kh', 'thanh_pho', 'tu_ngay', 'den_ngay', 'hien_tai'],
      ['KH01', 'Hà Nội', '2023-01-01', '2025-06-30', 'không'],
      ['KH01', 'Đà Nẵng', '2025-07-01', '9999-12-31', 'có']
    ], function (r) { return r === 0 ? 'm' : r === 2 ? 'a' : ''; }, 'mono');
    g.text(320, 142, 'Khách chuyển thành phố: không ghi đè, đóng dòng cũ và thêm dòng mới');
  });

  fig('medallion', 166, function (g) {
    g.box(20, 20, 180, 92, 'Bronze\ndữ liệu thô,\ngiữ nguyên như nguồn', 'w').arrow(200, 66, 228, 66);
    g.box(230, 20, 180, 92, 'Silver\nđã làm sạch, khử trùng,\nchuẩn kiểu dữ liệu').arrow(410, 66, 438, 66);
    g.box(440, 20, 180, 92, 'Gold\nbảng theo nghiệp vụ,\nsẵn sàng cho báo cáo', 'a');
    g.arrow(30, 142, 610, 142, { label: 'càng sang phải càng đáng tin và càng gần người dùng' });
  });

  /* ================= Chặng 5 ================= */
  fig('lakehouse', 240, function (g) {
    g.text(110, 14, 'Data warehouse', { cls: 'title' }).text(320, 14, 'Data lake', { cls: 'title' }).text(530, 14, 'Lakehouse', { cls: 'title' });
    g.box(20, 34, 180, 156, 'Lưu trữ và tính toán\ngắn liền một khối.\nCó bảng, có giao dịch.');
    g.box(230, 34, 180, 50, 'Engine tự chọn');
    g.box(230, 96, 180, 94, 'File trên object storage.\nRẻ, nhưng không có\nkhái niệm "bảng".');
    g.box(440, 34, 180, 46, 'Nhiều engine cùng đọc\n(Spark, Trino, Flink)');
    g.box(440, 89, 180, 46, 'Table format + catalog\n(Iceberg, Delta)', 'a');
    g.box(440, 144, 180, 46, 'File trên object storage');
    g.text(110, 214, 'đáng tin, kém linh hoạt', { cls: 'small' });
    g.text(320, 214, 'linh hoạt, dễ thành đầm lầy', { cls: 'small' });
    g.text(530, 214, 'bảng đáng tin trên nền file rẻ', { cls: 'small' });
  });

  fig('lambda-kappa', 232, function (g) {
    g.text(20, 50, 'Lambda', { cls: 'title', anchor: 'start' });
    g.box(90, 30, 90, 40, 'Nguồn');
    g.box(240, 6, 160, 36, 'Lớp batch (chính xác)').box(240, 58, 160, 36, 'Lớp speed (nhanh)', 'w');
    g.box(470, 30, 150, 40, 'Phục vụ');
    g.arrow(180, 44, 238, 26).arrow(180, 56, 238, 76).arrow(400, 24, 468, 44).arrow(400, 76, 468, 56);
    g.text(320, 112, 'hai đường, hai bộ code phải cho ra cùng một con số', { cls: 'small' });
    g.text(20, 170, 'Kappa', { cls: 'title', anchor: 'start' });
    g.box(90, 150, 90, 40, 'Nguồn').arrow(180, 170, 208, 170);
    g.box(210, 150, 120, 40, 'Log sự kiện', 'a').arrow(330, 170, 358, 170);
    g.box(360, 150, 110, 40, 'Stream').arrow(470, 170, 498, 170);
    g.box(500, 150, 120, 40, 'Phục vụ');
    g.text(320, 214, 'một đường duy nhất; cần tính lại thì phát lại log từ đầu', { cls: 'small' });
  });

  fig('coupling', 204, function (g) {
    g.text(20, 14, 'Gắn chặt', { cls: 'title', anchor: 'start' });
    g.box(60, 26, 120, 40, 'Khâu A').arrow(180, 46, 258, 46).box(260, 26, 120, 40, 'Khâu B lỗi', 'w').arrow(380, 46, 458, 46, { tone: 'w', dash: true }).box(460, 26, 120, 40, 'Khâu C', 'm');
    g.text(320, 84, 'một khâu hỏng là cả chuỗi dừng và phải chạy lại từ đầu', { cls: 'small' });
    g.text(20, 114, 'Lỏng, có vùng đệm', { cls: 'title', anchor: 'start' });
    g.box(30, 128, 100, 40, 'Khâu A').arrow(130, 148, 158, 148).box(160, 133, 80, 30, 'hàng đợi', 'a', { cls: 'small' }).arrow(240, 148, 268, 148);
    g.box(270, 128, 100, 40, 'Khâu B').arrow(370, 148, 398, 148).box(400, 133, 80, 30, 'hàng đợi', 'a', { cls: 'small' }).arrow(480, 148, 508, 148);
    g.box(510, 128, 100, 40, 'Khâu C');
    g.text(320, 188, 'mỗi khâu hỏng và hồi phục độc lập, dữ liệu chờ trong hàng đợi', { cls: 'small' });
  });

  /* ================= Chặng 6 ================= */
  fig('idempotent', 196, function (g) {
    g.text(20, 20, 'Ghi nối thêm (append)', { cls: 'title', anchor: 'start' });
    g.box(60, 36, 190, 40, 'Chạy lần 1: 100 dòng').arrow(250, 56, 318, 56, { label: 'chạy lại' })
      .box(320, 36, 260, 40, '200 dòng: trùng gấp đôi', 'w');
    g.text(20, 112, 'Ghi đè đúng partition của ngày đó', { cls: 'title', anchor: 'start' });
    g.box(60, 128, 190, 40, 'Chạy lần 1: 100 dòng').arrow(250, 148, 318, 148, { label: 'chạy lại' })
      .box(320, 128, 260, 40, 'vẫn 100 dòng: y nguyên', 'a');
  });

  fig('event-time', 214, function (g) {
    g.arrow(40, 120, 615, 120);
    [[80, '10:00'], [280, '10:05'], [480, '10:10']].forEach(function (t) {
      g.line(t[0], 114, t[0], 126).text(t[0], 140, t[1], { cls: 'mono' });
    });
    g.box(80, 92, 200, 22, 'cửa sổ 10:00 đến 10:05', 'm', { cls: 'small', rx: 3 });
    g.dot(120, 62, 6, 'a').text(120, 42, 'xảy ra lúc 10:01', { cls: 'small' });
    g.dot(360, 62, 6, 'w').text(400, 42, 'tới hệ thống lúc 10:07', { cls: 'small' });
    g.arrow(128, 62, 352, 62, { dash: true, tone: 'w', label: 'trễ 6 phút' });
    g.line(320, 78, 320, 168, { dash: true }).text(320, 180, 'watermark: chỉ chờ thêm 1 phút', { cls: 'small' });
    g.text(320, 202, 'sự kiện đến sau watermark sẽ bị bỏ sót nếu không xử lý riêng', { cls: 'small' });
  });

  fig('contract', 180, function (g) {
    g.box(20, 46, 150, 64, 'Đội tạo ra\ndữ liệu').arrow(170, 78, 238, 78);
    g.box(240, 24, 160, 108, 'Data contract\nschema · ý nghĩa\nchất lượng · SLA', 'a').arrow(400, 78, 468, 78);
    g.box(470, 46, 150, 64, 'Đội dùng\ndữ liệu');
    g.text(320, 160, 'thay đổi phá vỡ hợp đồng bị chặn trước khi lên production', { cls: 'small' });
  });

  fig('quality', 196, function (g) {
    g.box(20, 30, 130, 44, 'Thu nạp').arrow(150, 52, 170, 52);
    g.dot(186, 52, 15, 'g').text(186, 52, '✓').arrow(202, 52, 218, 52);
    g.box(220, 30, 130, 44, 'Biến đổi').arrow(350, 52, 370, 52);
    g.dot(386, 52, 15, 'w').text(386, 52, '✗');
    g.box(440, 30, 150, 44, 'Phục vụ\n(không chạy)', 'm', { dash: true });
    g.arrow(386, 68, 386, 108, { tone: 'w' });
    g.box(256, 110, 260, 44, 'Dừng lại, báo cho người trực', 'w');
    g.text(320, 180, 'kiểm tra đặt giữa các khâu: dữ liệu sai không đi tiếp tới người dùng', { cls: 'small' });
  });

  /* ================= Chặng 7 ================= */
  fig('cost', 226, function (g) {
    g.text(320, 14, 'Tiền đi đâu trong một nền tảng dữ liệu (tỷ lệ minh họa)', { cls: 'small' });
    g.line(60, 172, 600, 172);
    [['Lưu trữ', 38, 'm'], ['Tính toán', 112, 'w'], ['Truyền ra ngoài\n(egress)', 52, 'm'], ['Công người\nvận hành', 132, 'a']].forEach(function (b, i) {
      var x = 95 + i * 130;
      g.box(x, 172 - b[1], 70, b[1], '', b[2], { rx: 3 });
      g.text(x + 35, 196, b[0], { cls: 'small', lh: 14 });
    });
  });

  fig('build-buy', 168, function (g) {
    g.line(40, 70, 600, 70);
    ['Tự xây\ntừ đầu', 'Mã nguồn mở\ntự vận hành', 'Dịch vụ\nmanaged', 'SaaS\ntrọn gói'].forEach(function (t, i) {
      g.box(28 + i * 157, 44, 113, 52, t, i === 0 ? 'w' : i === 3 ? 'a' : '');
    });
    g.arrow(300, 128, 40, 128).text(170, 148, 'kiểm soát nhiều hơn, tốn người hơn', { cls: 'small' });
    g.arrow(340, 128, 600, 128).text(470, 148, 'nhẹ vận hành hơn, phụ thuộc hơn', { cls: 'small' });
  });

  fig('least-priv', 190, function (g) {
    g.text(160, 16, 'Analyst nhìn thấy', { cls: 'title' });
    g.grid(20, 36, 94, 30, [['ten', 'so_dien_thoai', 'doanh_thu'], ['N*** A*', '*** *** 412', '1.200.000']],
      function (r, c) { return r === 0 ? 'm' : c < 2 ? 'w' : ''; }, 'mono');
    g.text(160, 126, 'cột nhạy cảm bị che,\nvẫn đủ để phân tích doanh thu', { cls: 'small' });
    g.text(480, 16, 'Người xử lý sự cố (có thời hạn)', { cls: 'title' });
    g.grid(339, 36, 94, 30, [['ten', 'so_dien_thoai', 'doanh_thu'], ['Nguyễn An', '0912 345 412', '1.200.000']],
      function (r) { return r === 0 ? 'm' : 'a'; }, 'mono');
    g.text(480, 126, 'thấy đầy đủ, nhưng quyền\ntự hết hạn và có ghi nhật ký', { cls: 'small' });
  });

  /* ================= Chặng 8 ================= */
  fig('tradeoff', 226, function (g) {
    g.line(320, 44, 130, 178).line(130, 178, 510, 178).line(510, 178, 320, 44);
    g.dot(320, 44, 6, 'a').dot(130, 178, 6, 'a').dot(510, 178, 6, 'a');
    g.text(320, 22, 'Độ trễ thấp', { cls: 'title' });
    g.text(130, 202, 'Chi phí thấp', { cls: 'title' });
    g.text(510, 202, 'Đơn giản, dễ vận hành', { cls: 'title' });
    g.text(320, 134, 'thường chỉ lấy\nđược hai đỉnh', { cls: 'small' });
  });

  fig('rag', 204, function (g) {
    g.box(20, 24, 100, 42, 'Tài liệu').arrow(120, 45, 148, 45);
    g.box(150, 24, 100, 42, 'Cắt đoạn\n(chunk)').arrow(250, 45, 278, 45);
    g.box(280, 24, 100, 42, 'Embedding').arrow(380, 45, 408, 45);
    g.box(410, 24, 110, 42, 'Vector DB', 'a');
    g.text(270, 86, 'hàng trên là pipeline dữ liệu: phần việc của DE', { cls: 'small' });
    g.box(20, 130, 100, 42, 'Câu hỏi').arrow(120, 151, 198, 151);
    g.box(200, 130, 130, 42, 'Tìm đoạn\nliên quan').arrow(330, 151, 408, 151);
    g.arrow(455, 66, 300, 128, { dash: true });
    g.box(410, 130, 90, 42, 'LLM').arrow(500, 151, 528, 151);
    g.box(530, 130, 90, 42, 'Trả lời', 'm');
  });

  fig('tshape', 200, function (g) {
    g.box(50, 24, 540, 52, 'Nền rộng: SQL · mô hình hóa · hệ phân tán · cloud · giao tiếp', '');
    g.box(250, 76, 140, 108, 'Một mảng\nthật sâu\n(ví dụ: streaming)', 'a');
    g.text(120, 130, 'rộng để nói chuyện được\nvới mọi khâu', { cls: 'small' });
    g.text(520, 130, 'sâu để có chỗ\nngười khác cần mình', { cls: 'small' });
  });
})();
