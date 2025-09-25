import React, { useState } from 'react';
import Modal from './Modal';
import FormRow from './FormRow';
import { User } from '../types';

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
    const [team, setTeam] = useState('API Services');

    const handleSubmit = () => {
        if (email) { // Basic validation
            onInvite({ email, name, role, team });
            // Reset form for next time
            setEmail('');
            setName('');
            setRole('Developer');
            setTeam('API Services');
        }
    };

    const roles: User['role'][] = ['Admin', 'SRE', 'Developer', 'Viewer'];
    const teams = ['SRE Platform', 'Core Infrastructure', 'API Services', 'Marketing', 'Web Team', 'DBA Team', 'DevOps'];

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
                            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </FormRow>
                <FormRow label="團隊">
                    <select value={team} onChange={e => setTeam(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                        {teams.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </FormRow>
            </div>
        </Modal>
    );
};

export default InviteUserModal;