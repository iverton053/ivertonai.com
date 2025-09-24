import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Check, 
  Star, 
  Shield, 
  Zap, 
  Users, 
  BarChart3, 
  Target, 
  Eye, 
  Lock, 
  Globe, 
  MessageCircle,
  Phone,
  Mail,
  Linkedin,
  Twitter,
  Instagram,
  ChevronRight,
  PlayCircle,
  Bot,
  CreditCard,
  TrendingUp,
  Search,
  UserCheck,
  Database,
  Settings,
  Smartphone
} from 'lucide-react';

const LandingPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Placeholder for form submission - integrate with Supabase later
    try {
      console.log('Form submitted:', formData);
      // Add your Supabase integration here
      alert('Thank you for your message! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
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
      icon: <Bot className="w-8 h-8" />,
      title: "AI Automations",
      description: "Intelligent workflow automation that learns from your business patterns and optimizes processes automatically."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team Management", 
      description: "Comprehensive team collaboration tools with role-based access, task tracking, and performance analytics."
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Advanced CRM",
      description: "Smart customer relationship management with AI-powered insights and predictive analytics."
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Ad Campaigns",
      description: "Multi-platform advertising management with automated optimization and real-time performance tracking."
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "SEO Tools",
      description: "AI-powered SEO analysis, keyword research, and content optimization for maximum visibility."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics Hub",
      description: "Comprehensive analytics dashboard with customizable reports and predictive insights."
    },
    {
      icon: <UserCheck className="w-8 h-8" />,
      title: "Client Portal",
      description: "Branded client portals with project tracking, communication tools, and automated reporting."
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Security & Compliance",
      description: "Enterprise-grade security with SOC 2 compliance, data encryption, and audit trails."
    }
  ];

  const whyChooseUs = [
    {
      icon: <Settings className="w-6 h-6" />,
      title: "All-in-One Agency OS",
      description: "Replace 15+ tools with our comprehensive platform designed specifically for digital agencies."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "AI-Powered SEO",
      description: "Advanced AI algorithms analyze and optimize your SEO strategy in real-time."
    },
    {
      icon: <Bot className="w-6 h-6" />,
      title: "Automation-First Workflows",
      description: "Built from the ground up with automation at its core to maximize efficiency."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Premium Analytics",
      description: "Enterprise-level reporting and insights that drive data-informed decisions."
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$99",
      period: "/month",
      description: "Perfect for small agencies getting started",
      features: [
        "Up to 5 team members",
        "Basic AI automations",
        "CRM for up to 1,000 contacts",
        "Standard analytics",
        "Email support",
        "2 client portals"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$299",
      period: "/month",
      description: "Ideal for growing agencies",
      features: [
        "Up to 25 team members",
        "Advanced AI automations",
        "CRM for up to 10,000 contacts",
        "Advanced analytics & reporting",
        "Priority support",
        "10 client portals",
        "White-label options",
        "API access"
      ],
      popular: true
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
        "Dedicated account manager",
        "Unlimited client portals",
        "Full white-label solution",
        "On-premise deployment option"
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, DigitalFlow Agency",
      company: "DigitalFlow",
      content: "Iverton AI transformed our agency operations. We've increased productivity by 300% and reduced operational costs by 40%.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b2e5?w=64&h=64&fit=crop&crop=face"
    },
    {
      name: "Michael Chen",
      role: "Founder, GrowthHack Pro",
      company: "GrowthHack Pro",
      content: "The AI-powered SEO tools alone have doubled our client retention. This platform is a game-changer for digital agencies.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face"
    },
    {
      name: "Emily Rodriguez",
      role: "Operations Director, ScaleUp Marketing",
      company: "ScaleUp Marketing", 
      content: "Finally, an all-in-one solution that actually works. Our team collaboration has never been smoother.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* SEO Meta Tags */}
      <title>Iverton AI - All-in-One Agency OS | AI-Powered Business Automation</title>
      <meta name="description" content="Transform your digital agency with Iverton AI's comprehensive platform featuring AI automations, CRM, analytics, and more." />
      <meta name="keywords" content="AI automation, digital agency, CRM, SEO tools, analytics, client portal" />
      
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 glass-effect"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="Iverton AI Logo" className="h-8 w-8" />
              <span className="text-2xl font-bold text-white">Iverton AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
              <motion.button 
                className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2 rounded-full text-white font-medium premium-glow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeInUp}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
              The Future of
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Agency</span>
              <br />Operations is Here
            </h1>
          </motion.div>
          
          <motion.p 
            className="text-xl sm:text-2xl text-gray-300 mb-8 leading-relaxed"
            variants={fadeInUp}
          >
            Transform your digital agency with AI-powered automation, comprehensive CRM, 
            and analytics that drive real results. All in one intelligent platform.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={fadeInUp}
          >
            <motion.button 
              className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 rounded-full text-white text-lg font-semibold flex items-center space-x-2 premium-glow"
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.4)" }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            
            <motion.button 
              className="glass-effect px-8 py-4 rounded-full text-white text-lg font-medium flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlayCircle className="w-5 h-5" />
              <span>Watch Demo</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        id="features"
        className="py-20 px-4 sm:px-6 lg:px-8"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Powerful Features for
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Modern Agencies</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to run and scale your digital agency efficiently
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="glass-effect p-6 rounded-3xl premium-shadow group"
                variants={fadeInUp}
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-purple-400 mb-4 group-hover:text-blue-400 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Screenshots/Preview Section */}
      <motion.section 
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900/30 to-blue-900/30"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div variants={fadeInUp}>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              See Iverton AI in Action
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Experience our intuitive dashboard and powerful features designed for modern agencies
            </p>
          </motion.div>
          
          <motion.div 
            className="glass-effect p-8 rounded-3xl premium-shadow"
            variants={fadeInUp}
            whileHover={{ scale: 1.02 }}
          >
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-12 h-12 text-white" />
                </div>
                <p className="text-white text-lg font-medium">Dashboard Preview Coming Soon</p>
                <p className="text-gray-400 mt-2">Interactive demo available on request</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Why Choose Us Section */}
      <motion.section 
        className="py-20 px-4 sm:px-6 lg:px-8"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Why Choose
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Iverton AI?</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built by agency owners, for agency owners. Experience the difference.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {whyChooseUs.map((item, index) => (
              <motion.div 
                key={index}
                className="glass-effect p-8 rounded-3xl premium-shadow group"
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-purple-400 group-hover:text-blue-400 transition-colors flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section 
        id="pricing"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-900/50 to-purple-900/50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Simple, Transparent
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Pricing</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose the plan that fits your agency's needs. Upgrade or downgrade anytime.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div 
                key={index}
                className={`glass-effect p-8 rounded-3xl premium-shadow relative ${plan.popular ? 'ring-2 ring-purple-400 scale-105' : ''}`}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-full text-white text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-300 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-300 ml-1">{plan.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <motion.button 
                  className={`w-full py-4 rounded-full font-semibold transition-all ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white premium-glow' 
                      : 'glass-effect text-white hover:bg-purple-600/20'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section 
        className="py-20 px-4 sm:px-6 lg:px-8"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Trusted by
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Leading Agencies</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See what our customers have to say about their experience with Iverton AI
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                className="glass-effect p-8 rounded-3xl premium-shadow"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed italic">"{testimonial.content}"</p>
                <div className="flex items-center space-x-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section 
        id="contact"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900/30 to-blue-900/30"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Ready to Transform
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Your Agency?</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get in touch with our team and discover how Iverton AI can revolutionize your operations
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div className="glass-effect p-8 rounded-3xl premium-shadow" variants={fadeInUp}>
              <h3 className="text-2xl font-bold text-white mb-6">Send us a message</h3>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-300 mb-2">Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-4 rounded-xl glass-effect text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Email</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-4 rounded-xl glass-effect text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Message</label>
                  <textarea 
                    rows={4} 
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full p-4 rounded-xl glass-effect text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none resize-none"
                    placeholder="Tell us about your agency and how we can help..."
                  />
                </div>
                <motion.button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-4 rounded-xl text-white font-semibold premium-glow disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </motion.button>
              </form>
            </motion.div>
            
            {/* Contact Information */}
            <motion.div className="space-y-8" variants={fadeInUp}>
              <div className="glass-effect p-8 rounded-3xl premium-shadow">
                <h3 className="text-2xl font-bold text-white mb-6">Get in touch</h3>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Mail className="w-6 h-6 text-purple-400" />
                    <div>
                      <p className="text-gray-300">Email</p>
                      <a href="mailto:iverton053@gmail.com" className="text-white hover:text-purple-400 transition-colors">
                        iverton053@gmail.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Phone className="w-6 h-6 text-purple-400" />
                    <div>
                      <p className="text-gray-300">Phone</p>
                      <a href="tel:+919057543220" className="text-white hover:text-purple-400 transition-colors">
                        +91 9057543220
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="glass-effect p-8 rounded-3xl premium-shadow">
                <h3 className="text-xl font-bold text-white mb-6">Follow us</h3>
                <div className="flex space-x-4">
                  <motion.a 
                    href="#" 
                    className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Linkedin className="w-5 h-5" />
                  </motion.a>
                  <motion.a 
                    href="#" 
                    className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Twitter className="w-5 h-5" />
                  </motion.a>
                  <motion.a 
                    href="#" 
                    className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Instagram className="w-5 h-5" />
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-700">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img src="/logo.png" alt="Iverton AI Logo" className="h-8 w-8" />
                <span className="text-2xl font-bold text-white">Iverton AI</span>
              </div>
              <p className="text-gray-300 max-w-md">
                Empowering digital agencies with AI-powered automation and comprehensive business management tools.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">API Docs</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-700">
            <p className="text-gray-300 mb-4 md:mb-0">
              © 2025 Iverton AI. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;