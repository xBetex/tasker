'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Navbar({ darkMode, onToggleDarkMode }: NavbarProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
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
      darkMode ? 'bg-gray-800' : 'bg-gray-800'
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

          {/* Hamburger Button */}
          <button
            className="hamburger-button md:hidden flex flex-col items-center justify-center w-8 h-8 space-y-1"
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
                  : 'hover:bg-gray-700'
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
                  : 'hover:bg-gray-700'
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
                  : 'hover:bg-gray-700'
              }`}
              onClick={handleLinkClick}
            >
              📋 Tasks
            </Link>
            
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