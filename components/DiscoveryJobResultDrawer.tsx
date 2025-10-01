import React, { useState, useEffect, useCallback } from 'react';
import { DiscoveryJob, DiscoveredResource, KeyValueTag, DiscoveredResourceStatus } from '../types';
import Icon from './Icon';
import Toolbar, { ToolbarButton } from './Toolbar';
import TableContainer from './TableContainer';
import api from '../services/api';
import TableLoader from './TableLoader';
import TableError from './TableError';
import { showToast } from '../services/toast';
import ImportResourceModal from './ImportResourceModal';
import BatchTagModal from './BatchTagModal';
import { useOptions } from '../contexts/OptionsContext';

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
    const exporterTemplates = autoDiscoveryOptions?.exporter_templates || [];
    const edgeGateways = autoDiscoveryOptions?.edge_gateways || [];

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
        switch (status) {
            case 'new': return <div className="flex items-center text-sky-400"><Icon name="sparkles" className="w-4 h-4 mr-2" /> 新發現</div>;
            case 'imported': return <div className="flex items-center text-green-400"><Icon name="check-circle" className="w-4 h-4 mr-2" /> 已匯入</div>;
            case 'ignored': return <div className="flex items-center text-slate-400"><Icon name="eye-off" className="w-4 h-4 mr-2" /> 已忽略</div>;
        }
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

    const templateMeta = exporterTemplates.find((tpl) => tpl.id === job.exporter_binding?.template_id);
    const gatewayLabel = job.edge_gateway?.enabled
        ? edgeGateways.find((gw) => gw.id === job.edge_gateway?.gateway_id)?.name || job.edge_gateway?.gateway_id || '未指定'
        : '未啟用';

    const selectedResources = results.filter(r => selectedIds.includes(r.id));

    return (
        <div className="h-full flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4">
                    <h4 className="text-xs uppercase text-slate-400">掃描類型</h4>
                    <p className="mt-1 text-sm text-white font-medium">{job.kind}</p>
                </div>
                <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4">
                    <h4 className="text-xs uppercase text-slate-400">Exporter 模板</h4>
                    <p className="mt-1 text-sm text-white font-medium">{templateMeta?.name || job.exporter_binding?.template_id || '未設定'}</p>
                </div>
                <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4">
                    <h4 className="text-xs uppercase text-slate-400">Edge Gateway</h4>
                    <p className="mt-1 text-sm text-white font-medium">{gatewayLabel}</p>
                </div>
            </div>
            <Toolbar
                selectedCount={selectedIds.length}
                onClearSelection={() => setSelectedIds([])}
                batchActions={batchActions}
            />
            <TableContainer>
                <div className="h-full overflow-y-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0 z-10">
                            <tr>
                                <th className="p-4 w-12">
                                     <input type="checkbox" className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600"
                                           checked={isAllSelected} ref={el => { if(el) el.indeterminate = isIndeterminate; }} onChange={handleSelectAll} />
                                </th>
                                <th className="px-6 py-3">名稱 / IP</th>
                                <th className="px-6 py-3">類型</th>
                                <th className="px-6 py-3">標籤</th>
                                <th className="px-6 py-3">狀態</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={5} />
                            ) : error ? (
                                <TableError colSpan={5} message={error} onRetry={fetchResults} />
                            ) : results.map((res) => (
                                <tr key={res.id} className={`border-b border-slate-800 ${selectedIds.includes(res.id) ? 'bg-sky-900/50' : 'hover:bg-slate-800/40'}`}>
                                    <td className="p-4 w-12">
                                        <input type="checkbox" className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600"
                                               checked={selectedIds.includes(res.id)} 
                                               onChange={(e) => handleSelectOne(e, res.id)} 
                                               disabled={res.status !== 'new'}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{res.name}</div>
                                        <div className="text-xs text-slate-400 font-mono">{res.ip}</div>
                                    </td>
                                    <td className="px-6 py-4">{res.type}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {res.tags.map(t => <span key={t.id} className="px-2 py-0.5 text-xs bg-slate-700 rounded-full">{t.key}:{t.value}</span>)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{getStatusIndicator(res.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </TableContainer>
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
