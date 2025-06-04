'use client'

import { ReactNode } from 'react';

interface KpiGroupProps {
  title: string;
  description?: string;
  children: ReactNode;
  darkMode: boolean;
  className?: string;
}

export default function KpiGroup({
  title,
  description,
  children,
  darkMode,
  className = ""
}: KpiGroupProps) {
  return (
    <div className={`${className} space-y-4`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-semibold ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </h2>
          {description && (
            <p className={`text-sm mt-1 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {description}
            </p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {children}
      </div>
    </div>
  );
} 