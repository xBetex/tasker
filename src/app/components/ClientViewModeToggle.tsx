import { GridIcon, ListIcon } from './Icons';

export type ViewMode = 'compact' | 'list';

interface ClientViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  darkMode: boolean;
}

export default function ClientViewModeToggle({
  viewMode,
  onViewModeChange,
  darkMode
}: ClientViewModeToggleProps) {
  const modes = [
    { 
      key: 'compact' as ViewMode, 
      icon: GridIcon, 
      label: 'Cards',
      description: 'Cards expandíveis com todas as funcionalidades'
    },
    { 
      key: 'list' as ViewMode, 
      icon: ListIcon, 
      label: 'Lista',
      description: 'Lista compacta ordenável'
    }
  ];

  return (
    <div className={`flex rounded-lg p-1 ${
      darkMode ? 'bg-gray-700' : 'bg-gray-200'
    }`}>
      {modes.map(({ key, icon: Icon, label, description }) => (
        <button
          key={key}
          onClick={() => onViewModeChange(key)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
            viewMode === key
              ? darkMode 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-500 text-white'
              : darkMode
                ? 'text-gray-300 hover:bg-gray-600'
                : 'text-gray-600 hover:bg-gray-300'
          }`}
          title={description}
        >
          <Icon size={16} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
} 