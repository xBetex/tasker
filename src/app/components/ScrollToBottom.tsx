'use client'

import { useScrollPosition } from '../hooks/useScrollPosition';
import { ChevronDownIcon } from './Icons';

interface ScrollToBottomProps {
  threshold?: number;
  darkMode?: boolean;
}

export default function ScrollToBottom({ threshold = 300, darkMode = false }: ScrollToBottomProps) {
  const { showScrollToBottom, scrollToBottom } = useScrollPosition(threshold);

  if (!showScrollToBottom) return null;

  return (
    <button
      onClick={scrollToBottom}
      className="fixed bottom-6 right-20 z-50 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 scroll-to-bottom gpu-accelerated"
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
      title="Scroll to bottom"
      aria-label="Scroll to bottom"
    >
      <ChevronDownIcon size={20} />
    </button>
  );
} 