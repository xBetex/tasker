import { useEffect, useRef } from 'react';

interface UseVirtualizedContextMenuProps {
  containerRef: React.RefObject<HTMLDivElement>;
  scrollTop: number;
}

export function useVirtualizedContextMenu({ 
  containerRef, 
  scrollTop 
}: UseVirtualizedContextMenuProps) {
  
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Check if the context menu is within our virtualized container
      if (containerRef.current?.contains(e.target as Node)) {
        // Store original event coordinates before any modifications
        const originalClientY = e.clientY;
        
        // Override the MouseEvent to adjust for scroll position
        Object.defineProperty(e, 'clientY', {
          value: originalClientY,
          writable: false,
          configurable: true
        });
        
        // Ensure the coordinates are relative to viewport, not virtual container
        Object.defineProperty(e, 'pageY', {
          value: originalClientY + window.pageYOffset,
          writable: false,
          configurable: true
        });
      }
    };

    // Add event listener with capture phase to intercept before other handlers
    document.addEventListener('contextmenu', handleContextMenu, true);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, [containerRef, scrollTop]);

  // Helper function to adjust coordinates for virtualized context
  const adjustCoordinatesForVirtualization = (clientX: number, clientY: number) => {
    return {
      x: clientX,
      y: clientY // Keep original coordinates since we handle scroll offset elsewhere
    };
  };

  return {
    adjustCoordinatesForVirtualization
  };
} 