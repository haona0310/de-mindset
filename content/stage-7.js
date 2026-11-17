DE.addStage({
  id: 's7', n: 7,
  title: 'Chi phí, lựa chọn công nghệ và bảo mật',
  goal: 'Tiền và rủi ro là **yêu cầu thiết kế**, ngang hàng với tốc độ và tính năng.',
  lessons: [
    {
      id: '7-1', min: 8, sim: 'cost',
      title: 'FinOps: tiền đi đâu',
      hook: 'Một analyst viết một câu truy vấn, bấm chạy, đi ăn trưa. Câu truy vấn đó tốn 40 triệu đồng. Không ai phạm quy định nào cả.',
      core: [
        'Trên cloud, bạn không mua máy; bạn trả theo mức dùng. Điều đó nghĩa là **mỗi dòng code đều có giá**, và hóa đơn là hệ quả trực tiếp của các quyết định thiết kế.',
        { fig: 'cost', cap: 'Lưu trữ thường là phần nhỏ. Tính toán và công người mới là phần lớn.' },
        { ul: [
          '**Lưu trữ**: rẻ, tính theo GB mỗi tháng. Hiếm khi là vấn đề.',
          '**Tính toán**: tính theo thời gian máy chạy hoặc theo lượng dữ liệu quét. Thường là phần lớn nhất của hóa đơn.',
          '**Truyền dữ liệu ra ngoài (egress)**: đưa dữ liệu vào cloud thường miễn phí, lấy ra thì tính tiền. Đây là thứ giữ chân bạn ở lại.',
          '**Công người**: thời gian kỹ sư vận hành và sửa lỗi. Thường lớn hơn cả hóa đơn cloud và hay bị bỏ quên.'
        ] },
        'Trong chuyện đầu bài, kho tính tiền theo lượng dữ liệu quét, bảng không được partition, và câu truy vấn viết [[SELECT *]] không có điều kiện ngày. Nó quét toàn bộ lịch sử. Lỗi không phải của analyst; lỗi là hệ thống cho phép điều đó xảy ra dễ như vậy.',
        { tip: 'Ba câu hỏi về chi phí cho mọi thiết kế: **mỗi lần chạy đọc bao nhiêu dữ liệu, chạy bao nhiêu lần, và có cách nào đọc ít hơn không**. Tiết kiệm lớn nhất gần như luôn đến từ việc đọc ít đi.' },
        { h: 'Các đòn bẩy chính' },
        { ul: [
          'Partition theo cột hay lọc, và buộc truy vấn phải có điều kiện lọc.',
          'Định dạng cột có nén; chỉ chọn cột cần dùng.',
          'Tính sẵn các bảng tổng hợp cho dashboard, thay vì mỗi lần mở lại quét dữ liệu chi tiết.',
          'Tắt máy khi không dùng; tự co giãn theo tải.',
          'Chuyển dữ liệu nguội sang tầng lưu trữ rẻ hơn; xóa thứ không ai cần.'
        ] }
      ],
      deep: [
        '**TCO** (tổng chi phí sở hữu) gồm chi phí trực tiếp (hóa đơn, bản quyền) và gián tiếp (người vận hành, đào tạo, thời gian ngừng). Một công cụ miễn phí cần hai kỹ sư toàn thời gian để vận hành thì không miễn phí.',
        '**Chi phí cơ hội**: chọn công nghệ này là từ bỏ khả năng dùng công nghệ khác, và càng đầu tư sâu càng khó rời. Dữ liệu có "trọng lực": dữ liệu nằm đâu thì dịch vụ kéo về đó. Ưu tiên định dạng mở và các phần thay được để giữ đường lui.',
        'FinOps là việc liên tục, không phải đợt cắt giảm: gắn nhãn chi phí theo đội và theo pipeline để biết ai tiêu gì; đặt ngân sách và cảnh báo; giới hạn cứng cho mỗi truy vấn; xem lại định kỳ những bảng và job không ai dùng. Mục tiêu không phải tiêu ít nhất mà là **mỗi đồng tiêu ra mang lại giá trị xứng đáng**.',
        { warn: 'Tối ưu chi phí cũng có chi phí. Dành hai tuần kỹ sư để tiết kiệm 500 nghìn mỗi tháng là lỗ. Đo trước, sửa chỗ tốn nhất trước.' }
      ],
      mistakes: [
        'Chỉ nhìn giá lưu trữ khi so sánh giải pháp.',
        'Dashboard tự làm mới mỗi phút trên bảng chi tiết nghìn tỷ dòng.',
        'Không gắn chi phí với người gây ra nó, nên không ai có lý do để tối ưu.'
      ],
      check: [
        ['Ba thay đổi nào ngăn được chuyện ở đầu bài?', 'Partition bảng theo ngày và bắt buộc có điều kiện lọc partition; đặt giới hạn lượng dữ liệu tối đa mỗi truy vấn; cho analyst dùng bảng tổng hợp sẵn thay vì bảng chi tiết.'],
        ['Vì sao phí egress quan trọng với quyết định kiến trúc?', 'Nó làm việc chuyển dữ liệu ra khỏi nhà cung cấp trở nên đắt, tạo sự phụ thuộc. Kiến trúc đa cloud hoặc xử lý ở nơi khác với nơi lưu phải tính phí này vào.']
      ],
      cards: [
        ['Bốn nhóm chi phí của nền tảng dữ liệu?', 'Lưu trữ, tính toán, truyền dữ liệu ra ngoài (egress), công người vận hành.'],
        ['Ba câu hỏi chi phí cho mọi thiết kế?', 'Mỗi lần chạy đọc bao nhiêu dữ liệu, chạy bao nhiêu lần, có cách nào đọc ít hơn.'],
        ['TCO là gì?', 'Tổng chi phí sở hữu: chi phí trực tiếp cộng gián tiếp (người vận hành, đào tạo, thời gian ngừng).'],
        ['Egress là gì và vì sao đáng để ý?', 'Phí truyền dữ liệu ra khỏi cloud. Nó làm việc rời đi hoặc dùng đa cloud trở nên đắt.'],
        ['Đòn bẩy tiết kiệm lớn nhất thường là gì?', 'Đọc ít dữ liệu hơn: partition, chọn cột, bảng tổng hợp sẵn.'],
        ['Mục tiêu của FinOps?', 'Mỗi đồng tiêu ra mang lại giá trị xứng đáng, không phải tiêu ít nhất bằng mọi giá.']
      ]
    },
    {
      id: '7-2', min: 7,
      title: 'Tự xây hay mua: cách chọn công nghệ',
      hook: 'Đội bạn có bốn người. Một người đề xuất tự viết hệ thống điều phối riêng "vì công cụ có sẵn không hợp lắm". Bạn nói gì?',
      core: [
        'Mỗi thành phần của hệ thống có thể lấy theo nhiều cách, khác nhau ở mức bạn kiểm soát và mức bạn phải tự lo.',
        { fig: 'build-buy', cap: 'Bốn điểm trên một trục. Không có điểm nào tốt nhất cho mọi thành phần.' },
        'Quy tắc gốc: **chỉ tự xây thứ tạo ra lợi thế cạnh tranh cho công ty**. Mọi thứ còn lại là việc nặng nhọc không tạo khác biệt; hãy dùng thứ có sẵn. Một hệ thống điều phối tự viết không làm công ty bán được nhiều hàng hơn; thuật toán gợi ý sản phẩm thì có thể.',
        { tip: 'Thời gian của đội là tài nguyên khan hiếm nhất. Mỗi giờ dành để vận hành hạ tầng là một giờ không dành cho bài toán của doanh nghiệp. Câu hỏi không phải "ta có làm được không" mà là **"đây có phải việc đáng để ta làm không"**.' },
        { h: 'Câu hỏi khi đánh giá một công nghệ' },
        { ul: [
          'Nó giải bài toán nào **mà ta thật sự đang có**?',
          'Đội có vận hành nổi không, kể cả lúc 3 giờ sáng?',
          'Tổng chi phí là bao nhiêu khi tính cả người?',
          'Cộng đồng và nhà cung cấp có còn đó sau ba năm?',
          'Nếu phải bỏ nó thì khó tới mức nào?',
          'Nó có hợp với những thứ ta đã có không?'
        ] }
      ],
      deep: [
        'Mã nguồn mở có hai dạng rất khác nhau về rủi ro: do cộng đồng quản lý (nhiều công ty cùng đóng góp, khó bị một bên đổi hướng) và do một công ty kiểm soát (có thể đổi giấy phép, đẩy tính năng quan trọng vào bản trả tiền). Xem ai thực sự viết code và ai quyết định lộ trình.',
        'Tự vận hành mã nguồn mở nghĩa là nhận về: nâng cấp, vá bảo mật, sao lưu, giám sát, mở rộng, và trực đêm. Dịch vụ managed của chính công cụ đó thường đắt hơn trên hóa đơn nhưng rẻ hơn khi tính cả người, cho tới khi quy mô rất lớn.',
        'Chạy đa cloud để "tránh phụ thuộc" thường có giá cao hơn chính sự phụ thuộc: chỉ dùng được mẫu số chung nhỏ nhất, vận hành gấp đôi, trả phí truyền dữ liệu qua lại. Cách giữ đường lui rẻ hơn: định dạng dữ liệu mở, SQL chuẩn, hạ tầng mô tả bằng code.',
        { warn: 'Phát triển theo hồ sơ xin việc (resume-driven development): chọn công nghệ vì nó đẹp trong CV chứ không vì bài toán cần. Dấu hiệu: không ai trả lời được công nghệ mới giải quyết vấn đề gì mà cái hiện tại không giải quyết được.' }
      ],
      mistakes: [
        'Tự xây thứ mà thị trường đã có sẵn với giá rẻ hơn lương một kỹ sư.',
        'Chọn công cụ theo độ nổi tiếng thay vì theo bài toán và năng lực của đội.',
        'Thêm công cụ mới mà không bỏ công cụ cũ, để số thứ phải vận hành tăng mãi.'
      ],
      check: [
        ['Trả lời tình huống đầu bài.', 'Hỏi: cụ thể không hợp ở điểm nào, và điểm đó đáng giá bao nhiêu so với việc một phần tư đội phải xây và bảo trì hệ thống điều phối mãi mãi? Gần như chắc chắn nên dùng công cụ có sẵn và chấp nhận vài chỗ chưa vừa ý.'],
        ['Khi nào tự xây là hợp lý?', 'Khi thành phần đó là lợi thế cạnh tranh cốt lõi, khi không có sản phẩm nào đáp ứng được yêu cầu thật, và khi đội có đủ người để nuôi nó lâu dài.']
      ],
      cards: [
        ['Quy tắc gốc của tự xây hay mua?', 'Chỉ tự xây thứ tạo ra lợi thế cạnh tranh; còn lại dùng thứ có sẵn.'],
        ['Tự vận hành mã nguồn mở nghĩa là nhận thêm việc gì?', 'Nâng cấp, vá bảo mật, sao lưu, giám sát, mở rộng và trực sự cố.'],
        ['Cách giữ đường lui rẻ hơn đa cloud?', 'Định dạng dữ liệu mở, SQL chuẩn, hạ tầng mô tả bằng code.'],
        ['Resume-driven development là gì?', 'Chọn công nghệ vì nó đẹp trong CV chứ không vì bài toán cần.'],
        ['Tài nguyên khan hiếm nhất của đội dữ liệu?', 'Thời gian và sự tập trung của con người.']
      ]
    },
    {
      id: '7-3', min: 8,
      title: 'Bảo mật, dữ liệu cá nhân và quản trị',
      hook: 'Một thực tập sinh tải bảng khách hàng về máy để "phân tích cho tiện". Trong bảng có số điện thoại và địa chỉ của hai triệu người. Hệ thống nào đã cho phép chuyện đó?',
      core: [
        'DE là người tập trung dữ liệu của cả công ty về một chỗ. Điều đó tạo ra giá trị, và cũng tạo ra **mục tiêu hấp dẫn nhất** cho rò rỉ. Bảo mật là trách nhiệm của bạn, không phải của một phòng nào khác.',
        'Thứ tự ưu tiên: **con người, rồi quy trình, rồi công nghệ**. Phần lớn sự cố bắt đầu từ một người bị lừa, một mật khẩu dùng chung, một quyền cấp rộng "cho nhanh", chứ không phải từ thuật toán mã hóa bị phá.',
        { h: 'Quyền tối thiểu' },
        { fig: 'least-priv', cap: 'Cùng một bảng, hai mức quyền. Phần lớn công việc phân tích không cần thấy thông tin định danh.' },
        '**Nguyên tắc quyền tối thiểu**: mỗi người và mỗi dịch vụ chỉ có đúng quyền cần cho việc đang làm, trong đúng khoảng thời gian cần. Áp dụng cho cả tài khoản của pipeline, không chỉ tài khoản người.',
        { ul: [
          'Cấp quyền theo **vai trò**, không cấp lẻ cho từng người.',
          'Kiểm soát tới mức **cột và dòng**: che cột nhạy cảm, lọc dòng theo phạm vi được xem.',
          'Quyền cao là quyền **tạm thời**, có lý do, có nhật ký.',
          'Mã hóa khi lưu và khi truyền. Mật khẩu và khóa không bao giờ nằm trong code.'
        ] },
        { tip: 'Cách bảo vệ dữ liệu nhạy cảm tốt nhất là **không giữ nó**. Trước khi thu nạp một cột chứa thông tin cá nhân, hỏi: phía sau có ai thật sự cần nó không? Không thì đừng lấy.' },
        '**PII** (thông tin định danh cá nhân) là dữ liệu chỉ ra được một người cụ thể: tên, số điện thoại, email, số giấy tờ, địa chỉ, và cả những tổ hợp tưởng vô hại như ngày sinh cộng mã bưu chính.'
      ],
      deep: [
        'Các kỹ thuật giảm rủi ro với PII: **che** (hiện một phần), **băm** (thay bằng mã một chiều, vẫn join được), **mã hóa có khóa** (khôi phục được khi có quyền), **tổng hợp** (chỉ giữ số liệu nhóm). Băm một số điện thoại không đủ an toàn nếu không thêm muối bí mật, vì không gian giá trị nhỏ và dò ngược được.',
        'Luật bảo vệ dữ liệu cá nhân (GDPR ở châu Âu, và các quy định tương tự ở nhiều nước, trong đó có Việt Nam) cho người dùng quyền yêu cầu xóa dữ liệu của họ. Với kho dữ liệu chỉ ghi thêm và giữ mọi phiên bản, đây là bài toán thiết kế thật sự: phải biết dữ liệu của một người nằm ở những bảng nào, những bản sao lưu nào, và xóa được nó. Lineage và catalog là điều kiện cần.',
        '**Quản trị dữ liệu** trả lời: dữ liệu này là gì, của ai, tin được tới đâu, ai được dùng, giữ bao lâu. Công cụ trung tâm là **catalog**: nơi tìm được bảng, đọc được định nghĩa, biết ai sở hữu và mức nhạy cảm. Không có nó, người dùng không tìm thấy dữ liệu và tự tạo bản sao riêng.',
        { warn: '**Bảo mật trình diễn**: bộ quy định trăm trang không ai đọc, chứng nhận treo tường, trong khi mật khẩu CSDL vẫn nằm trong một file chia sẻ. Đo bảo mật bằng những gì thật sự bị chặn, không bằng số tài liệu.' }
      ],
      mistakes: [
        'Cấp quyền quản trị cho cả đội "để đỡ vướng".',
        'Sao chép dữ liệu production có PII sang môi trường thử nghiệm.',
        'Thu thập mọi cột từ nguồn mà không phân loại mức nhạy cảm.'
      ],
      check: [
        ['Những lớp bảo vệ nào lẽ ra chặn được chuyện đầu bài?', 'Thực tập sinh không có quyền với bảng gốc, chỉ với bản đã che PII; cột nhạy cảm bị che theo vai trò; giới hạn và ghi nhật ký việc xuất dữ liệu lớn; và ngay từ đầu, kho phân tích không cần chứa số điện thoại ở dạng rõ.'],
        ['Vì sao quyền xóa dữ liệu cá nhân là bài toán kiến trúc?', 'Vì dữ liệu của một người nằm rải ở nhiều bảng, nhiều tầng, nhiều phiên bản và bản sao lưu. Phải thiết kế từ đầu để biết nó ở đâu và xóa được, không thể vá sau.']
      ],
      cards: [
        ['Nguyên tắc quyền tối thiểu?', 'Mỗi người và dịch vụ chỉ có đúng quyền cần cho việc đang làm, trong khoảng thời gian cần.'],
        ['Thứ tự ưu tiên trong bảo mật?', 'Con người, quy trình, rồi mới tới công nghệ.'],
        ['PII là gì?', 'Thông tin định danh cá nhân: dữ liệu, hoặc tổ hợp dữ liệu, chỉ ra được một người cụ thể.'],
        ['Cách bảo vệ dữ liệu nhạy cảm tốt nhất?', 'Không thu thập và không lưu nếu không có nhu cầu thật.'],
        ['Catalog dữ liệu để làm gì?', 'Nơi tìm bảng, đọc định nghĩa, biết người sở hữu, mức nhạy cảm và nguồn gốc.'],
        ['Bảo mật trình diễn là gì?', 'Hình thức bảo mật (quy định dày, chứng nhận) mà không thật sự chặn được rủi ro.']
      ]
    }
  ]
});
