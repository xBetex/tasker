'use client'
import React, { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

interface LoginFormProps {
  darkMode: boolean;
  onToggleForm: () => void;
}

export default function LoginForm({ darkMode, onToggleForm }: LoginFormProps) {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(formData.username, formData.password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div 
        className="p-8 rounded-xl shadow-2xl border"
        style={{
          backgroundColor: 'var(--card-background)',
          borderColor: 'var(--card-border)'
        }}
      >
        <h2 
          className="text-3xl font-bold text-center mb-8"
          style={{ color: 'var(--primary-text)' }}
        >
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label 
              htmlFor="username" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--secondary-text)' }}
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                darkMode 
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--secondary-text)' }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                darkMode 
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              isLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:scale-105 hover:shadow-lg'
            } ${
              darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p 
            className="text-sm"
            style={{ color: 'var(--secondary-text)' }}
          >
            Don't have an account?{' '}
            <button
              onClick={onToggleForm}
              className={`font-medium ${
                darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
              } transition-colors`}
            >
              Sign up
            </button>
          </p>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-600 dark:text-blue-400">
            <strong>Demo Credentials:</strong><br />
            <strong>Admin:</strong> Username: <code>admin</code> | Password: <code>admin123</code><br />
            <strong>User:</strong> Username: <code>user</code> | Password: <code>user123</code>
          </p>
        </div>
      </div>
    </div>
  );
} 