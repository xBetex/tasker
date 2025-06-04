import { TaskStatus, TaskPriority } from './types';

export interface TaskAnalytics {
  completionRateByClient: {
    labels: string[];
    data: number[];
  };
  tasksByStatus: {
    labels: TaskStatus[];
    data: number[];
  };
  tasksByPriority: {
    labels: TaskPriority[];
    data: number[];
  };
  taskTrends: {
    labels: string[];
    completed: number[];
    created: number[];
  };
}

export interface ClientAnalytics {
  clientId: string;
  clientName: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  tasksByStatus: Record<TaskStatus, number>;
  tasksByPriority: Record<TaskPriority, number>;
}

export interface AnalyticsDashboardProps {
  startDate?: Date;
  endDate?: Date;
  selectedClients?: string[];
  onDateRangeChange?: (startDate: Date, endDate: Date) => void;
  onClientSelect?: (clientIds: string[]) => void;
} 