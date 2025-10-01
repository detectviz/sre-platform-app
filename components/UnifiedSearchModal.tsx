import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import {
  Resource, ResourceFilters, AlertRule, Incident, IncidentImpact, IncidentSeverity, IncidentStatus, SilenceRule, TagManagementFilters, User, AuditLogFilters,
  DashboardFilters, AutomationHistoryFilters, PersonnelFilters, ResourceGroupFilters, AutomationTriggerFilters,
  NotificationStrategyFilters, NotificationChannelFilters, NotificationHistoryFilters, AutomationPlaybook,
  LogExplorerFilters
} from '../types';
import api from '../services/api';
import { useOptions } from '../contexts/OptionsContext';
import { useContent } from '../contexts/ContentContext';

export interface IncidentFilters {
  keyword?: string;
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  impact?: IncidentImpact;
  assignee?: string;
  startTime?: string;
  endTime?: string;
}

export interface AlertRuleFilters {
  keyword?: string;
  severity?: 'critical' | 'warning' | 'info';
  enabled?: boolean;
}

export interface SilenceRuleFilters {
  keyword?: string;
  type?: 'single' | 'repeat' | 'condition';
  enabled?: boolean;
}

type Filters = IncidentFilters | AlertRuleFilters | SilenceRuleFilters | ResourceFilters | TagManagementFilters | AuditLogFilters | DashboardFilters | AutomationHistoryFilters | PersonnelFilters | ResourceGroupFilters | AutomationTriggerFilters | NotificationStrategyFilters | NotificationChannelFilters | NotificationHistoryFilters | LogExplorerFilters;

interface UnifiedSearchModalProps {
  page: 'incidents' | 'alert-rules' | 'silence-rules' | 'resources' | 'tag-management' | 'audit-logs' | 'dashboards' | 'automation-history' | 'personnel' | 'resource-groups' | 'automation-triggers' | 'notification-strategies' | 'notification-channels' | 'notification-history' | 'teams' | 'roles' | 'logs';
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: Filters) => void;
  initialFilters: Filters;
}

