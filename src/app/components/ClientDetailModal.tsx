import { useState, useRef, useEffect } from 'react';
import { Client, Task, TaskStatus, TaskPriority } from '@/types/types';
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
  allClients?: Client[];
  onNavigateToClient?: (client: Client) => void;
  highlightTaskId?: number | null;
}

export default function ClientDetailModal({
  client,
  isOpen,
  onClose,
  onUpdate,
  darkMode,
  allClients = [],
  onNavigateToClient,
  highlightTaskId
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
  const [, setRefreshKey] = useState(0);
  const [expandAllComments, setExpandAllComments] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'default' | 'columns' | 'masonry'>('columns');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [exportText, setExportText] = useState('');
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

  // Navigation logic
  const currentIndex = allClients.findIndex(c => c.id === client.id);
  const canGoToPrevious = currentIndex > 0;
  const canGoToNext = currentIndex < allClients.length - 1;

  const handlePreviousClient = () => {
    if (canGoToPrevious && onNavigateToClient) {
      const previousClient = allClients[currentIndex - 1];
      onNavigateToClient(previousClient);
    }
  };

  const handleNextClient = () => {
    if (canGoToNext && onNavigateToClient) {
      const nextClient = allClients[currentIndex + 1];
      onNavigateToClient(nextClient);
    }
  };

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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      // Only handle keyboard navigation if not focused on input elements
      const activeElement = document.activeElement;
      const isInputFocused = activeElement?.tagName === 'INPUT' || 
                           activeElement?.tagName === 'TEXTAREA' || 
                           activeElement?.tagName === 'SELECT' ||
                           (activeElement as HTMLElement)?.contentEditable === 'true';

      if (isInputFocused) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          handlePreviousClient();
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleNextClient();
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handlePreviousClient, handleNextClient, onClose]);

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

  // Auto-scroll to highlighted task
  useEffect(() => {
    if (isOpen && highlightTaskId) {
      // Small delay to ensure the modal has fully rendered
      const timer = setTimeout(() => {
        const taskElement = document.querySelector(`[data-task-id="${highlightTaskId}"]`);
        if (taskElement) {
          taskElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, highlightTaskId]);

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
    if (contextMenu.taskIndex !== null && contextMenu.task && contextMenu.task.id) {
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
    } else {
      toast.error('Failed to Update Status', 'Invalid task selected. Please try again.');
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
      : 'No comments';
    
    return `${client.name} - ${client.company} - ID: ${client.id} - ${client.origin} - ${task.description}\n\nComments:\n${comments}`;
  };

  const handleExpandAllComments = () => {
    setExpandAllComments(!expandAllComments);
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

    if (!newTask.date) {
      toast.error('Date Required', 'Please select a task date');
      return;
    }

    try {
      setIsLoading(true);
      
      const taskData = {
        ...newTask,
        client_id: client.id,
        description: newTask.description.trim()
      };
      
      await api.createTask(taskData);
      
      await onUpdate();
      
      setRefreshKey(prev => prev + 1);
      
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
      
      toast.success('Task Added', 'New task has been added successfully!');
      
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

  const getFilteredTasks = () => {
    let filteredTasks = client.tasks;
    
    if (statusFilter !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
    }
    
    if (priorityFilter !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
    }
    
    return filteredTasks;
  };

  const stats = getTaskStats();
  const filteredTasks = getFilteredTasks();

  const handleTaskRightClick = (e: React.MouseEvent, task: Task, index: number) => {
    e.preventDefault();
    handleMoreVerticalClick(e, task, index);
  };

  const generateExportText = () => {
    if (client.tasks.length === 0) {
      return 'No tasks available to export';
    }

    let exportText = `Client - ${client.name}\n`;
    exportText += `Company - ${client.company}\n`;
    exportText += `ID - ${client.id}\n`;
    exportText += `Origin - ${client.origin}\n`;
    exportText += `Export Date - ${new Date().toLocaleDateString()}\n\n`;
    exportText += `${'='.repeat(80)}\n\n`;

    client.tasks.forEach((task, index) => {
      exportText += `${index + 1}/${client.tasks.length}\n`;
      exportText += `${task.description}\n`;
      exportText += `📅 Date: ${task.date}`;
      if (task.sla_date) {
        exportText += ` • ⏰ SLA: ${task.sla_date}`;
      }
      if (task.completion_date) {
        exportText += ` • ✅ Completed: ${task.completion_date}`;
      }
      exportText += `\n`;
      exportText += `📊 Status: ${task.status} • 🎯 Priority: ${task.priority}\n`;
      
      exportText += `\nComments:\n`;
      if (task.comments && task.comments.length > 0) {
        task.comments.forEach(comment => {
          exportText += `• ${comment.text}\n`;
        });
      } else {
        exportText += `• No comments\n`;
      }
      
      exportText += `\n${'-'.repeat(60)}\n\n`;
    });

    return exportText;
  };

  const handleExportAllTasks = async () => {
    if (client.tasks.length === 0) {
      toast.error('No Tasks', 'No tasks available to export');
      return;
    }

    try {
      setIsExporting(true);
      setExportProgress(0);
      
      const exportText = generateExportText();
      
      // Simulate progress with a small delay
      for (let i = 0; i <= 100; i += 20) {
        setExportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Copy to clipboard
      await navigator.clipboard.writeText(exportText);
      
      toast.success(
        'All Tasks Exported!', 
        `Successfully exported ${client.tasks.length} tasks to clipboard`
      );
      
      // Close preview modal if it's open
      if (showExportPreview) {
        setShowExportPreview(false);
      }
      
    } catch {
      toast.error('Export Failed', 'Failed to export tasks to clipboard');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleViewExport = () => {
    const text = generateExportText();
    setExportText(text);
    setShowExportPreview(true);
  };

  const handleStatsCardClick = (statType: string) => {
    switch (statType) {
      case 'total':
        setStatusFilter('all');
        setPriorityFilter('all');
        setLayoutMode('columns');
        break;
      case 'completed':
        setStatusFilter('completed');
        setPriorityFilter('all');
        setLayoutMode('columns');
        break;
      case 'inProgress':
        setStatusFilter('in progress');
        setPriorityFilter('all');
        setLayoutMode('columns');
        break;
      case 'pending':
        setStatusFilter('pending');
        setPriorityFilter('all');
        setLayoutMode('masonry');
        break;
      case 'awaitingClient':
        setStatusFilter('awaiting client');
        setPriorityFilter('all');
        setLayoutMode('columns');
        break;
      default:
        break;
    }
  };

  if (!isOpen) return null;

    return (
    <>
      <style jsx global>{`
        .masonry-container {
          column-fill: balance;
        }
        
        .masonry-item {
          break-inside: avoid;
          margin-bottom: 1.5rem;
        }
        
        .layout-transition {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover-effect {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover-effect:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .gradient-border {
          position: relative;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4);
          border-radius: 1rem;
          padding: 1px;
        }
        
        .gradient-border-inner {
          background: var(--card-background);
          border-radius: calc(1rem - 1px);
          height: 100%;
          width: 100%;
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #06b6d4);
          border-radius: 2px;
          transition: width 0.3s ease;
        }
      `}</style>
        
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div 
          className="relative w-full h-full overflow-hidden"
          style={{
            backgroundColor: 'var(--page-background)',
            color: 'var(--primary-text)'
          }}
          ref={modalRef}
        >
          {/* Modern Header with Gradient */}
          <div 
            className="relative px-8 py-6 no-print"
            style={{ 
              background: 'linear-gradient(135deg, var(--primary-button) 0%, var(--secondary-button) 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={onClose}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'white'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                    }}
                  >
                    <span>←</span>
                    <span>Back</span>
                  </button>

                  <button
                    onClick={() => {
                      // Navigate to dashboard with client focus
                      const url = `/?focus=${client.id}`;
                      window.location.href = url;
                    }}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'white'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                    }}
                    title="View this client on the dashboard"
                  >
                    <span>📋</span>
                    <span>Dashboard</span>
                  </button>

                  {/* Navigation Arrows */}
                  {allClients.length > 1 && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handlePreviousClient}
                        disabled={!canGoToPrevious}
                        className="p-3 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: 'white'
                        }}
                        onMouseEnter={(e) => {
                          if (!e.currentTarget.disabled) {
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                        }}
                        title="Previous client"
                      >
                        <span className="text-lg">‹</span>
                      </button>
                      
                      <span className="text-sm text-white/80 px-2">
                        {currentIndex + 1} of {allClients.length}
                      </span>
                      
                      <button
                        onClick={handleNextClient}
                        disabled={!canGoToNext}
                        className="p-3 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: 'white'
                        }}
                        onMouseEnter={(e) => {
                          if (!e.currentTarget.disabled) {
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                        }}
                        title="Next client"
                      >
                        <span className="text-lg">›</span>
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'white'
                    }}
                  >
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">{client.name}</h1>
                    <p className="text-lg opacity-80" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      🏢 {client.company} • 📍 {client.origin} • 🆔 {client.id}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Layout Mode Buttons with Filter Functionality */}
                <div className="flex items-center space-x-1 bg-black/20 rounded-xl p-1">
                  <button
                    onClick={() => {
                      setLayoutMode('default');
                      setStatusFilter('all');
                      setPriorityFilter('all');
                    }}
                    className={`px-3 py-2 rounded-lg transition-all duration-300 font-medium ${layoutMode === 'default' ? 'bg-white/30 shadow-lg' : 'hover:bg-white/10'}`}
                    style={{ color: 'white' }}
                    title="All Tasks - List Layout"
                  >
                    📋 All
                  </button>
                  <button
                    onClick={() => {
                      setLayoutMode('columns');
                      setStatusFilter('all');
                      setPriorityFilter('all');
                    }}
                    className={`px-3 py-2 rounded-lg transition-all duration-300 font-medium ${layoutMode === 'columns' ? 'bg-white/30 shadow-lg' : 'hover:bg-white/10'}`}
                    style={{ color: 'white' }}
                    title="All Tasks - Column Layout"
                  >
                    🏛️ Grid
                  </button>
                  <button
                    onClick={() => {
                      setLayoutMode('masonry');
                      setStatusFilter('pending');
                      setPriorityFilter('all');
                    }}
                    className={`px-3 py-2 rounded-lg transition-all duration-300 font-medium ${layoutMode === 'masonry' && statusFilter === 'pending' ? 'bg-white/30 shadow-lg' : 'hover:bg-white/10'}`}
                    style={{ color: 'white' }}
                    title="Pending Tasks - Masonry Layout"
                  >
                    🔄 Pending
                  </button>
                  <button
                    onClick={() => {
                      setLayoutMode('columns');
                      setStatusFilter('in progress');
                      setPriorityFilter('all');
                    }}
                    className={`px-3 py-2 rounded-lg transition-all duration-300 font-medium ${statusFilter === 'in progress' ? 'bg-white/30 shadow-lg' : 'hover:bg-white/10'}`}
                    style={{ color: 'white' }}
                    title="In Progress Tasks"
                  >
                    ⏳ Active
                  </button>
                  <button
                    onClick={() => {
                      setLayoutMode('columns');
                      setStatusFilter('completed');
                      setPriorityFilter('all');
                    }}
                    className={`px-3 py-2 rounded-lg transition-all duration-300 font-medium ${statusFilter === 'completed' ? 'bg-white/30 shadow-lg' : 'hover:bg-white/10'}`}
                    style={{ color: 'white' }}
                    title="Completed Tasks"
                  >
                    ✅ Done
                  </button>
                </div>
                
                <button
                  onClick={handleExpandAllComments}
                  className="px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm font-medium"
                  style={{
                    backgroundColor: expandAllComments ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    const bgColor = expandAllComments ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.backgroundColor = bgColor;
                  }}
                  title={expandAllComments ? "Collapse All Comments" : "Expand All Comments"}
                >
                  {expandAllComments ? '📝 Collapse All' : '📝 Expand All'}
                </button>
                
                <button
                  onClick={handleViewExport}
                  disabled={client.tasks.length === 0}
                  className="px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    if (client.tasks.length > 0) {
                      e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (client.tasks.length > 0) {
                      e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                    }
                  }}
                  title="View Export Preview"
                >
                  👁️ View Export
                </button>

                <button
                  onClick={handleExportAllTasks}
                  disabled={isExporting || client.tasks.length === 0}
                  className="px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    if (!isExporting) {
                      e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isExporting) {
                      e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
                    }
                  }}
                  title="Export All Tasks to Clipboard"
                >
                  {isExporting ? `📤 Exporting... ${exportProgress}%` : '📤 Export All'}
                </button>
                
                <button
                  onClick={() => setShowAddTaskForm(!showAddTaskForm)}
                  className="px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm font-medium"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                  }}
                >
                  ➕ Add Task
                </button>
              </div>
            </div>
            
            {/* Export Progress Bar */}
            {isExporting && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/80">Exporting tasks...</span>
                  <span className="text-sm text-white/80">{exportProgress}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${exportProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto print-container" style={{ height: 'calc(100vh - 120px)' }}>
            {/* Modern Stats Cards with Click Functionality */}
            <div className="px-8 py-6 no-print">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {[
                  { label: 'Total Tasks', value: stats.total, color: '#3b82f6', icon: '📋', key: 'total' },
                  { label: 'Completed', value: stats.completed, color: '#10b981', icon: '✅', key: 'completed' },
                  { label: 'In Progress', value: stats.inProgress, color: '#f59e0b', icon: '⏳', key: 'inProgress' },
                  { label: 'Pending', value: stats.pending, color: '#6b7280', icon: '⏸️', key: 'pending' },
                  { label: 'Awaiting Client', value: stats.awaitingClient, color: '#8b5cf6', icon: '👤', key: 'awaitingClient' },
                  { label: 'Progress', value: `${stats.progress}%`, color: '#06b6d4', icon: '📊', key: 'progress' }
                ].map((stat) => (
                  <button 
                    key={stat.key}
                    onClick={() => stat.key !== 'progress' && handleStatsCardClick(stat.key)}
                    disabled={stat.key === 'progress'}
                    className={`relative p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg text-left ${
                      stat.key === 'progress' ? 'cursor-default' : 'cursor-pointer'
                    } ${
                      (stat.key === 'total' && statusFilter === 'all') ||
                      (stat.key === 'completed' && statusFilter === 'completed') ||
                      (stat.key === 'inProgress' && statusFilter === 'in progress') ||
                      (stat.key === 'pending' && statusFilter === 'pending') ||
                      (stat.key === 'awaitingClient' && statusFilter === 'awaiting client')
                        ? 'ring-2 ring-blue-400 ring-opacity-60' : ''
                    }`}
                    style={{
                      backgroundColor: 'var(--card-background)',
                      border: '1px solid var(--card-border)',
                      background: `linear-gradient(135deg, var(--card-background) 0%, var(--card-background-hover) 100%)`
                    }}
                    title={stat.key !== 'progress' ? `Click to filter by ${stat.label.toLowerCase()}` : undefined}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{stat.icon}</span>
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: stat.color }}
                      ></div>
                    </div>
                    <div 
                      className="text-3xl font-bold mb-1"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </div>
                    <div 
                      className="text-sm font-medium"
                      style={{ color: 'var(--secondary-text)' }}
                    >
                      {stat.label}
                    </div>
                    {stat.key !== 'progress' && typeof stat.value === 'number' && stat.value > 0 && (
                      <div 
                        className="absolute top-2 right-2 text-xs opacity-60"
                        style={{ color: 'var(--muted-text)' }}
                      >
                        Click to filter
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Task Form */}
            {showAddTaskForm && (
              <div 
                className="mx-8 mb-6 p-6 rounded-2xl no-print"
                style={{ 
                  backgroundColor: 'var(--card-background)',
                  border: '1px solid var(--card-border)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
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

            {/* Tasks Section */}
            <div className="px-8 pb-8">
              <div className="flex items-center justify-between mb-6 no-print">
                <h2 
                  className="text-2xl font-bold flex items-center space-x-3"
                  style={{ color: 'var(--primary-text)' }}
                >
                  <span>📋</span>
                  <span>Tasks ({filteredTasks.length}{filteredTasks.length !== client.tasks.length ? ` of ${client.tasks.length}` : ''})</span>
                  {statusFilter !== 'all' && (
                    <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {statusFilter}
                    </span>
                  )}
                </h2>
              </div>
              
              {filteredTasks.length === 0 ? (
                <div 
                  className="text-center py-16 no-print"
                  style={{ color: 'var(--muted-text)' }}
                >
                  <div className="text-6xl mb-4">
                    {client.tasks.length === 0 ? '📝' : '🔍'}
                  </div>
                  <div className="text-xl font-medium mb-2">
                    {client.tasks.length === 0 ? 'No tasks found' : 'No tasks match current filters'}
                  </div>
                  <div className="text-sm">
                    {client.tasks.length === 0 ? 'Add a new task to get started!' : 'Try adjusting your filter selection or add a new task'}
                  </div>
                  {statusFilter !== 'all' && (
                    <button
                      onClick={() => {
                        setStatusFilter('all');
                        setPriorityFilter('all');
                      }}
                      className="mt-4 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className={`layout-transition ${
                  layoutMode === 'columns' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' :
                  layoutMode === 'masonry' ? 'masonry-container columns-1 lg:columns-2 xl:columns-3 gap-6' :
                  'space-y-4'
                }`}>
                  {filteredTasks.map((task, index) => (
                    <div key={task.id || index}>
                      {/* Screen Version */}
                      <div
                        data-task-id={task.id}
                        className={`group p-6 rounded-2xl no-print card-hover-effect ${
                          layoutMode === 'masonry' ? 'masonry-item' : 
                          layoutMode === 'columns' ? 'h-fit' : 
                          ''
                        } ${highlightTaskId === task.id ? 'ring-2 ring-blue-500 ring-opacity-75' : ''}`}
                        style={{
                          backgroundColor: highlightTaskId === task.id ? 'var(--card-background-hover)' : 'var(--card-background)',
                          border: `1px solid ${highlightTaskId === task.id ? '#3b82f6' : 'var(--card-border)'}`,
                          boxShadow: highlightTaskId === task.id 
                            ? '0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(59, 130, 246, 0.05)'
                            : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--card-background)';
                        }}
                        onContextMenu={(e) => handleTaskRightClick(e, task, index)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <span 
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(task.status)} text-white shadow-sm`}
                              >
                                {task.status}
                              </span>
                              <span className={`text-sm font-bold ${getPriorityColor(task.priority)}`}>
                                {task.priority.toUpperCase()}
                              </span>
                              <span>{getSLAStatusBadge(getSLAStatus(task))}</span>
                              <span 
                                className="text-xs px-2 py-1 rounded-md"
                                style={{ 
                                  backgroundColor: 'var(--card-background-hover)',
                                  color: 'var(--muted-text)' 
                                }}
                              >
                                <DateDisplay date={task.date} showTime={false} />
                              </span>
                            </div>
                            <h3 
                              className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors"
                              style={{ color: 'var(--primary-text)' }}
                            >
                              {task.description}
                            </h3>
                            {task.sla_date && (
                              <p 
                                className="text-sm flex items-center space-x-2"
                                style={{ color: 'var(--secondary-text)' }}
                              >
                                <span>📅 SLA:</span>
                                <DateDisplay date={task.sla_date} showTime={false} />
                                {getDaysUntilSLA(task) !== null && (
                                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${getSLAStatusColor(getSLAStatus(task), darkMode)}`}>
                                    ({getDaysUntilSLA(task)} days)
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                          <div className="flex items-start space-x-2 no-print">
                            <CopyButton 
                              text={formatTaskForSharing(task, client)}
                              successMessage="Task Copied!"
                              title="Copy task details for sharing"
                              size={18}
                              className="opacity-60 hover:opacity-100 transition-opacity"
                            />
                            <button
                              onClick={(e) => handleMoreVerticalClick(e, task, index)}
                              className="p-2 rounded-lg transition-all duration-200 hover:scale-110 opacity-60 hover:opacity-100"
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
                              <MoreVerticalIcon size={18} />
                            </button>
                          </div>
                        </div>

                        {/* Comments Section */}
                        <CommentsSection
                          comments={task.comments || []}
                          onAddComment={async (text: string) => {
                            try {
                              setIsLoading(true);
                              await api.addComment(task.id, text);
                              onUpdate();
                              setRefreshKey(prev => prev + 1);
                              toast.success('Comment Added', 'Your comment has been added successfully!');
                            } catch (error) {
                              const errorMessage = error instanceof Error ? error.message : 'Failed to add comment';
                              toast.error('Failed to Add Comment', errorMessage);
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                          darkMode={darkMode}
                          forceExpanded={expandAllComments || (highlightTaskId === task.id)}
                          isLoading={isLoading}
                          taskId={task.id}
                          clientId={client.id}
                          onNavigateToTask={(taskId, clientId) => {
                            // Since we're already in the detail modal, just scroll to the task
                            // or highlight it somehow
                            toast.info('Already Viewing', 'You are already viewing this task in detail mode');
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Context Menu */}
            {contextMenu.visible && contextMenu.task && (
              <div
                ref={contextMenuRef}
                className="fixed z-50 rounded-xl shadow-2xl border py-2 min-w-52 no-print backdrop-blur-sm"
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

        {/* Export Preview Modal */}
        {showExportPreview && (
          <div className="fixed inset-0 z-60 overflow-hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowExportPreview(false)}></div>
            <div className="fixed inset-4 z-70 flex items-center justify-center">
              <div 
                className="w-full max-w-4xl max-h-full rounded-2xl shadow-2xl overflow-hidden"
                style={{
                  backgroundColor: 'var(--card-background)',
                  border: '1px solid var(--card-border)'
                }}
              >
                {/* Header */}
                <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--card-border)' }}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold" style={{ color: 'var(--primary-text)' }}>
                      Export Preview - {client.name}
                    </h3>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleExportAllTasks}
                        disabled={isExporting}
                        className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {isExporting ? 'Copying...' : 'Copy to Clipboard'}
                      </button>
                      <button
                        onClick={() => setShowExportPreview(false)}
                        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        style={{ color: 'var(--secondary-text)' }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-96">
                  <pre 
                    className="whitespace-pre-wrap font-mono text-sm leading-relaxed"
                    style={{ 
                      color: 'var(--primary-text)',
                      backgroundColor: darkMode ? '#1a1a1a' : '#f8f9fa',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--card-border)'
                    }}
                  >
                    {exportText}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Task Modal */}
        {editingTask && (
          <EditTaskModal
            task={editingTask}
            isOpen={true}
            onClose={() => setEditingTask(null)}
            onUpdate={onUpdate}
            darkMode={darkMode}
          />
        )}
      </div>
    </>
  );
} 