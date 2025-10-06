import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { NotificationStrategy, NotificationStrategyFilters, TableColumn } from '@/shared/types';
import Toolbar, { ToolbarButton } from '@/shared/components/Toolbar';
import TableContainer from '@/shared/components/TableContainer';
import NotificationStrategyEditModal from '@/features/settings/components/NotificationStrategyEditModal';
import Modal from '@/shared/components/Modal';
import Pagination from '@/shared/components/Pagination';
import api from '@/services/api';
import TableLoader from '@/shared/components/TableLoader';
import TableError from '@/shared/components/TableError';
import UnifiedSearchModal from '@/shared/components/UnifiedSearchModal';
import ColumnSettingsModal from '@/shared/components/ColumnSettingsModal';
import { usePageMetadata } from '@/contexts/PageMetadataContext';
import { showToast } from '@/services/toast';
import { useOptions } from '@/contexts/OptionsContext';
import StatusTag from '@/shared/components/StatusTag';
import IconButton from '@/shared/components/IconButton';
import { formatRelativeTime } from '@/shared/utils/time';
import SortableColumnHeaderCell from '@/shared/components/SortableColumnHeaderCell';
import useTableSorting from '@/shared/hooks/useTableSorting';

const PAGE_IDENTIFIER = 'notification_strategies';


