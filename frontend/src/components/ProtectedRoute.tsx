import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useRedux';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'customer' | 'chef' | 'waiter';
}

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * 
 * Features:
 * - Checks if user is authenticated
 * - Verifies user role if required
 * - Redirects to login if not authenticated
 * - Preserves intended location for redirect after login
 * 
 * Usage:
 * <ProtectedRoute requiredRole="admin">
 *   <DashboardPage />
 * </ProtectedRoute>
 */
export const ProtectedRoute = ({
  children,
  requiredRole = 'admin'
}: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if specified
  if (requiredRole && user && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated and authorized
  return <>{children}</>;
};

/**
 * Optional: Higher-order component version of ProtectedRoute
 * for wrapping components outside of route definition
 */
export const withProtection = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: 'admin' | 'customer' | 'chef' | 'waiter'
) => {
  return (props: P) => (
    <ProtectedRoute requiredRole={requiredRole}>
      <Component {...props} />
    </ProtectedRoute>
  );
};
