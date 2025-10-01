



import React, { useState, useEffect, useMemo, useRef } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import Wizard from './Wizard';
import FormRow from './FormRow';
import { NotificationStrategy, Team, NotificationChannel, NotificationStrategyOptions, ResourceGroup, TagDefinition } from '../types';
import api from '../services/api';
import { useOptions } from '../contexts/OptionsContext';
import { showToast } from '../services/toast';

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
        const match = part.match(/([a-zA-Z0-9_.-]+)\s*(!=|~=|=)\s*(.*)/);
        if (match) {
            let value = match[3].trim();
            // remove quotes
            if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
                value = value.substring(1, value.length - 1);
            }
            return { key: match[1].trim(), operator: match[2].trim() as StrategyCondition['operator'], value: value };
        }
        return { key: '', operator: '=', value: '' };
    });
};

const serializeConditions = (conditions: StrategyCondition[]): string => {
    return conditions
        .filter(c => c.key && c.value)
        .map(c => `${c.key} ${c.operator} "${c.value}"`)
        .join(' AND ');
};


const NotificationStrategyEditModal: React.FC<NotificationStrategyEditModalProps> = ({ isOpen, onClose, onSave, strategy }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<Partial<NotificationStrategy>>({});
    const { options, isLoading: isLoadingOptions } = useOptions();
    const strategyOptions = options?.notification_strategies;

    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [additionalConditions, setAdditionalConditions] = useState<StrategyCondition[]>([]);

    // Use dynamic step titles from options or fallback
    const stepTitles = strategyOptions?.step_titles || ["基本資訊與範圍", "通知管道", "附加條件"];

    useEffect(() => {
        if (isOpen) {
            if (!isLoadingOptions && strategyOptions) {
                const defaultSeverityLevels = strategyOptions.severity_levels?.length ? [strategyOptions.severity_levels[0]] : [];
                const defaultImpactLevels = strategyOptions.impact_levels?.length ? [strategyOptions.impact_levels[0]] : [];

                const initialData: Partial<NotificationStrategy> = strategy
                    ? {
                        ...strategy,
                        severity_levels: strategy.severity_levels?.length ? strategy.severity_levels : defaultSeverityLevels,
                        impact_levels: strategy.impact_levels?.length ? strategy.impact_levels : defaultImpactLevels,
                    }
                    : {
                        name: '',
                        enabled: true,
                        trigger_condition: strategyOptions.default_condition,
                        channel_count: 1,
                        severity_levels: defaultSeverityLevels,
                        impact_levels: defaultImpactLevels,
                    };

                if (strategy && !strategy.id) {
                    initialData.name = `Copy of ${strategy.name}`;
                }
                setFormData(initialData);

                // De-serialize trigger_condition into parts for the wizard
                if (strategy?.trigger_condition) {
                    const parts = strategy.trigger_condition.split(' AND ');
                    const groupPart = parts.find(p => p.startsWith('resource.group IN'));
                    if (groupPart) {
                        const groupNames = groupPart.match(/"([^"]+)"/g)?.map(g => g.replace(/"/g, '')) || [];
                        setSelectedGroups(groupNames);
                    } else {
                        setSelectedGroups([]);
                    }
                    const otherConditionsStr = parts.filter(p => !p.startsWith('resource.group IN')).join(' AND ');
                    setAdditionalConditions(parseConditions(otherConditionsStr));
                } else {
                    setSelectedGroups([]);
                    setAdditionalConditions([]);
                }
                setCurrentStep(1);
            }
        }
    }, [isOpen, strategy, isLoadingOptions, strategyOptions]);

    const handleSave = () => {
        const groupCondition = selectedGroups.length > 0
            ? `resource.group IN (${selectedGroups.map(g => `"${g}"`).join(', ')})`
            : '';
        const additionalCondition = serializeConditions(additionalConditions);
        const finalCondition = [groupCondition, additionalCondition].filter(Boolean).join(' AND ');

        const severity_levels = (formData.severity_levels && formData.severity_levels.length > 0)
            ? formData.severity_levels
            : strategyOptions?.severity_levels ?? [];
        const impact_levels = (formData.impact_levels && formData.impact_levels.length > 0)
            ? formData.impact_levels
            : strategyOptions?.impact_levels ?? [];

        onSave({
            ...formData,
            severity_levels: severity_levels,
            impact_levels: impact_levels,
            trigger_condition: finalCondition
        } as NotificationStrategy);
    };

    const nextStep = () => setCurrentStep(s => Math.min(s + 1, 3));
    const prevStep = () => setCurrentStep(s => Math.max(s - 1, 1));

    const renderStepContent = () => {
        switch (currentStep) {
            case 1: return <Step1 formData={formData} setFormData={setFormData} options={strategyOptions} selectedGroups={selectedGroups} setSelectedGroups={setSelectedGroups} />;
            case 2: return <Step2 formData={formData} setFormData={setFormData} selectedGroups={selectedGroups} />;
            case 3: return <Step3 additionalConditions={additionalConditions} setAdditionalConditions={setAdditionalConditions} options={strategyOptions} />;
            default:
                return (
                    <div className="p-6 text-center text-slate-400">
                        <Icon name="info" className="w-5 h-5 mx-auto mb-2" />
                        <p>尚未選擇步驟，請從上方導覽選擇一個步驟。</p>
                    </div>
                );
        }
    };

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

