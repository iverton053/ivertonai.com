import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

declare const Icon: React.FC<IconProps>;
export default Icon;