import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  LogIn,
  KeyRound,
  Users,
  Sparkles,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { AppUser } from '../types';
import { FirestoreService, SUPER_ADMIN_EMAIL } from '../services/firestoreService';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: AppUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onLoginSuccess
}) => {
  if (!isOpen) return null;

  const [loginRole, setLoginRole] = useState<'admin' | 'member'>('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPw, setShowAdminPw] = useState(false);

  // Member inputs
  const [memberIdentifier, setMemberIdentifier] = useState('');
  const [memberPassword, setMemberPassword] = useState('');
  const [showMemberPw, setShowMemberPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle Admin Password Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!adminPassword.trim()) {
      setErrorMsg('Vui lòng nhập Mật khẩu Quản trị viên (ADMIN).');
      return;
    }

    try {
      setLoading(true);
      const adminUser = await FirestoreService.verifyAdminLogin(adminPassword);
      onLoginSuccess(adminUser);
    } catch (err: any) {
      setErrorMsg(err.message || 'Mật khẩu ADMIN không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Member Login
  const handleMemberLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!memberIdentifier.trim() || !memberPassword.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu.');
      return;
    }

    try {
      setLoading(true);
      const memberUser = await FirestoreService.verifyMemberLogin(memberIdentifier, memberPassword);
      onLoginSuccess(memberUser);
    } catch (err: any) {
      setErrorMsg(err.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Login fallback
  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    try {
      setLoading(true);
      const user = await FirestoreService.loginWithGoogle();
      if (user) {
        onLoginSuccess(user);
      }
    } catch (err: any) {
      setErrorMsg('Không thể đăng nhập Google: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Brand Banner */}
        <div className="p-6 text-center bg-gradient-to-b from-indigo-950/60 to-slate-900 border-b border-slate-800">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            {loginRole === 'admin' ? (
              <ShieldCheck className="w-7 h-7 text-indigo-400" />
            ) : (
              <Users className="w-7 h-7 text-indigo-400" />
            )}
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            HỆ THỐNG SOẠN BÀI GIẢNG TOÁN HỌC
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Vui lòng đăng nhập để sử dụng đầy đủ các chức năng của trang web
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="grid grid-cols-2 p-1.5 mx-6 mt-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setLoginRole('admin');
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              loginRole === 'admin'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Quản Trị Viên (ADMIN)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginRole('member');
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              loginRole === 'member'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Thành Viên Giáo Viên</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6">
          {/* TAB 1: ADMIN LOGIN */}
          {loginRole === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                    Mật Khẩu Quản Trị Viên (ADMIN) *
                  </span>
                  <span className="text-[10px] text-purple-400 font-semibold uppercase">
                    Quyền Tối Cao
                  </span>
                </label>

                <div className="relative">
                  <input
                    type={showAdminPw ? 'text' : 'password'}
                    required
                    autoFocus
                    placeholder="Nhập mật khẩu của ADMIN..."
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPw(!showAdminPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showAdminPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Chỉ khi nhập đúng mật khẩu ADMIN, bạn mới có toàn quyền sử dụng tất cả chức năng và quản lý cấp tài khoản thành viên.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <p className="text-slate-300 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Mật khẩu khởi tạo mặc định: <code className="text-amber-300 font-mono px-1 py-0.5 rounded bg-slate-900 border border-slate-800">Admin@123456</code>
                </p>
                <p>Bạn có thể đổi mật khẩu này bất kỳ lúc nào trong Trung tâm Quản trị.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập Với Quyền ADMIN'}</span>
              </button>

              <div className="pt-2 border-t border-slate-800 text-center">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Hoặc Đăng nhập bằng Google ({SUPER_ADMIN_EMAIL})</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: MEMBER LOGIN */}
          {loginRole === 'member' && (
            <form onSubmit={handleMemberLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Tên Đăng Nhập (hoặc Gmail) *</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ví dụ: thaynam_toan"
                  value={memberIdentifier}
                  onChange={(e) => setMemberIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Mật Khẩu Do ADMIN Cấp *</span>
                </label>
                <div className="relative">
                  <input
                    type={showMemberPw ? 'text' : 'password'}
                    required
                    placeholder="Nhập mật khẩu do ADMIN cấp..."
                    value={memberPassword}
                    onChange={(e) => setMemberPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMemberPw(!showMemberPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showMemberPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <p className="text-slate-300 font-medium">Bạn chưa có tài khoản thành viên?</p>
                <p>
                  Vui lòng cung cấp <strong>Gmail</strong> và <strong>Số điện thoại</strong> cho Quản trị viên (ADMIN) để được tạo tên đăng nhập cùng mật khẩu.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>{loading ? 'Đang kiểm tra...' : 'Đăng Nhập Thành Viên'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
