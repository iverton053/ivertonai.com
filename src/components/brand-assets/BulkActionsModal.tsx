import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Check, AlertTriangle, Tag, Move, Trash2, Download,
  FileArchive, Share2, Eye, Edit2, CheckCircle, Clock,
  User, Calendar, Folder, Settings
} from 'lucide-react';
import { useBrandAssetsStore } from '../../stores/brandAssetsStore';
import { BrandAsset, BrandAssetType } from '../../types/brandAssets';

interface BulkActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAssets: string[];
  action: 'approve' | 'reject' | 'move' | 'tag' | 'delete' | 'edit';
  onComplete?: () => void;
}

const BulkActionsModal: React.FC<BulkActionsModalProps> = ({
  isOpen,
  onClose,
  selectedAssets,
  action,
  onComplete
}) => {
  const {
    assets,
    collections,
    bulkApprove,
    bulkReject,
    bulkMove,
    bulkTag,
    deleteAssets,
    updateAsset
  } = useBrandAssetsStore();

  // Form states
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [newTags, setNewTags] = useState('');
  const [replaceExistingTags, setReplaceExistingTags] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    type: '' as BrandAssetType | '',
    description: '',
    isPublic: undefined as boolean | undefined
  });

  // Progress states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  // Get selected asset details
  const selectedAssetData = assets.filter(asset => selectedAssets.includes(asset.id));

  if (!isOpen) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getTotalSize = () => {
    return selectedAssetData.reduce((total, asset) => total + asset.fileSize, 0);
  };

  const getAssetTypeStats = () => {
    const stats: Record<string, number> = {};
    selectedAssetData.forEach(asset => {
      stats[asset.type] = (stats[asset.type] || 0) + 1;
    });
    return stats;
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    setProcessedCount(0);
    setErrors([]);

    try {
      bulkApprove(selectedAssets);
      setProcessedCount(selectedAssets.length);

      setTimeout(() => {
        setIsProcessing(false);
        onComplete?.();
        onClose();
      }, 1000);
    } catch (error) {
      setErrors(['Failed to approve assets']);
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setErrors(['Rejection reason is required']);
      return;
    }

    setIsProcessing(true);
    setProcessedCount(0);
    setErrors([]);

    try {
      bulkReject(selectedAssets, rejectionReason.trim());
      setProcessedCount(selectedAssets.length);

      setTimeout(() => {
        setIsProcessing(false);
        onComplete?.();
        onClose();
      }, 1000);
    } catch (error) {
      setErrors(['Failed to reject assets']);
      setIsProcessing(false);
    }
  };

  const handleMove = async () => {
    if (!selectedCollection) {
      setErrors(['Please select a collection']);
      return;
    }

    setIsProcessing(true);
    setProcessedCount(0);
    setErrors([]);

    try {
      bulkMove(selectedAssets, selectedCollection);
      setProcessedCount(selectedAssets.length);

      setTimeout(() => {
        setIsProcessing(false);
        onComplete?.();
        onClose();
      }, 1000);
    } catch (error) {
      setErrors(['Failed to move assets']);
      setIsProcessing(false);
    }
  };

  const handleTag = async () => {
    if (!newTags.trim()) {
      setErrors(['Please enter tags to apply']);
      return;
    }

    setIsProcessing(true);
    setProcessedCount(0);
    setErrors([]);

    try {
      const tags = newTags.split(',').map(tag => tag.trim()).filter(Boolean);
      bulkTag(selectedAssets, tags);
      setProcessedCount(selectedAssets.length);

      setTimeout(() => {
        setIsProcessing(false);
        onComplete?.();
        onClose();
      }, 1000);
    } catch (error) {
      setErrors(['Failed to apply tags']);
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    setProcessedCount(0);
    setErrors([]);

    try {
      deleteAssets(selectedAssets);
      setProcessedCount(selectedAssets.length);

      setTimeout(() => {
        setIsProcessing(false);
        onComplete?.();
        onClose();
      }, 1000);
    } catch (error) {
      setErrors(['Failed to delete assets']);
      setIsProcessing(false);
    }
  };

  const handleBulkEdit = async () => {
    setIsProcessing(true);
    setProcessedCount(0);
    setErrors([]);

    try {
      // Apply updates to each selected asset
      for (const assetId of selectedAssets) {
        const updates: Partial<BrandAsset> = {};

        if (bulkEditData.type) updates.type = bulkEditData.type;
        if (bulkEditData.description !== '') updates.description = bulkEditData.description;
        if (bulkEditData.isPublic !== undefined) updates.isPublic = bulkEditData.isPublic;

        if (Object.keys(updates).length > 0) {
          updateAsset(assetId, updates);
        }

        setProcessedCount(prev => prev + 1);
      }

      setTimeout(() => {
        setIsProcessing(false);
        onComplete?.();
        onClose();
      }, 1000);
    } catch (error) {
      setErrors(['Failed to update assets']);
      setIsProcessing(false);
    }
  };

  const getActionConfig = () => {
    const configs = {
      approve: {
        title: 'Approve Assets',
        description: 'Mark the selected assets as approved for use',
        icon: <CheckCircle className="w-6 h-6 text-green-400" />,
        buttonText: 'Approve Assets',
        buttonClass: 'bg-green-600 hover:bg-green-700',
        action: handleApprove
      },
      reject: {
        title: 'Reject Assets',
        description: 'Mark the selected assets as rejected with a reason',
        icon: <X className="w-6 h-6 text-red-400" />,
        buttonText: 'Reject Assets',
        buttonClass: 'bg-red-600 hover:bg-red-700',
        action: handleReject
      },
      move: {
        title: 'Move Assets',
        description: 'Move the selected assets to a different collection',
        icon: <Move className="w-6 h-6 text-blue-400" />,
        buttonText: 'Move Assets',
        buttonClass: 'bg-blue-600 hover:bg-blue-700',
        action: handleMove
      },
      tag: {
        title: 'Tag Assets',
        description: 'Add tags to the selected assets',
        icon: <Tag className="w-6 h-6 text-purple-400" />,
        buttonText: 'Apply Tags',
        buttonClass: 'bg-purple-600 hover:bg-purple-700',
        action: handleTag
      },
      delete: {
        title: 'Delete Assets',
        description: 'Permanently delete the selected assets',
        icon: <Trash2 className="w-6 h-6 text-red-400" />,
        buttonText: 'Delete Assets',
        buttonClass: 'bg-red-600 hover:bg-red-700',
        action: handleDelete
      },
      edit: {
        title: 'Edit Assets',
        description: 'Update properties for the selected assets',
        icon: <Edit2 className="w-6 h-6 text-indigo-400" />,
        buttonText: 'Update Assets',
        buttonClass: 'bg-indigo-600 hover:bg-indigo-700',
        action: handleBulkEdit
      }
    };
    return configs[action];
  };

  const config = getActionConfig();
  const typeStats = getAssetTypeStats();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              {config.icon}
              <div>
                <h2 className="text-xl font-bold text-white">{config.title}</h2>
                <p className="text-gray-400 text-sm">
                  {selectedAssets.length} asset{selectedAssets.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Asset Summary */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-3">Selected Assets</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-400">Total Count</div>
                  <div className="text-xl font-bold text-white">{selectedAssets.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Total Size</div>
                  <div className="text-xl font-bold text-white">{formatFileSize(getTotalSize())}</div>
                </div>
              </div>

              {/* Type breakdown */}
              <div className="space-y-2">
                <div className="text-sm text-gray-400">Asset Types</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(typeStats).map(([type, count]) => (
                    <div key={type} className="px-2 py-1 bg-purple-900/20 text-purple-300 border border-purple-500/30 rounded text-sm">
                      {type}: {count}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Processing Status */}
            {isProcessing && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 text-blue-400 animate-spin" />
                  <span className="text-blue-300 font-medium">Processing Assets...</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{processedCount} / {selectedAssets.length}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${(processedCount / selectedAssets.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-red-300 font-medium">Errors Occurred</span>
                </div>
                <div className="space-y-1">
                  {errors.map((error, index) => (
                    <div key={index} className="text-red-400 text-sm">{error}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Action-specific forms */}
            {!isProcessing && (
              <div className="space-y-4">
                <div className="text-gray-300 text-sm mb-4">{config.description}</div>

                {/* Reject form */}
                {action === 'reject' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Rejection Reason *
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter the reason for rejecting these assets..."
                      rows={3}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-red-500 focus:outline-none text-white placeholder-gray-400 resize-none"
                    />
                  </div>
                )}

                {/* Move form */}
                {action === 'move' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Destination Collection *
                    </label>
                    <select
                      value={selectedCollection}
                      onChange={(e) => setSelectedCollection(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none text-white"
                    >
                      <option value="">Select a collection...</option>
                      {collections.map((collection) => (
                        <option key={collection.id} value={collection.id}>
                          {collection.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Tag form */}
                {action === 'tag' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tags to Apply *
                      </label>
                      <input
                        type="text"
                        value={newTags}
                        onChange={(e) => setNewTags(e.target.value)}
                        placeholder="Enter tags separated by commas (e.g., brand, approved, v2)"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white placeholder-gray-400"
                      />
                      <div className="text-xs text-gray-400 mt-1">
                        Separate multiple tags with commas
                      </div>
                    </div>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={replaceExistingTags}
                        onChange={(e) => setReplaceExistingTags(e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm text-gray-300">
                        Replace existing tags instead of adding to them
                      </span>
                    </label>
                  </div>
                )}

                {/* Edit form */}
                {action === 'edit' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Asset Type
                      </label>
                      <select
                        value={bulkEditData.type}
                        onChange={(e) => setBulkEditData({ ...bulkEditData, type: e.target.value as BrandAssetType })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none text-white"
                      >
                        <option value="">Keep existing types</option>
                        <option value="logo">Logo</option>
                        <option value="icon">Icon</option>
                        <option value="image">Image</option>
                        <option value="template">Template</option>
                        <option value="document">Document</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={bulkEditData.description}
                        onChange={(e) => setBulkEditData({ ...bulkEditData, description: e.target.value })}
                        placeholder="Enter new description (leave empty to keep existing)"
                        rows={2}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none text-white placeholder-gray-400 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Visibility
                      </label>
                      <select
                        value={bulkEditData.isPublic === undefined ? '' : bulkEditData.isPublic.toString()}
                        onChange={(e) => setBulkEditData({
                          ...bulkEditData,
                          isPublic: e.target.value === '' ? undefined : e.target.value === 'true'
                        })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none text-white"
                      >
                        <option value="">Keep existing visibility</option>
                        <option value="true">Public</option>
                        <option value="false">Private</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Delete confirmation */}
                {action === 'delete' && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <span className="text-red-300 font-medium">Permanent Deletion</span>
                    </div>
                    <div className="text-red-400 text-sm">
                      This action cannot be undone. The selected assets will be permanently deleted from the system.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {!isProcessing && (
            <div className="flex items-center justify-between p-6 border-t border-white/10">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={config.action}
                disabled={isProcessing}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors text-white font-medium ${config.buttonClass} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {config.icon}
                {config.buttonText}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BulkActionsModal;