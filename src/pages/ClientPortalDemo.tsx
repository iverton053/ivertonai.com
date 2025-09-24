import React from 'react';
import ClientPortalApp from '../components/client-portal/ClientPortalApp';

const ClientPortalDemo: React.FC = () => {
  return (
    <ClientPortalApp
      portalId="demo-portal-1"
      subdomain="demo-client"
    />
  );
};

export default ClientPortalDemo;