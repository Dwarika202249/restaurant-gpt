import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { SuperAdminSidebar } from './SuperAdminSidebar';
import { Navbar } from './Navbar';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { fetchAdminUser } from '@/store/slices/fetchAdminUser';

export const SuperAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(fetchAdminUser());
    }
  }, [dispatch, isAuthenticated, user]);

  // Strictly enforce superadmin role
  // Need to handle loading state so it doesn't redirect before user is fetched on refresh
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    return <Navigate to="/supremeadmin" replace />;
  }

  // If we have token but user is still loading (on refresh), show a loader
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

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden font-inter">
      {/* Supreme Sidebar */}
      <SuperAdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Ambient Background Glows */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-500/5 blur-[150px] rounded-full -mr-64 -mt-64 z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full -ml-32 -mb-32 z-0 pointer-events-none" />
        
        {/* Supreme Navbar (Can use existing but maybe minimal) */}
        <Navbar />

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto relative z-10 px-4 py-6 lg:px-10 lg:py-8">
          <Outlet context={{ sidebarOpen, setSidebarOpen }} />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
