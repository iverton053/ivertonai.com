import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Check, AlertTriangle, Settings } from 'lucide-react';
import { useBrandAssetsStore } from '../../stores/brandAssetsStore';

interface SupabaseConfigProps {
  onClose?: () => void;
}

const SupabaseConfig: React.FC<SupabaseConfigProps> = ({ onClose }) => {
  const { supabase, initializeSupabase, getSupabaseStatus } = useBrandAssetsStore();
  const [url, setUrl] = useState(supabase.url || '');
  const [anonKey, setAnonKey] = useState('');
  const [bucketName, setBucketName] = useState(supabase.bucketName || 'brand-assets');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) return;

    setIsLoading(true);
    setTestResult(null);

    try {
      await initializeSupabase(url.trim(), anonKey.trim(), bucketName.trim());
      const status = getSupabaseStatus();

      if (status.initialized && !status.error) {
        setTestResult({
          success: true,
          message: 'Successfully connected to Supabase!'
        });
      } else {
        setTestResult({
          success: false,
          message: status.error || 'Connection failed'
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isConfigured = supabase.initialized && !supabase.error;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Supabase Configuration</h2>
            <p className="text-gray-400">Configure cloud storage for brand assets</p>
          </div>
        </div>

        {isConfigured && (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-900/30 border border-green-500/30 rounded-full">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-green-300 text-sm">Connected</span>
          </div>
        )}
      </div>

      {/* Configuration Form */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Supabase Project URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none text-white placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Anonymous API Key
            </label>
            <input
              type="password"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none text-white placeholder-gray-400"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Found in your Supabase project settings under API keys
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Storage Bucket Name
            </label>
            <input
              type="text"
              value={bucketName}
              onChange={(e) => setBucketName(e.target.value)}
              placeholder="brand-assets"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none text-white placeholder-gray-400"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              The bucket will be created automatically if it doesn't exist
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading || !url.trim() || !anonKey.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed rounded-lg transition-colors text-white"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4" />
                  {isConfigured ? 'Update Configuration' : 'Connect to Supabase'}
                </>
              )}
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors text-white"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Test Result */}
        {testResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-3 rounded-lg border ${
              testResult.success
                ? 'bg-green-900/30 border-green-500/30 text-green-300'
                : 'bg-red-900/30 border-red-500/30 text-red-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <span className="text-sm">{testResult.message}</span>
            </div>
          </motion.div>
        )}

        {/* Current Status */}
        {supabase.error && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-red-300">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{supabase.error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3">Setup Instructions</h3>
        <ol className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">1</span>
            <span>Create a new project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">supabase.com</a></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">2</span>
            <span>Go to Project Settings → API and copy your Project URL and anon key</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">3</span>
            <span>Enable Storage in your Supabase project if not already enabled</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">4</span>
            <span>Enter your credentials above to connect</span>
          </li>
        </ol>
      </div>

      {/* Features enabled by Supabase */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3">Features Enabled</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'Secure cloud file storage',
            'Automatic thumbnail generation',
            'Version control with file history',
            'Large file upload support',
            'CDN-powered fast downloads',
            'Automatic backup and redundancy'
          ].map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
              <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupabaseConfig;