import React, { useRef, useState, useEffect } from 'react';
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
  Plus,
  RefreshCw,
  Edit3,
  Copy,
  Search,
  ShieldCheck,
  GraduationCap,
  User,
  ChevronDown,
  X,
  Check,
  Filter,
  Play,
  Lock,
  Crown,
} from 'lucide-react';
import { MathLesson, AppUser } from '../types';
import { EditLessonModal } from './EditLessonModal';
import { DeleteLessonModal } from './DeleteLessonModal';
import { EmptyLessonState } from './EmptyLessonState';
import { StorageService } from '../services/storageService';
import {
  GRADE_OPTIONS,
  SUBJECT_OPTIONS,
  extractLessonGradeLabel,
  extractLessonSubjectLabel,
  matchesLessonGrade,
  matchesLessonSubject,
  matchesLessonSearchQuery,
} from '../constants/curriculum';
import {
  isAdminUser,
  isLessonCreatedByUser,
  canEditLesson,
  canDeleteLesson,
  canPresentLesson,
  getLessonCreatorDisplayName,
} from '../utils/permissions';

interface LessonLibraryProps {
  lessons: MathLesson[];
  currentLessonId: string | null;
  currentUser?: AppUser | null;
  onSelectLesson: (lesson: MathLesson) => void;
  onPresentLesson?: (lesson: MathLesson) => void;
  onUpdateLesson: (updatedLesson: MathLesson) => void;
  onDeleteLesson: (lessonId: string) => void;
  onDuplicateLesson?: (lesson: MathLesson) => void;
  onImportLesson: (lesson: MathLesson) => void;
  onOpenUploadModal: () => void;
  onOpenCreateModal?: () => void;
  onRefreshCloudSync: () => void;
  isSyncing: boolean;
  isOnline?: boolean;
}

