import React, { useState, useMemo, useEffect, useCallback } from 'react';
// FIX: Import TableColumn from types.ts
import { AuditLog, User, AuditLogOptions, AuditLogFilters, TableColumn } from '../../../types';
import Icon from '../../../components/Icon';
import TableContainer from '../../../components/TableContainer';
import Drawer from '../../../components/Drawer';
import Toolbar, { ToolbarButton } from '../../../components/Toolbar';
import api from '../../../services/api';
import Pagination from '../../../components/Pagination';
import TableLoader from '../../../components/TableLoader';
import TableError from '../../../components/TableError';
import PlaceholderModal from '../../../components/PlaceholderModal';
import { exportToCsv } from '../../../services/export';
import UnifiedSearchModal from '../../../components/UnifiedSearchModal';
// FIX: Import TableColumn from types.ts, not from ColumnSettingsModal
import ColumnSettingsModal from '../../../components/ColumnSettingsModal';
import { usePageMetadata } from '../../../contexts/PageMetadataContext';
import { showToast } from '../../../services/toast';
import SortableHeader from '../../../components/SortableHeader';

const PAGE_IDENTIFIER = 'audit_logs';

const AuditLogsPage: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [allColumns, setAllColumns] = useState<TableColumn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalLogs, setTotalLogs] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [filters, setFilters] = useState<AuditLogFilters>({});
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [isColumnSettingsModalOpen, setIsColumnSettingsModalOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'timestamp', direction: 'desc' });
    
    const { metadata: pageMetadata } = usePageMetadata();
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.columnConfigKey;

    const fetchAuditLogs = useCallback(async () => {
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
            const [logsRes, columnConfigRes, allColumnsRes] = await Promise.all([
                api.get<{ items: AuditLog[], total: number }>('/iam/audit-logs', { params }),
                api.get<string[]>(`/settings/column-config/${pageKey}`),
                api.get<TableColumn[]>(`/pages/columns/${pageKey}`)
            ]);
            setLogs(logsRes.data.items);
            setTotalLogs(logsRes.data.total);
            if (allColumnsRes.data.length === 0) {
                throw new Error('欄位定義缺失');
            }
            setAllColumns(allColumnsRes.data);
            const resolvedVisibleColumns = columnConfigRes.data.length > 0
                ? columnConfigRes.data
                : allColumnsRes.data.map(c => c.key);
            setVisibleColumns(resolvedVisibleColumns);
        } catch (err) {
            setError('無法獲取審計日誌。');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, filters, pageKey, sortConfig]);

    useEffect(() => {
        if (pageKey) {
            fetchAuditLogs();
        }
    }, [fetchAuditLogs, pageKey]);
    
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
        if (logs.length === 0) {
            alert("沒有可匯出的資料。");
            return;
        }
        exportToCsv({
            filename: `audit-logs-${new Date().toISOString().split('T')[0]}.csv`,
            headers: ['id', 'timestamp', 'user_name', 'action', 'target_type', 'target_name', 'result', 'ip'],
            data: logs.map(log => ({
                id: log.id,
                timestamp: log.timestamp,
                user_name: log.user.name,
                action: log.action,
                target_type: log.target.type,
                target_name: log.target.name,
                result: log.result,
                ip: log.ip,
            })),
        });
    };
    
    const renderCellContent = (log: AuditLog, columnKey: string) => {
        switch (columnKey) {
            case 'timestamp': return log.timestamp;
            case 'user': return log.user.name;
            case 'action': return <span className="font-mono text-xs">{log.action}</span>;
            case 'target': return `${log.target.type}: ${log.target.name}`;
            case 'result':
                return (
                    <span className={`font-semibold ${log.result === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                        {log.result.toUpperCase()}
                    </span>
                );
            case 'ip': return log.ip;
            default: return null;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <Toolbar
                leftActions={<ToolbarButton icon="search" text="檢索和篩選" onClick={() => setIsSearchModalOpen(true)} />}
                rightActions={
                    <>
                        <ToolbarButton icon="settings-2" text="欄位設定" onClick={() => setIsColumnSettingsModalOpen(true)} />
                        <ToolbarButton icon="download" text="匯出" onClick={handleExport} />
                    </>
                }
            />

            <TableContainer>
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0 z-10">
                            <tr>
                                {visibleColumns.map(key => {
                                    const col = allColumns.find(c => c.key === key);
                                    if (!col) return null;
                                    return <SortableHeader key={key} label={col.label} sortKey={col.key} sortConfig={sortConfig} onSort={handleSort} />;
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={visibleColumns.length} />
                            ) : error ? (
                                <TableError colSpan={visibleColumns.length} message={error} onRetry={fetchAuditLogs} />
                            ) : logs.map((log) => (
                                <tr key={log.id} onClick={() => setSelectedLog(log)} className="border-b border-slate-800 hover:bg-slate-800/40 cursor-pointer">
                                    {visibleColumns.map(key => (
                                        <td key={key} className="px-6 py-4">{renderCellContent(log, key)}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 <Pagination 
                    total={totalLogs}
                    page={currentPage}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                 />
            </TableContainer>

            <Drawer
                isOpen={!!selectedLog}
                onClose={() => setSelectedLog(null)}
                title={`日誌詳情: ${selectedLog?.id}`}
                width="w-1/2"
            >
                {selectedLog && (
                    <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-300 overflow-x-auto">
                        <pre>{JSON.stringify(selectedLog, null, 2)}</pre>
                    </div>
                )}
            </Drawer>
            <UnifiedSearchModal
                page="audit-logs"
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onSearch={(newFilters) => {
                    setFilters(newFilters as AuditLogFilters);
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

export default AuditLogsPage;