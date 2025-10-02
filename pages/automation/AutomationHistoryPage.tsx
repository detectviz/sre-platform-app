import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AutomationExecution, AutomationPlaybook, AutomationHistoryFilters, TableColumn } from '../../types';
import Icon from '../../components/Icon';
import Toolbar, { ToolbarButton } from '../../components/Toolbar';
import TableContainer from '../../components/TableContainer';
import Pagination from '../../components/Pagination';
import Drawer from '../../components/Drawer';
import ExecutionLogDetail from '../../components/ExecutionLogDetail';
import api from '../../services/api';
import TableLoader from '../../components/TableLoader';
import TableError from '../../components/TableError';
import { useOptions } from '../../contexts/OptionsContext';
import { exportToCsv } from '../../services/export';
import { showToast } from '../../services/toast';
import UnifiedSearchModal from '../../components/UnifiedSearchModal';
import ColumnSettingsModal from '../../components/ColumnSettingsModal';
import { usePageMetadata } from '../../contexts/PageMetadataContext';
import SortableHeader from '../../components/SortableHeader';
import { formatDuration } from '../../utils/time';

const PAGE_IDENTIFIER = 'automation_history';

const AutomationHistoryPage: React.FC = () => {
    const [executions, setExecutions] = useState<AutomationExecution[]>([]);
    const [allColumns, setAllColumns] = useState<TableColumn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filters, setFilters] = useState<AutomationHistoryFilters>({});
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [isColumnSettingsModalOpen, setIsColumnSettingsModalOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'start_time', direction: 'desc' });
    const [selectedExecution, setSelectedExecution] = useState<AutomationExecution | null>(null);

    const { options, isLoading: isLoadingOptions } = useOptions();
    const executionOptions = options?.automation_executions;

    const { metadata: pageMetadata } = usePageMetadata();
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.column_config_key;

    const fetchExecutions = useCallback(async () => {
        if (!pageKey) return;
        setIsLoading(true);
        setError(null);
        try {
            const params: any = {
                page: currentPage,
                page_size: pageSize,
                ...filters
            };
            if (sortConfig) {
                params.sort_by = sortConfig.key;
                params.sort_order = sortConfig.direction;
            }
            const [executionsRes, columnConfigRes, allColumnsRes] = await Promise.all([
                api.get<{ items: AutomationExecution[], total: number }>('/automation/executions', { params }),
                api.get<string[]>(`/settings/column-config/${pageKey}`),
                api.get<TableColumn[]>(`/pages/columns/${pageKey}`)
            ]);
            setExecutions(executionsRes.data.items);
            setTotal(executionsRes.data.total);
            if (allColumnsRes.data.length === 0) {
                throw new Error('欄位定義缺失');
            }
            setAllColumns(allColumnsRes.data);
            const resolvedVisibleColumns = columnConfigRes.data.length > 0
                ? columnConfigRes.data
                : allColumnsRes.data.map(c => c.key);
            setVisibleColumns(resolvedVisibleColumns);
        } catch (err) {
            setError('無法獲取執行歷史。');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, filters, pageKey, sortConfig]);

    useEffect(() => {
        if (pageKey) {
            fetchExecutions();
        }
    }, [fetchExecutions, pageKey]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

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

    const handleExport = () => {
        const dataToExport = selectedIds.length > 0
            ? executions.filter(e => selectedIds.includes(e.id))
            : executions;

        if (dataToExport.length === 0) {
            showToast("沒有可匯出的資料。", 'error');
            return;
        }

        exportToCsv({
            filename: `automation-history-${new Date().toISOString().split('T')[0]}.csv`,
            headers: ['id', 'playbook_name', 'status', 'trigger_source', 'triggered_by', 'start_time', 'end_time', 'duration_ms'],
            data: dataToExport,
        });
    };

    const handleRetry = async (executionId: string) => {
        try {
            await api.post(`/automation/executions/${executionId}/retry`);
            showToast('重試請求已成功發送。', 'success');
            fetchExecutions();
        } catch (error) {
            showToast('重試執行失敗。', 'error');
        }
    };

    const getStatusPill = (status: AutomationExecution['status']) => {
        const style = executionOptions?.statuses.find(s => s.value === status);
        return style ? style.class_name : 'bg-slate-500/20 text-slate-400';
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => setSelectedIds(e.target.checked ? executions.map(ex => ex.id) : []);
    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => setSelectedIds(prev => e.target.checked ? [...prev, id] : prev.filter(sid => sid !== id));

    const isAllSelected = executions.length > 0 && selectedIds.length === executions.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < executions.length;

    const getStatusLabel = (status: AutomationExecution['status']): string => {
        if (!executionOptions?.statuses) return status;
        return executionOptions.statuses.find(s => s.value === status)?.label || status;
    };

    const getTriggerSourceLabel = (source: AutomationExecution['trigger_source']): string => {
        if (!executionOptions?.trigger_sources) return source;
        return executionOptions.trigger_sources.find(item => item.value === source)?.label || source;
    };

    const renderCellContent = (ex: AutomationExecution, columnKey: string) => {
        switch (columnKey) {
            case 'playbook_name':
                return <span className="font-medium text-white">{ex.playbook_name}</span>;
            case 'status':
                return (
                    <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusPill(ex.status)}`}>
                            {getStatusLabel(ex.status)}
                        </span>
                        {ex.status === 'failed' && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleRetry(ex.id); }}
                                className="p-1 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white"
                                title="重試"
                            >
                                <Icon name="refresh-cw" className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                );
            case 'trigger_source': {
                const sourceDescriptor = executionOptions?.trigger_sources.find(s => s.value === ex.trigger_source);
                const pillClass = sourceDescriptor?.class_name || 'bg-slate-800/60 border border-slate-600 text-slate-200';
                const label = sourceDescriptor?.label || getTriggerSourceLabel(ex.trigger_source);
                return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${pillClass}`}>{label}</span>;
            }
            case 'triggered_by':
                return ex.triggered_by;
            case 'start_time':
                return ex.start_time;
            case 'duration_ms':
                return formatDuration(ex.duration_ms);
            default:
                return <span className="text-slate-500">--</span>;
        }
    };

    const leftActions = <ToolbarButton icon="search" text="搜尋和篩選" onClick={() => setIsSearchModalOpen(true)} />;

    const rightActions = (
        <>
            <ToolbarButton icon="download" text="匯出" onClick={handleExport} />
            <ToolbarButton icon="settings-2" text="欄位設定" onClick={() => setIsColumnSettingsModalOpen(true)} />
        </>
    );

    return (
        <div className="h-full flex flex-col">
            <Toolbar
                leftActions={leftActions}
                rightActions={rightActions}
                selectedCount={selectedIds.length}
                onClearSelection={() => setSelectedIds([])}
            />

            <TableContainer>
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="p-4 w-12">
                                    <input type="checkbox" className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600 rounded" checked={isAllSelected} ref={el => { if (el) el.indeterminate = isIndeterminate; }} onChange={handleSelectAll} />
                                </th>
                                {visibleColumns.map(key => {
                                    const col = allColumns.find(c => c.key === key);
                                    if (!col) {
                                        return (
                                            <th key={key} scope="col" className="px-6 py-3 text-left text-slate-500">
                                                未定義欄位
                                            </th>
                                        );
                                    }
                                    return <SortableHeader key={key} label={col.label} sortKey={col.key} sortConfig={sortConfig} onSort={handleSort} />;
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading || isLoadingOptions ? (
                                <TableLoader colSpan={visibleColumns.length + 1} />
                            ) : error ? (
                                <TableError colSpan={visibleColumns.length + 1} message={error} onRetry={fetchExecutions} />
                            ) : executions.map((ex) => (
                                <tr key={ex.id} onClick={() => setSelectedExecution(ex)} className={`border-b border-slate-800 cursor-pointer ${selectedIds.includes(ex.id) ? 'bg-sky-900/50' : 'hover:bg-slate-800/40'}`}>
                                    <td className="p-4 w-12" onClick={e => e.stopPropagation()}>
                                        <input type="checkbox" className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600 rounded" checked={selectedIds.includes(ex.id)} onChange={(e) => handleSelectOne(e, ex.id)} />
                                    </td>
                                    {visibleColumns.map(key => (
                                        <td key={key} className="px-6 py-4">
                                            {renderCellContent(ex, key)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination total={total} page={currentPage} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
            </TableContainer>

            <Drawer
                isOpen={!!selectedExecution}
                onClose={() => setSelectedExecution(null)}
                title={`執行日誌: ${selectedExecution?.playbook_name}`}
                width="w-3/5"
            >
                {selectedExecution && <ExecutionLogDetail execution={selectedExecution} />}
            </Drawer>

            <UnifiedSearchModal
                page="automation-history"
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onSearch={(newFilters) => { setFilters(newFilters as AutomationHistoryFilters); setIsSearchModalOpen(false); setCurrentPage(1); }}
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

export default AutomationHistoryPage;
