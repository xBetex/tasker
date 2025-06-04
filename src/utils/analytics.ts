import { Client, Task, TaskStatus, TaskPriority } from '@/types/types';
import { TaskAnalytics, ClientAnalytics } from '@/types/analytics';
import { format, parseISO, isWithinInterval } from 'date-fns';

export function calculateClientAnalytics(client: Client): ClientAnalytics {
  const totalTasks = client.tasks.length;
  const completedTasks = client.tasks.filter(task => task.status === 'completed').length;
  
  const tasksByStatus = client.tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<TaskStatus, number>);

  const tasksByPriority = client.tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {} as Record<TaskPriority, number>);

  return {
    clientId: client.id,
    clientName: client.name,
    totalTasks,
    completedTasks,
    completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    tasksByStatus,
    tasksByPriority
  };
}

export function calculateTaskAnalytics(
  clients: Client[],
  startDate?: Date,
  endDate?: Date
): TaskAnalytics {
  const filteredClients = clients.map(client => ({
    ...client,
    tasks: client.tasks.filter(task => {
      if (!startDate || !endDate) return true;
      const taskDate = parseISO(task.date);
      return isWithinInterval(taskDate, { start: startDate, end: endDate });
    })
  }));

  // Completion rate by client
  const completionRateByClient = {
    labels: filteredClients.map(client => client.name),
    data: filteredClients.map(client => {
      const analytics = calculateClientAnalytics(client);
      return analytics.completionRate;
    })
  };

  // Tasks by status
  const allStatuses = ['pending', 'in progress', 'completed', 'awaiting client'] as TaskStatus[];
  const tasksByStatus = {
    labels: allStatuses,
    data: allStatuses.map(status =>
      filteredClients.reduce(
        (sum, client) =>
          sum + client.tasks.filter(task => task.status === status).length,
        0
      )
    )
  };

  // Tasks by priority
  const allPriorities = ['low', 'medium', 'high'] as TaskPriority[];
  const tasksByPriority = {
    labels: allPriorities,
    data: allPriorities.map(priority =>
      filteredClients.reduce(
        (sum, client) =>
          sum + client.tasks.filter(task => task.priority === priority).length,
        0
      )
    )
  };

  // Task trends
  const taskTrends = calculateTaskTrends(filteredClients, startDate, endDate);

  return {
    completionRateByClient,
    tasksByStatus,
    tasksByPriority,
    taskTrends
  };
}

function calculateTaskTrends(
  clients: Client[],
  startDate?: Date,
  endDate?: Date
) {
  const allTasks = clients.flatMap(client => client.tasks);
  const dateMap = new Map<string, { completed: number; created: number }>();

  // Initialize with zero values for all dates in range
  if (startDate && endDate) {
    let currentDate = startDate;
    while (currentDate <= endDate) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      dateMap.set(dateKey, { completed: 0, created: 0 });
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }
  }

  // Count tasks by date
  allTasks.forEach(task => {
    const dateKey = task.date.split('T')[0];
    const current = dateMap.get(dateKey) || { completed: 0, created: 0 };
    
    current.created++;
    if (task.status === 'completed') {
      current.completed++;
    }
    
    dateMap.set(dateKey, current);
  });

  // Convert to arrays
  const sortedDates = Array.from(dateMap.keys()).sort();
  return {
    labels: sortedDates,
    completed: sortedDates.map(date => dateMap.get(date)?.completed || 0),
    created: sortedDates.map(date => dateMap.get(date)?.created || 0)
  };
}

export const chartColors = {
  status: {
    pending: '#FCD34D',      // Yellow
    'in progress': '#60A5FA', // Blue
    completed: '#34D399',     // Green
    'awaiting client': '#A78BFA' // Purple
  },
  priority: {
    low: '#60A5FA',    // Blue
    medium: '#FCD34D', // Yellow
    high: '#EF4444'    // Red
  }
}; 