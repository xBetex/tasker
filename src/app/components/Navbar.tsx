'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Client } from '@/types/types';
import { useSLANotifications } from '@/app/hooks/useSLANotifications';
import { useAuth } from '@/app/contexts/AuthContext';
import SLANotifications from './SLANotifications';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  clients?: Client[];
  onUpdate?: () => void;
}

export default function Navbar({ darkMode, onToggleDarkMode, clients = [], onUpdate }: NavbarProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  
  // SLA Notifications
  const slaNotifications = useSLANotifications(clients);
  
  const isActive = (path: string) => pathname === path;

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (isMenuOpen && !target.closest('.navbar-menu') && !target.closest('.hamburger-button')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${
      darkMode ? 'bg-gray-950' : 'bg-gray-800'
    } text-white shadow-lg`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link 
              href="/"
              className="text-xl font-bold hover:text-blue-400 transition-colors"
              onClick={handleLinkClick}
            >
              Task Manager
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/"
              className={`text-lg font-semibold transition-colors ${
                isActive('/') 
                  ? 'text-blue-400' 
                  : 'hover:text-blue-300'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/analytics"
              className={`text-lg font-semibold transition-colors ${
                isActive('/analytics') 
                  ? 'text-blue-400' 
                  : 'hover:text-blue-300'
              }`}
            >
              Analytics
            </Link>
            <Link 
              href="/filtered-tasks"
              className={`text-lg font-semibold transition-colors ${
                isActive('/filtered-tasks') 
                  ? 'text-blue-400' 
                  : 'hover:text-blue-300'
              }`}
            >
              Tasks
            </Link>
            <Link 
              href="/sla"
              className={`text-lg font-semibold transition-colors ${
                isActive('/sla') 
                  ? 'text-blue-400' 
                  : 'hover:text-blue-300'
              }`}
            >
              SLA
            </Link>
            <Link 
              href="/comments-search"
              className={`text-lg font-semibold transition-colors ${
                isActive('/comments-search') 
                  ? 'text-blue-400' 
                  : 'hover:text-blue-300'
              }`}
            >
              Comments
            </Link>
            <Link 
              href="/settings"
              className={`text-lg font-semibold transition-colors ${
                isActive('/settings') 
                  ? 'text-blue-400' 
                  : 'hover:text-blue-300'
              }`}
            >
              ⚙️
            </Link>
            
            {/* SLA Notifications */}
            <SLANotifications
              {...slaNotifications}
              darkMode={darkMode}
              onUpdate={onUpdate}
            />
            
            {/* User Info & Logout - Desktop */}
            {isAuthenticated && user && (
              <div className="flex items-center space-x-3">
                <div className="text-sm">
                  <span className="text-gray-300">Welcome, </span>
                  <span className="font-semibold text-white">{user.username}</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    user.role === 'admin' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-blue-600 text-white'
                  }`}>
                    {user.role.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                  title="Logout"
                >
                  🚪 Logout
                </button>
              </div>
            )}

            {/* Dark Mode Toggle - Desktop */}
            <div className="flex items-center">
              <span className="mr-2 text-sm">
                {darkMode ? '☀️' : '🌙'}
              </span>
              <button
                onClick={onToggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-blue-600' : 'bg-gray-600'
                }`}
                aria-label="Toggle dark mode"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Mobile: SLA Notifications and Hamburger */}
          <div className="md:hidden flex items-center space-x-2">
            {/* SLA Notifications - Mobile */}
            <SLANotifications
              {...slaNotifications}
              darkMode={darkMode}
              onUpdate={onUpdate}
            />
            
            {/* Hamburger Button */}
            <button
              className="hamburger-button flex flex-col items-center justify-center w-8 h-8 space-y-1"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                isMenuOpen ? 'rotate-45 translate-y-1.5' : ''
              }`}></span>
              <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                isMenuOpen ? 'opacity-0' : ''
              }`}></span>
              <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
              }`}></span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`navbar-menu md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-64 pb-4' : 'max-h-0'
        }`}>
          <div className="space-y-3 pt-4 border-t border-gray-700">
            <Link
              href="/"
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive('/') 
                  ? 'bg-blue-600 text-white' 
                  : darkMode ? 'hover:bg-gray-900' : 'hover:bg-gray-700'
              }`}
              onClick={handleLinkClick}
            >
              🏠 Dashboard
            </Link>
            <Link
              href="/analytics"
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive('/analytics') 
                  ? 'bg-blue-600 text-white' 
                  : darkMode ? 'hover:bg-gray-900' : 'hover:bg-gray-700'
              }`}
              onClick={handleLinkClick}
            >
              📊 Analytics
            </Link>
            <Link
              href="/filtered-tasks"
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive('/filtered-tasks') 
                  ? 'bg-blue-600 text-white' 
                  : darkMode ? 'hover:bg-gray-900' : 'hover:bg-gray-700'
              }`}
              onClick={handleLinkClick}
            >
              📋 Tasks
            </Link>
            <Link
              href="/sla"
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive('/sla') 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-gray-700'
              }`}
              onClick={handleLinkClick}
            >
              🎯 SLA
            </Link>
            <Link
              href="/comments-search"
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive('/comments-search') 
                  ? 'bg-blue-600 text-white' 
                  : darkMode ? 'hover:bg-gray-900' : 'hover:bg-gray-700'
              }`}
              onClick={handleLinkClick}
            >
              💬 Comments Search
            </Link>
            <Link
              href="/settings"
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive('/settings') 
                  ? 'bg-blue-600 text-white' 
                  : darkMode ? 'hover:bg-gray-900' : 'hover:bg-gray-700'
              }`}
              onClick={handleLinkClick}
            >
              ⚙️ Configurações
            </Link>
            
            {/* User Info & Logout - Mobile */}
            {isAuthenticated && user && (
              <div className="px-4 py-2 border-t border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm">
                    <div className="text-gray-300">Welcome, <span className="font-semibold text-white">{user.username}</span></div>
                    <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-blue-600 text-white'
                    }`}>
                      {user.role.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            )}

            {/* Dark Mode Toggle - Mobile */}
            <div className="px-4 py-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </span>
                <button
                  onClick={onToggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    darkMode ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                  aria-label="Toggle dark mode"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 