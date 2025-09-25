import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormRow from './FormRow';
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
    const [role, setRole] = useState<User['role']>('Developer');
    const [team, setTeam] = useState('');
    
    const [roles, setRoles] = useState<Role[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            Promise.all([
                api.get<Role[]>('/iam/roles'),
                api.get<Team[]>('/iam/teams')
            ]).then(([rolesRes, teamsRes]) => {
                setRoles(rolesRes.data);
                setTeams(teamsRes.data);
                if (teamsRes.data.length > 0) {
                    setTeam(teamsRes.data[0].name);
                }
            }).catch(err => console.error("Failed to load roles/teams for invite modal", err))
            .finally(() => setIsLoading(false));
        }
    }, [isOpen]);


    const handleSubmit = () => {
        if (email) { // Basic validation
            onInvite({ email, name, role, team });
            // Reset form for next time
            setEmail('');
            setName('');
            setRole('Developer');
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
                <FormRow label="電子郵件 *">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                           className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                </FormRow>
                <FormRow label="姓名 (選填)">
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                           className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                </FormRow>
                <FormRow label="角色">
                    <select value={role} onChange={e => setRole(e.target.value as User['role'])}
                            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" disabled={isLoading}>
                        {isLoading ? <option>載入中...</option> : roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                    </select>
                </FormRow>
                <FormRow label="團隊">
                    <select value={team} onChange={e => setTeam(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" disabled={isLoading}>
                        {isLoading ? <option>載入中...</option> : teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                    </select>
                </FormRow>
            </div>
        </Modal>
    );
};

export default InviteUserModal;