const NotificationStrategyPage: React.FC = () => {
    const [strategies, setStrategies] = useState<NotificationStrategy[]>([]);
    const [allColumns, setAllColumns] = useState<TableColumn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStrategy, setEditingStrategy] = useState<NotificationStrategy | null>(null);
    const [filters, setFilters] = useState<NotificationStrategyFilters>({});
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingStrategy, setDeletingStrategy] = useState<NotificationStrategy | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [isColumnSettingsModalOpen, setIsColumnSettingsModalOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

    const { metadata: pageMetadata } = usePageMetadata();
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.column_config_key;

    const { options } = useOptions();
    const incidentOptions = options?.incidents;

    const { sortConfig, sortParams, handleSort } = useTableSorting({ defaultSortKey: 'updated_at', defaultSortDirection: 'desc' });

    const fetchStrategies = useCallback(async () => {
        if (!pageKey) return;
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                page_size: pageSize,
                ...filters,
                ...sortParams,
            };

            const [strategiesRes, columnConfigRes, allColumnsRes] = await Promise.all([
                api.get<{ items: NotificationStrategy[], total: number }>('/settings/notification-strategies', { params }),
                api.get<string[]>(`/settings/column-config/${pageKey}`),
                api.get<TableColumn[]>(`/pages/columns/${pageKey}`)
            ]);
            setStrategies(strategiesRes.data.items);
            setTotal(strategiesRes.data.total);
            if (allColumnsRes.data.length === 0) {
                throw new Error('欄位定義缺失');
            }
            setAllColumns(allColumnsRes.data);
            const resolvedVisibleColumns = columnConfigRes.data.length > 0
                ? columnConfigRes.data
                : allColumnsRes.data.map(c => c.key);
            setVisibleColumns(resolvedVisibleColumns);
        } catch (err) {
            setError('無法獲取通知策略。');
        } finally {
            setIsLoading(false);
        }
    }, [filters, pageKey, currentPage, pageSize, sortParams]);

    useEffect(() => {
        if (pageKey) {
            fetchStrategies();
        }
    }, [fetchStrategies, pageKey]);

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

    const handleNewStrategy = () => {
        setEditingStrategy(null);
        setIsModalOpen(true);
    };

    const handleEditStrategy = (strategy: NotificationStrategy) => {
        setEditingStrategy(strategy);
        setIsModalOpen(true);
    };

    const handleDuplicateStrategy = (strategy: NotificationStrategy) => {
        const { id, ...rest } = strategy;
        setEditingStrategy({
            ...rest,
            name: `策略複本 - ${strategy.name}`,
        } as NotificationStrategy);
        setIsModalOpen(true);
    };

    const handleSaveStrategy = async (strategyDataFromModal: NotificationStrategy) => {
        try {
            if (editingStrategy && editingStrategy.id) {
                await api.patch(`/settings/notification-strategies/${editingStrategy.id}`, strategyDataFromModal);
            } else {
                await api.post('/settings/notification-strategies', strategyDataFromModal);
                setCurrentPage(1); // Reset to first page when adding new item
            }
            fetchStrategies();
        } catch (err) {
            showToast('儲存通知策略失敗，請稍後再試。', 'error');
        } finally {
            setIsModalOpen(false);
            setEditingStrategy(null);
        }
    };

    const handleDeleteClick = (strategy: NotificationStrategy) => {
        setDeletingStrategy(strategy);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (deletingStrategy) {
            try {
                await api.del(`/settings/notification-strategies/${deletingStrategy.id}`);
                // Reset to first page if current page becomes empty
                if (strategies.length === 1 && currentPage > 1) {
                    setCurrentPage(1);
                }
                fetchStrategies();
            } catch (err) {
                showToast('刪除通知策略失敗，請稍後再試。', 'error');
            } finally {
                setIsDeleteModalOpen(false);
                setDeletingStrategy(null);
            }
        }
    };

    const handleToggleEnable = async (strategy: NotificationStrategy) => {
        try {
            await api.patch(`/settings/notification-strategies/${strategy.id}`, { ...strategy, enabled: !strategy.enabled });
            fetchStrategies();
        } catch (err) {
            showToast('切換通知策略狀態失敗，請稍後再試。', 'error');
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedIds(e.target.checked ? strategies.map(s => s.id) : []);
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        setSelectedIds(prev => e.target.checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id));
    };

    const isAllSelected = strategies.length > 0 && selectedIds.length === strategies.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < strategies.length;

    const handleBatchAction = async (action: 'enable' | 'disable' | 'delete') => {
        try {
            await api.post('/settings/notification-strategies/batch-actions', { action, ids: selectedIds });
            fetchStrategies();
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

    const leftActions = (
        <ToolbarButton icon="search" text="搜尋和篩選" onClick={() => setIsSearchModalOpen(true)} />
    );

    const getSeverityLabel = (severity: string): string => {
        const descriptor = incidentOptions?.severities.find(s => s.value === severity);
        return descriptor?.label || severity;
    };

    const getSeverityStyle = (severity: string): string => {
        const descriptor = incidentOptions?.severities.find(s => s.value === severity);
        return descriptor?.class_name || 'bg-slate-800/60 border border-slate-600 text-slate-200';
    };

    const getImpactLabel = (impact: string): string => {
        const descriptor = incidentOptions?.impacts.find(i => i.value === impact);
        return descriptor?.label || impact;
    };

    const getImpactStyle = (impact: string): string => {
        const descriptor = incidentOptions?.impacts.find(i => i.value === impact);
        return descriptor?.class_name || 'bg-slate-800/60 border border-slate-600 text-slate-200';
    };

    const renderConditionTags = (condition: string) => {
        // 解析條件字串並顯示為標籤
        const parts = condition.split(/\s+(AND|OR)\s+/i);
        const elements: React.ReactNode[] = [];

        parts.forEach((part, index) => {
            if (part.toUpperCase() === 'AND' || part.toUpperCase() === 'OR') {
                elements.push(
                    <span key={`op-${index}`} className="text-[11px] text-slate-400 mx-1">
                        {part.toUpperCase()}
                    </span>
                );
            } else if (part.trim()) {
                elements.push(
                    <StatusTag key={`cond-${index}`} label={part.trim()} tone="info" dense />
                );
            }
        });

        return <div className="flex flex-wrap items-center gap-1.5">{elements}</div>;
    };

    const renderCellContent = (strategy: NotificationStrategy, columnKey: string) => {
        switch (columnKey) {
            case 'enabled':
                return (
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={strategy.enabled} className="sr-only peer" onChange={() => handleToggleEnable(strategy)} />
                        <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-sky-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                    </label>
                );
            case 'name': return <span className="font-medium text-white">{strategy.name}</span>;
            case 'trigger_condition': return renderConditionTags(strategy.trigger_condition);
            case 'description':
                return strategy.description ? (
                    <p className="text-sm text-slate-300 leading-6 max-w-xs">{strategy.description}</p>
                ) : <span className="text-slate-500">未提供描述</span>;
            case 'channel_count':
                return <StatusTag label={`${strategy.channel_count} 個管道`} tone="neutral" dense />;
            case 'severity_levels':
                return (
                    <div className="flex flex-wrap gap-1">
                        {strategy.severity_levels.map(level => (
                            <span key={level} className={`px-2 py-0.5 text-xs rounded-full ${getSeverityStyle(level)}`}>
                                {getSeverityLabel(level)}
                            </span>
                        ))}
                    </div>
                );
            case 'impact_levels':
                return (
                    <div className="flex flex-wrap gap-1">
                        {strategy.impact_levels.map(level => (
                            <span key={level} className={`px-2 py-0.5 text-xs rounded-full ${getImpactStyle(level)}`}>
                                {getImpactLabel(level)}
                            </span>
                        ))}
                    </div>
                );
            case 'last_triggered_status':
                return strategy.last_triggered_status ? (
                    <StatusTag
                        label={strategy.last_triggered_status === 'sent' ? '已送達' : strategy.last_triggered_status === 'failed' ? '失敗' : '處理中'}
                        tone={strategy.last_triggered_status === 'sent' ? 'success' : strategy.last_triggered_status === 'failed' ? 'danger' : 'info'}
                        dense
                        tooltip={strategy.last_triggered_summary}
                    />
                ) : <span className="text-slate-500">尚未觸發</span>;
            case 'last_triggered_at':
                return strategy.last_triggered_at ? (
                    <div className="flex flex-col">
                        <span className="font-medium text-white">{formatRelativeTime(strategy.last_triggered_at)}</span>
                        <span className="text-xs text-slate-500">{strategy.last_triggered_at}</span>
                    </div>
                ) : <span className="text-slate-500">尚未觸發</span>;
            case 'creator':
                return (
                    <div className="flex items-center">
                        <span className="font-medium text-white">{strategy.creator}</span>
                    </div>
                );
            case 'updated_at':
                return (
                    <div className="flex items-center">
                        <span className="font-medium text-white">{formatRelativeTime(strategy.updated_at)}</span>
                    </div>
                );
            default:
                return <span className="text-slate-500">-</span>;
        }
    };


    return (
        <div className="h-full flex flex-col">
            <Toolbar
                leftActions={leftActions}
                rightActions={
                    <>
                        <ToolbarButton icon="settings-2" text="欄位設定" onClick={() => setIsColumnSettingsModalOpen(true)} />
                        <ToolbarButton icon="plus" text="新增策略" primary onClick={handleNewStrategy} />
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
                                <th scope="col" className="px-6 py-3 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={visibleColumns.length + 2} />
                            ) : error ? (
                                <TableError colSpan={visibleColumns.length + 2} message={error} onRetry={fetchStrategies} />
                            ) : strategies.length === 0 ? (
                                <tr>
                                    <td colSpan={visibleColumns.length + 2} className="px-6 py-12 text-center text-slate-400">
                                        <div className="space-y-3">
                                            <p className="text-sm">目前尚未建立任何通知策略，點擊「新增策略」即可建立第一個範本。</p>
                                            <ToolbarButton icon="plus" text="新增策略" primary onClick={handleNewStrategy} />
                                        </div>
                                    </td>
                                </tr>
                            ) : strategies.map((strategy) => (
                                <tr key={strategy.id} className={`border-b border-slate-800 ${selectedIds.includes(strategy.id) ? 'bg-sky-900/50' : 'hover:bg-slate-800/40'}`}>
                                    <td className="p-4 w-12">
                                        <input type="checkbox" className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600"
                                            checked={selectedIds.includes(strategy.id)} onChange={(e) => handleSelectOne(e, strategy.id)} />
                                    </td>
                                    {visibleColumns.map(key => (
                                        <td key={key} className="px-6 py-4 align-top">{renderCellContent(strategy, key)}</td>
                                    ))}
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <IconButton icon="edit-3" label="編輯策略" tooltip="編輯策略" onClick={() => handleEditStrategy(strategy)} />
                                            <IconButton icon="copy" label="複製策略" tooltip="複製策略" onClick={() => handleDuplicateStrategy(strategy)} />
                                            <IconButton icon="trash-2" label="刪除策略" tooltip="刪除策略" tone="danger" onClick={() => handleDeleteClick(strategy)} />
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
                <NotificationStrategyEditModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveStrategy}
                    strategy={editingStrategy}
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
                <p>您確定要刪除策略 <strong className="text-amber-400">{deletingStrategy?.name}</strong> 嗎？</p>
                <p className="mt-2 text-slate-400">此操作無法復原。</p>
            </Modal>
            <UnifiedSearchModal
                page="notification-strategies"
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onSearch={(newFilters) => {
                    setFilters(newFilters as NotificationStrategyFilters);
                    setIsSearchModalOpen(false);
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

export default NotificationStrategyPage;