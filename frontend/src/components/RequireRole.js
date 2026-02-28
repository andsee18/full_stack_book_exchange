import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireRole({ role, children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user?.token) return <Navigate to="/login" replace />;

  const currentRole = (user?.role || '').toString().toUpperCase();
  const requiredRole = (role || '').toString().toUpperCase();

  if (!requiredRole) return children;
  if (currentRole !== requiredRole) return <Navigate to="/" replace />;
  return children;
}
