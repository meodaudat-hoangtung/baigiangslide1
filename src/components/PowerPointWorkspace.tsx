import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Tv,
  PenTool,
  Radio,
  Printer,
  Sparkles,
  FileText,
  Type,
  Palette,
  Sigma,
  MessageSquare,
  Wrench,
  X,
  CheckCircle2,
  SlidersHorizontal,
  RotateCcw,
  Layers,
  ImageIcon,
  Bookmark,
  Lightbulb,
  Dumbbell,
  Zap,
  AlertTriangle,
  Compass,
  Target,
  Rocket,
  Film,
  Eye,
  EyeOff,
  Pencil,
  ArrowUp,
  ArrowDown,
  Upload,
  Play,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { Slide, MathLesson, SlideBlockType, SlideContentBlock, SlideStyleConfig, SlideTextBox } from '../types';
import { getSlideBlocks, createDefaultBlock } from '../utils/slideBlocks';
import { MathView } from './MathView';
import { DeleteSlideModal } from './DeleteSlideModal';
import { SlideSelectionFontSizeToolbar } from './SlideSelectionFontSizeToolbar';
import { MathToolbar } from './MathToolbar';
import { SlideTextBoxOverlay } from './SlideTextBoxOverlay';
import { FullscreenPresentationModal } from './FullscreenPresentationModal';
import { BlockEditModal } from './BlockEditModal';
import { MediaBlockRenderer } from './MediaBlockRenderer';

const EMPTY_TEXT_BOXES: SlideTextBox[] = [];

interface PowerPointWorkspaceProps {
  lesson: MathLesson;
  currentSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onUpdateSlide: (updatedSlide: Slide) => void;
  onDeleteSlide: (slideId: string) => void;
  onAddSlide: (newSlide: Slide, insertAfterIndex?: number) => void;
  onOpenPrintView?: () => void;
}

