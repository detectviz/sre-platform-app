import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormRow from './FormRow';
import { User } from '../types';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  user: User | null;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ isOpen, onClose, onSave, user }) => {
    const [formData, setFormData] = useState<Partial<User>>({});

    useEffect(() => {
        if (isOpen && user) {
            setFormData(user);
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

    const roles: User['role'][] = ['Admin', 'SRE', 'Developer', 'Viewer'];
    const teams = ['SRE Platform', 'Core Infrastructure', 'API Services', 'Marketing', 'Web Team', 'DBA Team', 'DevOps'];
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
                            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </FormRow>
                <FormRow label="團隊">
                    <select value={formData.team || ''} onChange={e => handleChange('team', e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                        {teams.map(t => <option key={t} value={t}>{t}</option>)}
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
