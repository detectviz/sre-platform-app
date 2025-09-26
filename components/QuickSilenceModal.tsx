import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import { Incident } from '../types';
import api from '../services/api';

interface QuickSilenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (incidentId: string, durationHours: number) => void;
  incident: Incident | null;
}

const QuickSilenceModal: React.FC<QuickSilenceModalProps> = ({ isOpen, onClose, onSave, incident }) => {
  const [duration, setDuration] = useState(1);
  const [durations, setDurations] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      api.get<{ quickSilenceDurations: number[] }>('/incidents/options')
        .then(res => {
          const fetchedDurations = res.data.quickSilenceDurations;
          setDurations(fetchedDurations);
          if (!fetchedDurations.includes(duration)) {
            setDuration(fetchedDurations[0] || 1);
          }
        })
        .catch(err => {
          console.error("Failed to fetch silence durations, using fallback.", err);
          setDurations([1, 2, 4, 8, 12, 24]); // Fallback to static values on error
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!incident) return null;

  const handleSave = () => {
    onSave(incident.id, duration);
  };

  const getEndTime = () => {
    const endTime = new Date(Date.now() + duration * 3600 * 1000);
    return endTime.toLocaleString();
  };

  return (
    <Modal
      title={`為事件 ${incident.id} 建立靜音`}
      isOpen={isOpen}
      onClose={onClose}
      width="w-1/3"
      footer={
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">取消</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors">建立靜音</button>
        </div>
      }
    >
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
            ) : (
                <div className="grid grid-cols-3 gap-2">
                    {durations.map(d => (
                        <button 
                            key={d} 
                            onClick={() => setDuration(d)}
                            className={`px-3 py-2 text-sm rounded-md transition-colors ${duration === d ? 'bg-sky-600 text-white font-semibold' : 'bg-slate-700/50 hover:bg-slate-700'}`}
                        >
                            {d} 小時
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
    </Modal>
  );
};

export default QuickSilenceModal;