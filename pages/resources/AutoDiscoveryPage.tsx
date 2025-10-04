import React, { useState, useEffect, useCallback } from 'react';
import { DiscoveryJob, DiscoveryJobFilters } from '../../types';
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
import StatusTag, { type StatusTagProps } from '../../components/StatusTag';
import IconButton from '../../components/IconButton';

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

    const JOB_STATUS_META: Record<DiscoveryJob['status'], { label: string; tone: StatusTagProps['tone']; icon: string }> = {
        pending: { label: '等待中', tone: 'neutral', icon: 'clock' },
        running: { label: '執行中', tone: 'info', icon: 'loader-circle' },
        success: { label: '成功', tone: 'success', icon: 'check-circle' },
        failed: { label: '失敗', tone: 'danger', icon: 'x-circle' },
        cancelled: { label: '已取消', tone: 'warning', icon: 'slash' },
    };

    const getCronDescription = (cron: string) => {
        const parts = cron.trim().split(/\s+/);
        if (parts.length !== 5) {
            return '自訂排程（Cron）';
        }
        const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

        const formatNumber = (value: string) => value.padStart(2, '0');
        const describeField = (value: string, unit: string) => {
            if (value === '*') return `每個${unit}`;
            if (value.startsWith('*/')) return `每 ${value.replace('*/', '')} 個${unit}`;
            return `${unit}的 ${value}`;
        };

        const timeText = hour === '*' && minute === '*'
            ? '每分鐘'
            : hour === '*'
                ? describeField(minute, '分鐘')
                : minute === '*'
                    ? describeField(hour, '小時')
                    : `於 ${formatNumber(hour)}:${formatNumber(minute)} 執行`;

        if (dayOfMonth !== '*' && dayOfWeek === '*') {
            return `每月的第 ${dayOfMonth} 天，${timeText}`;
        }
        if (dayOfWeek !== '*' && dayOfMonth === '*') {
            const weekdayMap: Record<string, string> = {
                '0': '週日', '1': '週一', '2': '週二', '3': '週三', '4': '週四', '5': '週五', '6': '週六',
            };
            const readableDay = weekdayMap[dayOfWeek] || `週期 ${dayOfWeek}`;
            return `${readableDay}的 ${timeText}`;
        }
        if (month !== '*') {
            return `${describeField(month, '月份')}的 ${timeText}`;
        }
        return `${timeText}（自訂 Cron）`;
    };

    const renderSchedule = (cron: string) => {
        const description = getCronDescription(cron);
        return (
            <div className="flex flex-col gap-1">
                <code className="inline-flex w-fit rounded bg-slate-800/70 px-2 py-1 text-xs font-mono text-slate-200" title={description}>
                    {cron}
                </code>
                <span className="text-xs text-slate-400" aria-label={`排程說明：${description}`}>{description}</span>
            </div>
        );
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
                                            const label = kindDescriptor?.label || job.kind;
                                            const className = kindDescriptor?.class_name || '';
                                            return (
                                                <StatusTag
                                                    label={label}
                                                    className={className}
                                                    dense
                                                    tooltip={`掃描類型：${label}`}
                                                />
                                            );
                                        })()
                                    }</td>
                                    <td className="px-6 py-4">{renderSchedule(job.schedule)}</td>
                                    <td className="px-6 py-4">{job.last_run_at}</td>
                                    <td className="px-6 py-4">
                                        {(() => {
                                            const meta = JOB_STATUS_META[job.status];
                                            return (
                                                <StatusTag
                                                    label={meta.label}
                                                    tone={meta.tone}
                                                    icon={meta.icon}
                                                    dense
                                                    tooltip={`任務狀態：${meta.label}`}
                                                />
                                            );
                                        })()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <IconButton icon="list" label="查看結果" tooltip="檢視最新掃描結果" onClick={() => handleViewResults(job)} />
                                            <IconButton icon="play" label="手動執行" tooltip="立即手動執行一次掃描" onClick={() => handleManualRun(job.id)} />
                                            <IconButton icon="edit-3" label="編輯掃描" tooltip="編輯掃描設定" onClick={() => handleEdit(job)} />
                                            <IconButton icon="trash-2" label="刪除掃描" tooltip="刪除此掃描任務" tone="danger" onClick={() => handleDelete(job)} />
                                        </div>
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