import { useState, useEffect, useCallback } from 'react';
import { TaskStatus, TaskPriority } from '@/types/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { SLAFilter } from '@/app/components/FilterBar';

interface FilterState {
  statusFilter: TaskStatus | 'all';
  priorityFilter: TaskPriority | 'all';
  clientSearch: string;
  selectedClientId: string | null;
  dateRange: { start: string; end: string };
  selectedClients: string[];
  slaFilter: SLAFilter;
  descriptionFilter: string;
}

const defaultFilters: FilterState = {
  statusFilter: 'all',
  priorityFilter: 'all',
  clientSearch: '',
  selectedClientId: null,
  dateRange: { start: '', end: '' },
  selectedClients: [],
  slaFilter: 'all',
  descriptionFilter: ''
};

export function usePersistedFilters(storageKey: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load filters from localStorage and URL on component mount
  useEffect(() => {
    try {
      // First try to load from URL
      const urlFilters: Partial<FilterState> = {};
      
      if (searchParams.get('status')) {
        urlFilters.statusFilter = searchParams.get('status') as TaskStatus | 'all';
      }
      if (searchParams.get('priority')) {
        urlFilters.priorityFilter = searchParams.get('priority') as TaskPriority | 'all';
      }
      if (searchParams.get('client')) {
        urlFilters.clientSearch = searchParams.get('client') || '';
      }
      if (searchParams.get('selectedClient')) {
        urlFilters.selectedClientId = searchParams.get('selectedClient');
      }
      if (searchParams.get('startDate')) {
        urlFilters.dateRange = {
          start: searchParams.get('startDate') || '',
          end: searchParams.get('endDate') || ''
        };
      }
      if (searchParams.get('clients')) {
        const clients = searchParams.get('clients');
        urlFilters.selectedClients = clients ? clients.split(',') : [];
      }
      if (searchParams.get('sla')) {
        urlFilters.slaFilter = searchParams.get('sla') as SLAFilter;
      }
      if (searchParams.get('description')) {
        urlFilters.descriptionFilter = searchParams.get('description') || '';
      }

      // If no URL params, try localStorage
      let storedFilters = defaultFilters;
      if (Object.keys(urlFilters).length === 0) {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          try {
            storedFilters = { ...defaultFilters, ...JSON.parse(stored) };
          } catch (e) {
            console.warn('Failed to parse stored filters:', e);
          }
        }
      }

      // Merge URL params with stored/default filters
      const mergedFilters = { ...storedFilters, ...urlFilters };
      setFilters(mergedFilters);
      setIsLoaded(true);
    } catch (error) {
      console.warn('Failed to load persisted filters:', error);
      setFilters(defaultFilters);
      setIsLoaded(true);
    }
  }, [storageKey, searchParams]);

  // Update URL and localStorage when filters change
  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    // Save to localStorage
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedFilters));
    } catch (error) {
      console.warn('Failed to save filters to localStorage:', error);
    }

    // Update URL
    try {
      const params = new URLSearchParams();
      
      if (updatedFilters.statusFilter !== 'all') {
        params.set('status', updatedFilters.statusFilter);
      }
      if (updatedFilters.priorityFilter !== 'all') {
        params.set('priority', updatedFilters.priorityFilter);
      }
      if (updatedFilters.clientSearch) {
        params.set('client', updatedFilters.clientSearch);
      }
      if (updatedFilters.selectedClientId) {
        params.set('selectedClient', updatedFilters.selectedClientId);
      }
      if (updatedFilters.dateRange.start) {
        params.set('startDate', updatedFilters.dateRange.start);
      }
      if (updatedFilters.dateRange.end) {
        params.set('endDate', updatedFilters.dateRange.end);
      }
      if (updatedFilters.selectedClients.length > 0) {
        params.set('clients', updatedFilters.selectedClients.join(','));
      }
      if (updatedFilters.slaFilter !== 'all') {
        params.set('sla', updatedFilters.slaFilter);
      }
      if (updatedFilters.descriptionFilter) {
        params.set('description', updatedFilters.descriptionFilter);
      }

      const queryString = params.toString();
      const newUrl = queryString ? `?${queryString}` : window.location.pathname;
      
      // Use replace to avoid adding to browser history for each filter change
      window.history.replaceState({}, '', newUrl);
    } catch (error) {
      console.warn('Failed to update URL:', error);
    }
  }, [filters, storageKey]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
    
    try {
      localStorage.removeItem(storageKey);
      window.history.replaceState({}, '', window.location.pathname);
    } catch (error) {
      console.warn('Failed to clear filters:', error);
    }
  }, [storageKey]);

  // Individual filter setters
  const setStatusFilter = useCallback((status: TaskStatus | 'all') => {
    updateFilters({ statusFilter: status });
  }, [updateFilters]);

  const setPriorityFilter = useCallback((priority: TaskPriority | 'all') => {
    updateFilters({ priorityFilter: priority });
  }, [updateFilters]);

  const setClientSearch = useCallback((search: string) => {
    updateFilters({ 
      clientSearch: search,
      selectedClientId: null
    });
  }, [updateFilters]);

  const setSelectedClientId = useCallback((clientId: string | null) => {
    updateFilters({ 
      selectedClientId: clientId,
      clientSearch: ''
    });
  }, [updateFilters]);

  const setDateRange = useCallback((range: { start: string; end: string }) => {
    updateFilters({ dateRange: range });
  }, [updateFilters]);

  const setSelectedClients = useCallback((clients: string[]) => {
    updateFilters({ selectedClients: clients });
  }, [updateFilters]);

  const setSlaFilter = useCallback((slaFilter: SLAFilter) => {
    updateFilters({ slaFilter });
  }, [updateFilters]);

  const setDescriptionFilter = useCallback((description: string) => {
    updateFilters({ descriptionFilter: description });
  }, [updateFilters]);

  // Get shareable URL
  const getShareableUrl = useCallback(() => {
    const params = new URLSearchParams();
    
    if (filters.statusFilter !== 'all') {
      params.set('status', filters.statusFilter);
    }
    if (filters.priorityFilter !== 'all') {
      params.set('priority', filters.priorityFilter);
    }
    if (filters.clientSearch) {
      params.set('client', filters.clientSearch);
    }
    if (filters.selectedClientId) {
      params.set('selectedClient', filters.selectedClientId);
    }
    if (filters.dateRange.start) {
      params.set('startDate', filters.dateRange.start);
    }
    if (filters.dateRange.end) {
      params.set('endDate', filters.dateRange.end);
    }
    if (filters.selectedClients.length > 0) {
      params.set('clients', filters.selectedClients.join(','));
    }
    if (filters.slaFilter !== 'all') {
      params.set('sla', filters.slaFilter);
    }
    if (filters.descriptionFilter) {
      params.set('description', filters.descriptionFilter);
    }

    const queryString = params.toString();
    return queryString ? `${window.location.origin}${window.location.pathname}?${queryString}` : window.location.href;
  }, [filters]);

  return {
    filters,
    isLoaded,
    updateFilters,
    clearFilters,
    setStatusFilter,
    setPriorityFilter,
    setClientSearch,
    setSelectedClientId,
    setDateRange,
    setSelectedClients,
    setSlaFilter,
    setDescriptionFilter,
    getShareableUrl
  };
} 