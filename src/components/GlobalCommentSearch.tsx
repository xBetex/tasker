'use client'

import { useState, useMemo } from 'react';
import { Client, Comment } from '@/types/types';
import DateDisplay from '@/app/components/DateDisplay';
import ImageRenderer from './ImageRenderer';

interface CommentResult {
  comment: Comment;
  taskId: number;
  taskDescription: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
}

interface GlobalCommentSearchProps {
  clients: Client[];
  darkMode: boolean;
  onNavigateToTask?: (taskId: number, clientId: string) => void;
  onClose?: () => void;
}

export default function GlobalCommentSearch({ 
  clients, 
  darkMode, 
  onNavigateToTask,
  onClose 
}: GlobalCommentSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Get all comments from all tasks across all clients
  const allComments = useMemo(() => {
    const comments: CommentResult[] = [];
    
    clients.forEach(client => {
      client.tasks.forEach(task => {
        if (task.comments) {
          task.comments.forEach(comment => {
            comments.push({
              comment,
              taskId: task.id,
              taskDescription: task.description,
              clientId: client.id,
              clientName: client.name,
              clientCompany: client.company
            });
          });
        }
      });
    });

    // Sort by comment timestamp (newest first)
    return comments.sort((a, b) => 
      new Date(b.comment.timestamp).getTime() - new Date(a.comment.timestamp).getTime()
    );
  }, [clients]);

  // Filter comments based on search term
  const filteredComments = useMemo(() => {
    if (!searchTerm.trim()) return allComments;
    
    const searchLower = searchTerm.toLowerCase();
    return allComments.filter(result => 
      result.comment.text.toLowerCase().includes(searchLower) ||
      (result.comment.author && result.comment.author.toLowerCase().includes(searchLower)) ||
      result.taskDescription.toLowerCase().includes(searchLower) ||
      result.clientName.toLowerCase().includes(searchLower) ||
      result.clientCompany.toLowerCase().includes(searchLower)
    );
  }, [allComments, searchTerm]);

  const handleNavigateToTask = (result: CommentResult) => {
    if (onNavigateToTask) {
      onNavigateToTask(result.taskId, result.clientId);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div 
      className="border-t mt-4"
      style={{ borderColor: 'var(--card-border)' }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-left transition-colors"
        style={{ 
          color: 'var(--primary-text)',
          backgroundColor: 'transparent'
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">🔍 Global Comment Search</span>
          {searchTerm && filteredComments.length > 0 && (
            <span 
              className="px-2 py-1 text-xs rounded-full"
              style={{
                backgroundColor: darkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)',
                color: darkMode ? '#86efac' : '#15803d'
              }}
            >
              {filteredComments.length} result{filteredComments.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3">
          {/* Search Input */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search across all comments, authors, tasks, and clients..."
                className="w-full pl-10 pr-4 py-3 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                style={{
                  backgroundColor: 'var(--input-background)',
                  borderColor: searchTerm ? (darkMode ? '#22c55e' : '#16a34a') : 'var(--input-border)',
                  color: 'var(--input-text)'
                }}
                autoFocus
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <span className="text-lg">🔍</span>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all hover:scale-110"
                  style={{
                    backgroundColor: 'var(--card-background-hover)',
                    color: 'var(--secondary-text)'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Search Stats */}
          <div className="flex items-center justify-between mb-4">
            <span 
              className="text-xs"
              style={{ color: 'var(--muted-text)' }}
            >
              {searchTerm 
                ? `${filteredComments.length} of ${allComments.length} comments found`
                : `${allComments.length} total comments available`
              }
            </span>
            {onClose && (
              <button
                onClick={onClose}
                className="text-xs px-2 py-1 rounded transition-colors"
                style={{ color: 'var(--muted-text)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                  e.currentTarget.style.color = 'var(--secondary-text)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--muted-text)';
                }}
              >
                Close
              </button>
            )}
          </div>

          {/* Results */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredComments.length === 0 ? (
              <div className="text-center py-8" style={{ color: 'var(--muted-text)' }}>
                {searchTerm ? (
                  <div>
                    <span className="text-2xl mb-2 block">🔍</span>
                    <p className="font-medium">No comments found</p>
                    <p className="text-xs mt-1">Try different keywords or check spelling</p>
                  </div>
                ) : (
                  <div>
                    <span className="text-2xl mb-2 block">💬</span>
                    <p className="font-medium">Enter search terms above</p>
                    <p className="text-xs mt-1">Search across all comments, authors, tasks, and clients</p>
                  </div>
                )}
              </div>
            ) : (
              filteredComments.map((result, index) => (
                <div 
                  key={`${result.taskId}-${result.comment.id}-${index}`}
                  className="p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--card-background)',
                    borderColor: 'var(--card-border)'
                  }}
                  onClick={() => handleNavigateToTask(result)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                    e.currentTarget.style.borderColor = darkMode ? '#22c55e' : '#16a34a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--card-background)';
                    e.currentTarget.style.borderColor = 'var(--card-border)';
                  }}
                >
                  {/* Comment Content */}
                  <div 
                    className="text-sm leading-relaxed mb-3"
                    style={{ 
                      color: 'var(--primary-text)',
                      wordWrap: 'break-word'
                    }}
                  >
                    <ImageRenderer text={result.comment.text} searchTerm={searchTerm} />
                  </div>

                  {/* Comment Metadata */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <span 
                        className="font-medium"
                        style={{ color: 'var(--primary-text)' }}
                      >
                        {result.comment.author || 'Anonymous'}
                      </span>
                      <span style={{ color: 'var(--muted-text)' }}>•</span>
                      <DateDisplay 
                        date={result.comment.timestamp} 
                        className="text-xs"
                        fullTimestamp={true}
                      />
                    </div>
                  </div>

                  {/* Task and Client Info */}
                  <div 
                    className="text-xs p-2 rounded border-l-2 mt-2"
                    style={{
                      backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.05)',
                      borderLeftColor: darkMode ? '#3b82f6' : '#2563eb',
                      color: 'var(--secondary-text)'
                    }}
                  >
                    <div className="font-medium mb-1">
                      📋 {truncateText(result.taskDescription, 60)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span>👤 {result.clientName}</span>
                      <span>•</span>
                      <span>🏢 {result.clientCompany}</span>
                    </div>
                  </div>

                  {/* Navigate Hint */}
                  <div 
                    className="text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--muted-text)' }}
                  >
                    Click to view task
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
} 