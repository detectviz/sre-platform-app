import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { ChartTheme } from '../types';

type ChartThemeContextValue = {
  theme: ChartTheme;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export const DEFAULT_CHART_THEME: ChartTheme = {
  palette: ['#38bdf8', '#a78bfa', '#34d399', '#f87171', '#f5f4a9', '#60a5fa'],
  text: {
    primary: '#f8fafc',
    secondary: '#94a3b8',
  },
  grid: {
    axis: '#94a3b8',
    split_line: '#334155',
  },
  background: {
    card: '#0f172a',
    accent: '#1e293b',
  },
  health_gauge: {
    critical: '#dc2626',
    warning: '#f97316',
    healthy: '#10b981',
  },
  event_correlation: ['#dc2626', '#f97316', '#10b981'],
  severity: {
    critical: '#dc2626',
    warning: '#f97316',
    info: '#10b981',
  },
  log_levels: {
    error: '#f87171',
    warning: '#facc15',
    info: '#38bdf8',
    debug: '#94a3b8',
  },
  capacity_planning: {
    cpu: '#38bdf8',
    memory: '#a78bfa',
    storage: '#34d399',
    forecast: '#facc15',
    baseline: '#64748b',
  },
  resource_distribution: {
    primary: '#38bdf8',
    border: '#1e293b',
    axis: '#94a3b8',
  },
  pie: {
    high: '#dc2626',
    medium: '#f97316',
    low: '#10b981',
  },
  topology: {
    node_border: '#f8fafc',
    node_label: '#cbd5e1',
    edge: '#475569',
  },
  heatmap: {
    critical: '#dc2626',
    warning: '#f97316',
    healthy: '#10b981',
  },
};

const ChartThemeContext = createContext<ChartThemeContextValue | undefined>(undefined);

export const ChartThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ChartTheme>(DEFAULT_CHART_THEME);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTheme = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get<ChartTheme>('/ui/themes/charts');
      if (data) {
        setTheme(data);
      }
    } catch (err) {
      setError('無法載入圖表主題，已套用預設樣式。');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTheme();
  }, [fetchTheme]);

  const value = useMemo<ChartThemeContextValue>(() => ({
    theme,
    isLoading,
    error,
    refresh: fetchTheme,
  }), [theme, isLoading, error, fetchTheme]);

  return (
    <ChartThemeContext.Provider value={value}>
      {children}
    </ChartThemeContext.Provider>
  );
};

export const useChartTheme = (): ChartThemeContextValue => {
  const context = useContext(ChartThemeContext);
  if (!context) {
    throw new Error('useChartTheme must be used within a ChartThemeProvider');
  }
  return context;
};
