import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { NotificationChannel, NotificationChannelType, NotificationChannelFilters, TableColumn } from '../../../types';
import Icon from '../../../components/Icon';
import Toolbar, { ToolbarButton } from '../../../components/Toolbar';
import TableContainer from '../../../components/TableContainer';
import NotificationChannelEditModal from '../../../components/NotificationChannelEditModal';
import Modal from '../../../components/Modal';
import Pagination from '../../../components/Pagination';
import api from '../../../services/api';
import TableLoader from '../../../components/TableLoader';
import TableError from '../../../components/TableError';
import UnifiedSearchModal from '../../../components/UnifiedSearchModal';
import ColumnSettingsModal from '../../../components/ColumnSettingsModal';
import { usePageMetadata } from '../../../contexts/PageMetadataContext';
import { useOptions } from '../../../contexts/OptionsContext';
import { showToast } from '../../../services/toast';
import StatusTag from '../../../components/StatusTag';
import IconButton from '../../../components/IconButton';
import { formatRelativeTime } from '../../../utils/time';

type IconConfig = Record<NotificationChannelType | 'Default', { icon: string; color: string; }>;

const PAGE_IDENTIFIER = 'notification_channels';


const NotificationChannelPage: React.FC = () => {
    const [channels, setChannels] = useState<NotificationChannel[]>([]);
    const [allColumns, setAllColumns] = useState<TableColumn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [iconConfig, setIconConfig] = useState<IconConfig | null>(null);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingChannel, setEditingChannel] = useState<NotificationChannel | null>(null);
    const [filters, setFilters] = useState<NotificationChannelFilters>({});
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingChannel, setDeletingChannel] = useState<NotificationChannel | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [isColumnSettingsModalOpen, setIsColumnSettingsModalOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

    const { metadata: pageMetadata } = usePageMetadata();
    const { options } = useOptions();
    const notificationChannelOptions = options?.notification_channels;
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.column_config_key;

    const fetchChannels = useCallback(async () => {
        if (!pageKey) return;
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                page_size: pageSize,
                ...filters,
            };

            const [channelsRes, iconsRes, columnConfigRes, allColumnsRes] = await Promise.all([
                api.get<{ items: NotificationChannel[], total: number }>('/settings/notification-channels', { params }),
                api.get<IconConfig>('/ui/icons-config'),
                api.get<string[]>(`/settings/column-config/${pageKey}`),
                api.get<TableColumn[]>(`/pages/columns/${pageKey}`)
            ]);
            setChannels(channelsRes.data.items);
            setTotal(channelsRes.data.total);
            setIconConfig(iconsRes.data);
            if (allColumnsRes.data.length === 0) {
                throw new Error('欄位定義缺失');
            }
            setAllColumns(allColumnsRes.data);
            const resolvedVisibleColumns = columnConfigRes.data.length > 0
                ? columnConfigRes.data
                : allColumnsRes.data.map(c => c.key);
            setVisibleColumns(resolvedVisibleColumns);
        } catch (err) {
            setError('無法獲取通知管道。');
        } finally {
            setIsLoading(false);
        }
    }, [filters, pageKey, currentPage, pageSize]);

    useEffect(() => {
        if (pageKey) {
            fetchChannels();
        }
    }, [fetchChannels, pageKey]);

    useEffect(() => {
        if (!pageKey) return;
        const interval = setInterval(() => {
            fetchChannels();
        }, 30000);
        return () => clearInterval(interval);
    }, [fetchChannels, pageKey]);

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

    const handleNewChannel = () => {
        setEditingChannel(null);
        setIsModalOpen(true);
    };

    const handleEditChannel = (channel: NotificationChannel) => {
        setEditingChannel(channel);
        setIsModalOpen(true);
    };

    const handleSaveChannel = async (channel: NotificationChannel) => {
        try {
            if (editingChannel) {
                await api.patch(`/settings/notification-channels/${channel.id}`, channel);
            } else {
                await api.post('/settings/notification-channels', channel);
                setCurrentPage(1); // Reset to first page when adding new item
            }
            fetchChannels();
        } catch (err) {
            showToast('儲存通知管道失敗，請稍後再試。', 'error');
        } finally {
            setIsModalOpen(false);
        }
    };

    const handleDeleteClick = (channel: NotificationChannel) => {
        setDeletingChannel(channel);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (deletingChannel) {
            try {
                await api.del(`/settings/notification-channels/${deletingChannel.id}`);
                // Reset to first page if current page becomes empty
                if (channels.length === 1 && currentPage > 1) {
                    setCurrentPage(1);
                }
                fetchChannels();
            } catch (err) {
                showToast('刪除通知管道失敗，請稍後再試。', 'error');
            } finally {
                setIsDeleteModalOpen(false);
                setDeletingChannel(null);
            }
        }
    };

    const handleTestChannel = async (channelId: string) => {
        try {
            await api.post(`/settings/notification-channels/${channelId}/test`, {});
            // Optimistically update UI to 'pending'
            setChannels(prev => prev.map(c => c.id === channelId ? { ...c, last_test_result: 'pending' } : c));
            // Re-fetch after a delay to get the final result
            setTimeout(fetchChannels, 2000);
        } catch (err) {
            showToast('啟動測試通知失敗，請稍後再試。', 'error');
        }
    };

    const handleToggleEnable = async (channel: NotificationChannel) => {
        try {
            await api.patch(`/settings/notification-channels/${channel.id}`, { ...channel, enabled: !channel.enabled });
            fetchChannels();
        } catch (err) {
            showToast('切換通知管道狀態失敗，請稍後再試。', 'error');
        }
    };

    const getChannelTypeIcon = (type: NotificationChannelType) => {
        const fallback = { icon: 'bell', color: 'text-slate-400' };
        if (!iconConfig) return fallback;
        return iconConfig[type] || iconConfig.Default || fallback;
    };

    const getTestResultTone = (status: NotificationChannel['last_test_result']) => {
        switch (status) {
            case 'success':
                return 'success';
            case 'failed':
                return 'danger';
            case 'not_tested':
            default:
                return 'neutral';
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedIds(e.target.checked ? channels.map(c => c.id) : []);
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        setSelectedIds(prev => e.target.checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id));
    };

    const isAllSelected = channels.length > 0 && selectedIds.length === channels.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < channels.length;

    const handleBatchAction = async (action: 'enable' | 'disable' | 'delete') => {
        try {
            await api.post('/settings/notification-channels/batch-actions', { action, ids: selectedIds });
            fetchChannels();
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

    const renderCellContent = (channel: NotificationChannel, columnKey: string) => {
        const { icon, color } = getChannelTypeIcon(channel.type);
        switch (columnKey) {
            case 'enabled':
                return (
                    <label className="relative inline-flex items-center cursor-pointer" aria-label={channel.enabled ? '停用管道' : '啟用管道'}>
                        <input type="checkbox" checked={channel.enabled} className="sr-only peer" onChange={() => handleToggleEnable(channel)} />
                        <div className="w-12 h-6 bg-slate-700 rounded-full peer peer-checked:bg-sky-600 transition-colors">
                            <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-[24px]"></span>
                        </div>
                    </label>
                );
            case 'name': return <span className="font-medium text-white">{channel.name}</span>;
            case 'type': {
                const typeDescriptor = notificationChannelOptions?.channel_types.find(t => t.value === channel.type);
                const pillClass = typeDescriptor?.class_name || 'bg-slate-800/60 border border-slate-600 text-slate-200';
                const label = typeDescriptor?.label || channel.type;
                return (
                    <span className={`flex items-center font-semibold px-2 py-1 text-xs rounded-full ${pillClass}`}>
                        <Icon name={icon} className="w-3 h-3 mr-1.5" />
                        {label}
                    </span>
                );
            }
            case 'last_test_result':
                return (
                    <StatusTag
                        label={channel.last_test_result === 'success' ? '測試成功' : channel.last_test_result === 'failed' ? '測試失敗' : '尚未測試'}
                        tone={getTestResultTone(channel.last_test_result)}
                        dense
                    />
                );
            case 'last_tested_at':
                return channel.last_tested_at ? (
                    <div className="flex flex-col">
                        <span className="font-medium text-white">{formatRelativeTime(channel.last_tested_at)}</span>
                        <span className="text-xs text-slate-500">{channel.last_tested_at}</span>
                    </div>
                ) : <span className="text-slate-500">尚未測試</span>;
            default:
                return <span className="text-slate-500">--</span>;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <Toolbar
                leftActions={leftActions}
                rightActions={
                    <>
                        <ToolbarButton icon="settings-2" text="欄位設定" onClick={() => setIsColumnSettingsModalOpen(true)} />
                        <ToolbarButton icon="refresh-cw" text="重新整理" onClick={fetchChannels} />
                        <ToolbarButton icon="plus" text="新增管道" primary onClick={handleNewChannel} />
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
                                <TableError colSpan={visibleColumns.length + 2} message={error} onRetry={fetchChannels} />
                            ) : channels.length === 0 ? (
                                <tr>
                                    <td colSpan={visibleColumns.length + 2} className="px-6 py-12 text-center text-slate-400">
                                        <div className="space-y-3">
                                            <p className="text-sm">尚未建立任何通知管道，請點擊「新增管道」新增電子郵件、Slack 或其他整合。</p>
                                            <ToolbarButton icon="plus" text="新增管道" primary onClick={handleNewChannel} />
                                        </div>
                                    </td>
                                </tr>
                            ) : channels.map((channel) => (
                                <tr key={channel.id} className={`border-b border-slate-800 ${selectedIds.includes(channel.id) ? 'bg-sky-900/50' : 'hover:bg-slate-800/40'}`}>
                                    <td className="p-4 w-12">
                                        <input type="checkbox" className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600"
                                            checked={selectedIds.includes(channel.id)} onChange={(e) => handleSelectOne(e, channel.id)} />
                                    </td>
                                    {visibleColumns.map(key => (
                                        <td key={key} className="px-6 py-4 align-top">{renderCellContent(channel, key)}</td>
                                    ))}
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <IconButton icon="refresh-cw" label="測試管道" tooltip="發送測試通知" onClick={() => handleTestChannel(channel.id)} size="sm" />
                                            <IconButton icon="edit-3" label="編輯管道" tooltip="編輯管道" onClick={() => handleEditChannel(channel)} size="sm" />
                                            <IconButton icon="trash-2" label="刪除管道" tooltip="刪除管道" tone="danger" onClick={() => handleDeleteClick(channel)} size="sm" />
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
            {isModalOpen &&
                <NotificationChannelEditModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveChannel}
                    channel={editingChannel}
                />
            }
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
                <p>您確定要刪除管道 <strong className="text-amber-400">{deletingChannel?.name}</strong> 嗎？</p>
                <p className="mt-2 text-slate-400">此操作無法復原。關聯的通知策略可能會受到影響。</p>
            </Modal>
            <UnifiedSearchModal
                page="notification-channels"
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onSearch={(newFilters) => {
                    setFilters(newFilters as NotificationChannelFilters);
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

export default NotificationChannelPage;