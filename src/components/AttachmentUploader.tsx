import React, { useState, useRef } from 'react';
import { Paperclip, Upload, FileText, Image as ImageIcon, Plus, Check, Loader2, Sparkles } from 'lucide-react';
import { PostAttachment } from '../types';
import { uploadMediaFile } from '../utils/imageOptimizer';

interface AttachmentUploaderProps {
  onAddAttachment: (attachment: PostAttachment) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
  onAddAttachment,
  isOpen,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  if (!isOpen) return null;

  const presets: Array<{ name: string; type: PostAttachment['type']; size: string }> = [
    { name: 'Modul_Panduan_Belajar_v2.pdf', type: 'pdf', size: '2.4 MB' },
    { name: 'Slide_Presentasi_Diskusi_Mingguan.slide', type: 'slide', size: '4.8 MB' },
    { name: 'Rangkuman_Framework_AI_Ethics.doc', type: 'doc', size: '850 KB' },
    { name: 'Infografis_Ringkasan_Poin.image', type: 'image', size: '1.6 MB' },
    { name: 'Laporan_Kas_&_Realisasi_Biaya.sheet', type: 'sheet', size: '540 KB' },
  ];

  const handleSelectPreset = (p: typeof presets[0]) => {
    onAddAttachment({
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: p.name,
      type: p.type,
      size: p.size,
      url: `/uploads/${p.name.toLowerCase().replace(/[^a-z0-9_.]/g, '_')}`,
    });
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadStatus(file.type.startsWith('image/') ? 'Mengompresi & mengoptimasi gambar...' : 'Mengunggah berkas ke server...');
      
      const result = await uploadMediaFile(file);

      onAddAttachment({
        id: `att_${Date.now()}`,
        name: result.name,
        type: result.type,
        size: result.size,
        url: result.url,
      });

      setIsUploading(false);
      onClose();
    } catch (err) {
      setIsUploading(false);
      setUploadStatus('');
      console.error('Error uploading attachment:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-md p-5 border border-slate-100 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
              <Paperclip className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Lampirkan Berkas ke Diskusi</h3>
              <p className="text-[11px] text-slate-500">Pilih dari perangkat atau gunakan template dokumen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* File Picker from Device */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 border-2 border-dashed border-teal-300 rounded-2xl bg-teal-50/40 hover:bg-teal-50 text-teal-900 flex flex-col items-center justify-center gap-1.5 transition-all group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-6 h-6 text-teal-700 animate-spin" />
                <span className="font-bold text-xs">{uploadStatus}</span>
                <span className="text-[10px] text-teal-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Menyimpan berkas optimal ke /uploads
                </span>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 text-teal-700 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-xs">Pilih Berkas dari Perangkat</span>
                <span className="text-[10px] text-slate-500">Mendukung Gambar (Auto-Kompres), PDF, Office, ZIP (Maks 25MB)</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Presets for Demo */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Contoh Lampiran Cepat
          </div>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-teal-50 hover:border-teal-200 transition-colors text-left group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1 rounded-lg bg-white shadow-2xs">
                    <FileText className="w-4 h-4 text-teal-700" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 truncate group-hover:text-teal-900">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {p.size} • {p.type.toUpperCase()}
                    </div>
                  </div>
                </div>

                <span className="text-xs font-bold text-teal-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  + Tambah
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
