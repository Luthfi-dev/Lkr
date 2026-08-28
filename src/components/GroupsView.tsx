import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  KeyRound,
  CheckSquare,
  Wallet,
  Calendar,
  Sparkles,
  ChevronRight,
  Shield,
  Layers,
  Crown,
  ArrowRight,
  Check,
  Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Circle, CircleCategory, Task } from '../types';
import { GroupDetailRoom } from './GroupDetailRoom';
import { MobilePagination } from './MobilePagination';

interface GroupsViewProps {
  onOpenTaskDetail: (task: Task) => void;
  onOpenCreateGroupModal: () => void;
  onOpenGroupDetail?: (circle: Circle) => void;
}

export const GroupsView: React.FC<GroupsViewProps> = ({
  onOpenTaskDetail,
  onOpenCreateGroupModal,
  onOpenGroupDetail,
}) => {
  const {
    circles,
    currentUser,
    tasks,
    selectedGroupForRoom,
    openGroupRoom,
    closeGroupRoom,
    joinCircleByCode,
    isAuthenticated,
    setIsAuthModalOpen,
    setActiveTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [groupPage, setGroupPage] = useState(1);
  const [isJoinCodeModalOpen, setIsJoinCodeModalOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');

  React.useEffect(() => {
    setGroupPage(1);
  }, [searchQuery, selectedCategory]);

  // If user is not authenticated, lock group list view
  if (!isAuthenticated) {
    return (
      <div className="space-y-4 pb-12 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs text-center space-y-4 max-w-lg mx-auto mt-4">
          <div className="w-14 h-14 rounded-3xl bg-teal-50 text-teal-800 flex items-center justify-center mx-auto shadow-2xs">
            <Shield className="w-7 h-7 text-teal-700" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Daftar Grup Bersifat Terbatas
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
              Silakan masuk ke akun Anda terlebih dahulu untuk melihat daftar grup, ruang koordinasi, serta berkolaborasi bersama anggota tim.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full sm:w-auto px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-2xl shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              Masuk ke Akun
            </button>
            <button
              onClick={() => setActiveTab('home')}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-2xl active:scale-95 transition-all cursor-pointer"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If a group is currently selected to view its room, show the GroupDetailRoom component
  if (selectedGroupForRoom) {
    return (
      <GroupDetailRoom
        circleId={selectedGroupForRoom}
        onBack={closeGroupRoom}
        onOpenTaskDetail={onOpenTaskDetail}
      />
    );
  }

  // User's joined circles strictly
  const myCircles = circles.filter((circle) => {
    const isMember = circle.members?.some(
      (m) =>
        m.id === currentUser.id ||
        (m.email && currentUser.email && m.email.toLowerCase() === currentUser.email.toLowerCase())
    );
    const isJoined = Array.isArray(currentUser.joinedCircleIds) && currentUser.joinedCircleIds.includes(circle.id);
    const isCreator = circle.adminId === currentUser.id;
    return isMember || isJoined || isCreator;
  });

  // Filter groups from user's joined circles
  const filteredCircles = myCircles.filter((circle) => {
    const matchesSearch =
      circle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      circle.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      circle.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      circle.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || circle.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'Semua Grup' },
    { id: 'Kelompok Studi', label: 'Kelompok Studi' },
    { id: 'Organisasi Akar Rumput', label: 'Akar Rumput' },
    { id: 'Divisi Kerja', label: 'Divisi Kerja' },
    { id: 'Support Group', label: 'Support Group' },
    { id: 'Komunitas Kebaikan', label: 'Komunitas' },
  ];

  const handleJoinCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    const res = joinCircleByCode(joinCodeInput);
    if (res.success) {
      setJoinSuccess(res.message);
      setJoinError('');
      setTimeout(() => {
        setIsJoinCodeModalOpen(false);
        setJoinCodeInput('');
        setJoinSuccess('');
      }, 1200);
    } else {
      setJoinError(res.message);
      setJoinSuccess('');
    }
  };

  // Quick stats summary
  const totalTasksOngoing = tasks.filter((t) => t.status !== 'done').length;
  const totalKasCombined = circles.reduce((acc, c) => acc + c.kasBalance, 0);

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* WhatsApp / Social Media Style Group Hub Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Ruang & Daftar Grup Tim
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Buka grup untuk kelola tugas, delegasi anggota, dan pembukuan kas bersama.
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsJoinCodeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-600" />
              <span>Gabung Kode</span>
            </button>

            <button
              onClick={onOpenCreateGroupModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Buat Grup Baru</span>
            </button>
          </div>
        </div>

        {/* Global Group Overview Stats */}
        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
            <div className="text-[10px] text-slate-500 font-semibold">Grup Tergabung</div>
            <div className="text-base sm:text-lg font-black text-slate-900">{circles.length}</div>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
            <div className="text-[10px] text-slate-500 font-semibold">Tugas Berjalan</div>
            <div className="text-base sm:text-lg font-black text-teal-700">{totalTasksOngoing}</div>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
            <div className="text-[10px] text-slate-500 font-semibold">Total Kas Grup</div>
            <div className="text-xs sm:text-sm font-black text-slate-900 truncate">
              Rp {totalKasCombined.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mt-3.5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama grup, topik riset, atau kode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* WhatsApp-Style Group List */}
      <div className="space-y-3">
        {filteredCircles.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-xs">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">Tidak Ada Grup Ditemukan</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto mb-4">
              {searchQuery
                ? `Tidak ditemukan grup dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
                : 'Mulai kolaborasi kebaikan dengan membuat grup tim baru atau gabung via kode.'}
            </p>
            <button
              onClick={onOpenCreateGroupModal}
              className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 shadow-xs"
            >
              + Inisiasi Grup Baru Sekarang
            </button>
          </div>
        ) : (
          <>
            {filteredCircles
              .slice((groupPage - 1) * 4, groupPage * 4)
              .map((circle) => {
              const groupTasksList = tasks.filter((t) => t.circleId === circle.id);
              const ongoingTasksCount = groupTasksList.filter((t) => t.status !== 'done').length;
              const myRole = circle.members.find((m) => m.id === currentUser.id)?.role || 'Anggota';
              const isAdmin = myRole === 'Ketua' || myRole === 'Kreator';
              const isTreasurer = myRole === 'Bendahara';

              // Find most urgent task for this group
              const urgentTask = groupTasksList.find((t) => t.status !== 'done');

              return (
                <a
                  key={circle.id}
                  href={`#group/${circle.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    openGroupRoom(circle.id);
                  }}
                  className="group bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-300 transition-all cursor-pointer relative overflow-hidden block"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Group Avatar with Member Count Badge */}
                    <div 
                      className="relative flex-shrink-0 cursor-pointer"
                      onClick={(e) => {
                        if (onOpenGroupDetail) {
                          e.stopPropagation();
                          onOpenGroupDetail(circle);
                        }
                      }}
                      title="Klik untuk lihat detail profil grup"
                    >
                      <img
                        src={circle.avatar}
                        alt={circle.name}
                        referrerPolicy="no-referrer"
                        className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover ring-2 ring-slate-100 shadow-xs group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-slate-900 text-white rounded-full text-[9px] font-bold shadow-xs">
                        {circle.members.length}
                      </span>
                    </div>

                    {/* Group Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                          <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-teal-700 transition-colors break-words leading-snug">
                            {circle.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                            {circle.category}
                          </span>
                        </div>

                        {/* User Role in Group */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 border inline-flex items-center ${
                            isAdmin
                              ? 'bg-amber-100 text-amber-900 border-amber-200'
                              : isTreasurer
                              ? 'bg-teal-100 text-teal-900 border-teal-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {isAdmin ? '👑 Admin' : isTreasurer ? '💰 Bendahara' : '👤 Anggota'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed break-words line-clamp-2">
                        {circle.description}
                      </p>

                      {/* Latest Task Snippet or Meeting Schedule */}
                      <div className="mt-2.5 p-2 bg-slate-50/90 rounded-xl border border-slate-100 flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-2 min-w-0 text-slate-700 flex-1">
                          <CheckSquare className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="break-words leading-tight text-xs font-medium min-w-0">
                            {urgentTask ? (
                              <>
                                <strong className="text-slate-900">{urgentTask.title}</strong>{' '}
                                <span className="text-slate-400">({urgentTask.deadline})</span>
                              </>
                            ) : (
                              <span className="text-slate-400 italic">Semua target selesai</span>
                            )}
                          </span>
                        </div>

                        <span className="text-[11px] font-bold text-teal-700 shrink-0 ml-2">
                          {ongoingTasksCount} Tugas
                        </span>
                      </div>

                      {/* Group Badges / Stats Footer */}
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                            <Wallet className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            Kas: Rp {circle.kasBalance.toLocaleString('id-ID')}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {circle.members.length} Anggota
                          </span>
                        </div>

                        <div className="inline-flex items-center gap-1 text-teal-700 font-bold group-hover:translate-x-1 transition-transform shrink-0">
                          <span>Buka Ruang</span>
                          <ChevronRight className="w-4 h-4 shrink-0" />
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}

            {/* Mobile Pagination for Groups */}
            <MobilePagination
              currentPage={groupPage}
              totalItems={filteredCircles.length}
              pageSize={4}
              onPageChange={setGroupPage}
              itemLabel="grup tim"
              className="pt-2"
            />
          </>
        )}
      </div>

      {/* ===================== MODAL GABUNG DENGAN KODE ===================== */}
      {isJoinCodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Gabung Grup Tim</h3>
                  <p className="text-xs text-slate-500">Masukkan kode undangan yang diberikan admin</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsJoinCodeModalOpen(false);
                  setJoinError('');
                  setJoinSuccess('');
                }}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleJoinCode} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kode Undangan Grup
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: AI-STUDY-88 / PESISIR-01"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold tracking-wider text-slate-900 uppercase focus:bg-white focus:border-teal-500 outline-none"
                />
              </div>

              {joinError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                  {joinError}
                </div>
              )}

              {joinSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>{joinSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsJoinCodeModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors shadow-xs"
                >
                  Bergabung ke Grup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
