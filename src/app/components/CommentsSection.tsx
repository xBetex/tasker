'use client'

import { useState, useRef, useEffect } from 'react';
import { Comment } from '@/types/types';
import DateDisplay from './DateDisplay';
import UserInfo from './UserInfo';

interface CommentsSectionProps {
  comments: Comment[];
  onAddComment: (text: string) => void | Promise<void>;
  darkMode: boolean;
  isLoading?: boolean;
  autoScrollToNewComment?: boolean;
  forceExpanded?: boolean;
  taskId?: number;
  clientId?: string;
  onNavigateToTask?: (taskId: number, clientId: string) => void;
}

export default function CommentsSection({ 
  comments = [], 
  onAddComment, 
  darkMode, 
  isLoading = false,
  autoScrollToNewComment = true,
  forceExpanded = false,
  taskId,
  clientId,
  onNavigateToTask
}: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(forceExpanded);
  const [searchFilter, setSearchFilter] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [previousCommentsLength, setPreviousCommentsLength] = useState(comments.length);
  const commentsListRef = useRef<HTMLDivElement>(null);
  const latestCommentRef = useRef<HTMLDivElement>(null);

  // Effect to handle forceExpanded prop changes
  useEffect(() => {
    setIsExpanded(forceExpanded);
  }, [forceExpanded]);

  // Effect to handle auto-scroll to new comments and auto-expand
  useEffect(() => {
    if (comments.length > previousCommentsLength && autoScrollToNewComment) {
      // Auto-expand comments section when new comment is added
      setIsExpanded(true);
      
      // Scroll to the latest comment after a short delay to ensure DOM is updated
      setTimeout(() => {
        if (latestCommentRef.current) {
          latestCommentRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
          });
        }
      }, 100);
    }
    setPreviousCommentsLength(comments.length);
  }, [comments.length, previousCommentsLength, autoScrollToNewComment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && !isLoading) {
      try {
        await onAddComment(newComment.trim());
        setNewComment('');
      } catch (error) {
        console.error('Error in handleSubmit:', error);
        // Error handling is done in the parent component
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  // Filter and sort comments
  const filteredAndSortedComments = [...comments]
    .filter(comment => {
      if (!searchFilter.trim()) return true;
      const searchLower = searchFilter.toLowerCase();
      return (
        comment.text.toLowerCase().includes(searchLower) ||
        (comment.author || 'User').toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  // Helper function to highlight search terms
  const highlightText = (text: string, searchTerm: string): (string | JSX.Element)[] | string => {
    if (!searchTerm.trim()) return text;
    
    const parts = text.split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part: string, index: number) => 
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <mark 
          key={index}
          className="px-1 rounded"
          style={{
            backgroundColor: darkMode ? 'rgba(250, 204, 21, 0.3)' : 'rgba(250, 204, 21, 0.2)',
            color: darkMode ? '#fbbf24' : '#d97706'
          }}
        >
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="comments-section border-t mt-3" style={{ borderColor: 'var(--card-border)' }}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-left transition-colors"
        style={{ 
          color: 'var(--primary-text)',
          backgroundColor: 'transparent'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">💬 Comments</span>
          {comments.length > 0 && (
            <span 
              className="px-2 py-1 text-xs rounded-full"
              style={{
                backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                color: darkMode ? '#93c5fd' : '#1e40af'
              }}
            >
              {searchFilter.trim() 
                ? `${filteredAndSortedComments.length}/${comments.length}` 
                : comments.length
              }
            </span>
          )}
          {searchFilter.trim() && (
            <span className="text-xs" style={{ color: 'var(--muted-text)' }}>
              🔍 Filtered
            </span>
          )}
        </div>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Comments Content */}
      {isExpanded && (
        <div className="px-3 pb-3">
          {/* Search Toggle Button and Search Filter */}
          {comments.length > 0 && (
            <div className="mb-4">
              {/* Search Toggle Button */}
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchVisible(!isSearchVisible);
                    if (isSearchVisible && searchFilter.trim()) {
                      setSearchFilter(''); // Clear search when hiding
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md transition-colors font-medium"
                  style={{
                    backgroundColor: isSearchVisible 
                      ? (darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)')
                      : 'var(--card-background-hover)',
                    color: isSearchVisible 
                      ? (darkMode ? '#93c5fd' : '#1e40af')
                      : 'var(--muted-text)',
                    border: '1px solid var(--card-border)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSearchVisible) {
                      e.currentTarget.style.backgroundColor = 'var(--primary-button)';
                      e.currentTarget.style.color = 'white';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSearchVisible) {
                      e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                      e.currentTarget.style.color = 'var(--muted-text)';
                    }
                  }}
                >
                  <span>🔍</span>
                  <span>{isSearchVisible ? 'Hide Search' : 'Search Comments'}</span>
                  {searchFilter.trim() && !isSearchVisible && (
                    <span 
                      className="px-1.5 py-0.5 text-xs rounded-full"
                      style={{
                        backgroundColor: darkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)',
                        color: darkMode ? '#4ade80' : '#15803d'
                      }}
                    >
                      Active
                    </span>
                  )}
                </button>
              </div>

              {/* Collapsible Search Field */}
              {isSearchVisible && (
                <div className="mb-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="Search comments by text or author..."
                      className="w-full pl-8 pr-10 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: 'var(--input-background)',
                        borderColor: 'var(--input-border)',
                        color: 'var(--input-text)'
                      }}
                      autoFocus
                    />
                    <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2">
                      <span className="text-sm" style={{ color: 'var(--muted-text)' }}>🔍</span>
                    </div>
                    {searchFilter.trim() && (
                      <button
                        type="button"
                        onClick={() => setSearchFilter('')}
                        className="absolute right-2.5 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors"
                        style={{ color: 'var(--muted-text)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                          e.currentTarget.style.color = 'var(--primary-text)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--muted-text)';
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Search Results Summary */}
              {searchFilter.trim() && (
                <div className="mb-2 text-xs" style={{ color: 'var(--muted-text)' }}>
                  Showing {filteredAndSortedComments.length} of {comments.length} comments
                </div>
              )}
            </div>
          )}

          {/* Add Comment Form */}
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a comment... (Ctrl+Enter to submit)"
                className="w-full px-3 py-2 text-sm rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: 'var(--input-background)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--input-text)'
                }}
                rows={2}
                disabled={isLoading}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs" style={{ color: 'var(--muted-text)' }}>
                  Ctrl+Enter to submit
                </span>
                <button
                  type="submit"
                  disabled={!newComment.trim() || isLoading}
                  className="px-3 py-1 text-xs rounded-md font-medium transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--primary-button)',
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = 'var(--primary-button-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = 'var(--primary-button)';
                    }
                  }}
                >
                  {isLoading ? 'Adding...' : 'Add Comment'}
                </button>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3" ref={commentsListRef}>
            {filteredAndSortedComments.length === 0 ? (
              <div className="text-center py-4" style={{ color: 'var(--muted-text)' }}>
                <div className="text-2xl mb-2">{searchFilter.trim() ? '🔍' : '💭'}</div>
                <p className="text-sm">
                  {searchFilter.trim() 
                    ? `No comments found matching "${searchFilter}"`
                    : 'No comments yet. Be the first to add one!'
                  }
                </p>
                {searchFilter.trim() && (
                  <button
                    onClick={() => setSearchFilter('')}
                    className="mt-2 text-xs underline hover:no-underline"
                    style={{ color: 'var(--primary-button)' }}
                  >
                    Clear search to show all comments
                  </button>
                )}
              </div>
            ) : (
              filteredAndSortedComments.map((comment, index) => (
                <div
                  key={comment.id}
                  ref={index === 0 ? latestCommentRef : null} // First comment is the most recent due to sorting
                  className="p-3 rounded-lg border-l-4 border-l-blue-500 comment-item transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--card-background-hover)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-blue-500">
                        {highlightText(comment.author || 'User', searchFilter)}
                      </span>
                      {comment.createdBy && (
                        <UserInfo 
                          user={comment.createdBy} 
                          label="" 
                          size="sm" 
                          darkMode={darkMode} 
                          showRole={false}
                        />
                      )}
                    </div>
                    <span className="text-xs" style={{ color: 'var(--muted-text)' }}>
                      <DateDisplay date={comment.timestamp} fullTimestamp />
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--primary-text)' }}>
                    {highlightText(comment.text, searchFilter)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
} 