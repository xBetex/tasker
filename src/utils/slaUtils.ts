import { Task } from '@/types/types';

export type SLAStatus = 'overdue' | 'due_today' | 'due_this_week' | 'on_track' | 'no_sla';

export const getSLAStatus = (task: Task): SLAStatus => {
  // Se não tem SLA definido
  if (!task.sla_date) {
    return 'no_sla';
  }

  // Se a task já foi completada, não precisa verificar SLA
  if (task.status === 'completed') {
    return 'on_track';
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const slaDate = new Date(task.sla_date);
  const slaDateOnly = new Date(slaDate.getFullYear(), slaDate.getMonth(), slaDate.getDate());
  
  const diffTime = slaDateOnly.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'overdue';
  } else if (diffDays === 0) {
    return 'due_today';
  } else if (diffDays <= 7) {
    return 'due_this_week';
  } else {
    return 'on_track';
  }
};

export const getSLAStatusColor = (status: SLAStatus, darkMode: boolean = false): string => {
  switch (status) {
    case 'overdue':
      return darkMode ? 'text-red-400' : 'text-red-600';
    case 'due_today':
      return darkMode ? 'text-orange-400' : 'text-orange-600';
    case 'due_this_week':
      return darkMode ? 'text-yellow-400' : 'text-yellow-600';
    case 'on_track':
      return darkMode ? 'text-green-400' : 'text-green-600';
    case 'no_sla':
      return darkMode ? 'text-gray-400' : 'text-gray-500';
    default:
      return darkMode ? 'text-gray-400' : 'text-gray-500';
  }
};

export const getSLAStatusBadge = (status: SLAStatus): string => {
  switch (status) {
    case 'overdue':
      return '🚨';
    case 'due_today':
      return '⚠️';
    case 'due_this_week':
      return '⏰';
    case 'on_track':
      return '✅';
    case 'no_sla':
      return '📝';
    default:
      return '';
  }
};

export const getSLAStatusText = (status: SLAStatus): string => {
  switch (status) {
    case 'overdue':
      return 'Overdue';
    case 'due_today':
      return 'Due Today';
    case 'due_this_week':
      return 'Due This Week';
    case 'on_track':
      return 'On Track';
    case 'no_sla':
      return 'No SLA';
    default:
      return '';
  }
};

export const getDaysUntilSLA = (task: Task): number | null => {
  if (!task.sla_date || task.status === 'completed') {
    return null;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const slaDate = new Date(task.sla_date);
  const slaDateOnly = new Date(slaDate.getFullYear(), slaDate.getMonth(), slaDate.getDate());
  
  const diffTime = slaDateOnly.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}; 