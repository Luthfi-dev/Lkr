import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Plus, 
  Key, 
  ShieldCheck, 
  Wallet, 
  Calendar, 
  CheckCircle2, 
  Copy, 
  Check, 
  Layers, 
  Tag, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Circle, CircleCategory } from '../types';

interface CirclesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CirclesModal: React.FC<CirclesModalProps> = ({ isOpen, onClose }) => {
  const {
    circles,
    currentUser,
    activeCircleId,
    setActiveCircleId,
    createCircle,
    joinCircleByCode,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'myCircles' | 'join' | 'create'>('myCircles');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinFeedback, setJoinFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  const myCircles = circles.filter((c) =>
    c.members?.some(
      (m) =>
        m.id === currentUser.id ||
        (m.email && currentUser.email && m.email.toLowerCase() === currentUser.email.toLowerCase())
    ) ||
    (Array.isArray(currentUser.joinedCircleIds) && currentUser.joinedCircleIds.includes(c.id)) ||
    c.adminId === currentUser.id
  );

  // Form for creating new circle
  const [newCircleName, setNewCircleName] = useState('');
  const [newCircleCategory, setNewCircleCategory] = useState<CircleCategory>('Kelompok Studi');
  const [newCircleDescription, setNewCircleDescription] = useState('');
  const [newCircleTags, setNewCircleTags] = useState('');
  const [copiedCodeCircleId, setCopiedCodeCircleId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    const res = joinCircleByCode(joinCodeInput);
    setJoinFeedback(res);
    if (res.success) {
      setTimeout(() => {
        onClose();
        setJoinFeedback(null);
        setJoinCodeInput('');
      }, 1200);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCircleName.trim()) return;
    const tagsArray = newCircleTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    createCircle({
      name: newCircleName.trim(),
      category: newCircleCategory,
      description: newCircleDescription.trim(),
      tags: tagsArray,
    });

    setNewCircleName('');
    setNewCircleDescription('');
    setNewCircleTags('');
    onClose();
  };

  const handleCopyCode = (circle: Circle) => {
    navigator.clipboard.writeText(circle.code);
    setCopiedCodeCircleId(circle.id);
    setTimeout(() => setCopiedCodeCircleId(null), 2000);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#f8fafc] rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base font-display">
                Kelola & Jelajahi Lingkar Tim
              </h3>
              <p className="text-xs text-slate-500">
                Wadah kolaborasi, belajar bersama, dan kas transparan.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-4 pb-0">
          <div className="grid grid-cols-3 gap-1 bg-slate-200/70 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('myCircles')}
              className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'myCircles'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lingkar Saya ({myCircles.length})
            </button>

            <button
              onClick={() => setActiveTab('join')}
              className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'join'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Gabung Kode
            </button>

            <button
              onClick={() => setActiveTab('create')}
              className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'create'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + Buat Baru
            </button>
          </div>
        </div>

        {/* Tab 1: Lingkar Saya */}
        {activeTab === 'myCircles' && (
          <div className="p-4 space-y-3">
            {myCircles.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Belum Ada Lingkar</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                    Anda belum tergabung dalam grup atau lingkar manapun. Masukkan kode undangan atau buat lingkar baru!
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => setActiveTab('join')}
                    className="px-4 py-2 rounded-xl bg-teal-50 text-teal-800 text-xs font-bold hover:bg-teal-100 transition-colors"
                  >
                    Gabung dengan Kode
                  </button>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-4 py-2 rounded-xl bg-teal-800 text-white text-xs font-bold hover:bg-teal-900 transition-colors"
                  >
                    + Buat Lingkar Baru
                  </button>
                </div>
              </div>
            ) : (
              myCircles.map((circle) => {
                const isSelected = activeCircleId === circle.id;
                const isCopied = copiedCodeCircleId === circle.id;

                return (
                  <div
                    key={circle.id}
                    className={`p-4 rounded-3xl border transition-all space-y-3 ${
                      isSelected
                        ? 'bg-teal-50/70 border-teal-300 shadow-xs'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={circle.avatar}
                          alt={circle.name}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-2xl object-cover ring-2 ring-slate-100 flex-shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">
                              {circle.name}
                            </h4>
                            {isSelected && (
                              <span className="px-2 py-0.2 rounded-md bg-teal-600 text-white text-[10px] font-bold">
                                Aktif
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-semibold text-teal-800 block mt-0.5">
                            {circle.category} • {circle.members.length} Anggota
                          </span>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {circle.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Meta Bar: Kas Balance & Kode Undangan */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50/90 p-2.5 rounded-2xl text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          Saldo Kas Lingkar
                        </span>
                        <span className="font-bold text-slate-900 text-xs">
                          {formatRupiah(circle.kasBalance)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          Kode Undangan Tim
                        </span>
                        <button
                          onClick={() => handleCopyCode(circle)}
                          className="inline-flex items-center gap-1 font-mono font-bold text-teal-800 hover:text-teal-950 text-xs"
                        >
                          <span>{circle.code}</span>
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Actions: Pilih Lingkar Ini */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center -space-x-1.5">
                        {circle.members.slice(0, 4).map((m) => (
                          <img
                            key={m.id}
                            src={m.avatar}
                            alt={m.name}
                            referrerPolicy="no-referrer"
                            className="w-6 h-6 rounded-full object-cover ring-2 ring-white"
                            title={`${m.name} (${m.role})`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          setActiveCircleId(circle.id);
                          onClose();
                        }}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white'
                            : 'bg-teal-800 text-white hover:bg-teal-900 shadow-2xs'
                        }`}
                      >
                        {isSelected ? '✓ Sedang Terpilih' : 'Jadikan Lingkar Aktif'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Gabung Kode */}
        {activeTab === 'join' && (
          <div className="p-5 space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto text-xl">
                <Key className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h4 className="font-bold text-slate-900 text-base font-display">
                  Gabung dengan Kode Tim
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Minta 6-8 digit kode undangan unik kepada koordinator lingkar Anda (contoh: <code>AI-STUDY-88</code>).
                </p>
              </div>

              <form onSubmit={handleJoin} className="space-y-3">
                <input
                  type="text"
                  placeholder="Masukkan Kode (e.g. AI-STUDY-88)"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  required
                  className="w-full text-center tracking-widest font-mono font-bold uppercase px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />

                {joinFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs text-center font-semibold animate-in fade-in ${
                      joinFeedback.success
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {joinFeedback.message}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-teal-800 text-white font-bold text-xs hover:bg-teal-900 shadow-md transition-all active:scale-95"
                >
                  Gabung ke Lingkar Sekarang →
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 3: Buat Lingkar Baru */}
        {activeTab === 'create' && (
          <div className="p-5 space-y-4">
            <form onSubmit={handleCreate} className="space-y-3.5 bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Lingkar Tim / Komunitas
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Komunitas Relawan Baca Pesisir"
                  value={newCircleName}
                  onChange={(e) => setNewCircleName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Kategori Tim
                </label>
                <select
                  value={newCircleCategory}
                  onChange={(e) => setNewCircleCategory(e.target.value as CircleCategory)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Kelompok Studi">Kelompok Studi (Study Group)</option>
                  <option value="Organisasi Akar Rumput">Organisasi Akar Rumput (Grassroots)</option>
                  <option value="Divisi Kerja">Divisi Kerja (Work Division)</option>
                  <option value="Support Group">Support Group (Ruang Saling Dukung)</option>
                  <option value="Komunitas Kebaikan">Komunitas Kebaikan & Relawan</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Deskripsi & Visi Lingkar
                </label>
                <textarea
                  placeholder="Ceritakan fokus belajar, target amal, atau tujuan divisi ini..."
                  value={newCircleDescription}
                  onChange={(e) => setNewCircleDescription(e.target.value)}
                  rows={3}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tags / Topik (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  placeholder="Pendidikan, Riset, AI, Desain"
                  value={newCircleTags}
                  onChange={(e) => setNewCircleTags(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-teal-800 text-white font-bold text-xs hover:bg-teal-900 shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Inisiasi Lingkar Baru (+100 Pts)
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
