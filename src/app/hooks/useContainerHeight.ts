import { useState, useEffect } from 'react';

export function useContainerHeight(
  offsetTop: number = 200, // Space for header, filters, etc.
  minHeight: number = 400
) {
  const [containerHeight, setContainerHeight] = useState(minHeight);

  useEffect(() => {
    const updateHeight = () => {
      const viewportHeight = window.innerHeight;
      const availableHeight = viewportHeight - offsetTop;
      const calculatedHeight = Math.max(minHeight, availableHeight - 100); // 100px bottom margin
      setContainerHeight(calculatedHeight);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    
    return () => window.removeEventListener('resize', updateHeight);
  }, [offsetTop, minHeight]);

  return containerHeight;
} 