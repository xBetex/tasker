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
  dateRangeFilter, // Add this
  setDateRangeFilter, // Add this
  slaFilter,
  setSlaFilter,
  darkMode
}: FilterBarProps) {
  return (
    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
      {/* Updated responsive layout - stack vertically on mobile, horizontal on sm+ */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search input */}
        <div className="flex-1">
          <label htmlFor="search" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Search Clients
          </label>
          <input
            type="text"
            id="search"
            placeholder="Search by name, company, origin or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`mt-1 block w-full rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
          />
        </div>

        {/* Task filter */}
        <div className="flex-1">
          <label htmlFor="task" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Filter by Task
          </label>
          <input
            type="text"
            id="task"
            placeholder="Search task descriptions"
            value={taskFilter}
            onChange={(e) => setTaskFilter(e.target.value)}
            className={`mt-1 block w-full rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
          />
        </div>

        {/* Status filter */}
        <div className="flex-1">
          <label htmlFor="status" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Filter by Status
          </label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all' | 'active')}
            className={`mt-1 block w-full rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active (In Progress + Pending)</option>
            <option value="pending">Pending</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="awaiting client">Awaiting Client</option>
          </select>
        </div>

        {/* Priority filter */}
        <div className="flex-1">
          <label htmlFor="priority" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Filter by Priority
          </label>
          <select
            id="priority"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')}
            className={`mt-1 block w-full rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* Second row for SLA and Date filters */}
      <div className="mt-4 flex flex-col lg:flex-row gap-4">
        {/* SLA Filter */}
        <div className="flex-1">
          <label htmlFor="sla" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Filter by SLA Status
          </label>
          <select
            id="sla"
            value={slaFilter}
            onChange={(e) => setSlaFilter(e.target.value as SLAFilter)}
            className={`mt-1 block w-full rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
          >
            <option value="all">All SLA Status</option>
            <option value="overdue">🚨 SLA Overdue</option>
            <option value="due_today">⚠️ Due Today</option>
            <option value="due_this_week">⏰ Due This Week</option>
            <option value="on_track">✅ On Track</option>
            <option value="no_sla">📝 No SLA Set</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="flex-1">
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Task Date Range
          </label>
          <div className="flex flex-col sm:flex-row gap-2 mt-1">
            <input
              type="date"
              value={dateRangeFilter.start}
              onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, start: e.target.value })}
              className={`block w-full rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
            />
            <span className="flex items-center justify-center text-sm">to</span>
            <input
              type="date"
              value={dateRangeFilter.end}
              onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, end: e.target.value })}
              className={`block w-full rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
            />
            <button
              onClick={() => setDateRangeFilter({ start: '', end: '' })}
              className={`px-3 py-2 rounded whitespace-nowrap ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
              title="Clear date range filter"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Clear All Filters Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => {
            setSearchTerm('');
            setTaskFilter('');
            setStatusFilter('all');
            setPriorityFilter('all');
            setSlaFilter('all');
            setDateRangeFilter({ start: '', end: '' });
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            darkMode 
              ? 'bg-gray-600 hover:bg-gray-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
}