import React, { useState, useEffect, useCallback } from 'react';
import { MailSettings } from '../../../types';
import Icon from '../../../components/Icon';
import FormRow from '../../../components/FormRow';
import PlaceholderModal from '../../../components/PlaceholderModal';
import api from '../../../services/api';

const MailSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<MailSettings | null>(null);
    const [password, setPassword] = useState('**********');
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get<MailSettings>('/settings/mail');
            setSettings(data);
        } catch (err) {
            setError('Failed to load mail settings.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleChange = (field: keyof MailSettings, value: any) => {
        if (settings) {
            setSettings(prev => ({ ...prev!, [field]: value }));
        }
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);
        try {
            const { data } = await api.post<{ success: boolean; message: string }>('/settings/mail/test', {});
            setTestResult(data);
        } catch (err) {
            setTestResult({ success: false, message: 'Failed to initiate test.' });
        } finally {
            setIsTesting(false);
        }
    };

    const handleSaveChanges = async () => {
        if(settings) {
            try {
                await api.put('/settings/mail', settings);
                alert('Settings saved successfully!');
            } catch (err) {
                alert('Failed to save settings.');
            }
        }
    };
    
    if (isLoading) {
        return <div className="text-center"><Icon name="loader-circle" className="w-6 h-6 animate-spin inline-block"/></div>;
    }
    if (error || !settings) {
        return <div className="text-center text-red-400">{error || 'Settings not available.'}</div>;
    }

    return (
        <div className="max-w-2xl">
             <div className="p-4 rounded-lg bg-sky-900/30 border border-sky-700/50 text-sky-300 flex items-start mb-6">
                <Icon name="info" className="w-5 h-5 mr-3 text-sky-400 shrink-0 mt-0.5" />
                <p>這裡設定的郵件伺服器將用於發送所有系統通知，例如事件告警、使用者邀請和報告。</p>
            </div>
            <div className="glass-card rounded-xl p-6">
                <div className="space-y-4">
                    <FormRow label="SMTP 伺服器 *">
                        <input type="text" value={settings.smtpServer} onChange={e => handleChange('smtpServer', e.target.value)}
                               className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                    </FormRow>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormRow label="埠號 *">
                            <input type="number" value={settings.port} onChange={e => handleChange('port', parseInt(e.target.value))}
                                   className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                        </FormRow>
                        <FormRow label="加密方式">
                            <select value={settings.encryption} onChange={e => handleChange('encryption', e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                                <option value="none">無</option>
                                <option value="tls">TLS</option>
                                <option value="ssl">SSL</option>
                            </select>
                        </FormRow>
                    </div>
                    <FormRow label="使用者名稱">
                        <input type="text" value={settings.username} onChange={e => handleChange('username', e.target.value)}
                               className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                    </FormRow>
                    <FormRow label="密碼">
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                               className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                    </FormRow>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormRow label="寄件人名稱">
                            <input type="text" value={settings.senderName} onChange={e => handleChange('senderName', e.target.value)}
                                   className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                        </FormRow>
                        <FormRow label="寄件人地址 *">
                            <input type="email" value={settings.senderEmail} onChange={e => handleChange('senderEmail', e.target.value)}
                                   className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                        </FormRow>
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-700/50 flex justify-between items-center">
                    <button onClick={handleTestConnection} disabled={isTesting}
                            className="flex items-center text-sm px-4 py-2 rounded-md transition-colors text-white bg-slate-600 hover:bg-slate-700 disabled:opacity-50">
                        {isTesting ? <Icon name="loader-circle" className="w-4 h-4 mr-2 animate-spin" /> : <Icon name="send" className="w-4 h-4 mr-2" />}
                        {isTesting ? '測試中...' : '發送測試郵件'}
                    </button>
                    <button onClick={handleSaveChanges} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">儲存變更</button>
                </div>
                {testResult && (
                    <div className={`mt-4 p-3 rounded-md text-sm border ${testResult.success ? 'bg-green-900/30 border-green-700/50 text-green-300' : 'bg-red-900/30 border-red-700/50 text-red-300'}`}>
                        {testResult.message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MailSettingsPage;
