import React from 'react';
import { MOCK_RESOURCES, MOCK_INCIDENTS } from '../../constants';
import { Resource } from '../../types';
import Icon from '../../components/Icon';
import EChartsReact from '../../components/EChartsReact';

interface ResourceDetailPageProps {
  resourceId: string;
}

const InfoItem = ({ label, children }: { label: string; children?: React.ReactNode }) => (
    <div>
        <dt className="text-sm text-slate-400">{label}</dt>
        <dd className="mt-1 text-base text-white">{children}</dd>
    </div>
);

const ResourceDetailPage: React.FC<ResourceDetailPageProps> = ({ resourceId }) => {
  const resource = MOCK_RESOURCES.find(r => r.id === resourceId);
  const relatedIncidents = MOCK_INCIDENTS.filter(inc => inc.resource === resource?.name).slice(0, 3);

  if (!resource) {
    return (
      <div className="p-6 text-center text-red-400">
        <Icon name="alert-circle" className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">資源未找到</h2>
        <p>找不到 ID 為 "{resourceId}" 的資源。</p>
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

  const generateMetricData = (base: number, variance: number, points = 30) => {
    let data = [];
    let now = new Date();
    for (let i = points - 1; i >= 0; i--) {
      let time = new Date(now.getTime() - i * 60000);
      data.push({
        name: time.toString(),
        value: [ time, Math.max(0, Math.min(100, Math.round((base + (Math.random() - 0.5) * variance) * 100) / 100)) ]
      });
    }
    return data;
  };

  const getMetricOption = (title: string, data: any[], color: string) => ({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'time', splitLine: { show: false } },
    yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%' } },
    series: [{
      name: title, type: 'line', showSymbol: false, data: data,
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

  const cpuOption = getMetricOption('CPU Usage', generateMetricData(resource.status === 'warning' ? 75 : 30, 15), '#38bdf8');
  const memoryOption = getMetricOption('Memory Usage', generateMetricData(resource.status === 'critical' ? 90 : 50, 10), '#a78bfa');
  
  return (
    <div className="flex flex-col h-full space-y-6">
       <div className="pb-4 border-b border-slate-700/50">
           <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${getStatusPill(resource.status)}`}>
                {resource.status}
            </span>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow overflow-y-auto pr-2 -mr-4">
        <div className="lg:col-span-1 space-y-6">
            <div className="glass-card rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">詳細資訊</h2>
                <dl className="space-y-4">
                    <InfoItem label="類型">{resource.type}</InfoItem>
                    <InfoItem label="提供商">{resource.provider}</InfoItem>
                    <InfoItem label="區域">{resource.region}</InfoItem>
                    <InfoItem label="擁有者">{resource.owner}</InfoItem>
                    <InfoItem label="最後簽入">{resource.lastCheckIn}</InfoItem>
                </dl>
            </div>
             <div className="glass-card rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">關聯事件</h2>
                {relatedIncidents.length > 0 ? (
                    <ul className="space-y-3">
                        {relatedIncidents.map(inc => (
                            <li key={inc.id} className="text-sm p-3 bg-slate-800/50 rounded-md border border-slate-700/50">
                                <p className="font-semibold text-white">{inc.summary}</p>
                                <p className="text-slate-400">{inc.triggeredAt} - <span className="capitalize">{inc.status}</span></p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-slate-400">此資源沒有相關的事件。</p>
                )}
            </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">即時指標</h2>
            <div className="space-y-8">
                <div>
                    <h3 className="text-base font-semibold text-slate-300 mb-2">CPU Usage</h3>
                    <div className="h-64">
                        <EChartsReact option={cpuOption} />
                    </div>
                </div>
                <div>
                    <h3 className="text-base font-semibold text-slate-300 mb-2">Memory Usage</h3>
                    <div className="h-64">
                        <EChartsReact option={memoryOption} />
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetailPage;