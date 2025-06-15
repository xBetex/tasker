'use client'
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDashboard } from './hooks/useDashboard';
import { useContainerHeight } from './hooks/useContainerHeight';

// Components
import AuthGuard from './components/auth/AuthGuard';
import DashboardHeader from './components/dashboard/DashboardHeader';
import DashboardStats from './components/dashboard/DashboardStats';
import DashboardActions from './components/dashboard/DashboardActions';
import FilterBar from './components/FilterBar';
import ClientListView from './components/ClientListView';
import VirtualizedClientGrid from './components/VirtualizedClientGrid';
import SortableClientCard from './components/SortableClientCard';
import AddClientModal from './components/AddClientModal';
import ClientDetailModal from './components/ClientDetailModal';
import ScrollToTop from './components/ScrollToTop';
import ScrollToBottom from './components/ScrollToBottom';
import { ClientCardsGridSkeleton } from './components/SkeletonLoaders';

import { api } from '@/services/api';
import { getCurrentDateForInput, getDefaultSLADate } from '@/utils/dateUtils';

export default function Home() {
  const dashboard = useDashboard();
  const containerHeight = useContainerHeight(280, 600);
  const searchParams = useSearchParams();

  // Handle highlight from URL parameters (from Global Comments Search and SLA Alerts)
  const [highlightTaskId, setHighlightTaskId] = useState<number | null>(null);
  const [pendingHighlight, setPendingHighlight] = useState<string | null>(null);
  
  // Check for highlight parameter whenever URL changes
  useEffect(() => {
    const highlight = searchParams.get('highlight');
    
    if (highlight && highlight.includes('-')) {
      setPendingHighlight(highlight);
      // Clean the URL immediately
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  // Process highlight when clients are loaded
  useEffect(() => {
    if (pendingHighlight && dashboard.clients.length > 0 && !dashboard.isLoading) {
      const [clientId, taskIdStr] = pendingHighlight.split('-');
      const taskId = parseInt(taskIdStr);
      
      console.log('Processing highlight:', { clientId, taskId, pendingHighlight });
      console.log('Available clients:', dashboard.clients.map(c => ({ id: c.id, name: c.name, taskCount: c.tasks.length })));
      
      // Find the client
      const client = dashboard.clients.find(c => c.id === clientId);
      if (client) {
        console.log('Found client:', client.name, 'with tasks:', client.tasks.map(t => ({ id: t.id, description: t.description })));
        
        // Check if the task exists in the client
        const task = client.tasks.find(t => t.id === taskId);
        if (task) {
          console.log('Found task:', task.description);
          
          // Expand the client card
          dashboard.setExpandedCards(prev => ({
            ...prev,
            [clientId]: true
          }));
          
          // Set the highlight task ID
          setHighlightTaskId(taskId);
          
          // Open the client detail modal
          dashboard.setSelectedClient(client);
          dashboard.setIsDetailModalOpen(true);
          
          dashboard.toast.success('Task Located', `Found task "${task.description}" for ${client.name}`);
        } else {
          console.log('Task not found in client');
          dashboard.toast.error('Task Not Found', `Task #${taskId} not found in ${client.name}`);
        }
      } else {
        console.log('Client not found, looking for ID:', clientId);
        dashboard.toast.error('Client Not Found', 'Could not locate the specified client');
      }
      
      // Clear pending highlight
      setPendingHighlight(null);
    }
  }, [dashboard.clients, dashboard.isLoading, pendingHighlight, dashboard.setExpandedCards, dashboard.setSelectedClient, dashboard.setIsDetailModalOpen, dashboard.toast]);

  // Import/Export handlers
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      dashboard.setIsImporting(true);
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          
          if (!Array.isArray(jsonData)) {
            throw new Error('Invalid JSON format. Expected an array of clients.');
          }

          let successCount = 0;
          let errorCount = 0;

          for (const clientData of jsonData) {
            try {
              if (!clientData.name || !clientData.company || !clientData.origin) {
                throw new Error(`Missing required fields for client: ${clientData.name || 'Unknown'}`);
              }

              if (!clientData.id) {
                clientData.id = `CL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              }

              // Check if client already exists
              try {
                await api.getClient(clientData.id);
                continue; // Skip existing clients
              } catch (error) {
                // Client doesn't exist, continue with creation
              }

              // Validate and clean tasks
              const tasks = Array.isArray(clientData.tasks) ? clientData.tasks : [];
              const validTasks = tasks.filter((task: any) => {
                if (!task.description || !task.date || !task.status || !task.priority) {
                  return false;
                }
                
                const validStatuses = ['pending', 'in progress', 'completed', 'awaiting client'];
                const validPriorities = ['low', 'medium', 'high'];
                
                if (!validStatuses.includes(task.status)) task.status = 'pending';
                if (!validPriorities.includes(task.priority)) task.priority = 'medium';
                
                return true;
              });

              if (validTasks.length === 0) {
                validTasks.push({
                  date: getCurrentDateForInput(),
                  description: 'Initial task',
                  status: 'pending',
                  priority: 'medium',
                  sla_date: getDefaultSLADate(),
                  comments: []
                });
              }

              clientData.tasks = validTasks;
              await api.createClient(clientData);
              successCount++;

            } catch (error: any) {
              console.error(`Error importing client ${clientData.name}:`, error);
              errorCount++;
            }
          }

          dashboard.toast.success(
            `Import completed! ✅ ${successCount} clients imported, ❌ ${errorCount} failed`
          );
          
          await dashboard.refreshClients();

        } catch (error: any) {
          dashboard.toast.error(`Import failed: ${error.message}`);
        }
      };

      reader.readAsText(file);
    } catch (error: any) {
      dashboard.toast.error(`Import failed: ${error.message}`);
    } finally {
      dashboard.setIsImporting(false);
      event.target.value = '';
    }
  };

  const handleExportJson = async () => {
    try {
      const allClients = await api.getClients();
      const dataStr = JSON.stringify(allClients, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `task-dashboard-export-${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      dashboard.toast.success('Data exported successfully!');
    } catch (error) {
      dashboard.toast.error('Failed to export data');
    }
  };

  // Action handlers
  const handleExpandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    dashboard.clients.forEach(client => {
      allExpanded[client.id] = true;
    });
    dashboard.setExpandedCards(allExpanded);
  };

  const handleCollapseAll = () => {
    dashboard.setExpandedCards({});
  };

  const handleStatusFilterClick = (status: any) => {
    // Additive filtering - apply status filter on top of existing filters
    dashboard.setStatusFilter(status);
  };

  const clearDateFilter = () => {
    dashboard.setDateRangeFilter({ start: '', end: '' });
  };

  const handleNavigateToTask = (taskId: number, clientId: string) => {
    // Find the client
    const client = dashboard.clients.find(c => c.id === clientId);
    if (client) {
      // Set the selected client and open the detail modal
      dashboard.setSelectedClient(client);
      dashboard.setIsDetailModalOpen(true);
      
      // Optional: You could add logic here to scroll to the specific task
      // or highlight it in the modal
      dashboard.toast.success('Opening Task Details', `Navigating to task in ${client.name}`);
    } else {
      dashboard.toast.error('Client Not Found', 'Could not find the client for this task');
    }
  };

  // Loading state
  if (dashboard.isLoading) {
    return (
      <div className={`min-h-screen ${dashboard.darkMode ? 'bg-black text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
        <div className="container mx-auto px-4 py-8">
          <DashboardHeader darkMode={dashboard.darkMode} />
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

  // Error state
  if (dashboard.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">{dashboard.error}</div>
      </div>
    );
  }

  return (
    <AuthGuard darkMode={dashboard.darkMode}>
      <div className={`min-h-screen ${dashboard.darkMode ? 'bg-black text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
        <div className="container mx-auto px-4 py-8">
        <DashboardHeader darkMode={dashboard.darkMode} />

        <div className="mb-6">
          <FilterBar 
            searchTerm={dashboard.searchTerm}
            setSearchTerm={dashboard.setSearchTerm}
            statusFilter={dashboard.statusFilter}
            setStatusFilter={dashboard.setStatusFilter}
            priorityFilter={dashboard.priorityFilter}
            setPriorityFilter={dashboard.setPriorityFilter}
            taskFilter={dashboard.taskFilter}
            setTaskFilter={dashboard.setTaskFilter}
            dateRangeFilter={dashboard.dateRangeFilter}
            setDateRangeFilter={dashboard.setDateRangeFilter}
            darkMode={dashboard.darkMode}
            slaFilter={dashboard.slaFilter}
            setSlaFilter={dashboard.setSlaFilter}
          />
        </div>

        <DashboardActions
          viewMode={dashboard.viewMode}
          onViewModeChange={dashboard.setViewMode}
          useInfinityPool={dashboard.useInfinityPool}
          onToggleInfinityPool={() => {}}
          isClient={dashboard.isClient}
          darkMode={dashboard.darkMode}
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          onClearDateFilter={clearDateFilter}
          hasDateFilter={!!dashboard.dateRangeFilter.start || !!dashboard.dateRangeFilter.end}
          onImportJSON={handleFileUpload}
          onExportJSON={handleExportJson}
          isImporting={dashboard.isImporting}
          onAddClient={() => dashboard.setIsModalOpen(true)}
        />

        <DashboardStats
          activeTasks={dashboard.activeTasks}
          completedTasks={dashboard.completedTasks}
          inProgressTasks={dashboard.inProgressTasks}
          pendingTasks={dashboard.pendingTasks}
          awaitingClientTasks={dashboard.awaitingClientTasks}
          darkMode={dashboard.darkMode}
          onStatusFilterClick={handleStatusFilterClick}
          onResetFilters={() => {
            dashboard.setStatusFilter('all');
            dashboard.setPriorityFilter('all');
            dashboard.setTaskFilter('');
            dashboard.setSearchTerm('');
            dashboard.setSlaFilter('all');
            dashboard.setDateRangeFilter({ start: '', end: '' });
          }}
          hasActiveFilters={
            dashboard.searchTerm !== '' || 
            dashboard.taskFilter !== '' || 
            dashboard.statusFilter !== 'all' || 
            dashboard.priorityFilter !== 'all' || 
            dashboard.slaFilter !== 'all' || 
            dashboard.dateRangeFilter.start !== '' || 
            dashboard.dateRangeFilter.end !== ''
          }
          filteredClientsCount={dashboard.filteredClients.length}
          totalClientsCount={dashboard.clients.length}
          totalActiveTasks={dashboard.totalActiveTasks}
          totalCompletedTasks={dashboard.totalCompletedTasks}
          totalInProgressTasks={dashboard.totalInProgressTasks}
          totalPendingTasks={dashboard.totalPendingTasks}
          totalAwaitingClientTasks={dashboard.totalAwaitingClientTasks}
        />

        {/* Render different view modes */}
        {dashboard.viewMode === 'list' ? (
          <ClientListView
            clients={dashboard.filteredClients}
            onClientClick={(client) => {
              dashboard.setSelectedClient(client);
              dashboard.setIsDetailModalOpen(true);
            }}
            darkMode={dashboard.darkMode}
          />
        ) : (dashboard.isClient && dashboard.useInfinityPool) ? (
          <VirtualizedClientGrid
            clients={dashboard.filteredClients}
            expandedCards={dashboard.expandedCards}
            onToggleExpand={(clientId) => dashboard.setExpandedCards(prev => ({
              ...prev,
              [clientId]: !prev[clientId]
            }))}
            onUpdate={dashboard.refreshClientsAndModal}
            onDeleteTask={async (clientId, taskIndex) => {
              await dashboard.refreshClientsAndModal();
            }}
            onShowDetails={(client) => {
              dashboard.setSelectedClient(client);
              dashboard.setIsDetailModalOpen(true);
            }}
            onNavigateToTask={handleNavigateToTask}
            darkMode={dashboard.darkMode}
            containerHeight={containerHeight}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {dashboard.filteredClients.map(client => (
              <SortableClientCard
                key={client.id}
                client={client}
                isExpanded={dashboard.expandedCards[client.id] || false}
                onToggleExpand={() => dashboard.setExpandedCards(prev => ({
                  ...prev,
                  [client.id]: !prev[client.id]
                }))}
                onUpdate={dashboard.refreshClients}
                onDeleteTask={async (clientId, taskIndex) => {
                  await dashboard.refreshClients();
                }}
                onShowDetails={(client) => {
                  dashboard.setSelectedClient(client);
                  dashboard.setIsDetailModalOpen(true);
                }}
                onNavigateToTask={handleNavigateToTask}
                darkMode={dashboard.darkMode}
                isPinned={dashboard.pinnedClients.includes(client.id)}
                disableDrag={true}
              />
            ))}
          </div>
        )}

        {dashboard.filteredClients.length === 0 && !dashboard.isLoading && (
          <div className={`text-center py-12 ${dashboard.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {dashboard.clients.length === 0 ? (
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
        isOpen={dashboard.isModalOpen}
        onClose={() => dashboard.setIsModalOpen(false)}
        onAddClient={async () => {
          await dashboard.refreshClients();
          dashboard.setIsModalOpen(false);
        }}
        darkMode={dashboard.darkMode}
      />

      {dashboard.selectedClient && (
        <ClientDetailModal
          isOpen={dashboard.isDetailModalOpen}
          onClose={() => {
            dashboard.setIsDetailModalOpen(false);
            setHighlightTaskId(null); // Clear highlight when modal closes
          }}
          client={dashboard.selectedClient}
          onUpdate={dashboard.refreshClientsAndModal}
          darkMode={dashboard.darkMode}
          allClients={dashboard.filteredClients}
          onNavigateToClient={(client) => {
            dashboard.setSelectedClient(client);
          }}
          highlightTaskId={highlightTaskId}
        />
      )}

        <ScrollToTop darkMode={dashboard.darkMode} />
        <ScrollToBottom darkMode={dashboard.darkMode} />
      </div>
    </AuthGuard>
  );
}