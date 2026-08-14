import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Role } from '../types';

export const Protected: React.FC<{ roles: Role[]; children: React.ReactNode }> = ({
  roles,
  children,
}) => {
  const { user, loading } = useApp();
  const location = useLocation();

  // Wait for the auth check to finish before deciding anything
  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!roles.includes(user.role)) {
    const home = (r: string) =>
      `/${r === 'academicSupervisor' ? 'supervisor-academic' : r === 'companySupervisor' ? 'supervisor-company' : r}/dashboard`;
    return <Navigate to={home(user.role)} replace />;
  }

  return <>{children}</>;
};