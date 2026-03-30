import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchRestaurantProfile } from '@/store/slices/restaurantSlice';
import { fetchAdminUser } from '@/store/slices/fetchAdminUser';

/**
 * DashboardLayout
 * Provides the core shell for all Restaurant Admin pages.
 * Includes a persistent Sidebar and Navbar, with an Outlet for page content.
 */
export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { currentRestaurant: restaurant } = useAppSelector((state) => state.restaurant);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Centralized Data Fetching
  useEffect(() => {
    if (isAuthenticated) {
      if (!user) {
        dispatch(fetchAdminUser());
      }
      if (!restaurant) {
        dispatch(fetchRestaurantProfile());
      }
    }
  }, [dispatch, isAuthenticated, user, restaurant]);

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 transition-colors duration-300 overflow-x-hidden">
      {/* Persistent Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative">
        {/* Decorative Global Background Blob */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 blur-[120px] rounded-full -mr-64 -mt-64 z-0 pointer-events-none" />
        
        {/* Persistent Navbar */}
        <Navbar />

        {/* Dynamic Page Content */}
        <main className="flex-1 relative z-10">
          <Outlet context={{ sidebarOpen, setSidebarOpen }} />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
