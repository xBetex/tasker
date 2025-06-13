'use client';

import React from 'react';
import GlobalCommentsSearch from '@/components/GlobalCommentsSearch';
import { useTheme } from '@/app/contexts/ThemeContext';

const CommentsSearchPage: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen py-8 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <GlobalCommentsSearch />
      </div>
    </div>
  );
};

export default CommentsSearchPage; 