
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import Wizard from './Wizard';
import FormRow from './FormRow';
import StatusTag, { type StatusTagProps } from './StatusTag';
import { SilenceRule, SilenceMatcher, SilenceSchedule, SilenceRuleTemplate, SilenceRuleOptions, AlertRule } from '../types';
import { showToast } from '../services/toast';
import api from '../services/api';
import { useUser } from '../contexts/UserContext';
import { useOptions } from '../contexts/OptionsContext';
import { useContent } from '../contexts/ContentContext';

interface SilenceRuleEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (rule: Partial<SilenceRule>) => void;
    rule: SilenceRule | null;
}

const MultiSelectDropdown: React.FC<{
    options: { id: string; value: string; }[];
    selectedValues: string[];
    onChange: (newValues: string[]) => void;
    placeholder: string;
}> = ({ options, selectedValues, onChange, placeholder }) => {
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

    const handleToggleOption = (valueToToggle: string) => {
        const newSelected = selectedValues.includes(valueToToggle)
            ? selectedValues.filter(v => v !== valueToToggle)
            : [...selectedValues, valueToToggle];
        onChange(newSelected);
    };

    return (
        <div ref={dropdownRef} className="relative w-full">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-slate-700 rounded-md px-3 py-1 text-sm flex items-center flex-wrap gap-1 cursor-pointer min-h-[40px]"
            >
                {selectedValues.length === 0 && <span className="text-slate-400">{placeholder}</span>}
                {selectedValues.map(val => (
                    <span key={val} className="bg-sky-600 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center">
                        {val}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleToggleOption(val); }}
                            className="ml-1.5 text-sky-200 hover:text-white"
                            aria-label={`Remove ${val}`}
                        >
                            <Icon name="x" className="w-3 h-3" />
                        </button>
                    </span>
                ))}
                <Icon name="chevron-down" className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {options.map(opt => (
                        <label key={opt.id} className="flex items-center space-x-3 px-3 py-2 hover:bg-slate-700 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedValues.includes(opt.value)}
                                onChange={() => handleToggleOption(opt.value)}
                                className="form-checkbox h-4 w-4 rounded bg-slate-900 border-slate-600 text-sky-500 focus:ring-sky-500"
                            />
                            <span className="text-slate-200">{opt.value}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

const ALERT_PREVIEW_SEVERITY_TONE: Record<AlertRule['severity'], StatusTagProps['tone']> = {
    critical: 'danger',
    warning: 'warning',
    info: 'info',
};

const ALERT_PREVIEW_SEVERITY_LABEL: Record<AlertRule['severity'], string> = {
    critical: '嚴重',
    warning: '警告',
    info: '資訊',
};

const SilenceRuleEditModal: React.FC<SilenceRuleEditModalProps> = ({ isOpen, onClose, onSave, rule }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<Partial<SilenceRule>>({});
    const { currentUser } = useUser();
    const { options, isLoading: isLoadingOptions } = useOptions();
    const silenceRuleOptions = options?.silence_rules;
    const { content } = useContent();
    const stepTitles = content?.SILENCE_RULE_EDIT_MODAL?.STEP_TITLES || ["Basic Info", "Schedule", "Scope"];

    useEffect(() => {
        if (isOpen) {
            if (!silenceRuleOptions) return; // Wait for options

            const initialData = rule || {
                name: '',
                description: '',
                enabled: true,
                type: 'single',
                matchers: [silenceRuleOptions.default_matcher],
                schedule: { type: 'single', starts_at: new Date().toISOString().slice(0, 16), ends_at: new Date(Date.now() + 3600 * 1000).toISOString().slice(0, 16) }
            };
            setFormData(initialData);
            setCurrentStep(1);
        }
    }, [isOpen, rule, silenceRuleOptions]);

    const handleSave = () => {
        const payload: Partial<SilenceRule> = {
            ...formData,
            id: rule?.id,
            type: formData.schedule?.type === 'single' ? 'single' : 'repeat',
        };

        if (!rule) {
            delete payload.id;
        }

        onSave(payload);
    };

    const nextStep = () => setCurrentStep(s => Math.min(s + 1, 3));
    const prevStep = () => setCurrentStep(s => Math.max(s - 1, 1));

    const renderStepContent = () => {
        switch (currentStep) {
            case 1: return <Step1 formData={formData} setFormData={setFormData} />;
            case 2: return <Step2 formData={formData} setFormData={setFormData} options={silenceRuleOptions} />;
            case 3: return <Step3 formData={formData} setFormData={setFormData} options={silenceRuleOptions} />;
            default: return <div className="p-4 text-center text-slate-400">尚未選擇步驟。</div>;
        }
    };

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
                    {isLoadingOptions ? <div className="text-center p-8"><Icon name="loader-circle" className="animate-spin w-8 h-8" /></div> : renderStepContent()}
                </div>
            </div>
        </Modal>
    );
};

const Step1 = ({ formData, setFormData }: { formData: Partial<SilenceRule>, setFormData: Function }) => {
    const [templates, setTemplates] = useState<SilenceRuleTemplate[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [isTemplateLoading, setIsTemplateLoading] = useState(true);
    const { content } = useContent();
    const basicContent = content?.SILENCE_RULE_EDIT_MODAL?.BASIC_INFO;

    useEffect(() => {
        setIsTemplateLoading(true);
        api.get<SilenceRuleTemplate[]>('/silence-rules/templates')
            .then(res => setTemplates(res.data))
            .catch(() => {
                showToast('無法載入靜音規則範本。', 'error');
            })
            .finally(() => setIsTemplateLoading(false));
    }, []);

    const applyTemplate = (template: SilenceRuleTemplate) => {
        setSelectedTemplateId(template.id);
        const templateData = {
            ...template.data,
            name: template.data.name || formData.name || ''
        };
        setFormData({ ...formData, ...templateData });
    };

    const selectedTemplate = templates.find(tpl => tpl.id === selectedTemplateId);
    const templateDescription = content?.SILENCE_RULE_EDIT_MODAL?.TEMPLATE_DESCRIPTION ?? '選擇範本可快速帶入預設條件、排程與標籤設定。套用後仍可進一步調整。';

    return (
        <div className="space-y-6 px-4 pb-2">
            <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-200">{basicContent?.APPLY_TEMPLATE ?? '快速套用範本'}</h3>
                    {selectedTemplate && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-200">
                            <Icon name="check" className="h-3.5 w-3.5" /> 已套用：{selectedTemplate.name}
                        </span>
                    )}
                </div>
                <p className="text-xs leading-relaxed text-slate-400">{templateDescription}</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {isTemplateLoading && Array.from({ length: 3 }).map((_, index) => (
                        <div key={`tpl-skeleton-${index}`} className="h-12 animate-pulse rounded-lg border border-slate-700/60 bg-slate-800/40" />
                    ))}
                    {!isTemplateLoading && templates.map(tpl => {
                        const isSelected = selectedTemplateId === tpl.id;
                        return (
                            <button
                                key={tpl.id}
                                type="button"
                                onClick={() => applyTemplate(tpl)}
                                className={`group flex h-12 items-center justify-between rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${isSelected
                                    ? 'border-sky-500 bg-sky-500/10 text-sky-100 shadow-[0_0_0_1px_rgba(56,189,248,0.25)]'
                                    : 'border-slate-700 bg-slate-800/50 text-slate-200 hover:border-slate-500 hover:bg-slate-800/70'
                                }`}
                                aria-pressed={isSelected}
                                title={tpl.description}
                            >
                                <span className="truncate text-left">{tpl.name}</span>
                                <Icon name={isSelected ? 'check' : 'sparkles'} className={`h-4 w-4 shrink-0 ${isSelected ? 'text-sky-200' : 'text-slate-400 group-hover:text-sky-200'}`} />
                            </button>
                        );
                    })}
                    {!isTemplateLoading && templates.length === 0 && (
                        <div className="col-span-full rounded-lg border border-dashed border-slate-700 bg-slate-900/40 px-4 py-6 text-center text-sm text-slate-400">
                            暫無可用範本，可直接自訂設定。
                        </div>
                    )}
                </div>
            </div>
            <FormRow
                label={basicContent?.NAME ?? '規則名稱 *'}
                description={content?.SILENCE_RULE_EDIT_MODAL?.NAME_DESCRIPTION ?? '此名稱將顯示在靜音規則列表與通知設定中，建議包含範圍與目的。'}
            >
                <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例如：API 服務臨時維護"
                    className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
            </FormRow>
            <FormRow
                label={basicContent?.DESCRIPTION ?? '描述'}
                description={content?.SILENCE_RULE_EDIT_MODAL?.DESCRIPTION_HELP ?? '補充靜音原因、影響範圍或聯絡人資訊，協助團隊理解背景。'}
            >
                <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="提供靜音原因與預計恢復時間，例如：部署新版本，預計 30 分鐘內完成。"
                    className="w-full resize-none rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm leading-relaxed focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                ></textarea>
            </FormRow>
        </div>
    );
};

const Step2 = ({ formData, setFormData, options }: { formData: Partial<SilenceRule>, setFormData: Function, options: SilenceRuleOptions | null }) => {
    const { content } = useContent();
    const scheduleContent = content?.SILENCE_RULE_EDIT_MODAL?.SCHEDULE;
    const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
    const [weeklyDays, setWeeklyDays] = useState<number[]>([]);
    const [time, setTime] = useState('02:00');
    const timezoneLabel = formData.schedule?.timezone || 'UTC';

    const handleScheduleChange = (field: keyof SilenceSchedule, value: any) => {
        setFormData({ ...formData, schedule: { ...(formData.schedule || {}), [field]: value } });
    };

    const handleTypeChange = (newType: 'single' | 'recurring') => {
        const newSchedule = { ...(formData.schedule || {}), type: newType };
        if (newType === 'single') {
            delete newSchedule.cron;
            if (!newSchedule.starts_at) newSchedule.starts_at = new Date().toISOString().slice(0, 16);
            if (!newSchedule.ends_at) newSchedule.ends_at = new Date(Date.now() + 3600 * 1000).toISOString().slice(0, 16);
        } else {
            delete newSchedule.starts_at;
            delete newSchedule.ends_at;
            if (!newSchedule.cron) newSchedule.cron = '0 2 * * *'; // Default daily at 2 AM
        }
        setFormData({ ...formData, schedule: newSchedule });
    };

    useEffect(() => {
        if (options?.recurrence_types?.length) {
            setRecurrenceType(prev => options.recurrence_types.some(opt => opt.value === prev) ? prev : options.recurrence_types[0].value);
        }
    }, [options?.recurrence_types]);

    return (
        <div className="space-y-6 px-4 pb-2">
            <FormRow label={scheduleContent?.TYPE ?? '排程類型'} description={scheduleContent?.TYPE_HINT ?? '選擇此靜音為一次性或週期性執行。'}>
                <div className="inline-flex w-full gap-2 rounded-xl border border-slate-700 bg-slate-900/40 p-1.5">
                    {[
                        { value: 'single' as const, label: scheduleContent?.SINGLE ?? '單次靜音' },
                        { value: 'recurring' as const, label: scheduleContent?.RECURRING ?? '週期性靜音' },
                    ].map(option => {
                        const isActive = formData.schedule?.type === option.value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleTypeChange(option.value)}
                                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${isActive
                                    ? 'bg-sky-600 text-white shadow-sm'
                                    : 'text-slate-300 hover:bg-slate-800/70'}
                                `}
                                aria-pressed={isActive}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            </FormRow>
            {formData.schedule?.type === 'single' && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormRow
                        label={scheduleContent?.START_TIME ?? '開始時間'}
                        description={`${scheduleContent?.START_TIME_HINT ?? '顯示為'} ${timezoneLabel}`}
                    >
                        <input
                            type="datetime-local"
                            value={formData.schedule?.starts_at || ''}
                            onChange={e => handleScheduleChange('starts_at', e.target.value)}
                            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                            placeholder="2025-03-01T09:00"
                            step={300}
                        />
                    </FormRow>
                    <FormRow
                        label={scheduleContent?.END_TIME ?? '結束時間'}
                        description={scheduleContent?.END_TIME_HINT ?? '建議預留緩衝，確保靜音於維護完成後自動解除。'}
                    >
                        <input
                            type="datetime-local"
                            value={formData.schedule?.ends_at || ''}
                            onChange={e => handleScheduleChange('ends_at', e.target.value)}
                            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                            placeholder="2025-03-01T11:00"
                            step={300}
                        />
                    </FormRow>
                </div>
            )}
            {formData.schedule?.type === 'recurring' && (
                <div className="space-y-5 rounded-xl border border-slate-700 bg-slate-900/40 p-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormRow label={scheduleContent?.FREQUENCY ?? '重複頻率'} description={scheduleContent?.FREQUENCY_HINT ?? '選擇常用頻率，或改用自訂 Cron。'}>
                            <div className="flex flex-wrap gap-2">
                                {(options?.recurrence_types || [
                                    { value: 'daily', label: scheduleContent?.RECURRENCE_TYPES?.DAILY ?? '每日' },
                                    { value: 'weekly', label: scheduleContent?.RECURRENCE_TYPES?.WEEKLY ?? '每週' },
                                    { value: 'monthly', label: scheduleContent?.RECURRENCE_TYPES?.MONTHLY ?? '每月' },
                                    { value: 'custom', label: scheduleContent?.RECURRENCE_TYPES?.CUSTOM ?? '自訂 Cron' },
                                ]).map(opt => {
                                    const isActive = recurrenceType === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setRecurrenceType(opt.value)}
                                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${isActive ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'}`}
                                            aria-pressed={isActive}
                                        >
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </FormRow>
                        <FormRow label={scheduleContent?.EXECUTION_TIME ?? '執行時間'} description={`${scheduleContent?.EXECUTION_TIME_HINT ?? '以'} ${timezoneLabel} 表示`}>
                            <input
                                type="time"
                                value={time}
                                onChange={e => setTime(e.target.value)}
                                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                step={300}
                            />
                        </FormRow>
                    </div>
                    {recurrenceType === 'weekly' && (
                        <FormRow label={scheduleContent?.SELECT_WEEKDAYS ?? '選擇星期'}>
                            <div className="flex flex-wrap gap-2">
                                {(options?.weekdays || []).map(day => {
                                    const isSelected = weeklyDays.includes(day.value);
                                    return (
                                        <button
                                            key={day.value}
                                            type="button"
                                            onClick={() => setWeeklyDays(days => days.includes(day.value) ? days.filter(d => d !== day.value) : [...days, day.value])}
                                            className={`h-10 w-10 rounded-full border text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${isSelected ? 'border-sky-400 bg-sky-500/20 text-sky-100' : 'border-slate-600 bg-slate-800 text-slate-200 hover:border-slate-500 hover:bg-slate-700'}`}
                                            aria-pressed={isSelected}
                                        >
                                            {day.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </FormRow>
                    )}
                    <FormRow label={scheduleContent?.CRON_EXPRESSION ?? 'Cron 表達式'} description={scheduleContent?.CRON_HINT ?? '需要更細緻的排程時，可直接輸入 Cron。'}>
                        <input
                            type="text"
                            value={formData.schedule?.cron || ''}
                            onChange={e => handleScheduleChange('cron', e.target.value)}
                            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-mono focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                            placeholder="0 2 * * *"
                        />
                        <ul className="mt-2 space-y-1 text-xs text-slate-400">
                            {[scheduleContent?.CRON_EXAMPLE ?? "0 2 * * * → 每天 02:00" , '0 */6 * * * → 每 6 小時', '0 22 * * 5 → 每週五 22:00'].map((example, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-slate-500"></span>
                                    <span className="font-mono">{example}</span>
                                </li>
                            ))}
                        </ul>
                    </FormRow>
                </div>
            )}
        </div>
    );
};

const Step3 = ({ formData, setFormData, options }: { formData: Partial<SilenceRule>, setFormData: Function, options: SilenceRuleOptions | null }) => {
    const { content } = useContent();
    const scopeContent = content?.SILENCE_RULE_EDIT_MODAL?.SCOPE;
    const [previewCount, setPreviewCount] = useState<number | null>(null);
    const [previewItems, setPreviewItems] = useState<AlertRule[]>([]);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const previewLimit = 5;

    const handleMatcherChange = (index: number, field: keyof SilenceMatcher, value: string) => {
        const newMatchers = JSON.parse(JSON.stringify(formData.matchers || []));
        const currentMatcher = newMatchers[index];
        currentMatcher[field] = value;
        if (field === 'key') {
            currentMatcher.value = '';
        }
        if (field === 'operator' && value !== '~=' && currentMatcher.value.includes('|')) {
            currentMatcher.value = currentMatcher.value.split('|')[0] || '';
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

    useEffect(() => {
        const validMatchers = formData.matchers?.filter(m => m.key && m.value);
        if (!validMatchers || validMatchers.length === 0) {
            setPreviewCount(null);
            setPreviewItems([]);
            setPreviewError(null);
            setIsPreviewLoading(false);
            return;
        }

        setIsPreviewLoading(true);
        setPreviewError(null);
        let isCancelled = false;
        const handler = setTimeout(() => {
            Promise.all([
                api.get<{ count: number }>('/alert-rules/count', { params: { matchers: JSON.stringify(validMatchers) } }),
                api.get<{ items: AlertRule[]; total: number }>('/alert-rules', { params: { matchers: JSON.stringify(validMatchers), limit: previewLimit } })
            ])
                .then(([countRes, listRes]) => {
                    if (isCancelled) return;
                    setPreviewCount(countRes.data.count ?? null);
                    setPreviewItems(listRes.data.items ?? []);
                })
                .catch(() => {
                    if (isCancelled) return;
                    setPreviewCount(null);
                    setPreviewItems([]);
                    setPreviewError('無法載入預覽結果，請稍後再試。');
                })
                .finally(() => {
                    if (isCancelled) return;
                    setIsPreviewLoading(false);
                });
        }, 400);

        return () => {
            isCancelled = true;
            clearTimeout(handler);
        };
    }, [formData.matchers]);

    const renderMatcherValueInput = (matcher: SilenceMatcher, index: number) => {
        const allowed_values = options?.values[matcher.key] || [];

        if (allowed_values.length > 0) {
            return (
                <MultiSelectDropdown
                    options={allowed_values.map(v => ({ id: v, value: v }))}
                    selectedValues={matcher.value ? matcher.value.split('|') : []}
                    onChange={(newValues) => {
                        const newMatchers = JSON.parse(JSON.stringify(formData.matchers || []));
                        const currentMatcher = newMatchers[index];
                        currentMatcher.value = newValues.join('|');
                        if (newValues.length > 1) {
                            currentMatcher.operator = '~=';
                        }
                        setFormData({ ...formData, matchers: newMatchers });
                    }}
                    placeholder={scopeContent?.SELECT_VALUE ?? '選擇或輸入值...'}
                />
            );
        }

        return (
            <input
                type="text"
                value={matcher.value}
                onChange={(e) => handleMatcherChange(index, 'value', e.target.value)}
                className="flex-grow rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                placeholder={scopeContent?.VALUE_PLACEHOLDER ?? '標籤值（例如：api-service）'}
            />
        );
    };


    return (
        <div className="space-y-6 px-4 pb-4">
            <div>
                <h3 className="text-lg font-semibold text-white">{scopeContent?.TITLE ?? '靜音條件'}</h3>
                <p className="mt-1 text-sm text-slate-400 leading-relaxed">{scopeContent?.DESCRIPTION ?? '定義符合哪些條件的事件將會被靜音。'}</p>
            </div>
            <div className="space-y-3 rounded-xl border border-slate-700 bg-slate-900/40 p-5">
                {formData.matchers?.map((matcher, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <select value={matcher.key} onChange={e => handleMatcherChange(index, 'key', e.target.value)} className="w-1/3 bg-slate-700 rounded-md px-3 py-2 text-sm">
                            <option value="">選擇標籤鍵...</option>
                            {options?.keys.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                        <select value={matcher.operator} onChange={e => handleMatcherChange(index, 'operator', e.target.value as SilenceMatcher['operator'])} className="bg-slate-700 rounded-md px-3 py-2 text-sm">
                            <option value="=">=</option>
                            <option value="!=">!=</option>
                            <option value="~=">~= (regex)</option>
                        </select>
                        {renderMatcherValueInput(matcher, index)}
                        <button onClick={() => removeMatcher(index)} className="p-2 text-slate-400 hover:text-red-400"><Icon name="trash-2" className="w-4 h-4" /></button>
                    </div>
                ))}
                <button onClick={addMatcher} className="text-sm text-sky-400 hover:text-sky-300 flex items-center"><Icon name="plus" className="w-4 h-4 mr-1" /> {scopeContent?.ADD_MATCHER ?? '新增匹配條件'}</button>
            </div>

            <div className="space-y-3 rounded-xl border border-slate-700 bg-slate-900/40 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-semibold text-white">{scopeContent?.PREVIEW_TITLE ?? '匹配告警規則預覽'}</h3>
                        <p className="mt-1 text-sm text-slate-400 leading-relaxed">{scopeContent?.PREVIEW_DESCRIPTION ?? '系統會即時計算符合條件的告警規則數量並列出前幾筆。'}</p>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/50 bg-sky-500/10 px-3 py-1 text-sm font-semibold text-sky-200">
                        {isPreviewLoading ? (
                            <>
                                <Icon name="loader-circle" className="h-4 w-4 animate-spin" />
                                載入中…
                            </>
                        ) : (
                            <>
                                {previewCount ?? 0} 條
                            </>
                        )}
                    </span>
                </div>
                {previewError && (
                    <p className="rounded-md bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{previewError}</p>
                )}
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-slate-800/60 bg-slate-900/60 p-3">
                    {isPreviewLoading ? (
                        <div className="space-y-2">
                            <div className="h-12 animate-pulse rounded-md bg-slate-800/60" />
                            <div className="h-12 animate-pulse rounded-md bg-slate-800/60" />
                        </div>
                    ) : previewItems.length > 0 ? (
                        previewItems.map(rule => (
                            <div key={rule.id} className="flex items-start justify-between gap-3 rounded-md bg-slate-800/60 px-3 py-2">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-slate-100" title={rule.name}>{rule.name}</p>
                                    <p className="mt-1 text-xs text-slate-400" title={rule.conditions_summary}>{rule.conditions_summary}</p>
                                </div>
                                <StatusTag label={ALERT_PREVIEW_SEVERITY_LABEL[rule.severity]} tone={ALERT_PREVIEW_SEVERITY_TONE[rule.severity]} dense />
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-slate-400">{scopeContent?.PREVIEW_EMPTY ?? '目前沒有符合條件的告警規則。'}</p>
                    )}
                </div>
            </div>

            <label className="flex items-center space-x-3 cursor-pointer rounded-lg bg-slate-900/40 p-3 transition-colors hover:bg-slate-900/60">
                <input type="checkbox" checked={formData.enabled} onChange={e => setFormData({ ...formData, enabled: e.target.checked })} className="form-checkbox h-5 w-5 rounded bg-slate-800 border-slate-600 text-sky-500 focus:ring-sky-500" />
                <span className="text-slate-300 font-semibold">{scopeContent?.ENABLE_RULE ?? '立即啟用此靜音規則'}</span>
            </label>
        </div>
    );
};

export default SilenceRuleEditModal;
