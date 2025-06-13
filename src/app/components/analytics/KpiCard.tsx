'use client'

import { ReactNode } from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon?: ReactNode;
  description?: string;
  darkMode: boolean;
  className?: string;
}

export default function KpiCard({
  title,
  value,
  trend,
  trendValue,
  icon,
  description,
  darkMode,
  className = ""
}: KpiCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
          </svg>
        );
      case 'stable':
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      case 'stable':
        return darkMode ? 'text-gray-400' : 'text-gray-500';
      default:
        return '';
    }
  };

  return (
    <div 
      className={`${className} rounded-xl border p-6 transition-all duration-200 hover:shadow-lg transform hover:scale-105`}
      style={{
        backgroundColor: 'var(--card-background)',
        borderColor: 'var(--card-border)',
        color: 'var(--primary-text)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--card-background)';
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {icon && <div className="text-lg">{icon}</div>}
            <h3 
              className="text-sm font-medium"
              style={{ color: 'var(--secondary-text)' }}
            >
              {title}
            </h3>
          </div>
          
          <div className="flex items-baseline gap-2">
            <div 
              className="text-2xl font-bold"
              style={{ color: 'var(--primary-text)' }}
            >
              {value}
            </div>
            
            {trend && trendValue && (
              <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
                {getTrendIcon()}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          
          {description && (
            <p 
              className="text-xs mt-2"
              style={{ color: 'var(--muted-text)' }}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 