'use client'
import { useState, useEffect, useRef, useCallback } from 'react';

import { useDragDrop } from './contexts/DragDropContext';
import SortableClientCard from './components/SortableClientCard';
import ClientCard from './components/ClientCard';
import ClientListView from './components/ClientListView';
import ClientDetailModal from './components/ClientDetailModal';
import ClientViewModeToggle, { ViewMode } from './components/ClientViewModeToggle';
import FilterBar, { SLAFilter } from './components/FilterBar';
import AddClientModal from './components/AddClientModal';
import { ClientCardsGridSkeleton } from './components/SkeletonLoaders';
import { Client, TaskStatus, TaskPriority } from '@/types/types';
import { api } from '@/services/api';
import { useDarkMode, useClients } from './layout';
import { getCurrentDateForInput, getDefaultSLADate } from '@/utils/dateUtils';
import { getSLAStatus } from '@/utils/slaUtils';
import { useToast } from './hooks/useToast';
import ScrollToTop from './components/ScrollToTop';
import VirtualizedClientGrid from './components/VirtualizedClientGrid';
import { useContainerHeight } from './hooks/useContainerHeight';


export default function Home() {
  // Use contexts
  const { darkMode } = useDarkMode();
  const { clients, refreshClients, isLoading } = useClients();
  const { pinnedClients, reorderClients } = useDragDrop();
  
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [orderedClients, setOrderedClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [taskFilter, setTaskFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all' | 'active'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [slaFilter, setSlaFilter] = useState<SLAFilter>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState({
    start: '',
    end: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('compact');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Create a wrapper for refreshClients that also updates selectedClient
  const refreshClientsAndModal = useCallback(async () => {
    await refreshClients();
    
    // Update selectedClient if it exists by fetching fresh data from server
    if (selectedClient) {
      try {
        const updatedClient = await api.getClient(selectedClient.id);
        if (updatedClient) {
          setSelectedClient(updatedClient);
        }
      } catch (error) {
        console.error('Error fetching updated client:', error);
        // Fallback: try to find in the updated clients list
        const fallbackClient = clients.find(c => c.id === selectedClient.id);
        if (fallbackClient) {
          setSelectedClient(fallbackClient);
        }
      }
    }
  }, [refreshClients, selectedClient, clients]);

  const [useInfinityPool, setUseInfinityPool] = useState(true); // Always start with true for SSR
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('useInfinityPool');
    if (saved !== null) {
      setUseInfinityPool(JSON.parse(saved));
    }
  }, []);

  // Save Infinity Pool preference
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('useInfinityPool', JSON.stringify(useInfinityPool));
    }
  }, [useInfinityPool, isClient]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const containerHeight = useContainerHeight(280, 600); // 280px offset for headers, 600px minimum



  // Separate pinned and unpinned clients, then apply ordering
  const separateAndOrderClients = useCallback((clientsList: Client[]) => {
    const pinned = clientsList.filter(client => pinnedClients.includes(client.id));
    const unpinned = clientsList.filter(client => !pinnedClients.includes(client.id));
    
    // Sort pinned clients by their order in pinnedClients array
    const orderedPinned = pinnedClients
      .map(id => pinned.find(client => client.id === id))
      .filter(Boolean) as Client[];
    
    return [...orderedPinned, ...unpinned];
  }, [pinnedClients]);

  // Update ordered clients when clients or pinned clients change
  useEffect(() => {
    const ordered = separateAndOrderClients(clients);
    setOrderedClients(ordered);
  }, [clients, separateAndOrderClients]);

  // Existing file upload handler
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

          let successCount = 0;
          let errorCount = 0;
          const errors: string[] = [];
          const skippedClients: string[] = [];

          console.log(`Starting import of ${jsonData.length} clients...`);

          // Import each client
          for (const clientData of jsonData) {
            try {
              // Validate required client fields
              if (!clientData.name || !clientData.company || !clientData.origin) {
                throw new Error(`Missing required fields (name, company, origin) for client: ${clientData.name || clientData.id || 'Unknown'}`);
              }

              // Generate ID if not provided
              if (!clientData.id) {
                clientData.id = `CL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              }

              // Check if client already exists
              try {
                await api.getClient(clientData.id);
                // If we get here, client exists, so skip it
                skippedClients.push(`${clientData.name} (${clientData.id}) - already exists`);
                continue;
              } catch (error) {
                // Client doesn't exist, continue with creation
              }

              // Validate tasks array
              const tasks = Array.isArray(clientData.tasks) ? clientData.tasks : [];

              // Validate and clean each task
              const validTasks = tasks.filter((task: any, index: number) => {
                if (!task.description || !task.date || !task.status || !task.priority) {
                  console.warn(`Skipping invalid task ${index + 1} for client ${clientData.name}:`, task);
                  return false;
                }
                
                // Validate status and priority values
                const validStatuses = ['pending', 'in progress', 'completed', 'awaiting client'];
                const validPriorities = ['low', 'medium', 'high'];
                
                if (!validStatuses.includes(task.status)) {
                  console.warn(`Invalid status "${task.status}" for task, setting to "pending"`);
                  task.status = 'pending';
                }
                
                if (!validPriorities.includes(task.priority)) {
                  console.warn(`Invalid priority "${task.priority}" for task, setting to "medium"`);
                  task.priority = 'medium';
                }
                
                return true;
              });

              if (validTasks.length === 0) {
                // Create a default task if no valid tasks exist
                validTasks.push({
                  date: getCurrentDateForInput(),
                  description: 'Initial task',
                  status: 'pending',
                  priority: 'medium',
                  sla_date: getDefaultSLADate()
                });
              }

              console.log(`Importing client: ${clientData.name} with ${validTasks.length} tasks`);

              // Use the createClientWithTasks API
              await api.createClientWithTasks(
                {
                  id: clientData.id,
                  name: clientData.name,
                  company: clientData.company,
                  origin: clientData.origin,
                },
                validTasks
              );

              successCount++;
              console.log(`✓ Successfully imported: ${clientData.name}`);
            } catch (error) {
              errorCount++;
              const errorMsg = `${clientData.name || clientData.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
              console.error(`✗ Failed to import client ${clientData.name || clientData.id}:`, error);
              errors.push(errorMsg);
            }
          }

          await refreshClients();
          
          // Prepare result message
          let message = '';
          if (successCount > 0) {
            message += `Successfully imported ${successCount} clients!`;
          }
          if (skippedClients.length > 0) {
            message += `\n\nSkipped ${skippedClients.length} existing clients:\n${skippedClients.slice(0, 5).join('\n')}${skippedClients.length > 5 ? `\n... and ${skippedClients.length - 5} more` : ''}`;
          }
          if (errorCount > 0) {
            message += `\n\n${errorCount} failed to import:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n... and ${errors.length - 5} more` : ''}`;
          }

          if (successCount > 0) {
            toast.success('Import Successful', `Successfully imported ${successCount} clients!`);
          } else {
            toast.info('Import Complete', 'Import completed with no changes.');
          }
          
          if (errorCount > 0) {
            toast.warning('Import Warnings', `${errorCount} clients failed to import. Check console for details.`);
          }
        } catch (error) {
          console.error('Error processing JSON:', error);
          toast.error('Import Failed', error instanceof Error ? error.message : 'Failed to process JSON file');
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
        toast.error('File Error', 'Error reading file');
      };

      reader.readAsText(file);
    } catch (error) {
      setIsImporting(false);
      toast.error('Processing Error', 'Error processing file');
    }
  };

  // Filter clients based on all filter criteria
  useEffect(() => {
    let result = [...orderedClients];

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
          return true;
        })
      );
    }

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(client =>
        client.name.toLowerCase().includes(searchLower) ||
        client.company.toLowerCase().includes(searchLower) ||
        client.origin.toLowerCase().includes(searchLower) ||
        client.id.toLowerCase().includes(searchLower)
      );
    }

    // Task description filter
    if (taskFilter.trim()) {
      const taskLower = taskFilter.toLowerCase();
      result = result.filter(client =>
        client.tasks.some(task =>
          task.description.toLowerCase().includes(taskLower)
        )
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(client =>
        client.tasks.some(task => {
          if (statusFilter === 'active') {
            return task.status === 'in progress' || task.status === 'pending';
          }
          return task.status === statusFilter;
        })
      );
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(client =>
        client.tasks.some(task => task.priority === priorityFilter)
      );
    }

    // SLA filter
    if (slaFilter !== 'all') {
      result = result.filter(client =>
        client.tasks.some(task => {
          const slaStatus = getSLAStatus(task);
          
          switch (slaFilter) {
            case 'overdue':
              return slaStatus === 'overdue';
            case 'due_today':
              return slaStatus === 'due_today';
            case 'due_this_week':
              return slaStatus === 'due_this_week';
            case 'on_track':
              return slaStatus === 'on_track';
            case 'no_sla':
              return slaStatus === 'no_sla';
            default:
              return true;
          }
        })
      );
    }

    setFilteredClients(result);
  }, [orderedClients, searchTerm, taskFilter, statusFilter, priorityFilter, slaFilter, dateRangeFilter]);

  // Calculate statistics
  const totalTasks = clients.reduce((sum, client) => sum + client.tasks.length, 0);
  const completedTasks = clients.reduce((sum, client) => 
    sum + client.tasks.filter(task => task.status === 'completed').length, 0
  );
  const inProgressTasks = clients.reduce((sum, client) => 
    sum + client.tasks.filter(task => task.status === 'in progress').length, 0
  );
  const pendingTasks = clients.reduce((sum, client) => 
    sum + client.tasks.filter(task => task.status === 'pending').length, 0
  );

  const handleExportJson = async () => {
    try {
      const data = await api.getClients();
      const jsonString = JSON.stringify(data, null, 2);
      
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `task-dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    }
  };

  const clearDateFilter = () => {
    setDateRangeFilter({ start: '', end: '' });
  };



  if (isLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Task Dashboard</h1>
          </div>
          <div className="mb-6">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
            </div>
          </div>
          <ClientCardsGridSkeleton count={6} />
        </div>
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
    <div className={`min-h-screen ${darkMode ? 'bg-black text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Simplified Header - removed Analytics button */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Task Dashboard</h1>
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
            slaFilter={slaFilter}
            setSlaFilter={setSlaFilter}
          />
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6">
          <div className="flex-1 flex flex-wrap gap-2">
            {viewMode === 'compact' && (
              <>
                <button
                  onClick={() => {
                    const allExpanded: Record<string, boolean> = {};
                    clients.forEach(client => {
                      allExpanded[client.id] = true;
                    });
                    setExpandedCards(allExpanded);
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  <span className="hidden sm:inline">Open All Cards</span>
                  <span className="sm:hidden">Open All</span>
                </button>
                <button
                  onClick={() => setExpandedCards({})}
                  className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  <span className="hidden sm:inline">Collapse All</span>
                  <span className="sm:hidden">Close All</span>
                </button>
              </>
            )}
            {(dateRangeFilter.start || dateRangeFilter.end) && (
              <button
                onClick={clearDateFilter}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                <span className="hidden sm:inline">Clear Date Filter</span>
                <span className="sm:hidden">Clear Date</span>
              </button>
            )}
          </div>
          
          <div className="flex items-center justify-center sm:justify-end space-x-2 sm:space-x-4">
            <ClientViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              darkMode={darkMode}
            />
            
            {viewMode === 'compact' && isClient && (
              <button
                onClick={() => setUseInfinityPool(!useInfinityPool)}
                className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                  useInfinityPool
                    ? darkMode 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                    : darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title={useInfinityPool ? 'Switch to Traditional Grid' : 'Switch to Infinity Pool'}
              >
                <span className="hidden sm:inline">
                  {useInfinityPool ? '♾️ Pool' : '📊 Grid'}
                </span>
                <span className="sm:hidden">
                  {useInfinityPool ? '♾️' : '📊'}
                </span>
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
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
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
                darkMode 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-green-500 hover:bg-green-600'
              } text-white disabled:opacity-50`}
            >
              <span className="hidden sm:inline">{isImporting ? 'Importing...' : 'Import JSON'}</span>
              <span className="sm:hidden">{isImporting ? 'Import...' : '📥'}</span>
            </button>
            <button
              onClick={handleExportJson}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
                darkMode 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-purple-500 hover:bg-purple-600'
              } text-white`}
            >
              <span className="hidden sm:inline">Export JSON</span>
              <span className="sm:hidden">📤</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
            >
              <span className="hidden sm:inline">Add New Client</span>
              <span className="sm:hidden">➕</span>
            </button>
          </div>
        </div>

        {/* Statistics Section */}
        <div className={`mb-8 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button 
              onClick={() => {
                setStatusFilter('all');
                setPriorityFilter('all');
                setTaskFilter('');
                clearDateFilter();
              }}
              className={`p-4 rounded-lg text-left transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-100 hover:bg-blue-200'}`}
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
              className={`p-4 rounded-lg text-left transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-orange-100 hover:bg-orange-200'}`}
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
              className={`p-4 rounded-lg text-left transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-yellow-100 hover:bg-yellow-200'}`}
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
              className={`p-4 rounded-lg text-left transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-green-100 hover:bg-green-200'}`}
            >
              <h3 className="font-semibold">Completed</h3>
              <p className="text-2xl">{completedTasks}</p>
            </button>
          </div>
        </div>



        {/* Render different view modes */}
        {viewMode === 'list' ? (
          <ClientListView
            clients={filteredClients}
            onClientClick={(client) => {
              setSelectedClient(client);
              setIsDetailModalOpen(true);
            }}
            darkMode={darkMode}
          />
        ) : (isClient && useInfinityPool) ? (
          <VirtualizedClientGrid
            clients={filteredClients}
            expandedCards={expandedCards}
            onToggleExpand={(clientId) => setExpandedCards(prev => ({
              ...prev,
              [clientId]: !prev[clientId]
            }))}
            onUpdate={refreshClientsAndModal}
            onDeleteTask={async (clientId, taskIndex) => {
              await refreshClientsAndModal();
            }}
            onShowDetails={(client) => {
              setSelectedClient(client);
              setIsDetailModalOpen(true);
            }}
            darkMode={darkMode}
            containerHeight={containerHeight}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {filteredClients.map(client => (
              <SortableClientCard
                key={client.id}
                client={client}
                isExpanded={expandedCards[client.id] || false}
                onToggleExpand={() => setExpandedCards(prev => ({
                  ...prev,
                  [client.id]: !prev[client.id]
                }))}
                onUpdate={refreshClients}
                onDeleteTask={async (clientId, taskIndex) => {
                  await refreshClients();
                }}
                onShowDetails={(client) => {
                  setSelectedClient(client);
                  setIsDetailModalOpen(true);
                }}
                darkMode={darkMode}
                isPinned={pinnedClients.includes(client.id)}
                disableDrag={true}
              />
            ))}
          </div>
        )}

        {filteredClients.length === 0 && !isLoading && (
          <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {clients.length === 0 ? (
              <div>
                <p className="text-xl mb-4">No clients found</p>
                <p>Add a new client to get started!</p>
              </div>
            ) : (
              <div>
                <p className="text-xl mb-4">No clients match your current filters</p>
                <p>Try adjusting your search criteria or clearing the filters.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <AddClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddClient={async () => {
          await refreshClients();
          setIsModalOpen(false);
        }}
        darkMode={darkMode}
      />

              {selectedClient && (
          <ClientDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            client={selectedClient}
            onUpdate={refreshClientsAndModal}
            darkMode={darkMode}
          />
        )}

      {/* Scroll to Top Button */}
      <ScrollToTop darkMode={darkMode} />
    </div>
  );
}