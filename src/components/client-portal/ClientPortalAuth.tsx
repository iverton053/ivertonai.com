import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { clientPortalService } from '../../services/clientPortalService';
import { ClientPortalUser, ClientPortal } from '../../types/clientPortal';

interface ClientPortalAuthProps {
  portalId: string;
  onAuthSuccess: (user: ClientPortalUser, portal: ClientPortal, token: string) => void;
  branding?: {
    logo_url?: string;
    company_name: string;
    primary_color?: string;
    background_value?: string;
  };
}

interface AuthFormData {
  email: string;
  password?: string;
  rememberMe: boolean;
}

const ClientPortalAuth: React.FC<ClientPortalAuthProps> = ({ 
  portalId, 
  onAuthSuccess, 
  branding 
}) => {
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email_link' | 'password'>('email_link');
  const [emailSent, setEmailSent] = useState(false);

  // Check for auth token in URL params or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token') || localStorage.getItem(`portal_token_${portalId}`);
    
    if (token) {
      verifyToken(token);
    }
  }, [portalId]);

  const verifyToken = async (token: string) => {
    setIsLoading(true);
    try {
      // In real implementation, this would verify the token with the backend
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful auth - in real app, this would come from token verification
      const mockUser: ClientPortalUser = {
        id: 'user_1',
        client_portal_id: portalId,
        client_id: 'client_1',
        email: formData.email || 'user@example.com',
        full_name: 'Portal User',
        role: 'viewer',
        status: 'active',
        preferences: {
          email_notifications: true,
          notification_types: ['performance_alerts'],
          theme_preference: 'system',
          timezone: 'America/New_York',
          date_format: 'US',
          default_date_range: 30,
          preferred_metrics: ['traffic', 'rankings'],
          favorite_widgets: ['overview_stats']
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        invited_by: 'admin_user'
      };

      const mockPortal: ClientPortal = {
        id: portalId,
        agency_id: 'agency_1',
        client_id: 'client_1',
        subdomain: 'demo-client',
        is_active: true,
        branding: {
          company_name: branding?.company_name || 'Demo Client',
          social_links: {}
        },
        theme: {
          primary_color: branding?.primary_color || '#6366f1',
          secondary_color: '#8b5cf6',
          accent_color: '#06b6d4',
          background_type: 'gradient',
          background_value: branding?.background_value || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          font_family: 'inter',
          layout_style: 'modern',
          sidebar_style: 'dark'
        },
        access_settings: {
          auth_method: 'email_link',
          require_2fa: false,
          session_timeout: 480,
          max_concurrent_sessions: 3,
          allow_downloads: true,
          watermark_downloads: false
        },
        dashboard_config: {
          enabled_widgets: ['overview_stats', 'seo_rankings', 'website_traffic'],
          widget_settings: {},
          default_layout: {
            grid_size: { columns: 12, rows: 20 },
            widget_positions: {},
            sidebar_collapsed: false
          },
          allow_customization: true,
          data_refresh_interval: 15,
          historical_data_range: 365,
          available_exports: ['pdf', 'csv']
        },
        communication_settings: {
          email_notifications: true,
          notification_frequency: 'daily',
          enable_chat: true,
          show_announcements: true,
          show_changelog: true,
          support_widget_enabled: true,
          support_widget_position: 'bottom_right'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'admin_user'
      };

      localStorage.setItem(`portal_token_${portalId}`, token);
      onAuthSuccess(mockUser, mockPortal, token);
    } catch (err) {
      setError('Invalid or expired authentication token');
      localStorage.removeItem(`portal_token_${portalId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await clientPortalService.authenticatePortalUser(formData.email, portalId);
      
      if (response.success && response.user && response.portal && response.token) {
        if (formData.rememberMe) {
          localStorage.setItem(`portal_token_${portalId}`, response.token);
        }
        onAuthSuccess(response.user, response.portal, response.token);
      } else {
        // For email link auth, show success message
        if (authMethod === 'email_link') {
          setEmailSent(true);
        } else {
          setError(response.error || 'Authentication failed');
        }
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const backgroundStyle = branding?.background_value?.startsWith('linear-gradient') 
    ? { background: branding.background_value }
    : { backgroundColor: branding?.background_value || '#1f2937' };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={backgroundStyle}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full mx-4 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 text-center"
        >
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Check Your Email</h2>
          <p className="text-gray-300 mb-6">
            We've sent a secure login link to <strong>{formData.email}</strong>. 
            Click the link in your email to access your dashboard.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <Shield className="w-4 h-4" />
            <span>Secure email authentication</span>
          </div>
          <button
            onClick={() => setEmailSent(false)}
            className="mt-6 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Use different email address
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={backgroundStyle}>
      <div className="absolute inset-0 bg-black/20"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-md w-full mx-4 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 pb-0">
          {branding?.logo_url ? (
            <img
              src={branding.logo_url}
              alt={branding.company_name}
              className="h-12 mx-auto mb-6"
            />
          ) : (
            <div className="text-center mb-6">
              <div 
                className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center"
                style={{ backgroundColor: branding?.primary_color || '#6366f1' }}
              >
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">{branding?.company_name || 'Client Portal'}</h1>
            </div>
          )}

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-300">Sign in to access your dashboard</p>
          </div>
        </div>

        {/* Form */}
        <div className="px-8 pb-8">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            {/* Password Input - Only show for password auth */}
            {authMethod === 'password' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-transparent border border-white/20 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-300">
                Keep me signed in
              </label>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center space-x-2 p-3 bg-red-900/200/20 border border-red-500/30 rounded-lg"
                >
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-300 text-sm">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 px-4 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all flex items-center justify-center space-x-2 border border-white/30"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{authMethod === 'email_link' ? 'Send Login Link' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Auth Method Toggle */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setAuthMethod(authMethod === 'email_link' ? 'password' : 'email_link')}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {authMethod === 'email_link' ? 'Use password instead' : 'Use email link instead'}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
              <Shield className="w-3 h-3" />
              <span>Secure portal access</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ClientPortalAuth;