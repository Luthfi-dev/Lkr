import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Award,
  Users,
  Repeat,
  Calendar,
  ChevronDown,
  ChevronUp,
  Flame,
  Filter,
  Search,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Star
} from 'lucide-react';
import { Circle, Task, User, CircleMember } from '../types';
import { useApp } from '../context/AppContext';

interface GroupEvaluationViewProps {
  circleId?: string;
  circle?: Circle;
  tasks?: Task[];
  currentUser?: User;
  onOpenTaskDetail?: (task: Task) => void;
}

export const GroupEvaluationView: React.FC<GroupEvaluationViewProps> = ({
  circleId,
  circle: propCircle,
  tasks: propTasks,
  currentUser: propUser,
  onOpenTaskDetail,
}) => {
  const { circles, tasks: contextTasks, currentUser: contextUser } = useApp();

  const circle = propCircle || (circleId ? circles.find((c) => c.id === circleId) : circles[0]);
  const tasks = propTasks || contextTasks || [];
  const currentUser = propUser || contextUser;

  const [timeFilter, setTimeFilter] = useState<'all' | 'month' | 'week'>('all');
  const [memberSearch, setMemberSearch] = useState('');
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'history'>('overview');

  if (!circle) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
        Data grup tidak ditemukan.
      </div>
    );
  }

  // Filter tasks for this circle
  const groupTasks = (tasks || []).filter((t) => t && t.circleId === circle.id);

  // Overall metrics
  const totalTasksCount = groupTasks.length;
  const doneTasks = groupTasks.filter((t) => t.status === 'done');
  const ongoingTasks = groupTasks.filter((t) => t.status === 'ongoing');
  const todoTasks = groupTasks.filter((t) => t.status === 'todo');
  const recurringTasks = groupTasks.filter((t) => t.frequency && t.frequency !== 'once');

  const completionRate = totalTasksCount > 0 
    ? Math.round((doneTasks.length / totalTasksCount) * 100) 
    : 0;

  // Chart Data: Status Breakdown
  const statusPieData = [
    { name: 'Selesai', value: doneTasks.length, color: '#0d9488' }, // teal-600
    { name: 'Sedang Proses', value: ongoingTasks.length, color: '#f59e0b' }, // amber-500
    { name: 'Belum Mulai', value: todoTasks.length, color: '#94a3b8' }, // slate-400
  ].filter((d) => d.value > 0);

  // Member-by-Member Performance Calculation
  const membersList = circle.members || [];
  const membersEvaluation = membersList.map((member) => {
    // Tasks where member is an assignee
    const assignedTasks = groupTasks.filter((t) =>
      (t.assignees || []).some((a) => a && (a.id === member.id || a.name?.toLowerCase() === member.name?.toLowerCase()))
    );

    const completed = assignedTasks.filter((t) => t.status === 'done');
    const inProgress = assignedTasks.filter((t) => t.status === 'ongoing');
    const pending = assignedTasks.filter((t) => t.status === 'todo');
    const rate = assignedTasks.length > 0
      ? Math.round((completed.length / assignedTasks.length) * 100)
      : 0;

    // Calculate subtasks assigned
    let completedSubtasks = 0;
    let totalSubtasks = 0;
    assignedTasks.forEach((t) => {
      (t.subtasks || []).forEach((st) => {
        if (!st.assignedTo || st.assignedTo === member.name || st.assignedTo === member.id) {
          totalSubtasks++;
          if (st.completed) completedSubtasks++;
        }
      });
    });

    // Total points contributed from completed tasks
    const earnedPoints = completed.reduce((acc, t) => acc + (t.pointsReward || 40), 0);

    // Performance status badge
    let statusLabel = 'Produktif';
    let statusBadgeClass = 'bg-teal-50 text-teal-700 border-teal-200';
    if (assignedTasks.length === 0) {
      statusLabel = 'Tersedia';
      statusBadgeClass = 'bg-slate-50 text-slate-600 border-slate-200';
    } else if (rate >= 80) {
      statusLabel = 'Sangat Produktif 🌟';
      statusBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (rate >= 50) {
      statusLabel = 'Berkinerja Baik 👍';
      statusBadgeClass = 'bg-teal-50 text-teal-700 border-teal-200';
    } else {
      statusLabel = 'Perlu Pendampingan ⚠️';
      statusBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
    }

    return {
      member,
      assignedTasks,
      totalAssigned: assignedTasks.length,
      completedCount: completed.length,
      inProgressCount: inProgress.length,
      pendingCount: pending.length,
      rate,
      completedSubtasks,
      totalSubtasks,
      earnedPoints,
      statusLabel,
      statusBadgeClass,
    };
  });

  // Sort members by completion rate and tasks count
  const sortedMembers = [...membersEvaluation].sort((a, b) => {
    if (b.completedCount !== a.completedCount) {
      return b.completedCount - a.completedCount;
    }
    return b.rate - a.rate;
  });

  const filteredMembers = sortedMembers.filter((m) =>
    (m.member.name || '').toLowerCase().includes(memberSearch.toLowerCase()) ||
    (m.member.role || '').toLowerCase().includes(memberSearch.toLowerCase())
  );

  // Bar Chart Data: Member comparison
  const memberBarData = sortedMembers.map((m) => ({
    name: (m.member.name || '').split(' ')[0] || 'Anggota', // First name for mobile chart
    fullName: m.member.name || 'Anggota',
    Selesai: m.completedCount,
    'Belum Selesai': m.inProgressCount + m.pendingCount,
    rate: m.rate,
  }));

  // Aggregate completion histories from all tasks
  const allHistoryRecords: {
    taskId: string;
    taskTitle: string;
    category: string;
    completedAt: string;
    completedByName: string;
    pointsEarned?: number;
    note?: string;
    frequency?: string;
  }[] = [];

  groupTasks.forEach((t) => {
    if (t.completionHistory && t.completionHistory.length > 0) {
      t.completionHistory.forEach((rec) => {
        allHistoryRecords.push({
          taskId: t.id,
          taskTitle: t.title,
          category: t.category,
          completedAt: rec.completedAt,
          completedByName: rec.completedByName,
          pointsEarned: rec.pointsEarned || t.pointsReward,
          note: rec.note,
          frequency: t.frequency,
        });
      });
    } else if (t.status === 'done') {
      allHistoryRecords.push({
        taskId: t.id,
        taskTitle: t.title,
        category: t.category,
        completedAt: t.completedAt || 'Baru saja',
        completedByName: t.completedByName || (t.assignees?.[0]?.name || 'Anggota Tim'),
        pointsEarned: t.pointsReward,
        note: 'Tugas diselesaikan dengan tuntas',
        frequency: t.frequency,
      });
    }
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Subtab Toggle for Evaluation View */}
      <div className="flex items-center justify-between gap-2 p-1 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-0.5 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Ringkasan & Grafik</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'members'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Evaluasi Anggota ({circle.members.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Log Riwayat ({allHistoryRecords.length})</span>
          </button>
        </div>
      </div>

      {/* ================= SECTION 1: OVERVIEW & GRAFIK ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* 4 Metric Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">Tingkat Selesai</span>
                <span className="p-1.5 bg-emerald-50 rounded-xl text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black text-slate-900">{completionRate}%</div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-teal-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">Tugas Selesai</span>
                <span className="p-1.5 bg-teal-50 rounded-xl text-teal-600">
                  <Award className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black text-teal-700">
                  {doneTasks.length} <span className="text-xs text-slate-400 font-normal">/ {totalTasksCount}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {ongoingTasks.length} sedang berjalan
                </p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">Tugas Rutin / Ulang</span>
                <span className="p-1.5 bg-indigo-50 rounded-xl text-indigo-600">
                  <Repeat className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black text-indigo-700">
                  {recurringTasks.length}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Harian, mingguan, bulanan
                </p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">Total Anggota</span>
                <span className="p-1.5 bg-amber-50 rounded-xl text-amber-600">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black text-slate-900">
                  {circle.members.length}
                </div>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                  100% Berpartisipasi
                </p>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            {/* Bar Chart: Beban & Kinerja per Anggota */}
            <div className="lg:col-span-8 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Kinerja Tugas per Anggota Tim</h3>
                  <p className="text-xs text-slate-500">Perbandingan tugas yang telah diselesaikan vs belum selesai</p>
                </div>
                <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-200">
                  Evaluasi Real-time
                </span>
              </div>

              {memberBarData.length > 0 ? (
                <div className="h-64 sm:h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={memberBarData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        interval={0}
                      />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const dataItem = payload[0].payload;
                            return (
                              <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-lg space-y-1">
                                <p className="font-bold text-teal-300">{dataItem.fullName}</p>
                                <p className="text-emerald-400">✅ Selesai: {dataItem.Selesai}</p>
                                <p className="text-amber-400">⏳ Belum Selesai: {dataItem['Belum Selesai']}</p>
                                <p className="text-slate-300">Tingkat Penyelesaian: {dataItem.rate}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="Selesai" fill="#0d9488" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Belum Selesai" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Belum ada data tugas untuk digambarkan.
                </div>
              )}

              <div className="flex items-center justify-center gap-4 text-xs font-semibold pt-1">
                <span className="flex items-center gap-1.5 text-teal-700">
                  <span className="w-3 h-3 rounded-xs bg-teal-600 inline-block" /> Tugas Selesai
                </span>
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block" /> Belum Selesai / Proses
                </span>
              </div>
            </div>

            {/* Pie Chart: Status Breakdown */}
            <div className="lg:col-span-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Distribusi Status Tugas</h3>
                <p className="text-xs text-slate-500">Kategori status {totalTasksCount} total tugas grup</p>
              </div>

              {statusPieData.length > 0 ? (
                <div className="h-48 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: number) => [`${val} Tugas`, 'Jumlah']}
                        contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs text-slate-400 font-medium">Selesai</span>
                    <span className="text-lg font-black text-teal-700">{completionRate}%</span>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Belum ada tugas dibuat.
                </div>
              )}

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-50">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-600" /> Selesai Tuntas
                  </span>
                  <span className="font-bold text-slate-900">{doneTasks.length}</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-50">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Sedang Dikerjakan
                  </span>
                  <span className="font-bold text-slate-900">{ongoingTasks.length}</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-50">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Belum Dimulai
                  </span>
                  <span className="font-bold text-slate-900">{todoTasks.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 2: INDIVIDUAL MEMBER EVALUATION ================= */}
      {activeTab === 'members' && (
        <div className="space-y-3.5">
          {/* Search bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Cari nama anggota atau peran..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              {filteredMembers.length} Anggota Terdaftar
            </span>
          </div>

          {/* Member Evaluation Cards */}
          <div className="space-y-2.5">
            {filteredMembers.map((item) => {
              const isExpanded = expandedMemberId === item.member.id;
              const m = item.member;

              return (
                <div
                  key={m.id}
                  className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-teal-200 transition-all"
                >
                  {/* Member Top Info Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={m.avatar}
                        alt={m.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900">{m.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {m.role}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.statusBadgeClass}`}>
                            {item.statusLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Bergabung: {m.joinedAt} • Kontribusi: {m.contributionPoints} Poin
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedMemberId(isExpanded ? null : m.id)}
                      className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
                      title={isExpanded ? 'Tutup Rincian' : 'Lihat Rincian Tugas'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Member Performance Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3.5 pt-3.5 border-t border-slate-100">
                    <div className="bg-slate-50 p-2.5 rounded-2xl">
                      <span className="text-[10px] text-slate-500 font-semibold block">Tugas Ditugaskan</span>
                      <span className="text-base font-black text-slate-900">{item.totalAssigned} Tugas</span>
                    </div>

                    <div className="bg-emerald-50/70 p-2.5 rounded-2xl border border-emerald-100">
                      <span className="text-[10px] text-emerald-700 font-semibold block">Selesai Tuntas</span>
                      <span className="text-base font-black text-emerald-800">{item.completedCount} Tugas</span>
                    </div>

                    <div className="bg-amber-50/70 p-2.5 rounded-2xl border border-amber-100">
                      <span className="text-[10px] text-amber-700 font-semibold block">Sedang Proses / Todo</span>
                      <span className="text-base font-black text-amber-800">{item.inProgressCount + item.pendingCount} Tugas</span>
                    </div>

                    <div className="bg-teal-50/70 p-2.5 rounded-2xl border border-teal-100">
                      <span className="text-[10px] text-teal-700 font-semibold block">Tingkat Kelulusan</span>
                      <span className="text-base font-black text-teal-800">{item.rate}%</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                      <span>Progres Penyelesaian Tugas</span>
                      <span>{item.completedCount} dari {item.totalAssigned} Tugas ({item.rate}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.rate >= 80 ? 'bg-emerald-500' : item.rate >= 50 ? 'bg-teal-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${item.totalAssigned > 0 ? item.rate : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Accordion: Specific Tasks Assigned to this Member */}
                  {isExpanded && (
                    <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">Daftar Tugas {m.name}:</span>
                        <span className="text-[11px] text-slate-400">{item.assignedTasks.length} tugas terkait</span>
                      </div>

                      {item.assignedTasks.length > 0 ? (
                        <div className="space-y-1.5">
                          {item.assignedTasks.map((t) => {
                            const isDone = t.status === 'done';
                            return (
                              <div
                                key={t.id}
                                onClick={() => onOpenTaskDetail(t)}
                                className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2 cursor-pointer transition-all hover:bg-slate-50 ${
                                  isDone
                                    ? 'bg-emerald-50/40 border-emerald-200/60'
                                    : 'bg-white border-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                                  )}
                                  <div className="min-w-0">
                                    <h5 className={`text-xs font-bold truncate ${isDone ? 'text-slate-700 line-through' : 'text-slate-900'}`}>
                                      {t.title}
                                    </h5>
                                    <p className="text-[10px] text-slate-500">
                                      Tenggat: {t.deadline} • {t.subtasks.filter((s) => s.completed).length}/{t.subtasks.length} Sub-tahap
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    isDone
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {isDone ? 'Selesai' : 'Berjalan'}
                                  </span>
                                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic py-2">
                          Belum ada tugas spesifik yang ditugaskan ke anggota ini.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= SECTION 3: LOG RIWAYAT & EVALUASI ================= */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Riwayat Penyelesaian Tugas (Completion Log)</h3>
            <p className="text-xs text-slate-500">
              Catatan historis seluruh tugas yang berhasil dituntaskan oleh anggota grup ini
            </p>
          </div>

          {allHistoryRecords.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {allHistoryRecords.map((item, idx) => (
                <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl mt-0.5 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-900">{item.taskTitle}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {item.category}
                        </span>
                        {item.frequency && item.frequency !== 'once' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            🔁 Rutin
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Diselesaikan oleh: <span className="font-semibold text-slate-900">{item.completedByName}</span>
                      </p>
                      {item.note && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5 bg-slate-50 p-1.5 rounded-lg">
                          "{item.note}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block">
                      +{item.pointsEarned} Poin
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 justify-end">
                      <Calendar className="w-3 h-3" />
                      {item.completedAt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Belum ada riwayat tugas yang diselesaikan di grup ini.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
