
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { AllOptions } from '../types';

interface OptionsContextType {
  options: AllOptions | null;
  isLoading: boolean;
  error: string | null;
}

const OptionsContext = createContext<OptionsContextType | undefined>(undefined);

export const OptionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [options, setOptions] = useState<AllOptions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const { data } = await api.get<AllOptions>('/ui/options');
        setOptions(data);
      } catch (error) {
        setError('無法載入 UI 選項配置。');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOptions();
  }, []);

  return (
    <OptionsContext.Provider value={{ options, isLoading, error }}>
      {children}
    </OptionsContext.Provider>
  );
};

export const useOptions = (): OptionsContextType => {
  const context = useContext(OptionsContext);
  if (context === undefined) {
    throw new Error('useOptions must be used within an OptionsProvider');
  }
  return context;
};
