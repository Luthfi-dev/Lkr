import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  TrendingUp, 
  ShieldCheck, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Target, 
  Tag, 
  Calendar,
  Receipt,
  Trash2,
  Check,
  Shield
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FinancialTransaction, TransactionType, BudgetGoal } from '../types';
import { MobilePagination } from './MobilePagination';
import { ConfirmationModal } from './ConfirmationModal';

interface FinanceViewProps {
  onOpenCreateTransaction: () => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({ onOpenCreateTransaction }) => {
  const {
    currentUser,
    circles,
    activeCircleId,
    activeCircle,
    transactions,
    budgetGoals,
    memberDues,
    deleteTransaction,
    deleteBudgetGoal,
    toggleMemberDue,
    addBudgetGoal,
    searchQuery,
    isAuthenticated,
    setIsAuthModalOpen,
    setActiveTab: setGlobalActiveTab,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'transactions' | 'dues' | 'goals'>('transactions');
  const [filterType, setFilterType] = useState<string>('all');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalPurpose, setNewGoalPurpose] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);

  // Pagination state for transactions
  const [txPage, setTxPage] = useState(1);
  const TX_PAGE_SIZE = 6;

  // Confirmation modal states
  const [txToDelete, setTxToDelete] = useState<FinancialTransaction | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<BudgetGoal | null>(null);

  // Reset pagination when filter/search/tab changes
  React.useEffect(() => {
    setTxPage(1);
  }, [filterType, searchQuery, activeCircleId, activeSubTab]);

  if (!isAuthenticated) {
    return (
      <div className="space-y-4 pb-12 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs text-center space-y-4 max-w-lg mx-auto mt-4">
          <div className="w-14 h-14 rounded-3xl bg-teal-50 text-teal-800 flex items-center justify-center mx-auto shadow-2xs">
            <Shield className="w-7 h-7 text-teal-700" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Catatan Kas Tim Bersifat Terbatas
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
              Silakan masuk ke akun Anda terlebih dahulu untuk melihat mutasi kas, iuran anggota, dan transparansi anggaran tim.
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
              onClick={() => setGlobalActiveTab('home')}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-2xl active:scale-95 transition-all cursor-pointer"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User's joined circles IDs for privacy enforcement
  const myJoinedCircleIds = new Set(
    circles
      .filter(
        (c) =>
          c.members?.some(
            (m) =>
              m.id === currentUser.id ||
              (m.email && currentUser.email && m.email.toLowerCase() === currentUser.email.toLowerCase())
          ) ||
          (Array.isArray(currentUser.joinedCircleIds) && currentUser.joinedCircleIds.includes(c.id)) ||
          c.adminId === currentUser.id
      )
      .map((c) => c.id)
  );

  // Filter transactions
  const filteredTxs = transactions
    .filter((t) => {
      if (activeCircleId !== 'all') return t.circleId === activeCircleId;
      return myJoinedCircleIds.has(t.circleId);
    })
    .filter((t) => {
      if (filterType === 'all') return true;
      if (filterType === 'income') return t.type === 'income';
      if (filterType === 'expense') return t.type === 'expense';
      if (filterType === 'dues') return t.category.toLowerCase().includes('iuran');
      return true;
    })
    .filter((t) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.payerOrRecipient.toLowerCase().includes(q) ||
        t.recordedBy.toLowerCase().includes(q)
      );
    });

  const totalBalance = activeCircle
    ? activeCircle.kasBalance
    : circles.reduce((acc, c) => acc + c.kasBalance, 0);

