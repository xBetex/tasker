import { useState, useRef, useEffect } from 'react';
import { Client, Task, TaskStatus, TaskPriority, Comment } from '@/types/types';
import DateDisplay from './DateDisplay';
import { getSLAStatus, getSLAStatusColor, getSLAStatusBadge, getDaysUntilSLA } from '@/utils/slaUtils';
import CommentsSection from './CommentsSection';
import { MoreVerticalIcon, EditIcon, TrashIcon, CopyIcon } from './Icons';
import EditTaskModal from './EditTaskModal';
import AddTaskForm from './client/AddTaskForm';
import { api } from '@/services/api';
import { useToast } from '../hooks/useToast';
import CopyButton from './CopyButton';
import { getCurrentDateForInput, getDefaultSLADate } from '@/utils/dateUtils';
import { useTimezone } from '../contexts/TimezoneContext';

interface ClientDetailModalProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  darkMode: boolean;
}

export default function ClientDetailModal({
  client,
  isOpen,
  onClose,
  onUpdate,
  darkMode
}: ClientDetailModalProps) {
  const { getTimezoneOffset } = useTimezone();
  
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    taskIndex: number | null;
    task?: Task;
  }>({ visible: false, x: 0, y: 0, taskIndex: null });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
    description: '',
    date: getCurrentDateForInput(getTimezoneOffset()),
    sla_date: getDefaultSLADate(getTimezoneOffset()),
    priority: 'medium',
    status: 'pending',
    client_id: client.id,
    comments: []
  });
  const modalRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu({ visible: false, x: 0, y: 0, taskIndex: null });
      }
    };

    if (contextMenu.visible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [contextMenu.visible]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  const getTaskStats = () => {
    const total = client.tasks.length;
    const completed = client.tasks.filter(t => t.status === 'completed').length;
    const pending = client.tasks.filter(t => t.status === 'pending').length;
    const inProgress = client.tasks.filter(t => t.status === 'in progress').length;
    const awaitingClient = client.tasks.filter(t => t.status === 'awaiting client').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, pending, inProgress, awaitingClient, progress };
  };

  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in progress': return 'bg-yellow-500';
      case 'pending': return 'bg-gray-500';
      case 'awaiting client': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: TaskPriority): string => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-500';
    }
  };

  const handleMoreVerticalClick = (e: React.MouseEvent, task: Task, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Usar coordenadas do mouse para evitar problemas com transforms CSS
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const menuWidth = 208;
    const menuHeight = 320;
    
    // Posicionar próximo ao cursor
    let x = mouseX + 5;
    let y = mouseY + 5;
    
    // Ajustar se sair da tela horizontalmente
    if (x + menuWidth > windowWidth) {
      x = mouseX - menuWidth - 5;
    }
    if (x < 10) {
      x = 10;
    }
    
    // Ajustar se sair da tela verticalmente
    if (y + menuHeight > windowHeight) {
      y = mouseY - menuHeight - 5;
    }
    if (y < 10) {
      y = 10;
    }
    
    setContextMenu({
      visible: true,
      x,
      y,
      taskIndex: index,
      task
    });
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (contextMenu.taskIndex !== null && contextMenu.task) {
      try {
        setIsLoading(true);
        await api.updateTaskStatus(contextMenu.task.id, newStatus);
        onUpdate();
        toast.success('Status Updated', `Task status changed to "${newStatus}"!`);
      } catch (error) {
        console.error('Error updating task status:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to update task status';
        toast.error('Failed to Update Status', errorMessage);
      } finally {
        setIsLoading(false);
        setContextMenu({ visible: false, x: 0, y: 0, taskIndex: null });
      }
    }
  };

  const handleEditTask = () => {
    if (contextMenu.task) {
      setEditingTask(contextMenu.task);
      setContextMenu({ visible: false, x: 0, y: 0, taskIndex: null });
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      setIsLoading(true);
      await api.deleteTask(taskId);
      onUpdate();
      toast.success('Task Deleted', 'Task has been deleted successfully!');
      setContextMenu({ visible: false, x: 0, y: 0, taskIndex: null });
    } catch (error) {
      console.error('Error deleting task:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
      toast.error('Failed to Delete Task', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTaskForSharing = (task: Task, client: Client): string => {
    const comments = task.comments && task.comments.length > 0 
      ? task.comments.map(comment => `• ${comment.text}`).join('\n')
      : 'Sem comentários';
    
    return `${client.name} - ${client.company} - ID: ${client.id} - ${client.origin} - ${task.description}\n\nComentários:\n${comments}`;
  };

  const handleNewTaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTask = async () => {
    if (!newTask.description.trim()) {
      toast.error('Task Description Required', 'Please enter a task description');
      return;
    }

    try {
      setIsLoading(true);
      await api.createTask(newTask);
      
      // Force refresh of client data
      await onUpdate();
      
      // Force re-render of modal
      setRefreshKey(prev => prev + 1);
      
      // Small delay to ensure data is updated before showing success
      setTimeout(() => {
        toast.success('Task Added', 'New task has been added successfully!');
      }, 100);
      
      setNewTask({
        description: '',
        date: getCurrentDateForInput(getTimezoneOffset()),
        sla_date: getDefaultSLADate(getTimezoneOffset()),
        priority: 'medium',
        status: 'pending',  
        client_id: client.id,
        comments: []
      });
      setShowAddTaskForm(false);
    } catch (error) {
      console.error('Error adding task:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add task';
      toast.error('Failed to Add Task', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAddTask = () => {
    setShowAddTaskForm(false);
    setNewTask({
      description: '',
      date: getCurrentDateForInput(getTimezoneOffset()),
      sla_date: getDefaultSLADate(getTimezoneOffset()),
      priority: 'medium',
      status: 'pending',
      client_id: client.id,
      comments: []
    });
  };

  const stats = getTaskStats();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-50 flex items-center justify-center min-h-screen p-4">
        <div 
          className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden text-left align-middle transition-all transform shadow-2xl rounded-2xl border"
          style={{
            backgroundColor: 'var(--card-background)',
            borderColor: 'var(--card-border)',
            color: 'var(--primary-text)'
          }}
          ref={modalRef}
        >
          {/* Scrollable Content */}
          <div className="max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div 
              className="px-6 py-4 border-b"
              style={{ borderColor: 'var(--card-border)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border"
                      style={{
                        backgroundColor: 'var(--card-background-hover)',
                        borderColor: 'var(--card-border)',
                        color: 'var(--primary-text)'
                      }}
                    >
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <h2 
                      className="text-2xl font-bold"
                      style={{ color: 'var(--primary-text)' }}
                    >
                      {client.name}
                    </h2>
                    <div className="flex items-center space-x-4 mt-1">
                      <p 
                        className="text-sm"
                        style={{ color: 'var(--secondary-text)' }}
                      >
                        🏢 {client.company}
                      </p>
                      <p 
                        className="text-sm"
                        style={{ color: 'var(--secondary-text)' }}
                      >
                        📍 {client.origin}
                      </p>
                      <CopyButton 
                        text={client.id} 
                        title="Copy Client ID"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowAddTaskForm(!showAddTaskForm)}
                    className="px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 border"
                    style={{
                      backgroundColor: 'var(--primary-button)',
                      borderColor: 'var(--primary-button)',
                      color: 'white'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--primary-button-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--primary-button)';
                    }}
                  >
                    ➕ Add Task
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg transition-all duration-200 hover:scale-105 border"
                    style={{
                      backgroundColor: 'var(--card-background)',
                      borderColor: 'var(--card-border)',
                      color: 'var(--secondary-text)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                      e.currentTarget.style.color = 'var(--primary-text)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--card-background)';
                      e.currentTarget.style.color = 'var(--secondary-text)';
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div 
              className="px-6 py-4 border-b"
              style={{ borderColor: 'var(--card-border)' }}
            >
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div 
                  className="text-center p-3 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--card-background-hover)',
                    borderColor: 'var(--card-border)'
                  }}
                >
                  <div 
                    className="text-2xl font-bold"
                    style={{ color: 'var(--primary-text)' }}
                  >
                    {stats.total}
                  </div>
                  <div 
                    className="text-xs"
                    style={{ color: 'var(--secondary-text)' }}
                  >
                    Total Tasks
                  </div>
                </div>
                <div 
                  className="text-center p-3 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--card-background-hover)',
                    borderColor: 'var(--card-border)'
                  }}
                >
                  <div 
                    className="text-2xl font-bold text-green-600"
                  >
                    {stats.completed}
                  </div>
                  <div 
                    className="text-xs"
                    style={{ color: 'var(--secondary-text)' }}
                  >
                    Completed
                  </div>
                </div>
                <div 
                  className="text-center p-3 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--card-background-hover)',
                    borderColor: 'var(--card-border)'
                  }}
                >
                  <div 
                    className="text-2xl font-bold text-yellow-600"
                  >
                    {stats.inProgress}
                  </div>
                  <div 
                    className="text-xs"
                    style={{ color: 'var(--secondary-text)' }}
                  >
                    In Progress
                  </div>
                </div>
                <div 
                  className="text-center p-3 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--card-background-hover)',
                    borderColor: 'var(--card-border)'
                  }}
                >
                  <div 
                    className="text-2xl font-bold"
                    style={{ color: 'var(--primary-text)' }}
                  >
                    {stats.progress}%
                  </div>
                  <div 
                    className="text-xs"
                    style={{ color: 'var(--secondary-text)' }}
                  >
                    Complete
                  </div>
                </div>
              </div>
            </div>

            {/* Add Task Form */}
            {showAddTaskForm && (
              <div 
                className="px-6 py-4 border-b"
                style={{ 
                  backgroundColor: 'var(--card-background-hover)',
                  borderColor: 'var(--card-border)' 
                }}
              >
                <AddTaskForm
                  newTask={newTask}
                  darkMode={darkMode}
                  onNewTaskChange={handleNewTaskChange}
                  onAddTask={handleAddTask}
                  onCancel={handleCancelAddTask}
                />
              </div>
            )}

            {/* Tasks List */}
            <div className="px-6 py-4 max-h-96 overflow-y-auto">
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ color: 'var(--primary-text)' }}
              >
                📋 Tasks ({client.tasks.length})
              </h3>
              
              {client.tasks.length === 0 ? (
                <div 
                  className="text-center py-8 text-gray-500"
                  style={{ color: 'var(--muted-text)' }}
                >
                  No tasks found for this client
                </div>
              ) : (
                <div className="space-y-3">
                  {client.tasks.map((task, index) => (
                    <div
                      key={task.id || index}
                      className="p-4 rounded-lg border transition-all duration-200 hover:shadow-md"
                      style={{
                        backgroundColor: 'var(--card-background)',
                        borderColor: 'var(--card-border)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--card-background)';
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span 
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)} text-white`}
                            >
                              {task.status}
                            </span>
                            <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority.toUpperCase()}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span>{getSLAStatusBadge(getSLAStatus(task))}</span>
                              <span 
                                className="text-xs"
                                style={{ color: 'var(--muted-text)' }}
                              >
                                <DateDisplay 
                                  date={task.date} 
                                  showTime={false}
                                />
                              </span>
                            </div>
                          </div>
                          <p 
                            className="text-sm mb-2"
                            style={{ color: 'var(--primary-text)' }}
                          >
                            {task.description}
                          </p>
                          {task.sla_date && (
                            <p 
                              className="text-xs"
                              style={{ color: 'var(--secondary-text)' }}
                            >
                              📅 SLA: <DateDisplay date={task.sla_date} showTime={false} />
                              {getDaysUntilSLA(task) !== null && (
                                <span className={`ml-2 ${getSLAStatusColor(getSLAStatus(task), darkMode)}`}>
                                  ({getDaysUntilSLA(task)} days)
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                        <div className="flex items-start space-x-2">
                          <CopyButton 
                            text={formatTaskForSharing(task, client)}
                            successMessage="Task Copied!"
                            title="Copy task details for sharing"
                            size={16}
                            className="opacity-70 hover:opacity-100"
                          />
                          <button
                            onClick={(e) => handleMoreVerticalClick(e, task, index)}
                            className="p-1 rounded transition-all duration-200 hover:scale-110"
                            style={{
                              color: 'var(--secondary-text)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                              e.currentTarget.style.color = 'var(--primary-text)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = 'var(--secondary-text)';
                            }}
                          >
                            <MoreVerticalIcon size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Comments Section */}
                      <CommentsSection
                        comments={task.comments || []}
                        onAddComment={(text: string) => {
                          // Handle adding comment logic here
                          console.log('Adding comment:', text, 'to task:', task.id);
                          onUpdate();
                          setRefreshKey(prev => prev + 1);
                        }}
                        darkMode={darkMode}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Context Menu */}
            {contextMenu.visible && contextMenu.task && (
              <div
                ref={contextMenuRef}
                className="fixed z-50 rounded-lg shadow-2xl border py-2 min-w-52"
                style={{
                  backgroundColor: 'var(--card-background)',
                  borderColor: 'var(--card-border)',
                  left: `${contextMenu.x}px`,
                  top: `${contextMenu.y}px`
                }}
              >
                <div 
                  className="px-4 py-2 text-sm font-medium border-b"
                  style={{ 
                    color: 'var(--secondary-text)',
                    borderColor: 'var(--card-border)'
                  }}
                >
                  Task Actions
                </div>
                
                {/* Status Change Options */}
                <div 
                  className="px-4 py-2 text-xs font-medium"
                  style={{ color: 'var(--muted-text)' }}
                >
                  Change Status
                </div>
                {(['pending', 'in progress', 'completed', 'awaiting client'] as TaskStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={isLoading}
                    className="w-full text-left px-4 py-2 text-sm transition-all duration-200 disabled:opacity-50"
                    style={{ color: 'var(--primary-text)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getStatusColor(status)}`}></span>
                    {status}
                  </button>
                ))}
                
                <hr className="my-2" style={{ borderColor: 'var(--card-border)' }} />
                
                {/* Copy Task Details */}
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    const taskText = formatTaskForSharing(contextMenu.task!, client);
                    try {
                      await navigator.clipboard.writeText(taskText);
                      toast.success('Task Details Copied!', 'Task details copied to clipboard for sharing');
                      setContextMenu({ visible: false, x: 0, y: 0, taskIndex: null });
                    } catch (error) {
                      toast.error('Copy Failed', 'Failed to copy task details');
                    }
                  }}
                  className="w-full text-left px-4 py-2 text-sm transition-all duration-200 flex items-center"
                  style={{ color: 'var(--primary-text)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <CopyIcon size={16} className="mr-2" />
                  Copy Task Details
                </button>
                
                {/* Edit Task */}
                <button
                  onClick={handleEditTask}
                  className="w-full text-left px-4 py-2 text-sm transition-all duration-200 flex items-center"
                  style={{ color: 'var(--primary-text)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <EditIcon size={16} className="mr-2" />
                  Edit Task
                </button>
                
                {/* Delete Task */}
                <button
                  onClick={() => contextMenu.task && handleDeleteTask(contextMenu.task.id)}
                  disabled={isLoading}
                  className="w-full text-left px-4 py-2 text-sm transition-all duration-200 flex items-center disabled:opacity-50"
                  style={{ color: '#ef4444' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <TrashIcon size={16} className="mr-2" />
                  Delete Task
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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
    </div>
  );
} 