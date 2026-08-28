import React, { useState, useRef } from 'react';
import { 
  X, 
  User as UserIcon, 
  Star, 
  Zap, 
  Flame, 
  Award, 
  CheckCircle2, 
  Users, 
  ShieldCheck, 
  Wallet, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  Plus, 
  KeyRound,
  LogOut,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Camera,
  Upload,
  Image as ImageIcon,
  Save,
  Check,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Circle } from '../types';
import { uploadMediaFile } from '../utils/imageOptimizer';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
];

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateGroup: () => void;
  onOpenGroupDetail: (circle: Circle) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenCreateGroup,
  onOpenGroupDetail,
}) => {
  const {
    currentUser,
    circles,
    activeCircleId,
    setActiveCircleId,
    openGroupRoom,
    tasks,
    soundEnabled,
    toggleSound,
    badges,
    logout,
    setIsAuthModalOpen,
    isAuthenticated,
    updateUserProfile,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'edit' | 'circles'>('profile');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Edit Form State
  const [editName, setEditName] = useState(currentUser.name || '');
  const [editTitle, setEditTitle] = useState(currentUser.title || '');
  const [editUsername, setEditUsername] = useState(currentUser.username || '');
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar || '');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const completedTasksCount = tasks.filter(
    (t) => t.status === 'done' && t.assignees.some((a) => a.id === currentUser.id)
  ).length;

  const userCircles = circles.filter((c) =>
    currentUser.joinedCircleIds.includes(c.id) || c.members.some((m) => m.id === currentUser.id)
  );

  const handleLogout = async () => {
    await logout();
    setShowLogoutConfirm(false);
    onClose();
  };

  const handleSwitchAccount = () => {
    onClose();
    setIsAuthModalOpen(true);
  };

  // Upload Photo handler
  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      setSaveErrorMsg('');
      const res = await uploadMediaFile(file);

      if (res.url) {
        setEditAvatar(res.url);
        // Automatically save to profile
        const updateRes = await updateUserProfile({
          avatar: res.url,
        });
        if (updateRes.success) {
          setSaveSuccessMsg('Foto profil berhasil diperbarui!');
          setTimeout(() => setSaveSuccessMsg(''), 3000);
        }
      }
    } catch (err: any) {
      setSaveErrorMsg(err.message || 'Gagal mengunggah foto.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setSaveSuccessMsg('');
    setSaveErrorMsg('');

    try {
      const res = await updateUserProfile({
        name: editName,
        title: editTitle,
        username: editUsername,
        avatar: editAvatar,
      });

      if (res.success) {
        setSaveSuccessMsg('Foto profil & data diri berhasil diperbarui!');
        setTimeout(() => setSaveSuccessMsg(''), 3500);
      } else {
        setSaveErrorMsg(res.error || 'Gagal memperbarui profil.');
      }
    } catch (err: any) {
      setSaveErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in slide-in-from-bottom duration-200 flex flex-col"
      >
        {/* Top Drag Indicator for mobile sheet feel */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Header with profile banner */}
        <div className="relative bg-gradient-to-br from-teal-900 via-slate-900 to-teal-950 text-white p-5 rounded-t-2xl sm:rounded-t-3xl flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            aria-label="Tutup Profil"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5 mt-1">
            <div className="relative group">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-teal-400/80 shadow-md"
              />
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className="absolute inset-0 rounded-2xl bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                title="Ganti Foto Profil"
              >
                <Camera className="w-5 h-5 text-white" />
              </button>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight truncate">
                  {currentUser.name}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-400 text-slate-950 rounded-full flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-slate-950" />
                  Lvl {currentUser.level}
                </span>
              </div>
              <p className="text-xs text-teal-200 font-medium">{currentUser.username ? `@${currentUser.username.replace(/^@/, '')}` : currentUser.email}</p>
              {currentUser.title && (
                <p className="text-[11px] text-slate-300 font-normal truncate mt-0.5">{currentUser.title}</p>
              )}
              <div className="inline-flex items-center gap-1 mt-1 text-[11px] text-emerald-300 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" />
                {currentUser.systemRole === 'superadmin' ? 'Superadmin' : currentUser.systemRole === 'admin' ? 'Admin' : 'Member'}
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
            <div className="bg-white/5 rounded-xl p-2 border border-white/5">
              <div className="flex items-center justify-center gap-1 text-amber-300 text-xs font-bold">
                <Zap className="w-3.5 h-3.5 fill-amber-300" />
                <span>{currentUser.points}</span>
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5 font-medium">Poin Kebaikan</div>
            </div>

            <div className="bg-white/5 rounded-xl p-2 border border-white/5">
              <div className="flex items-center justify-center gap-1 text-orange-400 text-xs font-bold">
                <Flame className="w-3.5 h-3.5 fill-orange-400" />
                <span>{currentUser.streakDays} Hari</span>
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5 font-medium">Streak Aktif</div>
            </div>

            <div className="bg-white/5 rounded-xl p-2 border border-white/5">
              <div className="flex items-center justify-center gap-1 text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{completedTasksCount}</span>
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5 font-medium">Target Tuntas</div>
            </div>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-100 px-4 pt-2 bg-slate-50">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-teal-800 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Info & Lencana
          </button>
          <button
            onClick={() => {
              setActiveTab('edit');
              setEditName(currentUser.name || '');
              setEditTitle(currentUser.title || '');
              setEditUsername(currentUser.username || '');
              setEditAvatar(currentUser.avatar || '');
            }}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'edit'
                ? 'border-teal-800 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-teal-700" />
            <span>Perbarui Foto & Profil</span>
          </button>
          <button
            onClick={() => setActiveTab('circles')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'circles'
                ? 'border-teal-800 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Lingkar Saya ({userCircles.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 space-y-4 flex-1">
          {/* TAB 1: INFO & PREFERENSI */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Lencana Teladan (Badges) */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    Lencana Kebaikan ({badges.filter((b) => b.unlocked).length}/{badges.length})
                  </span>
                  <span className="text-[10px] text-teal-700 font-bold">Fastabiqul Khairat</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {badges.slice(0, 4).map((badge) => (
                    <div
                      key={badge.id}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        badge.unlocked
                          ? 'bg-white border-amber-200 text-slate-900 shadow-2xs'
                          : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
                      }`}
                    >
                      <span className="text-lg">{badge.icon}</span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold truncate">{badge.title}</div>
                        <div className="text-[9px] text-slate-500 line-clamp-1">{badge.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sound & Notifications Settings */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Pengaturan Aplikasi
                </span>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
                      {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Efek Suara Interaktif</div>
                      <div className="text-[10px] text-slate-500">Audio saat menyelesaikan tugas & interaksi</div>
                    </div>
                  </div>

                  <button
                    onClick={toggleSound}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                      soundEnabled ? 'bg-teal-700' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                        soundEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Sesi Akun & Keluar (Logout) */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Sesi & Keamanan Akun
                </span>

                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {currentUser.email || currentUser.username}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Sesi Aktif ({currentUser.systemRole === 'superadmin' ? 'Superadmin' : currentUser.systemRole === 'admin' ? 'Admin' : 'User Member'})</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSwitchAccount}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-bold shadow-2xs shrink-0 cursor-pointer"
                  >
                    Ganti Akun
                  </button>
                </div>

                {/* Logout Button */}
                {showLogoutConfirm ? (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-2 text-rose-900 text-xs font-bold">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Yakin ingin keluar dari akun ini?</span>
                    </div>
                    <p className="text-[11px] text-rose-700 leading-relaxed">
                      Sesi login Anda akan dihapus dari peramban ini. Anda dapat masuk kembali kapan saja.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Ya, Keluar Akun</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowLogoutConfirm(false)}
                        className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowLogoutConfirm(true)}
                    className="w-full py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100/80 text-rose-700 hover:text-rose-800 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs group cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                    <span>Keluar dari Akun (Logout)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: UBAH FOTO & PERBARUI PROFIL */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 animate-in fade-in duration-200">
              {saveSuccessMsg && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {saveErrorMsg && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{saveErrorMsg}</span>
                </div>
              )}

              {/* Photo Upload & Preview Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <label className="text-xs font-bold text-slate-800 block">Foto Profil Pengguna</label>
                
                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0">
                    <img
                      src={editAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt="Preview Foto Profil"
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-2xl object-cover ring-2 ring-teal-600 shadow-md bg-slate-200"
                    />
                    {isUploadingPhoto && (
                      <div className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoFileChange}
                      accept="image/*"
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={isUploadingPhoto}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-60"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingPhoto ? 'Mengunggah...' : 'Unggah Foto Baru'}</span>
                    </button>

                    <p className="text-[10px] text-slate-500">
                      Mendukung JPG, PNG, atau WebP. Otomatis dikompresi untuk kecepatan loading.
                    </p>
                  </div>
                </div>

                {/* Quick Avatar Presets */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-slate-600 block mb-2">
                    Atau Pilih Avatar Preset:
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditAvatar(url)}
                        className={`relative rounded-xl overflow-hidden shrink-0 transition-all cursor-pointer ring-2 ${
                          editAvatar === url ? 'ring-teal-700 scale-105 shadow-sm' : 'ring-transparent hover:ring-slate-300'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Preset ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-cover"
                        />
                        {editAvatar === url && (
                          <div className="absolute inset-0 bg-teal-900/40 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Text Fields */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Contoh: Budi Pratama"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Gelar / Peran Singkat (Bio)</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Contoh: Koordinator Relawan & Pegiat Literasi"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Username</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 text-xs font-bold">@</span>
                    <input
                      type="text"
                      required
                      value={editUsername.replace(/^@/, '')}
                      onChange={(e) => setEditUsername(e.target.value)}
                      placeholder="budipratama"
                      className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Email Akun (Permanen)</label>
                  <input
                    type="email"
                    disabled
                    value={currentUser.email || `${currentUser.username}@lingkarkebaikan.org`}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile || isUploadingPhoto}
                  className="w-full py-3 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {isSavingProfile ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menyimpan Pembaruan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Simpan Pembaruan Profil & Foto</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: LINGKAR SAYA */}
          {activeTab === 'circles' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Grup & Tim Anda</span>
                <button
                  onClick={() => {
                    onClose();
                    onOpenCreateGroup();
                  }}
                  className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Buat Grup
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userCircles.map((circle) => {
                  const isSelected = activeCircleId === circle.id;
                  const myRole = circle.members.find((m) => m.id === currentUser.id)?.role || 'Anggota';

                  return (
                    <div
                      key={circle.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                        isSelected
                          ? 'bg-teal-50/70 border-teal-300 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-teal-200'
                      }`}
                    >
                      <div 
                        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                        onClick={() => {
                          onClose();
                          onOpenGroupDetail(circle);
                        }}
                      >
                        <img
                          src={circle.avatar}
                          alt={circle.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {circle.name}
                            </span>
                            {isSelected && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-teal-600 text-white rounded-full">
                                Aktif
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{myRole}</span>
                            <span>•</span>
                            <span>{circle.members.length} anggota</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setActiveCircleId(circle.id);
                            openGroupRoom(circle.id);
                            onClose();
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-[10px] font-bold shadow-2xs cursor-pointer"
                        >
                          Buka Ruang
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* PWA Install App Footer Bar */}
        <div className="p-4 bg-teal-50/90 border-t border-teal-100 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              <Sparkles className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <div className="text-xs font-bold text-teal-950">Aplikasi PWA Lingkar</div>
              <div className="text-[10px] text-teal-700">Pasang aplikasi ke perangkat untuk akses kilat & push notifikasi</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const promptEvent = (window as any).deferredPrompt;
              if (promptEvent) {
                promptEvent.prompt();
                promptEvent.userChoice.then((choiceResult: any) => {
                  if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                  }
                  (window as any).deferredPrompt = null;
                });
              } else {
                alert('Aplikasi Lingkar sudah terpasang atau browser Anda telah memuatnya. Anda dapat memilih "Add to Home Screen" atau "Install App" pada menu titik tiga browser Anda.');
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-xs transition-all active:scale-95 whitespace-nowrap cursor-pointer"
          >
            Install Aplikasi
          </button>
        </div>
      </div>
    </div>
  );
};

