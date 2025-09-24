// Enhanced authentication service with agency hierarchy support

import { storage } from './storage';
import { Agency, AgencyUser, Client, UserInvitation } from '../types/agency';
import { UserRole, Permission } from './permissions';

// Development mode - use mock data instead of API calls
const USE_MOCK_DATA = !import.meta.env.VITE_API_URL;
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3015/api';

interface SignUpData {
  // Agency info (for first user/owner)
  agency_name: string;
  agency_slug?: string;
  subscription_plan?: string;
  
  // User info
  username: string;
  email: string;
  password: string;
  full_name: string;
  company_size?: string;
  industry?: string;
}

interface SignInData {
  username: string;
  password: string;
  agency_slug?: string; // Optional if username is unique across platform
}

interface InviteUserData {
  email: string;
  role: UserRole;
  department?: string;
  assigned_clients?: string[];
}

interface AuthResponse {
  success: boolean;
  user?: AgencyUser;
  agency?: Agency;
  token?: string;
  error?: string;
}

interface InvitationResponse {
  success: boolean;
  invitation?: UserInvitation;
  error?: string;
}

export class AgencyAuthService {
  private static token: string | null = null;
  private static currentUser: AgencyUser | null = null;
  private static currentAgency: Agency | null = null;

  /**
   * Agency Owner Sign Up - Creates new agency and owner user
   */
  static async signUpAgency(data: SignUpData): Promise<AuthResponse> {
    try {
      // Use mock data in development mode
      if (USE_MOCK_DATA) {
        return this.mockSignUpAgency(data);
      }

      // Generate slug if not provided
      const slug = data.agency_slug || this.generateSlug(data.agency_name);
      
      const response = await fetch(`${API_BASE}/auth/signup-agency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          agency_slug: slug,
          role: UserRole.AGENCY_OWNER
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.message || 'Sign up failed' };
      }

      // Store auth data
      if (result.token) {
        this.setAuthData(result.user, result.agency, result.token);
      }

      return {
        success: true,
        user: result.user,
        agency: result.agency,
        token: result.token
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Sign in existing user
   */
  static async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.message || 'Sign in failed' };
      }

      // Store auth data
      if (result.token) {
        this.setAuthData(result.user, result.agency, result.token);
      }

      return {
        success: true,
        user: result.user,
        agency: result.agency,
        token: result.token
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Accept invitation and create account
   */
  static async acceptInvitation(invitationToken: string, userData: {
    username: string;
    password: string;
    full_name: string;
  }): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/auth/accept-invitation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitation_token: invitationToken,
          ...userData
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.message || 'Failed to accept invitation' };
      }

      // Store auth data
      if (result.token) {
        this.setAuthData(result.user, result.agency, result.token);
      }

      return {
        success: true,
        user: result.user,
        agency: result.agency,
        token: result.token
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Invite new user to agency
   */
  static async inviteUser(data: InviteUserData): Promise<InvitationResponse> {
    try {
      const response = await fetch(`${API_BASE}/users/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.message || 'Failed to send invitation' };
      }

      return {
        success: true,
        invitation: result.invitation
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Get all users in agency
   */
  static async getAgencyUsers(): Promise<{ success: boolean; users?: AgencyUser[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/users`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.message || 'Failed to fetch users' };
      }

      return {
        success: true,
        users: result.users
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Get all clients in agency
   */
  static async getAgencyClients(): Promise<{ success: boolean; clients?: Client[]; error?: string }> {
    try {
      // Use mock data in development mode
      if (USE_MOCK_DATA) {
        return this.mockGetClients();
      }

      const response = await fetch(`${API_BASE}/clients`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.message || 'Failed to fetch clients' };
      }

      return {
        success: true,
        clients: result.clients
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Create new client
   */
  static async createClient(clientData: Partial<Client>): Promise<{ success: boolean; client?: Client; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(clientData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.message || 'Failed to create client' };
      }

      return {
        success: true,
        client: result.client
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Assign clients to user
   */
  static async assignClientsToUser(userId: string, clientIds: string[]): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/assign-clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ client_ids: clientIds })
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.message || 'Failed to assign clients' };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Update user role
   */
  static async updateUserRole(userId: string, newRole: UserRole): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.message || 'Failed to update role' };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<void> {
    try {
      if (this.token) {
        await fetch(`${API_BASE}/auth/signout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        });
      }
    } catch (error) {
      console.warn('Sign out request failed:', error);
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * Validate current session
   */
  static async validateSession(token: string): Promise<AgencyUser | null> {
    try {
      const response = await fetch(`${API_BASE}/auth/validate`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      
      if (result.user && result.agency) {
        this.setAuthData(result.user, result.agency, token);
        return result.user;
      }

      return null;
    } catch (error) {
      console.warn('Session validation failed:', error);
      return null;
    }
  }

  /**
   * Get current user and agency
   */
  static getCurrentAuth(): { user: AgencyUser | null; agency: Agency | null; token: string | null } {
    return {
      user: this.currentUser,
      agency: this.currentAgency,
      token: this.token
    };
  }

  /**
   * Initialize from stored data
   */
  static async initialize(): Promise<{ user: AgencyUser | null; agency: Agency | null }> {
    // Try to get stored token
    const storedToken = storage.get<string>('agency_auth_token') || 
                       localStorage.getItem('iverton_agency_token');

    if (!storedToken) {
      return { user: null, agency: null };
    }

    // Validate the token
    const user = await this.validateSession(storedToken);
    
    return {
      user,
      agency: this.currentAgency
    };
  }

  // Mock methods for development
  private static mockSignUpAgency(data: SignUpData): Promise<AuthResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userId = `user_${Date.now()}`;
        const agencyId = `agency_${Date.now()}`;
        const token = `mock_token_${Date.now()}`;
        
        const agency: Agency = {
          id: agencyId,
          name: data.agency_name,
          slug: data.agency_slug || this.generateSlug(data.agency_name),
          subscription_plan: data.subscription_plan || 'basic',
          created_at: Date.now(),
          updated_at: Date.now(),
        };

        const user: AgencyUser = {
          id: userId,
          agency_id: agencyId,
          username: data.username,
          email: data.email,
          full_name: data.full_name,
          role: UserRole.AGENCY_OWNER,
          status: 'active',
          created_at: Date.now(),
          updated_at: Date.now(),
        };

        this.setAuthData(user, agency, token);
        
        resolve({
          success: true,
          user,
          agency,
          token
        });
      }, 500);
    });
  }

  private static mockGetClients(): Promise<{ success: boolean; clients?: Client[]; error?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockClients: Client[] = [
          {
            id: 'client_1',
            agency_id: this.currentAgency?.id || 'agency_1',
            name: 'Tech Startup Co',
            email: 'contact@techstartup.com',
            status: 'active',
            created_at: Date.now() - 86400000,
            updated_at: Date.now(),
          },
          {
            id: 'client_2', 
            agency_id: this.currentAgency?.id || 'agency_1',
            name: 'E-commerce Solutions',
            email: 'hello@ecommerce.com',
            status: 'active',
            created_at: Date.now() - 172800000,
            updated_at: Date.now(),
          }
        ];

        resolve({
          success: true,
          clients: mockClients
        });
      }, 300);
    });
  }

  // Private helper methods
  private static setAuthData(user: AgencyUser, agency: Agency, token: string): void {
    this.currentUser = user;
    this.currentAgency = agency;
    this.token = token;

    // Store in both storage systems for reliability
    storage.set('agency_auth_token', token);
    storage.set('agency_user', user);
    storage.set('agency_data', agency);
    
    localStorage.setItem('iverton_agency_token', token);
    localStorage.setItem('iverton_agency_user', JSON.stringify(user));
    localStorage.setItem('iverton_agency_data', JSON.stringify(agency));
  }

  private static clearAuthData(): void {
    this.currentUser = null;
    this.currentAgency = null;
    this.token = null;

    // Clear from both storage systems
    storage.remove('agency_auth_token');
    storage.remove('agency_user');
    storage.remove('agency_data');
    
    localStorage.removeItem('iverton_agency_token');
    localStorage.removeItem('iverton_agency_user');
    localStorage.removeItem('iverton_agency_data');
    
    // Clear other stored data
    storage.remove('iverton_user_data');
    storage.remove('iverton_widget_configs');
    storage.remove('iverton_dashboard_layout');
  }

  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}