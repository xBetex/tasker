import React from 'react';
import { Client, Task } from '@/types/types';
import EditTaskModal from './EditTaskModal';
import ClientCardHeader from './client/ClientCardHeader';
import ClientProgressBar from './client/ClientProgressBar';
import TaskItem from './client/TaskItem';
import AddTaskForm from './client/AddTaskForm';
import { useClientCard } from '../hooks/client/useClientCard';
import { api } from '@/services/api';
import { MoreVerticalIcon, EditIcon, TrashIcon } from './Icons';
import { getCurrentDateForInput, getDefaultSLADate } from '@/utils/dateUtils';
import DateDisplay from './DateDisplay';
import { getSLAStatus, getSLAStatusColor, getSLAStatusBadge, getSLAStatusText, getDaysUntilSLA } from '@/utils/slaUtils';
import CommentsSection from './CommentsSection';
import { useToast } from '../hooks/useToast';

interface ClientCardProps {
  client: Client;
  onUpdate: () => void;
  onDeleteTask: (clientId: string, taskIndex: number) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  darkMode: boolean;
  onShowDetails?: (client: Client) => void;
}

export default function ClientCard({
  client,
  onUpdate,
  onDeleteTask,
  darkMode,
  isExpanded,
  onToggleExpand,
  onShowDetails,
}: ClientCardProps) {
  const {
    // Estados
    isEditing,
    setIsEditing,
    isAddingTask,
    setIsAddingTask,
    editData,
    newTask,
    contextMenu,
    setContextMenu,
    editingTask,
    setEditingTask,
    isLoading,
    showDeleteConfirm,
    setShowDeleteConfirm,
    contextMenuRef,
    progress,
    
    // Handlers
    handleInputChange,
    handleTaskChange,
    handleNewTaskChange,
    handleAddTask,
    handleSave,
    handleDeleteClient,
    handleDeleteTask,
    handleAddComment,
    handleStatusChange,
    handleMoreVerticalClick,
    handleTouchStart,
    handleTouchEnd,
    handleTouchCancel,
  } = useClientCard(client, onUpdate, onDeleteTask);

  const toast = useToast();

  // Função combinada para expansão e edição
  const handleToggleExpandAndEdit = () => {
    if (isExpanded) {
      // Se está expandido, recolher e sair do modo de edição
      setIsEditing(false);
      setIsAddingTask(false);
    } else {
      // Se está recolhido, expandir e entrar no modo de edição
      setIsEditing(true);
    }
    onToggleExpand();
  };

  // Função para ativar apenas o modo de edição (sem mexer na expansão)
  const handleStartEdit = () => {
    setIsEditing(true);
  };

  // Função para salvar e sair do modo de edição (sem mexer na expansão)
  const handleSaveAndExitEdit = async () => {
    await handleSave();
    setIsEditing(false);
  };

  // Função para cancelar edição
  const handleCancelEdit = () => {
    setIsEditing(false);
    setIsAddingTask(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'in progress':
        return 'text-blue-600 dark:text-blue-400';
      case 'awaiting client':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'awaiting client':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleEditTask = () => {
    if (contextMenu.task) {
      setEditingTask(contextMenu.task);
      setContextMenu({ visible: false, x: 0, y: 0, taskIndex: null });
    }
  };

  const handleContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const menuWidth = 208; // w-52 = 208px
    const menuHeight = 320;
    
    // Posicionar o menu próximo ao clique, mas ajustar se estiver muito perto das bordas
    let x = e.clientX;
    let y = e.clientY;
    
    // Ajustar posição horizontal
    if (x + menuWidth > windowWidth) {
      x = windowWidth - menuWidth - 10; // 10px de margem
    }
    if (x < 10) {
      x = 10; // Margem mínima da esquerda
    }
    
    // Ajustar posição vertical
    if (y + menuHeight > windowHeight) {
      y = windowHeight - menuHeight - 10; // 10px de margem
    }
    if (y < 10) {
      y = 10; // Margem mínima do topo
    }
    
    const tasks = isEditing ? editData.tasks : client.tasks;
    const task = tasks[index];
    
    setContextMenu({
      visible: true,
      x,
      y,
      taskIndex: index,
      task
    });
  };

  const getStatusColorText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'in progress':
        return 'Em Andamento';
      case 'awaiting client':
        return 'Aguardando Cliente';
      default:
        return 'Pendente';
    }
  };

  const displayTasks = isEditing ? editData.tasks : client.tasks;

  return (
    <div className={`p-6 rounded-lg shadow-lg border transition-all duration-300 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
        : 'bg-white border-gray-200 hover:shadow-xl'
    }`}>
      <ClientCardHeader
        client={client}
        editData={editData}
        isEditing={isEditing}
        isExpanded={isExpanded}
        darkMode={darkMode}
        onInputChange={handleInputChange}
        onToggleExpandAndEdit={handleToggleExpandAndEdit}
        onStartEdit={handleStartEdit}
        onSaveAndExitEdit={handleSaveAndExitEdit}
        onCancelEdit={handleCancelEdit}
        onDeleteClient={handleDeleteClient}
        onShowDetails={onShowDetails}
      />

      <ClientProgressBar progress={progress} darkMode={darkMode} />

      {isExpanded && (
        <div>
          {displayTasks.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-3 text-gray-900 dark:text-white">
                Tarefas ({displayTasks.length})
              </h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {displayTasks.map((task, index) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    index={index}
                    isEditing={isEditing}
                    darkMode={darkMode}
                    onTaskChange={handleTaskChange}
                    onMoreVerticalClick={handleMoreVerticalClick}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchCancel}
                    onAddComment={handleAddComment}
                    getStatusColor={getStatusColor}
                    getPriorityColor={getPriorityColor}
                    getStatusBgColor={getStatusBgColor}
                  />
                ))}
              </div>
            </div>
          )}

          {isEditing && (
            <div className="mb-4">
              {!isAddingTask ? (
                <button
                  onClick={() => setIsAddingTask(true)}
                  className="w-full p-3 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
                >
                  + Adicionar Nova Tarefa
                </button>
              ) : (
                <AddTaskForm
                  newTask={newTask}
                  darkMode={darkMode}
                  onNewTaskChange={handleNewTaskChange}
                  onAddTask={handleAddTask}
                  onCancel={() => setIsAddingTask(false)}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className={`fixed z-50 w-52 rounded-lg shadow-lg border py-2 ${
            darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
        >
          {/* Status Options */}
          <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Status
          </div>
          
          {(['pending', 'in progress', 'completed', 'awaiting client'] as const).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center ${
                contextMenu.task?.status === status
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                  : darkMode
                  ? 'text-gray-200'
                  : 'text-gray-700'
              }`}
            >
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                status === 'completed' ? 'bg-green-500' :
                status === 'in progress' ? 'bg-blue-500' :
                status === 'awaiting client' ? 'bg-orange-500' : 'bg-gray-400'
              }`} />
              {getStatusColorText(status)}
            </button>
          ))}

          <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

          {/* Actions */}
          <button
            onClick={handleEditTask}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
          >
            ✏️ Editar Tarefa
          </button>
          
          <button
            onClick={() => contextMenu.task && handleDeleteTask(contextMenu.task.id)}
            className="w-full text-left px-3 py-2 text-sm hover:bg-red-100 dark:hover:bg-red-900 transition-colors text-red-600 dark:text-red-400"
          >
            🗑️ Excluir Tarefa
          </button>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onSave={async (updatedTask) => {
            try {
              await api.updateTask(editingTask.id, updatedTask);
              onUpdate();
              setEditingTask(null);
            } catch (error) {
              console.error('Error updating task:', error);
            }
          }}
          onCancel={() => setEditingTask(null)}
          darkMode={darkMode}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 max-w-md w-full mx-4 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              Confirmar Exclusão
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Tem certeza que deseja excluir o cliente "{client.name}"? Esta ação não pode ser desfeita.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleDeleteClient}
                disabled={isLoading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Excluindo...' : 'Excluir'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}