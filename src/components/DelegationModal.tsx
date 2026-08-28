import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  UserCheck, 
  Search, 
  ShieldCheck, 
  Check, 
  Sparkles,
  Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, CircleMember, TaskAssignee } from '../types';

interface DelegationModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

export const DelegationModal: React.FC<DelegationModalProps> = ({
  isOpen,
  onClose,
  task,
}) => {
  const { circles, currentUser, assignTaskToMember, unassignTaskMember, claimTask } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Find the circle this task belongs to
  const circle = circles.find((c) => c.id === task.circleId) || circles[0];
  const members = circle ? circle.members : [];

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAssigned = (memberId: string) => {
    return task.assignees.some((a) => a.id === memberId);
  };

  const isCurrentUserAssigned = isAssigned(currentUser.id);

  const handleToggleMember = (member: CircleMember) => {
    if (isAssigned(member.id)) {
      if (task.assignees.length <= 1) {
        // Warning or keep at least one
        unassignTaskMember(task.id, member.id);
      } else {
        unassignTaskMember(task.id, member.id);
      }
    } else {
      const assignee: TaskAssignee = {
        id: member.id,
        name: member.name,
        avatar: member.avatar,
      };
      assignTaskToMember(task.id, assignee);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-850 via-teal-800 to-teal-900 text-white p-4.5 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-teal-200 shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Delegasi & Penanggung Jawab</h3>
              <p className="text-xs text-teal-200 truncate max-w-[240px] sm:max-w-xs">{task.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Claim Bar for Current User */}
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-teal-600 shrink-0"
            />
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-800 block truncate">
                {currentUser.name} (Anda)
              </span>
              <span className="text-[10px] text-slate-500">
                {isCurrentUserAssigned ? '✓ Anda sudah terdaftar sebagai PIC' : 'Siap mengambil peran dalam tugas ini?'}
              </span>
            </div>
          </div>

          {!isCurrentUserAssigned ? (
            <button
              onClick={() => {
                claimTask(task.id);
              }}
              className="px-3 py-1.5 rounded-xl bg-teal-850 hover:bg-teal-950 text-white text-xs font-bold shrink-0 shadow-2xs inline-flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              Klaim PIC
            </button>
          ) : (
            <span className="text-[11px] font-bold text-teal-800 px-2.5 py-1 rounded-xl bg-teal-100 shrink-0">
              PIC Aktif
            </span>
          )}
        </div>

        {/* Member Search & List */}
        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-slate-700">Anggota {circle?.name || 'Grup'}:</span>
            <span>{task.assignees.length} PIC Terpilih</span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama anggota atau peran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-1.5 pt-1">
            {filteredMembers.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Tidak ada anggota yang cocok dengan pencarian.</p>
            ) : (
              filteredMembers.map((member) => {
                const assigned = isAssigned(member.id);
                return (
                  <div
                    key={member.id}
                    onClick={() => handleToggleMember(member)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      assigned
                        ? 'bg-teal-50/70 border-teal-300 shadow-2xs'
                        : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        {assigned && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-teal-800 text-white flex items-center justify-center ring-2 ring-white">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {member.name}
                          </span>
                          {member.id === currentUser.id && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-teal-100 text-teal-800 shrink-0">
                              Anda
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                          <span className="flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3 text-slate-400" />
                            {member.role}
                          </span>
                          <span>• {member.contributionPoints || 0} Pts</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleMember(member);
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        assigned
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          : 'bg-slate-100 hover:bg-teal-800 hover:text-white text-slate-700'
                      }`}
                    >
                      {assigned ? 'Lepas PIC' : '+ Delegasikan'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center -space-x-1.5">
            {task.assignees.map((a) => (
              <img
                key={a.id}
                src={a.avatar}
                alt={a.name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover ring-2 ring-white"
              />
            ))}
            <span className="pl-3 text-xs font-bold text-slate-700">
              {task.assignees.length} PIC ditugaskan
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-teal-850 hover:bg-teal-950 text-white text-xs font-bold shadow-xs transition-all"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