const Step1: React.FC<{
    formData: Partial<NotificationStrategy>,
    setFormData: Function,
    options: NotificationStrategyOptions | null,
    selectedGroups: string[],
    setSelectedGroups: (groups: string[]) => void
}> = ({ formData, setFormData, options, selectedGroups, setSelectedGroups }) => {
    const [resourceGroups, setResourceGroups] = useState<ResourceGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get<{ items: ResourceGroup[], total: number }>('/resource-groups')
            .then(res => setResourceGroups(res.data.items))
            .catch(err => showToast('無法載入資源群組。', 'error'))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="space-y-4 px-4">
            <FormRow label="策略名稱 *">
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
            </FormRow>
            <FormRow label="涵蓋嚴重度 *">
                <MultiSelectDropdown
                    items={(options?.severity_levels || []).map(level => ({ value: level, label: level }))}
                    selected={(formData.severity_levels as string[]) || []}
                    onSelectedChange={(values) => setFormData({ ...formData, severity_levels: values as NotificationStrategy['severity_levels'] })}
                    placeholder={options ? '選擇至少一個嚴重度...' : '載入中...'}
                />
            </FormRow>
            <FormRow label="涵蓋影響範圍 *">
                <MultiSelectDropdown
                    items={(options?.impact_levels || []).map(level => ({ value: level, label: level }))}
                    selected={(formData.impact_levels as string[]) || []}
                    onSelectedChange={(values) => setFormData({ ...formData, impact_levels: values as NotificationStrategy['impact_levels'] })}
                    placeholder={options ? '選擇至少一個影響層級...' : '載入中...'}
                />
            </FormRow>
            <FormRow label="資源群組 *">
                <MultiSelectDropdown
                    items={resourceGroups.map(g => ({ value: g.name, label: g.name }))}
                    selected={selectedGroups}
                    onSelectedChange={setSelectedGroups}
                    placeholder={isLoading ? "載入中..." : "選擇一個或多個資源群組..."}
                />
            </FormRow>
        </div>
    );
};

const Step2: React.FC<{ formData: Partial<NotificationStrategy>, setFormData: Function, selectedGroups: string[] }> = ({ formData, setFormData, selectedGroups }) => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [channels, setChannels] = useState<NotificationChannel[]>([]);
    const [allGroups, setAllGroups] = useState<ResourceGroup[]>([]);
    const [suggestedTeam, setSuggestedTeam] = useState<string | null>(null);

    useEffect(() => {
        api.get<{ items: Team[] }>('/iam/teams', { params: { page: 1, page_size: 1000 } })
            .then(res => setTeams(res.data.items || []))
            .catch(err => { /* Failed to load teams */ });
        api.get<{ items: NotificationChannel[], total: number }>('/settings/notification-channels')
            .then(res => setChannels(res.data.items))
            .catch(err => { /* Failed to load notification channels */ });
        api.get<{ items: ResourceGroup[], total: number }>('/resource-groups')
            .then(res => setAllGroups(res.data.items))
            .catch(err => { /* Failed to load resource groups */ });
    }, []);

    useEffect(() => {
        if (selectedGroups.length > 0 && allGroups.length > 0) {
            const owner_teams = selectedGroups
                .map(groupName => allGroups.find(g => g.name === groupName)?.owner_team)
                .filter((team): team is string => !!team);

            if (owner_teams.length === selectedGroups.length && new Set(owner_teams).size === 1) {
                setSuggestedTeam(owner_teams[0]);
            } else {
                setSuggestedTeam(null);
            }
        } else {
            setSuggestedTeam(null);
        }
    }, [selectedGroups, allGroups]);

    return (
        <div className="space-y-4 px-4">
            {suggestedTeam && (
                <div className="p-3 bg-sky-900/50 rounded-md text-sky-300 text-sm flex items-center">
                    <Icon name="info" className="w-4 h-4 mr-2" />
                    系統建議: 根據您選擇的資源群組，推薦通知團隊 "{suggestedTeam}"。
                </div>
            )}
            <FormRow label="接收團隊">
                <select className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                    {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                </select>
            </FormRow>
            <FormRow label="通知管道">
                <div className="space-y-2">
                    {channels.map(channel => (
                        <label key={channel.id} className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-md hover:bg-slate-800/70 cursor-pointer transition-colors">
                            <input type="checkbox" className="form-checkbox h-4 w-4 rounded bg-slate-800 border-slate-600 text-sky-500 shrink-0" />
                            <span className="text-sm">{channel.name} ({channel.type})</span>
                        </label>
                    ))}
                </div>
            </FormRow>
        </div>
    );
};

