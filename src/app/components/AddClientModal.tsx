import { useState, useEffect } from 'react';
import { Client, Task, TaskStatus, TaskPriority } from '@/types/types';
import { api } from '@/services/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
}

const initialFormData: FormData = {
  id: '',
  name: '',
  company: '',
  origin: '',
  taskDescription: '',
  taskDate: new Date().toISOString().split('T')[0],
  taskStatus: 'pending',
  taskPriority: 'medium'
};

const isDateValid = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

const isPastDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

export default function AddClientModal({
  isOpen,
  onClose,
  onAddClient,
  darkMode
}: AddClientModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'client' | 'task'>('client');

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
    setFormData(initialFormData);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-6 w-full max-w-2xl`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Add New Client</h2>
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${currentStep === 'client' ? 'bg-blue-500' : 'bg-gray-300'}`} />
            <div className={`h-2 w-2 rounded-full ${currentStep === 'task' ? 'bg-blue-500' : 'bg-gray-300'}`} />
          </div>
        </div>

        {apiError && (
          <div className={`p-4 mb-4 text-sm rounded-lg ${
            darkMode 
              ? 'bg-red-900/20 text-red-400' 
              : 'bg-red-100 text-red-700'
          }`}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${currentStep === 'task' ? 'hidden' : ''}`}>
            <div>
              <label className="block text-sm font-medium mb-1">
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
                className={`w-full p-2 rounded border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-white border-gray-300'
                } ${errors.id ? 'border-red-500' : ''}`}
                placeholder="e.g., client-123"
              />
              {errors.id && (
                <p className="mt-1 text-sm text-red-500">{errors.id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Name
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full p-2 rounded border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-white border-gray-300'
                } ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Company
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                className={`w-full p-2 rounded border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-white border-gray-300'
                } ${errors.company ? 'border-red-500' : ''}`}
                placeholder="Company name"
              />
              {errors.company && (
                <p className="mt-1 text-sm text-red-500">{errors.company}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Origin
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.origin}
                onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                className={`w-full p-2 rounded border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-white border-gray-300'
                } ${errors.origin ? 'border-red-500' : ''}`}
                placeholder="e.g., Website, Referral"
              />
              {errors.origin && (
                <p className="mt-1 text-sm text-red-500">{errors.origin}</p>
              )}
            </div>
          </div>

          <div className={`space-y-4 ${currentStep === 'client' ? 'hidden' : ''}`}>
            <h3 className="text-lg font-medium mb-2">Initial Task</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Description
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.taskDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, taskDescription: e.target.value }))}
                  className={`w-full p-2 rounded border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-300'
                  } ${errors.taskDescription ? 'border-red-500' : ''}`}
                  placeholder="Task description"
                />
                {errors.taskDescription && (
                  <p className="mt-1 text-sm text-red-500">{errors.taskDescription}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Date
                  <span className="text-red-500 ml-1">*</span>
                  {isPastDate(formData.taskDate) && (
                    <span className="ml-2 text-xs text-yellow-500">(Past Date)</span>
                  )}
                </label>
                <div className="relative">
                  <DatePicker
                    selected={formData.taskDate ? new Date(formData.taskDate) : null}
                    onChange={(date: Date | null) => {
                      if (date) {
                        setFormData(prev => ({
                          ...prev,
                          taskDate: date.toISOString().split('T')[0]
                        }));
                      }
                    }}
                    dateFormat="yyyy-MM-dd"
                    className={`w-full p-2 rounded border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    } ${errors.taskDate ? 'border-red-500' : ''} ${
                      isPastDate(formData.taskDate) ? 'italic text-gray-500' : ''
                    }`}
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={10}
                    placeholderText="Select date"
                    title={isPastDate(formData.taskDate) ? 'Past dates are allowed' : ''}
                  />
                </div>
                {errors.taskDate && (
                  <p className="mt-1 text-sm text-red-500">{errors.taskDate}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.taskStatus}
                    onChange={(e) => setFormData(prev => ({ ...prev, taskStatus: e.target.value as TaskStatus }))}
                    className={`w-full p-2 rounded border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="in progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="awaiting client">Awaiting Client</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    value={formData.taskPriority}
                    onChange={(e) => setFormData(prev => ({ ...prev, taskPriority: e.target.value as TaskPriority }))}
                    className={`w-full p-2 rounded border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between space-x-2 mt-6">
            <button
              type="button"
              onClick={() => {
                if (currentStep === 'task') {
                  setCurrentStep('client');
                } else {
                  handleClose();
                }
              }}
              className={`px-4 py-2 rounded ${
                darkMode 
                  ? 'bg-gray-600 hover:bg-gray-500' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              disabled={isSubmitting}
            >
              {currentStep === 'task' ? 'Back' : 'Cancel'}
            </button>
            <button
              type={currentStep === 'task' ? 'submit' : 'button'}
              onClick={() => {
                if (currentStep === 'client') {
                  // Validate only client fields for the first step
                  const clientErrors: Partial<FormData> = {};
                  
                  if (!formData.id.trim()) {
                    clientErrors.id = 'Client ID is required';
                  } else if (!/^[a-zA-Z0-9-_]+$/.test(formData.id)) {
                    clientErrors.id = 'Client ID can only contain letters, numbers, hyphens, and underscores';
                  }
                  
                  if (!formData.name.trim()) {
                    clientErrors.name = 'Name is required';
                  }
                  if (!formData.company.trim()) {
                    clientErrors.company = 'Company is required';
                  }
                  if (!formData.origin.trim()) {
                    clientErrors.origin = 'Origin is required';
                  }

                  setErrors(clientErrors);
                  
                  if (Object.keys(clientErrors).length === 0) {
                    setCurrentStep('task');
                  }
                }
              }}
              className={`px-4 py-2 rounded ${
                darkMode 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white disabled:opacity-50`}
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? 'Creating...' 
                : currentStep === 'client' 
                  ? 'Next' 
                  : 'Create Client'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}