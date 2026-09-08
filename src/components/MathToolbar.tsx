import React, { useState } from 'react';
import { MathView } from './MathView';
import { Sigma, Copy, Check, ChevronDown, ChevronUp, Sparkles, HelpCircle } from 'lucide-react';

interface MathToolbarProps {
  onInsert?: (latexSnippet: string) => void;
  className?: string;
  defaultExpanded?: boolean;
}

interface MathShortcut {
  label: string;
  latex: string;
  preview: string;
  category: 'cơ_bản' | 'phép_toán' | 'hình_học' | 'giải_tích' | 'ký_hiệu';
}

const MATH_SHORTCUTS: MathShortcut[] = [
  // Delimiters
  { label: '$...$ (Nội dòng)', latex: '$x = 1$', preview: '$x = 1$', category: 'cơ_bản' },
  { label: '$$...$$ (Khối riêng)', latex: '$$f(x) = ax^2 + bx + c$$', preview: '$$f(x) = ax^2 + bx + c$$', category: 'cơ_bản' },

  // Phân số & Căn thức
  { label: 'Phân số', latex: '$\\frac{a}{b}$', preview: '$\\frac{a}{b}$', category: 'phép_toán' },
  { label: 'Căn bậc hai', latex: '$\\sqrt{x}$', preview: '$\\sqrt{x}$', category: 'phép_toán' },
  { label: 'Căn bậc n', latex: '$\\sqrt[n]{x}$', preview: '$\\sqrt[n]{x}$', category: 'phép_toán' },
  { label: 'Mũ (lũy thừa)', latex: '$x^2$', preview: '$x^2$', category: 'phép_toán' },
  { label: 'Chỉ số dưới', latex: '$x_1, x_2$', preview: '$x_1, x_2$', category: 'phép_toán' },
  { label: 'Trị tuyệt đối', latex: '$|x|$', preview: '$|x|$', category: 'phép_toán' },

  // Hình học & Vectơ (Rất quan trọng cho Toán THPT)
  { label: 'Vectơ', latex: '$\\vec{u}$', preview: '$\\vec{u}$', category: 'hình_học' },
  { label: 'Vectơ AB', latex: '$\\vec{AB}$', preview: '$\\vec{AB}$', category: 'hình_học' },
  { label: 'Độ dài vectơ', latex: '$|\\vec{AB}|$', preview: '$|\\vec{AB}|$', category: 'hình_học' },
  { label: 'Góc', latex: '$\\widehat{ABC}$', preview: '$\\widehat{ABC}$', category: 'hình_học' },
  { label: 'Vuông góc', latex: '$\\perp$', preview: '$\\perp$', category: 'hình_học' },
  { label: 'Song song', latex: '$\\parallel$', preview: '$\\parallel$', category: 'hình_học' },
  { label: 'Tam giác (Delta)', latex: '$\\Delta ABC$', preview: '$\\Delta ABC$', category: 'hình_học' },
  { label: 'Độ (góc)', latex: '$90^\\circ$', preview: '$90^\\circ$', category: 'hình_học' },

  // Ký hiệu so sánh & logic
  { label: 'Nhân', latex: '$\\cdot$', preview: '$\\cdot$', category: 'ký_hiệu' },
  { label: 'Chia', latex: '$\\div$', preview: '$\\div$', category: 'ký_hiệu' },
  { label: 'Cộng trừ', latex: '$\\pm$', preview: '$\\pm$', category: 'ký_hiệu' },
  { label: 'Khác', latex: '$\\neq$', preview: '$\\neq$', category: 'ký_hiệu' },
  { label: 'Nhỏ hơn bằng', latex: '$\\le$', preview: '$\\le$', category: 'ký_hiệu' },
  { label: 'Lớn hơn bằng', latex: '$\\ge$', preview: '$\\ge$', category: 'ký_hiệu' },
  { label: 'Xấp xỉ', latex: '$\\approx$', preview: '$\\approx$', category: 'ký_hiệu' },
  { label: 'Tương đương', latex: '$\\Leftrightarrow$', preview: '$\\Leftrightarrow$', category: 'ký_hiệu' },
  { label: 'Suy ra', latex: '$\\Rightarrow$', preview: '$\\Rightarrow$', category: 'ký_hiệu' },

  // Tập hợp & Giải tích
  { label: 'Thuộc', latex: '$\\in \\mathbb{R}$', preview: '$\\in \\mathbb{R}$', category: 'giải_tích' },
  { label: 'Không thuộc', latex: '$\\notin$', preview: '$\\notin$', category: 'giải_tích' },
  { label: 'Tập con', latex: '$\\subset$', preview: '$\\subset$', category: 'giải_tích' },
  { label: 'Hợp', latex: '$\\cup$', preview: '$\\cup$', category: 'giải_tích' },
  { label: 'Giao', latex: '$\\cap$', preview: '$\\cap$', category: 'giải_tích' },
  { label: 'Số thực R', latex: '$\\mathbb{R}$', preview: '$\\mathbb{R}$', category: 'giải_tích' },
  { label: 'Số tự nhiên N', latex: '$\\mathbb{N}$', preview: '$\\mathbb{N}$', category: 'giải_tích' },
  { label: 'Pi', latex: '$\\pi$', preview: '$\\pi$', category: 'giải_tích' },
  { label: 'Alpha', latex: '$\\alpha$', preview: '$\\alpha$', category: 'giải_tích' },
  { label: 'Beta', latex: '$\\beta$', preview: '$\\beta$', category: 'giải_tích' },
  { label: 'Vô cực', latex: '$\\infty$', preview: '$\\infty$', category: 'giải_tích' },
  { label: 'Giới hạn lim', latex: '$\\lim_{x \\to x_0} f(x)$', preview: '$\\lim_{x \\to x_0} f(x)$', category: 'giải_tích' },
  { label: 'Tích phân', latex: '$\\int_{a}^{b} f(x)dx$', preview: '$\\int_{a}^{b} f(x)dx$', category: 'giải_tích' },
  { label: 'Hệ phương trình', latex: '$\\begin{cases} 2x + y = 5 \\\\ x - y = 1 \\end{cases}$', preview: '$\\begin{cases} 2x + y = 5 \\\\ x - y = 1 \\end{cases}$', category: 'giải_tích' },
];

