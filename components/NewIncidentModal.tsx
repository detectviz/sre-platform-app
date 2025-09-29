import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Modal from './Modal';
import { useOptions } from '../contexts/OptionsContext';
import { useContent } from '../contexts/ContentContext';
import api from '../services/api';
import { AlertRule, Incident, IncidentCreateRequest, Resource } from '../types';
import { showToast } from '../services/toast';
import Icon from './Icon';

interface NewIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (incident: Incident) => void;
}

type FormState = IncidentCreateRequest & { assignee?: string };

const DEFAULT_PRIORITY: Incident['priority'] = 'P2';
const DEFAULT_SEVERITY: Incident['severity'] = 'warning';
const DEFAULT_SERVICE_IMPACT: Incident['serviceImpact'] = 'Medium';

const NewIncidentModal: React.FC<NewIncidentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { options } = useOptions();
  const { content } = useContent();
  const globalContent = content?.GLOBAL;

  const incidentOptions = options?.incidents;
  const [resources, setResources] = useState<Resource[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getInitialForm = useCallback((): FormState => ({
    summary: '',
    resourceId: '',
    ruleId: '',
    severity: incidentOptions?.severities?.[0]?.value ?? DEFAULT_SEVERITY,
    serviceImpact: incidentOptions?.serviceImpacts?.[0]?.value ?? DEFAULT_SERVICE_IMPACT,
    priority: incidentOptions?.priorities?.[0]?.value ?? DEFAULT_PRIORITY,
    assignee: '',
  }), [incidentOptions]);

  const [form, setForm] = useState<FormState>(getInitialForm);

  useEffect(() => {
    if (!isOpen) {
      setForm(getInitialForm());
      setResources([]);
      setRules([]);
      setError(null);
      return;
    }

    const fetchFormData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [resourceRes, rulesRes] = await Promise.all([
          api.get<{ items: Resource[] }>('/resources', { params: { page: 1, page_size: 100 } }),
          api.get<AlertRule[]>('/incidents/alert-rules'),
        ]);
        setResources(resourceRes.data.items);
        setRules(rulesRes.data);

        setForm(prev => ({
          ...prev,
          resourceId: prev.resourceId || resourceRes.data.items[0]?.id || '',
          ruleId: prev.ruleId || rulesRes.data[0]?.id || '',
        }));
      } catch (err) {
        console.error('Failed to load incident creation data', err);
        setError('無法載入事件建立所需資料。');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormData();
  }, [isOpen, getInitialForm]);

  useEffect(() => {
    setForm(prev => ({
      ...prev,
      severity: prev.severity || incidentOptions?.severities?.[0]?.value || DEFAULT_SEVERITY,
      serviceImpact: prev.serviceImpact || incidentOptions?.serviceImpacts?.[0]?.value || DEFAULT_SERVICE_IMPACT,
      priority: prev.priority || incidentOptions?.priorities?.[0]?.value || DEFAULT_PRIORITY,
    }));
  }, [incidentOptions]);

  const handleInputChange = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const canSubmit = useMemo(() => {
    return Boolean(form.summary && form.resourceId && form.ruleId && form.severity && form.serviceImpact);
  }, [form]);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: IncidentCreateRequest = {
        summary: form.summary,
        resourceId: form.resourceId,
        ruleId: form.ruleId,
        severity: form.severity,
        serviceImpact: form.serviceImpact,
        priority: form.priority ? form.priority : undefined,
        assignee: form.assignee?.trim() ? form.assignee.trim() : undefined,
      };
      const { data } = await api.post<Incident>('/incidents', payload);
      showToast(`事件「${data.summary}」已建立。`, 'success');
      onSuccess?.(data);
      onClose();
    } catch (err) {
      console.error('Failed to create incident', err);
      showToast('無法建立事件，請稍後再試。', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [form, canSubmit, onClose, onSuccess]);

  return (
    <Modal
      title="新增事件"
      isOpen={isOpen}
      onClose={onClose}
      width="w-2/5 max-w-2xl"
      footer={(
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-slate-600 text-slate-200 hover:bg-slate-700/70"
            disabled={isSubmitting}
          >
            {globalContent?.CANCEL || '取消'}
          </button>
          <button
            type="submit"
            form="new-incident-form"
            className={`px-4 py-2 rounded-md text-white ${canSubmit && !isSubmitting ? 'bg-sky-600 hover:bg-sky-500' : 'bg-slate-600 cursor-not-allowed'}`}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? '建立中...' : '建立事件'}
          </button>
        </div>
      )}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Icon name="loader-circle" className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      ) : (
        <form id="new-incident-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">事件摘要</label>
            <input
              type="text"
              value={form.summary}
              onChange={e => handleInputChange('summary', e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
              placeholder="請輸入事件摘要"
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">影響資源</label>
              <select
                value={form.resourceId}
                onChange={e => handleInputChange('resourceId', e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
              >
                <option value="" disabled>選擇資源</option>
                {resources.map(resource => (
                  <option key={resource.id} value={resource.id}>{resource.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">觸發規則</label>
              <select
                value={form.ruleId}
                onChange={e => handleInputChange('ruleId', e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
              >
                <option value="" disabled>選擇規則</option>
                {rules.map(rule => (
                  <option key={rule.id} value={rule.id}>{rule.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">嚴重程度</label>
              <select
                value={form.severity}
                onChange={e => handleInputChange('severity', e.target.value as Incident['severity'])}
                className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
              >
                {incidentOptions?.severities?.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">服務影響</label>
              <select
                value={form.serviceImpact}
                onChange={e => handleInputChange('serviceImpact', e.target.value as Incident['serviceImpact'])}
                className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
              >
                {incidentOptions?.serviceImpacts?.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">優先順序</label>
              <select
                value={form.priority || ''}
                onChange={e => handleInputChange('priority', e.target.value ? (e.target.value as Incident['priority']) : undefined)}
                className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
              >
                <option value="">未指定</option>
                {incidentOptions?.priorities?.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">指定負責人 (選填)</label>
            <input
              type="text"
              value={form.assignee || ''}
              onChange={e => handleInputChange('assignee', e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
              placeholder="請輸入負責人名稱"
            />
          </div>
        </form>
      )}
    </Modal>
  );
};

export default NewIncidentModal;
