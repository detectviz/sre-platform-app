import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormRow from './FormRow';
import Icon from './Icon';
import SearchableSelect from './SearchableSelect';
import { User, Role, Team } from '../types';
import api from '../services/api';

interface InviteDetails {
  email: string;
  name?: string;
  role: User['role'];
  team: string;
}

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (details: InviteDetails) => void;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({ isOpen, onClose, onInvite }) => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<User['role'] | ''>('');
    const [team, setTeam] = useState('');
    
    const [roles, setRoles] = useState<Role[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            Promise.all([
                api.get<{ items: Role[] }>('/iam/roles', { params: { page: 1, page_size: 1000 } }),
                api.get<{ items: Team[] }>('/iam/teams', { params: { page: 1, page_size: 1000 } })
            ]).then(([rolesRes, teamsRes]) => {
                const roleItems = rolesRes.data.items || [];
                const teamItems = teamsRes.data.items || [];
                setRoles(roleItems);
                setTeams(teamItems);
                if (roleItems.length > 0) {
                    setRole(prev => prev || (roleItems[0].name as User['role']));
                }
                if (teamItems.length > 0) {
                    setTeam(prev => prev || teamItems[0].name);
                }
            }).catch(err => { /* Failed to load roles/teams */ })
            .finally(() => setIsLoading(false));
        }
    }, [isOpen]);


    const handleSubmit = () => {
        if (email && role) { // Basic validation
            onInvite({ email, name, role: role as User['role'], team });
            // Reset form for next time
            setEmail('');
            setName('');
            setRole(roles[0]?.name as User['role'] || '');
            setTeam(teams[0]?.name || '');
        }
    };

    return (
        <Modal
            title="邀請新成員"
            isOpen={isOpen}
            onClose={onClose}
            width="w-1/3 max-w-lg"
            footer={
                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">取消</button>
                    <button onClick={handleSubmit} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">發送邀請</button>
                </div>
            }
        >
            <div className="space-y-4">
                <FormRow label={
                    <div className="flex items-center">
                        電子郵件
                        <span className="ml-1 text-red-400">*</span>
                    </div>
                }>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                           className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
                           placeholder="user@example.com" />
                </FormRow>
                <FormRow label="姓名 (選填)">
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                           className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
                           placeholder="請輸入使用者全名" />
                </FormRow>
                <FormRow label={
                    <div className="flex items-center">
                        角色
                        {role && roles.find(r => r.name === role)?.description && (
                            <span className="ml-1.5 text-slate-400 cursor-help" title={roles.find(r => r.name === role)?.description}>
                                <Icon name="info" className="w-3.5 h-3.5" />
                            </span>
                        )}
                    </div>
                }>
                    <SearchableSelect
                        value={role}
                        onChange={value => setRole(value as User['role'])}
                        options={roles.map(r => ({
                            value: r.name,
                            label: r.description ? `${r.name}｜${r.description}` : r.name,
                        }))}
                        placeholder={isLoading ? '載入角色中…' : '搜尋或選擇角色'}
                        disabled={isLoading || roles.length === 0}
                    />
                    <p className="mt-1 text-xs text-slate-400">選擇符合權限需求的角色，邀請後可於成員管理調整。</p>
                </FormRow>
                <FormRow label="團隊">
                    <SearchableSelect
                        value={team}
                        onChange={setTeam}
                        options={teams.map(t => ({
                            value: t.name,
                            label: `${t.name}${t.description ? `｜${t.description}` : ''}`,
                        }))}
                        placeholder={isLoading ? '載入團隊中…' : '搜尋團隊或輸入關鍵字'}
                        disabled={isLoading || teams.length === 0}
                    />
                    <p className="mt-1 text-xs text-slate-400">團隊決定了預設通知群組，可於稍後在成員資訊中變更。</p>
                </FormRow>
            </div>
        </Modal>
    );
};

export default InviteUserModal;
