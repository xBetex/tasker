import React, { forwardRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ClientCard from './ClientCard';
import { Client } from '@/types/types';
import { useDragDrop } from '../contexts/DragDropContext';

interface SortableClientCardProps {
  client: Client;
  onUpdate: () => void;
  onDeleteTask: (clientId: string, taskIndex: number) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  darkMode: boolean;
  onShowDetails?: (client: Client) => void;
  isPinned?: boolean;
  disableDrag?: boolean; // New prop to disable drag
}

// Pin icon component
function PinIcon({ isPinned, className = "" }: { isPinned: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {isPinned ? (
        <>
          <path d="M9 12l2 2 4-4" />
          <path d="M9 4a4 4 0 0 1 4 4c0 .8-.2 1.6-.6 2.2L21 19l-1.4 1.4L11 11.8c-.6.4-1.4.6-2.2.6a4 4 0 0 1-4-4c0-2.2 1.8-4 4-4z" />
        </>
      ) : (
        <>
          <path d="M9 12l2 2 4-4" />
          <path d="M9 4a4 4 0 0 1 4 4c0 .8-.2 1.6-.6 2.2L21 19l-1.4 1.4L11 11.8c-.6.4-1.4.6-2.2.6a4 4 0 0 1-4-4c0-2.2 1.8-4 4-4z" strokeDasharray="4 4" />
        </>
      )}
    </svg>
  );
}


// Drag handle component
function DragHandle({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="9" cy="5" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="15" cy="5" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="15" cy="19" r="1" />
    </svg>
  );
}

const SortableClientCard = forwardRef<HTMLDivElement, SortableClientCardProps>(
  ({ client, onUpdate, onDeleteTask, isExpanded, onToggleExpand, darkMode, onShowDetails, isPinned = false, disableDrag = false }, ref) => {
    const { pinnedClients, togglePinClient, isDragging } = useDragDrop();
    const isClientPinned = pinnedClients.includes(client.id);
    
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging: isSortableDragging,
    } = useSortable({ 
      id: client.id,
      disabled: disableDrag || isExpanded // Disable dragging when disableDrag prop is true or when expanded
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition: isSortableDragging ? 'none' : transition,
      zIndex: isSortableDragging ? 1000 : 'auto',
      opacity: isSortableDragging ? 0.9 : 1,
      willChange: isSortableDragging ? 'transform, opacity' : 'auto',
      pointerEvents: isSortableDragging ? ('none' as const) : ('auto' as const),
    };

    const handlePinToggle = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      togglePinClient(client.id);
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`relative group ${isSortableDragging ? 'cursor-grabbing dragging' : ''} ${isExpanded ? 'z-10' : ''}`}
      >
        {/* Pin indicator and controls */}
        <div className="absolute -top-2 -right-2 z-20 flex gap-1">
          {/* Pin button */}
          <button
            onClick={handlePinToggle}
            className={`
              p-1.5 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110
              ${isClientPinned 
                ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500' 
                : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-gray-700'
              }
              ${isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            `}
            title={isClientPinned ? 'Unpin client' : 'Pin client to top'}
          >
            <PinIcon isPinned={isClientPinned} className="w-4 h-4" />
          </button>

          {/* Drag handle - only show when not expanded and drag is enabled */}
          {!isExpanded && !disableDrag && (
            <button
              {...attributes}
              {...listeners}
              className={`
                p-1.5 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110
                bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                cursor-grab active:cursor-grabbing
                ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}
              `}
              title="Drag to reorder"
            >
              <DragHandle className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Pinned indicator badge */}
        {isClientPinned && (
          <div className="absolute -top-1 -left-1 z-20">
            <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
              📌 PINNED
            </div>
          </div>
        )}

        {/* Enhanced card styling for pinned items */}
        <div className={`
          ${isClientPinned ? 'ring-2 ring-yellow-400/30 ring-offset-2 dark:ring-offset-gray-900' : ''}
          ${isSortableDragging ? 'shadow-2xl scale-105' : ''}
          transition-all duration-300 rounded-lg
        `}>
          <ClientCard
            client={client}
            onUpdate={onUpdate}
            onDeleteTask={onDeleteTask}
            isExpanded={isExpanded}
            onToggleExpand={onToggleExpand}
            darkMode={darkMode}
            onShowDetails={onShowDetails}
          />
        </div>

        {/* Drag overlay effect */}
        {isSortableDragging && (
          <div className="absolute inset-0 bg-blue-500/10 border-2 border-blue-500/30 rounded-lg pointer-events-none" />
        )}
      </div>
    );
  }
);

SortableClientCard.displayName = 'SortableClientCard';

export default SortableClientCard; 