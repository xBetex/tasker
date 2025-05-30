'use client'

import { useState, useEffect } from 'react';
import { Client, Task, TaskStatus, TaskPriority } from '@/types/types';
import TaskStatusChart from '../components/analytics/TaskStatusChart';
import TaskPriorityChart from '../components/analytics/TaskPriorityChart';
import TaskTimeline from '../components/analytics/TaskTimeline';
import TasksPerClientChart from '../components/analytics/TasksPerClientChart';
import AnalyticsFilters from '../components/analytics/AnalyticsFilters';

export default function Analytics() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  // Filter states
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [clientSearch, setClientSearch] = useState('');

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const localData = localStorage.getItem('clientsData');
        if (localData) {
          setClients(JSON.parse(localData));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...clients];

    // Client search filter
    if (clientSearch) {
      const searchTerm = clientSearch.toLowerCase();
      result = result.filter(
        client =>
          client.name.toLowerCase().includes(searchTerm) ||
          client.company.toLowerCase().includes(searchTerm)
      );
    }

    // Filter clients based on task filters
    result = result.map(client => ({
      ...client,
      tasks: client.tasks.filter(task => {
        // Date range filter
        if (dateRange.start || dateRange.end) {
          const taskDate = new Date(task.date);
          const startDate = dateRange.start ? new Date(dateRange.start) : null;
          const endDate = dateRange.end ? new Date(dateRange.end) : null;

          if (startDate && endDate) {
            if (taskDate < startDate || taskDate > endDate) return false;
          } else if (startDate && taskDate < startDate) return false;
          else if (endDate && taskDate > endDate) return false;
        }

        // Status filter
        if (statusFilter !== 'all' && task.status !== statusFilter) return false;

        // Priority filter
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

        return true;
      })
    }));

    // Remove clients with no matching tasks
    result = result.filter(client => client.tasks.length > 0);

    setFilteredClients(result);
  }, [clients, dateRange, statusFilter, priorityFilter, clientSearch]);

  // Calculate statistics from filtered data
  const allTasks = filteredClients.flatMap(client => client.tasks);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(task => task.status === 'completed').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : '0';
  const averageTasksPerClient = filteredClients.length > 0 
    ? (totalTasks / filteredClients.length).toFixed(1) 
    : '0';

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Task Analytics</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        <AnalyticsFilters
          dateRange={dateRange}
          setDateRange={setDateRange}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          clientSearch={clientSearch}
          setClientSearch={setClientSearch}
          darkMode={darkMode}
        />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <h3 className="text-lg font-semibold mb-2">Total Tasks</h3>
            <p className="text-3xl font-bold">{totalTasks}</p>
          </div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <h3 className="text-lg font-semibold mb-2">Completion Rate</h3>
            <p className="text-3xl font-bold">{completionRate}%</p>
          </div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <h3 className="text-lg font-semibold mb-2">Total Clients</h3>
            <p className="text-3xl font-bold">{filteredClients.length}</p>
          </div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <h3 className="text-lg font-semibold mb-2">Avg Tasks/Client</h3>
            <p className="text-3xl font-bold">{averageTasksPerClient}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <h3 className="text-lg font-semibold mb-4">Task Status Distribution</h3>
            <TaskStatusChart tasks={allTasks} darkMode={darkMode} />
          </div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <h3 className="text-lg font-semibold mb-4">Task Priority Distribution</h3>
            <TaskPriorityChart tasks={allTasks} darkMode={darkMode} />
          </div>
        </div>

        {/* Tasks per Client */}
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow mb-8`}>
          <h3 className="text-lg font-semibold mb-4">Tasks per Client</h3>
          <TasksPerClientChart clients={filteredClients} darkMode={darkMode} />
        </div>

        {/* Timeline */}
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h3 className="text-lg font-semibold mb-4">Task Timeline</h3>
          <TaskTimeline tasks={allTasks} darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
} 