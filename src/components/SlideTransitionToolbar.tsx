import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Check,
  Zap,
  Timer,
  Globe2,
  X,
  Layers,
  ChevronRight,
  Eye,
  Sliders,
  Film,
  Clock,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Type,
  Image as ImageIcon,
  Bookmark,
  Lightbulb,
  Dumbbell,
  Target,
  Compass,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import {
  SlideTransitionEffect,
  ElementAnimationEffect,
  BlockAnimationEffect,
  SlideStyleConfig,
  Slide,
  SlideContentBlock
} from '../types';
import {
  TRANSITION_PRESETS,
  ELEMENT_ANIMATION_PRESETS,
  BLOCK_ANIMATION_PRESETS,
  SPEED_PRESETS,
  AUTOPLAY_PRESETS
} from '../utils/slideTransitions';
import { getSlideBlocks, BLOCK_TYPES_META } from '../utils/slideBlocks';

interface SlideTransitionToolbarProps {
  currentSlide: Slide;
  slideIndex: number;
  totalSlides: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStyle: (updates: Partial<SlideStyleConfig>) => void;
  onApplyToAllSlides?: (updates: Partial<SlideStyleConfig>) => void;
  onPreviewTransition: () => void;
  isAutoPlaying: boolean;
  autoPlayInterval: number; // in seconds, 0 = off
  onToggleAutoPlay: (seconds: number) => void;
  onUpdateSlide?: (updatedSlide: Slide) => void;
}

