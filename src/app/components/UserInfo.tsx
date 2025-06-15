import React from 'react';

interface UserInfoProps {
  user?: {
    id: string;
    username: string;
    role: 'admin' | 'user';
  } | null;
  label?: string;
  showRole?: boolean;
  size?: 'sm' | 'md' | 'lg';
  darkMode?: boolean;
}

export default function UserInfo({ 
  user, 
  label = 'Created by', 
  showRole = true, 
  size = 'sm',
  darkMode = false 
}: UserInfoProps) {
  if (!user) return null;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const roleColors = {
    admin: darkMode ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800',
    user: darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
  };

  return (
    <div className={`flex items-center gap-2 ${sizeClasses[size]}`}>
      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
        {label}:
      </span>
      <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        {user.username}
      </span>
      {showRole && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
          {user.role.toUpperCase()}
        </span>
      )}
    </div>
  );
} 