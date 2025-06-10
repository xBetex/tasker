'use client'

import { useRef, useEffect } from 'react';
import SortableClientCard from './SortableClientCard';
import { Client } from '@/types/types';

interface VirtualizedClientCardProps {
  client: Client;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: () => void;
  onDeleteTask: (clientId: string, taskIndex: number) => void;
  onShowDetails: (client: Client) => void;
  darkMode: boolean;
  isPinned: boolean;
  virtualTop: number; // Offset from virtualization
}

export default function VirtualizedClientCard({
  client,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onDeleteTask,
  onShowDetails,
  darkMode,
  isPinned,
  virtualTop,
}: VirtualizedClientCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Override the context menu positioning for virtualized cards
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (cardRef.current?.contains(e.target as Node)) {
        // Adjust mouse coordinates to account for virtual scrolling
        const adjustedEvent = new MouseEvent(e.type, {
          ...e,
          clientX: e.clientX,
          clientY: e.clientY + virtualTop, // Adjust for virtual offset
        });
        
        // Prevent the original event and dispatch the adjusted one
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu, true);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, [virtualTop]);

  return (
    <div ref={cardRef} className="virtualized-card-wrapper">
      <SortableClientCard
        client={client}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        onUpdate={onUpdate}
        onDeleteTask={onDeleteTask}
        onShowDetails={onShowDetails}
        darkMode={darkMode}
        isPinned={isPinned}
      />
    </div>
  );
} 