import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Check,
  Trash2,
  Maximize2,
  Sparkles,
  LayoutTemplate
} from 'lucide-react';
import { Slide, SlideImage } from '../types';
import { MathView } from './MathView';

interface SlideImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  slide: Slide;
  onSaveSlide: (updatedSlide: Slide) => void;
}

// Sample educational diagrams that teachers can quickly pick
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

export const SlideImageModal: React.FC<SlideImageModalProps> = ({
  isOpen,
  onClose,
  slide,
  onSaveSlide,
}) => {
  const [sourceType, setSourceType] = useState<'upload' | 'url' | 'presets'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [position, setPosition] = useState<SlideImage['position']>('center');
  const [widthPercent, setWidthPercent] = useState<number>(75);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !slide) return null;

  const currentImages = slide?.images || [];

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Vui lòng chỉ chọn tệp hình ảnh (PNG, JPG, JPEG, WebP, SVG).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Kích thước ảnh không nên vượt quá 10MB.');
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setImageUrl(dataUrl);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Không thể đọc tệp ảnh. Vui lòng thử lại.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleAddImageToSlide = () => {
    if (!imageUrl.trim()) {
      setErrorMsg('Vui lòng tải ảnh lên hoặc nhập đường dẫn ảnh.');
      return;
    }

    const newImage: SlideImage = {
      id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      url: imageUrl.trim(),
      caption: caption.trim() || undefined,
      position,
      widthPercent,
    };

    const updatedSlide: Slide = {
      ...slide,
      images: [...currentImages, newImage],
    };

    onSaveSlide(updatedSlide);
    // Reset form
    setImageUrl('');
    setCaption('');
    setErrorMsg('');
  };

  const handleDeleteImage = (imageId: string) => {
    const updatedSlide: Slide = {
      ...slide,
      images: currentImages.filter((img) => img.id !== imageId),
    };
    onSaveSlide(updatedSlide);
  };

  const handleSelectPreset = (preset: typeof SAMPLE_MATH_DIAGRAMS[0]) => {
    setImageUrl(preset.url);
    setCaption(preset.caption);
    setSourceType('url');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Chèn & Quản Lý Hình Ảnh Slide</h3>
              <p className="text-xs text-slate-400">Slide {slide.slideNumber}: {slide.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6 text-slate-200">
          {/* Currently Attached Images */}
          {currentImages.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span>Ảnh Đang Có Trong Slide ({currentImages.length})</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentImages.map((img, idx) => (
                  <div
                    key={img.id || idx}
                    className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex gap-3 items-center group relative overflow-hidden"
                  >
                    <img
                      src={img.url}
                      alt={img.caption || 'Hình ảnh minh họa'}
                      className="w-20 h-20 object-cover rounded-xl border border-slate-700 flex-shrink-0 bg-slate-950"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-300 truncate font-semibold">
                        {img.caption ? <MathView content={img.caption} inline /> : `Ảnh minh họa #${idx + 1}`}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span className="bg-slate-700 px-2 py-0.5 rounded">
                          {img.position === 'left' ? 'Trái' : img.position === 'right' ? 'Phải' : img.position === 'top' ? 'Trên' : 'Giữa'}
                        </span>
                        <span className="bg-slate-700 px-2 py-0.5 rounded">{img.widthPercent || 75}%</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors"
                      title="Xóa ảnh này khỏi slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Image Form */}
          <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/80 space-y-4">
            <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Thêm Hình Ảnh Mới Vào Slide</span>
            </h4>

            {/* Source Type Selector */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setSourceType('upload')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  sourceType === 'upload'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Tải Từ Máy Tính</span>
              </button>
              <button
                type="button"
                onClick={() => setSourceType('url')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  sourceType === 'url'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Nhập Link Ảnh (URL)</span>
              </button>
              <button
                type="button"
                onClick={() => setSourceType('presets')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  sourceType === 'presets'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                <span>Hình Mẫu Toán Học</span>
              </button>
            </div>

            {/* Upload Area */}
            {sourceType === 'upload' && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-400 bg-indigo-950/40'
                    : 'border-slate-700 hover:border-indigo-500/60 bg-slate-900/60'
                }`}
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
                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-200">
                  Nhấn để chọn ảnh từ máy tính hoặc kéo thả vào đây
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Hỗ trợ PNG, JPG, JPEG, SVG, WebP (Ảnh chụp sách giáo khoa, sơ đồ, đồ thị)
                </p>
              </div>
            )}

            {/* URL Input */}
            {sourceType === 'url' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Đường Dẫn Hình Ảnh (URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/hinh-hoc-tam-giac.png"
                    className="flex-1 bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Presets List */}
            {sourceType === 'presets' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SAMPLE_MATH_DIAGRAMS.map((sample, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => handleSelectPreset(sample)}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/60 text-left flex items-center gap-3 transition-all group"
                  >
                    <img
                      src={sample.url}
                      alt={sample.name}
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-indigo-300 truncate">
                        {sample.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{sample.caption}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Image Preview & Customization */}
            {imageUrl && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Xem Trước Ảnh Đã Chọn
                  </span>
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Hủy ảnh này
                  </button>
                </div>

                <div className="flex justify-center bg-slate-950 p-2 rounded-xl border border-slate-800 max-h-56 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="Xem trước"
                    className="max-h-52 object-contain rounded-lg shadow"
                  />
                </div>

                {/* Caption Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Chú Thích Hình Ảnh (Hỗ trợ công thức $LaTeX$)
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Ví dụ: Hình 1.1: Tam giác vuông $ABC$ vuông tại $A$ với $BC = \\sqrt{AB^2 + AC^2}$"
                    className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                  />
                </div>

                {/* Layout Position & Size */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Vị Trí Trong Slide
                    </label>
                    <select
                      value={position}
                      onChange={(e) => setPosition(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    >
                      <option value="center">📌 Căn Giữa (Khuyến nghị)</option>
                      <option value="right">👉 Bên Phải (Cột 2)</option>
                      <option value="left">👈 Bên Trái (Cột 1)</option>
                      <option value="top">🔝 Đặt Trên Cùng</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Độ Rộng Hiển Thị
                    </label>
                    <select
                      value={widthPercent}
                      onChange={(e) => setWidthPercent(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    >
                      <option value={30}>30% (Nhỏ gọn)</option>
                      <option value={50}>50% (Vừa vặn nửa màn hình)</option>
                      <option value={75}>75% (Tiêu chuẩn - Rõ nét)</option>
                      <option value={100}>100% (Toàn chiều rộng)</option>
                    </select>
                  </div>
                </div>

                {/* Button to confirm add */}
                <button
                  type="button"
                  onClick={handleAddImageToSlide}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Xác Nhận Chèn Ảnh Vào Slide Này</span>
                </button>
              </div>
            )}

            {errorMsg && (
              <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/40">
                {errorMsg}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/95">
          <p className="text-xs text-slate-400">
            Tổng cộng: <strong className="text-white">{currentImages.length}</strong> ảnh trong slide
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
