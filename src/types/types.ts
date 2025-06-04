export type TaskStatus = 'pending' | 'in progress' | 'completed' | 'awaiting client';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  date: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  client_id: string;
  sla_date?: string;
  completion_date?: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  origin: string;
  tasks: Task[];
}