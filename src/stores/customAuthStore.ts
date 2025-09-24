import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { CustomAuthUser, customAuthService, CustomSignInCredentials } from '../services/customAuth';
import { storage } from '../services/storage';

interface CustomAuthState {
  // State
  user: CustomAuthUser | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Actions
  signIn: (credentials: CustomSignInCredentials) => Promise<boolean>;
  createUser: (userData: {
    username: string;
    password: string;
    full_name?: string;
    company?: string;
    email?: string;
  }) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
  initialize: () => Promise<void>;
  
  // Computed
  isAuthenticated: boolean;
  getUserDisplayName: () => string;
}

export const useCustomAuthStore = create<CustomAuthState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    user: null,
    token: null,
    isLoading: false,
    isInitialized: false,
    error: null,
    isAuthenticated: false,

    // Actions
    signIn: async (credentials) => {
      set({ isLoading: true, error: null });
      
      try {
        const { user, token, error } = await customAuthService.signIn(credentials);
        
        if (error) {
          set({ error, isLoading: false });
          return false;
        }

        set({ 
          user, 
          token, 
          isAuthenticated: !!user,
          isLoading: false,
          error: null 
        });

        // Store token for persistence
        if (token) {
          storage.set('custom_auth_token', token);
          localStorage.setItem('iverton_auth_token', token);
        }

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
        set({ error: errorMessage, isLoading: false });
        return false;
      }
    },

    createUser: async (userData) => {
      set({ isLoading: true, error: null });
      
      try {
        const { user, token, error } = await customAuthService.createUser(userData);
        
        if (error) {
          set({ error, isLoading: false });
          return false;
        }

        set({ 
          user, 
          token, 
          isAuthenticated: !!user,
          isLoading: false,
          error: null 
        });

        // Store token for persistence
        if (token) {
          storage.set('custom_auth_token', token);
          localStorage.setItem('iverton_auth_token', token);
        }

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'User creation failed';
        set({ error: errorMessage, isLoading: false });
        return false;
      }
    },

    signOut: async () => {
      const { token } = get();
      set({ isLoading: true, error: null });
      
      try {
        if (token) {
          await customAuthService.signOut(token);
        }

        // Clear all auth-related data
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          isLoading: false,
          error: null 
        });

        // Clear stored token
        storage.remove('custom_auth_token');
        localStorage.removeItem('iverton_auth_token');
        
        // Clear all user data from storage
        storage.remove('iverton_user_data');
        storage.remove('iverton_widget_configs');
        storage.remove('iverton_dashboard_layout');
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
        set({ error: errorMessage, isLoading: false });
      }
    },

    clearError: () => {
      set({ error: null });
    },

    initialize: async () => {
      if (get().isInitialized) return;
      
      set({ isLoading: true, error: null });
      
      try {
        // Try to get stored token
        const storedToken = storage.get<string>('custom_auth_token') || 
                          localStorage.getItem('iverton_auth_token');
        
        if (!storedToken) {
          set({ isLoading: false, isInitialized: true });
          return;
        }

        // Validate the token
        const user = await customAuthService.validateSession(storedToken);
        
        if (user) {
          set({ 
            user, 
            token: storedToken, 
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
            error: null 
          });
        } else {
          // Token is invalid, clear it
          storage.remove('custom_auth_token');
          localStorage.removeItem('iverton_auth_token');
          set({ 
            user: null, 
            token: null, 
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
          token: null, 
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
      return user.full_name || user.username || 'User';
    },
  }))
);

// Auto-initialize when store is created
if (typeof window !== 'undefined') {
  useCustomAuthStore.getState().initialize();
}