import React from 'react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: () => void;
}

declare const CommandPalette: React.FC<CommandPaletteProps>;
export default CommandPalette;