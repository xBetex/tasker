'use client'

import { useState, useEffect } from 'react';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { Client } from '@/types/types';
import { api } from '@/services/api';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [analyticsDateRange, setAnalyticsDateRange] = useState<{
    start?: Date;
    end?: Date;
  }>({});

  const fetchClients = async () => {
    try {
      const data = await api.getClients();
      setClients(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch clients');
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Link 
              href="/"
              className={`px-4 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </div>

        <AnalyticsDashboard
          clients={clients}
          startDate={analyticsDateRange.start}
          endDate={analyticsDateRange.end}
          selectedClients={selectedClients}
          onDateRangeChange={(start, end) => setAnalyticsDateRange({ start, end })}
          onClientSelect={setSelectedClients}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
} 