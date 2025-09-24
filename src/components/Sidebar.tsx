import { motion } from 'framer-motion';
import { useState } from 'react';
import Icon from './Icon';
import LogoutButton from './auth/LogoutButton';
import ClientSwitcher from './ClientSwitcher';
import { sidebarSections } from '../utils/constants';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  clientData: any;
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
  isMobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  setActiveSection, 
  clientData, 
  isCollapsed: externalCollapsed,
  onToggleCollapse,
  isMobile = false
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    // Initialize with default expanded states
    Object.fromEntries(
      sidebarSections.map(section => [
        section.id, 
        section.defaultExpanded || false
      ])
    )
  );
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const toggleSidebar = () => {
    const newCollapsed = !isCollapsed;
    if (onToggleCollapse) {
      onToggleCollapse(newCollapsed);
    } else {
      setInternalCollapsed(newCollapsed);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="w-full glass-effect border-r border-white/20 flex flex-col relative premium-shadow h-screen fixed top-0 left-0 overflow-hidden"
      style={{ zIndex: 100 }}
    >
      {/* Toggle Button - Hide on mobile */}
      {!isMobile && onToggleCollapse && (
        <motion.button
          onClick={toggleSidebar}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute -right-3 top-6 w-6 h-6 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
          style={{ zIndex: 9999 }}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </motion.button>
      )}

      {/* Logo */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 relative flex-shrink-0">
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
                  parent.className = 'w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center relative flex-shrink-0';
                  parent.innerHTML = '<span class="text-white font-bold text-lg">I</span><div class="absolute inset-0 bg-purple-500/20 rounded-xl blur-lg animate-pulse"></div>';
                }
              }}
            />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
            >
              <h1 className="text-xl font-bold text-white">Iverton AI</h1>
              <p className="text-purple-300 text-xs">Premium Dashboard</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Client Switcher */}
      <ClientSwitcher isCollapsed={isCollapsed} />

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {sidebarSections.map((section) => (
            <div key={section.id}>
              {/* Section Header (only for collapsible sections) */}
              {section.isCollapsible && !isCollapsed && (
                <motion.button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700/30 mb-1"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center space-x-3">
                    {section.icon && <Icon name={section.icon} className="w-5 h-5" />}
                    <span className="text-base font-medium">{section.label}</span>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    {expandedSections[section.id] ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </motion.button>
              )}

              {/* Section Items */}
              <div className={`space-y-1 ${section.isCollapsible && !isCollapsed ? 'ml-2' : ''}`}>
                {section.items.map((item) => {
                  // Show items if: non-collapsible section OR collapsed sidebar OR section is expanded
                  const shouldShowItem = !section.isCollapsible || isCollapsed || expandedSections[section.id];
                  
                  return shouldShowItem ? (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center ${
                        isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'
                      } py-3 rounded-xl transition-all group relative ${
                        activeSection === item.id
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                          className="font-medium flex-1 text-left"
                        >
                          {item.label}
                        </motion.span>
                      )}
                      
                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div 
                          className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
                          style={{ zIndex: 1001 }}
                        >
                          {item.label}
                        </div>
                      )}
                    </motion.button>
                  ) : null;
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-700/50 mt-auto space-y-4 flex-shrink-0">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold">
              {clientData?.client_name?.[0] || clientData?.username?.[0] || 'U'}
            </span>
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="flex-1 min-w-0"
            >
              <p className="text-white font-medium truncate">
                {clientData?.client_name || clientData?.username || 'User'}
              </p>
              <p className="text-purple-300 text-xs truncate">
                {clientData?.company || 'Premium Plan'}
              </p>
            </motion.div>
          )}
        </div>
        
        {/* Logout Button with proper spacing */}
        <div className="w-full">
          <LogoutButton isCollapsed={isCollapsed} />
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;