import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  BookOpen,
  Layers,
  HelpCircle,
  GraduationCap,
  User,
  ChevronDown,
  Search,
  Check,
  AlertCircle
} from 'lucide-react';
import { MathLesson } from '../types';
import {
  GRADE_OPTIONS,
  SUBJECT_OPTIONS,
  extractLessonGradeLabel,
  extractLessonSubjectLabel
} from '../constants/curriculum';

interface EditLessonModalProps {
  isOpen: boolean;
  lesson: MathLesson | null;
  onClose: () => void;
  onSave: (updatedLesson: MathLesson) => void;
}

export const EditLessonModal: React.FC<EditLessonModalProps> = ({
  isOpen,
  lesson,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('Lớp 10');
  const [selectedSubject, setSelectedSubject] = useState('Toán học');
  const [author, setAuthor] = useState('');
  const [chapterOrTopic, setChapterOrTopic] = useState('');
  const [teachingGoal, setTeachingGoal] = useState<'concept_mastery' | 'exam_prep' | 'quick_review'>('concept_mastery');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isGradeDropdownOpen, setIsGradeDropdownOpen] = useState(false);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [subjectSearchQuery, setSubjectSearchQuery] = useState('');

  const gradeDropdownRef = useRef<HTMLDivElement>(null);
  const subjectDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title || '');
      const extractedGrade = extractLessonGradeLabel(lesson);
      setSelectedGrade(
        GRADE_OPTIONS.some((g) => g.label === extractedGrade) ? extractedGrade : 'Lớp 10'
      );
      const extractedSubj = extractLessonSubjectLabel(lesson);
      setSelectedSubject(extractedSubj || 'Toán học');
      setAuthor(lesson.author || '');
      setChapterOrTopic(lesson.chapterOrTopic || '');
      const goal = lesson.config?.teachingGoal;
      if (goal === 'exam_prep' || goal === 'quick_review' || goal === 'concept_mastery') {
        setTeachingGoal(goal);
      } else {
        setTeachingGoal('concept_mastery');
      }
      setErrorMsg(null);
    }
  }, [lesson]);

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

  if (!isOpen || !lesson) return null;

  const filteredSubjects = SUBJECT_OPTIONS.filter((subj) => {
    const q = subjectSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      subj.name.toLowerCase().includes(q) ||
      subj.gradesLabel.toLowerCase().includes(q) ||
      subj.category.toLowerCase().includes(q)
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tên bài giảng.');
      return;
    }

    const combinedGrade = `${selectedSubject} - ${selectedGrade}`;
    const updated: MathLesson = {
      ...lesson,
      title: title.trim(),
      grade: combinedGrade,
      gradeLevel: selectedGrade,
      subject: selectedSubject,
      author: author.trim() || undefined,
      chapterOrTopic: chapterOrTopic.trim(),
      updatedAt: Date.now(),
      config: {
        ...lesson.config,
        targetGrade: combinedGrade,
        teachingGoal,
      },
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-xl shadow-2xl overflow-visible flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Chỉnh Sửa Thông Tin Bài Giảng</h2>
              <p className="text-xs text-slate-400">
                Cập nhật khối lớp, môn học, tác giả soạn giảng và tiêu đề bài học
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Khối Lớp & Môn Học */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Chọn Khối Lớp */}
            <div className="relative" ref={gradeDropdownRef}>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Khối Lớp (Lớp 6 – 12)</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsGradeDropdownOpen((prev) => !prev);
                  setIsSubjectDropdownOpen(false);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 text-left text-xs text-white flex items-center justify-between cursor-pointer"
              >
                <span className="font-bold text-indigo-300">{selectedGrade}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    isGradeDropdownOpen ? 'rotate-180 text-indigo-400' : ''
                  }`}
                />
              </button>

              {isGradeDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="max-h-56 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
                    {GRADE_OPTIONS.map((g) => {
                      const isSelected = selectedGrade === g.label;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => {
                            setSelectedGrade(g.label);
                            setIsGradeDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          <span>
                            {g.label} ({g.levelGroup})
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Chọn Môn Học */}
            <div className="relative" ref={subjectDropdownRef}>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>Môn Học (Lớp 6 – 12)</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsSubjectDropdownOpen((prev) => !prev);
                  setIsGradeDropdownOpen(false);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 text-left text-xs text-white flex items-center justify-between cursor-pointer"
              >
                <span className="font-bold text-emerald-300 truncate">{selectedSubject}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                    isSubjectDropdownOpen ? 'rotate-180 text-emerald-400' : ''
                  }`}
                />
              </button>

              {isSubjectDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-2 bg-slate-950 border-b border-slate-800">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700">
                      <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={subjectSearchQuery}
                        onChange={(e) => setSubjectSearchQuery(e.target.value)}
                        placeholder="Tìm môn học..."
                        className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="max-h-56 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
                    {filteredSubjects.map((s) => {
                      const isSelected = selectedSubject === s.name;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setSelectedSubject(s.name);
                            setIsSubjectDropdownOpen(false);
                            setSubjectSearchQuery('');
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white font-bold'
                              : 'text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="truncate">{s.name}</div>
                            <div className="text-[10px] opacity-75">{s.gradesLabel}</div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tác giả soạn giảng */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span>Tác Giả Soạn Giảng (Họ và tên người soạn)</span>
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Nhập họ và tên người soạn giảng..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Tên Bài Giảng <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Nhập tên bài giảng..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold"
              required
            />
          </div>

          {/* Chapter / Topic */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Chương / Chủ Đề Kiến Thức
            </label>
            <input
              type="text"
              value={chapterOrTopic}
              onChange={(e) => setChapterOrTopic(e.target.value)}
              placeholder="Nhập chương hoặc chủ đề..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Teaching Goal */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Định Hướng Mục Tiêu Dạy Học
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setTeachingGoal('concept_mastery')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  teachingGoal === 'concept_mastery'
                    ? 'bg-indigo-950/80 border-indigo-500 text-white ring-1 ring-indigo-500'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <span className="block text-xs font-bold">Nắm Vững Khái Niệm</span>
                <span className="text-[10px] text-slate-400">Hình thành lý thuyết & ví dụ</span>
              </button>

              <button
                type="button"
                onClick={() => setTeachingGoal('exam_prep')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  teachingGoal === 'exam_prep'
                    ? 'bg-emerald-950/80 border-emerald-500 text-white ring-1 ring-emerald-500'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <span className="block text-xs font-bold">Luyện Thi & Bài Tập</span>
                <span className="text-[10px] text-slate-400">Chuyên sâu kỹ năng giải bài</span>
              </button>

              <button
                type="button"
                onClick={() => setTeachingGoal('quick_review')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  teachingGoal === 'quick_review'
                    ? 'bg-amber-950/80 border-amber-500 text-white ring-1 ring-amber-500'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <span className="block text-xs font-bold">Ôn Tập Cấp Tốc</span>
                <span className="text-[10px] text-slate-400">Tóm tắt sơ đồ tư duy</span>
              </button>
            </div>
          </div>

          {/* Quick Stats overview */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>{lesson.slides.length} Slide trình chiếu</span>
            </span>
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>{lesson.questions.length} Câu hỏi luyện tập</span>
            </span>
            <span className="text-slate-500">
              Cập nhật: {new Date(lesson.updatedAt || lesson.createdAt).toLocaleDateString('vi-VN')}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Thông Tin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
