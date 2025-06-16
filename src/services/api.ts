import { Client, Task, TaskStatus, TaskPriority, Comment } from '@/types/types';
import { getCurrentCompletionDate } from '@/utils/dateUtils';

// Helper function to get current user info from localStorage
const getCurrentUserInfo = () => {
  try {
    const userStr = localStorage.getItem('taskdashboard_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return {
        id: user.id,
        username: user.username,
        role: user.role
      };
    }
  } catch (error) {
    // Error getting current user
  }
  return null;
};

const API_BASE_URL = 'http://localhost:8000';

interface CreateClientPayload {
  id: string;
  name: string;
  company: string;
  origin: string;
}

interface TaskPayload {
  date: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  client_id?: string;
  sla_date?: string;
  completion_date?: string;
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

interface CommentPayload {
  text: string;
  author?: string;
  createdBy?: {
    id: string;
    username: string;
    role: 'admin' | 'user';
  };
}

interface ApiError {
  detail: {
    type: string;
    loc: string[];
    msg: string;
    input: unknown;
  }[];
}

const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;
    
    // Handle array detail messages
    if (apiError.detail && Array.isArray(apiError.detail)) {
      return apiError.detail.map(err => err.msg).join(', ');
    }
    
    // Handle string detail messages
    if (typeof (error as Record<string, unknown>).detail === 'string') {
      return (error as Record<string, unknown>).detail as string;
    }
    
    // Handle empty objects or objects without detail
    const errorKeys = Object.keys(error);
    if (errorKeys.length === 0) {
      return 'Network error or server unavailable';
    }
    
    // Try to extract meaningful error message from object
    if ((error as Record<string, unknown>).message) {
      return (error as Record<string, unknown>).message as string;
    }
    
    // Return stringified object as last resort
    return JSON.stringify(error);
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
};

