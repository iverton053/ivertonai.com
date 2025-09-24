import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCustomAuthStore } from '../../stores/customAuthStore';
import Icon from '../Icon';

interface LogoutButtonProps {
  isCollapsed?: boolean;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ isCollapsed = false }) => {
  const { signOut, isLoading, getUserDisplayName } = useCustomAuthStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-4 bg-gray-800 border border-gray-700 rounded-lg"
      >
        <p className="text-white text-sm mb-4">Are you sure you want to sign out?</p>
        <div className="flex space-x-2">
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-1">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Signing Out...</span>
              </div>
            ) : (
              'Sign Out'
            )}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isLoading}
            className="flex-1 py-2 px-3 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.button
      onClick={() => setShowConfirm(true)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full flex items-center ${
        isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'
      } py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 group relative`}
      title={isCollapsed ? 'Sign Out' : undefined}
    >
      <Icon name="LogOut" className="w-5 h-5 flex-shrink-0" />
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="flex-1 text-left"
        >
          <div className="font-medium">Sign Out</div>
          <div className="text-xs text-gray-500">{getUserDisplayName()}</div>
        </motion.div>
      )}
      
      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div 
          className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
          style={{ zIndex: 1001 }}
        >
          Sign Out
        </div>
      )}
    </motion.button>
  );
};

export default LogoutButton;