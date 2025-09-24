import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch, Clock, User, Download, Eye, Edit2, Plus,
  ArrowRight, MoreVertical, CheckCircle, AlertTriangle,
  Star, Copy, Archive, Undo2
} from 'lucide-react';
import { useBrandAssetsStore } from '../../stores/brandAssetsStore';
import { BrandAsset } from '../../types/brandAssets';

interface AssetVersionControlProps {
  assetId: string;
  onClose?: () => void;
}

interface AssetVersion {
  id: string;
  versionNumber: number;
  asset: BrandAsset;
  changes: string[];
  createdAt: Date;
  createdBy: string;
  notes?: string;
  isCurrent: boolean;
}

const AssetVersionControl: React.FC<AssetVersionControlProps> = ({ 
  assetId, 
  onClose 
}) => {
  const { assets, createAssetVersion, revertToVersion, downloadAsset } = useBrandAssetsStore();
  const [showCreateVersion, setShowCreateVersion] = useState(false);
  const [versionNotes, setVersionNotes] = useState('');
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

  // Get the primary asset and all its versions
  const primaryAsset = assets.find(asset => asset.id === assetId);
  const assetVersions = useMemo(() => {
    if (!primaryAsset) return [];

    // Get all assets that are versions of this asset (including the primary)
    const versions: AssetVersion[] = [];
    
    // Add the primary asset as the current version
    versions.push({
      id: primaryAsset.id,
      versionNumber: primaryAsset.versionNumber,
      asset: primaryAsset,
      changes: ['Initial version'],
      createdAt: primaryAsset.uploadedAt,
      createdBy: primaryAsset.uploadedBy,
      isCurrent: true
    });

    // Add all child versions
    assets
      .filter(asset => asset.parentAssetId === assetId)
      .forEach(asset => {
        versions.push({
          id: asset.id,
          versionNumber: asset.versionNumber,
          asset,
          changes: ['Version update'], // This would come from version metadata in real implementation
          createdAt: asset.uploadedAt,
          createdBy: asset.uploadedBy,
          isCurrent: false
        });
      });

    // Sort by version number (newest first)
    return versions.sort((a, b) => b.versionNumber - a.versionNumber);
  }, [assets, assetId, primaryAsset]);

  if (!primaryAsset) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 mb-2">Asset not found</div>
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  const handleCreateVersion = () => {
    if (versionNotes.trim()) {
      createAssetVersion(assetId, versionNotes.trim());
      setVersionNotes('');
      setShowCreateVersion(false);
    }
  };

  const handleCompareVersions = () => {
    if (selectedVersions.length === 2) {
      // Open comparison modal (would be implemented separately)
      console.log('Compare versions:', selectedVersions);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getAssetIcon = (type: string) => {
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
    return icons[type as keyof typeof icons] || '📁';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitBranch className="w-6 h-6 text-purple-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Version History</h2>
            <p className="text-gray-400">{primaryAsset.name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Compare versions button */}
          {selectedVersions.length === 2 && (
            <button
              onClick={handleCompareVersions}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              Compare Versions
            </button>
          )}
          
          {/* Create new version button */}
          <button
            onClick={() => setShowCreateVersion(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Version
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Current asset info */}
      <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-900/40 to-indigo-900/40 flex items-center justify-center">
            {primaryAsset.thumbnailUrl ? (
              <img 
                src={primaryAsset.thumbnailUrl} 
                alt={primaryAsset.name} 
                className="w-full h-full object-cover rounded-lg" 
              />
            ) : (
              <span className="text-2xl">{getAssetIcon(primaryAsset.type)}</span>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-white">{primaryAsset.name}</h3>
              {primaryAsset.isPrimary && (
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              )}
              {primaryAsset.isApproved ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <span className="capitalize">{primaryAsset.type}</span>
              <span className="uppercase">{primaryAsset.format}</span>
              <span>{formatFileSize(primaryAsset.fileSize)}</span>
              <span>v{primaryAsset.versionNumber}</span>
              <span>{primaryAsset.totalDownloads} downloads</span>
            </div>
          </div>
        </div>
      </div>

      {/* Create version modal */}
      <AnimatePresence>
        {showCreateVersion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setShowCreateVersion(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Create New Version</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Version Notes
                  </label>
                  <textarea
                    value={versionNotes}
                    onChange={(e) => setVersionNotes(e.target.value)}
                    placeholder="Describe what changed in this version..."
                    rows={4}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white placeholder-gray-400 resize-none"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowCreateVersion(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateVersion}
                    disabled={!versionNotes.trim()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed rounded-lg transition-colors text-white"
                  >
                    Create Version
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Version timeline */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          Version Timeline ({assetVersions.length} versions)
        </h3>
        
        <div className="space-y-3">
          {assetVersions.map((version, index) => (
            <motion.div
              key={version.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`relative flex items-center gap-4 p-4 border rounded-xl transition-all ${
                version.isCurrent
                  ? 'border-purple-500 bg-purple-500/10'
                  : selectedVersions.includes(version.id)
                    ? 'border-blue-500 bg-blue-900/200/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              {/* Selection checkbox for comparison */}
              <button
                onClick={() => {
                  if (selectedVersions.includes(version.id)) {
                    setSelectedVersions(selectedVersions.filter(id => id !== version.id));
                  } else if (selectedVersions.length < 2) {
                    setSelectedVersions([...selectedVersions, version.id]);
                  }
                }}
                className={`w-5 h-5 rounded border transition-colors ${
                  selectedVersions.includes(version.id)
                    ? 'border-blue-500 bg-blue-900/200 text-white'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                disabled={!selectedVersions.includes(version.id) && selectedVersions.length >= 2}
              >
                {selectedVersions.includes(version.id) && (
                  <CheckCircle className="w-4 h-4" />
                )}
              </button>

              {/* Timeline connector */}
              {index < assetVersions.length - 1 && (
                <div className="absolute left-6 top-16 w-0.5 h-8 bg-gray-600" />
              )}

              {/* Version info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-white">
                    Version {version.versionNumber}
                  </span>
                  {version.isCurrent && (
                    <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded">
                      Current
                    </span>
                  )}
                  {version.asset.isApproved ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {version.createdBy}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDate(version.createdAt)}
                  </span>
                  <span>{formatFileSize(version.asset.fileSize)}</span>
                </div>

                {/* Changes list */}
                {version.changes.length > 0 && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-300">Changes:</p>
                    <ul className="list-disc list-inside text-sm text-gray-400 ml-2">
                      {version.changes.map((change, i) => (
                        <li key={i}>{change}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Version notes */}
                {version.notes && (
                  <p className="text-sm text-gray-300 italic">{version.notes}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadAsset(version.id)}
                  className="p-2 hover:bg-white/10 rounded transition-colors"
                  title="Download this version"
                >
                  <Download className="w-4 h-4" />
                </button>
                
                <button
                  className="p-2 hover:bg-white/10 rounded transition-colors"
                  title="Preview this version"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {!version.isCurrent && (
                  <button
                    onClick={() => revertToVersion(version.id)}
                    className="p-2 hover:bg-white/10 rounded transition-colors text-orange-400"
                    title="Revert to this version"
                  >
                    <Undo2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  className="p-2 hover:bg-white/10 rounded transition-colors"
                  title="More options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Version statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{assetVersions.length}</div>
          <div className="text-gray-400 text-sm">Total Versions</div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">
            {assetVersions.filter(v => v.asset.isApproved).length}
          </div>
          <div className="text-gray-400 text-sm">Approved Versions</div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">
            {assetVersions.reduce((total, v) => total + v.asset.totalDownloads, 0)}
          </div>
          <div className="text-gray-400 text-sm">Total Downloads</div>
        </div>
      </div>

      {/* Help text */}
      <div className="text-center text-sm text-gray-400">
        <p>Select up to 2 versions to compare them side by side</p>
      </div>
    </div>
  );
};

export default AssetVersionControl;