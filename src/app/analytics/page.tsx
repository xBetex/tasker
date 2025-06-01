'use client'

import { useState, useEffect } from 'react';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { Client } from '@/types/types';
import { api } from '@/services/api';
import { useDarkMode } from '../layout';

export default function AnalyticsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [analyticsDateRange, setAnalyticsDateRange] = useState<{
    start?: Date;
    end?: Date;
  }>({});

  // Use dark mode from layout context
  const { darkMode } = useDarkMode();

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
        {/* Simplified Header - removed "Back to Dashboard" button */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
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