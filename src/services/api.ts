import { Client, Task, TaskStatus, TaskPriority } from '@/types/types';

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
}

interface ApiError {
  detail: {
    type: string;
    loc: string[];
    msg: string;
    input: any;
  }[];
}

const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;
    if (apiError.detail && Array.isArray(apiError.detail)) {
      return apiError.detail.map(err => err.msg).join(', ');
    }
    
    // Handle string detail messages
    if (typeof (error as any).detail === 'string') {
      return (error as any).detail;
    }
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
      console.error('Error fetching clients:', error);
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
      console.error('Error fetching all clients:', error);
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
      console.error('Error fetching client:', error);
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
      console.error('Error creating client:', error);
      throw new Error(formatErrorMessage(error));
    }
  },

  async createClient(client: CreateClientPayload): Promise<Client> {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/`, {
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
          console.error('Error during rollback:', rollbackError);
        }
        throw taskError;
      }

      // Return the updated client with tasks
      return this.getClient(client.id);
    } catch (error) {
      console.error('Error in createClientWithTasks:', error);
      throw new Error(formatErrorMessage(error));
    }
  },

  async createTask(task: TaskPayload): Promise<Task> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      
      return response.json();
    } catch (error) {
      console.error('Error creating task:', error);
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
      console.error('Error creating tasks for client:', error);
      throw new Error(formatErrorMessage(error));
    }
  },

  async updateTask(taskId: number, updates: Partial<TaskPayload>): Promise<Task> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
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
      console.error('Error updating task:', error);
      throw new Error(formatErrorMessage(error));
    }
  },

  async updateTaskStatus(taskId: number, status: TaskStatus): Promise<Task> {
    return this.updateTask(taskId, { status });
  },

  async deleteTask(taskId: number): Promise<Task> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw error;
      }
      
      return response.json();
    } catch (error) {
      console.error('Error deleting task:', error);
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
      console.error('Error deleting client:', error);
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
      console.error('Error importing data:', error);
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
      console.error('Error updating client:', error);
      throw new Error(formatErrorMessage(error));
    }
  },
}; 