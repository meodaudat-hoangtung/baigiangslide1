import { GoogleGenAI } from '@google/genai';
import { jsonrepair } from 'jsonrepair';
import { MathLesson, GenerationConfig, Slide, Question, LessonSummary } from '../src/types.js';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface ImageInput {
  base64: string;
  mimeType: string;
  name?: string;
}

// Helper to delay for rate limits
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Pre-processes JSON string containing LaTeX formulas where single backslashes
 * (e.g. \sqrt, \Delta, \frac, \alpha, \perp, \widehat) would otherwise cause
 * "SyntaxError: Bad escaped character in JSON".
 */
export function fixLatexBackslashesInJson(raw: string): string {
  let result = '';
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < raw.length; i++) {
    const char = raw[i];

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
        // Valid standard JSON escape characters: " \ / b f n r t
        if (char === '"' || char === '\\' || char === '/') {
          result += '\\' + char;
        } else if (char === 'u' && /^[0-9a-fA-F]{4}/.test(raw.substring(i + 1, i + 5))) {
          result += '\\u';
        } else if (char === 'b' || char === 'f' || char === 'n' || char === 'r' || char === 't') {
          // Check if this was intended as a LaTeX macro e.g. \frac, \text, \times, \right, \neq
          const remaining = raw.substring(i);
          const isLatexWord =
            (char === 'f' && /^frac\b/i.test(remaining)) ||
            (char === 't' && /^(text|times|theta|tau|tan|triangle)\b/i.test(remaining)) ||
            (char === 'r' && /^(right|rho|rad|root)\b/i.test(remaining)) ||
            (char === 'b' && /^(begin|bullet|bar|beta|bold|box|bmatrix)\b/i.test(remaining)) ||
            (char === 'n' && /^(neq|not|newline|nabla|nu)\b/i.test(remaining));

          if (isLatexWord) {
            // It's a LaTeX command like \frac, so double-escape it: \\frac
            result += '\\\\' + char;
          } else {
            // Keep normal JSON escape like \n, \t
            result += '\\' + char;
          }
        } else {
          // Any other character (like \s in \sqrt, \D in \Delta, \a in \alpha, \p in \pi, \le, \ge, etc.)
          // In standard JSON, this throws "Bad escaped character in JSON".
          // We convert it to a double-escaped backslash so JSON.parse receives literal \sqrt, \Delta, etc.!
          result += '\\\\' + char;
        }
      } else if (char === '\\') {
        isEscaped = true;
      } else if (char === '"') {
        inString = false;
        result += char;
      } else if (char === '\n') {
        // Unescaped newline inside a JSON string literal -> replace with \n
        result += '\\n';
      } else if (char === '\r') {
        // Unescaped carriage return -> ignore
      } else if (char === '\t') {
        // Unescaped tab inside JSON string -> replace with space
        result += ' ';
      } else {
        result += char;
      }
    } else {
      if (char === '"') {
        inString = true;
      }
      result += char;
    }
  }

  if (isEscaped) {
    result += '\\\\';
  }

  return result;
}

/**
 * Multi-stage resilient JSON parser for LLM mathematical outputs
 */
