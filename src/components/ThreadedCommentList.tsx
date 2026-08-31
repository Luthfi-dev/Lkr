import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  CornerDownRight, 
  Heart, 
  Send, 
  Paperclip, 
  AtSign, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Share2,
  LogIn
} from 'lucide-react';
import { Comment, PostAttachment, CircleMember } from '../types';
import { MentionText } from './MentionText';
import { MentionInput } from './MentionInput';
import { AttachmentList } from './AttachmentList';
import { AttachmentUploader } from './AttachmentUploader';
import { useApp } from '../context/AppContext';

interface ThreadedCommentListProps {
  postId: string;
  comments: Comment[];
  circleMembers: CircleMember[];
  onAddComment: (postId: string, content: string, mentions?: string[], attachments?: PostAttachment[]) => void;
  onAddReply: (postId: string, parentCommentId: string, content: string, mentions?: string[], attachments?: PostAttachment[]) => void;
  onLikeComment?: (postId: string, commentId: string) => void;
}

export const ThreadedCommentList: React.FC<ThreadedCommentListProps> = ({
  postId,
  comments,
  circleMembers,
  onAddComment,
  onAddReply,
  onLikeComment,
}) => {
  const { isAuthenticated, setIsAuthModalOpen, currentUser } = useApp();
  // Main comment input state
  const [mainCommentText, setMainCommentText] = useState('');
  const [mainAttachments, setMainAttachments] = useState<PostAttachment[]>([]);
  const [showMainUploader, setShowMainUploader] = useState(false);

  // Thread reply states
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyAttachments, setReplyAttachments] = useState<PostAttachment[]>([]);
  const [showReplyUploader, setShowReplyUploader] = useState(false);

  // Collapsed threads map
  const [collapsedThreads, setCollapsedThreads] = useState<{ [commentId: string]: boolean }>({});
  
  // Displayed replies count map
  const [displayedRepliesCount, setDisplayedRepliesCount] = useState<{ [commentId: string]: number }>({});

  // Pagination for main comments
  const [displayedCommentsCount, setDisplayedCommentsCount] = useState(5);

  const toggleThreadCollapse = (commentId: string) => {
    setCollapsedThreads((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const loadMoreReplies = (commentId: string) => {
    setDisplayedRepliesCount((prev) => ({
      ...prev,
      [commentId]: (prev[commentId] || 3) + 10,
    }));
  };

  // Helper to extract @mentions from text
  const extractMentions = (text: string): string[] => {
    const matches = text.match(/@[A-Za-z0-9_]+(?:\s+[A-Za-z0-9_]+)?/g);
    return matches ? matches.map((m) => m.substring(1).trim()) : [];
  };

  const topListRef = useRef<HTMLDivElement>(null);

  const handleSendMainComment = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!mainCommentText.trim() && mainAttachments.length === 0) return;
    const mentions = extractMentions(mainCommentText);
    onAddComment(postId, mainCommentText, mentions, mainAttachments);
    setMainCommentText('');
    setMainAttachments([]);
    
    setTimeout(() => {
      topListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleStartReply = (comment: Comment) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setReplyingToCommentId(comment.id);
    setReplyText(`@${comment.authorName} `);
    setReplyAttachments([]);
  };

  const handleSendReply = (parentCommentId: string) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!replyText.trim() && replyAttachments.length === 0) return;
    const mentions = extractMentions(replyText);
    onAddReply(postId, parentCommentId, replyText, mentions, replyAttachments);
    setReplyText('');
    setReplyAttachments([]);
    setReplyingToCommentId(null);
  };

  const handleCancelReply = () => {
    setReplyingToCommentId(null);
    setReplyText('');
    setReplyAttachments([]);
  };

  const visibleComments = comments.slice(0, displayedCommentsCount);
  const hasMoreComments = comments.length > displayedCommentsCount;

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <MessageSquare className="w-3.5 h-3.5 text-teal-700" />
          <span>Utas Diskusi & Diskursus ({comments.length})</span>
        </div>
        <span className="text-[10px] text-slate-400">
          Mendukung @mention, lampiran, dan balasan bertingkat
        </span>
      </div>

      {/* Main Comment List */}
      <div className="space-y-3" ref={topListRef}>
        {visibleComments.map((comment) => {
          const isCollapsed = collapsedThreads[comment.id] || false;
          const replies = comment.replies || [];
          const isReplyingThis = replyingToCommentId === comment.id;

          return (
            <div
              key={comment.id}
              className="bg-slate-50/90 rounded-2xl p-3 border border-slate-100 space-y-2 text-xs transition-all hover:border-slate-200"
            >
              {/* Comment Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <img
                    src={comment.authorAvatar}
                    alt={comment.authorName}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  <div>
                    <span className="font-bold text-slate-900 text-xs mr-1.5">
                      {comment.authorName}
                    </span>
                    <span className="text-[10px] text-slate-400">{comment.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Like comment button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!isAuthenticated) {
                        setIsAuthModalOpen(true);
                        return;
                      }
                      onLikeComment && onLikeComment(postId, comment.id);
                    }}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                      comment.likedByMe
                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                        : 'text-slate-500 hover:bg-slate-200/60'
                    }`}
                  >
                    <Heart
                      className={`w-3 h-3 ${
                        comment.likedByMe ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                      }`}
                    />
                    <span>{comment.likes || 0}</span>
                  </button>

                  {/* Reply trigger button */}
                  <button
                    type="button"
                    onClick={() => handleStartReply(comment)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-teal-800 hover:bg-teal-50 border border-transparent hover:border-teal-200 transition-all"
                  >
                    <CornerDownRight className="w-3 h-3" />
                    <span>Balas</span>
                  </button>
                </div>
              </div>

              {/* Comment Content with @mentions */}
              <div className="text-slate-700 text-xs leading-relaxed pl-8">
                <MentionText content={comment.content} />
              </div>

              {/* Comment Attachments */}
              {comment.attachments && comment.attachments.length > 0 && (
                <div className="pl-8">
                  <AttachmentList attachments={comment.attachments} isReadOnly />
                </div>
              )}

              {/* Threaded Replies Section */}
              {replies.length > 0 && (
                <div className="pl-6 pt-1 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <button
                      type="button"
                      onClick={() => toggleThreadCollapse(comment.id)}
                      className="flex items-center gap-1 text-slate-600 hover:text-teal-800 transition-colors"
                    >
                      {isCollapsed ? (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>Tampilkan {replies.length} balasan utas</span>
                        </>
                      ) : (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Sembunyikan balasan</span>
                        </>
                      )}
                    </button>
                    <span className="text-[10px] text-slate-400">{replies.length} respon</span>
                  </div>

                  {/* Render Nested Replies when not collapsed */}
                  {!isCollapsed && (
                    <div className="space-y-2 border-l-2 border-teal-200/80 pl-3">
                      {replies.slice(0, displayedRepliesCount[comment.id] || 3).map((reply) => (
                        <div
                          key={reply.id}
                          className="bg-white rounded-xl p-2.5 border border-slate-100 text-xs space-y-1 shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <img
                                src={reply.authorAvatar}
                                alt={reply.authorName}
                                referrerPolicy="no-referrer"
                                className="w-5 h-5 rounded-full object-cover"
                              />
                              <span className="font-bold text-slate-900 text-[11px]">
                                {reply.authorName}
                              </span>
                              <span className="text-[9px] text-slate-400">
                                • {reply.createdAt}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleStartReply(comment)}
                              className="text-[10px] text-teal-700 hover:underline font-semibold"
                            >
                              Balas
                            </button>
                          </div>

                          <div className="text-slate-700 text-xs leading-relaxed pl-6">
                            <MentionText content={reply.content} />
                          </div>

                          {reply.attachments && reply.attachments.length > 0 && (
                            <div className="pl-6">
                              <AttachmentList attachments={reply.attachments} isReadOnly />
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {replies.length > (displayedRepliesCount[comment.id] || 3) && (
                        <button
                          type="button"
                          onClick={() => loadMoreReplies(comment.id)}
                          className="text-[10px] text-teal-700 font-semibold hover:underline mt-1 inline-block"
                        >
                          Lihat balasan sebelumnya... ({replies.length - (displayedRepliesCount[comment.id] || 3)} tersisa)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Nested Reply Input Box (When user clicks 'Balas') */}
              {isReplyingThis && (
                <div className="pl-6 pt-2 space-y-2 border-l-2 border-teal-500 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-[11px] bg-teal-50 text-teal-800 px-2.5 py-1 rounded-lg">
                    <span className="font-semibold">
                      Membalas diskusi <span className="font-bold">{comment.authorName}</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCancelReply}
                      className="text-teal-700 hover:text-teal-900"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <MentionInput
                    value={replyText}
                    onChange={setReplyText}
                    onSubmit={() => handleSendReply(comment.id)}
                    members={circleMembers}
                    placeholder={`Tulis balasan untuk ${comment.authorName}...`}
                    isTextarea={false}
                    autoFocus
                    showToolbar
                    onAttachFileClick={() => setShowReplyUploader(true)}
                  />

                  {/* Reply Attachments preview */}
                  {replyAttachments.length > 0 && (
                    <AttachmentList
                      attachments={replyAttachments}
                      onRemove={(id) =>
                        setReplyAttachments(replyAttachments.filter((a) => a.id !== id))
                      }
                    />
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCancelReply}
                      className="px-3 py-1 rounded-full text-slate-500 text-xs hover:bg-slate-200 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendReply(comment.id)}
                      className="px-4 py-1.5 rounded-full bg-teal-800 text-white text-xs font-bold hover:bg-teal-900 flex items-center gap-1 shadow-2xs"
                    >
                      <Send className="w-3 h-3" />
                      Kirim Balasan
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {hasMoreComments && (
          <div className="flex justify-center pt-2 pb-1">
            <button
              type="button"
              onClick={() => setDisplayedCommentsCount(prev => prev + 10)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors border border-teal-100"
            >
              Muat Lebih Banyak Komentar ({comments.length - displayedCommentsCount} tersisa)
            </button>
          </div>
        )}
      </div>

      {/* Main Comment Box at bottom */}
      {!isAuthenticated ? (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-4 border border-teal-200/80 text-center space-y-2">
          <div className="text-xs font-bold text-teal-950">Ingin bergabung dalam diskusi dan memberikan tanggapan?</div>
          <p className="text-[11px] text-teal-700">Silakan masuk ke akun Anda untuk menulis komentar, menyukai diskusi, dan berbagi berkas materi.</p>
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-teal-800 text-white text-xs font-bold shadow-xs hover:bg-teal-900 active:scale-95 transition-all"
          >
            <LogIn className="w-3.5 h-3.5" />
            Masuk ke Akun
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-3 border border-slate-200 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-teal-800 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
              Saya
            </div>
            <div className="flex-1">
              <MentionInput
                value={mainCommentText}
                onChange={setMainCommentText}
                onSubmit={handleSendMainComment}
                members={circleMembers}
                placeholder="Tulis tanggapan, pertanyaan, atau refleksi ilmu... (@ untuk tandai rekan)"
                isTextarea={true}
                rows={2}
                showToolbar
                onAttachFileClick={() => setShowMainUploader(true)}
              />
            </div>
          </div>

          {/* Attachments preview */}
          {mainAttachments.length > 0 && (
            <div className="pl-8">
              <AttachmentList
                attachments={mainAttachments}
                onRemove={(id) =>
                  setMainAttachments(mainAttachments.filter((a) => a.id !== id))
                }
              />
            </div>
          )}

          <div className="flex items-center justify-between pl-8 pt-1">
            <button
              type="button"
              onClick={() => setShowMainUploader(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 text-xs font-semibold transition-colors"
            >
              <Paperclip className="w-3.5 h-3.5 text-slate-500" />
              Lampirkan Berkas
            </button>

            <button
              type="button"
              onClick={handleSendMainComment}
              disabled={!mainCommentText.trim() && mainAttachments.length === 0}
              className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                mainCommentText.trim() || mainAttachments.length > 0
                  ? 'bg-teal-800 text-white hover:bg-teal-900 active:scale-95'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              Kirim Komentar
            </button>
          </div>
        </div>
      )}

      {/* Main Uploader Modal */}
      <AttachmentUploader
        isOpen={showMainUploader}
        onClose={() => setShowMainUploader(false)}
        onAddAttachment={(att) => setMainAttachments([...mainAttachments, att])}
      />

      {/* Reply Uploader Modal */}
      <AttachmentUploader
        isOpen={showReplyUploader}
        onClose={() => setShowReplyUploader(false)}
        onAddAttachment={(att) => setReplyAttachments([...replyAttachments, att])}
      />
    </div>
  );
};
