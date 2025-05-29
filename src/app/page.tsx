'use client'
import { useState, useEffect, useRef } from 'react';
import ClientCard from './components/ClientCard';
import FilterBar from './components/FilterBar';
import AddClientModal from './components/AddClientModal';
import { Client, TaskStatus, TaskPriority } from '@/types/types';

// Define sample data outside the component
const sampleData: Client[] = [
  {
    id: "CL-001",
    name: "John Smith",
    company: "Acme Corporation",
    origin: "Referral",
    tasks: [
      {
        date: "2025-04-19",
        description: "Review contract terms",
        status: "completed",
        priority: "high"
      },
      {
        date: "2025-04-20",
        description: "Send proposal",
        status: "in progress",
        priority: "medium"
      }
    ]
  }
];

export default function Dashboard() {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [clients, setClients] = useState<Client[]>([]);
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Load data from localStorage or fallback
  useEffect(() => {
    const loadData = async () => {
      try {
        const localData = localStorage.getItem('clientsData');
        if (localData) {
          setClients(JSON.parse(localData));
          return;
        }

        const response = await fetch('/clients.json');
        if (response.ok) {
          const jsonData = await response.json();
          setClients(jsonData);
          return;
        }
      } catch {
        console.log("Automatic load failed, using sample data");
      }

      setClients(sampleData);
    };

    loadData();
  }, []);

  // Save to localStorage on any change
  useEffect(() => {
    localStorage.setItem('clientsData', JSON.stringify(clients));
  }, [clients]);

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

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        if (Array.isArray(jsonData)) {
          setClients(jsonData);
        } else {
          alert("Invalid data format. Please import a valid JSON file.");
        }
      } catch {
        alert("Error parsing JSON file. Please check the file format.");
      }
    };
    reader.readAsText(file);
  };

  const handleAddClient = (newClient: Client) => {
    const nameExists = clients.some(client => 
      client.name.toLowerCase() === newClient.name.toLowerCase()
    );

    if (nameExists) {
      alert('A client with this name already exists!');
      return;
    }

    setClients(prevClients => [...prevClients, newClient]);
    setIsModalOpen(false);
  };

  const totalTasks = clients.reduce((acc, client) => acc + client.tasks.length, 0);
  const inProgressTasks = clients.reduce((acc, client) => 
    acc + client.tasks.filter(task => task.status === 'in progress').length, 0);
  const pendingTasks = clients.reduce((acc, client) => 
    acc + client.tasks.filter(task => task.status === 'pending').length, 0);
  const completedTasks = clients.reduce((acc, client) => 
    acc + client.tasks.filter(task => task.status === 'completed').length, 0);

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(clients.map(client => 
      client.id === updatedClient.id ? updatedClient : client
    ));
  };

  const handleDeleteTask = (clientId: string, taskIndex: number) => {
    setClients(clients.map(client => {
      if (client.id === clientId) {
        const updatedTasks = [...client.tasks];
        updatedTasks.splice(taskIndex, 1);
        return { ...client, tasks: updatedTasks };
      }
      return client;
    }));
  };

  const handleSaveAllToJson = () => {
    const json = JSON.stringify(clients, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all_clients_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    const confirmReset = window.confirm('Are you sure you want to reset all data? This action cannot be undone.');
    if (confirmReset) {
      localStorage.removeItem('clientsData');
      setClients(sampleData);
      setDateRangeFilter({ start: '', end: '' });
      setSearchTerm('');
      setTaskFilter('');
      setStatusFilter('all');
      setPriorityFilter('all');
    }
  };

  const clearDateFilter = () => {
    setDateRangeFilter({ start: '', end: '' });
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Task Dashboard</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </div>

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
                onClick={clearDateFilter}
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
              onChange={handleFileImport}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={triggerFileInput}
              className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
            >
              Import JSON
            </button>
            <button
              onClick={handleSaveAllToJson}
              className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white`}
            >
              Export JSON
            </button>
            <button
              onClick={handleResetData}
              className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white`}
              >
              Reset Data
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
            >
              Add New Client
            </button>
          </div>
        </div>

        <div className={`mb-8 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button 
              onClick={() => {
                setStatusFilter('all');
                setPriorityFilter('all');
                setTaskFilter('');
                clearDateFilter();
              }}
              className={`p-4 rounded-lg text-left ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-100 hover:bg-blue-200'}`}
            >
              <h3 className="font-semibold">Total Tasks</h3>
              <p className="text-2xl">{totalTasks}</p>
            </button>
            <button 
              onClick={() => {
                setStatusFilter('active');
                setPriorityFilter('all');
                setTaskFilter('');
              }}
              className={`p-4 rounded-lg text-left ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-orange-100 hover:bg-orange-200'}`}
            >
              <h3 className="font-semibold">Active Tasks</h3>
              <p className="text-2xl">{inProgressTasks + pendingTasks}</p>
            </button>
            <button 
              onClick={() => {
                setStatusFilter('in progress');
                setPriorityFilter('all');
                setTaskFilter('');
              }}
              className={`p-4 rounded-lg text-left ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-yellow-100 hover:bg-yellow-200'}`}
            >
              <h3 className="font-semibold">In Progress</h3>
              <p className="text-2xl">{inProgressTasks}</p>
            </button>
            <button 
              onClick={() => {
                setStatusFilter('completed');
                setPriorityFilter('all');
                setTaskFilter('');
              }}
              className={`p-4 rounded-lg text-left ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-green-100 hover:bg-green-200'}`}
            >
              <h3 className="font-semibold">Completed</h3>
              <p className="text-2xl">{completedTasks}</p>
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
              onUpdate={handleUpdateClient}
              onDeleteTask={handleDeleteTask}
              darkMode={darkMode}
            />
          ))}
        </div>
      </div>

      <AddClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddClient={handleAddClient}
        darkMode={darkMode}
      />
    </div>
  );
}