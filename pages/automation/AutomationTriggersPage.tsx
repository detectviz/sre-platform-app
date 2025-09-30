import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AutomationTrigger, TriggerType, AutomationPlaybook, AutomationTriggerFilters, TableColumn } from '../../types';
import Icon from '../../components/Icon';
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
    
    const { metadata: pageMetadata } = usePageMetadata();
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.columnConfigKey;

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
            const [triggersRes, playbooksRes, columnConfigRes, allColumnsRes] = await Promise.all([
                api.get<{ items: AutomationTrigger[], total: number }>('/automation/triggers', { params }),
                api.get<AutomationPlaybook[]>('/automation/scripts'),
                api.get<string[]>(`/settings/column-config/${pageKey}`),
                api.get<TableColumn[]>(`/pages/columns/${pageKey}`)
            ]);
            setTriggers(triggersRes.data.items);
            setTotal(triggersRes.data.total);
            setPlaybooks(playbooksRes.data);
            if (allColumnsRes.data.length === 0) {
                throw new Error('欄位定義缺失');
            }
            setAllColumns(allColumnsRes.data);
            const resolvedVisibleColumns = columnConfigRes.data.length > 0
                ? columnConfigRes.data
                : allColumnsRes.data.map(c => c.key);
            setVisibleColumns(resolvedVisibleColumns);
        } catch (err) {
            setError('Failed to fetch triggers or playbooks.');
        } finally {
            setIsLoading(false);
        }
    }, [filters, pageKey, currentPage, pageSize]);

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
            alert('Failed to save trigger.');
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
                alert('Failed to delete trigger.');
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
            alert('Failed to toggle trigger status.');
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
            alert(`Failed to ${action} selected triggers.`);
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

    const getTriggerTypePill = (type: TriggerType) => {
        switch (type) {
            case 'Schedule': return 'bg-blue-500/20 text-blue-300';
            case 'Webhook': return 'bg-purple-500/20 text-purple-300';
            case 'Event': return 'bg-amber-500/20 text-amber-300';
        }
    };
    
    const findPlaybookName = (playbookId: string) => playbookNameMap.get(playbookId) || 'Unknown Playbook';
    
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
                return <span className="font-medium text-white">{trigger.name}</span>;
            case 'type':
                const typeLabel = trigger.type === 'Schedule' ? '排程' : trigger.type === 'Webhook' ? 'Webhook' : trigger.type === 'Event' ? '事件' : trigger.type;
                return (
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getTriggerTypePill(trigger.type)}`}>
                        {typeLabel}
                    </span>
                );
            case 'targetPlaybookId':
                return findPlaybookName(trigger.targetPlaybookId);
            case 'lastTriggered':
                return trigger.lastTriggered;
            default:
                return null;
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
                                           checked={isAllSelected} ref={el => { if(el) el.indeterminate = isIndeterminate; }} onChange={handleSelectAll} />
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
                                    <td className="px-6 py-4 text-center space-x-1">
                                        <button onClick={() => handleEditTrigger(trigger)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="編輯"><Icon name="edit-3" className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteClick(trigger)} className="p-1.5 rounded-md text-red-400 hover:bg-red-500/20 hover:text-red-300" title="刪除"><Icon name="trash-2" className="w-4 h-4" /></button>
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