import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import { Incident } from '../types';
import { useOptions } from '../contexts/OptionsContext';

interface QuickSilenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (incidentId: string, durationHours: number) => void;
  incident: Incident | null;
}

const QuickSilenceModal: React.FC<QuickSilenceModalProps> = ({ isOpen, onClose, onSave, incident }) => {
  const [duration, setDuration] = useState(1);
  const { options, isLoading, error } = useOptions();
  const incidentOptions = options?.incidents;

  useEffect(() => {
    if (isOpen && incidentOptions?.quickSilenceDurations?.length) {
      // Set initial duration to the first available option
      setDuration(incidentOptions.quickSilenceDurations[0].value);
    }
  }, [isOpen, incidentOptions]);

  const handleSave = () => {
    if (!incident) {
      return;
    }
    onSave(incident.id, duration);
  };

  const getEndTime = () => {
    const endTime = new Date(Date.now() + duration * 3600 * 1000);
    return endTime.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const modalTitle = incident ? `為事件 ${incident.id} 建立靜音` : '建立靜音';

  return (
    <Modal
      title={modalTitle}
      isOpen={isOpen}
      onClose={onClose}
      width="w-1/3"
      footer={
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">取消</button>
          <button onClick={handleSave} disabled={!incident || isLoading || !!error} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">建立靜音</button>
        </div>
      }
    >
      {incident ? (
        <div className="space-y-4">
          <div>
              <p className="text-sm text-slate-400">摘要</p>
              <p className="font-semibold">{incident.summary}</p>
          </div>
          <div>
              <p className="text-sm text-slate-400">資源</p>
              <p className="font-semibold">{incident.resource}</p>
          </div>
          <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">靜音持續時間</label>
              {isLoading ? (
                  <div className="animate-pulse grid grid-cols-3 gap-2">
                      {[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-slate-700 rounded-md"></div>)}
                  </div>
              ) : error ? (
                  <div className="p-3 text-center text-red-400 bg-red-900/30 rounded-md">{error}</div>
              ) : (
                  <div className="grid grid-cols-3 gap-2">
                      {incidentOptions?.quickSilenceDurations.map(d => (
                          <button
                              key={d.value}
                              onClick={() => setDuration(d.value)}
                              className={`px-3 py-2 text-sm rounded-md transition-colors ${duration === d.value ? 'bg-sky-600 text-white font-semibold' : 'bg-slate-700/50 hover:bg-slate-700'}`}
                          >
                              {d.label}
                          </button>
                      ))}
                  </div>
              )}
          </div>
          <div className="p-3 bg-slate-800/50 rounded-md text-center">
              <p className="text-sm text-slate-400">靜音將於 <span className="font-semibold text-sky-400">{getEndTime()}</span> 解除</p>
          </div>
          <div className="text-xs text-slate-500 text-center pt-2">
              <p>您可以在「靜音規則」頁面檢視、延長或手動管理此靜音。</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
          <Icon name="bell-off" className="w-6 h-6" />
          <p className="font-medium">尚未選擇要靜音的事件。</p>
          <p className="text-sm text-slate-500">請先於事件列表中選取事件，再開啟快速靜音功能。</p>
        </div>
      )}
    </Modal>
  );
};

export default QuickSilenceModal;