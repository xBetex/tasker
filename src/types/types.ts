export type TaskStatus = 'pending' | 'in progress' | 'completed' | 'awaiting client';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Comment {
  id: string;
  text: string;
  timestamp: string;
  author?: string;
  createdBy?: {
    id: string;
    username: string;
    role: 'admin' | 'user';
  };
}

export interface Task {
  id: number;
  date: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  client_id: string;
  sla_date?: string;
  completion_date?: string;
  creation_timestamp?: string;
  completion_timestamp?: string;
  comments?: Comment[];
  attachments?: {
    id: string;
    filename: string;
    url: string;
    type: 'image' | 'document' | 'other';
    size: number;
    uploadedAt: string;
    uploadedBy?: string;
  }[];
  createdBy?: {
    id: string;
    username: string;
    role: 'admin' | 'user';
  };
  lastModifiedBy?: {
    id: string;
    username: string;
    role: 'admin' | 'user';
  };
}

export interface Client {
  id: string;
  name: string;
  company: string;
  origin: string;
  tasks: Task[];
  createdBy?: {
    id: string;
    username: string;
    role: 'admin' | 'user';
  };
  createdAt?: string;
}

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}