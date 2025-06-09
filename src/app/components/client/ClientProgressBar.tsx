import React from 'react';
import { Task } from '@/types/types';

interface ProgressInfo {
  percent: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
}

interface ClientProgressBarProps {
  progress: ProgressInfo;
  darkMode: boolean;
  isExpanded?: boolean;
}

export default function ClientProgressBar({ progress, darkMode, isExpanded = false }: ClientProgressBarProps) {
  return (
    <div className={`mb-4 client-progress ${!isExpanded ? 'cursor-pointer' : ''}`}>
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Task Progress
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {progress.percent}%
          </span>
          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            (click to view tasks)
          </span>
        </div>
      </div>
      
      <div className={`w-full bg-gray-200 rounded-full h-3 mb-3 ${darkMode ? 'bg-gray-700' : ''}`}>
        <div
          className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-1" />
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              High: {progress.highPriority}
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1" />
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Medium: {progress.mediumPriority}
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Low: {progress.lowPriority}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>Status:</span>
          <div className="flex items-center space-x-1">
                         <div className="w-2 h-2 bg-gray-400 rounded-full" title="Pending" />
             <div className="w-2 h-2 bg-blue-500 rounded-full" title="In Progress" />
             <div className="w-2 h-2 bg-orange-500 rounded-full" title="Awaiting Client" />
             <div className="w-2 h-2 bg-green-500 rounded-full" title="Completed" />
          </div>
        </div>
      </div>
    </div>
  );
} 