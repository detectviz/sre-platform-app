import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import en from '../../../public/locales/en/common.json';
import zh from '../../../public/locales/zh/common.json';

type LocaleKey = 'en' | 'zh';

type TranslationDictionary = Record<string, string>;

const dictionaries: Record<LocaleKey, TranslationDictionary> = { en, zh } as const;

interface I18nContextValue {
  locale: LocaleKey;
  t: (key: string) => string;
  setLocale: (locale: LocaleKey) => void;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<LocaleKey>('en');

  const value = useMemo<I18nContextValue>(() => {
    const dictionary = dictionaries[locale] ?? dictionaries.en;
    return {
      locale,
      setLocale,
      t: (key: string) => dictionary[key] ?? key
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider');
  }
  return context;
}
