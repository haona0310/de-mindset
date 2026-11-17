/* Mô phỏng: nguồn đổi schema, ba kiểu pipeline phản ứng thế nào */
(function () {
  'use strict';
  var DE = window.DE, el = DE.el;

  var BEFORE = [['ma_don', 'int'], ['khach_hang', 'string'], ['so_tien', 'int (đồng)'], ['ngay', 'date']];

  var PIPES = [
    { id: 'pos', name: 'A. Đọc theo vị trí cột', sub: 'CSV, cột thứ 3 là số tiền' },
    { id: 'name', name: 'B. Đọc theo tên cột', sub: 'liệt kê rõ cột cần, schema cố định' },
    { id: 'contract', name: 'C. Theo tên + data contract', sub: 'schema registry và kiểm tra giá trị' }
  ];

  /* Kết quả: ok = chạy đúng, bad = sai trong im lặng, loud = vỡ và báo lỗi, block = bị chặn trước khi lên production */
  var CHANGES = [
    {
      id: 'add', name: 'Thêm cột mới',
      after: [['ma_don', 'int'], ['khach_hang', 'string'], ['so_tien', 'int (đồng)'], ['ngay', 'date'], ['kenh_ban', 'string', 'new']],
      res: {
        pos: ['ok', 'Chạy đúng (lần này)', 'Cột mới nằm cuối nên vị trí các cột cũ không đổi. Nếu nó được chèn vào giữa thì kết quả sẽ như trường hợp đổi thứ tự.'],
        name: ['ok', 'Chạy đúng', 'Chỉ lấy các cột đã liệt kê, cột mới bị bỏ qua. Không có gì vỡ.'],
        contract: ['ok', 'Chạy đúng', 'Thêm cột tùy chọn là thay đổi tương thích. Registry chấp nhận, và ghi nhận có cột mới để bên dùng quyết định có lấy không.']
      }
    },
    {
      id: 'drop', name: 'Xóa cột khach_hang',
      after: [['ma_don', 'int'], ['so_tien', 'int (đồng)'], ['ngay', 'date']],
      res: {
        pos: ['bad', 'Sai trong im lặng', 'Các cột dồn sang trái. "Cột thứ 3" giờ là ngày, "cột thứ 2" là số tiền. Tùy kiểu dữ liệu, job có thể vẫn chạy và ghi rác vào bảng.'],
        name: ['loud', 'Vỡ, báo lỗi', 'Không tìm thấy cột khach_hang. Job dừng với thông báo rõ ràng. Khó chịu, nhưng không có dữ liệu sai nào được ghi.'],
        contract: ['block', 'Bị chặn ở nguồn', 'Xóa cột đang có người dùng là thay đổi phá vỡ hợp đồng. Bản triển khai của đội nguồn bị từ chối trước khi lên production.']
      }
    },
    {
      id: 'rename', name: 'Đổi tên so_tien thành amount',
      after: [['ma_don', 'int'], ['khach_hang', 'string'], ['amount', 'int (đồng)', 'new'], ['ngay', 'date']],
      res: {
        pos: ['ok', 'Chạy đúng (do may)', 'Vị trí không đổi nên vẫn đọc đúng. Nhưng pipeline không hề biết có thay đổi; đó là may mắn, không phải thiết kế.'],
        name: ['loud', 'Vỡ, báo lỗi', 'Không tìm thấy cột so_tien. Với người đọc theo tên, đổi tên là xóa một cột và thêm một cột.'],
        contract: ['block', 'Bị chặn ở nguồn', 'Registry coi đây là xóa cột bắt buộc. Cách đúng: thêm amount song song, cho bên dùng chuyển dần, rồi mới bỏ so_tien.']
      }
    },
    {
      id: 'type', name: 'Đổi kiểu so_tien từ số sang chuỗi',
      after: [['ma_don', 'int'], ['khach_hang', 'string'], ['so_tien', 'string ("1.200.000 đ")', 'new'], ['ngay', 'date']],
      res: {
        pos: ['loud', 'Vỡ, hoặc ghi NULL', 'Ép "1.200.000 đ" về số thất bại. Tùy cấu hình, job vỡ, hoặc tệ hơn: ghi NULL và chạy tiếp.'],
        name: ['loud', 'Vỡ, báo lỗi', 'Kiểu dữ liệu không khớp schema đã khai báo. Job dừng.'],
        contract: ['block', 'Bị chặn ở nguồn', 'Đổi kiểu không tương thích. Bị từ chối khi đội nguồn đăng ký schema mới.']
      }
    },
    {
      id: 'reorder', name: 'Đổi thứ tự cột',
      after: [['ma_don', 'int'], ['so_tien', 'int (đồng)', 'new'], ['khach_hang', 'string', 'new'], ['ngay', 'date']],
      res: {
        pos: ['bad', 'Sai trong im lặng', 'Số tiền bị đọc vào cột khách hàng và ngược lại. Nếu kiểu ép được, không có lỗi nào được báo.'],
        name: ['ok', 'Chạy đúng', 'Đọc theo tên nên thứ tự không quan trọng.'],
        contract: ['ok', 'Chạy đúng', 'Thứ tự cột không thuộc hợp đồng. Không ảnh hưởng.']
      }
    },
    {
      id: 'meaning', name: 'Đổi đơn vị: đồng thành nghìn đồng',
      after: [['ma_don', 'int'], ['khach_hang', 'string'], ['so_tien', 'int (nghìn đồng)', 'new'], ['ngay', 'date']],
      res: {
        pos: ['bad', 'Sai trong im lặng', 'Tên, kiểu, vị trí đều y nguyên. Doanh thu giảm 1.000 lần và không có gì báo lỗi.'],
        name: ['bad', 'Sai trong im lặng', 'Schema không đổi nên kiểm tra schema không thấy gì. Doanh thu giảm 1.000 lần.'],
        contract: ['loud', 'Dừng, báo lỗi', 'Schema không bắt được, nhưng hợp đồng có kiểm tra giá trị: so_tien trung bình lệch quá ngưỡng so với lịch sử. Pipeline dừng trước khi số sai tới dashboard.']
      }
    }
  ];
  DE._schemaChanges = CHANGES;

  var CLS = { ok: 'cell-ok', bad: 'cell-bad', loud: 'cell-warn', block: 'cell-ok' };

  DE.addSim('schema', {
    title: 'Schema thay đổi, pipeline nào sống',
    desc: 'Đội backend thay đổi bảng đơn hàng ở nguồn. Chọn một kiểu thay đổi và xem ba cách viết pipeline phản ứng thế nào.',
    lessons: ['6-3', '3-1'],
    takeaways: [
      'Kết quả tệ nhất không phải là vỡ mà là **sai trong im lặng**: pipeline xanh, số liệu sai, không ai biết.',
      'Đọc theo vị trí cột biến mọi thay đổi cấu trúc thành canh bạc. Đọc theo tên biến chúng thành **lỗi rõ ràng**.',
      'Data contract đẩy việc phát hiện **lên phía nguồn**: thay đổi phá vỡ bị chặn trước khi triển khai, khi chi phí sửa còn thấp nhất.',
      'Đổi ý nghĩa mà giữ nguyên tên và kiểu thì không kiểm tra schema nào bắt được. Chỉ **kiểm tra giá trị** mới bắt được.'
    ],
    mount: function (root) {
      var cur = CHANGES[0];
      var out = el('div');
      var choice = el('div', { class: 'choice', role: 'group', 'aria-label': 'Kiểu thay đổi ở nguồn' });
      root.appendChild(choice);
      root.appendChild(out);

      function schemaTable(title, cols) {
        return el('div', null,
          el('div', { class: 'side-label', text: title }),
          el('div', { class: 'table-wrap' }, el('table', null, el('tbody', null, cols.map(function (c) {
            return el('tr', null, el('td', null, el('code', { text: c[0] }), c[2] ? el('strong', { style: 'display:inline;color:var(--warn)', text: '  ← đổi' }) : null), el('td', { text: c[1] }));
          })))));
      }

      function render() {
        choice.innerHTML = '';
        CHANGES.forEach(function (c) {
          choice.appendChild(el('button', {
            type: 'button', class: 'chip' + (c === cur ? ' on' : ''), 'aria-pressed': c === cur ? 'true' : 'false', text: c.name,
            onclick: function () { cur = c; render(); }
          }));
        });
        out.innerHTML = '';
        out.appendChild(el('div', { class: 'grid', style: 'margin-bottom:16px' }, schemaTable('Trước', BEFORE), schemaTable('Sau: ' + cur.name.toLowerCase(), cur.after)));
        out.appendChild(el('div', { class: 'table-wrap' }, el('table', { class: 'matrix' },
          el('thead', null, el('tr', null, el('th', { text: 'Pipeline' }), el('th', { text: 'Kết quả' }), el('th', { text: 'Chuyện gì xảy ra' }))),
          el('tbody', null, PIPES.map(function (p) {
            var r = cur.res[p.id];
            return el('tr', null,
              el('td', null, el('strong', { text: p.name }), el('span', { class: 'muted', text: p.sub })),
              el('td', { class: CLS[r[0]] }, el('strong', { text: r[1] })),
              el('td', { text: r[2] }));
          })))));
        var silent = PIPES.filter(function (p) { return cur.res[p.id][0] === 'bad'; }).length;
        out.appendChild(el('p', {
          class: 'verdict ' + (silent ? 'bad' : 'good'),
          text: silent
            ? silent + ' trong 3 pipeline cho ra số liệu sai mà không báo lỗi. Đây là loại sự cố sống lâu nhất và đắt nhất.'
            : 'Không pipeline nào sai trong im lặng với thay đổi này: hoặc chạy đúng, hoặc dừng lại rõ ràng.'
        }));
      }
      render();
    }
  });
})();
