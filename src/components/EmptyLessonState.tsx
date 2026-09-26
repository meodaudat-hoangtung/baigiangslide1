import React, { useRef } from 'react';
import {
  PlusCircle,
  Upload,
  RefreshCw,
  FolderOpen,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Layers,
  HelpCircle
} from 'lucide-react';
import { MathLesson } from '../types';

interface EmptyLessonStateProps {
  onOpenCreateModal: () => void;
  onImportLesson: (lesson: MathLesson) => void;
  onRefreshCloudSync?: () => void;
  isSyncing?: boolean;
}

export const EmptyLessonState: React.FC<EmptyLessonStateProps> = ({
  onOpenCreateModal,
  onImportLesson,
  onRefreshCloudSync,
  isSyncing = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach((l) => onImportLesson(l));
        } else if (parsed.slides && parsed.questions) {
          onImportLesson(parsed);
        } else {
          alert('File JSON không đúng định dạng bài giảng.');
        }
      } catch {
        alert('Không thể đọc file sao lưu JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8 animate-in fade-in duration-300">
      {/* Banner Intro */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Kho Dữ Liệu Trống</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Bắt Đầu Soạn Bài Giảng Mới
        </h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
          Hiện tại chưa có bài giảng nào trong kho lưu trữ của bạn. Quý thầy cô hãy bắt đầu soạn bài giảng mới hoặc khôi phục dữ liệu từ tệp sao lưu JSON.
        </p>
      </div>

      {/* Main Creation Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-950/70 via-slate-900 to-slate-900 border-2 border-indigo-500/50 shadow-2xl shadow-indigo-950/40 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center mx-auto shadow-lg">
          <PlusCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="font-bold text-xl text-white">Soạn Bài Giảng Mới</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Tùy chỉnh khối lớp (Lớp 6 – Lớp 12), đầy đủ các môn học, điền tác giả soạn giảng và khởi tạo khung slide sư phạm kèm câu hỏi củng cố.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-3 border-t border-slate-800/80 max-w-lg mx-auto">
          <div className="flex items-start gap-2 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <span>Đủ khối lớp 6 – 12 & các môn</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <span>Công thức LaTeX & Đa phương tiện</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <span>Lưu trữ đa tầng thời gian thực</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenCreateModal}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold text-sm shadow-xl shadow-indigo-500/30 inline-flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Soạn Bài Mới Ngay</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Secondary Actions: Backup Import & Cloud Sync */}
      <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors flex items-center gap-2 font-medium"
        >
          <Upload className="w-4 h-4 text-emerald-400" />
          <span>Khôi phục từ tệp sao lưu JSON trên máy</span>
        </button>

        {onRefreshCloudSync && (
          <button
            type="button"
            onClick={onRefreshCloudSync}
            disabled={isSyncing}
            className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors flex items-center gap-2 font-medium"
          >
            <RefreshCw className={`w-4 h-4 text-sky-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Kiểm tra & Đồng bộ từ Cloud Server</span>
          </button>
        )}
      </div>
    </div>
  );
};
