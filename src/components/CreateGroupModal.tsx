import React, { useState } from 'react';
import {
  Users,
  Check,
  Plus,
  Shield,
  Wallet,
  CheckSquare,
  Sparkles,
  Calendar,
  Layers,
  X,
  UserPlus
, Search
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CircleCategory, Priority, CircleMember } from '../types';
import { uploadMediaFile } from '../utils/imageOptimizer';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=150&auto=format&fit=crop&q=80',
];

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, createCircleWithDetails, openGroupRoom, allUsers } = useApp();
  const availableUsers = allUsers.length > 0 ? allUsers : [currentUser];

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CircleCategory>('Kelompok Studi');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0]);
  const [uploadedAvatars, setUploadedAvatars] = useState<string[]>([]);
  const [meetingSchedule, setMeetingSchedule] = useState('Sabtu, 19:30 WIB');
  const [initialKasDisplay, setInitialKasDisplay] = useState('0');
  const [tagsInput, setTagsInput] = useState('kolaborasi, riset, produktivitas');

  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Selected Members for step 2 (DEFAULT TO EMPTY / 0 MEMBERS)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [memberRoles, setMemberRoles] = useState<Record<string, CircleMember['role']>>({});

  // Initial Task for step 3
  const [includeInitialTask, setIncludeInitialTask] = useState(true);
  const [initialTaskTitle, setInitialTaskTitle] = useState('Kickoff Meeting & Pembagian Modul Kerja');
  const [initialTaskDeadline, setInitialTaskDeadline] = useState('3 Hari Kedepan');
  const [initialTaskPriority, setInitialTaskPriority] = useState<Priority>('High');
  const [taskAssigneeIds, setTaskAssigneeIds] = useState<string[]>([currentUser.id]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Filter ONLY regular non-admin members for group creation
  const eligibleUsers = React.useMemo(() => {
    return allUsers.filter((u) => {
      if (u.id === currentUser.id) return false;
      const sysRole = String(u.systemRole || '').toLowerCase();
      const userRole = String(u.role || '').toLowerCase();
      const userName = String(u.name || '').toLowerCase();
      const userEmail = String(u.email || '').toLowerCase();
      const userUsername = String(u.username || '').toLowerCase();

      if (sysRole === 'superadmin' || sysRole === 'admin') return false;
      if (userRole.includes('admin') || userRole.includes('superadmin')) return false;
      if (userUsername.includes('admin') || userUsername.includes('superadmin')) return false;
      if (userName.includes('admin') || userEmail.includes('admin')) return false;
      return true;
    });
  }, [allUsers, currentUser.id]);

  const filteredMembers = React.useMemo(() => {
    const q = debouncedSearchQuery.toLowerCase().trim();
    if (!q) {
      // If no query typed, only show members that are already selected
      return eligibleUsers.filter((u) => selectedUserIds.includes(u.id));
    }
    return eligibleUsers.filter((u) => {
      const matchName = u.name.toLowerCase().includes(q);
      const matchUsername = (u.username || '').toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      return matchName || matchUsername || matchEmail;
    });
  }, [debouncedSearchQuery, eligibleUsers, selectedUserIds]);

  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setName('');
      setDescription('');
      setSelectedUserIds([]);
      setMemberRoles({});
      setInitialKasDisplay('0');
      setMemberSearchQuery('');
      setDebouncedSearchQuery('');
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (!memberSearchQuery.trim()) {
      setDebouncedSearchQuery('');
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    // Debounce search so it searches after user finishes typing
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(memberSearchQuery.trim());
      setIsSearching(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [memberSearchQuery]);

  const handleKasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/[^0-9]/g, '');
    if (!rawDigits || rawDigits === '0') {
      setInitialKasDisplay('0');
    } else {
      const num = parseInt(rawDigits, 10);
      setInitialKasDisplay(num.toLocaleString('id-ID'));
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingAvatar(true);
      const res = await uploadMediaFile(file);
      setUploadedAvatars(prev => [res.url, ...prev]);
      setAvatar(res.url);
    } catch (err) {
      console.error('Failed to upload avatar', err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (!isOpen) return null;

  const handleToggleUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
      if (!memberRoles[userId]) {
        setMemberRoles((prev) => ({ ...prev, [userId]: 'Anggota' }));
      }
    }
  };

  const handleSetRole = (userId: string, role: CircleMember['role']) => {
    setMemberRoles((prev) => ({ ...prev, [userId]: role }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Build members list
    const initialMembers: Array<{
      id: string;
      name: string;
      avatar: string;
      role: CircleMember['role'];
    }> = selectedUserIds.map((userId) => {
      const userObj = availableUsers.find((u) => u.id === userId);
      return {
        id: userId,
        name: userObj?.name || 'Anggota Tim',
        avatar: userObj?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        role: memberRoles[userId] || 'Anggota',
      };
    });

    // Build initial task
    let initialTaskData = undefined;
    if (includeInitialTask && initialTaskTitle.trim()) {
      const assignees = [currentUser, ...availableUsers]
        .filter((u) => taskAssigneeIds.includes(u.id))
        .map((u) => ({ id: u.id, name: u.name, avatar: u.avatar }));

      initialTaskData = {
        title: initialTaskTitle.trim(),
        description: `Tugas inisiasi grup ${name.trim()}`,
        deadline: initialTaskDeadline,
        priority: initialTaskPriority,
        category: 'Inisiasi Tim',
        subtasks: ['Koordinasi Awal', 'Review Kelengkapan Dokumen'],
        assignees: assignees.length > 0 ? assignees : [{ id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar }],
      };
    }

    const newCircle = createCircleWithDetails({
      name: name.trim(),
      category,
      description: description.trim() || `Ruang kolaborasi grup ${name.trim()}`,
      avatar,
      meetingSchedule,
      initialKas: parseInt(initialKasDisplay.replace(/[^0-9]/g, ''), 10) || 0,
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      members: initialMembers,
      initialTask: initialTaskData,
    });

    onClose();
    // Directly open the created group room
    openGroupRoom(newCircle.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-xl shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Buat Grup Tim Baru</h2>
              <p className="text-xs text-slate-500">Langkah {step} dari 3: {step === 1 ? 'Identitas Grup' : step === 2 ? 'Pilih Anggota & Bendahara' : 'Tugas Awal'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mt-4 mb-5">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-teal-600' : 'bg-slate-200'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-teal-600' : 'bg-slate-200'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? 'bg-teal-600' : 'bg-slate-200'}`} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Grup <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Lingkar Studi AI Nusantara / Divisi Publikasi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori Grup
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CircleCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                  >
                    <option value="Kelompok Studi">Kelompok Studi</option>
                    <option value="Organisasi Akar Rumput">Organisasi Akar Rumput</option>
                    <option value="Divisi Kerja">Divisi Kerja</option>
                    <option value="Support Group">Support Group</option>
                    <option value="Komunitas Kebaikan">Komunitas Kebaikan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jadwal Koordinasi / Tatap Muka
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Setiap Sabtu, 19:30 WIB"
                    value={meetingSchedule}
                    onChange={(e) => setMeetingSchedule(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi & Visi Grup
                </label>
                <textarea
                  rows={2}
                  placeholder="Ceritakan tujuan kolaborasi dan fokus kegiatan grup..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih Avatar Grup
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <div className="shrink-0 flex items-center justify-center">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleAvatarUpload} 
                    />
                    <button
                      type="button"
                      disabled={isUploadingAvatar}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-12 h-12 rounded-xl border-2 border-dashed border-teal-300 flex items-center justify-center bg-teal-50 hover:bg-teal-100 text-teal-700 transition-colors"
                      title="Unggah dari perangkat"
                    >
                      {isUploadingAvatar ? <Plus className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    </button>
                  </div>
                  {uploadedAvatars.map((url, idx) => (
                    <img
                      key={`uploaded-${idx}`}
                      src={url}
                      alt={`Uploaded Avatar ${idx}`}
                      onClick={() => setAvatar(url)}
                      className={`w-12 h-12 rounded-xl object-cover cursor-pointer ring-2 transition-all ${
                        avatar === url ? 'ring-teal-600 scale-105 shadow-sm' : 'ring-transparent opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <img
                      key={idx}
                      src={preset}
                      alt={`Avatar ${idx}`}
                      onClick={() => setAvatar(preset)}
                      className={`w-12 h-12 rounded-xl object-cover cursor-pointer ring-2 transition-all ${
                        avatar === preset ? 'ring-teal-600 scale-105 shadow-sm' : 'ring-transparent opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Saldo Kas Awal (Rp)
                  </label>
                  <input
                    type="text"
                    placeholder="0"
                    value={initialKasDisplay}
                    onChange={handleKasChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tagar Topik
                  </label>
                  <input
                    type="text"
                    placeholder="ai, studi, riset"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={!name.trim()}
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 disabled:opacity-50 transition-colors"
                >
                  Lanjut: Pilih Anggota & Bendahara →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: MEMBERS & TREASURER ROLE */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-bold text-slate-800">
                    Pilih Anggota Tim ({selectedUserIds.length} Terpilih)
                  </h3>
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                    {selectedUserIds.length === 0 ? '0 anggota terpilih' : `${selectedUserIds.length} anggota terpilih`}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Anda otomatis menjadi Pembuat/Ketua grup. Silakan pilih anggota yang ingin Anda tambahkan di bawah ini.
                </p>

                {/* Search Member Input */}
                <div className="relative mb-3">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Ketik nama, username, atau email anggota..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-teal-500 font-medium"
                  />
                  {isSearching && (
                    <span className="absolute right-3 top-2.5 text-[10px] text-teal-600 font-bold animate-pulse">
                      Mencari...
                    </span>
                  )}
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                  {filteredMembers.length === 0 ? (
                    <div className="p-5 text-center text-xs text-slate-500 font-medium space-y-1">
                      {memberSearchQuery ? (
                        <>
                          <p className="text-slate-700 font-bold">Tidak ada anggota yang cocok.</p>
                          <p className="text-[11px] text-slate-400">Pastikan ejaan benar atau cari berdasarkan username/email anggota.</p>
                        </>
                      ) : (
                        <>
                          <Users className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                          <p className="text-slate-700 font-bold">Cari Anggota Tim</p>
                          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                            Ketik nama, username, atau email pada kolom pencarian di atas untuk menambahkan anggota baru (Khusus role member).
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    filteredMembers.map((u) => {
                      const isSelected = selectedUserIds.includes(u.id);
                      const currentRole = memberRoles[u.id] || 'Anggota';

                      return (
                        <div
                          key={u.id}
                          className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                            isSelected ? 'bg-white border-teal-400 shadow-xs' : 'bg-slate-100/60 border-slate-200'
                          }`}
                        >
                          <div
                            onClick={() => handleToggleUser(u.id)}
                            className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                          >
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center ${
                                isSelected ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>

                            <img
                              src={u.avatar}
                              alt={u.name}
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-full object-cover"
                            />

                            <div className="truncate">
                              <div className="text-xs font-bold text-slate-900 truncate">{u.name}</div>
                              <div className="text-[10px] text-slate-500 truncate">{u.role}</div>
                            </div>
                          </div>

                          {isSelected && (
                            <select
                              value={currentRole}
                              onChange={(e) =>
                                handleSetRole(u.id, e.target.value as CircleMember['role'])
                              }
                              className="px-2 py-1 bg-teal-50 border border-teal-200 text-teal-900 rounded-lg text-[11px] font-bold outline-none"
                            >
                              <option value="Bendahara">💰 Bendahara (Kas)</option>
                              <option value="Sekretaris">Sekretaris</option>
                              <option value="Anggota">Anggota</option>
                            </select>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ← Kembali
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors"
                >
                  Lanjut: Buat Tugas Awal →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: INITIAL TASK & CONFIRMATION */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between p-3 bg-teal-50 rounded-2xl border border-teal-200">
                <div>
                  <div className="text-xs font-bold text-teal-900">Sertakan Tugas Inisiasi Pertama?</div>
                  <div className="text-[11px] text-teal-700">Tugas langsung didelegasikan ke anggota grup</div>
                </div>
                <input
                  type="checkbox"
                  checked={includeInitialTask}
                  onChange={(e) => setIncludeInitialTask(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded"
                />
              </div>

              {includeInitialTask && (
                <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Judul Tugas Pertama
                    </label>
                    <input
                      type="text"
                      required={includeInitialTask}
                      value={initialTaskTitle}
                      onChange={(e) => setInitialTaskTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Deadline
                      </label>
                      <input
                        type="text"
                        value={initialTaskDeadline}
                        onChange={(e) => setInitialTaskDeadline(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Prioritas
                      </label>
                      <select
                        value={initialTaskPriority}
                        onChange={(e) => setInitialTaskPriority(e.target.value as Priority)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                      >
                        <option value="High">Tinggi (High)</option>
                        <option value="Medium">Sedang (Medium)</option>
                        <option value="Low">Rendah (Low)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary Box */}
              <div className="bg-slate-100 p-3.5 rounded-2xl text-xs text-slate-700 space-y-1">
                <div className="font-bold text-slate-900">Ringkasan Grup:</div>
                <div>• Nama: <strong>{name}</strong> ({category})</div>
                <div>• Anggota Tambahan: <strong>{selectedUserIds.length} Orang</strong> {selectedUserIds.length === 0 ? '(Hanya Anda sebagai Pembuat)' : `(Total ${selectedUserIds.length + 1} Pengelola & Anggota)`}</div>
                <div>• Kas Awal: <strong>Rp {initialKasDisplay || '0'}</strong></div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ← Kembali
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors shadow-md"
                >
                  ✨ Terbitkan & Buka Ruang Grup
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
