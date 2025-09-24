import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Share2,
  Edit,
  Copy,
  Move,
  Trash2,
  Star,
  Eye,
  ExternalLink,
  FileText,
  History,
  Shield,
  Tag,
  Folder,
  Archive,
  RefreshCw,
  Link2,
  Info
} from 'lucide-react';
import { FileItem } from '../../types/fileManagement';

interface FileContextMenuProps {
  file: FileItem;
  position: { x: number; y: number };
  onClose: () => void;
  onAction: (action: string, file: FileItem) => void;
  isVisible: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  dangerous?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

const FileContextMenu: React.FC<FileContextMenuProps> = ({
  file,
  position,
  onClose,
  onAction,
  isVisible
}) => {
  const [subMenuOpen, setSubMenuOpen] = useState<string | null>(null);

  const handleAction = (actionId: string) => {
    onAction(actionId, file);
    onClose();
  };

  const getMenuItems = (): MenuItem[] => {
    const baseItems: MenuItem[] = [
      {
        id: 'preview',
        label: 'Preview',
        icon: <Eye size={16} />,
        shortcut: 'Space'
      },
      {
        id: 'open',
        label: 'Open',
        icon: <ExternalLink size={16} />,
        shortcut: 'Enter'
      },
      {
        id: 'download',
        label: 'Download',
        icon: <Download size={16} />,
        shortcut: 'Ctrl+D'
      },
      {
        id: 'divider1',
        label: '',
        icon: null,
        divider: true
      },
      {
        id: 'copy',
        label: 'Copy',
        icon: <Copy size={16} />,
        shortcut: 'Ctrl+C'
      },
      {
        id: 'move',
        label: 'Move to...',
        icon: <Move size={16} />
      },
      {
        id: 'rename',
        label: 'Rename',
        icon: <Edit size={16} />,
        shortcut: 'F2'
      },
      {
        id: 'divider2',
        label: '',
        icon: null,
        divider: true
      },
      {
        id: 'share',
        label: 'Share',
        icon: <Share2 size={16} />
      },
      {
        id: 'copy-link',
        label: 'Copy Link',
        icon: <Link2 size={16} />
      },
      {
        id: 'permissions',
        label: 'Permissions',
        icon: <Shield size={16} />
      },
      {
        id: 'divider3',
        label: '',
        icon: null,
        divider: true
      },
      {
        id: 'favorite',
        label: 'Add to Favorites',
        icon: <Star size={16} />
      },
      {
        id: 'add-tags',
        label: 'Add Tags',
        icon: <Tag size={16} />
      },
      {
        id: 'version-history',
        label: 'Version History',
        icon: <History size={16} />
      },
      {
        id: 'properties',
        label: 'Properties',
        icon: <Info size={16} />,
        shortcut: 'Alt+Enter'
      },
      {
        id: 'divider4',
        label: '',
        icon: null,
        divider: true
      }
    ];

    // Add file-type specific actions
    if (file.type === 'image') {
      baseItems.splice(4, 0, {
        id: 'edit-image',
        label: 'Edit Image',
        icon: <Edit size={16} />
      });
    }

    if (file.type === 'archive') {
      baseItems.splice(4, 0, {
        id: 'extract',
        label: 'Extract',
        icon: <Archive size={16} />
      });
    }

    if (['document', 'pdf', 'spreadsheet', 'presentation'].includes(file.type)) {
      baseItems.splice(4, 0, {
        id: 'convert',
        label: 'Convert to...',
        icon: <RefreshCw size={16} />
      });
    }

    // Add delete action at the end
    baseItems.push({
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 size={16} />,
      shortcut: 'Del',
      dangerous: true
    });

    return baseItems;
  };

  const renderMenuItem = (item: MenuItem) => {
    if (item.divider) {
      return (
        <div key={item.id} className="border-t border-white/10 my-1" />
      );
    }

    return (
      <motion.button
        key={item.id}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
          item.dangerous
            ? 'text-red-400 hover:text-red-300 hover:bg-red-500/20'
            : item.disabled
            ? 'text-gray-500 cursor-not-allowed'
            : 'text-gray-300 hover:text-white hover:bg-white/10'
        }`}
        onClick={() => !item.disabled && handleAction(item.id)}
        disabled={item.disabled}
        whileHover={{ scale: item.disabled ? 1 : 1.02 }}
        whileTap={{ scale: item.disabled ? 1 : 0.98 }}
      >
        <div className="flex items-center gap-3">
          {item.icon}
          <span>{item.label}</span>
        </div>
        {item.shortcut && (
          <kbd className="text-xs bg-white/20 px-1 py-0.5 rounded text-gray-400">
            {item.shortcut}
          </kbd>
        )}
      </motion.button>
    );
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="absolute glass-effect border border-white/20 rounded-xl shadow-2xl min-w-48 py-2 backdrop-blur-xl z-50"
          style={{
            left: Math.min(position.x, window.innerWidth - 200),
            top: Math.min(position.y, window.innerHeight - 400)
          }}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* File Info Header */}
          <div className="px-3 py-2 border-b border-white/10 mb-1">
            <div className="flex items-center gap-2">
              <div className="text-lg">
                {file.type === 'image' && '🖼️'}
                {file.type === 'video' && '🎬'}
                {file.type === 'audio' && '🎵'}
                {file.type === 'pdf' && '📄'}
                {file.type === 'document' && '📝'}
                {file.type === 'spreadsheet' && '📊'}
                {file.type === 'presentation' && '📽️'}
                {file.type === 'archive' && '📦'}
                {!['image', 'video', 'audio', 'pdf', 'document', 'spreadsheet', 'presentation', 'archive'].includes(file.type) && '📎'}
              </div>
              <div>
                <div className="font-medium text-white text-sm truncate max-w-32">
                  {file.name}
                </div>
                <div className="text-xs text-gray-400">
                  {file.size && `${Math.round(file.size / 1024)} KB`}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="px-2">
            {getMenuItems().map(renderMenuItem)}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FileContextMenu;