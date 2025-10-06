import React, { useState, useEffect, useCallback, useMemo } from 'react';
import FormRow from '../../components/FormRow';
import StatusTag from '../../components/StatusTag';
import SearchableSelect from '../../components/SearchableSelect';
import { UserPreferences, Dashboard, PreferenceOptions, UserPreferenceExportResponse } from '../../types';
import api from '../../services/api';
import Icon from '../../components/Icon';
import { showToast } from '../../services/toast';

const EDITABLE_FIELDS: Array<keyof UserPreferences> = ['theme', 'language', 'timezone', 'default_page'];

const THEME_HINTS: Record<string, string> = {
  dark: '深色介面提供高對比度，適合長時間監控與低光環境。',
  light: '亮色介面適合投影或明亮辦公環境，強化資訊對比。',
  system: '依裝置系統自動切換主題，保持與使用者偏好一致。',
};

const LANGUAGE_HINTS: Record<string, string> = {
  'zh-TW': '系統預設的繁體中文界面，包含所有輔助說明。',
  'en-US': '英文界面適合跨國協作或多語系團隊。',
};

const PreferenceSettingsPage: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [initialPreferences, setInitialPreferences] = useState<UserPreferences | null>(null);
  const [options, setOptions] = useState<PreferenceOptions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const relativeFormatter = useMemo(
    () => new Intl.RelativeTimeFormat('zh-TW', { numeric: 'auto' }),
    [],
  );

  const themeOptions = useMemo(
    () => options?.themes.map(option => ({ value: option.value, label: option.label })) ?? [],
    [options],
  );
  const languageOptions = useMemo(
    () => options?.languages.map(option => ({ value: option.value, label: option.label })) ?? [],
    [options],
  );
  const timezoneOptions = useMemo(
    () => options?.timezones.map(tz => ({ value: tz, label: tz })) ?? [],
    [options],
  );
  const dashboardOptions = useMemo(
    () => dashboards.map(dashboard => ({ value: dashboard.id, label: dashboard.name })),
    [dashboards],
  );

  const isDirty = useMemo(() => {
    if (!preferences || !initialPreferences) {
      return false;
    }
    return EDITABLE_FIELDS.some(field => preferences[field] !== initialPreferences[field]);
  }, [initialPreferences, preferences]);

  const describeLanguage = useCallback(
    (value: string) => LANGUAGE_HINTS[value] ?? '調整介面語系，更新後需重新整理以套用。',
    [],
  );

  const describeTheme = useCallback(
    (value: string) => THEME_HINTS[value] ?? '選擇登入時的預設主題風格。',
    [],
  );

  const formatRelativeFromNow = useCallback(
    (value?: string | null) => {
      if (!value) {
        return '';
      }
      const target = new Date(value).getTime();
      if (Number.isNaN(target)) {
        return '';
      }
      const diffMs = target - Date.now();
      const thresholds: { limit: number; divisor: number; unit: Intl.RelativeTimeFormatUnit }[] = [
        { limit: 60_000, divisor: 1_000, unit: 'second' },
        { limit: 3_600_000, divisor: 60_000, unit: 'minute' },
        { limit: 86_400_000, divisor: 3_600_000, unit: 'hour' },
        { limit: 604_800_000, divisor: 86_400_000, unit: 'day' },
        { limit: Number.POSITIVE_INFINITY, divisor: 604_800_000, unit: 'week' },
      ];
      for (const { limit, divisor, unit } of thresholds) {
        if (Math.abs(diffMs) < limit) {
          return relativeFormatter.format(Math.round(diffMs / divisor), unit);
        }
      }
      return relativeFormatter.format(Math.round(diffMs / 2_592_000_000), 'month');
    },
    [relativeFormatter],
  );

  const fetchPageData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [prefsRes, optionsRes, dashboardsRes] = await Promise.all([
        api.get<UserPreferences>('/me/preferences'),
        api.get<PreferenceOptions>('/settings/preferences/options'),
        api.get<{ items: Dashboard[] }>('/dashboards', { params: { page_size: 100 } }),
      ]);
      setPreferences(prefsRes.data);
      setInitialPreferences(prefsRes.data);
      setOptions(optionsRes.data);
      setDashboards(dashboardsRes.data.items);
    } catch (err) {
      setError('無法載入偏好設定。');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  const handleSave = async () => {
    if (!preferences) {
      return;
    }
    setIsSaving(true);
    try {
      await api.put('/me/preferences', preferences);
      setInitialPreferences({ ...preferences });
      showToast('偏好設定已成功儲存。', 'success');
    } catch (err) {
      showToast('無法儲存偏好設定。', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (!options?.defaults) {
      showToast('無法獲取預設設定。', 'error');
      return;
    }
    const next: UserPreferences = {
      ...options.defaults,
      last_exported_at: preferences?.last_exported_at,
      last_export_format: preferences?.last_export_format,
    };
    setPreferences(next);
    showToast('偏好設定已重置為預設值。', 'success');
  };

  const handleChange = (field: keyof UserPreferences, value: string) => {
    setPreferences(prev => {
      if (!prev) {
        return prev;
      }
      return { ...prev, [field]: value };
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { data } = await api.post<UserPreferenceExportResponse>('/me/preferences/export', { format: 'json' });
      const latestPreferencesResponse = await api.get<UserPreferences>('/me/preferences');
      const latestPreferences = latestPreferencesResponse.data;
      setPreferences(latestPreferences);
      setInitialPreferences(latestPreferences);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const derivedFileName = data.download_url?.split('/').pop();
      const fileName = derivedFileName && derivedFileName.trim().length > 0
        ? derivedFileName
        : `preferences-${timestamp}.json`;
      const exportContent = JSON.stringify(latestPreferences, null, 2);

      if (typeof window !== 'undefined') {
        const blob = new Blob([exportContent], { type: 'application/json;charset=utf-8' });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
        showToast('偏好設定已匯出並下載 JSON 檔案。', 'success');
      } else {
        showToast('偏好設定匯出完成，請於支援下載的環境操作。', 'success');
      }
    } catch (err) {
      showToast('偏好設定匯出失敗。', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-10 text-center">
        <Icon name="loader-circle" className="inline-block h-6 w-6 animate-spin text-slate-300" />
      </div>
    );
  }

  if (error || !preferences || !options) {
    return <div className="py-10 text-center text-red-400">{error || '無法載入設定。'}</div>;
  }

  const hasDashboards = dashboardOptions.length > 0;

  return (
    <div className="max-w-5xl space-y-6">

      <div className="space-y-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/30">
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Icon name="palette" className="h-5 w-5 text-sky-300" />
            <h2 className="text-lg font-medium text-white">顯示與語系</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <FormRow label="介面主題" description={describeTheme(preferences.theme)}>
              <SearchableSelect
                value={preferences.theme}
                onChange={value => handleChange('theme', value)}
                options={themeOptions}
                placeholder="請選擇介面主題"
              />
            </FormRow>
            <FormRow label="語言" description={describeLanguage(preferences.language)}>
              <SearchableSelect
                value={preferences.language}
                onChange={value => handleChange('language', value)}
                options={languageOptions}
                placeholder="請選擇語言"
              />
            </FormRow>
            <FormRow
              className="md:col-span-2"
              label="時區"
              description="所有日期與時間將依據此時區顯示，報表與排程亦會同步更新。"
            >
              <SearchableSelect
                value={preferences.timezone}
                onChange={value => handleChange('timezone', value)}
                options={timezoneOptions}
                placeholder="請選擇時區"
              />
            </FormRow>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Icon name="layout-dashboard" className="h-5 w-5 text-emerald-300" />
            <h2 className="text-lg font-medium text-white">登入後顯示</h2>
          </div>
          <div className="space-y-4">
            <FormRow
              label="預設首頁"
              description={
                hasDashboards
                  ? '選擇登入後預設開啟的儀表板或工作區，可快速進入常用視圖。'
                  : '尚未擁有儀表板權限，儲存前請先建立儀表板或向管理員申請。'
              }
            >
              <SearchableSelect
                value={preferences.default_page}
                onChange={value => handleChange('default_page', value)}
                options={dashboardOptions}
                placeholder="請選擇預設首頁"
                disabled={!hasDashboards}
                emptyMessage="目前沒有可用的儀表板"
              />
            </FormRow>
            {!hasDashboards && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-950/50 px-3 py-2 text-xs text-amber-100">
                <Icon name="info" className="mt-0.5 h-4 w-4" />
                <span>若您預期應能看到儀表板，請聯繫系統管理員確認權限或建立新的儀表板後再設定預設首頁。</span>
              </div>
            )}
          </div>
        </section>

        <div className="flex flex-col gap-4 border-t border-slate-800/60 pt-6 md:flex-row md:items-center md:justify-end">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700 disabled:opacity-60"
            >
              {isExporting ? (
                <Icon name="loader-circle" className="h-4 w-4 animate-spin" />
              ) : (
                <Icon name="download" className="h-4 w-4" />
              )}
              匯出偏好設定
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-600 bg-transparent px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
              >
                <Icon name="rotate-ccw" className="h-4 w-4" />
                重置為預設
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!isDirty || isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? (
                  <Icon name="loader-circle" className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon name="check" className="h-4 w-4" />
                )}
                儲存設定
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferenceSettingsPage;
