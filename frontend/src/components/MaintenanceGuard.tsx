import React from 'react';
import { useConfig } from '@/context/ConfigContext';
import { MaintenancePage } from '@/pages/MaintenancePage';
import { useLocation } from 'react-router-dom';

export const MaintenanceGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { config, loading } = useConfig();
  const location = useLocation();

  // 1. Loading state
  if (loading) {
    return (
      <div className="h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  // 2. SuperAdmin routes are exempted from maintenance lockdown
  const isSuperAdminRoute = location.pathname.startsWith('/superadmin') || location.pathname.startsWith('/supremeadmin');
  
  if (config?.maintenanceMode?.enabled && !isSuperAdminRoute) {
    return <MaintenancePage />;
  }

  return <>{children}</>;
};
