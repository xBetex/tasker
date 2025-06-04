import { useState } from 'react';
import { SLANotification } from '@/app/hooks/useSLANotifications';
import DateDisplay from './DateDisplay';

interface SLANotificationsProps {
  notifications: SLANotification[];
  overdueCount: number;
  dueTodayCount: number;
  dueSoonCount: number;
  totalUrgentCount: number;
  hasUrgentTasks: boolean;
  darkMode: boolean;
}

export default function SLANotifications({
  notifications,
  overdueCount,
  dueTodayCount,
  dueSoonCount,
  totalUrgentCount,
  hasUrgentTasks,
  darkMode
}: SLANotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!hasUrgentTasks) {
    return null;
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'overdue':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'due_today':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'due_soon':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'overdue':
        return '🚨';
      case 'due_today':
        return '⚠️';
      case 'due_soon':
        return '⏰';
      default:
        return '📋';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-colors ${
          darkMode 
            ? 'hover:bg-gray-700 text-white' 
            : 'hover:bg-gray-100 text-gray-700'
        }`}
        title={`${totalUrgentCount} urgent SLA ${totalUrgentCount === 1 ? 'notification' : 'notifications'}`}
      >
        {/* Bell Icon */}
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3-3v-4a6 6 0 0 0-12 0v4l-3 3h5m6 0v1a3 3 0 0 1-6 0v-1m6 0H9" />
        </svg>
        
        {/* Notification Badge */}
        {totalUrgentCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {totalUrgentCount > 99 ? '99+' : totalUrgentCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-96 rounded-lg shadow-lg border z-50 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          {/* Header */}
          <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex justify-between items-center">
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                SLA Notifications
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className={`text-sm ${
                  darkMode 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ✕
              </button>
            </div>
            
            {/* Summary */}
            <div className="mt-2 flex gap-4 text-sm">
              {overdueCount > 0 && (
                <span className="text-red-600 font-medium">
                  {overdueCount} overdue
                </span>
              )}
              {dueTodayCount > 0 && (
                <span className="text-orange-600 font-medium">
                  {dueTodayCount} due today
                </span>
              )}
              {dueSoonCount > 0 && (
                <span className="text-yellow-600 font-medium">
                  {dueSoonCount} due soon
                </span>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 border-b last:border-b-0 ${
                  darkMode ? 'border-gray-700' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`font-medium truncate ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {notification.taskDescription}
                        </p>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {notification.clientName}
                        </p>
                      </div>
                      
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ml-2 ${
                        getNotificationColor(notification.type)
                      }`}>
                        {notification.message}
                      </span>
                    </div>
                    
                    <div className={`mt-1 text-xs ${
                      darkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      SLA Date: <DateDisplay date={notification.slaDate} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className={`px-4 py-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => setIsOpen(false)}
              className={`w-full text-sm font-medium ${
                darkMode 
                  ? 'text-blue-400 hover:text-blue-300' 
                  : 'text-blue-600 hover:text-blue-500'
              }`}
            >
              View All Tasks
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 