export const PowerPointWorkspace: React.FC<PowerPointWorkspaceProps> = ({
  lesson,
  currentSlideIndex,
  onSelectSlide,
  onUpdateSlide,
  onDeleteSlide,
  onAddSlide,
  onOpenPrintView,
}) => {
  const slides = lesson.slides;
  const safeIndex = Math.min(Math.max(0, currentSlideIndex), Math.max(0, slides.length - 1));
  const currentSlide = slides[safeIndex] || slides[0];

  // Notes state
  const [isNotesExpanded, setIsNotesExpanded] = useState<boolean>(false);
  const [notesInput, setNotesInput] = useState<string>(currentSlide?.teacherSpeechGuide || '');

  // Keep notesInput in sync when slide changes
  useEffect(() => {
    setNotesInput(currentSlide?.teacherSpeechGuide || '');
  }, [currentSlide?.id, currentSlide?.teacherSpeechGuide]);

  const handleNotesChange = (value: string) => {
    setNotesInput(value);
    if (currentSlide) {
      onUpdateSlide({
        ...currentSlide,
        teacherSpeechGuide: value,
      });
    }
  };

  // Tools Menu state
  const [showToolsMenu, setShowToolsMenu] = useState<boolean>(false);
  const [addedBlockToast, setAddedBlockToast] = useState<string | null>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  // Quick formatting toolbars state
  const [showFontSizeToolbar, setShowFontSizeToolbar] = useState<boolean>(false);
  const [showMathToolbar, setShowMathToolbar] = useState<boolean>(false);
  const [showStylePanel, setShowStylePanel] = useState<boolean>(false);

  // Modals
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState<Slide | null>(null);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState<{
    title: string;
    message: string;
    itemPreview?: string;
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);

  // Block Editing Modal state
  const [isBlockModalOpen, setIsBlockModalOpen] = useState<boolean>(false);
  const [editingBlock, setEditingBlock] = useState<SlideContentBlock | null>(null);

  // Fullscreen TV Presentation mode
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Step-by-step reveals for interactive elements
  const [revealedBlockCount, setRevealedBlockCount] = useState<number>(99);
  const [revealedExampleSteps, setRevealedExampleSteps] = useState<Record<string, number>>({});
  const [practiceToggles, setPracticeToggles] = useState<Record<string, boolean>>({});

  // PowerPoint Text Box state
  const [selectedTextBoxId, setSelectedTextBoxId] = useState<string | null>(null);

  // Slide Zoom state (50% to 200%, mặc định 100%)
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(200, prev + 10));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(50, prev - 10));
  const handleResetZoom = () => setZoomLevel(100);

  // Slide-level animation trigger for text boxes
  const [slideAnimTrigger, setSlideAnimTrigger] = useState<number>(0);

  // Add a new free-floating PowerPoint Text Box to current slide
  const handleAddTextBox = () => {
    if (!currentSlide) return;
    const currentTextBoxes = currentSlide.textBoxes || [];
    const offset = (currentTextBoxes.length % 5) * 4;
    const newBox: SlideTextBox = {
      id: `tb_${Date.now()}`,
      text: 'Nhập nội dung văn bản...',
      x: 25 + offset,
      y: 30 + offset,
      width: 45,
      fontSize: 24,
      color: '#ffffff',
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'left',
      animation: 'slide-up',
      animationDuration: 0.6,
      animationOrder: currentTextBoxes.length + 1,
    };
    const updated = [...currentTextBoxes, newBox];
    onUpdateSlide({
      ...currentSlide,
      textBoxes: updated,
    });
    setSelectedTextBoxId(newBox.id);
    setAddedBlockToast('Đã chèn Text Box (kèm hiệu ứng Dưới lên, kéo để di chuyển)');
    setTimeout(() => setAddedBlockToast(null), 3000);
  };

  const handleUpdateTextBox = (updatedBox: SlideTextBox) => {
    if (!currentSlide) return;
    const updated = (currentSlide.textBoxes || []).map((b) => (b.id === updatedBox.id ? updatedBox : b));
    onUpdateSlide({
      ...currentSlide,
      textBoxes: updated,
    });
  };

  const handleDeleteTextBox = (boxId: string) => {
    if (!currentSlide) return;
    const targetBox = (currentSlide.textBoxes || []).find((b) => b.id === boxId);
    setConfirmDeleteDialog({
      title: 'Xác Nhận Xóa Hộp Chữ (Text Box)?',
      message:
        'Hành động này sẽ xóa vĩnh viễn hộp chữ ngay lập tức trên mọi thiết bị, mọi tab và không thể khôi phục.',
      itemPreview: targetBox?.text ? `"${targetBox.text.slice(0, 100)}"` : 'Hộp chữ tự do (Text Box)',
      confirmLabel: 'Xóa Vĩnh Viễn',
      onConfirm: () => {
        const updated = (currentSlide.textBoxes || []).filter((b) => b.id !== boxId);
        onUpdateSlide({
          ...currentSlide,
          textBoxes: updated,
        });
        if (selectedTextBoxId === boxId) {
          setSelectedTextBoxId(null);
        }
        setAddedBlockToast('Đã xóa vĩnh viễn Text Box');
        setTimeout(() => setAddedBlockToast(null), 2000);
      },
    });
  };

  const handleDuplicateTextBox = (box: SlideTextBox) => {
    if (!currentSlide) return;
    const newBox: SlideTextBox = {
      ...JSON.parse(JSON.stringify(box)),
      id: `tb_${Date.now()}`,
      x: Math.min(80, (box.x || 20) + 4),
      y: Math.min(80, (box.y || 20) + 4),
    };
    const updated = [...(currentSlide.textBoxes || []), newBox];
    onUpdateSlide({
      ...currentSlide,
      textBoxes: updated,
    });
    setSelectedTextBoxId(newBox.id);
    setAddedBlockToast('Đã nhân bản Text Box');
    setTimeout(() => setAddedBlockToast(null), 2000);
  };

  // Close tools menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node)) {
        setShowToolsMenu(false);
      }
    };
    if (showToolsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showToolsMenu]);

  // Keyboard navigation (Arrow keys, F5 for fullscreen, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs/textareas
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (safeIndex < slides.length - 1) {
          onSelectSlide(safeIndex + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (safeIndex > 0) {
          onSelectSlide(safeIndex - 1);
        }
      } else if (e.key === 'F5') {
        e.preventDefault();
        setIsFullscreen(true);
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        }
        setShowToolsMenu(false);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoomLevel((prev) => Math.min(200, prev + 10));
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        setZoomLevel((prev) => Math.max(50, prev - 10));
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        setZoomLevel(100);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [safeIndex, slides.length, onSelectSlide, isFullscreen]);

  // Add a blank slide after current slide
  const handleAddNewBlankSlide = () => {
    const newSlide: Slide = {
      id: `slide_${Date.now()}`,
      slideNumber: safeIndex + 2,
      title: 'Slide Trống',
      blocks: [],
      styleConfig: {
        backgroundColor: currentSlide?.styleConfig?.backgroundColor || '#103463',
        textColor: '#ffffff',
        fontFamily: 'sans',
      },
    };
    onAddSlide(newSlide, safeIndex);
    onSelectSlide(safeIndex + 1);
    setAddedBlockToast('Đã thêm 1 slide trống mới');
    setTimeout(() => setAddedBlockToast(null), 2500);
  };

  // Clear current slide to blank (with confirmation)
  const handleClearSlideToBlank = () => {
    if (!currentSlide) return;
    setConfirmDeleteDialog({
      title: 'Xác Nhận Làm Mới Trống Slide?',
      message:
        'Toàn bộ các khối nội dung và hộp chữ trên slide hiện tại sẽ bị xóa vĩnh viễn ngay lập tức và không thể khôi phục.',
      itemPreview: `Slide ${safeIndex + 1}: "${currentSlide.title || 'Trang chiếu'}"`,
      confirmLabel: 'Xóa & Làm Mới Trống',
      onConfirm: () => {
        onUpdateSlide({
          ...currentSlide,
          title: 'Slide Trống',
          blocks: [],
          textBoxes: [],
        });
        setSelectedTextBoxId(null);
        setAddedBlockToast('Đã xóa nội dung và làm mới thành slide trống');
        setTimeout(() => setAddedBlockToast(null), 2500);
      },
    });
  };

  // Duplicate current slide
  const handleDuplicateSlide = (slide: Slide, index: number) => {
    const duplicated: Slide = {
      ...JSON.parse(JSON.stringify(slide)),
      id: `slide_${Date.now()}`,
      slideNumber: index + 2,
      title: `${slide.title || 'Slide'} (Bản sao)`,
    };
    onAddSlide(duplicated, index);
    onSelectSlide(index + 1);
  };

  // Delete slide modal open
  const handleOpenDelete = (slide: Slide) => {
    setSlideToDelete(slide);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = (slideId: string) => {
    onDeleteSlide(slideId);
    if (safeIndex >= slides.length - 1) {
      onSelectSlide(Math.max(0, slides.length - 2));
    }
  };

  // Insert block into current slide & immediately open editor
  const handleAddBlock = (type: SlideBlockType, label?: string) => {
    if (!currentSlide) return;
    const currentBlocks = getSlideBlocks(currentSlide);
    const newBlock = createDefaultBlock(type);
    const updatedBlocks = [...currentBlocks, newBlock];
    onUpdateSlide({
      ...currentSlide,
      blocks: updatedBlocks,
    });
    // Open editor right away so author can customize content immediately
    setEditingBlock(newBlock);
    setIsBlockModalOpen(true);
    if (label) {
      setAddedBlockToast(`Đã thêm khối "${label}". Hãy tùy chỉnh nội dung theo ý muốn.`);
      setTimeout(() => setAddedBlockToast(null), 3000);
    }
  };

  // Save changes from BlockEditModal
  const handleSaveBlock = (updatedBlock: SlideContentBlock) => {
    if (!currentSlide) return;
    const currentBlocks = getSlideBlocks(currentSlide);
    const updatedBlocks = currentBlocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b));
    onUpdateSlide({
      ...currentSlide,
      blocks: updatedBlocks,
    });
    setIsBlockModalOpen(false);
    setEditingBlock(null);
    setAddedBlockToast(`Đã lưu thay đổi cho khối "${updatedBlock.title || 'Nội dung'}"`);
    setTimeout(() => setAddedBlockToast(null), 2500);
  };

  // Delete a block from slide (with confirmation)
  const handleDeleteBlock = (blockId: string) => {
    if (!currentSlide) return;
    const currentBlocks = getSlideBlocks(currentSlide);
    const targetBlock = currentBlocks.find((b) => b.id === blockId);
    setConfirmDeleteDialog({
      title: 'Xác Nhận Xóa Khối Nội Dung?',
      message:
        'Khối nội dung này sẽ bị xóa vĩnh viễn ngay lập tức khỏi trang chiếu trên mọi thiết bị và không thể khôi phục.',
      itemPreview: targetBlock?.title || targetBlock?.content || 'Khối nội dung trên Slide',
      confirmLabel: 'Xóa Vĩnh Viễn',
      onConfirm: () => {
        const latestBlocks = getSlideBlocks(currentSlide);
        const updatedBlocks = latestBlocks.filter((b) => b.id !== blockId);
        onUpdateSlide({
          ...currentSlide,
          blocks: updatedBlocks,
        });
        setAddedBlockToast('Đã xóa vĩnh viễn khối khỏi trang chiếu');
        setTimeout(() => setAddedBlockToast(null), 2000);
      },
    });
  };

  // Toggle block visibility (Ẩn / Hiện khối đối tượng trên slide)
  const handleToggleBlockVisibility = (blockId: string) => {
    if (!currentSlide) return;
    const currentBlocks = getSlideBlocks(currentSlide);
    const target = currentBlocks.find((b) => b.id === blockId);
    const willHide = !target?.isHidden;
    const updatedBlocks = currentBlocks.map((b) =>
      b.id === blockId ? { ...b, isHidden: willHide } : b
    );
    onUpdateSlide({
      ...currentSlide,
      blocks: updatedBlocks,
    });
    setAddedBlockToast(willHide ? 'Đã ẩn đối tượng khối' : 'Đã hiện đối tượng khối');
    setTimeout(() => setAddedBlockToast(null), 2000);
  };

  // Reorder block up / down on slide
  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (!currentSlide) return;
    const currentBlocks = [...getSlideBlocks(currentSlide)];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentBlocks.length) return;
    const temp = currentBlocks[index];
    currentBlocks[index] = currentBlocks[targetIndex];
    currentBlocks[targetIndex] = temp;
    onUpdateSlide({
      ...currentSlide,
      blocks: currentBlocks,
    });
  };

  // Reorder slides (move up / down)
  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;
    const reordered = [...slides];
    const temp = reordered[index];
    reordered[index] = reordered[newIndex];
    reordered[newIndex] = temp;
    // Re-index slide numbers
    reordered.forEach((s, idx) => {
      onUpdateSlide({ ...s, slideNumber: idx + 1 });
    });
    onSelectSlide(newIndex);
  };

  // Extract thumbnail text preview from slide
  const getThumbnailPreview = (slide: Slide) => {
    const blocks = getSlideBlocks(slide);
    if (blocks.length > 0) {
      const titleBlock = blocks.find((b) => b.type === 'lesson_title');
      if (titleBlock) {
        return {
          badge: 'TIÊU ĐỀ BÀI HỌC',
          badgeColor: 'text-amber-300',
          title: titleBlock.title || 'Bài học',
          subtitle: titleBlock.subtitle || titleBlock.content || '',
        };
      }
      const openingBlock = blocks.find((b) => b.type === 'opening_problem');
      if (openingBlock) {
        return {
          badge: 'BÀI TOÁN MỞ ĐẦU',
          badgeColor: 'text-amber-300',
          title: openingBlock.title || 'Bài toán mở đầu',
          subtitle: openingBlock.context || openingBlock.description || openingBlock.content || '',
        };
      }
      const firstBlock = blocks[0];
      return {
        badge: (firstBlock.title || firstBlock.type).toUpperCase(),
        badgeColor: 'text-amber-300',
        title: firstBlock.title || '',
        subtitle: firstBlock.content || firstBlock.problem || firstBlock.description || '',
      };
    }

    // If no blocks but has text boxes
    if (slide.textBoxes && slide.textBoxes.length > 0) {
      const filledBox = slide.textBoxes.find((b) => b.text && b.text.trim());
      if (filledBox) {
        return {
          badge: 'TEXT BOX',
          badgeColor: 'text-indigo-300',
          title: filledBox.text.trim(),
          subtitle: filledBox.text.trim(),
        };
      }
    }

    return null;
  };

  const BLOCK_MENU_ITEMS: { type: SlideBlockType; label: string; icon: any; colorClass: string; desc: string }[] = [
    { type: 'image', label: 'Chèn Ảnh', icon: ImageIcon, colorClass: 'border-pink-500/40 bg-pink-950/40 text-pink-300 hover:bg-pink-600 hover:text-white', desc: 'Chèn hình học, đồ thị hàm số, bảng số liệu' },
    { type: 'media', label: 'Video / Âm Thanh', icon: Film, colorClass: 'border-rose-500/40 bg-rose-950/40 text-rose-300 hover:bg-rose-600 hover:text-white', desc: 'Chèn video YouTube, mp4 bài giảng, âm thanh' },
    { type: 'lesson_title', label: 'Tiêu Đề Bài Học', icon: Type, colorClass: 'border-blue-500/40 bg-blue-950/40 text-blue-300 hover:bg-blue-600 hover:text-white', desc: 'Tiêu đề chương/bài và công thức tổng quát' },
    { type: 'content', label: 'Lý Thuyết', icon: FileText, colorClass: 'border-purple-500/40 bg-purple-950/40 text-purple-300 hover:bg-purple-600 hover:text-white', desc: 'Kiến thức cốt lõi, công thức, giải thích' },
    { type: 'takeaway', label: 'Ghi Nhớ SGK', icon: Bookmark, colorClass: 'border-indigo-500/40 bg-indigo-950/40 text-indigo-300 hover:bg-indigo-600 hover:text-white', desc: 'Khung định nghĩa, định lý, hệ quả quan trọng' },
    { type: 'example', label: 'Ví Dụ', icon: Lightbulb, colorClass: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-600 hover:text-white', desc: 'Bài toán mẫu có các bước giải và đáp số' },
    { type: 'practice', label: 'Luyện Tập', icon: Dumbbell, colorClass: 'border-sky-500/40 bg-sky-950/40 text-sky-300 hover:bg-sky-600 hover:text-white', desc: 'Bài tập học sinh rèn luyện trên lớp' },
    { type: 'activity', label: 'Hoạt Động', icon: Zap, colorClass: 'border-amber-500/40 bg-amber-950/40 text-amber-300 hover:bg-amber-600 hover:text-white', desc: 'Hoạt động trải nghiệm, khám phá tìm tòi' },
    { type: 'note', label: 'Chú Ý', icon: AlertTriangle, colorClass: 'border-rose-500/40 bg-rose-950/40 text-rose-300 hover:bg-rose-600 hover:text-white', desc: 'Lưu ý, quy ước đặc biệt, lỗi sai thường gặp' },
    { type: 'application', label: 'Vận Dụng', icon: Compass, colorClass: 'border-teal-500/40 bg-teal-950/40 text-teal-300 hover:bg-teal-600 hover:text-white', desc: 'Bài toán gắn liền đời sống thực tế' },
    { type: 'objectives', label: 'Mục Tiêu', icon: Target, colorClass: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-600 hover:text-white', desc: 'Mục tiêu kiến thức, kĩ năng cần đạt' },
    { type: 'opening_problem', label: 'Khởi Động', icon: Rocket, colorClass: 'border-amber-500/40 bg-amber-950/40 text-amber-300 hover:bg-amber-600 hover:text-white', desc: 'Tình huống mở đầu, đố vui dẫn dắt' },
  ];

  // Active tools count indicator
  const activeToolCount =
    (showStylePanel ? 1 : 0) +
    (showFontSizeToolbar ? 1 : 0) +
    (showMathToolbar ? 1 : 0);

  // Blocks of current slide
  const currentBlocks = currentSlide ? getSlideBlocks(currentSlide) : [];
  const slideBgColor = currentSlide?.styleConfig?.backgroundColor || '#103463';

  const getBlockHeaderBadge = (type: SlideBlockType) => {
    switch (type) {
      case 'image':
        return { icon: ImageIcon, label: 'HÌNH ẢNH', badgeColor: 'text-pink-300 border-pink-500/40 bg-pink-950/60' };
      case 'media':
        return { icon: Film, label: 'VIDEO / ÂM THANH', badgeColor: 'text-rose-300 border-rose-500/40 bg-rose-950/60' };
      case 'lesson_title':
        return { icon: Type, label: 'TIÊU ĐỀ BÀI HỌC', badgeColor: 'text-blue-300 border-blue-500/40 bg-blue-950/60' };
      case 'content':
        return { icon: FileText, label: 'LÝ THUYẾT', badgeColor: 'text-purple-300 border-purple-500/40 bg-purple-950/60' };
      case 'takeaway':
        return { icon: Bookmark, label: 'GHI NHỚ TRỌNG TÂM', badgeColor: 'text-indigo-300 border-indigo-500/40 bg-indigo-950/60' };
      case 'example':
        return { icon: Lightbulb, label: 'VÍ DỤ MINH HỌA', badgeColor: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/60' };
      case 'practice':
        return { icon: Dumbbell, label: 'LUYỆN TẬP', badgeColor: 'text-sky-300 border-sky-500/40 bg-sky-950/60' };
      case 'activity':
        return { icon: Zap, label: 'HOẠT ĐỘNG KHÁM PHÁ', badgeColor: 'text-amber-300 border-amber-500/40 bg-amber-950/60' };
      case 'note':
        return { icon: AlertTriangle, label: 'CHÚ Ý / CẢNH BÁO', badgeColor: 'text-rose-300 border-rose-500/40 bg-rose-950/60' };
      case 'application':
        return { icon: Compass, label: 'VẬN DỤNG THỰC TẾ', badgeColor: 'text-teal-300 border-teal-500/40 bg-teal-950/60' };
      case 'objectives':
        return { icon: Target, label: 'MỤC TIÊU BÀI HỌC', badgeColor: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/60' };
      case 'opening_problem':
        return { icon: Rocket, label: 'TÌNH HUỐNG MỞ ĐẦU', badgeColor: 'text-amber-300 border-amber-500/40 bg-amber-950/60' };
      default:
        return { icon: FileText, label: 'KHỐI NỘI DUNG', badgeColor: 'text-slate-300 border-slate-700 bg-slate-900/60' };
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* ============================================================== */}
      {/* 3-WINDOW WORKSPACE CONTAINER (LEFT THUMBNAILS + CENTER CANVAS) */}
      {/* ============================================================== */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ============================================================== */}
        {/* WINDOW 1 (LEFT): DANH SÁCH TRANG CHIẾU (SLIDE THUMBNAIL STRIP) */}
        {/* ============================================================== */}
        <aside className="w-48 sm:w-56 md:w-60 bg-[#edf1f7] border-r border-slate-300/80 flex flex-col shrink-0 h-full z-20 text-slate-800">
          {/* Header: "Trang chiếu [Count]" & "+ Thêm" */}
          <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-slate-200/90 shrink-0 bg-[#e8edf5]">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-800">Trang chiếu</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300/60 shadow-xs">
                {slides.length}
              </span>
            </div>
            <button
              onClick={handleAddNewBlankSlide}
              title="Thêm nhanh 1 slide trống ngay sau slide hiện tại"
              className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-white/80 px-2 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-rose-500" />
              <span>Thêm</span>
            </button>
          </div>

          {/* Thumbnail List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {slides.map((slide, idx) => {
              const isActive = idx === safeIndex;
              const preview = getThumbnailPreview(slide);
              const thumbBg = slide.styleConfig?.backgroundColor || '#103463';

              return (
                <div
                  key={slide.id || idx}
                  className="group flex items-start gap-2 relative"
                >
                  {/* Slide number on the left */}
                  <span className="text-xs font-semibold text-slate-500 w-4 pt-1 text-right shrink-0 select-none">
                    {idx + 1}
                  </span>

                  {/* Thumbnail Card */}
                  <div
                    onClick={() => onSelectSlide(idx)}
                    className={`relative flex-1 aspect-video rounded-xl overflow-hidden cursor-pointer transition-all duration-150 p-2.5 flex flex-col justify-between select-none ${
                      isActive
                        ? 'border-2 border-[#e11d48] ring-2 ring-[#e11d48]/80 shadow-lg scale-[1.01]'
                        : 'border border-slate-300 hover:border-slate-400 hover:shadow-md'
                    }`}
                    style={{ backgroundColor: thumbBg }}
                  >
                    {/* Render Floating Text Boxes inside thumbnail */}
                    {slide.textBoxes &&
                      slide.textBoxes.map((box) => {
                        if (!box.text || !box.text.trim()) return null;
                        const cleanText = box.text.replace(/\$/g, '').trim();
                        return (
                          <div
                            key={box.id}
                            className="absolute overflow-hidden truncate pointer-events-none select-none z-10"
                            style={{
                              left: `${box.x}%`,
                              top: `${box.y}%`,
                              maxWidth: `${box.width || 80}%`,
                              fontSize: `${Math.max(6, Math.min(10, Math.round((box.fontSize || 24) * 0.28)))}px`,
                              color: box.color || '#ffffff',
                              fontWeight: box.fontWeight || 'normal',
                              fontStyle: box.fontStyle || 'normal',
                              textAlign: box.textAlign || 'left',
                              lineHeight: 1.15,
                            }}
                          >
                            {cleanText}
                          </div>
                        );
                      })}

                    {/* Thumbnail inner content from blocks if no text boxes */}
                    {preview && (!slide.textBoxes || slide.textBoxes.length === 0) && (
                      <div className="space-y-0.5 overflow-hidden z-10">
                        <div className={`text-[8.5px] font-black uppercase tracking-wider truncate ${preview.badgeColor}`}>
                          {preview.badge}
                        </div>
                        {preview.subtitle && (
                          <div className="text-[7.5px] text-white/80 line-clamp-2 leading-tight font-sans">
                            {preview.subtitle}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Miniature footer line */}
                    <div className="flex items-center justify-between text-[7px] text-white/40 mt-auto pt-1 z-10">
                      <span>Slide {idx + 1}</span>
                      {slide.textBoxes && slide.textBoxes.length > 0 ? (
                        <span>{slide.textBoxes.length} text box</span>
                      ) : slide.blocks && slide.blocks.length > 0 ? (
                        <span>{slide.blocks.length} khối</span>
                      ) : null}
                    </div>

                    {/* Hover Quick Actions */}
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-slate-950/80 p-0.5 rounded-lg backdrop-blur-sm z-10">
                      {idx > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveSlide(idx, 'up');
                          }}
                          title="Di chuyển lên"
                          className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                      )}
                      {idx < slides.length - 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveSlide(idx, 'down');
                          }}
                          title="Di chuyển xuống"
                          className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateSlide(slide, idx);
                        }}
                        title="Nhân bản slide"
                        className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDelete(slide);
                        }}
                        title="Xóa slide này"
                        className="p-1 text-rose-400 hover:text-rose-200 rounded hover:bg-rose-950/50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Pinned Button: "+ Thêm slide mới" */}
          <div className="p-3 bg-[#e8edf5] border-t border-slate-300/80 shrink-0">
            <button
              onClick={handleAddNewBlankSlide}
              title="Tạo thêm slide trống mới"
              className="w-full bg-white hover:bg-slate-50 border border-slate-300/90 hover:border-slate-400 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Thêm slide mới</span>
            </button>
          </div>
        </aside>

        {/* ============================================================== */}
        {/* WINDOW 2 (CENTER): KHUNG CHIẾU SLIDE CHÍNH & VÙNG LÀM VIỆC     */}
        {/* ============================================================== */}
        <main className="flex-1 flex flex-col bg-[#e6ebf2] overflow-hidden relative">
          {/* Top Control Header of Center Window */}
          <header className="px-4 py-2 bg-white/90 border-b border-slate-300/80 flex items-center justify-between gap-3 shadow-xs shrink-0 z-20 backdrop-blur-md">
            {/* Left: Slide navigation & View Mode switch */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Prev / Next Slide button */}
              <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-300">
                <button
                  onClick={() => safeIndex > 0 && onSelectSlide(safeIndex - 1)}
                  disabled={safeIndex === 0}
                  title="Về slide trước (Mũi tên trái)"
                  className="p-1.5 text-slate-600 hover:text-slate-950 disabled:opacity-30 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-700 px-2 font-mono">
                  {safeIndex + 1} / {slides.length}
                </span>
                <button
                  onClick={() => safeIndex < slides.length - 1 && onSelectSlide(safeIndex + 1)}
                  disabled={safeIndex === slides.length - 1}
                  title="Sang slide sau (Mũi tên phải)"
                  className="p-1.5 text-slate-600 hover:text-slate-950 disabled:opacity-30 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Nút Zoom kích thước Slide: Thu nhỏ (-) / Tỉ lệ % / Phóng to (+) */}
              <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-300 shadow-2xs">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 50}
                  title="Thu nhỏ slide (-) (Ctrl + -)"
                  className="p-1.5 text-slate-600 hover:text-slate-950 disabled:opacity-30 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer flex items-center justify-center"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  title="Đặt lại tỉ lệ chuẩn 100% (Ctrl + 0)"
                  className="text-xs font-bold text-slate-700 px-1.5 font-mono hover:text-indigo-600 rounded transition-colors cursor-pointer min-w-[42px] text-center"
                >
                  {zoomLevel}%
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 200}
                  title="Phóng to slide (+) (Ctrl + +)"
                  className="p-1.5 text-slate-600 hover:text-slate-950 disabled:opacity-30 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer flex items-center justify-center"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Thông tin nhanh bài giảng đang soạn (Lớp, Môn, Tác giả) */}
              <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-600 pl-2 border-l border-slate-300 max-w-md truncate">
                <span className="font-bold text-indigo-700 shrink-0">
                  {lesson.gradeLevel || lesson.grade}
                </span>
                {lesson.subject && (
                  <>
                    <span className="text-slate-400">·</span>
                    <span className="font-semibold text-emerald-700 shrink-0">
                      {lesson.subject}
                    </span>
                  </>
                )}
                {lesson.author && (
                  <>
                    <span className="text-slate-400">·</span>
                    <span className="font-medium text-slate-700 truncate">
                      GV: {lesson.author}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Right: Chèn Ảnh, Video / Âm Thanh, Text Box đứng cạnh "Công cụ", Fullscreen TV, Print */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {/* Chèn Ảnh */}
              <button
                type="button"
                onClick={() => handleAddBlock('image', 'Chèn Ảnh')}
                title="Chèn ảnh hình vẽ, sơ đồ, đồ thị minh họa"
                className="p-1.5 px-2.5 rounded-xl bg-white hover:bg-pink-50 border border-slate-300 hover:border-pink-300 text-slate-800 hover:text-pink-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-pink-600" />
                <span className="hidden sm:inline">Chèn Ảnh</span>
              </button>

              {/* Video / Âm Thanh */}
              <button
                type="button"
                onClick={() => handleAddBlock('media', 'Video / Âm Thanh')}
                title="Chèn video YouTube, mp4 bài giảng, file âm thanh giải thích"
                className="p-1.5 px-2.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-300 hover:border-rose-300 text-slate-800 hover:text-rose-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Film className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Video / Âm Thanh</span>
              </button>

              {/* Text Box */}
              <button
                type="button"
                onClick={handleAddTextBox}
                title="Chèn Hộp Chữ Tự Do (PowerPoint Text Box)"
                className="p-1.5 px-2.5 rounded-xl bg-white hover:bg-indigo-50 border border-slate-300 hover:border-indigo-300 text-slate-800 hover:text-indigo-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Type className="w-3.5 h-3.5 text-indigo-600" />
                <span>Text Box</span>
              </button>

              {/* "CÔNG CỤ" DROPDOWN BUTTON (Đã tích hợp Text Box & 12 công cụ sư phạm) */}
              <div className="relative" ref={toolsMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowToolsMenu(!showToolsMenu)}
                  title="Mở menu Công cụ: Thêm Text Box, Chèn khối, Định dạng, Hỗ trợ soạn thảo & Quản lý Slide"
                  className={`p-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer ${
                    showToolsMenu
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-indigo-600/30'
                      : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Công cụ</span>
                  {(activeToolCount > 0 || (currentSlide?.textBoxes && currentSlide.textBoxes.length > 0)) && (
                    <span className="min-w-4 h-4 px-1 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                      {(currentSlide?.textBoxes?.length || 0) + activeToolCount}
                    </span>
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      showToolsMenu ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>

                {/* DROPDOWN MENU */}
                {showToolsMenu && (
                  <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[480px] bg-slate-950/98 border border-slate-800 rounded-2xl shadow-2xl z-50 backdrop-blur-xl p-4 space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-150 text-white">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black uppercase tracking-wider text-white">
                            Hộp Công Cụ Sư Phạm
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Chèn Text Box, chèn khối, định dạng & quản lý slide
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowToolsMenu(false)}
                        className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Toast notification */}
                    {addedBlockToast && (
                      <div className="p-2 px-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{addedBlockToast}</span>
                      </div>
                    )}

                    {/* 1. CHÈN VĂN BẢN & KHỐI SƯ PHẠM */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                        <span className="flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5" />
                          Chèn Hộp Chữ & Khối Sư Phạm
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal lowercase">
                          (chèn vào slide)
                        </span>
                      </div>

                      {/* TEXT BOX TOOL (ĐÃ GỘP VÀO HỘP CÔNG CỤ) */}
                      <button
                        type="button"
                        onClick={() => {
                          handleAddTextBox();
                          setShowToolsMenu(false);
                        }}
                        title="Chèn Hộp Văn Bản tự do (PowerPoint Text Box) - Kéo thả, chỉnh cỡ chữ, màu sắc & công thức"
                        className="w-full p-2.5 rounded-xl border border-indigo-500/60 bg-gradient-to-r from-indigo-950/90 via-slate-900 to-indigo-950/90 hover:from-indigo-900 hover:to-indigo-800 text-white flex items-center justify-between transition-all shadow-md group cursor-pointer active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-600 border border-indigo-400/50 flex items-center justify-center font-black text-white text-sm shadow group-hover:scale-105 transition-transform">
                            A
                          </div>
                          <div className="text-left">
                            <div className="text-xs font-bold text-white flex items-center gap-2">
                              <span>Hộp Chữ Tự Do (Text Box)</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 font-semibold border border-indigo-400/30">
                                PowerPoint
                              </span>
                              {currentSlide?.textBoxes && currentSlide.textBoxes.length > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  Đang có {currentSlide.textBoxes.length} hộp
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-300">
                              Kéo thả vị trí, chỉnh cỡ chữ (20-34pt), màu sắc, phông nền & công thức LaTeX
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-indigo-300 group-hover:text-white text-xs font-bold transition-colors shrink-0">
                          <span>+ Chèn</span>
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                      </button>

                      {/* 12 Khối sư phạm chuẩn */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {BLOCK_MENU_ITEMS.map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.type}
                              type="button"
                              onClick={() => handleAddBlock(item.type, item.label)}
                              title={item.desc}
                              className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-bold transition-all shadow-xs active:scale-95 text-left cursor-pointer ${item.colorClass}`}
                            >
                              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. ĐỊNH DẠNG & TRỢ LÝ GIẢNG DẠY */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Định Dạng & Trợ Lý Giảng Dạy</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {/* Font Size Toolbar */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowFontSizeToolbar(!showFontSizeToolbar);
                            setShowToolsMenu(false);
                          }}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                            showFontSizeToolbar
                              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                              : 'bg-slate-900 hover:bg-slate-800 text-indigo-300 border-slate-800'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Type className="w-3.5 h-3.5" />
                            Cỡ Chữ (20-34pt)
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${showFontSizeToolbar ? 'bg-indigo-800 text-white' : 'bg-slate-800 text-slate-400'}`}>
                            {showFontSizeToolbar ? 'Bật' : 'Tắt'}
                          </span>
                        </button>

                        {/* LaTeX Math Toolbar */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowMathToolbar(!showMathToolbar);
                            setShowToolsMenu(false);
                          }}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                            showMathToolbar
                              ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                              : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-800'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Sigma className="w-3.5 h-3.5" />
                            Toán LaTeX ($)
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${showMathToolbar ? 'bg-amber-800 text-white' : 'bg-slate-800 text-slate-400'}`}>
                            {showMathToolbar ? 'Bật' : 'Tắt'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* 3. THAO TÁC SLIDE */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>Thao Tác Slide</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleAddNewBlankSlide();
                            setShowToolsMenu(false);
                          }}
                          className="p-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Slide Trống</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleClearSlideToBlank();
                            setShowToolsMenu(false);
                          }}
                          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                          <span>Làm mới trống</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (currentSlide) handleOpenDelete(currentSlide);
                            setShowToolsMenu(false);
                          }}
                          className="p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa Slide</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Play Animations Preview Button */}
              <button
                type="button"
                onClick={() => setSlideAnimTrigger((prev) => prev + 1)}
                title="Chạy thử toàn bộ hiệu ứng các khối Text Box trên slide này"
                className="px-3 py-1.5 rounded-xl bg-purple-600/90 hover:bg-purple-600 border border-purple-400/40 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Chạy Hiệu Ứng</span>
              </button>

              {/* Present / Fullscreen Button */}
              <button
                onClick={() => setIsFullscreen(true)}
                title="Bắt đầu trình chiếu toàn màn hình chuẩn TV (Phím F5)"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Trình Chiếu (F5)</span>
              </button>

              {/* Print Slide */}
              {onOpenPrintView && (
                <button
                  onClick={onOpenPrintView}
                  title="Xuất PDF hoặc In Slide"
                  className="p-1.5 px-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden md:inline">In Slide</span>
                </button>
              )}
            </div>
          </header>

          {/* Quick Toolbar Palettes if toggled */}
          {showFontSizeToolbar && (
            <div className="bg-slate-900 border-b border-slate-800 p-2 shrink-0 z-10 flex justify-center">
              <SlideSelectionFontSizeToolbar />
            </div>
          )}
          {showMathToolbar && (
            <div className="bg-slate-900 border-b border-slate-800 p-2 shrink-0 z-10">
              <MathToolbar onInsert={(latex) => {}} />
            </div>
          )}

          {/* Toast Notification */}
          {addedBlockToast && (
            <div className="absolute top-14 right-4 z-40 bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xl animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{addedBlockToast}</span>
            </div>
          )}

          {/* MAIN STAGE: CENTERED 16:9 SLIDE CANVAS */}
          <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-20 flex flex-col items-center custom-scrollbar">
            {/* Zoom Wrapper */}
            <div
              className="relative shrink-0 transition-all duration-150 my-2 shadow-[0_15px_45px_rgba(0,0,0,0.35)] rounded-xl"
              style={{
                width: `${Math.round(960 * (zoomLevel / 100))}px`,
                height: `${Math.round(540 * (zoomLevel / 100))}px`,
              }}
            >
              <div
                className="w-[960px] h-[540px] rounded-xl overflow-hidden flex flex-col absolute top-0 left-0 border border-slate-800/40"
                style={{
                  backgroundColor: slideBgColor,
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top left',
                  width: '960px',
                  height: '540px',
                }}
                onClick={() => setSelectedTextBoxId(null)}
              >
              {/* PowerPoint Floating Text Boxes Overlay */}
              <SlideTextBoxOverlay
                textBoxes={currentSlide?.textBoxes || EMPTY_TEXT_BOXES}
                isEditable={true}
                selectedBoxId={selectedTextBoxId}
                onSelectBox={(id) => setSelectedTextBoxId(id)}
                onUpdateTextBox={handleUpdateTextBox}
                onDeleteTextBox={handleDeleteTextBox}
                onDuplicateTextBox={handleDuplicateTextBox}
                animationPlayTrigger={slideAnimTrigger}
              />

              {/* SLIDE CANVAS INNER CONTENT */}
              {currentBlocks.length > 0 ? (
                /* SLIDE WITH BLOCKS */
                <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar space-y-4 text-white font-sans">
                  {currentBlocks.map((block, bIdx) => {
                    const badge = getBlockHeaderBadge(block.type);
                    const Icon = badge.icon;

                    return (
                      <div
                        key={block.id || bIdx}
                        className={`group relative rounded-2xl border ${
                          block.isHidden
                            ? 'border-amber-500/60 bg-amber-950/20 border-dashed opacity-65'
                            : 'border-white/10 hover:border-indigo-400/50 bg-black/20 hover:bg-black/30'
                        } p-4 transition-all duration-150 space-y-3`}
                      >
                        {/* Block Action Header: Badge + Edit + Hide/Show + Move Up + Move Down + Delete */}
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                          <div className="flex items-center gap-2">
                            <div className={`px-2.5 py-1 rounded-lg border text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${badge.badgeColor}`}>
                              <Icon className="w-3.5 h-3.5" />
                              <span>{block.title || badge.label}</span>
                            </div>
                            {block.isHidden && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 font-bold">
                                <EyeOff className="w-3 h-3 text-amber-300" />
                                <span>Đang ẩn</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                            {/* Nút Ẩn / Hiện Khối Đối Tượng */}
                            <button
                              type="button"
                              onClick={() => handleToggleBlockVisibility(block.id)}
                              title={block.isHidden ? "Khối đối tượng này đang ẩn. Nhấp để hiện lại" : "Ẩn khối đối tượng này (khỏi bài giảng / trình chiếu)"}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer ${
                                block.isHidden
                                  ? 'bg-amber-600 hover:bg-amber-500 text-white ring-1 ring-amber-400'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                              }`}
                            >
                              {block.isHidden ? (
                                <>
                                  <EyeOff className="w-3 h-3 text-amber-200" />
                                  <span>Hiện</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3 h-3 text-slate-400" />
                                  <span>Ẩn</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => {
                                setEditingBlock(block);
                                setIsBlockModalOpen(true);
                              }}
                              title="Tùy chỉnh & Chỉnh sửa khối này"
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Chỉnh sửa</span>
                            </button>

                            {bIdx > 0 && (
                              <button
                                onClick={() => handleMoveBlock(bIdx, 'up')}
                                title="Di chuyển lên trên"
                                className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {bIdx < currentBlocks.length - 1 && (
                              <button
                                onClick={() => handleMoveBlock(bIdx, 'down')}
                                title="Di chuyển xuống dưới"
                                className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteBlock(block.id)}
                              title="Xóa khối khỏi trang chiếu"
                              className="p-1 rounded-lg bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* 1. LESSON TITLE */}
                        {block.type === 'lesson_title' && (
                          <div className="space-y-2 border-b border-white/20 pb-3">
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-300 tracking-tight">
                              <MathView text={block.title || 'Tiêu Đề Bài Học'} />
                            </h2>
                            {block.subtitle && (
                              <div className="text-sm sm:text-base text-white/90">
                                <MathView text={block.subtitle} />
                              </div>
                            )}
                            {block.keyFormula && (
                              <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-400/40 text-center font-mono text-amber-300">
                                <MathView text={`$$${block.keyFormula}$$`} />
                              </div>
                            )}
                            {block.content && (
                              <div className="text-xs sm:text-sm text-white/80">
                                <MathView text={block.content} />
                              </div>
                            )}
                          </div>
                        )}

                        {/* 2. OPENING PROBLEM */}
                        {block.type === 'opening_problem' && (
                          <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-2">
                            <div className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                              <Rocket className="w-4 h-4" />
                              <span>{block.title || 'BÀI TOÁN MỞ ĐẦU'}</span>
                            </div>
                            {(block.context || block.content) && (
                              <div className="text-sm sm:text-base text-white/95 leading-relaxed">
                                <MathView text={block.context || block.content || ''} />
                              </div>
                            )}
                            {block.question && (
                              <div className="text-sm font-semibold text-amber-200 pt-1">
                                ❓ <MathView text={block.question} />
                              </div>
                            )}
                            {block.conclusion && (
                              <div className="text-xs sm:text-sm text-amber-100 bg-amber-900/30 p-2.5 rounded-xl border border-amber-500/30 font-medium">
                                💡 <MathView text={block.conclusion} />
                              </div>
                            )}
                          </div>
                        )}

                        {/* 3. CONTENT / LÝ THUYẾT */}
                        {block.type === 'content' && (
                          <div className="p-4 sm:p-5 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-2">
                            <div className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                              <FileText className="w-4 h-4" />
                              <span>{block.title || 'LÝ THUYẾT'}</span>
                            </div>
                            {block.content && (
                              <div className="text-sm sm:text-base text-white/95 leading-relaxed">
                                <MathView text={block.content} />
                              </div>
                            )}
                          </div>
                        )}

                        {/* 4. TAKEAWAY / GHI NHỚ */}
                        {block.type === 'takeaway' && (
                          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-950/50 border border-indigo-500/50 space-y-2 shadow-inner">
                            <div className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                              <Bookmark className="w-4 h-4" />
                              <span>{block.title || 'GHI NHỚ TRỌNG TÂM'}</span>
                            </div>
                            {block.content && (
                              <div className="text-sm sm:text-base font-medium text-white/95 leading-relaxed">
                                <MathView text={block.content} />
                              </div>
                            )}
                          </div>
                        )}

                        {/* 5. EXAMPLE / VÍ DỤ */}
                        {block.type === 'example' && (
                          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
                            <div className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                              <Lightbulb className="w-4 h-4" />
                              <span>{block.title || 'VÍ DỤ MINH HỌA'}</span>
                            </div>
                            {block.problem && (
                              <div className="text-sm sm:text-base text-white/95 font-medium leading-relaxed">
                                <MathView text={block.problem} />
                              </div>
                            )}
                            {block.solutionSteps && block.solutionSteps.length > 0 && (
                              <div className="space-y-1.5 pt-2 border-t border-emerald-500/30 text-xs sm:text-sm text-emerald-100/90">
                                <div className="font-bold text-emerald-300">Lời giải:</div>
                                {block.solutionSteps.map((step, sIdx) => (
                                  <div key={sIdx} className="pl-3 border-l-2 border-emerald-400/50">
                                    <MathView text={step} />
                                  </div>
                                ))}
                              </div>
                            )}
                            {block.finalAnswer && (
                              <div className="text-xs sm:text-sm font-bold text-emerald-300 bg-emerald-950/60 p-2 rounded-xl border border-emerald-500/40">
                                Đáp số: <MathView text={block.finalAnswer} />
                              </div>
                            )}
                          </div>
                        )}

                        {/* 6. PRACTICE / LUYỆN TẬP */}
                        {block.type === 'practice' && (
                          <div className="p-4 sm:p-5 rounded-2xl bg-sky-950/40 border border-sky-500/40 space-y-3">
                            <div className="text-xs font-black uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                              <Dumbbell className="w-4 h-4" />
                              <span>{block.title || 'LUYỆN TẬP'}</span>
                            </div>
                            {block.problem && (
                              <div className="text-sm sm:text-base text-white/95 font-medium leading-relaxed">
                                <MathView text={block.problem} />
                              </div>
                            )}
                            {block.hint && (
                              <div className="text-xs sm:text-sm text-sky-200/90 italic">
                                💡 Gợi ý: <MathView text={block.hint} />
                              </div>
                            )}
                            {block.solution && (
                              <div className="text-xs sm:text-sm text-sky-100/90 pt-2 border-t border-sky-500/30">
                                <span className="font-bold text-sky-300">Hướng dẫn: </span>
                                <MathView text={block.solution} />
                              </div>
                            )}
                          </div>
                        )}

                        {/* 7. IMAGE BLOCK */}
                        {block.type === 'image' && (
                          <div>
                            {block.imageUrl ? (
                              <div className="flex flex-col items-center justify-center my-2">
                                <img
                                  src={block.imageUrl}
                                  alt={block.imageAlt || 'Hình minh họa'}
                                  className="max-h-72 object-contain rounded-xl border border-white/20 shadow-lg bg-black/30"
                                  style={{ width: `${block.imageWidthPercent || 50}%` }}
                                />
                                {block.imageCaption && (
                                  <div className="text-xs text-white/70 italic mt-1.5 text-center">
                                    <MathView text={block.imageCaption} />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div
                                onClick={() => {
                                  setEditingBlock(block);
                                  setIsBlockModalOpen(true);
                                }}
                                className="p-6 rounded-2xl border-2 border-dashed border-pink-500/40 bg-pink-950/20 hover:bg-pink-950/40 flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-2 group/empty"
                              >
                                <div className="p-3 rounded-full bg-pink-500/20 text-pink-300 group-hover/empty:scale-110 transition-transform">
                                  <ImageIcon className="w-6 h-6" />
                                </div>
                                <div className="text-sm font-bold text-pink-200">
                                  Khối Hình Ảnh Chưa Có Ảnh
                                </div>
                                <p className="text-xs text-slate-400 max-w-sm">
                                  Bấm vào đây để tải ảnh từ máy tính hoặc dán đường link ảnh vào trang chiếu
                                </p>
                                <button className="mt-1 px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold flex items-center gap-1 shadow">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Chọn Ảnh / Chỉnh Sửa</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 8. MEDIA BLOCK */}
                        {block.type === 'media' && (
                          <div>
                            {block.mediaUrl ? (
                              <MediaBlockRenderer block={block} />
                            ) : (
                              <div
                                onClick={() => {
                                  setEditingBlock(block);
                                  setIsBlockModalOpen(true);
                                }}
                                className="p-6 rounded-2xl border-2 border-dashed border-rose-500/40 bg-rose-950/20 hover:bg-rose-950/40 flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-2 group/empty"
                              >
                                <div className="p-3 rounded-full bg-rose-500/20 text-rose-300 group-hover/empty:scale-110 transition-transform">
                                  <Film className="w-6 h-6" />
                                </div>
                                <div className="text-sm font-bold text-rose-200">
                                  Khối Video / Âm Thanh Chưa Có Link
                                </div>
                                <p className="text-xs text-slate-400 max-w-sm">
                                  Bấm vào đây để dán liên kết YouTube, Google Drive hoặc tệp MP4/MP3
                                </p>
                                <button className="mt-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1 shadow">
                                  <Pencil className="w-3.5 h-3.5" />
                                  <span>Dán Link Video / Chỉnh Sửa</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 9. ACTIVITY */}
                        {block.type === 'activity' && (
                          <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-3">
                            <div className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                              <Zap className="w-4 h-4" />
                              <span>{block.title || 'HOẠT ĐỘNG KHÁM PHÁ'}</span>
                            </div>
                            {(block.description || block.context) && (
                              <div className="text-sm sm:text-base text-white/95 leading-relaxed">
                                <MathView text={block.description || block.context || ''} />
                              </div>
                            )}
                            {block.question && (
                              <div className="text-sm font-semibold text-amber-200 pt-1">
                                ❓ <MathView text={block.question} />
                              </div>
                            )}
                            {block.conclusion && (
                              <div className="text-xs sm:text-sm text-amber-100 bg-amber-900/30 p-2.5 rounded-xl border border-amber-500/30 font-medium">
                                💡 <MathView text={block.conclusion} />
                              </div>
                            )}
                          </div>
                        )}

                        {/* 10. NOTE / CHÚ Ý */}
                        {block.type === 'note' && (
                          <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-2">
                            <div className="text-xs font-black uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4" />
                              <span>{block.title || 'CHÚ Ý QUAN TRỌNG'}</span>
                            </div>
                            {block.content && (
                              <div className="text-sm sm:text-base text-white/95 leading-relaxed">
                                <MathView text={block.content} />
                              </div>
                            )}
                          </div>
                        )}

                        {/* 11. APPLICATION / VẬN DỤNG */}
                        {block.type === 'application' && (
                          <div className="p-4 sm:p-5 rounded-2xl bg-teal-950/40 border border-teal-500/40 space-y-3">
                            <div className="text-xs font-black uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                              <Compass className="w-4 h-4" />
                              <span>{block.title || 'VẬN DỤNG THỰC TẾ'}</span>
                            </div>
                            {block.problem && (
                              <div className="text-sm sm:text-base text-white/95 font-medium leading-relaxed">
                                <MathView text={block.problem} />
                              </div>
                            )}
                            {block.solution && (
                              <div className="text-xs sm:text-sm text-teal-100/90 pt-2 border-t border-teal-500/30">
                                <span className="font-bold text-teal-300">Hướng dẫn: </span>
                                <MathView text={block.solution} />
                              </div>
                            )}
                          </div>
                        )}

                        {/* 12. OBJECTIVES / MỤC TIÊU */}
                        {block.type === 'objectives' && (
                          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
                            <div className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                              <Target className="w-4 h-4" />
                              <span>{block.title || 'MỤC TIÊU BÀI HỌC'}</span>
                            </div>
                            {block.items && block.items.length > 0 && (
                              <ul className="space-y-1.5 text-sm text-white/95">
                                {block.items.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
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
              ) : (
                /* EMPTY SLIDE CANVAS: CLEAN BLANK CANVAS (PowerPoint-style) */
                <div className="flex-1 w-full h-full" />
              )}
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* WINDOW 3 (BOTTOM): GHI CHÚ NGƯỜI THUYẾT TRÌNH (SPEAKER NOTES)   */}
          {/* ============================================================== */}
          <footer className="bg-white border-t border-slate-300/80 shrink-0 shadow-sm transition-all duration-200">
            {/* Single-line collapsed notes bar & Zoom slide bar (chuẩn PowerPoint) */}
            <div className="px-4 py-2 flex items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex-1 flex items-center gap-2 overflow-hidden">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={notesInput}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Bấm để thêm ghi chú (Click to add notes)..."
                  className="flex-1 bg-transparent border-none outline-none text-xs text-slate-800 placeholder:text-slate-400 placeholder:italic font-sans"
                />
              </div>

              {/* Right: Notes Expand/Collapse & Bottom Zoom Controls */}
              <div className="flex items-center gap-2.5 shrink-0">
                {/* Expand / Collapse toggle */}
                <button
                  onClick={() => setIsNotesExpanded(!isNotesExpanded)}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold shrink-0 px-2 py-0.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span>{isNotesExpanded ? 'Thu gọn' : 'Ghi chú'}</span>
                  {isNotesExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                </button>

                <div className="w-px h-4 bg-slate-300" />

                {/* Bottom Zoom controls (chuẩn phong cách Microsoft PowerPoint) */}
                <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-300 shadow-2xs">
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 50}
                    title="Thu nhỏ slide (-) (Ctrl + -)"
                    className="p-1 text-slate-600 hover:text-slate-950 disabled:opacity-30 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer flex items-center justify-center"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    title="Đặt lại tỉ lệ chuẩn 100% (Ctrl + 0)"
                    className="text-[11px] font-bold text-slate-700 px-1.5 font-mono hover:text-indigo-600 rounded transition-colors cursor-pointer min-w-[38px] text-center"
                  >
                    {zoomLevel}%
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 200}
                    title="Phóng to slide (+) (Ctrl + +)"
                    className="p-1 text-slate-600 hover:text-slate-950 disabled:opacity-30 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer flex items-center justify-center"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Multi-line Notes Panel */}
            {isNotesExpanded && (
              <div className="px-4 pb-3 pt-1 border-t border-slate-200/80 bg-slate-50/80 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-bold uppercase tracking-wider text-indigo-600">
                    Lời thoại & Kịch bản giảng dạy (Chỉ giáo viên xem thấy)
                  </span>
                  <span>Hỗ trợ công thức LaTeX: $công\_thức$</span>
                </div>
                <textarea
                  rows={4}
                  value={notesInput}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Nhập chi tiết lời giảng của giáo viên cho slide này, câu hỏi dẫn dắt, lưu ý phản xạ của học sinh..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-400 font-sans custom-scrollbar leading-relaxed"
                />
                {notesInput.includes('$') && (
                  <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-950">
                    <span className="font-bold text-indigo-700">Xem trước LaTeX: </span>
                    <MathView text={notesInput} />
                  </div>
                )}
              </div>
            )}
          </footer>
        </main>
      </div>

      {/* ============================================================== */}
      {/* FULLSCREEN TV PRESENTATION OVERLAY (Khi bấm F5 / Trình Chiếu)  */}
      {/* ============================================================== */}
      <FullscreenPresentationModal
        lesson={lesson}
        initialSlideIndex={safeIndex}
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        onSelectSlide={onSelectSlide}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && slideToDelete && (
        <DeleteSlideModal
          isOpen={isDeleteModalOpen}
          slide={slideToDelete}
          totalSlides={slides.length}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirmDelete={handleConfirmDelete}
        />
      )}

      {/* Block / TextBox / Clear Slide Irreversible Delete Confirmation Modal */}
      {confirmDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => setConfirmDeleteDialog(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">{confirmDeleteDialog.title}</h3>
              <p className="text-xs text-rose-300 font-semibold mt-1">
                ⚠️ Lưu ý: Xóa vĩnh viễn ngay lập tức và không thể khôi phục!
              </p>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                {confirmDeleteDialog.message}
              </p>
              {confirmDeleteDialog.itemPreview && (
                <div className="mt-3 p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 line-clamp-2 font-medium">
                  {confirmDeleteDialog.itemPreview}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteDialog(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDeleteDialog.onConfirm();
                  setConfirmDeleteDialog(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{confirmDeleteDialog.confirmLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Edit & Customization Modal */}
      {isBlockModalOpen && editingBlock && (
        <BlockEditModal
          isOpen={isBlockModalOpen}
          block={editingBlock}
          onClose={() => {
            setIsBlockModalOpen(false);
            setEditingBlock(null);
          }}
          onSave={handleSaveBlock}
        />
      )}
    </div>
  );
};
