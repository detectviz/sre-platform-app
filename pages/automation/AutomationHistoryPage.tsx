import React, { useState, useMemo, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { AutomationExecution, AutomationHistoryFilters, TableColumn } from '../../types';
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
import { formatDuration, formatRelativeTime } from '../../utils/time';
import IconButton from '../../components/IconButton';
import StatusTag from '../../components/StatusTag';
import QuickFilterBar, { QuickFilterOption } from '../../components/QuickFilterBar';
import useTableSorting from '../../hooks/useTableSorting';

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
    const [selectedExecution, setSelectedExecution] = useState<AutomationExecution | null>(null);
    const [statusQuickFilter, setStatusQuickFilter] = useState<string>('all');

    const { options, isLoading: isLoadingOptions } = useOptions();
    const executionOptions = options?.automation_executions;

    const { metadata: pageMetadata } = usePageMetadata();
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.column_config_key;

    const { sortConfig, sortParams, handleSort } = useTableSorting({ defaultSortKey: 'start_time', defaultSortDirection: 'desc' });

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
            Object.assign(params, sortParams);
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
    }, [currentPage, pageSize, filters, pageKey, sortParams]);

    useEffect(() => {
        if (pageKey) {
            fetchExecutions();
        }
    }, [fetchExecutions, pageKey]);

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
            case 'script_name':
            case 'playbook_name':
                return <span className="font-medium text-white">{ex.playbook_name}</span>;
            case 'playbook_id':
                return <span className="font-mono text-xs text-slate-400">{ex.playbook_id}</span>;
            case 'id':
            case 'execution_id':
                return <span className="font-mono text-xs text-slate-400">{ex.id}</span>;
            case 'status':
                return (
                    <div className="flex items-center gap-2">
                        <StatusTag
                            label={getStatusLabel(ex.status)}
                            className={getStatusPill(ex.status)}
                            dense
                            tooltip={`執行狀態：${getStatusLabel(ex.status)}`}
                        />
                        {ex.status === 'failed' && (
                            <IconButton
                                icon="refresh-cw"
                                label="重新嘗試"
                                tooltip="重新嘗試執行"
                                onClick={() => handleRetry(ex.id)}
                            />
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
            case 'start_time': {
                const formatted = ex.start_time ? dayjs(ex.start_time).format('YYYY/MM/DD HH:mm') : '--';
                const relative = formatRelativeTime(ex.start_time);
                return (
                    <div className="space-y-1">
                        <span className="font-medium text-white">{formatted}</span>
                        {relative && relative !== ex.start_time && (
                            <span className="block text-xs text-slate-400">{relative}</span>
                        )}
                    </div>
                );
            }
            case 'end_time': {
                if (!ex.end_time) {
                    return <span className="text-slate-500">尚未完成</span>;
                }
                const formatted = dayjs(ex.end_time).format('YYYY/MM/DD HH:mm');
                const relative = formatRelativeTime(ex.end_time);
                return (
                    <div className="space-y-1">
                        <span className="font-medium text-white">{formatted}</span>
                        {relative && relative !== ex.end_time && (
                            <span className="block text-xs text-slate-400">{relative}</span>
                        )}
                    </div>
                );
            }
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

    const quickFilterOptions: QuickFilterOption[] = useMemo(() => {
        const statusDescriptors = executionOptions?.statuses ?? [];
        const uniqueStatuses = new Map<string, string>();
        statusDescriptors.forEach(descriptor => {
            if (!uniqueStatuses.has(descriptor.value)) {
                uniqueStatuses.set(descriptor.value, descriptor.label);
            }
        });
        return [
            { value: 'all', label: '全部' },
            ...Array.from(uniqueStatuses.entries()).map(([value, label]) => ({ value, label })),
        ];
    }, [executionOptions?.statuses]);

    useEffect(() => {
        if (!quickFilterOptions.some(option => option.value === statusQuickFilter)) {
            setStatusQuickFilter('all');
        }
    }, [quickFilterOptions, statusQuickFilter]);

    useEffect(() => {
        let shouldResetPage = false;
        setFilters(prev => {
            const next = { ...prev } as AutomationHistoryFilters;
            if (statusQuickFilter === 'all') {
                if (typeof prev.status === 'undefined') {
                    return prev;
                }
                delete next.status;
                shouldResetPage = true;
                return next;
            }
            if (prev.status === statusQuickFilter) {
                return prev;
            }
            next.status = statusQuickFilter as AutomationHistoryFilters['status'];
            shouldResetPage = true;
            return next;
        });
        if (shouldResetPage) {
            setCurrentPage(1);
        }
    }, [statusQuickFilter]);

    const drawerTitle = useMemo(() => {
        if (!selectedExecution) {
            return '執行日誌';
        }
        const formattedStart = selectedExecution.start_time
            ? dayjs(selectedExecution.start_time).format('YYYY/MM/DD HH:mm')
            : '未提供時間';
        const relative = selectedExecution.start_time ? formatRelativeTime(selectedExecution.start_time) : '';
        const segments = [`#${selectedExecution.id}`, formattedStart];
        if (relative && relative !== selectedExecution.start_time) {
            segments.push(relative);
        }
        return `執行日誌：${selectedExecution.playbook_name}（${segments.join(' · ')}）`;
    }, [selectedExecution]);

    return (
        <div className="h-full flex flex-col">
            <Toolbar
                leftActions={leftActions}
                rightActions={rightActions}
                selectedCount={selectedIds.length}
                onClearSelection={() => setSelectedIds([])}
            />

            <div className="mt-3 mb-4">
                <QuickFilterBar
                    options={quickFilterOptions}
                    mode="single"
                    value={[statusQuickFilter]}
                    onChange={(values) => setStatusQuickFilter(values[0] ?? 'all')}
                />
            </div>

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
                                    />
                                </th>
                                {visibleColumns.map(key => {
                                    const col = allColumns.find(c => c.key === key);
                                    if (!col) {
                                        return (
                                            <th key={key} scope="col" className="app-table__header-cell">
                                                未定義欄位
                                            </th>
                                        );
                                    }
                                    return (
                                        <SortableHeader
                                            key={key}
                                            label={col.label}
                                            sortKey={col.key}
                                            sortConfig={sortConfig}
                                            onSort={handleSort}
                                        />
                                    );
                                })}
                                <th scope="col" className="app-table__header-cell app-table__header-cell--center">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading || isLoadingOptions ? (
                                <TableLoader colSpan={visibleColumns.length + 2} />
                            ) : error ? (
                                <TableError colSpan={visibleColumns.length + 2} message={error} onRetry={fetchExecutions} />
                            ) : (
                                executions.map(ex => {
                                    const rowClassName = selectedIds.includes(ex.id)
                                        ? 'app-table__row app-table__row--selected'
                                        : 'app-table__row';
                                    return (
                                        <tr
                                            key={ex.id}
                                            onClick={() => setSelectedExecution(ex)}
                                            className={`${rowClassName} cursor-pointer`}
                                        >
                                            <td className="app-table__checkbox-cell" onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    className="app-checkbox"
                                                    checked={selectedIds.includes(ex.id)}
                                                    onChange={e => handleSelectOne(e, ex.id)}
                                                />
                                            </td>
                                            {visibleColumns.map(key => (
                                                <td key={key} className="app-table__cell">{renderCellContent(ex, key)}</td>
                                            ))}
                                            <td className="app-table__cell app-table__cell--center">
                                                <IconButton
                                                    icon="external-link"
                                                    label="查看詳情"
                                                    tooltip="查看執行輸出"
                                                    onClick={() => setSelectedExecution(ex)}
                                                />
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

            <Drawer
                isOpen={!!selectedExecution}
                onClose={() => setSelectedExecution(null)}
                title={drawerTitle}
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
