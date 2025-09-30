import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import api from '../services/api';
import type { PageContent } from '../mock-server/db';

interface ContentContextType {
  content: PageContent | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getSection: <T extends keyof PageContent>(section: T) => PageContent[T] | undefined;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<PageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get<PageContent>('/ui/content');
      setContent(data);
    } catch (err) {
      setError('Failed to load UI content.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const getSection = useCallback(<T extends keyof PageContent>(section: T) => {
    return content ? content[section] : undefined;
  }, [content]);

  const value = useMemo<ContentContextType>(() => ({
    content,
    isLoading,
    error,
    refresh: fetchContent,
    getSection,
  }), [content, isLoading, error, fetchContent, getSection]);

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = (): ContentContextType => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

export const useContentSection = <T extends keyof PageContent>(section: T): PageContent[T] | undefined => {
  const { getSection } = useContent();
  return getSection(section);
};
