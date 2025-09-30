
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
        <div className="pb-6 mb-6 border-b border-slate-700/50 shrink-0">
          <dl className="grid gap-6 auto-cols-fr" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
            <InfoItem label="狀態">
              <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full capitalize ${getStyle(incidentOptions?.statuses, incident.status)}`}>
                {incident.status}
              </span>
            </InfoItem>
            <InfoItem label="嚴重性">
              <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full border ${getStyle(incidentOptions?.severities, incident.severity)}`}>
                {incident.severity}
              </span>
            </InfoItem>
            <InfoItem label="影響範圍">
              <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full border ${getStyle(incidentOptions?.impacts, incident.impact)}`}>
                {incident.impact}
              </span>
            </InfoItem>
            <InfoItem label="資源">
              <Link to={`/resources/${incident.resourceId}`} className="text-sky-400 hover:text-sky-300 hover:underline transition-colors truncate block">
                {incident.resource}
              </Link>
            </InfoItem>
            <InfoItem label="規則">
              <Link to={`/incidents/rules`} className="text-sky-400 hover:text-sky-300 hover:underline transition-colors truncate block">
                {incident.rule}
              </Link>
            </InfoItem>
            <InfoItem label="發生時間">
              <span className="text-slate-200">{incident.occurredAt}</span>
            </InfoItem>
            <InfoItem label="指派給">
              {incident.status === 'New' || !incident.assignee ? (
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-slate-400">無</span>
                  <button onClick={handleAcknowledge} className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-full transition-colors flex items-center shadow-sm">
                    <Icon name="user-check" className="w-3.5 h-3.5 mr-1.5" />
                    認領事件
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-slate-200 font-medium truncate">{incident.assignee}</span>
                  <button onClick={() => setAssigningIncident(incident)} className="p-1.5 rounded-full bg-slate-700/40 hover:bg-sky-600/25 border border-slate-600/40 hover:border-sky-500/60 text-slate-200 hover:text-sky-200 transition-all duration-200 shadow-sm flex items-center justify-center shrink-0" title="轉派">
                    <Icon name="repeat" className="w-3.5 h-3.5 opacity-60 hover:opacity-100 text-slate-400 hover:text-sky-400 transition-all duration-200" />
                  </button>
                </div>
              )}
            </InfoItem>
          </dl>
        </div>

        {/* Main Content */}
        <div className="space-y-6 flex-grow overflow-y-auto pr-2 -mr-4">
            <div className="glass-card rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center">
                  <Icon name="brain-circuit" className="w-5 h-5 mr-2 text-purple-400" />
                  AI 自動分析
                </h2>
                {incident.aiAnalysis && !isAnalysisLoading && (
                  <button onClick={handleRunAnalysis} className="px-3 py-1.5 text-xs rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-slate-300 hover:text-white transition-colors border border-slate-600/50">
                    <Icon name="refresh-cw" className="w-3.5 h-3.5 mr-1.5" />
                    重新分析
                  </button>
                )}
              </div>
              {isAnalysisLoading ? (
                <AIAnalysisDisplay report={null} isLoading={true} />
              ) : incident.aiAnalysis ? (
                <AIAnalysisDisplay report={incident.aiAnalysis} isLoading={false} />
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 mb-4">
                    <Icon name="brain-circuit" className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="font-semibold text-white text-lg mb-2">此事件尚無 AI 分析報告</p>
                  <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">點擊下方按鈕以生成根本原因與建議步驟。</p>
                  <button onClick={handleRunAnalysis} className="px-5 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20 transition-all hover:shadow-purple-500/30">
                    <Icon name="sparkles" className="w-4 h-4 mr-2" />
                    生成 AI 分析
                  </button>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <Icon name="clock" className="w-5 h-5 mr-2 text-slate-400" />
                時間軸
              </h2>
              <ol className="relative border-l-2 border-slate-700 ml-4">
                {incident.history.map((event, index) => {
                  const { icon, color } = getTimelineIconAndColor(event.action);
                  const isUserNote = event.action.toLowerCase().includes('note');
                  const isCurrentUserNote = isUserNote && event.user === currentUser?.name;

                  return (
                    <li key={index} className="mb-10 ml-8 group">
                      <span className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-[17px] ring-4 ring-slate-900 ${color}`}>
                        <Icon name={icon} className="w-4 h-4 text-white" />
                      </span>
                      <div className="flex items-center justify-between mb-2 gap-4">
                        <p className="text-sm font-semibold text-white">{event.action}</p>
                        <time className="text-xs font-normal text-slate-500 shrink-0">{event.timestamp}</time>
                      </div>
                      <p className="text-sm font-normal text-slate-400 mb-2">by <span className="font-medium text-slate-300">{event.user}</span></p>
                      {event.details && (
                        <div className="relative">
                          <p className="text-sm p-3 bg-slate-900/50 rounded-md border border-slate-700 pr-10 leading-relaxed">{event.details}</p>
                          {isCurrentUserNote && (
                            <button
                              onClick={() => setDeletingNote(event)}
                              title="刪除備註"
                              className="absolute top-3 right-2 p-1.5 rounded-full text-slate-500 hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
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
              <div className="ml-12 mt-6 space-y-3">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="新增備註..."
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                />
                <button
                  onClick={handleAddNote}
                  disabled={isAddingNote || !newNote.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md flex items-center disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                  {isAddingNote ? <Icon name="loader-circle" className="w-4 h-4 mr-2 animate-spin" /> : <Icon name="plus" className="w-4 h-4 mr-2" />}
                  {isAddingNote ? '新增中...' : '新增備註'}
                </button>
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
