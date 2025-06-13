import { useMemo } from 'react';
import { Client, Task } from '@/types/types';

export interface SLANotification {
  id: string;
  type: 'overdue' | 'due_today' | 'due_soon';
  message: string;
  taskId: number;
  clientId: string;
  clientName: string;
  clientCompany: string;
  taskDescription: string;
  slaDate: string;
  daysUntilDue: number;
}

export const useSLANotifications = (clients: Client[]) => {
  const notifications = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const notifications: SLANotification[] = [];

    clients.forEach(client => {
      client.tasks.forEach(task => {
        // Only check tasks that are not completed and have an SLA date
        if (task.status !== 'completed' && task.sla_date) {
          const slaDate = new Date(task.sla_date);
          const slaDateOnly = new Date(slaDate.getFullYear(), slaDate.getMonth(), slaDate.getDate());
          const diffTime = slaDateOnly.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          let type: 'overdue' | 'due_today' | 'due_soon';
          let message: string;

          if (diffDays < 0) {
            type = 'overdue';
            const overdueDays = Math.abs(diffDays);
            message = `SLA overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''}`;
          } else if (diffDays === 0) {
            type = 'due_today';
            message = 'SLA due today';
          } else if (diffDays <= 3) {
            type = 'due_soon';
            message = `SLA due in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
          } else {
            return; // SLA is not urgent
          }

          notifications.push({
            id: `${client.id}-${task.id}`,
            type,
            message,
            taskId: task.id,
            clientId: client.id,
            clientName: client.name,
            clientCompany: client.company,
            taskDescription: task.description,
            slaDate: task.sla_date,
            daysUntilDue: diffDays
          });
        }
      });
    });

    // Sort by urgency (overdue first, then due today, then due soon)
    return notifications.sort((a, b) => {
      const urgencyOrder = { overdue: 0, due_today: 1, due_soon: 2 };
      if (urgencyOrder[a.type] !== urgencyOrder[b.type]) {
        return urgencyOrder[a.type] - urgencyOrder[b.type];
      }
      return a.daysUntilDue - b.daysUntilDue;
    });
  }, [clients]);

  const overdueCount = notifications.filter(n => n.type === 'overdue').length;
  const dueTodayCount = notifications.filter(n => n.type === 'due_today').length;
  const dueSoonCount = notifications.filter(n => n.type === 'due_soon').length;
  const totalUrgentCount = overdueCount + dueTodayCount + dueSoonCount;

  return {
    notifications,
    overdueCount,
    dueTodayCount,
    dueSoonCount,
    totalUrgentCount,
    hasUrgentTasks: totalUrgentCount > 0
  };
}; 