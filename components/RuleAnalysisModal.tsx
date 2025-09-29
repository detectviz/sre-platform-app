import React from 'react';
import Modal from './Modal';
import RuleAnalysisDisplay from './RuleAnalysisDisplay';
import { RuleAnalysisReport } from '../types';

interface RuleAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    report: RuleAnalysisReport | null;
    isLoading: boolean;
    error: string | null;
}

const RuleAnalysisModal: React.FC<RuleAnalysisModalProps> = ({ isOpen, onClose, title, report, isLoading, error }) => {
    return (
        <Modal
            title={title}
            isOpen={isOpen}
            onClose={onClose}
            width="w-2/3"
            footer={
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
                >
                    關閉
                </button>
            }
        >
            <RuleAnalysisDisplay report={report} isLoading={isLoading} error={error} />
        </Modal>
    );
};

export default RuleAnalysisModal;
