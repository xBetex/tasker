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
  descriptionFilter: string;
  setDescriptionFilter: (description: string) => void;
  commentFilter: string;
  setCommentFilter: (comment: string) => void;
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
  descriptionFilter,
  setDescriptionFilter,
  commentFilter,
  setCommentFilter,
  clients,
  darkMode,
}: AnalyticsFiltersProps) {
  
  const handleClearAllFilters = () => {
    setDateRange({ start: '', end: '' });
    setStatusFilter('all');
    setPriorityFilter('all');
    setClientSearch('');
    setSelectedClientId(null);
    setDescriptionFilter('');
    setCommentFilter('');
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
    descriptionFilter ||
    commentFilter ||
    (slaFilter && slaFilter !== 'all');

  // Obter nome do cliente selecionado para exibição
  const selectedClient = selectedClientId ? clients.find(c => c.id === selectedClientId) : null;
  const displayValue = selectedClient ? `${selectedClient.name} (${selectedClient.company})` : clientSearch;

  return (
    <div 
      className="p-4 rounded-lg shadow-lg border mb-8 transition-all duration-300 hover:shadow-xl"
      style={{
        backgroundColor: 'var(--card-background)',
        borderColor: 'var(--card-border)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--card-background-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--card-background)';
      }}
    >
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          <h3 
            className="text-base font-medium"
            style={{ color: 'var(--primary-text)' }}
          >
            Analytics Filters
          </h3>
          {hasActiveFilters && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              <span 
                className="text-xs font-medium px-2 py-1 rounded-full"
                style={{
                  backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                  color: darkMode ? 'rgb(147, 197, 253)' : 'rgb(29, 78, 216)'
                }}
              >
                {(() => {
                  let count = 0;
                  if (dateRange.start || dateRange.end) count++;
                  if (statusFilter !== 'all') count++;
                  if (priorityFilter !== 'all') count++;
                  if (clientSearch || selectedClientId) count++;
                  if (descriptionFilter) count++;
                  if (commentFilter) count++;
                  if (slaFilter && slaFilter !== 'all') count++;
                  return count;
                })()}
              </span>
            </div>
          )}
        </div>
        <p 
          className="text-sm"
          style={{ color: 'var(--secondary-text)' }}
        >
          Customize your analytics view
        </p>
        
        {hasActiveFilters && (
          <button
            onClick={handleClearAllFilters}
            className="mt-2 px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 hover:scale-105 border border-transparent"
            style={{
              color: 'var(--secondary-text)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)';
              e.currentTarget.style.borderColor = darkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.color = darkMode ? 'rgb(248, 113, 113)' : 'rgb(220, 38, 38)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.color = 'var(--secondary-text)';
            }}
          >
            ⨯ Clear All Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {/* Date Range Filter */}
        <div className="space-y-2">
          <label 
            className="block text-sm font-medium"
            style={{ color: 'var(--secondary-text)' }}
          >
            📅 Date Range
          </label>
          <div className="space-y-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="block w-full rounded-md text-sm transition-all duration-200 shadow-sm border px-3 py-2"
              style={{
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--input-border)',
                color: 'var(--input-text)'
              }}
              placeholder="Start date"
            />
            <div 
              className="text-center text-xs"
              style={{ color: 'var(--muted-text)' }}
            >
              to
            </div>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="block w-full rounded-md text-sm transition-all duration-200 shadow-sm border px-3 py-2"
              style={{
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--input-border)',
                color: 'var(--input-text)'
              }}
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
        <div className="space-y-2">
          <label 
            className="block text-sm font-medium"
            style={{ color: 'var(--secondary-text)' }}
          >
            🔍 Client Search
          </label>
          
          {selectedClientId ? (
            <div className="space-y-2">
              <div 
                className="p-3 rounded-md border"
                style={{
                  backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                  borderColor: darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)',
                  color: darkMode ? 'rgb(147, 197, 253)' : 'rgb(29, 78, 216)'
                }}
              >
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
                className="text-xs transition-colors"
                style={{ 
                  color: 'var(--muted-text)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--secondary-text)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--muted-text)';
                }}
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

        {/* Description Filter */}
        <div className="space-y-2">
          <label 
            className="block text-sm font-medium"
            style={{ color: 'var(--secondary-text)' }}
          >
            📝 Task Description
          </label>
          <input
            type="text"
            value={descriptionFilter}
            onChange={(e) => setDescriptionFilter(e.target.value)}
            className="block w-full rounded-md text-sm transition-all duration-200 shadow-sm border px-3 py-2"
            style={{
              backgroundColor: 'var(--input-background)',
              borderColor: 'var(--input-border)',
              color: 'var(--input-text)'
            }}
            placeholder="Search task content..."
          />
        </div>

        {/* Comment Filter */}
        <div className="space-y-2">
          <label 
            className="block text-sm font-medium"
            style={{ color: 'var(--secondary-text)' }}
          >
            💬 Comments
          </label>
          <input
            type="text"
            value={commentFilter}
            onChange={(e) => setCommentFilter(e.target.value)}
            className="block w-full rounded-md text-sm transition-all duration-200 shadow-sm border px-3 py-2"
            style={{
              backgroundColor: 'var(--input-background)',
              borderColor: 'var(--input-border)',
              color: 'var(--input-text)'
            }}
            placeholder="Search comments..."
          />
        </div>
      </div>
    </div>
  );
} 