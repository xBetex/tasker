// app/components/FilterBar.tsx
import { TaskStatus, TaskPriority } from '@/types/types';

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

      {/* Date Range Filter - Separate row for better mobile experience */}
      <div className="mt-4">
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
  );
}