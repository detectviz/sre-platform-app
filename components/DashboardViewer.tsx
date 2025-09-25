import React, { useState, useMemo } from 'react';
import { Dashboard } from '../types';
import Dropdown from './Dropdown';
import Icon from './Icon';

interface DashboardViewerProps {
  dashboard: Dashboard;
}

const timeOptions = [
    { label: 'Last 5 minutes', value: 'from=now-5m&to=now' },
    { label: 'Last 15 minutes', value: 'from=now-15m&to=now' },
    { label: 'Last 30 minutes', value: 'from=now-30m&to=now' },
    { label: 'Last 1 hour', value: 'from=now-1h&to=now' },
    { label: 'Last 3 hours', value: 'from=now-3h&to=now' },
    { label: 'Last 6 hours', value: 'from=now-6h&to=now' },
    { label: 'Last 12 hours', value: 'from=now-12h&to=now' },
    { label: 'Last 24 hours', value: 'from=now-24h&to=now' },
];

const refreshOptions = [
    { label: 'Off', value: '' },
    { label: '5s', value: '5s' },
    { label: '10s', value: '10s' },
    { label: '30s', value: '30s' },
    { label: '1m', value: '1m' },
    { label: '5m', value: '5m' },
];

const tvModeOptions = [
    { label: 'Off', value: 'off' },
    { label: 'TV', value: 'on' },
];

const DashboardViewer: React.FC<DashboardViewerProps> = ({ dashboard }) => {
    const [theme, setTheme] = useState('dark');
    const [tvMode, setTvMode] = useState('off');
    const [refresh, setRefresh] = useState('');
    const [timeRange, setTimeRange] = useState('from=now-6h&to=now');

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
        // Ensure we are using the full dashboard view, not a single panel
        url.pathname = url.pathname.replace('/d-solo/', '/d/');

        return url.toString();
    }, [dashboard, theme, tvMode, refresh, timeRange]);

    return (
        <div className="h-full flex flex-col">
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-4 glass-card p-3 rounded-lg">
                <div className="flex items-center space-x-4">
                    <Dropdown label="主題" options={[{label: '深色', value: 'dark'}, {label: '淺色', value: 'light'}]} value={theme} onChange={setTheme} minWidth="w-24" />
                    <Dropdown label="TV 模式" options={tvModeOptions} value={tvMode} onChange={setTvMode} minWidth="w-24" />
                    <Dropdown label="刷新" options={refreshOptions} value={refresh} onChange={setRefresh} minWidth="w-24" />
                </div>
                <div className="flex items-center space-x-4">
                     <Dropdown label="時間" options={timeOptions} value={timeRange} onChange={setTimeRange} minWidth="w-40" />
                     <div className="flex items-center space-x-1">
                        <button className="p-2 rounded-md hover:bg-slate-700/50"><Icon name="zoom-in" className="w-5 h-5" /></button>
                        <button className="p-2 rounded-md hover:bg-slate-700/50"><Icon name="share-2" className="w-5 h-5" /></button>
                     </div>
                </div>
            </div>
            <div className="flex-grow glass-card rounded-xl p-2">
                {embedUrl ? (
                    <iframe src={embedUrl} className="w-full h-full border-0 rounded-lg" title={dashboard.name}></iframe>
                ) : (
                    <div className="flex items-center justify-center h-full"><p className="text-slate-400">Grafana URL not configured.</p></div>
                )}
            </div>
        </div>
    );
};

export default DashboardViewer;