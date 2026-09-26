import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  PlusCircle,
  Layers,
  FileText,
  CheckCircle2,
  GraduationCap,
  BookOpen,
  User,
  ChevronDown,
  Search,
  AlertCircle,
  Check
} from 'lucide-react';
import { MathLesson, Slide, Question, LessonSummary, AppUser } from '../types';
import { GRADE_OPTIONS, SUBJECT_OPTIONS } from '../constants/curriculum';
import { stampNewLessonOwnership } from '../utils/permissions';

interface CreateLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateLesson: (newLesson: MathLesson) => void;
  currentUser?: AppUser | null;
}

export const CreateLessonModal: React.FC<CreateLessonModalProps> = ({
  isOpen,
  onClose,
  onCreateLesson,
  currentUser,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<string>('Lớp 10');
  const [selectedSubject, setSelectedSubject] = useState<string>('Toán học');
  const [author, setAuthor] = useState<string>(() => currentUser?.displayName || currentUser?.username || '');
  const [title, setTitle] = useState<string>('');
  const [chapterOrTopic, setChapterOrTopic] = useState<string>('');
  const [templateStructure, setTemplateStructure] = useState<'standard' | 'minimal'>('standard');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync default author when modal opens if empty
  useEffect(() => {
    if (isOpen && !author.trim() && currentUser) {
      setAuthor(currentUser.displayName || currentUser.username || '');
    }
  }, [isOpen, currentUser]);

  // Dropdown open states
  const [isGradeDropdownOpen, setIsGradeDropdownOpen] = useState<boolean>(false);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState<boolean>(false);
  const [subjectSearchQuery, setSubjectSearchQuery] = useState<string>('');

  const gradeDropdownRef = useRef<HTMLDivElement>(null);
  const subjectDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (gradeDropdownRef.current && !gradeDropdownRef.current.contains(event.target as Node)) {
        setIsGradeDropdownOpen(false);
      }
      if (subjectDropdownRef.current && !subjectDropdownRef.current.contains(event.target as Node)) {
        setIsSubjectDropdownOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredSubjects = SUBJECT_OPTIONS.filter((subj) => {
    const q = subjectSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      subj.name.toLowerCase().includes(q) ||
      subj.gradesLabel.toLowerCase().includes(q) ||
      subj.category.toLowerCase().includes(q)
    );
  });

  const currentGradeOption = GRADE_OPTIONS.find((g) => g.label === selectedGrade) || GRADE_OPTIONS[4];
  const currentSubjectOption =
    SUBJECT_OPTIONS.find((s) => s.name === selectedSubject) || SUBJECT_OPTIONS[0];

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tên bài giảng.');
      return;
    }

    const timestamp = Date.now();
    const lessonId = `lesson-custom-${timestamp}-${Math.random().toString(36).substring(2, 7)}`;

    const cleanTitle = title.trim();
    const cleanChapter = chapterOrTopic.trim() || `Chương trình ${selectedSubject} ${selectedGrade}`;
    const cleanAuthor = author.trim();
    const combinedGradeDisplay = `${selectedSubject} - ${selectedGrade}`;

    const subtitleParts = [selectedSubject, selectedGrade];
    if (chapterOrTopic.trim()) {
      subtitleParts.push(chapterOrTopic.trim());
    }
    if (cleanAuthor) {
      subtitleParts.push(`GV soạn: ${cleanAuthor}`);
    }
    const slideSubtitleText = subtitleParts.join(' • ');

    const isMathOrScience = ['Toán học', 'Vật lí', 'Hóa học', 'Khoa học tự nhiên (KHTN)'].includes(
      selectedSubject
    );

    let initialSlides: Slide[] = [];

    if (templateStructure === 'standard') {
      initialSlides = [
        {
          id: `slide-${timestamp}-1`,
          slideNumber: 1,
          title: cleanTitle,
          subtitle: slideSubtitleText,
          blocks: [
            {
              id: `block-${timestamp}-1-1`,
              type: 'lesson_title',
              title: cleanTitle,
              subtitle: slideSubtitleText,
              keyFormula: isMathOrScience
                ? `Môn: ${selectedSubject} — ${selectedGrade}${cleanAuthor ? ` | Tác giả: ${cleanAuthor}` : ''}`
                : `Môn: ${selectedSubject} — ${selectedGrade}${cleanAuthor ? ` | Tác giả: ${cleanAuthor}` : ''}`,
              animation: 'fade_down',
            },
            {
              id: `block-${timestamp}-1-2`,
              type: 'objectives',
              title: 'Mục Tiêu Bài Học',
              items: [
                `Nắm vững kiến thức trọng tâm của bài học "${cleanTitle}" (${selectedSubject} - ${selectedGrade})`,
                'Rèn luyện kỹ năng phân tích, vận dụng lý thuyết vào giải quyết nhiệm vụ học tập',
                'Phát triển năng lực tự học, tư duy logic và liên hệ thực tiễn',
              ],
              animation: 'fade_up',
            },
            {
              id: `block-${timestamp}-1-3`,
              type: 'opening_problem',
              title: 'Tình Huống Mở Đầu (Khởi Động)',
              context: 'Đặt vấn đề thực tiễn hoặc câu hỏi khởi động dẫn dắt học sinh vào nội dung bài học mới...',
              question: `Câu hỏi gợi mở cho bài học "${cleanTitle}" là gì?`,
              conclusion: 'Từ tình huống trên, chúng ta cùng khám phá nội dung chi tiết của bài học hôm nay.',
              animation: 'zoom_in',
            },
          ],
        },
        {
          id: `slide-${timestamp}-2`,
          slideNumber: 2,
          title: 'I. Khám Phá Kiến Thức Trọng Tâm',
          subtitle: `${selectedSubject} • ${selectedGrade}${cleanAuthor ? ` • GV: ${cleanAuthor}` : ''}`,
          blocks: [
            {
              id: `block-${timestamp}-2-1`,
              type: 'activity',
              title: 'Hoạt Động Khám Phá 1',
              description: 'Quan sát dữ liệu, tài liệu học tập hoặc tình huống minh họa và thực hiện nhiệm vụ.',
              question: 'Em hãy nêu nhận xét và rút ra kết luận từ hoạt động trên?',
              conclusion: 'Kết luận chính sau khi thảo luận và hoàn thành hoạt động khám phá.',
              animation: 'slide_left',
            },
            {
              id: `block-${timestamp}-2-2`,
              type: 'takeaway',
              title: 'Kiến Thức Trọng Tâm (Ghi Nhớ)',
              content: 'Tóm tắt định nghĩa, khái niệm, định lý hoặc nội dung cốt lõi cần ghi nhớ của bài học.',
              keyFormula: '',
              animation: 'pulse_glow',
            },
            {
              id: `block-${timestamp}-2-3`,
              type: 'note',
              title: 'Lưu Ý Quan Trọng',
              content: 'Các điểm chú ý, mở rộng hoặc lưu ý tránh nhầm lẫn cho học sinh.',
              animation: 'fade_up',
            },
          ],
        },
        {
          id: `slide-${timestamp}-3`,
          slideNumber: 3,
          title: 'II. Ví Dụ Minh Họa & Luyện Tập',
          subtitle: `Vận dụng kiến thức bài ${cleanTitle}`,
          blocks: [
            {
              id: `block-${timestamp}-3-1`,
              type: 'example',
              title: 'Ví Dụ Minh Họa 1',
              problem: 'Nội dung câu hỏi hoặc bài tập ví dụ minh họa cho kiến thức vừa học.',
              solutionSteps: [
                'Bước 1: Phân tích yêu cầu và xác định dữ kiện đề bài.',
                'Bước 2: Áp dụng kiến thức trọng tâm để trình bày các bước giải quyết.',
                'Bước 3: Kiểm tra lại kết quả và rút ra nhận xét.',
              ],
              finalAnswer: 'Kết luận / Đáp án của ví dụ minh họa.',
              animation: 'flip_x',
            },
            {
              id: `block-${timestamp}-3-2`,
              type: 'practice',
              title: 'Bài Tập Luyện Tập',
              problem: 'Câu hỏi hoặc bài tập thực hành để học sinh rèn luyện tại lớp.',
              hint: 'Gợi ý phương pháp hoặc hướng dẫn ngắn gọn cho học sinh.',
              solution: 'Lời giải chi tiết hoặc đáp án chuẩn của bài luyện tập.',
              animation: 'zoom_in',
            },
          ],
        },
      ];
    } else {
      initialSlides = [
        {
          id: `slide-${timestamp}-1`,
          slideNumber: 1,
          title: cleanTitle,
          subtitle: slideSubtitleText,
          blocks: [
            {
              id: `block-${timestamp}-1-1`,
              type: 'lesson_title',
              title: cleanTitle,
              subtitle: slideSubtitleText,
              keyFormula: `Môn: ${selectedSubject} — ${selectedGrade}${cleanAuthor ? ` | Tác giả: ${cleanAuthor}` : ''}`,
              animation: 'fade_down',
            },
            {
              id: `block-${timestamp}-1-2`,
              type: 'content',
              title: 'Nội Dung Bắt Đầu Soạn',
              content:
                'Chào mừng quý thầy cô đến với bài giảng mới! Thầy cô có thể nhấn trực tiếp vào khối nội dung này để chỉnh sửa văn bản, chèn công thức bằng dấu $ hoặc $$, thêm hình ảnh, video và bổ sung các khối kiến thức mới.',
              animation: 'fade_up',
            },
          ],
        },
      ];
    }

    const initialQuestions: Question[] = [
      {
        id: `q-${timestamp}-1`,
        type: 'multiple_choice',
        questionNumber: 1,
        difficulty: 'easy',
        targetConcept: 'Nhận biết kiến thức trọng tâm',
        prompt: `Trong bài học **${cleanTitle}** (${selectedSubject} - ${selectedGrade}), phát biểu nào sau đây là **đúng**?`,
        options: [
          {
            key: 'A',
            text: 'Nội dung phương án đúng theo kiến thức trọng tâm của bài học',
            isCorrect: true,
            explanation: 'Chính xác theo nội dung kiến thức đã học trong bài.',
          },
          {
            key: 'B',
            text: 'Nội dung phương án gây nhiễu thứ nhất',
            isCorrect: false,
            explanation: 'Chưa chính xác.',
          },
          {
            key: 'C',
            text: 'Nội dung phương án gây nhiễu thứ hai',
            isCorrect: false,
            explanation: 'Chưa chính xác.',
          },
          {
            key: 'D',
            text: 'Nội dung phương án gây nhiễu thứ ba',
            isCorrect: false,
            explanation: 'Phương án A là đáp án đúng.',
          },
        ],
        detailedSolution:
          'Căn cứ vào nội dung trọng tâm được trình bày trong bài giảng, phương án A là đáp án chính xác.',
        hint: 'Xem lại phần Kiến thức trọng tâm trong bài học.',
      },
      {
        id: `q-${timestamp}-2`,
        type: 'true_false',
        questionNumber: 2,
        difficulty: 'medium',
        targetConcept: 'Thông hiểu và vận dụng',
        prompt: `Xét tính Đúng hoặc Sai của các nhận định sau liên quan đến bài **${cleanTitle}**:`,
        tfStatements: [
          {
            id: `tf-${timestamp}-1`,
            statement: 'Nhận định thứ nhất phù hợp với khái niệm cơ bản của bài học.',
            isCorrect: true,
            explanation: 'Đúng theo nội dung bài giảng.',
          },
          {
            id: `tf-${timestamp}-2`,
            statement: 'Nhận định thứ hai chưa xét đầy đủ điều kiện hoặc bối cảnh áp dụng.',
            isCorrect: false,
            explanation: 'Sai, cần lưu ý điều kiện áp dụng cụ thể.',
          },
          {
            id: `tf-${timestamp}-3`,
            statement: 'Có thể vận dụng trực tiếp kiến thức bài học để giải quyết tình huống thực tế.',
            isCorrect: true,
            explanation: 'Đúng, đây là mục tiêu vận dụng của bài học.',
          },
          {
            id: `tf-${timestamp}-4`,
            statement: 'Nhận định thứ tư mâu thuẫn với kết luận đã nêu trong bài.',
            isCorrect: false,
            explanation: 'Sai so với kiến thức trọng tâm.',
          },
        ],
        detailedSolution: 'Phân tích từng nhận định dựa trên kiến thức trọng tâm của bài giảng.',
      },
    ];

    const initialSummary: LessonSummary = {
      topicTitle: cleanTitle,
      gradeLevel: selectedGrade,
      mainOverview: `Bài giảng: ${cleanTitle} (${selectedSubject} - ${selectedGrade})${cleanAuthor ? ` - GV soạn: ${cleanAuthor}` : ''}`,
      coreConcepts: [
        {
          id: `concept-${timestamp}-1`,
          term: 'Kiến thức trọng tâm',
          definition: 'Khái niệm và nội dung cốt lõi của bài học.',
          importance: 'essential',
        },
      ],
      goldenFormulas: [],
      commonPitfalls: [],
      mindmapTree: {
        id: 'root',
        label: cleanTitle,
        children: [
          { id: `node-${timestamp}-1`, label: '1. Khởi Động & Mở Đầu' },
          { id: `node-${timestamp}-2`, label: '2. Kiến Thức Trọng Tâm' },
          { id: `node-${timestamp}-3`, label: '3. Ví Dụ & Luyện Tập' },
        ],
      },
      wrapUpFlashcards: [],
    };

    const newLesson = stampNewLessonOwnership(
      {
        id: lessonId,
        title: cleanTitle,
        grade: combinedGradeDisplay,
        gradeLevel: selectedGrade,
        subject: selectedSubject,
        author: cleanAuthor || currentUser?.displayName || currentUser?.username || undefined,
        chapterOrTopic: cleanChapter,
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
          targetGrade: combinedGradeDisplay,
          teachingGoal: 'concept_mastery',
        },
      },
      currentUser || null
    );

    onCreateLesson(newLesson);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl shadow-2xl overflow-visible flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Soạn Bài Mới</span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-semibold border border-indigo-500/30">
                  Lớp 6 – Lớp 12
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Chọn khối lớp, môn học, điền tác giả soạn giảng và tên bài học để khởi tạo bài giảng
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content Form */}
        <form onSubmit={handleSubmitManual} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Row 1: 1. Chọn Khối Lớp (Lớp 6 -> Lớp 12) & 2. Chọn Môn Học (Đủ các môn Lớp 6 -> Lớp 12) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Chọn Khối Lớp (Dropdown từ Lớp 6 đến Lớp 12) */}
            <div className="relative" ref={gradeDropdownRef}>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <span>1. Chọn Khối Lớp (Lớp 6 – 12)</span>
                <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsGradeDropdownOpen((prev) => !prev);
                  setIsSubjectDropdownOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isGradeDropdownOpen
                    ? 'border-indigo-500 ring-2 ring-indigo-500/40 text-white'
                    : 'border-slate-700 hover:border-slate-600 text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold text-xs shrink-0">
                    {selectedGrade}
                  </span>
                  <span className="text-xs text-slate-300 truncate">
                    {currentGradeOption?.levelGroup === 'THCS' ? 'Cấp THCS' : 'Cấp THPT'}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isGradeDropdownOpen ? 'rotate-180 text-indigo-400' : ''
                  }`}
                />
              </button>

              {/* Danh sách lớp xuất hiện khi nhấn vào chọn lớp */}
              {isGradeDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 flex items-center justify-between">
                    <span>Danh sách Khối Lớp (Lớp 6 – Lớp 12)</span>
                    <span className="text-indigo-400">7 khối lớp</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
                    {GRADE_OPTIONS.map((gradeItem) => {
                      const isSelected = selectedGrade === gradeItem.label;
                      return (
                        <button
                          key={gradeItem.id}
                          type="button"
                          onClick={() => {
                            setSelectedGrade(gradeItem.label);
                            setIsGradeDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white font-bold shadow-sm'
                              : 'text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : gradeItem.levelGroup === 'THCS'
                                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {gradeItem.levelGroup}
                            </span>
                            <span>{gradeItem.label}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Chọn Môn Học (Dropdown đủ các môn từ Lớp 6 đến Lớp 12) */}
            <div className="relative" ref={subjectDropdownRef}>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>2. Chọn Môn Học (Lớp 6 – 12)</span>
                <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsSubjectDropdownOpen((prev) => !prev);
                  setIsGradeDropdownOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isSubjectDropdownOpen
                    ? 'border-emerald-500 ring-2 ring-emerald-500/40 text-white'
                    : 'border-slate-700 hover:border-slate-600 text-white'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-xs text-emerald-300 truncate">
                    {selectedSubject}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isSubjectDropdownOpen ? 'rotate-180 text-emerald-400' : ''
                  }`}
                />
              </button>

              {/* Danh sách môn học xuất hiện khi nhấn chọn vào Môn học */}
              {isSubjectDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2 bg-slate-950/90 border-b border-slate-800">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80">
                      <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={subjectSearchQuery}
                        onChange={(e) => setSubjectSearchQuery(e.target.value)}
                        placeholder="Tìm nhanh môn học (Toán, Văn, Anh, Lý, Hóa, Sử...)"
                        className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                      />
                      {subjectSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setSubjectSearchQuery('')}
                          className="text-[10px] text-slate-400 hover:text-white"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
                    {filteredSubjects.length > 0 ? (
                      filteredSubjects.map((subj) => {
                        const isSelected = selectedSubject === subj.name;
                        return (
                          <button
                            key={subj.id}
                            type="button"
                            onClick={() => {
                              setSelectedSubject(subj.name);
                              setIsSubjectDropdownOpen(false);
                              setSubjectSearchQuery('');
                            }}
                            className={`w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                                : 'text-slate-200 hover:bg-slate-800'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="truncate">{subj.name}</div>
                              <div
                                className={`text-[10px] truncate ${
                                  isSelected ? 'text-emerald-100' : 'text-slate-400'
                                }`}
                              >
                                {subj.gradesLabel}
                              </div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-400">
                        Không tìm thấy môn học phù hợp.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Tác Giả Soạn Giảng (Điền họ tên người soạn) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-sky-400" />
              <span>3. Tác Giả Soạn Giảng (Họ và tên người soạn)</span>
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Nhập họ và tên người soạn giảng (Ví dụ: Thầy Nguyễn Văn A / Cô Trần Thị B)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* 4. Tên Bài Giảng */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              4. Tên Bài Giảng <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Nhập tên bài giảng (Ví dụ: Bài 1: ...)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              required
            />
          </div>

          {/* 5. Chương / Chủ Đề */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              5. Chương / Chủ Đề Bài Học
            </label>
            <input
              type="text"
              value={chapterOrTopic}
              onChange={(e) => setChapterOrTopic(e.target.value)}
              placeholder={`Nhập chương hoặc chủ đề (Ví dụ: Chương I - ${selectedSubject} ${selectedGrade})`}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* 6. Cấu Trúc Khởi Tạo Khung Bài Giảng */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              6. Cấu Trúc Khởi Tạo Khung Bài Giảng
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTemplateStructure('standard')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  templateStructure === 'standard'
                    ? 'bg-indigo-950/70 border-indigo-500 ring-1 ring-indigo-500/40 text-white'
                    : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs flex items-center gap-1.5 text-indigo-300">
                    <Layers className="w-4 h-4" />
                    Khung Chuẩn Sư Phạm (3 Slides)
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
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
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
                  Bắt đầu với 1 slide tiêu đề sạch sẽ để thầy/cô tự do gõ nội dung, chèn công thức, hình ảnh và thêm các slide tùy biến từ đầu.
                </p>
              </button>
            </div>
          </div>

          {/* Tóm tắt thông tin bài soạn trước khi tạo */}
          <div className="px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400">Thiết lập:</span>
              <span className="font-semibold text-indigo-300">{selectedGrade}</span>
              <span className="text-slate-600">·</span>
              <span className="font-semibold text-emerald-300">Môn {selectedSubject}</span>
              {author.trim() && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="font-semibold text-sky-300">GV: {author.trim()}</span>
                </>
              )}
            </div>
            <span className="text-[11px] text-slate-500">
              {currentSubjectOption?.gradesLabel}
            </span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2 cursor-pointer"
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
