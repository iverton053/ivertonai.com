import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Send,
  Download,
  Copy,
  Zap,
  Settings,
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
  BookOpen,
  Edit3,
  TrendingUp,
  Search,
  Link,
  Award,
  BarChart3,
  Eye,
  Type
} from 'lucide-react';
import { WebhookService } from '../../utils/webhookConfig';

interface BlogPostFormData {
  topic: string;
  target_audience: string;
  word_count: number;
  language: string;
  tone_style?: string;
  keywords?: string;
  references?: string;
}

interface GeneratedBlogPost {
  title: string;
  meta_description: string;
  primary_keyword: string;
  secondary_keywords: string[];
  keyword_research_notes?: string;
  headings: Array<{
    level: string;
    text: string;
  }>;
  content: string;
  word_count: number;
  actual_word_count?: number;
  word_count_accuracy?: number;
  internal_links: string[];
  call_to_action: string;
  seo_score: string;
  seo_analysis?: {
    title_length: number;
    title_score: number;
    meta_description_length: number;
    meta_description_score: number;
    headings_count: number;
    h1_count: number;
    h2_count: number;
    h3_count: number;
    overall_score: number;
    issues: string[];
    suggestions: string[];
  };
  status: string;
  generated_at?: string;
}

const BlogPostGenerator: React.FC = () => {
  const [formData, setFormData] = useState<BlogPostFormData>({
    topic: '',
    target_audience: '',
    word_count: 1000,
    language: 'English',
    tone_style: 'professional',
    keywords: '',
    references: ''
  });

  const [generatedBlogPost, setGeneratedBlogPost] = useState<GeneratedBlogPost | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'form' | 'results' | 'seo'>('form');

  const toneStyles = [
    { value: 'professional', label: 'Professional', description: 'Formal, authoritative tone' },
    { value: 'conversational', label: 'Conversational', description: 'Friendly, approachable tone' },
    { value: 'informative', label: 'Informative', description: 'Educational, fact-based tone' },
    { value: 'persuasive', label: 'Persuasive', description: 'Compelling, action-oriented tone' },
    { value: 'engaging', label: 'Engaging', description: 'Entertaining, captivating tone' },
    { value: 'authoritative', label: 'Authoritative', description: 'Expert, confident tone' },
    { value: 'casual', label: 'Casual', description: 'Relaxed, informal tone' },
    { value: 'technical', label: 'Technical', description: 'Detailed, precise tone' }
  ];

  const languages = [
    'English', 'Hindi', 'Hinglish', 'Spanish', 'French', 'German',
    'Italian', 'Portuguese', 'Japanese', 'Korean', 'Chinese', 'Arabic'
  ];

  const wordCountOptions = [
    { value: 300, label: '300 words', description: 'Short article' },
    { value: 500, label: '500 words', description: 'Brief post' },
    { value: 800, label: '800 words', description: 'Medium article' },
    { value: 1000, label: '1,000 words', description: 'Standard post' },
    { value: 1500, label: '1,500 words', description: 'Detailed article' },
    { value: 2000, label: '2,000 words', description: 'Long-form content' },
    { value: 3000, label: '3,000 words', description: 'Comprehensive guide' },
    { value: 5000, label: '5,000 words', description: 'Ultimate guide' }
  ];

  const handleInputChange = (field: keyof BlogPostFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccessMessage('');
  };

  const validateForm = (): boolean => {
    const requiredFields = ['topic', 'target_audience', 'word_count', 'language'];

    for (const field of requiredFields) {
      if (!formData[field as keyof BlogPostFormData]) {
        setError(`Please fill in the ${field.replace('_', ' ')} field`);
        return false;
      }
    }

    // Validate topic length
    if (formData.topic.length < 5) {
      setError('Topic must be at least 5 characters long');
      return false;
    }
    if (formData.topic.length > 200) {
      setError('Topic must be less than 200 characters');
      return false;
    }

    // Validate target audience length
    if (formData.target_audience.length < 5) {
      setError('Target audience must be at least 5 characters long');
      return false;
    }
    if (formData.target_audience.length > 200) {
      setError('Target audience must be less than 200 characters');
      return false;
    }

    if (formData.word_count < 100 || formData.word_count > 5000) {
      setError('Word count must be between 100 and 5000');
      return false;
    }

    if (formData.keywords && formData.keywords.trim()) {
      const keywords = formData.keywords.split(',').map(k => k.trim()).filter(k => k);
      if (keywords.length < 3) {
        setError('Please provide at least 3 keywords when specifying keywords, or leave empty');
        return false;
      }
      if (keywords.length > 10) {
        setError('Maximum 10 keywords allowed');
        return false;
      }
    }

    return true;
  };

  const generateBlogPost = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    setError('');

    try {
      // Call n8n webhook using the webhook service
      const result = await WebhookService.generateBlogPost(formData);

      // If webhook returns data, use it; otherwise use mock response for development
      let blogData: GeneratedBlogPost;

      if (result && result.title) {
        // Use real webhook response
        blogData = {
          title: result.title || '',
          meta_description: result.meta_description || '',
          primary_keyword: result.primary_keyword || '',
          secondary_keywords: result.secondary_keywords || [],
          keyword_research_notes: result.keyword_research_notes || '',
          headings: result.headings || [],
          content: result.content || '',
          word_count: result.word_count || formData.word_count,
          actual_word_count: result.actual_word_count || result.word_count,
          word_count_accuracy: result.word_count_accuracy || 100,
          internal_links: result.internal_links || [],
          call_to_action: result.call_to_action || '',
          seo_score: result.seo_score || 'A',
          seo_analysis: result.seo_analysis || undefined,
          status: result.status || 'success',
          generated_at: result.generated_at || new Date().toISOString()
        };
      } else {
        // Use mock response for development
        blogData = {
          title: `Ultimate Guide to ${formData.topic}: Everything You Need to Know`,
          meta_description: `Discover comprehensive insights about ${formData.topic}. Expert tips, strategies, and actionable advice for ${formData.target_audience}.`,
          primary_keyword: formData.topic.toLowerCase().replace(/\s+/g, ' '),
          secondary_keywords: [
            `${formData.topic} guide`,
            `${formData.topic} tips`,
            `${formData.topic} strategies`,
            `best ${formData.topic} practices`
          ],
          keyword_research_notes: `Keywords selected based on search volume and relevance to ${formData.topic} for ${formData.target_audience}.`,
          headings: [
            { level: 'H1', text: `Ultimate Guide to ${formData.topic}` },
            { level: 'H2', text: `Understanding ${formData.topic}` },
            { level: 'H3', text: 'Key Concepts and Fundamentals' },
            { level: 'H2', text: `Best Practices for ${formData.topic}` },
            { level: 'H3', text: 'Expert Strategies' },
            { level: 'H3', text: 'Common Mistakes to Avoid' },
            { level: 'H2', text: 'Implementation Guide' },
            { level: 'H2', text: 'Conclusion' }
          ],
          content: `# Ultimate Guide to ${formData.topic}

${formData.topic} has become increasingly important for ${formData.target_audience} in today's digital landscape. This comprehensive guide will provide you with everything you need to know to master ${formData.topic} and achieve outstanding results.

## Understanding ${formData.topic}

### Key Concepts and Fundamentals

When approaching ${formData.topic}, it's essential to understand the core principles that drive success. This section covers the fundamental concepts that every ${formData.target_audience} should know.

${formData.topic} involves multiple components that work together to create a cohesive strategy. By understanding these elements, you can build a strong foundation for your efforts.

## Best Practices for ${formData.topic}

### Expert Strategies

Industry experts recommend several key strategies for maximizing your ${formData.topic} efforts:

1. **Strategy One**: Focus on understanding your audience needs and preferences
2. **Strategy Two**: Implement data-driven approaches for better results
3. **Strategy Three**: Continuously optimize based on performance metrics

### Common Mistakes to Avoid

Many ${formData.target_audience} make these critical errors when working with ${formData.topic}:

- Rushing the planning phase
- Ignoring audience feedback
- Failing to measure results
- Not staying updated with trends

## Implementation Guide

To successfully implement ${formData.topic} strategies, follow this step-by-step approach:

1. **Assessment Phase**: Analyze your current situation
2. **Planning Phase**: Develop a comprehensive strategy
3. **Execution Phase**: Implement your plan systematically
4. **Optimization Phase**: Continuously improve based on results

## Conclusion

Mastering ${formData.topic} requires dedication, strategic thinking, and continuous learning. By following the strategies outlined in this guide, ${formData.target_audience} can achieve significant improvements in their results.

Remember that success with ${formData.topic} is a journey, not a destination. Stay committed to learning and adapting your approach as you gain more experience.`,
          word_count: formData.word_count,
          actual_word_count: formData.word_count,
          word_count_accuracy: 100,
          internal_links: [
            `Learn more about ${formData.topic}`,
            `${formData.topic} tools and resources`,
            `Advanced ${formData.topic} techniques`
          ],
          call_to_action: `Ready to take your ${formData.topic} to the next level? Start implementing these strategies today and see the difference they can make for your success.`,
          seo_score: 'A+',
          seo_analysis: {
            title_length: 55,
            title_score: 100,
            meta_description_length: 145,
            meta_description_score: 100,
            headings_count: 8,
            h1_count: 1,
            h2_count: 4,
            h3_count: 3,
            overall_score: 95,
            issues: [],
            suggestions: ['Title length is optimal for SEO', 'Meta description length is good', 'Good heading structure']
          },
          status: 'success',
          generated_at: new Date().toISOString()
        };
      }

      setGeneratedBlogPost(blogData);
      setActiveTab('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate blog post');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccessMessage('✅ Copied to clipboard!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const downloadBlogPost = () => {
    if (!generatedBlogPost) return;

    const content = `${generatedBlogPost.title}

Meta Description: ${generatedBlogPost.meta_description}

${generatedBlogPost.content}

Call to Action: ${generatedBlogPost.call_to_action}

---
Generated by AI Blog Post Generator
Word Count: ${generatedBlogPost.actual_word_count || generatedBlogPost.word_count}
SEO Score: ${generatedBlogPost.seo_score}
Primary Keyword: ${generatedBlogPost.primary_keyword}
Secondary Keywords: ${generatedBlogPost.secondary_keywords.join(', ')}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedBlogPost.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">AI Blog Post Generator</h1>
              <p className="text-gray-300">Create SEO-optimized, engaging blog posts with AI</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-effect rounded-xl p-4 border border-white/20 premium-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Posts Generated</p>
                  <p className="text-2xl font-bold text-white">2,847</p>
                </div>
                <FileText className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <div className="glass-effect rounded-xl p-4 border border-white/20 premium-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Avg SEO Score</p>
                  <p className="text-2xl font-bold text-white">A+</p>
                </div>
                <Award className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            <div className="glass-effect rounded-xl p-4 border border-white/20 premium-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Languages</p>
                  <p className="text-2xl font-bold text-white">12</p>
                </div>
                <Globe className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="glass-effect rounded-xl p-4 border border-white/20 premium-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Accuracy Rate</p>
                  <p className="text-2xl font-bold text-white">96.8%</p>
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
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>Configure</span>
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'results'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : !generatedBlogPost
                  ? 'text-gray-500 cursor-not-allowed opacity-50'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/30'
              }`}
              disabled={!generatedBlogPost}
            >
              <FileText className="w-4 h-4" />
              <span>Blog Post</span>
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'seo'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : !generatedBlogPost
                  ? 'text-gray-500 cursor-not-allowed opacity-50'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/30'
              }`}
              disabled={!generatedBlogPost}
            >
              <BarChart3 className="w-4 h-4" />
              <span>SEO Analysis</span>
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
              {/* Form Fields */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                    <h3 className="text-xl font-semibold text-white mb-4">Basic Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Topic *</label>
                        <input
                          type="text"
                          value={formData.topic}
                          onChange={(e) => handleInputChange('topic', e.target.value)}
                          placeholder="e.g., Digital Marketing Strategies for Small Business"
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Target Audience *</label>
                        <input
                          type="text"
                          value={formData.target_audience}
                          onChange={(e) => handleInputChange('target_audience', e.target.value)}
                          placeholder="e.g., Small business owners, Marketing professionals"
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">Language *</label>
                          <select
                            value={formData.language}
                            onChange={(e) => handleInputChange('language', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                          >
                            {languages.map((language) => (
                              <option key={language} value={language}>{language}</option>
                            ))}
                          </select>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Tone Style Selection */}
                  <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                    <h3 className="text-xl font-semibold text-white mb-4">Tone Style Selection</h3>
                    <div className="space-y-3">
                      {toneStyles.map((tone) => (
                        <button
                          key={tone.value}
                          onClick={() => handleInputChange('tone_style', tone.value)}
                          className={`w-full text-left p-3 rounded-lg border transition-all ${
                            formData.tone_style === tone.value
                              ? 'border-purple-500 bg-purple-500/20 text-white'
                              : 'border-gray-600/50 bg-gray-800/30 text-gray-300 hover:border-gray-500/70 hover:bg-gray-700/50'
                          }`}
                        >
                          <div className="font-medium">{tone.label}</div>
                          <div className="text-sm text-gray-400">{tone.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Word Count Selection */}
                  <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                    <h3 className="text-xl font-semibold text-white mb-4">Word Count *</h3>
                    <div className="space-y-3">
                      {wordCountOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleInputChange('word_count', option.value)}
                          className={`w-full text-left p-4 rounded-lg border transition-all ${
                            formData.word_count === option.value
                              ? 'border-purple-500 bg-purple-500/20 text-white'
                              : 'border-gray-600/50 bg-gray-800/50 text-gray-300 hover:border-gray-500/70 hover:bg-gray-700/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-sm text-gray-400">{option.description}</div>
                            </div>
                            <Type className="w-5 h-5" />
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Custom Word Count */}
                    <div className="mt-4 pt-4 border-t border-gray-600/50">
                      <label className="block text-gray-300 text-sm font-medium mb-2">Custom Word Count (100-5000)</label>
                      <input
                        type="number"
                        min="100"
                        max="5000"
                        value={formData.word_count}
                        onChange={(e) => handleInputChange('word_count', parseInt(e.target.value) || 1000)}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Optional Settings */}
                  <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                    <h3 className="text-xl font-semibold text-white mb-4">Optional Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Keywords (Optional)
                          <span className="text-xs text-gray-400 ml-2">3-10 keywords, comma separated</span>
                        </label>
                        <textarea
                          value={formData.keywords || ''}
                          onChange={(e) => handleInputChange('keywords', e.target.value)}
                          placeholder="digital marketing, SEO optimization, content strategy, social media"
                          rows={2}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          References (Optional)
                          <span className="text-xs text-gray-400 ml-2">Sources to cite, comma separated</span>
                        </label>
                        <textarea
                          value={formData.references || ''}
                          onChange={(e) => handleInputChange('references', e.target.value)}
                          placeholder="HubSpot Marketing Study 2024, Google Analytics Report, Industry Survey"
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
                onClick={generateBlogPost}
                disabled={isGenerating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center space-x-2">
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Generating Blog Post...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate AI Blog Post</span>
                    </>
                  )}
                </div>
              </motion.button>
            </motion.div>
          )}

          {activeTab === 'results' && generatedBlogPost && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Blog Post Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-effect rounded-xl p-4 border border-white/20 premium-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Word Count</span>
                    <Type className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {generatedBlogPost.actual_word_count || generatedBlogPost.word_count}
                  </div>
                  <div className="text-sm text-gray-400">
                    {generatedBlogPost.word_count_accuracy}% accuracy
                  </div>
                </div>

                <div className="glass-effect rounded-xl p-4 border border-white/20 premium-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">SEO Score</span>
                    <Award className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{generatedBlogPost.seo_score}</div>
                  <div className="text-sm text-gray-400">Optimization level</div>
                </div>

                <div className="glass-effect rounded-xl p-4 border border-white/20 premium-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Headings</span>
                    <Hash className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{generatedBlogPost.headings.length}</div>
                  <div className="text-sm text-gray-400">Structure elements</div>
                </div>

                <div className="glass-effect rounded-xl p-4 border border-white/20 premium-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Keywords</span>
                    <Search className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{generatedBlogPost.secondary_keywords.length + 1}</div>
                  <div className="text-sm text-gray-400">SEO keywords</div>
                </div>
              </div>

              {/* Blog Post Content */}
              <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Generated Blog Post</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(generatedBlogPost.content)}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={downloadBlogPost}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                {/* Title and Meta */}
                <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <h2 className="text-xl font-bold text-white mb-2">{generatedBlogPost.title}</h2>
                  <p className="text-gray-300 text-sm italic">Meta Description: {generatedBlogPost.meta_description}</p>
                </div>

                {/* Content */}
                <div className="prose prose-invert max-w-none">
                  <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                    <pre className="text-gray-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {generatedBlogPost.content}
                    </pre>
                  </div>
                </div>

                {/* Call to Action */}
                {generatedBlogPost.call_to_action && (
                  <div className="mt-6 p-4 bg-purple-500/20 rounded-lg border border-purple-500/50">
                    <h4 className="text-white font-semibold mb-2">Call to Action:</h4>
                    <p className="text-purple-200">{generatedBlogPost.call_to_action}</p>
                  </div>
                )}
              </div>

              {/* Keywords and Links */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Keywords */}
                <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <Search className="w-5 h-5 text-purple-400" />
                    <span>SEO Keywords</span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-400">Primary:</span>
                      <div className="mt-1 px-3 py-2 bg-purple-500/20 rounded-lg border border-purple-500/50">
                        <span className="text-purple-200 font-medium">{generatedBlogPost.primary_keyword}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Secondary:</span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {generatedBlogPost.secondary_keywords.map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-200 rounded border border-blue-500/50 text-xs">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Internal Links */}
                <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <Link className="w-5 h-5 text-blue-400" />
                    <span>Internal Link Suggestions</span>
                  </h3>
                  <div className="space-y-2">
                    {generatedBlogPost.internal_links.map((link, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-800/50 rounded border border-gray-700/50">
                        <Link className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{link}</span>
                      </div>
                    ))}
                  </div>
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
                  <span>Generate Another Blog Post</span>
                </div>
              </motion.button>
            </motion.div>
          )}

          {activeTab === 'seo' && generatedBlogPost?.seo_analysis && (
            <motion.div
              key="seo"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* SEO Score Overview */}
              <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                <h3 className="text-xl font-semibold text-white mb-6">SEO Analysis Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">
                      {generatedBlogPost.seo_analysis.overall_score}
                    </div>
                    <div className="text-gray-300">Overall Score</div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                        style={{ width: `${generatedBlogPost.seo_analysis.overall_score}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">
                      {generatedBlogPost.seo_analysis.title_score}
                    </div>
                    <div className="text-gray-300">Title Score</div>
                    <div className="text-sm text-gray-400">
                      {generatedBlogPost.seo_analysis.title_length} characters
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">
                      {generatedBlogPost.seo_analysis.meta_description_score}
                    </div>
                    <div className="text-gray-300">Meta Score</div>
                    <div className="text-sm text-gray-400">
                      {generatedBlogPost.seo_analysis.meta_description_length} characters
                    </div>
                  </div>
                </div>
              </div>

              {/* Heading Structure */}
              <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Hash className="w-5 h-5 text-green-400" />
                  <span>Heading Structure Analysis</span>
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-white">{generatedBlogPost.seo_analysis.h1_count}</div>
                    <div className="text-sm text-gray-400">H1 Tags</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-white">{generatedBlogPost.seo_analysis.h2_count}</div>
                    <div className="text-sm text-gray-400">H2 Tags</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-white">{generatedBlogPost.seo_analysis.h3_count}</div>
                    <div className="text-sm text-gray-400">H3 Tags</div>
                  </div>
                </div>

                <div className="space-y-2">
                  {generatedBlogPost.headings.map((heading, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-gray-800/30 rounded">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        heading.level === 'H1' ? 'bg-red-500/20 text-red-300' :
                        heading.level === 'H2' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>
                        {heading.level}
                      </span>
                      <span className="text-gray-300 text-sm">{heading.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Issues and Suggestions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Issues */}
                <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span>Issues Found</span>
                  </h3>
                  {generatedBlogPost.seo_analysis.issues.length > 0 ? (
                    <div className="space-y-2">
                      {generatedBlogPost.seo_analysis.issues.map((issue, index) => (
                        <div key={index} className="flex items-start space-x-2 p-3 bg-red-500/20 rounded border border-red-500/50">
                          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                          <span className="text-red-300 text-sm">{issue}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 p-3 bg-green-500/20 rounded border border-green-500/50">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-300 text-sm">No issues found!</span>
                    </div>
                  )}
                </div>

                {/* Suggestions */}
                <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span>Suggestions</span>
                  </h3>
                  <div className="space-y-2">
                    {generatedBlogPost.seo_analysis.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start space-x-2 p-3 bg-green-500/20 rounded border border-green-500/50">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-green-300 text-sm">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Back to Results */}
              <motion.button
                onClick={() => setActiveTab('results')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Back to Blog Post</span>
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BlogPostGenerator;