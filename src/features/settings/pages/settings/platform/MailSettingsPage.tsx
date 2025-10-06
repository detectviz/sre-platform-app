import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MailSettings, MailTestResponse, MailEncryptionMode } from '@/shared/types';
import Icon from '@/shared/components/Icon';
import FormRow from '@/shared/components/FormRow';
import StatusTag from '@/shared/components/StatusTag';
import api from '@/services/api';
import { showToast } from '@/services/toast';
import { formatTimestamp } from '@/shared/utils/time';

const PASSWORD_PLACEHOLDER = '••••••••••';

type MailField = keyof MailSettings | 'password';

const ENCRYPTION_LABELS: Record<MailEncryptionMode, string> = {
    none: '無（未加密）',
    tls: 'TLS（自動協商）',
    ssl: 'SSL（465 連線）',
};

const ALL_FIELDS: MailField[] = ['smtp_server', 'port', 'username', 'sender_name', 'sender_email', 'encryption', 'password'];

const MailSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<MailSettings | null>(null);
    const [password, setPassword] = useState(PASSWORD_PLACEHOLDER);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<MailField, string>>>({});
    const [testResult, setTestResult] = useState<MailTestResponse | null>(null);
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
            const { data } = await api.get<MailSettings>('/settings/mail');
            setSettings(data);
            setPassword(PASSWORD_PLACEHOLDER);
            setIsPasswordVisible(false);
            setFieldErrors({});
            setTestResult(null);
        } catch (err) {
            setError('無法載入郵件設定，請稍後再試。');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const clearFieldError = useCallback((field: MailField) => {
        setFieldErrors(prev => {
            if (!prev[field]) {
                return prev;
            }
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }, []);

    const handleChange = useCallback(<K extends keyof MailSettings>(field: K, value: MailSettings[K]) => {
        setSettings(prev => (prev ? { ...prev, [field]: value } : prev));
        clearFieldError(field as MailField);
    }, [clearFieldError]);

    const encryptionOptions = useMemo(() => {
        if (!settings) {
            return [] as MailEncryptionMode[];
        }
        return (settings.encryption_modes && settings.encryption_modes.length > 0)
            ? settings.encryption_modes
            : (['none', 'tls', 'ssl'] as MailEncryptionMode[]);
    }, [settings]);

    const buildPayload = useCallback(() => {
        if (!settings) {
            return null;
        }
        const sanitizedPassword = password === PASSWORD_PLACEHOLDER ? '' : password.trim();

        return {
            smtp_server: settings.smtp_server.trim(),
            port: Number(settings.port),
            username: settings.username.trim(),
            sender_name: settings.sender_name.trim(),
            sender_email: settings.sender_email.trim(),
            encryption: settings.encryption,
            password: sanitizedPassword ? sanitizedPassword : undefined,
        };
    }, [password, settings]);

    const validateForm = useCallback((scope?: MailField[]) => {
        if (!settings) {
            return false;
        }
        const fieldsToCheck = scope ?? ALL_FIELDS;
        const shouldValidate = (field: MailField) => !scope || fieldsToCheck.includes(field);

        const nextErrors: Partial<Record<MailField, string>> = {};
        if (shouldValidate('smtp_server')) {
            const value = settings.smtp_server.trim();
            if (!value) {
                nextErrors.smtp_server = '請輸入 SMTP 伺服器位址。';
            }
        }
        if (shouldValidate('port')) {
            const portValue = Number(settings.port);
            if (!Number.isInteger(portValue) || portValue < 1 || portValue > 65535) {
                nextErrors.port = '埠號需介於 1 至 65535。';
            }
        }
        if (shouldValidate('sender_email')) {
            const email = settings.sender_email.trim();
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                nextErrors.sender_email = '請輸入有效的寄件人電子郵件。';
            }
        }
        if (shouldValidate('password')) {
            const sanitizedPassword = password === PASSWORD_PLACEHOLDER ? '' : password.trim();
            if (sanitizedPassword && sanitizedPassword.length < 8) {
                nextErrors.password = '請至少輸入 8 碼密碼。';
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
    }, [password, settings]);

    const connectionSummary = useMemo(() => {
        const snapshot = testResult ?? (settings?.last_test_result
            ? {
                success: settings.last_test_result === 'success',
                message: settings.last_test_message,
                tested_at: settings.last_tested_at,
            }
            : null);

        if (!snapshot) {
            return {
                label: '尚未測試',
                tone: 'neutral' as const,
                message: '尚未執行郵件伺服器連線測試。請先完成測試以確認設定。',
                testedAt: undefined,
            };
        }

        return snapshot.success
            ? {
                label: '連線正常',
                tone: 'success' as const,
                message: snapshot.message || '最近一次測試成功，郵件伺服器可正常發送通知。',
                testedAt: snapshot.tested_at,
            }
            : {
                label: '測試失敗',
                tone: 'danger' as const,
                message: snapshot.message || '最近一次測試失敗，請檢查伺服器位址、帳密或連線埠。',
                testedAt: snapshot.tested_at,
            };
    }, [settings, testResult]);

    const handleTestConnection = async () => {
        if (!validateForm(['smtp_server', 'port', 'sender_email', 'password'])) {
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
            const { data } = await api.post<MailTestResponse>('/settings/mail/test', payload);
            setTestResult(data);
            showToast(data.message, data.success ? 'success' : 'error');
        } catch (err) {
            const fallback: MailTestResponse = {
                success: false,
                result: 'failed',
                message: '測試郵件連線時發生錯誤，請稍後再試。',
                tested_at: new Date().toISOString(),
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
            await api.put('/settings/mail', payload);
            showToast('郵件設定已儲存。', 'success');
            fetchSettings();
        } catch (err: any) {
            const message = err?.response?.data?.message || '儲存郵件設定時發生錯誤。';
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
        return <div className="py-16 text-center text-red-400">{error || '郵件設定目前無法使用。'}</div>;
    }

    return (
        <div className="max-w-5xl space-y-6">
            <div className="flex items-start gap-3 rounded-2xl border border-sky-700/40 bg-sky-900/30 p-4 text-sky-100">
                <Icon name="info" className="mt-0.5 h-5 w-5 text-sky-300" />
                <div className="space-y-1">
                    <p className="text-sm leading-relaxed">此處設定的郵件伺服器將用於發送事件告警、邀請郵件與排程報告。建議使用專用帳號並限制發信權限。</p>
                    <p className="text-xs text-sky-200/80">更新設定後請立即測試，以確保通知不會中斷。</p>
                </div>
            </div>

            <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/30">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-white">SMTP 郵件伺服器</h2>
                        <p className="text-sm text-slate-400">填寫組織授權的郵件伺服器資訊，平台將使用此帳號傳送所有系統通知。</p>
                    </div>
                    <StatusTag label={connectionSummary.label} tone={connectionSummary.tone} dense />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <FormRow
                        label="SMTP 伺服器 *"
                        description="輸入完整主機名稱或 IP，例如 smtp.company.com。"
                    >
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={settings.smtp_server}
                                onChange={e => handleChange('smtp_server', e.target.value)}
                                className={`w-full rounded-md border ${fieldErrors.smtp_server ? 'border-rose-500 focus:border-rose-400 focus:ring-rose-400/50' : 'border-slate-700 focus:border-sky-500 focus:ring-sky-500/30'} bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1`}
                                placeholder="smtp.company.com"
                                aria-invalid={Boolean(fieldErrors.smtp_server)}
                            />
                            <p className={`text-xs ${fieldErrors.smtp_server ? 'text-rose-400' : 'text-slate-500'}`}>
                                {fieldErrors.smtp_server || '若使用雲服務，請確認已開啟對平台的存取權限。'}
                            </p>
                        </div>
                    </FormRow>
                    <FormRow
                        label="埠號 *"
                        description="常見設定：SMTP 465（SSL）或 587（TLS）。"
                    >
                        <div className="space-y-2">
                            <input
                                type="number"
                                value={settings.port}
                                onChange={e => handleChange('port', Number.parseInt(e.target.value, 10) || 0)}
                                className={`w-full rounded-md border ${fieldErrors.port ? 'border-rose-500 focus:border-rose-400 focus:ring-rose-400/50' : 'border-slate-700 focus:border-sky-500 focus:ring-sky-500/30'} bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1`}
                                placeholder="465"
                                aria-invalid={Boolean(fieldErrors.port)}
                                min={1}
                                max={65535}
                            />
                            <p className={`text-xs ${fieldErrors.port ? 'text-rose-400' : 'text-slate-500'}`}>
                                {fieldErrors.port || '若提供非標準埠號，請同時更新防火牆規則。'}
                            </p>
                        </div>
                    </FormRow>
                    <FormRow
                        label="加密方式"
                        description="依照郵件伺服器支援的協議選擇，若不確定可先使用 TLS。"
                    >
                        <div className="space-y-2">
                            <select
                                value={settings.encryption}
                                onChange={e => handleChange('encryption', e.target.value as MailEncryptionMode)}
                                className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
                            >
                                {encryptionOptions.map(mode => (
                                    <option key={mode} value={mode}>
                                        {ENCRYPTION_LABELS[mode]}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500">平台會自動套用對應連線埠與握手流程。</p>
                        </div>
                    </FormRow>
                    <FormRow
                        label="寄件人名稱"
                        description="顯示於收件人信箱的寄件者名稱，可填寫團隊或平台名稱。"
                    >
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={settings.sender_name}
                                onChange={e => handleChange('sender_name', e.target.value)}
                                className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
                                placeholder="SRE 平台通知"
                            />
                            <p className="text-xs text-slate-500">可留空以使用郵件伺服器的預設顯示名稱。</p>
                        </div>
                    </FormRow>
                    <FormRow
                        label="寄件人地址 *"
                        description="通知信件將以此位址寄出，請確保網域 SPF/DKIM 設定正確。"
                    >
                        <div className="space-y-2">
                            <input
                                type="email"
                                value={settings.sender_email}
                                onChange={e => handleChange('sender_email', e.target.value)}
                                className={`w-full rounded-md border ${fieldErrors.sender_email ? 'border-rose-500 focus:border-rose-400 focus:ring-rose-400/50' : 'border-slate-700 focus:border-sky-500 focus:ring-sky-500/30'} bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1`}
                                placeholder="alerts@company.com"
                                aria-invalid={Boolean(fieldErrors.sender_email)}
                            />
                            <p className={`text-xs ${fieldErrors.sender_email ? 'text-rose-400' : 'text-slate-500'}`}>
                                {fieldErrors.sender_email || '建議使用專用子網域（如 noreply.company.com）。'}
                            </p>
                        </div>
                    </FormRow>
                    <FormRow
                        label="登入帳號"
                        description="若郵件伺服器需要驗證，請填寫完整帳號；支援匿名發送則可留空。"
                    >
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={settings.username}
                                onChange={e => handleChange('username', e.target.value)}
                                className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
                                placeholder="alerts@company.com"
                            />
                            <p className="text-xs text-slate-500">支援輸入含網域的帳號，例如 service@company.com。</p>
                        </div>
                    </FormRow>
                    <FormRow
                        label="登入密碼"
                        description="若未變更密碼將保留原設定。建議定期輪替並避免與個人帳號共用。"
                    >
                        <div className="space-y-2">
                            <div className={`relative flex items-center rounded-md border ${fieldErrors.password ? 'border-rose-500 focus-within:border-rose-400 focus-within:ring-rose-400/50' : 'border-slate-700 focus-within:border-sky-500 focus-within:ring-sky-500/30'} bg-slate-950/60 focus-within:outline-none focus-within:ring-1`}>
                                <input
                                    type={isPasswordVisible ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => {
                                        setPassword(e.target.value);
                                        clearFieldError('password');
                                    }}
                                    className="w-full bg-transparent px-3 py-2 text-sm text-slate-100 focus:outline-none"
                                    placeholder="輸入新的登入密碼"
                                    aria-invalid={Boolean(fieldErrors.password)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsPasswordVisible(visible => !visible)}
                                    className="flex h-10 w-10 items-center justify-center text-slate-400 hover:text-white"
                                    title={isPasswordVisible ? '隱藏密碼' : '顯示密碼'}
                                >
                                    <Icon name={isPasswordVisible ? 'eye-off' : 'eye'} className="h-4 w-4" />
                                </button>
                            </div>
                            <p className={`text-xs ${fieldErrors.password ? 'text-rose-400' : 'text-slate-500'}`}>
                                {fieldErrors.password || '留空代表維持原密碼，輸入至少 8 碼英數組合以提升安全性。'}
                            </p>
                        </div>
                    </FormRow>
                </div>

                <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                            <Icon name="activity" className="h-4 w-4 text-sky-300" />
                            連線健康狀態
                        </div>
                        <StatusTag label={connectionSummary.label} tone={connectionSummary.tone} dense />
                    </div>
                    <p className="text-sm leading-relaxed text-slate-400">{connectionSummary.message}</p>
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
                                <Icon name="send" className="h-4 w-4" />
                                發送測試郵件
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

export default MailSettingsPage;
