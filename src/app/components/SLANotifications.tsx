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
    // Navigate to the main dashboard with highlight parameter to show the specific task
    const url = `/?highlight=${notification.clientId}-${notification.taskId}`;
    router.push(url);
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
        className={`relative p-2 rounded-xl transition-all duration-200 ring-1 ${isOpen ? 'scale-95' : 'hover:scale-105'}`}
        style={{
          backgroundColor: isOpen ? 'var(--card-background-hover)' : 'var(--card-background)',
          color: 'var(--primary-text)',
          borderColor: 'var(--card-border)'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'var(--card-background)';
          }
        }}
        title={`${totalUrgentCount} urgent SLA ${totalUrgentCount === 1 ? 'notification' : 'notifications'}`}
      >
        {/* Bell Icon with subtle animation */}
        <svg className={`w-6 h-6 transition-transform duration-200 ${isOpen ? 'rotate-12' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3-3v-4a6 6 0 0 0-12 0v4l-3 3h5m6 0v1a3 3 0 0 1-6 0v-1m6 0H9" />
        </svg>
        
        {/* Enhanced notification badge */}
        {totalUrgentCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg ring-2 animate-pulse"
            style={{
              background: 'linear-gradient(to right, #ef4444, #dc2626)',
              borderColor: 'var(--card-background)'
            }}
          >
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
          
          <div 
            className="absolute right-0 mt-3 w-96 max-w-sm rounded-2xl shadow-2xl border z-50 overflow-hidden transform transition-all duration-200 origin-top-right backdrop-blur-xl"
            style={{
              backgroundColor: 'var(--card-background)',
              borderColor: 'var(--card-border)'
            }}
          >
            {/* Header with gradient */}
            <div 
              className="px-6 py-4 border-b"
              style={{
                borderColor: 'var(--card-border)',
                background: `linear-gradient(to right, var(--card-background-hover), var(--card-background))`
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 
                    className="font-bold text-lg"
                    style={{ color: 'var(--primary-text)' }}
                  >
                    🔔 SLA Alerts
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--secondary-text)' }}
                  >
                    {totalUrgentCount} urgent notification{totalUrgentCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full transition-colors"
                  style={{
                    color: 'var(--secondary-text)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                    e.currentTarget.style.color = 'var(--primary-text)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--secondary-text)';
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Enhanced Summary with icons */}
              <div className="mt-3 flex gap-4 text-sm">
                {overdueCount > 0 && (
                  <div 
                    className="flex items-center gap-1 px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                      color: darkMode ? 'rgb(248, 113, 113)' : 'rgb(220, 38, 38)'
                    }}
                  >
                    <span>🚨</span>
                    <span className="font-medium">
                      {overdueCount} overdue
                    </span>
                  </div>
                )}
                {dueTodayCount > 0 && (
                  <div 
                    className="flex items-center gap-1 px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: darkMode ? 'rgba(251, 146, 60, 0.15)' : 'rgba(251, 146, 60, 0.1)',
                      color: darkMode ? 'rgb(251, 146, 60)' : 'rgb(249, 115, 22)'
                    }}
                  >
                    <span>⚠️</span>
                    <span className="font-medium">
                      {dueTodayCount} today
                    </span>
                  </div>
                )}
                {dueSoonCount > 0 && (
                  <div 
                    className="flex items-center gap-1 px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: darkMode ? 'rgba(250, 204, 21, 0.15)' : 'rgba(250, 204, 21, 0.1)',
                      color: darkMode ? 'rgb(250, 204, 21)' : 'rgb(234, 179, 8)'
                    }}
                  >
                    <span>⏰</span>
                    <span className="font-medium">
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
                  onClick={() => handleNotificationClick(notification)}
                  className="px-6 py-4 border-b cursor-pointer transition-all duration-200 hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--card-background)',
                    borderColor: 'var(--card-border)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--card-background)';
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div 
                          className="text-sm font-medium truncate"
                          style={{ color: 'var(--primary-text)' }}
                        >
                          {notification.clientName}
                        </div>
                        <span 
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getNotificationColor(notification.type)}`}
                        >
                          {notification.type === 'overdue' ? 'Overdue' :
                           notification.type === 'due_today' ? 'Due Today' :
                           notification.type === 'due_soon' ? 'Due Soon' : 'Alert'}
                        </span>
                      </div>
                      
                      <p 
                        className="text-sm mb-2 line-clamp-2"
                        style={{ color: 'var(--secondary-text)' }}
                      >
                        {notification.taskDescription}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div 
                          className="text-xs"
                          style={{ color: 'var(--muted-text)' }}
                        >
                          <DateDisplay date={notification.slaDate} showTime={false} />
                        </div>
                        
                        <button
                          onClick={(e) => handleMarkAsResolved(notification, e)}
                          disabled={isUpdating === notification.id}
                          className="ml-2 px-2 py-1 text-xs rounded-md transition-all duration-200 hover:scale-105 disabled:opacity-50 border"
                          style={{
                            backgroundColor: 'var(--primary-button)',
                            borderColor: 'var(--primary-button)',
                            color: 'white'
                          }}
                          onMouseEnter={(e) => {
                            if (isUpdating !== notification.id) {
                              e.currentTarget.style.backgroundColor = 'var(--primary-button-hover)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (isUpdating !== notification.id) {
                              e.currentTarget.style.backgroundColor = 'var(--primary-button)';
                            }
                          }}
                        >
                          {isUpdating === notification.id ? '...' : '✓ Resolve'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Footer Actions */}
            <div 
              className="px-6 py-4 border-t"
              style={{
                backgroundColor: 'var(--card-background-hover)',
                borderColor: 'var(--card-border)'
              }}
            >
              <div className="flex gap-2">
                <button
                  onClick={handleViewAllTasks}
                  className="flex-1 px-4 py-2 text-sm rounded-lg transition-all duration-200 hover:scale-105 border"
                  style={{
                    backgroundColor: 'var(--card-background)',
                    borderColor: 'var(--card-border)',
                    color: 'var(--secondary-text)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                    e.currentTarget.style.color = 'var(--primary-text)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--card-background)';
                    e.currentTarget.style.color = 'var(--secondary-text)';
                  }}
                >
                  📋 View All Tasks
                </button>
                
                <button
                  onClick={handleViewSLAPage}
                  className="flex-1 px-4 py-2 text-sm rounded-lg transition-all duration-200 hover:scale-105 border"
                  style={{
                    backgroundColor: 'var(--primary-button)',
                    borderColor: 'var(--primary-button)',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--primary-button-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--primary-button)';
                  }}
                >
                  📊 SLA Dashboard
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 