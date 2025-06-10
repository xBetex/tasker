'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface ScrollContextType {
  focusedTaskId: number | null;
  setFocusedTaskId: (taskId: number | null) => void;
  scrollToTask: (taskId: number) => void;
  registerTaskRef: (taskId: number, element: HTMLElement) => void;
  unregisterTaskRef: (taskId: number) => void;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const [focusedTaskId, setFocusedTaskId] = useState<number | null>(null);
  const [taskRefs, setTaskRefs] = useState<Map<number, HTMLElement>>(new Map());

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

  const scrollToTask = useCallback((taskId: number) => {
    const element = taskRefs.get(taskId);
    if (element) {
      // Scroll suave para o elemento
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
      
      // Adicionar destaque temporário
      element.classList.add('task-highlight');
      setTimeout(() => {
        element.classList.remove('task-highlight');
      }, 2000);
    }
  }, [taskRefs]);

  // Scroll para a tarefa focada após atualizações
  useEffect(() => {
    if (focusedTaskId) {
      const timeoutId = setTimeout(() => {
        scrollToTask(focusedTaskId);
        setFocusedTaskId(null); // Limpar após scroll
      }, 100); // Pequeno delay para garantir que o DOM foi atualizado
      
      return () => clearTimeout(timeoutId);
    }
  }, [focusedTaskId, scrollToTask]);

  return (
    <ScrollContext.Provider value={{
      focusedTaskId,
      setFocusedTaskId,
      scrollToTask,
      registerTaskRef,
      unregisterTaskRef
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