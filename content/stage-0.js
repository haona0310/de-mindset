/* Chặng 0. Khuôn mỗi bài: hook, core, deep, mistakes, check [[hỏi, gợi ý]], cards [[hỏi, đáp]], sim (tùy chọn).
   Trong chuỗi: **đậm**, [[code]]. Khối: chuỗi = đoạn văn, {h}, {ul}, {tip}, {warn}, {table}, {flow}, {fig, cap}, {code}. */
DE.addStage({
  id: 's0', n: 0,
  title: 'Data Engineer là ai',
  goal: 'Dữ liệu là **sản phẩm phục vụ người khác**. DE không phải người chạy công cụ.',
  lessons: [
    {
      id: '0-1', min: 7,
      title: 'Nghề này tồn tại để giải quyết chuyện gì',
      hook: 'Công ty nào cũng có dữ liệu. Vậy tại sao sếp hỏi "tháng trước ta bán được bao nhiêu" mà ba phòng đưa ra ba con số khác nhau?',
      core: [
        'Dữ liệu sinh ra ở khắp nơi: ứng dụng bán hàng ghi đơn, app di động ghi lượt bấm, kế toán có phần mềm riêng, đội marketing có file Excel. Mỗi nơi lưu theo cách của mình, phục vụ việc của mình. Không nơi nào được thiết kế để trả lời câu hỏi của người khác.',
        '**Data Engineer (DE)** là người xây và vận hành con đường đưa dữ liệu từ nơi nó sinh ra đến nơi nó được dùng, sao cho khi tới nơi thì dữ liệu **đúng, đủ, kịp lúc và dùng được**.',
        { fig: 'de-role', cap: 'DE đứng giữa nơi sinh dữ liệu và người dùng dữ liệu. Giá trị của DE đo ở đầu bên phải, không phải ở giữa.' },
        'Hãy nghĩ tới hệ thống cấp nước của thành phố. Người dân không quan tâm đường ống làm bằng gì. Họ quan tâm mở vòi là có nước, nước sạch, áp lực đủ. Kỹ sư cấp nước giỏi là người làm cho không ai phải nghĩ về đường ống. DE cũng vậy.',
        { tip: 'Câu hỏi đầu tiên của một DE không phải "dùng công cụ gì" mà là **"ai sẽ dùng dữ liệu này, để ra quyết định gì, và cần nó lúc nào"**.' },
        { h: 'DE khác gì các vai trò gần đó' },
        { table: [
          ['Vai trò', 'Câu hỏi chính', 'Sản phẩm làm ra'],
          ['Data Engineer', 'Làm sao dữ liệu đến nơi đáng tin và kịp lúc?', 'Pipeline, bảng dữ liệu sạch, nền tảng'],
          ['Data Analyst', 'Số liệu nói gì về việc kinh doanh?', 'Báo cáo, dashboard, phân tích'],
          ['Data Scientist / ML Engineer', 'Dự đoán được điều gì từ dữ liệu?', 'Mô hình, thử nghiệm'],
          ['Backend Engineer', 'Ứng dụng phục vụ người dùng thế nào?', 'Dịch vụ, API, CSDL giao dịch']
        ] }
      ],
      deep: [
        'Ba mục tiêu mà mọi quyết định của DE phải cân: **tăng giá trị** dữ liệu mang lại, **giảm chi phí** (cả tiền lẫn cơ hội bị bỏ lỡ), và **giảm rủi ro** (sai số liệu, lộ dữ liệu). Một pipeline rất đẹp về kỹ thuật nhưng không ai dùng thì có giá trị bằng không.',
        'Mức độ trưởng thành về dữ liệu của tổ chức quyết định bạn nên làm gì. Giai đoạn **mới bắt đầu**: cần một người đa năng, giải pháp có sẵn, ra kết quả nhanh để lấy niềm tin. Giai đoạn **mở rộng**: chuẩn hóa, tự động hóa, bắt đầu chuyên môn hóa. Giai đoạn **dẫn dắt bằng dữ liệu**: tự phục vụ, quản trị chặt, tối ưu sâu.',
        { warn: 'Mang kiến trúc của công ty nghìn kỹ sư về áp cho đội ba người là kiểu sai phổ biến nhất của người đã có kinh nghiệm. Việc bắt chước hình thức mà không có bài toán tương ứng gọi là **cargo-cult engineering**.' }
      ],
      mistakes: [
        'Tự giới thiệu bằng danh sách công cụ ("tôi biết Spark, Kafka, Airflow") thay vì bằng bài toán đã giải.',
        'Coi pipeline chạy xanh là xong việc. Xong việc là khi người dùng tin và dùng con số đó.',
        'Xây nền tảng trước, đi tìm người dùng sau.'
      ],
      check: [
        ['Một pipeline chạy đúng giờ mỗi đêm suốt một năm nhưng không ai mở bảng kết quả. Nó thành công hay thất bại?', 'Thất bại theo thước đo của nghề: tốn chi phí chạy và bảo trì mà giá trị bằng không. Việc cần làm là tìm xem nó phục vụ ai, nếu không còn ai thì tắt.'],
        ['Vì sao ba phòng ra ba con số doanh thu khác nhau?', 'Vì mỗi phòng lấy từ một nguồn khác, định nghĩa "doanh thu" khác (có trừ hoàn hàng không, tính theo ngày đặt hay ngày giao), và tính vào thời điểm khác. Đây là bài toán định nghĩa và mô hình hóa, không chỉ là bài toán kỹ thuật.']
      ],
      cards: [
        ['Data Engineer làm gì, nói trong một câu?', 'Xây và vận hành con đường đưa dữ liệu từ nơi sinh ra đến nơi được dùng, sao cho dữ liệu đúng, đủ, kịp lúc và dùng được.'],
        ['Ba mục tiêu mọi quyết định của DE phải cân?', 'Tăng giá trị dữ liệu, giảm chi phí (tiền và cơ hội), giảm rủi ro (sai lệch, bảo mật).'],
        ['Câu hỏi đầu tiên khi nhận một yêu cầu dữ liệu?', 'Ai dùng dữ liệu này, để ra quyết định gì, và cần nó lúc nào.'],
        ['Cargo-cult engineering là gì?', 'Bắt chước kiến trúc và công cụ của công ty lớn mà không có bài toán tương ứng, khiến đội nhỏ gánh độ phức tạp không cần thiết.'],
        ['Ba giai đoạn trưởng thành dữ liệu của tổ chức?', 'Mới bắt đầu, mở rộng, dẫn dắt bằng dữ liệu. Mỗi giai đoạn cần cách làm khác nhau.']
      ]
    },
    {
      id: '0-2', min: 8,
      title: 'Nghĩ theo vòng đời, không nghĩ theo công cụ',
      hook: 'Mười năm trước người ta học Hadoop. Năm năm trước là Spark. Bây giờ là lakehouse. Học cái gì thì không bị lỗi thời?',
      core: [
        'Công cụ đến rồi đi, nhưng mọi hệ thống dữ liệu từ trước đến nay đều phải trả lời cùng một chuỗi câu hỏi. Chuỗi đó gọi là **vòng đời dữ liệu** (data engineering lifecycle).',
        { fig: 'lifecycle', cap: 'Bốn giai đoạn nối tiếp, đặt trên nền lưu trữ, có sáu mối quan tâm chạy xuyên suốt.' },
        { ul: [
          '**Sinh ra (Generation)**: dữ liệu xuất hiện ở đâu, dạng gì, thay đổi thế nào? DE thường không sở hữu nguồn nhưng phải hiểu nó.',
          '**Thu nạp (Ingestion)**: kéo dữ liệu về bằng cách nào, bao lâu một lần?',
          '**Lưu trữ (Storage)**: để ở đâu, định dạng nào, giữ bao lâu? Giai đoạn này làm nền cho các giai đoạn còn lại.',
          '**Biến đổi (Transformation)**: làm sạch, ghép nối, tính toán để dữ liệu mang nghĩa nghiệp vụ.',
          '**Phục vụ (Serving)**: đưa tới báo cáo, mô hình ML, hoặc đẩy ngược về hệ thống vận hành.'
        ] },
        'Khi gặp một công cụ mới, đừng hỏi "nó có hay không". Hãy hỏi **"nó nằm ở giai đoạn nào của vòng đời và thay thế cái gì"**. Câu hỏi đó biến một rừng tên sản phẩm thành một bản đồ có thứ tự.',
        { h: 'Sáu dòng chảy ngầm' },
        'Sáu việc sau không thuộc riêng giai đoạn nào mà có mặt ở mọi giai đoạn: **bảo mật**, **quản trị dữ liệu** (ai sở hữu, nghĩa là gì, chất lượng ra sao), **DataOps** (tự động hóa, giám sát, xử lý sự cố), **kiến trúc**, **điều phối** (orchestration: việc nào chạy trước, việc nào chạy sau), và **kỹ nghệ phần mềm** (code có test, có kiểm soát phiên bản).',
        { tip: 'Người mới thường chỉ nhìn thấy hàng trên của sơ đồ. Người có nghề được trả lương cho hàng dưới.' }
      ],
      deep: [
        'Trong thực tế các giai đoạn giữa hay nhòe vào nhau: một công cụ vừa thu nạp vừa biến đổi, dữ liệu được biến đổi nhiều lần ở nhiều tầng. Đừng cố ép hệ thống thật vào sơ đồ thẳng. Vòng đời là **danh sách câu hỏi phải trả lời**, không phải sơ đồ triển khai.',
        'Chọn công nghệ nên dựa vào hai loại: **bất biến** (object storage, SQL, mạng, shell: đã sống hàng chục năm và sẽ còn sống tiếp) và **nhất thời** (công cụ đang nổi). Đặt nền trên thứ bất biến, bọc thứ nhất thời ở ngoài để thay được. Thứ gì đã tồn tại lâu thì nhiều khả năng còn tồn tại lâu, gọi là hiệu ứng Lindy.',
        { warn: 'Một hệ thống mà khi mô tả bạn chỉ kể được tên công cụ, không kể được dữ liệu của ai đi tới đâu trong bao lâu, là hệ thống chưa được thiết kế.' }
      ],
      mistakes: [
        'Học công cụ theo danh sách tuyển dụng mà không biết nó giải bài toán nào trong vòng đời.',
        'Bỏ qua sáu dòng chảy ngầm vì "chưa cần", rồi trả giá khi có sự cố đầu tiên.',
        'Cho rằng lưu trữ là chuyện phụ. Chọn sai lưu trữ thì mọi giai đoạn sau đều khổ.'
      ],
      check: [
        ['Kafka nằm ở đâu trong vòng đời? Còn dbt?', 'Kafka chủ yếu ở thu nạp (vận chuyển sự kiện) kiêm lưu trữ ngắn hạn. dbt ở biến đổi, có chạm tới quản trị dữ liệu (test, tài liệu, lineage).'],
        ['Kể tên sáu dòng chảy ngầm.', 'Bảo mật, quản trị dữ liệu, DataOps, kiến trúc, điều phối, kỹ nghệ phần mềm.']
      ],
      cards: [
        ['Các giai đoạn của vòng đời dữ liệu?', 'Sinh ra, thu nạp, biến đổi, phục vụ; lưu trữ làm nền cho tất cả.'],
        ['Sáu dòng chảy ngầm (undercurrents)?', 'Bảo mật, quản trị dữ liệu, DataOps, kiến trúc dữ liệu, điều phối (orchestration), kỹ nghệ phần mềm.'],
        ['Gặp công cụ mới, nên hỏi câu gì đầu tiên?', 'Nó nằm ở giai đoạn nào của vòng đời và thay thế cái gì.'],
        ['Công nghệ bất biến và nhất thời khác nhau thế nào?', 'Bất biến: đã tồn tại lâu và còn lâu (SQL, object storage). Nhất thời: công cụ đang nổi, có thể biến mất. Đặt nền trên thứ bất biến.'],
        ['Orchestration là gì?', 'Điều phối thứ tự và lịch chạy của các tác vụ dữ liệu, kèm phụ thuộc giữa chúng, thử lại và cảnh báo khi lỗi.']
      ]
    }
  ]
});
