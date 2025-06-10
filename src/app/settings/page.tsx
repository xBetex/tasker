'use client'

import { useState, useRef } from 'react';
import { useTheme, ThemeColors } from '../contexts/ThemeContext';

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
        alert('Tema importado com sucesso!');
      } else {
        alert('Erro ao importar tema. Verifique o arquivo.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--page-background)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--primary-text)' }}>
            Configurações de Tema
          </h1>
          <p style={{ color: 'var(--secondary-text)' }}>
            Personalize as cores da aplicação para cada modo (claro e escuro)
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 p-4 rounded-lg border" 
             style={{ 
               backgroundColor: 'var(--card-background)', 
               borderColor: 'var(--card-border)' 
             }}>
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
                  Modo Escuro Ativo
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
                  Tema Claro
                </button>
                <button
                  onClick={() => setActiveTab('dark')}
                  className="px-4 py-2 text-sm transition-colors"
                  style={{
                    backgroundColor: activeTab === 'dark' ? 'var(--primary-button)' : 'var(--card-background)',
                    color: activeTab === 'dark' ? 'white' : 'var(--primary-text)'
                  }}
                >
                  Tema Escuro
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="px-4 py-2 text-white rounded transition-colors text-sm"
                style={{ backgroundColor: 'var(--primary-button)' }}
              >
                Exportar
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
                Importar
              </button>
              
              <button
                onClick={resetToDefaults}
                className="px-4 py-2 text-white rounded transition-colors text-sm"
                style={{ backgroundColor: 'var(--danger-button)' }}
              >
                Resetar
              </button>
            </div>
          </div>
        </div>

        {/* Color Settings */}
        <div className="space-y-8">
          <ColorSection title="Cores de Fundo">
            <ColorInput
              label="Fundo da Página"
              value={currentTheme.pageBackground}
              onChange={(value) => handleColorChange('pageBackground', value)}
              description="Cor de fundo principal da aplicação"
            />
            <ColorInput
              label="Fundo dos Cards"
              value={currentTheme.cardBackground}
              onChange={(value) => handleColorChange('cardBackground', value)}
              description="Cor de fundo dos cards e painéis"
            />
            <ColorInput
              label="Fundo dos Cards (Hover)"
              value={currentTheme.cardBackgroundHover}
              onChange={(value) => handleColorChange('cardBackgroundHover', value)}
              description="Cor de fundo dos cards ao passar o mouse"
            />
          </ColorSection>

          <ColorSection title="Cores de Texto">
            <ColorInput
              label="Texto Principal"
              value={currentTheme.primaryText}
              onChange={(value) => handleColorChange('primaryText', value)}
              description="Cor do texto principal (títulos, labels)"
            />
            <ColorInput
              label="Texto Secundário"
              value={currentTheme.secondaryText}
              onChange={(value) => handleColorChange('secondaryText', value)}
              description="Cor do texto secundário (descrições, info)"
            />
            <ColorInput
              label="Texto Esmaecido"
              value={currentTheme.mutedText}
              onChange={(value) => handleColorChange('mutedText', value)}
              description="Cor do texto menos importante"
            />
          </ColorSection>

          <ColorSection title="Bordas">
            <ColorInput
              label="Borda dos Cards"
              value={currentTheme.cardBorder}
              onChange={(value) => handleColorChange('cardBorder', value)}
              description="Cor das bordas dos cards e elementos"
            />
            <ColorInput
              label="Borda dos Inputs"
              value={currentTheme.inputBorder}
              onChange={(value) => handleColorChange('inputBorder', value)}
              description="Cor das bordas dos campos de entrada"
            />
          </ColorSection>

          <ColorSection title="Botões">
            <ColorInput
              label="Botão Primário"
              value={currentTheme.primaryButton}
              onChange={(value) => handleColorChange('primaryButton', value)}
              description="Cor dos botões principais"
            />
            <ColorInput
              label="Botão Primário (Hover)"
              value={currentTheme.primaryButtonHover}
              onChange={(value) => handleColorChange('primaryButtonHover', value)}
              description="Cor dos botões principais ao passar o mouse"
            />
            <ColorInput
              label="Botão Secundário"
              value={currentTheme.secondaryButton}
              onChange={(value) => handleColorChange('secondaryButton', value)}
              description="Cor dos botões secundários"
            />
            <ColorInput
              label="Botão Secundário (Hover)"
              value={currentTheme.secondaryButtonHover}
              onChange={(value) => handleColorChange('secondaryButtonHover', value)}
              description="Cor dos botões secundários ao passar o mouse"
            />
            <ColorInput
              label="Botão de Perigo"
              value={currentTheme.dangerButton}
              onChange={(value) => handleColorChange('dangerButton', value)}
              description="Cor dos botões de ação perigosa (deletar)"
            />
            <ColorInput
              label="Botão de Perigo (Hover)"
              value={currentTheme.dangerButtonHover}
              onChange={(value) => handleColorChange('dangerButtonHover', value)}
              description="Cor dos botões de perigo ao passar o mouse"
            />
          </ColorSection>

          <ColorSection title="Campos de Entrada">
            <ColorInput
              label="Fundo dos Inputs"
              value={currentTheme.inputBackground}
              onChange={(value) => handleColorChange('inputBackground', value)}
              description="Cor de fundo dos campos de entrada"
            />
            <ColorInput
              label="Texto dos Inputs"
              value={currentTheme.inputText}
              onChange={(value) => handleColorChange('inputText', value)}
              description="Cor do texto dentro dos campos"
            />
          </ColorSection>

          <ColorSection title="Status das Tarefas">
            <ColorInput
              label="Pendente"
              value={currentTheme.pendingColor}
              onChange={(value) => handleColorChange('pendingColor', value)}
              description="Cor para tarefas pendentes"
            />
            <ColorInput
              label="Em Progresso"
              value={currentTheme.inProgressColor}
              onChange={(value) => handleColorChange('inProgressColor', value)}
              description="Cor para tarefas em progresso"
            />
            <ColorInput
              label="Concluída"
              value={currentTheme.completedColor}
              onChange={(value) => handleColorChange('completedColor', value)}
              description="Cor para tarefas concluídas"
            />
            <ColorInput
              label="Aguardando Cliente"
              value={currentTheme.awaitingClientColor}
              onChange={(value) => handleColorChange('awaitingClientColor', value)}
              description="Cor para tarefas aguardando cliente"
            />
          </ColorSection>

          <ColorSection title="Prioridades">
            <ColorInput
              label="Baixa Prioridade"
              value={currentTheme.lowPriorityBg}
              onChange={(value) => handleColorChange('lowPriorityBg', value)}
              description="Cor de fundo para baixa prioridade"
            />
            <ColorInput
              label="Média Prioridade"
              value={currentTheme.mediumPriorityBg}
              onChange={(value) => handleColorChange('mediumPriorityBg', value)}
              description="Cor de fundo para média prioridade"
            />
            <ColorInput
              label="Alta Prioridade"
              value={currentTheme.highPriorityBg}
              onChange={(value) => handleColorChange('highPriorityBg', value)}
              description="Cor de fundo para alta prioridade"
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
            Prévia do Tema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded border" 
                 style={{ 
                   backgroundColor: 'var(--card-background)', 
                   borderColor: 'var(--card-border)' 
                 }}>
              <h4 className="font-semibold mb-2" style={{ color: 'var(--primary-text)' }}>
                Card de Exemplo
              </h4>
              <p className="text-sm mb-3" style={{ color: 'var(--secondary-text)' }}>
                Este é um exemplo de como os cards ficam com as cores atuais.
              </p>
              <div className="flex gap-2">
                <button 
                  className="px-3 py-1 rounded text-white text-sm"
                  style={{ backgroundColor: 'var(--primary-button)' }}
                >
                  Primário
                </button>
                <button 
                  className="px-3 py-1 rounded text-white text-sm"
                  style={{ backgroundColor: 'var(--secondary-button)' }}
                >
                  Secundário
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <span className="px-2 py-1 rounded text-xs text-white" 
                      style={{ backgroundColor: 'var(--pending-color)' }}>
                  Pendente
                </span>
                <span className="px-2 py-1 rounded text-xs text-white" 
                      style={{ backgroundColor: 'var(--in-progress-color)' }}>
                  Em Progresso
                </span>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-1 rounded text-xs text-white" 
                      style={{ backgroundColor: 'var(--completed-color)' }}>
                  Concluída
                </span>
                <span className="px-2 py-1 rounded text-xs text-white" 
                      style={{ backgroundColor: 'var(--awaiting-client-color)' }}>
                  Aguardando
                </span>
              </div>
              <input 
                type="text" 
                placeholder="Campo de exemplo" 
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
  );
} 