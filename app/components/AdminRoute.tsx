// components/AdminRoute.tsx
import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
}