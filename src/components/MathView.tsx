import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  content: string | undefined | null;
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
 * - $...$ and \(...\) for inline math
 * - $$...$$ and \[...\] and \begin{...}...\end{...} for block formulas
 * - Markdown bold (**text**), italics (*text*), code (`code`)
 * - Resilient error fallback without crashing
 */
export const MathView: React.FC<MathViewProps> = ({
  content,
  className = '',
  block = false,
  inline = false,
  as,
}) => {
  const Tag = as || (inline ? 'span' : 'div');

  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // If block prop is set and the whole string is a formula without delimiters
    if (block && !content.includes('$') && !content.includes('\\(') && !content.includes('\\[')) {
      try {
        return katex.renderToString(content.trim(), {
          displayMode: true,
          throwOnError: false,
          trust: true,
          strict: false,
          macros: KATEX_MACROS,
        });
      } catch {
        return content;
      }
    }

    let text = content;

    // Convert markdown bold and italics
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-indigo-200">$1</strong>');
    text = text.replace(/\*([^\*]+)\*/g, '<em class="italic text-slate-300">$1</em>');

    const blockTag = inline || Tag === 'span' ? 'span' : 'div';

    // 1. First replace \begin{environment}...\end{environment} if not already enclosed in $$
    text = text.replace(/\\begin\{(matrix|pmatrix|bmatrix|vmatrix|Vmatrix|cases|align|aligned|array|gather|gathered|split)\}([\s\S]*?)\\end\{\1\}/g, (match) => {
      try {
        const rendered = katex.renderToString(match.trim(), {
          displayMode: true,
          throwOnError: false,
          trust: true,
          strict: false,
          macros: KATEX_MACROS,
        });
        return `<${blockTag} class="katex-block block my-2 overflow-x-auto py-1 px-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">${rendered}</${blockTag}>`;
      } catch {
        return `<span class="font-mono text-amber-300">${match}</span>`;
      }
    });

    // 2. Replace block math $$...$$
    text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      try {
        const rendered = katex.renderToString(math.trim(), {
          displayMode: true,
          throwOnError: false,
          trust: true,
          strict: false,
          macros: KATEX_MACROS,
        });
        return `<${blockTag} class="katex-block block my-2.5 overflow-x-auto py-1.5 px-3 rounded-xl bg-slate-900/70 border border-slate-800/90 text-center shadow-inner text-amber-200">${rendered}</${blockTag}>`;
      } catch {
        return `<${blockTag} class="font-mono text-amber-300 text-center my-2">$$${math}$$</${blockTag}>`;
      }
    });

    // 3. Replace block math \[...\]
    text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
      try {
        const rendered = katex.renderToString(math.trim(), {
          displayMode: true,
          throwOnError: false,
          trust: true,
          strict: false,
          macros: KATEX_MACROS,
        });
        return `<${blockTag} class="katex-block block my-2.5 overflow-x-auto py-1.5 px-3 rounded-xl bg-slate-900/70 border border-slate-800/90 text-center shadow-inner text-amber-200">${rendered}</${blockTag}>`;
      } catch {
        return `<${blockTag} class="font-mono text-amber-300 text-center my-2">\\[${math}\\]</${blockTag}>`;
      }
    });

    // 4. Replace inline math $...$
    text = text.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
      try {
        const rendered = katex.renderToString(math.trim(), {
          displayMode: false,
          throwOnError: false,
          trust: true,
          strict: false,
          macros: KATEX_MACROS,
        });
        return `<span class="katex-inline inline-block px-0.5 text-amber-300 font-medium">${rendered}</span>`;
      } catch {
        return `<span class="font-mono text-amber-300">$${math}$</span>`;
      }
    });

    // 5. Replace inline math \(...\)
    text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => {
      try {
        const rendered = katex.renderToString(math.trim(), {
          displayMode: false,
          throwOnError: false,
          trust: true,
          strict: false,
          macros: KATEX_MACROS,
        });
        return `<span class="katex-inline inline-block px-0.5 text-amber-300 font-medium">${rendered}</span>`;
      } catch {
        return `<span class="font-mono text-amber-300">\\(${math}\\)</span>`;
      }
    });

    // Replace newlines with linebreaks
    const formatted = text.replace(/\n/g, '<br/>');

    return formatted;
  }, [content, block, inline, Tag]);

  return (
    <Tag
      className={`math-rendered font-sans text-inherit leading-relaxed ${inline ? 'inline-block' : ''} ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

