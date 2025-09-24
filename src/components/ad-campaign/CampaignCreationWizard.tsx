import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Target,
  Users,
  Sparkles,
  DollarSign,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  MapPin,
  Clock,
  TrendingUp,
  Eye,
  Heart,
  ShoppingCart,
  Download,
  Play,
  MessageCircle,
  Share,
  Plus,
  Minus,
  Check,
  AlertCircle,
  Info,
  Zap,
  Brain,
  BarChart3
} from 'lucide-react';

interface CampaignCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCampaignCreate: (campaignData: any) => void;
}

interface CampaignData {
  // Campaign Basics
  name: string;
  objective: string;
  platform: string[];

  // Budget & Scheduling
  budgetType: 'daily' | 'lifetime';
  budget: number;
  bidStrategy: string;
  startDate: string;
  endDate: string;

  // Audience Targeting
  locations: string[];
  ageRange: { min: number; max: number };
  gender: string;
  languages: string[];
  interests: string[];
  behaviors: string[];
  customAudiences: string[];
  lookalikes: string[];

  // Ad Placement & Format
  placements: string[];
  devices: string[];
  adFormat: string;

  // Creative
  headlines: string[];
  descriptions: string[];
  callToAction: string;

  // Advanced Settings
  frequencyCap: { impressions: number; days: number };
  dayparting: { enabled: boolean; schedule: any[] };
  optimization: string;
  attribution: string;
}

