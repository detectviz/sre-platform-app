



import React, { useState, useEffect, useMemo, useRef } from 'react';
import Modal from '@/shared/components/Modal';
import Icon from '@/shared/components/Icon';
import Wizard from '@/shared/components/Wizard';
import FormRow from '@/shared/components/FormRow';
import StatusTag from '@/shared/components/StatusTag';
import { NotificationStrategy, Team, NotificationChannel, NotificationStrategyOptions, ResourceGroup } from '@/shared/types';
import api from '@/services/api';
import { useOptions } from '@/contexts/OptionsContext';
import { showToast } from '@/services/toast';
import { formatRelativeTime } from '@/shared/utils/time';

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
                        description: strategy.description || '',
                        severity_levels: strategy.severity_levels?.length ? strategy.severity_levels : defaultSeverityLevels,
                        impact_levels: strategy.impact_levels?.length ? strategy.impact_levels : defaultImpactLevels,
                        channel_ids: strategy.channel_ids || [],
                        channel_count: strategy.channel_ids?.length ?? strategy.channel_count ?? 0,
                    }
                    : {
                        name: '',
                        description: '',
                        enabled: true,
                        trigger_condition: strategyOptions.default_condition,
                        channel_count: 0,
                        channel_ids: [],
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

        const channel_ids = Array.isArray(formData.channel_ids) ? formData.channel_ids : [];

        onSave({
            ...formData,
            description: formData.description || '',
            channel_ids,
            channel_count: channel_ids.length,
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

    const NAME_LIMIT = 50;
    const DESCRIPTION_LIMIT = 200;

    useEffect(() => {
        api.get<{ items: ResourceGroup[], total: number }>('/resource-groups')
            .then(res => setResourceGroups(res.data.items))
            .catch(err => showToast('無法載入資源群組。', 'error'))
            .finally(() => setIsLoading(false));
    }, []);

    const removeGroup = (groupName: string) => {
        setSelectedGroups(selectedGroups.filter(g => g !== groupName));
    };

    return (
        <div className="space-y-5 px-4">
            <FormRow label="策略名稱 *">
                <div className="space-y-1">
                    <input
                        type="text"
                        value={formData.name || ''}
                        maxLength={NAME_LIMIT}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="輸入策略標題，例如：重大告警高優先通知"
                        className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>此名稱將顯示於策略列表與通知歷史。</span>
                        <span className={(formData.name?.length || 0) > NAME_LIMIT * 0.8 ? 'text-amber-400' : ''}>{formData.name?.length || 0}/{NAME_LIMIT}</span>
                    </div>
                </div>
            </FormRow>
            <FormRow label="策略描述">
                <div className="space-y-1">
                    <textarea
                        value={formData.description || ''}
                        maxLength={DESCRIPTION_LIMIT}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        placeholder="說明觸發情境，協助其他成員理解策略目的。"
                        className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    <div className="text-right text-[11px] text-slate-500">
                        <span className={(formData.description?.length || 0) > DESCRIPTION_LIMIT * 0.8 ? 'text-amber-400' : ''}>{formData.description?.length || 0}/{DESCRIPTION_LIMIT}</span>
                    </div>
                </div>
            </FormRow>
            <FormRow label="涵蓋嚴重度 *">
                <MultiSelectDropdown
                    items={(options?.severity_levels || []).map(level => ({ value: level, label: level }))}
                    selected={(formData.severity_levels as string[]) || []}
                    onSelectedChange={(values) => setFormData({ ...formData, severity_levels: values as NotificationStrategy['severity_levels'] })}
                    placeholder={options ? '選擇至少一個嚴重度...' : '載入中...'}
                />
                <p className="mt-1 text-xs text-slate-500">選取後，系統將只針對指定嚴重度推播通知。</p>
            </FormRow>
            <FormRow label="涵蓋影響範圍 *">
                <MultiSelectDropdown
                    items={(options?.impact_levels || []).map(level => ({ value: level, label: level }))}
                    selected={(formData.impact_levels as string[]) || []}
                    onSelectedChange={(values) => setFormData({ ...formData, impact_levels: values as NotificationStrategy['impact_levels'] })}
                    placeholder={options ? '選擇至少一個影響層級...' : '載入中...'}
                />
                <p className="mt-1 text-xs text-slate-500">可依服務影響程度調整通知對象，避免過度打擾。</p>
            </FormRow>
            <FormRow label="資源群組 *">
                <MultiSelectDropdown
                    items={resourceGroups.map(g => ({ value: g.name, label: g.name }))}
                    selected={selectedGroups}
                    onSelectedChange={setSelectedGroups}
                    placeholder={isLoading ? "載入中..." : "選擇一個或多個資源群組..."}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                    {selectedGroups.length === 0 ? (
                        <span className="text-xs text-slate-500">尚未選取群組，預設為套用至全部資源。</span>
                    ) : (
                        selectedGroups.map(group => (
                            <span key={group} className="inline-flex items-center gap-2 bg-slate-800/60 border border-slate-600 rounded-full px-3 py-1 text-xs text-slate-200">
                                {group}
                                <button type="button" onClick={() => removeGroup(group)} className="text-slate-400 hover:text-white">
                                    <Icon name="x" className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        ))
                    )}
                </div>
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

    const selectedChannelIds = Array.isArray(formData.channel_ids) ? (formData.channel_ids as string[]) : [];

    const toggleChannel = (channelId: string, checked: boolean) => {
        const nextIds = checked
            ? [...new Set([...selectedChannelIds, channelId])]
            : selectedChannelIds.filter(id => id !== channelId);
        setFormData({ ...formData, channel_ids: nextIds, channel_count: nextIds.length });
    };

    const channelStatusTone = (status: NotificationChannel['last_test_result']) => {
        switch (status) {
            case 'success':
                return 'success';
            case 'failed':
                return 'danger';
            case 'not_tested':
            default:
                return 'neutral';
        }
    };

    return (
        <div className="space-y-4 px-4">
            {suggestedTeam && (
                <div className="p-3 bg-sky-900/50 rounded-md text-sky-300 text-sm flex items-center">
                    <Icon name="info" className="w-4 h-4 mr-2" />
                    系統建議: 根據您選擇的資源群組，推薦通知團隊 "{suggestedTeam}"。
                </div>
            )}
            <FormRow label="接收團隊">
                <select
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                    value={formData.team_id || ''}
                    onChange={e => setFormData({ ...formData, team_id: e.target.value })}
                >
                    <option value="">不指定（使用預設團隊）</option>
                    {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                </select>
                <p className="mt-1 text-xs text-slate-500">團隊將收到此策略下所有通知，可另行於通知管道設定細部成員。</p>
            </FormRow>
            <FormRow label="通知管道">
                <div className="space-y-2">
                    {channels.map(channel => (
                        <label key={channel.id} className="flex items-start justify-between gap-4 p-3 bg-slate-800/60 rounded-lg hover:bg-slate-800/80 cursor-pointer transition-colors">
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    className="mt-1 form-checkbox h-4 w-4 rounded bg-slate-800 border-slate-600 text-sky-500"
                                    checked={selectedChannelIds.includes(channel.id)}
                                    onChange={e => toggleChannel(channel.id, e.target.checked)}
                                />
                                <div>
                                    <p className="text-sm font-medium text-white">{channel.name}</p>
                                    <p className="text-xs text-slate-500">類型：{channel.type}</p>
                                    <p className="text-xs text-slate-500 mt-1">最近測試：{channel.last_tested_at ? formatRelativeTime(channel.last_tested_at) : '尚未測試'}</p>
                                </div>
                            </div>
                            <StatusTag
                                label={channel.last_test_result === 'success' ? '測試成功' : channel.last_test_result === 'failed' ? '測試失敗' : '尚未測試'}
                                tone={channelStatusTone(channel.last_test_result)}
                                dense
                            />
                        </label>
                    ))}
                    {channels.length === 0 && (
                        <p className="text-xs text-slate-500">尚未設定可用的通知管道，請先在「通知管道」頁面建立。</p>
                    )}
                </div>
                <p className="mt-2 text-xs text-slate-500">已選擇 {selectedChannelIds.length} 個管道。</p>
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

    const quickPresets = useMemo(() => {
        if (!options) return [];
        const presets: { label: string; key: string; value: string }[] = [];
        const severityKey = Object.keys(options.condition_keys || {}).find(key => key.toLowerCase().includes('severity'));
        if (severityKey) {
            const values = options.condition_keys[severityKey];
            if (values && values.length > 0) {
                presets.push({ label: `嚴重度 = ${values[values.length - 1]}`, key: severityKey, value: values[values.length - 1] });
            }
        }
        const serviceKey = options.tag_keys?.find(key => key.toLowerCase().includes('service'));
        if (serviceKey) {
            const values = options.tag_values?.[serviceKey];
            if (values && values.length > 0) {
                presets.push({ label: `服務 = ${values[0]}`, key: serviceKey, value: values[0] });
            }
        }
        return presets;
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

    const applyPreset = (presetKey: string, presetValue: string) => {
        setAdditionalConditions([...additionalConditions, { key: presetKey, operator: '=', value: presetValue }]);
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
            {quickPresets.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    {quickPresets.map(preset => (
                        <button
                            key={`${preset.key}-${preset.value}`}
                            type="button"
                            onClick={() => applyPreset(preset.key, preset.value)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full bg-slate-800/60 border border-slate-600 hover:bg-slate-800/80"
                        >
                            <Icon name="plus" className="w-3.5 h-3.5" /> {preset.label}
                        </button>
                    ))}
                </div>
            )}
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
                <p className="text-xs text-slate-500">目前共設定 {additionalConditions.filter(cond => cond.key && cond.value).length} 個有效條件。</p>
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
