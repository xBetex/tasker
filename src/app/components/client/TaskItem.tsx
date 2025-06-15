import React, { useEffect, useRef } from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types/types';
import { MoreVerticalIcon } from '../Icons';
import DateDisplay from '../DateDisplay';
import { getSLAStatus, getSLAStatusColor, getSLAStatusBadge } from '@/utils/slaUtils';
import CommentsSection from '../CommentsSection';
import { useScroll } from '../../contexts/ScrollContext';
import UserInfo from '../UserInfo';

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
  onNavigateToTask?: (taskId: number, clientId: string) => void;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  getStatusBgColor: (status: string) => string;
  getPriorityStyle?: (priority: string) => React.CSSProperties;
  getStatusStyle?: (status: string) => React.CSSProperties;
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
  onNavigateToTask,
  getStatusColor,
  getPriorityColor,
  getStatusBgColor,
  getPriorityStyle,
  getStatusStyle,
}: TaskItemProps) {
  const { registerTaskRef, unregisterTaskRef } = useScroll();
  const taskRef = useRef<HTMLDivElement>(null);
  const slaStatus = getSLAStatus(task);
  const slaColor = getSLAStatusColor(slaStatus);
  const slaBadge = getSLAStatusBadge(slaStatus);

  // Registrar a referência da tarefa
  useEffect(() => {
    if (taskRef.current) {
      registerTaskRef(task.id, taskRef.current);
    }
    
    return () => {
      unregisterTaskRef(task.id);
    };
  }, [task.id, registerTaskRef, unregisterTaskRef]);

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
      ref={taskRef}
      className={`p-3 sm:p-4 rounded-lg border-l-4 border-t border-r border-b transition-all duration-200 hover:shadow-md cursor-context-menu ${
        getStatusBorderColor(task.status)
      }`}
      style={{
        backgroundColor: 'var(--card-background)',
        borderTopColor: 'var(--card-border)',
        borderRightColor: 'var(--card-border)', 
        borderBottomColor: 'var(--card-border)',
        // Deixamos borderLeftColor ser controlado pelas classes Tailwind para as cores de status
        color: 'var(--primary-text)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--card-background)';
      }}
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
              className="w-full p-2 border rounded-lg"
              style={{
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--input-border)',
                color: 'var(--input-text)'
              }}
            />
          ) : (
            <p className="font-medium" style={{ color: 'var(--primary-text)' }}>
              {task.description}
            </p>
          )}
        </div>
        
        <button
          onClick={(e) => onMoreVerticalClick(e, task, index)}
          className="ml-2 p-1 rounded-full transition-all duration-200 hover:scale-110"
          style={{ 
            color: 'var(--secondary-text)',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
            e.currentTarget.style.color = 'var(--primary-text)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--secondary-text)';
          }}
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
              className="px-2 py-1 rounded-full text-xs font-medium border"
              style={{
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--input-border)',
                color: 'var(--input-text)'
              }}
            >
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="awaiting client">Awaiting Client</option>
            </select>
            
            <select
              value={task.priority}
              onChange={(e) => onTaskChange(index, 'priority', e.target.value)}
              className="px-2 py-1 rounded-full text-xs font-medium border"
              style={{
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--input-border)',
                color: 'var(--input-text)'
              }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </>
        ) : (
          <>
            <span
              className={getStatusBgColor(task.status)}
              style={getStatusStyle ? getStatusStyle(task.status) : {}}
            >
              {task.status === 'pending' && 'Pending'}
              {task.status === 'in progress' && 'In Progress'}
              {task.status === 'completed' && 'Completed'}
              {task.status === 'awaiting client' && 'Awaiting Client'}
            </span>
            
            <span
              className={getPriorityColor(task.priority)}
              style={getPriorityStyle ? getPriorityStyle(task.priority) : {}}
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

      <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm mb-2" style={{ color: 'var(--secondary-text)' }}>
        <div className="flex items-center">
          <span className="font-medium mr-1">Date:</span>
          {isEditing ? (
            <input
              type="date"
              value={task.date}
              onChange={(e) => onTaskChange(index, 'date', e.target.value)}
              className="px-1.5 sm:px-2 py-1 border rounded text-xs sm:text-sm"
              style={{
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--input-border)',
                color: 'var(--input-text)'
              }}
            />
          ) : (
            <DateDisplay date={task.date} />
          )}
        </div>
        
        {task.creation_timestamp && (
          <div className="flex items-center">
            <span className="font-medium mr-1">Created:</span>
            <DateDisplay date={task.creation_timestamp} fullTimestamp />
          </div>
        )}
        
        {task.sla_date && (
          <div className="flex items-center">
            <span className="font-medium mr-1">SLA:</span>
            {isEditing ? (
              <input
                type="date"
                value={task.sla_date}
                onChange={(e) => onTaskChange(index, 'sla_date', e.target.value)}
                className="px-1.5 sm:px-2 py-1 border rounded text-xs sm:text-sm"
                style={{
                  backgroundColor: 'var(--input-background)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--input-text)'
                }}
              />
            ) : (
              <DateDisplay date={task.sla_date} />
            )}
          </div>
        )}
        
        {task.completion_date && (
          <div className="flex items-center">
            <span className="font-medium mr-1">Completed:</span>
            {task.completion_timestamp ? (
              <DateDisplay date={task.completion_timestamp} fullTimestamp />
            ) : (
              <DateDisplay date={task.completion_date} />
            )}
          </div>
        )}
      </div>

      {/* User Information */}
      {(task.createdBy || task.lastModifiedBy) && (
        <div className="flex flex-wrap gap-4 mb-2">
          {task.createdBy && (
            <UserInfo 
              user={task.createdBy} 
              label="Created by" 
              size="sm" 
              darkMode={darkMode} 
            />
          )}
          {task.lastModifiedBy && task.lastModifiedBy.id !== task.createdBy?.id && (
            <UserInfo 
              user={task.lastModifiedBy} 
              label="Modified by" 
              size="sm" 
              darkMode={darkMode} 
            />
          )}
        </div>
      )}

      <CommentsSection
        comments={task.comments || []}
        onAddComment={(text: string) => onAddComment(task.id, text)}
        darkMode={darkMode}
        taskId={task.id}
        clientId={task.client_id}
        onNavigateToTask={onNavigateToTask}
      />
    </div>
  );
} 