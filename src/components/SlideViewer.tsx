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
  Edit3,
  RotateCcw,
  Eye,
  Layers,
  Printer,
  Volume2,
  Clock,
  ListOrdered,
  X,
  FileText,
  Trash2,
  Copy,
  Plus,
  Type,
  Palette,
  Image as ImageIcon,
  ZoomIn,
  Move,
  Sliders,
  Target,
  Compass,
  Bookmark,
  Dumbbell,
  Globe2,
  HelpCircle as QuestionIcon,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Slide, MathLesson, SlideImage, SlideStyleConfig } from '../types';
import { MathView } from './MathView';
import { SlideEditModal } from './SlideEditModal';
import { DeleteSlideModal } from './DeleteSlideModal';
import { SlideImageModal } from './SlideImageModal';
import { BLOCK_TYPES_META, getSectionBlocks, getSlideBlocks } from '../utils/slideBlocks';

interface SlideViewerProps {
  lesson: MathLesson;
  onUpdateSlide?: (updatedSlide: Slide) => void;
  onDeleteSlide?: (slideId: string) => void;
  onAddSlide?: (newSlide: Slide, insertAfterIndex?: number) => void;
}

export const SlideViewer: React.FC<SlideViewerProps> = ({
  lesson,
  onUpdateSlide,
  onDeleteSlide,
  onAddSlide,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [revealedSteps, setRevealedSteps] = useState<{ [slideId: string]: number }>({});
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [showTeacherNotes, setShowTeacherNotes] = useState(false);
  const [showSlideListModal, setShowSlideListModal] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const [showStyleQuickBar, setShowStyleQuickBar] = useState(false);
  
  // Modals for editing, deleting, and image management
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [slideForAction, setSlideForAction] = useState<Slide | null>(null);
  const [zoomedImage, setZoomedImage] = useState<SlideImage | null>(null);

  const [activeColor, setActiveColor] = useState<string>('#ef4444'); // red pen

  const [practiceToggles, setPracticeToggles] = useState<{ [key: string]: boolean }>({});
  const [appToggles, setAppToggles] = useState<{ [key: string]: boolean }>({});

  const togglePracticeKey = (key: string) => {
    setPracticeToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAppKey = (key: string) => {
    setAppToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  // Safety check if slide index is within range
  const safeIndex = Math.min(Math.max(0, currentSlideIndex), Math.max(0, lesson.slides.length - 1));
  const currentSlide = lesson.slides[safeIndex] || lesson.slides[0];

  // Adjust currentSlideIndex if slides count changes
  useEffect(() => {
    if (currentSlideIndex >= lesson.slides.length) {
      setCurrentSlideIndex(Math.max(0, lesson.slides.length - 1));
    }
  }, [lesson.slides.length, currentSlideIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditModalOpen || isDeleteModalOpen || isImageModalOpen || showSlideListModal || showPrintView || zoomedImage) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        goToNextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrevSlide();
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentSlideIndex(0);
        clearCanvas();
      } else if (e.key === 'End') {
        e.preventDefault();
        setCurrentSlideIndex(lesson.slides.length - 1);
        clearCanvas();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, lesson.slides.length, isEditModalOpen, isDeleteModalOpen, isImageModalOpen, showSlideListModal, showPrintView, zoomedImage]);

  // Handle Canvas Resize & Drawing
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
  }, [isFullscreen, currentSlideIndex]);

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
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || !isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = activeColor;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const goToNextSlide = () => {
    if (currentSlideIndex < lesson.slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
      clearCanvas();
    }
  };

  const goToPrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
      clearCanvas();
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Step-by-step reveal logic for examples
  const currentStep = revealedSteps[currentSlide?.id] ?? 1;
  const handleRevealNextStep = (totalSteps: number) => {
    setRevealedSteps((prev) => ({
      ...prev,
      [currentSlide.id]: Math.min(totalSteps, currentStep + 1),
    }));
  };

  const handleResetSteps = () => {
    setRevealedSteps((prev) => ({
      ...prev,
      [currentSlide.id]: 1,
    }));
  };

  // Slide CRUD actions
  const handleOpenEditCurrentSlide = (targetSlide?: Slide) => {
    setSlideForAction(targetSlide || currentSlide);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteCurrentSlide = (targetSlide?: Slide) => {
    setSlideForAction(targetSlide || currentSlide);
    setIsDeleteModalOpen(true);
  };

  const handleSaveSlideEdit = (updatedSlide: Slide) => {
    if (onUpdateSlide) {
      onUpdateSlide(updatedSlide);
    }
  };

  const handleConfirmDelete = (slideId: string) => {
    if (onDeleteSlide) {
      onDeleteSlide(slideId);
      if (currentSlideIndex >= lesson.slides.length - 1) {
        setCurrentSlideIndex(Math.max(0, lesson.slides.length - 2));
      }
      clearCanvas();
    }
  };

  const handleDuplicateSlide = (targetSlide?: Slide) => {
    const slideToCopy = targetSlide || currentSlide;
    if (!slideToCopy || !onAddSlide) return;

    const newSlideId = `slide_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const duplicated: Slide = {
      ...JSON.parse(JSON.stringify(slideToCopy)),
      id: newSlideId,
      title: `${slideToCopy.title} (Bản sao)`,
      slideNumber: slideToCopy.slideNumber + 1,
    };

    const targetIdx = lesson.slides.findIndex((s) => s.id === slideToCopy.id);
    onAddSlide(duplicated, targetIdx >= 0 ? targetIdx : currentSlideIndex);
    setCurrentSlideIndex(targetIdx >= 0 ? targetIdx + 1 : currentSlideIndex + 1);
    clearCanvas();
  };

  const handleAddNewSlide = () => {
    if (!onAddSlide) return;
    const newSlideId = `slide_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newSlide: Slide = {
      id: newSlideId,
      slideNumber: currentSlideIndex + 2,
      title: 'Tiêu Đề Slide Mới',
      subtitle: 'Mô tả nội dung trọng tâm...',
      category: 'method',
      layout: 'standard',
      keyFormula: '',
      suggestedDurationMin: 5,
      teacherSpeechGuide: 'Gợi ý lời giảng của giáo viên cho slide này...',
      chalkboardNotes: 'Ghi chú bảng đen tương ứng...',
      sections: [
        {
          title: '1. Kiến Thức Trọng Tâm',
          content: 'Nhập nội dung giảng dạy với công thức $LaTeX$ tại đây...',
          bulletPoints: ['Ý thứ nhất...', 'Ý thứ hai...'],
        },
      ],
      styleConfig: {
        fontFamily: 'sans',
        fontSize: 'base',
        textColor: '#e2e8f0',
        titleColor: '#ffffff',
        subtitleColor: '#94a3b8',
      },
    };

    onAddSlide(newSlide, currentSlideIndex);
    setCurrentSlideIndex(currentSlideIndex + 1);
    clearCanvas();
  };

  // Quick Style Update Handler
  const handleQuickStyleUpdate = (updates: Partial<SlideStyleConfig>) => {
    if (!onUpdateSlide || !currentSlide) return;
    const currentConfig = currentSlide.styleConfig || {
      fontFamily: 'sans',
      fontSize: 'base',
      textColor: '#e2e8f0',
      titleColor: '#ffffff',
      subtitleColor: '#94a3b8',
    };
    const updatedSlide: Slide = {
      ...currentSlide,
      styleConfig: {
        ...currentConfig,
        ...updates,
      },
    };
    onUpdateSlide(updatedSlide);
  };

  // Image insertion and management
  const handleAddImageToSlide = (newImage: SlideImage) => {
    if (!onUpdateSlide || !currentSlide) return;
    const existingImages = currentSlide.images || [];
    const updatedSlide: Slide = {
      ...currentSlide,
      images: [...existingImages, newImage],
    };
    onUpdateSlide(updatedSlide);
  };

  const handleDeleteImageFromSlide = (imageId: string) => {
    if (!onUpdateSlide || !currentSlide) return;
    const existingImages = currentSlide.images || [];
    const updatedSlide: Slide = {
      ...currentSlide,
      images: existingImages.filter((img) => img.id !== imageId),
    };
    onUpdateSlide(updatedSlide);
  };

  const getCategoryBadge = (category: Slide['category']) => {
    switch (category) {
      case 'intro':
        return { label: 'Khởi Động', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'definition':
        return { label: 'Định Nghĩa', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'theorem':
        return { label: 'Định Lý & Công Thức', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'method':
        return { label: 'Phương Pháp Giải', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'example':
        return { label: 'Ví Dụ Minh Họa', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      case 'application':
        return { label: 'Ứng Dụng Thực Tiễn', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      case 'summary':
        return { label: 'Tổng Kết Tiết Học', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      default:
        return { label: 'Kiến Thức Trọng Tâm', bg: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
    }
  };

  const badge = getCategoryBadge(currentSlide?.category);

  // Typography class calculations
  const styleConfig = currentSlide?.styleConfig || {};
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

  const sizeClass =
    styleConfig.fontSize === 'sm'
      ? 'text-sm'
      : styleConfig.fontSize === 'lg'
      ? 'text-lg'
      : styleConfig.fontSize === 'xl'
      ? 'text-xl'
      : 'text-base';

  const titleColor = styleConfig.titleColor || '#ffffff';
  const subtitleColor = styleConfig.subtitleColor || '#94a3b8';
  const textColor = styleConfig.textColor || '#e2e8f0';

  // Group images by position
  const images = currentSlide?.images || [];
  const topImages = images.filter((img) => img.position === 'top');
  const leftImages = images.filter((img) => img.position === 'left');
  const rightImages = images.filter((img) => img.position === 'right');
  const centerImages = images.filter((img) => !img.position || img.position === 'center');

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-slate-950 text-slate-100 ${
        isFullscreen ? 'fixed inset-0 z-50 p-6' : 'min-h-[78vh] p-4 lg:p-6'
      }`}
    >
      {/* Top Slide Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 backdrop-blur-md shadow-lg">
        {/* Left: Slide Number & Category */}
        <div className="flex items-center gap-2.5">
          <div className="px-3 py-1 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-mono font-bold text-xs">
            Slide {currentSlideIndex + 1} / {lesson.slides.length}
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bg}`}>
            {badge.label}
          </span>
          {currentSlide?.suggestedDurationMin && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
              <Clock className="w-3 h-3 text-slate-500" />
              {currentSlide.suggestedDurationMin} phút
            </span>
          )}
        </div>

        {/* Center: Slide selector pills */}
        <div className="hidden md:flex items-center gap-1.5 overflow-x-auto max-w-sm lg:max-w-md py-1 custom-scrollbar">
          {lesson.slides.map((s, idx) => (
            <button
              key={s.id || idx}
              onClick={() => {
                setCurrentSlideIndex(idx);
                clearCanvas();
              }}
              title={s.title}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-mono text-xs font-bold transition-all flex-shrink-0 ${
                idx === currentSlideIndex
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40 ring-2 ring-indigo-400'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {/* Right Tools Group: Drawing, Speech, Outline, Edit, Delete, Fullscreen */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Quick Typography & Image Toggle */}
          <button
            onClick={() => setShowStyleQuickBar(!showStyleQuickBar)}
            title="Đổi Font, Cỡ Chữ & Màu Sắc Chữ Nhanh"
            className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              showStyleQuickBar
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30 ring-1 ring-pink-400'
                : 'bg-slate-800 text-pink-300 hover:bg-slate-700'
            }`}
          >
            <Type className="w-4 h-4" />
            <span className="hidden sm:inline">Font & Màu</span>
          </button>

          {/* Quick Insert Image Button */}
          <button
            onClick={() => setIsImageModalOpen(true)}
            title="Chèn thêm hình ảnh sơ đồ từ máy hoặc liên kết"
            className="p-2 rounded-xl bg-slate-800 hover:bg-cyan-600/20 text-cyan-300 hover:text-cyan-200 border border-slate-700 hover:border-cyan-500/40 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <ImageIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Chèn Ảnh ({images.length})</span>
          </button>

          {/* Drawing Tool */}
          <button
            onClick={() => setIsDrawingMode(!isDrawingMode)}
            title="Bút vẽ & Chú thích trực tiếp lên Slide"
            className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              isDrawingMode
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-1 ring-rose-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span className="hidden xl:inline">{isDrawingMode ? 'Đang Vẽ' : 'Bút Vẽ'}</span>
          </button>

          {isDrawingMode && (
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
              {['#ef4444', '#eab308', '#22c55e', '#3b82f6', '#ffffff'].map((color) => (
                <button
                  key={color}
                  onClick={() => setActiveColor(color)}
                  className={`w-4 h-4 rounded-full border border-white/40 ${
                    activeColor === color ? 'ring-2 ring-white scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <button
                onClick={clearCanvas}
                title="Xóa nét vẽ"
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <Eraser className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Teacher Speech Guide Drawer */}
          <button
            onClick={() => setShowTeacherNotes(!showTeacherNotes)}
            title="Lời dẫn giảng & Ghi chú viết bảng"
            className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              showTeacherNotes
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-amber-300" />
            <span className="hidden xl:inline">Lời Giảng</span>
          </button>

          {/* Slide List Outline Button */}
          <button
            onClick={() => setShowSlideListModal(true)}
            title="Xem danh sách toàn bộ Slide & Quản lý"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <ListOrdered className="w-4 h-4" />
            <span className="hidden sm:inline">Mục Lục ({lesson.slides.length})</span>
          </button>

          {/* Print Handout Button */}
          <button
            onClick={() => setShowPrintView(!showPrintView)}
            title="In / Xem toàn bộ bài giảng dạng Handout"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors hidden md:flex"
          >
            <Printer className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-700 mx-0.5 hidden sm:block" />

          {/* EDIT SLIDE BUTTON */}
          <button
            onClick={() => handleOpenEditCurrentSlide(currentSlide)}
            title="Chỉnh sửa chi tiết nội dung, công thức, ví dụ của slide này"
            className="px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 hover:border-indigo-500 text-indigo-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold shadow"
          >
            <Edit3 className="w-4 h-4 text-indigo-300" />
            <span>Sửa Slide</span>
          </button>

          {/* DUPLICATE SLIDE BUTTON */}
          <button
            onClick={() => handleDuplicateSlide(currentSlide)}
            title="Nhân bản slide này"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors hidden sm:flex"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* ADD NEW SLIDE BUTTON */}
          <button
            onClick={handleAddNewSlide}
            title="Thêm một slide mới vào bài giảng"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 transition-colors hidden sm:flex"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* DELETE SLIDE BUTTON */}
          <button
            onClick={() => handleOpenDeleteCurrentSlide(currentSlide)}
            title="Xóa slide này khỏi bài giảng"
            className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-600 border border-rose-500/30 hover:border-rose-500 text-rose-400 hover:text-white transition-all flex items-center gap-1 text-xs font-bold"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Xóa</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Thoát toàn màn hình (Esc)' : 'Toàn màn hình (F)'}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Quick Typography & Styling Floating Action Strip */}
      {showStyleQuickBar && (
        <div className="mb-3 p-3.5 rounded-2xl bg-slate-900/95 border border-pink-500/40 shadow-xl flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Font Family Quick Select */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-pink-300 flex items-center gap-1">
              <Type className="w-3.5 h-3.5" />
              Font:
            </span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {[
                { id: 'sans', label: 'Hiện Đại (Sans)' },
                { id: 'serif', label: 'SGK (Serif)' },
                { id: 'mono', label: 'Code (Mono)' },
                { id: 'display', label: 'Nổi Bật (Display)' },
                { id: 'handwriting', label: 'Bảng Phấn (Hand)' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleQuickStyleUpdate({ fontFamily: f.id as any })}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    styleConfig.fontFamily === f.id || (!styleConfig.fontFamily && f.id === 'sans')
                      ? 'bg-pink-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size Quick Select */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-indigo-300">Cỡ Chữ:</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {[
                { id: 'sm', label: 'A- (Nhỏ)' },
                { id: 'base', label: 'A (Chuẩn)' },
                { id: 'lg', label: 'A+ (Lớn)' },
                { id: 'xl', label: 'A++ (Rất lớn)' },
              ].map((sz) => (
                <button
                  key={sz.id}
                  onClick={() => handleQuickStyleUpdate({ fontSize: sz.id as any })}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    styleConfig.fontSize === sz.id || (!styleConfig.fontSize && sz.id === 'base')
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sz.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Color Quick Palette */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5" />
              Màu Chữ:
            </span>
            <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
              {['#ffffff', '#38bdf8', '#fbbf24', '#34d399', '#f43f5e', '#a78bfa'].map((c) => (
                <button
                  key={c}
                  onClick={() => handleQuickStyleUpdate({ textColor: c })}
                  className={`w-5 h-5 rounded-full border border-white/40 transition-transform ${
                    styleConfig.textColor === c ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                  title={`Đổi màu chữ: ${c}`}
                />
              ))}
              <input
                type="color"
                value={styleConfig.textColor || '#e2e8f0'}
                onChange={(e) => handleQuickStyleUpdate({ textColor: e.target.value })}
                className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                title="Chọn màu tự do"
              />
            </div>
          </div>

          {/* Close bar */}
          <button
            onClick={() => setShowStyleQuickBar(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Slide Canvas */}
      <div className="relative flex-1 flex flex-col bg-slate-900/95 rounded-3xl border border-slate-800/90 shadow-2xl overflow-hidden min-h-[500px] lg:min-h-[580px]">
        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

        {/* Canvas for Live Drawing */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className={`absolute inset-0 z-20 ${isDrawingMode ? 'cursor-crosshair' : 'pointer-events-none'}`}
        />

        {/* Slide Content */}
        <div className={`relative z-10 flex-1 flex flex-col p-6 sm:p-8 lg:p-10 max-w-6xl mx-auto w-full ${fontClass} ${sizeClass}`}>
          {/* Slide Header with quick edit shortcut */}
          <div className="mb-6 border-b border-slate-800 pb-4 flex items-start justify-between gap-4">
            <div>
              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight"
                style={{ color: titleColor }}
              >
                <MathView content={currentSlide.title} inline />
              </h1>
              {currentSlide.subtitle && (
                <div
                  className="text-sm sm:text-base mt-1 font-medium"
                  style={{ color: subtitleColor }}
                >
                  <MathView content={currentSlide.subtitle} />
                </div>
              )}
            </div>

            {/* In-slide Quick Action Pills */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setIsImageModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-600/20 text-cyan-300 hover:text-cyan-200 border border-slate-700 hover:border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow"
              >
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>+ Ảnh</span>
              </button>
              <button
                onClick={() => handleOpenEditCurrentSlide(currentSlide)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Chỉnh Sửa</span>
              </button>
              <button
                onClick={() => handleOpenDeleteCurrentSlide(currentSlide)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 text-xs transition-colors"
                title="Xóa slide này"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Top Images (if any) */}
          {topImages.length > 0 && (
            <div className="mb-6 flex flex-wrap justify-center gap-4">
              {topImages.map((img) => (
                <div
                  key={img.id}
                  className="group relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950/80 p-2 shadow-lg"
                  style={{ width: `${img.widthPercent || 75}%` }}
                >
                  <img
                    src={img.url}
                    alt={img.caption || 'Hình ảnh'}
                    onClick={() => setZoomedImage(img)}
                    className="w-full h-auto max-h-72 object-contain rounded-xl cursor-zoom-in group-hover:opacity-95 transition-opacity"
                  />
                  {img.caption && (
                    <div className="mt-2 text-center text-xs text-slate-300 font-medium">
                      <MathView content={img.caption} inline />
                    </div>
                  )}
                  {/* Floating delete button on hover */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                    <button
                      onClick={() => setZoomedImage(img)}
                      className="p-1.5 rounded-lg bg-slate-900/80 text-white hover:bg-indigo-600 shadow"
                      title="Phóng to ảnh"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteImageFromSlide(img.id)}
                      className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Objectives (Mục Tiêu Bài Học) if configured on slide */}
          {currentSlide.objectives && currentSlide.objectives.length > 0 && (
            <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-indigo-950/40 border-2 border-indigo-500/30 space-y-2.5 shadow-lg">
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                Mục Tiêu Bài Học:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-sm sm:text-base text-slate-100 font-medium">
                {currentSlide.objectives.map((obj, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                    <span>
                      <MathView content={obj} inline />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Opening Problem (Bài Toán / Tình Huống Mở Đầu) if configured on slide */}
          {currentSlide.openingProblem && currentSlide.openingProblem.context && (
            <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-amber-950/30 border-2 border-amber-500/40 shadow-xl space-y-3">
              <div className="flex items-center gap-2.5 font-black text-sm sm:text-base text-amber-300 uppercase">
                <Compass className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span>
                  {currentSlide.openingProblem.title || 'Tình Huống Mở Đầu'}
                </span>
              </div>

              <div className="text-sm sm:text-base text-slate-100 font-normal leading-relaxed">
                <MathView content={currentSlide.openingProblem.context} />
              </div>

              {currentSlide.openingProblem.question && (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 text-xs sm:text-sm text-amber-100 flex items-start gap-2.5">
                  <QuestionIcon className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold mr-1 text-amber-300">Câu hỏi đặt vấn đề:</span>
                    <MathView content={currentSlide.openingProblem.question} inline />
                  </div>
                </div>
              )}

              {currentSlide.openingProblem.conclusion && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs sm:text-sm text-emerald-100 font-semibold flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-emerald-400 uppercase font-extrabold text-[11px] mr-1.5">
                      Kết luận mở đầu:
                    </span>
                    <MathView content={currentSlide.openingProblem.conclusion} inline />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Key Formula Highlight Banner (if any) */}
          {currentSlide.keyFormula && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-blue-950/60 to-slate-900 border border-indigo-500/30 shadow-lg shadow-indigo-950/40">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Công Thức Cốt Lõi
                </span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-400/20">
                  LaTeX Math
                </span>
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-mono text-center py-2 text-amber-300">
                <MathView content={`$$${currentSlide.keyFormula}$$`} block />
              </div>
            </div>
          )}

          {/* Main Slide Body with Left/Right Image Columns */}
          <div className="flex-1 flex flex-col lg:flex-row gap-6 items-start" style={{ color: textColor }}>
            {/* Left Images Column */}
            {leftImages.length > 0 && (
              <div className="w-full lg:w-1/3 flex flex-col gap-4 flex-shrink-0">
                {leftImages.map((img) => (
                  <div
                    key={img.id}
                    className="group relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950/80 p-2 shadow-lg"
                  >
                    <img
                      src={img.url}
                      alt={img.caption || 'Hình ảnh'}
                      onClick={() => setZoomedImage(img)}
                      className="w-full h-auto max-h-64 object-contain rounded-xl cursor-zoom-in"
                    />
                    {img.caption && (
                      <div className="mt-2 text-center text-xs text-slate-300 font-medium">
                        <MathView content={img.caption} inline />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                      <button
                        onClick={() => setZoomedImage(img)}
                        className="p-1.5 rounded-lg bg-slate-900/80 text-white hover:bg-indigo-600 shadow"
                        title="Phóng to ảnh"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteImageFromSlide(img.id)}
                        className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow"
                        title="Xóa ảnh"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Slide Sections Content */}
            <div className="flex-1 w-full space-y-6 leading-relaxed">
              {currentSlide.sections?.map((section, sIdx) => {
                const blocks = getSectionBlocks(section);

                return (
                  <div key={section.id || sIdx} className="space-y-5">
                    {section.title && (
                      <h3 className="text-lg font-bold text-indigo-300 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400" />
                        <MathView content={section.title} inline />
                      </h3>
                    )}

                    {section.content && (
                      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 text-sm sm:text-base">
                        <MathView content={section.content} />
                      </div>
                    )}

                    {/* Render blocks in section */}
                    {blocks.map((block, bIdx) => {
                      const meta = BLOCK_TYPES_META[block.type];

                      // 0.0 Image Block
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
                          <div key={block.id || bIdx} className={`flex ${posClass} w-full my-3`}>
                            <div
                              className="group relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950/80 p-2 shadow-lg"
                              style={{ width: position === 'full' ? '100%' : `${widthPercent}%` }}
                            >
                              {block.imageUrl && (
                                <img
                                  src={block.imageUrl}
                                  alt={block.imageAlt || 'Hình ảnh'}
                                  onClick={() =>
                                    setZoomedImage({
                                      id: block.id,
                                      url: block.imageUrl!,
                                      caption: block.imageCaption,
                                    })
                                  }
                                  className="w-full h-auto max-h-72 object-contain rounded-xl cursor-zoom-in"
                                />
                              )}
                              {block.imageCaption && (
                                <div className="mt-2 text-center text-xs text-slate-300 font-medium">
                                  <MathView content={block.imageCaption} inline />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }

                      // 0.1 Tiêu đề bài học
                      if (block.type === 'lesson_title') {
                        return (
                          <div
                            key={block.id || bIdx}
                            className="p-5 rounded-2xl bg-blue-950/40 border-2 border-blue-500/40 shadow-xl space-y-3"
                          >
                            <div className="text-xl sm:text-2xl font-black text-blue-300 uppercase">
                              <MathView content={block.title || 'Tiêu Đề Bài Học'} inline />
                            </div>
                            {block.subtitle && (
                              <div className="text-sm sm:text-base text-blue-200 font-medium">
                                <MathView content={block.subtitle} />
                              </div>
                            )}
                            {block.keyFormula && (
                              <div className="p-3 rounded-xl bg-slate-950 border border-blue-500/30 text-amber-300 text-center font-mono text-lg font-bold">
                                <MathView content={`$$${block.keyFormula}$$`} block />
                              </div>
                            )}
                            {block.content && (
                              <div className="text-sm text-slate-200">
                                <MathView content={block.content} />
                              </div>
                            )}
                          </div>
                        );
                      }

                      // 0.2 Mục tiêu bài học
                      if (block.type === 'objectives') {
                        return (
                          <div
                            key={block.id || bIdx}
                            className="p-5 rounded-2xl bg-indigo-950/40 border-2 border-indigo-500/40 shadow-xl space-y-3"
                          >
                            <div className="flex items-center gap-2 text-sm sm:text-base font-extrabold uppercase text-indigo-300">
                              <Target className="w-5 h-5 text-emerald-400" />
                              <span>
                                <MathView content={block.title || 'Mục Tiêu Bài Học'} inline />
                              </span>
                            </div>

                            {block.items && block.items.length > 0 && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-sm sm:text-base text-slate-100 font-medium">
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

                      // 0.3 Tình huống mở đầu
                      if (block.type === 'opening_problem') {
                        return (
                          <div
                            key={block.id || bIdx}
                            className="p-5 rounded-2xl bg-amber-950/30 border-2 border-amber-500/40 shadow-xl space-y-3"
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
                              <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 text-xs sm:text-sm text-amber-100 flex items-start gap-2.5">
                                <QuestionIcon className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold mr-1 text-amber-300">Câu hỏi đặt vấn đề:</span>
                                  <MathView content={block.question} inline />
                                </div>
                              </div>
                            )}

                            {block.conclusion && (
                              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs sm:text-sm text-emerald-100 font-semibold flex items-start gap-2.5">
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

                      // 0.4 Nội dung Block
                      if (block.type === 'content') {
                        return (
                          <div
                            key={block.id || bIdx}
                            className="p-5 rounded-2xl bg-slate-950/80 border-2 border-purple-500/40 shadow-xl space-y-2.5"
                          >
                            {block.title && (
                              <div className="font-extrabold text-sm sm:text-base text-purple-300 flex items-center gap-2">
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

                      // 1. Hoạt động
                      if (block.type === 'activity') {
                        return (
                          <div
                            key={block.id || bIdx}
                            className="p-5 rounded-2xl bg-blue-950/30 border-2 border-blue-500/40 shadow-lg space-y-3"
                          >
                            <div className="flex items-center gap-2.5 font-extrabold text-sm sm:text-base text-blue-300">
                              <Compass className="w-5 h-5 text-blue-400 flex-shrink-0" />
                              <span>
                                <MathView content={block.title || 'Hoạt động'} inline />
                              </span>
                            </div>

                            {block.description && (
                              <div className="text-sm sm:text-base text-slate-100 font-normal">
                                <MathView content={block.description} />
                              </div>
                            )}

                            {block.question && (
                              <div className="p-3 rounded-xl bg-slate-950/80 border border-blue-500/30 text-xs sm:text-sm text-blue-100 flex items-start gap-2.5">
                                <QuestionIcon className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold mr-1 text-blue-300">Câu hỏi thảo luận:</span>
                                  <MathView content={block.question} inline />
                                </div>
                              </div>
                            )}

                            {block.conclusion && (
                              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs sm:text-sm text-emerald-100 font-semibold flex items-start gap-2.5">
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

                      // 2. Ghi nhớ
                      if (block.type === 'takeaway') {
                        return (
                          <div
                            key={block.id || bIdx}
                            className="p-5 sm:p-6 rounded-2xl bg-indigo-950/40 border-2 border-indigo-500/50 shadow-xl text-indigo-100 space-y-2.5"
                          >
                            <div className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                              <Bookmark className="w-4 h-4 text-indigo-400" />
                              <span>{block.title || 'Ghi Nhớ Trọng Tâm (SGK)'}</span>
                            </div>
                            <div className="text-sm sm:text-base font-medium leading-relaxed">
                              <MathView content={block.content || ''} />
                            </div>
                          </div>
                        );
                      }

                      // 3. Chú ý
                      if (block.type === 'note') {
                        return (
                          <div
                            key={block.id || bIdx}
                            className="p-4 sm:p-5 rounded-2xl bg-amber-950/30 border-2 border-amber-500/40 shadow-lg text-amber-100 space-y-2"
                          >
                            <div className="font-bold text-xs sm:text-sm uppercase tracking-wider text-amber-300 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-400" />
                              <span>{block.title || 'Chú Ý Quan Trọng'}</span>
                            </div>
                            <div className="text-sm sm:text-base leading-relaxed">
                              <MathView content={block.content || ''} />
                            </div>
                          </div>
                        );
                      }

                      // 4. Ví dụ
                      if (block.type === 'example') {
                        return (
                          <div
                            key={block.id || bIdx}
                            className="p-5 rounded-2xl bg-slate-900/90 border-2 border-purple-500/40 shadow-xl space-y-4"
                          >
                            <div className="flex items-center justify-between pb-2.5 border-b border-purple-500/30">
                              <div className="font-bold text-base text-purple-300 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-400" />
                                <span>
                                  <MathView content={block.title || 'Ví Dụ'} inline />
                                </span>
                              </div>
                            </div>

                            {block.problem && (
                              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-sm sm:text-base font-medium text-amber-200">
                                <MathView content={block.problem} />
                              </div>
                            )}

                            {block.solutionSteps && block.solutionSteps.length > 0 && (
                              <div className="space-y-2.5">
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                  Hướng Dẫn & Lời Giải Chi Tiết:
                                </div>
                                {block.solutionSteps.map((step, stepIdx) => (
                                  <div
                                    key={stepIdx}
                                    className="p-3 rounded-xl bg-slate-950/90 border border-slate-700 text-slate-200 text-sm sm:text-base shadow"
                                  >
                                    <div className="flex items-start gap-2.5">
                                      <span className="font-mono font-bold text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30 shrink-0">
                                        Bước {stepIdx + 1}
                                      </span>
                                      <div className="flex-1">
                                        <MathView content={step} />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {block.finalAnswer && (
                              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold text-sm sm:text-base">
                                <span className="text-emerald-400 text-xs uppercase font-extrabold mr-2">
                                  Đáp số:
                                </span>
                                <MathView content={block.finalAnswer} inline />
                              </div>
                            )}
                          </div>
                        );
                      }

                      // 5. Chú ý từ ví dụ
                      if (block.type === 'example_note') {
                        return (
                          <div
                            key={block.id || bIdx}
                            className="p-4 sm:p-5 rounded-2xl bg-rose-950/30 border-2 border-rose-500/40 shadow-lg text-rose-100 space-y-2"
                          >
                            <div className="font-bold text-xs sm:text-sm uppercase tracking-wider text-rose-300 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-rose-400" />
                              <span>{block.title || 'Chú Ý / Nhận Xét Từ Ví Dụ'}</span>
                            </div>
                            <div className="text-sm sm:text-base leading-relaxed">
                              <MathView content={block.content || ''} />
                            </div>
                          </div>
                        );
                      }

                      // 6. Luyện tập
                      if (block.type === 'practice') {
                        const hintKey = `${sIdx}_${block.id}_view_hint`;
                        const solKey = `${sIdx}_${block.id}_view_sol`;
                        const showHint = practiceToggles[hintKey];
                        const showSol = practiceToggles[solKey];

                        return (
                          <div
                            key={block.id || bIdx}
                            className="p-5 rounded-2xl bg-sky-950/25 border-2 border-sky-500/40 shadow-lg space-y-3.5 text-sm sm:text-base"
                          >
                            <div className="flex items-center justify-between pb-2 border-b border-sky-500/20">
                              <div className="font-extrabold text-sky-300 flex items-center gap-2.5">
                                <Dumbbell className="w-5 h-5 text-sky-400" />
                                <span>
                                  <MathView content={block.title || 'Luyện tập'} inline />
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                {block.hint && (
                                  <button
                                    onClick={() => togglePracticeKey(hintKey)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                      showHint
                                        ? 'bg-amber-600 text-white border-amber-400'
                                        : 'bg-slate-900 text-amber-300 border-amber-500/40 hover:bg-slate-800'
                                    }`}
                                  >
                                    {showHint ? 'Ẩn Gợi Ý' : 'Xem Gợi Ý'}
                                  </button>
                                )}

                                {block.solution && (
                                  <button
                                    onClick={() => togglePracticeKey(solKey)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                      showSol
                                        ? 'bg-sky-600 text-white border-sky-400'
                                        : 'bg-slate-900 text-sky-300 border-sky-500/40 hover:bg-slate-800'
                                    }`}
                                  >
                                    {showSol ? 'Ẩn Lời Giải' : 'Xem Đáp Án'}
                                  </button>
                                )}
                              </div>
                            </div>

                            {block.problem && (
                              <div className="text-slate-100 font-medium leading-relaxed">
                                <MathView content={block.problem} />
                              </div>
                            )}

                            {showHint && block.hint && (
                              <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-100 text-xs sm:text-sm flex items-start gap-2.5">
                                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold mr-1 text-amber-300">Gợi ý:</span>
                                  <MathView content={block.hint} inline />
                                </div>
                              </div>
                            )}

                            {showSol && block.solution && (
                              <div className="p-4 rounded-xl bg-slate-900 border-2 border-sky-500/50 text-sky-100 text-sm sm:text-base">
                                <div className="font-extrabold mb-1.5 text-sky-300">Lời giải chi tiết:</div>
                                <MathView content={block.solution} />
                              </div>
                            )}
                          </div>
                        );
                      }

                      // 7. Vận dụng
                      if (block.type === 'application') {
                        const solKey = `${sIdx}_${block.id}_view_app_sol`;
                        const showSol = appToggles[solKey];

                        return (
                          <div
                            key={block.id || bIdx}
                            className="p-5 rounded-2xl bg-teal-950/25 border-2 border-teal-500/40 shadow-lg space-y-3.5 text-sm sm:text-base"
                          >
                            <div className="flex items-center justify-between pb-2 border-b border-teal-500/20">
                              <div className="font-extrabold text-teal-300 flex items-center gap-2.5">
                                <Globe2 className="w-5 h-5 text-teal-400" />
                                <span>
                                  <MathView content={block.title || 'Vận dụng'} inline />
                                </span>
                              </div>

                              {block.solution && (
                                <button
                                  onClick={() => toggleAppKey(solKey)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                    showSol
                                      ? 'bg-teal-600 text-white border-teal-400'
                                      : 'bg-slate-900 text-teal-300 border-teal-500/40 hover:bg-slate-800'
                                  }`}
                                >
                                  {showSol ? 'Ẩn Lời Giải' : 'Xem Đáp Án'}
                                </button>
                              )}
                            </div>

                            {block.problem && (
                              <div className="text-slate-100 font-medium leading-relaxed">
                                <MathView content={block.problem} />
                              </div>
                            )}

                            {showSol && block.solution && (
                              <div className="p-4 rounded-xl bg-slate-900 border-2 border-teal-500/50 text-teal-100 text-sm sm:text-base">
                                <div className="font-extrabold mb-1.5 text-teal-300">Lời giải ứng dụng thực tế:</div>
                                <MathView content={block.solution} />
                              </div>
                            )}
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                );
              })}

              {/* Center / Inline Images */}
              {centerImages.length > 0 && (
                <div className="pt-4 flex flex-wrap justify-center gap-4">
                  {centerImages.map((img) => (
                    <div
                      key={img.id}
                      className="group relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950/80 p-2 shadow-lg"
                      style={{ width: `${img.widthPercent || 75}%` }}
                    >
                      <img
                        src={img.url}
                        alt={img.caption || 'Hình ảnh'}
                        onClick={() => setZoomedImage(img)}
                        className="w-full h-auto max-h-72 object-contain rounded-xl cursor-zoom-in"
                      />
                      {img.caption && (
                        <div className="mt-2 text-center text-xs text-slate-300 font-medium">
                          <MathView content={img.caption} inline />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                        <button
                          onClick={() => setZoomedImage(img)}
                          className="p-1.5 rounded-lg bg-slate-900/80 text-white hover:bg-indigo-600 shadow"
                          title="Phóng to ảnh"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteImageFromSlide(img.id)}
                          className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow"
                          title="Xóa ảnh"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Images Column */}
            {rightImages.length > 0 && (
              <div className="w-full lg:w-1/3 flex flex-col gap-4 flex-shrink-0">
                {rightImages.map((img) => (
                  <div
                    key={img.id}
                    className="group relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950/80 p-2 shadow-lg"
                  >
                    <img
                      src={img.url}
                      alt={img.caption || 'Hình ảnh'}
                      onClick={() => setZoomedImage(img)}
                      className="w-full h-auto max-h-64 object-contain rounded-xl cursor-zoom-in"
                    />
                    {img.caption && (
                      <div className="mt-2 text-center text-xs text-slate-300 font-medium">
                        <MathView content={img.caption} inline />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                      <button
                        onClick={() => setZoomedImage(img)}
                        className="p-1.5 rounded-lg bg-slate-900/80 text-white hover:bg-indigo-600 shadow"
                        title="Phóng to ảnh"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteImageFromSlide(img.id)}
                        className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow"
                        title="Xóa ảnh"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Teacher Notes Drawer (Pop-up inside slide) */}
          {showTeacherNotes && (
            <div className="mt-6 p-4 rounded-2xl bg-amber-950/80 border border-amber-500/50 shadow-2xl text-amber-100 text-xs sm:text-sm space-y-2 backdrop-blur-md">
              <div className="flex items-center justify-between font-bold text-amber-300 text-sm">
                <div className="flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4" />
                  <span>Lời Thoại & Hướng Dẫn Giảng Dạy Của Giáo Viên</span>
                </div>
                <button
                  onClick={() => setShowTeacherNotes(false)}
                  className="text-amber-400 hover:text-amber-200"
                >
                  Đóng
                </button>
              </div>
              {currentSlide.teacherSpeechGuide ? (
                <p className="leading-relaxed italic">"{currentSlide.teacherSpeechGuide}"</p>
              ) : (
                <p className="text-slate-400">Chưa có ghi chú lời thoại cho slide này.</p>
              )}
              {currentSlide.chalkboardNotes && (
                <div className="pt-2 border-t border-amber-600/40">
                  <span className="font-semibold text-amber-200">Ghi chú viết bảng: </span>
                  <span className="font-mono text-emerald-300">{currentSlide.chalkboardNotes}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Slide Navigation Bar */}
        <div className="relative z-10 px-6 py-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Dùng phím mũi tên</span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-[10px] text-slate-300">
              ←
            </kbd>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-[10px] text-slate-300">
              →
            </kbd>
            <span>hoặc phím Space để chuyển Slide</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={goToPrevSlide}
              disabled={currentSlideIndex === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Slide Trước</span>
            </button>

            <span className="text-xs font-bold font-mono px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800 text-indigo-300">
              {currentSlideIndex + 1} / {lesson.slides.length}
            </span>

            <button
              onClick={goToNextSlide}
              disabled={currentSlideIndex === lesson.slides.length - 1}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
            >
              <span>Slide Kế Tiếp</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide List Outline Modal */}
      {showSlideListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base sm:text-lg text-white">
                  Danh Sách Toàn Bộ Bài Giảng ({lesson.slides.length} Slide)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleAddNewSlide();
                    setShowSlideListModal(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm Slide Mới
                </button>
                <button
                  onClick={() => setShowSlideListModal(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto space-y-2.5 flex-1 custom-scrollbar">
              {lesson.slides.map((s, idx) => {
                const sBadge = getCategoryBadge(s.category);
                const isActive = idx === currentSlideIndex;
                return (
                  <div
                    key={s.id || idx}
                    className={`w-full p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-indigo-950/60 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                        : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setCurrentSlideIndex(idx);
                        clearCanvas();
                        setShowSlideListModal(false);
                      }}
                      className="flex-1 flex items-center gap-3 text-left min-w-0"
                    >
                      <span className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                        isActive ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-slate-100 truncate">{s.title}</h4>
                        {s.subtitle && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{s.subtitle}</p>
                        )}
                      </div>
                    </button>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${sBadge.bg} hidden sm:inline`}>
                        {sBadge.label}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditCurrentSlide(s);
                        }}
                        title="Chỉnh sửa slide này"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateSlide(s);
                        }}
                        title="Nhân bản slide này"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDeleteCurrentSlide(s);
                        }}
                        title="Xóa slide này"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Printable Handout Modal */}
      {showPrintView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-base text-white">Tài Liệu Bài Giảng Đầy Đủ (Handout)</h3>
                  <p className="text-xs text-slate-400">{lesson.title} - {lesson.grade} ({lesson.slides.length} Slide)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-4 h-4" />
                  In / Xuất PDF
                </button>
                <button
                  onClick={() => setShowPrintView(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar text-slate-200">
              {lesson.slides.map((s, idx) => (
                <div key={s.id || idx} className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <span className="font-bold text-sm text-indigo-300">
                      Slide {idx + 1}: {s.title}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{s.category}</span>
                  </div>
                  {s.subtitle && <p className="text-xs text-slate-400 italic">{s.subtitle}</p>}
                  {s.keyFormula && (
                    <div className="py-1 text-center bg-slate-900/60 rounded-lg border border-slate-800">
                      <MathView content={`$$${s.keyFormula}$$`} block />
                    </div>
                  )}
                  {s.images && s.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 py-2">
                      {s.images.map((img, i) => (
                        <div key={i} className="text-center">
                          <img src={img.url} alt="img" className="max-h-40 rounded-lg mx-auto" />
                          {img.caption && <p className="text-[11px] text-slate-400 mt-1"><MathView content={img.caption} inline /></p>}
                        </div>
                      ))}
                    </div>
                  )}
                  {s.sections?.map((sec, secIdx) => (
                    <div key={secIdx} className="space-y-2 text-sm">
                      {sec.title && <h5 className="font-semibold text-indigo-300">{sec.title}</h5>}
                      {sec.content && <MathView content={sec.content} />}
                      {sec.callout && (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs">
                          {sec.callout.title && <div className="font-bold text-amber-300 mb-1">{sec.callout.title}</div>}
                          <MathView content={sec.callout.content} />
                        </div>
                      )}
                      {sec.bulletPoints && (
                        <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
                          {sec.bulletPoints.map((bp, bpIdx) => (
                            <li key={bpIdx}><MathView content={bp} /></li>
                          ))}
                        </ul>
                      )}
                      {sec.example && (
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700 text-xs space-y-2">
                          <div className="font-bold text-cyan-300">
                            <span className="mr-1">Ví dụ:</span>
                            <MathView content={sec.example.problem} className="inline" />
                          </div>
                          <div className="space-y-1 pl-2">
                            {sec.example.solutionSteps.map((st, stIdx) => (
                              <div key={stIdx} className="text-slate-300 flex items-start gap-1">
                                <span>•</span>
                                <MathView content={st} />
                              </div>
                            ))}
                          </div>
                          {sec.example.finalAnswer && (
                            <div className="font-bold text-emerald-400 flex items-start gap-1">
                              <span>Đáp số:</span>
                              <MathView content={sec.example.finalAnswer} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Slide Modal */}
      {slideForAction && (
        <SlideEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSlideForAction(null);
          }}
          slide={slideForAction}
          totalSlides={lesson.slides.length}
          onSave={handleSaveSlideEdit}
        />
      )}

      {/* Delete Slide Modal */}
      {slideForAction && (
        <DeleteSlideModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSlideForAction(null);
          }}
          slide={slideForAction}
          totalSlides={lesson.slides.length}
          onConfirmDelete={handleConfirmDelete}
        />
      )}

      {/* Slide Image Management Modal */}
      {currentSlide && (
        <SlideImageModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          slide={currentSlide}
          onSaveSlide={handleSaveSlideEdit}
        />
      )}

      {/* Full Resolution Zoom Lightbox */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl p-4 flex flex-col items-center gap-3 shadow-2xl relative"
          >
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={zoomedImage.url}
              alt={zoomedImage.caption || 'Hình ảnh phóng to'}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl"
            />
            {zoomedImage.caption && (
              <div className="text-sm font-semibold text-slate-200 text-center px-4">
                <MathView content={zoomedImage.caption} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
