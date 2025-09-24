// Enhanced auth store with agency hierarchy support

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Agency, AgencyUser, Client, UserInvitation } from '../types/agency';
import { UserRole, Permission, PermissionService } from '../services/permissions';
import { AgencyAuthService } from '../services/agencyAuth';

interface AgencyState {
  // Auth State
  user: AgencyUser | null;
  agency: Agency | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Agency Data
  agencyUsers: AgencyUser[];
  clients: Client[];
  invitations: UserInvitation[];

  // Current Context
  selectedClientId: string | null;
  availableClients: Client[]; // Filtered by user permissions

  // Actions - Authentication
  signUpAgency: (data: {
    agency_name: string;
    username: string;
    email: string;
    password: string;
    full_name: string;
    company_size?: string;
    industry?: string;
  }) => Promise<boolean>;
  
  signIn: (data: {
    username: string;
    password: string;
    agency_slug?: string;
  }) => Promise<boolean>;
  
  acceptInvitation: (invitationToken: string, userData: {
    username: string;
    password: string;
    full_name: string;
  }) => Promise<boolean>;
  
  signOut: () => Promise<void>;
  
  // Actions - User Management
  inviteUser: (data: {
    email: string;
    role: UserRole;
    department?: string;
    assigned_clients?: string[];
  }) => Promise<boolean>;
  
  updateUserRole: (userId: string, newRole: UserRole) => Promise<boolean>;
  assignClientsToUser: (userId: string, clientIds: string[]) => Promise<boolean>;
  loadAgencyUsers: () => Promise<void>;
  
  // Actions - Client Management
  loadClients: () => Promise<void>;
  createClient: (clientData: Partial<Client>) => Promise<boolean>;
  setSelectedClient: (clientId: string | null) => void;
  
  // Actions - Utility
  clearError: () => void;
  initialize: () => Promise<void>;
  
  // Computed Properties
  isAuthenticated: boolean;
  getUserDisplayName: () => string;
  hasPermission: (permission: Permission) => boolean;
  canAccessClient: (clientId: string) => boolean;
  canManageUser: (targetUser: AgencyUser) => boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isTeamLead: boolean;
}

