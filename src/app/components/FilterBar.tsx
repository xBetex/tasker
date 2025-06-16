// app/components/FilterBar.tsx
// React imports cleaned up
import { TaskStatus, TaskPriority } from '@/types/types';

export type SLAFilter = 'all' | 'overdue' | 'due_today' | 'due_this_week' | 'on_track' | 'no_sla';

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: TaskStatus | 'all' | 'active'; // Added 'active' for in-progress + pending
  setStatusFilter: (filter: TaskStatus | 'all' | 'active') => void;
  priorityFilter: TaskPriority | 'all';
  setPriorityFilter: (filter: TaskPriority | 'all') => void;
  taskFilter: string;
  setTaskFilter: (filter: string) => void;
  dateRangeFilter: { start: string; end: string }; // Add this
  setDateRangeFilter: (range: { start: string; end: string }) => void; // Add this
  slaFilter: SLAFilter;
  setSlaFilter: (filter: SLAFilter) => void;
  darkMode: boolean;
}

export default function FilterBar({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  taskFilter,
  setTaskFilter,
  dateRangeFilter,
  setDateRangeFilter,
  slaFilter,
  setSlaFilter,
  darkMode
}: FilterBarProps) {
  const hasActiveFilters = 
    searchTerm || 
    taskFilter || 
    statusFilter !== 'all' || 
    priorityFilter !== 'all' || 
    slaFilter !== 'all' || 
    dateRangeFilter.start || 
    dateRangeFilter.end;

  const clearAllFilters = () => {
    setSearchTerm('');
    setTaskFilter('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSlaFilter('all');
    setDateRangeFilter({ start: '', end: '' });
  };

  return (
    <div 
      className="mb-6 p-4 rounded-lg shadow-lg border transition-all duration-300 hover:shadow-xl"
      style={{
        backgroundColor: 'var(--card-background)',
        borderColor: 'var(--card-border)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--card-background)';
      }}
    >
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          <h3 
            className="text-base font-medium"
            style={{ color: 'var(--primary-text)' }}
          >
            Search & Filter
          </h3>
          {hasActiveFilters && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              <span 
                className="text-xs font-medium px-2 py-1 rounded-full"
                style={{
                  backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                  color: darkMode ? 'rgb(147, 197, 253)' : 'rgb(29, 78, 216)'
                }}
              >
                {(() => {
                  let count = 0;
                  if (searchTerm) count++;
                  if (taskFilter) count++;
                  if (statusFilter !== 'all') count++;
                  if (priorityFilter !== 'all') count++;
                  if (slaFilter !== 'all') count++;
                  if (dateRangeFilter.start || dateRangeFilter.end) count++;
                  return count;
                })()}
              </span>
            </div>
          )}
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 hover:scale-105 border border-transparent"
            style={{
              color: 'var(--secondary-text)'
            }}
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
            ⨯ Clear
          </button>
        )}
      </div>

      {/* Compact Search Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        {/* Client Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pl-8 rounded-md border text-sm transition-all duration-200 focus:ring-2 focus:ring-opacity-20 bg-transparent"
            style={{
              borderColor: searchTerm ? (darkMode ? 'rgb(96, 165, 250)' : 'rgb(59, 130, 246)') : 'var(--input-border)',
              color: 'var(--input-text)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = darkMode ? 'rgb(96, 165, 250)' : 'rgb(59, 130, 246)';
              e.currentTarget.style.boxShadow = darkMode ? '0 0 0 2px rgba(96, 165, 250, 0.1)' : '0 0 0 2px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = searchTerm ? (darkMode ? 'rgb(96, 165, 250)' : 'rgb(59, 130, 246)') : 'var(--input-border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1 h-3 bg-blue-500 rounded-full"></div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all duration-200 opacity-60 hover:opacity-100"
              style={{
                backgroundColor: 'var(--card-background-hover)',
                color: 'var(--secondary-text)'
              }}
            >
              ⨯
            </button>
          )}
        </div>

        {/* Task Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="📝 Search tasks..."
            value={taskFilter}
            onChange={(e) => setTaskFilter(e.target.value)}
            className="w-full px-3 py-2 pl-8 rounded-md border text-sm transition-all duration-200 focus:ring-2 focus:ring-opacity-20 bg-transparent"
            style={{
              borderColor: taskFilter ? (darkMode ? 'rgb(52, 211, 153)' : 'rgb(16, 185, 129)') : 'var(--input-border)',
              color: 'var(--input-text)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = darkMode ? 'rgb(52, 211, 153)' : 'rgb(16, 185, 129)';
              e.currentTarget.style.boxShadow = darkMode ? '0 0 0 2px rgba(52, 211, 153, 0.1)' : '0 0 0 2px rgba(16, 185, 129, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = taskFilter ? (darkMode ? 'rgb(52, 211, 153)' : 'rgb(16, 185, 129)') : 'var(--input-border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1 h-3 bg-green-500 rounded-full"></div>
          {taskFilter && (
            <button
              onClick={() => setTaskFilter('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all duration-200 opacity-60 hover:opacity-100"
              style={{
                backgroundColor: 'var(--card-background-hover)',
                color: 'var(--secondary-text)'
              }}
            >
              ⨯
            </button>
          )}
        </div>
      </div>

      {/* Compact Filters in 2 Columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all' | 'active')}
            className="w-full px-3 py-2 rounded-md border text-sm transition-all duration-200 focus:ring-2 focus:ring-opacity-20 bg-transparent"
            style={{
              borderColor: statusFilter !== 'all' ? (darkMode ? 'rgb(168, 85, 247)' : 'rgb(147, 51, 234)') : 'var(--input-border)',
              color: 'var(--input-text)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = darkMode ? 'rgb(168, 85, 247)' : 'rgb(147, 51, 234)';
              e.currentTarget.style.boxShadow = darkMode ? '0 0 0 2px rgba(168, 85, 247, 0.1)' : '0 0 0 2px rgba(147, 51, 234, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = statusFilter !== 'all' ? (darkMode ? 'rgb(168, 85, 247)' : 'rgb(147, 51, 234)') : 'var(--input-border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="awaiting client">Awaiting</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')}
            className="w-full px-3 py-2 rounded-md border text-sm transition-all duration-200 focus:ring-2 focus:ring-opacity-20 bg-transparent"
            style={{
              borderColor: priorityFilter !== 'all' ? (darkMode ? 'rgb(251, 146, 60)' : 'rgb(249, 115, 22)') : 'var(--input-border)',
              color: 'var(--input-text)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = darkMode ? 'rgb(251, 146, 60)' : 'rgb(249, 115, 22)';
              e.currentTarget.style.boxShadow = darkMode ? '0 0 0 2px rgba(251, 146, 60, 0.1)' : '0 0 0 2px rgba(249, 115, 22, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = priorityFilter !== 'all' ? (darkMode ? 'rgb(251, 146, 60)' : 'rgb(249, 115, 22)') : 'var(--input-border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* SLA Filter */}
        <div>
          <select
            value={slaFilter}
            onChange={(e) => setSlaFilter(e.target.value as SLAFilter)}
            className="w-full px-3 py-2 rounded-md border text-sm transition-all duration-200 focus:ring-2 focus:ring-opacity-20 bg-transparent"
            style={{
              borderColor: slaFilter !== 'all' ? (darkMode ? 'rgb(250, 204, 21)' : 'rgb(234, 179, 8)') : 'var(--input-border)',
              color: 'var(--input-text)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = darkMode ? 'rgb(250, 204, 21)' : 'rgb(234, 179, 8)';
              e.currentTarget.style.boxShadow = darkMode ? '0 0 0 2px rgba(250, 204, 21, 0.1)' : '0 0 0 2px rgba(234, 179, 8, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = slaFilter !== 'all' ? (darkMode ? 'rgb(250, 204, 21)' : 'rgb(234, 179, 8)') : 'var(--input-border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <option value="all">All SLA</option>
            <option value="overdue">Overdue</option>
            <option value="due_today">Due Today</option>
            <option value="due_this_week">Due Week</option>
            <option value="on_track">On Track</option>
            <option value="no_sla">No SLA</option>
          </select>
        </div>

        {/* Date Range Toggle */}
        <div>
          <button
            onClick={() => {
              const today = new Date();
              const weekAgo = new Date(today);
              weekAgo.setDate(today.getDate() - 7);
              
              if (dateRangeFilter.start || dateRangeFilter.end) {
                setDateRangeFilter({ start: '', end: '' });
              } else {
                setDateRangeFilter({
                  start: weekAgo.toISOString().split('T')[0],
                  end: today.toISOString().split('T')[0]
                });
              }
            }}
            className="w-full px-3 py-2 rounded-md border text-sm transition-all duration-200 focus:ring-2 focus:ring-opacity-20 text-left"
            style={{
              borderColor: (dateRangeFilter.start || dateRangeFilter.end) ? (darkMode ? 'rgb(45, 212, 191)' : 'rgb(20, 184, 166)') : 'var(--input-border)',
              color: 'var(--input-text)',
              backgroundColor: 'var(--card-background)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--card-background)';
            }}
          >
            {(dateRangeFilter.start || dateRangeFilter.end) ? '📅 Date Set' : '📅 Last Week'}
          </button>
        </div>
      </div>

      {/* Custom Date Range (Expandable) */}
      {(dateRangeFilter.start || dateRangeFilter.end) && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              type="date"
              value={dateRangeFilter.start}
              onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, start: e.target.value })}
              className="w-full px-3 py-2 rounded-md border text-sm transition-all duration-200 focus:ring-2 focus:ring-opacity-20 bg-transparent"
              style={{
                borderColor: 'var(--input-border)',
                color: 'var(--input-text)',
              }}
              placeholder="From"
            />
          </div>
          <div>
            <input
              type="date"
              value={dateRangeFilter.end}
              onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, end: e.target.value })}
              className="w-full px-3 py-2 rounded-md border text-sm transition-all duration-200 focus:ring-2 focus:ring-opacity-20 bg-transparent"
              style={{
                borderColor: 'var(--input-border)',
                color: 'var(--input-text)',
              }}
              placeholder="To"
            />
          </div>
        </div>
      )}
    </div>
  );
}