import React from 'react';
import Modal from './Modal';
import Icon from './Icon';
import { LogAnalysis } from '../types';
import LogLevelPill from './LogLevelPill';

interface LogAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: LogAnalysis | null;
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

const LogAnalysisModal: React.FC<LogAnalysisModalProps> = ({ isOpen, onClose, report, isLoading }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Icon name="loader-circle" className="w-12 h-12 text-purple-400 animate-spin" />
          <p className="mt-4 text-slate-300">正在分析日誌，請稍候...</p>
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
            <Section title="偵測到的模式" icon="search-code">
                <div className="space-y-2">
                    {report.patterns.map((pattern, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-md">
                            <div className="flex items-center">
                                <LogLevelPill level={pattern.level} />
                                <p className="ml-3 font-mono text-xs">{pattern.description}</p>
                            </div>
                            <span className="font-semibold text-white">{pattern.count} 次</span>
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
      title="AI 日誌總結報告"
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

export default LogAnalysisModal;