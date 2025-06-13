'use client'

import { useState, useEffect, useMemo } from 'react';
import { Client, Task } from '@/types/types';
import { api } from '@/services/api';
import { useDarkMode } from '../layout';
import { usePersistedFilters } from '../hooks/usePersistedFilters';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { getSLAStatus, getSLAStatusColor, getSLAStatusBadge, getDaysUntilSLA } from '@/utils/slaUtils';
import DateDisplay from '../components/DateDisplay';

// Import components
import AnalyticsFilters from '../components/analytics/AnalyticsFilters';
import KpiGroup from '../components/analytics/KpiGroup';
import KpiCard from '../components/analytics/KpiCard';
import TaskStatusChart from '../components/analytics/TaskStatusChart';
import TaskPriorityChart from '../components/analytics/TaskPriorityChart';
import TasksPerClientChart from '../components/analytics/TasksPerClientChart';
import TaskTimeline from '../components/analytics/TaskTimeline';
import CompletionRateChart from '../components/analytics/CompletionRateChart';

export default function AnalyticsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasksSortBy, setTasksSortBy] = useState<'date' | 'sla' | 'priority' | 'status' | 'client'>('sla');
  const [tasksSortOrder, setTasksSortOrder] = useState<'asc' | 'desc'>('asc');
  const [tasksPageSize, setTasksPageSize] = useState(20);
  const [tasksCurrentPage, setTasksCurrentPage] = useState(1);
  
  const { darkMode } = useDarkMode();
  
  // Use persisted filters
  const {
    filters,
    isLoaded: filtersLoaded,
    setStatusFilter,
    setPriorityFilter,
    setClientSearch,
    setSelectedClientId,
    setDateRange,
    setSelectedClients,
    setSlaFilter,
    setDescriptionFilter,
    clearFilters
  } = usePersistedFilters('analytics-filters');

  // Use task filtering logic
  const { filteredTasks, filteredClients, stats } = useTaskFilters(clients, {
    ...filters,
    selectedClients: filters.selectedClients
  });

  // Memoized and sorted tasks table
  const sortedAndPaginatedTasks = useMemo(() => {
    const tasksWithClients = filteredTasks.map(task => ({
      ...task,
      clientInfo: clients.find(c => c.id === task.client_id)
    }));

    // Sort tasks
    const sorted = [...tasksWithClients].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (tasksSortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'sla':
          aValue = a.sla_date ? new Date(a.sla_date) : new Date('9999-12-31');
          bValue = b.sla_date ? new Date(b.sla_date) : new Date('9999-12-31');
          break;
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'client':
          aValue = a.clientInfo?.name || '';
          bValue = b.clientInfo?.name || '';
          break;
        default:
          aValue = a.date;
          bValue = b.date;
      }

      if (aValue < bValue) return tasksSortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return tasksSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Paginate
    const startIndex = (tasksCurrentPage - 1) * tasksPageSize;
    const endIndex = startIndex + tasksPageSize;
    const paginated = sorted.slice(startIndex, endIndex);
    
    return {
      tasks: paginated,
      totalTasks: sorted.length,
      totalPages: Math.ceil(sorted.length / tasksPageSize)
    };
  }, [filteredTasks, clients, tasksSortBy, tasksSortOrder, tasksPageSize, tasksCurrentPage]);

  const handleSort = (column: typeof tasksSortBy) => {
    if (tasksSortBy === column) {
      setTasksSortOrder(tasksSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setTasksSortBy(column);
      setTasksSortOrder('asc');
    }
    setTasksCurrentPage(1);
  };

  // Memoized charts
  const memoizedCharts = useMemo(() => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div 
        className="p-6 rounded-xl border shadow-lg transition-all duration-300 hover:shadow-xl"
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
        <h3 
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--primary-text)' }}
        >
          Task Status Distribution
        </h3>
        <TaskStatusChart tasks={filteredTasks} darkMode={darkMode} />
      </div>
      
      <div 
        className="p-6 rounded-xl border shadow-lg transition-all duration-300 hover:shadow-xl"
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
        <h3 
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--primary-text)' }}
        >
          Priority Distribution
        </h3>
        <TaskPriorityChart tasks={filteredTasks} darkMode={darkMode} />
      </div>
      
      <div 
        className="p-6 rounded-xl border shadow-lg transition-all duration-300 hover:shadow-xl"
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
        <h3 
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--primary-text)' }}
        >
          Tasks per Client
        </h3>
        <TasksPerClientChart clients={filteredClients} darkMode={darkMode} />
      </div>
      
      <div 
        className="p-6 rounded-xl border shadow-lg transition-all duration-300 hover:shadow-xl"
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
        <h3 
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--primary-text)' }}
        >
          Completion Rate
        </h3>
        <CompletionRateChart clients={filteredClients} darkMode={darkMode} />
      </div>
    </div>
  ), [filteredTasks, filteredClients, darkMode]);

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
      <div 
        className="flex items-center justify-center min-h-screen"
        style={{ 
          backgroundColor: 'var(--page-background)', 
          color: 'var(--primary-text)' 
        }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div 
            className="text-xl"
            style={{ color: 'var(--primary-text)' }}
          >
            Loading Analytics...
          </div>
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
          <div 
            className="text-xl text-red-500 mb-4"
          >
            {error}
          </div>
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
      className="min-h-screen"
      style={{ 
        backgroundColor: 'var(--page-background)', 
        color: 'var(--primary-text)' 
      }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--primary-text)' }}>
                Analytics Dashboard
              </h1>
              <p 
                className="text-lg"
                style={{ color: 'var(--secondary-text)' }}
              >
                Comprehensive task and client insights
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 border"
                style={{
                  backgroundColor: 'var(--card-background)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--secondary-text)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                  e.currentTarget.style.color = 'var(--primary-text)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--card-background)';
                  e.currentTarget.style.color = 'var(--secondary-text)';
                }}
              >
                Reset All
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
          slaFilter={filters.slaFilter}
          setSlaFilter={setSlaFilter}
          descriptionFilter={filters.descriptionFilter}
          setDescriptionFilter={setDescriptionFilter}
          clients={clients}
          darkMode={darkMode}
        />

        {/* KPI Overview */}
        <KpiGroup
          title="Overview Metrics"
          description="Key performance indicators for your tasks and clients"
          darkMode={darkMode}
          className="mb-8"
        >
          <KpiCard
            title="Total Tasks"
            value={stats.totalTasks}
            icon="📋"
            description={`Found ${filteredTasks.length} tasks matching your filters`}
            darkMode={darkMode}
          />
          
          <KpiCard
            title="Completed"
            value={stats.completedTasks}
            trend="up"
            trendValue={`${stats.completionRate.toFixed(1)}%`}
            icon="✅"
            description="Successfully completed tasks"
            darkMode={darkMode}
          />
          
          <KpiCard
            title="In Progress"
            value={stats.inProgressTasks}
            icon="⚡"
            description="Currently active tasks"
            darkMode={darkMode}
          />
          
          <KpiCard
            title="Pending"
            value={stats.pendingTasks}
            icon="⏳"
            description="Tasks waiting to be started"
            darkMode={darkMode}
          />
        </KpiGroup>

        {/* Priority Breakdown */}
        <KpiGroup
          title="Priority Breakdown"
          description="Task distribution by priority level"
          darkMode={darkMode}
          className="mb-8"
        >
          <KpiCard
            title="High Priority"
            value={stats.highPriorityTasks}
            icon="🔴"
            description="Urgent tasks requiring immediate attention"
            darkMode={darkMode}
          />
          
          <KpiCard
            title="Medium Priority"
            value={stats.mediumPriorityTasks}
            icon="🟡"
            description="Important tasks with moderate urgency"
            darkMode={darkMode}
          />
          
          <KpiCard
            title="Low Priority"
            value={stats.lowPriorityTasks}
            icon="🟢"
            description="Tasks that can be handled when time permits"
            darkMode={darkMode}
          />
        </KpiGroup>

        {/* Task Details */}
        <div className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Task Distribution Analysis
          </h2>
          {memoizedCharts}
        </div>

        {/* Timeline */}
        <div 
          className="mt-8 p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl"
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
          <div className="mb-6">
            <h3 
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--primary-text)' }}
            >
              📈 Task Timeline
            </h3>
            <p 
              className="text-sm"
              style={{ color: 'var(--secondary-text)' }}
            >
              Track task completion over time
            </p>
          </div>
          <TaskTimeline tasks={filteredTasks} darkMode={darkMode} />
        </div>

        {/* Tasks & SLA Table */}
        <div 
          className="mt-8 p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl"
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
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 
                  className="text-xl font-semibold mb-2"
                  style={{ color: 'var(--primary-text)' }}
                >
                  📊 Tasks & SLA Details
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--secondary-text)' }}
                >
                  Detailed view of all tasks with SLA status and priority information
                </p>
              </div>
              
              {/* Table Controls */}
              <div className="flex items-center gap-3">
                <select
                  value={tasksPageSize}
                  onChange={(e) => {
                    setTasksPageSize(Number(e.target.value));
                    setTasksCurrentPage(1);
                  }}
                  className="px-3 py-1 rounded-md border text-sm"
                  style={{
                    backgroundColor: 'var(--input-background)',
                    borderColor: 'var(--input-border)',
                    color: 'var(--input-text)'
                  }}
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <button 
                onClick={() => setSlaFilter('overdue')}
                className="p-4 rounded-lg text-left transition-all duration-200 hover:scale-105 border"
                style={{
                  backgroundColor: 'var(--card-background)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--primary-text)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)';
                  e.currentTarget.style.borderColor = darkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--card-background)';
                  e.currentTarget.style.borderColor = 'var(--card-border)';
                }}
              >
                <h3 
                  className="font-semibold mb-2"
                  style={{ color: 'var(--secondary-text)' }}
                >
                  🚨 Overdue
                </h3>
                <p 
                  className="text-2xl font-bold text-red-500"
                >
                  {filteredTasks.filter(t => getSLAStatus(t) === 'overdue').length}
                </p>
              </button>
              
              <button 
                onClick={() => setSlaFilter('due_today')}
                className="p-4 rounded-lg text-left transition-all duration-200 hover:scale-105 border"
                style={{
                  backgroundColor: 'var(--card-background)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--primary-text)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = darkMode ? 'rgba(251, 146, 60, 0.1)' : 'rgba(251, 146, 60, 0.05)';
                  e.currentTarget.style.borderColor = darkMode ? 'rgba(251, 146, 60, 0.3)' : 'rgba(251, 146, 60, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--card-background)';
                  e.currentTarget.style.borderColor = 'var(--card-border)';
                }}
              >
                <h3 
                  className="font-semibold mb-2"
                  style={{ color: 'var(--secondary-text)' }}
                >
                  ⚠️ Due Today
                </h3>
                <p 
                  className="text-2xl font-bold text-orange-500"
                >
                  {filteredTasks.filter(t => getSLAStatus(t) === 'due_today').length}
                </p>
              </button>
              
              <button 
                onClick={() => setSlaFilter('due_this_week')}
                className="p-4 rounded-lg text-left transition-all duration-200 hover:scale-105 border"
                style={{
                  backgroundColor: 'var(--card-background)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--primary-text)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = darkMode ? 'rgba(250, 204, 21, 0.1)' : 'rgba(250, 204, 21, 0.05)';
                  e.currentTarget.style.borderColor = darkMode ? 'rgba(250, 204, 21, 0.3)' : 'rgba(250, 204, 21, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--card-background)';
                  e.currentTarget.style.borderColor = 'var(--card-border)';
                }}
              >
                <h3 
                  className="font-semibold mb-2"
                  style={{ color: 'var(--secondary-text)' }}
                >
                  ⏰ Due This Week
                </h3>
                <p 
                  className="text-2xl font-bold text-yellow-500"
                >
                  {filteredTasks.filter(t => getSLAStatus(t) === 'due_this_week').length}
                </p>
              </button>
              
              <button 
                onClick={() => setSlaFilter('on_track')}
                className="p-4 rounded-lg text-left transition-all duration-200 hover:scale-105 border"
                style={{
                  backgroundColor: 'var(--card-background)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--primary-text)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = darkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)';
                  e.currentTarget.style.borderColor = darkMode ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--card-background)';
                  e.currentTarget.style.borderColor = 'var(--card-border)';
                }}
              >
                <h3 
                  className="font-semibold mb-2"
                  style={{ color: 'var(--secondary-text)' }}
                >
                  ✅ On Track
                </h3>
                <p 
                  className="text-2xl font-bold text-green-500"
                >
                  {filteredTasks.filter(t => getSLAStatus(t) === 'on_track').length}
                </p>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr 
                    className="border-b"
                    style={{ borderColor: 'var(--card-border)' }}
                  >
                    <th 
                      className="text-left p-3 cursor-pointer hover:bg-opacity-50 transition-colors"
                      style={{ color: 'var(--primary-text)' }}
                      onClick={() => handleSort('client')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      Client {tasksSortBy === 'client' && (tasksSortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="text-left p-3 cursor-pointer hover:bg-opacity-50 transition-colors"
                      style={{ color: 'var(--primary-text)' }}
                      onClick={() => handleSort('status')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      Status {tasksSortBy === 'status' && (tasksSortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="text-left p-3 cursor-pointer hover:bg-opacity-50 transition-colors"
                      style={{ color: 'var(--primary-text)' }}
                      onClick={() => handleSort('priority')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      Priority {tasksSortBy === 'priority' && (tasksSortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="text-left p-3"
                      style={{ color: 'var(--primary-text)' }}
                    >
                      Description
                    </th>
                    <th 
                      className="text-left p-3 cursor-pointer hover:bg-opacity-50 transition-colors"
                      style={{ color: 'var(--primary-text)' }}
                      onClick={() => handleSort('date')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      Created {tasksSortBy === 'date' && (tasksSortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="text-left p-3 cursor-pointer hover:bg-opacity-50 transition-colors"
                      style={{ color: 'var(--primary-text)' }}
                      onClick={() => handleSort('sla')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      SLA Status {tasksSortBy === 'sla' && (tasksSortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAndPaginatedTasks.tasks.map((task, index) => (
                    <tr 
                      key={task.id || index}
                      className="border-b transition-all duration-200 hover:bg-opacity-50"
                      style={{ borderColor: 'var(--card-border)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td className="p-3">
                        <div>
                          <div 
                            className="font-medium text-sm"
                            style={{ color: 'var(--primary-text)' }}
                          >
                            {task.clientInfo?.name || 'Unknown'}
                          </div>
                          <div 
                            className="text-xs"
                            style={{ color: 'var(--muted-text)' }}
                          >
                            {task.clientInfo?.company}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white
                            ${task.status === 'completed' ? 'bg-green-500' : 
                              task.status === 'in progress' ? 'bg-blue-500' : 
                              task.status === 'pending' ? 'bg-gray-500' : 'bg-orange-500'}`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span 
                          className={`text-sm font-medium
                            ${task.priority === 'high' ? 'text-red-600' : 
                              task.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}
                        >
                          {task.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">
                        <div 
                          className="text-sm max-w-xs truncate"
                          style={{ color: 'var(--primary-text)' }}
                          title={task.description}
                        >
                          {task.description}
                        </div>
                      </td>
                      <td className="p-3">
                        <div 
                          className="text-sm"
                          style={{ color: 'var(--secondary-text)' }}
                        >
                          <DateDisplay date={task.date} showTime={false} />
                        </div>
                      </td>
                                             <td className="p-3">
                         <div className="flex items-center gap-2">
                           {getSLAStatusBadge(getSLAStatus(task))}
                           {task.sla_date && (
                             <div className="text-xs">
                               <div 
                                 className="font-medium"
                                 style={{ color: 'var(--secondary-text)' }}
                               >
                                 <DateDisplay date={task.sla_date} showTime={false} />
                               </div>
                               {getDaysUntilSLA(task) !== null && (
                                 <div className={getSLAStatusColor(getSLAStatus(task), darkMode)}>
                                  {getDaysUntilSLA(task) !== null && 
                                    (getDaysUntilSLA(task)! > 0 ? 
                                      `${getDaysUntilSLA(task)} days left` : 
                                      getDaysUntilSLA(task) === 0 ? 
                                        'Due today' : 
                                        `${Math.abs(getDaysUntilSLA(task)!)} days overdue`
                                    )
                                  }
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {sortedAndPaginatedTasks.tasks.length === 0 && (
                <div 
                  className="text-center py-8"
                  style={{ color: 'var(--muted-text)' }}
                >
                  No tasks found matching your filters
                </div>
              )}
            </div>

            {/* Pagination */}
            {sortedAndPaginatedTasks.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
                <div 
                  className="text-sm"
                  style={{ color: 'var(--secondary-text)' }}
                >
                  Showing {((tasksCurrentPage - 1) * tasksPageSize) + 1} to {Math.min(tasksCurrentPage * tasksPageSize, sortedAndPaginatedTasks.totalTasks)} of {sortedAndPaginatedTasks.totalTasks} tasks
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTasksCurrentPage(Math.max(1, tasksCurrentPage - 1))}
                    disabled={tasksCurrentPage === 1}
                    className="px-3 py-1 rounded-md border transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: 'var(--card-background)',
                      borderColor: 'var(--card-border)',
                      color: 'var(--secondary-text)'
                    }}
                    onMouseEnter={(e) => {
                      if (tasksCurrentPage !== 1) {
                        e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                        e.currentTarget.style.color = 'var(--primary-text)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (tasksCurrentPage !== 1) {
                        e.currentTarget.style.backgroundColor = 'var(--card-background)';
                        e.currentTarget.style.color = 'var(--secondary-text)';
                      }
                    }}
                  >
                    Previous
                  </button>
                  
                  <span 
                    className="px-3 py-1 text-sm"
                    style={{ color: 'var(--primary-text)' }}
                  >
                    Page {tasksCurrentPage} of {sortedAndPaginatedTasks.totalPages}
                  </span>
                  
                  <button
                    onClick={() => setTasksCurrentPage(Math.min(sortedAndPaginatedTasks.totalPages, tasksCurrentPage + 1))}
                    disabled={tasksCurrentPage === sortedAndPaginatedTasks.totalPages}
                    className="px-3 py-1 rounded-md border transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: 'var(--card-background)',
                      borderColor: 'var(--card-border)',
                      color: 'var(--secondary-text)'
                    }}
                    onMouseEnter={(e) => {
                      if (tasksCurrentPage !== sortedAndPaginatedTasks.totalPages) {
                        e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                        e.currentTarget.style.color = 'var(--primary-text)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (tasksCurrentPage !== sortedAndPaginatedTasks.totalPages) {
                        e.currentTarget.style.backgroundColor = 'var(--card-background)';
                        e.currentTarget.style.color = 'var(--secondary-text)';
                      }
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 