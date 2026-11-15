import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/Spinner';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <div className="text-center space-y-3">
          <Spinner size="lg" />
          <p className="text-xs uppercase tracking-widest text-taupe font-medium">
            Verifying Aurelia Credentials...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role_slug)) {
    // Redirect based on actual role
    if (user.role_slug === 'admin' || user.role_slug === 'owner') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user.role_slug === 'staff') {
      return <Navigate to="/staff/dashboard" replace />;
    }
    return <Navigate to="/customer/dashboard" replace />;
  }

  return children;
};

