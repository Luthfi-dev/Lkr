import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Crown,
  User,
  Mail,
  Lock,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Eye,
  EyeOff,
  UserCheck,
  LogIn,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LingkarLogo } from './LingkarLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, login, registerUser, logout, isAuthenticated } = useApp();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Login form
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  // Register form
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameMessage, setUsernameMessage] = useState('');

  useEffect(() => {
    const clean = regUsername.trim().toLowerCase().replace(/^@/, '');
    if (!clean) {
      setUsernameStatus('idle');
      setUsernameMessage('');
      return;
    }
    if (clean.length < 3) {
      setUsernameStatus('invalid');
      setUsernameMessage('Username minimal 3 karakter.');
      return;
    }

    setUsernameStatus('checking');
    setUsernameMessage('Memeriksa ketersediaan...');

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/check-username/${encodeURIComponent(clean)}`);
        const data = await res.json();
        if (data.available) {
          setUsernameStatus('available');
          setUsernameMessage('✓ Username tersedia.');
        } else {
          setUsernameStatus('taken');
          setUsernameMessage('✕ Username sudah digunakan.');
        }
      } catch {
        setUsernameStatus('idle');
        setUsernameMessage('');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [regUsername]);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const resetForms = () => {
    setIdentifier('');
    setPassword('');
    setRegName('');
    setRegUsername('');
    setRegEmail('');
    setRegPassword('');
    setShowPassword(false);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Clear all form inputs whenever modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      resetForms();
    }
  }, [isOpen]);

  const handleClose = () => {
    resetForms();
    onClose();
  };

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setErrorMsg('Harap isi email/username dan kata sandi.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const result = await login(identifier, password);
      if (result.success) {
        setSuccessMsg('Autentikasi berhasil! Mengarahkan ke dashboard...');
        // Clear all form fields immediately so no credentials remain in memory/UI
        resetForms();
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        setErrorMsg(result.error || 'Kata sandi atau email/username tidak sesuai. Silakan periksa kembali.');
        setPassword('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem. Silakan periksa koneksi dan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regUsername.trim() || !regPassword.trim()) {
      setErrorMsg('Nama, Username, dan Kata Sandi wajib diisi.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const result = await registerUser({
        name: regName,
        username: regUsername,
        email: regEmail,
        password: regPassword,
      });

      if (result.success) {
        setSuccessMsg('Pendaftaran akun berhasil! Mengarahkan ke aplikasi...');
        // Clear all form fields immediately upon successful registration
        resetForms();
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        setErrorMsg(result.error || 'Pendaftaran gagal. Silakan periksa kembali data yang dimasukkan.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mendaftar. Silakan periksa kembali data Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-5 rounded-t-3xl relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LingkarLogo size="sm" showText={false} className="shrink-0" />
              <div>
                <h3 className="text-base font-display font-extrabold text-white">
                  Masuk & Pendaftaran Akun
                </h3>
                <p className="text-[11px] text-teal-200">
                  Masuk ke jaringan kolaborasi Lingkar
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 space-y-4 flex-1">
          {/* Current Active User Status Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-teal-600/30"
                />
                <div className="absolute -bottom-1 -right-1">
                  {currentUser.systemRole === 'superadmin' ? (
                    <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                      <Crown className="w-2.5 h-2.5" />
                    </div>
                  ) : currentUser.systemRole === 'admin' ? (
                    <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <ShieldCheck className="w-2.5 h-2.5" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-teal-700 text-white flex items-center justify-center shadow-xs">
                      <UserCheck className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {currentUser.name}
                  </span>
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      currentUser.systemRole === 'superadmin'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : currentUser.systemRole === 'admin'
                        ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                        : 'bg-teal-100 text-teal-900 border border-teal-300'
                    }`}
                  >
                    {currentUser.systemRole || 'member'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {currentUser.email || currentUser.username}
                </div>
              </div>
            </div>

            {isAuthenticated && (
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  resetForms();
                  setSuccessMsg('Berhasil keluar akun.');
                  setTimeout(() => {
                    handleClose();
                  }, 600);
                }}
                className="px-2.5 py-1 rounded-xl bg-slate-200/80 hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                title="Keluar Sesi"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            )}
          </div>

          {/* Mode Switcher: Login vs Register */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                resetForms();
                setAuthMode('login');
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => {
                resetForms();
                setAuthMode('register');
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Daftar Pengguna Baru
            </button>
          </div>

          {/* Status Messages */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Login */}
          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Email atau Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    autoComplete="username"
                    placeholder="Masukkan email atau username Anda..."
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Masukkan kata sandi..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-teal-800 text-white hover:bg-teal-900 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Sesi...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-teal-200" />
                    <span>Masuk ke Akun</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Form Register New User */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="cth. Rian Ardiansyah"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Username
                </label>
                <input
                  type="text"
                  autoComplete="username"
                  placeholder="cth. rian_ardi"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all"
                />
                {usernameMessage && (
                  <p
                    className={`text-[11px] font-semibold mt-1 ${
                      usernameStatus === 'available'
                        ? 'text-emerald-600'
                        : usernameStatus === 'taken' || usernameStatus === 'invalid'
                        ? 'text-rose-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {usernameMessage}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Email (Opsional)
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="rian@lingkarkebaikan.org"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Kata sandi baru (min. 6 karakter)..."
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200 text-teal-900 text-[11px] leading-relaxed">
                ✨ Pengguna baru akan langsung diarahkan ke <strong>Dashboard Pengguna</strong> dengan 100 poin sambutan dan akses bergabung ke Circle.
              </div>

              <button
                type="submit"
                disabled={isLoading || usernameStatus === 'taken' || usernameStatus === 'invalid'}
                className="w-full py-2.5 rounded-xl bg-teal-700 text-white hover:bg-teal-800 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mendaftarkan...</span>
                  </>
                ) : (
                  <>
                    <span>Daftar & Buka Dashboard User</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
