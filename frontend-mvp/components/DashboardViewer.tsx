import React, { useState, useMemo, useEffect } from 'react';
import { Dashboard } from '../types';
import Dropdown from './Dropdown';
import { useOptions } from '../contexts/OptionsContext';
import { useContent } from '../contexts/ContentContext';
import Icon from './Icon';

interface DashboardViewerProps {
    dashboard: Dashboard;
}

const DashboardViewer: React.FC<DashboardViewerProps> = ({ dashboard }) => {
    const { options, isLoading: isLoadingOptions, error } = useOptions();
    const { content } = useContent();
    const grafanaOptions = options?.grafana;
    const pageContent = content?.DASHBOARD_VIEWER;
    const grafanaUrl = useMemo(() => {
        const legacy = (dashboard as unknown as { grafanaUrl?: string | null | undefined }).grafanaUrl;
        return dashboard.grafana_url ?? legacy ?? '';
    }, [dashboard]);

    const [theme, setTheme] = useState('dark');
    const [tvMode, setTvMode] = useState('off');
    const [refresh, setRefresh] = useState('');
    const [timeRange, setTimeRange] = useState('from=now-6h&to=now');

    useEffect(() => {
        if (grafanaOptions) {
            if (grafanaOptions.refresh_options.length > 0) {
                const defaultRefresh = grafanaOptions.refresh_options.find(opt => opt.value === '1m');
                setRefresh(defaultRefresh ? defaultRefresh.value : grafanaOptions.refresh_options[0].value);
            }
            const defaultTime = grafanaOptions.time_options.find(opt => opt.value.includes('6h'));
            if (defaultTime) {
                setTimeRange(defaultTime.value);
            } else if (grafanaOptions.time_options.length > 0) {
                setTimeRange(grafanaOptions.time_options[0].value);
            }
        }
    }, [grafanaOptions]);

    const embedUrl = useMemo(() => {
        if (!grafanaUrl) return '';

        const url = new URL(grafanaUrl);
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
    }, [grafanaUrl, theme, tvMode, refresh, timeRange]);

    return (
        <div className="flex h-full flex-col space-y-4">
            <div className="glass-card relative z-10 flex flex-wrap items-center justify-between gap-4 rounded-xl p-4">
                {isLoadingOptions || !pageContent ? (
                    <div className="h-12 w-full animate-pulse rounded-md bg-slate-700/50" />
                ) : error ? (
                    <div className="w-full rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-center text-sm text-rose-200">
                        {pageContent?.OPTIONS_ERROR ?? error}
                    </div>
                ) : grafanaOptions && (
                    <>
                        <div className="flex flex-wrap items-center gap-4">
                            <Dropdown label={grafanaOptions.theme_label} options={grafanaOptions.theme_options || []} value={theme} onChange={setTheme} minWidth="w-28" />
                            <Dropdown label={grafanaOptions.tv_mode_label} options={grafanaOptions.tv_mode_options || []} value={tvMode} onChange={setTvMode} minWidth="w-32" />
                            <Dropdown label={grafanaOptions.refresh_label} options={grafanaOptions.refresh_options || []} value={refresh} onChange={setRefresh} minWidth="w-36" />
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            <Dropdown label={grafanaOptions.time_label} options={grafanaOptions.time_options || []} value={timeRange} onChange={setTimeRange} minWidth="w-48" />
                        </div>
                    </>
                )}
            </div>
            <div className="glass-card flex-grow rounded-xl p-2">
                {embedUrl ? (
                    <iframe src={embedUrl} className="h-full w-full rounded-lg border-0" title={dashboard.name}></iframe>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-300">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/70 text-slate-200">
                            <Icon name="monitor-off" className="h-5 w-5" />
                        </span>
                        <p className="max-w-xs text-sm leading-6">
                            {pageContent?.GRAFANA_URL_NOT_CONFIGURED ?? '尚未設定 Grafana URL，請先完成整合。'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardViewer;