export const useAgencyStore = create<AgencyState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    user: null,
    agency: null,
    token: null,
    isLoading: false,
    isInitialized: false,
    error: null,
    
    agencyUsers: [],
    clients: [],
    invitations: [],
    
    selectedClientId: null,
    availableClients: [],
    
    isAuthenticated: false,
    isOwner: false,
    isAdmin: false,
    isTeamLead: false,

    // Authentication Actions
    signUpAgency: async (data) => {
      set({ isLoading: true, error: null });
      
      try {
        const result = await AgencyAuthService.signUpAgency(data);
        
        if (!result.success) {
          set({ error: result.error || 'Sign up failed', isLoading: false });
          return false;
        }

        set({
          user: result.user || null,
          agency: result.agency || null,
          token: result.token || null,
          isAuthenticated: !!result.user,
          isOwner: result.user?.role === UserRole.AGENCY_OWNER,
          isAdmin: result.user?.role === UserRole.AGENCY_ADMIN,
          isTeamLead: result.user?.role === UserRole.TEAM_LEAD,
          isLoading: false,
          error: null
        });

        // Load initial data
        if (result.user) {
          get().loadClients();
          get().loadAgencyUsers();
        }

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
        set({ error: errorMessage, isLoading: false });
        return false;
      }
    },

    signIn: async (data) => {
      set({ isLoading: true, error: null });
      
      try {
        const result = await AgencyAuthService.signIn(data);
        
        if (!result.success) {
          set({ error: result.error || 'Sign in failed', isLoading: false });
          return false;
        }

        set({
          user: result.user || null,
          agency: result.agency || null,
          token: result.token || null,
          isAuthenticated: !!result.user,
          isOwner: result.user?.role === UserRole.AGENCY_OWNER,
          isAdmin: result.user?.role === UserRole.AGENCY_ADMIN,
          isTeamLead: result.user?.role === UserRole.TEAM_LEAD,
          isLoading: false,
          error: null
        });

        // Load initial data
        if (result.user) {
          get().loadClients();
          if (result.user.role === UserRole.AGENCY_OWNER || result.user.role === UserRole.AGENCY_ADMIN) {
            get().loadAgencyUsers();
          }
        }

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
        set({ error: errorMessage, isLoading: false });
        return false;
      }
    },

    acceptInvitation: async (invitationToken, userData) => {
      set({ isLoading: true, error: null });
      
      try {
        const result = await AgencyAuthService.acceptInvitation(invitationToken, userData);
        
        if (!result.success) {
          set({ error: result.error || 'Failed to accept invitation', isLoading: false });
          return false;
        }

        set({
          user: result.user || null,
          agency: result.agency || null,
          token: result.token || null,
          isAuthenticated: !!result.user,
          isOwner: result.user?.role === UserRole.AGENCY_OWNER,
          isAdmin: result.user?.role === UserRole.AGENCY_ADMIN,
          isTeamLead: result.user?.role === UserRole.TEAM_LEAD,
          isLoading: false,
          error: null
        });

        // Load initial data
        if (result.user) {
          get().loadClients();
        }

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to accept invitation';
        set({ error: errorMessage, isLoading: false });
        return false;
      }
    },

    signOut: async () => {
      set({ isLoading: true, error: null });
      
      try {
        await AgencyAuthService.signOut();
        
        // Clear all state
        set({
          user: null,
          agency: null,
          token: null,
          isAuthenticated: false,
          isOwner: false,
          isAdmin: false,
          isTeamLead: false,
          isLoading: false,
          error: null,
          agencyUsers: [],
          clients: [],
          invitations: [],
          selectedClientId: null,
          availableClients: []
        });
        
        // Reload page to clear any cached data
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
        set({ error: errorMessage, isLoading: false });
      }
    },

    // User Management Actions
    inviteUser: async (data) => {
      set({ error: null });
      
      try {
        const result = await AgencyAuthService.inviteUser(data);
        
        if (!result.success) {
          set({ error: result.error || 'Failed to send invitation' });
          return false;
        }

        // Refresh users list
        get().loadAgencyUsers();
        
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to send invitation';
        set({ error: errorMessage });
        return false;
      }
    },

    updateUserRole: async (userId, newRole) => {
      set({ error: null });
      
      try {
        const result = await AgencyAuthService.updateUserRole(userId, newRole);
        
        if (!result.success) {
          set({ error: result.error || 'Failed to update role' });
          return false;
        }

        // Update local state
        set((state) => ({
          agencyUsers: state.agencyUsers.map(user =>
            user.id === userId ? { ...user, role: newRole } : user
          )
        }));
        
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update role';
        set({ error: errorMessage });
        return false;
      }
    },

    assignClientsToUser: async (userId, clientIds) => {
      set({ error: null });
      
      try {
        const result = await AgencyAuthService.assignClientsToUser(userId, clientIds);
        
        if (!result.success) {
          set({ error: result.error || 'Failed to assign clients' });
          return false;
        }

        // Update local state
        set((state) => ({
          agencyUsers: state.agencyUsers.map(user =>
            user.id === userId ? { ...user, assigned_clients: clientIds } : user
          )
        }));

        // If it's current user, update available clients
        const { user } = get();
        if (user?.id === userId) {
          get().loadClients();
        }
        
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to assign clients';
        set({ error: errorMessage });
        return false;
      }
    },

    loadAgencyUsers: async () => {
      try {
        const result = await AgencyAuthService.getAgencyUsers();
        
        if (result.success && result.users) {
          set({ agencyUsers: result.users });
        }
      } catch (error) {
        console.warn('Failed to load agency users:', error);
      }
    },

    // Client Management Actions
    loadClients: async () => {
      try {
        const result = await AgencyAuthService.getAgencyClients();
        
        if (result.success && result.clients) {
          set({ clients: result.clients });
          
          // Filter available clients based on user permissions
          const { user } = get();
          if (user) {
            const availableClients = result.clients.filter(client =>
              PermissionService.canAccessClient(user, client.id)
            );
            set({ availableClients });
          }
        } else {
          // Add demo clients if no clients are available
          const demoClients: Client[] = [
            {
              id: 'demo-1',
              name: 'TechStart Solutions',
              website: 'https://techstart-solutions.com',
              industry: 'Technology',
              status: 'active',
              services: ['SEO', 'Content Marketing', 'Social Media'],
              contact_email: 'admin@techstart-solutions.com',
              contact_phone: '+1 (555) 123-4567',
              billing_address: '123 Tech Street, San Francisco, CA 94105',
              notes: 'Fast-growing tech startup focused on B2B solutions',
              created_at: new Date('2024-01-15').toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'demo-2',
              name: 'GreenLeaf Organics',
              website: 'https://greenleaf-organics.com',
              industry: 'E-commerce',
              status: 'active',
              services: ['SEO', 'PPC', 'Email Marketing'],
              contact_email: 'marketing@greenleaf-organics.com',
              contact_phone: '+1 (555) 987-6543',
              billing_address: '456 Organic Way, Portland, OR 97201',
              notes: 'Organic food e-commerce with strong sustainability focus',
              created_at: new Date('2024-02-01').toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'demo-3',
              name: 'Urban Design Studio',
              website: 'https://urban-design-studio.com',
              industry: 'Design',
              status: 'paused',
              services: ['SEO', 'Content Marketing'],
              contact_email: 'hello@urban-design-studio.com',
              contact_phone: '+1 (555) 456-7890',
              billing_address: '789 Creative Ave, New York, NY 10001',
              notes: 'Architecture and interior design firm - campaign on hold',
              created_at: new Date('2024-01-20').toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'demo-4',
              name: 'FitLife Wellness Center',
              website: 'https://fitlife-wellness.com',
              industry: 'Health & Fitness',
              status: 'active',
              services: ['Local SEO', 'Social Media', 'Google Ads'],
              contact_email: 'info@fitlife-wellness.com',
              contact_phone: '+1 (555) 321-0987',
              billing_address: '321 Fitness Blvd, Austin, TX 73301',
              notes: 'Local wellness center expanding to multiple locations',
              created_at: new Date('2024-03-01').toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'demo-5',
              name: 'Prospect Consulting',
              website: 'https://prospect-consulting.com',
              industry: 'Business Services',
              status: 'prospect',
              services: ['SEO Audit', 'Content Strategy'],
              contact_email: 'leads@prospect-consulting.com',
              contact_phone: '+1 (555) 555-0123',
              billing_address: '555 Business Park, Chicago, IL 60601',
              notes: 'Potential client - currently in discovery phase',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];

          set({ clients: demoClients });
          
          // All demo clients are available to all users for demo purposes
          const { user } = get();
          if (user) {
            set({ availableClients: demoClients });
          }
        }
      } catch (error) {
        console.warn('Failed to load clients:', error);
        
        // Fallback to demo clients on error
        const demoClients: Client[] = [
          {
            id: 'demo-1',
            name: 'TechStart Solutions',
            website: 'https://techstart-solutions.com',
            industry: 'Technology',
            status: 'active',
            services: ['SEO', 'Content Marketing', 'Social Media'],
            contact_email: 'admin@techstart-solutions.com',
            contact_phone: '+1 (555) 123-4567',
            billing_address: '123 Tech Street, San Francisco, CA 94105',
            notes: 'Fast-growing tech startup focused on B2B solutions',
            created_at: new Date('2024-01-15').toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'demo-2',
            name: 'GreenLeaf Organics',
            website: 'https://greenleaf-organics.com',
            industry: 'E-commerce',
            status: 'active',
            services: ['SEO', 'PPC', 'Email Marketing'],
            contact_email: 'marketing@greenleaf-organics.com',
            contact_phone: '+1 (555) 987-6543',
            billing_address: '456 Organic Way, Portland, OR 97201',
            notes: 'Organic food e-commerce with strong sustainability focus',
            created_at: new Date('2024-02-01').toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'demo-3',
            name: 'Urban Design Studio',
            website: 'https://urban-design-studio.com',
            industry: 'Design',
            status: 'paused',
            services: ['SEO', 'Content Marketing'],
            contact_email: 'hello@urban-design-studio.com',
            contact_phone: '+1 (555) 456-7890',
            billing_address: '789 Creative Ave, New York, NY 10001',
            notes: 'Architecture and interior design firm - campaign on hold',
            created_at: new Date('2024-01-20').toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'demo-4',
            name: 'FitLife Wellness Center',
            website: 'https://fitlife-wellness.com',
            industry: 'Health & Fitness',
            status: 'active',
            services: ['Local SEO', 'Social Media', 'Google Ads'],
            contact_email: 'info@fitlife-wellness.com',
            contact_phone: '+1 (555) 321-0987',
            billing_address: '321 Fitness Blvd, Austin, TX 73301',
            notes: 'Local wellness center expanding to multiple locations',
            created_at: new Date('2024-03-01').toISOString(),
            updated_at: new Date().toISOString()
          }
        ];

        set({ clients: demoClients, availableClients: demoClients });
      }
    },

    createClient: async (clientData) => {
      set({ error: null });
      
      try {
        const result = await AgencyAuthService.createClient(clientData);
        
        if (!result.success) {
          set({ error: result.error || 'Failed to create client' });
          return false;
        }

        // Refresh clients list
        get().loadClients();
        
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create client';
        set({ error: errorMessage });
        return false;
      }
    },

    setSelectedClient: (clientId) => {
      const { user } = get();
      
      // Check if user can access this client
      if (clientId && user && !PermissionService.canAccessClient(user, clientId)) {
        set({ error: 'You do not have access to this client' });
        return;
      }
      
      set({ selectedClientId: clientId, error: null });
    },

    // Utility Actions
    clearError: () => {
      set({ error: null });
    },

    initialize: async () => {
      if (get().isInitialized) return;
      
      set({ isLoading: true, error: null });
      
      try {
        const { user, agency } = await AgencyAuthService.initialize();
        
        if (user && agency) {
          set({
            user,
            agency,
            token: AgencyAuthService.getCurrentAuth().token,
            isAuthenticated: true,
            isOwner: user.role === UserRole.AGENCY_OWNER,
            isAdmin: user.role === UserRole.AGENCY_ADMIN,
            isTeamLead: user.role === UserRole.TEAM_LEAD,
            isLoading: false,
            isInitialized: true,
            error: null
          });

          // Load initial data
          get().loadClients();
          if (user.role === UserRole.AGENCY_OWNER || user.role === UserRole.AGENCY_ADMIN) {
            get().loadAgencyUsers();
          }
        } else {
          set({
            user: null,
            agency: null,
            token: null,
            isAuthenticated: false,
            isOwner: false,
            isAdmin: false,
            isTeamLead: false,
            isLoading: false,
            isInitialized: true,
            error: null
          });
        }
      } catch (error) {
        console.error('Agency auth initialization error:', error);
        set({
          user: null,
          agency: null,
          token: null,
          isAuthenticated: false,
          isOwner: false,
          isAdmin: false,
          isTeamLead: false,
          isLoading: false,
          isInitialized: true,
          error: null
        });
      }
    },

    // Computed Properties
    getUserDisplayName: () => {
      const { user } = get();
      if (!user) return 'User';
      return user.full_name || user.username || user.email || 'User';
    },

    hasPermission: (permission) => {
      const { user } = get();
      if (!user) return false;
      return PermissionService.hasPermission(user, permission);
    },

    canAccessClient: (clientId) => {
      const { user } = get();
      if (!user) return false;
      return PermissionService.canAccessClient(user, clientId);
    },

    canManageUser: (targetUser) => {
      const { user } = get();
      if (!user) return false;
      return PermissionService.canManageUser(user, targetUser);
    },
  }))
);

// Auto-initialize when store is created
if (typeof window !== 'undefined') {
  useAgencyStore.getState().initialize();
}