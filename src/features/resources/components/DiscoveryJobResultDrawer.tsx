import React, { useState, useEffect, useCallback } from 'react';
import { DiscoveryJob, DiscoveredResource, KeyValueTag, DiscoveredResourceStatus } from '@/shared/types';
import Icon from '@/shared/components/Icon';
import Toolbar, { ToolbarButton } from '@/shared/components/Toolbar';
import TableContainer from '@/shared/components/TableContainer';
import api from '@/services/api';
import TableLoader from '@/shared/components/TableLoader';
import TableError from '@/shared/components/TableError';
import { showToast } from '@/services/toast';
import ImportResourceModal from './ImportResourceModal';
import BatchTagModal from './BatchTagModal';
import { useOptions } from '@/contexts/OptionsContext';
import StatusTag, { type StatusTagProps } from '@/shared/components/StatusTag';

interface DiscoveryJobResultDrawerProps {
  job: DiscoveryJob | null;
}

const DiscoveryJobResultDrawer: React.FC<DiscoveryJobResultDrawerProps> = ({ job }) => {
    const [results, setResults] = useState<DiscoveredResource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBatchTagModalOpen, setIsBatchTagModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const { options } = useOptions();
    const autoDiscoveryOptions = options?.auto_discovery;
    const exporter_templates = autoDiscoveryOptions?.exporter_templates || [];
    const edge_gateways = autoDiscoveryOptions?.edge_gateways || [];

    const JOB_STATUS_META: Record<DiscoveryJob['status'], { label: string; tone: StatusTagProps['tone']; icon: string }> = {
        pending: { label: '等待中', tone: 'neutral', icon: 'clock' },
        running: { label: '執行中', tone: 'info', icon: 'loader-circle' },
        success: { label: '成功', tone: 'success', icon: 'check-circle' },
        failed: { label: '失敗', tone: 'danger', icon: 'x-circle' },
        cancelled: { label: '已取消', tone: 'warning', icon: 'slash' },
    };

    const RESOURCE_STATUS_META: Record<DiscoveredResourceStatus, { label: string; tone: StatusTagProps['tone']; icon: string; tooltip?: string }> = {
        new: { label: '新發現', tone: 'info', icon: 'sparkles', tooltip: '尚未匯入資源，可加入主資源清單。' },
        imported: { label: '已匯入', tone: 'success', icon: 'check-circle', tooltip: '資源已存在於主資源清單。' },
        ignored: { label: '已忽略', tone: 'neutral', icon: 'eye-off', tooltip: '資源已被忽略或列入黑名單。' },
    };

    const fetchResults = useCallback(async () => {
        if (!job) return;
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get<DiscoveredResource[]>(`/resources/discovery-jobs/${job.id}/results`);
            setResults(data);
        } catch (err) {
            setError('無法獲取掃描結果。');
        } finally {
            setIsLoading(false);
        }
    }, [job]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);
    
    useEffect(() => {
        setSelectedIds([]);
    }, [results]);

    const handleImportClick = () => {
        if (selectedIds.length > 0) {
            setIsImportModalOpen(true);
        }
    };
    
    const handleImportSuccess = () => {
        fetchResults(); // Refresh the list
        setIsImportModalOpen(false);
        setSelectedIds([]);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const unmanagedIds = results.filter(r => r.status === 'new').map(r => r.id);
        setSelectedIds(e.target.checked ? unmanagedIds : []);
    };
    
    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        setSelectedIds(prev => e.target.checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id));
    };

    const unmanagedResults = results.filter(r => r.status === 'new');
    const isAllSelected = unmanagedResults.length > 0 && selectedIds.length === unmanagedResults.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < unmanagedResults.length;

    const getStatusIndicator = (status: DiscoveredResource['status']) => {
        const meta = RESOURCE_STATUS_META[status];
        return (
            <StatusTag
                label={meta.label}
                tone={meta.tone}
                icon={meta.icon}
                dense
                tooltip={meta.tooltip}
            />
        );
    };
    
    const handleOpenBatchTag = () => {
        if (selectedIds.length === 0) {
            showToast('請先選擇至少一個資源。', 'error');
            return;
        }
        setIsBatchTagModalOpen(true);
    };

    const handleBatchTagSubmit = async (tags: KeyValueTag[]) => {
        if (tags.length === 0 || selectedIds.length === 0) return;
        setIsProcessing(true);
        try {
            await api.post('/resources/batch-tags', { resource_ids: selectedIds, tags });
            showToast('批次標籤已套用。', 'success');
            setIsBatchTagModalOpen(false);
            setSelectedIds([]);
            fetchResults();
        } catch (error) {
            // Failed to batch add tags
            showToast('批次新增標籤失敗。', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBatchIgnore = async () => {
        if (selectedIds.length === 0) {
            showToast('請先選擇至少一個資源。', 'error');
            return;
        }
        setIsProcessing(true);
        try {
            await api.post('/discovery/batch-ignore', { resource_ids: selectedIds });
            showToast('已忽略選定的資源。', 'success');
            setSelectedIds([]);
            fetchResults();
        } catch (error) {
            // Failed to ignore discovered resources
            showToast('忽略資源失敗。', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const batchActions = (
        <>
            <ToolbarButton icon="file-plus-2" text="匯入到資源清單" onClick={handleImportClick} disabled={selectedIds.length === 0 || isProcessing} />
            <ToolbarButton icon="tags" text="批次加標籤" onClick={handleOpenBatchTag} disabled={selectedIds.length === 0 || isProcessing} />
            <ToolbarButton icon="ban" text="忽略 (黑名單)" onClick={handleBatchIgnore} danger disabled={selectedIds.length === 0 || isProcessing} />
        </>
    );

    if (!job) {
        return (
            <div className="p-6 text-center text-slate-400">
                <Icon name="radar" className="w-6 h-6 mx-auto mb-2" />
                <p>請先選擇一個掃描任務以檢視掃描結果。</p>
            </div>
        );
    }

    const templateMeta = exporter_templates.find((tpl) => tpl.id === job.exporter_binding?.template_id);
    const gatewayLabel = job.edge_gateway?.enabled
        ? edge_gateways.find((gw) => gw.id === job.edge_gateway?.gateway_id)?.name || job.edge_gateway?.gateway_id || '未指定'
        : '未啟用';
    const jobStatusMeta = JOB_STATUS_META[job.status];
    const kindDescriptor = autoDiscoveryOptions?.job_kinds.find((kind) => kind.value === job.kind);
    const kindLabel = kindDescriptor?.label || job.kind;

    const selectedResources = results.filter(r => selectedIds.includes(r.id));

    return (
        <div className="h-full flex flex-col">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-4">
                <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
                    <h4 className="text-xs uppercase text-slate-400">任務狀態</h4>
                    <div className="mt-2">
                        <StatusTag label={jobStatusMeta.label} tone={jobStatusMeta.tone} icon={jobStatusMeta.icon} tooltip={`目前狀態：${jobStatusMeta.label}`} />
                    </div>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
                    <h4 className="text-xs uppercase text-slate-400">掃描類型</h4>
                    <div className="mt-2">
                        <StatusTag label={kindLabel} className={kindDescriptor?.class_name || ''} dense tooltip={`掃描類型：${kindLabel}`} />
                    </div>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
                    <h4 className="text-xs uppercase text-slate-400">Exporter 模板</h4>
                    <p className="mt-1 text-sm text-white font-medium">{templateMeta?.name || job.exporter_binding?.template_id || '未設定'}</p>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
                    <h4 className="text-xs uppercase text-slate-400">Edge Gateway</h4>
                    <p className="mt-1 text-sm text-white font-medium">{gatewayLabel}</p>
                </div>
            </div>
            <Toolbar
                selectedCount={selectedIds.length}
                onClearSelection={() => setSelectedIds([])}
                batchActions={batchActions}
            />
            <p className="mb-3 text-xs text-slate-400">
                可勾選多筆「新發現」資源進行匯入或批次標籤；已匯入 / 已忽略的項目會自動停用勾選。
            </p>
            <TableContainer
                table={(
                    <table className="app-table text-sm">
                        <thead className="app-table__head">
                            <tr className="app-table__head-row">
                                <th className="app-table__checkbox-cell">
                                    <input
                                        type="checkbox"
                                        className="app-checkbox"
                                        checked={isAllSelected}
                                        ref={el => {
                                            if (el) el.indeterminate = isIndeterminate;
                                        }}
                                        onChange={handleSelectAll}
                                        aria-label="全選新發現資源"
                                    />
                                </th>
                                <th className="app-table__header-cell">名稱 / IP</th>
                                <th className="app-table__header-cell">類型</th>
                                <th className="app-table__header-cell">標籤</th>
                                <th className="app-table__header-cell">狀態</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={5} />
                            ) : error ? (
                                <TableError colSpan={5} message={error} onRetry={fetchResults} />
                            ) : (
                                results.map(res => {
                                    const rowClassName = selectedIds.includes(res.id)
                                        ? 'app-table__row app-table__row--selected'
                                        : 'app-table__row';
                                    return (
                                        <tr key={res.id} className={rowClassName}>
                                            <td className="app-table__checkbox-cell">
                                                <input
                                                    type="checkbox"
                                                    className="app-checkbox"
                                                    checked={selectedIds.includes(res.id)}
                                                    onChange={e => handleSelectOne(e, res.id)}
                                                    disabled={res.status !== 'new'}
                                                    aria-label={`選擇 ${res.name} 資源`}
                                                />
                                            </td>
                                            <td className="app-table__cell">
                                                <div className="font-medium app-text-emphasis">{res.name}</div>
                                                <div className="app-text-muted text-xs font-mono">{res.ip}</div>
                                            </td>
                                            <td className="app-table__cell">{res.type}</td>
                                            <td className="app-table__cell">
                                                <div className="flex flex-wrap gap-1">
                                                    {res.tags.map(tag => (
                                                        <span key={tag.id} className="rounded-full bg-slate-700/60 px-2 py-0.5 text-xs">
                                                            {tag.key}:{tag.value}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="app-table__cell">{getStatusIndicator(res.status)}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                )}
            />
            {isImportModalOpen && job && (
                <ImportResourceModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    onSuccess={handleImportSuccess}
                    resourcesToImport={selectedResources}
                    job={job}
                />
            )}
            <BatchTagModal
                isOpen={isBatchTagModalOpen}
                onClose={() => setIsBatchTagModalOpen(false)}
                onSubmit={handleBatchTagSubmit}
                isSubmitting={isProcessing}
                resourceCount={selectedIds.length}
            />
        </div>
    );
};

export default DiscoveryJobResultDrawer;