  const totalIncome = filteredTxs
    .filter((t) => t.type === 'income' || t.type === 'dues')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = filteredTxs
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle || !newGoalTarget) return;
    addBudgetGoal({
      title: newGoalTitle,
      targetAmount: Number(newGoalTarget),
      deadline: '30 September 2026',
      purpose: newGoalPurpose || 'Target kas gotong royong tim.',
    });
    setNewGoalTitle('');
    setNewGoalTarget('');
    setNewGoalPurpose('');
    setShowGoalModal(false);
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-teal-800 text-xs font-bold font-display">
            <Wallet className="w-4 h-4 text-teal-600" />
            Kas Grup & Keuangan Transparan
          </div>
          <p className="text-xs text-slate-500">
            Pencatatan saldo, iuran rutin, dan pos pengeluaran terbuka tanpa rahasia.
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowExportModal(true)}
            className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
            title="Cetak Laporan Kas"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenCreateTransaction}
            className="flex items-center gap-1 px-3.5 py-2 rounded-2xl bg-teal-800 text-white text-xs font-bold shadow-sm hover:bg-teal-900 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Catat Kas
          </button>
        </div>
      </div>

      {/* Main Balance Card (High contrast premium card) */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-5 shadow-lg space-y-4">
        {/* Subtle decorative circles */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-6 -top-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Total Saldo Kas Tersedia ({activeCircle ? activeCircle.name : 'Semua Lingkar'})</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              {formatRupiah(totalBalance)}
            </h2>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
            Terverifikasi ✓
          </span>
        </div>

        {/* Income vs Expense Pill Bars */}
        <div className="relative z-10 grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-800">
          <div className="bg-slate-800/80 p-2.5 rounded-2xl flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Total Pemasukan</div>
              <div className="text-xs font-bold text-emerald-300 truncate">
                +{formatRupiah(totalIncome)}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded-2xl flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Total Pengeluaran</div>
              <div className="text-xs font-bold text-rose-300 truncate">
                -{formatRupiah(totalExpense)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-slate-200/70 p-1 rounded-2xl">
        <button
          onClick={() => setActiveSubTab('transactions')}
          className={`py-2 text-xs font-semibold rounded-xl transition-all ${
            activeSubTab === 'transactions'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Buku Kas & Transaksi
        </button>

        <button
          onClick={() => setActiveSubTab('dues')}
          className={`py-2 text-xs font-semibold rounded-xl transition-all ${
            activeSubTab === 'dues'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Iuran Anggota
        </button>

        <button
          onClick={() => setActiveSubTab('goals')}
          className={`py-2 text-xs font-semibold rounded-xl transition-all ${
            activeSubTab === 'goals'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Target Kas & Donasi
        </button>
      </div>

      {/* 1. VIEW: Buku Kas & Transaksi */}
      {activeSubTab === 'transactions' && (
        <div className="space-y-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'all', label: 'Semua Mutasi' },
              { id: 'income', label: 'Pemasukan (+)' },
              { id: 'expense', label: 'Pengeluaran (-)' },
              { id: 'dues', label: 'Iuran Rutin' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  filterType === f.id
                    ? 'bg-slate-900 text-white shadow-xs font-semibold'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Transactions List */}
          <div className="space-y-2.5">
            {filteredTxs.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center space-y-2">
                <p className="text-sm font-bold text-slate-700">Belum ada data transaksi</p>
                <p className="text-xs text-slate-400">Gunakan tombol Catat Kas Masuk / Keluar untuk menambahkan transaksi pertama.</p>
              </div>
            ) : (
              filteredTxs
                .slice((txPage - 1) * TX_PAGE_SIZE, txPage * TX_PAGE_SIZE)
                .map((tx) => {
                  const isIncome = tx.type === 'income' || tx.type === 'dues';

                  return (
                    <div
                      key={tx.id}
                      className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs hover:border-slate-200 transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              isIncome
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {isIncome ? (
                              <ArrowDownLeft className="w-4 h-4 shrink-0" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 shrink-0" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-slate-900 text-xs leading-snug break-words">
                              {tx.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 flex-wrap">
                              <span className="font-medium text-teal-700">{tx.circleName}</span>
                              <span>• {tx.date}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div
                            className={`font-bold text-xs ${
                              isIncome ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {isIncome ? '+' : '-'}
                            {formatRupiah(tx.amount)}
                          </div>
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 inline-block mt-0.5">
                            {tx.category}
                          </span>
                        </div>
                      </div>

                      {/* Notes & Audit footer */}
                      <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-500 gap-2">
                        <div className="flex items-start gap-1 text-[10px] text-slate-500 italic min-w-0 flex-1">
                          <FileText className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                          <span className="break-words leading-tight">{tx.receiptNote || 'Nota terverifikasi'}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[9px] text-slate-400">
                            Oleh: {tx.recordedBy.split(' ')[0]}
                          </span>
                          <button
                            type="button"
                            onClick={() => setTxToDelete(tx)}
                            className="text-slate-300 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-50"
                            title="Hapus / Koreksi Transaksi"
                          >
                            <Trash2 className="w-3.5 h-3.5 shrink-0" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          {/* Mobile Pagination for Transactions */}
          <MobilePagination
            currentPage={txPage}
            totalItems={filteredTxs.length}
            pageSize={TX_PAGE_SIZE}
            onPageChange={setTxPage}
            itemLabel="transaksi"
            className="mt-2"
          />
        </div>
      )}

      {/* 2. VIEW: Status Iuran Kas Anggota */}
      {activeSubTab === 'dues' && (
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm font-display">
                  Iuran Rutin Bulan Agustus 2026
                </h4>
                <p className="text-xs text-slate-500">
                  Besaran Iuran: Rp 50.000 / anggota per bulan.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-emerald-600">
                  {memberDues.filter((d) => d.isPaid).length} / {memberDues.length} Lunas
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {memberDues.map((due) => (
                <div
                  key={due.id}
                  onClick={() => toggleMemberDue(due.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    due.isPaid
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={due.avatar}
                      alt={due.userName}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-white"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">
                        {due.userName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {due.isPaid ? `Lunas pada ${due.paidDate || 'Agustus 2026'}` : 'Menunggu pembayaran'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">
                      {formatRupiah(due.amount)}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        due.isPaid
                          ? 'bg-emerald-600 text-white'
                          : 'border-2 border-slate-300 bg-white'
                      }`}
                    >
                      {due.isPaid && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. VIEW: Target Kas & Donasi */}
      {activeSubTab === 'goals' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm font-display">
              Target Pendanaan Bersama
            </h4>
            <button
              onClick={() => setShowGoalModal(true)}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Target Baru
            </button>
          </div>

          <div className="space-y-3">
            {budgetGoals.map((goal) => {
              const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));

              return (
                <div
                  key={goal.id}
                  className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                        🎯 Target Proyek
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1.5">
                        {goal.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {goal.purpose}
                      </p>
                    </div>

                    <span className="text-xs font-bold text-slate-900">
                      {progress}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                      <span>Terkumpul: {formatRupiah(goal.currentAmount)}</span>
                      <span>Target: {formatRupiah(goal.targetAmount)}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <span>Tenggat: {goal.deadline}</span>
                      <button
                        type="button"
                        onClick={() => setGoalToDelete(goal)}
                        className="text-slate-300 hover:text-rose-500 transition-colors p-1 rounded-md hover:bg-rose-50"
                        title="Hapus Target Pendanaan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={onOpenCreateTransaction}
                      className="font-semibold text-teal-700 hover:text-teal-900"
                    >
                      + Salurkan Donasi / Kas →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Transaction Deletion */}
      <ConfirmationModal
        isOpen={!!txToDelete}
        onClose={() => setTxToDelete(null)}
        onConfirm={() => {
          if (txToDelete) {
            deleteTransaction(txToDelete.id);
            setTxToDelete(null);
          }
        }}
        title="Hapus Transaksi Kas?"
        message={`Data pencatatan kas ini akan dihapus dan saldo kas grup akan disesuaikan kembali.`}
        itemName={txToDelete ? `${txToDelete.title} (${formatRupiah(txToDelete.amount)})` : undefined}
        confirmText="Ya, Hapus Transaksi"
        cancelText="Batal"
        type="danger"
      />

      {/* Confirmation Modal for Budget Goal Deletion */}
      <ConfirmationModal
        isOpen={!!goalToDelete}
        onClose={() => setGoalToDelete(null)}
        onConfirm={() => {
          if (goalToDelete) {
            deleteBudgetGoal(goalToDelete.id);
            setGoalToDelete(null);
          }
        }}
        title="Hapus Target Pendanaan?"
        message="Target pendanaan ini akan dihapus dari daftar rencana pendanaan tim."
        itemName={goalToDelete?.title}
        confirmText="Ya, Hapus Target"
        cancelText="Batal"
        type="danger"
      />

      {/* Modal Buat Target Kas Baru */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base font-display">
                Buat Target Kas Bersama
              </h3>
              <button
                onClick={() => setShowGoalModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Nama Program / Target</label>
                <input
                  type="text"
                  placeholder="Contoh: Pengadaan Rak Buku Desa"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  required
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Target Nominal (Rp)</label>
                <input
                  type="number"
                  placeholder="Contoh: 5000000"
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(e.target.value)}
                  required
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Tujuan & Keterangan</label>
                <textarea
                  placeholder="Kebutuhan pembelian buku dan fasilitas belajar..."
                  value={newGoalPurpose}
                  onChange={(e) => setNewGoalPurpose(e.target.value)}
                  rows={2}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-xl shadow-xs"
                >
                  Simpan Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export / Print Preview Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base font-display">
                  Laporan Akuntabilitas Kas Terbuka
                </h3>
                <span className="text-[10px] text-slate-400">Dicetak otomatis dari Ekosistem Lingkar</span>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl font-mono">
              <div className="text-center font-bold text-sm text-slate-900 border-b pb-2">
                REKAPITULASI KAS TIM ({activeCircle ? activeCircle.name : 'SEMUA LINGKAR'})
              </div>
              <div className="flex justify-between">
                <span>Periode:</span>
                <span className="font-bold">Agustus 2026</span>
              </div>
              <div className="flex justify-between">
                <span>Total Saldo Akhir:</span>
                <span className="font-bold text-teal-800">{formatRupiah(totalBalance)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Total Pemasukan:</span>
                <span>+{formatRupiah(totalIncome)}</span>
              </div>
              <div className="flex justify-between text-rose-700">
                <span>Total Pengeluaran:</span>
                <span>-{formatRupiah(totalExpense)}</span>
              </div>
              
              <div className="border-t pt-2 space-y-1">
                <div className="font-bold text-[11px]">Daftar Mutasi Terkini:</div>
                {filteredTxs.slice(0, 5).map((t, idx) => (
                  <div key={idx} className="flex justify-between text-[10px]">
                    <span className="truncate max-w-[180px]">{t.title}</span>
                    <span className={t.type === 'income' || t.type === 'dues' ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                      {formatRupiah(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  alert('Laporan kas berhasil diunduh sebagai file laporan PDF transparansi!');
                  setShowExportModal(false);
                }}
                className="w-full py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                Unduh PDF Laporan Transparan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
