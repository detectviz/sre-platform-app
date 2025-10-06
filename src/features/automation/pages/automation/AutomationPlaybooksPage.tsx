import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AutomationPlaybook, TableColumn } from '@/shared/types';
import TableContainer from '@/shared/components/TableContainer';
import RunPlaybookModal from '@/features/automation/components/RunPlaybookModal';
import Toolbar, { ToolbarButton } from '@/shared/components/Toolbar';
import AutomationPlaybookEditModal from '@/features/automation/components/AutomationPlaybookEditModal';
import Modal from '@/shared/components/Modal';
import Pagination from '@/shared/components/Pagination';
import api from '@/services/api';
import TableLoader from '@/shared/components/TableLoader';
import TableError from '@/shared/components/TableError';
import ColumnSettingsModal from '@/shared/components/ColumnSettingsModal';
import { usePageMetadata } from '@/contexts/PageMetadataContext';
import { showToast } from '@/services/toast';
import { useOptions } from '@/contexts/OptionsContext';
import { useContentSection } from '@/contexts/ContentContext';
import StatusTag from '@/shared/components/StatusTag';
import IconButton from '@/shared/components/IconButton';
import { formatRelativeTime } from '@/shared/utils/time';
import SortableColumnHeaderCell from '@/shared/components/SortableColumnHeaderCell';
import useTableSorting from '@/shared/hooks/useTableSorting';
import { formatContentString } from '@/shared/utils/content';

const PAGE_IDENTIFIER = 'automation_playbooks';

