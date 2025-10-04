import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthSettings } from '../../../types';
import Icon from '../../../components/Icon';
import FormRow from '../../../components/FormRow';
import StatusTag from '../../../components/StatusTag';
import api from '../../../services/api';
import { showToast } from '../../../services/toast';

const AuthSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<AuthSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSecretVisible, setIsSecretVisible] = useState(false);

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get<AuthSettings>('/settings/auth');
            setSettings(data);
        } catch(err) {
            setError('無法載入身份驗證設定。');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const ReadOnlyInput = ({ value, actions, monospace = false }: { value: string; actions?: React.ReactNode; monospace?: boolean }) => (
        <div className="w-full flex items-center justify-between gap-3 bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200">
            <span className={`truncate ${monospace ? 'font-mono tracking-wide text-slate-100' : ''}`}>{value || '—'}</span>
            {actions && <div className="flex items-center gap-1.5 shrink-0">{actions}</div>}
        </div>
    );

    const providerDisplay = useMemo(() => {
        if (!settings) {
            return { label: '—', tooltip: '' };
        }
        const mapping: Record<AuthSettings['provider'], { label: string; tooltip: string }> = {
            keycloak: { label: 'Keycloak', tooltip: '使用 Keycloak 作為身份提供商' },
            auth0: { label: 'Auth0', tooltip: '使用 Auth0 作為身份提供商' },
            google: { label: 'Google Workspace', tooltip: '透過 Google Workspace 驗證使用者' },
            custom: { label: '自訂 IdP', tooltip: '使用自訂身份提供商整合' },
        };
        return mapping[settings.provider];
    }, [settings]);

    const maskedSecret = useMemo(() => {
        if (!settings?.client_secret) {
            return '';
        }
        if (isSecretVisible) {
            return settings.client_secret;
        }
        const secret = settings.client_secret;
        if (secret.length <= 8) {
            return '•'.repeat(secret.length);
        }
        return `${secret.slice(0, 4)}••••${secret.slice(-4)}`;
    }, [isSecretVisible, settings]);

    const handleCopy = useCallback(async (value: string, label: string) => {
        try {
            await navigator.clipboard.writeText(value);
            showToast(`${label} 已複製`, 'success');
        } catch (err) {
            showToast('複製內容時發生錯誤，請手動選取。', 'error');
        }
    }, []);

    if (isLoading) {
        return <div className="text-center"><Icon name="loader-circle" className="w-6 h-6 animate-spin inline-block"/></div>;
    }
    if (error || !settings) {
        return <div className="text-center text-red-400">{error || 'Settings not available.'}</div>;
    }

    return (
        <div className="max-w-4xl space-y-6">
             <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/40 text-yellow-100 flex items-start gap-3">
                <Icon name="shield-alert" className="w-5 h-5 mt-0.5 text-yellow-300" />
                <div className="space-y-1">
                    <p className="text-sm leading-relaxed">身份驗證設定為高度敏感資料，建議僅由身份提供商（IdP）管理員調整。變更前請確認備援登入方案，以免造成所有使用者無法登入。</p>
                    <p className="text-xs text-yellow-200/80">若需緊急協助，請聯繫平台負責人或安全團隊。</p>
                </div>
            </div>

            <div className="glass-card rounded-xl p-6 space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-white">身分提供商設定</h2>
                        <p className="text-sm text-slate-400">統一管理 OIDC 連線資訊，確保登入流程安全並遵循組織合規要求。</p>
                    </div>
                    <StatusTag label={providerDisplay.label} tone={settings.enabled ? 'success' : 'neutral'} tooltip={providerDisplay.tooltip} />
                </div>

                <FormRow
                    label="啟用 OIDC 身份驗證"
                    description="若需停用，請先確認已設定本地備援帳號，避免全域登入中斷。"
                    className="pb-4 border-b border-slate-800"
                >
                    <label className="relative inline-flex items-center cursor-not-allowed">
                        <input type="checkbox" checked={settings.enabled} readOnly className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-sky-600 peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        <span className="ml-3 text-sm font-medium text-slate-200">{settings.enabled ? '已啟用' : '已停用'}</span>
                    </label>
                </FormRow>

                <div className="grid gap-6 md:grid-cols-2">
                    <FormRow
                        label="提供商（Provider）"
                        description="此標籤對應 Content API 回傳的 provider 代碼。"
                    >
                        <ReadOnlyInput value={providerDisplay.label} />
                    </FormRow>
                    <FormRow
                        label={
                            <span className="inline-flex items-center gap-1">
                                領域 / 網域（Realm）
                                <Icon name="info" className="w-3.5 h-3.5 text-slate-400" title="身份提供商的命名空間或租戶識別碼" />
                            </span>
                        }
                        description="用於區分不同租戶，請與 IdP 設定保持一致。"
                    >
                        <ReadOnlyInput value={settings.realm} />
                    </FormRow>
                    <FormRow
                        label="Client ID（客戶端識別碼）"
                        description="平台向 IdP 註冊的應用程式代號，可複製給 SSO 管理員。"
                    >
                        <ReadOnlyInput
                            value={settings.client_id}
                            monospace
                            actions={
                                <button
                                    type="button"
                                    onClick={() => handleCopy(settings.client_id, 'Client ID')}
                                    className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-700"
                                    title="複製 Client ID"
                                >
                                    <Icon name="copy" className="w-4 h-4" />
                                </button>
                            }
                        />
                    </FormRow>
                    <FormRow
                        label="IdP 管理入口"
                        description="需具備身份提供商管理權限才能存取。"
                    >
                        {settings.idp_admin_url ? (
                            <a
                                href={settings.idp_admin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-sky-500/50 bg-sky-900/30 px-3 py-2 text-sm text-sky-200 hover:bg-sky-500/20"
                            >
                                <Icon name="external-link" className="w-4 h-4" />
                                前往身分提供商主控台
                            </a>
                        ) : (
                            <ReadOnlyInput value="尚未提供管理連結" />
                        )}
                    </FormRow>
                </div>

                <FormRow
                    label={
                        <span className="inline-flex items-center gap-1">
                            Client Secret（客戶端密鑰）
                            <Icon name="lock" className="w-3.5 h-3.5 text-amber-300" title="機密資訊，請定期輪換並妥善保存" />
                        </span>
                    }
                    description="僅顯示前後 4 碼，若需重新產生請於 IdP 重新配置並同步更新。"
                >
                    <ReadOnlyInput
                        value={maskedSecret}
                        monospace
                        actions={
                            <>
                                <button
                                    type="button"
                                    onClick={() => setIsSecretVisible(visible => !visible)}
                                    className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-700"
                                    title={isSecretVisible ? '隱藏密鑰' : '顯示密鑰'}
                                >
                                    <Icon name={isSecretVisible ? 'eye-off' : 'eye'} className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleCopy(settings.client_secret, 'Client Secret')}
                                    className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-700"
                                    title="複製 Client Secret"
                                >
                                    <Icon name="copy" className="w-4 h-4" />
                                </button>
                            </>
                        }
                    />
                </FormRow>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">端點 URL</h3>
                    <FormRow label="授權端點（Authorization Endpoint）">
                        <ReadOnlyInput value={settings.auth_url} monospace />
                    </FormRow>
                    <FormRow label="令牌端點（Token Endpoint）">
                        <ReadOnlyInput value={settings.token_url} monospace />
                    </FormRow>
                    <FormRow label="使用者資訊端點（UserInfo Endpoint）">
                        <ReadOnlyInput value={settings.user_info_url} monospace />
                    </FormRow>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                    <h4 className="text-sm font-semibold text-white">安全建議</h4>
                    <ul className="mt-2 space-y-1.5 text-xs text-slate-400 list-disc list-inside">
                        <li>建立輪替排程，並於更新 Client Secret 後立即測試登入流程。</li>
                        <li>限制具有 IdP 管理權限的人員，並記錄每次設定變更。</li>
                        <li>若需進行維護，請先通知使用者與安全團隊。</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AuthSettingsPage;
