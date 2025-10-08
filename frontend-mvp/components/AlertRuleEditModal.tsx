import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import Wizard from './Wizard';
import FormRow from './FormRow';
import StatusTag, { type StatusTagProps } from './StatusTag';
import { AlertRule, ConditionGroup, RuleCondition, AutomationSetting, ParameterDefinition, AutomationPlaybook, AlertRuleTemplate, ResourceType, MetricMetadata, ResourceGroup, Resource, TagDefinition, AlertRuleOptions } from '../types';
import api from '../services/api';
import { useUser } from '../contexts/UserContext';
import { useOptions } from '../contexts/OptionsContext';
import { useContent } from '../contexts/ContentContext';
import { showToast } from '../services/toast';
import TestRuleModal from './TestRuleModal';
import KeyValueInput from './KeyValueInput';

interface AlertRuleEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (rule: Partial<AlertRule>) => void;
    rule: AlertRule | null;
}

const ALERT_SEVERITY_TONE: Record<string, StatusTagProps['tone']> = {
    critical: 'danger',
    warning: 'warning',
    info: 'info',
};

const Step0 = ({ selectedTemplate, setSelectedTemplate }: { selectedTemplate: AlertRuleTemplate | null, setSelectedTemplate: (template: AlertRuleTemplate | null) => void }) => {
    const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
    const [templates, setTemplates] = useState<AlertRuleTemplate[]>([]);
    const [selectedType, setSelectedType] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { content: pageContent } = useContent();
    const templatesContent = pageContent?.ALERT_RULE_EDIT_MODAL?.TEMPLATES;

    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            api.get<ResourceType[]>('/alert-rules/resource-types'),
            api.get<AlertRuleTemplate[]>('/alert-rules/templates')
        ]).then(([typesRes, templatesRes]) => {
            setResourceTypes(typesRes.data);
            setTemplates(templatesRes.data);
        }).catch(err => { /* Silent error */ })
            .finally(() => setIsLoading(false));
    }, []);

    const templateSummaries = templatesContent?.SUMMARIES as Record<string, string> | undefined;

    const resourceTypeMap = useMemo(() => {
        const map = new Map<string, ResourceType>();
        resourceTypes.forEach(rt => map.set(rt.id, rt));
        return map;
    }, [resourceTypes]);

    const parseSummaryToBullets = useCallback((summary: string) => {
        return summary
            .split(/\r?\n|[。；;\.]/)
            .map(item => item.replace(/^[-•\s]+/, '').trim())
            .filter(Boolean);
    }, []);

    const filteredTemplates = useMemo(() => {
        return templates
            .filter(t => selectedType === 'all' || t.resource_type === selectedType)
            .filter(t =>
                searchTerm === '' ||
                t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [templates, selectedType, searchTerm]);

    const allResourceTypes = [{ id: 'all', name: '全部', icon: 'layout-grid' }, ...resourceTypes];

    const emptyStateText = templatesContent?.EMPTY_STATE ?? '找不到符合條件的範本。';
    const introText = templatesContent?.INTRO ?? '根據監控目標挑選適用範本，系統會預先帶入觸發條件與通知內容。';

    return (
        <div className="flex h-full gap-6 px-1">
            {/* Left Filter Pane */}
            <div className="w-1/4 flex-shrink-0 border-r border-slate-700/50 pr-6">
                <h3 className="mb-3 text-base font-semibold text-white">{templatesContent?.TYPE_FILTER ?? '監控目標類型'}</h3>
                <ul className="space-y-1">
                    {allResourceTypes.map(rt => (
                        <li key={rt.id}>
                            <button
                                type="button"
                                onClick={() => setSelectedType(rt.id)}
                                className={`flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition-colors ${selectedType === rt.id
                                    ? 'bg-sky-500/20 text-sky-300 font-semibold'
                                    : 'text-slate-300 hover:bg-slate-700/50'
                                    }`}
                            >
                                <Icon name={rt.icon} className="mr-3 h-4 w-4" />
                                {rt.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Right Content Pane */}
            <div className="flex w-3/4 flex-col">
                <div className="mb-4 space-y-3">
                    <h3 className="text-lg font-semibold text-white">{templatesContent?.TITLE ?? '選擇一個範本'}</h3>
                    <p className="text-sm leading-relaxed text-slate-400">{introText}</p>
                    <div className="relative">
                        <Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder={templatesContent?.SEARCH_PLACEHOLDER ?? '搜尋範本名稱...'}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full rounded-md border border-slate-700 bg-slate-800 py-2 pl-9 pr-4 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                    </div>
                </div>

                <div className="-mr-4 flex-grow overflow-y-auto pr-4">
                    {isLoading ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="h-44 animate-pulse rounded-xl bg-slate-800" />
                            <div className="h-44 animate-pulse rounded-xl bg-slate-800" />
                        </div>
                    ) : filteredTemplates.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {filteredTemplates.map(tpl => {
                                const summary = templateSummaries?.[tpl.id] ?? tpl.description;
                                const summaryBullets = parseSummaryToBullets(summary);
                                const resourceMeta = tpl.resource_type === 'all'
                                    ? { name: '全部類型', icon: 'layout-grid' }
                                    : resourceTypeMap.get(tpl.resource_type);
                                const isSelected = selectedTemplate?.id === tpl.id;
                                const previewSections: { key: string; label: string; content: React.ReactNode }[] = [];

                                if (tpl.preview.conditions && tpl.preview.conditions.length > 0) {
                                    previewSections.push({
                                        key: 'conditions',
                                        label: templatesContent?.PREVIEW_CONDITIONS ?? '觸發條件摘要',
                                        content: (
                                            <div className="flex flex-wrap gap-2">
                                                {tpl.preview.conditions.map(condition => (
                                                    <span
                                                        key={condition}
                                                        className="inline-flex items-center rounded-full border border-slate-600 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-200"
                                                    >
                                                        {condition}
                                                    </span>
                                                ))}
                                            </div>
                                        ),
                                    });
                                }

                                if (tpl.preview.notification) {
                                    previewSections.push({
                                        key: 'notification',
                                        label: templatesContent?.PREVIEW_NOTIFICATION ?? '通知樣板',
                                        content: (
                                            <code className="block rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-left font-mono text-[11px] leading-5 text-slate-100 whitespace-pre-wrap break-words">
                                                {tpl.preview.notification}
                                            </code>
                                        ),
                                    });
                                }

                                if (tpl.preview.automation) {
                                    previewSections.push({
                                        key: 'automation',
                                        label: templatesContent?.PREVIEW_AUTOMATION ?? '自動化流程',
                                        content: (
                                            <span className="inline-flex items-center rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] text-slate-200">
                                                {tpl.preview.automation}
                                            </span>
                                        ),
                                    });
                                }

                                return (
                                    <button
                                        key={tpl.id}
                                        type="button"
                                        aria-pressed={isSelected}
                                        onClick={() => setSelectedTemplate(tpl)}
                                        className={`group relative flex h-full w-full flex-col gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${isSelected
                                            ? 'border-sky-400 bg-sky-900/40 shadow-[0_0_0_3px_rgba(56,189,248,0.15)]'
                                            : 'border-slate-700/80 bg-slate-900/40 hover:border-slate-500 hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                                                    <Icon name={resourceMeta?.icon ?? 'layout-grid'} className="h-3.5 w-3.5" />
                                                    <span className="text-slate-300">{resourceMeta?.name ?? '通用規則'}</span>
                                                </div>
                                                <h4 className="text-base font-semibold text-white">{tpl.name}</h4>
                                            </div>
                                            {isSelected && (
                                                <span className="inline-flex items-center gap-1 rounded-full border border-sky-400 bg-sky-500/20 px-2.5 py-1 text-xs font-semibold text-sky-100">
                                                    <Icon name="check-circle-2" className="h-4 w-4" />
                                                    <span>{templatesContent?.SELECTED_BADGE ?? '已選用'}</span>
                                                </span>
                                            )}
                                        </div>

                                        <div className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-3">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{templatesContent?.SUMMARY_LABEL ?? '範本重點'}</p>
                                            {summaryBullets.length > 1 ? (
                                                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-300">
                                                    {summaryBullets.map((item, index) => (
                                                        <li key={index}>{item}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="mt-2 text-sm leading-relaxed text-slate-300">{summary}</p>
                                            )}
                                        </div>

                                        {previewSections.length > 0 && (
                                            <div className="space-y-3 text-xs">
                                                {previewSections.map(section => (
                                                    <div key={section.key} className="grid grid-cols-[auto,1fr] items-start gap-x-3 gap-y-2">
                                                        <span className="mt-0.5 inline-flex h-5 items-center text-slate-500">{section.label}</span>
                                                        <div className="space-y-2 text-slate-200">{section.content}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center text-slate-500">
                            <p>{emptyStateText}</p>
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
    const { content: pageContent } = useContent();
    const basicContent = pageContent?.ALERT_RULE_EDIT_MODAL?.BASIC_INFO;

    useEffect(() => {
        Promise.all([
            api.get<{ items: ResourceGroup[], total: number }>('/resource-groups'),
            api.get<{ items: Resource[] }>('/resources', { params: { page_size: 1000 } }),
        ]).then(([groupsRes, resourcesRes]) => {
            setResourceGroups(groupsRes.data.items);
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
            <FormRow
                label={basicContent?.NAME ?? '規則名稱 *'}
                description={basicContent?.NAME_DESCRIPTION}
            >
                <input
                    type="text"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    placeholder={basicContent?.NAME_DESCRIPTION || undefined}
                    required
                />
            </FormRow>
            <FormRow
                label={basicContent?.DESCRIPTION ?? '描述'}
                description={basicContent?.DESCRIPTION_DESCRIPTION}
            >
                <textarea
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                ></textarea>
            </FormRow>

            <div className="space-y-4">
                <div className="p-5 border border-slate-700 rounded-xl space-y-4 bg-slate-800/20">
                    <div>
                        <h3 className="text-lg font-semibold text-white">{basicContent?.SCOPE_TITLE ?? '監控範圍'}</h3>
                        <p className="text-sm text-slate-400 mt-1 leading-relaxed">{basicContent?.SCOPE_DESCRIPTION ?? '定義此告警規則將監控哪些具體資源。'}</p>
                    </div>
                    <FormRow label={basicContent?.SCOPE_MODE_LABEL ?? '監控方式'}>
                        <select
                            value={scopeMode}
                            onChange={e => handleScopeModeChange(e.target.value as ScopeMode)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                        >
                            <option value="all">{basicContent?.SCOPE_MODES?.all ?? '所有資源 (依類型)'}</option>
                            <option value="group">{basicContent?.SCOPE_MODES?.group ?? '依資源群組選擇'}</option>
                            <option value="specific">{basicContent?.SCOPE_MODES?.specific ?? '依特定資源選擇'}</option>
                        </select>
                    </FormRow>
                    {scopeMode === 'all' && (
                        <FormRow label={basicContent?.TARGET_TYPE_LABEL ?? '目標類型'}>
                            <input type="text" value={formData.target?.match(/resource\.type = "([^"]+)"/)?.[0] || 'N/A'} disabled className="w-full bg-slate-900/50 border-slate-700/50 rounded px-3 py-2 text-sm text-slate-400 font-mono" />
                        </FormRow>
                    )}
                    {scopeMode === 'group' && (
                        <FormRow label={basicContent?.GROUP_LABEL ?? '資源群組'}>
                            <Step1MultiSelectDropdown items={resourceGroups.map(g => ({ value: g.name, label: g.name }))} selected={selectedGroups} onSelectedChange={setSelectedGroups} placeholder={basicContent?.GROUP_PLACEHOLDER ?? '選擇一個或多個資源群組...'} />
                        </FormRow>
                    )}
                    {scopeMode === 'specific' && (
                        <FormRow label={basicContent?.RESOURCE_LABEL ?? '特定資源'}>
                            <Step1MultiSelectDropdown items={allResources.map(r => ({ value: r.name, label: r.name }))} selected={selectedResources} onSelectedChange={setSelectedResources} placeholder={basicContent?.RESOURCE_PLACEHOLDER ?? '選擇一個或多個特定資源...'} />
                        </FormRow>
                    )}
                </div>

                <div className="p-5 border border-slate-700 rounded-xl space-y-4 bg-slate-800/20">
                    <h3 className="text-lg font-semibold text-white">{basicContent?.FILTER_TITLE ?? '附加篩選條件 (可選)'}</h3>
                    <ul className="space-y-1 text-xs text-slate-500 leading-relaxed">
                        {(basicContent?.FILTER_DESCRIPTION ?? ['在選定的監控範圍內，進一步添加標籤篩選器 (AND 邏輯)。']).map((hint, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-slate-500"></span>
                                <span>{hint}</span>
                            </li>
                        ))}
                    </ul>
                    <KeyValueInput
                        values={filterTags}
                        onChange={setFilterTags}
                        keyPlaceholder={basicContent?.FILTER_KEY_PLACEHOLDER ?? '標籤鍵'}
                        valuePlaceholder={basicContent?.FILTER_VALUE_PLACEHOLDER ?? '標籤值'}
                        addLabel={basicContent?.FILTER_ADD_LABEL ?? '新增篩選條件'}
                    />
                </div>

                <div className="p-5 border border-slate-700 rounded-xl bg-slate-800/20">
                    <h3 className="text-lg font-semibold text-white">{basicContent?.PREVIEW_TITLE ?? '匹配資源預覽'}</h3>
                    <p className="text-sm text-slate-400 mt-1 leading-relaxed">{basicContent?.PREVIEW_DESCRIPTION ?? '依據目前設定自動計算符合條件的資源數量。'}</p>
                    <div className="flex items-center gap-3 mt-3" aria-live="polite">
                        {isPreviewLoading ? (
                            <Icon name="loader-circle" className="w-5 h-5 animate-spin text-slate-400" />
                        ) : (
                            <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/60 bg-sky-500/10 px-3 py-1 text-sm font-semibold text-sky-200">
                                {previewCount ?? 'N/A'}{basicContent?.PREVIEW_BADGE_SUFFIX ?? ' 個'}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Step2 = ({ formData, setFormData }: { formData: Partial<AlertRule>, setFormData: Function }) => {
    const { options: uiOptions, isLoading: isLoadingOptions } = useOptions();
    const { content: pageContent } = useContent();
    const conditionsContent = pageContent?.ALERT_RULE_EDIT_MODAL?.CONDITIONS;
    const severities = uiOptions?.alert_rules?.severities || [];
    const [metricMetadata, setMetricMetadata] = useState<MetricMetadata[]>([]);
    const [isMetricLoading, setIsMetricLoading] = useState(true);

    useEffect(() => {
        setIsMetricLoading(true);
        api.get<MetricMetadata[]>('/alert-rules/metrics')
            .then(res => setMetricMetadata(res.data))
            .catch(err => {
                // Failed to fetch metric metadata
                showToast("無法載入指標選項。", "error");
            })
            .finally(() => setIsMetricLoading(false));
    }, []);

    const handleGroupChange = (groupIndex: number, field: keyof ConditionGroup, value: any) => {
        const newGroups = [...(formData.condition_groups || [])];
        // @ts-ignore
        newGroups[groupIndex][field] = value;
        setFormData({ ...formData, condition_groups: newGroups });
    };

    const handleConditionChange = (groupIndex: number, condIndex: number, field: keyof RuleCondition, value: any) => {
        const newGroups = JSON.parse(JSON.stringify(formData.condition_groups || []));
        newGroups[groupIndex].conditions[condIndex][field] = value;
        setFormData({ ...formData, condition_groups: newGroups });
    };

    const addCondition = (groupIndex: number) => {
        const newGroups = JSON.parse(JSON.stringify(formData.condition_groups || []));
        newGroups[groupIndex].conditions.push({ metric: '', operator: '>', threshold: 0, duration_minutes: 5 });
        setFormData({ ...formData, condition_groups: newGroups });
    };

    const removeCondition = (groupIndex: number, condIndex: number) => {
        const newGroups = JSON.parse(JSON.stringify(formData.condition_groups || []));
        newGroups[groupIndex].conditions.splice(condIndex, 1);
        setFormData({ ...formData, condition_groups: newGroups });
    };

    const addGroup = () => {
        const newGroups = [...(formData.condition_groups || [])];
        newGroups.push({
            logic: 'or',
            severity: 'warning',
            conditions: [{ metric: '', operator: '>', threshold: 0, duration_minutes: 5 }]
        });
        setFormData({ ...formData, condition_groups: newGroups });
    };

    return (
        <div className="space-y-4 px-4">
            {formData.condition_groups?.map((group, groupIndex) => (
                <div key={groupIndex} className="p-5 border border-slate-700 rounded-xl space-y-4 bg-slate-800/20">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <h4 className="font-semibold text-white">
                                {(conditionsContent?.GROUP_TITLE_TEMPLATE ?? '條件群組 #{index}（以 OR 串接）').replace('{index}', String(groupIndex + 1))}
                            </h4>
                            <button
                                onClick={() => addCondition(groupIndex)}
                                className="inline-flex items-center gap-1 rounded-full border border-sky-500/70 px-3 py-1 text-xs font-semibold text-sky-200 hover:border-sky-400 hover:text-sky-100"
                                type="button"
                            >
                                <Icon name="plus" className="w-3.5 h-3.5" />
                                {conditionsContent?.ADD_AND ?? '新增 AND 條件'}
                            </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-slate-400">{conditionsContent?.EVENT_SEVERITY ?? '事件等級'}</span>
                            {isLoadingOptions ? (
                                <div className="h-8 w-48 animate-pulse rounded-full bg-slate-700" />
                            ) : (
                                severities.map(level => {
                                    const isActive = group.severity === level.value;
                                    const tone = ALERT_SEVERITY_TONE[level.value] ?? 'info';
                                    return (
                                        <button
                                            key={level.value}
                                            type="button"
                                            onClick={() => handleGroupChange(groupIndex, 'severity', level.value)}
                                            className={`inline-flex items-center rounded-full border px-1.5 py-1 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${isActive ? 'border-sky-400 bg-sky-500/10 shadow-[0_0_0_1px_rgba(56,189,248,0.35)]' : 'border-transparent hover:border-slate-600 hover:bg-slate-800/60'}`}
                                            aria-pressed={isActive}
                                            aria-label={`${conditionsContent?.EVENT_SEVERITY ?? '事件等級'}：${level.label}`}
                                        >
                                            <StatusTag label={level.label} tone={tone} dense />
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                    {conditionsContent?.EVENT_SEVERITY_HINT && (
                        <p className="text-xs text-slate-500">{conditionsContent.EVENT_SEVERITY_HINT}</p>
                    )}
                    {group.conditions.map((cond, condIndex) => {
                        const metricMeta = metricMetadata.find(m => m.id === cond.metric);
                        const unit = metricMeta?.unit;
                        return (
                            <div key={condIndex} className="flex w-full flex-wrap items-center gap-3 rounded-lg bg-slate-900/40 px-3 py-2">
                                <span className="inline-flex h-7 items-center justify-center rounded-full bg-slate-800 px-3 text-xs font-semibold text-slate-300">AND</span>
                                <div className="min-w-[180px] flex-1">
                                    <label className="sr-only" htmlFor={`condition-metric-${groupIndex}-${condIndex}`}>{conditionsContent?.METRIC_PLACEHOLDER ?? '選擇指標'}</label>
                                    <select
                                        id={`condition-metric-${groupIndex}-${condIndex}`}
                                        value={cond.metric}
                                        onChange={e => handleConditionChange(groupIndex, condIndex, 'metric', e.target.value)}
                                        className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                        disabled={isMetricLoading}
                                    >
                                        {isMetricLoading ? (
                                            <option>載入中...</option>
                                        ) : (
                                            <>
                                                <option value="">{conditionsContent?.METRIC_PLACEHOLDER ?? '選擇指標...'}</option>
                                                {metricMetadata.map(meta => (
                                                    <option key={meta.id} value={meta.id}>{meta.name} ({meta.id})</option>
                                                ))}
                                            </>
                                        )}
                                    </select>
                                </div>
                                <div className="min-w-[96px]">
                                    <label className="sr-only" htmlFor={`condition-operator-${groupIndex}-${condIndex}`}>運算子</label>
                                    <select
                                        id={`condition-operator-${groupIndex}-${condIndex}`}
                                        value={cond.operator}
                                        onChange={e => handleConditionChange(groupIndex, condIndex, 'operator', e.target.value)}
                                        className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                    >
                                        <option value=">">&gt;</option>
                                        <option value="<">&lt;</option>
                                        <option value=">=">&gt;=</option>
                                        <option value="<=">&lt;=</option>
                                    </select>
                                </div>
                                <div className="relative min-w-[128px]">
                                    <label className="sr-only" htmlFor={`condition-threshold-${groupIndex}-${condIndex}`}>{conditionsContent?.THRESHOLD_PLACEHOLDER ?? '閾值'}</label>
                                    <input
                                        id={`condition-threshold-${groupIndex}-${condIndex}`}
                                        type="number"
                                        value={cond.threshold}
                                        onChange={e => handleConditionChange(groupIndex, condIndex, 'threshold', parseFloat(e.target.value))}
                                        className={`w-full rounded-md border border-slate-700 bg-slate-800 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 ${unit ? 'pl-3 pr-12' : 'px-3'}`}
                                        placeholder={conditionsContent?.THRESHOLD_PLACEHOLDER ?? '閾值'}
                                        aria-describedby={unit ? `condition-threshold-unit-${groupIndex}-${condIndex}` : undefined}
                                    />
                                    {unit && <span id={`condition-threshold-unit-${groupIndex}-${condIndex}`} className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400">{unit}</span>}
                                </div>
                                <div className="relative min-w-[128px]">
                                    <label className="sr-only" htmlFor={`condition-duration-${groupIndex}-${condIndex}`}>{conditionsContent?.DURATION_PLACEHOLDER ?? '持續時間'}</label>
                                    <input
                                        id={`condition-duration-${groupIndex}-${condIndex}`}
                                        type="number"
                                        value={cond.duration_minutes}
                                        onChange={e => handleConditionChange(groupIndex, condIndex, 'duration_minutes', parseInt(e.target.value))}
                                        className="w-full rounded-md border border-slate-700 bg-slate-800 py-2 pl-3 pr-14 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                        placeholder={conditionsContent?.DURATION_PLACEHOLDER ?? '持續時間'}
                                        min={1}
                                    />
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400">分鐘</span>
                                </div>
                                <button
                                    onClick={() => removeCondition(groupIndex, condIndex)}
                                    className="rounded-full p-2 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                                    type="button"
                                    aria-label={conditionsContent?.REMOVE_CONDITION_LABEL ?? '移除此條件'}
                                >
                                    <Icon name="trash-2" className="h-4 w-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            ))}
            <button onClick={addGroup} className="text-sm text-sky-400 hover:text-sky-300 flex items-center"><Icon name="plus-circle" className="w-4 h-4 mr-1" /> {conditionsContent?.ADD_OR ?? '新增 OR 條件群組'}</button>
        </div>
    );
};


const Step3 = ({ formData, setFormData }: { formData: Partial<AlertRule>, setFormData: Function }) => {
    const { options: uiOptions } = useOptions();
    const { content: pageContent } = useContent();
    const contentStrings = pageContent?.ALERT_RULE_EDIT_MODAL?.CONTENT;
    const titleRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLTextAreaElement>(null);
    const [focusedElement, setFocusedElement] = useState<'title' | 'content' | null>(null);

    // Use dynamic variables from options or fallback
    const variables = uiOptions?.alert_rules?.variables || ['{{severity}}', '{{resource.name}}', '{{metric}}', '{{value}}', '{{threshold}}', '{{duration}}'];
    const variableHints = useMemo(() => {
        const hints = contentStrings?.VARIABLE_HINTS ?? [];
        const hintMap = new Map(hints.map(item => [item.token, item.description]));
        const tokens = variables.length > 0 ? variables : hints.map(item => item.token);
        return tokens.map(token => ({ token, description: hintMap.get(token) ?? '' }));
    }, [contentStrings?.VARIABLE_HINTS, variables]);

    const insertVariable = (variable: string) => {
        if (focusedElement === 'title' && titleRef.current) {
            const { selectionStart, selectionEnd, value } = titleRef.current;
            const newValue = value.substring(0, selectionStart || 0) + variable + value.substring(selectionEnd || 0);
            setFormData({ ...formData, title_template: newValue });
        } else if (focusedElement === 'content' && contentRef.current) {
            const { selectionStart, selectionEnd, value } = contentRef.current;
            const newValue = value.substring(0, selectionStart || 0) + variable + value.substring(selectionEnd || 0);
            setFormData({ ...formData, content_template: newValue });
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
            <FormRow
                label={contentStrings?.TITLE ?? '事件標題 *'}
                description={contentStrings?.TITLE_DESCRIPTION}
            >
                <input ref={titleRef} onFocus={() => setFocusedElement('title')} type="text" value={formData.title_template} onChange={e => setFormData({ ...formData, title_template: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
            </FormRow>
            <FormRow
                label={contentStrings?.CONTENT ?? '事件內容 *'}
                description={contentStrings?.CONTENT_DESCRIPTION}
            >
                <textarea ref={contentRef} onFocus={() => setFocusedElement('content')} value={formData.content_template} onChange={e => setFormData({ ...formData, content_template: e.target.value })} rows={5} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm font-mono leading-relaxed focus:border-sky-500 focus:ring-1 focus:ring-sky-500"></textarea>
            </FormRow>
            <div className="p-5 border border-slate-700 rounded-xl bg-slate-800/20 space-y-3">
                <div>
                    <h3 className="text-sm font-semibold text-slate-300">{contentStrings?.VARIABLES ?? '可用的變數'}</h3>
                    <p className="text-xs text-slate-500 mt-1">{contentStrings?.VARIABLES_DESCRIPTION ?? '點擊即可插入至游標位置：'}</p>
                </div>
                <ul className="grid gap-2 sm:grid-cols-2">
                    {variableHints.map(({ token, description }) => (
                        <li key={token} className="rounded-lg border border-slate-700/70 bg-slate-900/40 p-3">
                            <button
                                type="button"
                                onClick={() => insertVariable(token)}
                                className="w-full text-left"
                            >
                                <code className="inline-flex w-full items-center justify-between rounded-md bg-slate-800 px-2 py-1 text-xs font-mono text-sky-200">{token}<Icon name="plus" className="w-3 h-3 text-sky-400" /></code>
                            </button>
                            {description && <p className="mt-2 text-xs text-slate-500 leading-relaxed">{description}</p>}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="p-5 border border-slate-700 rounded-xl space-y-3 bg-slate-800/20">
                <h3 className="text-lg font-semibold text-white">{contentStrings?.LABEL_SECTION_TITLE ?? '規則與事件標籤'}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{contentStrings?.LABEL_SECTION_DESCRIPTION ?? '為此告警規則及其產生的所有事件添加分類標籤，用於通知路由、搜索和報告。'}</p>
                <KeyValueInput
                    values={metadataLabels}
                    onChange={handleMetadataLabelsChange}
                    keyPlaceholder={contentStrings?.LABEL_KEY_PLACEHOLDER ?? '標籤鍵'}
                    valuePlaceholder={contentStrings?.LABEL_VALUE_PLACEHOLDER ?? '標籤值'}
                    addLabel={contentStrings?.LABEL_ADD_LABEL ?? '新增標籤'}
                />
            </div>
        </div>
    );
};

const Step4 = ({ formData, setFormData }: { formData: Partial<AlertRule>, setFormData: Function }) => {
    const [playbooks, setPlaybooks] = useState<AutomationPlaybook[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { content: pageContent } = useContent();
    const automationStrings = pageContent?.ALERT_RULE_EDIT_MODAL?.AUTOMATION;

    useEffect(() => {
        api.get<{ items: AutomationPlaybook[], total: number }>('/automation/scripts')
            .then(res => setPlaybooks(res.data.items))
            .catch(err => {
                // Failed to fetch playbooks
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
                script_id: enabled ? formData.automation?.script_id : undefined,
                parameters: enabled ? formData.automation?.parameters : {},
            }
        });
    };

    const handleScriptChange = (script_id: string) => {
        const selectedPlaybook = playbooks.find(p => p.id === script_id);
        const newParams: Record<string, any> = {};
        selectedPlaybook?.parameters?.forEach(p => {
            if (p.default_value !== undefined) {
                newParams[p.name] = p.default_value;
            }
        });

        setFormData({
            ...formData,
            automation: {
                ...(formData.automation || {}),
                enabled: true,
                script_id,
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

    const selectedPlaybook = playbooks.find(p => p.id === formData.automation?.script_id);

    const paramHints = automationStrings?.PARAM_HINTS ?? {};
    const toggleLabels = {
        enabled: '已啟用',
        disabled: '未啟用',
        ...(automationStrings?.TOGGLE_LABELS ?? {}),
    };
    const booleanParamLabels = {
        true: '啟用',
        false: '停用',
        ...(automationStrings?.BOOLEAN_PARAM_LABELS ?? {}),
    } as { true: string; false: string };

    return (
        <div className="space-y-6 px-4">
            <div className="space-y-4 rounded-xl border border-slate-700 bg-slate-800/20 p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-white">{automationStrings?.ENABLE ?? '啟用自動化響應'}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">{automationStrings?.ENABLE_DESCRIPTION ?? '在規則觸發時自動執行預先配置的腳本，例如擴展資源或開啟工單。'}</p>
                    </div>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={!!formData.automation?.enabled}
                            onChange={e => handleAutomationToggle(e.target.checked)}
                            className="form-checkbox h-5 w-5 rounded bg-slate-800 border-slate-600 text-sky-500 focus:ring-sky-500"
                        />
                        <span className="text-sm text-slate-300">{formData.automation?.enabled ? toggleLabels.enabled : toggleLabels.disabled}</span>
                    </label>
                </div>

                {formData.automation?.enabled && (
                    <div className="space-y-4 border-t border-slate-700/60 pt-4">
                        <FormRow
                            label={automationStrings?.SELECT_SCRIPT ?? '選擇腳本'}
                            description={automationStrings?.SELECT_SCRIPT_DESCRIPTION}
                        >
                            <select
                                value={formData.automation?.script_id || ''}
                                onChange={e => handleScriptChange(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                                disabled={isLoading}
                            >
                                <option value="" disabled>{isLoading ? '載入中...' : automationStrings?.SELECT_SCRIPT_PLACEHOLDER ?? '選擇一個腳本...'}</option>
                                {playbooks.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </FormRow>

                        {selectedPlaybook?.parameters && selectedPlaybook.parameters.length > 0 ? (
                            <div className="space-y-3">
                                <h3 className="text-md font-semibold text-white">{automationStrings?.SCRIPT_PARAMS ?? '腳本參數'}</h3>
                                {selectedPlaybook.parameters.map(param => {
                                    let inputElement;
                                    const value = formData.automation?.parameters?.[param.name] ?? param.default_value ?? '';
                                    const hint = paramHints[param.name as keyof typeof paramHints] as { unit?: string; description?: string } | undefined;

                                    switch (param.type) {
                                        case 'boolean': {
                                            const boolValue = typeof value === 'boolean' ? value : Boolean(value);
                                            inputElement = (
                                                <label className="flex items-center gap-2 text-sm text-slate-200">
                                                    <input type="checkbox" checked={boolValue} onChange={e => handleParamChange(param.name, e.target.checked)} className="form-checkbox h-4 w-4 rounded bg-slate-600" />
                                                    <span>{boolValue ? booleanParamLabels.true : booleanParamLabels.false}</span>
                                                </label>
                                            );
                                            break;
                                        }
                                        case 'enum':
                                            inputElement = (
                                                <select value={value} onChange={e => handleParamChange(param.name, e.target.value)} className="w-full bg-slate-700 rounded px-3 py-1.5 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500">
                                                    {param.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                </select>
                                            );
                                            break;
                                        default:
                                            inputElement = (
                                                <div className="relative">
                                                    <input
                                                        type={param.type === 'number' ? 'number' : 'text'}
                                                        value={value}
                                                        onChange={e => handleParamChange(param.name, e.target.value)}
                                                        placeholder={param.placeholder}
                                                        className={`w-full bg-slate-700 rounded px-3 py-1.5 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 ${hint?.unit ? 'pr-12' : ''}`}
                                                    />
                                                    {hint?.unit && <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400">{hint.unit}</span>}
                                                </div>
                                            );
                                    }
                                    return (
                                        <FormRow key={param.name} label={`${param.label}${param.required ? ' *' : ''}`} description={hint?.description}>
                                            {inputElement}
                                        </FormRow>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">{automationStrings?.NO_PARAMS ?? '此腳本無需額外參數。'}</p>
                        )}
                    </div>
                )}
            </div>
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
    const { options: uiOptions } = useOptions();
    const [selectedTemplate, setSelectedTemplate] = useState<AlertRuleTemplate | null>(null);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [defaultRuleData, setDefaultRuleData] = useState<Partial<AlertRule> | null>(null);

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
                setFormData({});
                setCurrentStep(0);
            }
            setSelectedTemplate(null);
        }
    }, [isOpen, rule, isEditMode]);

    useEffect(() => {
        if (!isOpen || isEditMode) {
            return;
        }

        let isCancelled = false;
        setDefaultRuleData(null);

        api
            .get<Partial<AlertRule>>('/alert-rules/templates/default')
            .then(({ data }) => {
                if (isCancelled) {
                    return;
                }
                const normalizedData: Partial<AlertRule> = {
                    ...data,
                    automation: data.automation ?? { enabled: false, parameters: {} },
                };
                setDefaultRuleData(normalizedData);
                setFormData((prev: Partial<AlertRule>) => {
                    if (Object.keys(prev).length > 0) {
                        return prev;
                    }
                    return normalizedData;
                });
            })
            .catch((error) => {
                if (isCancelled) {
                    return;
                }
                // Failed to load default alert rule template
                showToast('無法載入預設告警規則。', 'error');
            });

        return () => {
            isCancelled = true;
        };
    }, [isOpen, isEditMode]);

    const handleSave = () => {
        const firstCondition = formData.condition_groups?.[0]?.conditions?.[0];
        const conditions_summary = firstCondition
            ? `${firstCondition.metric} ${firstCondition.operator} ${firstCondition.threshold}`
            : 'No conditions';


        const rulePayload: Partial<AlertRule> = {
            ...formData,
            conditions_summary: conditions_summary,
            automation_enabled: !!formData.automation?.enabled,
        };

        if (rule?.id) {
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
            const firstGroupSeverity = selectedTemplate.data.condition_groups?.[0]?.severity;
            const defaultTarget = `resource.type = "${selectedTemplate.resource_type}"`;

            if (!defaultRuleData) {
                showToast('預設告警規則尚未載入，請稍候。', 'error');
                return;
            }

            const baseFormData = JSON.parse(JSON.stringify(defaultRuleData));

            const newFormData = {
                ...baseFormData,
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

    // Use dynamic step titles from options or fallback
    const stepTitles = uiOptions?.alert_rules?.step_titles || ["選擇監控目標", "設定基本資訊", "定義觸發條件", "事件定義與通知", "設定自動化響應"];

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: return <Step0 selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate} />;
            case 1: return <Step1 formData={formData} setFormData={setFormData} />;
            case 2: return <Step2 formData={formData} setFormData={setFormData} />;
            case 3: return <Step3 formData={formData} setFormData={setFormData} />;
            case 4: return <Step4 formData={formData} setFormData={setFormData} />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
                        <Icon name="alert-circle" className="w-6 h-6" />
                        <p className="font-medium">目前無法顯示此步驟內容。</p>
                        <p className="text-sm text-slate-500">請重新整理頁面或返回前一步重試。</p>
                    </div>
                );
        }
    };

    const finalStep = 4;
    const wizardSteps = isEditMode ? stepTitles.slice(1) : stepTitles;
    const wizardCurrentStep = isEditMode ? currentStep : currentStep + 1;
    const isNextDisabled = !isEditMode && currentStep === 0 && (!selectedTemplate || !defaultRuleData);

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
