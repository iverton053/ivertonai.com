import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Grid, List, Download, Eye, Edit2, Trash2, 
  Star, CheckCircle, AlertTriangle, Calendar, User, Tag,
  MoreVertical, Share2, Copy, Archive, RefreshCw
} from 'lucide-react';
import { useBrandAssetsStore } from '../../stores/brandAssetsStore';
import { BrandAsset, BrandAssetType, BrandAssetFormat, BrandAssetVariant } from '../../types/brandAssets';

const BrandAssetLibrary: React.FC = () => {
  const {
    assets,
    filters,
    selectedAssets,
    view,
    sortBy,
    sortOrder,
    isLoading,
    error,
    setFilters,
    setSelectedAssets,
    setView,
    setSorting,
    deleteAsset,
    toggleAssetApproval,
    downloadAsset,
    searchAssets
  } = useBrandAssetsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    let result = searchAssets(searchQuery);
    
    // Apply additional filters
    if (filters.type && filters.type.length > 0) {
      result = result.filter(asset => filters.type!.includes(asset.type));
    }
    
    if (filters.format && filters.format.length > 0) {
      result = result.filter(asset => filters.format!.includes(asset.format));
    }
    
    if (filters.isApproved !== undefined) {
      result = result.filter(asset => asset.isApproved === filters.isApproved);
    }
    
    if (filters.isPrimary !== undefined) {
      result = result.filter(asset => asset.isPrimary === filters.isPrimary);
    }

    // Sort assets
    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.uploadedAt);
          bValue = new Date(b.uploadedAt);
          break;
        case 'usage':
          aValue = a.totalDownloads;
          bValue = b.totalDownloads;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'size':
          aValue = a.fileSize;
          bValue = b.fileSize;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [assets, searchQuery, filters, sortBy, sortOrder, searchAssets]);

  const handleSelectAsset = (assetId: string, isShiftClick: boolean = false) => {
    if (isShiftClick && selectedAssets.length > 0) {
      // Multi-select with shift
      const currentIndex = filteredAssets.findIndex(asset => asset.id === assetId);
      const lastSelectedIndex = filteredAssets.findIndex(asset => asset.id === selectedAssets[selectedAssets.length - 1]);
      
      if (currentIndex !== -1 && lastSelectedIndex !== -1) {
        const start = Math.min(currentIndex, lastSelectedIndex);
        const end = Math.max(currentIndex, lastSelectedIndex);
        const rangeAssets = filteredAssets.slice(start, end + 1).map(asset => asset.id);
        setSelectedAssets([...new Set([...selectedAssets, ...rangeAssets])]);
      }
    } else if (selectedAssets.includes(assetId)) {
      setSelectedAssets(selectedAssets.filter(id => id !== assetId));
    } else {
      setSelectedAssets([...selectedAssets, assetId]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getAssetIcon = (type: BrandAssetType) => {
    const icons = {
      'logo': '🏢',
      'icon': '⭐',
      'color-palette': '🎨',
      'font': '🔤',
      'template': '📄',
      'image': '🖼️',
      'video': '🎥',
      'document': '📋',
      'guideline': '📖'
    };
    return icons[type] || '📁';
  };

  const AssetCard: React.FC<{ asset: BrandAsset }> = ({ asset }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`relative group border rounded-xl overflow-hidden transition-all hover:shadow-lg cursor-pointer ${
        selectedAssets.includes(asset.id)
          ? 'border-purple-500 bg-purple-500/10'
          : 'border-white/10 bg-white/5 hover:border-purple-500/50'
      }`}
      onClick={(e) => handleSelectAsset(asset.id, e.shiftKey)}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-purple-900/20 to-indigo-900/20 flex items-center justify-center">
        {asset.thumbnailUrl ? (
          <img src={asset.thumbnailUrl} alt={asset.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl">{getAssetIcon(asset.type)}</span>
        )}
        
        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadAsset(asset.id);
            }}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedAssetId(asset.id);
            }}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Open edit modal
            }}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Asset info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-white truncate">{asset.name}</h3>
          <div className="flex items-center gap-1 ml-2">
            {asset.isPrimary && (
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            )}
            {asset.isApproved ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
          <span className="capitalize">{asset.type}</span>
          <span className="uppercase">{asset.format}</span>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{formatFileSize(asset.fileSize)}</span>
          <span>{asset.totalDownloads} downloads</span>
        </div>
        
        {asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {asset.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded"
              >
                {tag}
              </span>
            ))}
            {asset.tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-400 rounded">
                +{asset.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Selection indicator */}
      {selectedAssets.includes(asset.id) && (
        <div className="absolute top-2 left-2">
          <CheckCircle className="w-5 h-5 text-purple-400 fill-purple-400" />
        </div>
      )}
    </motion.div>
  );

  const AssetListItem: React.FC<{ asset: BrandAsset }> = ({ asset }) => (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all hover:shadow-lg ${
        selectedAssets.includes(asset.id)
          ? 'border-purple-500 bg-purple-500/10'
          : 'border-white/10 bg-white/5 hover:border-purple-500/50'
      }`}
      onClick={(e) => handleSelectAsset(asset.id, e.shiftKey)}
    >
      {/* Selection checkbox */}
      <div className="flex-shrink-0">
        <CheckCircle 
          className={`w-5 h-5 transition-colors ${
            selectedAssets.includes(asset.id)
              ? 'text-purple-400 fill-purple-400'
              : 'text-gray-400'
          }`}
        />
      </div>

      {/* Thumbnail */}
      <div className="w-12 h-12 rounded bg-gradient-to-br from-purple-900/20 to-indigo-900/20 flex items-center justify-center flex-shrink-0">
        {asset.thumbnailUrl ? (
          <img src={asset.thumbnailUrl} alt={asset.name} className="w-full h-full object-cover rounded" />
        ) : (
          <span className="text-lg">{getAssetIcon(asset.type)}</span>
        )}
      </div>

      {/* Asset details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-white truncate">{asset.name}</h3>
          {asset.isPrimary && (
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
          )}
          {asset.isApproved ? (
            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span className="capitalize">{asset.type}</span>
          <span className="uppercase">{asset.format}</span>
          <span>{formatFileSize(asset.fileSize)}</span>
          <span>{asset.totalDownloads} downloads</span>
        </div>
      </div>

      {/* Tags */}
      <div className="hidden md:flex items-center gap-1 flex-shrink-0">
        {asset.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded"
          >
            {tag}
          </span>
        ))}
        {asset.tags.length > 2 && (
          <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-400 rounded">
            +{asset.tags.length - 2}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            downloadAsset(asset.id);
          }}
          className="p-2 hover:bg-white/10 rounded transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedAssetId(asset.id);
          }}
          className="p-2 hover:bg-white/10 rounded transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="p-2 hover:bg-white/10 rounded transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Brand Asset Library</h2>
          <p className="text-gray-400">
            {filteredAssets.length} assets • {selectedAssets.length} selected
          </p>
        </div>
        
        {/* Bulk actions */}
        {selectedAssets.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                selectedAssets.forEach(id => downloadAsset(id));
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download ({selectedAssets.length})
            </button>
            <button
              onClick={() => {
                selectedAssets.forEach(id => deleteAsset(id));
                setSelectedAssets([]);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete ({selectedAssets.length})
            </button>
          </div>
        )}
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white placeholder-gray-400"
          />
        </div>

        {/* View toggle */}
        <div className="flex border border-white/10 rounded-lg">
          <button
            onClick={() => setView('grid')}
            className={`p-2 transition-colors ${
              view === 'grid' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 transition-colors ${
              view === 'list' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Sort */}
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-');
            setSorting(field as any, order as 'asc' | 'desc');
          }}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white"
        >
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="usage-desc">Most Used</option>
          <option value="usage-asc">Least Used</option>
          <option value="type-asc">Type A-Z</option>
          <option value="size-desc">Largest First</option>
          <option value="size-asc">Smallest First</option>
        </select>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
            showFilters 
              ? 'border-purple-500 bg-purple-500/20 text-purple-400'
              : 'border-white/10 text-gray-400 hover:text-white hover:border-white/20'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/5 border border-white/10 rounded-lg p-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Type filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Asset Type</label>
                <select
                  multiple
                  value={filters.type || []}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value) as BrandAssetType[];
                    setFilters({ ...filters, type: values.length > 0 ? values : undefined });
                  }}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white text-sm"
                >
                  <option value="logo">Logo</option>
                  <option value="icon">Icon</option>
                  <option value="color-palette">Color Palette</option>
                  <option value="font">Font</option>
                  <option value="template">Template</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                  <option value="guideline">Guideline</option>
                </select>
              </div>

              {/* Format filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Format</label>
                <select
                  multiple
                  value={filters.format || []}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value) as BrandAssetFormat[];
                    setFilters({ ...filters, format: values.length > 0 ? values : undefined });
                  }}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white text-sm"
                >
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                  <option value="svg">SVG</option>
                  <option value="pdf">PDF</option>
                  <option value="eps">EPS</option>
                  <option value="ai">AI</option>
                  <option value="psd">PSD</option>
                  <option value="sketch">Sketch</option>
                  <option value="figma">Figma</option>
                </select>
              </div>

              {/* Approval status */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={filters.isApproved === undefined ? '' : filters.isApproved.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilters({
                      ...filters,
                      isApproved: value === '' ? undefined : value === 'true'
                    });
                  }}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white text-sm"
                >
                  <option value="">All Assets</option>
                  <option value="true">Approved</option>
                  <option value="false">Pending</option>
                </select>
              </div>

              {/* Primary assets */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                <select
                  value={filters.isPrimary === undefined ? '' : filters.isPrimary.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilters({
                      ...filters,
                      isPrimary: value === '' ? undefined : value === 'true'
                    });
                  }}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white text-sm"
                >
                  <option value="">All Assets</option>
                  <option value="true">Primary Only</option>
                  <option value="false">Secondary</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setFilters({});
                  setSearchQuery('');
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
          <span className="ml-2 text-gray-400">Loading assets...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-900/200/20 border border-red-500/50 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-white mb-2">No assets found</h3>
          <p className="text-gray-400">
            {searchQuery || Object.keys(filters).length > 0
              ? 'Try adjusting your search or filters'
              : 'Upload your first brand asset to get started'
            }
          </p>
        </div>
      )}

      {/* Asset grid/list */}
      {!isLoading && !error && filteredAssets.length > 0 && (
        <AnimatePresence mode="wait">
          {view === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {filteredAssets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {filteredAssets.map((asset) => (
                <AssetListItem key={asset.id} asset={asset} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Load more button for pagination */}
      {filteredAssets.length > 0 && filteredAssets.length % 20 === 0 && (
        <div className="text-center pt-8">
          <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-white">
            Load More Assets
          </button>
        </div>
      )}
    </div>
  );
};

export default BrandAssetLibrary;