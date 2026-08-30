import React from 'react';
import { AlertTriangle, Trash2, X, Layers, HelpCircle } from 'lucide-react';
import { MathLesson } from '../types';

interface DeleteLessonModalProps {
  isOpen: boolean;
  lesson: MathLesson | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteLessonModal: React.FC<DeleteLessonModalProps> = ({
  isOpen,
  lesson,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !lesson) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold text-white">Xác Nhận Xóa Bài Giảng?</h3>
          <p className="text-xs text-slate-400 mt-1">
            Hành động này sẽ xóa toàn bộ nội dung bài giảng, slide và bộ câu hỏi đi kèm.
          </p>
          <div className="mt-3 p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-sm text-white">{lesson.title}</h4>
            <p className="text-xs text-slate-400">{lesson.chapterOrTopic} • {lesson.grade}</p>
            <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                {lesson.slides.length} slides
              </span>
              <span className="flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                {lesson.questions.length} câu hỏi
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa Vĩnh Viễn</span>
          </button>
        </div>
      </div>
    </div>
  );
};
