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
      {/* Update grid-cols to accommodate the new date range filter */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Existing search input (reduce col-span) */}
        <div>
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

        {/* Existing task filter */}
        <div>
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

        {/* Date Range Filter */}
        <div className="md:col-span-2">
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Task Date Range
          </label>
          <div className="flex gap-2 mt-1">
            <input
              type="date"
              value={dateRangeFilter.start}
              onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, start: e.target.value })}
              className={`block w-full rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
            />
            <span className="flex items-center">to</span>
            <input
              type="date"
              value={dateRangeFilter.end}
              onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, end: e.target.value })}
              className={`block w-full rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
            />
            <button
              onClick={() => setDateRangeFilter({ start: '', end: '' })}
              className={`px-2 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Existing status filter */}
        <div>
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

        {/* Existing priority filter */}
        <div>
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
    </div>
  );
}