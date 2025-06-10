import { useState, useEffect, useCallback, useMemo } from 'react';

interface VirtualizationOptions {
  baseItemHeight: number;
  expandedItemHeight: number;
  containerHeight: number;
  overscan?: number;
  itemsPerRow?: number;
}

interface ItemWithTasks {
  id: string;
  tasks: Array<{ description: string; [key: string]: any }>;
}

interface VirtualItem {
  index: number;
  start: number;
  end: number;
  row: number;
  column: number;
  height: number;
}

export function useVirtualizationDynamic<T extends ItemWithTasks>(
  items: T[],
  options: VirtualizationOptions,
  expandedItems: Record<string, boolean>, // Track which items are expanded
  getItemId: (item: T) => string // Function to get item ID
) {
  const { 
    baseItemHeight, 
    expandedItemHeight, 
    containerHeight, 
    overscan = 6, 
    itemsPerRow = 3 
  } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const gap = 32; // Gap between rows - balanced for many tasks

  // Calculate row heights based on expanded items in each row
  const rowsData = useMemo(() => {
    const totalRows = Math.ceil(items.length / itemsPerRow);
    const rows: Array<{ height: number; start: number; end: number }> = [];
    let currentTop = 0;

    for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
      // Calculate row height based on the tallest expanded item in the row
      let rowHeight = baseItemHeight;
      
      for (let col = 0; col < itemsPerRow; col++) {
        const itemIndex = rowIndex * itemsPerRow + col;
        if (itemIndex >= items.length) break;
        
        const item = items[itemIndex];
        const itemId = getItemId(item);
        
        if (expandedItems[itemId]) {
          // Calculate height based on actual content
          const taskCount = item.tasks.length;
          const hasLongTasks = item.tasks.some(task => task.description.length > 80);
          
          let calculatedHeight = 420; // Base expanded height (increased for icons)
          
          // Calculate height based on actual task count - no artificial limit
          if (taskCount <= 3) {
            calculatedHeight += taskCount * 55; // Normal height for few tasks
          } else if (taskCount <= 6) {
            calculatedHeight += taskCount * 60; // Slightly more per task for medium count
          } else {
            calculatedHeight += taskCount * 65; // More height per task for many tasks
          }
          
          if (hasLongTasks) {
            calculatedHeight += 120; // Extra space for long descriptions and icons
          }
          
          // Add extra space for add task button and icons
          calculatedHeight += 80;
          
          // The row height is determined by the tallest expanded card - increased limit
          const finalHeight = Math.min(calculatedHeight, 900);
          rowHeight = Math.max(rowHeight, finalHeight);
          
          // Temporary debug for many tasks
          if (taskCount > 6) {
            console.log(`Card with ${taskCount} tasks: calculated=${calculatedHeight}px, final=${finalHeight}px`);
          }
        }
      }

      rows.push({
        height: rowHeight,
        start: currentTop,
        end: currentTop + rowHeight
      });

      currentTop += rowHeight + gap;
    }

    return rows;
  }, [items, itemsPerRow, baseItemHeight, expandedItemHeight, expandedItems, getItemId, gap]);

  const totalHeight = rowsData.length > 0 ? 
    rowsData[rowsData.length - 1].end + gap + 200 : 100; // Add more padding at bottom to prevent overlap

  // Find visible rows
  const visibleRange = useMemo(() => {
    const startRow = Math.max(0, 
      rowsData.findIndex(row => row.end > scrollTop) - overscan
    );
    let endRow = rowsData.findIndex(row => row.start > scrollTop + containerHeight);
    
    // Ensure we always render the last few rows if we're near the end
    if (endRow === -1 || endRow >= rowsData.length - 2) {
      endRow = rowsData.length - 1;
    } else {
      endRow = Math.min(rowsData.length - 1, endRow + overscan);
    }

    return {
      startRow: startRow === -1 ? 0 : startRow,
      endRow: endRow
    };
  }, [scrollTop, containerHeight, rowsData, overscan]);

  const visibleItems = useMemo(() => {
    const visible: Array<{ item: T; virtualItem: VirtualItem }> = [];
    
    for (let rowIndex = visibleRange.startRow; rowIndex <= visibleRange.endRow; rowIndex++) {
      const rowData = rowsData[rowIndex];
      if (!rowData) continue;

      for (let col = 0; col < itemsPerRow; col++) {
        const itemIndex = rowIndex * itemsPerRow + col;
        if (itemIndex >= items.length) break;
        
        const item = items[itemIndex];
        
        visible.push({
          item,
          virtualItem: {
            index: itemIndex,
            start: rowData.start,
            end: rowData.end,
            row: rowIndex,
            column: col,
            height: rowData.height
          }
        });
      }
    }
    
    return visible;
  }, [items, itemsPerRow, rowsData, visibleRange]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const scrollToItem = useCallback((index: number) => {
    const row = Math.floor(index / itemsPerRow);
    if (rowsData[row]) {
      const targetScrollTop = rowsData[row].start;
      setScrollTop(targetScrollTop);
      return targetScrollTop;
    }
    return scrollTop;
  }, [itemsPerRow, rowsData, scrollTop]);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    scrollToItem,
    scrollTop,
    containerProps: {
      style: {
        height: containerHeight,
        overflow: 'auto' as const,
      },
      onScroll: handleScroll,
    },
    contentProps: {
      style: {
        height: totalHeight,
        position: 'relative' as const,
      },
    },
  };
} 