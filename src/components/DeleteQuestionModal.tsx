import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Question } from '../types';

interface DeleteQuestionModalProps {
  isOpen: boolean;
  question: Question | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteQuestionModal: React.FC<DeleteQuestionModalProps> = ({
  isOpen,
  question,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !question) return null;

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
          <h3 className="text-lg font-bold text-white">Xác Nhận Xóa Câu Hỏi?</h3>
          <p className="text-xs text-slate-400 mt-1">
            Bạn có chắc chắn muốn xóa <span className="text-rose-300 font-semibold">Câu #{question.questionNumber}</span> khỏi bộ câu hỏi luyện tập?
          </p>
          <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 line-clamp-2 italic">
            "{question.prompt}"
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            Giữ Lại
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
            <span>Xác Nhận Xóa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
