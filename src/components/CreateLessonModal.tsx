import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Layers,
  HelpCircle,
  FileText,
  CheckCircle2,
  GraduationCap,
  ArrowRight,
  Flame,
  Bookmark
} from 'lucide-react';
import { MathLesson, Slide, Question, LessonSummary } from '../types';

interface CreateLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateLesson: (newLesson: MathLesson) => void;
}

const GRADE_SUGGESTIONS: {
  grade: string;
  defaultChapter: string;
  popularLessons: string[];
}[] = [
  {
    grade: 'Toán Lớp 10 - Kết Nối Tri Thức',
    defaultChapter: 'Chương I: Mệnh Đề và Tập Hợp',
    popularLessons: [
      'Bài 1: Mệnh Đề Toán Học',
      'Bài 2: Tập Hợp & Các Phép Toán',
      'Bài 3: Bất Phương Trình Bậc Nhất Hai Ẩn',
      'Bài 4: Hàm Số & Đồ Thị',
      'Bài 5: Giá Trị Lượng Giác & Hệ Thức Lượng',
      'Bài 6: Khái Niệm Vectơ'
    ]
  },
  {
    grade: 'Toán Lớp 11 - Cánh Diều',
    defaultChapter: 'Chương I: Hàm Số Lượng Giác & Phương Trình Lượng Giác',
    popularLessons: [
      'Bài 1: Góc Lượng Giác & Giá Trị Lượng Giác',
      'Bài 2: Các Phép Biến Đổi Lượng Giác',
      'Bài 3: Dãy Số, Cấp Số Cộng & Cấp Số Nhân',
      'Bài 4: Giới Hạn Của Dãy Số & Hàm Số',
      'Bài 5: Đường Thẳng & Mặt Phẳng Trong Không Gian'
    ]
  },
  {
    grade: 'Toán Lớp 12 - Chân Trời Sáng Tạo',
    defaultChapter: 'Chương I: Ứng Dụng Đạo Hàm Khảo Sát Hàm Số',
    popularLessons: [
      'Bài 1: Tính Đơn Điệu Của Hàm Số',
      'Bài 2: Cực Trị Của Hàm Số',
      'Bài 3: Giá Trị Lớn Nhất & Nhỏ Nhất',
      'Bài 4: Đường Tiệm Cận Của Đồ Thị',
      'Bài 5: Vectơ & Hệ Tọa Độ Trong Không Gian'
    ]
  },
  {
    grade: 'Toán Lớp 9 - Đại Số & Hình Học',
    defaultChapter: 'Chương III: Phương Trình Bậc Hai Một Ẩn',
    popularLessons: [
      'Bài 1: Căn Bậc Hai & Hằng Đẳng Thức',
      'Bài 2: Hệ Hai Phương Trình Bậc Nhất Hai Ẩn',
      'Bài 3: Phương Trình Bậc Hai & Hệ Thức Viète',
      'Bài 4: Góc Với Đường Tròn & Tứ Giác Nội Tiếp'
    ]
  },
  {
    grade: 'Toán Lớp 8 - Hình Học & Đại Số',
    defaultChapter: 'Chương II: Phân Thức Đại Số / Tam Giác Đồng Dạng',
    popularLessons: [
      'Bài 1: Bảy Hằng Đẳng Thức Đáng Nhớ',
      'Bài 2: Định Lý Pythagore & Ứng Dụng',
      'Bài 3: Phân Thức Đại Số & Rút Gọn',
      'Bài 4: Tam Giác Đồng Dạng & Định Lý Thales'
    ]
  }
];

