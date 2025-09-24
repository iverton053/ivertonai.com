import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Sparkles, Download, Eye, Copy, Check,
  Target, Mail, Share2, Zap, Clock, Star, Briefcase,
  TrendingUp, Users, MessageSquare, Calendar, Send,
  Plus, X, AlertCircle, CheckCircle, Loader2,
  Globe, Search, BarChart3, DollarSign
} from 'lucide-react';

interface LandingPageFormData {
  productName: string;
  productDescription: string;
  landingPageObjective: string;
  callToAction: string;
  audienceType: string;
  pricing: string;
  toneStyle: string;
  seoKeywords: string[];
  abTestingRequired: boolean;
  pageLength: string;
}

interface GeneratedContent {
  success: boolean;
  generatedContent: {
    mainVariant?: {
      headlines: {
        primary: string;
        subheadline: string;
        alternatives?: string[];
      };
      valueProposition: string;
      keyBenefits: string[];
      features: Array<{
        title: string;
        description: string;
      }>;
      socialProof: {
        testimonials: string[];
        stats: string[];
      };
      objectionHandling: Array<{
        objection: string;
        response: string;
      }>;
      callToActions: {
        primary: string;
        alternatives?: string[];
        supportingText: string;
      };
      urgencyElements: string[];
      faq: Array<{
        question: string;
        answer: string;
      }>;
      seo: {
        metaDescription: string;
        pageTitle: string;
      };
    };
    abTestingVariants?: {
      variantA: any;
      variantB: any;
    };
  };
  metadata: {
    productName: string;
    objective: string;
    audienceType: string;
    toneStyle: string;
    pageLength: string;
    abTestingEnabled: boolean;
    seoKeywords: string[];
    pricing: string | null;
  };
}

