import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Printer,
  Eye,
  EyeOff,
  RotateCcw,
  FileText,
  Filter,
  Lightbulb,
  Award,
  Edit3,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  Search,
  Check,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question, QuestionType, MathLesson } from '../types';
import { MathView } from './MathView';
import { QuestionEditModal } from './QuestionEditModal';
import { DeleteQuestionModal } from './DeleteQuestionModal';

interface QuizSectionProps {
  lesson: MathLesson;
  onUpdateQuestion?: (question: Question) => void;
  onDeleteQuestion?: (questionId: string) => void;
  onAddQuestion?: (question: Question) => void;
}

export const QuizSection: React.FC<QuizSectionProps> = ({
  lesson,
  onUpdateQuestion,
  onDeleteQuestion,
  onAddQuestion,
}) => {
  // Select first question by default for smooth 3:7 split-pane viewing
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    lesson.questions.length > 0 ? lesson.questions[0].id : null
  );
  const [activeFilter, setActiveFilter] = useState<'all' | QuestionType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Student answers state
  const [userAnswers, setUserAnswers] = useState<{
    [qId: string]: {
      selectedOption?: string; // multiple_choice
      tfAnswers?: { [stmtId: string]: boolean }; // true_false
      shortAnswerText?: string; // short_answer
      isSubmitted?: boolean;
    };
  }>({});

  // Individual question answer reveal state (Eye icon toggle)
  const [revealedSolutions, setRevealedSolutions] = useState<{ [qId: string]: boolean }>({});

  const [scoreSummary, setScoreSummary] = useState<{ totalScore: number; maxScore: number; submitted: boolean } | null>(null);

  // Filtered questions based on type filter and search query
  const filteredQuestions = lesson.questions.filter((q) => {
    const matchesType = activeFilter === 'all' || q.type === activeFilter;
    const matchesSearch =
      !searchQuery ||
      q.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.targetConcept && q.targetConcept.toLowerCase().includes(searchQuery.toLowerCase())) ||
      `câu ${q.questionNumber || ''}`.includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Ensure an active question is selected when lesson changes or filter changes
  useEffect(() => {
    if (filteredQuestions.length > 0) {
      if (!selectedQuestionId || !filteredQuestions.some((q) => q.id === selectedQuestionId)) {
        setSelectedQuestionId(filteredQuestions[0].id);
      }
    } else {
      setSelectedQuestionId(null);
    }
  }, [lesson.id, activeFilter, filteredQuestions.length]);

  // Current active question object
  const activeQuestionIndex = filteredQuestions.findIndex((q) => q.id === selectedQuestionId);
  const currentQuestion: Question | undefined =
    activeQuestionIndex >= 0 ? filteredQuestions[activeQuestionIndex] : filteredQuestions[0];

  const handleSelectOption = (qId: string, optionKey: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        selectedOption: optionKey,
        isSubmitted: true,
      },
    }));
  };

  const handleToggleTF = (qId: string, stmtId: string, value: boolean) => {
    setUserAnswers((prev) => {
      const currentTF = prev[qId]?.tfAnswers || {};
      return {
        ...prev,
        [qId]: {
          ...prev[qId],
          tfAnswers: {
            ...currentTF,
            [stmtId]: value,
          },
        },
      };
    });
  };

  const handleShortAnswerChange = (qId: string, text: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        shortAnswerText: text,
      },
    }));
  };

  const handleCheckShortAnswer = (qId: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        isSubmitted: true,
      },
    }));
  };

  // Toggle answer visibility via Eye icon for a specific question
  const toggleSolutionVisibility = (qId: string) => {
    setRevealedSolutions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  // Toggle all answers visibility
  const handleToggleAllAnswers = (show: boolean) => {
    const newState: { [qId: string]: boolean } = {};
    lesson.questions.forEach((q) => {
      newState[q.id] = show;
    });
    setRevealedSolutions(newState);
  };

  const resetAllAnswers = () => {
    setUserAnswers({});
    setScoreSummary(null);
    setRevealedSolutions({});
  };

  const resetCurrentQuestionAnswer = (qId: string) => {
    setUserAnswers((prev) => {
      const updated = { ...prev };
      delete updated[qId];
      return updated;
    });
    setRevealedSolutions((prev) => ({
      ...prev,
      [qId]: false,
    }));
  };

  const calculateTotalScore = () => {
    let score = 0;
    let max = 0;

    lesson.questions.forEach((q) => {
      if (q.type === 'multiple_choice') {
        max += 1;
        const chosen = userAnswers[q.id]?.selectedOption;
        const correctOpt = q.options?.find((o) => o.isCorrect)?.key;
        if (chosen === correctOpt) score += 1;
      } else if (q.type === 'true_false') {
        const statements = q.tfStatements || [];
        max += statements.length * 0.25;
        const userTF = userAnswers[q.id]?.tfAnswers || {};
        statements.forEach((stmt) => {
          if (userTF[stmt.id] === stmt.isCorrect) score += 0.25;
        });
      } else if (q.type === 'short_answer') {
        max += 1;
        const userText = (userAnswers[q.id]?.shortAnswerText || '').trim().toLowerCase();
        const correct = (q.correctShortAnswer || '').trim().toLowerCase();
        const acceptable = (q.acceptableAnswers || []).map((a) => a.trim().toLowerCase());
        if (userText && (userText === correct || acceptable.includes(userText))) {
          score += 1;
        }
      } else if (q.type === 'essay') {
        max += q.essayRubric?.totalPoints || 10;
      }
    });

    setScoreSummary({ totalScore: score, maxScore: max, submitted: true });
    handleToggleAllAnswers(true);

    if (score / Math.max(1, max) >= 0.7) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  };

  const handleOpenCreateQuestion = () => {
    setEditingQuestion(null);
    setIsEditModalOpen(true);
  };

  const handleOpenEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteQuestion = (q: Question) => {
    setDeletingQuestion(q);
    setIsDeleteModalOpen(true);
  };

  const handleSaveQuestion = (savedQuestion: Question) => {
    if (editingQuestion) {
      onUpdateQuestion?.(savedQuestion);
    } else {
      onAddQuestion?.(savedQuestion);
      setSelectedQuestionId(savedQuestion.id);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingQuestion) {
      onDeleteQuestion?.(deletingQuestion.id);
      if (selectedQuestionId === deletingQuestion.id) {
        const remaining = lesson.questions.filter((q) => q.id !== deletingQuestion.id);
        setSelectedQuestionId(remaining.length > 0 ? remaining[0].id : null);
      }
    }
  };

  const getTypeBadge = (type: QuestionType) => {
    switch (type) {
      case 'multiple_choice':
        return { label: 'Trắc nghiệm ABCD', shortLabel: 'ABCD', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      case 'true_false':
        return { label: 'Trắc nghiệm Đúng / Sai', shortLabel: 'Đ/S', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'short_answer':
        return { label: 'Trả lời ngắn (Điền số)', shortLabel: 'Điền', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'essay':
        return { label: 'Tự luận có biểu điểm', shortLabel: 'T.Luận', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
    }
  };

  const getDifficultyBadge = (level: string) => {
    switch (level) {
      case 'easy':
        return { label: 'Nhận biết', bg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
      case 'medium':
        return { label: 'Thông hiểu', bg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' };
      case 'hard':
        return { label: 'Vận dụng', bg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' };
      default:
        return { label: 'Chuẩn', bg: 'bg-slate-500/10 text-slate-400 border border-slate-500/20' };
    }
  };

  // Check question status
  const getQuestionStatus = (q: Question) => {
    const uAns = userAnswers[q.id];
    if (!uAns) return { isAnswered: false, label: 'Chưa làm', color: 'text-slate-400' };

    if (q.type === 'multiple_choice') {
      if (uAns.selectedOption) {
        const correctOpt = q.options?.find((o) => o.isCorrect)?.key;
        const isRight = uAns.selectedOption === correctOpt;
        return {
          isAnswered: true,
          isCorrect: isRight,
          label: isRight ? 'Đúng' : 'Sai',
          color: isRight ? 'text-emerald-400' : 'text-rose-400',
        };
      }
    } else if (q.type === 'true_false') {
      if (uAns.tfAnswers && Object.keys(uAns.tfAnswers).length > 0) {
        return { isAnswered: true, label: 'Đã làm', color: 'text-emerald-400' };
      }
    } else if (q.type === 'short_answer') {
      if (uAns.shortAnswerText) {
        return { isAnswered: true, label: 'Đã điền', color: 'text-amber-400' };
      }
    } else if (q.type === 'essay') {
      return { isAnswered: false, label: 'Tự luận', color: 'text-cyan-400' };
    }

    return { isAnswered: false, label: 'Chưa làm', color: 'text-slate-400' };
  };

  const answeredCount = lesson.questions.filter((q) => getQuestionStatus(q).isAnswered).length;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* 1. TOP HEADER & TOOLBAR */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <HelpCircle className="w-5 h-5" />
                </span>
                <span>Hệ Thống Câu Hỏi Củng Cố</span>
              </h2>
              <span className="px-3 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                {lesson.questions.length} câu hỏi
              </span>
              <span className="px-3 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-semibold text-xs border border-indigo-500/30">
                Đã hoàn thành: {answeredCount}/{lesson.questions.length}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-medium">
              Chọn số thứ tự ở danh sách bên trái để mở nội dung câu hỏi và làm bài ở cửa sổ bên phải.
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Add Question Button */}
            <button
              onClick={handleOpenCreateQuestion}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Câu Hỏi</span>
            </button>

            {/* Answer Visibility Controls */}
            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => handleToggleAllAnswers(true)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-indigo-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Mở tất cả đáp án"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Hiện đáp án</span>
              </button>
              <button
                onClick={() => handleToggleAllAnswers(false)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Ẩn tất cả đáp án"
              >
                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Ẩn đáp án</span>
              </button>
            </div>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="In bộ đề và phiếu học tập"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills & Quick Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 flex items-center gap-1 mr-1 font-semibold">
              <Filter className="w-3.5 h-3.5 text-slate-500" /> Lọc:
            </span>
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs transition-all ${
                activeFilter === 'all'
                  ? 'bg-slate-700 text-white font-bold shadow'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Tất cả ({lesson.questions.length})
            </button>
            <button
              onClick={() => setActiveFilter('multiple_choice')}
              className={`px-3 py-1 rounded-xl text-xs transition-all ${
                activeFilter === 'multiple_choice'
                  ? 'bg-indigo-600 text-white font-bold shadow'
                  : 'bg-slate-800/60 text-indigo-300 hover:bg-slate-800'
              }`}
            >
              Trắc nghiệm ({lesson.questions.filter((q) => q.type === 'multiple_choice').length})
            </button>
            <button
              onClick={() => setActiveFilter('true_false')}
              className={`px-3 py-1 rounded-xl text-xs transition-all ${
                activeFilter === 'true_false'
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'bg-slate-800/60 text-emerald-300 hover:bg-slate-800'
              }`}
            >
              Đúng / Sai ({lesson.questions.filter((q) => q.type === 'true_false').length})
            </button>
            <button
              onClick={() => setActiveFilter('short_answer')}
              className={`px-3 py-1 rounded-xl text-xs transition-all ${
                activeFilter === 'short_answer'
                  ? 'bg-amber-600 text-white font-bold shadow'
                  : 'bg-slate-800/60 text-amber-300 hover:bg-slate-800'
              }`}
            >
              Điền số ({lesson.questions.filter((q) => q.type === 'short_answer').length})
            </button>
            <button
              onClick={() => setActiveFilter('essay')}
              className={`px-3 py-1 rounded-xl text-xs transition-all ${
                activeFilter === 'essay'
                  ? 'bg-cyan-600 text-white font-bold shadow'
                  : 'bg-slate-800/60 text-cyan-300 hover:bg-slate-800'
              }`}
            >
              Tự luận ({lesson.questions.filter((q) => q.type === 'essay').length})
            </button>
          </div>

          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 2. SPLIT LAYOUT (3:7 RATIO -> Left 30% : Right 70%) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
        
        {/* ========================================================= */}
        {/* CỬA SỔ BÊN TRÁI (30% - 3 parts): DANH SÁCH SỐ THỨ TỰ CÂU HỎI 1, 2, 3... */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800/80 rounded-3xl p-5 shadow-2xl space-y-4 lg:sticky lg:top-24 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
                Danh Sách Câu Hỏi
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-mono text-xs font-bold border border-slate-700">
              {filteredQuestions.length} câu
            </span>
          </div>

          {/* Quick Stats / Legend */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" />
              <span>Đã làm ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-600" />
              <span>Chưa làm ({lesson.questions.length - answeredCount})</span>
            </div>
          </div>

          {/* QUESTION NUMBERS GRID (Chỉ thể hiện bằng các số 1, 2, 3,...) */}
          {filteredQuestions.length > 0 ? (
            <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 xl:grid-cols-6 gap-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
              {filteredQuestions.map((q, idx) => {
                const isSelected = selectedQuestionId === q.id;
                const status = getQuestionStatus(q);
                const qNum = q.questionNumber || idx + 1;
                const typeBadge = getTypeBadge(q.type);
                const isSolRevealed = !!revealedSolutions[q.id];

                return (
                  <button
                    key={q.id}
                    onClick={() => setSelectedQuestionId(q.id)}
                    className={`relative group h-10 sm:h-11 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-emerald-600 text-white font-black border-emerald-400 ring-2 ring-emerald-400/80 shadow-lg shadow-emerald-500/20 scale-105 z-10'
                        : status.isAnswered
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-950/60'
                        : 'bg-slate-800/70 text-slate-200 border-slate-700/80 hover:border-slate-500 hover:bg-slate-800'
                    }`}
                    title={`Câu ${qNum} (${typeBadge.label})`}
                  >
                    {/* The Number */}
                    <span className="text-sm sm:text-base font-mono font-bold leading-none">
                      {qNum}
                    </span>

                    {/* Mini Type indicator pill */}
                    <span
                      className={`text-[8.5px] font-semibold uppercase leading-none mt-0.5 px-0.5 rounded ${
                        isSelected
                          ? 'text-emerald-100'
                          : 'text-slate-400'
                      }`}
                    >
                      {typeBadge.shortLabel}
                    </span>

                    {/* Top status indicator dot */}
                    <div className="absolute top-1 right-1 flex items-center gap-0.5">
                      {isSolRevealed && (
                        <Eye className={`w-2 h-2 ${isSelected ? 'text-white' : 'text-emerald-400'}`} />
                      )}
                      {status.isAnswered ? (
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-400'}`} />
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              Không tìm thấy câu hỏi phù hợp bộ lọc
            </div>
          )}

          {/* Quick button to add new question */}
          <button
            onClick={handleOpenCreateQuestion}
            className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 text-xs font-bold border border-slate-700/80 hover:border-emerald-500/40 flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm câu hỏi mới</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* CỬA SỔ BÊN PHẢI (70% - 7 parts): NỘI DUNG CHI TIẾT CÂU HỎI */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-4">
          {currentQuestion ? (
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-200 backdrop-blur-sm">
              {/* Question Top Bar: Navigation & Action controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-emerald-600 text-white font-mono font-black text-base flex items-center justify-center shadow-lg shadow-indigo-600/25">
                    {currentQuestion.questionNumber || activeQuestionIndex + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold text-white">
                        Câu {currentQuestion.questionNumber || activeQuestionIndex + 1}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getTypeBadge(currentQuestion.type).bg}`}>
                        {getTypeBadge(currentQuestion.type).label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${getDifficultyBadge(currentQuestion.difficulty).bg}`}>
                        {getDifficultyBadge(currentQuestion.difficulty).label}
                      </span>
                    </div>
                    {currentQuestion.targetConcept && (
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">
                        Kiến thức: {currentQuestion.targetConcept}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Top Actions */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Eye Toggle Solution */}
                  <button
                    onClick={() => toggleSolutionVisibility(currentQuestion.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                      revealedSolutions[currentQuestion.id]
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/80'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                    }`}
                    title={revealedSolutions[currentQuestion.id] ? 'Đang hiện đáp án' : 'Đáp án đang bị ẩn'}
                  >
                    {revealedSolutions[currentQuestion.id] ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-white" />
                        <span>Ẩn Đáp Án</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Hiện Đáp Án</span>
                      </>
                    )}
                  </button>

                  {/* Reset this question */}
                  <button
                    onClick={() => resetCurrentQuestionAnswer(currentQuestion.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
                    title="Làm lại câu này"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  {/* Edit Question */}
                  <button
                    onClick={() => handleOpenEditQuestion(currentQuestion)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-indigo-600/40 text-slate-400 hover:text-indigo-300 border border-slate-700 transition-colors"
                    title="Chỉnh sửa câu hỏi"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Question */}
                  <button
                    onClick={() => handleOpenDeleteQuestion(currentQuestion)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
                    title="Xóa câu hỏi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Question Prompt Content (Render KaTeX Math) */}
              <div className="text-base sm:text-lg text-slate-100 font-semibold leading-relaxed p-1">
                <MathView content={currentQuestion.prompt} />
              </div>

              {/* ========================================================= */}
              {/* INTERACTIVE QUESTION TYPES                                */}
              {/* ========================================================= */}

              {/* 1. Multiple Choice ABCD */}
              {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {currentQuestion.options.map((opt) => {
                    const uAns = userAnswers[currentQuestion.id] || {};
                    const isSelected = uAns.selectedOption === opt.key;
                    const isRevealed = !!revealedSolutions[currentQuestion.id] || uAns.isSubmitted;
                    let btnStyle = 'bg-slate-800/70 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 text-slate-100';

                    if (isRevealed) {
                      if (opt.isCorrect) {
                        btnStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-100 font-bold ring-2 ring-emerald-500 shadow-lg';
                      } else if (isSelected && !opt.isCorrect) {
                        btnStyle = 'bg-rose-950/90 border-rose-500 text-rose-100 font-bold ring-2 ring-rose-500';
                      }
                    } else if (isSelected) {
                      btnStyle = 'bg-indigo-600/35 border-indigo-500 text-white font-bold ring-2 ring-indigo-500/80 shadow-md';
                    }

                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleSelectOption(currentQuestion.id, opt.key)}
                        className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${btnStyle}`}
                      >
                        <span className="w-7 h-7 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center font-mono font-black text-xs text-indigo-300 flex-shrink-0">
                          {opt.key}
                        </span>
                        <div className="flex-1 text-sm sm:text-base leading-relaxed">
                          <MathView content={opt.text} />
                        </div>
                        {isRevealed && opt.isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 animate-in zoom-in-50" />
                        )}
                        {isRevealed && isSelected && !opt.isCorrect && (
                          <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 animate-in zoom-in-50" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 2. True / False */}
              {currentQuestion.type === 'true_false' && currentQuestion.tfStatements && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-12 text-xs font-bold text-slate-400 uppercase tracking-wider px-3 pb-1">
                    <div className="col-span-8">Ý Khẳng Định</div>
                    <div className="col-span-4 text-center">Xác Định Đúng / Sai</div>
                  </div>
                  {currentQuestion.tfStatements.map((stmt, sIdx) => {
                    const uAns = userAnswers[currentQuestion.id] || {};
                    const chosen = uAns.tfAnswers?.[stmt.id];
                    const isRevealed = !!revealedSolutions[currentQuestion.id] || uAns.isSubmitted;
                    const isRight = chosen === stmt.isCorrect;

                    return (
                      <div
                        key={stmt.id || sIdx}
                        className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 grid grid-cols-12 items-center gap-3"
                      >
                        <div className="col-span-8 flex items-start gap-2.5 text-sm sm:text-base text-slate-100 font-medium">
                          <span className="font-bold text-xs bg-slate-950 px-2 py-1 rounded-lg text-emerald-400 font-mono border border-slate-800">
                            {String.fromCharCode(97 + sIdx)})
                          </span>
                          <MathView content={stmt.statement} />
                        </div>
                        <div className="col-span-4 flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleTF(currentQuestion.id, stmt.id, true)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              chosen === true
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-slate-800 text-slate-300 hover:text-white'
                            }`}
                          >
                            Đúng
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleTF(currentQuestion.id, stmt.id, false)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              chosen === false
                                ? 'bg-rose-600 text-white shadow-md'
                                : 'bg-slate-800 text-slate-300 hover:text-white'
                            }`}
                          >
                            Sai
                          </button>
                          {isRevealed && (
                            <span className="ml-1">
                              {isRight ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              ) : (
                                <XCircle className="w-5 h-5 text-rose-400" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 3. Short Answer */}
              {currentQuestion.type === 'short_answer' && (
                <div className="pt-2 space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <input
                      type="text"
                      placeholder="Nhập kết quả số hoặc biểu thức rút gọn..."
                      value={userAnswers[currentQuestion.id]?.shortAnswerText || ''}
                      onChange={(e) => handleShortAnswerChange(currentQuestion.id, e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleCheckShortAnswer(currentQuestion.id)}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-lg shadow-amber-500/20 transition-all"
                    >
                      Kiểm Tra Kết Quả
                    </button>
                  </div>

                  {(revealedSolutions[currentQuestion.id] || userAnswers[currentQuestion.id]?.isSubmitted) && currentQuestion.correctShortAnswer && (
                    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/40 text-xs sm:text-sm flex items-center justify-between">
                      <span className="text-slate-200">
                        Đáp án chuẩn: <span className="font-mono font-bold text-amber-300 text-base ml-1">{currentQuestion.correctShortAnswer}</span>
                        {currentQuestion.unitOrFormat && <span className="text-slate-400 ml-1">({currentQuestion.unitOrFormat})</span>}
                      </span>
                      {currentQuestion.acceptableAnswers && currentQuestion.acceptableAnswers.length > 1 && (
                        <span className="text-slate-400 text-xs">
                          (Chấp nhận: {currentQuestion.acceptableAnswers.join(', ')})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 4. Essay & Rubrics */}
              {currentQuestion.type === 'essay' && currentQuestion.essayRubric && (
                <div className="pt-2 space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-2">
                    <div className="font-bold text-cyan-300 uppercase tracking-wide flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      <span>Thang Điểm & Hướng Dẫn Chấm (Tổng {currentQuestion.essayRubric.totalPoints} Điểm)</span>
                    </div>
                    <div className="space-y-2 pt-1">
                      {currentQuestion.essayRubric.steps.map((step, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-3"
                        >
                          <div>
                            <span className="font-semibold text-white">{step.stepTitle}: </span>
                            <span className="text-slate-300">{step.criteria}</span>
                          </div>
                          <span className="font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/80 flex-shrink-0">
                            +{step.points} đ
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Hint Box (if any) */}
              {currentQuestion.hint && (
                <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300 mr-1">Gợi ý tư duy: </span>
                    <MathView content={currentQuestion.hint} inline />
                  </div>
                </div>
              )}

              {/* Detailed Solution / Lời giải chi tiết */}
              {revealedSolutions[currentQuestion.id] ? (
                <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border-2 border-emerald-500/40 text-slate-100 space-y-3 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-indigo-800/40">
                    <div className="font-black text-emerald-300 flex items-center gap-2 text-sm uppercase tracking-wide">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>Đáp Án & Lời Giải Chi Tiết:</span>
                    </div>
                    <button
                      onClick={() => toggleSolutionVisibility(currentQuestion.id)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Ẩn đi</span>
                    </button>
                  </div>
                  <div className="text-sm sm:text-base leading-relaxed">
                    <MathView content={currentQuestion.detailedSolution} />
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => toggleSolutionVisibility(currentQuestion.id)}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 hover:border-emerald-500/50 flex items-center justify-between cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 group-hover:text-emerald-300">
                    <Eye className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    <span>Đáp án và lời giải chi tiết đang được ẩn. Nhấp để hiển thị...</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-xl">
                    Mở Đáp Án
                  </span>
                </div>
              )}

              {/* Bottom Pagination: Previous Question & Next Question */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    if (activeQuestionIndex > 0) {
                      setSelectedQuestionId(filteredQuestions[activeQuestionIndex - 1].id);
                    }
                  }}
                  disabled={activeQuestionIndex <= 0}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-slate-200 flex items-center gap-2 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Câu Trước</span>
                </button>

                <span className="text-xs text-slate-400 font-mono font-semibold">
                  Câu {activeQuestionIndex + 1} / {filteredQuestions.length}
                </span>

                <button
                  onClick={() => {
                    if (activeQuestionIndex < filteredQuestions.length - 1) {
                      setSelectedQuestionId(filteredQuestions[activeQuestionIndex + 1].id);
                    }
                  }}
                  disabled={activeQuestionIndex >= filteredQuestions.length - 1}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white flex items-center gap-2 transition-all shadow-md"
                >
                  <span>Câu Kế Tiếp</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-12 text-center space-y-3 backdrop-blur-sm">
              <HelpCircle className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-white">Chưa Chọn Câu Hỏi</h4>
              <p className="text-xs text-slate-400 font-medium">
                Vui lòng chọn một số thứ tự ở danh sách bên trái để bắt đầu làm bài.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. SCORE SUMMARY MODAL / BOX */}
      {scoreSummary && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border border-emerald-500/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Kết Quả Luyện Tập</h3>
              <p className="text-xs text-emerald-400">
                Điểm số đạt được: <span className="font-bold text-lg">{scoreSummary.totalScore}</span> / {scoreSummary.maxScore} điểm
              </p>
            </div>
          </div>
          <button
            onClick={resetAllAnswers}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Làm lại bài
          </button>
        </div>
      )}

      {/* Question Edit / Create Modal */}
      <QuestionEditModal
        isOpen={isEditModalOpen}
        question={editingQuestion}
        defaultQuestionNumber={lesson.questions.length + 1}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveQuestion}
      />

      {/* Question Delete Confirmation Modal */}
      <DeleteQuestionModal
        isOpen={isDeleteModalOpen}
        question={deletingQuestion}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
