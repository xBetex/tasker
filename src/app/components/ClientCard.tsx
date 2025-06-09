import React from 'react';
import { Client, Task } from '@/types/types';
import EditTaskModal from './EditTaskModal';
import ClientCardHeader from './client/ClientCardHeader';
import ClientProgressBar from './client/ClientProgressBar';
import TaskItem from './client/TaskItem';
import AddTaskForm from './client/AddTaskForm';
import { useClientCard } from '../hooks/client/useClientCard';
import { api } from '@/services/api';

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

  // Função para apenas expandir/recolher (mostrar tarefas)
  const handleToggleExpand = () => {
    if (isExpanded) {
      setIsEditing(false);
      setIsAddingTask(false);
    }
    onToggleExpand();
  };

  // Função para ativar apenas o modo de edição
  const handleStartEdit = () => {
    setIsEditing(true);
  };

  // Função para salvar e sair do modo de edição
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

  const getStatusColorText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in progress':
        return 'In Progress';
      case 'awaiting client':
        return 'Awaiting Client';
      default:
        return 'Pending';
    }
  };

  const displayTasks = isEditing ? editData.tasks : client.tasks;

  return (
    <div 
      className={`p-6 rounded-lg shadow-lg border transition-all duration-300 ${
        darkMode 
          ? 'bg-gray-950 border-gray-800 hover:bg-gray-900' 
          : 'bg-white border-gray-200 hover:shadow-xl'
      }`}
      onClick={(e) => {
        // Só permitir expansão se clicou no header ou barra de progresso
        const target = e.target as HTMLElement;
        
        // Identificar se clicou em área "clicável" para expandir
        const isHeaderArea = target.closest('.client-header') || 
                            target.closest('.client-progress') ||
                            (!isExpanded && !target.closest('button, input, select, textarea, form, [role="button"]'));
        
        // Se está expandido, não fechar ao clicar em qualquer lugar
        if (isExpanded) {
          return;
        }
        
        // Se não está expandido e clicou em área válida, expandir
        if (isHeaderArea && !target.closest('button, input, select, textarea, form')) {
          handleToggleExpand();
        }
      }}
    >
      <ClientCardHeader
        client={client}
        editData={editData}
        isEditing={isEditing}
        isExpanded={isExpanded}
        darkMode={darkMode}
        onInputChange={handleInputChange}
        onToggleExpand={handleToggleExpand}
        onStartEdit={handleStartEdit}
        onSaveAndExitEdit={handleSaveAndExitEdit}
        onCancelEdit={handleCancelEdit}
        onDeleteClient={handleDeleteClient}
        onShowDetails={onShowDetails}
      />

      <ClientProgressBar progress={progress} darkMode={darkMode} isExpanded={isExpanded} />

      {isExpanded && (
        <div>
          {displayTasks.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-3 text-gray-900 dark:text-white">
                Tasks ({displayTasks.length})
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

          {/* Add Task Button - Always visible when expanded */}
          <div className="mb-4">
            {!isAddingTask ? (
              <div className="flex justify-center">
                <button
                  onClick={() => setIsAddingTask(true)}
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:scale-110 ${
                    darkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                  title="Add new task"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
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

          <button
            onClick={handleEditTask}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
          >
            ✏️ Edit Task
          </button>
          
          <button
            onClick={() => contextMenu.task && handleDeleteTask(contextMenu.task.id)}
            className="w-full text-left px-3 py-2 text-sm hover:bg-red-100 dark:hover:bg-red-900 transition-colors text-red-600 dark:text-red-400"
          >
            🗑️ Delete Task
          </button>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          isOpen={true}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onUpdate={onUpdate}
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
              Confirm Deletion
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Are you sure you want to delete client "{client.name}"? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleDeleteClient}
                disabled={isLoading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 