import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCustomAuthStore } from '../../stores/customAuthStore';
import AuthPage from './AuthPage';

interface AuthGuardProps {
  children: React.ReactNode;
}

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        {/* Logo */}
        <div className="w-20 h-20 mx-auto mb-6 relative">
          <img 
            src="/logo.png" 
            alt="Iverton AI Logo" 
            className="w-full h-full object-contain rounded-xl"
            onError={(e) => {
              // Fallback to gradient background with "I" if logo fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.className = 'w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mx-auto mb-6 relative';
                parent.innerHTML = '<span class="text-white font-bold text-3xl">I</span><div class="absolute inset-0 bg-purple-500/20 rounded-xl blur-lg animate-pulse"></div>';
              }
            }}
          />
        </div>
        
        {/* Loading Animation */}
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        
        {/* Text */}
        <h2 className="text-xl font-semibold text-white mb-2">Iverton AI</h2>
        <p className="text-gray-400">Loading your premium dashboard...</p>
      </motion.div>
    </div>
  );
};

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading, isInitialized, initialize } = useCustomAuthStore();

  useEffect(() => {
    // Initialize auth if not already done
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Show loading screen while auth is initializing
  if (!isInitialized || isLoading) {
    return <LoadingScreen />;
  }

  // Show auth page if user is not authenticated
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
};

export default AuthGuard;