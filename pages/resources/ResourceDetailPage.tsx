import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Resource, Incident } from '../../types';
import Icon from '../../components/Icon';
import EChartsReact from '../../components/EChartsReact';
import api from '../../services/api';

interface ResourceDetailPageProps {
  resourceId: string;
}

interface MetricsData {
    cpu: [string, number][];
    memory: [string, number][];
}

const InfoItem = ({ label, children }: { label: string; children?: React.ReactNode }) => (
    <div>
        <dt className="text-sm text-slate-400">{label}</dt>
        <dd className="mt-1 text-base text-white">{children}</dd>
    </div>
);

const ResourceDetailPage: React.FC<ResourceDetailPageProps> = ({ resourceId }) => {
  const [resource, setResource] = useState<Resource | null>(null);
  const [relatedIncidents, setRelatedIncidents] = useState<Incident[]>([]);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResourceDetails = useCallback(async () => {
    if (!resourceId) return;
    setIsLoading(true);
    setError(null);
    try {
      const resourceData = (await api.get<Resource>(`/resources/${resourceId}`)).data;

      const [incidentsRes, metricsRes] = await Promise.all([
          api.get<{ items: Incident[] }>('/incidents', { params: { resource_name: resourceData.name, page_size: 3 } }),
          api.get<MetricsData>(`/resources/${resourceId}/metrics`)
      ]);
      
      setResource(resourceData);
      setRelatedIncidents(incidentsRes.data.items);
      setMetrics(metricsRes.data);

    } catch (err) {
      setError(`無法獲取資源 ${resourceId} 的詳細資訊。`);
    } finally {
      setIsLoading(false);
    }
  }, [resourceId]);

  useEffect(() => {
    fetchResourceDetails();
  }, [fetchResourceDetails]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Icon name="loader-circle" className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="p-6 text-center text-red-400">
        <Icon name="alert-circle" className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">資源載入失敗</h2>
        <p>{error || `找不到 ID 為 "${resourceId}" 的資源。`}</p>
      </div>
    );
  }

  const getStatusPill = (status: Resource['status']) => {
    switch (status) {
        case 'healthy': return 'bg-green-500/20 text-green-400';
        case 'warning': return 'bg-yellow-500/20 text-yellow-400';
        case 'critical': return 'bg-red-500/20 text-red-400';
        case 'offline': return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getMetricOption = (title: string, data: [string, number][] | undefined, color: string) => ({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'time', splitLine: { show: false } },
    yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%' } },
    series: [{
      name: title, type: 'line', showSymbol: false, data: data || [],
      lineStyle: { color: color },
      areaStyle: {
        color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [{
          offset: 0, color: `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.3)`
        }, {
          offset: 1, color: 'rgba(0,0,0,0)'
        }])
      }
    }],
    grid: { left: '10%', right: '5%', top: '15%', bottom: '15%' },
  });

  const cpuOption = getMetricOption('CPU Usage', metrics?.cpu, '#38bdf8');
  const memoryOption = getMetricOption('Memory Usage', metrics?.memory, '#a78bfa');
  
  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 glass-card rounded-xl p-4">
        <InfoItem label="狀態">
          <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${getStatusPill(resource.status)}`}>{resource.status}</span>
        </InfoItem>
        <InfoItem label="類型">{resource.type}</InfoItem>
        <InfoItem label="提供商 / 區域">{resource.provider} / {resource.region}</InfoItem>
        <InfoItem label="擁有者">{resource.owner}</InfoItem>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-4">
          <h3 className="font-semibold text-white mb-2">CPU Usage (last 30min)</h3>
          <div className="h-48"><EChartsReact option={cpuOption} /></div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <h3 className="font-semibold text-white mb-2">Memory Usage (last 30min)</h3>
          <div className="h-48"><EChartsReact option={memoryOption} /></div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-2">相關事件 (最近 3 筆)</h3>
        <div className="space-y-2">
          {relatedIncidents.length > 0 ? (
            relatedIncidents.map(inc => (
              <Link to={`/incidents/${inc.id}`} key={inc.id}>
                <div className="glass-card rounded-lg p-3 flex justify-between items-center hover:bg-slate-700/50 transition-colors">
                  <div>
                    <p className="font-semibold text-white">{inc.summary}</p>
                    <p className="text-xs text-slate-400">{inc.triggeredAt}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${inc.status === 'new' ? 'text-orange-400' : 'text-slate-400'}`}>{inc.status}</span>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-slate-400">沒有相關的事件。</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceDetailPage;