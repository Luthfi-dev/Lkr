import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowDown } from 'lucide-react';

export interface MobilePaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  // Optional load-more mode
  mode?: 'paged' | 'loadMore' | 'combined';
  visibleCount?: number;
  onLoadMore?: () => void;
  itemLabel?: string;
  className?: string;
}

export const MobilePagination: React.FC<MobilePaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  mode = 'paged',
  visibleCount,
  onLoadMore,
  itemLabel = 'data',
  className = '',
}) => {
  if (totalItems <= pageSize && (!visibleCount || visibleCount >= totalItems)) {
    return null;
  }

  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);
  const currentShowing = visibleCount ? Math.min(visibleCount, totalItems) : endIndex;

  if (mode === 'loadMore' && onLoadMore) {
    const hasMore = currentShowing < totalItems;
    const remaining = totalItems - currentShowing;

    return (
      <div className={`pt-3 flex flex-col items-center gap-2.5 ${className}`}>
        <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
          <span>Menampilkan</span>
          <span className="font-bold text-slate-800">{currentShowing}</span>
          <span>dari</span>
          <span className="font-bold text-slate-800">{totalItems}</span>
          <span>{itemLabel}</span>
        </div>

        {/* Progress meter */}
        <div className="w-44 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-700 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (currentShowing / totalItems) * 100)}%` }}
          />
        </div>

        {hasMore ? (
          <button
            type="button"
            onClick={onLoadMore}
            className="mt-1 px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 hover:border-teal-700/40"
          >
            <ArrowDown className="w-3.5 h-3.5 text-teal-700 animate-bounce" />
            <span>Muat Lebih Banyak (+{Math.min(remaining, pageSize)} {itemLabel})</span>
          </button>
        ) : (
          <span className="text-[11px] text-slate-400 font-medium py-1">
            ✓ Seluruh {totalItems} {itemLabel} telah dimuat
          </span>
        )}
      </div>
    );
  }

  // Paged navigation mode
  // Build page numbers array with intelligent ellipsis
  const getPageNumbers = () => {
    const delta = 1;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <div
      className={`bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}
    >
      {/* Count details */}
      <div className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
        <span>
          Menampilkan <strong className="text-slate-900">{startIndex}-{endIndex}</strong> dari <strong className="text-slate-900">{totalItems}</strong> {itemLabel}
        </span>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* First page button */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Halaman Pertama"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2.5 h-8 rounded-xl flex items-center justify-center gap-1 text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-bold disabled:opacity-30 disabled:pointer-events-none transition-colors active:scale-95"
          title="Sebelumnya"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page pills */}
        <div className="flex items-center gap-1 px-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots_${idx}`} className="px-1 text-xs text-slate-400 font-bold">
                  ...
                </span>
              );
            }
            const pageNum = Number(p);
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-teal-800 text-white shadow-xs scale-105'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2.5 h-8 rounded-xl flex items-center justify-center gap-1 text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-bold disabled:opacity-30 disabled:pointer-events-none transition-colors active:scale-95"
          title="Berikutnya"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last page button */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Halaman Terakhir"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
