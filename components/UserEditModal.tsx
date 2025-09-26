import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormRow from './FormRow';
import { User, Team, Role } from '../types';
import api from '../services/api';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  user: User | null;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ isOpen, onClose, onSave, user }) => {
    const [formData, setFormData] = useState<Partial<User>>({});
    const [teams, setTeams] = useState<Team[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoadingOptions, setIsLoadingOptions] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if(user) setFormData(user);
            setIsLoadingOptions(true);
            Promise.all([
                api.get<Team[]>('/iam/teams'),
                api.get<Role[]>('/iam/roles')
            ]).then(([teamsRes, rolesRes]) => {
                setTeams(teamsRes.data);
                setRoles(rolesRes.data);
            }).catch(err => console.error("Failed to fetch teams or roles", err))
            .finally(() => setIsLoadingOptions(false));
        }
    }, [isOpen, user]);

    const handleSubmit = () => {
        if (user) {
            onSave(formData as User);
        }
    };

    const handleChange = (field: keyof User, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const statuses: User['status'][] = ['active', 'inactive', 'invited'];

    return (
        <Modal
            title={`編輯成員: ${user?.name}`}
            isOpen={isOpen}
            onClose={onClose}
            width="w-1/3 max-w-lg"
            footer={
                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">取消</button>
                    <button onClick={handleSubmit} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">儲存變更</button>
                </div>
            }
        >
            <div className="space-y-4">
                <FormRow label="電子郵件">
                    <input type="email" value={formData.email || ''} disabled
                           className="w-full bg-slate-800/50 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-400" />
                </FormRow>
                 <FormRow label="姓名">
                    <input type="text" value={formData.name || ''} disabled
                           className="w-full bg-slate-800/50 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-400" />
                </FormRow>
                <FormRow label="角色">
                    <select value={formData.role || ''} onChange={e => handleChange('role', e.target.value as User['role'])}
                            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" disabled={isLoadingOptions}>
                        {isLoadingOptions ? <option>載入中...</option> : roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                    </select>
                </FormRow>
                <FormRow label="團隊">
                    <select value={formData.team || ''} onChange={e => handleChange('team', e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" disabled={isLoadingOptions}>
                         {isLoadingOptions ? <option>載入中...</option> : teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                    </select>
                </FormRow>
                <FormRow label="狀態">
                    <select value={formData.status || ''} onChange={e => handleChange('status', e.target.value as User['status'])}
                            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                        {statuses.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                    </select>
                </FormRow>
            </div>
        </Modal>
    );
};

export default UserEditModal;