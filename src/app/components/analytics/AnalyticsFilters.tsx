'use client'

import { Client, TaskStatus, TaskPriority } from '@/types/types';

interface AnalyticsFiltersProps {
  dateRange: { start: string; end: string };
  setDateRange: (range: { start: string; end: string }) => void;
  statusFilter: TaskStatus | 'all';
  setStatusFilter: (status: TaskStatus | 'all') => void;
  priorityFilter: TaskPriority | 'all';
  setPriorityFilter: (priority: TaskPriority | 'all') => void;
  clientSearch: string;
  setClientSearch: (search: string) => void;
  darkMode: boolean;
}

export default function AnalyticsFilters({
  dateRange,
  setDateRange,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  clientSearch,
  setClientSearch,
  darkMode,
}: AnalyticsFiltersProps) {
  return (
    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow mb-6`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range Filter */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Date Range
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className={`block w-full rounded-md text-sm ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
              } shadow-sm`}
            />
            <span className="flex items-center">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className={`block w-full rounded-md text-sm ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
              } shadow-sm`}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
            className={`block w-full rounded-md text-sm ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
            } shadow-sm`}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="awaiting client">Awaiting Client</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Priority
          </label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')}
            className={`block w-full rounded-md text-sm ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
            } shadow-sm`}
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Client Search */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Search Client
          </label>
          <input
            type="text"
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            placeholder="Search by name or company"
            className={`block w-full rounded-md text-sm ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
            } shadow-sm`}
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => {
            setDateRange({ start: '', end: '' });
            setStatusFilter('all');
            setPriorityFilter('all');
            setClientSearch('');
          }}
          className={`px-4 py-2 text-sm rounded-md ${
            darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
} 