/* Mô phỏng: lượng dữ liệu phải đọc khi lưu theo dòng so với lưu theo cột */
(function () {
  'use strict';
  var DE = window.DE, el = DE.el, ui = DE.ui, fmt = DE.fmt;
  var VALUE = 8;            // byte trung bình mỗi giá trị
  var SPEED = 500e6;        // tốc độ quét giả định: 500 MB/giây
  var PAGE = 8e3;           // một trang của kho theo dòng
  var COL_BLOCK = 64e3;     // khối nhỏ nhất phải đọc cho mỗi cột khi tra một bản ghi

  function compute(s) {
    var rows = Math.pow(10, s.exp);
    var k = Math.min(s.used, s.cols);
    if (s.kind === 'scan') {
      return { row: rows * s.cols * VALUE, col: (rows * k * VALUE) / s.comp, k: k, rows: rows };
    }
    // Tra một bản ghi theo khóa: kho dòng đi qua chỉ mục (~4 trang); kho cột phải mở một khối cho mỗi cột
    return { row: 4 * PAGE, col: s.cols * COL_BLOCK, k: k, rows: rows };
  }
  DE._rowcolCompute = compute;

  DE.addSim('rowcol', {
    title: 'Lưu theo dòng hay theo cột',
    desc: 'Cùng một bảng, hai cách xếp lên đĩa. Đổi kích thước bảng và loại truy vấn để xem mỗi cách phải đọc bao nhiêu byte.',
    lessons: ['1-2', '1-1'],
    takeaways: [
      'Truy vấn tổng hợp: kho cột chỉ đọc **các cột được dùng** và được lợi thêm từ nén. Bảng càng rộng, khoảng cách càng lớn.',
      'Kéo "số cột truy vấn dùng" lên bằng tổng số cột (tức [[SELECT *]]): lợi thế về cột biến mất, chỉ còn lợi thế về nén.',
      'Tra **một bản ghi** theo khóa: kho dòng thắng rõ, vì cả bản ghi nằm một chỗ. Đây là lý do ứng dụng dùng kho dòng.',
      'Không cách lưu nào thắng ở mọi việc. Hình dạng của truy vấn quyết định.'
    ],
    mount: function (root) {
      var s = { exp: 9, cols: 50, used: 3, comp: 4, kind: 'scan' };
      var out = el('div');
      root.appendChild(el('div', { class: 'controls' },
        ui.select({ label: 'Loại truy vấn', value: s.kind, options: [['scan', 'Tổng hợp trên toàn bảng (phân tích)'], ['lookup', 'Tra một bản ghi theo khóa (ứng dụng)']], onchange: function (v) { s.kind = v; render(); } }),
        ui.slider({ label: 'Số dòng', min: 6, max: 11, value: s.exp, fmt: function (v) { return fmt.short(Math.pow(10, v)); }, oninput: function (v) { s.exp = v; render(); } }),
        ui.slider({ label: 'Số cột của bảng', min: 5, max: 200, step: 5, value: s.cols, oninput: function (v) { s.cols = v; render(); } }),
        ui.slider({ label: 'Số cột truy vấn dùng', min: 1, max: 200, value: s.used, oninput: function (v) { s.used = v; render(); } }),
        ui.slider({ label: 'Mức nén của kho cột', min: 1, max: 10, value: s.comp, fmt: function (v) { return v + '×'; }, oninput: function (v) { s.comp = v; render(); } })));
      root.appendChild(out);

      function render() {
        var r = compute(s);
        out.innerHTML = '';
        out.appendChild(ui.hbars([
          { label: 'Theo dòng', value: r.row, text: fmt.bytes(r.row), tone: r.row > r.col ? 'w' : 'a' },
          { label: 'Theo cột', value: r.col, text: fmt.bytes(r.col), tone: r.col > r.row ? 'w' : 'a' }
        ]));
        var ratio = r.row / r.col, colWins = ratio >= 1;
        var rt = (colWins ? ratio : 1 / ratio);
        var rtText = (rt >= 100 ? Math.round(rt) : rt.toFixed(1).replace('.', ',')) + '×';
        out.appendChild(el('div', { class: 'stats' },
          ui.stat('Thời gian đọc, theo dòng', fmt.time(r.row / SPEED), colWins ? 'warn' : 'good', 'giả định 500 MB/giây'),
          ui.stat('Thời gian đọc, theo cột', fmt.time(r.col / SPEED), colWins ? 'good' : 'warn', 'giả định 500 MB/giây'),
          ui.stat(colWins ? 'Theo cột đọc ít hơn' : 'Theo dòng đọc ít hơn', rtText, 'good')));

        var msg;
        if (s.kind === 'scan') {
          msg = 'Bảng ' + fmt.short(r.rows) + ' dòng, ' + s.cols + ' cột. Truy vấn dùng ' + r.k + ' cột. Kho dòng đọc mọi cột của mọi dòng. Kho cột đọc ' + r.k + '/' + s.cols + ' số cột rồi chia thêm cho mức nén ' + s.comp + '×.'
            + (r.k === s.cols ? ' Truy vấn đang dùng tất cả các cột: lợi thế chỉ còn đến từ nén.' : '');
        } else {
          msg = 'Lấy trọn một bản ghi. Kho dòng đi qua chỉ mục và đọc vài trang, không phụ thuộc bảng to hay nhỏ. Kho cột phải mở một khối cho mỗi cột trong ' + s.cols + ' cột để ráp lại bản ghi. Số dòng và mức nén gần như không ảnh hưởng ở đây.';
        }
        out.appendChild(el('p', { class: 'verdict', text: msg }));
        out.appendChild(el('p', { class: 'muted', style: 'font-size:.8rem', text: 'Mô hình đơn giản hóa: mỗi giá trị 8 byte, kho dòng không nén, trang 8 KB, khối cột 64 KB. Con số thật phụ thuộc vào engine và dữ liệu; tỷ lệ giữa hai cách mới là điều đáng nhớ.' }));
      }
      render();
    }
  });
})();
