import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GrafanaSettings, GrafanaTestResponse } from '../../../types';
import Icon from '../../../components/Icon';
import FormRow from '../../../components/FormRow';
import StatusTag from '../../../components/StatusTag';
import api from '../../../services/api';
import { showToast } from '../../../services/toast';
import { formatTimestamp } from '../../../utils/time';

const API_KEY_PLACEHOLDER = '••••••••••';

type GrafanaField = 'url' | 'api_key' | 'org_id';

const GrafanaSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<GrafanaSettings | null>(null);
    const [apiKey, setApiKey] = useState(API_KEY_PLACEHOLDER);
    const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<GrafanaField, string>>>({});
    const [testResult, setTestResult] = useState<GrafanaTestResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const formatRelativeFromNow = useCallback((value?: string | null) => {
        if (!value) {
            return '';
        }
        const timestamp = new Date(value).getTime();
        if (Number.isNaN(timestamp)) {
            return '';
        }
        const diffMs = Date.now() - timestamp;
        if (diffMs < 60_000) {
            return '剛剛';
        }
        const diffMinutes = Math.floor(diffMs / 60_000);
        if (diffMinutes < 60) {
            return `${diffMinutes} 分鐘前`;
        }
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) {
            return `${diffHours} 小時前`;
        }
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} 天前`;
    }, []);

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get<GrafanaSettings>('/settings/grafana');
            setSettings(data);
            setApiKey(API_KEY_PLACEHOLDER);
            setIsApiKeyVisible(false);
            setFieldErrors({});
            setTestResult(null);
        } catch (err) {
            setError('無法載入 Grafana 設定，請稍後再試。');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const clearFieldError = useCallback((field: GrafanaField) => {
        setFieldErrors(prev => {
            if (!prev[field]) {
                return prev;
            }
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }, []);

    const handleChange = useCallback(<K extends keyof GrafanaSettings>(field: K, value: GrafanaSettings[K]) => {
        setSettings(prev => (prev ? { ...prev, [field]: value } : prev));
        if (field === 'url' || field === 'org_id') {
            clearFieldError(field);
        }
    }, [clearFieldError]);

    const resolveApiKey = useCallback(() => {
        if (!settings) {
            return '';
        }
        if (apiKey === API_KEY_PLACEHOLDER) {
            return settings.api_key || '';
        }
        return apiKey.trim();
    }, [apiKey, settings]);

    const buildPayload = useCallback(() => {
        if (!settings) {
            return null;
        }
        const resolvedApiKey = resolveApiKey();

        return {
            enabled: settings.enabled,
            url: settings.url.trim(),
            api_key: resolvedApiKey,
            org_id: Number(settings.org_id) || 1,
        };
    }, [resolveApiKey, settings]);

    const validateForm = useCallback((scope?: GrafanaField[]) => {
        if (!settings) {
            return false;
        }
        const fieldsToCheck = scope ?? (['url', 'api_key', 'org_id'] as GrafanaField[]);
        const shouldValidate = (field: GrafanaField) => !scope || fieldsToCheck.includes(field);

        const nextErrors: Partial<Record<GrafanaField, string>> = {};

        if (shouldValidate('url')) {
            const url = settings.url.trim();
            const hasScheme = /^https?:\/\//i.test(url);
            if (!url) {
                nextErrors.url = '請輸入 Grafana 伺服器網址。';
            } else if (!hasScheme) {
                nextErrors.url = '請包含 http:// 或 https:// 前綴。';
            }
        }

        if (shouldValidate('api_key')) {
            const effectiveKey = resolveApiKey();
            if (settings.enabled && !effectiveKey) {
                nextErrors.api_key = '請輸入具管理權限的 API Key。';
            }
        }

        if (shouldValidate('org_id')) {
            const orgId = Number(settings.org_id);
            if (!Number.isInteger(orgId) || orgId < 1) {
                nextErrors.org_id = 'Org ID 需為正整數。';
            }
        }

        setFieldErrors(prev => {
            const next = { ...prev };
            fieldsToCheck.forEach(field => {
                delete next[field];
            });
            return Object.keys(nextErrors).length > 0 ? { ...next, ...nextErrors } : next;
        });

        return Object.keys(nextErrors).length === 0;
    }, [resolveApiKey, settings]);

    const connectionSummary = useMemo(() => {
        const snapshot = testResult ?? (settings?.last_test_result
            ? {
                success: settings.last_test_result === 'success',
                message: settings.last_test_message,
                tested_at: settings.last_tested_at,
                detected_version: settings.detected_version,
            }
            : null);

        if (!snapshot) {
            return {
                label: '尚未測試',
                tone: 'neutral' as const,
                message: '尚未驗證 Grafana 連線，請先測試以啟用整合功能。',
                testedAt: undefined,
                detectedVersion: undefined,
            };
        }

        return snapshot.success
            ? {
                label: '連線正常',
                tone: 'success' as const,
                message: snapshot.message || '最近一次測試成功，可同步儀表板與告警。',
                testedAt: snapshot.tested_at,
                detectedVersion: snapshot.detected_version,
            }
            : {
                label: '測試失敗',
                tone: 'danger' as const,
                message: snapshot.message || '最近一次測試失敗，請確認 URL、API Key 或防火牆設定。',
                testedAt: snapshot.tested_at,
                detectedVersion: snapshot.detected_version,
            };
    }, [settings, testResult]);

    const handleTestConnection = async () => {
        if (!validateForm(['url', 'api_key', 'org_id'])) {
            showToast('請先修正欄位錯誤後再測試連線。', 'error');
            return;
        }
        const payload = buildPayload();
        if (!payload) {
            return;
        }

        setIsTesting(true);
        setTestResult(null);
        try {
            const { data } = await api.post<GrafanaTestResponse>('/settings/grafana/test', payload);
            setTestResult(data);
            showToast(data.message, data.success ? 'success' : 'error');
        } catch (err) {
            const fallback: GrafanaTestResponse = {
                success: false,
                result: 'failed',
                message: '測試 Grafana 連線時發生錯誤，請稍後再試。',
            };
            setTestResult(fallback);
            showToast(fallback.message, 'error');
        } finally {
            setIsTesting(false);
        }
    };

    const handleSaveChanges = async () => {
        if (!validateForm()) {
            showToast('請先修正欄位錯誤後再儲存。', 'error');
            return;
        }
        const payload = buildPayload();
        if (!payload) {
            return;
        }

        setIsSaving(true);
        try {
            await api.put('/settings/grafana', payload);
            showToast('Grafana 設定已儲存。', 'success');
            fetchSettings();
        } catch (err: any) {
            const message = err?.response?.data?.message || '儲存 Grafana 設定時發生錯誤。';
            showToast(message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="py-16 text-center text-slate-300">
                <Icon name="loader-circle" className="inline-block h-6 w-6 animate-spin" />
            </div>
        );
    }

    if (error || !settings) {
        return <div className="py-16 text-center text-red-400">{error || 'Grafana 設定目前無法使用。'}</div>;
    }

    const effectiveApiKey = resolveApiKey();

    return (
        <div className="max-w-5xl space-y-6">
            <div className="flex items-start gap-3 rounded-2xl border border-sky-700/40 bg-sky-900/30 p-4 text-sky-100">
                <Icon name="info" className="mt-0.5 h-5 w-5 text-sky-300" />
                <div className="space-y-1">
                    <p className="text-sm leading-relaxed">連線至 Grafana 後，可在平台內統一管理儀表板、告警與通知，建議使用擁有 Service Account 權限的 API Key。</p>
                    <p className="text-xs text-sky-200/80">若部署在內網環境，請確認平台伺服器可透過 HTTPS 存取 Grafana。</p>
                </div>
            </div>

            <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/30">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-white">Grafana 整合設定</h2>
                        <p className="text-sm text-slate-400">設定完成後即可於平台中瀏覽儀表板、同步資料來源與指派告警策略。</p>
                    </div>
                    <StatusTag label={connectionSummary.label} tone={connectionSummary.tone} dense />
                </div>

                <FormRow
                    label="啟用 Grafana 整合"
                    description="停用後平台將暫停儀表板同步與 Grafana 告警觸發。"
                    className="pb-4 border-b border-slate-800"
                >
                    <label className="inline-flex items-center gap-3 text-sm text-slate-200">
                        <input
                            type="checkbox"
                            checked={settings.enabled}
                            onChange={e => handleChange('enabled', e.target.checked)}
                            className="peer sr-only"
                        />
                        <span className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-700 transition peer-checked:bg-sky-600">
                            <span className="absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
                        </span>
                        {settings.enabled ? '已啟用' : '已停用'}
                    </label>
                </FormRow>

                <div className="grid gap-6 md:grid-cols-2">
                    <FormRow
                        label="Grafana URL *"
                        description="請輸入可由平台存取的完整網址，例如 https://grafana.example.com。"
                    >
                        <div className="space-y-2">
                            <input
                                type="url"
                                value={settings.url}
                                onChange={e => handleChange('url', e.target.value)}
                                className={`w-full rounded-md border ${fieldErrors.url ? 'border-rose-500 focus:border-rose-400 focus:ring-rose-400/50' : 'border-slate-700 focus:border-sky-500 focus:ring-sky-500/30'} bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1`}
                                placeholder="https://grafana.company.com"
                                aria-invalid={Boolean(fieldErrors.url)}
                            />
                            <p className={`text-xs ${fieldErrors.url ? 'text-rose-400' : 'text-slate-500'}`}>
                                {fieldErrors.url || '若 Grafana 部署於內網，請確認平台伺服器已設定對應的 DNS 或 hosts。'}
                            </p>
                        </div>
                    </FormRow>
                    <FormRow
                        label="Org ID"
                        description="對應 Grafana 組織識別碼，通常為 1。"
                    >
                        <div className="space-y-2">
                            <input
                                type="number"
                                value={settings.org_id}
                                onChange={e => handleChange('org_id', Number.parseInt(e.target.value, 10) || 1)}
                                className={`w-full rounded-md border ${fieldErrors.org_id ? 'border-rose-500 focus:border-rose-400 focus:ring-rose-400/50' : 'border-slate-700 focus:border-sky-500 focus:ring-sky-500/30'} bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1`}
                                min={1}
                                aria-invalid={Boolean(fieldErrors.org_id)}
                            />
                            <p className={`text-xs ${fieldErrors.org_id ? 'text-rose-400' : 'text-slate-500'}`}>
                                {fieldErrors.org_id || '若使用多租戶環境，請填寫對應的組織 ID。'}
                            </p>
                        </div>
                    </FormRow>
                    <FormRow
                        label="Grafana API Key *"
                        description="需具備 Admin 權限的 API Key，建議使用 Service Account 產生。"
                    >
                        <div className="space-y-2">
                            <div className={`relative flex items-center rounded-md border ${fieldErrors.api_key ? 'border-rose-500 focus-within:border-rose-400 focus-within:ring-rose-400/50' : 'border-slate-700 focus-within:border-sky-500 focus-within:ring-sky-500/30'} bg-slate-950/60 focus-within:outline-none focus-within:ring-1`}>
                                <input
                                    type={isApiKeyVisible ? 'text' : 'password'}
                                    value={apiKey}
                                    onChange={e => {
                                        setApiKey(e.target.value);
                                        clearFieldError('api_key');
                                    }}
                                    className="w-full bg-transparent px-3 py-2 text-sm text-slate-100 focus:outline-none"
                                    placeholder="輸入 API Key"
                                    aria-invalid={Boolean(fieldErrors.api_key)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsApiKeyVisible(visible => !visible)}
                                    className="flex h-10 w-10 items-center justify-center text-slate-400 hover:text-white"
                                    title={isApiKeyVisible ? '隱藏 API Key' : '顯示 API Key'}
                                >
                                    <Icon name={isApiKeyVisible ? 'eye-off' : 'eye'} className="h-4 w-4" />
                                </button>
                            </div>
                            <p className={`text-xs ${fieldErrors.api_key ? 'text-rose-400' : 'text-slate-500'}`}>
                                {fieldErrors.api_key || '若未輸入新值將沿用現有 API Key，可於 Grafana 管理後台重新產生。'}
                            </p>
                        </div>
                    </FormRow>
                    <FormRow
                        label="目前使用的 API Key"
                        description="僅會顯示長度資訊以利檢查是否更新成功。"
                    >
                        <div className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-300">
                            {effectiveApiKey ? `已設定 ${effectiveApiKey.length} 字元的金鑰` : '尚未設定 API Key'}
                        </div>
                    </FormRow>
                </div>

                <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                            <Icon name="radar" className="h-4 w-4 text-sky-300" />
                            連線健康狀態
                        </div>
                        <StatusTag label={connectionSummary.label} tone={connectionSummary.tone} dense />
                    </div>
                    <p className="text-sm leading-relaxed text-slate-400">{connectionSummary.message}</p>
                    {connectionSummary.detectedVersion && (
                        <p className="text-xs text-slate-500">偵測版本：{connectionSummary.detectedVersion}</p>
                    )}
                    {connectionSummary.testedAt && (
                        <p className="text-xs text-slate-500">
                            最近測試：{formatTimestamp(connectionSummary.testedAt, { showSeconds: false })}
                            {`（${formatRelativeFromNow(connectionSummary.testedAt)}）`}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
                    <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={isTesting}
                        className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/80 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isTesting ? (
                            <>
                                <Icon name="loader-circle" className="h-4 w-4 animate-spin" />
                                測試中...
                            </>
                        ) : (
                            <>
                                <Icon name="flask-conical" className="h-4 w-4" />
                                測試連線
                            </>
                        )}
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={fetchSettings}
                            className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800/80"
                        >
                            <Icon name="refresh-ccw" className="h-4 w-4" />
                            還原為已儲存設定
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveChanges}
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500/90 disabled:cursor-not-allowed disabled:bg-slate-600"
                        >
                            {isSaving ? (
                                <>
                                    <Icon name="loader-circle" className="h-4 w-4 animate-spin" />
                                    儲存中
                                </>
                            ) : '儲存變更'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrafanaSettingsPage;
