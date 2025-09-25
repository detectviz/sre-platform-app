import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormRow from './FormRow';
import Icon from './Icon';
import { AutomationTrigger, TriggerType } from '../types';
import { MOCK_PLAYBOOKS } from '../constants';

interface AutomationTriggerEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trigger: AutomationTrigger) => void;
  trigger: AutomationTrigger | null;
}

const AutomationTriggerEditModal: React.FC<AutomationTriggerEditModalProps> = ({ isOpen, onClose, onSave, trigger }) => {
    const [formData, setFormData] = useState<Partial<AutomationTrigger>>({});

    useEffect(() => {
        if (isOpen) {
            setFormData(trigger || { name: '', description: '', type: 'Schedule', enabled: true, targetPlaybookId: '', config: {} });
        }
    }, [isOpen, trigger]);

    const handleSave = () => {
        onSave(formData as AutomationTrigger);
    };

    const handleChange = (field: keyof AutomationTrigger, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleConfigChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, config: { ...prev.config, [field]: value } }));
    };
    
    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as TriggerType;
        setFormData(prev => ({ ...prev, type: newType, config: {} }));
    };

    const renderConfigFields = () => {
        switch (formData.type) {
            case 'Schedule':
                return (
                    <FormRow label="Cron 表達式">
                        <input type="text" value={formData.config?.cron || ''} onChange={e => handleConfigChange('cron', e.target.value)}
                               className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm font-mono" placeholder="* * * * *" />
                        <p className="text-xs text-slate-400 mt-1">範例: '0 3 * * *' 表示每天凌晨 3 點。</p>
                    </FormRow>
                );
            case 'Webhook':
                return (
                    <FormRow label="Webhook URL">
                        <div className="flex items-center space-x-2">
                            <input type="text" readOnly value={formData.config?.webhookUrl || '儲存後自動生成'}
                                   className="w-full bg-slate-800/50 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-400" />
                            <button className="p-2 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="複製"><Icon name="copy" className="w-4 h-4" /></button>
                        </div>
                    </FormRow>
                );
            case 'Event':
                 return (
                    <FormRow label="事件條件">
                        <textarea value={formData.config?.eventConditions || ''} onChange={e => handleConfigChange('eventConditions', e.target.value)} rows={3}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm font-mono" placeholder="e.g., severity = critical AND resource_type = EC2" />
                    </FormRow>
                );
            default:
                return null;
        }
    };

    return (
        <Modal
            title={trigger ? '編輯觸發器' : '新增觸發器'}
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
                <FormRow label="名稱 *">
                    <input type="text" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                </FormRow>
                <FormRow label="描述">
                    <textarea value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} rows={2} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"></textarea>
                </FormRow>
                <FormRow label="目標腳本 *">
                    <select value={formData.targetPlaybookId || ''} onChange={e => handleChange('targetPlaybookId', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                        <option value="">選擇一個腳本...</option>
                        {MOCK_PLAYBOOKS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </FormRow>
                 <div className="pt-4 mt-4 border-t border-slate-700/50 space-y-4">
                    <FormRow label="觸發器類型">
                        <select value={formData.type || 'Schedule'} onChange={handleTypeChange} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                            <option value="Schedule">排程</option>
                            <option value="Webhook">Webhook</option>
                            <option value="Event">事件</option>
                        </select>
                    </FormRow>
                    {renderConfigFields()}
                </div>
            </div>
        </Modal>
    );
};

export default AutomationTriggerEditModal;