export function safeParseMathJson(rawText: string): any {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Phản hồi từ AI rỗng hoặc không đúng định dạng chuỗi.');
  }

  // 1. Strip markdown fences and whitespace
  let text = rawText.trim();
  text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '');
  text = text.replace(/\s*```$/i, '').trim();

  // Find outermost JSON brackets
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.substring(firstBrace, lastBrace + 1);
  }

  // Strategy 1: Direct JSON.parse
  try {
    return JSON.parse(text);
  } catch {
    // Continue to next strategy
  }

  // Strategy 2: Preprocess LaTeX unescaped backslashes
  const fixedText = fixLatexBackslashesInJson(text);
  try {
    return JSON.parse(fixedText);
  } catch {
    // Continue to next strategy
  }

  // Strategy 3: jsonrepair on preprocessed LaTeX text
  try {
    const repairedFixed = jsonrepair(fixedText);
    return JSON.parse(repairedFixed);
  } catch {
    // Continue to next strategy
  }

  // Strategy 4: jsonrepair on original text
  try {
    const repairedRaw = jsonrepair(text);
    return JSON.parse(repairedRaw);
  } catch (err: any) {
    console.error('[SafeParseMathJson] All JSON parsing strategies failed:', err);
    throw new Error('Lỗi cú pháp khi phân tích dữ liệu bài giảng từ mô hình AI. Vui lòng thử lại.');
  }
}

export async function analyzeMathTextbookAndGenerate(
  images: ImageInput[],
  config: GenerationConfig,
  additionalNotes?: string
): Promise<MathLesson> {
  const parts: any[] = [];

  // Add all image parts
  for (const img of images) {
    let cleanBase64 = img.base64;
    let mimeType = img.mimeType || 'image/jpeg';
    if (cleanBase64.includes(';base64,')) {
      const split = cleanBase64.split(';base64,');
      mimeType = split[0].replace('data:', '') || mimeType;
      cleanBase64 = split[1];
    }
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: cleanBase64,
      },
    });
  }

  const promptText = `
Bạn là một chuyên gia sư phạm Toán học hàng đầu với 20 năm kinh nghiệm biên soạn sách giáo khoa và giáo án điện tử chuẩn Bộ Giáo dục & Đào tạo.
Nhiệm vụ của bạn là phân tích TOÀN BỘ hình ảnh trang sách giáo khoa / tài liệu toán học được tải lên và TÁI HIỆN ĐẦY ĐỦ, CHI TIẾT TỪNG NỘI DUNG thành bài giảng điện tử tương tác chuyên nghiệp.

=== QUY TẮC CỐT LÕI VỀ CÔNG THỨC TOÁN HỌC (LATEX / KATEX) ===
1. **100% công thức toán học, biến số, hàm số, phương trình, hệ thức, ký hiệu hình học** (như $a, b, c, x, y, z$, $\\Delta$, $\\alpha, \\beta, \\pi$, $\\triangle ABC$, $\\widehat{ABC} = 90^\\circ$, $\\vec{u}$, $\\perp$, $\\parallel$, $\\in, \\notin$, $\\sqrt{x^2+y^2}$, $\\frac{a}{b}$, $\\le, \\ge, \\neq, \\approx$, v.v.) BẮT BUỘC phải đặt trong dấu \`$...$\` (nội dòng) hoặc \`$$...$$\` (khối công thức độc lập).
2. Trình bày công thức sạch đẹp, đúng chuẩn KaTeX/LaTeX của SGK hiện hành (Bộ Cánh Diều, Kết Nối Tri Thức, Chân Trời Sáng Tạo).

=== QUY TẮC VỀ TIẾN TRÌNH SLIDE (TỪ 15 SLIDES TRỞ LÊN) ===
Bạn PHẢI tạo **ÍT NHẤT TỪ 15 SLIDES TRỞ LÊN (15 đến 20 slides)** để tái hiện trọn vẹn, không bỏ sót bất kỳ phần nào của bài học trong ảnh SGK:
- **Slide 1**: Trang bìa & Mục tiêu bài học (Tên bài học, Khối lớp, Mục tiêu cần đạt về kiến thức & phẩm chất).
- **Slide 2**: Khởi động / Tình huống thực tế mở đầu (Đố vui, bài toán thực tiễn dẫn dắt vào bài).
- **Slide 3**: Hoạt động khám phá 1 (HĐ1: Trải nghiệm, quan sát, đo đạc, đặt câu hỏi).
- **Slide 4**: Khái niệm / Định nghĩa 1 (Phát biểu chuẩn xác, phân tích ý nghĩa và điều kiện).
- **Slide 5**: Nhận xét & Chú ý quan trọng 1 (Các lưu ý, quy ước, sai lầm học sinh dễ mắc phải).
- **Slide 6**: Ví dụ mẫu 1 trong SGK (Đề bài + Phân tích hướng giải + Lời giải chi tiết từng bước).
- **Slide 7**: Luyện tập 1 / Thực hành 1 (Bài tập kiểm tra nhanh mức độ hiểu bài ngay tại lớp kèm đáp án).
- **Slide 8**: Hoạt động khám phá 2 (HĐ2 / Khám phá định lý, quy tắc hoặc tính chất mới).
- **Slide 9**: Định lý / Tính chất trọng tâm (Phát biểu định lý, hệ thức toán học cốt lõi dạng LaTeX).
- **Slide 10**: Chứng minh định lý hoặc Minh họa hình học / Đại số (Giải thích bản chất vì sao định lý đúng).
- **Slide 11**: Định lý đảo hoặc Hệ quả mở rộng (Công cụ nhận biết, các trường hợp đặc biệt).
- **Slide 12**: Ví dụ mẫu 2 trong SGK (Bài toán áp dụng định lý với lời giải mẫu step-by-step).
- **Slide 13**: Luyện tập 2 / Thực hành 2 (Bài tập rèn luyện kỹ năng tính toán / chứng minh).
- **Slide 14**: Phương pháp giải các dạng toán điển hình (Sơ đồ các bước tư duy 1-2-3 và kỹ thuật giải nhanh).
- **Slide 15**: Bài toán vận dụng nâng cao / Tình huống thực tiễn đời sống (Mô hình hóa toán học).
- **Slide 16**: Mục "Em có biết?" / Mở rộng lịch sử toán học & ứng dụng công nghệ.
- **Slide 17**: Củng cố kiến thức trọng tâm & Sơ đồ tóm tắt toàn bài (Những điều cần ghi nhớ).

=== YÊU CẦU ĐỊNH DẠNG JSON & ESCAPING ===
Trong toàn bộ các chuỗi JSON, mọi dấu gạch chéo ngược của LaTeX BẮT BUỘC phải được escape bằng hai dấu gạch chéo ngược (ví dụ: viết \\\\frac thay vì \\frac, viết \\\\sqrt thay vì \\sqrt, viết \\\\Delta thay vì \\Delta, viết \\\\alpha thay vì \\alpha).
Hãy trả về DUY NHẤT một đối tượng JSON hợp lệ:

{
  "title": "Tên bài học chính xác theo SGK",
  "grade": "${config.targetGrade || 'Toán THCS / THPT'}",
  "chapterOrTopic": "Chương / Chủ đề",
  "slides": [
    {
      "id": "slide-1",
      "slideNumber": 1,
      "title": "Tiêu đề Slide",
      "subtitle": "Phụ đề định hướng sư phạm",
      "category": "intro" | "definition" | "theorem" | "method" | "example" | "application" | "summary",
      "layout": "standard" | "split_two_col" | "formula_focus" | "step_by_step" | "example_box",
      "keyFormula": "Công thức chính dạng LaTeX (không kèm $), ví dụ: a^2 + b^2 = c^2",
      "suggestedDurationMin": 3,
      "teacherSpeechGuide": "Lời thoại gợi ý giáo viên hướng dẫn học sinh",
      "chalkboardNotes": "Ghi chú ngắn gọn giáo viên ghi lên bảng đen",
      "sections": [
        {
          "title": "Tiêu đề mục nhỏ (nếu có)",
          "content": "Nội dung phân tích chi tiết, có công thức LaTeX trong dấu $...$",
          "bulletPoints": ["Ý 1 với $LaTeX$", "Ý 2 với $LaTeX$"],
          "callout": {
            "type": "theorem" | "definition" | "tip" | "info",
            "title": "Định Lý / Định Nghĩa / Chú Ý",
            "content": "Nội dung đóng khung nổi bật với công thức $LaTeX$"
          },
          "example": {
            "problem": "Đề bài ví dụ với $LaTeX$",
            "solutionSteps": [
              "Bước 1: Phân tích giả thiết và kết luận",
              "Bước 2: Áp dụng công thức $...$",
              "Bước 3: Thực hiện phép tính $...$"
            ],
            "finalAnswer": "Kết luận cuối cùng: $...$"
          }
        }
      ]
    }
    // ... Tạo ĐẦY ĐỦ ÍT NHẤT 15 SLIDES (từ slide-1 đến slide-15 trở lên)
  ],
  "questions": [
    // ${config.totalQuestions} câu hỏi bám sát SGK (có lời giải chi tiết và công thức $LaTeX$)
  ],
  "summary": {
    "topicTitle": "Tổng kết bài học",
    "gradeLevel": "${config.targetGrade || 'Toán học'}",
    "mainOverview": "Tóm tắt bài học ngắn gọn 2-3 câu",
    "coreConcepts": [
      {
        "term": "Thuật ngữ toán học",
        "definition": "Định nghĩa chuẩn xác với $LaTeX$",
        "formula": "Công thức dạng $LaTeX$",
        "example": "Ví dụ ngắn"
      }
    ],
    "goldenFormulas": [
      {
        "name": "Tên công thức",
        "formula": "$LaTeX$",
        "condition": "Điều kiện áp dụng",
        "mnemonic": "Mẹo ghi nhớ"
      }
    ],
    "commonPitfalls": [
      {
        "mistake": "Sai lầm học sinh hay mắc phải",
        "correction": "Cách giải đúng chuẩn",
        "why": "Phân tích nguyên nhân sai sót"
      }
    ],
    "mindmapTree": {
      "id": "root",
      "label": "Chủ đề bài học",
      "children": []
    },
    "wrapUpFlashcards": [
      {
        "id": "fc-1",
        "question": "Câu hỏi củng cố nhanh có $LaTeX$",
        "answer": "Đáp án súc tích có $LaTeX$",
        "category": "formula"
      }
    ]
  }
}

${additionalNotes ? `Ghi chú bổ sung từ giáo viên: "${additionalNotes}"` : ''}
`;

  parts.push({ text: promptText });

  // List of models in preferred order to fallback if quota is exceeded or high demand (503)
  const candidateModels = [
    'gemini-3.7-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
    'gemini-3.1-pro-preview',
  ];

  let lastError: any = null;
  let responseText: string | null = null;

  for (const modelName of candidateModels) {
    let shouldSkipModel = false;

    for (let attempt = 1; attempt <= 2; attempt++) {
      if (shouldSkipModel) break;

      try {
        console.log(`[Gemini API] Attempting generation with model: ${modelName} (attempt ${attempt})`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: parts,
          },
          config: {
            responseMimeType: 'application/json',
            systemInstruction: 'Bạn là chuyên gia giáo dục Toán học hàng đầu. Phân tích ảnh bài học và xuất ra JSON cấu trúc hoàn hảo chuẩn xác 100%. Luôn escape dấu gạch chéo ngược LaTeX trong chuỗi JSON.',
          },
        });

        if (response && response.text) {
          responseText = response.text;
          console.log(`[Gemini API] Successfully generated textbook lesson with model: ${modelName}`);
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini API] Error with ${modelName} (attempt ${attempt}):`, err?.message || err);

        const errMsg = (err?.message || '').toLowerCase();
        const isQuotaOrRateLimit =
          errMsg.includes('429') ||
          errMsg.includes('resource_exhausted') ||
          errMsg.includes('quota') ||
          errMsg.includes('limit:');
        const isHighDemandOrUnavailable =
          errMsg.includes('503') ||
          errMsg.includes('unavailable') ||
          errMsg.includes('high demand') ||
          errMsg.includes('overloaded') ||
          errMsg.includes('capacity');

        if (isQuotaOrRateLimit || isHighDemandOrUnavailable) {
          console.log(
            `[Gemini API] Model ${modelName} encountered ${
              isHighDemandOrUnavailable ? '503 High Demand' : '429 Rate Limit'
            }. Switching to next candidate model immediately...`
          );
          shouldSkipModel = true;
          break;
        } else {
          // Other transient error, wait 1s before retry attempt 2
          if (attempt === 1) {
            await sleep(1000);
          } else {
            break;
          }
        }
      }
    }

    if (responseText) {
      break;
    }
  }

  if (!responseText) {
    const rawMsg = (lastError?.message || '').toLowerCase();
    if (rawMsg.includes('503') || rawMsg.includes('unavailable') || rawMsg.includes('high demand')) {
      throw new Error(
        'Máy chủ AI của Google hiện đang có lượng truy cập rất cao (503 Service Unavailable / High Demand). Hệ thống đã thử các mô hình dự phòng nhưng chưa có phản hồi. Bạn vui lòng bấm thử lại sau vài giây hoặc chọn bài giảng mẫu có sẵn.'
      );
    }
    if (rawMsg.includes('429') || rawMsg.includes('quota') || rawMsg.includes('resource_exhausted')) {
      throw new Error(
        'Hạn ngạch gói miễn phí (Quota limit 429) của mô hình Gemini tạm thời đã đạt giới hạn trong ngày. Bạn vui lòng chờ một vài giây rồi thử lại, hoặc dùng các bài giảng mẫu có sẵn trong ứng dụng.'
      );
    }
    throw new Error(lastError?.message || 'Không thể nhận phản hồi từ mô hình AI.');
  }

  const parsed = safeParseMathJson(responseText);

  // Sanitize and ensure IDs
  const lessonId = 'lesson-' + Date.now();
  const slides: Slide[] = (parsed.slides || []).map((s: any, idx: number) => ({
    id: s.id || `slide-${idx + 1}`,
    slideNumber: idx + 1,
    title: s.title || `Slide ${idx + 1}`,
    subtitle: s.subtitle || '',
    category: s.category || 'definition',
    layout: s.layout || 'standard',
    sections: s.sections || [{ content: s.content || '' }],
    keyFormula: s.keyFormula || '',
    chalkboardNotes: s.chalkboardNotes || '',
    teacherSpeechGuide: s.teacherSpeechGuide || '',
    suggestedDurationMin: s.suggestedDurationMin || 5,
  }));

  const questions: Question[] = (parsed.questions || []).map((q: any, idx: number) => ({
    id: q.id || `q-${idx + 1}`,
    questionNumber: idx + 1,
    type: q.type || 'multiple_choice',
    prompt: q.prompt || '',
    difficulty: q.difficulty || 'medium',
    targetConcept: q.targetConcept || '',
    options: q.options,
    tfStatements: q.tfStatements,
    correctShortAnswer: q.correctShortAnswer,
    acceptableAnswers: q.acceptableAnswers || (q.correctShortAnswer ? [q.correctShortAnswer] : []),
    unitOrFormat: q.unitOrFormat,
    essayRubric: q.essayRubric,
    detailedSolution: q.detailedSolution || '',
    hint: q.hint || '',
  }));

  const summary: LessonSummary = parsed.summary || {
    topicTitle: parsed.title || 'Tổng kết bài học',
    gradeLevel: parsed.grade || config.targetGrade,
    mainOverview: parsed.mainOverview || 'Nội dung kiến thức cốt lõi của bài học.',
    coreConcepts: parsed.coreConcepts || [],
    goldenFormulas: parsed.goldenFormulas || [],
    commonPitfalls: parsed.commonPitfalls || [],
    mindmapTree: parsed.mindmapTree || { id: 'root', label: parsed.title || 'Chủ đề bài học', children: [] },
    wrapUpFlashcards: parsed.wrapUpFlashcards || [],
  };

  const finalLesson: MathLesson = {
    id: lessonId,
    title: parsed.title || 'Bài giảng Toán Học',
    grade: parsed.grade || config.targetGrade,
    chapterOrTopic: parsed.chapterOrTopic || 'Chương trình Toán học',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    sourceImageCount: images.length,
    sourceImagePreviews: images.slice(0, 3).map((img) => (img.base64.length > 500 ? img.base64.substring(0, 500) + '...' : img.base64)),
    slides,
    questions,
    summary,
    config,
  };

  return finalLesson;
}
