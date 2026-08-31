import React, { useState } from 'react';
import { 
  Check, 
  CheckCircle2, 
  Circle, 
  FileText, 
  Plus, 
  Minus, 
  ChevronDown, 
  User, 
  UserPlus, 
  Sparkles,
  Edit3,
  MessageSquareQuote,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Subtask, Task, CircleMember } from '../types';

interface SubtaskItemProps {
  task: Task;
  subtask: Subtask;
  onOpenTaskDetail?: (task: Task) => void;
  compact?: boolean;
}

export const SubtaskItem: React.FC<SubtaskItemProps> = ({
  task,
  subtask,
  compact = false,
}) => {
  const { 
    currentUser, 
    circles, 
    toggleSubtask, 
    updateSubtaskValue, 
    updateSubtaskOption, 
    updateSubtaskNote,
    delegateSubtask, 
    claimSubtask 
  } = useApp();

  const subtaskType = subtask.type || 'checkbox';
  const userComp = task.userCompletions?.find((c) => c.userId === currentUser.id);
  const isCompleted = task.isDelegated
    ? (userComp?.completedSubtaskIds?.includes(subtask.id) || false)
    : (subtask.completed || (subtaskType === 'number_input' && (Number(subtask.currentValue) || 0) >= (Number(subtask.targetValue) || 1)) || (subtaskType === 'select_option' && (subtask.selectedOption === 'Selesai' || subtask.selectedOption === 'Tuntas' || subtask.selectedOption === 'Tuntas Selesai')));

  const currentUserNote = (task.isDelegated ? userComp?.subtaskNotes?.[subtask.id] : subtask.completionNote) || '';

  const [isNoteInputOpen, setIsNoteInputOpen] = useState(false);
  const [noteText, setNoteText] = useState(currentUserNote);
  const [noteError, setNoteError] = useState('');
  const [isAssigneePickerOpen, setIsAssigneePickerOpen] = useState(false);
  const [isOptionPickerOpen, setIsOptionPickerOpen] = useState(false);

  // Sync noteText when component re-renders with new data
  React.useEffect(() => {
    if (!isNoteInputOpen) {
      setNoteText(currentUserNote);
    }
  }, [currentUserNote, isNoteInputOpen]);

  // Circle members for subtask delegation
  const circle = circles.find((c) => c.id === task.circleId) || circles[0];
  const members: CircleMember[] = circle ? circle.members : [];

  // Handle Note Submit
  const handleSaveNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = noteText.trim();
    if (subtaskType === 'checkbox_note' && !trimmed) {
      setNoteError('Keterangan wajib diisi sebelum subtask ini dapat dicentang selesai!');
      return;
    }
    setNoteError('');
    updateSubtaskNote(task.id, subtask.id, trimmed);
    setIsNoteInputOpen(false);
  };

  // Handle Checkbox Click
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (subtaskType === 'checkbox_note') {
      if (!isCompleted) {
        // Strict: Cannot complete without note! Open input form directly
        setNoteText(currentUserNote);
        setNoteError('');
        setIsNoteInputOpen(true);
        return;
      } else {
        // If already completed and user clicks checkbox, uncheck it
        toggleSubtask(task.id, subtask.id);
        return;
      }
    }
    toggleSubtask(task.id, subtask.id);
  };

  // Number input helpers
  const targetVal = Number(subtask.targetValue) || 1;
  const currentVal = Number(subtask.currentValue) || 0;
  const numProgressPct = Math.min(100, Math.round((currentVal / targetVal) * 100));

  const handleStepValue = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    const next = Math.max(0, currentVal + delta);
    updateSubtaskValue(task.id, subtask.id, next);
  };

  const handleDirectValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    updateSubtaskValue(task.id, subtask.id, val);
  };

  // Select Option helpers
  const defaultOptions = ['Belum Dimulai', 'Sedang Dikerjakan', 'Tahap Review', 'Tuntas Selesai'];
  const optionsList = subtask.options && subtask.options.length > 0 ? subtask.options : defaultOptions;
  const activeOption = subtask.selectedOption || (subtask.completed ? 'Tuntas Selesai' : optionsList[0]);

  const handleSelectOption = (e: React.MouseEvent, opt: string) => {
    e.stopPropagation();
    updateSubtaskOption(task.id, subtask.id, opt);
    setIsOptionPickerOpen(false);
  };

  // Note Display if exists
  const displayNote = currentUserNote;
  
  return (
    <div 
      className={`rounded-2xl border transition-all space-y-2 p-2.5 sm:p-3 relative ${
        isCompleted
          ? 'bg-slate-50/80 border-slate-200/70'
          : 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Main Row */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          {/* Checkbox Trigger button */}
          <button
            type="button"
            onClick={handleCheckboxClick}
            className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all shrink-0 mt-0.5 ${
              isCompleted
                ? 'bg-teal-800 text-white shadow-2xs'
                : 'border-2 border-slate-400 hover:border-teal-700 bg-white hover:bg-teal-50'
            }`}
            title={
              subtaskType === 'checkbox_note'
                ? 'Selesaikan dengan catatan bukti'
                : subtaskType === 'number_input'
                ? 'Checklist nilai target'
                : 'Tandai selesai'
            }
          >
            {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3] text-white" />}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span
                onClick={handleCheckboxClick}
                className={`text-xs leading-snug break-words cursor-pointer select-none ${
                  isCompleted
                    ? 'line-through text-slate-400 font-normal'
                    : 'text-slate-800 font-semibold hover:text-teal-900'
                }`}
              >
                {subtask.title}
              </span>

              {/* Subtask Type Pill Indicator */}
              {subtaskType === 'checkbox' && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                  Centang Biasa
                </span>
              )}
              {subtaskType === 'checkbox_note' && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 shrink-0" title={subtask.notePlaceholder ? `Placeholder: ${subtask.notePlaceholder}` : undefined}>
                  Wajib Keterangan
                </span>
              )}
              {subtaskType === 'number_input' && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                  Target Nilai
                </span>
              )}
              {subtaskType === 'select_option' && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-sky-50 text-sky-800 border border-sky-200 shrink-0">
                  Pilihan Status
                </span>
              )}
            </div>

            {/* Hint for mandatory note when not completed */}
            {subtaskType === 'checkbox_note' && !isCompleted && !displayNote && !isNoteInputOpen && (
              <p 
                onClick={handleCheckboxClick}
                className="mt-0.5 text-[10px] text-indigo-700 hover:text-indigo-900 font-medium cursor-pointer flex items-center gap-1"
              >
                <span>📝 Klik untuk isi keterangan wajib & tuntaskan</span>
                {subtask.notePlaceholder && (
                  <span className="text-slate-400 font-normal italic truncate">({subtask.notePlaceholder})</span>
                )}
              </p>
            )}

            {/* Note Display if exists */}
            {displayNote && (
              <div className="mt-2 p-2.5 rounded-xl bg-teal-50/90 border border-teal-200/80 flex items-start justify-between gap-2 text-xs text-teal-950 shadow-2xs">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  <FileText className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block mb-0.5">
                      Catatan / Bukti {task.isDelegated ? '(Anda)' : ''}:
                    </span>
                    <p className="break-words leading-relaxed text-slate-800 font-medium">
                      {displayNote}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNoteText(displayNote);
                    setNoteError('');
                    setIsNoteInputOpen(true);
                  }}
                  className="text-teal-700 hover:text-teal-900 shrink-0 p-1 hover:bg-teal-100/80 rounded-lg transition-colors"
                  title="Ubah Catatan Bukti"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Delegasi & PIC Selector */}
        <div className="relative shrink-0 self-start">
          {subtask.assignedTo ? (
            <button
              type="button"
              onClick={() => setIsAssigneePickerOpen(!isAssigneePickerOpen)}
              className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 inline-flex items-center gap-1 transition-colors"
              title="Klik untuk ubah PIC subtask"
            >
              <User className="w-3 h-3 text-slate-500" />
              <span>{subtask.assignedTo.split(' ')[0]}</span>
              <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => claimSubtask(task.id, subtask.id)}
                className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80 inline-flex items-center gap-1 transition-all active:scale-95"
                title="Klaim subtask ini untuk Anda kerjakan"
              >
                <Sparkles className="w-2.5 h-2.5 text-teal-600" />
                + Klaim
              </button>
              <button
                type="button"
                onClick={() => setIsAssigneePickerOpen(!isAssigneePickerOpen)}
                className="text-[9px] font-bold p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                title="Delegasikan ke anggota lain"
              >
                <UserPlus className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Subtask Assignee Dropdown Picker */}
          {isAssigneePickerOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-40 space-y-1 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Pilih PIC Subtask
              </div>
              <div className="max-h-40 overflow-y-auto space-y-0.5">
                {members.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      delegateSubtask(task.id, subtask.id, m.name);
                      setIsAssigneePickerOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 p-1.5 rounded-xl text-left text-xs transition-colors ${
                      subtask.assignedTo === m.name
                        ? 'bg-teal-100 text-teal-900 font-bold'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <img
                      src={m.avatar}
                      alt={m.name}
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 rounded-full object-cover shrink-0"
                    />
                    <span className="truncate flex-1 text-[11px]">{m.name}</span>
                    {subtask.assignedTo === m.name && <Check className="w-3 h-3 text-teal-800" />}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  delegateSubtask(task.id, subtask.id, '');
                  setIsAssigneePickerOpen(false);
                }}
                className="w-full text-center py-1 text-[10px] text-rose-600 hover:bg-rose-50 rounded-lg font-bold"
              >
                Kosongkan PIC
              </button>
            </div>
          )}
        </div>
      </div>

      {/* INTERACTIVE CONTROLS BASED ON SUBTASK TYPE */}

      {/* 1. Mode Number / Value Input */}
      {subtaskType === 'number_input' && (
        <div className="pt-1.5 mt-1 border-t border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => handleStepValue(e, -1)}
                className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-90 text-slate-700 flex items-center justify-center font-bold text-xs transition-transform"
                title="Kurangi 1"
              >
                <Minus className="w-3 h-3" />
              </button>

              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={currentVal}
                  onChange={handleDirectValueChange}
                  className="w-16 px-1.5 py-0.5 text-center font-bold text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
                <span className="text-[11px] text-slate-500 font-medium">
                  / {targetVal} {subtask.unit || 'Unit'}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => handleStepValue(e, 1)}
                className="w-6 h-6 rounded-lg bg-teal-100 hover:bg-teal-200 active:scale-90 text-teal-800 flex items-center justify-center font-bold text-xs transition-transform"
                title="Tambah 1"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <span className={`text-[11px] font-bold ${numProgressPct >= 100 ? 'text-emerald-600' : 'text-slate-500'}`}>
              {numProgressPct}% {numProgressPct >= 100 ? '✓ Tuntas' : ''}
            </span>
          </div>

          {/* Mini progress bar */}
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                numProgressPct >= 100 ? 'bg-emerald-500' : 'bg-teal-700'
              }`}
              style={{ width: `${numProgressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* 2. Mode Select Option */}
      {subtaskType === 'select_option' && (
        <div className="pt-1.5 mt-1 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Status Progres:</span>
          
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOptionPickerOpen(!isOptionPickerOpen)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border inline-flex items-center gap-1.5 transition-all ${
                isCompleted
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : activeOption === 'Sedang Dikerjakan' || activeOption === 'Proses'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : activeOption === 'Tahap Review' || activeOption === 'Review'
                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <span>{activeOption}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isOptionPickerOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 p-1 z-40 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                {optionsList.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={(e) => handleSelectOption(e, opt)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                      activeOption === opt
                        ? 'bg-teal-100 text-teal-900 font-bold'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{opt}</span>
                    {activeOption === opt && <Check className="w-3 h-3 text-teal-800" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Mode Checkbox Note Input Drawer */}
      {isNoteInputOpen && (
        <form onSubmit={handleSaveNote} className="pt-2 mt-1 border-t border-slate-200/80 space-y-2 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100">
          <div className="flex items-center justify-between text-[11px] font-bold text-indigo-950">
            <span className="flex items-center gap-1">
              <MessageSquareQuote className="w-3.5 h-3.5 text-indigo-700" />
              {subtaskType === 'checkbox_note' ? 'Keterangan Wajib Penyelesaian' : 'Catatan Bukti / Keterangan'}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsNoteInputOpen(false);
                setNoteError('');
              }}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {subtaskType === 'checkbox_note' && (
            <p className="text-[10px] text-indigo-800 font-medium bg-white/80 px-2 py-1 rounded-lg border border-indigo-100 flex items-center gap-1">
              <span>⚠️</span>
              <span>Subtask ini <strong>tidak akan tercentang</strong> sebelum keterangan diisi dan disimpan.</span>
            </p>
          )}

          <div className="space-y-1">
            <input
              type="text"
              placeholder={subtask.notePlaceholder || "Contoh: Nomor Resi / Tautan Link Google Drive / Catatan Bukti..."}
              value={noteText}
              onChange={(e) => {
                setNoteText(e.target.value);
                if (noteError) setNoteError('');
              }}
              autoFocus
              className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-2xs placeholder:text-slate-400"
            />
            {noteError && (
              <p className="text-[11px] font-bold text-rose-600 animate-in fade-in duration-150">
                {noteError}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            {subtask.completionNote ? (
              <button
                type="button"
                onClick={() => {
                  updateSubtaskNote(task.id, subtask.id, '');
                  setNoteText('');
                  setIsNoteInputOpen(false);
                }}
                className="text-[11px] text-rose-600 hover:text-rose-800 font-bold hover:underline"
              >
                Hapus Keterangan
              </button>
            ) : <span />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsNoteInputOpen(false);
                  setNoteError('');
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200/60"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold shadow-2xs transition-all active:scale-95 flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Simpan & Centang Selesai
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
