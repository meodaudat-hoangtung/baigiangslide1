import { MathLesson } from '../types';

export interface GradeOption {
  id: string;
  label: string;       // "Lớp 6" ... "Lớp 12"
  shortNumber: string; // "6" ... "12"
  levelGroup: 'THCS' | 'THPT';
  description: string;
}

export const GRADE_OPTIONS: GradeOption[] = [
  {
    id: 'lop-6',
    label: 'Lớp 6',
    shortNumber: '6',
    levelGroup: 'THCS',
    description: 'Khối 6 — Trung học cơ sở (THCS)',
  },
  {
    id: 'lop-7',
    label: 'Lớp 7',
    shortNumber: '7',
    levelGroup: 'THCS',
    description: 'Khối 7 — Trung học cơ sở (THCS)',
  },
  {
    id: 'lop-8',
    label: 'Lớp 8',
    shortNumber: '8',
    levelGroup: 'THCS',
    description: 'Khối 8 — Trung học cơ sở (THCS)',
  },
  {
    id: 'lop-9',
    label: 'Lớp 9',
    shortNumber: '9',
    levelGroup: 'THCS',
    description: 'Khối 9 — Trung học cơ sở (THCS)',
  },
  {
    id: 'lop-10',
    label: 'Lớp 10',
    shortNumber: '10',
    levelGroup: 'THPT',
    description: 'Khối 10 — Trung học phổ thông (THPT)',
  },
  {
    id: 'lop-11',
    label: 'Lớp 11',
    shortNumber: '11',
    levelGroup: 'THPT',
    description: 'Khối 11 — Trung học phổ thông (THPT)',
  },
  {
    id: 'lop-12',
    label: 'Lớp 12',
    shortNumber: '12',
    levelGroup: 'THPT',
    description: 'Khối 12 — Trung học phổ thông (THPT)',
  },
];

export interface SubjectOption {
  id: string;
  name: string;
  gradesLabel: string;
  category: string;
}

// Đầy đủ các môn học từ Lớp 6 đến Lớp 12 theo Chương trình GDPT
export const SUBJECT_OPTIONS: SubjectOption[] = [
  {
    id: 'toan',
    name: 'Toán học',
    gradesLabel: 'Lớp 6 – Lớp 12',
    category: 'Toán & Tin học',
  },
  {
    id: 'ngu-van',
    name: 'Ngữ văn',
    gradesLabel: 'Lớp 6 – Lớp 12',
    category: 'Khoa học Xã hội & Nhân văn',
  },
  {
    id: 'tieng-anh',
    name: 'Ngoại ngữ (Tiếng Anh)',
    gradesLabel: 'Lớp 6 – Lớp 12',
    category: 'Ngoại ngữ',
  },
  {
    id: 'khtn',
    name: 'Khoa học tự nhiên (KHTN)',
    gradesLabel: 'Lớp 6 – Lớp 9 (THCS)',
    category: 'Khoa học Tự nhiên',
  },
  {
    id: 'vat-li',
    name: 'Vật lí',
    gradesLabel: 'Lớp 6 – Lớp 12',
    category: 'Khoa học Tự nhiên',
  },
  {
    id: 'hoa-hoc',
    name: 'Hóa học',
    gradesLabel: 'Lớp 6 – Lớp 12',
    category: 'Khoa học Tự nhiên',
  },
  {
    id: 'sinh-hoc',
    name: 'Sinh học',
    gradesLabel: 'Lớp 6 – Lớp 12',
    category: 'Khoa học Tự nhiên',
  },
  {
    id: 'lich-su-dia-li',
    name: 'Lịch sử và Địa lí',
    gradesLabel: 'Lớp 6 – Lớp 9 (THCS)',
    category: 'Khoa học Xã hội & Nhân văn',
  },
  {
    id: 'lich-su',
    name: 'Lịch sử',
    gradesLabel: 'Lớp 6 – Lớp 12',
    category: 'Khoa học Xã hội & Nhân văn',
  },
  {
    id: 'dia-li',
    name: 'Địa lí',
    gradesLabel: 'Lớp 6 – Lớp 12',
    category: 'Khoa học Xã hội & Nhân văn',
  },
  {
    id: 'gdcd',
    name: 'Giáo dục công dân (GDCD)',
    gradesLabel: 'Lớp 6 – Lớp 9 (THCS)',
    category: 'Giáo dục Công dân & Pháp luật',
  },
  {
    id: 'gdkt-pl',
    name: 'Giáo dục kinh tế và pháp luật',
    gradesLabel: 'Lớp 10 – Lớp 12 (THPT)',
    category: 'Giáo dục Công dân & Pháp luật',
  },
  {
    id: 'tin-hoc',
    name: 'Tin học',
    gradesLabel: 'Lớp 6 – Lớp 12',
    category: 'Toán & Tin học',
  },
  {
    id: 'cong-nghe',
    name: 'Công nghệ',
    gradesLabel: 'Lớp 6 – Lớp 12',
    category: 'Công nghệ & Kỹ thuật',
  },
  {
    id: 'gdtc',
    name: 'Giáo dục thể chất (GDTC)',
    gradesLabel: 'Lớp 6 – Lớp 12',
    category: 'Thể chất & Quốc phòng',
  },
  {
    id: 'nghe-thuat',
    name: 'Nghệ thuật (Âm nhạc & Mỹ thuật)',
    gradesLabel: 'Lớp 6 – Lớp 12',
    category: 'Nghệ thuật',
  },
  {
    id: 'am-nhac',
    name: 'Âm nhạc',
    gradesLabel: 'Lớp 6 – Lớp 12',
    category: 'Nghệ thuật',
  },
  {
    id: 'my-thuat',
    name: 'Mỹ thuật',
    gradesLabel: 'Lớp 6 – Lớp 12',
    category: 'Nghệ thuật',
  },
  {
    id: 'gdqp-an',
    name: 'Giáo dục quốc phòng và an ninh',
    gradesLabel: 'Lớp 10 – Lớp 12 (THPT)',
    category: 'Thể chất & Quốc phòng',
  },
  {
    id: 'hdtn-hn',
    name: 'Hoạt động trải nghiệm, hướng nghiệp',
    gradesLabel: 'Lớp 6 – Lớp 12',
    category: 'Trải nghiệm & Địa phương',
  },
  {
    id: 'gd-dia-phuong',
    name: 'Nội dung giáo dục của địa phương',
    gradesLabel: 'Lớp 6 – Lớp 12',
    category: 'Trải nghiệm & Địa phương',
  },
];

