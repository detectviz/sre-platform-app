
import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import FormRow from './FormRow';
import { AutomationTrigger, TriggerType, AutomationPlaybook, TagDefinition } from '../types';
import api from '../services/api';
import Icon from './Icon';
import { showToast } from '../services/toast';
import { useOptions } from '../contexts/OptionsContext';

interface AutomationTriggerEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (trigger: Partial<AutomationTrigger>) => void;
    trigger: AutomationTrigger | null;
}

const parseConditions = (str: string | undefined): { key: string; operator: string; value: string }[] => {
    if (!str || !str.trim()) return [{ key: '', operator: '=', value: '' }];
    return str.split(' AND ').map(part => {
        const match = part.match(/([a-zA-Z0-9_.-]+)\s*(!=|~=|=)\s*(.*)/);
        if (match) {
            let value = match[3].trim();
            // remove quotes
            if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
                value = value.substring(1, value.length - 1);
            }
            return { key: match[1].trim(), operator: match[2].trim(), value: value };
        }
        return { key: '', operator: '=', value: '' };
    });
};

const serializeConditions = (conditions: { key: string; operator: string; value: string }[]): string => {
    return conditions
        .filter(c => c.key.trim() && c.value.trim())
        .map(c => `${c.key.trim()} ${c.operator} "${c.value.trim()}"`)
        .join(' AND ');
};


