import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { NotificationHistoryRecord, NotificationChannelType, NotificationHistoryOptions } from '../../../types';
import Icon from '../../../components/Icon';
import TableContainer from '../../../components/TableContainer';
import Drawer from '../../../components/Drawer';
import Toolbar, { ToolbarButton } from '../../../components/Toolbar';
import PlaceholderModal from '../../../components/PlaceholderModal';
import api from '../../../services/api';
import Pagination from '../../../components/Pagination';
import TableLoader from '../../../components/TableLoader';
import TableError from '../../../components/TableError';
import { exportToCsv } from '../../../services/export';

type IconConfig = Record<NotificationChannelType | 'Default', { icon: string; color: string; }>;

const NotificationHistoryPage: React.FC = () => {
    const [history, setHistory] = useState<NotificationHistoryRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalHistory, setTotalHistory] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [options, setOptions] = useState<NotificationHistoryOptions | null>(null);
    const [iconConfig, setIconConfig] = useState<IconConfig | null>(null);

    const [selectedRecord, setSelectedRecord] = useState<NotificationHistoryRecord | null>(null);
    const [resendingId, setResendingId] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        keyword: '',
        status: '',
        channelType: '',
        startDate: '',
        endDate: '',
    });
    const [isPlaceholderModalOpen, setIsPlaceholderModalOpen] = useState(false);
    const [modalFeatureName, setModalFeatureName] = useState('');

    const showPlaceholderModal = (featureName: string) => {
        setModalFeatureName(featureName);
        setIsPlaceholderModalOpen(true);
    };
    
    useEffect(() => {
        Promise.all([
            api.get<NotificationHistoryOptions>('/settings/notification-history/options'),
            api.get<IconConfig>('/ui/icons-config')
        ]).then(([optionsRes, iconsRes]) => {
            setOptions(optionsRes.data);
            setIconConfig(iconsRes.data);
        }).catch(err => console.error("Failed to fetch notification history options or icon config", err));
    }, []);

    const fetchHistory = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                page_size: pageSize,
                ...filters
            };
            const { data } = await api.get<{ items: NotificationHistoryRecord[], total: number }>('/settings/notification-history', { params });
            setHistory(data.items);
            setTotalHistory(data.total);
        } catch (err) {
            setError('無法獲取通知歷史。');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, filters]);
    
    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleResend = async (recordId: string) => {
        setResendingId(recordId);
        try {
            await api.post(`/settings/notification-history/${recordId}/resend`, {});
            // Re-fetch to see the new successful record
            fetchHistory();
        } catch(err) {
            alert('Failed to resend notification.');
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
            alert("沒有可匯出的資料。");
            return;
        }
        exportToCsv({
            filename: `notification-history-${new Date().toISOString().split('T')[0]}.csv`,
            headers: ['id', 'timestamp', 'strategy', 'channel', 'channelType', 'recipient', 'status', 'content'],
            data: history,
        });
    };
    
    return (
        <div className="h-full flex flex-col">
            <Toolbar
                leftActions={
                    <div className="flex items-center space-x-2 flex-grow">
                        <div className="relative flex-grow">
                            <Icon name="search" className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="搜尋策略、內容..."
                                value={filters.keyword}
                                onChange={e => setFilters({...filters, keyword: e.target.value})}
                                className="w-full bg-slate-800/80 border border-slate-700 rounded-md pl-9 pr-4 py-1.5 text-sm"
                            />
                        </div>
                        <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm">
                            <option value="">所有狀態</option>
                            {options?.statuses?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                        <select value={filters.channelType} onChange={e => setFilters({...filters, channelType: e.target.value})} className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm">
                            <option value="">所有管道</option>
                            {options?.channelTypes?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                        <input type="datetime-local" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm" />
                        <span className="text-slate-400">to</span>
                        <input type="datetime-local" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm" />
                    </div>
                }
                rightActions={<ToolbarButton icon="download" text="匯出" onClick={handleExport} />}
            />
            <TableContainer>
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="px-6 py-3">時間</th>
                                <th scope="col" className="px-6 py-3">策略</th>
                                <th scope="col" className="px-6 py-3">管道</th>
                                <th scope="col" className="px-6 py-3">接收者</th>
                                <th scope="col" className="px-6 py-3">狀態</th>
                                <th scope="col" className="px-6 py-3">內容</th>
                                <th scope="col" className="px-6 py-3 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={7} />
                            ) : error ? (
                                <TableError colSpan={7} message={error} onRetry={fetchHistory} />
                            ) : history.map((record) => {
                                 const { icon, color } = getChannelTypeIcon(record.channelType);
                                return (
                                <tr key={record.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                                    <td className="px-6 py-4">{record.timestamp}</td>
                                    <td className="px-6 py-4">{record.strategy}</td>
                                    <td className="px-6 py-4">
                                        <span className={`flex items-center font-semibold ${color}`}>
                                            <Icon name={icon} className="w-4 h-4 mr-2" />
                                            {record.channel}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{record.recipient}</td>
                                    <td className="px-6 py-4">
                                        <span className={`font-semibold ${record.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                            {record.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 truncate max-w-xs">{record.content}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center space-x-1">
                                            <button onClick={() => setSelectedRecord(record)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="查看詳情"><Icon name="eye" className="w-4 h-4" /></button>
                                            {record.status === 'failed' && (
                                                <button 
                                                    onClick={() => handleResend(record.id)} 
                                                    disabled={resendingId === record.id}
                                                    className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-wait" 
                                                    title="重新發送"
                                                >
                                                    {resendingId === record.id ? <Icon name="loader-circle" className="w-4 h-4 animate-spin" /> : <Icon name="send" className="w-4 h-4" />}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )})}
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
            >
                {selectedRecord && (
                    <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-300 overflow-x-auto">
                        <pre>{JSON.stringify(selectedRecord, null, 2)}</pre>
                    </div>
                )}
            </Drawer>
            <PlaceholderModal
                isOpen={isPlaceholderModalOpen}
                onClose={() => setIsPlaceholderModalOpen(false)}
                featureName={modalFeatureName}
            />
        </div>
    );
};

export default NotificationHistoryPage;