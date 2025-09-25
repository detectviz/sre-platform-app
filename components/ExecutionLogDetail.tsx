
import React from 'react';
import { AutomationExecution } from '../types';
import Icon from './Icon';

interface ExecutionLogDetailProps {
  execution: AutomationExecution;
}

// FIX: Make children optional to fix type error.
const InfoItem = ({ label, children }: { label: string; children?: React.ReactNode }) => (
    <div>
        <dt className="text-sm text-slate-400">{label}</dt>
        <dd className="mt-1 text-base text-white">{children}</dd>
    </div>
);

const ExecutionLogDetail: React.FC<ExecutionLogDetailProps> = ({ execution }) => {
    const getStatusPill = (status: AutomationExecution['status']) => {
        switch (status) {
            case 'success': return 'bg-green-500/20 text-green-400';
            case 'failed': return 'bg-red-500/20 text-red-400';
            case 'running': return 'bg-sky-500/20 text-sky-400';
            case 'pending': return 'bg-yellow-500/20 text-yellow-400';
        }
    };

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoItem label="狀態">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${getStatusPill(execution.status)}`}>
                        {execution.status}
                    </span>
                </InfoItem>
                <InfoItem label="腳本名稱">{execution.scriptName}</InfoItem>
                <InfoItem label="觸發來源">{execution.triggerSource} by {execution.triggeredBy}</InfoItem>
                <InfoItem label="耗時">{execution.durationMs ? `${(execution.durationMs / 1000).toFixed(2)}s` : 'N/A'}</InfoItem>
            </div>
            
            {execution.parameters && Object.keys(execution.parameters).length > 0 && (
                <div className="glass-card rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2">執行參數</h3>
                    <pre className="text-xs bg-slate-900/70 rounded-md p-3 font-mono text-sky-300 overflow-x-auto">
                        {JSON.stringify(execution.parameters, null, 2)}
                    </pre>
                </div>
            )}
            
            <div className="flex-grow flex flex-col space-y-4">
                <div className="flex-1 flex flex-col">
                    <h3 className="font-semibold text-white mb-2 flex items-center"><Icon name="align-left" className="w-4 h-4 mr-2" /> Standard Output (stdout)</h3>
                    <pre className="flex-grow bg-slate-900/70 rounded-md p-3 font-mono text-xs text-slate-300 overflow-y-auto">
                        {execution.logs.stdout || 'No standard output.'}
                    </pre>
                </div>
                 {execution.logs.stderr && (
                     <div className="flex-1 flex flex-col">
                        <h3 className="font-semibold text-red-400 mb-2 flex items-center"><Icon name="alert-triangle" className="w-4 h-4 mr-2" /> Standard Error (stderr)</h3>
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
