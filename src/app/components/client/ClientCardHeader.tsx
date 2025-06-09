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
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={editData.name}
              onChange={onInputChange}
              className={`text-xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none w-full ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            />
          ) : (
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {client.name}
            </h3>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {isExpanded && !isEditing && (
            <button
              onClick={onStartEdit}
              className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              title="Edit client"
            >
              <EditIcon />
            </button>
          )}
          
          {isExpanded && !isEditing && (
            <button
              onClick={onDeleteClient}
              className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
              title="Delete client"
            >
              <TrashIcon />
            </button>
          )}
          
          {isExpanded && !isEditing && onShowDetails && (
            <button
              onClick={() => onShowDetails(client)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Details
            </button>
          )}
          
          <button
            onClick={onToggleExpand}
            className={`p-2 rounded-full transition-colors ${
              isExpanded
                ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-400'
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-400'
            }`}
            title={isExpanded ? 'Collapse tasks' : 'View tasks'}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>
      
      {isEditing && (
        <div className="mb-4">
          <input
            type="text"
            name="company"
            placeholder="Company"
            value={editData.company}
            onChange={onInputChange}
            className={`w-full p-2 border rounded-lg mb-2 ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
          <input
            type="text"
            name="origin"
            placeholder="Origin"
            value={editData.origin}
            onChange={onInputChange}
            className={`w-full p-2 border rounded-lg ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
          
          <div className="flex space-x-2 mt-4">
            <button
              onClick={onSaveAndExitEdit}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={onCancelEdit}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 