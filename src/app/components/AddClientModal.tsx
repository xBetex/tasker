import { useState } from 'react';
import { TaskStatus, TaskPriority } from '@/types/types';
import { api } from '@/services/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  getCurrentDateForInput, 
  dateToInputFormat, 
  isValidStorageDate,
  getDefaultSLADate
} from '@/utils/dateUtils';
import { useTimezone } from '../contexts/TimezoneContext';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClient: () => void;
  darkMode: boolean;
}

interface FormData {
  id: string;
  name: string;
  company: string;
  origin: string;
  taskDescription: string;
  taskDate: string;
  taskStatus: TaskStatus;
  taskPriority: TaskPriority;
  taskSlaDate: string;
}

export default function AddClientModal({
  isOpen,
  onClose,
  onAddClient,
  darkMode
}: AddClientModalProps) {
  const { getTimezoneOffset } = useTimezone();
  
  const initialFormData: FormData = {
    id: '',
    name: '',
    company: '',
    origin: '',
    taskDescription: '',
    taskDate: getCurrentDateForInput(getTimezoneOffset()),
    taskStatus: 'pending',
    taskPriority: 'medium',
    taskSlaDate: getDefaultSLADate(getTimezoneOffset())
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'client' | 'task'>('client');

  const isDateValid = (dateString: string): boolean => {
    return isValidStorageDate(dateString);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    // Client validation
    if (!formData.id.trim()) {
      newErrors.id = 'Client ID is required';
    } else if (!/^[a-zA-Z0-9-_]+$/.test(formData.id)) {
      newErrors.id = 'Client ID can only contain letters, numbers, hyphens, and underscores';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }
    if (!formData.origin.trim()) {
      newErrors.origin = 'Origin is required';
    }

    // Task validation
    if (!formData.taskDescription.trim()) {
      newErrors.taskDescription = 'Task description is required';
    }
    if (!formData.taskDate) {
      newErrors.taskDate = 'Task date is required';
    } else if (!isDateValid(formData.taskDate)) {
      newErrors.taskDate = 'Invalid date format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Create client with initial task using the new sequential API
      await api.createClientWithTasks(
        {
          id: formData.id,
          name: formData.name,
          company: formData.company,
          origin: formData.origin,
        },
        [{
          date: formData.taskDate,
          description: formData.taskDescription,
          status: formData.taskStatus,
          priority: formData.taskPriority,
          sla_date: formData.taskSlaDate,
        }]
      );

      onAddClient();
      onClose();
      setFormData(initialFormData);
      setCurrentStep('client');
    } catch (error) {
      console.error('Error creating client with tasks:', error);
      setApiError(error instanceof Error ? error.message : 'Failed to create client and tasks');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    const newInitialData = {
      id: '',
      name: '',
      company: '',
      origin: '',
      taskDescription: '',
      taskDate: getCurrentDateForInput(getTimezoneOffset()),
      taskStatus: 'pending' as TaskStatus,
      taskPriority: 'medium' as TaskPriority,
      taskSlaDate: getDefaultSLADate(getTimezoneOffset())
    };
    setFormData(newInitialData);
    setErrors({});
    setApiError(null);
    setCurrentStep('client');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div 
        className="rounded-lg p-6 w-full max-w-2xl shadow-2xl border"
        style={{
          backgroundColor: 'var(--card-background)',
          borderColor: 'var(--card-border)',
          color: 'var(--primary-text)'
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 
            className="text-2xl font-bold"
            style={{ color: 'var(--primary-text)' }}
          >
            Add New Client
          </h2>
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${currentStep === 'client' ? 'bg-blue-500' : 'bg-gray-300'}`} />
            <div className={`h-2 w-2 rounded-full ${currentStep === 'task' ? 'bg-blue-500' : 'bg-gray-300'}`} />
          </div>
        </div>

        {apiError && (
          <div 
            className="p-4 mb-4 text-sm rounded-lg border"
            style={{
              backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
              borderColor: darkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)',
              color: darkMode ? 'rgb(248, 113, 113)' : 'rgb(220, 38, 38)'
            }}
          >
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${currentStep === 'task' ? 'hidden' : ''}`}>
            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--secondary-text)' }}
              >
                Client ID
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  setFormData(prev => ({ ...prev, id: value }));
                  if (value && !/^[a-zA-Z0-9-_]+$/.test(value)) {
                    setErrors(prev => ({
                      ...prev,
                      id: 'Client ID can only contain letters, numbers, hyphens, and underscores'
                    }));
                  } else {
                    setErrors(prev => ({ ...prev, id: undefined }));
                  }
                }}
                className={`w-full p-2 rounded border transition-all duration-200 ${errors.id ? 'border-red-500' : ''}`}
                style={{
                  backgroundColor: 'var(--input-background)',
                  borderColor: errors.id ? '#ef4444' : 'var(--input-border)',
                  color: 'var(--input-text)'
                }}
                placeholder="e.g., client-123"
              />
              {errors.id && (
                <p className="mt-1 text-sm text-red-500">{errors.id}</p>
              )}
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--secondary-text)' }}
              >
                Name
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full p-2 rounded border transition-all duration-200 ${errors.name ? 'border-red-500' : ''}`}
                style={{
                  backgroundColor: 'var(--input-background)',
                  borderColor: errors.name ? '#ef4444' : 'var(--input-border)',
                  color: 'var(--input-text)'
                }}
                placeholder="Client's full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--secondary-text)' }}
              >
                Company
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                className={`w-full p-2 rounded border transition-all duration-200 ${errors.company ? 'border-red-500' : ''}`}
                style={{
                  backgroundColor: 'var(--input-background)',
                  borderColor: errors.company ? '#ef4444' : 'var(--input-border)',
                  color: 'var(--input-text)'
                }}
                placeholder="Company name"
              />
              {errors.company && (
                <p className="mt-1 text-sm text-red-500">{errors.company}</p>
              )}
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--secondary-text)' }}
              >
                Origin
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.origin}
                onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                className={`w-full p-2 rounded border transition-all duration-200 ${errors.origin ? 'border-red-500' : ''}`}
                style={{
                  backgroundColor: 'var(--input-background)',
                  borderColor: errors.origin ? '#ef4444' : 'var(--input-border)',
                  color: 'var(--input-text)'
                }}
                placeholder="How did you find this client?"
              />
              {errors.origin && (
                <p className="mt-1 text-sm text-red-500">{errors.origin}</p>
              )}
            </div>
          </div>

          <div className={`space-y-4 ${currentStep === 'client' ? 'hidden' : ''}`}>
            <div className="border-t pt-4" style={{ borderColor: 'var(--card-border)' }}>
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ color: 'var(--primary-text)' }}
              >
                Initial Task
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label 
                    className="block text-sm font-medium mb-1"
                    style={{ color: 'var(--secondary-text)' }}
                  >
                    Task Description
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    value={formData.taskDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, taskDescription: e.target.value }))}
                    className={`w-full p-2 rounded border transition-all duration-200 ${errors.taskDescription ? 'border-red-500' : ''}`}
                    style={{
                      backgroundColor: 'var(--input-background)',
                      borderColor: errors.taskDescription ? '#ef4444' : 'var(--input-border)',
                      color: 'var(--input-text)'
                    }}
                    rows={3}
                    placeholder="Describe the initial task..."
                  />
                  {errors.taskDescription && (
                    <p className="mt-1 text-sm text-red-500">{errors.taskDescription}</p>
                  )}
                </div>

                <div>
                  <label 
                    className="block text-sm font-medium mb-1"
                    style={{ color: 'var(--secondary-text)' }}
                  >
                    Task Date
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.taskDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, taskDate: e.target.value }))}
                    className={`w-full p-2 rounded border transition-all duration-200 ${errors.taskDate ? 'border-red-500' : ''}`}
                    style={{
                      backgroundColor: 'var(--input-background)',
                      borderColor: errors.taskDate ? '#ef4444' : 'var(--input-border)',
                      color: 'var(--input-text)'
                    }}
                  />
                  {errors.taskDate && (
                    <p className="mt-1 text-sm text-red-500">{errors.taskDate}</p>
                  )}
                </div>

                <div>
                  <label 
                    className="block text-sm font-medium mb-1"
                    style={{ color: 'var(--secondary-text)' }}
                  >
                    SLA Date
                  </label>
                  <input
                    type="date"
                    value={formData.taskSlaDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, taskSlaDate: e.target.value }))}
                    className="w-full p-2 rounded border transition-all duration-200"
                    style={{
                      backgroundColor: 'var(--input-background)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--input-text)'
                    }}
                  />
                </div>

                <div>
                  <label 
                    className="block text-sm font-medium mb-1"
                    style={{ color: 'var(--secondary-text)' }}
                  >
                    Status
                  </label>
                  <select
                    value={formData.taskStatus}
                    onChange={(e) => setFormData(prev => ({ ...prev, taskStatus: e.target.value as TaskStatus }))}
                    className="w-full p-2 rounded border transition-all duration-200"
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
                    className="block text-sm font-medium mb-1"
                    style={{ color: 'var(--secondary-text)' }}
                  >
                    Priority
                  </label>
                  <select
                    value={formData.taskPriority}
                    onChange={(e) => setFormData(prev => ({ ...prev, taskPriority: e.target.value as TaskPriority }))}
                    className="w-full p-2 rounded border transition-all duration-200"
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
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t" style={{ borderColor: 'var(--card-border)' }}>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'var(--card-background)',
                borderColor: 'var(--card-border)',
                color: 'var(--secondary-text)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                e.currentTarget.style.color = 'var(--primary-text)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--card-background)';
                e.currentTarget.style.color = 'var(--secondary-text)';
              }}
            >
              Cancel
            </button>
            
            {currentStep === 'client' ? (
              <button
                type="button"
                onClick={() => {
                  const clientErrors: Partial<FormData> = {};
                  if (!formData.id.trim()) clientErrors.id = 'Client ID is required';
                  if (!formData.name.trim()) clientErrors.name = 'Name is required';
                  if (!formData.company.trim()) clientErrors.company = 'Company is required';
                  if (!formData.origin.trim()) clientErrors.origin = 'Origin is required';
                  
                  if (Object.keys(clientErrors).length === 0) {
                    setCurrentStep('task');
                    setErrors({});
                  } else {
                    setErrors(clientErrors);
                  }
                }}
                className="px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: 'var(--primary-button)',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-button-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-button)';
                }}
              >
                Next: Add Task
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep('client');
                    setErrors({});
                  }}
                  className="px-4 py-2 rounded-lg border transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: 'var(--card-background)',
                    borderColor: 'var(--card-border)',
                    color: 'var(--secondary-text)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
                    e.currentTarget.style.color = 'var(--primary-text)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--card-background)';
                    e.currentTarget.style.color = 'var(--secondary-text)';
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
                >
                  {isSubmitting ? 'Creating...' : 'Create Client'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}