import React from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types/types';
import { MoreVerticalIcon } from '../Icons';
import DateDisplay from '../DateDisplay';
import { getSLAStatus, getSLAStatusColor, getSLAStatusBadge } from '@/utils/slaUtils';
import CommentsSection from '../CommentsSection';

interface TaskItemProps {
  task: Task;
  index: number;
  isEditing: boolean;
  darkMode: boolean;
  onTaskChange: (index: number, field: keyof Task, value: string) => void;
  onMoreVerticalClick: (e: React.MouseEvent, task: Task, index: number) => void;
  onTouchStart: (e: React.TouchEvent, task: Task, index: number) => void;
  onTouchEnd: () => void;
  onTouchCancel: () => void;
  onAddComment: (taskId: number, commentText: string) => void;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  getStatusBgColor: (status: string) => string;
}

export default function TaskItem({
  task,
  index,
  isEditing,
  darkMode,
  onTaskChange,
  onMoreVerticalClick,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
  onAddComment,
  getStatusColor,
  getPriorityColor,
  getStatusBgColor,
}: TaskItemProps) {
  const slaStatus = getSLAStatus(task);
  const slaColor = getSLAStatusColor(slaStatus);
  const slaBadge = getSLAStatusBadge(slaStatus);

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-l-green-500';
      case 'in progress':
        return 'border-l-blue-500';
      case 'awaiting client':
        return 'border-l-orange-500';
      default:
        return 'border-l-gray-400';
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border-l-4 border-t border-r border-b transition-all duration-200 hover:shadow-md cursor-context-menu ${
        getStatusBorderColor(task.status)
      } ${
        darkMode
          ? 'bg-gray-700 border-gray-600 hover:bg-gray-650'
          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
      }`}
      onTouchStart={(e) => onTouchStart(e, task, index)}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
      onContextMenu={(e) => {
        e.preventDefault();
        onMoreVerticalClick(e, task, index);
      }}
      title="Right-click for more options"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={task.description}
              onChange={(e) => onTaskChange(index, 'description', e.target.value)}
              className={`w-full p-2 border rounded-lg ${
                darkMode
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          ) : (
            <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {task.description}
            </p>
          )}
        </div>
        
        <button
          onClick={(e) => onMoreVerticalClick(e, task, index)}
          className={`ml-2 p-1 rounded-full transition-all duration-200 hover:scale-110 ${
            darkMode 
              ? 'hover:bg-gray-600 text-gray-400 hover:text-white' 
              : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
          }`}
          title="Task options (or right-click)"
        >
          <MoreVerticalIcon />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-2">
        {isEditing ? (
          <>
            <select
              value={task.status}
              onChange={(e) => onTaskChange(index, 'status', e.target.value)}
              className={`px-2 py-1 rounded-full text-xs font-medium border ${
                darkMode
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="awaiting client">Awaiting Client</option>
            </select>
            
            <select
              value={task.priority}
              onChange={(e) => onTaskChange(index, 'priority', e.target.value)}
              className={`px-2 py-1 rounded-full text-xs font-medium border ${
                darkMode
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </>
        ) : (
          <>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBgColor(task.status)}`}
            >
              {task.status === 'pending' && 'Pending'}
              {task.status === 'in progress' && 'In Progress'}
              {task.status === 'completed' && 'Completed'}
              {task.status === 'awaiting client' && 'Awaiting Client'}
            </span>
            
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}
            >
              {task.priority === 'low' && 'Low'}
              {task.priority === 'medium' && 'Medium'}
              {task.priority === 'high' && 'High'}
            </span>
          </>
        )}
        
        {slaBadge && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${slaColor}`}>
            {slaBadge}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
        <div className="flex items-center">
          <span className="font-medium mr-1">Date:</span>
          {isEditing ? (
            <input
              type="date"
              value={task.date}
              onChange={(e) => onTaskChange(index, 'date', e.target.value)}
              className={`px-2 py-1 border rounded ${
                darkMode
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          ) : (
            <DateDisplay date={task.date} />
          )}
        </div>
        
        {task.sla_date && (
          <div className="flex items-center">
            <span className="font-medium mr-1">SLA:</span>
            {isEditing ? (
              <input
                type="date"
                value={task.sla_date}
                onChange={(e) => onTaskChange(index, 'sla_date', e.target.value)}
                className={`px-2 py-1 border rounded ${
                  darkMode
                    ? 'bg-gray-600 border-gray-500 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            ) : (
              <DateDisplay date={task.sla_date} />
            )}
          </div>
        )}
        
        {task.completion_date && (
          <div className="flex items-center">
            <span className="font-medium mr-1">Completed:</span>
            <DateDisplay date={task.completion_date} />
          </div>
        )}
      </div>

      <CommentsSection
        comments={task.comments || []}
        onAddComment={(text: string) => onAddComment(task.id, text)}
        darkMode={darkMode}
      />
    </div>
  );
} 