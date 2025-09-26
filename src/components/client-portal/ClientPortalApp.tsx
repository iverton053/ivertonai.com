import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ClientPortalRouter from './ClientPortalRouter';
import { useCustomCode } from '../../hooks/useCustomCode';
import { AlertCircle } from 'lucide-react';

interface ClientPortalAppProps {
  // Can be initialized from URL params or props
  portalId?: string;
  subdomain?: string;
  customDomain?: string;
}

const ClientPortalApp: React.FC<ClientPortalAppProps> = ({ 
  portalId: propPortalId, 
  subdomain: propSubdomain, 
  customDomain: propCustomDomain 
}) => {
  const [portalId, setPortalId] = useState<string | null>(propPortalId || null);
  const [subdomain, setSubdomain] = useState<string | null>(propSubdomain || null);
  const [customDomain, setCustomDomain] = useState<string | null>(propCustomDomain || null);
  const [error, setError] = useState<string | null>(null);

  // Initialize custom code system for the portal
  const { applyCustomCodes } = useCustomCode({
    portalId: portalId || '',
    enabled: !!portalId
  });

  useEffect(() => {
    // Try to determine portal from URL if not provided as props
    if (!portalId && !subdomain && !customDomain) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlPortalId = urlParams.get('portalId');
      const urlSubdomain = urlParams.get('subdomain');
      
      // Try to extract from hostname (for subdomain routing)
      const hostname = window.location.hostname;
      const hostParts = hostname.split('.');
      
      if (urlPortalId) {
        setPortalId(urlPortalId);
      } else if (urlSubdomain) {
        setSubdomain(urlSubdomain);
      } else if (hostParts.length > 2 && hostParts[0] !== 'www') {
        // Assume first part is subdomain (e.g., client.yourdomain.com)
        setSubdomain(hostParts[0]);
      } else {
        // Check if this is a custom domain
        if (hostname !== 'localhost' && !hostname.includes('yourdomain.com')) {
          setCustomDomain(hostname);
        } else {
          setError('No portal identifier found. Please check your URL.');
        }
      }
    }
  }, [portalId, subdomain, customDomain]);

  // Resolve portal ID from subdomain or custom domain
  const resolvePortalId = async (): Promise<string | null> => {
    if (portalId) return portalId;
    
    // In a real implementation, this would make an API call to resolve
    // subdomain/custom domain to portal ID
    if (subdomain || customDomain) {
      // Mock resolution - in real app, this would be an API call
      return 'portal-' + (subdomain || customDomain?.replace(/\./g, '-'));
    }
    
    return null;
  };

  const [resolvedPortalId, setResolvedPortalId] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(true);

  useEffect(() => {
    const resolve = async () => {
      try {
        const resolved = await resolvePortalId();
        setResolvedPortalId(resolved);
        if (!resolved) {
          setError('Portal not found. Please check your URL.');
        }
      } catch (err) {
        setError('Failed to resolve portal. Please try again.');
      } finally {
        setIsResolving(false);
      }
    };

    resolve();
  }, [portalId, subdomain, customDomain]);

  // Loading state
  if (isResolving) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Resolving portal...</p>
          <p className="text-gray-300 text-sm mt-2">
            {subdomain && `Connecting to ${subdomain}`}
            {customDomain && `Connecting to ${customDomain}`}
            {portalId && `Loading portal ${portalId}`}
          </p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !resolvedPortalId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full mx-4 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-900/200/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Portal Not Found</h2>
          <p className="text-gray-300 mb-6">
            {error || 'The requested client portal could not be found.'}
          </p>
          <div className="space-y-2 text-sm text-gray-400 mb-6">
            {subdomain && <p>Subdomain: {subdomain}</p>}
            {customDomain && <p>Domain: {customDomain}</p>}
            {portalId && <p>Portal ID: {portalId}</p>}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-colors border border-white/30"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  // Render the main portal router
  return (
    <ClientPortalRouter
      portalId={resolvedPortalId}
      subdomain={subdomain || undefined}
      customDomain={customDomain || undefined}
    />
  );
};

export default ClientPortalApp;