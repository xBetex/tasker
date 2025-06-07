import { useState } from 'react';
import { SLANotification } from '@/app/hooks/useSLANotifications';
import DateDisplay from './DateDisplay';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';

interface SLANotificationsProps {
  notifications: SLANotification[];
  overdueCount: number;
  dueTodayCount: number;
  dueSoonCount: number;
  totalUrgentCount: number;
  hasUrgentTasks: boolean;
  darkMode: boolean;
  onUpdate?: () => void;
}

export default function SLANotifications({
  notifications,
  overdueCount,
  dueTodayCount,
  dueSoonCount,
  totalUrgentCount,
  hasUrgentTasks,
  darkMode,
  onUpdate
}: SLANotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const router = useRouter();

  if (!hasUrgentTasks) {
    return null;
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'overdue':
        return darkMode 
          ? 'text-red-300 bg-red-900/30 border-red-700/50' 
          : 'text-red-700 bg-red-50 border-red-200';
      case 'due_today':
        return darkMode 
          ? 'text-orange-300 bg-orange-900/30 border-orange-700/50' 
          : 'text-orange-700 bg-orange-50 border-orange-200';
      case 'due_soon':
        return darkMode 
          ? 'text-yellow-300 bg-yellow-900/30 border-yellow-700/50' 
          : 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return darkMode 
          ? 'text-gray-400 bg-gray-800/50 border-gray-600' 
          : 'text-gray-600 bg-gray-50 border-gray-200';
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

  const handleNotificationClick = (notification: SLANotification) => {
    router.push(`/filtered-tasks?task=${notification.taskId}`);
    setIsOpen(false);
  };

  const handleMarkAsResolved = async (notification: SLANotification, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setIsUpdating(notification.id);
    try {
      await api.updateTaskStatus(notification.taskId, 'completed');
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error marking task as resolved:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleViewAllTasks = () => {
    router.push('/filtered-tasks');
    setIsOpen(false);
  };

  const handleViewSLAPage = () => {
    router.push('/sla');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-all duration-200 ${
          darkMode 
            ? 'hover:bg-gray-700/50 text-white ring-1 ring-gray-700/50' 
            : 'hover:bg-gray-100/80 text-gray-700 ring-1 ring-gray-200/50'
        } ${isOpen ? 'scale-95' : 'hover:scale-105'}`}
        title={`${totalUrgentCount} urgent SLA ${totalUrgentCount === 1 ? 'notification' : 'notifications'}`}
      >
        {/* Bell Icon with subtle animation */}
        <svg className={`w-6 h-6 transition-transform duration-200 ${isOpen ? 'rotate-12' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3-3v-4a6 6 0 0 0-12 0v4l-3 3h5m6 0v1a3 3 0 0 1-6 0v-1m6 0H9" />
        </svg>
        
        {/* Enhanced notification badge */}
        {totalUrgentCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg ring-2 ring-white dark:ring-gray-800 animate-pulse">
            {totalUrgentCount > 99 ? '99+' : totalUrgentCount}
          </span>
        )}
      </button>

      {/* Enhanced Notifications Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop with blur effect */}
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className={`absolute right-0 mt-3 w-96 max-w-sm rounded-2xl shadow-2xl border z-50 overflow-hidden transform transition-all duration-200 origin-top-right ${
            darkMode 
              ? 'bg-gray-900/95 backdrop-blur-xl border-gray-700/50' 
              : 'bg-white/95 backdrop-blur-xl border-gray-200/50'
          }`}>
            {/* Header with gradient */}
            <div className={`px-6 py-4 border-b ${
              darkMode ? 'border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/50' : 'border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-gray-100/50'
            }`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    🔔 SLA Alerts
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {totalUrgentCount} urgent notification{totalUrgentCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-2 rounded-full transition-colors ${
                    darkMode 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700/50' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Enhanced Summary with icons */}
              <div className="mt-3 flex gap-4 text-sm">
                {overdueCount > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30">
                    <span>🚨</span>
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      {overdueCount} overdue
                    </span>
                  </div>
                )}
                {dueTodayCount > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30">
                    <span>⚠️</span>
                    <span className="text-orange-600 dark:text-orange-400 font-medium">
                      {dueTodayCount} today
                    </span>
                  </div>
                )}
                {dueSoonCount > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                    <span>⏰</span>
                    <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                      {dueSoonCount} soon
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Notifications List */}
            <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`px-6 py-4 border-b last:border-b-0 cursor-pointer transition-all duration-200 ${
                    darkMode 
                      ? 'border-gray-700/30 hover:bg-gray-800/50' 
                      : 'border-gray-100/50 hover:bg-gray-50/80'
                  } hover:transform hover:scale-[1.02] hover:shadow-md`}
                  onClick={() => handleNotificationClick(notification)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="text-xl animate-bounce" style={{ animationDelay: `${index * 100}ms` }}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className={`font-semibold text-base leading-tight ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {notification.taskDescription}
                          </p>
                          <p className={`text-sm mt-1 ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            👤 {notification.clientName}
                          </p>
                        </div>
                        
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ml-3 ${
                          getNotificationColor(notification.type)
                        }`}>
                          {notification.message}
                        </span>
                      </div>
                      
                      <div className={`flex items-center justify-between text-xs ${
                        darkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        <div className="flex items-center gap-1">
                          <span>📅</span>
                          <DateDisplay date={notification.slaDate} />
                        </div>
                        
                        {/* Enhanced Mark as Resolved Button */}
                        <button
                          onClick={(e) => handleMarkAsResolved(notification, e)}
                          disabled={isUpdating === notification.id}
                          className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                            darkMode 
                              ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white' 
                              : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white'
                          } disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105`}
                        >
                          {isUpdating === notification.id ? (
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>Resolving...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <span>✓</span>
                              <span>Resolve</span>
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Footer with multiple actions */}
            <div className={`px-6 py-4 border-t ${
              darkMode ? 'border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/50' : 'border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-gray-100/50'
            }`}>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleViewAllTasks}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                    darkMode 
                      ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30' 
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                  } hover:transform hover:scale-105 hover:shadow-md`}
                >
                  📋 View Tasks
                </button>
                <button
                  onClick={handleViewSLAPage}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                    darkMode 
                      ? 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-500/30' 
                      : 'bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200'
                  } hover:transform hover:scale-105 hover:shadow-md`}
                >
                  🎯 SLA Dashboard
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 