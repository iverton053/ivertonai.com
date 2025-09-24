import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import Icon from '../Icon';
import { colorClasses } from '../../utils/constants';

const QuickStatsCard = ({ title, value, change, icon, color = "purple", isMobile = false }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`glass-effect premium-shadow premium-glow rounded-2xl ${isMobile ? 'p-4' : 'p-6'} hover:border-purple-400/50 transition-all duration-300`}
    >
      <div className={`flex items-center justify-between ${isMobile ? 'mb-3' : 'mb-4'}`}>
        <div className={`${isMobile ? 'p-2' : 'p-3'} rounded-xl border ${colorClasses[color]}`}>
          <Icon name={icon} className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
        </div>
        <span className={`text-sm font-medium ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change > 0 ? '+' : ''}{change}%
        </span>
      </div>
      
      <div>
        <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <p className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-white`}>{value}</p>
      </div>
    </motion.div>
  );
};

QuickStatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  change: PropTypes.number.isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.string,
  isMobile: PropTypes.bool,
};

export default React.memo(QuickStatsCard);