import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClientPortalAuth from './ClientPortalAuth';
import ClientPortalDashboard from './ClientPortalDashboard';
import { ClientPortalUser, ClientPortal } from '../../types/clientPortal';

interface ClientPortalRouterProps {
  portalId: string;
  subdomain?: string;
  customDomain?: string;
}

interface AuthState {
  user: ClientPortalUser | null;
  portal: ClientPortal | null;
  token: string | null;
  isLoading: boolean;
}

const ClientPortalRouter: React.FC<ClientPortalRouterProps> = ({ 
  portalId, 
  subdomain, 
  customDomain 
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    portal: null,
    token: null,
    isLoading: true
  });

  useEffect(() => {
    // Check for existing auth token
    const checkAuthToken = () => {
      const token = localStorage.getItem(`portal_token_${portalId}`);
      if (token) {
        // In real implementation, validate token with backend
        // For now, we'll just set loading to false
        setAuthState(prev => ({ ...prev, isLoading: false }));
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkAuthToken();
  }, [portalId]);

  const handleAuthSuccess = (user: ClientPortalUser, portal: ClientPortal, token: string) => {
    setAuthState({
      user,
      portal,
      token,
      isLoading: false
    });
  };

  const handleLogout = () => {
    localStorage.removeItem(`portal_token_${portalId}`);
    setAuthState({
      user: null,
      portal: null,
      token: null,
      isLoading: false
    });
  };

  // Loading screen
  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading portal...</p>
        </motion.div>
      </div>
    );
  }

  // Show authentication if no user is logged in
  if (!authState.user || !authState.portal) {
    return (
      <ClientPortalAuth
        portalId={portalId}
        onAuthSuccess={handleAuthSuccess}
        branding={authState.portal?.branding}
      />
    );
  }

  // Show dashboard if user is authenticated
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="dashboard"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ClientPortalDashboard
          user={authState.user}
          portal={authState.portal}
          onLogout={handleLogout}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default ClientPortalRouter;