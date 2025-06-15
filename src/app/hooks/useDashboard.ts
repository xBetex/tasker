import { useState, useEffect, useCallback } from 'react';
import { Client, TaskStatus, TaskPriority } from '@/types/types';
import { api } from '@/services/api';
import { useDarkMode, useClients } from '../layout';
import { getCurrentDateForInput, getDefaultSLADate } from '@/utils/dateUtils';
import { getSLAStatus } from '@/utils/slaUtils';
import { useToast } from './useToast';
import { useDragDrop } from '../contexts/DragDropContext';
import { useTimezone } from '../contexts/TimezoneContext';
import { ViewMode } from '../components/ClientViewModeToggle';
import { SLAFilter } from '../components/FilterBar';

export function useDashboard() {
  // Use contexts
  const { darkMode } = useDarkMode();
  const { clients, refreshClients, isLoading } = useClients();
  const { pinnedClients } = useDragDrop();
  const { getTimezoneOffset } = useTimezone();
  const toast = useToast();

  // State
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [orderedClients, setOrderedClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [taskFilter, setTaskFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all' | 'active'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [slaFilter, setSlaFilter] = useState<SLAFilter>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState({ start: '', end: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('compact');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [useInfinityPool, setUseInfinityPool] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('useInfinityPool');
    if (saved !== null) {
      setUseInfinityPool(JSON.parse(saved));
    }
  }, []);

  // Save Infinity Pool preference
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('useInfinityPool', JSON.stringify(useInfinityPool));
    }
  }, [useInfinityPool, isClient]);

  // Create a wrapper for refreshClients that also updates selectedClient
  const refreshClientsAndModal = useCallback(async () => {
    await refreshClients();
    
    if (selectedClient) {
      try {
        const updatedClient = await api.getClient(selectedClient.id);
        if (updatedClient) {
          setSelectedClient(updatedClient);
        }
      } catch (error) {
        console.error('Error fetching updated client:', error);
        const fallbackClient = clients.find(c => c.id === selectedClient.id);
        if (fallbackClient) {
          setSelectedClient(fallbackClient);
        }
      }
    }
  }, [refreshClients, selectedClient, clients]);

  // Separate pinned and unpinned clients, then apply ordering
  const separateAndOrderClients = useCallback((clientsList: Client[]) => {
    const pinned = clientsList.filter(client => pinnedClients.includes(client.id));
    const unpinned = clientsList.filter(client => !pinnedClients.includes(client.id));
    
    const orderedPinned = pinnedClients
      .map(id => pinned.find(client => client.id === id))
      .filter(Boolean) as Client[];
    
    return [...orderedPinned, ...unpinned];
  }, [pinnedClients]);

  // Update ordered clients when clients or pinned clients change
  useEffect(() => {
    const ordered = separateAndOrderClients(clients);
    setOrderedClients(ordered);
  }, [clients, separateAndOrderClients]);

  // Filter clients based on all filter criteria
  useEffect(() => {
    let result = [...orderedClients];

    // Date range filter
    if (dateRangeFilter.start || dateRangeFilter.end) {
      result = result.filter(client => 
        client.tasks.some(task => {
          const taskDate = new Date(task.date);
          const startDate = dateRangeFilter.start ? new Date(dateRangeFilter.start) : null;
          const endDate = dateRangeFilter.end ? new Date(dateRangeFilter.end) : null;
          
          if (startDate && endDate) {
            return taskDate >= startDate && taskDate <= endDate;
          } else if (startDate) {
            return taskDate >= startDate;
          } else if (endDate) {
            return taskDate <= endDate;
          }
          return true;
        })
      );
    }

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(client =>
        client.name.toLowerCase().includes(searchLower) ||
        client.company.toLowerCase().includes(searchLower) ||
        client.origin.toLowerCase().includes(searchLower) ||
        client.id.toLowerCase().includes(searchLower)
      );
    }

    // Task description filter
    if (taskFilter.trim()) {
      const taskLower = taskFilter.toLowerCase();
      result = result.filter(client =>
        client.tasks.some(task =>
          task.description.toLowerCase().includes(taskLower)
        )
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(client =>
        client.tasks.some(task => {
          if (statusFilter === 'active') {
            return task.status === 'in progress' || task.status === 'pending';
          }
          return task.status === statusFilter;
        })
      );
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(client =>
        client.tasks.some(task => task.priority === priorityFilter)
      );
    }

    // SLA filter
    if (slaFilter !== 'all') {
      result = result.filter(client =>
        client.tasks.some(task => {
          const slaStatus = getSLAStatus(task);
          
          switch (slaFilter) {
            case 'overdue':
              return slaStatus === 'overdue';
            case 'due_today':
              return slaStatus === 'due_today';
            case 'due_this_week':
              return slaStatus === 'due_this_week';
            case 'on_track':
              return slaStatus === 'on_track';
            case 'no_sla':
              return slaStatus === 'no_sla';
            default:
              return true;
          }
        })
      );
    }

    setFilteredClients(result);
  }, [orderedClients, searchTerm, taskFilter, statusFilter, priorityFilter, slaFilter, dateRangeFilter]);

  // Calculate statistics based on filtered clients (this is what should be displayed)
  const filteredTasks = filteredClients.flatMap(client => client.tasks);
  const activeTasks = filteredTasks.filter(task => task.status !== 'completed').length;
  const completedTasks = filteredTasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in progress').length;
  const pendingTasks = filteredTasks.filter(task => task.status === 'pending').length;
  const awaitingClientTasks = filteredTasks.filter(task => task.status === 'awaiting client').length;
  
  // Also calculate global statistics for reference
  const allTasks = clients.flatMap(client => client.tasks);
  const totalActiveTasks = allTasks.filter(task => task.status !== 'completed').length;
  const totalCompletedTasks = allTasks.filter(task => task.status === 'completed').length;
  const totalInProgressTasks = allTasks.filter(task => task.status === 'in progress').length;
  const totalPendingTasks = allTasks.filter(task => task.status === 'pending').length;
  const totalAwaitingClientTasks = allTasks.filter(task => task.status === 'awaiting client').length;

  return {
    // State
    error,
    isLoading,
    darkMode,
    clients: orderedClients,
    filteredClients,
    expandedCards,
    searchTerm,
    taskFilter,
    statusFilter,
    priorityFilter,
    slaFilter,
    dateRangeFilter,
    isModalOpen,
    isImporting,
    viewMode,
    selectedClient,
    isDetailModalOpen,
    useInfinityPool,
    isClient,
    pinnedClients,

    // Statistics (Filtered - for main dashboard cards)
    activeTasks,
    completedTasks,
    inProgressTasks,
    pendingTasks,
    awaitingClientTasks,
    
    // Total Statistics (for reference)
    totalActiveTasks,
    totalCompletedTasks,
    totalInProgressTasks,
    totalPendingTasks,
    totalAwaitingClientTasks,

    // Setters
    setExpandedCards,
    setSearchTerm,
    setTaskFilter,
    setStatusFilter,
    setPriorityFilter,
    setSlaFilter,
    setDateRangeFilter,
    setIsModalOpen,
    setViewMode,
    setSelectedClient,
    setIsDetailModalOpen,
    setFilteredClients,
    setIsImporting,

    // Handlers
    refreshClientsAndModal,
    refreshClients,
    toast
  };
} 