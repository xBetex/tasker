'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TimezoneContextType {
  timezone: string;
  setTimezone: (timezone: string) => void;
  formatDateWithTimezone: (date: string | Date, options?: Intl.DateTimeFormatOptions) => string;
  getCurrentDateInTimezone: () => Date;
  getTimezoneOffset: () => number;
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined);

const TIMEZONE_OPTIONS = [
  { value: 'America/Sao_Paulo', label: 'GMT-3 (São Paulo)', offset: -3 },
  { value: 'America/New_York', label: 'GMT-5 (New York)', offset: -5 },
  { value: 'Europe/London', label: 'GMT+0 (London)', offset: 0 },
  { value: 'Europe/Paris', label: 'GMT+1 (Paris)', offset: 1 },
  { value: 'Asia/Tokyo', label: 'GMT+9 (Tokyo)', offset: 9 },
  { value: 'UTC', label: 'UTC (GMT+0)', offset: 0 },
];

interface TimezoneProviderProps {
  children: ReactNode;
}

export function TimezoneProvider({ children }: TimezoneProviderProps) {
  const [timezone, setTimezoneState] = useState<string>('America/Sao_Paulo'); // Default to GMT-3

  // Load timezone from localStorage on mount
  useEffect(() => {
    const savedTimezone = localStorage.getItem('app-timezone');
    if (savedTimezone) {
      setTimezoneState(savedTimezone);
    }
  }, []);

  // Save timezone to localStorage when it changes
  const setTimezone = (newTimezone: string) => {
    setTimezoneState(newTimezone);
    localStorage.setItem('app-timezone', newTimezone);
  };

  // Format date with the selected timezone
  const formatDateWithTimezone = (date: string | Date, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...options
    };

    return dateObj.toLocaleString('pt-BR', defaultOptions);
  };

  // Get current date in the selected timezone
  const getCurrentDateInTimezone = () => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const timezoneOffset = getTimezoneOffset();
    return new Date(utc + (timezoneOffset * 3600000));
  };

  // Get timezone offset in hours
  const getTimezoneOffset = () => {
    const timezoneOption = TIMEZONE_OPTIONS.find(tz => tz.value === timezone);
    return timezoneOption?.offset || -3; // Default to GMT-3
  };

  const value: TimezoneContextType = {
    timezone,
    setTimezone,
    formatDateWithTimezone,
    getCurrentDateInTimezone,
    getTimezoneOffset
  };

  return (
    <TimezoneContext.Provider value={value}>
      {children}
    </TimezoneContext.Provider>
  );
}

export function useTimezone() {
  const context = useContext(TimezoneContext);
  if (context === undefined) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
}

export { TIMEZONE_OPTIONS };
export type { TimezoneContextType }; 