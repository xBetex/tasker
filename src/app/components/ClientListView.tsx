import { useState } from 'react';
import { Client, TaskStatus } from '@/types/types';
import DateDisplay from './DateDisplay';
import { getSLAStatus, getSLAStatusColor, getDaysUntilSLA } from '@/utils/slaUtils';
import { ExternalLinkIcon } from './Icons';

interface ClientListViewProps {
  clients: Client[];
  onClientClick: (client: Client) => void;
  darkMode: boolean;
}

export default function ClientListView({ 
  clients, 
  onClientClick, 
  darkMode 
}: ClientListViewProps) {
  const [sortBy, setSortBy] = useState<'name' | 'company' | 'tasks' | 'progress'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const getTaskStats = (client: Client) => {
    const total = client.tasks.length;
    const completed = client.tasks.filter(t => t.status === 'completed').length;
    const pending = client.tasks.filter(t => t.status === 'pending').length;
    const inProgress = client.tasks.filter(t => t.status === 'in progress').length;
    const awaitingClient = client.tasks.filter(t => t.status === 'awaiting client').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, pending, inProgress, awaitingClient, progress };
  };

  const getUrgentTasks = (client: Client) => {
    return client.tasks.filter(task => {
      if (task.status === 'completed') return false;
      if (!task.sla_date) return false;
      
      const daysUntil = getDaysUntilSLA(task);
      return daysUntil !== null && daysUntil <= 2; // Urgent if due in 2 days or less
    }).length;
  };

  const sortedClients = [...clients].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'company':
        aValue = a.company.toLowerCase();
        bValue = b.company.toLowerCase();
        break;
      case 'tasks':
        aValue = a.tasks.length;
        bValue = b.tasks.length;
        break;
      case 'progress':
        aValue = getTaskStats(a).progress;
        bValue = getTaskStats(b).progress;
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return sortOrder === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    }
  });

  const handleSort = (column: 'name' | 'company' | 'tasks' | 'progress') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const SortHeader = ({ 
    column, 
    children 
  }: { 
    column: 'name' | 'company' | 'tasks' | 'progress'; 
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => handleSort(column)}
      className={`flex items-center gap-1 text-left font-medium text-sm ${
        darkMode ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-gray-900'
      } transition-colors`}
    >
      {children}
      <span className="text-xs">
        {sortBy === column ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
      </span>
    </button>
  );

  return (
    <div className={`rounded-lg shadow-sm border ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${
        darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-3">
            <SortHeader column="name">Client</SortHeader>
          </div>
          <div className="col-span-3">
            <SortHeader column="company">Company</SortHeader>
          </div>
          <div className="col-span-2">
            <SortHeader column="tasks">Tasks</SortHeader>
          </div>
          <div className="col-span-2">
            <SortHeader column="progress">Progress</SortHeader>
          </div>
          <div className="col-span-1 text-center">
            <span className={`text-sm font-medium ${
              darkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Urgent
            </span>
          </div>
          <div className="col-span-1"></div>
        </div>
      </div>

      {/* Body */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {sortedClients.map((client) => {
          const stats = getTaskStats(client);
          const urgentCount = getUrgentTasks(client);
          
          return (
            <div
              key={client.id}
              className={`px-4 py-3 transition-colors cursor-pointer ${
                darkMode 
                  ? 'hover:bg-gray-700 text-gray-100' 
                  : 'hover:bg-gray-50 text-gray-900'
              }`}
              onClick={() => onClientClick(client)}
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Client Name */}
                <div className="col-span-3">
                  <div className="font-medium text-sm">{client.name}</div>
                  <div className={`text-xs ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {client.origin} • ID: {client.id}
                  </div>
                </div>

                {/* Company */}
                <div className="col-span-3">
                  <div className="text-sm font-medium">{client.company}</div>
                </div>

                {/* Tasks Count */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{stats.total}</span>
                    <div className="flex gap-1">
                      {stats.completed > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {stats.completed}
                        </span>
                      )}
                      {stats.inProgress > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {stats.inProgress}
                        </span>
                      )}
                      {stats.pending > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {stats.pending}
                        </span>
                      )}
                      {stats.awaitingClient > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {stats.awaitingClient}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 h-2 rounded-full ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <div
                        className="h-2 rounded-full bg-green-500 transition-all duration-300"
                        style={{ width: `${stats.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium min-w-[3rem] text-right">
                      {stats.progress}%
                    </span>
                  </div>
                </div>

                {/* Urgent Tasks */}
                <div className="col-span-1 text-center">
                  {urgentCount > 0 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-800 text-xs font-bold">
                      {urgentCount}
                    </span>
                  ) : (
                    <span className={`text-xs ${
                      darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      -
                    </span>
                  )}
                </div>

                {/* Action */}
                <div className="col-span-1 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClientClick(client);
                    }}
                    className={`p-1 rounded-md transition-colors ${
                      darkMode 
                        ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200' 
                        : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                    }`}
                    title="Ver detalhes"
                  >
                    <ExternalLinkIcon size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sortedClients.length === 0 && (
        <div className={`text-center py-8 ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <p>Nenhum cliente encontrado</p>
        </div>
      )}
    </div>
  );
} 