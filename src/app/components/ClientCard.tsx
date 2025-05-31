import { useState, useRef, useEffect } from 'react';
import { Client, Task, TaskStatus, TaskPriority } from '@/types/types';
import EditTaskModal from './EditTaskModal';
import { api } from '@/services/api';

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
    date: new Date().toISOString().split('T')[0],
    description: '',
    status: 'pending',
    priority: 'medium',
    client_id: client.id
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
        date: new Date().toISOString().split('T')[0],
        description: '',
        status: 'pending',
        priority: 'medium',
        client_id: client.id
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
      
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating client:', error);
      setError(error instanceof Error ? error.message : 'Failed to update client');
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
        return darkMode ? 'bg-gray-700' : 'bg-gray-50';
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.deleteTask(taskId);
      onUpdate();
    } catch (error) {
      console.error('Error deleting task:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete task');
    } finally {
      setIsLoading(false);
      setContextMenu({ visible: false, x: 0, y: 0, taskIndex: null });
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
    const menuWidth = 192; // Largura aproximada do menu (48 * 4)
    const menuHeight = 240; // Altura aproximada do menu

    // Ajustar posição se o menu ultrapassar os limites
    const x = clientX + menuWidth > windowWidth ? windowWidth - menuWidth : clientX;
    const y = clientY + menuHeight > windowHeight ? windowHeight - menuHeight : clientY;

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

  const getStatusColorText = (status: string) => {
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

  return (
    <>
      <div className={`rounded-lg overflow-hidden shadow-lg transition-all duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div
          className={`p-4 cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
          onClick={onToggleExpand}
        >
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">{client.name}</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {client.company} • {client.origin} • ID: {client.id}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    darkMode 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  } disabled:opacity-50`}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Client'}
                </button>
              )}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3 py-1 rounded-md text-sm ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
              <button
                onClick={onToggleExpand}
                className={`p-1 rounded-md ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
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
                  <button
                    onClick={handleAddTask}
                    disabled={!newTask.description.trim()}
                    className={`w-full py-1 rounded-md ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white disabled:opacity-50 text-sm`}
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
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium">{task.description}</h5>
                      <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Delete
                        </button>
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
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleSave}
                  className={`w-full py-2 rounded-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Tasks</h4>
                  <button
                    onClick={() => setIsAddingTask(!isAddingTask)}
                    className={`px-2 py-1 text-xs rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                  >
                    {isAddingTask ? 'Cancel' : '+ Add Task'}
                  </button>
                </div>

                {isAddingTask && (
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-3`}>
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
                    <button
                      onClick={handleAddTask}
                      disabled={!newTask.description.trim()}
                      className={`w-full py-1 rounded-md ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white disabled:opacity-50 text-sm`}
                    >
                      Add Task
                    </button>
                  </div>
                )}

                {client.tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg ${getStatusBgColor(task.status)}`}
                    onContextMenu={(e) => handleContextMenu(e, index)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{task.description}</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {task.date} • {task.priority}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)} bg-opacity-100 text-white`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
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

      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className={`fixed z-50 py-1 rounded-md shadow-lg w-48 ${darkMode ? 'bg-gray-700' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
          style={{
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            maxHeight: 'calc(100vh - 20px)',
            overflowY: 'auto',
          }}
        >
          <div className={`px-3 py-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Change Status
          </div>
          <button
            onClick={() => handleStatusChange('pending')}
            disabled={isLoading}
            className={`flex items-center w-full text-left px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'} ${contextMenu.task?.status === 'pending' ? (darkMode ? 'bg-gray-600' : 'bg-gray-200') : ''} disabled:opacity-50`}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"></span>
            Pending
          </button>
          <button
            onClick={() => handleStatusChange('in progress')}
            disabled={isLoading}
            className={`flex items-center w-full text-left px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'} ${contextMenu.task?.status === 'in progress' ? (darkMode ? 'bg-gray-600' : 'bg-gray-200') : ''} disabled:opacity-50`}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
            In Progress
          </button>
          <button
            onClick={() => handleStatusChange('completed')}
            disabled={isLoading}
            className={`flex items-center w-full text-left px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'} ${contextMenu.task?.status === 'completed' ? (darkMode ? 'bg-gray-600' : 'bg-gray-200') : ''} disabled:opacity-50`}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            Completed
          </button>
          <button
            onClick={() => handleStatusChange('awaiting client')}
            disabled={isLoading}
            className={`flex items-center w-full text-left px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'} ${contextMenu.task?.status === 'awaiting client' ? (darkMode ? 'bg-gray-600' : 'bg-gray-200') : ''} disabled:opacity-50`}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
            Awaiting Client
          </button>
          <div className="border-t my-1"></div>
          <button
            onClick={() => contextMenu.task && handleDeleteTask(contextMenu.task.id)}
            disabled={isLoading}
            className={`block w-full text-left px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-600 text-red-400' : 'hover:bg-gray-100 text-red-600'} disabled:opacity-50`}
          >
            Delete Task
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

      {/* Delete Confirmation Dialog */}
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
                className={`px-4 py-2 rounded ${
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
                className={`px-4 py-2 rounded text-white ${
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