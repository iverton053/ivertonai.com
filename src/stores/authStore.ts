import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Session } from '@supabase/supabase-js';
import { AuthUser, authService, SignInCredentials, SignUpCredentials } from '../services/auth';
import { storage } from '../services/storage';

interface AuthState {
  // State
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Actions
  signIn: (credentials: SignInCredentials) => Promise<boolean>;
  signUp: (credentials: SignUpCredentials) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  clearError: () => void;
  initialize: () => Promise<void>;
  
  // Computed
  isAuthenticated: boolean;
  getUserDisplayName: () => string;
  hasCompletedProfile: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    user: null,
    session: null,
    isLoading: false,
    isInitialized: false,
    error: null,
    isAuthenticated: false,

    // Actions
    signIn: async (credentials) => {
      set({ isLoading: true, error: null });
      
      try {
        const { user, session, error } = await authService.signIn(credentials);
        
        if (error) {
          set({ error, isLoading: false });
          return false;
        }

        set({ 
          user, 
          session, 
          isAuthenticated: !!user,
          isLoading: false,
          error: null 
        });

        // Store session info for persistence
        if (session) {
          storage.set('auth_session', {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
            user_id: user?.id,
          });
        }

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
        set({ error: errorMessage, isLoading: false });
        return false;
      }
    },

    signUp: async (credentials) => {
      set({ isLoading: true, error: null });
      
      try {
        const { user, session, error } = await authService.signUp(credentials);
        
        if (error) {
          set({ error, isLoading: false });
          return false;
        }

        set({ 
          user, 
          session, 
          isAuthenticated: !!user,
          isLoading: false,
          error: null 
        });

        // Store session info for persistence
        if (session) {
          storage.set('auth_session', {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
            user_id: user?.id,
          });
        }

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
        set({ error: errorMessage, isLoading: false });
        return false;
      }
    },

    signOut: async () => {
      set({ isLoading: true, error: null });
      
      try {
        const { error } = await authService.signOut();
        
        if (error) {
          set({ error, isLoading: false });
          return;
        }

        // Clear all auth-related data
        set({ 
          user: null, 
          session: null, 
          isAuthenticated: false,
          isLoading: false,
          error: null 
        });

        // Clear stored session
        storage.remove('auth_session');
        
        // Clear all user data from storage
        storage.remove('iverton_user_data');
        storage.remove('iverton_widget_configs');
        storage.remove('iverton_dashboard_layout');
        
        // Clear caches
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
        set({ error: errorMessage, isLoading: false });
      }
    },

    updateProfile: async (updates) => {
      set({ isLoading: true, error: null });
      
      try {
        const { user, error } = await authService.updateProfile(updates);
        
        if (error) {
          set({ error, isLoading: false });
          return false;
        }

        set({ user, isLoading: false, error: null });
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
        set({ error: errorMessage, isLoading: false });
        return false;
      }
    },

    resetPassword: async (email) => {
      set({ isLoading: true, error: null });
      
      try {
        const { error } = await authService.resetPassword(email);
        
        if (error) {
          set({ error, isLoading: false });
          return false;
        }

        set({ isLoading: false, error: null });
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
        set({ error: errorMessage, isLoading: false });
        return false;
      }
    },

    clearError: () => {
      set({ error: null });
    },

    initialize: async () => {
      if (get().isInitialized) return;
      
      set({ isLoading: true, error: null });
      
      try {
        // Try to get current session
        const { session, error: sessionError } = await authService.getCurrentSession();
        
        if (sessionError) {
          console.warn('Session error:', sessionError);
          set({ isLoading: false, isInitialized: true });
          return;
        }

        if (session?.user) {
          // Get current user with profile
          const { user, error: userError } = await authService.getCurrentUser();
          
          if (userError) {
            console.warn('User error:', userError);
            set({ isLoading: false, isInitialized: true });
            return;
          }

          set({ 
            user, 
            session, 
            isAuthenticated: !!user,
            isLoading: false,
            isInitialized: true,
            error: null 
          });

          // Store session info
          if (session) {
            storage.set('auth_session', {
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: session.expires_at,
              user_id: user?.id,
            });
          }
        } else {
          set({ 
            user: null, 
            session: null, 
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
            error: null 
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        set({ 
          user: null, 
          session: null, 
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
          error: null 
        });
      }
    },

    // Computed values
    getUserDisplayName: () => {
      const { user } = get();
      if (!user) return 'User';
      return user.full_name || user.username || user.email || 'User';
    },

    hasCompletedProfile: () => {
      const { user } = get();
      return !!(user?.username && user?.full_name);
    },
  }))
);

// Initialize auth state and set up auth state listener
let authStateSubscription: (() => void) | null = null;

export const initializeAuth = async () => {
  // Initialize the store
  await useAuthStore.getState().initialize();
  
  // Set up auth state change listener
  if (authStateSubscription) {
    authStateSubscription();
  }
  
  authStateSubscription = authService.onAuthStateChange((user, session) => {
    const currentState = useAuthStore.getState();
    
    // Only update if the state has actually changed
    if (currentState.user?.id !== user?.id) {
      useAuthStore.setState({
        user,
        session,
        isAuthenticated: !!user,
        error: null,
        isInitialized: true,
      });

      // Store session info
      if (session) {
        storage.set('auth_session', {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
          user_id: user?.id,
        });
      } else {
        storage.remove('auth_session');
      }
    }
  });
};

// Clean up auth subscription
export const cleanupAuth = () => {
  if (authStateSubscription) {
    authStateSubscription();
    authStateSubscription = null;
  }
};

// Auto-initialize when store is created
if (typeof window !== 'undefined') {
  initializeAuth();
}