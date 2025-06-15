'use client';

import React from 'react';
import GlobalCommentsSearch from '@/components/GlobalCommentsSearch';
import { useDarkMode } from '@/app/layout';
import AuthGuard from '../components/auth/AuthGuard';

const CommentsSearchPage: React.FC = () => {
  const { darkMode } = useDarkMode();

  return (
    <AuthGuard darkMode={darkMode}>
      <div 
        className="min-h-screen py-8"
        style={{ backgroundColor: 'var(--page-background)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlobalCommentsSearch />
        </div>
      </div>
    </AuthGuard>
  );
};

export default CommentsSearchPage; 