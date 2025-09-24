import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Icon from './Icon';
import LogoutButton from './auth/LogoutButton';
import ClientSwitcher from './ClientSwitcher';
import { sidebarItems, quickAccessItems, ExpandedSidebarItem, SidebarSubItem } from '../utils/constants';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Search, Zap, Star } from 'lucide-react';

interface EnhancedSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  clientData: any;
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

const colorMap = {
  purple: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
  blue: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  green: 'border-green-500/30 bg-green-500/10 text-green-400',
  indigo: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400',
  emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  cyan: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
  orange: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
  red: 'border-red-500/30 bg-red-500/10 text-red-400',
  pink: 'border-pink-500/30 bg-pink-500/10 text-pink-400',
  yellow: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  teal: 'border-teal-500/30 bg-teal-500/10 text-teal-400',
  violet: 'border-violet-500/30 bg-violet-500/10 text-violet-400',
  slate: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
  gray: 'border-gray-500/30 bg-gray-500/10 text-gray-400'
};

const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({ 
  activeSection, 
  setActiveSection, 
  clientData, 
  isCollapsed: externalCollapsed,
  onToggleCollapse
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickAccess, setShowQuickAccess] = useState(true);
  
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const toggleSidebar = () => {
    const newCollapsed = !isCollapsed;
    if (onToggleCollapse) {
      onToggleCollapse(newCollapsed);
    } else {
      setInternalCollapsed(newCollapsed);
    }
    // Collapse all expanded items when sidebar is collapsed
    if (newCollapsed) {
      setExpandedItems(new Set());
    }
  };

  const toggleItemExpansion = (itemId: string, hasSubItems: boolean) => {
    if (!hasSubItems) {
      setActiveSection(itemId);
      return;
    }
    
    if (isCollapsed) return;
    
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Filter items based on search
  const filteredItems = sidebarItems.filter(item => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return item.label.toLowerCase().includes(searchLower) ||
           item.subItems?.some(subItem => 
             subItem.label.toLowerCase().includes(searchLower) ||
             subItem.description?.toLowerCase().includes(searchLower)
           );
  });

  // Auto-expand items that match search
  useEffect(() => {
    if (searchTerm) {
      const matchingItems = sidebarItems.filter(item =>
        item.subItems?.some(subItem => 
          subItem.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setExpandedItems(new Set(matchingItems.map(item => item.id)));
    }
  }, [searchTerm]);

  const renderBadge = (badge?: string | number) => {
    if (!badge) return null;
    
    return (
      <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
        {badge}
      </span>
    );
  };

  const renderSubItem = (subItem: SidebarSubItem, parentId: string) => (
    <motion.button
      key={subItem.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      onClick={() => setActiveSection(subItem.id)}
      className={`w-full flex items-center justify-between pl-12 pr-4 py-2 rounded-lg text-sm transition-all group ${
        activeSection === subItem.id
          ? 'bg-purple-500/20 text-purple-300 border-l-2 border-purple-400'
          : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
      }`}
      title={subItem.description}
    >
      <div className="flex items-center space-x-3">
        <Icon name={subItem.icon} className="w-4 h-4 flex-shrink-0" />
        <span className="font-medium">{subItem.label}</span>
      </div>
      {renderBadge(subItem.badge)}
    </motion.button>
  );

  const renderNavigationItem = (item: ExpandedSidebarItem) => {
    const isExpanded = expandedItems.has(item.id);
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const colorClass = item.color ? colorMap[item.color as keyof typeof colorMap] : '';

    return (
      <div key={item.id} className="space-y-1">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => toggleItemExpansion(item.id, hasSubItems)}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
          } py-3 rounded-xl transition-all group relative ${
            activeSection === item.id && !hasSubItems
              ? `bg-purple-600 text-white shadow-lg shadow-purple-600/25 ${colorClass}`
              : `text-gray-400 hover:text-white hover:bg-gray-700/50 ${isExpanded ? 'bg-gray-700/30' : ''}`
          }`}
          title={isCollapsed ? item.label : undefined}
        >
          <div className="flex items-center space-x-3">
            <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
                className="font-medium flex-1 text-left"
              >
                {item.label}
              </motion.span>
            )}
          </div>
          
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              {renderBadge(item.badge)}
              {hasSubItems && (
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              )}
            </div>
          )}
          
          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div 
              className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-50"
            >
              <div className="font-medium">{item.label}</div>
              {item.badge && (
                <div className="text-xs text-gray-300 mt-1">
                  {typeof item.badge === 'string' ? item.badge : `${item.badge} items`}
                </div>
              )}
            </div>
          )}
        </motion.button>

        {/* Sub-items */}
        <AnimatePresence>
          {!isCollapsed && isExpanded && hasSubItems && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden space-y-1"
            >
              {item.subItems!.map(subItem => renderSubItem(subItem, item.id))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const groupedItems = filteredItems.reduce((acc, item) => {
    const category = item.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ExpandedSidebarItem[]>);

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="w-full glass-effect border-r border-white/20 flex flex-col relative premium-shadow h-screen fixed top-0 left-0 overflow-hidden"
      style={{ zIndex: 100 }}
    >
      {/* Toggle Button */}
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

      {/* Logo */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 relative flex-shrink-0">
            <img 
              src="/logo.png" 
              alt="Iverton AI Logo" 
              className="w-full h-full object-contain rounded-xl"
              onError={(e) => {
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

      {/* Search Bar */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-700/50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search navigation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Quick Access */}
      {!isCollapsed && showQuickAccess && quickAccessItems.length > 0 && (
        <div className="p-4 border-b border-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Access</h3>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex flex-wrap gap-2">
            {quickAccessItems.map(item => (
              <motion.button
                key={`quick-${item.id}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeSection === item.id
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-gray-700/30 text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Icon name={item.icon} className="w-3 h-3" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-xs rounded bg-purple-500/30 text-purple-300">
                    {item.badge}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="mb-6">
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                {category === 'core' ? 'Dashboard' :
                 category === 'business' ? 'Business' :
                 category === 'marketing' ? 'Marketing' :
                 category === 'tools' ? 'Tools & Settings' :
                 category}
              </h3>
            )}
            <div className="space-y-1">
              {items.map(renderNavigationItem)}
            </div>
          </div>
        ))}
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
        
        <div className="w-full">
          <LogoutButton isCollapsed={isCollapsed} />
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedSidebar;