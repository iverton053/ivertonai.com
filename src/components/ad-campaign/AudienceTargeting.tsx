import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Target, MapPin, Calendar, Heart, ShoppingBag, Smartphone,
  Briefcase, GraduationCap, Home, Car, Gamepad2, Music, Film,
  Coffee, Plane, Camera, Book, Dumbbell, Paintbrush, ChefHat,
  TreePine, Baby, Dog, TrendingUp, Eye, MousePointer, Clock,
  Share2, MessageSquare, ThumbsUp, Plus, X, Search, Filter,
  BarChart3, PieChart, Globe, Zap, Star, AlertCircle, Info,
  CheckCircle, Settings, RefreshCw, Download, Upload
} from 'lucide-react';

interface AudienceTargetingProps {
  onAudienceChange?: (audience: AudienceData) => void;
  initialData?: Partial<AudienceData>;
}

interface AudienceData {
  demographics: {
    ageRange: [number, number];
    gender: string[];
    locations: Location[];
    languages: string[];
  };
  interests: {
    categories: string[];
    keywords: string[];
    behaviors: string[];
  };
  customAudiences: {
    websiteVisitors: boolean;
    customerList: boolean;
    lookalikes: LookalikeAudience[];
    exclusions: string[];
  };
  advanced: {
    connections: string;
    deviceTypes: string[];
    operatingSystems: string[];
    networkTypes: string[];
    placements: string[];
  };
  estimatedReach: {
    min: number;
    max: number;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
  };
}

interface Location {
  type: 'country' | 'region' | 'city' | 'radius';
  name: string;
  code?: string;
  radius?: number;
  unit?: 'km' | 'miles';
}

interface LookalikeAudience {
  name: string;
  source: string;
  similarity: number;
  size: number;
}

