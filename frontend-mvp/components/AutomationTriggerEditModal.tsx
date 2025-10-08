import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import parser from 'cron-parser';
import Modal from './Modal';
import FormRow from './FormRow';
import { AutomationTrigger, TriggerType, AutomationPlaybook, TagDefinition } from '../types';
import api from '../services/api';
import Icon from './Icon';
import { showToast } from '../services/toast';
import { useOptions } from '../contexts/OptionsContext';
import IconButton from './IconButton';

interface AutomationTriggerEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (trigger: Partial<AutomationTrigger>) => void;
    trigger: AutomationTrigger | null;
}

type ConditionRow = { id: string; key: string; operator: string; value: string };
type ConditionGroup = { id: string; conditions: ConditionRow[] };

const uniqueId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const createConditionRow = (): ConditionRow => ({ id: uniqueId('cond'), key: '', operator: '=', value: '' });

const createConditionGroup = (): ConditionGroup => ({ id: uniqueId('group'), conditions: [createConditionRow()] });

const parseConditionGroups = (expression?: string): ConditionGroup[] => {
    if (!expression || !expression.trim()) {
        return [createConditionGroup()];
    }

    const groups = expression
        .split(/\s+OR\s+/i)
        .map(segment => segment.trim())
        .filter(Boolean)
        .map(groupExpression => {
            const sanitized = groupExpression.replace(/^\(/, '').replace(/\)$/, '').trim();
            const conditionParts = sanitized.split(/\s+AND\s+/i).filter(Boolean);
            const conditions = conditionParts.map(part => {
                const match = part.match(/([a-zA-Z0-9_.-]+)\s*(!=|~=|=)\s*(?:"([^"]*)"|'([^']*)'|([^\s]+))/);
                if (!match) {
                    return createConditionRow();
                }
                const value = match[3] || match[4] || match[5] || '';
                return {
                    id: uniqueId('cond'),
                    key: match[1],
                    operator: match[2] as ConditionRow['operator'],
                    value,
                };
            });
            return {
                id: uniqueId('group'),
                conditions: conditions.length > 0 ? conditions : [createConditionRow()],
            };
        });

    return groups.length > 0 ? groups : [createConditionGroup()];
};

const serializeConditionGroups = (groups: ConditionGroup[]): string => {
    const serializedGroups = groups
        .map(group => {
            const valid = group.conditions.filter(condition => condition.key.trim() && condition.value.trim());
            if (valid.length === 0) {
                return '';
            }
            const clause = valid
                .map(condition => `${condition.key.trim()} ${condition.operator} "${condition.value.trim()}"`)
                .join(' AND ');
            return `(${clause})`;
        })
        .filter(Boolean);
    return serializedGroups.join(' OR ');
};

const WEBHOOK_AUTH_OPTIONS: Array<{ value: string; label: string }> = [
    { value: 'none', label: '無認證' },
    { value: 'token', label: 'Token 驗證' },
    { value: 'basic', label: 'Basic Auth' },
];

const HTTP_METHOD_OPTIONS = ['post', 'put', 'patch', 'delete'];


