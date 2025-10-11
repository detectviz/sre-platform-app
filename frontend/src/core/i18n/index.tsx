import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

const SUPPORTED_LOCALES = ['en', 'zh'];

export type LocaleKey = (typeof SUPPORTED_LOCALES)[number];
export type Dictionary = Record<string, string>;

interface I18nContextValue {
  locale: LocaleKey;
  t: (key: string) => string;
  setLocale: (locale: LocaleKey) => void;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

async function loadDictionary(locale: LocaleKey): Promise<Dictionary> {
  const response = await fetch(`/locales/${locale}/common.json`);
  if (!response.ok) {
    return {};
  }
  return (await response.json()) as Dictionary;
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<LocaleKey>('en');
  const [dictionary, setDictionary] = useState<Dictionary>({});
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    loadDictionary(locale)
      .then((dict) => setDictionary(dict))
      .finally(() => setLoading(false));
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => {
    const translate = (key: string) => dictionary[key] ?? key;
    return {
      locale,
      isLoading,
      setLocale: (next: LocaleKey) => {
        if (SUPPORTED_LOCALES.includes(next)) {
          setLocale(next);
        }
      },
      t: translate,
    };
  }, [dictionary, isLoading, locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('I18nContext not found');
  }
  return ctx;
}
