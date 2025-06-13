import React from 'react';
import { Task } from '@/types/types';
import { Client } from '@/types/types';

export type ClientTabType = 'active' | 'completed';

interface ClientTaskTabsProps {
  activeTab: ClientTabType;
  onTabChange: (tab: ClientTabType) => void;
  activeTasks: Task[];
  completedTasks: Task[];
  darkMode: boolean;
  client: Client;
  onUpdate: () => void;
  onBulkComplete?: () => void;
}

const ClientTaskTabs: React.FC<ClientTaskTabsProps> = ({
  activeTab,
  onTabChange,
  activeTasks,
  completedTasks,
  darkMode,
  client,
  onUpdate,
  onBulkComplete
}) => {
  const activeCount = activeTasks.length;
  const completedCount = completedTasks.length;

  return (
    <div className="mt-4 mb-3">
      {/* Full-width Tab Container */}
      <div className="flex w-full rounded-t-lg overflow-hidden shadow-sm border" 
           style={{ borderColor: 'var(--card-border)' }}>
        {/* Tab Ativa - Takes up exactly half the width */}
        <button
          onClick={() => onTabChange('active')}
          className={`
            flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 
            flex items-center justify-center gap-2 cursor-pointer relative
            ${activeTab === 'active' 
              ? (darkMode 
                ? 'bg-gray-700 text-white border-b-2 border-blue-400' 
                : 'bg-white text-gray-900 border-b-2 border-blue-500')
              : (darkMode 
                ? 'bg-gray-600 text-gray-300 hover:bg-gray-500 hover:text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800')
            }
          `}
          style={{
            backgroundColor: activeTab === 'active' ? 'var(--card-background)' : 'var(--card-background-hover)'
          }}
        >
          <span className="text-sm">🔥</span>
          <span className="font-semibold">Ativas</span>
          <span className={`
            px-2 py-1 text-xs rounded-full font-bold min-w-[24px] text-center
            ${activeTab === 'active' 
              ? (darkMode ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800')
              : (darkMode ? 'bg-gray-500 text-gray-300' : 'bg-gray-200 text-gray-600')
            }
          `}>
            {activeCount}
          </span>
        </button>

        {/* Tab Concluída - Takes up exactly half the width */}
        <button
          onClick={() => onTabChange('completed')}
          className={`
            flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 
            flex items-center justify-center gap-2 cursor-pointer relative
            ${activeTab === 'completed' 
              ? (darkMode 
                ? 'bg-gray-700 text-white border-b-2 border-green-400' 
                : 'bg-white text-gray-900 border-b-2 border-green-500')
              : (darkMode 
                ? 'bg-gray-600 text-gray-300 hover:bg-gray-500 hover:text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800')
            }
          `}
          style={{
            backgroundColor: activeTab === 'completed' ? 'var(--card-background)' : 'var(--card-background-hover)'
          }}
        >
          <span className="text-sm">✅</span>
          <span className="font-semibold">Concluídas</span>
          <span className={`
            px-2 py-1 text-xs rounded-full font-bold min-w-[24px] text-center
            ${activeTab === 'completed' 
              ? (darkMode ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800')
              : (darkMode ? 'bg-gray-500 text-gray-300' : 'bg-gray-200 text-gray-600')
            }
          `}>
            {completedCount}
          </span>
        </button>
      </div>

      {/* Active Tab Indicator - Enhanced */}
      <div className={`h-1 w-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} relative overflow-hidden`}>
        <div 
          className={`h-full transition-all duration-500 ease-in-out ${
            activeTab === 'completed' 
              ? (darkMode ? 'bg-green-400' : 'bg-green-500')
              : (darkMode ? 'bg-blue-400' : 'bg-blue-500')
          }`}
          style={{
            width: '50%',
            transform: `translateX(${activeTab === 'completed' ? '100%' : '0%'})`
          }}
        />
      </div>

      {/* Informative Message */}
      <div className={`mt-3 px-2 py-2 rounded-b-lg text-xs font-medium text-center transition-all duration-300 ${
        darkMode ? 'text-gray-400 bg-gray-800' : 'text-gray-600 bg-gray-50'
      }`}
      style={{ 
        backgroundColor: 'var(--card-background-hover)',
        color: 'var(--secondary-text)'
      }}>
        {activeTab === 'active' ? (
          <span className="flex items-center justify-center gap-1">
            📋 <span>Tarefas que precisam de atenção</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-1">
            🎉 <span>Trabalhos finalizados</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default ClientTaskTabs; 