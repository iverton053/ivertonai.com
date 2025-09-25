import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Download, Share2, Link, Calendar, Clock, Copy, Check,
  FileArchive, FileText, Image, Settings, Users, Lock,
  Eye, AlertTriangle, ExternalLink
} from 'lucide-react';
import { useBrandAssetsStore } from '../../stores/brandAssetsStore';
import { BrandAsset } from '../../types/brandAssets';

interface ExportShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAssets: string[];
  mode: 'export' | 'share';
}

interface ShareLinkData {
  id: string;
  url: string;
  expiresAt: Date;
  accessCount: number;
  maxAccess?: number;
  password?: string;
}

const ExportShareModal: React.FC<ExportShareModalProps> = ({
  isOpen,
  onClose,
  selectedAssets,
  mode
}) => {
  const { assets, exportAssets, generateShareLink } = useBrandAssetsStore();

  // Export state
  const [exportFormat, setExportFormat] = useState<'zip' | 'pdf'>('zip');
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  // Share state
  const [shareLink, setShareLink] = useState<ShareLinkData | null>(null);
  const [shareExpiry, setShareExpiry] = useState('7d'); // 7 days default
  const [maxAccess, setMaxAccess] = useState<number | undefined>();
  const [sharePassword, setSharePassword] = useState('');
  const [requirePassword, setRequirePassword] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Get selected asset details
  const selectedAssetData = assets.filter(asset => selectedAssets.includes(asset.id));

  const calculateTotalSize = () => {
    return selectedAssetData.reduce((total, asset) => total + asset.fileSize, 0);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getExpiryMilliseconds = () => {
    const expiryMap = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      'never': 365 * 24 * 60 * 60 * 1000 // 1 year
    };
    return expiryMap[shareExpiry as keyof typeof expiryMap] || expiryMap['7d'];
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 20;
        });
      }, 500);

      await exportAssets(selectedAssets, exportFormat);

      // Complete progress
      setExportProgress(100);

      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleGenerateShareLink = () => {
    const expiryMs = getExpiryMilliseconds();
    const url = generateShareLink(selectedAssets, expiryMs);

    const shareData: ShareLinkData = {
      id: url.split('/').pop() || 'unknown',
      url,
      expiresAt: new Date(Date.now() + expiryMs),
      accessCount: 0,
      maxAccess,
      password: requirePassword ? sharePassword : undefined
    };

    setShareLink(shareData);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const resetState = () => {
    setShareLink(null);
    setExportProgress(0);
    setIsExporting(false);
    setCopiedLink(false);
    setShareExpiry('7d');
    setMaxAccess(undefined);
    setSharePassword('');
    setRequirePassword(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
              {mode === 'export' ? (
                <Download className="w-6 h-6 text-blue-400" />
              ) : (
                <Share2 className="w-6 h-6 text-green-400" />
              )}
              <div>
                <h2 className="text-xl font-bold text-white">
                  {mode === 'export' ? 'Export Assets' : 'Share Assets'}
                </h2>
                <p className="text-gray-400 text-sm">
                  {selectedAssets.length} asset{selectedAssets.length !== 1 ? 's' : ''} selected
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

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Selected Assets Preview */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-3">Selected Assets</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedAssetData.map((asset) => (
                  <div key={asset.id} className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded flex items-center justify-center">
                      <Image className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">{asset.name}</div>
                      <div className="text-gray-400">{formatFileSize(asset.fileSize)} • {asset.format.toUpperCase()}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="text-sm text-gray-400">
                  Total size: <span className="text-white font-medium">{formatFileSize(calculateTotalSize())}</span>
                </div>
              </div>
            </div>

            {/* Export Mode */}
            {mode === 'export' && !isExporting && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Export Format</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setExportFormat('zip')}
                      className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                        exportFormat === 'zip'
                          ? 'border-blue-500 bg-blue-900/20 text-white'
                          : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                      }`}
                    >
                      <FileArchive className="w-6 h-6" />
                      <div className="text-left">
                        <div className="font-medium">ZIP Archive</div>
                        <div className="text-xs text-gray-400">Original files in compressed archive</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setExportFormat('pdf')}
                      className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                        exportFormat === 'pdf'
                          ? 'border-blue-500 bg-blue-900/20 text-white'
                          : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                      }`}
                    >
                      <FileText className="w-6 h-6" />
                      <div className="text-left">
                        <div className="font-medium">PDF Report</div>
                        <div className="text-xs text-gray-400">Asset preview with metadata</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Export Progress */}
            {mode === 'export' && isExporting && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    Exporting {exportFormat.toUpperCase()}...
                  </h3>
                  <p className="text-gray-400">Processing {selectedAssets.length} asset(s)</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{Math.round(exportProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Share Mode */}
            {mode === 'share' && !shareLink && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Link Expires</label>
                  <select
                    value={shareExpiry}
                    onChange={(e) => setShareExpiry(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-green-500 focus:outline-none text-white"
                  >
                    <option value="1h">1 hour</option>
                    <option value="24h">24 hours</option>
                    <option value="7d">7 days</option>
                    <option value="30d">30 days</option>
                    <option value="never">Never (1 year)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Access Limit (Optional)</label>
                  <input
                    type="number"
                    value={maxAccess || ''}
                    onChange={(e) => setMaxAccess(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Unlimited"
                    min="1"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-green-500 focus:outline-none text-white placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-400 mt-1">Maximum number of times this link can be accessed</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="requirePassword"
                      checked={requirePassword}
                      onChange={(e) => setRequirePassword(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <label htmlFor="requirePassword" className="text-sm text-gray-300">
                      Require password to access
                    </label>
                  </div>

                  {requirePassword && (
                    <input
                      type="password"
                      value={sharePassword}
                      onChange={(e) => setSharePassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-green-500 focus:outline-none text-white placeholder-gray-400"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Generated Share Link */}
            {mode === 'share' && shareLink && (
              <div className="space-y-4">
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <span className="text-green-300 font-medium">Share Link Generated</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Share URL</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={shareLink.url}
                          readOnly
                          className="flex-1 px-3 py-2 bg-black/20 border border-green-500/30 rounded text-green-100 text-sm"
                        />
                        <button
                          onClick={() => copyToClipboard(shareLink.url)}
                          className="p-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
                        >
                          {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="text-gray-400">Expires</div>
                        <div className="text-white font-medium">
                          {shareLink.expiresAt.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Access Count</div>
                        <div className="text-white font-medium">
                          {shareLink.accessCount}{shareLink.maxAccess ? ` / ${shareLink.maxAccess}` : ' / Unlimited'}
                        </div>
                      </div>
                    </div>

                    {shareLink.password && (
                      <div className="pt-2 border-t border-green-500/20">
                        <div className="text-xs text-gray-400">Password Required</div>
                        <div className="text-sm text-green-300 font-mono bg-black/20 px-2 py-1 rounded mt-1">
                          {shareLink.password}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-amber-300 text-sm">
                      <div className="font-medium mb-1">Security Notice</div>
                      <ul className="text-xs space-y-1 text-amber-400">
                        <li>• Anyone with this link can access the selected assets</li>
                        <li>• Share only with trusted individuals or organizations</li>
                        <li>• You can revoke access at any time from the sharing management panel</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3">
              {mode === 'export' && !isExporting && (
                <button
                  onClick={handleExport}
                  disabled={selectedAssets.length === 0}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed rounded-lg transition-colors text-white"
                >
                  <Download className="w-4 h-4" />
                  Export {exportFormat.toUpperCase()}
                </button>
              )}

              {mode === 'share' && !shareLink && (
                <button
                  onClick={handleGenerateShareLink}
                  disabled={selectedAssets.length === 0 || (requirePassword && !sharePassword)}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed rounded-lg transition-colors text-white"
                >
                  <Link className="w-4 h-4" />
                  Generate Link
                </button>
              )}

              {mode === 'share' && shareLink && (
                <button
                  onClick={() => window.open(shareLink.url, '_blank')}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Link
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExportShareModal;