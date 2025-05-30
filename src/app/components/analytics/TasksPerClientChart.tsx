'use client'

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

interface TasksPerClientChartProps {
  clients: Client[];
  darkMode: boolean;
}

export default function TasksPerClientChart({ clients, darkMode }: TasksPerClientChartProps) {
  // Sort clients by number of tasks (descending)
  const sortedClients = [...clients].sort((a, b) => b.tasks.length - a.tasks.length);

  const data = {
    labels: sortedClients.map(client => `${client.name} (${client.company})`),
    datasets: [
      {
        label: 'Total Tasks',
        data: sortedClients.map(client => client.tasks.length),
        backgroundColor: 'rgba(59, 130, 246, 0.8)', // Blue
        borderColor: darkMode ? 'rgba(31, 41, 55, 1)' : 'white',
        borderWidth: 2,
      },
      {
        label: 'Completed Tasks',
        data: sortedClients.map(client => 
          client.tasks.filter(task => task.status === 'completed').length
        ),
        backgroundColor: 'rgba(34, 197, 94, 0.8)', // Green
        borderColor: darkMode ? 'rgba(31, 41, 55, 1)' : 'white',
        borderWidth: 2,
      }
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        stacked: false,
        ticks: {
          color: darkMode ? 'white' : 'black',
          stepSize: 1,
        },
        grid: {
          color: darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.3)',
        },
      },
      y: {
        stacked: false,
        ticks: {
          color: darkMode ? 'white' : 'black',
          font: {
            size: 12,
          },
          callback: function(this: Scale<any>, value: number | string) {
            const label = data.labels?.[value as number];
            const maxLength = 30;
            if (typeof label === 'string' && label.length > maxLength) {
              return label.substring(0, maxLength) + '...';
            }
            return label || '';
          }
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
        backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: darkMode ? 'white' : 'black',
        bodyColor: darkMode ? 'white' : 'black',
        borderColor: darkMode ? 'rgba(75, 85, 99, 1)' : 'rgba(209, 213, 219, 1)',
        borderWidth: 1,
      },
    },
  };

  // Calculate height based on number of clients (40px per client + padding)
  const heightPerClient = 40;
  const dynamicHeight = Math.max(300, clients.length * heightPerClient);

  return (
    <div className={`overflow-y-auto ${darkMode ? 'scrollbar-dark' : 'scrollbar-light'}`} 
         style={{ 
           maxHeight: '500px',
           // Add custom scrollbar styles
           scrollbarWidth: 'thin',
           scrollbarColor: darkMode ? '#4B5563 #1F2937' : '#D1D5DB #F3F4F6',
         }}>
      <div style={{ height: `${dynamicHeight}px`, width: '100%', minHeight: '300px' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
} 