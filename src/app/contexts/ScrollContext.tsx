'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

interface ScrollContextType {
  focusedTaskId: number | null;
  setFocusedTaskId: (taskId: number | null) => void;
  scrollToTask: (taskId: number, options?: ScrollOptions) => void;
  registerTaskRef: (taskId: number, element: HTMLElement) => void;
  unregisterTaskRef: (taskId: number) => void;
  highlightTask: (taskId: number, duration?: number) => void;
  isScrolling: boolean;
  lastScrolledTaskId: number | null;
}

interface ScrollOptions {
  behavior?: 'smooth' | 'instant';
  block?: 'start' | 'center' | 'end' | 'nearest';
  highlight?: boolean;
  highlightDuration?: number;
  offset?: number;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const [focusedTaskId, setFocusedTaskId] = useState<number | null>(null);
  const [taskRefs, setTaskRefs] = useState<Map<number, HTMLElement>>(new Map());
  const [isScrolling, setIsScrolling] = useState(false);
  const [lastScrolledTaskId, setLastScrolledTaskId] = useState<number | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const registerTaskRef = useCallback((taskId: number, element: HTMLElement) => {
    setTaskRefs(prev => new Map(prev).set(taskId, element));
  }, []);

  const unregisterTaskRef = useCallback((taskId: number) => {
    setTaskRefs(prev => {
      const newMap = new Map(prev);
      newMap.delete(taskId);
      return newMap;
    });
  }, []);

  const highlightTask = useCallback((taskId: number, duration = 3000) => {
    const element = taskRefs.get(taskId);
    if (element) {
      // Remove any existing highlight classes
      element.classList.remove('task-highlight', 'task-highlight-pulse', 'task-highlight-glow');
      
      // Add highlight effect with enhanced animation
      element.classList.add('task-highlight-glow');
      
      // Remove highlight after duration
      setTimeout(() => {
        element.classList.remove('task-highlight-glow');
        element.classList.add('task-highlight-fade');
        
        // Clean up fade class
        setTimeout(() => {
          element.classList.remove('task-highlight-fade');
        }, 500);
      }, duration);
    }
  }, [taskRefs]);

  const scrollToTask = useCallback((taskId: number, options: ScrollOptions = {}) => {
    const element = taskRefs.get(taskId);
    if (element) {
      const {
        behavior = 'smooth',
        block = 'center',
        highlight = true,
        highlightDuration = 3000,
        offset = 0
      } = options;

      setIsScrolling(true);
      setLastScrolledTaskId(taskId);

      // Clear any existing scroll timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Calculate scroll position with offset
      if (offset !== 0) {
        const elementRect = element.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.pageYOffset;
        const targetPosition = absoluteElementTop + offset;
        
        window.scrollTo({
          top: targetPosition,
          behavior: behavior,
        });
      } else {
        // Use standard scroll into view
        element.scrollIntoView({ 
          behavior,
          block,
          inline: 'nearest'
        });
      }
      
      // Add highlight if enabled
      if (highlight) {
        // Small delay to ensure scroll has started
        setTimeout(() => {
          highlightTask(taskId, highlightDuration);
        }, 100);
      }

      // Reset scrolling state after animation completes
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, behavior === 'smooth' ? 1000 : 100);
    }
  }, [taskRefs, highlightTask]);

  // Enhanced scroll to focused task with better timing
  useEffect(() => {
    if (focusedTaskId) {
      const timeoutId = setTimeout(() => {
        scrollToTask(focusedTaskId, {
          behavior: 'smooth',
          block: 'center',
          highlight: true,
          highlightDuration: 4000, // Longer highlight for status changes
        });
        setFocusedTaskId(null); // Clear after scroll
      }, 150); // Slightly longer delay for DOM updates
      
      return () => clearTimeout(timeoutId);
    }
  }, [focusedTaskId, scrollToTask]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <ScrollContext.Provider value={{
      focusedTaskId,
      setFocusedTaskId,
      scrollToTask,
      registerTaskRef,
      unregisterTaskRef,
      highlightTask,
      isScrolling,
      lastScrolledTaskId,
    }}>
      {children}
    </ScrollContext.Provider>
  );
}

export function useScroll() {
  const context = useContext(ScrollContext);
  if (context === undefined) {
    throw new Error('useScroll must be used within a ScrollProvider');
  }
  return context;
} 