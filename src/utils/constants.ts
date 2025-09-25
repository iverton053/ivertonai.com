export interface Automation {
  id: number;
  name: string;
  status: 'running' | 'completed' | 'paused' | 'scheduled';
  progress: number;
  lastRun: string;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  badge?: string | number;
  color?: string;
  quickAccess?: boolean;
}

export interface SidebarSection {
  id: string;
  label: string;
  icon?: string;
  items: SidebarItem[];
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface ColorClasses {
  purple: string;
  green: string;
  blue: string;
  orange: string;
}

export interface StatusColors {
  running: string;
  completed: string;
  paused: string;
  scheduled: string;
}

export interface ClientData {
  username: string;
  client_name: string;
  company: string;
  active_automations: number;
  success_rate: number;
  completed_today: number;
  time_saved: number;
  available_categories: string[];
  widgets: string[];
}

export const mockAutomations: Automation[] = [
  { id: 1, name: 'SEO Audit', status: 'running', progress: 78, lastRun: '2 min ago' },
  { id: 2, name: 'Social Media Analytics', status: 'completed', progress: 100, lastRun: '5 min ago' },
  { id: 3, name: 'Content Generator', status: 'paused', progress: 45, lastRun: '1 hour ago' },
  { id: 4, name: 'Email Campaign', status: 'scheduled', progress: 0, lastRun: 'Never' },
];

export const availableWidgetTypes: string[] = [
  // Tiered Automation Widgets (Basic Plan)
  'Competitor Monitoring', 'Performance Analytics', 'AI Recommendations', 'Workflow Status', 'API Cost Tracker',

  // Professional Widgets
  'SEO Ranking Tracker', 'SEO Audit Dashboard', 'Content Gap Analysis', 'Keyword Research Analysis',
  'Backlink Analysis', 'Industry Intelligence Dashboard', 'Trending Hashtags Analyzer',
  'Tech Stack Analyzer', 'SEO Meta Tag Generator'
];

export interface SidebarSubItem {
  id: string;
  label: string;
  icon: string;
  badge?: string | number;
  description?: string;
}

export interface ExpandedSidebarItem extends SidebarItem {
  subItems?: SidebarSubItem[];
  category?: 'core' | 'business' | 'marketing' | 'tools';
  badge?: string | number;
  color?: string;
  quickAccess?: boolean;
}

export const sidebarSections: SidebarSection[] = [
  // Top-level items (non-collapsible)
  {
    id: 'main',
    label: 'Main',
    items: [
      { id: 'overview', label: 'Overview', icon: 'Home' },
      { id: 'ai-console', label: 'AI Console', icon: 'Bot' }
    ],
    isCollapsible: false
  },
  // Marketing Section
  {
    id: 'marketing',
    label: 'Marketing',
    icon: 'Megaphone',
    items: [
      { id: 'campaigns', label: 'Ad Campaigns', icon: 'Target' },
      { id: 'email-marketing', label: 'Email Marketing', icon: 'Mail' },
      { id: 'social-media', label: 'Social Media', icon: 'Hash' }
    ],
    isCollapsible: true,
    defaultExpanded: false
  },
  // Content Management Section
  {
    id: 'content-management',
    label: 'Content Management',
    icon: 'FileImage',
    items: [
      { id: 'file-manager', label: 'File Manager', icon: 'FolderOpen' },
      { id: 'brand-assets', label: 'Brand Assets', icon: 'Palette' },
      { id: 'notes', label: 'Sticky Notes', icon: 'StickyNote' }
    ],
    isCollapsible: true,
    defaultExpanded: false
  },
  // Operations Section
  {
    id: 'operations',
    label: 'Operations',
    icon: 'Cog',
    items: [
      { id: 'communication', label: 'Communication Hub', icon: 'MessageCircle' },
      { id: 'content-approval', label: 'Content Approval', icon: 'CheckCircle2', badge: '3' },
      { id: 'automations', label: 'Automations', icon: 'Zap' },
      { id: 'integrations', label: 'Integrations', icon: 'Puzzle' }
    ],
    isCollapsible: true,
    defaultExpanded: false
  },
  // Business Section
  {
    id: 'business',
    label: 'Business',
    icon: 'Briefcase',
    items: [
      { id: 'crm', label: 'CRM', icon: 'UserCheck' },
      { id: 'portals', label: 'Client Portals', icon: 'ExternalLink' },
      { id: 'financial', label: 'Financial', icon: 'CreditCard' }
    ],
    isCollapsible: true,
    defaultExpanded: false
  },
  // Content Generation Section
  {
    id: 'content-generation',
    label: 'Content Generation',
    icon: 'FileText',
    items: [
      { id: 'ai-script-generator', label: 'AI Script Generator', icon: 'Bot' },
      { id: 'blog-post-generator', label: 'Blog Post Generator', icon: 'BookOpen' },
      { id: 'landing-page-copy-generator', label: 'Landing Page Copy Generator', icon: 'Layout' }
    ],
    isCollapsible: true,
    defaultExpanded: false
  },
  // Analytics & Reports Section
  {
    id: 'analytics',
    label: 'Analytics & Reports',
    icon: 'LineChart',
    items: [
      { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
      { id: 'reports', label: 'Reports', icon: 'FileBarChart' },
      { id: 'predictive', label: 'Predictive', icon: 'TrendingUp' }
    ],
    isCollapsible: true,
    defaultExpanded: false
  },
  // Individual items (non-collapsible)
  {
    id: 'management',
    label: 'Management',
    items: [
      { id: 'team', label: 'Team Management', icon: 'Users2' },
      { id: 'history', label: 'History', icon: 'History' },
      { id: 'settings', label: 'Settings', icon: 'Settings' }
    ],
    isCollapsible: false
  }
];

// Keep backward compatibility
export const sidebarItems: SidebarItem[] = sidebarSections.flatMap(section => section.items);

export const quickAccessItems = sidebarItems.filter(item => item.quickAccess);

// Communication Hub specific exports
export interface CommunicationStats {
  unreadMessages: number;
  upcomingMeetings: number;
  pendingCheckIns: number;
  responseRate: number;
}

export const mockCommunicationStats: CommunicationStats = {
  unreadMessages: 7,
  upcomingMeetings: 3,
  pendingCheckIns: 2,
  responseRate: 87
};

export const colorClasses: ColorClasses = {
  purple: 'bg-purple-600/20 border-purple-500/30 text-purple-400',
  green: 'bg-green-600/20 border-green-500/30 text-green-400',
  blue: 'bg-blue-600/20 border-blue-500/30 text-blue-400',
  orange: 'bg-orange-600/20 border-orange-500/30 text-orange-400'
};

export const statusColors: StatusColors = {
  running: 'text-green-400',
  completed: 'text-blue-400', 
  paused: 'text-yellow-400',
  scheduled: 'text-gray-400'
};

export const defaultClientData: ClientData = { 
  username: 'Premium User', 
  client_name: 'John Smith',
  company: 'TechCorp Solutions',
  active_automations: 12,
  success_rate: 94.7,
  completed_today: 47,
  time_saved: 12.4,
  available_categories: ['SEO Audit', 'Content Generation', 'Social Media Analytics', 'Email Campaigns', 'Performance Monitoring'],
  widgets: ['Competitor Monitoring', 'Performance Analytics', 'AI Recommendations', 'Workflow Status', 'API Cost Tracker']
};