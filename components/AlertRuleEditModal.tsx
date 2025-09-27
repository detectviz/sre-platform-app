import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import Wizard from './Wizard';
import FormRow from './FormRow';
import { AlertRule, ConditionGroup, RuleCondition, AutomationSetting, ParameterDefinition, AutomationPlaybook, AlertRuleTemplate } from '../types';
import api from '../services/api';
import { useUser } from '../contexts/UserContext';
import { useOptions } from '../contexts/OptionsContext';

interface AlertRuleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: AlertRule) => void;
  rule: AlertRule | null;
}

const AlertRuleEditModal: React.FC<AlertRuleEditModalProps> = ({ isOpen, onClose, onSave, rule }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<Partial<AlertRule>>({});
    const { currentUser } = useUser();
    
    const getInitialFormData = (): Partial<AlertRule> => ({
        name: '',
        description: '',
        enabled: true,
        severity: 'warning',
        automationEnabled: false,
        labels: [],
        conditionGroups: [{ logic: 'OR', severity: 'warning', conditions: [{ metric: 'cpu_usage_percent', operator: '>', threshold: 80, durationMinutes: 5 }] }],
        titleTemplate: '🚨 [{{severity}}] {{resource.name}} is in trouble',
        contentTemplate: 'The metric {{metric}} reached {{value}} which is above the threshold of {{threshold}}.',
        automation: { enabled: false, parameters: {} }
    });

    useEffect(() => {
        if (isOpen) {
            const initialData = rule || getInitialFormData();
            if (!initialData.automation) {
                initialData.automation = { enabled: false, parameters: {} };
            }
            if (!initialData.automation.parameters) {
                initialData.automation.parameters = {};
            }
            setFormData(initialData);
            setCurrentStep(1);
        }
    }, [isOpen, rule]);

    const handleSave = () => {
        const firstCondition = formData.conditionGroups?.[0]?.conditions?.[0];
        const conditionsSummary = firstCondition
            ? `${firstCondition.metric} ${firstCondition.operator} ${firstCondition.threshold}`
            : 'No conditions';


        const finalRule: AlertRule = {
            id: rule?.id || `new-rule-${Date.now()}`,
            name: formData.name || 'Untitled Rule',
            description: formData.description || '',
            enabled: formData.enabled !== false,
            target: 'All Resources', // Simplified
            conditionsSummary: conditionsSummary,
            severity: formData.severity || 'info',
            automationEnabled: !!formData.automation?.enabled,
            creator: rule?.creator || currentUser?.name || 'System',
            lastUpdated: new Date().toISOString(),
            ...formData,
        };
        onSave(finalRule);
    };

    const nextStep = () => setCurrentStep(s => Math.min(s + 1, 4));
    const prevStep = () => setCurrentStep(s => Math.max(s - 1, 1));
    
    const renderStepContent = () => {
        switch (currentStep) {
            case 1: return <Step1 formData={formData} setFormData={setFormData} />;
            case 2: return <Step2 formData={formData} setFormData={setFormData} />;
            case 3: return <Step3 formData={formData} setFormData={setFormData} />;
            case 4: return <Step4 formData={formData} setFormData={setFormData} />;
            default: return null;
        }
    };
    
    const stepTitles = ["基本資訊", "觸發條件", "事件內容", "自動化"];

    return (
        <Modal
            title={rule ? '編輯告警規則' : '新增告警規則'}
            isOpen={isOpen}
            onClose={onClose}
            width="w-3/4 max-w-5xl"
            footer={
                <div className="flex justify-between w-full">
                    <div>
                        {currentStep > 1 && <button onClick={prevStep} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">上一步</button>}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">取消</button>
                        {currentStep < 4 && <button onClick={nextStep} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors">下一步：{stepTitles[currentStep]}</button>}
                        {currentStep === 4 && <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors">完成</button>}
                    </div>
                </div>
            }
        >
            <div className="flex flex-col h-[65vh]">
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

const Step1 = ({ formData, setFormData }: { formData: Partial<AlertRule>, setFormData: Function }) => {
    const [templates, setTemplates] = useState<AlertRuleTemplate[]>([]);

    useEffect(() => {
        api.get<AlertRuleTemplate[]>('/alert-rules/templates')
            .then(res => setTemplates(res.data))
            .catch(err => console.error("Failed to fetch alert rule templates", err));
    }, []);

    const applyTemplate = (templateData: Partial<AlertRule>) => {
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
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" required />
            </FormRow>
            <FormRow label="描述">
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"></textarea>
            </FormRow>
        </div>
    );
};

const Step2 = ({ formData, setFormData }: { formData: Partial<AlertRule>, setFormData: Function }) => {
    const { options: uiOptions, isLoading: isLoadingOptions } = useOptions();
    const severities = uiOptions?.alertRules?.severities || [];

    const handleGroupChange = (groupIndex: number, field: keyof ConditionGroup, value: any) => {
        const newGroups = [...(formData.conditionGroups || [])];
        // @ts-ignore
        newGroups[groupIndex][field] = value;
        setFormData({ ...formData, conditionGroups: newGroups });
    };

    const handleConditionChange = (groupIndex: number, condIndex: number, field: keyof RuleCondition, value: any) => {
        const newGroups = JSON.parse(JSON.stringify(formData.conditionGroups || []));
        newGroups[groupIndex].conditions[condIndex][field] = value;
        setFormData({ ...formData, conditionGroups: newGroups });
    };
    
    const addCondition = (groupIndex: number) => {
        const newGroups = JSON.parse(JSON.stringify(formData.conditionGroups || []));
        newGroups[groupIndex].conditions.push({ metric: '', operator: '>', threshold: 0, durationMinutes: 5 });
        setFormData({ ...formData, conditionGroups: newGroups });
    };

    const removeCondition = (groupIndex: number, condIndex: number) => {
        const newGroups = JSON.parse(JSON.stringify(formData.conditionGroups || []));
        newGroups[groupIndex].conditions.splice(condIndex, 1);
        setFormData({ ...formData, conditionGroups: newGroups });
    };

    const addGroup = () => {
        const newGroups = [...(formData.conditionGroups || [])];
        newGroups.push({
            logic: 'OR',
            severity: 'warning',
            conditions: [{ metric: '', operator: '>', threshold: 0, durationMinutes: 5 }]
        });
        setFormData({ ...formData, conditionGroups: newGroups });
    };
    
    return (
        <div className="space-y-4 px-4">
            {formData.conditionGroups?.map((group, groupIndex) => (
                <div key={groupIndex} className="p-4 border border-slate-700 rounded-lg space-y-4 bg-slate-800/20">
                    <div className="flex justify-between items-center">
                         <h4 className="font-semibold text-white">條件群組 #{groupIndex + 1} (OR)</h4>
                         <div className="flex items-center space-x-2">
                            <span className="text-sm text-slate-400">事件等級:</span>
                            {isLoadingOptions ? <div className="animate-pulse h-8 w-48 bg-slate-700 rounded-md"></div> : severities.map(level => {
                                const isActive = group.severity === level.value;
                                return (
                                    <button
                                        key={level.value}
                                        type="button"
                                        onClick={() => handleGroupChange(groupIndex, 'severity', level.value)}
                                        className={`px-4 py-1.5 text-sm font-semibold rounded-md border transition-colors uppercase ${isActive ? level.className : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'}`}
                                    >
                                        {level.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    {group.conditions.map((cond, condIndex) => (
                        <div key={condIndex} className="flex items-center space-x-2">
                            <span className="text-slate-400 text-sm font-medium">AND</span>
                            <input type="text" value={cond.metric} onChange={e => handleConditionChange(groupIndex, condIndex, 'metric', e.target.value)} className="flex-grow bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" placeholder="Metric (e.g., cpu.usage)" />
                            <select value={cond.operator} onChange={e => handleConditionChange(groupIndex, condIndex, 'operator', e.target.value)} className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                                <option value=">">&gt;</option><option value="<">&lt;</option><option value=">=">&gt;=</option><option value="<=">&lt;=</option>
                            </select>
                            <input type="number" value={cond.threshold} onChange={e => handleConditionChange(groupIndex, condIndex, 'threshold', parseFloat(e.target.value))} className="w-24 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" placeholder="Threshold" />
                            <div className="relative">
                                <input type="number" value={cond.durationMinutes} onChange={e => handleConditionChange(groupIndex, condIndex, 'durationMinutes', parseInt(e.target.value))} className="w-28 bg-slate-800 border border-slate-700 rounded-md pl-3 pr-12 py-2 text-sm" placeholder="Duration" />
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 text-sm">min</span>
                            </div>
                            <button onClick={() => removeCondition(groupIndex, condIndex)} className="p-2 text-slate-400 hover:text-red-400"><Icon name="trash-2" className="w-4 h-4" /></button>
                        </div>
                    ))}
                    <button onClick={() => addCondition(groupIndex)} className="text-sm text-sky-400 hover:text-sky-300 flex items-center"><Icon name="plus" className="w-4 h-4 mr-1" /> 新增 AND 條件</button>
                </div>
            ))}
             <button onClick={addGroup} className="text-sm text-sky-400 hover:text-sky-300 flex items-center"><Icon name="plus-circle" className="w-4 h-4 mr-1" /> 新增 OR 條件群組</button>
        </div>
    );
};


const Step3 = ({ formData, setFormData }: { formData: Partial<AlertRule>, setFormData: Function }) => {
    const titleRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLTextAreaElement>(null);
    const [focusedElement, setFocusedElement] = useState<'title' | 'content' | null>(null);

    const variables = ['{{severity}}', '{{resource.name}}', '{{metric}}', '{{value}}', '{{threshold}}', '{{duration}}'];

    const insertVariable = (variable: string) => {
        if (focusedElement === 'title' && titleRef.current) {
            const { selectionStart, selectionEnd, value } = titleRef.current;
            const newValue = value.substring(0, selectionStart || 0) + variable + value.substring(selectionEnd || 0);
            setFormData({ ...formData, titleTemplate: newValue });
        } else if (focusedElement === 'content' && contentRef.current) {
            const { selectionStart, selectionEnd, value } = contentRef.current;
            const newValue = value.substring(0, selectionStart || 0) + variable + value.substring(selectionEnd || 0);
            setFormData({ ...formData, contentTemplate: newValue });
        }
    };

    return (
        <div className="space-y-6 px-4">
            <FormRow label="事件標題 *">
                <input ref={titleRef} onFocus={() => setFocusedElement('title')} type="text" value={formData.titleTemplate} onChange={e => setFormData({ ...formData, titleTemplate: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
            </FormRow>
            <FormRow label="事件內容 *">
                <textarea ref={contentRef} onFocus={() => setFocusedElement('content')} value={formData.contentTemplate} onChange={e => setFormData({ ...formData, contentTemplate: e.target.value })} rows={5} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm font-mono"></textarea>
            </FormRow>
            <div>
                 <h3 className="text-sm font-semibold text-slate-300 mb-2">可用的變數</h3>
                 <div className="flex flex-wrap gap-2">
                    {variables.map(v => (
                        <button key={v} onClick={() => insertVariable(v)} className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded-md font-mono">{v}</button>
                    ))}
                 </div>
            </div>
        </div>
    );
};

const Step4 = ({ formData, setFormData }: { formData: Partial<AlertRule>, setFormData: Function }) => {
    const [playbooks, setPlaybooks] = useState<AutomationPlaybook[]>([]);
    
    useEffect(() => {
        api.get<AutomationPlaybook[]>('/automation/scripts')
            .then(res => setPlaybooks(res.data))
            .catch(err => console.error("Failed to fetch playbooks", err));
    }, []);

    const handleAutomationChange = (field: keyof AutomationSetting, value: any) => {
        const newAutomation = { ...(formData.automation || { enabled: false, parameters: {} }), [field]: value };
        if (field === 'scriptId') {
            newAutomation.parameters = {}; // Reset parameters when script changes
        }
        setFormData({ ...formData, automation: newAutomation });
    };
    
    const handleParameterChange = (paramName: string, value: any) => {
        const newParams = { ...(formData.automation?.parameters || {}), [paramName]: value };
        handleAutomationChange('parameters', newParams);
    };

    const selectedPlaybook = playbooks.find(p => p.id === formData.automation?.scriptId);

    const renderParameterInput = (param: ParameterDefinition) => {
        const value = formData.automation?.parameters?.[param.name] ?? param.defaultValue;
        
        if (param.type === 'boolean') {
            return (
                <input
                    type="checkbox"
                    id={param.name}
                    name={param.name}
                    checked={!!value}
                    onChange={(e) => handleParameterChange(param.name, e.target.checked)}
                    className="form-checkbox h-5 w-5 rounded bg-slate-800 border-slate-600 text-sky-500 focus:ring-sky-500"
                />
            );
        }

        const commonProps = {
            id: param.name,
            name: param.name,
            value: value,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleParameterChange(param.name, e.target.value),
            required: param.required,
            className: "w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500",
        };

        switch (param.type) {
            case 'number':
                return <input type="number" {...commonProps} placeholder={param.placeholder} />;
            case 'enum':
                return (
                    <select {...commonProps}>
                        {param.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                );
            case 'string':
            default:
                return <input type="text" {...commonProps} placeholder={param.placeholder} />;
        }
    };


    return (
        <div className="space-y-4 px-4">
            <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50">
                <input type="checkbox" checked={formData.automation?.enabled} onChange={e => handleAutomationChange('enabled', e.target.checked)} className="form-checkbox h-5 w-5 rounded bg-slate-800 border-slate-600 text-sky-500 focus:ring-sky-500" />
                <span className="text-slate-300 font-semibold">啟用自動化響應</span>
            </label>
            {formData.automation?.enabled && (
                <div className="p-4 border border-slate-700 rounded-lg space-y-4 bg-slate-800/20">
                    <FormRow label="選擇腳本">
                        <select value={formData.automation.scriptId || ''} onChange={e => handleAutomationChange('scriptId', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                            <option value="">選擇一個腳本...</option>
                            {playbooks.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </FormRow>
                     {selectedPlaybook?.parameters && selectedPlaybook.parameters.length > 0 && (
                        <div className="space-y-4 pt-2">
                            <h4 className="font-semibold text-slate-300">腳本參數</h4>
                             {selectedPlaybook.parameters.map(param => (
                                <FormRow key={param.name} label={param.label + (param.required ? ' *' : '')}>
                                    {renderParameterInput(param)}
                                </FormRow>
                             ))}
                        </div>
                    )}
                     {selectedPlaybook && (!selectedPlaybook.parameters || selectedPlaybook.parameters.length === 0) && (
                         <div className="text-sm text-slate-400 p-3 bg-slate-900/50 rounded-md">
                             此腳本無需額外參數。
                         </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AlertRuleEditModal;