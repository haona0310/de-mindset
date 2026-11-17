/* Mô phỏng: ước lượng chi phí lưu trữ và truy vấn theo các quyết định thiết kế.
   Đơn giá là số minh họa, cùng cỡ với bảng giá công khai của các cloud lớn, KHÔNG phải báo giá. */
(function () {
  'use strict';
  var DE = window.DE, el = DE.el, ui = DE.ui, fmt = DE.fmt;

  var FORMATS = {
    csv: { name: 'CSV (chữ, không nén)', comp: 1, colFrac: 1 },
    json: { name: 'JSON (chữ, lặp tên trường)', comp: 0.7, colFrac: 1 },
    parquet: { name: 'Parquet (cột, có nén)', comp: 5, colFrac: 0.2 }
  };
  var TIERS = {
    hot: { name: 'Nóng (chuẩn)', price: 0.023 },
    cool: { name: 'Ấm (ít truy cập)', price: 0.0125 },
    cold: { name: 'Lạnh (archive)', price: 0.004 }
  };
  var SCAN_PRICE = 5;   // $ cho mỗi TB dữ liệu quét

  function compute(s) {
    var f = FORMATS[s.format], t = TIERS[s.tier];
    var storedGB = (s.gbDay * s.retention) / f.comp;
    var storage = storedGB * t.price;
    var days = s.partition ? Math.min(s.lookback, s.retention) : s.retention;
    var scanGB = ((s.gbDay * days) / f.comp) * f.colFrac;
    var query = (scanGB / 1000) * SCAN_PRICE * s.queries * 30;
    return { storedGB: storedGB, storage: storage, scanGB: scanGB, query: query, total: storage + query };
  }
  DE._costCompute = compute;

  DE.addSim('cost', {
    title: 'Ước lượng chi phí',
    desc: 'Chọn khối lượng dữ liệu và vài quyết định thiết kế, xem hóa đơn hằng tháng thay đổi thế nào so với cách làm ngây thơ: CSV, tầng nóng, không partition.',
    lessons: ['7-1', '1-4', '2-1'],
    takeaways: [
      'Với cách làm ngây thơ, **tiền truy vấn lớn hơn tiền lưu trữ rất nhiều**. Tối ưu lưu trữ trước là tối ưu nhầm chỗ.',
      'Partition theo ngày khiến mỗi truy vấn chỉ đọc số ngày nó cần, thay vì toàn bộ lịch sử. Đây thường là đòn bẩy lớn nhất.',
      'Định dạng cột có nén giảm **cả hai** khoản: lưu ít byte hơn và mỗi truy vấn chỉ đọc cột cần.',
      'Tầng lạnh rẻ khi lưu, nhưng lấy ra chậm và có phí. Mô hình này không tính phí lấy ra, nên đừng đặt dữ liệu còn truy vấn hằng ngày vào đó.'
    ],
    mount: function (root) {
      var s = { gbDay: 100, retention: 730, format: 'csv', tier: 'hot', queries: 200, lookback: 7, partition: false };
      var out = el('div');
      function opts(map) { return Object.keys(map).map(function (k) { return [k, map[k].name]; }); }
      root.appendChild(el('div', { class: 'controls' },
        ui.slider({ label: 'Dữ liệu thô mỗi ngày', min: 1, max: 2000, value: s.gbDay, fmt: function (v) { return v + ' GB'; }, oninput: function (v) { s.gbDay = v; render(); } }),
        ui.slider({ label: 'Thời gian lưu giữ', min: 30, max: 1825, step: 5, value: s.retention, fmt: function (v) { return v + ' ngày'; }, oninput: function (v) { s.retention = v; render(); } }),
        ui.slider({ label: 'Số truy vấn mỗi ngày', min: 1, max: 2000, value: s.queries, oninput: function (v) { s.queries = v; render(); } }),
        ui.slider({ label: 'Mỗi truy vấn cần xem', min: 1, max: 365, value: s.lookback, fmt: function (v) { return v + ' ngày gần nhất'; }, oninput: function (v) { s.lookback = v; render(); } }),
        ui.select({ label: 'Định dạng lưu', value: s.format, options: opts(FORMATS), onchange: function (v) { s.format = v; render(); } }),
        ui.select({ label: 'Tầng lưu trữ', value: s.tier, options: opts(TIERS), onchange: function (v) { s.tier = v; render(); } }),
        ui.check({ label: 'Partition theo ngày', value: s.partition, onchange: function (v) { s.partition = v; render(); } })));
      root.appendChild(out);

      function render() {
        var r = compute(s);
        var naive = compute({ gbDay: s.gbDay, retention: s.retention, format: 'csv', tier: 'hot', queries: s.queries, lookback: s.lookback, partition: false });
        out.innerHTML = '';
        out.appendChild(ui.hbars([
          { label: 'Ngây thơ', value: naive.total, text: fmt.money(naive.total) + '/tháng', tone: 'm' },
          { label: 'Thiết kế này', value: r.total, text: fmt.money(r.total) + '/tháng', tone: r.total < naive.total * 0.5 ? 'a' : 'w' }
        ]));
        var save = naive.total > 0 ? Math.round((1 - r.total / naive.total) * 100) : 0;
        out.appendChild(el('div', { class: 'stats' },
          ui.stat('Dung lượng đang lưu', fmt.bytes(r.storedGB * 1e9)),
          ui.stat('Tiền lưu trữ', fmt.money(r.storage), '', 'mỗi tháng'),
          ui.stat('Mỗi truy vấn quét', fmt.bytes(r.scanGB * 1e9), r.scanGB > 1000 ? 'bad' : ''),
          ui.stat('Tiền truy vấn', fmt.money(r.query), r.query > r.storage * 3 ? 'bad' : '', 'mỗi tháng'),
          ui.stat('So với ngây thơ', (save >= 0 ? '−' : '+') + Math.abs(save) + '%', save > 50 ? 'good' : save > 0 ? 'warn' : 'bad')));

        var msg, cls = '';
        if (s.tier === 'cold' && s.queries > 5) {
          msg = 'Dữ liệu đang được truy vấn ' + s.queries + ' lần mỗi ngày mà đặt ở tầng lạnh. Ngoài đời, lấy dữ liệu từ archive mất hàng giờ và tính phí theo lượng lấy; con số ở trên chưa gồm khoản đó.'; cls = 'bad';
        } else if (!s.partition && s.lookback < s.retention) {
          msg = 'Truy vấn chỉ cần ' + s.lookback + ' ngày gần nhất nhưng phải quét toàn bộ ' + s.retention + ' ngày, vì bảng không được partition. Bật partition theo ngày để thấy khác biệt.'; cls = 'warn';
        } else if (r.query > r.storage * 3) {
          msg = 'Tiền truy vấn gấp ' + Math.round(r.query / r.storage) + ' lần tiền lưu trữ. Chỗ đáng tối ưu là lượng dữ liệu mỗi truy vấn đọc: định dạng cột, hoặc bảng tổng hợp sẵn cho các truy vấn lặp lại.'; cls = 'warn';
        } else {
          msg = 'Chi phí cân đối. Mỗi truy vấn chỉ đọc phần dữ liệu nó cần.'; cls = 'good';
        }
        out.appendChild(el('p', { class: 'verdict ' + cls, text: msg }));
        out.appendChild(el('p', { class: 'muted', style: 'font-size:.8rem', text: 'Đơn giá minh họa: lưu trữ $0,023 / $0,0125 / $0,004 mỗi GB mỗi tháng theo tầng; truy vấn $5 mỗi TB quét. Giả định Parquet nén 5 lần và mỗi truy vấn đọc 20% số cột. Giá thật khác nhau theo nhà cung cấp và thay đổi theo thời gian; hãy xem bảng giá chính thức khi lập ngân sách.' }));
      }
      render();
    }
  });
})();