export const LessonLibrary: React.FC<LessonLibraryProps> = ({
  lessons,
  currentLessonId,
  currentUser = null,
  onSelectLesson,
  onPresentLesson,
  onUpdateLesson,
  onDeleteLesson,
  onDuplicateLesson,
  onImportLesson,
  onOpenUploadModal,
  onOpenCreateModal,
  onRefreshCloudSync,
  isSyncing,
  isOnline = true,
}) => {
  const importInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [ownershipFilter, setOwnershipFilter] = useState<'all' | 'mine'>('all');

  // Dropdown states for grade & subject filter
  const [isGradeMenuOpen, setIsGradeMenuOpen] = useState(false);
  const [isSubjectMenuOpen, setIsSubjectMenuOpen] = useState(false);
  const gradeMenuRef = useRef<HTMLDivElement>(null);
  const subjectMenuRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [editingLesson, setEditingLesson] = useState<MathLesson | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingLesson, setDeletingLesson] = useState<MathLesson | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [importNotice, setImportNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const isAdmin = isAdminUser(currentUser);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (gradeMenuRef.current && !gradeMenuRef.current.contains(event.target as Node)) {
        setIsGradeMenuOpen(false);
      }
      if (subjectMenuRef.current && !subjectMenuRef.current.contains(event.target as Node)) {
        setIsSubjectMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setImportNotice({ text, type });
    setTimeout(() => setImportNotice(null), 4000);
  };

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
          if (!isAdmin) {
            showNotice(
              'Chỉ Quản trị viên (ADMIN) mới có quyền khôi phục tệp sao lưu toàn hệ thống. Thành viên chỉ có thể nhập từng bài giảng mới của mình.',
              'error'
            );
            return;
          }
          await StorageService.importBackup(text);
          onRefreshCloudSync();
          showNotice(`Đã khôi phục thành công ${parsed.length} bài giảng vào hệ thống!`, 'success');
        } else if (parsed.slides && parsed.questions) {
          onImportLesson(parsed);
          showNotice(`Đã nhập bài giảng "${parsed.title}" thành công!`, 'success');
        } else {
          showNotice('File JSON không đúng định dạng bài giảng.', 'error');
        }
      } catch {
        showNotice('Không thể đọc file JSON.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const myLessonsCount = lessons.filter((l) => {
    if (!currentUser) return false;
    if (l.createdByUid && l.createdByUid === currentUser.uid) return true;
    if (
      l.createdByUsername &&
      currentUser.username &&
      l.createdByUsername.trim().toLowerCase() === currentUser.username.trim().toLowerCase()
    ) {
      return true;
    }
    return false;
  }).length;

  const filteredLessons = lessons.filter((lesson) => {
    const matchGrade = matchesLessonGrade(lesson, selectedGradeFilter);
    const matchSubject = matchesLessonSubject(lesson, selectedSubjectFilter);
    const matchQuery = matchesLessonSearchQuery(lesson, searchQuery);
    const matchOwnership =
      ownershipFilter === 'all'
        ? true
        : Boolean(
            currentUser &&
              ((lesson.createdByUid && lesson.createdByUid === currentUser.uid) ||
                (lesson.createdByUsername &&
                  currentUser.username &&
                  lesson.createdByUsername.trim().toLowerCase() ===
                    currentUser.username.trim().toLowerCase()))
          );
    return matchGrade && matchSubject && matchQuery && matchOwnership;
  });

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedGradeFilter !== 'all' ||
    selectedSubjectFilter !== 'all' ||
    ownershipFilter !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGradeFilter('all');
    setSelectedSubjectFilter('all');
    setOwnershipFilter('all');
  };

  // Count lessons per grade for quick filter badges
  const getGradeLessonCount = (gradeLabel: string) => {
    return lessons.filter((l) => matchesLessonGrade(l, gradeLabel)).length;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Storage Security Notification Banner */}
      {importNotice && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in ${
            importNotice.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/90 border-rose-500/50 text-rose-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{importNotice.text}</span>
        </div>
      )}

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
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
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
              <span>Bài Giảng</span>
            </h2>
            <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 font-bold text-xs border border-sky-500/30 tabular-nums">
              {lessons.length} bài giảng
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Quản lý, tìm kiếm bài soạn theo lớp & tên bài giảng, chỉnh sửa thông tin và đồng bộ đám mây.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh sync button */}
          <button
            onClick={onRefreshCloudSync}
            disabled={isSyncing}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
            title="Đồng bộ lại với cơ sở dữ liệu đám mây"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-sky-400' : ''}`} />
            <span className="hidden sm:inline">Đồng bộ</span>
          </button>

          {/* Export All button */}
          <button
            onClick={handleExportAllLessons}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
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
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Nhập bài giảng hoặc khôi phục sao lưu từ tệp JSON"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Khôi Phục JSON</span>
          </button>

          {/* Create new */}
          <button
            onClick={onOpenCreateModal || onOpenUploadModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Soạn Mới</span>
          </button>
        </div>
      </div>

      {/* Khung Tìm Kiếm Bài Soạn Theo Lớp, Theo Tên Bài Giảng (Luôn hiển thị) */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">
              Tìm Kiếm Bài Soạn Theo Lớp & Theo Tên Bài Giảng
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400 tabular-nums">
              Hiển thị <strong className="text-white">{filteredLessons.length}</strong> / {lessons.length} bài soạn
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Xóa bộ lọc</span>
              </button>
            )}
          </div>
        </div>

        {/* Hàng điều khiển tìm kiếm: Ô nhập tên bài giảng + Dropdown chọn Lớp (6-12) + Dropdown chọn Môn */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* 1. Ô tìm kiếm theo tên bài giảng */}
          <div className="md:col-span-6 flex items-center gap-2.5 bg-slate-950/90 px-3.5 py-2.5 rounded-2xl border border-slate-700/80 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all">
            <Search className="w-4 h-4 text-indigo-400 shrink-0" />
            <input
              type="text"
              placeholder="Nhập tên bài giảng, tên lớp, môn học hoặc tác giả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent flex-1 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Xóa từ khóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2. Dropdown Chọn Lớp (Lớp 6 đến Lớp 12) */}
          <div className="md:col-span-3 relative" ref={gradeMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsGradeMenuOpen((prev) => !prev);
                setIsSubjectMenuOpen(false);
              }}
              className={`w-full h-full px-3.5 py-2.5 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-2 transition-all cursor-pointer ${
                selectedGradeFilter !== 'all'
                  ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200'
                  : 'bg-slate-950/90 border-slate-700/80 hover:border-slate-600 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="truncate">
                  {selectedGradeFilter === 'all' ? 'Tất cả khối lớp (6 – 12)' : selectedGradeFilter}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                  isGradeMenuOpen ? 'rotate-180 text-indigo-400' : ''
                }`}
              />
            </button>

            {isGradeMenuOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="max-h-64 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGradeFilter('all');
                      setIsGradeMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between cursor-pointer ${
                      selectedGradeFilter === 'all'
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span>Tất cả các lớp (Lớp 6 – 12)</span>
                    <span className="text-[11px] font-mono opacity-80">{lessons.length}</span>
                  </button>
                  {GRADE_OPTIONS.map((g) => {
                    const count = getGradeLessonCount(g.label);
                    const isSelected = selectedGradeFilter === g.label;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          setSelectedGradeFilter(g.label);
                          setIsGradeMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                            {g.levelGroup}
                          </span>
                          <span>{g.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono opacity-75">{count} bài</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. Dropdown Chọn Môn Học */}
          <div className="md:col-span-3 relative" ref={subjectMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsSubjectMenuOpen((prev) => !prev);
                setIsGradeMenuOpen(false);
              }}
              className={`w-full h-full px-3.5 py-2.5 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-2 transition-all cursor-pointer ${
                selectedSubjectFilter !== 'all'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                  : 'bg-slate-950/90 border-slate-700/80 hover:border-slate-600 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">
                  {selectedSubjectFilter === 'all' ? 'Tất cả môn học' : selectedSubjectFilter}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                  isSubjectMenuOpen ? 'rotate-180 text-emerald-400' : ''
                }`}
              />
            </button>

            {isSubjectMenuOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="max-h-64 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSubjectFilter('all');
                      setIsSubjectMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between cursor-pointer ${
                      selectedSubjectFilter === 'all'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span>Tất cả môn học (Lớp 6 – 12)</span>
                    {selectedSubjectFilter === 'all' && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                  {SUBJECT_OPTIONS.map((s) => {
                    const isSelected = selectedSubjectFilter === s.name;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedSubjectFilter(s.name);
                          setIsSubjectMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate pr-2">{s.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Thanh chọn nhanh Khối Lớp (Lớp 6 đến Lớp 12) + Bộ lọc bài của tôi */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-indigo-400" />
              <span>Lọc nhanh theo lớp:</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedGradeFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedGradeFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/70'
              }`}
            >
              Tất cả ({lessons.length})
            </button>
            {GRADE_OPTIONS.map((g) => {
              const count = getGradeLessonCount(g.label);
              const isSelected = selectedGradeFilter === g.label;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() =>
                    setSelectedGradeFilter(isSelected ? 'all' : g.label)
                  }
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/70'
                  }`}
                >
                  <span>{g.label}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                        isSelected ? 'bg-indigo-900 text-indigo-100' : 'bg-slate-900 text-indigo-300'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bộ lọc Quyền sở hữu bài soạn */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setOwnershipFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                ownershipFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/70'
              }`}
            >
              Tất cả bài giảng ({lessons.length})
            </button>
            <button
              type="button"
              onClick={() => setOwnershipFilter('mine')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                ownershipFilter === 'mine'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/70'
              }`}
            >
              <User className="w-3 h-3" />
              <span>Bài do tôi soạn ({myLessonsCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* RBAC Data Security Notice Banner */}
      <div
        className={`rounded-2xl p-3.5 border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isAdmin
            ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
            : 'bg-indigo-950/30 border-indigo-500/30 text-indigo-200'
        }`}
      >
        <div className="flex items-start sm:items-center gap-2.5">
          {isAdmin ? (
            <Crown className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 sm:mt-0" />
          )}
          <div>
            {isAdmin ? (
              <span>
                <strong>Quyền Quản Trị Viên Cao Nhất (ADMIN):</strong> Bạn có toàn quyền quyết định, chỉnh sửa, trình chiếu và xóa bất kỳ bài giảng, slide hay câu hỏi củng cố nào trên toàn hệ thống.
              </span>
            ) : (
              <span>
                <strong>Chế Độ Bảo Vệ Dữ Liệu Thành Viên:</strong> Bạn có quyền <strong>Soạn bài giảng mới</strong>, <strong>Soạn câu hỏi củng cố mới</strong>, <strong>Trình chiếu mọi bài giảng</strong> (của bạn và của thành viên khác), và chỉ được <strong>chỉnh sửa / xóa</strong> bài giảng hoặc câu hỏi củng cố do chính bạn biên soạn.
              </span>
            )}
          </div>
        </div>
      </div>

      {lessons.length === 0 ? (
        <EmptyLessonState
          onOpenCreateModal={onOpenCreateModal || onOpenUploadModal}
          onImportLesson={onImportLesson}
          onRefreshCloudSync={onRefreshCloudSync}
          isSyncing={isSyncing}
        />
      ) : (
        <>
          {/* Lesson Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLessons.map((lesson) => {
              const isActive = currentLessonId === lesson.id;
              const gradeLabel = extractLessonGradeLabel(lesson);
              const subjectLabel = extractLessonSubjectLabel(lesson);
              const userCanEdit = canEditLesson(lesson, currentUser);
              const userCanDelete = canDeleteLesson(lesson, currentUser);
              const userCanPresent = canPresentLesson(lesson, currentUser);
              const isOwnedByCurrentMember =
                Boolean(
                  currentUser &&
                    ((lesson.createdByUid && lesson.createdByUid === currentUser.uid) ||
                      (lesson.createdByUsername &&
                        currentUser.username &&
                        lesson.createdByUsername.trim().toLowerCase() ===
                          currentUser.username.trim().toLowerCase()))
                );
              const creatorDisplay = getLessonCreatorDisplayName(lesson);

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
                    {/* Header Metadata: Grade, Subject & Active status */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 gap-2">
                      <div className="flex items-center gap-1.5 min-w-0 text-xs font-semibold text-indigo-300 truncate">
                        <span>{gradeLabel || lesson.grade}</span>
                        {subjectLabel && (
                          <>
                            <span className="text-slate-600" aria-hidden="true">·</span>
                            <span className="text-emerald-300 truncate">{subjectLabel}</span>
                          </>
                        )}
                      </div>
                      {isActive ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold shrink-0 whitespace-nowrap">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đang mở
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 shrink-0 whitespace-nowrap tabular-nums">
                          <Calendar className="w-3 h-3" />
                          {new Date(lesson.updatedAt || lesson.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>

                    {/* Lesson Title */}
                    <h3 className="font-bold text-base text-white line-clamp-2 mb-1.5 group-hover:text-indigo-300 transition-colors">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1 mb-2.5">
                      {lesson.chapterOrTopic}
                    </p>

                    {/* Author & Ownership Permission Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 text-xs text-sky-300 min-w-0">
                        <User className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="truncate">Tác giả: {creatorDisplay}</span>
                      </div>

                      {isAdmin ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold shrink-0">
                          Admin Toàn Quyền
                        </span>
                      ) : isOwnedByCurrentMember ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold shrink-0">
                          Bài của bạn • Được Sửa & Xóa
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-semibold flex items-center gap-1 shrink-0">
                          <Lock className="w-2.5 h-2.5 text-amber-400" />
                          <span>Chỉ Trình Chiếu</span>
                        </span>
                      )}
                    </div>

                    {/* Features count */}
                    <div className="flex items-center gap-3 text-xs text-slate-300 mb-4 tabular-nums">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{lesson.slides.length} Slides</span>
                      </span>
                      <span className="text-slate-600" aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{lesson.questions.length} Câu hỏi</span>
                      </span>
                    </div>
                  </div>

                  {/* Bottom Card Actions: Present (All logged-in users), Edit/Duplicate/Delete (Only Admin or Creator) */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs gap-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Trình Chiếu Button (Allowed for all logged-in users on all lessons) */}
                      {userCanPresent && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onPresentLesson) {
                              onPresentLesson(lesson);
                            } else {
                              onSelectLesson(lesson);
                            }
                          }}
                          title="Trình chiếu bài giảng này"
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span className="text-[11px]">Trình chiếu</span>
                        </button>
                      )}

                      {/* Edit Lesson Info (Strictly Admin or Lesson Creator) */}
                      {userCanEdit && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingLesson(lesson);
                            setIsEditModalOpen(true);
                          }}
                          title="Chỉnh sửa thông tin bài giảng"
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 border border-slate-700/80 flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="text-[11px] hidden sm:inline">Sửa</span>
                        </button>
                      )}

                      {/* Duplicate Lesson (Strictly Admin or Lesson Creator) */}
                      {userCanEdit && onDuplicateLesson && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateLesson(lesson);
                          }}
                          title="Tạo bản sao bài giảng"
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5 text-sky-400" />
                          <span className="text-[11px] hidden sm:inline">Sao chép</span>
                        </button>
                      )}

                      {/* Export JSON (Only Admin or Lesson Creator) */}
                      {userCanEdit && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportLesson(lesson);
                          }}
                          title="Xuất file JSON sao lưu"
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[11px] hidden sm:inline">JSON</span>
                        </button>
                      )}
                    </div>

                    {/* Delete Lesson (Strictly Admin or Lesson Creator) */}
                    {userCanDelete ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingLesson(lesson);
                          setIsDeleteModalOpen(true);
                        }}
                        title="Xóa bài giảng khỏi kho"
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-slate-700/80 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span
                        onClick={(e) => e.stopPropagation()}
                        title="Thành viên không có quyền chỉnh sửa hoặc xóa bài giảng do người khác soạn"
                        className="px-2 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-500 text-[10px] flex items-center gap-1 select-none"
                      >
                        <Lock className="w-3 h-3 text-slate-500" />
                        <span>Bảo vệ</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty Search Result */}
          {filteredLessons.length === 0 && (
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <p className="text-sm text-slate-300 font-semibold">
                Không tìm thấy bài soạn nào phù hợp với điều kiện lọc hiện tại
              </p>
              <p className="text-xs text-slate-500">
                {searchQuery && `Từ khóa: "${searchQuery}" `}
                {selectedGradeFilter !== 'all' && `• Khối lớp: ${selectedGradeFilter} `}
                {selectedSubjectFilter !== 'all' && `• Môn học: ${selectedSubjectFilter}`}
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Hiển thị tất cả bài giảng
              </button>
            </div>
          )}
        </>
      )}

      {/* Edit Lesson Modal (Strictly guarded by canEditLesson) */}
      <EditLessonModal
        isOpen={isEditModalOpen && canEditLesson(editingLesson, currentUser)}
        lesson={editingLesson}
        onClose={() => setIsEditModalOpen(false)}
        onSave={(updated) => {
          if (canEditLesson(editingLesson, currentUser)) {
            onUpdateLesson(updated);
          }
        }}
      />

      {/* Delete Lesson Modal (Strictly guarded by canDeleteLesson) */}
      <DeleteLessonModal
        isOpen={isDeleteModalOpen && canDeleteLesson(deletingLesson, currentUser)}
        lesson={deletingLesson}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          if (deletingLesson && canDeleteLesson(deletingLesson, currentUser)) {
            onDeleteLesson(deletingLesson.id);
          }
        }}
      />
    </div>
  );
};