const AutomationPlaybooksPage: React.FC = () => {
    const [playbooks, setPlaybooks] = useState<AutomationPlaybook[]>([]);
    const [allColumns, setAllColumns] = useState<TableColumn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [isRunModalOpen, setIsRunModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [runningPlaybook, setRunningPlaybook] = useState<AutomationPlaybook | null>(null);
    const [editingPlaybook, setEditingPlaybook] = useState<AutomationPlaybook | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingPlaybook, setDeletingPlaybook] = useState<AutomationPlaybook | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isColumnSettingsModalOpen, setIsColumnSettingsModalOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

    const { metadata: pageMetadata } = usePageMetadata();
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.column_config_key;
    const { options } = useOptions();
    const globalContent = useContentSection('GLOBAL');
    const pageContent = useContentSection('AUTOMATION_PLAYBOOKS');

    const fetchErrorMessage = pageContent?.FETCH_ERROR ?? '無法獲取自動化腳本。';
    const missingColumnsError = pageContent?.ERRORS?.MISSING_COLUMNS ?? '欄位定義缺失';
    const columnConfigMissingMessage = pageContent?.TOASTS?.COLUMN_CONFIG_MISSING ?? '無法儲存欄位設定：頁面設定遺失。';
    const columnConfigSaveSuccessMessage = pageContent?.TOASTS?.COLUMN_SAVE_SUCCESS ?? '欄位設定已儲存。';
    const columnConfigSaveErrorMessage = pageContent?.TOASTS?.COLUMN_SAVE_ERROR ?? '無法儲存欄位設定。';
    const playbookSaveErrorMessage = pageContent?.TOASTS?.PLAYBOOK_SAVE_ERROR ?? '儲存自動化手冊失敗，請稍後再試。';
    const deleteErrorMessage = pageContent?.TOASTS?.DELETE_ERROR ?? '刪除自動化手冊失敗，請稍後再試。';
    const batchDeleteErrorMessage = pageContent?.TOASTS?.BATCH_DELETE_ERROR ?? '批次刪除自動化手冊失敗，請稍後再試。';

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



    const { sortConfig, sortParams, handleSort } = useTableSorting({ defaultSortKey: 'updated_at', defaultSortDirection: 'desc' });

    const fetchPlaybooks = useCallback(async () => {
        if (!pageKey) return;
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                page_size: pageSize,
                ...sortParams,
            };

            const [playbooksRes, columnConfigRes, allColumnsRes] = await Promise.all([
                api.get<{ items: AutomationPlaybook[], total: number }>('/automation/scripts', { params }),
                api.get<string[]>(`/settings/column-config/${pageKey}`),
                api.get<TableColumn[]>(`/pages/columns/${pageKey}`)
            ]);
            if (allColumnsRes.data.length === 0) {
                throw new Error(missingColumnsError);
            }
            setPlaybooks(playbooksRes.data.items);
            setTotal(playbooksRes.data.total);
            setAllColumns(allColumnsRes.data);
            const resolvedVisibleColumns = columnConfigRes.data.length > 0
                ? columnConfigRes.data
                : allColumnsRes.data.map(c => c.key);
            setVisibleColumns(resolvedVisibleColumns);
        } catch (err) {
            setError(fetchErrorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [pageKey, currentPage, pageSize, sortParams, missingColumnsError, fetchErrorMessage]);

    useEffect(() => {
        if (pageKey) {
            fetchPlaybooks();
        }
    }, [fetchPlaybooks, pageKey]);

    const handleSaveColumnConfig = async (newColumnKeys: string[]) => {
        if (!pageKey) {
            showToast(columnConfigMissingMessage, 'error');
            return;
        }
        try {
            await api.put(`/settings/column-config/${pageKey}`, newColumnKeys);
            setVisibleColumns(newColumnKeys);
            showToast(columnConfigSaveSuccessMessage, 'success');
        } catch (err) {
            showToast(columnConfigSaveErrorMessage, 'error');
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
            setCurrentPage(1); // Reset to first page when adding new item
            fetchPlaybooks();
        } catch (err) {
            showToast(playbookSaveErrorMessage, 'error');
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
                // Reset to first page if current page becomes empty
                if (playbooks.length === 1 && currentPage > 1) {
                    setCurrentPage(1);
                }
                fetchPlaybooks();
            } catch (err) {
                showToast(deleteErrorMessage, 'error');
            }
        }
    };

    const handleBatchDelete = async () => {
        try {
            await api.post('/automation/scripts/batch-actions', { action: 'delete', ids: selectedIds });
            setSelectedIds([]);
            fetchPlaybooks();
        } catch (err) {
            showToast(batchDeleteErrorMessage, 'error');
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
        <ToolbarButton
            icon="trash-2"
            text={globalContent?.DELETE ?? '刪除'}
            danger
            onClick={handleBatchDelete}
        />
    );

    const renderCellContent = (pb: AutomationPlaybook, columnKey: string) => {
        switch (columnKey) {
            case 'name': {
                const typeLabel = scriptTypeMap.get(pb.type) || pb.type.toUpperCase();
                const parameterCount = pb.parameters?.length ?? 0;
                const parameterCountLabel = formatContentString(pageContent?.TABLE_CELL?.PARAMETERS_COUNT, {
                    count: parameterCount,
                }) ?? `${parameterCount} 個參數`;
                const parameterTooltip = formatContentString(pageContent?.TOOLTIPS?.PARAMETERS, {
                    count: parameterCount,
                }) ?? `此腳本需要 ${parameterCount} 個輸入參數`;
                const typeTooltip = formatContentString(pageContent?.TOOLTIPS?.SCRIPT_TYPE, {
                    type: typeLabel,
                }) ?? `腳本類型：${typeLabel}`;
                return (
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium app-text-emphasis">{pb.name}</span>
                            <StatusTag label={typeLabel} tone="info" dense tooltip={typeTooltip} />
                            {parameterCount > 0 && (
                                <StatusTag
                                    label={parameterCountLabel}
                                    tone="neutral"
                                    dense
                                    tooltip={parameterTooltip}
                                />
                            )}
                        </div>
                        {pb.description && (
                            <p className="text-xs app-text-muted">{pb.description}</p>
                        )}
                    </div>
                );
            }
            case 'trigger': {
                const triggerTooltip = formatContentString(pageContent?.TOOLTIPS?.DEFAULT_TRIGGER, {
                    trigger: pb.trigger,
                }) ?? `預設觸發來源：${pb.trigger}`;
                return (
                    <StatusTag
                        label={pb.trigger}
                        tone="neutral"
                        dense
                        tooltip={triggerTooltip}
                    />
                );
            }
            case 'last_run_status': {
                const descriptor = statusMeta.get(pb.last_run_status);
                const statusLabel = descriptor?.label || pb.last_run_status;
                const statusTooltip = formatContentString(pageContent?.TOOLTIPS?.LAST_RUN_STATUS, {
                    status: statusLabel,
                }) ?? `最近執行狀態：${statusLabel}`;
                return (
                    <StatusTag
                        label={statusLabel}
                        className={descriptor?.className}
                        dense
                        tooltip={statusTooltip}
                    />
                );
            }
            case 'last_run_at': {
                const relative = formatRelativeTime(pb.last_run_at);
                const display = relative || globalContent?.NA || '--';
                return (
                    <div className="flex items-center text-sm app-text-secondary">
                        <span className="font-medium app-text-emphasis">{display}</span>
                    </div>
                );
            }
            case 'run_count': {
                const formattedCount = numberFormatter.format(pb.run_count);
                const runCountLabel = formatContentString(pageContent?.TABLE_CELL?.RUN_COUNT, {
                    count: formattedCount,
                }) ?? `${formattedCount} 次`;
                return <span className="font-medium app-text-emphasis">{runCountLabel}</span>;
            }
            default:
                return <span className="app-text-muted">{globalContent?.NA ?? '--'}</span>;
        }
    };


    const columnSettingsLabel = globalContent?.COLUMN_SETTINGS ?? '欄位設定';
    const addScriptLabel = pageContent?.ADD_SCRIPT ?? '新增腳本';
    const operationsHeaderLabel = globalContent?.ACTIONS ?? '操作';
    const cancelLabel = globalContent?.CANCEL ?? '取消';
    const deleteLabel = globalContent?.DELETE ?? '刪除';
    const confirmDeleteTitle = globalContent?.CONFIRM_DELETE_TITLE ?? '確認刪除';
    const confirmDeleteMessage = globalContent?.CONFIRM_DELETE_MESSAGE ?? '此操作無法復原。';
    const runActionLabel = pageContent?.ACTIONS?.RUN ?? '執行腳本';
    const editActionLabel = pageContent?.ACTIONS?.EDIT ?? '編輯腳本';
    const deleteActionLabel = pageContent?.ACTIONS?.DELETE ?? '刪除腳本';
    const runActionTooltip = pageContent?.TOOLTIPS?.RUN_ACTION ?? '立即執行腳本';
    const editActionTooltip = pageContent?.TOOLTIPS?.EDIT_ACTION ?? '編輯腳本設定';
    const deleteActionTooltip = pageContent?.TOOLTIPS?.DELETE_ACTION ?? '刪除腳本';
    const deleteModalMessage = deletingPlaybook
        ? formatContentString(pageContent?.DELETE_MODAL_MESSAGE, { name: deletingPlaybook.name })
            ?? `您確定要刪除腳本 ${deletingPlaybook.name} 嗎？`
        : formatContentString(pageContent?.DELETE_MODAL_MESSAGE, { name: '' }) ?? '您確定要刪除腳本嗎？';

    return (
        <div className="h-full flex flex-col">
            <Toolbar
                rightActions={
                    <>
                        <ToolbarButton icon="settings-2" text={columnSettingsLabel} onClick={() => setIsColumnSettingsModalOpen(true)} />
                        <ToolbarButton icon="plus" text={addScriptLabel} primary onClick={handleNewPlaybook} />
                    </>
                }
                selectedCount={selectedIds.length}
                onClearSelection={() => setSelectedIds([])}
                batchActions={batchActions}
            />
            <TableContainer
                table={(
                    <table className="app-table text-sm">
                        <thead className="app-table__head">
                            <tr className="app-table__head-row">
                                <th scope="col" className="app-table__checkbox-cell">
                                    <input
                                        type="checkbox"
                                        className="app-checkbox"
                                        checked={isAllSelected}
                                        ref={el => {
                                            if (el) el.indeterminate = isIndeterminate;
                                        }}
                                        onChange={handleSelectAll}
                                        aria-label={globalContent?.SELECT_ALL ?? 'Select all'}
                                    />
                                </th>
                                {visibleColumns.map(key => {
                                    const column = allColumns.find(c => c.key === key);
                                    return (
                                        <SortableColumnHeaderCell
                                            key={key}
                                            column={column}
                                            columnKey={key}
                                            sortConfig={sortConfig}
                                            onSort={handleSort}
                                        />
                                    );
                                })}
                                <th scope="col" className="app-table__header-cell app-table__header-cell--center">
                                    {operationsHeaderLabel}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={visibleColumns.length + 2} />
                            ) : error ? (
                                <TableError colSpan={visibleColumns.length + 2} message={error} onRetry={fetchPlaybooks} />
                            ) : (
                                playbooks.map(pb => {
                                    const isSelected = selectedIds.includes(pb.id);
                                    const rowClassName = isSelected ? 'app-table__row app-table__row--selected' : 'app-table__row';
                                    return (
                                        <tr key={pb.id} className={rowClassName}>
                                            <td className="app-table__checkbox-cell">
                                                <input
                                                    type="checkbox"
                                                    className="app-checkbox"
                                                    checked={isSelected}
                                                    onChange={e => handleSelectOne(e, pb.id)}
                                                    aria-label={globalContent?.SELECT_OPTION ?? 'Select row'}
                                                />
                                            </td>
                                            {visibleColumns.map(key => (
                                                <td key={key} className="app-table__cell">{renderCellContent(pb, key)}</td>
                                            ))}
                                            <td className="app-table__cell app-table__cell--center">
                                                <div className="app-table__actions">
                                                    <IconButton
                                                        icon="play"
                                                        label={runActionLabel}
                                                        tooltip={runActionTooltip}
                                                        onClick={() => handleRunClick(pb)}
                                                        tone="primary"
                                                    />
                                                    <IconButton
                                                        icon="edit-3"
                                                        label={editActionLabel}
                                                        tooltip={editActionTooltip}
                                                        onClick={() => handleEditPlaybook(pb)}
                                                    />
                                                    <IconButton
                                                        icon="trash-2"
                                                        label={deleteActionLabel}
                                                        tooltip={deleteActionTooltip}
                                                        onClick={() => handleDeleteClick(pb)}
                                                        tone="danger"
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                )}
                footer={(
                    <Pagination
                        total={total}
                        page={currentPage}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={setPageSize}
                    />
                )}
            />
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
                title={confirmDeleteTitle}
                width="w-1/3"
                footer={
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="app-btn app-btn--ghost">{cancelLabel}</button>
                        <button onClick={handleConfirmDelete} className="app-btn app-btn--danger">{deleteLabel}</button>
                    </div>
                }
            >
                <p className="app-text-primary">{deleteModalMessage}</p>
                <p className="mt-2 text-sm app-text-muted">{confirmDeleteMessage}</p>
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