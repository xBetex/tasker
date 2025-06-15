import React from 'react';
import { TaskStatus, TaskPriority } from '@/types/types';

interface DashboardStatsProps {
  activeTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  awaitingClientTasks: number;
  darkMode: boolean;
  onStatusFilterClick: (status: TaskStatus | 'all' | 'active') => void;
  onResetFilters: () => void;
  hasActiveFilters?: boolean;
  filteredClientsCount?: number;
  totalClientsCount?: number;
  totalActiveTasks?: number;
  totalCompletedTasks?: number;
  totalInProgressTasks?: number;
  totalPendingTasks?: number;
  totalAwaitingClientTasks?: number;
}

export default function DashboardStats({
  activeTasks,
  completedTasks,
  inProgressTasks,
  pendingTasks,
  awaitingClientTasks,
  darkMode,
  onStatusFilterClick,
  onResetFilters,
  hasActiveFilters = false,
  filteredClientsCount = 0,
  totalClientsCount = 0,
  totalActiveTasks = 0,
  totalCompletedTasks = 0,
  totalInProgressTasks = 0,
  totalPendingTasks = 0,
  totalAwaitingClientTasks = 0
}: DashboardStatsProps) {
  const statsCards = [
    {
      title: '🚀 Active',
      value: activeTasks,
      onClick: () => onStatusFilterClick('active'),
      hoverColor: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
      borderColor: darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'
    },
    {
      title: '⚡ In Progress',
      value: inProgressTasks,
      onClick: () => onStatusFilterClick('in progress'),
      hoverColor: darkMode ? 'rgba(234, 179, 8, 0.1)' : 'rgba(234, 179, 8, 0.05)',
      borderColor: darkMode ? 'rgba(234, 179, 8, 0.3)' : 'rgba(234, 179, 8, 0.2)'
    },
    {
      title: '✅ Completed',
      value: completedTasks,
      onClick: () => onStatusFilterClick('completed'),
      hoverColor: darkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
      borderColor: darkMode ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)'
    },
    {
      title: '⏳ Pending',
      value: pendingTasks,
      onClick: () => onStatusFilterClick('pending'),
      hoverColor: darkMode ? 'rgba(156, 163, 175, 0.1)' : 'rgba(156, 163, 175, 0.05)',
      borderColor: darkMode ? 'rgba(156, 163, 175, 0.3)' : 'rgba(156, 163, 175, 0.2)'
    },
    {
      title: '👤 Awaiting Client',
      value: awaitingClientTasks,
      onClick: () => onStatusFilterClick('awaiting client'),
      hoverColor: darkMode ? 'rgba(147, 51, 234, 0.1)' : 'rgba(147, 51, 234, 0.05)',
      borderColor: darkMode ? 'rgba(147, 51, 234, 0.3)' : 'rgba(147, 51, 234, 0.2)'
    }
  ];

  return (
    <div className="mb-6">
      {/* Filter Status Indicator */}
      {hasActiveFilters && (
        <div className="mb-4 p-3 rounded-lg border-2 border-dashed" 
             style={{
               backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.02)',
               borderColor: darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'
             }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium" style={{ color: 'var(--primary-text)' }}>
                Filtered Results: {filteredClientsCount} of {totalClientsCount} clients
              </span>
              <span className="text-xs px-2 py-1 rounded" style={{ 
                backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                color: 'var(--secondary-text)' 
              }}>
                                 Tasks: {activeTasks + completedTasks + inProgressTasks + pendingTasks + awaitingClientTasks} of {totalActiveTasks + totalCompletedTasks + totalInProgressTasks + totalPendingTasks + totalAwaitingClientTasks}
              </span>
            </div>
            <button
              onClick={onResetFilters}
              className="px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 hover:scale-105 border border-transparent"
              style={{ color: 'var(--secondary-text)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)';
                e.currentTarget.style.borderColor = darkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.color = darkMode ? 'rgb(248, 113, 113)' : 'rgb(220, 38, 38)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.color = 'var(--secondary-text)';
              }}
            >
              ⨯ Reset All Filters
            </button>
          </div>
        </div>
      )}
      
             {/* Statistics Cards */}
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statsCards.map((card, index) => (
          <button
            key={index}
            onClick={card.onClick}
            className="p-4 rounded-lg text-left transition-all duration-200 hover:scale-105 border relative"
            style={{
              backgroundColor: 'var(--card-background)',
              borderColor: 'var(--card-border)',
              color: 'var(--primary-text)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = card.hoverColor;
              e.currentTarget.style.borderColor = card.borderColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--card-background)';
              e.currentTarget.style.borderColor = 'var(--card-border)';
            }}
          >
            {hasActiveFilters && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
            <h3 
              className="font-semibold mb-2"
              style={{ color: 'var(--secondary-text)' }}
            >
              {card.title}
            </h3>
            <p 
              className="text-2xl font-bold"
              style={{ color: 'var(--primary-text)' }}
            >
              {card.value}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
} 