DE.addStage({
  id: 's4', n: 4,
  title: 'Mô hình hóa dữ liệu',
  goal: 'Mô hình dữ liệu là **cách doanh nghiệp tự mô tả mình**. Bỏ qua nó thì có hồ dữ liệu cũng chỉ là đầm lầy.',
  lessons: [
    {
      id: '4-1', min: 9,
      title: 'Grain và star schema',
      hook: 'Join bảng đơn hàng với bảng sản phẩm trong đơn, cộng tổng tiền, và doanh thu bỗng gấp ba lần thực tế. Sai ở đâu?',
      core: [
        'Trước khi tạo bất kỳ bảng nào, phải trả lời được một câu: **mỗi dòng của bảng này đại diện cho cái gì?** Câu trả lời gọi là **grain** (độ hạt).',
        { ul: [
          'Bảng đơn hàng: mỗi dòng là **một đơn hàng**.',
          'Bảng chi tiết đơn: mỗi dòng là **một sản phẩm trong một đơn**.',
          'Bảng tồn kho cuối ngày: mỗi dòng là **một sản phẩm tại một kho trong một ngày**.'
        ] },
        'Lỗi ở đầu bài là trộn hai grain: đơn có 3 sản phẩm thì sau khi join, tổng tiền của đơn lặp lại 3 lần. Phần lớn lỗi số liệu "gấp đôi, gấp ba" có cùng nguyên nhân này.',
        { tip: 'Viết grain thành một câu trước khi viết SQL. Nếu không viết được trong một câu, bảng đó chưa được thiết kế.' },
        { h: 'Star schema' },
        'Cách tổ chức phổ biến nhất cho phân tích, do Ralph Kimball phổ biến, chia bảng làm hai loại:',
        { fig: 'star', cap: 'Bảng fact ở giữa chứa con số; các bảng dimension xung quanh chứa ngữ cảnh để lọc và nhóm.' },
        { ul: [
          '**Bảng fact (sự kiện)**: ghi lại những gì đã xảy ra và đo được: số lượng, số tiền, thời lượng. Dài, hẹp, rất nhiều dòng.',
          '**Bảng dimension (chiều)**: mô tả ai, cái gì, ở đâu, khi nào. Ngắn, rộng, nhiều cột mô tả.'
        ] },
        'Mọi câu hỏi kinh doanh có dạng: **đo cái gì** (fact) **theo cái gì** (dimension). "Doanh thu theo tỉnh theo tháng" là cộng một cột của fact, nhóm theo hai dimension.'
      ],
      deep: [
        'Chọn grain **mịn nhất có thể**. Từ chi tiết luôn tổng hợp lên được; từ tổng hợp không bao giờ chia ngược lại được. Lưu trữ rẻ, mất chi tiết thì không mua lại được.',
        '**Conformed dimension** (dimension dùng chung): một bảng khách hàng duy nhất dùng cho mọi bảng fact. Nhờ đó doanh thu và số cuộc gọi hỗ trợ có thể đặt cạnh nhau theo cùng một định nghĩa "khách hàng". Đây là thứ biến một đống bảng thành một kho thống nhất.',
        'Ba loại fact: **giao dịch** (mỗi dòng một sự kiện), **snapshot định kỳ** (trạng thái tại các mốc đều nhau, như tồn kho cuối ngày), **snapshot tích lũy** (một dòng theo dõi cả quá trình, như đơn hàng từ đặt tới giao). Số dư và tồn kho không cộng theo thời gian được; cộng tồn kho 30 ngày ra một con số vô nghĩa.',
        { warn: 'Dùng **khóa thay thế** (surrogate key, một số tự sinh) cho dimension thay vì khóa của hệ thống nguồn. Khóa nguồn có thể bị tái sử dụng, đổi định dạng, hoặc trùng khi gộp hai hệ thống.' }
      ],
      mistakes: [
        'Trộn grain trong một bảng hoặc khi join.',
        'Lưu sẵn dữ liệu đã tổng hợp theo tháng, rồi không trả lời được câu hỏi theo tuần.',
        'Nhét cột mô tả vào bảng fact, khiến nó vừa rộng vừa khó sửa.'
      ],
      check: [
        ['Sửa lỗi doanh thu gấp ba ở đầu bài thế nào?', 'Tính tiền ở đúng grain: hoặc cộng từ bảng chi tiết (số lượng nhân đơn giá từng dòng), hoặc tổng hợp bảng chi tiết về grain đơn hàng trước khi join.'],
        ['Vì sao không cộng được tồn kho của 30 ngày?', 'Tồn kho là số đo tại một thời điểm. Cùng một món hàng nằm trong kho 30 ngày sẽ bị đếm 30 lần. Với số đo kiểu này phải lấy trung bình hoặc giá trị cuối kỳ.']
      ],
      cards: [
        ['Grain của một bảng là gì?', 'Điều mà mỗi dòng của bảng đại diện, ví dụ "một sản phẩm trong một đơn hàng".'],
        ['Bảng fact chứa gì?', 'Các sự kiện đã xảy ra cùng số đo của chúng (số lượng, số tiền) và khóa trỏ tới các dimension.'],
        ['Bảng dimension chứa gì?', 'Ngữ cảnh mô tả để lọc và nhóm: ai, cái gì, ở đâu, khi nào.'],
        ['Vì sao chọn grain mịn nhất?', 'Từ chi tiết tổng hợp lên được, từ tổng hợp không chia ngược lại được.'],
        ['Conformed dimension là gì?', 'Một dimension dùng chung cho nhiều bảng fact, giúp so sánh các chỉ số theo cùng một định nghĩa.'],
        ['Dấu hiệu của lỗi trộn grain?', 'Con số tổng bị nhân lên gấp đôi, gấp ba sau khi join.']
      ]
    },
    {
      id: '4-2', min: 7,
      title: 'Lịch sử thay đổi: Slowly Changing Dimensions',
      hook: 'Khách hàng chuyển từ Hà Nội vào Đà Nẵng tháng 7. Doanh thu của họ từ tháng 1 đến tháng 6 nên tính cho thành phố nào?',
      core: [
        'Thông tin mô tả thay đổi theo thời gian: khách đổi địa chỉ, sản phẩm đổi nhóm, nhân viên đổi phòng. Cách xử lý thay đổi này quyết định báo cáo lịch sử có đúng hay không. Các cách xử lý có tên chung là **SCD (Slowly Changing Dimension)**.',
        { table: [
          ['Kiểu', 'Cách làm', 'Kết quả'],
          ['Type 1', 'Ghi đè giá trị cũ', 'Mất lịch sử. Doanh thu cũ nhảy hết sang Đà Nẵng.'],
          ['Type 2', 'Đóng dòng cũ, thêm dòng mới có khoảng hiệu lực', 'Giữ đủ lịch sử. Doanh thu cũ vẫn ở Hà Nội.'],
          ['Type 3', 'Thêm cột "giá trị trước đó"', 'Chỉ giữ được một lần thay đổi gần nhất.']
        ] },
        { fig: 'scd2', cap: 'SCD Type 2: một khách hàng, hai dòng, mỗi dòng đúng trong một khoảng thời gian.' },
        'Với Type 2, mỗi đơn hàng trỏ tới **đúng phiên bản** của khách hàng tại thời điểm mua. Báo cáo quá khứ không thay đổi khi hiện tại thay đổi.',
        { tip: 'Câu hỏi để chọn kiểu: nghiệp vụ muốn nhìn quá khứ **theo sự thật lúc đó** hay **theo sự thật bây giờ**? Cả hai đều hợp lý tùy trường hợp. Hỏi người dùng, đừng tự đoán.' },
        'Type 1 hợp cho việc sửa lỗi (tên gõ sai). Type 2 hợp cho thay đổi thật có ý nghĩa phân tích. Một bảng có thể dùng Type 1 cho cột này và Type 2 cho cột khác.'
      ],
      deep: [
        'Type 2 cần **nguồn cho thấy thay đổi**. Nếu nguồn chỉ giữ trạng thái hiện tại và bạn chụp snapshot mỗi đêm, bạn chỉ bắt được thay đổi với độ chính xác theo ngày, và bỏ lỡ nếu một giá trị đổi hai lần trong ngày. CDC cho độ chính xác tốt hơn.',
        'Cách đơn giản hơn ngày càng được dùng: **chụp snapshot toàn bộ dimension mỗi ngày** và giữ lại hết. Tốn chỗ hơn Type 2 nhưng logic đơn giản đến mức khó sai, và lưu trữ thì rẻ. Truy vấn chỉ cần join theo ngày.',
        'Join với bảng Type 2 phải có điều kiện thời gian: ngày của sự kiện nằm trong khoảng hiệu lực của dòng dimension. Quên điều kiện này là lại gặp lỗi nhân dòng của bài trước.',
        { warn: 'Dữ liệu đến trễ làm khó Type 2: một thay đổi của tuần trước hôm nay mới tới, phải chèn vào giữa lịch sử và sửa lại khoảng hiệu lực của các dòng xung quanh.' }
      ],
      mistakes: [
        'Mặc định ghi đè mọi thứ, rồi không giải thích được vì sao báo cáo năm ngoái đổi số.',
        'Dùng Type 2 cho cột thay đổi liên tục (như số dư), làm bảng phình vô hạn.',
        'Join bảng Type 2 mà quên điều kiện khoảng hiệu lực.'
      ],
      check: [
        ['Trả lời câu hỏi đầu bài.', 'Tùy mục đích. Xem hiệu quả của từng thị trường theo thời gian: tính cho Hà Nội (Type 2). Xem danh sách khách hiện tại của chi nhánh Đà Nẵng đã mua bao nhiêu từ trước tới nay: tính cho Đà Nẵng (Type 1 hoặc join với phiên bản hiện tại).'],
        ['Vì sao snapshot hằng ngày là lựa chọn đáng cân nhắc thay cho Type 2?', 'Logic đơn giản, khó sai, dễ tính lại; chi phí là lưu trữ, vốn rẻ. Đổi lại chỉ có độ chính xác theo ngày.']
      ],
      cards: [
        ['SCD Type 1 làm gì?', 'Ghi đè giá trị cũ bằng giá trị mới; không giữ lịch sử.'],
        ['SCD Type 2 làm gì?', 'Thêm dòng mới cho mỗi thay đổi, kèm khoảng thời gian hiệu lực; giữ đủ lịch sử.'],
        ['SCD Type 3 làm gì?', 'Thêm cột lưu giá trị trước đó; chỉ giữ một lần thay đổi.'],
        ['Khi join với bảng SCD Type 2 phải nhớ gì?', 'Thêm điều kiện ngày của sự kiện nằm trong khoảng hiệu lực của dòng dimension.'],
        ['Khi nào dùng Type 1 thay vì Type 2?', 'Khi thay đổi là sửa lỗi, hoặc khi nghiệp vụ muốn nhìn quá khứ theo giá trị hiện tại.']
      ]
    },
    {
      id: '4-3', min: 8,
      title: 'Các trường phái khác: Inmon, Data Vault, bảng rộng, medallion',
      hook: 'Kho dữ liệu lưu rẻ, tính nhanh. Vậy còn cần mô hình hóa cẩn thận không, hay cứ gom hết vào một bảng thật rộng?',
      core: [
        'Star schema không phải cách duy nhất. Mỗi trường phái tối ưu cho một ưu tiên khác.',
        { table: [
          ['Trường phái', 'Ý chính', 'Mạnh', 'Yếu'],
          ['Inmon', 'Một kho trung tâm chuẩn hóa (3NF), rồi tạo các kho con theo phòng ban', 'Một nguồn sự thật, ít dư thừa', 'Thiết kế trước rất lâu mới có kết quả'],
          ['Kimball', 'Xây dần từng star schema theo quy trình nghiệp vụ', 'Ra kết quả nhanh, người dùng dễ hiểu', 'Dư thừa; dễ lệch nếu thiếu dimension dùng chung'],
          ['Data Vault', 'Tách khóa (hub), quan hệ (link), thuộc tính (satellite); chỉ thêm, không sửa', 'Truy vết tốt, chịu được thay đổi nguồn', 'Rất nhiều bảng và join; cần thêm một tầng để người dùng đọc được'],
          ['Bảng rộng (One Big Table)', 'Join sẵn mọi thứ vào một bảng', 'Truy vấn đơn giản, nhanh trên kho cột', 'Khó bảo trì, định nghĩa lặp lại, dễ sai grain']
        ] },
        { h: 'Kiến trúc medallion' },
        'Một cách chia tầng phổ biến trên lakehouse, đặt tên theo huy chương:',
        { fig: 'medallion', cap: 'Ba tầng với ba trách nhiệm. Dữ liệu chỉ đi một chiều từ trái sang phải.' },
        'Medallion nói về **chất lượng tăng dần qua các tầng**, không nói tầng Gold phải mô hình theo kiểu gì. Bạn vẫn phải chọn: star schema, bảng rộng, hay kết hợp.',
        { tip: 'Cách kết hợp thực dụng thường gặp: tầng giữa mô hình cẩn thận (star schema, đúng grain, định nghĩa một lần), tầng trên cùng tạo vài bảng rộng join sẵn cho từng nhu cầu. Người dùng được sự đơn giản, bạn giữ được một nguồn sự thật.' }
      ],
      deep: [
        'Kho hiện đại nhanh đến mức join không còn là nỗi sợ như trước, và lưu theo cột khiến bảng rộng không còn tốn kém. Lý do kỹ thuật để mô hình hóa yếu đi; **lý do tổ chức vẫn nguyên**: mọi người cần cùng hiểu "khách hàng" là gì và "doanh thu" tính thế nào.',
        'Chuẩn hóa (1NF, 2NF, 3NF) nhằm bỏ dư thừa để mỗi sự thật chỉ nằm một chỗ: tốt cho hệ thống ghi nhiều. Phi chuẩn hóa chấp nhận lặp lại để đọc nhanh: tốt cho phân tích. Biết cả hai để hiểu dữ liệu nguồn (thường chuẩn hóa) và thiết kế đích (thường phi chuẩn hóa).',
        'Data Vault đáng cân nhắc khi có nhiều hệ thống nguồn thay đổi thường xuyên và yêu cầu kiểm toán chặt (ngân hàng, bảo hiểm). Với một đội nhỏ và vài nguồn ổn định, nó là gánh nặng không cần thiết.',
        { warn: '**Data swamp** (đầm lầy dữ liệu): đổ mọi thứ vào data lake mà không mô hình, không danh mục, không người sở hữu. Dữ liệu có đó nhưng không ai tìm được, không ai tin. Lưu trữ rẻ làm cho việc tạo ra đầm lầy cũng rẻ.' }
      ],
      mistakes: [
        'Tranh luận trường phái thay vì hỏi người dùng cần truy vấn thế nào.',
        'Nghĩ medallion là mô hình dữ liệu và dừng ở việc đặt tên ba thư mục.',
        'Tạo bảng rộng trực tiếp từ dữ liệu thô, bỏ qua tầng mô hình ở giữa.'
      ],
      check: [
        ['Trả lời câu hỏi đầu bài.', 'Vẫn cần. Kho nhanh giải quyết hiệu năng, không giải quyết việc thống nhất định nghĩa. Bảng rộng nên là sản phẩm cuối tạo ra từ một tầng đã mô hình, không phải thay thế cho nó.'],
        ['Đội 3 người, 4 nguồn dữ liệu ổn định, cần báo cáo kinh doanh. Chọn cách nào?', 'Kimball: vài star schema theo quy trình nghiệp vụ chính, dimension dùng chung. Ra kết quả nhanh, dễ hiểu, đủ dùng. Data Vault hay Inmon là quá nặng cho quy mô này.']
      ],
      cards: [
        ['Inmon và Kimball khác nhau thế nào?', 'Inmon: thiết kế kho trung tâm chuẩn hóa trước, rồi tạo kho con. Kimball: xây dần từng star schema theo nghiệp vụ.'],
        ['Data Vault gồm ba loại bảng nào?', 'Hub (khóa nghiệp vụ), link (quan hệ), satellite (thuộc tính và lịch sử). Chỉ thêm, không sửa.'],
        ['Ba tầng của kiến trúc medallion?', 'Bronze (thô), Silver (đã làm sạch), Gold (theo nghiệp vụ, sẵn sàng dùng).'],
        ['Data swamp là gì?', 'Data lake không có mô hình, danh mục hay người sở hữu: dữ liệu có đó nhưng không tìm được và không tin được.'],
        ['Vì sao kho nhanh vẫn chưa thay được mô hình hóa?', 'Mô hình hóa còn để thống nhất định nghĩa nghiệp vụ, không chỉ để tăng tốc.'],
        ['Chuẩn hóa và phi chuẩn hóa hợp với việc gì?', 'Chuẩn hóa: hệ thống ghi nhiều, tránh dư thừa. Phi chuẩn hóa: phân tích, đọc nhanh.']
      ]
    }
  ]
});
