

import React, { useState, useEffect, useCallback } from 'react';
import FormRow from '../../components/FormRow';
import { UserPreferences, Dashboard, PreferenceOptions } from '../../types';
import api from '../../services/api';
import Icon from '../../components/Icon';
import { showToast } from '../../services/toast';

const PreferenceSettingsPage: React.FC = () => {
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [options, setOptions] = useState<PreferenceOptions | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dashboards, setDashboards] = useState<Dashboard[]>([]);

    const fetchPageData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [prefsRes, optionsRes, dashboardsRes] = await Promise.all([
                api.get<UserPreferences>('/me/preferences'),
                api.get<PreferenceOptions>('/settings/preferences/options'),
                api.get<{ items: Dashboard[] }>('/dashboards', { params: { page_size: 100 } })
            ]);
            setPreferences(prefsRes.data);
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
        if (preferences) {
            try {
                await api.put('/me/preferences', preferences);
                showToast('偏好設定已成功儲存。', 'success');
            } catch (err) {
                showToast('無法儲存偏好設定。', 'error');
            }
        }
    };
    
    const handleReset = () => {
        if (options?.defaults) {
            setPreferences(options.defaults);
            showToast('偏好設定已重置為預設值。', 'success');
        } else {
            showToast('無法獲取預設設定。', 'error');
        }
    };

    const handleChange = (field: keyof UserPreferences, value: string) => {
        if (preferences) {
            setPreferences(prev => ({ ...prev!, [field]: value }));
        }
    };

    if (isLoading) {
        return <div className="text-center"><Icon name="loader-circle" className="w-6 h-6 animate-spin inline-block" /></div>;
    }

    if (error || !preferences || !options) {
        return <div className="text-center text-red-400">{error || '無法載入設定。'}</div>;
    }

    return (
        <div className="max-w-2xl">
            <div className="glass-card rounded-xl p-6">
                <div className="space-y-6">
                    <FormRow label="介面主題">
                        <select value={preferences.theme} onChange={e => handleChange('theme', e.target.value)} className="w-full md:w-1/2 bg-slate-800 border-slate-700 rounded-md px-3 py-2 text-sm">
                            {options.themes.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </FormRow>
                     <FormRow label="預設首頁">
                        <select value={preferences.default_page} onChange={e => handleChange('default_page', e.target.value)} className="w-full md:w-1/2 bg-slate-800 border-slate-700 rounded-md px-3 py-2 text-sm">
                           {dashboards.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </FormRow>
                     <FormRow label="語言">
                        <select value={preferences.language} onChange={e => handleChange('language', e.target.value)} className="w-full md:w-1/2 bg-slate-800 border-slate-700 rounded-md px-3 py-2 text-sm">
                            {options.languages.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </FormRow>
                     <FormRow label="時區">
                        <select value={preferences.timezone} onChange={e => handleChange('timezone', e.target.value)} className="w-full md:w-1/2 bg-slate-800 border-slate-700 rounded-md px-3 py-2 text-sm">
                            {options.timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
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