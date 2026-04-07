import { createBrowserRouter, RouteObject, Navigate } from 'react-router-dom';
import { ProtectedRoute, DashboardLayout, PublicLayout } from './components';
import {
  LoginPage,
  DashboardPage,
  MenuPage,
  CustomerLandingPage,
  CustomerMenuPage,
  QRManagementPage,
  OrdersPage,
  AnalyticsPage,
  SmartScanPage,
  CustomerProfilePage,
  CustomerHistoryPage,
  CustomerRewardsPage,
  MarketingPage,
  AllOrdersPage,
  HomePage,
  ServicesPage,
  AboutPage,
  ContactPage,
  TermsPage,
  PrivacyPage,
  HelpPage,
  SuperAdminLoginPage,
  SuperAdminDashboardPage,
  SuperAdminRestaurantsPage
} from './pages';
import CreateAdminProfilePage from './pages/CreateAdminProfilePage';
import AdminPage from './pages/AdminPage';
import { SuperAdminLayout } from './components/SuperAdminLayout';

const routes: RouteObject[] = [
  // Public Marketing Routes
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />
      },
      {
        path: '/services',
        element: <ServicesPage />
      },
      {
        path: '/about',
        element: <AboutPage />
      },
      {
        path: '/contact',
        element: <ContactPage />
      },
      {
        path: '/help',
        element: <HelpPage />
      },
      {
        path: '/privacy',
        element: <PrivacyPage />
      },
      {
        path: '/terms',
        element: <TermsPage />
      }
    ]
  },

  // Public route - Login
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/supremeadmin',
    element: <SuperAdminLoginPage />
  },

  // Protected Super Admin Routes
  {
    path: '/superadmin',
    element: (
      <SuperAdminLayout />
    ),
    children: [
      {
        path: 'dashboard',
        element: <SuperAdminDashboardPage />
      },
      {
        path: 'restaurants',
        element: <SuperAdminRestaurantsPage />
      }
    ]
  },

  // Protected Admin Routes (Grouped under DashboardLayout)
  {
    element: (
      <ProtectedRoute requiredRole="admin">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />
      },
      {
        path: 'admin',
        element: <AdminPage />
      },
      {
        path: 'menu',
        element: <MenuPage />
      },
      {
        path: 'orders',
        element: <OrdersPage />
      },
      {
        path: 'orders/all',
        element: <AllOrdersPage />
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />
      },
      {
        path: 'qr-management',
        element: <QRManagementPage />
      },
      {
        path: 'marketing',
        element: <MarketingPage />
      }
    ]
  },
  
  // Profile Setup Route (Protected, No Layout)
  {
    path: '/admin-profile',
    element: (
      <ProtectedRoute requiredRole="admin">
        <CreateAdminProfilePage />
      </ProtectedRoute>
    )
  },

  // Public Route - Smart Scan Redirector
  {
    path: '/s/:qrId',
    element: <SmartScanPage />
  },

  // Customer Routes (QR Code Entry Point)
  {
    path: '/r/:restaurantSlug/table/:tableNo',
    element: <CustomerLandingPage />
  },

  {
    path: '/r/:restaurantSlug/profile',
    element: <CustomerProfilePage />
  },

  {
    path: '/r/:restaurantSlug/history',
    element: <CustomerHistoryPage />
  },

  {
    path: '/r/:restaurantSlug/rewards',
    element: <CustomerRewardsPage />
  },

  {
    path: '/customer/:restaurantSlug/table/:tableNo',
    element: <CustomerMenuPage />
  },

  // 404 - Not found
  {
    path: '*',
    element: (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-6">Page not found</p>
          <a
            href="/"
            className="text-brand-500 hover:text-brand-600 font-medium"
          >
            Back to Home
          </a>
        </div>
      </div>
    )
  }
];

export const router = createBrowserRouter(routes);
export default router;
