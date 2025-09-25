import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  User,
  Organization,
  AuthState,
  LoginCredentials,
  SignupData,
  Permission,
  ROLE_PERMISSIONS,
  DEFAULT_USER_PREFERENCES
} from '../types/auth';

// Auth actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'LOGIN_SUCCESS'; user: User; organization: Organization }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; user: Partial<User> }
  | { type: 'UPDATE_ORGANIZATION'; organization: Partial<Organization> }
  | { type: 'AUTH_ERROR'; error: string }
  | { type: 'CLEAR_ERROR' };

// Auth context interface
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (data: SignupData) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  updateOrganization: (updates: Partial<Organization>) => Promise<boolean>;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  switchOrganization: (organizationId: string) => Promise<boolean>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
}

// Initial auth state
const initialState: AuthState = {
  user: null,
  organization: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.user,
        organization: action.organization,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        organization: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.user } : null
      };

    case 'UPDATE_ORGANIZATION':
      return {
        ...state,
        organization: state.organization ? { ...state.organization, ...action.organization } : null
      };

    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.error
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
}

// Create auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Mock authentication service (replace with real implementation)
class AuthService {
  private static readonly STORAGE_KEY = 'auth_session';

  static async login(credentials: LoginCredentials): Promise<{ user: User; organization: Organization }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock authentication logic
    if (credentials.email === 'demo@example.com' && credentials.password === 'demo123') {
      const user: User = {
        id: 'user_1',
        email: credentials.email,
        name: 'Demo User',
        avatar: undefined,
        role: 'brand_manager',
        organizationId: 'org_1',
        organizationName: 'Demo Organization',
        permissions: ROLE_PERMISSIONS.brand_manager,
        preferences: DEFAULT_USER_PREFERENCES,
        createdAt: new Date('2024-01-01'),
        lastLoginAt: new Date(),
        isActive: true
      };

      const organization: Organization = {
        id: 'org_1',
        name: 'Demo Organization',
        slug: 'demo-org',
        logo: undefined,
        website: 'https://demo.example.com',
        industry: 'Technology',
        size: 'medium',
        plan: {
          id: 'plan_pro',
          name: 'Professional',
          tier: 'professional',
          maxUsers: 50,
          maxAssets: 10000,
          maxStorage: 100 * 1024 * 1024 * 1024, // 100GB
          features: ['Advanced Analytics', 'Version Control', 'Custom Branding', 'API Access'],
          price: { monthly: 99, yearly: 999 }
        },
        settings: {
          brandColors: ['#7c3aed', '#a855f7', '#c084fc'],
          allowedFileTypes: ['png', 'jpg', 'svg', 'pdf', 'eps', 'ai', 'psd'],
          maxFileSize: 100 * 1024 * 1024, // 100MB
          requireApproval: true,
          enableVersionControl: true,
          enableUsageTracking: true,
          defaultAssetTags: ['brand', 'approved'],
          customFields: []
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      };

      // Store session
      const session = { user, organization, timestamp: Date.now() };
      if (credentials.rememberMe) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
      } else {
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
      }

      return { user, organization };
    }

    throw new Error('Invalid email or password');
  }

  static async logout(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.STORAGE_KEY);
  }

  static async signup(data: SignupData): Promise<{ user: User; organization: Organization }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock signup logic
    const user: User = {
      id: `user_${Date.now()}`,
      email: data.email,
      name: data.name,
      avatar: undefined,
      role: data.role || 'org_admin',
      organizationId: `org_${Date.now()}`,
      organizationName: data.organizationName,
      permissions: ROLE_PERMISSIONS[data.role || 'org_admin'],
      preferences: DEFAULT_USER_PREFERENCES,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      isActive: true
    };

    const organization: Organization = {
      id: user.organizationId,
      name: data.organizationName,
      slug: data.organizationName.toLowerCase().replace(/\s+/g, '-'),
      plan: {
        id: 'plan_free',
        name: 'Free',
        tier: 'free',
        maxUsers: 5,
        maxAssets: 100,
        maxStorage: 1024 * 1024 * 1024, // 1GB
        features: ['Basic Analytics', 'Asset Library'],
      },
      settings: {
        brandColors: ['#7c3aed'],
        allowedFileTypes: ['png', 'jpg', 'svg', 'pdf'],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        requireApproval: false,
        enableVersionControl: false,
        enableUsageTracking: true,
        defaultAssetTags: ['brand'],
        customFields: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store session
    const session = { user, organization, timestamp: Date.now() };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));

    return { user, organization };
  }

  static getStoredSession(): { user: User; organization: Organization } | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY) || sessionStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const session = JSON.parse(stored);

        // Check if session is still valid (24 hours for localStorage, session for sessionStorage)
        const maxAge = localStorage.getItem(this.STORAGE_KEY) ? 24 * 60 * 60 * 1000 : Infinity;
        if (Date.now() - session.timestamp < maxAge) {
          return {
            user: {
              ...session.user,
              createdAt: new Date(session.user.createdAt),
              lastLoginAt: session.user.lastLoginAt ? new Date(session.user.lastLoginAt) : undefined
            },
            organization: {
              ...session.organization,
              createdAt: new Date(session.organization.createdAt),
              updatedAt: new Date(session.organization.updatedAt)
            }
          };
        } else {
          // Session expired, remove it
          this.logout();
        }
      }
    } catch (error) {
      console.error('Error loading stored session:', error);
      this.logout();
    }
    return null;
  }
}

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      dispatch({ type: 'AUTH_START' });

      try {
        const session = AuthService.getStoredSession();
        if (session) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            user: session.user,
            organization: session.organization
          });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        dispatch({ type: 'AUTH_ERROR', error: 'Failed to initialize authentication' });
      }
    };

    initAuth();
  }, []);

  // Auth methods
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const { user, organization } = await AuthService.login(credentials);
      dispatch({ type: 'LOGIN_SUCCESS', user, organization });
      return true;
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', error: error instanceof Error ? error.message : 'Login failed' });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    await AuthService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const signup = async (data: SignupData): Promise<boolean> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const { user, organization } = await AuthService.signup(data);
      dispatch({ type: 'LOGIN_SUCCESS', user, organization });
      return true;
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', error: error instanceof Error ? error.message : 'Signup failed' });
      return false;
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!state.user) return false;

    try {
      // In real implementation, make API call here
      dispatch({ type: 'UPDATE_USER', user: updates });
      return true;
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', error: 'Failed to update profile' });
      return false;
    }
  };

  const updateOrganization = async (updates: Partial<Organization>): Promise<boolean> => {
    if (!state.organization) return false;

    try {
      // In real implementation, make API call here
      dispatch({ type: 'UPDATE_ORGANIZATION', organization: updates });
      return true;
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', error: 'Failed to update organization' });
      return false;
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    return state.user?.permissions.includes(permission) ?? false;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const switchOrganization = async (organizationId: string): Promise<boolean> => {
    // In real implementation, this would switch the user's active organization
    console.log('Switch to organization:', organizationId);
    return false; // Not implemented in demo
  };

  const refreshAuth = async (): Promise<void> => {
    // In real implementation, refresh auth token and user data
    const session = AuthService.getStoredSession();
    if (session) {
      dispatch({ type: 'LOGIN_SUCCESS', user: session.user, organization: session.organization });
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    signup,
    updateProfile,
    updateOrganization,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    switchOrganization,
    refreshAuth,
    clearError
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// HOC for protected routes
export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
            <p className="text-gray-400">Please log in to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

// Component for permission-based rendering
interface PermissionGateProps {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  children
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions.length > 0) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  } else {
    hasAccess = true; // No permissions specified, allow access
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};