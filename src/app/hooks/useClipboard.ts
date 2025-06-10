import { useState } from 'react';

export function useClipboard() {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      
      return true;
    } catch (err) {
      console.error('Failed to copy text: ', err);
      
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
        
        return true;
      } catch (fallbackErr) {
        console.error('Fallback copy failed: ', fallbackErr);
        return false;
      }
    }
  };

  return { copyToClipboard, isCopied };
} 