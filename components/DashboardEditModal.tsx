import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormRow from './FormRow';
import { Dashboard } from '../types';
import api from '../services/api';

interface DashboardOptions {
    categories: string[];
    owners: string[];
}

interface DashboardEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dashboard: Dashboard) => void;
  dashboard: Dashboard | null;
}

const DashboardEditModal: React.FC<DashboardEditModalProps> = ({ isOpen, onClose, onSave, dashboard }) => {
    const [formData, setFormData] = useState<Partial<Dashboard>>({});
    const [options, setOptions] = useState<DashboardOptions>({ categories: [], owners: [] });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && dashboard) {
            setFormData(dashboard);
            setIsLoading(true);
            api.get<DashboardOptions>('/dashboards/options')
                .then(res => setOptions(res.data))
                .catch(err => console.error("Failed to fetch dashboard options", err))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, dashboard]);

    const handleSave = () => {
        if (dashboard) {
            onSave(formData as Dashboard);
        }
    };

    const handleChange = (field: keyof Dashboard, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Modal
            title={`編輯儀表板設定: ${dashboard?.name}`}
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
                <FormRow label="儀表板名稱 *">
                    <input type="text" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)}
                           className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                </FormRow>
                <FormRow label="描述">
                     <textarea value={formData.description || ''} onChange={e => handleChange('description', e.target.value)}
                           rows={3} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                </FormRow>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormRow label="類別">
                        <select value={formData.category || ''} onChange={e => handleChange('category', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" disabled={isLoading}>
                            {isLoading ? <option>載入中...</option> : options.categories.map(c => <option key={c} value={c}>{c}</option>)}
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

export default DashboardEditModal;