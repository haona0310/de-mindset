# Tư duy Data Engineer

Khóa tự học dạy cách nghĩ của một Data Engineer trong thời big data: 9 chặng, 29 bài, mỗi bài có hình minh họa, phần Cốt lõi cho người mới và phần Đào sâu cho người đã đi làm. Kèm 6 mô phỏng, 159 thẻ ôn lặp lại ngắt quãng và 6 bài tập thiết kế hệ thống có chấm điểm.

## Cách mở

Mở file `index.html` bằng trình duyệt. Không cần cài đặt, không cần mạng.

Nếu muốn chạy qua máy chủ cục bộ:

```bash
python -m http.server 8765
```

rồi mở `http://localhost:8765`.

Tiến độ học, lịch ôn thẻ và bản vẽ thiết kế được lưu trong trình duyệt đang dùng (localStorage). Đổi trình duyệt, hoặc đổi giữa cách mở file và cách mở qua máy chủ, sẽ thấy tiến độ riêng.

## Cấu trúc

```
index.html              khung trang, nạp script theo thứ tự
css/styles.css          giao diện, nền sáng và tối
js/store.js             namespace DE, lưu trạng thái, helper
js/figures.js           29 hình minh họa SVG
js/lesson.js            hiển thị bài học
js/flashcards.js        thẻ ôn (SM-2 rút gọn)
js/designer.js          vùng vẽ kiến trúc và bộ chấm điểm
js/sims/*.js            sáu mô phỏng
js/app.js               điều hướng, trang lộ trình, tìm kiếm
content/stage-0..8.js   nội dung bài học và thẻ ôn
content/design-tasks.js thành phần và đề bài thiết kế
```

App không dùng ES module hay `fetch` để chạy được khi mở thẳng file.

## Thêm hoặc sửa bài

Mỗi chặng là một file trong `content/`. Một bài có dạng:

```js
{
  id: '2-2', min: 9, sim: 'partition',      // sim là tùy chọn
  title: '...', hook: '...',
  core: [ ... ], deep: [ ... ],             // mảng các khối
  mistakes: ['...'],
  check: [['câu hỏi', 'gợi ý trả lời']],
  cards: [['mặt trước', 'mặt sau']]
}
```

Các loại khối: chuỗi (đoạn văn), `{h}` tiêu đề nhỏ, `{ul: []}` danh sách, `{tip}` và `{warn}` hộp nhấn mạnh, `{table: [[tiêu đề], [dòng]...]}`, `{flow: []}` chuỗi bước, `{fig: 'tên', cap: 'chú thích'}` hình minh họa, `{code}`. Trong chuỗi dùng `**đậm**` và `[[code]]`.

Thêm chặng mới: tạo `content/stage-9.js` và thêm một thẻ `<script>` vào `index.html`.

Thêm hình: trong `js/figures.js`, gọi `fig('tên', chiều_cao, function (g) { ... })` với các lệnh vẽ `g.box`, `g.arrow`, `g.text`, `g.grid`, `g.dot`, `g.cyl` trên khung rộng 640.

## Lưu ý về nội dung

- Xương sống là khung vòng đời dữ liệu trong sách *Fundamentals of Data Engineering* (Reis & Housley), viết lại bằng lời riêng.
- Phần về xu hướng (lakehouse, table format, AI) phản ánh tình hình cuối 2026 và sẽ cũ đi; hãy đối chiếu tài liệu chính thức khi áp dụng.
- Các mô phỏng là mô hình đơn giản hóa. Đơn giá trong mô phỏng chi phí là số minh họa, không phải báo giá.
