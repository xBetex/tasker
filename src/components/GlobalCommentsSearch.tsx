'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Custom SVG Icons
const SearchIcon = ({ className = "", size = 16 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const MessageCircleIcon = ({ className = "", size = 16 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const UserIcon = ({ className = "", size = 16 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CalendarIcon = ({ className = "", size = 16 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const FileTextIcon = ({ className = "", size = 16 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
  </svg>
);

const BuildingIcon = ({ className = "", size = 16 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2" />
  </svg>
);

const XIcon = ({ className = "", size = 16 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

interface GlobalComment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  task_id: number;
  task_description: string;
  client_id: string;
  client_name: string;
  client_company: string;
}

interface SearchResponse {
  results: GlobalComment[];
  total: number;
  query: string;
}

const GlobalCommentsSearch: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GlobalComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  const searchComments = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setTotalResults(0);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/comments/search?q=${encodeURIComponent(query.trim())}`);
      if (response.ok) {
        const data: SearchResponse = await response.json();
        setSearchResults(data.results);
        setTotalResults(data.total);
        setHasSearched(true);
      } else {
        console.error('Failed to search comments');
        setSearchResults([]);
        setTotalResults(0);
      }
    } catch (error) {
      console.error('Error searching comments:', error);
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchComments(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchComments]);

  const highlightText = (text: string, query: string) => {
    if (!query || query.length < 2) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setTotalResults(0);
    setHasSearched(false);
  };

  return (
    <div className={`p-6 rounded-lg border ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <MessageCircleIcon className={`w-6 h-6 ${
          isDarkMode ? 'text-blue-400' : 'text-blue-600'
        }`} />
        <h2 className={`text-xl font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Global Comments Search
        </h2>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className={`w-5 h-5 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search across all comments and authors..."
          className={`w-full pl-10 pr-10 py-3 rounded-lg border transition-colors ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
              isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <XIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Results Header */}
      {hasSearched && (
        <div className={`mb-4 text-sm ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
              Searching...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <SearchIcon className="w-4 h-4" />
              {totalResults === 0 ? (
                `No comments found for "${searchQuery}"`
              ) : (
                `Found ${totalResults} comment${totalResults !== 1 ? 's' : ''} for "${searchQuery}"`
              )}
            </div>
          )}
        </div>
      )}

      {/* Search Results */}
      <div className="space-y-4">
        {searchResults.map((comment) => (
          <div
            key={comment.id}
            className={`p-4 rounded-lg border transition-colors ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 hover:bg-gray-650'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {/* Comment Text */}
            <div className={`mb-3 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>
              {highlightText(comment.text, searchQuery)}
            </div>

            {/* Comment Metadata */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {/* Author and Date */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span className="font-medium">
                    {highlightText(comment.author, searchQuery)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatTimestamp(comment.timestamp)}</span>
                </div>
              </div>

              {/* Client and Task Info */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BuildingIcon className="w-4 h-4" />
                  <span className="font-medium">{comment.client_name}</span>
                  {comment.client_company && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {comment.client_company}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <FileTextIcon className="w-4 h-4" />
                  <span className="truncate">{comment.task_description}</span>
                </div>
              </div>
            </div>

            {/* Client ID Badge */}
            <div className="mt-3 flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded font-mono ${
                isDarkMode 
                  ? 'bg-blue-900 text-blue-200' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {comment.client_id}
              </span>
              <span className={`text-xs px-2 py-1 rounded font-mono ${
                isDarkMode 
                  ? 'bg-green-900 text-green-200' 
                  : 'bg-green-100 text-green-800'
              }`}>
                Task #{comment.task_id}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {hasSearched && !isLoading && searchResults.length === 0 && (
        <div className={`text-center py-12 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <MessageCircleIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No comments found</p>
          <p className="text-sm">
            Try adjusting your search terms or check if there are any comments in the system.
          </p>
        </div>
      )}

      {/* Initial State */}
      {!hasSearched && !isLoading && (
        <div className={`text-center py-12 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Search Comments Globally</p>
          <p className="text-sm">
            Enter at least 2 characters to search across all comments and authors.
          </p>
        </div>
      )}
    </div>
  );
};

export default GlobalCommentsSearch; 