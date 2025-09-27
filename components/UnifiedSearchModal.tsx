

import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import { Resource, ResourceFilters, AlertRule, Incident, SilenceRule } from '../types';
import api from '../services/api';
import { PAGE_CONTENT } from '../constants/pages';
import { useOptions } from '../contexts/OptionsContext';

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
  const { options, isLoading: isLoadingOptions } = useOptions();

  useEffect(() => {
    if (isOpen) {
      setFilters(initialFilters);
    }
  }, [isOpen, initialFilters]);

  const handleSearch = () => {
    onSearch(filters);
  };
  
  const handleClear = () => {
      setFilters({});
  }

  const renderIncidentFilters = () => (
    <>
      <FormRow label={content.INCIDENTS.STATUS}>
        <select value={(filters as IncidentFilters).status || ''} onChange={e => setFilters(prev => ({ ...(prev as IncidentFilters), status: e.target.value as IncidentFilters['status'] }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{content.ALL_STATUSES}</option>
          {options?.incidents.statuses.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </FormRow>
      <FormRow label={content.INCIDENTS.SEVERITY}>
        <select value={(filters as IncidentFilters).severity || ''} onChange={e => setFilters(prev => ({ ...(prev as IncidentFilters), severity: e.target.value as IncidentFilters['severity'] }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{content.ALL_SEVERITIES}</option>
          {options?.incidents.severities.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
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
          {options?.alertRules.severities.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </FormRow>
      <FormRow label={globalContent.STATUS}>
        <select value={(filters as AlertRuleFilters).enabled === undefined ? '' : String((filters as AlertRuleFilters).enabled)} onChange={e => setFilters(prev => ({ ...(prev as AlertRuleFilters), enabled: e.target.value === '' ? undefined : e.target.value === 'true' }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{globalContent.ALL}</option>
          {options?.alertRules.statuses.map(opt => <option key={String(opt.value)} value={String(opt.value)}>{opt.label}</option>)}
        </select>
      </FormRow>
    </>
  );

  const renderSilenceRuleFilters = () => (
    <>
      <FormRow label={globalContent.TYPE}>
        <select value={(filters as SilenceRuleFilters).type || ''} onChange={e => setFilters(prev => ({ ...(prev as SilenceRuleFilters), type: e.target.value as SilenceRuleFilters['type'] }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{content.ALL_TYPES}</option>
          {options?.silenceRules.types.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </FormRow>
       <FormRow label={globalContent.STATUS}>
        <select value={(filters as SilenceRuleFilters).enabled === undefined ? '' : String((filters as SilenceRuleFilters).enabled)} onChange={e => setFilters(prev => ({ ...(prev as SilenceRuleFilters), enabled: e.target.value === '' ? undefined : e.target.value === 'true' }))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
          <option value="">{globalContent.ALL}</option>
          {options?.silenceRules.statuses.map(opt => <option key={String(opt.value)} value={String(opt.value)}>{opt.label}</option>)}
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
            </>
        )}
      </div>
    </Modal>
  );
};

export default UnifiedSearchModal;