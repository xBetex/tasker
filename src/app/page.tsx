'use client'
import { useState, useEffect, useRef } from 'react';
import ClientCard from './components/ClientCard';
import FilterBar from './components/FilterBar';
import AddClientModal from './components/AddClientModal';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { Client, TaskStatus, TaskPriority } from '@/types/types';
import { api } from '@/services/api';

export default function Home() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [taskFilter, setTaskFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all' | 'active'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState({
    start: '',
    end: ''
  });
  const [darkMode, setDarkMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [analyticsDateRange, setAnalyticsDateRange] = useState<{
    start?: Date;
    end?: Date;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImportData = async () => {
    try {
      setIsImporting(true);
      await api.importData();
      await fetchClients();
      alert('Data imported successfully!');
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Failed to import data. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          
          // Validate the JSON structure
          if (!Array.isArray(jsonData)) {
            throw new Error('Invalid JSON format. Expected an array of clients.');
          }

          // Import each client
          for (const clientData of jsonData) {
            try {
              await api.createClient(clientData);
            } catch (error) {
              console.error(`Failed to import client ${clientData.id}:`, error);
            }
          }

          await fetchClients();
          alert('Clients imported successfully!');
        } catch (error) {
          console.error('Error processing JSON:', error);
          alert(error instanceof Error ? error.message : 'Failed to process JSON file');
        } finally {
          setIsImporting(false);
          // Reset the file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };

      reader.onerror = () => {
        setIsImporting(false);
        alert('Error reading file');
      };

      reader.readAsText(file);
    } catch (error) {
      setIsImporting(false);
      alert('Error processing file');
    }
  };

  // Filter clients based on all filter criteria
  useEffect(() => {
    let result = [...clients];

    // Date range filter
    if (dateRangeFilter.start || dateRangeFilter.end) {
      result = result.filter(client => 
        client.tasks.some(task => {
          const taskDate = new Date(task.date);
          const startDate = dateRangeFilter.start ? new Date(dateRangeFilter.start) : null;
          const endDate = dateRangeFilter.end ? new Date(dateRangeFilter.end) : null;
          
          if (startDate && endDate) {
            return taskDate >= startDate && taskDate <= endDate;
          } else if (startDate) {
            return taskDate >= startDate;
          } else if (endDate) {
            return taskDate <= endDate;
          }
          return false;
        })
      );
    }

    // Search term filter
    if (searchTerm) {
      result = result.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Task description filter
    if (taskFilter) {
      result = result.filter(client =>
        client.tasks.some(task =>
          task.description.toLowerCase().includes(taskFilter.toLowerCase())
        )
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        result = result.filter(client => 
          client.tasks.some(task => 
            task.status === 'in progress' || task.status === 'pending'
          )
        );
      } else {
        result = result.filter(client => 
          client.tasks.some(task => task.status === statusFilter)
        );
      }
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(client => 
        client.tasks.some(task => task.priority === priorityFilter)
      );
    }

    setFilteredClients(result);
  }, [clients, searchTerm, statusFilter, priorityFilter, taskFilter, dateRangeFilter]);

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
          <h1 className="text-3xl font-bold">Task Dashboard</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`px-4 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-purple-500 hover:bg-purple-600'
              } text-white`}
            >
              {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </div>

        {showAnalytics && (
          <div className="mb-8">
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
        )}

        <div className="mb-6">
          <FilterBar 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            taskFilter={taskFilter}
            setTaskFilter={setTaskFilter}
            dateRangeFilter={dateRangeFilter}
            setDateRangeFilter={setDateRangeFilter}
            darkMode={darkMode}
          />
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 flex space-x-2">
            <button
              onClick={() => {
                const allExpanded: Record<string, boolean> = {};
                clients.forEach(client => {
                  allExpanded[client.id] = true;
                });
                setExpandedCards(allExpanded);
              }}
              className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              Open All Cards
            </button>
            <button
              onClick={() => setExpandedCards({})}
              className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              Collapse All
            </button>
            {(dateRangeFilter.start || dateRangeFilter.end) && (
              <button
                onClick={() => setDateRangeFilter({ start: '', end: '' })}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Clear Date Filter
              </button>
            )}
          </div>
          <div className="flex space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className={`px-4 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-green-500 hover:bg-green-600'
              } text-white disabled:opacity-50`}
            >
              {isImporting ? 'Importing...' : 'Import JSON'}
            </button>
            <button
              onClick={handleImportData}
              disabled={isImporting}
              className={`px-4 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-purple-500 hover:bg-purple-600'
              } text-white disabled:opacity-50`}
            >
              {isImporting ? 'Importing...' : 'Import Sample Data'}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
            >
              Add New Client
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              isExpanded={expandedCards[client.id] || false}
              onToggleExpand={() => setExpandedCards(prev => ({
                ...prev,
                [client.id]: !prev[client.id]
              }))}
              onUpdate={fetchClients}
              onDeleteTask={async (clientId, taskIndex) => {
                // Implement task deletion here when backend endpoint is ready
                await fetchClients();
              }}
              darkMode={darkMode}
            />
          ))}
        </div>
      </div>

      <AddClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddClient={async () => {
          await fetchClients();
          setIsModalOpen(false);
        }}
        darkMode={darkMode}
      />
    </div>
  );
}