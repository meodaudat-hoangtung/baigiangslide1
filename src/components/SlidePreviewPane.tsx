import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  EyeOff,
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
  Film,
  Pin,
  PinOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Slide, SlideImage, SlideStyleConfig, SlideContentBlock } from '../types';
import { BLOCK_TYPES_META, getSlideBlocks } from '../utils/slideBlocks';
import { MathView } from './MathView';
import { MediaBlockRenderer } from './MediaBlockRenderer';
import { SlideTransitionToolbar } from './SlideTransitionToolbar';
import { SlideTextBoxOverlay } from './SlideTextBoxOverlay';
import {
  getSlideVariants,
  getElementVariants,
  getBlockVariants,
  TRANSITION_PRESETS
} from '../utils/slideTransitions';

const EMPTY_TEXT_BOXES: any[] = [];

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

  // TV Screen Presentation Mode:
  // 'full': Tràn 100% diện tích màn hình thiết bị chiếu (tivi, máy chiếu) - không viền, không lề đen
  // '16-9': Khung tỷ lệ 16:9 chuẩn TV
  const [tvDisplayFit, setTvDisplayFit] = useState<'full' | '16-9'>('full');

  // Fullscreen Auto-Hiding Controls Visibility
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(true);
  const [isControlsPinned, setIsControlsPinned] = useState<boolean>(false);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetControlsHideTimer = () => {
    setIsControlsVisible(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (!isControlsPinned) {
      hideControlsTimerRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 3000);
    }
  };

  // Step-by-step reveals for Examples: key = `${blockId}` -> currentStep
  const [revealedExampleSteps, setRevealedExampleSteps] = useState<{ [key: string]: number }>({});
  // Practice hints & solutions toggles: key = `${blockId}_hint` | `${blockId}_sol`
  const [practiceToggles, setPracticeToggles] = useState<{ [key: string]: boolean }>({});
  // Application solutions toggle: key = `${blockId}_sol`
  const [appToggles, setAppToggles] = useState<{ [key: string]: boolean }>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const canvasRectRef = useRef<DOMRect | null>(null);
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
  const subtitleColor = styleConfig.subtitleColor || '#ffffff';
  const textColor = styleConfig.textColor || '#ffffff';

  // Get blocks on current slide
  const blocks = getSlideBlocks(slide);

  // Find and sort all animated text boxes on the current slide
  const animatedTextBoxes = useMemo(() => {
    if (!slide?.textBoxes) return [];
    return [...slide.textBoxes]
      .filter((b) => b.animation && b.animation !== 'none')
      .sort((a, b) => {
        const orderA = a.animationOrder !== undefined ? a.animationOrder : 999;
        const orderB = b.animationOrder !== undefined ? b.animationOrder : 999;
        if (orderA !== orderB) return orderA - orderB;
        return slide.textBoxes!.indexOf(a) - slide.textBoxes!.indexOf(b);
      });
  }, [slide]);

  const totalTextBoxAnimSteps = animatedTextBoxes.length;
  const [slideAnimStep, setSlideAnimStep] = useState(0);
  const [slideLastTriggeredStep, setSlideLastTriggeredStep] = useState(0);
  const [manuallyRevealedBlocks, setManuallyRevealedBlocks] = useState<Record<string, boolean>>({});

  // Track slide navigation direction & reset block reveal count
  useEffect(() => {
    setManuallyRevealedBlocks({});
    if (slideIndex > prevIndexRef.current) {
      setSlideDirection(1);
      setRevealedBlockCount(1);
      setSlideAnimStep(0);
      setSlideLastTriggeredStep(0);
    } else if (slideIndex < prevIndexRef.current) {
      setSlideDirection(-1);
      const currBlocks = getSlideBlocks(slide);
      setRevealedBlockCount(currBlocks.length || 1);
      const animCount = (slide?.textBoxes || []).filter((b) => b.animation && b.animation !== 'none').length;
      setSlideAnimStep(animCount);
      setSlideLastTriggeredStep(0);
    }
    prevIndexRef.current = slideIndex;
    clearCanvas();
  }, [slideIndex, slide?.id]);

  // Advance step (next block, next text animation, or next slide)
  const handleAdvanceStep = () => {
    if (isDrawingMode) return;
    if (zoomedImage) return;

    // 1. Advance modular blocks in click-to-reveal mode
    if (isClickToRevealMode && blocks.length > 0 && revealedBlockCount < blocks.length) {
      setRevealedBlockCount((prev) => Math.min(blocks.length, prev + 1));
      return;
    }

    // 2. Advance animated text boxes step-by-step
    if (slideAnimStep < totalTextBoxAnimSteps) {
      const next = slideAnimStep + 1;
      setSlideAnimStep(next);
      setSlideLastTriggeredStep(next);
      return;
    }

    // 3. When all blocks and animations are done -> advance to next slide!
    if (slideIndex < totalSlides - 1) {
      setSlideDirection(1);
      onSelectSlide(slideIndex + 1);
      setRevealedBlockCount(1);
      setSlideAnimStep(0);
      setSlideLastTriggeredStep(0);
    }
  };

  // Previous step (previous text animation, previous block, or previous slide)
  const handlePreviousStep = () => {
    if (isDrawingMode) return;
    if (zoomedImage) return;

    if (slideAnimStep > 0) {
      setSlideAnimStep((prev) => prev - 1);
      setSlideLastTriggeredStep(0);
      return;
    }

    if (isClickToRevealMode && blocks.length > 0 && revealedBlockCount > 1) {
      setRevealedBlockCount((prev) => Math.max(1, prev - 1));
      return;
    }

    if (slideIndex > 0) {
      setSlideDirection(-1);
      onSelectSlide(slideIndex - 1);
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
      resetControlsHideTimer();
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const inFull = !!document.fullscreenElement;
      setIsFullscreen(inFull);
      if (inFull) {
        resetControlsHideTimer();
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isControlsPinned]);

  useEffect(() => {
    if (isFullscreen) {
      resetControlsHideTimer();
    } else {
      setIsControlsVisible(true);
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    }
  }, [isFullscreen, isControlsPinned]);

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
      } else if (e.key === 'm' || e.key === 'M') {
        setTvDisplayFit((prev) => (prev === 'full' ? '16-9' : 'full'));
      } else if (e.key === 't' || e.key === 'T') {
        setIsControlsVisible((prev) => !prev);
      } else if (e.key === 'l' || e.key === 'L') {
        setIsLaserMode((prev) => !prev);
        setIsDrawingMode(false);
      } else if (e.key === 'p' || e.key === 'P') {
        setIsDrawingMode((prev) => !prev);
        setIsLaserMode(false);
      } else if (
        e.key === 'ArrowRight' ||
        e.key === 'ArrowDown' ||
        e.key === 'Enter' ||
        e.key === ' ' ||
        e.key === 'PageDown'
      ) {
        e.preventDefault();
        handleAdvanceStep();
      } else if (
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowUp' ||
        e.key === 'PageUp' ||
        e.key === 'Backspace'
      ) {
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
  }, [isFullscreen, slideIndex, totalSlides, zoomedImage, isClickToRevealMode, blocks.length, revealedBlockCount, slideAnimStep, totalTextBoxAnimSteps, isDrawingMode, isControlsPinned]);

  // Canvas resize logic with pixel-perfect synchronization
  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const newWidth = Math.round(rect.width);
    const newHeight = Math.round(rect.height);

    if (newWidth <= 0 || newHeight <= 0) return;

    if (canvas.width !== newWidth || canvas.height !== newHeight) {
      const prevCanvas = document.createElement('canvas');
      prevCanvas.width = canvas.width;
      prevCanvas.height = canvas.height;
      const prevCtx = prevCanvas.getContext('2d');
      if (prevCtx && canvas.width > 0 && canvas.height > 0) {
        prevCtx.drawImage(canvas, 0, 0);
      }

      canvas.width = newWidth;
      canvas.height = newHeight;

      const ctx = canvas.getContext('2d');
      if (ctx && prevCanvas.width > 0 && prevCanvas.height > 0) {
        ctx.drawImage(prevCanvas, 0, 0, newWidth, newHeight);
      }
    }

    canvasRectRef.current = rect;
  }, []);

  useEffect(() => {
    syncCanvasSize();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver(() => {
      syncCanvasSize();
    });
    observer.observe(canvas);
    if (canvas.parentElement) {
      observer.observe(canvas.parentElement);
    }
    window.addEventListener('resize', syncCanvasSize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', syncCanvasSize);
    };
  }, [isFullscreen, slideIndex, tvScale, syncCanvasSize]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    lastPointRef.current = null;
    isDrawing.current = false;
  };

  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
    const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return;
    syncCanvasSize();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (_) {}

    canvasRectRef.current = canvas.getBoundingClientRect();
    isDrawing.current = true;

    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    lastPointRef.current = { x, y };

    ctx.fillStyle = activePenColor;
    ctx.beginPath();
    ctx.arc(x, y, 1.75, 0, Math.PI * 2);
    ctx.fill();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isLaserMode) {
      const canvas = canvasRef.current;
      const rect = canvasRectRef.current || (canvas ? canvas.getBoundingClientRect() : e.currentTarget.getBoundingClientRect());
      setLaserPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }

    if (!isDrawing.current || !isDrawingMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = activePenColor;
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const rawEvents = (e.nativeEvent && (e.nativeEvent as any).getCoalescedEvents?.()) || [e];

    for (const ev of rawEvents) {
      const { x, y } = getCanvasCoords(ev.clientX, ev.clientY);
      const last = lastPointRef.current || { x, y };

      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(x, y);
      ctx.stroke();

      lastPointRef.current = { x, y };
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawing.current = false;
    lastPointRef.current = null;
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
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
      onMouseMove={() => {
        if (isFullscreen && !isDrawing.current) resetControlsHideTimer();
      }}
      onTouchStart={() => {
        if (isFullscreen) resetControlsHideTimer();
      }}
      className={`relative flex flex-col bg-slate-950 text-slate-100 select-none ${
        isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen overflow-hidden p-0 m-0 bg-black'
          : 'h-full overflow-hidden'
      }`}
    >
      {/* 1. TOP TOOLBAR: NORMAL WORKSPACE BAR OR FULLSCREEN PRESENTATION FLOATING HUD */}
      {!isFullscreen ? (
        <div className="bg-slate-900/95 border-b border-slate-800 px-3 py-2 flex items-center justify-between gap-2.5 flex-nowrap overflow-x-auto no-scrollbar shrink-0 backdrop-blur-md z-30 shadow-md whitespace-nowrap">
          {/* Group 1 (Left): TV Scale & Zoom Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-xs font-bold shadow-inner shrink-0">
              <Tv className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Chuẩn TV</span>
              <span className="text-white font-mono">{tvScale}%</span>
            </div>

            <div className="flex items-center bg-slate-950 rounded-xl p-0.5 border border-slate-800 shrink-0">
              <button
                onClick={() => setTvScale((prev) => Math.max(100, prev - 25))}
                title="Giảm cỡ chữ & hiển thị (-)"
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTvScale(125)}
                title="Đặt lại mức chuẩn 125%"
                className="px-1.5 py-0.5 text-[11px] font-bold text-slate-300 hover:text-white"
              >
                125%
              </button>
              <button
                onClick={() => setTvScale((prev) => Math.min(200, prev + 25))}
                title="Tăng cỡ chữ & hiển thị (+)"
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Group 2 (Center): Slide Indicator, PowerPoint Transition Button & Click-to-Reveal */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="text-xs font-black text-slate-300 flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>
                Slide {slideIndex + 1} / {totalSlides}
              </span>
            </div>

            {/* POWERPOINT TRANSITION BUTTON */}
            <button
              onClick={() => setShowTransitionsPanel(!showTransitionsPanel)}
              title="Tùy chỉnh hiệu ứng chuyển slide PowerPoint & hoạt họa các khối"
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0 ${
                showTransitionsPanel
                  ? 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400'
                  : 'bg-slate-800 text-indigo-300 hover:bg-slate-700 hover:text-white border border-indigo-500/30'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span>Hiệu Ứng PowerPoint</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-950/70 text-indigo-200 border border-indigo-500/30">
                {activePreset?.icon} {activePreset?.shortLabel || 'Trượt'}
              </span>
            </button>

            {/* CLICK TO REVEAL MODE TOGGLE */}
            <button
              onClick={() => setIsClickToRevealMode((prev) => !prev)}
              title="Bật/Tắt chế độ chạy hiệu ứng từng khối theo click chuột / phím Enter / phím mũi tên"
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0 ${
                isClickToRevealMode
                  ? 'bg-pink-950/80 border border-pink-500/60 text-pink-300 ring-1 ring-pink-500/40 shadow-pink-950/50'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span>Chiếu Từng Khối: {isClickToRevealMode ? 'BẬT' : 'TẮT'}</span>
            </button>
          </div>

          {/* Group 3 (Right): Interactive Presenter Tools & Fullscreen Presentation */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Laser Pointer */}
            <button
              onClick={() => {
                setIsLaserMode(!isLaserMode);
                if (!isLaserMode) setIsDrawingMode(false);
              }}
              title="Đèn Laser chỉ điểm (Phím L)"
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                isLaserMode
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 ring-2 ring-rose-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Laser</span>
            </button>

            {/* Pen Tool */}
            <button
              onClick={() => {
                setIsDrawingMode(!isDrawingMode);
                if (!isDrawingMode) setIsLaserMode(false);
              }}
              title="Bút vẽ & Chú thích trực tiếp (Phím P)"
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                isDrawingMode
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40 ring-2 ring-emerald-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <PenTool className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Bút Vẽ</span>
            </button>

            {isDrawingMode && (
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
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
              title="Trình chiếu tối đa diện tích màn hình TV / Máy Chiếu (Phím F)"
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5 text-xs font-black shrink-0 whitespace-nowrap"
            >
              <Maximize2 className="w-3.5 h-3.5 shrink-0" />
              <span>Toàn Màn Hình TV (F)</span>
            </button>
          </div>
        </div>
      ) : (
        /* FLOATING AUTO-HIDING PRESENTER HUD IN FULLSCREEN PRESENTATION MODE */
        <div
          className={`fixed top-3 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 max-w-[96vw] ${
            isControlsVisible || isControlsPinned
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 -translate-y-6 pointer-events-none'
          }`}
          onMouseEnter={() => {
            if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
            setIsControlsVisible(true);
          }}
          onMouseLeave={() => {
            if (!isControlsPinned) resetControlsHideTimer();
          }}
        >
          <div className="bg-slate-950/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl px-3 py-2 shadow-2xl flex items-center gap-2 text-xs flex-wrap">
            {/* Slide Navigation */}
            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviousStep();
                }}
                disabled={slideIndex === 0 && revealedBlockCount <= 1}
                className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                title="Lùi 1 khối / slide (Phím ⬅️)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-black text-slate-200 px-1 font-mono">
                {slideIndex + 1} / {totalSlides}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAdvanceStep();
                }}
                className="p-1 text-slate-400 hover:text-white"
                title="Hiện tiếp / Sang slide (Phím ➡️ hoặc Enter)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Display Fit Toggle: Tràn 100% diện tích TV vs 16:9 Chuẩn */}
            <button
              onClick={() => setTvDisplayFit(tvDisplayFit === 'full' ? '16-9' : 'full')}
              title="Chuyển đổi diện tích chiếu: Tràn 100% diện tích TV (Phím M)"
              className="px-2.5 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-inner"
            >
              <Tv className="w-3.5 h-3.5 text-emerald-400" />
              <span>{tvDisplayFit === 'full' ? '📺 Tràn 100% TV' : '📺 16:9 Chuẩn TV'}</span>
            </button>

            {/* TV Scale selector */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold">Chữ TV:</span>
              {[100, 125, 150].map((scale) => (
                <button
                  key={scale}
                  onClick={() => setTvScale(scale)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                    tvScale === scale
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {scale}%
                </button>
              ))}
            </div>

            {/* Laser Pointer */}
            <button
              onClick={() => {
                setIsLaserMode(!isLaserMode);
                if (!isLaserMode) setIsDrawingMode(false);
              }}
              title="Đèn Laser chỉ điểm (Phím L)"
              className={`px-2 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                isLaserMode
                  ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
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
              className={`px-2 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                isDrawingMode
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <PenTool className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Bút</span>
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

            {/* Click to Reveal Mode toggle */}
            <button
              onClick={() => setIsClickToRevealMode((prev) => !prev)}
              title="Bật/Tắt chế độ hiện từng khối"
              className={`px-2 py-1 rounded-xl text-xs font-semibold transition-all ${
                isClickToRevealMode ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/40' : 'bg-slate-900 text-slate-400'
              }`}
            >
              {isClickToRevealMode ? 'Từng Khối' : 'Hiện Hết'}
            </button>

            {/* PowerPoint Transitions */}
            <button
              onClick={() => setShowTransitionsPanel(!showTransitionsPanel)}
              title="Hiệu ứng PowerPoint"
              className="p-1.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white"
            >
              <Film className="w-3.5 h-3.5 text-pink-400" />
            </button>

            {/* Pin Toolbar */}
            <button
              onClick={() => {
                setIsControlsPinned(!isControlsPinned);
                if (!isControlsPinned) setIsControlsVisible(true);
              }}
              title={isControlsPinned ? 'Bỏ ghim (thanh sẽ tự ẩn khi giảng bài)' : 'Ghim thanh điều khiển luôn hiện'}
              className={`p-1.5 rounded-xl transition-all ${
                isControlsPinned ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {isControlsPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
            </button>

            {/* Exit Fullscreen */}
            <button
              onClick={toggleFullscreen}
              title="Thoát toàn màn hình (Phím Esc hoặc F)"
              className="px-2.5 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-600 border border-rose-500/40 text-rose-200 hover:text-white text-xs font-bold flex items-center gap-1 transition-all"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Thoát (Esc)</span>
            </button>
          </div>
        </div>
      )}

      {/* Touch Screen / Presenter Chevrons on Left & Right Screen Edges */}
      {isFullscreen && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePreviousStep();
            }}
            disabled={slideIndex === 0 && revealedBlockCount <= 1}
            title="Về slide trước (Phím ⬅️)"
            className={`fixed left-3 top-1/2 -translate-y-1/2 z-40 w-12 h-24 rounded-2xl bg-slate-900/60 hover:bg-slate-900/95 border border-white/10 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-2xl disabled:opacity-0 ${
              isControlsVisible || isControlsPinned ? 'opacity-80' : 'opacity-0 hover:opacity-80'
            }`}
          >
            <ChevronLeft className="w-7 h-7 text-white/90 drop-shadow" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAdvanceStep();
            }}
            title="Khối tiếp theo / Slide tiếp theo (Click hoặc Phím ➡️)"
            className={`fixed right-3 top-1/2 -translate-y-1/2 z-40 w-12 h-24 rounded-2xl bg-slate-900/60 hover:bg-slate-900/95 border border-white/10 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-2xl ${
              isControlsVisible || isControlsPinned ? 'opacity-80' : 'opacity-0 hover:opacity-80'
            }`}
          >
            <ChevronRight className="w-7 h-7 text-white/90 drop-shadow" />
          </button>
        </>
      )}

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
        className={`relative flex-1 ${
          isFullscreen
            ? 'overflow-hidden h-full max-h-screen p-0 m-0 no-scrollbar select-none'
            : 'overflow-y-auto p-3 sm:p-5 lg:p-6 custom-scrollbar'
        } overflow-x-hidden flex flex-col justify-start items-center ${
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
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className={`absolute inset-0 w-full h-full z-20 ${
            isDrawingMode ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'
          }`}
          style={{ width: '100%', height: '100%', touchAction: 'none' }}
        />

        {/* Laser Pointer Dot */}
        {isLaserMode && laserPos && (
          <div
            className="absolute z-30 pointer-events-none w-5 h-5 rounded-full bg-rose-500 border-2 border-white shadow-[0_0_20px_#f43f5e] animate-pulse -translate-x-1/2 -translate-y-1/2"
            style={{ left: laserPos.x, top: laserPos.y }}
          />
        )}

        {/* POWERPOINT ANIMATED SLIDE CONTAINER (OCCUPIES 100% OF TV SCREEN IN FULLSCREEN PRESENTATION) */}
        <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.div
            key={`${slide.id || slideIndex}_${previewKey}`}
            custom={slideDirection}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`relative z-10 transition-all slide-presentation-area text-white ${fontClass} ${
              isFullscreen
                ? tvDisplayFit === 'full'
                  ? 'w-full h-full max-h-screen overflow-hidden rounded-none border-0 shadow-none m-0 p-6 sm:p-8 lg:p-10 space-y-6 flex flex-col justify-between box-border select-none'
                  : 'w-full max-w-[calc(100vh*16/9)] h-full max-h-screen aspect-[16/9] overflow-hidden rounded-none border-0 shadow-none my-auto p-6 sm:p-8 lg:p-10 space-y-6 flex flex-col justify-between box-border select-none'
                : 'w-[94%] sm:w-[92%] lg:w-[90%] xl:w-[90%] max-w-[94vw] mx-auto min-h-[82vh] sm:min-h-[86vh] rounded-3xl p-6 sm:p-10 lg:p-12 space-y-8 bg-slate-900/60 border border-slate-800/80 shadow-2xl backdrop-blur-xl'
            }`}
            style={{
              backgroundColor: styleConfig.backgroundColor || '#020617',
              transform: !isFullscreen && tvScale !== 100 ? `scale(${tvScale / 100})` : undefined,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
          >
            {/* PowerPoint Floating Text Boxes Overlay */}
            <SlideTextBoxOverlay
              textBoxes={slide?.textBoxes || EMPTY_TEXT_BOXES}
              isEditable={false}
              revealedAnimStep={slideAnimStep}
              lastTriggeredStep={slideLastTriggeredStep}
            />

          {/* ============================================================= */}
          {/* RENDER MODULAR BLOCKS IN EXACT ORDER                          */}
          {/* ============================================================= */}
          {blocks.length > 0 && (
            <div
              className={`space-y-6 slide-presentation-content text-white ${
                isFullscreen
                  ? 'flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col justify-center'
                  : ''
              }`}
              style={{ color: textColor }}
            >
              {blocks.map((block, bIdx) => {
                // If in click-to-reveal mode, only show blocks up to revealed count
                const isVisible = !isClickToRevealMode || bIdx < revealedBlockCount;
                if (!isVisible) return null;

                // If block is explicitly marked as hidden by teacher
                if (block.isHidden && !manuallyRevealedBlocks[block.id]) {
                  return (
                    <div
                      key={`hidden-block-${block.id || bIdx}`}
                      className="p-3 px-4 rounded-2xl bg-slate-900/80 border border-dashed border-amber-500/60 flex items-center justify-between text-xs text-amber-200/90 shadow-md backdrop-blur-sm group hover:border-amber-400 transition-colors my-2"
                    >
                      <div className="flex items-center gap-2 font-bold">
                        <EyeOff className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Đối tượng [{block.title || 'Khối nội dung'}] đang bị ẩn</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setManuallyRevealedBlocks((prev) => ({
                            ...prev,
                            [block.id]: true,
                          }))
                        }
                        title="Nhấp để hiển thị đối tượng này"
                        className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer hover:scale-105 active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Hiện đối tượng</span>
                      </button>
                    </div>
                  );
                }

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
                          <div className="mt-2.5 text-center text-xs sm:text-sm text-white font-semibold px-2">
                            <MathView content={block.imageCaption} inline />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                // -------------------------------------------------------------
                // 1b. KHỐI VIDEO / AUDIO (MEDIA BLOCK)
                // -------------------------------------------------------------
                if (block.type === 'media') {
                  return (
                    <MediaBlockRenderer
                      key={block.id || bIdx}
                      block={block}
                    />
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
                        className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white"
                        style={{ color: titleColor }}
                      >
                        <MathView content={block.title || slide.title || 'Tiêu Đề Bài Học'} inline />
                      </div>

                      {(block.subtitle || slide.subtitle) && (
                        <div
                          className="text-sm sm:text-base lg:text-lg font-medium leading-relaxed text-white"
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
                      <div className="flex items-center gap-2 text-sm sm:text-base font-black uppercase text-white">
                        <Target className="w-5 h-5 text-emerald-400" />
                        <span>
                          <MathView content={block.title || 'Mục Tiêu Bài Học'} inline />
                        </span>
                      </div>

                      {block.items && block.items.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm sm:text-base text-white font-medium">
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
                        <div className="text-sm text-white pt-1">
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
                      <div className="flex items-center gap-2.5 font-black text-sm sm:text-base text-white uppercase">
                        <Compass className="w-5 h-5 text-amber-400 flex-shrink-0" />
                        <span>
                          <MathView content={block.title || 'Tình Huống Mở Đầu'} inline />
                        </span>
                      </div>

                      {(block.context || block.description) && (
                        <div className="text-sm sm:text-base text-white font-normal leading-relaxed">
                          <MathView content={block.context || block.description || ''} />
                        </div>
                      )}

                      {block.question && (
                        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-xs sm:text-sm text-white flex items-start gap-2.5">
                          <QuestionIcon className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold mr-1 text-white">Câu hỏi đặt vấn đề:</span>
                            <MathView content={block.question} inline />
                          </div>
                        </div>
                      )}

                      {block.conclusion && (
                        <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-xs sm:text-sm text-white font-semibold flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-white uppercase font-extrabold text-[11px] mr-1.5">
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
                        <div className="font-black text-base sm:text-lg text-white flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-400" />
                          <span>
                            <MathView content={block.title} inline />
                          </span>
                        </div>
                      )}
                      <div className="text-sm sm:text-base text-white font-normal leading-relaxed">
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
                      <div className="flex items-center gap-2.5 font-black text-base sm:text-lg text-white">
                        <Compass className="w-5 h-5 text-blue-400 flex-shrink-0" />
                        <span>
                          <MathView content={block.title || 'Hoạt Động Khám Phá'} inline />
                        </span>
                      </div>

                      {block.description && (
                        <div className="text-sm sm:text-base text-white font-normal leading-relaxed">
                          <MathView content={block.description} />
                        </div>
                      )}

                      {block.question && (
                        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-blue-500/30 text-xs sm:text-sm text-white flex items-start gap-2.5">
                          <QuestionIcon className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold mr-1 text-white">Câu hỏi thảo luận:</span>
                            <MathView content={block.question} inline />
                          </div>
                        </div>
                      )}

                      {block.conclusion && (
                        <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-xs sm:text-sm text-white font-semibold flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-white uppercase font-extrabold text-[11px] mr-1.5">
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
                      className="p-6 sm:p-7 rounded-3xl bg-indigo-950/50 border-2 border-indigo-500/60 shadow-2xl text-white space-y-3"
                    >
                      <div className="font-black text-xs sm:text-sm uppercase tracking-wider text-white flex items-center gap-2">
                        <Bookmark className="w-4 h-4 text-indigo-400" />
                        <span>{block.title || 'Ghi Nhớ Trọng Tâm (SGK)'}</span>
                      </div>
                      <div className="text-sm sm:text-base lg:text-lg font-medium leading-relaxed text-white">
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
                      className="p-4 sm:p-5 rounded-3xl bg-rose-950/30 border-2 border-rose-500/40 text-white text-xs sm:text-sm flex items-start gap-3 shadow-md"
                    >
                      <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 leading-relaxed text-white">
                        <span className="font-extrabold text-white mr-2 uppercase text-[11px] tracking-wide">
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
                      className="p-5 sm:p-7 rounded-3xl bg-slate-950 border-2 border-emerald-500/40 shadow-2xl space-y-4 text-white"
                    >
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                        <div className="font-black text-base sm:text-lg text-white flex items-center gap-2.5">
                          <Lightbulb className="w-5 h-5 text-emerald-400" />
                          <span>
                            <MathView content={block.title || 'Ví Dụ'} inline />
                          </span>
                        </div>
                        <button
                          onClick={() => handleResetExampleStep(stepKey)}
                          title="Thu gọn lại các bước giải"
                          className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Thu gọn
                        </button>
                      </div>

                      {block.problem && (
                        <div className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                          <MathView content={block.problem} />
                        </div>
                      )}

                      {/* Revealed Steps */}
                      <div className="space-y-2.5 pt-1">
                        {solutionSteps.slice(0, curStep).map((step, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-sm sm:text-base text-white font-medium"
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
                        <div className="p-4 rounded-2xl bg-emerald-950/70 border-2 border-emerald-500/50 text-white font-bold text-sm sm:text-base flex items-center gap-2.5 shadow">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
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
                      className="p-4 sm:p-5 rounded-3xl bg-violet-950/30 border-2 border-violet-500/40 text-white text-xs sm:text-sm flex items-start gap-3 shadow-md"
                    >
                      <CornerDownRight className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 leading-relaxed text-white">
                        <span className="font-extrabold text-white mr-2 uppercase text-[11px] tracking-wide">
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
                      className="p-5 sm:p-7 rounded-3xl bg-slate-900/90 border-2 border-sky-500/40 shadow-xl space-y-4 text-white"
                    >
                      <div className="font-black text-base sm:text-lg text-white flex items-center gap-2.5">
                        <Dumbbell className="w-5 h-5 text-sky-400" />
                        <span>
                          <MathView content={block.title || 'Luyện Tập'} inline />
                        </span>
                      </div>

                      {block.problem && (
                        <div className="text-sm sm:text-base text-white leading-relaxed font-normal">
                          <MathView content={block.problem} />
                        </div>
                      )}

                      {/* Interactive Buttons */}
                      <div className="flex flex-wrap items-center gap-2.5 pt-2">
                        {block.hint && (
                          <button
                            onClick={() => togglePracticeHint(key)}
                            className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/40 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>{showHint ? 'Ẩn Gợi Ý' : 'Hiện Gợi Ý'}</span>
                          </button>
                        )}

                        {block.solution && (
                          <button
                            onClick={() => togglePracticeSolution(key)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/40 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                            <span>{showSol ? 'Ẩn Lời Giải' : 'Hiện Lời Giải'}</span>
                          </button>
                        )}
                      </div>

                      {showHint && block.hint && (
                        <div className="p-3.5 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-xs sm:text-sm text-white">
                          <span className="font-bold text-white mr-1.5">Gợi ý:</span>
                          <MathView content={block.hint} inline />
                        </div>
                      )}

                      {showSol && block.solution && (
                        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-sm sm:text-base text-white font-medium">
                          <span className="font-bold text-white block mb-1">Lời giải chi tiết:</span>
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
                      className="p-5 sm:p-7 rounded-3xl bg-slate-900/90 border-2 border-teal-500/40 shadow-xl space-y-4 text-white"
                    >
                      <div className="font-black text-base sm:text-lg text-white flex items-center gap-2.5">
                        <Globe2 className="w-5 h-5 text-teal-400" />
                        <span>
                          <MathView content={block.title || 'Vận Dụng Thực Tế'} inline />
                        </span>
                      </div>

                      {block.problem && (
                        <div className="text-sm sm:text-base text-white leading-relaxed font-normal">
                          <MathView content={block.problem} />
                        </div>
                      )}

                      {block.solution && (
                        <div className="pt-2">
                          <button
                            onClick={() => toggleAppSolution(key)}
                            className="px-3 py-1.5 rounded-xl bg-teal-600/20 hover:bg-teal-600/40 border border-teal-500/40 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-300" />
                            <span>{showSol ? 'Ẩn Hướng Dẫn' : 'Xem Hướng Dẫn'}</span>
                          </button>
                        </div>
                      )}

                      {showSol && block.solution && (
                        <div className="mt-3 p-4 rounded-2xl bg-teal-950/60 border border-teal-500/40 text-sm sm:text-base text-white font-medium">
                          <span className="font-bold text-white block mb-1">Hướng dẫn giải:</span>
                          <MathView content={block.solution} />
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
                  className="relative w-full group/block"
                >
                  {block.isHidden && (
                    <button
                      type="button"
                      onClick={() =>
                        setManuallyRevealedBlocks((prev) => ({
                          ...prev,
                          [block.id]: false,
                        }))
                      }
                      title="Ẩn lại đối tượng này"
                      className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-full bg-slate-900/90 border border-amber-500/60 hover:bg-amber-600 text-amber-300 hover:text-white text-[11px] font-bold flex items-center gap-1 shadow-lg transition-all cursor-pointer"
                    >
                      <EyeOff className="w-3 h-3 text-amber-300" />
                      <span>Ẩn lại</span>
                    </button>
                  )}
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
          <div
            className={`no-slide-advance z-30 px-3 transition-opacity duration-300 ${
              isFullscreen
                ? 'fixed bottom-4 left-1/2 -translate-x-1/2 max-w-lg w-full ' +
                  (isControlsVisible || isControlsPinned ? 'opacity-100 pointer-events-auto' : 'opacity-25 hover:opacity-100 pointer-events-auto')
                : 'sticky bottom-2 left-0 right-0 mt-8 max-w-xl mx-auto w-full opacity-100'
            }`}
          >
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
