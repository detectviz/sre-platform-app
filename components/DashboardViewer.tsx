import React, { useState, useMemo, useEffect } from 'react';
import { Dashboard, GrafanaOptions } from '../types';
import Dropdown from './Dropdown';
import Icon from './Icon';
import PlaceholderModal from './PlaceholderModal';
import api from '../services/api';

interface DashboardViewerProps {
  dashboard: Dashboard;
}

const DashboardViewer: React.FC<DashboardViewerProps> = ({ dashboard }) => {
    const [options, setOptions] = useState<GrafanaOptions | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [theme, setTheme] = useState('dark');
    const [tvMode, setTvMode] = useState('off');
    const [refresh, setRefresh] = useState('');
    const [timeRange, setTimeRange] = useState('from=now-6h&to=now');
    
    const [isPlaceholderModalOpen, setIsPlaceholderModalOpen] = useState(false);
    const [modalFeatureName, setModalFeatureName] = useState('');

    useEffect(() => {
        setIsLoading(true);
        api.get<GrafanaOptions>('/settings/grafana/options')
            .then(res => {
                setOptions(res.data);
                if (res.data.refreshOptions.length > 0) {
                    const defaultRefresh = res.data.refreshOptions.find(opt => opt.value === '1m');
                    setRefresh(defaultRefresh ? defaultRefresh.value : res.data.refreshOptions[0].value);
                }
                const defaultTime = res.data.timeOptions.find(opt => opt.value.includes('6h'));
                if (defaultTime) {
                    setTimeRange(defaultTime.value);
                } else if (res.data.timeOptions.length > 0) {
                    setTimeRange(res.data.timeOptions[0].value);
                }
            })
            .catch(err => console.error("Failed to fetch Grafana options", err))
            .finally(() => setIsLoading(false));
    }, []);

    const showPlaceholderModal = (featureName: string) => {
        setModalFeatureName(featureName);
        setIsPlaceholderModalOpen(true);
    };

    const embedUrl = useMemo(() => {
        if (!dashboard.grafanaUrl) return '';
        
        const url = new URL(dashboard.grafanaUrl);
        const params = new URLSearchParams(url.search);

        params.set('orgId', '1');
        params.set('theme', theme);

        if (tvMode === 'on') {
            params.set('kiosk', 'tv');
        } else {
            params.delete('kiosk');
        }

        if (refresh) {
            params.set('refresh', refresh);
        } else {
            params.delete('refresh');
        }

        const timeParams = new URLSearchParams(timeRange);
        timeParams.forEach((value, key) => params.set(key, value));
        
        url.search = params.toString();
        url.pathname = url.pathname.replace('/d-solo/', '/d/');

        return url.toString();
    }, [dashboard, theme, tvMode, refresh, timeRange]);

    return (
        <div className="h-full flex flex-col">
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-4 glass-card p-3 rounded-lg">
                {isLoading ? (
                    <div className="w-full h-10 animate-pulse bg-slate-700/50 rounded-md" />
                ) : options && (
                    <>
                        <div className="flex items-center space-x-4">
                            <Dropdown label="主題" options={[{label: '深色', value: 'dark'}, {label: '淺色', value: 'light'}]} value={theme} onChange={setTheme} minWidth="w-24" />
                            <Dropdown label="TV 模式" options={options.tvModeOptions} value={tvMode} onChange={setTvMode} minWidth="w-24" />
                            <Dropdown label="刷新" options={options.refreshOptions} value={refresh} onChange={setRefresh} minWidth="w-24" />
                        </div>
                        <div className="flex items-center space-x-4">
                            <Dropdown label="時間" options={options.timeOptions} value={timeRange} onChange={setTimeRange} minWidth="w-40" />
                            <div className="flex items-center space-x-1">
                                <button onClick={() => showPlaceholderModal('Zoom In')} className="p-2 rounded-md hover:bg-slate-700/50"><Icon name="zoom-in" className="w-5 h-5" /></button>
                                <button onClick={() => showPlaceholderModal('Share Dashboard')} className="p-2 rounded-md hover:bg-slate-700/50"><Icon name="share-2" className="w-5 h-5" /></button>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <div className="flex-grow glass-card rounded-xl p-2">
                {embedUrl ? (
                    <iframe src={embedUrl} className="w-full h-full border-0 rounded-lg" title={dashboard.name}></iframe>
                ) : (
                    <div className="flex items-center justify-center h-full"><p className="text-slate-400">Grafana URL not configured.</p></div>
                )}
            </div>
             <PlaceholderModal
                isOpen={isPlaceholderModalOpen}
                onClose={() => setIsPlaceholderModalOpen(false)}
                featureName={modalFeatureName}
            />
        </div>
    );
};

export default DashboardViewer;
