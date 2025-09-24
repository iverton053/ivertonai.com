import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
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
  Sparkles,
  Code,
  Globe
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

// Floating Particles Component (Reduced)
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-0.5 h-0.5 bg-purple-400/20 rounded-full"
      animate={{
        y: [0, -80, 0],
        x: [0, Math.random() * 60 - 30, 0],
        opacity: [0, 0.8, 0],
      }}
      transition={{
        duration: Math.random() * 4 + 3,
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

// Interactive Feature Card (Compact)
const FeatureCard = ({ feature, index }: { feature: any; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div 
        className="glass-effect p-5 rounded-xl premium-shadow relative overflow-hidden"
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100"
          transition={{ duration: 0.3 }}
        />
        
        <motion.div 
          className="text-purple-400 mb-3 relative z-10"
          animate={{ 
            y: isHovered ? -3 : 0,
            scale: isHovered ? 1.1 : 1
          }}
          transition={{ duration: 0.4 }}
        >
          {feature.icon}
        </motion.div>
        
        <h3 className="text-lg font-semibold text-white mb-2 relative z-10">{feature.title}</h3>
        <p className="text-gray-300 text-sm leading-relaxed relative z-10">{feature.description}</p>
        
        <motion.div
          className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100"
          animate={{ x: isHovered ? 0 : 15 }}
        >
          <ArrowUpRight className="w-4 h-4 text-purple-400" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const RefinedLandingPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

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
    initial: { opacity: 0, y: 40 },
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
      icon: <Bot className="w-7 h-7" />,
      title: "AI Automations",
      description: "Intelligent workflow automation that learns and optimizes your business processes automatically."
    },
    {
      icon: <Users className="w-7 h-7" />,
      title: "Team Management", 
      description: "Comprehensive collaboration tools with role-based access and performance tracking."
    },
    {
      icon: <Database className="w-7 h-7" />,
      title: "Advanced CRM",
      description: "Smart customer management with AI-powered insights and predictive analytics."
    },
    {
      icon: <Target className="w-7 h-7" />,
      title: "Ad Campaigns",
      description: "Multi-platform advertising with automated optimization and real-time tracking."
    },
    {
      icon: <Search className="w-7 h-7" />,
      title: "SEO Tools",
      description: "AI-powered SEO analysis, keyword research, and content optimization."
    },
    {
      icon: <BarChart3 className="w-7 h-7" />,
      title: "Analytics Hub",
      description: "Comprehensive dashboard with customizable reports and actionable insights."
    },
    {
      icon: <UserCheck className="w-7 h-7" />,
      title: "Client Portal",
      description: "Branded portals with project tracking, communication, and automated reporting."
    },
    {
      icon: <Lock className="w-7 h-7" />,
      title: "Security & Compliance",
      description: "Enterprise-grade security with SOC 2 compliance and advanced protection."
    }
  ];

  const stats = [
    { number: 10000, suffix: '+', label: 'Active Users', icon: <Users className="w-5 h-5" /> },
    { number: 500, suffix: '%', label: 'ROI Increase', icon: <TrendingUp className="w-5 h-5" /> },
    { number: 24, suffix: '/7', label: 'Support', icon: <Clock className="w-5 h-5" /> },
    { number: 99.9, suffix: '%', label: 'Uptime', icon: <Shield className="w-5 h-5" /> }
  ];

  const howItWorksSteps = [
    {
      step: 1,
      title: "Connect Your Tools",
      description: "Integrate with existing platforms in just a few clicks.",
      icon: <Workflow className="w-6 h-6" />
    },
    {
      step: 2,
      title: "AI Learns Your Business",
      description: "Our AI analyzes workflows and finds optimizations.",
      icon: <Lightbulb className="w-6 h-6" />
    },
    {
      step: 3,
      title: "Automate Everything",
      description: "Watch processes become automated and efficient.",
      icon: <Rocket className="w-6 h-6" />
    },
    {
      step: 4,
      title: "Scale & Grow",
      description: "Use insights to scale your agency to new heights.",
      icon: <TrendingUp className="w-6 h-6" />
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
    { name: 'Mailchimp', logo: '📧', category: 'Email' }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, DigitalFlow Agency",
      content: "Iverton AI transformed our operations. We've increased productivity by 300% and reduced costs by 40%.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b2e5?w=48&h=48&fit=crop&crop=face",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Founder, GrowthHack Pro",
      content: "The AI-powered SEO tools alone have doubled our client retention. This platform is a game-changer.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Operations Director, ScaleUp",
      content: "Finally, an all-in-one solution that actually works. Our team collaboration has never been smoother.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&h=48&fit=crop&crop=face",
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
        "CRM for 1,000 contacts",
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
        "CRM for 10,000 contacts",
        "Advanced analytics",
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
        "Custom AI training",
        "Unlimited contacts",
        "Custom dashboards",
        "Dedicated manager",
        "Unlimited portals",
        "Full white-label",
        "On-premise option"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* SEO Meta Tags */}
      <title>Iverton AI - All-in-One Agency OS | AI-Powered Business Automation</title>
      <meta name="description" content="Transform your digital agency with Iverton AI's comprehensive platform featuring AI automations, CRM, analytics, and more." />
      
      {/* Floating Particles Background */}
      <FloatingParticles />
      
      {/* Compact Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 glass-effect backdrop-blur-xl"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.03 }}
            >
              <motion.img 
                src="/logo.png" 
                alt="Iverton AI Logo" 
                className="h-8 w-8"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <span className="text-xl font-bold text-white">Iverton AI</span>
              <div className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-[10px] text-white font-medium">
                BETA
              </div>
            </motion.div>
            
            <div className="hidden md:flex items-center space-x-6">
              {['Features', 'How It Works', 'Pricing', 'Contact'].map((item, index) => (
                <motion.a 
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="text-gray-300 hover:text-white transition-colors relative group text-sm"
                  whileHover={{ y: -1 }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  {item}
                  <motion.div 
                    className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-full"
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              ))}
              
              <motion.button 
                className="bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2 rounded-full text-white text-sm font-semibold premium-glow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                Get Started Free
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Compact Hero Section */}
      <motion.section 
        className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 text-center overflow-hidden"
        style={{ y }}
      >
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <motion.div 
                className="inline-flex items-center space-x-2 px-4 py-1.5 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full border border-purple-400/30 mb-4"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Rocket className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300 font-medium text-xs">Launching the Future of Agency Management</span>
                <Sparkles className="w-3 h-3 text-purple-400" />
              </motion.div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                The Future of
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Agency Operations
                </span>
                <br />
                is Here
              </h1>
            </motion.div>
            
            <motion.p 
              className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              Transform your digital agency with revolutionary AI-powered automation, 
              comprehensive CRM, and analytics that drive real results. 
              <span className="text-purple-400 font-semibold"> All in one platform.</span>
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
              variants={fadeInUp}
            >
              <motion.button 
                className="group bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3 rounded-full text-white text-base font-bold flex items-center space-x-2 premium-glow"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              
              <motion.button 
                className="glass-effect px-8 py-3 rounded-full text-white text-base font-medium flex items-center space-x-2 border border-purple-400/30"
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <PlayCircle className="w-4 h-4 text-purple-400" />
                <span>Watch Demo</span>
              </motion.button>
            </motion.div>
            
            <motion.div 
              className="flex items-center justify-center space-x-6 text-gray-400 text-sm"
              variants={fadeInUp}
            >
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>5-min setup</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Compact Stats Section */}
      <motion.section 
        className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="glass-effect p-5 rounded-xl text-center premium-shadow"
                variants={fadeInUp}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="text-purple-400 mb-2 flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                </div>
                <p className="text-gray-300 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Compact Features Section */}
      <motion.section 
        id="features"
        className="py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full border border-purple-400/30 mb-4">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 font-medium text-xs">Powerful Features</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Everything You Need to
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Dominate Your Market
              </span>
            </h2>
            <p className="text-base text-gray-300 max-w-2xl mx-auto">
              Built for modern agencies who demand excellence and results
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* Compact How It Works */}
      <motion.section 
        id="how-it-works"
        className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-900/50 to-purple-900/50"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              How It
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Works</span>
            </h2>
            <p className="text-base text-gray-300">Get started in minutes, see results in hours</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorksSteps.map((step, index) => (
              <motion.div 
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div 
                  className="glass-effect p-5 rounded-xl premium-shadow mb-3 relative group"
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 relative">
                    {step.icon}
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold text-xs">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-300 text-xs">{step.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Compact Integrations */}
      <motion.section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Seamless
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Integrations</span>
            </h2>
            <p className="text-base text-gray-300">Connect with all your favorite tools</p>
          </motion.div>
          
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {integrations.map((integration, index) => (
              <motion.div 
                key={index}
                className="glass-effect p-3 rounded-lg premium-shadow group text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5, scale: 1.05 }}
              >
                <div className="text-2xl mb-1">{integration.logo}</div>
                <div className="text-[10px] text-white font-medium">{integration.name}</div>
                <div className="text-[8px] text-gray-400">{integration.category}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Compact Testimonials */}
      <motion.section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900/30 to-blue-900/30">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Loved by
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Agencies</span>
            </h2>
            <p className="text-base text-gray-300">Join thousands of successful agencies</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                className="glass-effect p-5 rounded-xl premium-shadow"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -3 }}
              >
                <div className="flex items-center mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 text-sm italic">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full border border-purple-400"
                  />
                  <div>
                    <p className="text-white font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-purple-400 text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Compact Pricing */}
      <motion.section 
        id="pricing"
        className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-900/50 to-purple-900/50"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Simple
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Pricing</span>
            </h2>
            <p className="text-base text-gray-300 mb-4">Choose the plan that fits your needs</p>
            
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-full border border-green-400/30">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-green-300 font-medium text-xs">30-day money-back guarantee</span>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {pricingPlans.map((plan, index) => (
              <motion.div 
                key={index}
                className={`glass-effect p-6 rounded-xl premium-shadow relative ${
                  plan.popular ? 'ring-2 ring-purple-400 scale-102' : ''
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: plan.popular ? 1.02 : 1.01 }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-1 rounded-full text-white text-xs font-bold flex items-center space-x-1">
                      <Award className="w-3 h-3" />
                      <span>Popular</span>
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-5">
                  <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-gray-300 mb-3 text-sm">{plan.description}</p>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-300 ml-1 text-sm">{plan.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-2 mb-5">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300 text-xs">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <motion.button 
                  className={`w-full py-2.5 rounded-lg font-semibold text-sm ${
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

      {/* Compact Contact Section */}
      <motion.section 
        id="contact"
        className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900/30 to-blue-900/30"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Ready to Transform
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Your Agency?
              </span>
            </h2>
            <p className="text-base text-gray-300">Get in touch and discover how Iverton AI can help</p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Contact Form */}
            <motion.div 
              className="glass-effect p-6 rounded-xl premium-shadow"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-xl font-bold text-white mb-5 flex items-center">
                <MessageCircle className="w-5 h-5 text-purple-400 mr-2" />
                Send us a message
              </h3>
              
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-1 font-medium text-sm">Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 rounded-lg glass-effect text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none text-sm"
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-1 font-medium text-sm">Email</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-3 rounded-lg glass-effect text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none text-sm"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-1 font-medium text-sm">Message</label>
                  <textarea 
                    rows={4} 
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full p-3 rounded-lg glass-effect text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:outline-none resize-none text-sm"
                    placeholder="Tell us about your agency..."
                  />
                </div>
                
                <motion.button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-3 rounded-lg text-white font-bold premium-glow disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </motion.button>
              </form>
            </motion.div>
            
            {/* Contact Info */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <div className="glass-effect p-6 rounded-xl premium-shadow">
                <h3 className="text-xl font-bold text-white mb-5">Get in touch</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm">Email</p>
                      <a href="mailto:iverton053@gmail.com" className="text-white hover:text-purple-400 transition-colors">
                        iverton053@gmail.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm">Phone</p>
                      <a href="tel:+919057543220" className="text-white hover:text-purple-400 transition-colors">
                        +91 9057543220
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="glass-effect p-6 rounded-xl premium-shadow">
                <h3 className="text-lg font-bold text-white mb-4">Follow us</h3>
                <div className="flex space-x-3">
                  {[
                    { icon: <Linkedin className="w-5 h-5" />, href: "#" },
                    { icon: <Twitter className="w-5 h-5" />, href: "#" },
                    { icon: <Instagram className="w-5 h-5" />, href: "#" }
                  ].map((social, index) => (
                    <motion.a 
                      key={index}
                      href={social.href} 
                      className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white"
                      whileHover={{ scale: 1.1, y: -2 }}
                    >
                      {social.icon}
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Compact Footer */}
      <footer className="py-10 px-4 sm:px-6 lg:px-8 border-t border-gray-700">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img src="/logo.png" alt="Iverton AI Logo" className="h-8 w-8" />
                <span className="text-xl font-bold text-white">Iverton AI</span>
                <div className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-[10px] text-white">
                  BETA
                </div>
              </div>
              <p className="text-gray-300 max-w-sm text-sm leading-relaxed">
                Revolutionizing digital agencies with AI-powered automation and intelligent business management.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Product</h4>
              <ul className="space-y-1">
                {["Features", "Pricing", "API", "Integrations"].map((link, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Company</h4>
              <ul className="space-y-1">
                {["About", "Blog", "Contact", "Support"].map((link, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-gray-700">
            <p className="text-gray-300 mb-3 md:mb-0 text-sm">
              © 2025 Iverton AI. All rights reserved.
            </p>
            <div className="flex space-x-6">
              {["Privacy", "Terms", "Cookies"].map((link, index) => (
                <a key={index} href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RefinedLandingPage;