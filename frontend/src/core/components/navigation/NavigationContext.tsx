import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  children?: NavigationItem[];
  permissions?: { resource: string; action: string }[];
}

interface NavigationContextValue {
  items: NavigationItem[];
  register: (item: NavigationItem) => void;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<NavigationItem[]>([]);

  const register = useMemo(
    () =>
      (item: NavigationItem) => {
        setItems((current) => {
          const exists = current.find((candidate) => candidate.id === item.id);
          if (exists) {
            return current.map((candidate) => (candidate.id === item.id ? item : candidate));
          }
          return [...current, item];
        });
      },
    []
  );

  return <NavigationContext.Provider value={{ items, register }}>{children}</NavigationContext.Provider>;
}

export function useNavigationRegistry() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigationRegistry must be used within NavigationProvider');
  }
  return context;
}
