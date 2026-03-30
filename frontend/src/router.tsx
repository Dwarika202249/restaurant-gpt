import { createBrowserRouter, RouteObject, Navigate } from 'react-router-dom';
import { ProtectedRoute, DashboardLayout } from './components';
import { 
  LoginPage, 
  DashboardPage, 
  RestaurantProfilePage, 
  MenuPage, 
  CustomerLandingPage, 
  CustomerMenuPage, 
  QRManagementPage,
  OrdersPage,
  AnalyticsPage
} from './pages';
import CreateAdminProfilePage from './pages/CreateAdminProfilePage';
import AdminPage from './pages/AdminPage';

const routes: RouteObject[] = [
  // Public route - Login
  {
    path: '/login',
    element: <LoginPage />
  },

  // Protected Admin Routes (Grouped under DashboardLayout)
  {
    path: '/',
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
        path: 'admin-profile',
        element: <CreateAdminProfilePage />
      },
      {
        path: 'admin',
        element: <AdminPage />
      },
      {
        path: 'profile',
        element: <RestaurantProfilePage />
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
        path: 'analytics',
        element: <AnalyticsPage />
      },
      {
        path: 'qr-management',
        element: <QRManagementPage />
      },
      // Root redirect to dashboard
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      }
    ]
  },

  // Customer Routes (QR Code Entry Point)
  {
    path: '/r/:restaurantSlug/table/:tableNo',
    element: <CustomerLandingPage />
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
