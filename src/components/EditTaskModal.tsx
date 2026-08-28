import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Search,
  UserCheck,
  UserPlus,
  Plus,
  Trash2,
  ListTodo,
  Calendar,
  Flag,
  Sparkles,
  Layers,
  Clock,
  ArrowUp,
  ArrowDown,
  FileText,
  AlertCircle,
  Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, Subtask, Priority, SubtaskType, TaskFrequency, TaskAssignee, CircleMember } from '../types';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  onClose,
  task,
}) => {
  const { circles, updateTask } = useApp();

  // Basic task fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [category, setCategory] = useState('Target Bersama');
  const [colorTheme, setColorTheme] = useState<'mint' | 'lavender' | 'peach' | 'sky'>('mint');
  const [frequency, setFrequency] = useState<TaskFrequency>('once');
  const [isGroupGoal, setIsGroupGoal] = useState(false);
  const [pointsReward, setPointsReward] = useState(50);

  // Assignee delegation & search state
  const [selectedAssignees, setSelectedAssignees] = useState<TaskAssignee[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Subtasks list state
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);

  // New subtask addition form state
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskPriority, setNewSubtaskPriority] = useState<Priority>('Medium');
  const [newSubtaskType, setNewSubtaskType] = useState<SubtaskType>('checkbox');
  const [newSubtaskNotePlaceholder, setNewSubtaskNotePlaceholder] = useState('');
  const [newSubtaskTarget, setNewSubtaskTarget] = useState('10');
  const [newSubtaskUnit, setNewSubtaskUnit] = useState('Unit');
  const [subtaskInputMode, setSubtaskInputMode] = useState<'single' | 'bulk'>('single');
  const [bulkSubtasksText, setBulkSubtasksText] = useState('');

  // Active circle & members
  const circle = task ? circles.find((c) => c.id === task.circleId) || circles[0] : circles[0];
  const circleMembers: CircleMember[] = circle ? circle.members : [];

  // Populate form when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setDeadline(task.deadline || '');
      setPriority(task.priority || 'Medium');
      setCategory(task.category || 'Target Bersama');
      setColorTheme(task.colorTheme || 'mint');
      setFrequency(task.frequency || 'once');
      setIsGroupGoal(task.isGroupGoal || false);
      setPointsReward(task.pointsReward || 50);
      setSelectedAssignees(task.assignees ? [...task.assignees] : []);
      setSubtasks(task.subtasks ? JSON.parse(JSON.stringify(task.subtasks)) : []);
      setMemberSearchQuery('');
      setNewSubtaskTitle('');
      setBulkSubtasksText('');
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  // Filter members by search query
  const filteredMembers = circleMembers.filter((m) =>
    m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
    m.role.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );

  const handleToggleAssignee = (member: CircleMember) => {
    const exists = selectedAssignees.some((a) => a.id === member.id);
    if (exists) {
      setSelectedAssignees(selectedAssignees.filter((a) => a.id !== member.id));
    } else {
      setSelectedAssignees([
        ...selectedAssignees,
        { id: member.id, name: member.name, avatar: member.avatar },
      ]);
    }
  };

  const handleSelectAllMembers = () => {
    const all = circleMembers.map((m) => ({ id: m.id, name: m.name, avatar: m.avatar }));
    setSelectedAssignees(all);
  };

  const handleClearAllMembers = () => {
    setSelectedAssignees([]);
  };

  // Add new subtask to the list
  const handleAddNewSubtask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    let targetVal: number | undefined = undefined;
    let unitVal: string | undefined = undefined;
    let optionsVal: string[] | undefined = undefined;

    if (newSubtaskType === 'number_input') {
      targetVal = parseFloat(newSubtaskTarget) || 10;
      unitVal = newSubtaskUnit.trim() || 'Unit';
    } else if (newSubtaskType === 'select_option') {
      optionsVal = ['Belum Dimulai', 'Sedang Dikerjakan', 'Tahap Review', 'Tuntas Selesai'];
    }

    const newSub: Subtask = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: newSubtaskTitle.trim(),
      completed: false,
      priority: newSubtaskPriority,
      type: newSubtaskType,
      notePlaceholder: newSubtaskType === 'checkbox_note' ? (newSubtaskNotePlaceholder.trim() || undefined) : undefined,
      targetValue: targetVal,
      currentValue: 0,
      unit: unitVal,
      options: optionsVal,
      selectedOption: newSubtaskType === 'select_option' ? 'Belum Dimulai' : undefined,
    };

    setSubtasks([...subtasks, newSub]);
    setNewSubtaskTitle('');
    setNewSubtaskNotePlaceholder('');
  };

  // Add bulk text subtasks
  const handleAddBulkSubtasks = () => {
    if (!bulkSubtasksText.trim()) return;
    const lines = bulkSubtasksText
      .split('\n')
      .map((l) => l.trim().replace(/^[-*•\d.)\]]\s*/, ''))
      .filter((l) => l.length > 0);

    const newItems: Subtask[] = lines.map((line, idx) => ({
      id: `sub_${Date.now()}_bulk_${idx}`,
      title: line,
      completed: false,
      priority: 'Medium',
      type: 'checkbox',
    }));

    setSubtasks([...subtasks, ...newItems]);
    setBulkSubtasksText('');
    setSubtaskInputMode('single');
  };

  // Update existing subtask field
  const handleUpdateSubtaskField = (subtaskId: string, field: keyof Subtask, value: any) => {
    setSubtasks(
      subtasks.map((st) => (st.id === subtaskId ? { ...st, [field]: value } : st))
    );
  };

  // Delete subtask from list
  const handleDeleteSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== subtaskId));
  };

  // Move subtask up / down
  const handleMoveSubtask = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === subtasks.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...subtasks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSubtasks(updated);
  };

  // Template presets
  const templatePresets = [
    {
      name: 'Riset & Data',
      items: ['Pengumpulan Dokumen Acuan', 'Analisis Data & Riset Awal', 'Penyusunan Rangkuman'],
    },
    {
      name: 'Acara & Lapangan',
      items: ['Briefing Tim Relawan', 'Persiapan Logistik & Tempat', 'Eksekusi & Dokumentasi', 'Evaluasi Akhir'],
    },
    {
      name: 'Donasi Kebaikan',
      items: ['Verifikasi Data Penerima', 'Penyaluran Paket Bantuan', 'Upload Bukti Dokumentasi'],
    },
  ];

  const applyTemplate = (items: string[]) => {
    const newItems: Subtask[] = items.map((item, idx) => ({
      id: `sub_tmpl_${Date.now()}_${idx}`,
      title: item,
      completed: false,
      priority: 'Medium',
      type: 'checkbox',
    }));
    setSubtasks([...subtasks, ...newItems]);
  };

  // Save all changes
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assigneesToSave = selectedAssignees.length > 0
      ? selectedAssignees
      : task.assignees;

    updateTask(task.id, {
      title: title.trim(),
      description: description.trim() || 'Tidak ada deskripsi tambahan.',
      deadline: deadline.trim() || 'Fleksibel',
      priority,
      category,
      colorTheme,
      frequency,
      isGroupGoal,
      pointsReward: Number(pointsReward) || 50,
      assignees: assigneesToSave,
      subtasks,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-[#f8fafc] w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-850 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-teal-200 shadow-2xs">
              <ListTodo className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-base sm:text-lg text-white">
                  Edit & Lengkapi Target
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-teal-100 text-[10px] font-bold">
                  {task.circleName}
                </span>
              </div>
              <p className="text-xs text-teal-200 truncate max-w-[280px]">
                Perbarui rincian tugas, delegasi anggota, dan checklist tahapan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center shadow-xs transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="edit-task-form" onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* 1. Judul Target */}
          <div className="space-y-1.5 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <label className="block text-xs font-bold text-slate-800">
              Judul Target Tugas <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Penyusunan Laporan Proyek Komunitas..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all"
            />
          </div>

          {/* 2. Deskripsi Sasaran */}
          <div className="space-y-1.5 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <label className="block text-xs font-bold text-slate-800">
              Deskripsi Sasaran & Catatan Tugas
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan sasaran, panduan teknis pengerjaan, atau link berkas pendukung..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* 3. Grid: Tenggat, Prioritas, Kategori, Siklus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Tenggat Waktu */}
            <div className="space-y-1.5 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-700" />
                Tenggat Waktu
              </label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="Contoh: 28 Agu 2026 / Besok Sore"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {['Hari Ini', 'Besok', '3 Hari Lagi', 'Minggu Ini', 'Akhir Bulan'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDeadline(d)}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium transition-colors"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Prioritas & Kategori */}
            <div className="space-y-1.5 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1">
                <Flag className="w-3.5 h-3.5 text-rose-600" />
                Tingkat Prioritas
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'High', label: '🔴 Tinggi', bg: 'bg-rose-50 border-rose-300 text-rose-800' },
                  { id: 'Medium', label: '🟡 Sedang', bg: 'bg-amber-50 border-amber-300 text-amber-800' },
                  { id: 'Low', label: '🟢 Rendah', bg: 'bg-emerald-50 border-emerald-300 text-emerald-800' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id as Priority)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                      priority === p.id
                        ? `${p.bg} ring-2 ring-slate-900 shadow-2xs`
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Kategori</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Target Bersama, Operasional, Keilmuan..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>
            </div>
          </div>

          {/* 4. Siklus Pengerjaan & Target Tim */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Siklus Pengerjaan */}
            <div className="space-y-1.5 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-700" />
                Siklus Pengerjaan
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'once', label: 'Sekali' },
                  { id: 'daily', label: '🔥 Rutin Harian' },
                  { id: 'weekly', label: 'Mingguan' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFrequency(f.id as TaskFrequency)}
                    className={`py-1.5 px-1 rounded-xl text-[10px] font-bold border text-center transition-all ${
                      frequency === f.id
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-1 ring-indigo-500'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Bersama Toggle & Reward Poin */}
            <div className="space-y-2 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Target Bersama Tim</span>
                  <span className="text-[10px] text-slate-400">Terbuka untuk semua anggota grup</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGroupGoal(!isGroupGoal)}
                  className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                    isGroupGoal ? 'bg-teal-700' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      isGroupGoal ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-700">Poin Hadiah Kebaikan:</span>
                <div className="flex items-center gap-1">
                  {[30, 50, 75, 100].map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => setPointsReward(pts)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                        pointsReward === pts
                          ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      +{pts}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 5. DELEGASI KEPADA ANGGOTA DENGAN FITUR PENCARIAN (MEMBER SEARCH) */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-teal-700" />
                Delegasi Penanggung Jawab / PIC ({selectedAssignees.length} Terpilih)
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSelectAllMembers}
                  className="text-[10px] font-bold text-teal-800 hover:underline px-1.5 py-0.5 rounded bg-teal-50"
                >
                  Pilih Semua
                </button>
                <button
                  type="button"
                  onClick={handleClearAllMembers}
                  className="text-[10px] font-bold text-slate-500 hover:underline px-1.5 py-0.5 rounded bg-slate-100"
                >
                  Bersihkan
                </button>
              </div>
            </div>

            {/* Real-time Member Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                placeholder="Ketik nama anggota atau peran untuk mencari..."
                className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all"
              />
              {memberSearchQuery && (
                <button
                  type="button"
                  onClick={() => setMemberSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filtered Members Grid / List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-1 bg-slate-50/70 rounded-xl border border-slate-200/80">
              {filteredMembers.length === 0 ? (
                <div className="col-span-2 text-center py-3 text-[11px] text-slate-400">
                  Tidak ada anggota yang cocok dengan pencarian "{memberSearchQuery}".
                </div>
              ) : (
                filteredMembers.map((m) => {
                  const isSelected = selectedAssignees.some((a) => a.id === m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleToggleAssignee(m)}
                      className={`flex items-center justify-between p-2 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-teal-50/90 text-teal-950 border-teal-500 ring-1 ring-teal-500 shadow-2xs'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
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
                          <div className={`text-xs font-bold truncate ${isSelected ? 'text-teal-950 font-bold' : 'text-slate-900'}`}>{m.name}</div>
                          <div className={`text-[9px] font-medium truncate ${isSelected ? 'text-teal-800' : 'text-slate-500'}`}>
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
                })
              )}
            </div>
          </div>

          {/* 6. SUBTASKS / CHECKLIST TAHAPAN EDITOR & TAMBAH TAHAPAN YANG KURANG */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ListTodo className="w-4 h-4 text-teal-700" />
                  Rincian Tahapan Subtask ({subtasks.length} Tahapan)
                </h4>
                <p className="text-[10px] text-slate-500">
                  Ubah urutan, hapus, atau tambahkan tahapan yang kurang.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setSubtaskInputMode('single')}
                  className={`px-2 py-1 rounded-md transition-all ${
                    subtaskInputMode === 'single' ? 'bg-white text-teal-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Inputan Mode
                </button>
                <button
                  type="button"
                  onClick={() => setSubtaskInputMode('bulk')}
                  className={`px-2 py-1 rounded-md transition-all ${
                    subtaskInputMode === 'bulk' ? 'bg-white text-teal-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Teks Cepat
                </button>
              </div>
            </div>

            {/* Quick Templates */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block">
                TAMBAH TEMPLATE CEPAT:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {templatePresets.map((tmpl) => (
                  <button
                    key={tmpl.name}
                    type="button"
                    onClick={() => applyTemplate(tmpl.items)}
                    className="px-2 py-0.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[10px] font-bold border border-teal-200 transition-colors"
                  >
                    + {tmpl.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Existing Subtasks List with Inline Edit, Up/Down, and Delete */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
              {subtasks.length === 0 ? (
                <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs">
                  Belum ada tahapan subtask. Gunakan form di bawah untuk menambahkan tahapan yang kurang.
                </div>
              ) : (
                subtasks.map((st, index) => {
                  const typeLabel = 
                    st.type === 'checkbox_note'
                      ? '📝 Wajib Catatan'
                      : st.type === 'number_input'
                      ? `🔢 Target: ${st.targetValue || 10} ${st.unit || 'Unit'}`
                      : st.type === 'select_option'
                      ? '📋 Pilihan Opsi'
                      : '☑️ Centang';

                  return (
                    <div
                      key={st.id}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 space-y-1.5 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 w-4">
                          {index + 1}.
                        </span>

                        <input
                          type="text"
                          value={st.title}
                          onChange={(e) => handleUpdateSubtaskField(st.id, 'title', e.target.value)}
                          placeholder="Nama tahapan..."
                          className="flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-700"
                        />

                        {/* Priority Selector for Subtask */}
                        <select
                          value={st.priority || 'Medium'}
                          onChange={(e) => handleUpdateSubtaskField(st.id, 'priority', e.target.value)}
                          className="px-1.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700"
                        >
                          <option value="High">🔴 Tinggi</option>
                          <option value="Medium">🟡 Sedang</option>
                          <option value="Low">🟢 Rendah</option>
                        </select>

                        {/* Move Up / Down */}
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveSubtask(index, 'up')}
                            className="p-1 rounded bg-white hover:bg-slate-200 disabled:opacity-30 text-slate-600"
                            title="Pindah ke atas"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={index === subtasks.length - 1}
                            onClick={() => handleMoveSubtask(index, 'down')}
                            className="p-1 rounded bg-white hover:bg-slate-200 disabled:opacity-30 text-slate-600"
                            title="Pindah ke bawah"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Delete subtask */}
                        <button
                          type="button"
                          onClick={() => handleDeleteSubtask(st.id)}
                          className="p-1 rounded bg-white hover:bg-rose-100 text-rose-600 transition-colors"
                          title="Hapus tahapan ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Subtask Type info badge */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pl-6">
                        <span className="font-medium bg-white px-2 py-0.5 rounded border border-slate-200">
                          {typeLabel}
                        </span>
                        {st.completed && (
                          <span className="text-emerald-700 font-bold">
                            ✓ Status Selesai
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* FORM TAMBAH TAHAPAN YANG KURANG */}
            <div className="pt-2 border-t border-slate-200">
              {subtaskInputMode === 'single' ? (
                <div className="space-y-2.5 bg-slate-50/80 p-3 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-800">
                      + Tambah Tahapan yang Kurang:
                    </span>
                    <span className="text-[10px] text-slate-400">Pilih model checklist</span>
                  </div>

                  {/* Mode Selector */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[
                      { id: 'checkbox', label: '☑️ Centang', desc: '1-Klik' },
                      { id: 'checkbox_note', label: '📝 Keterangan', desc: 'Wajib Catatan' },
                      { id: 'number_input', label: '🔢 Angka', desc: 'Nilai Target' },
                      { id: 'select_option', label: '📋 Opsi', desc: 'Dropdown' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setNewSubtaskType(t.id as SubtaskType)}
                        className={`p-2 rounded-xl text-left border transition-all ${
                          newSubtaskType === t.id
                            ? t.id === 'checkbox_note'
                              ? 'bg-indigo-50 border-indigo-600 text-indigo-950 ring-1 ring-indigo-600'
                              : 'bg-teal-50 border-teal-600 text-teal-950 ring-1 ring-teal-600'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-[11px] font-bold">{t.label}</div>
                        <div className="text-[9px] text-slate-500">{t.desc}</div>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Judul tahapan yang mau ditambahkan..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                    />
                    <select
                      value={newSubtaskPriority}
                      onChange={(e) => setNewSubtaskPriority(e.target.value as Priority)}
                      className="bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-[10px] font-bold text-slate-700"
                    >
                      <option value="High">🔴 Tinggi</option>
                      <option value="Medium">🟡 Sedang</option>
                      <option value="Low">🟢 Rendah</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddNewSubtask}
                      className="px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-2xs transition-all active:scale-95 shrink-0"
                    >
                      + Tambah
                    </button>
                  </div>

                  {newSubtaskType === 'checkbox_note' && (
                    <div className="pt-1 bg-indigo-50/50 p-2 rounded-xl border border-indigo-100 text-xs">
                      <span className="text-[10px] font-bold text-indigo-950 block mb-1">
                        Placeholder Panduan Keterangan:
                      </span>
                      <input
                        type="text"
                        placeholder="Contoh: Nomor Resi / Link Berkas Drive / Catatan Bukti..."
                        value={newSubtaskNotePlaceholder}
                        onChange={(e) => setNewSubtaskNotePlaceholder(e.target.value)}
                        className="w-full px-2.5 py-1 bg-white border border-indigo-200 rounded-lg text-xs"
                      />
                    </div>
                  )}

                  {newSubtaskType === 'number_input' && (
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200/80 text-xs">
                      <span className="text-[11px] font-bold text-slate-700">Target Angka:</span>
                      <input
                        type="number"
                        placeholder="10"
                        value={newSubtaskTarget}
                        onChange={(e) => setNewSubtaskTarget(e.target.value)}
                        className="w-16 px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                      />
                      <span className="text-[11px] font-bold text-slate-700">Satuan:</span>
                      <input
                        type="text"
                        placeholder="Paket / Halaman / Juz"
                        value={newSubtaskUnit}
                        onChange={(e) => setNewSubtaskUnit(e.target.value)}
                        className="flex-1 px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2 bg-slate-50/80 p-3 rounded-2xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-800 block">
                    Tambah Banyak Tahapan Sekaligus (Satu baris per tahapan):
                  </span>
                  <textarea
                    rows={3}
                    placeholder={`1. Riset data & acuan materi\n2. Pembuatan draf presentasi\n3. Verifikasi tim & finalisasi`}
                    value={bulkSubtasksText}
                    onChange={(e) => setBulkSubtasksText(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddBulkSubtasks}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-800 text-white text-xs font-bold hover:bg-teal-900 shadow-2xs"
                    >
                      + Masukkan Semua Tahapan
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>

          <button
            type="submit"
            form="edit-task-form"
            className="px-5 py-2.5 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Simpan Perubahan Target
          </button>
        </div>
      </div>
    </div>
  );
};
