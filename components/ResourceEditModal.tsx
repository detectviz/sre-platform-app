import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormRow from './FormRow';
import { Resource } from '../types';
import api from '../services/api';

interface ResourceOptions {
    types: string[];
    providers: string[];
    regions: string[];
    owners: string[];
}

interface ResourceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resource: Partial<Resource>) => void;
  resource: Resource | null;
}

const ResourceEditModal: React.FC<ResourceEditModalProps> = ({ isOpen, onClose, onSave, resource }) => {
    const [formData, setFormData] = useState<Partial<Resource>>({});
    const [options, setOptions] = useState<ResourceOptions>({ types: [], providers: [], regions: [], owners: [] });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(resource || {
                name: '',
                type: '',
                provider: '',
                region: '',
                owner: '',
            });

            setIsLoading(true);
            api.get<ResourceOptions>('/resources/options')
                .then(res => setOptions(res.data))
                .catch(err => console.error("Failed to fetch resource options", err))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, resource]);

    const handleSave = () => {
        onSave(formData);
    };

    const handleChange = (field: keyof Resource, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Modal
            title={resource ? '編輯資源' : '新增資源'}
            isOpen={isOpen}
            onClose={onClose}
            width="w-1/2 max-w-2xl"
            footer={
                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">取消</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">儲存</button>
                </div>
            }
        >
            <div className="space-y-4">
                <FormRow label="資源名稱 *">
                    <input type="text" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)}
                           className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                </FormRow>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormRow label="類型">
                        <select value={formData.type || ''} onChange={e => handleChange('type', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" disabled={isLoading}>
                            {isLoading ? <option>載入中...</option> : options.types.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </FormRow>
                    <FormRow label="提供商">
                         <select value={formData.provider || ''} onChange={e => handleChange('provider', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" disabled={isLoading}>
                            {isLoading ? <option>載入中...</option> : options.providers.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </FormRow>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormRow label="區域">
                         <select value={formData.region || ''} onChange={e => handleChange('region', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" disabled={isLoading}>
                            {isLoading ? <option>載入中...</option> : options.regions.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </FormRow>
                    <FormRow label="擁有者">
                        <select value={formData.owner || ''} onChange={e => handleChange('owner', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" disabled={isLoading}>
                           {isLoading ? <option>載入中...</option> : options.owners.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </FormRow>
                 </div>
            </div>
        </Modal>
    );
};

export default ResourceEditModal;