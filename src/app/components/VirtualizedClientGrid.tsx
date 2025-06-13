'use client'

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useVirtualization } from '../hooks/useVirtualization';
import SortableClientCard from './SortableClientCard';
import { DragOverlaySkeleton } from './SkeletonLoaders';
import { Client } from '@/types/types';
import { useDragDrop } from '../contexts/DragDropContext';
import { useToast } from '../hooks/useToast';
import { useVirtualizedContextMenu } from '../hooks/useVirtualizedContextMenu';

interface VirtualizedClientGridProps {
  clients: Client[];
  expandedCards: Record<string, boolean>;
  onToggleExpand: (clientId: string) => void;
  onUpdate: () => void;
  onDeleteTask: (clientId: string, taskIndex: number) => void;
  onShowDetails: (client: Client) => void;
  darkMode: boolean;
  containerHeight: number;
}

export default function VirtualizedClientGrid({
  clients,
  expandedCards,
  onToggleExpand,
  onUpdate,
  onDeleteTask,
  onShowDetails,
  darkMode,
  containerHeight = 600,
}: VirtualizedClientGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [orderedClients, setOrderedClients] = useState<Client[]>(clients);
  const { pinnedClients, reorderClients } = useDragDrop();
  const toast = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive items per row with preference for 3 columns
  const [itemsPerRow, setItemsPerRow] = useState(3);
  const [optimalHeight, setOptimalHeight] = useState(containerHeight);

  useEffect(() => {
    const updateLayout = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        
        // Force 3x3 grid layout as requested by user
        let calculatedItemsPerRow = 3;
        if (containerWidth < 640) {
          calculatedItemsPerRow = 1; // Mobile: 1 column
        } else if (containerWidth < 900) {
          calculatedItemsPerRow = 2; // Small tablet: 2 columns  
        } else {
          calculatedItemsPerRow = 3; // Desktop and larger: 3 columns (3x3 grid)
        }
        
        setItemsPerRow(calculatedItemsPerRow);

        // Calculate optimal height to show at least 9 cards
        const baseItemHeight = 280;
        const minRowsForNineCards = Math.ceil(9 / calculatedItemsPerRow);
        const minHeightForNineCards = minRowsForNineCards * baseItemHeight;
        
        // Calculate available viewport height - use almost all screen space
        const viewportHeight = window.innerHeight;
        const headerHeight = 200; // Reduced header space estimate
        const footerMargin = 20; // Minimal bottom margin
        const maxAvailableHeight = viewportHeight - headerHeight - footerMargin;
        
        // Use maximum available space or minimum for 9 cards, whichever is larger
        const finalHeight = Math.max(maxAvailableHeight, minHeightForNineCards);
        
        setOptimalHeight(finalHeight);
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  // Base height for virtualization - optimized for 3x3 grid
  const baseItemHeight = 280;  // Reduced from 320px to 280px for more compact layout

  useEffect(() => {
    setOrderedClients(clients);
  }, [clients]);

  const {
    visibleItems,
    totalHeight,
    containerProps,
    contentProps,
    scrollToItem,
    scrollTop,
  } = useVirtualization(
    orderedClients, 
    {
      itemHeight: baseItemHeight, // Fixed height - no expansion
      containerHeight: optimalHeight, // Use optimal height for 9+ cards visibility
      overscan: 3,
      itemsPerRow,
    }
  );

  // Handle context menu positioning for virtualized content
  useVirtualizedContextMenu({
    containerRef,
    scrollTop,
  });

  // Drag and drop sensors - optimized for virtualization
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
        delay: 0,
        tolerance: 2,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over?.id && over?.id) {
      const oldIndex = orderedClients.findIndex(client => client.id === active.id);
      const newIndex = orderedClients.findIndex(client => client.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newOrderedClients = arrayMove(orderedClients, oldIndex, newIndex);
        setOrderedClients(newOrderedClients);
        reorderClients(orderedClients, active.id as string, over.id as string);
        
        // Scroll to maintain visual context
        const targetRow = Math.floor(newIndex / itemsPerRow);
        const currentRow = Math.floor(oldIndex / itemsPerRow);
        if (Math.abs(targetRow - currentRow) > 2) {
          scrollToItem(newIndex);
        }
        
        toast.success('Reordered', 'Client order updated!');
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeClient = activeId ? orderedClients.find(client => client.id === activeId) : null;

  return (
    <div ref={containerRef} className="w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext 
          items={orderedClients.map(client => client.id)} 
          strategy={rectSortingStrategy}
        >
          <div 
            {...containerProps} 
            className="overflow-auto infinity-pool-container"
            style={{
              ...containerProps.style,
              padding: '8px',
              backgroundColor: 'transparent', // Prevent black background
              height: optimalHeight, // Use optimal height for better visibility
              maxHeight: optimalHeight, // Ensure it doesn't exceed optimal height
            }}
          >
            <div 
              {...contentProps} 
              className="relative"
              style={{
                ...contentProps.style,
                backgroundColor: 'transparent',
              }}
            >
              {visibleItems.map(({ item: client, virtualItem }) => {
                const columnWidth = 100 / itemsPerRow;
                const gapSize = 8;
                const leftPosition = virtualItem.column * columnWidth;
                const topMargin = 4;
                const bottomMargin = 4;
                
                // Fixed height for clean layout - no expansion
                const cardHeight = baseItemHeight - topMargin - bottomMargin;
                
                return (
                  <div
                    key={client.id}  
                    className="infinity-pool-item"
                    style={{
                      position: 'absolute',
                      top: virtualItem.start + topMargin,
                      left: `calc(${leftPosition}% + ${gapSize}px)`,
                      width: `calc(${columnWidth}% - ${gapSize * 2}px)`,
                      height: cardHeight,
                      zIndex: 2,
                      transform: 'translateZ(0)',
                      pointerEvents: 'auto',
                    }}
                  >
                    <SortableClientCard
                      client={client}
                      isExpanded={false} // Always collapsed in Infinity Pool
                      onToggleExpand={() => onShowDetails(client)} // Redirect expansion to details modal
                      onUpdate={onUpdate}
                      onDeleteTask={onDeleteTask}
                      onShowDetails={onShowDetails}
                      darkMode={darkMode}
                      isPinned={pinnedClients.includes(client.id)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </SortableContext>
        
        <DragOverlay
          dropAnimation={{
            duration: 120,
            easing: 'ease-out',
          }}
        >
          {activeClient ? (
            <div className="opacity-95 transform scale-105 shadow-2xl">
              <SortableClientCard
                client={activeClient}
                isExpanded={false} // Always collapsed in overlay for better performance
                onToggleExpand={() => {}}
                onUpdate={() => {}}
                onDeleteTask={() => {}}
                onShowDetails={() => {}}
                darkMode={darkMode}
                isPinned={pinnedClients.includes(activeClient.id)}
              />
            </div>
          ) : (
            <DragOverlaySkeleton />
          )}
        </DragOverlay>
      </DndContext>

      {/* Virtual scroll indicator */}
      {orderedClients.length > 0 && (
        <div className={`text-center mt-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span>
              Showing {visibleItems.length} of {orderedClients.length} clients
            </span>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                ♾️ Infinity Pool
              </span>
              <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                ⚡ {Math.round((1 - visibleItems.length / orderedClients.length) * 100)}% faster
              </span>
              <span className="px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                📋 Details Mode
              </span>
              <span className="px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                📐 9+ Cards View
              </span>
            </div>
          </div>
          <div className="text-xs mt-1 opacity-75">
            Full-screen view • Compact cards layout • Click cards to view details • Only visible items rendered
          </div>
        </div>
      )}
    </div>
  );
} 