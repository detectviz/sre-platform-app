import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import Wizard from './Wizard';
import FormRow from './FormRow';
import { NotificationStrategy } from '../types';
import { MOCK_TEAMS, MOCK_NOTIFICATION_CHANNELS } from '../constants';

interface StrategyCondition {
  key: string;
  operator: '=' | '!=' | '~=';
  value: string;
}

interface NotificationStrategyEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (strategy: NotificationStrategy) => void;
  strategy: NotificationStrategy | null;
}

const parseConditions = (conditionStr: string | undefined): StrategyCondition[] => {
    if (!conditionStr || conditionStr.trim() === '') return [{ key: '', operator: '=', value: '' }];
    return conditionStr.split(' AND ').map(part => {
        const match = part.match(/(.+?)\s*(!=|~=|=)\s*(.+)/);
        if (match) {
            return { key: match[1].trim(), operator: match[2].trim() as StrategyCondition['operator'], value: match[3].trim() };
        }
        return { key: '', operator: '=', value: '' };
    });
};

const serializeConditions = (conditions: StrategyCondition[]): string => {
    return conditions
        .filter(c => c.key && c.value)
        .map(c => `${c.key} ${c.operator} ${c.value}`)
        .join(' AND ');
};


const NotificationStrategyEditModal: React.FC<NotificationStrategyEditModalProps> = ({ isOpen, onClose, onSave, strategy }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<Partial<NotificationStrategy>>({});
    
    const getInitialFormData = (): Partial<NotificationStrategy> => ({
        name: '',
        enabled: true,
        triggerCondition: 'severity = critical',
        channelCount: 1,
        priority: 'Medium',
    });

    useEffect(() => {
        if (isOpen) {
            const initialData = strategy || getInitialFormData();
            if(strategy && !strategy.id) { // This is a duplicated strategy
                initialData.name = `Copy of ${strategy.name}`;
            }
            setFormData(initialData);
            setCurrentStep(1);
        }
    }, [isOpen, strategy]);

    const handleSave = () => {
        onSave(formData as NotificationStrategy);
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
    
    const stepTitles = ["基本資訊", "通知管道", "匹配條件"];

    return (
        <Modal
            title={strategy && strategy.id ? '編輯通知策略' : '新增通知策略'}
            isOpen={isOpen}
            onClose={onClose}
            width="w-2/3 max-w-4xl"
            footer={
                <div className="flex justify-between w-full">
                    <div>
                        {currentStep > 1 && <button onClick={prevStep} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">上一步</button>}
                    </div>
                     <div className="flex items-center space-x-2">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">取消</button>
                        {currentStep < 3 && <button onClick={nextStep} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">下一步：{stepTitles[currentStep]}</button>}
                        {currentStep === 3 && <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md">完成</button>}
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

const Step1: React.FC<{ formData: Partial<NotificationStrategy>, setFormData: Function }> = ({ formData, setFormData }) => (
    <div className="space-y-4 px-4">
        <FormRow label="策略名稱 *">
            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
        </FormRow>
        <FormRow label="優先級">
            <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
            </select>
        </FormRow>
    </div>
);

const Step2: React.FC<{ formData: Partial<NotificationStrategy>, setFormData: Function }> = ({ formData, setFormData }) => (
    <div className="space-y-4 px-4">
        <FormRow label="接收團隊">
            <select className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                {MOCK_TEAMS.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
        </FormRow>
        <FormRow label="通知管道">
            <div className="space-y-2">
                {MOCK_NOTIFICATION_CHANNELS.map(channel => (
                    <label key={channel.id} className="flex items-center space-x-3 p-2 bg-slate-800/50 rounded-md">
                        <input type="checkbox" className="form-checkbox h-4 w-4 rounded bg-slate-800 border-slate-600 text-sky-500" />
                        <span>{channel.name} ({channel.type})</span>
                    </label>
                ))}
            </div>
        </FormRow>
    </div>
);

const Step3: React.FC<{ formData: Partial<NotificationStrategy>, setFormData: Function }> = ({ formData, setFormData }) => {
    const [conditions, setConditions] = useState<StrategyCondition[]>([]);
    
    useEffect(() => {
        setConditions(parseConditions(formData.triggerCondition));
    }, [formData.triggerCondition]);

    const updateTriggerCondition = (newConditions: StrategyCondition[]) => {
        setConditions(newConditions);
        setFormData({ ...formData, triggerCondition: serializeConditions(newConditions) });
    };
    
    const handleConditionChange = (index: number, field: keyof StrategyCondition, value: any) => {
        const newConditions = [...conditions];
        newConditions[index] = { ...newConditions[index], [field]: value };
        updateTriggerCondition(newConditions);
    };
    
    const addCondition = () => {
        updateTriggerCondition([...conditions, { key: '', operator: '=', value: '' }]);
    };

    const removeCondition = (index: number) => {
        const newConditions = conditions.filter((_, i) => i !== index);
        updateTriggerCondition(newConditions);
    };

    const conditionKeys = ['severity', 'env', 'resource_type', 'tag'];
    const severityValues = ['critical', 'warning', 'info'];
    const envValues = ['production', 'staging', 'development'];

    const renderValueInput = (condition: StrategyCondition, index: number) => {
        const commonProps = {
            value: condition.value,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleConditionChange(index, 'value', e.target.value),
            className: "flex-grow bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
        };
    
        if (condition.key === 'severity') {
            return (
                <select {...commonProps}>
                    <option value="">選擇嚴重性...</option>
                    {severityValues.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
            );
        }
        if (condition.key === 'env') {
            return (
                <select {...commonProps}>
                    <option value="">選擇環境...</option>
                    {envValues.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
            );
        }
    
        return <input type="text" {...commonProps} placeholder="標籤值" />;
    };

    return (
        <div className="space-y-4 px-4">
            <h3 className="text-lg font-semibold text-white">觸發條件</h3>
            <p className="text-sm text-slate-400 -mt-2">定義符合所有以下條件的事件將會觸發此策略。</p>
            <div className="p-4 border border-slate-700 rounded-lg space-y-3 bg-slate-800/20">
                {conditions.map((cond, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <select value={cond.key} onChange={e => handleConditionChange(index, 'key', e.target.value)} className="w-1/3 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                            <option value="">選擇標籤鍵...</option>
                            {conditionKeys.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                        <select value={cond.operator} onChange={e => handleConditionChange(index, 'operator', e.target.value)} className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                            <option value="=">=</option>
                            <option value="!=">!=</option>
                            <option value="~=">~= (regex)</option>
                        </select>
                        {renderValueInput(cond, index)}
                        <button onClick={() => removeCondition(index)} className="p-2 text-slate-400 hover:text-red-400"><Icon name="trash-2" className="w-4 h-4" /></button>
                    </div>
                ))}
                 <button onClick={addCondition} className="text-sm text-sky-400 hover:text-sky-300 flex items-center"><Icon name="plus" className="w-4 h-4 mr-1" /> 新增 AND 條件</button>
            </div>
        </div>
    );
};

export default NotificationStrategyEditModal;