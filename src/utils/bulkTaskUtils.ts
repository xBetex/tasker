import { Client, Task } from '@/types/types';

/**
 * Filtra clientes baseado no tipo de tab (ativa ou concluída)
 */
export const filterClientsByTabType = (
  clients: Client[],
  tabType: 'active' | 'completed'
): Client[] => {
  return clients.map(client => {
    const filteredTasks = client.tasks.filter(task => {
      if (tabType === 'completed') {
        return task.status === 'completed';
      } else {
        return task.status !== 'completed';
      }
    });

    return {
      ...client,
      tasks: filteredTasks
    };
  }).filter(client => client.tasks.length > 0); // Remove clientes sem tarefas na categoria
};

/**
 * Conta tarefas por tipo
 */
export const countTasksByType = (clients: Client[]): {
  active: number;
  completed: number;
  total: number;
} => {
  let active = 0;
  let completed = 0;

  clients.forEach(client => {
    client.tasks.forEach(task => {
      if (task.status === 'completed') {
        completed++;
      } else {
        active++;
      }
    });
  });

  return {
    active,
    completed,
    total: active + completed
  };
};