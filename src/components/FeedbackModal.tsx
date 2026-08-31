import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  MessageSquarePlus, 
  Send, 
  Star, 
  Lightbulb, 
  Bug, 
  Users, 
  Zap,
  RefreshCw,
  ThumbsUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { FeedbackCategory } from '../types';

const FEEDBACK_CATEGORIES: { label: FeedbackCategory; icon: any; color: string }[] = [
  { label: 'Saran Fitur', icon: Lightbulb, color: 'amber' },
  { label: 'Laporan Kendala (Bug)', icon: Bug, color: 'rose' },
  { label: 'Desain & Tampilan (UI/UX)', icon: Sparkles, color: 'purple' },
  { label: 'Performa & Kecepatan', icon: Zap, color: 'blue' },
  { label: 'Ide Komunitas', icon: Users, color: 'emerald' },
  { label: 'Lainnya', icon: MessageSquarePlus, color: 'teal' },
];

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, submitFeedback } = useApp();
  const { showToast } = useToast();

  const [category, setCategory] = useState<FeedbackCategory>('Saran Fitur');
  const [rating, setRating] = useState<number>(5);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast('Mohon lengkapi judul dan rincian saran Anda.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitFeedback({
        category,
        title: title.trim(),
        message: message.trim(),
        rating,
        userName: name.trim() || currentUser.name,
        userEmail: email.trim() || currentUser.email,
      });

      if (res.success) {
        showToast('Saran berhasil dikirim! Terima kasih.', 'success');
        setTitle('');
        setMessage('');
        onClose();
      } else {
        showToast(res.error || 'Gagal mengirim saran.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Terjadi kesalahan sistem.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-teal-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <MessageSquarePlus className="w-6 h-6 text-teal-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Kirim Saran & Masukan</h3>
              <p className="text-xs text-teal-100/80">Bantu kami meningkatkan Lingkar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/10 hover:bg-black/20 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <p className="text-xs text-teal-900 leading-relaxed font-medium">
              Setiap masukan Anda sangat berharga. Kami meninjau setiap saran untuk memastikan aplikasi Lingkar tetap relevan bagi komunitas.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800">Kategori</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FEEDBACK_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.label;
                  return (
                    <button
                      key={cat.label}
                      type="button"
                      onClick={() => setCategory(cat.label)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-teal-800 border-teal-800 text-white shadow-md ring-2 ring-teal-800/20'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-200' : 'text-slate-400'}`} />
                      <span className="text-[11px] font-bold truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800">Kepuasan</div>
                <div className="text-[10px] text-slate-500">Nilai pengalaman Anda</div>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 ml-1">Judul Ringkas</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Apa yang ingin Anda sampaikan?"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-teal-700 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 ml-1">Detail Pesan</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ceritakan lebih lanjut tentang ide atau masalah Anda..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-teal-700 outline-none transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm shadow-lg transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Kirim Masukan Sekarang</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
