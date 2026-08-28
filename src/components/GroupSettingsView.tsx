import React, { useState } from 'react';
import { Circle, CircleCategory } from '../types';
import { useApp } from '../context/AppContext';
import { uploadMediaFile } from '../utils/imageOptimizer';
import { Settings, Save, Trash2, AlertTriangle, Plus, CheckCircle2 } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

export const GroupSettingsView = ({ circle, onBack }: { circle: Circle; onBack: () => void }) => {
  const { updateCircle, deleteCircle, currentUser } = useApp();
  
  const [name, setName] = useState(circle.name);
  const [description, setDescription] = useState(circle.description);
  const [category, setCategory] = useState<CircleCategory>(circle.category);
  const [avatar, setAvatar] = useState(circle.avatar);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modal states
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isCannotDeleteOpen, setIsCannotDeleteOpen] = useState(false);

  const CATEGORIES: CircleCategory[] = [
    'Kelompok Studi',
    'Organisasi Akar Rumput',
    'Divisi Kerja',
    'Support Group',
    'Komunitas Kebaikan',
  ];

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingAvatar(true);
      const res = await uploadMediaFile(file);
      setAvatar(res.url);
    } catch (err) {
      console.error('Failed to upload avatar', err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    await updateCircle(circle.id, { name, description, category, avatar });
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const onClickDeleteBtn = () => {
    if (circle.members.length > 1) {
      setIsCannotDeleteOpen(true);
    } else {
      setIsDeleteConfirmOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    await deleteCircle(circle.id);
    onBack();
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
          <Settings className="w-5 h-5 text-slate-700" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900">Pengaturan Grup</h2>
          <p className="text-xs text-slate-500">Ubah profil grup dan kelola akses.</p>
        </div>
      </div>

      {saveSuccess && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Pengaturan grup berhasil disimpan.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Foto Profil Grup</label>
          <div className="flex items-center gap-4">
            <img src={avatar} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100" />
            <label className="cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              <div className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors">
                {isUploadingAvatar ? 'Mengunggah...' : 'Ubah Foto'}
              </div>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Nama Grup</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Grup</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CircleCategory)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-slate-100">
          <button
            type="button"
            onClick={onClickDeleteBtn}
            className="flex items-center gap-1.5 px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Hapus Grup
          </button>
          
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>

      {/* Modal Peringatan Tidak Bisa Hapus Grup */}
      <ConfirmationModal
        isOpen={isCannotDeleteOpen}
        onClose={() => setIsCannotDeleteOpen(false)}
        onConfirm={() => setIsCannotDeleteOpen(false)}
        variant="warning"
        title="Grup Tidak Dapat Dihapus"
        message="Grup tidak bisa dihapus karena masih memiliki anggota lain. Harap keluarkan semua anggota terlebih dahulu hingga tersisa Anda sendiri di dalam grup."
        confirmLabel="Saya Mengerti"
      />

      {/* Modal Konfirmasi Hapus Grup */}
      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        variant="danger"
        title="Hapus Grup Permanen?"
        message={`Apakah Anda yakin ingin MENGHAPUS grup "${circle.name}" secara permanen? Semua data tugas, anggota, dan transaksi kas di dalamnya akan dihapus.`}
        confirmLabel="Ya, Hapus Grup"
        cancelLabel="Batal"
      />
    </div>
  );
};
