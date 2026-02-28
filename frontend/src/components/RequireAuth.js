import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireAuth({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user?.token) return <Navigate to="/login" replace />;
  return children;
}
