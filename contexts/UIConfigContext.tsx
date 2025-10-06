
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { NavItem, TabConfigMap } from '../types';

interface UIConfigContextType {
  navItems: NavItem[];
  tabConfigs: TabConfigMap | null;
  isLoading: boolean;
  error: string | null;
}

const UIConfigContext = createContext<UIConfigContextType | undefined>(undefined);

export const UIConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [tabConfigs, setTabConfigs] = useState<TabConfigMap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfigs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [navRes, tabsRes] = await Promise.all([
          api.get<NavItem[]>('/navigation'),
          api.get<TabConfigMap>('/ui/tabs'),
        ]);
        setNavItems(navRes.data);
        setTabConfigs(tabsRes.data);
      } catch (error) {
        setError('無法載入應用程式配置。請刷新頁面重試。');
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfigs();
  }, []);

  const value = { navItems, tabConfigs, isLoading, error };

  return (
    <UIConfigContext.Provider value={value}>
      {children}
    </UIConfigContext.Provider>
  );
};

export const useUIConfig = (): UIConfigContextType => {
  const context = useContext(UIConfigContext);
  if (context === undefined) {
    throw new Error('useUIConfig must be used within a UIConfigProvider');
  }
  return context;
};
