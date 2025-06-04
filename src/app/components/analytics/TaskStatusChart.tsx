'use client'

import { Task } from '@/types/types';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface TaskStatusChartProps {
  tasks: Task[];
  darkMode: boolean;
}

export default function TaskStatusChart({ tasks, darkMode }: TaskStatusChartProps) {
  const statusCounts = {
    pending: tasks.filter(task => task.status === 'pending').length,
    'in progress': tasks.filter(task => task.status === 'in progress').length,
    completed: tasks.filter(task => task.status === 'completed').length,
    'awaiting client': tasks.filter(task => task.status === 'awaiting client').length,
  };

  const data = {
    labels: Object.keys(statusCounts).map(status => 
      status.charAt(0).toUpperCase() + status.slice(1)
    ),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',  // Red for pending
          'rgba(234, 179, 8, 0.8)',   // Yellow for in progress
          'rgba(34, 197, 94, 0.8)',   // Green for completed
          'rgba(59, 130, 246, 0.8)',  // Blue for awaiting client
        ],
        borderColor: darkMode ? 'rgba(31, 41, 55, 1)' : 'white',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
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

  return (
    <div className="w-full h-[300px] flex items-center justify-center">
      <Pie data={data} options={options} />
    </div>
  );
} 