export const SlideTransitionToolbar: React.FC<SlideTransitionToolbarProps> = ({
  currentSlide,
  slideIndex,
  totalSlides,
  isOpen,
  onClose,
  onUpdateStyle,
  onApplyToAllSlides,
  onPreviewTransition,
  isAutoPlaying,
  autoPlayInterval,
  onToggleAutoPlay,
  onUpdateSlide,
}) => {
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [activeTab, setActiveTab] = useState<'transition' | 'elements' | 'autoplay'>('elements');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentEffect: SlideTransitionEffect =
    currentSlide.styleConfig?.transitionEffect || 'slide_horizontal';
  const currentDuration = currentSlide.styleConfig?.transitionDuration || 0.45;
  const currentElementAnimation: ElementAnimationEffect =
    currentSlide.styleConfig?.elementAnimation || 'stagger';

  const blocks = getSlideBlocks(currentSlide);
  const activeBlock = blocks.find((b) => b.id === selectedBlockId) || blocks[0] || null;

  const handleSelectEffect = (effect: SlideTransitionEffect) => {
    onUpdateStyle({ transitionEffect: effect });
    setTimeout(() => {
      onPreviewTransition();
    }, 50);
  };

  const handleSelectDuration = (duration: number) => {
    onUpdateStyle({ transitionDuration: duration });
    setTimeout(() => {
      onPreviewTransition();
    }, 50);
  };

  const handleSelectElementAnimation = (anim: ElementAnimationEffect) => {
    onUpdateStyle({ elementAnimation: anim });
    setTimeout(() => {
      onPreviewTransition();
    }, 50);
  };

  const handleApplyAll = () => {
    if (onApplyToAllSlides) {
      onApplyToAllSlides({
        transitionEffect: currentEffect,
        transitionDuration: currentDuration,
        elementAnimation: currentElementAnimation,
      });
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
  };

  // Update specific block animation
  const handleUpdateBlockAnimation = (
    blockId: string,
    animation: BlockAnimationEffect,
    delay?: number,
    duration?: number
  ) => {
    if (!onUpdateSlide) return;
    const updatedBlocks = blocks.map((b) => {
      if (b.id === blockId) {
        return {
          ...b,
          animation,
          ...(typeof delay === 'number' ? { animationDelay: delay } : {}),
          ...(typeof duration === 'number' ? { animationDuration: duration } : {}),
        };
      }
      return b;
    });

    onUpdateSlide({
      ...currentSlide,
      blocks: updatedBlocks,
    });

    setTimeout(() => {
      onPreviewTransition();
    }, 50);
  };

  // Auto Stagger all blocks (0s, 0.25s, 0.5s, 0.75s...)
  const handleAutoStaggerAll = () => {
    if (!onUpdateSlide) return;
    const updatedBlocks = blocks.map((b, idx) => ({
      ...b,
      animationDelay: Number((idx * 0.25).toFixed(2)),
    }));
    onUpdateSlide({
      ...currentSlide,
      blocks: updatedBlocks,
    });
    setTimeout(() => {
      onPreviewTransition();
    }, 50);
  };

  // Reset all blocks on slide to inherit
  const handleResetAllBlocksToInherit = () => {
    if (!onUpdateSlide) return;
    const updatedBlocks = blocks.map((b) => ({
      ...b,
      animation: 'inherit' as BlockAnimationEffect,
      animationDelay: undefined,
      animationDuration: undefined,
    }));
    onUpdateSlide({
      ...currentSlide,
      blocks: updatedBlocks,
    });
    setTimeout(() => {
      onPreviewTransition();
    }, 50);
  };

  // Bulk set all blocks on slide to a specific animation
  const handleSetAllBlocksAnimation = (anim: BlockAnimationEffect) => {
    if (!onUpdateSlide) return;
    const updatedBlocks = blocks.map((b, idx) => ({
      ...b,
      animation: anim,
      animationDelay: Number((idx * 0.2).toFixed(2)),
    }));
    onUpdateSlide({
      ...currentSlide,
      blocks: updatedBlocks,
    });
    setTimeout(() => {
      onPreviewTransition();
    }, 50);
  };

  return (
    <div className="mb-4 bg-slate-900/95 border-2 border-indigo-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 text-slate-100 relative">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-pink-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <span>Hiệu Ứng Hoạt Họa PowerPoint (Animations & Transitions)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Slide {slideIndex + 1}/{totalSlides} • {blocks.length} khối
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Tùy chỉnh hiệu ứng chuyển slide hoặc áp dụng hoạt họa riêng biệt cho từng khối (Tiêu đề, Ảnh, Ghi nhớ, Ví dụ...)
            </p>
          </div>
        </div>

        {/* Action Controls Group */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Preview Button */}
          <button
            onClick={onPreviewTransition}
            title="Chạy lại hiệu ứng ngay trên màn hình để kiểm tra"
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>Xem Thử Hiệu Ứng</span>
          </button>

          {/* Apply to All Slides */}
          {onApplyToAllSlides && (
            <button
              onClick={handleApplyAll}
              title="Áp dụng kiểu chuyển trang này cho toàn bộ các slide trong bài giảng"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow"
            >
              {copiedNotification ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Đã Áp Dụng Toàn Bộ!</span>
                </>
              ) : (
                <>
                  <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Áp Dụng Cho Tất Cả Slide</span>
                </>
              )}
            </button>
          )}

          {/* Close Panel Button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 pt-3 border-b border-slate-800/80 pb-3 text-xs font-bold flex-wrap">
        <button
          onClick={() => setActiveTab('elements')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
            activeTab === 'elements'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
              : 'bg-slate-800/80 text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>1. Hoạt Họa Từng Khối Nội Dung (Block Animations)</span>
          <span className="px-1.5 py-0.2 rounded-full bg-pink-950 text-pink-200 text-[10px]">
            {blocks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('transition')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
            activeTab === 'transition'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-800/80 text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>2. Chuyển Trang Slide ({TRANSITION_PRESETS.find(p => p.id === currentEffect)?.shortLabel})</span>
        </button>

        <button
          onClick={() => setActiveTab('autoplay')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
            activeTab === 'autoplay'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'bg-slate-800/80 text-slate-400 hover:text-white'
          }`}
        >
          <Timer className="w-3.5 h-3.5" />
          <span>3. Tự Động Chiếu {isAutoPlaying ? `(${autoPlayInterval}s)` : ''}</span>
        </button>
      </div>

      {/* Tab 1: Individual Block Animations */}
      {activeTab === 'elements' && (
        <div className="pt-4 space-y-5">
          {blocks.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
              <Sparkles className="w-8 h-8 text-slate-500 mx-auto animate-pulse" />
              <p className="text-sm text-slate-300 font-bold">Slide này chưa có khối nội dung nào</p>
              <p className="text-xs text-slate-500">Hãy thêm các khối như Tiêu đề, Chèn ảnh, Ghi nhớ, Ví dụ để tùy chỉnh hiệu ứng xuất hiện.</p>
            </div>
          ) : (
            <>
              {/* Block Timeline / Selector Bar */}
              <div>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-pink-300 flex items-center gap-1.5">
                    <span>Bước 1: Chọn Khối Trên Slide Cần Đặt Hiệu Ứng</span>
                  </label>

                  {/* Bulk Quick Actions */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={handleAutoStaggerAll}
                      title="Tự động chia độ trễ lần lượt 0s, 0.25s, 0.5s, 0.75s... cho các khối"
                      className="px-2.5 py-1 rounded-lg bg-pink-950/60 hover:bg-pink-600 text-pink-300 hover:text-white border border-pink-500/30 text-[11px] font-bold flex items-center gap-1 transition-all"
                    >
                      <Clock className="w-3 h-3" />
                      <span>Tự Động Nối Tiếp (Stagger 0.25s)</span>
                    </button>

                    <button
                      onClick={() => handleSetAllBlocksAnimation('fade_up')}
                      title="Đặt tất cả các khối trên slide thành hiệu ứng Trượt Lên"
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-bold flex items-center gap-1 transition-all"
                    >
                      <ArrowUp className="w-3 h-3 text-emerald-400" />
                      <span>Đồng Bộ Trượt Lên</span>
                    </button>

                    <button
                      onClick={handleResetAllBlocksToInherit}
                      title="Khôi phục tất cả khối về Kế Thừa Mặc Định"
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-[11px] font-bold flex items-center gap-1 transition-all"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Đặt Lại</span>
                    </button>
                  </div>
                </div>

                {/* Horizontal Block Badges List */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {blocks.map((block, idx) => {
                    const isCurrent = activeBlock?.id === block.id;
                    const meta = BLOCK_TYPES_META[block.type] || {
                      label: block.type.toUpperCase(),
                      badgeBg: 'bg-slate-800',
                      badgeText: 'text-slate-300',
                    };
                    const animPreset = BLOCK_ANIMATION_PRESETS.find(
                      (p) => p.id === (block.animation || 'inherit')
                    );
                    const delayText =
                      typeof block.animationDelay === 'number'
                        ? `+${block.animationDelay}s`
                        : `${idx * 0.12}s`;

                    return (
                      <button
                        key={block.id || idx}
                        onClick={() => setSelectedBlockId(block.id)}
                        className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                          isCurrent
                            ? 'bg-pink-950/80 border-pink-400 ring-2 ring-pink-500 text-white shadow-lg'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                            #{idx + 1}
                          </span>
                          <span className="text-[10px] font-mono text-pink-300 font-bold">
                            {delayText}
                          </span>
                        </div>

                        <div className="text-xs font-extrabold truncate text-white">
                          {block.title || meta.label}
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-pink-200 mt-1 font-semibold">
                          <span>{animPreset?.icon || '✨'}</span>
                          <span className="truncate">{animPreset?.shortLabel || 'Kế Thừa'}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Block Customizer Area */}
              {activeBlock && (
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/90 border-2 border-pink-500/40 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-pink-600/30 border border-pink-500/50 flex items-center justify-center text-pink-300 font-black text-xs">
                        #{blocks.findIndex((b) => b.id === activeBlock.id) + 1}
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase text-pink-300">
                          Khối Đang Chọn:
                        </span>
                        <h4 className="text-sm font-extrabold text-white">
                          {activeBlock.title || BLOCK_TYPES_META[activeBlock.type]?.label || 'Khối nội dung'}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Hiệu ứng hiện tại:</span>
                      <span className="px-2.5 py-1 rounded-xl bg-pink-900/60 border border-pink-400 text-pink-200 text-xs font-bold flex items-center gap-1.5">
                        <span>{BLOCK_ANIMATION_PRESETS.find((p) => p.id === (activeBlock.animation || 'inherit'))?.icon}</span>
                        <span>{BLOCK_ANIMATION_PRESETS.find((p) => p.id === (activeBlock.animation || 'inherit'))?.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Step 2: Choose Animation for this block */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                      Bước 2: Chọn Kiểu Hoạt Họa PowerPoint Cho Khối Này (14 Kiểu Hoạt Họa)
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                      {BLOCK_ANIMATION_PRESETS.map((preset) => {
                        const isSelected = (activeBlock.animation || 'inherit') === preset.id;
                        return (
                          <button
                            key={preset.id}
                            onClick={() =>
                              handleUpdateBlockAnimation(
                                activeBlock.id,
                                preset.id,
                                activeBlock.animationDelay,
                                activeBlock.animationDuration
                              )
                            }
                            className={`p-2.5 rounded-2xl border text-left transition-all relative group ${
                              isSelected
                                ? 'bg-pink-600 border-pink-400 text-white shadow-lg ring-2 ring-pink-400 font-bold'
                                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-pink-500/50 hover:bg-slate-800'
                            }`}
                          >
                            <div className="text-lg mb-0.5">{preset.icon}</div>
                            <div className="text-xs font-bold leading-tight">{preset.shortLabel}</div>
                            <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 group-hover:text-pink-200">
                              {preset.description}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 3: Appearance Delay & Duration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                    {/* Appearance Delay */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-pink-400" />
                        <span>Độ Trễ Xuất Hiện (Xuất hiện sau bao nhiêu giây):</span>
                      </label>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.5, 2.0].map((sec) => {
                          const currentDelay = activeBlock.animationDelay ?? 0;
                          const isSelected = Math.abs(currentDelay - sec) < 0.05;
                          return (
                            <button
                              key={sec}
                              onClick={() =>
                                handleUpdateBlockAnimation(
                                  activeBlock.id,
                                  activeBlock.animation || 'inherit',
                                  sec,
                                  activeBlock.animationDuration
                                )
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                isSelected
                                  ? 'bg-pink-600 text-white shadow'
                                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                              }`}
                            >
                              {sec}s
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Animation Duration */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Thời Lượng Hoạt Họa (Tốc độ chuyển động):</span>
                      </label>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                          { val: 0.25, label: 'Nhanh (0.25s)' },
                          { val: 0.42, label: 'Chuẩn (0.42s)' },
                          { val: 0.75, label: 'Chậm & Mượt (0.75s)' },
                        ].map((dur) => {
                          const currentDur = activeBlock.animationDuration ?? 0.42;
                          const isSelected = Math.abs(currentDur - dur.val) < 0.05;
                          return (
                            <button
                              key={dur.val}
                              onClick={() =>
                                handleUpdateBlockAnimation(
                                  activeBlock.id,
                                  activeBlock.animation || 'inherit',
                                  activeBlock.animationDelay,
                                  dur.val
                                )
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                isSelected
                                  ? 'bg-indigo-600 text-white shadow'
                                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                              }`}
                            >
                              {dur.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Slide Default Fallback Note */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Kiểu Hoạt Họa Chung Của Toàn Bộ Slide (Áp dụng cho các khối kế thừa):
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {ELEMENT_ANIMATION_PRESETS.map((preset) => {
                const isSelected = currentElementAnimation === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectElementAnimation(preset.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-950 border-indigo-400 text-white shadow ring-1 ring-indigo-400'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{preset.icon}</span>
                      <span className="text-xs font-bold">{preset.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Slide Transitions */}
      {activeTab === 'transition' && (
        <div className="pt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <span>Chọn Kiểu Chuyển Trang Slide (Transitions)</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Click vào kiểu bất kỳ để xem thử ngay lập tức
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {TRANSITION_PRESETS.map((preset) => {
                const isSelected = currentEffect === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectEffect(preset.id)}
                    className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                      isSelected
                        ? 'bg-indigo-950/80 border-indigo-400 text-white shadow-lg ring-2 ring-indigo-500/80'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl sm:text-2xl mb-1">{preset.icon}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {preset.label}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-snug">
                      {preset.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Speed settings */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">Tốc Độ Chuyển Cảnh:</span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {SPEED_PRESETS.map((spd) => (
                  <button
                    key={spd.value}
                    onClick={() => handleSelectDuration(spd.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      Math.abs(currentDuration - spd.value) < 0.05
                        ? 'bg-indigo-600 text-white shadow font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-400">
              💡 <span className="font-semibold text-slate-300">Phím tắt trình chiếu:</span> Dùng phím <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200">Space</kbd> hoặc <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200">→</kbd> để chuyển trang.
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Autoplay & Slideshow */}
      {activeTab === 'autoplay' && (
        <div className="pt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <span>Tự Động Trình Chiếu (Slideshow Auto-Play)</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Tự động chuyển tiếp slide sau một khoảng thời gian thiết lập
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {AUTOPLAY_PRESETS.map((preset) => {
                const isSelected = autoPlayInterval === preset.value;
                return (
                  <button
                    key={preset.value}
                    onClick={() => onToggleAutoPlay(preset.value)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-emerald-950/80 border-emerald-400 text-white shadow-lg ring-2 ring-emerald-500'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold">{preset.label}</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {preset.value === 0 ? 'Điều khiển thủ công' : `Đếm ngược ${preset.value}s`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggleAutoPlay(autoPlayInterval > 0 ? 0 : 10)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow ${
                  isAutoPlaying
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isAutoPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Tạm Dừng Trình Chiếu Tự Động</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Bắt Đầu Trình Chiếu Tự Động (10s)</span>
                  </>
                )}
              </button>

              <span className="text-xs text-slate-400">
                {isAutoPlaying
                  ? `Đang tự động chuyển trang mỗi ${autoPlayInterval} giây...`
                  : 'Trạng thái: Đang dừng'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

