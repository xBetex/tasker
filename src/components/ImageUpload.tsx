'use client'

import { useState, useRef, useEffect } from 'react';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  disabled?: boolean;
}

export default function ImageUpload({ onImageUploaded, disabled = false }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const hiddenTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Set up global paste listener when component mounts
  useEffect(() => {
    const handleGlobalPaste = async (e: ClipboardEvent) => {
      // Only handle paste if we're in a comment area or our component is focused
      const activeElement = document.activeElement;
      const isInCommentArea = activeElement?.closest('.comments-section') || 
                             activeElement?.tagName === 'TEXTAREA' ||
                             activeElement?.getAttribute('contenteditable') === 'true';
      
      if (!isInCommentArea || disabled) return;

      const items = Array.from(e.clipboardData?.items || []);
      const imageItem = items.find(item => item.type.startsWith('image/'));
      
      if (imageItem) {
        e.preventDefault();
        await handleImageFromClipboard(imageItem);
      }
    };

    // Add global paste listener
    document.addEventListener('paste', handleGlobalPaste);
    
    return () => {
      document.removeEventListener('paste', handleGlobalPaste);
    };
  }, [disabled]);

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }
    
    const data = await response.json();
    return data.url;
  };

  const handleImageFromClipboard = async (imageItem: DataTransferItem) => {
    if (disabled) return;
    
    setIsUploading(true);
    
    try {
      const file = imageItem.getAsFile();
      if (file) {
        const imageUrl = await uploadImage(file);
        onImageUploaded(imageUrl);
        
        // Show success feedback
        const notification = document.createElement('div');
        notification.textContent = '✅ Image pasted and uploaded!';
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #10b981;
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          z-index: 10000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
      }
    } catch (error) {
      // Show error feedback
      const notification = document.createElement('div');
      notification.textContent = '❌ Failed to upload image from clipboard';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find(item => item.type.startsWith('image/'));
    
    if (imageItem && !disabled) {
      e.preventDefault();
      await handleImageFromClipboard(imageItem);
    }
  };

  const handleFileSelect = async () => {
    if (disabled) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsUploading(true);
        try {
          const imageUrl = await uploadImage(file);
          onImageUploaded(imageUrl);
        } catch (error) {
          alert('Failed to upload image. Please try again.');
        } finally {
          setIsUploading(false);
        }
      }
    };
    input.click();
  };

  return (
    <div className="flex items-center gap-2">
      {/* Hidden textarea for paste capture - not needed with global listener but kept as fallback */}
      <textarea
        ref={hiddenTextareaRef}
        onPaste={handlePaste}
        style={{ position: 'absolute', left: '-9999px', opacity: 0, height: '1px', width: '1px' }}
        tabIndex={-1}
        aria-hidden="true"
      />
      
      <button
        type="button"
        onClick={handleFileSelect}
        disabled={disabled || isUploading}
        className="px-2 py-1 text-xs rounded-md font-medium transition-colors border"
        style={{
          backgroundColor: 'var(--button-bg)',
          color: 'var(--button-text)',
          borderColor: 'var(--card-border)'
        }}
        title="Upload image file or paste from clipboard (Ctrl+V)"
      >
        {isUploading ? '📤 Uploading...' : '📷 Upload Image'}
      </button>
      
      {!isUploading && (
        <span className="text-xs" style={{ color: 'var(--secondary-text)' }}>
          📋 Paste images with Ctrl+V
        </span>
      )}
    </div>
  );
} 