import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, useAnimation } from 'framer-motion';
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
  Smartphone,
  Rocket,
  Award,
  Clock,
  DollarSign,
  PieChart,
  Calendar,
  Cloud,
  Code,
  Layers,
  Monitor,
  Workflow,
  Lightbulb,
  CheckCircle,
  ArrowUpRight,
  Sparkles,
  MousePointer,
  Gauge
} from 'lucide-react';

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

// Floating Particles Component
const FloatingParticles = () => {
  const particles = Array.from({ length: 50 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
      animate={{
        y: [0, -100, 0],
        x: [0, Math.random() * 100 - 50, 0],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: Math.random() * 5 + 3,
        repeat: Infinity,
        delay: Math.random() * 2,
        ease: "easeInOut",
      }}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
    />
  ));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles}
    </div>
  );
};

// Interactive Feature Card with 3D Effect
const InteractiveFeatureCard = ({ feature, index }: { feature: any; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div 
        className="glass-effect p-8 rounded-3xl premium-shadow relative overflow-hidden"
        whileHover={{ 
          y: -15, 
          scale: 1.02,
          rotateX: 5,
          rotateY: 5,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100"
          initial={{ scale: 0 }}
          animate={{ scale: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Floating icon */}
        <motion.div 
          className="text-purple-400 mb-6 relative z-10"
          animate={{ 
            y: isHovered ? -5 : 0,
            rotate: isHovered ? 360 : 0,
            scale: isHovered ? 1.2 : 1
          }}
          transition={{ duration: 0.6 }}
        >
          {feature.icon}
        </motion.div>
        
        <h3 className="text-xl font-bold text-white mb-4 relative z-10">{feature.title}</h3>
        <p className="text-gray-300 leading-relaxed relative z-10">{feature.description}</p>
        
        {/* Hover indicator */}
        <motion.div
          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100"
          initial={{ x: 20 }}
          animate={{ x: isHovered ? 0 : 20 }}
        >
          <ArrowUpRight className="w-5 h-5 text-purple-400" />
        </motion.div>
        
        {/* Sparkle effects */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-purple-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

const EnhancedLandingPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('Form submitted:', formData);
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
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const features = [
    {
      icon: <Bot className="w-10 h-10" />,
      title: "AI Automations",
      description: "Intelligent workflow automation that learns from your business patterns and optimizes processes automatically with machine learning algorithms."
    },
    {
      icon: <Users className="w-10 h-10" />,
      title: "Team Management", 
      description: "Comprehensive team collaboration tools with role-based access, real-time task tracking, and advanced performance analytics."
    },
    {
      icon: <Database className="w-10 h-10" />,
      title: "Advanced CRM",
      description: "Smart customer relationship management with AI-powered insights, predictive analytics, and automated lead scoring."
    },
    {
      icon: <Target className="w-10 h-10" />,
      title: "Ad Campaigns",
      description: "Multi-platform advertising management with automated optimization, A/B testing, and real-time performance tracking."
    },
    {
      icon: <Search className="w-10 h-10" />,
      title: "SEO Tools",
      description: "AI-powered SEO analysis, competitive research, keyword optimization, and content recommendations for maximum visibility."
    },
    {
      icon: <BarChart3 className="w-10 h-10" />,
      title: "Analytics Hub",
      description: "Comprehensive analytics dashboard with customizable reports, predictive insights, and actionable business intelligence."
    },
    {
      icon: <UserCheck className="w-10 h-10" />,
      title: "Client Portal",
      description: "Branded client portals with project tracking, secure communication tools, automated reporting, and real-time updates."
    },
    {
      icon: <Lock className="w-10 h-10" />,
      title: "Security & Compliance",
      description: "Enterprise-grade security with SOC 2 compliance, end-to-end encryption, audit trails, and advanced threat protection."
    }
  ];

  const stats = [
    { number: 10000, suffix: '+', label: 'Active Users', icon: <Users className="w-6 h-6" /> },
    { number: 500, suffix: '%', label: 'ROI Increase', icon: <TrendingUp className="w-6 h-6" /> },
    { number: 24, suffix: '/7', label: 'Support Available', icon: <Clock className="w-6 h-6" /> },
    { number: 99.9, suffix: '%', label: 'Uptime Guarantee', icon: <Shield className="w-6 h-6" /> }
  ];

  const howItWorksSteps = [
    {
      step: 1,
      title: "Connect Your Tools",
      description: "Seamlessly integrate with your existing tools and platforms in just a few clicks.",
      icon: <Workflow className="w-8 h-8" />
    },
    {
      step: 2,
      title: "AI Learns Your Business",
      description: "Our AI analyzes your workflows and identifies optimization opportunities.",
      icon: <Lightbulb className="w-8 h-8" />
    },
    {
      step: 3,
      title: "Automate Everything",
      description: "Watch as your processes become automated and your productivity soars.",
      icon: <Rocket className="w-8 h-8" />
    },
    {
      step: 4,
      title: "Scale & Grow",
      description: "Use insights and automation to scale your agency to new heights.",
      icon: <TrendingUp className="w-8 h-8" />
    }
  ];

  const integrations = [
    { name: 'Google Analytics', logo: '📊', category: 'Analytics' },
    { name: 'Facebook Ads', logo: '📘', category: 'Advertising' },
    { name: 'Slack', logo: '💬', category: 'Communication' },
    { name: 'HubSpot', logo: '🟠', category: 'CRM' },
    { name: 'Zapier', logo: '⚡', category: 'Automation' },
    { name: 'Salesforce', logo: '☁️', category: 'CRM' },
    { name: 'Google Ads', logo: '🎯', category: 'Advertising' },
    { name: 'Mailchimp', logo: '📧', category: 'Email Marketing' }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, DigitalFlow Agency",
      company: "DigitalFlow",
      content: "Iverton AI completely transformed our agency operations. We've increased productivity by 300% and reduced operational costs by 40%. The AI automations are simply incredible.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b2e5?w=64&h=64&fit=crop&crop=face",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Founder, GrowthHack Pro",
      company: "GrowthHack Pro", 
      content: "The AI-powered SEO tools alone have doubled our client retention. This platform is a game-changer for digital agencies looking to stay competitive.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Operations Director, ScaleUp Marketing",
      company: "ScaleUp Marketing", 
      content: "Finally, an all-in-one solution that actually works. Our team collaboration has never been smoother, and our clients love the transparency.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
      rating: 5
    },
    {
      name: "David Kim",
      role: "Creative Director, Pixel Perfect",
      company: "Pixel Perfect",
      content: "The analytics and reporting features have given us insights we never had before. We can now make data-driven decisions that actually move the needle.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
      rating: 5
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
        "2 client portals",
        "Basic integrations"
      ],
      popular: false,
      color: "from-gray-600 to-gray-700"
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
        "API access",
        "Custom integrations"
      ],
      popular: true,
      color: "from-purple-600 to-blue-600"
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
        "On-premise deployment",
        "24/7 phone support"
      ],
      popular: false,
      color: "from-gold-600 to-yellow-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* SEO Meta Tags */}
      <title>Iverton AI - Revolutionary Agency OS | AI-Powered Business Automation</title>
      <meta name="description" content="Transform your digital agency with Iverton AI's comprehensive platform featuring advanced AI automations, CRM, analytics, and more." />
      <meta name="keywords" content="AI automation, digital agency, CRM, SEO tools, analytics, client portal, business automation" />
      
      {/* Floating Particles Background */}
      <FloatingParticles />
      
      {/* Navigation with Enhanced Animations */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 glass-effect backdrop-blur-xl"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <motion.img 
                src="/logo.png" 
                alt="Iverton AI Logo" 
                className="h-10 w-10"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <span className="text-2xl font-bold text-white">Iverton AI</span>
              <motion.div 
                className="px-2 py-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-xs text-white"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                BETA
              </motion.div>
            </motion.div>
            
            <div className="hidden md:flex items-center space-x-8">
              {['Features', 'How It Works', 'Pricing', 'Contact'].map((item, index) => (
                <motion.a 
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="text-gray-300 hover:text-white transition-colors relative group"
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  {item}
                  <motion.div 
                    className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-full"
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              ))}
              
              <motion.button 
                className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3 rounded-full text-white font-semibold premium-glow relative overflow-hidden group"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 flex items-center space-x-2">
                  <span>Get Started Free</span>
                  <Sparkles className="w-4 h-4" />
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Enhanced Hero Section */}
      <motion.section 
        className="relative pt-32 pb-32 px-4 sm:px-6 lg:px-8 text-center overflow-hidden"
        style={{ y, opacity }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{ duration: 4, repeat: Infinity, delay: 2 }}
          />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="mb-8">
              <motion.div 
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full border border-purple-400/30 mb-8"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Rocket className="w-5 h-5 text-purple-400" />
                <span className="text-purple-300 font-medium">Launching the Future of Agency Management</span>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </motion.div>
              </motion.div>
              
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight">
                The Future of
                <br />
                <motion.span 
                  className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    backgroundSize: '200% 200%',
                  }}
                >
                  Agency Operations
                </motion.span>
                <br />
                is Here
              </h1>
            </motion.div>
            
            <motion.p 
              className="text-2xl sm:text-3xl text-gray-300 mb-12 leading-relaxed max-w-4xl mx-auto"
              variants={fadeInUp}
            >
              Transform your digital agency with revolutionary AI-powered automation, 
              comprehensive CRM, and analytics that drive real results. 
              <span className="text-purple-400 font-semibold"> All in one intelligent platform.</span>
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
              variants={fadeInUp}
            >
              <motion.button 
                className="group bg-gradient-to-r from-purple-600 to-blue-600 px-12 py-5 rounded-full text-white text-xl font-bold flex items-center space-x-3 premium-glow relative overflow-hidden"
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 25px 50px rgba(139, 92, 246, 0.5)",
                  y: -5
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10">Start Free Trial</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="relative z-10"
                >
                  <ArrowRight className="w-6 h-6" />
                </motion.div>
              </motion.button>
              
              <motion.button 
                className="group glass-effect px-12 py-5 rounded-full text-white text-xl font-semibold flex items-center space-x-3 border border-purple-400/30"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <PlayCircle className="w-6 h-6 text-purple-400" />
                </motion.div>
                <span>Watch Demo</span>
              </motion.button>
            </motion.div>
            
            <motion.div 
              className="flex items-center justify-center space-x-8 text-gray-400"
              variants={fadeInUp}
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Setup in 5 minutes</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-sm"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="glass-effect p-8 rounded-3xl text-center premium-shadow group"
                variants={fadeInUp}
                whileHover={{ y: -10, scale: 1.05 }}
              >
                <motion.div 
                  className="text-purple-400 mb-4 flex justify-center"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                  {stat.icon}
                </motion.div>
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                  <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                </div>
                <p className="text-gray-300 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Enhanced Features Section */}
      <motion.section 
        id="features"
        className="py-32 px-4 sm:px-6 lg:px-8 relative"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full border border-purple-400/30 mb-8"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="text-purple-300 font-medium">Powerful Features</span>
            </motion.div>
            
            <h2 className="text-5xl sm:text-6xl font-bold text-white mb-6">
              Everything You Need to
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Dominate Your Market
              </span>
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto">
              Built for modern agencies who demand excellence, efficiency, and results
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <InteractiveFeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section 
        id="how-it-works"
        className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-900/50 to-purple-900/50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-20" variants={fadeInUp}>
            <h2 className="text-5xl sm:text-6xl font-bold text-white mb-6">
              How It
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Works</span>
            </h2>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
              Get started in minutes, see results in hours
            </p>
          </motion.div>
          
          <div className="relative">
            {/* Connection Line */}
            <motion.div 
              className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 hidden lg:block"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2, delay: 0.5 }}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {howItWorksSteps.map((step, index) => (
                <motion.div 
                  key={index}
                  className="text-center relative"
                  variants={fadeInUp}
                  custom={index}
                >
                  <motion.div 
                    className="glass-effect p-8 rounded-3xl premium-shadow mb-6 relative overflow-hidden group"
                    whileHover={{ y: -10, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 relative"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <motion.div
                        animate={{ rotate: [0, -360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      >
                        {step.icon}
                      </motion.div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">
                        {step.step}
                      </div>
                    </motion.div>
                    
                    <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                    <p className="text-gray-300">{step.description}</p>
                    
                    {/* Hover effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 pointer-events-none"
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Integrations Section */}
      <motion.section 
        className="py-32 px-4 sm:px-6 lg:px-8"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div variants={fadeInUp}>
            <h2 className="text-5xl sm:text-6xl font-bold text-white mb-6">
              Seamless
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Integrations</span>
            </h2>
            <p className="text-2xl text-gray-300 mb-16 max-w-4xl mx-auto">
              Connect with all your favorite tools and platforms
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6"
            variants={staggerContainer}
          >
            {integrations.map((integration, index) => (
              <motion.div 
                key={index}
                className="glass-effect p-6 rounded-2xl premium-shadow group text-center"
                variants={fadeInUp}
                whileHover={{ y: -10, scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-4xl mb-3">{integration.logo}</div>
                <div className="text-sm text-white font-medium mb-1">{integration.name}</div>
                <div className="text-xs text-gray-400">{integration.category}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced Testimonials Section */}
      <motion.section 
        className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900/30 to-blue-900/30"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-20" variants={fadeInUp}>
            <h2 className="text-5xl sm:text-6xl font-bold text-white mb-6">
              Loved by
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Agencies Worldwide</span>
            </h2>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
              Join thousands of successful agencies already using Iverton AI
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                className="glass-effect p-8 rounded-3xl premium-shadow group relative overflow-hidden"
                variants={fadeInUp}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />
                
                <div className="flex items-center mb-6 relative z-10">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 + 0.5 }}
                    >
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    </motion.div>
                  ))}
                </div>
                
                <p className="text-gray-300 mb-8 leading-relaxed text-lg italic relative z-10">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center space-x-4 relative z-10">
                  <motion.img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full border-2 border-purple-400"
                    whileHover={{ scale: 1.1 }}
                  />
                  <div>
                    <p className="text-white font-bold text-lg">{testimonial.name}</p>
                    <p className="text-purple-400 font-medium">{testimonial.role}</p>
                    <p className="text-gray-400 text-sm">{testimonial.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Enhanced Pricing Section */}
      <motion.section 
        id="pricing"
        className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-900/50 to-purple-900/50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-20" variants={fadeInUp}>
            <h2 className="text-5xl sm:text-6xl font-bold text-white mb-6">
              Simple, Transparent
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Pricing</span>
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto mb-8">
              Choose the plan that fits your agency's needs. Scale up or down anytime.
            </p>
            
            <motion.div 
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-full border border-green-400/30"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <DollarSign className="w-5 h-5 text-green-400" />
              </motion.div>
              <span className="text-green-300 font-medium">30-day money-back guarantee</span>
            </motion.div>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div 
                key={index}
                className={`glass-effect p-10 rounded-3xl premium-shadow relative overflow-hidden group ${
                  plan.popular ? 'ring-2 ring-purple-400 scale-105 lg:scale-110' : ''
                }`}
                variants={fadeInUp}
                whileHover={{ 
                  y: -15, 
                  scale: plan.popular ? 1.05 : 1.02,
                  rotateY: 5 
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Animated background */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-10 group-hover:opacity-20`}
                  transition={{ duration: 0.3 }}
                />
                
                {plan.popular && (
                  <motion.div 
                    className="absolute -top-6 left-1/2 transform -translate-x-1/2"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-full text-white text-sm font-bold flex items-center space-x-2">
                      <Award className="w-4 h-4" />
                      <span>Most Popular</span>
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </motion.div>
                )}
                
                <div className="text-center mb-8 relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-3">{plan.name}</h3>
                  <p className="text-gray-300 mb-6">{plan.description}</p>
                  <div className="flex items-baseline justify-center mb-4">
                    <motion.span 
                      className="text-6xl font-bold text-white"
                      whileHover={{ scale: 1.1 }}
                    >
                      {plan.price}
                    </motion.span>
                    <span className="text-gray-300 ml-2 text-xl">{plan.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8 relative z-10">
                  {plan.features.map((feature, featureIndex) => (
                    <motion.li 
                      key={featureIndex} 
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: featureIndex * 0.1 }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: featureIndex * 0.2 }}
                      >
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      </motion.div>
                      <span className="text-gray-300">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
                
                <motion.button 
                  className={`w-full py-5 rounded-2xl font-bold text-lg transition-all relative z-10 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white premium-glow' 
                      : 'glass-effect text-white hover:bg-purple-600/20'
                  }`}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: plan.popular ? "0 20px 40px rgba(139, 92, 246, 0.4)" : undefined
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div className="flex items-center justify-center space-x-2">
                    <span>{plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </motion.div>
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Enhanced Contact Section */}
      <motion.section 
        id="contact"
        className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900/30 to-blue-900/30"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-20" variants={fadeInUp}>
            <h2 className="text-5xl sm:text-6xl font-bold text-white mb-6">
              Ready to Transform
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Your Agency?
              </span>
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto">
              Join the revolution. Get in touch with our team and discover how Iverton AI 
              can transform your operations forever.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Enhanced Contact Form */}
            <motion.div 
              className="glass-effect p-10 rounded-3xl premium-shadow relative overflow-hidden group"
              variants={fadeInUp}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.3 }}
              />
              
              <h3 className="text-3xl font-bold text-white mb-8 relative z-10 flex items-center">
                <MessageCircle className="w-8 h-8 text-purple-400 mr-3" />
                Send us a message
              </h3>
              
              <form onSubmit={handleFormSubmit} className="space-y-6 relative z-10">
                <motion.div whileHover={{ scale: 1.02 }} whileFocus={{ scale: 1.02 }}>
                  <label className="block text-gray-300 mb-3 font-medium">Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-5 rounded-2xl glass-effect text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all"
                    placeholder="Your full name"
                  />
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileFocus={{ scale: 1.02 }}>
                  <label className="block text-gray-300 mb-3 font-medium">Email</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-5 rounded-2xl glass-effect text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all"
                    placeholder="your@email.com"
                  />
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileFocus={{ scale: 1.02 }}>
                  <label className="block text-gray-300 mb-3 font-medium">Message</label>
                  <textarea 
                    rows={6} 
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full p-5 rounded-2xl glass-effect text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none resize-none transition-all"
                    placeholder="Tell us about your agency and how we can help transform your operations..."
                  />
                </motion.div>
                
                <motion.button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-5 rounded-2xl text-white font-bold text-lg premium-glow disabled:opacity-50 relative overflow-hidden group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                    {!isSubmitting && <Rocket className="w-5 h-5" />}
                  </span>
                </motion.button>
              </form>
            </motion.div>
            
            {/* Enhanced Contact Information */}
            <motion.div className="space-y-8" variants={fadeInUp}>
              <motion.div 
                className="glass-effect p-10 rounded-3xl premium-shadow relative overflow-hidden group"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />
                
                <h3 className="text-3xl font-bold text-white mb-8 relative z-10">Get in touch</h3>
                <div className="space-y-8 relative z-10">
                  <motion.div 
                    className="flex items-center space-x-4 group/item"
                    whileHover={{ x: 10 }}
                  >
                    <motion.div 
                      className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Mail className="w-7 h-7 text-white" />
                    </motion.div>
                    <div>
                      <p className="text-gray-300 font-medium">Email</p>
                      <motion.a 
                        href="mailto:iverton053@gmail.com" 
                        className="text-white text-lg hover:text-purple-400 transition-colors"
                        whileHover={{ scale: 1.05 }}
                      >
                        iverton053@gmail.com
                      </motion.a>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center space-x-4 group/item"
                    whileHover={{ x: 10 }}
                  >
                    <motion.div 
                      className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Phone className="w-7 h-7 text-white" />
                    </motion.div>
                    <div>
                      <p className="text-gray-300 font-medium">Phone</p>
                      <motion.a 
                        href="tel:+919057543220" 
                        className="text-white text-lg hover:text-purple-400 transition-colors"
                        whileHover={{ scale: 1.05 }}
                      >
                        +91 9057543220
                      </motion.a>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
              
              <motion.div 
                className="glass-effect p-10 rounded-3xl premium-shadow relative overflow-hidden group"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />
                
                <h3 className="text-2xl font-bold text-white mb-8 relative z-10">Follow our journey</h3>
                <div className="flex space-x-4 relative z-10">
                  {[
                    { icon: <Linkedin className="w-6 h-6" />, href: "#", color: "from-blue-600 to-blue-700" },
                    { icon: <Twitter className="w-6 h-6" />, href: "#", color: "from-sky-600 to-sky-700" },
                    { icon: <Instagram className="w-6 h-6" />, href: "#", color: "from-pink-600 to-purple-600" }
                  ].map((social, index) => (
                    <motion.a 
                      key={index}
                      href={social.href} 
                      className={`w-16 h-16 bg-gradient-to-r ${social.color} rounded-2xl flex items-center justify-center text-white relative overflow-hidden group`}
                      whileHover={{ 
                        scale: 1.15, 
                        rotate: 360,
                        y: -5
                      }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100"
                        transition={{ duration: 0.3 }}
                      />
                      <span className="relative z-10">{social.icon}</span>
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Enhanced Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-700 bg-gradient-to-r from-slate-900 to-purple-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <motion.div 
                className="flex items-center space-x-3 mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <motion.img 
                  src="/logo.png" 
                  alt="Iverton AI Logo" 
                  className="h-10 w-10"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <span className="text-3xl font-bold text-white">Iverton AI</span>
                <motion.div 
                  className="px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-xs text-white"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  BETA
                </motion.div>
              </motion.div>
              <p className="text-gray-300 max-w-md leading-relaxed text-lg">
                Revolutionizing digital agencies with AI-powered automation, 
                comprehensive business management tools, and intelligent insights 
                that drive real growth.
              </p>
            </div>
            
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "API Docs", "Integrations", "Security"]
              },
              {
                title: "Company", 
                links: ["About", "Blog", "Careers", "Contact", "Support"]
              }
            ].map((section, index) => (
              <div key={index}>
                <h4 className="text-white font-bold mb-6 text-lg">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <motion.a 
                        href="#" 
                        className="text-gray-300 hover:text-white transition-colors hover:underline"
                        whileHover={{ x: 5 }}
                      >
                        {link}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-700">
            <p className="text-gray-300 mb-4 md:mb-0 text-lg">
              © 2025 Iverton AI. All rights reserved. Built with ❤️ for agencies.
            </p>
            <div className="flex space-x-8">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((link, index) => (
                <motion.a 
                  key={index}
                  href="#" 
                  className="text-gray-300 hover:text-white transition-colors"
                  whileHover={{ y: -2 }}
                >
                  {link}
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EnhancedLandingPage;