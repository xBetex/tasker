import { TaskStatus, TaskPriority } from '@/types/types';

interface TaskFiltersProps {
  statusFilter: 'all' | TaskStatus;
  priorityFilter: 'all' | TaskPriority;
  onStatusFilterChange: (status: 'all' | TaskStatus) => void;
  onPriorityFilterChange: (priority: 'all' | TaskPriority) => void;
  darkMode: boolean;
}

export default function TaskFilters({
  statusFilter,
  priorityFilter,
  onStatusFilterChange,
  onPriorityFilterChange,
  darkMode: _darkMode
}: TaskFiltersProps) {
  const statusOptions: ('all' | TaskStatus)[] = ['all', 'pending', 'in progress', 'completed', 'awaiting client'];
  const priorityOptions: ('all' | TaskPriority)[] = ['all', 'low', 'medium', 'high'];

  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in progress': return 'bg-yellow-500';
      case 'pending': return 'bg-gray-500';
      case 'awaiting client': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: TaskPriority): string => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      {/* Status Filter */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-2" style={{ color: 'var(--secondary-text)' }}>
          Filter by Status
        </label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => onStatusFilterChange(status)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 flex items-center ${
                statusFilter === status
                  ? 'ring-2 ring-blue-500 ring-opacity-50'
                  : 'hover:scale-105'
              }`}
              style={{
                backgroundColor: statusFilter === status 
                  ? 'var(--card-background-hover)' 
                  : 'var(--card-background)',
                border: '1px solid var(--card-border)',
                color: 'var(--primary-text)'
              }}
            >
              {status !== 'all' && (
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${getStatusColor(status as TaskStatus)}`}></span>
              )}
              {status === 'all' ? 'All Status' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Priority Filter */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-2" style={{ color: 'var(--secondary-text)' }}>
          Filter by Priority
        </label>
        <div className="flex flex-wrap gap-2">
          {priorityOptions.map((priority) => (
            <button
              key={priority}
              onClick={() => onPriorityFilterChange(priority)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 flex items-center ${
                priorityFilter === priority
                  ? 'ring-2 ring-blue-500 ring-opacity-50'
                  : 'hover:scale-105'
              }`}
              style={{
                backgroundColor: priorityFilter === priority 
                  ? 'var(--card-background-hover)' 
                  : 'var(--card-background)',
                border: '1px solid var(--card-border)',
                color: 'var(--primary-text)'
              }}
            >
              {priority !== 'all' && (
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${getPriorityColor(priority as TaskPriority)}`}></span>
              )}
              {priority === 'all' ? 'All Priority' : priority}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {(statusFilter !== 'all' || priorityFilter !== 'all') && (
        <div className="flex flex-col justify-end">
          <button
            onClick={() => {
              onStatusFilterChange('all');
              onPriorityFilterChange('all');
            }}
            className="px-3 py-1.5 text-xs rounded-lg transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: 'var(--card-background)',
              border: '1px solid var(--card-border)', 
              color: 'var(--secondary-text)'
            }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
} 