// Chuẩn hóa chuỗi tiếng Việt không dấu để tìm kiếm chính xác
export function normalizeSearchText(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim();
}

// Trích xuất khối lớp ("Lớp 6" ... "Lớp 12") từ bài giảng
export function extractLessonGradeLabel(lesson: MathLesson): string {
  if (lesson.gradeLevel && /^Lớp\s*(6|7|8|9|10|11|12)$/i.test(lesson.gradeLevel.trim())) {
    const match = lesson.gradeLevel.match(/(6|7|8|9|10|11|12)/);
    if (match) return `Lớp ${match[1]}`;
  }
  const source = `${lesson.gradeLevel || ''} ${lesson.grade || ''} ${lesson.config?.targetGrade || ''}`;
  const match = source.match(/(?:lớp|khối|toán|văn|anh|lí|lý|hóa|sinh|sử|địa|tin)\s*(10|11|12|6|7|8|9)\b/i) ||
                source.match(/\b(10|11|12|6|7|8|9)\b/);
  if (match) {
    return `Lớp ${match[1]}`;
  }
  return lesson.gradeLevel || lesson.grade || '';
}

// Trích xuất môn học từ bài giảng
export function extractLessonSubjectLabel(lesson: MathLesson): string {
  if (lesson.subject && lesson.subject.trim()) {
    return lesson.subject.trim();
  }
  const gradeText = (lesson.grade || '').toLowerCase();
  for (const subj of SUBJECT_OPTIONS) {
    const shortName = subj.name.split('(')[0].trim().toLowerCase();
    if (gradeText.includes(shortName)) {
      return subj.name;
    }
  }
  if (gradeText.includes('toán')) return 'Toán học';
  return '';
}

// Kiểm tra bài giảng có thuộc khối lớp đang lọc không
export function matchesLessonGrade(lesson: MathLesson, selectedGrade: string): boolean {
  if (!selectedGrade || selectedGrade === 'all') return true;
  const extracted = extractLessonGradeLabel(lesson);
  if (extracted.toLowerCase() === selectedGrade.toLowerCase()) return true;

  // Fallback check raw grade string
  const numMatch = selectedGrade.match(/(6|7|8|9|10|11|12)/);
  if (numMatch) {
    const num = numMatch[1];
    const raw = `${lesson.gradeLevel || ''} ${lesson.grade || ''}`;
    const regex = new RegExp(`\\b${num}\\b`);
    return regex.test(raw);
  }
  return false;
}

// Kiểm tra bài giảng có thuộc môn học đang lọc không
export function matchesLessonSubject(lesson: MathLesson, selectedSubject: string): boolean {
  if (!selectedSubject || selectedSubject === 'all') return true;
  const extracted = extractLessonSubjectLabel(lesson);
  if (normalizeSearchText(extracted) === normalizeSearchText(selectedSubject)) return true;
  const raw = normalizeSearchText(`${lesson.subject || ''} ${lesson.grade || ''}`);
  const targetShort = normalizeSearchText(selectedSubject.split('(')[0]);
  return Boolean(targetShort && raw.includes(targetShort));
}

// Kiểm tra bài giảng có khớp từ khóa tìm kiếm (theo tên bài giảng, theo lớp, môn học, tác giả, chương)
export function matchesLessonSearchQuery(lesson: MathLesson, query: string): boolean {
  const cleanQuery = query.trim();
  if (!cleanQuery) return true;

  const normQuery = normalizeSearchText(cleanQuery);
  const gradeLabel = extractLessonGradeLabel(lesson);
  const subjectLabel = extractLessonSubjectLabel(lesson);

  const searchableFields = [
    lesson.title || '',
    lesson.grade || '',
    gradeLabel,
    subjectLabel,
    lesson.author || '',
    lesson.chapterOrTopic || '',
  ];

  const combinedRaw = searchableFields.join(' ').toLowerCase();
  const combinedNorm = normalizeSearchText(searchableFields.join(' '));

  return combinedRaw.includes(cleanQuery.toLowerCase()) || combinedNorm.includes(normQuery);
}
