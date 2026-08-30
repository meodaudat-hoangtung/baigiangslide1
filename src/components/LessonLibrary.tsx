import React, { useRef, useState } from 'react';
import {
  FolderSync,
  BookOpen,
  Calendar,
  Layers,
  HelpCircle,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  Sparkles,
  Plus,
  RefreshCw,
  Edit3,
  Copy,
  Search,
  ShieldCheck,
  HardDrive
} from 'lucide-react';
import { MathLesson } from '../types';
import { EditLessonModal } from './EditLessonModal';
import { DeleteLessonModal } from './DeleteLessonModal';
import { StorageService } from '../services/storageService';

interface LessonLibraryProps {
  lessons: MathLesson[];
  currentLessonId: string | null;
  onSelectLesson: (lesson: MathLesson) => void;
  onUpdateLesson: (updatedLesson: MathLesson) => void;
  onDeleteLesson: (lessonId: string) => void;
  onDuplicateLesson?: (lesson: MathLesson) => void;
  onImportLesson: (lesson: MathLesson) => void;
  onOpenUploadModal: () => void;
  onRefreshCloudSync: () => void;
  isSyncing: boolean;
  isOnline?: boolean;
}

export const LessonLibrary: React.FC<LessonLibraryProps> = ({
  lessons,
  currentLessonId,
  onSelectLesson,
  onUpdateLesson,
  onDeleteLesson,
  onDuplicateLesson,
  onImportLesson,
  onOpenUploadModal,
  onRefreshCloudSync,
  isSyncing,
  isOnline = true,
}) => {
  const importInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [editingLesson, setEditingLesson] = useState<MathLesson | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingLesson, setDeletingLesson] = useState<MathLesson | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleExportLesson = (lesson: MathLesson) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(lesson, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${lesson.title.replace(/\s+/g, '_')}.mathlesson.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportAllLessons = () => {
    StorageService.exportBackup(lessons);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          // Bulk import
          await StorageService.importBackup(text);
          onRefreshCloudSync();
          alert(`Đã khôi phục thành công ${parsed.length} bài giảng vào hệ thống!`);
        } else if (parsed.slides && parsed.questions) {
          // Single lesson import
          onImportLesson(parsed);
          alert(`Đã nhập bài giảng "${parsed.title}" thành công!`);
        } else {
          alert('File JSON không đúng định dạng bài giảng MathSlide.');
        }
      } catch {
        alert('Không thể đọc file JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredLessons = lessons.filter((l) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      l.title.toLowerCase().includes(q) ||
      l.chapterOrTopic.toLowerCase().includes(q) ||
      l.grade.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Storage Security Notification Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-white text-sm flex items-center gap-2">
              <span>Bảo Vệ & Lưu Trữ Dữ Liệu Tự Động</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] uppercase font-mono">
                {isOnline ? 'Cloud & Local DB' : 'Offline Local DB'}
              </span>
            </p>
            <p className="text-slate-400 mt-0.5">
              Mọi nội dung bài giảng, slide và câu hỏi đều được tự động lưu đa tầng (IndexedDB, LocalStorage & Cloud Disk). Cho dù bạn mất mạng hoặc tải lại trang web, dữ liệu vẫn được bảo toàn nguyên vẹn 100% và chỉ bị xóa khi bạn chủ động xóa bài giảng.
            </p>
          </div>
        </div>
        <button
          onClick={handleExportAllLessons}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold whitespace-nowrap transition-colors"
          title="Tải tệp sao lưu toàn bộ kho bài giảng về máy"
        >
          <Download className="w-3.5 h-3.5 text-sky-400" />
          <span>Sao Lưu Tất Cả (JSON)</span>
        </button>
      </div>

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
              <FolderSync className="w-6 h-6 text-sky-400" />
              <span>Kho Bài Giảng</span>
            </h2>
            <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 font-bold text-xs border border-sky-500/30">
              {lessons.length} bài giảng
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Quản lý, chỉnh sửa thông tin, xóa bài giảng, sao lưu đám mây và chuyển đổi linh hoạt.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh sync button */}
          <button
            onClick={onRefreshCloudSync}
            disabled={isSyncing}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5 text-xs"
            title="Đồng bộ lại với cơ sở dữ liệu đám mây"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-sky-400' : ''}`} />
            <span className="hidden sm:inline">Đồng bộ</span>
          </button>

          {/* Export All button */}
          <button
            onClick={handleExportAllLessons}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Xuất bản sao lưu toàn bộ bài giảng (JSON)"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Sao Lưu</span>
          </button>

          {/* Import file */}
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileImport}
          />
          <button
            onClick={() => importInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Nhập bài giảng hoặc khôi phục sao lưu từ tệp JSON"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Khôi Phục JSON</span>
          </button>

          {/* Create new */}
          <button
            onClick={onOpenUploadModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Soạn Bài Mới</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      {lessons.length > 2 && (
        <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
          <Search className="w-4 h-4 text-slate-500 ml-2" />
          <input
            type="text"
            placeholder="Tìm kiếm bài giảng theo tên, khối lớp hoặc chủ đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent flex-1 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-500 hover:text-slate-300 mr-2"
            >
              Xóa tìm
            </button>
          )}
        </div>
      )}

      {/* Lesson Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLessons.map((lesson) => {
          const isActive = currentLessonId === lesson.id;

          return (
            <div
              key={lesson.id}
              onClick={() => onSelectLesson(lesson)}
              className={`p-5 rounded-3xl border cursor-pointer transition-all duration-200 flex flex-col justify-between shadow-xl group relative ${
                isActive
                  ? 'bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-900 border-indigo-500 shadow-indigo-500/20 ring-2 ring-indigo-500/40'
                  : 'bg-slate-900/90 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Badge & Active indicator */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700 truncate max-w-[180px]">
                    {lesson.grade}
                  </span>
                  {isActive ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đang dạy
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(lesson.updatedAt || lesson.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                </div>

                {/* Lesson Title */}
                <h3 className="font-bold text-base text-white line-clamp-2 mb-1.5 group-hover:text-indigo-300 transition-colors">
                  {lesson.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-1 mb-4">
                  {lesson.chapterOrTopic}
                </p>

                {/* Features count pills */}
                <div className="flex items-center gap-2 text-xs text-slate-300 mb-4">
                  <span className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-indigo-400" />
                    {lesson.slides.length} Slides
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-emerald-400" />
                    {lesson.questions.length} Câu hỏi
                  </span>
                </div>
              </div>

              {/* Bottom Card Actions: Edit, Duplicate, Export, Delete */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs gap-1">
                <div className="flex items-center gap-1">
                  {/* Edit Lesson Info */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingLesson(lesson);
                      setIsEditModalOpen(true);
                    }}
                    title="Chỉnh sửa thông tin bài giảng"
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 border border-slate-700/80 flex items-center gap-1 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="text-[11px] hidden sm:inline">Sửa</span>
                  </button>

                  {/* Duplicate Lesson */}
                  {onDuplicateLesson && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateLesson(lesson);
                      }}
                      title="Tạo bản sao bài giảng"
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 flex items-center gap-1 transition-all"
                    >
                      <Copy className="w-3.5 h-3.5 text-sky-400" />
                      <span className="text-[11px] hidden sm:inline">Sao chép</span>
                    </button>
                  )}

                  {/* Export JSON */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportLesson(lesson);
                    }}
                    title="Xuất file JSON sao lưu"
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 flex items-center gap-1 transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] hidden sm:inline">JSON</span>
                  </button>
                </div>

                {/* Delete Lesson */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingLesson(lesson);
                    setIsDeleteModalOpen(true);
                  }}
                  title="Xóa bài giảng khỏi kho"
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-slate-700/80 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty Search Result */}
      {filteredLessons.length === 0 && (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <p className="text-sm text-slate-400">Không tìm thấy bài giảng nào khớp với từ khóa "{searchQuery}"</p>
          <button
            onClick={() => setSearchQuery('')}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs"
          >
            Hiển thị tất cả
          </button>
        </div>
      )}

      {/* Edit Lesson Modal */}
      <EditLessonModal
        isOpen={isEditModalOpen}
        lesson={editingLesson}
        onClose={() => setIsEditModalOpen(false)}
        onSave={(updated) => {
          onUpdateLesson(updated);
        }}
      />

      {/* Delete Lesson Modal */}
      <DeleteLessonModal
        isOpen={isDeleteModalOpen}
        lesson={deletingLesson}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          if (deletingLesson) {
            onDeleteLesson(deletingLesson.id);
          }
        }}
      />
    </div>
  );
};
