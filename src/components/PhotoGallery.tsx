import React, { useState } from 'react';
import { Task } from '../types/types';

interface PhotoGalleryProps {
  task: Task;
  onPhotosUpdate?: (photos: Task['attachments']) => void;
  readonly?: boolean;
  darkMode?: boolean;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ 
  task, 
  onPhotosUpdate, 
  readonly = false,
  darkMode = false 
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const photos = task.attachments?.filter(att => att.type === 'image') || [];

  const handleFileUpload = async (files: FileList) => {
    if (!files.length || readonly) return;
    
    setUploadingPhotos(true);
    const newPhotos: Task['attachments'] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          continue;
        }
        
        // Create a local URL for preview (in real app, you'd upload to server)
        const url = URL.createObjectURL(file);
        
        const newPhoto = {
          id: `photo_${Date.now()}_${i}`,
          filename: file.name,
          url,
          type: 'image' as const,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'current_user' // In real app, get from auth context
        };
        
        newPhotos.push(newPhoto);
      }
      
      const updatedAttachments = [...(task.attachments || []), ...newPhotos];
      onPhotosUpdate?.(updatedAttachments);
      
    } catch (error) {
      console.error('Error uploading photos:', error);
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    if (readonly) return;
    
    const updatedAttachments = task.attachments?.filter(att => att.id !== photoId) || [];
    onPhotosUpdate?.(updatedAttachments);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (photos.length === 0 && readonly) {
    return null;
  }

  return (
    <div 
      className="mt-4"
      style={{ color: 'var(--primary-text)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">📸 Photo Attachments ({photos.length})</h4>
        
        {!readonly && (
          <div className="relative">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploadingPhotos}
            />
            <button
              className="px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: 'var(--primary-button)',
                color: 'white'
              }}
              disabled={uploadingPhotos}
              onMouseEnter={(e) => {
                if (!uploadingPhotos) {
                  e.currentTarget.style.backgroundColor = 'var(--primary-button-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!uploadingPhotos) {
                  e.currentTarget.style.backgroundColor = 'var(--primary-button)';
                }
              }}
            >
              {uploadingPhotos ? '⏳ Uploading...' : '📎 Add Photos'}
            </button>
          </div>
        )}
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo, index) => (
            <div 
              key={photo.id}
              className="relative group rounded-lg overflow-hidden border cursor-pointer transition-transform hover:scale-105"
              style={{ borderColor: 'var(--card-border)' }}
              onClick={() => setSelectedPhoto(index)}
            >
              <img
                src={photo.url}
                alt={photo.filename}
                className="w-full h-24 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNmMtMi4yMSAwLTQtMS43OS00LTRzMS43OS00IDQtNCA0IDEuNzkgNCA0LTEuNzkgNC00IDR6IiBmaWxsPSIjOWNhM2FmIi8+Cjx0ZXh0IHg9IjEyIiB5PSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSI4IiBmaWxsPSIjNmI3Mjg5Ij7wn5OACEVSRU9SPC90ZXh0Pgo8L3N2Zz4=';
                }}
              />
              
              {!readonly && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePhoto(photo.id);
                  }}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-600 hover:bg-red-700 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              )}
              
              <div 
                className="absolute bottom-0 left-0 right-0 p-1 text-xs truncate"
                style={{ 
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: 'white'
                }}
              >
                {photo.filename}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Screen Photo Modal */}
      {selectedPhoto !== null && photos[selectedPhoto] && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-4xl w-full h-full flex flex-col">
            {/* Header */}
            <div 
              className="flex items-center justify-between p-4"
              style={{ color: 'white' }}
            >
              <div>
                <h3 className="font-medium">{photos[selectedPhoto].filename}</h3>
                <p className="text-sm opacity-75">
                  {formatFileSize(photos[selectedPhoto].size)} • 
                  {new Date(photos[selectedPhoto].uploadedAt).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedPhoto(prev => prev! > 0 ? prev! - 1 : photos.length - 1)}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-white"
                  disabled={photos.length <= 1}
                >
                  ← Prev
                </button>
                <span className="text-sm opacity-75">
                  {selectedPhoto + 1} / {photos.length}
                </span>
                <button
                  onClick={() => setSelectedPhoto(prev => prev! < photos.length - 1 ? prev! + 1 : 0)}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-white"
                  disabled={photos.length <= 1}
                >
                  Next →
                </button>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white"
                >
                  ✕ Close
                </button>
              </div>
            </div>
            
            {/* Image */}
            <div className="flex-1 flex items-center justify-center p-4">
              <img
                src={photos[selectedPhoto].url}
                alt={photos[selectedPhoto].filename}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNmI3Mjg5Ij7wn5OAIEVSUE9SPC90ZXh0Pgo8L3N2Zz4=';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 