export const CreateLessonModal: React.FC<CreateLessonModalProps> = ({
  isOpen,
  onClose,
  onCreateLesson
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('BÀI 2: TẬP HỢP VÀ CÁC PHÉP TOÁN');
  const [selectedGradeIndex, setSelectedGradeIndex] = useState(0);
  const [customGrade, setCustomGrade] = useState('');
  const [chapterOrTopic, setChapterOrTopic] = useState('Chương I: Mệnh Đề và Tập Hợp');
  const [templateStructure, setTemplateStructure] = useState<'standard' | 'minimal'>('standard');

  const currentGradeObj = GRADE_SUGGESTIONS[selectedGradeIndex];
  const activeGradeName = customGrade.trim() || currentGradeObj?.grade || 'Toán THPT';

  const handleSelectGrade = (idx: number) => {
    setSelectedGradeIndex(idx);
    setCustomGrade('');
    const obj = GRADE_SUGGESTIONS[idx];
    if (obj) {
      setChapterOrTopic(obj.defaultChapter);
      if (obj.popularLessons.length > 0) {
        setTitle(obj.popularLessons[0]);
      }
    }
  };

  const handleSelectPopularLesson = (lessonName: string) => {
    setTitle(lessonName);
  };

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên bài giảng.');
      return;
    }

    const timestamp = Date.now();
    const lessonId = `lesson-custom-${timestamp}-${Math.random().toString(36).substring(2, 7)}`;

    // Generate starter slides based on selected template structure
    let initialSlides: Slide[] = [];

    if (templateStructure === 'standard') {
      initialSlides = [
        {
          id: `slide-${timestamp}-1`,
          slideNumber: 1,
          title: title.trim(),
          subtitle: `${chapterOrTopic.trim()} • ${activeGradeName}`,
          blocks: [
            {
              id: `block-${timestamp}-1-1`,
              type: 'lesson_title',
              title: title.trim(),
              subtitle: `${chapterOrTopic.trim()} — ${activeGradeName}`,
              keyFormula: '$$A \\cap B = \\{x \\mid x \\in A \\text{ và } x \\in B\\}$$',
              animation: 'fade_down'
            },
            {
              id: `block-${timestamp}-1-2`,
              type: 'objectives',
              title: 'Mục Tiêu Bài Học',
              items: [
                'Nắm vững khái niệm, định nghĩa và tính chất cốt lõi của bài học',
                'Thực hành thành thạo các bước giải toán và biến đổi đại số',
                'Vận dụng giải quyết các bài toán liên hệ thực tiễn và bài tập củng cố'
              ],
              animation: 'fade_up'
            },
            {
              id: `block-${timestamp}-1-3`,
              type: 'opening_problem',
              title: 'Tình Huống Mở Đầu (Khởi Động)',
              context: 'Trong thực tiễn và đời sống, việc mô hình hóa các tập hợp dữ liệu giúp chúng ta phân loại và xử lý thông tin một cách có hệ thống...',
              question: 'Làm thế nào để xác định chính xác mối quan hệ giữa các đối tượng trong toán học?',
              conclusion: 'Bài học hôm nay sẽ cung cấp cho các em công cụ chính xác để giải quyết vấn đề trên.',
              animation: 'zoom_in'
            }
          ]
        },
        {
          id: `slide-${timestamp}-2`,
          slideNumber: 2,
          title: 'I. Khám Phá Kiến Thức & Trọng Tâm',
          subtitle: 'Khái niệm, định nghĩa và định lý cơ bản',
          blocks: [
            {
              id: `block-${timestamp}-2-1`,
              type: 'activity',
              title: 'Hoạt Động Khám Phá 1',
              description: 'Cho hai tập hợp cụ thể hoặc đại lượng toán học. Quan sát sự tương quan giữa các phần tử.',
              question: 'Em có nhận xét gì về các phần tử cùng thuộc cả hai tập hợp?',
              conclusion: 'Ta nhận thấy tập hợp các phần tử chung tạo thành một tập hợp mới, gọi là giao của hai tập hợp.',
              animation: 'slide_left'
            },
            {
              id: `block-${timestamp}-2-2`,
              type: 'takeaway',
              title: 'Định Nghĩa & Kiến Thức Trọng Tâm',
              content: 'Giao của hai tập hợp A và B, ký hiệu là $A \\cap B$, là tập hợp gồm tất cả các phần tử vừa thuộc A, vừa thuộc B.',
              keyFormula: '$$A \\cap B = \\{x \\mid x \\in A \\text{ và } x \\in B\\}$$',
              animation: 'pulse_glow'
            },
            {
              id: `block-${timestamp}-2-3`,
              type: 'note',
              title: 'Lưu Ý & Quy Ước',
              content: 'Nếu hai tập hợp không có phần tử chung nào thì giao của chúng là tập hợp rỗng: $A \\cap B = \\varnothing$.',
              animation: 'fade_up'
            }
          ]
        },
        {
          id: `slide-${timestamp}-3`,
          slideNumber: 3,
          title: 'II. Ví Dụ Minh Họa & Luyện Tập',
          subtitle: 'Áp dụng lý thuyết vào giải bài tập mẫu',
          blocks: [
            {
              id: `block-${timestamp}-3-1`,
              type: 'example',
              title: 'Ví Dụ Minh Họa 1',
              problem: 'Cho hai tập hợp $A = \\{1; 2; 3; 4\\}$ và $B = \\{2; 4; 6; 8\\}$. Hãy xác định tập hợp $A \\cap B$ và $A \\cup B$.',
              solutionSteps: [
                'Bước 1: Tìm các phần tử cùng thuộc cả A và B: đó là $2$ và $4$. Do đó $A \\cap B = \\{2; 4\\}$.',
                'Bước 2: Tập hợp các phần tử thuộc A hoặc thuộc B: $A \\cup B = \\{1; 2; 3; 4; 6; 8\\}$.',
                'Bước 3: Kiểm tra các phần tử không bị lặp lại trong biểu diễn tập hợp.'
              ],
              finalAnswer: 'Kết luận: $A \\cap B = \\{2; 4\\}$ và $A \\cup B = \\{1; 2; 3; 4; 6; 8\\}$.',
              animation: 'flip_x'
            },
            {
              id: `block-${timestamp}-3-2`,
              type: 'practice',
              title: 'Luyện Tập Nhanh',
              problem: 'Cho $C = \\{x \\in \\mathbb{R} \\mid -2 \\le x < 3\\}$ và $D = [0; 5]$. Hãy tìm $C \\cap D$.',
              hint: 'Biểu diễn các đoạn, nửa khoảng trên trục số thực để tìm phần giao chung.',
              solution: 'Giao của hai khoảng trên trục số là nửa khoảng $[0; 3)$.',
              animation: 'zoom_in'
            }
          ]
        }
      ];
    } else {
      // Minimal template (1 clean slide)
      initialSlides = [
        {
          id: `slide-${timestamp}-1`,
          slideNumber: 1,
          title: title.trim(),
          subtitle: `${chapterOrTopic.trim()} • ${activeGradeName}`,
          blocks: [
            {
              id: `block-${timestamp}-1-1`,
              type: 'lesson_title',
              title: title.trim(),
              subtitle: `${chapterOrTopic.trim()} — ${activeGradeName}`,
              keyFormula: '$$f(x) = ax^2 + bx + c$$',
              animation: 'fade_down'
            },
            {
              id: `block-${timestamp}-1-2`,
              type: 'content',
              title: 'Nội Dung Bắt Đầu Soạn',
              content: 'Chào mừng quý thầy cô đến với bài giảng mới! Thầy cô có thể nhấn trực tiếp vào khối nội dung này để chỉnh sửa văn bản, chèn công thức Toán học định dạng LaTeX bằng dấu $ hoặc $$, thêm hình ảnh và bổ sung các khối kiến thức mới.',
              animation: 'fade_up'
            }
          ]
        }
      ];
    }

    // Generate initial questions
    const initialQuestions: Question[] = [
      {
        id: `q-${timestamp}-1`,
        type: 'multiple_choice',
        questionNumber: 1,
        difficulty: 'easy',
        targetConcept: 'Nhận biết khái niệm trọng tâm',
        prompt: `Trong bài học **${title.trim()}**, khẳng định nào sau đây là **chính xác nhất**?`,
        options: [
          {
            key: 'A',
            text: 'Khẳng định đúng theo định nghĩa trong sách giáo khoa toán học',
            isCorrect: true,
            explanation: 'Chính xác theo định nghĩa cơ bản đã nêu trong bài học.'
          },
          {
            key: 'B',
            text: 'Khẳng định chưa tính đến điều kiện xác định của biến',
            isCorrect: false,
            explanation: 'Thiếu điều kiện cần thiết.'
          },
          {
            key: 'C',
            text: 'Khẳng định đảo ngược mối quan hệ suy luận logic',
            isCorrect: false,
            explanation: 'Mệnh đề đảo không phải lúc nào cũng đúng.'
          },
          {
            key: 'D',
            text: 'Tất cả các khẳng định trên đều không đúng',
            isCorrect: false,
            explanation: 'Phương án A là đáp án đúng.'
          }
        ],
        detailedSolution: 'Căn cứ vào định nghĩa và tính chất cơ bản được trình bày trong bài giảng, phương án A là đáp án hoàn toàn chính xác.',
        hint: 'Xem lại phần Kiến thức trọng tâm trên slide 2.'
      },
      {
        id: `q-${timestamp}-2`,
        type: 'true_false',
        questionNumber: 2,
        difficulty: 'medium',
        targetConcept: 'Thông hiểu và đánh giá đúng sai',
        prompt: `Xét tính Đúng hoặc Sai của các phát biểu sau liên quan đến **${title.trim()}**:`,
        tfStatements: [
          {
            id: `tf-${timestamp}-1`,
            statement: 'Khái niệm và định nghĩa được áp dụng khi thỏa mãn các điều kiện tiên quyết.',
            isCorrect: true,
            explanation: 'Đúng theo quy tắc toán học.'
          },
          {
            id: `tf-${timestamp}-2`,
            statement: 'Mọi trường hợp đặc biệt đều cho cùng một kết quả giống nhau.',
            isCorrect: false,
            explanation: 'Sai, các trường hợp suy biến có thể mang lại kết quả khác biệt.'
          },
          {
            id: `tf-${timestamp}-3`,
            statement: 'Có thể áp dụng phương pháp tương tự từ ví dụ mẫu để giải bài tập rèn luyện.',
            isCorrect: true,
            explanation: 'Đúng, đây là phương pháp rèn luyện tư duy toán học chuẩn.'
          },
          {
            id: `tf-${timestamp}-4`,
            statement: 'Không thể biểu diễn trực quan các khái niệm này trên hình vẽ hoặc trục số.',
            isCorrect: false,
            explanation: 'Sai, toán học luôn có phương pháp biểu diễn hình học hoặc sơ đồ trực quan.'
          }
        ],
        detailedSolution: 'Thầy cô và học sinh phân tích từng mệnh đề dựa trên các định lý và tính chất đã học.'
      }
    ];

    const initialSummary: LessonSummary = {
      topicTitle: title.trim(),
      gradeLevel: activeGradeName,
      mainOverview: `Bài giảng toán học: ${title.trim()} (${activeGradeName}) - ${chapterOrTopic.trim()}`,
      coreConcepts: [
        {
          id: `concept-${timestamp}-1`,
          term: 'Khái niệm trọng tâm',
          definition: 'Định nghĩa cơ bản và trọng tâm của bài học.',
          importance: 'essential'
        }
      ],
      goldenFormulas: [],
      commonPitfalls: [],
      mindmapTree: {
        id: 'root',
        label: title.trim(),
        children: [
          { id: `node-${timestamp}-1`, label: '1. Khởi Động & Khái Niệm' },
          { id: `node-${timestamp}-2`, label: '2. Kiến Thức Trọng Tâm' },
          { id: `node-${timestamp}-3`, label: '3. Ví Dụ & Luyện Tập' }
        ]
      },
      wrapUpFlashcards: []
    };

    const newLesson: MathLesson = {
      id: lessonId,
      title: title.trim(),
      grade: activeGradeName,
      chapterOrTopic: chapterOrTopic.trim(),
      createdAt: timestamp,
      updatedAt: timestamp,
      sourceImageCount: 0,
      slides: initialSlides,
      questions: initialQuestions,
      summary: initialSummary,
      config: {
        totalQuestions: initialQuestions.length,
        numMultipleChoice: 1,
        numTrueFalse: 1,
        numShortAnswer: 0,
        numEssay: 0,
        targetGrade: activeGradeName,
        teachingGoal: 'concept_mastery'
      }
    };

    onCreateLesson(newLesson);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Soạn Bài Giảng Mới</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-mono">
                  THPT & THCS
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Thiết lập thông tin bài học và khởi tạo khung slide sư phạm kèm câu hỏi củng cố
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content Form */}
        <form onSubmit={handleSubmitManual} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* 1. Grade Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>1. Chọn Khối Lớp / Chương Trình Giảng Dạy</span>
                <span className="text-[11px] text-indigo-400 font-normal">SGK Mới (KNTT, Cánh Diều, CTST)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {GRADE_SUGGESTIONS.map((item, idx) => {
                  const isSelected = selectedGradeIndex === idx && !customGrade;
                  return (
                    <button
                      key={item.grade}
                      type="button"
                      onClick={() => handleSelectGrade(idx)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-indigo-950/80 border-indigo-500 text-white ring-1 ring-indigo-500'
                          : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="truncate">{item.grade.split(' - ')[0]}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5 font-normal">
                        {item.grade.split(' - ')[1] || 'Chuẩn'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Popular Lesson Suggestions */}
            {currentGradeObj && currentGradeObj.popularLessons.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gợi ý bài học tiêu biểu ({currentGradeObj.grade.split(' - ')[0]}):</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {currentGradeObj.popularLessons.map((les) => (
                    <button
                      key={les}
                      type="button"
                      onClick={() => handleSelectPopularLesson(les)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                        title === les
                          ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {les}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Lesson Title */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                2. Tên Bài Giảng <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: BÀI 1: MỆNH ĐỀ TOÁN HỌC"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                required
              />
            </div>

            {/* 3. Chapter / Topic */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                3. Chương / Chủ Đề
              </label>
              <input
                type="text"
                value={chapterOrTopic}
                onChange={(e) => setChapterOrTopic(e.target.value)}
                placeholder="Ví dụ: Chương I: Mệnh Đề và Tập Hợp"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* 4. Template Structure Choice */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                4. Cấu Trúc Khởi Tạo Khung Bài Giảng
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTemplateStructure('standard')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    templateStructure === 'standard'
                      ? 'bg-indigo-950/70 border-indigo-500 ring-1 ring-indigo-500/40 text-white'
                      : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs flex items-center gap-1.5 text-indigo-300">
                      <Layers className="w-4 h-4" />
                      Khung Chuẩn SGK (3 Slides)
                    </span>
                    {templateStructure === 'standard' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Bao gồm Slide Bìa + Mục tiêu, Slide Hoạt động khám phá & Kiến thức trọng tâm, Slide Ví dụ mẫu & Luyện tập + 2 câu hỏi củng cố.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplateStructure('minimal')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    templateStructure === 'minimal'
                      ? 'bg-indigo-950/70 border-indigo-500 ring-1 ring-indigo-500/40 text-white'
                      : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs flex items-center gap-1.5 text-slate-300">
                      <FileText className="w-4 h-4" />
                      Khung Tối Giản (1 Slide)
                    </span>
                    {templateStructure === 'minimal' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Bắt đầu với 1 slide tiêu đề sạch sẽ để thầy/cô tự do gõ nội dung, chèn công thức toán và thêm các slide tùy biến từ đầu.
                  </p>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Tạo Bài Giảng & Bắt Đầu Soạn</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
