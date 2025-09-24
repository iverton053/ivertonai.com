import React from 'react';

interface QuickStatsCardProps {
  title: string;
  value: string;
  change: number;
  icon: string;
  color: string;
}

declare const QuickStatsCard: React.FC<QuickStatsCardProps>;
export default QuickStatsCard;