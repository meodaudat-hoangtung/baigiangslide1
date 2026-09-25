import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  Layers,
  FileText,
  Type,
  Palette,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  RotateCcw,
  ListOrdered,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Target,
  Compass,
  AlertTriangle,
  Bookmark,
  Lightbulb,
  Dumbbell,
  Globe2,
  CornerDownRight,
  ArrowUp,
  ArrowDown,
  X,
  Sparkles,
  Zap,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize,
  HelpCircle,
  Clock,
  MessageSquare,
  Film,
  Sliders,
  Sigma,
  Music,
  Video,
  Wrench
} from 'lucide-react';
import {
  Slide,
  SlideContentBlock,
  SlideBlockType,
  SlideStyleConfig,
  BlockAnimationEffect,
  SlideTextBox
} from '../types';
import {
  BLOCK_TYPES_META,
  getSlideBlocks,
  createDefaultBlock,
  createBlankSlide
} from '../utils/slideBlocks';
import { BLOCK_ANIMATION_PRESETS } from '../utils/slideTransitions';
import { MathView } from './MathView';
import { MathToolbar } from './MathToolbar';
import { MediaBlockRenderer } from './MediaBlockRenderer';
import { SlideSelectionFontSizeToolbar, FONT_SIZES, FontSizePt } from './SlideSelectionFontSizeToolbar';

interface SlideEditorPaneProps {
  slide: Slide;
  slideIndex: number;
  totalSlides: number;
  allSlides: Slide[];
  onSelectSlide: (index: number) => void;
  onUpdateSlide: (updatedSlide: Slide) => void;
  onAddSlide: (newSlide: Slide, insertAfterIndex?: number) => void;
  onDuplicateSlide: (slide: Slide) => void;
  onDeleteSlide: (slideId: string) => void;
  onApplyStyleToAll?: (styleConfig: SlideStyleConfig) => void;
}

const MATH_SHORTCUTS = [
  { label: 'Phân số', latex: '\\frac{a}{b}' },
  { label: 'Căn bậc 2', latex: '\\sqrt{x}' },
  { label: 'Mũ', latex: 'x^2' },
  { label: 'Chỉ số', latex: 'x_1, x_2' },
  { label: 'Vectơ', latex: '\\vec{u}' },
  { label: 'Tích phân', latex: '\\int_{a}^{b} f(x)dx' },
  { label: 'Tổng ∑', latex: '\\sum_{i=1}^{n}' },
  { label: 'Giới hạn', latex: '\\lim_{x \\to x_0}' },
  { label: 'Góc', latex: '\\widehat{ABC}' },
  { label: 'α', latex: '\\alpha' },
  { label: 'β', latex: '\\beta' },
  { label: 'Δ', latex: '\\Delta' },
  { label: 'π', latex: '\\pi' },
  { label: '±', latex: '\\pm' },
  { label: '≤', latex: '\\le' },
  { label: '≥', latex: '\\ge' },
  { label: '≠', latex: '\\neq' },
  { label: '∈', latex: '\\in' },
  { label: '⊥', latex: '\\perp' },
  { label: '∥', latex: '\\parallel' },
  { label: '⇒', latex: '\\Rightarrow' },
  { label: '⇔', latex: '\\Leftrightarrow' },
];

const SAMPLE_MATH_DIAGRAMS = [
  {
    name: 'Tam giác vuông & Pythagore',
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
    caption: 'Mô hình tam giác vuông với $a^2 + b^2 = c^2$',
  },
  {
    name: 'Đồ thị Parabol $y = ax^2 + bx + c$',
    url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
    caption: 'Đồ thị hàm số bậc hai $y = ax^2 + bx + c$',
  },
  {
    name: 'Mặt phẳng tọa độ Oxy & Vectơ',
    url: 'https://images.unsplash.com/photo-1635070040809-90656a297920?auto=format&fit=crop&w=800&q=80',
    caption: 'Hệ tọa độ Oxy và vectơ $\\vec{u} = (x; y)$',
  },
  {
    name: 'Hình khối không gian 3D',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    caption: 'Mô phỏng hình học không gian (Hình chóp / Lăng trụ)',
  },
];

const SAMPLE_MATH_MEDIA = [
  {
    name: 'Định lý Pythagore (Minh họa trực quan)',
    url: 'https://www.youtube.com/watch?v=CAkMUdeB06o',
    caption: 'Minh họa trực quan hình học định lý Pythagore: $a^2 + b^2 = c^2$',
  },
  {
    name: 'Đồ thị Parabol hàm số bậc 2',
    url: 'https://www.youtube.com/watch?v=kYJvM9l56lQ',
    caption: 'Sự biến thiên và đỉnh Parabol của hàm số $y = ax^2 + bx + c$',
  },
  {
    name: 'Khái niệm Vectơ trong không gian',
    url: 'https://www.youtube.com/watch?v=fNk_zzaMoSs',
    caption: 'Vectơ trong không gian và phép cộng vectơ $\\vec{u} + \\vec{v}$',
  },
  {
    name: 'Ý nghĩa số Pi trong toán học',
    url: 'https://www.youtube.com/watch?v=HEfHFsfGXjs',
    caption: 'Nguồn gốc và ứng dụng của hằng số $\\pi$ trong hình học',
  },
];

