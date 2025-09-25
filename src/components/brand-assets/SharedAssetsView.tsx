import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Download, Eye, Shield, Clock, AlertTriangle, CheckCircle,
  Image, FileText, Film, Archive, Lock, Key, ExternalLink
} from 'lucide-react';
import { BrandAsset } from '../../types/brandAssets';

interface SharedAssetsViewProps {
  shareId: string;
}

interface ShareData {
  id: string;
  assetIds: string[];
  expiresAt: Date;
  createdAt: Date;
  accessCount: number;
  maxAccess?: number;
  password?: string;
}

const SharedAssetsView: React.FC<SharedAssetsViewProps> = ({ shareId }) => {
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [accessGranted, setAccessGranted] = useState(false);

  useEffect(() => {
    loadShareData();
  }, [shareId]);

  const loadShareData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load share data from localStorage (in production, this would be an API call)
      const shares = JSON.parse(localStorage.getItem('brandAssetShares') || '{}');
      const share = shares[shareId];

      if (!share) {
        setError('Share link not found or has expired');
        setLoading(false);
        return;
      }

      // Check if share has expired
      const expiresAt = new Date(share.expiresAt);
      if (expiresAt < new Date()) {
        setError('Share link has expired');
        setLoading(false);
        return;
      }

      // Check access limits
      if (share.maxAccess && share.accessCount >= share.maxAccess) {
        setError('Share link has reached its access limit');
        setLoading(false);
        return;
      }

      setShareData({
        ...share,
        expiresAt,
        createdAt: new Date(share.createdAt)
      });

      // Check if password is required
      if (share.password) {
        setPasswordRequired(true);
        setLoading(false);
        return;
      }

      // Load assets and grant access
      await loadAssetsAndGrantAccess(share);
    } catch (error) {
      console.error('Error loading share data:', error);
      setError('Failed to load shared assets');
      setLoading(false);
    }
  };

  const loadAssetsAndGrantAccess = async (share: ShareData) => {
    try {
      // In production, this would fetch assets from the backend
      // For demo, we'll load from localStorage (from brand assets store)
      const brandAssets = JSON.parse(localStorage.getItem('brand-assets-storage') || '{}');
      const state = brandAssets.state;

      if (state && state.assets) {
        const sharedAssets = state.assets.filter((asset: BrandAsset) =>
          share.assetIds.includes(asset.id)
        );
        setAssets(sharedAssets);
      }

      // Increment access count
      const shares = JSON.parse(localStorage.getItem('brandAssetShares') || '{}');
      shares[shareId] = {
        ...share,
        accessCount: share.accessCount + 1
      };
      localStorage.setItem('brandAssetShares', JSON.stringify(shares));

      setAccessGranted(true);
      setLoading(false);
    } catch (error) {
      console.error('Error loading assets:', error);
      setError('Failed to load shared assets');
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!shareData) return;

    if (enteredPassword === shareData.password) {
      setPasswordRequired(false);
      await loadAssetsAndGrantAccess(shareData);
    } else {
      setError('Incorrect password');
    }
  };

  const downloadAsset = async (asset: BrandAsset) => {
    try {
      // In production, this would fetch the actual file
      // For demo, we'll create a download link
      const link = document.createElement('a');
      link.href = asset.url;
      link.download = asset.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getAssetIcon = (asset: BrandAsset) => {
    const iconMap = {
      'image': <Image className="w-6 h-6" />,
      'video': <Film className="w-6 h-6" />,
      'document': <FileText className="w-6 h-6" />,
      'archive': <Archive className="w-6 h-6" />,
    };

    const type = asset.type;
    return iconMap[type as keyof typeof iconMap] || <FileText className="w-6 h-6" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-white text-lg">Loading shared assets...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={() => window.close()}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (passwordRequired) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-white/10 rounded-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Lock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Password Required</h1>
            <p className="text-gray-400">This shared link is protected with a password</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enter Password
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={enteredPassword}
                  onChange={(e) => setEnteredPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  placeholder="Password"
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-yellow-500 focus:outline-none text-white placeholder-gray-400"
                />
                <button
                  onClick={handlePasswordSubmit}
                  disabled={!enteredPassword}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-600/50 disabled:cursor-not-allowed rounded-lg transition-colors text-white"
                >
                  <Key className="w-4 h-4" />
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-900/20 border border-red-500/30 rounded p-2">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!accessGranted || !shareData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-green-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Shared Brand Assets</h1>
              <p className="text-gray-400">
                {assets.length} asset{assets.length !== 1 ? 's' : ''} shared with you
              </p>
            </div>
          </div>

          {/* Share Info */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Expires</div>
                <div className="text-white font-medium flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {shareData.expiresAt.toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Access Count</div>
                <div className="text-white font-medium">
                  {shareData.accessCount}{shareData.maxAccess ? ` / ${shareData.maxAccess}` : ' / Unlimited'}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Total Size</div>
                <div className="text-white font-medium">
                  {formatFileSize(assets.reduce((total, asset) => total + asset.fileSize, 0))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all"
            >
              {/* Asset Preview */}
              <div className="aspect-video bg-gradient-to-br from-purple-900/20 to-indigo-900/20 flex items-center justify-center">
                {asset.thumbnailUrl ? (
                  <img
                    src={asset.thumbnailUrl}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-purple-400">
                    {getAssetIcon(asset)}
                  </div>
                )}
              </div>

              {/* Asset Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white truncate flex-1">{asset.name}</h3>
                  <div className="flex items-center gap-1 ml-2">
                    {asset.isApproved && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-400 mb-4">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="text-white capitalize">{asset.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Format:</span>
                    <span className="text-white uppercase">{asset.format}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span className="text-white">{formatFileSize(asset.fileSize)}</span>
                  </div>
                </div>

                {asset.description && (
                  <p className="text-sm text-gray-300 mb-4 line-clamp-2">{asset.description}</p>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadAsset(asset)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={() => window.open(asset.url, '_blank')}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-400">
          <p>This link expires on {shareData.expiresAt.toLocaleDateString()}</p>
          <p className="mt-2">Powered by Brand Asset Management System</p>
        </div>
      </div>
    </div>
  );
};

export default SharedAssetsView;