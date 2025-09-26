import React, { useState, useEffect, useCallback } from 'react';
import EChartsReact from '../../components/EChartsReact';
import Icon from '../../components/Icon';
import Toolbar, { ToolbarButton } from '../../components/Toolbar';
import Dropdown from '../../components/Dropdown';
import { exportToCsv } from '../../services/export';
import { CapacityPlanningData } from '../../types';
import api from '../../services/api';

const CapacityPlanningPage: React.FC = () => {
    const [data, setData] = useState<CapacityPlanningData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState('60_30');

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setIsRefreshing(true);
        else setIsLoading(true);
        setError(null);
        try {
            const response = await api.get<CapacityPlanningData>('/analysis/capacity-planning');
            setData(response.data);
        } catch (err) {
            setError('無法獲取容量規劃資料。');
        } finally {
            if (isRefresh) setIsRefreshing(false);
            else setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const timeRangeOptions = [
        { label: '最近 30 天 + 預測 15 天', value: '30_15' },
        { label: '最近 60 天 + 預測 30 天', value: '60_30' },
        { label: '最近 90 天 + 預測 45 天', value: '90_45' },
    ];

    const trendOption = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['CPU', 'Memory', 'Storage'], textStyle: { color: '#fff' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'time', axisLine: { lineStyle: { color: '#888' } } },
        yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value} %' }, splitLine: { lineStyle: { color: '#374151' } } },
        series: [
            { name: 'CPU', type: 'line', data: data?.trends.cpu.historical, showSymbol: false, lineStyle: { color: '#38bdf8' } },
            { name: 'CPU Forecast', type: 'line', data: data?.trends.cpu.forecast, showSymbol: false, lineStyle: { type: 'dashed', color: '#38bdf8' } },
            { name: 'Memory', type: 'line', data: data?.trends.memory.historical, showSymbol: false, lineStyle: { color: '#a78bfa' } },
            { name: 'Memory Forecast', type: 'line', data: data?.trends.memory.forecast, showSymbol: false, lineStyle: { type: 'dashed', color: '#a78bfa' } },
            { name: 'Storage', type: 'line', data: data?.trends.storage.historical, showSymbol: false, lineStyle: { color: '#34d399' } },
            { name: 'Storage Forecast', type: 'line', data: data?.trends.storage.forecast, showSymbol: false, lineStyle: { type: 'dashed', color: '#34d399' } },
        ]
    };

    const forecastModelOption = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['預測', '信賴區間'], textStyle: { color: '#fff' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'time', axisLine: { lineStyle: { color: '#888' } } },
        yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value} %' }, splitLine: { lineStyle: { color: '#374151' } } },
        series: [
            { name: '預測', type: 'line', data: data?.forecast_model.prediction, showSymbol: false, lineStyle: { color: '#facc15' } },
            { name: '信賴區間', type: 'line', data: data?.forecast_model.confidence_band[0], lineStyle: { opacity: 0 }, stack: 'confidence-band', symbol: 'none' },
            { name: '信賴區間', type: 'line', data: data ? data.forecast_model.confidence_band[1].map((point, i) => [point[0], point[1] - data.forecast_model.confidence_band[0][i][1]]) : [], lineStyle: { opacity: 0 }, areaStyle: { color: 'rgba(250, 204, 21, 0.2)' }, stack: 'confidence-band', symbol: 'none' }
        ]
    };

    const handleExport = () => {
        if (!data?.resource_analysis || data.resource_analysis.length === 0) {
            alert("沒有可匯出的資料。");
            return;
        }
        exportToCsv({
            filename: `capacity-planning-${new Date().toISOString().split('T')[0]}.csv`,
            data: data.resource_analysis,
        });
    };

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
                <button onClick={() => fetchData()} className="mt-4 px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">
                    重試
                </button>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <Toolbar
                leftActions={
                    <Dropdown
                        label="時間範圍"
                        options={timeRangeOptions}
                        value={timeRange}
                        onChange={setTimeRange}
                        minWidth="w-64"
                    />
                }
                rightActions={
                    <>
                        <ToolbarButton icon="brain-circuit" text="觸發 AI 分析" onClick={() => fetchData(true)} disabled={isRefreshing} />
                        <ToolbarButton icon="download" text="匯出報表" onClick={handleExport} />
                    </>
                }
            />
            {data && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div className="lg:col-span-3 glass-card rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-4">資源使用趨勢 (含預測)</h2>
                            <div className="h-80">
                                <EChartsReact option={trendOption} />
                            </div>
                        </div>
                        <div className="lg:col-span-2 glass-card rounded-xl p-6">
                             <h2 className="text-xl font-bold mb-4">CPU 容量預測模型</h2>
                             <div className="h-80">
                                <EChartsReact option={forecastModelOption} />
                             </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="glass-card rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-4">AI 優化建議</h2>
                            <div className="space-y-4">
                                {data.suggestions.map((s, i) => (
                                    <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold text-white">{s.title}</h3>
                                            <div className="flex space-x-2 text-xs">
                                                <span className="px-2 py-0.5 bg-red-500/30 text-red-300 rounded-full">{s.impact} 影響</span>
                                                <span className="px-2 py-0.5 bg-yellow-500/30 text-yellow-300 rounded-full">{s.effort} 投入</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-400 mt-1">{s.details}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="glass-card rounded-xl p-6 flex flex-col">
                            <h2 className="text-xl font-bold mb-4">詳細分析</h2>
                            <div className="flex-grow overflow-y-auto">
                                <table className="w-full text-sm text-left text-slate-300">
                                    <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2">資源名稱</th>
                                            <th className="px-4 py-2">目前用量</th>
                                            <th className="px-4 py-2">30 天預測</th>
                                            <th className="px-4 py-2">建議</th>
                                            <th className="px-4 py-2">成本估算</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {data.resource_analysis.map(r => (
                                            <tr key={r.name}>
                                                <td className="px-4 py-3 font-medium">{r.name}</td>
                                                <td className="px-4 py-3">{r.current}</td>
                                                <td className="px-4 py-3">{r.predicted}</td>
                                                <td className={`px-4 py-3 font-semibold ${r.recommended.includes('緊急') ? 'text-red-400' : r.recommended.includes('擴展') ? 'text-yellow-400' : ''}`}>{r.recommended}</td>
                                                <td className="px-4 py-3">{r.cost}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CapacityPlanningPage;