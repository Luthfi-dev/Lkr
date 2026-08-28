import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  Users, 
  PlusCircle, 
  Star,
  Zap,
  Globe,
  CheckCircle2,
  X,
  Shield,
  Crown,
  KeyRound,
  ShieldCheck,
  LogIn,
  LogOut,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LingkarLogo } from './LingkarLogo';
import { Circle } from '../types';

interface NavbarHeaderProps {
  onOpenCirclesModal: () => void;
  onOpenNotifDrawer: () => void;
  onOpenCreateModal: () => void;
  onOpenUserProfileModal?: () => void;
  onOpenGroupDetail?: (circle: Circle) => void;
}

export const NavbarHeader: React.FC<NavbarHeaderProps> = ({
  onOpenCirclesModal,
  onOpenNotifDrawer,
  onOpenCreateModal,
  onOpenUserProfileModal,
  onOpenGroupDetail,
}) => {
  const {
    currentUser,
    circles,
    activeCircleId,
    setActiveCircleId,
    notifications,
    searchQuery,
    setSearchQuery,
    soundEnabled,
    toggleSound,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isAuthenticated,
    logout,
    activeTab,
    setActiveTab,
    setPostLoginAction,
  } = useApp();

  const [isCircleDropdownOpen, setIsCircleDropdownOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  
  const myCircles = circles.filter((c) =>
    c.members?.some(
      (m) =>
        m.id === currentUser.id ||
        (m.email && currentUser.email && m.email.toLowerCase() === currentUser.email.toLowerCase())
    ) ||
    (Array.isArray(currentUser.joinedCircleIds) && currentUser.joinedCircleIds.includes(c.id)) ||
    c.adminId === currentUser.id
  );

  const activeCircle =
    activeCircleId === 'all'
      ? null
      : myCircles.find((c) => c.id === activeCircleId) || circles.find((c) => c.id === activeCircleId) || null;

  return (
    <header className="sticky top-0 z-30 bg-[#f2f4f8]/95 backdrop-blur-md px-3 sm:px-4 pt-3 pb-2.5 max-w-2xl mx-auto w-full transition-all">
      {/* Top Main Row */}
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {/* User Profile & Active Circle */}
        {!isAuthenticated ? (
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center min-w-0 cursor-pointer group"
            title="Beranda Aplikasi"
          >
            <LingkarLogo size="sm" showText={true} />
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {/* App Brand Logo Emblem (Navigates to Home) */}
            <div 
              onClick={() => setActiveTab('home')}
              className="cursor-pointer transition-transform hover:scale-105 shrink-0"
              title="Beranda Lingkar"
            >
              <LingkarLogo size="sm" showText={false} />
            </div>

            <div 
              className="relative cursor-pointer group flex-shrink-0" 
              onClick={() => {
                if (onOpenUserProfileModal) {
                  onOpenUserProfileModal();
                } else {
                  onOpenCirclesModal();
                }
              }}
              title="Buka Profil & Pengaturan"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-white shadow-xs transition-transform group-hover:scale-105"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight truncate max-w-[110px] sm:max-w-[160px]">
                  {currentUser.name}
                </span>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[10px] font-semibold bg-amber-50 text-amber-800 rounded-full border border-amber-200/60 flex-shrink-0">
                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                  Lvl {currentUser.level}
                </span>
              </div>

              {/* Circle Selector Button */}
              <div className="relative">
                <button
                  id="circle-selector-btn"
                  onClick={() => setIsCircleDropdownOpen(!isCircleDropdownOpen)}
                  className="flex items-center gap-1 text-xs text-slate-500 font-medium hover:text-teal-700 transition-colors py-0.5 max-w-full"
                >
                  <Globe className="w-3 h-3 text-teal-700 flex-shrink-0" />
                  <span className="truncate max-w-[120px] sm:max-w-[180px] text-teal-800 font-semibold text-[11px] sm:text-xs">
                    {activeCircle ? activeCircle.name : 'Semua Lingkar Tim'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0 ${isCircleDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Circle Dropdown */}
                {isCircleDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsCircleDropdownOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-1.5 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Pilih Lingkar Aktif
                      </div>

                      <button
                        onClick={() => {
                          setActiveCircleId('all');
                          setIsCircleDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                          activeCircleId === 'all'
                            ? 'bg-teal-50 text-teal-900 font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                            <Globe className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold">Semua Lingkar</div>
                            <div className="text-[10px] text-slate-400">Tampilkan seluruh aktivitas tim</div>
                          </div>
                        </div>
                        {activeCircleId === 'all' && (
                          <CheckCircle2 className="w-4 h-4 text-teal-600" />
                        )}
                      </button>

                      <div className="my-1 border-t border-slate-100" />

                      <div className="max-h-52 overflow-y-auto space-y-1">
                        {myCircles.length === 0 ? (
                          <div className="py-4 text-center px-3">
                            <p className="text-xs text-slate-500 font-medium">Anda belum bergabung ke grup manapun</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Buat grup baru atau masukkan kode gabung</p>
                          </div>
                        ) : (
                          myCircles.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => {
                                setActiveCircleId(c.id);
                                setIsCircleDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                                activeCircleId === c.id
                                  ? 'bg-teal-50 text-teal-900 font-semibold'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                <img
                                  src={c.avatar}
                                  alt={c.name}
                                  referrerPolicy="no-referrer"
                                  className="w-6 h-6 rounded-lg object-cover flex-shrink-0"
                                />
                                <div className="truncate">
                                  <div className="font-medium truncate">{c.name}</div>
                                  <div className="text-[10px] text-slate-400">{c.category} • {c.members.length} anggota</div>
                                </div>
                              </div>
                              {activeCircleId === c.id && (
                                <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 ml-2" />
                              )}
                            </button>
                          ))
                        )}
                      </div>

                      <div className="my-1 border-t border-slate-100" />

                      <button
                        onClick={() => {
                          setIsCircleDropdownOpen(false);
                          onOpenCirclesModal();
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-teal-700 hover:bg-teal-50 rounded-xl transition-colors"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Kelola / Gabung Lingkar Baru
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Right Action Icons: Auth, Admin, Sound, Search, Notification */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          {!isAuthenticated ? (
            <button
              id="nav-login-btn"
              onClick={() => setIsAuthModalOpen(true)}
              aria-label="Masuk ke Akun"
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-teal-800 hover:bg-teal-900 text-white rounded-full transition-all active:scale-95 shadow-xs border border-teal-700/60"
              title="Masuk ke Akun atau Daftar Pengguna Baru"
            >
              <LogIn className="w-4 h-4 text-teal-200" />
            </button>
          ) : (
            <>
              {/* Admin / Superadmin Portal Quick Switcher Button */}
              {(currentUser.systemRole === 'superadmin' || currentUser.systemRole === 'admin') && (
                <button
                  onClick={() => setActiveTab(activeTab === 'admin' ? 'home' : 'admin')}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[11px] font-bold transition-all shadow-2xs active:scale-95 ${
                    activeTab === 'admin'
                      ? 'bg-slate-900 text-teal-300 ring-2 ring-teal-400'
                      : currentUser.systemRole === 'superadmin'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                      : 'bg-indigo-100 text-indigo-900 border border-indigo-300 hover:bg-indigo-200'
                  }`}
                  title="Buka Pusat Kendali Admin / Superadmin"
                >
                  {currentUser.systemRole === 'superadmin' ? (
                    <Crown className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  )}
                  <span className="hidden sm:inline">
                    {currentUser.systemRole === 'superadmin' ? 'Superadmin' : 'Admin'}
                  </span>
                </button>
              )}

              {/* User Account / Role Switcher Modal Button */}
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 rounded-full text-[11px] font-semibold transition-all active:scale-95 shadow-2xs"
                title="Kelola Akun & Ganti Role"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span className="hidden sm:inline max-w-[80px] truncate">{currentUser.name.split(' ')[0]}</span>
              </button>
            </>
          )}

          {/* Sound Toggle */}
          <button
            id="sound-toggle-btn"
            onClick={toggleSound}
            aria-label="Toggle Sound"
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-100 transition-all active:scale-95 shadow-xs"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-700" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            )}
          </button>

          {/* Search Toggle */}
          <button
            id="search-toggle-btn"
            onClick={() => setShowSearchInput(!showSearchInput)}
            aria-label="Search"
            className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full border transition-all active:scale-95 shadow-xs ${
              showSearchInput
                ? 'bg-teal-700 text-white border-teal-700'
                : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Notification Button */}
          <button
            id="notif-btn"
            onClick={() => {
              if (!isAuthenticated) {
                setPostLoginAction(() => () => {
                  onOpenNotifDrawer();
                });
                setIsAuthModalOpen(true);
                return;
              }
              onOpenNotifDrawer();
            }}
            aria-label="Notifications"
            className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-100 transition-all active:scale-95 shadow-xs"
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 border-2 border-white rounded-full animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Search Input */}
      {showSearchInput && (
        <div className="mt-2.5 relative flex items-center animate-in fade-in slide-in-from-top-2 duration-150">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
            type="text"
            placeholder="Cari tugas, rangkuman, buku, transaksi kas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="w-full bg-white border border-slate-200 rounded-full pl-9 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </header>
  );
};
