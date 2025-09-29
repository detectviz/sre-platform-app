import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import Wizard from './Wizard';
import FormRow from './FormRow';
import { AlertRule, ConditionGroup, RuleCondition, AutomationSetting, ParameterDefinition, AutomationPlaybook, AlertRuleTemplate, ResourceType, MetricMetadata, ResourceGroup, Resource, TagDefinition, AlertRuleOptions } from '../types';
import api from '../services/api';
import { useUser } from '../contexts/UserContext';
import { useOptions } from '../contexts/OptionsContext';
import { showToast } from '../services/toast';
import TestRuleModal from './TestRuleModal';
import KeyValueInput from './KeyValueInput';

interface AlertRuleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: Partial<AlertRule>) => void;
  rule: AlertRule | null;
}

const Step0 = ({ selectedTemplate, setSelectedTemplate }: { selectedTemplate: AlertRuleTemplate | null, setSelectedTemplate: (template: AlertRuleTemplate | null) => void }) => {
    const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
    const [templates, setTemplates] = useState<AlertRuleTemplate[]>([]);
    const [selectedType, setSelectedType] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            api.get<ResourceType[]>('/alert-rules/resource-types'),
            api.get<AlertRuleTemplate[]>('/alert-rules/templates')
        ]).then(([typesRes, templatesRes]) => {
            setResourceTypes(typesRes.data);
            setTemplates(templatesRes.data);
        }).catch(err => console.error(err))
        .finally(() => setIsLoading(false));
    }, []);

    const filteredTemplates = useMemo(() => {
        return templates
            .filter(t => selectedType === 'all' || t.resourceType === selectedType)
            .filter(t => 
                searchTerm === '' ||
                t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [templates, selectedType, searchTerm]);

    const allResourceTypes = [{ id: 'all', name: 'All', icon: 'layout-grid' }, ...resourceTypes];

    return (
        <div className="px-1 flex space-x-6 h-full">
            {/* Left Filter Pane */}
            <div className="w-1/4 flex-shrink-0 border-r border-slate-700/50 pr-6">
                <h3 className="text-base font-semibold text-white mb-3">監控目標類型</h3>
                <ul className="space-y-1">
                    {allResourceTypes.map(rt => (
                        <li key={rt.id}>
                            <button
                                onClick={() => setSelectedType(rt.id)}
                                className={`w-full flex items-center p-2 rounded-md text-sm text-left transition-colors ${
                                    selectedType === rt.id
                                        ? 'bg-sky-500/20 text-sky-300 font-semibold'
                                        : 'text-slate-300 hover:bg-slate-700/50'
                                }`}
                            >
                                <Icon name={rt.icon} className="w-4 h-4 mr-3" />
                                {rt.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Right Content Pane */}
            <div className="w-3/4 flex flex-col">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-2">選擇一個範本</h3>
                    <div className="relative">
                        <Icon name="search" className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="搜尋範本名稱..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-md pl-9 pr-4 py-2 text-sm"
                        />
                    </div>
                </div>
                
                <div className="flex-grow overflow-y-auto -mr-4 pr-4">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="h-40 bg-slate-800 rounded-lg animate-pulse"></div>
                            <div className="h-40 bg-slate-800 rounded-lg animate-pulse"></div>
                        </div>
                    ) : filteredTemplates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredTemplates.map(tpl => (
                                <button
                                    key={tpl.id}
                                    onClick={() => setSelectedTemplate(tpl)}
                                    className={`p-4 rounded-lg border-2 text-left transition-all h-full flex flex-col ${
                                        selectedTemplate?.id === tpl.id
                                            ? 'bg-sky-900/50 border-sky-500 shadow-lg'
                                            : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">{tpl.emoji}</span>
                                        <h4 className="font-semibold text-white flex-grow">{tpl.name}</h4>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 flex-grow">{tpl.description}</p>
                                    <div className="mt-3 text-xs text-slate-500 font-mono border-t border-slate-700/50 pt-2">
                                        {tpl.preview.conditions.join(' & ')}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-500">
                            <p>找不到符合條件的範本。</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Step1 = ({ formData, setFormData }: { formData: Partial<AlertRule>, setFormData: Function }) => {
    type ScopeMode = 'all' | 'group' | 'specific';
    const [scopeMode, setScopeMode] = useState<ScopeMode>('all');
    
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [selectedResources, setSelectedResources] = useState<string[]>([]);
    const [filterTags, setFilterTags] = useState<{ id: string; key: string; value: string }[]>([]);

    const [resourceGroups, setResourceGroups] = useState<ResourceGroup[]>([]);
    const [allResources, setAllResources] = useState<Resource[]>([]);
    
    const [previewCount, setPreviewCount] = useState<number | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    
    useEffect(() => {
        Promise.all([
            api.get<ResourceGroup[]>('/resource-groups'),
            api.get<{ items: Resource[] }>('/resources', { params: { page_size: 1000 } }),
        ]).then(([groupsRes, resourcesRes]) => {
            setResourceGroups(groupsRes.data);
            setAllResources(resourcesRes.data.items);
        }).catch(err => {
            showToast("無法載入資源或群組選項。", "error");
        });
    }, []);

    const updateTargetString = useCallback(() => {
        const resourceTypeMatch = formData.target?.match(/resource\.type = "([^"]+)"/);
        const resourceTypeString = resourceTypeMatch ? resourceTypeMatch[0] : '';
        
        let baseQuery = '';
        if (scopeMode === 'all') {
            baseQuery = resourceTypeString;
        } else if (scopeMode === 'group' && selectedGroups.length > 0) {
            baseQuery = `resource.group IN (${selectedGroups.map(g => `"${g}"`).join(', ')})`;
        } else if (scopeMode === 'specific' && selectedResources.length > 0) {
            baseQuery = `resource.id IN (${selectedResources.map(id => `"${id}"`).join(', ')})`;
        }

        const tagQuery = filterTags
            .filter(t => t.key.trim() && t.value.trim())
            .map(t => {
                const key = t.key.trim();
                const values = t.value.split(',').filter(Boolean).map(v => v.trim());
                if (values.length > 1) {
                    return `${key}=~"${values.join('|')}"`;
                } else if (values.length === 1) {
                    return `${key}="${values[0]}"`;
                }
                return '';
            })
            .filter(Boolean)
            .join(' AND ');

        let finalTarget = baseQuery;
        if (baseQuery && tagQuery) {
            finalTarget = `${baseQuery} AND ${tagQuery}`;
        } else if (tagQuery) {
            finalTarget = tagQuery;
        }
        
        setFormData((prev: Partial<AlertRule>) => ({ ...prev, target: finalTarget }));
    }, [scopeMode, selectedGroups, selectedResources, filterTags, formData.target, setFormData]);

    useEffect(() => {
        updateTargetString();
    }, [scopeMode, selectedGroups, selectedResources, filterTags, updateTargetString]);
    
    useEffect(() => {
      const finalTarget = formData.target;
      if (!finalTarget || finalTarget.trim() === '') {
        setPreviewCount(null);
        return;
      }
      setIsPreviewLoading(true);
      const handler = setTimeout(() => {
        api.get<{ count: number }>('/resources/count', { params: { query: finalTarget } })
          .then(res => setPreviewCount(res.data.count))
          .catch(() => setPreviewCount(null))
          .finally(() => setIsPreviewLoading(false));
      }, 500);
      return () => clearTimeout(handler);
    }, [formData.target]);

    const handleScopeModeChange = (newMode: ScopeMode) => {
        setScopeMode(newMode);
        setSelectedGroups([]);
        setSelectedResources([]);
        setFilterTags([]);
    };
    
    return (
        <div className="space-y-6 px-4">
            <FormRow label="規則名稱 *"><input type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" required /></FormRow>
            <FormRow label="描述"><textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"></textarea></FormRow>
            
            <div className="space-y-4">
                <div className="p-4 border border-slate-700 rounded-lg space-y-4 bg-slate-800/20">
                    <h3 className="text-lg font-semibold text-white">監控範圍</h3>
                    <p className="text-sm text-slate-400 -mt-2">定義此告警規則將監控哪些具體資源。</p>
                    <FormRow label="監控方式">
                        <select value={scopeMode} onChange={e => handleScopeModeChange(e.target.value as ScopeMode)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                            <option value="all">所有資源 (依類型)</option>
                            <option value="group">依資源群組選擇</option>
                            <option value="specific">依特定資源選擇</option>
                        </select>
                    </FormRow>
                    {scopeMode === 'all' && <FormRow label="目標類型"><input type="text" value={formData.target?.match(/resource\.type = "([^"]+)"/)?.[0] || 'N/A'} disabled className="w-full bg-slate-900/50 border-slate-700/50 rounded px-3 py-2 text-sm text-slate-400 font-mono" /></FormRow>}
                    {scopeMode === 'group' && <FormRow label="選擇資源群組"><Step1MultiSelectDropdown items={resourceGroups.map(g => ({ value: g.name, label: g.name }))} selected={selectedGroups} onSelectedChange={setSelectedGroups} placeholder="選擇一個或多個資源群組..." /></FormRow>}
                    {scopeMode === 'specific' && <FormRow label="選擇資源"><Step1MultiSelectDropdown items={allResources.map(r => ({ value: r.name, label: r.name }))} selected={selectedResources} onSelectedChange={setSelectedResources} placeholder="選擇一個或多個特定資源..." /></FormRow>}
                </div>

                <div className="p-4 border border-slate-700 rounded-lg space-y-4 bg-slate-800/20">
                     <h3 className="text-lg font-semibold text-white">附加篩選條件 (可選)</h3>
                    <p className="text-sm text-slate-400 -mt-2">在選定的監控範圍內，進一步添加標籤篩選器 (AND 邏輯)。</p>
                    <KeyValueInput
                        values={filterTags}
                        onChange={setFilterTags}
                        keyPlaceholder="標籤鍵"
                        valuePlaceholder="標籤值"
                    />
                </div>
                
                <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/20">
                    <h3 className="text-lg font-semibold text-white">匹配資源預覽</h3>
                    <div className="flex items-center mt-2">
                        <p className="text-slate-300">目前符合條件的資源數量：</p>
                        {isPreviewLoading ? <Icon name="loader-circle" className="w-5 h-5 animate-spin ml-2 text-slate-400" /> : <span className="font-bold text-sky-400 text-lg ml-2">{previewCount ?? 'N/A'} 個</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Step2 = ({ formData, setFormData }: { formData: Partial<AlertRule>, setFormData: Function }) => {
    const { options: uiOptions, isLoading: isLoadingOptions } = useOptions();
    const severities = uiOptions?.alertRules?.severities || [];
    const [metricMetadata, setMetricMetadata] = useState<MetricMetadata[]>([]);
    const [isMetricLoading, setIsMetricLoading] = useState(true);

    useEffect(() => {
        setIsMetricLoading(true);
        api.get<MetricMetadata[]>('/alert-rules/metrics')
            .then(res => setMetricMetadata(res.data))
            .catch(err => {
                console.error("Failed to fetch metric metadata", err);
                showToast("無法載入指標選項。", "error");
            })
            .finally(() => setIsMetricLoading(false));
    }, []);

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
                    {group.conditions.map((cond, condIndex) => {
                        const metricMeta = metricMetadata.find(m => m.id === cond.metric);
                        const unit = metricMeta?.unit;
                        return (
                            <div key={condIndex} className="flex items-center space-x-2">
                                <span className="text-slate-400 text-sm font-medium">AND</span>
                                <select
                                    value={cond.metric}
                                    onChange={e => handleConditionChange(groupIndex, condIndex, 'metric', e.target.value)}
                                    className="flex-grow bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
                                    disabled={isMetricLoading}
                                >
                                    {isMetricLoading ? (
                                        <option>載入中...</option>
                                    ) : (
                                        <>
                                            <option value="">選擇指標...</option>
                                            {metricMetadata.map(meta => (
                                                <option key={meta.id} value={meta.id}>{meta.name} ({meta.id})</option>
                                            ))}
                                        </>
                                    )}
                                </select>
                                <select value={cond.operator} onChange={e => handleConditionChange(groupIndex, condIndex, 'operator', e.target.value)} className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                                    <option value=">">&gt;</option><option value="<">&lt;</option><option value=">=">&gt;=</option><option value="<=">&lt;=</option>
                                </select>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={cond.threshold} 
                                        onChange={e => handleConditionChange(groupIndex, condIndex, 'threshold', parseFloat(e.target.value))} 
                                        className={`w-24 bg-slate-800 border border-slate-700 rounded-md py-2 text-sm ${unit ? 'pl-3 pr-8' : 'px-3'}`} 
                                        placeholder="Threshold" 
                                    />
                                    {unit && <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 text-sm pointer-events-none">{unit}</span>}
                                </div>
                                <div className="relative">
                                    <input type="number" value={cond.durationMinutes} onChange={e => handleConditionChange(groupIndex, condIndex, 'durationMinutes', parseInt(e.target.value))} className="w-28 bg-slate-800 border border-slate-700 rounded-md pl-3 pr-12 py-2 text-sm" placeholder="Duration" />
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 text-sm">min</span>
                                </div>
                                <button onClick={() => removeCondition(groupIndex, condIndex)} className="p-2 text-slate-400 hover:text-red-400"><Icon name="trash-2" className="w-4 h-4" /></button>
                            </div>
                        );
                    })}
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
    
    const metadataLabels = useMemo(() => {
        const labelMap = new Map<string, string[]>();
        (formData.labels || []).forEach(label => {
            const separatorIndex = label.indexOf(':');
            if (separatorIndex === -1) return;
            const key = label.substring(0, separatorIndex);
            const value = label.substring(separatorIndex + 1);
            if (!labelMap.has(key)) {
                labelMap.set(key, []);
            }
            labelMap.get(key)!.push(value);
        });
        
        return Array.from(labelMap.entries()).map(([key, values], index) => ({
            id: key + index,
            key: key,
            value: values.join(','),
        }));
    }, [formData.labels]);

    const handleMetadataLabelsChange = (newLabels: { id: string; key: string; value: string }[]) => {
        const serializedLabels = newLabels
            .filter(l => l.key.trim() && l.value.trim())
            .flatMap(l => {
                const key = l.key.trim();
                return l.value.split(',').filter(Boolean).map(v => `${key}:${v.trim()}`);
            });
        setFormData({ ...formData, labels: serializedLabels });
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
            <div className="p-4 border border-slate-700 rounded-lg space-y-4 bg-slate-800/20">
                <h3 className="text-lg font-semibold text-white">規則與事件標籤</h3>
                <p className="text-sm text-slate-400 -mt-2">為此告警規則及其產生的所有事件添加分類標籤，用於通知路由、搜索和報告。</p>
                <KeyValueInput
                    values={metadataLabels}
                    onChange={handleMetadataLabelsChange}
                    keyPlaceholder="標籤鍵"
                    valuePlaceholder="標籤值"
                />
            </div>
        </div>
    );
};

const Step4 = ({ formData, setFormData }: { formData: Partial<AlertRule>, setFormData: Function }) => {
    const [playbooks, setPlaybooks] = useState<AutomationPlaybook[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get<AutomationPlaybook[]>('/automation/scripts')
            .then(res => setPlaybooks(res.data))
            .catch(err => {
                console.error("Failed to fetch playbooks", err);
                showToast("無法載入自動化腳本列表。", "error");
            })
            .finally(() => setIsLoading(false));
    }, []);

    const handleAutomationToggle = (enabled: boolean) => {
        setFormData({
            ...formData,
            automation: {
                ...(formData.automation || {}),
                enabled,
                scriptId: enabled ? formData.automation?.scriptId : undefined,
                parameters: enabled ? formData.automation?.parameters : {},
            }
        });
    };

    const handleScriptChange = (scriptId: string) => {
        const selectedPlaybook = playbooks.find(p => p.id === scriptId);
        const newParams: Record<string, any> = {};
        selectedPlaybook?.parameters?.forEach(p => {
            if (p.defaultValue !== undefined) {
                newParams[p.name] = p.defaultValue;
            }
        });

        setFormData({
            ...formData,
            automation: {
                ...(formData.automation || {}),
                enabled: true,
                scriptId,
                parameters: newParams,
            }
        });
    };

    const handleParamChange = (paramName: string, value: any) => {
        setFormData({
            ...formData,
            automation: {
                ...(formData.automation || {}),
                parameters: {
                    ...(formData.automation?.parameters || {}),
                    [paramName]: value,
                }
            }
        });
    };

    const selectedPlaybook = playbooks.find(p => p.id === formData.automation?.scriptId);

    return (
        <div className="space-y-6 px-4">
            <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50">
                <input
                    type="checkbox"
                    checked={!!formData.automation?.enabled}
                    onChange={e => handleAutomationToggle(e.target.checked)}
                    className="form-checkbox h-5 w-5 rounded bg-slate-800 border-slate-600 text-sky-500 focus:ring-sky-500"
                />
                <span className="text-slate-200 font-semibold text-lg">啟用自動化響應</span>
            </label>

            {formData.automation?.enabled && (
                <div className="space-y-4 p-4 border border-slate-700 rounded-lg bg-slate-800/20 animate-fade-in">
                    <FormRow label="選擇腳本">
                        <select
                            value={formData.automation?.scriptId || ''}
                            onChange={e => handleScriptChange(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
                            disabled={isLoading}
                        >
                            <option value="" disabled>{isLoading ? '載入中...' : '選擇一個腳本...'}</option>
                            {playbooks.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </FormRow>

                    {selectedPlaybook?.parameters && selectedPlaybook.parameters.length > 0 && (
                        <div className="pt-4 mt-4 border-t border-slate-700/50">
                            <h3 className="text-md font-semibold text-white mb-2">腳本參數</h3>
                            <div className="space-y-3">
                                {selectedPlaybook.parameters.map(param => {
                                    let inputElement;
                                    const value = formData.automation?.parameters?.[param.name] ?? param.defaultValue ?? '';
                                    
                                    switch(param.type) {
                                        case 'boolean':
                                            inputElement = (
                                                <label className="flex items-center space-x-2">
                                                    <input type="checkbox" checked={!!value} onChange={e => handleParamChange(param.name, e.target.checked)} className="form-checkbox h-4 w-4 bg-slate-600 rounded" />
                                                    <span>{value ? '啟用' : '停用'}</span>
                                                </label>
                                            );
                                            break;
                                        case 'enum':
                                            inputElement = (
                                                <select value={value} onChange={e => handleParamChange(param.name, e.target.value)} className="w-full bg-slate-700 rounded px-3 py-1.5 text-sm">
                                                    {param.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                </select>
                                            );
                                            break;
                                        default:
                                            inputElement = <input type={param.type === 'number' ? 'number' : 'text'} value={value} onChange={e => handleParamChange(param.name, e.target.value)} placeholder={param.placeholder} className="w-full bg-slate-700 rounded px-3 py-1.5 text-sm" />;
                                    }
                                    return (
                                        <FormRow key={param.name} label={param.label + (param.required ? ' *' : '')}>
                                            {inputElement}
                                        </FormRow>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const Step1MultiSelectDropdown: React.FC<{
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

const AlertRuleEditModal: React.FC<AlertRuleEditModalProps> = ({ isOpen, onClose, onSave, rule }) => {
    const isEditMode = !!rule;
    const [currentStep, setCurrentStep] = useState(isEditMode ? 1 : 0);
    const [formData, setFormData] = useState<Partial<AlertRule>>({});
    const { currentUser } = useUser();
    const [selectedTemplate, setSelectedTemplate] = useState<AlertRuleTemplate | null>(null);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    
    const getInitialFormData = (): Partial<AlertRule> => ({
        name: '',
        description: '',
        target: '',
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
            if (isEditMode) {
                const initialData = { ...rule };
                if (!initialData.automation) {
                    initialData.automation = { enabled: false, parameters: {} };
                }
                if (!initialData.automation.parameters) {
                    initialData.automation.parameters = {};
                }
                setFormData(initialData);
                setCurrentStep(1);
            } else {
                setFormData(getInitialFormData());
                setCurrentStep(0);
            }
            setSelectedTemplate(null);
        }
    }, [isOpen, rule, isEditMode]);

    const handleSave = () => {
        const firstCondition = formData.conditionGroups?.[0]?.conditions?.[0];
        const conditionsSummary = firstCondition
            ? `${firstCondition.metric} ${firstCondition.operator} ${firstCondition.threshold}`
            : 'No conditions';


        const rulePayload: Partial<AlertRule> = {
            ...formData,
            conditionsSummary: conditionsSummary,
            automationEnabled: !!formData.automation?.enabled,
        };

        if(rule?.id) {
            rulePayload.id = rule.id;
        }

        onSave(rulePayload);
    };
    
    const handleTestRule = () => {
        setIsTestModalOpen(true);
    };

    const nextStep = () => {
        if (currentStep === 0 && !isEditMode) {
            if (!selectedTemplate) {
                showToast('請選擇一個範本以繼續。', 'error');
                return;
            }
            const firstGroupSeverity = selectedTemplate.data.conditionGroups?.[0]?.severity;
            const defaultTarget = `resource.type = "${selectedTemplate.resourceType}"`;
            
            const newFormData = { 
                ...getInitialFormData(),
                ...selectedTemplate.data,
                name: selectedTemplate.name,
                description: selectedTemplate.description,
                target: defaultTarget,
            };

            if (firstGroupSeverity) {
                newFormData.severity = firstGroupSeverity;
            }
            setFormData(newFormData);
        }
        setCurrentStep(s => Math.min(s + 1, 4));
    };
    const prevStep = () => setCurrentStep(s => Math.max(s - 1, isEditMode ? 1 : 0));
    
    const stepTitles = ["選擇監控目標", "設定基本資訊", "定義觸發條件", "事件定義與通知", "設定自動化響應"];

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: return <Step0 selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate} />;
            case 1: return <Step1 formData={formData} setFormData={setFormData} />;
            case 2: return <Step2 formData={formData} setFormData={setFormData} />;
            case 3: return <Step3 formData={formData} setFormData={setFormData} />;
            case 4: return <Step4 formData={formData} setFormData={setFormData} />;
            default: return null;
        }
    };
    
    const finalStep = 4;
    const wizardSteps = isEditMode ? stepTitles.slice(1) : stepTitles;
    const wizardCurrentStep = isEditMode ? currentStep : currentStep + 1;
    const isNextDisabled = !isEditMode && currentStep === 0 && !selectedTemplate;

    return (
        <>
            <Modal
                title={rule ? '編輯告警規則' : '新增告警規則'}
                isOpen={isOpen}
                onClose={onClose}
                width="w-3/4 max-w-5xl"
                footer={
                    <div className="flex justify-between w-full">
                        <div className="flex items-center space-x-2">
                            {isEditMode && (
                                <button onClick={handleTestRule} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md flex items-center">
                                    <Icon name="play-circle" className="w-4 h-4 mr-2" />
                                    測試規則
                                </button>
                            )}
                            {currentStep > (isEditMode ? 1 : 0) && <button onClick={prevStep} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">上一步</button>}
                        </div>
                        <div className="flex items-center space-x-2">
                            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">取消</button>
                            {currentStep < finalStep && <button onClick={nextStep} disabled={isNextDisabled} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">下一步：{stepTitles[currentStep + 1]}</button>}
                            {currentStep === finalStep && <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors">完成</button>}
                        </div>
                    </div>
                }
            >
                <div className="flex flex-col h-[65vh]">
                    <div className="px-4 pb-6 border-b border-slate-700/50">
                       <Wizard currentStep={wizardCurrentStep} steps={wizardSteps} onStepClick={(step) => setCurrentStep(isEditMode ? step : step - 1)} />
                    </div>
                    <div className="flex-grow pt-6 overflow-y-auto">
                        {renderStepContent()}
                    </div>
                </div>
            </Modal>
            {isTestModalOpen && rule && (
                <TestRuleModal 
                    isOpen={isTestModalOpen} 
                    onClose={() => setIsTestModalOpen(false)} 
                    rule={rule} 
                />
            )}
        </>
    );
};

export default AlertRuleEditModal;