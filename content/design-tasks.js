/* Thành phần và đề bài cho phần Thiết kế hệ thống.
   Mỗi luật: t = 'must' (cần có) | 'avoid' (nên tránh) | 'bonus'; w = điểm; ok(g) trả true khi đạt.
   g.has(id), g.any([ids]), g.path(từ, tới), g.via(từ, qua, tới): kiểm tra thành phần và đường đi có hướng. */
DE.layers = [
  ['source', 'Nguồn'], ['ingest', 'Thu nạp'], ['store', 'Lưu trữ'],
  ['transform', 'Biến đổi'], ['serve', 'Phục vụ'], ['ops', 'Vận hành, quản trị']
];
DE.components = [
  { id: 'db', layer: 'source', label: 'CSDL giao dịch' },
  { id: 'api', layer: 'source', label: 'API bên thứ ba' },
  { id: 'events', layer: 'source', label: 'Sự kiện từ ứng dụng' },
  { id: 'files', layer: 'source', label: 'File từ đối tác' },
  { id: 'docs', layer: 'source', label: 'Tài liệu, PDF' },

  { id: 'batch_in', layer: 'ingest', label: 'Thu nạp batch theo lịch' },
  { id: 'cdc', layer: 'ingest', label: 'CDC đọc log' },
  { id: 'queue', layer: 'ingest', label: 'Hàng đợi sự kiện' },

  { id: 'lake', layer: 'store', label: 'Object storage (data lake)' },
  { id: 'lakehouse', layer: 'store', label: 'Bảng lakehouse' },
  { id: 'warehouse', layer: 'store', label: 'Data warehouse' },
  { id: 'kv', layer: 'store', label: 'Kho key-value phản hồi nhanh' },
  { id: 'vector', layer: 'store', label: 'Vector database' },

  { id: 'sql', layer: 'transform', label: 'Biến đổi batch bằng SQL' },
  { id: 'spark', layer: 'transform', label: 'Xử lý phân tán (Spark)' },
  { id: 'stream', layer: 'transform', label: 'Xử lý stream' },
  { id: 'embed', layer: 'transform', label: 'Cắt đoạn + embedding' },

  { id: 'bi', layer: 'serve', label: 'Dashboard, báo cáo' },
  { id: 'ml', layer: 'serve', label: 'Huấn luyện mô hình ML' },
  { id: 'feature', layer: 'serve', label: 'Feature store' },
  { id: 'rt_api', layer: 'serve', label: 'API quyết định tức thì' },
  { id: 'reverse', layer: 'serve', label: 'Reverse ETL về CRM' },
  { id: 'llm', layer: 'serve', label: 'Trợ lý hỏi đáp (LLM)' },

  { id: 'orch', layer: 'ops', label: 'Bộ điều phối' },
  { id: 'dq', layer: 'ops', label: 'Kiểm tra chất lượng' },
  { id: 'monitor', layer: 'ops', label: 'Giám sát, cảnh báo' },
  { id: 'catalog', layer: 'ops', label: 'Catalog + lineage' },
  { id: 'access', layer: 'ops', label: 'Phân quyền, che PII' }
];

