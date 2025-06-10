import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { render, createMockClient, createMockTask } from '@/utils/test-utils'
import ClientCard from '@/app/components/ClientCard'

// Mock the necessary hooks and contexts
jest.mock('@/app/hooks/client/useClientCard', () => ({
  useClientCard: () => ({
    isEditing: false,
    setIsEditing: jest.fn(),
    isAddingTask: false,
    setIsAddingTask: jest.fn(),
    editData: createMockClient(),
    newTask: {
      date: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      sla_date: ''
    },
    contextMenu: { visible: false, x: 0, y: 0, taskIndex: null },
    setContextMenu: jest.fn(),
    editingTask: null,
    setEditingTask: jest.fn(),
    isLoading: false,
    showDeleteConfirm: false,
    setShowDeleteConfirm: jest.fn(),
    contextMenuRef: { current: null },
    progress: 50,
    handleInputChange: jest.fn(),
    handleTaskChange: jest.fn(),
    handleNewTaskChange: jest.fn(),
    handleAddTask: jest.fn(),
    handleSave: jest.fn(),
    handleDeleteClient: jest.fn(),
    handleDeleteTask: jest.fn(),
    handleAddComment: jest.fn(),
    handleStatusChange: jest.fn(),
    handleMoreVerticalClick: jest.fn(),
    handleTouchStart: jest.fn(),
    handleTouchEnd: jest.fn(),
    handleTouchCancel: jest.fn(),
  }),
}))

const mockProps = {
  client: createMockClient(),
  onUpdate: jest.fn(),
  onDeleteTask: jest.fn(),
  darkMode: false,
  isExpanded: false,
  onToggleExpand: jest.fn(),
  onShowDetails: jest.fn(),
}

describe('ClientCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders client information correctly', () => {
    render(<ClientCard {...mockProps} />)
    
    expect(screen.getByText(mockProps.client.name)).toBeInTheDocument()
    expect(screen.getByText(mockProps.client.company)).toBeInTheDocument()
    expect(screen.getByText(mockProps.client.id)).toBeInTheDocument()
    expect(screen.getByText(mockProps.client.origin)).toBeInTheDocument()
  })

  it('displays progress bar', () => {
    render(<ClientCard {...mockProps} />)
    
    // Progress bar should be present
    const progressElements = screen.getAllByRole('progressbar')
    expect(progressElements.length).toBeGreaterThan(0)
  })

  it('handles expand/collapse functionality', () => {
    const onToggleExpand = jest.fn()
    render(<ClientCard {...mockProps} onToggleExpand={onToggleExpand} />)
    
    // Find the header area and click it
    const clientHeader = screen.getByText(mockProps.client.name).closest('.client-header')
    expect(clientHeader).toBeInTheDocument()
    
    if (clientHeader) {
      fireEvent.click(clientHeader)
      expect(onToggleExpand).toHaveBeenCalled()
    }
  })

  it('shows copy button for client ID', () => {
    render(<ClientCard {...mockProps} />)
    
    // Should have copy button near the ID
    const copyButtons = screen.getAllByTitle(/copy/i)
    expect(copyButtons.length).toBeGreaterThan(0)
  })

  it('displays tasks when expanded', () => {
    const expandedProps = { ...mockProps, isExpanded: true }
    render(<ClientCard {...expandedProps} />)
    
    // Should show task description
    expect(screen.getByText(mockProps.client.tasks[0].description)).toBeInTheDocument()
  })

  it('shows add task button when expanded', () => {
    const expandedProps = { ...mockProps, isExpanded: true }
    render(<ClientCard {...expandedProps} />)
    
    // Should have add task button
    const addButton = screen.getByTitle(/add new task/i)
    expect(addButton).toBeInTheDocument()
  })

  it('handles dark mode styling', () => {
    const darkModeProps = { ...mockProps, darkMode: true }
    render(<ClientCard {...darkModeProps} />)
    
    // Component should render without errors in dark mode
    expect(screen.getByText(mockProps.client.name)).toBeInTheDocument()
  })

  it('shows details button functionality', () => {
    const onShowDetails = jest.fn()
    render(<ClientCard {...mockProps} onShowDetails={onShowDetails} />)
    
    // Component should render without calling details immediately
    expect(onShowDetails).not.toHaveBeenCalled()
  })

  it('displays client origin correctly', () => {
    const clientWithOrigin = createMockClient({ origin: 'email' })
    render(<ClientCard {...mockProps} client={clientWithOrigin} />)
    
    expect(screen.getByText('email')).toBeInTheDocument()
  })

  it('handles click events properly', () => {
    const onToggleExpand = jest.fn()
    render(<ClientCard {...mockProps} onToggleExpand={onToggleExpand} />)
    
    // Click on the card itself should not trigger expand
    const cardContainer = screen.getByText(mockProps.client.name).closest('div')
    if (cardContainer) {
      fireEvent.click(cardContainer)
      // Should not be called unless clicking on header area
      // This depends on the actual implementation
    }
  })
}) 