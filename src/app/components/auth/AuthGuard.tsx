'use client'
import React from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import AuthPage from './AuthPage';

interface AuthGuardProps {
  children: React.ReactNode;
  darkMode?: boolean;
}

export default function AuthGuard({ children, darkMode = false }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-black text-gray-100' : 'bg-gray-100 text-gray-900'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading...</p>
          <p className="text-sm text-gray-500 mt-2">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Render protected content if authenticated
  return <>{children}</>;
} 