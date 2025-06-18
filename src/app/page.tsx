'use client'
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDashboard } from './hooks/useDashboard';
import { useContainerHeight } from './hooks/useContainerHeight';
import { Client, Task } from '../types/types';
import { api } from '../services/api';
import { getSLAStatus } from '@/utils/slaUtils';

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
import GlobalCommentSearch from '@/components/GlobalCommentSearch';

import { getCurrentDateForInput, getDefaultSLADate } from '@/utils/dateUtils';

export default function Home() {
  const dashboard = useDashboard();
  const containerHeight = useContainerHeight(280, 600);
  const [showActiveExportPreview, setShowActiveExportPreview] = useState(false);
  const [activeExportText, setActiveExportText] = useState('');
  const searchParams = useSearchParams();

  // Handle highlight from URL parameters (from Global Comments Search and SLA Alerts)
  const [highlightTaskId, setHighlightTaskId] = useState<number | null>(null);
  const [pendingHighlight, setPendingHighlight] = useState<string | null>(null);
  const [focusClientId, setFocusClientId] = useState<string | null>(null);
  
  // Check for highlight parameter whenever URL changes
  useEffect(() => {
    const highlight = searchParams.get('highlight');
    const focus = searchParams.get('focus');
    
    if (highlight && highlight.includes('-')) {
      setPendingHighlight(highlight);
      // Clean the URL immediately
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (focus) {
      setFocusClientId(focus);
      // Clean the URL immediately
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  // Process highlight when clients are loaded
  useEffect(() => {
    if (pendingHighlight && dashboard.clients.length > 0 && !dashboard.isLoading) {
      const [clientId, taskIdStr] = pendingHighlight.split('-');
      const taskId = parseInt(taskIdStr);
      
      // Find the client
      const client = dashboard.clients.find(c => c.id === clientId);
      if (client) {
        // Check if the task exists in the client
        const task = client.tasks.find(t => t.id === taskId);
        if (task) {
          
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
          dashboard.toast.error('Task Not Found', `Task #${taskId} not found in ${client.name}`);
        }
      } else {
        dashboard.toast.error('Client Not Found', 'Could not locate the specified client');
      }
      
      // Clear pending highlight
      setPendingHighlight(null);
    }
  }, [dashboard.clients, dashboard.isLoading, pendingHighlight, dashboard.setExpandedCards, dashboard.setSelectedClient, dashboard.setIsDetailModalOpen, dashboard.toast]);

  // Handle client focus from URL parameter
  useEffect(() => {
    if (focusClientId && dashboard.clients.length > 0 && !dashboard.isLoading) {
      // Find the client
      const client = dashboard.clients.find(c => c.id === focusClientId);
      if (client) {
        // Expand the client card
        dashboard.setExpandedCards(prev => ({
          ...prev,
          [focusClientId]: true
        }));
        
        // Scroll to the client after a short delay
        setTimeout(() => {
          const clientElement = document.querySelector(`[data-client-id="${focusClientId}"]`);
          if (clientElement) {
            clientElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            
            // Add a temporary highlight effect
            clientElement.classList.add('highlight-flash');
            setTimeout(() => {
              clientElement.classList.remove('highlight-flash');
            }, 3000);
          }
        }, 500);
        
        dashboard.toast.success('Client Located', `Found ${client.name} (${client.company})`);
      } else {
        dashboard.toast.error('Client Not Found', 'Could not locate the specified client');
      }
      
      // Clear focus client ID
      setFocusClientId(null);
    }
  }, [dashboard.clients, dashboard.isLoading, focusClientId, dashboard.setExpandedCards, dashboard.toast]);

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
              } catch (_error) {
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

  const generateActiveTasksExportText = () => {
    // Get only active tasks from filtered clients currently displayed
    const activeTasksData = dashboard.filteredClients.map(client => {
      const activeTasks = client.tasks.filter(task => task.status !== 'completed');
      return {
        ...client,
        tasks: activeTasks
      };
    }).filter(client => client.tasks.length > 0); // Only include clients with active tasks

    if (activeTasksData.length === 0) {
      return 'No active tasks available to export';
    }

    let exportText = `ACTIVE TASKS EXPORT\n`;
    exportText += `Export Date: ${new Date().toLocaleDateString()}\n`;
    exportText += `Export Time: ${new Date().toLocaleTimeString()}\n`;
    exportText += `Total Clients with Active Tasks: ${activeTasksData.length}\n`;
    exportText += `Total Active Tasks: ${activeTasksData.reduce((sum, client) => sum + client.tasks.length, 0)}\n`;
    exportText += `${'='.repeat(80)}\n\n`;

    activeTasksData.forEach((client, clientIndex) => {
      exportText += `CLIENT ${clientIndex + 1}/${activeTasksData.length}\n`;
      exportText += `Name: ${client.name}\n`;
      exportText += `Company: ${client.company}\n`;
      exportText += `ID: ${client.id}\n`;
      exportText += `Origin: ${client.origin}\n`;
      exportText += `Active Tasks: ${client.tasks.length}\n`;
      exportText += `${'-'.repeat(60)}\n\n`;

      client.tasks.forEach((task: Task, taskIndex: number) => {
        exportText += `  TASK ${taskIndex + 1}/${client.tasks.length}\n`;
        exportText += `  ${task.description}\n`;
        exportText += `  📅 Date: ${task.date}`;
        if (task.sla_date) {
          exportText += ` • ⏰ SLA: ${task.sla_date}`;
        }
        exportText += `\n`;
        exportText += `  📊 Status: ${task.status} • 🎯 Priority: ${task.priority}\n`;
        
        if (task.comments && task.comments.length > 0) {
          exportText += `  💬 Comments (${task.comments.length}):\n`;
          task.comments.forEach((comment: any) => {
            exportText += `    • ${comment.text}\n`;
          });
        } else {
          exportText += `  💬 Comments: None\n`;
        }
        
        exportText += `\n`;
      });
      
      exportText += `${'-'.repeat(60)}\n\n`;
    });

    return exportText;
  };

  const handleViewActiveExport = () => {
    const text = generateActiveTasksExportText();
    setActiveExportText(text);
    setShowActiveExportPreview(true);
  };

  const handleExportActiveTasks = async () => {
    try {
      const exportText = generateActiveTasksExportText();

      // Copy to clipboard
      await navigator.clipboard.writeText(exportText);
      
      // Calculate totals for success message
      const activeTasksData = dashboard.filteredClients.map(client => {
        const activeTasks = client.tasks.filter(task => task.status !== 'completed');
        return {
          ...client,
          tasks: activeTasks
        };
      }).filter(client => client.tasks.length > 0);
      
      const totalActiveTasks = activeTasksData.reduce((sum, client) => sum + client.tasks.length, 0);
      
      dashboard.toast.success(
        'Active Tasks Exported!', 
        `Successfully exported ${totalActiveTasks} active tasks from ${activeTasksData.length} clients to clipboard`
      );

    } catch (error) {
      console.error('Export error:', error);
      dashboard.toast.error('Export Failed', 'Failed to export active tasks to clipboard');
    }
  };

  const generateFilteredActiveTasksExportText = () => {
    // Get all tasks from filtered clients and apply all filters
    let filteredTasks = dashboard.filteredClients.flatMap(client => 
      client.tasks.map(task => ({ ...task, client }))
    );

    // Apply task-level filters
    if (dashboard.taskFilter.trim()) {
      const taskLower = dashboard.taskFilter.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.description.toLowerCase().includes(taskLower)
      );
    }

    if (dashboard.statusFilter !== 'all') {
      filteredTasks = filteredTasks.filter(task => {
        if (dashboard.statusFilter === 'active') {
          return task.status === 'in progress' || task.status === 'pending';
        }
        return task.status === dashboard.statusFilter;
      });
    }

    if (dashboard.priorityFilter !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === dashboard.priorityFilter);
    }

    if (dashboard.slaFilter !== 'all') {
      filteredTasks = filteredTasks.filter(task => {
        const slaStatus = getSLAStatus(task);
        
        switch (dashboard.slaFilter) {
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
      });
    }

    // Only include active tasks (non-completed)
    const activeFilteredTasks = filteredTasks.filter(task => task.status !== 'completed');

    if (activeFilteredTasks.length === 0) {
      return 'No filtered active tasks available to export';
    }

    // Group tasks by client
    const clientTasksMap = new Map();
    activeFilteredTasks.forEach(task => {
      const clientId = task.client.id;
      if (!clientTasksMap.has(clientId)) {
        clientTasksMap.set(clientId, {
          client: task.client,
          tasks: []
        });
      }
      clientTasksMap.get(clientId).tasks.push(task);
    });

    const clientTasksData = Array.from(clientTasksMap.values());

    let exportText = `FILTERED ACTIVE TASKS EXPORT\n`;
    exportText += `Export Date: ${new Date().toLocaleDateString()}\n`;
    exportText += `Export Time: ${new Date().toLocaleTimeString()}\n`;
    exportText += `Applied Filters:\n`;
    
    if (dashboard.searchTerm) exportText += `  • Search: "${dashboard.searchTerm}"\n`;
    if (dashboard.taskFilter) exportText += `  • Task Description: "${dashboard.taskFilter}"\n`;
    if (dashboard.statusFilter !== 'all') exportText += `  • Status: ${dashboard.statusFilter}\n`;
    if (dashboard.priorityFilter !== 'all') exportText += `  • Priority: ${dashboard.priorityFilter}\n`;
    if (dashboard.slaFilter !== 'all') exportText += `  • SLA Status: ${dashboard.slaFilter}\n`;
    if (dashboard.dateRangeFilter.start || dashboard.dateRangeFilter.end) {
      exportText += `  • Date Range: ${dashboard.dateRangeFilter.start || 'Any'} to ${dashboard.dateRangeFilter.end || 'Any'}\n`;
    }
    
    exportText += `\nTotal Clients with Filtered Active Tasks: ${clientTasksData.length}\n`;
    exportText += `Total Filtered Active Tasks: ${activeFilteredTasks.length}\n`;
    exportText += `${'='.repeat(80)}\n\n`;

    clientTasksData.forEach((clientData, clientIndex) => {
      const { client, tasks } = clientData;
      exportText += `CLIENT ${clientIndex + 1}/${clientTasksData.length}\n`;
      exportText += `Name: ${client.name}\n`;
      exportText += `Company: ${client.company}\n`;
      exportText += `ID: ${client.id}\n`;
      exportText += `Origin: ${client.origin}\n`;
      exportText += `Filtered Active Tasks: ${tasks.length}\n`;
      exportText += `${'-'.repeat(60)}\n\n`;

      tasks.forEach((task: Task, taskIndex: number) => {
        exportText += `  TASK ${taskIndex + 1}/${tasks.length}\n`;
        exportText += `  ${task.description}\n`;
        exportText += `  📅 Date: ${task.date}`;
        if (task.sla_date) {
          exportText += ` • ⏰ SLA: ${task.sla_date}`;
        }
        exportText += `\n`;
        exportText += `  📊 Status: ${task.status} • 🎯 Priority: ${task.priority}\n`;
        
        if (task.comments && task.comments.length > 0) {
          exportText += `  💬 Comments (${task.comments.length}):\n`;
          task.comments.forEach((comment: any) => {
            exportText += `    • ${comment.text}\n`;
          });
        } else {
          exportText += `  💬 Comments: None\n`;
        }
        
        exportText += `\n`;
      });
      
      exportText += `${'-'.repeat(60)}\n\n`;
    });

    return exportText;
  };

  const handleViewFilteredActiveExport = () => {
    const text = generateFilteredActiveTasksExportText();
    setActiveExportText(text);
    setShowActiveExportPreview(true);
  };

  const handleExportFilteredActiveTasks = async () => {
    try {
      const exportText = generateFilteredActiveTasksExportText();

      // Copy to clipboard
      await navigator.clipboard.writeText(exportText);
      
      // Calculate totals for success message
      let filteredTasks = dashboard.filteredClients.flatMap(client => 
        client.tasks.map(task => ({ ...task, client }))
      );

      // Apply task-level filters
      if (dashboard.taskFilter.trim()) {
        const taskLower = dashboard.taskFilter.toLowerCase();
        filteredTasks = filteredTasks.filter(task =>
          task.description.toLowerCase().includes(taskLower)
        );
      }

      if (dashboard.statusFilter !== 'all') {
        filteredTasks = filteredTasks.filter(task => {
          if (dashboard.statusFilter === 'active') {
            return task.status === 'in progress' || task.status === 'pending';
          }
          return task.status === dashboard.statusFilter;
        });
      }

      if (dashboard.priorityFilter !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.priority === dashboard.priorityFilter);
      }

      if (dashboard.slaFilter !== 'all') {
        filteredTasks = filteredTasks.filter(task => {
          const slaStatus = getSLAStatus(task);
          
          switch (dashboard.slaFilter) {
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
        });
      }

      const activeFilteredTasks = filteredTasks.filter(task => task.status !== 'completed');
      const uniqueClients = new Set(activeFilteredTasks.map(task => task.client.id)).size;
      
      dashboard.toast.success(
        'Filtered Active Tasks Exported!', 
        `Successfully exported ${activeFilteredTasks.length} filtered active tasks from ${uniqueClients} clients to clipboard`
      );

    } catch (error) {
      console.error('Export error:', error);
      dashboard.toast.error('Export Failed', 'Failed to export filtered active tasks to clipboard');
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
      <style jsx global>{`
        .highlight-flash {
          animation: highlightFlash 3s ease-in-out;
        }
        
        @keyframes highlightFlash {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          10% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.5); }
          20% { box-shadow: 0 0 0 16px rgba(59, 130, 246, 0.3); }
          30% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.5); }
          40% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      `}</style>
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
          onExportActiveTasks={handleExportActiveTasks}
          onViewActiveExport={handleViewActiveExport}
          onViewFilteredActiveExport={handleViewFilteredActiveExport}
          onExportFilteredActiveTasks={handleExportFilteredActiveTasks}
          isImporting={dashboard.isImporting}
          onAddClient={() => dashboard.setIsModalOpen(true)}
          hasActiveFilters={
            dashboard.searchTerm !== '' || 
            dashboard.taskFilter !== '' || 
            dashboard.statusFilter !== 'all' || 
            dashboard.priorityFilter !== 'all' || 
            dashboard.slaFilter !== 'all' || 
            dashboard.dateRangeFilter.start !== '' || 
            dashboard.dateRangeFilter.end !== ''
          }
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

        {/* Global Comment Search */}
        <GlobalCommentSearch 
          clients={dashboard.clients}
          darkMode={dashboard.darkMode}
          onNavigateToTask={handleNavigateToTask}
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

        {/* Active Export Preview Modal - Full Screen */}
        {showActiveExportPreview && (
          <div className="fixed inset-0 z-60 overflow-hidden">
            <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" onClick={() => setShowActiveExportPreview(false)}></div>
            <div className="fixed inset-0 z-70 flex flex-col">
              <div 
                className="w-full h-full rounded-none shadow-2xl overflow-hidden flex flex-col"
                style={{
                  backgroundColor: dashboard.darkMode ? '#1a1a1a' : '#ffffff',
                  border: 'none'
                }}
              >
                {/* Header */}
                <div className="px-6 py-4 border-b flex-shrink-0" style={{ borderColor: dashboard.darkMode ? '#374151' : '#e5e7eb' }}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold" style={{ color: dashboard.darkMode ? '#f9fafb' : '#111827' }}>
                      🚀 Active Tasks Export Preview
                    </h3>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(activeExportText);
                            dashboard.toast.success('Active Tasks Copied!', 'Active tasks export copied to clipboard');
                            setShowActiveExportPreview(false);
                          } catch (error) {
                            dashboard.toast.error('Copy Failed', 'Failed to copy active tasks to clipboard');
                          }
                        }}
                        className="px-6 py-3 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors font-medium"
                      >
                        📋 Copy Active Tasks
                      </button>
                      <button
                        onClick={() => setShowActiveExportPreview(false)}
                        className="p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xl"
                        style={{ color: dashboard.darkMode ? '#9ca3af' : '#6b7280' }}
                        title="Close Preview"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <pre 
                    className="whitespace-pre-wrap font-mono text-sm leading-relaxed h-full"
                    style={{ 
                      color: dashboard.darkMode ? '#f9fafb' : '#111827',
                      backgroundColor: dashboard.darkMode ? '#111827' : '#f8f9fa',
                      padding: '2rem',
                      borderRadius: '1rem',
                      border: `1px solid ${dashboard.darkMode ? '#374151' : '#e5e7eb'}`,
                      minHeight: '100%'
                    }}
                  >
                    {activeExportText}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        <ScrollToTop darkMode={dashboard.darkMode} />
        <ScrollToBottom darkMode={dashboard.darkMode} />
      </div>
    </AuthGuard>
  );
}