'use client'

import { useClipboard } from '../hooks/useClipboard';
import { useToast } from '../hooks/useToast';
import { CopyIcon } from './Icons';

interface CopyButtonProps {
  text: string;
  successMessage?: string;
  errorMessage?: string;
  size?: number;
  className?: string;
  title?: string;
}

export default function CopyButton({ 
  text, 
  successMessage = 'Copied!', 
  errorMessage = 'Copy Failed',
  size = 12,
  className = '',
  title = 'Copy to clipboard'
}: CopyButtonProps) {
  const { copyToClipboard, isCopied } = useClipboard();
  const toast = useToast();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(text);
    if (success) {
      toast.success(successMessage, `"${text}" copied to clipboard`);
    } else {
      toast.error(errorMessage, 'Failed to copy to clipboard');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-1 rounded transition-all duration-200 hover:scale-110 ${isCopied ? 'copy-success' : ''} ${className}`}
      style={{ 
        color: isCopied ? 'var(--completed-color)' : 'var(--secondary-text)',
        backgroundColor: 'transparent'
      }}
      onMouseEnter={(e) => {
        if (!isCopied) {
          e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
          e.currentTarget.style.color = 'var(--primary-text)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isCopied) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--secondary-text)';
        }
      }}
      title={isCopied ? 'Copied!' : title}
      aria-label={title}
    >
      <CopyIcon size={size} />
    </button>
  );
} 