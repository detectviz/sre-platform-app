import React, { useState, useEffect, useCallback } from 'react';
import { DiscoveryJob, DiscoveryJobFilters } from '../../types';
import Icon from '../../components/Icon';
import Toolbar, { ToolbarButton } from '../../components/Toolbar';
import TableContainer from '../../components/TableContainer';
import Modal from '../../components/Modal';
import api from '../../services/api';
import TableLoader from '../../components/TableLoader';
import TableError from '../../components/TableError';
import { showToast } from '../../services/toast';
import AutoDiscoveryEditModal from '../../components/AutoDiscoveryEditModal';
import Drawer from '../../components/Drawer';
import DiscoveryJobResultDrawer from '../../components/DiscoveryJobResultDrawer';
import { useOptions } from '../../contexts/OptionsContext';

const AutoDiscoveryPage: React.FC = () => {
    const [jobs, setJobs] = useState<DiscoveryJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<DiscoveryJobFilters>({});

    const { options } = useOptions();
    const autoDiscoveryOptions = options?.auto_discovery;

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<DiscoveryJob | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingJob, setDeletingJob] = useState<DiscoveryJob | null>(null);
    const [viewingResultsForJob, setViewingResultsForJob] = useState<DiscoveryJob | null>(null);

    const fetchJobs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get<{ items: DiscoveryJob[], total: number }>('/resources/discovery-jobs', { params: filters });
            setJobs(data.items);
        } catch (err) {
            setError('無法獲取自動掃描任務列表。');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleNew = () => {
        setEditingJob(null);
        setIsEditModalOpen(true);
    };

    const handleEdit = (job: DiscoveryJob) => {
        setEditingJob(job);
        setIsEditModalOpen(true);
    };

    const handleDelete = (job: DiscoveryJob) => {
        setDeletingJob(job);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (deletingJob) {
            try {
                await api.del(`/resources/discovery-jobs/${deletingJob.id}`);
                showToast(`掃描任務 "${deletingJob.name}" 已成功刪除。`, 'success');
                fetchJobs();
            } catch (err) {
                showToast('刪除掃描任務失敗。', 'error');
            } finally {
                setIsDeleteModalOpen(false);
                setDeletingJob(null);
            }
        }
    };

    const handleSave = async (job: Partial<DiscoveryJob>) => {
        try {
            if (job.id) {
                await api.patch(`/resources/discovery-jobs/${job.id}`, job);
                showToast('掃描任務已成功更新。', 'success');
            } else {
                await api.post('/resources/discovery-jobs', job);
                showToast('掃描任務已成功新增。', 'success');
            }
            fetchJobs();
        } catch (err) {
            showToast('儲存掃描任務失敗。', 'error');
        } finally {
            setIsEditModalOpen(false);
        }
    };

    const handleManualRun = async (job_id: string) => {
        showToast('手動執行已觸發...', 'success');
        try {
            await api.post(`/resources/discovery-jobs/${job_id}/run`);
            fetchJobs(); // Refetch to show running status
        } catch (err) {
            showToast('手動執行失敗。', 'error');
        }
    };

    const handleViewResults = (job: DiscoveryJob) => {
        setViewingResultsForJob(job);
    };

    const getStatusIndicator = (status: DiscoveryJob['status']) => {
        switch (status) {
            case 'success': return <div className="flex items-center text-green-400"><Icon name="check-circle" className="w-4 h-4 mr-2" /> 成功</div>;
            case 'failed': return <div className="flex items-center text-red-400"><Icon name="x-circle" className="w-4 h-4 mr-2" /> 失敗</div>;
            case 'partial_failure': return <div className="flex items-center text-yellow-400"><Icon name="alert-triangle" className="w-4 h-4 mr-2" /> 部分失敗</div>;
            case 'running': return <div className="flex items-center text-sky-400 animate-pulse"><Icon name="loader-circle" className="w-4 h-4 mr-2 animate-spin" /> 執行中</div>;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <Toolbar
                rightActions={
                    <ToolbarButton icon="plus" text="新增掃描" primary onClick={handleNew} />
                }
            />
            <TableContainer>
                <div className="h-full overflow-y-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3">名稱</th>
                                <th className="px-6 py-3">掃描類型</th>
                                <th className="px-6 py-3">排程</th>
                                <th className="px-6 py-3">最後執行</th>
                                <th className="px-6 py-3">狀態</th>
                                <th className="px-6 py-3 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={6} />
                            ) : error ? (
                                <TableError colSpan={6} message={error} onRetry={fetchJobs} />
                            ) : jobs.map((job) => (
                                <tr key={job.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                                    <td className="px-6 py-4 font-medium text-white">{job.name}</td>
                                    <td className="px-6 py-4">{
                                        (() => {
                                            const kindDescriptor = autoDiscoveryOptions?.job_kinds.find(k => k.value === job.kind);
                                            const pillClass = kindDescriptor?.class_name || 'bg-slate-800/60 border border-slate-600 text-slate-200';
                                            const label = kindDescriptor?.label || job.kind;
                                            return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${pillClass}`}>{label}</span>;
                                        })()
                                    }</td>
                                    <td className="px-6 py-4 font-mono">{job.schedule}</td>
                                    <td className="px-6 py-4">{job.last_run_at}</td>
                                    <td className="px-6 py-4">{getStatusIndicator(job.status)}</td>
                                    <td className="px-6 py-4 text-center space-x-1">
                                        <button onClick={() => handleViewResults(job)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="查看結果"><Icon name="list" className="w-4 h-4" /></button>
                                        <button onClick={() => handleManualRun(job.id)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="手動執行"><Icon name="play" className="w-4 h-4" /></button>
                                        <button onClick={() => handleEdit(job)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="編輯"><Icon name="edit-3" className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(job)} className="p-1.5 rounded-md text-red-400 hover:bg-red-500/20 hover:text-red-300" title="刪除"><Icon name="trash-2" className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </TableContainer>
            {isEditModalOpen && (
                <AutoDiscoveryEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSave}
                    job={editingJob}
                />
            )}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="確認刪除掃描任務"
                width="w-1/3"
                footer={
                    <div className="flex justify-end space-x-2">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-md">取消</button>
                        <button onClick={handleConfirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md">刪除</button>
                    </div>
                }
            >
                <p>您確定要刪除掃描任務 <strong className="text-amber-400">{deletingJob?.name}</strong> 嗎？</p>
                <p className="mt-2 text-slate-400">此操作無法復原。</p>
            </Modal>
            <Drawer
                isOpen={!!viewingResultsForJob}
                onClose={() => setViewingResultsForJob(null)}
                title={`掃描結果: ${viewingResultsForJob?.name}`}
                width="w-3/5"
            >
                <DiscoveryJobResultDrawer job={viewingResultsForJob} />
            </Drawer>
        </div>
    );
};

export default AutoDiscoveryPage;