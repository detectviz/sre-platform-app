import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ResourceGroup } from '../../types';
import Icon from '../../components/Icon';
import Toolbar, { ToolbarButton } from '../../components/Toolbar';
import TableContainer from '../../components/TableContainer';
import ResourceGroupEditModal from '../../components/ResourceGroupEditModal';
import Modal from '../../components/Modal';
import api from '../../services/api';
import TableLoader from '../../components/TableLoader';
import TableError from '../../components/TableError';

const ResourceGroupPage: React.FC = () => {
    const [groups, setGroups] = useState<ResourceGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<ResourceGroup | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingGroup, setDeletingGroup] = useState<ResourceGroup | null>(null);

    const fetchGroups = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get<ResourceGroup[]>('/resource-groups');
            setGroups(data);
        } catch (err) {
            setError('無法獲取資源群組。');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

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
    
    const filteredGroups = useMemo(() => {
        return groups.filter(g => 
            g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.ownerTeam.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [groups, searchTerm]);

    const leftActions = (
        <div className="relative">
           <Icon name="search" className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 w-4 h-4" />
           <input 
               type="text" 
               placeholder="搜尋群組..."
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               className="w-64 bg-slate-800/80 border border-slate-700 rounded-md pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
           />
       </div>
    );

    return (
        <div className="h-full flex flex-col">
            <Toolbar 
                leftActions={leftActions}
                rightActions={<ToolbarButton icon="plus" text="新增群組" primary onClick={handleNewGroup} />}
            />
            
            <TableContainer>
                <div className="h-full overflow-y-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="px-6 py-3">群組名稱</th>
                                <th scope="col" className="px-6 py-3">擁有團隊</th>
                                <th scope="col" className="px-6 py-3">成員數量</th>
                                <th scope="col" className="px-6 py-3">狀態</th>
                                <th scope="col" className="px-6 py-3 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                             {isLoading ? (
                                <TableLoader colSpan={5} />
                            ) : error ? (
                                <TableError colSpan={5} message={error} onRetry={fetchGroups} />
                            ) : filteredGroups.map((group) => (
                                <tr key={group.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                                    <td className="px-6 py-4 font-medium text-white">
                                        {group.name}
                                        <p className="text-xs text-slate-400 font-normal">{group.description}</p>
                                    </td>
                                    <td className="px-6 py-4">{group.ownerTeam}</td>
                                    <td className="px-6 py-4">{group.memberIds.length}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <span className="flex items-center text-xs text-green-400"><span className="w-2 h-2 mr-1.5 rounded-full bg-green-400"></span>{group.statusSummary.healthy}</span>
                                            <span className="flex items-center text-xs text-yellow-400"><span className="w-2 h-2 mr-1.5 rounded-full bg-yellow-400"></span>{group.statusSummary.warning}</span>
                                            <span className="flex items-center text-xs text-red-400"><span className="w-2 h-2 mr-1.5 rounded-full bg-red-400"></span>{group.statusSummary.critical}</span>
                                        </div>
                                    </td>
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
        </div>
    );
};

export default ResourceGroupPage;