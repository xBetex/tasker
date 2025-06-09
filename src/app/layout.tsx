'use client'

import type { ReactNode } from 'react';
import { useState, useEffect, createContext, useContext } from 'react';
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from './components/Navbar';
import { Client } from '@/types/types';
import { api } from '@/services/api';
import { NotificationProvider } from './contexts/NotificationContext';
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
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <ClientsContext.Provider value={{ clients, refreshClients, isLoading }}>
        <NotificationProvider>
          <div className={`${geistSans.variable} ${geistMono.variable} antialiased ${darkMode ? 'dark' : ''}`}>
            <Navbar 
              darkMode={darkMode} 
              onToggleDarkMode={toggleDarkMode}
              clients={clients}
              onUpdate={refreshClients}
            />
            <main className="pt-16">
              {children}
            </main>
            <NotificationToast />
          </div>
        </NotificationProvider>
      </ClientsContext.Provider>
    </DarkModeContext.Provider>
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