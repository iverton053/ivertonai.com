import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  ArrowRight, 
  Check, 
  Star, 
  Shield, 
  Zap, 
  Users, 
  BarChart3, 
  Target, 
  Lock, 
  MessageCircle,
  Phone,
  Mail,
  Linkedin,
  Twitter,
  Instagram,
  PlayCircle,
  Bot,
  TrendingUp,
  Search,
  UserCheck,
  Database,
  Settings,
  Rocket,
  Award,
  Clock,
  DollarSign,
  Workflow,
  Lightbulb,
  CheckCircle,
  ArrowUpRight,
  Globe,
  Menu,
  X,
  Calendar
} from 'lucide-react';

// Smooth scroll function
const smoothScrollTo = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
};

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2, suffix = '' }: { end: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const isInView = useInView(countRef, { once: true });

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = (currentTime - startTime) / (duration * 1000);
        
        if (progress < 1) {
          setCount(Math.floor(end * progress));
          requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, end, duration]);

  return <span ref={countRef}>{count.toLocaleString()}{suffix}</span>;
};

const PremiumLandingPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form submitted:', formData);
      alert('Thank you for your message! We\'ll get back to you within 24 hours.');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartTrial = () => {
    smoothScrollTo('contact');
  };

  const handleWatchDemo = () => {
    window.open('https://calendly.com', '_blank'); // Replace with actual demo booking link
  };

  const handleGetStarted = (planName: string) => {
    if (planName === 'Custom') {
      smoothScrollTo('contact');
    } else {
      // Simulate redirect to payment/signup
      console.log(`Starting ${planName} plan signup...`);
      alert(`Redirecting to ${planName} plan signup...`);
    }
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const features = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: "AI Automations",
      description: "Intelligent workflow automation that learns and optimizes your business processes with advanced machine learning."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Management", 
      description: "Comprehensive collaboration suite with role-based permissions, task tracking, and performance analytics."
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Advanced CRM",
      description: "Enterprise-grade customer relationship management with AI-powered insights and predictive analytics."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Ad Campaigns",
      description: "Multi-platform advertising management with automated optimization and real-time performance tracking."
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "SEO Tools",
      description: "Professional SEO suite with keyword research, content optimization, and competitive analysis."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics Hub",
      description: "Comprehensive reporting dashboard with custom metrics, forecasting, and business intelligence."
    },
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: "Client Portal",
      description: "White-labeled client portals with project tracking, secure communication, and automated reporting."
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Enterprise Security",
      description: "Bank-grade security with SOC 2 compliance, end-to-end encryption, and comprehensive audit trails."
    }
  ];

  const stats = [
    { number: 153, suffix: '+', label: 'Active Agencies', icon: <Users className="w-5 h-5" /> },
    { number: 500, suffix: '%', label: 'Average ROI', icon: <TrendingUp className="w-5 h-5" /> },
    { number: 24, suffix: '/7', label: 'Expert Support', icon: <Clock className="w-5 h-5" /> },
    { number: 99.9, suffix: '%', label: 'Uptime SLA', icon: <Shield className="w-5 h-5" /> }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO",
      company: "DigitalFlow Agency",
      content: "Iverton AI has transformed our operations completely. We've seen a 300% increase in productivity and 40% reduction in operational costs. The platform pays for itself within the first month.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b2e5?w=64&h=64&fit=crop&crop=face",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Founder",
      company: "GrowthHack Pro",
      content: "The AI-powered SEO tools and automated reporting have doubled our client retention rate. Our team now focuses on strategy instead of manual tasks. Exceptional platform.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Operations Director",
      company: "ScaleUp Marketing",
      content: "Finally found an all-in-one solution that delivers on its promises. The integration capabilities and customer support are outstanding. Highly recommend to any serious agency.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$99",
      period: "/month",
      description: "Perfect for growing agencies",
      features: [
        "Up to 5 team members",
        "Core AI automations",
        "CRM for 1,000 contacts",
        "Standard analytics",
        "Email support",
        "2 client portals"
      ],
      popular: false,
      cta: "Start Free Trial"
    },
    {
      name: "Professional",
      price: "$299",
      period: "/month",
      description: "Most popular for established agencies",
      features: [
        "Up to 25 team members",
        "Advanced AI automations",
        "CRM for 10,000 contacts",
        "Advanced analytics & reporting",
        "Priority support",
        "10 client portals",
        "White-label options",
        "API access"
      ],
      popular: true,
      cta: "Start Free Trial"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large agencies with complex needs",
      features: [
        "Unlimited team members",
        "Custom AI model training",
        "Unlimited CRM contacts",
        "Custom analytics dashboards",
        "Dedicated success manager",
        "Unlimited client portals",
        "Full white-label solution",
        "On-premise deployment"
      ],
      popular: false,
      cta: "Contact Sales"
    }
  ];

  const integrations = [
    { name: 'Google Analytics', logo: '📊' },
    { name: 'Facebook Ads', logo: '📘' },
    { name: 'Slack', logo: '💬' },
    { name: 'HubSpot', logo: '🟠' },
    { name: 'Zapier', logo: '⚡' },
    { name: 'Salesforce', logo: '☁️' },
    { name: 'Google Ads', logo: '🎯' },
    { name: 'Mailchimp', logo: '📧' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* SEO Meta Tags */}
      <title>Iverton AI - Enterprise Agency Management Platform</title>
      <meta name="description" content="Transform your digital agency with Iverton AI's enterprise-grade platform. AI automation, CRM, analytics, and client management in one solution." />
      
      {/* Premium Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur-sm opacity-60"></div>
                <img src="/logo.png" alt="Iverton AI" className="relative h-10 w-10 rounded-xl border-2 border-purple-400/50 bg-gradient-to-br from-purple-900/50 to-blue-900/50 p-1" />
              </div>
              <span className="text-2xl font-bold text-white">Iverton AI</span>
              <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold rounded-full shadow-lg">Enterprise</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {[
                { label: 'Features', id: 'features' },
                { label: 'Pricing', id: 'pricing' },
                { label: 'Testimonials', id: 'testimonials' },
                { label: 'Contact', id: 'contact' }
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => smoothScrollTo(item.id)}
                  className="text-slate-300 hover:text-white transition-colors duration-200 text-base font-semibold"
                >
                  {item.label}
                </button>
              ))}
              
              <button 
                onClick={handleStartTrial}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-base hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-xl hover:shadow-2xl"
              >
                Start Free Trial
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-300 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-700/50">
              <div className="flex flex-col space-y-3">
                {[
                  { label: 'Features', id: 'features' },
                  { label: 'Pricing', id: 'pricing' },
                  { label: 'Testimonials', id: 'testimonials' },
                  { label: 'Contact', id: 'contact' }
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      smoothScrollTo(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className="text-slate-300 hover:text-white transition-colors text-left"
                  >
                    {item.label}
                  </button>
                ))}
                <button 
                  onClick={() => {
                    handleStartTrial();
                    setMobileMenuOpen(false);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold text-left"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Premium Hero Section */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeIn}
          >
            {/* Premium Badge */}
            <div className="inline-flex items-center space-x-3 bg-slate-800/60 backdrop-blur-sm border border-purple-400/30 px-6 py-3 rounded-full mb-10">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-slate-300 text-base font-semibold">Trusted by 153+ agencies worldwide</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight leading-tight">
              Enterprise Agency
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
                Management Platform
              </span>
            </h1>
            
            <p className="text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
              Transform your digital agency with our comprehensive AI-powered platform. 
              Streamline operations, boost productivity, and scale your business with enterprise-grade tools.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <button 
                onClick={handleStartTrial}
                className="group bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-12 py-5 rounded-xl font-bold text-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-2xl hover:shadow-purple-500/25 flex items-center space-x-3"
              >
                <span>Start Free 14-Day Trial</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={handleWatchDemo}
                className="group flex items-center space-x-3 text-slate-300 hover:text-white glass-effect border border-purple-400/30 px-12 py-5 rounded-xl font-bold text-xl hover:bg-purple-900/20 transition-all duration-200"
              >
                <PlayCircle className="w-6 h-6 text-purple-400" />
                <span>Watch Demo</span>
              </button>
            </div>
            
            <div className="flex items-center justify-center space-x-12 text-slate-400 text-base">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="font-medium">No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="font-medium">Setup in 5 minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="font-medium">Cancel anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Product Video Demo Section */}
      <motion.section 
        className="py-20 px-6"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-400/30 px-4 py-2 rounded-full mb-6">
              <PlayCircle className="w-5 h-5 text-purple-400" />
              <span className="text-purple-300 font-semibold text-sm">See It In Action</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Watch Iverton AI
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Transform Your Agency
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              See how leading agencies use our platform to streamline operations, 
              automate workflows, and scale their business efficiently.
            </p>
          </motion.div>
          
          <motion.div 
            className="relative group"
            variants={fadeInUp}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="glass-effect rounded-2xl p-8 premium-shadow relative overflow-hidden">
              {/* Video Placeholder */}
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden">
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
                  <div className="absolute top-0 left-0 w-32 h-32 bg-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-600/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>
                
                {/* Video upload placeholder */}
                <div className="relative z-10 text-center">
                  <motion.div 
                    className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
                    animate={{ 
                      boxShadow: [
                        "0 0 0 0 rgba(139, 92, 246, 0.4)",
                        "0 0 0 20px rgba(139, 92, 246, 0)",
                        "0 0 0 0 rgba(139, 92, 246, 0)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <PlayCircle className="w-12 h-12 text-white" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3">Product Demo Coming Soon</h3>
                  <p className="text-slate-300 mb-6 max-w-md mx-auto">
                    Get an exclusive preview of how Iverton AI transforms agency operations in just 3 minutes.
                  </p>
                  
                  {/* Placeholder for video upload */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button 
                      onClick={handleWatchDemo}
                      className="group flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-xl"
                    >
                      <Calendar className="w-5 h-5" />
                      <span>Schedule Live Demo</span>
                    </button>
                    
                    <button className="flex items-center space-x-2 text-slate-300 hover:text-white glass-effect border border-purple-400/30 px-6 py-3 rounded-lg font-semibold transition-all duration-200">
                      <Mail className="w-5 h-5" />
                      <span>Get Notified</span>
                    </button>
                  </div>
                </div>
                
                {/* Video placeholder overlay for when video is uploaded */}
                <video 
                  className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-0 pointer-events-none"
                  poster="/video-thumbnail.jpg"
                  controls
                  preload="metadata"
                  style={{ display: 'none' }} // Will be shown when video is uploaded
                >
                  <source src="/demo-video.mp4" type="video/mp4" />
                  <source src="/demo-video.webm" type="video/webm" />
                  Your browser does not support the video tag.
                </video>
              </div>
              
              {/* Benefits row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {[
                  { icon: <Clock className="w-6 h-6" />, title: "3-Minute Overview", desc: "Complete platform walkthrough" },
                  { icon: <Users className="w-6 h-6" />, title: "Real Use Cases", desc: "See actual agency workflows" },
                  { icon: <TrendingUp className="w-6 h-6" />, title: "ROI Examples", desc: "Proven results and metrics" }
                ].map((benefit, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-3 p-4 bg-slate-800/40 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                  >
                    <div className="text-purple-400 flex-shrink-0">
                      {benefit.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm">{benefit.title}</h4>
                      <p className="text-slate-400 text-xs">{benefit.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          </motion.div>
        </div>
      </motion.section>

      {/* Premium Stats Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="glass-effect p-6 rounded-xl text-center premium-shadow group hover:y:-5 transition-all duration-200"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-purple-400 mb-3 flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                </div>
                <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Enterprise-Grade Features
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Everything you need to run and scale your digital agency efficiently
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="group glass-effect p-6 rounded-xl premium-shadow hover:bg-purple-900/20 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-purple-400 mb-4 group-hover:text-purple-300 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Integrations */}
      <section className="py-16 px-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Seamless Integrations
            </h2>
            <p className="text-lg text-slate-300">Connect with your favorite tools and platforms</p>
          </motion.div>
          
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {integrations.map((integration, index) => (
              <motion.div 
                key={index}
                className="glass-effect p-4 rounded-lg text-center premium-shadow group hover:scale-105 transition-all duration-200"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="text-2xl mb-2">{integration.logo}</div>
                <div className="text-xs text-white font-medium">{integration.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Testimonials */}
      <section id="testimonials" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-slate-300">See what our customers say about their success</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                className="glass-effect p-6 rounded-xl premium-shadow hover:y:-3 transition-all duration-200"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full border-2 border-purple-400"
                  />
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-purple-400 text-sm">{testimonial.role}</p>
                    <p className="text-slate-400 text-sm">{testimonial.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Pricing */}
      <section id="pricing" className="py-20 px-6 bg-gradient-to-r from-slate-800/40 to-slate-700/30">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Transparent Pricing
            </h2>
            <p className="text-xl text-slate-300 mb-6">Choose the plan that fits your agency's needs</p>
            
            <div className="inline-flex items-center space-x-2 bg-green-900/30 border border-green-500/30 px-4 py-2 rounded-full">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-300 text-sm font-medium">30-day money-back guarantee</span>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div 
                key={index}
                className={`relative bg-slate-800/60 backdrop-blur-sm border rounded-xl p-6 hover:bg-slate-800/80 transition-all duration-200 ${
                  plan.popular 
                    ? 'border-purple-500/50 ring-1 ring-purple-500/20 scale-105' 
                    : 'border-slate-700/50 hover:border-slate-600/50'
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                      <Award className="w-4 h-4" />
                      <span>Most Popular</span>
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-400 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400 ml-1">{plan.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => handleGetStarted(plan.name)}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl' 
                      : 'bg-slate-700/60 text-white hover:bg-slate-700/80 border border-slate-600/50'
                  }`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Contact Section */}
      <section id="contact" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to Transform Your Agency?
            </h2>
            <p className="text-xl text-slate-300">Get in touch with our team of experts</p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div 
              className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 p-8 rounded-xl"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <MessageCircle className="w-6 h-6 text-purple-400 mr-3" />
                Send us a message
              </h3>
              
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label className="block text-slate-300 mb-2 font-medium">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-4 bg-slate-700/60 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-300 mb-2 font-medium">Business Email</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-4 bg-slate-700/60 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="your@company.com"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-300 mb-2 font-medium">Message</label>
                  <textarea 
                    rows={4} 
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full p-4 bg-slate-700/60 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                    placeholder="Tell us about your agency and how we can help..."
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </motion.div>
            
            {/* Contact Info */}
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-6">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Email</p>
                      <a 
                        href="mailto:iverton053@gmail.com" 
                        className="text-white hover:text-purple-400 transition-colors font-medium"
                      >
                        iverton053@gmail.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Phone</p>
                      <a 
                        href="tel:+919057543220" 
                        className="text-white hover:text-purple-400 transition-colors font-medium"
                      >
                        +91 9057543220
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-6">Follow Us</h3>
                <div className="flex space-x-4">
                  {[
                    { icon: <Linkedin className="w-5 h-5" />, href: "https://linkedin.com", name: "LinkedIn" },
                    { icon: <Twitter className="w-5 h-5" />, href: "https://twitter.com", name: "Twitter" },
                    { icon: <Instagram className="w-5 h-5" />, href: "https://instagram.com", name: "Instagram" }
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 hover:scale-110"
                      title={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="py-12 px-6 border-t border-slate-700/50 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img src="/logo.png" alt="Iverton AI" className="h-8 w-8" />
                <span className="text-xl font-semibold text-white">Iverton AI</span>
                <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-medium rounded-full">Enterprise</span>
              </div>
              <p className="text-slate-400 max-w-sm leading-relaxed">
                The most comprehensive AI-powered platform for digital agencies. 
                Transform your operations and scale your business with enterprise-grade tools.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                {[
                  { label: 'Features', action: () => smoothScrollTo('features') },
                  { label: 'Pricing', action: () => smoothScrollTo('pricing') },
                  { label: 'Integrations', href: '#integrations' },
                  { label: 'API Docs', href: '#api-docs' }
                ].map((link, index) => (
                  <li key={index}>
                    {link.href ? (
                      <a 
                        href={link.href}
                        className="text-slate-400 hover:text-white transition-colors text-sm"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <button 
                        onClick={link.action}
                        className="text-slate-400 hover:text-white transition-colors text-sm"
                      >
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                {[
                  { label: 'About Us', action: () => smoothScrollTo('about') },
                  { label: 'Blog', href: '#blog' },
                  { label: 'Careers', href: '#careers' },
                  { label: 'Support', action: () => smoothScrollTo('contact') }
                ].map((link, index) => (
                  <li key={index}>
                    {link.href ? (
                      <a 
                        href={link.href}
                        className="text-slate-400 hover:text-white transition-colors text-sm"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <button 
                        onClick={link.action}
                        className="text-slate-400 hover:text-white transition-colors text-sm"
                      >
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-700/50">
            <p className="text-slate-400 mb-4 md:mb-0">
              © 2025 Iverton AI. All rights reserved.
            </p>
            <div className="flex space-x-6">
              {[
                { label: 'Privacy Policy', href: '/?page=privacy' },
                { label: 'Terms of Service', href: '/?page=terms' },
                { label: 'Security', href: '#security' }
              ].map((link, index) => (
                <a 
                  key={index}
                  href={link.href}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PremiumLandingPage;