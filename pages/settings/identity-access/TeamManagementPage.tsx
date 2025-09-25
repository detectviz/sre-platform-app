import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Team, User } from '../../../types';
import Icon from '../../../components/Icon';
import Toolbar, { ToolbarButton } from '../../../components/Toolbar';
import TableContainer from '../../../components/TableContainer';
import TeamEditModal from '../../../components/TeamEditModal';
import Modal from '../../../components/Modal';
import api from '../../../services/api';
import TableLoader from '../../../components/TableLoader';
import TableError from '../../../components/TableError';

const TeamManagementPage: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);

    const fetchTeamsAndUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [teamsRes, usersRes] = await Promise.all([
                api.get<Team[]>('/iam/teams'),
                api.get<{ items: User[] }>('/iam/users', { params: { page: 1, page_size: 1000 } })
            ]);
            
            setUsers(usersRes.data.items);
            
            // Mock search locally as API doesn't support it yet
            const filteredTeams = teamsRes.data.filter(team =>
                team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                team.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setTeams(filteredTeams);

        } catch (err) {
            setError('無法獲取團隊或使用者列表。');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        fetchTeamsAndUsers();
    }, [fetchTeamsAndUsers]);
    
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
    const findUserById = (id: string): User | undefined => userMap.get(id);

    const handleNewTeam = () => {
        setEditingTeam(null);
        setIsModalOpen(true);
    };

    const handleEditTeam = (team: Team) => {
        setEditingTeam(team);
        setIsModalOpen(true);
    };

    const handleSaveTeam = async (team: Team) => {
        try {
            if (editingTeam) {
                await api.patch(`/iam/teams/${team.id}`, team);
            } else {
                await api.post('/iam/teams', team);
            }
            fetchTeamsAndUsers();
        } catch (err) {
            alert('Failed to save team.');
        } finally {
            setIsModalOpen(false);
        }
    };

    const handleDeleteClick = (team: Team) => {
        setDeletingTeam(team);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (deletingTeam) {
            try {
                await api.del(`/iam/teams/${deletingTeam.id}`);
                fetchTeamsAndUsers();
            } catch (err) {
                alert('Failed to delete team.');
            } finally {
                setIsDeleteModalOpen(false);
                setDeletingTeam(null);
            }
        }
    };

    const leftActions = (
         <div className="relative">
            <Icon name="search" className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
                type="text"
                placeholder="依團隊名稱、描述搜尋..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-80 bg-slate-800/80 border border-slate-700 rounded-md pl-9 pr-4 py-1.5 text-sm"
            />
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            <Toolbar 
                leftActions={leftActions}
                rightActions={<ToolbarButton icon="plus" text="新增團隊" primary onClick={handleNewTeam} />}
            />

            <TableContainer>
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="px-6 py-3">團隊名稱</th>
                                <th scope="col" className="px-6 py-3">擁有者</th>
                                <th scope="col" className="px-6 py-3">成員數</th>
                                <th scope="col" className="px-6 py-3">創建時間</th>
                                <th scope="col" className="px-6 py-3 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={5} />
                            ) : error ? (
                                <TableError colSpan={5} message={error} onRetry={fetchTeamsAndUsers} />
                            ) : teams.map((team) => (
                                <tr key={team.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                                    <td className="px-6 py-4 font-medium text-white">
                                        {team.name}
                                        <p className="text-xs text-slate-400 font-normal">{team.description}</p>
                                    </td>
                                    <td className="px-6 py-4">{findUserById(team.ownerId)?.name || 'N/A'}</td>
                                    <td className="px-6 py-4">{team.memberIds.length}</td>
                                    <td className="px-6 py-4">{team.createdAt}</td>
                                    <td className="px-6 py-4 text-center">
                                         <button onClick={() => handleEditTeam(team)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="編輯"><Icon name="edit-3" className="w-4 h-4" /></button>
                                         <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(team); }} className="p-1.5 rounded-md text-red-400 hover:bg-red-500/20 hover:text-red-300" title="刪除"><Icon name="trash-2" className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </TableContainer>
            {isModalOpen && 
                <TeamEditModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveTeam}
                    team={editingTeam}
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
                <p>您確定要刪除團隊 <strong className="text-amber-400">{deletingTeam?.name}</strong> 嗎？</p>
                <p className="mt-2 text-slate-400">此操作無法復原，但不會刪除團隊內的成員。</p>
            </Modal>
        </div>
    );
};

export default TeamManagementPage;