import React, { useState, useEffect, useCallback } from 'react';
import { Printer, X } from 'lucide-react';
import { MathLesson, Slide, AppUser } from '../types';
import { PowerPointWorkspace } from './PowerPointWorkspace';
import { MathView } from './MathView';
import { canEditLesson } from '../utils/permissions';

interface StudioWorkspaceProps {
  lesson: MathLesson;
  currentUser?: AppUser | null;
  onPresentLesson?: () => void;
  onUpdateSlide: (updatedSlide: Slide) => void;
  onDeleteSlide: (slideId: string) => void;
  onAddSlide: (newSlide: Slide, insertAfterIndex?: number) => void;
}

export const StudioWorkspace: React.FC<StudioWorkspaceProps> = ({
  lesson,
  currentUser = null,
  onUpdateSlide,
  onDeleteSlide,
  onAddSlide,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const isReadOnly = !canEditLesson(lesson, currentUser);

  // Safety check on current slide
  const safeIndex = Math.min(
    Math.max(0, currentSlideIndex),
    Math.max(0, lesson.slides.length - 1)
  );

  // Adjust currentSlideIndex if slides count changes
  useEffect(() => {
    if (currentSlideIndex >= lesson.slides.length) {
      setCurrentSlideIndex(Math.max(0, lesson.slides.length - 1));
    }
  }, [lesson.slides.length, currentSlideIndex]);

  const handleSelectSlide = useCallback((idx: number) => {
    setCurrentSlideIndex(idx);
  }, []);

  return (
    <>
      <PowerPointWorkspace
        lesson={lesson}
        currentSlideIndex={safeIndex}
        readOnly={isReadOnly}
        currentUser={currentUser}
        onSelectSlide={handleSelectSlide}
        onUpdateSlide={(s) => {
          if (!isReadOnly) onUpdateSlide(s);
        }}
        onDeleteSlide={(id) => {
          if (!isReadOnly) onDeleteSlide(id);
        }}
        onAddSlide={(s, idx) => {
          if (!isReadOnly) onAddSlide(s, idx);
        }}
        onOpenPrintView={() => setShowPrintModal(true)}
      />

      {/* Print View Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base sm:text-lg">
                  Xem Trước & In Toàn Bộ Bài Giảng
                </h3>
                <p className="text-xs text-slate-400">
                  {lesson.title} ({lesson.slides.length} slides)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  In Bài Giảng Ngay
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-950">
              {lesson.slides.map((s, idx) => (
                <div
                  key={s.id || idx}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-mono font-bold text-indigo-400">
                      Slide {idx + 1} / {lesson.slides.length}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{s.category}</span>
                  </div>

                  <h4 className="text-lg font-bold text-white">
                    <MathView content={s.title || ''} text={s.title || ''} as="span" />
                  </h4>
                  {s.subtitle && (
                    <div className="text-xs text-slate-400">
                      <MathView content={s.subtitle} text={s.subtitle} />
                    </div>
                  )}

                  {s.keyFormula && (
                    <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-amber-300 font-mono text-center">
                      <MathView content={`$$${s.keyFormula}$$`} text={`$$${s.keyFormula}$$`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
