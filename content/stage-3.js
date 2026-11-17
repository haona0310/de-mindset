DE.addStage({
  id: 's3', n: 3,
  title: 'Vòng đời dữ liệu: từ nguồn tới người dùng',
  goal: 'Đi **ngược từ người dùng**: họ cần gì, lúc nào, rồi mới quyết định thu nạp và biến đổi ra sao.',
  lessons: [
    {
      id: '3-1', min: 7,
      title: 'Hiểu hệ thống sinh ra dữ liệu',
      hook: 'Pipeline chạy ổn sáu tháng. Một sáng thứ Hai nó vỡ vì đội backend đổi tên một cột. Không ai báo cho bạn. Lỗi của ai?',
      core: [
        'DE hiếm khi sở hữu nơi dữ liệu sinh ra. Ứng dụng thuộc đội backend, phần mềm kế toán thuộc nhà cung cấp, dữ liệu quảng cáo nằm sau API của bên thứ ba. Nhưng mọi vấn đề ở nguồn đều thành vấn đề của bạn.',
        'Với mỗi nguồn, cần trả lời được:',
        { ul: [
          'Nó lưu **trạng thái hiện tại** hay **chuỗi sự kiện**? Có giữ lịch sử không?',
          'Dữ liệu thay đổi thế nào: chỉ thêm, hay có sửa và xóa?',
          'Lấy dữ liệu có làm chậm hệ thống nguồn không? Được lấy vào giờ nào?',
          'Schema có đổi không, ai đổi, có báo trước không?',
          'Dữ liệu có đến trễ, trùng, hoặc sai thứ tự không?',
          'Ai là người để hỏi khi có gì lạ?'
        ] },
        { fig: 'snapshot-vs-log', cap: 'Cùng một đơn hàng, hai cách nguồn có thể cho bạn thấy nó.' },
        'Lấy **snapshot** (chụp toàn bộ bảng) thì đơn giản nhưng mất mọi bước trung gian và nặng dần theo kích thước bảng. Lấy **log thay đổi** thì giữ đủ lịch sử. Kỹ thuật đọc log thay đổi của CSDL gọi là **CDC (Change Data Capture)**: CSDL vốn đã ghi lại mọi thay đổi để tự phục hồi, CDC đọc nhờ cuốn nhật ký đó nên gần như không gây thêm tải.',
        { tip: 'Hãy coi đội sở hữu nguồn là **đối tác**, không phải nhà cung cấp vô danh. Một cuộc nói chuyện 30 phút với họ tiết kiệm nhiều hơn một tuần viết code phòng thủ.' }
      ],
      deep: [
        'Ba cách phát hiện thay đổi ở nguồn, theo độ tin cậy tăng dần. (1) So sánh snapshot hai lần: đắt, bỏ sót thay đổi giữa hai lần chụp. (2) Dựa vào cột [[updated_at]]: rẻ, nhưng **không thấy dòng bị xóa** và hỏng nếu có code quên cập nhật cột này. (3) CDC từ log: thấy mọi thay đổi kể cả xóa, theo đúng thứ tự; đổi lại phải vận hành thêm một thành phần và xử lý khi schema đổi.',
        'Sự kiện từ ứng dụng (clickstream, log) có bẫy riêng: đồng hồ thiết bị người dùng sai, app cũ gửi định dạng cũ nhiều tháng sau khi đã ra bản mới, mất mạng rồi gửi dồn một lúc. Luôn giữ cả **thời điểm xảy ra** theo thiết bị lẫn **thời điểm nhận** theo máy chủ.',
        { warn: 'API bên thứ ba có giới hạn số lần gọi, phân trang, và hay đổi phiên bản. Viết connector cho chúng là việc tốn công mà không tạo lợi thế gì: đây là chỗ nên mua công cụ có sẵn trước khi nghĩ tới tự viết.' }
      ],
      mistakes: [
        'Kéo dữ liệu mà không hỏi đội nguồn, rồi làm chậm hệ thống của họ vào giờ cao điểm.',
        'Tin rằng [[updated_at]] luôn đúng.',
        'Không lưu bản thô như nguồn đã gửi, nên khi logic sai không có gì để tính lại.'
      ],
      check: [
        ['Dùng cột updated_at để lấy thay đổi thì bỏ sót những gì?', 'Dòng bị xóa hẳn; dòng bị sửa bởi đoạn code không cập nhật updated_at; nhiều lần sửa giữa hai lần lấy chỉ thấy lần cuối.'],
        ['Vì sao CDC từ log ít gây tải lên nguồn?', 'Nó đọc nhật ký mà CSDL đằng nào cũng ghi để phục hồi và nhân bản, không chạy truy vấn lên bảng dữ liệu.']
      ],
      cards: [
        ['CDC là gì?', 'Change Data Capture: bắt mọi thay đổi (thêm, sửa, xóa) ở nguồn, thường bằng cách đọc log của CSDL.'],
        ['Snapshot khác log thay đổi thế nào?', 'Snapshot là ảnh chụp trạng thái tại một thời điểm, mất các bước ở giữa. Log giữ mọi thay đổi theo thứ tự.'],
        ['Điểm yếu của việc dựa vào cột updated_at?', 'Không thấy dòng bị xóa và phụ thuộc vào việc mọi đoạn code đều cập nhật cột này.'],
        ['Hai mốc thời gian nên giữ cho mỗi sự kiện?', 'Thời điểm xảy ra (theo nguồn) và thời điểm hệ thống nhận được.'],
        ['Vì sao nên lưu bản thô đúng như nguồn gửi?', 'Để có thể tính lại khi logic biến đổi sai hoặc yêu cầu thay đổi, mà không phải xin lại nguồn.']
      ]
    },
    {
      id: '3-2', min: 9, sim: 'stream',
      title: 'Thu nạp: batch, streaming và điểm ở giữa',
      hook: 'Sếp nói: "Tôi muốn dashboard real-time." Trước khi dựng Kafka, bạn nên hỏi lại câu gì?',
      core: [
        'Mọi dữ liệu về bản chất là một dòng sự kiện không có điểm kết thúc. **Batch** là quyết định cắt dòng đó thành từng khúc để xử lý. **Streaming** là xử lý từng sự kiện khi nó đến.',
        { fig: 'batch-stream', cap: 'Cùng một dòng sự kiện. Batch chờ gom đủ rồi chạy một lần; streaming chạy mãi và xử lý ngay.' },
        { table: [
          ['', 'Batch', 'Streaming'],
          ['Độ trễ', 'Phút tới ngày', 'Mili giây tới giây'],
          ['Độ phức tạp', 'Thấp: chạy, xong, kiểm tra', 'Cao: chạy mãi, phải lo trạng thái, thứ tự, sự kiện trễ'],
          ['Khi lỗi', 'Chạy lại cả lô', 'Phải phục hồi đúng vị trí, không mất không trùng'],
          ['Chi phí', 'Trả khi chạy', 'Trả liên tục 24/7'],
          ['Hợp với', 'Báo cáo, phân tích, huấn luyện mô hình', 'Phát hiện gian lận, cảnh báo, cá nhân hóa tức thì']
        ] },
        'Câu hỏi phải hỏi lại sếp: **"Khi con số thay đổi, anh sẽ làm gì khác đi, và nhanh tới mức nào?"** Nếu câu trả lời là "sáng mai họp tôi xem" thì batch hằng đêm là đủ. Nếu là "chặn giao dịch gian lận trước khi tiền đi" thì mới cần streaming.',
        { tip: 'Mặc định là batch. Chỉ chuyển sang streaming khi có **hành động cụ thể** cần độ trễ thấp và giá trị của nó lớn hơn chi phí vận hành tăng thêm.' },
        'Ở giữa có **micro-batch**: chạy batch nhỏ mỗi vài phút. Nó đáp ứng phần lớn nhu cầu "gần real-time" với độ phức tạp gần batch. Nhiều yêu cầu "real-time" thật ra là "15 phút là được".'
      ],
      deep: [
        'Một **hàng đợi sự kiện** (Kafka và các hệ tương tự) đặt giữa nguồn và nơi xử lý đóng vai trò vùng đệm: nguồn ghi vào không cần biết ai đọc; nơi đọc chết thì dữ liệu chờ sẵn; nhiều nơi đọc cùng một dòng độc lập. Lợi ích này có giá trị ngay cả khi phía sau vẫn xử lý kiểu batch.',
        'Ba mức bảo đảm giao nhận: **at-most-once** (có thể mất, không trùng), **at-least-once** (không mất, có thể trùng), **exactly-once** (không mất không trùng). Mức thứ ba rất khó làm thật trên toàn tuyến. Cách làm thực tế: at-least-once cộng với nơi ghi **idempotent**, để ghi trùng không tạo ra dữ liệu trùng (xem bài 6-1).',
        'Thu nạp kiểu **push** (nguồn chủ động gửi) và **pull** (bạn đi lấy) có điểm hỏng khác nhau. Push: bạn phải luôn sẵn sàng nhận, nếu không sẽ mất. Pull: bạn kiểm soát nhịp độ nhưng phải biết đã lấy tới đâu.',
        { warn: 'Streaming không làm dữ liệu "đúng hơn", thường là ngược lại: kết quả tức thời dựa trên dữ liệu chưa đến đủ. Nhiều hệ thống streaming vẫn cần một bước đối soát batch phía sau.' }
      ],
      mistakes: [
        'Dựng streaming vì người dùng nói chữ "real-time" mà chưa hỏi họ làm gì với nó.',
        'Không ghi lại đã thu nạp tới đâu, nên sau sự cố không biết thiếu khúc nào.',
        'Thu nạp đồng bộ từng bản ghi, nguồn chậm một chút là cả pipeline kẹt.'
      ],
      check: [
        ['Báo cáo doanh thu cho cuộc họp sáng thứ Hai nên thu nạp kiểu gì?', 'Batch hằng đêm hoặc hằng tuần. Không có hành động nào cần nhanh hơn thế, và batch rẻ, dễ kiểm tra, dễ chạy lại.'],
        ['Vì sao at-least-once kết hợp idempotent thường được chọn thay cho exactly-once?', 'Vì dễ làm và dễ kiểm chứng hơn nhiều: cứ gửi lại khi nghi ngờ, còn nơi ghi bảo đảm ghi lại nhiều lần vẫn cho một kết quả.']
      ],
      cards: [
        ['Batch và streaming khác nhau ở bản chất nào?', 'Batch cắt dòng dữ liệu thành khúc và xử lý từng khúc. Streaming xử lý từng sự kiện khi nó đến, liên tục.'],
        ['Câu hỏi để quyết định có cần streaming?', 'Khi dữ liệu thay đổi, ai làm gì khác đi và cần nhanh tới mức nào?'],
        ['Micro-batch là gì?', 'Chạy các lô nhỏ mỗi vài phút: độ trễ gần real-time với độ phức tạp gần batch.'],
        ['Ba mức bảo đảm giao nhận?', 'At-most-once (có thể mất), at-least-once (có thể trùng), exactly-once (không mất không trùng).'],
        ['Hàng đợi sự kiện giúp gì cho pipeline?', 'Làm vùng đệm tách nguồn khỏi nơi xử lý: nơi đọc chết thì dữ liệu chờ, nhiều nơi đọc độc lập cùng một dòng.']
      ]
    },
    {
      id: '3-3', min: 7,
      title: 'Biến đổi: ETL, ELT và các tầng dữ liệu',
      hook: 'Phát hiện công thức tính doanh thu sai suốt ba tháng. Bạn sửa lại được trong 10 phút hay phải xin lại dữ liệu từ nguồn?',
      core: [
        'Biến đổi là nơi dữ liệu thô trở thành thứ có nghĩa: khử trùng, chuẩn hóa kiểu, ghép các nguồn, áp định nghĩa nghiệp vụ. Câu hỏi cấu trúc quan trọng nhất là **biến đổi ở đâu và khi nào**.',
        { fig: 'etl-elt', cap: 'Khác nhau ở thứ tự của hai chữ T và L, và ở thứ còn lại trong kho.' },
        '**ETL** (Extract, Transform, Load): biến đổi trước rồi mới nạp vào kho. Ra đời khi kho dữ liệu đắt và yếu, chỉ nên chứa thứ đã sạch.',
        '**ELT** (Extract, Load, Transform): nạp nguyên dữ liệu thô vào kho, rồi biến đổi bằng SQL ngay trong kho. Trở thành mặc định khi lưu trữ rẻ và kho đủ mạnh.',
        { tip: 'Lợi ích lớn nhất của ELT là trả lời được câu hỏi đầu bài: **dữ liệu thô vẫn còn đó**, nên khi logic sai hay yêu cầu đổi, bạn sửa SQL và tính lại. Với ETL, thứ đã bị vứt đi ở bước T là mất hẳn.' },
        'Biến đổi thường đi qua nhiều tầng, mỗi tầng một trách nhiệm:',
        { flow: ['Thô (như nguồn gửi)', 'Sạch (đúng kiểu, hết trùng)', 'Mô hình hóa (theo nghiệp vụ)', 'Phục vụ (cho từng nhu cầu)'] },
        'Mỗi tầng chỉ đọc từ tầng ngay trước nó. Khi có con số sai, bạn lần ngược từng tầng để biết nó sai từ đâu.'
      ],
      deep: [
        'ELT không có nghĩa là không còn ETL. Vẫn nên biến đổi trước khi nạp trong vài trường hợp: che hoặc bỏ dữ liệu nhạy cảm trước khi nó chạm kho; dữ liệu quá lớn mà phần lớn là rác; định dạng nguồn mà kho không đọc được.',
        'Biến đổi viết bằng SQL được quản lý như code là bước tiến lớn của nghề: mỗi bảng là một file có kiểm soát phiên bản, có test (cột này không được NULL, khóa này phải duy nhất), có tài liệu, và công cụ tự suy ra thứ tự chạy từ quan hệ giữa các bảng. dbt là công cụ tiêu biểu cho cách làm này.',
        '**Tính lại toàn bộ** hay **tính tăng dần**? Tính lại toàn bộ mỗi lần: đơn giản, luôn đúng, đắt dần theo dữ liệu. Tính tăng dần chỉ phần mới: rẻ, nhưng phải xử lý đúng dữ liệu đến trễ và sửa đổi. Bắt đầu bằng tính lại toàn bộ; chuyển sang tăng dần khi chi phí buộc phải thế.',
        { warn: 'Logic nghiệp vụ nằm rải rác ở dashboard, ở notebook, ở pipeline là nguồn gốc của "ba phòng ba con số". Một định nghĩa chỉ nên được viết ở **một nơi**, tầng mô hình hóa.' }
      ],
      mistakes: [
        'Không giữ tầng thô, hoặc sửa trực tiếp lên tầng thô.',
        'Một câu SQL 800 dòng làm mọi thứ, không ai dám sửa.',
        'Tối ưu tăng dần quá sớm, sinh lỗi sai số liệu khó thấy.'
      ],
      check: [
        ['Vì sao ELT trở thành mặc định?', 'Lưu trữ rẻ và kho đủ mạnh để biến đổi tại chỗ; giữ dữ liệu thô cho phép tính lại khi logic đổi; SQL là thứ nhiều người biết.'],
        ['Khi nào vẫn nên biến đổi trước khi nạp?', 'Khi cần loại hoặc che dữ liệu nhạy cảm trước khi vào kho, khi phần lớn dữ liệu là rác không đáng lưu, hoặc khi định dạng nguồn kho không đọc được.']
      ],
      cards: [
        ['ETL và ELT khác nhau ở đâu?', 'ETL biến đổi trước khi nạp vào kho. ELT nạp dữ liệu thô vào kho rồi biến đổi tại đó.'],
        ['Lợi ích lớn nhất của việc giữ dữ liệu thô?', 'Có thể tính lại bất cứ lúc nào khi logic sai hoặc yêu cầu thay đổi.'],
        ['Vì sao chia biến đổi thành nhiều tầng?', 'Mỗi tầng một trách nhiệm, dễ kiểm tra và lần ngược khi có số sai; tầng sau tái dùng tầng trước.'],
        ['Tính lại toàn bộ so với tính tăng dần?', 'Toàn bộ: đơn giản, luôn đúng, đắt dần. Tăng dần: rẻ, nhưng phải xử lý dữ liệu trễ và sửa đổi.'],
        ['Logic nghiệp vụ nên nằm ở đâu?', 'Ở một nơi duy nhất trong tầng mô hình hóa, không rải ở dashboard và notebook.']
      ]
    },
    {
      id: '3-4', min: 7,
      title: 'Phục vụ: dữ liệu để ai dùng, làm gì',
      hook: 'Bạn giao một bảng rất đẹp. Hai tuần sau, người dùng vẫn xuất Excel từ hệ thống cũ. Vì sao?',
      core: [
        'Phục vụ là giai đoạn duy nhất người dùng nhìn thấy. Mọi công sức ở các giai đoạn trước chỉ có giá trị khi nó được dùng ở đây.',
        { fig: 'serving', cap: 'Ba cách dữ liệu được dùng. Reverse ETL đưa kết quả quay lại nơi người ta làm việc hằng ngày.' },
        { ul: [
          '**Phân tích và BI**: dashboard, báo cáo, truy vấn tự do. Người dùng cần con số đúng và định nghĩa rõ.',
          '**Machine learning**: dữ liệu huấn luyện và đặc trưng (feature) cho mô hình. Cần lịch sử đủ dài và nhất quán giữa lúc huấn luyện với lúc chạy thật.',
          '**Reverse ETL**: đẩy kết quả từ kho về hệ thống vận hành, ví dụ điểm khách hàng tiềm năng vào CRM để nhân viên bán hàng thấy ngay trong công cụ của họ.'
        ] },
        'Thứ quyết định dữ liệu có được dùng hay không là **niềm tin**. Người dùng chỉ cần gặp một con số sai mà không ai báo trước là họ quay về Excel. Lấy lại niềm tin tốn gấp nhiều lần giữ nó.',
        { tip: 'Thiết kế **ngược từ người dùng**: họ đang cố làm việc gì, cần thấy gì để làm việc đó, cần lúc nào. Rồi mới lùi dần về biến đổi, lưu trữ, thu nạp.' },
        'Cam kết với người dùng nên được viết ra thành con số. **SLA** là lời hứa với bên ngoài (bảng doanh thu sẵn sàng trước 7 giờ sáng). **SLO** là mục tiêu nội bộ để giữ lời hứa đó (99% số ngày xong trước 6 giờ rưỡi).'
      ],
      deep: [
        'Coi dữ liệu là **sản phẩm**: có người dùng cụ thể, có tài liệu, có định nghĩa từng cột, có cam kết về độ tươi và chất lượng, có người chịu trách nhiệm, có kênh báo lỗi. Một bảng không ai biết ai sở hữu và cột nào nghĩa là gì thì không phải sản phẩm.',
        'Tự phục vụ (self-service) là mục tiêu đẹp nhưng hay thất bại. Nó chỉ hoạt động khi lớp dữ liệu đã được mô hình hóa tốt và định nghĩa thống nhất. Mở thẳng dữ liệu thô cho mọi người tự truy vấn sinh ra hàng chục phiên bản của cùng một chỉ số.',
        '**Lớp ngữ nghĩa** (semantic layer) là nơi định nghĩa chỉ số một lần ("doanh thu thuần = ...") để mọi công cụ cùng dùng. Nó ngày càng quan trọng vì các trợ lý AI truy vấn dữ liệu cũng cần biết chính xác mỗi chỉ số nghĩa là gì.',
        { warn: 'Reverse ETL biến kho phân tích thành một phần của hệ thống vận hành. Khi đó kho sập hay số sai sẽ ảnh hưởng trực tiếp tới khách hàng. Mức yêu cầu về độ tin cậy phải nâng lên tương ứng.' }
      ],
      mistakes: [
        'Giao bảng mà không có tài liệu, không nói dữ liệu tươi tới lúc nào.',
        'Biết số sai nhưng im lặng sửa, hy vọng không ai để ý.',
        'Xây dashboard mà không hỏi người xem sẽ làm gì với nó.'
      ],
      check: [
        ['Trong chuyện đầu bài, những lý do nào khiến người dùng không chuyển sang bảng mới?', 'Không tin con số (chưa đối chiếu với số cũ), không hiểu các cột, bảng không có đủ thứ họ cần, dữ liệu không kịp giờ họ làm việc, hoặc không ai hỏi họ cần gì ngay từ đầu.'],
        ['SLA khác SLO thế nào?', 'SLA là cam kết với người dùng. SLO là mục tiêu nội bộ chặt hơn, đặt ra để có khoảng an toàn giữ được SLA.']
      ],
      cards: [
        ['Ba hình thức phục vụ dữ liệu?', 'Phân tích/BI, machine learning, reverse ETL.'],
        ['Reverse ETL là gì?', 'Đẩy dữ liệu đã xử lý từ kho phân tích về các hệ thống vận hành như CRM, công cụ marketing.'],
        ['Yếu tố quyết định dữ liệu có được dùng?', 'Niềm tin của người dùng vào con số.'],
        ['SLA và SLO?', 'SLA: cam kết với người dùng. SLO: mục tiêu nội bộ để bảo đảm giữ được SLA.'],
        ['Dữ liệu được coi là sản phẩm khi có gì?', 'Người dùng xác định, tài liệu, định nghĩa cột, cam kết về độ tươi và chất lượng, người chịu trách nhiệm.'],
        ['Lớp ngữ nghĩa (semantic layer) để làm gì?', 'Định nghĩa mỗi chỉ số một lần để mọi công cụ và mọi người dùng cùng một con số.']
      ]
    }
  ]
});
