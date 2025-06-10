import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { DragDropProvider } from '@/app/contexts/DragDropContext'
import { NotificationProvider } from '@/app/contexts/NotificationContext'
import { Client, Task, TaskStatus, TaskPriority } from '@/types/types'

// Mock contexts provider wrapper
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <NotificationProvider>
      <DragDropProvider>
        {children}
      </DragDropProvider>
    </NotificationProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Test data factories
export const createMockTask = (overrides?: Partial<Task>): Task => ({
  id: Math.floor(Math.random() * 1000),
  date: '2024-01-15',
  description: 'Test task description',
  status: 'pending' as TaskStatus,
  priority: 'medium' as TaskPriority,
  client_id: 'test-client-1',
  sla_date: '2024-01-20',
  completion_date: undefined,
  comments: [],
  ...overrides,
})

export const createMockClient = (overrides?: Partial<Client>): Client => ({
  id: 'test-client-1',
  name: 'Test Client',
  company: 'Test Company',
  origin: 'website',
  tasks: [createMockTask()],
  ...overrides,
})

export const createMockClients = (count: number): Client[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockClient({
      id: `test-client-${index + 1}`,
      name: `Test Client ${index + 1}`,
      company: `Company ${index + 1}`,
      tasks: [
        createMockTask({
          id: index * 10 + 1,
          client_id: `test-client-${index + 1}`,
          status: index % 2 === 0 ? 'pending' : 'completed',
        })
      ]
    })
  )
}

// Mock API responses
export const mockApiResponses = {
  getClients: jest.fn(() => Promise.resolve(createMockClients(3))),
  getClient: jest.fn((id: string) => 
    Promise.resolve(createMockClient({ id }))
  ),
  createClient: jest.fn((client: Partial<Client>) => 
    Promise.resolve(createMockClient(client))
  ),
  updateClient: jest.fn((id: string, client: Partial<Client>) => 
    Promise.resolve(createMockClient({ id, ...client }))
  ),
  deleteClient: jest.fn(() => Promise.resolve(true)),
  addTask: jest.fn((clientId: string, task: Partial<Task>) => 
    Promise.resolve(createMockTask({ client_id: clientId, ...task }))
  ),
  updateTask: jest.fn((clientId: string, taskId: number, task: Partial<Task>) => 
    Promise.resolve(createMockTask({ id: taskId, client_id: clientId, ...task }))
  ),
  deleteTask: jest.fn(() => Promise.resolve(true)),
  addComment: jest.fn(() => Promise.resolve({
    id: 'comment-1',
    text: 'Test comment',
    timestamp: new Date().toISOString(),
    author: 'Test User'
  })),
}

// Mock the API module
jest.mock('@/services/api', () => ({
  api: mockApiResponses,
}))

// Helper to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

// Mock user interactions
export const mockUserEvent = {
  click: async (element: Element) => {
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.click(element)
  },
  type: async (element: Element, text: string) => {
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.change(element, { target: { value: text } })
  },
  submit: async (form: Element) => {
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.submit(form)
  },
}

// Test IDs constants for consistent testing
export const testIds = {
  // Main page
  clientCard: 'client-card',
  clientCardHeader: 'client-card-header',
  clientCardTasks: 'client-card-tasks',
  addClientButton: 'add-client-button',
  searchInput: 'search-input',
  statusFilter: 'status-filter',
  priorityFilter: 'priority-filter',
  
  // Client card
  expandButton: 'expand-button',
  editButton: 'edit-button',
  deleteButton: 'delete-button',
  pinButton: 'pin-button',
  
  // Task
  taskItem: 'task-item',
  taskStatus: 'task-status',
  taskPriority: 'task-priority',
  taskDescription: 'task-description',
  addTaskButton: 'add-task-button',
  
  // Modals
  modal: 'modal',
  modalCloseButton: 'modal-close-button',
  modalSaveButton: 'modal-save-button',
  modalCancelButton: 'modal-cancel-button',
  
  // Forms
  clientNameInput: 'client-name-input',
  clientCompanyInput: 'client-company-input',
  clientOriginInput: 'client-origin-input',
  taskDescriptionInput: 'task-description-input',
  taskDateInput: 'task-date-input',
  
  // Notifications
  toast: 'toast',
  toastMessage: 'toast-message',
  
  // Filters
  filterBar: 'filter-bar',
  clearFiltersButton: 'clear-filters-button',
  
  // View modes
  viewModeToggle: 'view-mode-toggle',
  infinityPoolToggle: 'infinity-pool-toggle',
} 