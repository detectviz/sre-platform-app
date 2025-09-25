import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import ContextualKPICard from '../../components/ContextualKPICard';
import EChartsReact from '../../components/EChartsReact';
import Icon from '../../components/Icon';
import Dropdown from '../../components/Dropdown';
import { MOCK_RESOURCES } from '../../constants';
import PlaceholderModal from '../../components/PlaceholderModal';

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

    const showPlaceholderModal = (featureName: string) => {
        setModalFeatureName(featureName);
        setIsPlaceholderModalOpen(true);
    };

    const generateRiskPrediction = useCallback(async () => {
        setIsRiskLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const mockInfraMetrics = `
- Total Resources: 120
- Critical Alerts (last 24h): 5
- High CPU Resources (>80%): 8 (api-gateway-prod-01, k8s-node-3, ...)
- High Memory Resources (>90%): 3 (rds-prod-main, ...)
- Network Latency Spikes: 2 events on 'api-gateway-prod-01'
- Recent Deployments: 'user-service v3.1.0' (failed rollback)
            `;

            const prompt = `
You are an expert SRE AI providing risk predictions for an infrastructure dashboard.
Analyze the following live infrastructure metrics and generate a risk assessment for the next 24 hours.
Your response must be in Traditional Chinese and follow this specific JSON format.

Live Metrics:
${mockInfraMetrics}

JSON Response Format:
{
  "summary": "<A concise summary of potential risks for the next 24 hours>",
  "risk_breakdown": { "low": <percentage>, "medium": <percentage>, "high": <percentage> },
  "top_risky_resources": [ { "name": "<resource_name>", "risk": "<brief risk description>" } ]
}
Example:
{
  "summary": "預計 API 閘道因延遲尖峰與部署失敗，可能在接下來的 24 小時內發生服務降級。資料庫資源因高記憶體使用率也存在風險。",
  "risk_breakdown": { "low": 60, "medium": 30, "high": 10 },
  "top_risky_resources": [
    { "name": "api-gateway-prod-01", "risk": "服務降級或中斷" },
    { "name": "user-service", "risk": "因部署失敗導致功能異常" },
    { "name": "rds-prod-main", "risk": "資料庫效能緩慢或無回應" }
  ]
}
`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            summary: { type: Type.STRING },
                            risk_breakdown: {
                                type: Type.OBJECT,
                                properties: {
                                    low: { type: Type.NUMBER },
                                    medium: { type: Type.NUMBER },
                                    high: { type: Type.NUMBER },
                                },
                                required: ['low', 'medium', 'high']
                            },
                            top_risky_resources: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING },
                                        risk: { type: Type.STRING },
                                    },
                                    required: ['name', 'risk']
                                }
                            }
                        },
                        required: ['summary', 'risk_breakdown', 'top_risky_resources']
                    }
                }
            });

            const result: RiskPrediction = JSON.parse(response.text);
            setRiskPrediction(result);

        } catch (error) {
            console.error("AI Risk Prediction Error:", error);
            // Provide a fallback in case of API error
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
        generateRiskPrediction();
    }, [generateRiskPrediction]);

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

    const bookmarkedResources = MOCK_RESOURCES.slice(0, 4);

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ContextualKPICard title="總資源數" value="120" description="跨雲供應商" icon="database-zap" iconBgColor="bg-blue-500" />
                <ContextualKPICard title="運行中" value="115" description="95.8% 健康" icon="heart-pulse" iconBgColor="bg-green-500" />
                <ContextualKPICard title="異常" value="5" description="4.2% 需要關注" icon="siren" iconBgColor="bg-orange-500" />
                <ContextualKPICard title="離線" value="0" description="0% 離線" icon="cloud-off" iconBgColor="bg-slate-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold flex items-center"><Icon name="brain-circuit" className="w-6 h-6 mr-2 text-sky-400"/> AI 風險預測</h2>
                        <button onClick={generateRiskPrediction} disabled={isRiskLoading} className="p-2 rounded-full hover:bg-slate-700 disabled:opacity-50">
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