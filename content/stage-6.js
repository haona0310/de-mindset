DE.addStage({
  id: 's6', n: 6,
  title: 'Độ tin cậy: pipeline sống được ngoài đời thật',
  goal: 'Mọi thứ **sẽ hỏng**. Thiết kế để chạy lại được, phát hiện sớm được, và không làm sai số liệu trong im lặng.',
  lessons: [
    {
      id: '6-1', min: 8, sim: 'retry',
      title: 'Idempotency và backfill',
      hook: 'Pipeline lỗi giữa chừng lúc 3 giờ sáng. Hệ thống tự chạy lại. Sáng ra, doanh thu hôm qua cao gấp rưỡi bình thường. Không ai báo lỗi.',
      core: [
        'Một thao tác là **idempotent** khi chạy một lần hay nhiều lần đều cho cùng một kết quả. Bấm nút gọi thang máy năm lần, thang vẫn đến một lần: idempotent. Bấm "chuyển tiền" năm lần mà tiền đi năm lần: không idempotent.',
        { fig: 'idempotent', cap: 'Cùng một lần chạy lại, hai cách ghi cho hai kết quả.' },
        'Pipeline sẽ bị chạy lại: do lỗi mạng, do máy chết, do bạn sửa bug và muốn tính lại. Nếu chạy lại sinh dữ liệu trùng thì mỗi sự cố nhỏ biến thành một lần sai số liệu, như chuyện đầu bài.',
        { tip: 'Thiết kế mọi tác vụ sao cho câu hỏi **"chạy lại có an toàn không?"** luôn có câu trả lời là có. Khi đó xử lý sự cố chỉ còn một thao tác: chạy lại.' },
        { h: 'Ba cách làm cho việc ghi idempotent' },
        { ul: [
          '**Ghi đè theo partition**: mỗi lần chạy cho ngày nào thì thay toàn bộ dữ liệu của ngày đó. Đơn giản và chắc chắn nhất cho batch.',
          '**Upsert theo khóa** ([[MERGE]]): bản ghi đã có thì cập nhật, chưa có thì thêm. Cần một khóa duy nhất đáng tin.',
          '**Khử trùng khi đọc**: cứ ghi nối, mỗi bản ghi mang một mã định danh; nơi đọc chỉ lấy một bản cho mỗi mã.'
        ] },
        '**Backfill** là chạy lại pipeline cho dữ liệu quá khứ: khi sửa lỗi logic, thêm cột mới, hoặc nối thêm nguồn. Pipeline idempotent và nhận **ngày cần xử lý làm tham số** thì backfill chỉ là chạy lại nó cho từng ngày cũ.'
      ],
      deep: [
        'Idempotent chưa đủ; còn cần **nguyên tử**: hoặc ghi xong hết, hoặc như chưa ghi gì. Nếu job xóa partition cũ rồi chết trước khi ghi xong partition mới, người đọc thấy một ngày trống hoặc thiếu. Cách làm: ghi ra chỗ tạm rồi tráo vào một lần; table format làm điều này sẵn bằng commit trên metadata.',
        'Tác vụ phải **tất định**: cùng đầu vào thì cùng đầu ra. Dùng [[now()]] hay "hôm nay" bên trong logic khiến chạy lại ngày mai cho kết quả khác. Hãy truyền ngày logic của lần chạy từ ngoài vào, và đọc đầu vào theo đúng khoảng thời gian đó.',
        'Backfill lớn có rủi ro riêng: ngốn tài nguyên làm chậm việc hằng ngày; ghi đè lên dữ liệu mà người dùng đang đọc; logic mới chạy trên dữ liệu cũ có schema khác. Chạy thử trên một khoảng nhỏ, so với kết quả cũ, rồi mới chạy toàn bộ.',
        { warn: 'Tác dụng phụ ra bên ngoài (gửi email, gọi API thanh toán, đẩy sang CRM) không tự động idempotent dù bảng của bạn có idempotent. Cần khóa chống trùng ở phía nhận hoặc sổ ghi lại những gì đã gửi.' }
      ],
      mistakes: [
        'Dùng [[INSERT]] nối thêm cho job chạy theo lịch mà không có cơ chế chống trùng.',
        'Viết logic phụ thuộc vào thời điểm chạy thực tế thay vì ngày logic.',
        'Chạy backfill thẳng trên production mà không thử trước trên khoảng nhỏ.'
      ],
      check: [
        ['Vì sao trong chuyện đầu bài không ai báo lỗi?', 'Vì lần chạy lại thành công. Hệ thống điều phối thấy mọi thứ xanh. Dữ liệu trùng là lỗi về nội dung, chỉ phát hiện được bằng kiểm tra chất lượng (số dòng, khóa trùng, so với hôm trước).'],
        ['Job dùng "ngày hôm qua tính từ lúc chạy" có vấn đề gì khi backfill?', 'Chạy lại hôm nay cho một ngày của tháng trước, nó vẫn xử lý "hôm qua" theo đồng hồ hiện tại. Phải truyền ngày logic làm tham số.']
      ],
      cards: [
        ['Idempotent nghĩa là gì?', 'Chạy một lần hay nhiều lần đều cho cùng một kết quả.'],
        ['Ba cách ghi idempotent?', 'Ghi đè theo partition, upsert theo khóa (MERGE), ghi nối kèm khử trùng theo mã định danh.'],
        ['Backfill là gì?', 'Chạy lại pipeline cho dữ liệu quá khứ để sửa lỗi, thêm cột hoặc nạp nguồn mới.'],
        ['Ghi nguyên tử là gì và vì sao cần?', 'Hoặc ghi xong hết hoặc như chưa ghi. Tránh để người đọc thấy dữ liệu dở dang khi job chết giữa chừng.'],
        ['Vì sao không dùng now() trong logic pipeline?', 'Làm mất tính tất định: chạy lại vào lúc khác cho kết quả khác. Hãy truyền ngày logic từ ngoài vào.'],
        ['Tác dụng phụ ra ngoài cần gì để chạy lại an toàn?', 'Khóa chống trùng ở phía nhận hoặc sổ ghi những gì đã gửi.']
      ]
    },
    {
      id: '6-2', min: 8, sim: 'stream',
      title: 'Thời gian: event time, dữ liệu trễ và exactly-once',
      hook: 'Một người dùng bấm mua lúc 23:59 trên tàu điện ngầm. Điện thoại có mạng lại lúc 00:07. Đơn đó thuộc doanh thu ngày nào?',
      core: [
        'Mỗi sự kiện có ít nhất hai mốc thời gian, và chúng không bao giờ trùng nhau:',
        { ul: [
          '**Event time**: lúc sự việc thật sự xảy ra.',
          '**Processing time**: lúc hệ thống của bạn nhận và xử lý nó.'
        ] },
        { fig: 'event-time', cap: 'Sự kiện xảy ra trong cửa sổ 10:00 đến 10:05 nhưng tới nơi khi cửa sổ đã đóng.' },
        'Nghiệp vụ gần như luôn quan tâm tới event time: đơn ở đầu bài thuộc ngày hôm trước. Nhưng hệ thống chỉ biết chắc processing time. Khoảng cách giữa hai mốc là nơi sinh ra **dữ liệu trễ** (late data).',
        'Khi tính theo **cửa sổ thời gian** (ví dụ số đơn mỗi 5 phút), phải quyết định: chờ dữ liệu trễ bao lâu rồi mới chốt kết quả? Mốc "tôi tin rằng dữ liệu tới thời điểm này đã đến đủ" gọi là **watermark**.',
        { tip: 'Đây là đánh đổi không tránh được: **chờ lâu hơn thì chính xác hơn nhưng chậm hơn**. Không có cài đặt nào vừa tức thời vừa đủ. Việc của bạn là hỏi nghiệp vụ chịu được bên nào.' },
        { table: [
          ['Cách xử lý dữ liệu đến sau watermark', 'Hệ quả'],
          ['Bỏ qua', 'Đơn giản; kết quả thiếu một ít'],
          ['Cập nhật lại kết quả đã phát', 'Chính xác; nơi nhận phải chịu được số liệu thay đổi'],
          ['Đưa vào hàng riêng, xử lý bù theo batch', 'Chính xác sau cùng; thêm một nhánh phải vận hành']
        ] }
      ],
      deep: [
        'Batch cũng có dữ liệu trễ, chỉ là ít lộ hơn. Job đêm chạy lúc 1 giờ cho "ngày hôm qua" sẽ bỏ sót những sự kiện của hôm qua tới sau 1 giờ. Cách xử lý phổ biến: mỗi đêm tính lại vài ngày gần nhất (cửa sổ nhìn lại), nhờ pipeline idempotent nên tính lại không gây trùng.',
        '**Exactly-once** thường bị hiểu sai là "mỗi thông điệp chỉ được gửi một lần". Mạng không cho phép bảo đảm điều đó. Ý nghĩa thực tế là **hiệu ứng** của mỗi sự kiện chỉ xuất hiện một lần trong kết quả, đạt được bằng: gửi ít nhất một lần, cộng với khử trùng hoặc ghi idempotent, hoặc gộp việc ghi kết quả và ghi vị trí đã đọc vào chung một giao dịch.',
        'Thứ tự cũng không được bảo đảm trên toàn hệ thống. Hàng đợi phân mảnh chỉ giữ thứ tự **trong từng partition**. Nếu "tạo đơn" và "hủy đơn" của cùng một đơn đi vào hai partition khác nhau, bạn có thể thấy hủy trước tạo. Chọn key phân mảnh sao cho các sự kiện cần thứ tự đi cùng một partition.',
        { warn: 'Đồng hồ không đáng tin: đồng hồ thiết bị người dùng có thể lệch nhiều năm, đồng hồ các máy chủ lệch nhau vài mili giây tới vài giây. Đừng dùng dấu thời gian để quyết định thứ tự của hai sự kiện xảy ra gần nhau trên hai máy khác nhau.' }
      ],
      mistakes: [
        'Gom nhóm theo thời điểm nhận rồi gọi đó là doanh thu theo ngày.',
        'Tin rằng "exactly-once" của một công cụ bao phủ cả hệ thống đích của bạn.',
        'Cho rằng batch không có vấn đề dữ liệu trễ.'
      ],
      check: [
        ['Trả lời câu hỏi đầu bài, và làm sao hệ thống tính đúng?', 'Thuộc ngày hôm trước theo event time. Hệ thống phải lưu event time do thiết bị ghi, gom nhóm theo nó, và có cơ chế nhận dữ liệu trễ: watermark đủ rộng hoặc tính lại vài ngày gần nhất.'],
        ['Tăng watermark từ 1 phút lên 1 giờ thì được gì, mất gì?', 'Được: ít sự kiện bị bỏ sót, kết quả chính xác hơn. Mất: kết quả của mỗi cửa sổ ra chậm thêm gần 1 giờ, và hệ thống phải giữ trạng thái lâu hơn.']
      ],
      cards: [
        ['Event time và processing time?', 'Event time: lúc sự việc xảy ra. Processing time: lúc hệ thống nhận và xử lý.'],
        ['Watermark là gì?', 'Mốc mà hệ thống coi dữ liệu trước đó đã đến đủ, dùng để chốt kết quả của cửa sổ thời gian.'],
        ['Đánh đổi của việc chờ dữ liệu trễ?', 'Chờ lâu hơn thì chính xác hơn nhưng kết quả ra chậm hơn.'],
        ['Exactly-once trong thực tế đạt được bằng gì?', 'Gửi ít nhất một lần cộng với ghi idempotent/khử trùng, hoặc ghi kết quả và vị trí đọc trong cùng một giao dịch.'],
        ['Hàng đợi phân mảnh bảo đảm thứ tự ở mức nào?', 'Chỉ trong từng partition, không phải trên toàn bộ.'],
        ['Batch xử lý dữ liệu trễ thế nào?', 'Mỗi lần chạy tính lại vài ngày gần nhất (cửa sổ nhìn lại), dựa vào tính idempotent.']
      ]
    },
    {
      id: '6-3', min: 8, sim: 'schema',
      title: 'Schema evolution và data contract',
      hook: 'Đội backend đổi cột "amount" từ đồng sang nghìn đồng. Pipeline không lỗi. Dashboard không lỗi. Doanh thu giảm 1.000 lần. Ba ngày sau mới có người hỏi.',
      core: [
        'Schema của dữ liệu nguồn sẽ thay đổi, vì sản phẩm thay đổi. Câu hỏi không phải làm sao ngăn thay đổi mà là làm sao **thay đổi không phá vỡ người dùng phía sau**.',
        { table: [
          ['Thay đổi', 'Mức nguy hiểm', 'Vì sao'],
          ['Thêm cột có thể để trống', 'Thấp', 'Người đọc cũ bỏ qua cột mới'],
          ['Xóa cột', 'Cao', 'Người đọc cũ đang dùng cột đó sẽ vỡ'],
          ['Đổi tên cột', 'Cao', 'Với người đọc, đó là xóa một cột và thêm một cột'],
          ['Đổi kiểu dữ liệu', 'Cao', 'Số thành chuỗi, mất độ chính xác, ép kiểu lỗi'],
          ['Đổi ý nghĩa, giữ nguyên tên và kiểu', '**Rất cao**', 'Không gì báo lỗi; số liệu sai trong im lặng']
        ] },
        'Dòng cuối là chuyện ở đầu bài và là loại nguy hiểm nhất. Lỗi làm pipeline vỡ thì ồn ào và được sửa ngay. Lỗi làm số liệu sai mà mọi thứ vẫn xanh thì sống được nhiều ngày.',
        { tip: '**Vỡ ầm ĩ tốt hơn sai lặng lẽ.** Pipeline nên dừng lại khi gặp điều bất ngờ, thay vì cố chạy tiếp với dữ liệu nó không hiểu.' },
        { h: 'Data contract' },
        { fig: 'contract', cap: 'Hợp đồng nằm giữa bên tạo và bên dùng dữ liệu, và được kiểm tra tự động.' },
        '**Data contract** là thỏa thuận được viết ra và kiểm tra tự động giữa bên tạo dữ liệu và bên dùng: có những cột nào, kiểu gì, nghĩa là gì, chất lượng ra sao, tươi tới mức nào, và thay đổi thì báo trước thế nào. Bản chất của nó là đưa trách nhiệm về chất lượng dữ liệu **lên phía nguồn**, nơi lỗi rẻ nhất để sửa.'
      ],
      deep: [
        'Hai chiều tương thích cần phân biệt. **Tương thích ngược**: code mới đọc được dữ liệu cũ. **Tương thích xuôi**: code cũ đọc được dữ liệu mới. Trong hệ thống có nhiều bên triển khai không cùng lúc, thường cần cả hai. Schema registry kiểm tra điều này tự động và từ chối schema mới vi phạm.',
        'Cách thay đổi có phá vỡ một cách an toàn là **mở rộng rồi thu hẹp**: thêm cột mới song song với cột cũ, cho các bên dùng chuyển dần, xác nhận không còn ai dùng cột cũ, rồi mới xóa. Chậm, nhưng không có khoảnh khắc nào hệ thống ở trạng thái vỡ.',
        'Đọc cột **theo tên**, không theo vị trí. Liệt kê rõ cột cần dùng thay vì [[SELECT *]]. Khi đó thêm cột hay đổi thứ tự cột ở nguồn không ảnh hưởng gì, và xóa cột bạn dùng thì lỗi ngay lập tức, đúng chỗ.',
        { warn: 'Hợp đồng chỉ có giá trị khi được **kiểm tra bằng máy** trong quy trình triển khai của đội nguồn. Một trang tài liệu mô tả schema mà không ai bị chặn khi vi phạm thì không phải hợp đồng.' }
      ],
      mistakes: [
        'Đọc file theo vị trí cột.',
        'Tự động chấp nhận mọi thay đổi schema từ nguồn cho "đỡ vỡ".',
        'Chỉ kiểm tra cấu trúc (tên, kiểu) mà không kiểm tra giá trị (khoảng, phân bố).'
      ],
      check: [
        ['Loại kiểm tra nào bắt được lỗi ở đầu bài?', 'Kiểm tra giá trị, không phải cấu trúc: khoảng hợp lý của cột amount, so tổng doanh thu với ngày trước và cảnh báo khi lệch quá ngưỡng. Và một hợp đồng ghi rõ đơn vị của cột.'],
        ['Vì sao đổi tên cột nên làm theo kiểu mở rộng rồi thu hẹp?', 'Để lúc nào cũng có ít nhất một cột mà mọi bên dùng đọc được. Các bên chuyển sang cột mới theo nhịp riêng, không cần triển khai đồng loạt.']
      ],
      cards: [
        ['Loại thay đổi schema nguy hiểm nhất?', 'Đổi ý nghĩa mà giữ nguyên tên và kiểu: không gì báo lỗi, số liệu sai trong im lặng.'],
        ['Data contract là gì?', 'Thỏa thuận được kiểm tra tự động giữa bên tạo và bên dùng dữ liệu về schema, ý nghĩa, chất lượng, độ tươi và cách thay đổi.'],
        ['Tương thích ngược và tương thích xuôi?', 'Ngược: code mới đọc được dữ liệu cũ. Xuôi: code cũ đọc được dữ liệu mới.'],
        ['Mở rộng rồi thu hẹp (expand-contract) là gì?', 'Thêm cái mới song song cái cũ, chuyển dần người dùng, rồi mới bỏ cái cũ.'],
        ['Vì sao vỡ ầm ĩ tốt hơn sai lặng lẽ?', 'Lỗi ồn ào được phát hiện và sửa ngay; lỗi im lặng làm sai quyết định trong nhiều ngày trước khi ai đó nhận ra.'],
        ['Schema registry làm gì?', 'Lưu các phiên bản schema và từ chối phiên bản mới không tương thích theo quy tắc đã đặt.']
      ]
    },
    {
      id: '6-4', min: 9,
      title: 'Chất lượng dữ liệu, giám sát và DataOps',
      hook: 'Ai nên là người đầu tiên biết dữ liệu sai: bạn, hay giám đốc đang trình bày con số đó trước hội đồng quản trị?',
      core: [
        'Phần mềm thông thường hỏng thì báo lỗi. Pipeline dữ liệu có thể chạy thành công mà kết quả sai hoàn toàn. Vì vậy ngoài giám sát **hệ thống** (job có chạy không), phải giám sát **dữ liệu** (kết quả có đúng không).',
        { h: 'Các chiều của chất lượng dữ liệu' },
        { table: [
          ['Chiều', 'Câu hỏi', 'Ví dụ kiểm tra'],
          ['Độ tươi', 'Dữ liệu có mới như đã hứa?', 'Bản ghi mới nhất không cũ quá 2 giờ'],
          ['Khối lượng', 'Số dòng có bình thường?', 'Không lệch quá 30% so với cùng thứ tuần trước'],
          ['Đầy đủ', 'Có thiếu giá trị?', 'Cột mã khách không được NULL'],
          ['Duy nhất', 'Có trùng?', 'Mã đơn hàng không lặp'],
          ['Hợp lệ', 'Giá trị có nằm trong khoảng cho phép?', 'Số tiền không âm; trạng thái thuộc danh sách đã biết'],
          ['Nhất quán', 'Các nguồn có khớp nhau?', 'Tổng tiền trong kho khớp với sổ kế toán']
        ] },
        { fig: 'quality', cap: 'Kiểm tra là cổng chặn giữa các khâu, không phải báo cáo đọc sau.' },
        'Kiểm tra phải nằm **trong pipeline** và có quyền dừng nó. Dữ liệu sai bị chặn ở giữa đường thì chỉ là một báo cáo bị trễ. Dữ liệu sai đến được dashboard thì là một quyết định sai.',
        { tip: 'Dữ liệu trễ mà đúng tốt hơn dữ liệu đúng giờ mà sai. Và khi đã trễ hay sai, **chủ động báo cho người dùng trước khi họ tự phát hiện**. Niềm tin được giữ bằng sự minh bạch, không phải bằng sự hoàn hảo.' },
        { h: 'DataOps' },
        'DataOps mang cách làm của kỹ nghệ phần mềm vào dữ liệu, gồm ba trụ: **tự động hóa** (code trong kho mã, có review, có test, triển khai tự động), **quan sát và giám sát** (biết chuyện gì đang xảy ra với hệ thống và dữ liệu), **xử lý sự cố** (có quy trình: ai trực, báo ai, sửa thế nào, học được gì).'
      ],
      deep: [
        '**Lineage** (phả hệ dữ liệu) trả lời hai câu hỏi: con số này từ đâu ra (lần ngược khi sai), và nếu tôi sửa bảng này thì cái gì phía sau bị ảnh hưởng (lần xuôi trước khi đổi). Không có lineage, mỗi thay đổi là một lần đánh cược.',
        'Bộ điều phối (orchestrator) quản lý đồ thị phụ thuộc của các tác vụ: chạy cái gì, theo thứ tự nào, thử lại ra sao, báo ai khi hỏng. Hai cách nghĩ: theo **tác vụ** (chạy bước A rồi bước B) và theo **tài sản dữ liệu** (bảng này phải tươi, hệ thống tự suy ra cần chạy gì). Dù công cụ nào, nguyên tắc vẫn vậy: tác vụ nhỏ, idempotent, có tham số ngày, không giữ trạng thái ngầm.',
        'Cảnh báo quá nhiều tệ ngang không có cảnh báo: người trực sẽ học cách bỏ qua. Mỗi cảnh báo phải **cần hành động** và **có người nhận cụ thể**. Phân mức: dừng pipeline và gọi người trực; hay chỉ ghi nhận để xem sau.',
        'Sau mỗi sự cố, viết lại **không đổ lỗi cho cá nhân**: chuyện gì xảy ra, vì sao hệ thống cho phép nó xảy ra, phát hiện bằng cách nào và mất bao lâu, thay đổi gì để không lặp lại. Hỏi "vì sao một người có thể làm sai điều này dễ thế" hữu ích hơn hỏi "ai làm".',
        { warn: 'Kiểm tra theo ngưỡng cố định ("phải có trên 10.000 dòng") nhanh lỗi thời khi kinh doanh tăng trưởng hoặc có mùa vụ. So với chính lịch sử gần đây của dữ liệu thường bền hơn.' }
      ],
      mistakes: [
        'Chỉ theo dõi job chạy thành công hay thất bại.',
        'Kiểm tra chất lượng chạy sau khi dữ liệu đã tới tay người dùng.',
        'Cảnh báo gửi vào một kênh chung không ai chịu trách nhiệm đọc.'
      ],
      check: [
        ['Job chạy thành công, bảng có 0 dòng. Kiểm tra nào bắt được?', 'Kiểm tra khối lượng: số dòng so với lịch sử. Kèm kiểm tra độ tươi: thời điểm của bản ghi mới nhất.'],
        ['Lineage giúp gì trước khi bạn xóa một cột?', 'Cho biết những bảng, dashboard và mô hình nào phía sau đang dùng cột đó, để báo trước và chuyển họ đi trước khi xóa.']
      ],
      cards: [
        ['Sáu chiều thường dùng của chất lượng dữ liệu?', 'Độ tươi, khối lượng, đầy đủ, duy nhất, hợp lệ, nhất quán.'],
        ['Vì sao giám sát job chưa đủ?', 'Job có thể chạy thành công mà dữ liệu sai, thiếu hoặc trống. Phải giám sát cả nội dung dữ liệu.'],
        ['Ba trụ của DataOps?', 'Tự động hóa, quan sát và giám sát, xử lý sự cố.'],
        ['Lineage là gì?', 'Bản đồ dữ liệu đi từ đâu tới đâu, dùng để lần ngược khi có lỗi và đánh giá ảnh hưởng trước khi thay đổi.'],
        ['Kiểm tra chất lượng nên đặt ở đâu?', 'Trong pipeline, giữa các khâu, có quyền dừng pipeline trước khi dữ liệu sai tới người dùng.'],
        ['Một cảnh báo tốt cần gì?', 'Đòi hỏi hành động cụ thể và có người nhận cụ thể.']
      ]
    }
  ]
});
