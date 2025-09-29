import React, { useState, useEffect, useCallback } from 'react';
// FIX: Added DiscoveredResource and DiscoveredResourceStatus to the import from types.ts.
import { DiscoveryJob, DiscoveredResource, KeyValueTag, DiscoveredResourceStatus } from '../types';
import Icon from './Icon';
import Toolbar, { ToolbarButton } from './Toolbar';
import TableContainer from './TableContainer';
import api from '../services/api';
import TableLoader from './TableLoader';
import TableError from './TableError';
import { showToast } from '../services/toast';
import PlaceholderModal from './PlaceholderModal';
import ImportResourceModal from './ImportResourceModal';

interface DiscoveryJobResultDrawerProps {
  job: DiscoveryJob | null;
}

const DiscoveryJobResultDrawer: React.FC<DiscoveryJobResultDrawerProps> = ({ job }) => {
    const [results, setResults] = useState<DiscoveredResource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isPlaceholderModalOpen, setIsPlaceholderModalOpen] = useState(false);
    const [modalFeatureName, setModalFeatureName] = useState('');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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

    const showPlaceholder = (featureName: string) => {
        setModalFeatureName(featureName);
        setIsPlaceholderModalOpen(true);
    };

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
    
    const batchActions = (
        <>
            <ToolbarButton icon="file-plus-2" text="匯入到資源清單" onClick={handleImportClick} />
            <ToolbarButton icon="tags" text="批次加標籤" onClick={() => showPlaceholder('Batch Add Tags')} />
            <ToolbarButton icon="ban" text="忽略 (黑名單)" onClick={() => showPlaceholder('Ignore (Blacklist)')} danger />
        </>
    );

    if (!job) return null;

    const selectedResources = results.filter(r => selectedIds.includes(r.id));

    return (
        <div className="h-full flex flex-col">
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
            <PlaceholderModal
                isOpen={isPlaceholderModalOpen}
                onClose={() => setIsPlaceholderModalOpen(false)}
                featureName={modalFeatureName}
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
        </div>
    );
};

export default DiscoveryJobResultDrawer;