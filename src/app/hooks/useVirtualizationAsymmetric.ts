import { useState, useEffect, useCallback, useMemo } from 'react';

interface VirtualizationOptions {
  baseItemHeight: number;
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
  left: number;
  width: number;
}

export function useVirtualizationAsymmetric<T extends ItemWithTasks>(
  items: T[],
  options: VirtualizationOptions,
  expandedItems: Record<string, boolean>,
  getItemId: (item: T) => string
) {
  const { 
    baseItemHeight, 
    containerHeight, 
    overscan = 3, 
    itemsPerRow = 3 
  } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const gap = 24; // Gap between items
  const columnWidth = 100 / itemsPerRow;

  // Calculate individual item heights and positions
  const itemsData = useMemo(() => {
    const itemsWithPositions: VirtualItem[] = [];
    const rowHeights: number[] = [];
    let currentRow = 0;
    let currentRowTop = 0;
    let maxHeightInRow = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemId = getItemId(item);
      const isExpanded = expandedItems[itemId];
      const column = i % itemsPerRow;
      const row = Math.floor(i / itemsPerRow);

      // Calculate individual item height
      let itemHeight = baseItemHeight;
      if (isExpanded) {
        const taskCount = item.tasks.length;
        const hasLongTasks = item.tasks.some(task => task.description.length > 80);
        
        itemHeight = 420; // Base expanded height
        
        // Scale height based on task count
        if (taskCount <= 3) {
          itemHeight += taskCount * 55;
        } else if (taskCount <= 6) {
          itemHeight += taskCount * 60;
        } else {
          itemHeight += taskCount * 65;
        }
        
        if (hasLongTasks) {
          itemHeight += 120;
        }
        
        itemHeight += 80; // Space for buttons and icons
        itemHeight = Math.min(itemHeight, 900); // Cap maximum height
      }

      // Track row progression
      if (row !== currentRow) {
        // New row - record previous row height and update position
        rowHeights.push(maxHeightInRow);
        currentRowTop += maxHeightInRow + gap;
        currentRow = row;
        maxHeightInRow = itemHeight;
      } else {
        // Same row - track max height
        maxHeightInRow = Math.max(maxHeightInRow, itemHeight);
      }

      // Calculate position
      const left = column * columnWidth;
      
      itemsWithPositions.push({
        index: i,
        start: currentRowTop,
        end: currentRowTop + maxHeightInRow,
        row,
        column,
        height: itemHeight,
        left,
        width: columnWidth,
      });
    }

    // Add the last row height
    if (rowHeights.length <= currentRow) {
      rowHeights.push(maxHeightInRow);
    }

    // Update all items in each row to have the correct end position
    itemsWithPositions.forEach((item, index) => {
      const rowHeight = rowHeights[item.row] || baseItemHeight;
      let rowTop = 0;
      for (let r = 0; r < item.row; r++) {
        rowTop += (rowHeights[r] || baseItemHeight) + gap;
      }
      item.start = rowTop;
      item.end = rowTop + rowHeight;
    });

    return { items: itemsWithPositions, rowHeights };
  }, [items, itemsPerRow, baseItemHeight, expandedItems, getItemId, gap, columnWidth]);

  const totalHeight = useMemo(() => {
    const totalRowHeight = itemsData.rowHeights.reduce((sum, height) => sum + height, 0);
    const totalGaps = (itemsData.rowHeights.length - 1) * gap;
    return totalRowHeight + totalGaps + 200; // Extra padding at bottom
  }, [itemsData.rowHeights, gap]);

  // Find visible items
  const visibleItems = useMemo(() => {
    const visible: Array<{ item: T; virtualItem: VirtualItem }> = [];
    
    for (const itemData of itemsData.items) {
      // Check if item is in visible range (with overscan)
      const itemBottom = itemData.end;
      const itemTop = itemData.start;
      
      if (itemBottom >= scrollTop - (overscan * 100) && 
          itemTop <= scrollTop + containerHeight + (overscan * 100)) {
        visible.push({
          item: items[itemData.index],
          virtualItem: itemData
        });
      }
    }
    
    return visible;
  }, [items, itemsData.items, scrollTop, containerHeight, overscan]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const scrollToItem = useCallback((index: number) => {
    const itemData = itemsData.items[index];
    if (itemData) {
      setScrollTop(itemData.start);
      return itemData.start;
    }
    return scrollTop;
  }, [itemsData.items, scrollTop]);

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