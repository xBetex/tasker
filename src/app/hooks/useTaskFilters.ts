import { useMemo } from 'react';
import { Client, Task, TaskStatus, TaskPriority } from '@/types/types';
import { SLAFilter } from '@/app/components/FilterBar';
import { getSLAStatus } from '@/utils/slaUtils';

interface FilterOptions {
  statusFilter: TaskStatus | 'all';
  priorityFilter: TaskPriority | 'all';
  clientSearch: string;
  selectedClientId: string | null; // Cliente específico selecionado
  dateRange: { start: string; end: string };
  selectedClients?: string[];
  slaFilter: SLAFilter;
}

interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  awaitingClientTasks: number;
  highPriorityTasks: number;
  mediumPriorityTasks: number;
  lowPriorityTasks: number;
  completionRate: number;
  overdueTasks: number;
}

interface UseTaskFiltersReturn {
  filteredTasks: Task[];
  filteredClients: Client[];
  stats: TaskStats;
}

export function useTaskFilters(
  clients: Client[],
  filters: FilterOptions
): UseTaskFiltersReturn {
  const { statusFilter, priorityFilter, clientSearch, selectedClientId, dateRange, selectedClients, slaFilter } = filters;

  const filteredData = useMemo(() => {
    // First filter clients based on search and selection
    let workingClients = clients;

    // Filter by specific selected client (priority over other client filters)
    if (selectedClientId) {
      workingClients = workingClients.filter(client => client.id === selectedClientId);
    } else {
      // Filter by selected clients (bulk selection)
      if (selectedClients && selectedClients.length > 0) {
        workingClients = workingClients.filter(client => 
          selectedClients.includes(client.id)
        );
      }

      // Filter by client search (text search)
      if (clientSearch.trim()) {
        const searchLower = clientSearch.toLowerCase();
        workingClients = workingClients.filter(client =>
          client.name.toLowerCase().includes(searchLower) ||
          client.company.toLowerCase().includes(searchLower)
        );
      }
    }

    // Get all tasks from filtered clients
    let allTasks: Task[] = workingClients.flatMap(client => 
      client.tasks.map(task => ({ ...task, client_id: client.id }))
    );

    // Filter by date range
    if (dateRange.start || dateRange.end) {
      allTasks = allTasks.filter(task => {
        // As datas das tasks já estão no formato YYYY-MM-DD (ex: "2025-04-19")
        // Apenas extrair a parte da data se houver timestamp (remover hora se existir)
        const taskDateStr = task.date.includes('T') ? task.date.split('T')[0] : task.date;
        
        // Comparação direta de strings no formato YYYY-MM-DD funciona perfeitamente
        if (dateRange.start && dateRange.end) {
          return taskDateStr >= dateRange.start && taskDateStr <= dateRange.end;
        } else if (dateRange.start) {
          return taskDateStr >= dateRange.start;
        } else if (dateRange.end) {
          return taskDateStr <= dateRange.end;
        }
        
        return true;
      });
    }

    // Filter by status
    if (statusFilter !== 'all') {
      allTasks = allTasks.filter(task => task.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
      allTasks = allTasks.filter(task => task.priority === priorityFilter);
    }

    // Filter by SLA status
    if (slaFilter !== 'all') {
      allTasks = allTasks.filter(task => {
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
      });
    }

    // Calculate overdue tasks (tasks older than 30 days that are not completed)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]; // Formato YYYY-MM-DD

    const overdueTasks = allTasks.filter(task => {
      if (task.status === 'completed') return false;
      
      // Usar o mesmo padrão de extração de data
      const taskDateStr = task.date.includes('T') ? task.date.split('T')[0] : task.date;
      return taskDateStr < thirtyDaysAgoStr;
    });

    // Calculate stats
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = allTasks.filter(task => task.status === 'in progress').length;
    const pendingTasks = allTasks.filter(task => task.status === 'pending').length;
    const awaitingClientTasks = allTasks.filter(task => task.status === 'awaiting client').length;
    const highPriorityTasks = allTasks.filter(task => task.priority === 'high').length;
    const mediumPriorityTasks = allTasks.filter(task => task.priority === 'medium').length;
    const lowPriorityTasks = allTasks.filter(task => task.priority === 'low').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const stats: TaskStats = {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      awaitingClientTasks,
      highPriorityTasks,
      mediumPriorityTasks,
      lowPriorityTasks,
      completionRate,
      overdueTasks: overdueTasks.length
    };

    return {
      filteredTasks: allTasks,
      filteredClients: workingClients,
      stats
    };
  }, [clients, statusFilter, priorityFilter, clientSearch, selectedClientId, dateRange, selectedClients, slaFilter]);

  return filteredData;
} 