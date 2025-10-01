import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import FormRow from './FormRow';
import Icon from './Icon';
import KeyValueInput from './KeyValueInput';
import { DiscoveryJob, DiscoveryJobKind, DiscoveryJobExporterBinding, DiscoveryTestResponse } from '../types';
import { showToast } from '../services/toast';
import { useOptions } from '../contexts/OptionsContext';
import api from '../services/api';

interface AutoDiscoveryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: Partial<DiscoveryJob>) => void;
  job: DiscoveryJob | null;
}

const getDefaultTemplateForKind = (kind: DiscoveryJobKind): DiscoveryJobExporterBinding['template_id'] => {
  switch (kind) {
    case 'SNMP':
      return 'snmp_exporter';
    case 'Custom Script':
      return 'none';
    case 'K8s':
    case 'Cloud Provider':
    case 'Static Range':
    default:
      return 'node_exporter';
  }
};

const AutoDiscoveryEditModal: React.FC<AutoDiscoveryEditModalProps> = ({ isOpen, onClose, onSave, job }) => {
  const [formData, setFormData] = useState<Partial<DiscoveryJob>>({});
  const [isTesting, setIsTesting] = useState(false);
  const kubeconfigInputRef = useRef<HTMLInputElement>(null);
  const { options, isLoading: isLoadingOptions } = useOptions();
  const autoDiscoveryOptions = options?.auto_discovery;
  const exporter_templates = autoDiscoveryOptions?.exporter_templates || [];
  const mib_profiles = autoDiscoveryOptions?.mib_profiles || [];
  const edge_gateways = autoDiscoveryOptions?.edge_gateways || [];

  useEffect(() => {
    if (isOpen && autoDiscoveryOptions) {
      const defaultKind = (job?.kind as DiscoveryJobKind) || autoDiscoveryOptions.job_kinds[0] || 'K8s';
      const defaultTemplate = job?.exporter_binding?.template_id || getDefaultTemplateForKind(defaultKind);
      const initialData: Partial<DiscoveryJob> = job
        ? {
            ...job,
            kind: job.kind,
            target_config: job.target_config || {},
            exporter_binding: job.exporter_binding || { template_id: defaultTemplate },
            edge_gateway: job.edge_gateway || { enabled: false },
            tags: job.tags || []
          }
        : {
            name: '',
            kind: defaultKind,
            schedule: '0 * * * *',
            target_config: {},
            exporter_binding: { template_id: defaultTemplate },
            edge_gateway: { enabled: false },
            tags: []
          };
      setFormData(initialData);
    }
    if (!isOpen) {
      setFormData({});
    }
  }, [isOpen, job, autoDiscoveryOptions]);

  const handleKindChange = (kind: DiscoveryJobKind) => {
    const template_id = getDefaultTemplateForKind(kind);
    setFormData((prev) => ({
      ...prev,
      kind,
      target_config: {},
      exporter_binding: { template_id },
    }));
  };

  const handleFieldChange = (field: keyof DiscoveryJob, value: any) => {
    if (field === 'kind') {
      handleKindChange(value as DiscoveryJobKind);
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTargetConfigChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      target_config: { ...(prev.target_config || {}), [key]: value },
    }));
  };

  const handleExporterBindingChange = (updates: Partial<DiscoveryJobExporterBinding>) => {
    setFormData((prev) => {
      const current = prev.exporter_binding || { template_id: getDefaultTemplateForKind((prev.kind as DiscoveryJobKind) || 'K8s') };
      const nextBinding: DiscoveryJobExporterBinding = { ...current, ...updates };
      if (updates.template_id) {
        delete nextBinding.overrides_yaml;
        delete nextBinding.mib_profile_id;
      }
      return { ...prev, exporter_binding: nextBinding };
    });
  };

  const handleEdgeGatewayToggle = (enabled: boolean) => {
    setFormData((prev) => ({
      ...prev,
      edge_gateway: enabled
        ? { enabled, gateway_id: prev.edge_gateway?.gateway_id || edge_gateways[0]?.id }
        : { enabled },
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      handleTargetConfigChange('kubeconfig', text);
      showToast(`檔案 "${file.name}" 已成功載入。`, 'success');
    };
    reader.onerror = () => {
      showToast('讀取檔案時發生錯誤。', 'error');
    };
    reader.readAsText(file);

    event.target.value = '';
  };

  const triggerFileSelect = () => {
    kubeconfigInputRef.current?.click();
  };

  const handleSave = () => {
    const exporter_binding: DiscoveryJobExporterBinding = formData.exporter_binding || { template_id: getDefaultTemplateForKind((formData.kind as DiscoveryJobKind) || 'K8s') };
    const payload: Partial<DiscoveryJob> = {
      ...formData,
      target_config: formData.target_config || {},
      exporter_binding: exporter_binding,
      edge_gateway: formData.edge_gateway || { enabled: false },
      tags: formData.tags || [],
    };
    onSave(payload);
  };

  const handleTestScan = async () => {
    if (!formData.name || !formData.kind) {
      showToast('請先填寫掃描名稱與類型後再進行測試。', 'error');
      return;
    }

    setIsTesting(true);
    try {
      const payload = {
        job_id: formData.id,
        name: formData.name,
        kind: formData.kind,
        target_config: formData.target_config || {},
        exporter_binding: formData.exporter_binding,
        edge_gateway: formData.edge_gateway,
      };
      const { data } = await api.post<DiscoveryTestResponse>('/resources/discovery-jobs/test', payload);
      const warnings = data.warnings?.length ? ` 注意事項：${data.warnings.join('；')}` : '';
      const countInfo = data.success ? ` 預估可發現 ${data.discovered_count} 個資源。` : '';
      showToast(`${data.message}${countInfo}${warnings}`, data.success ? 'success' : 'error');
    } catch (err: any) {
      const message = err?.response?.data?.message || '測試掃描失敗，請稍後再試。';
      showToast(message, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const renderConfigFields = () => {
    const kind = (formData.kind as DiscoveryJobKind) || 'K8s';
    switch (kind) {
      case 'K8s':
        return (
          <>
            <input
              type="file"
              ref={kubeconfigInputRef}
              className="hidden"
              accept=".yaml,.yml,.kubeconfig,text/plain"
              onChange={handleFileSelect}
            />
            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-300">Kubeconfig</label>
                <button
                  type="button"
                  onClick={triggerFileSelect}
                  className="flex items-center text-xs text-sky-400 hover:text-sky-300 px-2 py-0.5 rounded-md hover:bg-sky-500/20"
                >
                  <Icon name="upload" className="w-3 h-3 mr-1.5" />
                  上傳檔案
                </button>
              </div>
              <textarea
                rows={5}
                value={(formData.target_config as any)?.kubeconfig || ''}
                onChange={(e) => handleTargetConfigChange('kubeconfig', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm font-mono"
                placeholder="在此貼上您的 kubeconfig YAML 或上傳檔案。"
              />
            </div>
          </>
        );
      case 'SNMP':
        return (
          <div className="grid grid-cols-2 gap-4">
            <FormRow label="Community String">
              <input
                type="text"
                value={(formData.target_config as any)?.community || ''}
                onChange={(e) => handleTargetConfigChange('community', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
              />
            </FormRow>
            <FormRow label="IP 範圍">
              <input
                type="text"
                value={(formData.target_config as any)?.ip_range || ''}
                onChange={(e) => handleTargetConfigChange('ipRange', e.target.value)}
                placeholder="例如：10.1.0.0/24"
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
              />
            </FormRow>
          </div>
        );
      case 'Static Range':
        return (
          <FormRow label="IP 範圍">
            <input
              type="text"
              value={(formData.target_config as any)?.ip_range || ''}
              onChange={(e) => handleTargetConfigChange('ipRange', e.target.value)}
              placeholder="例如：192.168.1.1/24"
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
            />
          </FormRow>
        );
      case 'Cloud Provider':
        return (
          <FormRow label="API Key">
            <input
              type="password"
              value={(formData.target_config as any)?.api_key || ''}
              onChange={(e) => handleTargetConfigChange('apiKey', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
            />
          </FormRow>
        );
      default:
        return <div className="text-center text-slate-400 p-4 bg-slate-800/50 rounded-md">此掃描類型無需額外配置。</div>;
    }
  };

  const renderExporterBindingSection = () => {
    const currentTemplateId = formData.exporter_binding?.template_id || 'none';
    const templateMeta = exporter_templates.find((tpl) => tpl.id === currentTemplateId);
    const availableProfiles = mib_profiles.filter((profile) => profile.template_id === currentTemplateId);

    return (
      <div className="space-y-4">
        <FormRow label="Exporter 模板">
          <select
            value={currentTemplateId}
            onChange={(e) => handleExporterBindingChange({ template_id: e.target.value as DiscoveryJobExporterBinding['template_id'] })}
            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
            disabled={isLoadingOptions}
          >
            {isLoadingOptions && <option>載入中...</option>}
            {exporter_templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name}
              </option>
            ))}
          </select>
          {templateMeta?.description && <p className="mt-1 text-xs text-slate-400">{templateMeta.description}</p>}
        </FormRow>
        {templateMeta?.supports_mib_profile && (
          <FormRow label="MIB Profile">
            <select
              value={formData.exporter_binding?.mib_profile_id || ''}
              onChange={(e) => handleExporterBindingChange({ mib_profile_id: e.target.value || undefined })}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
            >
              <option value="">選擇 Profile (可選)</option>
              {availableProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
            {availableProfiles.length === 0 && (
              <p className="mt-1 text-xs text-slate-500">目前沒有可用的 MIB Profile，請至設定頁新增。</p>
            )}
          </FormRow>
        )}
        {templateMeta?.supports_overrides && (
          <FormRow label="自訂覆寫 YAML">
            <textarea
              rows={5}
              value={formData.exporter_binding?.overrides_yaml || ''}
              onChange={(e) => handleExporterBindingChange({ overrides_yaml: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm font-mono"
              placeholder="可自訂 exporter 設定，例如額外的 metric_endpoints。"
            />
          </FormRow>
        )}
      </div>
    );
  };

  const renderEdgeGatewaySection = () => {
    const enabled = formData.edge_gateway?.enabled || false;
    return (
      <div className="space-y-3">
        <FormRow label="邊緣閘道 (Edge Gateway)">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => handleEdgeGatewayToggle(e.target.checked)}
                className="form-checkbox h-4 w-4 rounded border-slate-600 bg-slate-800 text-sky-500"
              />
              <span>在邊緣節點執行掃描</span>
            </label>
            {enabled && (
              <select
                value={formData.edge_gateway?.gateway_id || edge_gateways[0]?.id || ''}
                onChange={(e) => setFormData((prev) => ({
                  ...prev,
                  edge_gateway: { enabled: true, gateway_id: e.target.value },
                }))}
                className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
              >
                {edge_gateways.map((gateway) => (
                  <option key={gateway.id} value={gateway.id}>
                    {gateway.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-400">適用於無法直接連線的封閉網段，可透過 Edge Gateway 進行掃描。</p>
        </FormRow>
      </div>
    );
  };

  return (
    <Modal
      title={job ? '編輯自動掃描任務' : '新增自動掃描任務'}
      isOpen={isOpen}
      onClose={onClose}
      width="w-1/2 max-w-2xl"
      footer={
        <div className="flex justify-between w-full">
          <button
            onClick={handleTestScan}
            disabled={isTesting}
            className="flex items-center text-sm px-4 py-2 rounded-md transition-colors text-white bg-slate-600 hover:bg-slate-500 disabled:opacity-50"
          >
            {isTesting ? <Icon name="loader-circle" className="w-4 h-4 mr-2 animate-spin" /> : <Icon name="scan-search" className="w-4 h-4 mr-2" />}
            {isTesting ? '測試中...' : '測試掃描'}
          </button>
          <div className="flex space-x-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">取消</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">儲存</button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-2 -mr-4">
        <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/20 space-y-4">
          <h3 className="text-lg font-semibold text-white">1. 基本資訊</h3>
          <FormRow label="名稱 *">
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
            />
          </FormRow>
          <div className="grid grid-cols-2 gap-4">
            <FormRow label="掃描類型">
              <select
                value={(formData.kind as DiscoveryJobKind) || ''}
                onChange={(e) => handleFieldChange('kind', e.target.value as DiscoveryJobKind)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
                disabled={isLoadingOptions}
              >
                {isLoadingOptions && <option>載入中...</option>}
                {(autoDiscoveryOptions?.job_kinds || ['K8s', 'SNMP']).map((kind) => (
                  <option key={kind} value={kind}>
                    {kind}
                  </option>
                ))}
              </select>
            </FormRow>
            <FormRow label="掃描排程 (Cron)">
              <input
                type="text"
                value={formData.schedule || ''}
                onChange={(e) => handleFieldChange('schedule', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm font-mono"
              />
            </FormRow>
          </div>
        </div>

        <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/20 space-y-4">
          <h3 className="text-lg font-semibold text-white">2. 目標配置</h3>
          <p className="text-sm text-slate-400 -mt-2">專注於 <strong>如何找到資源</strong>，填寫掃描所需的連線參數。</p>
          {renderConfigFields()}
        </div>

        <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/20 space-y-4">
          <h3 className="text-lg font-semibold text-white">3. Exporter 綁定</h3>
          <p className="text-sm text-slate-400 -mt-2">決定 <strong>如何持續監控</strong> 匯入的資源，系統會依掃描類型提供建議模板。</p>
          {renderExporterBindingSection()}
        </div>

        <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/20 space-y-4">
          <h3 className="text-lg font-semibold text-white">4. 邊緣掃描</h3>
          {renderEdgeGatewaySection()}
        </div>

        <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/20 space-y-4">
          <h3 className="text-lg font-semibold text-white">5. 標籤與分類 (Metadata)</h3>
          <FormRow label="標籤 (Tags)">
            <KeyValueInput values={formData.tags || []} onChange={(tags) => handleFieldChange('tags', tags)} />
          </FormRow>
        </div>
      </div>
    </Modal>
  );
};

export default AutoDiscoveryEditModal;
