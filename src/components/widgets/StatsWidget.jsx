import { motion } from 'framer-motion';
import Icon from '../Icon';

const StatsWidget = ({ title, value, change, icon }) => (
  <div className="h-full flex flex-col justify-between">
    <div className="flex items-center space-x-3 mb-4">
      <div className="p-3 bg-purple-600/20 rounded-xl border border-purple-500/20">
        <Icon name={icon} className="w-5 h-5 text-purple-400" />
      </div>
      <div className="flex-1">
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
        <div className="flex items-center space-x-2 mt-1">
          <span className={`text-sm font-medium ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
          <span className="text-gray-500 text-xs">vs last month</span>
        </div>
      </div>
    </div>
    
    {/* Mini Chart */}
    <div className="mt-auto">
      <div className="flex items-end space-x-1 h-8">
        {[65, 45, 78, 52, 90, 45, 67, 82].map((height, index) => (
          <motion.div
            key={index}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="flex-1 bg-gradient-to-t from-purple-600/30 to-purple-400/50 rounded-sm min-h-[2px]"
          />
        ))}
      </div>
    </div>
  </div>
);

export default StatsWidget;