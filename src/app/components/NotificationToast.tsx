'use client'

import { useEffect, useState } from 'react';
import { NotificationData } from '@/types/types';
import { useNotifications } from '../contexts/NotificationContext';

interface ToastProps {
  notification: NotificationData;
  onClose: () => void;
}

const Toast = ({ notification, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Fade in animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  const getColorClasses = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-100 border-green-300 text-green-900 shadow-green-200';
      case 'error':
        return 'bg-red-100 border-red-300 text-red-900 shadow-red-200';
      case 'warning':
        return 'bg-yellow-100 border-yellow-300 text-yellow-900 shadow-yellow-200';
      case 'info':
        return 'bg-blue-100 border-blue-300 text-blue-900 shadow-blue-200';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-900 shadow-gray-200';
    }
  };

  const getToastClasses = () => {
    const baseClasses = 'transform transition-all duration-300 ease-in-out max-w-sm w-full border-2 rounded-lg shadow-xl p-4 mb-3 backdrop-blur-sm font-medium';
    const visibilityClasses = isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0';
    
    // Light mode classes
    const lightModeClasses = getColorClasses();
    
    // Dark mode classes with explicit color definitions
    let darkModeClasses = '';
    switch (notification.type) {
      case 'success':
        darkModeClasses = 'dark:bg-green-700 dark:border-green-500 dark:text-white dark:shadow-green-900/50';
        break;
      case 'error':
        darkModeClasses = 'dark:bg-red-700 dark:border-red-500 dark:text-white dark:shadow-red-900/50';
        break;
      case 'warning':
        darkModeClasses = 'dark:bg-amber-600 dark:border-amber-400 dark:text-white dark:shadow-amber-900/50';
        break;
      case 'info':
        darkModeClasses = 'dark:bg-blue-700 dark:border-blue-500 dark:text-white dark:shadow-blue-900/50';
        break;
      default:
        darkModeClasses = 'dark:bg-gray-700 dark:border-gray-500 dark:text-white dark:shadow-gray-900/50';
        break;
    }
    
    return `${baseClasses} ${visibilityClasses} ${lightModeClasses} ${darkModeClasses}`;
  };
  
  return (
    <div className={getToastClasses()}>
      <div className="flex items-start">
        <div className="flex-shrink-0 text-lg mr-3">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm mb-1 text-current">
            {notification.title}
          </div>
          {notification.message && (
            <div className="text-xs opacity-95 leading-relaxed text-current font-medium">
              {notification.message}
            </div>
          )}
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-xs underline hover:no-underline font-medium text-current opacity-90 hover:opacity-100 transition-opacity"
            >
              {notification.action.label}
            </button>
          )}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-3 text-xl font-bold opacity-80 hover:opacity-100 transition-opacity text-current"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default function NotificationToast() {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
} 