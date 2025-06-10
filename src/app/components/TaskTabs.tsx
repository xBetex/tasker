import React from 'react';

export type TabType = 'active' | 'completed';

interface TaskTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  activeCount: number;
  completedCount: number;
  darkMode: boolean;
  onBulkComplete?: () => void;
  showBulkComplete?: boolean;
}

const TaskTabs: React.FC<TaskTabsProps> = ({
  activeTab,
  onTabChange,
  activeCount,
  completedCount,
  darkMode,
  onBulkComplete,
  showBulkComplete = false
}) => {
  const baseTabClass = `
    relative px-6 py-3 font-medium text-sm rounded-t-lg transition-all duration-200 
    border-b-2 flex items-center gap-2 cursor-pointer
  `;

  const activeTabClass = darkMode
    ? 'bg-gray-800 text-white border-blue-400 shadow-lg'
    : 'bg-white text-gray-900 border-blue-500 shadow-lg';

  const inactiveTabClass = darkMode
    ? 'bg-gray-700 text-gray-300 border-transparent hover:bg-gray-600 hover:text-white'
    : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200 hover:text-gray-800';

  const containerClass = darkMode
    ? 'bg-gray-900 border-gray-700'
    : 'bg-white border-gray-200';

  return (
    <div className={`rounded-lg border-2 ${containerClass} shadow-lg mb-6`}>
      <div className="flex items-center justify-between p-4 pb-0">
        <div className="flex space-x-1">
          {/* Tab Ativa */}
          <button
            onClick={() => onTabChange('active')}
            className={`${baseTabClass} ${
              activeTab === 'active' ? activeTabClass : inactiveTabClass
            }`}
          >
            <span className="text-lg">🔥</span>
            <span>Tarefas Ativas</span>
            <span className={`
              ml-2 px-2 py-1 text-xs rounded-full font-bold
              ${activeTab === 'active' 
                ? (darkMode ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800')
                : (darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600')
              }
            `}>
              {activeCount}
            </span>
          </button>

          {/* Tab Concluída */}
          <button
            onClick={() => onTabChange('completed')}
            className={`${baseTabClass} ${
              activeTab === 'completed' ? activeTabClass : inactiveTabClass
            }`}
          >
            <span className="text-lg">✅</span>
            <span>Concluídas</span>
            <span className={`
              ml-2 px-2 py-1 text-xs rounded-full font-bold
              ${activeTab === 'completed' 
                ? (darkMode ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800')
                : (darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600')
              }
            `}>
              {completedCount}
            </span>
          </button>
        </div>

        {/* Botão de Conclusão em Massa */}
        {showBulkComplete && activeTab === 'active' && (
          <button
            onClick={onBulkComplete}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
              flex items-center gap-2 hover:scale-105 active:scale-95
              ${darkMode
                ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white border border-orange-500'
                : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white border border-orange-400'
              }
              shadow-lg hover:shadow-xl
            `}
            title="Concluir todas as tarefas de mais de 1 semana"
          >
            <span className="text-lg">⚡</span>
            <span>Concluir Antigas</span>
          </button>
        )}
      </div>

      {/* Indicador visual da tab ativa */}
      <div className={`h-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <div 
          className={`h-full transition-all duration-300 ${
            darkMode ? 'bg-blue-400' : 'bg-blue-500'
          }`}
          style={{
            width: '50%',
            transform: `translateX(${activeTab === 'completed' ? '100%' : '0%'})`
          }}
        />
      </div>

      {/* Informações da tab ativa */}
      <div className={`p-4 pt-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {activeTab === 'active' ? (
          <div className="flex items-center gap-4">
            <span>📋 Tarefas que precisam de atenção</span>
            {showBulkComplete && (
              <span className="text-xs opacity-75">
                💡 Use "Concluir Antigas" para finalizar tarefas de mais de 1 semana
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <span>🎉 Tarefas finalizadas e arquivadas</span>
            <span className="text-xs opacity-75">
              📊 Histórico completo de trabalhos realizados
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskTabs; 