export const SlideEditorPane: React.FC<SlideEditorPaneProps> = ({
  slide,
  slideIndex,
  totalSlides,
  allSlides,
  onSelectSlide,
  onUpdateSlide,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onApplyStyleToAll,
}) => {
  // Current blocks on this slide
  const blocks = getSlideBlocks(slide);

  // States
  const [collapsedBlocks, setCollapsedBlocks] = useState<Record<string, boolean>>({});
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [addedBlockToast, setAddedBlockToast] = useState<string | null>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const [animConfigBlockId, setAnimConfigBlockId] = useState<string | null>(null);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showSlideOutlineModal, setShowSlideOutlineModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTeacherGuide, setShowTeacherGuide] = useState(false);
  const [showMathToolbar, setShowMathToolbar] = useState(false);
  const [showFontSizeToolbar, setShowFontSizeToolbar] = useState(false);
  const [lastActiveField, setLastActiveField] = useState<{
    blockId: string;
    fieldName: keyof SlideContentBlock;
    stepIndex?: number;
  } | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

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

  // Close tools menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showToolsMenu) {
        setShowToolsMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showToolsMenu]);

  // Active tools count indicator
  const activeToolCount =
    (showStylePanel ? 1 : 0) +
    (showFontSizeToolbar ? 1 : 0) +
    (showMathToolbar ? 1 : 0) +
    (showTeacherGuide ? 1 : 0);

  // Helper to commit block list changes
  const updateBlocks = (newBlocks: SlideContentBlock[]) => {
    // Also sync title if lesson_title block is present
    const titleBlock = newBlocks.find((b) => b.type === 'lesson_title');
    const updated: Slide = {
      ...slide,
      blocks: newBlocks,
      title: titleBlock?.title || slide.title || '',
      subtitle: titleBlock?.subtitle || slide.subtitle || '',
      sections: [], // Clear legacy sections so blocks remain primary
    };
    onUpdateSlide(updated);
  };

  // Add block
  const handleAddBlock = (type: SlideBlockType, label?: string) => {
    const newBlock = createDefaultBlock(type);
    const newBlocks = [...blocks, newBlock];
    updateBlocks(newBlocks);
    if (label) {
      setAddedBlockToast(`Đã thêm khối "${label}"`);
      setTimeout(() => setAddedBlockToast(null), 2500);
    }
  };

  // Add PowerPoint free-floating text box
  const handleAddTextBox = () => {
    if (!slide) return;
    const currentTextBoxes = slide.textBoxes || [];
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
    };
    onUpdateSlide({
      ...slide,
      textBoxes: [...currentTextBoxes, newBox],
    });
    setAddedBlockToast('Đã thêm 1 Text Box (nhấp đúp trên slide để gõ chữ, kéo để di chuyển)');
    setTimeout(() => setAddedBlockToast(null), 3000);
  };

  // Update specific block
  const handleUpdateBlock = (blockId: string, updates: Partial<SlideContentBlock>) => {
    const newBlocks = blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b));
    updateBlocks(newBlocks);
  };

  // Delete block
  const handleDeleteBlock = (blockId: string) => {
    const newBlocks = blocks.filter((b) => b.id !== blockId);
    updateBlocks(newBlocks);
  };

  // Duplicate block
  const handleDuplicateBlock = (block: SlideContentBlock) => {
    const duplicated: SlideContentBlock = {
      ...JSON.parse(JSON.stringify(block)),
      id: `block-${block.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: `${block.title} (Bản sao)`,
    };
    const blockIndex = blocks.findIndex((b) => b.id === block.id);
    const newBlocks = [...blocks];
    if (blockIndex >= 0) {
      newBlocks.splice(blockIndex + 1, 0, duplicated);
    } else {
      newBlocks.push(duplicated);
    }
    updateBlocks(newBlocks);
  };

  // Move block up
  const handleMoveBlockUp = (index: number) => {
    if (index <= 0) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index - 1];
    newBlocks[index - 1] = newBlocks[index];
    newBlocks[index] = temp;
    updateBlocks(newBlocks);
  };

  // Move block down
  const handleMoveBlockDown = (index: number) => {
    if (index >= blocks.length - 1) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index + 1];
    newBlocks[index + 1] = newBlocks[index];
    newBlocks[index] = temp;
    updateBlocks(newBlocks);
  };

  // Reset slide to blank
  const handleClearSlideToBlank = () => {
    updateBlocks([]);
  };

  // Add a brand new blank slide
  const handleAddNewBlankSlide = () => {
    const newSlide = createBlankSlide(slideIndex + 2);
    onAddSlide(newSlide, slideIndex);
    onSelectSlide(slideIndex + 1);
  };

  // Image Upload handler for a block
  const handleImageFileUpload = (blockId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, SVG, WebP, GIF)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (dataUrl) {
        handleUpdateBlock(blockId, {
          imageUrl: dataUrl,
          imageAlt: file.name,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle local video/audio file upload
  const handleMediaFileUpload = (blockId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 80 * 1024 * 1024) {
      alert('Tệp phương tiện quá lớn (>80MB). Vui lòng chọn tệp nhỏ hơn hoặc dán link YouTube / Google Drive / MP4.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (dataUrl) {
        const isAudio = file.type.startsWith('audio/');
        handleUpdateBlock(blockId, {
          mediaUrl: dataUrl,
          mediaType: isAudio ? 'audio' : 'video',
          mediaCaption: isAudio ? 'Âm thanh bài giảng: ' + file.name : 'Video bài giảng: ' + file.name,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Toggle Collapse single block
  const toggleCollapse = (blockId: string) => {
    setCollapsedBlocks((prev) => ({
      ...prev,
      [blockId]: !prev[blockId],
    }));
  };

  // Toggle Collapse or Expand ALL blocks on current slide
  const allBlocksCollapsed = blocks.length > 0 && blocks.every((b) => !!collapsedBlocks[b.id]);
  const handleToggleAllBlocks = () => {
    if (allBlocksCollapsed) {
      // Expand all
      setCollapsedBlocks({});
    } else {
      // Collapse all
      const newCollapsed: Record<string, boolean> = {};
      blocks.forEach((b) => {
        newCollapsed[b.id] = true;
      });
      setCollapsedBlocks(newCollapsed);
    }
  };

  // Insert math shortcut into active textarea/input
  const insertMathToField = (
    blockId: string,
    fieldName: keyof SlideContentBlock,
    latex: string,
    stepIndex?: number
  ) => {
    const targetBlock = blocks.find((b) => b.id === blockId);
    if (!targetBlock) return;

    const formatted = latex.startsWith('$') ? latex : `$${latex}$`;

    if (fieldName === 'solutionSteps' && typeof stepIndex === 'number') {
      const steps = [...(targetBlock.solutionSteps || [])];
      const cur = steps[stepIndex] || '';
      steps[stepIndex] = cur ? `${cur} ${formatted}` : formatted;
      handleUpdateBlock(blockId, { solutionSteps: steps });
      return;
    }

    const currentVal = (targetBlock[fieldName] as string) || '';
    const updatedVal = currentVal ? `${currentVal} ${formatted}` : formatted;
    handleUpdateBlock(blockId, { [fieldName]: updatedVal });
  };

  // Apply font size to currently highlighted text or active field
  const applyFontSizeToField = (size: FontSizePt | 'default') => {
    const activeEl = document.activeElement;
    if (
      activeEl &&
      (activeEl instanceof HTMLTextAreaElement ||
        (activeEl instanceof HTMLInputElement && activeEl.type === 'text'))
    ) {
      const start = activeEl.selectionStart ?? 0;
      const end = activeEl.selectionEnd ?? 0;
      const full = activeEl.value;
      if (start < end) {
        const raw = full.substring(start, end);
        const clean = raw.replace(/\[size=[0-9]+(?:pt|px)?\]/gi, '').replace(/\[\/size\]/gi, '');
        const replaced = size === 'default' ? clean : `[size=${size}]${clean}[/size]`;
        const nextVal = full.substring(0, start) + replaced + full.substring(end);
        const prototype =
          activeEl instanceof HTMLTextAreaElement
            ? window.HTMLTextAreaElement.prototype
            : window.HTMLInputElement.prototype;
        const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
        if (descriptor?.set) {
          descriptor.set.call(activeEl, nextVal);
        } else {
          activeEl.value = nextVal;
        }
        activeEl.dispatchEvent(new Event('input', { bubbles: true }));
        requestAnimationFrame(() => {
          activeEl.focus();
          activeEl.setSelectionRange(start, start + replaced.length);
        });
        return;
      }
    }

    // If no text highlighted in active input, but lastActiveField is known:
    if (lastActiveField) {
      const targetBlock = blocks.find((b) => b.id === lastActiveField.blockId);
      if (targetBlock) {
        const snippet = size === 'default' ? 'Nội dung' : `[size=${size}]Nội dung[/size]`;
        if (lastActiveField.fieldName === 'solutionSteps' && typeof lastActiveField.stepIndex === 'number') {
          const steps = [...(targetBlock.solutionSteps || [])];
          const cur = steps[lastActiveField.stepIndex] || '';
          steps[lastActiveField.stepIndex] = cur ? `${cur} ${snippet}` : snippet;
          handleUpdateBlock(targetBlock.id, { solutionSteps: steps });
        } else {
          const cur = (targetBlock[lastActiveField.fieldName] as string) || '';
          handleUpdateBlock(targetBlock.id, { [lastActiveField.fieldName]: cur ? `${cur} ${snippet}` : snippet });
        }
      }
    }
  };

  // Helper to render live LaTeX Math preview under any input field
  const renderMathPreview = (text: string | undefined | null, label: string = 'Xem trước công thức / cỡ chữ:') => {
    if (!text) return null;
    const hasMath =
      text.includes('$') ||
      text.includes('\\') ||
      text.includes('^') ||
      text.includes('_') ||
      text.includes('{') ||
      text.includes('}') ||
      text.includes('√') ||
      text.includes('[size=');
    if (!hasMath) return null;
    return (
      <div className="mt-1.5 p-2 px-3 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-1 text-xs text-amber-200 shadow-inner">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80 block">
          {label}
        </span>
        <div className="overflow-x-auto text-xs sm:text-sm">
          <MathView content={text} />
        </div>
      </div>
    );
  };

  // Available block types list with icons & colors
  const BLOCK_MENU_ITEMS: { type: SlideBlockType; label: string; icon: any; colorClass: string; desc: string }[] = [
    {
      type: 'image',
      label: 'Chèn Ảnh',
      icon: ImageIcon,
      colorClass: 'bg-pink-600/20 text-pink-300 border-pink-500/40 hover:bg-pink-600 hover:text-white',
      desc: 'Tải ảnh từ máy hoặc dán link, chỉnh vị trí & kích thước',
    },
    {
      type: 'media',
      label: 'Video / Audio',
      icon: Film,
      colorClass: 'bg-rose-600/20 text-rose-300 border-rose-500/40 hover:bg-rose-600 hover:text-white',
      desc: 'Chèn link YouTube, MP4, MP3 hoặc tải tệp video/âm thanh bài giảng',
    },
    {
      type: 'lesson_title',
      label: 'Tiêu Đề Bài',
      icon: Type,
      colorClass: 'bg-blue-600/20 text-blue-300 border-blue-500/40 hover:bg-blue-600 hover:text-white',
      desc: 'Tiêu đề chính, phụ đề và công thức toán trọng tâm',
    },
    {
      type: 'content',
      label: 'Lý Thuyết',
      icon: FileText,
      colorClass: 'bg-purple-600/20 text-purple-300 border-purple-500/40 hover:bg-purple-600 hover:text-white',
      desc: 'Văn bản phân tích kiến thức và công thức LaTeX',
    },
    {
      type: 'takeaway',
      label: 'Ghi Nhớ SGK',
      icon: Bookmark,
      colorClass: 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600 hover:text-white',
      desc: 'Khung định nghĩa, định lý, quy tắc trọng tâm',
    },
    {
      type: 'example',
      label: 'Ví Dụ',
      icon: Lightbulb,
      colorClass: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600 hover:text-white',
      desc: 'Đề bài minh họa, bước giải chi tiết từng bước & đáp số',
    },
    {
      type: 'practice',
      label: 'Luyện Tập',
      icon: Dumbbell,
      colorClass: 'bg-sky-600/20 text-sky-300 border-sky-500/40 hover:bg-sky-600 hover:text-white',
      desc: 'Bài tập rèn luyện với nút gợi ý và lời giải',
    },
    {
      type: 'activity',
      label: 'Hoạt Động',
      icon: Zap,
      colorClass: 'bg-amber-600/20 text-amber-300 border-amber-500/40 hover:bg-amber-600 hover:text-white',
      desc: 'Tình huống khám phá, câu hỏi thảo luận & kết luận',
    },
    {
      type: 'note',
      label: 'Chú Ý',
      icon: AlertTriangle,
      colorClass: 'bg-rose-600/20 text-rose-300 border-rose-500/40 hover:bg-rose-600 hover:text-white',
      desc: 'Cảnh báo sai lầm thường gặp, điều kiện và quy ước',
    },
    {
      type: 'application',
      label: 'Vận Dụng',
      icon: Globe2,
      colorClass: 'bg-teal-600/20 text-teal-300 border-teal-500/40 hover:bg-teal-600 hover:text-white',
      desc: 'Bài toán thực tiễn cuộc sống và hướng dẫn giải',
    },
    {
      type: 'objectives',
      label: 'Mục Tiêu',
      icon: Target,
      colorClass: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600 hover:text-white',
      desc: 'Danh sách các mục tiêu cần đạt',
    },
    {
      type: 'opening_problem',
      label: 'Khởi Động',
      icon: Compass,
      colorClass: 'bg-amber-600/20 text-amber-300 border-amber-500/40 hover:bg-amber-600 hover:text-white',
      desc: 'Tình huống thực tế gợi mở vấn đề ban đầu',
    },
    {
      type: 'example_note',
      label: 'Chú Ý Ví Dụ',
      icon: CornerDownRight,
      colorClass: 'bg-violet-600/20 text-violet-300 border-violet-500/40 hover:bg-violet-600 hover:text-white',
      desc: 'Nhận xét và bài học rút ra từ ví dụ đã giải',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-100 overflow-hidden select-none">
      {/* 1. TOP TOOLBAR: SLIDE NAVIGATION & ACTIONS */}
      <div className="p-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap shrink-0">
        {/* Slide Navigator */}
        <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => onSelectSlide(Math.max(0, slideIndex - 1))}
            disabled={slideIndex === 0}
            title="Slide trước (←)"
            className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSlideOutlineModal(true)}
            title="Xem danh sách mục lục toàn bộ Slide"
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-black flex items-center gap-1 transition-colors"
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>
              Slide {slideIndex + 1} / {totalSlides}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          <button
            onClick={() => onSelectSlide(Math.min(totalSlides - 1, slideIndex + 1))}
            disabled={slideIndex === totalSlides - 1}
            title="Slide sau (→)"
            className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Slide Controls & 'Công cụ' Menu */}
        <div className="flex items-center gap-2">
          {/* Quick toggle to collapse/expand all blocks if there are blocks */}
          {blocks.length > 0 && (
            <button
              type="button"
              onClick={handleToggleAllBlocks}
              title={allBlocksCollapsed ? 'Mở rộng tất cả các khối trên slide' : 'Thu gọn tất cả các khối trên slide'}
              className="p-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              {allBlocksCollapsed ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Mở rộng ({blocks.length}) khối</span>
                  <span className="sm:hidden font-mono">({blocks.length})</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Thu gọn ({blocks.length}) khối</span>
                  <span className="sm:hidden font-mono">({blocks.length})</span>
                </>
              )}
            </button>
          )}

          {/* Quick Action: Chèn Ảnh */}
          <button
            type="button"
            onClick={() => handleAddBlock('image', 'Chèn Ảnh')}
            title="Chèn ảnh minh họa, sơ đồ, đồ thị hình học"
            className="p-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-pink-950/40 border border-slate-700 hover:border-pink-500/50 text-slate-200 hover:text-pink-300 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden lg:inline">Chèn Ảnh</span>
          </button>

          {/* Quick Action: Video / Âm Thanh */}
          <button
            type="button"
            onClick={() => handleAddBlock('media', 'Video / Âm Thanh')}
            title="Chèn video bài giảng hoặc âm thanh giải thích"
            className="p-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500/50 text-slate-200 hover:text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Film className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden lg:inline">Video / Âm Thanh</span>
          </button>

          {/* Quick Action: Text Box */}
          <button
            type="button"
            onClick={handleAddTextBox}
            title="Chèn Hộp Chữ Tự Do (PowerPoint Text Box)"
            className="p-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-indigo-950/40 border border-slate-700 hover:border-indigo-500/50 text-slate-200 hover:text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Type className="w-3.5 h-3.5 text-indigo-400" />
            <span>Text Box</span>
          </button>

          {/* Công cụ Dropdown Button */}
          <div className="relative" ref={toolsMenuRef}>
            <button
              type="button"
              onClick={() => setShowToolsMenu(!showToolsMenu)}
              title="Mở menu Công cụ: Thêm khối, Định dạng, Hỗ trợ soạn thảo & Quản lý Slide"
              className={`p-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                showToolsMenu
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-400/80 shadow-indigo-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-indigo-400" />
              <span>Công cụ</span>
              {(activeToolCount > 0 || (slide?.textBoxes && slide.textBoxes.length > 0)) && (
                <span className="min-w-4 h-4 px-1 rounded-full bg-indigo-500 text-white text-[10px] font-extrabold flex items-center justify-center">
                  {(slide?.textBoxes?.length || 0) + activeToolCount}
                </span>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  showToolsMenu ? 'rotate-180 text-white' : ''
                }`}
              />
            </button>

            {/* CÔNG CỤ DROPDOWN MENU */}
            {showToolsMenu && (
              <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[460px] md:w-[500px] bg-slate-950/98 border border-slate-800/90 rounded-2xl shadow-2xl z-50 backdrop-blur-md p-4 space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-150">
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
                        Chèn khối, định dạng, trợ lý toán & quản lý slide
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

                {/* Added Block Toast inside Menu if present */}
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

                  {/* TEXT BOX AS A FIRST-CLASS TOOL IN THE TOOLS BOX */}
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
                          {slide?.textBoxes && slide.textBoxes.length > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Đang có {slide.textBoxes.length} hộp
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

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {BLOCK_MENU_ITEMS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => handleAddBlock(item.type, item.label)}
                          title={item.desc}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-bold transition-all shadow-sm active:scale-95 text-left cursor-pointer ${item.colorClass}`}
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
                    {/* Style & Color */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowStylePanel(!showStylePanel);
                        setShowToolsMenu(false);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        showStylePanel
                          ? 'bg-pink-600 text-white border-pink-400 shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 text-pink-300 border-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5" />
                        Màu & Font
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${showStylePanel ? 'bg-pink-800 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {showStylePanel ? 'Bật' : 'Tắt'}
                      </span>
                    </button>

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

                    {/* Teacher Guide */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowTeacherGuide(!showTeacherGuide);
                        setShowToolsMenu(false);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        showTeacherGuide
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 text-indigo-300 border-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Lời Giảng
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${showTeacherGuide ? 'bg-indigo-800 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {showTeacherGuide ? 'Bật' : 'Tắt'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 3. QUẢN LÝ SLIDE */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>Thao Tác Slide</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Add Blank Slide */}
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

                    {/* Clear Slide to blank */}
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

                    {/* Delete current slide */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteConfirm(true);
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
        </div>
      </div>

      {/* 1.3. QUICK FONT SIZE SELECTION BAR */}
      {showFontSizeToolbar && (
        <div className="p-2.5 px-3 bg-slate-950/95 border-b border-indigo-500/30 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cỡ chữ:</span>
            </span>
            <span className="text-[11px] text-slate-400">
              (Bôi đen văn bản trong ô nhập rồi bấm chọn cỡ)
            </span>
            <div className="flex items-center gap-1">
              {FONT_SIZES.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyFontSizeToField(sz)}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-indigo-600/40 text-slate-200 hover:text-white border border-slate-700/80 hover:border-indigo-500/60 text-xs font-bold transition-all shadow-sm cursor-pointer"
                  title={`Áp dụng cỡ chữ ${sz} cho đoạn văn bản đang bôi đen`}
                >
                  {sz}
                </button>
              ))}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFontSizeToField('default')}
                className="px-2 py-1 rounded-xl bg-slate-900 hover:bg-rose-950/50 border border-slate-800 text-slate-400 hover:text-rose-300 text-[11px] font-medium transition-colors ml-1 cursor-pointer"
                title="Xóa định dạng cỡ chữ (trở về mặc định)"
              >
                Mặc định
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowFontSizeToolbar(false)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1.5. LATEX MATH ASSISTANT TOOLBAR */}
      {showMathToolbar && (
        <div className="p-3 bg-slate-950/95 border-b border-amber-500/30 shrink-0">
          <MathToolbar
            defaultExpanded={true}
            onInsert={(snippet) => {
              if (lastActiveField) {
                insertMathToField(
                  lastActiveField.blockId,
                  lastActiveField.fieldName,
                  snippet,
                  lastActiveField.stepIndex
                );
              } else if (blocks.length > 0) {
                const targetBlock = blocks[0];
                const fieldName: keyof SlideContentBlock =
                  targetBlock.type === 'content' ||
                  targetBlock.type === 'takeaway' ||
                  targetBlock.type === 'note'
                    ? 'content'
                    : targetBlock.type === 'example' || targetBlock.type === 'practice'
                    ? 'problem'
                    : 'title';
                insertMathToField(targetBlock.id, fieldName, snippet);
              }
            }}
          />
        </div>
      )}

      {/* 2. STYLE DRAWER (Optional Pop-Down) */}
      {showStylePanel && (
        <div className="p-4 bg-slate-950 border-b border-slate-800 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-pink-400" />
              Tùy chỉnh Font Chữ & Màu Sắc Slide
            </span>
            <button
              onClick={() => setShowStylePanel(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Kiểu Font Chữ:</label>
              <select
                value={slide?.styleConfig?.fontFamily || 'sans'}
                onChange={(e) =>
                  onUpdateSlide({
                    ...slide,
                    styleConfig: { ...slide.styleConfig, fontFamily: e.target.value as any },
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white text-xs"
              >
                <option value="sans">Không chân (Sans-Serif - Hiện đại)</option>
                <option value="serif">Có chân (Serif - Chuẩn SGK)</option>
                <option value="mono">Đơn cách (Monospace - Toán học)</option>
                <option value="handwriting">Chữ viết tay (Phấn bảng)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Màu Tiêu Đề:</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={slide?.styleConfig?.titleColor || '#38bdf8'}
                  onChange={(e) =>
                    onUpdateSlide({
                      ...slide,
                      styleConfig: { ...slide.styleConfig, titleColor: e.target.value },
                    })
                  }
                  className="w-8 h-8 rounded bg-transparent cursor-pointer border border-slate-700"
                />
                <span className="text-[11px] font-mono text-slate-300">
                  {slide?.styleConfig?.titleColor || '#38bdf8'}
                </span>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Màu Chữ Nội Dung:</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={slide?.styleConfig?.textColor || '#f8fafc'}
                  onChange={(e) =>
                    onUpdateSlide({
                      ...slide,
                      styleConfig: { ...slide.styleConfig, textColor: e.target.value },
                    })
                  }
                  className="w-8 h-8 rounded bg-transparent cursor-pointer border border-slate-700"
                />
                <span className="text-[11px] font-mono text-slate-300">
                  {slide?.styleConfig?.textColor || '#f8fafc'}
                </span>
              </div>
            </div>

            <div className="flex items-end">
              {onApplyStyleToAll && (
                <button
                  onClick={() => onApplyStyleToAll(slide.styleConfig || {})}
                  className="w-full py-1.5 px-2 rounded-lg bg-pink-600/20 hover:bg-pink-600 border border-pink-500/40 text-pink-300 hover:text-white text-xs font-bold transition-all"
                >
                  Áp dụng cho tất cả Slide
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. TEACHER GUIDE DRAWER */}
      {showTeacherGuide && (
        <div className="p-4 bg-amber-950/40 border-b border-amber-500/30 space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              Lời Thoại & Hướng Dẫn Giảng Dạy (Dành Cho Giáo Viên)
            </span>
            <button
              onClick={() => setShowTeacherGuide(false)}
              className="text-amber-400 hover:text-amber-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={slide?.teacherSpeechGuide || ''}
            onChange={(e) => onUpdateSlide({ ...slide, teacherSpeechGuide: e.target.value })}
            placeholder="Nhập lời thoại dẫn dắt của giáo viên khi trình chiếu slide này (VD: 'Các em hãy quan sát hình vẽ và trả lời câu hỏi sau...')"
            rows={3}
            className="w-full bg-slate-950/90 border border-amber-500/30 rounded-xl p-2.5 text-xs sm:text-sm text-amber-100 placeholder-amber-400/40 focus:ring-1 focus:ring-amber-500 outline-none"
          />
        </div>
      )}

      {/* 4. SLIDE CANVAS / LIST OF BLOCKS */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-4 custom-scrollbar">
        {/* EMPTY SLIDE STATE */}
        {blocks.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl bg-slate-950/50 border-2 border-dashed border-slate-800 space-y-4 my-4">
            <div className="w-16 h-16 rounded-3xl bg-indigo-950/60 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-xl">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-1 max-w-md">
              <h3 className="text-lg font-black text-white">Slide Này Đang Trống</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Hãy mở menu <span className="text-indigo-300 font-bold">"Công cụ"</span> ở góc trên hoặc bấm vào các nút gợi ý bên dưới để bắt đầu chèn nội dung: Tiêu đề bài học,
                Khối chèn hình ảnh, Ghi nhớ trọng tâm, Ví dụ, hoặc Bài tập...
              </p>
            </div>

            {/* Quick Starters */}
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <button
                onClick={() => handleAddBlock('lesson_title')}
                className="px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600 border border-blue-500/40 text-blue-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow"
              >
                <Type className="w-3.5 h-3.5" />
                <span>+ Tiêu Đề Bài</span>
              </button>

              <button
                onClick={() => handleAddBlock('image')}
                className="px-3 py-2 rounded-xl bg-pink-600/20 hover:bg-pink-600 border border-pink-500/40 text-pink-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>+ Chèn Hình Ảnh</span>
              </button>

              <button
                onClick={() => handleAddBlock('takeaway')}
                className="px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>+ Ghi Nhớ SGK</span>
              </button>

              <button
                onClick={() => handleAddBlock('example')}
                className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>+ Ví Dụ Minh Họa</span>
              </button>

              <button
                onClick={() => handleAddBlock('content')}
                className="px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>+ Nội Dung / Lý Thuyết</span>
              </button>
            </div>
          </div>
        )}

        {/* BLOCKS LIST */}
        {blocks.map((block, index) => {
          const meta = BLOCK_TYPES_META[block.type] || {
            type: block.type,
            label: block.type.toUpperCase(),
            shortLabel: block.type.toUpperCase(),
            badgeBg: 'bg-slate-800',
            badgeText: 'text-slate-300',
            borderColor: 'border-l-indigo-500',
            iconName: 'FileText',
            description: '',
          };

          const isCollapsed = !!collapsedBlocks[block.id];
          const animPreset = BLOCK_ANIMATION_PRESETS.find((p) => p.id === (block.animation || 'inherit'));
          const isAnimOpen = animConfigBlockId === block.id;

          return (
            <div
              key={block.id}
              className={`rounded-2xl bg-slate-950 border-2 border-slate-800/90 shadow-xl overflow-hidden transition-all ${meta.borderColor} border-l-4`}
            >
              {/* BLOCK HEADER */}
              <div className="p-3 sm:p-3.5 bg-slate-900/95 border-b border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                {/* Left: Move & Type Badge & Animation Badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
                    <button
                      onClick={() => handleMoveBlockUp(index)}
                      disabled={index === 0}
                      title="Di chuyển lên trên"
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-25"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveBlockDown(index)}
                      disabled={index === blocks.length - 1}
                      title="Di chuyển xuống dưới"
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-25"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span
                    className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${meta.badgeBg} ${meta.badgeText}`}
                  >
                    <span>{index + 1}.</span>
                    <span>{meta.label}</span>
                  </span>

                  {/* Individual Block Animation Selector Button */}
                  <button
                    onClick={() => setAnimConfigBlockId(isAnimOpen ? null : block.id)}
                    title="Cài đặt hiệu ứng PowerPoint xuất hiện riêng cho khối này"
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
                      block.animation && block.animation !== 'inherit'
                        ? 'bg-pink-950/90 border-pink-500 text-pink-200 shadow-md ring-1 ring-pink-500/50'
                        : isAnimOpen
                        ? 'bg-slate-800 border-pink-500/50 text-pink-300'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span>{animPreset?.icon || '✨'}</span>
                    <span className="hidden sm:inline">{animPreset?.shortLabel || 'Kế Thừa'}</span>
                    {typeof block.animationDelay === 'number' && block.animationDelay > 0 && (
                      <span className="font-mono text-[10px] text-pink-300 font-bold">+{block.animationDelay}s</span>
                    )}
                  </button>

                  {/* Block summary title (very helpful when block is collapsed) */}
                  {block.title && (
                    <span
                      className="text-xs text-slate-300 font-medium truncate max-w-[140px] sm:max-w-[240px] px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800"
                      title={block.title}
                    >
                      {block.title}
                    </span>
                  )}
                </div>

                {/* Right: Block Controls (Duplicate, Collapse, Delete) */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDuplicateBlock(block)}
                    title="Nhân bản khối này"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => toggleCollapse(block.id)}
                    title={isCollapsed ? 'Mở rộng khối' : 'Thu gọn khối'}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition-colors"
                  >
                    {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleDeleteBlock(block.id)}
                    title="Xóa khối này khỏi slide"
                    className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-600 text-rose-400 hover:text-white text-xs transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* INLINE ANIMATION DRAWER */}
              {isAnimOpen && (
                <div className="p-3.5 bg-slate-950/95 border-b border-pink-500/40 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-pink-300 flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5" />
                      <span>Hiệu Ứng Xuất Hiện Của Khối #{index + 1} ({meta.label})</span>
                    </span>
                    <button
                      onClick={() => setAnimConfigBlockId(null)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
                    {BLOCK_ANIMATION_PRESETS.map((preset) => {
                      const isSelected = (block.animation || 'inherit') === preset.id;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => handleUpdateBlock(block.id, { animation: preset.id })}
                          className={`p-2 rounded-xl border text-left text-xs transition-all ${
                            isSelected
                              ? 'bg-pink-600 border-pink-400 text-white font-bold shadow'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-pink-500/40 hover:bg-slate-800'
                          }`}
                        >
                          <div className="text-base">{preset.icon}</div>
                          <div className="font-semibold text-[11px] truncate">{preset.shortLabel}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Delay & Duration row */}
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/80 flex-wrap text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-pink-400" />
                        Độ trễ xuất hiện:
                      </span>
                      {[0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.5].map((d) => (
                        <button
                          key={d}
                          onClick={() => handleUpdateBlock(block.id, { animationDelay: d })}
                          className={`px-2 py-0.5 rounded-lg font-mono text-[11px] font-bold ${
                            Math.abs((block.animationDelay ?? 0) - d) < 0.05
                              ? 'bg-pink-600 text-white'
                              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {d}s
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-medium">Tốc độ hoạt họa:</span>
                      {[
                        { v: 0.25, l: 'Nhanh' },
                        { v: 0.42, l: 'Chuẩn' },
                        { v: 0.75, l: 'Mượt' },
                      ].map((dur) => (
                        <button
                          key={dur.v}
                          onClick={() => handleUpdateBlock(block.id, { animationDuration: dur.v })}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                            Math.abs((block.animationDuration ?? 0.42) - dur.v) < 0.05
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {dur.l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* BLOCK BODY (IF NOT COLLAPSED) */}
              {!isCollapsed && (
                <div className="p-4 sm:p-5 space-y-4">
                  {/* ========================================================= */}
                  {/* 1. KHỐI HÌNH ẢNH (IMAGE BLOCK)                            */}
                  {/* ========================================================= */}
                  {block.type === 'image' && (
                    <div className="space-y-4">
                      {/* Image Source Options: Upload or URL */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Option A: File Upload */}
                        <div className="p-3.5 rounded-xl bg-slate-900 border border-pink-500/30 space-y-2">
                          <label className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Tải ảnh từ máy tính (PNG, JPG, SVG, WebP):</span>
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageFileUpload(block.id, e)}
                            className="w-full text-xs text-slate-300 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-500 cursor-pointer"
                          />
                        </div>

                        {/* Option B: External URL */}
                        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 space-y-2">
                          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Hoặc dán liên kết URL ảnh:</span>
                          </label>
                          <input
                            type="url"
                            value={block.imageUrl || ''}
                            onChange={(e) => handleUpdateBlock(block.id, { imageUrl: e.target.value })}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-pink-500 outline-none font-mono"
                          />
                        </div>
                      </div>

                      {/* Sample diagram quick pickers */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] text-slate-400 font-semibold">
                          💡 Hoặc chọn nhanh sơ đồ toán mẫu:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {SAMPLE_MATH_DIAGRAMS.map((sample, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() =>
                                handleUpdateBlock(block.id, {
                                  imageUrl: sample.url,
                                  imageCaption: sample.caption,
                                  imageAlt: sample.name,
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-pink-500/40 text-[11px] text-slate-300 hover:text-white transition-all truncate max-w-xs"
                            >
                              {sample.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Image Position & Width Controls */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        {/* Position */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300 block">
                            Vị trí căn chỉnh trên Slide:
                          </label>
                          <div className="grid grid-cols-4 gap-1">
                            {[
                              { id: 'left', label: 'Trái', icon: AlignLeft },
                              { id: 'center', label: 'Giữa', icon: AlignCenter },
                              { id: 'right', label: 'Phải', icon: AlignRight },
                              { id: 'full', label: 'Toàn khung', icon: Maximize },
                            ].map((pos) => {
                              const PosIcon = pos.icon;
                              const isActive = (block.imagePosition || 'center') === pos.id;
                              return (
                                <button
                                  key={pos.id}
                                  onClick={() =>
                                    handleUpdateBlock(block.id, {
                                      imagePosition: pos.id as any,
                                    })
                                  }
                                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition-all ${
                                    isActive
                                      ? 'bg-pink-600 text-white border-pink-400 shadow'
                                      : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-white'
                                  }`}
                                >
                                  <PosIcon className="w-3 h-3" />
                                  <span>{pos.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Width Percent */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300 block">
                            Kích thước chiều rộng:
                          </label>
                          <div className="grid grid-cols-4 gap-1">
                            {[
                              { val: 30, label: '30% (Nhỏ)' },
                              { val: 50, label: '50% (Vừa)' },
                              { val: 75, label: '75% (Lớn)' },
                              { val: 100, label: '100% (Đầy)' },
                            ].map((w) => {
                              const isActive = (block.imageWidthPercent || 50) === w.val;
                              return (
                                <button
                                  key={w.val}
                                  onClick={() =>
                                    handleUpdateBlock(block.id, {
                                      imageWidthPercent: w.val,
                                    })
                                  }
                                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border text-center transition-all ${
                                    isActive
                                      ? 'bg-pink-600 text-white border-pink-400 shadow'
                                      : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-white'
                                  }`}
                                >
                                  {w.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Image Caption & Alt Text */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-300 block">
                          Chú thích ảnh (Hỗ trợ công thức toán $...$):
                        </label>
                        <input
                          type="text"
                          value={block.imageCaption || ''}
                          onFocus={() => setLastActiveField({ blockId: block.id, fieldName: 'imageCaption' })}
                          onChange={(e) => handleUpdateBlock(block.id, { imageCaption: e.target.value })}
                          placeholder="Hình 1: Minh họa định lý Pythagore với $a^2 + b^2 = c^2$"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-pink-500 outline-none"
                        />
                        {renderMathPreview(block.imageCaption, 'Xem trước chú thích ảnh:')}
                      </div>

                      {/* Live Image Preview Thumbnail */}
                      {block.imageUrl && (
                        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
                          <img
                            src={block.imageUrl}
                            alt={block.imageAlt || 'Preview'}
                            className="w-24 h-24 object-contain rounded-xl bg-slate-950 border border-slate-700"
                          />
                          <div className="space-y-1 text-xs text-slate-300">
                            <span className="font-bold text-pink-300 block">Ảnh hiển thị tốt</span>
                            <span className="text-[11px] text-slate-400 block truncate max-w-sm">
                              Vị trí: <b className="text-white">{block.imagePosition || 'Căn giữa'}</b> | Độ rộng:{' '}
                              <b className="text-white">{block.imageWidthPercent || 50}%</b>
                            </span>
                            {block.imageCaption && (
                              <div className="text-[11px] text-emerald-300">
                                <MathView content={block.imageCaption} inline />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ========================================================= */}
                  {/* 1b. KHỐI VIDEO / AUDIO (MEDIA BLOCK)                      */}
                  {/* ========================================================= */}
                  {block.type === 'media' && (
                    <div className="space-y-4">
                      {/* Tiêu đề khối Media */}
                      <div>
                        <label className="text-xs font-bold text-rose-300 block mb-1">
                          Tiêu đề Video / Audio bài giảng (Hỗ trợ công thức $...$):
                        </label>
                        <input
                          type="text"
                          value={block.title || ''}
                          onFocus={() => setLastActiveField({ blockId: block.id, fieldName: 'title' })}
                          onChange={(e) => handleUpdateBlock(block.id, { title: e.target.value })}
                          placeholder="Video minh họa trực quan hoặc Audio giảng bài..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white font-bold placeholder-slate-500 focus:ring-1 focus:ring-rose-500 outline-none"
                        />
                        {renderMathPreview(block.title, 'Xem trước tiêu đề:')}
                      </div>

                      {/* Source options: Upload or URL */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Option A: Link URL */}
                        <div className="p-3.5 rounded-xl bg-slate-900 border border-rose-500/30 space-y-2">
                          <label className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                            <LinkIcon className="w-3.5 h-3.5" />
                            <span>Đường link Video / Audio:</span>
                          </label>
                          <input
                            type="url"
                            value={block.mediaUrl || ''}
                            onFocus={() => setLastActiveField({ blockId: block.id, fieldName: 'mediaUrl' })}
                            onChange={(e) => handleUpdateBlock(block.id, { mediaUrl: e.target.value })}
                            placeholder="Dán link YouTube (https://youtu.be/...), Google Drive, MP4 hoặc MP3..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-rose-500 outline-none font-mono"
                          />
                          <p className="text-[10px] text-slate-400">
                            💡 Tự động nhận diện YouTube, Google Drive preview, link trực tiếp file MP4, MP3.
                          </p>
                        </div>

                        {/* Option B: File Upload */}
                        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 space-y-2">
                          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5 text-rose-400" />
                            <span>Hoặc tải tệp từ máy tính:</span>
                          </label>
                          <input
                            type="file"
                            accept="video/*,audio/*"
                            onChange={(e) => handleMediaFileUpload(block.id, e)}
                            className="w-full text-xs text-slate-300 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-rose-600 file:text-white hover:file:bg-rose-500 cursor-pointer"
                          />
                          <p className="text-[10px] text-slate-400">
                            Hỗ trợ MP4, WebM, MP3, WAV, OGG...
                          </p>
                        </div>
                      </div>

                      {/* Sample Math Videos */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] text-slate-400 font-semibold">
                          💡 Hoặc chọn nhanh video toán học mẫu:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {SAMPLE_MATH_MEDIA.map((sample, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() =>
                                handleUpdateBlock(block.id, {
                                  mediaUrl: sample.url,
                                  mediaCaption: sample.caption,
                                  title: sample.name,
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-rose-500/40 text-[11px] text-slate-300 hover:text-white transition-all truncate max-w-xs"
                            >
                              {sample.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Media Caption (Hỗ trợ LaTeX $...$) */}
                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">
                          Chú thích Video / Audio (Hỗ trợ công thức $...$):
                        </label>
                        <input
                          type="text"
                          value={block.mediaCaption || ''}
                          onFocus={() => setLastActiveField({ blockId: block.id, fieldName: 'mediaCaption' })}
                          onChange={(e) => handleUpdateBlock(block.id, { mediaCaption: e.target.value })}
                          placeholder="Ví dụ: Quan sát sự biến thiên của đồ thị khi hệ số $a > 0$..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-rose-500 outline-none"
                        />
                        {renderMathPreview(block.mediaCaption, 'Xem trước chú thích:')}
                      </div>

                      {/* Alignment & Width & Playback controls */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        {/* Position */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300 block">Vị trí căn chỉnh:</label>
                          <div className="grid grid-cols-4 gap-1">
                            {[
                              { id: 'left', label: 'Trái', icon: AlignLeft },
                              { id: 'center', label: 'Giữa', icon: AlignCenter },
                              { id: 'right', label: 'Phải', icon: AlignRight },
                              { id: 'full', label: 'Toàn khung', icon: Maximize },
                            ].map((pos) => {
                              const PosIcon = pos.icon;
                              const isActive = (block.mediaPosition || 'center') === pos.id;
                              return (
                                <button
                                  key={pos.id}
                                  type="button"
                                  onClick={() => handleUpdateBlock(block.id, { mediaPosition: pos.id as any })}
                                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition-all ${
                                    isActive
                                      ? 'bg-rose-600 text-white border-rose-400 shadow'
                                      : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-white'
                                  }`}
                                >
                                  <PosIcon className="w-3 h-3" />
                                  <span>{pos.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Width */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300 block">Kích thước chiều rộng:</label>
                          <div className="grid grid-cols-4 gap-1">
                            {[
                              { val: 33, label: '33% (Nhỏ)' },
                              { val: 50, label: '50% (Vừa)' },
                              { val: 75, label: '75% (Lớn)' },
                              { val: 100, label: '100% (Đầy)' },
                            ].map((w) => {
                              const isActive = (block.mediaWidthPercent || 75) === w.val;
                              return (
                                <button
                                  key={w.val}
                                  type="button"
                                  onClick={() => handleUpdateBlock(block.id, { mediaWidthPercent: w.val })}
                                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border text-center transition-all ${
                                    isActive
                                      ? 'bg-rose-600 text-white border-rose-400 shadow'
                                      : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-white'
                                  }`}
                                >
                                  {w.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Playback Toggles */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300 block">Tùy chọn phát:</label>
                          <div className="flex flex-col gap-1.5 pt-1">
                            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!block.mediaAutoplay}
                                onChange={(e) => handleUpdateBlock(block.id, { mediaAutoplay: e.target.checked })}
                                className="rounded text-rose-600 focus:ring-rose-500 bg-slate-950 border-slate-700"
                              />
                              <span>Tự động phát (Autoplay)</span>
                            </label>
                            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!block.mediaLoop}
                                onChange={(e) => handleUpdateBlock(block.id, { mediaLoop: e.target.checked })}
                                className="rounded text-rose-600 focus:ring-rose-500 bg-slate-950 border-slate-700"
                              />
                              <span>Lặp lại liên tục (Loop)</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Live Media Player Preview */}
                      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                          Xem trước trình phát video / audio trên slide:
                        </span>
                        <MediaBlockRenderer block={block} interactive={false} />
                      </div>
                    </div>
                  )}

                  {/* ========================================================= */}
                  {/* 2. KHỐI TIÊU ĐỀ BÀI HỌC (LESSON TITLE BLOCK)             */}
                  {/* ========================================================= */}
                  {block.type === 'lesson_title' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-blue-300 block mb-1">
                          Tiêu đề chính bài học / chuyên đề (Hỗ trợ công thức $...$):
                        </label>
                        <input
                          type="text"
                          value={block.title || ''}
                          onFocus={() => setLastActiveField({ blockId: block.id, fieldName: 'title' })}
                          onChange={(e) => handleUpdateBlock(block.id, { title: e.target.value })}
                          placeholder="BÀI 1: MỆNH ĐỀ TOÁN HỌC"
                          className="w-full bg-slate-900 border border-blue-500/40 rounded-xl p-2.5 text-sm sm:text-base font-bold text-white uppercase placeholder-slate-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                        {renderMathPreview(block.title, 'Xem trước tiêu đề:')}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-300 block mb-1">
                            Phụ đề / Phân môn (Hỗ trợ $...$):
                          </label>
                          <input
                            type="text"
                            value={block.subtitle || ''}
                            onFocus={() => setLastActiveField({ blockId: block.id, fieldName: 'subtitle' })}
                            onChange={(e) => handleUpdateBlock(block.id, { subtitle: e.target.value })}
                            placeholder="Chương 1: Mệnh đề và tập hợp • Toán 10"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                          {renderMathPreview(block.subtitle, 'Xem trước phụ đề:')}
                        </div>

                        <div>
                          <label className="text-xs font-bold text-amber-300 block mb-1">
                            Công thức trọng tâm (LaTeX):
                          </label>
                          <input
                            type="text"
                            value={block.keyFormula || ''}
                            onFocus={() => setLastActiveField({ blockId: block.id, fieldName: 'keyFormula' })}
                            onChange={(e) => handleUpdateBlock(block.id, { keyFormula: e.target.value })}
                            placeholder="a^2 + b^2 = c^2 hoặc f(x) = ax^2 + bx + c"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs sm:text-sm text-amber-300 font-mono placeholder-slate-500 focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                          {renderMathPreview(`$$${block.keyFormula}$$`, 'Xem trước công thức trọng tâm:')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ========================================================= */}
                  {/* 3. KHỐI VÍ DỤ MINH HỌA (EXAMPLE BLOCK)                   */}
                  {/* ========================================================= */}
                  {block.type === 'example' && (
                    <div className="space-y-4">
                      {/* Example Title & Problem */}
                      <div>
                        <label className="text-xs font-bold text-emerald-300 block mb-1">
                          Tên ví dụ (Hỗ trợ $...$):
                        </label>
                        <input
                          type="text"
                          value={block.title || ''}
                          onFocus={() => setLastActiveField({ blockId: block.id, fieldName: 'title' })}
                          onChange={(e) => handleUpdateBlock(block.id, { title: e.target.value })}
                          placeholder="Ví dụ 1: Tìm nghiệm của phương trình"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs sm:text-sm text-white font-bold placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                        {renderMathPreview(block.title, 'Xem trước tên ví dụ:')}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-300">
                            Đề bài ví dụ (Hỗ trợ công thức $...$ và $$...$$):
                          </label>
                          <span className="text-[10px] text-amber-400 font-semibold">
                            💡 Mẹo: Đặt công thức trong $...$
                          </span>
                        </div>
                        <textarea
                          value={block.problem || ''}
                          onFocus={() => setLastActiveField({ blockId: block.id, fieldName: 'problem' })}
                          onChange={(e) => handleUpdateBlock(block.id, { problem: e.target.value })}
                          placeholder="Giải phương trình bậc hai sau: $2x^2 - 5x + 2 = 0$"
                          rows={2}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 outline-none leading-relaxed"
                        />
                        {renderMathPreview(block.problem, 'Xem trước đề bài:')}
                      </div>

                      {/* Step by step solutions */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Các bước giải chi tiết (Hỗ trợ công thức $...$, hiện từng bước khi trình chiếu):</span>
                          </label>
                          <button
                            onClick={() => {
                              const steps = block.solutionSteps || [];
                              handleUpdateBlock(block.id, {
                                solutionSteps: [...steps, `Bước ${steps.length + 1}: Biến đổi phương trình...`],
                              });
                            }}
                            className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-all"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Thêm bước giải</span>
                          </button>
                        </div>

                        {(block.solutionSteps || []).map((step, sIdx) => (
                          <div key={sIdx} className="space-y-1">
                            <div className="flex items-start gap-2">
                              <span className="text-xs font-bold text-emerald-400 px-2 py-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                                B{sIdx + 1}
                              </span>
                              <textarea
                                value={step}
                                onFocus={() =>
                                  setLastActiveField({
                                    blockId: block.id,
                                    fieldName: 'solutionSteps',
                                    stepIndex: sIdx,
                                  })
                                }
                                onChange={(e) => {
                                  const newSteps = [...(block.solutionSteps || [])];
                                  newSteps[sIdx] = e.target.value;
                                  handleUpdateBlock(block.id, { solutionSteps: newSteps });
                                }}
                                rows={1}
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                              />
                              <button
                                onClick={() => {
                                  const newSteps = (block.solutionSteps || []).filter((_, idx) => idx !== sIdx);
                                  handleUpdateBlock(block.id, { solutionSteps: newSteps });
                                }}
                                className="p-2 rounded-lg bg-slate-900 hover:bg-rose-600 text-slate-400 hover:text-white text-xs transition-colors shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {renderMathPreview(step, `Xem trước Bước ${sIdx + 1}:`)}
                          </div>
                        ))}
                      </div>

                      {/* Final Answer */}
                      <div>
                        <label className="text-xs font-bold text-emerald-300 block mb-1">
                          Đáp số / Kết luận ví dụ (Hỗ trợ công thức $...$):
                        </label>
                        <input
                          type="text"
                          value={block.finalAnswer || ''}
                          onFocus={() => setLastActiveField({ blockId: block.id, fieldName: 'finalAnswer' })}
                          onChange={(e) => handleUpdateBlock(block.id, { finalAnswer: e.target.value })}
                          placeholder="Vậy tập nghiệm của phương trình là $S = \{2; \frac{1}{2}\}$"
                          className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl p-2 text-xs sm:text-sm text-emerald-100 font-bold placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                        {renderMathPreview(block.finalAnswer, 'Xem trước đáp số:')}
                      </div>
                    </div>
                  )}

                  {/* ========================================================= */}
                  {/* 4. KHỐI LUYỆN TẬP & VẬN DỤNG                              */}
                  {/* ========================================================= */}
                  {(block.type === 'practice' || block.type === 'application') && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-sky-300 block mb-1">
                          Tiêu đề bài tập (Hỗ trợ $...$):
                        </label>
                        <input
                          type="text"
                          value={block.title || ''}
                          onFocus={() => setLastActiveField({ blockId: block.id, fieldName: 'title' })}
                          onChange={(e) => handleUpdateBlock(block.id, { title: e.target.value })}
                          placeholder={block.type === 'practice' ? 'Luyện tập 1' : 'Vận dụng 1: Bài toán thực tế'}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs sm:text-sm text-white font-bold placeholder-slate-500 focus:ring-1 focus:ring-sky-500 outline-none"
                        />
                        {renderMathPreview(block.title, 'Xem trước tiêu đề:')}
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">
                          Đề bài (Hỗ trợ công thức $...$ và $$...$$):
                        </label>
                        <textarea
                          value={block.problem || ''}
                          onFocus={() => setLastActiveField({ blockId: block.id, fieldName: 'problem' })}
                          onChange={(e) => handleUpdateBlock(block.id, { problem: e.target.value })}
                          placeholder="Nhập nội dung câu hỏi hoặc bài toán rèn luyện..."
                          rows={2}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-sky-500 outline-none leading-relaxed"
                        />
                        {renderMathPreview(block.problem, 'Xem trước đề bài:')}
                      </div>

                      {block.type === 'practice' && (
                        <div>
                          <label className="text-xs font-bold text-amber-300 block mb-1">
                            Gợi ý phương pháp (Hint) (Hỗ trợ $...$):
                          </label>
                          <input
                            type="text"
                            value={block.hint || ''}
                            onFocus={() => setLastActiveField({ blockId: block.id, fieldName: 'hint' })}
                            onChange={(e) => handleUpdateBlock(block.id, { hint: e.target.value })}
                            placeholder="Áp dụng hằng đẳng thức hoặc đặt ẩn phụ $t = x^2$..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs sm:text-sm text-amber-200 placeholder-slate-500 focus:ring-1 focus:ring-sky-500 outline-none"
                          />
                          {renderMathPreview(block.hint, 'Xem trước gợi ý:')}
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-bold text-emerald-300 block mb-1">
                          Hướng dẫn giải / Đáp án (Hỗ trợ công thức $...$):
                        </label>
                        <textarea
                          value={block.solution || ''}
                          onFocus={() => setLastActiveField({ blockId: block.id, fieldName: 'solution' })}
                          onChange={(e) => handleUpdateBlock(block.id, { solution: e.target.value })}
                          placeholder="Trình bày lời giải chi tiết..."
                          rows={2}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-emerald-100 placeholder-slate-500 focus:ring-1 focus:ring-sky-500 outline-none leading-relaxed"
                        />
                        {renderMathPreview(block.solution, 'Xem trước lời giải:')}
                      </div>
                    </div>
                  )}

                  {/* ========================================================= */}
                  {/* 5. KHỐI GHI NHỚ, CHÚ Ý, NỘI DUNG LÝ THUYẾT               */}
                  {/* ========================================================= */}
                  {(block.type === 'takeaway' ||
                    block.type === 'note' ||
                    block.type === 'content' ||
                    block.type === 'example_note') && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">
                          Tiêu đề khối (Hỗ trợ $...$):
                        </label>
                        <input
                          type="text"
                          value={block.title || ''}
                          onFocus={() => setLastActiveField({ blockId: block.id, fieldName: 'title' })}
                          onChange={(e) => handleUpdateBlock(block.id, { title: e.target.value })}
                          placeholder="Tiêu đề khối..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs sm:text-sm text-white font-bold placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                        {renderMathPreview(block.title, 'Xem trước tiêu đề:')}
                      </div>

                      {/* Math Shortcuts Quick Bar */}
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          Chèn nhanh công thức Toán học LaTeX:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {MATH_SHORTCUTS.slice(0, 10).map((sh, idx) => (
                            <button
                              key={idx}
                              onClick={() => insertMathToField(block.id, 'content', sh.latex)}
                              className="px-2 py-1 rounded bg-slate-950 hover:bg-indigo-600 border border-slate-800 text-[11px] text-slate-300 hover:text-white font-mono transition-colors"
                            >
                              {sh.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Content Textarea */}
                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">
                          Nội dung văn bản (Hỗ trợ công thức $...$ và $$...$$):
                        </label>
                        <textarea
                          value={block.content || ''}
                          onFocus={() => setLastActiveField({ blockId: block.id, fieldName: 'content' })}
                          onChange={(e) => handleUpdateBlock(block.id, { content: e.target.value })}
                          placeholder="Nhập nội dung kiến thức, định nghĩa, định lý..."
                          rows={4}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 outline-none leading-relaxed font-sans"
                        />
                      </div>

                      {/* Live Math Preview */}
                      {renderMathPreview(block.content, 'Xem trước công thức trực tiếp:')}
                    </div>
                  )}

                  {/* ========================================================= */}
                  {/* 6. KHỐI HOẠT ĐỘNG KHÁM PHÁ & TÌNH HUỐNG MỞ ĐẦU           */}
                  {/* ========================================================= */}
                  {(block.type === 'activity' || block.type === 'opening_problem') && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-amber-300 block mb-1">
                          Tiêu đề hoạt động (Hỗ trợ $...$):
                        </label>
                        <input
                          type="text"
                          value={block.title || ''}
                          onFocus={() => setLastActiveField({ blockId: block.id, fieldName: 'title' })}
                          onChange={(e) => handleUpdateBlock(block.id, { title: e.target.value })}
                          placeholder={block.type === 'activity' ? 'Hoạt động 1: Khám phá' : 'Tình huống mở đầu'}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs sm:text-sm text-white font-bold placeholder-slate-500 focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                        {renderMathPreview(block.title, 'Xem trước tiêu đề:')}
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">
                          Bối cảnh thực tế / Nhiệm vụ (Hỗ trợ $...$):
                        </label>
                        <textarea
                          value={block.description || block.context || ''}
                          onFocus={() => setLastActiveField({ blockId: block.id, fieldName: 'description' })}
                          onChange={(e) =>
                            handleUpdateBlock(block.id, {
                              description: e.target.value,
                              context: e.target.value,
                            })
                          }
                          placeholder="Mô tả bối cảnh thực tế hoặc nhiệm vụ trải nghiệm..."
                          rows={2}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-amber-500 outline-none leading-relaxed"
                        />
                        {renderMathPreview(block.description || block.context, 'Xem trước bối cảnh:')}
                      </div>

                      <div>
                        <label className="text-xs font-bold text-blue-300 block mb-1">
                          Câu hỏi thảo luận / Đặt vấn đề (Hỗ trợ $...$):
                        </label>
                        <input
                          type="text"
                          value={block.question || ''}
                          onFocus={() => setLastActiveField({ blockId: block.id, fieldName: 'question' })}
                          onChange={(e) => handleUpdateBlock(block.id, { question: e.target.value })}
                          placeholder="Dự đoán quy luật hoặc trả lời câu hỏi đặt ra?"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs sm:text-sm text-blue-200 placeholder-slate-500 focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                        {renderMathPreview(block.question, 'Xem trước câu hỏi:')}
                      </div>

                      <div>
                        <label className="text-xs font-bold text-emerald-300 block mb-1">
                          Kết luận rút ra (Hỗ trợ $...$):
                        </label>
                        <input
                          type="text"
                          value={block.conclusion || ''}
                          onFocus={() => setLastActiveField({ blockId: block.id, fieldName: 'conclusion' })}
                          onChange={(e) => handleUpdateBlock(block.id, { conclusion: e.target.value })}
                          placeholder="Khái quát hóa kết luận thành kiến thức..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs sm:text-sm text-emerald-200 placeholder-slate-500 focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                        {renderMathPreview(block.conclusion, 'Xem trước kết luận:')}
                      </div>
                    </div>
                  )}

                  {/* ========================================================= */}
                  {/* 7. KHỐI MỤC TIÊU BÀI HỌC (OBJECTIVES BLOCK)              */}
                  {/* ========================================================= */}
                  {block.type === 'objectives' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5" />
                          <span>Danh sách các mục tiêu cần đạt (Hỗ trợ công thức $...$):</span>
                        </label>
                        <button
                          onClick={() => {
                            const items = block.items || [];
                            handleUpdateBlock(block.id, {
                              items: [...items, `Mục tiêu ${items.length + 1}...`],
                            });
                          }}
                          className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-all"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Thêm mục tiêu</span>
                        </button>
                      </div>

                      {(block.items || []).map((it, itIdx) => (
                        <div key={itIdx} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <input
                              type="text"
                              value={it}
                              onChange={(e) => {
                                const newItems = [...(block.items || [])];
                                newItems[itIdx] = e.target.value;
                                handleUpdateBlock(block.id, { items: newItems });
                              }}
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                            />
                            <button
                              onClick={() => {
                                const newItems = (block.items || []).filter((_, idx) => idx !== itIdx);
                                handleUpdateBlock(block.id, { items: newItems });
                              }}
                              className="p-2 rounded-lg bg-slate-900 hover:bg-rose-600 text-slate-400 hover:text-white text-xs transition-colors shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {renderMathPreview(it, `Xem trước Mục tiêu ${itIdx + 1}:`)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* ========================================================= */}
        {/* HỘP VĂN BẢN TỰ DO (POWERPOINT TEXT BOXES)                  */}
        {/* ========================================================= */}
        {slide.textBoxes && slide.textBoxes.length > 0 && (
          <div className="rounded-2xl bg-indigo-950/30 border border-indigo-500/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-400/50 flex items-center justify-center text-xs font-black text-indigo-300">
                  A
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-indigo-300">
                  Hộp Văn Bản Tự Do ({slide.textBoxes.length} Text Box)
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddTextBox}
                className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm Text Box</span>
              </button>
            </div>

            <div className="space-y-3">
              {slide.textBoxes.map((tb, tbIdx) => (
                <div key={tb.id || tbIdx} className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">
                      Text Box #{tbIdx + 1} (Cỡ: {tb.fontSize || 24}pt)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (slide.textBoxes || []).filter((_, i) => i !== tbIdx);
                        onUpdateSlide({ ...slide, textBoxes: updated });
                      }}
                      className="p-1 rounded text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 cursor-pointer"
                      title="Xóa Text Box này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    value={tb.text || ''}
                    onChange={(e) => {
                      const updated = (slide.textBoxes || []).map((b, i) =>
                        i === tbIdx ? { ...b, text: e.target.value } : b
                      );
                      onUpdateSlide({ ...slide, textBoxes: updated });
                    }}
                    placeholder="Nhập nội dung văn bản hoặc công thức toán $...$..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none resize-y"
                  />

                  {tb.text && (
                    <div className="p-2 rounded-lg bg-black/60 border border-amber-500/30 text-xs">
                      <span className="text-[10px] font-bold text-amber-300 block mb-1">
                        Xem trước hiển thị:
                      </span>
                      <MathView content={tb.text} text={tb.text} className="text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 6. SLIDE OUTLINE / ALL SLIDES LIST MODAL */}
      {showSlideOutlineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <ListOrdered className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base sm:text-lg font-black text-white">
                  Danh Sách Mục Lục Toàn Bộ Slide ({totalSlides} Slide)
                </h3>
              </div>
              <button
                onClick={() => setShowSlideOutlineModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {allSlides.map((s, idx) => {
                const sBlocks = getSlideBlocks(s);
                const isCurrent = idx === slideIndex;

                return (
                  <div
                    key={s.id || idx}
                    onClick={() => {
                      onSelectSlide(idx);
                      setShowSlideOutlineModal(false);
                    }}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                          isCurrent
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold truncate text-white">
                          {s.title || `Slide ${idx + 1}`}
                        </h4>
                        <span className="text-[11px] text-slate-400 block truncate">
                          {sBlocks.length} khối nội dung
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onDuplicateSlide(s)}
                        title="Nhân bản slide"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          onDeleteSlide(s.id);
                          if (idx === slideIndex && slideIndex > 0) {
                            onSelectSlide(slideIndex - 1);
                          }
                        }}
                        title="Xóa slide"
                        className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-600 text-rose-300 hover:text-white text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={() => {
                  handleAddNewBlankSlide();
                  setShowSlideOutlineModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Slide Mới</span>
              </button>

              <button
                onClick={() => setShowSlideOutlineModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. DELETE SLIDE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-rose-500/50 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-white">Xác Nhận Xóa Slide {slideIndex + 1}?</h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Toàn bộ nội dung của slide này sẽ bị xóa. {totalSlides === 1 && 'Vì đây là slide duy nhất, slide sẽ được làm mới về 1 slide trắng.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  onDeleteSlide(slide.id);
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Font Size Toolbar on Text Selection (20pt, 24pt, 28pt, 32pt, 34pt) */}
      <SlideSelectionFontSizeToolbar
        activeSlide={slide}
        onUpdateSlide={onUpdateSlide}
      />
    </div>
  );
};
