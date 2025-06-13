'use client'

import { useState, useEffect } from 'react';
import { Client, Task, TaskStatus } from '@/types/types';
import { api } from '@/services/api';
import { useDarkMode } from '../layout';
import { useSLANotifications, SLANotification } from '../hooks/useSLANotifications';
import DateDisplay from '../components/DateDisplay';
import EditTaskModal from '../components/EditTaskModal';
import { MoreVerticalIcon, EditIcon, CheckIcon, AlertTriangleIcon, ClockIcon, XCircleIcon, FilterIcon, SortIcon } from '../components/Icons';
import { useTimezone } from '../contexts/TimezoneContext';

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
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [customFilters, setCustomFilters] = useState({
    client: '',
    priority: '',
    description: '',
    dateRange: {
      start: '',
      end: ''
    }
  });
  
  const { darkMode } = useDarkMode();
  const { getTimezoneOffset } = useTimezone();
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

  const handleSelectTask = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTasks.size === sortedNotifications.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(sortedNotifications.map(n => n.id)));
    }
  };

  const handleBulkResolve = async () => {
    const taskIds = Array.from(selectedTasks);
    setIsUpdating('bulk');
    try {
      await Promise.all(taskIds.map(id => {
        const notification = sortedNotifications.find(n => n.id === id);
        if (notification) {
          return api.updateTaskStatus(notification.taskId, 'completed', getTimezoneOffset());
        }
      }));
      await fetchClients();
      setSelectedTasks(new Set());
    } catch (error) {
      console.error('Error resolving tasks:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const applyCustomFilters = (notifications: SLANotification[]) => {
    return notifications.filter(notification => {
      const matchesClient = !customFilters.client || 
        notification.clientName.toLowerCase().includes(customFilters.client.toLowerCase()) ||
        notification.clientCompany.toLowerCase().includes(customFilters.client.toLowerCase()) ||
        notification.clientId.toLowerCase().includes(customFilters.client.toLowerCase());
      
      const matchesPriority = !customFilters.priority || 
        notification.type === customFilters.priority;
      
      const matchesDescription = !customFilters.description || 
        notification.taskDescription.toLowerCase().includes(customFilters.description.toLowerCase());
      
      const matchesDateRange = (!customFilters.dateRange.start || !customFilters.dateRange.end) || 
        (new Date(notification.slaDate) >= new Date(customFilters.dateRange.start) && 
         new Date(notification.slaDate) <= new Date(customFilters.dateRange.end));
      
      return matchesClient && matchesPriority && matchesDescription && matchesDateRange;
    });
  };

  // Apply filters and sorting
  const filteredNotifications = filter === 'all' 
    ? slaNotifications.notifications
    : slaNotifications.notifications.filter(n => n.type === filter);

  const customFilteredNotifications = applyCustomFilters(filteredNotifications);

  const sortedNotifications = [...customFilteredNotifications].sort((a, b) => {
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
      await api.updateTaskStatus(notification.taskId, 'completed', getTimezoneOffset());
      await fetchClients();
    } catch (error) {
      console.error('Error marking task as resolved:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleEditTask = (notification: SLANotification) => {
    // Find the actual task to edit
    const client = clients.find(c => c.id === notification.clientId);
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
      <div 
        className="flex items-center justify-center min-h-screen"
        style={{
          backgroundColor: 'var(--page-background)',
          color: 'var(--primary-text)'
        }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-xl">Loading SLA Data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen"
        style={{
          backgroundColor: 'var(--page-background)',
          color: 'var(--primary-text)'
        }}
      >
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <div className="text-xl mb-2">Error Loading SLA Data</div>
          <p 
            className="mb-4"
            style={{ color: 'var(--secondary-text)' }}
          >
            {error}
          </p>
          <button
            onClick={fetchClients}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--primary-button)',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-button-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-button)';
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="p-6 max-w-7xl mx-auto"
      style={{
        backgroundColor: 'var(--page-background)',
        color: 'var(--primary-text)',
        minHeight: '100vh'
      }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 
          className="text-3xl font-bold mb-2"
          style={{ color: 'var(--primary-text)' }}
        >
          🎯 SLA Management Dashboard
        </h1>
        <p 
          className="text-lg"
          style={{ color: 'var(--secondary-text)' }}
        >
          Monitor and manage Service Level Agreement compliance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div 
          className="p-6 rounded-xl border transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: 'var(--card-background)',
            borderColor: 'var(--card-border)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--card-background)';
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p 
                className="text-sm font-medium"
                style={{ color: 'var(--secondary-text)' }}
              >
                🚨 Overdue
              </p>
              <p 
                className="text-3xl font-bold text-red-600"
              >
                {stats.overdue}
              </p>
            </div>
            <XCircleIcon size={32} className="text-red-500" />
          </div>
        </div>

        <div 
          className="p-6 rounded-xl border transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: 'var(--card-background)',
            borderColor: 'var(--card-border)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--card-background)';
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p 
                className="text-sm font-medium"
                style={{ color: 'var(--secondary-text)' }}
              >
                ⚠️ Due Today
              </p>
              <p 
                className="text-3xl font-bold text-orange-600"
              >
                {stats.dueToday}
              </p>
            </div>
            <AlertTriangleIcon size={32} className="text-orange-500" />
          </div>
        </div>

        <div 
          className="p-6 rounded-xl border transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: 'var(--card-background)',
            borderColor: 'var(--card-border)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--card-background)';
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p 
                className="text-sm font-medium"
                style={{ color: 'var(--secondary-text)' }}
              >
                ⏰ Due Soon
              </p>
              <p 
                className="text-3xl font-bold text-yellow-600"
              >
                {stats.dueSoon}
              </p>
            </div>
            <ClockIcon size={32} className="text-yellow-500" />
          </div>
        </div>

        <div 
          className="p-6 rounded-xl border transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: 'var(--card-background)',
            borderColor: 'var(--card-border)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--card-background)';
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p 
                className="text-sm font-medium"
                style={{ color: 'var(--secondary-text)' }}
              >
                ✅ On Track
              </p>
              <p 
                className="text-3xl font-bold text-green-600"
              >
                {stats.onTrack}
              </p>
            </div>
            <CheckIcon size={32} className="text-green-500" />
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div 
        className="p-4 rounded-lg border shadow-sm mb-6"
        style={{
          backgroundColor: 'var(--card-background)',
          borderColor: 'var(--card-border)'
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm border transition-colors"
              style={{
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--input-border)',
                color: 'var(--input-text)'
              }}
            >
              <FilterIcon size={16} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 rounded-md text-sm border focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--input-border)',
                color: 'var(--input-text)'
              }}
            >
              <option value="all">All SLAs ({slaNotifications.notifications.length})</option>
              <option value="overdue">Overdue ({stats.overdue})</option>
              <option value="due_today">Due Today ({stats.dueToday})</option>
              <option value="due_soon">Due Soon ({stats.dueSoon})</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-md text-sm border focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--input-border)',
                color: 'var(--input-text)'
              }}
            >
              <option value="sla">SLA Date</option>
              <option value="priority">Priority</option>
              <option value="date">Task Date</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--primary-text)' }}>
                Client Filter
              </label>
              <input
                type="text"
                value={customFilters.client}
                onChange={(e) => setCustomFilters(prev => ({ ...prev, client: e.target.value }))}
                placeholder="Filter by client name..."
                className="w-full px-3 py-2 rounded-md text-sm border focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: 'var(--input-background)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--input-text)'
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--primary-text)' }}>
                Priority Filter
              </label>
              <select
                value={customFilters.priority}
                onChange={(e) => setCustomFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 rounded-md text-sm border focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: 'var(--input-background)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--input-text)'
                }}
              >
                <option value="">All Priorities</option>
                <option value="overdue">Overdue</option>
                <option value="due_today">Due Today</option>
                <option value="due_soon">Due Soon</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--primary-text)' }}>
                Task Description
              </label>
              <input
                type="text"
                value={customFilters.description}
                onChange={(e) => setCustomFilters(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Search task content..."
                className="w-full px-3 py-2 rounded-md text-sm border focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: 'var(--input-background)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--input-text)'
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--primary-text)' }}>
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={customFilters.dateRange.start}
                  onChange={(e) => setCustomFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  className="px-3 py-2 rounded-md text-sm border focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: 'var(--input-background)',
                    borderColor: 'var(--input-border)',
                    color: 'var(--input-text)'
                  }}
                />
                <input
                  type="date"
                  value={customFilters.dateRange.end}
                  onChange={(e) => setCustomFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  className="px-3 py-2 rounded-md text-sm border focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: 'var(--input-background)',
                    borderColor: 'var(--input-border)',
                    color: 'var(--input-text)'
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Action Bar */}
      {selectedTasks.size > 0 && (
        <div 
          className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg z-50"
          style={{
            backgroundColor: 'var(--card-background)',
            borderColor: 'var(--card-border)'
          }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-medium" style={{ color: 'var(--primary-text)' }}>
                {selectedTasks.size} tasks selected
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedTasks(new Set())}
                className="px-4 py-2 rounded-md text-sm border transition-colors"
                style={{
                  backgroundColor: 'var(--input-background)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--input-text)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkResolve}
                disabled={isUpdating === 'bulk'}
                className="px-4 py-2 rounded-md text-sm text-white transition-colors"
                style={{
                  backgroundColor: 'var(--success-button)'
                }}
              >
                {isUpdating === 'bulk' ? (
                  <span className="inline-block animate-spin">⏳</span>
                ) : (
                  <>
                    <CheckIcon size={16} className="mr-2 inline" />
                    Resolve Selected Tasks
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SLA List */}
      <div 
        className="rounded-lg border shadow-sm overflow-hidden"
        style={{
          backgroundColor: 'var(--card-background)',
          borderColor: 'var(--card-border)'
        }}
      >
        {sortedNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 
              className="text-xl font-medium mb-2"
              style={{ color: 'var(--primary-text)' }}
            >
              No SLA violations found
            </h3>
            <p 
              style={{ color: 'var(--secondary-text)' }}
            >
              {filter === 'all' ? 'All tasks are meeting their SLA requirements!' : `No ${filter.replace('_', ' ')} SLAs found.`}
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--card-border)' }}>
            <div className="p-4 border-b" style={{ borderColor: 'var(--card-border)' }}>
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedTasks.size === sortedNotifications.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300"
                  style={{
                    backgroundColor: 'var(--input-background)',
                    borderColor: 'var(--input-border)'
                  }}
                />
                <span className="text-sm font-medium" style={{ color: 'var(--primary-text)' }}>
                  Select All
                </span>
              </div>
            </div>
            {sortedNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className="p-6 transition-colors"
                style={{ backgroundColor: 'var(--card-background)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--card-background)';
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={selectedTasks.has(notification.id)}
                        onChange={() => handleSelectTask(notification.id)}
                        className="h-4 w-4 rounded border-gray-300"
                        style={{
                          backgroundColor: 'var(--input-background)',
                          borderColor: 'var(--input-border)'
                        }}
                      />
                    </div>
                    
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 
                            className="font-semibold text-lg"
                            style={{ color: 'var(--primary-text)' }}
                          >
                            {notification.taskDescription}
                          </h3>
                          <div className="flex flex-col gap-1 mt-1">
                            <div className="flex items-center gap-2">
                              <span 
                                className="text-sm font-medium"
                                style={{ color: 'var(--secondary-text)' }}
                              >
                                Client:
                              </span>
                              <span 
                                className="text-sm font-semibold"
                                style={{ color: 'var(--primary-text)' }}
                              >
                                {notification.clientName}
                              </span>
                              <span 
                                className="text-xs px-2 py-1 rounded-full border"
                                style={{ 
                                  backgroundColor: 'var(--tag-background)',
                                  borderColor: 'var(--tag-border)',
                                  color: 'var(--tag-text)'
                                }}
                              >
                                ID: {notification.clientId}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span 
                                className="text-sm font-medium"
                                style={{ color: 'var(--secondary-text)' }}
                              >
                                Company:
                              </span>
                              <span 
                                className="text-sm"
                                style={{ color: 'var(--secondary-text)' }}
                              >
                                {notification.clientCompany}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(notification.type)}`}>
                          {notification.message}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 mt-3">
                        <div 
                          className="text-sm"
                          style={{ color: 'var(--secondary-text)' }}
                        >
                          SLA Date: <DateDisplay date={notification.slaDate} />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditTask(notification)}
                            className="px-3 py-1 text-xs rounded-md transition-colors text-white"
                            style={{
                              backgroundColor: 'var(--primary-button)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--primary-button-hover)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--primary-button)';
                            }}
                          >
                            <EditIcon size={14} className="mr-1 inline" />
                            Edit
                          </button>
                          
                          <button
                            onClick={() => handleMarkAsResolved(notification)}
                            disabled={isUpdating === notification.id}
                            className="px-3 py-1 text-xs rounded-md transition-colors disabled:opacity-50 text-white"
                            style={{
                              backgroundColor: 'var(--success-button)'
                            }}
                            onMouseEnter={(e) => {
                              if (isUpdating !== notification.id) {
                                e.currentTarget.style.backgroundColor = 'var(--success-button-hover)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (isUpdating !== notification.id) {
                                e.currentTarget.style.backgroundColor = 'var(--success-button)';
                              }
                            }}
                          >
                            {isUpdating === notification.id ? (
                              <span className="inline-block animate-spin">⏳</span>
                            ) : (
                              <>
                                <CheckIcon size={14} className="mr-1 inline" />
                                Mark as Resolved
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