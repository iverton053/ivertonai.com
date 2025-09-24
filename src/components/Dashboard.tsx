import React from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from './dashboard/DashboardLayout';
import AIConsoleSection from './dashboard/AIConsoleSection';
import History from './History';
import Analytics from './Analytics';
import Reports from './Reports';
import Settings from './Settings';
import TeamManagement from './agency/TeamManagement';
import PortalManagement from './client-portal/PortalManagement';
import PredictiveAnalytics from './PredictiveAnalytics';
import AdCampaignManager from './AdCampaignManager';
import EnhancedCRMManager from './crm/EnhancedCRMManager';
import IntegrationsMarketplace from './integrations/IntegrationsMarketplace';
import EmailMarketingDashboard from './email-marketing/EmailMarketingDashboard';
import SocialMediaDashboard from './social-media/SocialMediaDashboard';
import AutomationDashboard from './automation/AutomationDashboard';
import OverviewDashboard from './overview/OverviewDashboard';
import { useUserStore, useAppStore } from '../stores';
import { useAnalytics, useAutomations } from '../hooks/useApiData';

interface DashboardProps {
  clientData?: any;
}

const Dashboard = ({ clientData: propClientData }: DashboardProps) => {
  const { user, updateMetrics } = useUserStore();
  const {
    activeSection,
    setActiveSection,
    isLoading,
    error,
  } = useAppStore();

  // Fetch data using hooks
  const { data: analytics, loading: analyticsLoading } = useAnalytics('24h');
  const { loading: automationsLoading } = useAutomations();

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout clientData={propClientData}>
      {/* Render different components based on active section */}
      {activeSection === 'overview' && (
        <OverviewDashboard />
      )}

      {/* AI Console Section */}
      {activeSection === 'ai-console' && (
        <AIConsoleSection
          currentTime={new Date()}
          clientData={propClientData || user}
          isLoading={isLoading}
          error={error}
          analyticsLoading={analyticsLoading}
          automationsLoading={automationsLoading}
          setActiveSection={setActiveSection}
          setAddWidgetModalOpen={() => {}} // Handled by layout
        />
      )}

      {/* History Section */}
      {activeSection === 'history' && (
        <History />
      )}

      {/* Analytics Section */}
      {activeSection === 'analytics' && (
        <Analytics />
      )}

      {/* Reports Section */}
      {activeSection === 'reports' && (
        <Reports />
      )}

      {/* Team Management Section */}
      {activeSection === 'team' && (
        <TeamManagement />
      )}

      {/* Financial Management Section */}
      {activeSection === 'financial' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-xl p-12 text-center"
        >
          <h3 className="text-xl font-semibold text-white mb-2">
            Financial Management
          </h3>
          <p className="text-gray-400">
            Temporarily disabled due to compilation issues. Will be back soon!
          </p>
        </motion.div>
      )}

      {/* Client Portals Section */}
      {activeSection === 'portals' && (
        <PortalManagement />
      )}

      {/* Predictive Analytics Section */}
      {activeSection === 'predictive' && (
        <PredictiveAnalytics />
      )}

      {/* Ad Campaign Manager Section */}
      {activeSection === 'campaigns' && (
        <AdCampaignManager />
      )}

      {/* CRM Management Section */}
      {activeSection === 'crm' && (
        <EnhancedCRMManager />
      )}

      {/* Integrations Section */}
      {activeSection === 'integrations' && (
        <IntegrationsMarketplace />
      )}

      {/* Email Marketing Section */}
      {activeSection === 'email-marketing' && (
        <EmailMarketingDashboard />
      )}

      {/* Social Media Section */}
      {activeSection === 'social-media' && (
        <SocialMediaDashboard />
      )}

      {/* Settings Section */}
      {activeSection === 'settings' && (
        <Settings />
      )}

      {/* Automations Section */}
      {activeSection === 'automations' && (
        <AutomationDashboard />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;