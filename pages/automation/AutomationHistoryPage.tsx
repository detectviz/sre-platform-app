import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AutomationExecution, AutomationPlaybook, AutomationHistoryFilters } from '../../types';
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
import ColumnSettingsModal, { TableColumn } from '../../components/ColumnSettingsModal';
import { usePageMetadata } from '../../contexts/PageMetadataContext';

const ALL_COLUMNS: TableColumn[] = [
    { key: 'scriptName', label: '腳本名稱' },
    { key: 'status', label: '狀態' },
    { key: 'triggerSource', label: '觸發來源' },
    { key: 'startTime', label: '開始時間' },
    { key: 'durationMs', label: '耗時' },
];
const PAGE_IDENTIFIER = 'automation_history';

const SortableHeader: React.FC<{
  label: string;
  sortKey: string;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  onSort: (key: string) => void;
  className?: string;
}> = ({ label, sortKey, sortConfig, onSort, className = '' }) => {
  const isSorted = sortConfig?.key === sortKey;
  const direction = isSorted ? sortConfig.direction : null;

  return (
    <th scope="col" className={`px-6 py-3 cursor-pointer select-none ${className}`} onClick={() => onSort(sortKey)}>
      <div className="flex items-center">
        {label}
        {isSorted ? (
          <Icon name={direction === 'asc' ? 'arrow-up' : 'arrow-down'} className="w-4 h-4 ml-1.5" />
        ) : (
          <Icon name="chevrons-up-down" className="w-4 h-4 ml-1.5 text-slate-600" />
        )}
      </div>
    </th>
  );
};


const AutomationHistoryPage: React.FC = () => {
    const [executions, setExecutions] = useState<AutomationExecution[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedExecution, setSelectedExecution] = useState<AutomationExecution | null>(null);
    const { options, isLoading: isLoadingOptions } = useOptions();
    const automationExecutionOptions = options?.automationExecutions;
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'startTime', direction: 'desc' });
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [filters, setFilters] = useState<AutomationHistoryFilters>({});
    const [isColumnSettingsModalOpen, setIsColumnSettingsModalOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

    const { metadata: pageMetadata } = usePageMetadata();
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.columnConfigKey;

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

            const [executionsRes, columnsRes] = await Promise.all([
                 api.get<{ items: AutomationExecution[], total: number }>('/automation/executions', { params }),
                 api.get<string[]>(`/settings/column-config/${pageKey}`)
            ]);
            
            setExecutions(executionsRes.data.items);
            setTotal(executionsRes.data.total);
            setVisibleColumns(columnsRes.data.length > 0 ? columnsRes.data : ALL_COLUMNS.map(c => c.key));
        } catch (err) {
            setError('無法獲取運行歷史。');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, filters, sortConfig, pageKey]);

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

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getStatusPill = (status: AutomationExecution['status']) => {
        if (!automationExecutionOptions?.statuses) {
            return 'bg-slate-500/20 text-slate-400'; // Fallback
        }
        const style = automationExecutionOptions.statuses.find(s => s.value === status);
        let className = style ? style.className : 'bg-slate-500/20 text-slate-400';
        if (status === 'running') {
            className += ' animate-pulse';
        }
        return className;
    };
    
    const handleExport = () => {
        if (executions.length === 0) {
            showToast("沒有可匯出的資料。", 'error');
            return;
        }
        exportToCsv({
            filename: `automation-history-${new Date().toISOString().split('T')[0]}.csv`,
            headers: ['id', 'scriptName', 'status', 'triggerSource', 'triggeredBy', 'startTime', 'durationMs'],
            data: executions.map(exec => ({...exec, durationMs: exec.durationMs || 0 })),
        });
    };
    
    const renderCellContent = (exec: AutomationExecution, columnKey: string) => {
        switch (columnKey) {
            case 'scriptName':
                return <span className="font-medium text-white">{exec.scriptName}</span>;
            case 'status':
                return (
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusPill(exec.status)}`}>
                        {exec.status}
                    </span>
                );
            case 'triggerSource':
                return `${exec.triggerSource}: ${exec.triggeredBy}`;
            case 'startTime':
                return exec.startTime;
            case 'durationMs':
                return exec.durationMs ? `${(exec.durationMs / 1000).toFixed(2)}s` : 'N/A';
            default:
                return null;
        }
    };

    const leftActions = <ToolbarButton icon="search" text="搜尋和篩選" onClick={() => setIsSearchModalOpen(true)} />;
    const rightActions = (
        <>
            <ToolbarButton icon="settings-2" text="欄位設定" onClick={() => setIsColumnSettingsModalOpen(true)} />
            <ToolbarButton icon="download" text="匯出" onClick={handleExport} />
        </>
    );

    return (
        <div className="h-full flex flex-col">
            <Toolbar
                leftActions={leftActions}
                rightActions={rightActions}
            />
            <TableContainer>
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0 z-10">
                            <tr>
                                {visibleColumns.map(key => {
                                    const col = ALL_COLUMNS.find(c => c.key === key);
                                    if (!col) return null;
                                    return (
                                        <SortableHeader key={key} label={col.label} sortKey={col.key} sortConfig={sortConfig} onSort={handleSort} />
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={visibleColumns.length} />
                            ) : error ? (
                                <TableError colSpan={visibleColumns.length} message={error} onRetry={fetchExecutions} />
                            ) : executions.map((exec) => (
                                <tr key={exec.id} className="border-b border-slate-800 hover:bg-slate-800/40 cursor-pointer" onClick={() => setSelectedExecution(exec)}>
                                    {visibleColumns.map(key => (
                                        <td key={key} className="px-6 py-4">{renderCellContent(exec, key)}</td>
                                    ))}
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

            <Drawer
                isOpen={!!selectedExecution}
                onClose={() => setSelectedExecution(null)}
                title={`執行日誌: ${selectedExecution?.scriptName} (${selectedExecution?.id})`}
                width="w-3/5"
            >
                {selectedExecution && <ExecutionLogDetail execution={selectedExecution} />}
            </Drawer>
            <UnifiedSearchModal
                page="automation-history"
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onSearch={(newFilters) => {
                    setFilters(newFilters as AutomationHistoryFilters);
                    setIsSearchModalOpen(false);
                    setCurrentPage(1);
                }}
                initialFilters={filters}
            />
            <ColumnSettingsModal
                isOpen={isColumnSettingsModalOpen}
                onClose={() => setIsColumnSettingsModalOpen(false)}
                onSave={handleSaveColumnConfig}
                allColumns={ALL_COLUMNS}
                visibleColumnKeys={visibleColumns}
            />
        </div>
    );
};

export default AutomationHistoryPage;