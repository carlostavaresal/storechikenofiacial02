import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/layout/LoadingSpinner';

const SmartRedirect: React.FC = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // If authenticated, redirect based on role
  if (isAuthenticated) {
    if (isAdmin) {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/client" replace />;
    }
  }

  // If not authenticated, redirect to auth page
  return <Navigate to="/auth" replace />;
};

export default SmartRedirect;