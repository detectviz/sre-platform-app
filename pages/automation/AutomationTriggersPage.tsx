import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AutomationTrigger, TriggerType, AutomationPlaybook, AutomationTriggerFilters, TableColumn, AutomationExecution } from '../../types';
import Toolbar, { ToolbarButton } from '../../components/Toolbar';
import TableContainer from '../../components/TableContainer';
import AutomationTriggerEditModal from '../../components/AutomationTriggerEditModal';
import Modal from '../../components/Modal';
import api from '../../services/api';
import UnifiedSearchModal from '../../components/UnifiedSearchModal';
import ColumnSettingsModal from '../../components/ColumnSettingsModal';
import { usePageMetadata } from '../../contexts/PageMetadataContext';
import { showToast } from '../../services/toast';
import TableLoader from '../../components/TableLoader';
import TableError from '../../components/TableError';
import Pagination from '../../components/Pagination';
import { useOptions } from '../../contexts/OptionsContext';
import StatusTag from '../../components/StatusTag';
import IconButton from '../../components/IconButton';
import { formatRelativeTime } from '../../utils/time';

const PAGE_IDENTIFIER = 'automation_triggers';

const AutomationTriggersPage: React.FC = () => {
    const [triggers, setTriggers] = useState<AutomationTrigger[]>([]);
    const [allColumns, setAllColumns] = useState<TableColumn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [playbooks, setPlaybooks] = useState<AutomationPlaybook[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTrigger, setEditingTrigger] = useState<AutomationTrigger | null>(null);
    const [filters, setFilters] = useState<AutomationTriggerFilters>({});
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingTrigger, setDeletingTrigger] = useState<AutomationTrigger | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [isColumnSettingsModalOpen, setIsColumnSettingsModalOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
    const [executionLookup, setExecutionLookup] = useState<Record<string, AutomationExecution | undefined>>({});

    const { metadata: pageMetadata } = usePageMetadata();
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.column_config_key;
    const { options } = useOptions();

    const typeDescriptors = useMemo(() => options?.automation_triggers?.trigger_types ?? [], [options?.automation_triggers?.trigger_types]);
    const statusDescriptors = useMemo(() => options?.automation_executions?.statuses ?? [], [options?.automation_executions?.statuses]);
    const executionStatusMeta = useMemo(() => {
        const map = new Map<string, { label: string; className?: string }>();
        statusDescriptors.forEach(descriptor => map.set(descriptor.value, { label: descriptor.label, className: descriptor.class_name }));
        return map;
    }, [statusDescriptors]);

    const ensureLastExecutionColumn = useCallback((columns: TableColumn[]): TableColumn[] => {
        if (columns.some(column => column.key === 'last_execution')) {
            return columns;
        }
        return [...columns, { key: 'last_execution', label: '上次執行結果' }];
    }, []);

    const fetchTriggersAndPlaybooks = useCallback(async () => {
        if (!pageKey) return;
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                page_size: pageSize,
                ...filters,
            };
            const [triggersRes, playbooksRes, columnConfigRes, allColumnsRes, executionsRes] = await Promise.all([
                api.get<{ items: AutomationTrigger[], total: number }>('/automation/triggers', { params }),
                api.get<{ items: AutomationPlaybook[], total: number }>('/automation/scripts'),
                api.get<string[]>(`/settings/column-config/${pageKey}`),
                api.get<TableColumn[]>(`/pages/columns/${pageKey}`),
                api.get<{ items: AutomationExecution[], total: number }>('/automation/executions', {
                    params: { page: 1, page_size: 50, sort_by: 'start_time', sort_order: 'desc' }
                })
            ]);
            setTriggers(triggersRes.data.items);
            setTotal(triggersRes.data.total);
            setPlaybooks(playbooksRes.data.items);
            if (allColumnsRes.data.length === 0) {
                throw new Error('欄位定義缺失');
            }
            const extendedColumns = ensureLastExecutionColumn(allColumnsRes.data);
            setAllColumns(extendedColumns);
            const resolvedVisibleColumns = (columnConfigRes.data.length > 0
                ? columnConfigRes.data
                : extendedColumns.map(c => c.key)).includes('last_execution')
                ? (columnConfigRes.data.length > 0 ? columnConfigRes.data : extendedColumns.map(c => c.key))
                : [...(columnConfigRes.data.length > 0 ? columnConfigRes.data : extendedColumns.map(c => c.key)), 'last_execution'];
            setVisibleColumns(resolvedVisibleColumns);
            const executionSummary: Record<string, AutomationExecution> = {};
            executionsRes.data.items.forEach(execution => {
                if (!executionSummary[execution.playbook_id]) {
                    executionSummary[execution.playbook_id] = execution;
                }
            });
            setExecutionLookup(executionSummary);
        } catch (err) {
            setError('Failed to fetch triggers or playbooks.');
        } finally {
            setIsLoading(false);
        }
    }, [filters, pageKey, currentPage, pageSize, ensureLastExecutionColumn]);

    useEffect(() => {
        if (pageKey) {
            fetchTriggersAndPlaybooks();
        }
    }, [fetchTriggersAndPlaybooks, pageKey]);

    const playbookNameMap = useMemo(() => {
        return new Map(playbooks.map(p => [p.id, p.name]));
    }, [playbooks]);

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

    const handleNewTrigger = () => {
        setEditingTrigger(null);
        setIsModalOpen(true);
    };

    const handleEditTrigger = (trigger: AutomationTrigger) => {
        setEditingTrigger(trigger);
        setIsModalOpen(true);
    };

    const handleSaveTrigger = async (triggerData: Partial<AutomationTrigger>) => {
        try {
            if (editingTrigger) {
                await api.patch(`/automation/triggers/${editingTrigger.id}`, triggerData);
            } else {
                await api.post('/automation/triggers', triggerData);
            }
            fetchTriggersAndPlaybooks();
        } catch (err) {
            showToast('儲存自動化觸發器失敗，請稍後再試。', 'error');
        } finally {
            setIsModalOpen(false);
        }
    };

    const handleDeleteClick = (trigger: AutomationTrigger) => {
        setDeletingTrigger(trigger);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (deletingTrigger) {
            try {
                await api.del(`/automation/triggers/${deletingTrigger.id}`);
                fetchTriggersAndPlaybooks();
            } catch (err) {
                showToast('刪除自動化觸發器失敗，請稍後再試。', 'error');
            } finally {
                setIsDeleteModalOpen(false);
                setDeletingTrigger(null);
            }
        }
    };

    const handleToggleEnable = async (trigger: AutomationTrigger) => {
        try {
            await api.patch(`/automation/triggers/${trigger.id}`, { ...trigger, enabled: !trigger.enabled });
            fetchTriggersAndPlaybooks();
        } catch (err) {
            showToast('切換觸發器狀態失敗，請稍後再試。', 'error');
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedIds(e.target.checked ? triggers.map(t => t.id) : []);
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        setSelectedIds(prev => e.target.checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id));
    };

    const isAllSelected = triggers.length > 0 && selectedIds.length === triggers.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < triggers.length;

    const handleBatchAction = async (action: 'enable' | 'disable' | 'delete') => {
        try {
            await api.post('/automation/triggers/batch-actions', { action, ids: selectedIds });
            fetchTriggersAndPlaybooks();
        } catch (err) {
            const actionLabels: Record<typeof action, string> = {
                enable: '啟用',
                disable: '停用',
                delete: '刪除',
            };
            showToast(`批次${actionLabels[action]}失敗，請稍後再試。`, 'error');
        } finally {
            setSelectedIds([]);
        }
    };

    const batchActions = (
        <>
            <ToolbarButton icon="toggle-right" text="啟用" onClick={() => handleBatchAction('enable')} />
            <ToolbarButton icon="toggle-left" text="停用" onClick={() => handleBatchAction('disable')} />
            <ToolbarButton icon="trash-2" text="刪除" danger onClick={() => handleBatchAction('delete')} />
        </>
    );

    const findPlaybookName = (playbook_id: string) => playbookNameMap.get(playbook_id) || 'Unknown Playbook';

    const renderCellContent = (trigger: AutomationTrigger, columnKey: string) => {
        switch (columnKey) {
            case 'enabled':
                return (
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={trigger.enabled} className="sr-only peer" onChange={() => handleToggleEnable(trigger)} />
                        <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-sky-600 peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                );
            case 'name':
                return (
                    <div className="space-y-1">
                        <span className="font-medium text-white">{trigger.name}</span>
                        {trigger.description && <p className="text-xs text-slate-400">{trigger.description}</p>}
                    </div>
                );
            case 'type': {
                const descriptor = typeDescriptors.find(descriptor => descriptor.value === trigger.type);
                return (
                    <StatusTag
                        label={descriptor?.label || trigger.type}
                        tone={trigger.type === 'schedule' ? 'info' : trigger.type === 'event' ? 'warning' : 'neutral'}
                        dense
                        tooltip={`觸發器類型：${descriptor?.label || trigger.type}`}
                    />
                );
            }
            case 'target_playbook_id':
                return (
                    <div className="space-y-1">
                        <span className="font-medium text-white">{findPlaybookName(trigger.target_playbook_id)}</span>
                        <span className="block text-xs text-slate-400">{trigger.target_playbook_id}</span>
                    </div>
                );
            case 'last_triggered_at':
                return (
                    <div className="space-y-1">
                        <span className="font-medium text-white">{formatRelativeTime(trigger.last_triggered_at)}</span>
                        <span className="text-xs text-slate-400">{trigger.last_triggered_at}</span>
                    </div>
                );
            case 'last_execution': {
                const latestExecution = executionLookup[trigger.target_playbook_id];
                if (!latestExecution) {
                    return <span className="text-slate-500">尚未執行</span>;
                }
                const descriptor = executionStatusMeta.get(latestExecution.status);
                return (
                    <div className="space-y-1">
                        <StatusTag
                            label={descriptor?.label || latestExecution.status}
                            className={descriptor?.className}
                            dense
                            tooltip={`上次執行狀態：${descriptor?.label || latestExecution.status}`}
                        />
                        <span className="text-xs text-slate-400">{formatRelativeTime(latestExecution.start_time)}</span>
                    </div>
                );
            }
            default:
                return <span className="text-slate-500">--</span>;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <Toolbar
                leftActions={<ToolbarButton icon="search" text="搜尋和篩選" onClick={() => setIsSearchModalOpen(true)} />}
                rightActions={
                    <>
                        <ToolbarButton icon="settings-2" text="欄位設定" onClick={() => setIsColumnSettingsModalOpen(true)} />
                        <ToolbarButton icon="plus" text="新增觸發器" primary onClick={handleNewTrigger} />
                    </>
                }
                selectedCount={selectedIds.length}
                onClearSelection={() => setSelectedIds([])}
                batchActions={batchActions}
            />
            <TableContainer>
                <div className="flex-1 overflow-y-auto">
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
                                <TableError colSpan={visibleColumns.length + 2} message={error} onRetry={fetchTriggersAndPlaybooks} />
                            ) : triggers.map((trigger) => (
                                <tr key={trigger.id} className={`border-b border-slate-800 ${selectedIds.includes(trigger.id) ? 'bg-sky-900/50' : 'hover:bg-slate-800/40'}`}>
                                    <td className="p-4 w-12">
                                        <input type="checkbox" className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600"
                                            checked={selectedIds.includes(trigger.id)} onChange={(e) => handleSelectOne(e, trigger.id)} />
                                    </td>
                                    {visibleColumns.map(key => (
                                        <td key={key} className="px-6 py-4">{renderCellContent(trigger, key)}</td>
                                    ))}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <IconButton
                                                icon="edit-3"
                                                label="編輯觸發器"
                                                tooltip="編輯觸發器"
                                                onClick={() => handleEditTrigger(trigger)}
                                            />
                                            <IconButton
                                                icon="trash-2"
                                                label="刪除觸發器"
                                                tooltip="刪除觸發器"
                                                tone="danger"
                                                onClick={() => handleDeleteClick(trigger)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    total={total}
                    page={currentPage}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                />
            </TableContainer>
            {isModalOpen && (
                <AutomationTriggerEditModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveTrigger}
                    trigger={editingTrigger}
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
                <p>您確定要刪除觸發器 <strong className="text-amber-400">{deletingTrigger?.name}</strong> 嗎？</p>
                <p className="mt-2 text-slate-400">此操作無法復原。</p>
            </Modal>
            <UnifiedSearchModal
                page="automation-triggers"
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onSearch={(newFilters) => {
                    setFilters(newFilters as AutomationTriggerFilters);
                    setIsSearchModalOpen(false);
                    setCurrentPage(1);
                }}
                initialFilters={filters}
            />
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

export default AutomationTriggersPage;