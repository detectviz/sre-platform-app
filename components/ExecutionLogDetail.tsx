import React, { useState, useEffect } from 'react';
import { AutomationExecution } from '../types';
import Icon from './Icon';
import api from '../services/api';

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
    const [content, setContent] = useState<any>(null);

    useEffect(() => {
        api.get('/ui/content/execution-log-detail').then(res => setContent(res.data));
    }, []);

    const getStatusPill = (status: AutomationExecution['status']) => {
        switch (status) {
            case 'success': return 'bg-green-500/20 text-green-400';
            case 'failed': return 'bg-red-500/20 text-red-400';
            case 'running': return 'bg-sky-500/20 text-sky-400';
            case 'pending': return 'bg-yellow-500/20 text-yellow-400';
        }
    };

    const triggerByText = content?.TRIGGER_BY_TEMPLATE
        ?.replace('{source}', execution.triggerSource)
        ?.replace('{by}', execution.triggeredBy) || `${execution.triggerSource} by ${execution.triggeredBy}`;

    if (!content) {
        return (
            <div className="flex items-center justify-center h-full">
                <Icon name="loader-circle" className="w-6 h-6 animate-spin" />
            </div>
        );
    }
    
    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoItem label={content.STATUS}>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${getStatusPill(execution.status)}`}>
                        {execution.status}
                    </span>
                </InfoItem>
                <InfoItem label={content.SCRIPT_NAME}>{execution.scriptName}</InfoItem>
                <InfoItem label={content.TRIGGER_SOURCE}>{triggerByText}</InfoItem>
                <InfoItem label={content.DURATION}>{execution.durationMs ? `${(execution.durationMs / 1000).toFixed(2)}s` : 'N/A'}</InfoItem>
            </div>
            
            {execution.parameters && Object.keys(execution.parameters).length > 0 && (
                <div className="glass-card rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2">{content.PARAMETERS}</h3>
                    <pre className="text-xs bg-slate-900/70 rounded-md p-3 font-mono text-sky-300 overflow-x-auto">
                        {JSON.stringify(execution.parameters, null, 2)}
                    </pre>
                </div>
            )}
            
            <div className="flex-grow flex flex-col space-y-4">
                <div className="flex-1 flex flex-col">
                    <h3 className="font-semibold text-white mb-2 flex items-center"><Icon name="align-left" className="w-4 h-4 mr-2" /> {content.STDOUT}</h3>
                    <pre className="flex-grow bg-slate-900/70 rounded-md p-3 font-mono text-xs text-slate-300 overflow-y-auto">
                        {execution.logs.stdout || content.NO_STDOUT}
                    </pre>
                </div>
                 {execution.logs.stderr && (
                     <div className="flex-1 flex flex-col">
                        <h3 className="font-semibold text-red-400 mb-2 flex items-center"><Icon name="alert-triangle" className="w-4 h-4 mr-2" /> {content.STDERR}</h3>
                        <pre className="flex-grow bg-red-900/30 rounded-md p-3 font-mono text-xs text-red-300 overflow-y-auto">
                            {execution.logs.stderr}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExecutionLogDetail;
