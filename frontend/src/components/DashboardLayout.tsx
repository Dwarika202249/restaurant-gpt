import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import type { RootState } from '@/store/store';
import { fetchRestaurantProfile } from '@/store/slices/restaurantSlice';
import { fetchAdminUser } from '@/store/slices/fetchAdminUser';
import { MaintenanceGuard } from './MaintenanceGuard';
import { GlobalAnnouncement } from './GlobalAnnouncement';
import { useConfig } from '@/context/ConfigContext';

/**
 * DashboardLayout
 * Provides the core shell for all Restaurant Admin pages.
 */
export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useAppDispatch();
  
  // Use explicit selectors to help TypeScript inference
  const restaurant = useAppSelector((state: RootState) => state.restaurant.currentRestaurant);
  const { user, isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const { config } = useConfig();

  // Centralized Data Fetching
  useEffect(() => {
    if (isAuthenticated && user) {
      if (!user.name || user.profileComplete === undefined) {
        dispatch(fetchAdminUser());
      }
      
      // Fetch restaurant if missing OR if it belongs to a different restaurant/owner
      if (!restaurant || (user.restaurantId && restaurant._id !== user.restaurantId)) {
        dispatch(fetchRestaurantProfile());
      }
    }
  }, [dispatch, isAuthenticated, user?.id, user?.restaurantId, restaurant?._id]);

  const hasAnnouncement = config?.announcement?.enabled && (config?.announcement?.target === 'owners' || config?.announcement?.target === 'both');

  return (
    <MaintenanceGuard>
      <GlobalAnnouncement />
      <div className={`flex h-screen bg-white dark:bg-slate-950 transition-all duration-300 overflow-x-hidden ${hasAnnouncement ? 'pt-10' : ''}`}>
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 blur-[120px] rounded-full -mr-64 -mt-64 z-0 pointer-events-none" />
          <Navbar />

          <main className="flex-1 relative">
            <Outlet context={{ sidebarOpen, setSidebarOpen }} />
          </main>
        </div>
      </div>
    </MaintenanceGuard>
  );
};

export default DashboardLayout;
