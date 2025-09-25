import React, { useState, useEffect, useCallback } from 'react';
import EChartsReact from '../../components/EChartsReact';
import Icon from '../../components/Icon';
import Dropdown from '../../components/Dropdown';
import PlaceholderModal from '../../components/PlaceholderModal';
import api from '../../services/api';
import { Resource } from '../../types';
import PageKPIs from '../../components/PageKPIs';

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
    // State for AI-generated content
    const [riskPrediction, setRiskPrediction] = useState<RiskPrediction | null>(null);
    const [isRiskLoading, setIsRiskLoading] = useState(true);
    const [isPlaceholderModalOpen, setIsPlaceholderModalOpen] = useState(false);
    const [modalFeatureName, setModalFeatureName] = useState('');
    const [bookmarkedResources, setBookmarkedResources] = useState<Resource[]>([]);

    useEffect(() => {
        api.get<{items: Resource[]}>('/resources', { params: { bookmarked: true } })
            .then(res => setBookmarkedResources(res.data.items))
            .catch(err => console.error("Failed to fetch bookmarked resources", err));
    }, []);

    const showPlaceholderModal = (featureName: string) => {
        setModalFeatureName(featureName);
        setIsPlaceholderModalOpen(true);
    };

    const fetchRiskPrediction = useCallback(async () => {
        setIsRiskLoading(true);
        try {
            const { data } = await api.get<RiskPrediction>('/dashboards/infrastructure-insights/risk-prediction');
            setRiskPrediction(data);
        } catch (error) {
            console.error("AI Risk Prediction Error:", error);
            setRiskPrediction({
                summary: "無法生成 AI 風險預測。API 連線可能發生問題。",
                risk_breakdown: { low: 70, medium: 20, high: 10 },
                top_risky_resources: [{ name: "N/A", risk: "無法分析" }]
            });
        } finally {
            setIsRiskLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRiskPrediction();
    }, [fetchRiskPrediction]);

    // Chart Options
    const riskBreakdownOption = {
        tooltip: { trigger: 'item' },
        legend: {
            orient: 'vertical',
            left: 'left',
            textStyle: { color: '#fff' }
        },
        series: [
            {
                name: '風險等級',
                type: 'pie',
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
                color: ['#dc2626', '#f97316', '#10b981']
            }
        ]
    };

    const timeOptions = [
        { label: 'Last 6 hours', value: 'from=now-6h&to=now' },
        { label: 'Last 12 hours', value: 'from=now-12h&to=now' },
        { label: 'Last 24 hours', value: 'from=now-24h&to=now' },
    ];
    const [timeRange, setTimeRange] = useState('from=now-6h&to=now');
    
    const handleRefresh = () => showPlaceholderModal('刷新洞察');
    const handleExport = () => showPlaceholderModal('匯出洞察報表');


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">基礎設施洞察</h1>
                <div className="flex items-center space-x-2">
                    <Dropdown label="時間範圍" options={timeOptions} value={timeRange} onChange={setTimeRange} />
                    <button onClick={handleRefresh} className="p-2 rounded-lg hover:bg-slate-700/50 flex items-center text-sm px-3 bg-slate-800/60 border border-slate-700"><Icon name="refresh-cw" className="w-4 h-4 mr-2" />刷新</button>
                    <button onClick={handleExport} className="p-2 rounded-lg hover:bg-slate-700/50 flex items-center text-sm px-3 bg-slate-800/60 border border-slate-700"><Icon name="download" className="w-4 h-4 mr-2" />匯出</button>
                </div>
            </div>

            <PageKPIs pageName="InfrastructureInsights" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold flex items-center"><Icon name="brain-circuit" className="w-6 h-6 mr-2 text-sky-400"/> AI 風險預測</h2>
                        <button onClick={fetchRiskPrediction} disabled={isRiskLoading} className="p-2 rounded-full hover:bg-slate-700 disabled:opacity-50">
                            <Icon name="refresh-cw" className={`w-4 h-4 ${isRiskLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                    {isRiskLoading || !riskPrediction ? (
                        <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-slate-700 rounded w-full"></div>
                            <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                            <div className="flex gap-4 mt-4">
                                <div className="w-1/2 h-24 bg-slate-700 rounded-lg"></div>
                                <div className="w-1/2 h-24 bg-slate-700 rounded-lg"></div>
                            </div>
                        </div>
                    ) : (
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
                        {bookmarkedResources.map(res => (
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
            <PlaceholderModal
                isOpen={isPlaceholderModalOpen}
                onClose={() => setIsPlaceholderModalOpen(false)}
                featureName={modalFeatureName}
            />
        </div>
    );
};

export default InfrastructureInsightsPage;
