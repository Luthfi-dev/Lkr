import React, { useState } from 'react';
import { 
  BookOpen, 
  Heart, 
  Bookmark, 
  MessageCircle, 
  Share2, 
  Plus, 
  Tag, 
  Paperclip,
  AtSign,
  Filter,
  Search,
  CheckCircle2,
  TrendingUp,
  Flame,
  Globe,
  SlidersHorizontal
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Post, PostCategory } from '../types';
import { StoryReel } from './StoryReel';
import { QuickPostComposer } from './QuickPostComposer';
import { PostCard } from './PostCard';
import { ImageLightboxModal } from './ImageLightboxModal';
import { MobilePagination } from './MobilePagination';
import { PostCardSkeleton } from './SkeletonLoader';
import { isPostVisibleToUser } from '../utils/postPrivacy';

interface SharingViewProps {
  onOpenCreatePost: () => void;
}

export const SharingView: React.FC<SharingViewProps> = ({ onOpenCreatePost }) => {
  const {
    currentUser,
    isAuthenticated,
    setIsAuthModalOpen,
    posts,
    circles,
    activeCircleId,
    activeCircle,
    searchQuery,
    isInitialLoading,
    isRefreshingData,
    postCategories,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [onlyWithAttachments, setOnlyWithAttachments] = useState(false);
  const [feedPage, setFeedPage] = useState(1);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxPost, setLightboxPost] = useState<Post | null>(null);

  // Reset page when filters change
  React.useEffect(() => {
    setFeedPage(1);
  }, [selectedCategory, onlyWithAttachments, activeCircleId, searchQuery]);

  // Handle hash scrolling to post from notification
  React.useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#sharing/post/')) {
      const postId = hash.replace('#sharing/post/', '');
      setTimeout(() => {
        const el = document.getElementById(`post-${postId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-4', 'ring-teal-400', 'transition-all', 'duration-500');
          setTimeout(() => {
            el.classList.remove('ring-4', 'ring-teal-400');
          }, 3000);
        }
      }, 400);
    }
  }, [posts]);

  // Dynamic category list starting with 'Semua', followed by database categories, and ending with 'Tersimpan'
  const categories = [
    'Semua',
    ...postCategories.map((c) => c.name),
    'Tersimpan',
  ].filter((v, i, a) => a.indexOf(v) === i);

  // Get active circle members for mention autocompletion
  const availableMembers = activeCircle
    ? activeCircle.members
    : circles.flatMap((c) => c.members).filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);

  // Filter posts with privacy verification
  const filteredPosts = posts
    .filter((p) => isPostVisibleToUser(p, isAuthenticated, currentUser, circles))
    .filter((p) => (activeCircleId === 'all' ? true : p.circleId === activeCircleId))
    .filter((p) => {
      if (selectedCategory === 'Semua') return true;
      if (selectedCategory === 'Tersimpan') return p.savedByMe;
      return p.category === selectedCategory;
    })
    .filter((p) => {
      if (!onlyWithAttachments) return true;
      return p.attachments && p.attachments.length > 0;
    })
    .filter((p) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        (p.mentions && p.mentions.some((m) => m.toLowerCase().includes(q))) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });

  const handleOpenImageLightbox = (imageUrl: string, post: Post) => {
    setLightboxImage(imageUrl);
    setLightboxPost(post);
  };

  const handleCloseLightbox = () => {
    setLightboxImage(null);
    setLightboxPost(null);
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-teal-900 text-xs font-bold font-display">
            <BookOpen className="w-4 h-4 text-teal-700" />
            <span>Beranda Berbagi & Diskursus Tim</span>
          </div>
          <p className="text-xs text-slate-500">
            Kemudahan berbagi rangkuman buku, wawasan praktis, foto kegiatan, dan utas diskusi bertingkat.
          </p>
        </div>

        <button
          onClick={() => {
            if (!isAuthenticated) {
              setIsAuthModalOpen(true);
              return;
            }
            onOpenCreatePost();
          }}
          className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Bagikan</span>
        </button>
      </div>

      {/* 2. Instagram & Facebook Stories Reel (Authenticated Only) */}
      {isAuthenticated && (
        <StoryReel
          onOpenCreatePost={onOpenCreatePost}
          onSelectStoryPost={(p) => setSelectedCategory(p.category)}
        />
      )}

      {/* 3. Facebook Style Quick Post Composer ("What's on your mind?") */}
      {isAuthenticated && (
        <QuickPostComposer
          onOpenFullModal={onOpenCreatePost}
          availableMembers={availableMembers}
        />
      )}

      {/* 4. Filter Categories & Attachments Pills */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
        <div className="flex items-center gap-1.5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setOnlyWithAttachments(!onlyWithAttachments)}
          className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            onlyWithAttachments
              ? 'bg-teal-800 text-white border-teal-800 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <Paperclip className="w-3 h-3" />
          <span>Ada Berkas</span>
        </button>
      </div>

      {/* 5. Loading Skeletons */}
      {(isInitialLoading || (isRefreshingData && posts.length === 0)) ? (
        <div className="space-y-4">
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-800 flex items-center justify-center mx-auto text-xl font-bold">
            📖
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 text-sm">Belum Ada Postingan di Filter Ini</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Jadilah yang pertama membagikan wawasan, rangkuman buku, foto kegiatan, atau modul materi kepada rekan tim.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenCreatePost}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-teal-800 text-white text-xs font-semibold hover:bg-teal-900 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Tulis Postingan Sekarang
          </button>
        </div>
      ) : (
        /* 6. Feed Post Cards */
        <div className="space-y-4">
          {filteredPosts
            .slice((feedPage - 1) * 4, feedPage * 4)
            .map((post) => (
            <PostCard
              key={post.id}
              post={post}
              availableMembers={availableMembers}
              onOpenImageLightbox={handleOpenImageLightbox}
            />
          ))}

          {/* Mobile Feed Pagination */}
          <MobilePagination
            currentPage={feedPage}
            totalItems={filteredPosts.length}
            pageSize={4}
            onPageChange={setFeedPage}
            itemLabel="postingan wawasan"
            className="pt-2"
          />
        </div>
      )}

      {/* 7. Image Lightbox Modal */}
      {lightboxImage && (
        <ImageLightboxModal
          isOpen={!!lightboxImage}
          onClose={handleCloseLightbox}
          imageUrl={lightboxImage}
          post={lightboxPost || undefined}
        />
      )}
    </div>
  );
};
