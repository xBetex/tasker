import React from 'react';
import { Client } from '@/types/types';
import { EditIcon, TrashIcon } from '../Icons';

interface ClientCardHeaderProps {
  client: Client;
  editData: Client;
  isEditing: boolean;
  isExpanded: boolean;
  darkMode: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleExpand: () => void;
  onStartEdit: () => void;
  onSaveAndExitEdit: () => void;
  onCancelEdit: () => void;
  onDeleteClient: () => void;
  onShowDetails?: (client: Client) => void;
}

export default function ClientCardHeader({
  client,
  editData,
  isEditing,
  isExpanded,
  darkMode,
  onInputChange,
  onToggleExpand,
  onStartEdit,
  onSaveAndExitEdit,
  onCancelEdit,
  onDeleteClient,
  onShowDetails,
}: ClientCardHeaderProps) {
  return (
    <div className={`mb-4 client-header ${!isExpanded ? 'cursor-pointer' : ''}`}>
      {/* Client Information Display */}
      <div className="flex justify-between items-start mb-3 gap-3">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              {/* Nome */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--secondary-text)' }}>
                  NOME
                </label>
                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={onInputChange}
                  className="w-full text-lg font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none"
                  style={{ color: 'var(--primary-text)' }}
                />
              </div>
              
              {/* Company */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--secondary-text)' }}>
                  COMPANY
                </label>
                <input
                  type="text"
                  name="company"
                  value={editData.company}
                  onChange={onInputChange}
                  className="w-full p-2 border rounded-lg"
                  style={{
                    backgroundColor: 'var(--input-background)',
                    borderColor: 'var(--input-border)',
                    color: 'var(--input-text)'
                  }}
                />
              </div>
              
              {/* ID & Origin in same row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--secondary-text)' }}>
                    ID
                  </label>
                  <input
                    type="text"
                    name="id"
                    value={editData.id}
                    onChange={onInputChange}
                    className="w-full p-2 border rounded-lg text-sm"
                    style={{
                      backgroundColor: 'var(--input-background)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--input-text)'
                    }}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--secondary-text)' }}>
                    ORIGIN
                  </label>
                  <input
                    type="text"
                    name="origin"
                    value={editData.origin}
                    onChange={onInputChange}
                    className="w-full p-2 border rounded-lg text-sm"
                    style={{
                      backgroundColor: 'var(--input-background)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--input-text)'
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Nome - Principal */}
              <h3 className="text-xl sm:text-2xl font-bold truncate" style={{ color: 'var(--primary-text)' }}>
                {client.name}
              </h3>
              
              {/* Company - Secundário */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium opacity-70" style={{ color: 'var(--secondary-text)' }}>
                  COMPANY:
                </span>
                <span className="text-sm font-medium" style={{ color: 'var(--primary-text)' }}>
                  {client.company}
                </span>
              </div>
              
              {/* ID e Origin - Terciário */}
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <span className="font-medium opacity-70" style={{ color: 'var(--secondary-text)' }}>
                    ID:
                  </span>
                  <span className="font-mono bg-opacity-20 px-2 py-1 rounded text-xs" 
                        style={{ 
                          backgroundColor: 'var(--card-background-hover)', 
                          color: 'var(--primary-text)' 
                        }}>
                    {client.id}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium opacity-70" style={{ color: 'var(--secondary-text)' }}>
                    ORIGIN:
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: 'var(--low-priority-bg)', 
                          color: 'var(--primary-text)' 
                        }}>
                    {client.origin}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          {isExpanded && !isEditing && (
            <button
              onClick={onStartEdit}
              className="p-1.5 sm:p-2 transition-colors rounded-lg"
              style={{ 
                color: 'var(--secondary-text)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                e.currentTarget.style.color = 'var(--primary-button)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--secondary-text)';
              }}
              title="Edit client"
            >
              <EditIcon />
            </button>
          )}
          
          {isExpanded && !isEditing && (
            <button
              onClick={onDeleteClient}
              className="p-1.5 sm:p-2 transition-colors rounded-lg"
              style={{ 
                color: 'var(--secondary-text)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                e.currentTarget.style.color = 'var(--danger-button)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--secondary-text)';
              }}
              title="Delete client"
            >
              <TrashIcon />
            </button>
          )}
          
          {isExpanded && !isEditing && onShowDetails && (
            <button
              onClick={() => onShowDetails(client)}
              className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm text-white"
              style={{ backgroundColor: 'var(--primary-button)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary-button-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary-button)';
              }}
            >
              <span className="hidden sm:inline">Details</span>
              <span className="sm:hidden">📋</span>
            </button>
          )}
          
          <button
            onClick={onToggleExpand}
            className="p-1.5 sm:p-2 rounded-full transition-colors text-white"
            style={{
              backgroundColor: isExpanded ? 'var(--danger-button)' : 'var(--primary-button)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isExpanded ? 'var(--danger-button-hover)' : 'var(--primary-button-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isExpanded ? 'var(--danger-button)' : 'var(--primary-button)';
            }}
            title={isExpanded ? 'Collapse tasks' : 'View tasks'}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>
      
      {/* Edit Mode Action Buttons */}
      {isEditing && (
        <div className="flex space-x-3 mt-4 pt-3 border-t" style={{ borderColor: 'var(--card-border)' }}>
          <button
            onClick={onSaveAndExitEdit}
            className="flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium"
            style={{ backgroundColor: 'var(--completed-color)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            ✓ Save Changes
          </button>
          <button
            onClick={onCancelEdit}
            className="flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium"
            style={{ backgroundColor: 'var(--secondary-button)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--secondary-button-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--secondary-button)';
            }}
          >
            ✕ Cancel
          </button>
        </div>
      )}
    </div>
  );
} 