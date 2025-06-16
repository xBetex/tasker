'use client'

import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';
import ImageRenderer from '@/components/ImageRenderer';

export default function TestClipboardPage() {
  const [testText, setTestText] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleImageUploaded = (url: string) => {
    setTestText(prev => prev + (prev ? '\n\n' : '') + url);
    setUploadedImages(prev => [...prev, url]);
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--primary-text)' }}>
          📋 Clipboard Image Capture Test
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Instructions */}
          <div className="space-y-6">
            <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--primary-text)' }}>
                🧪 How to Test Clipboard Images
              </h2>
              <div className="space-y-3 text-sm" style={{ color: 'var(--secondary-text)' }}>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">1.</span>
                  <span><strong>Screenshot:</strong> Press Win+Shift+S (Windows) or Cmd+Shift+4 (Mac) to take a screenshot</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">2.</span>
                  <span><strong>Copy Web Image:</strong> Right-click any image online → "Copy image"</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">3.</span>
                  <span><strong>Copy File:</strong> Right-click an image file → "Copy"</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">4.</span>
                  <span><strong>Paste Here:</strong> Click in the text area below and press Ctrl+V</span>
                </div>
              </div>
            </div>

            {/* Upload Stats */}
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--primary-text)' }}>
                📊 Upload Statistics
              </h3>
              <div className="text-sm" style={{ color: 'var(--secondary-text)' }}>
                <p>Images uploaded: <span className="font-mono text-green-600">{uploadedImages.length}</span></p>
                <p>Total characters: <span className="font-mono text-blue-600">{testText.length}</span></p>
              </div>
            </div>
          </div>

          {/* Test Area */}
          <div className="space-y-6">
            <div className="p-6 rounded-lg border comments-section" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--primary-text)' }}>
                📝 Test Area
              </h2>
              
              <div className="space-y-4">
                <textarea
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="Click here and paste images with Ctrl+V..."
                  className="w-full h-32 px-3 py-2 text-sm rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: 'var(--input-background)',
                    borderColor: 'var(--input-border)',
                    color: 'var(--input-text)'
                  }}
                />
                
                <div className="flex justify-between items-center">
                  <ImageUpload 
                    onImageUploaded={handleImageUploaded}
                    disabled={false}
                  />
                  <button
                    onClick={() => {
                      setTestText('');
                      setUploadedImages([]);
                    }}
                    className="px-3 py-1 text-xs rounded-md font-medium transition-colors border"
                    style={{
                      backgroundColor: 'var(--card-background)',
                      borderColor: 'var(--card-border)',
                      color: 'var(--secondary-text)'
                    }}
                  >
                    🗑️ Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Area */}
            {testText && (
              <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--primary-text)' }}>
                  👀 Preview (How images will appear in comments)
                </h3>
                <div className="prose max-w-none" style={{ color: 'var(--primary-text)' }}>
                  <ImageRenderer text={testText} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Uploads */}
        {uploadedImages.length > 0 && (
          <div className="mt-8 p-6 rounded-lg border" style={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--primary-text)' }}>
              📸 Recent Uploads
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {uploadedImages.map((url, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={url} 
                    alt={`Upload ${index + 1}`}
                    className="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ borderColor: 'var(--card-border)' }}
                    onClick={() => window.open(url, '_blank')}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 text-white text-xs bg-black/60 px-2 py-1 rounded">
                      Click to view
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 