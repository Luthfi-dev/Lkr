import React, { useState } from 'react';
import { 
  Trophy, 
  Award, 
  Zap, 
  Sparkles, 
  Star, 
  Crown, 
  ShieldCheck, 
  BookOpen, 
  HeartHandshake, 
  Users, 
  CheckCircle2, 
  ChevronRight,
  Gift,
  Medal,
  Shield
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../types';

export const LeaderboardView: React.FC = () => {
  const {
    currentUser,
    circles,
    activeCircleId,
    badges,
    triggerCelebration,
    isAuthenticated,
    setIsAuthModalOpen,
    setActiveTab,
  } = useApp();

  const [leaderboardTimeframe, setLeaderboardTimeframe] = useState<'weekly' | 'allTime'>('weekly');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="space-y-4 pb-12 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs text-center space-y-4 max-w-lg mx-auto mt-4">
          <div className="w-14 h-14 rounded-3xl bg-teal-50 text-teal-800 flex items-center justify-center mx-auto shadow-2xs">
            <Shield className="w-7 h-7 text-teal-700" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Peringkat Anggota Bersifat Terbatas
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
              Silakan masuk ke akun Anda terlebih dahulu untuk melihat papan peringkat kebaikan, perolehan lencana, dan apresiasi anggota.
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

  // Compile member rankings
  const allMembers = circles.flatMap((c) => c.members);
  // Deduplicate members by id
  const uniqueMembersMap = new Map<string, typeof allMembers[0]>();
  allMembers.forEach((m) => {
    if (!uniqueMembersMap.has(m.id)) {
      uniqueMembersMap.set(m.id, m);
    }
  });

  // Include current user in ranking
  const memberList = Array.from(uniqueMembersMap.values()).map((m) => {
    if (m.id === currentUser.id) {
      return {
        ...m,
        contributionPoints: currentUser.points,
      };
    }
    return m;
  });

  const sortedMembers = memberList.sort(
    (a, b) => b.contributionPoints - a.contributionPoints
  );

  const top1 = sortedMembers[0];
  const top2 = sortedMembers[1];
  const top3 = sortedMembers[2];
  const restRankings = sortedMembers.slice(3);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen className="w-5 h-5" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5" />;
      case 'CheckCircle2':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'Users':
        return <Users className="w-5 h-5" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-5 h-5" />;
      default:
        return <Award className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold font-display">
            <Trophy className="w-4 h-4 text-amber-500" />
            Gamifikasi & Berlomba dalam Kebaikan
          </div>
          <p className="text-xs text-slate-500">
            Apresiasi kontribusi ilmu, penyelesaian target tim, dan amanah kas.
          </p>
        </div>

        <button
          onClick={triggerCelebration}
          className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-amber-100 text-amber-900 text-xs font-bold hover:bg-amber-200 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Rayakan!
        </button>
      </div>

      {/* Timeframe Switcher */}
      <div className="grid grid-cols-2 gap-1 bg-slate-200/70 p-1 rounded-2xl">
        <button
          onClick={() => setLeaderboardTimeframe('weekly')}
          className={`py-2 text-xs font-semibold rounded-xl transition-all ${
            leaderboardTimeframe === 'weekly'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Pekan Ini (Fastabiqul Khairat)
        </button>

        <button
          onClick={() => setLeaderboardTimeframe('allTime')}
          className={`py-2 text-xs font-semibold rounded-xl transition-all ${
            leaderboardTimeframe === 'allTime'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sepanjang Masa
        </button>
      </div>

      {/* Top 3 Podium Card */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 text-center space-y-1 mb-4">
          <span className="text-[11px] font-bold text-amber-400 tracking-wider uppercase">
            Top Kontributor Kebaikan
          </span>
          <h3 className="text-lg font-bold font-display text-white">
            Podium Teladan Lingkar
          </h3>
        </div>

        {/* 3 Podium Columns */}
        <div className="grid grid-cols-3 gap-2 items-end pt-4 pb-2">
          {/* #2 Rank (Silver) */}
          {top2 && (
            <div className="flex flex-col items-center space-y-2">
              <div className="relative">
                <img
                  src={top2.avatar}
                  alt={top2.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-full object-cover ring-3 ring-slate-400 shadow-lg"
                />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-300 text-slate-950 text-xs font-black flex items-center justify-center border-2 border-slate-900 shadow-sm">
                  2
                </span>
              </div>
              <div className="text-center">
                <div className="font-bold text-xs text-slate-200 truncate max-w-[85px]">
                  {top2.name.split(' ')[0]}
                </div>
                <div className="text-[11px] font-semibold text-slate-400">
                  {top2.contributionPoints} Pts
                </div>
              </div>
              <div className="w-full h-16 bg-slate-800/90 rounded-2xl border border-slate-700/60 flex items-center justify-center text-xs font-bold text-slate-300 gap-1">
                <Medal className="w-3.5 h-3.5 text-slate-300" />
                <span>Perak</span>
              </div>
            </div>
          )}

          {/* #1 Rank (Gold) */}
          {top1 && (
            <div className="flex flex-col items-center space-y-2 -mt-4">
              <div className="relative">
                <Crown className="w-6 h-6 text-amber-400 fill-amber-400 mx-auto -mb-1 animate-bounce" />
                <img
                  src={top1.avatar}
                  alt={top1.name}
                  referrerPolicy="no-referrer"
                  className="w-18 h-18 rounded-full object-cover ring-4 ring-amber-400 shadow-xl"
                />
                <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center border-2 border-slate-900 shadow-md">
                  1
                </span>
              </div>
              <div className="text-center">
                <div className="font-bold text-sm text-amber-300 truncate max-w-[95px]">
                  {top1.name.split(' ')[0]}
                </div>
                <div className="text-xs font-bold text-amber-400">
                  {top1.contributionPoints} Pts
                </div>
              </div>
              <div className="w-full h-24 bg-gradient-to-t from-amber-600/30 to-amber-500/20 rounded-2xl border border-amber-500/40 flex flex-col items-center justify-center text-xs font-black text-amber-300 shadow-inner">
                <div className="flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Emas</span>
                </div>
                <span className="text-[9px] text-amber-200/80 font-normal">Fastabiqul</span>
              </div>
            </div>
          )}

          {/* #3 Rank (Bronze) */}
          {top3 && (
            <div className="flex flex-col items-center space-y-2">
              <div className="relative">
                <img
                  src={top3.avatar}
                  alt={top3.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-full object-cover ring-3 ring-amber-700/80 shadow-lg"
                />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-700 text-amber-100 text-xs font-black flex items-center justify-center border-2 border-slate-900 shadow-sm">
                  3
                </span>
              </div>
              <div className="text-center">
                <div className="font-bold text-xs text-slate-200 truncate max-w-[85px]">
                  {top3.name.split(' ')[0]}
                </div>
                <div className="text-[11px] font-semibold text-slate-400">
                  {top3.contributionPoints} Pts
                </div>
              </div>
              <div className="w-full h-12 bg-slate-800/90 rounded-2xl border border-slate-700/60 flex items-center justify-center text-xs font-bold text-amber-500 gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Perunggu</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rest Ranking List */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-2.5">
        <h4 className="font-bold text-slate-900 text-sm font-display">
          Daftar Kontributor Tim
        </h4>

        <div className="space-y-1.5">
          {sortedMembers.map((member, idx) => {
            const isMe = member.id === currentUser.id;
            return (
              <div
                key={member.id}
                className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                  isMe
                    ? 'bg-amber-50/80 border border-amber-200 shadow-2xs'
                    : 'bg-slate-50 border border-slate-100 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-black text-xs text-slate-400">
                    #{idx + 1}
                  </span>
                  <img
                    src={member.avatar}
                    alt={member.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-white"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-xs">
                        {member.name}
                      </span>
                      {isMe && (
                        <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 font-bold text-[9px] rounded-md">
                          Anda
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">{member.role}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{member.contributionPoints} Pts</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges Collection (Lencana Kebaikan) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-bold text-slate-900 text-sm font-display">
              Lencana Kebaikan (Milestones)
            </h4>
            <p className="text-[11px] text-slate-500">
              Raih lencana dengan aktif berbagi, menuntaskan checklist, dan menjaga kas.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-600">
            {badges.filter((b) => b.unlocked).length} / {badges.length} Terbuka
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {badges.map((badge) => (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                badge.unlocked
                  ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                  : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-80'
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    badge.unlocked
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {getBadgeIcon(badge.iconName)}
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    badge.tier === 'Berlian'
                      ? 'bg-cyan-100 text-cyan-800'
                      : badge.tier === 'Emas'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {badge.tier}
                </span>
              </div>

              <div className="mt-2.5 space-y-0.5">
                <div className="font-bold text-xs text-slate-900 truncate">
                  {badge.name}
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                  {badge.description}
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-black/5 flex items-center justify-between text-[10px]">
                <span className="font-medium text-slate-500">
                  {badge.unlocked ? '✓ Terbuka' : `${badge.progressPercent}% Target`}
                </span>
                <span className="font-bold text-amber-700">
                  {badge.pointsRequired} Pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div
              className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg ${
                selectedBadge.unlocked
                  ? 'bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-950'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {getBadgeIcon(selectedBadge.iconName)}
            </div>

            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                Tingkat {selectedBadge.tier}
              </span>
              <h3 className="font-bold text-slate-900 text-base font-display">
                {selectedBadge.name}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedBadge.description}
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Poin Dibutuhkan:</span>
                <span className="font-bold text-slate-800">{selectedBadge.pointsRequired} Pts</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Status Lencana:</span>
                <span className={`font-bold ${selectedBadge.unlocked ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {selectedBadge.unlocked ? `Terbuka (${selectedBadge.unlockedAt || 'Agustus 2026'})` : 'Dalam Proses'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
