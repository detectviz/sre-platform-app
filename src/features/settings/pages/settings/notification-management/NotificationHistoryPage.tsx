import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { NotificationHistoryRecord, NotificationChannelType, NotificationHistoryFilters, TableColumn, NotificationStatus } from '@/shared/types';
import Icon from '@/shared/components/Icon';
import TableContainer from '@/shared/components/TableContainer';
import Drawer from '@/shared/components/Drawer';
import Toolbar, { ToolbarButton } from '@/shared/components/Toolbar';
import api from '@/services/api';
import Pagination from '@/shared/components/Pagination';
import TableLoader from '@/shared/components/TableLoader';
import TableError from '@/shared/components/TableError';
import { exportToCsv } from '@/services/export';
import UnifiedSearchModal from '@/shared/components/UnifiedSearchModal';
import { showToast } from '@/services/toast';
import ColumnSettingsModal from '@/shared/components/ColumnSettingsModal';
import { usePageMetadata } from '@/contexts/PageMetadataContext';
import StatusTag from '@/shared/components/StatusTag';
import IconButton from '@/shared/components/IconButton';
import JsonPreview from '@/shared/components/JsonPreview';
import { formatRelativeTime } from '@/shared/utils/time';
import SortableColumnHeaderCell from '@/shared/components/SortableColumnHeaderCell';
import useTableSorting from '@/shared/hooks/useTableSorting';
import QuickFilterBar, { QuickFilterOption } from '@/shared/components/QuickFilterBar';
import { useOptions } from '@/contexts/OptionsContext';

type IconConfig = Record<NotificationChannelType | 'Default', { icon: string; color: string; }>;

const PAGE_IDENTIFIER = 'notification_history';

const STATUS_TONE_MAP: Record<NotificationStatus, 'success' | 'danger' | 'warning' | 'info' | 'neutral'> = {
    sent: 'success',
    failed: 'danger',
    pending: 'info',
};

const DEFAULT_STATUS_DESCRIPTORS: { value: NotificationStatus; label: string }[] = [
    { value: 'sent', label: '已送達' },
    { value: 'failed', label: '失敗' },
    { value: 'pending', label: '處理中' },
];

const DEFAULT_CHANNEL_DESCRIPTORS: { value: NotificationChannelType; label: string }[] = [
    { value: 'email', label: '郵件' },
    { value: 'webhook', label: 'Webhook (通用)' },
    { value: 'slack', label: 'Slack' },
    { value: 'line', label: 'LINE 通知' },
    { value: 'sms', label: '簡訊' },
];

