import React from 'react';

interface BulkCompleteProgressProps {
  isVisible: boolean;
  completed: number;
  total: number;
  onClose: () => void;
  darkMode: boolean;
}

const BulkCompleteProgress: React.FC<BulkCompleteProgressProps> = ({
  isVisible,
  completed,
  total,
  onClose,
  darkMode
}) => {
  if (!isVisible) return null;

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = completed >= total;

  const containerClass = darkMode
    ? 'bg-gray-800 border-gray-600 text-white shadow-2xl'
    : 'bg-white border-gray-200 text-gray-900 shadow-2xl';

  const progressBarClass = darkMode
    ? 'bg-gray-700'
    : 'bg-gray-200';

  const progressFillClass = isComplete
    ? 'bg-gradient-to-r from-green-500 to-green-400'
    : 'bg-gradient-to-r from-blue-500 to-blue-400';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`
        relative rounded-2xl border-2 p-8 max-w-md w-full mx-4
        transform transition-all duration-300 scale-100
        ${containerClass}
      `}>
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">
            {isComplete ? '🎉' : '⚡'}
          </div>
          <h3 className="text-xl font-bold mb-2">
            {isComplete ? 'Conclusão Finalizada!' : 'Concluindo Tarefas...'}
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {isComplete 
              ? 'Todas as tarefas antigas foram processadas!'
              : 'Processando tarefas de mais de 1 semana...'
            }
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progresso</span>
            <span className="text-sm font-bold">{percentage}%</span>
          </div>
          
          <div className={`w-full h-3 rounded-full ${progressBarClass} overflow-hidden`}>
            <div 
              className={`h-full transition-all duration-500 ease-out ${progressFillClass}`}
              style={{ width: `${percentage}%` }}
            >
              {!isComplete && (
                <div className="h-full w-full bg-white bg-opacity-20 animate-pulse" />
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mt-2 text-xs">
            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
              {completed} de {total} tarefas
            </span>
            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
              {total - completed} restantes
            </span>
          </div>
        </div>

        {/* Status Messages */}
        <div className="mb-6">
          {!isComplete ? (
            <div className="flex items-center gap-2 text-sm">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
              <span>Processando em lotes para otimizar performance...</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <span>✅</span>
                <span>Processamento concluído com sucesso!</span>
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                As tarefas concluídas agora aparecem na aba "Concluídas"
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-center">
          {isComplete && (
            <button
              onClick={onClose}
              className={`
                px-6 py-2 rounded-lg font-medium transition-all duration-200
                hover:scale-105 active:scale-95
                ${darkMode
                  ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white'
                  : 'bg-gradient-to-r from-green-500 to-green-400 hover:from-green-400 hover:to-green-300 text-white'
                }
                shadow-lg hover:shadow-xl
              `}
            >
              Fechar
            </button>
          )}
        </div>

        {/* Loading Spinner for Active State */}
        {!isComplete && (
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
            <div className={`
              w-8 h-8 rounded-full border-4 border-t-transparent animate-spin
              ${darkMode ? 'border-blue-400' : 'border-blue-500'}
            `} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkCompleteProgress; 