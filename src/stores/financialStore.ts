import { create } from 'zustand';
import { financialService } from '../services/financialService';
import type { 
  Client, 
  Service, 
  Invoice, 
  Payment, 
  Subscription, 
  RevenueMetrics, 
  ClientRevenueBreakdown,
  FinancialSummary
} from '../types/financial';

interface FinancialState {
  // Data
  clients: Client[];
  services: Service[];
  invoices: Invoice[];
  payments: Payment[];
  subscriptions: Subscription[];
  revenueMetrics: RevenueMetrics | null;
  clientRevenueBreakdown: ClientRevenueBreakdown[];
  financialSummary: FinancialSummary | null;

  // Loading states
  loading: {
    clients: boolean;
    services: boolean;
    invoices: boolean;
    payments: boolean;
    subscriptions: boolean;
    analytics: boolean;
  };

  // UI state
  selectedClient: Client | null;
  selectedInvoice: Invoice | null;
  filters: {
    invoiceStatus: string;
    clientId: string;
    dateRange: { start: string; end: string } | null;
  };

  // Actions
  // Client actions
  fetchClients: () => Promise<void>;
  createClient: (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  selectClient: (client: Client | null) => void;

  // Service actions
  fetchServices: () => Promise<void>;
  createService: (serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;

  // Invoice actions
  fetchInvoices: (filters?: { status?: string; client_id?: string }) => Promise<void>;
  createInvoice: (invoiceData: Omit<Invoice, 'id' | 'invoice_number' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => Promise<void>;
  selectInvoice: (invoice: Invoice | null) => void;

  // Payment actions
  fetchPayments: (invoiceId?: string) => Promise<void>;
  recordPayment: (paymentData: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;

  // Subscription actions
  fetchSubscriptions: () => Promise<void>;
  createSubscription: (subscriptionData: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;

  // Analytics actions
  fetchRevenueMetrics: (period: { start_date: string; end_date: string }) => Promise<void>;
  fetchClientRevenueBreakdown: () => Promise<void>;
  fetchFinancialSummary: () => Promise<void>;

  // Filter actions
  setInvoiceStatusFilter: (status: string) => void;
  setClientFilter: (clientId: string) => void;
  setDateRangeFilter: (range: { start: string; end: string } | null) => void;
  clearFilters: () => void;

  // Utility actions
  refreshAllData: () => Promise<void>;
  resetStore: () => void;
}

export const useFinancialStore = create<FinancialState>((set, get) => ({
  // Initial state
  clients: [],
  services: [],
  invoices: [],
  payments: [],
  subscriptions: [],
  revenueMetrics: null,
  clientRevenueBreakdown: [],
  financialSummary: null,

  loading: {
    clients: false,
    services: false,
    invoices: false,
    payments: false,
    subscriptions: false,
    analytics: false,
  },

  selectedClient: null,
  selectedInvoice: null,
  filters: {
    invoiceStatus: 'all',
    clientId: 'all',
    dateRange: null,
  },

  // Client actions
  fetchClients: async () => {
    set((state) => ({ loading: { ...state.loading, clients: true } }));
    try {
      const clients = await financialService.getClients();
      set({ clients });
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      set((state) => ({ loading: { ...state.loading, clients: false } }));
    }
  },

  createClient: async (clientData) => {
    set((state) => ({ loading: { ...state.loading, clients: true } }));
    try {
      const newClient = await financialService.createClient(clientData);
      set((state) => ({ 
        clients: [newClient, ...state.clients],
        loading: { ...state.loading, clients: false }
      }));
    } catch (error) {
      console.error('Error creating client:', error);
      set((state) => ({ loading: { ...state.loading, clients: false } }));
    }
  },

  updateClient: async (id, updates) => {
    set((state) => ({ loading: { ...state.loading, clients: true } }));
    try {
      const updatedClient = await financialService.updateClient(id, updates);
      set((state) => ({
        clients: state.clients.map(client => 
          client.id === id ? updatedClient : client
        ),
        selectedClient: state.selectedClient?.id === id ? updatedClient : state.selectedClient,
        loading: { ...state.loading, clients: false }
      }));
    } catch (error) {
      console.error('Error updating client:', error);
      set((state) => ({ loading: { ...state.loading, clients: false } }));
    }
  },

  selectClient: (client) => {
    set({ selectedClient: client });
  },

  // Service actions
  fetchServices: async () => {
    set((state) => ({ loading: { ...state.loading, services: true } }));
    try {
      const services = await financialService.getServices();
      set({ services });
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      set((state) => ({ loading: { ...state.loading, services: false } }));
    }
  },

  createService: async (serviceData) => {
    set((state) => ({ loading: { ...state.loading, services: true } }));
    try {
      const newService = await financialService.createService(serviceData);
      set((state) => ({ 
        services: [newService, ...state.services],
        loading: { ...state.loading, services: false }
      }));
    } catch (error) {
      console.error('Error creating service:', error);
      set((state) => ({ loading: { ...state.loading, services: false } }));
    }
  },

  // Invoice actions
  fetchInvoices: async (filters) => {
    set((state) => ({ loading: { ...state.loading, invoices: true } }));
    try {
      const invoices = await financialService.getInvoices(filters);
      set({ invoices });
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      set((state) => ({ loading: { ...state.loading, invoices: false } }));
    }
  },

  createInvoice: async (invoiceData) => {
    set((state) => ({ loading: { ...state.loading, invoices: true } }));
    try {
      const newInvoice = await financialService.createInvoice(invoiceData);
      set((state) => ({ 
        invoices: [newInvoice, ...state.invoices],
        loading: { ...state.loading, invoices: false }
      }));
    } catch (error) {
      console.error('Error creating invoice:', error);
      set((state) => ({ loading: { ...state.loading, invoices: false } }));
    }
  },

  updateInvoiceStatus: async (id, status) => {
    set((state) => ({ loading: { ...state.loading, invoices: true } }));
    try {
      const updatedInvoice = await financialService.updateInvoiceStatus(id, status);
      set((state) => ({
        invoices: state.invoices.map(invoice => 
          invoice.id === id ? updatedInvoice : invoice
        ),
        selectedInvoice: state.selectedInvoice?.id === id ? updatedInvoice : state.selectedInvoice,
        loading: { ...state.loading, invoices: false }
      }));
    } catch (error) {
      console.error('Error updating invoice status:', error);
      set((state) => ({ loading: { ...state.loading, invoices: false } }));
    }
  },

  selectInvoice: (invoice) => {
    set({ selectedInvoice: invoice });
  },

  // Payment actions
  fetchPayments: async (invoiceId) => {
    set((state) => ({ loading: { ...state.loading, payments: true } }));
    try {
      const payments = await financialService.getPayments(invoiceId);
      set({ payments });
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      set((state) => ({ loading: { ...state.loading, payments: false } }));
    }
  },

  recordPayment: async (paymentData) => {
    set((state) => ({ loading: { ...state.loading, payments: true } }));
    try {
      const newPayment = await financialService.recordPayment(paymentData);
      set((state) => ({ 
        payments: [newPayment, ...state.payments],
        loading: { ...state.loading, payments: false }
      }));
      
      // Refresh invoices to update payment status
      get().fetchInvoices();
    } catch (error) {
      console.error('Error recording payment:', error);
      set((state) => ({ loading: { ...state.loading, payments: false } }));
    }
  },

  // Subscription actions
  fetchSubscriptions: async () => {
    set((state) => ({ loading: { ...state.loading, subscriptions: true } }));
    try {
      const subscriptions = await financialService.getSubscriptions();
      set({ subscriptions });
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      set((state) => ({ loading: { ...state.loading, subscriptions: false } }));
    }
  },

  createSubscription: async (subscriptionData) => {
    set((state) => ({ loading: { ...state.loading, subscriptions: true } }));
    try {
      const newSubscription = await financialService.createSubscription(subscriptionData);
      set((state) => ({ 
        subscriptions: [newSubscription, ...state.subscriptions],
        loading: { ...state.loading, subscriptions: false }
      }));
    } catch (error) {
      console.error('Error creating subscription:', error);
      set((state) => ({ loading: { ...state.loading, subscriptions: false } }));
    }
  },

  // Analytics actions
  fetchRevenueMetrics: async (period) => {
    set((state) => ({ loading: { ...state.loading, analytics: true } }));
    try {
      const revenueMetrics = await financialService.getRevenueMetrics(period);
      set({ revenueMetrics });
    } catch (error) {
      console.error('Error fetching revenue metrics:', error);
    } finally {
      set((state) => ({ loading: { ...state.loading, analytics: false } }));
    }
  },

  fetchClientRevenueBreakdown: async () => {
    set((state) => ({ loading: { ...state.loading, analytics: true } }));
    try {
      const clientRevenueBreakdown = await financialService.getClientRevenueBreakdown();
      set({ clientRevenueBreakdown });
    } catch (error) {
      console.error('Error fetching client revenue breakdown:', error);
    } finally {
      set((state) => ({ loading: { ...state.loading, analytics: false } }));
    }
  },

  fetchFinancialSummary: async () => {
    set((state) => ({ loading: { ...state.loading, analytics: true } }));
    try {
      const financialSummary = await financialService.getFinancialSummary();
      set({ financialSummary });
    } catch (error) {
      console.error('Error fetching financial summary:', error);
    } finally {
      set((state) => ({ loading: { ...state.loading, analytics: false } }));
    }
  },

  // Filter actions
  setInvoiceStatusFilter: (status) => {
    set((state) => ({
      filters: { ...state.filters, invoiceStatus: status }
    }));
    
    // Apply filter immediately
    const filters = status === 'all' ? undefined : { status };
    get().fetchInvoices(filters);
  },

  setClientFilter: (clientId) => {
    set((state) => ({
      filters: { ...state.filters, clientId }
    }));
    
    // Apply filter immediately
    const filters = clientId === 'all' ? undefined : { client_id: clientId };
    get().fetchInvoices(filters);
  },

  setDateRangeFilter: (range) => {
    set((state) => ({
      filters: { ...state.filters, dateRange: range }
    }));
  },

  clearFilters: () => {
    set({
      filters: {
        invoiceStatus: 'all',
        clientId: 'all',
        dateRange: null,
      }
    });
    get().fetchInvoices();
  },

  // Utility actions
  refreshAllData: async () => {
    const { 
      fetchClients, 
      fetchServices, 
      fetchInvoices, 
      fetchPayments, 
      fetchSubscriptions,
      fetchFinancialSummary
    } = get();
    
    await Promise.all([
      fetchClients(),
      fetchServices(),
      fetchInvoices(),
      fetchPayments(),
      fetchSubscriptions(),
      fetchFinancialSummary()
    ]);
  },

  resetStore: () => {
    set({
      clients: [],
      services: [],
      invoices: [],
      payments: [],
      subscriptions: [],
      revenueMetrics: null,
      clientRevenueBreakdown: [],
      financialSummary: null,
      selectedClient: null,
      selectedInvoice: null,
      filters: {
        invoiceStatus: 'all',
        clientId: 'all',
        dateRange: null,
      },
      loading: {
        clients: false,
        services: false,
        invoices: false,
        payments: false,
        subscriptions: false,
        analytics: false,
      }
    });
  },
}));

// Initialize store data
export const initializeFinancialStore = async () => {
  const store = useFinancialStore.getState();
  await store.refreshAllData();
};