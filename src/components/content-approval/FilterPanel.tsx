import React, { useState, useEffect } from 'react';
import { Filter, X, Calendar, Users, Tag, Priority, Search, Save, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FilterOptions {
  status: string[];
  content_type: string[];
  platform: string[];
  priority: string[];
  assignees: string[];
  tags: string[];
  date_range: {
    start: string;
    end: string;
  };
  search_query: string;
  campaign_id: string[];
  workflow_id: string[];
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: FilterOptions;
  created_by: string;
  created_at: string;
  is_default: boolean;
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  availableOptions: {
    statuses: Array<{ value: string; label: string; color: string; }>;
    contentTypes: Array<{ value: string; label: string; }>;
    platforms: Array<{ value: string; label: string; }>;
    priorities: Array<{ value: string; label: string; color: string; }>;
    users: Array<{ id: string; name: string; email: string; }>;
    tags: string[];
    campaigns: Array<{ id: string; name: string; }>;
    workflows: Array<{ id: string; name: string; }>;
  };
  presets?: FilterPreset[];
  onSavePreset?: (name: string, filters: FilterOptions) => void;
  onLoadPreset?: (preset: FilterPreset) => void;
  onDeletePreset?: (presetId: string) => void;
}

const defaultFilters: FilterOptions = {
  status: [],
  content_type: [],
  platform: [],
  priority: [],
  assignees: [],
  tags: [],
  date_range: { start: '', end: '' },
  search_query: '',
  campaign_id: [],
  workflow_id: []
};

export default function FilterPanel({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onApplyFilters,
  onResetFilters,
  availableOptions,
  presets = [],
  onSavePreset,
  onLoadPreset,
  onDeletePreset
}: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['status', 'content_type']);
  const [presetName, setPresetName] = useState('');
  const [showPresetForm, setShowPresetForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.search_query);

  useEffect(() => {
    setSearchQuery(filters.search_query);
  }, [filters.search_query]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayValue = (key: keyof FilterOptions, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateFilter('search_query', value);
  };

  const savePreset = () => {
    if (presetName.trim() && onSavePreset) {
      onSavePreset(presetName.trim(), filters);
      setPresetName('');
      setShowPresetForm(false);
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.content_type.length > 0) count++;
    if (filters.platform.length > 0) count++;
    if (filters.priority.length > 0) count++;
    if (filters.assignees.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.date_range.start || filters.date_range.end) count++;
    if (filters.search_query) count++;
    if (filters.campaign_id.length > 0) count++;
    if (filters.workflow_id.length > 0) count++;
    return count;
  };

  const SectionHeader = ({ title, icon: Icon, section }: { title: string; icon: any; section: string; }) => {
    const isExpanded = expandedSections.includes(section);
    return (
      <button
        onClick={() => toggleSection(section)}
        className="flex items-center justify-between w-full py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Icon className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-700">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-screen max-w-md"
          >
            <div className="h-full flex flex-col bg-white shadow-xl">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                    {getActiveFilterCount() > 0 && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                        {getActiveFilterCount()} active
                      </span>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search content..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filter Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                {/* Presets */}
                {presets.length > 0 && (
                  <div>
                    <SectionHeader title="Saved Filters" icon={Save} section="presets" />
                    <AnimatePresence>
                      {expandedSections.includes('presets') && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-3 space-y-2"
                        >
                          {presets.map(preset => (
                            <div key={preset.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <button
                                onClick={() => onLoadPreset?.(preset)}
                                className="flex-1 text-left text-sm text-gray-700 hover:text-gray-900"
                              >
                                {preset.name}
                                {preset.is_default && (
                                  <span className="ml-2 text-xs text-blue-600">(Default)</span>
                                )}
                              </button>
                              {onDeletePreset && (
                                <button
                                  onClick={() => onDeletePreset(preset.id)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Status Filter */}
                <div>
                  <SectionHeader title="Status" icon={Priority} section="status" />
                  <AnimatePresence>
                    {expandedSections.includes('status') && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 space-y-2"
                      >
                        {availableOptions.statuses.map(status => (
                          <label key={status.value} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.status.includes(status.value)}
                              onChange={() => toggleArrayValue('status', status.value)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${status.color}`} />
                              <span className="text-sm text-gray-700">{status.label}</span>
                            </div>
                          </label>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Content Type Filter */}
                <div>
                  <SectionHeader title="Content Type" icon={Tag} section="content_type" />
                  <AnimatePresence>
                    {expandedSections.includes('content_type') && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 space-y-2"
                      >
                        {availableOptions.contentTypes.map(type => (
                          <label key={type.value} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.content_type.includes(type.value)}
                              onChange={() => toggleArrayValue('content_type', type.value)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{type.label}</span>
                          </label>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Platform Filter */}
                <div>
                  <SectionHeader title="Platform" icon={Tag} section="platform" />
                  <AnimatePresence>
                    {expandedSections.includes('platform') && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 space-y-2"
                      >
                        {availableOptions.platforms.map(platform => (
                          <label key={platform.value} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.platform.includes(platform.value)}
                              onChange={() => toggleArrayValue('platform', platform.value)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{platform.label}</span>
                          </label>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Priority Filter */}
                <div>
                  <SectionHeader title="Priority" icon={Priority} section="priority" />
                  <AnimatePresence>
                    {expandedSections.includes('priority') && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 space-y-2"
                      >
                        {availableOptions.priorities.map(priority => (
                          <label key={priority.value} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.priority.includes(priority.value)}
                              onChange={() => toggleArrayValue('priority', priority.value)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${priority.color}`} />
                              <span className="text-sm text-gray-700">{priority.label}</span>
                            </div>
                          </label>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Assignees Filter */}
                <div>
                  <SectionHeader title="Assignees" icon={Users} section="assignees" />
                  <AnimatePresence>
                    {expandedSections.includes('assignees') && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 space-y-2 max-h-48 overflow-y-auto"
                      >
                        {availableOptions.users.map(user => (
                          <label key={user.id} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.assignees.includes(user.id)}
                              onChange={() => toggleArrayValue('assignees', user.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                              <p className="text-sm text-gray-700">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </label>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Tags Filter */}
                <div>
                  <SectionHeader title="Tags" icon={Tag} section="tags" />
                  <AnimatePresence>
                    {expandedSections.includes('tags') && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 space-y-2 max-h-48 overflow-y-auto"
                      >
                        {availableOptions.tags.map(tag => (
                          <label key={tag} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.tags.includes(tag)}
                              onChange={() => toggleArrayValue('tags', tag)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">#{tag}</span>
                          </label>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Date Range Filter */}
                <div>
                  <SectionHeader title="Date Range" icon={Calendar} section="date_range" />
                  <AnimatePresence>
                    {expandedSections.includes('date_range') && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 space-y-3"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={filters.date_range.start}
                            onChange={(e) => updateFilter('date_range', { ...filters.date_range, start: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={filters.date_range.end}
                            onChange={(e) => updateFilter('date_range', { ...filters.date_range, end: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Campaign Filter */}
                <div>
                  <SectionHeader title="Campaign" icon={Tag} section="campaign" />
                  <AnimatePresence>
                    {expandedSections.includes('campaign') && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 space-y-2"
                      >
                        {availableOptions.campaigns.map(campaign => (
                          <label key={campaign.id} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.campaign_id.includes(campaign.id)}
                              onChange={() => toggleArrayValue('campaign_id', campaign.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{campaign.name}</span>
                          </label>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Workflow Filter */}
                <div>
                  <SectionHeader title="Workflow" icon={Priority} section="workflow" />
                  <AnimatePresence>
                    {expandedSections.includes('workflow') && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 space-y-2"
                      >
                        {availableOptions.workflows.map(workflow => (
                          <label key={workflow.id} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.workflow_id.includes(workflow.id)}
                              onChange={() => toggleArrayValue('workflow_id', workflow.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{workflow.name}</span>
                          </label>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Save Preset Form */}
              <AnimatePresence>
                {showPresetForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 py-4 border-t border-gray-200 bg-gray-50"
                  >
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Save Filter Preset
                      </label>
                      <input
                        type="text"
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        placeholder="Enter preset name..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && savePreset()}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={savePreset}
                          disabled={!presetName.trim()}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setShowPresetForm(false);
                            setPresetName('');
                          }}
                          className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex space-x-3">
                  <button
                    onClick={onResetFilters}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>

                  {onSavePreset && (
                    <button
                      onClick={() => setShowPresetForm(true)}
                      className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onApplyFilters();
                      onClose();
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}