const AutomationTriggerEditModal: React.FC<AutomationTriggerEditModalProps> = ({ isOpen, onClose, onSave, trigger }) => {
    const [formData, setFormData] = useState<Partial<AutomationTrigger>>({});
    const [playbooks, setPlaybooks] = useState<AutomationPlaybook[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { options, isLoading: isLoadingOptions } = useOptions();
    const triggerOptions = options?.automation_triggers;
    const [tagDefs, setTagDefs] = useState<TagDefinition[]>([]);
    const [conditionGroups, setConditionGroups] = useState<ConditionGroup[]>([createConditionGroup()]);
    const [cronPreview, setCronPreview] = useState('');
    const [cronError, setCronError] = useState<string | null>(null);

    const conditionKeyOptions = useMemo(() => {
        const keys = triggerOptions?.condition_keys ?? [];
        return [...keys].sort((a, b) => a.localeCompare(b, 'zh-Hant'));
    }, [triggerOptions?.condition_keys]);

    const severityOptions = useMemo(() => triggerOptions?.severity_options ?? [], [triggerOptions?.severity_options]);

    useEffect(() => {
        if (isOpen) {
            if (isLoadingOptions || !triggerOptions) return;

            setIsLoading(true);
            Promise.all([
                api.get<{ items: AutomationPlaybook[], total: number }>('/automation/scripts'),
                api.get<TagDefinition[]>('/settings/tags'),
            ]).then(([playbooksRes, tagsRes]) => {
                setPlaybooks(playbooksRes.data.items);
                setTagDefs(tagsRes.data);

                const fallbackType = triggerOptions.trigger_types[0]?.value || 'schedule';
                const incomingFormData: Partial<AutomationTrigger> = trigger
                    ? JSON.parse(JSON.stringify(trigger))
                    : {
                        name: '',
                        description: '',
                        type: fallbackType,
                        enabled: true,
                        target_playbook_id: playbooksRes.data.items[0]?.id || '',
                        config: triggerOptions.default_configs?.[fallbackType] || { cron: '0 * * * *' },
                    };

                const mergedConfig = {
                    ...(triggerOptions.default_configs?.[incomingFormData.type as TriggerType] || {}),
                    ...(incomingFormData.config || {}),
                } as AutomationTrigger['config'];

                if ((incomingFormData.type || fallbackType) === 'schedule') {
                    mergedConfig.cron = mergedConfig.cron || '0 * * * *';
                }
                if ((incomingFormData.type || fallbackType) === 'webhook') {
                    mergedConfig.webhook_url = mergedConfig.webhook_url || '';
                    mergedConfig.http_method = mergedConfig.http_method || 'post';
                    mergedConfig.auth_type = mergedConfig.auth_type || 'none';
                    mergedConfig.custom_headers = mergedConfig.custom_headers || '';
                    mergedConfig.secret = mergedConfig.secret || '';
                    mergedConfig.username = mergedConfig.username || '';
                    mergedConfig.password = mergedConfig.password || '';
                }

                const normalizedFormData = {
                    ...incomingFormData,
                    config: mergedConfig,
                };

                setFormData(normalizedFormData);
                if ((normalizedFormData.type || fallbackType) === 'event') {
                    setConditionGroups(parseConditionGroups(normalizedFormData.config?.event_conditions));
                } else {
                    setConditionGroups([createConditionGroup()]);
                }

            }).catch(err => { /* Failed to fetch data for modal */ })
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, trigger, isLoadingOptions, triggerOptions]);

    const handleSave = () => {
        onSave(formData);
    };

    useEffect(() => {
        if ((formData.type as TriggerType) !== 'schedule') {
            setCronPreview('');
            setCronError(null);
            return;
        }
        const cronExpression = formData.config?.cron;
        if (!cronExpression || cronExpression.trim().length === 0) {
            setCronPreview('請輸入 Cron 表達式');
            setCronError(null);
            return;
        }
        try {
            const iterator = (parser as any).CronExpressionParser.parse(cronExpression, { currentDate: new Date() });
            const next = iterator.next().toDate();
            const formatted = dayjs(next).format('YYYY/MM/DD HH:mm');
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            setCronPreview(`${formatted}（${timezone}）`);
            setCronError(null);
        } catch (error) {
            setCronPreview('無法解析 Cron');
            setCronError('Cron 格式無效，請確認 5 個欄位。');
        }
    }, [formData.type, formData.config?.cron]);

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

    const updateConditionGroups = useCallback((groups: ConditionGroup[]) => {
        setConditionGroups(groups);
        handleConfigChange('event_conditions', serializeConditionGroups(groups));
    }, [handleConfigChange]);

    const handleTypeChange = (newType: TriggerType) => {
        const defaults = triggerOptions?.default_configs[newType] || {};
        const mergedConfig = {
            ...defaults,
            ...(formData.config || {}),
        } as AutomationTrigger['config'];

        if (newType === 'schedule') {
            mergedConfig.cron = mergedConfig.cron || '0 * * * *';
        }
        if (newType === 'webhook') {
            mergedConfig.webhook_url = mergedConfig.webhook_url || '';
            mergedConfig.http_method = mergedConfig.http_method || 'post';
            mergedConfig.auth_type = mergedConfig.auth_type || 'none';
            mergedConfig.custom_headers = mergedConfig.custom_headers || '';
            mergedConfig.secret = mergedConfig.secret || '';
            mergedConfig.username = mergedConfig.username || '';
            mergedConfig.password = mergedConfig.password || '';
        }
        if (newType === 'event') {
            const nextGroups = parseConditionGroups(mergedConfig.event_conditions);
            mergedConfig.event_conditions = serializeConditionGroups(nextGroups);
            setConditionGroups(nextGroups);
        } else {
            setConditionGroups([createConditionGroup()]);
        }

        setFormData(prev => ({
            ...prev,
            type: newType,
            config: mergedConfig,
        }));
    };

    const handleConditionKeyChange = (groupId: string, conditionId: string, value: string) => {
        updateConditionGroups(conditionGroups.map(group => {
            if (group.id !== groupId) return group;
            return {
                ...group,
                conditions: group.conditions.map(condition => condition.id === conditionId
                    ? { ...condition, key: value, value: '' }
                    : condition),
            };
        }));
    };

    const handleConditionOperatorChange = (groupId: string, conditionId: string, value: string) => {
        updateConditionGroups(conditionGroups.map(group => {
            if (group.id !== groupId) return group;
            return {
                ...group,
                conditions: group.conditions.map(condition => condition.id === conditionId
                    ? { ...condition, operator: value as ConditionRow['operator'] }
                    : condition),
            };
        }));
    };

    const handleConditionValueChange = (groupId: string, conditionId: string, value: string) => {
        updateConditionGroups(conditionGroups.map(group => {
            if (group.id !== groupId) return group;
            return {
                ...group,
                conditions: group.conditions.map(condition => condition.id === conditionId
                    ? { ...condition, value }
                    : condition),
            };
        }));
    };

    const addConditionToGroup = (groupId: string) => {
        updateConditionGroups(conditionGroups.map(group => {
            if (group.id !== groupId) return group;
            return { ...group, conditions: [...group.conditions, createConditionRow()] };
        }));
    };

    const removeConditionFromGroup = (groupId: string, conditionId: string) => {
        updateConditionGroups(conditionGroups.map(group => {
            if (group.id !== groupId) return group;
            if (group.conditions.length === 1) return group;
            return { ...group, conditions: group.conditions.filter(condition => condition.id !== conditionId) };
        }));
    };

    const addConditionGroup = () => {
        updateConditionGroups([...conditionGroups, createConditionGroup()]);
    };

    const removeConditionGroup = (groupId: string) => {
        if (conditionGroups.length === 1) return;
        updateConditionGroups(conditionGroups.filter(group => group.id !== groupId));
    };

    const renderConditionValueInput = (groupId: string, condition: ConditionRow) => {
        const baseClassName = "w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm";
        if (condition.key === 'severity') {
            return (
                <select
                    className={baseClassName}
                    value={condition.value}
                    onChange={event => handleConditionValueChange(groupId, condition.id, event.target.value)}
                >
                    <option value="">選擇嚴重性...</option>
                    {severityOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            );
        }
        const tagDef = tagDefs.find(tag => tag.key === condition.key);
        if (tagDef && tagDef.allowed_values.length > 0) {
            return (
                <select
                    className={baseClassName}
                    value={condition.value}
                    onChange={event => handleConditionValueChange(groupId, condition.id, event.target.value)}
                >
                    <option value="">選擇值...</option>
                    {tagDef.allowed_values.map(option => (
                        <option key={option.id} value={option.value}>{option.value}</option>
                    ))}
                </select>
            );
        }
        return (
            <input
                type="text"
                className={baseClassName}
                placeholder="條件值"
                value={condition.value}
                onChange={event => handleConditionValueChange(groupId, condition.id, event.target.value)}
            />
        );
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

                <div className="mt-4 border-t border-slate-700/50 pt-4 space-y-4">
                    {formData.type === 'schedule' && (
                        <FormRow label="Cron 表達式">
                            <input
                                type="text"
                                value={formData.config?.cron || ''}
                                onChange={e => handleConfigChange('cron', e.target.value)}
                                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 font-mono text-sm"
                                placeholder="例如：0 3 * * *"
                            />
                            <div className="mt-2 space-y-1 text-xs">
                                <p className={cronError ? 'text-rose-300' : 'text-slate-400'}>
                                    {cronError ? cronError : `下一次執行時間：${cronPreview || '計算中...'}`}
                                </p>
                                {formData.config?.cron_description && (
                                    <p className="text-slate-500">目前描述：{formData.config.cron_description}</p>
                                )}
                                <p className="text-slate-500">使用 5 欄位 Cron，支援分鐘、時、日、月、星期。</p>
                            </div>
                        </FormRow>
                    )}

                    {formData.type === 'webhook' && (
                        <div className="space-y-4">
                            <FormRow label="Webhook URL">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.config?.webhook_url || '儲存後將自動生成...'}
                                        className="w-full rounded-md border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-300"
                                    />
                                    <IconButton icon="copy" label="複製 URL" tooltip="複製 Webhook URL" onClick={handleCopyWebhookUrl} />
                                </div>
                                <p className="mt-1 text-xs text-slate-500">Webhook 需儲存後才會產生，可分享給外部系統呼叫。</p>
                            </FormRow>
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormRow label="HTTP 方法">
                                    <select
                                        value={(formData.config?.http_method as string) || 'post'}
                                        onChange={event => handleConfigChange('http_method', event.target.value)}
                                        className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
                                    >
                                        {HTTP_METHOD_OPTIONS.map(method => (
                                            <option key={method} value={method}>{method.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </FormRow>
                                <FormRow label="驗證方式">
                                    <select
                                        value={(formData.config?.auth_type as string) || 'none'}
                                        onChange={event => handleConfigChange('auth_type', event.target.value)}
                                        className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
                                    >
                                        {WEBHOOK_AUTH_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </FormRow>
                            </div>
                            {formData.config?.auth_type === 'token' && (
                                <FormRow label="Token / Secret">
                                    <input
                                        type="text"
                                        value={(formData.config?.secret as string) || ''}
                                        onChange={event => handleConfigChange('secret', event.target.value)}
                                        className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
                                        placeholder="請輸入驗證 Token"
                                    />
                                    <p className="mt-1 text-xs text-slate-500">將在回呼時以 Authorization header 帶出。</p>
                                </FormRow>
                            )}
                            {formData.config?.auth_type === 'basic' && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormRow label="帳號">
                                        <input
                                            type="text"
                                            value={(formData.config?.username as string) || ''}
                                            onChange={event => handleConfigChange('username', event.target.value)}
                                            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
                                            placeholder="輸入帳號"
                                        />
                                    </FormRow>
                                    <FormRow label="密碼">
                                        <input
                                            type="password"
                                            value={(formData.config?.password as string) || ''}
                                            onChange={event => handleConfigChange('password', event.target.value)}
                                            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
                                            placeholder="輸入密碼"
                                        />
                                    </FormRow>
                                </div>
                            )}
                            <FormRow label="自訂 Headers (JSON)">
                                <textarea
                                    value={(formData.config?.custom_headers as string) || ''}
                                    onChange={event => handleConfigChange('custom_headers', event.target.value)}
                                    rows={3}
                                    className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-mono"
                                    placeholder='例如：{"X-Signature": "$request_signature"}'
                                />
                                <p className="mt-1 text-xs text-slate-500">系統會將此 JSON 解析後加入請求 Header。</p>
                            </FormRow>
                        </div>
                    )}

                    {formData.type === 'event' && (
                        <div className="space-y-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">事件條件群組</h3>
                                    <p className="text-xs text-slate-400">群組內條件以 AND 串接，群組之間以 OR 建立彈性條件。</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={addConditionGroup}
                                    className="inline-flex items-center gap-2 rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium text-sky-300 hover:bg-slate-700"
                                >
                                    <Icon name="plus" className="h-3.5 w-3.5" /> 新增 OR 群組
                                </button>
                            </div>
                            <div className="space-y-4">
                                {conditionGroups.map((group, groupIndex) => (
                                    <div key={group.id} className="space-y-3 rounded-xl border border-slate-700 bg-slate-900/40 p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-semibold text-white">群組 {groupIndex + 1}</p>
                                                <p className="text-xs text-slate-500">以下條件全部成立時，群組成立。</p>
                                            </div>
                                            {conditionGroups.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeConditionGroup(group.id)}
                                                    className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
                                                >
                                                    <Icon name="trash-2" className="h-3.5 w-3.5" /> 移除群組
                                                </button>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            {group.conditions.map(condition => (
                                                <div key={condition.id} className="flex flex-col gap-2 md:flex-row md:items-center">
                                                    <select
                                                        value={condition.key}
                                                        onChange={event => handleConditionKeyChange(group.id, condition.id, event.target.value)}
                                                        className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm md:w-1/3"
                                                    >
                                                        <option value="">選擇欄位...</option>
                                                        {conditionKeyOptions.map(key => (
                                                            <option key={key} value={key}>{key}</option>
                                                        ))}
                                                    </select>
                                                    <select
                                                        value={condition.operator}
                                                        onChange={event => handleConditionOperatorChange(group.id, condition.id, event.target.value)}
                                                        className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm md:w-28"
                                                    >
                                                        <option value="=">=</option>
                                                        <option value="!=">!=</option>
                                                        <option value="~=">~=</option>
                                                    </select>
                                                    <div className="flex flex-1 items-center gap-2">
                                                        {renderConditionValueInput(group.id, condition)}
                                                        {group.conditions.length > 1 && (
                                                            <IconButton
                                                                icon="trash-2"
                                                                label="移除條件"
                                                                tooltip="移除條件"
                                                                tone="danger"
                                                                onClick={() => removeConditionFromGroup(group.id, condition.id)}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => addConditionToGroup(group.id)}
                                            className="inline-flex items-center gap-2 text-xs text-sky-300 hover:text-sky-200"
                                        >
                                            <Icon name="plus" className="h-3.5 w-3.5" /> 新增 AND 條件
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </Modal>
    );
};

export default AutomationTriggerEditModal;
