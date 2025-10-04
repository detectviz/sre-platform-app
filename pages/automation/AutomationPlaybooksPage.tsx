import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AutomationPlaybook, TableColumn } from '../../types';
import TableContainer from '../../components/TableContainer';
import RunPlaybookModal from '../../components/RunPlaybookModal';
import Toolbar, { ToolbarButton } from '../../components/Toolbar';
import AutomationPlaybookEditModal from '../../components/AutomationPlaybookEditModal';
import Modal from '../../components/Modal';
import api from '../../services/api';
import TableLoader from '../../components/TableLoader';
import TableError from '../../components/TableError';
import ColumnSettingsModal from '../../components/ColumnSettingsModal';
import { usePageMetadata } from '../../contexts/PageMetadataContext';
import { showToast } from '../../services/toast';
import { useOptions } from '../../contexts/OptionsContext';
import StatusTag from '../../components/StatusTag';
import IconButton from '../../components/IconButton';
import ContextualKPICard from '../../components/ContextualKPICard';
import { formatRelativeTime } from '../../utils/time';

const PAGE_IDENTIFIER = 'automation_playbooks';

const AutomationPlaybooksPage: React.FC = () => {
    const [playbooks, setPlaybooks] = useState<AutomationPlaybook[]>([]);
    const [allColumns, setAllColumns] = useState<TableColumn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isRunModalOpen, setIsRunModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [runningPlaybook, setRunningPlaybook] = useState<AutomationPlaybook | null>(null);
    const [editingPlaybook, setEditingPlaybook] = useState<AutomationPlaybook | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingPlaybook, setDeletingPlaybook] = useState<AutomationPlaybook | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isColumnSettingsModalOpen, setIsColumnSettingsModalOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
    const [kpiData, setKpiData] = useState<Record<string, any> | null>(null);
    const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
    const [metricError, setMetricError] = useState<string | null>(null);

    const { metadata: pageMetadata } = usePageMetadata();
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.column_config_key;
    const { options } = useOptions();

    const statusDescriptors = useMemo(() => options?.automation_executions?.statuses ?? [], [options?.automation_executions?.statuses]);
    const statusMeta = useMemo(() => {
        const map = new Map<string, { label: string; className?: string }>();
        statusDescriptors.forEach(descriptor => {
            map.set(descriptor.value, { label: descriptor.label, className: descriptor.class_name });
        });
        return map;
    }, [statusDescriptors]);

    const scriptTypeDescriptors = useMemo(() => options?.automation_scripts?.playbook_types ?? [], [options?.automation_scripts?.playbook_types]);
    const scriptTypeMap = useMemo(() => {
        const map = new Map<string, string>();
        scriptTypeDescriptors.forEach(descriptor => map.set(descriptor.value, descriptor.label));
        return map;
    }, [scriptTypeDescriptors]);

    const numberFormatter = useMemo(() => new Intl.NumberFormat('zh-Hant'), []);

    useEffect(() => {
        let mounted = true;
        const fetchMetrics = async () => {
            setIsLoadingMetrics(true);
            setMetricError(null);
            try {
                const { data } = await api.get<Record<string, any>>('/kpi-data');
                if (mounted) {
                    setKpiData(data);
                }
            } catch (err) {
                if (mounted) {
                    setMetricError('無法載入自動化指標，請稍後再試。');
                }
            } finally {
                if (mounted) {
                    setIsLoadingMetrics(false);
                }
            }
        };
        fetchMetrics();
        return () => {
            mounted = false;
        };
    }, []);

    const localizeMetricDescription = useCallback((key: string, description: string) => {
        if (!description) {
            return '--';
        }
        const trendMatch = description.match(/^(↑|↓)([\d.]+)% vs (yesterday|last week|last month)/i);
        if (trendMatch) {
            const direction = trendMatch[1] === '↑' ? '增加' : '下降';
            const value = trendMatch[2];
            const period = trendMatch[3].toLowerCase();
            const localizedPeriod = period === 'yesterday' ? '昨日' : period === 'last week' ? '上週' : '上月';
            return `較${localizedPeriod}${direction} ${value}%`;
        }
        const failureMatch = description.match(/(\d+)\s+failures?/i);
        if (failureMatch) {
            return `失敗 ${failureMatch[1]} 次`;
        }
        const savedMatch = description.match(/Saved\s+(\d+)\s*(hours?|minutes?)\s+of\s+toil/i);
        if (savedMatch) {
            const amount = savedMatch[1];
            const unit = savedMatch[2].toLowerCase().startsWith('hour') ? '小時' : '分鐘';
            return `節省 ${amount} ${unit}人工作業`; 
        }
        if (key === 'automation_suppressed_alerts' && description) {
            return description.replace('toil', '人工作業');
        }
        return description;
    }, []);

    const automationMetricCards = useMemo(() => {
        if (!kpiData) return [];
        const metricTitles: Record<string, string> = {
            automation_runs_today: '今日運行次數',
            automation_success_rate: '自動化成功率',
            automation_suppressed_alerts: '避免觸發的告警',
        };
        return ['automation_runs_today', 'automation_success_rate', 'automation_suppressed_alerts']
            .map((key) => {
                const metric = kpiData[key];
                if (!metric) return null;
                return {
                    key,
                    title: metricTitles[key] || key,
                    value: metric.value,
                    description: localizeMetricDescription(key, metric.description),
                    icon: metric.icon,
                    icon_bg_color: metric.icon_bg_color,
                };
            })
            .filter(Boolean) as Array<{ key: string; title: string; value: string; description: string; icon: string; icon_bg_color: string }>;
    }, [kpiData, localizeMetricDescription]);

    const fetchPlaybooks = useCallback(async () => {
        if (!pageKey) return;
        setIsLoading(true);
        setError(null);
        try {
            const [playbooksRes, columnConfigRes, allColumnsRes] = await Promise.all([
                api.get<{ items: AutomationPlaybook[], total: number }>('/automation/scripts'),
                api.get<string[]>(`/settings/column-config/${pageKey}`),
                api.get<TableColumn[]>(`/pages/columns/${pageKey}`)
            ]);
            if (allColumnsRes.data.length === 0) {
                throw new Error('欄位定義缺失');
            }
            setPlaybooks(playbooksRes.data.items);
            setAllColumns(allColumnsRes.data);
            const resolvedVisibleColumns = columnConfigRes.data.length > 0
                ? columnConfigRes.data
                : allColumnsRes.data.map(c => c.key);
            setVisibleColumns(resolvedVisibleColumns);
        } catch (err) {
            setError('無法獲取自動化腳本。');
        } finally {
            setIsLoading(false);
        }
    }, [pageKey]);

    useEffect(() => {
        if (pageKey) {
            fetchPlaybooks();
        }
    }, [fetchPlaybooks, pageKey]);

    const handleSaveColumnConfig = async (newColumnKeys: string[]) => {
        if (!pageKey) {
            showToast('無法儲存欄位設定：頁面設定遺失。', 'error');
            return;
        }
        try {
            await api.put(`/settings/column-config/${pageKey}`, newColumnKeys);
            setVisibleColumns(newColumnKeys);
            showToast('欄位設定已儲存。', 'success');
        } catch (err) {
            showToast('無法儲存欄位設定。', 'error');
        } finally {
            setIsColumnSettingsModalOpen(false);
        }
    };

    const handleRunClick = (playbook: AutomationPlaybook) => {
        setRunningPlaybook(playbook);
        setIsRunModalOpen(true);
    };

    const handleNewPlaybook = () => {
        setEditingPlaybook(null);
        setIsEditModalOpen(true);
    };

    const handleEditPlaybook = (playbook: AutomationPlaybook) => {
        setEditingPlaybook(playbook);
        setIsEditModalOpen(true);
    };

    const handleSavePlaybook = async (playbookData: Partial<AutomationPlaybook>) => {
        try {
            if (editingPlaybook) {
                await api.patch(`/automation/scripts/${editingPlaybook.id}`, playbookData);
            } else {
                await api.post('/automation/scripts', playbookData);
            }
            setIsEditModalOpen(false);
            fetchPlaybooks();
        } catch (err) {
            showToast('儲存自動化手冊失敗，請稍後再試。', 'error');
        }
    };

    const handleDeleteClick = (playbook: AutomationPlaybook) => {
        setDeletingPlaybook(playbook);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (deletingPlaybook) {
            try {
                await api.del(`/automation/scripts/${deletingPlaybook.id}`);
                setIsDeleteModalOpen(false);
                setDeletingPlaybook(null);
                fetchPlaybooks();
            } catch (err) {
                showToast('刪除自動化手冊失敗，請稍後再試。', 'error');
            }
        }
    };

    const handleBatchDelete = async () => {
        try {
            await api.post('/automation/scripts/batch-actions', { action: 'delete', ids: selectedIds });
            setSelectedIds([]);
            fetchPlaybooks();
        } catch (err) {
            showToast('批次刪除自動化手冊失敗，請稍後再試。', 'error');
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedIds(e.target.checked ? playbooks.map(p => p.id) : []);
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        setSelectedIds(prev => e.target.checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id));
    };

    const isAllSelected = playbooks.length > 0 && selectedIds.length === playbooks.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < playbooks.length;

    const batchActions = (
        <ToolbarButton icon="trash-2" text="刪除" danger onClick={handleBatchDelete} />
    );

    const renderCellContent = (pb: AutomationPlaybook, columnKey: string) => {
        switch (columnKey) {
            case 'name': {
                const typeLabel = scriptTypeMap.get(pb.type) || pb.type.toUpperCase();
                const parameterCount = pb.parameters?.length ?? 0;
                return (
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-white">
                            <span className="font-medium">{pb.name}</span>
                            <StatusTag label={typeLabel} tone="info" dense tooltip={`腳本類型：${typeLabel}`} />
                            {parameterCount > 0 && (
                                <StatusTag
                                    label={`${parameterCount} 個參數`}
                                    tone="neutral"
                                    dense
                                    tooltip={`此腳本需要 ${parameterCount} 個輸入參數`}
                                />
                            )}
                        </div>
                        {pb.description && (
                            <p className="text-xs text-slate-400">{pb.description}</p>
                        )}
                    </div>
                );
            }
            case 'trigger':
                return (
                    <StatusTag
                        label={pb.trigger}
                        tone="neutral"
                        dense
                        tooltip={`預設觸發來源：${pb.trigger}`}
                    />
                );
            case 'last_run_status': {
                const descriptor = statusMeta.get(pb.last_run_status);
                return (
                    <StatusTag
                        label={descriptor?.label || pb.last_run_status}
                        className={descriptor?.className}
                        dense
                        tooltip={`最近執行狀態：${descriptor?.label || pb.last_run_status}`}
                    />
                );
            }
            case 'last_run_at':
                return (
                    <div className="space-y-1 text-sm">
                        <span className="font-medium text-white">{formatRelativeTime(pb.last_run_at)}</span>
                        <span className="block text-xs text-slate-400">{pb.last_run_at}</span>
                    </div>
                );
            case 'run_count':
                return (
                    <span className="font-medium text-white">{numberFormatter.format(pb.run_count)} 次</span>
                );
            default:
                return <span className="text-slate-500">--</span>;
        }
    };


    return (
        <div className="h-full flex flex-col">
            {(!isLoadingMetrics || metricError || automationMetricCards.length > 0) && (
                <div className="mb-4">
                    {metricError ? (
                        <div className="rounded-lg border border-amber-600/60 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                            {metricError}
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-3">
                            {(isLoadingMetrics ? [1, 2, 3] : automationMetricCards).map((card, index) => (
                                typeof card === 'number' ? (
                                    <div
                                        key={`metric-skeleton-${index}`}
                                        className="glass-card h-[104px] w-full animate-pulse rounded-xl bg-slate-900/60"
                                    />
                                ) : (
                                    <ContextualKPICard
                                        key={card.key}
                                        title={card.title}
                                        value={card.value}
                                        description={card.description}
                                        icon={card.icon}
                                        icon_bg_color={card.icon_bg_color}
                                    />
                                )
                            ))}
                        </div>
                    )}
                </div>
            )}
            <Toolbar
                rightActions={
                    <>
                        <ToolbarButton icon="settings-2" text="欄位設定" onClick={() => setIsColumnSettingsModalOpen(true)} />
                        <ToolbarButton icon="plus" text="新增腳本" primary onClick={handleNewPlaybook} />
                    </>
                }
                selectedCount={selectedIds.length}
                onClearSelection={() => setSelectedIds([])}
                batchActions={batchActions}
            />
            <TableContainer>
                <div className="h-full overflow-y-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="p-4 w-12">
                                    <input type="checkbox" className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600"
                                        checked={isAllSelected} ref={el => { if (el) el.indeterminate = isIndeterminate; }} onChange={handleSelectAll} />
                                </th>
                                {visibleColumns.map(key => (
                                    <th key={key} scope="col" className="px-6 py-3">{allColumns.find(c => c.key === key)?.label || key}</th>
                                ))}
                                <th scope="col" className="px-6 py-3 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={visibleColumns.length + 2} />
                            ) : error ? (
                                <TableError colSpan={visibleColumns.length + 2} message={error} onRetry={fetchPlaybooks} />
                            ) : playbooks.map((pb) => (
                                <tr key={pb.id} className={`border-b border-slate-800 ${selectedIds.includes(pb.id) ? 'bg-sky-900/50' : 'hover:bg-slate-800/40'}`}>
                                    <td className="p-4 w-12">
                                        <input type="checkbox" className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600"
                                            checked={selectedIds.includes(pb.id)} onChange={(e) => handleSelectOne(e, pb.id)} />
                                    </td>
                                    {visibleColumns.map(key => (
                                        <td key={key} className="px-6 py-4">{renderCellContent(pb, key)}</td>
                                    ))}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <IconButton
                                                icon="play"
                                                label="執行腳本"
                                                tooltip="立即執行腳本"
                                                onClick={() => handleRunClick(pb)}
                                                tone="primary"
                                            />
                                            <IconButton
                                                icon="edit-3"
                                                label="編輯腳本"
                                                tooltip="編輯腳本設定"
                                                onClick={() => handleEditPlaybook(pb)}
                                            />
                                            <IconButton
                                                icon="trash-2"
                                                label="刪除腳本"
                                                tooltip="刪除腳本"
                                                onClick={() => handleDeleteClick(pb)}
                                                tone="danger"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </TableContainer>
            <RunPlaybookModal
                isOpen={isRunModalOpen}
                onClose={() => setIsRunModalOpen(false)}
                playbook={runningPlaybook}
                onRunSuccess={fetchPlaybooks}
            />
            {isEditModalOpen && (
                <AutomationPlaybookEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSavePlaybook}
                    playbook={editingPlaybook}
                />
            )}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="確認刪除"
                width="w-1/3"
                footer={
                    <div className="flex justify-end space-x-2">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">取消</button>
                        <button onClick={handleConfirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md">刪除</button>
                    </div>
                }
            >
                <p>您確定要刪除腳本 <strong className="text-amber-400">{deletingPlaybook?.name}</strong> 嗎？</p>
                <p className="mt-2 text-slate-400">此操作無法復原。</p>
            </Modal>
            <ColumnSettingsModal
                isOpen={isColumnSettingsModalOpen}
                onClose={() => setIsColumnSettingsModalOpen(false)}
                onSave={handleSaveColumnConfig}
                allColumns={allColumns}
                visibleColumnKeys={visibleColumns}
            />
        </div>
    );
};

export default AutomationPlaybooksPage;