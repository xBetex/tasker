import { useState, useRef, useEffect, useCallback } from 'react';
import { Client, Task, TaskStatus, TaskPriority } from '@/types/types';
import EditTaskModal from './EditTaskModal';
import { api } from '@/services/api';
import { MoreVerticalIcon, EditIcon, TrashIcon } from './Icons';
import { getCurrentDateForInput, getDefaultSLADate } from '@/utils/dateUtils';
import DateDisplay from './DateDisplay';
import { getSLAStatus, getSLAStatusColor, getSLAStatusBadge, getSLAStatusText, getDaysUntilSLA } from '@/utils/slaUtils';

interface ClientCardProps {
  client: Client;
  onUpdate: () => void;
  onDeleteTask: (clientId: string, taskIndex: number) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  darkMode: boolean;
}

export default function ClientCard({
  client,
  onUpdate,
  onDeleteTask,
  darkMode,
  isExpanded,
  onToggleExpand,
}: ClientCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editData, setEditData] = useState<Client>({ ...client });
  const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
    date: getCurrentDateForInput(),
    description: '',
    status: 'pending',
    priority: 'medium',
    client_id: client.id,
    sla_date: getDefaultSLADate(),
    completion_date: ''
  });
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    taskIndex: number | null;
    task?: Task;
  }>({ visible: false, x: 0, y: 0, taskIndex: null });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Estados para long press
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);

  const contextMenuRef = useRef<HTMLDivElement>(null);

  const calculateCompletionProgress = (tasks: Task[]) => {
    const totalTasks = tasks.length;
    if (totalTasks === 0) return { percent: 0, highPriority: 0, mediumPriority: 0, lowPriority: 0 };

    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const percent = Math.round((completedTasks / totalTasks) * 100);
    
    const uncompletedTasks = tasks.filter(task => task.status !== 'completed');
    const highPriority = uncompletedTasks.filter(task => task.priority === 'high').length;
    const mediumPriority = uncompletedTasks.filter(task => task.priority === 'medium').length;
    const lowPriority = uncompletedTasks.filter(task => task.priority === 'low').length;

    return { percent, highPriority, mediumPriority, lowPriority };
  };

  const progress = isEditing 
    ? calculateCompletionProgress(editData.tasks)
    : calculateCompletionProgress(client.tasks);

  useEffect(() => {
    if (JSON.stringify(client) !== JSON.stringify(editData)) {
      setEditData({ ...client });
    }
  }, [client]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu({ visible: false, x: 0, y: 0, taskIndex: null });
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setContextMenu({ visible: false, x: 0, y: 0, taskIndex: null });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handlers para long press
  const handleTouchStart = useCallback((e: React.TouchEvent, task: Task, index: number) => {
    setIsLongPress(false);
    const timer = setTimeout(() => {
      setIsLongPress(true);
      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const menuWidth = 208; // w-52 = 208px
      const menuHeight = 320;
      
      // Posicionar o menu próximo ao toque, mas ajustar se estiver muito perto das bordas
      let x = touch.clientX;
      let y = touch.clientY;
      
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
        taskIndex: index,
        task
      });
    }, 500); // 500ms para long press
    
    setLongPressTimer(timer);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  const handleTouchCancel = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  // Função combinada para expansão e edição
  const handleToggleExpandAndEdit = () => {
    if (isExpanded) {
      // Se está expandido, recolher e sair do modo de edição
      setIsEditing(false);
      setIsAddingTask(false);
    } else {
      // Se está recolhido, expandir e entrar no modo de edição
      setIsEditing(true);
    }
    onToggleExpand();
  };

  // Função para ativar apenas o modo de edição (sem mexer na expansão)
  const handleStartEdit = () => {
    setIsEditing(true);
  };

  // Função para salvar e sair do modo de edição (sem mexer na expansão)
  const handleSaveAndExitEdit = async () => {
    await handleSave();
    setIsEditing(false);
  };

  // Função para cancelar edição
  const handleCancelEdit = () => {
    setIsEditing(false);
    setIsAddingTask(false);
    setEditData({ ...client }); // Reset dos dados de edição
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleTaskChange = (index: number, field: keyof Task, value: string) => {
    const updatedTasks = [...editData.tasks];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    setEditData({ ...editData, tasks: updatedTasks });
  };

  const handleNewTaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTask({ ...newTask, [name]: value });
  };

  const handleAddTask = async () => {
    if (!newTask.description.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      await api.createTask({
        ...newTask,
        client_id: client.id
      });

      onUpdate();
      setIsAddingTask(false);
      setNewTask({
        date: getCurrentDateForInput(),
        description: '',
        status: 'pending',
        priority: 'medium',
        client_id: client.id,
        sla_date: getDefaultSLADate(),
        completion_date: ''
      });
    } catch (error) {
      console.error('Error adding task:', error);
      setError(error instanceof Error ? error.message : 'Failed to add task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Update client information
      await api.updateClient(client.id, {
        name: editData.name,
        company: editData.company,
        origin: editData.origin
      });
      
      // Update all modified tasks
      const updatePromises = editData.tasks.map(async (task, index) => {
        const originalTask = client.tasks[index];
        
        // Check if this task has been modified
        if (originalTask && (
          originalTask.date !== task.date ||
          originalTask.description !== task.description ||
          originalTask.status !== task.status ||
          originalTask.priority !== task.priority ||
          originalTask.sla_date !== task.sla_date ||
          originalTask.completion_date !== task.completion_date
        )) {
          // Task was modified, update it
          return api.updateTask(task.id, {
            date: task.date, // Date is already in correct format (yyyy-mm-dd)
            description: task.description,
            status: task.status,
            priority: task.priority,
            sla_date: task.sla_date,
            completion_date: task.completion_date
          });
        }
        
        return Promise.resolve(); // No update needed
      });
      
      // Wait for all task updates to complete
      await Promise.all(updatePromises);
      
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating client and tasks:', error);
      setError(error instanceof Error ? error.message : 'Failed to update client and tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await api.deleteClient(client.id);
      onUpdate(); // This will refresh the client list and remove the deleted client
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting client:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete client');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return darkMode ? 'text-green-400' : 'text-green-600';
      case 'in progress':
        return darkMode ? 'text-blue-400' : 'text-blue-600';
      case 'pending':
        return darkMode ? 'text-yellow-400' : 'text-yellow-600';
      case 'awaiting client':
        return darkMode ? 'text-purple-400' : 'text-purple-600';
      default:
        return '';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return darkMode ? 'text-red-400' : 'text-red-600';
      case 'medium':
        return darkMode ? 'text-yellow-400' : 'text-yellow-600';
      case 'low':
        return darkMode ? 'text-green-400' : 'text-green-600';
      default:
        return '';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return darkMode ? 'bg-green-900/20' : 'bg-green-50';
      case 'in progress':
        return darkMode ? 'bg-blue-900/20' : 'bg-blue-50';
      case 'pending':
        return darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50';
      case 'awaiting client':
        return darkMode ? 'bg-purple-900/20' : 'bg-purple-50';
      default:
        return darkMode ? 'bg-gray-700' : 'bg-gray-100';
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.deleteTask(taskId);
      onUpdate();
      setContextMenu({ visible: false, x: 0, y: 0, taskIndex: null });
    } catch (error) {
      console.error('Error deleting task:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();

    const task = isEditing ? editData.tasks[index] : client.tasks[index];
    const { clientX, clientY } = e;

    // Verificar os limites da janela
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const menuWidth = 208; // Largura do menu (w-52 = 208px)
    const menuHeight = 320; // Altura aumentada para incluir Edit/Delete

    // Ajustar posição se o menu ultrapassar os limites
    let x = clientX;
    let y = clientY;

    // Ajustar posição horizontal
    if (x + menuWidth > windowWidth) {
      x = windowWidth - menuWidth - 10; // 10px de margem
    }
    if (x < 10) {
      x = 10; // 10px de margem mínima da esquerda
    }

    // Ajustar posição vertical
    if (y + menuHeight > windowHeight) {
      y = windowHeight - menuHeight - 10; // 10px de margem
    }
    if (y < 10) {
      y = 10; // 10px de margem mínima do topo
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
        setError(null);
        await api.updateTaskStatus(contextMenu.task.id, newStatus);
        onUpdate();
      } catch (error) {
        console.error('Error updating task status:', error);
        setError(error instanceof Error ? error.message : 'Failed to update task status');
      } finally {
        setIsLoading(false);
        setContextMenu({ visible: false, x: 0, y: 0, taskIndex: null });
      }
    }
  };

  const handleMoreVerticalClick = (e: React.MouseEvent, task: Task, index: number) => {
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
      taskIndex: index,
      task
    });
  };

  const handleEditTask = () => {
    if (contextMenu.task) {
      setEditingTask(contextMenu.task);
    }
    setContextMenu({ visible: false, x: 0, y: 0, taskIndex: null });
  };

  const getStatusColorText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600';
      case 'in progress':
        return 'text-blue-600';
      case 'pending':
        return 'text-yellow-600';
      case 'awaiting client':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <>
      <div className={`rounded-lg shadow-sm border transition-all duration-300 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      } ${
        isExpanded 
          ? 'transform scale-[1.02] shadow-lg' 
          : 'hover:shadow-md'
      }`}>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div 
              className="flex-1 cursor-pointer"
              onClick={onToggleExpand}
            >
              <h3 className={`text-lg font-semibold transition-colors ${
                darkMode ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'
              }`}>
                {client.name}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {client.company} • {client.origin} • ID: {client.id}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {isExpanded && isEditing && (
                <>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      darkMode 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    } disabled:opacity-50`}
                    disabled={isDeleting}
                    title="Delete this client"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Client'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    title="Cancel editing"
                  >
                    Cancel
                  </button>
                </>
              )}
              
              {/* Edit button - only when expanded and not editing */}
              {isExpanded && !isEditing && (
                <button
                  onClick={handleStartEdit}
                  className={`p-1 rounded-md transition-all duration-300 ${
                    darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                  }`}
                  title="Edit client"
                >
                  ✏️
                </button>
              )}
              
              {/* Save button - only when editing */}
              {isEditing && (
                <button
                  onClick={handleSaveAndExitEdit}
                  className={`p-1 rounded-md transition-all duration-300 ${
                    darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                  } bg-blue-500 text-white`}
                  title="Save changes"
                >
                  💾
                </button>
              )}
              
              {/* Arrow button - always visible */}
              <button
                onClick={onToggleExpand}
                className={`p-1 rounded-md transition-all duration-300 ${
                  darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                }`}
                title={isExpanded ? 'Collapse' : 'Expand'}
                aria-expanded={isExpanded}
              >
                {isExpanded ? '▲' : '▼'}
              </button>
            </div>
          </div>

          <div className="mt-2 w-full">
            <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} mb-1`}>
              <div
                className="h-2 rounded-full bg-green-500 transition-all duration-300"
                style={{ width: `${progress.percent}%` }}
              ></div>
            </div>
            <div className="flex gap-1 h-2">
              {[...Array(progress.highPriority)].map((_, i) => (
                <div key={`high-${i}`} className="flex-1 bg-red-500 rounded"></div>
              ))}
              {[...Array(progress.mediumPriority)].map((_, i) => (
                <div key={`medium-${i}`} className="flex-1 bg-yellow-500 rounded"></div>
              ))}
              {[...Array(progress.lowPriority)].map((_, i) => (
                <div key={`low-${i}`} className="flex-1 bg-blue-500 rounded"></div>
              ))}
            </div>
          </div>

          <div className="mt-2 flex justify-between items-center">
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Tasks: {client.tasks.length} ({progress.percent}% complete)
            </span>
          </div>
        </div>

        {isExpanded && (
          <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} shadow-sm`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Company</label>
                  <input
                    type="text"
                    name="company"
                    value={editData.company}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} shadow-sm`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Origin</label>
                  <input
                    type="text"
                    name="origin"
                    value={editData.origin}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} shadow-sm`}
                  />
                </div>

                <h4 className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tasks</h4>

                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                    <div>
                      <label className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Date</label>
                      <input
                        type="date"
                        name="date"
                        value={newTask.date}
                        onChange={handleNewTaskChange}
                        className={`mt-1 block w-full rounded-md text-xs ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'} shadow-sm`}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Description</label>
                      <input
                        type="text"
                        name="description"
                        value={newTask.description}
                        onChange={handleNewTaskChange}
                        placeholder="New task description"
                        className={`mt-1 block w-full rounded-md text-xs ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'} shadow-sm`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Priority</label>
                      <select
                        name="priority"
                        value={newTask.priority}
                        onChange={handleNewTaskChange}
                        className={`mt-1 block w-full rounded-md text-xs ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'} shadow-sm`}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>SLA Date (Due Date)</label>
                      <input
                        type="date"
                        name="sla_date"
                        value={newTask.sla_date || ''}
                        onChange={handleNewTaskChange}
                        className={`mt-1 block w-full rounded-md text-xs ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'} shadow-sm`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completion Date</label>
                      <input
                        type="date"
                        name="completion_date"
                        value={newTask.completion_date || ''}
                        onChange={handleNewTaskChange}
                        className={`mt-1 block w-full rounded-md text-xs ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'} shadow-sm`}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleAddTask}
                    disabled={!newTask.description.trim()}
                    className={`w-full py-1 rounded-md ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white disabled:opacity-50 text-sm transition-colors`}
                  >
                    Add New Task
                  </button>
                </div>

                {editData.tasks.map((task, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-2`}
                    onContextMenu={(e) => handleContextMenu(e, index)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{task.description}</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <DateDisplay date={task.date} /> • <span className={getPriorityColor(task.priority)}>{task.priority}</span>
                          {task.sla_date && (
                            <>
                              {' • '}
                              <span className={`${getSLAStatusColor(getSLAStatus(task), darkMode)} font-medium`}>
                                {getSLAStatusBadge(getSLAStatus(task))} SLA: <DateDisplay date={task.sla_date} />
                                {getSLAStatus(task) === 'overdue' && (
                                  <span className="font-semibold">
                                    {' '}({Math.abs(getDaysUntilSLA(task) || 0)} days overdue)
                                  </span>
                                )}
                                {getSLAStatus(task) === 'due_today' && (
                                  <span className="font-semibold"> (DUE TODAY)</span>
                                )}
                                {getSLAStatus(task) === 'due_this_week' && getDaysUntilSLA(task) && (
                                  <span className="font-semibold">
                                    {' '}({getDaysUntilSLA(task)} days left)
                                  </span>
                                )}
                              </span>
                            </>
                          )}
                          {task.completion_date && (
                            <>
                              {' • '}
                              <span className="text-green-600 font-medium">
                                ✅ Completed: <DateDisplay date={task.completion_date} />
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* SLA Status Badge */}
                        {task.sla_date && task.status !== 'completed' && (
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            getSLAStatus(task) === 'overdue' 
                              ? 'bg-red-100 text-red-700 border border-red-200' 
                              : getSLAStatus(task) === 'due_today'
                              ? 'bg-orange-100 text-orange-700 border border-orange-200'
                              : getSLAStatus(task) === 'due_this_week'
                              ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                              : 'bg-green-100 text-green-700 border border-green-200'
                          }`}>
                            {getSLAStatusBadge(getSLAStatus(task))} {getSLAStatusText(getSLAStatus(task))}
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)} bg-opacity-100 text-white`}>
                          {task.status}
                        </span>
                        <button
                          onClick={(e) => handleMoreVerticalClick(e, task, index)}
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
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Date</label>
                        <input
                          type="date"
                          value={task.date}
                          onChange={(e) => handleTaskChange(index, 'date', e.target.value)}
                          className={`mt-1 block w-full rounded-md text-xs ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'} shadow-sm`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Priority</label>
                        <select
                          value={task.priority}
                          onChange={(e) => handleTaskChange(index, 'priority', e.target.value as TaskPriority)}
                          className={`mt-1 block w-full rounded-md text-xs ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'} shadow-sm`}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div>
                        <label className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</label>
                        <select
                          value={task.status}
                          onChange={(e) => handleTaskChange(index, 'status', e.target.value as TaskStatus)}
                          className={`mt-1 block w-full rounded-md text-xs ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'} shadow-sm`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="awaiting client">Awaiting Client</option>
                        </select>
                      </div>
                      <div>
                        <label className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>SLA Date (Due Date)</label>
                        <input
                          type="date"
                          value={task.sla_date || ''}
                          onChange={(e) => handleTaskChange(index, 'sla_date', e.target.value)}
                          className={`mt-1 block w-full rounded-md text-xs ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'} shadow-sm`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completion Date</label>
                        <input
                          type="date"
                          value={task.completion_date || ''}
                          onChange={(e) => handleTaskChange(index, 'completion_date', e.target.value)}
                          className={`mt-1 block w-full rounded-md text-xs ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'} shadow-sm`}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className={`w-full py-2 rounded-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white disabled:opacity-50 transition-colors`}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {!isAddingTask && (
                  <button
                    onClick={() => setIsAddingTask(true)}
                    className={`w-full py-2 rounded-md ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white transition-colors`}
                  >
                    Add Task
                  </button>
                )}

                {isAddingTask && (
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-4`}>
                    <div className="grid grid-cols-1 gap-2 mb-2">
                      <div>
                        <label className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Description</label>
                        <input
                          type="text"
                          name="description"
                          value={newTask.description}
                          onChange={handleNewTaskChange}
                          placeholder="Task description"
                          className={`mt-1 block w-full rounded-md text-xs ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'} shadow-sm`}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Date</label>
                          <input
                            type="date"
                            name="date"
                            value={newTask.date}
                            onChange={handleNewTaskChange}
                            className={`mt-1 block w-full rounded-md text-xs ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'} shadow-sm`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Priority</label>
                          <select
                            name="priority"
                            value={newTask.priority}
                            onChange={handleNewTaskChange}
                            className={`mt-1 block w-full rounded-md text-xs ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'} shadow-sm`}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2 mb-2">
                        <div>
                          <label className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</label>
                          <select
                            name="status"
                            value={newTask.status}
                            onChange={handleNewTaskChange}
                            className={`mt-1 block w-full rounded-md text-xs ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'} shadow-sm`}
                          >
                            <option value="pending">Pending</option>
                            <option value="in progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="awaiting client">Awaiting Client</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>SLA Date (Due Date)</label>
                          <input
                            type="date"
                            name="sla_date"
                            value={newTask.sla_date || ''}
                            onChange={handleNewTaskChange}
                            className={`mt-1 block w-full rounded-md text-xs ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'} shadow-sm`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completion Date</label>
                          <input
                            type="date"
                            name="completion_date"
                            value={newTask.completion_date || ''}
                            onChange={handleNewTaskChange}
                            className={`mt-1 block w-full rounded-md text-xs ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'} shadow-sm`}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddTask}
                          disabled={!newTask.description.trim()}
                          className={`flex-1 py-1 rounded-md ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white disabled:opacity-50 text-sm transition-colors`}
                        >
                          Add Task
                        </button>
                        <button
                          onClick={() => setIsAddingTask(false)}
                          className={`px-3 py-1 rounded-md ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'} text-sm transition-colors`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div 
                  className="max-h-72 overflow-y-auto scrollbar-thin"
                  style={{ 
                    maxHeight: `${3 * 6}rem`, // Aproximadamente 3 tasks (6rem cada uma)
                  }}
                >
                  {client.tasks.map((task, index) => (
                    <div
                      key={task.id}
                      className={`rounded-lg border-l-4 transition-all duration-200 hover:shadow-lg mb-3 last:mb-0 ${
                        darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
                      } ${
                        getSLAStatus(task) === 'overdue' 
                          ? 'border-l-red-500 shadow-red-500/20' 
                          : getSLAStatus(task) === 'due_today'
                          ? 'border-l-orange-500 shadow-orange-500/20'
                          : getSLAStatus(task) === 'due_this_week'
                          ? 'border-l-yellow-500 shadow-yellow-500/20'
                          : task.status === 'completed'
                          ? 'border-l-green-500 shadow-green-500/20'
                          : 'border-l-blue-500 shadow-blue-500/20'
                      } shadow-sm`}
                      onContextMenu={(e) => handleContextMenu(e, index)}
                      onTouchStart={(e) => handleTouchStart(e, task, index)}
                      onTouchEnd={handleTouchEnd}
                      onTouchCancel={handleTouchCancel}
                    >
                      {/* Header com status e botão de ações */}
                      <div className="flex justify-between items-start p-3 pb-2">
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
                          title="Task options"
                          aria-label="Task options"
                        >
                          <MoreVerticalIcon size={16} />
                        </button>
                      </div>

                      {/* Conteúdo principal */}
                      <div className="px-3 pb-2">
                        <h4 className={`font-medium leading-tight break-words-enhanced ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {task.description}
                        </h4>
                        
                        {task.completion_date && (
                          <div className="mt-2 flex items-center gap-1 text-green-600">
                            <span className="text-sm">✅</span>
                            <span className="text-xs font-medium">
                              Completed: <DateDisplay date={task.completion_date} />
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Rodapé com SLA */}
                      {task.sla_date && task.status !== 'completed' && (
                        <div className={`px-3 py-2 border-t ${
                          darkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-100 bg-gray-50/50'
                        }`}>
                          <div className={`flex items-center justify-between text-xs`}>
                            <span className={`font-medium ${
                              getSLAStatus(task) === 'overdue' 
                                ? 'text-red-600' 
                                : getSLAStatus(task) === 'due_today'
                                ? 'text-orange-600'
                                : getSLAStatus(task) === 'due_this_week'
                                ? 'text-yellow-600'
                                : 'text-green-600'
                            }`}>
                              {getSLAStatusBadge(getSLAStatus(task))} SLA Due: <DateDisplay date={task.sla_date} />
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
                                                             {getSLAStatus(task) === 'overdue' && `${Math.abs(getDaysUntilSLA(task) || 0)}d overdue`}
                               {getSLAStatus(task) === 'due_today' && 'DUE TODAY'}
                               {getSLAStatus(task) === 'due_this_week' && getDaysUntilSLA(task) && `${getDaysUntilSLA(task)}d left`}
                               {getSLAStatus(task) === 'on_track' && 'On Track'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className={`p-4 mb-4 text-sm rounded-lg ${
            darkMode 
              ? 'bg-red-900/20 text-red-400' 
              : 'bg-red-100 text-red-700'
          }`}>
            {error}
          </div>
        )}

        {isLoading && (
          <div className={`p-4 text-sm ${
            darkMode 
              ? 'text-blue-400' 
              : 'text-blue-600'
          }`}>
            Loading...
          </div>
        )}
      </div>

      {/* Context Menu para botão direito - com opções de Edit e Delete */}
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
            onClick={() => contextMenu.task && handleDeleteTask(contextMenu.task.id)}
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

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onUpdate={onUpdate}
          darkMode={darkMode}
        />
      )}

      {/* Delete Confirmation Dialog - mantém confirmação para exclusão de cliente */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="mb-6">
              Are you sure you want to delete client <strong>{client.name}</strong> from <strong>{client.company}</strong>? 
              This will also delete all {client.tasks.length} associated tasks. This action cannot be undone.
            </p>
            
            {error && (
              <div className={`p-3 mb-4 text-sm rounded-lg ${
                darkMode 
                  ? 'bg-red-900/20 text-red-400' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setError(null);
                }}
                className={`px-4 py-2 rounded transition-colors ${
                  darkMode 
                    ? 'bg-gray-600 hover:bg-gray-500' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClient}
                className={`px-4 py-2 rounded text-white transition-colors ${
                  darkMode 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-red-500 hover:bg-red-600'
                } disabled:opacity-50`}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}