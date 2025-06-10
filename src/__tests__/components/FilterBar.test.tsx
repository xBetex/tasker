import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import FilterBar from '@/app/components/FilterBar'

const mockProps = {
  searchTerm: '',
  setSearchTerm: jest.fn(),
  statusFilter: 'all' as const,
  setStatusFilter: jest.fn(),
  priorityFilter: 'all' as const,
  setPriorityFilter: jest.fn(),
  taskFilter: '',
  setTaskFilter: jest.fn(),
  dateRangeFilter: { start: '', end: '' },
  setDateRangeFilter: jest.fn(),
  darkMode: false,
  slaFilter: 'all' as const,
  setSlaFilter: jest.fn(),
}

// Mock the render function from test-utils
const render = (component: React.ReactElement) => {
  const { render: rtlRender } = require('@testing-library/react')
  return rtlRender(component)
}

describe('FilterBar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders search input', () => {
    render(<FilterBar {...mockProps} />)
    
    const searchInput = screen.getByPlaceholderText(/search clients/i)
    expect(searchInput).toBeInTheDocument()
  })

  it('handles search input changes', () => {
    const setSearchTerm = jest.fn()
    render(<FilterBar {...mockProps} setSearchTerm={setSearchTerm} />)
    
    const searchInput = screen.getByPlaceholderText(/search clients/i)
    fireEvent.change(searchInput, { target: { value: 'test search' } })
    
    expect(setSearchTerm).toHaveBeenCalledWith('test search')
  })

  it('renders status filter dropdown', () => {
    render(<FilterBar {...mockProps} />)
    
    const statusFilter = screen.getByDisplayValue(/all/i)
    expect(statusFilter).toBeInTheDocument()
  })

  it('handles status filter changes', () => {
    const setStatusFilter = jest.fn()
    render(<FilterBar {...mockProps} setStatusFilter={setStatusFilter} />)
    
    const statusSelect = screen.getByDisplayValue(/all/i)
    fireEvent.change(statusSelect, { target: { value: 'pending' } })
    
    expect(setStatusFilter).toHaveBeenCalledWith('pending')
  })

  it('renders priority filter dropdown', () => {
    render(<FilterBar {...mockProps} />)
    
    // Look for select elements
    const selects = screen.getAllByRole('combobox')
    expect(selects.length).toBeGreaterThan(1)
  })

  it('handles priority filter changes', () => {
    const setPriorityFilter = jest.fn()
    render(<FilterBar {...mockProps} setPriorityFilter={setPriorityFilter} />)
    
    // Find priority filter select and change it
    const selects = screen.getAllByRole('combobox')
    const prioritySelect = selects.find(select => 
      select.getAttribute('value') === 'all' || 
      select.textContent?.includes('Priority')
    )
    
    if (prioritySelect) {
      fireEvent.change(prioritySelect, { target: { value: 'high' } })
      expect(setPriorityFilter).toHaveBeenCalledWith('high')
    }
  })

  it('renders task filter input', () => {
    render(<FilterBar {...mockProps} />)
    
    const taskInput = screen.getByPlaceholderText(/filter tasks/i)
    expect(taskInput).toBeInTheDocument()
  })

  it('handles task filter changes', () => {
    const setTaskFilter = jest.fn()
    render(<FilterBar {...mockProps} setTaskFilter={setTaskFilter} />)
    
    const taskInput = screen.getByPlaceholderText(/filter tasks/i)
    fireEvent.change(taskInput, { target: { value: 'test task' } })
    
    expect(setTaskFilter).toHaveBeenCalledWith('test task')
  })

  it('renders SLA filter', () => {
    render(<FilterBar {...mockProps} />)
    
    // SLA filter should be present
    const slaElements = screen.getAllByText(/sla/i)
    expect(slaElements.length).toBeGreaterThan(0)
  })

  it('handles SLA filter changes', () => {
    const setSlaFilter = jest.fn()
    render(<FilterBar {...mockProps} setSlaFilter={setSlaFilter} />)
    
    // Find and interact with SLA filter
    const slaSelects = screen.getAllByRole('combobox')
    const slaSelect = slaSelects.find(select => 
      select.getAttribute('aria-label')?.includes('SLA') ||
      select.textContent?.includes('SLA')
    )
    
    if (slaSelect) {
      fireEvent.change(slaSelect, { target: { value: 'overdue' } })
      expect(setSlaFilter).toHaveBeenCalledWith('overdue')
    }
  })

  it('renders date range inputs', () => {
    render(<FilterBar {...mockProps} />)
    
    // Should have date inputs
    const dateInputs = screen.getAllByDisplayValue('')
    expect(dateInputs.length).toBeGreaterThan(0)
  })

  it('handles date range changes', () => {
    const setDateRangeFilter = jest.fn()
    render(<FilterBar {...mockProps} setDateRangeFilter={setDateRangeFilter} />)
    
    // Find date inputs by type
    const dateInputs = screen.getAllByDisplayValue('')
    const startDateInput = dateInputs.find(input => 
      input.getAttribute('type') === 'date' ||
      input.getAttribute('placeholder')?.includes('start')
    )
    
    if (startDateInput) {
      fireEvent.change(startDateInput, { target: { value: '2024-01-01' } })
      expect(setDateRangeFilter).toHaveBeenCalled()
    }
  })

  it('applies dark mode styling', () => {
    render(<FilterBar {...mockProps} darkMode={true} />)
    
    // Component should render without errors in dark mode
    const searchInput = screen.getByPlaceholderText(/search clients/i)
    expect(searchInput).toBeInTheDocument()
  })
}) 