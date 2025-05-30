import { Client, Task } from '@/types/types';

const API_BASE_URL = 'http://localhost:8000';

export const api = {
  async getClients(): Promise<Client[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/`);
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },

  async getClient(id: string): Promise<Client> {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch client');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching client:', error);
      throw error;
    }
  },

  async createClient(client: Omit<Client, 'id'> & { tasks: Omit<Task, 'id'>[]}): Promise<Client> {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(client),
      });
      if (!response.ok) {
        throw new Error('Failed to create client');
      }
      return response.json();
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  },

  async importData(): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/import-data/`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to import data');
      }
      return response.json();
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }
}; 