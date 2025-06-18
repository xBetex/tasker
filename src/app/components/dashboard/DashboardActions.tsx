import React, { useRef } from 'react';
import { Client } from '@/types/types';
import ClientViewModeToggle, { ViewMode } from '../ClientViewModeToggle';

interface DashboardActionsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  useInfinityPool: boolean;
  onToggleInfinityPool: () => void;
  isClient: boolean;
  darkMode: boolean;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onClearDateFilter: () => void;
  hasDateFilter: boolean;
  onImportJSON: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExportJSON: () => void;
  onExportActiveTasks: () => void;
  onViewActiveExport: () => void;
  onExportFilteredActiveTasks: () => void;
  onViewFilteredActiveExport: () => void;
  isImporting: boolean;
  onAddClient: () => void;
  hasActiveFilters?: boolean;
}

export default function DashboardActions({
  viewMode,
  onViewModeChange,
  useInfinityPool,
  onToggleInfinityPool,
  isClient,
  darkMode,
  onExpandAll,
  onCollapseAll,
  onClearDateFilter,
  hasDateFilter,
  onImportJSON,
  onExportJSON,
  onExportActiveTasks,
  onViewActiveExport,
  onExportFilteredActiveTasks,
  onViewFilteredActiveExport,
  isImporting,
  onAddClient,
  hasActiveFilters
}: DashboardActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6">
      <div className="flex-1 flex flex-wrap gap-2">
        {viewMode === 'compact' && (
          <>
            <button
              onClick={onExpandAll}
              className="px-3 sm:px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:scale-105 border"
              style={{
                backgroundColor: 'var(--card-background)',
                borderColor: 'var(--card-border)',
                color: 'var(--secondary-text)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                e.currentTarget.style.color = 'var(--primary-text)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--card-background)';
                e.currentTarget.style.color = 'var(--secondary-text)';
              }}
            >
              <span className="hidden sm:inline">📂 Open All Cards</span>
              <span className="sm:hidden">📂 Open All</span>
            </button>
            <button
              onClick={onCollapseAll}
              className="px-3 sm:px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:scale-105 border"
              style={{
                backgroundColor: 'var(--card-background)',
                borderColor: 'var(--card-border)',
                color: 'var(--secondary-text)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                e.currentTarget.style.color = 'var(--primary-text)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--card-background)';
                e.currentTarget.style.color = 'var(--secondary-text)';
              }}
            >
              <span className="hidden sm:inline">📁 Collapse All</span>
              <span className="sm:hidden">📁 Close All</span>
            </button>
          </>
        )}
        {hasDateFilter && (
          <button
            onClick={onClearDateFilter}
            className="px-3 sm:px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:scale-105 border"
            style={{
              backgroundColor: 'var(--card-background)',
              borderColor: 'var(--card-border)',
              color: 'var(--secondary-text)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)';
              e.currentTarget.style.borderColor = darkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.color = darkMode ? 'rgb(248, 113, 113)' : 'rgb(220, 38, 38)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--card-background)';
              e.currentTarget.style.borderColor = 'var(--card-border)';
              e.currentTarget.style.color = 'var(--secondary-text)';
            }}
          >
            <span className="hidden sm:inline">🗑️ Clear Date Filter</span>
            <span className="sm:hidden">🗑️ Clear Date</span>
          </button>
        )}
      </div>
      
      <div className="flex items-center justify-center sm:justify-end space-x-2 sm:space-x-4">
        <ClientViewModeToggle
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          darkMode={darkMode}
        />
        
        {viewMode === 'compact' && isClient && (
          <button
            onClick={onToggleInfinityPool}
            className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
              useInfinityPool
                ? darkMode 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
                : darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title={useInfinityPool ? 'Switch to Traditional Cards' : 'Switch to Infinity Pool (Virtual Scrolling)'}
          >
            <span className="hidden sm:inline">
              {useInfinityPool ? '♾️ Pool' : '📋 Standard'}
            </span>
            <span className="sm:hidden">
              {useInfinityPool ? '♾️' : '📋'}
            </span>
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={onImportJSON}
          accept=".json"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
            darkMode 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-green-500 hover:bg-green-600'
          } text-white disabled:opacity-50`}
        >
          <span className="hidden sm:inline">{isImporting ? 'Importing...' : 'Import JSON'}</span>
          <span className="sm:hidden">{isImporting ? 'Import...' : '📥'}</span>
        </button>
        <button
          onClick={onExportJSON}
          className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
            darkMode 
              ? 'bg-purple-600 hover:bg-purple-700' 
              : 'bg-purple-500 hover:bg-purple-600'
          } text-white`}
        >
          <span className="hidden sm:inline">Export JSON</span>
          <span className="sm:hidden">📤</span>
        </button>
        <button
          onClick={onViewActiveExport}
          className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
            darkMode 
              ? 'bg-orange-700 hover:bg-orange-800' 
              : 'bg-orange-600 hover:bg-orange-700'
          } text-white`}
          title="Preview active tasks export before copying"
        >
          <span className="hidden sm:inline">View Active Export</span>
          <span className="sm:hidden">👁️</span>
        </button>
        <button
          onClick={onExportActiveTasks}
          className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
            darkMode 
              ? 'bg-orange-600 hover:bg-orange-700' 
              : 'bg-orange-500 hover:bg-orange-600'
          } text-white`}
          title="Export only active tasks (non-completed) from currently displayed clients"
        >
          <span className="hidden sm:inline">Export Active Tasks</span>
          <span className="sm:hidden">🚀</span>
        </button>
        {hasActiveFilters && (
          <>
            <button
              onClick={onViewFilteredActiveExport}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
                darkMode 
                  ? 'bg-teal-700 hover:bg-teal-800' 
                  : 'bg-teal-600 hover:bg-teal-700'
              } text-white`}
              title="Preview filtered active tasks export before copying"
            >
              <span className="hidden sm:inline">View Filtered Export</span>
              <span className="sm:hidden">👁️</span>
            </button>
            <button
              onClick={onExportFilteredActiveTasks}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
                darkMode 
                  ? 'bg-teal-600 hover:bg-teal-700' 
                  : 'bg-teal-500 hover:bg-teal-600'
              } text-white`}
              title="Export only active tasks matching current filters"
            >
              <span className="hidden sm:inline">Export Filtered Active</span>
              <span className="sm:hidden">🎯</span>
            </button>
          </>
        )}
        <button
          onClick={onAddClient}
          className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
            darkMode 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
        >
          <span className="hidden sm:inline">+ Add Client</span>
          <span className="sm:hidden">+</span>
        </button>
      </div>
    </div>
  );
} 