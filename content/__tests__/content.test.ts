import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, mergeLocaleWithRemote, setActiveContent, setActiveLocale, getContentString } from '../index';
import type { PageContent } from '../../mock-server/db';

describe('content localization pipeline', () => {
  beforeEach(() => {
    setActiveLocale(DEFAULT_LOCALE);
    const baseline = mergeLocaleWithRemote(DEFAULT_LOCALE);
    setActiveContent(baseline);
  });

  it('returns zh-TW defaults for security settings copy', () => {
    expect(getContentString('PROFILE_SECURITY_SETTINGS.SESSION_MANAGEMENT.FORCE_LOGOUT')).toBe('強制登出其他裝置');
  });

  it('returns English content when switching locale', () => {
    setActiveLocale('en-US');
    const english = mergeLocaleWithRemote('en-US');
    setActiveContent(english);

    expect(getContentString('PROFILE_SECURITY_SETTINGS.CHANGE_PASSWORD.SUBMIT')).toBe('Update password');
  });

  it('prefers remote overrides when provided', () => {
    const remoteOverride = {
      GLOBAL: {
        MESSAGES: {
          LICENSE_INVALID: 'Remote override license message.',
        },
      },
    } as unknown as PageContent;

    const merged = mergeLocaleWithRemote(DEFAULT_LOCALE, remoteOverride);
    setActiveLocale(DEFAULT_LOCALE);
    setActiveContent(merged);

    expect(getContentString('GLOBAL.MESSAGES.LICENSE_INVALID')).toBe('Remote override license message.');
  });

  it('exposes dashboard view error copy from zh-TW defaults', () => {
    setActiveLocale(DEFAULT_LOCALE);
    const merged = mergeLocaleWithRemote(DEFAULT_LOCALE);
    setActiveContent(merged);

    expect(getContentString('DASHBOARD_VIEW_PAGE.ERROR_LOAD')).toBe('無法載入儀表板資料，請稍後再試一次。');
  });
});
