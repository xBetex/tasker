'use client'

import { Task } from '@/types/types';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TaskPriorityChartProps {
  tasks: Task[];
  darkMode: boolean;
}

export default function TaskPriorityChart({ tasks, darkMode }: TaskPriorityChartProps) {
  const priorityCounts = {
    high: tasks.filter(task => task.priority === 'high').length,
    medium: tasks.filter(task => task.priority === 'medium').length,
    low: tasks.filter(task => task.priority === 'low').length,
  };

  const data = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Tasks by Priority',
        data: Object.values(priorityCounts),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',  // Red for high
          'rgba(234, 179, 8, 0.8)',   // Yellow for medium
          'rgba(59, 130, 246, 0.8)',  // Blue for low
        ],
        borderColor: darkMode ? 'rgba(31, 41, 55, 1)' : 'white',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: darkMode ? 'white' : 'black',
        },
        grid: {
          color: darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.3)',
        },
      },
      x: {
        ticks: {
          color: darkMode ? 'white' : 'black',
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
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
      <Bar data={data} options={options} />
    </div>
  );
} 