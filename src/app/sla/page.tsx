'use client'

import { useState, useEffect } from 'react';
import { Client, Task, TaskStatus } from '@/types/types';
import { api } from '@/services/api';
import { useDarkMode } from '../layout';
import { useSLANotifications, SLANotification } from '../hooks/useSLANotifications';
import DateDisplay from '../components/DateDisplay';
import EditTaskModal from '../components/EditTaskModal';
import { MoreVerticalIcon, EditIcon, CheckIcon, AlertTriangleIcon, ClockIcon, XCircleIcon } from '../components/Icons';

interface SLAStats {
  total: number;
  overdue: number;
  dueToday: number;
  dueSoon: number;
  onTrack: number;
}

export default function SLAPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'overdue' | 'due_today' | 'due_soon'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'sla' | 'priority'>('sla');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
  const { darkMode } = useDarkMode();
  const slaNotifications = useSLANotifications(clients);

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

  // Calculate SLA statistics
  const calculateSLAStats = (): SLAStats => {
    const allTasks = clients.flatMap(client => 
      client.tasks.filter(task => task.status !== 'completed' && task.sla_date)
    );

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let overdue = 0;
    let dueToday = 0;
    let dueSoon = 0;
    let onTrack = 0;

    allTasks.forEach(task => {
      if (task.sla_date) {
        const slaDate = new Date(task.sla_date);
        const slaDateOnly = new Date(slaDate.getFullYear(), slaDate.getMonth(), slaDate.getDate());
        const diffTime = slaDateOnly.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          overdue++;
        } else if (diffDays === 0) {
          dueToday++;
        } else if (diffDays <= 3) {
          dueSoon++;
        } else {
          onTrack++;
        }
      }
    });

    return {
      total: allTasks.length,
      overdue,
      dueToday,
      dueSoon,
      onTrack
    };
  };

  const stats = calculateSLAStats();

  // Filter notifications based on selected filter
  const filteredNotifications = filter === 'all' 
    ? slaNotifications.notifications
    : slaNotifications.notifications.filter(n => n.type === filter);

  // Sort notifications
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    switch (sortBy) {
      case 'sla':
        return a.daysUntilDue - b.daysUntilDue;
      case 'date':
        return new Date(a.slaDate).getTime() - new Date(b.slaDate).getTime();
      case 'priority':
        const urgencyOrder = { overdue: 0, due_today: 1, due_soon: 2 };
        return urgencyOrder[a.type] - urgencyOrder[b.type];
      default:
        return 0;
    }
  });

  const handleMarkAsResolved = async (notification: SLANotification) => {
    setIsUpdating(notification.id);
    try {
      await api.updateTaskStatus(notification.taskId, 'completed');
      await fetchClients();
    } catch (error) {
      console.error('Error marking task as resolved:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleEditTask = (notification: SLANotification) => {
    // Find the actual task to edit
    const client = clients.find(c => c.name === notification.clientName);
    const task = client?.tasks.find(t => t.id === notification.taskId);
    if (task) {
      setEditingTask(task);
    }
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'overdue':
        return <XCircleIcon size={20} className="text-red-500" />;
      case 'due_today':
        return <AlertTriangleIcon size={20} className="text-orange-500" />;
      case 'due_soon':
        return <ClockIcon size={20} className="text-yellow-500" />;
      default:
        return <CheckIcon size={20} className="text-green-500" />;
    }
  };

  const getStatusBadge = (type: string) => {
    switch (type) {
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'due_today':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'due_soon':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-xl">Loading SLA Data...</div>
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
          <h1 className="text-3xl font-bold mb-2">SLA Management</h1>
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Monitor and manage Service Level Agreement deadlines
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total SLAs</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className={`p-3 rounded-full ${darkMode ? 'bg-blue-600' : 'bg-blue-100'}`}>
                <ClockIcon size={24} className={darkMode ? 'text-white' : 'text-blue-600'} />
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Overdue</p>
                <p className="text-2xl font-bold text-red-500">{stats.overdue}</p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <XCircleIcon size={24} className="text-red-600" />
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Due Today</p>
                <p className="text-2xl font-bold text-orange-500">{stats.dueToday}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <AlertTriangleIcon size={24} className="text-orange-600" />
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Due Soon</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.dueSoon}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <ClockIcon size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>On Track</p>
                <p className="text-2xl font-bold text-green-500">{stats.onTrack}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <CheckIcon size={24} className="text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm mb-6`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Filter by Status:
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className={`px-3 py-2 rounded-md text-sm ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } border focus:ring-2 focus:ring-blue-500`}
              >
                <option value="all">All SLAs ({slaNotifications.notifications.length})</option>
                <option value="overdue">Overdue ({stats.overdue})</option>
                <option value="due_today">Due Today ({stats.dueToday})</option>
                <option value="due_soon">Due Soon ({stats.dueSoon})</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={`px-3 py-2 rounded-md text-sm ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } border focus:ring-2 focus:ring-blue-500`}
              >
                <option value="sla">SLA Date</option>
                <option value="priority">Priority</option>
                <option value="date">Task Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* SLA List */}
        <div className={`rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm overflow-hidden`}>
          {sortedNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-medium mb-2">No SLA violations found</h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                {filter === 'all' ? 'All tasks are meeting their SLA requirements!' : `No ${filter.replace('_', ' ')} SLAs found.`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedNotifications.map((notification) => (
                <div key={notification.id} className={`p-6 hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {notification.taskDescription}
                            </h3>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Client: {notification.clientName}
                            </p>
                          </div>
                          
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(notification.type)}`}>
                            {notification.message}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            SLA Date: <DateDisplay date={notification.slaDate} />
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditTask(notification)}
                              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                darkMode 
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                              }`}
                            >
                              <EditIcon size={14} className="mr-1 inline" />
                              Edit
                            </button>
                            
                            <button
                              onClick={() => handleMarkAsResolved(notification)}
                              disabled={isUpdating === notification.id}
                              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                darkMode 
                                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                                  : 'bg-green-500 hover:bg-green-600 text-white'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {isUpdating === notification.id ? (
                                'Resolving...'
                              ) : (
                                <>
                                  <CheckIcon size={14} className="mr-1 inline" />
                                  Mark Resolved
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onUpdate={fetchClients}
          darkMode={darkMode}
        />
      )}
    </div>
  );
} 