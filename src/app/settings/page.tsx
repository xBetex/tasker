'use client'

import { useState, useRef } from 'react';
import { useTheme, ThemeColors } from '../contexts/ThemeContext';
import { useTimezone, TIMEZONE_OPTIONS } from '../contexts/TimezoneContext';
import AuthGuard from '../components/auth/AuthGuard';

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

function ColorInput({ label, value, onChange, description }: ColorInputProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border" 
         style={{ 
           backgroundColor: 'var(--card-background)', 
           borderColor: 'var(--card-border)' 
         }}>
      <div className="flex-1">
        <label className="font-medium" style={{ color: 'var(--primary-text)' }}>
          {label}
        </label>
        {description && (
          <p className="text-sm mt-1" style={{ color: 'var(--secondary-text)' }}>
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-8 rounded border cursor-pointer"
          style={{ borderColor: 'var(--input-border)' }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 px-2 py-1 text-sm rounded border font-mono"
          style={{ 
            backgroundColor: 'var(--input-background)',
            borderColor: 'var(--input-border)',
            color: 'var(--input-text)'
          }}
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

interface ColorSectionProps {
  title: string;
  children: React.ReactNode;
}

function ColorSection({ title, children }: ColorSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" style={{ color: 'var(--primary-text)' }}>
        {title}
      </h3>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const {
    isDarkMode,
    toggleDarkMode,
    lightTheme,
    darkTheme,
    updateLightTheme,
    updateDarkTheme,
    resetToDefaults,
    exportTheme,
    importTheme
  } = useTheme();

  const { timezone, setTimezone } = useTimezone();

  const [activeTab, setActiveTab] = useState<'light' | 'dark'>('light');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTheme = activeTab === 'light' ? lightTheme : darkTheme;
  const updateTheme = activeTab === 'light' ? updateLightTheme : updateDarkTheme;

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    updateTheme({ [key]: value });
  };

  const handleExport = () => {
    const themeData = exportTheme();
    const blob = new Blob([themeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'theme-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (importTheme(content)) {
        alert('Theme imported successfully!');
      } else {
        alert('Error importing theme. Please check the file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--page-background)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--primary-text)' }}>
            ⚙️ Settings
          </h1>
          <p style={{ color: 'var(--secondary-text)' }}>
            Customize application settings, including theme and timezone
          </p>
        </div>

        {/* Timezone Settings */}
        <div className="mb-6 p-6 rounded-lg border max-w-2xl mx-auto" 
             style={{ 
               backgroundColor: 'var(--card-background)', 
               borderColor: 'var(--card-border)' 
             }}>
          <h2 className="text-xl font-semibold mb-6 text-center" style={{ color: 'var(--primary-text)' }}>
            🌍 Timezone Settings
          </h2>
          <div className="flex flex-col items-center space-y-6">
            <div className="w-full max-w-md">
              <label className="block text-sm font-medium mb-2 text-center" style={{ color: 'var(--primary-text)' }}>
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 rounded-md border text-sm"
                style={{
                  backgroundColor: 'var(--input-background)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--input-text)'
                }}
              >
                {TIMEZONE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs mt-2 text-center" style={{ color: 'var(--secondary-text)' }}>
                All dates and times will be displayed in this timezone
              </p>
            </div>
            <div className="text-center p-6 rounded-lg border" 
                 style={{ 
                   backgroundColor: 'var(--card-background-hover)', 
                   borderColor: 'var(--card-border)' 
                 }}>
              <div className="text-3xl mb-3">🕐</div>
              <div className="text-sm font-medium mb-2" style={{ color: 'var(--primary-text)' }}>
                Current Time
              </div>
              <div className="text-2xl font-bold mb-1" style={{ color: 'var(--primary-text)' }}>
                {new Date().toLocaleString('en-US', { 
                  timeZone: timezone,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
              <div className="text-sm" style={{ color: 'var(--secondary-text)' }}>
                {new Date().toLocaleDateString('en-US', { 
                  timeZone: timezone,
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Theme Controls */}
        <div className="mb-6 p-4 rounded-lg border" 
             style={{ 
               backgroundColor: 'var(--card-background)', 
               borderColor: 'var(--card-border)' 
             }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--primary-text)' }}>
            🎨 Theme Settings
          </h2>
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={toggleDarkMode}
                  className="w-4 h-4"
                />
                <span style={{ color: 'var(--primary-text)' }}>
                  Dark Mode Active
                </span>
              </label>

              <div className="flex rounded-lg border overflow-hidden">
                <button
                  onClick={() => setActiveTab('light')}
                  className="px-4 py-2 text-sm transition-colors"
                  style={{
                    backgroundColor: activeTab === 'light' ? 'var(--primary-button)' : 'var(--card-background)',
                    color: activeTab === 'light' ? 'white' : 'var(--primary-text)'
                  }}
                >
                  Light Theme
                </button>
                <button
                  onClick={() => setActiveTab('dark')}
                  className="px-4 py-2 text-sm transition-colors"
                  style={{
                    backgroundColor: activeTab === 'dark' ? 'var(--primary-button)' : 'var(--card-background)',
                    color: activeTab === 'dark' ? 'white' : 'var(--primary-text)'
                  }}
                >
                  Dark Theme
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="px-4 py-2 text-white rounded transition-colors text-sm"
                style={{ backgroundColor: 'var(--primary-button)' }}
              >
                Export
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded transition-colors text-sm"
                style={{
                  backgroundColor: 'var(--secondary-button)',
                  color: 'white'
                }}
              >
                Import
              </button>
              
              <button
                onClick={resetToDefaults}
                className="px-4 py-2 text-white rounded transition-colors text-sm"
                style={{ backgroundColor: 'var(--danger-button)' }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Color Settings */}
        <div className="space-y-8">
          <ColorSection title="Background Colors">
            <ColorInput
              label="Page Background"
              value={currentTheme.pageBackground}
              onChange={(value) => handleColorChange('pageBackground', value)}
              description="Main application background color"
            />
            <ColorInput
              label="Card Background"
              value={currentTheme.cardBackground}
              onChange={(value) => handleColorChange('cardBackground', value)}
              description="Background color for cards and panels"
            />
            <ColorInput
              label="Card Background (Hover)"
              value={currentTheme.cardBackgroundHover}
              onChange={(value) => handleColorChange('cardBackgroundHover', value)}
              description="Card background color on hover"
            />
          </ColorSection>

          <ColorSection title="Text Colors">
            <ColorInput
              label="Primary Text"
              value={currentTheme.primaryText}
              onChange={(value) => handleColorChange('primaryText', value)}
              description="Primary text color (titles, labels)"
            />
            <ColorInput
              label="Secondary Text"
              value={currentTheme.secondaryText}
              onChange={(value) => handleColorChange('secondaryText', value)}
              description="Secondary text color (descriptions, info)"
            />
            <ColorInput
              label="Muted Text"
              value={currentTheme.mutedText}
              onChange={(value) => handleColorChange('mutedText', value)}
              description="Less important text color"
            />
          </ColorSection>

          <ColorSection title="Borders">
            <ColorInput
              label="Card Border"
              value={currentTheme.cardBorder}
              onChange={(value) => handleColorChange('cardBorder', value)}
              description="Border color for cards and elements"
            />
            <ColorInput
              label="Input Border"
              value={currentTheme.inputBorder}
              onChange={(value) => handleColorChange('inputBorder', value)}
              description="Border color for input fields"
            />
          </ColorSection>

          <ColorSection title="Buttons">
            <ColorInput
              label="Primary Button"
              value={currentTheme.primaryButton}
              onChange={(value) => handleColorChange('primaryButton', value)}
              description="Primary button color"
            />
            <ColorInput
              label="Primary Button (Hover)"
              value={currentTheme.primaryButtonHover}
              onChange={(value) => handleColorChange('primaryButtonHover', value)}
              description="Primary button color on hover"
            />
            <ColorInput
              label="Secondary Button"
              value={currentTheme.secondaryButton}
              onChange={(value) => handleColorChange('secondaryButton', value)}
              description="Secondary button color"
            />
            <ColorInput
              label="Secondary Button (Hover)"
              value={currentTheme.secondaryButtonHover}
              onChange={(value) => handleColorChange('secondaryButtonHover', value)}
              description="Secondary button color on hover"
            />
            <ColorInput
              label="Danger Button"
              value={currentTheme.dangerButton}
              onChange={(value) => handleColorChange('dangerButton', value)}
              description="Dangerous action button color (delete)"
            />
            <ColorInput
              label="Danger Button (Hover)"
              value={currentTheme.dangerButtonHover}
              onChange={(value) => handleColorChange('dangerButtonHover', value)}
              description="Danger button color on hover"
            />
          </ColorSection>

          <ColorSection title="Input Fields">
            <ColorInput
              label="Input Background"
              value={currentTheme.inputBackground}
              onChange={(value) => handleColorChange('inputBackground', value)}
              description="Background color for input fields"
            />
            <ColorInput
              label="Input Text"
              value={currentTheme.inputText}
              onChange={(value) => handleColorChange('inputText', value)}
              description="Text color inside input fields"
            />
          </ColorSection>

          <ColorSection title="Task Status">
            <ColorInput
              label="Pending"
              value={currentTheme.pendingColor}
              onChange={(value) => handleColorChange('pendingColor', value)}
              description="Color for pending tasks"
            />
            <ColorInput
              label="In Progress"
              value={currentTheme.inProgressColor}
              onChange={(value) => handleColorChange('inProgressColor', value)}
              description="Color for tasks in progress"
            />
            <ColorInput
              label="Completed"
              value={currentTheme.completedColor}
              onChange={(value) => handleColorChange('completedColor', value)}
              description="Color for completed tasks"
            />
            <ColorInput
              label="Awaiting Client"
              value={currentTheme.awaitingClientColor}
              onChange={(value) => handleColorChange('awaitingClientColor', value)}
              description="Color for tasks awaiting client"
            />
          </ColorSection>

          <ColorSection title="Priorities">
            <ColorInput
              label="Low Priority"
              value={currentTheme.lowPriorityBg}
              onChange={(value) => handleColorChange('lowPriorityBg', value)}
              description="Background color for low priority"
            />
            <ColorInput
              label="Medium Priority"
              value={currentTheme.mediumPriorityBg}
              onChange={(value) => handleColorChange('mediumPriorityBg', value)}
              description="Background color for medium priority"
            />
            <ColorInput
              label="High Priority"
              value={currentTheme.highPriorityBg}
              onChange={(value) => handleColorChange('highPriorityBg', value)}
              description="Background color for high priority"
            />
          </ColorSection>
        </div>

        {/* Preview Section */}
        <div className="mt-8 p-4 rounded-lg border" 
             style={{ 
               backgroundColor: 'var(--card-background)', 
               borderColor: 'var(--card-border)' 
             }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--primary-text)' }}>
            Theme Preview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded border" 
                 style={{ 
                   backgroundColor: 'var(--card-background)', 
                   borderColor: 'var(--card-border)' 
                 }}>
              <h4 className="font-semibold mb-2" style={{ color: 'var(--primary-text)' }}>
                Sample Card
              </h4>
              <p className="text-sm mb-3" style={{ color: 'var(--secondary-text)' }}>
                This is an example of how cards look with current colors.
              </p>
              <div className="flex gap-2">
                <button 
                  className="px-3 py-1 rounded text-white text-sm"
                  style={{ backgroundColor: 'var(--primary-button)' }}
                >
                  Primary
                </button>
                <button 
                  className="px-3 py-1 rounded text-white text-sm"
                  style={{ backgroundColor: 'var(--secondary-button)' }}
                >
                  Secondary
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <span className="px-2 py-1 rounded text-xs text-white" 
                      style={{ backgroundColor: 'var(--pending-color)' }}>
                  Pending
                </span>
                <span className="px-2 py-1 rounded text-xs text-white" 
                      style={{ backgroundColor: 'var(--in-progress-color)' }}>
                  In Progress
                </span>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-1 rounded text-xs text-white" 
                      style={{ backgroundColor: 'var(--completed-color)' }}>
                  Completed
                </span>
                <span className="px-2 py-1 rounded text-xs text-white" 
                      style={{ backgroundColor: 'var(--awaiting-client-color)' }}>
                  Awaiting
                </span>
              </div>
              <input 
                type="text" 
                placeholder="Sample input field" 
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ 
                  backgroundColor: 'var(--input-background)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--input-text)'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
} 