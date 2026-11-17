DE.addStage({
  id: 's8', n: 8,
  title: 'Tư duy nghề',
  goal: 'Không có đáp án đúng, chỉ có **đánh đổi phù hợp với hoàn cảnh**. Người có nghề nói được mình đã đổi cái gì lấy cái gì.',
  lessons: [
    {
      id: '8-1', min: 8,
      title: 'Tư duy đánh đổi và nghệ thuật hỏi yêu cầu',
      hook: 'Hai kỹ sư nhận cùng một yêu cầu: "xây pipeline đưa dữ liệu đơn hàng về kho". Một người bắt đầu viết code. Người kia hỏi sáu câu. Ai xong trước?',
      core: [
        'Mọi quyết định trong nghề này là một sự đánh đổi. Nhanh hơn thì đắt hơn hoặc phức tạp hơn. Linh hoạt hơn thì khó quản hơn. Chính xác hơn thì chậm hơn.',
        { fig: 'tradeoff', cap: 'Ba thứ ai cũng muốn. Kéo về một đỉnh thì xa hai đỉnh kia.' },
        'Vì thế câu "cái nào tốt hơn" không có nghĩa nếu thiếu vế sau: **tốt hơn cho việc gì, với ràng buộc nào**. Câu trả lời đúng của người có nghề thường bắt đầu bằng "còn tùy", và quan trọng là nói được **tùy vào cái gì**.',
        { h: 'Sáu câu hỏi trước khi thiết kế' },
        { ul: [
          '**Ai dùng và để làm gì?** Quyết định nào sẽ được đưa ra từ dữ liệu này?',
          '**Tươi tới mức nào?** Vài giây, vài phút, hay sáng hôm sau là đủ?',
          '**Bao nhiêu dữ liệu, tăng nhanh cỡ nào?** Hôm nay và một năm nữa.',
          '**Sai thì sao?** Hậu quả của một con số sai, và của việc trễ một ngày.',
          '**Ràng buộc gì?** Ngân sách, số người, quy định, hệ thống đang có.',
          '**Thế nào là xong?** Tiêu chí cụ thể để hai bên cùng đồng ý là đã đạt.'
        ] },
        { tip: 'Người hỏi sáu câu xong trước. Phần lớn công sức bị lãng phí trong nghề không phải do code chậm mà do **xây đúng kỹ thuật một thứ sai yêu cầu**.' },
        'Người yêu cầu thường nói về **giải pháp** ("tôi cần real-time") chứ không nói về **vấn đề** ("tôi phát hiện hết hàng quá muộn"). Việc của bạn là lần ngược từ giải pháp họ nêu về vấn đề họ có, rồi đề xuất cách giải rẻ nhất cho vấn đề đó.'
      ],
      deep: [
        'Viết quyết định ra giấy. Một bản thiết kế ngắn gồm: bối cảnh và vấn đề; yêu cầu và những thứ **không** thuộc phạm vi; các phương án đã cân nhắc kèm ưu nhược; phương án chọn và lý do; rủi ro và cách lùi. Giá trị lớn nhất nằm ở phần phương án bị loại: nó cho người đến sau biết bạn đã nghĩ tới điều gì.',
        'Ước lượng nhanh là kỹ năng nền. 10 triệu sự kiện mỗi ngày, mỗi sự kiện 1 KB: 10 GB mỗi ngày, khoảng 3,6 TB mỗi năm trước khi nén. Trung bình 115 sự kiện mỗi giây; giờ cao điểm gấp 5 đến 10 lần. Vài phép tính như vậy loại được nửa số phương án trước khi phải thử cái nào.',
        'Bắt đầu bằng thứ đơn giản nhất có thể chạy được, đưa cho người dùng, rồi mới làm phức tạp dần theo nhu cầu thật. Hệ thống phức tạp chạy được luôn tiến hóa từ một hệ thống đơn giản chạy được. Thiết kế cho quy mô gấp 10 lần hiện tại là hợp lý; cho gấp 1.000 lần là đoán mò.',
        { warn: 'Coi chừng lời giải đi tìm bài toán. Khi bạn vừa học một công nghệ mới, mọi vấn đề bỗng trông như cần đúng công nghệ đó.' }
      ],
      mistakes: [
        'Nhận yêu cầu ở dạng giải pháp và thực hiện nguyên văn.',
        'Trả lời "cái nào tốt hơn" mà không hỏi lại bối cảnh.',
        'Không ghi lại vì sao chọn, để sáu tháng sau chính mình cũng không nhớ.'
      ],
      check: [
        ['Người dùng nói "tôi cần dữ liệu real-time". Ba câu bạn hỏi lại?', 'Khi con số đổi, anh chị làm gì khác đi? Việc đó cần được làm trong bao lâu kể từ lúc sự việc xảy ra? Nếu dữ liệu trễ 15 phút hoặc 1 giờ thì mất gì?'],
        ['Ước lượng: 50 triệu sự kiện mỗi ngày, 500 byte mỗi sự kiện. Mỗi năm bao nhiêu?', '25 GB mỗi ngày, khoảng 9 TB mỗi năm ở dạng thô. Với định dạng cột có nén, thường còn một phần nhỏ của con số đó.']
      ],
      cards: [
        ['Sáu câu hỏi trước khi thiết kế?', 'Ai dùng để làm gì; tươi tới mức nào; bao nhiêu dữ liệu và tăng ra sao; sai thì sao; ràng buộc gì; thế nào là xong.'],
        ['Vấn đề và giải pháp trong yêu cầu của người dùng?', 'Người dùng thường nêu giải pháp. Phải lần ngược về vấn đề thật rồi đề xuất cách giải rẻ nhất.'],
        ['Một bản thiết kế ngắn gồm gì?', 'Bối cảnh, yêu cầu và ngoài phạm vi, các phương án kèm ưu nhược, phương án chọn và lý do, rủi ro và cách lùi.'],
        ['Vì sao bắt đầu đơn giản?', 'Hệ thống phức tạp chạy được luôn tiến hóa từ hệ thống đơn giản chạy được; nhu cầu thật chỉ lộ ra khi có người dùng.'],
        ['"Còn tùy" là câu trả lời tốt khi nào?', 'Khi nói được tùy vào yếu tố nào và mỗi trường hợp thì chọn gì.']
      ]
    },
    {
      id: '8-2', min: 8,
      title: 'Data Engineer trong kỷ nguyên AI',
      hook: 'Công ty mua một mô hình ngôn ngữ rất mạnh. Nó trả lời sai về chính sản phẩm của công ty. Vấn đề nằm ở mô hình hay ở dữ liệu?',
      core: [
        'Mô hình AI chỉ biết những gì có trong dữ liệu huấn luyện của nó và những gì bạn đưa cho nó lúc hỏi. Nó không biết chính sách đổi trả của công ty bạn, không biết đơn hàng của khách đang ở đâu. Đưa đúng thông tin tới mô hình vào đúng lúc là **một bài toán dữ liệu**.',
        { fig: 'rag', cap: 'RAG: tìm đoạn tài liệu liên quan rồi đưa cho mô hình cùng với câu hỏi.' },
        '**RAG** (Retrieval-Augmented Generation) là cách phổ biến để mô hình trả lời dựa trên tài liệu riêng: cắt tài liệu thành đoạn, chuyển mỗi đoạn thành một dãy số biểu diễn ý nghĩa (**embedding**), lưu vào nơi tìm được theo độ gần nghĩa (**vector database**). Khi có câu hỏi, tìm các đoạn gần nghĩa nhất và đưa cho mô hình.',
        'Nhìn kỹ hàng trên của hình: đó là một pipeline thu nạp, biến đổi, lưu trữ. Mọi bài học trước đây áp dụng nguyên vẹn: tài liệu đổi thì cập nhật thế nào (tăng dần, idempotent), tài liệu cũ và mới mâu thuẫn thì sao (chất lượng), ai được thấy tài liệu nào (phân quyền), câu trả lời dựa vào đoạn nào (lineage).',
        { tip: 'AI không làm cho nền tảng dữ liệu bớt quan trọng; nó **phơi bày** mọi điểm yếu của nền tảng đó. Dữ liệu lộn xộn trước đây tạo ra dashboard sai mà người xem còn nghi ngờ. Bây giờ nó tạo ra câu trả lời sai nói bằng giọng rất tự tin.' },
        { h: 'Những việc mới của DE' },
        { ul: [
          'Pipeline cho **dữ liệu phi cấu trúc**: văn bản, PDF, ảnh, âm thanh.',
          'Quản lý embedding và chỉ mục vector như một loại dữ liệu dẫn xuất cần làm mới.',
          '**Feature store**: bảo đảm đặc trưng dùng lúc huấn luyện và lúc chạy thật là một.',
          'Cung cấp **ngữ cảnh** cho các tác tử AI: định nghĩa chỉ số, mô tả bảng, quan hệ giữa dữ liệu, ở dạng máy đọc được.'
        ] }
      ],
      deep: [
        'Việc chuẩn bị ngữ cảnh cho mô hình đang được gọi là **context engineering**. Với dữ liệu có cấu trúc, phần lớn công việc này trùng với những gì DE vẫn làm: metadata rõ ràng, tên cột có nghĩa, định nghĩa chỉ số thống nhất, lineage. Một kho dữ liệu mà con người khó hiểu thì tác tử AI cũng khó dùng đúng.',
        'AI cũng thay đổi cách DE làm việc: sinh SQL và code nhanh hơn nhiều. Phần còn lại cho con người là phần khó tự động hóa: hiểu nghiệp vụ, chọn đánh đổi, quyết định cái gì đáng xây, và **kiểm chứng** kết quả. Code viết nhanh hơn thì việc biết code đó đúng hay sai càng có giá trị.',
        'Rủi ro mới khi tác tử AI truy cập dữ liệu: nó có thể được cấp quyền rộng hơn người dùng đang hỏi, và làm lộ dữ liệu qua câu trả lời. Phân quyền phải theo **người hỏi**, áp dụng ngay ở bước tìm kiếm, không phải lọc câu trả lời sau cùng.',
        { warn: 'Lĩnh vực này đổi rất nhanh và phần lớn tài liệu là của nhà cung cấp. Đừng học tên công cụ; học câu hỏi: dữ liệu nào tới mô hình, tươi tới đâu, ai được thấy, và làm sao biết câu trả lời dựa trên cái gì.' }
      ],
      mistakes: [
        'Coi dự án AI là việc của đội mô hình và bỏ qua chất lượng dữ liệu đầu vào.',
        'Dựng chỉ mục vector một lần rồi không bao giờ cập nhật khi tài liệu đổi.',
        'Cho tác tử AI một tài khoản có quyền đọc mọi thứ.'
      ],
      check: [
        ['Trả lời câu hỏi đầu bài.', 'Gần như chắc chắn ở dữ liệu: mô hình chưa từng được đưa thông tin sản phẩm, hoặc được đưa bản cũ, bản mâu thuẫn. Cách sửa là một pipeline đưa đúng tài liệu hiện hành tới mô hình lúc hỏi.'],
        ['Tài liệu chính sách vừa được sửa. Hệ thống RAG cần làm gì?', 'Phát hiện thay đổi, cắt đoạn và tạo embedding lại cho tài liệu đó, thay thế các đoạn cũ trong chỉ mục (không để cả cũ lẫn mới), và ghi lại phiên bản để truy được câu trả lời dựa vào bản nào.']
      ],
      cards: [
        ['RAG là gì?', 'Retrieval-Augmented Generation: tìm các đoạn tài liệu liên quan rồi đưa cho mô hình cùng câu hỏi để nó trả lời dựa trên đó.'],
        ['Embedding là gì?', 'Dãy số biểu diễn ý nghĩa của một đoạn nội dung, sao cho nội dung gần nghĩa thì dãy số gần nhau.'],
        ['Vector database làm gì?', 'Lưu embedding và tìm nhanh các mục gần nghĩa nhất với một truy vấn.'],
        ['Feature store giải quyết gì?', 'Bảo đảm đặc trưng dùng khi huấn luyện mô hình và khi chạy thật được tính theo cùng một cách.'],
        ['Vì sao AI làm nền tảng dữ liệu quan trọng hơn?', 'Chất lượng câu trả lời của AI bị giới hạn bởi chất lượng và độ tươi của dữ liệu được đưa cho nó.'],
        ['Phân quyền cho tác tử AI nên áp ở đâu?', 'Theo người đang hỏi, ngay ở bước tìm kiếm dữ liệu, không phải lọc câu trả lời sau cùng.']
      ]
    },
    {
      id: '8-3', min: 6,
      title: 'Lộ trình nghề và cách học tiếp',
      hook: 'Bạn đã đi hết bản đồ. Bây giờ làm sao biến hiểu biết thành tay nghề?',
      core: [
        'Hiểu khái niệm là điều kiện cần. Tay nghề đến từ việc **làm ra thứ gì đó chạy được, thấy nó hỏng, và sửa nó**.',
        { fig: 'tshape', cap: 'Hình chữ T: rộng ở nền, sâu ở một mảng.' },
        { h: 'Nền phải vững, theo thứ tự ưu tiên' },
        { ul: [
          '**SQL**: thành thạo thật sự, gồm hàm cửa sổ, đọc được kế hoạch thực thi. Đây là kỹ năng dùng nhiều nhất và bền nhất.',
          '**Một ngôn ngữ lập trình** (thường là Python) và thói quen kỹ nghệ: kiểm soát phiên bản, test, review.',
          '**Mô hình hóa dữ liệu**: grain, fact, dimension, lịch sử.',
          '**Một nền tảng cloud**: lưu trữ, tính toán, phân quyền, chi phí.',
          '**Giao tiếp**: hỏi yêu cầu, viết thiết kế, báo sự cố.'
        ] },
        { h: 'Một dự án tự làm có giá trị' },
        'Chọn một nguồn dữ liệu công khai bạn thật sự tò mò. Xây trọn vòng đời ở quy mô nhỏ: thu nạp theo lịch, lưu bản thô, biến đổi qua vài tầng, mô hình hóa, một dashboard. Rồi làm phần mà ít người làm:',
        { ul: [
          'Cho pipeline chạy lại hai lần và chứng minh không sinh trùng.',
          'Thêm kiểm tra chất lượng và cố ý làm hỏng dữ liệu để thấy nó bắt được.',
          'Viết một trang thiết kế: đã cân nhắc những gì, vì sao chọn thế.',
          'Tính xem nó tốn bao nhiêu tiền mỗi tháng nếu dữ liệu gấp 100 lần.'
        ] },
        { tip: 'Một dự án nhỏ làm kỹ các điểm trên nói lên nhiều điều hơn mười dự án chỉ nối công cụ với nhau. Người tuyển dụng tìm **cách nghĩ**, không tìm danh sách công cụ.' }
      ],
      deep: [
        'Nghề có vài hướng đi sâu: **nền tảng** (xây hạ tầng cho các đội khác dùng), **analytics engineering** (mô hình hóa và phục vụ phân tích, gần nghiệp vụ), **streaming** (hệ thống thời gian thực), **ML/AI** (dữ liệu cho mô hình). Ở công ty nhỏ bạn làm tất cả; ở công ty lớn bạn chọn một.',
        'Lên cấp cao hơn không phải là biết nhiều công cụ hơn. Đó là phạm vi ảnh hưởng rộng hơn: từ làm xong tác vụ được giao, tới tự định nghĩa bài toán, tới làm cho cả đội và các đội khác làm việc tốt hơn. Kỹ năng phân biệt các cấp là phán đoán và giao tiếp.',
        'Để theo kịp mà không bị cuốn đi: đọc bài viết kỹ thuật của các công ty mô tả **vấn đề họ gặp và vì sao chọn giải pháp đó**, hơn là đọc bài giới thiệu sản phẩm. Với mỗi công cụ mới, áp lại câu hỏi của bài 0-2: nó nằm ở đâu trong vòng đời và thay thế cái gì.',
        { warn: 'Kiến thức trong khóa này là bản đồ, không phải lãnh thổ. Phần về công cụ và xu hướng sẽ cũ đi; hãy kiểm tra lại với tài liệu chính thức khi áp dụng. Phần về cách đặt câu hỏi thì dùng được lâu.' }
      ],
      mistakes: [
        'Học hết khóa này tới khóa khác mà không tự xây thứ gì.',
        'Dự án cá nhân chỉ chạy được đúng một lần trên máy mình.',
        'Bỏ qua SQL và mô hình hóa để học công cụ phân tán cho "oách".'
      ],
      check: [
        ['Nếu chỉ được giỏi một kỹ năng kỹ thuật, nên chọn gì?', 'SQL, kèm hiểu biết về mô hình hóa dữ liệu. Nó dùng ở mọi giai đoạn của vòng đời, trên mọi công cụ, và đã bền vững hàng chục năm.'],
        ['Điều gì làm một dự án cá nhân khác biệt?', 'Chứng minh được nó chạy lại an toàn, có kiểm tra chất lượng, có tài liệu về các đánh đổi đã cân nhắc, và có ước lượng chi phí khi mở rộng.']
      ],
      cards: [
        ['Kỹ năng hình chữ T là gì?', 'Nền rộng để làm việc được với mọi khâu, cộng một mảng thật sâu để có giá trị riêng.'],
        ['Kỹ năng kỹ thuật bền nhất của DE?', 'SQL và mô hình hóa dữ liệu.'],
        ['Bốn hướng chuyên sâu thường gặp?', 'Nền tảng, analytics engineering, streaming, dữ liệu cho ML/AI.'],
        ['Điều gì phân biệt cấp bậc cao hơn?', 'Phạm vi ảnh hưởng, khả năng phán đoán và giao tiếp, không phải số công cụ biết.'],
        ['Cách đọc để theo kịp ngành?', 'Ưu tiên bài mô tả vấn đề và lý do chọn giải pháp; với công cụ mới, hỏi nó nằm ở đâu trong vòng đời và thay thế cái gì.']
      ]
    }
  ]
});
