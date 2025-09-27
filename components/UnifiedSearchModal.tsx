
import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import { Resource, ResourceFilters } from '../types';
import api from '../services/api';
import { PAGE_CONTENT } from '../constants/pages';

const { GLOBAL: globalContent, UNIFIED_SEARCH: content } = PAGE_CONTENT;

export interface IncidentFilters {
  keyword?: string;
  status?: 'new' | 'acknowledged' | 'resolved' | 'silenced';
  severity?: 'critical' | 'warning' | 'info';
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

type Filters = IncidentFilters | AlertRuleFilters | SilenceRuleFilters | ResourceFilters;

interface UnifiedSearchModalProps {
  page: 'incidents' | 'alert-rules' | 'silence-rules' | 'resources';
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
  const [resourceOptions, setResourceOptions] = useState<{ types: string[], providers: string[], regions: string[] }>({ types: [], providers: [], regions: [] });

  useEffect(() => {
    if (isOpen) {
      setFilters(initialFilters);
      if (page === 'resources') {
        api.get<any>('/resources/options').then(res => setResourceOptions(res.data));
      }
    }
  }, [isOpen, initialFilters, page]);

  const handleSearch = () => {
    onSearch(filters);
  };
  
  const handleClear = () => {
      setFilters({});
  }

  const renderIncidentFilters = () => (
    <>
      <FormRow label={content.INCIDENTS.STATUS}>
        {/* FIX: Use functional update with type casting to prevent type errors on union state. */}
        <select value={(filters as IncidentFilters).status || ''} onChange={e => setFilters(prev => ({ ...(prev as IncidentFilters), status: e.target.value as IncidentFilters['status'] }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{content.ALL_STATUSES}</option>
          <option value="new">New</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
          <option value="silenced">Silenced</option>
        </select>
      </FormRow>
      <FormRow label={content.INCIDENTS.SEVERITY}>
        {/* FIX: Use functional update with type casting to prevent type errors on union state. */}
        <select value={(filters as IncidentFilters).severity || ''} onChange={e => setFilters(prev => ({ ...(prev as IncidentFilters), severity: e.target.value as IncidentFilters['severity'] }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{content.ALL_SEVERITIES}</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
      </FormRow>
      <FormRow label={content.INCIDENTS.ASSIGNEE}>
        {/* FIX: Use functional update with type casting to prevent type errors on union state. */}
        <input type="text" value={(filters as IncidentFilters).assignee || ''} onChange={e => setFilters(prev => ({ ...(prev as IncidentFilters), assignee: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
      </FormRow>
      <div className="col-span-2">
        <FormRow label={content.INCIDENTS.TRIGGER_TIME_RANGE}>
          <div className="flex space-x-2">
            {/* FIX: Use functional update with type casting to prevent type errors on union state. */}
            <input type="datetime-local" value={(filters as IncidentFilters).startTime || ''} onChange={e => setFilters(prev => ({ ...(prev as IncidentFilters), startTime: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
            {/* FIX: Use functional update with type casting to prevent type errors on union state. */}
            <input type="datetime-local" value={(filters as IncidentFilters).endTime || ''} onChange={e => setFilters(prev => ({ ...(prev as IncidentFilters), endTime: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
          </div>
        </FormRow>
      </div>
    </>
  );

  const renderAlertRuleFilters = () => (
     <>
      <FormRow label={content.ALERT_RULES.SEVERITY}>
        {/* FIX: Use functional update with type casting to prevent type errors on union state. */}
        <select value={(filters as AlertRuleFilters).severity || ''} onChange={e => setFilters(prev => ({ ...(prev as AlertRuleFilters), severity: e.target.value as AlertRuleFilters['severity'] }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{content.ALL_SEVERITIES}</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
      </FormRow>
      <FormRow label={globalContent.STATUS}>
        {/* FIX: Use functional update with type casting to prevent type errors on union state. */}
        <select value={(filters as AlertRuleFilters).enabled === undefined ? '' : String((filters as AlertRuleFilters).enabled)} onChange={e => setFilters(prev => ({ ...(prev as AlertRuleFilters), enabled: e.target.value === '' ? undefined : e.target.value === 'true' }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{globalContent.ALL}</option>
          <option value="true">{globalContent.ENABLED}</option>
          <option value="false">{globalContent.DISABLED}</option>
        </select>
      </FormRow>
    </>
  );

  const renderSilenceRuleFilters = () => (
    <>
      <FormRow label={globalContent.TYPE}>
        {/* FIX: Use functional update with type casting to prevent type errors on union state. */}
        <select value={(filters as SilenceRuleFilters).type || ''} onChange={e => setFilters(prev => ({ ...(prev as SilenceRuleFilters), type: e.target.value as SilenceRuleFilters['type'] }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{content.ALL_TYPES}</option>
          <option value="single">Single</option>
          <option value="repeat">Repeat</option>
          <option value="condition">Condition</option>
        </select>
      </FormRow>
       <FormRow label={globalContent.STATUS}>
        {/* FIX: Use functional update with type casting to prevent type errors on union state. */}
        <select value={(filters as SilenceRuleFilters).enabled === undefined ? '' : String((filters as SilenceRuleFilters).enabled)} onChange={e => setFilters(prev => ({ ...(prev as SilenceRuleFilters), enabled: e.target.value === '' ? undefined : e.target.value === 'true' }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{globalContent.ALL}</option>
          <option value="true">{globalContent.ENABLED}</option>
          <option value="false">{globalContent.DISABLED}</option>
        </select>
      </FormRow>
    </>
  );

  const renderResourceFilters = () => (
    <>
      <FormRow label={globalContent.STATUS}>
        {/* FIX: Use functional update with type casting to prevent type errors on union state. */}
        <select value={(filters as ResourceFilters).status || ''} onChange={e => setFilters(prev => ({ ...(prev as ResourceFilters), status: e.target.value as Resource['status'] }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{content.ALL_STATUSES}</option>
          <option value="healthy">Healthy</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
          <option value="offline">Offline</option>
        </select>
      </FormRow>
      <FormRow label={globalContent.TYPE}>
        {/* FIX: Use functional update with type casting to prevent type errors on union state. */}
        <select value={(filters as ResourceFilters).type || ''} onChange={e => setFilters(prev => ({ ...(prev as ResourceFilters), type: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{content.ALL_TYPES}</option>
          {resourceOptions?.types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </FormRow>
      <FormRow label={content.RESOURCES.PROVIDER}>
        {/* FIX: Use functional update with type casting to prevent type errors on union state. */}
        <select value={(filters as ResourceFilters).provider || ''} onChange={e => setFilters(prev => ({ ...(prev as ResourceFilters), provider: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{content.ALL_PROVIDERS}</option>
          {resourceOptions?.providers.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </FormRow>
      <FormRow label={content.RESOURCES.REGION}>
        {/* FIX: Use functional update with type casting to prevent type errors on union state. */}
        <select value={(filters as ResourceFilters).region || ''} onChange={e => setFilters(prev => ({ ...(prev as ResourceFilters), region: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{content.ALL_REGIONS}</option>
          {resourceOptions?.regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </FormRow>
    </>
  );


  return (
    <Modal
      title={content.TITLE}
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
                 {/* FIX: Use functional update for consistency and best practices. */}
                 <input type="text" placeholder={content.KEYWORD_PLACEHOLDER} value={filters.keyword || ''} onChange={e => setFilters(prev => ({ ...prev, keyword: e.target.value }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
            </FormRow>
        </div>
        {page === 'incidents' && renderIncidentFilters()}
        {page === 'alert-rules' && renderAlertRuleFilters()}
        {page === 'silence-rules' && renderSilenceRuleFilters()}
        {page === 'resources' && renderResourceFilters()}
      </div>
    </Modal>
  );
};

export default UnifiedSearchModal;
