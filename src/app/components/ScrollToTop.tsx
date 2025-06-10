'use client'

import { useScrollPosition } from '../hooks/useScrollPosition';
import { ChevronUpIcon } from './Icons';

interface ScrollToTopProps {
  threshold?: number;
  darkMode?: boolean;
}

export default function ScrollToTop({ threshold = 300, darkMode = false }: ScrollToTopProps) {
  const { showScrollToTop, scrollToTop } = useScrollPosition(threshold);

  if (!showScrollToTop) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 scroll-to-top gpu-accelerated"
      style={{
        backgroundColor: 'var(--primary-button)',
        color: 'white'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--primary-button-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--primary-button)';
      }}
      title="Scroll to top"
      aria-label="Scroll to top"
    >
      <ChevronUpIcon size={20} />
    </button>
  );
} 