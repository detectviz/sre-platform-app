import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ResourceGroup, ResourceGroupFilters, TableColumn } from '../../types';
import Icon from '../../components/Icon';
import Toolbar, { ToolbarButton } from '../../components/Toolbar';
import TableContainer from '../../components/TableContainer';
import ResourceGroupEditModal from '../../components/ResourceGroupEditModal';
import Modal from '../../components/Modal';
import api from '../../services/api';
import TableLoader from '../../components/TableLoader';
import TableError from '../../components/TableError';
import UnifiedSearchModal from '../../components/UnifiedSearchModal';
import ColumnSettingsModal from '../../components/ColumnSettingsModal';
import { usePageMetadata } from '../../contexts/PageMetadataContext';
import { showToast } from '../../services/toast';

const PAGE_IDENTIFIER = 'resource_groups';

const ResourceGroupPage: React.FC = () => {
    const [groups, setGroups] = useState<ResourceGroup[]>([]);
    const [allColumns, setAllColumns] = useState<TableColumn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<ResourceGroup | null>(null);
    const location = useLocation();
    const navigate = useNavigate();

    const [filters, setFilters] = useState<ResourceGroupFilters>({ keyword: location.state?.initialSearchTerm || '' });

    useEffect(() => {
        if (location.state?.initialSearchTerm) {
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, location.pathname]);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingGroup, setDeletingGroup] = useState<ResourceGroup | null>(null);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [isColumnSettingsModalOpen, setIsColumnSettingsModalOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

    const { metadata: pageMetadata } = usePageMetadata();
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.column_config_key;


    const fetchGroups = useCallback(async () => {
        if (!pageKey) return;
        setIsLoading(true);
        setError(null);
        try {
            const [groupsRes, columnConfigRes, allColumnsRes] = await Promise.all([
                api.get<{ items: ResourceGroup[], total: number }>('/resource-groups', { params: filters }),
                api.get<string[]>(`/settings/column-config/${pageKey}`),
                api.get<TableColumn[]>(`/pages/columns/${pageKey}`)
            ]);

            if (allColumnsRes.data.length === 0) {
                throw new Error('欄位定義缺失');
            }

            setGroups(groupsRes.data.items);
            setAllColumns(allColumnsRes.data);
            const resolvedVisibleColumns = columnConfigRes.data.length > 0
                ? columnConfigRes.data
                : allColumnsRes.data.map(c => c.key);
            setVisibleColumns(resolvedVisibleColumns);
        } catch (err) {
            console.error(err);
            setError('無法獲取資源群組。');
        } finally {
            setIsLoading(false);
        }
    }, [filters, pageKey]);

    useEffect(() => {
        if (pageKey) {
            fetchGroups();
        }
    }, [fetchGroups, pageKey]);

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

    const handleNewGroup = () => {
        setEditingGroup(null);
        setIsModalOpen(true);
    };

    const handleEditGroup = (group: ResourceGroup) => {
        setEditingGroup(group);
        setIsModalOpen(true);
    };

    const handleSaveGroup = async (groupData: Partial<ResourceGroup>) => {
        try {
            const payload = {
                ...groupData,
                id: editingGroup?.id, // Ensure ID is included for updates
            };
            if (editingGroup) {
                await api.put(`/resource-groups/${editingGroup.id}`, payload);
            } else {
                await api.post('/resource-groups', payload);
            }
            fetchGroups();
        } catch (err) {
            alert('Failed to save group.');
        } finally {
            setIsModalOpen(false);
        }
    };

    const handleDeleteClick = (group: ResourceGroup) => {
        setDeletingGroup(group);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (deletingGroup) {
            try {
                await api.del(`/resource-groups/${deletingGroup.id}`);
                fetchGroups();
            } catch (err) {
                alert('Failed to delete group.');
            } finally {
                setIsDeleteModalOpen(false);
                setDeletingGroup(null);
            }
        }
    };

    const renderCellContent = (group: ResourceGroup, columnKey: string) => {
        switch (columnKey) {
            case 'name':
                return (
                    <>
                        <div className="font-medium text-white">{group.name}</div>
                        <p className="text-xs text-slate-400 font-normal">{group.description}</p>
                    </>
                );
            case 'owner_team':
                return group.owner_team;
            case 'member_ids':
                return group.member_ids.length;
            case 'status_summary':
                return (
                    <div className="flex items-center space-x-2">
                        <span className="flex items-center text-xs text-green-400"><span className="w-2 h-2 mr-1.5 rounded-full bg-green-400"></span>{group.status_summary.healthy}</span>
                        <span className="flex items-center text-xs text-yellow-400"><span className="w-2 h-2 mr-1.5 rounded-full bg-yellow-400"></span>{group.status_summary.warning}</span>
                        <span className="flex items-center text-xs text-red-400"><span className="w-2 h-2 mr-1.5 rounded-full bg-red-400"></span>{group.status_summary.critical}</span>
                    </div>
                );
            default:
                return <span className="text-slate-500">--</span>;
        }
    };

    const leftActions = (
        <ToolbarButton icon="search" text="搜尋和篩選" onClick={() => setIsSearchModalOpen(true)} />
    );

    const rightActions = (
        <>
            <ToolbarButton icon="settings-2" text="欄位設定" onClick={() => setIsColumnSettingsModalOpen(true)} />
            <ToolbarButton icon="plus" text="新增群組" primary onClick={handleNewGroup} />
        </>
    );

    return (
        <div className="h-full flex flex-col">
            <Toolbar
                leftActions={leftActions}
                rightActions={rightActions}
            />

            <TableContainer>
                <div className="h-full overflow-y-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0 z-10">
                            <tr>
                                {visibleColumns.map(key => (
                                    <th key={key} scope="col" className="px-6 py-3">{allColumns.find(c => c.key === key)?.label || key}</th>
                                ))}
                                <th scope="col" className="px-6 py-3 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={visibleColumns.length + 1} />
                            ) : error ? (
                                <TableError colSpan={visibleColumns.length + 1} message={error} onRetry={fetchGroups} />
                            ) : groups.map((group) => (
                                <tr key={group.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                                    {visibleColumns.map(key => (
                                        <td key={key} className="px-6 py-4">{renderCellContent(group, key)}</td>
                                    ))}
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => handleEditGroup(group)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="編輯">
                                            <Icon name="edit-3" className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteClick(group)} className="p-1.5 rounded-md text-red-400 hover:bg-red-500/20 hover:text-red-300" title="刪除">
                                            <Icon name="trash-2" className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </TableContainer>

            {isModalOpen && (
                <ResourceGroupEditModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveGroup}
                    group={editingGroup}
                />
            )}
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
                <p>您確定要刪除資源群組 <strong className="text-amber-400">{deletingGroup?.name}</strong> 嗎？</p>
                <p className="mt-2 text-slate-400">此操作無法復原。</p>
            </Modal>
            <UnifiedSearchModal
                page="resource-groups"
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onSearch={(newFilters) => {
                    setFilters(newFilters as ResourceGroupFilters);
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

export default ResourceGroupPage;