'use client'

import { useState, useMemo } from 'react';
import { Client } from '@/types/types';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Scale,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CompletionRateChartProps {
  clients: Client[];
  darkMode: boolean;
}

export default function CompletionRateChart({ clients, darkMode }: CompletionRateChartProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'rate' | 'tasks'>('rate');
  const [showAll, setShowAll] = useState(false);

  // Filter and sort clients
  const processedData = useMemo(() => {
    // Calculate completion rates for all clients
    const clientData = clients.map(client => {
      const totalTasks = client.tasks.length;
      const completedTasks = client.tasks.filter(task => task.status === 'completed').length;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      return {
        id: client.id,
        name: client.name,
        company: client.company,
        totalTasks,
        completedTasks,
        completionRate,
        displayName: `${client.name} (${client.company})`
      };
    });

    // Filter by search term
    const filteredData = clientData.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort data
    const sortedData = [...filteredData].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rate':
          return b.completionRate - a.completionRate;
        case 'tasks':
          return b.totalTasks - a.totalTasks;
        default:
          return 0;
      }
    });

    // Limit display if showAll is false
    const displayData = showAll ? sortedData : sortedData.slice(0, 10);

    return { sortedData, displayData, totalCount: filteredData.length };
  }, [clients, searchTerm, sortBy, showAll]);

  const chartData = {
    labels: processedData.displayData.map(client => {
      const maxLength = 25;
      return client.displayName.length > maxLength 
        ? client.displayName.substring(0, maxLength) + '...'
        : client.displayName;
    }),
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: processedData.displayData.map(client => client.completionRate),
        backgroundColor: processedData.displayData.map(client => {
          if (client.completionRate >= 90) return 'rgba(34, 197, 94, 0.8)'; // Green
          if (client.completionRate >= 70) return 'rgba(234, 179, 8, 0.8)'; // Yellow
          if (client.completionRate >= 50) return 'rgba(249, 115, 22, 0.8)'; // Orange
          return 'rgba(239, 68, 68, 0.8)'; // Red
        }),
        borderColor: darkMode ? 'rgba(31, 41, 55, 1)' : 'white',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: darkMode ? 'white' : 'black',
          callback: function(value: any) {
            return value + '%';
          }
        },
        grid: {
          color: darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.3)',
        },
      },
      y: {
        ticks: {
          color: darkMode ? 'white' : 'black',
          font: {
            size: 11,
          },
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: darkMode ? 'white' : 'black',
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: darkMode ? 'white' : 'black',
        bodyColor: darkMode ? 'white' : 'black',
        borderColor: darkMode ? 'rgba(75, 85, 99, 1)' : 'rgba(209, 213, 219, 1)',
        borderWidth: 1,
        callbacks: {
          title: function(context: any) {
            const dataIndex = context[0].dataIndex;
            return processedData.displayData[dataIndex]?.displayName || '';
          },
          label: function(context: any) {
            const dataIndex = context.dataIndex;
            const client = processedData.displayData[dataIndex];
            return [
              `Completion Rate: ${client.completionRate.toFixed(1)}%`,
              `Completed Tasks: ${client.completedTasks}`,
              `Total Tasks: ${client.totalTasks}`
            ];
          }
        }
      },
    },
  };

  // Calculate dynamic height based on number of items
  const heightPerItem = 35;
  const minHeight = 300;
  const dynamicHeight = Math.max(minHeight, processedData.displayData.length * heightPerItem + 100);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search clients by name or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full p-2 rounded border ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 placeholder-gray-500'
            }`}
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'rate' | 'tasks')}
            className={`p-2 rounded border text-sm ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300'
            }`}
          >
            <option value="rate">Completion Rate</option>
            <option value="name">Client Name</option>
            <option value="tasks">Total Tasks</option>
          </select>
        </div>

        {/* Show All Toggle */}
        {processedData.totalCount > 10 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className={`px-3 py-2 text-sm rounded ${
              darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {showAll ? 'Show Top 10' : `Show All (${processedData.totalCount})`}
          </button>
        )}
      </div>

      {/* Results Info */}
      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Showing {processedData.displayData.length} of {processedData.totalCount} clients
        {searchTerm && ` matching "${searchTerm}"`}
      </div>

      {/* Chart */}
      <div 
        className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} overflow-auto`}
        style={{ height: `${dynamicHeight}px` }}
      >
        {processedData.displayData.length > 0 ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <div className={`flex items-center justify-center h-full ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="text-center">
              <p className="text-lg mb-2">No clients found</p>
              <p className="text-sm">Try adjusting your search terms</p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {processedData.displayData.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              {processedData.displayData.filter(c => c.completionRate >= 90).length}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              ≥90% Complete
            </div>
          </div>
          <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className={`text-lg font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
              {processedData.displayData.filter(c => c.completionRate >= 70 && c.completionRate < 90).length}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              70-89% Complete
            </div>
          </div>
          <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className={`text-lg font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
              {processedData.displayData.filter(c => c.completionRate >= 50 && c.completionRate < 70).length}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              50-69% Complete
            </div>
          </div>
          <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className={`text-lg font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
              {processedData.displayData.filter(c => c.completionRate < 50).length}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              &lt;50% Complete
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 