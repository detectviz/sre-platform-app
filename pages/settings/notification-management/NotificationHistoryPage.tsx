import React, { useState, useMemo, useEffect, useCallback } from 'react';
// FIX: Import TableColumn from types.ts
import { NotificationHistoryRecord, NotificationChannelType, NotificationHistoryFilters, TableColumn } from '../../../types';
import Icon from '../../../components/Icon';
import TableContainer from '../../../components/TableContainer';
import Drawer from '../../../components/Drawer';
import Toolbar, { ToolbarButton } from '../../../components/Toolbar';
import api from '../../../services/api';
import Pagination from '../../../components/Pagination';
import TableLoader from '../../../components/TableLoader';
import TableError from '../../../components/TableError';
import { exportToCsv } from '../../../services/export';
import UnifiedSearchModal from '../../../components/UnifiedSearchModal';
import { showToast } from '../../../services/toast';
// FIX: Import TableColumn from types.ts, not from ColumnSettingsModal
import ColumnSettingsModal from '../../../components/ColumnSettingsModal';
import { usePageMetadata } from '../../../contexts/PageMetadataContext';

type IconConfig = Record<NotificationChannelType | 'Default', { icon: string; color: string; }>;

const ALL_COLUMNS: TableColumn[] = [
    { key: 'timestamp', label: '時間' },
    { key: 'strategy', label: '策略' },
    { key: 'channel', label: '管道' },
    { key: 'recipient', label: '接收者' },
    { key: 'status', label: '狀態' },
    { key: 'content', label: '內容' },
];
const PAGE_IDENTIFIER = 'notification_history';


const NotificationHistoryPage: React.FC = () => {
    const [history, setHistory] = useState<NotificationHistoryRecord[]>([]);
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
    
    const { metadata: pageMetadata } = usePageMetadata();
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.columnConfigKey;
    
    useEffect(() => {
        api.get<IconConfig>('/ui/icons-config')
            .then(res => setIconConfig(res.data))
            .catch(err => console.error("Failed to fetch icon config", err));
    }, []);

    const fetchHistory = useCallback(async () => {
        if (!pageKey) return;
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                page_size: pageSize,
                ...filters
            };
            const [historyRes, columnsRes] = await Promise.all([
                api.get<{ items: NotificationHistoryRecord[], total: number }>('/settings/notification-history', { params }),
                api.get<string[]>(`/settings/column-config/${pageKey}`)
            ]);
            setHistory(historyRes.data.items);
            setTotalHistory(historyRes.data.total);
            setVisibleColumns(columnsRes.data.length > 0 ? columnsRes.data : ALL_COLUMNS.map(c => c.key));
        } catch (err) {
            setError('無法獲取通知歷史。');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, filters, pageKey]);
    
    useEffect(() => {
        if (pageKey) {
            fetchHistory();
        }
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
        } catch(err) {
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
            headers: ['id', 'timestamp', 'strategy', 'channel', 'channelType', 'recipient', 'status', 'content'],
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
        return null;
    };
    
    const renderCellContent = (record: NotificationHistoryRecord, columnKey: string) => {
        const { icon, color } = getChannelTypeIcon(record.channelType);
        switch (columnKey) {
            case 'timestamp': return record.timestamp;
            case 'strategy': return record.strategy;
            case 'channel':
                return (
                    <span className={`flex items-center font-semibold ${color}`}>
                        <Icon name={icon} className="w-4 h-4 mr-2" />
                        {record.channel}
                    </span>
                );
            case 'recipient': return record.recipient;
            case 'status':
                return (
                    <span className={`font-semibold ${record.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                        {record.status.toUpperCase()}
                    </span>
                );
            case 'content': return <span className="truncate max-w-xs block">{record.content}</span>;
            default: return null;
        }
    };


    return (
        <div className="h-full flex flex-col">
            <Toolbar
                leftActions={<ToolbarButton icon="search" text="搜尋和篩選" onClick={() => setIsSearchModalOpen(true)} />}
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
                                {visibleColumns.map(key => (
                                    <th key={key} scope="col" className="px-6 py-3">{ALL_COLUMNS.find(c => c.key === key)?.label || key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={visibleColumns.length} />
                            ) : error ? (
                                <TableError colSpan={visibleColumns.length} message={error} onRetry={fetchHistory} />
                            ) : history.map((record) => (
                                <tr key={record.id} onClick={() => setSelectedRecord(record)} className="border-b border-slate-800 hover:bg-slate-800/40 cursor-pointer">
                                    {visibleColumns.map(key => (
                                        <td key={key} className="px-6 py-4">{renderCellContent(record, key)}</td>
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
                title={`通知詳情: ${selectedRecord?.id}`}
                width="w-1/2"
                extra={renderDrawerExtra()}
            >
                {selectedRecord && (
                    <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-300 overflow-x-auto">
                        <pre>{JSON.stringify(selectedRecord, null, 2)}</pre>
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
                allColumns={ALL_COLUMNS}
                visibleColumnKeys={visibleColumns}
            />
        </div>
    );
};

export default NotificationHistoryPage;