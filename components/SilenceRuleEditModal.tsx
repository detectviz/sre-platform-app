import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import Wizard from './Wizard';
import FormRow from './FormRow';
import { SilenceRule, SilenceMatcher, SilenceSchedule, SilenceRuleTemplate } from '../types';
import api from '../services/api';
import { useUser } from '../contexts/UserContext';

interface SilenceRuleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: SilenceRule) => void;
  rule: SilenceRule | null;
}

const SilenceRuleEditModal: React.FC<SilenceRuleEditModalProps> = ({ isOpen, onClose, onSave, rule }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<Partial<SilenceRule>>({});
    const { currentUser } = useUser();
    
    const getInitialFormData = (): Partial<SilenceRule> => ({
        name: '',
        description: '',
        enabled: true,
        type: 'single',
        matchers: [{ key: 'env', operator: '=', value: 'staging' }],
        schedule: { type: 'single', startsAt: new Date().toISOString().slice(0, 16), endsAt: new Date(Date.now() + 3600 * 1000).toISOString().slice(0, 16) }
    });

    useEffect(() => {
        if (isOpen) {
            setFormData(rule || getInitialFormData());
            setCurrentStep(1);
        }
    }, [isOpen, rule]);

    const handleSave = () => {
        const finalRule: SilenceRule = {
            id: rule?.id || `new-sil-${Date.now()}`,
            name: formData.name || 'Untitled Silence Rule',
            description: formData.description || '',
            enabled: formData.enabled !== false,
            type: formData.schedule?.type === 'single' ? 'single' : 'repeat',
            matchers: formData.matchers || [],
            schedule: formData.schedule || { type: 'single' },
            creator: rule?.creator || currentUser?.name || 'System',
            createdAt: rule?.createdAt || new Date().toISOString(),
        };
        onSave(finalRule);
    };

    const nextStep = () => setCurrentStep(s => Math.min(s + 1, 3));
    const prevStep = () => setCurrentStep(s => Math.max(s - 1, 1));
    
    const renderStepContent = () => {
        switch (currentStep) {
            case 1: return <Step1 formData={formData} setFormData={setFormData} />;
            case 2: return <Step2 formData={formData} setFormData={setFormData} />;
            case 3: return <Step3 formData={formData} setFormData={setFormData} />;
            default: return null;
        }
    };
    
    const stepTitles = ["基本資訊", "設定排程", "設定範圍"];
    
    return (
        <Modal
            title={rule ? '編輯靜音規則' : '新增靜音規則'}
            isOpen={isOpen}
            onClose={onClose}
            width="w-2/3 max-w-4xl"
            footer={
                <div className="flex justify-between w-full">
                    <div>
                        {currentStep > 1 && <button onClick={prevStep} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">上一步</button>}
                    </div>
                     <div className="flex items-center space-x-2">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">取消</button>
                        {currentStep < 3 && <button onClick={nextStep} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors">下一步：{stepTitles[currentStep]}</button>}
                        {currentStep === 3 && <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors">完成</button>}
                    </div>
                </div>
            }
        >
             <div className="flex flex-col h-[60vh]">
                 <div className="px-4 pb-6 border-b border-slate-700/50">
                   <Wizard currentStep={currentStep} steps={stepTitles} onStepClick={setCurrentStep} />
                </div>
                <div className="flex-grow pt-6 overflow-y-auto">
                    {renderStepContent()}
                </div>
            </div>
        </Modal>
    );
};

const Step1 = ({ formData, setFormData }: { formData: Partial<SilenceRule>, setFormData: Function }) => {
    const [templates, setTemplates] = useState<SilenceRuleTemplate[]>([]);

    useEffect(() => {
        api.get<SilenceRuleTemplate[]>('/silence-rules/templates')
            .then(res => setTemplates(res.data))
            .catch(err => console.error("Failed to fetch silence rule templates", err));
    }, []);

     const applyTemplate = (templateData: Partial<SilenceRule>) => {
        setFormData({ ...formData, ...templateData });
    };
    return (
        <div className="space-y-6 px-4">
            <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-2">快速套用範本</h3>
                <div className="flex flex-wrap gap-2">
                    {templates.map(tpl => (
                        <button key={tpl.id} onClick={() => applyTemplate(tpl.data)} className="px-3 py-1.5 text-sm bg-slate-700/50 hover:bg-slate-700 rounded-md flex items-center">
                           <span className="mr-2">{tpl.emoji}</span> {tpl.name}
                        </button>
                    ))}
                </div>
            </div>
            <FormRow label="規則名稱 *">
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
            </FormRow>
            <FormRow label="描述">
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"></textarea>
            </FormRow>
        </div>
    );
};

const Step2 = ({ formData, setFormData }: { formData: Partial<SilenceRule>, setFormData: Function }) => {
    const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('custom');
    const [weeklyDays, setWeeklyDays] = useState<number[]>([]);
    const [time, setTime] = useState('02:00');

    const handleScheduleChange = (field: keyof SilenceSchedule, value: any) => {
        setFormData({ ...formData, schedule: { ...(formData.schedule || {}), [field]: value } });
    };

    const handleTypeChange = (newType: 'single' | 'recurring') => {
        const newSchedule = { ...(formData.schedule || {}), type: newType };
        if (newType === 'single') {
            delete newSchedule.cron;
            if (!newSchedule.startsAt) newSchedule.startsAt = new Date().toISOString().slice(0, 16);
            if (!newSchedule.endsAt) newSchedule.endsAt = new Date(Date.now() + 3600 * 1000).toISOString().slice(0, 16);
        } else {
            delete newSchedule.startsAt;
            delete newSchedule.endsAt;
            if (!newSchedule.cron) newSchedule.cron = '0 2 * * *'; // Default daily at 2 AM
        }
        setFormData({ ...formData, schedule: newSchedule });
    };

    return (
        <div className="space-y-4 px-4">
            <FormRow label="排程類型">
                 <div className="flex space-x-2 rounded-lg bg-slate-800 p-1">
                    <button onClick={() => handleTypeChange('single')} className={`w-full px-3 py-1.5 text-sm font-medium rounded-md ${formData.schedule?.type === 'single' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>單次靜音</button>
                    <button onClick={() => handleTypeChange('recurring')} className={`w-full px-3 py-1.5 text-sm font-medium rounded-md ${formData.schedule?.type === 'recurring' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>週期性靜音</button>
                </div>
            </FormRow>
            {formData.schedule?.type === 'single' && (
                <div className="grid grid-cols-2 gap-4">
                    <FormRow label="開始時間">
                        <input type="datetime-local" value={formData.schedule?.startsAt || ''} onChange={e => handleScheduleChange('startsAt', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                    </FormRow>
                    <FormRow label="結束時間">
                        <input type="datetime-local" value={formData.schedule?.endsAt || ''} onChange={e => handleScheduleChange('endsAt', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                    </FormRow>
                </div>
            )}
            {formData.schedule?.type === 'recurring' && (
                <div className="p-4 border border-slate-700 rounded-lg space-y-4 bg-slate-800/20">
                    <div className="grid grid-cols-2 gap-4">
                         <FormRow label="重複頻率">
                             <select value={recurrenceType} onChange={e => setRecurrenceType(e.target.value as any)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                                <option value="daily">每日</option>
                                <option value="weekly">每週</option>
                                <option value="monthly">每月</option>
                                <option value="custom">自訂 Cron</option>
                            </select>
                         </FormRow>
                         <FormRow label="執行時間">
                            <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"/>
                         </FormRow>
                    </div>
                    {recurrenceType === 'weekly' && (
                         <FormRow label="選擇星期">
                            <div className="flex space-x-2">
                                {['日', '一', '二', '三', '四', '五', '六'].map((day, i) => (
                                    <button key={i} className={`w-10 h-10 rounded-full flex items-center justify-center ${weeklyDays.includes(i) ? 'bg-sky-500' : 'bg-slate-700'}`}
                                     onClick={() => setWeeklyDays(days => days.includes(i) ? days.filter(d => d !== i) : [...days, i])}>{day}</button>
                                ))}
                            </div>
                         </FormRow>
                    )}
                     <FormRow label="Cron 表達式">
                        <input type="text" value={formData.schedule?.cron || ''} onChange={e => handleScheduleChange('cron', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm font-mono" placeholder="* * * * *" />
                        <p className="text-xs text-slate-400 mt-1">範例: '0 2 * * *' 表示每天凌晨 2 點。</p>
                    </FormRow>
                </div>
            )}
        </div>
    );
};

const Step3 = ({ formData, setFormData }: { formData: Partial<SilenceRule>, setFormData: Function }) => {
    const [options, setOptions] = useState<{ keys: string[], values: Record<string, string[]> }>({ keys: [], values: {} });

    useEffect(() => {
        api.get<{ keys: string[], values: Record<string, string[]> }>('/silence-rules/options')
           .then(res => setOptions(res.data))
           .catch(err => console.error("Failed to fetch silence rule options", err));
    }, []);

    const handleMatcherChange = (index: number, field: keyof SilenceMatcher, value: string) => {
        const newMatchers = JSON.parse(JSON.stringify(formData.matchers || []));
        newMatchers[index][field] = value;
        // If the key is changed, reset the value to ensure it's valid for the new key.
        if (field === 'key') {
            newMatchers[index].value = '';
        }
        setFormData({ ...formData, matchers: newMatchers });
    };
    
    const addMatcher = () => {
        const newMatchers = [...(formData.matchers || []), { key: '', operator: '=', value: '' }];
        setFormData({ ...formData, matchers: newMatchers });
    };

    const removeMatcher = (index: number) => {
        const newMatchers = [...(formData.matchers || [])];
        newMatchers.splice(index, 1);
        setFormData({ ...formData, matchers: newMatchers });
    };
    
    const renderMatcherValueInput = (matcher: SilenceMatcher, index: number) => {
        const commonProps = {
            value: matcher.value,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleMatcherChange(index, 'value', e.target.value),
            className: "flex-grow bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500",
        };
        
        const allowedValues = options.values[matcher.key];
        
        if (allowedValues && allowedValues.length > 0) {
            return (
                 <select {...commonProps}>
                    <option value="">選擇值...</option>
                    {allowedValues.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
            );
        }

        return <input type="text" {...commonProps} placeholder="標籤值 (e.g., api-service)" />;
    };


    return (
        <div className="space-y-4 px-4">
            <h3 className="text-lg font-semibold text-white">靜音條件</h3>
            <p className="text-sm text-slate-400 -mt-2">定義符合哪些條件的事件將會被靜音。</p>
            <div className="p-4 border border-slate-700 rounded-lg space-y-3 bg-slate-800/20">
                {formData.matchers?.map((matcher, index) => (
                    <div key={index} className="flex items-center space-x-2">
                         <select value={matcher.key} onChange={e => handleMatcherChange(index, 'key', e.target.value)} className="w-1/3 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                            <option value="">選擇標籤鍵...</option>
                            {options.keys.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                        <select value={matcher.operator} onChange={e => handleMatcherChange(index, 'operator', e.target.value)} className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                            <option value="=">=</option>
                            <option value="!=">!=</option>
                            <option value="~=">~= (regex)</option>
                        </select>
                        {renderMatcherValueInput(matcher, index)}
                        <button onClick={() => removeMatcher(index)} className="p-2 text-slate-400 hover:text-red-400"><Icon name="trash-2" className="w-4 h-4" /></button>
                    </div>
                ))}
                 <button onClick={addMatcher} className="text-sm text-sky-400 hover:text-sky-300 flex items-center"><Icon name="plus" className="w-4 h-4 mr-1" /> 新增匹配條件</button>
            </div>
             <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50">
                <input type="checkbox" checked={formData.enabled} onChange={e => setFormData({...formData, enabled: e.target.checked })} className="form-checkbox h-5 w-5 rounded bg-slate-800 border-slate-600 text-sky-500 focus:ring-sky-500" />
                <span className="text-slate-300 font-semibold">立即啟用此靜音規則</span>
            </label>
        </div>
    );
};

export default SilenceRuleEditModal;
