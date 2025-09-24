import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';

export interface CustomAuthUser {
  id: string;
  username: string;
  full_name?: string;
  company?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CustomSignInCredentials {
  username: string;
  password: string;
}

export interface CustomAuthResponse {
  user: CustomAuthUser | null;
  token: string | null;
  error: string | null;
}

/**
 * Custom Authentication service that uses username/password stored in your profiles table
 */
export class CustomAuthService {
  private static instance: CustomAuthService;

  private constructor() {}

  static getInstance(): CustomAuthService {
    if (!CustomAuthService.instance) {
      CustomAuthService.instance = new CustomAuthService();
    }
    return CustomAuthService.instance;
  }

  /**
   * Sign in with username and password (stored in your profiles table)
   */
  async signIn(credentials: CustomSignInCredentials): Promise<CustomAuthResponse> {
    try {
      // Use Supabase RPC to verify password server-side (more secure)
      const { data: isValid, error: verifyError } = await supabase.rpc('verify_user_password', {
        p_username: credentials.username,
        p_password: credentials.password
      });

      if (verifyError || !isValid) {
        return {
          user: null,
          token: null,
          error: 'Invalid username or password. Please check your credentials and try again.',
        };
      }

      // Get user data if password is valid
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, username, full_name, company, avatar_url, created_at, updated_at')
        .eq('username', credentials.username)
        .eq('is_active', true)
        .single();

      if (userError || !userData) {
        return {
          user: null,
          token: null,
          error: 'User account not found or inactive.',
        };
      }

      // Generate a simple session token
      const token = this.generateSessionToken(userData.id);
      
      // Store session in database
      await this.createUserSession(userData.id, token);

      // Update last login
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userData.id);

      return {
        user: {
          id: userData.id,
          username: userData.username,
          full_name: userData.full_name,
          company: userData.company,
          avatar_url: userData.avatar_url,
          created_at: userData.created_at,
          updated_at: userData.updated_at,
        },
        token,
        error: null,
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        user: null,
        token: null,
        error: 'An unexpected error occurred during sign in',
      };
    }
  }

  /**
   * Create a new user with username/password
   */
  async createUser(userData: {
    username: string;
    password: string;
    full_name?: string;
    company?: string;
    email?: string;
  }): Promise<CustomAuthResponse> {
    try {
      // Use Supabase RPC to create user with hashed password (server-side)
      const { data: userId, error: createError } = await supabase.rpc('create_custom_user', {
        p_username: userData.username,
        p_password: userData.password,
        p_full_name: userData.full_name || null,
        p_company: userData.company || null,
        p_email: userData.email || null,
      });

      if (createError) {
        // Handle specific error cases
        if (createError.message?.includes('duplicate key')) {
          return {
            user: null,
            token: null,
            error: 'Username already exists. Please choose a different username.',
          };
        }
        
        return {
          user: null,
          token: null,
          error: createError.message || 'Failed to create user account',
        };
      }

      if (!userId) {
        return {
          user: null,
          token: null,
          error: 'Failed to create user account',
        };
      }

      // Get the created user data
      const { data: newUser, error: userError } = await supabase
        .from('profiles')
        .select('id, username, full_name, company, avatar_url, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (userError || !newUser) {
        return {
          user: null,
          token: null,
          error: 'Failed to retrieve user data after creation',
        };
      }

      // Generate session token
      const token = this.generateSessionToken(newUser.id);
      await this.createUserSession(newUser.id, token);

      return {
        user: {
          id: newUser.id,
          username: newUser.username,
          full_name: newUser.full_name,
          company: newUser.company,
          avatar_url: newUser.avatar_url,
          created_at: newUser.created_at,
          updated_at: newUser.updated_at,
        },
        token,
        error: null,
      };
    } catch (error) {
      console.error('Create user error:', error);
      return {
        user: null,
        token: null,
        error: 'An unexpected error occurred during user creation',
      };
    }
  }

  /**
   * Validate session token
   */
  async validateSession(token: string): Promise<CustomAuthUser | null> {
    try {
      // Check if session exists and is valid
      const { data: sessionData, error } = await supabase
        .from('user_sessions')
        .select(`
          user_id,
          profiles!inner(
            id,
            username,
            full_name,
            company,
            avatar_url,
            created_at,
            updated_at
          )
        `)
        .eq('token', token)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (error || !sessionData) {
        return null;
      }

      return {
        id: sessionData.profiles.id,
        username: sessionData.profiles.username,
        full_name: sessionData.profiles.full_name,
        company: sessionData.profiles.company,
        avatar_url: sessionData.profiles.avatar_url,
        created_at: sessionData.profiles.created_at,
        updated_at: sessionData.profiles.updated_at,
      };
    } catch (error) {
      console.error('Validate session error:', error);
      return null;
    }
  }

  /**
   * Sign out user
   */
  async signOut(token: string): Promise<{ error: string | null }> {
    try {
      // Deactivate session
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('token', token);

      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: 'Failed to sign out' };
    }
  }

  /**
   * Private helper methods
   */
  private generateSessionToken(userId: string): string {
    // Simple token generation - in production, use a proper JWT library
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    return `${userId}_${timestamp}_${randomString}`;
  }

  private async createUserSession(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
      });
  }
}

// Export singleton instance
export const customAuthService = CustomAuthService.getInstance();