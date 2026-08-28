import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Users, 
  Wallet, 
  BookOpen, 
  CheckCircle2, 
  Check, 
  ChevronRight, 
  Clock, 
  Flame, 
  ArrowRight,
  Zap,
  Calendar,
  Layers,
  Award,
  TrendingUp,
  MessageCircle,
  Heart,
  LogIn,
  Shield,
  Globe,
  Database,
  X,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, Circle } from '../types';
import { StoryReel } from './StoryReel';
import { isPostVisibleToUser } from '../utils/postPrivacy';
import { LingkarLogo } from './LingkarLogo';

interface HomeViewProps {
  onOpenTaskDetail: (task: Task) => void;
  onOpenCreateTask: () => void;
  onOpenCreatePost: () => void;
  onOpenCreateTransaction: () => void;
  onOpenGroupDetail?: (circle: Circle) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenTaskDetail,
  onOpenCreateTask,
  onOpenCreatePost,
  onOpenCreateTransaction,
  onOpenGroupDetail,
}) => {
  const {
    currentUser,
    isAuthenticated,
    setIsAuthModalOpen,
    appConfig,
    circles,
    activeCircleId,
    activeCircle,
    tasks,
    posts,
    openGroupRoom,
    setActiveTab,
    toggleSubtask,
    searchQuery,
  } = useApp();

  const [feedMode, setFeedMode] = useState<'tasks' | 'feed'>('feed');
  const [isWelcomeBannerClosed, setIsWelcomeBannerClosed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('lingkar_hide_welcome_banner') === 'true';
    } catch {
      return false;
    }
  });

  const handleCloseWelcomeBanner = () => {
    setIsWelcomeBannerClosed(true);
    try {
      localStorage.setItem('lingkar_hide_welcome_banner', 'true');
    } catch {}
  };

  const handleOpenWelcomeBanner = () => {
    setIsWelcomeBannerClosed(false);
    try {
      localStorage.removeItem('lingkar_hide_welcome_banner');
    } catch {}
  };

  // Filter tasks based on active circle and search
  const filteredTasks = tasks
    .filter((t) => (activeCircleId === 'all' ? true : t.circleId === activeCircleId))
    .filter((t) =>
      searchQuery
        ? t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  const ongoingTasks = filteredTasks.filter((t) => t.status !== 'done');
  const primaryTask = ongoingTasks[0] || tasks[0];

  const totalKas = activeCircle
    ? activeCircle.kasBalance
    : circles.reduce((acc, c) => acc + c.kasBalance, 0);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Privacy-filtered posts for member view
  const visiblePosts = posts.filter((p) => 
    isPostVisibleToUser(p, isAuthenticated, currentUser, circles)
  );

  const recentPosts = visiblePosts
    .filter((p) => (activeCircleId === 'all' ? true : p.circleId === activeCircleId))
    .slice(0, 4);

  const [publicCategory, setPublicCategory] = useState<string>('all');
  const [publicSearch, setPublicSearch] = useState<string>('');

  // Privacy-filtered posts for public visitor view (never leaks group private posts)
  const publicFilteredPosts = visiblePosts.filter((post) => {
    const matchesCat = publicCategory === 'all' || post.category === publicCategory;
    const matchesSearch = !publicSearch.trim() || 
      post.title.toLowerCase().includes(publicSearch.toLowerCase()) ||
      post.content.toLowerCase().includes(publicSearch.toLowerCase()) ||
      post.author.name.toLowerCase().includes(publicSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* 1. Instagram / Social Media Story Reel (Authenticated Only) */}
      {isAuthenticated && (
        <StoryReel
          onOpenCreatePost={() => {
            if (!isAuthenticated) {
              setIsAuthModalOpen(true);
            } else {
              onOpenCreatePost();
            }
          }}
          onSelectStoryPost={() => setActiveTab('sharing')}
        />
      )}

      {/* 2. Unauthenticated Visitor Public Portal vs Authenticated Member View */}
      {!isAuthenticated ? (
        <>
          {/* Public Welcome Hero Banner with Close (X) button */}
          {!isWelcomeBannerClosed ? (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-950 via-slate-900 to-emerald-950 text-white p-5 sm:p-6 shadow-md border border-teal-800/40 animate-in fade-in duration-200">
              {/* Close (X) button for users who want to dismiss it */}
              <button
                type="button"
                onClick={handleCloseWelcomeBanner}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Tutup banner selamat datang"
                aria-label="Tutup banner selamat datang"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-3.5 pr-8">
                <div className="flex items-center gap-3">
                  <LingkarLogo size="md" showText={false} className="shrink-0" />
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-800/60 border border-teal-600/50 text-teal-200 text-xs font-semibold">
                    <Globe className="w-3.5 h-3.5 text-teal-300" />
                    <span>Portal Terbuka Komunitas</span>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display">
                    Selamat Datang di {appConfig?.appName || 'Lingkar'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-1 max-w-xl">
                    {appConfig?.appDescription || 'Tempat berbagi wawasan, rangkuman ilmu, dan inisiatif tim. Seluruh postingan dan kabar komunitas terbuka untuk dibaca secara bebas. Masuk ke akun Anda untuk ikut berdiskusi dan menyukai karya.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 text-xs sm:text-sm font-bold shadow-md hover:from-teal-400 hover:to-emerald-400 active:scale-95 transition-all cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-slate-950" />
                    <span>Masuk ke Akun</span>
                  </button>
                </div>

                {/* Highlights */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-[11px] font-bold text-teal-300">Akses Terbuka</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Bebas baca wawasan</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-[11px] font-bold text-teal-300">Diskusi Komunitas</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Tanggapan interaktif</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-[11px] font-bold text-teal-300">Inisiatif Tim</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Kebaikan bersama</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleOpenWelcomeBanner}
                className="text-[11px] text-slate-400 hover:text-teal-800 flex items-center gap-1 font-medium transition-colors cursor-pointer py-0.5"
              >
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>Tampilkan Banner Selamat Datang</span>
              </button>
            </div>
          )}

          {/* Public Posts Feed Section */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Postingan & Kabar Terbaru
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Menampilkan seluruh publikasi wawasan terbuka
                  </p>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {['all', 'Edukasi', 'Inisiatif', 'Pengumuman', 'Opini'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPublicCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      publicCategory === cat
                        ? 'bg-teal-800 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat === 'all' ? 'Semua Kategori' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts List - Personal without Group labels */}
            <div className="space-y-3">
              {publicFilteredPosts.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-xs space-y-2">
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Tidak ada postingan dalam kategori ini.
                  </p>
                </div>
              ) : (
                publicFilteredPosts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all space-y-3"
                  >
                    {/* Post Header - Personal focus */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-100"
                        />
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
                            {post.author.name}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <span>{post.createdAt}</span>
                            <span>•</span>
                            <span>{post.readingTime || '2 mnt baca'}</span>
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 text-[11px] font-bold bg-teal-50 text-teal-800 rounded-full border border-teal-100 shrink-0">
                        {post.category}
                      </span>
                    </div>

                    {/* Post Title & Content */}
                    <div className="space-y-1.5">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug break-words">
                        {post.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line break-words">
                        {post.content}
                      </p>
                    </div>

                    {/* Optional Post Image */}
                    {post.imageUrl && (
                      <div className="rounded-2xl overflow-hidden border border-slate-100 max-h-72">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Action Row */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setIsAuthModalOpen(true)}
                          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-rose-600 font-semibold transition-colors cursor-pointer"
                          title="Masuk untuk menyukai"
                        >
                          <Heart className="w-4 h-4 text-slate-400 hover:text-rose-500 transition-colors" />
                          <span>{post.likes} Suka</span>
                        </button>
                        <button
                          onClick={() => setIsAuthModalOpen(true)}
                          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-teal-700 font-semibold transition-colors cursor-pointer"
                          title="Masuk untuk berkomentar"
                        >
                          <MessageCircle className="w-4 h-4 text-slate-400 hover:text-teal-600 transition-colors" />
                          <span>{post.comments.length} Komentar</span>
                        </button>
                      </div>

                      <button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="text-[11px] font-bold text-teal-800 hover:underline cursor-pointer"
                      >
                        Gabung Diskusi →
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Member Workspace View */}
          {primaryTask ? (
            <div 
              onClick={() => onOpenTaskDetail(primaryTask)}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-slate-900 to-teal-950 text-white p-4 sm:p-5 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-teal-200 text-[11px] font-bold border border-white/15">
                    {primaryTask.circleName}
                  </span>
                  <span className="text-[11px] text-teal-300 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Tenggat: {primaryTask.deadline}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-teal-300/80 tracking-wider">
                    Target Fokus Utama
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug mt-0.5">
                    {primaryTask.title}
                  </h3>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold text-teal-200">
                    <span>Progress Pengerjaan</span>
                    <span>{primaryTask.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${primaryTask.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                  <span className="text-slate-300 text-[11px]">
                    {primaryTask.subtasks.filter((s) => s.completed).length} dari {primaryTask.subtasks.length} tahapan tuntas
                  </span>
                  <span className="text-teal-300 font-bold flex items-center gap-0.5">
                    Buka Detail Target →
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs text-center space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Semua target selesai!</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Kerja bagus! Tim telah menuntaskan seluruh target periode ini.
              </p>
            </div>
          )}

          {/* Bilah Aksi Cepat */}
          <div className="grid grid-cols-4 gap-2 pt-0.5">
            {/* + Buat Tugas */}
            <button
              id="home-quick-add-task"
              onClick={onOpenCreateTask}
              className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-teal-400 hover:shadow-xs active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 text-center group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-800 leading-tight">
                + Tugas
              </span>
            </button>

            {/* Grup Tim */}
            <a
              id="home-quick-groups"
              href="#groups"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('groups');
              }}
              className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-teal-400 hover:shadow-xs active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 text-center group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-800 leading-tight">
                Grup Tim
              </span>
            </a>

            {/* Kas Transparan */}
            <a
              id="home-quick-finance"
              href="#finance"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('finance');
              }}
              className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-teal-400 hover:shadow-xs active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 text-center group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-800 leading-tight">
                Kas Tim
              </span>
            </a>

            {/* Berbagi Ilmu */}
            <a
              id="home-quick-sharing"
              href="#sharing"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('sharing');
              }}
              className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-teal-400 hover:shadow-xs active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 text-center group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-800 leading-tight">
                Berbagi
              </span>
            </a>
          </div>

          {/* Tab Selector: Target vs Berita/Kabar */}
          <div className="flex items-center p-1 bg-slate-200/70 rounded-2xl">
            <button
              type="button"
              onClick={() => setFeedMode('tasks')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                feedMode === 'tasks'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Target Segera ({ongoingTasks.length})
            </button>
            <button
              type="button"
              onClick={() => setFeedMode('feed')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                feedMode === 'feed'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kabar & Wawasan Tim ({recentPosts.length})
            </button>
          </div>

          {/* Member Content View */}
          {feedMode === 'tasks' ? (
            <div className="space-y-2">
              {ongoingTasks.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center border border-slate-100 text-slate-500 text-xs">
                  Tidak ada target tertunda. Semua tugas tuntas!
                </div>
              ) : (
                ongoingTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onOpenTaskDetail(task)}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-teal-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (task.subtasks.length > 0) {
                            toggleSubtask(task.id, task.subtasks[0].id);
                          }
                        }}
                        className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                          task.status === 'done'
                            ? 'bg-teal-800 text-white'
                            : 'border-2 border-slate-300 bg-white group-hover:border-teal-600'
                        }`}
                      >
                        {task.status === 'done' && <Check className="w-3 h-3 text-white" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-slate-900 leading-snug break-words group-hover:text-teal-900 transition-colors">
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 flex-wrap">
                          <span className="font-semibold text-slate-600">{task.circleName}</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400 shrink-0" /> {task.deadline}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {task.progress}%
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))
              )}

              {ongoingTasks.length > 4 && (
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="w-full py-2 rounded-2xl bg-white border border-slate-200 text-teal-800 hover:bg-slate-50 text-xs font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                >
                  Lihat {ongoingTasks.length - 4} Target Lainnya →
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentPosts.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center border border-slate-100 text-slate-500 text-xs">
                  Belum ada postingan terbaru.
                </div>
              ) : (
                recentPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => setActiveTab('sharing')}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-teal-300 shadow-2xs cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-100"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 block truncate">{post.author.name}</span>
                          <span className="text-[10px] text-slate-400">{post.createdAt}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-50 text-teal-800 rounded-md shrink-0">
                        {post.category}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug break-words">
                      {post.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed break-words line-clamp-2">
                      {post.summary || post.content}
                    </p>
                    <div className="flex items-center gap-3 pt-1 border-t border-slate-100 text-[10px] text-slate-500 font-semibold">
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-rose-500" /> {post.likes} Suka</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3 text-teal-600" /> {post.comments.length} Komentar</span>
                    </div>
                  </div>
                ))
              )}

              <button
                onClick={() => setActiveTab('sharing')}
                className="w-full py-2 rounded-2xl bg-white border border-slate-200 text-teal-800 hover:bg-slate-50 text-xs font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
              >
                Buka Feed Selengkapnya →
              </button>
            </div>
          )}

          {/* Ringkasan Kas & Poin Ringan */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {/* Kas Card */}
            <div
              onClick={() => setActiveTab('finance')}
              className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 cursor-pointer transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Kas Transparan
                </span>
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-1.5">
                <div className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                  {formatRupiah(totalKas)}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                  <span>Buka Catatan Kas →</span>
                </div>
              </div>
            </div>

            {/* Poin Card */}
            <div
              onClick={() => setActiveTab('leaderboard')}
              className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-300 cursor-pointer transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Poin Kebaikan
                </span>
                <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                </div>
              </div>
              <div className="mt-1.5">
                <div className="text-sm sm:text-base font-extrabold text-slate-900">
                  {currentUser.points} Pts
                </div>
                <div className="text-[10px] text-amber-800 font-semibold mt-0.5">
                  <span>Peringkat Teladan →</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
