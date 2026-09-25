import React, { useState, useRef, useEffect } from 'react';
import {
  Move,
  Trash2,
  Copy,
  Type,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  X,
  Check,
  Maximize2,
  Edit3,
  Sparkles,
  Play,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  ZoomIn,
  Ban,
  Clock,
  ListOrdered,
  Eye,
  EyeOff
} from 'lucide-react';
import { SlideTextBox, TextBoxAnimationEffect } from '../types';
import { MathView } from './MathView';

interface SlideTextBoxOverlayProps {
  textBoxes?: SlideTextBox[];
  isEditable?: boolean;
  onUpdateTextBox?: (updatedBox: SlideTextBox) => void;
  onDeleteTextBox?: (boxId: string) => void;
  onDuplicateTextBox?: (box: SlideTextBox) => void;
  selectedBoxId?: string | null;
  onSelectBox?: (boxId: string | null) => void;
  animationPlayTrigger?: number;
  revealedAnimStep?: number;
  lastTriggeredStep?: number;
  externalManuallyRevealedBoxIds?: Set<string>;
  onToggleRevealBox?: (boxId: string) => void;
}

const COLOR_PALETTE = [
  { label: 'Trắng', value: '#ffffff' },
  { label: 'Vàng', value: '#fbbf24' },
  { label: 'Xanh trời', value: '#38bdf8' },
  { label: 'Xanh lá', value: '#34d399' },
  { label: 'Hồng', value: '#f472b6' },
  { label: 'Đỏ', value: '#f87171' },
  { label: 'Đen', value: '#0f172a' },
];

const BG_PALETTE = [
  { label: 'Trong suốt', value: 'transparent', border: 'transparent' },
  { label: 'Khung mờ tối', value: 'rgba(15, 23, 42, 0.75)', border: 'rgba(255, 255, 255, 0.2)' },
  { label: 'Khung vàng ghi nhớ', value: 'rgba(254, 240, 138, 0.95)', border: '#ca8a04', text: '#713f12' },
  { label: 'Khung xanh nổi bật', value: 'rgba(30, 58, 138, 0.9)', border: '#3b82f6', text: '#ffffff' },
  { label: 'Khung trắng', value: '#ffffff', border: '#cbd5e1', text: '#0f172a' },
];

export interface AnimationOption {
  id: TextBoxAnimationEffect;
  name: string;
  description: string;
  badge: string;
  icon: React.FC<{ className?: string }>;
  animClass: string;
}

export const ANIMATION_OPTIONS: AnimationOption[] = [
  {
    id: 'none',
    name: 'Không hiệu ứng',
    description: 'Hiển thị tĩnh mặc định',
    badge: 'Tĩnh',
    icon: Ban,
    animClass: '',
  },
  {
    id: 'slide-up',
    name: 'Dưới lên',
    description: 'Bay từ dưới lên trên',
    badge: '⬆ Dưới lên',
    icon: ArrowUp,
    animClass: 'animate-tb-slide-up',
  },
  {
    id: 'slide-down',
    name: 'Trên xuống',
    description: 'Rơi từ trên xuống dưới',
    badge: '⬇ Trên xuống',
    icon: ArrowDown,
    animClass: 'animate-tb-slide-down',
  },
  {
    id: 'slide-left',
    name: 'Trái sang',
    description: 'Trượt từ bên trái sang',
    badge: '➔ Trái sang',
    icon: ArrowRight,
    animClass: 'animate-tb-slide-left',
  },
  {
    id: 'slide-right',
    name: 'Phải sang',
    description: 'Trượt từ bên phải sang',
    badge: '⬅ Phải sang',
    icon: ArrowLeft,
    animClass: 'animate-tb-slide-right',
  },
  {
    id: 'zoom-in',
    name: 'Zoom in',
    description: 'Phóng to từ tâm ra ngoài',
    badge: '🔍 Zoom in',
    icon: ZoomIn,
    animClass: 'animate-tb-zoom-in',
  },
];

const EMPTY_TEXT_BOXES: SlideTextBox[] = [];