const FormRow = ({ label, children }: { label: string; children?: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
    {children}
  </div>
);

const UnifiedSearchModal: React.FC<UnifiedSearchModalProps> = ({ page, isOpen, onClose, onSearch, initialFilters }) => {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const { options, isLoading: isLoadingOptions } = useOptions();
  const [users, setUsers] = useState<User[]>([]);
  const [playbooks, setPlaybooks] = useState<AutomationPlaybook[]>([]);
  const { content: pageContent } = useContent();
  const globalContent = pageContent?.GLOBAL;
  const content = pageContent?.UNIFIED_SEARCH;

  useEffect(() => {
    if (isOpen) {
      setFilters(initialFilters);
      if (page === 'audit-logs') {
        api.get<{ items: User[] }>('/iam/users', { params: { page: 1, page_size: 1000 } })
          .then(res => setUsers(res.data.items))
          .catch(err => console.error("Failed to fetch users for filter", err));
      }
      if (page === 'automation-history') {
        api.get<AutomationPlaybook[]>('/automation/scripts')
          .then(res => setPlaybooks(res.data))
          .catch(err => console.error("Failed to fetch playbooks for filter", err));
      }
    }
  }, [isOpen, initialFilters, page]);

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({});
  }

  const modalTitle = content?.TITLE ?? '進階搜尋';

  if (!content || !globalContent) {
    return (
      <Modal
        title={modalTitle}
        isOpen={isOpen}
        onClose={onClose}
        width="w-1/2 max-w-2xl"
      >
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
          <Icon name="loader-circle" className="w-6 h-6 animate-spin" />
          <p className="text-sm">搜尋配置載入中，請稍候...</p>
        </div>
      </Modal>
    );
  }

  const renderIncidentFilters = () => (
    <>
      <FormRow label={content.INCIDENTS.STATUS}>
        <select value={(filters as IncidentFilters).status || ''} onChange={e => setFilters(prev => ({ ...(prev as IncidentFilters), status: e.target.value as IncidentFilters['status'] }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{content.ALL_STATUSES}</option>
          {options?.incidents?.statuses.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </FormRow>
      <FormRow label={content.INCIDENTS.SEVERITY}>
        <select value={(filters as IncidentFilters).severity || ''} onChange={e => setFilters(prev => ({ ...(prev as IncidentFilters), severity: e.target.value as IncidentFilters['severity'] }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{content.ALL_SEVERITIES}</option>
          {options?.incidents?.severities.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </FormRow>
      <FormRow label={content.INCIDENTS.IMPACT}>
        <select value={(filters as IncidentFilters).impact || ''} onChange={e => setFilters(prev => ({ ...(prev as IncidentFilters), impact: e.target.value as IncidentFilters['impact'] }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{content.ALL_IMPACTS}</option>
          {options?.incidents?.impacts.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </FormRow>
      <FormRow label={content.INCIDENTS.ASSIGNEE}>
        <input type="text" value={(filters as IncidentFilters).assignee || ''} onChange={e => setFilters(prev => ({ ...(prev as IncidentFilters), assignee: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
      </FormRow>
      <div className="col-span-2">
        <FormRow label={content.INCIDENTS.TRIGGER_TIME_RANGE}>
          <div className="flex space-x-2">
            <input type="datetime-local" value={(filters as IncidentFilters).startTime || ''} onChange={e => setFilters(prev => ({ ...(prev as IncidentFilters), startTime: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
            <input type="datetime-local" value={(filters as IncidentFilters).endTime || ''} onChange={e => setFilters(prev => ({ ...(prev as IncidentFilters), endTime: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
          </div>
        </FormRow>
      </div>
    </>
  );

  const renderAlertRuleFilters = () => (
    <>
      <FormRow label={content.ALERT_RULES.SEVERITY}>
        <select value={(filters as AlertRuleFilters).severity || ''} onChange={e => setFilters(prev => ({ ...(prev as AlertRuleFilters), severity: e.target.value as AlertRuleFilters['severity'] }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{content.ALL_SEVERITIES}</option>
          {options?.alert_rules.severities.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </FormRow>
      <FormRow label={globalContent.STATUS}>
        <select value={(filters as AlertRuleFilters).enabled === undefined ? '' : String((filters as AlertRuleFilters).enabled)} onChange={e => setFilters(prev => ({ ...(prev as AlertRuleFilters), enabled: e.target.value === '' ? undefined : e.target.value === 'true' }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{globalContent.ALL}</option>
          {options?.alert_rules.statuses.map(opt => <option key={String(opt.value)} value={String(opt.value)}>{opt.label}</option>)}
        </select>
      </FormRow>
    </>
  );

  const renderSilenceRuleFilters = () => (
    <>
      <FormRow label={globalContent.TYPE}>
        <select value={(filters as SilenceRuleFilters).type || ''} onChange={e => setFilters(prev => ({ ...(prev as SilenceRuleFilters), type: e.target.value as SilenceRuleFilters['type'] }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{content.ALL_TYPES}</option>
          {options?.silence_rules.types.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </FormRow>
      <FormRow label={globalContent.STATUS}>
        <select value={(filters as SilenceRuleFilters).enabled === undefined ? '' : String((filters as SilenceRuleFilters).enabled)} onChange={e => setFilters(prev => ({ ...(prev as SilenceRuleFilters), enabled: e.target.value === '' ? undefined : e.target.value === 'true' }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{globalContent.ALL}</option>
          {options?.silence_rules.statuses.map(opt => <option key={String(opt.value)} value={String(opt.value)}>{opt.label}</option>)}
        </select>
      </FormRow>
    </>
  );

  const renderResourceFilters = () => (
    <>
      <FormRow label={globalContent.STATUS}>
        <select value={(filters as ResourceFilters).status || ''} onChange={e => setFilters(prev => ({ ...(prev as ResourceFilters), status: e.target.value as Resource['status'] }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{content.ALL_STATUSES}</option>
          {options?.resources.statuses.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </FormRow>
      <FormRow label={globalContent.TYPE}>
        <select value={(filters as ResourceFilters).type || ''} onChange={e => setFilters(prev => ({ ...(prev as ResourceFilters), type: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{content.ALL_TYPES}</option>
          {options?.resources.types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </FormRow>
      <FormRow label={content.RESOURCES.PROVIDER}>
        <select value={(filters as ResourceFilters).provider || ''} onChange={e => setFilters(prev => ({ ...(prev as ResourceFilters), provider: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{content.ALL_PROVIDERS}</option>
          {options?.resources.providers.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </FormRow>
      <FormRow label={content.RESOURCES.REGION}>
        <select value={(filters as ResourceFilters).region || ''} onChange={e => setFilters(prev => ({ ...(prev as ResourceFilters), region: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{content.ALL_REGIONS}</option>
          {options?.resources.regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </FormRow>
    </>
  );

  const renderTagManagementFilters = () => (
    <>
      <FormRow label={content.TAG_MANAGEMENT.SCOPE}>
        <select
          value={(filters as TagManagementFilters).scope || ''}
          onChange={e => setFilters(prev => ({ ...(prev as TagManagementFilters), scope: e.target.value as TagManagementFilters['scope'] }))}
          className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
        >
          <option value="">{content.TAG_MANAGEMENT.ALL_SCOPES}</option>
          {options?.tag_management.scopes.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </FormRow>
    </>
  );

  const renderAuditLogFilters = () => (
    <>
      <FormRow label={content.AUDIT_LOGS.USER}>
        <select value={(filters as AuditLogFilters).user || ''} onChange={e => setFilters(prev => ({ ...(prev as AuditLogFilters), user: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{content.AUDIT_LOGS.ALL_USERS}</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </FormRow>
      <FormRow label={content.AUDIT_LOGS.ACTION}>
        <select value={(filters as AuditLogFilters).action || ''} onChange={e => setFilters(prev => ({ ...(prev as AuditLogFilters), action: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{content.AUDIT_LOGS.ALL_ACTIONS}</option>
          {options?.audit_logs.action_types.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </FormRow>
      <div className="col-span-2">
        <FormRow label={content.AUDIT_LOGS.TIME_RANGE}>
          <div className="flex space-x-2">
            <input type="datetime-local" value={(filters as AuditLogFilters).start_date || ''} onChange={e => setFilters(prev => ({ ...(prev as AuditLogFilters), startDate: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
            <input type="datetime-local" value={(filters as AuditLogFilters).end_date || ''} onChange={e => setFilters(prev => ({ ...(prev as AuditLogFilters), endDate: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
          </div>
        </FormRow>
      </div>
    </>
  );

  const renderDashboardFilters = () => (
    <>
      <FormRow label={content.DASHBOARDS.CATEGORY}>
        <select value={(filters as DashboardFilters).category || ''} onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{content.DASHBOARDS.ALL_CATEGORIES}</option>
          {options?.dashboards.categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </FormRow>
    </>
  );

  const renderAutomationHistoryFilters = () => (
    <>
      <FormRow label={content.AUTOMATION_HISTORY.PLAYBOOK}>
        <select value={(filters as AutomationHistoryFilters).playbook_id || ''} onChange={e => setFilters(prev => ({ ...prev, playbookId: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{content.AUTOMATION_HISTORY.ALL_PLAYBOOKS}</option>
          {playbooks.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </FormRow>
      <FormRow label={content.AUTOMATION_HISTORY.STATUS}>
        <select value={(filters as AutomationHistoryFilters).status || ''} onChange={e => setFilters(prev => ({ ...prev, status: e.target.value as any }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{content.ALL_STATUSES}</option>
          {options?.automation_executions.statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </FormRow>
      <div className="col-span-2">
        <FormRow label={content.AUTOMATION_HISTORY.TIME_RANGE}>
          <div className="flex space-x-2">
            <input type="datetime-local" value={(filters as AutomationHistoryFilters).start_date || ''} onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
            <input type="datetime-local" value={(filters as AutomationHistoryFilters).end_date || ''} onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
          </div>
        </FormRow>
      </div>
    </>
  );

  const renderNotificationHistoryFilters = () => (
    <>
      <FormRow label={content.NOTIFICATION_HISTORY.STATUS}>
        <select value={(filters as NotificationHistoryFilters).status || ''} onChange={e => setFilters(prev => ({ ...prev, status: e.target.value as any }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{content.ALL_STATUSES}</option>
          {options?.notification_history.statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </FormRow>
      <FormRow label={content.NOTIFICATION_HISTORY.CHANNEL_TYPE}>
        <select value={(filters as NotificationHistoryFilters).channel_type || ''} onChange={e => setFilters(prev => ({ ...prev, channelType: e.target.value as any }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{content.NOTIFICATION_HISTORY.ALL_CHANNEL_TYPES}</option>
          {options?.notification_history.channel_types.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </FormRow>
      <div className="col-span-2">
        <FormRow label={content.NOTIFICATION_HISTORY.TIME_RANGE}>
          <div className="flex space-x-2">
            <input type="datetime-local" value={(filters as NotificationHistoryFilters).start_date || ''} onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
            <input type="datetime-local" value={(filters as NotificationHistoryFilters).end_date || ''} onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
          </div>
        </FormRow>
      </div>
    </>
  );

  const renderLogExplorerFilters = () => (
    <>
      <FormRow label="時間範圍">
        <select
          value={(filters as LogExplorerFilters).timeRange || ''}
          onChange={e => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
          className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
        >
          {options?.logs.time_range_options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </FormRow>
    </>
  );


  return (
    <Modal
      title={modalTitle}
      isOpen={isOpen}
      onClose={onClose}
      width="w-1/2 max-w-2xl"
      footer={
        <div className="flex justify-between w-full">
          <button onClick={handleClear} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">{content.CLEAR_FILTERS}</button>
          <div className="space-x-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">{globalContent.CANCEL}</button>
            <button onClick={handleSearch} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors">{content.SEARCH}</button>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <FormRow label={content.KEYWORD_SEARCH}>
            <input type="text" placeholder={content.KEYWORD_PLACEHOLDER} value={filters.keyword || ''} onChange={e => setFilters(prev => ({ ...prev, keyword: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
          </FormRow>
        </div>
        {isLoadingOptions ? (
          <div className="md:col-span-2 text-center p-8">
            <Icon name="loader-circle" className="w-6 h-6 animate-spin inline-block text-slate-400" />
          </div>
        ) : (
          <>
            {page === 'incidents' && renderIncidentFilters()}
            {page === 'alert-rules' && renderAlertRuleFilters()}
            {page === 'silence-rules' && renderSilenceRuleFilters()}
            {page === 'resources' && renderResourceFilters()}
            {page === 'tag-management' && renderTagManagementFilters()}
            {page === 'audit-logs' && renderAuditLogFilters()}
            {page === 'dashboards' && renderDashboardFilters()}
            {page === 'automation-history' && renderAutomationHistoryFilters()}
            {page === 'notification-history' && renderNotificationHistoryFilters()}
            {page === 'logs' && renderLogExplorerFilters()}
            {/* No specific filters for personnel, resource-groups, teams, roles, triggers, strategies, channels yet besides keyword */}
          </>
        )}
      </div>
    </Modal>
  );
};

export default UnifiedSearchModal;