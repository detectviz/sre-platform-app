import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Role, TableColumn } from '../../../types';
import Toolbar, { ToolbarButton } from '../../../components/Toolbar';
import TableContainer from '../../../components/TableContainer';
import RoleEditModal from '../../../components/RoleEditModal';
import Modal from '../../../components/Modal';
import api from '../../../services/api';
import TableLoader from '../../../components/TableLoader';
import TableError from '../../../components/TableError';
import ColumnSettingsModal from '../../../components/ColumnSettingsModal';
import { usePageMetadata } from '../../../contexts/PageMetadataContext';
import { showToast } from '../../../services/toast';
import Pagination from '../../../components/Pagination';
import UnifiedSearchModal from '../../../components/UnifiedSearchModal';
import { useOptions } from '../../../contexts/OptionsContext';
import StatusTag from '../../../components/StatusTag';
import IconButton from '../../../components/IconButton';
import { formatRelativeTime } from '../../../utils/time';
import SortableColumnHeaderCell from '../../../components/SortableColumnHeaderCell';
import useTableSorting from '../../../hooks/useTableSorting';

const PAGE_IDENTIFIER = 'roles';

const RoleManagementPage: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [allColumns, setAllColumns] = useState<TableColumn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalRoles, setTotalRoles] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filters, setFilters] = useState<{ keyword?: string }>({});

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingRole, setDeletingRole] = useState<Role | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isColumnSettingsModalOpen, setIsColumnSettingsModalOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    const { metadata: pageMetadata } = usePageMetadata();
    const { options } = useOptions();
    const roleDescriptors = useMemo(() => {
        if (!options?.personnel?.role_descriptors) {
            return new Map<string, { label: string; description?: string; helper_text?: string }>();
        }
        return new Map(
            options.personnel.role_descriptors.map(descriptor => [
                descriptor.value,
                { label: descriptor.label, description: descriptor.description, helper_text: descriptor.helper_text }
            ])
        );
    }, [options?.personnel?.role_descriptors]);

    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.column_config_key;

    const { sortConfig, sortParams, handleSort } = useTableSorting({ defaultSortKey: 'created_at', defaultSortDirection: 'desc' });

    const fetchRoles = useCallback(async () => {
        if (!pageKey) return;
        setIsLoading(true);
        setError(null);
        try {
            const params = { page: currentPage, page_size: pageSize, ...filters, ...sortParams };
            const [rolesRes, columnConfigRes, allColumnsRes] = await Promise.all([
                api.get<{ items: Role[], total: number }>('/iam/roles', { params }),
                api.get<string[]>(`/settings/column-config/${pageKey}`),
                api.get<TableColumn[]>(`/pages/columns/${pageKey}`)
            ]);
            setRoles(rolesRes.data.items);
            setTotalRoles(rolesRes.data.total);
            if (allColumnsRes.data.length === 0) {
                throw new Error('欄位定義缺失');
            }
            setAllColumns(allColumnsRes.data);
            const resolvedVisibleColumns = columnConfigRes.data.length > 0
                ? columnConfigRes.data
                : allColumnsRes.data.map(c => c.key);
            setVisibleColumns(resolvedVisibleColumns);
        } catch (err) {
            setError('無法獲取角色列表。');
        } finally {
            setIsLoading(false);
        }
    }, [pageKey, currentPage, pageSize, filters, sortParams]);

    useEffect(() => {
        if (pageKey) {
            fetchRoles();
        }
    }, [fetchRoles, pageKey]);

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

    const handleNewRole = () => {
        setEditingRole(null);
        setIsModalOpen(true);
    };

    const handleEditRole = (role: Role) => {
        setEditingRole(role);
        setIsModalOpen(true);
    };

    const handleSaveRole = async (role: Role) => {
        try {
            if (editingRole) {
                await api.patch(`/iam/roles/${role.id}`, role);
            } else {
                await api.post('/iam/roles', role);
            }
            fetchRoles();
        } catch (err) {
            showToast('儲存角色設定失敗，請稍後再試。', 'error');
        } finally {
            setIsModalOpen(false);
        }
    };

    const handleDeleteClick = (role: Role) => {
        setDeletingRole(role);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (deletingRole) {
            try {
                await api.del(`/iam/roles/${deletingRole.id}`);
                fetchRoles();
            } catch (err) {
                showToast('刪除角色失敗，請稍後再試。', 'error');
            } finally {
                setIsDeleteModalOpen(false);
                setDeletingRole(null);
            }
        }
    };

    const handleBatchDelete = async () => {
        try {
            await api.post('/iam/roles/batch-actions', { action: 'delete', ids: selectedIds });
            setSelectedIds([]);
            fetchRoles();
        } catch (err) {
            showToast('批次刪除角色失敗，請稍後再試。', 'error');
        }
    };

    const handleToggleEnabled = async (role: Role) => {
        try {
            await api.patch(`/iam/roles/${role.id}`, { ...role, enabled: !role.enabled });
            fetchRoles();
        } catch (err) {
            showToast('切換角色狀態失敗。', 'error');
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedIds(e.target.checked ? roles.map(r => r.id) : []);
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        setSelectedIds(prev => e.target.checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id));
    };

    const isAllSelected = roles.length > 0 && selectedIds.length === roles.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < roles.length;

    const batchActions = (
        <ToolbarButton icon="trash-2" text="刪除" danger onClick={handleBatchDelete} />
    );

    const getRoleDescriptor = (role: Role) => {
        return roleDescriptors.get(role.id) || roleDescriptors.get(role.name) || null;
    };

    const renderCellContent = (role: Role, columnKey: string) => {
        switch (columnKey) {
            case 'enabled':
                return (
                    <label className="relative inline-flex items-center cursor-pointer" aria-label={role.enabled ? '停用角色' : '啟用角色'}>
                        <input
                            type="checkbox"
                            checked={role.enabled}
                            className="sr-only peer"
                            onChange={() => handleToggleEnabled(role)}
                        />
                        <div className="w-12 h-6 rounded-full bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-sky-600 transition-colors peer-checked:bg-sky-600">
                            <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-[24px]"></span>
                        </div>
                    </label>
                );
            case 'name':
                {
                    const descriptor = getRoleDescriptor(role);
                    return (
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{descriptor?.label || role.name}</span>
                            {!role.enabled && <StatusTag label="已停用" tone="neutral" dense />}
                        </div>
                    );
                }
            case 'user_count':
                return (
                    <div className="flex items-center">
                        <span className="font-semibold text-white">{role.user_count}</span>
                    </div>
                );
            case 'created_at':
                return (
                    <div className="flex items-center">
                        <span className="font-medium text-white">{formatRelativeTime(role.updated_at)}</span>
                    </div>
                );
            default:
                return <span className="text-slate-500">--</span>;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <Toolbar
                leftActions={<ToolbarButton icon="search" text="搜尋和篩選" onClick={() => setIsSearchModalOpen(true)} />}
                rightActions={
                    <>
                        <ToolbarButton icon="settings-2" text="欄位設定" onClick={() => setIsColumnSettingsModalOpen(true)} />
                        <ToolbarButton icon="plus" text="新增角色" primary onClick={handleNewRole} />
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
                                <th scope="col" className="px-6 py-3 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={visibleColumns.length + 2} />
                            ) : error ? (
                                <TableError colSpan={visibleColumns.length + 2} message={error} onRetry={fetchRoles} />
                            ) : roles.length === 0 ? (
                                <tr>
                                    <td colSpan={visibleColumns.length + 2} className="px-6 py-12 text-center text-slate-400">
                                        <div className="space-y-3">
                                            <p className="text-sm">尚未建立角色。請點擊右上角「新增角色」開始設定權限。</p>
                                            <ToolbarButton icon="plus" text="新增角色" primary onClick={handleNewRole} />
                                        </div>
                                    </td>
                                </tr>
                            ) : roles.map((role) => (
                                <tr key={role.id} className={`border-b border-slate-800 transition-colors ${selectedIds.includes(role.id) ? 'bg-sky-900/50' : 'hover:bg-slate-800/40'}`}>
                                    <td className="p-4 w-12">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600"
                                            checked={selectedIds.includes(role.id)}
                                            onChange={(e) => handleSelectOne(e, role.id)}
                                        />
                                    </td>
                                    {visibleColumns.map(key => (
                                        <td key={key} className="px-6 py-4 align-top">{renderCellContent(role, key)}</td>
                                    ))}
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <IconButton icon="edit-3" label="編輯角色" tooltip="編輯角色" onClick={() => handleEditRole(role)} size="sm" />
                                            <IconButton icon="trash-2" label="刪除角色" tooltip="刪除角色" tone="danger" onClick={() => handleDeleteClick(role)} size="sm" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination total={totalRoles} page={currentPage} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
            </TableContainer>
            {isModalOpen &&
                <RoleEditModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveRole}
                    role={editingRole}
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
                <p>您確定要刪除角色 <strong className="text-amber-400">{deletingRole?.name}</strong> 嗎？</p>
                <p className="mt-2 text-slate-400">此操作無法復原。擁有此角色的使用者將失去相關權限。</p>
            </Modal>
            <ColumnSettingsModal
                isOpen={isColumnSettingsModalOpen}
                onClose={() => setIsColumnSettingsModalOpen(false)}
                onSave={handleSaveColumnConfig}
                allColumns={allColumns}
                visibleColumnKeys={visibleColumns}
            />
            <UnifiedSearchModal
                page="roles"
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onSearch={(newFilters) => {
                    setFilters(newFilters as { keyword?: string });
                    setIsSearchModalOpen(false);
                    setCurrentPage(1);
                }}
                initialFilters={filters}
            />
        </div>
    );
};

export default RoleManagementPage;