import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageKPIs from '../../components/PageKPIs';
import EChartsReact from '../../components/EChartsReact';
import Icon from '../../components/Icon';
import StatusTag from '../../components/StatusTag';
import IconButton from '../../components/IconButton';
import { ResourceOverviewData } from '../../types';
import api from '../../services/api';
import { useChartTheme } from '../../contexts/ChartThemeContext';
import { formatRelativeTime, formatTimestamp } from '../../utils/time';
import { ROUTES } from '../../constants/routes';

const ResourceOverviewPage: React.FC = () => {
    const [overviewData, setOverviewData] = useState<ResourceOverviewData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { theme: chartTheme } = useChartTheme();

    const relativeFormatter = useMemo(() => new Intl.RelativeTimeFormat('zh-TW', { numeric: 'auto' }), []);

    const formatRelativeFromNow = useCallback((value?: string | null) => {
        if (!value) {
            return '—';
        }
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            return value;
        }
        const diffMs = parsed.getTime() - Date.now();
        const thresholds: { limit: number; divisor: number; unit: Intl.RelativeTimeFormatUnit }[] = [
            { limit: 60_000, divisor: 1_000, unit: 'second' },
            { limit: 3_600_000, divisor: 60_000, unit: 'minute' },
            { limit: 86_400_000, divisor: 3_600_000, unit: 'hour' },
            { limit: 604_800_000, divisor: 86_400_000, unit: 'day' },
            { limit: Number.POSITIVE_INFINITY, divisor: 604_800_000, unit: 'week' },
        ];
        for (const { limit, divisor, unit } of thresholds) {
            if (Math.abs(diffMs) < limit) {
                return relativeFormatter.format(Math.round(diffMs / divisor), unit);
            }
        }
        return relativeFormatter.format(Math.round(diffMs / 2_592_000_000), 'month');
    }, [relativeFormatter]);

    const fetchData = useCallback(async (options?: { silent?: boolean }) => {
        if (options?.silent) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }
        setError(null);
        try {
            const { data } = await api.get<ResourceOverviewData>('/resources/overview');
            setOverviewData(data);
        } catch (err) {
            setError('無法載入資源總覽數據。');
        } finally {
            if (options?.silent) {
                setIsRefreshing(false);
            } else {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const typeDistributionOption = useMemo(() => ({
        tooltip: { trigger: 'item' as const },
        legend: {
            orient: 'vertical' as const,
            left: 'left',
            textStyle: { color: chartTheme.text.primary }
        },
        series: [{
            name: '資源類型',
            type: 'pie' as const,
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 10,
                borderColor: chartTheme.resource_distribution.border,
                borderWidth: 2
            },
            label: { show: false, position: 'center' },
            emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold' } },
            labelLine: { show: false },
            data: overviewData?.distribution_by_type || [],
            color: chartTheme.palette
        }]
    }), [chartTheme, overviewData]);

    const providerDistributionOption = useMemo(() => ({
        tooltip: { trigger: 'axis' as const, axisPointer: { type: 'shadow' as const } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
            type: 'category' as const,
            data: overviewData?.distribution_by_provider.map(p => p.provider) || [],
            axisLine: { lineStyle: { color: chartTheme.grid.axis } }
        },
        yAxis: { type: 'value' as const, axisLine: { lineStyle: { color: chartTheme.grid.axis } } },
        series: [{
            name: '資源數量',
            type: 'bar' as const,
            barWidth: '60%',
            data: overviewData?.distribution_by_provider.map(p => p.count) || [],
            itemStyle: { color: chartTheme.resource_distribution.primary }
        }]
    }), [chartTheme, overviewData]);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Icon name="loader-circle" className="h-8 w-8 animate-spin text-slate-300" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-full flex-col items-center justify-center space-y-4 text-rose-200">
                <Icon name="alert-circle" className="h-12 w-12" />
                <h2 className="text-xl font-semibold">{error}</h2>
                <button
                    onClick={() => fetchData({ silent: false })}
                    className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-100 transition-colors hover:bg-rose-500/20"
                >
                    重新嘗試
                </button>
            </div>
        );
    }

    if (!overviewData) {
        return (
            <div className="flex h-full flex-col items-center justify-center space-y-3 text-slate-300">
                <Icon name="database" className="h-10 w-10" />
                <p className="text-sm">目前沒有可用的資源總覽資料。</p>
                <button
                    onClick={() => fetchData({ silent: false })}
                    className="rounded-lg border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-200 transition-colors hover:bg-sky-500/20"
                >
                    重新整理
                </button>
            </div>
        );
    }

    const hasTypeData = (overviewData.distribution_by_type?.length ?? 0) > 0;
    const hasProviderData = (overviewData.distribution_by_provider?.length ?? 0) > 0;
    const hasRecentDiscoveries = (overviewData.recently_discovered?.length ?? 0) > 0;
    const hasAlertGroups = (overviewData.groups_with_most_alerts?.length ?? 0) > 0;

    const getDiscoveredTimeDisplay = (value: string) => {
        if (value.includes('ago')) {
            return formatRelativeTime(value);
        }
        return `${formatTimestamp(value, { showSeconds: false })}（${formatRelativeFromNow(value)}）`;
    };

    return (
        <div className="space-y-6">
            <PageKPIs pageName="ResourceOverview" />

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/30">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-white">資源健康總覽</h2>
                        <p className="mt-1 text-sm text-slate-300">掌握不同類型與雲端提供商的資源分佈與警示群組。</p>
                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
                            <span>類型：{overviewData.distribution_by_type.length} 種</span>
                            <span>提供商：{overviewData.distribution_by_provider.length} 家</span>
                            <span>監控群組：{overviewData.groups_with_most_alerts.length} 個</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <IconButton
                            icon="refresh-cw"
                            label="重新整理資源總覽"
                            tooltip="重新整理資源總覽"
                            onClick={() => fetchData({ silent: true })}
                            isLoading={isRefreshing}
                        />
                        <Link
                            to={ROUTES.RESOURCES_LIST}
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-700/70 px-3 text-sm font-medium text-slate-200 transition-colors hover:border-sky-500/60 hover:text-sky-200"
                        >
                            <Icon name="list" className="h-4 w-4" />
                            查看資源列表
                        </Link>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/30">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-white">依類型分佈</h3>
                        <span className="text-xs text-slate-500">顯示主要部署類別</span>
                    </div>
                    {hasTypeData ? (
                        <div className="mt-4 h-64" aria-label="資源類型分佈圖">
                            <EChartsReact option={typeDistributionOption} />
                        </div>
                    ) : (
                        <div className="mt-6 rounded-xl border border-dashed border-slate-700/80 bg-slate-950/40 p-10 text-center text-sm text-slate-400">
                            目前尚無可視化的類型分佈資料。
                        </div>
                    )}
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/30">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-white">依提供商分佈</h3>
                        <span className="text-xs text-slate-500">比較不同雲端或自建環境</span>
                    </div>
                    {hasProviderData ? (
                        <div className="mt-4 h-64" aria-label="資源提供商分佈長條圖">
                            <EChartsReact option={providerDistributionOption} />
                        </div>
                    ) : (
                        <div className="mt-6 rounded-xl border border-dashed border-slate-700/80 bg-slate-950/40 p-10 text-center text-sm text-slate-400">
                            尚未匯入任何提供商統計資料。
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/30">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-white">最近發現的資源</h3>
                        <StatusTag tone="info" icon="radar" label="最新掃描" dense />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">列出最新掃描任務中新增或重新識別的資源。</p>
                    {hasRecentDiscoveries ? (
                        <ul className="mt-4 space-y-3">
                            {overviewData.recently_discovered.map(res => (
                                <li
                                    key={res.id}
                                    className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-2">
                                            <p className="text-sm font-semibold text-white">{res.name}</p>
                                            <p className="text-xs text-slate-400">類型：{res.type}</p>
                                            <p className="text-xs text-slate-500">發現時間：{getDiscoveredTimeDisplay(res.discovered_at)}</p>
                                        </div>
                                        <StatusTag tone="success" label="可匯入" dense />
                                    </div>
                                    <Link
                                        to={`/resources/discovery?job_id=${res.job_id}`}
                                        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-sky-300 transition-colors hover:text-sky-200"
                                    >
                                        查看掃描任務
                                        <Icon name="arrow-up-right" className="h-3.5 w-3.5" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="mt-6 rounded-xl border border-dashed border-slate-700/80 bg-slate-950/40 p-10 text-center text-sm text-slate-400">
                            近期掃描尚未發現新的資源，請稍後再試或調整掃描範圍。
                        </div>
                    )}
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/30">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-white">需要關注的資源群組</h3>
                        <StatusTag tone="warning" icon="activity" label="告警熱區" dense />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">依據嚴重與警告數量排序，協助優先處理高風險群組。</p>
                    {hasAlertGroups ? (
                        <ul className="mt-4 space-y-3">
                            {overviewData.groups_with_most_alerts.map(group => (
                                <li
                                    key={group.id}
                                    className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-2">
                                            <p className="text-sm font-semibold text-white">{group.name}</p>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <StatusTag tone="danger" label={`嚴重 ${group.criticals}`} dense />
                                                <StatusTag tone="warning" label={`警告 ${group.warnings}`} dense />
                                            </div>
                                        </div>
                                        <Icon name="chevron-right" className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <Link
                                        to={ROUTES.RESOURCES_GROUPS}
                                        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-sky-300 transition-colors hover:text-sky-200"
                                    >
                                        檢視群組詳情
                                        <Icon name="arrow-up-right" className="h-3.5 w-3.5" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="mt-6 rounded-xl border border-dashed border-slate-700/80 bg-slate-950/40 p-10 text-center text-sm text-slate-400">
                            暫無需要關注的資源群組，保持持續監控即可。
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResourceOverviewPage;