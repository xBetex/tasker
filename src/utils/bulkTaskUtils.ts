import { Client, Task } from '@/types/types';
import { api } from '@/services/api';

/**
 * Verifica se uma tarefa é de mais de uma semana atrás
 */
export const isTaskOlderThanWeek = (taskDate: string): boolean => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const taskDateObj = new Date(taskDate);
  return taskDateObj < oneWeekAgo;
};

/**
 * Filtra tarefas que são de mais de uma semana e não estão concluídas
 */
export const getOldIncompleteTasks = (clients: Client[]): Array<{client: Client, task: Task}> => {
  const oldTasks: Array<{client: Client, task: Task}> = [];
  
  clients.forEach(client => {
    client.tasks.forEach(task => {
      if (task.status !== 'completed' && isTaskOlderThanWeek(task.date)) {
        oldTasks.push({ client, task });
      }
    });
  });
  
  return oldTasks;
};

/**
 * Conta tarefas antigas que podem ser concluídas em massa
 */
export const countOldIncompleteTasks = (clients: Client[]): number => {
  return getOldIncompleteTasks(clients).length;
};

/**
 * Concluir todas as tarefas de mais de uma semana em massa
 */
export const bulkCompleteOldTasks = async (
  clients: Client[],
  onProgress?: (completed: number, total: number) => void
): Promise<{
  success: number;
  failed: Array<{clientId: string, taskId: number, error: string}>;
}> => {
  const oldTasks = getOldIncompleteTasks(clients);
  const results = {
    success: 0,
    failed: [] as Array<{clientId: string, taskId: number, error: string}>
  };

  // Processa as tarefas em lotes para não sobrecarregar a API
  const batchSize = 5;
  
  for (let i = 0; i < oldTasks.length; i += batchSize) {
    const batch = oldTasks.slice(i, i + batchSize);
    
    // Processa lote em paralelo
    const batchPromises = batch.map(async ({ client, task }) => {
      try {
        await api.updateTask(task.id, {
          status: 'completed',
          completion_date: new Date().toISOString().split('T')[0]
        });
        results.success++;
        
        // Callback de progresso
        if (onProgress) {
          onProgress(results.success, oldTasks.length);
        }
        
        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.failed.push({
          clientId: client.id,
          taskId: task.id,
          error: errorMessage
        });
        return { success: false };
      }
    });

    // Aguarda o lote atual antes de processar o próximo
    await Promise.allSettled(batchPromises);
    
    // Pequena pausa entre lotes para não sobrecarregar
    if (i + batchSize < oldTasks.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
};

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

/**
 * Gera relatório de conclusão em massa
 */
export const generateBulkCompletionReport = (
  results: {success: number, failed: Array<{clientId: string, taskId: number, error: string}>},
  totalTasks: number
): string => {
  const successRate = ((results.success / totalTasks) * 100).toFixed(1);
  
  let report = `📊 Relatório de Conclusão em Massa:\n\n`;
  report += `✅ Concluídas com sucesso: ${results.success} de ${totalTasks} (${successRate}%)\n`;
  
  if (results.failed.length > 0) {
    report += `❌ Falharam: ${results.failed.length}\n\n`;
    report += `Detalhes dos erros:\n`;
    results.failed.forEach(({clientId, taskId, error}, index) => {
      report += `${index + 1}. Cliente ${clientId}, Tarefa ${taskId}: ${error}\n`;
    });
  } else {
    report += `🎉 Todas as tarefas foram concluídas com sucesso!`;
  }
  
  return report;
}; 