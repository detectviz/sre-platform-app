import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Resource, ResourceGroup, ResourceGroupFilters, TableColumn } from '../../types';
import Icon from '../../components/Icon';
import Toolbar, { ToolbarButton } from '../../components/Toolbar';
import TableContainer from '../../components/TableContainer';
import ResourceGroupEditModal from '../../components/ResourceGroupEditModal';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import api from '../../services/api';
import TableLoader from '../../components/TableLoader';
import TableError from '../../components/TableError';
import UnifiedSearchModal from '../../components/UnifiedSearchModal';
import ColumnSettingsModal from '../../components/ColumnSettingsModal';
import { usePageMetadata } from '../../contexts/PageMetadataContext';
import { showToast } from '../../services/toast';
import StatusTag from '../../components/StatusTag';
import IconButton from '../../components/IconButton';
import Drawer from '../../components/Drawer';
import { useOptions } from '../../contexts/OptionsContext';
import { formatRelativeTime } from '../../utils/time';
import SortableColumnHeaderCell from '../../components/SortableColumnHeaderCell';
import useTableSorting from '../../hooks/useTableSorting';

const PAGE_IDENTIFIER = 'resource_groups';

const ResourceGroupPage: React.FC = () => {
    const [groups, setGroups] = useState<ResourceGroup[]>([]);
    const [allColumns, setAllColumns] = useState<TableColumn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

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
    const [previewGroup, setPreviewGroup] = useState<ResourceGroup | null>(null);
    const [previewResources, setPreviewResources] = useState<Resource[]>([]);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);

    const { metadata: pageMetadata } = usePageMetadata();
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.column_config_key;

    const { options } = useOptions();
    const resourceOptions = options?.resources;

    const statusDescriptors = useMemo(() => resourceOptions?.statuses ?? [], [resourceOptions?.statuses]);
    const statusColorLookup = useMemo(() => {
        const lookup: Record<string, string> = {};
        resourceOptions?.status_colors?.forEach(descriptor => {
            lookup[descriptor.value] = descriptor.color;
        });
        return lookup;
    }, [resourceOptions?.status_colors]);

    const englishFromValue = useCallback((value: string) => (
        value.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
    ), []);
    const { sortConfig, sortParams, handleSort } = useTableSorting({ defaultSortKey: 'name' });

    const fetchGroups = useCallback(async () => {
        if (!pageKey) return;
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                page_size: pageSize,
                ...filters,
                ...sortParams,
            };

            const [groupsRes, columnConfigRes, allColumnsRes] = await Promise.all([
                api.get<{ items: ResourceGroup[], total: number }>('/resource-groups', { params }),
                api.get<string[]>(`/settings/column-config/${pageKey}`),
                api.get<TableColumn[]>(`/pages/columns/${pageKey}`)
            ]);

            if (allColumnsRes.data.length === 0) {
                throw new Error('欄位定義缺失');
            }

            setGroups(groupsRes.data.items);
            setTotal(groupsRes.data.total);
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
    }, [filters, pageKey, currentPage, pageSize, sortParams]);

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
                setCurrentPage(1); // Reset to first page when adding new item
            }
            fetchGroups();
        } catch (err) {
            showToast('儲存資源群組失敗，請稍後再試。', 'error');
        } finally {
            setIsModalOpen(false);
        }
    };

    const handleViewGroup = (group: ResourceGroup) => {
        setPreviewGroup(group);
    };

    useEffect(() => {
        if (!previewGroup) {
            setPreviewResources([]);
            setPreviewError(null);
            return;
        }

        const fetchMembers = async () => {
            setIsPreviewLoading(true);
            setPreviewError(null);
            try {
                const { data } = await api.get<{ items: Resource[] }>('/resources', { params: { page: 1, page_size: 500 } });
                const filtered = (data.items || []).filter(resource => previewGroup.member_ids.includes(resource.id));
                setPreviewResources(filtered);
            } catch (err) {
                setPreviewError('無法載入群組成員清單。');
            } finally {
                setIsPreviewLoading(false);
            }
        };

        fetchMembers();
    }, [previewGroup]);

    const closePreviewDrawer = () => {
        setPreviewGroup(null);
    };

    const handleDeleteClick = (group: ResourceGroup) => {
        setDeletingGroup(group);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (deletingGroup) {
            try {
                await api.del(`/resource-groups/${deletingGroup.id}`);
                // Reset to first page if current page becomes empty
                if (groups.length === 1 && currentPage > 1) {
                    setCurrentPage(1);
                }
                fetchGroups();
            } catch (err) {
                showToast('刪除資源群組失敗，請稍後再試。', 'error');
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
                const summaryOrder: Array<Resource['status']> = ['healthy', 'warning', 'critical'];
                return (
                    <div className="flex flex-wrap gap-1.5">
                        {summaryOrder.map(statusKey => {
                            const descriptor = statusDescriptors.find(item => item.value === statusKey);
                            const label = descriptor?.label || englishFromValue(statusKey);
                            const tooltip = `${label} (${englishFromValue(statusKey)})`;
                            const dotColor = statusColorLookup[statusKey] || '#38bdf8';
                            const count = group.status_summary[statusKey as keyof typeof group.status_summary] || 0;
                            return (
                                <StatusTag
                                    key={statusKey}
                                    dense
                                    className={descriptor?.class_name}
                                    tooltip={`${tooltip}：${count} 台`}
                                    label={(
                                        <span className="flex items-center gap-1.5">
                                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
                                            <span>{label}</span>
                                            <span className="text-xs font-semibold text-slate-200/80">{count}</span>
                                        </span>
                                    )}
                                />
                            );
                        })}
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

            <TableContainer
                table={(
                    <table className="app-table text-sm">
                        <thead className="app-table__head">
                            <tr className="app-table__head-row">
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
                                <th scope="col" className="app-table__header-cell app-table__header-cell--center">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={visibleColumns.length + 1} />
                            ) : error ? (
                                <TableError colSpan={visibleColumns.length + 1} message={error} onRetry={fetchGroups} />
                            ) : (
                                groups.map(group => (
                                    <tr key={group.id} className="app-table__row">
                                        {visibleColumns.map(key => (
                                            <td key={key} className="app-table__cell">{renderCellContent(group, key)}</td>
                                        ))}
                                        <td className="app-table__cell app-table__cell--center">
                                            <div className="app-table__actions">
                                                <IconButton
                                                    icon="eye"
                                                    label="檢視群組"
                                                    tooltip="檢視群組 View group"
                                                    onClick={() => handleViewGroup(group)}
                                                />
                                                <IconButton
                                                    icon="edit-3"
                                                    label="編輯群組"
                                                    tooltip="編輯群組 Edit group"
                                                    onClick={() => handleEditGroup(group)}
                                                />
                                                <IconButton
                                                    icon="trash-2"
                                                    label="刪除群組"
                                                    tooltip="刪除群組 Delete group"
                                                    onClick={() => handleDeleteClick(group)}
                                                    tone="danger"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
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
            <Drawer
                isOpen={!!previewGroup}
                onClose={closePreviewDrawer}
                title={previewGroup?.name || '群組詳情'}
                width="w-3/4 max-w-4xl"
            >
                {isPreviewLoading ? (
                    <div className="flex h-64 items-center justify-center text-slate-400">
                        <Icon name="loader-circle" className="h-6 w-6 animate-spin" />
                    </div>
                ) : previewError ? (
                    <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-6 text-rose-200">
                        {previewError}
                    </div>
                ) : previewGroup ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-700 bg-slate-900/60 p-4 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-slate-400">擁有團隊</p>
                                <p className="mt-1 text-base font-semibold text-white">{previewGroup.owner_team || '未指定'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">最近更新</p>
                                <p className="mt-1 text-base font-semibold text-white">{formatRelativeTime(previewGroup.updated_at)}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-sm text-slate-400">描述</p>
                                <p className="mt-1 leading-relaxed text-slate-200">{previewGroup.description || '尚未填寫描述。'}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">狀態摘要</h3>
                            <div className="mt-3">
                                {renderCellContent(previewGroup, 'status_summary')}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">成員資源 ({previewResources.length})</h3>
                            {previewResources.length === 0 ? (
                                <div className="mt-3 rounded-lg border border-dashed border-slate-700 bg-slate-900/50 p-6 text-center text-slate-400">
                                    <Icon name="database" className="mx-auto mb-2 h-6 w-6" />
                                    尚未加入任何資源。
                                </div>
                            ) : (
                                <ul className="mt-3 space-y-2">
                                    {previewResources.map(resource => {
                                        const descriptor = statusDescriptors.find(item => item.value === resource.status);
                                        const dotColor = statusColorLookup[resource.status] || '#38bdf8';
                                        const readableLabel = descriptor?.label || englishFromValue(resource.status);
                                        return (
                                            <li key={resource.id} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-white">{resource.name}</p>
                                                    <p className="text-xs text-slate-400">{resource.type} · {resource.provider} · {resource.region}</p>
                                                </div>
                                                <StatusTag
                                                    dense
                                                    className={descriptor?.class_name}
                                                    tooltip={`${readableLabel} (${englishFromValue(resource.status)})`}
                                                    label={(
                                                        <span className="flex items-center gap-1.5">
                                                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
                                                            <span>{readableLabel}</span>
                                                        </span>
                                                    )}
                                                />
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>
                ) : null}
            </Drawer>
        </div>
    );
};

export default ResourceGroupPage;