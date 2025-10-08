import React from 'react';
import dayjs from 'dayjs';
import { AutomationExecution } from '../types';
import Icon from './Icon';
import StatusTag from './StatusTag';
import IconButton from './IconButton';
import { useContent, useContentSection } from '../contexts/ContentContext';
import { useOptions } from '../contexts/OptionsContext';
import { formatDuration, formatRelativeTime } from '../utils/time';
import { showToast } from '../services/toast';

interface ExecutionLogDetailProps {
  execution: AutomationExecution;
}

const SummaryCard: React.FC<{ label: string; value: React.ReactNode; helper?: React.ReactNode; actions?: React.ReactNode }> = ({ label, value, helper, actions }) => (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-4 shadow-inner">
        <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                <div className="text-sm text-slate-100">{value}</div>
                {helper && <div className="text-xs text-slate-500">{helper}</div>}
            </div>
            {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
        </div>
    </div>
);

const ExecutionLogDetail: React.FC<ExecutionLogDetailProps> = ({ execution }) => {
    const { isLoading } = useContent();
    const pageContent = useContentSection('EXECUTION_LOG_DETAIL');
    const { options } = useOptions();
    const executionOptions = options?.automation_executions;

    if (isLoading || !pageContent) {
        return (
            <div className="flex h-full items-center justify-center">
                <Icon name="loader-circle" className="h-6 w-6 animate-spin" />
            </div>
        );
    }

    const statusDescriptor = executionOptions?.statuses.find(status => status.value === execution.status);
    const triggerDescriptor = executionOptions?.trigger_sources.find(source => source.value === execution.trigger_source);

    const triggerByText = pageContent.TRIGGER_BY_TEMPLATE
        ?.replace('{source}', triggerDescriptor?.label || execution.trigger_source)
        ?.replace('{by}', execution.triggered_by) || `${execution.trigger_source} by ${execution.triggered_by}`;

    const startTimeAbsolute = execution.start_time ? dayjs(execution.start_time).format('YYYY/MM/DD HH:mm:ss') : '--';
    const endTimeAbsolute = execution.end_time ? dayjs(execution.end_time).format('YYYY/MM/DD HH:mm:ss') : '--';
    const startTimeRelative = formatRelativeTime(execution.start_time);
    const endTimeRelative = execution.end_time ? formatRelativeTime(execution.end_time) : '';
    const durationLabel = formatDuration(execution.duration_ms);

    const handleCopy = (content: string, successMessage: string, emptyMessage = '沒有可複製的內容。') => {
        if (!content) {
            showToast(emptyMessage, 'error');
            return;
        }
        navigator.clipboard.writeText(content)
            .then(() => showToast(successMessage, 'success'))
            .catch(() => showToast('複製失敗，請稍後再試。', 'error'));
    };

    const parameterContent = execution.parameters && Object.keys(execution.parameters).length > 0
        ? JSON.stringify(execution.parameters, null, 2)
        : '';

    const stdoutContent = execution.logs?.stdout || '';
    const stderrContent = execution.logs?.stderr || '';
    const noStdout = pageContent.NO_STDOUT || '目前沒有輸出內容。';

    return (
        <div className="flex h-full flex-col gap-6">
            <div className="grid gap-4 lg:grid-cols-3">
                <SummaryCard
                    label={pageContent.STATUS}
                    value={(
                        <StatusTag
                            label={statusDescriptor?.label || execution.status}
                            className={statusDescriptor?.class_name || 'bg-slate-700/70 text-slate-100'}
                            tooltip={`執行狀態：${statusDescriptor?.label || execution.status}`}
                        />
                    )}
                    helper={(pageContent.SCRIPT_NAME || '腳本名稱') + `：${execution.playbook_name}`}
                />
                <SummaryCard
                    label="執行編號"
                    value={<span className="font-mono text-sm text-slate-100">{execution.id}</span>}
                    actions={(
                        <IconButton
                            icon="copy"
                            label="複製執行編號"
                            tooltip="複製執行編號"
                            onClick={() => handleCopy(execution.id, '執行編號已複製。')}
                        />
                    )}
                />
                <SummaryCard
                    label={pageContent.TRIGGER_SOURCE}
                    value={<span>{triggerByText}</span>}
                    helper={execution.target_resource_id ? `資源 ID：${execution.target_resource_id}` : undefined}
                />
                <SummaryCard
                    label="開始時間"
                    value={<span>{startTimeAbsolute}</span>}
                    helper={startTimeRelative ? `相對時間：${startTimeRelative}` : undefined}
                />
                <SummaryCard
                    label="結束時間"
                    value={<span>{endTimeAbsolute}</span>}
                    helper={endTimeRelative ? `相對時間：${endTimeRelative}` : undefined}
                />
                <SummaryCard
                    label={pageContent.DURATION}
                    value={<span>{durationLabel}</span>}
                    helper={execution.resolved_incident ? '已同步關聯事件狀態。' : undefined}
                />
            </div>

            {parameterContent && (
                <div className="rounded-xl border border-slate-700/70 bg-slate-900/50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">{pageContent.PARAMETERS}</h3>
                        <IconButton
                            icon="copy"
                            label="複製參數"
                            tooltip="複製參數 JSON"
                            onClick={() => handleCopy(parameterContent, '參數內容已複製。')}
                        />
                    </div>
                    <pre className="max-h-64 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/90 p-3 font-mono text-xs leading-5 text-sky-300">
                        {parameterContent}
                    </pre>
                </div>
            )}

            <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="flex min-h-0 flex-col rounded-xl border border-slate-700/70 bg-slate-900/60">
                    <div className="flex items-center justify-between border-b border-slate-700/60 px-4 py-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-white">
                            <Icon name="align-left" className="h-4 w-4" />
                            {pageContent.STDOUT}
                        </div>
                        <IconButton
                            icon="copy"
                            label="複製輸出"
                            tooltip="複製 stdout"
                            onClick={() => handleCopy(stdoutContent, '輸出內容已複製。', noStdout)}
                        />
                    </div>
                    <pre className="flex-1 overflow-y-auto px-4 py-3 font-mono text-xs leading-5 text-slate-200">
                        {stdoutContent || noStdout}
                    </pre>
                </div>
                <div className="flex min-h-0 flex-col rounded-xl border border-slate-700/70 bg-slate-900/60">
                    <div className="flex items-center justify-between border-b border-slate-700/60 px-4 py-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-rose-300">
                            <Icon name="alert-triangle" className="h-4 w-4" />
                            {pageContent.STDERR}
                        </div>
                        <IconButton
                            icon="copy"
                            label="複製錯誤"
                            tooltip="複製 stderr"
                            onClick={() => handleCopy(stderrContent, '錯誤輸出已複製。', '目前沒有錯誤輸出。')}
                        />
                    </div>
                    <pre className="flex-1 overflow-y-auto px-4 py-3 font-mono text-xs leading-5 text-rose-200">
                        {stderrContent || '目前沒有錯誤輸出。'}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default ExecutionLogDetail;
