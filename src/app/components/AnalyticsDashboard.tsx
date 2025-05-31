import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { Client } from '@/types/types';
import { AnalyticsDashboardProps } from '@/types/analytics';
import { calculateTaskAnalytics, chartColors } from '@/utils/analytics';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
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

  useEffect(() => {
    const filteredClients = selectedClients
      ? clients.filter(client => selectedClients.includes(client.id))
      : clients;
    setAnalytics(calculateTaskAnalytics(filteredClients, startDate, endDate));
  }, [clients, selectedClients, startDate, endDate]);

  const completionRateData: ChartData<'bar'> = {
    labels: analytics.completionRateByClient.labels,
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: analytics.completionRateByClient.data,
        backgroundColor: chartColors.status.completed,
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
      },
      {
        label: 'Completed Tasks',
        data: analytics.taskTrends.completed,
        borderColor: '#34D399',
        backgroundColor: '#34D39933',
        fill: true,
      },
    ],
  };

  return (
    <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Task Analytics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date Range Selector */}
          {onDateRangeChange && (
            <div>
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startDate?.toISOString().split('T')[0]}
                  onChange={(e) => {
                    const newStartDate = e.target.value ? new Date(e.target.value) : undefined;
                    if (onDateRangeChange && endDate) {
                      onDateRangeChange(newStartDate || new Date(), endDate);
                    }
                  }}
                  className={`p-2 rounded border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                />
                <input
                  type="date"
                  value={endDate?.toISOString().split('T')[0]}
                  onChange={(e) => {
                    const newEndDate = e.target.value ? new Date(e.target.value) : undefined;
                    if (onDateRangeChange && startDate) {
                      onDateRangeChange(startDate, newEndDate || new Date());
                    }
                  }}
                  className={`p-2 rounded border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Client Selector */}
          {onClientSelect && (
            <div>
              <label className="block text-sm font-medium mb-2">Select Clients</label>
              <select
                multiple
                value={selectedClients || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  onClientSelect(selected);
                }}
                className={`w-full p-2 rounded border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              >
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Completion Rate Chart */}
        <div className="h-80">
          <h3 className="text-lg font-semibold mb-2">Completion Rate by Client</h3>
          <Bar options={barChartOptions} data={completionRateData} />
        </div>

        {/* Tasks by Status Chart */}
        <div className="h-80">
          <h3 className="text-lg font-semibold mb-2">Tasks by Status</h3>
          <Bar options={barChartOptions} data={tasksByStatusData} />
        </div>

        {/* Tasks by Priority Chart */}
        <div className="h-80">
          <h3 className="text-lg font-semibold mb-2">Tasks by Priority</h3>
          <Bar options={barChartOptions} data={tasksByPriorityData} />
        </div>

        {/* Task Trends Chart */}
        <div className="h-80">
          <h3 className="text-lg font-semibold mb-2">Task Trends</h3>
          <Line options={lineChartOptions} data={taskTrendsData} />
        </div>
      </div>
    </div>
  );
} 