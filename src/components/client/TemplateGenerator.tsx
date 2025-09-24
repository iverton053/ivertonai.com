import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Sparkles, Download, Eye, Copy, Check, 
  Target, Mail, Share2, Zap, Clock, Star, Briefcase,
  TrendingUp, Users, MessageSquare, Calendar
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  type: 'email' | 'social' | 'ad' | 'landing' | 'campaign';
  platform?: string;
  industry: string;
  description: string;
  preview: string;
  tags: string[];
  effectiveness: number; // 1-5 stars
  estimatedTime: number; // minutes to customize
}

interface TemplateGeneratorProps {
  clientIndustry: string;
  clientGoals: string[];
  clientSize: string;
  onTemplatesGenerated: (templates: Template[]) => void;
}

const TemplateGenerator: React.FC<TemplateGeneratorProps> = ({
  clientIndustry,
  clientGoals,
  clientSize,
  onTemplatesGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [generatedTemplates, setGeneratedTemplates] = useState<Template[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

  // Industry-specific template definitions
  const templateLibrary: Record<string, Template[]> = {
    technology: [
      {
        id: 'tech-product-launch',
        name: 'SaaS Product Launch Campaign',
        type: 'campaign',
        industry: 'technology',
        description: 'Complete campaign for software product launches with email sequences, social posts, and landing pages',
        preview: 'Multi-channel campaign targeting developers and IT decision makers',
        tags: ['product-launch', 'saas', 'b2b', 'conversion'],
        effectiveness: 5,
        estimatedTime: 15
      },
      {
        id: 'tech-linkedin-ads',
        name: 'B2B LinkedIn Lead Generation',
        type: 'ad',
        platform: 'LinkedIn',
        industry: 'technology',
        description: 'High-converting LinkedIn ads targeting tech professionals',
        preview: 'Solve [pain point] with our innovative solution. Book a demo today.',
        tags: ['linkedin', 'b2b', 'lead-gen', 'demo'],
        effectiveness: 4,
        estimatedTime: 5
      },
      {
        id: 'tech-email-nurture',
        name: 'Developer Nurture Sequence',
        type: 'email',
        industry: 'technology',
        description: '7-part email sequence for nurturing developer leads',
        preview: 'Welcome to our developer community. Here\'s what you need to know...',
        tags: ['email', 'nurture', 'developers', 'onboarding'],
        effectiveness: 4,
        estimatedTime: 20
      }
    ],
    healthcare: [
      {
        id: 'health-awareness',
        name: 'Health Awareness Campaign',
        type: 'campaign',
        industry: 'healthcare',
        description: 'Educational campaign promoting health awareness and services',
        preview: 'Multi-channel health education with trust-building content',
        tags: ['awareness', 'education', 'trust', 'community'],
        effectiveness: 5,
        estimatedTime: 12
      },
      {
        id: 'health-facebook-ads',
        name: 'Facebook Health Service Ads',
        type: 'ad',
        platform: 'Facebook',
        industry: 'healthcare',
        description: 'Compliant Facebook ads for healthcare services',
        preview: 'Trusted healthcare services in your area. Book your consultation.',
        tags: ['facebook', 'healthcare', 'local', 'consultation'],
        effectiveness: 4,
        estimatedTime: 8
      }
    ],
    retail: [
      {
        id: 'retail-seasonal',
        name: 'Seasonal Sales Campaign',
        type: 'campaign',
        industry: 'retail',
        description: 'Complete seasonal promotion campaign with email and social',
        preview: 'Multi-channel seasonal promotion driving foot traffic and online sales',
        tags: ['seasonal', 'promotion', 'sales', 'multi-channel'],
        effectiveness: 5,
        estimatedTime: 10
      },
      {
        id: 'retail-instagram',
        name: 'Instagram Shopping Posts',
        type: 'social',
        platform: 'Instagram',
        industry: 'retail',
        description: 'Product showcase posts optimized for Instagram Shopping',
        preview: 'Stunning product photography with direct shopping links',
        tags: ['instagram', 'shopping', 'visual', 'ecommerce'],
        effectiveness: 4,
        estimatedTime: 5
      }
    ],
    finance: [
      {
        id: 'finance-trust',
        name: 'Financial Trust Building',
        type: 'campaign',
        industry: 'finance',
        description: 'Educational campaign building trust and credibility',
        preview: 'Thought leadership content establishing financial expertise',
        tags: ['trust', 'education', 'expertise', 'credibility'],
        effectiveness: 5,
        estimatedTime: 18
      }
    ]
  };

  const generateTemplates = async () => {
    setIsGenerating(true);
    setProgress(0);

    const steps = [
      'Analyzing industry requirements...',
      'Identifying best practices...',
      'Generating campaign templates...',
      'Creating email sequences...',
      'Designing social media templates...',
      'Optimizing for your goals...',
      'Finalizing recommendations...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setGenerationStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 600));
      setProgress(((i + 1) / steps.length) * 100);
    }

    // Get industry-specific templates
    const industryTemplates = templateLibrary[clientIndustry] || templateLibrary.technology;
    
    // Add goal-specific templates
    const goalBasedTemplates = [];
    if (clientGoals.includes('Lead Generation')) {
      goalBasedTemplates.push({
        id: 'lead-gen-funnel',
        name: 'Lead Generation Funnel',
        type: 'campaign' as const,
        industry: clientIndustry,
        description: 'Complete lead generation funnel with landing pages and follow-up',
        preview: 'Automated funnel converting visitors to qualified leads',
        tags: ['lead-gen', 'funnel', 'automation', 'conversion'],
        effectiveness: 5,
        estimatedTime: 25
      });
    }

    if (clientGoals.includes('Brand Awareness')) {
      goalBasedTemplates.push({
        id: 'brand-awareness-social',
        name: 'Brand Awareness Social Campaign',
        type: 'social' as const,
        industry: clientIndustry,
        description: 'Multi-platform social campaign for brand visibility',
        preview: 'Engaging content strategy across all major social platforms',
        tags: ['brand', 'awareness', 'social', 'engagement'],
        effectiveness: 4,
        estimatedTime: 15
      });
    }

    const allTemplates = [...industryTemplates, ...goalBasedTemplates];
    setGeneratedTemplates(allTemplates);
    setSelectedTemplates(allTemplates.map(t => t.id)); // Select all by default
    setIsGenerating(false);

    onTemplatesGenerated(allTemplates);
  };

  const toggleTemplateSelection = (templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const getTypeIcon = (type: Template['type']) => {
    switch (type) {
      case 'email': return Mail;
      case 'social': return Share2;
      case 'ad': return Target;
      case 'landing': return FileText;
      case 'campaign': return Briefcase;
      default: return FileText;
    }
  };

  const getTypeColor = (type: Template['type']) => {
    switch (type) {
      case 'email': return 'from-blue-600 to-indigo-600';
      case 'social': return 'from-pink-600 to-purple-600';
      case 'ad': return 'from-green-600 to-emerald-600';
      case 'landing': return 'from-orange-600 to-red-600';
      case 'campaign': return 'from-purple-600 to-blue-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Generation Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Briefcase className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Industry</span>
          </div>
          <p className="text-gray-300 capitalize">{clientIndustry}</p>
        </div>

        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-white">Primary Goals</span>
          </div>
          <p className="text-gray-300">{clientGoals.slice(0, 2).join(', ')}</p>
        </div>

        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-white">Company Size</span>
          </div>
          <p className="text-gray-300">{clientSize}</p>
        </div>
      </div>

      {/* Generation Progress */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-lg"
        >
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full"
              />
              <span className="text-white font-medium">Generating Industry Templates...</span>
            </div>
            
            <div className="space-y-2">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                />
              </div>
              <p className="text-purple-400 text-sm">{generationStep}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Generated Templates */}
      {generatedTemplates.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span>Generated Templates ({generatedTemplates.length})</span>
            </h4>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">
                {selectedTemplates.length} selected
              </span>
              <button
                onClick={() => setSelectedTemplates(
                  selectedTemplates.length === generatedTemplates.length 
                    ? [] 
                    : generatedTemplates.map(t => t.id)
                )}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
              >
                {selectedTemplates.length === generatedTemplates.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {generatedTemplates.map((template, index) => {
                const TypeIcon = getTypeIcon(template.type);
                const isSelected = selectedTemplates.includes(template.id);
                
                return (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-purple-500 bg-purple-600/10' 
                        : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                    }`}
                    onClick={() => toggleTemplateSelection(template.id)}
                  >
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Template Type */}
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getTypeColor(template.type)} flex items-center justify-center mb-3`}>
                      <TypeIcon className="w-5 h-5 text-white" />
                    </div>

                    {/* Template Info */}
                    <div className="space-y-2">
                      <h5 className="font-semibold text-white text-sm leading-tight">
                        {template.name}
                      </h5>
                      
                      <p className="text-gray-400 text-xs leading-relaxed">
                        {template.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Effectiveness & Time */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < template.effectiveness 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        
                        <div className="flex items-center space-x-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{template.estimatedTime}m</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute bottom-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Preview functionality
                        }}
                        className="p-1 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Copy functionality
                        }}
                        className="p-1 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                        title="Copy"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-4 pt-4">
            <button className="flex items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              <span>Download Selected ({selectedTemplates.length})</span>
            </button>
            
            <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors">
              <Zap className="w-4 h-4" />
              <span>Customize Templates</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Generate Button */}
      {!isGenerating && generatedTemplates.length === 0 && (
        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateTemplates}
            className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-colors mx-auto"
          >
            <Sparkles className="w-5 h-5" />
            <span>Generate Industry Templates</span>
          </motion.button>
          <p className="text-gray-400 text-sm mt-2">
            AI-powered templates customized for {clientIndustry} industry
          </p>
        </div>
      )}
    </div>
  );
};

export default TemplateGenerator;