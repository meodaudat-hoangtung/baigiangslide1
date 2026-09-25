import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  UserPlus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  Lock,
  Search,
  RefreshCw,
  X,
  Sparkles,
  Shield,
  Eye,
  EyeOff,
  Copy,
  Edit3,
  KeyRound,
  Check,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';
import { AppUser, UserRole, UserStatus } from '../types';
import { FirestoreService, SUPER_ADMIN_EMAIL } from '../services/firestoreService';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  // CRITICAL SECURITY CHECK: Only ADMIN can view this modal
  if (!isOpen || currentUser?.role !== 'admin') return null;

  const [activeTab, setActiveTab] = useState<'members' | 'create' | 'security'>('members');
  const [members, setMembers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');

  // Password visibility map for members
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  // New member form states
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSuccessInfo, setCreatedSuccessInfo] = useState<{
    username: string;
    password: string;
    email: string;
    phone: string;
    displayName: string;
  } | null>(null);

  // Edit member modal states
  const [editingMember, setEditingMember] = useState<AppUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState<UserStatus>('active');
  const [editNotes, setEditNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete member confirmation dialog states
  const [memberToDelete, setMemberToDelete] = useState<AppUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Admin password change states
  const [currentAdminPw, setCurrentAdminPw] = useState('');
  const [newAdminPw, setNewAdminPw] = useState('');
  const [confirmAdminPw, setConfirmAdminPw] = useState('');
  const [showAdminPw, setShowAdminPw] = useState(false);
  const [isChangingAdminPw, setIsChangingAdminPw] = useState(false);

  // General feedback message
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Fetch Admin password on mount
  useEffect(() => {
    FirestoreService.getAdminPassword().then((pw) => {
      setCurrentAdminPw(pw);
    });
  }, []);

  // Subscribe to members list in realtime from Firestore
  useEffect(() => {
    setLoading(true);
    const unsubscribe = FirestoreService.subscribeMembers((list) => {
      setMembers(list);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const togglePasswordVisibility = (uid: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [uid]: !prev[uid] }));
  };

  const copyToClipboard = (text: string, uid?: string) => {
    navigator.clipboard.writeText(text);
    if (uid) {
      setCopiedUid(uid);
      setTimeout(() => setCopiedUid(null), 2000);
    }
    setFeedbackMsg({ text: 'Đã sao chép vào bộ nhớ tạm!', type: 'success' });
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const copyMemberCredentialCard = (m: AppUser) => {
    const text = `🔔 THÔNG TIN TÀI KHOẢN SOẠN BÀI TOÁN HỌC:\n• Trang web: ${window.location.origin}\n• Tên đăng nhập: ${m.username || m.email}\n• Mật khẩu: ${m.password || '(Đã cấp)'}\n• Gmail đăng ký: ${m.email}\n• Số điện thoại: ${m.phone || 'Chưa cập nhật'}\n(Vui lòng đăng nhập tại mục "Thành Viên" để bắt đầu soạn và giảng dạy)`;
    copyToClipboard(text, m.uid);
  };

  // Generate random password helper
  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(res);
  };

  // Auto suggest username from email or name
  const handleAutoSuggestUsername = () => {
    if (newEmail.trim()) {
      const part = newEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      setNewUsername(part);
    } else if (newName.trim()) {
      const part = newName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase();
      setNewUsername(part);
    } else {
      setNewUsername('giaovien_' + Math.floor(1000 + Math.random() * 9000));
    }
  };

  // Create new member submit
  const handleCreateMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newPhone.trim()) {
      setFeedbackMsg({ text: 'Vui lòng cung cấp cả Gmail và Số điện thoại của thành viên.', type: 'error' });
      return;
    }
    if (!newUsername.trim() || !newPassword.trim()) {
      setFeedbackMsg({ text: 'Vui lòng thiết lập Tên đăng nhập và Mật khẩu cho thành viên.', type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await FirestoreService.createMemberAccount({
        username: newUsername,
        password: newPassword,
        email: newEmail,
        phone: newPhone,
        displayName: newName || 'Giáo viên ' + newUsername,
        role: 'member',
        status: 'active',
        notes: newNotes
      });

      setCreatedSuccessInfo({
        username: created.username || newUsername,
        password: created.password || newPassword,
        email: created.email,
        phone: created.phone || newPhone,
        displayName: created.displayName
      });

      setFeedbackMsg({ text: `Đã cấp tài khoản thành công cho: ${created.displayName}!`, type: 'success' });
      // Reset inputs
      setNewEmail('');
      setNewPhone('');
      setNewName('');
      setNewUsername('');
      setNewPassword('');
      setNewNotes('');
    } catch (err: any) {
      setFeedbackMsg({ text: `Lỗi: ${err.message || 'Không thể tạo tài khoản'}`, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal for a member
  const handleOpenEdit = (m: AppUser) => {
    setEditingMember(m);
    setEditName(m.displayName || '');
    setEditUsername(m.username || '');
    setEditPassword(m.password || '');
    setEditEmail(m.email || '');
    setEditPhone(m.phone || '');
    setEditStatus(m.status || 'active');
    setEditNotes(m.notes || '');
  };

  // Save Edit Member submit
  const handleSaveEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    try {
      setIsUpdating(true);
      await FirestoreService.updateMemberAccount(editingMember.uid, {
        displayName: editName.trim(),
        username: editUsername.trim().toLowerCase(),
        password: editPassword.trim(),
        email: editEmail.trim().toLowerCase(),
        phone: editPhone.trim(),
        status: editStatus,
        notes: editNotes.trim()
      });

      setFeedbackMsg({ text: `Đã cập nhật thông tin tài khoản (${editUsername}) thành công!`, type: 'success' });
      setEditingMember(null);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg({ text: `Lỗi: ${err.message || 'Không thể cập nhật'}`, type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle quick status (Active / Blocked)
  const handleToggleStatus = async (m: AppUser) => {
    const nextStatus: UserStatus = m.status === 'active' ? 'blocked' : 'active';
    try {
      await FirestoreService.updateMemberStatus(m.uid, nextStatus);
      setFeedbackMsg({
        text: `Đã ${nextStatus === 'active' ? 'mở khóa' : 'khóa'} tài khoản (${m.displayName || m.username})!`,
        type: 'success'
      });
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg({ text: `Lỗi: ${err.message}`, type: 'error' });
    }
  };

  // Open Delete Confirmation Dialog
  const handleOpenDeleteConfirm = (m: AppUser) => {
    setMemberToDelete(m);
  };

  // Confirm and execute delete member
  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    try {
      setIsDeleting(true);
      await FirestoreService.deleteMember(memberToDelete.uid);
      setMembers((prev) => prev.filter((m) => m.uid !== memberToDelete.uid));
      setFeedbackMsg({
        text: `Đã xóa vĩnh viễn tài khoản thành viên "${memberToDelete.displayName || memberToDelete.username || memberToDelete.email}" thành công!`,
        type: 'success'
      });
      setMemberToDelete(null);
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err: any) {
      console.error('Lỗi khi xóa thành viên:', err);
      setFeedbackMsg({
        text: `Lỗi xóa tài khoản: ${err.message || 'Không thể xóa'}`,
        type: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Change Admin Password
  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPw || newAdminPw.length < 4) {
      setFeedbackMsg({ text: 'Mật khẩu ADMIN mới phải có ít nhất 4 ký tự.', type: 'error' });
      return;
    }
    if (newAdminPw !== confirmAdminPw) {
      setFeedbackMsg({ text: 'Mật khẩu xác nhận không khớp.', type: 'error' });
      return;
    }

    try {
      setIsChangingAdminPw(true);
      await FirestoreService.setAdminPassword(newAdminPw);
      setCurrentAdminPw(newAdminPw);
      setNewAdminPw('');
      setConfirmAdminPw('');
      setFeedbackMsg({ text: 'Đã đổi Mật khẩu Quản trị viên (ADMIN) thành công và đồng bộ Firestore!', type: 'success' });
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err: any) {
      setFeedbackMsg({ text: `Lỗi: ${err.message}`, type: 'error' });
    } finally {
      setIsChangingAdminPw(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      (m.displayName || '').toLowerCase().includes(q) ||
      (m.username || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q) ||
      (m.phone || '').includes(q);
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'active').length;
  const blockedMembers = members.filter((m) => m.status === 'blocked').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Trung Tâm Quản Trị Hệ Thống (ADMIN)
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Quyền Cao Nhất
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Chỉ Quản trị viên mới có quyền xem danh sách thành viên, cấp mật khẩu và quản lý hệ thống
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 gap-2 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('members')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'members'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Danh Sách Thành Viên ({members.length})</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">
              Chỉ ADMIN
            </span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'create'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Cấp Tài Khoản Mới</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Mật Khẩu ADMIN & Bảo Mật</span>
          </button>
        </div>

        {/* Feedback Alert Bar */}
        {feedbackMsg && (
          <div
            className={`px-6 py-2.5 text-xs font-semibold flex items-center gap-2 ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border-b border-emerald-800'
                : 'bg-rose-950/80 text-rose-300 border-b border-rose-800'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* TAB 1: MEMBERS DIRECTORY */}
        {activeTab === 'members' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Quick Metrics Bar */}
            <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <Users className="w-4 h-4 text-indigo-400" />
                  Tổng giáo viên: <strong className="text-white">{totalMembers}</strong>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Đang hoạt động: <strong className="text-emerald-400">{activeMembers}</strong>
                </span>
                {blockedMembers > 0 && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <UserX className="w-4 h-4 text-rose-400" />
                    Đã khóa: <strong className="text-rose-400">{blockedMembers}</strong>
                  </span>
                )}
              </div>

              <button
                onClick={() => setActiveTab('create')}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Cấp Tài Khoản Mới</span>
              </button>
            </div>

            {/* Search and Filters */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo Tên đăng nhập, Họ tên, Gmail hoặc Số điện thoại..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500 w-full sm:w-auto"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động (Active)</option>
                <option value="blocked">Đã tạm khóa (Blocked)</option>
              </select>
            </div>

            {/* Members Cards / List */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
              {loading ? (
                <div className="py-16 text-center space-y-2 text-slate-400 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-400" />
                  <p>Đang tải danh sách thành viên trực tiếp từ Firestore...</p>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="py-16 text-center space-y-3 text-slate-400 text-xs">
                  <Users className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-slate-300 font-medium">Chưa có thành viên nào hoặc không tìm thấy kết quả.</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md inline-flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Cấp Tài Khoản Cho Giáo Viên Đầu Tiên</span>
                  </button>
                </div>
              ) : (
                filteredMembers.map((m) => {
                  const isPwVisible = visiblePasswords[m.uid];
                  const isCopied = copiedUid === m.uid;

                  return (
                    <div
                      key={m.uid}
                      className={`p-4 rounded-2xl border transition-all ${
                        m.status === 'blocked'
                          ? 'bg-rose-950/10 border-rose-900/40 opacity-75'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Member Identity */}
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-indigo-900/40 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                            {m.displayName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-sm text-white">
                                {m.displayName || 'Giáo viên'}
                              </h4>
                              {m.status === 'active' ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                  <UserCheck className="w-3 h-3" />
                                  Hoạt động
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                                  <UserX className="w-3 h-3" />
                                  Đã khóa
                                </span>
                              )}
                              {m.notes && (
                                <span className="text-[11px] text-slate-400 italic">
                                  ({m.notes})
                                </span>
                              )}
                            </div>

                            {/* Credentials Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-2 text-xs">
                              {/* Username */}
                              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-1">
                                <span className="text-slate-400 text-[11px]">Tên ĐN:</span>
                                <span className="font-mono font-bold text-indigo-300 truncate">
                                  {m.username || m.email}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(m.username || m.email, m.uid + '_u')}
                                  title="Sao chép tên đăng nhập"
                                  className="text-slate-500 hover:text-slate-300"
                                >
                                  {copiedUid === m.uid + '_u' ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>

                              {/* Password */}
                              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-1">
                                <span className="text-slate-400 text-[11px]">Mật khẩu:</span>
                                <span className="font-mono font-bold text-amber-300 truncate">
                                  {isPwVisible ? m.password || '(Trống)' : '••••••••'}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility(m.uid)}
                                    title={isPwVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                    className="text-slate-500 hover:text-slate-300"
                                  >
                                    {isPwVisible ? (
                                      <EyeOff className="w-3.5 h-3.5" />
                                    ) : (
                                      <Eye className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  {m.password && (
                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard(m.password || '', m.uid + '_p')}
                                      title="Sao chép mật khẩu"
                                      className="text-slate-500 hover:text-slate-300"
                                    >
                                      {copiedUid === m.uid + '_p' ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Gmail */}
                              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-1.5 truncate">
                                <Mail className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                                <span className="text-slate-300 truncate" title={m.email}>
                                  {m.email}
                                </span>
                              </div>

                              {/* Phone */}
                              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-1.5 truncate">
                                <Phone className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                                <span className="text-slate-300 font-mono">
                                  {m.phone || 'Chưa có SĐT'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions buttons */}
                        <div className="flex items-center gap-2 self-end lg:self-center flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => copyMemberCredentialCard(m)}
                            title="Sao chép toàn bộ thông tin đăng nhập để gửi qua Zalo / Tin nhắn"
                            className="px-3 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{isCopied ? 'Đã sao chép' : 'Gửi Thông Tin'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(m)}
                            title="Chỉnh sửa tài khoản"
                            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(m)}
                            title={m.status === 'active' ? 'Khóa tài khoản này' : 'Mở khóa tài khoản này'}
                            className={`p-2 rounded-xl border transition-colors ${
                              m.status === 'active'
                                ? 'bg-slate-900 hover:bg-amber-950/60 text-slate-400 hover:text-amber-400 border-slate-800'
                                : 'bg-slate-900 hover:bg-emerald-950/60 text-amber-400 hover:text-emerald-400 border-slate-800'
                            }`}
                          >
                            {m.status === 'active' ? (
                              <UserX className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDeleteConfirm(m)}
                            title="Xóa tài khoản vĩnh viễn"
                            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CREATE NEW MEMBER */}
        {activeTab === 'create' && (
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="max-w-2xl mx-auto space-y-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-400" />
                  <span>Cấp Tài Khoản Thành Viên Cho Giáo Viên</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Nhập thông tin Gmail và Số điện thoại do giáo viên cung cấp, sau đó chỉ định Tên đăng nhập cùng Mật khẩu để họ truy cập hệ thống.
                </p>
              </div>

              {/* Success Banner if just created */}
              {createdSuccessInfo && (
                <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Tài khoản đã tạo thành công và lưu lên Firestore!
                    </span>
                    <button
                      onClick={() => setCreatedSuccessInfo(null)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-3 bg-slate-900/90 rounded-xl border border-emerald-900/60 font-mono text-xs space-y-1">
                    <p className="text-slate-300">
                      • Tên đăng nhập: <strong className="text-white">{createdSuccessInfo.username}</strong>
                    </p>
                    <p className="text-slate-300">
                      • Mật khẩu: <strong className="text-amber-300">{createdSuccessInfo.password}</strong>
                    </p>
                    <p className="text-slate-300">
                      • Gmail: {createdSuccessInfo.email} | SĐT: {createdSuccessInfo.phone}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const text = `🔔 THÔNG TIN TÀI KHOẢN SOẠN BÀI TOÁN HỌC:\n• Trang web: ${window.location.origin}\n• Tên đăng nhập: ${createdSuccessInfo.username}\n• Mật khẩu: ${createdSuccessInfo.password}\n• Gmail đăng ký: ${createdSuccessInfo.email}\n• Số điện thoại: ${createdSuccessInfo.phone}\n(Vui lòng đăng nhập tại mục "Thành Viên" để bắt đầu soạn bài)`;
                      copyToClipboard(text);
                    }}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao Chép Thông Tin Này Gửi Ngay Cho Giáo Viên</span>
                  </button>
                </div>
              )}

              <form onSubmit={handleCreateMemberSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Gmail (Required) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Gmail Giáo Viên Cung Cấp *</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="thaynam@gmail.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Phone (Required) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Số Điện Thoại Cung Cấp *</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0912345678"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Họ và Tên Giáo Viên
                    </label>
                    <input
                      type="text"
                      placeholder="Thầy Nguyễn Văn Nam (hoặc Cô Lê Thị Lan)"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Tên Đăng Nhập Do ADMIN Tạo *
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoSuggestUsername}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        Gợi ý tự động
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="thaynam_toan"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Mật Khẩu Do ADMIN Tạo *
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateRandomPassword}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
                      >
                        Tạo ngẫu nhiên
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Nhập mật khẩu cho giáo viên"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Notes */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Ghi Chú Nội Bộ (Trường học / Khối lớp phụ trách)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: THPT Chuyên, Toán 10 & 11"
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('members')}
                    className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold"
                  >
                    Quay lại danh sách
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    <span>{isSubmitting ? 'Đang tạo...' : 'Tạo & Cấp Tài Khoản Ngay'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: ADMIN PASSWORD & SYSTEM SECURITY */}
        {activeTab === 'security' && (
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="max-w-xl mx-auto space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-purple-400" />
                  <span>Đổi Mật Khẩu Quản Trị (ADMIN)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Mật khẩu này là chìa khóa cao nhất để mở toàn bộ quyền quản trị website và danh sách thành viên.
                </p>
              </div>

              {/* Current Status Card */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Tài khoản ADMIN gốc:</span>
                  <span className="font-bold text-white">{SUPER_ADMIN_EMAIL}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Mật khẩu ADMIN hiện tại:</span>
                  <span className="font-mono font-bold text-amber-300">
                    {showAdminPw ? currentAdminPw : '••••••••••••'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAdminPw(!showAdminPw)}
                    className="text-slate-500 hover:text-slate-300 text-xs flex items-center gap-1"
                  >
                    {showAdminPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showAdminPw ? 'Ẩn' : 'Hiện'}</span>
                  </button>
                </div>
              </div>

              {/* Change Password Form */}
              <form onSubmit={handleChangeAdminPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Nhập Mật Khẩu ADMIN Mới
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Nhập mật khẩu mới..."
                    value={newAdminPw}
                    onChange={(e) => setNewAdminPw(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Xác Nhận Mật Khẩu ADMIN Mới
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Nhập lại mật khẩu mới..."
                    value={confirmAdminPw}
                    onChange={(e) => setConfirmAdminPw(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingAdminPw}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  {isChangingAdminPw ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                  <span>{isChangingAdminPw ? 'Đang lưu...' : 'Lưu Mật Khẩu ADMIN Mới Lên Firestore'}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL EDIT MEMBER (SUB-MODAL) */}
        {editingMember && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-indigo-400" />
                  <span>Chỉnh Sửa Tài Khoản Thành Viên</span>
                </h4>
                <button
                  onClick={() => setEditingMember(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEditMember} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Họ và Tên</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Tên Đăng Nhập</label>
                    <input
                      type="text"
                      required
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value.toLowerCase())}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Mật Khẩu</label>
                    <input
                      type="text"
                      required
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Gmail</label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Số Điện Thoại</label>
                    <input
                      type="tel"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Trạng Thái Tài Khoản</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as UserStatus)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="active">Hoạt động bình thường (Active)</option>
                    <option value="blocked">Tạm khóa tài khoản (Blocked)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Ghi Chú</label>
                  <input
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                  >
                    {isUpdating ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE MEMBER CONFIRMATION DIALOG (Reliable in-app confirmation) */}
        {memberToDelete && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border-2 border-rose-500/60 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Xác Nhận Xóa Vĩnh Viễn</h3>
                  <p className="text-xs text-rose-300 font-medium mt-0.5">
                    Hành động này không thể hoàn tác sau khi thực hiện
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                <p className="text-slate-300 leading-relaxed">
                  Bạn có chắc chắn muốn xóa tài khoản của thành viên này khỏi hệ thống?
                </p>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{memberToDelete.displayName || 'Thành viên'}</span>
                  </div>
                  <div className="text-slate-400 font-mono text-[11px]">
                    Tên đăng nhập: <span className="text-indigo-300 font-bold">{memberToDelete.username}</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Gmail: <span className="text-slate-300">{memberToDelete.email}</span>
                    {memberToDelete.phone && <span> • SĐT: {memberToDelete.phone}</span>}
                  </div>
                </div>

                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Dữ liệu tài khoản sẽ bị xóa hoàn toàn khỏi Firebase Firestore. Thành viên này sẽ không thể đăng nhập hoặc thao tác được nữa.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setMemberToDelete(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-1.5 transition-all"
                >
                  {isDeleting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>{isDeleting ? 'Đang Xóa...' : 'Xác Nhận Xóa Vĩnh Viễn'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            Hệ thống bảo vệ phân quyền Quản trị viên (ADMIN) & Quản lý Thành viên - Firebase Firestore.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
