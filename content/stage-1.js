DE.addStage({
  id: 's1', n: 1,
  title: 'Nền tảng: dữ liệu được lưu và đọc thế nào',
  goal: 'Hình dạng của **câu hỏi** quyết định cách lưu dữ liệu. Không có cách lưu tốt cho mọi việc.',
  lessons: [
    {
      id: '1-1', min: 8,
      title: 'OLTP và OLAP: hai thế giới của dữ liệu',
      hook: 'Một analyst chạy câu truy vấn tổng hợp doanh thu năm ngay trên CSDL của app bán hàng lúc 8 giờ tối. Mười phút sau khách không thanh toán được. Chuyện gì đã xảy ra?',
      core: [
        'Có hai kiểu công việc với dữ liệu, khác nhau tới mức cần hai loại hệ thống riêng.',
        { fig: 'oltp-olap', cap: 'OLTP phục vụ ứng dụng: nhiều thao tác nhỏ. OLAP phục vụ phân tích: ít truy vấn nhưng mỗi truy vấn quét rất nhiều.' },
        { table: [
          ['', 'OLTP (giao dịch)', 'OLAP (phân tích)'],
          ['Ví dụ câu hỏi', 'Đơn số 17 đang ở trạng thái nào?', 'Doanh thu theo tỉnh, theo tháng, ba năm qua?'],
          ['Mỗi thao tác chạm', 'Vài dòng', 'Hàng triệu tới hàng tỷ dòng'],
          ['Số thao tác', 'Hàng nghìn mỗi giây', 'Vài chục tới vài trăm mỗi giờ'],
          ['Ghi', 'Thêm, sửa, xóa liên tục', 'Nạp theo lô, hiếm khi sửa'],
          ['Ưu tiên', 'Nhanh từng thao tác, không được sai', 'Quét nhanh khối lượng lớn'],
          ['Ví dụ hệ thống', 'PostgreSQL, MySQL', 'BigQuery, Snowflake, ClickHouse']
        ] },
        'Trong chuyện ở đầu bài, truy vấn tổng hợp phải đọc gần hết bảng đơn hàng. Nó chiếm đĩa, bộ nhớ và CPU của chính cái máy đang phục vụ khách thanh toán. Hai kiểu việc tranh tài nguyên của nhau, và kiểu nặng hơn thắng.',
        { tip: 'Nguyên tắc đầu tiên của nghề: **tách hệ thống phân tích khỏi hệ thống giao dịch**. Phần lớn công việc của DE là hệ quả của nguyên tắc này: đã tách thì phải có người chuyển dữ liệu qua.' },
        '**ACID** là lời hứa của CSDL giao dịch: một giao dịch hoặc xong hết hoặc không gì cả (Atomicity), dữ liệu luôn hợp lệ (Consistency), các giao dịch chạy cùng lúc không giẫm lên nhau (Isolation), đã ghi xong thì không mất (Durability). Chuyển tiền mà trừ bên này không cộng bên kia là vi phạm ACID.'
      ],
      deep: [
        'Ranh giới đang mờ dần. Bản sao chỉ đọc (read replica) cho phép chạy truy vấn nhẹ mà không đụng máy chính. Một số hệ thống quảng cáo là HTAP, phục vụ cả hai kiểu. Nhưng khi khối lượng lớn, hai kiểu tối ưu vẫn kéo về hai hướng ngược nhau: lưu theo dòng cho ghi và tra cứu, lưu theo cột cho quét.',
        'Khi nào chưa cần tách? Khi dữ liệu còn vài GB và truy vấn phân tích chạy được trên read replica trong vài giây. Dựng cả một kho dữ liệu cho bảng 100 nghìn dòng là lãng phí. Dấu hiệu cần tách: truy vấn phân tích làm chậm ứng dụng, cần ghép dữ liệu từ nhiều nguồn, hoặc cần giữ lịch sử mà CSDL giao dịch đã ghi đè.',
        { warn: 'CSDL giao dịch thường chỉ giữ **trạng thái hiện tại**. Đơn hàng đổi địa chỉ thì địa chỉ cũ biến mất. Nếu nghiệp vụ cần lịch sử, bạn phải chủ động bắt và lưu nó, không ai làm hộ.' }
      ],
      mistakes: [
        'Chạy báo cáo nặng trên CSDL production vì "chỉ một câu SELECT thôi mà".',
        'Dùng kho phân tích để phục vụ ứng dụng cần phản hồi trong vài mili giây.',
        'Tưởng dữ liệu ở nguồn luôn còn đó để lấy lại sau.'
      ],
      check: [
        ['Vì sao một câu SELECT lại làm sập được việc thanh toán?', 'Vì nó quét cả bảng lớn, chiếm I/O, bộ nhớ và CPU dùng chung với các giao dịch; có thể còn giữ khóa hoặc làm đầy bộ đệm. Đọc không sửa dữ liệu nhưng vẫn tiêu tài nguyên.'],
        ['Chữ I trong ACID bảo vệ bạn khỏi chuyện gì?', 'Hai giao dịch chạy cùng lúc nhìn thấy trạng thái dở dang của nhau, ví dụ hai người cùng mua món hàng cuối cùng và cả hai đều thành công.']
      ],
      cards: [
        ['OLTP tối ưu cho việc gì?', 'Rất nhiều thao tác nhỏ đọc/ghi vài dòng, cần nhanh và đúng tuyệt đối: phục vụ ứng dụng.'],
        ['OLAP tối ưu cho việc gì?', 'Ít truy vấn nhưng mỗi truy vấn quét và tổng hợp lượng dữ liệu rất lớn: phục vụ phân tích.'],
        ['Vì sao phải tách phân tích khỏi CSDL giao dịch?', 'Truy vấn phân tích quét nhiều, tranh tài nguyên với giao dịch của người dùng và làm chậm hoặc sập ứng dụng.'],
        ['ACID gồm những gì?', 'Atomicity (tất cả hoặc không), Consistency (luôn hợp lệ), Isolation (không giẫm nhau), Durability (ghi rồi không mất).'],
        ['CSDL giao dịch thường thiếu gì mà phân tích cần?', 'Lịch sử thay đổi. Nó chỉ giữ trạng thái hiện tại, giá trị cũ bị ghi đè.']
      ]
    },
    {
      id: '1-2', min: 8, sim: 'rowcol',
      title: 'Lưu theo dòng, lưu theo cột và định dạng file',
      hook: 'Cùng một bảng, cùng một câu hỏi "tổng doanh thu là bao nhiêu", một cách lưu trả lời trong 2 giây, cách kia mất 10 phút. Khác nhau ở đâu?',
      core: [
        'Bảng có dòng và cột, nhưng đĩa chỉ là một dãy byte dài. Phải chọn xếp cái gì cạnh cái gì.',
        { fig: 'row-col', cap: 'Cùng một bảng, hai cách xếp lên đĩa. Màu cam và xanh là phần phải đọc để tính tổng cột "tiền".' },
        '**Lưu theo dòng**: các giá trị của một dòng nằm liền nhau. Lấy trọn một đơn hàng rất nhanh vì chỉ đọc một chỗ. Nhưng muốn cộng một cột thì phải đọc qua mọi cột của mọi dòng.',
        '**Lưu theo cột**: các giá trị của một cột nằm liền nhau. Cộng một cột chỉ cần đọc đúng cột đó. Bảng phân tích thường có hàng chục tới hàng trăm cột mà mỗi truy vấn chỉ dùng vài cột, nên tiết kiệm rất lớn.',
        'Lưu theo cột còn nén tốt hơn nhiều: các giá trị cùng cột giống nhau về kiểu và hay lặp lại (cột "tỉnh" chỉ có 63 giá trị). Nén tốt nghĩa là ít byte phải đọc, tức nhanh hơn và rẻ hơn.',
        { table: [
          ['Định dạng', 'Kiểu', 'Dùng khi'],
          ['CSV, JSON', 'Theo dòng, dạng chữ', 'Trao đổi với bên ngoài, người đọc được. Chậm, to, không có kiểu dữ liệu chặt.'],
          ['Avro', 'Theo dòng, nhị phân, kèm schema', 'Truyền sự kiện, ghi từng bản ghi, schema hay thay đổi.'],
          ['Parquet, ORC', 'Theo cột, nhị phân, nén', 'Lưu dữ liệu phân tích. Lựa chọn mặc định cho data lake.']
        ] },
        { tip: 'Câu hỏi để chọn: dữ liệu này sẽ được **đọc theo kiểu nào nhiều nhất**? Tra từng bản ghi thì theo dòng. Tổng hợp trên nhiều bản ghi thì theo cột.' }
      ],
      deep: [
        'Parquet chia file thành các **row group**, mỗi nhóm lưu theo cột và kèm thống kê min/max của từng cột. Khi truy vấn có điều kiện [[WHERE ngay = \'2026-03-01\']], engine đọc thống kê và bỏ qua hẳn những nhóm không thể chứa ngày đó. Kỹ thuật này gọi là **predicate pushdown**. Nó chỉ hiệu quả nếu dữ liệu được sắp xếp hoặc phân vùng theo cột hay lọc.',
        'Giá phải trả của lưu theo cột: ghi và sửa từng dòng rất đắt, vì một dòng nằm rải ở nhiều chỗ. Vì vậy file cột thường **bất biến**: muốn sửa thì viết file mới. Đây là lý do các table format như Iceberg, Delta ra đời: quản lý tập file bất biến để người dùng vẫn thấy một cái bảng sửa được.',
        { warn: '**Bài toán file nhỏ**: mười nghìn file Parquet mỗi file 100 KB chậm hơn nhiều so với mười file 100 MB chứa cùng dữ liệu, vì chi phí mở file và đọc metadata lấn át. Streaming ghi liên tục rất dễ sinh ra tình trạng này, phải có bước gộp file (compaction).' }
      ],
      mistakes: [
        'Lưu dữ liệu phân tích lâu dài bằng CSV hoặc JSON vì "dễ mở xem".',
        'Viết [[SELECT *]] trên bảng cột: tự tay vứt bỏ lợi thế lớn nhất của nó.',
        'Dùng Parquet cho luồng ghi từng bản ghi một.'
      ],
      check: [
        ['Vì sao cùng dữ liệu mà Parquet thường nhỏ hơn CSV vài lần?', 'Lưu nhị phân thay vì chữ, và các giá trị cùng cột nằm cạnh nhau nên các kiểu mã hóa (từ điển, run-length) và nén rất hiệu quả.'],
        ['Bảng 200 cột, truy vấn dùng 3 cột. Ước lượng lợi thế của lưu theo cột?', 'Chỉ đọc khoảng 3/200 dữ liệu trước khi tính nén, tức ít hơn khoảng 60 lần; tính thêm nén thì còn hơn nữa.']
      ],
      cards: [
        ['Lưu theo dòng mạnh ở đâu?', 'Đọc và ghi trọn từng bản ghi: tra cứu theo khóa, thêm/sửa từng dòng (OLTP).'],
        ['Lưu theo cột mạnh ở đâu?', 'Tổng hợp trên vài cột của rất nhiều dòng: chỉ đọc cột cần, nén tốt (OLAP).'],
        ['Predicate pushdown là gì?', 'Đẩy điều kiện lọc xuống tầng đọc file để bỏ qua các khối dữ liệu không thể thỏa điều kiện, dựa vào thống kê min/max.'],
        ['Bài toán file nhỏ là gì?', 'Quá nhiều file nhỏ làm truy vấn chậm vì chi phí mở file và metadata; cần gộp file (compaction).'],
        ['Parquet khác Avro ở điểm cốt lõi nào?', 'Parquet lưu theo cột, hợp cho phân tích. Avro lưu theo dòng kèm schema, hợp cho truyền và ghi từng bản ghi.']
      ]
    },
    {
      id: '1-3', min: 7,
      title: 'Big data thật sự là gì',
      hook: 'Công ty bạn có 50 GB dữ liệu. Đó có phải big data không? Còn 50 TB? Ranh giới nằm ở đâu?',
      core: [
        'Định nghĩa hữu dụng nhất: dữ liệu trở thành "big" khi **một máy không còn xử lý nổi trong thời gian chấp nhận được**. Không phải con số GB tuyệt đối, mà là quan hệ giữa dữ liệu, câu hỏi và thời hạn.',
        { ul: [
          '**Volume** (khối lượng): nhiều tới mức không vừa một máy.',
          '**Velocity** (tốc độ): đến nhanh tới mức không kịp xử lý theo cách thông thường.',
          '**Variety** (đa dạng): bảng, JSON, log, ảnh, văn bản lẫn lộn.',
          '**Veracity** (độ tin cậy): thiếu, trùng, sai, mâu thuẫn.',
          '**Value** (giá trị): chữ V duy nhất mà người trả tiền quan tâm.'
        ] },
        { fig: 'scale', cap: 'Hai cách đối phó khi máy hiện tại không đủ.' },
        '**Scale up** là đổi máy to hơn: đơn giản, không phải sửa gì, nhưng có trần và giá tăng nhanh hơn sức mạnh. **Scale out** là chia việc cho nhiều máy thường: gần như không có trần, nhưng bạn phải đối mặt với mọi rắc rối của hệ phân tán ở chặng sau.',
        { tip: 'Phần lớn công ty **không có big data**. Một máy hiện đại với DuckDB hay PostgreSQL xử lý thoải mái vài trăm GB. Hệ phân tán là cái giá phải trả khi không còn cách nào khác, không phải huy hiệu để đeo.' }
      ],
      deep: [
        'Trước khi phân tán, hãy thử theo thứ tự: (1) chỉ đọc cột và dòng cần thiết, (2) đổi sang định dạng cột có nén, (3) phân vùng dữ liệu để bỏ qua phần không liên quan, (4) scale up. Mỗi bước có thể cho lợi 10 lần mà không thêm độ phức tạp vận hành.',
        'Chi phí ẩn của scale out: thời gian điều phối giữa các máy, truyền dữ liệu qua mạng, xử lý khi một máy chết giữa chừng, và người vận hành phải hiểu tất cả những thứ đó. Với dữ liệu nhỏ, một cụm 10 máy thường **chậm hơn** một máy vì chi phí điều phối lớn hơn phần việc thật.',
        { warn: 'Velocity hay bị nhầm với "cần real-time". Dữ liệu đến liên tục không có nghĩa là người dùng cần kết quả liên tục. Hỏi kỹ: quyết định dựa trên dữ liệu này được đưa ra bao lâu một lần?' }
      ],
      mistakes: [
        'Dựng cụm Spark cho 5 GB dữ liệu.',
        'Đếm GB mà không hỏi câu hỏi nào cần trả lời và trong bao lâu.',
        'Thu thập mọi thứ "phòng khi cần" rồi không ai dùng: tốn tiền lưu, tăng rủi ro lộ dữ liệu.'
      ],
      check: [
        ['200 GB dữ liệu, báo cáo chạy mỗi đêm, cho phép 2 giờ. Có cần hệ phân tán không?', 'Nhiều khả năng không. Một máy với định dạng cột và engine phù hợp xử lý 200 GB trong vài phút. Cân nhắc phân tán khi dữ liệu tăng nhanh hoặc thời hạn co lại.'],
        ['Chữ V nào quan trọng nhất và vì sao?', 'Value. Bốn chữ kia mô tả độ khó; chỉ Value biện minh cho chi phí bỏ ra.']
      ],
      cards: [
        ['Khi nào dữ liệu được coi là "big"?', 'Khi một máy không xử lý nổi trong thời gian chấp nhận được, xét theo câu hỏi cần trả lời.'],
        ['5V của big data?', 'Volume, Velocity, Variety, Veracity, Value.'],
        ['Scale up khác scale out thế nào?', 'Scale up: máy to hơn, đơn giản nhưng có trần. Scale out: thêm máy, gần như không trần nhưng phải gánh độ phức tạp phân tán.'],
        ['Nên thử gì trước khi dùng hệ phân tán?', 'Đọc ít cột/dòng hơn, định dạng cột có nén, phân vùng, rồi scale up.'],
        ['Vì sao cụm nhiều máy có thể chậm hơn một máy?', 'Với dữ liệu nhỏ, chi phí điều phối và truyền qua mạng lớn hơn phần việc tính toán thật.']
      ]
    },
    {
      id: '1-4', min: 7,
      title: 'Lưu trữ: nhiệt độ dữ liệu và tách storage khỏi compute',
      hook: 'Log của ba năm trước nằm trên ổ SSD đắt nhất. Lần cuối có người đọc nó là 18 tháng trước. Ai đang trả tiền cho sự lãng phí đó?',
      core: [
        'Không phải dữ liệu nào cũng được dùng như nhau. Dữ liệu hôm qua được truy vấn hàng trăm lần mỗi ngày; dữ liệu ba năm trước gần như không ai chạm. Mức độ được truy cập gọi là **nhiệt độ dữ liệu**.',
        { fig: 'temperature', cap: 'Ba tầng lưu trữ. Đặt dữ liệu vào đúng tầng theo mức truy cập, và chuyển tầng khi nó nguội đi.' },
        'Tầng lạnh rẻ khi lưu nhưng **đắt và chậm khi lấy ra**: có thể mất vài giờ và tính phí theo lượng lấy. Nó hợp với dữ liệu phải giữ theo quy định mà hầu như không đọc lại.',
        { h: 'Tách lưu trữ khỏi tính toán' },
        'Hệ thống cũ gắn đĩa với CPU trong cùng một máy: muốn lưu nhiều hơn phải mua thêm cả CPU, dù không cần tính toán thêm. Hệ thống cloud hiện đại tách hai thứ: dữ liệu nằm trên **object storage** (S3, GCS, Azure Blob) rẻ và gần như vô hạn; máy tính toán bật lên khi cần, tắt khi xong.',
        { tip: 'Hệ quả về tư duy: **lưu trữ rẻ, tính toán đắt**. Giữ dữ liệu thô lại gần như không tốn gì; đọc nó một cách cẩu thả mới là thứ làm cháy ngân sách.' },
        'Object storage không phải ổ đĩa thông thường. Nó lưu từng file nguyên khối theo tên, không sửa được một phần file, không có thư mục thật. Đổi lại, nó cực bền, rẻ, và mọi engine đều đọc được.'
      ],
      deep: [
        'Tách storage-compute cho phép nhiều engine khác nhau cùng đọc một bản dữ liệu: Spark cho việc nặng, Trino cho truy vấn tương tác, một thư viện Python cho ML. Không phải sao chép dữ liệu vào từng hệ thống. Đây là nền của kiến trúc lakehouse ở chặng 5.',
        'Cái giá: dữ liệu nằm xa máy tính, mỗi lần đọc là một lần gọi qua mạng. Engine bù lại bằng cache cục bộ, đọc theo khối lớn, và bỏ qua dữ liệu không cần nhờ metadata. Thiết kế phân vùng và kích thước file vì thế ảnh hưởng trực tiếp tới hiệu năng.',
        { warn: 'Chính sách vòng đời (lifecycle policy) tự chuyển dữ liệu sang tầng lạnh rất tiện, nhưng hãy tính phí lấy ra và thời gian tối thiểu phải lưu. Chuyển dữ liệu vẫn còn được truy vấn sang archive có thể đắt hơn để yên.' }
      ],
      mistakes: [
        'Để mọi dữ liệu ở tầng nóng mãi mãi.',
        'Coi object storage như ổ đĩa: ghi nối từng dòng vào file, liệt kê hàng triệu file mỗi lần chạy.',
        'Để cụm tính toán chạy 24/7 trong khi chỉ dùng 2 giờ mỗi ngày.'
      ],
      check: [
        ['Vì sao tách storage và compute lại tiết kiệm tiền?', 'Mỗi thứ co giãn độc lập: lưu nhiều không buộc phải mua CPU; tính toán bật khi cần và tắt khi xong, không trả tiền cho máy rảnh.'],
        ['Dữ liệu nào hợp tầng archive?', 'Dữ liệu phải giữ theo quy định hoặc để phòng xa, gần như không đọc lại, và chấp nhận chờ vài giờ khi cần.']
      ],
      cards: [
        ['Nhiệt độ dữ liệu là gì?', 'Mức độ dữ liệu được truy cập: nóng (liên tục), ấm (thỉnh thoảng), lạnh (hiếm khi). Quyết định nên đặt ở tầng lưu trữ nào.'],
        ['Tách storage khỏi compute nghĩa là gì?', 'Dữ liệu nằm trên object storage, máy tính toán là tài nguyên riêng bật/tắt và co giãn độc lập.'],
        ['Object storage khác ổ đĩa thường ở đâu?', 'Lưu nguyên file theo tên, không sửa một phần file, không có thư mục thật; đổi lại rẻ, bền, gần như vô hạn.'],
        ['Cái bẫy của tầng lưu trữ lạnh?', 'Rẻ khi lưu nhưng lấy ra chậm và tốn phí; có thời gian lưu tối thiểu.'],
        ['Trên cloud, thứ gì thường đắt hơn: lưu hay tính?', 'Tính toán (và truyền dữ liệu ra ngoài). Lưu trữ thường là phần rẻ nhất.']
      ]
    }
  ]
});
