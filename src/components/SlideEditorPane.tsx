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
  MessageSquare
} from 'lucide-react';
import {
  Slide,
  SlideContentBlock,
  SlideBlockType,
  SlideStyleConfig
} from '../types';
import {
  BLOCK_TYPES_META,
  getSlideBlocks,
  createDefaultBlock,
  createBlankSlide
} from '../utils/slideBlocks';
import { MathView } from './MathView';

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
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showSlideOutlineModal, setShowSlideOutlineModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTeacherGuide, setShowTeacherGuide] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

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
  const handleAddBlock = (type: SlideBlockType) => {
    const newBlock = createDefaultBlock(type);
    const newBlocks = [...blocks, newBlock];
    updateBlocks(newBlocks);
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

  // Toggle Collapse
  const toggleCollapse = (blockId: string) => {
    setCollapsedBlocks((prev) => ({
      ...prev,
      [blockId]: !prev[blockId],
    }));
  };

  // Insert math shortcut into active textarea/input
  const insertMathToField = (blockId: string, fieldName: keyof SlideContentBlock, latex: string) => {
    const targetBlock = blocks.find((b) => b.id === blockId);
    if (!targetBlock) return;
    const currentVal = (targetBlock[fieldName] as string) || '';
    const updatedVal = currentVal ? `${currentVal} $${latex}$` : `$${latex}$`;
    handleUpdateBlock(blockId, { [fieldName]: updatedVal });
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

        {/* Slide Actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Add Blank Slide */}
          <button
            onClick={handleAddNewBlankSlide}
            title="Tạo thêm 1 slide trống mới ngay sau slide này"
            className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Slide Trống</span>
          </button>

          {/* Clear Slide to Blank */}
          <button
            onClick={handleClearSlideToBlank}
            title="Xóa toàn bộ khối trên slide này để làm mới thành slide trống"
            className="p-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Làm mới trống</span>
          </button>

          {/* Delete Current Slide */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            title="Xóa Slide hiện tại"
            className="p-1.5 px-2 rounded-xl bg-rose-950/60 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Xóa Slide</span>
          </button>

          {/* Style & Color Settings */}
          <button
            onClick={() => setShowStylePanel(!showStylePanel)}
            title="Tùy chỉnh Font chữ & Màu sắc hiển thị"
            className={`p-1.5 px-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
              showStylePanel
                ? 'bg-pink-600 text-white shadow'
                : 'bg-slate-800 text-pink-300 hover:bg-slate-700'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Màu & Font</span>
          </button>

          {/* Teacher Guide Toggle */}
          <button
            onClick={() => setShowTeacherGuide(!showTeacherGuide)}
            title="Lời thoại giảng dạy của giáo viên"
            className={`p-1.5 px-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
              showTeacherGuide
                ? 'bg-amber-600 text-white shadow'
                : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Lời Giảng</span>
          </button>
        </div>
      </div>

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

      {/* 4. MAIN ACTION: ADD BLOCK PALETTE (PALETTE THÊM KHỐI) */}
      <div className="p-3 sm:p-4 bg-slate-950/70 border-b border-slate-800 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              Thêm khối vào Slide này:
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              (Bấm vào nút để chèn khối tương ứng)
            </span>
          </div>

          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {blocks.length} khối trên slide
          </span>
        </div>

        {/* Horizontal Quick Block Selector Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5 sm:gap-2">
          {BLOCK_MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.type}
                onClick={() => handleAddBlock(item.type)}
                title={item.desc}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-bold transition-all shadow-sm active:scale-95 ${item.colorClass}`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. SLIDE CANVAS / LIST OF BLOCKS */}
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
                Hãy bấm vào các nút khối phía trên để bắt đầu thêm nội dung tùy chọn: Tiêu đề bài học,
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

          return (
            <div
              key={block.id}
              className={`rounded-2xl bg-slate-950 border-2 border-slate-800/90 shadow-xl overflow-hidden transition-all ${meta.borderColor} border-l-4`}
            >
              {/* BLOCK HEADER */}
              <div className="p-3 sm:p-3.5 bg-slate-900/95 border-b border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                {/* Left: Move & Type Badge */}
                <div className="flex items-center gap-2">
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
                          onChange={(e) => handleUpdateBlock(block.id, { imageCaption: e.target.value })}
                          placeholder="Hình 1: Minh họa định lý Pythagore với $a^2 + b^2 = c^2$"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-pink-500 outline-none"
                        />
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
                  {/* 2. KHỐI TIÊU ĐỀ BÀI HỌC (LESSON TITLE BLOCK)             */}
                  {/* ========================================================= */}
                  {block.type === 'lesson_title' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-blue-300 block mb-1">
                          Tiêu đề chính bài học / chuyên đề:
                        </label>
                        <input
                          type="text"
                          value={block.title || ''}
                          onChange={(e) => handleUpdateBlock(block.id, { title: e.target.value })}
                          placeholder="BÀI 1: MỆNH ĐỀ TOÁN HỌC"
                          className="w-full bg-slate-900 border border-blue-500/40 rounded-xl p-2.5 text-sm sm:text-base font-bold text-white uppercase placeholder-slate-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-300 block mb-1">
                            Phụ đề / Phân môn:
                          </label>
                          <input
                            type="text"
                            value={block.subtitle || ''}
                            onChange={(e) => handleUpdateBlock(block.id, { subtitle: e.target.value })}
                            placeholder="Chương 1: Mệnh đề và tập hợp • Toán 10"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-amber-300 block mb-1">
                            Công thức trọng tâm (LaTeX):
                          </label>
                          <input
                            type="text"
                            value={block.keyFormula || ''}
                            onChange={(e) => handleUpdateBlock(block.id, { keyFormula: e.target.value })}
                            placeholder="a^2 + b^2 = c^2"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs sm:text-sm text-amber-300 font-mono placeholder-slate-500 focus:ring-1 focus:ring-blue-500 outline-none"
                          />
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
                          Tên ví dụ:
                        </label>
                        <input
                          type="text"
                          value={block.title || ''}
                          onChange={(e) => handleUpdateBlock(block.id, { title: e.target.value })}
                          placeholder="Ví dụ 1: Tìm nghiệm của phương trình"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs sm:text-sm text-white font-bold placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">
                          Đề bài ví dụ (Hỗ trợ công thức $...$):
                        </label>
                        <textarea
                          value={block.problem || ''}
                          onChange={(e) => handleUpdateBlock(block.id, { problem: e.target.value })}
                          placeholder="Giải phương trình bậc hai sau: $2x^2 - 5x + 2 = 0$"
                          rows={2}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 outline-none leading-relaxed"
                        />
                      </div>

                      {/* Step by step solutions */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Các bước giải chi tiết (Hiện từng bước khi trình chiếu):</span>
                          </label>
                          <button
                            onClick={() => {
                              const steps = block.solutionSteps || [];
                              handleUpdateBlock(block.id, {
                                solutionSteps: [...steps, `Bước ${steps.length + 1}: Biến đổi...`],
                              });
                            }}
                            className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-all"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Thêm bước giải</span>
                          </button>
                        </div>

                        {(block.solutionSteps || []).map((step, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-2">
                            <span className="text-xs font-bold text-emerald-400 px-2 py-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                              B{sIdx + 1}
                            </span>
                            <textarea
                              value={step}
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
                        ))}
                      </div>

                      {/* Final Answer */}
                      <div>
                        <label className="text-xs font-bold text-emerald-300 block mb-1">
                          Đáp số / Kết luận ví dụ:
                        </label>
                        <input
                          type="text"
                          value={block.finalAnswer || ''}
                          onChange={(e) => handleUpdateBlock(block.id, { finalAnswer: e.target.value })}
                          placeholder="Vậy tập nghiệm của phương trình là $S = \{2; \frac{1}{2}\}$"
                          className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl p-2 text-xs sm:text-sm text-emerald-100 font-bold placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
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
                          Tiêu đề bài tập:
                        </label>
                        <input
                          type="text"
                          value={block.title || ''}
                          onChange={(e) => handleUpdateBlock(block.id, { title: e.target.value })}
                          placeholder={block.type === 'practice' ? 'Luyện tập 1' : 'Vận dụng 1: Bài toán thực tế'}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs sm:text-sm text-white font-bold placeholder-slate-500 focus:ring-1 focus:ring-sky-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">
                          Đề bài (Hỗ trợ công thức $...$):
                        </label>
                        <textarea
                          value={block.problem || ''}
                          onChange={(e) => handleUpdateBlock(block.id, { problem: e.target.value })}
                          placeholder="Nhập nội dung câu hỏi hoặc bài toán rèn luyện..."
                          rows={2}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-sky-500 outline-none leading-relaxed"
                        />
                      </div>

                      {block.type === 'practice' && (
                        <div>
                          <label className="text-xs font-bold text-amber-300 block mb-1">
                            Gợi ý phương pháp (Hint):
                          </label>
                          <input
                            type="text"
                            value={block.hint || ''}
                            onChange={(e) => handleUpdateBlock(block.id, { hint: e.target.value })}
                            placeholder="Áp dụng hằng đẳng thức hoặc đặt ẩn phụ $t = x^2$..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs sm:text-sm text-amber-200 placeholder-slate-500 focus:ring-1 focus:ring-sky-500 outline-none"
                          />
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-bold text-emerald-300 block mb-1">
                          Hướng dẫn giải / Đáp án:
                        </label>
                        <textarea
                          value={block.solution || ''}
                          onChange={(e) => handleUpdateBlock(block.id, { solution: e.target.value })}
                          placeholder="Trình bày lời giải chi tiết..."
                          rows={2}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-emerald-100 placeholder-slate-500 focus:ring-1 focus:ring-sky-500 outline-none leading-relaxed"
                        />
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
                          Tiêu đề khối:
                        </label>
                        <input
                          type="text"
                          value={block.title || ''}
                          onChange={(e) => handleUpdateBlock(block.id, { title: e.target.value })}
                          placeholder="Tiêu đề khối..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs sm:text-sm text-white font-bold placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
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
                          onChange={(e) => handleUpdateBlock(block.id, { content: e.target.value })}
                          placeholder="Nhập nội dung kiến thức, định nghĩa, định lý..."
                          rows={4}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 outline-none leading-relaxed font-sans"
                        />
                      </div>

                      {/* Live Math Preview */}
                      {block.content && (
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                            Xem trước công thức trực tiếp:
                          </span>
                          <div className="text-xs sm:text-sm text-slate-200">
                            <MathView content={block.content} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ========================================================= */}
                  {/* 6. KHỐI HOẠT ĐỘNG KHÁM PHÁ & TÌNH HUỐNG MỞ ĐẦU           */}
                  {/* ========================================================= */}
                  {(block.type === 'activity' || block.type === 'opening_problem') && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-amber-300 block mb-1">
                          Tiêu đề hoạt động:
                        </label>
                        <input
                          type="text"
                          value={block.title || ''}
                          onChange={(e) => handleUpdateBlock(block.id, { title: e.target.value })}
                          placeholder={block.type === 'activity' ? 'Hoạt động 1: Khám phá' : 'Tình huống mở đầu'}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs sm:text-sm text-white font-bold placeholder-slate-500 focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">
                          Bối cảnh thực tế / Nhiệm vụ:
                        </label>
                        <textarea
                          value={block.description || block.context || ''}
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
                      </div>

                      <div>
                        <label className="text-xs font-bold text-blue-300 block mb-1">
                          Câu hỏi thảo luận / Đặt vấn đề:
                        </label>
                        <input
                          type="text"
                          value={block.question || ''}
                          onChange={(e) => handleUpdateBlock(block.id, { question: e.target.value })}
                          placeholder="Dự đoán quy luật hoặc trả lời câu hỏi đặt ra?"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs sm:text-sm text-blue-200 placeholder-slate-500 focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-emerald-300 block mb-1">
                          Kết luận rút ra:
                        </label>
                        <input
                          type="text"
                          value={block.conclusion || ''}
                          onChange={(e) => handleUpdateBlock(block.id, { conclusion: e.target.value })}
                          placeholder="Khái quát hóa kết luận thành kiến thức..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs sm:text-sm text-emerald-200 placeholder-slate-500 focus:ring-1 focus:ring-amber-500 outline-none"
                        />
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
                          <span>Danh sách các mục tiêu cần đạt:</span>
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
                        <div key={itIdx} className="flex items-center gap-2">
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
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
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
    </div>
  );
};
