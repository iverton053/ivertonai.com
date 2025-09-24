import { supabase } from '../lib/supabase';
import { AuthError, Session, User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email?: string;
  username?: string;
  full_name?: string;
  company?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SignInCredentials {
  username: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  username: string;
  full_name?: string;
  company?: string;
}

export interface AuthResponse {
  user: AuthUser | null;
  session: Session | null;
  error: string | null;
}

/**
 * Authentication service using Supabase
 */
export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Sign in with username and password
   */
  async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
    try {
      // First, find user by username to get their email
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', credentials.username)
        .single();

      if (profileError || !profileData) {
        return {
          user: null,
          session: null,
          error: 'Invalid username or password. Please check your credentials and try again.',
        };
      }

      // Get the auth user to find their email
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(profileData.id);
      
      if (authError || !authUser.user?.email) {
        return {
          user: null,
          session: null,
          error: 'Invalid username or password. Please check your credentials and try again.',
        };
      }

      // Now sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authUser.user.email,
        password: credentials.password,
      });

      if (error) {
        return {
          user: null,
          session: null,
          error: this.formatAuthError(error),
        };
      }

      // Get user profile data
      const profile = await this.getUserProfile(data.user.id);

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          ...profile,
        },
        session: data.session,
        error: null,
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        user: null,
        session: null,
        error: 'An unexpected error occurred during sign in',
      };
    }
  }

  /**
   * Sign up with email, password, and profile information
   */
  async signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            username: credentials.username,
            full_name: credentials.full_name,
            company: credentials.company,
          },
        },
      });

      if (error) {
        return {
          user: null,
          session: null,
          error: this.formatAuthError(error),
        };
      }

      if (!data.user) {
        return {
          user: null,
          session: null,
          error: 'Failed to create user account',
        };
      }

      // Create profile in database
      await this.createUserProfile({
        id: data.user.id,
        email: data.user.email!,
        username: credentials.username,
        full_name: credentials.full_name,
        company: credentials.company,
        avatar_url: null,
      });

      const profile = await this.getUserProfile(data.user.id);

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          ...profile,
        },
        session: data.session,
        error: null,
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        user: null,
        session: null,
        error: 'An unexpected error occurred during sign up',
      };
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { error: this.formatAuthError(error) };
      }

      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: 'Failed to sign out' };
    }
  }

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<{ session: Session | null; error: string | null }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        return { session: null, error: this.formatAuthError(error) };
      }

      return { session, error: null };
    } catch (error) {
      console.error('Get session error:', error);
      return { session: null, error: 'Failed to get session' };
    }
  }

  /**
   * Get current user with profile data
   */
  async getCurrentUser(): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        return { user: null, error: this.formatAuthError(error) };
      }

      if (!user) {
        return { user: null, error: null };
      }

      const profile = await this.getUserProfile(user.id);

      return {
        user: {
          id: user.id,
          email: user.email,
          ...profile,
        },
        error: null,
      };
    } catch (error) {
      console.error('Get user error:', error);
      return { user: null, error: 'Failed to get user' };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<AuthUser>): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return { user: null, error: 'User not authenticated' };
      }

      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) {
        return { user: null, error: 'Failed to update profile' };
      }

      // Get updated profile
      const profile = await this.getUserProfile(user.id);

      return {
        user: {
          id: user.id,
          email: user.email,
          ...profile,
        },
        error: null,
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return { user: null, error: 'Failed to update profile' };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { error: this.formatAuthError(error) };
      }

      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: 'Failed to send reset password email' };
    }
  }

  /**
   * Listen for auth state changes
   */
  onAuthStateChange(callback: (user: AuthUser | null, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        const profile = await this.getUserProfile(session.user.id);
        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email,
          ...profile,
        };
        callback(user, session);
      } else {
        callback(null, null);
      }
    });
  }

  /**
   * Private helper methods
   */
  private async getUserProfile(userId: string): Promise<Partial<AuthUser>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email, username, full_name, company, avatar_url, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (error || !data) {
        console.warn('Failed to get user profile:', error);
        return {};
      }

      return {
        email: data.email,
        username: data.username,
        full_name: data.full_name,
        company: data.company,
        avatar_url: data.avatar_url,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.warn('Get profile error:', error);
      return {};
    }
  }

  private async createUserProfile(profile: {
    id: string;
    email: string;
    username: string;
    full_name?: string;
    company?: string;
    avatar_url?: string | null;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: profile.id,
          email: profile.email,
          username: profile.username,
          full_name: profile.full_name,
          company: profile.company,
          avatar_url: profile.avatar_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Failed to create user profile:', error);
        throw error;
      }
    } catch (error) {
      console.error('Create profile error:', error);
      throw error;
    }
  }

  private formatAuthError(error: AuthError): string {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Invalid username or password. Please check your credentials and try again.';
      case 'Email not confirmed':
        return 'Please confirm your email address before signing in.';
      case 'User already registered':
        return 'An account with this email already exists. Please sign in instead.';
      case 'Password should be at least 6 characters':
        return 'Password must be at least 6 characters long.';
      case 'Unable to validate email address: invalid format':
        return 'Please enter a valid username.';
      case 'signup_disabled':
        return 'New account registration is currently disabled.';
      default:
        return error.message || 'An authentication error occurred.';
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();