const NotificationHistoryPage: React.FC = () => {
    const [history, setHistory] = useState<NotificationHistoryRecord[]>([]);
    const [allColumns, setAllColumns] = useState<TableColumn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalHistory, setTotalHistory] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [iconConfig, setIconConfig] = useState<IconConfig | null>(null);

    const [selectedRecord, setSelectedRecord] = useState<NotificationHistoryRecord | null>(null);
    const [resendingId, setResendingId] = useState<string | null>(null);
    const [filters, setFilters] = useState<NotificationHistoryFilters>({});
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [isColumnSettingsModalOpen, setIsColumnSettingsModalOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState<NotificationStatus | 'all'>('all');
    const [channelFilter, setChannelFilter] = useState<NotificationChannelType | 'all'>('all');

    const { options } = useOptions();
    const notificationHistoryOptions = options?.notification_history;

    const statusDescriptors = useMemo(
        () => notificationHistoryOptions?.statuses ?? DEFAULT_STATUS_DESCRIPTORS,
        [notificationHistoryOptions?.statuses]
    );

    const channelDescriptors = useMemo(
        () => notificationHistoryOptions?.channel_types ?? DEFAULT_CHANNEL_DESCRIPTORS,
        [notificationHistoryOptions?.channel_types]
    );

    const statusFilterOptions = useMemo<QuickFilterOption[]>(() => [
        { value: 'all', label: '全部' },
        ...statusDescriptors.map(({ value, label }) => ({ value, label })),
    ], [statusDescriptors]);

    const channelFilterOptions = useMemo<QuickFilterOption[]>(() => [
        { value: 'all', label: '全部' },
        ...channelDescriptors.map(({ value, label }) => ({ value, label })),
    ], [channelDescriptors]);

    const statusLabelMap = useMemo(() => {
        const map = {} as Record<NotificationStatus, string>;
        statusDescriptors.forEach(({ value, label }) => {
            map[value] = label;
        });
        return map;
    }, [statusDescriptors]);

    const statusToneMap = STATUS_TONE_MAP;

    const channelTypeLabelMap = useMemo(() => {
        const map = {} as Record<NotificationChannelType, string>;
        channelDescriptors.forEach(({ value, label }) => {
            map[value] = label;
        });
        return map;
    }, [channelDescriptors]);

    const { metadata: pageMetadata } = usePageMetadata();
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.column_config_key;

    useEffect(() => {
        api.get<IconConfig>('/ui/icons-config')
            .then(res => setIconConfig(res.data))
            .catch(err => console.error("Failed to fetch icon config", err));
    }, []);

    const { sortConfig, sortParams, handleSort } = useTableSorting({ defaultSortKey: 'timestamp', defaultSortDirection: 'desc' });

    const fetchHistory = useCallback(async () => {
        if (!pageKey) return;
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                page_size: pageSize,
                ...filters,
                ...sortParams
            };
            const [historyRes, columnConfigRes, allColumnsRes] = await Promise.all([
                api.get<{ items: NotificationHistoryRecord[], total: number }>('/settings/notification-history', { params }),
                api.get<string[]>(`/settings/column-config/${pageKey}`),
                api.get<TableColumn[]>(`/pages/columns/${pageKey}`)
            ]);
            setHistory(historyRes.data.items);
            setTotalHistory(historyRes.data.total);
            if (allColumnsRes.data.length === 0) {
                throw new Error('欄位定義缺失');
            }
            setAllColumns(allColumnsRes.data);
            const resolvedVisibleColumns = columnConfigRes.data.length > 0
                ? columnConfigRes.data
                : allColumnsRes.data.map(c => c.key);
            setVisibleColumns(resolvedVisibleColumns);
        } catch (err) {
            setError('無法獲取通知歷史。');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, filters, pageKey, sortParams]);

    useEffect(() => {
        if (pageKey) {
            fetchHistory();
        }
    }, [fetchHistory, pageKey]);

    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            status: statusFilter === 'all' ? undefined : statusFilter,
            channel_type: channelFilter === 'all' ? undefined : channelFilter,
        }));
        setCurrentPage(1);
    }, [statusFilter, channelFilter]);

    useEffect(() => {
        if (!pageKey) return;
        const interval = setInterval(() => {
            fetchHistory();
        }, 60000);
        return () => clearInterval(interval);
    }, [fetchHistory, pageKey]);

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

    const handleResend = async (recordId: string) => {
        setResendingId(recordId);
        try {
            await api.post(`/settings/notification-history/${recordId}/resend`, {});
            showToast('通知已成功重新發送。', 'success');
            setSelectedRecord(null); // Close drawer on success
            fetchHistory();
        } catch (err) {
            showToast('重新發送通知失敗。', 'error');
        } finally {
            setResendingId(null);
        }
    };

    const getChannelTypeIcon = (type: NotificationChannelType) => {
        const fallback = { icon: 'bell', color: 'text-slate-400' };
        if (!iconConfig) return fallback;
        return iconConfig[type] || iconConfig.Default || fallback;
    };

    const handleExport = () => {
        if (history.length === 0) {
            showToast("沒有可匯出的資料。", "error");
            return;
        }
        exportToCsv({
            filename: `notification-history-${new Date().toISOString().split('T')[0]}.csv`,
            headers: ['id', 'timestamp', 'strategy', 'channel', 'channel_type', 'recipient', 'status', 'content'],
            data: history,
        });
    };

    const renderDrawerExtra = () => {
        if (selectedRecord?.status === 'failed') {
            const isResending = resendingId === selectedRecord.id;
            return (
                <button
                    onClick={() => handleResend(selectedRecord.id)}
                    disabled={isResending}
                    className="flex items-center text-sm px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 bg-slate-700/50 border border-slate-600/80 hover:bg-slate-700/80 hover:border-slate-500/80 focus:ring-slate-500"
                >
                    {isResending ? (
                        <>
                            <Icon name="loader-circle" className="w-4 h-4 mr-2 animate-spin" />
                            重送中...
                        </>
                    ) : (
                        <>
                            <Icon name="send" className="w-4 h-4 mr-2" />
                            重新發送
                        </>
                    )}
                </button>
            );
        }
        return <span className="text-xs text-slate-500">無可執行動作</span>;
    };

    const renderCellContent = (record: NotificationHistoryRecord, columnKey: string) => {
        const { icon, color } = getChannelTypeIcon(record.channel_type);
        switch (columnKey) {
            case 'timestamp':
                return (
                    <div className="flex items-center">
                        <span className="font-medium text-white">{formatRelativeTime(record.timestamp)}</span>
                    </div>
                );
            case 'strategy':
                return (
                    <div className="flex flex-col">
                        <span className="font-semibold text-white">{record.strategy}</span>
                        {record.incident_id && <span className="text-xs text-slate-500">事件 ID：{record.incident_id}</span>}
                    </div>
                );
            case 'channel':
                return (
                    <span className={`flex items-center font-semibold ${color}`}>
                        <Icon name={icon} className="w-4 h-4 mr-2" />
                        {record.channel}
                    </span>
                );
            case 'recipient':
                return (
                    <div className="flex items-center">
                        <span className="text-sm text-white">{record.recipient}</span>
                    </div>
                );
            case 'status':
                return (
                    <StatusTag label={statusLabelMap[record.status]} tone={statusToneMap[record.status]} dense />
                );
            case 'content':
                return (
                    <span className="truncate max-w-xs block" title={record.content}>{record.content}</span>
                );
            default: return <span className="text-slate-500">--</span>;
        }
    };


    return (
        <div className="h-full flex flex-col">
            <Toolbar
                leftActions={<ToolbarButton icon="search" text="搜尋和篩選" onClick={() => setIsSearchModalOpen(true)} />}
                rightActions={
                    <>
                        <ToolbarButton icon="settings-2" text="欄位設定" onClick={() => setIsColumnSettingsModalOpen(true)} />
                        <ToolbarButton icon="refresh-cw" text="重新整理" onClick={fetchHistory} />
                        <ToolbarButton icon="download" text="匯出" onClick={handleExport} />
                    </>
                }
            />

            <div className="px-6 py-3 space-y-3">
                <QuickFilterBar
                    label="狀態"
                    options={statusFilterOptions}
                    mode="single"
                    value={[statusFilter]}
                    onChange={(values) => {
                        const next = values[0];
                        if (!next || next === 'all') {
                            setStatusFilter('all');
                            return;
                        }
                        setStatusFilter(next as NotificationStatus);
                    }}
                />
                <QuickFilterBar
                    label="管道"
                    options={channelFilterOptions}
                    mode="single"
                    value={[channelFilter]}
                    onChange={(values) => {
                        const next = values[0];
                        if (!next || next === 'all') {
                            setChannelFilter('all');
                            return;
                        }
                        setChannelFilter(next as NotificationChannelType);
                    }}
                />
            </div>
            <TableContainer>
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0 z-10">
                            <tr>
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
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={visibleColumns.length} />
                            ) : error ? (
                                <TableError colSpan={visibleColumns.length} message={error} onRetry={fetchHistory} />
                            ) : history.length === 0 ? (
                                <tr>
                                    <td colSpan={visibleColumns.length} className="px-6 py-12 text-center text-slate-400">
                                        <div className="space-y-3">
                                            <p className="text-sm">目前沒有符合條件的通知紀錄，可調整篩選條件或稍後再試。</p>
                                            <ToolbarButton icon="refresh-cw" text="重新整理" onClick={fetchHistory} />
                                        </div>
                                    </td>
                                </tr>
                            ) : history.map((record) => (
                                <tr key={record.id} onClick={() => setSelectedRecord(record)} className="border-b border-slate-800 hover:bg-slate-800/40 cursor-pointer">
                                    {visibleColumns.map(key => (
                                        <td key={key} className="px-6 py-4 align-top">{renderCellContent(record, key)}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    total={totalHistory}
                    page={currentPage}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                />
            </TableContainer>

            <Drawer
                isOpen={!!selectedRecord}
                onClose={() => setSelectedRecord(null)}
                title={`通知詳情：${selectedRecord?.id ?? ''}`}
                width="w-1/2"
                extra={renderDrawerExtra()}
            >
                {selectedRecord && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border border-slate-700/70 rounded-lg p-4 bg-slate-900/60 space-y-2">
                                <p className="text-xs text-slate-500">策略</p>
                                <p className="text-sm text-white">{selectedRecord.strategy}</p>
                                {selectedRecord.incident_id && <p className="text-xs text-slate-500">事件 ID：{selectedRecord.incident_id}</p>}
                            </div>
                            <div className="border border-slate-700/70 rounded-lg p-4 bg-slate-900/60 space-y-2">
                                <p className="text-xs text-slate-500">發送時間</p>
                                <p className="text-sm text-white">{selectedRecord.timestamp}</p>
                                <p className="text-xs text-slate-500">{formatRelativeTime(selectedRecord.timestamp)}</p>
                            </div>
                            <div className="border border-slate-700/70 rounded-lg p-4 bg-slate-900/60 space-y-2">
                                <p className="text-xs text-slate-500">管道</p>
                                <p className="text-sm text-white">{selectedRecord.channel} ({selectedRecord.channel_type})</p>
                                <p className="text-xs text-slate-500">收件人：{selectedRecord.recipient}</p>
                            </div>
                            <div className="border border-slate-700/70 rounded-lg p-4 bg-slate-900/60 space-y-2">
                                <p className="text-xs text-slate-500">狀態</p>
                                <StatusTag label={statusLabelMap[selectedRecord.status]} tone={statusToneMap[selectedRecord.status]} />
                            </div>
                        </div>
                        <JsonPreview data={selectedRecord} title="完整資料 (JSON)" />
                    </div>
                )}
            </Drawer>
            <UnifiedSearchModal
                page="notification-history"
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onSearch={(newFilters) => {
                    setFilters(newFilters as NotificationHistoryFilters);
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

export default NotificationHistoryPage;