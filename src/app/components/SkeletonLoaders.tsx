import React from 'react';

// Individual skeleton components for reusability
export function SkeletonLine({ width = "100%", height = "16px", className = "" }: {
  width?: string;
  height?: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonCircle({ size = "40px", className = "" }: {
  size?: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

// Client Card Skeleton
export function ClientCardSkeleton() {
  return (
    <div 
      className="p-4 sm:p-6 rounded-lg shadow-lg border transition-all duration-300"
      style={{
        backgroundColor: 'var(--card-background)',
        borderColor: 'var(--card-border)'
      }}
    >
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <SkeletonLine width="60%" height="24px" className="mb-2" />
          <SkeletonLine width="40%" height="16px" />
        </div>
        <div className="flex gap-2">
          <SkeletonCircle size="32px" />
          <SkeletonCircle size="32px" />
          <SkeletonCircle size="32px" />
        </div>
      </div>

      {/* Progress bar skeleton */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <SkeletonLine width="30%" height="14px" />
          <SkeletonLine width="20%" height="14px" />
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 h-2 rounded-full animate-pulse" style={{ width: '45%' }} />
        </div>
        <div className="flex justify-between mt-2">
          <SkeletonLine width="25%" height="12px" />
          <SkeletonLine width="25%" height="12px" />
          <SkeletonLine width="25%" height="12px" />
        </div>
      </div>
    </div>
  );
}

// Task Item Skeleton
export function TaskItemSkeleton() {
  return (
    <div
      className="p-3 sm:p-4 rounded-lg border-l-4 border-t border-r border-b border-l-gray-400 transition-all duration-200"
      style={{
        backgroundColor: 'var(--card-background)',
        borderTopColor: 'var(--card-border)',
        borderRightColor: 'var(--card-border)', 
        borderBottomColor: 'var(--card-border)'
      }}
    >
      {/* Task header */}
      <div className="flex justify-between items-start mb-2">
        <SkeletonLine width="75%" height="18px" />
        <SkeletonCircle size="24px" />
      </div>

      {/* Status and priority badges */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <div className="px-3 py-1 rounded-full">
          <SkeletonLine width="60px" height="16px" />
        </div>
        <div className="px-3 py-1 rounded-full">
          <SkeletonLine width="50px" height="16px" />
        </div>
        <div className="px-3 py-1 rounded-full">
          <SkeletonLine width="70px" height="16px" />
        </div>
      </div>

      {/* Dates */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4 mb-2">
        <SkeletonLine width="120px" height="14px" />
        <SkeletonLine width="100px" height="14px" />
      </div>

      {/* Comments section */}
      <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--card-border)' }}>
        <SkeletonLine width="40%" height="14px" className="mb-2" />
        <div className="flex items-center gap-2">
          <SkeletonLine width="100%" height="32px" />
          <SkeletonCircle size="32px" />
        </div>
      </div>
    </div>
  );
}

// Expanded Client Card Skeleton (with tasks)
export function ExpandedClientCardSkeleton() {
  return (
    <div 
      className="p-4 sm:p-6 rounded-lg shadow-lg border transition-all duration-300"
      style={{
        backgroundColor: 'var(--card-background)',
        borderColor: 'var(--card-border)'
      }}
    >
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <SkeletonLine width="60%" height="24px" className="mb-2" />
          <SkeletonLine width="40%" height="16px" />
        </div>
        <div className="flex gap-2">
          <SkeletonCircle size="32px" />
          <SkeletonCircle size="32px" />
          <SkeletonCircle size="32px" />
        </div>
      </div>

      {/* Progress bar skeleton */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <SkeletonLine width="30%" height="14px" />
          <SkeletonLine width="20%" height="14px" />
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 h-2 rounded-full animate-pulse" style={{ width: '45%' }} />
        </div>
        <div className="flex justify-between mt-2">
          <SkeletonLine width="25%" height="12px" />
          <SkeletonLine width="25%" height="12px" />
          <SkeletonLine width="25%" height="12px" />
        </div>
      </div>

      {/* Tasks skeleton */}
      <div className="space-y-4">
        <TaskItemSkeleton />
        <TaskItemSkeleton />
        <TaskItemSkeleton />
      </div>

      {/* Add task button skeleton */}
      <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
        <SkeletonLine width="120px" height="36px" />
      </div>
    </div>
  );
}

// Loading grid for multiple cards
export function ClientCardsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <ClientCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Loading overlay for drag and drop
export function DragOverlaySkeleton() {
  return (
    <div 
      className="p-4 sm:p-6 rounded-lg shadow-2xl border-2 border-blue-300 dark:border-blue-600 opacity-90 transform rotate-3"
      style={{
        backgroundColor: 'var(--card-background)',
        borderColor: 'var(--primary-button)'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <SkeletonLine width="60%" height="24px" className="mb-2" />
          <SkeletonLine width="40%" height="16px" />
        </div>
        <div className="flex gap-2">
          <SkeletonCircle size="32px" />
          <SkeletonCircle size="32px" />
        </div>
      </div>
    </div>
  );
} 