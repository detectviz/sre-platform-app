

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EChartsReact from '../components/EChartsReact';
import Icon from '../components/Icon';
import api from '../services/api';
import PageKPIs from '../components/PageKPIs';
import { ServiceHealthData, ResourceGroupStatusData } from '../types';
import { useContent } from '../contexts/ContentContext';

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
    const { content } = useContent();
    const pageContent = content?.SRE_WAR_ROOM;

    const [aiBriefing, setAiBriefing] = useState<BriefingData | null>(null);
    const [isBriefingLoading, setIsBriefingLoading] = useState(true);
    const [serviceHealthData, setServiceHealthData] = useState<ServiceHealthData | null>(null);
    const [resourceGroupData, setResourceGroupData] = useState<ResourceGroupStatusData | null>(null);
    const [isChartLoading, setIsChartLoading] = useState(true);
    const [serviceHealthError, setServiceHealthError] = useState<string | null>(null);
    const [resourceGroupError, setResourceGroupError] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchBriefing = useCallback(async () => {
        setIsBriefingLoading(true);
        try {
            const { data } = await api.get<BriefingData>('/ai/briefing');
            setAiBriefing(data);
        } catch (error) {
            console.error("Fetch Briefing Error:", error);
            setAiBriefing(null);
        } finally {
            setIsBriefingLoading(false);
        }
    }, []);
    
    const fetchChartData = useCallback(async () => {
        setIsChartLoading(true);
        setServiceHealthError(null);
        setResourceGroupError(null);
        try {
            const [healthRes, groupRes] = await Promise.all([
                api.get<ServiceHealthData>('/dashboards/sre-war-room/service-health'),
                api.get<ResourceGroupStatusData>('/dashboards/sre-war-room/resource-group-status')
            ]);
            setServiceHealthData(healthRes.data);
            setResourceGroupData(groupRes.data);
        } catch (error) {
             console.error("Fetch Chart Data Error:", error);
             setServiceHealthError('無法載入服務健康度資料。');
             setResourceGroupError('無法載入資源群組狀態資料。');
        } finally {
            setIsChartLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBriefing();
        fetchChartData();
    }, [fetchBriefing, fetchChartData]);


    const handleRefreshBriefing = useCallback(async () => {
        setIsBriefingLoading(true);
        try {
            const { data } = await api.post<BriefingData>('/ai/briefing/generate');
            setAiBriefing(data);
        } catch (error) {
            console.error("AI Briefing Generation Error:", error);
            setAiBriefing(null);
        } finally {
            setIsBriefingLoading(false);
        }
    }, []);

    const handleServiceHealthClick = (params: any) => {
        if (params.componentType === 'series' && serviceHealthData?.y_axis_labels) {
            const serviceName = serviceHealthData.y_axis_labels[params.data[1]];
            if (serviceName) {
                navigate('/resources', { state: { initialFilters: { type: serviceName } } });
            }
        }
    };
    
    const handleResourceGroupClick = (params: any) => {
        if (params.componentType === 'series' && params.name) {
            const groupName = params.name;
            navigate('/resources/groups', { state: { initialSearchTerm: groupName } });
        }
    };

    const serviceHealthOption = {
        tooltip: { trigger: 'item' },
        xAxis: { type: 'category', data: serviceHealthData?.x_axis_labels || [], axisLine: { lineStyle: { color: '#888' } } },
        yAxis: { type: 'category', data: serviceHealthData?.y_axis_labels || [], axisLine: { lineStyle: { color: '#888' } } },
        visualMap: {
            min: 0, max: 100, calculable: true, orient: 'horizontal', left: 'center', bottom: '2%',
            inRange: { color: ['#dc2626', '#f97316', '#10b981'] },
            textStyle: { color: '#fff' }
        },
        series: [{
            name: '服務健康度',
            type: 'heatmap',
            data: serviceHealthData?.heatmap_data || [],
            label: { show: true },
            emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
        }]
    };

    const resourceGroupOption = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: resourceGroupData?.series.map(s => s.name) || [], textStyle: { color: '#fff' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'value', axisLine: { lineStyle: { color: '#888' } } },
        yAxis: { type: 'category', data: resourceGroupData?.group_names || [], axisLine: { lineStyle: { color: '#888' } } },
        series: resourceGroupData?.series.map(s => ({
            ...s,
            type: 'bar',
            stack: 'total',
            label: { show: true },
            emphasis: { focus: 'series' },
            color: s.name === '健康' ? '#10b981' : s.name === '警告' ? '#f97316' : '#dc2626'
        })) || []
    };

    const serviceHealthEvents = { 'click': handleServiceHealthClick };
    const resourceGroupEvents = { 'click': handleResourceGroupClick };

    if (!pageContent) return <div className="flex items-center justify-center h-full"><Icon name="loader-circle" className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <PageKPIs pageName="SREWarRoom" />

      <div className="glass-card rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center"><Icon name="brain-circuit" className="w-6 h-6 mr-2 text-purple-400"/> {pageContent.AI_BRIEFING_TITLE}</h2>
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
                  <h3 className="font-semibold text-white mb-2 flex items-center"><Icon name="shield-check" className="w-5 h-5 mr-2 text-green-400"/> {pageContent.STABILITY_SUMMARY}</h3>
                  <p>{aiBriefing.stability_summary}</p>
                </div>
                <div className="glass-card rounded-lg p-4 border-l-4 border-orange-400">
                    <h3 className="font-semibold text-white mb-2 flex items-center"><Icon name="siren" className="w-5 h-5 mr-2 text-orange-400"/> {pageContent.KEY_ANOMALY}</h3>
                    <p>{aiBriefing.key_anomaly.description} on <Link to={aiBriefing.key_anomaly.resource_path} className="text-sky-400 hover:underline font-semibold">{aiBriefing.key_anomaly.resource_name}</Link></p>
                </div>
                <div className="glass-card rounded-lg p-4 border-l-4 border-yellow-400">
                    <h3 className="font-semibold text-white mb-2 flex items-center"><Icon name="wrench" className="w-5 h-5 mr-2 text-yellow-400"/> {pageContent.RECOMMENDED_ACTION}</h3>
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
            <p className="text-red-400">{pageContent.GENERATE_BRIEFING_ERROR}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-xl p-6">
             <h2 className="text-xl font-bold mb-4">{pageContent.SERVICE_HEALTH_TITLE}</h2>
             {isChartLoading ? (
                <div className="h-[300px] bg-slate-800/50 rounded-lg animate-pulse"></div>
             ) : serviceHealthError ? (
                <div className="h-[300px] flex flex-col items-center justify-center text-red-400">
                    <Icon name="alert-circle" className="w-8 h-8 mb-2" />
                    <p className="font-semibold">{serviceHealthError}</p>
                    <button onClick={fetchChartData} className="mt-4 px-3 py-1.5 text-sm text-white bg-sky-600 rounded-md">重試</button>
                </div>
             ) : (
                <EChartsReact option={serviceHealthOption} style={{ height: '300px' }} onEvents={serviceHealthEvents} />
             )}
          </div>
          <div className="glass-card rounded-xl p-6">
             <h2 className="text-xl font-bold mb-4">{pageContent.RESOURCE_GROUP_STATUS_TITLE}</h2>
             {isChartLoading ? (
                <div className="h-[300px] bg-slate-800/50 rounded-lg animate-pulse"></div>
             ) : resourceGroupError ? (
                <div className="h-[300px] flex flex-col items-center justify-center text-red-400">
                    <Icon name="alert-circle" className="w-8 h-8 mb-2" />
                    <p className="font-semibold">{resourceGroupError}</p>
                    <button onClick={fetchChartData} className="mt-4 px-3 py-1.5 text-sm text-white bg-sky-600 rounded-md">重試</button>
                </div>
             ) : (
                <EChartsReact option={resourceGroupOption} style={{ height: '300px' }} onEvents={resourceGroupEvents} />
             )}
          </div>
      </div>

    </div>
  );
};

export default SREWarRoomPage;