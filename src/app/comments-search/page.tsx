'use client';

import React, { useState, useEffect } from 'react';
import GlobalCommentSearch from '@/components/GlobalCommentSearch';
import { useDarkMode } from '@/app/layout';
import AuthGuard from '../components/auth/AuthGuard';
import { Client } from '@/types/types';
import { api } from '@/services/api';

const CommentsSearchPage: React.FC = () => {
  const { darkMode } = useDarkMode();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await api.getClients();
        setClients(data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleNavigateToTask = (taskId: number, clientId: string) => {
    const url = `/filtered-tasks?task=${taskId}`;
    window.location.href = url;
  };

  if (loading) {
    return (
      <AuthGuard darkMode={darkMode}>
        <div 
          className="min-h-screen py-8"
          style={{ backgroundColor: 'var(--page-background)' }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <div className="text-xl">Loading Comments...</div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard darkMode={darkMode}>
      <div 
        className="min-h-screen py-8"
        style={{ backgroundColor: 'var(--page-background)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlobalCommentSearch 
            clients={clients}
            darkMode={darkMode}
            onNavigateToTask={handleNavigateToTask}
          />
        </div>
      </div>
    </AuthGuard>
  );
};

export default CommentsSearchPage; 