

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import EChartsReact from '../../components/EChartsReact';
import Icon from '../../components/Icon';
import Toolbar, { ToolbarButton } from '../../components/Toolbar';
import { exportToCsv } from '../../services/export';
import { AnalysisOverviewData, LogEntry, Anomaly, Suggestion } from '../../types';
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

    const handleEventCorrelationClick = (params: any) => {
        if (params.dataType !== 'node' || !params.data.id) return;
        const { id } = params.data;
        if (id.startsWith('INC-')) {
            navigate(`/incidents/${id}`);
        } else if (id.startsWith('res-')) {
            navigate(`/resources/${id}`);
        }
    };
    
    const healthScoreGaugeOption = overviewData ? {
        series: [{
            type: 'gauge',
            radius: '90%',
            center: ['50%', '55%'],
            axisLine: { lineStyle: { width: 18, color: [[0.5, '#dc2626'],[0.8, '#f97316'],[1, '#10b981']]}},
            pointer: { itemStyle: { color: 'auto' }, length: '60%', width: 6 },
            axisTick: { distance: -18, length: 5, lineStyle: { color: '#FFF', width: 1 } },
            splitLine: { distance: -18, length: 12, lineStyle: { color: '#FFF', width: 2 } },
            axisLabel: { color: 'auto', distance: 25, fontSize: 12 },
            detail: { valueAnimation: true, formatter: '{value}', color: 'auto', fontSize: 36, fontWeight: 'bold', offsetCenter: [0, '40%'] },
            data: [{ value: overviewData.health_score.score }]
        }]
    } : {};


    const eventCorrelationOption = {
        tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c}' },
        legend: { data: overviewData?.event_correlation_data.categories.map(c => c.name) || [], textStyle: { color: '#fff' } },
        series: [{
            name: 'Event Correlation', type: 'graph', layout: 'force',
            data: overviewData?.event_correlation_data.nodes || [],
            links: overviewData?.event_correlation_data.links || [],
            categories: overviewData?.event_correlation_data.categories || [],
            roam: true, label: { show: true }, force: { repulsion: 200 },
            color: ['#dc2626', '#f97316', '#10b981']
        }],
    };

    const handleExport = () => {
        if (!overviewData) return;
        const dataToExport = [
            ...overviewData.anomalies.map(a => ({ type: 'Anomaly', severity: a.severity, description: a.description, timestamp: a.timestamp, details: '' })),
            ...overviewData.suggestions.map(s => ({ type: 'Suggestion', impact: s.impact, description: s.title, effort: s.effort, details: s.details })),
        ];
        exportToCsv({
            filename: `analysis-overview-${new Date().toISOString().split('T')[0]}.csv`,
            data: dataToExport,
        });
    };

    const handleLogSearch = () => {
        navigate(logQuery.trim() ? `/analyzing/logs?q=${encodeURIComponent(logQuery.trim())}` : '/analyzing/logs');
    };

    const eventCorrelationEvents = { 'click': handleEventCorrelationClick };

    const getSeverityPill = (severity: Anomaly['severity']) => {
        switch (severity) {
            case 'critical': return 'bg-red-500/20 text-red-400';
            case 'warning': return 'bg-yellow-500/20 text-yellow-400';
            case 'info': return 'bg-sky-500/20 text-sky-400';
        }
    };
    
    const getImpactEffortPill = (level: Suggestion['impact'] | Suggestion['effort']) => {
        switch (level) {
            case '高': return 'bg-red-500/20 text-red-400';
            case '中': return 'bg-yellow-500/20 text-yellow-400';
            case '低': return 'bg-sky-500/20 text-sky-400';
        }
    };
    
    if (isLoading) {
        return (
             <div className="space-y-6 animate-pulse">
                <Toolbar rightActions={<ToolbarButton icon="download" text="匯出報表" onClick={() => {}} disabled />} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 glass-card rounded-xl p-6 h-[348px] bg-slate-800/50"></div>
                    <div className="lg:col-span-2 glass-card rounded-xl p-6 h-[348px] bg-slate-800/50"></div>
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass-card rounded-xl p-6 h-[250px] bg-slate-800/50"></div>
                    <div className="glass-card rounded-xl p-6 h-[250px] bg-slate-800/50"></div>
                </div>
                 <div className="glass-card rounded-xl p-6 h-[344px] bg-slate-800/50"></div>
            </div>
        );
    }

     if (error || !overviewData) {
        return <div className="text-center text-red-500">{error || '資料載入失敗。'}</div>;
    }

    return (
        <div className="space-y-6">
            <Toolbar rightActions={<><ToolbarButton icon="brain-circuit" text="重新分析" onClick={fetchOverviewData} ai /><ToolbarButton icon="download" text="匯出報表" onClick={handleExport} /></>} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 glass-card rounded-xl p-6 flex flex-col text-center">
                    <h2 className="text-xl font-bold mb-2">系統總體健康評分</h2>
                    <div className="flex-grow"><EChartsReact option={healthScoreGaugeOption} style={{ height: '200px' }} /></div>
                    <p className="text-sm text-slate-400 max-w-xs mx-auto">{overviewData.health_score.summary}</p>
                </div>
                <div className="lg:col-span-2 glass-card rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4">事件關聯分析</h2>
                    <EChartsReact option={eventCorrelationOption} style={{ height: '300px' }} onEvents={eventCorrelationEvents} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4">AI 異常檢測</h2>
                    <div className="space-y-3 h-52 overflow-y-auto">
                        {overviewData.anomalies.map((anomaly, index) => (
                            <div key={index} className="flex items-center p-3 bg-slate-800/50 rounded-lg">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getSeverityPill(anomaly.severity)} mr-3 shrink-0`}>{anomaly.severity}</span>
                                <p className="flex-grow text-slate-300 text-sm">{anomaly.description}</p>
                                <span className="text-sm text-slate-400 ml-3 shrink-0">{anomaly.timestamp}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="glass-card rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4">主動優化建議</h2>
                    <div className="space-y-4 h-52 overflow-y-auto">
                        {overviewData.suggestions.map((s, i) => (
                            <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-white">{s.title}</h3>
                                    <div className="flex space-x-2 text-xs shrink-0 ml-4">
                                        <span className={`px-2 py-0.5 rounded-full ${getImpactEffortPill(s.impact)}`}>{s.impact} 影響</span>
                                        <span className={`px-2 py-0.5 rounded-full ${getImpactEffortPill(s.effort)}`}>{s.effort} 投入</span>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-400 mt-1">{s.details}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">日誌探索</h2>
                <div className="flex space-x-2">
                    <input type="text" value={logQuery} onChange={e => setLogQuery(e.target.value)} placeholder="搜尋日誌... (e.g., error status:500)" className="flex-grow bg-slate-800/80 border border-slate-700 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    <button onClick={handleLogSearch} className="flex items-center text-sm text-white bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-md">搜尋</button>
                </div>
                <div className="mt-4 h-64 bg-slate-900/70 rounded-md p-4 font-mono text-xs text-slate-300 overflow-y-auto">
                    {overviewData.recent_logs.map((log: LogEntry) => {
                        const levelColor = log.level === 'error' ? 'text-red-400' : log.level === 'warning' ? 'text-yellow-400' : 'text-green-400';
                        return <p key={log.id}><span className="text-cyan-400">[{log.timestamp}]</span> <span className={levelColor}>[{log.level.toUpperCase()}]</span> {log.message}</p>
                    })}
                </div>
            </div>
        </div>
    );
};

export default AnalysisOverviewPage;