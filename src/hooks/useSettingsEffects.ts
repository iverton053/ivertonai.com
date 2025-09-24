import { useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

/**
 * Hook to apply settings changes immediately to the UI
 */
export const useSettingsEffects = () => {
  const { settings } = useSettingsStore();

  // Apply notification settings
  useEffect(() => {
    const { notifications } = settings;
    
    // Request notification permission if enabled
    if (notifications.desktopNotifications && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          console.log('Notification permission:', permission);
        });
      }
    }
  }, [settings.notifications.desktopNotifications]);

  // Apply privacy settings
  useEffect(() => {
    const { privacy } = settings;
    
    // Set session timeout
    if (privacy.sessionTimeout && privacy.sessionTimeout > 0) {
      // Clear existing timeout
      if (window.sessionTimeoutId) {
        clearTimeout(window.sessionTimeoutId);
      }
      
      // Set new timeout
      window.sessionTimeoutId = setTimeout(() => {
        console.log('Session timeout reached');
        // Here you could trigger logout or session refresh
      }, privacy.sessionTimeout * 1000);
    }
    
    // Track analytics setting
    if (!privacy.analyticsTracking) {
      console.log('Analytics tracking disabled');
      // Disable analytics tracking
    }
    
    // Error reporting setting
    if (!privacy.errorReporting) {
      console.log('Error reporting disabled');
      // Disable error reporting
    }
    
  }, [settings.privacy]);

  // Apply application settings
  useEffect(() => {
    const { application } = settings;
    
    // Debug mode
    if (application.enableDebugMode) {
      console.log('Debug mode enabled');
      window.debugMode = true;
    } else {
      window.debugMode = false;
    }
    
    // Performance mode adjustments
    const root = document.documentElement;
    
    switch (application.performanceMode) {
      case 'performance':
        root.classList.add('performance-mode');
        root.classList.remove('battery-mode');
        break;
      case 'battery':
        root.classList.add('battery-mode');
        root.classList.remove('performance-mode');
        break;
      case 'balanced':
      default:
        root.classList.remove('performance-mode', 'battery-mode');
        break;
    }
    
  }, [settings.application]);

  // Apply dashboard settings immediately
  useEffect(() => {
    const { dashboard } = settings;
    const root = document.documentElement;
    
    // Apply compact mode
    if (dashboard.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
    
    // Apply animations setting
    if (!dashboard.animationsEnabled) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }
    
    // Apply sidebar collapsed state
    const sidebar = document.querySelector('[data-sidebar]');
    if (sidebar) {
      if (dashboard.sidebarCollapsed) {
        sidebar.classList.add('collapsed');
      } else {
        sidebar.classList.remove('collapsed');
      }
    }
    
    // Store grid settings for components to use
    root.style.setProperty('--dashboard-grid-size', dashboard.gridSize.toString());
    root.style.setProperty('--dashboard-max-widgets-per-row', dashboard.maxWidgetsPerRow.toString());
    root.style.setProperty('--widget-refresh-interval', `${dashboard.widgetRefreshInterval}ms`);
    
  }, [settings.dashboard]);

  // Apply system settings
  useEffect(() => {
    const { system } = settings;
    
    // Maintenance mode
    if (system.maintenanceMode) {
      console.warn('Maintenance mode is enabled');
      // You could show a maintenance banner here
    }
    
    // Set document title with company name
    if (system.companyName) {
      document.title = `${system.companyName} - Dashboard`;
    }
    
    // Apply custom favicon
    if (system.customFavicon) {
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = system.customFavicon;
    }
    
    // Apply brand colors to CSS custom properties
    const root = document.documentElement;
    if (system.brandPrimaryColor) {
      root.style.setProperty('--brand-primary', system.brandPrimaryColor);
    }
    if (system.brandSecondaryColor) {
      root.style.setProperty('--brand-secondary', system.brandSecondaryColor);
    }
    
  }, [settings.system]);

  // Log all settings changes in debug mode
  useEffect(() => {
    if (settings.application.enableDebugMode) {
      console.log('Settings updated:', settings);
    }
  }, [settings]);
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    sessionTimeoutId?: number;
    debugMode?: boolean;
  }
}