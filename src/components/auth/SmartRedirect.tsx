import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/layout/LoadingSpinner';

const SmartRedirect: React.FC = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Temporarily allow access without auth: always go to dashboard
  return <Navigate to="/dashboard" replace />;
};

export default SmartRedirect;