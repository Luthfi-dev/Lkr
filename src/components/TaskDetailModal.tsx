import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Users, 
  Flag, 
  CheckCircle2, 
  CheckCircle, 
  Plus, 
  MessageSquare, 
  Send, 
  Clock, 
  MoreVertical, 
  Trash2,
  Sparkles,
  CalendarSync,
  Layers,
  Flame,
  UserCheck,
  UserPlus,
  Check,
  Target,
  Edit3
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, Priority, SubtaskType } from '../types';
import { CalendarSyncModal } from './CalendarSyncModal';
import { DelegationModal } from './DelegationModal';
import { SubtaskItem } from './SubtaskItem';
import { ConfirmationModal } from './ConfirmationModal';
import { EditTaskModal } from './EditTaskModal';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
  const {
    tasks,
    circles,
    currentUser,
    toggleSubtask,
    addSubtaskToTask,
    claimSubtask,
    updateTaskStatus,
    toggleDailyStreak,
    deleteTask,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'goals' | 'chat'>('goals');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isDelegationModalOpen, setIsDelegationModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Keep live sync with task state in context
  const currentTask = task ? tasks.find((t) => t.id === task.id) || task : null;

  // Calculate permissions
  const circle = currentTask ? circles.find(c => c.id === currentTask.circleId) : null;
  const myMembership = circle?.members.find(m => m.id === currentUser.id);
  const isAdmin = currentUser.systemRole === 'superadmin' || currentUser.systemRole === 'admin' || myMembership?.role === 'Ketua' || myMembership?.role === 'Kreator';

  // New subtask state in modal
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskPriority, setNewSubtaskPriority] = useState<Priority>('Medium');
  const [newSubtaskType, setNewSubtaskType] = useState<SubtaskType>('checkbox');
  const [newSubtaskNotePlaceholder, setNewSubtaskNotePlaceholder] = useState('');
  const [newSubtaskTarget, setNewSubtaskTarget] = useState('10');
  const [newSubtaskUnit, setNewSubtaskUnit] = useState('Unit');

  const [comments, setComments] = useState([
    { id: '1', name: 'Agnes Nielsen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', text: 'Template dan data riset sudah disiapkan ya rekan-rekan!', time: '10:30 WIB' },
    { id: '2', name: 'Budi Pratama', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', text: 'Siap, saya bantu selesaikan bagian verifikasi.', time: '11:15 WIB' },
  ]);
  const [chatInput, setChatInput] = useState('');

  if (!task) return null;

  const handleAddChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: currentUser.name,
        avatar: currentUser.avatar,
        text: chatInput.trim(),
        time: 'Baru saja',
      },
    ]);
    setChatInput('');
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    let targetVal: number | undefined = undefined;
    let unitVal: string | undefined = undefined;
    let optionsVal: string[] | undefined = undefined;

    if (newSubtaskType === 'number_input') {
      targetVal = parseFloat(newSubtaskTarget) || 10;
      unitVal = newSubtaskUnit.trim() || 'Unit';
    } else if (newSubtaskType === 'select_option') {
      optionsVal = ['Belum Dimulai', 'Sedang Draf', 'Tahap Review', 'Tuntas Selesai'];
    }

    addSubtaskToTask(
      task.id,
      {
        title: newSubtaskTitle.trim(),
        priority: newSubtaskPriority,
        type: newSubtaskType,
        notePlaceholder: newSubtaskType === 'checkbox_note' ? (newSubtaskNotePlaceholder.trim() || undefined) : undefined,
        targetValue: targetVal,
        unit: unitVal,
        options: optionsVal,
      }
    );

    setNewSubtaskTitle('');
    setNewSubtaskNotePlaceholder('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#f8fafc] rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 flex flex-col">
        {/* Header with aesthetic background */}
        <div className="bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 text-white p-4 sm:p-5 rounded-t-3xl relative flex-shrink-0">
          {/* Top row: Badges + Action Buttons (No absolute collision) */}
          <div className="flex items-start justify-between gap-2.5 mb-3">
            <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
              <span className="px-2.5 py-1 rounded-full bg-white/20 text-teal-100 text-xs font-bold border border-white/20 truncate max-w-[200px] sm:max-w-xs">
                {currentTask.circleName}
              </span>
              {currentTask.isGroupGoal && (
                <span className="px-2.5 py-1 rounded-full bg-teal-500/30 text-teal-200 text-xs font-bold flex items-center gap-1 whitespace-nowrap">
                  <Users className="w-3 h-3 shrink-0" /> Target Bersama
                </span>
              )}
              {currentTask.frequency === 'daily' && (
                <span className="px-2.5 py-1 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center gap-1 whitespace-nowrap shadow-2xs">
                  <Flame className="w-3 h-3 shrink-0" /> Streak {currentTask.streakDays || 1} Hari
                </span>
              )}
            </div>

            {/* Top Right Quick Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center shadow-xs transition-transform active:scale-95"
                  title="Edit & Tambah Rincian Tugas"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center shadow-xs transition-transform active:scale-95"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Task Title */}
          <h2 className="text-lg sm:text-xl font-display font-extrabold text-white tracking-tight leading-snug break-words">
            {currentTask.title}
          </h2>

          {/* Meta Bar: PIC info & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 mt-3 pt-3 border-t border-white/15 text-xs text-teal-200">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className="text-teal-300 font-medium">PIC:</span>
              <div className="flex -space-x-1.5 shrink-0">
                {currentTask.assignees.map((assignee) => (
                  <img
                    key={assignee.id}
                    src={assignee.avatar}
                    alt={assignee.name}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-white"
                  />
                ))}
              </div>
              <span className="font-bold text-white truncate max-w-[120px] sm:max-w-[170px]">
                {currentTask.assignees.map((a) => a.name.split(' ')[0]).join(', ')}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shrink-0">
                +{currentTask.pointsReward} Pts
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isAdmin && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-2.5 py-1 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] inline-flex items-center gap-1 transition-all active:scale-95 shadow-2xs"
                    title="Edit rincian tugas & checklist"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Tugas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDelegationModalOpen(true)}
                    className="px-2.5 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-[11px] inline-flex items-center gap-1 transition-all active:scale-95 border border-white/20"
                    title="Atur penanggung jawab & delegasi tugas"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Delegasi PIC</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 space-y-4 flex-1">
          {/* Split Info Cards: Deadline & Category & Streak */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Deadline Card */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Tenggat Waktu</span>
                <button
                  onClick={() => setIsSyncModalOpen(true)}
                  title="Sinkronkan ke Google / Outlook Calendar"
                  className="text-[10px] text-teal-800 font-bold hover:underline flex items-center gap-0.5"
                >
                  <CalendarSync className="w-3 h-3" />
                  <span>Sync</span>
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-7 h-7 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold text-slate-900 break-words">
                  {currentTask.deadline}
                </div>
              </div>
            </div>

            {/* Category Card */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Kategori & Prioritas</span>
              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-900">{currentTask.category}</span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                    currentTask.priority === 'High'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {currentTask.priority}
                </span>
              </div>
            </div>

            {/* Streak / Frequency Card */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Siklus Pengerjaan</span>
              <div className="mt-1.5 flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-slate-900">
                  {currentTask.frequency === 'daily'
                    ? '🔥 Rutin Harian'
                    : currentTask.frequency === 'weekly'
                    ? '🔄 Mingguan'
                    : '🎯 Target Sekali'}
                </span>
                {currentTask.frequency === 'daily' && (
                  <button
                    onClick={() => toggleDailyStreak(currentTask.id)}
                    className="px-2 py-0.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold shrink-0"
                  >
                    +1 Hari
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Deskripsi Sasaran
            </span>
            <p className="text-xs text-slate-700 leading-relaxed break-words whitespace-pre-wrap">
              {currentTask.description}
            </p>
          </div>

          {/* Goals / Chat Switcher Pills */}
          <div className="grid grid-cols-2 gap-1 bg-slate-200/80 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('goals')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'goals'
                  ? 'bg-white text-teal-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tahapan Subtask ({currentTask.subtasks.filter((s) => s.completed).length}/{currentTask.subtasks.length})
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'chat'
                  ? 'bg-white text-teal-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Diskusi & Catatan ({comments.length})
            </button>
          </div>

          {/* Goals Subtasks List */}
          {activeTab === 'goals' && (
            <div className="space-y-3">
              {/* List of subtasks with dynamic SubtaskItem */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
                {currentTask.subtasks.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">Belum ada tahapan subtask.</p>
                ) : (
                  currentTask.subtasks.map((st) => (
                    <SubtaskItem
                      key={st.id}
                      task={currentTask}
                      subtask={st}
                    />
                  ))
                )}
              </div>

              {/* Add New Subtask Form */}
              {isAdmin && (
                <form onSubmit={handleAddSubtask} className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <span className="text-[11px] font-bold text-slate-700">
                      + Tambah Tahapan Subtask
                    </span>
                    
                    {/* Subtask Type Selector */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {[
                        { id: 'checkbox', label: '☑️ Centang' },
                        { id: 'checkbox_note', label: '📝 Wajib Keterangan' },
                        { id: 'number_input', label: '🔢 Angka' },
                        { id: 'select_option', label: '📋 Opsi' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setNewSubtaskType(t.id as SubtaskType)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                            newSubtaskType === t.id
                              ? t.id === 'checkbox_note'
                                ? 'bg-indigo-700 text-white border-indigo-700'
                                : 'bg-teal-800 text-white border-teal-800'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Judul tahapan subtask baru..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                    />
                    <div className="flex items-center gap-1.5">
                      <select
                        value={newSubtaskPriority}
                        onChange={(e) => setNewSubtaskPriority(e.target.value as Priority)}
                        className="bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-[11px] font-bold text-slate-700 flex-1 sm:flex-none"
                      >
                        <option value="High">🔴 Tinggi</option>
                        <option value="Medium">🟡 Sedang</option>
                        <option value="Low">🟢 Rendah</option>
                      </select>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-xl bg-teal-800 text-white text-xs font-bold hover:bg-teal-900 shadow-2xs transition-all active:scale-95 shrink-0"
                      >
                        + Tambah
                      </button>
                    </div>
                  </div>

                  {newSubtaskType === 'checkbox_note' && (
                    <div className="pt-1 border-t border-indigo-100 space-y-1 bg-indigo-50/50 p-2 rounded-xl text-xs">
                      <label className="text-[10px] font-bold text-indigo-950 block">
                        Placeholder Panduan Keterangan (Ditentukan Admin):
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Nomor Resi / Link Berkas Drive / Catatan Bukti..."
                        value={newSubtaskNotePlaceholder}
                        onChange={(e) => setNewSubtaskNotePlaceholder(e.target.value)}
                        className="w-full px-2.5 py-1 bg-white border border-indigo-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 placeholder:text-slate-400"
                      />
                    </div>
                  )}

                  {newSubtaskType === 'number_input' && (
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200/80 text-xs flex-wrap">
                      <span className="text-[11px] font-bold text-amber-900">Target Angka:</span>
                      <input
                        type="number"
                        placeholder="10"
                        value={newSubtaskTarget}
                        onChange={(e) => setNewSubtaskTarget(e.target.value)}
                        className="w-16 px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                      />
                      <span className="text-[11px] font-bold text-slate-600">Satuan:</span>
                      <input
                        type="text"
                        placeholder="Paket / Lembar / Rp"
                        value={newSubtaskUnit}
                        onChange={(e) => setNewSubtaskUnit(e.target.value)}
                        className="flex-1 min-w-[100px] px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  )}
                </form>
              )}
            </div>
          )}

          {/* Chat / Discussion Tab */}
          {activeTab === 'chat' && (
            <div className="space-y-3">
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5 bg-white p-3 rounded-2xl border border-slate-200 text-xs">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{c.name}</span>
                        <span className="text-[9px] text-slate-400">{c.time}</span>
                      </div>
                      <p className="text-slate-700 text-xs leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleAddChat} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Tulis pesan catatan ke tim..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
                <button
                  type="submit"
                  className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center hover:bg-teal-900 shadow-xs flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* Delete, Edit & Complete Action Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              {isAdmin && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="text-xs text-teal-800 hover:text-teal-950 font-bold flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Target</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 transition-colors px-2 py-1 rounded-xl hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => {
                updateTaskStatus(currentTask.id, currentTask.status === 'done' ? 'ongoing' : 'done');
                onClose();
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-bold text-white shadow-sm transition-all active:scale-95 ${
                currentTask.status === 'done'
                  ? 'bg-slate-700 hover:bg-slate-800'
                  : 'bg-teal-800 hover:bg-teal-900'
              }`}
            >
              {currentTask.status === 'done' ? 'Tandai Belum Selesai' : `✓ Selesaikan Target (+${currentTask.pointsReward} Pts)`}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={currentTask}
      />

      {/* Confirmation Modal for Task Deletion */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          deleteTask(currentTask.id);
          onClose();
        }}
        title="Hapus Target Tugas?"
        message="Target tugas beserta seluruh checklist tahapan di dalamnya akan dihapus secara permanen dari sistem."
        itemName={currentTask.title}
        confirmText="Ya, Hapus Target"
        cancelText="Batal"
        type="danger"
      />

      {/* Calendar Sync Modal */}
      <CalendarSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        tasks={tasks}
        selectedTask={currentTask}
      />

      {/* Delegation Modal */}
      <DelegationModal
        isOpen={isDelegationModalOpen}
        onClose={() => setIsDelegationModalOpen(false)}
        task={currentTask}
      />
    </div>
  );
};
