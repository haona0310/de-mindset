/* Mô phỏng: pipeline lỗi giữa chừng rồi chạy lại. So sánh ghi nối, ghi đè partition, upsert. */
(function () {
  'use strict';
  var DE = window.DE, el = DE.el, ui = DE.ui, fmt = DE.fmt;
  var CHUNKS = 10, ROWS = 100;

  /* table: mảng 10 phần tử, mỗi phần tử là số bản sao của lô tương ứng đang nằm trong bảng đích.
     Trả về bảng mới sau một lần chạy. failAfter = số lô ghi được trước khi lỗi (null = chạy trọn). */
  function run(table, mode, failAfter, atomic) {
    var written = failAfter == null ? CHUNKS : failAfter;
    var failed = failAfter != null;
    if (atomic && failed) return table.slice();          // ghi ra chỗ tạm, lỗi thì bỏ, bảng không đổi
    var t = table.slice(), i;
    if (mode === 'overwrite') for (i = 0; i < CHUNKS; i++) t[i] = 0;   // xóa partition của ngày trước khi ghi
    for (i = 0; i < written; i++) {
      if (mode === 'append') t[i] += 1;
      else t[i] = 1;                                     // overwrite (đã xóa) và merge (upsert theo khóa)
    }
    return t;
  }
  DE._retryRun = run;

  DE.addSim('retry', {
    title: 'Pipeline lỗi và chạy lại',
    desc: 'Job nạp dữ liệu của một ngày gồm 10 lô, mỗi lô 100 dòng. Nó lỗi giữa chừng rồi được chạy lại. Bảng đích cuối cùng có đúng 1.000 dòng không?',
    lessons: ['6-1'],
    takeaways: [
      '**Ghi nối** không idempotent: mỗi lần chạy lại cộng thêm dữ liệu. Số dòng sai mà không có lỗi nào được báo.',
      '**Ghi đè partition** và **upsert theo khóa** cho cùng kết quả dù chạy bao nhiêu lần. Khi đó cách xử lý sự cố chỉ là: chạy lại.',
      'Idempotent chưa đủ. Không ghi **nguyên tử** thì giữa lúc lỗi và lúc chạy lại, người dùng đọc phải một bảng thiếu dữ liệu.',
      'Bấm "Chạy lại" nhiều lần liên tiếp: pipeline tốt là pipeline mà thao tác đó không làm thay đổi gì.'
    ],
    mount: function (root) {
      var s = { mode: 'append', fail: 4, atomic: false, table: null, runs: 0, log: [] };
      var out = el('div');
      function reset() {
        s.table = []; for (var i = 0; i < CHUNKS; i++) s.table.push(0);
        s.runs = 0; s.log = ['Bảng đích đang trống. Bấm "Chạy lần đầu".'];
      }
      reset();
      root.appendChild(el('div', { class: 'controls' },
        ui.select({
          label: 'Cách ghi vào bảng đích', value: s.mode,
          options: [['append', 'Ghi nối thêm (INSERT)'], ['overwrite', 'Ghi đè partition của ngày'], ['merge', 'Upsert theo khóa (MERGE)']],
          onchange: function (v) { s.mode = v; reset(); render(); }
        }),
        ui.slider({ label: 'Lần đầu lỗi sau khi ghi được', min: 1, max: 9, value: s.fail, fmt: function (v) { return v + ' lô'; }, oninput: function (v) { s.fail = v; reset(); render(); } }),
        ui.check({ label: 'Ghi nguyên tử (ghi ra chỗ tạm, xong hết mới tráo vào)', value: s.atomic, onchange: function (v) { s.atomic = v; reset(); render(); } })));
      root.appendChild(out);

      function render() {
        out.innerHTML = '';
        var rows = s.table.reduce(function (a, b) { return a + b; }, 0) * ROWS;
        var dup = s.table.reduce(function (a, b) { return a + Math.max(0, b - 1); }, 0) * ROWS;
        var missing = s.table.filter(function (b) { return b === 0; }).length * ROWS;

        out.appendChild(el('div', { class: 'btn-row' },
          el('button', {
            class: 'btn btn-primary', type: 'button', disabled: s.runs > 0, text: 'Chạy lần đầu (sẽ lỗi)',
            onclick: function () {
              s.table = run(s.table, s.mode, s.fail, s.atomic); s.runs = 1;
              s.log.push('Lần 1: ghi được ' + s.fail + ' lô thì lỗi.' + (s.atomic ? ' Dữ liệu tạm bị bỏ, bảng đích không đổi.' : ' ' + s.fail + ' lô đã nằm trong bảng đích.'));
              render();
            }
          }),
          el('button', {
            class: 'btn', type: 'button', disabled: s.runs === 0, text: 'Chạy lại (lần này thành công)',
            onclick: function () {
              s.table = run(s.table, s.mode, null, s.atomic); s.runs++;
              s.log.push('Lần ' + s.runs + ': chạy trọn 10 lô, báo thành công.');
              render();
            }
          }),
          el('button', { class: 'btn btn-quiet', type: 'button', text: 'Đặt lại', onclick: function () { reset(); render(); } })));

        out.appendChild(el('div', { class: 'chunks', role: 'img', 'aria-label': 'Số bản sao của từng lô trong bảng đích: ' + s.table.join(', ') },
          s.table.map(function (c, i) {
            return el('div', { class: 'chunk' + (c === 1 ? ' ok' : c > 1 ? ' dup' : ''), title: 'Lô ' + (i + 1) + ': ' + c + ' bản' }, c === 0 ? '·' : '×' + c);
          })));
        out.appendChild(el('p', { class: 'muted', style: 'font-size:.8rem;margin:0', text: 'Mỗi ô là một lô 100 dòng. ×1 là đúng, ×2 trở lên là trùng, dấu chấm là thiếu.' }));

        out.appendChild(el('div', { class: 'stats' },
          ui.stat('Dòng trong bảng đích', fmt.num(rows), rows === 1000 ? 'good' : s.runs ? 'bad' : '', 'đúng phải là 1.000'),
          ui.stat('Dòng trùng', fmt.num(dup), dup ? 'bad' : 'good'),
          ui.stat('Dòng thiếu', fmt.num(missing), missing && s.runs ? 'warn' : missing ? '' : 'good'),
          ui.stat('Số lần đã chạy', s.runs)));

        var msg = null, cls = '';
        if (s.runs === 1 && !s.atomic) { msg = 'Job đã lỗi, nhưng ' + s.fail * ROWS + ' dòng vẫn nằm trong bảng. Ai truy vấn lúc này sẽ thấy doanh thu của ngày chỉ bằng ' + s.fail * 10 + '% thực tế, và không có gì báo cho họ biết.'; cls = 'warn'; }
        else if (s.runs === 1) { msg = 'Job lỗi nhưng bảng đích không bị đụng tới. Người đọc thấy dữ liệu cũ trọn vẹn thay vì dữ liệu mới dở dang.'; cls = 'good'; }
        else if (s.runs > 1 && dup) { msg = 'Lần chạy lại báo thành công, nhưng bảng có ' + fmt.num(rows) + ' dòng thay vì 1.000. Doanh thu bị đếm thừa ' + Math.round((dup / 1000) * 100) + '%. Không có cảnh báo nào vì không có lỗi kỹ thuật nào.'; cls = 'bad'; }
        else if (s.runs > 1) { msg = 'Đúng 1.000 dòng. Bấm "Chạy lại" thêm vài lần: kết quả không đổi. Đó là idempotent.'; cls = 'good'; }
        if (msg) out.appendChild(el('p', { class: 'verdict ' + cls, text: msg }));

        var log = el('div', { class: 'log', 'aria-live': 'polite' }, s.log.map(function (l) { return el('div', { text: l }); }));
        out.appendChild(log);
        log.scrollTop = log.scrollHeight;
      }
      render();
    }
  });
})();
