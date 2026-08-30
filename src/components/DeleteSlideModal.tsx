import React from 'react';
import { AlertTriangle, Trash2, X, RefreshCw } from 'lucide-react';
import { Slide } from '../types';

interface DeleteSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  slide: Slide | null;
  totalSlides: number;
  onConfirmDelete: (slideId: string) => void;
}

export const DeleteSlideModal: React.FC<DeleteSlideModalProps> = ({
  isOpen,
  onClose,
  slide,
  totalSlides,
  onConfirmDelete,
}) => {
  if (!isOpen || !slide) return null;

  const isOnlySlide = totalSlides <= 1;

  const handleDelete = () => {
    onConfirmDelete(slide.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-rose-500/40 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Warning Banner */}
        <div className="p-6 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center shadow-lg shadow-rose-500/10">
            <Trash2 className="w-7 h-7" />
          </div>

          <h3 className="text-xl font-bold text-white">Xác Nhận Xóa Slide</h3>

          <p className="text-sm text-slate-300 leading-relaxed">
            Bạn có chắc chắn muốn xóa{' '}
            <span className="font-bold text-rose-300">
              Slide {slide.slideNumber}: "{slide.title}"
            </span>{' '}
            khỏi bài giảng không?
          </p>

          {isOnlySlide ? (
            <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5 text-left">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
              <span>
                Đây là slide duy nhất trong bài giảng. Sau khi xóa, hệ thống sẽ tự động làm mới về <strong>1 slide trắng mặc định</strong> để bạn bắt đầu soạn lại.
              </span>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 text-xs text-left">
              💡 Sau khi xóa, các slide phía sau sẽ được tự động đánh lại số thứ tự từ 1 đến {totalSlides - 1}.
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition-colors"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
          >
            {isOnlySlide ? (
              <>
                <RefreshCw className="w-4 h-4" />
                Xóa & Làm Mới Slide
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Xóa Slide Này
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

