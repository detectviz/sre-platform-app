import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import rbacMatrix from '@features/iam/identity-access-management/data/rbac.matrix.json';

export interface UserInfo {
  id: string;
  displayName: string;
  roles: string[];
}

interface AuthContextValue {
  user: UserInfo | null;
  tenantId: string;
  loginAs: (user: UserInfo) => void;
  logout: () => void;
  setTenant: (tenantId: string) => void;
  hasPermission: (resource: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [tenantId, setTenantId] = useState('default');

  const loginAs = useCallback((info: UserInfo) => {
    setUser(info);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const setTenant = useCallback((id: string) => {
    setTenantId(id);
  }, []);

  const hasPermission = useCallback(
    (resource: string, action: string) => {
      if (!user) {
        return false;
      }

      return user.roles.some((role) => {
        const resources = (rbacMatrix as Record<string, Record<string, string[]>>)[role];
        if (!resources) {
          return false;
        }
        const actions = resources[resource] ?? [];
        return actions.includes(action);
      });
    },
    [user]
  );

  const value = useMemo(
    () => ({ user, tenantId, loginAs, logout, setTenant, hasPermission }),
    [user, tenantId, loginAs, logout, setTenant, hasPermission]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('AuthContext not found');
  }
  return ctx;
}
