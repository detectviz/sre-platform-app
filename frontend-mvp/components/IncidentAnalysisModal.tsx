import React from 'react';
import Modal from './Modal';
import Icon from './Icon';
import { IncidentAnalysis, MultiIncidentAnalysis } from '../types';
import AIAnalysisDisplay from './AIAnalysisDisplay';

interface IncidentAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  report: IncidentAnalysis | MultiIncidentAnalysis | string | null;
  isLoading: boolean;
}

const IncidentAnalysisModal: React.FC<IncidentAnalysisModalProps> = ({ isOpen, onClose, title, report, isLoading }) => {
  return (
    <Modal
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      width="w-2/3"
      footer={
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">
          關閉
        </button>
      }
    >
      <AIAnalysisDisplay report={report} isLoading={isLoading} />
    </Modal>
  );
};

export default IncidentAnalysisModal;