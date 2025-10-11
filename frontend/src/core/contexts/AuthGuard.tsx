import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from './AuthContext';

interface AuthGuardProps {
  resource: string;
  action: string;
  fallbackPath?: string;
  children: ReactNode;
}

export function AuthGuard({ resource, action, fallbackPath = '/login', children }: AuthGuardProps) {
  const { hasPermission } = useAuthContext();
  if (!hasPermission(resource as never, action as never)) {
    return <Navigate to={fallbackPath} replace />;
  }
  return <>{children}</>;
}
