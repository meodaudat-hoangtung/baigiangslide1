export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface MultipleChoiceOption {
  key: string; // 'A', 'B', 'C', 'D'
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface TrueFalseStatement {
  id: string;
  statement: string;
  isCorrect: boolean;
  explanation: string;
}

export interface EssayRubric {
  totalPoints: number;
  steps: {
    stepTitle: string;
    points: number;
    criteria: string;
    sampleContent: string;
  }[];
}

export interface Question {
  id: string;
  type: QuestionType;
  questionNumber: number;
  prompt: string; // supports LaTeX math formulas $...$ and $$...$$
  difficulty: DifficultyLevel;
  targetConcept: string;
  // Specific to type:
  options?: MultipleChoiceOption[]; // multiple_choice
  tfStatements?: TrueFalseStatement[]; // true_false
  correctShortAnswer?: string; // short_answer
  acceptableAnswers?: string[]; // alternative formats like ["2", "x=2", "x = 2"]
  unitOrFormat?: string; // e.g. "cm²", "nghiệm thực", "độ"
  essayRubric?: EssayRubric; // essay
  detailedSolution: string; // Detailed step-by-step solution with math formulas
  hint?: string;
}

export interface SlideImage {
  id: string;
  url: string; // base64 data URL or external URL
  caption?: string;
  alt?: string;
  position?: 'center' | 'left' | 'right' | 'top' | 'background';
  widthPercent?: number; // e.g. 30, 50, 75, 100
}

export interface SlideStyleConfig {
  fontFamily?: 'sans' | 'serif' | 'mono' | 'display' | 'handwriting';
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
  textColor?: string; // e.g. '#f8fafc', '#38bdf8', '#fbbf24', '#34d399', '#f43f5e', '#e2e8f0'
  titleColor?: string;
  subtitleColor?: string;
  backgroundColor?: string;
}

export interface SlideActivity {
  id: string;
  title: string; // Hoạt động 1: Khám phá, Hoạt động 2...
  description?: string; // Tình huống / Nhiệm vụ trải nghiệm
  question?: string; // Câu hỏi thảo luận
  conclusion?: string; // Kết luận / Chốt kiến thức sau hoạt động
}

export interface SlideExample {
  id: string;
  title: string; // Ví dụ 1: ..., Ví dụ 2: ...
  problem: string; // Đề bài
  solutionSteps: string[]; // Các bước giải chi tiết
  finalAnswer: string; // Kết luận / Đáp số
}

export interface SlidePractice {
  id: string;
  title: string; // Luyện tập 1, Luyện tập 2...
  problem: string; // Đề bài luyện tập
  hint?: string; // Gợi ý phương pháp
  solution?: string; // Đáp án / Hướng dẫn giải
}

export interface SlideApplication {
  id: string;
  title: string; // Vận dụng 1, Vận dụng 2...
  problem: string; // Tình huống / Bài toán thực tế
  solution?: string; // Lời giải / Hướng dẫn thực hành
}

export interface SlideOpeningProblem {
  id?: string;
  title?: string; // Tình huống / Đố vui mở đầu
  context: string; // Mô tả tình huống thực tế / bức tranh / bối cảnh
  question?: string; // Câu hỏi gợi mở vấn đề
  conclusion?: string; // Nhận xét / Kết luận mở đầu
}

export type SlideBlockType =
  | 'lesson_title'    // Tiêu đề bài học (Tiêu đề, phụ đề, công thức trọng tâm)
  | 'objectives'      // Mục tiêu bài học (Danh sách mục tiêu cần đạt)
  | 'opening_problem' // Tình huống mở đầu (Bối cảnh thực tế, câu hỏi đặt vấn đề, kết luận)
  | 'content'         // Nội dung kiến thức (Văn bản lý thuyết, công thức, giải thích)
  | 'activity'        // Hoạt động khám phá
  | 'takeaway'        // Ghi nhớ (Định nghĩa, định lý, quy tắc)
  | 'note'            // Chú ý (Lưu ý, quy ước, cảnh báo)
  | 'example'         // Ví dụ (Đề bài, các bước giải, đáp số)
  | 'example_note'    // Chú ý từ ví dụ (Nhận xét, phương pháp)
  | 'practice'        // Luyện tập (Bài tập rèn luyện, gợi ý, lời giải)
  | 'application'     // Vận dụng (Bài toán thực tế, hướng dẫn)
  | 'image';          // Chèn hình ảnh tùy chỉnh vị trí, kích thước, chú thích

export interface SlideContentBlock {
  id: string;
  type: SlideBlockType;
  title: string; // Tiêu đề khối
  // General text content
  content?: string;
  subtitle?: string;
  keyFormula?: string;
  // Objectives fields
  items?: string[];
  // Hoạt động & Tình huống mở đầu fields
  description?: string;
  context?: string;
  question?: string;
  conclusion?: string;
  // Ví dụ fields
  problem?: string;
  solutionSteps?: string[];
  finalAnswer?: string;
  // Luyện tập / Vận dụng fields
  hint?: string;
  solution?: string;
  // Chú ý từ ví dụ fields
  sourceExampleRef?: string;
  // Khối Ảnh (Image Block) fields:
  imageUrl?: string;
  imageCaption?: string;
  imageAlt?: string;
  imagePosition?: 'center' | 'left' | 'right' | 'full';
  imageWidthPercent?: number; // 25, 33, 50, 75, 100
}

export interface SlideSection {
  id?: string;
  title?: string; // Tiêu đề mục (vd: "1. Khái niệm mệnh đề", "2. Mệnh đề chứa biến", "a) Định nghĩa", "b) Tính chất")
  content?: string; // Mô tả khái quát của mục
  // Modular list of blocks (enables seamless drag & drop mouse reordering):
  blocks?: SlideContentBlock[];
  
  // Direct arrays for backwards compatibility & convenience:
  activities?: SlideActivity[];
  notes?: string[];
  takeaway?: string;
  takeaways?: string[];
  examples?: SlideExample[];
  exampleNotes?: string[];
  practices?: SlidePractice[];
  applications?: SlideApplication[];
  // Backward compatibility fields
  mathFormulas?: string[];
  bulletPoints?: string[];
  callout?: {
    type: 'definition' | 'theorem' | 'note' | 'tip' | 'warning';
    title?: string;
    content: string;
  };
  example?: {
    problem: string;
    solutionSteps: string[];
    finalAnswer: string;
  };
  image?: SlideImage;
}

export interface Slide {
  id: string;
  slideNumber: number;
  // Modular list of blocks on this slide (Primary modular system):
  blocks?: SlideContentBlock[];

  // 1. TIÊU ĐỀ BÀI HỌC (optional legacy / header fields)
  title?: string;
  subtitle?: string;
  // 1.1 MỤC TIÊU BÀI HỌC
  objectives?: string[]; // Danh sách mục tiêu kiến thức, kỹ năng
  // 1.2 BÀI TOÁN / TÌNH HUỐNG MỞ ĐẦU
  openingProblem?: SlideOpeningProblem;
  
  // CÔNG THỨC TRỌNG TÂM
  keyFormula?: string;
  keyFormulas?: string[];
  
  // 3. CÁC NỘI DUNG CHI TIẾT (Legacy sections support)
  sections?: SlideSection[];
  
  category?: 'intro' | 'definition' | 'theorem' | 'method' | 'example' | 'application' | 'summary';
  layout?: 'standard' | 'split_two_col' | 'formula_focus' | 'step_by_step' | 'example_box' | 'geometric_diagram';
  chalkboardNotes?: string;
  teacherSpeechGuide?: string;
  suggestedDurationMin?: number;
  images?: SlideImage[];
  styleConfig?: SlideStyleConfig;
}

export interface CoreConcept {
  id: string;
  term: string;
  definition: string;
  formula?: string;
  example?: string;
  importance: 'essential' | 'advanced' | 'supplementary';
}

export interface GoldenFormula {
  id: string;
  name: string;
  latex: string;
  condition?: string;
  description: string;
  mnemonic?: string; // mẹo ghi nhớ
}

export interface CommonPitfall {
  id: string;
  title: string;
  wrongWay: string;
  rightWay: string;
  explanation: string;
}

export interface MindmapNode {
  id: string;
  label: string;
  formula?: string;
  detail?: string;
  parentId?: string;
  color?: string;
  children?: MindmapNode[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  formula?: string;
  category: string;
}

export interface LessonSummary {
  topicTitle: string;
  gradeLevel: string;
  mainOverview: string;
  coreConcepts: CoreConcept[];
  goldenFormulas: GoldenFormula[];
  commonPitfalls: CommonPitfall[];
  mindmapTree: MindmapNode;
  wrapUpFlashcards: Flashcard[];
}

export interface GenerationConfig {
  totalQuestions: number;
  numMultipleChoice: number;
  numTrueFalse: number;
  numShortAnswer: number;
  numEssay: number;
  targetGrade: string; // e.g. "Toán 10 - Kết Nối Tri Thức"
  focusTopic?: string;
  teachingGoal: 'standard' | 'exam_prep' | 'concept_mastery' | 'advanced';
}

export interface MathLesson {
  id: string;
  title: string;
  grade: string;
  chapterOrTopic: string;
  createdAt: number;
  updatedAt: number;
  sourceImageCount: number;
  sourceImagePreviews?: string[]; // mini thumbnails
  slides: Slide[];
  questions: Question[];
  summary: LessonSummary;
  config: GenerationConfig;
}
