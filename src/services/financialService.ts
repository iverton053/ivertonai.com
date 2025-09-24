import { supabase } from '../lib/supabase';
import type { 
  Client, 
  Service, 
  Invoice, 
  Payment, 
  Subscription, 
  RevenueMetrics, 
  ClientRevenueBreakdown,
  FinancialReport,
  TaxSummary,
  Expense,
  ExpenseCategory,
  FinancialSummary,
  FinancialDashboardData,
  Project,
  TimeEntry,
  TimeTrackingSession,
  ProjectAnalytics,
  ProjectProfitabilityReport,
  ReportFilters
} from '../types/financial';

class FinancialService {
  // ================ CLIENT MANAGEMENT ================
  async getClients(): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from('financial_clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('Using mock client data');
      return this.getMockClients();
    }
  }

  async createClient(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    try {
      const { data, error } = await supabase
        .from('financial_clients')
        .insert([{
          ...clientData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Using mock client creation');
      const mockClient: Client = {
        id: `client_${Date.now()}`,
        ...clientData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return mockClient;
    }
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    try {
      const { data, error } = await supabase
        .from('financial_clients')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Using mock client update');
      const clients = await this.getClients();
      const client = clients.find(c => c.id === id);
      if (!client) throw new Error('Client not found');
      return { ...client, ...updates, updated_at: new Date().toISOString() };
    }
  }

  // ================ SERVICE MANAGEMENT ================
  async getServices(): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from('financial_services')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('Using mock service data');
      return this.getMockServices();
    }
  }

  async createService(serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> {
    try {
      const { data, error } = await supabase
        .from('financial_services')
        .insert([{
          ...serviceData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Using mock service creation');
      return {
        id: `service_${Date.now()}`,
        ...serviceData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }

  // ================ INVOICE MANAGEMENT ================
  async getInvoices(filters?: { status?: string; client_id?: string }): Promise<Invoice[]> {
    try {
      let query = supabase
        .from('financial_invoices')
        .select(`
          *,
          client:financial_clients(*),
          items:financial_invoice_items(
            *,
            service:financial_services(*)
          )
        `);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.client_id) {
        query = query.eq('client_id', filters.client_id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('Using mock invoice data');
      return this.getMockInvoices();
    }
  }

  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'invoice_number' | 'created_at' | 'updated_at'>): Promise<Invoice> {
    try {
      const invoiceNumber = await this.generateInvoiceNumber();
      
      const { data, error } = await supabase
        .from('financial_invoices')
        .insert([{
          ...invoiceData,
          invoice_number: invoiceNumber,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select(`
          *,
          client:financial_clients(*),
          items:financial_invoice_items(
            *,
            service:financial_services(*)
          )
        `)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Using mock invoice creation');
      const invoices = await this.getInvoices();
      return {
        id: `inv_${Date.now()}`,
        invoice_number: `INV-${String(invoices.length + 1).padStart(4, '0')}`,
        ...invoiceData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Invoice;
    }
  }

  async updateInvoiceStatus(id: string, status: Invoice['status']): Promise<Invoice> {
    try {
      const updates: Partial<Invoice> = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'paid') {
        updates.paid_at = new Date().toISOString();
        updates.paid_amount = updates.total_amount;
      }

      const { data, error } = await supabase
        .from('financial_invoices')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          client:financial_clients(*),
          items:financial_invoice_items(
            *,
            service:financial_services(*)
          )
        `)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Using mock invoice status update');
      const invoices = await this.getInvoices();
      const invoice = invoices.find(i => i.id === id);
      if (!invoice) throw new Error('Invoice not found');
      return { ...invoice, status, updated_at: new Date().toISOString() };
    }
  }

  // ================ PAYMENT MANAGEMENT ================
  async getPayments(invoiceId?: string): Promise<Payment[]> {
    try {
      let query = supabase
        .from('financial_payments')
        .select('*');

      if (invoiceId) {
        query = query.eq('invoice_id', invoiceId);
      }

      const { data, error } = await query.order('payment_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('Using mock payment data');
      return this.getMockPayments();
    }
  }

  async recordPayment(paymentData: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment> {
    try {
      const { data, error } = await supabase
        .from('financial_payments')
        .insert([{
          ...paymentData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;

      // Update invoice paid amount
      await this.updateInvoicePaidAmount(paymentData.invoice_id);
      
      return data;
    } catch (error) {
      console.warn('Using mock payment recording');
      return {
        id: `pay_${Date.now()}`,
        ...paymentData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }

  // ================ SUBSCRIPTION MANAGEMENT ================
  async getSubscriptions(): Promise<Subscription[]> {
    try {
      const { data, error } = await supabase
        .from('financial_subscriptions')
        .select(`
          *,
          client:financial_clients(*),
          service:financial_services(*)
        `)
        .order('next_billing_date');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn('Using mock subscription data');
      return this.getMockSubscriptions();
    }
  }

  async createSubscription(subscriptionData: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>): Promise<Subscription> {
    try {
      const { data, error } = await supabase
        .from('financial_subscriptions')
        .insert([{
          ...subscriptionData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select(`
          *,
          client:financial_clients(*),
          service:financial_services(*)
        `)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('Using mock subscription creation');
      return {
        id: `sub_${Date.now()}`,
        ...subscriptionData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Subscription;
    }
  }

  // ================ ANALYTICS & REPORTING ================
  async getRevenueMetrics(period: { start_date: string; end_date: string }): Promise<RevenueMetrics> {
    try {
      // This would normally query the database for real metrics
      // For now, return mock data based on current invoices
      const invoices = await this.getInvoices();
      const payments = await this.getPayments();
      const subscriptions = await this.getSubscriptions();

      const totalRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

      const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
      const monthlyRecurring = activeSubscriptions
        .filter(s => s.billing_cycle === 'monthly')
        .reduce((sum, s) => sum + s.amount, 0);

      return {
        total_revenue: totalRevenue,
        monthly_recurring_revenue: monthlyRecurring,
        annual_recurring_revenue: monthlyRecurring * 12,
        average_revenue_per_client: totalRevenue / (await this.getClients()).length,
        client_lifetime_value: monthlyRecurring * 24, // Simplified calculation
        churn_rate: 5.2, // Mock data
        growth_rate: 15.8, // Mock data
        outstanding_invoices: invoices.filter(i => i.status !== 'paid').length,
        overdue_amount: invoices
          .filter(i => i.status === 'overdue')
          .reduce((sum, i) => sum + i.total_amount, 0),
        profit_margin: 45.2, // Mock data
        period
      };
    } catch (error) {
      console.warn('Using mock revenue metrics');
      return this.getMockRevenueMetrics(period);
    }
  }

  async getClientRevenueBreakdown(): Promise<ClientRevenueBreakdown[]> {
    try {
      const clients = await this.getClients();
      const invoices = await this.getInvoices();
      const payments = await this.getPayments();

      return clients.map(client => {
        const clientInvoices = invoices.filter(i => i.client_id === client.id);
        const clientPayments = payments.filter(p => p.client_id === client.id && p.status === 'completed');
        
        const totalRevenue = clientPayments.reduce((sum, p) => sum + p.amount, 0);
        const monthlyRevenue = totalRevenue / 12; // Simplified
        const outstanding = clientInvoices
          .filter(i => i.status !== 'paid')
          .reduce((sum, i) => sum + (i.total_amount - i.paid_amount), 0);

        return {
          client_id: client.id,
          client_name: client.name,
          total_revenue: totalRevenue,
          monthly_revenue: monthlyRevenue,
          outstanding_amount: outstanding,
          last_payment_date: clientPayments[0]?.payment_date,
          services: [] // Simplified for now
        };
      });
    } catch (error) {
      console.warn('Using mock client revenue breakdown');
      return this.getMockClientRevenueBreakdown();
    }
  }

  async getFinancialSummary(): Promise<FinancialSummary> {
    try {
      const invoices = await this.getInvoices();
      const payments = await this.getPayments();
      const clients = await this.getClients();

      const thisMonthRevenue = payments
        .filter(p => {
          const paymentDate = new Date(p.payment_date);
          const now = new Date();
          return paymentDate.getMonth() === now.getMonth() && 
                 paymentDate.getFullYear() === now.getFullYear() &&
                 p.status === 'completed';
        })
        .reduce((sum, p) => sum + p.amount, 0);

      const outstandingInvoices = invoices.filter(i => i.status !== 'paid');
      const overdueInvoices = invoices.filter(i => i.status === 'overdue');

      return {
        revenue: {
          this_month: thisMonthRevenue,
          last_month: thisMonthRevenue * 0.85, // Mock
          growth_rate: 15.8
        },
        expenses: {
          this_month: 8500, // Mock
          last_month: 7200, // Mock
          change_rate: 18.1
        },
        profit: {
          this_month: thisMonthRevenue - 8500,
          last_month: (thisMonthRevenue * 0.85) - 7200,
          margin: ((thisMonthRevenue - 8500) / thisMonthRevenue) * 100
        },
        outstanding: {
          amount: outstandingInvoices.reduce((sum, i) => sum + (i.total_amount - i.paid_amount), 0),
          invoices_count: outstandingInvoices.length,
          overdue_count: overdueInvoices.length
        },
        clients: {
          active_count: clients.filter(c => c.status === 'active').length,
          new_this_month: 3, // Mock
          churn_count: 1 // Mock
        }
      };
    } catch (error) {
      console.warn('Using mock financial summary');
      return this.getMockFinancialSummary();
    }
  }

  // ================ UTILITY METHODS ================
  private async generateInvoiceNumber(): Promise<string> {
    const invoices = await this.getInvoices();
    const count = invoices.length + 1;
    return `INV-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;
  }

  private async updateInvoicePaidAmount(invoiceId: string): Promise<void> {
    const payments = await this.getPayments(invoiceId);
    const totalPaid = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    const invoices = await this.getInvoices();
    const invoice = invoices.find(i => i.id === invoiceId);
    
    if (invoice) {
      const status = totalPaid >= invoice.total_amount ? 'paid' : 
                   totalPaid > 0 ? 'viewed' : invoice.status;
      
      try {
        await supabase
          .from('financial_invoices')
          .update({
            paid_amount: totalPaid,
            status,
            paid_at: status === 'paid' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', invoiceId);
      } catch (error) {
        console.warn('Could not update invoice paid amount');
      }
    }
  }

  // ================ MOCK DATA METHODS ================
  private getMockClients(): Client[] {
    return [
      {
        id: 'client_1',
        name: 'TechCorp Solutions',
        email: 'billing@techcorp.com',
        company: 'TechCorp Solutions',
        phone: '+1-555-0123',
        payment_terms: { net_days: 30, late_fee_percentage: 1.5 },
        default_currency: 'INR',
        tax_rate: 8.25,
        status: 'active',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 'client_2',
        name: 'Digital Marketing Pro',
        email: 'accounts@digitalmarketing.com',
        company: 'Digital Marketing Pro',
        payment_terms: { net_days: 15, discount_percentage: 2, discount_days: 10 },
        default_currency: 'INR',
        status: 'active',
        created_at: '2024-02-01T09:00:00Z',
        updated_at: '2024-02-01T09:00:00Z'
      },
      {
        id: 'client_3',
        name: 'E-commerce Plus',
        email: 'finance@ecommerceplus.com',
        company: 'E-commerce Plus',
        payment_terms: { net_days: 30 },
        default_currency: 'INR',
        tax_rate: 7.5,
        status: 'active',
        created_at: '2024-01-20T14:00:00Z',
        updated_at: '2024-01-20T14:00:00Z'
      }
    ];
  }

  private getMockServices(): Service[] {
    return [
      {
        id: 'service_1',
        name: 'SEO Audit & Strategy',
        description: 'Comprehensive SEO analysis and strategic planning',
        category: 'seo',
        pricing_type: 'fixed',
        base_price: 200000,
        currency: 'INR',
        tax_inclusive: false,
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'service_2',
        name: 'Content Creation',
        description: 'Blog posts, articles, and web content',
        category: 'content',
        pricing_type: 'monthly',
        base_price: 95000,
        currency: 'INR',
        tax_inclusive: false,
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'service_3',
        name: 'Social Media Management',
        description: 'Social media strategy and management',
        category: 'social_media',
        pricing_type: 'monthly',
        base_price: 65000,
        currency: 'INR',
        tax_inclusive: false,
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];
  }

  private getMockInvoices(): Invoice[] {
    const clients = this.getMockClients();
    const services = this.getMockServices();
    
    return [
      {
        id: 'inv_1',
        invoice_number: 'INV-2024-0001',
        client_id: 'client_1',
        client: clients[0],
        issue_date: '2024-01-15T00:00:00Z',
        due_date: '2024-02-14T00:00:00Z',
        status: 'paid',
        subtotal: 200000,
        tax_amount: 16500,
        discount_amount: 0,
        total_amount: 216500,
        paid_amount: 216500,
        currency: 'INR',
        items: [
          {
            id: 'item_1',
            service_id: 'service_1',
            service: services[0],
            description: 'SEO Audit & Strategy - Q1 2024',
            quantity: 1,
            rate: 200000,
            amount: 200000,
            tax_rate: 8.25
          }
        ],
        payment_terms: clients[0].payment_terms,
        notes: 'Thank you for your business!',
        sent_at: '2024-01-15T10:00:00Z',
        paid_at: '2024-02-01T15:30:00Z',
        created_at: '2024-01-15T09:00:00Z',
        updated_at: '2024-02-01T15:30:00Z'
      },
      {
        id: 'inv_2',
        invoice_number: 'INV-2024-0002',
        client_id: 'client_2',
        client: clients[1],
        issue_date: '2024-02-01T00:00:00Z',
        due_date: '2024-02-16T00:00:00Z',
        status: 'sent',
        subtotal: 160000,
        tax_amount: 0,
        discount_amount: 3200,
        total_amount: 156800,
        paid_amount: 0,
        currency: 'INR',
        items: [
          {
            id: 'item_2',
            service_id: 'service_2',
            service: services[1],
            description: 'Content Creation - February 2024',
            quantity: 1,
            rate: 95000,
            amount: 95000,
            tax_rate: 0
          },
          {
            id: 'item_3',
            service_id: 'service_3',
            service: services[2],
            description: 'Social Media Management - February 2024',
            quantity: 1,
            rate: 65000,
            amount: 65000,
            tax_rate: 0
          }
        ],
        payment_terms: clients[1].payment_terms,
        sent_at: '2024-02-01T09:00:00Z',
        created_at: '2024-02-01T08:00:00Z',
        updated_at: '2024-02-01T09:00:00Z'
      }
    ];
  }

  private getMockPayments(): Payment[] {
    return [
      {
        id: 'pay_1',
        invoice_id: 'inv_1',
        client_id: 'client_1',
        amount: 216500,
        currency: 'INR',
        payment_method: 'stripe',
        payment_date: '2024-02-01T15:30:00Z',
        reference_number: 'ch_1234567890',
        status: 'completed',
        gateway_transaction_id: 'txn_1234567890',
        created_at: '2024-02-01T15:30:00Z',
        updated_at: '2024-02-01T15:30:00Z'
      }
    ];
  }

  private getMockSubscriptions(): Subscription[] {
    const clients = this.getMockClients();
    const services = this.getMockServices();
    
    return [
      {
        id: 'sub_1',
        client_id: 'client_2',
        client: clients[1],
        service_id: 'service_2',
        service: services[1],
        plan_name: 'Content Pro Monthly',
        billing_cycle: 'monthly',
        amount: 95000,
        currency: 'INR',
        status: 'active',
        next_billing_date: '2024-03-01T00:00:00Z',
        last_billing_date: '2024-02-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'sub_2',
        client_id: 'client_3',
        client: clients[2],
        service_id: 'service_3',
        service: services[2],
        plan_name: 'Social Media Standard',
        billing_cycle: 'monthly',
        amount: 65000,
        currency: 'INR',
        status: 'active',
        next_billing_date: '2024-03-01T00:00:00Z',
        created_at: '2024-01-20T00:00:00Z',
        updated_at: '2024-01-20T00:00:00Z'
      }
    ];
  }

  private getMockRevenueMetrics(period: { start_date: string; end_date: string }): RevenueMetrics {
    return {
      total_revenue: 3900000,
      monthly_recurring_revenue: 160000,
      annual_recurring_revenue: 1920000,
      average_revenue_per_client: 1300000,
      client_lifetime_value: 3840000,
      churn_rate: 5.2,
      growth_rate: 18.5,
      outstanding_invoices: 3,
      overdue_amount: 200000,
      profit_margin: 42.8,
      period
    };
  }

  private getMockClientRevenueBreakdown(): ClientRevenueBreakdown[] {
    return [
      {
        client_id: 'client_1',
        client_name: 'TechCorp Solutions',
        total_revenue: 1550000,
        monthly_revenue: 200000,
        outstanding_amount: 0,
        last_payment_date: '2024-02-01T15:30:00Z',
        services: [
          { service_name: 'SEO Audit', revenue: 1200000, invoices_count: 6 },
          { service_name: 'Content Creation', revenue: 350000, invoices_count: 3 }
        ]
      },
      {
        client_id: 'client_2',
        client_name: 'Digital Marketing Pro',
        total_revenue: 1250000,
        monthly_revenue: 160000,
        outstanding_amount: 156800,
        last_payment_date: '2024-01-28T12:00:00Z',
        services: [
          { service_name: 'Content Creation', revenue: 760000, invoices_count: 8 },
          { service_name: 'Social Media Management', revenue: 490000, invoices_count: 7 }
        ]
      },
      {
        client_id: 'client_3',
        client_name: 'E-commerce Plus',
        total_revenue: 1100000,
        monthly_revenue: 65000,
        outstanding_amount: 65000,
        services: [
          { service_name: 'Social Media Management', revenue: 1100000, invoices_count: 16 }
        ]
      }
    ];
  }

  private getMockFinancialSummary(): FinancialSummary {
    return {
      revenue: {
        this_month: 1025000,
        last_month: 865000,
        growth_rate: 18.6
      },
      expenses: {
        this_month: 560000,
        last_month: 485000,
        change_rate: 15.3
      },
      profit: {
        this_month: 465000,
        last_month: 380000,
        margin: 45.4
      },
      outstanding: {
        amount: 392000,
        invoices_count: 4,
        overdue_count: 1
      },
      clients: {
        active_count: 8,
        new_this_month: 2,
        churn_count: 0
      }
    };
  }

  // ================ PROJECT MANAGEMENT ================
  async getProjects(): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          client:clients(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      return this.getMockProjects();
    }
  }

  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...project,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          client:clients(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          client:clients(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // ================ TIME TRACKING ================
  async getTimeEntries(projectId?: string): Promise<TimeEntry[]> {
    try {
      let query = supabase
        .from('time_entries')
        .select(`
          *,
          project:projects(
            *,
            client:clients(*)
          )
        `)
        .order('entry_date', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching time entries:', error);
      return this.getMockTimeEntries();
    }
  }

  async createTimeEntry(timeEntry: Omit<TimeEntry, 'id' | 'created_at' | 'updated_at'>): Promise<TimeEntry> {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          ...timeEntry,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          project:projects(
            *,
            client:clients(*)
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating time entry:', error);
      throw error;
    }
  }

  async startTimeTracking(session: Omit<TimeTrackingSession, 'id' | 'start_time' | 'is_active'>): Promise<TimeTrackingSession> {
    try {
      const sessionData = {
        ...session,
        id: crypto.randomUUID(),
        start_time: new Date().toISOString(),
        is_active: true
      };

      // Store in localStorage for now (in production, would use proper state management)
      const activeSessions = JSON.parse(localStorage.getItem('active_time_sessions') || '[]');
      activeSessions.push(sessionData);
      localStorage.setItem('active_time_sessions', JSON.stringify(activeSessions));

      return sessionData;
    } catch (error) {
      console.error('Error starting time tracking:', error);
      throw error;
    }
  }

  async stopTimeTracking(sessionId: string): Promise<TimeEntry> {
    try {
      const activeSessions = JSON.parse(localStorage.getItem('active_time_sessions') || '[]');
      const sessionIndex = activeSessions.findIndex((s: TimeTrackingSession) => s.id === sessionId);
      
      if (sessionIndex === -1) {
        throw new Error('Active session not found');
      }

      const session = activeSessions[sessionIndex];
      const endTime = new Date();
      const startTime = new Date(session.start_time);
      const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

      // Create time entry
      const timeEntry = await this.createTimeEntry({
        project_id: session.project_id,
        project: {} as Project, // Will be populated by the query
        user_id: session.user_id,
        user_name: 'Current User', // Would get from auth context
        task_description: session.task_description,
        hours: Math.round(hours * 100) / 100, // Round to 2 decimal places
        billable: true, // Default to billable
        entry_date: startTime.toISOString().split('T')[0],
        start_time: session.start_time,
        end_time: endTime.toISOString(),
        is_running: false
      });

      // Remove from active sessions
      activeSessions.splice(sessionIndex, 1);
      localStorage.setItem('active_time_sessions', JSON.stringify(activeSessions));

      return timeEntry;
    } catch (error) {
      console.error('Error stopping time tracking:', error);
      throw error;
    }
  }

  async getActiveTimeSessions(): Promise<TimeTrackingSession[]> {
    try {
      return JSON.parse(localStorage.getItem('active_time_sessions') || '[]');
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return [];
    }
  }

  // ================ PROJECT ANALYTICS ================
  async getProjectAnalytics(projectId: string): Promise<ProjectAnalytics> {
    try {
      // In production, this would aggregate data from the database
      const project = await this.getProjects().then(projects => 
        projects.find(p => p.id === projectId)
      );
      
      if (!project) {
        throw new Error('Project not found');
      }

      const timeEntries = await this.getTimeEntries(projectId);
      
      const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
      const billableHours = timeEntries.filter(entry => entry.billable).reduce((sum, entry) => sum + entry.hours, 0);
      const nonBillableHours = totalHours - billableHours;
      const billableAmount = timeEntries.filter(entry => entry.billable)
        .reduce((sum, entry) => sum + (entry.hours * (entry.billable_rate || project.hourly_rate || 0)), 0);

      return {
        project_id: projectId,
        project_name: project.name,
        total_hours: totalHours,
        billable_hours: billableHours,
        non_billable_hours: nonBillableHours,
        total_cost: totalHours * (project.hourly_rate || 50), // Default rate
        billable_amount: billableAmount,
        invoiced_amount: 0, // Would calculate from invoices
        outstanding_amount: billableAmount,
        profit_margin: project.budget > 0 ? ((project.budget - (totalHours * (project.hourly_rate || 50))) / project.budget) * 100 : 0,
        team_utilization: [],
        budget_utilization: {
          budget_used: totalHours * (project.hourly_rate || 50),
          budget_remaining: Math.max(0, project.budget - (totalHours * (project.hourly_rate || 50))),
          percentage_used: project.budget > 0 ? ((totalHours * (project.hourly_rate || 50)) / project.budget) * 100 : 0,
          on_track: project.budget > 0 ? (totalHours * (project.hourly_rate || 50)) <= project.budget : true
        }
      };
    } catch (error) {
      console.error('Error getting project analytics:', error);
      return this.getMockProjectAnalytics(projectId);
    }
  }

  async getProjectProfitabilityReport(): Promise<ProjectProfitabilityReport> {
    try {
      const projects = await this.getProjects();
      const projectAnalytics = await Promise.all(
        projects.map(project => this.getProjectAnalytics(project.id))
      );

      const reportProjects = projects.map((project, index) => {
        const analytics = projectAnalytics[index];
        return {
          id: project.id,
          name: project.name,
          client_name: project.client.name,
          budget: project.budget,
          actual_cost: analytics.total_cost,
          revenue: analytics.invoiced_amount,
          profit: analytics.invoiced_amount - analytics.total_cost,
          profit_margin: analytics.profit_margin,
          hours_logged: analytics.total_hours,
          completion_percentage: project.status === 'completed' ? 100 : 
            project.estimated_hours ? (analytics.total_hours / project.estimated_hours) * 100 : 0,
          status: project.status
        };
      });

      const profitableProjects = reportProjects.filter(p => p.profit > 0).length;
      const totalRevenue = reportProjects.reduce((sum, p) => sum + p.revenue, 0);
      const totalCost = reportProjects.reduce((sum, p) => sum + p.actual_cost, 0);

      return {
        projects: reportProjects,
        summary: {
          total_projects: projects.length,
          profitable_projects: profitableProjects,
          total_revenue: totalRevenue,
          total_cost: totalCost,
          average_profit_margin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0
        }
      };
    } catch (error) {
      console.error('Error generating profitability report:', error);
      return this.getMockProfitabilityReport();
    }
  }

  async getFinancialDashboardData(): Promise<FinancialDashboardData> {
    try {
      const [
        summary,
        recentInvoices,
        overdueInvoices,
        activeProjects,
        recentTimeEntries,
        projectProfitability,
        clientBreakdown
      ] = await Promise.all([
        this.getFinancialSummary(),
        this.getInvoices().then(invoices => invoices.slice(0, 5)),
        this.getInvoices().then(invoices => invoices.filter(inv => inv.status === 'overdue')),
        this.getProjects().then(projects => projects.filter(p => p.status === 'active')),
        this.getTimeEntries().then(entries => entries.slice(0, 10)),
        this.getProjectProfitabilityReport().then(report => report.projects.map(p => ({
          project_id: p.id,
          project_name: p.name,
          total_hours: p.hours_logged,
          billable_hours: p.hours_logged * 0.8, // Mock
          non_billable_hours: p.hours_logged * 0.2, // Mock
          total_cost: p.actual_cost,
          billable_amount: p.revenue,
          invoiced_amount: p.revenue * 0.7, // Mock
          outstanding_amount: p.revenue * 0.3, // Mock
          profit_margin: p.profit_margin,
          team_utilization: [],
          budget_utilization: {
            budget_used: p.actual_cost,
            budget_remaining: p.budget - p.actual_cost,
            percentage_used: (p.actual_cost / p.budget) * 100,
            on_track: p.actual_cost <= p.budget
          }
        }))),
        this.getClientRevenueBreakdown()
      ]);

      // Generate revenue chart data
      const revenueChartData = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (11 - i));
        return {
          month: date.toLocaleString('default', { month: 'short', year: '2-digit' }),
          revenue: Math.floor(Math.random() * 50000) + 20000,
          expenses: Math.floor(Math.random() * 30000) + 10000,
          profit: 0
        };
      });

      revenueChartData.forEach(data => {
        data.profit = data.revenue - data.expenses;
      });

      return {
        summary,
        recent_invoices: recentInvoices,
        overdue_invoices: overdueInvoices,
        active_projects: activeProjects,
        recent_time_entries: recentTimeEntries,
        project_profitability: projectProfitability,
        revenue_chart_data: revenueChartData,
        client_revenue_breakdown: clientBreakdown
      };
    } catch (error) {
      console.error('Error getting financial dashboard data:', error);
      return this.getMockFinancialDashboardData();
    }
  }

  // ================ MOCK DATA METHODS ================
  private getMockProjects(): Project[] {
    return [
      {
        id: '1',
        name: 'Website Redesign',
        description: 'Complete website redesign and optimization',
        client_id: 'client_1',
        client: {
          id: 'client_1',
          name: 'TechCorp Solutions',
          email: 'contact@techcorp.com',
          company: 'TechCorp Solutions',
          payment_terms: { net_days: 30 },
          default_currency: 'USD',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        status: 'active',
        priority: 'high',
        budget: 25000,
        budget_type: 'fixed',
        currency: 'USD',
        start_date: '2024-01-15',
        end_date: '2024-03-15',
        estimated_hours: 200,
        actual_hours: 120,
        hourly_rate: 125,
        team_members: ['user_1', 'user_2'],
        created_by: 'user_1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'SEO Campaign Q1',
        description: 'Comprehensive SEO optimization campaign',
        client_id: 'client_2',
        client: {
          id: 'client_2',
          name: 'Growth Ventures',
          email: 'hello@growthventures.com',
          company: 'Growth Ventures',
          payment_terms: { net_days: 15 },
          default_currency: 'USD',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        status: 'active',
        priority: 'medium',
        budget: 15000,
        budget_type: 'monthly_retainer',
        currency: 'USD',
        start_date: '2024-01-01',
        estimated_hours: 160,
        actual_hours: 85,
        hourly_rate: 95,
        team_members: ['user_1', 'user_3'],
        created_by: 'user_1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  private getMockTimeEntries(): TimeEntry[] {
    const mockProjects = this.getMockProjects();
    return [
      {
        id: '1',
        project_id: '1',
        project: mockProjects[0],
        user_id: 'user_1',
        user_name: 'John Smith',
        task_description: 'Homepage design and wireframing',
        hours: 4.5,
        billable: true,
        billable_rate: 125,
        entry_date: '2024-01-20',
        start_time: '09:00',
        end_time: '13:30',
        is_running: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        project_id: '2',
        project: mockProjects[1],
        user_id: 'user_3',
        user_name: 'Sarah Johnson',
        task_description: 'Keyword research and analysis',
        hours: 6.0,
        billable: true,
        billable_rate: 95,
        entry_date: '2024-01-20',
        start_time: '10:00',
        end_time: '16:00',
        is_running: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  private getMockProjectAnalytics(projectId: string): ProjectAnalytics {
    return {
      project_id: projectId,
      project_name: 'Sample Project',
      total_hours: 120,
      billable_hours: 100,
      non_billable_hours: 20,
      total_cost: 15000,
      billable_amount: 12500,
      invoiced_amount: 10000,
      outstanding_amount: 2500,
      profit_margin: 25.5,
      team_utilization: [
        {
          user_id: 'user_1',
          user_name: 'John Smith',
          hours_logged: 60,
          efficiency_rating: 85.2
        }
      ],
      budget_utilization: {
        budget_used: 15000,
        budget_remaining: 10000,
        percentage_used: 60,
        on_track: true
      }
    };
  }

  private getMockProfitabilityReport(): ProjectProfitabilityReport {
    return {
      projects: [
        {
          id: '1',
          name: 'Website Redesign',
          client_name: 'TechCorp Solutions',
          budget: 25000,
          actual_cost: 15000,
          revenue: 20000,
          profit: 5000,
          profit_margin: 25.0,
          hours_logged: 120,
          completion_percentage: 75,
          status: 'active'
        }
      ],
      summary: {
        total_projects: 1,
        profitable_projects: 1,
        total_revenue: 20000,
        total_cost: 15000,
        average_profit_margin: 25.0
      }
    };
  }

  private getMockFinancialDashboardData(): FinancialDashboardData {
    return {
      summary: this.getFinancialSummary(),
      recent_invoices: [],
      overdue_invoices: [],
      active_projects: this.getMockProjects(),
      recent_time_entries: this.getMockTimeEntries(),
      project_profitability: [this.getMockProjectAnalytics('1')],
      revenue_chart_data: [],
      client_revenue_breakdown: []
    };
  }
}

export const financialService = new FinancialService();