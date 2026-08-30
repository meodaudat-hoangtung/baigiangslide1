import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  HelpCircle,
  Eye,
  FileText,
  Volume2,
  AlignLeft,
  Type,
  Palette,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  LayoutTemplate
} from 'lucide-react';
import { Slide, SlideSection, SlideImage, SlideStyleConfig } from '../types';
import { MathView } from './MathView';

interface SlideEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  slide: Slide;
  totalSlides: number;
  onSave: (updatedSlide: Slide) => void;
}

const SAMPLE_MATH_DIAGRAMS = [
  {
    name: 'Tam giác vuông & Định lý Pythagore',
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
    caption: 'Mô hình tam giác vuông với $a^2 + b^2 = c^2$',
  },
  {
    name: 'Đồ thị Parabol & Hàm số bậc 2',
    url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
    caption: 'Đồ thị hàm số bậc hai $y = ax^2 + bx + c$',
  },
  {
    name: 'Mặt phẳng tọa độ Oxy & Vectơ',
    url: 'https://images.unsplash.com/photo-1635070040809-90656a297920?auto=format&fit=crop&w=800&q=80',
    caption: 'Hệ tọa độ Oxy và biểu diễn vectơ $\\vec{u} = (x; y)$',
  },
  {
    name: 'Hình khối không gian (Hình chóp / Lăng trụ)',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    caption: 'Mô phỏng hình học không gian 3D',
  },
];

