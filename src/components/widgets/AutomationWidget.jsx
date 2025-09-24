import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Icon from '../Icon';

const AutomationWidget = ({ automation }) => {
  const [isRunning, setIsRunning] = useState(automation.status === 'running');
  
  const toggleAutomation = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  return (
    <div className="h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-semibold">{automation.name}</h4>
          <div className="flex items-center space-x-2">
            <motion.div 
              animate={{ 
                scale: isRunning ? [1, 1.2, 1] : 1,
                opacity: isRunning ? [1, 0.7, 1] : 1
              }}
              transition={{ duration: 2, repeat: isRunning ? Infinity : 0 }}
              className={`w-3 h-3 rounded-full ${
                isRunning ? 'bg-green-400' :
                automation.status === 'completed' ? 'bg-blue-400' :
                automation.status === 'paused' ? 'bg-yellow-400' : 'bg-gray-400'
              }`}
            />
            <span className="text-gray-400 text-xs capitalize font-medium">
              {isRunning ? 'Running' : automation.status}
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Progress</span>
            <span className="text-purple-400 font-medium">{automation.progress}%</span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${automation.progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full" />
            </motion.div>
          </div>
        </div>

        <div className="text-gray-400 text-xs mb-4">
          Last run: {automation.lastRun}
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-2 border-t border-gray-700/30">
        <div className="text-xs text-gray-500">
          Next: {isRunning ? 'In progress...' : 'Scheduled'}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleAutomation}
          className={`p-2 rounded-lg transition-all ${
            isRunning 
              ? 'bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400' 
              : 'bg-green-600/20 hover:bg-green-600/30 text-green-400'
          }`}
        >
          <Icon name={isRunning ? 'Pause' : 'Play'} className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
};

export default AutomationWidget;