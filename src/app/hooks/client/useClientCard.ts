import { useState, useRef, useEffect, useCallback } from 'react';
import { Client, Task, TaskStatus } from '@/types/types';
import { api } from '@/services/api';
import { getCurrentDateForInput, getDefaultSLADate } from '@/utils/dateUtils';
import { useToast } from '../useToast';
import { useScroll } from '../../contexts/ScrollContext';

export function useClientCard(client: Client, onUpdate: () => void, onDeleteTask: (clientId: string, taskIndex: number) => void) {
  const { setFocusedTaskId } = useScroll();
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
  const [isAddingComment, setIsAddingComment] = useState(false);
  
  // Estados para long press
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);

  const contextMenuRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

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

    setIsLoading(true);
    try {
      const taskToAdd = {
        ...newTask,
        client_id: client.id,
        comments: []
      };

      await api.createTask(taskToAdd);
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
      toast.success('Task added', 'The task was added successfully!');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Error', 'Error adding task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await api.updateClient(client.id, editData);
      onUpdate();
      toast.success('Client saved', 'Changes were saved successfully!');
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Error', 'Error saving changes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      await api.deleteClient(client.id);
      onUpdate();
      toast.success('Client deleted', 'The client was deleted successfully!');
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Error', 'Error deleting client. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await api.deleteTask(taskId);
      onUpdate();
      setContextMenu({ visible: false, x: 0, y: 0, taskIndex: null });
      toast.success('Task deleted', 'The task was deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Error', 'Error deleting task. Please try again.');
    }
  };

  const handleAddComment = async (taskId: number, commentText: string) => {
    try {
      setIsAddingComment(true);
      await api.addComment(taskId, commentText);
      
      // Definir a tarefa como focada antes de atualizar
      setFocusedTaskId(taskId);
      onUpdate();
      toast.success('Comment added', 'The comment was added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Error', 'Error adding comment. Please try again.');
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!contextMenu.task) return;

    try {
      const updatedTask = { ...contextMenu.task, status: newStatus };
      await api.updateTask(contextMenu.task.id, updatedTask);
      
      // Definir a tarefa como focada antes de atualizar para trigger enhanced scroll
      setFocusedTaskId(contextMenu.task.id);
      
      // Close context menu immediately for better UX
      setContextMenu({ visible: false, x: 0, y: 0, taskIndex: null });
      
      // Update data
      onUpdate();
      
      // Success notification with enhanced animation
      toast.success('Status updated', `Task status changed to "${newStatus}"!`);
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Error', 'Error updating status. Please try again.');
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
    
    // Posicionar o menu próximo ao clique, mas ajustar se estiver muito perto das bordas
    let x = rect.left;
    let y = rect.bottom + 5; // 5px de margem
    
    // Ajustar posição horizontal
    if (x + menuWidth > windowWidth) {
      x = windowWidth - menuWidth - 10; // 10px de margem
    }
    if (x < 10) {
      x = 10; // Margem mínima da esquerda
    }
    
    // Ajustar posição vertical
    if (y + menuHeight > windowHeight) {
      y = rect.top - menuHeight - 5; // Mostrar acima do botão
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

  return {
    // Estados
    isEditing,
    setIsEditing,
    isAddingTask,
    setIsAddingTask,
    editData,
    setEditData,
    newTask,
    setNewTask,
    contextMenu,
    setContextMenu,
    editingTask,
    setEditingTask,
    isLoading,
    error,
    showDeleteConfirm,
    setShowDeleteConfirm,
    isDeleting,
    isAddingComment,
    longPressTimer,
    isLongPress,
    contextMenuRef,
    progress,
    
    // Handlers
    handleInputChange,
    handleTaskChange,
    handleNewTaskChange,
    handleAddTask,
    handleSave,
    handleDeleteClient,
    handleDeleteTask,
    handleAddComment,
    handleStatusChange,
    handleMoreVerticalClick,
    handleTouchStart,
    handleTouchEnd,
    handleTouchCancel,
  };
} 