import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  BookOpen,
  Layers,
  HelpCircle,
  Sparkles,
  GraduationCap,
  FolderSync
} from 'lucide-react';
import { MathLesson } from '../types';

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
  if (!isOpen || !lesson) return null;

  const [title, setTitle] = useState(lesson.title);
  const [grade, setGrade] = useState(lesson.grade);
  const [chapterOrTopic, setChapterOrTopic] = useState(lesson.chapterOrTopic);
  const [targetGrade, setTargetGrade] = useState(lesson.config?.targetGrade || 'Toán 10 - Kết Nối Tri Thức Với Cuộc Sống');
  const [teachingGoal, setTeachingGoal] = useState<'concept_mastery' | 'exam_prep' | 'quick_review'>(
    lesson.config?.teachingGoal || 'concept_mastery'
  );

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title);
      setGrade(lesson.grade);
      setChapterOrTopic(lesson.chapterOrTopic);
      setTargetGrade(lesson.config?.targetGrade || 'Toán 10 - Kết Nối Tri Thức Với Cuộc Sống');
      setTeachingGoal(lesson.config?.teachingGoal || 'concept_mastery');
    }
  }, [lesson]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên bài giảng.');
      return;
    }

    const updated: MathLesson = {
      ...lesson,
      title: title.trim(),
      grade: grade.trim(),
      chapterOrTopic: chapterOrTopic.trim(),
      updatedAt: Date.now(),
      config: {
        ...lesson.config,
        targetGrade: targetGrade.trim(),
        teachingGoal,
      },
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Chỉnh Sửa Thông Tin Bài Giảng</h2>
              <p className="text-xs text-slate-400">Cập nhật tiêu đề, chương mục và định hướng giảng dạy</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Tên Bài Giảng <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: BÀI 1: MỆNH ĐỀ (TOÁN 10)..."
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
              placeholder="VD: Chương I: Mệnh Đề và Tập Hợp..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Grade & Textbook */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Khối Lớp / Phân Môn
              </label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="VD: Toán Lớp 10 - Đại Số & Lôgic"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Bộ Sách Giáo Khoa
              </label>
              <input
                type="text"
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                placeholder="VD: Kết Nối Tri Thức Với Cuộc Sống"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
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
                className={`p-3 rounded-2xl border text-left transition-all ${
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
                className={`p-3 rounded-2xl border text-left transition-all ${
                  teachingGoal === 'exam_prep'
                    ? 'bg-emerald-950/80 border-emerald-500 text-white ring-1 ring-emerald-500'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <span className="block text-xs font-bold">Luyện Thi & Bài Tập</span>
                <span className="text-[10px] text-slate-400">Chuyên sâu kỹ năng giải toán</span>
              </button>

              <button
                type="button"
                onClick={() => setTeachingGoal('quick_review')}
                className={`p-3 rounded-2xl border text-left transition-all ${
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
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all"
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
