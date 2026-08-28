import React, { useState, useRef } from 'react';
import {
  Calendar,
  X,
  ExternalLink,
  Download,
  Upload,
  CheckCircle2,
  Bell,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  CalendarCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, MeetingAgenda } from '../types';
import {
  createGoogleCalendarUrl,
  createOutlookCalendarUrl,
  generateIcsContent,
  downloadIcsFile,
  parseIcsFile,
  parseIndonesianDate
} from '../utils/calendarSync';

interface CalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTask?: Task | null;
}

export const CalendarSyncModal: React.FC<CalendarSyncModalProps> = ({
  isOpen,
  onClose,
  selectedTask = null,
}) => {
  const {
    tasks,
    meetings,
    activeCircle,
    createTask,
    addNotification,
    triggerCelebration,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'sync' | 'export' | 'import' | 'settings'>('sync');
  const [syncedTaskId, setSyncedTaskId] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [reminderHMinus1, setReminderHMinus1] = useState(true);
  const [notifyMeetings, setNotifyMeetings] = useState(true);
  const [autoSyncNewTasks, setAutoSyncNewTasks] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Filter tasks to sync (either selectedTask or all active tasks)
  const displayTasks = selectedTask ? [selectedTask] : tasks.filter((t) => t.status !== 'done');

  // Handle Sync Single Task to Google
  const handleSyncToGoogle = (task: Task) => {
    const { start, end } = parseIndonesianDate(task.deadline);
    const url = createGoogleCalendarUrl({
      title: `[Lingkar] ${task.title}`,
      description: `${task.description}\n\nLingkar: ${task.circleName}\nPrioritas: ${task.priority}\nTenggat: ${task.deadline}\nBuka di: https://lingkar.app`,
      start,
      end,
      location: task.circleName,
    });

    window.open(url, '_blank');
    setSyncedTaskId(task.id);
    addNotification({
      title: 'Tersinkron ke Google Calendar',
      message: `Tugas "${task.title}" berhasil disiapkan ke Google Calendar.`,
      type: 'task',
      linkTab: 'tasks',
    });
    setTimeout(() => setSyncedTaskId(null), 3000);
  };

  // Handle Sync Single Task to Outlook
  const handleSyncToOutlook = (task: Task) => {
    const { start, end } = parseIndonesianDate(task.deadline);
    const url = createOutlookCalendarUrl({
      title: `[Lingkar] ${task.title}`,
      description: `${task.description}\n\nLingkar: ${task.circleName}\nPrioritas: ${task.priority}\nTenggat: ${task.deadline}`,
      start,
      end,
      location: task.circleName,
    });

    window.open(url, '_blank');
    setSyncedTaskId(task.id);
    addNotification({
      title: 'Tersinkron ke Outlook Calendar',
      message: `Tugas "${task.title}" berhasil disiapkan ke Outlook Calendar.`,
      type: 'task',
      linkTab: 'tasks',
    });
    setTimeout(() => setSyncedTaskId(null), 3000);
  };

  // Handle Export All Tasks to Universal .ICS
  const handleExportAllToIcs = () => {
    const events = tasks.map((t) => {
      const { start, end } = parseIndonesianDate(t.deadline);
      return {
        id: t.id,
        title: `[Lingkar] ${t.title}`,
        description: `${t.description} (Prioritas: ${t.priority})`,
        start,
        end,
        circleName: t.circleName,
        location: t.circleName,
      };
    });

    // Also include meeting agendas
    meetings.forEach((m) => {
      const { start, end } = parseIndonesianDate(m.date);
      events.push({
        id: m.id,
        title: `[Pertemuan Lingkar] ${m.title} (${m.type})`,
        description: `Agenda: ${m.title}\nWaktu: ${m.timeRange}\nTautan: ${m.meetUrl}`,
        start,
        end,
        circleName: m.circleName,
        location: m.meetUrl || 'Online',
      });
    });

    const icsContent = generateIcsContent(events);
    downloadIcsFile(`lingkar_tasks_schedule_${Date.now()}.ics`, icsContent);

    triggerCelebration();
    addNotification({
      title: 'Jadwal & Tugas Diekspor (.ics)',
      message: `${events.length} jadwal dan agenda berhasil diunduh untuk Google/Outlook/Apple Calendar.`,
      type: 'task',
      linkTab: 'tasks',
    });
  };

  // Handle Two-way ICS Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const parsedEvents = parseIcsFile(text);
      if (parsedEvents.length === 0) {
        setImportStatus('Tidak ada acara yang terdeteksi di berkas kalender ini.');
        return;
      }

      parsedEvents.forEach((ev) => {
        createTask({
          title: ev.title.replace(/^\[Lingkar\]\s*/i, ''),
          description: ev.description || 'Diimpor dari kalender eksternal.',
          deadline: ev.deadline,
          priority: 'Medium',
          category: 'Jadwal Kalender Impor',
          colorTheme: 'sky',
          subtasks: ['Review agenda kalender', 'Tindak lanjut bersama tim'],
        });
      });

      setImportStatus(`Berhasil mengimpor ${parsedEvents.length} tugas & agenda baru ke Lingkar!`);
      triggerCelebration();
      addNotification({
        title: 'Sinkronisasi Impor Kalender Berhasil',
        message: `${parsedEvents.length} acara kalender telah dimasukkan ke daftar tugas Lingkar.`,
        type: 'task',
        linkTab: 'tasks',
      });
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#f8fafc] rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-display">
                Integrasi & Sinkronisasi Kalender
              </h3>
              <p className="text-[11px] text-slate-500">
                Google Calendar, Outlook Calendar, dan Sinkronisasi Dua Arah
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="p-4 pb-0">
          <div className="grid grid-cols-3 gap-1 bg-slate-200/80 p-1 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('sync')}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeTab === 'sync'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5 text-teal-700" />
              Sinkron Tugas
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeTab === 'export'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-indigo-700" />
              Ekspor .ICS
            </button>

            <button
              onClick={() => setActiveTab('import')}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeTab === 'import'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-emerald-700" />
              Impor Kalender
            </button>
          </div>
        </div>

        {/* 1. Tab Sync Direct */}
        {activeTab === 'sync' && (
          <div className="p-4 space-y-3">
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-3 text-xs text-teal-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold">Sinkronisasi Instan Tanpa Repot</div>
                <div className="text-[11px] text-teal-800 leading-relaxed">
                  Pilih layanan kalender untuk menambahkan tugas langsung ke Google Calendar atau Outlook Calendar Anda lengkap dengan pengingat deadline.
                </div>
              </div>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {displayTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs space-y-2 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 text-xs block leading-snug">
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span className="text-teal-700 font-semibold">{task.circleName}</span>
                        <span>• Tenggat: {task.deadline}</span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex-shrink-0">
                      {task.priority}
                    </span>
                  </div>

                  {/* Sync Action Buttons */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleSyncToGoogle(task)}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 text-slate-700 hover:text-teal-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      Google Calendar
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSyncToOutlook(task)}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 text-slate-700 hover:text-sky-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path
                          fill="#0078D4"
                          d="M24 7.25v9.5c0 .69-.56 1.25-1.25 1.25H8.25c-.69 0-1.25-.56-1.25-1.25V7.25c0-.69.56-1.25 1.25-1.25h14.5c.69 0 1.25.56 1.25 1.25z"
                        />
                        <path
                          fill="#28A8EA"
                          d="M14.5 12a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z"
                        />
                      </svg>
                      Outlook Calendar
                    </button>
                  </div>

                  {syncedTaskId === task.id && (
                    <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 py-1 px-2 rounded-lg text-center animate-in fade-in">
                      ✓ Tab Kalender Terbuka & Notifikasi Terpasang!
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Tab Universal .ICS Export */}
        {activeTab === 'export' && (
          <div className="p-4 space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                <Download className="w-4 h-4 text-indigo-600" />
                Ekspor Universal Semua Agenda (.ics)
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Unduh berkas <span className="font-mono font-bold text-slate-800">.ics</span> yang kompatibel dengan:
                <br />• <strong>Google Calendar</strong> (Web & Mobile)
                <br />• <strong>Microsoft Outlook & Office 365</strong>
                <br />• <strong>Apple Calendar</strong> (Mac, iPhone, iPad)
                <br />• <strong>Thunderbird & Mozilla Calendar</strong>
              </p>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-700 border border-slate-100">
                <div className="flex justify-between">
                  <span>Jumlah Tugas Aktif:</span>
                  <span className="font-bold">{tasks.filter((t) => t.status !== 'done').length} tugas</span>
                </div>
                <div className="flex justify-between">
                  <span>Pertemuan & Diskusi Rutin:</span>
                  <span className="font-bold">{meetings.length} jadwal</span>
                </div>
                <div className="flex justify-between text-teal-800 font-semibold pt-1 border-t border-slate-200">
                  <span>Pengingat Alarm:</span>
                  <span>15 Menit Sebelum Waktu</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExportAllToIcs}
                className="w-full py-2.5 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                Unduh Berkas Kalender (.ics) Sekarang
              </button>
            </div>
          </div>
        )}

        {/* 3. Tab Two-Way Import */}
        {activeTab === 'import' && (
          <div className="p-4 space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <Upload className="w-4 h-4 text-emerald-600" />
                Sinkronisasi Dua Arah: Impor Acara ke Lingkar
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Punya agenda dari Google Calendar atau Outlook? Ekspor berkas <span className="font-mono font-bold">.ics</span> dari kalender Anda dan unggah di sini untuk mengubahnya menjadi tugas tim di Lingkar secara otomatis.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".ics,.ical"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-6 border-2 border-dashed border-emerald-300 rounded-2xl bg-emerald-50/50 hover:bg-emerald-50 text-emerald-900 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group"
              >
                <Upload className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-xs">Pilih Berkas .ics Kalender Anda</span>
                <span className="text-[10px] text-slate-500">Mendukung format standar iCalendar RFC 5545</span>
              </button>

              {importStatus && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 text-center animate-in fade-in">
                  {importStatus}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>Privasi Aman & Langsung ke Akun Anda</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-700 font-semibold text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
