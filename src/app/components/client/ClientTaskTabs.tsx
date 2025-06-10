import React from 'react';
import { Task } from '@/types/types';
import { 
  countOldIncompleteTasks, 
  bulkCompleteOldTasks,
  generateBulkCompletionReport 
} from '@/utils/bulkTaskUtils';
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
  
  // Verifica se há tarefas antigas para este cliente específico
  const clientOldTasks = countOldIncompleteTasks([client]);

  const handleBulkCompleteForClient = async () => {
    if (clientOldTasks === 0) {
      alert('Não há tarefas antigas para este cliente.');
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja concluir ${clientOldTasks} tarefas antigas de ${client.name}?\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmed) return;

    try {
      const results = await bulkCompleteOldTasks([client]);
      
      if (results.failed.length === 0) {
        alert(`✅ ${results.success} tarefas foram concluídas com sucesso!`);
      } else {
        alert(`⚠️ ${results.success} tarefas concluídas, ${results.failed.length} falharam.`);
      }

      // Atualiza os dados
      onUpdate();
      
      // Muda para a tab de concluídas após um delay
      setTimeout(() => {
        onTabChange('completed');
      }, 1000);

    } catch (error) {
      console.error('Erro na conclusão em massa:', error);
      alert('❌ Erro ao processar tarefas. Tente novamente.');
    }
  };

  const baseTabClass = `
    relative px-3 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 
    border-b-2 flex items-center gap-2 cursor-pointer
  `;

  const activeTabClass = darkMode
    ? 'bg-gray-700 text-white border-blue-400'
    : 'bg-white text-gray-900 border-blue-500';

  const inactiveTabClass = darkMode
    ? 'bg-gray-600 text-gray-300 border-transparent hover:bg-gray-500 hover:text-white'
    : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200 hover:text-gray-800';

  return (
    <div className="mt-4 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex space-x-1">
          {/* Tab Ativa */}
          <button
            onClick={() => onTabChange('active')}
            className={`${baseTabClass} ${
              activeTab === 'active' ? activeTabClass : inactiveTabClass
            }`}
          >
            <span className="text-sm">🔥</span>
            <span>Ativas</span>
            <span className={`
              ml-1 px-2 py-1 text-xs rounded-full font-bold
              ${activeTab === 'active' 
                ? (darkMode ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800')
                : (darkMode ? 'bg-gray-500 text-gray-300' : 'bg-gray-200 text-gray-600')
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
            <span className="text-sm">✅</span>
            <span>Concluídas</span>
            <span className={`
              ml-1 px-2 py-1 text-xs rounded-full font-bold
              ${activeTab === 'completed' 
                ? (darkMode ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800')
                : (darkMode ? 'bg-gray-500 text-gray-300' : 'bg-gray-200 text-gray-600')
              }
            `}>
              {completedCount}
            </span>
          </button>
        </div>

        {/* Botão de Conclusão em Massa (apenas se há tarefas antigas) */}
        {clientOldTasks > 0 && activeTab === 'active' && (
          <button
            onClick={handleBulkCompleteForClient}
            className={`
              px-3 py-1 rounded-md text-xs font-medium transition-all duration-200
              flex items-center gap-1 hover:scale-105 active:scale-95
              ${darkMode
                ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white'
                : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white'
              }
              shadow-md hover:shadow-lg
            `}
            title={`Concluir ${clientOldTasks} tarefas antigas`}
          >
            <span className="text-sm">⚡</span>
            <span>Concluir Antigas ({clientOldTasks})</span>
          </button>
        )}
      </div>

      {/* Indicador visual da tab ativa */}
      <div className={`h-1 ${darkMode ? 'bg-gray-600' : 'bg-gray-100'} rounded-b`}>
        <div 
          className={`h-full transition-all duration-300 rounded-b ${
            darkMode ? 'bg-blue-400' : 'bg-blue-500'
          }`}
          style={{
            width: '50%',
            transform: `translateX(${activeTab === 'completed' ? '100%' : '0%'})`
          }}
        />
      </div>

      {/* Mensagem informativa */}
      <div className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {activeTab === 'active' ? (
          <div className="flex items-center gap-2">
            <span>📋 Tarefas que precisam de atenção</span>
            {clientOldTasks > 0 && (
              <span className="opacity-75">
                • {clientOldTasks} tarefa{clientOldTasks > 1 ? 's' : ''} com +1 semana
              </span>
            )}
          </div>
        ) : (
          <span>🎉 Trabalhos finalizados</span>
        )}
      </div>
    </div>
  );
};

export default ClientTaskTabs; 