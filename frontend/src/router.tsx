import AdminPage from './pages/AdminPage';
import CreateAdminProfilePage from './pages/CreateAdminProfilePage';
import { createBrowserRouter, RouteObject } from 'react-router-dom';
import { ProtectedRoute } from './components';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { RestaurantProfilePage } from './pages/RestaurantProfilePage';
import { MenuPage } from './pages/MenuPage';
import { CustomerLandingPage } from './pages/CustomerLandingPage';
import { CustomerMenuPage } from './pages/CustomerMenuPage';
import { QRManagementPage } from './pages/QRManagementPage';

/**
 * Application Routes Configuration
 * Defines all routes with their components and protection levels
 */
const routes: RouteObject[] = [
  // Public route - Login
  {
    path: '/login',
    element: <LoginPage />
  },

  // Protected Admin Routes
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute requiredRole="admin">
        <DashboardPage />
      </ProtectedRoute>
    )
  },

  {
    path: '/admin-profile',
    element: (
      <ProtectedRoute requiredRole="admin">
        <CreateAdminProfilePage />
      </ProtectedRoute>
    )
  },

  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminPage />
      </ProtectedRoute>
    )
  },

  {
    path: '/profile',
    element: (
      <ProtectedRoute requiredRole="admin">
        <RestaurantProfilePage />
      </ProtectedRoute>
    )
  },

  {
    path: '/menu',
    element: (
      <ProtectedRoute requiredRole="admin">
        <MenuPage />
      </ProtectedRoute>
    )
  },

  {
    path: '/qr-management',
    element: (
      <ProtectedRoute requiredRole="admin">
        <QRManagementPage />
      </ProtectedRoute>
    )
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

  // Root redirect to dashboard or login
  {
    path: '/',
    element: <LoginPage />
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
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Back to Home
          </a>
        </div>
      </div>
    )
  }
];

/**
 * Create and export the router
 */
export const router = createBrowserRouter(routes);

export default router;
