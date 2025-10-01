import React, { useState, useEffect, useCallback } from 'react';
import { AuthSettings } from '../../../types';
import Icon from '../../../components/Icon';
import FormRow from '../../../components/FormRow';
import api from '../../../services/api';

const AuthSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<AuthSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get<AuthSettings>('/settings/auth');
            setSettings(data);
        } catch(err) {
            setError('Failed to load authentication settings.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const ReadOnlyInput = ({ value }: { value: string }) => (
        <div className="w-full bg-slate-800/50 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-400 cursor-not-allowed">
            {value}
        </div>
    );

    if (isLoading) {
        return <div className="text-center"><Icon name="loader-circle" className="w-6 h-6 animate-spin inline-block"/></div>;
    }
    if (error || !settings) {
        return <div className="text-center text-red-400">{error || 'Settings not available.'}</div>;
    }

    return (
        <div className="max-w-4xl">
             <div className="p-4 rounded-lg bg-amber-900/30 border border-amber-700/50 text-amber-300 flex items-start mb-6">
                <Icon name="alert-triangle" className="w-5 h-5 mr-3 text-amber-400 shrink-0 mt-0.5" />
                <p>身份驗證設定是敏感配置，通常由您的身份提供商 (IdP) 管理員進行設定。不正確的修改可能導致平台無法登入。</p>
            </div>

            <div className="glass-card rounded-xl p-6">
                <div className="space-y-4">
                    <FormRow label="啟用 OIDC 身份驗證" className="pb-4 border-b border-slate-700/50">
                        <label className="relative inline-flex items-center cursor-not-allowed">
                            <input type="checkbox" checked={settings.enabled} readOnly className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-sky-600 peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            <span className="ml-3 text-sm font-medium text-slate-300">{settings.enabled ? '已啟用' : '已停用'}</span>
                        </label>
                    </FormRow>
                    
                    <FormRow label="提供商">
                        <ReadOnlyInput value={settings.provider} />
                    </FormRow>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormRow label={
                            <div className="flex items-center">
                                領域 / 網域
                                <span className="ml-1.5 text-slate-400 cursor-help" title="身份提供商的命名空間或租戶識別碼">
                                    <Icon name="info" className="w-3.5 h-3.5" />
                                </span>
                            </div>
                        }>
                            <ReadOnlyInput value={settings.realm} />
                        </FormRow>
                         <FormRow label="Client ID">
                            <ReadOnlyInput value={settings.client_id} />
                        </FormRow>
                    </div>

                     <FormRow label={
                        <div className="flex items-center">
                            客戶端密鑰
                            <span className="ml-1.5 text-amber-400 cursor-help" title="機密資訊，請勿外洩。建議定期輪換。">
                                <Icon name="shield-alert" className="w-3.5 h-3.5" />
                            </span>
                        </div>
                    }>
                        <ReadOnlyInput value="********************" />
                    </FormRow>

                    <h3 className="text-lg font-semibold text-white pt-4 border-t border-slate-700/50">端點 URLs</h3>
                    <FormRow label="授權端點 (Authorization Endpoint)">
                        <ReadOnlyInput value={settings.auth_url} />
                    </FormRow>
                    <FormRow label="令牌端點 (Token Endpoint)">
                        <ReadOnlyInput value={settings.token_url} />
                    </FormRow>
                     <FormRow label="使用者資訊端點 (UserInfo Endpoint)">
                        <ReadOnlyInput value={settings.user_info_url} />
                    </FormRow>
                </div>
            </div>
        </div>
    );
};

export default AuthSettingsPage;
