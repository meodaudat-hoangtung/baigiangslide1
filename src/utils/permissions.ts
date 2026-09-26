import { AppUser, MathLesson, Slide, Question } from '../types';

/**
 * Kiểm tra người dùng đã đăng nhập hợp lệ và không bị khóa hay chưa.
 * (Các quyền năng chỉ có được khi đăng nhập hệ thống)
 */
export function isAuthenticatedUser(user: AppUser | null | undefined): user is AppUser {
  return Boolean(user && user.uid && user.status !== 'blocked');
}

/**
 * Kiểm tra người dùng có phải là Admin (Quản trị viên cao nhất) hay không.
 * Admin có toàn quyền quyết định với mọi bài giảng, slide, câu hỏi củng cố và thành viên.
 */
export function isAdminUser(user: AppUser | null | undefined): boolean {
  return isAuthenticatedUser(user) && user.role === 'admin';
}

/**
 * Kiểm tra bài giảng có phải do chính người dùng hiện tại tạo ra hay không.
 */
export function isLessonCreatedByUser(
  lesson: MathLesson | null | undefined,
  user: AppUser | null | undefined
): boolean {
  if (!lesson || !isAuthenticatedUser(user)) return false;

  // Admin luôn có toàn quyền như chủ sở hữu tối cao
  if (user.role === 'admin') return true;

  // Thành viên: kiểm tra khớp UID người tạo
  if (lesson.createdByUid) {
    if (lesson.createdByUid === user.uid) return true;
  }

  // Kiểm tra dự phòng theo tên đăng nhập nếu bài giảng có ghi nhận createdByUsername
  if (
    lesson.createdByUsername &&
    user.username &&
    lesson.createdByUsername.trim().toLowerCase() === user.username.trim().toLowerCase()
  ) {
    return true;
  }

  // Các bài giảng hệ thống / bài giảng không có createdByUid thuộc về Admin/Hệ thống,
  // thành viên mới không phải người tạo nên không có quyền sửa/xóa.
  return false;
}

/**
 * Kiểm tra quyền tạo bài giảng mới ("Soạn bài giảng mới"):
 * Cả Admin và Thành viên đã đăng nhập đều có quyền soạn bài giảng mới.
 */
export function canCreateLesson(user: AppUser | null | undefined): boolean {
  return isAuthenticatedUser(user);
}

/**
 * Kiểm tra quyền trình chiếu bài giảng:
 * Khi đã đăng nhập, cả Admin và Thành viên đều có quyền trình chiếu các bài do họ soạn
 * và do những thành viên khác soạn.
 */
export function canPresentLesson(
  lesson: MathLesson | null | undefined,
  user: AppUser | null | undefined
): boolean {
  return isAuthenticatedUser(user) && Boolean(lesson);
}

/**
 * Kiểm tra quyền chỉnh sửa bài soạn & các slide trong bài soạn:
 * - Admin: có toàn quyền chỉnh sửa mọi bài soạn và mọi slide.
 * - Thành viên: CHỈ được chỉnh sửa bài soạn và slide do chính họ tạo;
 *   KHÔNG có quyền chỉnh sửa bất kỳ bài soạn hay slide nào do người khác tạo.
 */
export function canEditLesson(
  lesson: MathLesson | null | undefined,
  user: AppUser | null | undefined
): boolean {
  if (!lesson || !isAuthenticatedUser(user)) return false;
  if (isAdminUser(user)) return true;
  return isLessonCreatedByUser(lesson, user);
}

/**
 * Kiểm tra quyền xóa bài giảng:
 * - Admin: có toàn quyền xóa bất kỳ bài giảng nào.
 * - Thành viên: CHỈ có quyền xóa bài giảng mà họ soạn;
 *   KHÔNG có quyền xóa bất kỳ bài giảng nào do người khác soạn.
 */
export function canDeleteLesson(
  lesson: MathLesson | null | undefined,
  user: AppUser | null | undefined
): boolean {
  if (!lesson || !isAuthenticatedUser(user)) return false;
  if (isAdminUser(user)) return true;
  return isLessonCreatedByUser(lesson, user);
}

/**
 * Kiểm tra quyền chỉnh sửa hoặc xóa 1 slide cụ thể:
 * - Admin: có toàn quyền chỉnh sửa / xóa mọi slide.
 * - Thành viên: chỉ được chỉnh sửa / xóa slide thuộc bài giảng do chính họ soạn
 *   và slide đó không phải do người khác tạo.
 */
export function canModifySlide(
  slide: Slide | null | undefined,
  lesson: MathLesson | null | undefined,
  user: AppUser | null | undefined
): boolean {
  if (!slide || !lesson || !isAuthenticatedUser(user)) return false;
  if (isAdminUser(user)) return true;
  if (!isLessonCreatedByUser(lesson, user)) return false;
  if (slide.createdByUid && slide.createdByUid !== user.uid) return false;
  return true;
}

/**
 * Kiểm tra quyền soạn câu hỏi củng cố mới:
 * - Khi đã đăng nhập, cả Admin và Thành viên đều có quyền soạn câu hỏi củng cố mới.
 */
