import { useState } from 'react';
import { Client, Task } from '@/types/types';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClient: (client: Client) => void;
  darkMode: boolean;
}

export default function AddClientModal({ isOpen, onClose, onAddClient, darkMode }: AddClientModalProps) {
  const [formData, setFormData] = useState<Omit<Client, 'id'>>({ 
    name: '',
    company: '',
    origin: '',
    tasks: []
  });
  const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    status: 'pending',
    priority: 'medium'
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTask({ ...newTask, [name]: value });
  };

  const handleAddTask = () => {
    if (newTask.description.trim()) {
      setFormData({
        ...formData,
        tasks: [...formData.tasks, newTask]
      });
      setNewTask({
        date: new Date().toISOString().split('T')[0],
        description: '',
        status: 'pending',
        priority: 'medium'
      });
    }
  };

  const handleRemoveTask = (index: number) => {
    const updatedTasks = [...formData.tasks];
    updatedTasks.splice(index, 1);
    setFormData({ ...formData, tasks: updatedTasks });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: Client = {
      ...formData,
      id: `CL-${Math.floor(1000 + Math.random() * 9000)}`
    };
    onAddClient(newClient);
    setFormData({ 
      name: '',
      company: '',
      origin: '',
      tasks: []
    });
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${darkMode ? 'bg-gray-900 bg-opacity-75' : 'bg-gray-500 bg-opacity-75'}`}>
      <div className="flex items-center justify-center min-h-screen">
        <div className={`rounded-lg shadow-xl w-full max-w-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`p-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Client</h2>
              <button
                onClick={onClose}
                className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={`mt-1 block w-full rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} shadow-sm`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    required
                    className={`mt-1 block w-full rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} shadow-sm`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Origin</label>
                  <input
                    type="text"
                    name="origin"
                    value={formData.origin}
                    onChange={handleInputChange}
                    required
                    className={`mt-1 block w-full rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} shadow-sm`}
                  />
                </div>
              </div>

              <div className="mb-4">
                <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tasks</h3>
                {formData.tasks.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {formData.tasks.map((task, index) => (
                      <div 
                        key={index} 
                        className={`p-2 rounded flex justify-between items-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                      >
                        <div>
                          <span className="font-medium">{task.description}</span>
                          <span className={`text-xs ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {task.date} • {task.priority} • {task.status}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTask(index)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                    <div>
                      <label className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Date</label>
                      <input
                        type="date"
                        name="date"
                        value={newTask.date}
                        onChange={handleTaskChange}
                        className={`mt-1 block w-full rounded-md text-xs ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'} shadow-sm`}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Description</label>
                      <input
                        type="text"
                        name="description"
                        value={newTask.description}
                        onChange={handleTaskChange}
                        placeholder="Task description"
                        className={`mt-1 block w-full rounded-md text-xs ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'} shadow-sm`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Priority</label>
                      <select
                        name="priority"
                        value={newTask.priority}
                        onChange={handleTaskChange}
                        className={`mt-1 block w-full rounded-md text-xs ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'} shadow-sm`}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</label>
                      <select
                        name="status"
                        value={newTask.status}
                        onChange={handleTaskChange}
                        className={`mt-1 block w-full rounded-md text-xs ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'} shadow-sm`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="awaiting client">Awaiting Client</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleAddTask}
                        disabled={!newTask.description.trim()}
                        className={`w-full py-1 rounded-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white disabled:opacity-50`}
                      >
                        Add Task
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}