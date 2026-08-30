import {
  Slide,
  SlideSection,
  SlideContentBlock,
  SlideBlockType,
  SlideActivity,
  SlideExample,
  SlidePractice,
  SlideApplication
} from '../types';

export interface BlockTypeMeta {
  type: SlideBlockType;
  label: string;
  shortLabel: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  iconName: string;
  description: string;
}

export const BLOCK_TYPES_META: Record<SlideBlockType, BlockTypeMeta> = {
  lesson_title: {
    type: 'lesson_title',
    label: 'TIÊU ĐỀ BÀI HỌC',
    shortLabel: 'TIÊU ĐỀ',
    badgeBg: 'bg-blue-500/20',
    badgeText: 'text-blue-300 border-blue-500/30',
    borderColor: 'border-l-blue-500',
    iconName: 'Type',
    description: 'Tiêu đề chính bài học, phụ đề và công thức toán trọng tâm'
  },
  image: {
    type: 'image',
    label: 'HÌNH ẢNH MINH HỌA',
    shortLabel: 'HÌNH ẢNH',
    badgeBg: 'bg-pink-500/20',
    badgeText: 'text-pink-300 border-pink-500/30',
    borderColor: 'border-l-pink-500',
    iconName: 'ImageIcon',
    description: 'Chèn ảnh minh họa tùy chỉnh vị trí (Trái/Giữa/Phải/Toàn khung) và kích thước'
  },
  content: {
    type: 'content',
    label: 'NỘI DUNG / LÝ THUYẾT',
    shortLabel: 'NỘI DUNG',
    badgeBg: 'bg-purple-500/20',
    badgeText: 'text-purple-300 border-purple-500/30',
    borderColor: 'border-l-purple-500',
    iconName: 'FileText',
    description: 'Văn bản kiến thức, phân tích lý thuyết và công thức toán học LaTeX'
  },
  takeaway: {
    type: 'takeaway',
    label: 'GHI NHỚ TRỌNG TÂM',
    shortLabel: 'GHI NHỚ',
    badgeBg: 'bg-indigo-500/20',
    badgeText: 'text-indigo-300 border-indigo-500/30',
    borderColor: 'border-l-indigo-500',
    iconName: 'Bookmark',
    description: 'Khung định nghĩa, định lý, quy tắc kiến thức trọng tâm SGK'
  },
  example: {
    type: 'example',
    label: 'VÍ DỤ MINH HỌA',
    shortLabel: 'VÍ DỤ',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-300 border-emerald-500/30',
    borderColor: 'border-l-emerald-500',
    iconName: 'Lightbulb',
    description: 'Đề bài minh họa, các bước giải chi tiết từng bước và đáp số'
  },
  practice: {
    type: 'practice',
    label: 'LUYỆN TẬP',
    shortLabel: 'LUYỆN TẬP',
    badgeBg: 'bg-sky-500/20',
    badgeText: 'text-sky-300 border-sky-500/30',
    borderColor: 'border-l-sky-500',
    iconName: 'Dumbbell',
    description: 'Bài tập rèn luyện củng cố kiến thức, nút xem gợi ý và lời giải'
  },
  activity: {
    type: 'activity',
    label: 'HOẠT ĐỘNG KHÁM PHÁ',
    shortLabel: 'HOẠT ĐỘNG',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-300 border-amber-500/30',
    borderColor: 'border-l-amber-500',
    iconName: 'Zap',
    description: 'Nhiệm vụ khám phá, tình huống trải nghiệm, câu hỏi thảo luận và kết luận'
  },
  note: {
    type: 'note',
    label: 'CHÚ Ý / CẢNH BÁO',
    shortLabel: 'CHÚ Ý',
    badgeBg: 'bg-rose-500/20',
    badgeText: 'text-rose-300 border-rose-500/30',
    borderColor: 'border-l-rose-500',
    iconName: 'AlertTriangle',
    description: 'Lưu ý điều kiện, cảnh báo sai lầm thường gặp, quy ước'
  },
  application: {
    type: 'application',
    label: 'VẬN DỤNG THỰC TẾ',
    shortLabel: 'VẬN DỤNG',
    badgeBg: 'bg-teal-500/20',
    badgeText: 'text-teal-300 border-teal-500/30',
    borderColor: 'border-l-teal-500',
    iconName: 'Globe2',
    description: 'Bài toán gắn liền thực tiễn cuộc sống, liên môn và thực hành'
  },
  objectives: {
    type: 'objectives',
    label: 'MỤC TIÊU BÀI HỌC',
    shortLabel: 'MỤC TIÊU',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-300 border-emerald-500/30',
    borderColor: 'border-l-emerald-500',
    iconName: 'Target',
    description: 'Danh sách các mục tiêu kiến thức, kĩ năng cần đạt của bài học'
  },
  opening_problem: {
    type: 'opening_problem',
    label: 'TÌNH HUỐNG MỞ ĐẦU',
    shortLabel: 'MỞ ĐẦU',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-300 border-amber-500/30',
    borderColor: 'border-l-amber-500',
    iconName: 'Compass',
    description: 'Bối cảnh thực tế khởi động, câu hỏi đặt vấn đề và kết luận ban đầu'
  },
  example_note: {
    type: 'example_note',
    label: 'CHÚ Ý TỪ VÍ DỤ',
    shortLabel: 'CHÚ Ý VÍ DỤ',
    badgeBg: 'bg-violet-500/20',
    badgeText: 'text-violet-300 border-violet-500/30',
    borderColor: 'border-l-violet-500',
    iconName: 'CornerDownRight',
    description: 'Nhận xét, phương pháp tư duy và bài học rút ra từ ví dụ đã giải'
  }
};