export function canCreateQuestion(user: AppUser | null | undefined): boolean {
  return isAuthenticatedUser(user);
}

/**
 * Kiểm tra câu hỏi củng cố có phải do người dùng hiện tại soạn hay không.
 */
export function isQuestionCreatedByUser(
  question: Question | null | undefined,
  lesson: MathLesson | null | undefined,
  user: AppUser | null | undefined
): boolean {
  if (!question || !isAuthenticatedUser(user)) return false;
  if (isAdminUser(user)) return true;

  // Nếu câu hỏi có ghi nhận trực tiếp UID người tạo
  if (question.createdByUid) {
    return question.createdByUid === user.uid;
  }

  // Nếu câu hỏi có ghi nhận tên đăng nhập người tạo
  if (
    question.createdByUsername &&
    user.username &&
    question.createdByUsername.trim().toLowerCase() === user.username.trim().toLowerCase()
  ) {
    return true;
  }

  // Nếu câu hỏi khởi tạo cùng bài giảng (chưa gắn createdByUid riêng),
  // quyền thuộc về người đã soạn bài giảng đó
  return isLessonCreatedByUser(lesson, user);
}

/**
 * Kiểm tra quyền chỉnh sửa câu hỏi củng cố:
 * - Admin: có toàn quyền chỉnh sửa mọi câu hỏi củng cố.
 * - Thành viên: CHỈ được chỉnh sửa câu hỏi củng cố mà họ soạn;
 *   KHÔNG được chỉnh sửa câu hỏi củng cố do người khác soạn.
 */
export function canEditQuestion(
  question: Question | null | undefined,
  lesson: MathLesson | null | undefined,
  user: AppUser | null | undefined
): boolean {
  if (!question || !isAuthenticatedUser(user)) return false;
  if (isAdminUser(user)) return true;
  return isQuestionCreatedByUser(question, lesson, user);
}

/**
 * Kiểm tra quyền xóa câu hỏi củng cố:
 * - Admin: có toàn quyền xóa mọi câu hỏi củng cố.
 * - Thành viên: CHỈ có quyền xóa những câu hỏi củng cố mà họ soạn;
 *   KHÔNG có quyền xóa bất kỳ câu hỏi củng cố nào do người khác soạn.
 */
export function canDeleteQuestion(
  question: Question | null | undefined,
  lesson: MathLesson | null | undefined,
  user: AppUser | null | undefined
): boolean {
  if (!question || !isAuthenticatedUser(user)) return false;
  if (isAdminUser(user)) return true;
  return isQuestionCreatedByUser(question, lesson, user);
}

/**
 * Gắn thông tin bản quyền người tạo (ownership metadata) cho bài giảng mới,
 * bao gồm toàn bộ các slide và câu hỏi củng cố bên trong.
 */
export function stampNewLessonOwnership(lesson: MathLesson, user: AppUser | null): MathLesson {
  if (!user) return lesson;
  const authorDisplay = lesson.author?.trim() || user.displayName || user.username || 'Giáo viên';
  const usernameIdent = user.username || user.email || user.uid;

  return {
    ...lesson,
    author: authorDisplay,
    createdByUid: user.uid,
    createdByUsername: usernameIdent,
    createdByEmail: user.email || '',
    createdByRole: user.role,
    slides: (lesson.slides || []).map((s) => ({
      ...s,
      createdByUid: s.createdByUid || user.uid,
      createdByName: s.createdByName || authorDisplay,
    })),
    questions: (lesson.questions || []).map((q) => ({
      ...q,
      createdByUid: q.createdByUid || user.uid,
      createdByUsername: q.createdByUsername || usernameIdent,
      createdByName: q.createdByName || authorDisplay,
    })),
  };
}

/**
 * Gắn thông tin người tạo cho 1 slide mới.
 */
export function stampNewSlideOwnership(slide: Slide, user: AppUser | null): Slide {
  if (!user) return slide;
  return {
    ...slide,
    createdByUid: user.uid,
    createdByName: user.displayName || user.username || 'Giáo viên',
  };
}

/**
 * Gắn thông tin người tạo cho 1 câu hỏi củng cố mới.
 */
export function stampNewQuestionOwnership(question: Question, user: AppUser | null): Question {
  if (!user) return question;
  return {
    ...question,
    createdByUid: user.uid,
    createdByUsername: user.username || user.email || user.uid,
    createdByName: user.displayName || user.username || 'Giáo viên',
  };
}

/**
 * Hiển thị tên người tạo bài giảng / câu hỏi thân thiện trên giao diện.
 */
export function getLessonCreatorDisplayName(lesson: MathLesson | null | undefined): string {
  if (!lesson) return 'Hệ thống';
  if (lesson.author && lesson.author.trim()) return lesson.author.trim();
  if (lesson.createdByRole === 'admin') return 'Quản Trị Viên (ADMIN)';
  if (lesson.createdByUsername) return lesson.createdByUsername;
  return 'Quản Trị Viên (ADMIN)';
}
