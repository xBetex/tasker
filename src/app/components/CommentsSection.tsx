'use client'

import { useState, useRef, useEffect } from 'react';
import { Comment } from '@/types/types';
import DateDisplay from './DateDisplay';

interface CommentsSectionProps {
  comments: Comment[];
  onAddComment: (text: string) => void;
  darkMode: boolean;
  isLoading?: boolean;
  autoScrollToNewComment?: boolean;
}

export default function CommentsSection({ 
  comments = [], 
  onAddComment, 
  darkMode, 
  isLoading = false,
  autoScrollToNewComment = true
}: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [previousCommentsLength, setPreviousCommentsLength] = useState(comments.length);
  const commentsListRef = useRef<HTMLDivElement>(null);
  const latestCommentRef = useRef<HTMLDivElement>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && !isLoading) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  const sortedComments = [...comments].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

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
            <span className={`px-2 py-1 text-xs rounded-full ${
              darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
            }`}>
              {comments.length}
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
            {sortedComments.length === 0 ? (
              <div className="text-center py-4" style={{ color: 'var(--muted-text)' }}>
                <div className="text-2xl mb-2">💭</div>
                <p className="text-sm">No comments yet. Be the first to add one!</p>
              </div>
            ) : (
              sortedComments.map((comment, index) => (
                <div
                  key={comment.id}
                  ref={index === 0 ? latestCommentRef : null} // First comment is the most recent due to sorting
                  className="p-3 rounded-lg border-l-4 border-l-blue-500 comment-item"
                  style={{
                    backgroundColor: 'var(--card-background-hover)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-blue-500">
                      {comment.author || 'User'}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--muted-text)' }}>
                      <DateDisplay date={comment.timestamp} showTime />
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--primary-text)' }}>
                    {comment.text}
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