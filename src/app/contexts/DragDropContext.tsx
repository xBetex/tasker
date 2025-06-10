'use client'

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Client } from '@/types/types';

interface DragDropContextType {
  pinnedClients: string[];
  setPinnedClients: (clients: string[]) => void;
  togglePinClient: (clientId: string) => void;
  reorderClients: (clients: Client[], activeId: string, overId: string) => Client[];
  isDragging: boolean;
  activeClient: Client | null;
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined);

export function DragDropProvider({ children }: { children: React.ReactNode }) {
  const [pinnedClients, setPinnedClients] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [activeClient, setActiveClient] = useState<Client | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load pinned clients from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('pinnedClients');
    if (saved) {
      setPinnedClients(JSON.parse(saved));
    }
  }, []);

  // Save pinned clients to localStorage
  React.useEffect(() => {
    localStorage.setItem('pinnedClients', JSON.stringify(pinnedClients));
  }, [pinnedClients]);

  const togglePinClient = useCallback((clientId: string) => {
    setPinnedClients(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  }, []);

  const reorderClients = useCallback((clients: Client[], activeId: string, overId: string) => {
    const activeIndex = clients.findIndex(client => client.id === activeId);
    const overIndex = clients.findIndex(client => client.id === overId);
    
    if (activeIndex !== -1 && overIndex !== -1) {
      return arrayMove(clients, activeIndex, overIndex);
    }
    
    return clients;
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    const { active } = event;
    // Find the active client from the available clients
    // This would need to be passed down or managed differently
    setActiveClient(null); // For now, we'll handle this in the component using the context
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setActiveClient(null);
  };

  return (
    <DragDropContext.Provider value={{
      pinnedClients,
      setPinnedClients,
      togglePinClient,
      reorderClients,
      isDragging,
      activeClient,
    }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {children}
      </DndContext>
    </DragDropContext.Provider>
  );
}

export function useDragDrop() {
  const context = useContext(DragDropContext);
  if (context === undefined) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
}

// Sortable Context Component for easier usage
export function SortableClientsProvider({ 
  children, 
  items 
}: { 
  children: React.ReactNode;
  items: string[];
}) {
  return (
    <SortableContext items={items} strategy={verticalListSortingStrategy}>
      {children}
    </SortableContext>
  );
} 