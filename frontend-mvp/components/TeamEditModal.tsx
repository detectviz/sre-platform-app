
import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import FormRow from './FormRow';
import Icon from './Icon';
import { Team, User } from '../types';
import api from '../services/api';

interface TeamEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (team: Team) => void;
    team: Team | null;
}

interface UserListItemProps {
    user: User;
    onAction: (id: string) => void;
    iconName: string;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, onAction, iconName }) => (
    <div className="flex items-center justify-between p-2 rounded-md hover:bg-slate-700/50 text-sm">
        <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center mr-2 shrink-0">
                <Icon name="user" className="w-4 h-4 text-slate-300" />
            </div>
            <div>
                <p className="font-medium text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
            </div>
        </div>
        <button onClick={() => onAction(user.id)} className="p-1 rounded-full text-slate-400 hover:bg-slate-600 hover:text-white">
            <Icon name={iconName} className="w-4 h-4" />
        </button>
    </div>
);

const DESCRIPTION_LIMIT = 200;

const TeamEditModal: React.FC<TeamEditModalProps> = ({ isOpen, onClose, onSave, team }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [owner_id, setOwnerId] = useState('');
    const [memberIds, setMemberIds] = useState<string[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [availableFilter, setAvailableFilter] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName(team?.name || '');
            setDescription(team?.description || '');
            setOwnerId(team?.owner_id || '');
            setMemberIds(team?.member_ids || []);

            setIsLoading(true);
            api.get<{ items: User[] }>('/iam/users', { params: { page: 1, page_size: 1000 } })
                .then(res => {
                    setAllUsers(res.data.items);
                    if (!team?.owner_id && res.data.items.length > 0) {
                        setOwnerId(res.data.items[0].id);
                    }
                })
                .catch(err => console.error("Failed to fetch users", err))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, team]);

    const handleSave = () => {
        const savedTeam: Team = {
            id: team?.id || '',
            name,
            description,
            owner_id: owner_id,
            member_ids: memberIds,
            created_at: team?.created_at || '',
            updated_at: new Date().toISOString(),
        };
        onSave(savedTeam);
    };

    const availableUsers = useMemo(() => {
        const base = allUsers.filter(u => !memberIds.includes(u.id));
        if (!availableFilter.trim()) return base;
        const keyword = availableFilter.trim().toLowerCase();
        return base.filter(u => u.name.toLowerCase().includes(keyword) || u.email.toLowerCase().includes(keyword));
    }, [memberIds, allUsers, availableFilter]);
    const selectedUsers = useMemo(() => {
        const base = allUsers.filter(u => memberIds.includes(u.id));
        if (!selectedFilter.trim()) return base;
        const keyword = selectedFilter.trim().toLowerCase();
        return base.filter(u => u.name.toLowerCase().includes(keyword) || u.email.toLowerCase().includes(keyword));
    }, [memberIds, allUsers, selectedFilter]);

    return (
        <Modal
            title={team ? '編輯團隊' : '新增團隊'}
            isOpen={isOpen}
            onClose={onClose}
            width="w-2/3 max-w-4xl"
            footer={
                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">取消</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">儲存</button>
                </div>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormRow label="團隊名稱 *">
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                    </FormRow>
                    <FormRow label="擁有者">
                        <select value={owner_id} onChange={e => setOwnerId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                            {allUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </FormRow>
                </div>
                <FormRow label="描述">
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value.slice(0, DESCRIPTION_LIMIT))}
                        rows={3}
                        className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
                        placeholder="說明團隊職責或範圍，最多 200 字"
                    ></textarea>
                    <p className={`mt-1 text-xs ${description.length >= DESCRIPTION_LIMIT ? 'text-amber-300' : 'text-slate-400'}`}>
                        {description.length}/{DESCRIPTION_LIMIT}
                    </p>
                </FormRow>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">成員管理</label>
                    <div className="grid grid-cols-2 gap-4 h-72">
                        <div className="border border-slate-700 rounded-lg p-3 flex flex-col">
                            <h3 className="font-semibold mb-2 text-white">可用的人員 ({availableUsers.length})</h3>
                            <input
                                type="text"
                                value={availableFilter}
                                onChange={e => setAvailableFilter(e.target.value)}
                                placeholder="搜尋姓名或信箱"
                                className="mb-2 rounded-md border border-slate-600 bg-slate-900/60 px-3 py-1.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
                            />
                            {isLoading ? <Icon name="loader-circle" className="animate-spin text-slate-400 mx-auto mt-4" /> : (
                                <div className="space-y-1 overflow-y-auto flex-grow">
                                    {availableUsers.map(u => <UserListItem key={u.id} user={u} onAction={(id) => setMemberIds(ids => [...ids, id])} iconName="chevron-right" />)}
                                </div>
                            )}
                        </div>
                        <div className="border border-slate-700 rounded-lg p-3 flex flex-col">
                            <h3 className="font-semibold mb-2 text-white">團隊成員 ({selectedUsers.length})</h3>
                            <input
                                type="text"
                                value={selectedFilter}
                                onChange={e => setSelectedFilter(e.target.value)}
                                placeholder="快速篩選團隊成員"
                                className="mb-2 rounded-md border border-slate-600 bg-slate-900/60 px-3 py-1.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
                            />
                            {isLoading ? <Icon name="loader-circle" className="animate-spin text-slate-400 mx-auto mt-4" /> : (
                                <div className="space-y-1 overflow-y-auto flex-grow">
                                    {selectedUsers.map(u => <UserListItem key={u.id} user={u} onAction={(id) => setMemberIds(ids => ids.filter(i => i !== id))} iconName="chevron-left" />)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default TeamEditModal;
