import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal, 
  Globe, 
  Users, 
  BookOpen, 
  FileText, 
  Paperclip, 
  CornerDownRight, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Link2,
  ExternalLink,
  Trash2,
  LogIn
} from 'lucide-react';
import { Post, CircleMember, Comment, PostAttachment } from '../types';
import { useApp } from '../context/AppContext';
import { copyToClipboard } from '../utils/clipboard';
import { MentionText } from './MentionText';
import { MentionInput } from './MentionInput';
import { AttachmentList } from './AttachmentList';
import { ThreadedCommentList } from './ThreadedCommentList';
import { AttachmentUploader } from './AttachmentUploader';
import { ConfirmationModal } from './ConfirmationModal';

interface PostCardProps {
  post: Post;
  availableMembers: CircleMember[];
  onOpenImageLightbox: (imageUrl: string, post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  availableMembers,
  onOpenImageLightbox,
}) => {
  const {
    currentUser,
    isAuthenticated,
    setIsAuthModalOpen,
    likePost,
    savePost,
    deletePost,
    addComment,
    addThreadReply,
    likeComment,
  } = useApp();

  const [isExpandedText, setIsExpandedText] = useState(false);
  const [showFullComments, setShowFullComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [quickCommentText, setQuickCommentText] = useState('');
  const [showQuickUploader, setShowQuickUploader] = useState(false);
  const [quickAttachments, setQuickAttachments] = useState<PostAttachment[]>([]);
  const [heartAnim, setHeartAnim] = useState(false);

  // Total comment count including replies
  const totalComments =
    post.comments.reduce((acc, c) => acc + (c.replies ? c.replies.length : 0), 0) +
    post.comments.length;

  const handleDoubleTapImage = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!post.likedByMe) {
      likePost(post.id);
    }
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 800);
  };

  const handleCopyLink = () => {
    const textToCopy = `📚 *${post.title}* (${post.category})\nOleh ${post.author.name}\n\n${post.summary || post.content}\n\n*Dibagikan via Lingkar*`;
    copyToClipboard(textToCopy);
    setCopiedLink(true);
    setTimeout(() => {
      setCopiedLink(false);
      setShowMenu(false);
    }, 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `📚 *${post.title}*\n${post.summary || post.content}\n\nOleh ${post.author.name} (Aplikasi Lingkar)`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    setShowMenu(false);
  };

  const handleQuickCommentSubmit = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!quickCommentText.trim() && quickAttachments.length === 0) return;
    const matches = quickCommentText.match(/@[A-Za-z0-9_]+(?:\s+[A-Za-z0-9_]+)?/g);
    const mentions = matches ? matches.map((m) => m.substring(1).trim()) : [];

    addComment(post.id, quickCommentText, mentions, quickAttachments);
    setQuickCommentText('');
    setQuickAttachments([]);
    setShowFullComments(true);
  };

  // Recent 2 comments for fast social preview
  const recentComments = post.comments.slice(-2);

  return (
    <article id={`post-${post.id}`} className="bg-white rounded-3xl border border-slate-100 shadow-xs hover:border-slate-200/90 transition-all overflow-hidden">
      {/* 1. Header Row (Instagram / Facebook Style) */}
      <div className="p-4 pb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-slate-900 text-xs">
                {post.author.name}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[10px] font-semibold">
                {post.author.role}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
              <span>{post.createdAt}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <Globe className="w-3 h-3 text-slate-400" />
                {post.readingTime}
              </span>
            </div>
          </div>
        </div>

        {/* Post Options Dropdown Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Opsi Postingan"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 z-30 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 text-xs animate-in zoom-in-95">
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    setIsAuthModalOpen(true);
                    setShowMenu(false);
                    return;
                  }
                  handleCopyLink();
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Tautan Disalin!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Salin Tautan</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    setIsAuthModalOpen(true);
                    setShowMenu(false);
                    return;
                  }
                  savePost(post.id);
                  setShowMenu(false);
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
              >
                <Bookmark className={`w-3.5 h-3.5 ${post.savedByMe ? 'fill-amber-500 text-amber-500' : 'text-slate-500'}`} />
                <span>{post.savedByMe ? 'Hapus dari Simpanan' : 'Simpan Postingan'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    setIsAuthModalOpen(true);
                    setShowMenu(false);
                    return;
                  }
                  handleShareWhatsApp();
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Bagikan ke WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  setShowDeleteConfirm(true);
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-rose-50 flex items-center gap-2 text-rose-600 font-medium border-t border-slate-100"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Hapus Postingan</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Post Category Tag & Title */}
      <div className="px-4 pb-2 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-100">
            <BookOpen className="w-3 h-3 text-teal-700" />
            {post.category}
          </span>
          {post.pointsBonus > 0 && (
            <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
              +{post.pointsBonus} Poin Kebaikan
            </span>
          )}
        </div>

        <h3 className="text-sm font-bold text-slate-900 font-display leading-snug">
          {post.title}
        </h3>
      </div>

      {/* 3. Text Body with Mentions & Read More */}
      <div className="px-4 pb-3 space-y-2 text-xs text-slate-700 leading-relaxed font-sans">
        <div className={!isExpandedText ? 'line-clamp-3' : ''}>
          <MentionText content={post.content || post.summary} />
        </div>

        {post.content && post.content.length > 180 && (
          <button
            type="button"
            onClick={() => setIsExpandedText(!isExpandedText)}
            className="text-[11px] font-bold text-teal-800 hover:text-teal-900 hover:underline inline-flex items-center gap-0.5"
          >
            {isExpandedText ? (
              <>
                <span>Sembunyikan</span>
                <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                <span>Lihat selengkapnya...</span>
                <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        )}
      </div>

      {/* 4. Media Image (Instagram Style with Double-tap to Like) */}
      {post.imageUrl && (
        <div 
          className="relative w-full aspect-video bg-slate-900 overflow-hidden cursor-pointer group"
          onDoubleClick={handleDoubleTapImage}
          onClick={() => onOpenImageLightbox(post.imageUrl!, post)}
          title="Klik untuk perbesar foto / Dobel klik untuk suka"
        >
          <img
            src={post.imageUrl}
            alt={post.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
          />

          {/* Double-tap animated heart pop */}
          {heartAnim && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 animate-in zoom-in-50 duration-200">
              <Heart className="w-20 h-20 fill-rose-500 text-rose-500 filter drop-shadow-lg animate-bounce" />
            </div>
          )}

          {/* Expand badge */}
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity">
            Lihat Foto Penuh
          </div>
        </div>
      )}

      {/* 5. Document / Attachments Box (Facebook / LinkedIn Style) */}
      {post.attachments && post.attachments.length > 0 && (
        <div className="px-4 py-2 border-t border-slate-100/80 bg-slate-50/50">
          <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
            <Paperclip className="w-3.5 h-3.5 text-teal-700" />
            <span>Materi & Berkas Lampiran ({post.attachments.length})</span>
          </div>
          <AttachmentList attachments={post.attachments} isReadOnly />
        </div>
      )}

      {/* 6. Social Metrics Row (Like count & Comments count) */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center">
            <Heart className="w-2.5 h-2.5 fill-white text-white" />
          </span>
          <span className="font-semibold text-slate-700">
            {post.likes} menyukai
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowFullComments(!showFullComments)}
          className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
        >
          {totalComments} komentar • {post.tags?.length || 1} topik
        </button>
      </div>

      {/* 7. Action Bar (Instagram & Facebook 4-Action Row) */}
      <div className="px-3 py-1.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
        {/* Like Button */}
        <button
          type="button"
          onClick={() => {
            if (!isAuthenticated) {
              setIsAuthModalOpen(true);
              return;
            }
            likePost(post.id);
          }}
          className={`flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
            post.likedByMe
              ? 'text-rose-600 bg-rose-50/70 font-bold'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-transform ${
              post.likedByMe ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-600'
            }`}
          />
          <span>Suka</span>
        </button>

        {/* Comment Button */}
        <button
          type="button"
          onClick={() => setShowFullComments(!showFullComments)}
          className="flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        >
          <MessageCircle className="w-4 h-4 text-slate-600" />
          <span>Komentar</span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={() => {
            if (!isAuthenticated) {
              setIsAuthModalOpen(true);
              return;
            }
            handleCopyLink();
          }}
          className="flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        >
          <Share2 className="w-4 h-4 text-slate-600" />
          <span>{copiedLink ? 'Disalin!' : 'Bagikan'}</span>
        </button>

        {/* Bookmark Button */}
        <button
          type="button"
          onClick={() => {
            if (!isAuthenticated) {
              setIsAuthModalOpen(true);
              return;
            }
            savePost(post.id);
          }}
          className={`px-3 py-1.5 rounded-xl flex items-center justify-center transition-colors ${
            post.savedByMe ? 'text-amber-600 bg-amber-50' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
          title="Simpan Postingan"
        >
          <Bookmark className={`w-4 h-4 ${post.savedByMe ? 'fill-amber-500 text-amber-500' : ''}`} />
        </button>
      </div>

      {/* 8. Recent Comments Preview & Threaded Comments (Facebook Style) */}
      <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 space-y-2.5">
        {/* If collapsed and there are comments, show preview */}
        {!showFullComments && recentComments.length > 0 && (
          <div className="space-y-2">
            {recentComments.map((c) => (
              <div key={c.id} className="flex items-start gap-2 text-xs">
                <img
                  src={c.authorAvatar}
                  alt={c.authorName}
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded-full object-cover flex-shrink-0 mt-0.5"
                />
                <div className="bg-white px-3 py-1.5 rounded-2xl border border-slate-100 shadow-2xs max-w-full">
                  <span className="font-bold text-slate-900 mr-1.5">{c.authorName}</span>
                  <span className="text-slate-700"><MentionText content={c.content} /></span>
                </div>
              </div>
            ))}

            {post.comments.length > 2 && (
              <button
                type="button"
                onClick={() => setShowFullComments(true)}
                className="text-[11px] font-semibold text-slate-500 hover:text-teal-800 transition-colors pl-7"
              >
                Lihat semua {totalComments} komentar & balasan...
              </button>
            )}
          </div>
        )}

        {/* If expanded, render full ThreadedCommentList */}
        {showFullComments && (
          <div className="animate-in fade-in duration-150">
            <ThreadedCommentList
              postId={post.id}
              comments={post.comments}
              circleMembers={availableMembers}
              onAddComment={addComment}
              onAddReply={addThreadReply}
              onLikeComment={likeComment}
            />
          </div>
        )}

        {/* 9. Quick Inline Comment Input Box */}
        {!isAuthenticated ? (
          <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl px-3.5 py-2 shadow-2xs">
            <span className="text-xs text-slate-500">
              Masuk ke akun untuk ikut berdiskusi atau membalas...
            </span>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200/60 px-3 py-1 rounded-full transition-all active:scale-95 shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              Masuk
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-1">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 flex-shrink-0"
            />

            <div className="flex-1 flex items-center bg-white border border-slate-200/80 rounded-full px-3 py-1.5 focus-within:ring-2 focus-within:ring-teal-700 shadow-2xs">
              <input
                type="text"
                placeholder={`Tulis komentar untuk ${post.author.name.split(' ')[0]}...`}
                value={quickCommentText}
                onChange={(e) => setQuickCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleQuickCommentSubmit();
                  }
                }}
                className="flex-1 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent border-none focus:outline-none"
              />

              <button
                type="button"
                onClick={() => setShowQuickUploader(true)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                title="Lampirkan Dokumen"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleQuickCommentSubmit}
                disabled={!quickCommentText.trim() && quickAttachments.length === 0}
                className={`p-1 rounded-full transition-all ${
                  quickCommentText.trim() || quickAttachments.length > 0
                    ? 'text-teal-800 hover:text-teal-950 scale-110'
                    : 'text-slate-300 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Quick Attachments preview */}
        {quickAttachments.length > 0 && (
          <div className="pl-9">
            <AttachmentList
              attachments={quickAttachments}
              onRemove={(id) => setQuickAttachments(quickAttachments.filter((a) => a.id !== id))}
            />
          </div>
        )}
      </div>

      {/* Quick Attachment Uploader Modal */}
      <AttachmentUploader
        isOpen={showQuickUploader}
        onClose={() => setShowQuickUploader(false)}
        onAddAttachment={(att) => setQuickAttachments([...quickAttachments, att])}
      />

      {/* Confirmation Modal for Post Deletion */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Hapus Postingan Ini?"
        message={`Apakah Anda yakin ingin menghapus postingan "${post.title}"? Semua utas diskusi, lampiran file, dan apresiasi yang ada akan ikut terhapus.`}
        confirmLabel="Ya, Hapus Postingan"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={() => {
          deletePost(post.id);
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </article>
  );
};