export const api = {
  async getClients(): Promise<Client[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/?limit=1000`);
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return response.json();
    } catch (error) {
      // Error fetching clients
      throw new Error(formatErrorMessage(error));
    }
  },

  async getAllClients(): Promise<Client[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/all`);
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return response.json();
    } catch (error) {
      // Error fetching all clients
      throw new Error(formatErrorMessage(error));
    }
  },

  async getClient(id: string): Promise<Client> {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      return response.json();
    } catch (error) {
      // Error fetching client
      throw new Error(formatErrorMessage(error));
    }
  },

  async createClientOnly(client: CreateClientPayload): Promise<Client> {
    try {
      const response = await fetch(`${API_BASE_URL}/clients-only/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(client),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      
      return response.json();
    } catch (error) {
      // Error creating client
      throw new Error(formatErrorMessage(error));
    }
  },

  async createClient(client: CreateClientPayload): Promise<Client> {
    try {
      const currentUser = getCurrentUserInfo();
      const clientWithUser = {
        ...client,
        createdBy: currentUser,
        createdAt: new Date().toISOString()
      };

      const response = await fetch(`${API_BASE_URL}/clients/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientWithUser),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      
      return response.json();
    } catch (error) {
      console.error('Error creating client:', error);
      throw new Error(formatErrorMessage(error));
    }
  },

  async createClientWithTasks(
    clientData: CreateClientPayload,
    tasks: Omit<TaskPayload, 'client_id'>[]
  ): Promise<Client> {
    try {
      // First create the client only
      const client = await this.createClientOnly(clientData);

      // Then create all tasks for this client
      const taskPromises = tasks.map(task =>
        this.createTask({
          ...task,
          client_id: client.id
        })
      );

      try {
        // Wait for all tasks to be created
        await Promise.all(taskPromises);
      } catch (taskError) {
        // If task creation fails, attempt to delete the client for rollback
        try {
          await this.deleteClient(client.id);
        } catch (rollbackError) {
          // Error during rollback
        }
        throw taskError;
      }

      // Return the updated client with tasks
      return this.getClient(client.id);
    } catch (error) {
      // Error in createClientWithTasks
      throw new Error(formatErrorMessage(error));
    }
  },

  async createTask(task: TaskPayload): Promise<Task> {
    try {
      const currentUser = getCurrentUserInfo();
      const taskWithUser = {
        ...task,
        createdBy: currentUser,
        lastModifiedBy: currentUser,
        creation_timestamp: new Date().toISOString()
      };

      const response = await fetch(`${API_BASE_URL}/tasks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskWithUser),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      
      return response.json();
    } catch (error) {
      // Error creating task
      throw new Error(formatErrorMessage(error));
    }
  },

  async createTasksForClient(clientId: string, tasks: Omit<TaskPayload, 'client_id'>[]): Promise<Task[]> {
    try {
      const taskPromises = tasks.map(task =>
        this.createTask({
          ...task,
          client_id: clientId
        })
      );
      return Promise.all(taskPromises);
    } catch (error) {
      // Error creating tasks for client
      throw new Error(formatErrorMessage(error));
    }
  },

  async updateTask(taskId: number, updates: Partial<TaskPayload>): Promise<Task> {
    try {
      if (!taskId || typeof taskId !== 'number') {
        throw new Error('Invalid task ID provided');
      }
      
      const currentUser = getCurrentUserInfo();
      const updatesWithUser = {
        ...updates,
        lastModifiedBy: currentUser
      };

      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatesWithUser),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let error;
        try {
          error = JSON.parse(errorText);
        } catch (parseError) {
          error = { detail: errorText || `HTTP ${response.status}: ${response.statusText}` };
        }
        throw error;
      }
      
      return response.json();
    } catch (error) {
      // Error updating task
      throw new Error(formatErrorMessage(error));
    }
  },

  async updateTaskStatus(taskId: number, status: TaskStatus, timezoneOffset?: number): Promise<Task> {
    if (!taskId || typeof taskId !== 'number') {
      throw new Error('Invalid task ID provided');
    }
    
    const updates: Partial<TaskPayload> = { status };
    
    // If marking as completed, set completion date in user's timezone
    if (status === 'completed') {
      updates.completion_date = getCurrentCompletionDate(timezoneOffset);
    }
    // If changing from completed to another status, clear completion date
    else {
      updates.completion_date = '';
    }
    
    return this.updateTask(taskId, updates);
  },

  async deleteTask(taskId: number): Promise<Task> {
    try {
      if (!taskId || typeof taskId !== 'number') {
        throw new Error('Invalid task ID provided');
      }
      
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let error;
        try {
          error = JSON.parse(errorText);
        } catch (parseError) {
          error = { detail: errorText || `HTTP ${response.status}: ${response.statusText}` };
        }
        throw error;
      }
      
      return response.json();
    } catch (error) {
      // Error deleting task
      throw new Error(formatErrorMessage(error));
    }
  },

  async deleteClient(clientId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${clientId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
    } catch (error) {
      // Error deleting client
      throw new Error(formatErrorMessage(error));
    }
  },

  async importData(): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/import-data/`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      
      return response.json();
    } catch (error) {
      // Error importing data
      throw new Error(formatErrorMessage(error));
    }
  },

  async updateClient(clientId: string, updates: Partial<CreateClientPayload>): Promise<Client> {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      
      return response.json();
    } catch (error) {
      // Error updating client
      throw new Error(formatErrorMessage(error));
    }
  },

  // Comment functions
  async createComment(taskId: number, comment: CommentPayload): Promise<Comment> {
    try {
      const currentUser = getCurrentUserInfo();
      const commentWithUser = {
        task_id: taskId,
        text: comment.text,
        author: currentUser?.username || comment.author || 'User',
        createdBy: currentUser,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/comments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentWithUser),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      
      return response.json();
    } catch (error) {
      // Error creating comment
      throw new Error(formatErrorMessage(error));
    }
  },

  async getTaskComments(taskId: number): Promise<Comment[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/comments/`);
      
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      
      return response.json();
    } catch (error) {
      // Error fetching comments
      throw new Error(formatErrorMessage(error));
    }
  },

  async deleteComment(commentId: string): Promise<Comment> {
    try {
      const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      
      return response.json();
    } catch (error) {
      // Error deleting comment
      throw new Error(formatErrorMessage(error));
    }
  },

  // Alias for createComment to maintain compatibility
  async addComment(taskId: number, commentText: string): Promise<Comment> {
    const currentUser = getCurrentUserInfo();
    return this.createComment(taskId, {
      text: commentText,
      author: currentUser?.username || 'User'
    });
  },
}; 