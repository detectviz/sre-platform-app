import React from 'react';
import { AutomationExecution } from '../types';
import Icon from './Icon';
import { useContent, useContentSection } from '../contexts/ContentContext';

interface ExecutionLogDetailProps {
  execution: AutomationExecution;
}

const InfoItem: React.FC<{ label: string; children?: React.ReactNode }> = ({ label, children }) => (
    <div>
        <dt className="text-sm text-slate-400">{label}</dt>
        <dd className="mt-1 text-base text-white">{children}</dd>
    </div>
);

const ExecutionLogDetail: React.FC<ExecutionLogDetailProps> = ({ execution }) => {
    const { isLoading } = useContent();
    const pageContent = useContentSection('EXECUTION_LOG_DETAIL');

    const getStatusPill = (status: AutomationExecution['status']) => {
        switch (status) {
            case 'success': return 'bg-green-500/20 text-green-400';
            case 'failed': return 'bg-red-500/20 text-red-400';
            case 'running': return 'bg-sky-500/20 text-sky-400';
            case 'pending': return 'bg-yellow-500/20 text-yellow-400';
        }
    };

    if (isLoading || !pageContent) {
        return (
            <div className="flex items-center justify-center h-full">
                <Icon name="loader-circle" className="w-6 h-6 animate-spin" />
            </div>
        );
    }

    const triggerByText = pageContent.TRIGGER_BY_TEMPLATE
        ?.replace('{source}', execution.triggerSource)
        ?.replace('{by}', execution.triggeredBy) || `${execution.triggerSource} by ${execution.triggeredBy}`;
    
    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoItem label={pageContent.STATUS}>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${getStatusPill(execution.status)}`}>
                        {execution.status}
                    </span>
                </InfoItem>
                <InfoItem label={pageContent.SCRIPT_NAME}>{execution.scriptName}</InfoItem>
                <InfoItem label={pageContent.TRIGGER_SOURCE}>{triggerByText}</InfoItem>
                <InfoItem label={pageContent.DURATION}>{execution.durationMs ? `${(execution.durationMs / 1000).toFixed(2)}s` : 'N/A'}</InfoItem>
            </div>
            
            {execution.parameters && Object.keys(execution.parameters).length > 0 && (
                <div className="glass-card rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2">{pageContent.PARAMETERS}</h3>
                    <pre className="text-xs bg-slate-900/70 rounded-md p-3 font-mono text-sky-300 overflow-x-auto">
                        {JSON.stringify(execution.parameters, null, 2)}
                    </pre>
                </div>
            )}
            
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="flex flex-col min-h-0">
                    <h3 className="font-semibold text-white mb-2 flex items-center"><Icon name="align-left" className="w-4 h-4 mr-2 shrink-0" /> {pageContent.STDOUT}</h3>
                    <pre className="flex-grow bg-slate-900/70 rounded-md p-3 font-mono text-xs text-slate-300 overflow-y-auto min-h-[200px]">
                        {execution.logs.stdout || pageContent.NO_STDOUT}
                    </pre>
                </div>
                 {execution.logs.stderr && (
                     <div className="flex flex-col min-h-0">
                        <h3 className="font-semibold text-red-400 mb-2 flex items-center"><Icon name="alert-triangle" className="w-4 h-4 mr-2 shrink-0" /> {pageContent.STDERR}</h3>
                        <pre className="flex-grow bg-red-900/30 rounded-md p-3 font-mono text-xs text-red-300 overflow-y-auto min-h-[200px]">
                            {execution.logs.stderr}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExecutionLogDetail;
