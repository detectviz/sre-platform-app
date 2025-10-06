import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormRow from './FormRow';
import Icon from './Icon';
import { Role, RolePermission } from '../types';
import api from '../services/api';
import { useContent } from '../contexts/ContentContext';

interface AvailablePermission {
    module: string;
    description: string;
    actions: { key: RolePermission['actions'][0], label: string }[];
}

interface RoleEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (role: Role) => void;
    role: Role | null;
}

const RoleEditModal: React.FC<RoleEditModalProps> = ({ isOpen, onClose, onSave, role }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [permissions, setPermissions] = useState<RolePermission[]>([]);
    const [availablePermissions, setAvailablePermissions] = useState<AvailablePermission[]>([]);
    const [openModules, setOpenModules] = useState<string[]>([]);
    const { content: pageContent } = useContent();
    const globalContent = pageContent?.GLOBAL;
    const content = pageContent?.ROLE_EDIT_MODAL;
    const modalTitle = role ? (content?.EDIT_TITLE ?? '編輯角色') : (content?.ADD_TITLE ?? '新增角色');
    const cancelLabel = globalContent?.CANCEL ?? '取消';
    const saveLabel = globalContent?.SAVE ?? '儲存';

    useEffect(() => {
        if (isOpen) {
            api.get<AvailablePermission[]>('/iam/permissions')
                .then(res => {
                    setAvailablePermissions(res.data);
                    const initialPermissions = res.data.map(p => ({
                        module: p.module,
                        actions: role?.permissions.find(rp => rp.module === p.module)?.actions || []
                    }));
                    setPermissions(initialPermissions);
                })
                .catch(err => console.error("Failed to fetch permissions", err));

            setName(role?.name || '');
            setDescription(role?.description || '');
            setOpenModules([]);
        }
    }, [isOpen, role]);

    const handleSave = () => {
        const savedRole: Role = {
            id: role?.id || '',
            name,
            description,
            permissions,
            enabled: role?.enabled ?? true,
            user_count: role?.user_count || 0,
            created_at: role?.created_at || '',
            updated_at: new Date().toISOString(),
        };
        onSave(savedRole);
    };

    const toggleModule = (module: string) => {
        setOpenModules(prev => prev.includes(module) ? prev.filter(m => m !== module) : [...prev, module]);
    };

    const handlePermissionChange = (module: string, action: RolePermission['actions'][0], checked: boolean) => {
        setPermissions(prev => prev.map(p => {
            if (p.module === module) {
                const newActions = checked ? [...p.actions, action] : p.actions.filter(a => a !== action);
                return { ...p, actions: newActions };
            }
            return p;
        }));
    };

    const handleSelectAll = (module: string, allActions: RolePermission['actions'], checked: boolean) => {
        setPermissions(prev => prev.map(p => {
            if (p.module === module) {
                return { ...p, actions: checked ? allActions : [] };
            }
            return p;
        }));
    };

    if (!content || !globalContent) {
        return (
            <Modal
                title={modalTitle}
                isOpen={isOpen}
                onClose={onClose}
                width="w-1/2 max-w-3xl"
            >
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
                    <Icon name="loader-circle" className="w-6 h-6 animate-spin" />
                    <p className="text-sm">正在載入角色編輯內容，請稍候...</p>
                </div>
            </Modal>
        );
    }

    const NAME_LIMIT = 50;
    const DESCRIPTION_LIMIT = 200;

    return (
        <Modal
            title={modalTitle}
            isOpen={isOpen}
            onClose={onClose}
            width="w-1/2 max-w-3xl"
            footer={
                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">{cancelLabel}</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">{saveLabel}</button>
                </div>
            }
        >
            <div className="space-y-4 max-h-[60vh] flex flex-col">
                <FormRow label={`${content.ROLE_NAME} *`}>
                    <div className="space-y-1">
                        <input
                            type="text"
                            value={name}
                            maxLength={NAME_LIMIT}
                            onChange={e => setName(e.target.value)}
                            placeholder="請輸入角色名稱，例如：事件值班主管"
                            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>名稱將顯示在權限分派與下拉選單中。</span>
                            <span className={name.length > NAME_LIMIT * 0.8 ? 'text-amber-400' : ''}>{name.length}/{NAME_LIMIT}</span>
                        </div>
                    </div>
                </FormRow>
                <FormRow label={globalContent.DESCRIPTION}>
                    <div className="space-y-1">
                        <textarea
                            value={description}
                            maxLength={DESCRIPTION_LIMIT}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            placeholder="描述此角色能執行的操作，協助團隊快速瞭解權限範圍。"
                            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                        <div className="text-right text-[11px] text-slate-500">
                            <span className={description.length > DESCRIPTION_LIMIT * 0.8 ? 'text-amber-400' : ''}>{description.length}/{DESCRIPTION_LIMIT}</span>
                        </div>
                    </div>
                </FormRow>

                <div className="flex-grow overflow-y-auto pr-2 -mr-4">
                    <h3 className="text-lg font-semibold text-white mb-2">{content.PERMISSION_SETTINGS}</h3>
                    <div className="space-y-3">
                        {availablePermissions.map(permModule => {
                            const rolePerm = permissions.find(p => p.module === permModule.module);
                            const allActions = permModule.actions.map(a => a.key);
                            const isAllSelected = rolePerm && allActions.every(a => rolePerm.actions.includes(a));
                            const isOpen = openModules.includes(permModule.module);

                            return (
                                <div key={permModule.module} className="border border-slate-700 rounded-lg bg-slate-800/30">
                                    <button
                                        type="button"
                                        className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-800/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-t-lg"
                                        onClick={() => toggleModule(permModule.module)}
                                        aria-expanded={isOpen}
                                    >
                                        <div>
                                            <p className="font-semibold text-white">{permModule.module}</p>
                                            <p className="text-xs text-slate-400">{permModule.description}</p>
                                        </div>
                                        <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} className="w-6 h-6 text-slate-300" />
                                    </button>
                                    {isOpen && (
                                        <div className="p-4 border-t border-slate-700 overflow-x-auto">
                                            <table className="w-full min-w-[420px] text-sm text-left text-slate-200">
                                                <thead className="bg-slate-900/60 text-xs uppercase text-slate-400">
                                                    <tr>
                                                        <th className="px-3 py-2 font-semibold">權限項目</th>
                                                        {permModule.actions.map(action => (
                                                            <th key={action.key} className="px-3 py-2 text-center font-semibold">{action.label}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-800/80">
                                                    <tr className="hover:bg-slate-800/40">
                                                        <td className="px-3 py-2 font-medium text-slate-200">{content.SELECT_ALL}</td>
                                                        {permModule.actions.map(action => (
                                                            <td key={`${action.key}-all`} className="px-3 py-2 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-checkbox h-4 w-4 rounded bg-slate-800 border-slate-600 text-sky-500"
                                                                    checked={!!isAllSelected}
                                                                    onChange={e => handleSelectAll(permModule.module, allActions, e.target.checked)}
                                                                    aria-label={`切換 ${permModule.module} 所有權限`}
                                                                />
                                                            </td>
                                                        ))}
                                                    </tr>
                                                    {permModule.actions.map(action => (
                                                        <tr key={action.key} className="hover:bg-slate-800/30">
                                                            <td className="px-3 py-2 text-slate-200">{action.label}</td>
                                                            {permModule.actions.map(innerAction => (
                                                                <td key={`${action.key}-${innerAction.key}`} className="px-3 py-2 text-center">
                                                                    {innerAction.key === action.key ? (
                                                                        <input
                                                                            type="checkbox"
                                                                            className="form-checkbox h-4 w-4 rounded bg-slate-800 border-slate-600 text-sky-500"
                                                                            checked={rolePerm?.actions.includes(action.key) || false}
                                                                            onChange={e => handlePermissionChange(permModule.module, action.key, e.target.checked)}
                                                                            aria-label={`${permModule.module} - ${action.label}`}
                                                                        />
                                                                    ) : (
                                                                        <span className="text-slate-700">—</span>
                                                                    )}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default RoleEditModal;