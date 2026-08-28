import React from 'react';
import { X, Heart, MessageCircle, Download, Share2 } from 'lucide-react';
import { Post } from '../types';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  post?: Post;
  onLike?: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  post,
  onLike,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-150">
      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center justify-center">
        {/* Main Image Container */}
        <div className="relative max-h-[75vh] max-w-full flex items-center justify-center overflow-hidden rounded-2xl shadow-2xl">
          <img
            src={imageUrl}
            alt={post?.title || 'Foto Postingan'}
            referrerPolicy="no-referrer"
            className="max-h-[75vh] max-w-full object-contain rounded-2xl"
          />
        </div>

        {/* Post Context Bar underneath */}
        {post && (
          <div className="w-full max-w-2xl mt-3 bg-slate-900/90 border border-slate-800 text-white rounded-2xl p-3 flex items-center justify-between gap-4 backdrop-blur-md">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700 flex-shrink-0"
              />
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">{post.title}</div>
                <div className="text-[10px] text-slate-400">
                  Oleh {post.author.name} • {post.circleName}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {onLike && (
                <button
                  type="button"
                  onClick={onLike}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    post.likedByMe
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      post.likedByMe ? 'fill-rose-500 text-rose-500' : 'text-white'
                    }`}
                  />
                  <span>{post.likes}</span>
                </button>
              )}

              <a
                href={imageUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Buka Gambar Asli"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
