import { useState, useEffect, useMemo } from 'react';
import { Client } from '@/types/types';

interface UseClientSearchReturn {
  searchTerm: string;
  suggestions: Client[];
  filteredSuggestions: Client[];
  onSearchChange: (value: string) => void;
  onSelect: (client: Client) => void;
  clearSearch: () => void;
}

export function useClientSearch(
  clients: Client[], 
  onClientSelect?: (clientId: string) => void,
  debounceMs: number = 300
): UseClientSearchReturn {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  // Filter suggestions based on search term
  const suggestions = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return clients.slice(0, 5); // Show first 5 clients when no search
    }

    const searchLower = debouncedSearchTerm.toLowerCase();
    return clients.filter(client => 
      client.name.toLowerCase().includes(searchLower) ||
      client.company.toLowerCase().includes(searchLower)
    );
  }, [clients, debouncedSearchTerm]);

  // Get filtered suggestions for dropdown (max 10)
  const filteredSuggestions = useMemo(() => {
    return suggestions.slice(0, 10);
  }, [suggestions]);

  const onSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const onSelect = (client: Client) => {
    setSearchTerm(`${client.name} (${client.company})`);
    if (onClientSelect) {
      onClientSelect(client.id);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  return {
    searchTerm,
    suggestions,
    filteredSuggestions,
    onSearchChange,
    onSelect,
    clearSearch
  };
} 