'use client'

import type { ReactNode } from 'react';
import { useState, useEffect, createContext, useContext } from 'react';
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from './components/Navbar';
import { Client } from '@/types/types';
import { api } from '@/services/api';
import { NotificationProvider } from './contexts/NotificationContext';
import { ScrollProvider } from './contexts/ScrollContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import NotificationToast from './components/NotificationToast';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Dark Mode Context
const DarkModeContext = createContext<{
  darkMode: boolean;
  toggleDarkMode: () => void;
}>({
  darkMode: false,
  toggleDarkMode: () => {},
});

// Clients Context
const ClientsContext = createContext<{
  clients: Client[];
  refreshClients: () => void;
  isLoading: boolean;
}>({
  clients: [],
  refreshClients: () => {},
  isLoading: false,
});

export const useDarkMode = () => useContext(DarkModeContext);
export const useClients = () => useContext(ClientsContext);

// Inner component that has access to ThemeContext
function ThemeSync({ children, darkMode, toggleDarkMode, clients, refreshClients, isLoading }: {
  children: ReactNode;
  darkMode: boolean;
  toggleDarkMode: () => void;
  clients: Client[];
  refreshClients: () => void;
  isLoading: boolean;
}) {
  const { isDarkMode, toggleDarkMode: toggleThemeMode } = useTheme();

  // Sync the old dark mode with the new theme system
  useEffect(() => {
    if (darkMode !== isDarkMode) {
      toggleThemeMode();
    }
  }, [darkMode, isDarkMode, toggleThemeMode]);

  const handleToggleDarkMode = () => {
    toggleDarkMode();
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode: handleToggleDarkMode }}>
      <ClientsContext.Provider value={{ clients, refreshClients, isLoading }}>
        <div className={`${geistSans.variable} ${geistMono.variable} antialiased ${darkMode ? 'dark' : ''}`}>
          <Navbar 
            darkMode={darkMode} 
            onToggleDarkMode={handleToggleDarkMode}
            clients={clients}
            onUpdate={refreshClients}
          />
          <main className="pt-16">
            {children}
          </main>
          <NotificationToast />
        </div>
      </ClientsContext.Provider>
    </DarkModeContext.Provider>
  );
}

function ClientLayout({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Load clients data
  const refreshClients = async () => {
    try {
      setIsLoading(true);
      const data = await api.getClients();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    refreshClients();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider>
      <NotificationProvider>
        <ScrollProvider>
          <ThemeSync 
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            clients={clients}
            refreshClients={refreshClients}
            isLoading={isLoading}
          >
            {children}
          </ThemeSync>
        </ScrollProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Task Dashboard</title>
        <meta name="description" content="Task management and analytics dashboard" />
      </head>
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}