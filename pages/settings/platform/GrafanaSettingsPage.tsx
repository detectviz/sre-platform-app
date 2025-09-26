import React, { useState, useEffect, useCallback } from 'react';
import { GrafanaSettings } from '../../../types';
import Icon from '../../../components/Icon';
import FormRow from '../../../components/FormRow';
import api from '../../../services/api';
import { showToast } from '../../../services/toast';

const GrafanaSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<GrafanaSettings | null>(null);
    const [apiKey, setApiKey] = useState('**********');
    const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get<GrafanaSettings>('/settings/grafana');
            setSettings(data);
            // Don't display the real API key
            if (data.apiKey) {
                setApiKey('**********');
            }
        } catch (err) {
            setError('無法載入 Grafana 設定。');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleChange = (field: keyof Omit<GrafanaSettings, 'apiKey'>, value: any) => {
        if (settings) {
            setSettings(prev => ({ ...prev!, [field]: value }));
        }
    };

    const handleTestConnection = async () => {
        if (!settings) return;
        setIsTesting(true);
        setTestResult(null);
        try {
            const payload = { ...settings, apiKey: apiKey === '**********' ? settings.apiKey : apiKey };
            const { data } = await api.post<{ success: boolean; message: string }>('/settings/grafana/test', payload);
            setTestResult(data);
        } catch (err) {
            setTestResult({ success: false, message: '無法啟動測試。' });
        } finally {
            setIsTesting(false);
        }
    };

    const handleSaveChanges = async () => {
        if (!settings) return;
        setIsSaving(true);
        try {
            const payload = { ...settings, apiKey: apiKey === '**********' ? settings.apiKey : apiKey };
            await api.put('/settings/grafana', payload);
            showToast('Grafana 設定已成功儲存。', 'success');
            fetchSettings(); // Re-fetch to confirm and reset API key field
        } catch (err) {
            showToast('無法儲存 Grafana 設定。', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="text-center"><Icon name="loader-circle" className="w-6 h-6 animate-spin inline-block" /></div>;
    }

    if (error || !settings) {
        return <div className="text-center text-red-400">{error || '設定無法使用。'}</div>;
    }

    return (
        <div className="max-w-2xl">
            <div className="p-4 rounded-lg bg-sky-900/30 border border-sky-700/50 text-sky-300 flex items-start mb-6">
                <Icon name="info" className="w-5 h-5 mr-3 text-sky-400 shrink-0 mt-0.5" />
                <p>配置與 Grafana 實例的連接，以啟用儀表板管理、告警規則配置及數據查詢。請確保提供的 API Key 擁有足夠的權限。</p>
            </div>
            <div className="glass-card rounded-xl p-6">
                <div className="space-y-4">
                     <FormRow label="啟用 Grafana 整合">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={settings.enabled} onChange={e => handleChange('enabled', e.target.checked)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-sky-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                             <span className="ml-3 text-sm font-medium text-slate-300">{settings.enabled ? '已啟用' : '已停用'}</span>
                        </label>
                    </FormRow>
                    <FormRow label="Grafana URL *">
                        <input type="url" value={settings.url} onChange={e => handleChange('url', e.target.value)}
                               className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" placeholder="https://grafana.yourcompany.com" />
                    </FormRow>
                    <FormRow label="Grafana API Key *">
                         <div className="relative">
                            <input type={isApiKeyVisible ? 'text' : 'password'} value={apiKey} onChange={e => setApiKey(e.target.value)}
                                   className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm pr-10" />
                            <button onClick={() => setIsApiKeyVisible(!isApiKeyVisible)} className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-white">
                                <Icon name={isApiKeyVisible ? 'eye-off' : 'eye'} className="w-4 h-4" />
                            </button>
                        </div>
                    </FormRow>
                    <FormRow label="組織 ID (Org ID)">
                        <input type="number" value={settings.orgId} onChange={e => handleChange('orgId', parseInt(e.target.value, 10) || 1)}
                               className="w-full md:w-1/2 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                    </FormRow>
                </div>
                {testResult && (
                    <div className={`mt-4 p-3 rounded-md text-sm border ${testResult.success ? 'bg-green-900/30 border-green-700/50 text-green-300' : 'bg-red-900/30 border-red-700/50 text-red-300'}`}>
                        {testResult.message}
                    </div>
                )}
                <div className="mt-6 pt-6 border-t border-slate-700/50 flex justify-between items-center">
                    <button onClick={handleTestConnection} disabled={isTesting}
                            className="flex items-center text-sm px-4 py-2 rounded-md transition-colors text-white bg-slate-600 hover:bg-slate-700 disabled:opacity-50">
                        {isTesting ? <Icon name="loader-circle" className="w-4 h-4 mr-2 animate-spin" /> : <Icon name="flask-conical" className="w-4 h-4 mr-2" />}
                        {isTesting ? '測試中...' : '測試連線'}
                    </button>
                    <div className="flex items-center space-x-2">
                         <button onClick={fetchSettings} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 rounded-md">
                            取消
                        </button>
                        <button onClick={handleSaveChanges} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md flex items-center justify-center w-32">
                             {isSaving ? <Icon name="loader-circle" className="w-4 h-4 animate-spin" /> : '儲存變更'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrafanaSettingsPage;