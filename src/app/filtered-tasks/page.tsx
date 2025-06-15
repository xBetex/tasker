'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { Client, Task, TaskStatus } from '@/types/types';
import { api } from '@/services/api';
import { useDarkMode } from '../layout';
import AuthGuard from '../components/auth/AuthGuard';
import { usePersistedFilters } from '../hooks/usePersistedFilters';
import { useTaskFilters } from '../hooks/useTaskFilters';
import AnalyticsFilters from '../components/analytics/AnalyticsFilters';
import DateDisplay from '../components/DateDisplay';
import EditTaskModal from '../components/EditTaskModal';
import { MoreVerticalIcon, EditIcon, TrashIcon } from '../components/Icons';
import { useSearchParams } from 'next/navigation';
import { getSLAStatus, getSLAStatusColor, getSLAStatusBadge } from '@/utils/slaUtils';
import { useToast } from '../hooks/useToast';

interface TaskListViewProps {
  tasks: Task[];
  clients: Client[];
  darkMode: boolean;
  viewMode: 'table' | 'cards';
  onViewModeChange: (mode: 'table' | 'cards') => void;
  onUpdate: () => void;
  highlightTaskId?: string | null;
}

function TaskListView({ tasks, clients, darkMode, viewMode, onViewModeChange, onUpdate, highlightTaskId }: TaskListViewProps) {
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    task: Task | null;
  }>({ visible: false, x: 0, y: 0, task: null });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Partial<Task>>({});
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<TaskStatus>('pending');
  const [bulkPriority, setBulkPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [bulkSlaDate, setBulkSlaDate] = useState<string>('');
  const [bulkOperation, setBulkOperation] = useState<'status' | 'priority' | 'sla'>('status');
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu({ visible: false, x: 0, y: 0, task: null });
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset selection when tasks change
  useEffect(() => {
    setSelectedTasks(new Set());
    setShowBulkActions(false);
  }, [tasks]);

  // Initialize bulk SLA date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBulkSlaDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.name} (${client.company})` : 'Unknown Client';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return darkMode ? 'text-red-400' : 'text-red-600';
      case 'medium': return darkMode ? 'text-yellow-400' : 'text-yellow-600';
      case 'low': return darkMode ? 'text-green-400' : 'text-green-600';
      default: return darkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in progress': return 'bg-yellow-500';
      case 'pending': return 'bg-gray-500';
      case 'awaiting client': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  // Calculate task statistics
  const taskStats = {
    total: tasks.length,
    selected: selectedTasks.size,
    byStatus: {
      pending: tasks.filter(t => t.status === 'pending').length,
      'in progress': tasks.filter(t => t.status === 'in progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      'awaiting client': tasks.filter(t => t.status === 'awaiting client').length,
    },
    byPriority: {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    },
    withSLA: tasks.filter(t => t.sla_date).length,
    overdue: tasks.filter(t => t.sla_date && t.status !== 'completed' && new Date(t.sla_date) < new Date()).length
  };

  const handleTaskSelection = (taskId: number, selected: boolean) => {
    const newSelected = new Set(selectedTasks);
    if (selected) {
      newSelected.add(taskId);
    } else {
      newSelected.delete(taskId);
    }
    setSelectedTasks(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      const allTaskIds = new Set(tasks.map(task => task.id));
      setSelectedTasks(allTaskIds);
      setShowBulkActions(true);
    } else {
      setSelectedTasks(new Set());
      setShowBulkActions(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedTasks.size === 0) return;
    
    setIsLoading(true);
    try {
      const promises = Array.from(selectedTasks).map(taskId => {
        const updates: Partial<Task> = {};
        
        switch (bulkOperation) {
          case 'status':
            updates.status = bulkStatus;
            break;
          case 'priority':
            updates.priority = bulkPriority;
            break;
          case 'sla':
            updates.sla_date = bulkSlaDate;
            break;
        }
        
        return api.updateTask(taskId, updates);
      });
      
      await Promise.all(promises);
      
      const operationText = {
        status: `status to "${bulkStatus}"`,
        priority: `priority to "${bulkPriority}"`,
        sla: `SLA date to ${bulkSlaDate}`
      };
      
      toast.success(
        'Bulk Update Complete', 
        `Updated ${selectedTasks.size} task${selectedTasks.size > 1 ? 's' : ''} ${operationText[bulkOperation]}`
      );
      
      setSelectedTasks(new Set());
      setShowBulkActions(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating tasks:', error);
      toast.error('Bulk Update Failed', 'Failed to update some tasks');
    } finally {
      setIsLoading(false);
    }
  };

  // Legacy function for backwards compatibility
  const handleBulkStatusChange = () => handleBulkUpdate();

  const handleContextMenu = (e: React.MouseEvent, task: Task) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    // Ensure menu doesn't go off screen
    const menuWidth = 208;
    const menuHeight = 300;
    const adjustedX = x + menuWidth > window.innerWidth ? x - menuWidth : x;
    const adjustedY = y + menuHeight > window.innerHeight ? y - menuHeight : y;
    
    setContextMenu({
      visible: true,
      x: adjustedX,
      y: adjustedY,
      task
    });
  };

  const handleEditTask = () => {
    if (contextMenu.task) {
      setEditingTask(contextMenu.task);
      setContextMenu({ visible: false, x: 0, y: 0, task: null });
    }
  };

  const handleDeleteTask = async () => {
    if (!contextMenu.task) return;
    
    setIsLoading(true);
    try {
      await api.deleteTask(contextMenu.task.id);
      toast.success('Task Deleted', 'Task has been deleted successfully');
      setContextMenu({ visible: false, x: 0, y: 0, task: null });
      onUpdate();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Delete Failed', 'Failed to delete task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!contextMenu.task || !contextMenu.task.id) {
      toast.error('Update Failed', 'Invalid task selected. Please try again.');
      return;
    }
    
    setIsLoading(true);
    try {
      await api.updateTaskStatus(contextMenu.task.id, newStatus);
      toast.success('Status Updated', `Task status changed to "${newStatus}"`);
      setContextMenu({ visible: false, x: 0, y: 0, task: null });
      onUpdate();
    } catch (error) {
      console.error('Error updating task status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task status';
      toast.error('Update Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingData({
      description: task.description,
      priority: task.priority,
      status: task.status
    });
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingData({});
  };

  const handleSaveEdit = async () => {
    if (!editingTaskId || !editingData.description?.trim()) return;
    
    setIsLoading(true);
    try {
      await api.updateTask(editingTaskId, editingData);
      toast.success('Task Updated', 'Task has been updated successfully');
      setEditingTaskId(null);
      setEditingData({});
      onUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Update Failed', 'Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditChange = (field: keyof Task, value: string) => {
    setEditingData(prev => ({ ...prev, [field]: value }));
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Enhanced Bulk Actions Bar
  const BulkActionsBar = () => (
    <div 
      className="mb-4 p-4 rounded-lg border-2 border-dashed"
      style={{
        backgroundColor: 'var(--card-background-hover)',
        borderColor: 'var(--primary-button)'
      }}
    >
      <div className="space-y-4">
        {/* Header with selection info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span 
              className="font-medium text-lg"
              style={{ color: 'var(--primary-text)' }}
            >
              📋 {selectedTasks.size} task{selectedTasks.size > 1 ? 's' : ''} selected
            </span>
            <span 
              className="text-sm px-2 py-1 rounded"
              style={{ 
                backgroundColor: 'var(--card-background)',
                color: 'var(--secondary-text)' 
              }}
            >
              Bulk Operations
            </span>
          </div>
          <button
            onClick={() => {
              setSelectedTasks(new Set());
              setShowBulkActions(false);
            }}
            className="px-3 py-1 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--secondary-button)',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--secondary-button-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--secondary-button)';
            }}
          >
            ✕ Cancel
          </button>
        </div>

        {/* Operation selection and controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Operation Type Selector */}
          <div className="flex items-center space-x-2">
            <label 
              className="text-sm font-medium"
              style={{ color: 'var(--secondary-text)' }}
            >
              Operation:
            </label>
            <select
              value={bulkOperation}
              onChange={(e) => setBulkOperation(e.target.value as 'status' | 'priority' | 'sla')}
              className="px-3 py-1 rounded border text-sm"
              style={{
                backgroundColor: 'var(--card-background)',
                borderColor: 'var(--card-border)',
                color: 'var(--primary-text)'
              }}
            >
              <option value="status">📊 Update Status</option>
              <option value="priority">🔥 Update Priority</option>
              <option value="sla">📅 Update SLA Date</option>
            </select>
          </div>

          {/* Dynamic Value Selector */}
          <div className="flex items-center space-x-2">
            <label 
              className="text-sm font-medium"
              style={{ color: 'var(--secondary-text)' }}
            >
              {bulkOperation === 'status' && 'New Status:'}
              {bulkOperation === 'priority' && 'New Priority:'}
              {bulkOperation === 'sla' && 'New SLA Date:'}
            </label>
            
            {bulkOperation === 'status' && (
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value as TaskStatus)}
                className="px-3 py-1 rounded border text-sm"
                style={{
                  backgroundColor: 'var(--card-background)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--primary-text)'
                }}
              >
                <option value="pending">⏳ Pending</option>
                <option value="in progress">🚧 In Progress</option>
                <option value="completed">✅ Completed</option>
                <option value="awaiting client">⏸️ Awaiting Client</option>
              </select>
            )}

            {bulkOperation === 'priority' && (
              <select
                value={bulkPriority}
                onChange={(e) => setBulkPriority(e.target.value as 'high' | 'medium' | 'low')}
                className="px-3 py-1 rounded border text-sm"
                style={{
                  backgroundColor: 'var(--card-background)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--primary-text)'
                }}
              >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🔴 High Priority</option>
              </select>
            )}

            {bulkOperation === 'sla' && (
              <input
                type="date"
                value={bulkSlaDate}
                onChange={(e) => setBulkSlaDate(e.target.value)}
                className="px-3 py-1 rounded border text-sm"
                style={{
                  backgroundColor: 'var(--card-background)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--primary-text)'
                }}
              />
            )}
          </div>

          {/* Execute Button */}
          <button
            onClick={handleBulkUpdate}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ml-auto"
            style={{
              backgroundColor: 'var(--primary-button)',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = 'var(--primary-button-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = 'var(--primary-button)';
              }
            }}
          >
            {isLoading ? '⏳ Updating...' : '🚀 Apply Changes'}
          </button>
        </div>
      </div>
    </div>
  );

  // Task Statistics Header
  const TaskStatsHeader = () => (
    <div 
      className="mb-4 p-4 rounded-lg border"
      style={{
        backgroundColor: 'var(--card-background)',
        borderColor: 'var(--card-border)'
      }}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Total Tasks */}
        <div className="text-center">
          <div 
            className="text-2xl font-bold"
            style={{ color: 'var(--primary-text)' }}
          >
            {taskStats.total}
          </div>
          <div 
            className="text-xs"
            style={{ color: 'var(--secondary-text)' }}
          >
            📋 Total Tasks
          </div>
        </div>

        {/* Status Distribution */}
        <div className="text-center">
          <div 
            className="text-lg font-semibold text-gray-500"
          >
            {taskStats.byStatus.pending}
          </div>
          <div 
            className="text-xs"
            style={{ color: 'var(--secondary-text)' }}
          >
            ⏳ Pending
          </div>
        </div>

        <div className="text-center">
          <div 
            className="text-lg font-semibold text-yellow-600"
          >
            {taskStats.byStatus['in progress']}
          </div>
          <div 
            className="text-xs"
            style={{ color: 'var(--secondary-text)' }}
          >
            🚧 In Progress
          </div>
        </div>

        <div className="text-center">
          <div 
            className="text-lg font-semibold text-green-600"
          >
            {taskStats.byStatus.completed}
          </div>
          <div 
            className="text-xs"
            style={{ color: 'var(--secondary-text)' }}
          >
            ✅ Completed
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="text-center">
          <div 
            className="text-lg font-semibold text-red-600"
          >
            {taskStats.byPriority.high}
          </div>
          <div 
            className="text-xs"
            style={{ color: 'var(--secondary-text)' }}
          >
            🔴 High Priority
          </div>
        </div>

        {/* SLA Info */}
        <div className="text-center">
          <div 
            className="text-lg font-semibold"
            style={{ color: taskStats.overdue > 0 ? '#dc2626' : 'var(--primary-text)' }}
          >
            {taskStats.overdue}
          </div>
          <div 
            className="text-xs"
            style={{ color: 'var(--secondary-text)' }}
          >
            🚨 Overdue
          </div>
        </div>
      </div>

      {/* Additional info row */}
      <div className="mt-3 pt-3 border-t flex justify-between items-center text-sm">
        <div 
          className="flex items-center space-x-4"
          style={{ color: 'var(--secondary-text)' }}
        >
          <span>📅 {taskStats.withSLA} tasks with SLA dates</span>
          <span>🎯 {taskStats.byStatus['awaiting client']} awaiting client</span>
        </div>
        <div 
          className="text-xs px-2 py-1 rounded"
          style={{ 
            backgroundColor: 'var(--card-background-hover)',
            color: 'var(--muted-text)' 
          }}
        >
          Updated in real-time
        </div>
      </div>
    </div>
  );

  if (viewMode === 'table') {
    return (
      <>
        <TaskStatsHeader />
        {showBulkActions && <BulkActionsBar />}
        <div 
          className="rounded-xl border shadow-lg overflow-hidden"
          style={{
            backgroundColor: 'var(--card-background)',
            borderColor: 'var(--card-border)'
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead 
                style={{
                  backgroundColor: 'var(--card-background-hover)'
                }}
              >
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'var(--secondary-text)' }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTasks.size === tasks.length && tasks.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded"
                    />
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'var(--secondary-text)' }}
                  >
                    <button 
                      onClick={() => {
                        if (sortBy === 'date') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('date');
                          setSortOrder('desc');
                        }
                      }}
                      className="flex items-center gap-1 hover:text-blue-500"
                    >
                      Date
                      {sortBy === 'date' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'var(--secondary-text)' }}
                  >
                    Description
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'var(--secondary-text)' }}
                  >
                    Client
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'var(--secondary-text)' }}
                  >
                    <button 
                      onClick={() => {
                        if (sortBy === 'status') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('status');
                          setSortOrder('asc');
                        }
                      }}
                      className="flex items-center gap-1 hover:text-blue-500"
                    >
                      Status
                      {sortBy === 'status' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'var(--secondary-text)' }}
                  >
                    <button 
                      onClick={() => {
                        if (sortBy === 'priority') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('priority');
                          setSortOrder('desc');
                        }
                      }}
                      className="flex items-center gap-1 hover:text-blue-500"
                    >
                      Priority
                      {sortBy === 'priority' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'var(--secondary-text)' }}
                  >
                    SLA
                  </th>

                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--card-border)' }}>
                {sortedTasks.map((task) => (
                  <tr 
                    key={task.id}
                    className={`transition-colors ${
                      selectedTasks.has(task.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    style={{
                      backgroundColor: highlightTaskId && task.id.toString() === highlightTaskId
                        ? darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)'
                        : selectedTasks.has(task.id)
                        ? darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'
                        : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedTasks.has(task.id) && !(highlightTaskId && task.id.toString() === highlightTaskId)) {
                        e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedTasks.has(task.id) && !(highlightTaskId && task.id.toString() === highlightTaskId)) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                    onDoubleClick={() => handleTaskSelection(task.id, !selectedTasks.has(task.id))}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedTasks.has(task.id)}
                        onChange={(e) => handleTaskSelection(task.id, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--secondary-text)' }}>
                      <DateDisplay date={task.date} />
                    </td>
                    <td className="px-6 py-4">
                      {editingTaskId === task.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingData.description || ''}
                            onChange={(e) => handleEditChange('description', e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border rounded"
                            style={{
                              backgroundColor: 'var(--card-background)',
                              borderColor: 'var(--card-border)',
                              color: 'var(--primary-text)'
                            }}
                            autoFocus
                          />
                          <button
                            onClick={handleSaveEdit}
                            disabled={isLoading}
                            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="text-sm font-medium break-words-enhanced cursor-pointer hover:text-blue-600"
                          style={{ color: 'var(--primary-text)' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(task);
                          }}
                          title="Click to edit"
                        >
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--secondary-text)' }}>
                      {getClientName(task.client_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {task.sla_date && task.status !== 'completed' ? (
                        <div className="flex flex-col">
                          <DateDisplay date={task.sla_date} />
                          <span className={`text-xs font-medium ${getSLAStatusColor(getSLAStatus(task), darkMode)}`}>
                            {getSLAStatusBadge(getSLAStatus(task))}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--muted-text)' }}>No SLA</span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  // Cards view
  return (
    <>
      <TaskStatsHeader />
      {showBulkActions && <BulkActionsBar />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedTasks.map((task) => (
          <div 
            key={task.id} 
            className={`p-4 rounded-lg border shadow task-card-hover relative cursor-context-menu ${
              task.sla_date && task.status !== 'completed' && getSLAStatus(task) === 'overdue'
                ? 'border-l-4 border-l-red-500'
                : task.sla_date && task.status !== 'completed' && getSLAStatus(task) === 'due_today'
                ? 'border-l-4 border-l-orange-500'
                : ''
            } ${selectedTasks.has(task.id) ? 'ring-2 ring-blue-500' : ''}`}
            title="Right-click for actions"
            style={{
              backgroundColor: highlightTaskId && task.id.toString() === highlightTaskId
                ? darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)'
                : selectedTasks.has(task.id)
                ? darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'
                : 'var(--card-background)',
              borderColor: highlightTaskId && task.id.toString() === highlightTaskId
                ? darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'
                : selectedTasks.has(task.id)
                ? darkMode ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.3)'
                : 'var(--card-border)',
              color: 'var(--primary-text)'
            }}
            onMouseEnter={(e) => {
              if (!selectedTasks.has(task.id) && !(highlightTaskId && task.id.toString() === highlightTaskId)) {
                e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (!selectedTasks.has(task.id) && !(highlightTaskId && task.id.toString() === highlightTaskId)) {
                e.currentTarget.style.backgroundColor = 'var(--card-background)';
              }
            }}
            onDoubleClick={() => handleTaskSelection(task.id, !selectedTasks.has(task.id))}
            onContextMenu={(e) => handleContextMenu(e, task)}
          >
            {/* Selection Checkbox */}
            <div className="absolute top-2 left-2">
              <input
                type="checkbox"
                checked={selectedTasks.has(task.id)}
                onChange={(e) => handleTaskSelection(task.id, e.target.checked)}
                className="rounded"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="flex items-start justify-between mb-2 ml-6">
              <div 
                className="text-sm"
                style={{ color: 'var(--secondary-text)' }}
              >
                <DateDisplay date={task.date} />
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
            </div>
            
            <h3 
              className="font-medium mb-3 break-words-enhanced leading-tight ml-6"
              style={{ color: 'var(--primary-text)' }}
            >
              {task.description}
            </h3>
            
            <div className="flex items-center justify-between mb-2 ml-6">
              <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority.toUpperCase()} Priority
              </span>
              <div 
                className="text-sm"
                style={{ color: 'var(--secondary-text)' }}
              >
                {getClientName(task.client_id)}
              </div>
            </div>

            {/* SLA Footer */}
            {task.sla_date && task.status !== 'completed' && (
              <div 
                className="mt-3 pt-2 border-t flex items-center justify-between ml-6"
                style={{ borderColor: 'var(--card-border)' }}
              >
                <span className={`text-xs font-medium ${
                  getSLAStatus(task) === 'overdue' 
                    ? 'text-red-600' 
                    : getSLAStatus(task) === 'due_today'
                    ? 'text-orange-600'
                    : getSLAStatus(task) === 'due_this_week'
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}>
                  {getSLAStatusBadge(getSLAStatus(task))} SLA: <DateDisplay date={task.sla_date} />
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  getSLAStatus(task) === 'overdue' 
                    ? 'bg-red-100 text-red-800 border border-red-200' 
                    : getSLAStatus(task) === 'due_today'
                    ? 'bg-orange-100 text-orange-800 border border-orange-200'
                    : getSLAStatus(task) === 'due_this_week'
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : 'bg-green-100 text-green-800 border border-green-200'
                }`}>
                  {getSLAStatus(task) === 'overdue' && 'OVERDUE'}
                  {getSLAStatus(task) === 'due_today' && 'DUE TODAY'}
                  {getSLAStatus(task) === 'due_this_week' && 'THIS WEEK'}
                  {getSLAStatus(task) === 'on_track' && 'ON TRACK'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

    {/* Context Menu - Shared between table and cards view */}
    {contextMenu.visible && (
      <div
        ref={contextMenuRef}
        className="fixed py-1 rounded-md shadow-lg w-52 border"
        style={{
          backgroundColor: 'var(--card-background)',
          borderColor: 'var(--card-border)',
          top: `${contextMenu.y}px`,
          left: `${contextMenu.x}px`,
          maxHeight: 'calc(100vh - 20px)',
          overflowY: 'auto',
          zIndex: 9999, // Explicit high z-index
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Quick Actions Section */}
        <div 
          className="px-3 py-2 text-xs font-medium"
          style={{ color: 'var(--muted-text)' }}
        >
          Quick Actions
        </div>
        
        <button
          onClick={handleEditTask}
          disabled={isLoading}
          className="flex items-center w-full text-left px-4 py-2 text-sm disabled:opacity-50 transition-colors"
          style={{ color: 'var(--primary-text)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <EditIcon size={16} className="mr-3" />
          Edit Task
        </button>
        
        <button
          onClick={handleDeleteTask}
          disabled={isLoading}
          className="flex items-center w-full text-left px-4 py-2 text-sm disabled:opacity-50 transition-colors text-red-600"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <TrashIcon size={16} className="mr-3" />
          Delete Task
        </button>

        {/* Separator */}
        <div 
          className="border-t my-1"
          style={{ borderColor: 'var(--card-border)' }}
        ></div>

        {/* Status Change Section */}
        <div 
          className="px-3 py-2 text-xs font-medium"
          style={{ color: 'var(--muted-text)' }}
        >
          Change Status
        </div>
        
        {(['pending', 'in progress', 'completed', 'awaiting client'] as TaskStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            disabled={isLoading || contextMenu.task?.status === status}
            className="flex items-center w-full text-left px-4 py-2 text-sm disabled:opacity-50 transition-colors"
            style={{ 
              color: contextMenu.task?.status === status ? 'var(--muted-text)' : 'var(--primary-text)'
            }}
            onMouseEnter={(e) => {
              if (contextMenu.task?.status !== status) {
                e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span className={`inline-block w-3 h-3 rounded-full mr-3 ${getStatusColor(status)}`}></span>
            {status} {contextMenu.task?.status === status && '(current)'}
          </button>
        ))}
      </div>
    )}

    {/* Edit Task Modal - Shared between table and cards view */}
    {editingTask && (
      <EditTaskModal
        task={editingTask}
        isOpen={true}
        onClose={() => setEditingTask(null)}
        onUpdate={onUpdate}
        darkMode={darkMode}
      />
    )}
    </>
  );
}

export default function FilteredTasksPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  const { darkMode } = useDarkMode();
  const searchParams = useSearchParams();
  
  // Use persisted filters (same storage key as analytics for consistency)
  const {
    filters,
    isLoaded: filtersLoaded,
    setStatusFilter,
    setPriorityFilter,
    setClientSearch,
    setSelectedClientId,
    setDateRange,
    setSlaFilter,
    setDescriptionFilter,
    clearFilters
  } = usePersistedFilters('analytics-filters');

  // Use task filtering logic
  const { filteredTasks, stats } = useTaskFilters(clients, filters);

  // Check for specific task ID from query params
  const taskIdFromQuery = searchParams.get('task');
  const finalFilteredTasks = taskIdFromQuery 
    ? filteredTasks.filter(task => task.id.toString() === taskIdFromQuery)
    : filteredTasks;

  const fetchClients = async () => {
    try {
      const data = await api.getClients();
      setClients(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch clients');
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  if (loading || !filtersLoaded) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-xl">Loading Tasks...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <div className="text-center">
          <div className="text-xl text-red-500 mb-4">{error}</div>
          <button 
            onClick={fetchClients}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard darkMode={darkMode}>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Filtered Tasks</h1>
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {stats.totalTasks} tasks found matching your filters
              </p>
              {taskIdFromQuery && (
                <p className={`text-sm mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  📍 Showing task from notification (highlighted in blue)
                </p>
              )}
            </div>
            
            <div className="flex gap-3">
              <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 text-sm transition-colors ${
                    viewMode === 'table'
                      ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                      : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-4 py-2 text-sm transition-colors ${
                    viewMode === 'cards'
                      ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                      : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cards
                </button>
              </div>
              
              <button
                onClick={clearFilters}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <AnalyticsFilters
          dateRange={filters.dateRange}
          setDateRange={setDateRange}
          statusFilter={filters.statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={filters.priorityFilter}
          setPriorityFilter={setPriorityFilter}
          clientSearch={filters.clientSearch}
          setClientSearch={setClientSearch}
          selectedClientId={filters.selectedClientId}
          setSelectedClientId={setSelectedClientId}
          slaFilter={filters.slaFilter}
          setSlaFilter={setSlaFilter}
          descriptionFilter={filters.descriptionFilter}
          setDescriptionFilter={setDescriptionFilter}
          clients={clients}
          darkMode={darkMode}
        />

        {/* Task List */}
        <div className="mb-8">
          <TaskListView
            tasks={finalFilteredTasks}
            clients={clients}
            darkMode={darkMode}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onUpdate={fetchClients}
            highlightTaskId={taskIdFromQuery}
          />
        </div>

        {/* Empty State */}
        {finalFilteredTasks.length === 0 && (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-medium mb-2">No tasks found</h3>
            <p>Try adjusting your filters to see more results.</p>
          </div>
        )}
      </div>
    </div>
    </AuthGuard>
  );
}