import { Task } from '@/types/types';

interface TaskStatsProps {
  tasks: Task[];
  darkMode: boolean;
  onStatsCardClick?: (statType: string) => void;
}

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  awaitingClient: number;
  progress: number;
}

export default function TaskStats({ tasks, darkMode, onStatsCardClick }: TaskStatsProps) {
  const getTaskStats = (): TaskStats => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in progress').length;
    const awaitingClient = tasks.filter(t => t.status === 'awaiting client').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, pending, inProgress, awaitingClient, progress };
  };

  const stats = getTaskStats();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
      <div
        className="p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105"
        style={{
          backgroundColor: 'var(--card-background-hover)',
          border: '1px solid var(--card-border)'
        }}
        onClick={() => onStatsCardClick?.('total')}
      >
        <div className="text-2xl font-bold" style={{ color: 'var(--primary-text)' }}>
          {stats.total}
        </div>
        <div className="text-xs" style={{ color: 'var(--secondary-text)' }}>
          Total Tasks
        </div>
      </div>

      <div
        className="p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105"
        style={{
          backgroundColor: 'var(--card-background-hover)',
          border: '1px solid var(--card-border)'
        }}
        onClick={() => onStatsCardClick?.('completed')}
      >
        <div className="text-2xl font-bold text-green-600">
          {stats.completed}
        </div>
        <div className="text-xs" style={{ color: 'var(--secondary-text)' }}>
          Completed
        </div>
      </div>

      <div
        className="p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105"
        style={{
          backgroundColor: 'var(--card-background-hover)',
          border: '1px solid var(--card-border)'
        }}
        onClick={() => onStatsCardClick?.('pending')}
      >
        <div className="text-2xl font-bold text-gray-500">
          {stats.pending}
        </div>
        <div className="text-xs" style={{ color: 'var(--secondary-text)' }}>
          Pending
        </div>
      </div>

      <div
        className="p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105"
        style={{
          backgroundColor: 'var(--card-background-hover)',
          border: '1px solid var(--card-border)'
        }}
        onClick={() => onStatsCardClick?.('in-progress')}
      >
        <div className="text-2xl font-bold text-yellow-600">
          {stats.inProgress}
        </div>
        <div className="text-xs" style={{ color: 'var(--secondary-text)' }}>
          In Progress
        </div>
      </div>

      <div
        className="p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105"
        style={{
          backgroundColor: 'var(--card-background-hover)',
          border: '1px solid var(--card-border)'
        }}
        onClick={() => onStatsCardClick?.('awaiting')}
      >
        <div className="text-2xl font-bold text-blue-600">
          {stats.awaitingClient}
        </div>
        <div className="text-xs" style={{ color: 'var(--secondary-text)' }}>
          Awaiting Client
        </div>
      </div>

      {/* Progress Bar */}
      <div className="col-span-2 sm:col-span-5 mt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: 'var(--secondary-text)' }}>
            Overall Progress
          </span>
          <span className="text-sm font-semibold" style={{ color: 'var(--primary-text)' }}>
            {stats.progress}%
          </span>
        </div>
        <div 
          className="w-full bg-gray-200 rounded-full h-2.5"
          style={{
            backgroundColor: darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 1)'
          }}
        >
          <div
            className="bg-green-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${stats.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
} 