const Step3: React.FC<{
    additionalConditions: StrategyCondition[],
    setAdditionalConditions: (conditions: StrategyCondition[]) => void,
    options: NotificationStrategyOptions | null
}> = ({ additionalConditions, setAdditionalConditions, options }) => {

    const allConditionKeys = useMemo(() => {
        if (!options) return [];
        return [...Object.keys(options.condition_keys), ...options.tag_keys];
    }, [options]);

    const handleConditionChange = (index: number, field: keyof StrategyCondition, value: string) => {
        const newConditions = [...additionalConditions];
        const updatedCondition = { ...newConditions[index] };

        switch (field) {
            case 'key':
                updatedCondition.key = value;
                updatedCondition.value = '';
                break;
            case 'operator':
                updatedCondition.operator = value as StrategyCondition['operator'];
                break;
            case 'value':
                updatedCondition.value = value;
                break;
        }

        newConditions[index] = updatedCondition;
        setAdditionalConditions(newConditions);
    };

    const addCondition = () => {
        setAdditionalConditions([...additionalConditions, { key: '', operator: '=', value: '' }]);
    };

    const removeCondition = (index: number) => {
        setAdditionalConditions(additionalConditions.filter((_, i) => i !== index));
    };

    const renderValueInput = (condition: StrategyCondition, index: number) => {
        const commonProps = {
            value: condition.value,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleConditionChange(index, 'value', e.target.value),
            className: "flex-grow bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
        };

        if (!options) return <input type="text" {...commonProps} placeholder="標籤值" />;

        const keyOptions = options.condition_keys[condition.key] || options.tag_values[condition.key];

        if (keyOptions && Array.isArray(keyOptions) && keyOptions.length > 0) {
            return (
                <select {...commonProps}>
                    <option value="">選擇值...</option>
                    {keyOptions.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
            );
        }

        return <input type="text" {...commonProps} placeholder="標籤值" />;
    };

    return (
        <div className="space-y-4 px-4">
            <h3 className="text-lg font-semibold text-white">附加條件 (可選)</h3>
            <p className="text-sm text-slate-400 -mt-2">定義符合所有以下條件的事件才會觸發此策略。</p>
            <div className="p-4 border border-slate-700 rounded-lg space-y-3 bg-slate-800/20">
                {additionalConditions.map((cond, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <select value={cond.key} onChange={e => handleConditionChange(index, 'key', e.target.value)} className="w-1/3 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" disabled={!options}>
                            <option value="">選擇標籤鍵...</option>
                            {allConditionKeys.map(k => <option key={k} value={k}>{k}</option>)}
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

const MultiSelectDropdown: React.FC<{
    items: { value: string; label: string }[];
    selected: string[];
    onSelectedChange: (selected: string[]) => void;
    placeholder: string;
}> = ({ items, selected, onSelectedChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = (value: string, checked: boolean) => {
        onSelectedChange(checked ? [...selected, value] : selected.filter(v => v !== value));
    };

    const selectedLabels = items.filter(i => selected.includes(i.value)).map(i => i.label);

    return (
        <div className="relative" ref={dropdownRef}>
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-left flex justify-between items-center">
                <span className="truncate">{selectedLabels.length > 0 ? selectedLabels.join(', ') : placeholder}</span>
                <Icon name="chevron-down" className="w-4 h-4" />
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {items.map(item => (
                        <label key={item.value} className="flex items-center space-x-3 px-3 py-2 hover:bg-slate-600 cursor-pointer">
                            <input type="checkbox" checked={selected.includes(item.value)} onChange={e => handleToggle(item.value, e.target.checked)} className="form-checkbox h-4 w-4 rounded bg-slate-800 border-slate-500 text-sky-500" />
                            <span>{item.label}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationStrategyEditModal;
