import React from 'react';
import {
  Presentation,
  HelpCircle,
  FolderSync,
  Maximize2,
  CloudOff,
  Database,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  PlusCircle,
  LogIn,
  LogOut,
  ShieldAlert,
  Users
} from 'lucide-react';
import { MathLesson, AppUser } from '../types';

interface NavbarProps {
  currentLesson: MathLesson | null;
  activeTab: 'slides' | 'questions' | 'library';
  setActiveTab: (tab: 'slides' | 'questions' | 'library') => void;
  onOpenUpload?: () => void;
  onOpenCreateLesson?: () => void;
  onToggleFullscreen: () => void;
  isSynced: boolean;
  isOnline?: boolean;
  isSyncing?: boolean;
  currentUser: AppUser | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenAdminPanel: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLesson,
  activeTab,
  setActiveTab,
  onOpenUpload,
  onOpenCreateLesson,
  onToggleFullscreen,
  isSynced,
  isOnline = true,
  isSyncing = false,
  currentUser,
  onLogin,
  onLogout,
  onOpenAdminPanel
}) => {
  return (
    <header className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-40 shadow-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20 flex-shrink-0">
              <span className="font-mono font-black text-lg text-white">∑π</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  BÀI GIẢNG TOÁN THPT
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 tracking-wide">
                  THPT
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setActiveTab('slides')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'slides'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Soạn Bài</span>
              {currentLesson && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full border ${
                  activeTab === 'slides'
                    ? 'bg-indigo-950/90 text-indigo-200 border-indigo-400/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {currentLesson.slides.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('questions')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'questions'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Câu Hỏi Củng Cố</span>
              {currentLesson && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full border ${
                  activeTab === 'questions'
                    ? 'bg-emerald-950/90 text-emerald-200 border-emerald-400/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {currentLesson.questions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'library'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FolderSync className="w-3.5 h-3.5" />
              <span>Kho Bài Giảng</span>
            </button>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Real-time Storage & Online/Offline Status */}
            <div 
              title={
                !isOnline 
                  ? 'Chế độ ngoại tuyến (Mất mạng): Dữ liệu đang được lưu an toàn tuyệt đối trong bộ nhớ máy (IndexedDB/LocalStorage)' 
                  : isSyncing 
                    ? 'Đang đồng bộ dữ liệu vào đám mây và ổ đĩa máy chủ...' 
                    : 'Dữ liệu đã lưu an toàn bền vững (Máy & Cloud)'
              }
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                !isOnline
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                  : isSyncing
                    ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300'
                    : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
              }`}
            >
              {!isOnline ? (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="text-[11px]">Đã lưu trên máy (Ngoại tuyến)</span>
                  <Database className="w-3 h-3 text-amber-400" />
                </>
              ) : isSyncing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span className="text-[11px]">Đang lưu dữ liệu...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px]">Đã lưu an toàn (Tự động)</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </>
              )}
            </div>

            {/* Create New Lesson Button */}
            {onOpenCreateLesson && (
              <button
                onClick={onOpenCreateLesson}
                title="Soạn bài giảng mới"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Soạn Bài Mới</span>
              </button>
            )}

            {/* Admin Panel Button (STRICTLY visible to admin only) */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={onOpenAdminPanel}
                title="Quản lý thành viên, cấp mật khẩu & phân quyền hệ thống (Firestore)"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/60 text-purple-200 font-bold text-xs shadow-md shadow-purple-900/30 transition-all"
              >
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden md:inline">Quản Trị Viên</span>
              </button>
            )}

            {/* Auth / Account Profile */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
                <div
                  title={`Đang đăng nhập: ${currentUser.displayName || currentUser.username} (${currentUser.role === 'admin' ? 'Quản trị viên tối cao' : 'Thành viên giáo viên'})\nEmail: ${currentUser.email}`}
                  className="flex items-center gap-2 px-2 py-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName}
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full border border-indigo-500/50 object-cover"
                    />
                  ) : (
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      currentUser.role === 'admin'
                        ? 'bg-purple-900/50 text-purple-300 border border-purple-500/40'
                        : 'bg-indigo-900/50 text-indigo-300 border border-indigo-500/40'
                    }`}>
                      {currentUser.displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="hidden lg:flex flex-col text-left leading-none">
                    <span className="font-bold text-slate-200 text-[11px] max-w-[110px] truncate">
                      {currentUser.displayName || currentUser.username}
                    </span>
                    <span className={`text-[9px] font-semibold mt-0.5 ${
                      currentUser.role === 'admin' ? 'text-purple-400' : 'text-indigo-400'
                    }`}>
                      {currentUser.role === 'admin' ? 'Quản Trị Viên' : 'Thành Viên'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Đăng xuất khỏi hệ thống"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                title="Đăng nhập tài khoản Quản trị viên hoặc Thành viên"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng Nhập</span>
              </button>
            )}


            {/* Present Fullscreen */}
            <button
              onClick={onToggleFullscreen}
              title="Trình chiếu toàn màn hình"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex border-t border-slate-800/80 bg-slate-950/95 overflow-x-auto p-1.5 gap-1">
        <button
          onClick={() => setActiveTab('slides')}
          className={`flex-1 py-1.5 px-2 text-center text-xs font-bold rounded-xl whitespace-nowrap ${
            activeTab === 'slides' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'
          }`}
        >
          Soạn Bài
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex-1 py-1.5 px-2 text-center text-xs font-bold rounded-xl whitespace-nowrap ${
            activeTab === 'questions' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400'
          }`}
        >
          Câu Hỏi Củng Cố ({currentLesson?.questions.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`flex-1 py-1.5 px-2 text-center text-xs font-bold rounded-xl whitespace-nowrap ${
            activeTab === 'library' ? 'bg-sky-600 text-white shadow' : 'text-slate-400'
          }`}
        >
          Kho Bài Giảng
        </button>
      </div>
    </header>
  );
};
