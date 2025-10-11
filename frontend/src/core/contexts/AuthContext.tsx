import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import rbacMatrix from '../../features/identity-access-management/data/rbac.matrix.json';

type RoleKey = keyof typeof rbacMatrix;

type ResourceKey = keyof (typeof rbacMatrix)[RoleKey];

type ActionKey<R extends RoleKey, Res extends ResourceKey> = (typeof rbacMatrix)[R][Res][number];

interface UserProfile {
  id: string;
  name: string;
  roles: RoleKey[];
}

interface AuthContextValue {
  user: UserProfile | null;
  tenantId: string;
  roles: RoleKey[];
  hasPermission: <Res extends ResourceKey>(resource: Res, action: ActionKey<RoleKey, Res>) => boolean;
  setRoles: (roles: RoleKey[]) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const defaultUser: UserProfile = {
  id: 'user-1',
  name: 'Ops Admin',
  roles: ['sre.admin']
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [roles, setRoles] = useState<RoleKey[]>(defaultUser.roles);
  const tenantId = 'tenant-default';

  const hasPermission = useMemo(() => {
    return <Res extends ResourceKey>(resource: Res, action: ActionKey<RoleKey, Res>) => {
      return roles.some((role) => {
        const roleMatrix = rbacMatrix[role];
        const actions = roleMatrix?.[resource as ResourceKey];
        return actions?.includes(action) ?? false;
      });
    };
  }, [roles]);

  const value: AuthContextValue = {
    user: { ...defaultUser, roles },
    tenantId,
    roles,
    hasPermission,
    setRoles
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return ctx;
}
