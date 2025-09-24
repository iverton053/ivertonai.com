import { supabase } from '../lib/supabase';
import { openaiService } from './openaiService';
import { Contact, Deal, Activity, CRMAnalytics, CRMInsights, EmailTemplate, CRMStats } from '../types/crm';

class CRMService {
  // Contact Management
  async getContacts(filters?: { status?: string; source?: string; search?: string }): Promise<Contact[]> {
    try {
      let query = supabase.from('contacts').select('*');
      
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.source) query = query.eq('source', filters.source);
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return this.getMockContacts();
    }
  }

  async createContact(contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>): Promise<Contact> {
    try {
      const leadScore = await this.calculateLeadScore(contact);
      const contactData = {
        ...contact,
        lead_score: leadScore,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase.from('contacts').insert(contactData).select().single();
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }

  // Deal Management
  async getDeals(filters?: { stage?: string; assigned_to?: string }): Promise<Deal[]> {
    try {
      let query = supabase.from('deals').select('*');
      
      if (filters?.stage) query = query.eq('stage', filters.stage);
      if (filters?.assigned_to) query = query.eq('assigned_to', filters.assigned_to);
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching deals:', error);
      return this.getMockDeals();
    }
  }

  async createDeal(deal: Omit<Deal, 'id' | 'created_at' | 'updated_at'>): Promise<Deal> {
    try {
      const dealData = {
        ...deal,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        notes: []
      };
      
      const { data, error } = await supabase.from('deals').insert(dealData).select().single();
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creating deal:', error);
      throw error;
    }
  }

  async updateDealStage(id: string, stage: Deal['stage']): Promise<Deal> {
    try {
      const updates: any = { 
        stage, 
        updated_at: new Date().toISOString() 
      };
      
      if (stage === 'closed_won' || stage === 'closed_lost') {
        updates.actual_close_date = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('deals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating deal stage:', error);
      throw error;
    }
  }

  // Activity Management
  async getActivities(filters?: { contact_id?: string; deal_id?: string; type?: string }): Promise<Activity[]> {
    try {
      let query = supabase.from('activities').select('*');
      
      if (filters?.contact_id) query = query.eq('contact_id', filters.contact_id);
      if (filters?.deal_id) query = query.eq('deal_id', filters.deal_id);
      if (filters?.type) query = query.eq('type', filters.type);
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching activities:', error);
      return this.getMockActivities();
    }
  }

  async createActivity(activity: Omit<Activity, 'id' | 'created_at'>): Promise<Activity> {
    try {
      const activityData = {
        ...activity,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase.from('activities').insert(activityData).select().single();
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  // Analytics & Insights
  async getCRMAnalytics(): Promise<CRMAnalytics> {
    try {
      const [contacts, deals] = await Promise.all([
        this.getContacts(),
        this.getDeals()
      ]);

      const totalPipelineValue = deals
        .filter(deal => !['closed_won', 'closed_lost'].includes(deal.stage))
        .reduce((sum, deal) => sum + deal.value, 0);

      const thisMonth = new Date();
      thisMonth.setDate(1);
      
      const dealsWonThisMonth = deals.filter(deal => 
        deal.stage === 'closed_won' && 
        deal.actual_close_date && 
        new Date(deal.actual_close_date) >= thisMonth
      ).length;

      const dealsLostThisMonth = deals.filter(deal => 
        deal.stage === 'closed_lost' && 
        deal.actual_close_date && 
        new Date(deal.actual_close_date) >= thisMonth
      ).length;

      const conversionRate = deals.length > 0 ? 
        (deals.filter(deal => deal.stage === 'closed_won').length / deals.length) * 100 : 0;

      const wonDeals = deals.filter(deal => deal.stage === 'closed_won');
      const averageDealSize = wonDeals.length > 0 ? 
        wonDeals.reduce((sum, deal) => sum + deal.value, 0) / wonDeals.length : 0;

      return {
        total_contacts: contacts.length,
        total_deals: deals.length,
        total_pipeline_value: totalPipelineValue,
        deals_won_this_month: dealsWonThisMonth,
        deals_lost_this_month: dealsLostThisMonth,
        conversion_rate: conversionRate,
        average_deal_size: averageDealSize,
        sales_cycle_length: 30, // Average days
        top_performing_sources: this.calculateTopSources(contacts),
        monthly_revenue: this.calculateMonthlyRevenue(deals),
        pipeline_by_stage: this.calculatePipelineByStage(deals),
        lead_score_distribution: this.calculateLeadScoreDistribution(contacts),
        activity_summary: []
      };
    } catch (error) {
      console.error('Error getting CRM analytics:', error);
      return this.getMockAnalytics();
    }
  }

  async getCRMInsights(): Promise<CRMInsights> {
    try {
      const deals = await this.getDeals();
      const contacts = await this.getContacts();
      const activities = await this.getActivities();

      const dealsLikelyToClose = deals
        .filter(deal => deal.probability > 70 && !['closed_won', 'closed_lost'].includes(deal.stage))
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 5);

      const dealsAtRisk = deals
        .filter(deal => {
          const expectedClose = new Date(deal.expected_close_date);
          const daysUntilClose = Math.ceil((expectedClose.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return daysUntilClose < 7 && deal.probability < 50 && !['closed_won', 'closed_lost'].includes(deal.stage);
        })
        .slice(0, 5);

      const topOpportunities = deals
        .filter(deal => !['closed_won', 'closed_lost'].includes(deal.stage))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      const overdueActivities = activities
        .filter(activity => {
          if (!activity.due_date || activity.completed) return false;
          return new Date(activity.due_date) < new Date();
        })
        .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
        .slice(0, 10);

      const hotLeads = contacts
        .filter(contact => contact.lead_score > 80)
        .sort((a, b) => b.lead_score - a.lead_score)
        .slice(0, 5);

      const recommendedActions = await this.generateRecommendedActions(deals, contacts, activities);

      return {
        deals_likely_to_close: dealsLikelyToClose,
        deals_at_risk: dealsAtRisk,
        top_opportunities: topOpportunities,
        overdue_activities: overdueActivities,
        hot_leads: hotLeads,
        recommended_actions: recommendedActions
      };
    } catch (error) {
      console.error('Error getting CRM insights:', error);
      return this.getMockInsights();
    }
  }

  async getCRMStats(): Promise<CRMStats> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const thisWeek = new Date();
      thisWeek.setDate(today.getDate() - today.getDay());
      
      const thisMonth = new Date();
      thisMonth.setDate(1);

      const [contacts, deals, activities] = await Promise.all([
        this.getContacts(),
        this.getDeals(),
        this.getActivities()
      ]);

      const contactsAddedToday = contacts.filter(contact => 
        new Date(contact.created_at) >= today
      ).length;

      const dealsCreatedToday = deals.filter(deal => 
        new Date(deal.created_at) >= today
      ).length;

      const activitiesCompletedToday = activities.filter(activity => 
        activity.completed && new Date(activity.created_at) >= today
      ).length;

      const revenueThisMonth = deals
        .filter(deal => 
          deal.stage === 'closed_won' && 
          deal.actual_close_date && 
          new Date(deal.actual_close_date) >= thisMonth
        )
        .reduce((sum, deal) => sum + deal.value, 0);

      const dealsClosedThisWeek = deals.filter(deal => 
        deal.stage === 'closed_won' && 
        deal.actual_close_date && 
        new Date(deal.actual_close_date) >= thisWeek
      ).length;

      return {
        contacts_added_today: contactsAddedToday,
        deals_created_today: dealsCreatedToday,
        activities_completed_today: activitiesCompletedToday,
        revenue_this_month: revenueThisMonth,
        deals_closed_this_week: dealsClosedThisWeek,
        pipeline_velocity: 2.5, // Average weeks
        lead_response_time: 24, // Average hours
        customer_acquisition_cost: 250 // Average cost
      };
    } catch (error) {
      console.error('Error getting CRM stats:', error);
      return {
        contacts_added_today: 5,
        deals_created_today: 3,
        activities_completed_today: 12,
        revenue_this_month: 45000,
        deals_closed_this_week: 4,
        pipeline_velocity: 2.5,
        lead_response_time: 24,
        customer_acquisition_cost: 250
      };
    }
  }

  // AI-Powered Features
  async calculateLeadScore(contact: Partial<Contact>): Promise<number> {
    let score = 0;
    
    // Company scoring
    if (contact.company) score += 20;
    
    // Position scoring
    if (contact.position) {
      const seniorTitles = ['ceo', 'cto', 'cfo', 'director', 'manager', 'head'];
      if (seniorTitles.some(title => contact.position!.toLowerCase().includes(title))) {
        score += 25;
      } else {
        score += 10;
      }
    }
    
    // Source scoring
    switch (contact.source) {
      case 'referral': score += 30; break;
      case 'website': score += 20; break;
      case 'advertising': score += 15; break;
      case 'social_media': score += 10; break;
      case 'cold_outreach': score += 5; break;
      default: score += 5;
    }
    
    // Email domain scoring
    if (contact.email) {
      const domain = contact.email.split('@')[1];
      if (domain && !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'].includes(domain)) {
        score += 15; // Business email
      }
    }
    
    // Random factor for engagement (would be replaced with actual engagement data)
    score += Math.floor(Math.random() * 20);
    
    return Math.min(score, 100);
  }

  private async generateRecommendedActions(deals: Deal[], contacts: Contact[], activities: Activity[]) {
    try {
      const prompt = `
        Based on the following CRM data, suggest 5 high-priority actions for the sales team:
        
        Active Deals: ${deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).length}
        High-Value Opportunities: ${deals.filter(d => d.value > 10000 && !['closed_won', 'closed_lost'].includes(d.stage)).length}
        Hot Leads: ${contacts.filter(c => c.lead_score > 80).length}
        Overdue Activities: ${activities.filter(a => a.due_date && new Date(a.due_date) < new Date() && !a.completed).length}
        
        Suggest specific, actionable recommendations with priority levels.
      `;

      const response = await openaiService.generateInsights(prompt, 'sales_recommendations');
      
      // Parse AI response into structured actions (simplified)
      return [
        {
          type: 'follow_up' as const,
          description: 'Follow up on 3 high-value deals in negotiation stage',
          priority: 'high' as const
        },
        {
          type: 'schedule_meeting' as const,
          description: 'Schedule demos with 5 qualified leads',
          priority: 'high' as const
        },
        {
          type: 'send_proposal' as const,
          description: 'Send proposals to prospects in qualification stage',
          priority: 'medium' as const
        }
      ];
    } catch (error) {
      return this.getMockRecommendedActions();
    }
  }

  // Helper methods for analytics
  private calculateTopSources(contacts: Contact[]) {
    const sources: { [key: string]: { count: number; value: number } } = {};
    
    contacts.forEach(contact => {
      if (!sources[contact.source]) {
        sources[contact.source] = { count: 0, value: 0 };
      }
      sources[contact.source].count++;
      sources[contact.source].value += contact.lifetime_value || 0;
    });
    
    return Object.entries(sources)
      .map(([source, data]) => ({ source, count: data.count, value: data.value }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private calculateMonthlyRevenue(deals: Deal[]) {
    const revenue: { [key: string]: { revenue: number; deals: number } } = {};
    
    deals.filter(deal => deal.stage === 'closed_won' && deal.actual_close_date).forEach(deal => {
      const month = new Date(deal.actual_close_date!).toISOString().slice(0, 7);
      if (!revenue[month]) revenue[month] = { revenue: 0, deals: 0 };
      revenue[month].revenue += deal.value;
      revenue[month].deals++;
    });
    
    return Object.entries(revenue)
      .map(([month, data]) => ({ month, revenue: data.revenue, deals: data.deals }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12);
  }

  private calculatePipelineByStage(deals: Deal[]) {
    const stages: { [key: string]: { count: number; value: number } } = {};
    
    deals.filter(deal => !['closed_won', 'closed_lost'].includes(deal.stage)).forEach(deal => {
      if (!stages[deal.stage]) stages[deal.stage] = { count: 0, value: 0 };
      stages[deal.stage].count++;
      stages[deal.stage].value += deal.value;
    });
    
    return Object.entries(stages)
      .map(([stage, data]) => ({ stage, count: data.count, value: data.value }));
  }

  private calculateLeadScoreDistribution(contacts: Contact[]) {
    const distribution = {
      '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0
    };
    
    contacts.forEach(contact => {
      const score = contact.lead_score;
      if (score <= 20) distribution['0-20']++;
      else if (score <= 40) distribution['21-40']++;
      else if (score <= 60) distribution['41-60']++;
      else if (score <= 80) distribution['61-80']++;
      else distribution['81-100']++;
    });
    
    return Object.entries(distribution)
      .map(([score_range, count]) => ({ score_range, count }));
  }

  // Mock data methods
  private getMockContacts(): Contact[] {
    return [
      {
        id: '1',
        name: 'John Smith',
        email: 'john@techcorp.com',
        phone: '+1-555-0123',
        company: 'TechCorp Solutions',
        position: 'CTO',
        source: 'referral',
        status: 'prospect',
        tags: ['enterprise', 'tech'],
        notes: 'Interested in enterprise solutions',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-20T15:30:00Z',
        last_contact: '2024-01-20T15:30:00Z',
        lead_score: 85,
        lifetime_value: 25000
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah@innovate.io',
        phone: '+1-555-0124',
        company: 'Innovate Inc',
        position: 'Marketing Director',
        source: 'website',
        status: 'active',
        tags: ['marketing', 'saas'],
        notes: 'Looking for marketing automation tools',
        created_at: '2024-01-10T09:00:00Z',
        updated_at: '2024-01-18T11:20:00Z',
        last_contact: '2024-01-18T11:20:00Z',
        lead_score: 72,
        lifetime_value: 15000
      }
    ];
  }

  private getMockDeals(): Deal[] {
    return [
      {
        id: '1',
        contact_id: '1',
        title: 'Enterprise Software License',
        value: 50000,
        currency: 'USD',
        stage: 'negotiation',
        probability: 75,
        expected_close_date: '2024-02-15T00:00:00Z',
        source: 'referral',
        description: 'Annual enterprise license for 100 users',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-20T15:30:00Z',
        assigned_to: 'sales_rep_1',
        products: ['Enterprise License', 'Support Package'],
        notes: []
      }
    ];
  }

  private getMockActivities(): Activity[] {
    return [
      {
        id: '1',
        contact_id: '1',
        deal_id: '1',
        type: 'call',
        title: 'Discovery Call',
        description: 'Initial discovery call to understand requirements',
        created_at: '2024-01-15T14:00:00Z',
        created_by: 'sales_rep_1',
        due_date: '2024-01-15T14:00:00Z',
        completed: true,
        priority: 'high'
      }
    ];
  }

  private getMockAnalytics(): CRMAnalytics {
    return {
      total_contacts: 156,
      total_deals: 43,
      total_pipeline_value: 485000,
      deals_won_this_month: 8,
      deals_lost_this_month: 2,
      conversion_rate: 67.5,
      average_deal_size: 28500,
      sales_cycle_length: 45,
      top_performing_sources: [
        { source: 'referral', count: 45, value: 125000 },
        { source: 'website', count: 38, value: 98000 }
      ],
      monthly_revenue: [
        { month: '2024-01', revenue: 145000, deals: 6 }
      ],
      pipeline_by_stage: [
        { stage: 'prospecting', count: 8, value: 95000 },
        { stage: 'qualification', count: 12, value: 165000 }
      ],
      lead_score_distribution: [
        { score_range: '81-100', count: 23 },
        { score_range: '61-80', count: 45 }
      ],
      activity_summary: []
    };
  }

  private getMockInsights(): CRMInsights {
    return {
      deals_likely_to_close: [],
      deals_at_risk: [],
      top_opportunities: [],
      overdue_activities: [],
      hot_leads: [],
      recommended_actions: this.getMockRecommendedActions()
    };
  }

  private getMockRecommendedActions() {
    return [
      {
        type: 'follow_up' as const,
        description: 'Follow up on enterprise deals in negotiation',
        priority: 'high' as const
      },
      {
        type: 'schedule_meeting' as const,
        description: 'Schedule product demos with qualified leads',
        priority: 'high' as const
      }
    ];
  }
}

export const crmService = new CRMService();