/**
 * Creates a completely clean, blank slide ready for custom blocks.
 */
export function createBlankSlide(slideNumber: number): Slide {
  return {
    id: `slide_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    slideNumber,
    blocks: [],
    sections: []
  };
}

/**
 * Extracts all blocks from a slide. If slide has its own `blocks` array, returns it.
 * Otherwise collects from legacy sections or top-level fields.
 */
export function getSlideBlocks(slide: Slide): SlideContentBlock[] {
  if (!slide) return [];

  // 1. Direct modular blocks on slide
  if (Array.isArray(slide.blocks)) {
    return slide.blocks;
  }

  const blocks: SlideContentBlock[] = [];

  // Legacy title
  if (slide.title) {
    blocks.push({
      id: `title-${slide.id || Date.now()}`,
      type: 'lesson_title',
      title: slide.title,
      subtitle: slide.subtitle,
      keyFormula: slide.keyFormula
    });
  }

  // Legacy objectives
  if (slide.objectives && slide.objectives.length > 0) {
    blocks.push({
      id: `obj-${slide.id || Date.now()}`,
      type: 'objectives',
      title: 'Mục Tiêu Bài Học',
      items: slide.objectives
    });
  }

  // Legacy opening problem
  if (slide.openingProblem && slide.openingProblem.context) {
    blocks.push({
      id: `open-${slide.id || Date.now()}`,
      type: 'opening_problem',
      title: slide.openingProblem.title || 'Tình Huống Mở Đầu',
      context: slide.openingProblem.context,
      question: slide.openingProblem.question,
      conclusion: slide.openingProblem.conclusion
    });
  }

  // Legacy sections
  if (Array.isArray(slide.sections)) {
    slide.sections.forEach((sec) => {
      const secBlocks = getSectionBlocks(sec);
      blocks.push(...secBlocks);
    });
  }

  // Legacy images
  if (Array.isArray(slide.images)) {
    slide.images.forEach((img, idx) => {
      blocks.push({
        id: img.id || `img-${slide.id}-${idx}`,
        type: 'image',
        title: 'Hình ảnh minh họa',
        imageUrl: img.url,
        imageCaption: img.caption,
        imageAlt: img.alt,
        imagePosition: img.position === 'left' ? 'left' : img.position === 'right' ? 'right' : 'center',
        imageWidthPercent: img.widthPercent || 50
      });
    });
  }

  return blocks;
}

/**
 * Extracts and normalizes all blocks from a section into an ordered SlideContentBlock array.
 */
export function getSectionBlocks(section: SlideSection): SlideContentBlock[] {
  if (!section) return [];

  // If already structured with blocks, return them
  if (Array.isArray(section.blocks) && section.blocks.length > 0) {
    return section.blocks;
  }

  const blocks: SlideContentBlock[] = [];
  let blockIdx = 1;

  // 1. Hoạt động
  if (Array.isArray(section.activities)) {
    section.activities.forEach((act, idx) => {
      blocks.push({
        id: act.id || `act-${Date.now()}-${idx}`,
        type: 'activity',
        title: act.title || `Hoạt động ${idx + 1}: Khám phá`,
        description: act.description || '',
        question: act.question || '',
        conclusion: act.conclusion || ''
      });
    });
  }

  // 2. Ghi nhớ (takeaway hoặc takeaways)
  if (section.takeaway) {
    blocks.push({
      id: `takeaway-${Date.now()}-1`,
      type: 'takeaway',
      title: 'Ghi nhớ',
      content: section.takeaway
    });
  } else if (Array.isArray(section.takeaways)) {
    section.takeaways.forEach((t, idx) => {
      blocks.push({
        id: `takeaway-${Date.now()}-${idx}`,
        type: 'takeaway',
        title: `Ghi nhớ ${idx + 1}`,
        content: t
      });
    });
  } else if (section.callout) {
    blocks.push({
      id: `takeaway-${Date.now()}-callout`,
      type: section.callout.type === 'note' ? 'note' : 'takeaway',
      title: section.callout.title || (section.callout.type === 'note' ? 'Chú ý' : 'Ghi nhớ'),
      content: section.callout.content
    });
  }

  // 3. Chú ý (notes)
  if (Array.isArray(section.notes)) {
    section.notes.forEach((note, idx) => {
      blocks.push({
        id: `note-${Date.now()}-${idx}`,
        type: 'note',
        title: `Chú ý ${idx + 1}`,
        content: note
      });
    });
  }

  // 4. Ví dụ (examples)
  if (Array.isArray(section.examples)) {
    section.examples.forEach((ex, idx) => {
      blocks.push({
        id: ex.id || `ex-${Date.now()}-${idx}`,
        type: 'example',
        title: ex.title || `Ví dụ ${idx + 1}`,
        problem: ex.problem || '',
        solutionSteps: Array.isArray(ex.solutionSteps) ? ex.solutionSteps : [],
        finalAnswer: ex.finalAnswer || ''
      });
    });
  } else if (section.example) {
    blocks.push({
      id: `ex-${Date.now()}-single`,
      type: 'example',
      title: 'Ví dụ 1',
      problem: section.example.problem || '',
      solutionSteps: Array.isArray(section.example.solutionSteps) ? section.example.solutionSteps : [],
      finalAnswer: section.example.finalAnswer || ''
    });
  }

  // 5. Chú ý từ ví dụ (exampleNotes)
  if (Array.isArray(section.exampleNotes)) {
    section.exampleNotes.forEach((en, idx) => {
      blocks.push({
        id: `exnote-${Date.now()}-${idx}`,
        type: 'example_note',
        title: `Chú ý từ ví dụ ${idx + 1}`,
        content: en
      });
    });
  }

  // 6. Luyện tập (practices)
  if (Array.isArray(section.practices)) {
    section.practices.forEach((pr, idx) => {
      blocks.push({
        id: pr.id || `pr-${Date.now()}-${idx}`,
        type: 'practice',
        title: pr.title || `Luyện tập ${idx + 1}`,
        problem: pr.problem || '',
        hint: pr.hint || '',
        solution: pr.solution || ''
      });
    });
  }

  // 7. Vận dụng (applications)
  if (Array.isArray(section.applications)) {
    section.applications.forEach((app, idx) => {
      blocks.push({
        id: app.id || `app-${Date.now()}-${idx}`,
        type: 'application',
        title: app.title || `Vận dụng ${idx + 1}`,
        problem: app.problem || '',
        solution: app.solution || ''
      });
    });
  }

  return blocks;
}

/**
 * Creates a default new block for a section.
 */
export function createDefaultBlock(type: SlideBlockType, numberIndex?: number): SlideContentBlock {
  const uniqueId = `block-${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  switch (type) {
    case 'lesson_title':
      return {
        id: uniqueId,
        type: 'lesson_title',
        title: 'Tiêu đề bài học',
        subtitle: 'Chương trình & Phân môn',
        keyFormula: 'a^2 + b^2 = c^2'
      };
    case 'objectives':
      return {
        id: uniqueId,
        type: 'objectives',
        title: 'Mục tiêu bài học',
        items: [
          'Nắm vững định nghĩa và tính chất trọng tâm',
          'Vận dụng giải quyết các bài toán và tình huống thực tế'
        ]
      };
    case 'opening_problem':
      return {
        id: uniqueId,
        type: 'opening_problem',
        title: 'Tình huống mở đầu',
        context: 'Mô tả tình huống thực tế hoặc bài toán gợi mở vấn đề bài học...',
        question: 'Dự đoán hoặc thảo luận câu hỏi đặt ra?',
        conclusion: 'Khái quát hóa nhận xét mở đầu dẫn vào nội dung bài.'
      };
    case 'content':
      return {
        id: uniqueId,
        type: 'content',
        title: 'Nội dung',
        content: 'Trình bày các luận điểm kiến thức, phân tích lý thuyết và công thức trọng tâm...'
      };
    case 'activity':
      return {
        id: uniqueId,
        type: 'activity',
        title: 'Hoạt động',
        description: 'Quan sát mô hình hoặc ví dụ thực tế dưới đây để rút ra nhận xét:',
        question: 'Dự đoán quy luật hoặc tính chất nổi bật của bài toán?',
        conclusion: 'Khái quát hóa kết luận thành tính chất toán học.'
      };
    case 'takeaway':
      return {
        id: uniqueId,
        type: 'takeaway',
        title: 'Ghi nhớ',
        content: '**ĐỊNH NGHĨA / ĐỊNH LÝ TRỌNG TÂM (SGK)**:\n• Điểm cốt lõi 1...\n• Công thức: $a^2 + b^2 = c^2$'
      };
    case 'note':
      return {
        id: uniqueId,
        type: 'note',
        title: 'Chú ý',
        content: 'Lưu ý điều kiện xác định và các trường hợp ngoại lệ thường gặp.'
      };
    case 'example':
      return {
        id: uniqueId,
        type: 'example',
        title: 'Ví dụ',
        problem: 'Cho bài toán minh họa cụ thể với các giả thiết $A, B$...:',
        solutionSteps: [
          'Bước 1: Phân tích giả thiết và áp dụng định lý',
          'Bước 2: Biến đổi và tính toán cụ thể',
          'Bước 3: Đối chiếu điều kiện'
        ],
        finalAnswer: 'Vậy kết quả của bài toán là...'
      };
    case 'example_note':
      return {
        id: uniqueId,
        type: 'example_note',
        title: 'Chú ý từ ví dụ',
        content: 'Qua ví dụ trên, cần chú ý phương pháp phân tích giả thiết và cách đặt ẩn phụ phù hợp.',
        sourceExampleRef: 'Ví dụ'
      };
    case 'practice':
      return {
        id: uniqueId,
        type: 'practice',
        title: 'Luyện tập',
        problem: 'Thực hành tính toán hoặc chứng minh bài toán tương tự:',
        hint: 'Sử dụng phương pháp đã trình bày ở Ví dụ trên.',
        solution: 'Hướng dẫn giải chi tiết từng bước...'
      };
    case 'application':
      return {
        id: uniqueId,
        type: 'application',
        title: 'Vận dụng',
        problem: 'Bài toán thực tế: Áp dụng kiến thức đã học để giải quyết vấn đề...',
        solution: 'Mô hình hóa bài toán thực tế và tính toán kết quả...'
      };
    case 'image':
      return {
        id: uniqueId,
        type: 'image',
        title: 'Hình ảnh minh họa',
        imageUrl: '',
        imageCaption: 'Hình minh họa bài học',
        imageAlt: 'Minh họa toán học',
        imagePosition: 'center',
        imageWidthPercent: 50
      };
  }
}

/**
 * Synchronizes an array of blocks back into the legacy section fields so both systems stay in sync.
 */
export function updateSectionWithBlocks(section: SlideSection, newBlocks: SlideContentBlock[]): SlideSection {
  const activities: SlideActivity[] = [];
  const notes: string[] = [];
  const takeaways: string[] = [];
  const examples: SlideExample[] = [];
  const exampleNotes: string[] = [];
  const practices: SlidePractice[] = [];
  const applications: SlideApplication[] = [];

  newBlocks.forEach((block) => {
    switch (block.type) {
      case 'activity':
        activities.push({
          id: block.id,
          title: block.title,
          description: block.description || '',
          question: block.question || '',
          conclusion: block.conclusion || ''
        });
        break;
      case 'takeaway':
        if (block.content) takeaways.push(block.content);
        break;
      case 'note':
        if (block.content) notes.push(block.content);
        break;
      case 'example':
        examples.push({
          id: block.id,
          title: block.title,
          problem: block.problem || '',
          solutionSteps: block.solutionSteps || [],
          finalAnswer: block.finalAnswer || ''
        });
        break;
      case 'example_note':
        if (block.content) exampleNotes.push(block.content);
        break;
      case 'practice':
        practices.push({
          id: block.id,
          title: block.title,
          problem: block.problem || '',
          hint: block.hint || '',
          solution: block.solution || ''
        });
        break;
      case 'application':
        applications.push({
          id: block.id,
          title: block.title,
          problem: block.problem || '',
          solution: block.solution || ''
        });
        break;
    }
  });

  return {
    ...section,
    blocks: newBlocks,
    activities: activities.length > 0 ? activities : undefined,
    notes: notes.length > 0 ? notes : undefined,
    takeaway: takeaways.length > 0 ? takeaways.join('\n\n') : undefined,
    takeaways: takeaways.length > 0 ? takeaways : undefined,
    examples: examples.length > 0 ? examples : undefined,
    exampleNotes: exampleNotes.length > 0 ? exampleNotes : undefined,
    practices: practices.length > 0 ? practices : undefined,
    applications: applications.length > 0 ? applications : undefined
  };
}
