import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApiCostTracker from '../automation/ApiCostTracker';
import { useApiCostStore } from '../../stores/apiCostStore';

interface ApiCostTrackerWidgetProps {
  onNavigateToAutomations?: () => void;
}

const ApiCostTrackerWidget: React.FC<ApiCostTrackerWidgetProps> = ({ onNavigateToAutomations }) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('30d');
  const { fetchCostData } = useApiCostStore();

  useEffect(() => {
    // Fetch initial cost data
    fetchCostData();
    
    // Set up periodic refresh
    const interval = setInterval(() => {
      fetchCostData();
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [fetchCostData]);

  const handleTimeRangeChange = (range: '24h' | '7d' | '30d' | '90d') => {
    setTimeRange(range);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full bg-gray-900 rounded-lg overflow-hidden"
    >
      <div className="h-full max-h-[600px] overflow-y-auto">
        <ApiCostTracker 
          timeRange={timeRange}
          onTimeRangeChange={handleTimeRangeChange}
        />
      </div>
    </motion.div>
  );
};

export default ApiCostTrackerWidget;