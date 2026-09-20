import React, { useState, useEffect, useRef } from 'react';
import { Type, Sparkles, X, RotateCcw } from 'lucide-react';
import { Slide, SlideContentBlock } from '../types';

export const FONT_SIZES = ['20pt', '24pt', '28pt', '32pt', '34pt'] as const;
export type FontSizePt = typeof FONT_SIZES[number];

interface SlideSelectionFontSizeToolbarProps {
  activeSlide?: Slide;
  onUpdateSlide?: (updatedSlide: Slide) => void;
}

interface SelectionState {
  type: 'input' | 'preview';
  inputElement?: HTMLInputElement | HTMLTextAreaElement;
  start?: number;
  end?: number;
  selectedText: string;
  currentSize: string | null;
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export const SlideSelectionFontSizeToolbar: React.FC<SlideSelectionFontSizeToolbarProps> = ({
  activeSlide,
  onUpdateSlide,
}) => {
  const [selectionState, setSelectionState] = useState<SelectionState | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Helper to safely dispatch input event into React controlled inputs/textareas
  const setNativeInputValue = (
    element: HTMLInputElement | HTMLTextAreaElement,
    newValue: string
  ) => {
    const prototype =
      element instanceof HTMLTextAreaElement
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
    if (descriptor && descriptor.set) {
      descriptor.set.call(element, newValue);
    } else {
      element.value = newValue;
    }
    element.dispatchEvent(new Event('input', { bubbles: true }));
  };

  // Inspect and detect text selections across inputs and preview pane
  useEffect(() => {
    const handleSelectionCheck = () => {
      // 1. Check active text input or textarea
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl instanceof HTMLTextAreaElement ||
          (activeEl instanceof HTMLInputElement && activeEl.type === 'text'))
      ) {
        const start = activeEl.selectionStart;
        const end = activeEl.selectionEnd;
        if (start !== null && end !== null && start < end) {
          const fullVal = activeEl.value;
          const selectedText = fullVal.substring(start, end);
          if (selectedText.trim().length > 0) {
            const rect = activeEl.getBoundingClientRect();
            // Don't show if off-screen or invisible
            if (rect.width > 0 && rect.height > 0) {
              // Detect if already wrapped in [size=...]
              const sizeMatch = selectedText.match(
                /^\[size=([0-9]+(?:pt|px)?)\]([\s\S]*?)\[\/size\]$/i
              );
              setSelectionState({
                type: 'input',
                inputElement: activeEl,
                start,
                end,
                selectedText,
                currentSize: sizeMatch ? sizeMatch[1].toLowerCase() : null,
                rect: {
                  top: rect.top,
                  left: rect.left,
                  width: rect.width,
                  height: rect.height,
                },
              });
              setIsDismissed(false);
              return;
            }
          }
        }
      }

      // 2. Check if user selected rendered text inside slide preview or slide workspace
      const winSel = window.getSelection();
      if (winSel && !winSel.isCollapsed && winSel.rangeCount > 0) {
        const text = winSel.toString().trim();
        if (text.length > 0) {
          const range = winSel.getRangeAt(0);
          const container = range.commonAncestorContainer;
          const parentEl =
            container.nodeType === Node.ELEMENT_NODE
              ? (container as HTMLElement)
              : container.parentElement;

          // Check if selection is within slide preview or editor
          const isInsideSlide =
            parentEl?.closest('.slide-preview-container') ||
            parentEl?.closest('.slide-screen') ||
            parentEl?.closest('.slide-block') ||
            parentEl?.closest('.math-rendered');

          if (isInsideSlide) {
            const rect = range.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              // Detect if already has size
              const sizeMatch = text.match(
                /^\[size=([0-9]+(?:pt|px)?)\]([\s\S]*?)\[\/size\]$/i
              );
              setSelectionState({
                type: 'preview',
                selectedText: text,
                currentSize: sizeMatch ? sizeMatch[1].toLowerCase() : null,
                rect: {
                  top: rect.top,
                  left: rect.left,
                  width: rect.width,
                  height: rect.height,
                },
              });
              setIsDismissed(false);
              return;
            }
          }
        }
      }

      // No valid selection, clear state
      setSelectionState(null);
    };

