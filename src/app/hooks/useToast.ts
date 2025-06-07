import { useNotifications } from '../contexts/NotificationContext';

interface ToastOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useToast = () => {
  const { addNotification } = useNotifications();

  const success = (title: string, message?: string, options?: ToastOptions) => {
    addNotification({
      type: 'success',
      title,
      message,
      duration: options?.duration,
      action: options?.action,
    });
  };

  const error = (title: string, message?: string, options?: ToastOptions) => {
    addNotification({
      type: 'error',
      title,
      message,
      duration: options?.duration || 8000, // Errors stay longer
      action: options?.action,
    });
  };

  const warning = (title: string, message?: string, options?: ToastOptions) => {
    addNotification({
      type: 'warning',
      title,
      message,
      duration: options?.duration || 6000,
      action: options?.action,
    });
  };

  const info = (title: string, message?: string, options?: ToastOptions) => {
    addNotification({
      type: 'info',
      title,
      message,
      duration: options?.duration,
      action: options?.action,
    });
  };

  return {
    success,
    error,
    warning,
    info,
  };
}; 