(function () {
  var TABLES = ['warehouse', 'lakehouse'];
  var ANY_STORE = ['lake', 'lakehouse', 'warehouse'];

  DE.addTask({
    id: 'retail', title: 'Báo cáo doanh thu hằng ngày cho chuỗi bán lẻ', level: 'Dễ',
    brief: 'Chuỗi 200 cửa hàng, mỗi ngày khoảng 5 GB dữ liệu đơn hàng nằm trong một CSDL giao dịch. Ban giám đốc muốn dashboard doanh thu theo cửa hàng và nhóm hàng.',
    needs: ['Số liệu của hôm qua phải sẵn sàng trước 7 giờ sáng.', 'Đội dữ liệu có 2 người.', 'Số trên dashboard phải khớp với kế toán.'],
    rules: [
      { t: 'must', w: 15, ok: function (g) { return g.has('db') && g.any(['batch_in', 'cdc']) && g.path('db', ['batch_in', 'cdc']); }, pass: 'Lấy dữ liệu từ CSDL giao dịch qua một bước thu nạp riêng, không truy vấn phân tích thẳng trên nguồn.', fail: 'Cần nối CSDL giao dịch tới một bước thu nạp (batch theo lịch hoặc CDC). Không chạy báo cáo thẳng trên CSDL của ứng dụng.' },
      { t: 'must', w: 15, ok: function (g) { return g.any(TABLES); }, pass: 'Có nơi lưu dạng bảng cho phân tích.', fail: 'Thiếu nơi lưu dạng bảng cho phân tích (data warehouse hoặc bảng lakehouse).' },
      { t: 'must', w: 15, ok: function (g) { return g.has('sql') && g.has('bi') && g.via('db', 'sql', 'bi'); }, pass: 'Dữ liệu đi từ nguồn, qua biến đổi SQL, tới dashboard.', fail: 'Cần một đường đi liền từ CSDL giao dịch, qua bước biến đổi SQL (nơi định nghĩa "doanh thu"), tới dashboard.' },
      { t: 'must', w: 15, ok: function (g) { return g.has('orch'); }, pass: 'Có bộ điều phối để chạy đúng giờ và thử lại khi lỗi.', fail: 'Thiếu bộ điều phối: ai bảo đảm job chạy trước 7 giờ sáng và chạy lại khi lỗi?' },
      { t: 'must', w: 20, ok: function (g) { return g.has('dq'); }, pass: 'Có kiểm tra chất lượng để đối chiếu với kế toán trước khi số lên dashboard.', fail: 'Thiếu kiểm tra chất lượng. Yêu cầu nói rõ số phải khớp kế toán: cần một bước đối chiếu chặn số sai.' },
      { t: 'avoid', w: 20, ok: function (g) { return !g.any(['stream', 'queue']); }, pass: 'Không dùng streaming cho nhu cầu hằng ngày.', fail: 'Hàng đợi sự kiện hoặc xử lý stream là thừa: yêu cầu chỉ cần số của hôm qua vào sáng hôm sau. Hai người sẽ phải vận hành một hệ thống chạy 24/7 mà không ai cần.' },
      { t: 'avoid', w: 10, ok: function (g) { return !g.has('spark'); }, pass: 'Không dùng xử lý phân tán cho 5 GB mỗi ngày.', fail: '5 GB mỗi ngày nằm gọn trong khả năng của SQL trên kho dữ liệu. Cụm xử lý phân tán thêm việc vận hành mà không thêm giá trị.' },
      { t: 'bonus', w: 10, ok: function (g) { return g.has('monitor'); }, pass: 'Có giám sát: biết báo cáo trễ trước khi sếp biết.', fail: 'Nên thêm giám sát và cảnh báo để biết sớm khi báo cáo có nguy cơ trễ.' }
    ],
    sample: { nodes: ['db', 'batch_in', 'warehouse', 'sql', 'bi', 'orch', 'dq', 'monitor'], edges: [['db', 'batch_in'], ['batch_in', 'warehouse'], ['warehouse', 'sql'], ['sql', 'bi']] },
    notes: 'Bài toán batch kinh điển. Điều đáng chú ý là những thứ **không** có trong lời giải: không streaming, không cụm phân tán, không lakehouse tự dựng. Với 5 GB mỗi ngày và hai người, một kho dữ liệu có sẵn cộng SQL là đủ và để dành sức cho việc khó thật sự: định nghĩa doanh thu khớp với kế toán. Batch hằng đêm là đủ; chọn CDC chỉ khi cần lịch sử thay đổi hoặc việc chụp cả bảng gây tải lên nguồn.'
  });

  DE.addTask({
    id: 'fraud', title: 'Chặn giao dịch gian lận trong 2 giây', level: 'Khó',
    brief: 'Ví điện tử xử lý 3.000 giao dịch mỗi giây. Mỗi giao dịch cần được chấm điểm rủi ro và chặn nếu đáng ngờ, trước khi tiền được chuyển đi.',
    needs: ['Quyết định phải có trong vòng 2 giây kể từ lúc giao dịch phát sinh.', 'Mô hình chấm điểm được huấn luyện lại hằng tuần trên dữ liệu lịch sử.', 'Hệ thống chấm điểm hỏng thì đội vận hành phải biết ngay.'],
    rules: [
      { t: 'must', w: 25, ok: function (g) { return g.via('events', 'queue', 'stream') && g.path('stream', ['rt_api']); }, pass: 'Có đường nóng: sự kiện, hàng đợi, xử lý stream, API quyết định.', fail: 'Thiếu đường nóng liền mạch: sự kiện giao dịch → hàng đợi → xử lý stream → API quyết định tức thì. Batch không đáp ứng được 2 giây.' },
      { t: 'must', w: 15, ok: function (g) { return g.any(['kv', 'feature']); }, pass: 'Có nơi tra nhanh đặc trưng của người dùng khi chấm điểm.', fail: 'Chấm điểm cần tra lịch sử của người dùng trong vài mili giây: cần kho key-value hoặc feature store. Kho phân tích không trả lời kịp.' },
      { t: 'must', w: 20, ok: function (g) { return g.any(ANY_STORE) && g.has('ml') && g.path('events', ANY_STORE) && g.path(ANY_STORE, ['ml']); }, pass: 'Có đường lạnh: lưu lịch sử giao dịch và dùng nó để huấn luyện lại mô hình.', fail: 'Thiếu đường lạnh: sự kiện phải được lưu lâu dài (data lake, lakehouse hoặc warehouse) và nối tới bước huấn luyện mô hình hằng tuần.' },
      { t: 'must', w: 15, ok: function (g) { return g.has('monitor'); }, pass: 'Có giám sát và cảnh báo cho hệ thống chạy 24/7.', fail: 'Thiếu giám sát, cảnh báo. Hệ thống chặn tiền mà hỏng trong im lặng thì hoặc gian lận lọt qua, hoặc khách thật bị chặn hàng loạt.' },
      { t: 'must', w: 10, ok: function (g) { return g.has('access'); }, pass: 'Có phân quyền và che thông tin cá nhân cho dữ liệu tài chính.', fail: 'Dữ liệu giao dịch tài chính cần phân quyền và che thông tin cá nhân.' },
      { t: 'avoid', w: 25, ok: function (g) { return !(g.has('batch_in') && !g.has('queue')); }, pass: 'Không dựa vào thu nạp batch cho quyết định tức thì.', fail: 'Chỉ có thu nạp batch thì không thể ra quyết định trong 2 giây.' },
      { t: 'bonus', w: 15, ok: function (g) { return g.has('feature') && g.has('dq'); }, pass: 'Feature store giữ đặc trưng lúc huấn luyện và lúc chạy thật giống nhau; có kiểm tra chất lượng cho dữ liệu huấn luyện.', fail: 'Nên có feature store (để đặc trưng lúc huấn luyện và lúc chạy thật là một) cùng kiểm tra chất lượng dữ liệu huấn luyện.' }
    ],
    sample: { nodes: ['events', 'queue', 'stream', 'kv', 'rt_api', 'lakehouse', 'spark', 'ml', 'feature', 'monitor', 'access', 'dq', 'orch'], edges: [['events', 'queue'], ['queue', 'stream'], ['stream', 'kv'], ['stream', 'rt_api'], ['queue', 'lakehouse'], ['lakehouse', 'spark'], ['spark', 'ml'], ['spark', 'feature'], ['feature', 'kv']] },
    notes: 'Đây là trường hợp streaming **xứng đáng** với độ phức tạp của nó: có một hành động cụ thể (chặn giao dịch) với thời hạn cứng. Hệ thống có hai đường. Đường nóng ra quyết định trong 2 giây. Đường lạnh lưu mọi thứ để huấn luyện lại mô hình và để điều tra về sau. Hàng đợi là điểm chung nuôi cả hai đường, nên hai đường không phụ thuộc vào nhau. Rủi ro lớn nhất là đặc trưng tính lúc huấn luyện khác lúc chạy thật; feature store sinh ra để giải đúng chuyện đó.'
  });

  DE.addTask({
    id: 'clicks', title: 'Phân tích hành vi: 1 tỷ sự kiện mỗi ngày', level: 'Vừa',
    brief: 'Ứng dụng di động sinh 1 tỷ sự kiện mỗi ngày (khoảng 500 GB). Đội sản phẩm muốn phân tích phễu chuyển đổi và tỷ lệ quay lại.',
    needs: ['Dữ liệu trễ 1 giờ là chấp nhận được.', 'Phải giữ dữ liệu thô 2 năm để phân tích lại.', 'Giờ cao điểm lượng sự kiện gấp 8 lần bình thường.'],
    rules: [
      { t: 'must', w: 20, ok: function (g) { return g.has('events') && g.has('queue') && g.path('events', ['queue']); }, pass: 'Sự kiện đi vào hàng đợi: vùng đệm hấp thụ đỉnh tải gấp 8 lần.', fail: 'Sự kiện nên đi qua hàng đợi. Nó là vùng đệm cho đỉnh tải gấp 8 lần, để phía sau xử lý theo nhịp của mình mà không mất dữ liệu.' },
      { t: 'must', w: 20, ok: function (g) { return g.any(['lake', 'lakehouse']) && g.path('events', ['lake', 'lakehouse']); }, pass: 'Dữ liệu thô nằm trên lưu trữ rẻ.', fail: 'Giữ 2 năm dữ liệu thô (hàng trăm TB) cần lưu trữ rẻ: object storage hoặc bảng lakehouse, nối từ nguồn sự kiện.' },
      { t: 'must', w: 20, ok: function (g) { return g.any(['spark', 'sql']) && g.has('bi') && g.path('events', ['bi']) && g.path(['spark', 'sql'], ['bi']); }, pass: 'Có bước biến đổi và đường đi tới dashboard.', fail: 'Cần một bước biến đổi (SQL hoặc xử lý phân tán) và đường đi liền từ sự kiện tới dashboard.' },
      { t: 'must', w: 15, ok: function (g) { return g.has('dq'); }, pass: 'Có kiểm tra chất lượng: sự kiện từ app hay trùng, thiếu, sai định dạng.', fail: 'Thiếu kiểm tra chất lượng. Sự kiện từ ứng dụng di động thường trùng, đến trễ và sai định dạng từ các phiên bản app cũ.' },
      { t: 'must', w: 10, ok: function (g) { return g.has('orch'); }, pass: 'Có bộ điều phối cho các job chạy theo giờ.', fail: 'Thiếu bộ điều phối cho các job chạy mỗi giờ.' },
      { t: 'avoid', w: 20, ok: function (g) { return !g.path('events', ['kv']) || g.any(['lake', 'lakehouse']); }, pass: 'Không dùng kho key-value làm nơi lưu chính.', fail: 'Kho key-value không phù hợp để lưu và quét 1 tỷ sự kiện mỗi ngày cho phân tích.' },
      { t: 'avoid', w: 10, ok: function (g) { return !g.has('stream'); }, pass: 'Không dùng xử lý stream khi trễ 1 giờ là đủ.', fail: 'Trễ 1 giờ là chấp nhận được, nên batch chạy mỗi giờ là đủ. Xử lý stream thêm độ phức tạp mà yêu cầu không đòi hỏi.' },
      { t: 'bonus', w: 15, ok: function (g) { return g.has('catalog') && g.has('access'); }, pass: 'Có catalog và phân quyền: đội sản phẩm tìm được dữ liệu, và định danh người dùng được bảo vệ.', fail: 'Nên có catalog (để đội sản phẩm biết có sự kiện gì, nghĩa là gì) và phân quyền (dữ liệu hành vi gắn với định danh người dùng).' }
    ],
    sample: { nodes: ['events', 'queue', 'lakehouse', 'spark', 'sql', 'bi', 'orch', 'dq', 'catalog', 'access'], edges: [['events', 'queue'], ['queue', 'lakehouse'], ['lakehouse', 'spark'], ['spark', 'sql'], ['sql', 'bi']] },
    notes: 'Khối lượng lớn nhưng yêu cầu về độ trễ lỏng: đây là big data mà **không cần streaming**. Hàng đợi có mặt không phải vì cần real-time mà vì nó hấp thụ đỉnh tải và tách ứng dụng khỏi phía sau. Dữ liệu được ghi theo lô nhỏ vào bảng lakehouse partition theo ngày, lưu dạng cột có nén. Xử lý phân tán làm phần nặng (khử trùng, ghép phiên), SQL làm tầng mô hình cho dashboard. Với 500 GB mỗi ngày, partition và định dạng cột là thứ quyết định hóa đơn.'
  });

  DE.addTask({
    id: 'churn', title: 'Nền dữ liệu cho mô hình dự đoán khách rời bỏ', level: 'Vừa',
    brief: 'Công ty viễn thông muốn dự đoán khách hàng sắp rời mạng để đội chăm sóc gọi giữ chân. Dữ liệu nằm ở CSDL hợp đồng và ở sự kiện sử dụng ứng dụng.',
    needs: ['Điểm rủi ro được cập nhật hằng tuần.', 'Nhân viên chăm sóc xem điểm ngay trong CRM họ dùng hằng ngày.', 'Dữ liệu chứa thông tin cá nhân của khách hàng.'],
    rules: [
      { t: 'must', w: 15, ok: function (g) { return g.has('db') && g.has('events') && g.path('db', ANY_STORE) && g.path('events', ANY_STORE); }, pass: 'Cả hai nguồn đều về một nơi lưu chung.', fail: 'Cả CSDL hợp đồng lẫn sự kiện ứng dụng phải được đưa về một nơi lưu chung để ghép lại.' },
      { t: 'must', w: 20, ok: function (g) { return g.any(['sql', 'spark']) && g.has('ml') && g.path(['sql', 'spark'], ['ml', 'feature']); }, pass: 'Có bước biến đổi tạo đặc trưng và nối tới huấn luyện mô hình.', fail: 'Cần bước biến đổi tạo đặc trưng từ dữ liệu thô, nối tới feature store hoặc huấn luyện mô hình.' },
      { t: 'must', w: 20, ok: function (g) { return g.has('reverse') && g.path(ANY_STORE.concat(['ml', 'feature', 'sql', 'spark']), ['reverse']); }, pass: 'Điểm rủi ro được đẩy về CRM, nơi nhân viên làm việc.', fail: 'Thiếu reverse ETL. Yêu cầu nói nhân viên xem điểm trong CRM; một bảng trong kho dữ liệu thì họ không bao giờ mở.' },
      { t: 'must', w: 20, ok: function (g) { return g.has('access'); }, pass: 'Có phân quyền và che PII.', fail: 'Thiếu phân quyền, che PII. Dữ liệu khách hàng viễn thông là dữ liệu cá nhân nhạy cảm.' },
      { t: 'must', w: 10, ok: function (g) { return g.has('orch') && g.has('dq'); }, pass: 'Có điều phối cho chu kỳ hằng tuần và kiểm tra chất lượng cho dữ liệu huấn luyện.', fail: 'Cần bộ điều phối (chu kỳ hằng tuần) và kiểm tra chất lượng (mô hình học từ dữ liệu bẩn sẽ dự đoán sai một cách tự tin).' },
      { t: 'avoid', w: 20, ok: function (g) { return !g.any(['stream', 'rt_api']); }, pass: 'Không dùng thành phần real-time cho nhu cầu hằng tuần.', fail: 'Điểm cập nhật hằng tuần, không có quyết định tức thì nào. Xử lý stream hoặc API real-time là thừa.' },
      { t: 'bonus', w: 15, ok: function (g) { return g.has('feature') && g.has('catalog'); }, pass: 'Feature store cho phép tái dùng đặc trưng; catalog ghi lại nguồn gốc của điểm số.', fail: 'Nên có feature store (tái dùng đặc trưng cho mô hình khác) và catalog + lineage (giải thích được điểm số dựa trên dữ liệu nào).' }
    ],
    sample: { nodes: ['db', 'events', 'cdc', 'batch_in', 'lakehouse', 'sql', 'feature', 'ml', 'reverse', 'orch', 'dq', 'access', 'catalog'], edges: [['db', 'cdc'], ['cdc', 'lakehouse'], ['events', 'batch_in'], ['batch_in', 'lakehouse'], ['lakehouse', 'sql'], ['sql', 'feature'], ['feature', 'ml'], ['ml', 'reverse']] },
    notes: 'Điểm mấu chốt nằm ở cuối đường ống: **mô hình chỉ có giá trị khi kết quả tới được tay người hành động**. Reverse ETL đưa điểm rủi ro vào CRM là thứ biến một dự án ML thành số khách được giữ lại. Lịch sử thay đổi hợp đồng quan trọng với mô hình (khách vừa hạ gói cước là tín hiệu mạnh), nên dùng CDC cho CSDL hợp đồng. Mọi thứ chạy batch hằng tuần; không có lý do gì để real-time.'
  });

  DE.addTask({
    id: 'rag', title: 'Trợ lý hỏi đáp trên tài liệu nội bộ', level: 'Vừa',
    brief: 'Công ty có 50.000 tài liệu nội bộ (quy trình, chính sách, hướng dẫn kỹ thuật) dạng PDF và trang wiki. Muốn nhân viên hỏi bằng ngôn ngữ thường và nhận câu trả lời có dẫn nguồn.',
    needs: ['Tài liệu được cập nhật hằng ngày; câu trả lời không được dựa trên bản đã lỗi thời quá 1 ngày.', 'Có tài liệu mật chỉ một số phòng ban được xem.', 'Câu trả lời phải chỉ ra dựa vào tài liệu nào.'],
    rules: [
      { t: 'must', w: 25, ok: function (g) { return g.via('docs', 'embed', 'vector') && g.path('vector', ['llm']); }, pass: 'Có đường chính: tài liệu, cắt đoạn và embedding, vector database, trợ lý.', fail: 'Thiếu đường chính liền mạch: tài liệu → cắt đoạn + embedding → vector database → trợ lý hỏi đáp.' },
      { t: 'must', w: 15, ok: function (g) { return g.has('batch_in') && g.has('orch'); }, pass: 'Có thu nạp theo lịch và bộ điều phối để làm mới chỉ mục hằng ngày.', fail: 'Tài liệu đổi hằng ngày: cần thu nạp theo lịch và bộ điều phối để cập nhật chỉ mục. Dựng chỉ mục một lần rồi bỏ đó là lỗi phổ biến nhất.' },
      { t: 'must', w: 25, ok: function (g) { return g.has('access'); }, pass: 'Có phân quyền: người hỏi chỉ nhận được đoạn từ tài liệu họ được xem.', fail: 'Thiếu phân quyền. Không có nó, trợ lý sẽ vui vẻ tóm tắt tài liệu mật cho bất kỳ ai hỏi đúng câu.' },
      { t: 'must', w: 15, ok: function (g) { return g.any(['lake', 'lakehouse']) && g.path('docs', ['lake', 'lakehouse']); }, pass: 'Bản gốc tài liệu được lưu lại, để tạo lại embedding khi đổi mô hình hoặc cách cắt đoạn.', fail: 'Nên lưu bản gốc tài liệu vào object storage. Khi đổi mô hình embedding hoặc cách cắt đoạn, bạn phải tạo lại toàn bộ chỉ mục từ bản gốc.' },
      { t: 'avoid', w: 15, ok: function (g) { return !g.any(['stream', 'queue']); }, pass: 'Không dùng streaming khi làm mới hằng ngày là đủ.', fail: 'Yêu cầu là tươi trong 1 ngày. Hàng đợi và xử lý stream là thừa.' },
      { t: 'bonus', w: 20, ok: function (g) { return g.has('catalog') && g.has('dq'); }, pass: 'Catalog + lineage truy được câu trả lời về tài liệu và phiên bản; kiểm tra chất lượng bắt tài liệu trùng và mâu thuẫn.', fail: 'Nên có catalog + lineage (câu trả lời dựa vào tài liệu nào, bản nào) và kiểm tra chất lượng (tài liệu trùng, bản cũ mới mâu thuẫn).' }
    ],
    sample: { nodes: ['docs', 'batch_in', 'lake', 'embed', 'vector', 'llm', 'orch', 'access', 'catalog', 'dq'], edges: [['docs', 'batch_in'], ['batch_in', 'lake'], ['lake', 'embed'], ['embed', 'vector'], ['vector', 'llm']] },
    notes: 'Một hệ thống AI, nhưng phần lớn sơ đồ là kỹ thuật dữ liệu quen thuộc: thu nạp tăng dần, lưu bản thô, biến đổi, làm mới theo lịch, phân quyền, lineage. Hai chỗ dễ sai nhất đều là chuyện dữ liệu. Một: tài liệu bị sửa hoặc xóa mà các đoạn cũ vẫn nằm trong chỉ mục, nên trợ lý trả lời theo bản lỗi thời. Hai: phân quyền phải áp theo người hỏi ngay ở bước tìm kiếm, vì đoạn văn đã tới mô hình thì không lấy lại được.'
  });

  DE.addTask({
    id: 'c360', title: 'Hồ sơ khách hàng hợp nhất, cập nhật trong 15 phút', level: 'Khó',
    brief: 'Thông tin khách hàng nằm ở ba nơi: CSDL của ứng dụng, một hệ thống chăm sóc khách hàng qua API, và file đối soát từ đối tác thanh toán. Cần một hồ sơ hợp nhất cho mỗi khách, đẩy về CRM.',
    needs: ['Thay đổi ở CSDL ứng dụng phải xuất hiện trong CRM sau tối đa 15 phút.', 'CSDL ứng dụng đang chịu tải cao; không được làm nó chậm thêm.', 'Phải giải thích được mỗi trường trong hồ sơ lấy từ nguồn nào.'],
    rules: [
      { t: 'must', w: 25, ok: function (g) { return g.has('db') && g.has('cdc') && g.path('db', ['cdc']); }, pass: 'Dùng CDC cho CSDL ứng dụng: bắt thay đổi gần tức thì mà gần như không gây tải.', fail: 'CSDL ứng dụng cần CDC. Chụp cả bảng mỗi 15 phút sẽ làm chậm một CSDL đang chịu tải cao; CDC đọc log nên gần như không gây thêm tải.' },
      { t: 'must', w: 15, ok: function (g) { return g.has('api') && g.has('files') && g.has('batch_in') && g.path('api', ANY_STORE) && g.path('files', ANY_STORE); }, pass: 'Hai nguồn còn lại được thu nạp theo lịch về cùng nơi lưu.', fail: 'API và file từ đối tác cần được thu nạp theo lịch và đưa về cùng nơi lưu với dữ liệu từ CSDL.' },
      { t: 'must', w: 20, ok: function (g) { return g.any(TABLES) && g.any(['sql', 'spark']) && g.has('reverse') && g.path('db', ['reverse']) && g.path(['sql', 'spark'], ['reverse']); }, pass: 'Có bước hợp nhất và reverse ETL đẩy hồ sơ về CRM.', fail: 'Cần nơi lưu dạng bảng, một bước biến đổi để hợp nhất ba nguồn thành một hồ sơ, và reverse ETL đẩy về CRM, tất cả trên một đường đi liền từ CSDL.' },
      { t: 'must', w: 15, ok: function (g) { return g.has('catalog'); }, pass: 'Có catalog + lineage để giải thích nguồn gốc từng trường.', fail: 'Thiếu catalog + lineage. Yêu cầu nói rõ phải giải thích được mỗi trường lấy từ nguồn nào.' },
      { t: 'must', w: 15, ok: function (g) { return g.has('dq') && g.has('access'); }, pass: 'Có kiểm tra chất lượng (ghép sai khách hàng là lỗi nghiêm trọng) và phân quyền.', fail: 'Cần kiểm tra chất lượng (ghép nhầm hai khách thành một là lỗi rất khó gỡ) và phân quyền (đây là dữ liệu cá nhân tập trung).' },
      { t: 'must', w: 10, ok: function (g) { return g.has('orch') && g.has('monitor'); }, pass: 'Có điều phối và giám sát cho cam kết 15 phút.', fail: 'Cam kết 15 phút cần bộ điều phối và giám sát để biết khi nào đang trễ.' },
      { t: 'avoid', w: 20, ok: function (g) { return !(g.path('db', ['batch_in']) && !g.has('cdc')); }, pass: 'Không chụp cả bảng định kỳ trên CSDL đang chịu tải.', fail: 'Thu nạp batch thẳng từ CSDL ứng dụng mỗi 15 phút vi phạm yêu cầu không làm nguồn chậm thêm.' }
    ],
    sample: { nodes: ['db', 'api', 'files', 'cdc', 'batch_in', 'queue', 'lakehouse', 'sql', 'reverse', 'orch', 'dq', 'monitor', 'catalog', 'access'], edges: [['db', 'cdc'], ['cdc', 'queue'], ['queue', 'lakehouse'], ['api', 'batch_in'], ['files', 'batch_in'], ['batch_in', 'lakehouse'], ['lakehouse', 'sql'], ['sql', 'reverse']] },
    notes: 'Ba nguồn, ba nhịp khác nhau, và mỗi nguồn được thu nạp theo cách hợp với nó: CDC cho CSDL đang chịu tải, batch cho API và file. 15 phút là vùng của **micro-batch**: thay đổi từ CDC được gom lại và biến đổi mỗi vài phút, không cần một hệ thống stream đầy đủ. Phần khó nhất không nằm trên sơ đồ: quy tắc nhận ra cùng một người ở ba hệ thống, và khi ba nguồn mâu thuẫn thì tin nguồn nào. Đó là quyết định nghiệp vụ, phải được viết ra và kiểm tra tự động.'
  });
})();
