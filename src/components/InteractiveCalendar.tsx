import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Video,
  CheckCircle2,
  Circle as CircleIcon,
  Plus,
  ExternalLink,
  Users,
  Target,
  Sparkles,
  Flame,
  CalendarDays,
  Share2,
  Download,
  Filter,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, MeetingAgenda, TaskFrequency } from '../types';
import {
  parseIndonesianDate,
  createGoogleCalendarUrl,
  createOutlookCalendarUrl,
  generateIcsContent,
  downloadIcsFile,
} from '../utils/calendarSync';

interface InteractiveCalendarProps {
  onOpenTaskDetail?: (task: Task) => void;
  onOpenCreateModal?: (defaultDate?: string, type?: 'task' | 'meeting') => void;
  onOpenCalendarSync?: () => void;
}

const MONTH_NAMES_INDONESIAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const DAY_NAMES_INDONESIAN = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export const InteractiveCalendar: React.FC<InteractiveCalendarProps> = ({
  onOpenTaskDetail,
  onOpenCreateModal,
  onOpenCalendarSync,
}) => {
  const {
    tasks,
    meetings,
    circles,
    activeCircleId,
    currentUser,
    toggleSubtask,
    updateTaskStatus,
    toggleMeetingStatus,
    toggleDailyStreak,
  } = useApp();

  // Calendar view mode: 'month' | 'week' | 'agenda'
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'agenda'>('month');

  // Filter circle
  const [selectedCircleFilter, setSelectedCircleFilter] = useState<string>('all');

  // Calendar date cursor (Defaults to August 2026 for demo app consistency or current year)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(7); // 0-indexed: 7 is Agustus
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 7, 24));

  // Filter tasks & meetings by circle if selected
  const filteredTasks = tasks.filter((t) => {
    if (selectedCircleFilter !== 'all' && t.circleId !== selectedCircleFilter) return false;
    if (activeCircleId !== 'all' && t.circleId !== activeCircleId) return false;
    return true;
  });

  const filteredMeetings = meetings.filter((m) => {
    if (selectedCircleFilter !== 'all' && m.circleId !== selectedCircleFilter) return false;
    if (activeCircleId !== 'all' && m.circleId !== activeCircleId) return false;
    return true;
  });

  // Navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    const today = new Date(2026, 7, 24); // demo anchor or new Date()
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(today);
  };

  // Helper to match date strings
  const isSameCalendarDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Get tasks matching a specific date
  const getTasksForDate = (date: Date): Task[] => {
    return filteredTasks.filter((task) => {
      // Daily tasks show up everyday or on active days
      if (task.frequency === 'daily') return true;

      const parsed = parseIndonesianDate(task.deadline);
      return isSameCalendarDay(parsed.start, date);
    });
  };

  // Get meetings matching a specific date
  const getMeetingsForDate = (date: Date): MeetingAgenda[] => {
    return filteredMeetings.filter((meeting) => {
      const parts = meeting.date.split('-');
      if (parts.length === 3) {
        const mYear = parseInt(parts[0], 10);
        const mMonth = parseInt(parts[1], 10) - 1;
        const mDay = parseInt(parts[2], 10);
        const mDate = new Date(mYear, mMonth, mDay);
        return isSameCalendarDay(mDate, date);
      }
      return false;
    });
  };

  // Grid calculation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  // Create cell array
  const calendarCells: Array<{
    dayNumber: number;
    date: Date;
    isCurrentMonth: boolean;
    tasks: Task[];
    meetings: MeetingAgenda[];
  }> = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - 1, prevMonthDays - i);
    calendarCells.push({
      dayNumber: prevMonthDays - i,
      date: d,
      isCurrentMonth: false,
      tasks: getTasksForDate(d),
      meetings: getMeetingsForDate(d),
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(currentYear, currentMonth, d);
    calendarCells.push({
      dayNumber: d,
      date: dateObj,
      isCurrentMonth: true,
      tasks: getTasksForDate(dateObj),
      meetings: getMeetingsForDate(dateObj),
    });
  }

  // Next month leading days to complete grid (up to 35 or 42)
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(currentYear, currentMonth + 1, i);
    calendarCells.push({
      dayNumber: i,
      date: d,
      isCurrentMonth: false,
      tasks: getTasksForDate(d),
      meetings: getMeetingsForDate(d),
    });
  }

  // Selected date events
  const selectedDateTasks = getTasksForDate(selectedDate);
  const selectedDateMeetings = getMeetingsForDate(selectedDate);

  const formattedSelectedDateString = `${selectedDate.getDate()} ${
    MONTH_NAMES_INDONESIAN[selectedDate.getMonth()]
  } ${selectedDate.getFullYear()}`;

  // Quick ICS export for all current events
  const handleExportMonthIcs = () => {
    const calendarEvents = [
      ...filteredTasks.map((t) => {
        const parsed = parseIndonesianDate(t.deadline);
        return {
          id: t.id,
          title: `[Tugas] ${t.title}`,
          description: `${t.description}\nPrioritas: ${t.priority}`,
          start: parsed.start,
          end: parsed.end,
          circleName: t.circleName,
        };
      }),
      ...filteredMeetings.map((m) => {
        const parsed = parseIndonesianDate(m.date);
        return {
          id: m.id,
          title: `[Meet] ${m.title}`,
          description: `Agenda: ${m.type}\nLink: ${m.meetUrl}`,
          start: parsed.start,
          end: parsed.end,
          circleName: m.circleName,
        };
      }),
    ];
    const icsString = generateIcsContent(calendarEvents);
    downloadIcsFile(`lingkar-jadwal-${MONTH_NAMES_INDONESIAN[currentMonth].toLowerCase()}`, icsString);
  };

  return (
    <div className="space-y-4">
      {/* Calendar Top Control Header */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Month Navigation & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold shadow-2xs">
            <CalendarIcon className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 font-display">
                {MONTH_NAMES_INDONESIAN[currentMonth]} {currentYear}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 text-[11px] font-bold">
                {filteredTasks.length + filteredMeetings.length} Agenda
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Sinkronisasi target tim, jadwal pertemuan, dan tugas harian bersama.
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Month Switchers */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-white text-slate-700 hover:text-slate-900 transition-all"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleJumpToToday}
              className="px-3 py-1 text-xs font-bold text-slate-800 hover:bg-white rounded-xl transition-all"
            >
              Hari Ini
            </button>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-white text-slate-700 hover:text-slate-900 transition-all"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View Modes */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'month'
                  ? 'bg-white text-teal-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kalender Grid
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'agenda'
                  ? 'bg-white text-teal-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daftar Timeline
            </button>
          </div>

          {/* Sync Button */}
          {onOpenCalendarSync && (
            <button
              onClick={onOpenCalendarSync}
              className="px-3.5 py-2 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-teal-700" />
              <span className="hidden sm:inline">Sinkronkan</span>
            </button>
          )}

          {/* Export .ICS */}
          <button
            onClick={handleExportMonthIcs}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            title="Download file .ICS untuk semua kalender"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Interactive Month Grid (7 cols) */}
          <div className="lg:col-span-8 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col">
            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
              {DAY_NAMES_INDONESIAN.map((day, idx) => (
                <div
                  key={day}
                  className={`text-xs font-bold py-1.5 rounded-lg ${
                    idx === 0 || idx === 6 ? 'text-rose-500' : 'text-slate-500'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Day Cells Grid */}
            <div className="grid grid-cols-7 gap-1.5 flex-1">
              {calendarCells.map((cell, idx) => {
                const isSelected = isSameCalendarDay(cell.date, selectedDate);
                const isToday = isSameCalendarDay(cell.date, new Date(2026, 7, 24));
                const totalItems = cell.tasks.length + cell.meetings.length;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDate(cell.date)}
                    className={`min-h-[72px] sm:min-h-[88px] p-1.5 rounded-2xl border text-left flex flex-col justify-between transition-all relative group ${
                      isSelected
                        ? 'bg-teal-50/90 border-teal-600 ring-2 ring-teal-600 shadow-xs'
                        : cell.isCurrentMonth
                        ? 'bg-white hover:bg-slate-50 border-slate-100'
                        : 'bg-slate-50/60 hover:bg-slate-100/80 border-transparent opacity-40'
                    }`}
                  >
                    {/* Top Row: Date Number & Badges */}
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isToday
                            ? 'bg-teal-800 text-white'
                            : isSelected
                            ? 'bg-teal-200 text-teal-950'
                            : cell.isCurrentMonth
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>

                      {totalItems > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {totalItems}
                        </span>
                      )}
                    </div>

                    {/* Event Dots / Previews */}
                    <div className="w-full space-y-1 mt-1">
                      {/* Meetings snippet */}
                      {cell.meetings.slice(0, 1).map((m) => (
                        <div
                          key={m.id}
                          className="px-1.5 py-0.5 rounded-md bg-indigo-100/90 text-indigo-950 text-[9px] font-bold truncate flex items-center gap-1"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0" />
                          <span className="truncate">{m.title}</span>
                        </div>
                      ))}

                      {/* Tasks snippet */}
                      {cell.tasks.slice(0, cell.meetings.length > 0 ? 1 : 2).map((t) => (
                        <div
                          key={t.id}
                          className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold truncate flex items-center gap-1 ${
                            t.status === 'done'
                              ? 'bg-emerald-100 text-emerald-950 line-through opacity-70'
                              : t.frequency === 'daily'
                              ? 'bg-orange-100 text-orange-950'
                              : 'bg-teal-100/80 text-teal-950'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              t.status === 'done'
                                ? 'bg-emerald-600'
                                : t.frequency === 'daily'
                                ? 'bg-orange-600'
                                : 'bg-teal-600'
                            }`}
                          />
                          <span className="truncate">{t.title}</span>
                        </div>
                      ))}

                      {totalItems > 2 && (
                        <span className="text-[9px] text-slate-400 font-bold block pl-1">
                          +{totalItems - 2} lainnya
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                  Target / Milestone
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  Rutin Harian 🔥
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  Pertemuan / Meet
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  Tuntas Selesai
                </span>
              </div>

              <span className="text-[11px] text-slate-400">
                Klik tanggal untuk melihat & checklist agenda harian
              </span>
            </div>
          </div>

          {/* Right Column: Selected Date Interactive Agenda Panel (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            {/* Header of Selected Date */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                    JADWAL TERPILIH
                  </span>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    {formattedSelectedDateString}
                  </h3>
                </div>

                {onOpenCreateModal && (
                  <button
                    onClick={() => onOpenCreateModal(formattedSelectedDateString, 'task')}
                    className="px-3 py-1.5 rounded-xl bg-teal-800 text-white font-bold text-xs hover:bg-teal-900 flex items-center gap-1 shadow-2xs transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah
                  </button>
                )}
              </div>

              {/* Quick Summary counter */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block">TARGET & TUGAS</span>
                  <span className="text-sm font-bold text-slate-900">
                    {selectedDateTasks.length} Item
                  </span>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block">MEETINGS</span>
                  <span className="text-sm font-bold text-slate-900">
                    {selectedDateMeetings.length} Sesi
                  </span>
                </div>
              </div>

              {/* List of Meetings for Selected Date */}
              {selectedDateMeetings.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-indigo-700" />
                    Agenda Pertemuan Tim ({selectedDateMeetings.length})
                  </span>

                  {selectedDateMeetings.map((meet) => (
                    <div
                      key={meet.id}
                      className="p-3 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-200/80 text-indigo-900">
                            {meet.type}
                          </span>
                          <h4 className="text-xs font-bold text-indigo-950 mt-1">
                            {meet.title}
                          </h4>
                          <p className="text-[11px] text-indigo-800 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-indigo-600" />
                            {meet.timeRange}
                          </p>
                        </div>

                        <button
                          onClick={() => toggleMeetingStatus(meet.id)}
                          className={`p-1.5 rounded-xl border transition-colors ${
                            meet.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-white text-slate-400 hover:text-indigo-600 border-slate-200'
                          }`}
                          title={meet.status === 'completed' ? 'Selesai' : 'Tandai Selesai'}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {meet.description && (
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {meet.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-indigo-200/60">
                        <div className="flex -space-x-1.5">
                          {meet.attendees.map((att) => (
                            <img
                              key={att.id}
                              src={att.avatar}
                              alt={att.name}
                              className="w-5 h-5 rounded-full border border-white object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ))}
                        </div>

                        <a
                          href={meet.meetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-indigo-900 text-white text-[10px] font-bold flex items-center gap-1 hover:bg-indigo-950 transition-colors"
                        >
                          <Video className="w-3 h-3 text-indigo-300" />
                          Buka Google Meet
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* List of Tasks for Selected Date */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-teal-700" />
                  Target & Checklist Hari Ini ({selectedDateTasks.length})
                </span>

                {selectedDateTasks.length === 0 ? (
                  <div className="text-center py-6 px-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                    <p className="text-xs text-slate-500">
                      Tidak ada target tenggat pada tanggal ini.
                    </p>
                    {onOpenCreateModal && (
                      <button
                        onClick={() => onOpenCreateModal(formattedSelectedDateString, 'task')}
                        className="text-xs font-bold text-teal-800 hover:underline"
                      >
                        + Buat Target pada Tanggal Ini
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {selectedDateTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-3 rounded-2xl border transition-all ${
                          task.status === 'done'
                            ? 'bg-slate-50 border-slate-200 opacity-80'
                            : task.colorTheme === 'peach'
                            ? 'bg-[#fff7ed] border-[#fed7aa]'
                            : task.colorTheme === 'lavender'
                            ? 'bg-[#f5f3ff] border-[#ddd6fe]'
                            : task.colorTheme === 'sky'
                            ? 'bg-[#f0f9ff] border-[#bae6fd]'
                            : 'bg-[#f0fdf4] border-[#bbf7d0]'
                        }`}
                      >
                        {/* Task Card Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-slate-800 border border-slate-200">
                                {task.circleName.split(' ')[0]}
                              </span>
                              {task.frequency === 'daily' && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-100 text-orange-800 flex items-center gap-0.5">
                                  <Flame className="w-2.5 h-2.5" /> {task.streakDays || 1} Hari
                                </span>
                              )}
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                  task.priority === 'High'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {task.priority}
                              </span>
                            </div>

                            <h4
                              onClick={() => onOpenTaskDetail?.(task)}
                              className={`text-xs font-bold text-slate-900 mt-1 cursor-pointer hover:text-teal-800 ${
                                task.status === 'done' ? 'line-through text-slate-500' : ''
                              }`}
                            >
                              {task.title}
                            </h4>
                          </div>

                          <button
                            onClick={() =>
                              updateTaskStatus(task.id, task.status === 'done' ? 'ongoing' : 'done')
                            }
                            className="p-1 rounded-lg text-slate-400 hover:text-emerald-700 transition-colors"
                          >
                            {task.status === 'done' ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <CircleIcon className="w-5 h-5 text-slate-300 hover:text-teal-600" />
                            )}
                          </button>
                        </div>

                        {/* Subtasks inline preview */}
                        {task.subtasks.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-black/5 space-y-1.5">
                            {task.subtasks.map((st) => (
                              <div
                                key={st.id}
                                onClick={() => toggleSubtask(task.id, st.id)}
                                className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer group hover:text-teal-900"
                              >
                                <div
                                  className={`w-3.5 h-3.5 rounded-md flex items-center justify-center border transition-colors ${
                                    st.completed
                                      ? 'bg-teal-800 border-teal-800 text-white'
                                      : 'border-slate-300 bg-white group-hover:border-teal-600'
                                  }`}
                                >
                                  {st.completed && <Check className="w-2.5 h-2.5" />}
                                </div>
                                <span
                                  className={`text-[11px] truncate flex-1 ${
                                    st.completed ? 'line-through text-slate-400' : 'font-medium'
                                  }`}
                                >
                                  {st.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Progress Bar */}
                        <div className="mt-2.5 flex items-center justify-between text-[10px] font-bold text-slate-500">
                          <span>Progres: {task.progress}%</span>
                          <button
                            onClick={() => onOpenTaskDetail?.(task)}
                            className="text-teal-800 hover:underline"
                          >
                            Buka Detail →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agenda Timeline List View */}
      {viewMode === 'agenda' && (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Timeline Agenda & Target Lengkap
              </h3>
              <p className="text-xs text-slate-500">
                Daftar terurut seluruh target, tenggat modul, dan jadwal pertemuan tim.
              </p>
            </div>

            {onOpenCreateModal && (
              <button
                onClick={() => onOpenCreateModal()}
                className="px-3.5 py-2 rounded-2xl bg-teal-800 text-white font-bold text-xs hover:bg-teal-900 flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Tambah Baru
              </button>
            )}
          </div>

          <div className="space-y-3">
            {[...filteredTasks, ...filteredMeetings].length === 0 ? (
              <p className="text-center py-10 text-xs text-slate-400">Belum ada agenda atau tugas yang terdaftar.</p>
            ) : (
              [...filteredTasks].map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      onClick={() =>
                        updateTaskStatus(task.id, task.status === 'done' ? 'ongoing' : 'done')
                      }
                      className="mt-0.5 shrink-0"
                    >
                      {task.status === 'done' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <CircleIcon className="w-5 h-5 text-slate-300 hover:text-teal-600 shrink-0" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 shrink-0">
                          {task.circleName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold inline-flex items-center gap-1 shrink-0">
                          <CalendarIcon className="w-3 h-3 text-slate-400 shrink-0" /> {task.deadline}
                        </span>
                        {task.frequency === 'daily' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-100 text-orange-800 inline-flex items-center gap-0.5 shrink-0">
                            <Flame className="w-2.5 h-2.5 shrink-0" /> Rutin Harian
                          </span>
                        )}
                      </div>

                      <h4
                        onClick={() => onOpenTaskDetail?.(task)}
                        className={`text-sm font-bold text-slate-900 mt-1 cursor-pointer hover:text-teal-800 break-words leading-snug ${
                          task.status === 'done' ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-slate-500 mt-1 break-words leading-relaxed">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="text-xs font-bold text-slate-800 block">
                        {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} Selesai
                      </span>
                      <span className="text-[10px] text-teal-700 font-bold">+{task.pointsReward} Pts</span>
                    </div>

                    <button
                      onClick={() => onOpenTaskDetail?.(task)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 shadow-2xs shrink-0"
                    >
                      Buka
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
