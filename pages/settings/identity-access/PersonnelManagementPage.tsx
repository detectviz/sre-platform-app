import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { User, PersonnelFilters, TableColumn } from '../../../types';
import Icon from '../../../components/Icon';
import Toolbar, { ToolbarButton } from '../../../components/Toolbar';
import TableContainer from '../../../components/TableContainer';
import Pagination from '../../../components/Pagination';
import InviteUserModal from '../../../components/InviteUserModal';
import UserEditModal from '../../../components/UserEditModal';
import Modal from '../../../components/Modal';
import api from '../../../services/api';
import TableLoader from '../../../components/TableLoader';
import TableError from '../../../components/TableError';
import { exportToCsv } from '../../../services/export';
import ImportFromCsvModal from '../../../components/ImportFromCsvModal';
import { showToast } from '../../../services/toast';
import ColumnSettingsModal from '../../../components/ColumnSettingsModal';
import { usePageMetadata } from '../../../contexts/PageMetadataContext';
import UserAvatar from '../../../components/UserAvatar';
import UnifiedSearchModal from '../../../components/UnifiedSearchModal';
import { useOptions } from '../../../contexts/OptionsContext';

const PAGE_IDENTIFIER = 'personnel';

const PersonnelManagementPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [allColumns, setAllColumns] = useState<TableColumn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalUsers, setTotalUsers] = useState(0);

    const [filters, setFilters] = useState<PersonnelFilters>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isColumnSettingsModalOpen, setIsColumnSettingsModalOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

    const { options } = useOptions();

    const { metadata: pageMetadata } = usePageMetadata();
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.column_config_key;

    const fetchUsers = useCallback(async () => {
        if (!pageKey) return;
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                page_size: pageSize,
                ...filters,
            };

            const [usersRes, columnConfigRes, allColumnsRes] = await Promise.all([
                api.get<{ items: User[], total: number }>('/iam/users', { params }),
                api.get<string[]>(`/settings/column-config/${pageKey}`),
                api.get<TableColumn[]>(`/pages/columns/${pageKey}`)
            ]);

            if (allColumnsRes.data.length === 0) {
                throw new Error('欄位定義缺失');
            }

            setUsers(usersRes.data.items);
            setTotalUsers(usersRes.data.total);
            setAllColumns(allColumnsRes.data);
            const resolvedVisibleColumns = columnConfigRes.data.length > 0
                ? columnConfigRes.data
                : allColumnsRes.data.map(c => c.key);
            setVisibleColumns(resolvedVisibleColumns);
        } catch (err) {
            setError('無法獲取人員列表。');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, filters, pageKey]);

    useEffect(() => {
        if (pageKey) {
            fetchUsers();
        }
    }, [fetchUsers, pageKey]);

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

    const getStatusPill = (status: User['status']) => {
        const style = options?.personnel?.statuses.find(s => s.value === status);
        return style ? style.class_name : 'bg-slate-500/20 text-slate-400';
    };

    const getStatusLabel = (status: User['status']) => {
        const style = options?.personnel?.statuses.find(s => s.value === status);
        return style ? style.label : status;
    };

    const handleInvite = async (details: { email: string; name?: string; role: User['role']; team: string }) => {
        try {
            await api.post('/iam/users', details);
            setIsInviteModalOpen(false);
            fetchUsers(); // Re-fetch to show the new user
        } catch (err) {
            alert('Failed to invite user.');
        }
    };

    const handleEditClick = (user: User) => {
        setEditingUser(user);
        setIsEditModalOpen(true);
    };

    const handleSaveUser = async (updatedUser: User) => {
        try {
            await api.patch(`/iam/users/${updatedUser.id}`, updatedUser);
            setIsEditModalOpen(false);
            fetchUsers();
        } catch (err) {
            alert('Failed to save user.');
        }
    };

    const handleDeleteClick = (user: User) => {
        setDeletingUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (deletingUser) {
            try {
                await api.del(`/iam/users/${deletingUser.id}`);
                setIsDeleteModalOpen(false);
                setDeletingUser(null);
                fetchUsers();
            } catch (err) {
                alert('Failed to delete user.');
            }
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(users.map(u => u.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        if (e.target.checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        }
    };

    const isAllSelected = users.length > 0 && selectedIds.length === users.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < users.length;

    const handleBatchAction = async (action: 'disable' | 'delete') => {
        try {
            await api.post('/iam/users/batch-actions', { action, ids: selectedIds });
            setSelectedIds([]);
            fetchUsers();
        } catch (err) {
            alert(`Failed to ${action} selected users.`);
        }
    };

    const handleExport = () => {
        const dataToExport = selectedIds.length > 0
            ? users.filter(u => selectedIds.includes(u.id))
            : users;

        if (dataToExport.length === 0) {
            alert("沒有可匯出的資料。");
            return;
        }

        exportToCsv({
            filename: `personnel-${new Date().toISOString().split('T')[0]}.csv`,
            headers: ['id', 'name', 'email', 'role', 'team', 'status', 'lastLogin'],
            data: dataToExport,
        });
    };

    const renderCellContent = (user: User, columnKey: string) => {
        switch (columnKey) {
            case 'name':
                return (
                    <div className="flex items-center">
                        <UserAvatar user={user} className="w-8 h-8 mr-3" iconClassName="w-5 h-5" />
                        <div>
                            <div className="font-medium text-white">{user.name}</div>
                            <div className="text-xs text-slate-400 font-normal">{user.email}</div>
                        </div>
                    </div>
                );
            case 'role': return user.role;
            case 'team': return user.team;
            case 'status': return <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusPill(user.status)}`}>{getStatusLabel(user.status)}</span>;
            case 'lastLoginAt': return user.last_login_at;
            default:
                return <span className="text-slate-500">--</span>;
        }
    };

    const leftActions = (
        <ToolbarButton icon="search" text="搜尋和篩選" onClick={() => setIsSearchModalOpen(true)} />
    );

    const batchActions = (
        <>
            <ToolbarButton icon="user-x" text="停用" onClick={() => handleBatchAction('disable')} />
            <ToolbarButton icon="trash-2" text="刪除" danger onClick={() => handleBatchAction('delete')} />
            <ToolbarButton icon="upload" text="匯入" onClick={() => setIsImportModalOpen(true)} />
            <ToolbarButton icon="download" text="匯出" onClick={handleExport} />
        </>
    );

    return (
        <div className="h-full flex flex-col">
            <Toolbar
                leftActions={leftActions}
                rightActions={
                    <>
                        <ToolbarButton icon="upload" text="匯入" onClick={() => setIsImportModalOpen(true)} />
                        <ToolbarButton icon="download" text="匯出" onClick={handleExport} />
                        <ToolbarButton icon="settings-2" text="欄位設定" onClick={() => setIsColumnSettingsModalOpen(true)} />
                        <ToolbarButton icon="user-plus" text="邀請人員" primary onClick={() => setIsInviteModalOpen(true)} />
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
                                    <input type="checkbox"
                                        className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600 rounded text-sky-500 focus:ring-sky-500"
                                        checked={isAllSelected}
                                        ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                                        onChange={handleSelectAll}
                                    />
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
                                <TableError colSpan={visibleColumns.length + 2} message={error} onRetry={fetchUsers} />
                            ) : users.map((user) => (
                                <tr key={user.id} className={`border-b border-slate-800 ${selectedIds.includes(user.id) ? 'bg-sky-900/50' : 'hover:bg-slate-800/40'}`}>
                                    <td className="p-4 w-12">
                                        <input type="checkbox"
                                            className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600 rounded text-sky-500 focus:ring-sky-500"
                                            checked={selectedIds.includes(user.id)}
                                            onChange={(e) => handleSelectOne(e, user.id)}
                                        />
                                    </td>
                                    {visibleColumns.map(key => (
                                        <td key={key} className="px-6 py-4">{renderCellContent(user, key)}</td>
                                    ))}
                                    <td className="px-6 py-4 text-center space-x-1">
                                        <button onClick={() => handleEditClick(user)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="編輯">
                                            <Icon name="edit-3" className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteClick(user)} className="p-1.5 rounded-md text-red-400 hover:bg-red-500/20 hover:text-red-300" title="刪除">
                                            <Icon name="trash-2" className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    total={totalUsers}
                    page={currentPage}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                />
            </TableContainer>
            <InviteUserModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInvite={handleInvite}
            />
            {isEditModalOpen && (
                <UserEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSaveUser}
                    user={editingUser}
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
                <p>您確定要刪除使用者 <strong className="text-amber-400">{deletingUser?.name}</strong> 嗎？</p>
                <p className="mt-2 text-slate-400">此操作無法復原。</p>
            </Modal>
            <ColumnSettingsModal
                isOpen={isColumnSettingsModalOpen}
                onClose={() => setIsColumnSettingsModalOpen(false)}
                onSave={handleSaveColumnConfig}
                allColumns={allColumns}
                visibleColumnKeys={visibleColumns}
            />
            <ImportFromCsvModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImportSuccess={fetchUsers}
                itemName="人員"
                importEndpoint="/iam/users/import"
                templateHeaders={['id', 'name', 'email', 'role', 'team', 'status']}
                templateFilename="personnel-template.csv"
            />
            <UnifiedSearchModal
                page="personnel"
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onSearch={(newFilters) => {
                    setFilters(newFilters as PersonnelFilters);
                    setIsSearchModalOpen(false);
                    setCurrentPage(1);
                }}
                initialFilters={filters}
            />
        </div>
    );
};

export default PersonnelManagementPage;