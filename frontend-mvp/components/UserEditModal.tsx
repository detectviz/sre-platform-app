import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormRow from './FormRow';
import Icon from './Icon';
import SearchableSelect from './SearchableSelect';
import StatusTag from './StatusTag';
import { User, Team, Role } from '../types';
import api from '../services/api';
import { useOptions } from '../contexts/OptionsContext';

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
    const [isLoadingLocalOptions, setIsLoadingLocalOptions] = useState(false);

    const { options, isLoading: isLoadingGlobalOptions } = useOptions();
    const personnelOptions = options?.personnel;

    useEffect(() => {
        if (isOpen) {
            if(user) setFormData(user);
            setIsLoadingLocalOptions(true);
            Promise.all([
                api.get<{ items: Team[] }>('/iam/teams', { params: { page: 1, page_size: 1000 } }),
                api.get<{ items: Role[] }>('/iam/roles', { params: { page: 1, page_size: 1000 } }),
            ]).then(([teamsRes, rolesRes]) => {
                setTeams(teamsRes.data.items || []);
                setRoles(rolesRes.data.items || []);
            }).catch(err => console.error("Failed to fetch teams or roles", err))
            .finally(() => setIsLoadingLocalOptions(false));
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
                    <input
                        type="email"
                        value={formData.email || ''}
                        disabled
                        className="w-full cursor-not-allowed rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-400"
                    />
                    <p className="mt-1 text-xs text-slate-500">帳號信箱僅供參考，若需變更請建立新帳號。</p>
                </FormRow>
                 <FormRow label="姓名">
                    <input type="text" value={formData.name || ''} disabled
                           className="w-full cursor-not-allowed rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-400" />
                </FormRow>
                <FormRow label={
                    <div className="flex items-center">
                        角色
                        {formData.role && roles.find(r => r.name === formData.role)?.description && (
                            <span className="ml-1.5 text-slate-400 cursor-help" title={roles.find(r => r.name === formData.role)?.description}>
                                <Icon name="info" className="w-3.5 h-3.5" />
                            </span>
                        )}
                    </div>
                }>
                    <SearchableSelect
                        value={formData.role || ''}
                        onChange={value => handleChange('role', value as User['role'])}
                        options={roles.map(r => ({
                            value: r.name,
                            label: r.description ? `${r.name}｜${r.description}` : r.name,
                        }))}
                        placeholder={isLoadingLocalOptions ? '載入角色中…' : '搜尋或選擇角色'}
                        disabled={isLoadingLocalOptions || roles.length === 0}
                    />
                </FormRow>
                <FormRow label="團隊">
                    <SearchableSelect
                        value={formData.team || ''}
                        onChange={value => handleChange('team', value)}
                        options={teams.map(t => ({ value: t.name, label: `${t.name}${t.description ? `｜${t.description}` : ''}` }))}
                        placeholder={isLoadingLocalOptions ? '載入團隊中…' : '搜尋或選擇團隊'}
                        disabled={isLoadingLocalOptions || teams.length === 0}
                    />
                </FormRow>
                <FormRow label="狀態">
                    <div className="flex flex-wrap gap-2">
                        {(personnelOptions?.statuses || []).map(status => {
                            const isActive = formData.status === status.value;
                            return (
                                <button
                                    key={status.value}
                                    type="button"
                                    onClick={() => handleChange('status', status.value as User['status'])}
                                    aria-pressed={isActive}
                                    className={`rounded-md border px-1.5 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 ${isActive ? 'border-sky-500 bg-sky-500/20' : 'border-slate-700 hover:border-slate-500'}`}
                                    disabled={isLoadingGlobalOptions}
                                >
                                    <StatusTag label={status.label} className={status.class_name} dense />
                                </button>
                            );
                        })}
                    </div>
                    <p className="mt-1 text-xs text-slate-400">狀態將同步影響登入權限，建議停用前先通知使用者。</p>
                </FormRow>
            </div>
        </Modal>
    );
};

export default UserEditModal;
