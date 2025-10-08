import type { PageContent } from '../mock-server/db';
import type { DeepPartial } from '../types';

import enUS from './en-US.json';
import zhTW from './zh-TW.json';

export const SUPPORTED_LOCALES = ['en-US', 'zh-TW'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'zh-TW';

const localeContentMap: Record<SupportedLocale, DeepPartial<PageContent>> = {
  'en-US': enUS as DeepPartial<PageContent>,
  'zh-TW': zhTW as DeepPartial<PageContent>,
};

let activeLocale: SupportedLocale = DEFAULT_LOCALE;
let activeContent: PageContent | null = null;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const deepMerge = <T>(base: DeepPartial<T>, override: DeepPartial<T>): DeepPartial<T> => {
  const result: Record<string, unknown> = Array.isArray(base) ? [...(base as unknown[])] : { ...(base as Record<string, unknown>) };

  if (Array.isArray(base) && Array.isArray(override)) {
    return override as DeepPartial<T>;
  }

  Object.entries(override as Record<string, unknown>).forEach(([key, value]) => {
    const existing = result[key];
    if (isPlainObject(existing) && isPlainObject(value)) {
      result[key] = deepMerge(existing as DeepPartial<T>, value as DeepPartial<T>);
      return;
    }
    result[key] = value;
  });

  return result as DeepPartial<T>;
};

const getValueByPath = (source: unknown, segments: string[]): unknown => {
  return segments.reduce<unknown>((acc, key) => {
    if (acc == null || typeof acc !== 'object') {
      return undefined;
    }
    return (acc as Record<string, unknown>)[key];
  }, source);
};

export const getLocaleContent = (locale: SupportedLocale): DeepPartial<PageContent> =>
  localeContentMap[locale] ?? localeContentMap[DEFAULT_LOCALE];

export const mergeLocaleWithRemote = (locale: SupportedLocale, remote?: PageContent | null): PageContent => {
  const localized = getLocaleContent(locale);
  const merged = deepMerge(localized, (remote ?? {}) as DeepPartial<PageContent>);
  return merged as PageContent;
};

export const setActiveLocale = (locale: SupportedLocale) => {
  activeLocale = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
};

export const setActiveContent = (content: PageContent | null) => {
  activeContent = content;
};

export const getContentString = (
  path: string,
  options?: { locale?: SupportedLocale; fallback?: string }
): string | undefined => {
  const segments = path.split('.');
  const targetLocale = options?.locale ?? activeLocale;
  const sources: Array<Partial<PageContent> | null | undefined> = [];

  if (!options?.locale || options.locale === activeLocale) {
    sources.push(activeContent);
  }

  sources.push(getLocaleContent(targetLocale));

  if (targetLocale !== DEFAULT_LOCALE) {
    sources.push(getLocaleContent(DEFAULT_LOCALE));
  }

  for (const source of sources) {
    const value = getValueByPath(source, segments);
    if (typeof value === 'string') {
      return value;
    }
  }

  return options?.fallback;
};
