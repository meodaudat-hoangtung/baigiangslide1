import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Sliders,
  AlertCircle,
  CheckCircle2,
  Trash2,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Plus,
  RefreshCw,
  Clock
} from 'lucide-react';
import { GenerationConfig, MathLesson } from '../types';
import { SAMPLE_LESSONS } from '../data/sampleLessons';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLessonGenerated: (lesson: MathLesson) => void;
}

// Client-side image compression helper to reduce upload payload and Gemini token consumption
async function compressImage(file: File): Promise<{ base64: string; sizeText: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 1600;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          const sizeMB = (compressedBase64.length * (3 / 4) / (1024 * 1024)).toFixed(2);
          resolve({ base64: compressedBase64, sizeText: `${sizeMB} MB` });
        } else {
          resolve({ base64: e.target?.result as string, sizeText: `${(file.size / 1024 / 1024).toFixed(2)} MB` });
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onLessonGenerated,
}) => {
  const [images, setImages] = useState<{ id: string; base64: string; name: string; size: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState<number>(10);
  const [numMultipleChoice, setNumMultipleChoice] = useState<number>(3);
  const [numTrueFalse, setNumTrueFalse] = useState<number>(3);
  const [numShortAnswer, setNumShortAnswer] = useState<number>(2);
  const [numEssay, setNumEssay] = useState<number>(2);
  const [targetGrade, setTargetGrade] = useState<string>('Toán Lớp 8 - Cánh Diều / Kết Nối Tri Thức');
  const [teachingGoal, setTeachingGoal] = useState<'standard' | 'exam_prep' | 'concept_mastery' | 'advanced'>('concept_mastery');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isQuotaError, setIsQuotaError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Auto-adjust distribution when total questions changes
  const handleTotalQuestionsChange = (newTotal: number) => {
    setTotalQuestions(newTotal);
    // Evenly distribute among 4 types with max 5 per type
    const mc = Math.min(5, Math.ceil(newTotal * 0.35));
    const tf = Math.min(5, Math.floor(newTotal * 0.25));
    const sa = Math.min(5, Math.floor(newTotal * 0.2));
    const es = Math.max(0, Math.min(5, newTotal - (mc + tf + sa)));
    setNumMultipleChoice(mc);
    setNumTrueFalse(tf);
    setNumShortAnswer(sa);
    setNumEssay(es);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setErrorMessage(null);
    setIsQuotaError(false);

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Vui lòng chỉ tải lên file hình ảnh (PNG, JPG, JPEG, WEBP).');
        continue;
      }
      try {
        const { base64, sizeText } = await compressImage(file);
        setImages((prev) => [
          ...prev,
          {
            id: 'img-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            base64,
            name: file.name,
            size: sizeText,
          },
        ]);
      } catch (err) {
        console.error('Error processing image:', err);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const loadSampleGeometryImage = () => {
    // Generate a high-contrast canvas image representing a math textbook page for demo
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 900, 1200);

      // Header
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 36px Arial';
      ctx.fillText('BÀI 3: ĐỊNH LÝ PYTHAGORE (PYTAGO)', 50, 70);

      ctx.fillStyle = '#475569';
      ctx.font = '22px Arial';
      ctx.fillText('1. Định lý Pythagore trong tam giác vuông', 50, 130);

      ctx.fillStyle = '#0f172a';
      ctx.font = '20px Arial';
      ctx.fillText('Trong một tam giác vuông, bình phương của cạnh huyền bằng tổng', 50, 180);
      ctx.fillText('các bình phương của hai cạnh góc vuông.', 50, 215);

      // Formula box
      ctx.fillStyle = '#f0fdf4';
      ctx.fillRect(50, 250, 800, 100);
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 250, 800, 100);

      ctx.fillStyle = '#15803d';
      ctx.font = 'bold 28px Arial';
      ctx.fillText('BC² = AB² + AC²  hoặc  a² + b² = c²', 80, 310);

      // Triangle diagram
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(120, 600); // A (Right angle)
      ctx.lineTo(420, 600); // B
      ctx.lineTo(120, 420); // C
      ctx.closePath();
      ctx.stroke();

      // Right angle square
      ctx.strokeRect(120, 570, 30, 30);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 22px Arial';
      ctx.fillText('A (90°)', 80, 630);
      ctx.fillText('B (cạnh c = 4cm)', 430, 610);
      ctx.fillText('C (cạnh b = 3cm)', 90, 410);
      ctx.fillText('Cạnh huyền a = 5cm', 280, 490);

      // Textbook Example
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('2. Ví dụ áp dụng tính độ dài cạnh', 50, 720);

      ctx.font = '20px Arial';
      ctx.fillText('Ví dụ: Cho tam giác vuông ABC có AB = 6cm, AC = 8cm.', 50, 770);
      ctx.fillText('Tính độ dài cạnh huyền BC.', 50, 805);
      ctx.fillText('Giải: Ta có BC² = AB² + AC² = 6² + 8² = 36 + 64 = 100.', 50, 850);
      ctx.fillText('=> BC = √100 = 10 cm.', 50, 890);

      // 3. Reverse theorem
      ctx.font = 'bold 24px Arial';
      ctx.fillText('3. Định lý Pythagore đảo', 50, 960);
      ctx.font = '20px Arial';
      ctx.fillText('Nếu một tam giác có bình phương một cạnh bằng tổng bình phương', 50, 1010);
      ctx.fillText('hai cạnh kia thì tam giác đó là tam giác vuông.', 50, 1045);

      const demoBase64 = canvas.toDataURL('image/jpeg', 0.9);
      setImages((prev) => [
        ...prev,
        {
          id: 'sample-math-' + Date.now(),
          base64: demoBase64,
          name: 'Trang_SGK_Dinh_Ly_Pythagore.jpg',
          size: '0.45 MB (Mẫu demo)',
        },
      ]);
    }
  };

  const handleGenerate = async () => {
    if (images.length === 0) {
      setErrorMessage('Vui lòng tải lên ít nhất 1 hình ảnh trang sách giáo khoa toán.');
      return;
    }

    const currentSum = numMultipleChoice + numTrueFalse + numShortAnswer + numEssay;
    if (currentSum === 0) {
      setErrorMessage('Vui lòng chọn ít nhất 1 câu hỏi luyện tập.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const config: GenerationConfig = {
      totalQuestions: currentSum,
      numMultipleChoice,
      numTrueFalse,
      numShortAnswer,
      numEssay,
      targetGrade,
      teachingGoal,
    };

    try {
      setLoadingStep('1/4: Đang đọc và trích xuất ký hiệu công thức toán từ ảnh SGK...');
      setTimeout(() => {
        setLoadingStep('2/4: Đang thiết kế cấu trúc Slide bài giảng điện tử tương tác...');
      }, 2500);
      setTimeout(() => {
        setLoadingStep('3/4: Đang biên soạn bộ câu hỏi luyện tập 4 dạng (ABCD, Đúng/Sai, Trả lời ngắn, Tự luận)...');
      }, 5500);
      setTimeout(() => {
        setLoadingStep('4/4: Đang tổng hợp công thức vàng, sơ đồ tư duy & mẹo ghi nhớ...');
      }, 8500);

      const response = await fetch('/api/analyze-math-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: images.map((img) => ({
            base64: img.base64,
            mimeType: 'image/jpeg',
            name: img.name,
          })),
          config,
          additionalNotes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorText = typeof data.error === 'string' ? data.error : JSON.stringify(data.error || 'Có lỗi xảy ra');
        if (errorText.includes('429') || errorText.includes('quota') || errorText.includes('RESOURCE_EXHAUSTED')) {
          setIsQuotaError(true);
        }
        throw new Error(errorText);
      }

      if (data.lesson) {
        onLessonGenerated(data.lesson);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.message || 'Không thể kết nối với máy chủ AI. Vui lòng kiểm tra lại.';
      if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('Hạn ngạch')) {
        setIsQuotaError(true);
        setErrorMessage(
          'Hạn ngạch miễn phí (Free-tier Quota 429) của mô hình Gemini tạm thời đạt giới hạn lượt gọi trong ngày. Hệ thống đã tích hợp chế độ dự phòng thông minh: Quý thầy cô có thể bấm "Thử Lại" hoặc chọn "Khởi tạo nhanh bài giảng mẫu SGK" để tiếp tục giảng dạy ngay!'
        );
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleUseFallbackSample = (sampleIndex = 0) => {
    const sample = SAMPLE_LESSONS[sampleIndex] || SAMPLE_LESSONS[0];
    onLessonGenerated(sample);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Soạn Bài Giảng Toán Học Tự Động</h2>
              <p className="text-xs text-slate-400">
                Phân tích ảnh chụp sách giáo khoa → Tạo Slide + {totalQuestions} Câu hỏi (4 dạng)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-3">
              <div className="flex items-start gap-3 text-rose-300 text-xs leading-relaxed">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-rose-200 mb-1">{isQuotaError ? 'Thông báo về Hạn ngạch API (Rate Limit / Quota 429)' : 'Đã xảy ra sự cố'}</p>
                  <p>{errorMessage}</p>
                </div>
              </div>

              {isQuotaError && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rose-500/20">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Thử Lại Ngay
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUseFallbackSample(0)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Tải Bài Giảng Mẫu: Định Lý Pythagore
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUseFallbackSample(1)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Tải Bài Giảng Mẫu: PT Bậc Hai
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Section 1: Upload Images */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                <span>1. Tải Lên Hình Ảnh Trang Sách Giáo Khoa Toán</span>
                <span className="text-xs font-normal text-slate-400">({images.length} ảnh đã chọn)</span>
              </label>
              <button
                type="button"
                onClick={loadSampleGeometryImage}
                className="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Dùng ảnh mẫu SGK Toán 8
              </button>
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-800/40 hover:bg-slate-800/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-200">
                  Kéo thả hoặc bấm để chọn ảnh chụp sách giáo khoa toán
                </p>
                <p className="text-xs text-slate-400">
                  Hỗ trợ PNG, JPG, JPEG, WEBP. Có thể chọn nhiều trang liên tiếp.
                </p>
              </div>
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-800 shadow"
                  >
                    <img
                      src={img.base64}
                      alt={img.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-24 object-cover"
                    />
                    <div className="p-1.5 bg-slate-900/90 text-[10px] text-slate-300 truncate">
                      {img.name}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(img.id);
                      }}
                      className="absolute top-1 right-1 p-1 rounded-md bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Question count & distribution */}
          <div className="bg-slate-800/60 p-5 rounded-xl border border-slate-700/60 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>2. Cấu Hình Bộ Câu Hỏi Luyện Tập (Từ 5 đến 15 câu)</span>
              </label>
              <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                Tổng: {numMultipleChoice + numTrueFalse + numShortAnswer + numEssay} câu
              </div>
            </div>

            {/* Total Questions Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Số lượng câu hỏi mong muốn:</span>
                <span className="font-semibold text-white">{totalQuestions} câu</span>
              </div>
              <input
                type="range"
                min="5"
                max="15"
                value={totalQuestions}
                onChange={(e) => handleTotalQuestionsChange(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>5 câu</span>
                <span>10 câu</span>
                <span>15 câu</span>
              </div>
            </div>

            {/* 4 Question Types Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {/* Type 1: Multiple choice ABCD */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-indigo-300">Trắc nghiệm ABCD</span>
                  <span className="font-bold text-white bg-indigo-500/20 px-2 py-0.5 rounded text-[11px]">
                    {numMultipleChoice} câu
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={numMultipleChoice}
                  onChange={(e) => setNumMultipleChoice(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <p className="text-[10px] text-slate-400">4 phương án, 1 đáp án đúng (tối đa 5)</p>
              </div>

              {/* Type 2: True / False */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-emerald-300">Trắc nghiệm Đúng/Sai</span>
                  <span className="font-bold text-white bg-emerald-500/20 px-2 py-0.5 rounded text-[11px]">
                    {numTrueFalse} câu
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={numTrueFalse}
                  onChange={(e) => setNumTrueFalse(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <p className="text-[10px] text-slate-400">4 ý khẳng định per câu (tối đa 5)</p>
              </div>

              {/* Type 3: Short answer */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-amber-300">Trả lời ngắn</span>
                  <span className="font-bold text-white bg-amber-500/20 px-2 py-0.5 rounded text-[11px]">
                    {numShortAnswer} câu
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={numShortAnswer}
                  onChange={(e) => setNumShortAnswer(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <p className="text-[10px] text-slate-400">Điền số/biểu thức (tối đa 5)</p>
              </div>

              {/* Type 4: Essay */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-cyan-300">Tự luận & Biểu điểm</span>
                  <span className="font-bold text-white bg-cyan-500/20 px-2 py-0.5 rounded text-[11px]">
                    {numEssay} câu
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={numEssay}
                  onChange={(e) => setNumEssay(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <p className="text-[10px] text-slate-400">Kèm rubric chấm từng bước (tối đa 5)</p>
              </div>
            </div>
          </div>

          {/* Section 3: Grade & Teaching Goals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                Khối Lớp & Bộ Sách
              </label>
              <select
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Toán Lớp 6 - Kết Nối Tri Thức / Cánh Diều">Toán Lớp 6</option>
                <option value="Toán Lớp 7 - Kết Nối Tri Thức / Cánh Diều">Toán Lớp 7</option>
                <option value="Toán Lớp 8 - Kết Nối Tri Thức / Cánh Diều">Toán Lớp 8</option>
                <option value="Toán Lớp 9 - Ôn Thi Tuyển Sinh Vào 10">Toán Lớp 9 (Luyện thi vào 10)</option>
                <option value="Toán Lớp 10 - Chương Trình Mới 2018">Toán Lớp 10</option>
                <option value="Toán Lớp 11 - Đại Số & Hình Không Gian">Toán Lớp 11</option>
                <option value="Toán Lớp 12 - Giải Tích & Khối Đa Diện (Thi THPT QG)">Toán Lớp 12 (Ôn thi THPT QG)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                Định Hướng Giảng Dạy
              </label>
              <select
                value={teachingGoal}
                onChange={(e) => setTeachingGoal(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="concept_mastery">Khắc sâu bản chất & Khái niệm cốt lõi</option>
                <option value="standard">Tiết dạy chuẩn phân phối chương trình</option>
                <option value="exam_prep">Luyện kỹ năng & Dạng bài thi học kỳ</option>
                <option value="advanced">Nâng cao & Mở rộng phát triển tư duy</option>
              </select>
            </div>
          </div>

          {/* Optional Teacher Guidance */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Ghi Chú Hoặc Yêu Cầu Riêng Của Thầy/Cô (Tùy chọn)
            </label>
            <input
              type="text"
              placeholder="VD: Nhấn mạnh phần chứng minh hình học, thêm ví dụ thực tế về xây dựng..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {isLoading && (
              <div className="flex items-center gap-2 text-indigo-400 font-medium animate-pulse">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                <span>{loadingStep || 'Đang xử lý nội dung toán học...'}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading || images.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'Đang Phân Tích & Tạo Bài...' : 'Tiến Hành Phân Tích & Tạo Bài Giảng'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
