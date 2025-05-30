'use client'

import { useState, useEffect } from 'react';
import { Client, Task } from '@/types/types';
import TaskStatusChart from '../components/analytics/TaskStatusChart';
import TaskPriorityChart from '../components/analytics/TaskPriorityChart';
import TaskTimeline from '../components/analytics/TaskTimeline';
import TasksPerClientChart from '../components/analytics/TasksPerClientChart';

export default function Analytics() {
  const [clients, setClients] = useState<Client[]>([]);
  const [darkMode, setDarkMode] = useState(false);

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

  // Calculate statistics
  const allTasks = clients.flatMap(client => client.tasks);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(task => task.status === 'completed').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : '0';

  const averageTasksPerClient = clients.length > 0 
    ? (totalTasks / clients.length).toFixed(1) 
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
            <p className="text-3xl font-bold">{clients.length}</p>
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
          <TasksPerClientChart clients={clients} darkMode={darkMode} />
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