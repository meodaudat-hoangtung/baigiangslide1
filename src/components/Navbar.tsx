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
  const cleanAdminName = currentUser
    ? (currentUser.displayName || currentUser.username).replace(/Quản Trị Viên/g, 'Quản Trị')
    : '';

  return (
    <header className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 backdrop-blur-xl border-b border-emerald-400/60 sticky top-0 z-40 shadow-xl shadow-emerald-950/20 transition-all text-white">
      <div className="w-full px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-3 flex-nowrap overflow-x-auto custom-scrollbar-none">
          {/* Brand & App Title */}
          <div className="flex items-center gap-2.5 shrink-0 whitespace-nowrap">
            <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-lg shadow-emerald-900/30 ring-1 ring-white/30 shrink-0">
              <span className="font-mono font-black text-base text-white">∑π</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
              <span className="font-extrabold text-sm sm:text-base lg:text-lg tracking-tight text-white drop-shadow-sm whitespace-nowrap">
                BÀI GIẢNG TOÁN THPT
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-800/80 text-emerald-100 border border-emerald-300/40 tracking-wide shrink-0 whitespace-nowrap">
                THPT
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-emerald-800/70 p-1.5 rounded-2xl border border-emerald-400/40 shadow-inner backdrop-blur-md shrink-0 whitespace-nowrap">
            <button
              onClick={() => setActiveTab('slides')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                activeTab === 'slides'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                  : 'text-emerald-100 hover:text-white hover:bg-emerald-700/60'
              }`}
            >
              <Presentation className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">Soạn</span>
              {currentLesson && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full border shrink-0 whitespace-nowrap ${
                  activeTab === 'slides'
                    ? 'bg-indigo-950/90 text-indigo-200 border-indigo-400/40'
                    : 'bg-emerald-900/80 text-emerald-200 border-emerald-500/40'
                }`}>
                  {currentLesson.slides.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('questions')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                activeTab === 'questions'
                  ? 'bg-emerald-950 text-emerald-100 border border-emerald-400/50 shadow-md'
                  : 'text-emerald-100 hover:text-white hover:bg-emerald-700/60'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">Củng cố</span>
              {currentLesson && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full border shrink-0 whitespace-nowrap ${
                  activeTab === 'questions'
                    ? 'bg-emerald-900 text-emerald-200 border-emerald-400/40'
                    : 'bg-emerald-900/80 text-emerald-200 border-emerald-500/40'
                }`}>
                  {currentLesson.questions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                activeTab === 'library'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-900/40'
                  : 'text-emerald-100 hover:text-white hover:bg-emerald-700/60'
              }`}
            >
              <FolderSync className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">Bài Giảng</span>
            </button>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap">
            {/* Real-time Storage & Online/Offline Status */}
            <div 
              title={
                !isOnline 
                  ? 'Chế độ ngoại tuyến (Mất mạng): Dữ liệu đang được lưu an toàn tuyệt đối trong bộ nhớ máy (IndexedDB/LocalStorage)' 
                  : isSyncing 
                    ? 'Đang đồng bộ dữ liệu vào đám mây và ổ đĩa máy chủ...' 
                    : 'Dữ liệu đã lưu an toàn bền vững (Máy & Cloud)'
              }
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors shrink-0 whitespace-nowrap ${
                !isOnline
                  ? 'bg-amber-950/60 border-amber-400/50 text-amber-200'
                  : isSyncing
                    ? 'bg-indigo-950/60 border-indigo-400/50 text-indigo-200'
                    : 'bg-emerald-800/80 border-emerald-400/50 text-emerald-100 shadow-sm'
              }`}
            >
              {!isOnline ? (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
                  <span className="text-[11px] whitespace-nowrap">Đã lưu trên máy (Ngoại tuyến)</span>
                  <Database className="w-3 h-3 text-amber-300 shrink-0" />
                </>
              ) : isSyncing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-300 shrink-0" />
                  <span className="text-[11px] whitespace-nowrap">Đang lưu dữ liệu...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                  <span className="text-[11px] font-semibold text-emerald-100 whitespace-nowrap">Đã lưu an toàn</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-200 shrink-0" />
                </>
              )}
            </div>

            {/* Create New Lesson Button */}
            {onOpenCreateLesson && (
              <button
                onClick={onOpenCreateLesson}
                title="Soạn bài giảng mới"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-emerald-950/20 border border-indigo-400/40 transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0 whitespace-nowrap"
              >
                <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">Soạn Mới</span>
              </button>
            )}

            {/* Admin Panel Button (STRICTLY visible to admin only) */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={onOpenAdminPanel}
                title="Quản lý thành viên, cấp mật khẩu & phân quyền hệ thống (Firestore)"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/90 hover:bg-purple-900 border border-purple-400/60 text-purple-100 font-bold text-xs shadow-md shadow-purple-950/30 transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0 whitespace-nowrap"
              >
                <Users className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                <span className="whitespace-nowrap">Quản Trị</span>
              </button>
            )}

            {/* Auth / Account Profile */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1 border-l border-emerald-400/40 shrink-0 whitespace-nowrap">
                <div
                  title={`Đang đăng nhập: ${cleanAdminName} (${currentUser.role === 'admin' ? 'Quản trị viên tối cao' : 'Thành viên giáo viên'})\nEmail: ${currentUser.email}`}
                  className="flex items-center gap-2 px-2 py-1 rounded-xl bg-emerald-800/80 border border-emerald-400/40 text-xs text-white shrink-0 whitespace-nowrap"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName}
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full border border-white/50 object-cover shrink-0"
                    />
                  ) : (
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      currentUser.role === 'admin'
                        ? 'bg-purple-900 text-purple-200 border border-purple-400/50'
                        : 'bg-emerald-900 text-emerald-200 border border-emerald-400/50'
                    }`}>
                      {currentUser.displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="hidden lg:flex flex-col text-left leading-none shrink-0 whitespace-nowrap">
                    <span className="font-bold text-white text-[11px] max-w-[120px] truncate whitespace-nowrap">
                      {cleanAdminName}
                    </span>
                    <span className={`text-[9px] font-semibold mt-0.5 whitespace-nowrap ${
                      currentUser.role === 'admin' ? 'text-purple-200' : 'text-emerald-200'
                    }`}>
                      {currentUser.role === 'admin' ? 'Quản Trị' : 'Thành Viên'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Đăng xuất khỏi hệ thống"
                  className="p-1.5 rounded-xl text-emerald-100 hover:text-rose-200 hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                title="Đăng nhập tài khoản Quản trị viên hoặc Thành viên"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-xs shadow-md shadow-emerald-950/20 border border-white transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0 whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="whitespace-nowrap">Đăng Nhập</span>
              </button>
            )}

            {/* Present Fullscreen */}
            <button
              onClick={onToggleFullscreen}
              title="Trình chiếu toàn màn hình"
              className="p-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 hover:text-white border border-emerald-400/40 transition-colors cursor-pointer shrink-0"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex border-t border-emerald-500/60 bg-emerald-700 overflow-x-auto p-1.5 gap-1 text-white">
        <button
          onClick={() => setActiveTab('slides')}
          className={`flex-1 py-1.5 px-2 text-center text-xs font-bold rounded-xl whitespace-nowrap ${
            activeTab === 'slides' ? 'bg-indigo-600 text-white shadow' : 'text-emerald-100'
          }`}
        >
          Soạn
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex-1 py-1.5 px-2 text-center text-xs font-bold rounded-xl whitespace-nowrap ${
            activeTab === 'questions' ? 'bg-emerald-900 text-white shadow' : 'text-emerald-100'
          }`}
        >
          Củng cố ({currentLesson?.questions.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`flex-1 py-1.5 px-2 text-center text-xs font-bold rounded-xl whitespace-nowrap ${
            activeTab === 'library' ? 'bg-sky-600 text-white shadow' : 'text-emerald-100'
          }`}
        >
          Bài Giảng
        </button>
      </div>
    </header>
  );
};
