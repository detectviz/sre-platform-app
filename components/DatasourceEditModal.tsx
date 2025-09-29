
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormRow from './FormRow';
import Icon from './Icon';
import KeyValueInput from './KeyValueInput';
import { Datasource, KeyValueTag } from '../types';
import { showToast } from '../services/toast';
import { useOptions } from '../contexts/OptionsContext';

interface DatasourceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (datasource: Partial<Datasource>) => void;
  datasource: Datasource | null;
}

const DatasourceEditModal: React.FC<DatasourceEditModalProps> = ({ isOpen, onClose, onSave, datasource }) => {
    const [formData, setFormData] = useState<Partial<Datasource>>({});
    const [isTesting, setIsTesting] = useState(false);
    const { options, isLoading: isLoadingOptions } = useOptions();
    const datasourceOptions = options?.datasources;

    useEffect(() => {
        if (isOpen && datasourceOptions) {
            setFormData(datasource || {
                name: '',
                type: datasourceOptions.types[0] || 'Prometheus',
                url: '',
                authMethod: datasourceOptions.authMethods[0] || 'None',
                tags: []
            });
        }
    }, [isOpen, datasource, datasourceOptions]);
    
    const handleChange = (field: keyof Datasource, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onSave(formData);
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        showToast('正在測試連線...', 'success');
        await new Promise(res => setTimeout(res, 1500)); // Simulate API call
        const success = Math.random() > 0.3; // Simulate success/failure
        if (success) {
            showToast('連線成功！', 'success');
        } else {
            showToast('連線失敗，請檢查 URL 和驗證方式。', 'error');
        }
        setIsTesting(false);
    };

    return (
        <Modal
            title={datasource ? '編輯 Datasource' : '新增 Datasource'}
            isOpen={isOpen}
            onClose={onClose}
            width="w-1/2 max-w-2xl"
            footer={
                <div className="flex justify-between w-full">
                    <button onClick={handleTestConnection} disabled={isTesting} className="flex items-center text-sm px-4 py-2 rounded-md transition-colors text-white bg-slate-600 hover:bg-slate-500 disabled:opacity-50">
                        {isTesting ? <Icon name="loader-circle" className="w-4 h-4 mr-2 animate-spin" /> : <Icon name="plug-zap" className="w-4 h-4 mr-2" />}
                        {isTesting ? '測試中...' : '測試連線'}
                    </button>
                    <div className="flex space-x-2">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">取消</button>
                        <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">儲存</button>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <FormRow label="名稱 *">
                    <input type="text" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                </FormRow>
                <div className="grid grid-cols-2 gap-4">
                    <FormRow label="類型">
                        <select value={formData.type || ''} onChange={e => handleChange('type', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" disabled={isLoadingOptions}>
                            {isLoadingOptions && <option>載入中...</option>}
                            {datasourceOptions?.types.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </FormRow>
                    <FormRow label="驗證方式">
                        <select value={formData.authMethod || ''} onChange={e => handleChange('authMethod', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" disabled={isLoadingOptions}>
                           {isLoadingOptions && <option>載入中...</option>}
                           {datasourceOptions?.authMethods.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </FormRow>
                </div>
                <FormRow label="URL / Endpoint *">
                    <input type="text" value={formData.url || ''} onChange={e => handleChange('url', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                </FormRow>
                <FormRow label="標籤">
                    <KeyValueInput values={formData.tags || []} onChange={(tags) => handleChange('tags', tags)} />
                </FormRow>
            </div>
        </Modal>
    );
};

export default DatasourceEditModal;
