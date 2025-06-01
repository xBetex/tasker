'use client'

import { useState, useEffect } from 'react';
import { Client, Task } from '@/types/types';
import { api } from '@/services/api';
import { useDarkMode } from '../layout';
import { usePersistedFilters } from '../hooks/usePersistedFilters';
import { useTaskFilters } from '../hooks/useTaskFilters';
import AnalyticsFilters from '../components/analytics/AnalyticsFilters';

interface TaskListViewProps {
  tasks: Task[];
  clients: Client[];
  darkMode: boolean;
  viewMode: 'table' | 'cards';
  onViewModeChange: (mode: 'table' | 'cards') => void;
}

function TaskListView({ tasks, clients, darkMode, viewMode, onViewModeChange }: TaskListViewProps) {
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.name} (${client.company})` : 'Unknown Client';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return darkMode ? 'text-red-400' : 'text-red-600';
      case 'medium': return darkMode ? 'text-yellow-400' : 'text-yellow-600';
      case 'low': return darkMode ? 'text-green-400' : 'text-green-600';
      default: return darkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return darkMode ? 'bg-green-600' : 'bg-green-500';
      case 'in progress': return darkMode ? 'bg-blue-600' : 'bg-blue-500';
      case 'pending': return darkMode ? 'bg-yellow-600' : 'bg-yellow-500';
      case 'awaiting client': return darkMode ? 'bg-orange-600' : 'bg-orange-500';
      default: return darkMode ? 'bg-gray-600' : 'bg-gray-500';
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  if (viewMode === 'table') {
    return (
      <div className={`rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-lg overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  <button 
                    onClick={() => {
                      if (sortBy === 'date') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('date');
                        setSortOrder('desc');
                      }
                    }}
                    className="flex items-center gap-1 hover:text-blue-500"
                  >
                    Date
                    {sortBy === 'date' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Description
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  <button 
                    onClick={() => {
                      if (sortBy === 'status') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('status');
                        setSortOrder('asc');
                      }
                    }}
                    className="flex items-center gap-1 hover:text-blue-500"
                  >
                    Status
                    {sortBy === 'status' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  <button 
                    onClick={() => {
                      if (sortBy === 'priority') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('priority');
                        setSortOrder('desc');
                      }
                    }}
                    className="flex items-center gap-1 hover:text-blue-500"
                  >
                    Priority
                    {sortBy === 'priority' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  Client
                </th>
              </tr>
            </thead>
            <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {sortedTasks.map((task) => (
                <tr key={task.id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {new Date(task.date).toLocaleDateString()}
                  </td>
                  <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    <div className="max-w-xs truncate">{task.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority.toUpperCase()}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {getClientName(task.client_id)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Cards view
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedTasks.map((task) => (
        <div key={task.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow hover:shadow-lg transition-shadow`}>
          <div className="flex items-start justify-between mb-2">
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {new Date(task.date).toLocaleDateString()}
            </div>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
          </div>
          
          <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {task.description}
          </h3>
          
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority.toUpperCase()} Priority
            </span>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {getClientName(task.client_id)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FilteredTasksPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  const { darkMode } = useDarkMode();
  
  // Use persisted filters (same storage key as analytics for consistency)
  const {
    filters,
    isLoaded: filtersLoaded,
    setStatusFilter,
    setPriorityFilter,
    setClientSearch,
    setSelectedClientId,
    setDateRange,
    clearFilters
  } = usePersistedFilters('analytics-filters');

  // Use task filtering logic
  const { filteredTasks, stats } = useTaskFilters(clients, filters);

  const fetchClients = async () => {
    try {
      const data = await api.getClients();
      setClients(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch clients');
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  if (loading || !filtersLoaded) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-xl">Loading Tasks...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <div className="text-center">
          <div className="text-xl text-red-500 mb-4">{error}</div>
          <button 
            onClick={fetchClients}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Filtered Tasks</h1>
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {stats.totalTasks} tasks found matching your filters
              </p>
            </div>
            
            <div className="flex gap-3">
              <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 text-sm transition-colors ${
                    viewMode === 'table'
                      ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                      : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-4 py-2 text-sm transition-colors ${
                    viewMode === 'cards'
                      ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                      : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cards
                </button>
              </div>
              
              <button
                onClick={clearFilters}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <AnalyticsFilters
          dateRange={filters.dateRange}
          setDateRange={setDateRange}
          statusFilter={filters.statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={filters.priorityFilter}
          setPriorityFilter={setPriorityFilter}
          clientSearch={filters.clientSearch}
          setClientSearch={setClientSearch}
          selectedClientId={filters.selectedClientId}
          setSelectedClientId={setSelectedClientId}
          clients={clients}
          darkMode={darkMode}
        />

        {/* Task List */}
        <div className="mb-8">
          <TaskListView
            tasks={filteredTasks}
            clients={clients}
            darkMode={darkMode}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-medium mb-2">No tasks found</h3>
            <p>Try adjusting your filters to see more results.</p>
          </div>
        )}
      </div>
    </div>
  );
} 