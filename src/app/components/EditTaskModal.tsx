import { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types/types';
import { api } from '@/services/api';
import { isValidStorageDate, getDefaultSLADate } from '@/utils/dateUtils';
import { useScroll } from '../contexts/ScrollContext';
import { useTimezone } from '../contexts/TimezoneContext';


interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onUpdate: () => void;
  darkMode: boolean;
}

export default function EditTaskModal({ isOpen, onClose, task, onUpdate, darkMode }: EditTaskModalProps) {
  const { setFocusedTaskId } = useScroll();
  const { getTimezoneOffset } = useTimezone();
  
  const [formData, setFormData] = useState({
    date: task.date,
    description: task.description,
    status: task.status,
    priority: task.priority,
    sla_date: task.sla_date || getDefaultSLADate(getTimezoneOffset()),
    completion_date: task.completion_date || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!isValidStorageDate(formData.date)) {
      setError('Invalid date. Use the correct format.');
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
      
      // Set task as focused before updating
      setFocusedTaskId(task.id);
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
      <div 
        className="rounded-lg p-6 max-w-md w-full"
        style={{
          backgroundColor: 'var(--card-background)',
          color: 'var(--primary-text)'
        }}
      >
        <h2 
          className="text-2xl font-bold mb-4"
          style={{ color: 'var(--primary-text)' }}
        >
          Edit Task
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label 
                className="block mb-1"
                style={{ color: 'var(--primary-text)' }}
              >
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full p-2 border rounded"
                style={{
                  backgroundColor: 'var(--input-background)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--input-text)'
                }}
                required
              />
            </div>

            <div>
              <label 
                className="block mb-1"
                style={{ color: 'var(--primary-text)' }}
              >
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2 border rounded"
                style={{
                  backgroundColor: 'var(--input-background)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--input-text)'
                }}
                required
              />
            </div>

            <div>
              <label 
                className="block mb-1"
                style={{ color: 'var(--primary-text)' }}
              >
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as TaskStatus }))}
                className="w-full p-2 border rounded"
                style={{
                  backgroundColor: 'var(--input-background)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--input-text)'
                }}
              >
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="awaiting client">Awaiting Client</option>
              </select>
            </div>

            <div>
              <label 
                className="block mb-1"
                style={{ color: 'var(--primary-text)' }}
              >
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                className="w-full p-2 border rounded"
                style={{
                  backgroundColor: 'var(--input-background)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--input-text)'
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label 
                className="block mb-1"
                style={{ color: 'var(--primary-text)' }}
              >
                SLA Date (Due Date)
              </label>
              <input
                type="date"
                value={formData.sla_date}
                onChange={(e) => setFormData(prev => ({ ...prev, sla_date: e.target.value }))}
                className="w-full p-2 border rounded"
                style={{
                  backgroundColor: 'var(--input-background)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--input-text)'
                }}
              />
              <p 
                className="mt-1 text-xs"
                style={{ color: 'var(--muted-text)' }}
              >
                Default: 24 hours from task creation (can be modified)
              </p>
            </div>

            <div>
              <label 
                className="block mb-1"
                style={{ color: 'var(--primary-text)' }}
              >
                Completion Date
              </label>
              <input
                type="date"
                value={formData.completion_date}
                onChange={(e) => setFormData(prev => ({ ...prev, completion_date: e.target.value }))}
                className="w-full p-2 border rounded"
                style={{
                  backgroundColor: 'var(--input-background)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--input-text)'
                }}
              />
            </div>


          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded transition-colors"
              style={{
                backgroundColor: 'var(--secondary-button)',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--secondary-button-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--secondary-button)';
              }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded transition-colors"
              style={{
                backgroundColor: 'var(--primary-button)',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = 'var(--primary-button-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = 'var(--primary-button)';
                }
              }}
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