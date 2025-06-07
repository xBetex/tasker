// app/components/FilterBar.tsx
import { TaskStatus, TaskPriority } from '@/types/types';

export type SLAFilter = 'all' | 'overdue' | 'due_today' | 'due_this_week' | 'no_sla' | 'on_track';

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
    <div className={`rounded-xl border-2 transition-all duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl' 
        : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg'
    }`}>
      {/* Header with title and clear button */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-blue-400' : 'bg-blue-500'}`}></div>
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            🔍 Filters
          </h2>
          {hasActiveFilters && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
            }`}>
              Active
            </span>
          )}
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
              darkMode 
                ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30' 
                : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
            }`}
          >
            🗑️ Clear All
          </button>
        )}
      </div>

      <div className="px-4 pb-4">
        {/* Search Section */}
        <div className="mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Client Search */}
            <div className="relative group">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                🏢 Search Clients
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Name, company, origin or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:ring-4 focus:ring-opacity-20 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400 focus:ring-blue-400 placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 placeholder-gray-500'
                  } ${searchTerm ? (darkMode ? 'border-blue-400' : 'border-blue-500') : ''}`}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      darkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                    }`}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Task Search */}
            <div className="relative group">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                📝 Search Tasks
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Task descriptions..."
                  value={taskFilter}
                  onChange={(e) => setTaskFilter(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:ring-4 focus:ring-opacity-20 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-green-400 focus:ring-green-400 placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500 placeholder-gray-500'
                  } ${taskFilter ? (darkMode ? 'border-green-400' : 'border-green-500') : ''}`}
                />
                {taskFilter && (
                  <button
                    onClick={() => setTaskFilter('')}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      darkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                    }`}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Filters Section */}
        <div className="mb-6">
          <h3 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            ⚡ Quick Filters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {/* Status Filter */}
            <div className="group">
              <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                📊 Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all' | 'active')}
                className={`w-full px-3 py-2.5 rounded-lg border-2 text-sm transition-all duration-200 focus:ring-4 focus:ring-opacity-20 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-400 focus:ring-purple-400' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                } ${statusFilter !== 'all' ? (darkMode ? 'border-purple-400' : 'border-purple-500') : ''}`}
              >
                <option value="all">All Statuses</option>
                <option value="active">🔄 Active (In Progress + Pending)</option>
                <option value="pending">🔴 Pending</option>
                <option value="in progress">🟡 In Progress</option>
                <option value="completed">🟢 Completed</option>
                <option value="awaiting client">🔵 Awaiting Client</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="group">
              <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                🚩 Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')}
                className={`w-full px-3 py-2.5 rounded-lg border-2 text-sm transition-all duration-200 focus:ring-4 focus:ring-opacity-20 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-orange-400 focus:ring-orange-400' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-orange-500'
                } ${priorityFilter !== 'all' ? (darkMode ? 'border-orange-400' : 'border-orange-500') : ''}`}
              >
                <option value="all">All Priorities</option>
                <option value="high">🔥 High</option>
                <option value="medium">🟠 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>

            {/* SLA Filter */}
            <div className="group">
              <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                ⏰ SLA Status
              </label>
              <select
                value={slaFilter}
                onChange={(e) => setSlaFilter(e.target.value as SLAFilter)}
                className={`w-full px-3 py-2.5 rounded-lg border-2 text-sm transition-all duration-200 focus:ring-4 focus:ring-opacity-20 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-yellow-400 focus:ring-yellow-400' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-yellow-500 focus:ring-yellow-500'
                } ${slaFilter !== 'all' ? (darkMode ? 'border-yellow-400' : 'border-yellow-500') : ''}`}
              >
                <option value="all">All SLA Status</option>
                <option value="overdue">🚨 Overdue</option>
                <option value="due_today">⚠️ Due Today</option>
                <option value="due_this_week">⏰ Due This Week</option>
                <option value="on_track">✅ On Track</option>
                <option value="no_sla">📝 No SLA Set</option>
              </select>
            </div>
          </div>
        </div>

        {/* Date Range Section */}
        <div className="mb-2">
          <h3 className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            📅 Date Range
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                From
              </label>
              <input
                type="date"
                value={dateRangeFilter.start}
                onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, start: e.target.value })}
                className={`w-full px-3 py-2.5 rounded-lg border-2 text-sm transition-all duration-200 focus:ring-4 focus:ring-opacity-20 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-teal-400 focus:ring-teal-400' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-teal-500'
                } ${dateRangeFilter.start ? (darkMode ? 'border-teal-400' : 'border-teal-500') : ''}`}
              />
            </div>
            
            <div className="flex items-center justify-center pt-6">
              <div className={`w-8 h-0.5 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
            </div>
            
            <div className="flex-1 w-full">
              <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                To
              </label>
              <input
                type="date"
                value={dateRangeFilter.end}
                onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, end: e.target.value })}
                className={`w-full px-3 py-2.5 rounded-lg border-2 text-sm transition-all duration-200 focus:ring-4 focus:ring-opacity-20 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-teal-400 focus:ring-teal-400' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-teal-500'
                } ${dateRangeFilter.end ? (darkMode ? 'border-teal-400' : 'border-teal-500') : ''}`}
              />
            </div>
            
            {(dateRangeFilter.start || dateRangeFilter.end) && (
              <div className="pt-6">
                <button
                  onClick={() => setDateRangeFilter({ start: '', end: '' })}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    darkMode 
                      ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                  title="Clear date range"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}