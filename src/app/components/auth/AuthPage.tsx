'use client'
import React, { useState } from 'react';
import { useDarkMode } from '@/app/layout';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function AuthPage() {
  const { darkMode } = useDarkMode();
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      darkMode ? 'bg-black' : 'bg-gray-100'
    }`}>
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 
            className="text-4xl md:text-6xl font-bold mb-4"
            style={{ color: 'var(--primary-text)' }}
          >
            📋 Task Dashboard
          </h1>
          <p 
            className="text-lg md:text-xl"
            style={{ color: 'var(--secondary-text)' }}
          >
            Modern task management for teams and individuals
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Features */}
          <div className="space-y-6">
            <div 
              className="p-6 rounded-xl border"
              style={{
                backgroundColor: 'var(--card-background)',
                borderColor: 'var(--card-border)'
              }}
            >
              <h3 
                className="text-2xl font-bold mb-4"
                style={{ color: 'var(--primary-text)' }}
              >
                ✨ Key Features
              </h3>
              <ul 
                className="space-y-3"
                style={{ color: 'var(--secondary-text)' }}
              >
                <li className="flex items-center">
                  <span className="mr-3">🎯</span>
                  SLA Management & Tracking
                </li>
                <li className="flex items-center">
                  <span className="mr-3">📈</span>
                  Analytics Dashboard
                </li>
                <li className="flex items-center">
                  <span className="mr-3">💬</span>
                  Comments & Collaboration
                </li>
                <li className="flex items-center">
                  <span className="mr-3">🌙</span>
                  Dark/Light Mode Support
                </li>
                <li className="flex items-center">
                  <span className="mr-3">📱</span>
                  Responsive Design
                </li>
                <li className="flex items-center">
                  <span className="mr-3">🔍</span>
                  Advanced Filtering
                </li>
              </ul>
            </div>

            <div 
              className="p-6 rounded-xl border"
              style={{
                backgroundColor: 'var(--card-background)',
                borderColor: 'var(--card-border)'
              }}
            >
              <h3 
                className="text-xl font-bold mb-3"
                style={{ color: 'var(--primary-text)' }}
              >
                🚀 Built with Modern Tech
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Next.js 15', 'React 19', 'TypeScript', 'TailwindCSS', 'FastAPI'].map((tech) => (
                  <span
                    key={tech}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      darkMode 
                        ? 'bg-blue-900/30 text-blue-300 border border-blue-700/50' 
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Auth Forms */}
          <div className="flex justify-center">
            {isLogin ? (
              <LoginForm 
                darkMode={darkMode} 
                onToggleForm={() => setIsLogin(false)} 
              />
            ) : (
              <RegisterForm 
                darkMode={darkMode} 
                onToggleForm={() => setIsLogin(true)} 
              />
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p 
            className="text-sm"
            style={{ color: 'var(--secondary-text)' }}
          >
            © 2024 Task Dashboard. Built with ❤️ using Next.js and FastAPI.
          </p>
        </div>
      </div>
    </div>
  );
} 