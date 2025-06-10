import { useState, useRef, useEffect } from 'react';
import { Client, Task, TaskStatus, TaskPriority, Comment } from '@/types/types';
import DateDisplay from './DateDisplay';
import { getSLAStatus, getSLAStatusColor, getSLAStatusBadge, getDaysUntilSLA } from '@/utils/slaUtils';
import CommentsSection from './CommentsSection';
import { MoreVerticalIcon, EditIcon, TrashIcon } from './Icons';
import EditTaskModal from './EditTaskModal';
import AddTaskForm from './client/AddTaskForm';
import { api } from '@/services/api';
import { useToast } from '../hooks/useToast';
import CopyButton from './CopyButton';
import { getCurrentDateForInput, getDefaultSLADate } from '@/utils/dateUtils';

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
    date: getCurrentDateForInput(),
    sla_date: getDefaultSLADate(),
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
      case 'high': return darkMode ? 'text-red-400' : 'text-red-600';
      case 'medium': return darkMode ? 'text-yellow-400' : 'text-yellow-600';
      case 'low': return darkMode ? 'text-green-400' : 'text-green-600';
      default: return darkMode ? 'text-gray-400' : 'text-gray-500';
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
        date: getCurrentDateForInput(),
        sla_date: getDefaultSLADate(),
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
      date: getCurrentDateForInput(),
      sla_date: getDefaultSLADate(),
      priority: 'medium',
      status: 'pending',
      client_id: client.id,
      comments: []
    });
  };



  const stats = getTaskStats();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        // Close modal when clicking on backdrop (outside the modal content)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className={`w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
          darkMode ? 'bg-gray-950 text-gray-100' : 'bg-white text-gray-900'
        }`}
        onClick={(e) => {
          // Prevent click propagation to avoid closing when clicking inside modal
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className={`sticky top-0 px-6 py-4 border-b ${
          darkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{client.name}</h2>
                            <div className={`text-sm flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <span>{client.company} • {client.origin} • ID: {client.id}</span>
                <CopyButton 
                  text={client.id}
                  successMessage="ID Copied!"
                  title="Copy ID to clipboard"
                  size={14}
                />
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-md transition-colors ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              title="Fechar"
            >
              ✕
            </button>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={`p-3 rounded-lg ${
              darkMode ? 'bg-gray-900' : 'bg-gray-100'
            }`}>
              <div className="text-xs font-medium text-gray-500">Total</div>
              <div className="text-xl font-bold">{stats.total}</div>
            </div>
            <div className={`p-3 rounded-lg ${
              darkMode ? 'bg-gray-900' : 'bg-gray-100'
            }`}>
              <div className="text-xs font-medium text-gray-500">Concluídas</div>
              <div className="text-xl font-bold text-green-600">{stats.completed}</div>
            </div>
            <div className={`p-3 rounded-lg ${
              darkMode ? 'bg-gray-900' : 'bg-gray-100'
            }`}>
              <div className="text-xs font-medium text-gray-500">Em Progresso</div>
              <div className="text-xl font-bold text-yellow-600">{stats.inProgress}</div>
            </div>
            <div className={`p-3 rounded-lg ${
              darkMode ? 'bg-gray-900' : 'bg-gray-100'
            }`}>
              <div className="text-xs font-medium text-gray-500">Progresso</div>
              <div className="text-xl font-bold text-blue-600">{stats.progress}%</div>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Tasks ({client.tasks.length})
            </h3>
            {!showAddTaskForm && (
              <button
                onClick={() => setShowAddTaskForm(true)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                  darkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } hover:scale-110 shadow-md hover:shadow-lg`}
                title="Add New Task"
              >
                +
              </button>
            )}
          </div>

          {showAddTaskForm && (
            <div className="mb-4">
              <AddTaskForm
                newTask={newTask}
                darkMode={darkMode}
                onNewTaskChange={handleNewTaskChange}
                onAddTask={handleAddTask}
                onCancel={handleCancelAddTask}
              />
            </div>
          )}

          {client.tasks.length === 0 ? (
            <div className={`text-center py-8 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <p>Nenhuma task encontrada para este cliente</p>
            </div>
          ) : (
            <div className="space-y-4" key={refreshKey}>
              {client.tasks.map((task, index) => {
                const slaStatus = getSLAStatus(task);
                const daysUntilSLA = getDaysUntilSLA(task);
                
                return (
                  <div
                    key={task.id}
                    className={`border rounded-lg p-4 ${
                      darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(task.status)} text-white`}>
                          {task.status}
                        </span>
                        <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <DateDisplay date={task.date} />
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleMoreVerticalClick(e, task, index)}
                        className={`p-1.5 rounded-md transition-colors ${
                          darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                        title="Opções da task"
                      >
                        <MoreVerticalIcon size={16} />
                      </button>
                    </div>

                    <h4 className={`font-medium mb-2 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {task.description}
                    </h4>

                    {task.completion_date && (
                      <div className="mb-2 flex items-center gap-1 text-green-600">
                        <span className="text-sm">✅</span>
                        <span className="text-xs font-medium">
                          Completed: <DateDisplay date={task.completion_date} />
                        </span>
                      </div>
                    )}

                    {/* SLA Info */}
                    {task.sla_date && task.status !== 'completed' && (
                      <div className="mb-3 flex items-center gap-2">
                        <span className="text-lg">{getSLAStatusBadge(slaStatus)}</span>
                        <div className="text-sm">
                          <span className={getSLAStatusColor(slaStatus, darkMode)}>
                            SLA: <DateDisplay date={task.sla_date} />
                          </span>
                          {daysUntilSLA !== null && (
                            <span className={`ml-2 ${getSLAStatusColor(slaStatus, darkMode)}`}>
                              ({daysUntilSLA > 0 ? `${daysUntilSLA} days left` : 
                                daysUntilSLA === 0 ? 'Due today' : 
                                `${Math.abs(daysUntilSLA)} days overdue`})
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Comments */}
                    <CommentsSection
                      comments={task.comments || []}
                      onAddComment={async (commentText) => {
                        try {
                          await api.addComment(task.id, commentText);
                          onUpdate();
                          // Force refresh to show new comment
                          setRefreshKey(prev => prev + 1);
                        } catch (error) {
                          console.error('Error adding comment:', error);
                          toast.error('Failed to add comment', 'Please try again');
                        }
                      }}
                      darkMode={darkMode}
                      autoScrollToNewComment={true}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className={`fixed py-1 rounded-md shadow-lg w-52 context-menu-enter ${
            darkMode ? 'bg-gray-900' : 'bg-white'
          } border ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}
          style={{
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            maxHeight: 'calc(100vh - 20px)',
            overflowY: 'auto',
            zIndex: 9999, // Force high z-index
          }}
        >
          <div className={`px-3 py-2 text-xs font-medium ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Task Actions
          </div>
          
          <button
            onClick={handleEditTask}
            disabled={isLoading}
            className={`flex items-center w-full text-left px-4 py-2 text-sm ${
              darkMode ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-900'
            } disabled:opacity-50 transition-colors`}
          >
            <EditIcon size={16} className="mr-3" />
            Edit Task
          </button>
          
          <button
            onClick={() => contextMenu.task && handleDeleteTask(contextMenu.task.id)}
            disabled={isLoading}
            className={`flex items-center w-full text-left px-4 py-2 text-sm ${
              darkMode ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-600'
            } disabled:opacity-50 transition-colors`}
          >
            <TrashIcon size={16} className="mr-3" />
            Delete Task
          </button>

          <div className={`border-t my-1 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}></div>

          <div className={`px-3 py-2 text-xs font-medium ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Change Status
          </div>
          
          <button
            onClick={() => handleStatusChange('pending')}
            disabled={isLoading}
            className={`flex items-center w-full text-left px-4 py-2 text-sm ${
              darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
            } ${contextMenu.task?.status === 'pending' ? (darkMode ? 'bg-gray-600' : 'bg-gray-200') : ''} disabled:opacity-50 transition-colors`}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-gray-500 mr-3"></span>
            Pending
          </button>
          
          <button
            onClick={() => handleStatusChange('in progress')}
            disabled={isLoading}
            className={`flex items-center w-full text-left px-4 py-2 text-sm ${
              darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
            } ${contextMenu.task?.status === 'in progress' ? (darkMode ? 'bg-gray-600' : 'bg-gray-200') : ''} disabled:opacity-50 transition-colors`}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-3"></span>
            In Progress
          </button>
          
          <button
            onClick={() => handleStatusChange('completed')}
            disabled={isLoading}
            className={`flex items-center w-full text-left px-4 py-2 text-sm ${
              darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
            } ${contextMenu.task?.status === 'completed' ? (darkMode ? 'bg-gray-600' : 'bg-gray-200') : ''} disabled:opacity-50 transition-colors`}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-3"></span>
            Completed
          </button>
          
          <button
            onClick={() => handleStatusChange('awaiting client')}
            disabled={isLoading}
            className={`flex items-center w-full text-left px-4 py-2 text-sm ${
              darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
            } ${contextMenu.task?.status === 'awaiting client' ? (darkMode ? 'bg-gray-600' : 'bg-gray-200') : ''} disabled:opacity-50 transition-colors`}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-3"></span>
            Awaiting Client
          </button>
        </div>
      )}

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