export const MathToolbar: React.FC<MathToolbarProps> = ({
  onInsert,
  className = '',
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'phép_toán' | 'hình_học' | 'giải_tích' | 'ký_hiệu'>('all');
  const [testFormula, setTestFormula] = useState('f(x) = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}');

  const handleShortcutClick = (shortcut: MathShortcut) => {
    if (onInsert) {
      onInsert(shortcut.latex);
    } else {
      navigator.clipboard.writeText(shortcut.latex);
    }
    setCopiedText(shortcut.label);
    setTimeout(() => setCopiedText(null), 1800);
  };

  const filteredShortcuts =
    activeCategory === 'all'
      ? MATH_SHORTCUTS
      : MATH_SHORTCUTS.filter((s) => s.category === activeCategory);

  return (
    <div className={`rounded-2xl bg-slate-950/90 border border-amber-500/30 overflow-hidden shadow-xl transition-all ${className}`}>
      {/* Header bar */}
      <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/30 flex items-center justify-between border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
            <Sigma className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <span>Hỗ Trợ Soạn Công Thức Toán LaTeX</span>
            <code className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-500/30 text-[10px] text-amber-200 font-mono">
              $công\_thức$
            </code>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {copiedText && (
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 animate-pulse">
              <Check className="w-3 h-3" />
              <span>Đã sao chép: {copiedText}</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-all"
          >
            <span>{isExpanded ? 'Thu gọn bảng toán' : 'Mở bảng công thức ($...$)'}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Expanded Toolbar */}
      {isExpanded && (
        <div className="p-3 sm:p-4 space-y-3">
          {/* Quick Guide */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2 text-[11px] text-slate-300">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Hướng dẫn gõ nhanh:</strong> Đặt công thức giữa 2 dấu đô-la{' '}
              <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded font-mono">$x^2 + 1$</code>{' '}
              để hiển thị cùng dòng, hoặc 4 dấu đô-la{' '}
              <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded font-mono">$$f(x) = ax^2$$</code>{' '}
              để hiển thị thành một dòng riêng biệt căn giữa.
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Tất Cả' },
              { id: 'phép_toán', label: 'Phân Số & Lũy Thừa' },
              { id: 'hình_học', label: 'Hình Học & Vectơ' },
              { id: 'giải_tích', label: 'Giải Tích & Tập Hợp' },
              { id: 'ký_hiệu', label: 'Ký Hiệu So Sánh' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-amber-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Shortcuts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-56 overflow-y-auto custom-scrollbar p-1">
            {filteredShortcuts.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleShortcutClick(item)}
                title={`Nhấp để chèn hoặc sao chép: ${item.latex}`}
                className="p-2 rounded-xl bg-slate-900/90 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/50 flex flex-col items-center justify-center gap-1 transition-all group active:scale-95 text-center min-h-[52px]"
              >
                <div className="text-amber-300 text-xs font-semibold group-hover:scale-105 transition-transform">
                  <MathView content={item.preview} inline />
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-amber-200 truncate max-w-full">
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Real-time Math Sandbox / Test input */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Gõ thử công thức LaTeX và xem kết quả tức thì:</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`$${testFormula}$`);
                  setCopiedText(`$${testFormula}$`);
                  setTimeout(() => setCopiedText(null), 1800);
                }}
                className="text-indigo-300 hover:text-indigo-200 flex items-center gap-1 font-semibold"
              >
                <Copy className="w-3 h-3" />
                <span>Sao chép công thức đã gõ</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                value={testFormula}
                onChange={(e) => setTestFormula(e.target.value)}
                placeholder="Gõ mã LaTeX ví dụ: \frac{-b \pm \sqrt{\Delta}}{2a}"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-amber-300 font-mono outline-none focus:ring-1 focus:ring-amber-500"
              />
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2 flex items-center justify-center min-h-[38px] text-amber-200 overflow-x-auto text-xs sm:text-sm">
                <MathView content={`$${testFormula}$`} inline />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
