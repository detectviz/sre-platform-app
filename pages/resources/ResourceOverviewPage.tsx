import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageKPIs from '../../components/PageKPIs';
import EChartsReact from '../../components/EChartsReact';
import Icon from '../../components/Icon';
import { ResourceOverviewData } from '../../types';
import api from '../../services/api';
import { useChartTheme } from '../../contexts/ChartThemeContext';

const ResourceOverviewPage: React.FC = () => {
    const [overviewData, setOverviewData] = useState<ResourceOverviewData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { theme: chartTheme } = useChartTheme();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get<ResourceOverviewData>('/resources/overview');
            setOverviewData(data);
        } catch (err) {
            setError('無法載入資源總覽數據。');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const typeDistributionOption = useMemo(() => ({
        tooltip: { trigger: 'item' },
        legend: {
            orient: 'vertical',
            left: 'left',
            textStyle: { color: chartTheme.text.primary }
        },
        series: [{
            name: '資源類型',
            type: 'pie',
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
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
            type: 'category',
            data: overviewData?.distribution_by_provider.map(p => p.provider) || [],
            axisLine: { lineStyle: { color: chartTheme.grid.axis } }
        },
        yAxis: { type: 'value', axisLine: { lineStyle: { color: chartTheme.grid.axis } } },
        series: [{
            name: '資源數量',
            type: 'bar',
            barWidth: '60%',
            data: overviewData?.distribution_by_provider.map(p => p.count) || [],
            itemStyle: { color: chartTheme.resource_distribution.primary }
        }]
    }), [chartTheme, overviewData]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Icon name="loader-circle" className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-red-400">
                <Icon name="alert-circle" className="w-12 h-12 mb-4" />
                <h2 className="text-xl font-bold">{error}</h2>
                <button onClick={fetchData} className="mt-4 px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">
                    重試
                </button>
            </div>
        );
    }
    
    if (!overviewData) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                <Icon name="database" className="w-10 h-10" />
                <p className="font-medium">目前沒有可用的資源總覽資料。</p>
                <button onClick={fetchData} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">
                    重新整理
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageKPIs pageName="ResourceOverview" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4">依類型分佈</h2>
                    <div className="h-64">
                        <EChartsReact option={typeDistributionOption} />
                    </div>
                </div>
                <div className="glass-card rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4">依提供商分佈</h2>
                     <div className="h-64">
                        <EChartsReact option={providerDistributionOption} />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4">最近發現的資源</h2>
                    <ul className="space-y-3">
                        {overviewData.recently_discovered.map(res => (
                            <li key={res.id} className="p-2 bg-slate-800/50 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-white">{res.name}</p>
                                    <p className="text-xs text-slate-400">{res.type} - 發現於 {res.discovered_at}</p>
                                </div>
                                <Link to="/resources/discovery" className="text-sm text-sky-400 hover:underline">
                                    查看任務
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="glass-card rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4">需要關注的資源群組</h2>
                    <ul className="space-y-3">
                        {overviewData.groups_with_most_alerts.map(group => (
                             <li key={group.id} className="p-2 bg-slate-800/50 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-white">{group.name}</p>
                                    <div className="flex items-center space-x-2 text-xs">
                                        <span className="text-red-400">{group.criticals} 嚴重</span>
                                        <span className="text-yellow-400">{group.warnings} 警告</span>
                                    </div>
                                </div>
                                <Link to={`/resources/groups`} className="text-sm text-sky-400 hover:underline">
                                    查看群組
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ResourceOverviewPage;