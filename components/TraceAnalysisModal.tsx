import React from 'react';
import Modal from './Modal';
import Icon from './Icon';
import { TraceAnalysis, Bottleneck } from '../types';

interface TraceAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: TraceAnalysis | null;
  isLoading: boolean;
}

const Section: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div>
        <h3 className="font-bold text-lg text-purple-400 mb-2 flex items-center">
            <Icon name={icon} className="w-5 h-5 mr-2" />
            {title}
        </h3>
        <div className="pl-7 text-sm">
            {children}
        </div>
    </div>
);

const TraceAnalysisModal: React.FC<TraceAnalysisModalProps> = ({ isOpen, onClose, report, isLoading }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Icon name="loader-circle" className="w-12 h-12 text-purple-400 animate-spin" />
          <p className="mt-4 text-slate-300">正在分析追蹤鏈路，請稍候...</p>
        </div>
      );
    }

    if (!report) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <Icon name="alert-circle" className="w-12 h-12 mb-4" />
          <p>無法載入分析報告。</p>
        </div>
      );
    }

    return (
        <div className="space-y-6 text-slate-300">
            <Section title="分析摘要" icon="file-text">
                <p>{report.summary}</p>
            </Section>
            <Section title="偵測到的瓶頸" icon="filter">
                <div className="space-y-3">
                    {report.bottlenecks.map((bottleneck, i) => (
                        <div key={i} className="p-3 bg-slate-800/50 rounded-lg border-l-4 border-red-500">
                           <div className="flex justify-between items-center font-mono text-xs">
                               <span className="font-semibold text-white">{bottleneck.service_name} / {bottleneck.span_name}</span>
                               <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full">{bottleneck.duration_percent}% of total time</span>
                           </div>
                           <p className="mt-1 text-slate-400">{bottleneck.description}</p>
                        </div>
                    ))}
                </div>
            </Section>
            <Section title="建議步驟" icon="wrench">
                <ul className="list-disc list-inside space-y-2">
                    {report.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                </ul>
            </Section>
        </div>
    );
  };

  return (
    <Modal
      title="AI 鏈路追蹤瓶頸分析"
      isOpen={isOpen}
      onClose={onClose}
      width="w-2/3"
      footer={
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">
          關閉
        </button>
      }
    >
      {renderContent()}
    </Modal>
  );
};

export default TraceAnalysisModal;