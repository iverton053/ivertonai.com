// Agency-related TypeScript types

export interface Agency {
  id: string;
  name: string;
  slug: string;
  subscription_plan: 'starter' | 'professional' | 'enterprise';
  subscription_status: 'active' | 'suspended' | 'canceled';
  max_users: number;
  max_clients: number;
  billing_email?: string;
  website?: string;
  industry?: string;
  company_size?: string;
  
  // Branding
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  custom_domain?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // Settings
  settings: Record<string, any>;
  features: Record<string, boolean>;
}

export interface AgencyUser {
  id: string;
  agency_id: string;
  username: string;
  email: string;
  full_name?: string;
  role: UserRole;
  permissions?: Permission[];
  department?: string;
  status: 'active' | 'inactive' | 'invited' | 'suspended';
  last_login?: string;
  invitation_token?: string;
  invitation_expires_at?: string;
  preferences: Record<string, any>;
  assigned_clients: string[];
  created_at: string;
  updated_at: string;
  invited_by?: string;
}

export interface Client {
  id: string;
  agency_id: string;
  name: string;
  website?: string;
  industry?: string;
  company_size?: string;
  
  // Contact Info
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  
  // Business Info
  monthly_retainer?: number;
  currency: string;
  contract_start?: string;
  contract_end?: string;
  
  // Services
  services: string[];
  goals: string[];
  target_keywords: string[];
  
  // Assignment
  assigned_users: string[];
  primary_contact?: string;
  
  // Settings
  dashboard_settings: Record<string, any>;
  reporting_frequency: 'weekly' | 'monthly' | 'quarterly';
  
  // Status
  status: 'active' | 'paused' | 'churned' | 'prospect';
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface UserInvitation {
  id: string;
  agency_id: string;
  email: string;
  role: UserRole;
  department?: string;
  invited_by: string;
  invitation_token: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'expired';
  created_at: string;
}

export interface ActivityLog {
  id: string;
  agency_id: string;
  user_id: string;
  client_id?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Import from permissions.ts
import { UserRole, Permission } from '../services/permissions';