const AudienceTargeting: React.FC<AudienceTargetingProps> = ({
  onAudienceChange,
  initialData
}) => {
  const [activeTab, setActiveTab] = useState('demographics');
  const [audienceData, setAudienceData] = useState<AudienceData>({
    demographics: {
      ageRange: [18, 65],
      gender: ['all'],
      locations: [],
      languages: ['en']
    },
    interests: {
      categories: [],
      keywords: [],
      behaviors: []
    },
    customAudiences: {
      websiteVisitors: false,
      customerList: false,
      lookalikes: [],
      exclusions: []
    },
    advanced: {
      connections: 'all',
      deviceTypes: ['mobile', 'desktop', 'tablet'],
      operatingSystems: ['all'],
      networkTypes: ['wifi', '4g', '5g'],
      placements: ['feed', 'stories', 'reels', 'search']
    },
    estimatedReach: {
      min: 0,
      max: 0,
      quality: 'poor'
    }
  });

  const [searchLocation, setSearchLocation] = useState('');
  const [searchInterest, setSearchInterest] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);

  const interestCategories = [
    { icon: ShoppingBag, name: 'Shopping & Fashion', color: 'pink' },
    { icon: Briefcase, name: 'Business & Industry', color: 'blue' },
    { icon: GraduationCap, name: 'Education', color: 'green' },
    { icon: Heart, name: 'Health & Fitness', color: 'red' },
    { icon: Home, name: 'Home & Garden', color: 'orange' },
    { icon: Car, name: 'Automotive', color: 'gray' },
    { icon: Gamepad2, name: 'Gaming', color: 'purple' },
    { icon: Music, name: 'Music', color: 'indigo' },
    { icon: Film, name: 'Movies & TV', color: 'yellow' },
    { icon: Coffee, name: 'Food & Dining', color: 'amber' },
    { icon: Plane, name: 'Travel', color: 'cyan' },
    { icon: Camera, name: 'Photography', color: 'teal' },
    { icon: Book, name: 'Books & Literature', color: 'emerald' },
    { icon: Dumbbell, name: 'Sports & Fitness', color: 'lime' },
    { icon: Paintbrush, name: 'Arts & Crafts', color: 'violet' },
    { icon: ChefHat, name: 'Cooking', color: 'rose' },
    { icon: TreePine, name: 'Outdoors & Nature', color: 'green' },
    { icon: Baby, name: 'Parenting', color: 'pink' },
    { icon: Dog, name: 'Pets', color: 'orange' }
  ];

  const behaviorTypes = [
    'Frequent Online Shoppers',
    'Digital Device Users',
    'Travel Enthusiasts',
    'Business Decision Makers',
    'Tech Early Adopters',
    'Social Media Influencers',
    'Health & Wellness Focused',
    'Luxury Consumers',
    'Mobile Game Players',
    'Content Creators',
    'Eco-Conscious Consumers',
    'Fitness Enthusiasts',
    'Investment & Finance',
    'Education Seekers',
    'Entertainment Lovers'
  ];

  const locationSuggestions = [
    { type: 'country' as const, name: 'United States', code: 'US' },
    { type: 'country' as const, name: 'Canada', code: 'CA' },
    { type: 'country' as const, name: 'United Kingdom', code: 'GB' },
    { type: 'country' as const, name: 'Australia', code: 'AU' },
    { type: 'country' as const, name: 'Germany', code: 'DE' },
    { type: 'country' as const, name: 'France', code: 'FR' },
    { type: 'country' as const, name: 'Japan', code: 'JP' },
    { type: 'country' as const, name: 'Brazil', code: 'BR' },
    { type: 'country' as const, name: 'India', code: 'IN' },
    { type: 'city' as const, name: 'New York', code: 'NYC' },
    { type: 'city' as const, name: 'Los Angeles', code: 'LA' },
    { type: 'city' as const, name: 'London', code: 'LON' },
    { type: 'city' as const, name: 'Tokyo', code: 'TYO' },
    { type: 'city' as const, name: 'Sydney', code: 'SYD' }
  ];

  useEffect(() => {
    if (initialData) {
      setAudienceData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  useEffect(() => {
    estimateAudienceReach();
  }, [audienceData.demographics, audienceData.interests]);

  useEffect(() => {
    onAudienceChange?.(audienceData);
  }, [audienceData, onAudienceChange]);

  const estimateAudienceReach = async () => {
    setIsEstimating(true);

    // Simulate API call for audience estimation
    await new Promise(resolve => setTimeout(resolve, 1000));

    const baseReach = 100000000; // 100M base
    let multiplier = 1;

    // Age range factor
    const ageSpan = audienceData.demographics.ageRange[1] - audienceData.demographics.ageRange[0];
    multiplier *= Math.min(ageSpan / 47, 1); // Max age span is 47 (18-65)

    // Gender factor
    if (audienceData.demographics.gender.length === 1 && !audienceData.demographics.gender.includes('all')) {
      multiplier *= 0.5;
    }

    // Location factor
    multiplier *= audienceData.demographics.locations.length > 0 ?
      Math.min(audienceData.demographics.locations.length * 0.1, 0.8) : 0.1;

    // Interests factor
    if (audienceData.interests.categories.length > 0) {
      multiplier *= Math.max(0.1, 1 - (audienceData.interests.categories.length * 0.1));
    }

    const estimatedMin = Math.floor(baseReach * multiplier * 0.8);
    const estimatedMax = Math.floor(baseReach * multiplier * 1.2);

    // Quality assessment
    let quality: 'poor' | 'fair' | 'good' | 'excellent' = 'poor';
    if (estimatedMin > 10000 && estimatedMin < 1000000) quality = 'excellent';
    else if (estimatedMin > 1000 && estimatedMin < 5000000) quality = 'good';
    else if (estimatedMin > 100 && estimatedMin < 10000000) quality = 'fair';

    setAudienceData(prev => ({
      ...prev,
      estimatedReach: {
        min: estimatedMin,
        max: estimatedMax,
        quality
      }
    }));

    setIsEstimating(false);
  };

  const updateDemographics = (field: string, value: any) => {
    setAudienceData(prev => ({
      ...prev,
      demographics: {
        ...prev.demographics,
        [field]: value
      }
    }));
  };

  const updateInterests = (field: string, value: any) => {
    setAudienceData(prev => ({
      ...prev,
      interests: {
        ...prev.interests,
        [field]: value
      }
    }));
  };

  const addLocation = (location: Location) => {
    setAudienceData(prev => ({
      ...prev,
      demographics: {
        ...prev.demographics,
        locations: [...prev.demographics.locations, location]
      }
    }));
    setSearchLocation('');
  };

  const removeLocation = (index: number) => {
    setAudienceData(prev => ({
      ...prev,
      demographics: {
        ...prev.demographics,
        locations: prev.demographics.locations.filter((_, i) => i !== index)
      }
    }));
  };

  const toggleInterestCategory = (category: string) => {
    const current = audienceData.interests.categories;
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];

    updateInterests('categories', updated);
  };

  const toggleBehavior = (behavior: string) => {
    const current = audienceData.interests.behaviors;
    const updated = current.includes(behavior)
      ? current.filter(b => b !== behavior)
      : [...current, behavior];

    updateInterests('behaviors', updated);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      default: return 'text-red-500';
    }
  };

  const tabs = [
    { id: 'demographics', name: 'Demographics', icon: Users },
    { id: 'interests', name: 'Interests', icon: Heart },
    { id: 'behaviors', name: 'Behaviors', icon: TrendingUp },
    { id: 'custom', name: 'Custom Audiences', icon: Target },
    { id: 'advanced', name: 'Advanced', icon: Settings }
  ];

  return (
    <div className="space-y-6">
      {/* Audience Reach Estimator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Estimated Audience Reach
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Potential people your ads could reach
              </p>
            </div>
          </div>
          <button
            onClick={estimateAudienceReach}
            disabled={isEstimating}
            className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isEstimating ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEstimating ? (
                <div className="animate-pulse">---</div>
              ) : (
                formatNumber(audienceData.estimatedReach.min)
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Minimum Reach</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEstimating ? (
                <div className="animate-pulse">---</div>
              ) : (
                formatNumber(audienceData.estimatedReach.max)
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Maximum Reach</div>
          </div>

          <div className="text-center">
            <div className={`text-2xl font-bold capitalize ${getQualityColor(audienceData.estimatedReach.quality)}`}>
              {isEstimating ? (
                <div className="animate-pulse">---</div>
              ) : (
                audienceData.estimatedReach.quality
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Audience Quality</div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* Demographics Tab */}
          {activeTab === 'demographics' && (
            <div className="space-y-6">
              {/* Age Range */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Age Range
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {audienceData.demographics.ageRange[0]} - {audienceData.demographics.ageRange[1]} years old
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="13"
                      max="65"
                      value={audienceData.demographics.ageRange[0]}
                      onChange={(e) => updateDemographics('ageRange', [
                        parseInt(e.target.value),
                        audienceData.demographics.ageRange[1]
                      ])}
                      className="flex-1"
                    />
                    <input
                      type="range"
                      min="18"
                      max="65"
                      value={audienceData.demographics.ageRange[1]}
                      onChange={(e) => updateDemographics('ageRange', [
                        audienceData.demographics.ageRange[0],
                        parseInt(e.target.value)
                      ])}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Gender */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Gender</h4>
                <div className="flex gap-3">
                  {['all', 'male', 'female', 'non-binary'].map((gender) => (
                    <button
                      key={gender}
                      onClick={() => {
                        const current = audienceData.demographics.gender;
                        let updated;
                        if (gender === 'all') {
                          updated = ['all'];
                        } else {
                          updated = current.includes('all')
                            ? [gender]
                            : current.includes(gender)
                            ? current.filter(g => g !== gender)
                            : [...current.filter(g => g !== 'all'), gender];
                        }
                        updateDemographics('gender', updated);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                        audienceData.demographics.gender.includes(gender)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  Locations
                </h4>

                <div className="space-y-4">
                  {/* Search Location */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search countries, regions, or cities..."
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  {/* Location Suggestions */}
                  {searchLocation && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-48 overflow-y-auto">
                      {locationSuggestions
                        .filter(loc => loc.name.toLowerCase().includes(searchLocation.toLowerCase()))
                        .map((location, index) => (
                          <button
                            key={index}
                            onClick={() => addLocation(location)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Globe className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{location.name}</span>
                            <span className="text-xs text-gray-500 ml-auto capitalize">
                              {location.type}
                            </span>
                          </button>
                        ))}
                    </div>
                  )}

                  {/* Selected Locations */}
                  <div className="flex flex-wrap gap-2">
                    {audienceData.demographics.locations.map((location, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm"
                      >
                        <span>{location.name}</span>
                        <button
                          onClick={() => removeLocation(index)}
                          className="hover:text-blue-900 dark:hover:text-blue-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interests Tab */}
          {activeTab === 'interests' && (
            <div className="space-y-6">
              {/* Interest Categories */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Interest Categories</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {interestCategories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => toggleInterestCategory(category.name)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        audienceData.interests.categories.includes(category.name)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <category.icon className={`w-4 h-4 text-${category.color}-500`} />
                        <CheckCircle className={`w-3 h-3 ${
                          audienceData.interests.categories.includes(category.name)
                            ? 'text-blue-500'
                            : 'text-transparent'
                        }`} />
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Keywords */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Custom Keywords</h4>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add custom interest keywords..."
                      value={searchInterest}
                      onChange={(e) => setSearchInterest(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && searchInterest.trim()) {
                          updateInterests('keywords', [
                            ...audienceData.interests.keywords,
                            searchInterest.trim()
                          ]);
                          setSearchInterest('');
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      onClick={() => {
                        if (searchInterest.trim()) {
                          updateInterests('keywords', [
                            ...audienceData.interests.keywords,
                            searchInterest.trim()
                          ]);
                          setSearchInterest('');
                        }
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {audienceData.interests.keywords.map((keyword, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm"
                      >
                        <span>{keyword}</span>
                        <button
                          onClick={() => {
                            updateInterests('keywords',
                              audienceData.interests.keywords.filter((_, i) => i !== index)
                            );
                          }}
                          className="hover:text-green-900 dark:hover:text-green-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Behaviors Tab */}
          {activeTab === 'behaviors' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Behavioral Targeting
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {behaviorTypes.map((behavior) => (
                  <label
                    key={behavior}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={audienceData.interests.behaviors.includes(behavior)}
                      onChange={() => toggleBehavior(behavior)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-900 dark:text-white">{behavior}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Custom Audiences Tab */}
          {activeTab === 'custom' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Custom Audiences
                </h4>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={audienceData.customAudiences.websiteVisitors}
                      onChange={(e) => setAudienceData(prev => ({
                        ...prev,
                        customAudiences: {
                          ...prev.customAudiences,
                          websiteVisitors: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Website Visitors</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Target people who visited your website
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={audienceData.customAudiences.customerList}
                      onChange={(e) => setAudienceData(prev => ({
                        ...prev,
                        customAudiences: {
                          ...prev.customAudiences,
                          customerList: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Customer List</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Upload and target your customer email list
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              {/* Device Types */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-500" />
                  Device Types
                </h4>
                <div className="flex gap-3">
                  {['mobile', 'desktop', 'tablet'].map((device) => (
                    <button
                      key={device}
                      onClick={() => {
                        const current = audienceData.advanced.deviceTypes;
                        const updated = current.includes(device)
                          ? current.filter(d => d !== device)
                          : [...current, device];
                        setAudienceData(prev => ({
                          ...prev,
                          advanced: { ...prev.advanced, deviceTypes: updated }
                        }));
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                        audienceData.advanced.deviceTypes.includes(device)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {device}
                    </button>
                  ))}
                </div>
              </div>

              {/* Placements */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Ad Placements</h4>
                <div className="grid grid-cols-2 gap-3">
                  {['feed', 'stories', 'reels', 'search', 'sidebar', 'in-stream'].map((placement) => (
                    <label
                      key={placement}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={audienceData.advanced.placements.includes(placement)}
                        onChange={(e) => {
                          const current = audienceData.advanced.placements;
                          const updated = e.target.checked
                            ? [...current, placement]
                            : current.filter(p => p !== placement);
                          setAudienceData(prev => ({
                            ...prev,
                            advanced: { ...prev.advanced, placements: updated }
                          }));
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900 dark:text-white capitalize">
                        {placement.replace('-', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AudienceTargeting;