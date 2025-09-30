import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { NotificationStrategy, NotificationStrategyFilters, TableColumn } from '../../../types';
import Icon from '../../../components/Icon';
import Toolbar, { ToolbarButton } from '../../../components/Toolbar';
import TableContainer from '../../../components/TableContainer';
import NotificationStrategyEditModal from '../../../components/NotificationStrategyEditModal';
import Modal from '../../../components/Modal';
import api from '../../../services/api';
import TableLoader from '../../../components/TableLoader';
import TableError from '../../../components/TableError';
import UnifiedSearchModal from '../../../components/UnifiedSearchModal';
import ColumnSettingsModal from '../../../components/ColumnSettingsModal';
import { usePageMetadata } from '../../../contexts/PageMetadataContext';
import { showToast } from '../../../services/toast';

const PAGE_IDENTIFIER = 'notification_strategies';


const NotificationStrategyPage: React.FC = () => {
    const [strategies, setStrategies] = useState<NotificationStrategy[]>([]);
    const [allColumns, setAllColumns] = useState<TableColumn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
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
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.columnConfigKey;

    const fetchStrategies = useCallback(async () => {
        if (!pageKey) return;
        setIsLoading(true);
        setError(null);
        try {
            const [strategiesRes, columnConfigRes, allColumnsRes] = await Promise.all([
                api.get<NotificationStrategy[]>('/settings/notification-strategies', { params: filters }),
                api.get<string[]>(`/settings/column-config/${pageKey}`),
                api.get<TableColumn[]>(`/pages/columns/${pageKey}`)
            ]);
            setStrategies(strategiesRes.data);
            if (allColumnsRes.data.length === 0) {
                throw new Error('欄位定義缺失');
            }
            setAllColumns(allColumnsRes.data);
            const resolvedVisibleColumns = columnConfigRes.data.length > 0
                ? columnConfigRes.data
                : allColumnsRes.data.map(c => c.key);
            setVisibleColumns(resolvedVisibleColumns);
        } catch(err) {
            setError('無法獲取通知策略。');
        } finally {
            setIsLoading(false);
        }
    }, [filters, pageKey]);

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
            name: `Copy of ${strategy.name}`,
        } as NotificationStrategy);
        setIsModalOpen(true);
    };
    
    const handleSaveStrategy = async (strategyDataFromModal: NotificationStrategy) => {
        try {
            if (editingStrategy && editingStrategy.id) {
                await api.patch(`/settings/notification-strategies/${editingStrategy.id}`, strategyDataFromModal);
            } else {
                await api.post('/settings/notification-strategies', strategyDataFromModal);
            }
            fetchStrategies();
        } catch(err) {
            alert('Failed to save strategy.');
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
                fetchStrategies();
            } catch (err) {
                alert('Failed to delete strategy.');
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
        } catch(err) {
            alert('Failed to toggle strategy status.');
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
            alert(`Failed to ${action} selected strategies.`);
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
    
    const renderConditionTags = (condition: string) => {
        // 解析條件字串並顯示為標籤
        const parts = condition.split(/\s+(AND|OR)\s+/i);
        const elements: React.ReactNode[] = [];

        parts.forEach((part, index) => {
            if (part.toUpperCase() === 'AND' || part.toUpperCase() === 'OR') {
                elements.push(
                    <span key={`op-${index}`} className="text-xs text-slate-400 mx-1">
                        {part.toUpperCase()}
                    </span>
                );
            } else if (part.trim()) {
                elements.push(
                    <span key={`cond-${index}`} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-sky-900/50 text-sky-300 rounded-md border border-sky-700/50">
                        {part.trim()}
                    </span>
                );
            }
        });

        return <div className="flex flex-wrap items-center gap-1">{elements}</div>;
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
            case 'triggerCondition': return renderConditionTags(strategy.triggerCondition);
            case 'channelCount': return strategy.channelCount;
            case 'priority': return strategy.priority;
            case 'creator': return strategy.creator;
            case 'lastUpdated': return strategy.lastUpdated;
            default: return null;
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
                                <TableError colSpan={visibleColumns.length + 2} message={error} onRetry={fetchStrategies} />
                            ) : strategies.map((strategy) => (
                                <tr key={strategy.id} className={`border-b border-slate-800 ${selectedIds.includes(strategy.id) ? 'bg-sky-900/50' : 'hover:bg-slate-800/40'}`}>
                                    <td className="p-4 w-12">
                                        <input type="checkbox" className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600"
                                               checked={selectedIds.includes(strategy.id)} onChange={(e) => handleSelectOne(e, strategy.id)} />
                                    </td>
                                    {visibleColumns.map(key => (
                                        <td key={key} className="px-6 py-4">{renderCellContent(strategy, key)}</td>
                                    ))}
                                    <td className="px-6 py-4 text-center space-x-1">
                                        <button onClick={() => handleEditStrategy(strategy)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="編輯"><Icon name="edit-3" className="w-4 h-4" /></button>
                                        <button onClick={() => handleDuplicateStrategy(strategy)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="複製"><Icon name="copy" className="w-4 h-4" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(strategy); }} className="p-1.5 rounded-md text-red-400 hover:bg-red-500/20 hover:text-red-300" title="刪除"><Icon name="trash-2" className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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