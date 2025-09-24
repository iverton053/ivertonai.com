import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb, 
  Target,
  CheckCircle,
  Zap,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'trend' | 'recommendation';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  actionable: boolean;
  estimatedImpact: string;
  automationType?: string;
  data?: any;
}

interface AIInsightsPanelProps {
  automationResults: any;
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ automationResults }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);

  // Generate AI insights based on automation data
  useEffect(() => {
    generateAIInsights();
  }, [automationResults]);

  const generateAIInsights = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const generatedInsights: AIInsight[] = [];
    
    Object.values(automationResults).forEach((automation: any) => {
      if (automation.data && automation.status === 'fresh') {
        // Generate insights based on automation type
        switch (automation.type) {
          case 'seo-analysis':
            if (automation.data.seoScore < 70) {
              generatedInsights.push({
                id: `seo-score-${automation.id}`,
                type: 'warning',
                title: 'SEO Score Below Optimal',
                description: `Your SEO score of ${automation.data.seoScore}/100 indicates room for improvement. Focus on technical SEO and content optimization.`,
                priority: 'high',
                confidence: 85,
                actionable: true,
                estimatedImpact: '+15-25% organic traffic',
                automationType: 'seo-analysis',
                data: automation.data
              });
            }
            
            if (automation.data.issues > 5) {
              generatedInsights.push({
                id: `seo-issues-${automation.id}`,
                type: 'recommendation',
                title: 'Multiple SEO Issues Detected',
                description: `${automation.data.issues} technical issues found. Prioritize fixing crawl errors and page speed optimizations.`,
                priority: 'medium',
                confidence: 92,
                actionable: true,
                estimatedImpact: '+10-20% search visibility',
                automationType: 'seo-analysis'
              });
            }
            
            if (automation.data.organicTraffic > 8000) {
              generatedInsights.push({
                id: `seo-opportunity-${automation.id}`,
                type: 'opportunity',
                title: 'High Traffic Volume - Scale Content',
                description: 'Strong organic performance detected. Consider expanding content strategy to capture more long-tail keywords.',
                priority: 'medium',
                confidence: 78,
                actionable: true,
                estimatedImpact: '+30-50% keyword coverage',
                automationType: 'seo-analysis'
              });
            }
            break;
            
          case 'competitor-intel':
            if (automation.data.gapOpportunities > 10) {
              generatedInsights.push({
                id: `competitor-gaps-${automation.id}`,
                type: 'opportunity',
                title: 'Significant Market Gaps Found',
                description: `${automation.data.gapOpportunities} content and keyword gaps identified versus competitors. High opportunity for quick wins.`,
                priority: 'high',
                confidence: 88,
                actionable: true,
                estimatedImpact: '+40-60% competitive advantage',
                automationType: 'competitor-intel'
              });
            }
            
            if (automation.data.marketPosition > 3) {
              generatedInsights.push({
                id: `market-position-${automation.id}`,
                type: 'warning',
                title: 'Market Position Needs Improvement',
                description: `Currently ranked #${automation.data.marketPosition} in market position. Focus on differentiation and unique value props.`,
                priority: 'high',
                confidence: 90,
                actionable: true,
                estimatedImpact: '+1-2 position improvement',
                automationType: 'competitor-intel'
              });
            }
            break;
            
          case 'social-media':
            const avgGrowth = automation.data.totalGrowth;
            if (avgGrowth < 5) {
              generatedInsights.push({
                id: `social-growth-${automation.id}`,
                type: 'recommendation',
                title: 'Social Media Growth Stagnant',
                description: `${avgGrowth}% growth rate is below industry average. Consider more engaging content and posting frequency optimization.`,
                priority: 'medium',
                confidence: 82,
                actionable: true,
                estimatedImpact: '+15-30% engagement rate',
                automationType: 'social-media'
              });
            }
            
            if (automation.data.totalEngagement > 4) {
              generatedInsights.push({
                id: `social-engagement-${automation.id}`,
                type: 'opportunity',
                title: 'High Engagement - Scale Strategy',
                description: `Excellent ${automation.data.totalEngagement}% engagement rate. Perfect time to increase content volume and explore new platforms.`,
                priority: 'low',
                confidence: 95,
                actionable: true,
                estimatedImpact: '+50-100% reach potential',
                automationType: 'social-media'
              });
            }
            break;
        }
      }
    });
    
    // Add some general AI insights
    if (generatedInsights.length > 0) {
      generatedInsights.push({
        id: 'ai-general-trend',
        type: 'trend',
        title: 'Cross-Platform Optimization Opportunity',
        description: 'AI analysis suggests coordinating SEO and social media strategies could yield 25% better results than isolated efforts.',
        priority: 'medium',
        confidence: 73,
        actionable: true,
        estimatedImpact: '+25% overall performance'
      });
    }
    
    setInsights(generatedInsights);
    setIsAnalyzing(false);
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'trend':
        return <TrendingDown className="w-5 h-5 text-blue-400" />;
      case 'recommendation':
        return <Lightbulb className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getPriorityColor = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-500/50 bg-red-500/10';
      case 'medium':
        return 'border-yellow-500/50 bg-yellow-500/10';
      case 'low':
        return 'border-green-500/50 bg-green-500/10';
    }
  };

  if (isAnalyzing) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Insights</h3>
            <p className="text-gray-400 text-sm">Analyzing your data...</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-700/50 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-600 rounded mb-2"></div>
              <div className="h-3 bg-gray-600 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-center mt-6">
          <div className="flex items-center space-x-2 text-purple-400">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span className="text-sm">AI is analyzing your automation results...</span>
          </div>
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-center">
        <Brain className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-400 mb-2">No AI Insights Available</h3>
        <p className="text-gray-500 text-sm">Run some automations to get AI-powered recommendations and insights.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Insights</h3>
              <p className="text-purple-300 text-sm">{insights.length} insights generated</p>
            </div>
          </div>
          <button
            onClick={generateAIInsights}
            className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
          >
            <Zap className="w-4 h-4" />
            <span>Re-analyze</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-lg border-l-4 p-4 cursor-pointer hover:bg-gray-700/50 transition-colors ${getPriorityColor(insight.priority)}`}
            onClick={() => setSelectedInsight(insight)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-white text-sm">{insight.title}</h4>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      insight.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                      insight.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-green-500/20 text-green-300'
                    }`}>
                      {insight.priority}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs mb-2">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Target className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500">{insight.confidence}% confidence</span>
                      </div>
                      <div className="text-xs text-green-400">{insight.estimatedImpact}</div>
                    </div>
                    {insight.actionable && (
                      <div className="flex items-center space-x-1 text-purple-400">
                        <CheckCircle className="w-3 h-3" />
                        <span className="text-xs">Actionable</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" />
            </div>
          </motion.div>
        ))}
      </div>
      
      {insights.length > 0 && (
        <div className="bg-gray-700/50 p-3 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div>Last updated: {new Date().toLocaleTimeString()}</div>
            <div className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>Powered by AI</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Detailed Insight Modal */}
      <AnimatePresence>
        {selectedInsight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedInsight(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-xl border border-gray-700 p-6 max-w-lg w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start space-x-3 mb-4">
                {getInsightIcon(selectedInsight.type)}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{selectedInsight.title}</h3>
                  <p className="text-gray-300 text-sm mb-4">{selectedInsight.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Confidence</div>
                      <div className="text-lg font-bold text-white">{selectedInsight.confidence}%</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Priority</div>
                      <div className={`text-lg font-bold capitalize ${
                        selectedInsight.priority === 'high' ? 'text-red-400' :
                        selectedInsight.priority === 'medium' ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>{selectedInsight.priority}</div>
                    </div>
                  </div>
                  
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
                    <div className="text-xs text-green-300 mb-1">Estimated Impact</div>
                    <div className="text-green-400 font-medium">{selectedInsight.estimatedImpact}</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedInsight(null)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      Close
                    </button>
                    {selectedInsight.actionable && (
                      <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                        Take Action
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIInsightsPanel;