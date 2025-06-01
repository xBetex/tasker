'use client'

import { useState, useEffect, useMemo } from 'react';
import { Client } from '@/types/types';
import { api } from '@/services/api';
import { useDarkMode } from '../layout';
import { usePersistedFilters } from '../hooks/usePersistedFilters';
import { useTaskFilters } from '../hooks/useTaskFilters';

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
    clearFilters,
    getShareableUrl
  } = usePersistedFilters('analytics-filters');

  // Use task filtering logic
  const { filteredTasks, filteredClients, stats } = useTaskFilters(clients, {
    ...filters,
    selectedClients: filters.selectedClients
  });

  // Memoized charts
  const memoizedCharts = useMemo(() => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-lg`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Task Status Distribution
        </h3>
        <TaskStatusChart tasks={filteredTasks} darkMode={darkMode} />
      </div>
      
      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-lg`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Priority Distribution
        </h3>
        <TaskPriorityChart tasks={filteredTasks} darkMode={darkMode} />
      </div>
      
      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-lg`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Tasks per Client
        </h3>
        <TasksPerClientChart clients={filteredClients} darkMode={darkMode} />
      </div>
      
      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-lg`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
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

  const handleShareFilters = async () => {
    const shareableUrl = getShareableUrl();
    try {
      await navigator.clipboard.writeText(shareableUrl);
      // You could add a toast notification here
      alert('Shareable URL copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy URL:', err);
      alert('Failed to copy URL to clipboard');
    }
  };

  if (loading || !filtersLoaded) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-xl">Loading Analytics...</div>
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
              <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Comprehensive task and client insights
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleShareFilters}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  darkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share View
              </button>
              
              <button
                onClick={clearFilters}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
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
            title="Overdue"
            value={stats.overdueTasks}
            trend={stats.overdueTasks > 0 ? "down" : "stable"}
            trendValue={stats.overdueTasks > 0 ? "Needs attention" : "All good"}
            icon="⚠️"
            description="Tasks older than 30 days"
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
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Task Timeline
          </h3>
          <TaskTimeline tasks={filteredTasks} darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
} 