    // Debounce listener to avoid jitter
    let timer: number | undefined;
    const throttledCheck = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(handleSelectionCheck, 60);
    };

    document.addEventListener('selectionchange', throttledCheck);
    document.addEventListener('mouseup', throttledCheck);
    document.addEventListener('keyup', throttledCheck);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('selectionchange', throttledCheck);
      document.removeEventListener('mouseup', throttledCheck);
      document.removeEventListener('keyup', throttledCheck);
    };
  }, []);

  // Apply chosen font size
  const handleApplySize = (targetSize: FontSizePt | 'default') => {
    if (!selectionState) return;

    if (selectionState.type === 'input' && selectionState.inputElement) {
      const el = selectionState.inputElement;
      const start = selectionState.start ?? el.selectionStart ?? 0;
      const end = selectionState.end ?? el.selectionEnd ?? 0;
      const fullText = el.value;
      const rawSelected = fullText.substring(start, end);

      let replaced = '';
      if (targetSize === 'default') {
        // Strip size tags from selected snippet
        replaced = rawSelected
          .replace(/\[size=[0-9]+(?:pt|px)?\]/gi, '')
          .replace(/\[\/size\]/gi, '');
      } else {
        // If already has [size=...], extract inner content first
        const innerContent = rawSelected
          .replace(/\[size=[0-9]+(?:pt|px)?\]/gi, '')
          .replace(/\[\/size\]/gi, '');
        replaced = `[size=${targetSize}]${innerContent}[/size]`;
      }

      const nextVal = fullText.substring(0, start) + replaced + fullText.substring(end);
      setNativeInputValue(el, nextVal);

      // Keep newly wrapped content selected so user can see it or pick another size
      const nextEnd = start + replaced.length;
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start, nextEnd);
        // Update local selection state
        setSelectionState((prev) =>
          prev
            ? {
                ...prev,
                start,
                end: nextEnd,
                selectedText: replaced,
                currentSize: targetSize === 'default' ? null : targetSize,
              }
            : null
        );
      });
      return;
    }

    // If selection was made on rendered preview
    if (selectionState.type === 'preview' && activeSlide && onUpdateSlide) {
      const targetText = selectionState.selectedText;
      let foundAndUpdated = false;

      // Search all blocks on current slide
      const updatedBlocks = (activeSlide.blocks || []).map((block) => {
        if (foundAndUpdated) return block;
        const b = { ...block };
        const textFields: (keyof SlideContentBlock)[] = [
          'title',
          'subtitle',
          'content',
          'problem',
          'finalAnswer',
          'hint',
          'solution',
          'description',
          'question',
          'conclusion',
          'imageCaption',
          'mediaCaption',
        ];

        for (const field of textFields) {
          const val = b[field];
          if (typeof val === 'string' && val.includes(targetText)) {
            let replacedVal = '';
            if (targetSize === 'default') {
              const cleaned = targetText
                .replace(/\[size=[0-9]+(?:pt|px)?\]/gi, '')
                .replace(/\[\/size\]/gi, '');
              replacedVal = val.replace(targetText, cleaned);
            } else {
              const inner = targetText
                .replace(/\[size=[0-9]+(?:pt|px)?\]/gi, '')
                .replace(/\[\/size\]/gi, '');
              replacedVal = val.replace(targetText, `[size=${targetSize}]${inner}[/size]`);
            }
            (b as any)[field] = replacedVal;
            foundAndUpdated = true;
            break;
          }
        }

        // Also check solution steps array
        if (!foundAndUpdated && b.solutionSteps && b.solutionSteps.length > 0) {
          const steps = [...b.solutionSteps];
          for (let i = 0; i < steps.length; i++) {
            if (steps[i].includes(targetText)) {
              let replacedVal = '';
              if (targetSize === 'default') {
                const cleaned = targetText
                  .replace(/\[size=[0-9]+(?:pt|px)?\]/gi, '')
                  .replace(/\[\/size\]/gi, '');
                replacedVal = steps[i].replace(targetText, cleaned);
              } else {
                const inner = targetText
                  .replace(/\[size=[0-9]+(?:pt|px)?\]/gi, '')
                  .replace(/\[\/size\]/gi, '');
                replacedVal = steps[i].replace(
                  targetText,
                  `[size=${targetSize}]${inner}[/size]`
                );
              }
              steps[i] = replacedVal;
              b.solutionSteps = steps;
              foundAndUpdated = true;
              break;
            }
          }
        }

        return b;
      });

      if (foundAndUpdated) {
        onUpdateSlide({
          ...activeSlide,
          blocks: updatedBlocks,
        });
        window.getSelection()?.removeAllRanges();
        setSelectionState(null);
      }
    }
  };

  if (!selectionState || isDismissed) {
    return null;
  }

  // Calculate coordinates: place right above the selection/input
  const toolbarWidth = 380;
  const targetTop = selectionState.rect.top - 46;
  const computedTop = targetTop < 10 ? selectionState.rect.top + selectionState.rect.height + 10 : targetTop;
  const targetLeft = selectionState.rect.left + selectionState.rect.width / 2 - toolbarWidth / 2;
  const computedLeft = Math.max(12, Math.min(window.innerWidth - toolbarWidth - 16, targetLeft));

  return (
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label="Tùy chỉnh cỡ chữ nội dung bôi đen"
      onMouseDown={(e) => {
        // Crucial: prevent focus loss and preserve text selection!
        e.preventDefault();
      }}
      style={{
        position: 'fixed',
        top: `${computedTop}px`,
        left: `${computedLeft}px`,
        zIndex: 99999,
      }}
      className="flex items-center gap-1.5 p-1.5 px-2 bg-slate-950/95 border border-indigo-500/60 text-white rounded-2xl shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 select-none ring-1 ring-white/10"
    >
      {/* Icon & Label */}
      <div className="flex items-center gap-1.5 pl-1.5 pr-2 border-r border-slate-800 shrink-0">
        <span className="w-5 h-5 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
          <Type className="w-3.5 h-3.5" />
        </span>
        <span className="text-[11px] font-black uppercase tracking-wider text-indigo-300">
          Cỡ Chữ:
        </span>
      </div>

      {/* Font Size Pills (20pt, 24pt, 28pt, 32pt, 34pt) */}
      <div className="flex items-center gap-1">
        {FONT_SIZES.map((size) => {
          const isCurrent = selectionState.currentSize === size;
          return (
            <button
              key={size}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleApplySize(size);
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40 ring-1 ring-indigo-400 scale-105'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-indigo-500/50'
              }`}
              title={`Đặt cỡ chữ ${size}`}
            >
              {size}
            </button>
          );
        })}
      </div>

      {/* Remove Size formatting (Reset to default) */}
      {selectionState.currentSize && (
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            handleApplySize('default');
          }}
          className="p-1 px-2 rounded-xl bg-slate-900 hover:bg-rose-950/50 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          title="Xóa định dạng cỡ chữ (trở về mặc định)"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Mặc định</span>
        </button>
      )}

      {/* Dismiss button */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          setIsDismissed(true);
        }}
        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors ml-0.5 cursor-pointer"
        title="Đóng thanh công cụ"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
