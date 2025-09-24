import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../Icon';
import SEORankingWidget from './SEORankingWidget';
import SEOAuditWidget from './SEOAuditWidget';
import ContentGapAnalysisWidget from './ContentGapAnalysisWidget';
import KeywordResearchWidget from './KeywordResearchWidget';
import BacklinkAnalysisWidget from './BacklinkAnalysisWidget';
import MarketTrendWidget from './MarketTrendWidget';
import TrendingHashtagsWidget from './TrendingHashtagsWidget';
import TechStackAnalyzerWidget from './TechStackAnalyzerWidget';
import SEOMetaTagWidget from './SEOMetaTagWidget';
import CompetitorMonitoringWidget from './CompetitorMonitoringWidget';
import PerformanceAnalyticsWidget from './PerformanceAnalyticsWidget';
import AIRecommendationsWidget from './AIRecommendationsWidget';
import WorkflowStatusWidget from './WorkflowStatusWidget';
import ApiCostTrackerWidget from './ApiCostTrackerWidget';

interface WidgetContentProps {
  type: string;
  content: any;
  onNavigateToAutomations?: () => void;
}

const StatsContent: React.FC<{ content: any }> = ({ content }) => (
  <div className="text-center">
    <div className="flex items-center justify-center mb-4">
      <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
        <Icon name={content.icon || 'TrendingUp'} className="w-6 h-6 text-purple-400" />
      </div>
    </div>
    <div className="text-3xl font-bold text-white mb-2">
      {content.value}{content.unit || ''}
    </div>
    <div className={`flex items-center justify-center space-x-1 ${
      content.change > 0 ? 'text-green-400' : content.change < 0 ? 'text-red-400' : 'text-gray-400'
    }`}>
      <Icon 
        name={content.change > 0 ? 'TrendingUp' : content.change < 0 ? 'TrendingDown' : 'Minus'} 
        className="w-4 h-4" 
      />
      <span className="font-medium">{Math.abs(content.change).toFixed(1)}%</span>
    </div>
  </div>
);

const ChartContent: React.FC<{ content: any }> = ({ content }) => {
  const ChartComponent = content.chartType === 'bar' ? BarChart : LineChart;
  const DataComponent = content.chartType === 'bar' ? Bar : Line;

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={content.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="name" 
            stroke="#9CA3AF" 
            fontSize={12}
          />
          <YAxis 
            stroke="#9CA3AF" 
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{ 
              background: 'rgba(17, 24, 39, 0.95)',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F3F4F6'
            }}
          />
          <DataComponent 
            dataKey="value" 
            stroke="#8B5CF6" 
            fill="#8B5CF6"
            strokeWidth={2}
          />
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

const AutomationContent: React.FC<{ content: any }> = ({ content }) => {
  const statusColors = {
    running: 'text-green-400 bg-green-400/20',
    completed: 'text-blue-400 bg-blue-400/20',
    paused: 'text-yellow-400 bg-yellow-400/20',
    failed: 'text-red-400 bg-red-400/20',
  };

  const statusColor = statusColors[content.status as keyof typeof statusColors] || statusColors.completed;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
          {content.status?.toUpperCase() || 'UNKNOWN'}
        </span>
        <span className="text-gray-400 text-sm">{content.progress || 0}%</span>
      </div>
      
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${content.progress || 0}%` }}
        />
      </div>
      
      <div className="text-sm text-gray-400">
        <p>Last run: {content.lastRun || 'Never'}</p>
        {content.nextRun && <p>Next run: {content.nextRun}</p>}
      </div>
    </div>
  );
};

const DefaultContent: React.FC<{ content: any; type: string }> = ({ content, type }) => (
  <div className="text-center space-y-4">
    <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto">
      <Icon name="Box" className="w-8 h-8 text-gray-400" />
    </div>
    <div>
      <h3 className="text-lg font-semibold text-white mb-2">{type.charAt(0).toUpperCase() + type.slice(1)} Widget</h3>
      <p className="text-gray-400 text-sm">
        {content.text || `This is a ${type} widget with custom content.`}
      </p>
    </div>
  </div>
);

const WidgetContent: React.FC<WidgetContentProps> = ({ type, content, onNavigateToAutomations }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      
      {/* New Tiered Automation Widgets */}
      {type === 'Competitor Monitoring' && <CompetitorMonitoringWidget onNavigateToAutomations={onNavigateToAutomations} />}
      {type === 'Performance Analytics' && <PerformanceAnalyticsWidget onNavigateToAutomations={onNavigateToAutomations} />}
      {type === 'AI Recommendations' && <AIRecommendationsWidget onNavigateToAutomations={onNavigateToAutomations} />}
      {type === 'Workflow Status' && <WorkflowStatusWidget onNavigateToAutomations={onNavigateToAutomations} />}
      {type === 'API Cost Tracker' && <ApiCostTrackerWidget onNavigateToAutomations={onNavigateToAutomations} />}
      
      {/* Legacy widget support */}
      {type === 'stats' && <StatsContent content={content} />}
      {type === 'chart' && <ChartContent content={content} />}
      {type === 'automation' && <AutomationContent content={content} />}
      
      {/* Existing Professional Widgets */}
      {type === 'SEO Ranking Tracker' && <SEORankingWidget data={content} />}
      {type === 'SEO Audit Dashboard' && <SEOAuditWidget data={content} />}
      {type === 'Content Gap Analysis' && <ContentGapAnalysisWidget data={content} />}
      {type === 'Keyword Research Analysis' && <KeywordResearchWidget data={content} />}
      {type === 'Backlink Analysis' && <BacklinkAnalysisWidget data={content} />}
      {type === 'Industry Intelligence Dashboard' && <MarketTrendWidget data={content} />}
      {type === 'Trending Hashtags Analyzer' && <TrendingHashtagsWidget data={content} />}
      {type === 'Tech Stack Analyzer' && <TechStackAnalyzerWidget data={content} />}
      {type === 'SEO Meta Tag Generator' && <SEOMetaTagWidget data={content} />}
      {!['AI Hub', 'Competitor Monitoring', 'Performance Analytics', 'AI Recommendations', 'Workflow Status', 'API Cost Tracker', 'stats', 'chart', 'automation', 'SEO Ranking Tracker', 'SEO Audit Dashboard', 'Content Gap Analysis', 'Keyword Research Analysis', 'Backlink Analysis', 'Industry Intelligence Dashboard', 'Trending Hashtags Analyzer', 'Tech Stack Analyzer', 'SEO Meta Tag Generator'].includes(type) && (
        <DefaultContent content={content} type={type} />
      )}
    </motion.div>
  );
};

export default WidgetContent;