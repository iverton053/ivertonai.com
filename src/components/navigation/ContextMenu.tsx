import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MoreHorizontal, 
  Settings, 
  Edit, 
  Copy, 
  Share, 
  Export, 
  Trash, 
  Eye, 
  EyeOff, 
  Star,
  Pin,
  Refresh,
  Download,
  Plus,
  Filter,
  Sort,
  Calendar,
  Users,
  Bell,
  Lock,
  Unlock,
  Archive,
  Flag
} from 'lucide-react';
import Icon from '../Icon';

export interface ContextMenuAction {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  divider?: boolean;
  shortcut?: string;
  badge?: string | number;
}

interface ContextMenuProps {
  actions: ContextMenuAction[];
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

interface RoleBasedMenuProps {
  userRole: 'admin' | 'editor' | 'viewer';
  section: string;
  onAction: (actionId: string) => void;
  className?: string;
}

// Context Menu Component
const ContextMenu: React.FC<ContextMenuProps> = ({
  actions,
  children,
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 200;
    const menuHeight = actions.length * 40; // Approximate
    
    let x = e.clientX;
    let y = e.clientY;
    
    // Adjust position to keep menu in viewport
    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10;
    }
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10;
    }
    
    setPosition({ x, y });
    setIsOpen(true);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({ 
      x: rect.right + 5, 
      y: rect.top 
    });
    setIsOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('contextmenu', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (action: ContextMenuAction) => {
    if (action.disabled) return;
    
    action.onClick();
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div
        onContextMenu={handleContextMenu}
        onClick={handleClick}
        className="cursor-context-menu"
      >
        {children}
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.15 }}
              className="fixed z-50 bg-gray-800/95 backdrop-blur-lg border border-gray-600/50 rounded-lg shadow-2xl py-2 min-w-[200px]"
              style={{
                left: position.x,
                top: position.y,
              }}
            >
              {actions.map((action, index) => (
                <div key={action.id}>
                  {action.divider && index > 0 && (
                    <div className="h-px bg-gray-600/50 mx-2 my-1" />
                  )}
                  
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(75, 85, 99, 0.3)' }}
                    onClick={() => handleAction(action)}
                    disabled={action.disabled}
                    className={`w-full flex items-center justify-between px-4 py-2 text-left text-sm transition-colors ${
                      action.disabled
                        ? 'text-gray-500 cursor-not-allowed'
                        : action.destructive
                        ? 'text-red-400 hover:text-red-300'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon name={action.icon} className="w-4 h-4 flex-shrink-0" />
                      <span>{action.label}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {action.badge && (
                        <span className="px-1.5 py-0.5 text-xs rounded bg-purple-500/20 text-purple-300">
                          {action.badge}
                        </span>
                      )}
                      {action.shortcut && (
                        <span className="text-xs text-gray-500">{action.shortcut}</span>
                      )}
                    </div>
                  </motion.button>
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Role-based Context Menu
const RoleBasedContextMenu: React.FC<RoleBasedMenuProps> = ({
  userRole,
  section,
  onAction,
  className = ''
}) => {
  const getActionsForSection = (): ContextMenuAction[] => {
    const commonActions: ContextMenuAction[] = [
      {
        id: 'refresh',
        label: 'Refresh',
        icon: 'Refresh',
        onClick: () => onAction('refresh'),
        shortcut: 'Ctrl+R'
      },
      {
        id: 'export',
        label: 'Export Data',
        icon: 'Download',
        onClick: () => onAction('export')
      }
    ];

    const viewerActions: ContextMenuAction[] = [
      ...commonActions,
      {
        id: 'share',
        label: 'Share View',
        icon: 'Share',
        onClick: () => onAction('share')
      }
    ];

    const editorActions: ContextMenuAction[] = [
      ...viewerActions,
      {
        id: 'edit',
        label: 'Edit',
        icon: 'Edit',
        onClick: () => onAction('edit'),
        shortcut: 'Ctrl+E'
      },
      {
        id: 'duplicate',
        label: 'Duplicate',
        icon: 'Copy',
        onClick: () => onAction('duplicate')
      },
      { id: 'divider1', label: '', icon: '', onClick: () => {}, divider: true },
      {
        id: 'filter',
        label: 'Add Filter',
        icon: 'Filter',
        onClick: () => onAction('filter')
      },
      {
        id: 'sort',
        label: 'Sort Options',
        icon: 'Sort',
        onClick: () => onAction('sort')
      }
    ];

    const adminActions: ContextMenuAction[] = [
      ...editorActions,
      { id: 'divider2', label: '', icon: '', onClick: () => {}, divider: true },
      {
        id: 'permissions',
        label: 'Manage Permissions',
        icon: 'Lock',
        onClick: () => onAction('permissions')
      },
      {
        id: 'archive',
        label: 'Archive',
        icon: 'Archive',
        onClick: () => onAction('archive')
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: 'Trash',
        onClick: () => onAction('delete'),
        destructive: true,
        shortcut: 'Del'
      }
    ];

    // Section-specific actions
    const sectionActions: Record<string, ContextMenuAction[]> = {
      'crm': [
        {
          id: 'add-contact',
          label: 'Add Contact',
          icon: 'Plus',
          onClick: () => onAction('add-contact')
        },
        {
          id: 'bulk-import',
          label: 'Bulk Import',
          icon: 'Upload',
          onClick: () => onAction('bulk-import'),
          disabled: userRole === 'viewer'
        }
      ],
      'campaigns': [
        {
          id: 'create-campaign',
          label: 'Create Campaign',
          icon: 'Plus',
          onClick: () => onAction('create-campaign'),
          disabled: userRole === 'viewer'
        },
        {
          id: 'schedule',
          label: 'Schedule',
          icon: 'Calendar',
          onClick: () => onAction('schedule')
        }
      ],
      'automations': [
        {
          id: 'create-workflow',
          label: 'Create Workflow',
          icon: 'Plus',
          onClick: () => onAction('create-workflow'),
          disabled: userRole === 'viewer'
        },
        {
          id: 'pause-all',
          label: 'Pause All',
          icon: 'Pause',
          onClick: () => onAction('pause-all'),
          disabled: userRole === 'viewer'
        }
      ]
    };

    let baseActions: ContextMenuAction[] = [];
    
    switch (userRole) {
      case 'admin':
        baseActions = adminActions;
        break;
      case 'editor':
        baseActions = editorActions;
        break;
      case 'viewer':
      default:
        baseActions = viewerActions;
        break;
    }

    // Add section-specific actions at the beginning
    if (sectionActions[section]) {
      return [
        ...sectionActions[section],
        { id: 'section-divider', label: '', icon: '', onClick: () => {}, divider: true },
        ...baseActions
      ];
    }

    return baseActions;
  };

  const actions = getActionsForSection();

  return (
    <ContextMenu actions={actions} className={className}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-all"
        title="More options"
      >
        <MoreHorizontal className="w-4 h-4" />
      </motion.button>
    </ContextMenu>
  );
};

export default ContextMenu;
export { RoleBasedContextMenu };