import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  content?: string | undefined | null;
  text?: string | undefined | null;
  className?: string;
  block?: boolean;
  inline?: boolean;
  as?: 'div' | 'span';
}

const KATEX_MACROS = {
  '\\tg': '\\tan',
  '\\cotg': '\\cot',
  '\\dfrac': '\\frac',
  '\\tbinom': '\\binom',
  '\\dbinom': '\\binom',
  '\\degree': '^\\circ',
  '\\arc': '\\wideparen',
  '\\vect': '\\vec',
};

/**
 * Renders text containing LaTeX / KaTeX / MathJax formulas and markdown styling.
 * Supports:
 * - content or text prop interchangeably
 * - $...$ and \(...\) for inline math
 * - $$...$$ and \[...\] and \begin{...}...\end{...} for block formulas
 * - Automatic detection of raw LaTeX macros (e.g. \frac, \sqrt, \pm, \alpha, \sum) even without $ delimiters
 * - Markdown bold (**text**), italics (*text*), code (`code`)
 * - Resilient error fallback without crashing
 */
export const MathView: React.FC<MathViewProps> = ({
  content,
  text: textProp,
  className = '',
  block = false,
  inline = false,
  as,
}) => {
  const Tag = as || (inline ? 'span' : 'div');
  const actualContent = content !== undefined && content !== null ? content : textProp;

  const renderedHtml = useMemo(() => {
    if (!actualContent) return '';

    // If block prop is set and the whole string is a formula without delimiters
    if (block && !actualContent.includes('$') && !actualContent.includes('\\(') && !actualContent.includes('\\[')) {
      try {
        return katex.renderToString(actualContent.trim(), {
          displayMode: true,
          throwOnError: false,
          trust: true,
          strict: false,
          macros: KATEX_MACROS,
        });
      } catch {
        return actualContent;
      }
    }

    // Auto-wrap raw LaTeX commands like \frac, \sqrt, \alpha if user didn't write $...$
    let processedContent = actualContent;
    if (!processedContent.includes('$') && !processedContent.includes('\\(') && !processedContent.includes('\\[')) {
      // Check if text starts with or heavily contains LaTeX math commands
      const hasMathCmd = /\\(frac|dfrac|sqrt|pm|times|div|cdot|alpha|beta|gamma|theta|pi|Delta|omega|sigma|int|sum|prod|lim|infty|ge|le|neq|approx|equiv|forall|exists|in|subset|cup|cap|vec|vect|degree)/.test(processedContent);
      if (hasMathCmd) {
        // If entire text looks like a math expression, wrap in $
        processedContent = `$${processedContent}$`;
      }
    }

    const blockTag = inline || Tag === 'span' ? 'span' : 'div';
    const mathTokens: string[] = [];

    // Unified math regex to match delimiters without collision:
    // 1. $$ ... $$ (display block)
    // 2. \\[ ... \\] (display block)
    // 3. \\begin{env} ... \\end{env} (display block)
    // 4. \\( ... \\) (inline)
    // 5. $ ... $ (inline)
    const MATH_REGEX = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\begin\{(?:matrix|pmatrix|bmatrix|vmatrix|Vmatrix|cases|align|aligned|array|gather|gathered|split)\}[\s\S]*?\\end\{(?:matrix|pmatrix|bmatrix|vmatrix|Vmatrix|cases|align|aligned|array|gather|gathered|split)\}|\\\([\s\S]*?\\\)|\$[^\$\n]+?\$)/g;

    let text = processedContent.replace(MATH_REGEX, (match) => {
      let mathStr = '';
      let isDisplay = false;

      if (match.startsWith('$$') && match.endsWith('$$')) {
        mathStr = match.slice(2, -2).trim();
        isDisplay = true;
      } else if (match.startsWith('\\[') && match.endsWith('\\]')) {
        mathStr = match.slice(2, -2).trim();
        isDisplay = true;
      } else if (match.startsWith('\\(') && match.endsWith('\\)')) {
        mathStr = match.slice(2, -2).trim();
        isDisplay = false;
      } else if (match.startsWith('$') && match.endsWith('$')) {
        mathStr = match.slice(1, -1).trim();
        isDisplay = false;
      } else {
        // Standalone \begin{...}...\end{...}
        mathStr = match.trim();
        isDisplay = true;
      }

      let rendered = '';
      try {
        rendered = katex.renderToString(mathStr, {
          displayMode: inline ? false : isDisplay,
          throwOnError: false,
          trust: true,
          strict: false,
          macros: KATEX_MACROS,
        });
      } catch {
        rendered = match;
      }

      const wrapped = isDisplay && !inline
        ? `<${blockTag} class="katex-block block my-2.5 overflow-x-auto py-1.5 px-3 rounded-xl bg-slate-900/70 border border-slate-800/90 text-center shadow-inner text-amber-200">${rendered}</${blockTag}>`
        : `<span class="katex-inline inline-block px-0.5 text-amber-300 font-medium">${rendered}</span>`;

      const token = `__MATH_TOKEN_${mathTokens.length}__`;
      mathTokens.push(wrapped);
      return token;
    });

    // Convert markdown bold and italics on non-math text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-indigo-200">$1</strong>');
    text = text.replace(/\*([^\*]+)\*/g, '<em class="italic text-slate-300">$1</em>');

    // Support custom font size tags: [size=20pt]...[/size], [size=24pt]...[/size], [size=28pt]...[/size], [size=32pt]...[/size], [size=34pt]...[/size]
    let prevText = '';
    let loopCount = 0;
    while (prevText !== text && loopCount < 3) {
      prevText = text;
      loopCount++;
      text = text.replace(/\[size=([0-9]+(?:pt|px)?)\]([\s\S]*?)\[\/size\]/gi, (_match, size, inner) => {
        const sizeStr = size.toLowerCase().endsWith('pt') || size.toLowerCase().endsWith('px') ? size : `${size}pt`;
        return `<span class="slide-custom-fontsize inline" style="font-size: ${sizeStr}; line-height: 1.35;">${inner}</span>`;
      });
    }

    // Replace newlines with linebreaks
    let formatted = text.replace(/\n/g, '<br/>');

    // Restore math tokens safely
    mathTokens.forEach((tokenHtml, idx) => {
      formatted = formatted.replace(`__MATH_TOKEN_${idx}__`, () => tokenHtml);
    });

    return formatted;
  }, [content, block, inline, Tag]);

  return (
    <Tag
      className={`math-rendered font-sans text-inherit leading-relaxed ${inline ? 'inline-block' : ''} ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

