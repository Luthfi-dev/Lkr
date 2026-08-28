import React, { useState } from 'react';
import { 
  Plus, 
  X, 
  Heart, 
  MessageCircle, 
  BookOpen, 
  FileText, 
  Sparkles,
  Compass,
  ChevronRight, 
  ChevronLeft 
} from 'lucide-react';
import { CircleMember, Post } from '../types';
import { useApp } from '../context/AppContext';
import { isPostVisibleToUser } from '../utils/postPrivacy';

interface StoryReelProps {
  onOpenCreatePost: () => void;
  onSelectStoryPost?: (post: Post) => void;
}

export const StoryReel: React.FC<StoryReelProps> = ({
  onOpenCreatePost,
  onSelectStoryPost,
}) => {
  const { currentUser, posts, circles, isAuthenticated } = useApp();
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

  // Stories are exclusively for authenticated users
  if (!isAuthenticated) {
    return null;
  }

  // Take recent posts visible to the current user as stories with rich visual highlights
  const storyPosts = posts
    .filter((p) => isPostVisibleToUser(p, isAuthenticated, currentUser, circles))
    .slice(0, 6);

  const handleOpenStory = (index: number) => {
    setActiveStoryIndex(index);
  };

  const handleCloseStory = () => {
    setActiveStoryIndex(null);
  };

  const handleNextStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex < storyPosts.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      setActiveStoryIndex(null);
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    }
  };

  const currentStory = activeStoryIndex !== null ? storyPosts[activeStoryIndex] : null;

  return (
    <div className="w-full overflow-hidden">
      {/* Horizontal Story Reel (Instagram / Facebook style) */}
      <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-2 pt-1 px-1 no-scrollbar scroll-smooth w-full">
        {/* Current User: Add Story / Share Insight */}
        <button
          type="button"
          onClick={onOpenCreatePost}
          className="flex-shrink-0 flex flex-col items-center gap-1.5 group cursor-pointer text-left"
          title="Bagikan Wawasan Baru"
        >
          <div className="relative w-15 h-15 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 p-0.5 shadow-2xs group-hover:scale-105 transition-transform">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-full h-full rounded-[14px] object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-teal-800 text-white flex items-center justify-center ring-2 ring-white shadow-xs group-hover:bg-teal-900 transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-700 max-w-[65px] truncate text-center">
            Cerita Saya
          </span>
        </button>

        {/* Story Circles from team members */}
        {storyPosts.map((post, idx) => {
          const hasImage = !!post.imageUrl;
          // Clean gradient ring based on category
          const ringGradient =
            post.category === 'Rangkuman Buku'
              ? 'from-amber-400 via-rose-400 to-teal-500'
              : post.category === 'Misi Kebaikan'
              ? 'from-teal-400 via-emerald-400 to-blue-500'
              : 'from-teal-600 via-teal-700 to-slate-800';

          return (
            <button
              key={post.id}
              type="button"
              onClick={() => handleOpenStory(idx)}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 group cursor-pointer text-left"
              title={`${post.author.name}: ${post.title}`}
            >
              <div
                className={`relative w-15 h-15 sm:w-16 sm:h-16 rounded-2xl p-[2px] bg-gradient-to-tr ${ringGradient} shadow-2xs group-hover:scale-105 transition-transform`}
              >
                <div className="w-full h-full rounded-[14px] bg-white p-[1.5px] overflow-hidden">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-[12px] object-cover"
                  />
                </div>
                {/* Micro category badge indicator with Lucide icons */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center ring-2 ring-white shadow-2xs">
                  {post.category === 'Rangkuman Buku' ? (
                    <BookOpen className="w-2.5 h-2.5 text-amber-300" />
                  ) : post.category === 'Misi Kebaikan' ? (
                    <Heart className="w-2.5 h-2.5 text-rose-300 fill-rose-300" />
                  ) : (
                    <Sparkles className="w-2.5 h-2.5 text-teal-300" />
                  )}
                </div>
              </div>
              <span className="text-[11px] font-medium text-slate-700 max-w-[68px] truncate text-center">
                {post.author.name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Story Lightbox / Story Viewer Modal */}
      {currentStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] border border-slate-800">
            {/* Story Progress Bars */}
            <div className="flex items-center gap-1 p-3 pb-1 z-10">
              {storyPosts.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full overflow-hidden ${
                    i === activeStoryIndex
                      ? 'bg-teal-400'
                      : i < (activeStoryIndex || 0)
                      ? 'bg-white'
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>

            {/* Story Header */}
            <div className="flex items-center justify-between px-3.5 py-2 z-10">
              <div className="flex items-center gap-2">
                <img
                  src={currentStory.author.avatar}
                  alt={currentStory.author.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-teal-400"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>{currentStory.author.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{currentStory.readingTime} baca</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseStory}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Story Media & Content Body */}
            <div className="relative flex-1 overflow-y-auto p-4 space-y-3 flex flex-col justify-end">
              {currentStory.imageUrl && (
                <div className="absolute inset-0 z-0">
                  <img
                    src={currentStory.imageUrl}
                    alt={currentStory.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-40 filter brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
                </div>
              )}

              <div className="relative z-10 space-y-2 mt-auto">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-[11px] font-semibold backdrop-blur-md">
                  <BookOpen className="w-3 h-3" />
                  <span>{currentStory.category}</span>
                </div>

                <h3 className="text-base font-bold text-white font-display leading-snug">
                  {currentStory.title}
                </h3>

                <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed">
                  {currentStory.summary}
                </p>

                {/* Story Action Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div className="flex items-center gap-3 text-xs text-slate-300">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                      {currentStory.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 text-teal-400" />
                      {currentStory.comments.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectStoryPost) onSelectStoryPost(currentStory);
                      handleCloseStory();
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <span>Buka Postingan</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Overlay Arrows */}
            {activeStoryIndex !== null && activeStoryIndex > 0 && (
              <button
                type="button"
                onClick={handlePrevStory}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center z-20 backdrop-blur-xs"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {activeStoryIndex !== null && activeStoryIndex < storyPosts.length - 1 && (
              <button
                type="button"
                onClick={handleNextStory}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center z-20 backdrop-blur-xs"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
