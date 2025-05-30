'use client'

import { Task } from '@/types/types';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TaskTimelineProps {
  tasks: Task[];
  darkMode: boolean;
}

export default function TaskTimeline({ tasks, darkMode }: TaskTimelineProps) {
  // Sort tasks by date
  const sortedTasks = [...tasks].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Group tasks by date
  const tasksByDate = sortedTasks.reduce((acc, task) => {
    const date = task.date;
    if (!acc[date]) {
      acc[date] = { total: 0, completed: 0 };
    }
    acc[date].total++;
    if (task.status === 'completed') {
      acc[date].completed++;
    }
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);

  const dates = Object.keys(tasksByDate);
  const totalTasks = dates.map(date => tasksByDate[date].total);
  const completedTasks = dates.map(date => tasksByDate[date].completed);

  const data = {
    labels: dates,
    datasets: [
      {
        label: 'Total Tasks',
        data: totalTasks,
        borderColor: 'rgba(59, 130, 246, 0.8)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Completed Tasks',
        data: completedTasks,
        borderColor: 'rgba(34, 197, 94, 0.8)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        fill: true,
        tension: 0.4,
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
          stepSize: 1,
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
          color: darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.3)',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: darkMode ? 'white' : 'black',
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
    <div className="w-full h-[400px] flex items-center justify-center">
      <Line data={data} options={options} />
    </div>
  );
} 