const CampaignCreationWizard: React.FC<CampaignCreationWizardProps> = ({
  isOpen,
  onClose,
  onCampaignCreate
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: '',
    objective: '',
    platform: [],
    budgetType: 'daily',
    budget: 50,
    bidStrategy: 'lowest_cost',
    startDate: '',
    endDate: '',
    locations: ['US'],
    ageRange: { min: 18, max: 65 },
    gender: 'all',
    languages: ['en'],
    interests: [],
    behaviors: [],
    customAudiences: [],
    lookalikes: [],
    placements: [],
    devices: ['mobile', 'desktop'],
    adFormat: 'single_image',
    headlines: [''],
    descriptions: [''],
    callToAction: 'learn_more',
    frequencyCap: { impressions: 2, days: 7 },
    dayparting: { enabled: false, schedule: [] },
    optimization: 'conversions',
    attribution: '7d_click'
  });

  const steps = [
    {
      id: 'objective',
      title: 'Campaign Objective',
      subtitle: 'What do you want to achieve with this campaign?'
    },
    {
      id: 'platform',
      title: 'Platform Selection',
      subtitle: 'Choose where to run your ads'
    },
    {
      id: 'audience',
      title: 'Audience Targeting',
      subtitle: 'Define your target audience'
    },
    {
      id: 'budget',
      title: 'Budget & Schedule',
      subtitle: 'Set your budget and timeline'
    },
    {
      id: 'placement',
      title: 'Ad Placement',
      subtitle: 'Choose where your ads will appear'
    },
    {
      id: 'creative',
      title: 'Ad Creative',
      subtitle: 'Create your ad content'
    },
    {
      id: 'advanced',
      title: 'Advanced Settings',
      subtitle: 'Fine-tune your campaign'
    },
    {
      id: 'review',
      title: 'Review & Launch',
      subtitle: 'Review your campaign settings'
    }
  ];

  const objectives = [
    {
      id: 'awareness',
      name: 'Brand Awareness',
      description: 'Increase awareness of your brand',
      icon: Eye,
      platforms: ['facebook', 'instagram', 'google', 'linkedin']
    },
    {
      id: 'reach',
      name: 'Reach',
      description: 'Show your ad to as many people as possible',
      icon: Globe,
      platforms: ['facebook', 'instagram', 'twitter']
    },
    {
      id: 'traffic',
      name: 'Traffic',
      description: 'Drive people to your website',
      icon: TrendingUp,
      platforms: ['facebook', 'google', 'linkedin', 'twitter']
    },
    {
      id: 'engagement',
      name: 'Engagement',
      description: 'Get more likes, shares, and comments',
      icon: Heart,
      platforms: ['facebook', 'instagram', 'twitter']
    },
    {
      id: 'app_installs',
      name: 'App Installs',
      description: 'Drive downloads of your mobile app',
      icon: Download,
      platforms: ['facebook', 'google', 'instagram']
    },
    {
      id: 'video_views',
      name: 'Video Views',
      description: 'Get more people to watch your videos',
      icon: Play,
      platforms: ['facebook', 'instagram', 'youtube']
    },
    {
      id: 'lead_generation',
      name: 'Lead Generation',
      description: 'Collect leads for your business',
      icon: Users,
      platforms: ['facebook', 'linkedin', 'google']
    },
    {
      id: 'messages',
      name: 'Messages',
      description: 'Get people to message your business',
      icon: MessageCircle,
      platforms: ['facebook', 'instagram']
    },
    {
      id: 'conversions',
      name: 'Conversions',
      description: 'Drive actions on your website or app',
      icon: ShoppingCart,
      platforms: ['facebook', 'google', 'instagram', 'linkedin']
    }
  ];

  const platforms = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '📘',
      color: 'border-blue-500 bg-blue-500/10',
      audience: '2.9B users',
      strengths: ['Detailed targeting', 'Large audience', 'Multiple formats']
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: '📷',
      color: 'border-pink-500 bg-pink-500/10',
      audience: '2.0B users',
      strengths: ['Visual content', 'Younger audience', 'High engagement']
    },
    {
      id: 'google',
      name: 'Google Ads',
      icon: '🔍',
      color: 'border-blue-400 bg-blue-400/10',
      audience: '4.3B users',
      strengths: ['Search intent', 'Wide reach', 'Performance tracking']
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: '💼',
      color: 'border-blue-600 bg-blue-600/10',
      audience: '900M users',
      strengths: ['B2B targeting', 'Professional audience', 'Lead generation']
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: '🐦',
      color: 'border-blue-300 bg-blue-300/10',
      audience: '450M users',
      strengths: ['Real-time content', 'Trending topics', 'Conversation ads']
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: '📺',
      color: 'border-red-500 bg-red-500/10',
      audience: '2.7B users',
      strengths: ['Video content', 'Long engagement', 'Brand storytelling']
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: '🎵',
      color: 'border-black bg-gray-500/10',
      audience: '1.0B users',
      strengths: ['Gen Z audience', 'Creative content', 'Viral potential']
    }
  ];

  const locations = [
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'MX', name: 'Mexico', flag: '🇲🇽' }
  ];

  const interests = [
    'Technology', 'Marketing', 'Business', 'Finance', 'Health & Fitness',
    'Travel', 'Food & Cooking', 'Fashion', 'Sports', 'Music',
    'Movies & TV', 'Gaming', 'Art & Design', 'Education', 'Real Estate'
  ];

  const behaviors = [
    'Online Shoppers', 'Business Travelers', 'Technology Early Adopters',
    'Luxury Shoppers', 'Mobile Users', 'Frequent Travelers',
    'Small Business Owners', 'Digital Activities', 'Purchase Behavior'
  ];

  const adFormats = [
    {
      id: 'single_image',
      name: 'Single Image',
      description: 'A single image with text',
      platforms: ['facebook', 'instagram', 'linkedin', 'twitter']
    },
    {
      id: 'carousel',
      name: 'Carousel',
      description: 'Multiple images or videos',
      platforms: ['facebook', 'instagram', 'linkedin']
    },
    {
      id: 'video',
      name: 'Video',
      description: 'Short video content',
      platforms: ['facebook', 'instagram', 'youtube', 'tiktok']
    },
    {
      id: 'collection',
      name: 'Collection',
      description: 'Showcase products',
      platforms: ['facebook', 'instagram']
    },
    {
      id: 'story',
      name: 'Story',
      description: 'Full-screen vertical format',
      platforms: ['facebook', 'instagram']
    }
  ];

  const callToActions = [
    { id: 'learn_more', name: 'Learn More' },
    { id: 'shop_now', name: 'Shop Now' },
    { id: 'sign_up', name: 'Sign Up' },
    { id: 'download', name: 'Download' },
    { id: 'book_now', name: 'Book Now' },
    { id: 'contact_us', name: 'Contact Us' },
    { id: 'get_quote', name: 'Get Quote' },
    { id: 'apply_now', name: 'Apply Now' },
    { id: 'watch_video', name: 'Watch Video' },
    { id: 'subscribe', name: 'Subscribe' }
  ];

  const updateCampaignData = (updates: Partial<CampaignData>) => {
    setCampaignData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return campaignData.objective !== '';
      case 1: return campaignData.platform.length > 0;
      case 2: return campaignData.locations.length > 0;
      case 3: return campaignData.budget > 0 && campaignData.startDate !== '';
      case 4: return campaignData.placements.length > 0;
      case 5: return campaignData.headlines[0] !== '' && campaignData.descriptions[0] !== '';
      case 6: return true;
      case 7: return campaignData.name !== '';
      default: return true;
    }
  };

  const handleFinish = () => {
    onCampaignCreate(campaignData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-700"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-purple-900/50 to-blue-900/50">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Create Campaign</h2>
              <p className="text-gray-300 mt-1">{steps[currentStep].subtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-sm text-gray-400">{Math.round((currentStep / (steps.length - 1)) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`text-xs px-2 py-1 rounded ${
                  index <= currentStep
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {step.title}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              {/* Step 0: Objective */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Choose Your Campaign Objective</h3>
                    <p className="text-gray-400">Select the main goal you want to achieve with your advertising campaign.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {objectives.map((objective) => {
                      const Icon = objective.icon;
                      return (
                        <button
                          key={objective.id}
                          onClick={() => updateCampaignData({ objective: objective.id })}
                          className={`p-6 rounded-xl border-2 transition-all text-left hover:scale-105 ${
                            campaignData.objective === objective.id
                              ? 'border-purple-500 bg-purple-900/30'
                              : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                          }`}
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              campaignData.objective === objective.id
                                ? 'bg-purple-600'
                                : 'bg-gray-700'
                            }`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{objective.name}</h4>
                            </div>
                          </div>
                          <p className="text-gray-400 text-sm mb-3">{objective.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {objective.platforms.slice(0, 3).map((platform) => (
                              <span key={platform} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                                {platforms.find(p => p.id === platform)?.name}
                              </span>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 1: Platform */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Select Advertising Platforms</h3>
                    <p className="text-gray-400">Choose where you want to run your {
                      objectives.find(obj => obj.id === campaignData.objective)?.name
                    } campaign.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {platforms.map((platform) => {
                      const isAvailable = !campaignData.objective ||
                        objectives.find(obj => obj.id === campaignData.objective)?.platforms.includes(platform.id);
                      const isSelected = campaignData.platform.includes(platform.id);

                      return (
                        <button
                          key={platform.id}
                          onClick={() => {
                            if (!isAvailable) return;
                            const newPlatforms = isSelected
                              ? campaignData.platform.filter(p => p !== platform.id)
                              : [...campaignData.platform, platform.id];
                            updateCampaignData({ platform: newPlatforms });
                          }}
                          disabled={!isAvailable}
                          className={`p-6 rounded-xl border-2 transition-all text-left relative ${
                            !isAvailable
                              ? 'opacity-50 cursor-not-allowed border-gray-700 bg-gray-800/30'
                              : isSelected
                              ? 'border-purple-500 bg-purple-900/30'
                              : 'border-gray-600 hover:border-gray-500 bg-gray-800/50 hover:scale-105'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}

                          <div className="flex items-center space-x-3 mb-4">
                            <div className="text-3xl">{platform.icon}</div>
                            <div>
                              <h4 className="font-bold text-white text-lg">{platform.name}</h4>
                              <p className="text-gray-400 text-sm">{platform.audience}</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {platform.strengths.map((strength) => (
                              <div key={strength} className="flex items-center space-x-2">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                                <span className="text-gray-300 text-sm">{strength}</span>
                              </div>
                            ))}
                          </div>

                          {!isAvailable && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 rounded-xl">
                              <span className="text-gray-400 text-sm">Not available for this objective</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {campaignData.platform.length > 0 && (
                    <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Info className="w-5 h-5 text-blue-400" />
                        <span className="font-medium text-blue-400">Cross-Platform Benefits</span>
                      </div>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Unified campaign management across platforms</li>
                        <li>• Cross-platform audience insights and optimization</li>
                        <li>• Automated budget allocation based on performance</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Audience */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Define Your Target Audience</h3>
                    <p className="text-gray-400">Specify who you want to reach with your campaign.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Location Targeting */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                        <MapPin className="w-5 h-5 text-purple-400" />
                        <span>Locations</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {locations.map((location) => (
                          <label key={location.code} className="flex items-center space-x-2 cursor-pointer p-3 rounded-lg hover:bg-gray-800/50">
                            <input
                              type="checkbox"
                              checked={campaignData.locations.includes(location.code)}
                              onChange={(e) => {
                                const newLocations = e.target.checked
                                  ? [...campaignData.locations, location.code]
                                  : campaignData.locations.filter(l => l !== location.code);
                                updateCampaignData({ locations: newLocations });
                              }}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-lg">{location.flag}</span>
                            <span className="text-white text-sm">{location.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Demographics */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                        <Users className="w-5 h-5 text-purple-400" />
                        <span>Demographics</span>
                      </h4>

                      <div className="space-y-4">
                        {/* Age Range */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Age Range</label>
                          <div className="flex items-center space-x-4">
                            <div className="flex-1">
                              <input
                                type="range"
                                min="18"
                                max="65"
                                value={campaignData.ageRange.min}
                                onChange={(e) => updateCampaignData({
                                  ageRange: { ...campaignData.ageRange, min: parseInt(e.target.value) }
                                })}
                                className="w-full"
                              />
                              <div className="flex justify-between text-xs text-gray-400">
                                <span>18</span>
                                <span>65</span>
                              </div>
                            </div>
                            <div className="text-white font-medium">
                              {campaignData.ageRange.min} - {campaignData.ageRange.max}
                            </div>
                          </div>
                        </div>

                        {/* Gender */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                          <div className="flex space-x-3">
                            {['all', 'male', 'female'].map((gender) => (
                              <label key={gender} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="radio"
                                  value={gender}
                                  checked={campaignData.gender === gender}
                                  onChange={(e) => updateCampaignData({ gender: e.target.value })}
                                  className="text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-white capitalize">{gender}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interests */}
                    <div className="lg:col-span-2 space-y-4">
                      <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                        <Heart className="w-5 h-5 text-purple-400" />
                        <span>Interests & Behaviors</span>
                      </h4>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">Interests</label>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {interests.map((interest) => (
                              <label key={interest} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-800/50">
                                <input
                                  type="checkbox"
                                  checked={campaignData.interests.includes(interest)}
                                  onChange={(e) => {
                                    const newInterests = e.target.checked
                                      ? [...campaignData.interests, interest]
                                      : campaignData.interests.filter(i => i !== interest);
                                    updateCampaignData({ interests: newInterests });
                                  }}
                                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-white text-sm">{interest}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">Behaviors</label>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {behaviors.map((behavior) => (
                              <label key={behavior} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-800/50">
                                <input
                                  type="checkbox"
                                  checked={campaignData.behaviors.includes(behavior)}
                                  onChange={(e) => {
                                    const newBehaviors = e.target.checked
                                      ? [...campaignData.behaviors, behavior]
                                      : campaignData.behaviors.filter(b => b !== behavior);
                                    updateCampaignData({ behaviors: newBehaviors });
                                  }}
                                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-white text-sm">{behavior}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Audience Size Estimate */}
                  <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-5 h-5 text-green-400" />
                      <span className="font-medium text-green-400">Estimated Audience Size</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white text-2xl font-bold">
                        {(2500000 * (campaignData.locations.length / 10) * (campaignData.platform.length / 6)).toLocaleString()}
                      </span>
                      <span className="text-green-400">Broad reach - Good for awareness</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Budget */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Budget & Schedule</h3>
                    <p className="text-gray-400">Set your campaign budget and timing.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Budget Settings */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-white flex items-center space-x-2 mb-4">
                          <DollarSign className="w-5 h-5 text-purple-400" />
                          <span>Budget</span>
                        </h4>

                        <div className="space-y-4">
                          {/* Budget Type */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Budget Type</label>
                            <div className="flex space-x-4">
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="radio"
                                  value="daily"
                                  checked={campaignData.budgetType === 'daily'}
                                  onChange={(e) => updateCampaignData({ budgetType: e.target.value as 'daily' | 'lifetime' })}
                                  className="text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-white">Daily Budget</span>
                              </label>
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="radio"
                                  value="lifetime"
                                  checked={campaignData.budgetType === 'lifetime'}
                                  onChange={(e) => updateCampaignData({ budgetType: e.target.value as 'daily' | 'lifetime' })}
                                  className="text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-white">Lifetime Budget</span>
                              </label>
                            </div>
                          </div>

                          {/* Budget Amount */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              {campaignData.budgetType === 'daily' ? 'Daily' : 'Total'} Budget
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-400">$</span>
                              </div>
                              <input
                                type="number"
                                value={campaignData.budget}
                                onChange={(e) => updateCampaignData({ budget: parseFloat(e.target.value) })}
                                min="1"
                                className="pl-8 pr-4 py-3 w-full bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              {campaignData.budgetType === 'daily' ? 'Amount to spend per day' : 'Total amount for entire campaign'}
                            </p>
                          </div>

                          {/* Bid Strategy */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Bid Strategy</label>
                            <select
                              value={campaignData.bidStrategy}
                              onChange={(e) => updateCampaignData({ bidStrategy: e.target.value })}
                              className="w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="lowest_cost">Lowest Cost</option>
                              <option value="cost_cap">Cost Cap</option>
                              <option value="bid_cap">Bid Cap</option>
                              <option value="target_cost">Target Cost</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Schedule Settings */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-white flex items-center space-x-2 mb-4">
                          <Calendar className="w-5 h-5 text-purple-400" />
                          <span>Schedule</span>
                        </h4>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                            <input
                              type="date"
                              value={campaignData.startDate}
                              onChange={(e) => updateCampaignData({ startDate: e.target.value })}
                              className="w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">End Date (Optional)</label>
                            <input
                              type="date"
                              value={campaignData.endDate}
                              onChange={(e) => updateCampaignData({ endDate: e.target.value })}
                              className="w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                              min={campaignData.startDate || new Date().toISOString().split('T')[0]}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Budget Estimate */}
                  <div className="p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-lg">
                    <h4 className="text-lg font-semibold text-white mb-4">Budget Breakdown</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-purple-400">{campaignData.platform.length}</div>
                        <div className="text-sm text-gray-300">Platforms</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-400">
                          ${Math.round(campaignData.budget / campaignData.platform.length || 1)}
                        </div>
                        <div className="text-sm text-gray-300">Per Platform (Daily)</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-400">
                          {Math.round((campaignData.budget * 30) / 0.5)} - {Math.round((campaignData.budget * 30) / 0.2)}
                        </div>
                        <div className="text-sm text-gray-300">Est. Monthly Reach</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Placement */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Ad Placements & Formats</h3>
                    <p className="text-gray-400">Choose where your ads will appear and what format to use.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Device Targeting */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                        <Smartphone className="w-5 h-5 text-purple-400" />
                        <span>Device Types</span>
                      </h4>
                      <div className="space-y-3">
                        {[
                          { id: 'mobile', name: 'Mobile', icon: Smartphone, desc: 'Smartphones and mobile devices' },
                          { id: 'desktop', name: 'Desktop', icon: Monitor, desc: 'Desktop computers and laptops' },
                          { id: 'tablet', name: 'Tablet', icon: Tablet, desc: 'iPad and Android tablets' }
                        ].map(device => {
                          const Icon = device.icon;
                          const isSelected = campaignData.devices.includes(device.id);
                          return (
                            <button
                              key={device.id}
                              onClick={() => {
                                const newDevices = isSelected
                                  ? campaignData.devices.filter(d => d !== device.id)
                                  : [...campaignData.devices, device.id];
                                updateCampaignData({ devices: newDevices });
                              }}
                              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                                isSelected
                                  ? 'border-purple-500 bg-purple-900/30'
                                  : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <Icon className={`w-6 h-6 ${isSelected ? 'text-purple-400' : 'text-gray-400'}`} />
                                <div>
                                  <h5 className="font-medium text-white">{device.name}</h5>
                                  <p className="text-gray-400 text-sm">{device.desc}</p>
                                </div>
                                {isSelected && (
                                  <div className="ml-auto">
                                    <Check className="w-5 h-5 text-purple-400" />
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Ad Format */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <span>Ad Format</span>
                      </h4>
                      <div className="space-y-3">
                        {adFormats.filter(format =>
                          format.platforms.some(p => campaignData.platform.includes(p))
                        ).map(format => (
                          <button
                            key={format.id}
                            onClick={() => updateCampaignData({ adFormat: format.id })}
                            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                              campaignData.adFormat === format.id
                                ? 'border-purple-500 bg-purple-900/30'
                                : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-white">{format.name}</h5>
                                <p className="text-gray-400 text-sm">{format.description}</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {format.platforms.filter(p => campaignData.platform.includes(p)).map(platform => (
                                    <span key={platform} className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
                                      {platforms.find(pl => pl.id === platform)?.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {campaignData.adFormat === format.id && (
                                <Check className="w-5 h-5 text-purple-400" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Placement Preview */}
                  <div className="p-6 bg-gray-800/50 rounded-lg">
                    <h4 className="text-lg font-semibold text-white mb-4">Placement Preview</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {campaignData.platform.map(platform => (
                        <div key={platform} className="p-4 bg-gray-700/50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="text-lg">{platforms.find(p => p.id === platform)?.icon}</span>
                            <span className="font-medium text-white">
                              {platforms.find(p => p.id === platform)?.name}
                            </span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="text-gray-300">Format: {adFormats.find(f => f.id === campaignData.adFormat)?.name}</div>
                            <div className="text-gray-300">Devices: {campaignData.devices.join(', ')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Creative */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Ad Creative</h3>
                    <p className="text-gray-400">Create compelling ad content that converts.</p>
                  </div>

                  <div className="space-y-6">
                    {/* Headlines */}
                    <div>
                      <label className="block text-lg font-semibold text-white mb-3">Headlines</label>
                      <div className="space-y-3">
                        {campaignData.headlines.map((headline, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={headline}
                                onChange={(e) => {
                                  const newHeadlines = [...campaignData.headlines];
                                  newHeadlines[index] = e.target.value;
                                  updateCampaignData({ headlines: newHeadlines });
                                }}
                                placeholder={`Headline ${index + 1} (required)`}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                maxLength={30}
                              />
                              <div className="text-xs text-gray-400 mt-1">
                                {headline.length}/30 characters
                              </div>
                            </div>
                            {campaignData.headlines.length > 1 && (
                              <button
                                onClick={() => {
                                  const newHeadlines = campaignData.headlines.filter((_, i) => i !== index);
                                  updateCampaignData({ headlines: newHeadlines });
                                }}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        {campaignData.headlines.length < 5 && (
                          <button
                            onClick={() => updateCampaignData({
                              headlines: [...campaignData.headlines, '']
                            })}
                            className="flex items-center space-x-2 text-purple-400 hover:text-purple-300"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Headline</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Descriptions */}
                    <div>
                      <label className="block text-lg font-semibold text-white mb-3">Descriptions</label>
                      <div className="space-y-3">
                        {campaignData.descriptions.map((description, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="flex-1">
                              <textarea
                                value={description}
                                onChange={(e) => {
                                  const newDescriptions = [...campaignData.descriptions];
                                  newDescriptions[index] = e.target.value;
                                  updateCampaignData({ descriptions: newDescriptions });
                                }}
                                placeholder={`Description ${index + 1} (required)`}
                                rows={3}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                maxLength={90}
                              />
                              <div className="text-xs text-gray-400 mt-1">
                                {description.length}/90 characters
                              </div>
                            </div>
                            {campaignData.descriptions.length > 1 && (
                              <button
                                onClick={() => {
                                  const newDescriptions = campaignData.descriptions.filter((_, i) => i !== index);
                                  updateCampaignData({ descriptions: newDescriptions });
                                }}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded mt-1"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        {campaignData.descriptions.length < 3 && (
                          <button
                            onClick={() => updateCampaignData({
                              descriptions: [...campaignData.descriptions, '']
                            })}
                            className="flex items-center space-x-2 text-purple-400 hover:text-purple-300"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Description</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Call to Action */}
                    <div>
                      <label className="block text-lg font-semibold text-white mb-3">Call to Action</label>
                      <select
                        value={campaignData.callToAction}
                        onChange={(e) => updateCampaignData({ callToAction: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {callToActions.map(cta => (
                          <option key={cta.id} value={cta.id}>{cta.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* AI Creative Assistant */}
                    <div className="p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <Brain className="w-5 h-5 text-purple-400" />
                        <span className="font-medium text-purple-400">AI Creative Assistant</span>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">
                        Let AI help you create high-converting ad copy based on your campaign objective and audience.
                      </p>
                      <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg text-sm transition-colors">
                        Generate AI Copy
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Advanced */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Advanced Settings</h3>
                    <p className="text-gray-400">Fine-tune your campaign for optimal performance.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Frequency & Optimization */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Delivery Settings</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Frequency Cap
                            </label>
                            <div className="flex items-center space-x-3">
                              <input
                                type="number"
                                value={campaignData.frequencyCap.impressions}
                                onChange={(e) => updateCampaignData({
                                  frequencyCap: {
                                    ...campaignData.frequencyCap,
                                    impressions: parseInt(e.target.value)
                                  }
                                })}
                                min="1"
                                max="10"
                                className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                              <span className="text-gray-300">impressions per</span>
                              <input
                                type="number"
                                value={campaignData.frequencyCap.days}
                                onChange={(e) => updateCampaignData({
                                  frequencyCap: {
                                    ...campaignData.frequencyCap,
                                    days: parseInt(e.target.value)
                                  }
                                })}
                                min="1"
                                max="30"
                                className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                              <span className="text-gray-300">days</span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Optimization Goal
                            </label>
                            <select
                              value={campaignData.optimization}
                              onChange={(e) => updateCampaignData({ optimization: e.target.value })}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="conversions">Conversions</option>
                              <option value="clicks">Link Clicks</option>
                              <option value="impressions">Impressions</option>
                              <option value="reach">Reach</option>
                              <option value="engagement">Engagement</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Attribution Window
                            </label>
                            <select
                              value={campaignData.attribution}
                              onChange={(e) => updateCampaignData({ attribution: e.target.value })}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="1d_click">1 Day Click</option>
                              <option value="7d_click">7 Days Click</option>
                              <option value="28d_click">28 Days Click</option>
                              <option value="7d_view">7 Days View</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dayparting */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Schedule Settings</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-white">Ad Scheduling (Dayparting)</h5>
                              <p className="text-gray-400 text-sm">Show ads only during specific hours</p>
                            </div>
                            <button
                              onClick={() => updateCampaignData({
                                dayparting: {
                                  ...campaignData.dayparting,
                                  enabled: !campaignData.dayparting.enabled
                                }
                              })}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                campaignData.dayparting.enabled ? 'bg-purple-600' : 'bg-gray-600'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  campaignData.dayparting.enabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>

                          {campaignData.dayparting.enabled && (
                            <div className="p-4 bg-gray-800/50 rounded-lg">
                              <p className="text-gray-400 text-sm mb-3">
                                Configure your ad schedule (coming soon)
                              </p>
                              <div className="grid grid-cols-7 gap-1 text-xs">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                  <div key={day} className="text-center text-gray-400 font-medium p-2">
                                    {day}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 7: Review */}
              {currentStep === 7 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Review Your Campaign</h3>
                    <p className="text-gray-400">Review all settings before launching your campaign.</p>
                  </div>

                  {/* Campaign Name */}
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Campaign Name</label>
                    <input
                      type="text"
                      value={campaignData.name}
                      onChange={(e) => updateCampaignData({ name: e.target.value })}
                      placeholder="Enter campaign name"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Campaign Summary */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white">Campaign Overview</h4>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Objective:</span>
                          <span className="text-white capitalize">
                            {objectives.find(obj => obj.id === campaignData.objective)?.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Platforms:</span>
                          <div className="flex space-x-1">
                            {campaignData.platform.map(platform => (
                              <span key={platform} className="text-lg">
                                {platforms.find(p => p.id === platform)?.icon}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Budget:</span>
                          <span className="text-white">
                            ${campaignData.budget} {campaignData.budgetType}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Start Date:</span>
                          <span className="text-white">
                            {new Date(campaignData.startDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white">Targeting Summary</h4>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Locations:</span>
                          <span className="text-white">
                            {campaignData.locations.length} countries
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Age Range:</span>
                          <span className="text-white">
                            {campaignData.ageRange.min} - {campaignData.ageRange.max}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Interests:</span>
                          <span className="text-white">
                            {campaignData.interests.length} selected
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Est. Audience:</span>
                          <span className="text-green-400 font-semibold">
                            {(2500000 * (campaignData.locations.length / 10) * (campaignData.platform.length / 6)).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Creative Preview */}
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="text-lg font-semibold text-white mb-3">Creative Preview</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-400">Headlines:</span>
                        <div className="mt-1">
                          {campaignData.headlines.filter(h => h.trim()).map((headline, index) => (
                            <div key={index} className="text-white bg-gray-700 rounded px-2 py-1 text-sm inline-block mr-2 mb-1">
                              {headline}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">CTA:</span>
                        <span className="text-white ml-2 bg-purple-600 px-3 py-1 rounded text-sm">
                          {callToActions.find(cta => cta.id === campaignData.callToAction)?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Launch Options */}
                  <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <h4 className="text-lg font-semibold text-white mb-3">Launch Options</h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="launch_option"
                          value="draft"
                          defaultChecked
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-white">Save as Draft (Recommended)</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="launch_option"
                          value="publish"
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-white">Publish Immediately</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-900/50">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-3">
            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={!canProceed()}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Zap className="w-4 h-4" />
                <span>Create Campaign</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CampaignCreationWizard;