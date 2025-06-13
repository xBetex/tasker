'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ThemeColors {
  // Background colors
  pageBackground: string;
  cardBackground: string;
  cardBackgroundHover: string;
  
  // Text colors
  primaryText: string;
  secondaryText: string;
  mutedText: string;
  
  // Border colors
  cardBorder: string;
  inputBorder: string;
  
  // Button colors
  primaryButton: string;
  primaryButtonHover: string;
  secondaryButton: string;
  secondaryButtonHover: string;
  dangerButton: string;
  dangerButtonHover: string;
  
  // Input colors
  inputBackground: string;
  inputText: string;
  
  // Status colors
  pendingColor: string;
  inProgressColor: string;
  completedColor: string;
  awaitingClientColor: string;
  
  // Priority colors
  lowPriorityBg: string;
  mediumPriorityBg: string;
  highPriorityBg: string;
}

export const defaultLightTheme: ThemeColors = {
  // Background colors
  pageBackground: '#f8f9fa',
  cardBackground: '#ffffff',
  cardBackgroundHover: '#f8f9fa',
  
  // Text colors
  primaryText: '#212529',
  secondaryText: '#6c757d',
  mutedText: '#adb5bd',
  
  // Border colors
  cardBorder: '#dee2e6',
  inputBorder: '#ced4da',
  
  // Button colors
  primaryButton: '#0d6efd',
  primaryButtonHover: '#0b5ed7',
  secondaryButton: '#6c757d',
  secondaryButtonHover: '#5c636a',
  dangerButton: '#dc3545',
  dangerButtonHover: '#bb2d3b',
  
  // Input colors
  inputBackground: '#ffffff',
  inputText: '#212529',
  
  // Status colors
  pendingColor: '#ffc107',
  inProgressColor: '#0dcaf0',
  completedColor: '#198754',
  awaitingClientColor: '#fd7e14',
  
  // Priority colors
  lowPriorityBg: '#d1ecf1',
  mediumPriorityBg: '#fff3cd',
  highPriorityBg: '#f8d7da',
};

export const defaultDarkTheme: ThemeColors = {
  // Background colors
  pageBackground: '#0d1117',
  cardBackground: '#21262d',
  cardBackgroundHover: '#30363d',
  
  // Text colors
  primaryText: '#f0f6fc',
  secondaryText: '#8b949e',
  mutedText: '#6e7681',
  
  // Border colors
  cardBorder: '#30363d',
  inputBorder: '#30363d',
  
  // Button colors
  primaryButton: '#238be6',
  primaryButtonHover: '#1f7bd4',
  secondaryButton: '#8b949e',
  secondaryButtonHover: '#b1bac4',
  dangerButton: '#f85149',
  dangerButtonHover: '#da3633',
  
  // Input colors
  inputBackground: '#21262d',
  inputText: '#f0f6fc',
  
  // Status colors
  pendingColor: '#d29922',
  inProgressColor: '#1f6feb',
  completedColor: '#3fb950',
  awaitingClientColor: '#fb8500',
  
  // Priority colors
  lowPriorityBg: '#0d4529',
  mediumPriorityBg: '#4d2d00',
  highPriorityBg: '#4c1a1a',
};

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currentTheme: ThemeColors;
  lightTheme: ThemeColors;
  darkTheme: ThemeColors;
  updateLightTheme: (colors: Partial<ThemeColors>) => void;
  updateDarkTheme: (colors: Partial<ThemeColors>) => void;
  resetToDefaults: () => void;
  exportTheme: () => string;
  importTheme: (themeJson: string) => boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lightTheme, setLightTheme] = useState<ThemeColors>(defaultLightTheme);
  const [darkTheme, setDarkTheme] = useState<ThemeColors>(defaultDarkTheme);

  // Load saved themes and mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('isDarkMode');
    const savedLightTheme = localStorage.getItem('lightTheme');
    const savedDarkTheme = localStorage.getItem('darkTheme');

    if (savedDarkMode) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }

    if (savedLightTheme) {
      try {
        setLightTheme(JSON.parse(savedLightTheme));
      } catch (e) {
        console.error('Error loading light theme:', e);
      }
    }

    if (savedDarkTheme) {
      try {
        setDarkTheme(JSON.parse(savedDarkTheme));
      } catch (e) {
        console.error('Error loading dark theme:', e);
      }
    }
  }, []);

  // Save to localStorage when themes change
  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('lightTheme', JSON.stringify(lightTheme));
  }, [lightTheme]);

  useEffect(() => {
    localStorage.setItem('darkTheme', JSON.stringify(darkTheme));
  }, [darkTheme]);

  // Apply theme to CSS variables
  useEffect(() => {
    const theme = isDarkMode ? darkTheme : lightTheme;
    const root = document.documentElement;
    
    root.style.setProperty('--page-background', theme.pageBackground);
    root.style.setProperty('--card-background', theme.cardBackground);
    root.style.setProperty('--card-background-hover', theme.cardBackgroundHover);
    root.style.setProperty('--primary-text', theme.primaryText);
    root.style.setProperty('--secondary-text', theme.secondaryText);
    root.style.setProperty('--muted-text', theme.mutedText);
    root.style.setProperty('--card-border', theme.cardBorder);
    root.style.setProperty('--input-border', theme.inputBorder);
    root.style.setProperty('--primary-button', theme.primaryButton);
    root.style.setProperty('--primary-button-hover', theme.primaryButtonHover);
    root.style.setProperty('--secondary-button', theme.secondaryButton);
    root.style.setProperty('--secondary-button-hover', theme.secondaryButtonHover);
    root.style.setProperty('--danger-button', theme.dangerButton);
    root.style.setProperty('--danger-button-hover', theme.dangerButtonHover);
    root.style.setProperty('--input-background', theme.inputBackground);
    root.style.setProperty('--input-text', theme.inputText);
    root.style.setProperty('--pending-color', theme.pendingColor);
    root.style.setProperty('--in-progress-color', theme.inProgressColor);
    root.style.setProperty('--completed-color', theme.completedColor);
    root.style.setProperty('--awaiting-client-color', theme.awaitingClientColor);
    root.style.setProperty('--low-priority-bg', theme.lowPriorityBg);
    root.style.setProperty('--medium-priority-bg', theme.mediumPriorityBg);
    root.style.setProperty('--high-priority-bg', theme.highPriorityBg);
  }, [isDarkMode, lightTheme, darkTheme]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const updateLightTheme = (colors: Partial<ThemeColors>) => {
    setLightTheme(prev => ({ ...prev, ...colors }));
  };

  const updateDarkTheme = (colors: Partial<ThemeColors>) => {
    setDarkTheme(prev => ({ ...prev, ...colors }));
  };

  const resetToDefaults = () => {
    setLightTheme(defaultLightTheme);
    setDarkTheme(defaultDarkTheme);
  };

  const exportTheme = () => {
    return JSON.stringify({
      lightTheme,
      darkTheme,
    }, null, 2);
  };

  const importTheme = (themeJson: string): boolean => {
    try {
      const { lightTheme: importedLight, darkTheme: importedDark } = JSON.parse(themeJson);
      
      if (importedLight && importedDark) {
        setLightTheme(importedLight);
        setDarkTheme(importedDark);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error importing theme:', e);
      return false;
    }
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      toggleDarkMode,
      currentTheme,
      lightTheme,
      darkTheme,
      updateLightTheme,
      updateDarkTheme,
      resetToDefaults,
      exportTheme,
      importTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 