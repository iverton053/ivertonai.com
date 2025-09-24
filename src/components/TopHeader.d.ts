import React from 'react';

interface TopHeaderProps {
  activeSection: string;
  currentTime: Date;
  showCommandPalette: boolean;
  setShowCommandPalette: (show: boolean) => void;
  setShowAddWidget: (show: boolean) => void;
  notifications: number;
  clientData: any;
}

declare const TopHeader: React.FC<TopHeaderProps>;
export default TopHeader;