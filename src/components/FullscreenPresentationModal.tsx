import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Minimize2,
  Radio,
  PenTool,
  Eraser,
  Clock,
  Play,
  Pause,
  MessageSquare,
  RotateCcw,
  X,
  Tv,
  Grid,
  Volume2,
  Sparkles,
  Eye,
  EyeOff,
  Pin,
  PinOff,
  SlidersHorizontal,
  Layers,
  Check,
  Type
} from 'lucide-react';
import { Slide, MathLesson } from '../types';
import { MathView } from './MathView';
import { SlideTextBoxOverlay } from './SlideTextBoxOverlay';
import { MediaBlockRenderer } from './MediaBlockRenderer';
import { getSlideBlocks } from '../utils/slideBlocks';

const EMPTY_TEXT_BOXES: any[] = [];

interface FullscreenPresentationModalProps {
  lesson: MathLesson;
  initialSlideIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectSlide?: (index: number) => void;
}

export const FullscreenPresentationModal: React.FC<FullscreenPresentationModalProps> = ({
  lesson,
  initialSlideIndex = 0,
  isOpen,
  onClose,
  onSelectSlide,
}) => {
  const slides = lesson.slides || [];
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlideIndex);
  const [isLaserMode, setIsLaserMode] = useState(false);
  const [isPenMode, setIsPenMode] = useState(false);
  const [penColor, setPenColor] = useState('#facc15'); // default yellow
  const [isBlackScreen, setIsBlackScreen] = useState(false);
  const [isWhiteScreen, setIsWhiteScreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showSlideList, setShowSlideList] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(true);

  // Presentation toolbar & objects visibility states
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false);
  const [isControlsPinned, setIsControlsPinned] = useState(false);
  const [showExtendedTools, setShowExtendedTools] = useState(true);
  const [showObjectsDrawer, setShowObjectsDrawer] = useState(false);

  // Presentation animation step tracking (strictly driven by keyboard arrows / enter)
  const [currentAnimStep, setCurrentAnimStep] = useState(0);
  const [lastTriggeredStep, setLastTriggeredStep] = useState(0);
  const [manuallyRevealedBlocks, setManuallyRevealedBlocks] = useState<Record<string, boolean>>({});
  const [manuallyRevealedBoxIds, setManuallyRevealedBoxIds] = useState<Set<string>>(new Set());
  const lastSlideIndexRef = useRef(initialSlideIndex);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const canvasRectRef = useRef<DOMRect | null>(null);
  const controlsTimeoutRef = useRef<any>(null);

  // Safe current index
  const safeIndex = Math.min(Math.max(0, currentSlideIndex), Math.max(0, slides.length - 1));
  const currentSlide = slides[safeIndex];
  const currentBlocks = currentSlide ? getSlideBlocks(currentSlide) : [];
  const currentTextBoxes = currentSlide?.textBoxes || EMPTY_TEXT_BOXES;
  const slideBgColor = currentSlide?.styleConfig?.backgroundColor || '#103463';

  // Count hidden objects on current slide
  const hiddenBlocksCount = currentBlocks.filter(
    (b) => b.isHidden && !manuallyRevealedBlocks[b.id]
  ).length;
  const hiddenBoxesCount = currentTextBoxes.filter(
    (b) => b.isHidden && !manuallyRevealedBoxIds.has(b.id)
  ).length;
  const totalHiddenCount = hiddenBlocksCount + hiddenBoxesCount;
  const totalObjectsCount = currentBlocks.length + currentTextBoxes.length;

  // Toggle reveal for a specific text box
  const handleToggleBoxReveal = (boxId: string) => {
    setManuallyRevealedBoxIds((prev) => {
      const next = new Set(prev);
      if (next.has(boxId)) {
        next.delete(boxId);
      } else {
        next.add(boxId);
      }
      return next;
    });
  };

  // Toggle reveal for a specific block
  const handleToggleBlockReveal = (blockId: string) => {
    setManuallyRevealedBlocks((prev) => ({
      ...prev,
      [blockId]: !prev[blockId],
    }));
  };

  // Reveal ALL hidden objects on the current slide
  const handleShowAllSlideObjects = () => {
    const revealedBlocksMap: Record<string, boolean> = { ...manuallyRevealedBlocks };
    currentBlocks.forEach((b) => {
      if (b.isHidden) {
        revealedBlocksMap[b.id] = true;
      }
    });
    setManuallyRevealedBlocks(revealedBlocksMap);

    const revealedBoxesSet = new Set(manuallyRevealedBoxIds);
    currentTextBoxes.forEach((b) => {
      if (b.isHidden) {
        revealedBoxesSet.add(b.id);
      }
    });
    setManuallyRevealedBoxIds(revealedBoxesSet);
  };

  // Re-hide all objects that are configured as hidden
  const handleHideDefaultSlideObjects = () => {
    const revealedBlocksMap: Record<string, boolean> = { ...manuallyRevealedBlocks };
    currentBlocks.forEach((b) => {
      if (b.isHidden) {
        revealedBlocksMap[b.id] = false;
      }
    });
    setManuallyRevealedBlocks(revealedBlocksMap);

    const revealedBoxesSet = new Set(manuallyRevealedBoxIds);
    currentTextBoxes.forEach((b) => {
      if (b.isHidden) {
        revealedBoxesSet.delete(b.id);
      }
    });
    setManuallyRevealedBoxIds(revealedBoxesSet);
  };

  // Find and sort all animated text boxes on the current slide
  const animatedBoxes = useMemo(() => {
    if (!currentSlide?.textBoxes) return [];
    return [...currentSlide.textBoxes]
      .filter((b) => b.animation && b.animation !== 'none')
      .sort((a, b) => {
        const orderA = a.animationOrder !== undefined ? a.animationOrder : 999;
        const orderB = b.animationOrder !== undefined ? b.animationOrder : 999;
        if (orderA !== orderB) return orderA - orderB;
        return currentSlide.textBoxes!.indexOf(a) - currentSlide.textBoxes!.indexOf(b);
      });
  }, [currentSlide]);

  const totalAnimSteps = animatedBoxes.length;
  const prevIsOpenRef = useRef(false);
  const lastReportedSlideRef = useRef<number>(initialSlideIndex);

  // Sync initial index ONLY when modal first opens
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setCurrentSlideIndex(initialSlideIndex);
      lastSlideIndexRef.current = initialSlideIndex;
      lastReportedSlideRef.current = initialSlideIndex;
      setCurrentAnimStep(0);
      setLastTriggeredStep(0);
      setElapsedSeconds(0);
      setIsBlackScreen(false);
      setIsWhiteScreen(false);
      setIsPenMode(false);
      setIsLaserMode(false);
      setIsToolbarCollapsed(false);
      setShowObjectsDrawer(false);
      setManuallyRevealedBlocks({});
      setManuallyRevealedBoxIds(new Set());

      // Request browser fullscreen if available
      try {
        if (!document.fullscreenElement) {
          containerRef.current?.requestFullscreen?.().catch(() => {});
        }
      } catch (e) {}
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, initialSlideIndex]);

  // Sync animation step when slide index changes
  useEffect(() => {
    if (!isOpen) return;
    if (safeIndex !== lastSlideIndexRef.current) {
      setManuallyRevealedBlocks({});
      setManuallyRevealedBoxIds(new Set());
      setShowObjectsDrawer(false);
      if (safeIndex > lastSlideIndexRef.current) {
        // Forward navigation: start with all animations on new slide hidden (step 0)
        setCurrentAnimStep(0);
        setLastTriggeredStep(0);
      } else {
        // Backward navigation: previous slide opens with all animations completed
        setCurrentAnimStep(totalAnimSteps);
        setLastTriggeredStep(0);
      }
      lastSlideIndexRef.current = safeIndex;
    }
  }, [safeIndex, isOpen, totalAnimSteps]);

  // Handle native exit fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isOpen) {
        // User pressed browser Esc or exited
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isOpen]);

  // Elapsed timer
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Notify parent on slide change safely without creating re-render loops
  const onSelectSlideRef = useRef(onSelectSlide);
  useEffect(() => {
    onSelectSlideRef.current = onSelectSlide;
  }, [onSelectSlide]);

  useEffect(() => {
    if (isOpen && onSelectSlideRef.current && safeIndex !== lastReportedSlideRef.current) {
      lastReportedSlideRef.current = safeIndex;
      onSelectSlideRef.current(safeIndex);
    }
  }, [safeIndex, isOpen]);

  // Step forward: trigger next animation on current slide, or advance to next slide if all done
  const handleNext = useCallback(() => {
    if (currentAnimStep < totalAnimSteps) {
      const nextStep = currentAnimStep + 1;
      setCurrentAnimStep(nextStep);
      setLastTriggeredStep(nextStep);
    } else {
      if (safeIndex < slides.length - 1) {
        lastSlideIndexRef.current = safeIndex;
        setCurrentSlideIndex((prev) => prev + 1);
        setCurrentAnimStep(0);
        setLastTriggeredStep(0);
      }
    }
  }, [currentAnimStep, totalAnimSteps, safeIndex, slides.length]);

  // Step backward: hide previous animation, or go back to previous slide
  const handlePrev = useCallback(() => {
    if (currentAnimStep > 0) {
      setCurrentAnimStep((prev) => prev - 1);
      setLastTriggeredStep(0);
    } else {
      if (safeIndex > 0) {
        const prevIdx = safeIndex - 1;
        const prevSlide = slides[prevIdx];
        const prevAnimCount = (prevSlide?.textBoxes || []).filter(
          (b) => b.animation && b.animation !== 'none'
        ).length;
        lastSlideIndexRef.current = safeIndex;
        setCurrentSlideIndex(prevIdx);
        setCurrentAnimStep(prevAnimCount);
        setLastTriggeredStep(0);
      }
    }
  }, [currentAnimStep, safeIndex, slides]);

  // Auto-hide controls when idle (unless pinned, collapsed, or drawer active)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isLaserMode) {
      setMousePos({ x: e.clientX, y: e.clientY });
    }
    if (isDrawingRef.current) return;
    if (!isToolbarCollapsed) {
      if (!showControls) {
        setShowControls(true);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        // Don't hide if pen mode, pinned, or drawer is active
        if (!isPenMode && !isControlsPinned && !showObjectsDrawer && !showSlideList && !showNotes) {
          setShowControls(false);
        }
      }, 3500);
    }
  };

  // Keyboard navigation strictly respecting animations
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;

      // Advance: Arrow Right, Arrow Down, Enter, Space, PageDown
      if (key === 'ArrowRight' || key === 'ArrowDown' || key === 'Enter' || key === ' ' || key === 'PageDown') {
        e.preventDefault();
        handleNext();
      }
      // Step back / Previous: Arrow Left, Arrow Up, PageUp, Backspace
      else if (key === 'ArrowLeft' || key === 'ArrowUp' || key === 'PageUp' || key === 'Backspace') {
        e.preventDefault();
        handlePrev();
      } else if (key === 'Home') {
        e.preventDefault();
        lastSlideIndexRef.current = 0;
        setCurrentSlideIndex(0);
        setCurrentAnimStep(0);
        setLastTriggeredStep(0);
      } else if (key === 'End') {
        e.preventDefault();
        const lastIdx = slides.length - 1;
        const lastSlide = slides[lastIdx];
        const lastAnimCount = (lastSlide?.textBoxes || []).filter(
          (b) => b.animation && b.animation !== 'none'
        ).length;
        lastSlideIndexRef.current = lastIdx;
        setCurrentSlideIndex(lastIdx);
        setCurrentAnimStep(lastAnimCount);
        setLastTriggeredStep(0);
      } else if (key === 'b' || key === 'B') {
        e.preventDefault();
        setIsBlackScreen((prev) => !prev);
      } else if (key === 'w' || key === 'W') {
        e.preventDefault();
        setIsWhiteScreen((prev) => !prev);
      } else if (key === 'l' || key === 'L') {
        e.preventDefault();
        setIsLaserMode((prev) => !prev);
        setIsPenMode(false);
      } else if (key === 'p' || key === 'P') {
        e.preventDefault();
        setIsPenMode((prev) => !prev);
        setIsLaserMode(false);
      } else if (key === 'h' || key === 'H') {
        e.preventDefault();
        setIsToolbarCollapsed((prev) => !prev);
        setShowControls(true);
      } else if (key === 'o' || key === 'O') {
        e.preventDefault();
        setShowObjectsDrawer((prev) => !prev);
      } else if (key === 'Escape') {
        e.preventDefault();
        if (showObjectsDrawer) {
          setShowObjectsDrawer(false);
        } else if (showSlideList) {
          setShowSlideList(false);
        } else if (showNotes) {
          setShowNotes(false);
        } else {
          handleClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, slides]);

  const handleClose = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
    onClose();
  };

  // Clear drawings when changing slide
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    lastPointRef.current = null;
    isDrawingRef.current = false;
  }, [safeIndex]);

  // Adjust canvas size & sync coordinates with pixel-perfect precision
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
  }, [isOpen, safeIndex, syncCanvasSize]);

  // High-precision coordinate translation (eliminates any offset under scaling or aspect ratio)
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

  // Drawing canvas logic - Zero-lag, instant pointer response
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPenMode) return;
    syncCanvasSize();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (_) {}

    canvasRectRef.current = canvas.getBoundingClientRect();
    isDrawingRef.current = true;

    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    lastPointRef.current = { x, y };

    // Draw instant sharp mark at pointer position
    ctx.fillStyle = penColor;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPenMode || !isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = penColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Support coalesced events for high-polling rate mice (zero lag, 100% smooth curves)
    const rawEvents = (e.nativeEvent && (e.nativeEvent as any).getCoalescedEvents?.()) || [e];

    for (const ev of rawEvents) {
      const { x, y } = getCanvasCoords(ev.clientX, ev.clientY);
      const last = lastPointRef.current || { x, y };

      // Incremental segment drawing prevents O(N) path accumulation lag
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(x, y);
      ctx.stroke();

      lastPointRef.current = { x, y };
    }
  };

  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  const handleClearDrawing = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    lastPointRef.current = null;
    isDrawingRef.current = false;
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !currentSlide) return null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 z-50 bg-black text-white flex flex-col items-center justify-center select-none overflow-hidden ${
        isLaserMode ? 'cursor-none' : ''
      }`}
    >
      {/* Laser Pointer Dot */}
      {isLaserMode && (
        <div
          className="fixed pointer-events-none z-50 transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
        >
          <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_15px_6px_rgba(239,68,68,0.9)] animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      )}

      {/* Main 16:9 Cinema Projection Stage */}
      <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4 md:p-6">
        <div
          className="relative w-full max-w-[96vw] max-h-[92vh] aspect-video rounded-xl overflow-hidden shadow-2xl flex flex-col justify-between transition-colors duration-200"
          style={{
            backgroundColor: isBlackScreen
              ? '#000000'
              : isWhiteScreen
              ? '#ffffff'
              : slideBgColor,
          }}
        >
          {/* Slide Content (hidden if Black screen) */}
          {!isBlackScreen && !isWhiteScreen && (
            <>
              {/* PowerPoint Floating Text Boxes Overlay */}
              <SlideTextBoxOverlay
                textBoxes={currentSlide.textBoxes || EMPTY_TEXT_BOXES}
                isEditable={false}
                revealedAnimStep={currentAnimStep}
                lastTriggeredStep={lastTriggeredStep}
                externalManuallyRevealedBoxIds={manuallyRevealedBoxIds}
                onToggleRevealBox={handleToggleBoxReveal}
              />

              {/* Render Slide Blocks if any */}
              {currentBlocks.length > 0 && (
                <div className="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto custom-scrollbar space-y-6 text-white font-sans">
                  {currentBlocks.map((b, i) => {
                    const isBlockRevealed = !!manuallyRevealedBlocks[b.id];
                    const isBlockHidden = b.isHidden && !isBlockRevealed;
                    if (isBlockHidden) {
                      return (
                        <div
                          key={`hidden-block-${b.id || i}`}
                          className="p-4 px-6 rounded-2xl bg-slate-900/80 border border-dashed border-amber-500/60 flex items-center justify-between text-sm text-amber-200/90 shadow-lg backdrop-blur-sm group hover:border-amber-400 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 font-bold">
                            <EyeOff className="w-5 h-5 text-amber-400 shrink-0" />
                            <span>Đối tượng [{b.title || 'Khối nội dung'}] đang bị ẩn</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleBlockReveal(b.id)}
                            title="Nhấp để hiển thị đối tượng này"
                            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Hiện đối tượng</span>
                          </button>
                        </div>
                      );
                    }

                    return (
                    <div key={b.id || i} className="relative space-y-4 group/item">
                      {b.isHidden && (
                        <button
                          type="button"
                          onClick={() => handleToggleBlockReveal(b.id)}
                          title="Ẩn lại đối tượng này"
                          className="absolute -top-3 right-0 z-20 px-2.5 py-1 rounded-full bg-slate-900/90 border border-amber-500/60 hover:bg-amber-600 text-amber-300 hover:text-white text-xs font-bold flex items-center gap-1 shadow-lg transition-all cursor-pointer"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Ẩn lại</span>
                        </button>
                      )}
                      {/* 1. Lesson Title */}
                      {b.type === 'lesson_title' && (
                        <div className="border-b border-white/20 pb-5 space-y-2">
                          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-amber-300 tracking-tight">
                            <MathView text={b.title || ''} as="span" />
                          </h1>
                          {b.subtitle && (
                            <div className="text-lg sm:text-xl text-white/90 font-medium">
                              <MathView text={b.subtitle} />
                            </div>
                          )}
                        </div>
                      )}

                      {/* 2. Opening Problem */}
                      {b.type === 'opening_problem' && (
                        <div className="p-6 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-3">
                          <div className="text-sm font-black text-amber-400 uppercase tracking-wider">
                            {b.title || 'BÀI TOÁN MỞ ĐẦU'}
                          </div>
                          <div className="text-lg sm:text-xl text-white leading-relaxed">
                            <MathView text={b.context || b.content || ''} />
                          </div>
                        </div>
                      )}

                      {/* 3. Content / Theory */}
                      {b.type === 'content' && (
                        <div className="p-6 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-3">
                          {b.title && (
                            <div className="text-base font-black text-purple-300 uppercase tracking-wider">
                              {b.title}
                            </div>
                          )}
                          <div className="text-lg sm:text-xl text-white leading-relaxed">
                            <MathView text={b.content || ''} />
                          </div>
                        </div>
                      )}

                      {/* 4. SGK Takeaway */}
                      {b.type === 'takeaway' && (
                        <div className="p-6 rounded-2xl bg-indigo-950/50 border-2 border-indigo-500/50 space-y-3 shadow-lg">
                          <div className="text-base font-black text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                            <span>📌</span>
                            <span>{b.title || 'GHI NHỚ TRỌNG TÂM SGK'}</span>
                          </div>
                          <div className="text-lg sm:text-xl text-white font-medium leading-relaxed">
                            <MathView text={b.content || ''} />
                          </div>
                        </div>
                      )}

                      {/* 5. Example */}
                      {b.type === 'example' && (
                        <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-4">
                          <div className="text-base font-black text-emerald-300 uppercase tracking-wider">
                            {b.title || 'VÍ DỤ MINH HỌA'}
                          </div>
                          <div className="text-lg sm:text-xl text-white">
                            <MathView text={b.problem || ''} />
                          </div>
                          {b.solutionSteps && b.solutionSteps.length > 0 && (
                            <div className="space-y-2 pt-3 border-t border-emerald-500/30">
                              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                                Các bước giải:
                              </span>
                              {b.solutionSteps.map((step, idx) => (
                                <div
                                  key={idx}
                                  className="text-base sm:text-lg text-emerald-100 flex items-start gap-2"
                                >
                                  <span className="text-emerald-400 font-bold">•</span>
                                  <div>
                                    <MathView text={step} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 6. Practice */}
                      {b.type === 'practice' && (
                        <div className="p-6 rounded-2xl bg-sky-950/40 border border-sky-500/40 space-y-3">
                          <div className="text-base font-black text-sky-300 uppercase tracking-wider">
                            {b.title || 'LUYỆN TẬP'}
                          </div>
                          <div className="text-lg sm:text-xl text-white">
                            <MathView text={b.problem || ''} />
                          </div>
                        </div>
                      )}

                      {/* 7. Image */}
                      {b.type === 'image' && b.imageUrl && (
                        <div className="flex flex-col items-center justify-center my-4">
                          <img
                            src={b.imageUrl}
                            alt={b.imageAlt || ''}
                            className="max-h-[60vh] object-contain rounded-2xl shadow-xl border border-white/10"
                          />
                          {b.imageCaption && (
                            <div className="text-sm text-white/80 italic mt-2 text-center">
                              <MathView text={b.imageCaption} />
                            </div>
                          )}
                        </div>
                      )}

                      {/* 8. Media (Video / Audio) */}
                      {b.type === 'media' && (
                        <div className="my-4">
                          <MediaBlockRenderer block={b} />
                        </div>
                      )}

                      {/* 9. Activity & Objectives & Application & Note */}
                      {b.type === 'activity' && (
                        <div className="p-6 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-3">
                          <div className="text-base font-black text-amber-300 uppercase tracking-wider">
                            {b.title || 'HOẠT ĐỘNG KHÁM PHÁ'}
                          </div>
                          {(b.description || b.context) && (
                            <div className="text-lg text-white leading-relaxed">
                              <MathView text={b.description || b.context || ''} />
                            </div>
                          )}
                          {b.question && (
                            <div className="text-base font-semibold text-amber-200 pt-2 border-t border-amber-500/30">
                              ❓ <MathView text={b.question} />
                            </div>
                          )}
                          {b.conclusion && (
                            <div className="text-base font-bold text-amber-100 bg-amber-900/30 p-3 rounded-xl border border-amber-500/30">
                              💡 <MathView text={b.conclusion} />
                            </div>
                          )}
                        </div>
                      )}

                      {b.type === 'note' && (
                        <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-2">
                          <div className="text-base font-black text-rose-300 uppercase tracking-wider">
                            ⚠️ {b.title || 'CHÚ Ý'}
                          </div>
                          {b.content && (
                            <div className="text-lg text-white leading-relaxed">
                              <MathView text={b.content} />
                            </div>
                          )}
                        </div>
                      )}

                      {b.type === 'application' && (
                        <div className="p-6 rounded-2xl bg-teal-950/40 border border-teal-500/40 space-y-3">
                          <div className="text-base font-black text-teal-300 uppercase tracking-wider">
                            🌍 {b.title || 'VẬN DỤNG THỰC TẾ'}
                          </div>
                          {b.problem && (
                            <div className="text-lg text-white leading-relaxed">
                              <MathView text={b.problem} />
                            </div>
                          )}
                          {b.solution && (
                            <div className="text-base text-teal-100 pt-2 border-t border-teal-500/30">
                              <span className="font-bold text-teal-300">Hướng dẫn: </span>
                              <MathView text={b.solution} />
                            </div>
                          )}
                        </div>
                      )}

                      {b.type === 'objectives' && (
                        <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
                          <div className="text-base font-black text-emerald-300 uppercase tracking-wider">
                            🎯 {b.title || 'MỤC TIÊU BÀI HỌC'}
                          </div>
                          {b.items && b.items.length > 0 && (
                            <ul className="space-y-2 text-lg text-white">
                              {b.items.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2.5">
                                  <span className="text-emerald-400 font-bold">✓</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                </div>
              )}
            </>
          )}

          {/* Interactive Annotation Pen Canvas */}
          <canvas
            ref={canvasRef}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handleCanvasPointerUp}
            onPointerCancel={handleCanvasPointerUp}
            onPointerLeave={handleCanvasPointerUp}
            style={{ touchAction: 'none' }}
            className={`absolute inset-0 w-full h-full z-20 ${
              isPenMode ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'
            }`}
          />
        </div>
      </div>

      {/* Collapsed Mini HUD Trigger (Hiện lại khi đã bấm Ẩn thanh) */}
      {isToolbarCollapsed && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
          <button
            onClick={() => {
              setIsToolbarCollapsed(false);
              setShowControls(true);
            }}
            title="Hiện thanh công cụ trình chiếu (Phím H)"
            className="px-3.5 py-1.5 rounded-full bg-slate-900/95 hover:bg-indigo-600 border border-slate-700/80 hover:border-indigo-400 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-2 backdrop-blur-xl shadow-2xl transition-all cursor-pointer hover:scale-105 active:scale-95 group"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-400 group-hover:text-white transition-colors" />
            <span>Hiện thanh công cụ (H)</span>
          </button>

          {totalHiddenCount > 0 && (
            <button
              onClick={() => {
                setIsToolbarCollapsed(false);
                setShowControls(true);
                setShowObjectsDrawer(true);
              }}
              title="Có đối tượng đang ẩn trên slide này. Nhấp để quản lý"
              className="px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xl transition-all hover:scale-105"
            >
              <EyeOff className="w-3.5 h-3.5 text-slate-950" />
              <span>{totalHiddenCount} đối tượng ẩn</span>
            </button>
          )}
        </div>
      )}

      {/* Floating Presentation HUD / Toolbar */}
      <div
        className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${
          showControls && !isToolbarCollapsed
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-12 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-2xl backdrop-blur-xl shadow-2xl text-white">
          {/* Prev Slide / Prev Animation Step */}
          <button
            onClick={handlePrev}
            disabled={safeIndex === 0 && currentAnimStep === 0}
            title="Lùi lại: Quay lại hiệu ứng trước hoặc Slide trước (Phím ←, ↑, Backspace)"
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Slide Indicator & Quick Jump Button */}
          <button
            onClick={() => setShowSlideList(!showSlideList)}
            title="Danh sách tất cả slide"
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm font-mono font-bold flex items-center gap-1.5 transition-colors"
          >
            <Grid className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              {safeIndex + 1} / {slides.length}
            </span>
            {totalAnimSteps > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-600/80 text-purple-200 font-sans font-medium">
                Hiệu ứng {currentAnimStep}/{totalAnimSteps}
              </span>
            )}
          </button>

          {/* Next Slide / Next Animation Step */}
          <button
            onClick={handleNext}
            disabled={safeIndex === slides.length - 1 && currentAnimStep >= totalAnimSteps}
            title="Tiếp tục: Chạy hiệu ứng tiếp theo hoặc Sang slide mới (Phím →, ↓, Enter)"
            className="p-1.5 sm:p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="h-5 w-px bg-slate-700/80 mx-1 hidden sm:block" />

          {/* NÚT ẨN / HIỆN ĐỐI TƯỢNG TRÊN SLIDE (Text Box, Khối SGK, Hình ảnh) */}
          <button
            onClick={() => setShowObjectsDrawer(!showObjectsDrawer)}
            title="Ẩn / Hiện các đối tượng trên slide (Phím O) - Mở bảng quản lý hiển thị"
            className={`p-1.5 sm:p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
              showObjectsDrawer || totalHiddenCount > 0
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/40 ring-1 ring-amber-400'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
            }`}
          >
            {totalHiddenCount > 0 ? (
              <EyeOff className="w-4 h-4 text-amber-200" />
            ) : (
              <Eye className="w-4 h-4 text-amber-400" />
            )}
            <span className="hidden md:inline">Đối Tượng</span>
            {totalHiddenCount > 0 ? (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-300 text-slate-950 text-[10px] font-black">
                {totalHiddenCount} ẩn
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 hidden xl:inline">({totalObjectsCount})</span>
            )}
          </button>

          {/* NÚT ẨN / HIỆN CÁC PHÍM CÔNG CỤ TRONG THANH (Laser, Bút, B/W, Phím nhắc, v.v.) */}
          <button
            onClick={() => setShowExtendedTools(!showExtendedTools)}
            title={showExtendedTools ? "Thu gọn bớt các phím phụ trên thanh này" : "Hiện đầy đủ tất cả các phím công cụ"}
            className={`p-1.5 sm:p-2 rounded-xl transition-all flex items-center gap-1 text-xs font-bold ${
              !showExtendedTools ? 'bg-indigo-600/40 text-indigo-300 border border-indigo-500/50' : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            <span className="hidden xl:inline text-[11px]">{showExtendedTools ? 'Thu gọn' : 'Phím phụ'}</span>
          </button>

          {/* CÁC PHÍM CÔNG CỤ PHỤ (Có thể bật/tắt bằng nút SlidersHorizontal) */}
          {showExtendedTools && (
            <>
              <div className="h-5 w-px bg-slate-700/80 mx-1 hidden sm:block" />

              {/* Laser Pointer Toggle */}
              <button
                onClick={() => {
                  setIsLaserMode(!isLaserMode);
                  if (!isLaserMode) setIsPenMode(false);
                }}
                title="Con trỏ Laser đỏ (Phím L)"
                className={`p-1.5 sm:p-2 rounded-xl transition-all flex items-center gap-1 text-xs font-bold ${
                  isLaserMode
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/50 ring-2 ring-rose-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Radio className="w-4 h-4 text-rose-400" />
                <span className="hidden md:inline">Laser</span>
              </button>

              {/* Annotation Pen Toggle */}
              <button
                onClick={() => {
                  setIsPenMode(!isPenMode);
                  if (!isPenMode) setIsLaserMode(false);
                }}
                title="Bút vẽ trực tiếp lên slide (Phím P)"
                className={`p-1.5 sm:p-2 rounded-xl transition-all flex items-center gap-1 text-xs font-bold ${
                  isPenMode
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/50 ring-2 ring-amber-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <PenTool className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">Bút Vẽ</span>
              </button>

              {/* Pen Color Chooser & Clear if Pen is Active */}
              {isPenMode && (
                <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-xl border border-slate-700">
                  {['#facc15', '#ef4444', '#10b981', '#ffffff'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setPenColor(color)}
                      className={`w-4 h-4 rounded-full transition-transform ${
                        penColor === color ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <button
                    onClick={handleClearDrawing}
                    title="Xóa tất cả nét vẽ"
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 ml-1"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="h-5 w-px bg-slate-700/80 mx-1 hidden sm:block" />

              {/* Black Screen (B) */}
              <button
                onClick={() => setIsBlackScreen(!isBlackScreen)}
                title="Màn hình đen tạm thời (Phím B)"
                className={`p-1.5 sm:p-2 rounded-xl text-xs font-bold transition-all ${
                  isBlackScreen ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                B
              </button>

              {/* White Screen (W) */}
              <button
                onClick={() => setIsWhiteScreen(!isWhiteScreen)}
                title="Bảng trắng ghi chú (Phím W)"
                className={`p-1.5 sm:p-2 rounded-xl text-xs font-bold transition-all ${
                  isWhiteScreen ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                W
              </button>

              {/* Teacher Guide Speech Notes Toggle */}
              {currentSlide.teacherSpeechGuide && (
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  title="Xem lời thoại hướng dẫn giảng dạy"
                  className={`p-1.5 sm:p-2 rounded-xl transition-all ${
                    showNotes ? 'bg-amber-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              )}

              {/* Keyboard Hint: Arrows & Enter */}
              <div
                title="Dùng phím mũi tên [←] [→] hoặc [Enter] để chạy hiệu ứng từng bước"
                className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-slate-950/70 border border-slate-700/60 rounded-xl text-slate-300 text-xs font-mono select-none"
              >
                <span className="text-amber-300 font-bold">Phím: [→] [Enter]</span>
                <span className="text-[11px] text-slate-400">chạy hiệu ứng</span>
              </div>

              {/* Presentation Timer */}
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/70 rounded-xl text-slate-300 text-xs font-mono">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{formatTimer(elapsedSeconds)}</span>
              </div>
            </>
          )}

          <div className="h-5 w-px bg-slate-700/80 mx-1" />

          {/* GHIM / BỎ GHIM THANH CÔNG CỤ */}
          <button
            onClick={() => {
              setIsControlsPinned(!isControlsPinned);
              if (!isControlsPinned) setShowControls(true);
            }}
            title={isControlsPinned ? "Bỏ ghim (thanh sẽ tự ẩn sau 3.5s khi không di chuột)" : "Ghim thanh luôn hiển thị trên màn hình"}
            className={`p-1.5 sm:p-2 rounded-xl transition-all flex items-center gap-1 text-xs font-bold ${
              isControlsPinned ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50' : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {isControlsPinned ? <PinOff className="w-4 h-4 text-amber-400" /> : <Pin className="w-4 h-4" />}
          </button>

          {/* NÚT ẨN TOÀN BỘ THANH CÔNG CỤ (Ẩn các đối tượng trong ảnh) */}
          <button
            onClick={() => setIsToolbarCollapsed(true)}
            title="Ẩn thanh công cụ trình chiếu (Phím H) - Bấm H hoặc nhấp góc dưới để hiện lại"
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <EyeOff className="w-4 h-4 text-slate-300" />
            <span className="hidden lg:inline text-[11px]">Ẩn thanh (H)</span>
          </button>

          {/* Exit Fullscreen */}
          <button
            onClick={handleClose}
            title="Thoát trình chiếu (Phím Esc)"
            className="p-1.5 sm:p-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors"
          >
            <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* BẢNG QUẢN LÝ ẨN / HIỆN ĐỐI TƯỢNG TRÊN SLIDE */}
      {showObjectsDrawer && (
        <div className="fixed inset-x-4 bottom-20 z-40 max-w-3xl mx-auto bg-slate-900/98 border border-slate-700/80 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl text-white animate-in fade-in slide-in-from-bottom-6 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Ẩn / Hiện Đối Tượng Trên Slide</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    Slide {safeIndex + 1}/{slides.length}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Bật/tắt hiển thị từng Text Box, khối bài học hoặc hiện toàn bộ tức thì
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                totalHiddenCount > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {totalHiddenCount > 0 ? `${totalHiddenCount} đối tượng đang ẩn` : 'Tất cả đối tượng đang hiện'}
              </span>
              <button
                onClick={() => setShowObjectsDrawer(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                title="Đóng bảng quản lý"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-950/70 rounded-2xl border border-slate-800/80 mb-3">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tổng số: <strong className="text-white">{totalObjectsCount}</strong> đối tượng trên slide</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShowAllSlideObjects}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                title="Hiển thị toàn bộ các khối và Text Box đang ẩn trên slide này"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Hiện tất cả đối tượng</span>
              </button>

              <button
                onClick={handleHideDefaultSlideObjects}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Ẩn lại các đối tượng được cài đặt ẩn mặc định"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Ẩn lại mặc định</span>
              </button>
            </div>
          </div>

          {/* Objects List */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2 pr-1">
            {totalObjectsCount === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 italic">
                Slide này chưa có đối tượng Text Box hoặc khối nội dung nào.
              </div>
            ) : (
              <>
                {/* 1. PowerPoint Text Boxes */}
                {currentTextBoxes.map((box, bIdx) => {
                  const isRevealed = manuallyRevealedBoxIds.has(box.id);
                  const isHidden = box.isHidden && !isRevealed;
                  const previewText = box.text?.replace(/<[^>]*>?/gm, '').trim() || `Text Box #${bIdx + 1}`;

                  return (
                    <div
                      key={`obj-tb-${box.id}`}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                        isHidden
                          ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                          <Type className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white truncate max-w-[280px] sm:max-w-md">
                              {previewText}
                            </span>
                            {box.animation && box.animation !== 'none' && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                #{box.animationOrder || bIdx + 1}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            PowerPoint Text Box {box.isHidden ? '• Mặc định ẩn' : '• Mặc định hiện'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isHidden ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {isHidden ? 'Đang ẩn' : 'Đang hiện'}
                        </span>
                        <button
                          onClick={() => handleToggleBoxReveal(box.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isHidden
                              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md'
                              : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                          }`}
                          title={isHidden ? 'Hiện Text Box này' : 'Ẩn Text Box này'}
                        >
                          {isHidden ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Hiện</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Ẩn</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* 2. Slide Content Blocks */}
                {currentBlocks.map((b, bIdx) => {
                  const isRevealed = manuallyRevealedBlocks[b.id];
                  const isHidden = b.isHidden && !isRevealed;
                  const blockTitle = b.title || b.type || `Khối #${bIdx + 1}`;

                  return (
                    <div
                      key={`obj-block-${b.id || bIdx}`}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                        isHidden
                          ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 text-xs font-bold">
                          {bIdx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white truncate max-w-[280px] sm:max-w-md">
                              {blockTitle}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 uppercase">
                              {b.type}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Khối nội dung {b.isHidden ? '• Mặc định ẩn' : '• Mặc định hiện'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isHidden ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {isHidden ? 'Đang ẩn' : 'Đang hiện'}
                        </span>
                        <button
                          onClick={() => handleToggleBlockReveal(b.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isHidden
                              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md'
                              : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                          }`}
                          title={isHidden ? 'Hiện khối đối tượng này' : 'Ẩn khối đối tượng này'}
                        >
                          {isHidden ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Hiện</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Ẩn</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating Teacher Guide Notes Drawer */}
      {showNotes && currentSlide.teacherSpeechGuide && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-11/12 bg-amber-950/90 border border-amber-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-2 border-b border-amber-500/30 mb-2">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              Lời Thoại Giảng Dạy (Slide {safeIndex + 1})
            </span>
            <button
              onClick={() => setShowNotes(false)}
              className="text-amber-400 hover:text-amber-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-amber-100 italic leading-relaxed">
            "{currentSlide.teacherSpeechGuide}"
          </p>
        </div>
      )}

      {/* Slide Quick Jump Drawer */}
      {showSlideList && (
        <div className="fixed inset-x-4 bottom-24 z-40 max-w-4xl mx-auto bg-slate-900/95 border border-slate-700 rounded-3xl p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <Tv className="w-4 h-4 text-indigo-400" />
              Nhảy nhanh tới Slide ({slides.length} slides)
            </span>
            <button
              onClick={() => setShowSlideList(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-48 overflow-y-auto custom-scrollbar p-1">
            {slides.map((s, idx) => {
              const isActive = idx === safeIndex;
              const firstTextBox = s.textBoxes?.find((b) => b.text?.trim())?.text;
              return (
                <button
                  key={s.id || idx}
                  onClick={() => {
                    setCurrentSlideIndex(idx);
                    setShowSlideList(false);
                  }}
                  className={`aspect-video rounded-xl p-2 flex flex-col justify-between text-left transition-all border ${
                    isActive
                      ? 'border-indigo-500 ring-2 ring-indigo-500/50 bg-indigo-950/60 shadow-lg scale-105'
                      : 'border-slate-700 bg-slate-800 hover:border-slate-500'
                  }`}
                  style={{ backgroundColor: s.styleConfig?.backgroundColor || '#103463' }}
                >
                  <span className="text-[9px] font-bold text-white/60">Slide {idx + 1}</span>
                  <span className="text-[10px] font-semibold text-white truncate line-clamp-1">
                    {firstTextBox || s.title || `Trang ${idx + 1}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
