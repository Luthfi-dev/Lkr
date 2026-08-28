import React, { useState, useRef } from 'react';
import { 
  Image as ImageIcon, 
  FileText, 
  AtSign, 
  Tag, 
  Send, 
  X, 
  Paperclip, 
  BookOpen, 
  Upload,
  Check,
  LogIn,
  Globe,
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PostCategory, PostAttachment, CircleMember } from '../types';
import { uploadMediaFile } from '../utils/imageOptimizer';
import { MentionInput } from './MentionInput';
import { AttachmentList } from './AttachmentList';
import { AttachmentUploader } from './AttachmentUploader';

interface QuickPostComposerProps {
  onOpenFullModal: () => void;
  availableMembers: CircleMember[];
}

export const QuickPostComposer: React.FC<QuickPostComposerProps> = ({
  onOpenFullModal,
  availableMembers,
}) => {
  const { currentUser, createPost, activeCircleId, activeCircle, circles, isAuthenticated, setIsAuthModalOpen } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>('Rangkuman Buku');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showImageInput, setShowImageInput] = useState(false);
  const [attachments, setAttachments] = useState<PostAttachment[]>([]);
  const [showAttachmentUploader, setShowAttachmentUploader] = useState(false);
  const [targetCircleId, setTargetCircleId] = useState<string>(
    activeCircleId !== 'all' ? activeCircleId : circles[0]?.id || 'circle_1'
  );
  const [privacy, setPrivacy] = useState<'public' | 'group_only'>('public');

  const categories: PostCategory[] = [
    'Rangkuman Buku',
    'Wawasan & Artikel',
    'Materi Keilmuan',
    'Misi Kebaikan',
  ];

  const presetImages = [
    { label: 'Buku & Catatan', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1000&auto=format&fit=crop&q=80' },
    { label: 'Laporan Finansial', url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1000&auto=format&fit=crop&q=80' },
    { label: 'Teknologi & Riset', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&auto=format&fit=crop&q=80' },
    { label: 'Aktivitas Relawan', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1000&auto=format&fit=crop&q=80' },
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Helper to extract @mentions
  const extractMentions = (text: string): string[] => {
    const matches = text.match(/@[A-Za-z0-9_]+(?:\s+[A-Za-z0-9_]+)?/g);
    return matches ? matches.map((m) => m.substring(1).trim()) : [];
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const result = await uploadMediaFile(file);
      setUploadedImages(prev => [result.url, ...prev]);
      setImageUrl(result.url);
    } catch (err) {
      console.error('Error uploading image:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!title.trim() && !content.trim()) return;

    const finalTitle = title.trim() || (content.length > 50 ? content.slice(0, 48) + '...' : content);
    const mentions = extractMentions(content);

    createPost({
      title: finalTitle,
      summary: content.slice(0, 140) + (content.length > 140 ? '...' : ''),
      content: content,
      category: category,
      tags: [category, 'DiskusiTim'],
      circleId: targetCircleId,
      mentions: mentions,
      attachments: attachments,
      imageUrl: imageUrl || undefined,
      isGroupPrivate: privacy === 'group_only',
      visibility: privacy,
    });

    // Reset state
    setTitle('');
    setContent('');
    setImageUrl('');
    setAttachments([]);
    setShowImageInput(false);
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setIsExpanded(false);
    setShowImageInput(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-teal-50/80 via-white to-emerald-50/80 rounded-2xl p-3.5 border border-teal-200/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
              <BookOpen className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <div className="text-xs font-bold text-teal-950">Punya wawasan, rangkuman, atau tulisan inspiratif?</div>
              <div className="text-[11px] text-teal-700">Masuk untuk mempublikasikan postingan dan berdiskusi dengan sesama anggota.</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-teal-800 text-white text-xs font-bold shadow-xs hover:bg-teal-900 active:scale-95 transition-all"
          >
            <LogIn className="w-3.5 h-3.5" />
            Masuk untuk Menulis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs transition-all hover:border-slate-200">
      {/* Collapsed view: Facebook / Instagram style quick trigger */}
      {!isExpanded ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 flex-shrink-0"
            />
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="flex-1 text-left px-4 py-2.5 bg-slate-50 hover:bg-slate-100/90 rounded-full text-slate-500 hover:text-slate-700 text-xs font-normal border border-slate-200/70 transition-colors cursor-pointer"
            >
              Apa ilmu atau wawasan yang ingin Anda bagikan hari ini, {currentUser.name.split(' ')[0]}?
            </button>
          </div>

          {/* Quick Action Shortcut Buttons (Instagram & Facebook style) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-2 border-t border-slate-100 text-xs">
            <button
              type="button"
              onClick={() => {
                setIsExpanded(true);
                setShowImageInput(true);
              }}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-semibold transition-colors"
            >
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              <span>Foto / Media</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsExpanded(true);
                setShowAttachmentUploader(true);
              }}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 font-semibold transition-colors"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Dokumen</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-700 font-semibold transition-colors"
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Rangkuman</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsExpanded(true);
                setContent((prev) => (prev ? prev + ' @' : '@'));
              }}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-700 font-semibold transition-colors"
            >
              <AtSign className="w-4 h-4 text-purple-600" />
              <span>Tandai Rekan</span>
            </button>
          </div>
        </div>
      ) : (
        /* Expanded Inline Composer */
        <form onSubmit={handlePublish} className="space-y-3.5 animate-in fade-in duration-150">
          {/* Header with Author and Target Circle */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
              />
              <div>
                <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <span>Posting ke:</span>
                  <select
                    value={targetCircleId}
                    onChange={(e) => setTargetCircleId(e.target.value)}
                    className="font-semibold text-teal-800 bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
                  >
                    {circles.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title Input */}
          <div>
            <input
              type="text"
              placeholder="Judul Utama (misal: Intisari Buku Atomic Habits Bab 3)..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700 font-display"
              autoFocus
            />
          </div>

          {/* Category Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[11px] font-semibold text-slate-500 flex-shrink-0">Kategori:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                  category === cat
                    ? 'bg-teal-800 text-white font-semibold shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Content with @mentions */}
          <div>
            <MentionInput
              value={content}
              onChange={setContent}
              members={availableMembers}
              placeholder="Tulis poin-poin ilmu, kesimpulan, atau tandai rekan seperti @Budi Pratama..."
              isTextarea={true}
              rows={4}
              className="w-full text-xs bg-slate-50 border border-slate-200/80 rounded-xl p-3 focus:ring-2 focus:ring-teal-700"
            />
          </div>

          {/* Media/Image Attachment Option */}
          {showImageInput && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  Foto / Media Visual Postingan
                </span>
                <button
                  type="button"
                  onClick={() => setShowImageInput(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Direct image url input */}
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Masukkan URL foto atau unggah..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold whitespace-nowrap transition-colors disabled:opacity-50"
                >
                  {isUploadingImage ? 'Mengunggah...' : 'Unggah'}
                </button>
              </div>

              {/* Preset Image Gallery */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">Pilihan Foto Cepat:</span>
                <div className="grid grid-cols-4 gap-2">
                  {uploadedImages.map((url, idx) => (
                    <button
                      key={`uploaded-${idx}`}
                      type="button"
                      onClick={() => setImageUrl(url)}
                      className={`relative rounded-xl overflow-hidden aspect-video border transition-all ${
                        imageUrl === url ? 'ring-2 ring-teal-600 border-transparent' : 'border-slate-200'
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Uploaded ${idx}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[8px] py-0.5 px-1 truncate text-center">
                        Unggahan
                      </span>
                    </button>
                  ))}
                  {presetImages.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImageUrl(p.url)}
                      className={`relative rounded-xl overflow-hidden aspect-video border transition-all ${
                        imageUrl === p.url ? 'ring-2 ring-teal-600 border-transparent' : 'border-slate-200'
                      }`}
                    >
                      <img
                        src={p.url}
                        alt={p.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[8px] py-0.5 px-1 truncate text-center">
                        {p.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {imageUrl && (
                <div className="relative rounded-xl overflow-hidden max-h-36 w-full border border-slate-200">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Attachments Section */}
          {attachments.length > 0 && (
            <AttachmentList
              attachments={attachments}
              onRemove={(id) => setAttachments(attachments.filter((a) => a.id !== id))}
            />
          )}

          {/* Action Toolbar & Submit */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className={`p-2 rounded-xl transition-colors ${
                  showImageInput || imageUrl
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
                title="Tambahkan Foto"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowAttachmentUploader(true)}
                className={`p-2 rounded-xl transition-colors ${
                  attachments.length > 0
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
                title="Lampirkan Dokumen (PDF, Slide, dll)"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Privacy mode toggle */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setPrivacy('public')}
                  className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-all ${
                    privacy === 'public'
                      ? 'bg-white text-teal-800 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Dapat dibaca semua orang di Beranda"
                >
                  <Globe className="w-3 h-3" />
                  <span>Publik</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrivacy('group_only')}
                  className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-all ${
                    privacy === 'group_only'
                      ? 'bg-white text-teal-800 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Hanya anggota grup yang bergabung"
                >
                  <Lock className="w-3 h-3" />
                  <span>Privat Grup</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-3.5 py-2 rounded-2xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!title.trim() && !content.trim()}
                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 ${
                  title.trim() || content.trim()
                    ? 'bg-teal-800 hover:bg-teal-900 text-white'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Terbitkan (+35 Poin)</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Attachment Uploader Modal */}
      <AttachmentUploader
        isOpen={showAttachmentUploader}
        onClose={() => setShowAttachmentUploader(false)}
        onAddAttachment={(att) => setAttachments([...attachments, att])}
      />
    </div>
  );
};
