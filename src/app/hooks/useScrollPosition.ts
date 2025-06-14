import { useState, useEffect } from 'react';

export function useScrollPosition(threshold: number = 300) {
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Show scroll to top when scrolled down
      setShowScrollToTop(scrollTop > threshold);
      
      // Show scroll to bottom when not at bottom (with threshold)
      const isNearBottom = scrollTop + windowHeight >= documentHeight - threshold;
      setShowScrollToBottom(!isNearBottom && documentHeight > windowHeight + threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    // Check initial position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  return { showScrollToTop, showScrollToBottom, scrollToTop, scrollToBottom };
} 