import { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types/types';
import { api } from '@/services/api';
import { isValidStorageDate, getDefaultSLADate } from '@/utils/dateUtils';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onUpdate: () => void;
  darkMode: boolean;
}

export default function EditTaskModal({ isOpen, onClose, task, onUpdate, darkMode }: EditTaskModalProps) {
  const [formData, setFormData] = useState({
    date: task.date,
    description: task.description,
    status: task.status,
    priority: task.priority,
    sla_date: task.sla_date || getDefaultSLADate(),
    completion_date: task.completion_date || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!isValidStorageDate(formData.date)) {
      setError('Data inválida. Use o formato correto.');
      setIsSubmitting(false);
      return;
    }

    try {
      await api.updateTask(task.id, {
        date: formData.date,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        sla_date: formData.sla_date || undefined,
        completion_date: formData.completion_date || undefined
      });
      onUpdate();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-6 max-w-md w-full`}>
        <h2 className="text-2xl font-bold mb-4">Edit Task</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} text-inherit`}
                required
              />
            </div>

            <div>
              <label className="block mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} text-inherit`}
                required
              />
            </div>

            <div>
              <label className="block mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as TaskStatus }))}
                className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} text-inherit`}
              >
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="awaiting client">Awaiting Client</option>
              </select>
            </div>

            <div>
              <label className="block mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} text-inherit`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block mb-1">SLA Date (Due Date)</label>
              <input
                type="date"
                value={formData.sla_date}
                onChange={(e) => setFormData(prev => ({ ...prev, sla_date: e.target.value }))}
                className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} text-inherit`}
              />
              <p className="mt-1 text-xs text-gray-500">
                Default: 24 hours from task creation (can be modified)
              </p>
            </div>

            <div>
              <label className="block mb-1">Completion Date</label>
              <input
                type="date"
                value={formData.completion_date}
                onChange={(e) => setFormData(prev => ({ ...prev, completion_date: e.target.value }))}
                className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} text-inherit`}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded ${
                darkMode 
                  ? 'bg-gray-600 hover:bg-gray-500' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded ${
                darkMode 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 