
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/layout/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  console.log('ProtectedRoute: Auth state:', { isAuthenticated, isAdmin, loading, requireAdmin });

  // Temporary bypass: allow access without authentication and admin checks
  console.warn('ProtectedRoute bypass active: allowing access without auth', { isAuthenticated, isAdmin, loading, requireAdmin });
  return <>{children}</>;
};

export default ProtectedRoute;
