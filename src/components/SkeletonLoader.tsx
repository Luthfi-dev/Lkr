import React from 'react';

export const ShimmerPulse: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200/80 rounded-xl ${className}`} />
);

/**
 * Skeleton Loader for Feed Posts (Home & Sharing view)
 */
export const PostCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShimmerPulse className="w-10 h-10 rounded-2xl" />
          <div className="space-y-1.5">
            <ShimmerPulse className="w-28 h-3.5" />
            <ShimmerPulse className="w-20 h-2.5" />
          </div>
        </div>
        <ShimmerPulse className="w-16 h-5 rounded-full" />
      </div>

      {/* Content */}
      <div className="space-y-2 pt-1">
        <ShimmerPulse className="w-3/4 h-4 rounded-md" />
        <ShimmerPulse className="w-full h-3 rounded-md" />
        <ShimmerPulse className="w-5/6 h-3 rounded-md" />
      </div>

      {/* Media placeholder */}
      <ShimmerPulse className="w-full h-44 rounded-2xl" />

      {/* Actions footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <ShimmerPulse className="w-14 h-6 rounded-lg" />
          <ShimmerPulse className="w-14 h-6 rounded-lg" />
        </div>
        <ShimmerPulse className="w-8 h-6 rounded-lg" />
      </div>
    </div>
  );
};

/**
 * Skeleton Loader for Tasks / Checklists
 */
export const TaskCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <ShimmerPulse className="w-6 h-6 rounded-lg shrink-0" />
          <div className="space-y-1.5 flex-1">
            <ShimmerPulse className="w-48 h-3.5" />
            <ShimmerPulse className="w-32 h-2.5" />
          </div>
        </div>
        <ShimmerPulse className="w-14 h-5 rounded-full shrink-0" />
      </div>

      {/* Progress bar skeleton */}
      <div className="space-y-1 pt-1">
        <div className="flex justify-between">
          <ShimmerPulse className="w-16 h-2" />
          <ShimmerPulse className="w-8 h-2" />
        </div>
        <ShimmerPulse className="w-full h-2 rounded-full" />
      </div>
    </div>
  );
};

/**
 * Skeleton Loader for Leaderboard Podium & Member List
 */
export const LeaderboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top 3 Podium Skeleton */}
      <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <ShimmerPulse className="w-36 h-5 bg-teal-700/50" />
            <ShimmerPulse className="w-48 h-3 bg-teal-700/40" />
          </div>
          <ShimmerPulse className="w-24 h-7 rounded-xl bg-teal-700/50" />
        </div>

        {/* 3 Podium pillars */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-6">
          {/* Rank 2 */}
          <div className="flex flex-col items-center space-y-2">
            <ShimmerPulse className="w-14 h-14 rounded-full bg-teal-700/60" />
            <ShimmerPulse className="w-16 h-3 bg-teal-700/50" />
            <ShimmerPulse className="w-full h-24 rounded-2xl bg-teal-700/40" />
          </div>
          {/* Rank 1 */}
          <div className="flex flex-col items-center space-y-2">
            <ShimmerPulse className="w-16 h-16 rounded-full bg-teal-600/70" />
            <ShimmerPulse className="w-20 h-3.5 bg-teal-600/60" />
            <ShimmerPulse className="w-full h-32 rounded-2xl bg-teal-600/50" />
          </div>
          {/* Rank 3 */}
          <div className="flex flex-col items-center space-y-2">
            <ShimmerPulse className="w-14 h-14 rounded-full bg-teal-700/60" />
            <ShimmerPulse className="w-16 h-3 bg-teal-700/50" />
            <ShimmerPulse className="w-full h-20 rounded-2xl bg-teal-700/40" />
          </div>
        </div>
      </div>

      {/* List items skeleton */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              <ShimmerPulse className="w-6 h-6 rounded-md" />
              <ShimmerPulse className="w-10 h-10 rounded-full" />
              <div className="space-y-1.5">
                <ShimmerPulse className="w-28 h-3.5" />
                <ShimmerPulse className="w-20 h-2.5" />
              </div>
            </div>
            <ShimmerPulse className="w-16 h-6 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton for Circle / Group Cards
 */
export const CircleCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center gap-3">
        <ShimmerPulse className="w-12 h-12 rounded-2xl shrink-0" />
        <div className="space-y-2 flex-1">
          <ShimmerPulse className="w-32 h-4" />
          <ShimmerPulse className="w-24 h-3" />
        </div>
      </div>
      <ShimmerPulse className="w-full h-10 rounded-xl" />
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <ShimmerPulse className="w-20 h-4" />
        <ShimmerPulse className="w-20 h-7 rounded-xl" />
      </div>
    </div>
  );
};

/**
 * Skeleton for Financial Transactions / Kas Cards
 */
export const FinanceCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShimmerPulse className="w-10 h-10 rounded-xl shrink-0" />
          <div className="space-y-1.5">
            <ShimmerPulse className="w-36 h-3.5" />
            <ShimmerPulse className="w-24 h-2.5" />
          </div>
        </div>
        <ShimmerPulse className="w-24 h-5 rounded-lg" />
      </div>
    </div>
  );
};
