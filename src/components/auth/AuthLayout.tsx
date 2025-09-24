import React from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-indigo-500 rounded-full filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-effect premium-shadow rounded-2xl p-8 border border-white/20"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 mx-auto mb-4 relative">
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
                    parent.className += ' bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center';
                    parent.innerHTML = '<span class="text-white font-bold text-2xl">I</span><div class="absolute inset-0 bg-purple-500/20 rounded-xl blur-lg animate-pulse"></div>';
                  }
                }}
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Iverton AI</h1>
            <p className="text-gray-400 text-sm">Premium Dashboard</p>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-8"
          >
            <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
            {subtitle && (
              <p className="text-gray-400 text-sm">{subtitle}</p>
            )}
          </motion.div>

          {/* Form Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {children}
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center mt-6"
        >
          <p className="text-gray-500 text-xs">
            © 2024 Iverton AI. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;