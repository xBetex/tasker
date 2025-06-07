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
        return 'bg-green-50 border-green-200 text-green-800 shadow-green-100';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 shadow-red-100';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 shadow-yellow-100';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800 shadow-blue-100';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 shadow-gray-100';
    }
  };

  const getDarkColorClasses = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-900 border-green-700 text-green-100';
      case 'error':
        return 'bg-red-900 border-red-700 text-red-100';
      case 'warning':
        return 'bg-yellow-900 border-yellow-700 text-yellow-100';
      case 'info':
        return 'bg-blue-900 border-blue-700 text-blue-100';
      default:
        return 'bg-gray-900 border-gray-700 text-gray-100';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        max-w-sm w-full border rounded-lg shadow-lg p-4 mb-3
        ${getColorClasses()}
        dark:${getDarkColorClasses()}
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 text-lg mr-3">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm mb-1">
            {notification.title}
          </div>
          {notification.message && (
            <div className="text-xs opacity-90 leading-relaxed">
              {notification.message}
            </div>
          )}
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-xs underline hover:no-underline font-medium"
            >
              {notification.action.label}
            </button>
          )}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-3 text-lg opacity-70 hover:opacity-100 transition-opacity"
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