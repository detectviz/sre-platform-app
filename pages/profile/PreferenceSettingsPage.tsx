
import React, { useState, useEffect, useCallback } from 'react';
import FormRow from '../../components/FormRow';
import { MOCK_DASHBOARDS } from '../../constants';
import { UserPreferences } from '../../types';
import api from '../../services/api';
import Icon from '../../components/Icon';

const PreferenceSettingsPage: React.FC = () => {
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPreferences = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get<UserPreferences>('/me/preferences');
            setPreferences(data);
        } catch (err) {
            setError('無法載入偏好設定。');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPreferences();
    }, [fetchPreferences]);

    const handleSave = async () => {
        if (preferences) {
            try {
                await api.put('/me/preferences', preferences);
                // In a real app, show a success toast.
            } catch (err) {
                // In a real app, show an error toast.
            }
        }
    };
    
    const handleReset = () => {
        const defaultPrefs: UserPreferences = {
            theme: 'dark',
            language: 'zh-TW',
            timezone: 'Asia/Taipei',
            defaultPage: 'sre-war-room',
        };
        setPreferences(defaultPrefs);
    };

    const handleChange = (field: keyof UserPreferences, value: string) => {
        if (preferences) {
            setPreferences(prev => ({ ...prev!, [field]: value }));
        }
    };

    if (isLoading) {
        return <div className="text-center"><Icon name="loader-circle" className="w-6 h-6 animate-spin inline-block" /></div>;
    }

    if (error || !preferences) {
        return <div className="text-center text-red-400">{error || '無法載入設定。'}</div>;
    }

    const timezones = ['Asia/Taipei', 'UTC', 'America/New_York', 'Europe/London'];

    return (
        <div className="max-w-2xl">
            <div className="glass-card rounded-xl p-6">
                <div className="space-y-6">
                    <FormRow label="介面主題">
                        <select value={preferences.theme} onChange={e => handleChange('theme', e.target.value)} className="w-full md:w-1/2 bg-slate-800 border-slate-700 rounded-md px-3 py-2 text-sm">
                            <option value="dark">深色</option>
                            <option value="light">淺色</option>
                            <option value="system">跟隨系統</option>
                        </select>
                    </FormRow>
                     <FormRow label="預設首頁">
                        <select value={preferences.defaultPage} onChange={e => handleChange('defaultPage', e.target.value)} className="w-full md:w-1/2 bg-slate-800 border-slate-700 rounded-md px-3 py-2 text-sm">
                           {MOCK_DASHBOARDS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </FormRow>
                     <FormRow label="語言">
                        <select value={preferences.language} onChange={e => handleChange('language', e.target.value)} className="w-full md:w-1/2 bg-slate-800 border-slate-700 rounded-md px-3 py-2 text-sm">
                            <option value="zh-TW">繁體中文</option>
                            <option value="en">English</option>
                        </select>
                    </FormRow>
                     <FormRow label="時區">
                        <select value={preferences.timezone} onChange={e => handleChange('timezone', e.target.value)} className="w-full md:w-1/2 bg-slate-800 border-slate-700 rounded-md px-3 py-2 text-sm">
                            {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                        </select>
                    </FormRow>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-700/50 flex justify-end space-x-2">
                    <button onClick={handleReset} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">重置為預設</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">儲存設定</button>
                </div>
            </div>
        </div>
    );
};

export default PreferenceSettingsPage;