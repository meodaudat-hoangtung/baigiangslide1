import { MathLesson } from '../types';

export const SAMPLE_LESSONS: MathLesson[] = [
  {
    id: 'lesson-menh-de-toan-10',
    title: 'BÀI 1: MỆNH ĐỀ (TOÁN 10 - KẾT NỐI TRI THỨC)',
    grade: 'Toán Lớp 10 - Đại Số & Lôgic',
    chapterOrTopic: 'Chương I: Mệnh Đề và Tập Hợp',
    createdAt: Date.now() - 3600000 * 5,
    updatedAt: Date.now(),
    sourceImageCount: 4,
    config: {
      totalQuestions: 10,
      numMultipleChoice: 4,
      numTrueFalse: 3,
      numShortAnswer: 2,
      numEssay: 1,
      targetGrade: 'Toán 10 - Kết Nối Tri Thức Với Cuộc Sống',
      teachingGoal: 'concept_mastery'
    },
    slides: [
      {
        id: 'slide-md-1',
        slideNumber: 1,
        title: 'BÀI 1: MỆNH ĐỀ',
        subtitle: 'Chương I: Mệnh Đề và Tập Hợp - Toán 10 (Bộ SGK Kết Nối Tri Thức Với Cuộc Sống)',
        category: 'intro',
        layout: 'standard',
        keyFormula: 'P, Q, R \\quad | \\quad P \\implies Q \\quad | \\quad P \\iff Q \\quad | \\quad \\forall, \\exists',
        suggestedDurationMin: 5,
        teacherSpeechGuide: 'Chào các em, hôm nay chúng ta sẽ bắt đầu Chương I với Bài 1: Mệnh Đề. Đây là nền tảng cốt lõi của tư duy toán học chính xác và lập luận logic.',
        chalkboardNotes: 'CHƯƠNG I: MỆNH ĐỀ VÀ TẬP HỢP\nBÀI 1: MỆNH ĐỀ\n• Thuật ngữ: Mệnh đề, Mệnh đề phủ định, Mệnh đề kéo theo, đảo, tương đương, điều kiện cần/đủ, kí hiệu ∀, ∃.\n• Tình huống mở đầu: Đếm số con vật trong tranh.',
        objectives: [
          'Thuật ngữ: Mệnh đề, Mệnh đề phủ định, Mệnh đề kéo theo, Mệnh đề đảo, Mệnh đề tương đương, Điều kiện cần, Điều kiện đủ, Điều kiện cần và đủ, Các kí hiệu ∀, ∃',
          'Kiến thức & Kĩ năng: Thiết lập và phát biểu mệnh đề phủ định, mệnh đề đảo, mệnh đề kéo theo, mệnh đề tương đương',
          'Thiết lập và phát biểu các mệnh đề có chứa kí hiệu ∀, ∃',
          'Xác định tính đúng sai của một mệnh đề trong những trường hợp đơn giản'
        ],
        sections: [
          {
            id: 'sec-md-1-intro',
            title: 'Tình Huống Mở Đầu (Khởi Động - SGK Trang 5)',
            content: 'Quan sát bức tranh ảo giác gồm nhiều lớp hình vẽ các loài động vật đan xen nhau:',
            activities: [
              {
                id: 'act-md-open',
                title: 'Tình huống: Đố vui đếm số con vật trong hình vẽ',
                description: 'Hai bạn An và Khoa cùng quan sát một bức tranh vẽ voi, ngựa, chó, mèo... Bạn An nói: "Có 5 con vật xuất hiện trong hình vẽ." Bạn Khoa nói: "Có 6 con vật xuất hiện trong hình vẽ."',
                question: 'Trong các câu nói trên, câu nào đúng? Câu nào sai? Câu nào không xác định được tính đúng sai?',
                conclusion: 'Mỗi câu khẳng định có tính đúng hoặc sai rõ ràng được gọi là một Mệnh đề logic trong Toán học.'
              }
            ],
            notes: [
              'Chương này cung cấp những khái niệm và kí hiệu lôgic thường dùng, giúp hình thành khả năng suy luận có lí và diễn đạt chính xác các vấn đề toán học.'
            ]
          }
        ]
      },
      {
        id: 'slide-md-2',
        slideNumber: 2,
        title: '1. MỆNH ĐỀ, MỆNH ĐỀ CHỨA BIẾN',
        subtitle: 'Khái niệm Mệnh đề Logic, Mệnh đề Toán học và Mệnh đề Chứa Biến (SGK Trang 6 - 7)',
        category: 'definition',
        layout: 'split_two_col',
        keyFormula: 'P \\in \\{\\text{ĐÚNG}, \\text{SAI}\\} \\quad | \\quad P(n), P(x)',
        suggestedDurationMin: 8,
        teacherSpeechGuide: 'Nhấn mạnh: Một câu khẳng định chỉ được coi là mệnh đề khi nó chắc chắn đúng hoặc chắc chắn sai, tuyệt đối không được mập mờ.',
        chalkboardNotes: '1. MỆNH ĐỀ, MỆNH ĐỀ CHỨA BIẾN\na) Mệnh đề:\n• Khẳng định đúng hoặc sai.\n• Không thể vừa đúng vừa sai.\n• Kí hiệu: P, Q, R...\nb) Mệnh đề chứa biến: P(x), tính đúng sai phụ thuộc vào x.',
        sections: [
          {
            id: 'sec-md-2-a',
            title: 'a) Khái Niệm Mệnh Đề',
            content: 'Những câu nói của An và Khoa là những khẳng định có tính đúng hoặc sai. Người ta gọi mỗi câu như vậy là một **mệnh đề lôgic** (gọi tắt là **mệnh đề**). Những câu không xác định được tính đúng sai không phải là mệnh đề.',
            activities: [
              {
                id: 'act-md-hd1',
                title: 'HĐ1: Nhận biết câu đúng / sai trong tình huống mở đầu',
                description: 'Xét các câu nói của An và Khoa ở tình huống mở đầu.',
                question: 'a) Câu nào đúng? b) Câu nào sai? c) Câu nào không xác định được tính đúng sai?',
                conclusion: 'Một câu khẳng định mang tính đúng/sai rõ ràng gọi là mệnh đề. Câu nghi vấn, câu cảm thán, câu cầu khiến không phải là mệnh đề.'
              }
            ],
            takeaway: '**QUY TẮC MỆNH ĐỀ (SGK)**:\n• Mỗi mệnh đề phải hoặc đúng hoặc sai.\n• Một mệnh đề không thể vừa đúng vừa sai.',
            notes: [
              'Người ta thường sử dụng các chữ cái in hoa $P, Q, R, \\dots$ để biểu thị các mệnh đề.',
              'Thông thường, những câu nghi vấn (câu hỏi), câu cảm thán, câu cầu khiến không phải là mệnh đề.',
              'Những mệnh đề liên quan đến toán học (ở câu a và câu b trong Ví dụ 1) được gọi là **mệnh đề toán học**.'
            ],
            examples: [
              {
                id: 'ex-md-1',
                title: 'Ví dụ 1 (SGK Trang 6): Phân loại câu là mệnh đề',
                problem: 'Trong các câu sau, câu nào là mệnh đề? Câu nào không phải là mệnh đề?\na) Phương trình $3x^2 - 5x + 2 = 0$ có nghiệm nguyên;\nb) $5 < 7 - 3$;\nc) Có bao nhiêu dấu hiệu nhận biết hai tam giác đồng dạng?\nd) Đấy là cách xử lí khôn ngoan!',
                solutionSteps: [
                  'Vì phương trình $3x^2 - 5x + 2 = 0$ có nghiệm nguyên $x = 1$ nên câu a là khẳng định đúng $\\implies$ câu a là mệnh đề đúng.',
                  'Ta có $7 - 3 = 4$, mà $5 < 4$ là khẳng định sai $\\implies$ câu b là mệnh đề sai. Do đó, câu a và câu b là những mệnh đề.',
                  'Câu c là câu hỏi (câu nghi vấn); câu d là câu cảm thán nêu ý kiến chủ quan của người nói nên không xác định được tính đúng sai $\\implies$ câu c và câu d không phải là mệnh đề.'
                ],
                finalAnswer: 'Vậy câu a và b là mệnh đề; câu c và d không phải là mệnh đề.'
              }
            ],
            practices: [
              {
                id: 'pr-md-1',
                title: 'Luyện tập 1 (SGK Trang 6): Bảng phân loại mệnh đề',
                problem: 'Thay dấu "?" bằng dấu "X" vào ô thích hợp trong bảng sau:\n1. "13 là số nguyên tố."\n2. "Tổng độ dài hai cạnh bất kì của một tam giác nhỏ hơn độ dài cạnh còn lại."\n3. "Bạn đã làm bài tập chưa?"\n4. "Thời tiết hôm nay thật đẹp!"',
                hint: 'Kiểm tra xem câu khẳng định có tính đúng sai khách quan hay không.',
                solution: '• "13 là số nguyên tố" $\\rightarrow$ Mệnh đề đúng [X].\n• "Tổng độ dài hai cạnh tam giác nhỏ hơn cạnh còn lại" $\\rightarrow$ Mệnh đề sai [X] (vì bất đẳng thức tam giác: tổng 2 cạnh luôn lớn hơn cạnh thứ ba).\n• "Bạn đã làm bài tập chưa?" $\\rightarrow$ Không phải mệnh đề [X] (câu hỏi).\n• "Thời tiết hôm nay thật đẹp!" $\\rightarrow$ Không phải mệnh đề [X] (câu cảm thán).'
              }
            ]
          },
          {
            id: 'sec-md-2-b',
            title: 'b) Mệnh Đề Chứa Biến',
            content: 'Xét câu "$n$ chia hết cho 2" (với $n$ là số tự nhiên). Ta chưa khẳng định được tính đúng sai của câu này, do đó nó chưa phải là một mệnh đề. Tuy nhiên:\n• Với $n = 5$ ta được mệnh đề "5 chia hết cho 2" (Mệnh đề sai).\n• Với $n = 10$ ta được mệnh đề "10 chia hết cho 2" (Mệnh đề đúng).\nTa nói rằng câu "$n$ chia hết cho 2" là một **mệnh đề chứa biến**.',
            takeaway: '**MỆNH ĐỀ CHỨA BIẾN**: Là câu khẳng định chứa một hay nhiều biến số, tính đúng sai của nó phụ thuộc vào giá trị cụ thể của các biến số đó.',
            practices: [
              {
                id: 'pr-md-qmark',
                title: 'Câu hỏi (?) SGK Trang 7: Tìm giá trị biến',
                problem: 'Xét câu "$x > 5$". Hãy tìm hai giá trị thực của $x$ để từ câu đã cho, ta nhận được một mệnh đề đúng và một mệnh đề sai.',
                hint: 'Chọn một giá trị lớn hơn 5 và một giá trị nhỏ hơn hoặc bằng 5.',
                solution: '• Với $x = 8$, ta được mệnh đề "$8 > 5$" (Đây là mệnh đề đúng).\n• Với $x = 3$, ta được mệnh đề "$3 > 5$" (Đây là mệnh đề sai).'
              }
            ]
          }
        ]
      },
      {
        id: 'slide-md-3',
        slideNumber: 3,
        title: '2. MỆNH ĐỀ PHỦ ĐỊNH',
        subtitle: 'Định nghĩa, Kí hiệu $\\overline{P}$ và Quy tắc Chân trị Mệnh đề Phủ định (SGK Trang 7)',
        category: 'definition',
        layout: 'standard',
        keyFormula: 'P \\text{ đúng } \\iff \\overline{P} \\text{ sai} \\quad | \\quad P \\text{ sai } \\iff \\overline{P} \\text{ đúng}',
        suggestedDurationMin: 7,
        teacherSpeechGuide: 'Khi lập mệnh đề phủ định, hãy nhớ thêm hoặc bớt từ "không" hoặc "không phải" vào trước vị ngữ của câu.',
        chalkboardNotes: '2. MỆNH ĐỀ PHỦ ĐỊNH\n• Kí hiệu: \\overline{P} (đọc là "P ngang" hoặc "phủ định của P").\n• P đúng <=> \\overline{P} sai.\n• P sai <=> \\overline{P} đúng.',
        sections: [
          {
            id: 'sec-md-3',
            title: 'Khái Niệm Mệnh Đề Phủ Định',
            content: 'Để phủ định một mệnh đề $P$, người ta thường thêm (hoặc bớt) từ "không" hoặc "không phải" vào trước vị ngữ của mệnh đề $P$. Ta kí hiệu mệnh đề phủ định của mệnh đề $P$ là $\\overline{P}$.',
            activities: [
              {
                id: 'act-md-hd2',
                title: 'HĐ2: Quan sát biển báo người đi bộ',
                description: 'Quan sát biển báo giao thông trong hình vẽ. Bạn Khoa nói: "Đây là biển báo đường dành cho người đi bộ". Bạn An không đồng ý với ý kiến của Khoa.',
                question: 'Hãy phát biểu ý kiến của An dưới dạng một mệnh đề?',
                conclusion: 'An phát biểu: "Đây không phải là biển báo đường dành cho người đi bộ". Câu nói của An chính là mệnh đề phủ định của câu nói của Khoa.'
              }
            ],
            takeaway: '**QUY TẮC MỆNH ĐỀ PHỦ ĐỊNH (SGK)**:\n• Mệnh đề $P$ và mệnh đề $\\overline{P}$ là hai phát biểu trái ngược nhau.\n• Nếu $P$ **ĐÚNG** thì $\\overline{P}$ **SAI**.\n• Nếu $P$ **SAI** thì $\\overline{P}$ **ĐÚNG**.',
            examples: [
              {
                id: 'ex-md-2',
                title: 'Ví dụ 2 (SGK Trang 7): Phát biểu mệnh đề phủ định',
                problem: 'Phát biểu mệnh đề phủ định của mỗi mệnh đề sau:\n$P$: "17 là số chính phương";\n$Q$: "Hình hộp không phải là hình lăng trụ".',
                solutionSteps: [
                  'Mệnh đề phủ định của $P$ là $\\overline{P}$: "17 không phải là số chính phương". (Mệnh đề $P$ sai nên $\\overline{P}$ là mệnh đề đúng).',
                  'Mệnh đề phủ định của $Q$ là $\\overline{Q}$: "Hình hộp là hình lăng trụ". (Mệnh đề $Q$ sai nên $\\overline{Q}$ là mệnh đề đúng).'
                ],
                finalAnswer: 'Kết luận: $\\overline{P}$: "17 không phải là số chính phương"; $\\overline{Q}$: "Hình hộp là hình lăng trụ".'
              }
            ],
            practices: [
              {
                id: 'pr-md-2',
                title: 'Luyện tập 2 (SGK Trang 7): Phủ định và xét tính đúng sai',
                problem: 'Phát biểu mệnh đề phủ định của mỗi mệnh đề sau và xác định tính đúng sai của mệnh đề phủ định đó:\n$P$: "$2022$ chia hết cho 5";\n$Q$: "Bất phương trình $2x + 1 > 0$ có nghiệm".',
                hint: 'Thêm/bớt từ "không" và kiểm tra tính đúng sai của mệnh đề vừa thu được.',
                solution: '• $\\overline{P}$: "$2022$ không chia hết cho 5" $\\implies$ Mệnh đề $\\overline{P}$ là ĐÚNG (vì chữ số tận cùng của $2022$ là 2).\n• $\\overline{Q}$: "Bất phương trình $2x + 1 > 0$ vô nghiệm" $\\implies$ Mệnh đề $\\overline{Q}$ là SAI (vì bất phương trình có nghiệm $x > -\\frac{1}{2}$).'
              }
            ],
            applications: [
              {
                id: 'app-md-van-dung',
                title: 'Vận dụng (SGK Trang 7): Mệnh đề địa lí thế giới',
                problem: 'Cho mệnh đề $Q$: "Châu Á là châu lục có diện tích lớn nhất trên thế giới". Phát biểu mệnh đề phủ định $\\overline{Q}$ và xác định tính đúng sai của hai mệnh đề $Q$ và $\\overline{Q}$.',
                solution: '• Mệnh đề phủ định $\\overline{Q}$: "Châu Á không phải là châu lục có diện tích lớn nhất trên thế giới".\n• Tính đúng sai: Mệnh đề $Q$ là ĐÚNG (diện tích Châu Á khoảng $44{,}58$ triệu $\\text{km}^2$), do đó mệnh đề phủ định $\\overline{Q}$ là SAI.'
              }
            ]
          }
        ]
      },
      {
        id: 'slide-md-4',
        slideNumber: 4,
        title: '3. MỆNH ĐỀ KÉO THEO, MỆNH ĐỀ ĐẢO',
        subtitle: 'Cấu trúc "Nếu P thì Q", Định lý toán học, Giả thiết - Kết luận, Điều kiện Cần và Đủ (SGK Trang 8 - 9)',
        category: 'theorem',
        layout: 'split_two_col',
        keyFormula: 'P \\implies Q \\quad | \\quad Q \\implies P \\quad | \\quad P \\text{ là đk đủ}, Q \\text{ là đk cần}',
        suggestedDurationMin: 9,
        teacherSpeechGuide: 'Lưu ý học sinh: Mệnh đề kéo theo P => Q chỉ sai khi P đúng mà Q sai. Mệnh đề đảo của một mệnh đề đúng chưa chắc đã đúng.',
        chalkboardNotes: '3. MỆNH ĐỀ KÉO THEO & ĐẢO\na) Kéo theo: P => Q ("Nếu P thì Q")\n• P: Giả thiết, Q: Kết luận.\n• P là điều kiện ĐỦ để có Q.\n• Q là điều kiện CẦN để có P.\nb) Đảo: Q => P\n• Mệnh đề đảo của mệnh đề đúng chưa chắc đúng!',
        sections: [
          {
            id: 'sec-md-4-a',
            title: 'a) Mệnh Đề Kéo Theo (P => Q)',
            content: 'Mệnh đề "Nếu $P$ thì $Q$" được gọi là một **mệnh đề kéo theo** và kí hiệu là $P \\Rightarrow Q$.',
            activities: [
              {
                id: 'act-md-hd3-4',
                title: 'HĐ3 & HĐ4: Cặp quan hệ từ và Phát biểu Nếu... thì...',
                description: 'HĐ3: Cặp từ quan hệ "Nếu... thì..." phù hợp với quy định giao thông.\nHĐ4: Cho $P$: "Tam giác $ABC$ là tam giác vuông tại $A$"; $Q$: "Tam giác $ABC$ có $AB^2 + AC^2 = BC^2$".',
                question: 'Hãy phát biểu câu ghép có dạng "Nếu P thì Q"?',
                conclusion: '"Nếu tam giác $ABC$ vuông tại $A$ thì $AB^2 + AC^2 = BC^2$". Đây là mệnh đề kéo theo đúng (Định lý Pythagore).'
              }
            ],
            takeaway: '**ĐỊNH LÝ TOÁN HỌC & ĐIỀU KIỆN CẦN / ĐỦ (SGK)**:\nCác định lí toán học là những mệnh đề đúng và thường có dạng $P \\Rightarrow Q$. Khi đó ta nói:\n• $P$ là **giả thiết** của định lí, $Q$ là **kết luận** của định lí.\n• "$P$ là **điều kiện đủ** để có $Q$".\n• "$Q$ là **điều kiện cần** để có $P$".',
            examples: [
              {
                id: 'ex-md-3',
                title: 'Ví dụ 3 (SGK Trang 8): Mệnh đề hình học kéo theo',
                problem: 'Cho tứ giác $ABCD$, xét hai câu sau:\n$P$: "Tứ giác $ABCD$ có tổng số đo hai góc đối diện bằng $180^\\circ$";\n$Q$: "$ABCD$ là tứ giác nội tiếp đường tròn".\nPhát biểu mệnh đề $P \\Rightarrow Q$ và cho biết tính đúng sai của mệnh đề đó.',
                solutionSteps: [
                  'Phát biểu mệnh đề $P \\Rightarrow Q$: "Nếu tứ giác $ABCD$ có tổng số đo hai góc đối diện bằng $180^\\circ$ thì $ABCD$ là tứ giác nội tiếp đường tròn".',
                  'Xét tính đúng sai: Theo định lý về tứ giác nội tiếp trong hình học, mệnh đề kéo theo này là một mệnh đề ĐÚNG.'
                ],
                finalAnswer: 'Mệnh đề $P \\Rightarrow Q$ là mệnh đề đúng.'
              }
            ]
          },
          {
            id: 'sec-md-4-b',
            title: 'b) Mệnh Đề Đảo (Q => P)',
            content: 'Mệnh đề $Q \\Rightarrow P$ được gọi là **mệnh đề đảo** của mệnh đề $P \\Rightarrow Q$.',
            takeaway: '**NHẬN XÉT QUAN TRỌNG (SGK)**:\nMệnh đề đảo của một mệnh đề đúng KHÔNG NHẤT THIẾT là đúng.',
            examples: [
              {
                id: 'ex-md-4',
                title: 'Ví dụ 4 (SGK Trang 9): Mệnh đề đảo tam giác đều & cân',
                problem: 'Hãy phát biểu mệnh đề đảo của mệnh đề: "Nếu tam giác $ABC$ là tam giác đều thì tam giác $ABC$ là tam giác cân" và xác định tính đúng sai của mệnh đề đảo này.',
                solutionSteps: [
                  'Mệnh đề đảo là: "Nếu tam giác $ABC$ là tam giác cân thì tam giác $ABC$ là tam giác đều".',
                  'Mệnh đề đảo này là SAI vì tam giác cân chưa chắc đã là tam giác đều (ví dụ tam giác vuông cân).'
                ],
                finalAnswer: 'Mệnh đề thuận đúng nhưng mệnh đề đảo sai.'
              }
            ],
            practices: [
              {
                id: 'pr-md-3',
                title: 'Luyện tập 3 (SGK Trang 9): Tính chia hết & Điều kiện cần/đủ',
                problem: 'Cho các mệnh đề: $P$: "$a$ và $b$ chia hết cho $c$"; $Q$: "$a + b$ chia hết cho $c$".\na) Hãy phát biểu định lí $P \\Rightarrow Q$. Nêu giả thiết, kết luận và phát biểu dưới dạng điều kiện cần, điều kiện đủ.\nb) Hãy phát biểu mệnh đề đảo của $P \\Rightarrow Q$ rồi xác định tính đúng sai.',
                hint: 'Dùng tính chất chia hết của một tổng: $a \\vdots c, b \\vdots c \\implies (a+b) \\vdots c$.',
                solution: 'a) Định lí $P \\Rightarrow Q$: "Nếu $a$ và $b$ chia hết cho $c$ thì $a + b$ chia hết cho $c$".\n• Giả thiết: $a$ và $b$ chia hết cho $c$; Kết luận: $a + b$ chia hết cho $c$.\n• Điều kiện đủ: "$a$ và $b$ chia hết cho $c$ là điều kiện đủ để $a + b$ chia hết cho $c$".\n• Điều kiện cần: "$a + b$ chia hết cho $c$ là điều kiện cần để $a$ và $b$ chia hết cho $c$".\nb) Mệnh đề đảo $Q \\Rightarrow P$: "Nếu $a + b$ chia hết cho $c$ thì $a$ và $b$ chia hết cho $c$". Mệnh đề đảo này là SAI (ví dụ: $1 + 3 = 4$ chia hết cho 2 nhưng 1 và 3 không chia hết cho 2).'
              }
            ]
          }
        ]
      },
      {
        id: 'slide-md-5',
        slideNumber: 5,
        title: '4. MỆNH ĐỀ TƯƠNG ĐƯƠNG',
        subtitle: 'Mệnh đề "Nếu và chỉ nếu", "Khi và chỉ khi", Điều kiện Cần và Đủ (SGK Trang 9)',
        category: 'theorem',
        layout: 'standard',
        keyFormula: 'P \\iff Q \\quad (P \\implies Q \\text{ và } Q \\implies P \\text{ cùng đúng})',
        suggestedDurationMin: 7,
        teacherSpeechGuide: 'Khi cả hai chiều thuận và đảo đều đúng, ta có mệnh đề tương đương. Cụm từ "điều kiện cần và đủ" rất thường gặp trong các định lý hình học và giải tích.',
        chalkboardNotes: '4. MỆNH ĐỀ TƯƠNG ĐƯƠNG\n• Kí hiệu: P <=> Q ("P nếu và chỉ nếu Q" hoặc "P khi và chỉ khi Q").\n• P <=> Q đúng khi cả P => Q và Q => P đều đúng.\n• Ta nói: "P là điều kiện cần và đủ để có Q".',
        sections: [
          {
            id: 'sec-md-5',
            title: 'Khái Niệm Mệnh Đề Tương Đương',
            content: 'Mệnh đề "$P$ nếu và chỉ nếu $Q$" (hoặc "$P$ khi và chỉ khi $Q$") được gọi là một **mệnh đề tương đương** và kí hiệu là $P \\Leftrightarrow Q$.',
            activities: [
              {
                id: 'act-md-hd6',
                title: 'HĐ6: Xác định tính đúng sai hai chiều',
                description: 'Xét mệnh đề: "Một số tự nhiên chia hết cho 5 nếu số đó có chữ số tận cùng bằng 0 hoặc 5 và ngược lại".',
                question: 'Mệnh đề này có đúng ở cả chiều thuận và chiều đảo hay không?',
                conclusion: 'Chiều thuận: số tận cùng 0 hoặc 5 thì chia hết cho 5 (Đúng). Chiều đảo: số chia hết cho 5 thì tận cùng 0 hoặc 5 (Đúng). Hai mệnh đề tương đương nhau.'
              }
            ],
            takeaway: '**QUY TẮC MỆNH ĐỀ TƯƠNG ĐƯƠNG (SGK)**:\n• Nếu cả hai mệnh đề $P \\Rightarrow Q$ và $Q \\Rightarrow P$ đều đúng thì mệnh đề tương đương $P \\Leftrightarrow Q$ đúng.\n• Khi đó ta nói:\n  - "$P$ **tương đương** với $Q$".\n  - "$P$ là **điều kiện cần và đủ** để có $Q$".\n  - "$P$ **khi và chỉ khi** $Q$".',
            examples: [
              {
                id: 'ex-md-5',
                title: 'Ví dụ 5 (SGK Trang 9): Mệnh đề tương đương hình vuông',
                problem: 'Cho hai mệnh đề:\n$P$: "Tứ giác $ABCD$ là hình vuông";\n$Q$: "Tứ giác $ABCD$ là hình chữ nhật có hai đường chéo vuông góc với nhau".\nHãy phát biểu mệnh đề tương đương $P \\Leftrightarrow Q$ và xác định tính đúng sai của mệnh đề tương đương này.',
                solutionSteps: [
                  'Phát biểu: $P \\Leftrightarrow Q$: "Tứ giác $ABCD$ là hình vuông khi và chỉ khi tứ giác $ABCD$ là hình chữ nhật có hai đường chéo vuông góc với nhau".',
                  'Xét tính đúng sai: Chiều thuận $P \\Rightarrow Q$ đúng và chiều đảo $Q \\Rightarrow P$ cũng đúng (dấu hiệu nhận biết hình vuông).'
                ],
                finalAnswer: 'Mệnh đề tương đương $P \\Leftrightarrow Q$ là mệnh đề ĐÚNG.'
              }
            ],
            practices: [
              {
                id: 'pr-md-4',
                title: 'Luyện tập 4 (SGK Trang 9): Điều kiện cần và đủ chia hết cho 2',
                problem: 'Phát biểu điều kiện cần và đủ để số tự nhiên $n$ chia hết cho 2.',
                hint: 'Dấu hiệu chia hết cho 2 là chữ số tận cùng là chữ số chẵn.',
                solution: '"Điều kiện cần và đủ để số tự nhiên $n$ chia hết cho 2 là $n$ có chữ số tận cùng là $0, 2, 4, 6, 8$" (hoặc "$n$ chia hết cho 2 khi và chỉ khi chữ số tận cùng của $n$ là một chữ số chẵn").'
              }
            ]
          }
        ]
      },
      {
        id: 'slide-md-6',
        slideNumber: 6,
        title: '5. MỆNH ĐỀ CÓ CHỨA KÍ HIỆU ∀, ∃',
        subtitle: 'Kí hiệu "Với mọi" (∀), "Tồn tại" (∃) và Quy tắc Phủ định Mệnh đề Lượng từ (SGK Trang 10)',
        category: 'definition',
        layout: 'split_two_col',
        keyFormula: '\\forall x \\in M, P(x) \\quad | \\quad \\exists x \\in M, P(x) \\quad | \\quad \\overline{\\forall} = \\exists, \\quad \\overline{\\exists} = \\forall',
        suggestedDurationMin: 9,
        teacherSpeechGuide: 'Nhấn mạnh: Phủ định của "với mọi" là "tồn tại", và phủ định của "tồn tại" là "với mọi", đồng thời phải phủ định cả tính chất P(x).',
        chalkboardNotes: '5. MỆNH ĐỀ CHỨA KÍ HIỆU ∀, ∃\n• ∀: "Với mọi" (tất cả phần tử).\n• ∃: "Tồn tại" (ít nhất một phần tử).\n• Phủ định:\n  overline(∀x ∈ M, P(x)) <=> ∃x ∈ M, overline(P(x))\n  overline(∃x ∈ M, P(x)) <=> ∀x ∈ M, overline(P(x))',
        sections: [
          {
            id: 'sec-md-6-a',
            title: 'a) Kí Hiệu ∀ (Với mọi) và ∃ (Tồn tại)',
            content: '• Kí hiệu $\\forall$ đọc là "với mọi": "$\\forall x \\in M, P(x)$" khẳng định $P(x)$ đúng với mọi $x \\in M$.\n• Kí hiệu $\\exists$ đọc là "tồn tại" (hoặc "có ít nhất một"): "$\\exists x \\in M, P(x)$" khẳng định có ít nhất một $x \\in M$ để $P(x)$ đúng.',
            practices: [
              {
                id: 'pr-md-qmark-10',
                title: 'Câu hỏi (?) SGK Trang 10: Xét tính đúng sai',
                problem: 'Xác định tính đúng sai của hai mệnh đề sau:\n$P$: "$\\forall x \\in \\mathbb{R}, x^2 \\ge 0$";\n$Q$: "$\\exists x \\in \\mathbb{Q}, x^2 = 2$".',
                hint: 'Bình phương mọi số thực không âm; căn bậc hai của 2 là số vô tỉ.',
                solution: '• Mệnh đề $P$ là ĐÚNG (vì bình phương của bất kì số thực nào cũng không âm).\n• Mệnh đề $Q$ là SAI (vì phương trình $x^2 = 2$ chỉ có nghiệm $x = \\pm\\sqrt{2}$, mà $\\pm\\sqrt{2} \\notin \\mathbb{Q}$ là số vô tỉ).'
              },
              {
                id: 'pr-md-5',
                title: 'Luyện tập 5 (SGK Trang 10): Phát biểu bằng lời',
                problem: 'Phát biểu bằng lời mệnh đề sau và cho biết mệnh đề đó đúng hay sai:\n$$\\forall x \\in \\mathbb{R}, x^2 + 1 \\le 0$$',
                hint: '$x^2 \\ge 0 \\implies x^2 + 1 \\ge 1 > 0$.',
                solution: '• Phát biểu bằng lời: "Với mọi số thực $x$, tổng bình phương của $x$ và 1 luôn nhỏ hơn hoặc bằng 0" (hoặc "Bình phương của mọi số thực cộng 1 không vượt quá 0").\n• Tính đúng sai: Mệnh đề này là SAI (vì với mọi $x \\in \\mathbb{R}$ ta luôn có $x^2 + 1 \\ge 1 > 0$).'
              }
            ]
          },
          {
            id: 'sec-md-6-b',
            title: 'b) Phủ Định Của Mệnh Đề Chứa Kí Hiệu ∀, ∃',
            content: 'Xét mệnh đề: "Mọi số tự nhiên nhân với 1 đều bằng chính nó". Phủ định của mệnh đề này là: "Có một số tự nhiên nhân với 1 không bằng chính nó".\nNhư vậy, mệnh đề phủ định của $P: "\\forall n \\in \\mathbb{N}, n \\cdot 1 = n"$ là $\\overline{P}: "\\exists n \\in \\mathbb{N}, n \\cdot 1 \\neq n"$.',
            takeaway: '**BẢNG QUY TẮC PHỦ ĐỊNH MỆNH ĐỀ LƯỢNG TỪ**:\n$$\\overline{\\forall x \\in M, P(x)} \\quad \\iff \\quad \\exists x \\in M, \\overline{P(x)}$$\n$$\\overline{\\exists x \\in M, P(x)} \\quad \\iff \\quad \\forall x \\in M, \\overline{P(x)}$$',
            examples: [
              {
                id: 'ex-md-6',
                title: 'Ví dụ 6 (SGK Trang 10): Viết mệnh đề phủ định',
                problem: 'Viết mệnh đề phủ định của mệnh đề sau và xác định tính đúng sai của nó:\n$P$: "$\\exists x \\in \\mathbb{R}, x^2 + 1 = 0$".',
                solutionSteps: [
                  'Mệnh đề $P$ có thể phát biểu là: "Tồn tại một số thực mà bình phương của nó cộng với 1 bằng 0".',
                  'Phủ định của mệnh đề $P$ là $\\overline{P}$: "Mọi số thực đều có bình phương cộng với 1 khác 0", tức là:\n$$\\overline{P}: \\forall x \\in \\mathbb{R}, x^2 + 1 \\neq 0$$',
                  'Vì $x^2 \\ge 0 \\implies x^2 + 1 \\ge 1 > 0 \\implies x^2 + 1 \\neq 0$ với mọi $x \\in \\mathbb{R}$ nên mệnh đề phủ định $\\overline{P}$ là ĐÚNG.'
                ],
                finalAnswer: 'Mệnh đề phủ định là $\\overline{P}: \\forall x \\in \\mathbb{R}, x^2 + 1 \\neq 0$ (Mệnh đề ĐÚNG).'
              }
            ],
            practices: [
              {
                id: 'pr-md-6',
                title: 'Luyện tập 6 (SGK Trang 10): Tranh luận của Nam và Mai',
                problem: 'Trong tiết học Toán, Nam phát biểu: "Mọi số thực đều có bình phương khác 1". Mai phát biểu: "Có một số thực mà bình phương của nó bằng 1".\na) Hãy cho biết bạn nào phát biểu đúng?\nb) Dùng kí hiệu $\\forall, \\exists$ để viết lại các phát biểu của Nam và Mai.',
                hint: '$1^2 = 1$ và $(-1)^2 = 1$.',
                solution: 'a) Bạn Mai phát biểu đúng (vì với $x = 1 \\in \\mathbb{R}$ thì $1^2 = 1$). Bạn Nam phát biểu sai.\nb) Viết bằng kí hiệu:\n• Phát biểu của Nam: "$\\forall x \\in \\mathbb{R}, x^2 \\neq 1$".\n• Phát biểu của Mai: "$\\exists x \\in \\mathbb{R}, x^2 = 1$".'
              }
            ]
          }
        ]
      },
      {
        id: 'slide-md-7',
        slideNumber: 7,
        title: 'HỆ THỐNG BÀI TẬP SGK (TRANG 11)',
        subtitle: 'Lời Giải Chi Tiết Các Bài Tập Từ 1.1 Đến 1.7 Theo Chuẩn Đáp Án SGK',
        category: 'example',
        layout: 'split_two_col',
        keyFormula: '\\text{Bài 1.1 } \\to \\text{ 1.7 SGK}',
        suggestedDurationMin: 8,
        teacherSpeechGuide: 'Hướng dẫn học sinh các dạng bài tập: Nhận biết mệnh đề, xác định tính đúng sai, lập mệnh đề đảo, lập mệnh đề phủ định có chứa lượng từ.',
        chalkboardNotes: 'BÀI TẬP SGK TRANG 11\n• 1.1: Nhận biết câu là mệnh đề.\n• 1.2: Tính đúng sai.\n• 1.3: Mệnh đề tương đương.\n• 1.4: Mệnh đề đảo.\n• 1.5: P => Q và Q => P.\n• 1.6: Phủ định mệnh đề chia hết.\n• 1.7: Viết mệnh đề bằng kí hiệu ∀, ∃.',
        sections: [
          {
            id: 'sec-md-7-a',
            title: 'Bài Tập 1.1 & 1.2: Nhận Biết & Tính Đúng Sai',
            content: '• **Bài 1.1**: a) "Trung Quốc là nước đông dân nhất thế giới" $\\rightarrow$ Là mệnh đề; b) "Bạn học trường nào?" $\\rightarrow$ Câu hỏi, không phải mệnh đề; c) "Không được làm việc riêng trong giờ học" $\\rightarrow$ Câu mệnh lệnh, không phải mệnh đề; d) "Tôi sẽ sút bóng trúng xà ngang" $\\rightarrow$ Dự đoán tương lai chưa xác định đúng sai, không phải mệnh đề.\n• **Bài 1.2**: a) $\\pi < \\frac{10}{3}$ (ĐÚNG, vì $\\pi \\approx 3{,}1416 < 3{,}3333$); b) "Phương trình $3x + 7 = 0$ có nghiệm" (ĐÚNG, nghiệm $x = -\\frac{7}{3}$); c) "Có ít nhất một số cộng với chính nó bằng 0" (ĐÚNG, số 0 vì $0 + 0 = 0$); d) "$2022$ là hợp số" (ĐÚNG, vì $2022$ chia hết cho 2 và 3).'
          },
          {
            id: 'sec-md-7-b',
            title: 'Bài Tập 1.3 - 1.7: Kéo Theo, Đảo, Tương Đương & Lượng Từ',
            content: '• **Bài 1.3**: Phát biểu $P \\Leftrightarrow Q$: "Tam giác $ABC$ là tam giác vuông khi và chỉ khi tam giác $ABC$ có một góc bằng tổng hai góc còn lại" $\\rightarrow$ Mệnh đề tương đương ĐÚNG.\n• **Bài 1.4**: Mệnh đề đảo của $P$: "Nếu số tự nhiên $n$ chia hết cho 5 thì $n$ có chữ số tận cùng là 5" (SAI, vì có thể tận cùng bằng 0). Mệnh đề đảo của $Q$: "Nếu tứ giác $ABCD$ có hai đường chéo bằng nhau thì tứ giác $ABCD$ là hình chữ nhật" (SAI, hình thang cân có 2 đường chéo bằng nhau).\n• **Bài 1.5**: Xét $P$: "$a^2 < b^2$" và $Q$: "$0 < a < b$". Mệnh đề $P \\Rightarrow Q$ SAI (ví dụ $a = -2, b = 3$ thì $(-2)^2 < 3^2$ nhưng $a < 0$). Mệnh đề đảo $Q \\Rightarrow P$ ĐÚNG.\n• **Bài 1.6**: $Q: "\\exists n \\in \\mathbb{N}, n \\text{ chia hết cho } n + 1"$. Mệnh đề $Q$ ĐÚNG (với $n = 0$, $0 \\vdots 1$). Mệnh đề phủ định $\\overline{Q}: "\\forall n \\in \\mathbb{N}, n \\text{ không chia hết cho } n + 1"$ (Mệnh đề $\\overline{Q}$ SAI).\n• **Bài 1.7**: $P: "\\forall n \\in \\mathbb{N}, n^2 \\ge n"$ (Đúng); $Q: "\\exists n \\in \\mathbb{N}, n + n = 0"$ (Đúng, $n = 0$).'
          }
        ]
      },
      {
        id: 'slide-md-8',
        slideNumber: 8,
        title: 'TỔNG KẾT BÀI HỌC & EM CÓ BIẾT?',
        subtitle: 'Sơ Đồ Tư Duy Lôgic Toán Học và Lịch Sử Phát Triển Của Lôgic Học (SGK Trang 11)',
        category: 'summary',
        layout: 'split_two_col',
        keyFormula: 'P \\to \\overline{P} \\to P \\implies Q \\to P \\iff Q \\to \\forall, \\exists',
        suggestedDurationMin: 6,
        teacherSpeechGuide: 'Tóm tắt toàn bộ bài học qua 5 nhánh tư duy và truyền cảm hứng cho học sinh qua câu chuyện lịch sử về Aristotle và George Boole.',
        chalkboardNotes: 'TỔNG KẾT BÀI 1:\n1. Mệnh đề: Khẳng định đúng hoặc sai.\n2. Phủ định: \\overline{P} (ngược tính đúng sai).\n3. Kéo theo: P => Q (Đủ/Cần). Đảo: Q => P.\n4. Tương đương: P <=> Q (Cần và đủ).\n5. Lượng từ: ∀ (với mọi), ∃ (tồn tại).\nEm có biết: Aristotle (Lôgic hình thức) & George Boole (Đại số Boole - nền tảng máy tính).',
        sections: [
          {
            id: 'sec-md-8-summary',
            title: '1. Sơ Đồ Tư Duy Toàn Bộ Bài Học',
            content: 'Bản đồ 5 nhánh kiến thức cốt lõi:',
            bulletPoints: [
              '**1. Mệnh đề**: Là khẳng định hoặc đúng hoặc sai. Không thể vừa đúng vừa sai.',
              '**2. Mệnh đề phủ định ($\\overline{P}$)**: $P$ đúng $\\iff \\overline{P}$ sai; $P$ sai $\\iff \\overline{P}$ đúng.',
              '**3. Mệnh đề kéo theo ($P \\Rightarrow Q$) & Mệnh đề đảo ($Q \\Rightarrow P$)**: $P$ là điều kiện đủ, $Q$ là điều kiện cần. Mệnh đề đảo chưa chắc đúng.',
              '**4. Mệnh đề tương đương ($P \\Leftrightarrow Q$)**: Đúng khi cả hai chiều thuận và đảo cùng đúng. "$P$ là điều kiện cần và đủ để có $Q$".',
              '**5. Kí hiệu $\\forall, \\exists$**: Quy tắc phủ định $\\overline{\\forall} \\to \\exists$ và $\\overline{\\exists} \\to \\forall$.'
            ]
          },
          {
            id: 'sec-md-8-em-co-biet',
            title: '2. Em Có Biết? - Lịch Sử Lôgic Học (SGK Trang 11)',
            content: 'Những mốc son vĩ đại hình thành nên nền tảng máy tính hiện đại:',
            bulletPoints: [
              '🏛️ **Aristotle (384 – 322 TCN)**: Nhà triết học Hy Lạp cổ đại, là người đầu tiên phát triển Lôgic mệnh đề một cách hệ thống hơn 2.300 năm trước.',
              '💻 **George Boole (1815 – 1864)**: Nhà toán học người Anh, đã đại số hóa lôgic trong cuốn sách kinh điển *"The Laws of Thought"* (1854). Đại số Boole (0 và 1, Đúng và Sai) chính là nền tảng cốt lõi của toàn bộ máy vi tính và Trí tuệ Nhân tạo ngày nay!'
            ],
            callout: {
              type: 'tip',
              title: 'Ứng dụng trong thời đại AI',
              content: 'Tư duy logic mệnh đề chính là ngôn ngữ nhị phân (Binary) và câu lệnh điều kiện (IF... THEN...) vận hành mọi phần mềm trên toàn thế giới!'
            }
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q-md-1',
        questionNumber: 1,
        type: 'multiple_choice',
        difficulty: 'easy',
        targetConcept: 'Nhận biết mệnh đề',
        prompt: 'Trong các câu sau, câu nào là **mệnh đề**?',
        options: [
          { key: 'A', text: 'Hôm nay trời đẹp quá!', isCorrect: false, explanation: 'Câu cảm thán không phải là mệnh đề.' },
          { key: 'B', text: 'Bạn có thích học môn Toán không?', isCorrect: false, explanation: 'Câu hỏi nghi vấn không phải là mệnh đề.' },
          { key: 'C', text: '$15$ là số nguyên tố.', isCorrect: true, explanation: 'Đây là câu khẳng định sai, do đó là một mệnh đề (mệnh đề sai).' },
          { key: 'D', text: 'Hãy làm bài tập về nhà đi!', isCorrect: false, explanation: 'Câu cầu khiến/mệnh lệnh không phải là mệnh đề.' }
        ],
        detailedSolution: 'Mệnh đề là câu khẳng định có tính đúng hoặc sai rõ ràng. Câu C là câu khẳng định (sai vì 15 chia hết cho 3 và 5) nên là mệnh đề.',
        hint: 'Mệnh đề phải là câu khẳng định chắc chắn đúng hoặc chắc chắn sai.'
      },
      {
        id: 'q-md-2',
        questionNumber: 2,
        type: 'multiple_choice',
        difficulty: 'medium',
        targetConcept: 'Phủ định của mệnh đề chứa lượng từ',
        prompt: 'Mệnh đề phủ định của mệnh đề $P: "\\forall x \\in \\mathbb{R}, x^2 - x + 7 > 0"$ là:',
        options: [
          { key: 'A', text: '$\\overline{P}: "\\exists x \\in \\mathbb{R}, x^2 - x + 7 \\le 0"$', isCorrect: true },
          { key: 'B', text: '$\\overline{P}: "\\forall x \\in \\mathbb{R}, x^2 - x + 7 \\le 0"$', isCorrect: false },
          { key: 'C', text: '$\\overline{P}: "\\exists x \\in \\mathbb{R}, x^2 - x + 7 < 0"$', isCorrect: false },
          { key: 'D', text: '$\\overline{P}: "\\forall x \\in \\mathbb{R}, x^2 - x + 7 < 0"$', isCorrect: false }
        ],
        detailedSolution: 'Áp dụng quy tắc phủ định mệnh đề lượng từ:\n• $\\overline{\\forall} \\to \\exists$\n• Phủ định của dấu "$>$" là "$\\le$".\nDo đó: $\\overline{P}: "\\exists x \\in \\mathbb{R}, x^2 - x + 7 \\le 0"$.',
        hint: 'Phủ định của "với mọi" là "tồn tại", và phủ định của ">" là "≤".'
      },
      {
        id: 'q-md-3',
        questionNumber: 3,
        type: 'multiple_choice',
        difficulty: 'medium',
        targetConcept: 'Điều kiện cần và đủ',
        prompt: 'Cho định lý: "Nếu hai góc đối đỉnh thì hai góc đó bằng nhau". Khẳng định nào sau đây là **đúng**?',
        options: [
          { key: 'A', text: 'Hai góc đối đỉnh là điều kiện cần để hai góc đó bằng nhau.', isCorrect: false },
          { key: 'B', text: 'Hai góc đối đỉnh là điều kiện đủ để hai góc đó bằng nhau.', isCorrect: true },
          { key: 'C', text: 'Hai góc bằng nhau là điều kiện đủ để hai góc đó đối đỉnh.', isCorrect: false },
          { key: 'D', text: 'Hai góc đối đỉnh là điều kiện cần và đủ để hai góc đó bằng nhau.', isCorrect: false }
        ],
        detailedSolution: 'Định lý có dạng $P \\Rightarrow Q$ với $P$: "hai góc đối đỉnh" và $Q$: "hai góc bằng nhau". Khi đó $P$ là điều kiện đủ để có $Q$, và $Q$ là điều kiện cần để có $P$. Mệnh đề đảo $Q \\Rightarrow P$ sai nên không phải là điều kiện cần và đủ.',
        hint: 'Trong $P \\Rightarrow Q$, $P$ là điều kiện đủ, $Q$ là điều kiện cần.'
      },
      {
        id: 'q-md-4',
        questionNumber: 4,
        type: 'multiple_choice',
        difficulty: 'hard',
        targetConcept: 'Tính đúng sai của mệnh đề kéo theo',
        prompt: 'Trong các mệnh đề kéo theo sau, mệnh đề nào là mệnh đề **sai**?',
        options: [
          { key: 'A', text: 'Nếu tam giác $ABC$ đều thì tam giác $ABC$ cân.', isCorrect: false },
          { key: 'B', text: 'Nếu số tự nhiên $n$ chia hết cho 6 thì $n$ chia hết cho 3.', isCorrect: false },
          { key: 'C', text: 'Nếu tứ giác $ABCD$ có hai đường chéo bằng nhau thì tứ giác $ABCD$ là hình chữ nhật.', isCorrect: true },
          { key: 'D', text: 'Nếu $a = b$ thì $a^2 = b^2$.', isCorrect: false }
        ],
        detailedSolution: 'Xét câu C: Hình thang cân có hai đường chéo bằng nhau nhưng không phải là hình chữ nhật. Do đó mệnh đề C là mệnh đề sai.',
        hint: 'Hãy tìm một phản ví dụ hình học (ví dụ hình thang cân).'
      },
      {
        id: 'q-md-5',
        questionNumber: 5,
        type: 'true_false',
        difficulty: 'medium',
        targetConcept: 'Xác định tính đúng sai của các mệnh đề cơ bản',
        prompt: 'Xét tính Đúng / Sai của các khẳng định sau về mệnh đề và mệnh đề logic:',
        tfStatements: [
          {
            id: 'tf-md-1',
            statement: 'Câu "$x^2 + 1 > 0$" với $x \\in \\mathbb{R}$ là một mệnh đề đúng.',
            isCorrect: true,
            explanation: 'Đúng. Vì với mọi số thực $x$, ta luôn có $x^2 \\ge 0 \\implies x^2 + 1 \\ge 1 > 0$.'
          },
          {
            id: 'tf-md-2',
            statement: 'Mệnh đề đảo của một mệnh đề đúng thì luôn luôn đúng.',
            isCorrect: false,
            explanation: 'Sai. Nhận xét SGK: Mệnh đề đảo của một mệnh đề đúng không nhất thiết là đúng.'
          },
          {
            id: 'tf-md-3',
            statement: 'Mệnh đề "$P \\Leftrightarrow Q$" đúng khi và chỉ khi $P$ và $Q$ cùng đúng hoặc cùng sai.',
            isCorrect: true,
            explanation: 'Đúng. Đây là định nghĩa bảng chân trị của mệnh đề tương đương.'
          },
          {
            id: 'tf-md-4',
            statement: 'Phủ định của mệnh đề "$\\exists n \\in \\mathbb{N}, n^2 = n$" là "$\\forall n \\in \\mathbb{N}, n^2 \\neq n$".',
            isCorrect: true,
            explanation: 'Đúng. Quy tắc: $\\overline{\\exists} \\to \\forall$ và $=$ thành $\\neq$.'
          }
        ],
        detailedSolution: 'Phân tích kỹ lưỡng định nghĩa và quy tắc biến đổi lượng từ.',
        hint: 'Nhớ các nhận xét SGK về mệnh đề đảo và quy tắc phủ định lượng từ.'
      },
      {
        id: 'q-md-6',
        questionNumber: 6,
        type: 'true_false',
        difficulty: 'hard',
        targetConcept: 'Mệnh đề chứa kí hiệu lượng từ ∀ và ∃',
        prompt: 'Xác định tính Đúng / Sai của các mệnh đề chứa kí hiệu $\\forall$ và $\\exists$ sau:',
        tfStatements: [
          {
            id: 'tf-md-5',
            statement: '$\\exists x \\in \\mathbb{R}, x^2 + 2x + 3 = 0$.',
            isCorrect: false,
            explanation: 'Sai. Phương trình có $\\Delta\' = 1^2 - 3 = -2 < 0$ nên vô nghiệm trên $\\mathbb{R}$.'
          },
          {
            id: 'tf-md-6',
            statement: '$\\forall n \\in \\mathbb{N}, n(n+1)$ chia hết cho 2.',
            isCorrect: true,
            explanation: 'Đúng. Tích của hai số tự nhiên liên tiếp luôn là một số chẵn nên luôn chia hết cho 2.'
          },
          {
            id: 'tf-md-7',
            statement: '$\\exists x \\in \\mathbb{Q}, x^2 = 3$.',
            isCorrect: false,
            explanation: 'Sai. $x^2 = 3 \\implies x = \\pm\\sqrt{3} \\notin \\mathbb{Q}$ (là số vô tỉ).'
          },
          {
            id: 'tf-md-8',
            statement: '$\\forall x \\in \\mathbb{R}, |x| \\ge x$.',
            isCorrect: true,
            explanation: 'Đúng. Theo tính chất giá trị tuyệt đối, $|x| \\ge x$ với mọi số thực $x$.'
          }
        ],
        detailedSolution: 'Sử dụng các kiến thức đại số: nghiệm phương trình bậc hai, tính chất số chẵn/lẻ, số vô tỉ và giá trị tuyệt đối.',
        hint: 'Kiểm tra biệt thức delta và tính chất tích 2 số liên tiếp.'
      },
      {
        id: 'q-md-7',
        questionNumber: 7,
        type: 'short_answer',
        difficulty: 'medium',
        targetConcept: 'Tìm giá trị biến thỏa mãn mệnh đề chứa biến',
        prompt: 'Có bao nhiêu giá trị nguyên $x \\in [-3; 3]$ để mệnh đề chứa biến $P(x): "x^2 - 4 < 0"$ trở thành một mệnh đề đúng?',
        correctShortAnswer: '3',
        acceptableAnswers: ['3', '3 giá trị', 'x = -1, 0, 1'],
        unitOrFormat: 'số nguyên',
        detailedSolution: 'Ta có $x^2 - 4 < 0 \\iff x^2 < 4 \\iff -2 < x < 2$.\nCác giá trị nguyên $x \\in [-3; 3]$ thỏa mãn là $x \\in \\{-1; 0; 1\\}$.\nVậy có tất cả 3 giá trị nguyên thỏa mãn.',
        hint: 'Giải bất phương trình $x^2 < 4$.'
      },
      {
        id: 'q-md-8',
        questionNumber: 8,
        type: 'short_answer',
        difficulty: 'hard',
        targetConcept: 'Đếm số mệnh đề đúng trong tập hợp',
        prompt: 'Trong 4 khẳng định sau, có bao nhiêu khẳng định là **mệnh đề đúng**?\n1) $\\forall x \\in \\mathbb{R}, x^2 + 4 > 0$.\n2) $\\exists n \\in \\mathbb{N}, n^2 + 1 \\text{ là số nguyên tố}$.\n3) $\\forall x \\in \\mathbb{R}, x > 1 \\implies x^2 > 1$.\n4) $\\forall x \\in \\mathbb{R}, x^2 > 1 \\implies x > 1$.',
        correctShortAnswer: '3',
        acceptableAnswers: ['3', '3 mệnh đề', '3 mệnh đề đúng'],
        unitOrFormat: 'số lượng',
        detailedSolution: '1) $x^2 + 4 \\ge 4 > 0$ với mọi $x \\in \\mathbb{R}$ $\\implies$ ĐÚNG.\n2) Với $n = 1 \\implies n^2 + 1 = 2$ (là số nguyên tố) $\\implies$ ĐÚNG.\n3) Với $x > 1 \\implies x^2 > 1$ $\\implies$ ĐÚNG.\n4) Với $x = -2 \\implies x^2 = 4 > 1$ nhưng $x = -2 < 1$ $\\implies$ SAI.\nVậy có 3 mệnh đề đúng.',
        hint: 'Khẳng định 4 có phản ví dụ số âm $x = -2$.'
      },
      {
        id: 'q-md-9',
        questionNumber: 9,
        type: 'essay',
        difficulty: 'hard',
        targetConcept: 'Lập luận logic mệnh đề và chứng minh phản ví dụ',
        prompt: 'Cho hai mệnh đề chứa biến với $x$ là số thực:\n$P(x)$: "$x^2 - 5x + 6 = 0$"\n$Q(x)$: "$x = 2$ hoặc $x = 3$"\na) Phát biểu mệnh đề kéo theo $P(x) \\Rightarrow Q(x)$ và mệnh đề đảo $Q(x) \\Rightarrow P(x)$.\nb) Hai mệnh đề $P(x)$ và $Q(x)$ có tương đương với nhau không? Vì sao?\nc) Lập mệnh đề phủ định của mệnh đề: "$\\forall x \\in \\mathbb{R}, x^2 - 5x + 6 = 0 \\implies x > 0$".',
        essayRubric: {
          totalPoints: 10,
          steps: [
            {
              stepTitle: 'Phát biểu mệnh đề kéo theo và mệnh đề đảo',
              points: 3,
              criteria: 'Phát biểu chính xác câu dạng "Nếu... thì..." cho cả hai chiều.',
              sampleContent: '• $P(x) \\Rightarrow Q(x)$: "Nếu $x^2 - 5x + 6 = 0$ thì $x = 2$ hoặc $x = 3$".\n• $Q(x) \\Rightarrow P(x)$: "Nếu $x = 2$ hoặc $x = 3$ thì $x^2 - 5x + 6 = 0$".'
            },
            {
              stepTitle: 'Chứng minh tính tương đương',
              points: 4,
              criteria: 'Giải phương trình và khẳng định cả 2 chiều đều đúng nên $P(x) \\Leftrightarrow Q(x)$.',
              sampleContent: 'Phương trình bậc hai $x^2 - 5x + 6 = 0 \\iff (x-2)(x-3) = 0 \\iff x = 2$ hoặc $x = 3$.\nVì cả hai mệnh đề thuận $P(x) \\Rightarrow Q(x)$ và đảo $Q(x) \\Rightarrow P(x)$ đều là các mệnh đề đúng, nên $P(x)$ và $Q(x)$ là hai mệnh đề tương đương nhau ($P(x) \\Leftrightarrow Q(x)$).'
            },
            {
              stepTitle: 'Lập mệnh đề phủ định có chứa lượng từ',
              points: 3,
              criteria: 'Áp dụng quy tắc phủ định mệnh đề kéo theo và lượng từ với mọi.',
              sampleContent: 'Mệnh đề ban đầu là $A: \\forall x \\in \\mathbb{R}, P(x) \\implies x > 0$.\nMệnh đề phủ định là: $\\overline{A}: "\\exists x \\in \\mathbb{R}, x^2 - 5x + 6 = 0 \\text{ nhưng } x \\le 0"$. (Mệnh đề $\\overline{A}$ sai vì 2 nghiệm đều là số dương 2 và 3).'
            }
          ]
        },
        detailedSolution: 'a) $P(x) \\Rightarrow Q(x)$ và $Q(x) \\Rightarrow P(x)$.\nb) $P(x) \\Leftrightarrow Q(x)$ vì hai tập nghiệm trùng nhau.\nc) $\\overline{A}: "\\exists x \\in \\mathbb{R}, x^2 - 5x + 6 = 0 \\text{ và } x \\le 0"$.',
        hint: 'Phương trình $x^2 - 5x + 6 = 0$ có 2 nghiệm $x = 2$ và $x = 3$.'
      }
    ],
    summary: {
      topicTitle: 'Mệnh Đề (Lôgic Toán Học)',
      gradeLevel: 'Toán Lớp 10 - Kết Nối Tri Thức',
      mainOverview: 'Mệnh đề là nền tảng cơ bản của Lôgic toán học, giúp xây dựng phương pháp lập luận chặt chẽ, phát biểu định lý và chứng minh toán học chính xác.',
      coreConcepts: [
        {
          id: 'c-md-1',
          term: 'Mệnh đề & Mệnh đề chứa biến',
          definition: 'Mỗi mệnh đề phải hoặc đúng hoặc sai, không thể vừa đúng vừa sai. Mệnh đề chứa biến là câu khẳng định chứa biến số, tính đúng sai phụ thuộc vào giá trị của biến.',
          formula: 'P \\in \\{\\text{ĐÚNG}, \\text{SAI}\\}, \\quad P(x)',
          example: '"17 là số nguyên tố" (Mệnh đề đúng); "$x > 5$" (Mệnh đề chứa biến).',
          importance: 'essential'
        },
        {
          id: 'c-md-2',
          term: 'Mệnh đề phủ định (P ngang)',
          definition: 'Mệnh đề P và P ngang là hai phát biểu trái ngược nhau. P đúng thì P ngang sai, P sai thì P ngang đúng.',
          formula: 'P \\iff \\neg(\\overline{P})',
          example: 'P: "2022 chia hết cho 5" -> P ngang: "2022 không chia hết cho 5".',
          importance: 'essential'
        },
        {
          id: 'c-md-3',
          term: 'Mệnh đề kéo theo & Đảo',
          definition: 'P => Q: "Nếu P thì Q". P là giả thiết (điều kiện đủ), Q là kết luận (điều kiện cần). Q => P là mệnh đề đảo.',
          formula: 'P \\implies Q, \\quad Q \\implies P',
          example: 'Tam giác đều => Tam giác cân (Đúng). Đảo: Tam giác cân => Tam giác đều (Sai).',
          importance: 'essential'
        },
        {
          id: 'c-md-4',
          term: 'Mệnh đề tương đương (P <=> Q)',
          definition: 'P <=> Q đúng khi và chỉ khi cả P => Q và Q => P đều đúng. P là điều kiện cần và đủ để có Q.',
          formula: 'P \\iff Q',
          example: 'Tứ giác là hình vuông <=> Hình chữ nhật có 2 đường chéo vuông góc.',
          importance: 'essential'
        },
        {
          id: 'c-md-5',
          term: 'Kí hiệu ∀ (với mọi) và ∃ (tồn tại)',
          definition: '∀ biểu thị tính đúng đắn với mọi phần tử; ∃ biểu thị sự tồn tại của ít nhất một phần tử thỏa mãn.',
          formula: '\\overline{\\forall x, P(x)} = \\exists x, \\overline{P(x)}, \\quad \\overline{\\exists x, P(x)} = \\forall x, \\overline{P(x)}',
          example: 'Phủ định của "Mọi số đều > 0" là "Tồn tại ít nhất một số <= 0".',
          importance: 'essential'
        }
      ],
      goldenFormulas: [
        {
          id: 'gf-md-1',
          name: 'Quy tắc chân trị phủ định',
          latex: 'P \\text{ đúng} \\iff \\overline{P} \\text{ sai}',
          description: 'Hai phát biểu luôn có tính đúng sai trái ngược nhau.'
        },
        {
          id: 'gf-md-2',
          name: 'Phủ định lượng từ Với Mọi',
          latex: '\\overline{\\forall x \\in M, P(x)} \\iff \\exists x \\in M, \\overline{P(x)}',
          description: 'Phủ định của "với mọi" là "tồn tại", đồng thời phủ định vị ngữ P(x).'
        },
        {
          id: 'gf-md-3',
          name: 'Phủ định lượng từ Tồn Tại',
          latex: '\\overline{\\exists x \\in M, P(x)} \\iff \\forall x \\in M, \\overline{P(x)}',
          description: 'Phủ định của "tồn tại" là "với mọi", đồng thời phủ định vị ngữ P(x).'
        },
        {
          id: 'gf-md-4',
          name: 'Điều kiện cần và đủ',
          latex: 'P \\iff Q \\iff (P \\implies Q \\text{ và } Q \\implies P)',
          description: 'P tương đương Q khi cả hai định lý thuận và đảo đều cùng đúng.'
        }
      ],
      commonPitfalls: [
        {
          id: 'pf-md-1',
          title: 'Nhầm câu cảm thán, câu hỏi là mệnh đề',
          wrongWay: 'Cho rằng câu "Hôm nay trời đẹp quá!" là mệnh đề đúng vì thấy trời đang nắng đẹp.',
          rightWay: 'Câu cảm thán mang tính cảm tính chủ quan, không phải là mệnh đề logic.',
          explanation: 'Mệnh đề bắt buộc phải có tính đúng sai khách quan tuyệt đối.'
        },
        {
          id: 'pf-md-2',
          title: 'Quên đổi lượng từ khi phủ định',
          wrongWay: 'Phủ định của "∀x ∈ ℝ, x² > 0" là "∀x ∈ ℝ, x² ≤ 0".',
          rightWay: 'Phải đổi ∀ thành ∃: "∃x ∈ ℝ, x² ≤ 0".',
          explanation: 'Chỉ cần tồn tại MỘT phần tử sai là đủ để phủ định tính "với mọi".'
        },
        {
          id: 'pf-md-3',
          title: 'Ngộ nhận mệnh đề đảo luôn đúng',
          wrongWay: 'Nghĩ rằng "Nếu a chia hết cho 6 thì a chia hết cho 3" đúng thì "Nếu a chia hết cho 3 thì a chia hết cho 6" cũng đúng.',
          rightWay: 'Mệnh đề đảo chưa chắc đúng. Cần kiểm tra phản ví dụ (như số 9 chia hết cho 3 nhưng không chia hết cho 6).',
          explanation: 'Chiều thuận đúng không suy ra chiều đảo đúng.'
        }
      ],
      mindmapTree: {
        id: 'root-md',
        label: 'Bài 1: Mệnh Đề',
        color: 'indigo',
        children: [
          {
            id: 'node-md-1',
            label: '1. Khái Niệm Mệnh Đề',
            color: 'sky',
            children: [
              { id: 'node-md-1-1', label: 'Khẳng định đúng hoặc sai' },
              { id: 'node-md-1-2', label: 'Mệnh đề toán học' },
              { id: 'node-md-1-3', label: 'Mệnh đề chứa biến P(x)' }
            ]
          },
          {
            id: 'node-md-2',
            label: '2. Mệnh Đề Phủ Định',
            color: 'rose',
            children: [
              { id: 'node-md-2-1', label: 'Kí hiệu P ngang' },
              { id: 'node-md-2-2', label: 'P đúng <=> P ngang sai' }
            ]
          },
          {
            id: 'node-md-3',
            label: '3. Kéo Theo & Đảo',
            color: 'amber',
            children: [
              { id: 'node-md-3-1', label: 'P => Q (Nếu P thì Q)' },
              { id: 'node-md-3-2', label: 'P: Điều kiện ĐỦ, Q: Điều kiện CẦN' },
              { id: 'node-md-3-3', label: 'Mệnh đề đảo: Q => P' }
            ]
          },
          {
            id: 'node-md-4',
            label: '4. Mệnh Đề Tương Đương',
            color: 'emerald',
            children: [
              { id: 'node-md-4-1', label: 'P <=> Q (Khi và chỉ khi)' },
              { id: 'node-md-4-2', label: 'Điều kiện CẦN và ĐỦ' }
            ]
          },
          {
            id: 'node-md-5',
            label: '5. Kí Hiệu ∀ và ∃',
            color: 'purple',
            children: [
              { id: 'node-md-5-1', label: '∀: Với mọi' },
              { id: 'node-md-5-2', label: '∃: Tồn tại ít nhất một' },
              { id: 'node-md-5-3', label: 'Quy tắc phủ định: overline(∀) = ∃, overline(∃) = ∀' }
            ]
          }
        ]
      },
      wrapUpFlashcards: [
        {
          id: 'fc-md-1',
          front: 'Thế nào là một Mệnh đề logic?',
          back: 'Là một câu khẳng định có tính đúng hoặc sai. Một mệnh đề không thể vừa đúng vừa sai.',
          category: 'Khái niệm'
        },
        {
          id: 'fc-md-2',
          front: 'Trong định lý P => Q, P và Q là gì?',
          back: 'P là Giả thiết (Điều kiện đủ), Q là Kết luận (Điều kiện cần).',
          category: 'Kéo theo'
        },
        {
          id: 'fc-md-3',
          front: 'Phủ định của mệnh đề "∀x ∈ M, P(x)" là gì?',
          back: '∃x ∈ M, P(x) ngang (Tồn tại ít nhất một phần tử x thuộc M để P(x) sai).',
          formula: '\\overline{\\forall x \\in M, P(x)} \\iff \\exists x \\in M, \\overline{P(x)}',
          category: 'Lượng từ'
        },
        {
          id: 'fc-md-4',
          front: 'Mệnh đề đảo của một mệnh đề đúng có luôn đúng không?',
          back: 'Không nhất thiết đúng! Ví dụ: "Nếu tam giác đều thì cân" đúng, nhưng "Nếu tam giác cân thì đều" là sai.',
          category: 'Mệnh đề đảo'
        }
      ]
    }
  },
  {
    id: 'lesson-pythagore-hinh-8',
    title: 'Định Lý Pythagore (Pytago) & Ứng Dụng Thực Tiễn',
    grade: 'Toán Lớp 8 - Hình Học',
    chapterOrTopic: 'Tam Giác Vuông & Hệ Thức Lượng',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000,
    sourceImageCount: 2,
    config: {
      totalQuestions: 10,
      numMultipleChoice: 3,
      numTrueFalse: 3,
      numShortAnswer: 2,
      numEssay: 2,
      targetGrade: 'Toán 8 - Cánh Diều / Kết Nối Tri Thức',
      teachingGoal: 'concept_mastery'
    },
    slides: [
      {
        id: 'slide-1',
        slideNumber: 1,
        title: 'BÀI 1: ĐỊNH LÝ PYTHAGORE TRONG TAM GIÁC VUÔNG',
        subtitle: 'Chương trình Hình học Toán 8 - Chuẩn GDPT SGK mới',
        category: 'intro',
        layout: 'standard',
        keyFormula: 'BC^2 = AB^2 + AC^2 \\quad (a^2 + b^2 = c^2)',
        suggestedDurationMin: 5,
        teacherSpeechGuide: 'Chào các em, hôm nay chúng ta sẽ khám phá một trong những định lý kinh điển và quan trọng nhất trong hình học - Định lý Pythagore.',
        chalkboardNotes: 'BÀI: ĐỊNH LÝ PYTHAGORE\n1. Định lý thuận: a^2 + b^2 = c^2\n2. Ví dụ & Luyện tập.',
        objectives: [
          'Hiểu và phát biểu chính xác Định lý Pythagore thuận và đảo',
          'Vận dụng định lý để tính độ dài cạnh chưa biết trong tam giác vuông',
          'Giải quyết bài toán thực tế gắn với đời sống: chiều cao tường, bóng cây, độ dài thang'
        ],
        sections: [
          {
            id: 'sec-1',
            title: '1. Định lý Pythagore Thuận',
            content: 'Trong một tam giác vuông, cạnh đối diện với góc vuông được gọi là **cạnh huyền** (cạnh dài nhất). Hai cạnh kề góc vuông gọi là **hai cạnh góc vuông**.',
            activities: [
              {
                id: 'act-1',
                title: 'Hoạt động 1: Khám phá diện tích hình vuông dựng trên các cạnh',
                description: 'Dựng các hình vuông trên ba cạnh của tam giác vuông có kích thước $a = 3\\text{ cm}, b = 4\\text{ cm}, c = 5\\text{ cm}$.',
                question: 'So sánh tổng diện tích của hai hình vuông nhỏ $S_1 + S_2$ với diện tích hình vuông lớn $S_3$?',
                conclusion: 'Ta có $3^2 + 4^2 = 9 + 16 = 25 = 5^2$. Tổng diện tích hai hình vuông dựng trên hai cạnh góc vuông bằng diện tích hình vuông dựng trên cạnh huyền.'
              }
            ],
            notes: [
              'Định lý Pythagore CHỈ áp dụng đối với TAM GIÁC VUÔNG.',
              'Luôn xác định chính xác đâu là CẠNH HUYỀN (cạnh đối diện góc $90^\\circ$) trước khi lập phương trình.'
            ],
            takeaway: '**Định lý Pythagore (Thuận)**: Trong một tam giác vuông, bình phương độ dài cạnh huyền bằng tổng bình phương độ dài hai cạnh góc vuông:\n$$BC^2 = AB^2 + AC^2 \\iff c^2 = a^2 + b^2$$',
            examples: [
              {
                id: 'ex-1',
                title: 'Ví dụ 1: Tính độ dài cạnh huyền của tam giác vuông',
                problem: 'Cho tam giác $ABC$ vuông tại $A$ có $AB = 6\\text{ cm}$ và $AC = 8\\text{ cm}$. Hãy tính độ dài cạnh huyền $BC$.',
                solutionSteps: [
                  'Bước 1: Áp dụng định lý Pythagore vào tam giác $ABC$ vuông tại $A$, ta có: $BC^2 = AB^2 + AC^2$.',
                  'Bước 2: Thay số: $BC^2 = 6^2 + 8^2 = 36 + 64 = 100$.',
                  'Bước 3: Suy ra độ dài cạnh huyền: $BC = \\sqrt{100} = 10\\text{ cm}$.'
                ],
                finalAnswer: 'Vậy độ dài cạnh huyền $BC = 10\\text{ cm}$.'
              }
            ],
            practices: [
              {
                id: 'pr-1',
                title: 'Luyện tập 1: Tính cạnh góc vuông khi biết cạnh huyền',
                problem: 'Cho tam giác $MNP$ vuông tại $M$ có cạnh huyền $NP = 13\\text{ cm}$ và cạnh góc vuông $MN = 5\\text{ cm}$. Tính độ dài cạnh $MP$?',
                hint: 'Sử dụng hệ thức $MP^2 = NP^2 - MN^2 = 13^2 - 5^2$.',
                solution: 'Áp dụng định lý Pythagore vào $\\Delta MNP$ vuông tại $M$:\n$MP^2 = NP^2 - MN^2 = 13^2 - 5^2 = 169 - 25 = 144 \\Rightarrow MP = \\sqrt{144} = 12\\text{ cm}$.'
              }
            ],
            applications: [
              {
                id: 'app-1',
                title: 'Vận dụng 1: Đo chiều cao tường nhà bằng thang',
                problem: 'Một người thợ kê chiếc thang dài $5\\text{ m}$ dựa vào một bức tường thẳng đứng. Chân thang cách chân tường $3\\text{ m}$. Hỏi đỉnh thang chạm vào tường ở độ cao bao nhiêu mét?',
                solution: 'Mô hình hóa bài toán thành tam giác vuông với cạnh huyền là chiều dài thang $5\\text{ m}$, một cạnh góc vuông là khoảng cách từ chân thang đến tường $3\\text{ m}$. Chiều cao chạm tường $h$ thỏa mãn:\n$$h^2 + 3^2 = 5^2 \\Rightarrow h^2 = 25 - 9 = 16 \\Rightarrow h = \\sqrt{16} = 4\\text{ m}.$$'
              }
            ]
          }
        ]
      },
      {
        id: 'slide-2',
        slideNumber: 2,
        title: 'Khởi Động: Tình Huống Thực Tế Đo Đạc',
        subtitle: 'Làm thế nào để đo khoảng cách giữa hai điểm khi bị ngăn cách bởi vật cản?',
        category: 'intro',
        layout: 'standard',
        keyFormula: 'BC = \\sqrt{AB^2 + AC^2}',
        suggestedDurationMin: 4,
        teacherSpeechGuide: 'Đặt câu hỏi gợi mở: Làm sao hai người thợ xây có thể tạo ra một góc vuông chuẩn xác $90^\\circ$ chỉ với một sợi dây thừng có thắt nút?',
        chalkboardNotes: 'Tình huống mở đầu: Đo khoảng cách qua hồ nước bằng tam giác vuông.',
        sections: [
          {
            title: 'Bài toán mở đầu',
            content: 'Hai bạn An và Bình muốn đo khoảng cách từ điểm $B$ đến điểm $C$ bị ngăn cách bởi một hồ nước:',
            bulletPoints: [
              'Chọn vị trí điểm $A$ sao cho $\\widehat{BAC} = 90^\\circ$ (góc vuông).',
              'Đo được khoảng cách trên bờ: $AB = 30\\text{ m}$ và $AC = 40\\text{ m}$.',
              'Làm thế nào để tính chính xác khoảng cách $BC$ qua mặt nước mà không cần chèo thuyền qua hồ?'
            ],
            callout: {
              type: 'tip',
              title: 'Câu hỏi tư duy',
              content: 'Có mối liên hệ toán học nào giữa ba cạnh $AB, AC$ và $BC$ của tam giác vuông không?'
            }
          }
        ]
      },
      {
        id: 'slide-3',
        slideNumber: 3,
        title: 'Hoạt Động Khám Phá 1: Ghép Hình & Diện Tích',
        subtitle: 'Trải nghiệm trực quan diện tích các hình vuông dựng trên các cạnh',
        category: 'intro',
        layout: 'split_two_col',
        keyFormula: 'S_1 + S_2 = S_3',
        suggestedDurationMin: 5,
        teacherSpeechGuide: 'Hướng dẫn học sinh đếm số ô vuông đơn vị trên từng hình vuông dựng trên 3 cạnh của tam giác vuông $3, 4, 5$.',
        chalkboardNotes: 'HĐ1: Đếm ô vuông -> Diện tích: $3^2 + 4^2 = 9 + 16 = 25 = 5^2$.',
        sections: [
          {
            title: 'Thực hành cắt ghép hình',
            content: 'Vẽ tam giác vuông có hai cạnh góc vuông là $a = 3\\text{ cm}, b = 4\\text{ cm}$:',
            bulletPoints: [
              'Dựng hình vuông có cạnh $a = 3$: Diện tích $S_1 = 3^2 = 9\\text{ cm}^2$.',
              'Dựng hình vuông có cạnh $b = 4$: Diện tích $S_2 = 4^2 = 16\\text{ cm}^2$.',
              'Dựng hình vuông có cạnh huyền $c = 5$: Diện tích $S_3 = 5^2 = 25\\text{ cm}^2$.'
            ]
          },
          {
            title: 'Quan sát & Rút ra quy luật',
            content: 'So sánh tổng diện tích $S_1 + S_2$ với diện tích $S_3$:',
            bulletPoints: [
              'Ta nhận thấy: $S_1 + S_2 = 9 + 16 = 25 = S_3$',
              'Nghĩa là: $3^2 + 4^2 = 5^2$',
              'Quy luật này có đúng với mọi tam giác vuông bất kỳ không?'
            ]
          }
        ]
      },
      {
        id: 'slide-4',
        slideNumber: 4,
        title: 'Định Lý Pythagore (Định Lý Thuận)',
        subtitle: 'Mệnh đề nền tảng về quan hệ cạnh trong tam giác vuông',
        category: 'theorem',
        layout: 'formula_focus',
        keyFormula: 'BC^2 = AB^2 + AC^2',
        suggestedDurationMin: 6,
        teacherSpeechGuide: 'Cho cả lớp đọc đồng thanh phát biểu định lý và ghi nhớ công thức tổng quát.',
        chalkboardNotes: 'I. ĐỊNH LÝ PYTHAGORE THUẬN\n$\\triangle ABC$ vuông tại $A \\implies BC^2 = AB^2 + AC^2$\n(hay $c^2 = a^2 + b^2$).',
        sections: [
          {
            title: 'Phát biểu định lý',
            content: 'Trong một tam giác vuông, bình phương của cạnh huyền bằng tổng các bình phương của hai cạnh góc vuông.',
            callout: {
              type: 'theorem',
              title: 'Công thức tổng quát',
              content: 'Xét $\\triangle ABC$ vuông tại $A$ với $BC = a$ (cạnh huyền), $AC = b, AB = c$ (hai cạnh góc vuông):\n$$a^2 = b^2 + c^2 \\quad \\text{hay} \\quad BC^2 = AB^2 + AC^2$$'
            },
            bulletPoints: [
              '**Cạnh huyền** luôn là cạnh đối diện góc vuông $90^\\circ$ và có độ dài lớn nhất.',
              'Định lý chỉ áp dụng khi tam giác **đã được xác định là vuông**.'
            ]
          }
        ]
      },
      {
        id: 'slide-5',
        slideNumber: 5,
        title: 'Chứng Minh Hình Học Của Pythagore',
        subtitle: 'Cách chứng minh kinh điển bằng phương pháp bảo toàn diện tích',
        category: 'theorem',
        layout: 'split_two_col',
        keyFormula: '(a + b)^2 = 4 \\cdot \\left(\\frac{1}{2}ab\\right) + c^2',
        suggestedDurationMin: 6,
        teacherSpeechGuide: 'Giải thích việc xếp 4 tam giác vuông bằng nhau vào một hình vuông lớn có cạnh bằng $(a + b)$.',
        chalkboardNotes: 'Chứng minh: $S_{\\text{lớn}} = (a+b)^2 = 4 \\cdot (\\frac{1}{2}ab) + c^2 \\implies a^2+2ab+b^2 = 2ab+c^2 \\implies a^2+b^2=c^2$.',
        sections: [
          {
            title: 'Biểu diễn diện tích',
            content: 'Xét hình vuông lớn có cạnh $(a + b)$ tạo bởi 4 tam giác vuông bằng nhau và 1 hình vuông nghiêng ở giữa có cạnh $c$:',
            bulletPoints: [
              'Diện tích hình vuông lớn: $S = (a + b)^2 = a^2 + 2ab + b^2$',
              'Tổng diện tích 4 tam giác vuông: $4 \\times \\left(\\dfrac{1}{2}ab\\right) = 2ab$',
              'Diện tích hình vuông bên trong: $S_{\\text{trong}} = c^2$'
            ]
          },
          {
            title: 'Đẳng thức hoàn tất',
            content: 'Do diện tích hình vuông lớn bằng tổng diện tích các phần ghép lại:',
            bulletPoints: [
              '$(a + b)^2 = 2ab + c^2$',
              '$a^2 + 2ab + b^2 = 2ab + c^2$',
              'Triệt tiêu $2ab$ ở cả hai vế: **$a^2 + b^2 = c^2$** (ĐPCM).'
            ]
          }
        ]
      },
      {
        id: 'slide-6',
        slideNumber: 6,
        title: 'Công Thức Hệ Quả Tính Độ Dài Các Cạnh',
        subtitle: 'Rút ra công thức trực tiếp để tính cạnh huyền và cạnh góc vuông',
        category: 'method',
        layout: 'split_two_col',
        keyFormula: 'c = \\sqrt{a^2 + b^2} \\quad \\text{và} \\quad a = \\sqrt{c^2 - b^2}',
        suggestedDurationMin: 5,
        teacherSpeechGuide: 'Nhấn mạnh sự khác nhau giữa tính cạnh huyền (cộng bình phương) và tính cạnh góc vuông (trừ bình phương).',
        chalkboardNotes: 'Hệ quả:\n• Cạnh huyền: $c = \\sqrt{a^2 + b^2}$\n• Cạnh góc vuông: $a = \\sqrt{c^2 - b^2},\\; b = \\sqrt{c^2 - a^2}$.',
        sections: [
          {
            title: '1. Tính độ dài Cạnh Huyền',
            content: 'Khi đã biết độ dài hai cạnh góc vuông $a$ và $b$:',
            bulletPoints: [
              '$c^2 = a^2 + b^2$',
              'Suy ra: $c = \\sqrt{a^2 + b^2}$ (do $c > 0$)'
            ]
          },
          {
            title: '2. Tính Cạnh Góc Vuông',
            content: 'Khi đã biết cạnh huyền $c$ và một cạnh góc vuông $b$:',
            bulletPoints: [
              '$a^2 = c^2 - b^2$',
              'Suy ra: $a = \\sqrt{c^2 - b^2}$ (do $a > 0$)',
              'Tương tự: $b = \\sqrt{c^2 - a^2}$'
            ],
            callout: {
              type: 'tip',
              title: 'Lưu ý dấu trừ',
              content: 'Khi tìm cạnh góc vuông, luôn lấy **(Cạnh huyền)$^2$ TRỪ (Cạnh góc vuông)$^2$**.'
            }
          }
        ]
      },
      {
        id: 'slide-7',
        slideNumber: 7,
        title: 'Ví Dụ 1 (SGK): Tính Cạnh Huyền Tam Giác Vuông',
        subtitle: 'Áp dụng trực tiếp định lý Pythagore với các số đo thông dụng',
        category: 'example',
        layout: 'example_box',
        suggestedDurationMin: 5,
        teacherSpeechGuide: 'Nhắc học sinh viết rõ tên tam giác và đỉnh vuông trước khi áp dụng công thức.',
        chalkboardNotes: 'Ví dụ 1: Cho $\\triangle ABC$ vuông tại $A$, $AB=6\\text{ cm}, AC=8\\text{ cm}$. Tính $BC$.',
        sections: [
          {
            example: {
              problem: 'Cho $\\triangle ABC$ vuông tại $A$ có $AB = 6\\text{ cm}$ và $AC = 8\\text{ cm}$. Hãy tính độ dài cạnh huyền $BC$.',
              solutionSteps: [
                'Xét $\\triangle ABC$ vuông tại $A$, áp dụng định lý Pythagore ta có:',
                '$$BC^2 = AB^2 + AC^2$$',
                'Thay số vào hệ thức:',
                '$$BC^2 = 6^2 + 8^2 = 36 + 64 = 100$$',
                'Do độ dài đoạn thẳng $BC > 0$, ta có:',
                '$$BC = \\sqrt{100} = 10\\text{ (cm)}$$'
              ],
              finalAnswer: 'Vậy độ dài cạnh huyền $BC = 10\\text{ cm}$.'
            }
          }
        ]
      },
      {
        id: 'slide-8',
        slideNumber: 8,
        title: 'Luyện Tập 1 (SGK): Tính Cạnh Góc Vuông',
        subtitle: 'Kiểm tra nhanh mức độ thành thạo công thức suy biến',
        category: 'example',
        layout: 'example_box',
        suggestedDurationMin: 5,
        teacherSpeechGuide: 'Mời một học sinh lên bảng giải hoặc đọc lời giải từng bước.',
        chalkboardNotes: 'Luyện tập 1: $\\triangle MNP$ vuông tại $M$, $NP=13\\text{ cm}, MN=5\\text{ cm}$. Tính $MP$.',
        sections: [
          {
            example: {
              problem: 'Cho tam giác $MNP$ vuông tại $M$ có cạnh huyền $NP = 13\\text{ cm}$ và cạnh góc vuông $MN = 5\\text{ cm}$. Tính độ dài cạnh góc vuông $MP$.',
              solutionSteps: [
                'Vì $\\triangle MNP$ vuông tại $M$, theo định lý Pythagore:',
                '$$NP^2 = MN^2 + MP^2$$',
                'Suy ra: $$MP^2 = NP^2 - MN^2$$',
                'Thay số: $$MP^2 = 13^2 - 5^2 = 169 - 25 = 144$$',
                'Do $MP > 0$, ta có: $$MP = \\sqrt{144} = 12\\text{ (cm)}$$'
              ],
              finalAnswer: 'Vậy độ dài cạnh góc vuông $MP = 12\\text{ cm}$.'
            }
          }
        ]
      },
      {
        id: 'slide-9',
        slideNumber: 9,
        title: 'Hoạt Động Khám Phá 2: Tam Giác Có Độ Dài 3 - 4 - 5',
        subtitle: 'Từ mối quan hệ bình phương các cạnh suy ra số đo góc',
        category: 'intro',
        layout: 'standard',
        keyFormula: 'a^2 + b^2 = c^2 \\implies \\widehat{A} = 90^\\circ?',
        suggestedDurationMin: 4,
        teacherSpeechGuide: 'Cho học sinh dùng thước đo góc để đo góc đối diện với cạnh $5\\text{ cm}$ trong tam giác có các cạnh $3\\text{ cm}, 4\\text{ cm}, 5\\text{ cm}$.',
        chalkboardNotes: 'HĐ2: Tam giác có $3, 4, 5$ -> Đo góc thấy $\\widehat{A} = 90^\\circ$. Liệu điều ngược lại có luôn đúng?',
        sections: [
          {
            title: 'Thực nghiệm đo đạc',
            content: 'Vẽ tam giác $ABC$ có $AB = 3\\text{ cm}, AC = 4\\text{ cm}, BC = 5\\text{ cm}$:',
            bulletPoints: [
              'Tính tổng bình phương hai cạnh nhỏ: $AB^2 + AC^2 = 3^2 + 4^2 = 9 + 16 = 25$.',
              'Bình phương cạnh lớn nhất: $BC^2 = 5^2 = 25$.',
              'Ta thấy: $BC^2 = AB^2 + AC^2$.',
              'Dùng thước đo góc kiểm tra: Thước chỉ chính xác $\\widehat{BAC} = 90^\\circ$!'
            ]
          }
        ]
      },
      {
        id: 'slide-10',
        slideNumber: 10,
        title: 'Định Lý Pythagore Đảo (Nhận Biết Tam Giác Vuông)',
        subtitle: 'Công cụ hình học sắc bén để chứng minh một góc bằng 90 độ',
        category: 'theorem',
        layout: 'formula_focus',
        keyFormula: 'BC^2 = AB^2 + AC^2 \\implies \\triangle ABC \\text{ vuông tại } A',
        suggestedDurationMin: 6,
        teacherSpeechGuide: 'Nhấn mạnh đây là phương pháp chứng minh góc vuông mà không cần dùng đến tính chất tổng 3 góc hay đường cao.',
        chalkboardNotes: 'II. ĐỊNH LÝ PYTHAGORE ĐẢO\nNếu $\\triangle ABC$ có $BC^2 = AB^2 + AC^2 \\implies \\triangle ABC$ vuông tại $A$.',
        sections: [
          {
            title: 'Phát biểu định lý đảo',
            content: 'Nếu một tam giác có bình phương của một cạnh bằng tổng các bình phương của hai cạnh kia thì tam giác đó là **tam giác vuông**.',
            callout: {
              type: 'theorem',
              title: 'Mệnh đề logic',
              content: 'Trong $\\triangle ABC$, nếu $BC^2 = AB^2 + AC^2$ thì $\\triangle ABC$ vuông tại $A$ (với góc vuông đối diện cạnh lớn nhất $BC$).'
            },
            bulletPoints: [
              '**Mục đích sử dụng:** Nhận biết và chứng minh tam giác vuông.',
              '**Quy tắc:** Luôn so sánh **bình phương cạnh dài nhất** với **tổng bình phương hai cạnh còn lại**.'
            ]
          }
        ]
      },
      {
        id: 'slide-11',
        slideNumber: 11,
        title: 'Các Bộ Ba Số Pythagore Kinh Điển',
        subtitle: 'Kỹ thuật nhận biết nhanh các tam giác vuông đặc biệt không cần bấm máy tính',
        category: 'method',
        layout: 'split_two_col',
        keyFormula: '(3k, 4k, 5k), (5k, 12k, 13k), (8k, 15k, 17k), (7k, 24k, 25k)',
        suggestedDurationMin: 5,
        teacherSpeechGuide: 'Chỉ ra cho học sinh các bộ số quen thuộc hay xuất hiện trong các đề thi và bài kiểm tra.',
        chalkboardNotes: 'Bộ ba Pythagore: $(3,4,5); (5,12,13); (8,15,17); (7,24,25)$ và các bội số.',
        sections: [
          {
            title: 'Bộ Ba Số Nguyên Cơ Bản',
            content: 'Các bộ ba số tự nhiên thỏa mãn $a^2 + b^2 = c^2$:',
            bulletPoints: [
              '$(3, 4, 5)$ $\\rightarrow 3^2 + 4^2 = 9 + 16 = 25 = 5^2$',
              '$(5, 12, 13)$ $\\rightarrow 5^2 + 12^2 = 25 + 144 = 169 = 13^2$',
              '$(8, 15, 17)$ $\\rightarrow 8^2 + 15^2 = 64 + 225 = 289 = 17^2$',
              '$(7, 24, 25)$ $\\rightarrow 7^2 + 24^2 = 49 + 576 = 625 = 25^2$'
            ]
          },
          {
            title: 'Họ Bội Số Thường Gặp',
            content: 'Nhân cả 3 số với số nguyên dương $k$ bất kỳ:',
            bulletPoints: [
              'Bộ $(6, 8, 10)$ (với $k = 2$ của $3,4,5$)',
              'Bộ $(9, 12, 15)$ (với $k = 3$ của $3,4,5$)',
              'Bộ $(10, 24, 26)$ (với $k = 2$ của $5,12,13$)',
              'Bộ $(1.5; 2; 2.5)$ (khi chia cho 2)'
            ],
            callout: {
              type: 'tip',
              title: 'Mẹo trắc nghiệm',
              content: 'Gặp tam giác cạnh $6, 8, 10$, kết luận ngay là tam giác vuông mà không cần tính toán!'
            }
          }
        ]
      },
      {
        id: 'slide-12',
        slideNumber: 12,
        title: 'Ví Dụ 2 (SGK): Kiểm Tra Tam Giác Vuông',
        subtitle: 'Trình bày mẫu bài toán chứng minh một tam giác có vuông hay không',
        category: 'example',
        layout: 'example_box',
        suggestedDurationMin: 5,
        teacherSpeechGuide: 'Lưu ý học sinh không được viết $BC^2 = AB^2 + AC^2$ ngay từ đầu, mà phải tính riêng hai vế rồi mới so sánh.',
        chalkboardNotes: 'Ví dụ 2: Tam giác có các cạnh $8\\text{ cm}, 15\\text{ cm}, 17\\text{ cm}$ có vuông không?',
        sections: [
          {
            example: {
              problem: 'Tam giác $DEF$ có độ dài ba cạnh là $DE = 8\\text{ cm}, DF = 15\\text{ cm}, EF = 17\\text{ cm}$. Tam giác $DEF$ có phải là tam giác vuông không? Nếu có, vuông tại đỉnh nào?',
              solutionSteps: [
                'Bước 1: Xác định cạnh có độ dài lớn nhất là $EF = 17\\text{ cm}$.',
                'Bước 2: Tính bình phương cạnh lớn nhất:',
                '$$EF^2 = 17^2 = 289$$',
                'Bước 3: Tính tổng bình phương hai cạnh còn lại:',
                '$$DE^2 + DF^2 = 8^2 + 15^2 = 64 + 225 = 289$$',
                'Bước 4: So sánh hai kết quả:',
                'Ta thấy: $$EF^2 = DE^2 + DF^2 \\quad (= 289)$$',
                'Bước 5: Kết luận theo định lý Pythagore đảo:'
              ],
              finalAnswer: 'Tam giác $DEF$ là tam giác vuông tại $D$ (vì cạnh huyền là $EF$).'
            }
          }
        ]
      },
      {
        id: 'slide-13',
        slideNumber: 13,
        title: 'Luyện Tập 2: Phân Biệt Tam Giác Vuông, Nhọn, Tù',
        subtitle: 'Mở rộng định lý Pythagore để phân loại mọi loại tam giác',
        category: 'method',
        layout: 'split_two_col',
        keyFormula: 'c^2 < a^2 + b^2 \\text{ (Nhọn)}, \\quad c^2 > a^2 + b^2 \\text{ (Tù)}',
        suggestedDurationMin: 6,
        teacherSpeechGuide: 'Giới thiệu cho học sinh quy tắc so sánh với cạnh lớn nhất $c$.',
        chalkboardNotes: 'Phân loại tam giác theo cạnh lớn nhất $c$:\n• $c^2 = a^2 + b^2 \\implies$ Vuông\n• $c^2 < a^2 + b^2 \\implies$ Nhọn\n• $c^2 > a^2 + b^2 \\implies$ Tù.',
        sections: [
          {
            title: 'Quy tắc mở rộng',
            content: 'Cho tam giác có 3 cạnh $a \\le b < c$ (với $c$ là cạnh lớn nhất):',
            bulletPoints: [
              'Nếu $c^2 = a^2 + b^2 \\implies$ Tam giác **vuông** tại góc đối diện $c$.',
              'Nếu $c^2 < a^2 + b^2 \\implies$ Tam giác **nhọn** (cả 3 góc đều $< 90^\\circ$).',
              'Nếu $c^2 > a^2 + b^2 \\implies$ Tam giác **tù** (góc đối diện $c > 90^\\circ$).'
            ]
          },
          {
            title: 'Ví dụ kiểm tra nhanh',
            content: 'Xét tam giác có 3 cạnh $6, 7, 9$:',
            bulletPoints: [
              'Cạnh lớn nhất: $9^2 = 81$',
              'Tổng bình phương: $6^2 + 7^2 = 36 + 49 = 85$',
              'Vì $81 < 85 \\implies$ Tam giác này là **tam giác nhọn**!'
            ]
          }
        ]
      },
      {
        id: 'slide-14',
        slideNumber: 14,
        title: 'Vận Dụng Thực Tiễn 1: Bài Toán Chiếc Thang & Tường Nhà',
        subtitle: 'Mô hình hóa hình học bài toán an toàn thang cứu hỏa / xây dựng',
        category: 'application',
        layout: 'example_box',
        suggestedDurationMin: 6,
        teacherSpeechGuide: 'Giải thích vì sao góc tiếp xúc giữa tường thẳng đứng và sàn nhà phẳng luôn là góc vuông $90^\\circ$.',
        chalkboardNotes: 'Vận dụng 1: Chiếc thang $AB$ dựa tường. $AC=1{,}8\\text{ m}, BC=2{,}4\\text{ m}$. Chiều dài thang $AB = \\sqrt{1{,}8^2 + 2{,}4^2} = 3\\text{ m}$.',
        sections: [
          {
            example: {
              problem: 'Một chiếc thang cứu hộ $AB$ dựa vào một bức tường thẳng đứng. Chân thang đặt cách chân tường một khoảng $AC = 1{,}8\\text{ m}$. Điểm trên cùng của thang chạm vào tường ở độ cao $BC = 2{,}4\\text{ m}$ so với mặt đất. Hãy tính chiều dài chiếc thang $AB$.',
              solutionSteps: [
                'Bức tường thẳng đứng vuông góc với mặt đất nằm ngang nên $\\triangle ABC$ vuông tại $C$.',
                'Áp dụng định lý Pythagore trong tam giác vuông $ABC$:',
                '$$AB^2 = AC^2 + BC^2$$',
                'Thay số liệu đề bài:',
                '$$AB^2 = (1{,}8)^2 + (2{,}4)^2 = 3{,}24 + 5{,}76 = 9$$',
                'Do chiều dài thang $AB > 0$:',
                '$$AB = \\sqrt{9} = 3\\text{ (m)}$$'
              ],
              finalAnswer: 'Vậy chiếc thang cứu hộ dài chính xác $3\\text{ m}$.'
            }
          }
        ]
      },
      {
        id: 'slide-15',
        slideNumber: 15,
        title: 'Vận Dụng Thực Tiễn 2: Tính Đường Chéo Màn Hình TV',
        subtitle: 'Kích thước màn hình inch được tính như thế nào trong công nghệ?',
        category: 'application',
        layout: 'example_box',
        suggestedDurationMin: 5,
        teacherSpeechGuide: 'Giải thích đơn vị 1 inch = 2.54 cm và kích thước màn hình TV (55 inch, 65 inch) chính là độ dài đường chéo.',
        chalkboardNotes: 'Vận dụng 2: TV có chiều dài $w = 120\\text{ cm}$, chiều cao $h = 90\\text{ cm}$. Đường chéo $d = \\sqrt{120^2 + 90^2} = 150\\text{ cm} \\approx 59\\text{ inch}$.',
        sections: [
          {
            example: {
              problem: 'Một chiếc tivi màn hình chữ nhật có chiều dài $w = 120\\text{ cm}$ và chiều cao $h = 90\\text{ cm}$. Hỏi đường chéo của màn hình tivi đó dài bao nhiêu centimet và tương đương khoảng bao nhiêu inch ($1\\text{ inch} \\approx 2{,}54\\text{ cm}$)?',
              solutionSteps: [
                'Màn hình tivi hình chữ nhật nên đường chéo $d$ chia tivi thành 2 tam giác vuông có hai cạnh góc vuông là $w$ và $h$.',
                'Áp dụng định lý Pythagore tính độ dài đường chéo $d$:',
                '$$d = \\sqrt{w^2 + h^2} = \\sqrt{120^2 + 90^2} = \\sqrt{14400 + 8100} = \\sqrt{22500} = 150\\text{ (cm)}$$',
                'Quy đổi ra inch:',
                '$$\\text{Kích thước inch} = \\frac{150}{2{,}54} \\approx 59\\text{ (inch)}$$'
              ],
              finalAnswer: 'Đường chéo màn hình dài $150\\text{ cm}$ (xấp xỉ loại tivi $60\\text{ inch}$).'
            }
          }
        ]
      },
      {
        id: 'slide-16',
        slideNumber: 16,
        title: 'Tổng Kết Bài Học: Sơ Đồ Kiến Thức Trọng Tâm',
        subtitle: 'Bản đồ tư duy và những điều cốt lõi tuyệt đối không được quên',
        category: 'summary',
        layout: 'split_two_col',
        keyFormula: 'c^2 = a^2 + b^2 \\iff \\triangle ABC \\text{ vuông}',
        suggestedDurationMin: 5,
        teacherSpeechGuide: 'Cho học sinh tóm tắt lại 2 định lý và nhắc lại các sai lầm cần tránh trước khi làm bài tập về nhà.',
        chalkboardNotes: 'TỔNG KẾT:\n1. Thuận: Vuông -> $c^2 = a^2 + b^2$ (Tính cạnh)\n2. Đảo: $c^2 = a^2 + b^2$ -> Vuông (Chứng minh)\n3. Lưu ý: Xác định đúng cạnh huyền!',
        sections: [
          {
            title: 'Hai Chiều Của Định Lý',
            content: 'Ghi nhớ ngắn gọn mối quan hệ tương đương:',
            bulletPoints: [
              '**Chiều thuận:** $\\triangle ABC$ vuông tại $A \\implies BC^2 = AB^2 + AC^2$ (Dùng để tính độ dài cạnh).',
              '**Chiều đảo:** $BC^2 = AB^2 + AC^2 \\implies \\triangle ABC$ vuông tại $A$ (Dùng để chứng minh góc vuông).'
            ]
          },
          {
            title: '3 Sai Lầm Phổ Biến Cần Tránh',
            content: 'Những lỗi học sinh hay bị mất điểm:',
            bulletPoints: [
              '❌ **Sai lầm 1:** Quên không kiểm tra tam giác có vuông hay không đã vội áp dụng công thức.',
              '❌ **Sai lầm 2:** Nhầm lẫn cạnh huyền với cạnh góc vuông (lấy cạnh góc vuông bình phương làm tổng).',
              '❌ **Sai lầm 3:** Quên không lấy căn bậc hai $\\sqrt{\\dots}$ ở bước cuối cùng khi tìm độ dài cạnh.'
            ]
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q-pyt-1',
        questionNumber: 1,
        type: 'multiple_choice',
        difficulty: 'easy',
        targetConcept: 'Định lý Pythagore thuận',
        prompt: 'Cho $\\triangle ABC$ vuông tại $A$ có $AB = 6\\text{ cm}$, $AC = 8\\text{ cm}$. Độ dài cạnh huyền $BC$ là:',
        options: [
          { key: 'A', text: '$14\\text{ cm}$', isCorrect: false },
          { key: 'B', text: '$10\\text{ cm}$', isCorrect: true },
          { key: 'C', text: '$100\\text{ cm}$', isCorrect: false },
          { key: 'D', text: '$2\\sqrt{7}\\text{ cm}$', isCorrect: false }
        ],
        detailedSolution: 'Áp dụng định lý Pythagore trong $\\triangle ABC$ vuông tại $A$:\n$$BC^2 = AB^2 + AC^2 = 6^2 + 8^2 = 36 + 64 = 100$$\nSuy ra $BC = \\sqrt{100} = 10\\text{ cm}$.',
        hint: 'Sử dụng công thức $BC = \\sqrt{AB^2 + AC^2}$.'
      },
      {
        id: 'q-pyt-2',
        questionNumber: 2,
        type: 'multiple_choice',
        difficulty: 'medium',
        targetConcept: 'Tính cạnh góc vuông',
        prompt: 'Một tam giác vuông có cạnh huyền bằng $13\\text{ cm}$ và một cạnh góc vuông bằng $5\\text{ cm}$. Độ dài cạnh góc vuông còn lại là:',
        options: [
          { key: 'A', text: '$8\\text{ cm}$', isCorrect: false },
          { key: 'B', text: '$12\\text{ cm}$', isCorrect: true },
          { key: 'C', text: '$\\sqrt{194}\\text{ cm}$', isCorrect: false },
          { key: 'D', text: '$18\\text{ cm}$', isCorrect: false }
        ],
        detailedSolution: 'Gọi cạnh góc vuông cần tìm là $b$. Áp dụng định lý Pythagore:\n$$b = \\sqrt{c^2 - a^2} = \\sqrt{13^2 - 5^2} = \\sqrt{169 - 25} = \\sqrt{144} = 12\\text{ cm}$$.',
        hint: 'Lấy căn bậc hai của hiệu bình phương cạnh huyền trừ bình phương cạnh đã biết.'
      },
      {
        id: 'q-pyt-3',
        questionNumber: 3,
        type: 'multiple_choice',
        difficulty: 'hard',
        targetConcept: 'Định lý Pythagore đảo',
        prompt: 'Tam giác nào có độ dài 3 cạnh dưới đây là tam giác vuông?',
        options: [
          { key: 'A', text: '$4\\text{ cm}, 5\\text{ cm}, 6\\text{ cm}$', isCorrect: false },
          { key: 'B', text: '$7\\text{ cm}, 24\\text{ cm}, 25\\text{ cm}$', isCorrect: true },
          { key: 'C', text: '$5\\text{ cm}, 7\\text{ cm}, 9\\text{ cm}$', isCorrect: false },
          { key: 'D', text: '$6\\text{ cm}, 9\\text{ cm}, 12\\text{ cm}$', isCorrect: false }
        ],
        detailedSolution: 'Ta kiểm tra bộ ba $7, 24, 25$:\nCạnh lớn nhất $25^2 = 625$.\nTổng bình phương hai cạnh còn lại: $7^2 + 24^2 = 49 + 576 = 625$.\nVì $25^2 = 7^2 + 24^2$ nên theo định lý Pythagore đảo, tam giác có 3 cạnh $7, 24, 25$ là tam giác vuông.',
        hint: 'So sánh bình phương cạnh lớn nhất với tổng bình phương 2 cạnh nhỏ hơn.'
      },
      {
        id: 'q-pyt-4',
        questionNumber: 4,
        type: 'true_false',
        difficulty: 'medium',
        targetConcept: 'Khái niệm và tính chất',
        prompt: 'Xét tính Đúng / Sai của các khẳng định sau về Định lý Pythagore:',
        tfStatements: [
          {
            id: 'tf-1',
            statement: 'Định lý Pythagore áp dụng được cho mọi loại tam giác (nhọn, tù, vuông).',
            isCorrect: false,
            explanation: 'Sai. Định lý Pythagore chỉ áp dụng cho tam giác vuông.'
          },
          {
            id: 'tf-2',
            statement: 'Trong tam giác vuông cân có cạnh góc vuông bằng $a$, độ dài cạnh huyền là $a\\sqrt{2}$.',
            isCorrect: true,
            explanation: 'Đúng. $c = \\sqrt{a^2 + a^2} = \\sqrt{2a^2} = a\\sqrt{2}$.'
          },
          {
            id: 'tf-3',
            statement: 'Tam giác có độ dài ba cạnh tỉ lệ với $3 : 4 : 5$ luôn là tam giác vuông.',
            isCorrect: true,
            explanation: 'Đúng. Vì $(3k)^2 + (4k)^2 = 9k^2 + 16k^2 = 25k^2 = (5k)^2$.'
          },
          {
            id: 'tf-4',
            statement: 'Nếu $BC^2 \\neq AB^2 + AC^2$ thì tam giác $ABC$ chắc chắn không vuông tại bất kỳ đỉnh nào.',
            isCorrect: false,
            explanation: 'Sai. Tam giác có thể vuông tại $B$ (khi đó $AC^2 = AB^2 + BC^2$) hoặc tại $C$.'
          }
        ],
        detailedSolution: 'Phân tích kỹ lưỡng định nghĩa góc vuông và vị trí cạnh đối diện để tránh ngộ nhận.',
        hint: 'Chú ý điều kiện tam giác vuông và vị trí của đỉnh góc vuông.'
      },
      {
        id: 'q-pyt-5',
        questionNumber: 5,
        type: 'true_false',
        difficulty: 'medium',
        targetConcept: 'Ứng dụng hình chữ nhật & đường chéo',
        prompt: 'Cho hình chữ nhật $ABCD$ có chiều dài $AB = 8\\text{ cm}$, chiều rộng $BC = 6\\text{ cm}$. Xác định tính Đúng / Sai:',
        tfStatements: [
          {
            id: 'tf-5',
            statement: 'Độ dài đường chéo $AC$ bằng $10\\text{ cm}$.',
            isCorrect: true,
            explanation: 'Đúng. $\\triangle ABC$ vuông tại $B$ nên $AC = \\sqrt{8^2 + 6^2} = 10\\text{ cm}$.'
          },
          {
            id: 'tf-6',
            statement: 'Độ dài đường chéo $BD$ lớn hơn $AC$.',
            isCorrect: false,
            explanation: 'Sai. Trong hình chữ nhật hai đường chéo bằng nhau ($AC = BD = 10\\text{ cm}$).'
          },
          {
            id: 'tf-7',
            statement: 'Chu vi tam giác $ABC$ là $24\\text{ cm}$.',
            isCorrect: true,
            explanation: 'Đúng. Chu vi $= AB + BC + AC = 8 + 6 + 10 = 24\\text{ cm}$.'
          },
          {
            id: 'tf-8',
            statement: 'Diện tích hình vuông dựng trên cạnh $AC$ là $100\\text{ cm}^2$.',
            isCorrect: true,
            explanation: 'Đúng. $S = AC^2 = 10^2 = 100\\text{ cm}^2$.'
          }
        ],
        detailedSolution: 'Áp dụng định lý Pythagore vào tam giác vuông tạo bởi hai cạnh và đường chéo của hình chữ nhật.',
        hint: 'Đường chéo chia hình chữ nhật thành 2 tam giác vuông bằng nhau.'
      },
      {
        id: 'q-pyt-6',
        questionNumber: 6,
        type: 'short_answer',
        difficulty: 'medium',
        targetConcept: 'Tính khoảng cách',
        prompt: 'Một cánh buồm hình tam giác vuông có cạnh góc vuông thứ nhất dài $9\\text{ m}$ và cạnh huyền dài $15\\text{ m}$. Tính độ dài cạnh góc vuông còn lại (đơn vị: mét)?',
        correctShortAnswer: '12',
        acceptableAnswers: ['12', '12m', '12 mét', '12 m'],
        unitOrFormat: 'm',
        detailedSolution: 'Gọi cạnh góc vuông còn lại là $x\\text{ (m)}$.\nTheo định lý Pythagore:\n$$x = \\sqrt{15^2 - 9^2} = \\sqrt{225 - 81} = \\sqrt{144} = 12\\text{ (m)}$$\nĐáp số: 12.',
        hint: 'Lấy căn bậc hai của $15^2 - 9^2$.'
      },
      {
        id: 'q-pyt-7',
        questionNumber: 7,
        type: 'short_answer',
        difficulty: 'hard',
        targetConcept: 'Tam giác đều và đường cao',
        prompt: 'Cho tam giác đều $ABC$ cạnh bằng $6\\text{ cm}$. Độ dài đường cao $AH$ của tam giác là $x\\sqrt{3}\\text{ cm}$. Giá trị của $x$ bằng bao nhiêu?',
        correctShortAnswer: '3',
        acceptableAnswers: ['3', 'x=3', 'x = 3'],
        unitOrFormat: 'số nguyên',
        detailedSolution: 'Do $\\triangle ABC$ đều nên đường cao $AH$ đồng thời là đường trung tuyến $\\implies BH = \\frac{BC}{2} = 3\\text{ cm}$.\nXét $\\triangle ABH$ vuông tại $H$:\n$$AH = \\sqrt{AB^2 - BH^2} = \\sqrt{6^2 - 3^2} = \\sqrt{36 - 9} = \\sqrt{27} = 3\\sqrt{3}\\text{ cm}$$\nDo đó $x = 3$.',
        hint: 'Đường cao chia tam giác đều thành hai tam giác vuông với cạnh đáy bằng 3.'
      },
      {
        id: 'q-pyt-8',
        questionNumber: 8,
        type: 'essay',
        difficulty: 'medium',
        targetConcept: 'Chứng minh hình học và tính khoảng cách',
        prompt: 'Cho hình thang cân $ABCD$ ($AB \\parallel CD$), biết $AB = 4\\text{ cm}$, $CD = 10\\text{ cm}$, cạnh bên $AD = BC = 5\\text{ cm}$.\na) Tính chiều cao $h$ của hình thang.\nb) Tính độ dài đường chéo $AC$.',
        essayRubric: {
          totalPoints: 10,
          steps: [
            {
              stepTitle: 'Kẻ đường cao và tính đoạn phân đoạn đáy',
              points: 3,
              criteria: 'Kẻ $AH \\perp CD, BK \\perp CD$, chỉ ra $DH = KC = \\frac{10 - 4}{2} = 3\\text{ cm}$.',
              sampleContent: 'Kẻ $AH \\perp CD (H \\in CD)$ và $BK \\perp CD (K \\in CD)$. Ta có $ABKH$ là hình chữ nhật nên $HK = AB = 4\\text{ cm}$. Do $ABCD$ là hình thang cân nên $\\triangle ADH = \\triangle BCK$ (cạnh huyền - góc nhọn) $\\implies DH = KC = \\frac{CD - HK}{2} = \\frac{10 - 4}{2} = 3\\text{ cm}$.'
            },
            {
              stepTitle: 'Tính chiều cao AH',
              points: 3,
              criteria: 'Áp dụng Pythagore trong $\\triangle ADH$ vuông tại $H$, tính $AH = 4\\text{ cm}$.',
              sampleContent: 'Xét $\\triangle ADH$ vuông tại $H$, theo định lý Pythagore:\n$AH^2 = AD^2 - DH^2 = 5^2 - 3^2 = 25 - 9 = 16 \\implies AH = 4\\text{ cm}$. Vậy chiều cao $h = 4\\text{ cm}$.'
            },
            {
              stepTitle: 'Tính đường chéo AC',
              points: 4,
              criteria: 'Tính $HC = HK + KC = 7\\text{ cm}$, áp dụng Pythagore tính $AC = \\sqrt{65}\\text{ cm}$.',
              sampleContent: 'Ta có $HC = HD + HK + KC - DH = HK + KC = 4 + 3 = 7\\text{ cm}$.\nXét $\\triangle AHC$ vuông tại $H$, theo định lý Pythagore:\n$AC^2 = AH^2 + HC^2 = 4^2 + 7^2 = 16 + 49 = 65 \\implies AC = \\sqrt{65}\\text{ cm} \\approx 8{,}06\\text{ cm}$.'
            }
          ]
        },
        detailedSolution: '1) Chiều cao $h = 4\\text{ cm}$.\n2) Đường chéo $AC = \\sqrt{65}\\text{ cm}$.',
        hint: 'Kẻ hai đường cao từ hai đỉnh đáy nhỏ xuống đáy lớn để tạo thành hai tam giác vuông bằng nhau.'
      }
    ],
    summary: {
      topicTitle: 'Định Lý Pythagore & Ứng Dụng',
      gradeLevel: 'Hình học Lớp 8',
      mainOverview: 'Định lý Pythagore là nền tảng cốt lõi của hình học phẳng và lượng giác, mô tả mối quan hệ định lượng giữa ba cạnh của tam giác vuông và cung cấp tiêu chuẩn nhận biết góc vuông.',
      coreConcepts: [
        {
          id: 'c-1',
          term: 'Định lý Pythagore thuận',
          definition: 'Trong tam giác vuông, bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông.',
          formula: 'BC^2 = AB^2 + AC^2',
          example: 'Tam giác vuông có 2 cạnh góc vuông $3\\text{ cm}, 4\\text{ cm} \\implies$ Cạnh huyền $= \\sqrt{3^2+4^2} = 5\\text{ cm}$.',
          importance: 'essential'
        },
        {
          id: 'c-2',
          term: 'Định lý Pythagore đảo',
          definition: 'Nếu $c^2 = a^2 + b^2$ thì tam giác có độ dài 3 cạnh $a, b, c$ là tam giác vuông tại góc đối diện cạnh $c$.',
          formula: 'c^2 = a^2 + b^2 \\implies \\widehat{C} = 90^\\circ',
          example: '$5^2 + 12^2 = 25 + 144 = 169 = 13^2 \\implies$ Tam giác vuông.',
          importance: 'essential'
        },
        {
          id: 'c-3',
          term: 'Tam giác vuông đặc biệt',
          definition: 'Tam giác vuông cân có cạnh góc vuông $a \\implies$ cạnh huyền $a\\sqrt{2}$. Tam giác nửa đều ($30^\\circ - 60^\\circ - 90^\\circ$) có cạnh huyền $2a \\implies$ cạnh góc vuông là $a$ và $a\\sqrt{3}$.',
          formula: 'c = a\\sqrt{2} \\quad \\text{hoặc} \\quad h = \\frac{a\\sqrt{3}}{2}',
          importance: 'advanced'
        }
      ],
      goldenFormulas: [
        {
          id: 'f-1',
          name: 'Công thức cạnh huyền',
          latex: 'c = \\sqrt{a^2 + b^2}',
          condition: 'Tam giác vuông tại góc đối diện cạnh c',
          description: 'Tính độ dài cạnh huyền khi biết hai cạnh góc vuông.',
          mnemonic: 'Căn bậc hai của tổng bình phương hai cạnh góc vuông.'
        },
        {
          id: 'f-2',
          name: 'Công thức cạnh góc vuông',
          latex: 'a = \\sqrt{c^2 - b^2}',
          condition: 'c > b > 0',
          description: 'Tính một cạnh góc vuông khi biết cạnh huyền và cạnh góc vuông còn lại.',
          mnemonic: 'Lấy cạnh huyền bình phương TRỪ đi cạnh góc vuông đã biết.'
        },
        {
          id: 'f-3',
          name: 'Đường chéo hình chữ nhật',
          latex: 'd = \\sqrt{a^2 + b^2}',
          description: 'Đường chéo hình chữ nhật kích thước $a \\times b$.'
        },
        {
          id: 'f-4',
          name: 'Đường chéo hình vuông',
          latex: 'd = a\\sqrt{2}',
          description: 'Đường chéo hình vuông cạnh $a$.'
        }
      ],
      commonPitfalls: [
        {
          id: 'p-1',
          title: 'Áp dụng cho tam giác không vuông',
          wrongWay: 'Viết $BC^2 = AB^2 + AC^2$ cho tam giác thường mà không có điều kiện góc vuông.',
          rightWay: 'Chỉ áp dụng khi đề bài cho tam giác vuông hoặc đã chứng minh góc vuông.',
          explanation: 'Với tam giác thường phải áp dụng Định lý Cosin ($a^2 = b^2 + c^2 - 2bc\\cos A$).'
        },
        {
          id: 'p-2',
          title: 'Nhầm lẫn cạnh huyền và cạnh góc vuông',
          wrongWay: 'Tính cạnh góc vuông bằng cách cộng bình phương: $a = \\sqrt{c^2 + b^2}$.',
          rightWay: 'Phải trừ: $a = \\sqrt{c^2 - b^2}$. Cạnh huyền $c$ luôn lớn nhất.',
          explanation: 'Cạnh huyền luôn nằm đối diện góc $90^\\circ$ và có độ dài lớn nhất.'
        },
        {
          id: 'p-3',
          title: 'Quên khai căn bậc hai ở bước cuối',
          wrongWay: 'Tính ra $BC^2 = 100$ và kết luận ngay $BC = 100\\text{ cm}$.',
          rightWay: 'Phải khai căn: $BC = \\sqrt{100} = 10\\text{ cm}$.',
          explanation: 'Công thức cho ra bình phương độ dài ($c^2$), cần khai căn để tìm $c$.'
        }
      ],
      mindmapTree: {
        id: 'root',
        label: 'Định Lý Pythagore',
        color: 'emerald',
        children: [
          {
            id: 'm-1',
            label: '1. Định Lý Thuận',
            formula: 'c^2 = a^2 + b^2',
            detail: 'Tính cạnh trong tam giác vuông',
            children: [
              { id: 'm-1-1', label: 'Tính cạnh huyền', formula: 'c = \\sqrt{a^2 + b^2}' },
              { id: 'm-1-2', label: 'Tính cạnh góc vuông', formula: 'a = \\sqrt{c^2 - b^2}' }
            ]
          },
          {
            id: 'm-2',
            label: '2. Định Lý Đảo',
            formula: 'c^2 = a^2 + b^2 \\implies \\widehat{C} = 90^\\circ',
            detail: 'Chứng minh tam giác vuông',
            children: [
              { id: 'm-2-1', label: 'Kiểm tra cạnh lớn nhất' },
              { id: 'm-2-2', label: 'So sánh $c^2$ với $a^2+b^2$' }
            ]
          },
          {
            id: 'm-3',
            label: '3. Bộ Ba Số Pythagore',
            detail: 'Các bộ số nguyên chuẩn',
            children: [
              { id: 'm-3-1', label: 'Bộ cơ bản', detail: '(3, 4, 5); (5, 12, 13); (7, 24, 25)' },
              { id: 'm-3-2', label: 'Bội số', detail: '(6, 8, 10); (9, 12, 15)...' }
            ]
          },
          {
            id: 'm-4',
            label: '4. Ứng Dụng Thực Tiễn',
            children: [
              { id: 'm-4-1', label: 'Đường chéo hình chữ nhật, hình vuông' },
              { id: 'm-4-2', label: 'Chiều cao tam giác đều, hình thang cân' },
              { id: 'm-4-3', label: 'Đo đạc trắc địa, khoảng cách thực tế' }
            ]
          }
        ]
      },
      wrapUpFlashcards: [
        {
          id: 'fc-1',
          front: 'Phát biểu công thức Định lý Pythagore cho tam giác $MNP$ vuông tại $M$?',
          back: '$$NP^2 = MN^2 + MP^2 \\implies NP = \\sqrt{MN^2 + MP^2}$$',
          formula: 'NP^2 = MN^2 + MP^2',
          category: 'Công thức'
        },
        {
          id: 'fc-2',
          front: 'Làm thế nào để nhận biết một tam giác có 3 cạnh $a, b, c$ là tam giác vuông?',
          back: 'Xác định cạnh lớn nhất $c$. Nếu $c^2 = a^2 + b^2$ thì tam giác đó vuông tại góc đối diện cạnh $c$.',
          category: 'Phương pháp'
        },
        {
          id: 'fc-3',
          front: 'Bộ 3 số $6, 8, 10$ có tạo thành tam giác vuông không? Vì sao?',
          back: 'Có! Vì $10^2 = 100$ và $6^2 + 8^2 = 36 + 64 = 100$. Đây là bội số nhân 2 của bộ $(3, 4, 5)$.',
          category: 'Ví dụ'
        },
        {
          id: 'fc-4',
          front: 'Đường chéo của hình vuông cạnh $a = 5\\text{ cm}$ bằng bao nhiêu?',
          back: '$$d = a\\sqrt{2} = 5\\sqrt{2}\\text{ cm} \\approx 7{,}07\\text{ cm}$$',
          formula: 'd = a\\sqrt{2}',
          category: 'Mẹo tính nhanh'
        }
      ]
    }
  },
  {
    id: 'lesson-phuong-trinh-bac-hai',
    title: 'Phương Trình Bậc Hai Một Ẩn & Hệ Thức Viète',
    grade: 'Toán Lớp 9 - Đại Số',
    chapterOrTopic: 'Phương Trình & Bất Phương Trình',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 3,
    sourceImageCount: 3,
    config: {
      totalQuestions: 12,
      numMultipleChoice: 4,
      numTrueFalse: 4,
      numShortAnswer: 2,
      numEssay: 2,
      targetGrade: 'Toán 9 - Đại số',
      teachingGoal: 'exam_prep'
    },
    slides: [
      {
        id: 'slide-pt-1',
        slideNumber: 1,
        title: 'Phương Trình Bậc Hai Một Ẩn & Mục Tiêu Bài Học',
        subtitle: 'Kiến thức cốt lõi nền tảng trong chương trình Đại số',
        category: 'intro',
        layout: 'standard',
        keyFormula: 'ax^2 + bx + c = 0 \\quad (a \\neq 0)',
        suggestedDurationMin: 3,
        teacherSpeechGuide: 'Giới thiệu vai trò quan trọng của phương trình bậc hai trong các bài thi và mô hình chuyển động vật lý.',
        chalkboardNotes: 'BÀI: PHƯƠNG TRÌNH BẬC HAI MỘT ẨN\n1. Dạng tổng quát: $ax^2 + bx + c = 0\\; (a \\neq 0)$.',
        sections: [
          {
            title: 'Mục tiêu bài học',
            content: 'Nắm vững toàn bộ phương pháp giải và ứng dụng của phương trình bậc hai:',
            bulletPoints: [
              'Nhận biết chính xác phương trình bậc hai và xác định các hệ số $a, b, c$.',
              'Hiểu cách xây dựng và áp dụng công thức nghiệm tổng quát thông qua biệt thức $\\Delta = b^2 - 4ac$.',
              'Sử dụng công thức nghiệm thu gọn $\\Delta\' = b\'^2 - ac$ khi hệ số $b$ chẵn ($b = 2b\').',
              'Vận dụng thành thạo Định lý Viète để tính nhẩm nghiệm và giải các bài toán đối xứng.'
            ]
          }
        ]
      },
      {
        id: 'slide-pt-2',
        slideNumber: 2,
        title: 'Khởi Động: Bài Toán Thực Tế Quỹ Đạo Chuyển Động',
        subtitle: 'Mô hình hóa độ cao của một vật bị ném lên cao',
        category: 'intro',
        layout: 'standard',
        keyFormula: 'h(t) = -5t^2 + 20t + 1 = 0',
        suggestedDurationMin: 4,
        teacherSpeechGuide: 'Đặt bài toán thực tế về chuyển động ném vật và hỏi học sinh lúc nào vật chạm đất.',
        chalkboardNotes: 'Khởi động: Độ cao $h(t) = -5t^2 + 20t + 1$. Khi chạm đất $h = 0 \\implies -5t^2 + 20t + 1 = 0$.',
        sections: [
          {
            title: 'Tình huống mô hình hóa',
            content: 'Một quả bóng được ném lên thẳng đứng từ độ cao ban đầu $1\\text{ m}$ với vận tốc ban đầu $20\\text{ m/s}$:',
            bulletPoints: [
              'Phương trình độ cao theo thời gian $t$ (giây): $h(t) = -5t^2 + 20t + 1\\text{ (m)}$.',
              'Hỏi sau bao nhiêu giây thì quả bóng rơi chạm đất (tức $h(t) = 0$)?',
              'Để trả lời câu hỏi này, ta cần giải phương trình: $-5t^2 + 20t + 1 = 0$.'
            ],
            callout: {
              type: 'note',
              title: 'Đặc điểm phương trình',
              content: 'Phương trình chứa ẩn $t$ với lũy thừa cao nhất là bậc 2 $\\rightarrow$ Được gọi là **phương trình bậc hai một ẩn**.'
            }
          }
        ]
      },
      {
        id: 'slide-pt-3',
        slideNumber: 3,
        title: 'Định Nghĩa Phương Trình Bậc Hai Một Ẩn',
        subtitle: 'Khái niệm toán học chuẩn xác và điều kiện bắt buộc của hệ số',
        category: 'definition',
        layout: 'formula_focus',
        keyFormula: 'ax^2 + bx + c = 0 \\quad (a \\neq 0)',
        suggestedDurationMin: 5,
        teacherSpeechGuide: 'Nhấn mạnh điều kiện $a \\neq 0$. Nếu $a = 0$ thì phương trình trở thành bậc nhất $bx + c = 0$.',
        chalkboardNotes: 'I. ĐỊNH NGHĨA\nPhương trình bậc hai 1 ẩn: $ax^2 + bx + c = 0$\n($x$: ẩn số; $a, b, c$: hệ số; $a \\neq 0$).',
        sections: [
          {
            title: 'Phát biểu định nghĩa',
            content: 'Phương trình bậc hai một ẩn (nói gọn là phương trình bậc hai) là phương trình có dạng:',
            callout: {
              type: 'definition',
              title: 'Dạng chuẩn mực',
              content: '$$ax^2 + bx + c = 0$$'
            },
            bulletPoints: [
              '$x$ là **ẩn số**.',
              '$a, b, c$ là các số thực cho trước được gọi là các **hệ số**.',
              '**Điều kiện bắt buộc:** Hệ số $a \\neq 0$ (nếu $a = 0$, phương trình không còn là bậc hai).'
            ]
          }
        ]
      },
      {
        id: 'slide-pt-4',
        slideNumber: 4,
        title: 'Nhận Diện Hệ Số $a, b, c$ Trong Các Phương Trình',
        subtitle: 'Rèn luyện kỹ năng phân tích hệ số chính xác kèm dấu',
        category: 'method',
        layout: 'split_two_col',
        suggestedDurationMin: 5,
        teacherSpeechGuide: 'Nhắc học sinh cẩn thận dấu âm trước các hệ số và các trường hợp khuyết b hoặc khuyết c.',
        chalkboardNotes: 'Ví dụ xác định hệ số:\na) $2x^2 - 5x + 3 = 0 \\implies a=2, b=-5, c=3$\nb) $-x^2 + 4x = 0 \\implies a=-1, b=4, c=0$\nc) $3x^2 - 12 = 0 \\implies a=3, b=0, c=-12$.',
        sections: [
          {
            title: 'Các phương trình đầy đủ',
            content: 'Có đầy đủ cả 3 hệ số $a, b, c$:',
            bulletPoints: [
              '$2x^2 - 5x + 3 = 0 \\implies a = 2,\\; b = -5,\\; c = 3$',
              '$-3x^2 + x - 7 = 0 \\implies a = -3,\\; b = 1,\\; c = -7$',
              '$\\frac{1}{2}x^2 + \\sqrt{3}x - 1 = 0 \\implies a = \\frac{1}{2},\\; b = \\sqrt{3},\\; c = -1$'
            ]
          },
          {
            title: 'Các dạng phương trình khuyết',
            content: 'Khi một trong các hệ số $b$ hoặc $c$ bằng $0$:',
            bulletPoints: [
              '**Khuyết $c$** ($c = 0$): $ax^2 + bx = 0$ (Ví dụ: $5x^2 - 10x = 0$)',
              '**Khuyết $b$** ($b = 0$): $ax^2 + c = 0$ (Ví dụ: $2x^2 - 18 = 0$)',
              '**Khuyết cả $b$ và $c$**: $ax^2 = 0 \\implies x = 0$'
            ]
          }
        ]
      },
      {
        id: 'slide-pt-5',
        slideNumber: 5,
        title: 'Giải Phương Trình Bậc Hai Khuyết (Giải Nhanh)',
        subtitle: 'Phương pháp đặt nhân tử chung và khai căn trực tiếp',
        category: 'method',
        layout: 'split_two_col',
        keyFormula: 'x(ax + b) = 0 \\quad \\text{hoặc} \\quad x^2 = -\\frac{c}{a}',
        suggestedDurationMin: 6,
        teacherSpeechGuide: 'Khuyến khích học sinh không dùng công thức nghiệm Delta cho dạng khuyết để tiết kiệm thời gian.',
        chalkboardNotes: 'Giải PT khuyết:\n1. Khuyết $c$: $x(ax + b) = 0 \\implies x = 0$ hoặc $x = -b/a$.\n2. Khuyết $b$: $x^2 = -c/a \\implies x = \\pm \\sqrt{-c/a}$ (nếu $-c/a \\ge 0$).',
        sections: [
          {
            title: '1. Dạng khuyết $c$: $ax^2 + bx = 0$',
            content: 'Đặt nhân tử chung $x$ đưa về phương trình tích:',
            bulletPoints: [
              '$x(ax + b) = 0$',
              'Suy ra: $x = 0$ hoặc $ax + b = 0 \\implies x = -\\dfrac{b}{a}$',
              'Ví dụ: $3x^2 - 6x = 0 \\implies 3x(x - 2) = 0 \\implies x = 0$ hoặc $x = 2$'
            ]
          },
          {
            title: '2. Dạng khuyết $b$: $ax^2 + c = 0$',
            content: 'Chuyển vế và khai căn:',
            bulletPoints: [
              '$ax^2 = -c \\implies x^2 = -\\dfrac{c}{a}$',
              'Nếu $-\\dfrac{c}{a} > 0 \\implies x = \\pm \\sqrt{-\\dfrac{c}{a}}$',
              'Nếu $-\\dfrac{c}{a} < 0 \\implies$ Phương trình vô nghiệm.',
              'Ví dụ: $2x^2 - 8 = 0 \\implies x^2 = 4 \\implies x = \\pm 2$'
            ]
          }
        ]
      },
      {
        id: 'slide-pt-6',
        slideNumber: 6,
        title: 'Hoạt Động Khám Phá 3: Biến Đổi Về Bình Phương Hoàn Chỉnh',
        subtitle: 'Nguồn gốc hình thành biệt thức Delta',
        category: 'intro',
        layout: 'standard',
        keyFormula: '\\left(x + \\frac{b}{2a}\\right)^2 = \\frac{b^2 - 4ac}{4a^2}',
        suggestedDurationMin: 6,
        teacherSpeechGuide: 'Dẫn dắt học sinh từng bước biến đổi từ phương trình tổng quát về dạng hằng đẳng thức.',
        chalkboardNotes: '$ax^2 + bx + c = 0 \\implies x^2 + \\frac{b}{a}x = -\\frac{c}{a} \\implies (x + \\frac{b}{2a})^2 = \\frac{b^2 - 4ac}{4a^2}$.',
        sections: [
          {
            title: 'Các bước biến đổi đại số',
            content: 'Xét phương trình $ax^2 + bx + c = 0$ với $a \\neq 0$:',
            bulletPoints: [
              'Chia cả hai vế cho $a$: $x^2 + \\dfrac{b}{a}x + \\dfrac{c}{a} = 0$',
              'Chuyển tự do sang vế phải: $x^2 + 2 \\cdot x \\cdot \\dfrac{b}{2a} = -\\dfrac{c}{a}$',
              'Cộng cả hai vế với $\\left(\\dfrac{b}{2a}\\right)^2$: $x^2 + 2x\\dfrac{b}{2a} + \\left(\\dfrac{b}{2a}\\right)^2 = \\dfrac{b^2}{4a^2} - \\dfrac{c}{a}$',
              'Thu gọn: $$\\left(x + \\frac{b}{2a}\\right)^2 = \\frac{b^2 - 4ac}{4a^2}$$'
            ]
          }
        ]
      },
      {
        id: 'slide-pt-7',
        slideNumber: 7,
        title: 'Biệt Thức $\\Delta$ & Công Thức Nghiệm Tổng Quát',
        subtitle: 'Công cụ vạn năng giải quyết mọi phương trình bậc hai',
        category: 'theorem',
        layout: 'formula_focus',
        keyFormula: '\\Delta = b^2 - 4ac',
        suggestedDurationMin: 7,
        teacherSpeechGuide: 'Cho học sinh ghi chép cẩn thận 3 trường hợp của biệt thức Delta vào vở.',
        chalkboardNotes: 'II. CÔNG THỨC NGHIỆM TỔNG QUÁT\nBiệt thức: $\\Delta = b^2 - 4ac$\n• $\\Delta > 0$: 2 nghiệm phân biệt $x_{1,2} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$\n• $\\Delta = 0$: Nghiệm kép $x_1 = x_2 = \\frac{-b}{2a}$\n• $\\Delta < 0$: Vô nghiệm.',
        sections: [
          {
            title: 'Định nghĩa biệt thức Delta',
            content: 'Ký hiệu $\\Delta$ (đọc là Đen-ta): $$\\Delta = b^2 - 4ac$$',
            callout: {
              type: 'theorem',
              title: '3 Trường Hợp Số Nghiệm',
              content: '1. **Nếu $\\Delta > 0$:** Phương trình có 2 nghiệm phân biệt:\n$$x_1 = \\frac{-b + \\sqrt{\\Delta}}{2a}, \\quad x_2 = \\frac{-b - \\sqrt{\\Delta}}{2a}$$\n2. **Nếu $\\Delta = 0$:** Phương trình có nghiệm kép:\n$$x_1 = x_2 = -\\frac{b}{2a}$$\n3. **Nếu $\\Delta < 0$:** Phương trình vô nghiệm trên $\\mathbb{R}$.'
            }
          }
        ]
      },
      {
        id: 'slide-pt-8',
        slideNumber: 8,
        title: 'Ví Dụ 1 (SGK): Giải Phương Trình Bằng Công Thức $\\Delta$',
        subtitle: 'Quy trình 4 bước chuẩn mực trình bày bài làm thi vào 10',
        category: 'example',
        layout: 'example_box',
        suggestedDurationMin: 6,
        teacherSpeechGuide: 'Yêu cầu học sinh luôn viết rõ hệ số a, b, c và tính Delta riêng trước khi thế vào nghiệm.',
        chalkboardNotes: 'Ví dụ 1: Giải $x^2 - 5x + 6 = 0$.\n$a=1, b=-5, c=6 \\implies \\Delta = (-5)^2 - 4(1)(6) = 25 - 24 = 1 > 0$.\n$x_1 = \\frac{5 + 1}{2} = 3,\\; x_2 = \\frac{5 - 1}{2} = 2$.',
        sections: [
          {
            example: {
              problem: 'Giải phương trình bậc hai sau: $$x^2 - 5x + 6 = 0$$',
              solutionSteps: [
                'Bước 1: Xác định các hệ số: $a = 1,\\; b = -5,\\; c = 6$.',
                'Bước 2: Tính biệt thức $\\Delta$:',
                '$$\\Delta = b^2 - 4ac = (-5)^2 - 4 \\cdot 1 \\cdot 6 = 25 - 24 = 1$$',
                'Bước 3: Vì $\\Delta = 1 > 0$ nên phương trình có 2 nghiệm phân biệt:',
                '$$x_1 = \\frac{-b + \\sqrt{\\Delta}}{2a} = \\frac{-(-5) + \\sqrt{1}}{2 \\cdot 1} = \\frac{5 + 1}{2} = 3$$',
                '$$x_2 = \\frac{-b - \\sqrt{\\Delta}}{2a} = \\frac{-(-5) - \\sqrt{1}}{2 \\cdot 1} = \\frac{5 - 1}{2} = 2$$'
              ],
              finalAnswer: 'Vậy tập nghiệm của phương trình là $S = \\{2; 3\\}$.'
            }
          }
        ]
      },
      {
        id: 'slide-pt-9',
        slideNumber: 9,
        title: 'Công Thức Nghiệm Thu Gọn $\\Delta\'$ (Khi $b$ Chẵn)',
        subtitle: 'Kỹ thuật tính toán siêu nhanh giúp giảm bớt số liệu cồng kềnh',
        category: 'method',
        layout: 'split_two_col',
        keyFormula: '\\Delta\' = b\'^2 - ac \\quad \\text{với } b\' = \\frac{b}{2}',
        suggestedDurationMin: 6,
        teacherSpeechGuide: 'Khuyên học sinh nên dùng Delta phẩy khi hệ số b là số chẵn như 2, 4, -6, 8.',
        chalkboardNotes: 'Công thức thu gọn: $b = 2b\' \\implies \\Delta\' = b\'^2 - ac$\n• $\\Delta\' > 0 \\implies x_{1,2} = \\frac{-b\' \\pm \\sqrt{\\Delta\'}}{a}$\n• $\\Delta\' = 0 \\implies x = -b\'/a$\n• $\\Delta\' < 0 \\implies$ Vô nghiệm.',
        sections: [
          {
            title: 'Biệt thức thu gọn $\\Delta\'$',
            content: 'Khi $b$ là số chẵn, đặt $b\' = \\dfrac{b}{2}$:',
            bulletPoints: [
              'Biệt thức thu gọn: $$\\Delta\' = b\'^2 - ac$$',
              'So sánh: $\\Delta = 4\\Delta\'$, do đó dấu của $\\Delta\'$ giống hệt dấu của $\\Delta$.'
            ]
          },
          {
            title: 'Công thức nghiệm theo $\\Delta\'$',
            content: 'Các trường hợp nghiệm thu gọn:',
            bulletPoints: [
              'Nếu $\\Delta\' > 0$: $x_{1,2} = \\dfrac{-b\' \\pm \\sqrt{\\Delta\'}}{a}$ (mẫu số chỉ là $a$, không phải $2a$).',
              'Nếu $\\Delta\' = 0$: $x_1 = x_2 = -\\dfrac{b\'}{a}$',
              'Nếu $\\Delta\' < 0$: Phương trình vô nghiệm.'
            ]
          }
        ]
      },
      {
        id: 'slide-pt-10',
        slideNumber: 10,
        title: 'Luyện Tập: Áp Dụng Công Thức Thu Gọn $\\Delta\'$',
        subtitle: 'Thực hành giải phương trình có hệ số $b$ chẵn',
        category: 'example',
        layout: 'example_box',
        suggestedDurationMin: 5,
        teacherSpeechGuide: 'Chỉ ra cho học sinh thấy tính bằng Delta phẩy không cần phải chia 2 ở mẫu số.',
        chalkboardNotes: 'Giải $3x^2 + 8x + 4 = 0$.\n$a=3, b=8 \\implies b\'=4, c=4$.\n$\\Delta\' = 4^2 - 3 \\cdot 4 = 16 - 12 = 4 > 0$.\n$x_1 = \\frac{-4 + 2}{3} = -\\frac{2}{3},\\; x_2 = \\frac{-4 - 2}{3} = -2$.',
        sections: [
          {
            example: {
              problem: 'Giải phương trình: $$3x^2 + 8x + 4 = 0$$',
              solutionSteps: [
                'Ta có: $a = 3,\\; b = 8 \\implies b\' = 4,\\; c = 4$.',
                'Tính $\\Delta\'$:',
                '$$\\Delta\' = b\'^2 - ac = 4^2 - 3 \\cdot 4 = 16 - 12 = 4$$',
                'Vì $\\Delta\' = 4 > 0 \\implies \\sqrt{\\Delta\'} = 2$. Phương trình có 2 nghiệm:',
                '$$x_1 = \\frac{-b\' + \\sqrt{\\Delta\'}}{a} = \\frac{-4 + 2}{3} = -\\frac{2}{3}$$',
                '$$x_2 = \\frac{-b\' - \\sqrt{\\Delta\'}}{a} = \\frac{-4 - 2}{3} = \\frac{-6}{3} = -2$$'
              ],
              finalAnswer: 'Vậy phương trình có hai nghiệm $x_1 = -\\frac{2}{3}, x_2 = -2$.'
            }
          }
        ]
      },
      {
        id: 'slide-pt-11',
        slideNumber: 11,
        title: 'Định Lý Viète (Hệ Thức Vi-ét)',
        subtitle: 'Mối liên hệ tuyệt mỹ giữa các nghiệm và hệ số phương trình',
        category: 'theorem',
        layout: 'formula_focus',
        keyFormula: 'S = x_1 + x_2 = -\\frac{b}{a}, \\quad P = x_1 x_2 = \\frac{c}{a}',
        suggestedDurationMin: 6,
        teacherSpeechGuide: 'Nhấn mạnh Định lý Viète chỉ áp dụng được khi phương trình CÓ NGHIỆM (tức $\\Delta \\ge 0$).',
        chalkboardNotes: 'III. ĐỊNH LÝ VIÈTE\nNếu $x_1, x_2$ là 2 nghiệm của $ax^2 + bx + c = 0\\; (a \\neq 0)$:\n• Tổng: $S = x_1 + x_2 = -\\frac{b}{a}$\n• Tích: $P = x_1 x_2 = \\frac{c}{a}$.',
        sections: [
          {
            title: 'Phát biểu định lý Viète',
            content: 'Nếu $x_1, x_2$ là hai nghiệm của phương trình $ax^2 + bx + c = 0$ ($a \\neq 0$) thì:',
            callout: {
              type: 'theorem',
              title: 'Hệ thức Viète',
              content: '$$\\begin{cases} S = x_1 + x_2 = -\\dfrac{b}{a} \\\\[6pt] P = x_1 x_2 = \\dfrac{c}{a} \\end{cases}$$'
            },
            bulletPoints: [
              'Cho phép tính tổng và tích các nghiệm **mà không cần giải trực tiếp phương trình**.',
              '**Điều kiện cần kiểm tra trước:** Phương trình phải có nghiệm (tức $\\Delta \\ge 0$).'
            ]
          }
        ]
      },
      {
        id: 'slide-pt-12',
        slideNumber: 12,
        title: 'Kỹ Thuật Nhẩm Nghiệm Đặc Biệt Trong 3 Giây',
        subtitle: 'Hai trường hợp tổng hệ số $a+b+c=0$ và $a-b+c=0$',
        category: 'method',
        layout: 'split_two_col',
        keyFormula: 'a+b+c=0 \\implies x_1=1, x_2=\\frac{c}{a} \\quad | \\quad a-b+c=0 \\implies x_1=-1, x_2=-\\frac{c}{a}',
        suggestedDurationMin: 6,
        teacherSpeechGuide: 'Đây là kỹ năng tối quan trọng trong các câu hỏi trắc nghiệm và bài toán tham số.',
        chalkboardNotes: 'Nhẩm nghiệm nhanh:\n1. $a + b + c = 0 \\implies x_1 = 1, x_2 = \\frac{c}{a}$\n2. $a - b + c = 0 \\implies x_1 = -1, x_2 = -\\frac{c}{a}$.',
        sections: [
          {
            title: 'Trường hợp 1: $a + b + c = 0$',
            content: 'Nếu phương trình có $a + b + c = 0$:',
            bulletPoints: [
              'Nghiệm thứ nhất: **$x_1 = 1$**',
              'Nghiệm thứ hai: **$x_2 = \\dfrac{c}{a}$**',
              'Ví dụ: $5x^2 - 7x + 2 = 0$ có $a+b+c = 5-7+2 = 0 \\implies x_1 = 1, x_2 = \\frac{2}{5}$'
            ]
          },
          {
            title: 'Trường hợp 2: $a - b + c = 0$',
            content: 'Nếu phương trình có $a - b + c = 0$:',
            bulletPoints: [
              'Nghiệm thứ nhất: **$x_1 = -1$**',
              'Nghiệm thứ hai: **$x_2 = -\\dfrac{c}{a}$**',
              'Ví dụ: $3x^2 + 7x + 4 = 0$ có $a-b+c = 3-7+4 = 0 \\implies x_1 = -1, x_2 = -\\frac{4}{3}$'
            ]
          }
        ]
      },
      {
        id: 'slide-pt-13',
        slideNumber: 13,
        title: 'Ứng Dụng Viète: Tính Giá Trị Biểu Thức Đối Xứng',
        subtitle: 'Các công thức biến đổi quen thuộc $x_1^2 + x_2^2$ và $\\frac{1}{x_1} + \\frac{1}{x_2}$',
        category: 'method',
        layout: 'split_two_col',
        keyFormula: 'x_1^2 + x_2^2 = S^2 - 2P, \\quad \\frac{1}{x_1} + \\frac{1}{x_2} = \\frac{S}{P}',
        suggestedDurationMin: 6,
        teacherSpeechGuide: 'Hướng dẫn học sinh biến đổi biểu thức về dạng chỉ chứa tổng S và tích P.',
        chalkboardNotes: 'Biểu thức đối xứng theo $S, P$:\n• $x_1^2 + x_2^2 = (x_1+x_2)^2 - 2x_1x_2 = S^2 - 2P$\n• $\\frac{1}{x_1} + \\frac{1}{x_2} = \\frac{x_1+x_2}{x_1x_2} = \\frac{S}{P}$\n• $|x_1 - x_2| = \\sqrt{(x_1+x_2)^2 - 4x_1x_2} = \\sqrt{S^2 - 4P}$.',
        sections: [
          {
            title: 'Bảng quy đổi hằng đẳng thức',
            content: 'Biến đổi mọi biểu thức đối xứng về $S$ và $P$:',
            bulletPoints: [
              '$x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1 x_2 = S^2 - 2P$',
              '$\\dfrac{1}{x_1} + \\dfrac{1}{x_2} = \\dfrac{x_1 + x_2}{x_1 x_2} = \\dfrac{S}{P}$',
              '$x_1^3 + x_2^3 = (x_1 + x_2)^3 - 3x_1 x_2(x_1 + x_2) = S^3 - 3SP$'
            ]
          },
          {
            title: 'Ví dụ tính nhanh',
            content: 'Cho $x^2 - 4x + 1 = 0$ có $S = 4, P = 1$:',
            bulletPoints: [
              'Tính $A = x_1^2 + x_2^2 = S^2 - 2P = 4^2 - 2(1) = 14$',
              'Tính $B = \\dfrac{1}{x_1} + \\dfrac{1}{x_2} = \\dfrac{S}{P} = \\dfrac{4}{1} = 4$'
            ]
          }
        ]
      },
      {
        id: 'slide-pt-14',
        slideNumber: 14,
        title: 'Tìm Hai Số Khi Biết Tổng Và Tích',
        subtitle: 'Định lý đảo Viète và ứng dụng giải hệ phương trình đối xứng',
        category: 'theorem',
        layout: 'formula_focus',
        keyFormula: 'X^2 - SX + P = 0 \\quad (S^2 - 4P \\ge 0)',
        suggestedDurationMin: 5,
        teacherSpeechGuide: 'Giải thích điều kiện $S^2 - 4P \\ge 0$ để tồn tại hai số thực.',
        chalkboardNotes: 'Định lý đảo Viète:\nNếu hai số $u$ và $v$ có $u + v = S$ và $uv = P$ ($S^2 - 4P \\ge 0$)\n$\\implies u, v$ là hai nghiệm của phương trình: $X^2 - SX + P = 0$.',
        sections: [
          {
            title: 'Định lý đảo Viète',
            content: 'Nếu hai số có tổng bằng $S$ và tích bằng $P$ thì hai số đó là nghiệm của phương trình:',
            callout: {
              type: 'theorem',
              title: 'Phương trình bậc hai tạo thành',
              content: '$$X^2 - SX + P = 0$$'
            },
            bulletPoints: [
              '**Điều kiện tồn tại hai số:** $$S^2 - 4P \\ge 0$$',
              'Nếu $S^2 - 4P < 0 \\implies$ Không tồn tại hai số thực thỏa mãn.'
            ]
          }
        ]
      },
      {
        id: 'slide-pt-15',
        slideNumber: 15,
        title: 'Vận Dụng Thực Tiễn: Bài Toán Tối Ưu Hóa Diện Tích',
        subtitle: 'Tìm kích thước mảnh vườn chữ nhật có chu vi và diện tích cho trước',
        category: 'application',
        layout: 'example_box',
        suggestedDurationMin: 6,
        teacherSpeechGuide: 'Hướng dẫn học sinh đưa bài toán tìm chiều dài và chiều rộng về bài toán tìm 2 số khi biết tổng và tích.',
        chalkboardNotes: 'Vận dụng: Chu vi $28\\text{ m} \\implies S = 14\\text{ m}$. Diện tích $P = 48\\text{ m}^2$.\nGiải $X^2 - 14X + 48 = 0 \\implies X_1 = 8, X_2 = 6$.',
        sections: [
          {
            example: {
              problem: 'Một bác nông dân muốn rào một mảnh vườn hình chữ nhật có chu vi bằng $28\\text{ m}$ và diện tích bằng $48\\text{ m}^2$. Hãy tính chiều dài và chiều rộng của mảnh vườn.',
              solutionSteps: [
                'Nửa chu vi của mảnh vườn (tổng chiều dài và chiều rộng) là: $$S = 28 : 2 = 14\\text{ (m)}$$',
                'Diện tích của mảnh vườn (tích chiều dài và chiều rộng) là: $$P = 48\\text{ (m}^2)$$',
                'Kiểm tra điều kiện: $S^2 - 4P = 14^2 - 4 \\cdot 48 = 196 - 192 = 4 > 0$ (thỏa mãn).',
                'Chiều dài và chiều rộng là hai nghiệm của phương trình: $$X^2 - 14X + 48 = 0$$',
                'Giải phương trình: $\\Delta\' = (-7)^2 - 48 = 49 - 48 = 1 > 0$',
                '$$X_1 = 7 + 1 = 8, \\quad X_2 = 7 - 1 = 6$$'
              ],
              finalAnswer: 'Vậy mảnh vườn có chiều dài là $8\\text{ m}$ và chiều rộng là $6\\text{ m}$.'
            }
          }
        ]
      },
      {
        id: 'slide-pt-16',
        slideNumber: 16,
        title: 'Tổng Kết Bài Học: Sơ Đồ Tư Duy Phương Trình Bậc Hai',
        subtitle: 'Toàn bộ quy trình giải và các công thức then chốt trên 1 trang',
        category: 'summary',
        layout: 'split_two_col',
        keyFormula: 'ax^2 + bx + c = 0 \\implies \\Delta = b^2 - 4ac, \\; S = -\\frac{b}{a}, \\; P = \\frac{c}{a}',
        suggestedDurationMin: 5,
        teacherSpeechGuide: 'Cho học sinh tóm tắt lại 3 bước giải và các trường hợp nhẩm nghiệm.',
        chalkboardNotes: 'TỔNG KẾT:\n1. Tính $\\Delta = b^2 - 4ac$ (hoặc $\\Delta\' = b\'^2 - ac$ khi $b$ chẵn).\n2. Nhẩm nghiệm: $a+b+c=0 \\rightarrow (1, c/a)$, $a-b+c=0 \\rightarrow (-1, -c/a)$.\n3. Định lý Viète: $S = -b/a, P = c/a$.',
        sections: [
          {
            title: 'Quy Trình Giải 3 Bước',
            content: 'Các bước chuẩn khi giải phương trình bậc hai:',
            bulletPoints: [
              '**Bước 1:** Đưa phương trình về dạng chuẩn $ax^2 + bx + c = 0$ và xác định hệ số $a, b, c$.',
              '**Bước 2:** Ưu tiên kiểm tra nhẩm nghiệm $a+b+c=0$ hoặc $a-b+c=0$. Nếu không được, tính $\\Delta$ hoặc $\\Delta\'$.',
              '**Bước 3:** Kết luận tập nghiệm $S$ tương ứng với dấu của $\\Delta$.'
            ]
          },
          {
            title: 'Lưu Ý Phòng Tránh Sai Lầm',
            content: 'Những lỗi học sinh hay bị trừ điểm:',
            bulletPoints: [
              '❌ Quên đổi dấu $-b$ khi tính nghiệm $x = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}$.',
              '❌ Nhầm mẫu số của công thức nghiệm $\\Delta\'$ là $2a$ (đúng phải là $a$).',
              '❌ Quên kiểm tra điều kiện $\\Delta \\ge 0$ trước khi áp dụng định lý Viète.'
            ]
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q-pt-1',
        questionNumber: 1,
        type: 'multiple_choice',
        difficulty: 'easy',
        targetConcept: 'Nhẩm nghiệm Viète',
        prompt: 'Nghiệm của phương trình $3x^2 - 7x + 4 = 0$ là:',
        options: [
          { key: 'A', text: '$x_1 = 1, x_2 = \\frac{4}{3}$', isCorrect: true },
          { key: 'B', text: '$x_1 = -1, x_2 = -\\frac{4}{3}$', isCorrect: false },
          { key: 'C', text: '$x_1 = 2, x_2 = \\frac{2}{3}$', isCorrect: false },
          { key: 'D', text: 'Vô nghiệm', isCorrect: false }
        ],
        detailedSolution: 'Ta có hệ số $a = 3, b = -7, c = 4$.\nNhận xét: $a + b + c = 3 + (-7) + 4 = 0$.\nTheo tính chất nhẩm nghiệm Viète, phương trình có 2 nghiệm:\n$x_1 = 1$ và $x_2 = \\frac{c}{a} = \\frac{4}{3}$.',
        hint: 'Kiểm tra tổng các hệ số $a + b + c$.'
      },
      {
        id: 'q-pt-2',
        questionNumber: 2,
        type: 'short_answer',
        difficulty: 'medium',
        targetConcept: 'Biểu thức đối xứng Viète',
        prompt: 'Gọi $x_1, x_2$ là hai nghiệm của phương trình $x^2 - 4x + 1 = 0$. Tính giá trị của biểu thức $T = x_1^2 + x_2^2$?',
        correctShortAnswer: '14',
        acceptableAnswers: ['14', 'T=14', 'T = 14'],
        detailedSolution: 'Theo định lý Viète:\n$S = x_1 + x_2 = 4$\n$P = x_1 x_2 = 1$\nTa biến đổi $T = x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1 x_2 = S^2 - 2P = 4^2 - 2(1) = 16 - 2 = 14$.',
        hint: 'Dùng hằng đẳng thức $(x_1+x_2)^2 - 2x_1x_2$.'
      }
    ],
    summary: {
      topicTitle: 'Phương Trình Bậc Hai & Định Lý Viète',
      gradeLevel: 'Đại số Lớp 9',
      mainOverview: 'Phương trình bậc hai là nội dung trọng tâm trong kỳ thi vào lớp 10, kết nối giữa đại số giải tích và đồ thị hàm số bậc hai parabol.',
      coreConcepts: [
        {
          id: 'cp-1',
          term: 'Biệt thức Delta',
          definition: 'Biệt thức $\\Delta = b^2 - 4ac$ quyết định số nghiệm thực của phương trình.',
          formula: '\\Delta = b^2 - 4ac',
          importance: 'essential'
        },
        {
          id: 'cp-2',
          term: 'Định lý Viète',
          definition: 'Liên hệ giữa nghiệm và hệ số: tổng $S = -b/a$, tích $P = c/a$.',
          formula: 'x_1 + x_2 = -\\frac{b}{a}, \\quad x_1 x_2 = \\frac{c}{a}',
          importance: 'essential'
        }
      ],
      goldenFormulas: [
        {
          id: 'gf-1',
          name: 'Công thức nghiệm Delta',
          latex: 'x_{1,2} = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
          condition: '\\Delta > 0, a \\neq 0',
          description: 'Nghiệm tổng quát cho mọi phương trình bậc hai.'
        },
        {
          id: 'gf-2',
          name: 'Biểu thức nghiệm đối xứng $x_1^2 + x_2^2$',
          latex: 'x_1^2 + x_2^2 = S^2 - 2P = \\left(-\\frac{b}{a}\\right)^2 - 2\\left(\\frac{c}{a}\\right)',
          description: 'Công thức tính tổng bình phương hai nghiệm không cần tìm nghiệm.'
        }
      ],
      commonPitfalls: [
        {
          id: 'cpf-1',
          title: 'Quên điều kiện $a \\neq 0$',
          wrongWay: 'Tính $\\Delta$ ngay khi đề bài cho $(m-1)x^2 + 2x + 1 = 0$ mà không xét $m = 1$.',
          rightWay: 'Xét trường hợp 1: $m - 1 = 0 \\implies$ PT bậc nhất. Trường hợp 2: $m - 1 \\neq 0 \\implies$ PT bậc hai.',
          explanation: 'Phương trình chỉ là bậc hai khi hệ số trước $x^2$ khác 0.'
        }
      ],
      mindmapTree: {
        id: 'root-pt',
        label: 'Phương Trình Bậc Hai $ax^2+bx+c=0$',
        color: 'sky',
        children: [
          {
            id: 'pt-branch-1',
            label: '1. Biệt thức Delta',
            formula: '\\Delta = b^2 - 4ac',
            children: [
              { id: 'pt-1-1', label: '$\\Delta > 0$: 2 nghiệm phân biệt' },
              { id: 'pt-1-2', label: '$\\Delta = 0$: Nghiệm kép $x = -b/(2a)$' },
              { id: 'pt-1-3', label: '$\\Delta < 0$: Vô nghiệm' }
            ]
          },
          {
            id: 'pt-branch-2',
            label: '2. Định lý Viète',
            formula: 'S = -b/a, P = c/a',
            children: [
              { id: 'pt-2-1', label: 'Nhẩm nghiệm $a+b+c=0 \\implies 1, c/a$' },
              { id: 'pt-2-2', label: 'Nhẩm nghiệm $a-b+c=0 \\implies -1, -c/a$' },
              { id: 'pt-2-3', label: 'Lập phương trình biết $S, P$: $X^2 - SX + P = 0$' }
            ]
          }
        ]
      },
      wrapUpFlashcards: [
        {
          id: 'fc-pt-1',
          front: 'Khi nào phương trình $ax^2 + bx + c = 0$ có nghiệm kép?',
          back: 'Khi $a \\neq 0$ và $\\Delta = b^2 - 4ac = 0$. Nghiệm kép là $x_1 = x_2 = -\\frac{b}{2a}$.',
          formula: '\\Delta = 0 \\implies x = -\\frac{b}{2a}',
          category: 'Lý thuyết'
        }
      ]
    }
  }
];
