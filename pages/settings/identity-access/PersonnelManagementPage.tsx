import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { User } from '../../../types';
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

const PersonnelManagementPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalUsers, setTotalUsers] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                page_size: pageSize,
                keyword: searchTerm,
            };
            const { data } = await api.get<{ items: User[], total: number }>('/iam/users', { params });
            setUsers(data.items);
            setTotalUsers(data.total);
        } catch (err) {
            setError('無法獲取人員列表。');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, searchTerm]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getStatusPill = (status: User['status']) => {
        switch (status) {
            case 'active': return 'bg-green-500/20 text-green-400';
            case 'invited': return 'bg-yellow-500/20 text-yellow-400';
            case 'inactive': return 'bg-slate-500/20 text-slate-400';
        }
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
        setActiveDropdown(null);
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
        setActiveDropdown(null);
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
    
    const leftActions = (
         <div className="relative">
            <Icon name="search" className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
                type="text"
                placeholder="依名稱、Email、角色搜尋..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-80 bg-slate-800/80 border border-slate-700 rounded-md pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
        </div>
    );

    const batchActions = (
        <>
            <ToolbarButton icon="user-x" text="停用" onClick={() => handleBatchAction('disable')} />
            <ToolbarButton icon="trash-2" text="刪除" danger onClick={() => handleBatchAction('delete')} />
        </>
    );

    return (
        <div className="h-full flex flex-col">
            <Toolbar 
                leftActions={leftActions}
                rightActions={
                    <>
                        <ToolbarButton icon="upload" text="匯入" disabled title="功能開發中" />
                        <ToolbarButton icon="download" text="匯出" disabled title="功能開發中" />
                        <ToolbarButton icon="settings-2" text="欄位設定" disabled title="功能開發中" />
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
                                <th scope="col" className="px-6 py-3">名稱</th>
                                <th scope="col" className="px-6 py-3">角色</th>
                                <th scope="col" className="px-6 py-3">團隊</th>
                                <th scope="col" className="px-6 py-3">狀態</th>
                                <th scope="col" className="px-6 py-3">上次登入</th>
                                <th scope="col" className="px-6 py-3 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={7} />
                            ) : error ? (
                                <TableError colSpan={7} message={error} onRetry={fetchUsers} />
                            ) : users.map((user) => (
                                <tr key={user.id} className={`border-b border-slate-800 ${selectedIds.includes(user.id) ? 'bg-sky-900/50' : 'hover:bg-slate-800/40'}`}>
                                    <td className="p-4 w-12">
                                        <input type="checkbox"
                                               className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600 rounded text-sky-500 focus:ring-sky-500"
                                               checked={selectedIds.includes(user.id)}
                                               onChange={(e) => handleSelectOne(e, user.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 font-medium text-white">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center mr-3 shrink-0">
                                                <Icon name="user" className="w-5 h-5 text-slate-300" />
                                            </div>
                                            <div>
                                                <div>{user.name}</div>
                                                <div className="text-xs text-slate-400 font-normal">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{user.role}</td>
                                    <td className="px-6 py-4">{user.team}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusPill(user.status)}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{user.lastLogin}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="relative" ref={activeDropdown === user.id ? dropdownRef : null}>
                                            <button onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white">
                                                <Icon name="more-horizontal" className="w-4 h-4" />
                                            </button>
                                            {activeDropdown === user.id && (
                                                <div className="absolute right-0 z-10 w-32 mt-2 p-2 origin-top-right rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5">
                                                    <button onClick={() => handleEditClick(user)} className="w-full flex items-center px-3 py-2 text-sm rounded-md text-left text-slate-300 hover:bg-slate-700">
                                                        <Icon name="edit-3" className="w-4 h-4 mr-2" /> 編輯
                                                    </button>
                                                    <button onClick={() => handleDeleteClick(user)} className="w-full flex items-center px-3 py-2 text-sm rounded-md text-left text-red-400 hover:bg-red-500/20">
                                                        <Icon name="trash-2" className="w-4 h-4 mr-2" /> 刪除
                                                    </button>
                                                </div>
                                            )}
                                        </div>
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
        </div>
    );
};

export default PersonnelManagementPage;
