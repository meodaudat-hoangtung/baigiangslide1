import React, { useState } from 'react';
import {
  X,
  Save,
  HelpCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Lightbulb,
  Sparkles,
  Eye,
  FileText,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import {
  Question,
  QuestionType,
  DifficultyLevel,
  MultipleChoiceOption,
  TrueFalseStatement,
  EssayRubric
} from '../types';
import { MathView } from './MathView';

interface QuestionEditModalProps {
  isOpen: boolean;
  question: Question | null; // If null, creating new question
  onClose: () => void;
  onSave: (savedQuestion: Question) => void;
  defaultQuestionNumber?: number;
}

export const QuestionEditModal: React.FC<QuestionEditModalProps> = ({
  isOpen,
  question,
  onClose,
  onSave,
  defaultQuestionNumber = 1,
}) => {
  if (!isOpen) return null;

  const isEditing = !!question;

  // Form states
  const [type, setType] = useState<QuestionType>(question?.type || 'multiple_choice');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(question?.difficulty || 'medium');
  const [targetConcept, setTargetConcept] = useState(question?.targetConcept || '');
  const [prompt, setPrompt] = useState(question?.prompt || '');
  const [hint, setHint] = useState(question?.hint || '');
  const [detailedSolution, setDetailedSolution] = useState(question?.detailedSolution || '');
  const [showPreview, setShowPreview] = useState(false);

  // Multiple Choice state
  const [options, setOptions] = useState<MultipleChoiceOption[]>(
    question?.options || [
      { key: 'A', text: '', isCorrect: true, explanation: '' },
      { key: 'B', text: '', isCorrect: false, explanation: '' },
      { key: 'C', text: '', isCorrect: false, explanation: '' },
      { key: 'D', text: '', isCorrect: false, explanation: '' },
    ]
  );

  // True/False state
  const [tfStatements, setTfStatements] = useState<TrueFalseStatement[]>(
    question?.tfStatements || [
      { id: 'tf-1', statement: '', isCorrect: true, explanation: '' },
      { id: 'tf-2', statement: '', isCorrect: false, explanation: '' },
      { id: 'tf-3', statement: '', isCorrect: true, explanation: '' },
      { id: 'tf-4', statement: '', isCorrect: false, explanation: '' },
    ]
  );

  // Short Answer state
  const [correctShortAnswer, setCorrectShortAnswer] = useState(question?.correctShortAnswer || '');
  const [acceptableAnswersText, setAcceptableAnswersText] = useState(
    (question?.acceptableAnswers || []).join(', ')
  );
  const [unitOrFormat, setUnitOrFormat] = useState(question?.unitOrFormat || '');

  // Essay state
  const [essayRubric, setEssayRubric] = useState<EssayRubric>(
    question?.essayRubric || {
      totalPoints: 10,
      steps: [
        { stepTitle: 'Bước 1: Thiết lập phương trình / giả thiết', points: 3, criteria: 'Xác định đúng điều kiện và viết biểu thức toán học', sampleContent: '' },
        { stepTitle: 'Bước 2: Biến đổi và tính toán', points: 4, criteria: 'Giải chính xác các bước trung gian', sampleContent: '' },
        { stepTitle: 'Bước 3: Kết luận & Biện luận', points: 3, criteria: 'Đối chiếu điều kiện và nêu kết luận bài toán', sampleContent: '' },
      ]
    }
  );

  // Handlers for Multiple Choice
  const handleOptionTextChange = (index: number, text: string) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], text };
      return next;
    });
  };

  const handleOptionExplanationChange = (index: number, explanation: string) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], explanation };
      return next;
    });
  };

  const handleSetCorrectOption = (index: number) => {
    setOptions((prev) =>
      prev.map((opt, i) => ({
        ...opt,
        isCorrect: i === index,
      }))
    );
  };

  const handleAddOption = () => {
    const nextKey = String.fromCharCode(65 + options.length);
    setOptions((prev) => [...prev, { key: nextKey, text: '', isCorrect: false, explanation: '' }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((opt, i) => ({ ...opt, key: String.fromCharCode(65 + i) }));
    });
  };

  // Handlers for True/False
  const handleTfStatementChange = (index: number, statement: string) => {
    setTfStatements((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], statement };
      return next;
    });
  };

  const handleTfToggle = (index: number, isCorrect: boolean) => {
    setTfStatements((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], isCorrect };
      return next;
    });
  };

  const handleTfExplanationChange = (index: number, explanation: string) => {
    setTfStatements((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], explanation };
      return next;
    });
  };

  const handleAddTfStatement = () => {
    setTfStatements((prev) => [
      ...prev,
      { id: `tf-${Date.now()}-${prev.length + 1}`, statement: '', isCorrect: true, explanation: '' },
    ]);
  };

  const handleRemoveTfStatement = (index: number) => {
    if (tfStatements.length <= 1) return;
    setTfStatements((prev) => prev.filter((_, i) => i !== index));
  };

  // Handlers for Essay Rubric
  const handleRubricStepChange = (index: number, field: string, value: any) => {
    setEssayRubric((prev) => {
      const newSteps = [...prev.steps];
      newSteps[index] = { ...newSteps[index], [field]: value };
      const totalPoints = newSteps.reduce((sum, s) => sum + (Number(s.points) || 0), 0);
      return { ...prev, steps: newSteps, totalPoints };
    });
  };

  const handleAddRubricStep = () => {
    setEssayRubric((prev) => {
      const newSteps = [
        ...prev.steps,
        {
          stepTitle: `Bước ${prev.steps.length + 1}: Tiêu chí đánh giá`,
          points: 2,
          criteria: '',
          sampleContent: '',
        },
      ];
      const totalPoints = newSteps.reduce((sum, s) => sum + (Number(s.points) || 0), 0);
      return { ...prev, steps: newSteps, totalPoints };
    });
  };

  const handleRemoveRubricStep = (index: number) => {
    if (essayRubric.steps.length <= 1) return;
    setEssayRubric((prev) => {
      const newSteps = prev.steps.filter((_, i) => i !== index);
      const totalPoints = newSteps.reduce((sum, s) => sum + (Number(s.points) || 0), 0);
      return { ...prev, steps: newSteps, totalPoints };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      alert('Vui lòng nhập nội dung đề bài câu hỏi.');
      return;
    }

    const acceptableArray = acceptableAnswersText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const updatedQuestion: Question = {
      id: question?.id || `q-${Date.now()}`,
      questionNumber: question?.questionNumber || defaultQuestionNumber,
      type,
      difficulty,
      targetConcept: targetConcept.trim(),
      prompt: prompt.trim(),
      hint: hint.trim() || undefined,
      detailedSolution: detailedSolution.trim(),
      ...(type === 'multiple_choice' ? { options } : {}),
      ...(type === 'true_false' ? { tfStatements } : {}),
      ...(type === 'short_answer'
        ? {
            correctShortAnswer: correctShortAnswer.trim(),
            acceptableAnswers: acceptableArray.length > 0 ? acceptableArray : [correctShortAnswer.trim()],
            unitOrFormat: unitOrFormat.trim() || undefined,
          }
        : {}),
      ...(type === 'essay' ? { essayRubric } : {}),
    };

    onSave(updatedQuestion);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEditing ? `Chỉnh Sửa Câu Hỏi #${question?.questionNumber}` : 'Thêm Câu Hỏi Mới'}
              </h2>
              <p className="text-xs text-slate-400">
                Tùy chỉnh đề bài, đáp án, các mức độ nhận thức và lời giải chi tiết (hỗ trợ công thức $...$ & $$...$$)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                showPreview ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showPreview ? 'Đóng Xem Trước' : 'Xem Trước LaTeX'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Attributes: Type, Difficulty, Target Concept */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Question Type */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Dạng Câu Hỏi <span className="text-rose-400">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as QuestionType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="multiple_choice">Trắc nghiệm 4 phương án (ABCD)</option>
                <option value="true_false">Trắc nghiệm Đúng / Sai (nhiều ý)</option>
                <option value="short_answer">Trả lời ngắn / Điền số</option>
                <option value="essay">Tự luận có biểu điểm (Rubric)</option>
              </select>
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Mức Độ Nhận Thức
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="easy">Nhận biết (Dễ)</option>
                <option value="medium">Thông hiểu (Vừa)</option>
                <option value="hard">Vận dụng / Vận dụng cao (Khó)</option>
              </select>
            </div>

            {/* Target Concept */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Chuyên Đề / Đơn Vị Kiến Thức
              </label>
              <input
                type="text"
                value={targetConcept}
                onChange={(e) => setTargetConcept(e.target.value)}
                placeholder="VD: Mệnh đề phủ định, Tập hợp con..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Question Prompt */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300">
                Nội Dung Đề Bài (Hỗ trợ định dạng LaTeX: $...$ hoặc $$...$$) <span className="text-rose-400">*</span>
              </label>
            </div>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Nhập đề bài câu hỏi... (VD: Trong các câu sau, mệnh đề nào là mệnh đề đúng? $P: \forall x \in \mathbb{R}, x^2 \ge 0$)"
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
              required
            />
            {prompt && showPreview && (
              <div className="mt-2 p-3.5 rounded-xl bg-slate-950 border border-indigo-500/40 text-sm text-slate-200">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                  Xem trước đề bài:
                </span>
                <MathView content={prompt} />
              </div>
            )}
          </div>

          {/* Dynamic Content based on Type */}

          {/* 1. Multiple Choice Options */}
          {type === 'multiple_choice' && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/70">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4" />
                  <span>Các Phương Án Lựa Chọn (Tích chọn ô tròn để chỉ định đáp án ĐÚNG)</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Thêm Phương Án
                </button>
              </div>

              <div className="space-y-3">
                {options.map((opt, idx) => (
                  <div
                    key={opt.key || idx}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      opt.isCorrect
                        ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30'
                        : 'bg-slate-800/80 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Correct Option Radio */}
                      <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                        <input
                          type="radio"
                          name="correct_option"
                          checked={opt.isCorrect}
                          onChange={() => handleSetCorrectOption(idx)}
                          className="w-4 h-4 text-emerald-500 bg-slate-900 border-slate-600 focus:ring-emerald-500"
                        />
                        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white">
                          {opt.key}
                        </span>
                      </label>

                      {/* Option Text */}
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                        placeholder={`Nội dung phương án ${opt.key} (VD: $x = 2$)...`}
                        className="flex-1 bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />

                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Option explanation / reason if wrong */}
                    <div className="mt-2 pl-9">
                      <input
                        type="text"
                        value={opt.explanation || ''}
                        onChange={(e) => handleOptionExplanationChange(idx, e.target.value)}
                        placeholder="Giải thích ngắn gọn cho phương án này (tùy chọn)..."
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. True / False Statements */}
          {type === 'true_false' && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/70">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4" />
                  <span>Danh Sách Các Khẳng Định Đúng / Sai (a, b, c, d)</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddTfStatement}
                  className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Thêm Ý Khẳng Định
                </button>
              </div>

              <div className="space-y-3">
                {tfStatements.map((stmt, idx) => (
                  <div
                    key={stmt.id || idx}
                    className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400">
                        {String.fromCharCode(97 + idx)})
                      </span>

                      <input
                        type="text"
                        value={stmt.statement}
                        onChange={(e) => handleTfStatementChange(idx, e.target.value)}
                        placeholder="Nội dung mệnh đề / khẳng định..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />

                      <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700">
                        <button
                          type="button"
                          onClick={() => handleTfToggle(idx, true)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            stmt.isCorrect ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          ĐÚNG
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTfToggle(idx, false)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            !stmt.isCorrect ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          SAI
                        </button>
                      </div>

                      {tfStatements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTfStatement(idx)}
                          className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="pl-9">
                      <input
                        type="text"
                        value={stmt.explanation}
                        onChange={(e) => handleTfExplanationChange(idx, e.target.value)}
                        placeholder="Giải thích vì sao đúng hoặc vì sao sai..."
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Short Answer */}
          {type === 'short_answer' && (
            <div className="space-y-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/70">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Cấu Hình Đáp Án Trả Lời Ngắn / Điền Số
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Đáp Án Chuẩn (Bắt buộc) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={correctShortAnswer}
                    onChange={(e) => setCorrectShortAnswer(e.target.value)}
                    placeholder="VD: 3, -5, 1/2, x = 3..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Đơn Vị / Định Dạng
                  </label>
                  <input
                    type="text"
                    value={unitOrFormat}
                    onChange={(e) => setUnitOrFormat(e.target.value)}
                    placeholder="VD: số nguyên, cm², độ, nghiệm..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Các Đáp Án Đồng Nghĩa Được Chấp Nhận (Cách nhau bởi dấu phẩy)
                </label>
                <input
                  type="text"
                  value={acceptableAnswersText}
                  onChange={(e) => setAcceptableAnswersText(e.target.value)}
                  placeholder="VD: 3, 3 giá trị, x=3, x = 3"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* 4. Essay & Rubric */}
          {type === 'essay' && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/70">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>Biểu Điểm & Tiêu Chí Chấm Tự Luận (Tổng: {essayRubric.totalPoints} Điểm)</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddRubricStep}
                  className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Thêm Bước Chấm
                </button>
              </div>

              <div className="space-y-3">
                {essayRubric.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={step.stepTitle}
                        onChange={(e) => handleRubricStepChange(idx, 'stepTitle', e.target.value)}
                        placeholder={`Tên bước ${idx + 1}...`}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-semibold focus:outline-none"
                      />

                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.5"
                          min="0.25"
                          max="20"
                          value={step.points}
                          onChange={(e) => handleRubricStepChange(idx, 'points', parseFloat(e.target.value) || 0)}
                          className="w-16 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-center text-cyan-400 font-bold font-mono focus:outline-none"
                        />
                        <span className="text-xs text-slate-400">điểm</span>
                      </div>

                      {essayRubric.steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRubricStep(idx)}
                          className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={step.criteria}
                      onChange={(e) => handleRubricStepChange(idx, 'criteria', e.target.value)}
                      placeholder="Mô tả tiêu chí đạt điểm của bước này..."
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hint Field */}
          <div>
            <label className="block text-xs font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Gợi Ý Phương Pháp Tư Duy (Tùy chọn)</span>
            </label>
            <input
              type="text"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="VD: Sử dụng định lý P kéo theo Q; biến đổi tương đương hoặc lập bảng chân trị..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Detailed Math Solution */}
          <div>
            <label className="block text-xs font-bold text-indigo-300 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Lời Giải Chi Tiết & Biện Luận Toán Học (Hỗ trợ công thức $...$ & $$...$$) <span className="text-rose-400">*</span></span>
            </label>
            <textarea
              rows={4}
              value={detailedSolution}
              onChange={(e) => setDetailedSolution(e.target.value)}
              placeholder="Nhập các bước chứng minh, tính toán và kết luận chi tiết..."
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-xs sm:text-sm text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
            {detailedSolution && showPreview && (
              <div className="mt-2 p-3.5 rounded-xl bg-slate-950 border border-indigo-500/40 text-xs sm:text-sm text-slate-200">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                  Xem trước lời giải:
                </span>
                <MathView content={detailedSolution} />
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isEditing ? 'Lưu Thay Đổi' : 'Tạo Câu Hỏi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
