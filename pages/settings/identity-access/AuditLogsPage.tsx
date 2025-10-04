import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AuditLog, AuditLogFilters, TableColumn } from '../../../types';
import TableContainer from '../../../components/TableContainer';
import Drawer from '../../../components/Drawer';
import Toolbar, { ToolbarButton } from '../../../components/Toolbar';
import api from '../../../services/api';
import Pagination from '../../../components/Pagination';
import TableLoader from '../../../components/TableLoader';
import TableError from '../../../components/TableError';
import { exportToCsv } from '../../../services/export';
import UnifiedSearchModal from '../../../components/UnifiedSearchModal';
import ColumnSettingsModal from '../../../components/ColumnSettingsModal';
import { usePageMetadata } from '../../../contexts/PageMetadataContext';
import { showToast } from '../../../services/toast';
import SortableHeader from '../../../components/SortableHeader';
import { useOptions } from '../../../contexts/OptionsContext';
import StatusTag from '../../../components/StatusTag';
import JsonPreview from '../../../components/JsonPreview';
import { formatRelativeTime } from '../../../utils/time';
import useTableSorting from '../../../hooks/useTableSorting';

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
    
    const { metadata: pageMetadata } = usePageMetadata();
    const { options } = useOptions();
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.column_config_key;

    const actionLabelMap = useMemo(() => {
        const baseMap: Record<string, string> = {
            LOGIN_SUCCESS: '登入成功',
            LOGIN_FAILURE: '登入失敗',
            LOGOUT: '登出',
            ROLE_UPDATED: '角色更新',
            PERMISSION_CHANGED: '權限調整',
            USER_CREATED: '新增使用者',
            USER_DELETED: '刪除使用者',
        };
        options?.audit_logs?.action_types.forEach(action => {
            if (!baseMap[action]) {
                baseMap[action] = action.replace(/_/g, ' ').toUpperCase();
            }
        });
        return baseMap;
    }, [options?.audit_logs?.action_types]);

    const resultToneMap: Record<string, 'success' | 'danger' | 'warning' | 'info' | 'neutral'> = {
        success: 'success',
        failed: 'danger',
        failure: 'danger',
        error: 'danger',
        partial: 'warning',
        pending: 'info',
    };

    const getActionLabel = (action: string) => actionLabelMap[action] || action;

    const getResultLabel = (result?: string | null) => {
        switch (result) {
            case 'success':
                return '成功';
            case 'failure':
            case 'failed':
            case 'error':
                return '失敗';
            case 'partial':
                return '部分完成';
            case 'pending':
                return '處理中';
            case undefined:
            case null:
                return '未知結果';
            default: {
                const normalized = result.replace?.(/_/g, ' ') || '';
                return normalized ? normalized.toUpperCase() : '未知結果';
            }
        }
    };

    const resolveResultTone = (result?: string | null): 'success' | 'danger' | 'warning' | 'info' | 'neutral' => {
        if (!result) {
            return 'neutral';
        }
        return resultToneMap[result] || 'neutral';
    };

    const formatTimestamp = (timestamp?: string) => {
        if (!timestamp) {
            return { exact: '--', relative: '--' };
        }
        return {
            exact: timestamp,
            relative: formatRelativeTime(timestamp),
        };
    };

    const selectedLogTimestamp = useMemo(
        () => formatTimestamp(selectedLog?.timestamp),
        [selectedLog?.timestamp]
    );

    const { sortConfig, sortParams, handleSort } = useTableSorting({ defaultSortKey: 'timestamp', defaultSortDirection: 'desc' });

    const fetchAuditLogs = useCallback(async () => {
        if (!pageKey) return;
        setIsLoading(true);
        setError(null);
        try {
            const params: any = {
                page: currentPage,
                page_size: pageSize,
                ...filters,
                ...sortParams
            };
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
    }, [currentPage, pageSize, filters, pageKey, sortParams]);

    useEffect(() => {
        if (pageKey) {
            fetchAuditLogs();
        }
    }, [fetchAuditLogs, pageKey]);
    
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
            showToast('沒有可匯出的資料。', 'warning');
            return;
        }
        exportToCsv({
            filename: `audit-logs-${new Date().toISOString().split('T')[0]}.csv`,
            headers: ['id', 'timestamp', 'user_name', 'action', 'target_type', 'target_name', 'result', 'ip'],
            data: logs.map(log => ({
                id: log.id,
                timestamp: log.timestamp ?? '',
                user_name: log.user?.name ?? '未知使用者',
                action: log.action,
                target_type: log.target?.type ?? '未指定',
                target_name: log.target?.name ?? '未提供',
                result: log.result ?? '未提供',
                ip: log.ip ?? '未提供',
            })),
        });
    };

    const renderCellContent = (log: AuditLog, columnKey: string) => {
        switch (columnKey) {
            case 'timestamp': {
                const timestampParts = formatTimestamp(log.timestamp);
                return (
                    <div className="flex flex-col">
                        <span className="font-medium text-white">{timestampParts.relative}</span>
                        <span className="text-xs text-slate-500">{timestampParts.exact}</span>
                    </div>
                );
            }
            case 'user': {
                const userName = log.user?.name ?? '未知使用者';
                const userId = log.user?.id ?? '—';
                return (
                    <div className="flex flex-col">
                        <span className="font-semibold text-white">{userName}</span>
                        <span className="text-xs text-slate-500">ID: {userId}</span>
                    </div>
                );
            }
            case 'action':
                return <StatusTag label={getActionLabel(log.action)} tone="info" dense tooltip={log.action} />;
            case 'target': {
                const targetName = log.target?.name ?? '未提供';
                const targetType = log.target?.type ?? '未指定';
                return (
                    <div className="space-y-0.5">
                        <span className="font-medium text-white">{targetName}</span>
                        <span className="text-xs text-slate-500">類型：{targetType}</span>
                    </div>
                );
            }
            case 'result':
                return (
                    <StatusTag
                        label={getResultLabel(log.result)}
                        tone={resolveResultTone(log.result)}
                        dense
                        tooltip={log.result ?? '未提供'}
                    />
                );
            case 'ip':
                return (
                    <code className="text-xs text-slate-200 bg-slate-800/60 px-2 py-1 rounded-md">
                        {log.ip ?? '—'}
                    </code>
                );
            default:
                return <span className="text-slate-500">--</span>;
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
                            {isLoading ? (
                                <TableLoader colSpan={visibleColumns.length} />
                            ) : error ? (
                                <TableError colSpan={visibleColumns.length} message={error} onRetry={fetchAuditLogs} />
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={visibleColumns.length} className="px-6 py-12 text-center text-slate-400">
                                        <div className="space-y-3">
                                            <p className="text-sm">目前尚無審計紀錄，請調整篩選條件或稍後再試。</p>
                                            <ToolbarButton icon="refresh" text="重新整理" onClick={fetchAuditLogs} />
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.map((log) => (
                                <tr key={log.id} onClick={() => setSelectedLog(log)} className="border-b border-slate-800 hover:bg-slate-800/40 cursor-pointer">
                                    {visibleColumns.map(key => (
                                        <td key={key} className="px-6 py-4 align-top">{renderCellContent(log, key)}</td>
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
                title={`審計詳情：${selectedLog?.id ?? ''}`}
                width="w-1/2"
            >
                {selectedLog && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border border-slate-700/70 rounded-lg p-4 bg-slate-900/60">
                                <p className="text-xs text-slate-500">動作</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <StatusTag label={getActionLabel(selectedLog.action)} tone="info" />
                                    <StatusTag label={getResultLabel(selectedLog.result)} tone={resolveResultTone(selectedLog.result)} />
                                </div>
                            </div>
                            <div className="border border-slate-700/70 rounded-lg p-4 bg-slate-900/60">
                                <p className="text-xs text-slate-500">觸發時間</p>
                                <p className="mt-2 text-sm text-white">{selectedLogTimestamp.exact}</p>
                                <p className="text-xs text-slate-500">{selectedLogTimestamp.relative}</p>
                            </div>
                            <div className="border border-slate-700/70 rounded-lg p-4 bg-slate-900/60">
                                <p className="text-xs text-slate-500">操作人員</p>
                                <p className="mt-2 text-sm text-white">{selectedLog.user?.name ?? '未知使用者'}</p>
                                <code className="text-xs text-slate-200 bg-slate-800/60 px-2 py-1 rounded-md">ID: {selectedLog.user?.id ?? '—'}</code>
                            </div>
                            <div className="border border-slate-700/70 rounded-lg p-4 bg-slate-900/60 space-y-1">
                                <p className="text-xs text-slate-500">目標</p>
                                <p className="text-sm text-white">{selectedLog.target?.name ?? '未提供'}</p>
                                <span className="text-xs text-slate-500">類型：{selectedLog.target?.type ?? '未指定'}</span>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span>來源 IP：</span>
                                    <code className="bg-slate-800/60 px-2 py-1 rounded-md">{selectedLog.ip ?? '—'}</code>
                                </div>
                            </div>
                        </div>
                        <JsonPreview data={selectedLog.details ?? {}} title="詳細內容 (JSON)" />
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