import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/app/auth/useAuth';
import { Role } from '@/app/types';

export const ProtectedRoute = ({ children, roles }: { children: ReactNode; roles?: Role[] }) => {
  const session = useAuth(s => s.session);
  if (!session) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(session.role)) return <Navigate to="/app/dashboard" replace />;
  return <>{children}</>;
};
