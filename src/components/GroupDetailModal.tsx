import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Wallet, 
  CheckCircle2, 
  Copy, 
  Check, 
  Calendar, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  MessageSquare,
  Share2,
  Tag,
  KeyRound,
  Link as LinkIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { copyToClipboard } from '../utils/clipboard';
import { Circle } from '../types';

interface GroupDetailModalProps {
  circle: Circle | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateTask?: () => void;
}

export const GroupDetailModal: React.FC<GroupDetailModalProps> = ({
  circle,
  isOpen,
  onClose,
  onOpenCreateTask,
}) => {
  const {
    currentUser,
    tasks,
    setActiveCircleId,
    openGroupRoom,
  } = useApp();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'members' | 'tasks'>('info');

  if (!isOpen || !circle) return null;

  const groupTasks = tasks.filter((t) => t.circleId === circle.id);
  const activeTasks = groupTasks.filter((t) => t.status !== 'done');
  const myRole = circle.members.find((m) => m.id === currentUser.id)?.role || 'Anggota';

  const handleCopyCode = () => {
    copyToClipboard(circle.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && circle) {
      const link = `${window.location.origin}/#join/${circle.code}`;
      if (navigator.share) {
        navigator.share({
          title: `Bergabung ke grup ${circle.name}`,
          text: `Ayo bergabung ke grup ${circle.name} di Lingkar App! Kode: ${circle.code}`,
          url: link,
        }).catch(() => {
          copyToClipboard(link);
        });
      } else {
        copyToClipboard(link);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleEnterWorkspace = () => {
    setActiveCircleId(circle.id);
    openGroupRoom(circle.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#f8fafc] rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in slide-in-from-bottom duration-200 flex flex-col">
        {/* Top Drag Handle for mobile sheet feel */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Group Header Hero */}
        <div className="relative bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-5 rounded-t-2xl sm:rounded-t-3xl flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-95"
            aria-label="Tutup Rincian Grup"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5">
            <img
              src={circle.avatar}
              alt={circle.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-teal-400/80 shadow-md flex-shrink-0"
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-500/30 text-teal-200 border border-teal-400/30 rounded-full">
                  {circle.category}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-white/10 text-white rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-teal-400" />
                  Peran Anda: {myRole}
                </span>
              </div>

              <h3 className="text-lg font-display font-bold text-white tracking-tight leading-snug mt-1.5">
                {circle.name}
              </h3>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
            <div className="bg-white/5 rounded-xl p-2 border border-white/5">
              <div className="text-xs font-bold text-teal-300">
                Rp {circle.kasBalance.toLocaleString('id-ID')}
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5 font-medium">Kas Transparan</div>
            </div>

            <div className="bg-white/5 rounded-xl p-2 border border-white/5">
              <div className="text-xs font-bold text-white">
                {circle.members.length} Anggota
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5 font-medium">Tim Kolaborasi</div>
            </div>

            <div className="bg-white/5 rounded-xl p-2 border border-white/5">
              <div className="text-xs font-bold text-amber-300">
                {activeTasks.length} Berjalan
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5 font-medium">Target Aktif</div>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 px-4 pt-2 bg-white flex-shrink-0">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'info'
                ? 'border-teal-800 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Ringkasan
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'members'
                ? 'border-teal-800 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Anggota ({circle.members.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'tasks'
                ? 'border-teal-800 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Target ({activeTasks.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 space-y-4 flex-1">
          {activeTab === 'info' && (
            <div className="space-y-3.5">
              {/* Description Card */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Tentang Grup
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {circle.description}
                </p>
                {circle.tags && circle.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-2.5 pt-2 border-t border-slate-100">
                    {circle.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Join Code Card */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Kode Undangan Tim
                    </span>
                    <span className="text-sm font-mono font-bold text-slate-900 tracking-wider">
                      {circle.code}
                    </span>
                  </div>

                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-teal-700" />
                        <span className="text-teal-700">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Kode</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">Atau bagikan link langsung:</span>
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>{copiedLink ? 'Link Tersalin!' : 'Salin / Bagikan Link'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {circle.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{member.name}</div>
                      <div className="text-[10px] text-slate-400">{member.role}</div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-lg bg-teal-50 text-teal-800 text-[10px] font-bold border border-teal-100">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {activeTasks.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Belum ada target aktif untuk grup ini.
                </div>
              ) : (
                activeTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{t.title}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>Tenggat: {t.deadline}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 text-[10px] font-bold flex-shrink-0">
                      {t.progress}% Selesai
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Tutup
            </button>

            <button
              onClick={handleEnterWorkspace}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Buka Ruang Kerja Tim</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
