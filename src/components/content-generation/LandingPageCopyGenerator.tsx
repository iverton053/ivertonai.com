import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout,
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
  MousePointer,
  TrendingUp,
  Edit3,
  Eye,
  BarChart3,
  DollarSign,
  MessageSquare,
  Award,
  Lightbulb,
  TestTube,
  ArrowRight,
  Shield,
  Megaphone
} from 'lucide-react';
import { WebhookService } from '../../utils/webhookConfig';

interface LandingPageFormData {
  productName: string;
  productDescription: string;
  landingPageObjective: string;
  callToAction: string;
  audienceType: string;
  pricing?: string;
  toneStyle?: string;
  seoKeywords?: string;
  abTestingRequired?: string;
  pageLength?: string;
}

interface SocialProof {
  testimonialPlaceholders: string[];
  statsOrClaims: string[];
}

interface Feature {
  title: string;
  description: string;
}

interface ObjectionHandling {
  objection: string;
  response: string;
}

interface CallToActions {
  primary: string;
  alternatives?: string[];
  supportingText: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface Headlines {
  primary: string;
  subheadline: string;
  alternatives?: string[];
}

interface LandingPageContent {
  headlines: Headlines;
  valueProposition: string;
  keyBenefits: string[];
  features: Feature[];
  socialProof: SocialProof;
  objectionHandling: ObjectionHandling[];
  callToActions: CallToActions;
  urgencyElements: string[];
  faq: FAQ[];
  seo: {
    metaDescription: string;
    pageTitle: string;
  };
  testingFocus?: string;
}

interface GeneratedLandingPage {
  success: boolean;
  timestamp: string;
  generatedContent: {
    mainVariant?: LandingPageContent;
    abTestingVariants?: {
      variantA?: LandingPageContent;
      variantB?: LandingPageContent;
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
    pricing?: string;
  };
  usage?: {
    instructions: string;
    recommendedImplementation: string;
    conversionOptimization: string[];
  };
}

const LandingPageCopyGenerator: React.FC = () => {
  const [formData, setFormData] = useState<LandingPageFormData>({
    productName: '',
    productDescription: '',
    landingPageObjective: 'lead generation',
    callToAction: '',
    audienceType: 'small business owners',
    pricing: '',
    toneStyle: 'professional and engaging',
    seoKeywords: '',
    abTestingRequired: 'no',
    pageLength: 'medium'
  });

  const [generatedLandingPage, setGeneratedLandingPage] = useState<GeneratedLandingPage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'form' | 'results' | 'ab-test'>('form');
  const [selectedVariant, setSelectedVariant] = useState<'main' | 'variantA' | 'variantB'>('main');

  const objectives = [
    { value: 'lead generation', label: 'Lead Generation', description: 'Capture visitor contact information' },
    { value: 'sign-ups', label: 'Sign-ups', description: 'Register users for service/newsletter' },
    { value: 'downloads', label: 'Downloads', description: 'Drive file/app downloads' },
    { value: 'purchases', label: 'Purchases', description: 'Direct product sales' },
    { value: 'consultations', label: 'Consultations', description: 'Book meetings/calls' },
    { value: 'subscriptions', label: 'Subscriptions', description: 'Recurring service sign-ups' },
    { value: 'bookings', label: 'Bookings', description: 'Appointment/event bookings' },
    { value: 'trials', label: 'Trials', description: 'Free trial activations' }
  ];

  const audienceTypes = [
    { value: 'small business owners', label: 'Small Business Owners', icon: '🏢' },
    { value: 'tech enthusiasts', label: 'Tech Enthusiasts', icon: '💻' },
    { value: 'health-conscious users', label: 'Health-Conscious Users', icon: '💪' },
    { value: 'students', label: 'Students', icon: '🎓' },
    { value: 'entrepreneurs', label: 'Entrepreneurs', icon: '🚀' },
    { value: 'professionals', label: 'Professionals', icon: '💼' },
    { value: 'parents', label: 'Parents', icon: '👨‍👩‍👧‍👦' },
    { value: 'seniors', label: 'Seniors', icon: '👴' },
    { value: 'millennials', label: 'Millennials', icon: '🌟' },
    { value: 'gen-z', label: 'Gen-Z', icon: '📱' }
  ];

  const toneStyles = [
    { value: 'professional and engaging', label: 'Professional & Engaging' },
    { value: 'friendly and conversational', label: 'Friendly & Conversational' },
    { value: 'authoritative and expert', label: 'Authoritative & Expert' },
    { value: 'urgent and compelling', label: 'Urgent & Compelling' },
    { value: 'warm and trustworthy', label: 'Warm & Trustworthy' },
    { value: 'innovative and cutting-edge', label: 'Innovative & Cutting-edge' },
    { value: 'empathetic and understanding', label: 'Empathetic & Understanding' },
    { value: 'bold and confident', label: 'Bold & Confident' }
  ];

  const pageLengths = [
    { value: 'short-form', label: 'Short-form', description: 'Concise, focused on key elements' },
    { value: 'medium', label: 'Medium', description: 'Balanced content with social proof' },
    { value: 'long-form', label: 'Long-form', description: 'Comprehensive with detailed features' }
  ];

  const handleInputChange = (field: keyof LandingPageFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccessMessage('');
  };

  const validateForm = (): boolean => {
    const requiredFields = ['productName', 'productDescription', 'landingPageObjective', 'callToAction', 'audienceType'];

    for (const field of requiredFields) {
      if (!formData[field as keyof LandingPageFormData]?.trim()) {
        setError(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`);
        return false;
      }
    }

    if (formData.productName.length < 2 || formData.productName.length > 100) {
      setError('Product name must be between 2-100 characters');
      return false;
    }

    if (formData.productDescription.length < 10 || formData.productDescription.length > 500) {
      setError('Product description must be between 10-500 characters');
      return false;
    }

    if (formData.callToAction.length < 2 || formData.callToAction.length > 50) {
      setError('Call to action must be between 2-50 characters');
      return false;
    }

    if (formData.seoKeywords) {
      const keywords = formData.seoKeywords.split(',').map(k => k.trim()).filter(k => k);
      if (keywords.length > 20) {
        setError('Maximum 20 SEO keywords allowed');
        return false;
      }
      if (keywords.some(k => k.length > 50)) {
        setError('Each SEO keyword must be under 50 characters');
        return false;
      }
    }

    return true;
  };

  const generateLandingPage = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    setError('');

    try {
      // Call n8n webhook using the webhook service
      const result = await WebhookService.generateLandingPageCopy(formData);

      // If webhook returns data, use it; otherwise use mock response for development
      let landingPageData: GeneratedLandingPage;

      if (result && result.success) {
        // Use real webhook response
        landingPageData = result;
      } else {
        // Use mock response for development
        const mockContent: LandingPageContent = {
          headlines: {
            primary: `Transform Your Business with ${formData.productName}`,
            subheadline: `The Ultimate Solution for ${formData.audienceType} Looking to ${formData.landingPageObjective}`,
            alternatives: formData.abTestingRequired === 'yes' ? [
              `Revolutionize Your Workflow with ${formData.productName}`,
              `${formData.productName}: Your Gateway to Success`
            ] : undefined
          },
          valueProposition: `${formData.productName} is specifically designed for ${formData.audienceType} who want to achieve ${formData.landingPageObjective} without the usual hassles. Our innovative solution combines cutting-edge technology with user-friendly design to deliver exceptional results that exceed expectations.`,
          keyBenefits: [
            `Save 10+ hours per week with automated ${formData.landingPageObjective} processes`,
            `Increase your success rate by 300% with proven strategies`,
            `Get instant results with our plug-and-play solution`,
            `Join 50,000+ satisfied customers who trust our platform`
          ],
          features: [
            {
              title: 'Smart Automation',
              description: 'Intelligent workflows that adapt to your specific needs and preferences'
            },
            {
              title: 'Real-time Analytics',
              description: 'Monitor your progress with detailed insights and performance metrics'
            },
            {
              title: 'Expert Support',
              description: '24/7 customer support from industry experts who understand your challenges'
            },
            {
              title: 'Seamless Integration',
              description: 'Works perfectly with your existing tools and systems'
            }
          ],
          socialProof: {
            testimonialPlaceholders: [
              `"${formData.productName} completely transformed how we approach ${formData.landingPageObjective}. Within just 30 days, we saw a 200% improvement in our results."`,
              `"As a ${formData.audienceType.slice(0, -1)}, I was skeptical at first. But ${formData.productName} delivered exactly what was promised and more."`
            ],
            statsOrClaims: [
              '98% customer satisfaction rate',
              'Trusted by 50,000+ businesses worldwide',
              'Average ROI of 400% within 6 months'
            ]
          },
          objectionHandling: [
            {
              objection: "I'm not sure if this will work for my specific situation",
              response: "Our solution is designed to be flexible and customizable. We offer a 30-day money-back guarantee so you can try it risk-free."
            },
            {
              objection: "The pricing seems too good to be true",
              response: "We keep our costs low by focusing on automation and efficiency. Our customers save far more than they invest."
            }
          ],
          callToActions: {
            primary: formData.callToAction,
            alternatives: formData.abTestingRequired === 'yes' ? [
              `Start Your Free Trial Now`,
              `Get Instant Access Today`
            ] : undefined,
            supportingText: `Join thousands of ${formData.audienceType} who have already transformed their business with ${formData.productName}`
          },
          urgencyElements: [
            'Limited-time offer: 50% off for the first 100 customers',
            'Bonus: Free consultation worth $297 (expires in 24 hours)'
          ],
          faq: [
            {
              question: `How quickly can I see results with ${formData.productName}?`,
              answer: 'Most customers see significant improvements within the first 7-14 days of implementation.'
            },
            {
              question: 'What if I need help getting started?',
              answer: 'We provide comprehensive onboarding support and 24/7 customer service to ensure your success.'
            },
            {
              question: 'Is there a money-back guarantee?',
              answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not completely satisfied, we\'ll refund your investment.'
            }
          ],
          seo: {
            metaDescription: `Transform your business with ${formData.productName} - the ultimate solution for ${formData.audienceType}. Get instant results and join 50,000+ satisfied customers.`,
            pageTitle: `${formData.productName} - Revolutionary Solution for ${formData.audienceType} | Get Started Today`
          }
        };

        landingPageData = {
          success: true,
          timestamp: new Date().toISOString(),
          generatedContent: {
            mainVariant: mockContent,
            ...(formData.abTestingRequired === 'yes' && {
              abTestingVariants: {
                variantA: {
                  ...mockContent,
                  testingFocus: 'Emotional/Transformation',
                  headlines: {
                    primary: `Transform Your Life with ${formData.productName}`,
                    subheadline: 'Experience the Freedom You\'ve Always Dreamed Of',
                    alternatives: [`Unlock Your True Potential with ${formData.productName}`]
                  },
                  valueProposition: `Imagine waking up every day knowing that ${formData.productName} is working tirelessly to make your life easier and more successful. This isn't just another tool - it's your partner in achieving the transformation you've been seeking.`
                },
                variantB: {
                  ...mockContent,
                  testingFocus: 'Rational/Authority',
                  headlines: {
                    primary: `${formData.productName}: Industry-Leading Solution`,
                    subheadline: 'Proven Results Backed by Data and Expert Validation',
                    alternatives: [`The Science-Backed Approach to ${formData.landingPageObjective}`]
                  },
                  valueProposition: `${formData.productName} leverages advanced algorithms and industry best practices to deliver measurable results. Our solution is built on years of research and has been validated by leading experts in the field.`
                }
              }
            })
          },
          metadata: {
            productName: formData.productName,
            objective: formData.landingPageObjective,
            audienceType: formData.audienceType,
            toneStyle: formData.toneStyle || 'professional and engaging',
            pageLength: formData.pageLength || 'medium',
            abTestingEnabled: formData.abTestingRequired === 'yes',
            seoKeywords: formData.seoKeywords ? formData.seoKeywords.split(',').map(k => k.trim()) : [],
            pricing: formData.pricing
          },
          usage: {
            instructions: "Use 'mainVariant' for standard landing page. If A/B testing is enabled, use 'abTestingVariants.variantA' and 'abTestingVariants.variantB' for split testing.",
            recommendedImplementation: formData.abTestingRequired === 'yes' ?
              "Implement A/B split testing with 50/50 traffic distribution" :
              "Deploy single variant landing page",
            conversionOptimization: [
              "Test different headlines with your audience",
              "Monitor CTA button performance",
              "Track FAQ section engagement",
              "Analyze social proof impact on conversions"
            ]
          }
        };
      }

      setGeneratedLandingPage(landingPageData);
      setActiveTab('results');
      if (landingPageData.metadata.abTestingEnabled) {
        setSelectedVariant('variantA');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate landing page copy');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccessMessage('✅ Content copied to clipboard!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const getCurrentVariant = (): LandingPageContent | null => {
    if (!generatedLandingPage) return null;

    if (selectedVariant === 'main') {
      return generatedLandingPage.generatedContent.mainVariant || null;
    } else if (selectedVariant === 'variantA') {
      return generatedLandingPage.generatedContent.abTestingVariants?.variantA || null;
    } else if (selectedVariant === 'variantB') {
      return generatedLandingPage.generatedContent.abTestingVariants?.variantB || null;
    }

    return null;
  };

  const downloadLandingPage = () => {
    const variant = getCurrentVariant();
    if (!variant) return;

    try {
      const content = `AI Generated Landing Page Copy
Product: ${generatedLandingPage?.metadata.productName}
Objective: ${generatedLandingPage?.metadata.objective}
Audience: ${generatedLandingPage?.metadata.audienceType}
Generated: ${new Date().toLocaleDateString()}

==============================
HEADLINES
==============================

Primary Headline:
${variant.headlines.primary}

Subheadline:
${variant.headlines.subheadline}

${variant.headlines.alternatives ? `Alternative Headlines:\n${variant.headlines.alternatives.map(alt => `• ${alt}`).join('\n')}\n` : ''}
==============================
VALUE PROPOSITION
==============================

${variant.valueProposition}

==============================
KEY BENEFITS
==============================

${variant.keyBenefits.map(benefit => `• ${benefit}`).join('\n')}

==============================
FEATURES
==============================

${variant.features.map(feature => `${feature.title}:\n${feature.description}\n`).join('\n')}
==============================
CALL TO ACTIONS
==============================

Primary CTA: ${variant.callToActions.primary}
Supporting Text: ${variant.callToActions.supportingText}

${variant.callToActions.alternatives ? `Alternative CTAs:\n${variant.callToActions.alternatives.map(alt => `• ${alt}`).join('\n')}\n` : ''}
==============================
SOCIAL PROOF
==============================

Stats & Claims:
${variant.socialProof.statsOrClaims.map(stat => `• ${stat}`).join('\n')}

Testimonial Templates:
${variant.socialProof.testimonialPlaceholders.map((test, i) => `${i + 1}. ${test}`).join('\n\n')}

==============================
OBJECTION HANDLING
==============================

${variant.objectionHandling.map(obj => `Objection: ${obj.objection}\nResponse: ${obj.response}\n`).join('\n')}
==============================
URGENCY ELEMENTS
==============================

${variant.urgencyElements.map(element => `• ${element}`).join('\n')}

==============================
FREQUENTLY ASKED QUESTIONS
==============================

${variant.faq.map(item => `Q: ${item.question}\nA: ${item.answer}\n`).join('\n')}
==============================
SEO ELEMENTS
==============================

Page Title: ${variant.seo.pageTitle}
Meta Description: ${variant.seo.metaDescription}

==============================
METADATA
==============================

Product Name: ${generatedLandingPage?.metadata.productName}
Objective: ${generatedLandingPage?.metadata.objective}
Target Audience: ${generatedLandingPage?.metadata.audienceType}
Tone Style: ${generatedLandingPage?.metadata.toneStyle}
Page Length: ${generatedLandingPage?.metadata.pageLength}
A/B Testing: ${generatedLandingPage?.metadata.abTestingEnabled ? 'Enabled' : 'Disabled'}
SEO Keywords: ${generatedLandingPage?.metadata.seoKeywords.join(', ')}
Variant: ${selectedVariant === 'main' ? 'Main Version' : selectedVariant.toUpperCase()}
${variant.testingFocus ? `Testing Focus: ${variant.testingFocus}` : ''}

==============================
Generated with AI Landing Page Copy Generator
==============================`;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedLandingPage?.metadata.productName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_landing_page_${selectedVariant}_${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      setSuccessMessage('✅ Landing page downloaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to download landing page');
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
              <Layout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Landing Page Copy Generator</h1>
              <p className="text-gray-300">Create high-converting landing page copy with AI</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-effect rounded-xl p-4 border border-white/20 premium-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Pages Generated</p>
                  <p className="text-2xl font-bold text-white">5,432</p>
                </div>
                <Layout className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <div className="glass-effect rounded-xl p-4 border border-white/20 premium-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Avg Conversion</p>
                  <p className="text-2xl font-bold text-white">12.4%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="glass-effect rounded-xl p-4 border border-white/20 premium-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">A/B Tests Run</p>
                  <p className="text-2xl font-bold text-white">1,287</p>
                </div>
                <TestTube className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="glass-effect rounded-xl p-4 border border-white/20 premium-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Success Rate</p>
                  <p className="text-2xl font-bold text-white">94.8%</p>
                </div>
                <Award className="w-8 h-8 text-yellow-400" />
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
                  : !generatedLandingPage
                  ? 'text-gray-500 cursor-not-allowed opacity-50'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/30'
              }`}
              disabled={!generatedLandingPage}
            >
              <Layout className="w-4 h-4" />
              <span>Landing Page</span>
            </button>
            {generatedLandingPage?.metadata.abTestingEnabled && (
              <button
                onClick={() => setActiveTab('ab-test')}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'ab-test'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/30'
                }`}
              >
                <TestTube className="w-4 h-4" />
                <span>A/B Testing</span>
              </button>
            )}
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
                  {/* Product Information */}
                  <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                    <h3 className="text-xl font-semibold text-white mb-4">Product Information</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-gray-300 text-sm font-medium">Product Name *</label>
                          <span className="text-xs text-gray-500">{formData.productName.length}/100</span>
                        </div>
                        <input
                          type="text"
                          value={formData.productName}
                          onChange={(e) => handleInputChange('productName', e.target.value)}
                          placeholder="e.g., AI Marketing Assistant"
                          maxLength={100}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-gray-300 text-sm font-medium">Product Description *</label>
                          <span className="text-xs text-gray-500">{formData.productDescription.length}/500</span>
                        </div>
                        <textarea
                          value={formData.productDescription}
                          onChange={(e) => handleInputChange('productDescription', e.target.value)}
                          placeholder="Brief description of your product/service (10-500 characters)"
                          rows={3}
                          maxLength={500}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-gray-300 text-sm font-medium">Call to Action *</label>
                          <span className="text-xs text-gray-500">{formData.callToAction.length}/50</span>
                        </div>
                        <input
                          type="text"
                          value={formData.callToAction}
                          onChange={(e) => handleInputChange('callToAction', e.target.value)}
                          placeholder="e.g., Start Free Trial, Get Started Now"
                          maxLength={50}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Pricing (Optional)</label>
                        <input
                          type="text"
                          value={formData.pricing || ''}
                          onChange={(e) => handleInputChange('pricing', e.target.value)}
                          placeholder="e.g., $99/month, Free, Contact for pricing"
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SEO Settings */}
                  <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                    <h3 className="text-xl font-semibold text-white mb-4">SEO & Keywords</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          SEO Keywords (Optional)
                          <span className="text-xs text-gray-400 ml-2">Up to 20 keywords, comma separated</span>
                        </label>
                        <textarea
                          value={formData.seoKeywords || ''}
                          onChange={(e) => handleInputChange('seoKeywords', e.target.value)}
                          placeholder="landing page optimization, conversion rate, marketing automation"
                          rows={2}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Tone & Style</label>
                        <select
                          value={formData.toneStyle}
                          onChange={(e) => handleInputChange('toneStyle', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                        >
                          {toneStyles.map((tone) => (
                            <option key={tone.value} value={tone.value}>{tone.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Page Settings */}
                  <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                    <h3 className="text-xl font-semibold text-white mb-4">Page Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Page Length</label>
                        <div className="space-y-2">
                          {pageLengths.map((length) => (
                            <button
                              key={length.value}
                              onClick={() => handleInputChange('pageLength', length.value)}
                              className={`w-full text-left p-3 rounded-lg border transition-all ${
                                formData.pageLength === length.value
                                  ? 'border-purple-500 bg-purple-500/20'
                                  : 'border-gray-600/50 bg-gray-800/50 hover:border-gray-500/70'
                              }`}
                            >
                              <div className="font-medium text-white">{length.label}</div>
                              <div className="text-sm text-gray-400">{length.description}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">A/B Testing</label>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleInputChange('abTestingRequired', 'no')}
                            className={`flex-1 p-3 rounded-lg border transition-all ${
                              formData.abTestingRequired === 'no'
                                ? 'border-purple-500 bg-purple-500/20 text-white'
                                : 'border-gray-600/50 bg-gray-800/50 text-gray-300 hover:border-gray-500/70'
                            }`}
                          >
                            <div className="text-center">
                              <Shield className="w-5 h-5 mx-auto mb-1" />
                              <div className="font-medium">Single Version</div>
                            </div>
                          </button>
                          <button
                            onClick={() => handleInputChange('abTestingRequired', 'yes')}
                            className={`flex-1 p-3 rounded-lg border transition-all ${
                              formData.abTestingRequired === 'yes'
                                ? 'border-purple-500 bg-purple-500/20 text-white'
                                : 'border-gray-600/50 bg-gray-800/50 text-gray-300 hover:border-gray-500/70'
                            }`}
                          >
                            <div className="text-center">
                              <TestTube className="w-5 h-5 mx-auto mb-1" />
                              <div className="font-medium">A/B Testing</div>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Landing Page Objective */}
                  <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                    <h3 className="text-xl font-semibold text-white mb-4">Landing Page Objective *</h3>
                    <div className="space-y-3">
                      {objectives.map((objective) => (
                        <button
                          key={objective.value}
                          onClick={() => handleInputChange('landingPageObjective', objective.value)}
                          className={`w-full text-left p-4 rounded-lg border transition-all ${
                            formData.landingPageObjective === objective.value
                              ? 'border-purple-500 bg-purple-500/20 text-white'
                              : 'border-gray-600/50 bg-gray-800/50 text-gray-300 hover:border-gray-500/70 hover:bg-gray-700/30'
                          }`}
                        >
                          <div className="font-medium">{objective.label}</div>
                          <div className="text-sm text-gray-400">{objective.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                    <h3 className="text-xl font-semibold text-white mb-4">Target Audience *</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {audienceTypes.map((audience) => (
                        <button
                          key={audience.value}
                          onClick={() => handleInputChange('audienceType', audience.value)}
                          className={`p-3 rounded-lg border transition-all text-left ${
                            formData.audienceType === audience.value
                              ? 'border-purple-500 bg-purple-500/20 text-white'
                              : 'border-gray-600/50 bg-gray-800/50 text-gray-300 hover:border-gray-500/70 hover:bg-gray-700/30'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{audience.icon}</span>
                            <span className="font-medium text-sm">{audience.label}</span>
                          </div>
                        </button>
                      ))}
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
                onClick={generateLandingPage}
                disabled={isGenerating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center space-x-2">
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Generating Landing Page Copy...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate Landing Page Copy</span>
                    </>
                  )}
                </div>
              </motion.button>
            </motion.div>
          )}

          {(activeTab === 'results' || activeTab === 'ab-test') && generatedLandingPage && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Variant Selector for A/B Testing */}
              {generatedLandingPage.metadata.abTestingEnabled && (
                <div className="glass-effect rounded-xl p-4 border border-white/20 premium-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Select Variant</h3>
                    <TestTube className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex space-x-2">
                    {!generatedLandingPage.metadata.abTestingEnabled && (
                      <button
                        onClick={() => setSelectedVariant('main')}
                        className={`flex-1 p-3 rounded-lg transition-all ${
                          selectedVariant === 'main'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700/70'
                        }`}
                      >
                        Main Version
                      </button>
                    )}
                    {generatedLandingPage.metadata.abTestingEnabled && (
                      <>
                        <button
                          onClick={() => setSelectedVariant('variantA')}
                          className={`flex-1 p-3 rounded-lg transition-all ${
                            selectedVariant === 'variantA'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700/70'
                          }`}
                        >
                          <div className="text-center">
                            <div className="font-medium">Variant A</div>
                            <div className="text-xs">Emotional/Transformation</div>
                          </div>
                        </button>
                        <button
                          onClick={() => setSelectedVariant('variantB')}
                          className={`flex-1 p-3 rounded-lg transition-all ${
                            selectedVariant === 'variantB'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700/70'
                          }`}
                        >
                          <div className="text-center">
                            <div className="font-medium">Variant B</div>
                            <div className="text-xs">Rational/Authority</div>
                          </div>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Landing Page Content Display */}
              {(() => {
                const variant = getCurrentVariant();
                if (!variant) return null;

                return (
                  <>
                    {/* Export Options */}
                    <div className="glass-effect rounded-xl p-4 border border-white/20 premium-shadow">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Export Options</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => copyToClipboard(`${variant.headlines.primary}\n\n${variant.headlines.subheadline}\n\n${variant.valueProposition}\n\nKey Benefits:\n${variant.keyBenefits.map(b => `• ${b}`).join('\n')}\n\nCall to Action:\n${variant.callToActions.primary}\n${variant.callToActions.supportingText}`)}
                            className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            <span>Copy Summary</span>
                          </button>
                          <button
                            onClick={() => copyToClipboard(`${variant.headlines.primary}\n\n${variant.headlines.subheadline}\n\n${variant.valueProposition}\n\n${variant.keyBenefits.map(b => `• ${b}`).join('\n')}\n\n${variant.features.map(f => `${f.title}: ${f.description}`).join('\n\n')}\n\n${variant.callToActions.primary}\n${variant.callToActions.supportingText}\n\n${variant.socialProof.statsOrClaims.join('\n')}\n\n${variant.faq.map(q => `Q: ${q.question}\nA: ${q.answer}`).join('\n\n')}`)}
                            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            <span>Copy All</span>
                          </button>
                          <button
                            onClick={downloadLandingPage}
                            className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Headlines Section */}
                    <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                        <Megaphone className="w-5 h-5 text-purple-400" />
                        <span>Headlines</span>
                      </h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-sm text-gray-400">Primary Headline</div>
                            <button
                              onClick={() => copyToClipboard(variant.headlines.primary)}
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-xl font-bold text-white">{variant.headlines.primary}</div>
                        </div>
                        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-sm text-gray-400">Subheadline</div>
                            <button
                              onClick={() => copyToClipboard(variant.headlines.subheadline)}
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-lg text-gray-300">{variant.headlines.subheadline}</div>
                        </div>
                        {variant.headlines.alternatives && variant.headlines.alternatives.length > 0 && (
                          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                            <div className="text-sm text-gray-400 mb-2">Alternative Headlines</div>
                            {variant.headlines.alternatives.map((alt, index) => (
                              <div key={index} className="text-gray-300 mb-1">• {alt}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Value Proposition */}
                    <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <span>Value Proposition</span>
                      </h3>
                      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-gray-300 leading-relaxed">{variant.valueProposition}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(variant.valueProposition)}
                            className="text-gray-400 hover:text-white transition-colors ml-2 flex-shrink-0"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Key Benefits */}
                    <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span>Key Benefits</span>
                      </h3>
                      <div className="space-y-3">
                        {variant.keyBenefits.map((benefit, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                        <Zap className="w-5 h-5 text-blue-400" />
                        <span>Features</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {variant.features.map((feature, index) => (
                          <div key={index} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                            <div className="font-semibold text-white mb-2">{feature.title}</div>
                            <div className="text-gray-300 text-sm">{feature.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Call to Actions */}
                    <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                        <MousePointer className="w-5 h-5 text-purple-400" />
                        <span>Call to Actions</span>
                      </h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-purple-500/20 rounded-lg border border-purple-500/50">
                          <div className="text-sm text-purple-300 mb-1">Primary CTA</div>
                          <div className="text-lg font-bold text-white">{variant.callToActions.primary}</div>
                          <div className="text-sm text-purple-200 mt-2">{variant.callToActions.supportingText}</div>
                        </div>
                        {variant.callToActions.alternatives && variant.callToActions.alternatives.length > 0 && (
                          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                            <div className="text-sm text-gray-400 mb-2">Alternative CTAs</div>
                            {variant.callToActions.alternatives.map((alt, index) => (
                              <div key={index} className="text-gray-300 mb-1">• {alt}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Social Proof */}
                    <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                        <Users className="w-5 h-5 text-green-400" />
                        <span>Social Proof</span>
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <div className="text-sm text-gray-400 mb-3">Statistics & Claims</div>
                          <div className="space-y-2">
                            {variant.socialProof.statsOrClaims.map((stat, index) => (
                              <div key={index} className="p-3 bg-green-500/20 rounded-lg border border-green-500/50">
                                <span className="text-green-200">{stat}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400 mb-3">Testimonial Templates</div>
                          <div className="space-y-3">
                            {variant.socialProof.testimonialPlaceholders.map((testimonial, index) => (
                              <div key={index} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                                <span className="text-gray-300 italic">"{testimonial}"</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* FAQ */}
                    {variant.faq.length > 0 && (
                      <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                          <MessageSquare className="w-5 h-5 text-blue-400" />
                          <span>Frequently Asked Questions</span>
                        </h3>
                        <div className="space-y-4">
                          {variant.faq.map((item, index) => (
                            <div key={index} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                              <div className="font-semibold text-white mb-2">Q: {item.question}</div>
                              <div className="text-gray-300">A: {item.answer}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SEO Information */}
                    <div className="glass-effect rounded-xl p-6 border border-white/20 premium-shadow">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                        <Globe className="w-5 h-5 text-purple-400" />
                        <span>SEO Elements</span>
                      </h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                          <div className="text-sm text-gray-400 mb-1">Page Title</div>
                          <div className="text-white">{variant.seo.pageTitle}</div>
                        </div>
                        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                          <div className="text-sm text-gray-400 mb-1">Meta Description</div>
                          <div className="text-gray-300">{variant.seo.metaDescription}</div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Generate Another */}
              <motion.button
                onClick={() => setActiveTab('form')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="w-5 h-5" />
                  <span>Generate Another Landing Page</span>
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LandingPageCopyGenerator;