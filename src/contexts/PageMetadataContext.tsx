import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/services/api';
import { PageMetadataMap } from '@/shared/types';

interface PageMetadataContextType {
  metadata: PageMetadataMap | null;
  isLoading: boolean;
  error: string | null;
}

const PageMetadataContext = createContext<PageMetadataContextType | undefined>(undefined);

export const PageMetadataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [metadata, setMetadata] = useState<PageMetadataMap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const { data } = await api.get<PageMetadataMap>('/pages/metadata');
        setMetadata(data);
      } catch (err) {
        setError('Failed to load page metadata.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetadata();
  }, []);

  const value = { metadata, isLoading, error };

  return (
    <PageMetadataContext.Provider value={value}>
      {children}
    </PageMetadataContext.Provider>
  );
};

export const usePageMetadata = (): PageMetadataContextType => {
  const context = useContext(PageMetadataContext);
  if (context === undefined) {
    throw new Error('usePageMetadata must be used within a PageMetadataProvider');
  }
  return context;
};
