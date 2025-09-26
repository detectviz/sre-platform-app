import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import EChartsReact from '../../components/EChartsReact';
import Icon from '../../components/Icon';
import Toolbar, { ToolbarButton } from '../../components/Toolbar';
import { exportToCsv } from '../../services/export';
import { AnalysisOverviewData, LogEntry } from '../../types';
import api from '../../services/api';

const AnalysisOverviewPage: React.FC = () => {
    const [overviewData, setOverviewData] = useState<AnalysisOverviewData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [logQuery, setLogQuery] = useState('');
    const navigate = useNavigate();

    const fetchOverviewData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get<AnalysisOverviewData>('/analysis/overview');
            setOverviewData(data);
        } catch (err) {
            setError('無法獲取分析總覽數據。');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOverviewData();
    }, [fetchOverviewData]);

    const healthScoreOption = {
        tooltip: { trigger: 'axis', formatter: (params: any) => {
            if (!params || !params[0]) return '';
            return `${new Date(params[0].value[0]).toLocaleTimeString()}<br/>Score: ${params[0].value[1]}`
        }},
        xAxis: { type: 'time', splitLine: { show: false }, axisLine: { lineStyle: { color: '#888' } } },
        yAxis: { type: 'value', boundaryGap: [0, '10%'], axisLine: { lineStyle: { color: '#888' } }, splitLine: { lineStyle: { color: '#374151' } } },
        series: [{
            name: 'Health Score',
            type: 'line',
            showSymbol: false,
            data: overviewData?.health_score_data || [],
            lineStyle: { color: '#38bdf8' },
            areaStyle: {
                color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgba(56, 189, 248, 0.3)'
                }, {
                    offset: 1,
                    color: 'rgba(56, 189, 248, 0)'
                }])
            }
        }],
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    };

    const eventCorrelationOption = {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c}'
        },
        legend: {
            data: overviewData?.event_correlation_data.categories.map(c => c.name) || [],
            textStyle: { color: '#fff' }
        },
        series: [{
            name: 'Event Correlation',
            type: 'graph',
            layout: 'force',
            data: overviewData?.event_correlation_data.nodes || [],
            links: overviewData?.event_correlation_data.links || [],
            categories: overviewData?.event_correlation_data.categories || [],
            roam: true,
            label: { show: true },
            force: { repulsion: 200 }
        }],
        color: ['#dc2626', '#f97316', '#10b981']
    };

    const handleExport = () => {
        if (!overviewData) return;
        const dataToExport = [
            ...overviewData.event_correlation_data.nodes.map(node => ({
                type: 'Event',
                name: node.name,
                value: node.value,
                category: overviewData.event_correlation_data.categories[node.category].name
            })),
             ...overviewData.recent_logs.map(log => ({
                type: 'Log',
                name: log.message,
                value: log.service,
                category: log.level
            }))
        ];
        exportToCsv({
            filename: `analysis-overview-${new Date().toISOString().split('T')[0]}.csv`,
            data: dataToExport,
        });
    };

    const handleLogSearch = () => {
        if (logQuery.trim()) {
            navigate(`/analyzing/logs?q=${encodeURIComponent(logQuery.trim())}`);
        } else {
            navigate('/analyzing/logs');
        }
    };

    if (isLoading) {
        return (
             <div className="space-y-6">
                <Toolbar rightActions={<ToolbarButton icon="download" text="匯出報表" onClick={() => {}} disabled />} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass-card rounded-xl p-6 h-[348px] animate-pulse bg-slate-800/50"></div>
                    <div className="glass-card rounded-xl p-6 h-[348px] animate-pulse bg-slate-800/50"></div>
                </div>
                 <div className="glass-card rounded-xl p-6 h-[344px] animate-pulse bg-slate-800/50"></div>
            </div>
        );
    }

     if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <Toolbar rightActions={<ToolbarButton icon="download" text="匯出報表" onClick={handleExport} />} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center"><Icon name="line-chart" className="w-5 h-5 mr-2 text-sky-400" /> System Health Score (Last Hour)</h2>
                    <EChartsReact option={healthScoreOption} style={{ height: '300px' }} />
                </div>
                <div className="glass-card rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center"><Icon name="share-2" className="w-5 h-5 mr-2 text-green-400" /> Event Correlation Analysis</h2>
                    <EChartsReact option={eventCorrelationOption} style={{ height: '300px' }} />
                </div>
            </div>

             <div className="glass-card rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center"><Icon name="search" className="w-5 h-5 mr-2 text-yellow-400" /> Log Explorer</h2>
                <div className="flex space-x-2">
                    <input type="text" value={logQuery} onChange={e => setLogQuery(e.target.value)} placeholder="Search logs... (e.g., error status:500)" className="flex-grow bg-slate-800/80 border border-slate-700 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    <button onClick={handleLogSearch} className="flex items-center text-sm text-white bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-md">
                        Search
                    </button>
                </div>
                 <div className="mt-4 h-64 bg-slate-900/70 rounded-md p-4 font-mono text-xs text-slate-300 overflow-y-auto">
                    {overviewData?.recent_logs.map((log: LogEntry) => {
                        const levelColor = log.level === 'error' ? 'text-red-400' : log.level === 'warning' ? 'text-yellow-400' : 'text-green-400';
                        return <p key={log.id}><span className="text-cyan-400">[{log.timestamp}]</span> <span className={levelColor}>[{log.level.toUpperCase()}]</span> {log.message}</p>
                    })}
                </div>
            </div>
        </div>
    );
};

export default AnalysisOverviewPage;