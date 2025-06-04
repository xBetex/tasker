'use client'

import { useState } from 'react';

interface ToggleFilterButtonProps<T extends string> {
  options: T[];
  value: T | 'all';
  onChange: (value: T | 'all') => void;
  darkMode: boolean;
  label?: string;
  optionLabels?: Record<T, string>;
}

export default function ToggleFilterButton<T extends string>({
  options,
  value,
  onChange,
  darkMode,
  label,
  optionLabels
}: ToggleFilterButtonProps<T>) {
  const [showDropdown, setShowDropdown] = useState(false);

  const allOptions = ['all', ...options] as (T | 'all')[];

  const getDisplayText = (option: T | 'all') => {
    if (option === 'all') return 'All';
    return option.charAt(0).toUpperCase() + option.slice(1);
  };

  const getStatusColor = (option: T | 'all', isSelected: boolean) => {
    if (!isSelected) {
      return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700';
    }

    if (option === 'all') {
      return darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white';
    }

    const colorMap: Record<string, string> = {
      pending: darkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-500 text-white',
      'in progress': darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white',
      completed: darkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white',
      'awaiting client': darkMode ? 'bg-orange-600 text-white' : 'bg-orange-500 text-white',
      low: darkMode ? 'bg-gray-600 text-white' : 'bg-gray-500 text-white',
      medium: darkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-500 text-white',
      high: darkMode ? 'bg-red-600 text-white' : 'bg-red-500 text-white',
    };

    return colorMap[option] || (darkMode ? 'bg-gray-600 text-white' : 'bg-gray-500 text-white');
  };

  return (
    <div className="relative">
      {label && (
        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </label>
      )}
      
      {/* Toggle Buttons */}
      <div className="flex flex-wrap gap-2 mb-2">
        {allOptions.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`px-3 py-1 text-sm rounded-full transition-all duration-200 hover:scale-105 active:scale-95 ${
              getStatusColor(option, value === option)
            }`}
          >
            {optionLabels && option !== 'all' ? optionLabels[option] || getDisplayText(option) : getDisplayText(option)}
          </button>
        ))}
      </div>

      {/* Dropdown Toggle */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`text-xs ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'} transition-colors`}
      >
        {showDropdown ? '↑ Hide dropdown' : '↓ Show dropdown'}
      </button>

      {/* Dropdown Fallback */}
      {showDropdown && (
        <div className="mt-2">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value as T | 'all')}
            className={`block w-full rounded-md text-sm ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
            } shadow-sm`}
          >
            <option value="all">All {label || 'Options'}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {optionLabels && option !== 'all' ? optionLabels[option] || getDisplayText(option) : getDisplayText(option)}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
} 