export const SlideEditModal: React.FC<SlideEditModalProps> = ({
  isOpen,
  onClose,
  slide,
  totalSlides,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'sections' | 'style' | 'images' | 'guide' | 'preview'>('info');
  
  // Slide general info state
  const [title, setTitle] = useState(slide.title);
  const [subtitle, setSubtitle] = useState(slide.subtitle || '');
  const [category, setCategory] = useState<Slide['category']>(slide.category);
  const [layout, setLayout] = useState<Slide['layout']>(slide.layout);
  const [keyFormula, setKeyFormula] = useState(slide.keyFormula || '');
  const [duration, setDuration] = useState<number>(slide.suggestedDurationMin || 5);
  const [teacherSpeechGuide, setTeacherSpeechGuide] = useState(slide.teacherSpeechGuide || '');
  const [chalkboardNotes, setChalkboardNotes] = useState(slide.chalkboardNotes || '');

  // Sections state
  const [sections, setSections] = useState<SlideSection[]>(
    JSON.parse(JSON.stringify(slide.sections || []))
  );

  // Typography & Style config
  const [fontFamily, setFontFamily] = useState<SlideStyleConfig['fontFamily']>(
    slide.styleConfig?.fontFamily || 'sans'
  );
  const [fontSize, setFontSize] = useState<SlideStyleConfig['fontSize']>(
    slide.styleConfig?.fontSize || 'base'
  );
  const [textColor, setTextColor] = useState<string>(
    slide.styleConfig?.textColor || '#e2e8f0'
  );
  const [titleColor, setTitleColor] = useState<string>(
    slide.styleConfig?.titleColor || '#ffffff'
  );
  const [subtitleColor, setSubtitleColor] = useState<string>(
    slide.styleConfig?.subtitleColor || '#94a3b8'
  );

  // Images state
  const [images, setImages] = useState<SlideImage[]>(
    JSON.parse(JSON.stringify(slide.images || []))
  );
  const [imgSourceType, setImgSourceType] = useState<'upload' | 'url' | 'presets'>('upload');
  const [newImgUrl, setNewImgUrl] = useState('');
  const [newImgCaption, setNewImgCaption] = useState('');
  const [newImgPosition, setNewImgPosition] = useState<SlideImage['position']>('center');
  const [newImgWidth, setNewImgWidth] = useState<number>(75);
  const [imgError, setImgError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever slide prop changes
  useEffect(() => {
    if (!slide) return;
    setTitle(slide.title || '');
    setSubtitle(slide.subtitle || '');
    setCategory(slide.category || 'definition');
    setLayout(slide.layout || 'standard');
    setKeyFormula(slide.keyFormula || '');
    setDuration(slide.suggestedDurationMin || 5);
    setTeacherSpeechGuide(slide.teacherSpeechGuide || '');
    setChalkboardNotes(slide.chalkboardNotes || '');
    setSections(JSON.parse(JSON.stringify(slide.sections || [])));
    setFontFamily(slide.styleConfig?.fontFamily || 'sans');
    setFontSize(slide.styleConfig?.fontSize || 'base');
    setTextColor(slide.styleConfig?.textColor || '#e2e8f0');
    setTitleColor(slide.styleConfig?.titleColor || '#ffffff');
    setSubtitleColor(slide.styleConfig?.subtitleColor || '#94a3b8');
    setImages(JSON.parse(JSON.stringify(slide.images || [])));
  }, [slide]);

  if (!isOpen || !slide) return null;

  const handleAddSection = () => {
    setSections([
      ...sections,
      {
        title: 'Mục mới',
        content: 'Nhập nội dung kiến thức...',
        bulletPoints: [],
      },
    ]);
  };

  const handleDeleteSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleUpdateSectionField = (index: number, field: keyof SlideSection, value: any) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    setSections(updated);
  };

  const handleAddBulletPoint = (sectionIndex: number) => {
    const updated = [...sections];
    const bp = updated[sectionIndex].bulletPoints || [];
    updated[sectionIndex].bulletPoints = [...bp, 'Ý chính mới (hỗ trợ $LaTeX$)'];
    setSections(updated);
  };

  const handleUpdateBulletPoint = (sectionIndex: number, bpIndex: number, text: string) => {
    const updated = [...sections];
    if (updated[sectionIndex].bulletPoints) {
      updated[sectionIndex].bulletPoints![bpIndex] = text;
      setSections(updated);
    }
  };

  const handleDeleteBulletPoint = (sectionIndex: number, bpIndex: number) => {
    const updated = [...sections];
    if (updated[sectionIndex].bulletPoints) {
      updated[sectionIndex].bulletPoints = updated[sectionIndex].bulletPoints!.filter(
        (_, i) => i !== bpIndex
      );
      setSections(updated);
    }
  };

  // Callout toggle/edit
  const handleToggleCallout = (sectionIndex: number) => {
    const updated = [...sections];
    if (updated[sectionIndex].callout) {
      delete updated[sectionIndex].callout;
    } else {
      updated[sectionIndex].callout = {
        type: 'theorem',
        title: 'Định Lý Quan Trọng',
        content: 'Phát biểu định lý với công thức $...$',
      };
    }
    setSections(updated);
  };

  // Example toggle/edit
  const handleToggleExample = (sectionIndex: number) => {
    const updated = [...sections];
    if (updated[sectionIndex].example) {
      delete updated[sectionIndex].example;
    } else {
      updated[sectionIndex].example = {
        problem: 'Cho bài toán: Tính $x$ khi...',
        solutionSteps: ['Bước 1: Áp dụng công thức...', 'Bước 2: Thay số ta được...'],
        finalAnswer: 'Vậy kết quả là $x = ...$',
      };
    }
    setSections(updated);
  };

  const handleAddSolutionStep = (sectionIndex: number) => {
    const updated = [...sections];
    if (updated[sectionIndex].example) {
      updated[sectionIndex].example!.solutionSteps.push('Bước tiếp theo...');
      setSections(updated);
    }
  };

  const handleUpdateSolutionStep = (sectionIndex: number, stepIndex: number, text: string) => {
    const updated = [...sections];
    if (updated[sectionIndex].example) {
      updated[sectionIndex].example!.solutionSteps[stepIndex] = text;
      setSections(updated);
    }
  };

  const handleDeleteSolutionStep = (sectionIndex: number, stepIndex: number) => {
    const updated = [...sections];
    if (updated[sectionIndex].example) {
      updated[sectionIndex].example!.solutionSteps = updated[sectionIndex].example!.solutionSteps.filter(
        (_, i) => i !== stepIndex
      );
      setSections(updated);
    }
  };

  // Image handling
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setImgError('Vui lòng chọn tệp hình ảnh (PNG, JPG, SVG, WebP).');
      return;
    }
    setImgError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setNewImgUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddNewImage = () => {
    if (!newImgUrl.trim()) {
      setImgError('Vui lòng tải ảnh lên hoặc nhập đường dẫn ảnh.');
      return;
    }
    const newImage: SlideImage = {
      id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      url: newImgUrl.trim(),
      caption: newImgCaption.trim() || undefined,
      position: newImgPosition,
      widthPercent: newImgWidth,
    };
    setImages([...images, newImage]);
    setNewImgUrl('');
    setNewImgCaption('');
    setImgError('');
  };

  const handleDeleteImage = (imgId: string) => {
    setImages(images.filter((img) => img.id !== imgId));
  };

  const handleSave = () => {
    const updatedSlide: Slide = {
      ...slide,
      title: title.trim() || 'Slide không có tiêu đề',
      subtitle: subtitle.trim(),
      category,
      layout,
      keyFormula: keyFormula.trim(),
      suggestedDurationMin: Number(duration) || 5,
      teacherSpeechGuide: teacherSpeechGuide.trim(),
      chalkboardNotes: chalkboardNotes.trim(),
      sections,
      images,
      styleConfig: {
        fontFamily,
        fontSize,
        textColor,
        titleColor,
        subtitleColor,
      },
    };
    onSave(updatedSlide);
    onClose();
  };

  const fontClass =
    fontFamily === 'serif'
      ? 'font-slide-serif'
      : fontFamily === 'mono'
      ? 'font-slide-mono'
      : fontFamily === 'display'
      ? 'font-slide-display'
      : fontFamily === 'handwriting'
      ? 'font-slide-handwriting'
      : 'font-slide-sans';

  const sizeClass =
    fontSize === 'sm'
      ? 'text-sm'
      : fontSize === 'lg'
      ? 'text-lg'
      : fontSize === 'xl'
      ? 'text-xl'
      : 'text-base';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-mono font-bold text-xs">
              Sửa Slide {slide.slideNumber} / {totalSlides}
            </div>
            <h3 className="font-bold text-base sm:text-lg text-white">Chỉnh Sửa Chi Tiết Slide</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-900/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-indigo-500 text-indigo-300 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Thông Tin & Bố Cục</span>
          </button>
          <button
            onClick={() => setActiveTab('sections')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'sections'
                ? 'border-indigo-500 text-indigo-300 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Nội Dung ({sections.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('style')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'style'
                ? 'border-indigo-500 text-indigo-300 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Type className="w-4 h-4 text-pink-400" />
            <span>Font & Màu Chữ</span>
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'images'
                ? 'border-indigo-500 text-indigo-300 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <span>Hình Ảnh ({images.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-indigo-500 text-indigo-300 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Lời Giảng & Ghi Bảng</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'preview'
                ? 'border-indigo-500 text-indigo-300 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Xem Trước</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6 text-slate-200">
          {/* TAB 1: MAIN INFO */}
          {activeTab === 'info' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Tiêu Đề Slide (Title) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Định Lý Pythagore (Pytago) & Mục Tiêu Bài Học"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm sm:text-base font-bold text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Phụ Đề / Mô Tả Ngắn (Subtitle)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Ví dụ: Khám phá mối quan hệ hình học kỳ diệu giữa các cạnh..."
                  className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Phân Loại Bài Học
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="intro">🚀 Khởi Động (Intro)</option>
                    <option value="definition">📖 Định Nghĩa (Definition)</option>
                    <option value="theorem">📐 Định Lý & Công Thức (Theorem)</option>
                    <option value="method">💡 Phương Pháp Giải (Method)</option>
                    <option value="example">📝 Ví Dụ Minh Họa (Example)</option>
                    <option value="application">🌍 Ứng Dụng Thực Tiễn (Application)</option>
                    <option value="summary">🎯 Tổng Kết (Summary)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Bố Cục Trình Chiếu (Layout)
                  </label>
                  <select
                    value={layout}
                    onChange={(e) => setLayout(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="standard">Tiêu Chuẩn (Standard)</option>
                    <option value="split_two_col">Chia 2 Cột (Split 2 Cols)</option>
                    <option value="formula_focus">Tập Trung Công Thức (Formula Focus)</option>
                    <option value="step_by_step">Từng Bước (Step by Step)</option>
                    <option value="example_box">Khung Bài Tập Ví Dụ (Example Box)</option>
                    <option value="geometric_diagram">Hình Vẽ & Sơ Đồ (Diagram)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Thời Lượng Dự Kiến (Phút)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="45"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Key Formula */}
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Công Thức Trọng Tâm Của Slide (LaTeX)
                </label>
                <p className="text-xs text-slate-400">
                  Nhập công thức dạng LaTeX (ví dụ: <code className="text-amber-300 font-mono">a^2 + b^2 = c^2</code> hoặc <code className="text-amber-300 font-mono">\Delta = b^2 - 4ac</code>)
                </p>
                <input
                  type="text"
                  value={keyFormula}
                  onChange={(e) => setKeyFormula(e.target.value)}
                  placeholder="a^2 + b^2 = c^2"
                  className="w-full bg-slate-900 border border-indigo-500/40 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm font-mono text-amber-300 focus:outline-none"
                />
                {keyFormula && (
                  <div className="pt-2 text-center bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <MathView content={`$$${keyFormula}$$`} block />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SECTIONS & EXAMPLES */}
          {activeTab === 'sections' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Các Khối Nội Dung & Ví Dụ ({sections.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  Thêm Khối Mới
                </button>
              </div>

              {sections.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded-2xl">
                  <p className="text-slate-400 text-sm">Chưa có khối nội dung nào.</p>
                  <button
                    onClick={handleAddSection}
                    className="mt-3 px-4 py-2 rounded-xl bg-indigo-600/30 text-indigo-300 text-xs font-semibold"
                  >
                    + Tạo khối đầu tiên
                  </button>
                </div>
              ) : (
                sections.map((section, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700 space-y-4 relative"
                  >
                    <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600/40 text-indigo-300 flex items-center justify-center text-xs font-bold">
                          {sIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={section.title || ''}
                          onChange={(e) => handleUpdateSectionField(sIdx, 'title', e.target.value)}
                          placeholder="Tiêu đề mục (Ví dụ: 1. Khái niệm cơ bản)"
                          className="bg-transparent font-bold text-white text-sm focus:outline-none focus:border-b border-indigo-400 px-1"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(sIdx)}
                        className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                        title="Xóa mục này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Content */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Nội dung đoạn văn (Hỗ trợ công thức $...$)
                      </label>
                      <textarea
                        rows={3}
                        value={section.content || ''}
                        onChange={(e) => handleUpdateSectionField(sIdx, 'content', e.target.value)}
                        placeholder="Nhập nội dung giải thích..."
                        className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl p-3 text-sm text-slate-200 focus:outline-none"
                      />
                    </div>

                    {/* Bullet Points */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-400">
                          Các ý chính / Gạch đầu dòng
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddBulletPoint(sIdx)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                        >
                          <Plus className="w-3.5 h-3.5" /> Thêm gạch đầu dòng
                        </button>
                      </div>
                      {(section.bulletPoints || []).map((bp, bpIdx) => (
                        <div key={bpIdx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                          <input
                            type="text"
                            value={bp}
                            onChange={(e) => handleUpdateBulletPoint(sIdx, bpIdx, e.target.value)}
                            className="flex-1 bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-slate-200 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteBulletPoint(sIdx, bpIdx)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Toggle Callout & Example Controls */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-700/60">
                      <button
                        type="button"
                        onClick={() => handleToggleCallout(sIdx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                          section.callout
                            ? 'bg-purple-950/60 border-purple-500/60 text-purple-300'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {section.callout ? 'Bật Khung Định Lý / Ghi Chú' : '+ Thêm Khung Định Lý/Chú Thích'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleExample(sIdx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                          section.example
                            ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        {section.example ? 'Bật Ví Dụ Minh Họa' : '+ Thêm Ví Dụ Minh Họa'}
                      </button>
                    </div>

                    {/* Callout Editor */}
                    {section.callout && (
                      <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-purple-300 uppercase">Khung Chú Thích / Định Lý</span>
                          <select
                            value={section.callout.type}
                            onChange={(e) => {
                              const updated = [...sections];
                              updated[sIdx].callout!.type = e.target.value as any;
                              setSections(updated);
                            }}
                            className="bg-slate-900 border border-purple-500/40 rounded-lg px-2 py-1 text-xs text-purple-200 focus:outline-none"
                          >
                            <option value="theorem">Định Lý (Theorem)</option>
                            <option value="definition">Định Nghĩa (Definition)</option>
                            <option value="tip">Mẹo Nhớ (Tip)</option>
                            <option value="warning">Lưu Ý (Warning)</option>
                          </select>
                        </div>
                        <input
                          type="text"
                          value={section.callout.title || ''}
                          onChange={(e) => {
                            const updated = [...sections];
                            updated[sIdx].callout!.title = e.target.value;
                            setSections(updated);
                          }}
                          placeholder="Tiêu đề khung (VD: Định lý Pythagore đảo)"
                          className="w-full bg-slate-900 border border-purple-500/30 rounded-xl px-3 py-1.5 text-xs text-purple-100 focus:outline-none font-bold"
                        />
                        <textarea
                          rows={2}
                          value={section.callout.content}
                          onChange={(e) => {
                            const updated = [...sections];
                            updated[sIdx].callout!.content = e.target.value;
                            setSections(updated);
                          }}
                          placeholder="Nội dung phát biểu định lý..."
                          className="w-full bg-slate-900 border border-purple-500/30 rounded-xl p-2.5 text-xs text-purple-100 focus:outline-none"
                        />
                      </div>
                    )}

                    {/* Example Editor */}
                    {section.example && (
                      <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 space-y-3">
                        <span className="text-xs font-bold text-cyan-300 uppercase">Ví Dụ & Lời Giải Từng Bước</span>
                        <input
                          type="text"
                          value={section.example.problem}
                          onChange={(e) => {
                            const updated = [...sections];
                            updated[sIdx].example!.problem = e.target.value;
                            setSections(updated);
                          }}
                          placeholder="Đề bài ví dụ: Cho tam giác vuông có hai cạnh góc vuông..."
                          className="w-full bg-slate-900 border border-cyan-500/30 rounded-xl px-3 py-2 text-xs font-bold text-cyan-100 focus:outline-none"
                        />

                        {/* Steps */}
                        <div className="space-y-1.5 pl-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-cyan-300">Các bước giải:</label>
                            <button
                              type="button"
                              onClick={() => handleAddSolutionStep(sIdx)}
                              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
                            >
                              + Thêm bước
                            </button>
                          </div>
                          {section.example.solutionSteps.map((step, stIdx) => (
                            <div key={stIdx} className="flex items-center gap-2">
                              <span className="text-xs text-cyan-400 font-mono">B{stIdx + 1}:</span>
                              <input
                                type="text"
                                value={step}
                                onChange={(e) => handleUpdateSolutionStep(sIdx, stIdx, e.target.value)}
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleDeleteSolutionStep(sIdx, stIdx)}
                                className="p-1 text-slate-400 hover:text-rose-400"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Final Answer */}
                        <input
                          type="text"
                          value={section.example.finalAnswer}
                          onChange={(e) => {
                            const updated = [...sections];
                            updated[sIdx].example!.finalAnswer = e.target.value;
                            setSections(updated);
                          }}
                          placeholder="Đáp số cuối cùng: Vậy độ dài cạnh huyền là $c = 5\\text{ cm}$"
                          className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-1.5 text-xs text-emerald-300 focus:outline-none font-bold"
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: TYPOGRAPHY & COLORS */}
          {activeTab === 'style' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-4">
                <h4 className="text-sm font-bold text-pink-300 flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  <span>Phông Chữ & Kích Thước Chữ Cho Slide Này</span>
                </h4>

                {/* Font Family Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Chọn Kiểu Phông Chữ (Font Family)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'sans', name: 'Sans-Serif (Hiện đại)', desc: 'Plus Jakarta Sans', sample: 'Công thức $x^2 + y^2 = r^2$' },
                      { id: 'serif', name: 'Serif (Thanh lịch & SGK)', desc: 'Noto Serif', sample: 'Định lý $a^2 + b^2 = c^2$' },
                      { id: 'mono', name: 'Monospace (Kỹ thuật)', desc: 'Fira Code', sample: 'f(x) = \\sqrt{x}' },
                      { id: 'display', name: 'Display (Nổi bật)', desc: 'Outfit Header', sample: 'Toán Học 10' },
                      { id: 'handwriting', name: 'Viết Tay (Bảng phấn)', desc: 'Patrick Hand', sample: 'Ghi nhớ nhanh!' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFontFamily(f.id as any)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          fontFamily === f.id
                            ? 'bg-pink-950/50 border-pink-500 text-white shadow-lg shadow-pink-950/40 ring-1 ring-pink-500'
                            : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <p className="text-xs font-bold text-white">{f.name}</p>
                        <p className="text-[11px] text-slate-400">{f.desc}</p>
                        <div className="mt-2 text-xs text-pink-300 bg-slate-950/60 p-1.5 rounded-lg">
                          <MathView content={f.sample} inline />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Kích Thước Chữ Toàn Slide (Font Size)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'sm', label: 'Nhỏ (Small)', size: '14px', preview: 'Nhỏ gọn' },
                      { id: 'base', label: 'Tiêu Chuẩn (Base)', size: '16px', preview: 'Chuẩn' },
                      { id: 'lg', label: 'Lớn (Large)', size: '18px', preview: 'Dễ đọc' },
                      { id: 'xl', label: 'Rất Lớn (Extra)', size: '20px', preview: 'Trình chiếu lớn' },
                    ].map((sz) => (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => setFontSize(sz.id as any)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          fontSize === sz.id
                            ? 'bg-indigo-600 border-indigo-400 text-white font-bold shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-semibold">{sz.label}</div>
                        <div className="text-[11px] opacity-75">{sz.preview}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Color Customization */}
              <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-4">
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  <span>Màu Sắc Tiêu Đề & Nội Dung Chữ</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Title Color */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                      Màu Tiêu Đề Chính
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={titleColor}
                        onChange={(e) => setTitleColor(e.target.value)}
                        className="w-9 h-9 rounded-xl border border-slate-700 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={titleColor}
                        onChange={(e) => setTitleColor(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                    {/* Quick color circles */}
                    <div className="flex gap-1.5 pt-1">
                      {['#ffffff', '#38bdf8', '#fbbf24', '#34d399', '#f43f5e', '#a78bfa'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setTitleColor(c)}
                          className="w-5 h-5 rounded-full border border-white/30"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Subtitle Color */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                      Màu Phụ Đề
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={subtitleColor}
                        onChange={(e) => setSubtitleColor(e.target.value)}
                        className="w-9 h-9 rounded-xl border border-slate-700 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={subtitleColor}
                        onChange={(e) => setSubtitleColor(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-1.5 pt-1">
                      {['#94a3b8', '#cbd5e1', '#67e8f9', '#fde047', '#86efac', '#fca5a5'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSubtitleColor(c)}
                          className="w-5 h-5 rounded-full border border-white/30"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Text Body Color */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                      Màu Chữ Nội Dung
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-9 h-9 rounded-xl border border-slate-700 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-1.5 pt-1">
                      {['#e2e8f0', '#f8fafc', '#bae6fd', '#fef08a', '#bbf7d0', '#fed7aa'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setTextColor(c)}
                          className="w-5 h-5 rounded-full border border-white/30"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live typography test card */}
                <div className={`mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 ${fontClass} ${sizeClass}`}>
                  <h3 className="font-bold text-lg" style={{ color: titleColor }}>
                    {title || 'Tiêu Đề Mẫu Của Slide'}
                  </h3>
                  <p className="text-xs mt-1" style={{ color: subtitleColor }}>
                    {subtitle || 'Phụ đề minh họa định dạng màu sắc'}
                  </p>
                  <p className="mt-2 text-sm" style={{ color: textColor }}>
                    Nội dung văn bản toán học với công thức $E = mc^2$ và định lý $a^2 + b^2 = c^2$.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: IMAGES & DIAGRAMS */}
          {activeTab === 'images' && (
            <div className="space-y-6">
              {/* Existing Images */}
              {images.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Danh Sách Ảnh Trong Slide ({images.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {images.map((img, idx) => (
                      <div
                        key={img.id || idx}
                        className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex gap-3 items-center"
                      >
                        <img
                          src={img.url}
                          alt={img.caption || 'Hình ảnh'}
                          className="w-16 h-16 object-cover rounded-xl border border-slate-700 bg-slate-950 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-200 font-semibold truncate">
                            {img.caption ? <MathView content={img.caption} inline /> : `Ảnh minh họa #${idx + 1}`}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Vị trí: {img.position === 'left' ? 'Trái' : img.position === 'right' ? 'Phải' : img.position === 'top' ? 'Trên' : 'Giữa'} | Rộng: {img.widthPercent || 75}%
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.id)}
                          className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors"
                          title="Xóa ảnh này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Image Form */}
              <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/80 space-y-4">
                <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>Chèn Thêm Hình Ảnh Minh Họa</span>
                </h4>

                {/* Source Types */}
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setImgSourceType('upload')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      imgSourceType === 'upload' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải Từ Máy Tính</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImgSourceType('url')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      imgSourceType === 'url' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Nhập Link (URL)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImgSourceType('presets')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      imgSourceType === 'presets' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <LayoutTemplate className="w-3.5 h-3.5" />
                    <span>Hình Mẫu Toán</span>
                  </button>
                </div>

                {imgSourceType === 'upload' && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-6 text-center cursor-pointer bg-slate-900/60 transition-all"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
                    <p className="text-xs sm:text-sm font-semibold text-slate-200">
                      Bấm vào đây để chọn ảnh sơ đồ / bài tập từ máy
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, SVG, WebP</p>
                  </div>
                )}

                {imgSourceType === 'url' && (
                  <div>
                    <input
                      type="url"
                      value={newImgUrl}
                      onChange={(e) => setNewImgUrl(e.target.value)}
                      placeholder="https://example.com/hinh-hoc.png"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none"
                    />
                  </div>
                )}

                {imgSourceType === 'presets' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {SAMPLE_MATH_DIAGRAMS.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setNewImgUrl(s.url);
                          setNewImgCaption(s.caption);
                        }}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/60 text-left flex items-center gap-2.5 transition-all"
                      >
                        <img src={s.url} alt={s.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{s.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{s.caption}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {newImgUrl && (
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-3">
                    <div className="flex justify-center max-h-40 overflow-hidden bg-slate-950 rounded-lg p-1">
                      <img src={newImgUrl} alt="Xem trước" className="max-h-36 object-contain rounded" />
                    </div>

                    <input
                      type="text"
                      value={newImgCaption}
                      onChange={(e) => setNewImgCaption(e.target.value)}
                      placeholder="Chú thích ảnh (hỗ trợ $LaTeX$)..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Vị Trí</label>
                        <select
                          value={newImgPosition}
                          onChange={(e) => setNewImgPosition(e.target.value as any)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                        >
                          <option value="center">Căn Giữa</option>
                          <option value="right">Bên Phải</option>
                          <option value="left">Bên Trái</option>
                          <option value="top">Trên Cùng</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Kích Thước</label>
                        <select
                          value={newImgWidth}
                          onChange={(e) => setNewImgWidth(Number(e.target.value))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                        >
                          <option value={30}>30% (Nhỏ)</option>
                          <option value={50}>50% (Vừa)</option>
                          <option value={75}>75% (Tiêu chuẩn)</option>
                          <option value={100}>100% (Toàn chiều rộng)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddNewImage}
                      className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Xác Nhận Thêm Ảnh Này Vào Slide</span>
                    </button>
                  </div>
                )}

                {imgError && (
                  <p className="text-xs text-rose-400 bg-rose-950/40 p-2 rounded-xl border border-rose-500/40">
                    {imgError}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: TEACHER GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  Lời Thoại Dẫn Giảng Của Giáo Viên (Teacher Speech Guide)
                </label>
                <p className="text-xs text-slate-400">
                  Nội dung gợi ý lời nói, câu hỏi mở đầu hoặc dẫn dắt học sinh trong suốt slide này.
                </p>
                <textarea
                  rows={4}
                  value={teacherSpeechGuide}
                  onChange={(e) => setTeacherSpeechGuide(e.target.value)}
                  placeholder="Ví dụ: Chào các em, hôm nay chúng ta sẽ tìm hiểu một định lý hình học vô cùng nổi tiếng..."
                  className="w-full bg-slate-900 border border-amber-500/30 focus:border-amber-500 rounded-xl p-3.5 text-sm text-amber-100 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                  <AlignLeft className="w-4 h-4" />
                  Ghi Chú Viết Bảng Đen (Chalkboard Notes)
                </label>
                <p className="text-xs text-slate-400">
                  Tóm tắt ngắn gọn các dòng cần viết lên bảng đen tương ứng với slide này.
                </p>
                <textarea
                  rows={3}
                  value={chalkboardNotes}
                  onChange={(e) => setChalkboardNotes(e.target.value)}
                  placeholder="Ví dụ: BÀI: ĐỊNH LÝ PYTHAGORE&#10;1. Định lý thuận: a^2 + b^2 = c^2"
                  className="w-full bg-slate-900 border border-emerald-500/30 focus:border-emerald-500 rounded-xl p-3.5 text-sm font-mono text-emerald-200 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 6: LIVE PREVIEW */}
          {activeTab === 'preview' && (
            <div className={`p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-6 ${fontClass} ${sizeClass}`}>
              <div className="border-b border-slate-800 pb-3">
                <h1 className="text-2xl font-bold" style={{ color: titleColor }}>
                  {title || 'Tiêu Đề'}
                </h1>
                {subtitle && <p className="text-sm mt-1" style={{ color: subtitleColor }}>{subtitle}</p>}
              </div>

              {keyFormula && (
                <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 text-center">
                  <MathView content={`$$${keyFormula}$$`} block />
                </div>
              )}

              {/* Images Preview */}
              {images.length > 0 && (
                <div className="flex flex-wrap gap-4 justify-center">
                  {images.map((img, idx) => (
                    <div key={idx} className="flex flex-col items-center bg-slate-900 p-2.5 rounded-2xl border border-slate-800" style={{ maxWidth: `${img.widthPercent || 75}%` }}>
                      <img src={img.url} alt={img.caption || 'Ảnh'} className="max-h-56 object-contain rounded-xl" />
                      {img.caption && (
                        <p className="text-xs text-slate-400 mt-2 text-center">
                          <MathView content={img.caption} inline />
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4" style={{ color: textColor }}>
                {sections.map((sec, idx) => (
                  <div key={idx} className="space-y-3">
                    {sec.title && <h3 className="font-bold text-indigo-300">{sec.title}</h3>}
                    {sec.content && (
                      <div className="bg-slate-900/60 p-3 rounded-xl">
                        <MathView content={sec.content} />
                      </div>
                    )}
                    {sec.callout && (
                      <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200">
                        {sec.callout.title && <div className="font-bold text-sm mb-1">{sec.callout.title}</div>}
                        <MathView content={sec.callout.content} />
                      </div>
                    )}
                    {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                      <ul className="space-y-1.5 pl-4 list-disc text-sm">
                        {sec.bulletPoints.map((bp, bpIdx) => (
                          <li key={bpIdx}><MathView content={bp} /></li>
                        ))}
                      </ul>
                    )}
                    {sec.example && (
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-2">
                        <div className="font-bold text-cyan-300 text-sm">
                          <span className="mr-1">Ví Dụ:</span>
                          <MathView content={sec.example.problem} className="inline" />
                        </div>
                        <div className="space-y-1 pl-2 text-xs">
                          {sec.example.solutionSteps.map((st, stIdx) => (
                            <div key={stIdx} className="text-slate-300 flex items-start gap-1">
                              <span className="flex-shrink-0">•</span>
                              <MathView content={st} />
                            </div>
                          ))}
                        </div>
                        {sec.example.finalAnswer && (
                          <div className="font-bold text-emerald-400 text-xs flex items-start gap-1">
                            <span className="flex-shrink-0">Đáp số:</span>
                            <MathView content={sec.example.finalAnswer} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition-colors"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Check className="w-4 h-4" />
            Lưu Thay Đổi Slide
          </button>
        </div>
      </div>
    </div>
  );
};
