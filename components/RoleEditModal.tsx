import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormRow from './FormRow';
import Icon from './Icon';
import { Role, RolePermission } from '../types';
import api from '../services/api';
import { PAGE_CONTENT } from '../constants/pages';

const { GLOBAL: globalContent, ROLE_EDIT_MODAL: content } = PAGE_CONTENT;

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
    
    useEffect(() => {
        if(isOpen) {
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
            status: role?.status || 'active',
            userCount: role?.userCount || 0,
            createdAt: role?.createdAt || '',
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

    return (
        <Modal
            title={role ? content.EDIT_TITLE : content.ADD_TITLE}
            isOpen={isOpen}
            onClose={onClose}
            width="w-1/2 max-w-3xl"
            footer={
                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">{globalContent.CANCEL}</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">{globalContent.SAVE}</button>
                </div>
            }
        >
            <div className="space-y-4 max-h-[60vh] flex flex-col">
                <FormRow label={`${content.ROLE_NAME} *`}>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                </FormRow>
                <FormRow label={globalContent.DESCRIPTION}>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"></textarea>
                </FormRow>
                
                <div className="flex-grow overflow-y-auto pr-2 -mr-4">
                    <h3 className="text-lg font-semibold text-white mb-2">{content.PERMISSION_SETTINGS}</h3>
                    <div className="space-y-2">
                        {availablePermissions.map(permModule => {
                            const rolePerm = permissions.find(p => p.module === permModule.module);
                            const allActions = permModule.actions.map(a => a.key);
                            const isAllSelected = rolePerm && allActions.every(a => rolePerm.actions.includes(a));
                            const isOpen = openModules.includes(permModule.module);

                            return (
                                <div key={permModule.module} className="border border-slate-700 rounded-lg bg-slate-800/30">
                                    <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-800/50" onClick={() => toggleModule(permModule.module)}>
                                        <div>
                                            <p className="font-semibold text-white">{permModule.module}</p>
                                            <p className="text-xs text-slate-400">{permModule.description}</p>
                                        </div>
                                        <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} className="w-5 h-5" />
                                    </div>
                                    {isOpen && (
                                        <div className="p-4 border-t border-slate-700">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <label className="flex items-center space-x-2 p-2 rounded-md bg-slate-700/50 font-semibold">
                                                    <input type="checkbox" checked={isAllSelected} onChange={e => handleSelectAll(permModule.module, allActions, e.target.checked)} className="form-checkbox h-4 w-4 rounded bg-slate-800 border-slate-600 text-sky-500" />
                                                    <span>{content.SELECT_ALL}</span>
                                                </label>
                                                {permModule.actions.map(action => (
                                                     <label key={action.key} className="flex items-center space-x-2 p-2 rounded-md hover:bg-slate-700/50">
                                                        <input type="checkbox" checked={rolePerm?.actions.includes(action.key)} onChange={e => handlePermissionChange(permModule.module, action.key, e.target.checked)} className="form-checkbox h-4 w-4 rounded bg-slate-800 border-slate-600 text-sky-500" />
                                                        <span>{action.label}</span>
                                                    </label>
                                                ))}
                                            </div>
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
