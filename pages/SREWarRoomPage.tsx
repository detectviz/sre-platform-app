import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import EChartsReact from '../components/EChartsReact';
import Icon from '../components/Icon';
import api from '../services/api';
import PageKPIs from '../components/PageKPIs';

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
             // The backend now handles the AI generation logic.
            const { data } = await api.post<BriefingData>('/sre-war-room/briefing/generate');
            setAiBriefing(data);
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
      <PageKPIs pageName="SREWarRoom" />

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
