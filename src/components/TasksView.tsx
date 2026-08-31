import React, { useState } from 'react';
import { 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Flag, 
  Plus, 
  CheckCircle, 
  Clock, 
  Users, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  CalendarSync, 
  Layers, 
  Edit3, 
  Flame, 
  Target, 
  UserCheck, 
  UserPlus,
  Check, 
  CalendarDays, 
  ListTodo, 
  TrendingUp, 
  Share2,
  Shield
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, TaskStatus, Priority } from '../types';
import { CalendarSyncModal } from './CalendarSyncModal';
import { InteractiveCalendar } from './InteractiveCalendar';
import { DelegationModal } from './DelegationModal';
import { SubtaskItem } from './SubtaskItem';
import { MobilePagination } from './MobilePagination';
import { EditTaskModal } from './EditTaskModal';
import { TaskCardSkeleton } from './SkeletonLoader';

interface TasksViewProps {
  onOpenTaskDetail: (task: Task) => void;
  onOpenCreateTask: (defaultDate?: string, initialType?: 'task' | 'meeting') => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  onOpenTaskDetail,
  onOpenCreateTask,
}) => {
  const {
    circles,
    tasks,
    activeCircleId,
    activeCircle,
    toggleSubtask,
    addSubtaskToTask,
    claimSubtask,
    updateTaskStatus,
    toggleDailyStreak,
    createTask,
    searchQuery,
    currentUser,
    isAuthenticated,
    setIsAuthModalOpen,
    setActiveTab: setGlobalActiveTab,
    isInitialLoading,
    isRefreshingData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'cards' | 'calendar' | 'groupGoals' | 'missions'>('cards');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'groupGoal' | 'daily' | 'ongoing' | 'done' | 'high'
  >('all');
  const [isCalendarSyncOpen, setIsCalendarSyncOpen] = useState(false);
  const [syncSelectedTask, setSyncSelectedTask] = useState<Task | undefined>(undefined);
  const [isDelegationModalOpen, setIsDelegationModalOpen] = useState(false);
  const [selectedTaskForDelegation, setSelectedTaskForDelegation] = useState<Task | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Quick inline subtask state for cards
  const [quickSubtaskInput, setQuickSubtaskInput] = useState<{ [taskId: string]: string }>({});

  // Pagination states
  const [taskPage, setTaskPage] = useState(1);
  const TASK_PAGE_SIZE = 5;

  const [groupGoalPage, setGroupGoalPage] = useState(1);
  const GROUP_GOAL_PAGE_SIZE = 4;

  const [missionsPage, setMissionsPage] = useState(1);
  const MISSIONS_PAGE_SIZE = 4;

  React.useEffect(() => {
    setTaskPage(1);
    setGroupGoalPage(1);
    setMissionsPage(1);
  }, [filterStatus, searchQuery, activeCircleId, activeTab]);

  if (!isAuthenticated) {
    return (
      <div className="space-y-4 pb-12 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs text-center space-y-4 max-w-lg mx-auto mt-4">
          <div className="w-14 h-14 rounded-3xl bg-teal-50 text-teal-800 flex items-center justify-center mx-auto shadow-2xs">
            <Shield className="w-7 h-7 text-teal-700" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Target & Rencana Tim Bersifat Terbatas
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
              Silakan masuk ke akun Anda terlebih dahulu untuk melihat daftar target kerja, kalender kegiatan, dan progres kolaborasi tim.
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

  // Filter tasks
  const filteredTasks = tasks
    .filter((t) => {
      if (activeCircleId !== 'all') return t.circleId === activeCircleId;
      return !t.circleId || myJoinedCircleIds.has(t.circleId) || t.assignees?.some((a) => a.id === currentUser.id);
    })
    .filter((t) => {
      if (filterStatus === 'groupGoal') return t.isGroupGoal;
      if (filterStatus === 'daily') return t.frequency === 'daily';
      if (filterStatus === 'ongoing') return t.status === 'ongoing';
      if (filterStatus === 'done') return t.status === 'done';
      if (filterStatus === 'high') return t.priority === 'High';
      return true;
    })
    .filter((t) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    });

  const groupGoalTasks = tasks.filter(
    (t) => (activeCircleId === 'all' ? true : t.circleId === activeCircleId) && t.isGroupGoal
  );

  const missionsTasks = tasks.filter(
    (t) =>
      t.category.toLowerCase().includes('kebaikan') ||
      t.category.toLowerCase().includes('sosial') ||
      t.category.toLowerCase().includes('aksi')
  );

  const handleOpenSync = (task?: Task) => {
    setSyncSelectedTask(task);
    setIsCalendarSyncOpen(true);
  };

  const handleImportTasks = (importedTasks: Array<Omit<Task, 'id'>>) => {
    importedTasks.forEach((t) => {
      createTask({
        title: t.title,
        description: t.description,
        deadline: t.deadline,
        priority: t.priority,
        category: t.category || 'Target Impor',
        circleId: t.circleId || (activeCircleId !== 'all' ? activeCircleId : undefined),
      });
    });
  };

  const handleAddQuickSubtask = (taskId: string) => {
    const text = quickSubtaskInput[taskId];
    if (text && text.trim()) {
      addSubtaskToTask(taskId, text.trim(), 'Medium');
      setQuickSubtaskInput((prev) => ({ ...prev, [taskId]: '' }));
    }
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-teal-900 text-sm font-bold font-display">
            <div className="w-6 h-6 rounded-lg bg-teal-800 text-white flex items-center justify-center">
              <CheckSquare className="w-3.5 h-3.5" />
            </div>
            Target Tim, Kalender & Progres Kolaboratif
          </div>
          <p className="text-xs text-slate-500">
            Kelola target grup, checklist bersama, kebiasaan harian, dan sinkronkan agenda kalender.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenSync()}
            title="Sinkronisasi Kalender (Google, Outlook, iCal)"
            className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            <CalendarSync className="w-3.5 h-3.5 text-teal-700" />
            <span className="hidden sm:inline">Sinkronkan</span>
          </button>

          <button
            onClick={() => onOpenCreateTask()}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-teal-800 text-white text-xs font-bold shadow-sm hover:bg-teal-900 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Buat Target Baru
          </button>
        </div>
      </div>

      {/* Segmented View Mode Tabs */}
      <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
        <button
          onClick={() => setActiveTab('cards')}
          className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'cards'
              ? 'bg-white text-teal-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-teal-700" />
          <span className="hidden sm:inline">Papan</span> Tugas
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'calendar'
              ? 'bg-white text-teal-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5 text-indigo-700" />
          Kalender & Jadwal
        </button>

        <button
          onClick={() => setActiveTab('groupGoals')}
          className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'groupGoals'
              ? 'bg-white text-teal-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-emerald-700" />
          Target Bersama ({groupGoalTasks.length})
        </button>

        <button
          onClick={() => setActiveTab('missions')}
          className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'missions'
              ? 'bg-white text-teal-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          Misi Kebaikan
        </button>
      </div>

      {/* 1. VIEW MODE: Papan Tugas (Cards) */}
      {activeTab === 'cards' && (
        <div className="space-y-4">
          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'all', label: 'Semua Target' },
              { id: 'groupGoal', label: '👥 Target Bersama Tim' },
              { id: 'daily', label: '🔥 Rutin Harian & Habit' },
              { id: 'ongoing', label: 'Sedang Berjalan' },
              { id: 'done', label: 'Tuntas Selesai' },
              { id: 'high', label: 'Prioritas Utama' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id as typeof filterStatus)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  filterStatus === f.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Tasks List */}
          <div className="space-y-3.5">
            {(isInitialLoading || (isRefreshingData && tasks.length === 0)) ? (
              <div className="space-y-3.5">
                <TaskCardSkeleton />
                <TaskCardSkeleton />
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6 space-y-2">
                <p className="text-sm font-bold text-slate-700">Tidak ada target atau tugas pada filter ini.</p>
                <p className="text-xs text-slate-500">Mulai buat target bersama atau checklist harian baru.</p>
                <button
                  onClick={() => onOpenCreateTask()}
                  className="mt-2 px-4 py-2 rounded-2xl bg-teal-800 text-white text-xs font-bold hover:bg-teal-900"
                >
                  + Buat Target Sekarang
                </button>
              </div>
            ) : (
              filteredTasks
                .slice((taskPage - 1) * TASK_PAGE_SIZE, taskPage * TASK_PAGE_SIZE)
                .map((task) => {
                const isMint = task.colorTheme === 'mint';
                const isLavender = task.colorTheme === 'lavender';
                const isPeach = task.colorTheme === 'peach';

                const cardBg = isMint
                  ? 'bg-[#dcfce7] border-[#bbf7d0]'
                  : isLavender
                  ? 'bg-[#ede9fe] border-[#ddd6fe]'
                  : isPeach
                  ? 'bg-[#ffedd5] border-[#fed7aa]'
                  : 'bg-[#e0f2fe] border-[#bae6fd]';

                const barBg = isMint
                  ? 'bg-emerald-600'
                  : isLavender
                  ? 'bg-purple-600'
                  : isPeach
                  ? 'bg-amber-600'
                  : 'bg-sky-600';

                return (
                  <div
                    key={task.id}
                    onClick={() => onOpenTaskDetail(task)}
                    className={`p-4 sm:p-5 rounded-3xl border ${cardBg} shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-3`}
                  >
                    {/* Top Row: Group name, Frequency badge, Action button */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-slate-800 border border-white/60">
                          {task.circleName}
                        </span>

                        {task.isGroupGoal && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-800 text-white flex items-center gap-1 shadow-2xs">
                            <Users className="w-2.5 h-2.5" /> Target Bersama
                          </span>
                        )}

                        {task.frequency === 'daily' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white flex items-center gap-1">
                            <Flame className="w-2.5 h-2.5" /> Streak {task.streakDays || 1} Hari
                          </span>
                        )}

                        {task.frequency === 'weekly' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> Rutin Mingguan
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {task.frequency === 'daily' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDailyStreak(task.id);
                            }}
                            className="px-2.5 py-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs transition-colors"
                            title="Tuntaskan kebiasaan hari ini & tambah streak"
                          >
                            <Flame className="w-3 h-3" /> +1 Streak
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTaskToEdit(task);
                          }}
                          className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center text-xs shadow-xs"
                          title="Edit Target & Tambah Rincian"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Task Title & Description */}
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base font-display break-words leading-snug group-hover:text-teal-950 transition-colors">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-slate-700/90 mt-1 leading-relaxed break-words">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Priority, Status, Progress Indicator */}
                    {(() => {
                      const userComp = task.isDelegated ? task.userCompletions?.find(c => c.userId === currentUser.id) : null;
                      const isUserCompleted = task.isDelegated ? (userComp?.completed || false) : task.status === 'done';
                      const completedCount = task.isDelegated
                        ? (userComp?.completedSubtaskIds?.length || 0)
                        : task.subtasks.filter((s) => s.completed).length;
                      const progressPercentage = task.isDelegated
                        ? (task.subtasks.length > 0 ? Math.round((completedCount / task.subtasks.length) * 100) : (isUserCompleted ? 100 : 0))
                        : task.progress;

                      const circleOfTask = circles.find(c => c.id === task.circleId);
                      const circleMembers = circleOfTask ? circleOfTask.members : [];

                      return (
                        <>
                          <div className="flex items-center justify-between text-xs pt-1 flex-wrap gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateTaskStatus(
                                    task.id,
                                    isUserCompleted ? 'ongoing' : 'done'
                                  );
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-white/60 text-[11px] font-bold text-slate-800 hover:bg-white transition-colors"
                              >
                                <span
                                  className={`w-2 h-2 rounded-full shrink-0 ${
                                    isUserCompleted ? 'bg-emerald-600' : 'bg-amber-500'
                                  }`}
                                />
                                {task.isDelegated 
                                  ? (isUserCompleted ? 'Tuntas (Anda)' : 'Lapor Selesai (Anda)')
                                  : (task.status === 'done' ? 'Tuntas Selesai' : 'Sedang Berjalan')
                                }
                              </button>

                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0 ${
                                  task.priority === 'High'
                                    ? 'bg-rose-100 text-rose-900'
                                    : 'bg-amber-100 text-amber-900'
                                }`}
                              >
                                {task.priority === 'High' ? '🔴 Prioritas Tinggi' : '🟡 Sedang'}
                              </span>

                              {task.isDelegated && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900">
                                  👥 Tugas Per Anggota
                                </span>
                              )}
                            </div>

                            <span className="text-xs font-bold text-slate-800 shrink-0">
                              {task.isDelegated
                                ? `${completedCount}/${task.subtasks.length} Selesai (Progres Anda)`
                                : `${completedCount}/${task.subtasks.length} Selesai (${progressPercentage}%)`
                              }
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full h-2 bg-white/80 rounded-full overflow-hidden p-0.5">
                            <div
                              className={`h-full rounded-full ${barBg} transition-all duration-500`}
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>

                          {/* Group Members Progress Section for Delegated Tasks */}
                          {task.isDelegated && circleMembers.length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-slate-200/50 bg-slate-100/50 rounded-2xl p-2.5 space-y-1.5" onClick={e => e.stopPropagation()}>
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                                <span>Laporan Progres Anggota</span>
                                <span className="text-teal-850 font-extrabold font-mono">
                                  {task.userCompletions?.filter(c => c.completed).length || 0}/{circleMembers.length} Tuntas
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-36 overflow-y-auto pr-0.5">
                                {circleMembers.map(member => {
                                  const comp = task.userCompletions?.find(c => c.userId === member.id);
                                  const hasCompleted = comp?.completed || false;
                                  const subCount = comp?.completedSubtaskIds?.length || 0;
                                  return (
                                    <div key={member.id} className="flex items-center justify-between gap-1.5 p-1 px-1.5 bg-white/80 rounded-xl border border-slate-200/40 text-[11px]">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <img
                                          src={member.avatar}
                                          alt={member.name}
                                          referrerPolicy="no-referrer"
                                          className="w-4.5 h-4.5 rounded-full object-cover shrink-0 ring-1 ring-slate-100"
                                        />
                                        <span className="font-semibold text-slate-800 truncate">
                                          {member.name.split(' ')[0]} {member.id === currentUser.id ? '(Anda)' : ''}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        {task.subtasks.length > 0 && (
                                          <span className="text-[10px] text-slate-400 font-bold font-mono">
                                            {subCount}/{task.subtasks.length}
                                          </span>
                                        )}
                                        <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold ${hasCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                                          {hasCompleted ? 'Tuntas' : 'Belum'}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}

                    {/* Subtasks Collaborative Checklist */}
                    {task.subtasks.length > 0 && (
                      <div className="pt-2 border-t border-black/5 space-y-1.5">
                        {task.subtasks.map((st) => (
                          <SubtaskItem
                            key={st.id}
                            task={task}
                            subtask={st}
                            isCompact={true}
                          />
                        ))}

                        {/* Quick Inline Subtask Add */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 pt-1"
                        >
                          <input
                            type="text"
                            placeholder="+ Tambah tahapan checklist baru..."
                            value={quickSubtaskInput[task.id] || ''}
                            onChange={(e) =>
                              setQuickSubtaskInput((prev) => ({
                                ...prev,
                                [task.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddQuickSubtask(task.id);
                              }
                            }}
                            className="flex-1 px-3 py-1.5 bg-white/70 hover:bg-white focus:bg-white border border-black/10 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddQuickSubtask(task.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                          >
                            Tambah
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Footer Bar with Assignees, Delegation and Deadline */}
                    <div className="flex items-center justify-between pt-2 border-t border-black/5">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center -space-x-1.5">
                          {task.assignees.map((assignee) => (
                            <img
                              key={assignee.id}
                              src={assignee.avatar}
                              alt={assignee.name}
                              referrerPolicy="no-referrer"
                              className="w-6 h-6 rounded-full object-cover ring-2 ring-white shadow-2xs"
                            />
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTaskForDelegation(task);
                            setIsDelegationModalOpen(true);
                          }}
                          className="px-2 py-0.5 rounded-lg bg-white/80 hover:bg-white text-slate-800 text-[10px] font-bold inline-flex items-center gap-1 border border-black/10 transition-all active:scale-95 shadow-2xs"
                          title="Atur penanggung jawab & delegasikan tugas"
                        >
                          <UserPlus className="w-3 h-3 text-teal-800" />
                          <span>Delegasi</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenSync(task);
                          }}
                          title="Sinkronkan tugas ini ke Google / Outlook Calendar"
                          className="p-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 shadow-2xs transition-colors"
                        >
                          <CalendarSync className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 text-slate-800 text-[11px] font-bold shadow-2xs">
                          <CalendarIcon className="w-3 h-3 text-slate-500" />
                          <span>{task.deadline}</span>
                        </div>

                        <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                          <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                          +{task.pointsReward} Pts
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Mobile Pagination for Main Tasks */}
          <MobilePagination
            currentPage={taskPage}
            totalItems={filteredTasks.length}
            pageSize={TASK_PAGE_SIZE}
            onPageChange={setTaskPage}
            itemLabel="target & tugas"
            className="mt-3"
          />
        </div>
      )}

      {/* 2. VIEW MODE: Interactive Calendar (The Complete Rich Calendar Engine) */}
      {activeTab === 'calendar' && (
        <InteractiveCalendar
          onOpenTaskDetail={onOpenTaskDetail}
          onOpenCreateModal={(defaultDate, type) => onOpenCreateTask(defaultDate, type)}
          onOpenCalendarSync={() => handleOpenSync()}
        />
      )}

      {/* 3. VIEW MODE: Target Bersama Kolaboratif (Group Goals Tracker) */}
      {activeTab === 'groupGoals' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-teal-800 to-emerald-900 text-white p-5 rounded-3xl shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-300" />
              <h3 className="text-base font-bold font-display">Target Bersama & Kolaborasi Tim</h3>
            </div>
            <p className="text-xs text-teal-100 leading-relaxed max-w-xl">
              Daftar target bersama yang dirancang untuk diselesaikan secara gotong-royong. Setiap anggota dapat mengambil bagian subtask dan memantau kemajuan bersama.
            </p>
          </div>

          <div className="space-y-3.5">
            {groupGoalTasks.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-3xl border border-slate-200 p-6 space-y-2">
                <p className="text-xs text-slate-500">Belum ada target bersama di grup ini.</p>
                <button
                  onClick={() => onOpenCreateTask()}
                  className="px-4 py-2 rounded-2xl bg-teal-800 text-white text-xs font-bold hover:bg-teal-900"
                >
                  + Buat Target Bersama Tim
                </button>
              </div>
            ) : (
              groupGoalTasks
                .slice((groupGoalPage - 1) * GROUP_GOAL_PAGE_SIZE, groupGoalPage * GROUP_GOAL_PAGE_SIZE)
                .map((goal) => (
                <div
                  key={goal.id}
                  onClick={() => onOpenTaskDetail(goal)}
                  className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs hover:border-teal-300 transition-all cursor-pointer space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900">
                          {goal.circleName}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" /> Tenggat: {goal.deadline}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1 font-display">
                        {goal.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {goal.description}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-bold text-teal-900 block font-display">
                        {goal.progress}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">Tercapai</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-700 rounded-full transition-all duration-500"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>

                  {/* Subtask list */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      Tahapan Pengerjaan Tim ({goal.subtasks.filter((s) => s.completed).length}/{goal.subtasks.length}):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {goal.subtasks.map((st) => (
                        <SubtaskItem
                          key={st.id}
                          task={goal}
                          subtask={st}
                          isCompact={true}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Tim:</span>
                      <div className="flex -space-x-1.5">
                        {goal.assignees.map((a) => (
                          <img
                            key={a.id}
                            src={a.avatar}
                            alt={a.name}
                            className="w-5 h-5 rounded-full object-cover ring-2 ring-white"
                            referrerPolicy="no-referrer"
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTaskForDelegation(goal);
                          setIsDelegationModalOpen(true);
                        }}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold inline-flex items-center gap-1 border border-slate-200 transition-all active:scale-95"
                      >
                        <UserPlus className="w-3 h-3 text-teal-800" />
                        <span>Delegasi</span>
                      </button>
                    </div>

                    <span className="font-bold text-teal-800 hover:underline">
                      Kelola Detail Target →
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Mobile Pagination for Group Goals */}
          <MobilePagination
            currentPage={groupGoalPage}
            totalItems={groupGoalTasks.length}
            pageSize={GROUP_GOAL_PAGE_SIZE}
            onPageChange={setGroupGoalPage}
            itemLabel="target tim"
            className="mt-2"
          />
        </div>
      )}

      {/* 4. VIEW MODE: Misi Kebaikan Tim */}
      {activeTab === 'missions' && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-4 sm:p-5 rounded-3xl border border-teal-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-teal-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-teal-700" />
              Misi Kebaikan Sosial & Fastabiqul Khairat
            </div>
            <p className="text-xs text-teal-800 leading-relaxed">
              Misi sukarela yang memberikan dampak langsung pada komunitas. Dapatkan poin ganda & lencana Fastabiqul Khairat!
            </p>
          </div>

          <div className="space-y-3">
            {missionsTasks
              .slice((missionsPage - 1) * MISSIONS_PAGE_SIZE, missionsPage * MISSIONS_PAGE_SIZE)
              .map((task) => (
              <div
                key={task.id}
                onClick={() => onOpenTaskDetail(task)}
                className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-teal-300 cursor-pointer space-y-3 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Misi Khusus</span>
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1.5 font-display">
                      {task.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {task.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex-shrink-0">
                    +{task.pointsReward} Pts
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>Target: {task.deadline}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenTaskDetail(task);
                    }}
                    className="font-bold text-teal-800 hover:text-teal-900"
                  >
                    Buka Checklist & Relawan →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Pagination for Missions */}
          <MobilePagination
            currentPage={missionsPage}
            totalItems={missionsTasks.length}
            pageSize={MISSIONS_PAGE_SIZE}
            onPageChange={setMissionsPage}
            itemLabel="misi kebaikan"
            className="mt-2"
          />
        </div>
      )}

      {/* Calendar Sync Integration Modal */}
      <CalendarSyncModal
        isOpen={isCalendarSyncOpen}
        onClose={() => setIsCalendarSyncOpen(false)}
        tasks={tasks}
        selectedTask={syncSelectedTask}
        onImportTasks={handleImportTasks}
      />

      {/* Delegation Modal */}
      {selectedTaskForDelegation && (
        <DelegationModal
          isOpen={isDelegationModalOpen}
          onClose={() => setIsDelegationModalOpen(false)}
          task={selectedTaskForDelegation}
        />
      )}

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={!!taskToEdit}
        onClose={() => setTaskToEdit(null)}
        task={taskToEdit}
      />
    </div>
  );
};
