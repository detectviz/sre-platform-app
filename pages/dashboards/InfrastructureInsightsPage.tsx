import React, { useState, useEffect, useCallback, useMemo } from 'react';
import EChartsReact from '../../components/EChartsReact';
import Icon from '../../components/Icon';
import Dropdown from '../../components/Dropdown';
import api from '../../services/api';
import { Resource } from '../../types';
import PageKPIs from '../../components/PageKPIs';
import { exportToCsv } from '../../services/export';
import { showToast } from '../../services/toast';
import { useOptions } from '../../contexts/OptionsContext';
import { useChartTheme } from '../../contexts/ChartThemeContext';

// AI Response Types
interface RiskPrediction {
    summary: string;
    risk_breakdown: {
        low: number;
        medium: number;
        high: number;
    };
    top_risky_resources: {
        name: string;
        risk: string;
    }[];
}

const InfrastructureInsightsPage: React.FC = () => {
    const [riskPrediction, setRiskPrediction] = useState<RiskPrediction | null>(null);
    const [isRiskLoading, setIsRiskLoading] = useState(true);
    const [riskError, setRiskError] = useState<string | null>(null);
    const [bookmarkedResources, setBookmarkedResources] = useState<Resource[]>([]);
    const [isBookmarkLoading, setIsBookmarkLoading] = useState(true);

    const { options } = useOptions();
    const { theme: chartTheme } = useChartTheme();
    const infraInsightsOptions = options?.infra_insights;
    const [timeRange, setTimeRange] = useState('');

    useEffect(() => {
        if (infraInsightsOptions && infraInsightsOptions.time_options.length > 0) {
            const defaultTime = infraInsightsOptions.time_options.find(opt => opt.value.includes('6h'));
            setTimeRange(defaultTime ? defaultTime.value : infraInsightsOptions.time_options[0].value);
        }
    }, [infraInsightsOptions]);



    const fetchRiskPrediction = useCallback(async () => {
        setIsRiskLoading(true);
        setRiskError(null);
        try {
            const { data } = await api.get<RiskPrediction>('/ai/infra/risk-prediction');
            setRiskPrediction(data);
        } catch (error) {
            console.error("AI Risk Prediction Error:", error);
            setRiskPrediction(null);
            setRiskError("無法生成 AI 風險預測。API 連線可能發生問題。");
        } finally {
            setIsRiskLoading(false);
        }
    }, []);

    const fetchBookmarkedResources = useCallback(async () => {
        setIsBookmarkLoading(true);
        try {
            const { data } = await api.get<{ items: Resource[] }>('/resources', { params: { bookmarked: true } });
            setBookmarkedResources(data.items);
        } catch (error) {
            console.error("Failed to fetch bookmarked resources", error);
            setBookmarkedResources([]);
        } finally {
            setIsBookmarkLoading(false);
        }
    }, []);

    const fetchData = useCallback(() => {
        fetchRiskPrediction();
        fetchBookmarkedResources();
    }, [fetchRiskPrediction, fetchBookmarkedResources]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRefresh = () => {
        fetchData();
    };

    const handleExport = () => {
        if (!riskPrediction && bookmarkedResources.length === 0) {
            showToast('沒有可匯出的資料。', 'warning');
            return;
        }
        const dataToExport = [
            ...(riskPrediction?.top_risky_resources.map(r => ({
                type: '重點風險資源',
                name: r.name,
                details: r.risk,
                status: ''
            })) || []),
            ...bookmarkedResources.map(r => ({
                type: '已收藏資源',
                name: r.name,
                details: r.type,
                status: r.status
            }))
        ];
        exportToCsv({
            filename: `infra-insights-${new Date().toISOString().split('T')[0]}.csv`,
            data: dataToExport,
        });
    };

    // Chart Options
    const riskBreakdownOption = useMemo(() => ({
        tooltip: { trigger: 'item' as const },
        legend: {
            orient: 'vertical' as const,
            left: 'left',
            textStyle: { color: chartTheme.text.primary }
        },
        series: [
            {
                name: '風險等級',
                type: 'pie' as const,
                radius: '50%',
                data: [
                    { value: riskPrediction?.risk_breakdown?.high || 0, name: '高風險' },
                    { value: riskPrediction?.risk_breakdown?.medium || 0, name: '中風險' },
                    { value: riskPrediction?.risk_breakdown?.low || 0, name: '低風險' },
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                color: [chartTheme.pie.high, chartTheme.pie.medium, chartTheme.pie.low]
            }
        ]
    }), [chartTheme, riskPrediction]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">基礎設施洞察</h1>
                <div className="flex items-center space-x-2">
                    {infraInsightsOptions && <Dropdown label="時間範圍" options={infraInsightsOptions.time_options || []} value={timeRange} onChange={setTimeRange} />}
                    <button onClick={handleRefresh} className="p-2 rounded-lg hover:bg-slate-700/50 flex items-center text-sm px-3 bg-slate-800/60 border border-slate-700"><Icon name="refresh-cw" className="w-4 h-4 mr-2" />刷新</button>
                    <button onClick={handleExport} className="p-2 rounded-lg hover:bg-slate-700/50 flex items-center text-sm px-3 bg-slate-800/60 border border-slate-700"><Icon name="download" className="w-4 h-4 mr-2" />匯出</button>
                </div>
            </div>

            <PageKPIs pageName="InfrastructureInsights" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold flex items-center"><Icon name="brain-circuit" className="w-6 h-6 mr-2 text-sky-400" /> AI 風險預測</h2>
                    </div>
                    {isRiskLoading ? (
                        <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-slate-700 rounded w-full"></div>
                            <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                            <div className="flex gap-4 mt-4">
                                <div className="w-1/2 h-24 bg-slate-700 rounded-lg"></div>
                                <div className="w-1/2 h-24 bg-slate-700 rounded-lg"></div>
                            </div>
                        </div>
                    ) : riskError ? (
                        <div className="flex flex-col items-center justify-center h-full text-red-400">
                            <Icon name="alert-circle" className="w-10 h-10 mb-2" />
                            <p className="font-semibold">{riskError}</p>
                            <button onClick={fetchRiskPrediction} className="mt-4 px-3 py-1.5 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">
                                重試
                            </button>
                        </div>
                    ) : riskPrediction && (
                        <div>
                            <p className="text-slate-300 mb-4">{riskPrediction.summary}</p>
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="md:w-1/2">
                                    <h3 className="text-lg font-semibold mb-2">風險等級分佈</h3>
                                    <div className="h-48">
                                        <EChartsReact option={riskBreakdownOption} />
                                    </div>
                                </div>
                                <div className="md:w-1/2">
                                    <h3 className="text-lg font-semibold mb-2">重點風險資源</h3>
                                    <div className="space-y-2">
                                        {riskPrediction.top_risky_resources.map((res, index) => (
                                            <div key={index} className="p-2 bg-slate-800/50 rounded-md">
                                                <p className="font-semibold text-white">{res.name}</p>
                                                <p className="text-sm text-red-400">{res.risk}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="lg:col-span-1 glass-card rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4">關注的資源</h2>
                    <div className="space-y-3">
                        {isBookmarkLoading ? (
                            <div className="flex items-center justify-center h-full text-slate-400">
                                <Icon name="loader-circle" className="w-6 h-6 animate-spin" />
                            </div>
                        ) : bookmarkedResources.map(res => (
                            <div key={res.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                                <div>
                                    <p className="font-semibold text-white">{res.name}</p>
                                    <p className="text-xs text-slate-400">{res.type}</p>
                                </div>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${res.status === 'healthy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{res.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfrastructureInsightsPage;
