import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  X,
  Calendar,
  User,
  FileType,
  HardDrive,
  Tag,
  Star,
  Share2,
  Clock,
  SortAsc,
  SortDesc,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { FileCategory, FileType as FileTypeEnum } from '../../types/fileManagement';
import { useFileManagerStore } from '../../stores/fileManagerStore';

interface AdvancedSearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: any) => void;
}

interface SearchFilters {
  query: string;
  category: FileCategory | 'all';
  fileType: FileTypeEnum | 'all';
  dateRange: {
    start: string;
    end: string;
  };
  sizeRange: {
    min: number;
    max: number;
  };
  tags: string[];
  owner: string;
  isShared: boolean | null;
  isFavorite: boolean | null;
  hasVersions: boolean | null;
  sortBy: 'name' | 'date' | 'size' | 'type' | 'downloads';
  sortOrder: 'asc' | 'desc';
}

const AdvancedSearchPanel: React.FC<AdvancedSearchPanelProps> = ({
  isOpen,
  onClose,
  onSearch
}) => {
  const { files, searchFiles } = useFileManagerStore();
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'all',
    fileType: 'all',
    dateRange: {
      start: '',
      end: ''
    },
    sizeRange: {
      min: 0,
      max: 1024 * 1024 * 1024 // 1GB
    },
    tags: [],
    owner: '',
    isShared: null,
    isFavorite: null,
    hasVersions: null,
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSizeFilter, setShowSizeFilter] = useState(false);

  useEffect(() => {
    // Extract unique tags from all files
    const tags = new Set<string>();
    files.forEach(file => {
      file.tags?.forEach(tag => tags.add(tag));
    });
    setAvailableTags(Array.from(tags));
  }, [files]);

  const categories: { value: FileCategory | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: 'All Categories', icon: '📁' },
    { value: 'contracts', label: 'Contracts', icon: '📄' },
    { value: 'creative-assets', label: 'Creative Assets', icon: '🎨' },
    { value: 'invoices', label: 'Invoices', icon: '💰' },
    { value: 'reports', label: 'Reports', icon: '📊' },
    { value: 'presentations', label: 'Presentations', icon: '📽️' },
    { value: 'templates', label: 'Templates', icon: '📋' },
    { value: 'media', label: 'Media', icon: '🎬' },
    { value: 'documents', label: 'Documents', icon: '📑' },
    { value: 'uncategorized', label: 'Uncategorized', icon: '📁' }
  ];

  const fileTypes: { value: FileTypeEnum | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: 'All Types', icon: '📎' },
    { value: 'image', label: 'Images', icon: '🖼️' },
    { value: 'video', label: 'Videos', icon: '🎬' },
    { value: 'audio', label: 'Audio', icon: '🎵' },
    { value: 'pdf', label: 'PDFs', icon: '📄' },
    { value: 'document', label: 'Documents', icon: '📝' },
    { value: 'spreadsheet', label: 'Spreadsheets', icon: '📊' },
    { value: 'presentation', label: 'Presentations', icon: '📽️' },
    { value: 'archive', label: 'Archives', icon: '📦' },
    { value: 'other', label: 'Other', icon: '📎' }
  ];

  const sizeOptions = [
    { label: 'Any Size', min: 0, max: Infinity },
    { label: 'Small (< 1MB)', min: 0, max: 1024 * 1024 },
    { label: 'Medium (1-10MB)', min: 1024 * 1024, max: 10 * 1024 * 1024 },
    { label: 'Large (10-100MB)', min: 10 * 1024 * 1024, max: 100 * 1024 * 1024 },
    { label: 'Very Large (> 100MB)', min: 100 * 1024 * 1024, max: Infinity }
  ];

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSearch = async () => {
    try {
      await onSearch(filters);
      onClose();
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleReset = () => {
    setFilters({
      query: '',
      category: 'all',
      fileType: 'all',
      dateRange: { start: '', end: '' },
      sizeRange: { min: 0, max: 1024 * 1024 * 1024 },
      tags: [],
      owner: '',
      isShared: null,
      isFavorite: null,
      hasVersions: null,
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="glass-effect border border-white/20 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl">
                <Search className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Advanced Search & Filters
                </h2>
                <p className="text-gray-400 text-sm">
                  Find exactly what you're looking for
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
            {/* Search Query */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-3">
                Search Query
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={filters.query}
                  onChange={(e) => handleFilterChange('query', e.target.value)}
                  placeholder="Search by filename, description, or content..."
                  className="w-full pl-10 pr-4 py-3 glass-effect border border-white/20 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                />
              </div>
            </div>

            {/* Category and File Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-3">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full p-3 glass-effect border border-white/20 rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-3">
                  File Type
                </label>
                <select
                  value={filters.fileType}
                  onChange={(e) => handleFilterChange('fileType', e.target.value)}
                  className="w-full p-3 glass-effect border border-white/20 rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                >
                  {fileTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-3">
                Date Range
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2">From</label>
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => handleFilterChange('dateRange', {
                      ...filters.dateRange,
                      start: e.target.value
                    })}
                    className="w-full p-3 glass-effect border border-white/20 rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2">To</label>
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => handleFilterChange('dateRange', {
                      ...filters.dateRange,
                      end: e.target.value
                    })}
                    className="w-full p-3 glass-effect border border-white/20 rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* File Size */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-3">
                File Size
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {sizeOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleFilterChange('sizeRange', {
                      min: option.min,
                      max: option.max
                    })}
                    className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      filters.sizeRange.min === option.min && filters.sizeRange.max === option.max
                        ? 'bg-purple-500/30 text-purple-200 border border-purple-400/50'
                        : 'glass-effect border border-white/20 text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            {availableTags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-3">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        filters.tags.includes(tag)
                          ? 'bg-purple-500/30 text-purple-200 border border-purple-400/50'
                          : 'glass-effect border border-white/20 text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Tag size={12} className="inline mr-1" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-3">
                Additional Filters
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isShared"
                    checked={filters.isShared === true}
                    onChange={(e) => handleFilterChange('isShared', e.target.checked ? true : null)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                  />
                  <label htmlFor="isShared" className="text-gray-300 cursor-pointer">
                    <Share2 size={16} className="inline mr-2" />
                    Shared files only
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isFavorite"
                    checked={filters.isFavorite === true}
                    onChange={(e) => handleFilterChange('isFavorite', e.target.checked ? true : null)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                  />
                  <label htmlFor="isFavorite" className="text-gray-300 cursor-pointer">
                    <Star size={16} className="inline mr-2" />
                    Favorites only
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="hasVersions"
                    checked={filters.hasVersions === true}
                    onChange={(e) => handleFilterChange('hasVersions', e.target.checked ? true : null)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                  />
                  <label htmlFor="hasVersions" className="text-gray-300 cursor-pointer">
                    <Clock size={16} className="inline mr-2" />
                    Multiple versions
                  </label>
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-3">
                Sort Results
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Sort by</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full p-3 glass-effect border border-white/20 rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                  >
                    <option value="name">Name</option>
                    <option value="date">Date Modified</option>
                    <option value="size">File Size</option>
                    <option value="type">File Type</option>
                    <option value="downloads">Downloads</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-2">Order</label>
                  <div className="flex glass-effect border border-white/20 rounded-xl overflow-hidden">
                    <button
                      onClick={() => handleFilterChange('sortOrder', 'asc')}
                      className={`flex-1 p-3 flex items-center justify-center gap-2 transition-all duration-200 ${
                        filters.sortOrder === 'asc'
                          ? 'bg-purple-500 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <SortAsc size={16} />
                      Ascending
                    </button>
                    <button
                      onClick={() => handleFilterChange('sortOrder', 'desc')}
                      className={`flex-1 p-3 flex items-center justify-center gap-2 transition-all duration-200 ${
                        filters.sortOrder === 'desc'
                          ? 'bg-purple-500 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <SortDesc size={16} />
                      Descending
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-white/20">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 text-gray-300 hover:text-white transition-colors font-medium"
            >
              <RotateCcw size={16} />
              Reset Filters
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-300 hover:text-white transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSearch}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 font-medium"
              >
                Search Files
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdvancedSearchPanel;