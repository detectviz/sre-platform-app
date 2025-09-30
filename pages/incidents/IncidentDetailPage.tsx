
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Incident, StyleDescriptor, User, IncidentEvent, IncidentAnalysis } from '../../types';
import Icon from '../../components/Icon';
import AIAnalysisDisplay from '../../components/AIAnalysisDisplay';
import api from '../../services/api';
import AssignIncidentModal from '../../components/AssignIncidentModal';
import UserAvatar from '../../components/UserAvatar';
import { useOptions } from '../../contexts/OptionsContext';
import { showToast } from '../../services/toast';
import Modal from '../../components/Modal';

interface IncidentDetailPageProps {
  incidentId: string;
  onUpdate: () => void;
  currentUser: User | null;
}

const InfoItem = ({ label, children }: { label: string; children?: React.ReactNode }) => (
  <div>
    <dt className="text-sm text-slate-400">{label}</dt>
    <dd className="mt-1 text-base text-white">{children}</dd>
  </div>
);

const IncidentDetailPage: React.FC<IncidentDetailPageProps> = ({ incidentId, onUpdate, currentUser }) => {
  const [incident, setIncident] = useState<Incident | null>(null);
  const { options } = useOptions();
  const incidentOptions = options?.incidents;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigningIncident, setAssigningIncident] = useState<Incident | null>(null);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [deletingNote, setDeletingNote] = useState<IncidentEvent | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

  const fetchIncident = useCallback(async () => {
    if (!incidentId) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data: incidentRes } = await api.get<Incident>(`/incidents/${incidentId}`);
      setIncident(incidentRes);
    } catch (err) {
      setError(`Failed to fetch incident ${incidentId}.`);
    } finally {
      setIsLoading(false);
    }
  }, [incidentId]);

  useEffect(() => {
    fetchIncident();
  }, [fetchIncident]);

  const handleAcknowledge = async () => {
    if (!incident) return;
    await api.post(`/incidents/${incident.id}/actions`, { action: 'acknowledge' });
    showToast('事件已成功認領。', 'success');
    fetchIncident();
    onUpdate(); // Notify list page to refresh as well
  };

  const handleAddNote = async () => {
    if (!incident || !newNote.trim()) return;
    setIsAddingNote(true);
    try {
      await api.post(`/incidents/${incident.id}/actions`, { action: 'add_note', details: newNote.trim() });
      showToast('備註已成功新增。', 'success');
      setNewNote('');
      fetchIncident();
      onUpdate();
    } catch (err) {
      showToast('新增備註失敗。', 'error');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleConfirmDeleteNote = async () => {
    if (!deletingNote || !incident) return;
    try {
      await api.post(`/incidents/${incident.id}/actions`, { action: 'delete_note', details: deletingNote.timestamp });
      showToast('備註已成功刪除。', 'success');
      setDeletingNote(null);
      fetchIncident();
      onUpdate();
    } catch (err) {
      showToast('刪除備註失敗。', 'error');
      setDeletingNote(null);
    }
  };

  const handleConfirmAssign = async (assigneeName: string) => {
    if (!assigningIncident) return;
    await api.post(`/incidents/${assigningIncident.id}/actions`, { action: 'assign', assigneeName });
    showToast('事件已成功指派。', 'success');
    setAssigningIncident(null);
    fetchIncident();
    onUpdate();
  };

  const handleRunAnalysis = async () => {
    if (!incident) return;
    setIsAnalysisLoading(true);
    try {
      const { data } = await api.post<IncidentAnalysis>('/ai/incidents/analyze', {
        incident_ids: [incident.id],
      });
      setIncident(prev => prev ? { ...prev, aiAnalysis: data } : null);
    } catch (err) {
      showToast('無法生成 AI 分析報告。', 'error');
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  const getStyle = (descriptors: StyleDescriptor[] | undefined, value: string | undefined): string => {
    if (!descriptors || !value) return 'bg-slate-500/20 text-slate-400';
    return descriptors.find(d => d.value === value)?.className || 'bg-slate-500/20 text-slate-400';
  };

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
        <h2 className="text-2xl font-bold">事故載入失敗</h2>
        <p>{error || `找不到 ID 為 "${incidentId}" 的事故。`}</p>
      </div>
    );
  }

  const getTimelineIconAndColor = (action: string) => {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('created')) return { icon: 'plus-circle', color: 'bg-sky-500 ring-sky-500/30' };
    if (lowerAction.includes('acknowledged')) return { icon: 'user-check', color: 'bg-green-500 ring-green-500/30' };
    if (lowerAction.includes('resolved')) return { icon: 'check-circle', color: 'bg-green-500 ring-green-500/30' };
    if (lowerAction.includes('re-assigned')) return { icon: 'repeat', color: 'bg-blue-500 ring-blue-500/30' };
    if (lowerAction.includes('silenced')) return { icon: 'bell-off', color: 'bg-slate-600 ring-slate-700/50' };
    if (lowerAction.includes('notification')) return { icon: 'bell', color: 'bg-yellow-500 ring-yellow-500/30' };
    if (lowerAction.includes('note')) return { icon: 'message-square', color: 'bg-slate-600 ring-slate-700/50' };
    if (lowerAction.includes('executed')) return { icon: 'bot', color: 'bg-purple-500 ring-purple-500/30' };
    if (lowerAction.includes('analysis')) return { icon: 'brain-circuit', color: 'bg-purple-500 ring-purple-500/30' };
    return { icon: 'info', color: 'bg-slate-700 ring-slate-800' };
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="pb-4 mb-4 border-b border-slate-700/50 shrink-0">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
            <InfoItem label="狀態">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${getStyle(incidentOptions?.statuses, incident.status)}`}>
                {incident.status}
              </span>
            </InfoItem>
            <InfoItem label="嚴重性">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getStyle(incidentOptions?.severities, incident.severity)}`}>
                {incident.severity}
              </span>
            </InfoItem>
            <InfoItem label="影響範圍">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getStyle(incidentOptions?.impacts, incident.impact)}`}>
                {incident.impact}
              </span>
            </InfoItem>
            <InfoItem label="指派給">
              {incident.status === 'New' || !incident.assignee ? (
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">無</span>
                  <button onClick={handleAcknowledge} className="px-3 py-1 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-full transition-colors flex items-center shadow-sm">
                    <Icon name="user-check" className="w-4 h-4 mr-2" />
                    認領事件
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-slate-200 font-medium">{incident.assignee}</span>
                  <button onClick={() => setAssigningIncident(incident)} className="p-1.5 rounded-full bg-slate-700/40 hover:bg-sky-600/25 border border-slate-600/40 hover:border-sky-500/60 text-slate-200 hover:text-sky-200 transition-all duration-200 shadow-sm flex items-center justify-center" title="轉派">
                    <Icon name="repeat" className="w-3.5 h-3.5 opacity-60 hover:opacity-100 text-slate-400 hover:text-sky-400 transition-all duration-200" />
                  </button>
                </div>
              )}
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
                <InfoItem label="資源">
                  <Link to={`/resources/${incident.resourceId}`} className="text-sky-400 hover:underline">
                    {incident.resource}
                  </Link>
                </InfoItem>
                <InfoItem label="影響範圍">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStyle(incidentOptions?.impacts, incident.impact)}`}>
                    {incident.impact}
                  </span>
                </InfoItem>
                <InfoItem label="規則">
                  <Link to={`/incidents/rules`} className="text-sky-400 hover:underline">
                    {incident.rule}
                  </Link>
                </InfoItem>
                <InfoItem label="發生時間">{incident.occurredAt}</InfoItem>
              </dl>
            </div>
          </div>

          {/* Right Column: AI Analysis & Timeline */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  <Icon name="brain-circuit" className="w-6 h-6 mr-2 text-purple-400" />
                  AI 自動分析
                </h2>
                {incident.aiAnalysis && !isAnalysisLoading && (
                  <button onClick={handleRunAnalysis} className="p-2 rounded-full hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center text-slate-300">
                    <Icon name="refresh-cw" className="w-4 h-4 mr-2" />
                    重新分析
                  </button>
                )}
              </div>
              {isAnalysisLoading ? (
                <AIAnalysisDisplay report={null} isLoading={true} />
              ) : incident.aiAnalysis ? (
                <AIAnalysisDisplay report={incident.aiAnalysis} isLoading={false} />
              ) : (
                <div className="text-center text-slate-400 py-4">
                  <Icon name="brain-circuit" className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                  <p className="font-semibold text-slate-300">此事件尚無 AI 分析報告</p>
                  <p className="text-sm mt-2 mb-4">點擊下方按鈕以生成根本原因與建議步驟。</p>
                  <button onClick={handleRunAnalysis} className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md flex items-center justify-center mx-auto">
                    <Icon name="sparkles" className="w-4 h-4 mr-2" />
                    生成 AI 分析
                  </button>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">時間軸</h2>
              <ol className="relative border-l border-slate-700 ml-4">
                {incident.history.map((event, index) => {
                  const { icon, color } = getTimelineIconAndColor(event.action);
                  const isUserNote = event.action.toLowerCase().includes('note');
                  const isCurrentUserNote = isUserNote && event.user === currentUser?.name;

                  return (
                    <li key={index} className="mb-8 ml-8 group">
                      <span className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 ring-4 ring-slate-900 ${color}`}>
                        <Icon name={icon} className="w-4 h-4 text-white" />
                      </span>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-white">{event.action}</p>
                        <time className="text-xs font-normal text-slate-500">{event.timestamp}</time>
                      </div>
                      <p className="text-sm font-normal text-slate-400">by <span className="font-medium text-slate-300">{event.user}</span></p>
                      {event.details && (
                        <div className="relative">
                          <p className="mt-2 text-sm p-3 bg-slate-900/50 rounded-md border border-slate-700 pr-10">{event.details}</p>
                          {isCurrentUserNote && (
                            <button
                              onClick={() => setDeletingNote(event)}
                              title="刪除備註"
                              className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 rounded-full text-slate-500 hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Icon name="trash-2" className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
              <div className="ml-12 mt-4 space-y-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="新增備註..."
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm"
                />
                <button
                  onClick={handleAddNote}
                  disabled={isAddingNote || !newNote.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md flex items-center disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                  {isAddingNote ? <Icon name="loader-circle" className="w-4 h-4 mr-2 animate-spin" /> : <Icon name="plus" className="w-4 h-4 mr-2" />}
                  {isAddingNote ? '新增中...' : '新增備註'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AssignIncidentModal
        isOpen={!!assigningIncident}
        onClose={() => setAssigningIncident(null)}
        onAssign={handleConfirmAssign}
        incident={assigningIncident}
      />
      <Modal
        isOpen={!!deletingNote}
        onClose={() => setDeletingNote(null)}
        title="確認刪除備註"
        width="w-1/3"
        footer={
          <>
            <button onClick={() => setDeletingNote(null)} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">
              取消
            </button>
            <button onClick={handleConfirmDeleteNote} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md">
              確認刪除
            </button>
          </>
        }
      >
        <p>您確定要刪除這條備註嗎？</p>
        <p className="mt-2 text-slate-400">此操作無法復原。</p>
      </Modal>
    </>
  );
};

export default IncidentDetailPage;