const LandingPageGenerator: React.FC = () => {
  const [formData, setFormData] = useState<LandingPageFormData>({
    productName: '',
    productDescription: '',
    landingPageObjective: 'lead generation',
    callToAction: '',
    audienceType: 'small business owners',
    pricing: '',
    toneStyle: 'professional and engaging',
    seoKeywords: [],
    abTestingRequired: false,
    pageLength: 'medium'
  });

  const [currentKeyword, setCurrentKeyword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'results'>('form');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Predefined options
  const objectives = [
    'lead generation',
    'sign-ups',
    'downloads',
    'purchases',
    'consultations',
    'subscriptions',
    'bookings',
    'trials'
  ];

  const audienceTypes = [
    'small business owners',
    'tech enthusiasts',
    'health-conscious users',
    'students',
    'entrepreneurs',
    'professionals',
    'parents',
    'seniors',
    'millennials',
    'gen-z'
  ];

  const toneStyles = [
    'professional and engaging',
    'friendly and conversational',
    'authoritative and expert',
    'warm and trustworthy',
    'energetic and exciting',
    'calm and reassuring',
    'luxurious and premium',
    'casual and approachable'
  ];

  const pageLengths = [
    { value: 'short-form', label: 'Short-form', description: 'Concise, essential elements only' },
    { value: 'medium', label: 'Medium', description: 'Balanced content with key sections' },
    { value: 'long-form', label: 'Long-form', description: 'Comprehensive with detailed sections' }
  ];

  const handleInputChange = (field: keyof LandingPageFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addKeyword = () => {
    if (currentKeyword.trim() && !formData.seoKeywords.includes(currentKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        seoKeywords: [...prev.seoKeywords, currentKeyword.trim()]
      }));
      setCurrentKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      seoKeywords: prev.seoKeywords.filter(k => k !== keyword)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      // Simulate API call to n8n webhook
      const response = await fetch('/api/n8n/landing-page-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          abTestingRequired: formData.abTestingRequired ? 'yes' : 'no'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate landing page content');
      }

      const result = await response.json();
      setGeneratedContent(result);
      setActiveTab('results');
    } catch (error) {
      console.error('Error generating landing page:', error);
      // For demo purposes, show mock data
      setGeneratedContent({
        success: true,
        generatedContent: {
          mainVariant: {
            headlines: {
              primary: `Transform Your ${formData.audienceType} Experience with ${formData.productName}`,
              subheadline: "The ultimate solution that delivers results you can see and feel immediately"
            },
            valueProposition: `${formData.productName} revolutionizes the way ${formData.audienceType} approach their daily challenges, providing an unmatched combination of efficiency, reliability, and innovation.`,
            keyBenefits: [
              "Save 3+ hours per week with automated processes",
              "Increase productivity by 40% with intelligent features",
              "Join 10,000+ satisfied customers worldwide"
            ],
            features: [
              {
                title: "Smart Integration",
                description: "Seamlessly connects with your existing workflow"
              },
              {
                title: "Real-time Analytics",
                description: "Track your progress with detailed insights"
              }
            ],
            socialProof: {
              testimonials: [
                "This product changed everything for our business!",
                "I can't imagine working without it anymore."
              ],
              stats: [
                "99% customer satisfaction rate",
                "Used by Fortune 500 companies"
              ]
            },
            objectionHandling: [
              {
                objection: "Is it worth the investment?",
                response: "Our customers typically see ROI within 30 days"
              }
            ],
            callToActions: {
              primary: formData.callToAction || "Get Started Today",
              supportingText: "Join thousands of satisfied customers"
            },
            urgencyElements: [
              "Limited time offer - 30% off",
              "Only 50 spots remaining this month"
            ],
            faq: [
              {
                question: "How quickly can I get started?",
                answer: "You can be up and running in just 5 minutes"
              }
            ],
            seo: {
              metaDescription: `${formData.productName} - The best solution for ${formData.audienceType}. Start your free trial today!`,
              pageTitle: `${formData.productName} | Perfect for ${formData.audienceType}`
            }
          }
        },
        metadata: {
          productName: formData.productName,
          objective: formData.landingPageObjective,
          audienceType: formData.audienceType,
          toneStyle: formData.toneStyle,
          pageLength: formData.pageLength,
          abTestingEnabled: formData.abTestingRequired,
          seoKeywords: formData.seoKeywords,
          pricing: formData.pricing || null
        }
      });
      setActiveTab('results');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const isFormValid = formData.productName.trim() &&
                     formData.productDescription.trim() &&
                     formData.callToAction.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-purple-600/20 rounded-xl mr-4">
              <FileText className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-4xl font-bold text-white">Landing Page Generator</h1>
            <div className="p-3 bg-purple-600/20 rounded-xl ml-4">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Create high-converting landing page copy powered by AI. Generate compelling content
            tailored to your audience and conversion goals.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 rounded-xl p-1 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-6 py-3 rounded-lg transition-all ${
                activeTab === 'form'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <Target className="w-4 h-4 inline-block mr-2" />
              Configure
            </button>
            <button
              onClick={() => setActiveTab('results')}
              disabled={!generatedContent}
              className={`px-6 py-3 rounded-lg transition-all ${
                activeTab === 'results' && generatedContent
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <Eye className="w-4 h-4 inline-block mr-2" />
              Results
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="glass-effect rounded-2xl p-8 backdrop-blur-lg"
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-white font-medium mb-3">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={formData.productName}
                      onChange={(e) => handleInputChange('productName', e.target.value)}
                      placeholder="e.g., EcoClean Pro Kitchen System"
                      className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                      maxLength={100}
                      required
                    />
                    <p className="text-gray-400 text-sm mt-1">{formData.productName.length}/100 characters</p>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-3">
                      Call-to-Action Text *
                    </label>
                    <input
                      type="text"
                      value={formData.callToAction}
                      onChange={(e) => handleInputChange('callToAction', e.target.value)}
                      placeholder="e.g., Order Your EcoClean Pro Today"
                      className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                      maxLength={50}
                      required
                    />
                    <p className="text-gray-400 text-sm mt-1">{formData.callToAction.length}/50 characters</p>
                  </div>
                </div>

                {/* Product Description */}
                <div>
                  <label className="block text-white font-medium mb-3">
                    Product Description *
                  </label>
                  <textarea
                    value={formData.productDescription}
                    onChange={(e) => handleInputChange('productDescription', e.target.value)}
                    placeholder="Describe your product, its key features, and what makes it unique..."
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                    rows={4}
                    maxLength={500}
                    required
                  />
                  <p className="text-gray-400 text-sm mt-1">{formData.productDescription.length}/500 characters</p>
                </div>

                {/* Targeting & Strategy */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-3">
                      Landing Page Objective
                    </label>
                    <select
                      value={formData.landingPageObjective}
                      onChange={(e) => handleInputChange('landingPageObjective', e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors"
                    >
                      {objectives.map(obj => (
                        <option key={obj} value={obj} className="bg-gray-800">
                          {obj.charAt(0).toUpperCase() + obj.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-3">
                      Target Audience
                    </label>
                    <select
                      value={formData.audienceType}
                      onChange={(e) => handleInputChange('audienceType', e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors"
                    >
                      {audienceTypes.map(audience => (
                        <option key={audience} value={audience} className="bg-gray-800">
                          {audience.charAt(0).toUpperCase() + audience.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-3">
                      Pricing
                    </label>
                    <input
                      type="text"
                      value={formData.pricing}
                      onChange={(e) => handleInputChange('pricing', e.target.value)}
                      placeholder="e.g., $149.99, Free, Contact"
                      className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Content Settings */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-3">
                      Tone & Style
                    </label>
                    <select
                      value={formData.toneStyle}
                      onChange={(e) => handleInputChange('toneStyle', e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors"
                    >
                      {toneStyles.map(tone => (
                        <option key={tone} value={tone} className="bg-gray-800">
                          {tone.charAt(0).toUpperCase() + tone.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-3">
                      Page Length
                    </label>
                    <div className="space-y-2">
                      {pageLengths.map(length => (
                        <label key={length.value} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="pageLength"
                            value={length.value}
                            checked={formData.pageLength === length.value}
                            onChange={(e) => handleInputChange('pageLength', e.target.value)}
                            className="text-purple-500 focus:ring-purple-500"
                          />
                          <span className="ml-3 text-white">{length.label}</span>
                          <span className="ml-2 text-gray-400 text-sm">- {length.description}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SEO Keywords */}
                <div>
                  <label className="block text-white font-medium mb-3">
                    SEO Keywords
                  </label>
                  <div className="flex gap-3 mb-3">
                    <input
                      type="text"
                      value={currentKeyword}
                      onChange={(e) => setCurrentKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                      placeholder="Enter a keyword..."
                      className="flex-1 bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                      maxLength={50}
                    />
                    <button
                      type="button"
                      onClick={addKeyword}
                      className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.seoKeywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 bg-purple-600/20 text-purple-300 px-3 py-1 rounded-lg text-sm"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="text-purple-400 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-400 text-sm mt-2">Max 20 keywords, 50 characters each</p>
                </div>

                {/* Advanced Options */}
                <div className="border-t border-gray-600/50 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">A/B Testing Variants</label>
                      <p className="text-gray-400 text-sm">Generate multiple versions for split testing</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.abTestingRequired}
                        onChange={(e) => handleInputChange('abTestingRequired', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={!isFormValid || isGenerating}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  whileHover={{ scale: isFormValid && !isGenerating ? 1.02 : 1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                      Generating Landing Page Copy...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 inline-block mr-2" />
                      Generate Landing Page Copy
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}

          {activeTab === 'results' && generatedContent && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="space-y-6"
            >
              {/* Results Header */}
              <div className="glass-effect rounded-2xl p-6 backdrop-blur-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Generated Landing Page Copy</h2>
                    <p className="text-gray-300">
                      Product: <span className="text-purple-400 font-medium">{generatedContent.metadata.productName}</span> •
                      Objective: <span className="text-blue-400 font-medium">{generatedContent.metadata.objective}</span> •
                      Audience: <span className="text-green-400 font-medium">{generatedContent.metadata.audienceType}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-semibold mb-1">
                      <CheckCircle className="w-5 h-5 inline-block mr-1" />
                      Generated Successfully
                    </div>
                    <p className="text-gray-400 text-sm">Ready to use</p>
                  </div>
                </div>
              </div>

              {generatedContent.generatedContent.mainVariant && (
                <div className="glass-effect rounded-2xl p-8 backdrop-blur-lg">
                  <div className="space-y-8">
                    {/* Headlines */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-white flex items-center">
                          <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
                          Headlines
                        </h3>
                        <button
                          onClick={() => copyToClipboard(
                            `Primary: ${generatedContent.generatedContent.mainVariant!.headlines.primary}\nSubheadline: ${generatedContent.generatedContent.mainVariant!.headlines.subheadline}`,
                            'headlines'
                          )}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {copiedSection === 'headlines' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-gray-800/30 rounded-lg p-4">
                          <p className="text-sm text-gray-400 mb-1">Primary Headline:</p>
                          <p className="text-white font-medium">{generatedContent.generatedContent.mainVariant.headlines.primary}</p>
                        </div>
                        <div className="bg-gray-800/30 rounded-lg p-4">
                          <p className="text-sm text-gray-400 mb-1">Subheadline:</p>
                          <p className="text-gray-300">{generatedContent.generatedContent.mainVariant.headlines.subheadline}</p>
                        </div>
                      </div>
                    </div>

                    {/* Value Proposition */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-white flex items-center">
                          <Target className="w-5 h-5 mr-2 text-blue-400" />
                          Value Proposition
                        </h3>
                        <button
                          onClick={() => copyToClipboard(generatedContent.generatedContent.mainVariant!.valueProposition, 'valueProposition')}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {copiedSection === 'valueProposition' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="bg-gray-800/30 rounded-lg p-4">
                        <p className="text-gray-300 leading-relaxed">{generatedContent.generatedContent.mainVariant.valueProposition}</p>
                      </div>
                    </div>

                    {/* Key Benefits */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-white flex items-center">
                          <Star className="w-5 h-5 mr-2 text-yellow-400" />
                          Key Benefits
                        </h3>
                        <button
                          onClick={() => copyToClipboard(generatedContent.generatedContent.mainVariant!.keyBenefits.join('\n'), 'keyBenefits')}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {copiedSection === 'keyBenefits' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="space-y-2">
                        {generatedContent.generatedContent.mainVariant.keyBenefits.map((benefit, index) => (
                          <div key={index} className="bg-gray-800/30 rounded-lg p-3 flex items-start">
                            <CheckCircle className="w-4 h-4 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Call-to-Actions */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-white flex items-center">
                          <Zap className="w-5 h-5 mr-2 text-orange-400" />
                          Call-to-Actions
                        </h3>
                        <button
                          onClick={() => copyToClipboard(
                            `Primary CTA: ${generatedContent.generatedContent.mainVariant!.callToActions.primary}\nSupporting Text: ${generatedContent.generatedContent.mainVariant!.callToActions.supportingText}`,
                            'cta'
                          )}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {copiedSection === 'cta' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg p-4 border border-purple-500/30">
                          <p className="text-sm text-gray-400 mb-2">Primary CTA:</p>
                          <p className="text-white font-semibold text-lg">{generatedContent.generatedContent.mainVariant.callToActions.primary}</p>
                          {generatedContent.generatedContent.mainVariant.callToActions.supportingText && (
                            <>
                              <p className="text-sm text-gray-400 mt-3 mb-1">Supporting Text:</p>
                              <p className="text-gray-300">{generatedContent.generatedContent.mainVariant.callToActions.supportingText}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* SEO Elements */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-white flex items-center">
                          <Search className="w-5 h-5 mr-2 text-green-400" />
                          SEO Elements
                        </h3>
                        <button
                          onClick={() => copyToClipboard(
                            `Page Title: ${generatedContent.generatedContent.mainVariant!.seo.pageTitle}\nMeta Description: ${generatedContent.generatedContent.mainVariant!.seo.metaDescription}`,
                            'seo'
                          )}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {copiedSection === 'seo' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-gray-800/30 rounded-lg p-4">
                          <p className="text-sm text-gray-400 mb-1">Page Title:</p>
                          <p className="text-white font-medium">{generatedContent.generatedContent.mainVariant.seo.pageTitle}</p>
                        </div>
                        <div className="bg-gray-800/30 rounded-lg p-4">
                          <p className="text-sm text-gray-400 mb-1">Meta Description:</p>
                          <p className="text-gray-300">{generatedContent.generatedContent.mainVariant.seo.metaDescription}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Export Options */}
              <div className="glass-effect rounded-2xl p-6 backdrop-blur-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Export Options</h3>
                <div className="flex flex-wrap gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                    Download as HTML
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                    <FileText className="w-4 h-4" />
                    Export as Markdown
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                    <Copy className="w-4 h-4" />
                    Copy All Content
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LandingPageGenerator;