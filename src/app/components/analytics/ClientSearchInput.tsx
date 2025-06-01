'use client'

import { useState, useRef, useEffect } from 'react';
import { Client } from '@/types/types';
import { useClientSearch } from '@/app/hooks/useClientSearch';

interface ClientSearchInputProps {
  clients: Client[];
  onClientSelect?: (clientId: string) => void;
  placeholder?: string;
  darkMode: boolean;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export default function ClientSearchInput({
  clients,
  onClientSelect,
  placeholder = "Search by name or company",
  darkMode,
  className = "",
  value: externalValue,
  onChange: externalOnChange
}: ClientSearchInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    searchTerm: internalSearchTerm,
    filteredSuggestions,
    onSearchChange: internalOnSearchChange,
    onSelect: internalOnSelect,
    clearSearch: internalClearSearch
  } = useClientSearch(clients, onClientSelect);

  const searchTerm = externalValue !== undefined ? externalValue : internalSearchTerm;
  const onSearchChange = externalOnChange || internalOnSearchChange;
  const clearSearch = () => {
    if (externalOnChange) {
      externalOnChange('');
    } else {
      internalClearSearch();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && filteredSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
        setSelectedIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        e.preventDefault();
        break;
      case 'ArrowUp':
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        e.preventDefault();
        break;
      case 'Enter':
        if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
          handleSelectClient(filteredSuggestions[selectedIndex]);
          e.preventDefault();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelectClient = (client: Client) => {
    if (onClientSelect) {
      onClientSelect(client.id);
    } else {
      internalOnSelect(client);
    }
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange(value);
    setIsOpen(value.length > 0);
    setSelectedIndex(-1);
  };

  const handleClear = () => {
    clearSearch();
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Highlight matching text
  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text;
    
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className={darkMode ? 'bg-yellow-600 text-yellow-100' : 'bg-yellow-200 text-yellow-800'}>
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className={`block w-full rounded-md text-sm pl-10 pr-10 ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          } shadow-sm border focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          aria-label={placeholder}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
        />
        
        {/* Search Icon */}
        <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Clear Button */}
        {searchTerm && (
          <button
            onClick={handleClear}
            className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
              darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
            }`}
            aria-label="Clear search"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && filteredSuggestions.length > 0 && (
        <div className={`absolute z-10 mt-1 w-full rounded-md shadow-lg ${
          darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
        } border max-h-60 overflow-auto`}>
          <ul role="listbox" className="py-1">
            {filteredSuggestions.map((client, index) => (
              <li
                key={client.id}
                role="option"
                aria-selected={index === selectedIndex}
                className={`px-4 py-2 cursor-pointer transition-colors ${
                  index === selectedIndex
                    ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-900'
                    : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => handleSelectClient(client)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="font-medium">
                  {highlightText(client.name, searchTerm)}
                </div>
                <div className={`text-sm ${
                  index === selectedIndex
                    ? darkMode ? 'text-blue-200' : 'text-blue-700'
                    : darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {highlightText(client.company, searchTerm)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No results message */}
      {isOpen && searchTerm.length > 0 && filteredSuggestions.length === 0 && (
        <div className={`absolute z-10 mt-1 w-full rounded-md shadow-lg ${
          darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
        } border`}>
          <div className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No clients found for "{searchTerm}"
          </div>
        </div>
      )}
    </div>
  );
} 