export const SlideTextBoxOverlay: React.FC<SlideTextBoxOverlayProps> = ({
  textBoxes = EMPTY_TEXT_BOXES,
  isEditable = true,
  onUpdateTextBox,
  onDeleteTextBox,
  onDuplicateTextBox,
  selectedBoxId,
  onSelectBox,
  animationPlayTrigger,
  revealedAnimStep,
  lastTriggeredStep,
  externalManuallyRevealedBoxIds,
  onToggleRevealBox,
}) => {
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [showBgPicker, setShowBgPicker] = useState<boolean>(false);
  const [showAnimPicker, setShowAnimPicker] = useState<boolean>(false);

  // Map animated text boxes to 1-indexed step in the animation sequence
  const animatedBoxes = [...textBoxes]
    .filter((b) => b.animation && b.animation !== 'none')
    .sort((a, b) => {
      const orderA = a.animationOrder !== undefined ? a.animationOrder : 999;
      const orderB = b.animationOrder !== undefined ? b.animationOrder : 999;
      if (orderA !== orderB) return orderA - orderB;
      return textBoxes.indexOf(a) - textBoxes.indexOf(b);
    });

  const boxStepMap = new Map<string, number>();
  animatedBoxes.forEach((b, index) => {
    boxStepMap.set(b.id, index + 1);
  });

  // Animation preview states
  const [previewingBoxId, setPreviewingBoxId] = useState<string | null>(null);
  const [previewKeyMap, setPreviewKeyMap] = useState<Record<string, number>>({});
  const [isGlobalPreviewing, setIsGlobalPreviewing] = useState<boolean>(false);
  const [manuallyRevealedBoxIds, setManuallyRevealedBoxIds] = useState<Set<string>>(new Set());

  // Stable key of text box IDs to prevent infinite re-render loops on new array references
  const textBoxIdsKey = (textBoxes || []).map((b) => b.id).join(',');

  // Reset manually revealed boxes only when text boxes set changes
  useEffect(() => {
    setManuallyRevealedBoxIds(new Set());
  }, [textBoxIdsKey]);

  // Trigger individual box animation preview (in editor mode)
  const triggerBoxPreview = (boxId: string) => {
    setPreviewKeyMap((prev) => ({ ...prev, [boxId]: (prev[boxId] || 0) + 1 }));
    setPreviewingBoxId(boxId);
    const target = textBoxes.find((b) => b.id === boxId);
    const duration = ((target?.animationDuration || 0.6) + 0.3) * 1000;
    setTimeout(() => {
      setPreviewingBoxId((curr) => (curr === boxId ? null : curr));
    }, duration);
  };

  const prevTriggerRef = useRef<number | undefined>(animationPlayTrigger);

  // Trigger global preview when parent sends animationPlayTrigger (ONLY in editor mode!)
  useEffect(() => {
    if (!isEditable) return; // In presentation mode, effects are strictly driven by keyboard arrows/enter
    if (
      animationPlayTrigger !== undefined &&
      animationPlayTrigger > 0 &&
      animationPlayTrigger !== prevTriggerRef.current
    ) {
      prevTriggerRef.current = animationPlayTrigger;
      setIsGlobalPreviewing(true);
      const newKeys: Record<string, number> = {};
      let maxTotalTime = 0;
      textBoxes.forEach((b, idx) => {
        if (b.animation && b.animation !== 'none') {
          newKeys[b.id] = (previewKeyMap[b.id] || 0) + 1;
          const delay = (b.animationDelay !== undefined ? b.animationDelay : ((b.animationOrder || idx + 1) - 1) * 0.3) * 1000;
          const dur = (b.animationDuration || 0.6) * 1000;
          if (delay + dur > maxTotalTime) maxTotalTime = delay + dur;
        }
      });
      setPreviewKeyMap((prev) => ({ ...prev, ...newKeys }));
      const timer = setTimeout(() => {
        setIsGlobalPreviewing(false);
      }, maxTotalTime + 400);
      return () => clearTimeout(timer);
    } else {
      prevTriggerRef.current = animationPlayTrigger;
    }
  }, [animationPlayTrigger, isEditable]);

  // Keep references to latest textBoxes and onUpdateTextBox
  const textBoxesRef = useRef(textBoxes);
  textBoxesRef.current = textBoxes;
  const onUpdateTextBoxRef = useRef(onUpdateTextBox);
  onUpdateTextBoxRef.current = onUpdateTextBox;

  // Dragging state
  const draggingBoxRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    containerWidth: number;
    containerHeight: number;
  } | null>(null);

  // Resizing state
  const resizingBoxRef = useRef<{
    id: string;
    startX: number;
    initialWidth: number;
    containerWidth: number;
  } | null>(null);

  // Mouse move handler for dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Dragging
      if (draggingBoxRef.current && onUpdateTextBoxRef.current) {
        const { id, startX, startY, initialX, initialY, containerWidth, containerHeight } = draggingBoxRef.current;
        const deltaXPercent = ((e.clientX - startX) / containerWidth) * 100;
        const deltaYPercent = ((e.clientY - startY) / containerHeight) * 100;

        const target = textBoxesRef.current.find((b) => b.id === id);
        if (target) {
          const newX = Math.max(0, Math.min(85, initialX + deltaXPercent));
          const newY = Math.max(0, Math.min(85, initialY + deltaYPercent));
          onUpdateTextBoxRef.current({
            ...target,
            x: Math.round(newX * 10) / 10,
            y: Math.round(newY * 10) / 10,
          });
        }
      }

      // Resizing
      if (resizingBoxRef.current && onUpdateTextBoxRef.current) {
        const { id, startX, initialWidth, containerWidth } = resizingBoxRef.current;
        const deltaWidthPercent = ((e.clientX - startX) / containerWidth) * 100;

        const target = textBoxesRef.current.find((b) => b.id === id);
        if (target) {
          const newWidth = Math.max(15, Math.min(95, initialWidth + deltaWidthPercent));
          onUpdateTextBoxRef.current({
            ...target,
            width: Math.round(newWidth),
          });
        }
      }
    };

    const handleMouseUp = () => {
      draggingBoxRef.current = null;
      resizingBoxRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!textBoxes || textBoxes.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
      {textBoxes.map((box, idx) => {
        const isSelected = isEditable && selectedBoxId === box.id;
        const isEditing = isSelected && editingTextId === box.id;

        const posX = box.x !== undefined ? box.x : 20;
        const posY = box.y !== undefined ? box.y : 30;
        const width = box.width !== undefined ? `${box.width}%` : 'auto';
        const fontSize = box.fontSize || 24;
        const color = box.color || '#ffffff';
        const bg = box.backgroundColor || 'transparent';
        const borderColor = box.borderColor || 'transparent';
        const borderWidth = box.borderWidth || 0;
        const fontWeight = box.fontWeight || 'normal';
        const fontStyle = box.fontStyle || 'normal';
        const textAlign = box.textAlign || 'left';

        // Animation calculation
        const animEffect = box.animation || 'none';
        const activeAnim = ANIMATION_OPTIONS.find((a) => a.id === animEffect);
        const boxStep = boxStepMap.get(box.id);
        const hasAnimation = animEffect !== 'none' && !!activeAnim && boxStep !== undefined;
        const isBoxPreviewing = previewingBoxId === box.id;
        const isManuallyRevealed = externalManuallyRevealedBoxIds
          ? externalManuallyRevealedBoxIds.has(box.id)
          : manuallyRevealedBoxIds.has(box.id);

        let animClass = '';
        let animDuration = box.animationDuration || 0.6;
        let animDelay = 0;
        let isVisible = true;

        if (!isEditable) {
          // IN PRESENTATION MODE:
          // Check if explicitly hidden by user
          if (box.isHidden && !isManuallyRevealed) {
            isVisible = false;
          } else if (hasAnimation && boxStep !== undefined) {
            // Strictly controlled by keyboard arrows (←, →, ↑, ↓) or Enter!
            // Cannot run freely / automatically ("không được chạy tự do")
            const currentStep = revealedAnimStep !== undefined ? revealedAnimStep : 0;
            if (boxStep > currentStep && !isManuallyRevealed) {
              // Not yet triggered by keyboard arrows/enter -> MUST BE HIDDEN
              isVisible = false;
            } else if (boxStep === lastTriggeredStep) {
              // Just triggered by keyboard arrow / enter -> play entrance animation!
              animClass = activeAnim.animClass;
              animDelay = 0; // Immediate response on keypress
            } else {
              // Already revealed in a prior step -> visible statically
              animClass = '';
            }
          }
        } else {
          // IN EDIT MODE:
          // Always visible so user can see and edit text
          if (isBoxPreviewing && activeAnim) {
            animClass = activeAnim.animClass;
            animDelay = 0; // Immediate preview
          } else if (isGlobalPreviewing && hasAnimation && activeAnim) {
            animClass = activeAnim.animClass;
            animDelay = box.animationDelay !== undefined ? box.animationDelay : ((box.animationOrder || idx + 1) - 1) * 0.3;
          }
        }

        const animKey = previewKeyMap[box.id] || 0;

        if (!isVisible) {
          if (!isEditable && box.isHidden && !isManuallyRevealed) {
            return (
              <div
                key={`hidden-box-${box.id}`}
                data-textbox-id={box.id}
                className="absolute pointer-events-auto select-none z-30 animate-in fade-in duration-150"
                style={{
                  left: `${posX}%`,
                  top: `${posY}%`,
                }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onToggleRevealBox) {
                      onToggleRevealBox(box.id);
                    } else {
                      setManuallyRevealedBoxIds((prev) => new Set(prev).add(box.id));
                    }
                  }}
                  title="Đối tượng đang bị ẩn. Nhấp để hiện"
                  className="px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-amber-600 border border-amber-500/60 text-amber-300 hover:text-white text-xs font-bold flex items-center gap-1.5 shadow-xl backdrop-blur-md cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Hiện đối tượng</span>
                </button>
              </div>
            );
          }

          return (
            <div
              key={box.id}
              data-textbox-id={box.id}
              className="absolute pointer-events-none select-none opacity-0 invisible"
              style={{
                left: `${posX}%`,
                top: `${posY}%`,
                width: width,
                visibility: 'hidden',
                opacity: 0,
              }}
              aria-hidden="true"
            />
          );
        }

        const elementKey = !isEditable
          ? `${box.id}-step-${boxStep === lastTriggeredStep ? `trig-${lastTriggeredStep}` : 'done'}`
          : `${box.id}-${animKey}-${animationPlayTrigger || 0}`;

        return (
          <div
            key={elementKey}
            data-textbox-id={box.id}
            className={`absolute pointer-events-auto select-none ${animClass} ${
              isSelected
                ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-transparent shadow-xl rounded-lg'
                : 'hover:ring-1 hover:ring-indigo-400/60 rounded-lg cursor-pointer'
            } ${isEditable && box.isHidden ? 'opacity-70 border-2 border-dashed border-amber-400/80 bg-amber-950/20' : ''}`}
            style={
              {
                left: `${posX}%`,
                top: `${posY}%`,
                width: width,
                minWidth: '140px',
                backgroundColor: bg,
                border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : undefined,
                color: color,
                textAlign: textAlign,
                '--tb-duration': `${animDuration}s`,
                '--tb-delay': `${animDelay}s`,
              } as React.CSSProperties
            }
            onClick={(e) => {
              e.stopPropagation();
              if (isEditable && onSelectBox) {
                onSelectBox(box.id);
              }
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (isEditable) {
                setEditingTextId(box.id);
              }
            }}
          >
            {/* ANIMATION BADGE (Hiển thị khi Text Box có cài hiệu ứng) */}
            {isEditable && hasAnimation && !isEditing && (
              <div
                className="absolute -top-3 left-2 z-30 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-300/40 text-white text-[10px] font-bold flex items-center gap-1 shadow-md cursor-pointer hover:scale-105 transition-transform"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectBox) onSelectBox(box.id);
                  setShowAnimPicker(true);
                  triggerBoxPreview(box.id);
                }}
                title={`Hiệu ứng: ${activeAnim?.name} (Thứ tự #${box.animationOrder || idx + 1}) - Nhấp để chỉnh hoặc xem thử`}
              >
                <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-pulse" />
                <span>#{box.animationOrder || idx + 1} {activeAnim?.name}</span>
              </div>
            )}

            {/* HIDDEN BADGE (Hiển thị khi Text Box đang bị ẩn trong chế độ soạn thảo) */}
            {isEditable && box.isHidden && !isEditing && (
              <div
                className="absolute -top-3 right-2 z-30 px-2 py-0.5 rounded-full bg-amber-600 border border-amber-300/40 text-white text-[10px] font-bold flex items-center gap-1 shadow-md cursor-pointer hover:bg-amber-500 hover:scale-105 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onUpdateTextBox) onUpdateTextBox({ ...box, isHidden: false });
                }}
                title="Đối tượng này đang bị ẩn khỏi bài giảng. Nhấp để hiện lại"
              >
                <EyeOff className="w-2.5 h-2.5 text-amber-200" />
                <span>Đang ẩn (Nhấp để hiện)</span>
              </div>
            )}

            {/* RE-HIDE BUTTON IN PRESENTATION MODE */}
            {!isEditable && box.isHidden && isManuallyRevealed && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onToggleRevealBox) {
                    onToggleRevealBox(box.id);
                  } else {
                    setManuallyRevealedBoxIds((prev) => {
                      const next = new Set(prev);
                      next.delete(box.id);
                      return next;
                    });
                  }
                }}
                title="Ẩn lại đối tượng này"
                className="absolute -top-3.5 right-1 z-30 px-2 py-0.5 rounded-full bg-slate-900/90 border border-amber-500/60 hover:bg-amber-600 text-amber-300 hover:text-white text-[10px] font-bold flex items-center gap-1 shadow-md transition-all cursor-pointer"
              >
                <EyeOff className="w-2.5 h-2.5" />
                <span>Ẩn lại</span>
              </button>
            )}

            {/* POWERPOINT FLOATING FORMATTING MINI-TOOLBAR (BÊN DƯỚI KHUNG TEXT BOX) */}
            {isSelected && isEditable && (
              <div
                className="absolute top-full mt-2 left-0 z-50 bg-slate-900/98 border border-slate-700 rounded-xl px-2 py-1 shadow-2xl flex items-center gap-1 text-white text-xs select-none backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drag Handle */}
                <div
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const container = e.currentTarget.closest('.aspect-video') || e.currentTarget.offsetParent;
                    if (!container) return;
                    const rect = container.getBoundingClientRect();
                    draggingBoxRef.current = {
                      id: box.id,
                      startX: e.clientX,
                      startY: e.clientY,
                      initialX: posX,
                      initialY: posY,
                      containerWidth: rect.width,
                      containerHeight: rect.height,
                    };
                  }}
                  title="Giữ chuột và kéo để di chuyển vị trí Text Box"
                  className="p-1 text-slate-400 hover:text-white cursor-grab active:cursor-grabbing rounded hover:bg-slate-800 flex items-center gap-1"
                >
                  <Move className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] font-bold hidden sm:inline">Kéo</span>
                </div>

                <div className="w-px h-4 bg-slate-700" />

                {/* Font Size Adjusters */}
                <button
                  type="button"
                  onClick={() => onUpdateTextBox && onUpdateTextBox({ ...box, fontSize: Math.max(14, fontSize - 2) })}
                  title="Giảm cỡ chữ"
                  className="px-1.5 py-0.5 rounded text-[11px] font-bold hover:bg-slate-800 text-slate-300 hover:text-white"
                >
                  A-
                </button>
                <span className="text-[11px] font-mono font-bold text-indigo-300 px-1">
                  {fontSize}pt
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateTextBox && onUpdateTextBox({ ...box, fontSize: Math.min(64, fontSize + 2) })}
                  title="Tăng cỡ chữ"
                  className="px-1.5 py-0.5 rounded text-[11px] font-bold hover:bg-slate-800 text-slate-300 hover:text-white"
                >
                  A+
                </button>

                <div className="w-px h-4 bg-slate-700" />

                {/* Bold toggle */}
                <button
                  type="button"
                  onClick={() =>
                    onUpdateTextBox &&
                    onUpdateTextBox({ ...box, fontWeight: fontWeight === 'bold' ? 'normal' : 'bold' })
                  }
                  title="In đậm (Bold)"
                  className={`p-1 rounded ${fontWeight === 'bold' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>

                {/* Italic toggle */}
                <button
                  type="button"
                  onClick={() =>
                    onUpdateTextBox &&
                    onUpdateTextBox({ ...box, fontStyle: fontStyle === 'italic' ? 'normal' : 'italic' })
                  }
                  title="In nghiêng (Italic)"
                  className={`p-1 rounded ${fontStyle === 'italic' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>

                {/* Alignment */}
                <button
                  type="button"
                  onClick={() => {
                    const nextAlign: Record<'left' | 'center' | 'right', 'left' | 'center' | 'right'> = {
                      left: 'center',
                      center: 'right',
                      right: 'left',
                    };
                    if (onUpdateTextBox) {
                      onUpdateTextBox({ ...box, textAlign: nextAlign[textAlign] });
                    }
                  }}
                  title={`Căn lề: ${textAlign}`}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  {textAlign === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                  {textAlign === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                  {textAlign === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                </button>

                <div className="w-px h-4 bg-slate-700" />

                {/* Sửa chữ button */}
                <button
                  type="button"
                  onClick={() => setEditingTextId(editingTextId === box.id ? null : box.id)}
                  title="Nhập / Sửa nội dung văn bản & công thức toán"
                  className={`px-1.5 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 transition-colors ${
                    editingTextId === box.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-indigo-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Sửa chữ</span>
                </button>

                {/* Text Color Picker Toggle */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowColorPicker(!showColorPicker);
                      setShowBgPicker(false);
                      setShowAnimPicker(false);
                    }}
                    title="Màu chữ"
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 flex items-center gap-0.5"
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span className="w-2.5 h-2.5 rounded-full border border-white/40" style={{ backgroundColor: color }} />
                  </button>

                  {showColorPicker && (
                    <div className="absolute left-0 bottom-full mb-1.5 bg-slate-950 border border-slate-700 p-2 rounded-xl shadow-2xl flex gap-1 z-50">
                      {COLOR_PALETTE.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => {
                            if (onUpdateTextBox) onUpdateTextBox({ ...box, color: c.value });
                            setShowColorPicker(false);
                          }}
                          title={c.label}
                          className="w-5 h-5 rounded-full border border-white/30 hover:scale-110 transition-transform shadow-xs"
                          style={{ backgroundColor: c.value }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Background & Border Style Picker Toggle */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBgPicker(!showBgPicker);
                      setShowColorPicker(false);
                      setShowAnimPicker(false);
                    }}
                    title="Nền & Viền hộp"
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700"
                  >
                    Nền
                  </button>

                  {showBgPicker && (
                    <div className="absolute left-0 bottom-full mb-1.5 bg-slate-950 border border-slate-700 p-2 rounded-xl shadow-2xl flex flex-col gap-1 z-50 w-44">
                      {BG_PALETTE.map((bgItem) => (
                        <button
                          key={bgItem.label}
                          type="button"
                          onClick={() => {
                            if (onUpdateTextBox) {
                              onUpdateTextBox({
                                ...box,
                                backgroundColor: bgItem.value,
                                borderColor: bgItem.border,
                                borderWidth: bgItem.border !== 'transparent' ? 1.5 : 0,
                                color: bgItem.text || box.color,
                              });
                            }
                            setShowBgPicker(false);
                          }}
                          className="px-2 py-1 rounded text-left text-xs text-white hover:bg-slate-800 flex items-center justify-between"
                        >
                          <span>{bgItem.label}</span>
                          <span
                            className="w-4 h-4 rounded border border-white/30"
                            style={{ backgroundColor: bgItem.value === 'transparent' ? '#334155' : bgItem.value }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="w-px h-4 bg-slate-700" />

                {/* HIỆU ỨNG CHẠY TEXT BOX (5 HIỆU ỨNG CƠ BẢN) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAnimPicker(!showAnimPicker);
                      setShowColorPicker(false);
                      setShowBgPicker(false);
                    }}
                    title="Cài đặt hiệu ứng chạy Text Box (Dưới lên, Trên xuống, Trái sang, Phải sang, Zoom in)"
                    className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                      hasAnimation
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40 ring-1 ring-purple-400'
                        : 'text-purple-300 hover:text-white hover:bg-purple-950/50'
                    }`}
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${hasAnimation ? 'text-amber-300' : 'text-purple-400'}`} />
                    <span>Hiệu ứng</span>
                    {hasAnimation && (
                      <span className="text-[10px] px-1 py-0.2 rounded bg-purple-900/90 text-purple-200 border border-purple-400/40 font-mono">
                        {activeAnim?.badge || 'Bật'}
                      </span>
                    )}
                  </button>

                  {/* ANIMATION SELECTION DROPDOWN */}
                  {showAnimPicker && (
                    <div
                      className="absolute left-0 bottom-full mb-2 bg-slate-950/98 border border-purple-500/50 p-3 rounded-2xl shadow-2xl flex flex-col gap-2.5 z-50 w-72 text-white backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Dropdown Header */}
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>5 Hiệu Ứng Cơ Bản</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAnimPicker(false)}
                          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* 5 Effects List */}
                      <div className="space-y-1">
                        {ANIMATION_OPTIONS.map((opt) => {
                          const Icon = opt.icon;
                          const isCurrent = (box.animation || 'none') === opt.id;

                          return (
                            <div
                              key={opt.id}
                              onClick={() => {
                                if (onUpdateTextBox) {
                                  onUpdateTextBox({
                                    ...box,
                                    animation: opt.id,
                                    animationOrder: box.animationOrder || idx + 1,
                                    animationDuration: box.animationDuration || 0.6,
                                  });
                                }
                                if (opt.id !== 'none') {
                                  triggerBoxPreview(box.id);
                                }
                              }}
                              className={`group p-1.5 px-2 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-all ${
                                isCurrent
                                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30 ring-1 ring-purple-400'
                                  : 'hover:bg-slate-900 text-slate-200 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                                    isCurrent ? 'bg-purple-800 text-white' : 'bg-slate-900 text-purple-400 group-hover:bg-slate-800'
                                  }`}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="leading-tight">{opt.name}</span>
                                  <span
                                    className={`text-[10px] leading-tight ${
                                      isCurrent ? 'text-purple-200' : 'text-slate-400'
                                    }`}
                                  >
                                    {opt.description}
                                  </span>
                                </div>
                              </div>

                              {isCurrent && (
                                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Settings: Duration & Order if animation enabled */}
                      {hasAnimation && (
                        <div className="pt-2 border-t border-slate-800 space-y-2 text-[11px]">
                          {/* Duration presets */}
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-indigo-400" />
                              <span>Tốc độ chạy:</span>
                            </span>
                            <div className="flex items-center gap-1">
                              {[
                                { label: '0.3s', val: 0.3 },
                                { label: '0.6s', val: 0.6 },
                                { label: '1.0s', val: 1.0 },
                              ].map((d) => (
                                <button
                                  key={d.val}
                                  type="button"
                                  onClick={() => {
                                    if (onUpdateTextBox) {
                                      onUpdateTextBox({ ...box, animationDuration: d.val });
                                      triggerBoxPreview(box.id);
                                    }
                                  }}
                                  className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] transition-all ${
                                    (box.animationDuration || 0.6) === d.val
                                      ? 'bg-purple-600 text-white'
                                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                                  }`}
                                >
                                  {d.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Animation Order */}
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 flex items-center gap-1">
                              <ListOrdered className="w-3 h-3 text-indigo-400" />
                              <span>Thứ tự xuất hiện:</span>
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  if (onUpdateTextBox) {
                                    const currOrder = box.animationOrder || idx + 1;
                                    onUpdateTextBox({ ...box, animationOrder: Math.max(1, currOrder - 1) });
                                  }
                                }}
                                className="w-5 h-5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 flex items-center justify-center font-bold"
                              >
                                -
                              </button>
                              <span className="w-6 text-center font-mono font-bold text-amber-300">
                                #{box.animationOrder || idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (onUpdateTextBox) {
                                    const currOrder = box.animationOrder || idx + 1;
                                    onUpdateTextBox({ ...box, animationOrder: Math.min(20, currOrder + 1) });
                                  }
                                }}
                                className="w-5 h-5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Play Preview Button */}
                      {hasAnimation && (
                        <button
                          type="button"
                          onClick={() => triggerBoxPreview(box.id)}
                          className="w-full py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 active:scale-98 transition-all cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current text-white" />
                          <span>Chạy thử hiệu ứng</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="w-px h-4 bg-slate-700" />

                {/* ẨN / HIỆN ĐỐI TƯỢNG */}
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateTextBox) {
                      onUpdateTextBox({ ...box, isHidden: !box.isHidden });
                    }
                  }}
                  title={box.isHidden ? 'Đối tượng đang ẩn - Nhấp để hiện lại' : 'Ẩn đối tượng này (khỏi bài giảng / trình chiếu)'}
                  className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    box.isHidden
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-1 ring-amber-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {box.isHidden ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-amber-200" />
                      <span>Hiện</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-slate-300" />
                      <span>Ẩn</span>
                    </>
                  )}
                </button>

                <div className="w-px h-4 bg-slate-700" />

                {/* Duplicate */}
                <button
                  type="button"
                  onClick={() => onDuplicateTextBox && onDuplicateTextBox(box)}
                  title="Nhân bản hộp văn bản này"
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => onDeleteTextBox && onDeleteTextBox(box.id)}
                  title="Xóa Text Box này"
                  className="p-1 rounded text-rose-400 hover:text-rose-200 hover:bg-rose-950/60"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Close/Deselect */}
                <button
                  type="button"
                  onClick={() => onSelectBox && onSelectBox(null)}
                  title="Xong (Deselect)"
                  className="p-1 rounded text-emerald-400 hover:text-white hover:bg-emerald-950/60"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* TEXT BOX CONTENT AREA */}
            <div className="p-2 relative min-h-[36px]">
              {isEditing ? (
                <div className="space-y-2 bg-slate-950/95 p-2.5 rounded-xl border border-indigo-500/60 shadow-2xl backdrop-blur-md">
                  {/* Textarea input */}
                  <textarea
                    autoFocus
                    value={box.text || ''}
                    onChange={(e) => {
                      if (onUpdateTextBox) {
                        onUpdateTextBox({ ...box, text: e.target.value });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setEditingTextId(null);
                      }
                    }}
                    rows={Math.max(2, (box.text || '').split('\n').length)}
                    placeholder="Nhập nội dung văn bản..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none resize-y leading-relaxed font-sans shadow-inner focus:border-indigo-400 min-h-[50px] text-xs sm:text-sm"
                    style={{
                      color: color,
                    }}
                  />

                  {/* Clean save button */}
                  <div className="flex items-center justify-end pt-0.5">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingTextId(null);
                      }}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Xong</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* RENDERED SLIDE DISPLAY */
                <div
                  className="leading-relaxed cursor-text min-h-[32px] p-1.5 transition-colors rounded hover:bg-white/5"
                  onClick={(e) => {
                    if (isEditable) {
                      e.stopPropagation();
                      if (onSelectBox) onSelectBox(box.id);
                      setEditingTextId(box.id);
                    }
                  }}
                  style={{
                    fontSize: `${fontSize}px`,
                    fontWeight: fontWeight,
                    fontStyle: fontStyle,
                    color: color,
                    textAlign: textAlign,
                  }}
                >
                  {box.text && box.text.trim().length > 0 ? (
                    <MathView content={box.text} text={box.text} />
                  ) : (
                    <span className="opacity-60 italic text-amber-200/90 text-sm block">
                      Nhấp vào đây để nhập văn bản hoặc công thức toán...
                    </span>
                  )}
                </div>
              )}

              {/* Resize Handle (Bottom-Right corner) */}
              {isSelected && isEditable && (
                <div
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const container = e.currentTarget.closest('.aspect-video') || e.currentTarget.offsetParent;
                    if (!container) return;
                    const rect = container.getBoundingClientRect();
                    resizingBoxRef.current = {
                      id: box.id,
                      startX: e.clientX,
                      initialWidth: box.width || 35,
                      containerWidth: rect.width,
                    };
                  }}
                  title="Kéo để chỉnh chiều rộng Text Box"
                  className="absolute bottom-0 right-0 w-3 h-3 bg-indigo-500 border border-white rounded-xs cursor-ew-resize hover:scale-125 transition-transform"
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

