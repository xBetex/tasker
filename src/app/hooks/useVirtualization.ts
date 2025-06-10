import { useState, useEffect, useCallback, useMemo } from 'react';

interface VirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  itemsPerRow?: number;
}

interface VirtualItem {
  index: number;
  start: number;
  end: number;
  row: number;
  column: number;
}

export function useVirtualization<T>(
  items: T[],
  options: VirtualizationOptions
) {
  const { itemHeight, containerHeight, overscan = 8, itemsPerRow = 3 } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const rowHeight = itemHeight + 32; // itemHeight + gap (optimized for fixed height layout)
  const totalRows = Math.ceil(items.length / itemsPerRow);
  const totalHeight = totalRows * rowHeight;

  const visibleRows = Math.ceil(containerHeight / rowHeight);
  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endRow = Math.min(totalRows - 1, startRow + visibleRows + overscan * 2);

  const visibleItems = useMemo(() => {
    const visible: Array<{ item: T; virtualItem: VirtualItem }> = [];
    
    for (let row = startRow; row <= endRow; row++) {
      for (let col = 0; col < itemsPerRow; col++) {
        const index = row * itemsPerRow + col;
        if (index >= items.length) break;
        
        visible.push({
          item: items[index],
          virtualItem: {
            index,
            start: row * rowHeight,
            end: (row + 1) * rowHeight,
            row,
            column: col
          }
        });
      }
    }
    
    return visible;
  }, [items, startRow, endRow, itemsPerRow, rowHeight]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const scrollToItem = useCallback((index: number) => {
    const row = Math.floor(index / itemsPerRow);
    const targetScrollTop = row * rowHeight;
    setScrollTop(targetScrollTop);
    return targetScrollTop;
  }, [itemsPerRow, rowHeight]);

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