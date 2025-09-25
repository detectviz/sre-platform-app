import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { GoogleGenAI, Type } from "@google/genai";
import ContextualKPICard from '../components/ContextualKPICard';
import EChartsReact from '../components/EChartsReact';
import Icon from '../components/Icon';
import api from '../services/api';

interface BriefingData {
    stability_summary: string;
    key_anomaly: {
        description: string;
        resource_name: string;
        resource_path: string;
    };
    recommendation: {
        action_text: string;
        button_text: string;
        button_link: string;
    };
}


const SREWarRoomPage: React.FC = () => {
    const [aiBriefing, setAiBriefing] = useState<BriefingData | null>(null);
    const [isBriefingLoading, setIsBriefingLoading] = useState(true);

    // Encapsulate dashboard data to make it reusable
    const dashboardData = {
        kpis: {
            pending: 5,
            critical: 2,
            inProgress: 3,
            inProgressTrend: -0.15,
            resolvedToday: 12,
            resolvedTrend: 0.08,
            automationRate: 35.2,
            autoResolved: 4,
        },
        heatmapData: [
            // Latency, Traffic, Error, Saturation for each service
            { service: '認證服務', values: [95, 100, 99, 92] },
            { service: '支付 API', values: [98, 97, 5, 88] },
            { service: '存儲', values: [100, 99, 98, 75] },
            { service: 'Web 前端', values: [92, 94, 99, 91] },
        ],
        resourceGroupData: [
            { name: 'Web 集群', healthy: 12, warning: 3, critical: 1 },
            { name: '資料庫集群', healthy: 8, warning: 2, critical: 0 },
        ],
    };

    const generateDynamicPrompt = (data: typeof dashboardData): string => {
        const heatmapAnomalies = data.heatmapData
            .map(s => ({ service: s.service, errorRate: 100 - s.values[2] }))
            .filter(s => s.errorRate > 1)
            .map(s => `${s.service} 錯誤率為 ${s.errorRate}%`)
            .join(', ');

        const resourceGroupAnomalies = data.resourceGroupData
            .filter(g => g.critical > 0)
            .map(g => `${g.name} 有 ${g.critical} 個嚴重問題`)
            .join(', ');

        return `
            You are an expert SRE providing a daily briefing for the SRE War Room dashboard.
            Analyze the following live system metrics and generate a briefing.
            Respond in Traditional Chinese.

            Map the following names to paths for 'resource_path' and 'button_link':
            - "支付 API" -> "/dashboard/api-service-status"
            - "Web 集群" -> "/resources/groups/rg-001"
            - "資料庫集群" -> "/resources/groups/rg-002"

            Live System Metrics:
            - Pending Incidents: ${data.kpis.pending} total, with ${data.kpis.critical} critical incidents.
            - Service Health Anomalies: ${heatmapAnomalies || "None detected"}.
            - Resource Group Anomalies: ${resourceGroupAnomalies || "None detected"}.

            Based on these metrics, generate the briefing.
        `;
    };

    const fetchBriefing = useCallback(async () => {
        setIsBriefingLoading(true);
        try {
            const { data } = await api.get<BriefingData>('/sre-war-room/briefing');
            setAiBriefing(data);
        } catch (error) {
            console.error("Fetch Briefing Error:", error);
            setAiBriefing(null);
        } finally {
            setIsBriefingLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBriefing();
    }, [fetchBriefing]);


    const handleRefreshBriefing = useCallback(async () => {
        setIsBriefingLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = generateDynamicPrompt(dashboardData);
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            stability_summary: { type: Type.STRING },
                            key_anomaly: {
                                type: Type.OBJECT,
                                properties: {
                                    description: { type: Type.STRING },
                                    resource_name: { type: Type.STRING },
                                    resource_path: { type: Type.STRING },
                                },
                                required: ['description', 'resource_name', 'resource_path']
                            },
                            recommendation: {
                                type: Type.OBJECT,
                                properties: {
                                    action_text: { type: Type.STRING },
                                    button_text: { type: Type.STRING },
                                    button_link: { type: Type.STRING },
                                },
                                required: ['action_text', 'button_text', 'button_link']
                            }
                        },
                        required: ['stability_summary', 'key_anomaly', 'recommendation']
                    }
                }
            });

            const result: BriefingData = JSON.parse(response.text);

            // Save the newly generated briefing to the mock backend
            await api.post('/sre-war-room/briefing', result);

            setAiBriefing(result); // Update UI with the new briefing
        } catch (error) {
            console.error("AI Briefing Generation Error:", error);
            setAiBriefing(null);
        } finally {
            setIsBriefingLoading(false);
        }
    }, []);

    const serviceHealthOption = {
        tooltip: { trigger: 'item' },
        xAxis: { type: 'category', data: ['延遲', '流量', '錯誤', '飽和度'], axisLine: { lineStyle: { color: '#888' } } },
        yAxis: { type: 'category', data: ['認證服務', '支付 API', '存儲', 'Web 前端', '數據管道', '快取'], axisLine: { lineStyle: { color: '#888' } } },
        visualMap: {
            min: 0, max: 100, calculable: true, orient: 'horizontal', left: 'center', bottom: '2%',
            inRange: { color: ['#dc2626', '#f97316', '#10b981'] },
            textStyle: { color: '#fff' }
        },
        series: [{
            name: '服務健康度',
            type: 'heatmap',
            data: [
                [0, 0, 95], [1, 0, 100], [2, 0, 99], [3, 0, 92],
                [0, 1, 98], [1, 1, 97], [2, 1, 5], [3, 1, 88],
                [0, 2, 100], [1, 2, 99], [2, 2, 98], [3, 2, 75],
                [0, 3, 92], [1, 3, 94], [2, 3, 99], [3, 3, 91],
                [0, 4, 85], [1, 4, 91], [2, 4, 95], [3, 4, 60],
                [0, 5, 99], [1, 5, 100], [2, 5, 99], [3, 5, 96],
            ],
            label: { show: true },
            emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
        }]
    };

    const resourceGroupOption = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: ['健康', '警告', '嚴重'], textStyle: { color: '#fff' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'value', axisLine: { lineStyle: { color: '#888' } } },
        yAxis: { type: 'category', data: ['Web 集群', '資料庫集群', '開發環境', '災備系統'], axisLine: { lineStyle: { color: '#888' } } },
        series: [
            { name: '健康', type: 'bar', stack: 'total', label: { show: true }, emphasis: { focus: 'series' }, data: [12, 8, 15, 9], color: '#10b981' },
            { name: '警告', type: 'bar', stack: 'total', label: { show: true }, emphasis: { focus: 'series' }, data: [3, 2, 1, 4], color: '#f97316' },
            { name: '嚴重', type: 'bar', stack: 'total', label: { show: true }, emphasis: { focus: 'series' }, data: [1, 0, 2, 0], color: '#dc2626' }
        ]
    };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
        <ContextualKPICard 
            title="待處理事件"
            value={dashboardData.kpis.pending.toString()}
            description={<><span className="text-red-400 font-semibold">{dashboardData.kpis.critical} 嚴重</span></>}
            icon="shield-alert"
            iconBgColor="bg-red-500"
        />
        <ContextualKPICard 
            title="處理中"
            value={dashboardData.kpis.inProgress.toString()}
            description={<><span className={dashboardData.kpis.inProgressTrend > 0 ? "text-red-400" : "text-green-400"}>{dashboardData.kpis.inProgressTrend > 0 ? '↑' : '↓'}{Math.abs(dashboardData.kpis.inProgressTrend * 100)}%</span> vs 昨日</>}
            icon="clock"
            iconBgColor="bg-yellow-500"
        />
        <ContextualKPICard 
            title="今日已解決"
            value={dashboardData.kpis.resolvedToday.toString()}
            description={<><span className={dashboardData.kpis.resolvedTrend > 0 ? "text-green-400" : "text-red-400"}>{dashboardData.kpis.resolvedTrend > 0 ? '↑' : '↓'}{Math.abs(dashboardData.kpis.resolvedTrend * 100)}%</span> vs 昨日</>}
            icon="check-circle"
            iconBgColor="bg-green-500"
        />
        <ContextualKPICard 
            title="自動化率"
            value={`${dashboardData.kpis.automationRate}%`}
            description={<>{dashboardData.kpis.autoResolved} 事件自動解決</>}
            icon="bot"
            iconBgColor="bg-sky-500"
        />
      </div>

      <div className="glass-card rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center"><Icon name="brain-circuit" className="w-6 h-6 mr-2 text-purple-400"/> AI 每日簡報</h2>
            <button onClick={handleRefreshBriefing} disabled={isBriefingLoading} className="p-2 rounded-full hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">
              <Icon name="refresh-cw" className={`w-4 h-4 ${isBriefingLoading ? 'animate-spin' : ''}`} />
            </button>
        </div>
        {isBriefingLoading ? (
            <div className="space-y-2 animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-700 rounded w-2/3"></div>
            </div>
        ) : aiBriefing ? (
             <div className="space-y-4 text-slate-300">
                <div className="glass-card rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2 flex items-center"><Icon name="shield-check" className="w-5 h-5 mr-2 text-green-400"/> 穩定性摘要</h3>
                  <p>{aiBriefing.stability_summary}</p>
                </div>
                <div className="glass-card rounded-lg p-4 border-l-4 border-orange-400">
                    <h3 className="font-semibold text-white mb-2 flex items-center"><Icon name="siren" className="w-5 h-5 mr-2 text-orange-400"/> 關鍵異常</h3>
                    <p>{aiBriefing.key_anomaly.description} on <Link to={aiBriefing.key_anomaly.resource_path} className="text-sky-400 hover:underline font-semibold">{aiBriefing.key_anomaly.resource_name}</Link></p>
                </div>
                <div className="glass-card rounded-lg p-4 border-l-4 border-yellow-400">
                    <h3 className="font-semibold text-white mb-2 flex items-center"><Icon name="wrench" className="w-5 h-5 mr-2 text-yellow-400"/> 建議操作</h3>
                    <div className="flex justify-between items-center">
                        <p>{aiBriefing.recommendation.action_text}</p>
                        <Link to={aiBriefing.recommendation.button_link}>
                            <button className="flex items-center text-sm text-white bg-sky-600 hover:bg-sky-700 px-3 py-1.5 rounded-md shrink-0 ml-4">
                                <Icon name="arrow-right" className="w-4 h-4 mr-2"/>
                                {aiBriefing.recommendation.button_text}
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        ) : (
            <p className="text-red-400">無法生成 AI 簡報。請檢查 API 金鑰或稍後再試。</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-xl p-6">
             <h2 className="text-xl font-bold mb-4">服務健康度總覽</h2>
             <EChartsReact option={serviceHealthOption} style={{ height: '300px' }} />
          </div>
          <div className="glass-card rounded-xl p-6">
             <h2 className="text-xl font-bold mb-4">資源群組狀態</h2>
             <EChartsReact option={resourceGroupOption} style={{ height: '300px' }} />
          </div>
      </div>

    </div>
  );
};

export default SREWarRoomPage;