import React, { useState } from 'react';
import {
  ArrowLeft,
  Users,
  CheckSquare,
  Wallet,
  BookOpen,
  Plus,
  Copy,
  Check,
  Shield,
  UserPlus,
  UserCheck,
  Trash2,
  Calendar,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  Tag,
  AlertCircle,
  Award,
  MoreVertical,
  Share2,
  CheckCircle2,
  Circle as CircleIcon,
  ChevronDown,
  BarChart3,
  LogOut,
  Flame,
  Repeat,
  Search,
  X,
  Settings,
  Link as LinkIcon,
  Info,
  Camera
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { copyToClipboard } from '../utils/clipboard';
import { uploadMediaFile } from '../utils/imageOptimizer';
import { Circle, CircleMember, Task, Priority, TaskStatus, Subtask, SubtaskType, TaskFrequency } from '../types';
import { PostCard } from './PostCard';
import { QuickPostComposer } from './QuickPostComposer';
import { SubtaskItem } from './SubtaskItem';
import { ConfirmationModal } from './ConfirmationModal';
import { MobilePagination } from './MobilePagination';
import { GroupEvaluationView } from './GroupEvaluationView';
import { GroupSettingsView } from './GroupSettingsView';

interface GroupTaskSubtaskItem {
  id: string;
  title: string;
  priority: Priority;
  type: SubtaskType;
  notePlaceholder?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  options?: string[];
}

interface GroupDetailRoomProps {
  circleId: string;
  onBack: () => void;
  onOpenTaskDetail: (task: Task) => void;
}

export const GroupDetailRoom: React.FC<GroupDetailRoomProps> = ({
  circleId,
  onBack,
  onOpenTaskDetail,
}) => {
  const {
    circles,
    currentUser,
    tasks,
    transactions,
    budgetGoals,
    memberDues,
    posts,
    createTask,
    assignTaskToMember,
    claimTask,
    toggleSubtask,
    updateTaskStatus,
    deleteTask,
    addMemberToCircle,
    updateMemberRole,
    removeMemberFromCircle,
    leaveCircle,
    completeRecurringTask,
    updateCircle,
    addTransaction,
    toggleMemberDue,
    addPoints,
    triggerCelebration,
    allUsers,
    refreshData,
    isInitialLoading,
    isRefreshingData
  } = useApp();

  const availableUsers = React.useMemo(() => {
    const rawList = allUsers.length > 0 ? allUsers : [currentUser];
    return rawList.filter((u) => {
      if (!u) return false;
      const sysRole = String(u.systemRole || (u as any).sysRole || '').toLowerCase();
      const userRole = String(u.role || '').toLowerCase();
      const userName = String(u.name || '').toLowerCase();
      const userEmail = String(u.email || '').toLowerCase();
      const userUsername = String(u.username || '').toLowerCase();

      // Superadmin and Admin accounts MUST NOT appear in the user search or member lists
      if (sysRole === 'superadmin' || sysRole === 'admin') return false;
      if (userRole === 'admin' || userRole === 'superadmin' || userRole.includes('admin')) return false;
      if (userUsername === 'admin' || userUsername === 'superadmin' || userUsername.includes('admin')) return false;
      if (userName.includes('admin') || userEmail.includes('admin')) return false;
      return true;
    });
  }, [allUsers, currentUser]);

  const circle = circles.find((c) => c.id === circleId);

  const [isUploadingGroupAvatar, setIsUploadingGroupAvatar] = useState(false);
  const groupAvatarInputRef = React.useRef<HTMLInputElement>(null);

  const handleGroupAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !circle) return;
    try {
      setIsUploadingGroupAvatar(true);
      const res = await uploadMediaFile(file);
      await updateCircle(circle.id, { avatar: res.url });
      triggerCelebration();
    } catch (err) {
      console.error('Failed to upload group avatar', err);
    } finally {
      setIsUploadingGroupAvatar(false);
    }
  };

  const [activeSubTab, setActiveSubTab] = useState<'tasks' | 'evaluasi' | 'members' | 'finance' | 'discussions' | 'settings'>('tasks');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGroupInfoModalOpen, setIsGroupInfoModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isLeaveGroupModalOpen, setIsLeaveGroupModalOpen] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'all' | 'ongoing' | 'done' | 'mine'>('all');

  // Confirmation modal states
  const [memberToRemove, setMemberToRemove] = useState<CircleMember | null>(null);
  const [taskToRemove, setTaskToRemove] = useState<Task | null>(null);

  // Pagination states
  const [groupTaskPage, setGroupTaskPage] = useState(1);
  const [groupTxPage, setGroupTxPage] = useState(1);
  const [groupPostPage, setGroupPostPage] = useState(1);

  // New Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('3 Hari Kedepan');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('Medium');
  const [newTaskCategory, setNewTaskCategory] = useState('Target Bersama');
  const [newTaskIsDelegated, setNewTaskIsDelegated] = useState(false);
  const [newTaskFrequency, setNewTaskFrequency] = useState<TaskFrequency>('once');
  const [newTaskRecurrenceDays, setNewTaskRecurrenceDays] = useState<number[]>([1, 3]);
  const [newTaskRecurrenceTime, setNewTaskRecurrenceTime] = useState('08:00 WIB');
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([currentUser.id]);
  const [taskAssigneeSearch, setTaskAssigneeSearch] = useState('');
  
  // Structured subtasks for group task - starts empty so user can add custom points
  const [newTaskSubtasks, setNewTaskSubtasks] = useState<GroupTaskSubtaskItem[]>([]);
  const [currentSubtaskInput, setCurrentSubtaskInput] = useState('');
  const [currentSubtaskPriority, setCurrentSubtaskPriority] = useState<Priority>('Medium');
  const [currentSubtaskType, setCurrentSubtaskType] = useState<SubtaskType>('checkbox');
  const [currentSubtaskNotePlaceholder, setCurrentSubtaskNotePlaceholder] = useState('');
  const [currentSubtaskTarget, setCurrentSubtaskTarget] = useState('50');
  const [currentSubtaskUnit, setCurrentSubtaskUnit] = useState('Paket');
  const [currentSubtaskOptions, setCurrentSubtaskOptions] = useState('Belum Dimulai, Sedang Proses, Tahap Review, Selesai');

  // New Transaction Form State
  const [newTxTitle, setNewTxTitle] = useState('');
  const [newTxAmount, setNewTxAmount] = useState('');
  const [newTxType, setNewTxType] = useState<'income' | 'expense' | 'dues'>('income');
  const [newTxCategory, setNewTxCategory] = useState('Iuran Kas');
  const [newTxPayer, setNewTxPayer] = useState('');
  const [newTxNote, setNewTxNote] = useState('');

  // Add Member State
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedDirectoryUsers, setSelectedDirectoryUsers] = useState<string[]>([]);
  const [selectedRoleForNewMembers, setSelectedRoleForNewMembers] = useState<CircleMember['role']>('Anggota');

  React.useEffect(() => {
    setGroupTaskPage(1);
    setGroupTxPage(1);
    setGroupPostPage(1);
  }, [activeSubTab, taskFilter]);

  React.useEffect(() => {
    if (!circle && !isInitialLoading && !isRefreshingData) {
      onBack();
    }
  }, [circle, isInitialLoading, isRefreshingData, onBack]);

  if (!circle) {
    if (isInitialLoading || isRefreshingData) {
      return (
        <div className="w-full space-y-4 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs h-64 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-teal-600 animate-spin"></div>
          </div>
        </div>
      );
    }
    return null;
  }

  const isMember =
    circle.members.some(
      (m) =>
        m.id === currentUser.id ||
        (m.email && currentUser.email && m.email.toLowerCase() === currentUser.email.toLowerCase())
    ) ||
    (Array.isArray(currentUser.joinedCircleIds) && currentUser.joinedCircleIds.includes(circle.id)) ||
    circle.adminId === currentUser.id;

  if (!isMember) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs text-center space-y-4 max-w-lg mx-auto mt-4">
        <div className="w-14 h-14 rounded-3xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto shadow-2xs">
          <Shield className="w-7 h-7 text-amber-700" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Akses Terbatas ke Lingkar Ini
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Anda bukan anggota dari grup &quot;{circle.name}&quot;. Data aktivitas, tugas, dan kas grup ini bersifat privat dan hanya dapat diakses oleh anggota yang telah ditambahkan.
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={onBack}
            className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-2xl active:scale-95 transition-all cursor-pointer"
          >
            Kembali ke Daftar Grup Saya
          </button>
        </div>
      </div>
    );
  }

  // Filter tasks for this circle
  const groupTasks = tasks.filter((t) => t.circleId === circle.id);
  const filteredTasks = groupTasks.filter((t) => {
    if (taskFilter === 'ongoing') return t.status !== 'done';
    if (taskFilter === 'done') return t.status === 'done';
    if (taskFilter === 'mine') return t.assignees.some((a) => a.id === currentUser.id);
    return true;
  });

  // Filter finance for this circle
  const groupTransactions = transactions.filter((t) => t.circleId === circle.id);
  const groupGoals = budgetGoals.filter((g) => g.circleId === circle.id);
  const groupDues = memberDues; // dues list
  const groupPosts = posts.filter((p) => p.circleId === circle.id);

  // Group roles identification
  const myMembership = circle.members.find((m) => m.id === currentUser.id);
  const isAdmin = currentUser.systemRole === 'superadmin' || currentUser.systemRole === 'admin' || myMembership?.role === 'Ketua' || myMembership?.role === 'Kreator';
  const treasurer = circle.members.find((m) => m.role === 'Bendahara');

  const handleCopyCode = () => {
    copyToClipboard(circle.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && circle) {
      const joinLink = `${window.location.origin}/#join/${circle.code}`;
      if (navigator.share) {
        navigator
          .share({
            title: `Bergabung ke grup ${circle.name}`,
            text: `Halo, mari bergabung ke grup "${circle.name}" di Lingkar! Kode Undangan: ${circle.code}`,
            url: joinLink,
          })
          .catch(() => {
            copyToClipboard(joinLink);
          });
      } else {
        copyToClipboard(joinLink);
      }
      setCopiedLink(true);
      triggerCelebration();
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCreateGroupTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const assigneesList = circle.members
      .filter((m) => selectedAssigneeIds.includes(m.id))
      .map((m) => ({ id: m.id, name: m.name, avatar: m.avatar }));

    createTask({
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || `Tugas bersama di grup ${circle.name}`,
      deadline: newTaskDeadline,
      priority: newTaskPriority,
      category: newTaskCategory,
      circleId: circle.id,
      frequency: newTaskFrequency,
      recurrenceDays: newTaskFrequency === 'custom_days' || newTaskFrequency === 'weekly' ? newTaskRecurrenceDays : undefined,
      recurrenceTime: newTaskFrequency !== 'once' ? newTaskRecurrenceTime : undefined,
      subtasks: newTaskSubtasks.map((st) => ({
        id: st.id,
        title: st.title,
        completed: false,
        priority: st.priority,
        type: st.type,
        notePlaceholder: st.notePlaceholder,
        targetValue: st.targetValue,
        currentValue: 0,
        unit: st.unit,
        options: st.options,
      })),
      assignees: assigneesList.length > 0 ? assigneesList : [{ id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar }],
      isDelegated: newTaskIsDelegated,
    });

    setIsCreateTaskModalOpen(false);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskIsDelegated(false);
    setNewTaskFrequency('once');
    setNewTaskSubtasks([]);
  };

  const handleAddSubtask = () => {
    if (!currentSubtaskInput.trim()) return;

    const targetVal = currentSubtaskType === 'number_input' ? (parseFloat(currentSubtaskTarget) || 10) : undefined;
    const unitVal = currentSubtaskType === 'number_input' ? (currentSubtaskUnit.trim() || 'Unit') : undefined;
    const optionsVal = currentSubtaskType === 'select_option'
      ? currentSubtaskOptions.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    const newItem: GroupTaskSubtaskItem = {
      id: `gst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: currentSubtaskInput.trim(),
      priority: currentSubtaskPriority,
      type: currentSubtaskType,
      notePlaceholder: currentSubtaskType === 'checkbox_note' ? (currentSubtaskNotePlaceholder.trim() || undefined) : undefined,
      targetValue: targetVal,
      currentValue: 0,
      unit: unitVal,
      options: optionsVal && optionsVal.length > 0 ? optionsVal : undefined,
    };

    setNewTaskSubtasks((prev) => [...prev, newItem]);
    setCurrentSubtaskInput('');
    setCurrentSubtaskNotePlaceholder('');
  };

  const handleRemoveSubtask = (id: string) => {
    setNewTaskSubtasks((prev) => prev.filter((st) => st.id !== id));
  };

  const handleAddMembersSubmit = async () => {
    const promises = selectedDirectoryUsers.map(async (userId) => {
      const userToAdd = availableUsers.find((u) => u.id === userId);
      if (userToAdd) {
        return addMemberToCircle(circle.id, {
          id: userToAdd.id,
          name: userToAdd.name,
          avatar: userToAdd.avatar,
          role: selectedRoleForNewMembers,
        });
      }
    });
    await Promise.all(promises);
    await refreshData();
    setSelectedDirectoryUsers([]);
    setIsAddMemberModalOpen(false);
  };

  const handleAddTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(newTxAmount.replace(/[^0-9]/g, ''), 10);
    if (isNaN(numAmount) || numAmount <= 0 || !newTxTitle.trim()) return;

    addTransaction({
      title: newTxTitle.trim(),
      amount: numAmount,
      type: newTxType,
      category: newTxCategory,
      circleId: circle.id,
      payerOrRecipient: newTxPayer.trim() || currentUser.name,
      receiptNote: newTxNote.trim() || 'Dicatat langsung dari menu kas grup.',
    });

    setIsAddTxModalOpen(false);
    setNewTxTitle('');
    setNewTxAmount('');
    setNewTxPayer('');
    setNewTxNote('');
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* WhatsApp-Style Compact Group Room Header */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs space-y-3">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Back Button */}
            <button
              onClick={onBack}
              title="Kembali ke Daftar Grup"
              className="p-2 text-slate-700 hover:text-teal-700 hover:bg-slate-100 rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Clickable Group Profile Header (Opens WhatsApp-Style Info Modal) */}
            <button
              onClick={() => setIsGroupInfoModalOpen(true)}
              className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-85 transition-opacity group cursor-pointer"
            >
              <div className="relative shrink-0">
                <img
                  src={circle.avatar}
                  alt={circle.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover ring-2 ring-teal-50 shadow-2xs"
                />
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-teal-600 text-white rounded-full text-[9px] font-extrabold shadow-2xs">
                  {circle.members.length}
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate group-hover:text-teal-700 transition-colors">
                    {circle.name}
                  </h1>
                  <Info className="w-4 h-4 text-teal-600 shrink-0" />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium truncate">
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold text-[10px] shrink-0">
                    {circle.category}
                  </span>
                  <span>•</span>
                  <span className="text-teal-700 font-bold truncate">Info & Pengaturan</span>
                </div>
              </div>
            </button>
          </div>

          {/* Right Quick Actions (Share Link & Info Button) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleCopyLink}
              title="Bagikan Link Undangan Grup"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span className="hidden sm:inline">Link Tersalin</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-white" />
                  <span className="hidden sm:inline">Bagikan</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsGroupInfoModalOpen(true)}
              title="Informasi & Pengaturan Grup"
              className="p-2 text-slate-700 hover:text-teal-700 hover:bg-teal-50 bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <Info className="w-5 h-5 text-teal-700" />
            </button>
          </div>
        </div>

        {/* 5-Subtab Navigation Bar (Immediately visible & compact right at the top) */}
        <div className="grid grid-cols-5 gap-1 pt-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/70 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('tasks')}
            className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'tasks'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600 shrink-0" />
            <span className="truncate">Tugas ({groupTasks.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('discussions')}
            className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'discussions'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
            <span className="truncate">Diskusi ({groupPosts.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('finance')}
            className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'finance'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
            <span className="truncate">Kas</span>
          </button>

          <button
            onClick={() => setActiveSubTab('members')}
            className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'members'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 shrink-0" />
            <span className="truncate">Anggota ({circle.members.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('evaluasi')}
            className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'evaluasi'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 shrink-0" />
            <span className="truncate">Grafik</span>
          </button>
        </div>
      </div>

      {/* ===================== SUBTAB 1: TUGAS & DELEGASI ===================== */}
      {activeSubTab === 'tasks' && (
        <div className="space-y-3">
          {/* Header Action Bar for Tasks */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setTaskFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  taskFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua ({groupTasks.length})
              </button>
              <button
                onClick={() => setTaskFilter('ongoing')}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  taskFilter === 'ongoing'
                    ? 'bg-teal-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Sedang Dikerjakan ({groupTasks.filter((t) => t.status !== 'done').length})
              </button>
              <button
                onClick={() => setTaskFilter('done')}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  taskFilter === 'done'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Selesai ({groupTasks.filter((t) => t.status === 'done').length})
              </button>
              <button
                onClick={() => setTaskFilter('mine')}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  taskFilter === 'mine'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tugas Saya ({groupTasks.filter((t) => t.assignees.some((a) => a.id === currentUser.id)).length})
              </button>
            </div>

            {isAdmin && (
              <button
                onClick={() => setIsCreateTaskModalOpen(true)}
                className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Tugas Grup</span>
              </button>
            )}
          </div>

          {/* Task Cards List */}
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-xs">
              <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-slate-800 text-sm">Belum Ada Tugas di Kategori Ini</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                Buat tugas bersama dan delegasikan kepada anggota grup untuk mulai berkolaborasi.
              </p>
              {isAdmin && (
                <button
                  onClick={() => setIsCreateTaskModalOpen(true)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 shadow-xs"
                >
                  + Buat Tugas Pertama di Grup Ini
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks
                .slice(0, groupTaskPage * 5)
                .map((task) => {
                const isAssignedToMe = task.assignees.some((a) => a.id === currentUser.id);
                const userComp = task.isDelegated ? task.userCompletions?.find(c => c.userId === currentUser.id) : null;
                const isUserCompleted = task.isDelegated ? (userComp?.completed || false) : task.status === 'done';
                const completedCount = task.isDelegated
                  ? (userComp?.completedSubtaskIds?.length || 0)
                  : (task.subtasks || []).filter((s) => s.completed).length;
                const progressPercentage = task.isDelegated
                  ? (task.subtasks?.length > 0 ? Math.round((completedCount / task.subtasks.length) * 100) : (isUserCompleted ? 100 : 0))
                  : task.progress;

                return (
                  <div
                    key={task.id}
                    className={`bg-white rounded-2xl p-4 border transition-all hover:shadow-sm ${
                      isUserCompleted
                        ? 'border-emerald-200/80 bg-emerald-50/20'
                        : 'border-slate-200/80 shadow-xs'
                    }`}
                  >
                    {/* Top Meta Info */}
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            task.priority === 'High'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : task.priority === 'Medium'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          Prioritas {task.priority}
                        </span>

                        {/* Recurrence Frequency Tag */}
                        {task.frequency && task.frequency !== 'once' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                            <Repeat className="w-2.5 h-2.5" />
                            {task.frequency === 'daily'
                              ? 'Harian 🔁'
                              : task.frequency === 'weekly'
                              ? 'Mingguan 🔁'
                              : task.frequency === 'monthly'
                              ? 'Bulanan 🔁'
                              : 'Hari Rutin 📅'}
                          </span>
                        )}

                        {/* Streak Badge */}
                        {task.streakDays && task.streakDays > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-0.5">
                            <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                            {task.streakDays}x Selesai
                          </span>
                        ) : null}

                        <span className="text-[11px] font-medium text-slate-500">
                          {task.category}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {task.deadline}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {task.isDelegated ? (
                          <button
                            onClick={() => updateTaskStatus(task.id, isUserCompleted ? 'ongoing' : 'done')}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                              isUserCompleted
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-teal-850'
                            }`}
                          >
                            {isUserCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <CircleIcon className="w-3.5 h-3.5" />}
                            <span>{isUserCompleted ? 'Tuntas (Anda)' : 'Lapor Selesai (Anda)'}</span>
                          </button>
                        ) : task.frequency && task.frequency !== 'once' ? (
                          <button
                            onClick={() => completeRecurringTask(task.id)}
                            className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                            title="Tuntaskan siklus pengulangan periode ini dan catat ke riwayat"
                          >
                            <Flame className="w-3.5 h-3.5" />
                            <span>Tuntas Periode Ini</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => updateTaskStatus(task.id, isUserCompleted ? 'ongoing' : 'done')}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                              isUserCompleted
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-teal-800'
                            }`}
                          >
                            {isUserCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <CircleIcon className="w-3.5 h-3.5" />}
                            <span>{isUserCompleted ? 'Selesai' : 'Tandai Selesai'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div
                      onClick={() => onOpenTaskDetail(task)}
                      className="cursor-pointer group mt-2"
                    >
                      <h4
                        className={`text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors ${
                          isUserCompleted ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Subtasks Progress */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="mt-3 bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold mb-1">
                          <span>
                            {task.isDelegated
                              ? `Checklist Tugas Anda (${completedCount}/${task.subtasks.length})`
                              : `Checklist & Tahapan Tugas (${completedCount}/${task.subtasks.length})`
                            }
                          </span>
                          <span className="text-teal-700 font-bold">{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mb-2">
                          <div
                            className="bg-teal-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                        <div className="space-y-1.5 pt-0.5">
                          {task.subtasks.map((st) => (
                            <SubtaskItem
                              key={st.id}
                              task={task}
                              subtask={st}
                              compact={true}
                              onOpenTaskDetail={onOpenTaskDetail}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Group Members Progress Section for Delegated Tasks */}
                    {task.isDelegated && circle.members && circle.members.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100/60 bg-slate-50 rounded-xl p-3 space-y-1.5" onClick={e => e.stopPropagation()}>
                        <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                          <span>Laporan Progres Anggota</span>
                          <span className="text-teal-800 font-extrabold font-mono text-[11px]">
                            {task.userCompletions?.filter(c => c.completed).length || 0}/{circle.members.length} Tuntas
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-0.5">
                          {circle.members.map(member => {
                            const comp = task.userCompletions?.find(c => c.userId === member.id);
                            const hasCompleted = comp?.completed || false;
                            const subCount = comp?.completedSubtaskIds?.length || 0;
                            return (
                              <div key={member.id} className="flex flex-col gap-1.5 p-1.5 px-2 bg-white rounded-xl border border-slate-200/50 text-[11px]">
                                <div className="flex items-center justify-between gap-1.5">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <img
                                      src={member.avatar}
                                      alt={member.name}
                                      referrerPolicy="no-referrer"
                                      className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-slate-100"
                                    />
                                    <span className="font-semibold text-slate-800 truncate">
                                      {member.name.split(' ')[0]} {member.id === currentUser.id ? '(Anda)' : ''}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {task.subtasks && task.subtasks.length > 0 && (
                                      <span className="text-[10px] text-slate-400 font-bold font-mono">
                                        {subCount}/{task.subtasks.length}
                                      </span>
                                    )}
                                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${hasCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                                      {hasCompleted ? 'Tuntas' : 'Belum'}
                                    </span>
                                  </div>
                                </div>
                                {comp?.subtaskNotes && Object.entries(comp.subtaskNotes).length > 0 && (
                                  <div className="mt-1 space-y-1">
                                    {Object.entries(comp.subtaskNotes).map(([sid, note]) => {
                                      const st = task.subtasks.find(s => s.id === sid);
                                      if (!note || !st) return null;
                                      return (
                                        <div key={sid} className="p-1.5 bg-slate-50 rounded-lg text-[10px] text-slate-600 italic flex items-start gap-1">
                                          <span className="font-bold shrink-0">{st.title}:</span>
                                          <span>"{note}"</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Task Delegation & Assignees Row */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-slate-500">
                          Didelegasikan ke:
                        </span>
                        <div className="flex items-center -space-x-1.5">
                          {task.assignees.map((assignee) => (
                            <img
                              key={assignee.id}
                              src={assignee.avatar}
                              alt={assignee.name}
                              title={assignee.name}
                              referrerPolicy="no-referrer"
                              className="w-6 h-6 rounded-full object-cover ring-2 ring-white"
                            />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">
                          {task.assignees.map((a) => a.name).join(', ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!isAssignedToMe && (
                          <button
                            onClick={() => claimTask(task.id)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-xl text-[11px] font-bold border border-amber-200 hover:bg-amber-100 transition-colors"
                          >
                            <UserCheck className="w-3 h-3 text-amber-700" />
                            <span>Ambil Tugas Ini</span>
                          </button>
                        )}

                        {/* Delegate to Other Members Dropdown */}
                        {isAdmin && (
                          <div className="relative group/delegate">
                            <button className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-xl text-[11px] font-semibold hover:bg-slate-200 transition-colors">
                              <span>Delegasi</span>
                              <ChevronDown className="w-3 h-3" />
                            </button>

                            <div className="absolute right-0 bottom-full mb-1 hidden group-hover/delegate:block w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-1.5 z-20">
                              <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase">
                                Pilih Anggota Tim
                              </div>
                              {circle.members.map((m) => (
                                <button
                                  key={m.id}
                                  onClick={() =>
                                    assignTaskToMember(task.id, {
                                      id: m.id,
                                      name: m.name,
                                      avatar: m.avatar,
                                    })
                                  }
                                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left hover:bg-slate-50 transition-colors"
                                >
                                  <img
                                    src={m.avatar}
                                    alt={m.name}
                                    referrerPolicy="no-referrer"
                                    className="w-5 h-5 rounded-full object-cover"
                                  />
                                  <span className="truncate font-medium text-slate-800">{m.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => setTaskToRemove(task)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Hapus Tugas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mobile Pagination for Group Tasks */}
          <MobilePagination
                currentPage={1}
                totalItems={filteredTasks.length}
                pageSize={5}
                visibleCount={groupTaskPage * 5}
                mode="loadMore"
                onLoadMore={() => setGroupTaskPage(p => p + 1)}
                onPageChange={() => {}}
                itemLabel="tugas tim"
                className="mt-2"
              />
        </div>
      )}

      {/* ===================== SUBTAB: GRAFIK & EVALUASI KINERJA ===================== */}
      {activeSubTab === 'evaluasi' && (
        <GroupEvaluationView
          circleId={circle.id}
          circle={circle}
          tasks={tasks}
          currentUser={currentUser}
          onOpenTaskDetail={onOpenTaskDetail}
        />
      )}

      {/* ===================== SUBTAB 2: ANGGOTA & PERAN ===================== */}
      {activeSubTab === 'members' && (
        <div className="space-y-3">
          {/* Header Member Tools */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Manajemen Anggota ({circle.members.length} Orang)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola peran tim: Ketua, Bendahara (Kelola Keuangan), Sekretaris, dan Anggota.
              </p>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddMemberModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors shadow-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Tambah Anggota</span>
                </button>
              </div>
            )}
          </div>

          {/* Members List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {circle.members.map((member) => {
              const isMe = member.id === currentUser.id;
              const isTreasurer = member.role === 'Bendahara';
              const isLeader = member.role === 'Ketua' || member.role === 'Kreator';

              return (
                <div
                  key={member.id}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 shadow-xs"
                    />

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-900">
                          {member.name}
                        </span>
                        {isMe && (
                          <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full">
                            Anda
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            isLeader
                              ? 'bg-amber-100 text-amber-900 border-amber-200'
                              : isTreasurer
                              ? 'bg-teal-100 text-teal-900 border-teal-200'
                              : member.role === 'Sekretaris'
                              ? 'bg-sky-100 text-sky-900 border-sky-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {member.role === 'Bendahara' ? '💰 Bendahara Kas' : member.role}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>Bergabung: {member.joinedAt}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-amber-700 font-semibold">
                          <Zap className="w-3 h-3" />
                          {member.contributionPoints} Pts
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Role Changer */}
                  {isAdmin && (
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {/* Set as Treasurer quick button if not already */}
                      {!isTreasurer && (
                        <button
                          onClick={() => updateMemberRole(circle.id, member.id, 'Bendahara')}
                          className="px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200/70 rounded-xl text-[11px] font-bold hover:bg-teal-100 transition-colors"
                          title="Tunjuk anggota ini untuk kelola keuangan grup"
                        >
                          Pilih Bendahara
                        </button>
                      )}

                      {/* Role Dropdown */}
                      <select
                        value={member.role}
                        onChange={(e) =>
                          updateMemberRole(
                            circle.id,
                            member.id,
                            e.target.value as CircleMember['role']
                          )
                        }
                        className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      >
                        <option value="Ketua">Ketua / Admin</option>
                        <option value="Bendahara">Bendahara (Kas)</option>
                        <option value="Sekretaris">Sekretaris</option>
                        <option value="Anggota">Anggota</option>
                        <option value="Kreator">Kreator</option>
                      </select>

                      {!isMe && (
                        <button
                          type="button"
                          onClick={() => setMemberToRemove(member)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Keluarkan dari grup"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================== SUBTAB 3: KAS & KEUANGAN ===================== */}
      {activeSubTab === 'finance' && (
        <div className="space-y-3">
          {/* Treasury Header & Balances */}
          <div className="bg-gradient-to-br from-teal-800 to-emerald-950 text-white rounded-3xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-teal-200 font-medium">Saldo Kas Bersama</span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-0.5">
                  Rp {circle.kasBalance.toLocaleString('id-ID')}
                </h2>
              </div>
              <button
                onClick={() => setIsAddTxModalOpen(true)}
                className="flex items-center gap-1 px-3 py-2 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-300 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Catat Transaksi</span>
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-teal-700/60 flex items-center justify-between text-xs text-teal-100">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-300" />
                <span>
                  Pengelola Kas:{' '}
                  <strong className="text-white font-bold">
                    {treasurer ? treasurer.name : 'Belum Ditentukan (Pilih di tab Anggota)'}
                  </strong>
                </span>
              </div>
              <span className="text-[11px] text-teal-200/80">Transparan & Terverifikasi</span>
            </div>
          </div>

          {/* Monthly Member Dues Section */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                Status Iuran Kas Anggota (Agustus 2026)
              </h3>
              <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                Rp 50.000 / Anggota
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {circle.members.map((member) => {
                // Check if user has paid or due in list
                const userDue = groupDues.find((d) => d.userId === member.id);
                const isPaid = userDue ? userDue.isPaid : false;

                return (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isPaid
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-slate-50 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">{member.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {isPaid ? 'Lunas (Iuran Kas Terbayar)' : 'Belum Membayar'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (userDue) {
                          toggleMemberDue(userDue.id);
                        } else {
                          // Record transaction & mark paid
                          addTransaction({
                            title: `Iuran Kas - ${member.name}`,
                            amount: 50000,
                            type: 'dues',
                            category: 'Iuran Kas',
                            circleId: circle.id,
                            payerOrRecipient: member.name,
                            receiptNote: 'Iuran kas bulanan anggota.',
                          });
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                        isPaid
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-700 hover:bg-teal-600 hover:text-white'
                      }`}
                    >
                      {isPaid ? 'Lunas' : 'Bayar / Catat'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group Transactions History */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                Riwayat Pembukuan Kas Grup ({groupTransactions.length})
              </h3>
              <button
                onClick={() => setIsAddTxModalOpen(true)}
                className="text-xs font-bold text-teal-700 hover:text-teal-800"
              >
                + Tambah Nota
              </button>
            </div>

            {groupTransactions.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                Belum ada transaksi pengeluaran/pemasukan dicatat pada grup ini.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {groupTransactions
                  .slice(0, groupTxPage * 5)
                  .map((tx) => {
                  const isIncome = tx.type === 'income' || tx.type === 'dues';
                  return (
                    <div
                      key={tx.id}
                      className="py-2.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                            isIncome
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {isIncome ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{tx.title}</div>
                          <div className="text-[10px] text-slate-500">
                            {tx.date} • Oleh {tx.recordedBy} ({tx.category})
                          </div>
                        </div>
                      </div>

                      <div
                        className={`font-bold ${
                          isIncome ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isIncome ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Mobile Pagination for Group Finance */}
            <MobilePagination
                currentPage={1}
                totalItems={groupTransactions.length}
                pageSize={5}
                visibleCount={groupTxPage * 5}
                mode="loadMore"
                onLoadMore={() => setGroupTxPage(p => p + 1)}
                onPageChange={() => {}}
                itemLabel="transaksi kas"
                className="mt-2"
              />
          </div>
        </div>
      )}

      {/* ===================== SUBTAB 4: FEED & DISKUSI ===================== */}
      {activeSubTab === 'discussions' && (
        <div className="space-y-4">
          <QuickPostComposer initialCircleId={circle.id} />

          {groupPosts.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-xs">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-slate-800 text-sm">Belum Ada Wawasan Dibagikan</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Bagikan rangkuman buku, wawasan kebaikan, atau catatan riset pertama untuk grup ini!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupPosts
                .slice(0, groupPostPage * 5)
                .map((post) => (
                <PostCard key={post.id} post={post} />
              ))}

              {/* Mobile Pagination for Group Feed */}
              <MobilePagination
                currentPage={1}
                totalItems={groupPosts.length}
                pageSize={5}
                visibleCount={groupPostPage * 5}
                mode="loadMore"
                onLoadMore={() => setGroupPostPage(p => p + 1)}
                onPageChange={() => {}}
                itemLabel="kiriman wawasan"
                className="mt-3"
              />
            </div>
          )}
        </div>
      )}

      {/* ===================== SUBTAB 6: SETTINGS ===================== */}
      {activeSubTab === 'settings' && myMembership?.role === 'Ketua' && (
        <GroupSettingsView circle={circle} onBack={() => setActiveSubTab('tasks')} />
      )}

      {/* ===================== MODAL 1: TAMBAH TUGAS BARU ===================== */}
      {isCreateTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Buat Tugas Baru untuk Grup</h3>
                  <p className="text-xs text-slate-500">Grup: {circle.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGroupTask} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Tugas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Modul Pelatihan AI & Coding Batch 1"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi & Instruksi
                </label>
                <textarea
                  rows={2}
                  placeholder="Rincian petunjuk pengerjaan dan ekspektasi hasil..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tenggat Waktu (Deadline)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 3 Hari Kedepan / 25 Ags"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Prioritas
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                  >
                    <option value="High">Tinggi (High)</option>
                    <option value="Medium">Sedang (Medium)</option>
                    <option value="Low">Rendah (Low)</option>
                  </select>
                </div>
              </div>

              {/* Delegated Task Toggle */}
              <div className="p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200/85 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-800 text-white flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-indigo-950">Tugas Mandiri Per Anggota Grup</h4>
                    <p className="text-[11px] text-indigo-700">
                      Setiap anggota mendapatkan checklist sendiri. Progres dihitung terpisah untuk masing-masing anggota.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={newTaskIsDelegated}
                    onChange={(e) => setNewTaskIsDelegated(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-700"></div>
                </label>
              </div>

              {/* Recurrence & Frequency Selection in Group Modal */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    Pengulangan & Frekuensi Tugas
                  </label>
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                    {newTaskFrequency === 'once'
                      ? 'Sekali Saja'
                      : newTaskFrequency === 'daily'
                      ? 'Harian 🔁'
                      : newTaskFrequency === 'weekly'
                      ? 'Mingguan 🔁'
                      : newTaskFrequency === 'monthly'
                      ? 'Bulanan 🔁'
                      : 'Hari Tertentu 📅'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
                  {[
                    { id: 'once', label: 'Sekali', sub: 'One-off' },
                    { id: 'daily', label: 'Harian', sub: 'Tiap Hari' },
                    { id: 'weekly', label: 'Mingguan', sub: 'Tiap Pekan' },
                    { id: 'monthly', label: 'Bulanan', sub: 'Tiap Bulan' },
                    { id: 'custom_days', label: 'Hari Khusus', sub: 'Pilih Hari' },
                  ].map((freq) => (
                    <button
                      key={freq.id}
                      type="button"
                      onClick={() => {
                        const f = freq.id as TaskFrequency;
                        setNewTaskFrequency(f);
                        if (f === 'daily') setNewTaskDeadline('Setiap Hari, ' + newTaskRecurrenceTime);
                        else if (f === 'weekly') setNewTaskDeadline('Setiap Minggu, ' + newTaskRecurrenceTime);
                        else if (f === 'monthly') setNewTaskDeadline('Setiap Bulan (Tgl 1)');
                        else if (f === 'custom_days') setNewTaskDeadline('Hari Terjadwal, ' + newTaskRecurrenceTime);
                      }}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        newTaskFrequency === freq.id
                          ? 'bg-teal-800 text-white border-teal-800 shadow-xs ring-1 ring-teal-800'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-bold whitespace-nowrap">{freq.label}</div>
                      <div className={`text-[9px] ${newTaskFrequency === freq.id ? 'text-teal-200' : 'text-slate-400'}`}>
                        {freq.sub}
                      </div>
                    </button>
                  ))}
                </div>

                {(newTaskFrequency === 'custom_days' || newTaskFrequency === 'weekly') && (
                  <div className="pt-2 border-t border-slate-200 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 block">Pilih Hari Rutin:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { id: 1, label: 'Senin' },
                        { id: 2, label: 'Selasa' },
                        { id: 3, label: 'Rabu' },
                        { id: 4, label: 'Kamis' },
                        { id: 5, label: 'Jumat' },
                        { id: 6, label: 'Sabtu' },
                        { id: 0, label: 'Ahad' },
                      ].map((day) => {
                        const isSelected = newTaskRecurrenceDays.includes(day.id);
                        return (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => {
                              if (newTaskFrequency === 'weekly') {
                                setNewTaskRecurrenceDays([day.id]);
                              } else {
                                setNewTaskRecurrenceDays((prev) =>
                                  isSelected
                                    ? prev.length > 1 ? prev.filter((d) => d !== day.id) : prev
                                    : [...prev, day.id]
                                );
                              }
                            }}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-amber-500 text-white shadow-2xs'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Assignee Delegation Selector with Search */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-teal-700" />
                    Delegasikan Kepada Anggota Grup ({selectedAssigneeIds.length} dipilih)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedAssigneeIds(circle.members.map((m) => m.id))}
                      className="text-[10px] font-bold text-teal-800 hover:underline px-1.5 py-0.5 rounded bg-teal-50"
                    >
                      Pilih Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAssigneeIds([])}
                      className="text-[10px] font-bold text-slate-500 hover:underline px-1.5 py-0.5 rounded bg-slate-100"
                    >
                      Bersihkan
                    </button>
                  </div>
                </div>

                {/* Member Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={taskAssigneeSearch}
                    onChange={(e) => setTaskAssigneeSearch(e.target.value)}
                    placeholder="Cari nama anggota atau peran tim..."
                    className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all"
                  />
                  {taskAssigneeSearch && (
                    <button
                      type="button"
                      onClick={() => setTaskAssigneeSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {circle.members
                    .filter((m) =>
                      m.name.toLowerCase().includes(taskAssigneeSearch.toLowerCase()) ||
                      m.role.toLowerCase().includes(taskAssigneeSearch.toLowerCase())
                    )
                    .map((m) => {
                      const isSelected = selectedAssigneeIds.includes(m.id);
                      return (
                        <button
                          type="button"
                          key={m.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedAssigneeIds(selectedAssigneeIds.filter((id) => id !== m.id));
                            } else {
                              setSelectedAssigneeIds([...selectedAssigneeIds, m.id]);
                            }
                          }}
                          className={`flex items-center justify-between gap-2 p-2 rounded-xl text-xs text-left transition-all border ${
                            isSelected
                              ? 'bg-teal-50/90 border-teal-500 ring-1 ring-teal-500 text-teal-950 font-bold shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={m.avatar}
                              alt={m.name}
                              referrerPolicy="no-referrer"
                              className="w-6 h-6 rounded-full object-cover shrink-0"
                            />
                            <div className="truncate">
                              <div className={`truncate text-xs ${isSelected ? 'text-teal-950 font-bold' : 'text-slate-900 font-semibold'}`}>{m.name}</div>
                              <div className={`text-[10px] font-medium truncate ${isSelected ? 'text-teal-800' : 'text-slate-500'}`}>
                                {m.role}
                              </div>
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ml-1 ${
                            isSelected ? 'bg-teal-700 text-white font-bold shadow-2xs' : 'border border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Subtasks Checklist & Resolution Models Builder */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Checklist & Model Pengerjaan Tahapan (Subtasks)
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {newTaskSubtasks.length} Tahapan Terjadwal
                  </span>
                </div>

                {/* Subtask Input Box with Mode Selection */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                  <div>
                    <div className="text-[11px] font-bold text-slate-700 mb-1">
                      Pilih Model Penyelesaian Subtask:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[
                        { id: 'checkbox', label: '☑️ Centang Biasa', desc: 'Selesai 1-klik' },
                        { id: 'checkbox_note', label: '📝 Wajib Keterangan', desc: 'Harus isi catatan/bukti' },
                        { id: 'number_input', label: '🔢 Target Angka', desc: 'Isi jumlah/progres' },
                        { id: 'select_option', label: '📋 Opsi Status', desc: 'Pilihan dropdown' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setCurrentSubtaskType(t.id as SubtaskType)}
                          className={`p-2 rounded-xl text-left border transition-all ${
                            currentSubtaskType === t.id
                              ? t.id === 'checkbox_note'
                                ? 'bg-indigo-50 border-indigo-600 text-indigo-950 ring-1 ring-indigo-600'
                                : 'bg-teal-50 border-teal-600 text-teal-950 ring-1 ring-teal-600'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="text-xs font-bold truncate">{t.label}</div>
                          <div className="text-[9px] text-slate-500 line-clamp-1">{t.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Tulis judul tahapan pengerjaan..."
                      value={currentSubtaskInput}
                      onChange={(e) => setCurrentSubtaskInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubtask();
                        }
                      }}
                      className="flex-1 min-w-0 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none shadow-2xs"
                    />

                    <button
                      type="button"
                      onClick={handleAddSubtask}
                      className="px-4 py-2 bg-teal-800 hover:bg-teal-900 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shrink-0 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah</span>
                    </button>
                  </div>

                  {/* Mode Specific Dynamic Fields */}
                  {currentSubtaskType === 'checkbox_note' && (
                    <div className="p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1.5">
                      <label className="text-[11px] font-bold text-indigo-950 block">
                        Placeholder Panduan Keterangan (Ditentukan Admin):
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Nomor Resi / Link Berkas Google Drive / No. Berita Acara..."
                        value={currentSubtaskNotePlaceholder}
                        onChange={(e) => setCurrentSubtaskNotePlaceholder(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 placeholder:text-slate-400"
                      />
                      <p className="text-[10px] text-indigo-800 leading-relaxed font-medium">
                        💡 <strong>Penting:</strong> Checkbox tahapan ini <u>tidak akan dapat terchecklist / selesai</u> jika anggota belum mengisi keterangan atau bukti pengerjaan saat pengerjaan.
                      </p>
                    </div>
                  )}

                  {currentSubtaskType === 'number_input' && (
                    <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-amber-900 block mb-0.5">
                            Target Angka:
                          </label>
                          <input
                            type="number"
                            value={currentSubtaskTarget}
                            onChange={(e) => setCurrentSubtaskTarget(e.target.value)}
                            className="w-full px-2.5 py-1 bg-white border border-amber-200 rounded-lg text-xs font-bold text-slate-900"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-amber-900 block mb-0.5">
                            Satuan / Unit:
                          </label>
                          <input
                            type="text"
                            placeholder="Paket / Halaman / Juz / Unit..."
                            value={currentSubtaskUnit}
                            onChange={(e) => setCurrentSubtaskUnit(e.target.value)}
                            className="w-full px-2.5 py-1 bg-white border border-amber-200 rounded-lg text-xs text-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentSubtaskType === 'select_option' && (
                    <div className="p-2.5 bg-sky-50/70 border border-sky-200 rounded-xl space-y-1.5">
                      <label className="text-[10px] font-bold text-sky-950 block">
                        Daftar Pilihan Status (Pisahkan dengan koma):
                      </label>
                      <input
                        type="text"
                        value={currentSubtaskOptions}
                        onChange={(e) => setCurrentSubtaskOptions(e.target.value)}
                        placeholder="Belum Dimulai, Sedang Draf, Tahap Review, Selesai"
                        className="w-full px-2.5 py-1 bg-white border border-sky-200 rounded-lg text-xs text-slate-900"
                      />
                    </div>
                  )}
                </div>

                {/* Subtasks Stored List */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
                  {newTaskSubtasks.length === 0 ? (
                    <div className="p-3.5 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      Belum ada poin tahapan tugas. Tambahkan poin di atas sesuai kebutuhan.
                    </div>
                  ) : (
                    newTaskSubtasks.map((st, idx) => (
                      <div
                        key={st.id}
                        className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5 transition-all hover:border-slate-300"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-slate-800 text-xs break-words leading-snug">
                              {st.title}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubtask(st.id)}
                            className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded-lg shrink-0 transition-colors"
                            title="Hapus Tahapan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Full Detail Badges - Clean Wrapping */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                              st.priority === 'High'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : st.priority === 'Low'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {st.priority}
                          </span>

                          {st.type === 'checkbox' && (
                            <span className="px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-md text-[10px] font-semibold">
                              ☑️ Centang Biasa (1-Klik)
                            </span>
                          )}
                          {st.type === 'checkbox_note' && (
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-md text-[10px] font-semibold break-words">
                              📝 Wajib Keterangan {st.notePlaceholder ? `(Panduan: "${st.notePlaceholder}")` : ''}
                            </span>
                          )}
                          {st.type === 'number_input' && (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-md text-[10px] font-semibold">
                              🔢 Target: {st.targetValue} {st.unit}
                            </span>
                          )}
                          {st.type === 'select_option' && (
                            <span className="px-2 py-0.5 bg-sky-50 text-sky-900 border border-sky-200 rounded-md text-[10px] font-semibold break-words">
                              📋 Opsi: {st.options?.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateTaskModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors shadow-xs"
                >
                  Terbitkan Tugas Grup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL 2: TAMBAH ANGGOTA DARI KONTAK ===================== */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Tambah Anggota ke Grup</h3>
                  <p className="text-xs text-slate-500">Pilih dari direktori kontak atau bagikan kode</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddMemberModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Share Code Card */}
              <div className="bg-teal-50/80 p-3 rounded-2xl border border-teal-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-teal-800">Kode Undangan Grup:</span>
                    <div className="text-sm font-black text-teal-950 tracking-wider">{circle.code}</div>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 shadow-xs"
                  >
                    {copiedCode ? 'Tersalin!' : 'Salin Kode'}
                  </button>
                </div>
                <div className="border-t border-teal-200/50 pt-3 flex items-center justify-between">
                  <div className="text-[10px] text-teal-800 font-medium">Atau bagikan link langsung:</div>
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 bg-white border border-teal-300 text-teal-800 rounded-xl text-xs font-bold hover:bg-teal-50 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>{copiedLink ? 'Link Tersalin!' : 'Salin / Bagikan Link'}</span>
                  </button>
                </div>
              </div>

              {/* Role default for new additions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Peran untuk Anggota Baru
                </label>
                <select
                  value={selectedRoleForNewMembers}
                  onChange={(e) => setSelectedRoleForNewMembers(e.target.value as CircleMember['role'])}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                >
                  <option value="Anggota">Anggota Biasa</option>
                  <option value="Bendahara">Bendahara (Pengelola Keuangan Kas)</option>
                  <option value="Sekretaris">Sekretaris</option>
                </select>
              </div>

              {/* Contact list picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Cari Anggota (Ketik Username atau Nama)
                </label>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ketik username atau nama anggota (contoh: @budi)..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-medium"
                  />
                </div>
                
                {memberSearch.trim().length >= 2 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                    {availableUsers
                      .filter((u) => {
                        const q = memberSearch.trim().toLowerCase();
                        const nameMatch = u.name.toLowerCase().includes(q);
                        const usernameMatch = u.username ? u.username.toLowerCase().includes(q) : false;
                        const emailMatch = u.email ? u.email.toLowerCase().includes(q) : false;
                        return nameMatch || usernameMatch || emailMatch;
                      })
                      .map((u: any) => {
                      const alreadyInGroup = circle.members.some((m) => m.id === u.id);
                      const isSelected = selectedDirectoryUsers.includes(u.id);

                      return (
                        <div
                          key={u.id}
                          onClick={() => {
                            if (alreadyInGroup) return;
                            if (isSelected) {
                              setSelectedDirectoryUsers(selectedDirectoryUsers.filter((id) => id !== u.id));
                            } else {
                              setSelectedDirectoryUsers([...selectedDirectoryUsers, u.id]);
                            }
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                            alreadyInGroup
                              ? 'opacity-50 bg-slate-100 border-slate-200 cursor-not-allowed'
                              : isSelected
                              ? 'bg-teal-50 border-teal-400 shadow-xs cursor-pointer'
                              : 'bg-white border-slate-200 hover:border-slate-300 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={u.avatar}
                              alt={u.name}
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-900">{u.name}</div>
                              <div className="text-[10px] text-slate-500">{u.username ? `@${u.username}` : ''} • {u.roleTitle || 'Anggota'}</div>
                            </div>
                          </div>

                          <div>
                            {alreadyInGroup ? (
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                                Sudah Bergabung
                              </span>
                            ) : isSelected ? (
                              <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {availableUsers.filter((u) => {
                        const q = memberSearch.trim().toLowerCase();
                        const nameMatch = u.name.toLowerCase().includes(q);
                        const usernameMatch = u.username ? u.username.toLowerCase().includes(q) : false;
                        const emailMatch = u.email ? u.email.toLowerCase().includes(q) : false;
                        return nameMatch || usernameMatch || emailMatch;
                      }).length === 0 && (
                        <div className="text-center py-5 space-y-1">
                          <p className="text-xs font-bold text-slate-700">Pengguna tidak ditemukan</p>
                          <p className="text-[11px] text-slate-500">
                            Pengguna tidak ditemukan atau sudah bergabung dalam grup ini.
                          </p>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <Search className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                    <p className="text-xs font-bold text-slate-700">Ketik Username Anggota</p>
                    <p className="text-[11px] text-slate-500 max-w-[240px] mx-auto leading-relaxed">
                      Ketik nama atau username anggota (min. 2 karakter) untuk mencari anggota baru.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  disabled={selectedDirectoryUsers.length === 0}
                  onClick={handleAddMembersSubmit}
                  className="px-5 py-2 text-xs font-bold bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-xs"
                >
                  Tambahkan ({selectedDirectoryUsers.length}) Anggota
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL 3: CATAT TRANSAKSI KAS ===================== */}
      {isAddTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Catat Pembukuan Kas</h3>
                  <p className="text-xs text-slate-500">Grup: {circle.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddTxModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTxSubmit} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setNewTxType('income')}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                    newTxType === 'income' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Pemasukan
                </button>
                <button
                  type="button"
                  onClick={() => setNewTxType('expense')}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                    newTxType === 'expense' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setNewTxType('dues')}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                    newTxType === 'dues' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Iuran Anggota
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keterangan Transaksi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembelian Modul Belajar & Konsumsi"
                  value={newTxTitle}
                  onChange={(e) => setNewTxTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nominal (Rp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  placeholder="Contoh: 150000"
                  value={newTxAmount}
                  onChange={(e) => setNewTxAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pihak Terkait / Pembayar
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Dimas Wicaksono / Toko Buku Gramedia"
                  value={newTxPayer}
                  onChange={(e) => setNewTxPayer(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddTxModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors shadow-xs"
                >
                  Simpan Transaksi Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirmation Modal for Removing Member */}
      <ConfirmationModal
        isOpen={!!memberToRemove}
        title="Keluarkan Anggota Grup?"
        message={`Apakah Anda yakin ingin mengeluarkan "${memberToRemove?.name}" dari grup ${circle.name}? Data tugas dan kontribusi anggota ini akan disesuaikan.`}
        confirmLabel="Ya, Keluarkan"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={() => {
          if (memberToRemove) {
            removeMemberFromCircle(circle.id, memberToRemove.id);
            setMemberToRemove(null);
          }
        }}
        onCancel={() => setMemberToRemove(null)}
      />

      {/* Confirmation Modal for Deleting Group Task */}
      <ConfirmationModal
        isOpen={!!taskToRemove}
        title="Hapus Tugas Bersama?"
        message={`Apakah Anda yakin ingin menghapus tugas "${taskToRemove?.title}"? Semua progres checklist dan penugasan anggota pada tugas ini akan dihapus permanen.`}
        confirmLabel="Ya, Hapus Tugas"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={() => {
          if (taskToRemove) {
            deleteTask(taskToRemove.id);
            setTaskToRemove(null);
          }
        }}
        onCancel={() => setTaskToRemove(null)}
      />

      {/* ===================== MODAL INFO & PENGATURAN GRUP (WHATSAPP STYLE) ===================== */}
      {isGroupInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Informasi & Pengaturan Grup</h3>
                  <p className="text-xs text-slate-500">{circle.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsGroupInfoModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Group Hero Profile Card */}
            <div className="text-center space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
              <div className="relative w-20 h-20 mx-auto group">
                <img
                  src={circle.avatar}
                  alt={circle.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-sm"
                />
                {myMembership?.role === 'Ketua' && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={groupAvatarInputRef}
                      onChange={handleGroupAvatarUpload}
                    />
                    <button
                      type="button"
                      disabled={isUploadingGroupAvatar}
                      onClick={() => groupAvatarInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                      title="Ubah Foto Profil Grup"
                    >
                      {isUploadingGroupAvatar ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-5 h-5" />
                      )}
                    </button>
                  </>
                )}
              </div>
              
              {myMembership?.role === 'Ketua' && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    disabled={isUploadingGroupAvatar}
                    onClick={() => groupAvatarInputRef.current?.click()}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-white hover:bg-teal-50 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Camera className="w-3 h-3 text-teal-600" />
                    {isUploadingGroupAvatar ? 'Mengunggah...' : 'Ubah Foto Profil'}
                  </button>
                </div>
              )}

              <div>
                <h2 className="text-lg font-black text-slate-900">{circle.name}</h2>
                <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
                  <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-slate-200 text-slate-700">
                    {circle.category}
                  </span>
                  {myMembership && (
                    <span className="px-2.5 py-0.5 text-[11px] font-extrabold rounded-full bg-teal-100 text-teal-800">
                      Peran Anda: {myMembership.role}
                    </span>
                  )}
                </div>
              </div>

              {circle.description && (
                <p className="text-xs text-slate-600 leading-relaxed px-2">
                  {circle.description}
                </p>
              )}
            </div>

            {/* Quick Action Grid (WhatsApp Style) */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  handleCopyLink();
                }}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 font-bold text-xs transition-colors cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-black">Bagikan Link</div>
                  <div className="text-[10px] text-emerald-700 font-medium">Undang via URL</div>
                </div>
              </button>

              <button
                onClick={() => {
                  handleCopyCode();
                }}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200/80 font-bold text-xs transition-colors cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0">
                  <Copy className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-black">Kode Undangan</div>
                  <div className="text-[10px] text-teal-700 font-mono font-bold">{circle.code}</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsGroupInfoModalOpen(false);
                  setIsAddMemberModalOpen(true);
                }}
                disabled={!isAdmin}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border font-bold text-xs transition-colors cursor-pointer text-left w-full ${
                  isAdmin 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200' 
                    : 'bg-slate-50 text-slate-400 border-slate-100 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isAdmin ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'}`}>
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-black">Tambah Anggota</div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {isAdmin ? 'Cari dari direktori' : 'Hanya Admin/Ketua'}
                  </div>
                </div>
              </button>

              {isAdmin && (
                <button
                  onClick={() => {
                    setIsGroupInfoModalOpen(false);
                    setActiveSubTab('settings');
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold text-xs transition-colors cursor-pointer text-left"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black">Pengaturan Grup</div>
                    <div className="text-[10px] text-indigo-700 font-medium">Kelola profil & akses</div>
                  </div>
                </button>
              )}
            </div>

            {/* Group Key Information Stats */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ringkasan Grup</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
                  <Wallet className="w-4 h-4 text-teal-600 mx-auto mb-1" />
                  <div className="text-[10px] text-slate-500 font-medium">Kas Grup</div>
                  <div className="text-xs font-black text-slate-900">Rp {circle.kasBalance.toLocaleString('id-ID')}</div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
                  <CheckSquare className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                  <div className="text-[10px] text-slate-500 font-medium">Tugas Aktif</div>
                  <div className="text-xs font-black text-slate-900">
                    {groupTasks.filter((t) => t.status !== 'done').length} Tugas
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
                  <Calendar className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                  <div className="text-[10px] text-slate-500 font-medium">Jadwal Rutin</div>
                  <div className="text-xs font-black text-slate-900 truncate">
                    {circle.meetingSchedule || 'Mingguan'}
                  </div>
                </div>
              </div>
            </div>

            {/* Members Section Preview */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Anggota Grup ({circle.members.length})
                </h4>
                <button
                  onClick={() => {
                    setIsGroupInfoModalOpen(false);
                    setActiveSubTab('members');
                  }}
                  className="text-xs font-bold text-teal-700 hover:underline"
                >
                  Lihat Semua
                </button>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {circle.members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-lg object-cover" />
                      <span className="font-bold text-slate-800 truncate">{m.name}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-600 border border-slate-200 shrink-0">
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Leave Group Button at Bottom */}
            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  if (myMembership?.role === 'Ketua' && circle.members.length > 1) {
                    const otherAdmins = circle.members.filter((m) => m.role === 'Ketua' && m.id !== currentUser.id);
                    if (otherAdmins.length === 0) {
                      alert('Anda adalah satu-satunya Ketua (Admin) di grup ini. Silakan serahkan peran Ketua ke anggota lain atau hapus grup jika ingin keluar.');
                      return;
                    }
                  }
                  setIsGroupInfoModalOpen(false);
                  setIsLeaveGroupModalOpen(true);
                }}
                className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Keluar dari Grup Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Leaving Group */}
      <ConfirmationModal
        isOpen={isLeaveGroupModalOpen}
        title="Keluar dari Grup Ini?"
        message={`Apakah Anda yakin ingin keluar dari grup "${circle.name}"? Anda tidak akan lagi menerima notifikasi atau tugas grup ini kecuali Anda bergabung kembali dengan kode undangan.`}
        confirmLabel="Ya, Keluar Grup"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={() => {
          leaveCircle(circle.id);
          setIsLeaveGroupModalOpen(false);
          onBack();
        }}
        onCancel={() => setIsLeaveGroupModalOpen(false)}
      />
    </div>
  );
};
