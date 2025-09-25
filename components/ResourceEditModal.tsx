import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormRow from './FormRow';
import { Resource } from '../types';

interface ResourceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resource: Partial<Resource>) => void;
  resource: Resource | null;
}

const ResourceEditModal: React.FC<ResourceEditModalProps> = ({ isOpen, onClose, onSave, resource }) => {
    const [formData, setFormData] = useState<Partial<Resource>>({});

    useEffect(() => {
        if (isOpen) {
            setFormData(resource || {
                name: '',
                type: 'EC2 Instance',
                provider: 'AWS',
                region: 'us-east-1',
                owner: 'SRE Team',
            });
        }
    }, [isOpen, resource]);

    const handleSave = () => {
        onSave(formData);
    };

    const handleChange = (field: keyof Resource, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    
    const resourceTypes = ['API Gateway', 'RDS Database', 'EKS Cluster', 'EC2 Instance', 'ElastiCache', 'GKE Cluster', 'Compute Engine'];
    const providers = ['AWS', 'GCP', 'Azure'];
    const regions = ['us-east-1', 'us-west-2', 'eu-central-1', 'ap-northeast-1'];
    const owners = ['SRE Team', 'DBA Team', 'Web Team', 'DevOps'];


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
                                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                            {resourceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </FormRow>
                    <FormRow label="提供商">
                         <select value={formData.provider || ''} onChange={e => handleChange('provider', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                            {providers.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </FormRow>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormRow label="區域">
                         <select value={formData.region || ''} onChange={e => handleChange('region', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                            {regions.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </FormRow>
                    <FormRow label="擁有者">
                        <select value={formData.owner || ''} onChange={e => handleChange('owner', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                            {owners.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </FormRow>
                 </div>
            </div>
        </Modal>
    );
};

export default ResourceEditModal;