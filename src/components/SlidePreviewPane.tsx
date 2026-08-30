import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  PenTool,
  Eraser,
  MessageSquare,
  Sparkles,
  RotateCcw,
  Clock,
  Printer,
  ZoomIn,
  Trash2,
  X,
  BookOpen,
  HelpCircle,
  Eye,
  CheckCircle2,
  Layers,
  Target,
  Compass,
  AlertTriangle,
  Bookmark,
  Lightbulb,
  Dumbbell,
  Globe2,
  CornerDownRight,
  HelpCircle as QuestionIcon,
  Check,
  ChevronDown,
  ChevronUp,
  Tv,
  ZoomOut,
  MousePointer,
  Radio,
  Sliders,
  Move,
  FileText,
  Image as ImageIcon,
  Film
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Slide, SlideImage, SlideStyleConfig, SlideContentBlock } from '../types';
import { BLOCK_TYPES_META, getSlideBlocks } from '../utils/slideBlocks';
import { MathView } from './MathView';
import { SlideTransitionToolbar } from './SlideTransitionToolbar';
import {
  getSlideVariants,
  getElementVariants,
  getBlockVariants,
  TRANSITION_PRESETS
} from '../utils/slideTransitions';

interface SlidePreviewPaneProps {
  slide: Slide;
  slideIndex: number;
  totalSlides: number;
  onSelectSlide: (index: number) => void;
  onDeleteImage?: (imageId: string) => void;
  onOpenPrintView?: () => void;
  onUpdateSlide?: (updatedSlide: Slide) => void;
  onApplyStyleToAll?: (styleConfig: SlideStyleConfig) => void;
}

