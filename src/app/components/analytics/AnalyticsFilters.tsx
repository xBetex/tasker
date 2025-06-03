'use client'

import { Client, TaskStatus, TaskPriority } from '@/types/types';
import { SLAFilter } from '@/app/components/FilterBar';
import ToggleFilterButton from './ToggleFilterButton';
import ClientSearchInput from './ClientSearchInput';

interface AnalyticsFiltersProps {
  dateRange: { start: string; end: string };
  setDateRange: (range: { start: string; end: string }) => void;
  statusFilter: TaskStatus | 'all';
  setStatusFilter: (status: TaskStatus | 'all') => void;
  priorityFilter: TaskPriority | 'all';
  setPriorityFilter: (priority: TaskPriority | 'all') => void;
  clientSearch: string;
  setClientSearch: (search: string) => void;
  selectedClientId: string | null;
  setSelectedClientId: (clientId: string | null) => void;
  slaFilter?: SLAFilter;
  setSlaFilter?: (slaFilter: SLAFilter) => void;
  clients: Client[];
  darkMode: boolean;
}

export default function AnalyticsFilters({
  dateRange,
  setDateRange,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  clientSearch,
  setClientSearch,
  selectedClientId,
  setSelectedClientId,
  slaFilter,
  setSlaFilter,
  clients,
  darkMode,
}: AnalyticsFiltersProps) {
  
  const handleClearAllFilters = () => {
    setDateRange({ start: '', end: '' });
    setStatusFilter('all');
    setPriorityFilter('all');
    setClientSearch('');
    setSelectedClientId(null);
    if (setSlaFilter) {
      setSlaFilter('all');
    }
  };

  const hasActiveFilters = 
    dateRange.start || 
    dateRange.end || 
    statusFilter !== 'all' || 
    priorityFilter !== 'all' || 
    clientSearch ||
    selectedClientId ||
    (slaFilter && slaFilter !== 'all');

  // Obter nome do cliente selecionado para exibição
  const selectedClient = selectedClientId ? clients.find(c => c.id === selectedClientId) : null;
  const displayValue = selectedClient ? `${selectedClient.name} (${selectedClient.company})` : clientSearch;

  return (
    <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg border mb-8 transition-all duration-200`}>
      <div className="mb-6">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
          Filters & Search
        </h3>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Customize your analytics view
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Date Range Filter */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            📅 Date Range
          </label>
          <div className="space-y-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className={`block w-full rounded-lg text-sm transition-all duration-200 ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
              } shadow-sm border px-3 py-2`}
              placeholder="Start date"
            />
            <div className={`text-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              to
            </div>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className={`block w-full rounded-lg text-sm transition-all duration-200 ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
              } shadow-sm border px-3 py-2`}
              placeholder="End date"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <ToggleFilterButton
            options={['pending', 'in progress', 'completed', 'awaiting client']}
            value={statusFilter}
            onChange={setStatusFilter}
            darkMode={darkMode}
            label="📊 Task Status"
          />
        </div>

        {/* Priority Filter */}
        <div>
          <ToggleFilterButton
            options={['low', 'medium', 'high']}
            value={priorityFilter}
            onChange={setPriorityFilter}
            darkMode={darkMode}
            label="⚡ Priority Level"
          />
        </div>

        {/* SLA Filter */}
        {setSlaFilter && (
          <div>
            <ToggleFilterButton
              options={['overdue', 'due_today', 'due_this_week', 'on_track', 'no_sla']}
              value={slaFilter || 'all'}
              onChange={setSlaFilter}
              darkMode={darkMode}
              label="⏰ SLA Status"
              optionLabels={{
                'overdue': '🚨 Overdue',
                'due_today': '⚠️ Due Today',
                'due_this_week': '⏰ Due This Week',
                'on_track': '✅ On Track',
                'no_sla': '📝 No SLA'
              }}
            />
          </div>
        )}

        {/* Client Search */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            🔍 Client Search
          </label>
          
          {/* Display selected client or show search input */}
          {selectedClientId ? (
            <div className="space-y-2">
              <div className={`p-3 rounded-lg border ${
                darkMode ? 'bg-blue-600 border-blue-500 text-white' : 'bg-blue-100 border-blue-300 text-blue-900'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{displayValue}</span>
                  <button
                    onClick={() => setSelectedClientId(null)}
                    className="ml-2 text-xs hover:opacity-75"
                    title="Clear selection"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <button
                onClick={() => setSelectedClientId(null)}
                className={`text-xs ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'} transition-colors`}
              >
                Change client selection
              </button>
            </div>
          ) : (
            <ClientSearchInput
              clients={clients}
              onClientSelect={(clientId) => setSelectedClientId(clientId)}
              placeholder="Search by name or company"
              darkMode={darkMode}
            />
          )}
        </div>
      </div>

      {/* Actions Bar */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {hasActiveFilters ? (
            <span className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              Filters applied
            </span>
          ) : (
            'No filters applied'
          )}
        </div>
        
        <div className="flex gap-3">
          {hasActiveFilters && (
            <button
              onClick={handleClearAllFilters}
              className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              Clear All
            </button>
          )}
          
          <button
            className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${
              darkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
} 