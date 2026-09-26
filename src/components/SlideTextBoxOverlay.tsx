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
  AlignJustify,
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
  const onSelectBoxRef = useRef(onSelectBox);
  onSelectBoxRef.current = onSelectBox;

  // Root overlay container reference (100% width & height of the slide canvas)
  const overlayRef = useRef<HTMLDivElement>(null);

  // Live local overrides during drag/resize for 60fps+ zero-latency movement without network/SSE jitter
  const [liveOverrides, setLiveOverrides] = useState<
    Record<string, { x?: number; y?: number; width?: number; height?: number }>
  >({});
  const [activeInteractionId, setActiveInteractionId] = useState<string | null>(null);
  const liveOverridesRef = useRef<
    Record<string, { x?: number; y?: number; width?: number; height?: number }>
  >({});

  // Clear editingTextId if another box is selected or deselected
  useEffect(() => {
    if (editingTextId && selectedBoxId !== editingTextId) {
      setEditingTextId(null);
    }
  }, [selectedBoxId, editingTextId]);

  // Dragging state
  const draggingBoxRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    containerWidth: number;
    containerHeight: number;
    maxX: number;
    maxY: number;
    hasMoved: boolean;
    wasAlreadySelected: boolean;
    openEditOnClick: boolean;
  } | null>(null);

  // Resizing state (supports all 8 directions: n, s, e, w, ne, nw, se, sw)
  type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
  const resizingBoxRef = useRef<{
    id: string;
    direction: ResizeDirection;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialWidth: number;
    initialHeight: number;
    containerWidth: number;
    containerHeight: number;
    affectsVertical: boolean;
    hasMoved: boolean;
  } | null>(null);

  // Helper to start resizing a text box in any of the 8 directions
  const startResizingBox = (
    e: React.MouseEvent,
    box: SlideTextBox,
    direction: ResizeDirection,
    currentX: number,
    currentY: number,
    currentWidth?: number,
    currentHeight?: number
  ) => {
    if (!isEditable || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const overlayEl = overlayRef.current;
    if (!overlayEl) return;
    const rect = overlayEl.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const boxEl = overlayEl.querySelector(`[data-textbox-id="${box.id}"]`) as HTMLElement | null;
    const boxRect = boxEl ? boxEl.getBoundingClientRect() : null;

    const measuredWidth =
      currentWidth !== undefined
        ? currentWidth
        : boxRect
        ? (boxRect.width / rect.width) * 100
        : 35;
    const measuredHeight =
      currentHeight !== undefined
        ? currentHeight
        : boxRect
        ? (boxRect.height / rect.height) * 100
        : 14;

    if (onSelectBoxRef.current && selectedBoxId !== box.id) {
      onSelectBoxRef.current(box.id);
    }

    setActiveInteractionId(box.id);
    resizingBoxRef.current = {
      id: box.id,
      direction,
      startX: e.clientX,
      startY: e.clientY,
      initialX: currentX,
      initialY: currentY,
      initialWidth: Math.max(8, measuredWidth),
      initialHeight: Math.max(6, measuredHeight),
      containerWidth: rect.width,
      containerHeight: rect.height,
      affectsVertical: direction.includes('n') || direction.includes('s'),
      hasMoved: false,
    };
  };

  // Helper to start dragging a text box accurately relative to the slide overlay container
  const startDraggingBox = (
    e: React.MouseEvent,
    box: SlideTextBox,
    currentX: number,
    currentY: number,
    options?: { openEditOnClick?: boolean; immediateDrag?: boolean }
  ) => {
    if (!isEditable || e.button !== 0) return;
    const overlayEl = overlayRef.current;
    if (!overlayEl) return;
    const rect = overlayEl.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    // Measure actual box size relative to slide so clamping never jumps
    const boxEl = (e.currentTarget as HTMLElement).closest('[data-textbox-id]') as HTMLElement | null;
    const boxRect = boxEl ? boxEl.getBoundingClientRect() : null;
    const boxWidthPercent = boxRect ? (boxRect.width / rect.width) * 100 : (box.width || 35);
    const boxHeightPercent = boxRect ? (boxRect.height / rect.height) * 100 : 12;

    const maxX = Math.max(currentX, Math.min(96, Math.max(10, 100 - boxWidthPercent * 0.6)));
    const maxY = Math.max(currentY, Math.min(94, Math.max(10, 100 - boxHeightPercent * 0.7)));

    const wasAlreadySelected = selectedBoxId === box.id;
    if (onSelectBoxRef.current && !wasAlreadySelected) {
      onSelectBoxRef.current(box.id);
    }

    draggingBoxRef.current = {
      id: box.id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: currentX,
      initialY: currentY,
      containerWidth: rect.width,
      containerHeight: rect.height,
      maxX,
      maxY,
      hasMoved: !!options?.immediateDrag,
      wasAlreadySelected,
      openEditOnClick: !!options?.openEditOnClick,
    };

    if (options?.immediateDrag) {
      setActiveInteractionId(box.id);
    }
  };

  // Mouse move & mouse up handlers for smooth 1:1 dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 1. Handle Dragging
      if (draggingBoxRef.current) {
        const drag = draggingBoxRef.current;
        const dxPx = e.clientX - drag.startX;
        const dyPx = e.clientY - drag.startY;

        // Require a small 3px movement threshold when clicking directly on box body before starting drag
        if (!drag.hasMoved) {
          if (Math.hypot(dxPx, dyPx) < 3) {
            return;
          }
          drag.hasMoved = true;
          setActiveInteractionId(drag.id);
        }

        // Recalculate container rect dynamically in case page scrolled
        const rect = overlayRef.current?.getBoundingClientRect();
        const cWidth = rect && rect.width > 0 ? rect.width : drag.containerWidth;
        const cHeight = rect && rect.height > 0 ? rect.height : drag.containerHeight;

        const deltaXPercent = (dxPx / cWidth) * 100;
        const deltaYPercent = (dyPx / cHeight) * 100;

        const rawX = drag.initialX + deltaXPercent;
        const rawY = drag.initialY + deltaYPercent;

        const clampedX = Math.max(0, Math.min(drag.maxX, rawX));
        const clampedY = Math.max(0, Math.min(drag.maxY, rawY));

        // 0.01% precision (<0.1px on 960px canvas) for ultra-smooth movement
        const nextX = Math.round(clampedX * 100) / 100;
        const nextY = Math.round(clampedY * 100) / 100;

        const nextOverride = {
          ...liveOverridesRef.current[drag.id],
          x: nextX,
          y: nextY,
        };
        liveOverridesRef.current = {
          ...liveOverridesRef.current,
          [drag.id]: nextOverride,
        };
        setLiveOverrides({ ...liveOverridesRef.current });
      }

      // 2. Handle 8-Direction Resizing
      if (resizingBoxRef.current) {
        const resize = resizingBoxRef.current;
        const dxPx = e.clientX - resize.startX;
        const dyPx = e.clientY - resize.startY;
        resize.hasMoved = true;

        const rect = overlayRef.current?.getBoundingClientRect();
        const cWidth = rect && rect.width > 0 ? rect.width : resize.containerWidth;
        const cHeight = rect && rect.height > 0 ? rect.height : resize.containerHeight;

        const dxPercent = (dxPx / cWidth) * 100;
        const dyPercent = (dyPx / cHeight) * 100;

        let nextX = resize.initialX;
        let nextY = resize.initialY;
        let nextWidth = resize.initialWidth;
        let nextHeight = resize.initialHeight;

        // East (right edge)
        if (resize.direction.includes('e')) {
          nextWidth = Math.max(8, Math.min(100 - resize.initialX, resize.initialWidth + dxPercent));
        }
        // West (left edge)
        if (resize.direction.includes('w')) {
          const rightEdge = resize.initialX + resize.initialWidth;
          nextX = Math.max(0, Math.min(rightEdge - 8, resize.initialX + dxPercent));
          nextWidth = rightEdge - nextX;
        }
        // South (bottom edge)
        if (resize.direction.includes('s')) {
          nextHeight = Math.max(6, Math.min(100 - resize.initialY, resize.initialHeight + dyPercent));
        }
        // North (top edge)
        if (resize.direction.includes('n')) {
          const bottomEdge = resize.initialY + resize.initialHeight;
          nextY = Math.max(0, Math.min(bottomEdge - 6, resize.initialY + dyPercent));
          nextHeight = bottomEdge - nextY;
        }

        const nextOverride: { x?: number; y?: number; width?: number; height?: number } = {
          ...liveOverridesRef.current[resize.id],
          x: Math.round(nextX * 100) / 100,
          y: Math.round(nextY * 100) / 100,
          width: Math.round(nextWidth * 100) / 100,
        };
        if (resize.affectsVertical) {
          nextOverride.height = Math.round(nextHeight * 100) / 100;
        }

        liveOverridesRef.current = {
          ...liveOverridesRef.current,
          [resize.id]: nextOverride,
        };
        setLiveOverrides({ ...liveOverridesRef.current });
      }
    };

    const handleMouseUp = () => {
      if (draggingBoxRef.current) {
        const drag = draggingBoxRef.current;
        const override = liveOverridesRef.current[drag.id];
        draggingBoxRef.current = null;
        setActiveInteractionId(null);

        if (drag.hasMoved && override && onUpdateTextBoxRef.current) {
          const target = textBoxesRef.current.find((b) => b.id === drag.id);
          if (target) {
            onUpdateTextBoxRef.current({
              ...target,
              x: override.x !== undefined ? override.x : target.x,
              y: override.y !== undefined ? override.y : target.y,
            });
          }
        } else if (!drag.hasMoved && drag.openEditOnClick && drag.wasAlreadySelected) {
          // Single click without dragging on an already-selected box opens text edit mode
          setEditingTextId(drag.id);
        }

        // Clear live override after committing
        if (liveOverridesRef.current[drag.id]) {
          const copy = { ...liveOverridesRef.current };
          delete copy[drag.id];
          liveOverridesRef.current = copy;
          setLiveOverrides(copy);
        }
      }

      if (resizingBoxRef.current) {
        const resize = resizingBoxRef.current;
        const override = liveOverridesRef.current[resize.id];
        resizingBoxRef.current = null;
        setActiveInteractionId(null);

        if (resize.hasMoved && override && onUpdateTextBoxRef.current) {
          const target = textBoxesRef.current.find((b) => b.id === resize.id);
          if (target) {
            onUpdateTextBoxRef.current({
              ...target,
              x: override.x !== undefined ? override.x : target.x,
              y: override.y !== undefined ? override.y : target.y,
              width: override.width !== undefined ? override.width : target.width,
              height: override.height !== undefined ? override.height : target.height,
            });
          }
        }

        if (liveOverridesRef.current[resize.id]) {
          const copy = { ...liveOverridesRef.current };
          delete copy[resize.id];
          liveOverridesRef.current = copy;
          setLiveOverrides(copy);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Keyboard arrow movement when a Text Box is selected (and not currently typing inside textarea)
  useEffect(() => {
    if (!isEditable || !selectedBoxId || editingTextId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const targetEl = e.target as HTMLElement | null;
      if (
        targetEl &&
        (targetEl.tagName === 'INPUT' ||
          targetEl.tagName === 'TEXTAREA' ||
          targetEl.isContentEditable)
      ) {
        return;
      }

      if (
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown'
      ) {
        const targetBox = textBoxesRef.current.find((b) => b.id === selectedBoxId);
        if (!targetBox || !onUpdateTextBoxRef.current) return;

        e.preventDefault();
        e.stopPropagation();

        // Alt + Arrow (or Ctrl + Shift + Arrow): Resize width / height along directions
        if (e.altKey || ((e.ctrlKey || e.metaKey) && e.shiftKey)) {
          const resizeStep = e.shiftKey && e.altKey ? 0.4 : 1.5;
          const overlayEl = overlayRef.current;
          const rect = overlayEl?.getBoundingClientRect();
          const boxEl = overlayEl?.querySelector(
            `[data-textbox-id="${targetBox.id}"]`
          ) as HTMLElement | null;
          const boxRect = boxEl?.getBoundingClientRect();

          const curWidth =
            targetBox.width !== undefined
              ? targetBox.width
              : rect && boxRect && rect.width > 0
              ? (boxRect.width / rect.width) * 100
              : 35;
          const curHeight =
            targetBox.height !== undefined
              ? targetBox.height
              : rect && boxRect && rect.height > 0
              ? (boxRect.height / rect.height) * 100
              : 14;

          let nextW = curWidth;
          let nextH = targetBox.height;

          if (e.key === 'ArrowRight') nextW = Math.min(98, curWidth + resizeStep);
          if (e.key === 'ArrowLeft') nextW = Math.max(8, curWidth - resizeStep);
          if (e.key === 'ArrowDown') nextH = Math.min(96, curHeight + resizeStep);
          if (e.key === 'ArrowUp') nextH = Math.max(6, curHeight - resizeStep);

          onUpdateTextBoxRef.current({
            ...targetBox,
            width: Math.round(nextW * 100) / 100,
            ...(nextH !== undefined ? { height: Math.round(nextH * 100) / 100 } : {}),
          });
          return;
        }

        // Normal Arrow keys: Move position (x, y)
        // Step size: Shift = 0.2% (micro adjustment), Ctrl/Meta = 2.5% (fast), Normal = 0.8%
        const step = e.shiftKey ? 0.2 : e.ctrlKey || e.metaKey ? 2.5 : 0.8;
        const curX = targetBox.x !== undefined ? targetBox.x : 20;
        const curY = targetBox.y !== undefined ? targetBox.y : 30;

        let nextX = curX;
        let nextY = curY;

        if (e.key === 'ArrowLeft') nextX = Math.max(0, curX - step);
        if (e.key === 'ArrowRight') nextX = Math.min(92, curX + step);
        if (e.key === 'ArrowUp') nextY = Math.max(0, curY - step);
        if (e.key === 'ArrowDown') nextY = Math.min(92, curY + step);

        nextX = Math.round(nextX * 100) / 100;
        nextY = Math.round(nextY * 100) / 100;

        if (nextX !== curX || nextY !== curY) {
          onUpdateTextBoxRef.current({
            ...targetBox,
            x: nextX,
            y: nextY,
          });
        }
      } else if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
        // Pressing Enter on a selected box opens text editing
        e.preventDefault();
        setEditingTextId(selectedBoxId);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (onSelectBoxRef.current) onSelectBoxRef.current(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isEditable, selectedBoxId, editingTextId]);

  if (!textBoxes || textBoxes.length === 0) return null;

  return (
    <div ref={overlayRef} className="absolute inset-0 pointer-events-none z-20 overflow-visible">
      {textBoxes.map((box, idx) => {
        const isSelected = isEditable && selectedBoxId === box.id;
        const isEditing = isSelected && editingTextId === box.id;
        const isInteracting = activeInteractionId === box.id;
        const boxOverride = liveOverrides[box.id];

        const posX = boxOverride?.x !== undefined ? boxOverride.x : box.x !== undefined ? box.x : 20;
        const posY = boxOverride?.y !== undefined ? boxOverride.y : box.y !== undefined ? box.y : 30;
        const widthVal = boxOverride?.width !== undefined ? boxOverride.width : box.width;
        const heightVal = boxOverride?.height !== undefined ? boxOverride.height : box.height;
        const width = widthVal !== undefined ? `${widthVal}%` : 'auto';
        const height = heightVal !== undefined ? `${heightVal}%` : 'auto';
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

        const effectiveAnimClass = isInteracting ? '' : animClass;
        const placeToolbarAbove = posY > 72;

        return (
          <div
            key={elementKey}
            data-textbox-id={box.id}
            className={`absolute pointer-events-auto select-none ${effectiveAnimClass} ${
              isSelected
                ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-transparent shadow-xl rounded-lg'
                : 'hover:ring-1 hover:ring-indigo-400/60 rounded-lg'
            } ${
              isEditable && !isEditing
                ? isInteracting
                  ? 'cursor-grabbing z-40'
                  : 'cursor-move'
                : ''
            } ${isEditable && box.isHidden ? 'opacity-70 border-2 border-dashed border-amber-400/80 bg-amber-950/20' : ''}`}
            style={
              {
                left: `${posX}%`,
                top: `${posY}%`,
                width: width,
                height: height,
                minWidth: '80px',
                minHeight: '36px',
                backgroundColor: bg,
                border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : undefined,
                color: color,
                textAlign: textAlign,
                willChange: isInteracting ? 'left, top, width, height' : undefined,
                transition: isInteracting ? 'none' : undefined,
                '--tb-duration': `${animDuration}s`,
                '--tb-delay': `${animDelay}s`,
              } as React.CSSProperties
            }
            onMouseDown={(e) => {
              if (!isEditable || isEditing) return;
              e.stopPropagation();
              startDraggingBox(e, box, posX, posY, {
                openEditOnClick: true,
                immediateDrag: false,
              });
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (isEditable && onSelectBox && selectedBoxId !== box.id) {
                onSelectBox(box.id);
              }
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (isEditable) {
                if (onSelectBox) onSelectBox(box.id);
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

            {/* POWERPOINT FLOATING FORMATTING MINI-TOOLBAR (TỰ ĐỘNG NẰM DƯỚI HOẶC TRÊN KHUNG TEXT BOX) */}
            {isSelected && isEditable && (
              <div
                className={`absolute ${
                  placeToolbarAbove ? 'bottom-full mb-2' : 'top-full mt-2'
                } left-0 z-50 bg-slate-900/98 border border-slate-700 rounded-xl px-2 py-1 shadow-2xl flex items-center gap-1 text-white text-xs select-none backdrop-blur-md whitespace-nowrap ${
                  isInteracting ? 'pointer-events-none opacity-80' : ''
                }`}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drag Handle */}
                <div
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    startDraggingBox(e, box, posX, posY, {
                      openEditOnClick: false,
                      immediateDrag: true,
                    });
                  }}
                  title="Giữ chuột để kéo hoặc dùng các phím mũi tên (↑ ↓ ← →) trên bàn phím để di chuyển Text Box"
                  className="p-1 text-slate-300 hover:text-white cursor-grab active:cursor-grabbing rounded hover:bg-slate-800 flex items-center gap-1"
                >
                  <Move className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] font-bold hidden sm:inline">Kéo / Phím ↑↓←→</span>
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

                {/* Alignment: Left, Center, Right, Justify */}
                <div className="flex items-center gap-0.5 bg-slate-950/70 p-0.5 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => onUpdateTextBox && onUpdateTextBox({ ...box, textAlign: 'left' })}
                    title="Căn lề trái (Align Left)"
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      textAlign === 'left'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateTextBox && onUpdateTextBox({ ...box, textAlign: 'center' })}
                    title="Căn giữa (Align Center)"
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      textAlign === 'center'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateTextBox && onUpdateTextBox({ ...box, textAlign: 'right' })}
                    title="Căn lề phải (Align Right)"
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      textAlign === 'right'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateTextBox && onUpdateTextBox({ ...box, textAlign: 'justify' })}
                    title="Căn đều hai bên (Justify)"
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      textAlign === 'justify'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <AlignJustify className="w-3.5 h-3.5" />
                  </button>
                </div>

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
            <div className="p-2 relative min-h-[36px] h-full flex flex-col justify-center">
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
                      textAlign: textAlign,
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
                  className={`leading-relaxed min-h-[32px] h-full p-1.5 transition-colors rounded flex flex-col justify-center overflow-hidden ${
                    isEditable
                      ? isInteracting
                        ? 'cursor-grabbing'
                        : 'cursor-move hover:bg-white/5'
                      : ''
                  }`}
                  title={
                    isEditable
                      ? isSelected
                        ? 'Kéo thân hộp để di chuyển | Kéo 8 điểm neo quanh viền (hoặc Alt + Phím mũi tên) để chỉnh kích thước tùy ý'
                        : 'Nhấp để chọn hoặc giữ chuột kéo để di chuyển vị trí Text Box'
                      : undefined
                  }
                  style={{
                    fontSize: `${fontSize}px`,
                    fontWeight: fontWeight,
                    fontStyle: fontStyle,
                    color: color,
                    textAlign: textAlign,
                  }}
                >
                  {box.text && box.text.trim().length > 0 ? (
                    <MathView
                      content={box.text}
                      text={box.text}
                      className={textAlign === 'justify' ? 'text-justify w-full' : 'w-full'}
                    />
                  ) : (
                    <span className="opacity-60 italic text-amber-200/90 text-sm block">
                      Nhấp vào đây để nhập văn bản hoặc công thức toán...
                    </span>
                  )}
                </div>
              )}

              {/* 8-DIRECTION POWERPOINT RESIZE HANDLES & EDGE STRIPS */}
              {isSelected && isEditable && !isEditing && (
                <>
                  {/* 4 Invisible Edge Resize Strips (kéo trực tiếp trên 4 cạnh viền) */}
                  <div
                    onMouseDown={(e) => startResizingBox(e, box, 'n', posX, posY, widthVal, heightVal)}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      if (onUpdateTextBox) onUpdateTextBox({ ...box, height: undefined });
                    }}
                    title="Kéo cạnh trên để chỉnh chiều cao (Nhấp đúp để tự khớp chữ)"
                    className="absolute -top-1.5 left-2 right-2 h-2.5 cursor-ns-resize z-30"
                  />
                  <div
                    onMouseDown={(e) => startResizingBox(e, box, 's', posX, posY, widthVal, heightVal)}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      if (onUpdateTextBox) onUpdateTextBox({ ...box, height: undefined });
                    }}
                    title="Kéo cạnh dưới để chỉnh chiều cao (Nhấp đúp để tự khớp chữ)"
                    className="absolute -bottom-1.5 left-2 right-2 h-2.5 cursor-ns-resize z-30"
                  />
                  <div
                    onMouseDown={(e) => startResizingBox(e, box, 'w', posX, posY, widthVal, heightVal)}
                    title="Kéo cạnh trái để chỉnh chiều rộng"
                    className="absolute top-2 bottom-2 -left-1.5 w-2.5 cursor-ew-resize z-30"
                  />
                  <div
                    onMouseDown={(e) => startResizingBox(e, box, 'e', posX, posY, widthVal, heightVal)}
                    title="Kéo cạnh phải để chỉnh chiều rộng"
                    className="absolute top-2 bottom-2 -right-1.5 w-2.5 cursor-ew-resize z-30"
                  />

                  {/* 4 Corner Handles (NW, NE, SW, SE) */}
                  <div
                    onMouseDown={(e) => startResizingBox(e, box, 'nw', posX, posY, widthVal, heightVal)}
                    title="Kéo góc trên-trái để chỉnh kích thước 2 chiều"
                    className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full cursor-nwse-resize hover:scale-125 transition-transform shadow-sm z-40"
                  />
                  <div
                    onMouseDown={(e) => startResizingBox(e, box, 'ne', posX, posY, widthVal, heightVal)}
                    title="Kéo góc trên-phải để chỉnh kích thước 2 chiều"
                    className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full cursor-nesw-resize hover:scale-125 transition-transform shadow-sm z-40"
                  />
                  <div
                    onMouseDown={(e) => startResizingBox(e, box, 'sw', posX, posY, widthVal, heightVal)}
                    title="Kéo góc dưới-trái để chỉnh kích thước 2 chiều"
                    className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full cursor-nesw-resize hover:scale-125 transition-transform shadow-sm z-40"
                  />
                  <div
                    onMouseDown={(e) => startResizingBox(e, box, 'se', posX, posY, widthVal, heightVal)}
                    title="Kéo góc dưới-phải để chỉnh kích thước 2 chiều"
                    className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full cursor-nwse-resize hover:scale-125 transition-transform shadow-sm z-40"
                  />

                  {/* 4 Mid-Side Handles (N, S, W, E) */}
                  <div
                    onMouseDown={(e) => startResizingBox(e, box, 'n', posX, posY, widthVal, heightVal)}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      if (onUpdateTextBox) onUpdateTextBox({ ...box, height: undefined });
                    }}
                    title="Kéo lên/xuống để chỉnh chiều cao"
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-2 bg-white border border-indigo-600 rounded-full cursor-ns-resize hover:scale-125 transition-transform shadow-sm z-40"
                  />
                  <div
                    onMouseDown={(e) => startResizingBox(e, box, 's', posX, posY, widthVal, heightVal)}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      if (onUpdateTextBox) onUpdateTextBox({ ...box, height: undefined });
                    }}
                    title="Kéo lên/xuống để chỉnh chiều cao"
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-2 bg-white border border-indigo-600 rounded-full cursor-ns-resize hover:scale-125 transition-transform shadow-sm z-40"
                  />
                  <div
                    onMouseDown={(e) => startResizingBox(e, box, 'w', posX, posY, widthVal, heightVal)}
                    title="Kéo trái/phải để chỉnh chiều rộng"
                    className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-2 h-4 bg-white border border-indigo-600 rounded-full cursor-ew-resize hover:scale-125 transition-transform shadow-sm z-40"
                  />
                  <div
                    onMouseDown={(e) => startResizingBox(e, box, 'e', posX, posY, widthVal, heightVal)}
                    title="Kéo trái/phải để chỉnh chiều rộng"
                    className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-2 h-4 bg-white border border-indigo-600 rounded-full cursor-ew-resize hover:scale-125 transition-transform shadow-sm z-40"
                  />
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