const AutomationTriggerEditModal: React.FC<AutomationTriggerEditModalProps> = ({ isOpen, onClose, onSave, trigger }) => {
    const [formData, setFormData] = useState<Partial<AutomationTrigger>>({});
    const [playbooks, setPlaybooks] = useState<AutomationPlaybook[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { options, isLoading: isLoadingOptions } = useOptions();
    const triggerOptions = options?.automation_triggers;
    const [tagDefs, setTagDefs] = useState<TagDefinition[]>([]);
    const [conditions, setConditions] = useState<{ key: string; operator: string; value: string }[]>([]);

    useEffect(() => {
        if (isOpen) {
            if (isLoadingOptions || !triggerOptions) return;

            setIsLoading(true);
            Promise.all([
                api.get<AutomationPlaybook[]>('/automation/scripts'),
                api.get<TagDefinition[]>('/settings/tags'),
            ]).then(([playbooksRes, tagsRes]) => {
                setPlaybooks(playbooksRes.data);
                setTagDefs(tagsRes.data);

                const initialFormData = trigger || {
                    name: '',
                    description: '',
                    type: triggerOptions.trigger_types[0]?.value || 'Schedule',
                    enabled: true,
                    target_playbook_id: playbooksRes.data[0]?.id || '',
                    config: triggerOptions.default_configs?.Schedule || { cron: '0 * * * *' },
                };
                setFormData(initialFormData);

            }).catch(err => { /* Failed to fetch data for modal */ })
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, trigger, isLoadingOptions, triggerOptions]);

    const handleSave = () => {
        onSave(formData);
    };

    useEffect(() => {
        if (formData.type === 'Event') {
            const parsed = parseConditions(formData.config?.event_conditions);
            if (JSON.stringify(parsed) !== JSON.stringify(conditions)) {
                setConditions(parsed);
            }
        }
    }, [formData.type, formData.config?.event_conditions]);

    const handleChange = (field: keyof AutomationTrigger, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleConfigChange = (field: keyof AutomationTrigger['config'], value: any) => {
        setFormData(prev => ({
            ...prev,
            config: {
                ...(prev.config || {}),
                [field]: value,
            }
        }));
    };

    const handleTypeChange = (newType: TriggerType) => {
        const newConfig = triggerOptions?.default_configs[newType] || {};
        setFormData(prev => ({
            ...prev,
            type: newType,
            config: newConfig,
        }));
    };

    const updateConditionsInForm = (newConditions: { key: string; operator: string; value: string }[]) => {
        setConditions(newConditions);
        handleConfigChange('event_conditions', serializeConditions(newConditions));
    };

    const handleConditionChange = (index: number, field: 'key' | 'operator' | 'value', value: string) => {
        const newConditions = conditions.map((cond, i) => {
            if (i === index) {
                const newCond = { ...cond, [field]: value };
                if (field === 'key') {
                    newCond.value = '';
                }
                return newCond;
            }
            return cond;
        });
        updateConditionsInForm(newConditions);
    };

    const addCondition = () => {
        updateConditionsInForm([...conditions, { key: '', operator: '=', value: '' }]);
    };
    const removeCondition = (index: number) => {
        updateConditionsInForm(conditions.filter((_, i) => i !== index));
    };

    const renderValueInput = (condition: { key: string; value: string }, index: number) => {
        const commonProps = {
            value: condition.value,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleConditionChange(index, 'value', e.target.value),
            className: "flex-grow bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm",
        };

        if (condition.key === 'severity') {
            const severityOptions = triggerOptions?.severity_options || [];
            return (
                <select {...commonProps}>
                    <option value="">選擇嚴重性...</option>
                    {severityOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            );
        }

        const tagDef = tagDefs.find(t => t.key === condition.key);
        if (tagDef && tagDef.allowed_values.length > 0) {
            return (
                <select {...commonProps}>
                    <option value="">選擇值...</option>
                    {tagDef.allowed_values.map(v => <option key={v.id} value={v.value}>{v.value}</option>)}
                </select>
            );
        }

        return <input type="text" {...commonProps} placeholder="條件值" />;
    };

    const handleCopyWebhookUrl = () => {
        if (formData.config?.webhook_url) {
            navigator.clipboard.writeText(formData.config.webhook_url)
                .then(() => showToast('Webhook URL 已複製到剪貼簿。', 'success'))
                .catch(err => showToast('無法複製 URL。', 'error'));
        } else {
            showToast('Webhook URL 尚未生成。', 'error');
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
                <FormRow label="觸發器名稱 *">
                    <input type="text" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                </FormRow>
                <FormRow label="描述">
                    <textarea value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} rows={2} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"></textarea>
                </FormRow>
                <FormRow label="目標腳本">
                    <select value={formData.target_playbook_id || ''} onChange={e => handleChange('target_playbook_id', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" disabled={isLoading}>
                        {isLoading ? <option>載入中...</option> : playbooks.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </FormRow>

                <FormRow label="觸發器類型">
                    <div className="flex space-x-2 rounded-lg bg-slate-800 p-1">
                        {isLoadingOptions ? <div className="h-9 w-full bg-slate-700 animate-pulse rounded-md"></div> : triggerOptions?.trigger_types.map(type => (
                            <button
                                key={type.value}
                                onClick={() => handleTypeChange(type.value)}
                                className={`w-full px-3 py-1.5 text-sm font-medium rounded-md ${formData.type === type.value ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </FormRow>

                <div className="pt-4 mt-4 border-t border-slate-700/50">
                    {formData.type === 'Schedule' && (
                        <FormRow label="Cron 表達式">
                            <input type="text" value={formData.config?.cron || ''} onChange={e => handleConfigChange('cron', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm font-mono" />
                            <p className="text-xs text-slate-400 mt-1">範例: '0 3 * * *' 表示每天凌晨 3 點。</p>
                        </FormRow>
                    )}
                    {formData.type === 'Webhook' && (
                        <FormRow label="Webhook URL">
                            <div className="flex items-center space-x-2">
                                <input type="text" readOnly value={formData.config?.webhook_url || '儲存後將自動生成...'} className="w-full bg-slate-800/50 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-400" />
                                <button onClick={handleCopyWebhookUrl} className="p-2 rounded-md hover:bg-slate-700 text-slate-300" title="複製"><Icon name="copy" className="w-4 h-4" /></button>
                            </div>
                        </FormRow>
                    )}
                    {formData.type === 'Event' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white">事件條件</h3>
                            <p className="text-sm text-slate-400 -mt-2">當所有以下條件都滿足時，將觸發此腳本。</p>
                            <div className="p-4 border border-slate-700 rounded-lg space-y-3 bg-slate-800/20">
                                {conditions.map((cond, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <select value={cond.key} onChange={e => handleConditionChange(index, 'key', e.target.value)} className="w-1/3 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                                            <option value="">選擇鍵...</option>
                                            {triggerOptions?.condition_keys.map(k => <option key={k} value={k}>{k}</option>)}
                                        </select>
                                        <select value={cond.operator} onChange={e => handleConditionChange(index, 'operator', e.target.value)} className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                                            <option value="=">=</option>
                                            <option value="!=">!=</option>
                                            <option value="~=">~= (regex)</option>
                                        </select>
                                        {renderValueInput(cond, index)}
                                        <button onClick={() => removeCondition(index)} className="p-2 text-slate-400 hover:text-red-400" title="移除條件"><Icon name="trash-2" className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                <button onClick={addCondition} className="text-sm text-sky-400 hover:text-sky-300 flex items-center"><Icon name="plus" className="w-4 h-4 mr-1" /> 新增條件</button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </Modal>
    );
};

export default AutomationTriggerEditModal;
