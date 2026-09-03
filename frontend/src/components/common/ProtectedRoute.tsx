// ============================================================
// Protected Route — Route Guard Component
// ============================================================
// Wraps routes that require authentication and/or specific roles.
// If the user is not authenticated, they're redirected to login.
// If the user doesn't have the required role, they see a
// "forbidden" message.
// ============================================================

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { SystemRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: SystemRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Still checking auth status — show loading
  if (isLoading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
        <span style={{ color: 'var(--color-text-secondary)' }}>Loading...</span>
      </div>
    );
  }

  // Not authenticated — redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check role authorization if specific roles are required
  if (allowedRoles && !allowedRoles.includes(user.system_role)) {
    return (
      <div className="auth-layout">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--color-danger)', marginBottom: '0.5rem' }}>Access Denied</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
            You don't have permission to access this page.
            Required role: {allowedRoles.join(' or ')}.
          </p>
          <button className="btn btn-primary" onClick={() => window.history.back()}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
