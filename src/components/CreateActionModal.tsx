import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  CheckSquare, 
  Wallet, 
  Users, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus, 
  Flag,
  Calendar,
  Layers,
  Send,
  Paperclip,
  AtSign,
  Image as ImageIcon,
  Flame,
  Clock,
  Sparkles,
  Trash2,
  Check,
  UserCheck,
  Zap,
  CalendarDays,
  Target,
  ListTodo,
  Search,
  Lock,
  Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PostCategory, Priority, TransactionType, PostAttachment, TaskFrequency, TaskAssignee, SubtaskType } from '../types';
import { MentionInput } from './MentionInput';
import { AttachmentUploader } from './AttachmentUploader';
import { AttachmentList } from './AttachmentList';

interface CreateActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'post' | 'task' | 'finance' | 'circle' | 'meeting' | null;
  defaultCircleId?: string;
  defaultDate?: string;
}

interface CustomSubtaskItem {
  id: string;
  title: string;
  priority: Priority;
  assignedTo?: string;
  type?: SubtaskType;
  completionNote?: string;
  notePlaceholder?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  options?: string[];
  selectedOption?: string;
}

export const CreateActionModal: React.FC<CreateActionModalProps> = ({
  isOpen,
  onClose,
  initialType = null,
  defaultCircleId,
  defaultDate,
}) => {
  const {
    currentUser,
    circles,
    activeCircleId,
    activeCircle,
    createPost,
    createTask,
    createMeeting,
    addTransaction,
    setActiveTab,
    postCategories,
  } = useApp();

  const [selectedType, setSelectedType] = useState<'post' | 'task' | 'meeting' | 'finance'>(
    initialType === 'meeting' ? 'meeting' : initialType || 'task'
  );

  // Circle selection for the action
  const [targetCircleId, setTargetCircleId] = useState<string>(
    defaultCircleId || (activeCircleId !== 'all' ? activeCircleId : circles[0]?.id || '')
  );

  // Available members in selected circle
  const selectedCircleObj = circles.find((c) => c.id === targetCircleId) || circles[0];
  const circleMembers = selectedCircleObj ? selectedCircleObj.members : [];

  // Default category from postCategories or 'Umum'
  const defaultPostCat = postCategories.find((c) => c.isDefault)?.name || postCategories[0]?.name || 'Umum';

  // Post form state
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState<string>(defaultPostCat);
  const [postSummary, setPostSummary] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postTags, setPostTags] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [postAttachments, setPostAttachments] = useState<PostAttachment[]>([]);
  const [postMentions] = useState<string[]>([]);
  const [postPrivacy, setPostPrivacy] = useState<'public' | 'group_only'>('public');

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskFrequency, setTaskFrequency] = useState<TaskFrequency>('once');
  const [taskRecurrenceDays, setTaskRecurrenceDays] = useState<number[]>([1, 3]); // default Senin & Rabu
  const [taskRecurrenceTime, setTaskRecurrenceTime] = useState('08:00 WIB');
  const [taskDeadline, setTaskDeadline] = useState(defaultDate || '28 Agustus 2026');
  const [taskPriority, setTaskPriority] = useState<Priority>('High');
  const [taskCategory, setTaskCategory] = useState('Riset & Literasi');
  const [taskTheme, setTaskTheme] = useState<'mint' | 'lavender' | 'peach' | 'sky'>('mint');
  const [isGroupGoal, setIsGroupGoal] = useState(true);
  const [isDelegated, setIsDelegated] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState<TaskAssignee[]>([
    { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar }
  ]);
  const [assigneeSearchQuery, setAssigneeSearchQuery] = useState('');
  const [pointsReward, setPointsReward] = useState<number>(50);

  // Subtask Builder state
  const [subtaskInputMode, setSubtaskInputMode] = useState<'interactive' | 'bulk'>('interactive');
  const [currentSubtaskInput, setCurrentSubtaskInput] = useState('');
  const [currentSubtaskPriority, setCurrentSubtaskPriority] = useState<Priority>('Medium');
  const [currentSubtaskType, setCurrentSubtaskType] = useState<SubtaskType>('checkbox');
  const [currentSubtaskNotePlaceholder, setCurrentSubtaskNotePlaceholder] = useState('');
  const [currentSubtaskTarget, setCurrentSubtaskTarget] = useState('50');
  const [currentSubtaskUnit, setCurrentSubtaskUnit] = useState('Paket');
  const [currentSubtaskOptions, setCurrentSubtaskOptions] = useState('Belum Dimulai, Sedang Draf, Tahap Review, Tuntas Selesai');
  const [currentSubtaskAssignee, setCurrentSubtaskAssignee] = useState<string>('');
  const [subtasksList, setSubtasksList] = useState<CustomSubtaskItem[]>([]);
  const [bulkSubtaskText, setBulkSubtaskText] = useState('');

  // Meeting form state
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState(defaultDate || '2026-08-25');
  const [meetingTimeRange, setMeetingTimeRange] = useState('19:30 - 20:45 WIB');
  const [meetingType, setMeetingType] = useState<
    'Diskusi Rutin' | 'Evaluasi Kas' | 'Review Modul' | 'Briefing Aksi' | 'Koordinasi Tim'
  >('Diskusi Rutin');
  const [meetingUrl, setMeetingUrl] = useState('https://meet.google.com/lin-gkar-meet');
  const [meetingDesc, setMeetingDesc] = useState('');

  // Finance form state
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<TransactionType>('income');
  const [txCategory, setTxCategory] = useState('Iuran Kas');
  const [txPayer, setTxPayer] = useState('Budi Pratama');
  const [txNote, setTxNote] = useState('');

  if (!isOpen) return null;

  // Subtask templates
  const templatePresets = [
    {
      name: '📚 Riset & Literasi',
      items: [
        'Kumpulkan 3 referensi buku/jurnal utama',
        'Buat intisari konsep & kerangka modul',
        'Review bersama rekan lingkar & catat feedback'
      ]
    },
    {
      name: '💰 Laporan Kas & Audit',
      items: [
        'Rekap seluruh bukti transaksi bulan ini',
        'Hitung selisih pemasukan & pengeluaran kas',
        'Publikasikan laporan transparan ke grup'
      ]
    },
    {
      name: '🤝 Aksi Relawan & Lapangan',
      items: [
        'Verifikasi data sasaran penerima manfaat',
        'Briefing tim logistik & pembagian peran',
        'Dokumentasi kegiatan & evaluasi pasca-aksi'
      ]
    },
    {
      name: '⚡ Sprint Evaluasi Mingguan',
      items: [
        'Checklist capaian target pekan ini',
        'Identifikasi hambatan atau kendala tim',
        'Rencanakan fastabiqul khairat pekan depan'
      ]
    }
  ];

  const applyTemplate = (items: string[]) => {
    const newItems: CustomSubtaskItem[] = items.map((it, idx) => ({
      id: `tmpl_${Date.now()}_${idx}`,
      title: it,
      priority: idx === 0 ? 'High' : 'Medium',
    }));
    setSubtasksList(newItems);
  };

  const handleAddSubtask = () => {
    if (!currentSubtaskInput.trim()) return;

    let targetVal: number | undefined = undefined;
    let unitVal: string | undefined = undefined;
    let optionsVal: string[] | undefined = undefined;

    if (currentSubtaskType === 'number_input') {
      targetVal = parseFloat(currentSubtaskTarget) || 10;
      unitVal = currentSubtaskUnit.trim() || 'Unit';
    } else if (currentSubtaskType === 'select_option') {
      optionsVal = currentSubtaskOptions
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
      if (!optionsVal || optionsVal.length === 0) {
        optionsVal = ['Belum Dimulai', 'Sedang Draf', 'Tahap Review', 'Tuntas Selesai'];
      }
    }

    const newItem: CustomSubtaskItem = {
      id: `sub_${Date.now()}`,
      title: currentSubtaskInput.trim(),
      priority: currentSubtaskPriority,
      assignedTo: currentSubtaskAssignee || undefined,
      type: currentSubtaskType,
      notePlaceholder: currentSubtaskType === 'checkbox_note' ? (currentSubtaskNotePlaceholder.trim() || undefined) : undefined,
      targetValue: targetVal,
      currentValue: 0,
      unit: unitVal,
      options: optionsVal,
      selectedOption: optionsVal ? optionsVal[0] : undefined,
    };
    setSubtasksList((prev) => [...prev, newItem]);
    setCurrentSubtaskInput('');
    setCurrentSubtaskNotePlaceholder('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasksList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleToggleAssignee = (member: { id: string; name: string; avatar: string }) => {
    setSelectedAssignees((prev) => {
      const exists = prev.some((a) => a.id === member.id);
      if (exists) {
        if (prev.length === 1) return prev; // keep at least one
        return prev.filter((a) => a.id !== member.id);
      } else {
        return [...prev, { id: member.id, name: member.name, avatar: member.avatar }];
      }
    });
  };

  const handleAddAttachment = (att: PostAttachment) => {
    setPostAttachments((prev) => [...prev, att]);
  };

  const handleRemoveAttachment = (id: string) => {
    setPostAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    createPost({
      title: postTitle.trim(),
      summary: postSummary.trim() || postContent.slice(0, 120) + '...',
      content: postContent.trim(),
      category: postCategory,
      tags: postTags.split(',').map((t) => t.trim()).filter(Boolean),
      mentions: postMentions,
      attachments: postAttachments,
      imageUrl: postImageUrl || undefined,
      circleId: targetCircleId,
      isGroupPrivate: postPrivacy === 'group_only',
      visibility: postPrivacy,
    });

    setActiveTab('sharing');
    onClose();
  };

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    let finalSubtasks: (string | Partial<CustomSubtaskItem>)[] = [];
    if (subtaskInputMode === 'bulk' && bulkSubtaskText.trim()) {
      finalSubtasks = bulkSubtaskText.split('\n').map((s) => s.trim()).filter(Boolean);
    } else {
      finalSubtasks = subtasksList;
    }

    createTask({
      title: taskTitle.trim(),
      description: taskDesc.trim() || 'Target dan checklist kolaboratif bersama grup.',
      deadline: taskDeadline,
      priority: taskPriority,
      category: taskCategory,
      colorTheme: taskTheme,
      circleId: targetCircleId,
      subtasks: finalSubtasks as any,
      assignees: selectedAssignees,
      frequency: taskFrequency,
      recurrenceDays: taskFrequency === 'custom_days' || taskFrequency === 'weekly' ? taskRecurrenceDays : undefined,
      recurrenceTime: taskFrequency !== 'once' ? taskRecurrenceTime : undefined,
      isGroupGoal: isGroupGoal,
      isDelegated: isDelegated,
      pointsReward: pointsReward,
    });

    setActiveTab('tasks');
    onClose();
  };

  const handleSubmitMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle.trim() || !meetingDate) return;

    createMeeting({
      title: meetingTitle.trim(),
      date: meetingDate,
      timeRange: meetingTimeRange,
      type: meetingType,
      circleId: targetCircleId,
      meetUrl: meetingUrl.trim(),
      description: meetingDesc.trim(),
      attendees: selectedAssignees,
    });

    setActiveTab('tasks');
    onClose();
  };

  const handleSubmitFinance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTitle.trim() || !txAmount) return;

    addTransaction({
      title: txTitle.trim(),
      amount: Number(txAmount),
      type: txType,
      category: txCategory,
      circleId: targetCircleId,
      payerOrRecipient: txPayer.trim() || 'Anggota Tim',
      receiptNote: txNote.trim(),
    });

    setActiveTab('finance');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#f8fafc] rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-bold shadow-xs">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base font-display">
                Buat Entri Kebaikan & Target
              </h3>
              <p className="text-xs text-slate-500">
                Kelola target grup, jadwal agenda, atau pembukuan transparan.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Type Tabs */}
        <div className="p-4 pb-1 bg-white border-b border-slate-100">
          <div className="grid grid-cols-4 gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setSelectedType('task')}
              className={`py-2 px-1 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                selectedType === 'task'
                  ? 'bg-white text-teal-900 shadow-xs ring-1 ring-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 text-teal-700" />
              <span className="hidden sm:inline">Target &</span> Tugas
            </button>

            <button
              type="button"
              onClick={() => setSelectedType('meeting')}
              className={`py-2 px-1 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                selectedType === 'meeting'
                  ? 'bg-white text-indigo-900 shadow-xs ring-1 ring-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-indigo-700" />
              Agenda
            </button>

            <button
              type="button"
              onClick={() => setSelectedType('post')}
              className={`py-2 px-1 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                selectedType === 'post'
                  ? 'bg-white text-emerald-900 shadow-xs ring-1 ring-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
              Ilmu
            </button>

            <button
              type="button"
              onClick={() => setSelectedType('finance')}
              className={`py-2 px-1 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                selectedType === 'finance'
                  ? 'bg-white text-amber-900 shadow-xs ring-1 ring-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-amber-700" />
              Kas
            </button>
          </div>

          {/* Group Selector Dropdown */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 flex-shrink-0">
              <Users className="w-3.5 h-3.5 text-teal-700" />
              Untuk Grup:
            </span>
            <select
              value={targetCircleId}
              onChange={(e) => setTargetCircleId(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 transition-colors"
            >
              {circles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.members.length} anggota)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 1. FORM TARGET & TUGAS (REFACTORED WITH RECURRENCE, INPUTS/SELECTS, SUBTASK BUILDER, COLLABORATIVE GOALS) */}
        {selectedType === 'task' && (
          <form onSubmit={handleSubmitTask} className="p-4 sm:p-5 space-y-4">
            {/* Task Recurrence / Frequency Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Tipe & Frekuensi Target</span>
                <span className="text-[11px] font-medium text-slate-400">Pilih siklus pengerjaan</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'once', label: 'Tugas Sekali', desc: 'Milestone Proyek' },
                  { id: 'daily', label: 'Rutin Harian', desc: 'Daily Habit & Streak' },
                  { id: 'weekly', label: 'Rutin Mingguan', desc: 'Evaluasi Berkala' },
                ].map((freq) => {
                  const active = taskFrequency === freq.id;
                  return (
                    <button
                      key={freq.id}
                      type="button"
                      onClick={() => setTaskFrequency(freq.id as TaskFrequency)}
                      className={`p-3 rounded-2xl border text-left transition-all relative ${
                        active
                          ? 'bg-teal-900 text-white border-teal-900 shadow-sm'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${active ? 'text-white' : 'text-slate-900'}`}>
                          {freq.label}
                        </span>
                        {active && (
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-300"></span>
                        )}
                      </div>
                      <p className={`text-[10px] leading-tight ${active ? 'text-teal-200' : 'text-slate-500'}`}>{freq.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Task Title */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nama Target / Sasaran Grup <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Modul Riset Etika AI & Distribusi Buku"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            {/* Task Description */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Deskripsi / Sasaran Bersama
              </label>
              <textarea
                placeholder="Jelaskan tujuan akhir target ini dan apa yang diharapkan diselesaikan bersama..."
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            {/* Collaborative Group Goal Toggle */}
            <div className="p-3 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-200/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-teal-950">Target Bersama Kolaboratif</h4>
                  <p className="text-[11px] text-teal-700">
                    Seluruh anggota grup dapat mengklaim subtask dan menyelesaikannya bersama
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={isGroupGoal}
                  onChange={(e) => {
                    setIsGroupGoal(e.target.checked);
                    if (e.target.checked) {
                      setIsDelegated(false);
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-700"></div>
              </label>
            </div>

            {/* Delegated Task Toggle */}
            <div className="p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200/80 flex items-center justify-between gap-3">
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
              <label className="relative inline-flex inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={isDelegated}
                  onChange={(e) => {
                    setIsDelegated(e.target.checked);
                    if (e.target.checked) {
                      setIsGroupGoal(false);
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-700"></div>
              </label>
            </div>

            {/* 3-Column Select: Category, Priority, Points */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Kategori
                </label>
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                >
                  <option value="Riset & Literasi">Riset & Literasi</option>
                  <option value="Aksi Lapangan">Aksi Lapangan</option>
                  <option value="Transparansi Kas">Transparansi Kas</option>
                  <option value="Konten & Kampanye">Konten & Kampanye</option>
                  <option value="Evaluasi Tim">Evaluasi Tim</option>
                  <option value="Belajar Mandiri">Belajar Mandiri</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Prioritas
                </label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                >
                  <option value="High">🔴 Prioritas Tinggi</option>
                  <option value="Medium">🟡 Prioritas Sedang</option>
                  <option value="Low">🟢 Prioritas Santai</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Reward Kebaikan
                </label>
                <select
                  value={pointsReward}
                  onChange={(e) => setPointsReward(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                >
                  <option value={30}>+30 Poin</option>
                  <option value={50}>+50 Poin (Standar)</option>
                  <option value={75}>+75 Poin (Besar)</option>
                  <option value={100}>+100 Poin (Maksimal)</option>
                </select>
              </div>
            </div>

            {/* Recurrence & Frequency Configuration */}
            <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  Pengulangan & Frekuensi Tugas
                </label>
                <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  {taskFrequency === 'once' ? 'Sekali Saja' : taskFrequency === 'daily' ? 'Harian 🔁' : taskFrequency === 'weekly' ? 'Mingguan 🔁' : taskFrequency === 'monthly' ? 'Bulanan 🔁' : 'Hari Tertentu 📅'}
                </span>
              </div>

              {/* Frequency selection buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {[
                  { id: 'once', label: 'Sekali', sub: 'One-off' },
                  { id: 'daily', label: 'Harian', sub: 'Tiap Hari' },
                  { id: 'weekly', label: 'Mingguan', sub: 'Tiap Minggu' },
                  { id: 'monthly', label: 'Bulanan', sub: 'Tiap Bulan' },
                  { id: 'custom_days', label: 'Hari Khusus', sub: 'Pilih Hari' },
                ].map((freq) => (
                  <button
                    key={freq.id}
                    type="button"
                    onClick={() => {
                      const f = freq.id as TaskFrequency;
                      setTaskFrequency(f);
                      if (f === 'daily') setTaskDeadline('Setiap Hari, ' + taskRecurrenceTime);
                      else if (f === 'weekly') setTaskDeadline('Setiap Minggu, ' + taskRecurrenceTime);
                      else if (f === 'monthly') setTaskDeadline('Setiap Bulan (Tgl 1)');
                      else if (f === 'custom_days') setTaskDeadline('Hari Terjadwal, ' + taskRecurrenceTime);
                    }}
                    className={`p-2 rounded-xl text-center border transition-all ${
                      taskFrequency === freq.id
                        ? 'bg-teal-800 text-white border-teal-800 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-xs font-bold">{freq.label}</span>
                    <span className={`block text-[9px] ${taskFrequency === freq.id ? 'text-teal-200' : 'text-slate-400'}`}>
                      {freq.sub}
                    </span>
                  </button>
                ))}
              </div>

              {/* Day Picker for Custom Days & Weekly */}
              {(taskFrequency === 'custom_days' || taskFrequency === 'weekly') && (
                <div className="pt-2 border-t border-slate-200/60 space-y-1.5 animate-in fade-in duration-150">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Pilih Hari Pengulangan:
                  </span>
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
                      const isSelected = taskRecurrenceDays.includes(day.id);
                      return (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => {
                            if (taskFrequency === 'weekly') {
                              setTaskRecurrenceDays([day.id]);
                            } else {
                              setTaskRecurrenceDays((prev) =>
                                isSelected
                                  ? prev.length > 1 ? prev.filter((d) => d !== day.id) : prev
                                  : [...prev, day.id]
                              );
                            }
                          }}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
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

              {/* Time of Day for recurring */}
              {taskFrequency !== 'once' && (
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-700">Waktu Rutin Pengingat:</span>
                  <input
                    type="text"
                    value={taskRecurrenceTime}
                    onChange={(e) => setTaskRecurrenceTime(e.target.value)}
                    placeholder="Contoh: 08:00 WIB"
                    className="w-32 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
              )}
            </div>

            {/* Deadline with Quick Presets */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-700" />
                  Tenggat / Jadwal Target
                </label>
                <span className="text-[10px] text-slate-400">Pilih tanggal atau preset</span>
              </div>
              <input
                type="text"
                value={taskDeadline}
                onChange={(e) => setTaskDeadline(e.target.value)}
                placeholder="Contoh: 28 Agustus 2026"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {[
                  'Hari Ini',
                  'Besok',
                  'Akhir Pekan',
                  '28 Agustus 2026',
                  '31 Agustus 2026',
                  '15 September 2026',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTaskDeadline(preset)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold flex-shrink-0 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignee Multi-Selector with Search */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-teal-700" />
                  Penanggung Jawab / Kontributor ({selectedAssignees.length} dipilih)
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAssignees(circleMembers.map((m) => ({ id: m.id, name: m.name, avatar: m.avatar })));
                    }}
                    className="text-[10px] font-bold text-teal-800 hover:underline px-1.5 py-0.5 rounded bg-teal-50"
                  >
                    Pilih Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAssignees([])}
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
                  value={assigneeSearchQuery}
                  onChange={(e) => setAssigneeSearchQuery(e.target.value)}
                  placeholder="Cari nama anggota atau peran tim..."
                  className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all"
                />
                {assigneeSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setAssigneeSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 p-2 bg-white border border-slate-200 rounded-2xl max-h-36 overflow-y-auto">
                {circleMembers
                  .filter((m) =>
                    m.name.toLowerCase().includes(assigneeSearchQuery.toLowerCase()) ||
                    m.role.toLowerCase().includes(assigneeSearchQuery.toLowerCase())
                  )
                  .map((m) => {
                    const isSelected = selectedAssignees.some((a) => a.id === m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleToggleAssignee(m)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-teal-100/90 text-teal-950 border-teal-600 shadow-2xs ring-1 ring-teal-600'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                        }`}
                      >
                        <img
                          src={m.avatar}
                          alt={m.name}
                          className="w-4 h-4 rounded-full object-cover shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-slate-900 font-bold">{m.name.split(' ')[0]}</span>
                        <span className={`text-[9px] font-medium ${isSelected ? 'text-teal-800' : 'text-slate-500'}`}>
                          ({m.role})
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-teal-800 stroke-[3] ml-0.5" />}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Color Theme Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Palet Warna Kartu
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'mint', label: 'Mint Kebaikan', bg: 'bg-[#dcfce7] border-[#bbf7d0]' },
                  { id: 'lavender', label: 'Lavender Santun', bg: 'bg-[#ede9fe] border-[#ddd6fe]' },
                  { id: 'peach', label: 'Peach Hangat', bg: 'bg-[#ffedd5] border-[#fed7aa]' },
                  { id: 'sky', label: 'Sky Harapan', bg: 'bg-[#e0f2fe] border-[#bae6fd]' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setTaskTheme(c.id as typeof taskTheme)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border text-slate-800 transition-all ${c.bg} ${
                      taskTheme === c.id ? 'ring-2 ring-slate-900 scale-105 shadow-xs' : 'opacity-70'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* FLEXIBLE SUBTASK / CHECKLIST BUILDER */}
            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ListTodo className="w-4 h-4 text-teal-700" />
                    Subtask & Rencana Tahapan ({subtasksList.length} Tahap)
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Setiap tahapan akan memiliki progres checklist kolaboratif.
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setSubtaskInputMode('interactive')}
                    className={`px-2 py-1 rounded-md transition-all ${
                      subtaskInputMode === 'interactive' ? 'bg-white text-teal-900 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Inputan Interaktif
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubtaskInputMode('bulk')}
                    className={`px-2 py-1 rounded-md transition-all ${
                      subtaskInputMode === 'bulk' ? 'bg-white text-teal-900 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Teks Multi-Baris
                  </button>
                </div>
              </div>

              {/* Quick Template Picker */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">
                  PILIH TEMPLATE TAHAPAN INSTAN:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {templatePresets.map((tmpl) => (
                    <button
                      key={tmpl.name}
                      type="button"
                      onClick={() => applyTemplate(tmpl.items)}
                      className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[10px] font-bold border border-teal-200 transition-colors"
                    >
                      + {tmpl.name}
                    </button>
                  ))}
                </div>
              </div>

              {subtaskInputMode === 'interactive' ? (
                <div className="space-y-2.5">
                  {/* Mode Selector for the Subtask */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block flex items-center justify-between">
                      <span>Pilihan Model Penyelesaian Subtask:</span>
                      <span className="text-[10px] text-slate-400 font-normal">Tentukan cara anggota menyelesaikan tahapan</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[
                        { id: 'checkbox', label: 'Centang Biasa', desc: 'Selesai tanpa keterangan', icon: '☑️' },
                        { id: 'checkbox_note', label: 'Wajib Keterangan', desc: 'Harus isi keterangan/bukti', icon: '📝' },
                        { id: 'number_input', label: 'Target Angka', desc: 'Isi progres kuantitas', icon: '🔢' },
                        { id: 'select_option', label: 'Pilihan Status', desc: 'Pilih opsi dropdown', icon: '📋' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setCurrentSubtaskType(t.id as SubtaskType)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            currentSubtaskType === t.id
                              ? t.id === 'checkbox_note'
                                ? 'bg-indigo-50 border-indigo-600 ring-1 ring-indigo-600 shadow-2xs'
                                : 'bg-teal-50 border-teal-600 ring-1 ring-teal-600 shadow-2xs'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{t.icon}</span>
                            <span className="text-xs font-bold text-slate-900 leading-none truncate">
                              {t.label}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-1 leading-tight">{t.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subtask input bar */}
                  <div className="space-y-2.5 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Tulis judul tahapan subtask..."
                        value={currentSubtaskInput}
                        onChange={(e) => setCurrentSubtaskInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSubtask();
                          }
                        }}
                        className="flex-1 min-w-0 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 shadow-2xs"
                      />

                      <button
                        type="button"
                        onClick={handleAddSubtask}
                        className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah</span>
                      </button>
                    </div>

                    {circleMembers.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1 text-xs">
                        <span className="text-[11px] font-bold text-slate-600 shrink-0">Delegasi (PIC):</span>
                        <select
                          value={currentSubtaskAssignee}
                          onChange={(e) => setCurrentSubtaskAssignee(e.target.value)}
                          className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
                        >
                          <option value="">👤 Semua / Tanpa PIC Khusus</option>
                          {circleMembers.map((m) => (
                            <option key={m.id} value={m.name}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Conditional Fields based on Type */}
                    {currentSubtaskType === 'checkbox_note' && (
                      <div className="space-y-1 pt-1.5 border-t border-indigo-100 bg-indigo-50/50 p-2 rounded-xl text-xs">
                        <label className="text-[11px] font-bold text-indigo-950 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <span>📝</span> Placeholder Kolom Keterangan (Ditentukan Admin):
                          </span>
                          <span className="text-[10px] text-indigo-700 font-normal">Panduan Pengisi</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: Nomor Resi JNE / Tautan Berkas Google Drive / No. Nota Pembelian..."
                          value={currentSubtaskNotePlaceholder}
                          onChange={(e) => setCurrentSubtaskNotePlaceholder(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-2xs placeholder:text-slate-400"
                        />
                        <p className="text-[10px] text-slate-500 italic">
                          💡 Subtask ini tidak akan bisa terchecklist jika anggota belum mengisi keterangan saat pengerjaan.
                        </p>
                      </div>
                    )}

                    {currentSubtaskType === 'number_input' && (
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-200/70 text-xs">
                        <span className="text-[11px] font-bold text-amber-900 shrink-0">Target:</span>
                        <input
                          type="number"
                          placeholder="50"
                          value={currentSubtaskTarget}
                          onChange={(e) => setCurrentSubtaskTarget(e.target.value)}
                          className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                        />
                        <span className="text-[11px] font-bold text-slate-600 shrink-0">Satuan:</span>
                        <input
                          type="text"
                          placeholder="Paket / Modul / Rp"
                          value={currentSubtaskUnit}
                          onChange={(e) => setCurrentSubtaskUnit(e.target.value)}
                          className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                        />
                      </div>
                    )}

                    {currentSubtaskType === 'select_option' && (
                      <div className="space-y-1 pt-1 border-t border-slate-200/70 text-xs">
                        <span className="text-[11px] font-bold text-sky-900 block">
                          Pilihan Opsi Status (pisahkan dengan koma):
                        </span>
                        <input
                          type="text"
                          placeholder="Belum Dimulai, Sedang Draf, Tahap Review, Tuntas Selesai"
                          value={currentSubtaskOptions}
                          onChange={(e) => setCurrentSubtaskOptions(e.target.value)}
                          className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                        />
                      </div>
                    )}
                  </div>

                  {/* List of current subtasks */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
                    {subtasksList.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        Belum ada tahapan subtask yang ditambahkan. Tambahkan poin di atas.
                      </p>
                    ) : (
                      subtasksList.map((st, idx) => (
                        <div
                          key={st.id}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 hover:border-slate-300 transition-colors space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-semibold text-slate-800 break-words leading-snug">
                                {st.title}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveSubtask(st.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                              title="Hapus tahapan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-200/60">
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                st.priority === 'High'
                                  ? 'bg-rose-100 text-rose-800'
                                  : st.priority === 'Medium'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {st.priority}
                            </span>

                            {st.type === 'checkbox' && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 border border-slate-300">
                                ☑️ Centang Biasa
                              </span>
                            )}
                            {st.type === 'checkbox_note' && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 break-words">
                                📝 Wajib Keterangan {st.notePlaceholder ? `("${st.notePlaceholder}")` : ''}
                              </span>
                            )}
                            {st.type === 'number_input' && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                🔢 Target: {st.targetValue} {st.unit || 'Unit'}
                              </span>
                            )}
                            {st.type === 'select_option' && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 break-words">
                                📋 Dropdown Status
                              </span>
                            )}

                            {st.assignedTo && (
                              <span className="text-[10px] text-teal-800 font-semibold px-2 py-0.5 rounded bg-teal-50 border border-teal-200 flex items-center gap-1">
                                👤 PIC: {st.assignedTo}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <textarea
                    placeholder="Riset bahan modul&#10;Drafting infografis&#10;Review & publikasi"
                    value={bulkSubtaskText}
                    onChange={(e) => setBulkSubtaskText(e.target.value)}
                    rows={4}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 font-mono text-[11px]"
                  />
                  <span className="text-[10px] text-slate-400">1 baris = 1 subtask checklist</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-teal-800 text-white font-bold text-xs hover:bg-teal-900 shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <CheckSquare className="w-4 h-4 text-teal-300" />
              Publikasikan Target & Papan Checklist Grup (+{pointsReward} Pts)
            </button>
          </form>
        )}

        {/* 2. FORM AGENDA PERTEMUAN / EVENT KALENDER */}
        {selectedType === 'meeting' && (
          <form onSubmit={handleSubmitMeeting} className="p-4 sm:p-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Judul Agenda Pertemuan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Evaluasi Progres Modul & Fastabiqul Khairat"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tanggal Pertemuan
                </label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Rentang Jam (WIB)
                </label>
                <input
                  type="text"
                  placeholder="19:30 - 20:45 WIB"
                  value={meetingTimeRange}
                  onChange={(e) => setMeetingTimeRange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tipe Pertemuan
                </label>
                <select
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                >
                  <option value="Diskusi Rutin">Diskusi Rutin</option>
                  <option value="Evaluasi Kas">Evaluasi Kas</option>
                  <option value="Review Modul">Review Modul</option>
                  <option value="Briefing Aksi">Briefing Aksi</option>
                  <option value="Koordinasi Tim">Koordinasi Tim</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tautan Google Meet / Online
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Catatan Agenda / Poin Bahasan
              </label>
              <textarea
                placeholder="Rincian poin pembahasan, pembicara, dan persiapan yang diperlukan..."
                value={meetingDesc}
                onChange={(e) => setMeetingDesc(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-indigo-900 text-white font-bold text-xs hover:bg-indigo-950 shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <CalendarDays className="w-4 h-4 text-indigo-300" />
              Jadwalkan ke Kalender Grup (+15 Pts)
            </button>
          </form>
        )}

        {/* 3. FORM BAGIKAN ILMU */}
        {selectedType === 'post' && (
          <form onSubmit={handleSubmitPost} className="p-4 sm:p-5 space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Judul Wawasan / Rangkuman Buku
              </label>
              <input
                type="text"
                placeholder="Contoh: Rangkuman Buku 'Atomic Habits' untuk Tim"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Kategori
                </label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 cursor-pointer"
                >
                  {postCategories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name} {cat.isDefault ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tags (Koma)
                </label>
                <input
                  type="text"
                  placeholder="Buku, Riset, Tips"
                  value={postTags}
                  onChange={(e) => setPostTags(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Ringkasan Singkat
              </label>
              <input
                type="text"
                placeholder="Garis besar wawasan yang ingin disampaikan..."
                value={postSummary}
                onChange={(e) => setPostSummary(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Isi Materi / Catatan Lengkap
              </label>
              <MentionInput
                value={postContent}
                onChange={setPostContent}
                circleMembers={circleMembers}
                placeholder="Tulis poin-poin ilmu, kesimpulan, atau tandai rekan dengan @..."
                rows={4}
                className="w-full text-xs bg-white text-slate-900 leading-relaxed font-sans"
              />
            </div>

            {/* Photo Attachment */}
            <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-teal-700" />
                Foto / Sampul Visual Postingan
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={postImageUrl}
                onChange={(e) => setPostImageUrl(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            {/* Attachments Section */}
            <div className="space-y-2 pt-1 border-t border-slate-200/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-teal-700" />
                  Lampirkan Berkas Materi
                </label>
                <span className="text-[10px] text-slate-400">PDF, DOC, Slide, Foto</span>
              </div>

              {postAttachments.length > 0 && (
                <AttachmentList
                  attachments={postAttachments}
                  onRemove={handleRemoveAttachment}
                />
              )}

              <AttachmentUploader onAttach={handleAddAttachment} />
            </div>

            {/* Post Privacy Selector */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
              <label className="text-xs font-bold text-slate-700 block">
                Privasi & Akses Postingan
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPostPrivacy('public')}
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    postPrivacy === 'public'
                      ? 'bg-teal-50 border-teal-600 text-teal-950 ring-1 ring-teal-600'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Globe className="w-3.5 h-3.5 text-teal-700" />
                    <span>Publik</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                    Dapat dibaca semua pengunjung di beranda
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPostPrivacy('group_only')}
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    postPrivacy === 'group_only'
                      ? 'bg-teal-50 border-teal-600 text-teal-950 ring-1 ring-teal-600'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Lock className="w-3.5 h-3.5 text-teal-700" />
                    <span>Privat Grup</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                    Hanya anggota grup yang telah bergabung
                  </p>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-teal-800 text-white font-bold text-xs hover:bg-teal-900 shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4 text-teal-200" />
              Bagikan ke Lingkar (+35 Poin Kebaikan)
            </button>
          </form>
        )}

        {/* 4. FORM CATAT KAS */}
        {selectedType === 'finance' && (
          <form onSubmit={handleSubmitFinance} className="p-4 sm:p-5 space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Jenis Transaksi Kas
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTxType('income');
                    setTxCategory('Iuran Kas');
                  }}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    txType === 'income'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                  Pemasukan / Iuran
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTxType('expense');
                    setTxCategory('Operasional');
                  }}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    txType === 'expense'
                      ? 'bg-rose-100 text-rose-900 border-rose-300 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 text-rose-600" />
                  Pengeluaran
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Keterangan / Nama Transaksi
              </label>
              <input
                type="text"
                placeholder={txType === 'income' ? 'Contoh: Iuran Kas Rutin Agustus' : 'Contoh: Pembelian Modul & Alat Tulis'}
                value={txTitle}
                onChange={(e) => setTxTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 150000"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Kategori
                </label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                >
                  {txType === 'income' ? (
                    <>
                      <option value="Iuran Kas">Iuran Kas</option>
                      <option value="Donasi/Proyek">Donasi / Proyek</option>
                      <option value="Dana Hibah">Dana Hibah</option>
                      <option value="Lainnya">Lainnya</option>
                    </>
                  ) : (
                    <>
                      <option value="Operasional">Operasional</option>
                      <option value="Peralatan & Modul">Peralatan & Modul</option>
                      <option value="Konsumsi">Konsumsi Diskusi</option>
                      <option value="Kegiatan Sosial">Kegiatan Sosial</option>
                      <option value="Lainnya">Lainnya</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Pihak / Pembayar / Toko
              </label>
              <input
                type="text"
                placeholder="Contoh: Anggota Lingkar / Percetakan Mandiri"
                value={txPayer}
                onChange={(e) => setTxPayer(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Catatan Nota Transparan
              </label>
              <input
                type="text"
                placeholder="Contoh: Nota No. 1204 - Terverifikasi oleh Bendahara"
                value={txNote}
                onChange={(e) => setTxNote(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-amber-800 text-white font-bold text-xs hover:bg-amber-900 shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Wallet className="w-4 h-4 text-amber-200" />
              Simpan Pembukuan Transparan (+25 Pts)
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
