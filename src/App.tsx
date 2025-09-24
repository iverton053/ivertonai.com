import { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import EnhancedDashboard from './components/EnhancedDashboard';
import DataManager from './components/DataManager';
import AuthGuard from './components/auth/AuthGuard';
import ErrorBoundary from './components/ErrorBoundary';
import { useUserStore, useAppStore } from './stores';
import { useCustomAuthStore } from './stores/customAuthStore';
import { useNotificationStore } from './stores/notificationStore';
import { useRealTimeUpdates } from './hooks/useApiData';
import { dataTrackingService } from './services/dataTracking';
import { defaultClientData, ClientData } from './utils/constants';
import { SecurityProvider } from './contexts/SecurityContext';
import SecurityMonitor from './components/security/SecurityMonitor';
import { useNotificationDemo } from './hooks/useNotificationDemo';
import { useThemeIntegration } from './hooks/useThemeIntegration';
import { useSettingsEffects } from './hooks/useSettingsEffects';
import ToastNotifications from './components/notifications/ToastNotifications';
import { useComprehensiveClientStore } from './stores/comprehensiveClientStore';
import AddClientModal from './components/client/AddClientModal';
import EditClientModal from './components/client/EditClientModal';
import ClientOnboardingWizard from './components/client/ClientOnboardingWizard';
import ClientPortalDemo from './pages/ClientPortalDemo';
import PremiumLandingPage from './pages/PremiumLandingPage';
import TermsConditions from './pages/TermsConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AddClientPage from './pages/AddClientPage';

function App() {
  const { user, loadFromStorage: loadUser } = useUserStore();
  const { addNotification } = useAppStore();
  const { user: authUser } = useCustomAuthStore();
  const { loadNotifications } = useNotificationStore();
  const { showAddClientModal, setShowAddClientModal, selectedClient } = useComprehensiveClientStore();
  const { updates, isConnected } = useRealTimeUpdates();
  const [clientData, setClientData] = useState(defaultClientData);

  // Check if we should show specific pages
  const urlParams = new URLSearchParams(window.location.search);
  const showPortalDemo = urlParams.get('demo') === 'portal';
  const showLandingPage = urlParams.get('page') === 'landing' || window.location.pathname === '/landing';
  const showTermsConditions = urlParams.get('page') === 'terms' || window.location.pathname === '/terms';
  const showPrivacyPolicy = urlParams.get('page') === 'privacy' || window.location.pathname === '/privacy';
  const showAddClientPage = urlParams.get('page') === 'add-client' || window.location.pathname === '/add-client';

  // Initialize demo notifications
  useNotificationDemo();
  
  // Initialize theme integration
  useThemeIntegration();
  
  // Initialize settings effects
  useSettingsEffects();

  // Update clientData when auth user or selected client changes
  useEffect(() => {
    if (selectedClient) {
      setClientData((prevData: ClientData) => ({
        ...prevData,
        username: selectedClient.contact.primary_name || prevData.username,
        client_name: selectedClient.name || prevData.client_name,
        company: selectedClient.company || prevData.company,
      }));
    } else if (authUser) {
      setClientData((prevData: ClientData) => ({
        ...prevData,
        username: authUser.username || prevData.username,
        client_name: authUser.full_name || authUser.username || prevData.client_name,
        company: authUser.company || prevData.company,
      }));
    }
  }, [authUser, selectedClient]);

  // Initialize stores on app load
  useEffect(() => {
    loadUser();
    loadNotifications(); // Initialize notification store
    
    // Track app start
    dataTrackingService.trackUserAction('app_started', 'app', { 
      timestamp: Date.now(),
      userAgent: navigator.userAgent 
    });
  }, [loadUser]);

  // Handle real-time updates
  useEffect(() => {
    if (updates.length > 0) {
      const latestUpdate = updates[0];
      
      switch (latestUpdate.type) {
        case 'notification':
          addNotification(latestUpdate.data);
          break;
        case 'stats_update':
          // Handle stats updates if needed
          break;
        case 'automation_progress':
          // Handle automation progress updates if needed
          break;
        default:
          console.log('Unknown update type:', latestUpdate.type);
      }
    }
  }, [updates, addNotification]);

  // Show terms & conditions if requested
  if (showTermsConditions) {
    return (
      <ErrorBoundary>
        <TermsConditions />
      </ErrorBoundary>
    );
  }

  // Show privacy policy if requested
  if (showPrivacyPolicy) {
    return (
      <ErrorBoundary>
        <PrivacyPolicy />
      </ErrorBoundary>
    );
  }

  // Show landing page if requested
  if (showLandingPage) {
    return (
      <ErrorBoundary>
        <PremiumLandingPage />
      </ErrorBoundary>
    );
  }

  // Show client portal demo if requested
  if (showPortalDemo) {
    return (
      <ErrorBoundary>
        <ClientPortalDemo />
      </ErrorBoundary>
    );
  }

  // Show add client page if requested
  if (showAddClientPage) {
    return (
      <ErrorBoundary>
        <AddClientPage />
      </ErrorBoundary>
    );
  }

  // Show loading screen while user data is loading
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Dashboard...</h2>
          <p className="text-gray-300">Setting up your personalized experience</p>
          {!isConnected && (
            <p className="text-yellow-400 text-sm mt-2">Establishing connection...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <SecurityProvider
      config={{
        csrfProtection: true,
        strictMode: true,
        sessionTimeout: 30 * 60 * 1000,
        requireSecureConnection: window.location.protocol === 'https:',
      }}
    >
      <ErrorBoundary>
        {/* AuthGuard disabled for development */}
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
          <EnhancedDashboard clientData={clientData} />
          
          {/* Connection status indicator */}
          {!isConnected && (
            <div className="fixed bottom-4 right-4 bg-warning text-white px-4 py-2 rounded-lg shadow-theme">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
                <span className="text-sm">Reconnecting...</span>
              </div>
            </div>
          )}
          
          {/* Security Monitor */}
          <SecurityMonitor />
          
          {/* Data Manager for monitoring and managing data layer */}
          <DataManager />
          
          {/* Toast Notifications */}
          <ToastNotifications />
          
          
          {/* Add Client Modal */}
          <AddClientModal 
            isOpen={showAddClientModal}
            onClose={() => setShowAddClientModal(false)}
          />
          
          {/* Edit Client Modal */}
          <EditClientModal />
          
          {/* Client Onboarding Wizard */}
          <ClientOnboardingWizard />
        </div>
      </ErrorBoundary>
    </SecurityProvider>
  );
}

export default App;