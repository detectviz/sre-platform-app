import React, { useState, useMemo, useEffect, useCallback } from 'react';
// FIX: Import TableColumn from types.ts
import { NotificationChannel, NotificationChannelType, NotificationChannelFilters, TableColumn } from '../../../types';
import Icon from '../../../components/Icon';
import Toolbar, { ToolbarButton } from '../../../components/Toolbar';
import TableContainer from '../../../components/TableContainer';
import NotificationChannelEditModal from '../../../components/NotificationChannelEditModal';
import Modal from '../../../components/Modal';
import api from '../../../services/api';
import TableLoader from '../../../components/TableLoader';
import TableError from '../../../components/TableError';
import UnifiedSearchModal from '../../../components/UnifiedSearchModal';
// FIX: Import TableColumn from types.ts, not from ColumnSettingsModal
import ColumnSettingsModal from '../../../components/ColumnSettingsModal';
import { usePageMetadata } from '../../../contexts/PageMetadataContext';
import { showToast } from '../../../services/toast';

type IconConfig = Record<NotificationChannelType | 'Default', { icon: string; color: string; }>;

const PAGE_IDENTIFIER = 'notification_channels';


const NotificationChannelPage: React.FC = () => {
    const [channels, setChannels] = useState<NotificationChannel[]>([]);
    const [allColumns, setAllColumns] = useState<TableColumn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [iconConfig, setIconConfig] = useState<IconConfig | null>(null);
    
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
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.columnConfigKey;

    const fetchChannels = useCallback(async () => {
        if (!pageKey) return;
        setIsLoading(true);
        setError(null);
        try {
            const [channelsRes, iconsRes, columnConfigRes, allColumnsRes] = await Promise.all([
                api.get<NotificationChannel[]>('/settings/notification-channels', { params: filters }),
                api.get<IconConfig>('/ui/icons-config'),
                api.get<string[]>(`/settings/column-config/${pageKey}`),
                api.get<TableColumn[]>(`/pages/columns/${pageKey}`)
            ]);
            setChannels(channelsRes.data);
            setIconConfig(iconsRes.data);
            if (allColumnsRes.data.length === 0) {
                throw new Error('欄位定義缺失');
            }
            setAllColumns(allColumnsRes.data);
            const resolvedVisibleColumns = columnConfigRes.data.length > 0
                ? columnConfigRes.data
                : allColumnsRes.data.map(c => c.key);
            setVisibleColumns(resolvedVisibleColumns);
        } catch(err) {
            setError('無法獲取通知管道。');
        } finally {
            setIsLoading(false);
        }
    }, [filters, pageKey]);

    useEffect(() => {
        if (pageKey) {
            fetchChannels();
        }
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
            }
            fetchChannels();
        } catch (err) {
            alert('Failed to save channel.');
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
                fetchChannels();
            } catch (err) {
                alert('Failed to delete channel.');
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
            setChannels(prev => prev.map(c => c.id === channelId ? { ...c, lastTestResult: 'pending' } : c));
            // Re-fetch after a delay to get the final result
            setTimeout(fetchChannels, 2000);
        } catch(err) {
            alert('Failed to initiate test.');
        }
    };

    const handleToggleEnable = async (channel: NotificationChannel) => {
        try {
            await api.patch(`/settings/notification-channels/${channel.id}`, { ...channel, enabled: !channel.enabled });
            fetchChannels();
        } catch (err) {
            alert('Failed to toggle channel status.');
        }
    };

    const getChannelTypeIcon = (type: NotificationChannelType) => {
        const fallback = { icon: 'bell', color: 'text-slate-400' };
        if (!iconConfig) return fallback;
        return iconConfig[type] || iconConfig.Default || fallback;
    };

    const getTestResultPill = (status: NotificationChannel['lastTestResult']) => {
        switch (status) {
            case 'success': return 'bg-green-500/20 text-green-400';
            case 'failed': return 'bg-red-500/20 text-red-400';
            case 'pending': return 'bg-yellow-500/20 text-yellow-400 animate-pulse';
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
            alert(`Failed to ${action} selected channels.`);
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
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={channel.enabled} className="sr-only peer" onChange={() => handleToggleEnable(channel)} />
                        <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-sky-600 peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                );
            case 'name': return <span className="font-medium text-white">{channel.name}</span>;
            case 'type':
                return (
                    <span className={`flex items-center font-semibold ${color}`}>
                        <Icon name={icon} className="w-4 h-4 mr-2" />
                        {channel.type}
                    </span>
                );
            case 'lastTestResult':
                return (
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full capitalize ${getTestResultPill(channel.lastTestResult)}`}>
                        {channel.lastTestResult}
                    </span>
                );
            case 'lastTestedAt': return channel.lastTestedAt;
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
                                <TableError colSpan={visibleColumns.length + 2} message={error} onRetry={fetchChannels} />
                            ) : channels.map((channel) => (
                                <tr key={channel.id} className={`border-b border-slate-800 ${selectedIds.includes(channel.id) ? 'bg-sky-900/50' : 'hover:bg-slate-800/40'}`}>
                                    <td className="p-4 w-12">
                                        <input type="checkbox" className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600"
                                               checked={selectedIds.includes(channel.id)} onChange={(e) => handleSelectOne(e, channel.id)} />
                                    </td>
                                    {visibleColumns.map(key => (
                                        <td key={key} className="px-6 py-4">{renderCellContent(channel, key)}</td>
                                    ))}
                                    <td className="px-6 py-4 text-center space-x-1">
                                        <button onClick={() => handleEditChannel(channel)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="編輯"><Icon name="edit-3" className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteClick(channel)} className="p-1.5 rounded-md text-red-400 hover:bg-red-500/20 hover:text-red-300" title="刪除"><Icon name="trash-2" className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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