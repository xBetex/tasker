'use client'

import { useState, useRef, useEffect } from 'react';
import { Comment } from '@/types/types';
import DateDisplay from './DateDisplay';
import ImageRenderer from '@/components/ImageRenderer';
import ImageUpload from '@/components/ImageUpload';

interface CommentsSectionProps {
  comments: Comment[];
  onAddComment: (text: string) => void | Promise<void>;
  darkMode: boolean;
  isLoading?: boolean;
  autoScrollToNewComment?: boolean;
  forceExpanded?: boolean;
}

export default function CommentsSection({ 
  comments = [], 
  onAddComment, 
  darkMode, 
  isLoading = false,
  autoScrollToNewComment = true,
  forceExpanded = false,
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

  // Auto-scroll to new comments
  useEffect(() => {
    if (autoScrollToNewComment && comments.length > previousCommentsLength && latestCommentRef.current) {
      latestCommentRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    setPreviousCommentsLength(comments.length);
  }, [comments.length, previousCommentsLength, autoScrollToNewComment]);

  // Filter and sort comments
  const filteredAndSortedComments = comments
    .filter(comment => {
      if (!searchFilter.trim()) return true;
      const searchTerm = searchFilter.toLowerCase();
      return (
        comment.text.toLowerCase().includes(searchTerm) ||
        (comment.author && comment.author.toLowerCase().includes(searchTerm))
      );
    })
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isLoading) return;

    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      // Error adding comment
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  return (
    <div className="comments-section border-t mt-3" style={{ borderColor: 'var(--card-border)' }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-left transition-colors"
        style={{ 
          color: 'var(--primary-text)',
          backgroundColor: 'transparent'
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
        </div>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3">
          {comments.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchVisible(!isSearchVisible);
                    if (isSearchVisible && searchFilter.trim()) {
                      setSearchFilter('');
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
                >
                  <span>🔍</span>
                  <span>{isSearchVisible ? 'Hide Search' : 'Search Comments'}</span>
                </button>
              </div>

              {isSearchVisible && (
                <div className="mb-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="Search comments..."
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
                  </div>
                </div>
              )}
            </div>
          )}

          <div ref={commentsListRef} className="space-y-3 mb-4 max-h-96 overflow-y-auto">
            {filteredAndSortedComments.length === 0 ? (
              <div className="text-center py-4" style={{ color: 'var(--muted-text)' }}>
                {searchFilter.trim() ? 'No comments match your search.' : 'No comments yet. Be the first to comment!'}
              </div>
            ) : (
              filteredAndSortedComments.map((comment, index) => (
                <div 
                  key={comment.id}
                  ref={index === filteredAndSortedComments.length - 1 ? latestCommentRef : null}
                  className="p-3 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--card-background)',
                    borderColor: 'var(--card-border)'
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium" style={{ color: 'var(--primary-text)' }}>
                        {comment.author || 'Anonymous'}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--muted-text)' }}>•</span>
                      <DateDisplay 
                        date={comment.timestamp} 
                        className="text-xs"
                        fullTimestamp={true}
                      />
                    </div>
                  </div>
                  <div 
                    className="text-sm leading-relaxed"
                    style={{ 
                      color: 'var(--primary-text)',
                      wordWrap: 'break-word'
                    }}
                  >
                    <ImageRenderer text={comment.text} searchTerm={searchFilter} />
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-2">
            <div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a comment... (Ctrl+Enter to submit)"
                className="w-full px-3 py-2 text-sm rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: 'var(--input-background)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--input-text)',
                  minHeight: '60px'
                }}
                rows={2}
                disabled={isLoading}
              />
              <div className="flex justify-between items-center mt-2">
                <ImageUpload 
                  onImageUploaded={(url) => setNewComment(prev => prev + (prev ? '\n\n' : '') + url)}
                  disabled={isLoading}
                />
                <div className="text-xs flex items-center gap-2" style={{ color: 'var(--secondary-text)' }}>
                  <span>💡 Tip: Copy any image and paste here with Ctrl+V</span>
                </div>
                <button
                  type="submit"
                  disabled={!newComment.trim() || isLoading}
                  className="px-3 py-1 text-xs rounded-md font-medium transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--primary-button)',
                  }}
                >
                  {isLoading ? 'Adding...' : 'Add Comment'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 