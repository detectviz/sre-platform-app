import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Team, User, TableColumn } from '../../../types';
import Icon from '../../../components/Icon';
import Toolbar, { ToolbarButton } from '../../../components/Toolbar';
import TableContainer from '../../../components/TableContainer';
import TeamEditModal from '../../../components/TeamEditModal';
import Modal from '../../../components/Modal';
import api from '../../../services/api';
import TableLoader from '../../../components/TableLoader';
import TableError from '../../../components/TableError';
import ColumnSettingsModal from '../../../components/ColumnSettingsModal';
import { usePageMetadata } from '../../../contexts/PageMetadataContext';
import { showToast } from '../../../services/toast';
import Pagination from '../../../components/Pagination';
import UnifiedSearchModal from '../../../components/UnifiedSearchModal';

const PAGE_IDENTIFIER = 'teams';

const TeamManagementPage: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [allColumns, setAllColumns] = useState<TableColumn[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalTeams, setTotalTeams] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filters, setFilters] = useState<{ keyword?: string }>({});

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isColumnSettingsModalOpen, setIsColumnSettingsModalOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    const { metadata: pageMetadata } = usePageMetadata();
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.columnConfigKey;

    const fetchTeamsAndUsers = useCallback(async () => {
        if (!pageKey) return;
        setIsLoading(true);
        setError(null);
        try {
            const params = { page: currentPage, page_size: pageSize, ...filters };
            const [teamsRes, usersRes, columnConfigRes, allColumnsRes] = await Promise.all([
                api.get<{ items: Team[], total: number }>('/iam/teams', { params }),
                api.get<{ items: User[] }>('/iam/users', { params: { page: 1, page_size: 1000 } }),
                api.get<string[]>(`/settings/column-config/${pageKey}`),
                api.get<TableColumn[]>(`/pages/columns/${pageKey}`)
            ]);

            setUsers(usersRes.data.items);
            setTeams(teamsRes.data.items);
            setTotalTeams(teamsRes.data.total);
            if (allColumnsRes.data.length === 0) {
                throw new Error('欄位定義缺失');
            }
            setAllColumns(allColumnsRes.data);
            const resolvedVisibleColumns = columnConfigRes.data.length > 0
                ? columnConfigRes.data
                : allColumnsRes.data.map(c => c.key);
            setVisibleColumns(resolvedVisibleColumns);

        } catch (err) {
            setError('無法獲取團隊或使用者列表。');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, filters, pageKey]);

    useEffect(() => {
        if (pageKey) {
            fetchTeamsAndUsers();
        }
    }, [fetchTeamsAndUsers, pageKey]);
    
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
    const findUserById = (id: string): User | undefined => userMap.get(id);
    
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
    
    const handleBatchDelete = async () => {
        try {
            await api.post('/iam/teams/batch-actions', { action: 'delete', ids: selectedIds });
            setSelectedIds([]);
            fetchTeamsAndUsers();
        } catch (err) {
            alert('Failed to delete selected teams.');
        }
    };

    const leftActions = (
         <ToolbarButton icon="search" text="搜尋和篩選" onClick={() => setIsSearchModalOpen(true)} />
    );
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedIds(e.target.checked ? teams.map(t => t.id) : []);
    };
    
    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        setSelectedIds(prev => e.target.checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id));
    };

    const isAllSelected = teams.length > 0 && selectedIds.length === teams.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < teams.length;

    const batchActions = (
        <ToolbarButton icon="trash-2" text="刪除" danger onClick={handleBatchDelete} />
    );

    const renderCellContent = (team: Team, columnKey: string) => {
        switch (columnKey) {
            case 'name':
                return (
                    <>
                        <div className="font-medium text-white flex items-center">
                            {team.name}
                            {team.description && (
                                <span className="ml-1.5 text-slate-400 cursor-help" title={team.description}>
                                    <Icon name="info" className="w-3.5 h-3.5" />
                                </span>
                            )}
                        </div>
                    </>
                );
            case 'ownerId':
                return findUserById(team.ownerId)?.name || 'N/A';
            case 'memberIds':
                return team.memberIds.length;
            case 'createdAt':
                return team.createdAt;
            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <Toolbar 
                leftActions={leftActions}
                rightActions={
                    <>
                        <ToolbarButton icon="settings-2" text="欄位設定" onClick={() => setIsColumnSettingsModalOpen(true)} />
                        <ToolbarButton icon="plus" text="新增團隊" primary onClick={handleNewTeam} />
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
                                <TableError colSpan={visibleColumns.length + 2} message={error} onRetry={fetchTeamsAndUsers} />
                            ) : teams.map((team) => (
                                <tr key={team.id} className={`border-b border-slate-800 ${selectedIds.includes(team.id) ? 'bg-sky-900/50' : 'hover:bg-slate-800/40'}`}>
                                    <td className="p-4 w-12">
                                        <input type="checkbox" className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600"
                                               checked={selectedIds.includes(team.id)} onChange={(e) => handleSelectOne(e, team.id)} />
                                    </td>
                                    {visibleColumns.map(key => (
                                        <td key={key} className="px-6 py-4">{renderCellContent(team, key)}</td>
                                    ))}
                                    <td className="px-6 py-4 text-center">
                                         <button onClick={() => handleEditTeam(team)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="編輯"><Icon name="edit-3" className="w-4 h-4" /></button>
                                         <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(team); }} className="p-1.5 rounded-md text-red-400 hover:bg-red-500/20 hover:text-red-300" title="刪除"><Icon name="trash-2" className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination total={totalTeams} page={currentPage} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
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
            <ColumnSettingsModal
                isOpen={isColumnSettingsModalOpen}
                onClose={() => setIsColumnSettingsModalOpen(false)}
                onSave={handleSaveColumnConfig}
                allColumns={allColumns}
                visibleColumnKeys={visibleColumns}
            />
            <UnifiedSearchModal
                page="teams"
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

export default TeamManagementPage;