import React, { useState, useEffect } from 'react';
import { Incident } from '../../types';
import Icon from '../../components/Icon';
import AIAnalysisDisplay from '../../components/AIAnalysisDisplay';
import api from '../../services/api';

interface IncidentDetailPageProps {
  incidentId: string;
}

const IncidentDetailPage: React.FC<IncidentDetailPageProps> = ({ incidentId }) => {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIncident = async () => {
      if (!incidentId) return;
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await api.get<Incident>(`/events/${incidentId}`);
        setIncident(data);
      } catch (err) {
        setError(`Failed to fetch incident ${incidentId}.`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchIncident();
  }, [incidentId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Icon name="loader-circle" className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="p-6 text-center text-red-400">
        <Icon name="alert-circle" className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">事件載入失敗</h2>
        <p>{error || `找不到 ID 為 "${incidentId}" 的事件。`}</p>
      </div>
    );
  }

  const getStatusPill = (status: Incident['status']) => {
      switch (status) {
          case 'new': return 'bg-orange-500/20 text-orange-400';
          case 'acknowledged': return 'bg-sky-500/20 text-sky-400';
          case 'resolved': return 'bg-green-500/20 text-green-400';
          case 'silenced': return 'bg-slate-500/20 text-slate-400';
      }
  };
  
  const getSeverityPill = (severity: Incident['severity']) => {
      switch (severity) {
          case 'critical': return 'border-red-500 text-red-500';
          case 'warning': return 'border-orange-500 text-orange-500';
          case 'info': return 'border-sky-500 text-sky-500';
      }
  };

  const getServiceImpactPill = (serviceImpact: Incident['serviceImpact']) => {
    switch (serviceImpact) {
        case 'High': return 'border-red-500 text-red-500';
        case 'Medium': return 'border-orange-500 text-orange-500';
        case 'Low': return 'border-sky-500 text-sky-500';
    }
  };

  const getPriorityPill = (priority?: Incident['priority']) => {
    if (!priority) return 'border-slate-500 text-slate-500';
    switch (priority) {
        case 'P0': return 'bg-purple-500/20 border border-purple-400 text-purple-300';
        case 'P1': return 'bg-red-500/20 border border-red-400 text-red-300';
        case 'P2': return 'bg-orange-500/20 border border-orange-400 text-orange-300';
        case 'P3': return 'bg-yellow-500/20 border border-yellow-400 text-yellow-300';
    }
  };

  const getTimelineIconAndColor = (action: string) => {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('created')) return { icon: 'plus-circle', color: 'bg-sky-500 ring-sky-500/30' };
    if (lowerAction.includes('acknowledged')) return { icon: 'user-check', color: 'bg-green-500 ring-green-500/30' };
    if (lowerAction.includes('resolved')) return { icon: 'check-circle', color: 'bg-green-500 ring-green-500/30' };
    if (lowerAction.includes('notification')) return { icon: 'bell', color: 'bg-yellow-500 ring-yellow-500/30' };
    if (lowerAction.includes('note')) return { icon: 'message-square', color: 'bg-slate-600 ring-slate-700/50' };
    if (lowerAction.includes('executed')) return { icon: 'bot', color: 'bg-purple-500 ring-purple-500/30' };
    if (lowerAction.includes('analysis')) return { icon: 'brain-circuit', color: 'bg-purple-500 ring-purple-500/30' };
    return { icon: 'info', color: 'bg-slate-700 ring-slate-800' };
  }
  
  const InfoItem = ({ label, children }: { label: string; children?: React.ReactNode }) => (
    <div>
        <dt className="text-sm text-slate-400">{label}</dt>
        <dd className="mt-1 text-base text-white">{children}</dd>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="pb-4 mb-4 border-b border-slate-700/50 shrink-0">
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
            <InfoItem label="狀態">
                 <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${getStatusPill(incident.status)}`}>
                    {incident.status}
                </span>
            </InfoItem>
            <InfoItem label="嚴重性">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getSeverityPill(incident.severity)}`}>
                    {incident.severity}
                </span>
            </InfoItem>
             <InfoItem label="優先級">
                 <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getPriorityPill(incident.priority)}`}>
                    {incident.priority || 'N/A'}
                </span>
            </InfoItem>
             <InfoItem label="指派給">
                {incident.assignee}
            </InfoItem>
        </dl>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 flex-grow overflow-y-auto pr-2 -mr-4">
        {/* Left Column: Details */}
        <div className="lg:col-span-1 space-y-6">
            <div className="glass-card rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">詳細資訊</h2>
                <dl className="space-y-4">
                    <InfoItem label="資源">{incident.resource}</InfoItem>
                    <InfoItem label="服務影響">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getServiceImpactPill(incident.serviceImpact)}`}>
                            {incident.serviceImpact}
                        </span>
                    </InfoItem>
                    <InfoItem label="規則">{incident.rule}</InfoItem>
                    <InfoItem label="觸發時間">{incident.triggeredAt}</InfoItem>
                </dl>
            </div>
        </div>

        {/* Right Column: AI Analysis & Timeline */}
        <div className="lg:col-span-2">
            <div className="glass-card rounded-xl p-6 mb-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                    <Icon name="brain-circuit" className="w-6 h-6 mr-2 text-purple-400" />
                    AI 自動分析
                </h2>
                {incident.aiAnalysis ? (
                    <AIAnalysisDisplay report={incident.aiAnalysis} isLoading={false} />
                ) : (
                    <div className="text-center text-slate-400 py-4">
                        <p>此事件尚無 AI 分析報告。</p>
                        <p className="text-sm mt-1">您可以在頂部操作列點擊「AI 分析」來產生報告。</p>
                    </div>
                )}
            </div>

          <div>
            <h2 className="text-xl font-bold mb-4">時間軸</h2>
            <ol className="relative border-l border-slate-700 ml-4">                  
              {incident.history.map((event, index) => {
                  const { icon, color } = getTimelineIconAndColor(event.action);
                  return (
                      <li key={index} className="mb-8 ml-8">            
                          <span className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 ring-4 ring-slate-900 ${color}`}>
                              <Icon name={icon} className="w-4 h-4 text-white" />
                          </span>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold text-white">{event.action}</p>
                            <time className="text-xs font-normal text-slate-500">{event.timestamp}</time>
                          </div>
                          <p className="text-sm font-normal text-slate-400">by <span className="font-medium text-slate-300">{event.user}</span></p>
                          {event.details && <p className="mt-2 text-sm p-3 bg-slate-900/50 rounded-md border border-slate-700">{event.details}</p>}
                      </li>
                  );
              })}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetailPage;
