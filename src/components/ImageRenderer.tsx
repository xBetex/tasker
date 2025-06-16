'use client'

import React from 'react';

interface ImageRendererProps {
  text: string;
  searchTerm?: string;
}

export default function ImageRenderer({ text, searchTerm = '' }: ImageRendererProps) {
  const imageUrlPattern = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|svg)|\/uploads\/[^\s]+)/gi;
  const parts = text.split(imageUrlPattern);
  
  return (
    <>
      {parts.map((part, index) => {
        if (part.match(imageUrlPattern)) {
          const fileName = part.includes('/uploads/') ? 'Uploaded Image' : (part.split('/').pop()?.split('?')[0] || 'Image');
          return (
            <div key={index} className="my-2">
              <div className="text-xs mb-1 flex items-center gap-2" style={{ color: 'var(--secondary-text)' }}>
                <span>📸 {fileName}</span>
                <a href={part} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                  View full size
                </a>
              </div>
              <img 
                src={part} 
                alt={fileName}
                className="max-w-xs max-h-48 object-cover rounded border cursor-pointer hover:opacity-90 transition-opacity"
                style={{ borderColor: 'var(--card-border)' }}
                onClick={() => window.open(part, '_blank')}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.error-message')) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'text-xs text-red-500 italic error-message';
                    errorDiv.textContent = '❌ Image failed to load';
                    parent.appendChild(errorDiv);
                  }
                }}
              />
            </div>
          );
        }
        
        // Handle search highlighting
        if (searchTerm && part.toLowerCase().includes(searchTerm.toLowerCase())) {
          const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
          const highlightedParts = part.split(regex);
          return (
            <span key={index}>
              {highlightedParts.map((chunk, chunkIndex) => 
                regex.test(chunk) ? (
                  <mark key={chunkIndex} style={{ backgroundColor: 'yellow', color: 'black' }}>
                    {chunk}
                  </mark>
                ) : chunk
              )}
            </span>
          );
        }
        
        return <span key={index}>{part}</span>;
      })}
    </>
  );
} 