import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { logging } from '@core/services/logging';

interface AuthGuardProps {
  resource: string;
  action: string;
  fallbackPath?: string;
  children: ReactNode;
}

export function AuthGuard({ resource, action, fallbackPath = '/login', children }: AuthGuardProps) {
  const { hasPermission, tenantId, user } = useAuth();

  if (!user) {
    logging.warn('auth_guard:anonymous', { module: 'core.auth', scope: resource, tenantId });
    return <Navigate to={fallbackPath} replace />;
  }

  if (!hasPermission(resource, action)) {
    logging.warn('auth_guard:denied', {
      module: 'core.auth',
      scope: resource,
      tenantId,
      context: { action, roles: user.roles },
    });
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
