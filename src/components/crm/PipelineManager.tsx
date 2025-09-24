import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  TrendingUp, DollarSign, Calendar, User, Plus, MoreVertical,
  Target, Clock, Award, Filter, Search, Download, BarChart3
} from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  value: number;
  contactId: string;
  contactName: string;
  currentStage: string;
  probability: number;
  status: 'open' | 'won' | 'lost';
  expectedCloseDate: string;
  lastActivity: string;
  owner: string;
  createdAt: string;
  stageHistory: Array<{
    stage: string;
    stageName: string;
    enteredAt: string;
    duration?: number;
  }>;
}

interface Pipeline {
  id: string;
  name: string;
  stages: Array<{
    id: string;
    name: string;
    probability: number;
    order: number;
    color: string;
  }>;
  deals: Deal[];
  isActive: boolean;
}

const PipelineManager: React.FC = () => {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [activePipeline, setActivePipeline] = useState<Pipeline | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showNewDeal, setShowNewDeal] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');

  // Mock data for demonstration
  useEffect(() => {
    const mockPipeline: Pipeline = {
      id: '1',
      name: 'Sales Pipeline',
      stages: [
        { id: '1', name: 'Qualified', probability: 20, order: 1, color: 'bg-blue-500' },
        { id: '2', name: 'Proposal', probability: 50, order: 2, color: 'bg-yellow-500' },
        { id: '3', name: 'Negotiation', probability: 75, order: 3, color: 'bg-orange-500' },
        { id: '4', name: 'Closed Won', probability: 100, order: 4, color: 'bg-green-500' }
      ],
      deals: [
        {
          id: '1',
          title: 'Enterprise Software License',
          value: 50000,
          contactId: '1',
          contactName: 'John Smith',
          currentStage: '1',
          probability: 20,
          status: 'open',
          expectedCloseDate: '2024-02-15',
          lastActivity: '2024-01-10',
          owner: 'Alice Johnson',
          createdAt: '2024-01-05',
          stageHistory: [
            { stage: '1', stageName: 'Qualified', enteredAt: '2024-01-05' }
          ]
        },
        {
          id: '2',
          title: 'Marketing Automation Setup',
          value: 25000,
          contactId: '2',
          contactName: 'Sarah Davis',
          currentStage: '2',
          probability: 50,
          status: 'open',
          expectedCloseDate: '2024-01-30',
          lastActivity: '2024-01-12',
          owner: 'Bob Wilson',
          createdAt: '2024-01-02',
          stageHistory: [
            { stage: '1', stageName: 'Qualified', enteredAt: '2024-01-02', duration: 5 },
            { stage: '2', stageName: 'Proposal', enteredAt: '2024-01-07' }
          ]
        },
        {
          id: '3',
          title: 'CRM Integration Project',
          value: 75000,
          contactId: '3',
          contactName: 'Mike Johnson',
          currentStage: '3',
          probability: 75,
          status: 'open',
          expectedCloseDate: '2024-02-01',
          lastActivity: '2024-01-11',
          owner: 'Carol Brown',
          createdAt: '2023-12-20',
          stageHistory: [
            { stage: '1', stageName: 'Qualified', enteredAt: '2023-12-20', duration: 7 },
            { stage: '2', stageName: 'Proposal', enteredAt: '2023-12-27', duration: 10 },
            { stage: '3', stageName: 'Negotiation', enteredAt: '2024-01-06' }
          ]
        }
      ],
      isActive: true
    };

    setPipelines([mockPipeline]);
    setActivePipeline(mockPipeline);
    setLoading(false);
  }, []);

  const handleDragEnd = (result: any) => {
    if (!result.destination || !activePipeline) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    const newDeals = [...activePipeline.deals];
    const dealIndex = newDeals.findIndex(deal => deal.id === draggableId);
    const deal = newDeals[dealIndex];
    
    const newStage = activePipeline.stages.find(stage => stage.id === destination.droppableId);
    if (newStage) {
      deal.currentStage = newStage.id;
      deal.probability = newStage.probability;
      
      // Add to stage history
      deal.stageHistory.push({
        stage: newStage.id,
        stageName: newStage.name,
        enteredAt: new Date().toISOString()
      });
    }

    const updatedPipeline = { ...activePipeline, deals: newDeals };
    setActivePipeline(updatedPipeline);
    setPipelines(prev => prev.map(p => p.id === activePipeline.id ? updatedPipeline : p));
  };

  const calculateStageMetrics = () => {
    if (!activePipeline) return {};

    const metrics: any = {};
    activePipeline.stages.forEach(stage => {
      const stageDeals = activePipeline.deals.filter(deal => deal.currentStage === stage.id);
      metrics[stage.id] = {
        count: stageDeals.length,
        totalValue: stageDeals.reduce((sum, deal) => sum + deal.value, 0),
        weightedValue: stageDeals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0)
      };
    });

    return metrics;
  };

  const calculateForecast = () => {
    if (!activePipeline) return { total: 0, weighted: 0, count: 0 };

    const openDeals = activePipeline.deals.filter(deal => deal.status === 'open');
    const total = openDeals.reduce((sum, deal) => sum + deal.value, 0);
    const weighted = openDeals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0);

    return { total, weighted, count: openDeals.length };
  };

  const filteredDeals = activePipeline?.deals.filter(deal => {
    const matchesSearch = searchQuery === '' || 
      deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.contactName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStage = stageFilter === 'all' || deal.currentStage === stageFilter;
    
    return matchesSearch && matchesStage;
  }) || [];

  const stageMetrics = calculateStageMetrics();
  const forecast = calculateForecast();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Pipeline Management</h2>
          <p className="text-gray-400">Track deals and forecast revenue</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowForecast(!showForecast)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Forecast
          </button>
          <button
            onClick={() => setShowNewDeal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Deal
          </button>
        </div>
      </div>

      {/* Forecast Panel */}
      <AnimatePresence>
        {showForecast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-effect p-6 rounded-xl border border-blue-500/20"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">${(forecast.total / 1000).toFixed(0)}K</div>
                <div className="text-sm text-gray-400">Total Pipeline Value</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">${(forecast.weighted / 1000).toFixed(0)}K</div>
                <div className="text-sm text-gray-400">Weighted Forecast</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{forecast.count}</div>
                <div className="text-sm text-gray-400">Open Deals</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
        >
          <option value="all">All Stages</option>
          {activePipeline?.stages.map(stage => (
            <option key={stage.id} value={stage.id}>{stage.name}</option>
          ))}
        </select>
      </div>

      {/* Pipeline Board */}
      {activePipeline && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {activePipeline.stages.map(stage => {
              const stageDeals = filteredDeals.filter(deal => deal.currentStage === stage.id);
              const metrics = stageMetrics[stage.id] || { count: 0, totalValue: 0, weightedValue: 0 };
              
              return (
                <div key={stage.id} className="glass-effect rounded-xl p-4">
                  {/* Stage Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                      <h3 className="font-semibold text-white">{stage.name}</h3>
                      <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
                        {metrics.count}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">{stage.probability}%</div>
                  </div>

                  {/* Stage Metrics */}
                  <div className="mb-4 p-2 bg-gray-700/50 rounded-lg">
                    <div className="text-sm font-medium text-white">
                      ${(metrics.totalValue / 1000).toFixed(0)}K
                    </div>
                    <div className="text-xs text-gray-400">
                      ${(metrics.weightedValue / 1000).toFixed(0)}K weighted
                    </div>
                  </div>

                  {/* Droppable Area */}
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-3 min-h-[200px] ${
                          snapshot.isDraggingOver ? 'bg-blue-900/20' : ''
                        }`}
                      >
                        {stageDeals.map((deal, index) => (
                          <Draggable key={deal.id} draggableId={deal.id} index={index}>
                            {(provided, snapshot) => (
                              <motion.div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-3 bg-gray-800/50 rounded-lg shadow-sm border border-gray-600 cursor-pointer hover:shadow-md transition-shadow ${
                                  snapshot.isDragging ? 'shadow-lg' : ''
                                }`}
                                onClick={() => setSelectedDeal(deal)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-white text-sm leading-tight">
                                    {deal.title}
                                  </h4>
                                  <button className="text-gray-400 hover:text-gray-300">
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                </div>
                                
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold text-green-600">
                                      ${(deal.value / 1000).toFixed(0)}K
                                    </span>
                                    <span className="text-xs text-gray-400">{deal.probability}%</span>
                                  </div>
                                  
                                  <div className="flex items-center text-xs text-gray-400">
                                    <User className="w-3 h-3 mr-1" />
                                    {deal.contactName}
                                  </div>
                                  
                                  <div className="flex items-center text-xs text-gray-400">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {new Date(deal.expectedCloseDate).toLocaleDateString()}
                                  </div>
                                  
                                  <div className="flex items-center text-xs text-gray-400">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {deal.owner}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* Deal Details Modal */}
      <AnimatePresence>
        {selectedDeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedDeal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-effect rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {selectedDeal.title}
                </h3>
                <button
                  onClick={() => setSelectedDeal(null)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Deal Value
                  </label>
                  <div className="text-2xl font-bold text-green-600">
                    ${selectedDeal.value.toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Probability
                  </label>
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedDeal.probability}%
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Contact
                  </label>
                  <div className="text-gray-900 dark:text-white">{selectedDeal.contactName}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Expected Close Date
                  </label>
                  <div className="text-gray-900 dark:text-white">
                    {new Date(selectedDeal.expectedCloseDate).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Deal Owner
                  </label>
                  <div className="text-gray-900 dark:text-white">{selectedDeal.owner}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Stage History
                  </label>
                  <div className="space-y-2">
                    {selectedDeal.stageHistory.map((history, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-sm text-gray-900 dark:text-white">{history.stageName}</span>
                        <div className="text-sm text-gray-400">
                          {new Date(history.enteredAt).toLocaleDateString()}
                          {history.duration && <span className="ml-2">({history.duration} days)</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setSelectedDeal(null)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Edit Deal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PipelineManager;