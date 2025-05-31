import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Client, Task } from '@/types/types';
import { AnalyticsDashboardProps } from '@/types/analytics';
import { calculateTaskAnalytics, chartColors } from '@/utils/analytics';
import { format } from 'date-fns';

// Import the individual chart components
import TasksPerClientChart from './analytics/TasksPerClientChart';
import TaskTimeline from './analytics/TaskTimeline';
import TaskStatusChart from './analytics/TaskStatusChart';
import TaskPriorityChart from './analytics/TaskPriorityChart';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
};

const barChartOptions: ChartOptions<'bar'> = {
  ...commonOptions,
  scales: {
    y: {
      beginAtZero: true,
      type: 'linear' as const,
    },
    x: {
      type: 'category' as const,
    },
  },
};

const lineChartOptions: ChartOptions<'line'> = {
  ...commonOptions,
  scales: {
    y: {
      beginAtZero: true,
      type: 'linear' as const,
    },
    x: {
      type: 'category' as const,
    },
  },
};

interface Props extends AnalyticsDashboardProps {
  clients: Client[];
  darkMode: boolean;
}

export default function AnalyticsDashboard({
  clients,
  startDate,
  endDate,
  selectedClients,
  onDateRangeChange,
  onClientSelect,
  darkMode
}: Props) {
  const [analytics, setAnalytics] = useState(() => 
    calculateTaskAnalytics(
      selectedClients 
        ? clients.filter(client => selectedClients.includes(client.id))
        : clients,
      startDate,
      endDate
    )
  );

  // Filter clients and tasks based on selections
  const filteredClients = selectedClients
    ? clients.filter(client => selectedClients.includes(client.id))
    : clients;

  const allTasks: Task[] = filteredClients.flatMap(client => client.tasks);

  // Filter tasks by date range if specified
  const filteredTasks = allTasks.filter(task => {
    if (!startDate || !endDate) return true;
    const taskDate = new Date(task.date);
    return taskDate >= startDate && taskDate <= endDate;
  });

  useEffect(() => {
    setAnalytics(calculateTaskAnalytics(filteredClients, startDate, endDate));
  }, [clients, selectedClients, startDate, endDate]);

  // Chart data preparation
  const completionRateData: ChartData<'bar'> = {
    labels: analytics.completionRateByClient.labels,
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: analytics.completionRateByClient.data,
        backgroundColor: chartColors.status.completed,
        borderColor: darkMode ? 'rgba(31, 41, 55, 1)' : 'white',
        borderWidth: 2,
      },
    ],
  };

  const tasksByStatusData: ChartData<'bar'> = {
    labels: analytics.tasksByStatus.labels,
    datasets: [
      {
        label: 'Tasks by Status',
        data: analytics.tasksByStatus.data,
        backgroundColor: analytics.tasksByStatus.labels.map(
          status => chartColors.status[status]
        ),
        borderColor: darkMode ? 'rgba(31, 41, 55, 1)' : 'white',
        borderWidth: 2,
      },
    ],
  };

  const tasksByPriorityData: ChartData<'bar'> = {
    labels: analytics.tasksByPriority.labels,
    datasets: [
      {
        label: 'Tasks by Priority',
        data: analytics.tasksByPriority.data,
        backgroundColor: analytics.tasksByPriority.labels.map(
          priority => chartColors.priority[priority]
        ),
        borderColor: darkMode ? 'rgba(31, 41, 55, 1)' : 'white',
        borderWidth: 2,
      },
    ],
  };

  const taskTrendsData: ChartData<'line'> = {
    labels: analytics.taskTrends.labels.map(date => format(new Date(date), 'MMM d')),
    datasets: [
      {
        label: 'Created Tasks',
        data: analytics.taskTrends.created,
        borderColor: '#60A5FA',
        backgroundColor: '#60A5FA33',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Completed Tasks',
        data: analytics.taskTrends.completed,
        borderColor: '#34D399',
        backgroundColor: '#34D39933',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Calculate summary statistics
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in progress').length;
  const pendingTasks = filteredTasks.filter(task => task.status === 'pending').length;
  const awaitingClientTasks = filteredTasks.filter(task => task.status === 'awaiting client').length;
  const highPriorityTasks = filteredTasks.filter(task => task.priority === 'high').length;
  const mediumPriorityTasks = filteredTasks.filter(task => task.priority === 'medium').length;
  const lowPriorityTasks = filteredTasks.filter(task => task.priority === 'low').length;

  const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Controls Section */}
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h2 className="text-2xl font-bold mb-4">Analytics Controls</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date Range Selector */}
          {onDateRangeChange && (
            <div>
              <label className="block text-sm font-medium mb-2">Date Range Filter</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) => {
                    const newStartDate = e.target.value ? new Date(e.target.value) : undefined;
                    if (onDateRangeChange) {
                      onDateRangeChange(newStartDate || new Date(), endDate || new Date());
                    }
                  }}
                  className={`p-2 rounded border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                  placeholder="Start date"
                />
                <input
                  type="date"
                  value={endDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) => {
                    const newEndDate = e.target.value ? new Date(e.target.value) : undefined;
                    if (onDateRangeChange) {
                      onDateRangeChange(startDate || new Date(), newEndDate || new Date());
                    }
                  }}
                  className={`p-2 rounded border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                  placeholder="End date"
                />
                <button
                  onClick={() => onDateRangeChange && onDateRangeChange(new Date(), new Date())}
                  className={`px-3 py-2 rounded ${
                    darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Client Selector */}
          {onClientSelect && (
            <div>
              <label className="block text-sm font-medium mb-2">Filter by Clients</label>
              <div className="space-y-2">
                <select
                  multiple
                  value={selectedClients || []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    onClientSelect(selected);
                  }}
                  className={`w-full p-2 rounded border h-24 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                  size={4}
                >
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.company})
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => onClientSelect(clients.map(c => c.id))}
                    className={`px-3 py-1 text-sm rounded ${
                      darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                    } text-white`}
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => onClientSelect([])}
                    className={`px-3 py-1 text-sm rounded ${
                      darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h2 className="text-2xl font-bold mb-4">Summary Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
            <div className="text-2xl font-bold text-blue-600">{totalTasks}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
            <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-yellow-50'}`}>
            <div className="text-2xl font-bold text-yellow-600">{inProgressTasks}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-orange-50'}`}>
            <div className="text-2xl font-bold text-orange-600">{pendingTasks}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
            <div className="text-2xl font-bold text-purple-600">{awaitingClientTasks}</div>
            <div className="text-sm text-gray-600">Awaiting Client</div>
          </div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="text-2xl font-bold text-gray-600">{completionRate}%</div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Priority Distribution */}
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h2 className="text-2xl font-bold mb-4">Priority Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-red-50'}`}>
            <div className="text-2xl font-bold text-red-600">{highPriorityTasks}</div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-yellow-50'}`}>
            <div className="text-2xl font-bold text-yellow-600">{mediumPriorityTasks}</div>
            <div className="text-sm text-gray-600">Medium Priority</div>
          </div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
            <div className="text-2xl font-bold text-green-600">{lowPriorityTasks}</div>
            <div className="text-sm text-gray-600">Low Priority</div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Rate Chart */}
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h3 className="text-lg font-semibold mb-4">Completion Rate by Client</h3>
          <div className="h-80">
            <Bar options={barChartOptions} data={completionRateData} />
          </div>
        </div>

        {/* Tasks by Status Chart */}
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h3 className="text-lg font-semibold mb-4">Tasks by Status</h3>
          <div className="h-80">
            <Bar options={barChartOptions} data={tasksByStatusData} />
          </div>
        </div>

        {/* Tasks by Priority Chart */}
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h3 className="text-lg font-semibold mb-4">Tasks by Priority</h3>
          <div className="h-80">
            <Bar options={barChartOptions} data={tasksByPriorityData} />
          </div>
        </div>

        {/* Task Trends Chart */}
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h3 className="text-lg font-semibold mb-4">Task Trends Over Time</h3>
          <div className="h-80">
            <Line options={lineChartOptions} data={taskTrendsData} />
          </div>
        </div>
      </div>

      {/* Advanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Per Client Chart */}
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h3 className="text-lg font-semibold mb-4">Tasks Per Client (Detailed)</h3>
          <TasksPerClientChart clients={filteredClients} darkMode={darkMode} />
        </div>

        {/* Task Status Pie Chart */}
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h3 className="text-lg font-semibold mb-4">Task Status Distribution</h3>
          <TaskStatusChart tasks={filteredTasks} darkMode={darkMode} />
        </div>

        {/* Task Priority Chart */}
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h3 className="text-lg font-semibold mb-4">Priority Distribution (Detailed)</h3>
          <TaskPriorityChart tasks={filteredTasks} darkMode={darkMode} />
        </div>

        {/* Task Timeline */}
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h3 className="text-lg font-semibold mb-4">Task Timeline</h3>
          <TaskTimeline tasks={filteredTasks} darkMode={darkMode} />
        </div>
      </div>

      {/* Client Performance Table */}
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h2 className="text-2xl font-bold mb-4">Client Performance Summary</h2>
        <div className="overflow-x-auto">
          <table className={`w-full table-auto ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <thead>
              <tr className={`border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <th className="text-left p-2">Client</th>
                <th className="text-left p-2">Company</th>
                <th className="text-left p-2">Total Tasks</th>
                <th className="text-left p-2">Completed</th>
                <th className="text-left p-2">In Progress</th>
                <th className="text-left p-2">Pending</th>
                <th className="text-left p-2">Completion %</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map(client => {
                const total = client.tasks.length;
                const completed = client.tasks.filter(t => t.status === 'completed').length;
                const inProgress = client.tasks.filter(t => t.status === 'in progress').length;
                const pending = client.tasks.filter(t => t.status === 'pending').length;
                const completionPercentage = total > 0 ? ((completed / total) * 100).toFixed(1) : '0';
                
                return (
                  <tr key={client.id} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <td className="p-2 font-medium">{client.name}</td>
                    <td className="p-2">{client.company}</td>
                    <td className="p-2">{total}</td>
                    <td className="p-2 text-green-600">{completed}</td>
                    <td className="p-2 text-blue-600">{inProgress}</td>
                    <td className="p-2 text-yellow-600">{pending}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        parseFloat(completionPercentage) >= 80 
                          ? 'bg-green-100 text-green-800' 
                          : parseFloat(completionPercentage) >= 50 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {completionPercentage}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 