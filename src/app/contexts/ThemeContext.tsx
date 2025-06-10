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
  pageBackground: '#ffffff',
  cardBackground: '#ffffff',
  cardBackgroundHover: '#f8f9fa',
  
  // Text colors
  primaryText: '#000000',
  secondaryText: '#4a5568',
  mutedText: '#718096',
  
  // Border colors
  cardBorder: '#e2e8f0',
  inputBorder: '#cbd5e0',
  
  // Button colors
  primaryButton: '#3182ce',
  primaryButtonHover: '#2c5aa0',
  secondaryButton: '#718096',
  secondaryButtonHover: '#4a5568',
  dangerButton: '#e53e3e',
  dangerButtonHover: '#c53030',
  
  // Input colors
  inputBackground: '#ffffff',
  inputText: '#000000',
  
  // Status colors
  pendingColor: '#ed8936',
  inProgressColor: '#3182ce',
  completedColor: '#38a169',
  awaitingClientColor: '#d69e2e',
  
  // Priority colors
  lowPriorityBg: '#c6f6d5',
  mediumPriorityBg: '#fef5e7',
  highPriorityBg: '#fed7d7',
};

export const defaultDarkTheme: ThemeColors = {
  // Background colors
  pageBackground: '#1a202c',
  cardBackground: '#2d3748',
  cardBackgroundHover: '#4a5568',
  
  // Text colors
  primaryText: '#ffffff',
  secondaryText: '#a0aec0',
  mutedText: '#718096',
  
  // Border colors
  cardBorder: '#4a5568',
  inputBorder: '#718096',
  
  // Button colors
  primaryButton: '#4299e1',
  primaryButtonHover: '#3182ce',
  secondaryButton: '#718096',
  secondaryButtonHover: '#a0aec0',
  dangerButton: '#f56565',
  dangerButtonHover: '#e53e3e',
  
  // Input colors
  inputBackground: '#2d3748',
  inputText: '#ffffff',
  
  // Status colors
  pendingColor: '#ed8936',
  inProgressColor: '#4299e1',
  completedColor: '#48bb78',
  awaitingClientColor: '#d69e2e',
  
  // Priority colors
  lowPriorityBg: '#22543d',
  mediumPriorityBg: '#744210',
  highPriorityBg: '#742a2a',
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