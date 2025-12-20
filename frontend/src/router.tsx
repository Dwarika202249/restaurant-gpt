import { createBrowserRouter, RouteObject } from 'react-router-dom';
import { ProtectedRoute } from './components';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { MenuPage } from './pages/MenuPage';

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
    path: '/profile',
    element: (
      <ProtectedRoute requiredRole="admin">
        <ProfilePage />
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
