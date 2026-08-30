import React, { useState, useEffect, useRef } from 'react';
import {
  Columns,
  Maximize2,
  Minimize2,
  Printer,
  Sparkles,
  Layers,
  Sliders,
  SplitSquareVertical,
  Plus,
  Trash2,
  Copy,
  RotateCcw,
  CheckCircle2,
  X,
  FileText,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { MathLesson, Slide, SlideStyleConfig } from '../types';
import { SlideEditorPane } from './SlideEditorPane';
import { SlidePreviewPane } from './SlidePreviewPane';
import { DeleteSlideModal } from './DeleteSlideModal';
import { MathView } from './MathView';

interface StudioWorkspaceProps {
  lesson: MathLesson;
  onUpdateSlide: (updatedSlide: Slide) => void;
  onDeleteSlide: (slideId: string) => void;
  onAddSlide: (newSlide: Slide, insertAfterIndex?: number) => void;
}

export const StudioWorkspace: React.FC<StudioWorkspaceProps> = ({
  lesson,
  onUpdateSlide,
  onDeleteSlide,
  onAddSlide,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [splitRatio, setSplitRatio] = useState<'50-50' | '40-60' | '60-40' | 'editor-only' | 'preview-only'>('50-50');
  const [mobileActiveTab, setMobileActiveTab] = useState<'editor' | 'preview'>('editor');
  
  // Modals
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState<Slide | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Safety check on current slide
  const safeIndex = Math.min(
    Math.max(0, currentSlideIndex),
    Math.max(0, lesson.slides.length - 1)
  );
  const currentSlide = lesson.slides[safeIndex] || lesson.slides[0];

  // Adjust currentSlideIndex if slides count changes
  useEffect(() => {
    if (currentSlideIndex >= lesson.slides.length) {
      setCurrentSlideIndex(Math.max(0, lesson.slides.length - 1));
    }
  }, [lesson.slides.length, currentSlideIndex]);

  // Duplicate Slide handler
  const handleDuplicateSlide = (slide: Slide) => {
    const duplicated: Slide = {
      ...JSON.parse(JSON.stringify(slide)),
      id: `slide_${Date.now()}`,
      slideNumber: currentSlideIndex + 2,
      title: `${slide.title} (Bản sao)`,
    };
    onAddSlide(duplicated, currentSlideIndex);
    setCurrentSlideIndex(currentSlideIndex + 1);
  };

  // Delete Slide Trigger
  const handleOpenDelete = (slideId: string) => {
    const target = lesson.slides.find((s) => s.id === slideId);
    if (target) {
      setSlideToDelete(target);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = (slideId: string) => {
    onDeleteSlide(slideId);
    if (currentSlideIndex >= lesson.slides.length - 1) {
      setCurrentSlideIndex(Math.max(0, lesson.slides.length - 2));
    }
  };

  // Apply style to all slides
  const handleApplyStyleToAll = (styleConfig: SlideStyleConfig) => {
    lesson.slides.forEach((s) => {
      onUpdateSlide({
        ...s,
        styleConfig: {
          ...s.styleConfig,
          ...styleConfig,
        },
      });
    });
  };

  // Determine split widths based on splitRatio
  const getPaneWidths = () => {
    switch (splitRatio) {
      case '40-60':
        return { editor: 'lg:w-[40%]', preview: 'lg:w-[60%]' };
      case '60-40':
        return { editor: 'lg:w-[60%]', preview: 'lg:w-[40%]' };
      case 'editor-only':
        return { editor: 'w-full', preview: 'hidden' };
      case 'preview-only':
        return { editor: 'hidden', preview: 'w-full' };
      case '50-50':
      default:
        return { editor: 'lg:w-1/2', preview: 'lg:w-1/2' };
    }
  };

  const paneWidths = getPaneWidths();

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Workspace Controls Bar */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 px-4 py-2 flex items-center justify-between gap-3 backdrop-blur-xl flex-shrink-0 z-30 shadow-md">
        {/* Left: Studio Mode Title & Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Columns className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs sm:text-sm text-white">
                  Studio 2 Cửa Sổ
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hidden sm:inline tracking-wide">
                  Soạn Bên Trái • Xem Bên Phải
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Mobile Segmented Switcher (Visible on < lg screens) */}
        <div className="flex lg:hidden items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setMobileActiveTab('editor')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              mobileActiveTab === 'editor'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Soạn Slide ({currentSlideIndex + 1})</span>
          </button>
          <button
            onClick={() => setMobileActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              mobileActiveTab === 'preview'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem Trước</span>
          </button>
        </div>

        {/* Right: Split Ratio Selector & Print (Desktop) */}
        <div className="hidden lg:flex items-center gap-2.5">
          <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            Tỉ lệ cửa sổ:
          </span>

          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setSplitRatio('50-50')}
              title="Chia đều 50% - 50%"
              className={`px-2.5 py-1 rounded-lg transition-all ${
                splitRatio === '50-50'
                  ? 'bg-indigo-600 text-white shadow font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              50 : 50
            </button>

            <button
              onClick={() => setSplitRatio('40-60')}
              title="Ưu tiên Cửa sổ xem trước (40% Soạn - 60% Xem)"
              className={`px-2.5 py-1 rounded-lg transition-all ${
                splitRatio === '40-60'
                  ? 'bg-indigo-600 text-white shadow font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              40 : 60
            </button>

            <button
              onClick={() => setSplitRatio('60-40')}
              title="Ưu tiên Cửa sổ soạn bài (60% Soạn - 40% Xem)"
              className={`px-2.5 py-1 rounded-lg transition-all ${
                splitRatio === '60-40'
                  ? 'bg-indigo-600 text-white shadow font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              60 : 40
            </button>

            <button
              onClick={() => setSplitRatio('preview-only')}
              title="Chỉ hiển thị Cửa sổ xem trước"
              className={`px-2.5 py-1 rounded-lg transition-all ${
                splitRatio === 'preview-only'
                  ? 'bg-emerald-600 text-white shadow font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Chỉ Chiếu
            </button>

            <button
              onClick={() => setSplitRatio('editor-only')}
              title="Chỉ hiển thị Cửa sổ soạn bài"
              className={`px-2.5 py-1 rounded-lg transition-all ${
                splitRatio === 'editor-only'
                  ? 'bg-indigo-600 text-white shadow font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Chỉ Soạn
            </button>
          </div>

          <button
            onClick={() => setShowPrintModal(true)}
            title="In toàn bộ bài giảng / Xuất PDF"
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-slate-800 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Xuất / In Slide</span>
          </button>
        </div>
      </div>

      {/* Main 2-Window Split Container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* ================= LEFT WINDOW: CỬA SỔ SOẠN SLIDE ================= */}
        <div
          className={`h-full flex-shrink-0 overflow-hidden ${paneWidths.editor} ${
            mobileActiveTab === 'editor' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'
          }`}
        >
          {currentSlide ? (
            <SlideEditorPane
              slide={currentSlide}
              slideIndex={safeIndex}
              totalSlides={lesson.slides.length}
              allSlides={lesson.slides}
              onSelectSlide={(idx) => setCurrentSlideIndex(idx)}
              onUpdateSlide={onUpdateSlide}
              onAddSlide={(newSlide, idx) => {
                onAddSlide(newSlide, idx);
                setCurrentSlideIndex(idx !== undefined ? idx + 1 : lesson.slides.length);
              }}
              onDuplicateSlide={handleDuplicateSlide}
              onDeleteSlide={handleOpenDelete}
              onApplyStyleToAll={handleApplyStyleToAll}
            />
          ) : (
            <div className="flex items-center justify-center h-full p-6 text-slate-500">
              Không tìm thấy slide
            </div>
          )}
        </div>

        {/* Splitter Handle Bar (Desktop) */}
        {splitRatio !== 'editor-only' && splitRatio !== 'preview-only' && (
          <div className="hidden lg:flex w-2 bg-slate-900 border-x border-slate-800 hover:bg-indigo-600/50 cursor-col-resize items-center justify-center transition-colors group">
            <div className="w-0.5 h-8 bg-slate-700 group-hover:bg-white rounded-full" />
          </div>
        )}

        {/* ================= RIGHT WINDOW: CỬA SỔ XEM TRƯỚC SLIDE ================= */}
        <div
          className={`h-full flex-1 overflow-hidden ${paneWidths.preview} ${
            mobileActiveTab === 'preview' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'
          }`}
        >
          {currentSlide ? (
            <SlidePreviewPane
              slide={currentSlide}
              slideIndex={safeIndex}
              totalSlides={lesson.slides.length}
              onSelectSlide={(idx) => setCurrentSlideIndex(idx)}
              onDeleteImage={(imgId) => {
                const nextImages = (currentSlide.images || []).filter((i) => i.id !== imgId);
                onUpdateSlide({ ...currentSlide, images: nextImages });
              }}
              onOpenPrintView={() => setShowPrintModal(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full p-6 text-slate-500">
              Không có slide để xem trước
            </div>
          )}
        </div>
      </div>

      {/* Delete Slide Modal */}
      <DeleteSlideModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        slide={slideToDelete}
        totalSlides={lesson.slides.length}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* Print / Handout Export Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Printer className="w-4 h-4 text-indigo-400" />
                  Xem Trước Toàn Bộ Slide & Xuất / In Handout
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lesson.title} • {lesson.slides.length} Slide
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg"
                >
                  In Bài Giảng Ngay
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
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
                    <MathView content={s.title} />
                  </h4>
                  {s.subtitle && (
                    <p className="text-xs text-slate-400">
                      <MathView content={s.subtitle} />
                    </p>
                  )}

                  {s.keyFormula && (
                    <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-amber-300 font-mono text-center">
                      <MathView content={`$$${s.keyFormula}$$`} block />
                    </div>
                  )}

                  {s.sections?.map((sec, sIdx) => (
                    <div key={sIdx} className="space-y-1.5 text-xs text-slate-200">
                      {sec.title && <p className="font-bold text-indigo-300">{sec.title}</p>}
                      {sec.content && <MathView content={sec.content} />}
                      {sec.bulletPoints && (
                        <ul className="pl-4 list-disc space-y-1">
                          {sec.bulletPoints.map((bp, bIdx) => (
                            <li key={bIdx}>
                              <MathView content={bp} />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
