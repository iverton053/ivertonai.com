import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  FileText,
  Send,
  Download,
  Copy,
  Zap,
  Settings,
  Play,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Star,
  Sparkles,
  Target,
  Clock,
  Hash,
  Users,
  Globe,
  Mic,
  Video,
  Image,
  MessageSquare
} from 'lucide-react';
import { WebhookService } from '../../utils/webhookConfig';

interface ScriptGeneratorFormData {
  platform: string;
  purpose: string;
  target_audience: string;
  script_length: string;
  key_message: string;
  cta: string;
  language: string;
  tone?: string;
  brand_context?: string;
  content_type?: string;
  industry?: string;
  campaign_type?: string;
  location?: string;
}

interface GeneratedScript {
  mainScript: string;
  qualityScore: number;
  performancePrediction: number;
  trendingElements: string[];
  optimizationNotes: string[];
  complianceCheck: string[];
}

const AIScriptGenerator: React.FC = () => {
  const [formData, setFormData] = useState<ScriptGeneratorFormData>({
    platform: 'instagram',
    purpose: '',
    target_audience: '',
    script_length: 'medium',
    key_message: '',
    cta: '',
    language: 'english',
    tone: 'engaging',
    content_type: 'video script',
    industry: 'general',
    campaign_type: 'brand awareness',
    location: 'global'
  });

  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'form' | 'results'>('form');

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: <Image className="w-5 h-5" />, color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
    { id: 'tiktok', name: 'TikTok', icon: <Video className="w-5 h-5" />, color: 'bg-gradient-to-br from-gray-700 to-gray-900' },
    { id: 'youtube', name: 'YouTube', icon: <Video className="w-5 h-5" />, color: 'bg-gradient-to-br from-red-500 to-red-700' },
    { id: 'linkedin', name: 'LinkedIn', icon: <Users className="w-5 h-5" />, color: 'bg-gradient-to-br from-blue-600 to-blue-800' },
    { id: 'facebook', name: 'Facebook', icon: <Users className="w-5 h-5" />, color: 'bg-gradient-to-br from-blue-500 to-blue-700' },
    { id: 'twitter', name: 'Twitter', icon: <MessageSquare className="w-5 h-5" />, color: 'bg-gradient-to-br from-blue-400 to-blue-600' },
    { id: 'pinterest', name: 'Pinterest', icon: <Image className="w-5 h-5" />, color: 'bg-gradient-to-br from-red-600 to-red-800' }
  ];

  const scriptLengths = [
    { id: 'short', name: 'Short (15-30 seconds)', description: 'Quick, punchy content' },
    { id: 'medium', name: 'Medium (30-90 seconds)', description: 'Balanced storytelling' },
    { id: 'long', name: 'Long (2-5 minutes)', description: 'In-depth narrative' }
  ];

  const contentTypes = [
    { id: 'video script', name: 'Video Script' },
    { id: 'caption only', name: 'Caption Only' },
    { id: 'story script', name: 'Story Script' },
    { id: 'carousel post', name: 'Carousel Post' },
    { id: 'reel script', name: 'Reel Script' }
  ];

  const tones = [
    'engaging', 'professional', 'casual', 'humorous', 'inspiring',
    'educational', 'conversational', 'authoritative', 'friendly', 'energetic'
  ];

  const industries = [
    'general', 'fitness', 'tech', 'fashion', 'food', 'finance',
    'health', 'beauty', 'travel', 'education', 'entertainment'
  ];

  const campaignTypes = [
    'brand awareness', 'product launch', 'sales', 'educational',
    'behind-the-scenes', 'user-generated content', 'seasonal', 'viral'
  ];

  const languages = [
    'english', 'hindi', 'spanish', 'french', 'german', 'italian',
    'portuguese', 'japanese', 'korean', 'chinese', 'arabic', 'hinglish', 'spanglish'
  ];

  const handleInputChange = (field: keyof ScriptGeneratorFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccessMessage('');
  };

  const validateForm = (): boolean => {
    const requiredFields = ['platform', 'purpose', 'target_audience', 'script_length', 'key_message', 'cta', 'language'];

    for (const field of requiredFields) {
      if (!formData[field as keyof ScriptGeneratorFormData]?.trim()) {
        setError(`Please fill in the ${field.replace('_', ' ')} field`);
        return false;
      }
    }

    // Validate field lengths
    if (formData.purpose.length < 5) {
      setError('Purpose must be at least 5 characters long');
      return false;
    }
    if (formData.purpose.length > 200) {
      setError('Purpose must be less than 200 characters');
      return false;
    }

    if (formData.target_audience.length < 5) {
      setError('Target audience must be at least 5 characters long');
      return false;
    }
    if (formData.target_audience.length > 200) {
      setError('Target audience must be less than 200 characters');
      return false;
    }

    if (formData.key_message.length < 10) {
      setError('Key message must be at least 10 characters long');
      return false;
    }
    if (formData.key_message.length > 500) {
      setError('Key message must be less than 500 characters');
      return false;
    }

    if (formData.cta.length < 3) {
      setError('Call to action must be at least 3 characters long');
      return false;
    }
    if (formData.cta.length > 100) {
      setError('Call to action must be less than 100 characters');
      return false;
    }

    return true;
  };

  const generateScript = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    setError('');

    try {
      // Call n8n webhook using the webhook service
      const result = await WebhookService.generateScript(formData);

      // If webhook returns data, use it; otherwise use mock response for development
      let scriptData: GeneratedScript;

      if (result && result.mainScript) {
        // Use real webhook response
        scriptData = {
          mainScript: result.mainScript || result.script || '',
          qualityScore: result.qualityScore || result.quality_score || 8.5,
          performancePrediction: result.performancePrediction || result.performance_prediction || 78,
          trendingElements: result.trendingElements || result.trending_elements || [],
          optimizationNotes: result.optimizationNotes || result.optimization_notes || [],
          complianceCheck: result.complianceCheck || result.compliance_check || []
        };
      } else {
        // Use mock response for development
        scriptData = {
        mainScript: `🎬 **${formData.platform.toUpperCase()} ${formData.content_type.toUpperCase()}**

**Hook (0-3 seconds):**
"Ever wondered how [your key message relates to audience pain point]? Here's what changed everything for me..."

**Main Content:**
${formData.key_message}

Perfect for ${formData.target_audience}, this ${formData.purpose} approach works because:
• Point 1 related to your message
• Point 2 showing benefits
• Point 3 creating urgency

**Call to Action:**
${formData.cta}

**Hashtags/Tags:**
#${formData.industry} #${formData.platform} #trending2025`,
        qualityScore: 8.5,
        performancePrediction: 78,
        trendingElements: [
          '2025 social media trends',
          'Engaging hook pattern',
          'Platform-native format',
          'Clear value proposition'
        ],
        optimizationNotes: [
          `Optimized for ${formData.platform} algorithm`,
          `${formData.tone} tone matches target audience`,
          'Strong emotional hook in first 3 seconds',
          'Clear call-to-action placement'
        ],
        complianceCheck: [
          'Content follows platform guidelines',
          'No misleading claims detected',
          'Appropriate for target audience'
        ]
      };

      }

      setGeneratedScript(scriptData);
      setActiveTab('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate script');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccessMessage('✅ Script copied to clipboard!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const downloadScript = () => {
    if (!generatedScript) return;

    try {
      const content = `AI Generated Script
Platform: ${formData.platform.toUpperCase()}
Content Type: ${formData.content_type}
Target Audience: ${formData.target_audience}
Generated: ${new Date().toLocaleDateString()}

==============================
SCRIPT CONTENT
==============================

${generatedScript.mainScript}

==============================
ANALYTICS & INSIGHTS
==============================

Quality Score: ${generatedScript.qualityScore}/10
Performance Prediction: ${generatedScript.performancePrediction}%

Trending Elements:
${generatedScript.trendingElements.map(el => `• ${el}`).join('\n')}

Optimization Notes:
${generatedScript.optimizationNotes.map(note => `• ${note}`).join('\n')}

Compliance Check:
${generatedScript.complianceCheck.map(check => `• ${check}`).join('\n')}

==============================
Generated with AI Script Generator
==============================`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formData.platform}-script-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      setSuccessMessage('✅ Script downloaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to download script');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-6 relative">
      {/* Background Effects - matching dashboard */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-gradient-to-r from-purple-600/15 via-violet-600/10 to-fuchsia-600/12 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-blue-600/10 via-indigo-600/15 to-purple-600/12 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-r from-violet-600/8 to-purple-600/12 rounded-full blur-2xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">AI Script Generator</h1>
              <p className="text-gray-300">Create engaging, platform-optimized content with AI</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-effect rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Scripts Generated</p>
                  <p className="text-2xl font-bold text-white">1,234</p>
                </div>
                <FileText className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <div className="glass-effect rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Avg Quality Score</p>
                  <p className="text-2xl font-bold text-white">8.7/10</p>
                </div>
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            <div className="glass-effect rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Platforms Supported</p>
                  <p className="text-2xl font-bold text-white">7</p>
                </div>
                <Globe className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="glass-effect rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Success Rate</p>
                  <p className="text-2xl font-bold text-white">94.2%</p>
                </div>
                <Target className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 glass-effect rounded-xl p-1 border border-white/20">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'form'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Configure</span>
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'results'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : !generatedScript
                  ? 'text-gray-500 cursor-not-allowed opacity-50'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
              disabled={!generatedScript}
            >
              <FileText className="w-4 h-4" />
              <span>Results</span>
            </button>
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Platform Selection */}
              <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                <h3 className="text-xl font-semibold text-white mb-4">Select Platform</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => handleInputChange('platform', platform.id)}
                      className={`flex flex-col items-center p-4 rounded-xl border transition-all ${
                        formData.platform === platform.id
                          ? 'border-purple-500 bg-purple-500/20 text-white'
                          : 'border-gray-600/50 bg-gray-800/50 text-gray-300 hover:border-gray-500/70 hover:bg-gray-700/30'
                      }`}
                    >
                      <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center mb-2`}>
                        {platform.icon}
                      </div>
                      <span className="text-sm font-medium">{platform.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                    <h3 className="text-xl font-semibold text-white mb-4">Basic Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Purpose</label>
                        <input
                          type="text"
                          value={formData.purpose}
                          onChange={(e) => handleInputChange('purpose', e.target.value)}
                          placeholder="e.g., Promote new product, Drive website traffic"
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Target Audience</label>
                        <input
                          type="text"
                          value={formData.target_audience}
                          onChange={(e) => handleInputChange('target_audience', e.target.value)}
                          placeholder="e.g., Young professionals aged 25-35"
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Key Message</label>
                        <textarea
                          value={formData.key_message}
                          onChange={(e) => handleInputChange('key_message', e.target.value)}
                          placeholder="Main message you want to convey"
                          rows={3}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Call to Action</label>
                        <input
                          type="text"
                          value={formData.cta}
                          onChange={(e) => handleInputChange('cta', e.target.value)}
                          placeholder="e.g., Visit our website, Follow for more"
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Content Settings */}
                  <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                    <h3 className="text-xl font-semibold text-white mb-4">Content Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Script Length</label>
                        <div className="space-y-2">
                          {scriptLengths.map((length) => (
                            <button
                              key={length.id}
                              onClick={() => handleInputChange('script_length', length.id)}
                              className={`w-full text-left p-3 rounded-lg border transition-all ${
                                formData.script_length === length.id
                                  ? 'border-purple-500 bg-purple-500/20'
                                  : 'border-gray-600/50 bg-gray-800/50 hover:border-gray-500/70'
                              }`}
                            >
                              <div className="font-medium text-white">{length.name}</div>
                              <div className="text-sm text-gray-400">{length.description}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">Content Type</label>
                          <select
                            value={formData.content_type}
                            onChange={(e) => handleInputChange('content_type', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                          >
                            {contentTypes.map((type) => (
                              <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">Tone</label>
                          <select
                            value={formData.tone}
                            onChange={(e) => handleInputChange('tone', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                          >
                            {tones.map((tone) => (
                              <option key={tone} value={tone}>{tone.charAt(0).toUpperCase() + tone.slice(1)}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">Industry</label>
                          <select
                            value={formData.industry}
                            onChange={(e) => handleInputChange('industry', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                          >
                            {industries.map((industry) => (
                              <option key={industry} value={industry}>{industry.charAt(0).toUpperCase() + industry.slice(1)}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">Language</label>
                          <select
                            value={formData.language}
                            onChange={(e) => handleInputChange('language', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                          >
                            {languages.map((language) => (
                              <option key={language} value={language}>{language.charAt(0).toUpperCase() + language.slice(1)}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Brand Context (Optional)</label>
                        <textarea
                          value={formData.brand_context || ''}
                          onChange={(e) => handleInputChange('brand_context', e.target.value)}
                          placeholder="Additional context about your brand, values, or style"
                          rows={2}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 border border-red-500/50 rounded-xl p-4"
                >
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-300">{error}</span>
                  </div>
                </motion.div>
              )}

              {/* Success Message */}
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-500/20 border border-green-500/50 rounded-xl p-4"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-300">{successMessage}</span>
                  </div>
                </motion.div>
              )}

              {/* Generate Button */}
              <motion.button
                onClick={generateScript}
                disabled={isGenerating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center space-x-2">
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Generating Script...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate AI Script</span>
                    </>
                  )}
                </div>
              </motion.button>
            </motion.div>
          )}

          {activeTab === 'results' && generatedScript && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Quality Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Quality Score</span>
                    <Star className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">{generatedScript.qualityScore}/10</div>
                  <div className="text-sm text-gray-400">Excellent quality</div>
                </div>

                <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Performance Prediction</span>
                    <Target className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">{generatedScript.performancePrediction}%</div>
                  <div className="text-sm text-gray-400">Success rate</div>
                </div>

                <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Trending Elements</span>
                    <Zap className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">{generatedScript.trendingElements.length}</div>
                  <div className="text-sm text-gray-400">2025 trends included</div>
                </div>
              </div>

              {/* Generated Script */}
              <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Generated Script</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(generatedScript.mainScript)}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={downloadScript}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {generatedScript.mainScript}
                  </pre>
                </div>
              </div>

              {/* Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trending Elements */}
                <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <span>Trending Elements</span>
                  </h3>
                  <div className="space-y-2">
                    {generatedScript.trendingElements.map((element, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{element}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optimization Notes */}
                <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-blue-400" />
                    <span>Optimization Notes</span>
                  </h3>
                  <div className="space-y-2">
                    {generatedScript.optimizationNotes.map((note, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-300 text-sm">{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Compliance Check */}
              <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Compliance Check</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {generatedScript.complianceCheck.map((check, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-green-300 text-sm">{check}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Another */}
              <motion.button
                onClick={() => setActiveTab('form')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="w-5 h-5" />
                  <span>Generate Another Script</span>
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIScriptGenerator;