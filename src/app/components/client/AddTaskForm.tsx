import React from 'react';
import { Task } from '@/types/types';
import { getCurrentDateForInput, getDefaultSLADate } from '@/utils/dateUtils';

interface AddTaskFormProps {
  newTask: Omit<Task, 'id'>;
  darkMode: boolean;
  onNewTaskChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onAddTask: () => void;
  onCancel: () => void;
}

export default function AddTaskForm({
  newTask,
  darkMode,
  onNewTaskChange,
  onAddTask,
  onCancel,
}: AddTaskFormProps) {
  return (
    <div className={`p-3 rounded-lg border ${
      darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'
    } shadow-sm`}>
      <div className="space-y-2">
        <input
          type="text"
          name="description"
          placeholder="Task description"
          value={newTask.description}
          onChange={onNewTaskChange}
          className={`w-full p-2 text-sm border rounded ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
        />
        
        <div className="grid grid-cols-4 gap-2">
          <input
            type="date"
            name="date"
            value={newTask.date}
            onChange={onNewTaskChange}
            className={`p-2 text-xs border rounded ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
          
          <input
            type="date"
            name="sla_date"
            value={newTask.sla_date || ''}
            onChange={onNewTaskChange}
            placeholder="SLA Date"
            title="SLA Date"
            className={`p-2 text-xs border rounded ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
          
          <select
            name="priority"
            value={newTask.priority}
            onChange={onNewTaskChange}
            className={`p-2 text-xs border rounded ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          
          <select
            name="status"
            value={newTask.status}
            onChange={onNewTaskChange}
            className={`p-2 text-xs border rounded ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="pending">Pending</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="awaiting client">Awaiting Client</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-center space-x-2 mt-3">
        <button
          onClick={onAddTask}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            darkMode
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          ✓
        </button>
        <button
          onClick={onCancel}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            darkMode
              ? 'bg-gray-600 hover:bg-gray-700 text-white'
              : 'bg-gray-500 hover:bg-gray-600 text-white'
          }`}
        >
          ✕
        </button>
      </div>
    </div>
  );
} 