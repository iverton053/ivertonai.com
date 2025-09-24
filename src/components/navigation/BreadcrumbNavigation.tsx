import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
import Icon from '../Icon';
import { sidebarItems } from '../../utils/constants';

export interface BreadcrumbItem {
  id: string;
  label: string;
  icon?: string;
  onClick?: () => void;
}

interface BreadcrumbNavigationProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  className?: string;
}

const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  activeSection,
  onNavigate,
  className = ''
}) => {
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [
      {
        id: 'home',
        label: 'Dashboard',
        icon: 'Home',
        onClick: () => onNavigate('overview')
      }
    ];

    // Find the current section and its parent
    for (const item of sidebarItems) {
      // Check if this is a main section
      if (item.id === activeSection) {
        breadcrumbs.push({
          id: item.id,
          label: item.label,
          icon: item.icon
        });
        break;
      }

      // Check if this is a sub-section
      if (item.subItems) {
        const subItem = item.subItems.find(sub => sub.id === activeSection);
        if (subItem) {
          // Add parent section
          breadcrumbs.push({
            id: item.id,
            label: item.label,
            icon: item.icon,
            onClick: () => onNavigate(item.id)
          });
          
          // Add current sub-section
          breadcrumbs.push({
            id: subItem.id,
            label: subItem.label,
            icon: subItem.icon
          });
          break;
        }
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs if we're on the home/overview page
  if (activeSection === 'overview' || breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center space-x-2 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        
        return (
          <React.Fragment key={item.id}>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="flex items-center space-x-2"
            >
              {item.onClick && !isLast ? (
                <motion.button
                  onClick={item.onClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-2 py-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/30 transition-all"
                >
                  {item.icon && (
                    <Icon name={item.icon} className="w-4 h-4" />
                  )}
                  <span>{item.label}</span>
                </motion.button>
              ) : (
                <div className={`flex items-center space-x-2 px-2 py-1 ${
                  isLast 
                    ? 'text-white font-medium' 
                    : 'text-gray-400'
                }`}>
                  {item.icon && (
                    <Icon name={item.icon} className="w-4 h-4" />
                  )}
                  <span>{item.label}</span>
                </div>
              )}
            </motion.div>

            {!isLast && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.05 + 0.1 }}
              >
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </motion.div>
            )}
          </React.Fragment>
        );
      })}
    </motion.nav>
  );
};

export default BreadcrumbNavigation;