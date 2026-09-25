import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Film,
  Type,
  FileText,
  Bookmark,
  Lightbulb,
  Dumbbell,
  Zap,
  AlertTriangle,
  Compass,
  Target,
  Rocket,
  Eye,
  EyeOff,
  Sliders
} from 'lucide-react';
import { SlideContentBlock, SlideBlockType } from '../types';
import { MathView } from './MathView';
import { MediaBlockRenderer } from './MediaBlockRenderer';

interface BlockEditModalProps {
  isOpen: boolean;
  block: SlideContentBlock | null;
  onClose: () => void;
  onSave: (updatedBlock: SlideContentBlock) => void;
}

export const BlockEditModal: React.FC<BlockEditModalProps> = ({
  isOpen,
  block,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<SlideContentBlock>(() => (block ? { ...block } : ({} as SlideContentBlock)));
  const [activeTab, setActiveTab] = useState<'content' | 'preview'>('content');

  // Keep form data in sync when the selected block changes
  useEffect(() => {
    if (block) {
      setFormData({ ...block });
    }
  }, [block?.id]);

  if (!isOpen || !block) return null;

  const updateField = (field: keyof SlideContentBlock, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateField('imageUrl', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to add/remove/update solution steps for Example
  const handleAddStep = () => {
    const currentSteps = formData.solutionSteps || [];
    updateField('solutionSteps', [...currentSteps, `Bước ${currentSteps.length + 1}: `]);
  };

  const handleUpdateStep = (index: number, val: string) => {
    const currentSteps = [...(formData.solutionSteps || [])];
    currentSteps[index] = val;
    updateField('solutionSteps', currentSteps);
  };

  const handleRemoveStep = (index: number) => {
    const currentSteps = (formData.solutionSteps || []).filter((_, i) => i !== index);
    updateField('solutionSteps', currentSteps);
  };

  // Helper for objectives items
  const handleAddObjective = () => {
    const current = formData.items || [];
    updateField('items', [...current, 'Mục tiêu cần đạt mới...']);
  };

  const handleUpdateObjective = (index: number, val: string) => {
    const current = [...(formData.items || [])];
    current[index] = val;
    updateField('items', current);
  };

  const handleRemoveObjective = (index: number) => {
    const current = (formData.items || []).filter((_, i) => i !== index);
    updateField('items', current);
  };

  const getBlockIcon = (type: SlideBlockType) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-5 h-5 text-pink-400" />;
      case 'media': return <Film className="w-5 h-5 text-rose-400" />;
      case 'lesson_title': return <Type className="w-5 h-5 text-blue-400" />;
      case 'content': return <FileText className="w-5 h-5 text-purple-400" />;
      case 'takeaway': return <Bookmark className="w-5 h-5 text-indigo-400" />;
      case 'example': return <Lightbulb className="w-5 h-5 text-emerald-400" />;
      case 'practice': return <Dumbbell className="w-5 h-5 text-sky-400" />;
      case 'activity': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'note': return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      case 'application': return <Compass className="w-5 h-5 text-teal-400" />;
      case 'objectives': return <Target className="w-5 h-5 text-emerald-400" />;
      case 'opening_problem': return <Rocket className="w-5 h-5 text-amber-400" />;
      default: return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  const getBlockTypeLabel = (type: SlideBlockType) => {
    switch (type) {
      case 'image': return 'Chèn Hình Ảnh';
      case 'media': return 'Video / Âm Thanh';
      case 'lesson_title': return 'Tiêu Đề Bài Học';
      case 'content': return 'Lý Thuyết / Nội Dung';
      case 'takeaway': return 'Ghi Nhớ Trọng Tâm (SGK)';
      case 'example': return 'Ví Dụ Minh Họa';
      case 'practice': return 'Luyện Tập';
      case 'activity': return 'Hoạt Động Khám Phá';
      case 'note': return 'Chú Ý / Cảnh Báo';
      case 'application': return 'Vận Dụng Thực Tế';
      case 'objectives': return 'Mục Tiêu Bài Học';
      case 'opening_problem': return 'Tình Huống Mở Đầu / Khởi Động';
      default: return 'Khối Nội Dung';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
              {getBlockIcon(formData.type)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base sm:text-lg">
                  Chỉnh Sửa Khối: {getBlockTypeLabel(formData.type)}
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Hỗ trợ gõ công thức Toán học LaTeX bằng cặp ký hiệu <code className="text-amber-300 font-mono">$...$</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Nút Ẩn / Hiện Đối Tượng Khối */}
            <button
              type="button"
              onClick={() => updateField('isHidden', !formData.isHidden)}
              title={formData.isHidden ? 'Khối này đang bị ẩn khỏi bài giảng - Nhấp để hiện' : 'Ẩn khối đối tượng này khỏi bài giảng / trình chiếu'}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                formData.isHidden
                  ? 'bg-amber-600 border-amber-400 text-white shadow-md shadow-amber-600/30'
                  : 'bg-slate-800/90 hover:bg-slate-750 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              {formData.isHidden ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-amber-200" />
                  <span>Đang ẩn đối tượng</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ẩn đối tượng</span>
                </>
              )}
            </button>

            {/* Tab switch */}
            <div className="flex bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setActiveTab('content')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  activeTab === 'content' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Soạn Thảo
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1 transition-colors ${
                  activeTab === 'preview' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Xem Trước</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar text-slate-200">
          {activeTab === 'content' ? (
            <div className="space-y-4">
              {/* Title Input (Common for most) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Tiêu đề khối
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Nhập tiêu đề khối..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white text-sm"
                />
              </div>

              {/* 1. LESSON TITLE SPECIFIC */}
              {formData.type === 'lesson_title' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Phụ đề / Phân môn
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle || ''}
                      onChange={(e) => updateField('subtitle', e.target.value)}
                      placeholder="VD: Chương I - Hình học 8"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Công thức tổng quát đại diện
                    </label>
                    <input
                      type="text"
                      value={formData.keyFormula || ''}
                      onChange={(e) => updateField('keyFormula', e.target.value)}
                      placeholder="VD: a^2 + b^2 = c^2"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none font-mono text-amber-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Lời giới thiệu / Tóm tắt
                    </label>
                    <textarea
                      rows={3}
                      value={formData.content || ''}
                      onChange={(e) => updateField('content', e.target.value)}
                      placeholder="Nội dung giới thiệu..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-white text-sm"
                    />
                  </div>
                </>
              )}

              {/* 2. IMAGE BLOCK SPECIFIC */}
              {formData.type === 'image' && (
                <div className="space-y-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Tải ảnh từ máy tính hoặc dán URL hình ảnh
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={formData.imageUrl || ''}
                        onChange={(e) => updateField('imageUrl', e.target.value)}
                        placeholder="https://example.com/hinh-anh.jpg hoặc data:image..."
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 outline-none text-white text-xs sm:text-sm"
                      />
                      <label className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow">
                        <Upload className="w-4 h-4" />
                        <span>Chọn Ảnh Từ Máy</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {formData.imageUrl && (
                    <div className="p-2 rounded-xl bg-black/40 border border-slate-800 flex justify-center">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="max-h-48 object-contain rounded-lg shadow"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Chú thích ảnh (Caption)
                      </label>
                      <input
                        type="text"
                        value={formData.imageCaption || ''}
                        onChange={(e) => updateField('imageCaption', e.target.value)}
                        placeholder="VD: Hình 1.2: Tam giác vuông ABC"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Độ rộng ảnh ({formData.imageWidthPercent || 50}%)
                      </label>
                      <select
                        value={formData.imageWidthPercent || 50}
                        onChange={(e) => updateField('imageWidthPercent', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                      >
                        <option value={25}>Nhỏ (25%)</option>
                        <option value={33}>Vừa - 1/3 màn hình (33%)</option>
                        <option value={50}>Chuẩn - 1/2 màn hình (50%)</option>
                        <option value={75}>Lớn (75%)</option>
                        <option value={100}>Toàn chiều rộng (100%)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. MEDIA (VIDEO / AUDIO) SPECIFIC */}
              {formData.type === 'media' && (
                <div className="space-y-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Đường dẫn Video / Âm thanh (YouTube, Drive, mp4, mp3)
                    </label>
                    <input
                      type="text"
                      value={formData.mediaUrl || ''}
                      onChange={(e) => updateField('mediaUrl', e.target.value)}
                      placeholder="VD: https://www.youtube.com/watch?v=... hoặc link mp4/mp3"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-rose-500 outline-none text-white text-xs sm:text-sm"
                    />
                  </div>

                  {formData.mediaUrl && (
                    <div className="rounded-xl overflow-hidden border border-slate-700">
                      <MediaBlockRenderer block={formData} />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Chú thích video / audio
                      </label>
                      <input
                        type="text"
                        value={formData.mediaCaption || ''}
                        onChange={(e) => updateField('mediaCaption', e.target.value)}
                        placeholder="VD: Video thí nghiệm thực tế"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Độ rộng khung chiếu ({formData.mediaWidthPercent || 75}%)
                      </label>
                      <select
                        value={formData.mediaWidthPercent || 75}
                        onChange={(e) => updateField('mediaWidthPercent', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                      >
                        <option value={50}>Nhỏ (50%)</option>
                        <option value={75}>Chuẩn (75%)</option>
                        <option value={100}>Toàn chiều rộng (100%)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. CONTENT / TAKEAWAY / NOTE (General Text & Math) */}
              {['content', 'takeaway', 'note'].includes(formData.type) && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Nội dung văn bản & công thức toán
                  </label>
                  <textarea
                    rows={6}
                    value={formData.content || ''}
                    onChange={(e) => updateField('content', e.target.value)}
                    placeholder="Nhập kiến thức, định lý, công thức LaTeX $...$"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none text-white text-sm font-sans"
                  />
                </div>
              )}

              {/* 5. EXAMPLE SPECIFIC */}
              {formData.type === 'example' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Đề bài toán minh họa
                    </label>
                    <textarea
                      rows={3}
                      value={formData.problem || ''}
                      onChange={(e) => updateField('problem', e.target.value)}
                      placeholder="Nhập đề bài toán (hỗ trợ $...$)..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 outline-none text-white text-sm"
                    />
                  </div>

                  {/* Solution steps */}
                  <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Các bước giải chi tiết:
                      </span>
                      <button
                        onClick={handleAddStep}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm Bước</span>
                      </button>
                    </div>

                    {(formData.solutionSteps || []).map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-400 shrink-0 w-6 text-right">
                          {idx + 1}.
                        </span>
                        <input
                          type="text"
                          value={step}
                          onChange={(e) => handleUpdateStep(idx, e.target.value)}
                          placeholder={`Nội dung bước ${idx + 1}...`}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 outline-none text-white text-xs sm:text-sm"
                        />
                        <button
                          onClick={() => handleRemoveStep(idx)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Đáp số / Kết luận
                    </label>
                    <input
                      type="text"
                      value={formData.finalAnswer || ''}
                      onChange={(e) => updateField('finalAnswer', e.target.value)}
                      placeholder="VD: Vậy x = 5 cm"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 outline-none text-emerald-300 font-semibold text-sm"
                    />
                  </div>
                </div>
              )}

              {/* 6. PRACTICE SPECIFIC */}
              {formData.type === 'practice' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Đề bài luyện tập
                    </label>
                    <textarea
                      rows={3}
                      value={formData.problem || ''}
                      onChange={(e) => updateField('problem', e.target.value)}
                      placeholder="Nhập đề bài luyện tập..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 outline-none text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Gợi ý phương pháp
                    </label>
                    <input
                      type="text"
                      value={formData.hint || ''}
                      onChange={(e) => updateField('hint', e.target.value)}
                      placeholder="VD: Áp dụng định lý đảo của..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 outline-none text-sky-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Lời giải chi tiết
                    </label>
                    <textarea
                      rows={4}
                      value={formData.solution || ''}
                      onChange={(e) => updateField('solution', e.target.value)}
                      placeholder="Hướng dẫn giải chi tiết..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 outline-none text-white text-sm"
                    />
                  </div>
                </div>
              )}

              {/* 7. ACTIVITY & OPENING PROBLEM SPECIFIC */}
              {(formData.type === 'activity' || formData.type === 'opening_problem') && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Tình huống / Bối cảnh thực tế
                    </label>
                    <textarea
                      rows={3}
                      value={formData.context || formData.description || ''}
                      onChange={(e) => {
                        updateField('context', e.target.value);
                        updateField('description', e.target.value);
                      }}
                      placeholder="Mô tả tình huống mở đầu hoặc nhiệm vụ khám phá..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 outline-none text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Câu hỏi đặt ra
                    </label>
                    <input
                      type="text"
                      value={formData.question || ''}
                      onChange={(e) => updateField('question', e.target.value)}
                      placeholder="VD: Hãy dự đoán độ dài cạnh AB?"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 outline-none text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Kết luận / Nhận xét rút ra
                    </label>
                    <input
                      type="text"
                      value={formData.conclusion || ''}
                      onChange={(e) => updateField('conclusion', e.target.value)}
                      placeholder="Nhận xét chốt kiến thức..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 outline-none text-white text-sm"
                    />
                  </div>
                </div>
              )}

              {/* 8. OBJECTIVES SPECIFIC */}
              {formData.type === 'objectives' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Danh sách các mục tiêu:
                    </span>
                    <button
                      onClick={handleAddObjective}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm Mục Tiêu</span>
                    </button>
                  </div>

                  {(formData.items || []).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleUpdateObjective(idx, e.target.value)}
                        placeholder={`Mục tiêu ${idx + 1}...`}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 outline-none text-white text-xs sm:text-sm"
                      />
                      <button
                        onClick={() => handleRemoveObjective(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 9. APPLICATION SPECIFIC */}
              {formData.type === 'application' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Bài toán thực tiễn
                    </label>
                    <textarea
                      rows={3}
                      value={formData.problem || ''}
                      onChange={(e) => updateField('problem', e.target.value)}
                      placeholder="Mô tả bài toán vận dụng thực tiễn..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-500 outline-none text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Hướng dẫn thực hiện / Lời giải
                    </label>
                    <textarea
                      rows={3}
                      value={formData.solution || ''}
                      onChange={(e) => updateField('solution', e.target.value)}
                      placeholder="Hướng dẫn áp dụng và kết quả..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-500 outline-none text-white text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Live Preview Tab */
            <div className="p-6 rounded-2xl bg-[#103463] text-white space-y-4 shadow-xl border border-white/10 min-h-[300px]">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300 pb-2 border-b border-white/20">
                {formData.title || getBlockTypeLabel(formData.type)}
              </div>

              {formData.subtitle && (
                <div className="text-sm text-white/80">
                  <MathView text={formData.subtitle} />
                </div>
              )}

              {formData.keyFormula && (
                <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-400/40 text-center font-mono text-amber-300">
                  <MathView text={`$$${formData.keyFormula}$$`} />
                </div>
              )}

              {formData.content && (
                <div className="text-base text-white/95 leading-relaxed">
                  <MathView text={formData.content} />
                </div>
              )}

              {formData.problem && (
                <div className="text-base text-white/95 leading-relaxed">
                  <MathView text={formData.problem} />
                </div>
              )}

              {formData.solutionSteps && formData.solutionSteps.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-white/20 text-sm">
                  <div className="font-bold text-emerald-300">Các bước giải:</div>
                  {formData.solutionSteps.map((step, idx) => (
                    <div key={idx} className="pl-3 border-l-2 border-emerald-400">
                      <MathView text={step} />
                    </div>
                  ))}
                </div>
              )}

              {formData.finalAnswer && (
                <div className="text-sm font-bold text-emerald-300 bg-emerald-950/60 p-2 rounded-xl border border-emerald-500/40">
                  Đáp số: <MathView text={formData.finalAnswer} />
                </div>
              )}

              {formData.imageUrl && (
                <div className="flex flex-col items-center justify-center my-2">
                  <img
                    src={formData.imageUrl}
                    alt=""
                    className="max-h-60 object-contain rounded-xl shadow-lg border border-white/20"
                  />
                  {formData.imageCaption && (
                    <div className="text-xs text-white/70 italic mt-1 text-center">
                      <MathView text={formData.imageCaption} />
                    </div>
                  )}
                </div>
              )}

              {formData.mediaUrl && (
                <div className="my-2">
                  <MediaBlockRenderer block={formData} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/80">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
          >
            Hủy Bỏ
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Lưu Thay Đổi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
