import React, { useState, useEffect, useCallback } from 'react';
import { Role } from '../../../types';
import Icon from '../../../components/Icon';
import Toolbar, { ToolbarButton } from '../../../components/Toolbar';
import TableContainer from '../../../components/TableContainer';
import RoleEditModal from '../../../components/RoleEditModal';
import Modal from '../../../components/Modal';
import api from '../../../services/api';
import TableLoader from '../../../components/TableLoader';
import TableError from '../../../components/TableError';

const RoleManagementPage: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingRole, setDeletingRole] = useState<Role | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const fetchRoles = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get<Role[]>('/iam/roles');
            setRoles(data);
        } catch (err) {
            setError('無法獲取角色列表。');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

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
            alert('Failed to save role.');
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
                alert('Failed to delete role.');
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
            alert('Failed to delete selected roles.');
        }
    };

    const getStatusPill = (status: Role['status']) => {
        return status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400';
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

    return (
        <div className="h-full flex flex-col">
            <Toolbar 
                rightActions={<ToolbarButton icon="plus" text="新增角色" primary onClick={handleNewRole} />}
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
                                <th scope="col" className="px-6 py-3">角色名稱</th>
                                <th scope="col" className="px-6 py-3">使用者數量</th>
                                <th scope="col" className="px-6 py-3">狀態</th>
                                <th scope="col" className="px-6 py-3">創建時間</th>
                                <th scope="col" className="px-6 py-3 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={6} />
                            ) : error ? (
                                <TableError colSpan={6} message={error} onRetry={fetchRoles} />
                            ) : roles.map((role) => (
                                <tr key={role.id} className={`border-b border-slate-800 ${selectedIds.includes(role.id) ? 'bg-sky-900/50' : 'hover:bg-slate-800/40'}`}>
                                     <td className="p-4 w-12">
                                        <input type="checkbox" className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600"
                                               checked={selectedIds.includes(role.id)} onChange={(e) => handleSelectOne(e, role.id)} />
                                    </td>
                                    <td className="px-6 py-4 font-medium text-white">
                                        {role.name}
                                        <p className="text-xs text-slate-400 font-normal">{role.description}</p>
                                    </td>
                                    <td className="px-6 py-4">{role.userCount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusPill(role.status)}`}>
                                            {role.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{role.createdAt}</td>
                                    <td className="px-6 py-4 text-center">
                                         <button onClick={() => handleEditRole(role)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="編輯"><Icon name="edit-3" className="w-4 h-4" /></button>
                                         <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(role); }} className="p-1.5 rounded-md text-red-400 hover:bg-red-500/20 hover:text-red-300" title="刪除"><Icon name="trash-2" className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
        </div>
    );
};

export default RoleManagementPage;