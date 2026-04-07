import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { SuperAdminSidebar } from './SuperAdminSidebar';
import { Navbar } from './Navbar';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { fetchAdminUser } from '@/store/slices/fetchAdminUser';
import { MaintenanceGuard } from './MaintenanceGuard';
import { GlobalAnnouncement } from './GlobalAnnouncement';
import { useConfig } from '@/context/ConfigContext';

export const SuperAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { config } = useConfig();

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(fetchAdminUser());
    }
  }, [dispatch, isAuthenticated, user]);

  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    return <Navigate to="/supremeadmin" replace />;
  }

  if (isAuthenticated && !user) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (user?.role !== 'superadmin') {
    return <Navigate to="/supremeadmin" replace />;
  }

  const hasAnnouncement = config?.announcement?.enabled;

  return (
    <MaintenanceGuard>
      <GlobalAnnouncement />
      <div className={`flex h-screen bg-[#020617] text-white overflow-hidden font-inter relative ${hasAnnouncement ? 'pt-10' : ''}`}>
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full animate-mesh" />
          <div className="absolute bottom-[0%] right-[-10%] w-[60%] h-[60%] bg-violet-600/10 blur-[150px] rounded-full animate-mesh [animation-delay:2s]" />
          <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-blue-500/10 blur-[100px] rounded-full animate-mesh [animation-delay:5s]" />
        </div>

        <SuperAdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <Navbar />
          <main className="flex-1 overflow-y-auto relative px-4 py-6 lg:px-10 lg:py-8 custom-scrollbar">
            <Outlet context={{ sidebarOpen, setSidebarOpen }} />
          </main>
        </div>
      </div>
    </MaintenanceGuard>
  );
};

export default SuperAdminLayout;
