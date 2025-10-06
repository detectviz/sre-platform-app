import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import api from '@/services/api';
import type { PageContent } from '@dev/mock-server/db';
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type SupportedLocale,
  getContentString,
  mergeLocaleWithRemote,
  setActiveContent,
  setActiveLocale,
} from '@/assets/content';

interface ContentContextType {
  content: PageContent | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getSection: <T extends keyof PageContent>(section: T) => PageContent[T] | undefined;
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  availableLocales: readonly SupportedLocale[];
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<SupportedLocale>(() => {
    if (typeof navigator !== 'undefined' && navigator.language) {
      const detected = SUPPORTED_LOCALES.find(option => option.toLowerCase() === navigator.language.toLowerCase());
      if (detected) {
        return detected;
      }
    }
    return DEFAULT_LOCALE;
  });
  const [remoteContent, setRemoteContent] = useState<PageContent | null>(null);
  const [content, setContent] = useState<PageContent | null>(() => mergeLocaleWithRemote(DEFAULT_LOCALE));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get<PageContent>('/ui/content', { params: { locale } });
      setRemoteContent(data);
      const merged = mergeLocaleWithRemote(locale, data);
      setContent(merged);
      setActiveContent(merged);
    } catch (err) {
      setRemoteContent(null);
      const merged = mergeLocaleWithRemote(locale);
      setContent(merged);
      setActiveContent(merged);
      const fallback = getContentString('GLOBAL.MESSAGES.LOAD_UI_CONTENT_ERROR', { locale, fallback: 'Failed to load UI content.' });
      setError(fallback ?? 'Failed to load UI content.');
    } finally {
      setIsLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  useEffect(() => {
    setActiveLocale(locale);
  }, [locale]);

  useEffect(() => {
    const merged = mergeLocaleWithRemote(locale, remoteContent);
    setContent(merged);
    setActiveContent(merged);
  }, [locale, remoteContent]);

  const getSection = useCallback(<T extends keyof PageContent>(section: T) => {
    return content ? content[section] : undefined;
  }, [content]);

  const value = useMemo<ContentContextType>(() => ({
    content,
    isLoading,
    error,
    refresh: fetchContent,
    getSection,
    locale,
    setLocale,
    availableLocales: SUPPORTED_LOCALES,
  }), [content, isLoading, error, fetchContent, getSection, locale]);

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
