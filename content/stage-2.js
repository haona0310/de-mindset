DE.addStage({
  id: 's2', n: 2,
  title: 'Hệ phân tán: khi một máy không đủ',
  goal: 'Chia việc cho nhiều máy thì **mạng và sự cố** trở thành một phần của bài toán.',
  lessons: [
    {
      id: '2-1', min: 8,
      title: 'Partition và replication',
      hook: 'Một tỷ đơn hàng không vừa một máy. Chia ra ba máy thì máy nào giữ đơn nào, và nếu một máy chết thì sao?',
      core: [
        'Hai ý tưởng nền của mọi hệ thống dữ liệu phân tán, giải hai bài toán khác nhau.',
        { fig: 'partition-replica', cap: 'Bảng được cắt thành ba partition, mỗi partition có thêm một bản sao đặt ở node khác.' },
        '**Partition (phân mảnh)**: cắt dữ liệu thành nhiều phần, mỗi phần nằm trên một máy. Mục đích là **chứa được nhiều hơn và làm song song**. Ba máy mỗi máy xử lý một phần ba dữ liệu cùng lúc.',
        '**Replication (nhân bản)**: giữ nhiều bản sao của cùng một phần trên các máy khác nhau. Mục đích là **không mất dữ liệu và không ngừng phục vụ** khi một máy chết.',
        { tip: 'Partition để **mở rộng**. Replication để **sống sót**. Hệ thống thật dùng cả hai.' },
        { h: 'Chia theo cái gì' },
        'Cần một quy tắc để biết bản ghi nào thuộc partition nào. Cột dùng làm căn cứ gọi là **partition key**.',
        { table: [
          ['Cách chia', 'Quy tắc', 'Được', 'Mất'],
          ['Theo hash', 'hash(key) chia lấy dư cho số partition', 'Dữ liệu rải đều', 'Truy vấn theo khoảng phải hỏi mọi partition'],
          ['Theo khoảng (range)', 'Ví dụ mỗi ngày một partition', 'Lọc theo khoảng chỉ đọc vài partition', 'Dễ lệch: partition hôm nay nhận hết lượt ghi'],
          ['Xoay vòng', 'Lần lượt từng partition', 'Đều tuyệt đối', 'Không biết bản ghi nằm đâu, phải quét hết']
        ] },
        'Trong kho phân tích, partition theo **ngày** là lựa chọn phổ biến nhất vì gần như mọi truy vấn đều lọc theo thời gian. Truy vấn 7 ngày gần nhất chỉ đọc 7 partition thay vì toàn bộ lịch sử. Việc bỏ qua partition không liên quan gọi là **partition pruning**.'
      ],
      deep: [
        'Chọn partition key là quyết định khó đảo ngược. Đổi key nghĩa là viết lại toàn bộ dữ liệu. Hỏi trước: truy vấn nào chạy nhiều nhất và nó lọc theo cột gì?',
        'Số partition cũng có điểm tối ưu. Quá ít: mỗi partition quá to, không bỏ qua được nhiều. Quá nhiều (ví dụ partition theo mã khách hàng với 10 triệu khách): sinh hàng triệu file nhỏ và metadata phình to. Kinh nghiệm chung: mỗi partition nên chứa file cỡ trăm MB trở lên.',
        'Nhân bản có hai kiểu. **Đồng bộ**: chỉ báo ghi xong khi mọi bản sao đã nhận, an toàn nhưng chậm. **Bất đồng bộ**: báo xong ngay, bản sao cập nhật sau, nhanh nhưng bản sao có thể trễ (replication lag) và mất vài giây dữ liệu nếu máy chính chết đúng lúc.',
        { warn: 'Đọc từ bản sao bất đồng bộ ngay sau khi ghi có thể thấy dữ liệu cũ. Người dùng vừa sửa hồ sơ, tải lại trang, thấy thông tin cũ: lỗi kinh điển của replication lag.' }
      ],
      mistakes: [
        'Partition theo cột có quá nhiều giá trị khác nhau (mã người dùng, mã giao dịch).',
        'Partition theo cột mà truy vấn không bao giờ lọc.',
        'Nghĩ rằng đã có replication thì không cần backup. Lệnh xóa nhầm được nhân bản rất trung thành.'
      ],
      check: [
        ['Bảng sự kiện 2 năm, truy vấn chủ yếu xem 30 ngày gần nhất theo từng quốc gia. Partition theo gì?', 'Theo ngày. 30 ngày chỉ đọc 30 trong khoảng 730 partition. Quốc gia có thể dùng để sắp xếp bên trong hoặc làm partition cấp hai nếu số quốc gia ít.'],
        ['Replication có thay được backup không?', 'Không. Replication chống hỏng máy; lỗi logic như xóa nhầm hay ghi sai được sao chép sang mọi bản. Backup cho phép quay về một thời điểm trước lỗi.']
      ],
      cards: [
        ['Partition giải quyết bài toán gì?', 'Mở rộng: chứa nhiều dữ liệu hơn một máy và xử lý song song.'],
        ['Replication giải quyết bài toán gì?', 'Sống sót: không mất dữ liệu và vẫn phục vụ khi một máy chết.'],
        ['Partition pruning là gì?', 'Bỏ qua hẳn các partition không thể chứa dữ liệu thỏa điều kiện lọc, nhờ đó đọc ít hơn nhiều.'],
        ['Vì sao kho phân tích hay partition theo ngày?', 'Gần như mọi truy vấn đều lọc theo thời gian, nên bỏ qua được phần lớn dữ liệu.'],
        ['Replication lag là gì?', 'Độ trễ giữa lúc ghi vào bản chính và lúc bản sao bất đồng bộ nhận được; đọc bản sao có thể thấy dữ liệu cũ.'],
        ['Chọn partition key có quá nhiều giá trị thì sao?', 'Sinh ra vô số partition và file nhỏ, metadata phình to, truy vấn chậm đi.']
      ]
    },
    {
      id: '2-2', min: 9, sim: 'partition',
      title: 'Shuffle và data skew',
      hook: 'Job chạy trên 100 máy. 99 máy xong sau 2 phút. Máy còn lại chạy thêm 3 tiếng rồi hết bộ nhớ. Vì sao?',
      core: [
        'Khi dữ liệu nằm rải trên nhiều máy, có những phép tính làm được ngay tại chỗ và có những phép tính buộc phải gom dữ liệu lại.',
        { ul: [
          '**Làm tại chỗ**: lọc dòng, chọn cột, tính trên từng dòng. Mỗi máy tự xử lý phần của mình, không cần nói chuyện với ai.',
          '**Phải gom lại**: [[GROUP BY]], [[JOIN]], [[DISTINCT]], sắp xếp. Mọi dòng có cùng key phải về cùng một máy thì mới tính được.'
        ] },
        { fig: 'shuffle', cap: 'Shuffle đưa các bản ghi cùng key về cùng một node. Key màu xanh có quá nhiều bản ghi nên node đầu tiên bị quá tải.' },
        'Việc chuyển dữ liệu giữa các máy để gom theo key gọi là **shuffle**. Đây thường là phần **đắt nhất** của một job phân tán: dữ liệu phải được đóng gói, gửi qua mạng, ghi tạm ra đĩa rồi đọc lại.',
        '**Data skew (lệch dữ liệu)** xảy ra khi vài key có quá nhiều bản ghi. Tất cả bản ghi của một key phải về một máy, nên máy nhận key "nóng" làm việc gấp trăm lần các máy khác. Job chỉ xong khi máy chậm nhất xong.',
        { tip: 'Tốc độ của job phân tán do **máy chậm nhất** quyết định, không phải trung bình. Thêm máy không cứu được skew, vì key nóng vẫn dồn về một chỗ.' },
        'Skew có ở khắp nơi trong dữ liệu thật: vài khách hàng lớn chiếm nửa số đơn, giá trị NULL hoặc "không xác định" chiếm 30% một cột, một sản phẩm bán chạy vượt xa phần còn lại.'
      ],
      deep: [
        { h: 'Giảm shuffle' },
        { ul: [
          '**Lọc và chọn cột trước khi join**: ít dữ liệu hơn thì shuffle rẻ hơn.',
          '**Broadcast join**: khi một bảng đủ nhỏ, gửi nguyên bảng đó tới mọi máy. Bảng lớn không phải di chuyển.',
          '**Cùng cách phân mảnh**: nếu hai bảng đã được chia theo cùng key và cùng số phần, join không cần shuffle nữa.'
        ] },
        { h: 'Xử lý skew' },
        { ul: [
          '**Tách riêng key nóng**: xử lý key nóng bằng một nhánh riêng (thường là broadcast), phần còn lại join bình thường.',
          '**Salting**: gắn thêm một số ngẫu nhiên vào key nóng để chia nó ra nhiều máy, và nhân bản phía bảng kia tương ứng.',
          '**Lọc bỏ NULL trước**: NULL không join được với gì cả nhưng vẫn dồn hết về một máy.',
          '**Để engine tự làm**: các engine hiện đại có cơ chế tự phát hiện và chia nhỏ phần bị lệch khi chạy (Spark gọi là Adaptive Query Execution). Biết nó tồn tại, nhưng vẫn phải hiểu để nhận ra khi nó không cứu được.'
        ] },
        { warn: 'Dấu hiệu nhận biết skew trên màn hình giám sát: phần lớn task xong rất nhanh, một vài task chạy lâu gấp nhiều lần và đọc lượng dữ liệu lớn bất thường. Đừng tăng bộ nhớ cho cả cụm; hãy tìm key nóng.' }
      ],
      mistakes: [
        'Thấy job chậm là thêm máy, không xem phân bố thời gian của các task.',
        'Join trước, lọc sau.',
        'Quên rằng NULL và giá trị mặc định cũng là key, và thường là key nóng nhất.'
      ],
      check: [
        ['Vì sao thêm máy không giải quyết được skew?', 'Mọi bản ghi của một key phải về cùng một máy. Thêm máy chỉ chia nhỏ các key khác; key nóng vẫn dồn về một chỗ.'],
        ['Join bảng đơn hàng 1 tỷ dòng với bảng tỉnh thành 63 dòng. Làm sao tránh shuffle bảng lớn?', 'Broadcast bảng tỉnh thành tới mọi máy. Mỗi máy tự join phần đơn hàng của mình với bản sao tại chỗ.']
      ],
      cards: [
        ['Shuffle là gì?', 'Chuyển dữ liệu giữa các máy để các bản ghi cùng key về cùng một nơi, phục vụ GROUP BY, JOIN, DISTINCT, sắp xếp.'],
        ['Vì sao shuffle đắt?', 'Dữ liệu phải được đóng gói, truyền qua mạng, ghi tạm ra đĩa rồi đọc lại.'],
        ['Data skew là gì?', 'Vài key có quá nhiều bản ghi, khiến vài máy nhận phần việc gấp nhiều lần máy khác.'],
        ['Tốc độ job phân tán do đâu quyết định?', 'Máy (task) chậm nhất, không phải trung bình.'],
        ['Broadcast join là gì và dùng khi nào?', 'Gửi nguyên bảng nhỏ tới mọi máy để bảng lớn không phải shuffle. Dùng khi một bên đủ nhỏ để vừa bộ nhớ.'],
        ['Salting giải quyết gì?', 'Chia một key nóng ra nhiều máy bằng cách gắn thêm số ngẫu nhiên vào key, giảm skew.']
      ]
    },
    {
      id: '2-3', min: 8,
      title: 'CAP, tính nhất quán và cái giá của mạng',
      hook: 'Hai máy chủ giữ cùng một số dư tài khoản. Dây mạng giữa chúng đứt. Khách đang đứng ở máy ATM. Bạn cho rút tiền hay không?',
      core: [
        'Trên một máy, dữ liệu chỉ có một bản và luôn khớp với chính nó. Trên nhiều máy, các bản sao phải nói chuyện qua mạng để khớp nhau, mà mạng thì có thể chậm hoặc đứt bất cứ lúc nào.',
        { fig: 'cap', cap: 'Mạng đứt giữa hai node. Node B chưa nhận được cập nhật mới nhất và phải quyết định trả lời thế nào.' },
        '**Định lý CAP** nói rằng khi mạng giữa các máy bị chia cắt (Partition), hệ thống buộc phải chọn một trong hai:',
        { ul: [
          '**Nhất quán (Consistency)**: mọi câu trả lời đều đúng với dữ liệu mới nhất. Máy nào không chắc thì từ chối trả lời.',
          '**Sẵn sàng (Availability)**: máy nào còn sống cũng trả lời, chấp nhận câu trả lời có thể cũ.'
        ] },
        'Không có lựa chọn "cả hai". Đứt mạng là chuyện sẽ xảy ra, nên câu hỏi thật là: **khi nó xảy ra, nghiệp vụ này chịu được sai hay chịu được ngừng?**',
        { table: [
          ['Nghiệp vụ', 'Nên chọn', 'Vì'],
          ['Số dư tài khoản, tồn kho món cuối cùng', 'Nhất quán', 'Sai một lần là mất tiền thật'],
          ['Số lượt thích, số người đang xem', 'Sẵn sàng', 'Lệch vài giây không ai bị hại'],
          ['Giỏ hàng', 'Sẵn sàng, gộp lại sau', 'Thà thừa một món còn hơn không cho thêm vào giỏ']
        ] },
        { tip: 'Nhất quán không phải thuộc tính của công nghệ mà là **yêu cầu của nghiệp vụ**. Hỏi người làm nghiệp vụ, đừng hỏi tài liệu của CSDL.' }
      ],
      deep: [
        '**Eventual consistency** (nhất quán sau cùng): nếu ngừng ghi, sau một lúc mọi bản sao sẽ giống nhau. Nó không hứa "một lúc" là bao lâu, và không hứa trong lúc đó bạn đọc được gì. Nhiều hệ thống dữ liệu lớn chọn mức này vì nó rẻ và nhanh.',
        'CAP chỉ nói về lúc mạng đứt. Lúc bình thường vẫn có một đánh đổi khác: muốn nhất quán chặt thì phải chờ các bản sao xác nhận, tức **chậm hơn**. Mở rộng này gọi là PACELC: khi có Partition chọn A hay C; còn lại (Else) chọn độ trễ thấp (Latency) hay nhất quán (Consistency).',
        'Với DE, điều này hiện ra ở những chỗ rất cụ thể: đọc từ read replica thấy dữ liệu trễ; object storage liệt kê file ngay sau khi ghi; hai pipeline cùng ghi một bảng. Table format như Iceberg, Delta giải bài toán cuối bằng cách biến mỗi lần ghi thành một giao dịch nguyên tử trên metadata.',
        { warn: 'Tám ngộ nhận về hệ phân tán, đáng thuộc lòng ba cái đầu: mạng thì đáng tin; độ trễ bằng không; băng thông vô hạn. Mọi thiết kế ngầm giả định một trong ba điều này sẽ hỏng vào lúc tệ nhất.' }
      ],
      mistakes: [
        'Đòi nhất quán tuyệt đối cho mọi thứ, trả giá bằng tốc độ và độ sẵn sàng mà nghiệp vụ không cần.',
        'Dùng hệ thống nhất quán sau cùng cho nghiệp vụ tiền nong mà không có bước đối soát.',
        'Coi mạng nội bộ là không bao giờ đứt.'
      ],
      check: [
        ['Trong tình huống ATM ở đầu bài, bạn chọn gì?', 'Thường là nhất quán: từ chối giao dịch, hoặc cho rút trong một hạn mức nhỏ đã tính trước rủi ro. Cách thứ hai là ví dụ về việc nghiệp vụ định giá cái sai thay vì cấm tuyệt đối.'],
        ['Eventual consistency hứa điều gì và không hứa điều gì?', 'Hứa: nếu ngừng ghi thì cuối cùng mọi bản sao giống nhau. Không hứa: mất bao lâu, và trong lúc chờ bạn đọc được bản nào.']
      ],
      cards: [
        ['Định lý CAP nói gì?', 'Khi mạng giữa các máy bị chia cắt, hệ thống phải chọn giữa nhất quán (có thể từ chối trả lời) và sẵn sàng (có thể trả lời cũ).'],
        ['Eventual consistency là gì?', 'Nếu ngừng ghi, sau một thời gian mọi bản sao sẽ giống nhau; trong lúc đó có thể đọc thấy dữ liệu cũ.'],
        ['Ai quyết định mức nhất quán cần có?', 'Nghiệp vụ: hậu quả của một câu trả lời sai so với hậu quả của việc không trả lời.'],
        ['PACELC bổ sung gì cho CAP?', 'Ngay cả khi mạng bình thường vẫn phải đánh đổi giữa độ trễ thấp và nhất quán chặt.'],
        ['Ba ngộ nhận đầu tiên về hệ phân tán?', 'Mạng đáng tin, độ trễ bằng không, băng thông vô hạn.']
      ]
    }
  ]
});
