/**
 * API Integration Tests
 * Tests the main API functionality and data flow
 */

import { createMockClient, createMockTask, mockApiResponses } from '@/utils/test-utils'

describe('API Integration Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test
    Object.values(mockApiResponses).forEach(mock => {
      if (typeof mock === 'function' && 'mockClear' in mock) {
        mock.mockClear()
      }
    })
  })

  describe('Client Operations', () => {
    it('should fetch all clients', async () => {
      const { api } = await import('@/services/api')
      
      const clients = await api.getClients()
      
      expect(mockApiResponses.getClients).toHaveBeenCalled()
      expect(Array.isArray(clients)).toBe(true)
      expect(clients.length).toBe(3)
    })

    it('should fetch a single client by ID', async () => {
      const { api } = await import('@/services/api')
      const testId = 'test-client-1'
      
      const client = await api.getClient(testId)
      
      expect(mockApiResponses.getClient).toHaveBeenCalledWith(testId)
      expect(client.id).toBe(testId)
    })

    it('should create a new client', async () => {
      const { api } = await import('@/services/api')
      const newClientData = {
        name: 'New Test Client',
        company: 'New Test Company',
        origin: 'email'
      }
      
      const createdClient = await api.createClient(newClientData)
      
      expect(mockApiResponses.createClient).toHaveBeenCalledWith(newClientData)
      expect(createdClient.name).toBe(newClientData.name)
      expect(createdClient.company).toBe(newClientData.company)
    })

    it('should update an existing client', async () => {
      const { api } = await import('@/services/api')
      const clientId = 'test-client-1'
      const updateData = { name: 'Updated Client Name' }
      
      const updatedClient = await api.updateClient(clientId, updateData)
      
      expect(mockApiResponses.updateClient).toHaveBeenCalledWith(clientId, updateData)
      expect(updatedClient.id).toBe(clientId)
    })

    it('should delete a client', async () => {
      const { api } = await import('@/services/api')
      const clientId = 'test-client-1'
      
      const result = await api.deleteClient(clientId)
      
      expect(mockApiResponses.deleteClient).toHaveBeenCalledWith(clientId)
      expect(result).toBe(true)
    })
  })

  describe('Task Operations', () => {
    it('should add a new task to a client', async () => {
      const { api } = await import('@/services/api')
      const clientId = 'test-client-1'
      const newTaskData = {
        description: 'New test task',
        status: 'pending' as const,
        priority: 'high' as const,
        date: '2024-01-15'
      }
      
      const createdTask = await api.addTask(clientId, newTaskData)
      
      expect(mockApiResponses.addTask).toHaveBeenCalledWith(clientId, newTaskData)
      expect(createdTask.description).toBe(newTaskData.description)
      expect(createdTask.client_id).toBe(clientId)
    })

    it('should update an existing task', async () => {
      const { api } = await import('@/services/api')
      const clientId = 'test-client-1'
      const taskId = 1
      const updateData = { status: 'completed' as const }
      
      const updatedTask = await api.updateTask(clientId, taskId, updateData)
      
      expect(mockApiResponses.updateTask).toHaveBeenCalledWith(clientId, taskId, updateData)
      expect(updatedTask.id).toBe(taskId)
      expect(updatedTask.client_id).toBe(clientId)
    })

    it('should delete a task', async () => {
      const { api } = await import('@/services/api')
      const clientId = 'test-client-1'
      const taskId = 1
      
      const result = await api.deleteTask(clientId, taskId)
      
      expect(mockApiResponses.deleteTask).toHaveBeenCalledWith(clientId, taskId)
      expect(result).toBe(true)
    })
  })

  describe('Comment Operations', () => {
    it('should add a comment to a task', async () => {
      const { api } = await import('@/services/api')
      const clientId = 'test-client-1'
      const taskId = 1
      const commentText = 'This is a test comment'
      
      const comment = await api.addComment(clientId, taskId, commentText)
      
      expect(mockApiResponses.addComment).toHaveBeenCalledWith(clientId, taskId, commentText)
      expect(comment.text).toBe(commentText)
      expect(comment.id).toBeDefined()
      expect(comment.timestamp).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { api } = await import('@/services/api')
      
      // Mock a failing API call
      mockApiResponses.getClient.mockRejectedValueOnce(new Error('Network error'))
      
      await expect(api.getClient('invalid-id')).rejects.toThrow('Network error')
    })

    it('should handle missing client errors', async () => {
      const { api } = await import('@/services/api')
      
      // Mock a 404 response
      mockApiResponses.getClient.mockRejectedValueOnce(new Error('Client not found'))
      
      await expect(api.getClient('nonexistent-id')).rejects.toThrow('Client not found')
    })
  })

  describe('Data Validation', () => {
    it('should validate client data structure', async () => {
      const { api } = await import('@/services/api')
      
      const clients = await api.getClients()
      const client = clients[0]
      
      expect(client).toHaveProperty('id')
      expect(client).toHaveProperty('name')
      expect(client).toHaveProperty('company')
      expect(client).toHaveProperty('origin')
      expect(client).toHaveProperty('tasks')
      expect(Array.isArray(client.tasks)).toBe(true)
    })

    it('should validate task data structure', async () => {
      const { api } = await import('@/services/api')
      
      const client = await api.getClient('test-client-1')
      const task = client.tasks[0]
      
      expect(task).toHaveProperty('id')
      expect(task).toHaveProperty('description')
      expect(task).toHaveProperty('status')
      expect(task).toHaveProperty('priority')
      expect(task).toHaveProperty('date')
      expect(task).toHaveProperty('client_id')
      
      // Validate enum values
      expect(['pending', 'in progress', 'completed', 'awaiting client']).toContain(task.status)
      expect(['low', 'medium', 'high']).toContain(task.priority)
    })
  })
}) 