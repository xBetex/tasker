'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { Client, Task, TaskStatus } from '@/types/types';
import { api } from '@/services/api';
import { useDarkMode } from '../layout';
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
      case 'completed': return darkMode ? 'bg-green-600' : 'bg-green-500';
      case 'in progress': return darkMode ? 'bg-blue-600' : 'bg-blue-500';
      case 'pending': return darkMode ? 'bg-yellow-600' : 'bg-yellow-500';
      case 'awaiting client': return darkMode ? 'bg-orange-600' : 'bg-orange-500';
      default: return darkMode ? 'bg-gray-600' : 'bg-gray-500';
    }
  };

  // Context menu handlers
  const handleContextMenu = (e: React.MouseEvent, task: Task) => {
    e.preventDefault();
    e.stopPropagation();

    const { clientX, clientY } = e;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const menuWidth = 208; // w-52 = 208px
    const menuHeight = 320;

    let x = clientX;
    let y = clientY;

    // Ajustar posição horizontal
    if (x + menuWidth > windowWidth) {
      x = windowWidth - menuWidth - 10; // 10px de margem
    }
    if (x < 10) {
      x = 10; // Margem mínima da esquerda
    }

    // Ajustar posição vertical
    if (y + menuHeight > windowHeight) {
      y = windowHeight - menuHeight - 10; // 10px de margem
    }
    if (y < 10) {
      y = 10; // Margem mínima do topo
    }

    setContextMenu({
      visible: true,
      x,
      y,
      task
    });
  };

  const handleMoreVerticalClick = (e: React.MouseEvent, task: Task) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const menuWidth = 208; // w-52 = 208px
    const menuHeight = 320;
    
    let x = rect.right + 5; // 5px de margem do botão
    let y = rect.top;
    
    // Ajustar posição horizontal
    if (x + menuWidth > windowWidth) {
      x = rect.left - menuWidth - 5; // Posicionar à esquerda do botão
    }
    if (x < 10) {
      x = 10; // Margem mínima da esquerda
    }
    
    // Ajustar posição vertical
    if (y + menuHeight > windowHeight) {
      y = windowHeight - menuHeight - 10; // 10px de margem do bottom
    }
    if (y < 10) {
      y = 10; // Margem mínima do topo
    }
    
    setContextMenu({
      visible: true,
      x,
      y,
      task
    });
  };

  const handleEditTask = () => {
    if (contextMenu.task) {
      setEditingTask(contextMenu.task);
    }
    setContextMenu({ visible: false, x: 0, y: 0, task: null });
  };

  const handleDeleteTask = async () => {
    if (contextMenu.task) {
      try {
        setIsLoading(true);
        await api.deleteTask(contextMenu.task.id);
        onUpdate();
        toast.success('Task Deleted', 'Task has been deleted successfully!');
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error('Failed to Delete Task', 'Please try again later.');
      } finally {
        setIsLoading(false);
        setContextMenu({ visible: false, x: 0, y: 0, task: null });
      }
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (contextMenu.task) {
      try {
        setIsLoading(true);
        await api.updateTaskStatus(contextMenu.task.id, newStatus);
        onUpdate();
        toast.success('Status Updated', `Task status changed to "${newStatus}"!`);
      } catch (error) {
        console.error('Error updating task status:', error);
        toast.error('Failed to Update Status', 'Please try again later.');
      } finally {
        setIsLoading(false);
        setContextMenu({ visible: false, x: 0, y: 0, task: null });
      }
    }
  };

  // Inline editing handlers
  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingData({
      description: task.description,
      status: task.status,
      priority: task.priority,
      date: task.date,
      sla_date: task.sla_date,
      completion_date: task.completion_date
    });
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingData({});
  };

  const handleSaveEdit = async () => {
    if (!editingTaskId || !editingData) return;
    
    try {
      setIsLoading(true);
      await api.updateTask(editingTaskId, editingData);
      onUpdate();
      toast.success('Task Updated', 'Task has been updated successfully!');
      setEditingTaskId(null);
      setEditingData({});
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to Update Task', 'Please try again later.');
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

  if (viewMode === 'table') {
    return (
      <div className={`rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-lg overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
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
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Description
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
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
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
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
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  SLA Due
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Client
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {sortedTasks.map((task) => (
                <tr 
                  key={task.id} 
                  className={`table-row-transition hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} ${
                    highlightTaskId && task.id.toString() === highlightTaskId 
                      ? darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200' 
                      : ''
                  } ${
                    editingTaskId === task.id 
                      ? darkMode ? 'bg-gray-750 ring-2 ring-blue-500' : 'bg-blue-25 ring-2 ring-blue-300'
                      : ''
                  }`}
                  onContextMenu={(e) => handleContextMenu(e, task)}
                >
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {editingTaskId === task.id ? (
                      <input
                        type="date"
                        value={editingData.date || task.date}
                        onChange={(e) => handleEditChange('date', e.target.value)}
                        className={`w-full px-2 py-1 text-xs rounded border ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    ) : (
                      <DateDisplay date={task.date} />
                    )}
                  </td>
                  <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {editingTaskId === task.id ? (
                      <textarea
                        value={editingData.description || task.description}
                        onChange={(e) => handleEditChange('description', e.target.value)}
                        className={`w-full px-2 py-1 text-xs rounded border resize-none ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                        rows={2}
                      />
                    ) : (
                      <div className="max-w-xs break-words">{task.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingTaskId === task.id ? (
                      <select
                        value={editingData.status || task.status}
                        onChange={(e) => handleEditChange('status', e.target.value)}
                        className={`px-2 py-1 text-xs rounded border ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="awaiting client">Awaiting Client</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    )}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium`}>
                    {editingTaskId === task.id ? (
                      <select
                        value={editingData.priority || task.priority}
                        onChange={(e) => handleEditChange('priority', e.target.value)}
                        className={`px-2 py-1 text-xs rounded border ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    ) : (
                      <span className={getPriorityColor(task.priority)}>
                        {task.priority.toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {editingTaskId === task.id ? (
                      <input
                        type="date"
                        value={editingData.sla_date || task.sla_date || ''}
                        onChange={(e) => handleEditChange('sla_date', e.target.value)}
                        className={`w-full px-2 py-1 text-xs rounded border ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    ) : (
                      task.sla_date ? (
                        <div className="flex flex-col">
                          <DateDisplay date={task.sla_date} />
                          {task.status !== 'completed' && (
                            <span className={`text-xs font-medium mt-1 ${
                              task.sla_date && new Date(task.sla_date) < new Date()
                                ? 'text-red-600'
                                : task.sla_date && new Date(task.sla_date).toDateString() === new Date().toDateString()
                                ? 'text-orange-600'
                                : 'text-green-600'
                            }`}>
                              {task.sla_date && new Date(task.sla_date) < new Date() && '⚠️ Overdue'}
                              {task.sla_date && new Date(task.sla_date).toDateString() === new Date().toDateString() && '⚠️ Due Today'}
                              {task.sla_date && new Date(task.sla_date) > new Date() && '✅ On Track'}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No SLA</span>
                      )
                    )}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    <span>{getClientName(task.client_id)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {editingTaskId === task.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          disabled={isLoading}
                          className={`px-3 py-1 text-xs rounded ${
                            darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
                          } text-white disabled:opacity-50 transition-colors`}
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className={`px-3 py-1 text-xs rounded ${
                            darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-400 hover:bg-gray-500'
                          } text-white transition-colors`}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStartEdit(task)}
                          className={`p-1 rounded transition-colors ${
                            darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                          }`}
                          title="Edit task"
                          aria-label="Edit task"
                        >
                          <EditIcon size={16} />
                        </button>
                        <button
                          onClick={(e) => handleMoreVerticalClick(e, task)}
                          className={`p-1 rounded transition-colors ${
                            darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                          }`}
                          title="More options"
                          aria-label="More options"
                        >
                          <MoreVerticalIcon size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Cards view
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedTasks.map((task) => (
          <div 
            key={task.id} 
            className={`p-4 rounded-lg border shadow task-card-hover ${
              highlightTaskId && task.id.toString() === highlightTaskId
                ? darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'
                : darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } ${
              task.sla_date && task.status !== 'completed' && getSLAStatus(task) === 'overdue'
                ? 'border-l-4 border-l-red-500'
                : task.sla_date && task.status !== 'completed' && getSLAStatus(task) === 'due_today'
                ? 'border-l-4 border-l-orange-500'
                : ''
            }`}
            onContextMenu={(e) => handleContextMenu(e, task)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <DateDisplay date={task.date} />
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
                <button
                  onClick={(e) => handleMoreVerticalClick(e, task)}
                  className={`p-1 rounded transition-colors ${
                    darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                  }`}
                  title="Task options"
                  aria-label="Task options"
                >
                  <MoreVerticalIcon size={16} />
                </button>
              </div>
            </div>
            
            <h3 className={`font-medium mb-3 break-words-enhanced leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {task.description}
            </h3>
            
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority.toUpperCase()} Priority
              </span>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {getClientName(task.client_id)}
              </div>
            </div>

            {/* SLA Footer */}
            {task.sla_date && task.status !== 'completed' && (
              <div className={`mt-3 pt-2 border-t ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              } flex items-center justify-between`}>
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

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className={`fixed z-50 py-1 rounded-md shadow-lg w-52 ${darkMode ? 'bg-gray-700' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
          style={{
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            maxHeight: 'calc(100vh - 20px)',
            overflowY: 'auto',
          }}
        >
          {/* Seção de Ações Principais */}
          <div className={`px-3 py-2 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Task Actions
          </div>
          
          <button
            onClick={handleEditTask}
            disabled={isLoading}
            className={`flex items-center w-full text-left px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100 text-gray-900'} disabled:opacity-50 transition-colors`}
          >
            <EditIcon size={16} className="mr-3" />
            Edit Task
          </button>
          
          <button
            onClick={handleDeleteTask}
            disabled={isLoading}
            className={`flex items-center w-full text-left px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-600'} disabled:opacity-50 transition-colors`}
          >
            <TrashIcon size={16} className="mr-3" />
            Delete Task
          </button>

          {/* Separador */}
          <div className={`border-t my-1 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}></div>

          {/* Seção de Status */}
          <div className={`px-3 py-2 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Change Status
          </div>
          
          <button
            onClick={() => handleStatusChange('pending')}
            disabled={isLoading}
            className={`flex items-center w-full text-left px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'} ${contextMenu.task?.status === 'pending' ? (darkMode ? 'bg-gray-600' : 'bg-gray-200') : ''} disabled:opacity-50 transition-colors`}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-3"></span>
            Pending
          </button>
          
          <button
            onClick={() => handleStatusChange('in progress')}
            disabled={isLoading}
            className={`flex items-center w-full text-left px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'} ${contextMenu.task?.status === 'in progress' ? (darkMode ? 'bg-gray-600' : 'bg-gray-200') : ''} disabled:opacity-50 transition-colors`}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-3"></span>
            In Progress
          </button>
          
          <button
            onClick={() => handleStatusChange('completed')}
            disabled={isLoading}
            className={`flex items-center w-full text-left px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'} ${contextMenu.task?.status === 'completed' ? (darkMode ? 'bg-gray-600' : 'bg-gray-200') : ''} disabled:opacity-50 transition-colors`}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-3"></span>
            Completed
          </button>
          
          <button
            onClick={() => handleStatusChange('awaiting client')}
            disabled={isLoading}
            className={`flex items-center w-full text-left px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'} ${contextMenu.task?.status === 'awaiting client' ? (darkMode ? 'bg-gray-600' : 'bg-gray-200') : ''} disabled:opacity-50 transition-colors`}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-3"></span>
            Awaiting Client
          </button>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          isOpen={!!editingTask}
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
  );
}