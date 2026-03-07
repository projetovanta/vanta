import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const role = useAuthStore(s => s.currentAccount.role);
  if (role === 'vanta_guest') return <Navigate to="/login" replace />;
  return <>{children}</>;
};
