import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormRow from './FormRow';
import { Dashboard } from '../types';
import { useOptions } from '../contexts/OptionsContext';
import { useContent } from '../contexts/ContentContext';

interface DashboardEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dashboard: Dashboard) => void;
  dashboard: Dashboard | null;
}

const DashboardEditModal: React.FC<DashboardEditModalProps> = ({ isOpen, onClose, onSave, dashboard }) => {
    const [formData, setFormData] = useState<Partial<Dashboard>>({});
    const { options, isLoading: isLoadingOptions } = useOptions();
    const { content } = useContent();
    const pageContent = content?.DASHBOARD_LIST;
    const globalContent = content?.GLOBAL;
    const dashboardOptions = options?.dashboards;

    useEffect(() => {
        if (isOpen && dashboard) {
            setFormData(dashboard);
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

    if (!pageContent || !globalContent) return null;

    return (
        <Modal
            title={`${pageContent.ACTIONS.SETTINGS}: ${dashboard?.name}`}
            isOpen={isOpen}
            onClose={onClose}
            width="w-1/2 max-w-2xl"
            footer={
                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">{globalContent.CANCEL}</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">{globalContent.SAVE}</button>
                </div>
            }
        >
            <div className="space-y-4">
                <FormRow label={`${pageContent.TABLE_HEADERS.NAME} *`}>
                    <input type="text" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)}
                           className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                </FormRow>
                <FormRow label={globalContent.DESCRIPTION}>
                     <textarea value={formData.description || ''} onChange={e => handleChange('description', e.target.value)}
                           rows={3} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                </FormRow>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormRow label={pageContent.TABLE_HEADERS.CATEGORY}>
                        <select value={formData.category || ''} onChange={e => handleChange('category', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" disabled={isLoadingOptions}>
                            {isLoadingOptions ? <option>{globalContent.LOADING_OPTIONS}</option> : dashboardOptions?.categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </FormRow>
                    <FormRow label={pageContent.TABLE_HEADERS.OWNER}>
                         <select value={formData.owner || ''} onChange={e => handleChange('owner', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" disabled={isLoadingOptions}>
                            {isLoadingOptions ? <option>{globalContent.LOADING_OPTIONS}</option> : dashboardOptions?.owners.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </FormRow>
                </div>
            </div>
        </Modal>
    );
};

export default DashboardEditModal;
