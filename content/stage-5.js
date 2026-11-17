DE.addStage({
  id: 's5', n: 5,
  title: 'Kiến trúc dữ liệu',
  goal: 'Kiến trúc trả lời **cái gì, vì sao, khi nào**. Công cụ chỉ trả lời **bằng cách nào**. Kiến trúc trước, công cụ sau.',
  lessons: [
    {
      id: '5-1', min: 9,
      title: 'Từ warehouse tới lake tới lakehouse',
      hook: 'Ba mươi năm, ba kiến trúc. Mỗi cái ra đời để sửa điểm yếu của cái trước, và mang theo điểm yếu mới. Hiểu lý do thì không cần thuộc tên.',
      core: [
        { fig: 'lakehouse', cap: 'Ba thế hệ kiến trúc lưu trữ phân tích.' },
        '**Data warehouse** (kho dữ liệu): một hệ thống chuyên cho phân tích, dữ liệu có cấu trúc, schema định trước, có giao dịch, truy vấn SQL nhanh. Điểm yếu thời đầu: đắt, khó mở rộng, không chứa được dữ liệu phi cấu trúc, và dữ liệu bị nhốt trong định dạng riêng của nhà cung cấp.',
        '**Data lake** (hồ dữ liệu): đổ mọi loại file vào lưu trữ rẻ, quyết định cấu trúc khi đọc. Chứa được mọi thứ, rẻ, engine nào cũng đọc được. Điểm yếu: không có khái niệm "bảng" nên không có giao dịch; hai job cùng ghi là hỏng; sửa một dòng phải viết lại cả file; không ai biết trong hồ có gì.',
        '**Lakehouse**: giữ file trên lưu trữ rẻ như lake, thêm một lớp metadata ở trên để tập file đó hành xử như bảng của warehouse. Lớp đó gọi là **open table format**.',
        { h: 'Table format làm gì' },
        'Table format (Apache Iceberg, Delta Lake, Apache Hudi) là một cuốn sổ ghi lại: bảng này hiện gồm những file nào. Mỗi lần ghi tạo một phiên bản mới của cuốn sổ. Từ ý tưởng đơn giản đó có được:',
        { ul: [
          '**Giao dịch**: người đọc luôn thấy một phiên bản trọn vẹn, không bao giờ thấy trạng thái ghi dở.',
          '**Sửa và xóa** từng dòng mà không phải tự viết lại file.',
          '**Du hành thời gian**: đọc bảng như nó từng tồn tại hôm qua.',
          '**Đổi schema và đổi cách partition** mà không viết lại dữ liệu cũ.',
          '**Nhiều engine** cùng đọc ghi một bảng.'
        ] },
        { tip: 'Điều đáng nhớ không phải tên sản phẩm mà là sự tách lớp: **file dữ liệu / định dạng bảng / danh mục (catalog) / engine tính toán**. Mỗi lớp thay được độc lập. Đó là nguyên tắc loose coupling áp vào lưu trữ.' }
      ],
      deep: [
        'Tình hình hiện nay (cuối 2026): Iceberg được hỗ trợ rộng nhất giữa các nhà cung cấp, Delta Lake mạnh trong hệ sinh thái Databricks, và các bên đang làm cho các định dạng đọc được lẫn nhau. Cuộc cạnh tranh đã chuyển từ định dạng sang **catalog**: nơi quản lý danh sách bảng, quyền truy cập và quản trị. Đây là nhận định từ nhiều nguồn trong ngành, phần lớn là của các nhà cung cấp; hãy kiểm tra lại khi bạn đọc bài này.',
        'Warehouse cũng đã thay đổi: các kho cloud hiện đại tách storage-compute, đọc được bảng Iceberg bên ngoài, chứa được dữ liệu bán cấu trúc. Ranh giới warehouse và lakehouse đang mờ. Câu hỏi thực tế là **bạn muốn tự quản bao nhiêu phần** và cần mở tới mức nào.',
        'Lakehouse không miễn phí về vận hành. Bảng cần được bảo trì: gộp file nhỏ, dọn phiên bản cũ, dọn file mồ côi. Bỏ quên các việc này thì truy vấn chậm dần và tiền lưu trữ tăng dần.',
        { warn: 'Với đội nhỏ và dữ liệu vừa phải, một kho cloud dùng ngay được thường cho kết quả nhanh hơn tự dựng lakehouse. Sự cởi mở và linh hoạt có giá là công vận hành; chỉ trả giá đó khi bạn thật sự cần thứ nó mua được.' }
      ],
      mistakes: [
        'Chọn lakehouse vì nó mới, không vì bài toán cần nhiều engine hay dữ liệu phi cấu trúc.',
        'Dựng data lake mà không có catalog và quy ước, biến nó thành đầm lầy.',
        'Quên bảo trì bảng: không gộp file, không dọn snapshot cũ.'
      ],
      check: [
        ['Data lake thiếu gì mà table format bổ sung?', 'Khái niệm bảng có giao dịch: người đọc thấy trạng thái nhất quán, nhiều người ghi không phá nhau, sửa xóa được từng dòng, xem lại được phiên bản cũ, đổi được schema an toàn.'],
        ['Bốn lớp của một lakehouse?', 'File dữ liệu trên object storage, định dạng bảng, catalog, engine tính toán.']
      ],
      cards: [
        ['Data warehouse là gì?', 'Hệ thống chuyên cho phân tích: dữ liệu có cấu trúc, schema định trước, giao dịch, SQL nhanh.'],
        ['Data lake là gì và yếu ở đâu?', 'Lưu mọi loại file trên lưu trữ rẻ. Yếu: không có bảng và giao dịch, dễ thành đầm lầy.'],
        ['Lakehouse là gì?', 'File trên object storage cộng một lớp table format để có bảng, giao dịch và quản trị như warehouse.'],
        ['Open table format làm gì?', 'Ghi lại bảng gồm những file nào qua từng phiên bản, nhờ đó có giao dịch, sửa/xóa, du hành thời gian, đổi schema.'],
        ['Catalog trong lakehouse làm gì?', 'Quản lý danh sách bảng, vị trí metadata hiện hành, quyền truy cập và quản trị.'],
        ['Việc bảo trì bảng lakehouse gồm gì?', 'Gộp file nhỏ (compaction), dọn snapshot cũ, dọn file mồ côi.']
      ]
    },
    {
      id: '5-2', min: 8,
      title: 'Lambda, Kappa và Data Mesh',
      hook: 'Con số trên dashboard real-time là 1.204. Con số trong báo cáo cuối ngày là 1.187. Cả hai tính từ cùng dữ liệu. Con nào đúng?',
      core: [
        'Khi cần cả kết quả nhanh lẫn kết quả chính xác, có hai cách tổ chức đã thành tên.',
        { fig: 'lambda-kappa', cap: 'Lambda đi hai đường song song. Kappa chỉ có một đường và coi batch là trường hợp riêng của stream.' },
        '**Lambda**: lớp batch tính lại kết quả chính xác trên toàn bộ dữ liệu, chậm. Lớp speed tính nhanh trên dữ liệu mới nhất, gần đúng. Lớp phục vụ ghép hai kết quả. Vấn đề là chuyện ở đầu bài: **cùng một logic phải viết hai lần** trên hai hệ thống, và hai bản rất khó giữ cho khớp.',
        '**Kappa**: bỏ lớp batch. Mọi thứ là stream; dữ liệu nằm trong một log giữ được lâu; cần tính lại thì phát lại log từ đầu qua cùng một đoạn code. Một logic, một con số. Đổi lại, toàn bộ hệ thống phải là streaming, với mọi độ phức tạp của nó.',
        { tip: 'Trước khi chọn giữa hai kiến trúc, hỏi xem có cần chúng không. Rất nhiều bài toán chỉ cần batch chạy dày hơn. Cả Lambda lẫn Kappa đều là câu trả lời cho một yêu cầu về độ trễ mà bạn phải chắc là có thật.' },
        { h: 'Data Mesh: bài toán tổ chức' },
        'Lambda và Kappa nói về dòng dữ liệu. **Data Mesh** nói về **con người**: khi công ty đủ lớn, một đội dữ liệu trung tâm trở thành nút cổ chai, vì họ phải hiểu nghiệp vụ của mọi phòng ban. Data Mesh đề xuất bốn nguyên tắc:',
        { ul: [
          'Mỗi **miền nghiệp vụ tự sở hữu** dữ liệu của mình.',
          'Dữ liệu được coi là **sản phẩm**, có người dùng và cam kết chất lượng.',
          'Một **nền tảng tự phục vụ** chung để các miền không phải tự dựng hạ tầng.',
          '**Quản trị liên miền**: chuẩn chung về định danh, bảo mật, khả năng kết nối.'
        ] }
      ],
      deep: [
        'Sự phân biệt Lambda/Kappa đang bớt gay gắt. Các engine hiện đại cho phép viết một logic chạy được cả batch lẫn stream; table format cho phép ghi streaming vào cùng bảng mà batch đọc. Bài học còn lại vẫn nguyên: **mỗi logic nghiệp vụ chỉ nên tồn tại ở một nơi**.',
        'Data Mesh giải bài toán của tổ chức có hàng chục đội và hàng trăm nguồn. Áp vào công ty 50 người thì chỉ tạo ra nhiều đội nhỏ thiếu người và các ốc đảo dữ liệu không nối được với nhau. Dấu hiệu thật sự cần: đội trung tâm quá tải dù đã tăng người, và độ trễ đến từ việc chờ họ hiểu nghiệp vụ.',
        'Điều kiện tiên quyết hay bị bỏ qua của Data Mesh là nguyên tắc thứ ba và thứ tư. Phân quyền sở hữu mà không có nền tảng chung và chuẩn chung thì ra hỗn loạn, không phải mesh.',
        { warn: '**Định luật Conway**: hệ thống có hình dạng giống cấu trúc giao tiếp của tổ chức tạo ra nó. Kiến trúc dữ liệu trên giấy không khớp với cách các đội thật sự nói chuyện với nhau thì sẽ không vận hành như trên giấy.' }
      ],
      mistakes: [
        'Dùng Lambda rồi để hai bản logic trôi dạt khỏi nhau.',
        'Áp Data Mesh cho tổ chức nhỏ vì nghe hiện đại.',
        'Chọn Kappa khi đội chưa từng vận hành hệ thống streaming.'
      ],
      check: [
        ['Trả lời câu hỏi đầu bài.', 'Thường là số batch cuối ngày, vì nó tính trên dữ liệu đã đến đủ. Nhưng câu hỏi quan trọng hơn là vì sao lệch: sự kiện đến trễ, hai bản logic khác nhau, hay cách khử trùng khác nhau. Và người dùng cần được biết trước số real-time là số tạm.'],
        ['Data Mesh giải bài toán gì và khi nào không nên dùng?', 'Giải nút cổ chai của đội dữ liệu trung tâm ở tổ chức lớn bằng cách giao quyền sở hữu cho các miền. Không nên dùng khi tổ chức nhỏ, hoặc khi chưa có nền tảng tự phục vụ và chuẩn quản trị chung.']
      ],
      cards: [
        ['Kiến trúc Lambda gồm gì?', 'Lớp batch (chính xác, chậm), lớp speed (nhanh, gần đúng), lớp phục vụ ghép hai kết quả.'],
        ['Điểm yếu chính của Lambda?', 'Cùng một logic phải viết và bảo trì hai lần trên hai hệ thống, khó giữ khớp.'],
        ['Kiến trúc Kappa là gì?', 'Chỉ có một đường streaming; dữ liệu giữ trong log; tính lại bằng cách phát lại log qua cùng đoạn code.'],
        ['Bốn nguyên tắc của Data Mesh?', 'Miền tự sở hữu dữ liệu, dữ liệu là sản phẩm, nền tảng tự phục vụ, quản trị liên miền.'],
        ['Định luật Conway nói gì?', 'Hệ thống có hình dạng giống cấu trúc giao tiếp của tổ chức tạo ra nó.']
      ]
    },
    {
      id: '5-3', min: 8,
      title: 'Nguyên tắc của một kiến trúc tốt',
      hook: 'Hai năm trước bạn chọn công cụ X. Giờ nó ngừng phát triển. Thay nó mất hai tuần hay hai năm? Câu trả lời đã được quyết định từ hai năm trước.',
      core: [
        'Kiến trúc tốt không phải là kiến trúc dùng công nghệ mới nhất. Nó là kiến trúc **phục vụ được yêu cầu hôm nay và thay đổi được khi yêu cầu đổi**.',
        { h: 'Cửa hai chiều và cửa một chiều' },
        'Có những quyết định dễ quay lại (cửa hai chiều): chọn công cụ dashboard, đặt tên bảng. Có những quyết định gần như không quay lại được (cửa một chiều): chọn nhà cung cấp cloud, định dạng lưu toàn bộ dữ liệu, partition key của bảng nghìn tỷ dòng.',
        { tip: 'Quyết định hai chiều: **làm nhanh**, sai thì sửa. Quyết định một chiều: **làm chậm, hỏi nhiều người**. Và việc đáng làm nhất là biến cửa một chiều thành hai chiều bằng cách thiết kế cho dễ thay.' },
        { h: 'Gắn lỏng' },
        { fig: 'coupling', cap: 'Cùng ba khâu xử lý. Khác nhau ở chỗ điều gì xảy ra khi khâu giữa hỏng.' },
        'Hệ thống gắn lỏng (loosely coupled) là hệ thống mà mỗi phần giao tiếp với phần khác qua một **giao diện ổn định**: một bảng có schema đã cam kết, một hàng đợi, một API. Bên trong mỗi phần đổi thế nào cũng được, miễn giao diện giữ nguyên.',
        { h: 'Các nguyên tắc khác' },
        { ul: [
          '**Tính trước chuyện hỏng**: mọi thứ sẽ hỏng. Hỏng thì mất bao lâu để phục hồi (RTO) và chấp nhận mất bao nhiêu dữ liệu (RPO)?',
          '**Co giãn được**: lên khi tải tăng, xuống khi tải giảm, về không khi không ai dùng.',
          '**Bảo mật từ đầu**: không phải lớp sơn phủ sau cùng.',
          '**Tính tới tiền**: chi phí là một yêu cầu thiết kế như mọi yêu cầu khác.',
          '**Kiến trúc là việc liên tục**: không có bản vẽ cuối cùng.'
        ] }
      ],
      deep: [
        'Mẫu **strangler** để thay hệ thống cũ: không đập đi xây lại. Dựng cái mới bên cạnh, chuyển dần từng phần, chạy song song và đối chiếu kết quả, rồi tắt phần cũ tương ứng. Chậm hơn nhưng lúc nào cũng có đường lùi và giá trị được giao dần.',
        'Gắn lỏng có giá: thêm thành phần, thêm độ trễ, khó lần theo một bản ghi đi qua hệ thống. Dữ liệu vốn có xu hướng tập trung (một kho chung), nên đừng tách vì thích tách. Tách ở chỗ hai phần **thay đổi với nhịp khác nhau** hoặc **thuộc hai đội khác nhau**.',
        '**Monolith phân tán** là kết quả tệ nhất: tách ra nhiều dịch vụ nhưng chúng vẫn phải triển khai cùng lúc và hỏng cùng nhau. Chịu đủ độ phức tạp của phân tán mà không được lợi ích nào.',
        { warn: 'RTO và RPO phải do nghiệp vụ quyết định, không phải do kỹ thuật tự đặt. "Không được mất gì, không được ngừng giây nào" có giá rất đắt; hỏi lại người yêu cầu xem họ có sẵn lòng trả không.' }
      ],
      mistakes: [
        'Dồn hết thời gian cân nhắc quyết định hai chiều, rồi quyết vội quyết định một chiều.',
        'Để các pipeline đọc thẳng bảng nội bộ của nhau, không qua giao diện đã cam kết.',
        'Viết lại toàn bộ hệ thống cũ trong một lần.'
      ],
      check: [
        ['Cho ba ví dụ về quyết định một chiều trong hệ thống dữ liệu.', 'Chọn nhà cung cấp cloud chính; định dạng và cách partition của kho dữ liệu lịch sử lớn; định nghĩa khóa định danh khách hàng dùng chung toàn công ty.'],
        ['Làm sao biến lựa chọn engine truy vấn từ một chiều thành hai chiều?', 'Lưu dữ liệu ở định dạng mở trên object storage và dùng SQL chuẩn. Khi đó engine chỉ là lớp tính toán thay được, dữ liệu không bị nhốt trong nó.']
      ],
      cards: [
        ['Quyết định hai chiều và một chiều?', 'Hai chiều: dễ đảo ngược, nên làm nhanh. Một chiều: khó đảo ngược, cần cân nhắc kỹ.'],
        ['Gắn lỏng (loose coupling) là gì?', 'Các phần giao tiếp qua giao diện ổn định, nên mỗi phần thay đổi và hỏng độc lập.'],
        ['RTO và RPO?', 'RTO: thời gian ngừng tối đa chấp nhận được. RPO: lượng dữ liệu mất tối đa chấp nhận được.'],
        ['Mẫu strangler là gì?', 'Thay hệ thống cũ dần từng phần, chạy song song và đối chiếu, thay vì viết lại tất cả một lần.'],
        ['Monolith phân tán là gì?', 'Hệ thống tách thành nhiều phần nhưng vẫn phải triển khai và hỏng cùng nhau: chịu độ phức tạp mà không có lợi ích.'],
        ['Kiến trúc trước hay công cụ trước?', 'Kiến trúc trước (cái gì, vì sao, khi nào); công cụ là cách thực hiện và phải thay được.']
      ]
    }
  ]
});