export const SlidePreviewPane: React.FC<SlidePreviewPaneProps> = ({
  slide,
  slideIndex,
  totalSlides,
  onSelectSlide,
  onDeleteImage,
  onOpenPrintView,
  onUpdateSlide,
  onApplyStyleToAll,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isLaserMode, setIsLaserMode] = useState(false);
  const [laserPos, setLaserPos] = useState<{ x: number; y: number } | null>(null);
  const [activePenColor, setActivePenColor] = useState<string>('#ef4444');
  const [showTeacherGuide, setShowTeacherGuide] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<{ url: string; caption?: string; alt?: string } | null>(null);

  // PowerPoint Transitions & Animations state
  const [showTransitionsPanel, setShowTransitionsPanel] = useState(false);
  const [slideDirection, setSlideDirection] = useState<number>(1);
  const [previewKey, setPreviewKey] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState<number>(0); // 0 = off, 5, 10, 15, 30
  const [autoPlayProgress, setAutoPlayProgress] = useState<number>(0);

  // PowerPoint Click-to-Advance Step-by-Step Block Reveal Mode
  const [isClickToRevealMode, setIsClickToRevealMode] = useState<boolean>(true);
  const [revealedBlockCount, setRevealedBlockCount] = useState<number>(1);

  // TV 55-inch Presentation Mode font scale multiplier: 100, 125, 150 (Default TV), 175, 200
  const [tvScale, setTvScale] = useState<number>(125);
  const [isTvHighContrast, setIsTvHighContrast] = useState(true);

  // Step-by-step reveals for Examples: key = `${blockId}` -> currentStep
  const [revealedExampleSteps, setRevealedExampleSteps] = useState<{ [key: string]: number }>({});
  // Practice hints & solutions toggles: key = `${blockId}_hint` | `${blockId}_sol`
  const [practiceToggles, setPracticeToggles] = useState<{ [key: string]: boolean }>({});
  // Application solutions toggle: key = `${blockId}_sol`
  const [appToggles, setAppToggles] = useState<{ [key: string]: boolean }>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const prevIndexRef = useRef<number>(slideIndex);

  const styleConfig = slide?.styleConfig || {};
  const transitionEffect = styleConfig.transitionEffect || 'slide_horizontal';
  const transitionDuration = styleConfig.transitionDuration || 0.45;
  const elementAnimation = styleConfig.elementAnimation || 'stagger';

  const fontClass =
    styleConfig.fontFamily === 'serif'
      ? 'font-slide-serif'
      : styleConfig.fontFamily === 'mono'
      ? 'font-slide-mono'
      : styleConfig.fontFamily === 'display'
      ? 'font-slide-display'
      : styleConfig.fontFamily === 'handwriting'
      ? 'font-slide-handwriting'
      : 'font-slide-sans';

  const titleColor = styleConfig.titleColor || '#ffffff';
  const subtitleColor = styleConfig.subtitleColor || '#93c5fd';
  const textColor = styleConfig.textColor || '#f8fafc';

  // Get blocks on current slide
  const blocks = getSlideBlocks(slide);

  // Track slide navigation direction & reset block reveal count
  useEffect(() => {
    if (slideIndex > prevIndexRef.current) {
      setSlideDirection(1);
      setRevealedBlockCount(1);
    } else if (slideIndex < prevIndexRef.current) {
      setSlideDirection(-1);
      const currBlocks = getSlideBlocks(slide);
      setRevealedBlockCount(currBlocks.length || 1);
    }
    prevIndexRef.current = slideIndex;
    clearCanvas();
  }, [slideIndex, slide]);

  // Advance step (next block or next slide)
  const handleAdvanceStep = () => {
    if (isDrawingMode) return;
    if (zoomedImage) return;

    if (isClickToRevealMode && blocks.length > 0 && revealedBlockCount < blocks.length) {
      // Reveal next block on current slide
      setRevealedBlockCount((prev) => Math.min(blocks.length, prev + 1));
    } else {
      // Advance to next slide
      if (slideIndex < totalSlides - 1) {
        setSlideDirection(1);
        onSelectSlide(slideIndex + 1);
        setRevealedBlockCount(1);
      }
    }
  };

  // Previous step (previous block or previous slide)
  const handlePreviousStep = () => {
    if (isDrawingMode) return;
    if (zoomedImage) return;

    if (isClickToRevealMode && blocks.length > 0 && revealedBlockCount > 1) {
      // Step back 1 block on current slide
      setRevealedBlockCount((prev) => Math.max(1, prev - 1));
    } else {
      // Go back to previous slide
      if (slideIndex > 0) {
        setSlideDirection(-1);
        onSelectSlide(slideIndex - 1);
      }
    }
  };

  // Reveal all blocks on current slide immediately
  const handleRevealAllBlocks = () => {
    setRevealedBlockCount(blocks.length);
  };

  // Reset block progress on current slide
  const handleResetBlockProgress = () => {
    setRevealedBlockCount(1);
    setPreviewKey((k) => k + 1);
  };

  // Slideshow Auto-Play countdown timer
  useEffect(() => {
    if (!isAutoPlaying || autoPlayInterval <= 0) {
      setAutoPlayProgress(0);
      return;
    }

    const intervalMs = autoPlayInterval * 1000;
    const tickMs = 100;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += tickMs;
      const progress = Math.min(100, (elapsed / intervalMs) * 100);
      setAutoPlayProgress(progress);

      if (elapsed >= intervalMs) {
        elapsed = 0;
        setAutoPlayProgress(0);

        if (isClickToRevealMode && blocks.length > 0 && revealedBlockCount < blocks.length) {
          setRevealedBlockCount((prev) => Math.min(blocks.length, prev + 1));
        } else {
          if (slideIndex < totalSlides - 1) {
            setSlideDirection(1);
            onSelectSlide(slideIndex + 1);
            setRevealedBlockCount(1);
          } else {
            // Loop to beginning of lesson
            setSlideDirection(1);
            onSelectSlide(0);
            setRevealedBlockCount(1);
          }
        }
      }
    }, tickMs);

    return () => clearInterval(timer);
  }, [isAutoPlaying, autoPlayInterval, slideIndex, totalSlides, onSelectSlide, isClickToRevealMode, blocks.length, revealedBlockCount]);

  const handleToggleAutoPlay = (seconds: number) => {
    if (seconds <= 0) {
      setIsAutoPlaying(false);
      setAutoPlayInterval(0);
      setAutoPlayProgress(0);
    } else {
      setAutoPlayInterval(seconds);
      setIsAutoPlaying(true);
      setAutoPlayProgress(0);
    }
  };

  const handleUpdateCurrentStyle = (updates: Partial<SlideStyleConfig>) => {
    if (onUpdateSlide) {
      onUpdateSlide({
        ...slide,
        styleConfig: {
          ...styleConfig,
          ...updates,
        },
      });
    }
  };

  const handleApplyStyleToAllSlides = (updates: Partial<SlideStyleConfig>) => {
    if (onApplyStyleToAll) {
      onApplyStyleToAll(updates);
    }
  };

  const handlePreviewTransition = () => {
    setPreviewKey((k) => k + 1);
  };

  // Handle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
      if (tvScale < 125) setTvScale(150);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const inFull = !!document.fullscreenElement;
      setIsFullscreen(inFull);
      if (inFull && tvScale < 125) setTvScale(150);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [tvScale]);

  // Keyboard navigation & shortcuts during presentation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (zoomedImage) {
        if (e.key === 'Escape') setZoomedImage(null);
        return;
      }

      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'l' || e.key === 'L') {
        setIsLaserMode((prev) => !prev);
        setIsDrawingMode(false);
      } else if (e.key === 'p' || e.key === 'P') {
        setIsDrawingMode((prev) => !prev);
        setIsLaserMode(false);
      } else if (
        e.key === 'ArrowRight' ||
        e.key === 'Enter' ||
        e.key === ' ' ||
        e.key === 'PageDown'
      ) {
        e.preventDefault();
        handleAdvanceStep();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePreviousStep();
      } else if (e.key === '+' || e.key === '=') {
        setTvScale((prev) => Math.min(200, prev + 25));
      } else if (e.key === '-' || e.key === '_') {
        setTvScale((prev) => Math.max(100, prev - 25));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, slideIndex, totalSlides, zoomedImage, isClickToRevealMode, blocks.length, revealedBlockCount, isDrawingMode]);

  // Canvas resize logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const updateCanvasSize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [isFullscreen, slideIndex, tvScale]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    isDrawing.current = true;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = activePenColor;
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isLaserMode) {
      const rect = e.currentTarget.getBoundingClientRect();
      setLaserPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    if (!isDrawing.current || !isDrawingMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  // Example step handler
  const getExampleStep = (key: string, defaultStep: number = 1) => {
    return revealedExampleSteps[key] !== undefined ? revealedExampleSteps[key] : defaultStep;
  };

  const handleRevealNextStep = (key: string) => {
    setRevealedExampleSteps((prev) => ({
      ...prev,
      [key]: (prev[key] || 1) + 1,
    }));
  };

  const handleResetExampleStep = (key: string) => {
    setRevealedExampleSteps((prev) => ({
      ...prev,
      [key]: 1,
    }));
  };

  // Practice toggles
  const togglePracticeHint = (key: string) => {
    setPracticeToggles((prev) => ({
      ...prev,
      [`${key}_hint`]: !prev[`${key}_hint`],
    }));
  };

  const togglePracticeSolution = (key: string) => {
    setPracticeToggles((prev) => ({
      ...prev,
      [`${key}_sol`]: !prev[`${key}_sol`],
    }));
  };

  // Application toggles
  const toggleAppSolution = (key: string) => {
    setAppToggles((prev) => ({
      ...prev,
      [`${key}_sol`]: !prev[`${key}_sol`],
    }));
  };

  const slideVariants = getSlideVariants(transitionEffect, slideDirection, transitionDuration);
  const activePreset = TRANSITION_PRESETS.find((p) => p.id === transitionEffect);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden select-none ${
        isFullscreen ? 'fixed inset-0 z-50 p-4 sm:p-6' : ''
      }`}
    >
      {/* 1. TOP TOOLBAR: TV 55-INCH SCALING, DRAWING, FULLSCREEN */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-2 flex-wrap shrink-0 backdrop-blur-md z-30 shadow-md">
        {/* Left: TV 55-Inch Ready Tag & Scaling */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-xs font-black shadow-inner">
            <Tv className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Chuẩn TV 55"</span>
            <span className="text-white font-mono">{tvScale}%</span>
          </div>

          <div className="flex items-center bg-slate-950 rounded-xl p-0.5 border border-slate-800">
            <button
              onClick={() => setTvScale((prev) => Math.max(100, prev - 25))}
              title="Giảm cỡ chữ & hiển thị (-)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTvScale(125)}
              title="Đặt lại mức chuẩn 125%"
              className="px-2 py-1 text-[11px] font-bold text-slate-300 hover:text-white"
            >
              125%
            </button>
            <button
              onClick={() => setTvScale((prev) => Math.min(200, prev + 25))}
              title="Tăng cỡ chữ & hiển thị (+)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Slide Indicator & PowerPoint Transition Button */}
        <div className="flex items-center gap-2">
          <div className="text-xs font-black text-slate-300 flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              Slide {slideIndex + 1} / {totalSlides}
            </span>
          </div>

          {/* POWERPOINT TRANSITION BUTTON */}
          <button
            onClick={() => setShowTransitionsPanel(!showTransitionsPanel)}
            title="Tùy chỉnh hiệu ứng chuyển slide PowerPoint & hoạt họa các khối"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              showTransitionsPanel
                ? 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400'
                : 'bg-slate-800 text-indigo-300 hover:bg-slate-700 hover:text-white border border-indigo-500/30'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">Hiệu Ứng PowerPoint</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-950/70 text-indigo-200 border border-indigo-500/30">
              {activePreset?.icon} {activePreset?.shortLabel || 'Trượt'}
            </span>
          </button>

          {/* CLICK TO REVEAL MODE TOGGLE */}
          <button
            onClick={() => setIsClickToRevealMode((prev) => !prev)}
            title="Bật/Tắt chế độ chạy hiệu ứng từng khối theo click chuột / phím Enter / phím mũi tên"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              isClickToRevealMode
                ? 'bg-pink-950/80 border border-pink-500/60 text-pink-300 ring-1 ring-pink-500/40 shadow-pink-950/50'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden lg:inline">Chiếu Từng Khối:</span>
            <span>{isClickToRevealMode ? 'BẬT' : 'TẮT'}</span>
          </button>
        </div>

        {/* Right: Interactive Presenter Tools */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Laser Pointer */}
          <button
            onClick={() => {
              setIsLaserMode(!isLaserMode);
              if (!isLaserMode) setIsDrawingMode(false);
            }}
            title="Đèn Laser chỉ điểm (Phím L)"
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
              isLaserMode
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 ring-2 ring-rose-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden md:inline">Laser</span>
          </button>

          {/* Pen Tool */}
          <button
            onClick={() => {
              setIsDrawingMode(!isDrawingMode);
              if (!isDrawingMode) setIsLaserMode(false);
            }}
            title="Bút vẽ & Chú thích trực tiếp (Phím P)"
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
              isDrawingMode
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40 ring-2 ring-emerald-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Bút Vẽ</span>
          </button>

          {isDrawingMode && (
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#ffffff'].map((color) => (
                <button
                  key={color}
                  onClick={() => setActivePenColor(color)}
                  className={`w-3.5 h-3.5 rounded-full border border-white/40 ${
                    activePenColor === color ? 'ring-2 ring-white scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <button
                onClick={clearCanvas}
                title="Xóa toàn bộ nét vẽ"
                className="p-1 text-slate-400 hover:text-white"
              >
                <Eraser className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Thu nhỏ (Esc)' : 'Trình chiếu toàn màn hình (Phím F)'}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all flex items-center gap-1 text-xs font-bold"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Thu nhỏ' : 'Toàn Màn Hình'}</span>
          </button>
        </div>
      </div>

      {/* Auto-Play Progress Countdown Indicator */}
      {isAutoPlaying && (
        <div className="w-full bg-slate-950 h-1 overflow-hidden shrink-0">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 transition-all duration-100 ease-linear"
            style={{ width: `${autoPlayProgress}%` }}
          />
        </div>
      )}

      {/* 2. SLIDE DISPLAY CANVAS (SCROLLABLE & ZOOMABLE) */}
      <div
        className={`relative flex-1 overflow-y-auto ${
          isFullscreen ? 'p-2 sm:p-4 lg:p-6' : 'p-3 sm:p-5 lg:p-6'
        } custom-scrollbar overflow-x-hidden flex flex-col justify-between items-center ${
          !isDrawingMode && !isLaserMode ? 'cursor-pointer' : ''
        }`}
        onClick={(e) => {
          if (isDrawingMode || isLaserMode) return;
          const target = e.target as HTMLElement | null;
          if (!target) return;
          if (
            target.closest('button') ||
            target.closest('input') ||
            target.closest('textarea') ||
            target.closest('select') ||
            target.closest('a') ||
            target.closest('.no-slide-advance') ||
            target.closest('.interactive-control')
          ) {
            return;
          }
          handleAdvanceStep();
        }}
        onMouseMove={(e) => {
          if (isLaserMode) {
            const rect = e.currentTarget.getBoundingClientRect();
            setLaserPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }
        }}
        onMouseLeave={() => setLaserPos(null)}
      >
        {/* PowerPoint Transition Ribbon Panel */}
        <SlideTransitionToolbar
          currentSlide={slide}
          slideIndex={slideIndex}
          totalSlides={totalSlides}
          isOpen={showTransitionsPanel}
          onClose={() => setShowTransitionsPanel(false)}
          onUpdateStyle={handleUpdateCurrentStyle}
          onApplyToAllSlides={handleApplyStyleToAllSlides}
          onPreviewTransition={handlePreviewTransition}
          isAutoPlaying={isAutoPlaying}
          autoPlayInterval={autoPlayInterval}
          onToggleAutoPlay={handleToggleAutoPlay}
          onUpdateSlide={onUpdateSlide}
        />

        {/* Drawing Overlay Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className={`absolute inset-0 z-20 pointer-events-${isDrawingMode ? 'auto' : 'none'}`}
          style={{ width: '100%', height: '100%' }}
        />

        {/* Laser Pointer Dot */}
        {isLaserMode && laserPos && (
          <div
            className="absolute z-30 pointer-events-none w-5 h-5 rounded-full bg-rose-500 border-2 border-white shadow-[0_0_20px_#f43f5e] animate-pulse -translate-x-1/2 -translate-y-1/2"
            style={{ left: laserPos.x, top: laserPos.y }}
          />
        )}

        {/* POWERPOINT ANIMATED SLIDE CONTAINER (OCCUPIES ~90% OF SCREEN) */}
        <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.div
            key={`${slide.id || slideIndex}_${previewKey}`}
            custom={slideDirection}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`relative z-10 w-[94%] sm:w-[92%] lg:w-[90%] xl:w-[90%] max-w-[94vw] mx-auto min-h-[82vh] sm:min-h-[86vh] rounded-3xl p-6 sm:p-10 lg:p-12 space-y-8 bg-slate-900/60 border border-slate-800/80 shadow-2xl backdrop-blur-xl transition-all ${fontClass}`}
            style={{
              backgroundColor: styleConfig.backgroundColor || undefined,
              transform: `scale(${tvScale / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
          >
          {/* ============================================================= */}
          {/* EMPTY SLIDE STATE (KHI SLIDE TRỐNG CHƯA CÓ KHỐI NÀO)          */}
          {/* ============================================================= */}
          {blocks.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center rounded-3xl bg-slate-900/60 border-2 border-dashed border-slate-800 space-y-4 my-8 shadow-2xl backdrop-blur-sm">
              <div className="w-20 h-20 rounded-3xl bg-indigo-950/80 border-2 border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-2xl">
                <Sparkles className="w-10 h-10 animate-pulse text-indigo-300" />
              </div>

              <div className="space-y-2 max-w-lg">
                <h3 className="text-xl sm:text-2xl font-black text-white">Slide Này Đang Trống</h3>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal">
                  Chưa có khối nội dung nào được thêm vào slide này. Hãy sử dụng bảng điều khiển bên trái để
                  thêm các khối: Tiêu đề bài học, Chèn ảnh minh họa, Ghi nhớ SGK, Ví dụ giải từng bước...
                </p>
              </div>

              <div className="pt-2 text-xs font-bold text-indigo-400 bg-indigo-950/50 px-4 py-2 rounded-2xl border border-indigo-500/30">
                ✨ Mẹo: Bạn có thể thêm nhiều khối và kéo thả sắp xếp tùy thích!
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* RENDER MODULAR BLOCKS IN EXACT ORDER                          */}
          {/* ============================================================= */}
          {blocks.length > 0 && (
            <div className="space-y-6" style={{ color: textColor }}>
              {blocks.map((block, bIdx) => {
                // If in click-to-reveal mode, only show blocks up to revealed count
                const isVisible = !isClickToRevealMode || bIdx < revealedBlockCount;
                if (!isVisible) return null;

                const blockVariants = getBlockVariants(
                  block.animation,
                  elementAnimation,
                  bIdx,
                  block.animationDelay,
                  block.animationDuration
                );

                const renderBlockItem = () => {
                  // -------------------------------------------------------------
                  // 1. KHỐI HÌNH ẢNH (IMAGE BLOCK)
                  // -------------------------------------------------------------
                if (block.type === 'image') {
                  const widthPercent = block.imageWidthPercent || 50;
                  const position = block.imagePosition || 'center';

                  const posClass =
                    position === 'left'
                      ? 'justify-start'
                      : position === 'right'
                      ? 'justify-end'
                      : position === 'full'
                      ? 'justify-center w-full'
                      : 'justify-center';

                  return (
                    <div key={block.id || bIdx} className={`flex ${posClass} w-full my-4`}>
                      <div
                        className="group relative rounded-3xl overflow-hidden border-2 border-slate-700 bg-slate-950/90 p-3 shadow-2xl transition-transform hover:border-pink-500/50"
                        style={{
                          width: position === 'full' ? '100%' : `${widthPercent}%`,
                          minWidth: '240px',
                        }}
                      >
                        {block.imageUrl ? (
                          <div className="relative">
                            <img
                              src={block.imageUrl}
                              alt={block.imageAlt || block.imageCaption || 'Hình ảnh toán học'}
                              onClick={() =>
                                setZoomedImage({
                                  url: block.imageUrl!,
                                  caption: block.imageCaption,
                                  alt: block.imageAlt,
                                })
                              }
                              className="w-full h-auto max-h-[480px] object-contain rounded-2xl cursor-zoom-in bg-slate-900"
                            />
                            <button
                              onClick={() =>
                                setZoomedImage({
                                  url: block.imageUrl!,
                                  caption: block.imageCaption,
                                  alt: block.imageAlt,
                                })
                              }
                              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl bg-slate-950/80 hover:bg-pink-600 text-white shadow-lg"
                              title="Phóng to hình ảnh"
                            >
                              <ZoomIn className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="py-12 flex flex-col items-center justify-center text-slate-500 space-y-2 border border-dashed border-slate-800 rounded-2xl">
                            <ImageIcon className="w-10 h-10 text-slate-600" />
                            <span className="text-xs font-semibold">Chưa chọn hình ảnh</span>
                          </div>
                        )}

                        {block.imageCaption && (
                          <div className="mt-2.5 text-center text-xs sm:text-sm text-slate-200 font-semibold px-2">
                            <MathView content={block.imageCaption} inline />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                // -------------------------------------------------------------
                // 2. KHỐI TIÊU ĐỀ BÀI HỌC (LESSON TITLE)
                // -------------------------------------------------------------
                if (block.type === 'lesson_title') {
                  return (
                    <div
                      key={block.id || bIdx}
                      className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 border-2 border-indigo-500/50 shadow-2xl space-y-3"
                    >
                      <div
                        className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight"
                        style={{ color: titleColor }}
                      >
                        <MathView content={block.title || slide.title || 'Tiêu Đề Bài Học'} inline />
                      </div>

                      {(block.subtitle || slide.subtitle) && (
                        <div
                          className="text-sm sm:text-base lg:text-lg font-medium leading-relaxed"
                          style={{ color: subtitleColor }}
                        >
                          <MathView content={block.subtitle || slide.subtitle || ''} />
                        </div>
                      )}

                      {block.keyFormula && (
                        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border-2 border-amber-500/40 text-amber-300 text-center font-mono text-xl sm:text-2xl font-extrabold shadow-inner mt-2">
                          <MathView content={`$$${block.keyFormula}$$`} block />
                        </div>
                      )}
                    </div>
                  );
                }

                // -------------------------------------------------------------
                // 3. KHỐI MỤC TIÊU BÀI HỌC (OBJECTIVES)
                // -------------------------------------------------------------
                if (block.type === 'objectives') {
                  return (
                    <div
                      key={block.id || bIdx}
                      className="p-5 sm:p-6 rounded-3xl bg-indigo-950/40 border-2 border-indigo-500/40 shadow-xl space-y-3"
                    >
                      <div className="flex items-center gap-2 text-sm sm:text-base font-black uppercase text-indigo-300">
                        <Target className="w-5 h-5 text-emerald-400" />
                        <span>
                          <MathView content={block.title || 'Mục Tiêu Bài Học'} inline />
                        </span>
                      </div>

                      {block.items && block.items.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm sm:text-base text-slate-100 font-medium">
                          {block.items.map((it, itIdx) => (
                            <div key={itIdx} className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                              <span>
                                <MathView content={it} inline />
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {block.content && (
                        <div className="text-sm text-slate-200 pt-1">
                          <MathView content={block.content} />
                        </div>
                      )}
                    </div>
                  );
                }

                // -------------------------------------------------------------
                // 4. KHỐI TÌNH HUỐNG MỞ ĐẦU / KHỞI ĐỘNG (OPENING PROBLEM)
                // -------------------------------------------------------------
                if (block.type === 'opening_problem') {
                  return (
                    <div
                      key={block.id || bIdx}
                      className="p-5 sm:p-6 rounded-3xl bg-amber-950/30 border-2 border-amber-500/40 shadow-xl space-y-3"
                    >
                      <div className="flex items-center gap-2.5 font-black text-sm sm:text-base text-amber-300 uppercase">
                        <Compass className="w-5 h-5 text-amber-400 flex-shrink-0" />
                        <span>
                          <MathView content={block.title || 'Tình Huống Mở Đầu'} inline />
                        </span>
                      </div>

                      {(block.context || block.description) && (
                        <div className="text-sm sm:text-base text-slate-100 font-normal leading-relaxed">
                          <MathView content={block.context || block.description || ''} />
                        </div>
                      )}

                      {block.question && (
                        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-xs sm:text-sm text-amber-100 flex items-start gap-2.5">
                          <QuestionIcon className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold mr-1 text-amber-300">Câu hỏi đặt vấn đề:</span>
                            <MathView content={block.question} inline />
                          </div>
                        </div>
                      )}

                      {block.conclusion && (
                        <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-xs sm:text-sm text-emerald-100 font-semibold flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-emerald-400 uppercase font-extrabold text-[11px] mr-1.5">
                              Kết luận mở đầu:
                            </span>
                            <MathView content={block.conclusion} inline />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // -------------------------------------------------------------
                // 5. KHỐI LÝ THUYẾT / NỘI DUNG (CONTENT)
                // -------------------------------------------------------------
                if (block.type === 'content') {
                  return (
                    <div
                      key={block.id || bIdx}
                      className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border-2 border-purple-500/40 shadow-xl space-y-3"
                    >
                      {block.title && (
                        <div className="font-black text-base sm:text-lg text-purple-300 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-400" />
                          <span>
                            <MathView content={block.title} inline />
                          </span>
                        </div>
                      )}
                      <div className="text-sm sm:text-base text-slate-100 font-normal leading-relaxed">
                        <MathView content={block.content || ''} />
                      </div>
                    </div>
                  );
                }

                // -------------------------------------------------------------
                // 6. KHỐI HOẠT ĐỘNG KHÁM PHÁ (ACTIVITY)
                // -------------------------------------------------------------
                if (block.type === 'activity') {
                  return (
                    <div
                      key={block.id || bIdx}
                      className="p-5 sm:p-6 rounded-3xl bg-blue-950/30 border-2 border-blue-500/40 shadow-xl space-y-3.5"
                    >
                      <div className="flex items-center gap-2.5 font-black text-base sm:text-lg text-blue-300">
                        <Compass className="w-5 h-5 text-blue-400 flex-shrink-0" />
                        <span>
                          <MathView content={block.title || 'Hoạt Động Khám Phá'} inline />
                        </span>
                      </div>

                      {block.description && (
                        <div className="text-sm sm:text-base text-slate-100 font-normal leading-relaxed">
                          <MathView content={block.description} />
                        </div>
                      )}

                      {block.question && (
                        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-blue-500/30 text-xs sm:text-sm text-blue-100 flex items-start gap-2.5">
                          <QuestionIcon className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold mr-1 text-blue-300">Câu hỏi thảo luận:</span>
                            <MathView content={block.question} inline />
                          </div>
                        </div>
                      )}

                      {block.conclusion && (
                        <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-xs sm:text-sm text-emerald-100 font-semibold flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-emerald-400 uppercase font-extrabold text-[11px] mr-1.5">
                              Kết luận:
                            </span>
                            <MathView content={block.conclusion} inline />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // -------------------------------------------------------------
                // 7. KHỐI GHI NHỚ TRỌNG TÂM SGK (TAKEAWAY)
                // -------------------------------------------------------------
                if (block.type === 'takeaway') {
                  return (
                    <div
                      key={block.id || bIdx}
                      className="p-6 sm:p-7 rounded-3xl bg-indigo-950/50 border-2 border-indigo-500/60 shadow-2xl text-indigo-100 space-y-3"
                    >
                      <div className="font-black text-xs sm:text-sm uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                        <Bookmark className="w-4 h-4 text-indigo-400" />
                        <span>{block.title || 'Ghi Nhớ Trọng Tâm (SGK)'}</span>
                      </div>
                      <div className="text-sm sm:text-base lg:text-lg font-medium leading-relaxed">
                        <MathView content={block.content || ''} />
                      </div>
                    </div>
                  );
                }

                // -------------------------------------------------------------
                // 8. KHỐI CHÚ Ý (NOTE)
                // -------------------------------------------------------------
                if (block.type === 'note') {
                  return (
                    <div
                      key={block.id || bIdx}
                      className="p-4 sm:p-5 rounded-3xl bg-rose-950/30 border-2 border-rose-500/40 text-rose-100 text-xs sm:text-sm flex items-start gap-3 shadow-md"
                    >
                      <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 leading-relaxed">
                        <span className="font-extrabold text-rose-300 mr-2 uppercase text-[11px] tracking-wide">
                          {block.title || 'Chú ý'}:
                        </span>
                        <MathView content={block.content || ''} inline />
                      </div>
                    </div>
                  );
                }

                // -------------------------------------------------------------
                // 9. KHỐI VÍ DỤ MINH HỌA (EXAMPLE)
                // -------------------------------------------------------------
                if (block.type === 'example') {
                  const stepKey = block.id;
                  const solutionSteps = block.solutionSteps || [];
                  const curStep = getExampleStep(stepKey, 1);
                  const totalSteps = solutionSteps.length;

                  return (
                    <div
                      key={block.id || bIdx}
                      className="p-5 sm:p-7 rounded-3xl bg-slate-950 border-2 border-emerald-500/40 shadow-2xl space-y-4"
                    >
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                        <div className="font-black text-base sm:text-lg text-emerald-300 flex items-center gap-2.5">
                          <Lightbulb className="w-5 h-5 text-emerald-400" />
                          <span>
                            <MathView content={block.title || 'Ví Dụ'} inline />
                          </span>
                        </div>
                        <button
                          onClick={() => handleResetExampleStep(stepKey)}
                          title="Thu gọn lại các bước giải"
                          className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Thu gọn
                        </button>
                      </div>

                      {block.problem && (
                        <div className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed">
                          <MathView content={block.problem} />
                        </div>
                      )}

                      {/* Revealed Steps */}
                      <div className="space-y-2.5 pt-1">
                        {solutionSteps.slice(0, curStep).map((step, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-sm sm:text-base text-slate-100 font-medium"
                          >
                            <MathView content={step} />
                          </div>
                        ))}
                      </div>

                      {/* Next Step Button */}
                      {curStep < totalSteps && (
                        <button
                          onClick={() => handleRevealNextStep(stepKey)}
                          className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 text-white text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-[0.99]"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>
                            Hiện bước giải tiếp theo ({curStep + 1}/{totalSteps})
                          </span>
                        </button>
                      )}

                      {/* Final Answer */}
                      {curStep >= totalSteps && block.finalAnswer && (
                        <div className="p-4 rounded-2xl bg-emerald-950/70 border-2 border-emerald-500/50 text-emerald-100 font-bold text-sm sm:text-base flex items-center gap-2.5 shadow">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                          <MathView content={block.finalAnswer} />
                        </div>
                      )}
                    </div>
                  );
                }

                // -------------------------------------------------------------
                // 10. KHỐI CHÚ Ý TỪ VÍ DỤ (EXAMPLE NOTE)
                // -------------------------------------------------------------
                if (block.type === 'example_note') {
                  return (
                    <div
                      key={block.id || bIdx}
                      className="p-4 sm:p-5 rounded-3xl bg-violet-950/30 border-2 border-violet-500/40 text-violet-100 text-xs sm:text-sm flex items-start gap-3 shadow-md"
                    >
                      <CornerDownRight className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 leading-relaxed">
                        <span className="font-extrabold text-violet-300 mr-2 uppercase text-[11px] tracking-wide">
                          {block.title || 'Chú ý từ ví dụ'}:
                        </span>
                        <MathView content={block.content || ''} inline />
                      </div>
                    </div>
                  );
                }

                // -------------------------------------------------------------
                // 11. KHỐI LUYỆN TẬP (PRACTICE)
                // -------------------------------------------------------------
                if (block.type === 'practice') {
                  const key = block.id;
                  const showHint = !!practiceToggles[`${key}_hint`];
                  const showSol = !!practiceToggles[`${key}_sol`];

                  return (
                    <div
                      key={block.id || bIdx}
                      className="p-5 sm:p-7 rounded-3xl bg-slate-900/90 border-2 border-sky-500/40 shadow-xl space-y-4"
                    >
                      <div className="font-black text-base sm:text-lg text-sky-300 flex items-center gap-2.5">
                        <Dumbbell className="w-5 h-5 text-sky-400" />
                        <span>
                          <MathView content={block.title || 'Luyện Tập'} inline />
                        </span>
                      </div>

                      {block.problem && (
                        <div className="text-sm sm:text-base text-slate-100 leading-relaxed font-normal">
                          <MathView content={block.problem} />
                        </div>
                      )}

                      {/* Interactive Buttons */}
                      <div className="flex flex-wrap items-center gap-2.5 pt-2">
                        {block.hint && (
                          <button
                            onClick={() => togglePracticeHint(key)}
                            className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{showHint ? 'Ẩn Gợi Ý' : 'Hiện Gợi Ý'}</span>
                          </button>
                        )}

                        {block.solution && (
                          <button
                            onClick={() => togglePracticeSolution(key)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{showSol ? 'Ẩn Lời Giải' : 'Hiện Lời Giải'}</span>
                          </button>
                        )}
                      </div>

                      {showHint && block.hint && (
                        <div className="p-3.5 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-xs sm:text-sm text-amber-100">
                          <span className="font-bold text-amber-300 mr-1.5">Gợi ý:</span>
                          <MathView content={block.hint} inline />
                        </div>
                      )}

                      {showSol && block.solution && (
                        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-sm sm:text-base text-emerald-100 font-medium">
                          <span className="font-bold text-emerald-300 block mb-1">Lời giải chi tiết:</span>
                          <MathView content={block.solution} />
                        </div>
                      )}
                    </div>
                  );
                }

                // -------------------------------------------------------------
                // 12. KHỐI VẬN DỤNG THỰC TIỄN (APPLICATION)
                // -------------------------------------------------------------
                if (block.type === 'application') {
                  const key = block.id;
                  const showSol = !!appToggles[`${key}_sol`];

                  return (
                    <div
                      key={block.id || bIdx}
                      className="p-5 sm:p-7 rounded-3xl bg-slate-900/90 border-2 border-teal-500/40 shadow-xl space-y-4"
                    >
                      <div className="font-black text-base sm:text-lg text-teal-300 flex items-center gap-2.5">
                        <Globe2 className="w-5 h-5 text-teal-400" />
                        <span>
                          <MathView content={block.title || 'Vận Dụng Thực Tế'} inline />
                        </span>
                      </div>

                      {block.problem && (
                        <div className="text-sm sm:text-base text-slate-100 leading-relaxed font-normal">
                          <MathView content={block.problem} />
                        </div>
                      )}

                      {block.solution && (
                        <div className="pt-2">
                          <button
                            onClick={() => toggleAppSolution(key)}
                            className="px-3 py-1.5 rounded-xl bg-teal-600/20 hover:bg-teal-600/40 border border-teal-500/40 text-teal-300 text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{showSol ? 'Ẩn Hướng Dẫn' : 'Xem Hướng Dẫn'}</span>
                          </button>

                          {showSol && (
                            <div className="mt-3 p-4 rounded-2xl bg-teal-950/60 border border-teal-500/40 text-sm sm:text-base text-teal-100 font-medium">
                              <span className="font-bold text-teal-300 block mb-1">Hướng dẫn giải:</span>
                              <MathView content={block.solution} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }

                return null;
              };

              const blockContent = renderBlockItem();
              if (!blockContent) return null;

              return (
                <motion.div
                  key={block.id || bIdx}
                  variants={blockVariants}
                  initial="initial"
                  animate="animate"
                  className="relative w-full"
                >
                  {blockContent}
                </motion.div>
              );
            })}
            </div>
          )}
          </motion.div>
        </AnimatePresence>

        {/* POWERPOINT STEP-BY-STEP BLOCK NAVIGATION FLOATING BAR */}
        {blocks.length > 0 && isClickToRevealMode && (
          <div className="no-slide-advance sticky bottom-2 left-0 right-0 mt-8 max-w-xl mx-auto w-full z-30 px-3">
            <div className="flex items-center justify-between gap-2.5 bg-slate-900/95 border border-pink-500/40 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-2xl text-xs">
              <div className="flex items-center gap-2">
                <span className="font-black text-pink-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  <span>Khối {Math.min(revealedBlockCount, blocks.length)}/{blocks.length}</span>
                </span>

                {/* Progress Dots */}
                <div className="hidden sm:flex items-center gap-1">
                  {blocks.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx < revealedBlockCount
                          ? 'bg-pink-500 shadow-[0_0_8px_#ec4899] scale-110'
                          : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreviousStep();
                  }}
                  disabled={slideIndex === 0 && revealedBlockCount <= 1}
                  title="Lùi 1 khối (hoặc về slide trước) [Phím ⬅️]"
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 hover:text-white transition-all font-bold flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Lùi</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdvanceStep();
                  }}
                  title="Hiện khối tiếp theo (hoặc chuyển slide) [Click chuột / Phím Enter / Phím ➡️]"
                  className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-md ${
                    revealedBlockCount < blocks.length
                      ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:brightness-110 text-white ring-2 ring-pink-400/50 animate-pulse'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  <span>
                    {revealedBlockCount < blocks.length
                      ? 'Khối Tiếp (Enter / Click)'
                      : 'Slide Tiếp Theo'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {revealedBlockCount < blocks.length && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRevealAllBlocks();
                    }}
                    title="Hiện toàn bộ các khối trên slide này cùng lúc"
                    className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all font-semibold text-[11px]"
                  >
                    Hiện Hết
                  </button>
                )}

                {revealedBlockCount > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResetBlockProgress();
                    }}
                    title="Chiếu lại từ khối đầu tiên"
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. ZOOMED IMAGE MODAL */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-rose-600 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={zoomedImage.url}
              alt={zoomedImage.alt || 'Zoomed Image'}
              className="w-full h-auto max-h-[70vh] object-contain rounded-2xl shadow-lg"
            />
            {zoomedImage.caption && (
              <div className="mt-4 text-center text-sm sm:text-base text-slate-200 font-semibold px-4">
                <MathView content={zoomedImage.caption} inline />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
