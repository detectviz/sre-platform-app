import React, { useState, useEffect, useRef } from 'react';
import Modal from '@/shared/components/Modal';
import FormRow from '@/shared/components/FormRow';
import Icon from '@/shared/components/Icon';
import KeyValueInput from '@/shared/components/KeyValueInput';
import { DiscoveryJob, DiscoveryJobKind, DiscoveryJobExporterBinding, DiscoveryTestResponse } from '@/shared/types';
import { showToast } from '@/services/toast';
import { useOptions } from '@/contexts/OptionsContext';
import api from '@/services/api';

interface AutoDiscoveryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: Partial<DiscoveryJob>) => void;
  job: DiscoveryJob | null;
}

const getDefaultTemplateForKind = (kind: DiscoveryJobKind): DiscoveryJobExporterBinding['template_id'] => {
  switch (kind) {
    case 'snmp':
      return 'snmp_exporter';
    case 'custom_script':
      return 'none';
    case 'k8s':
    case 'cloud_provider':
    case 'static_range':
    default:
      return 'node_exporter';
  }
};

const AutoDiscoveryEditModal: React.FC<AutoDiscoveryEditModalProps> = ({ isOpen, onClose, onSave, job }) => {
  const [formData, setFormData] = useState<Partial<DiscoveryJob>>({});
  const [isTesting, setIsTesting] = useState(false);
  const kubeconfigInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { options, isLoading: isLoadingOptions } = useOptions();
  const autoDiscoveryOptions = options?.auto_discovery;
  const exporter_templates = autoDiscoveryOptions?.exporter_templates || [];
  const mib_profiles = autoDiscoveryOptions?.mib_profiles || [];
  const edge_gateways = autoDiscoveryOptions?.edge_gateways || [];

  const sectionDefinitions = [
    { id: 'discovery-basic', title: '基本資訊', description: '設定任務名稱、掃描類型與排程週期。' },
    { id: 'discovery-target', title: '目標配置', description: '填寫要掃描的網域、憑證或區段參數。' },
    { id: 'discovery-exporter', title: 'Exporter 綁定', description: '選擇監控模板與必要的 MIB/Profile。' },
    { id: 'discovery-edge', title: '邊緣掃描', description: '決定是否透過 Edge Gateway 執行任務。' },
    { id: 'discovery-tags', title: '標籤與分類', description: '為匯入資源預先套用標籤。' },
  ] as const;

  const registerSectionRef = (id: string) => (node: HTMLDivElement | null) => {
    sectionRefs.current[id] = node;
  };

  const handleSectionScroll = (id: string) => {
    const container = scrollContainerRef.current;
    const target = sectionRefs.current[id];
    if (container && target) {
      container.scrollTo({ top: target.offsetTop - 16, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isOpen && autoDiscoveryOptions) {
      const defaultKind = (job?.kind as DiscoveryJobKind) || autoDiscoveryOptions.job_kinds[0]?.value || 'k8s';
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
      const current = prev.exporter_binding || { template_id: getDefaultTemplateForKind((prev.kind as DiscoveryJobKind) || 'k8s') };
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
    const exporter_binding: DiscoveryJobExporterBinding = formData.exporter_binding || { template_id: getDefaultTemplateForKind((formData.kind as DiscoveryJobKind) || 'k8s') };
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
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
              <p className="text-xs text-slate-400">支援直接貼上或上傳 kubeconfig，請確認檔案包含 <code className="rounded bg-slate-900/60 px-1 py-0.5">clusters</code>、<code className="rounded bg-slate-900/60 px-1 py-0.5">users</code> 與 <code className="rounded bg-slate-900/60 px-1 py-0.5">contexts</code> 欄位。</p>
              <textarea
                rows={5}
                value={(formData.target_config as any)?.kubeconfig || ''}
                onChange={(e) => handleTargetConfigChange('kubeconfig', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm font-mono"
                placeholder="在此貼上您的 kubeconfig YAML 或上傳檔案。"
              />
              <pre className="overflow-x-auto rounded-md border border-slate-700/70 bg-slate-900/40 p-3 text-[11px] leading-5 text-slate-300">
apiVersion: v1
clusters:
  - cluster:
      server: https://your-api-server
    name: sre-platform
users:
  - name: sre-bot
contexts:
  - context:
      cluster: sre-platform
      user: sre-bot
    name: sre-default
current-context: sre-default
              </pre>
            </div>
          </>
        );
      case 'snmp':
        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormRow label="Community String">
              <input
                type="text"
                value={(formData.target_config as any)?.community || ''}
                onChange={(e) => handleTargetConfigChange('community', e.target.value)}
                placeholder="例如：public"
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
            <p className="sm:col-span-2 text-xs text-slate-400">可輸入多個子網，以逗號分隔；如需限制 Port 範圍，可於 Exporter 覆寫中補充。</p>
          </div>
        );
      case 'static_range':
        return (
          <FormRow label="IP 範圍">
            <input
              type="text"
              value={(formData.target_config as any)?.ip_range || ''}
              onChange={(e) => handleTargetConfigChange('ipRange', e.target.value)}
              placeholder="例如：192.168.1.1/24"
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-slate-400">若需排除特定主機，可於匯入後使用標籤或忽略功能處理。</p>
          </FormRow>
        );
      case 'cloud_provider':
        return (
          <FormRow label="API Key">
            <input
              type="password"
              value={(formData.target_config as any)?.api_key || ''}
              onChange={(e) => handleTargetConfigChange('apiKey', e.target.value)}
              placeholder="請貼上雲端供應商提供的 API Key"
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-slate-400">建議使用具有唯讀權限的 API 金鑰，以維持最小權限原則。</p>
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
      width="w-3/4 max-w-4xl"
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
      <div className="md:grid md:grid-cols-[220px,1fr] gap-6">
        <nav className="hidden md:block" aria-label="自動掃描設定步驟">
          <ol className="sticky top-0 space-y-3 rounded-xl border border-slate-700/60 bg-slate-900/40 p-4">
            {sectionDefinitions.map((section, index) => (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => handleSectionScroll(section.id)}
                  className="w-full rounded-lg border border-transparent px-3 py-2 text-left transition-colors hover:border-sky-600/60 hover:bg-sky-900/30"
                  aria-controls={section.id}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-900/60 text-xs font-semibold text-sky-200">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{section.title}</p>
                      <p className="mt-1 text-xs text-slate-400">{section.description}</p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div ref={scrollContainerRef} className="space-y-6 max-h-[65vh] overflow-y-auto pr-2 md:pr-4">
          <section
            id="discovery-basic"
            ref={registerSectionRef('discovery-basic')}
            className="space-y-4 rounded-lg border border-slate-700 bg-slate-800/20 p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-white">1. 基本資訊</h3>
              <span className="rounded-full bg-rose-900/40 px-3 py-1 text-xs font-semibold text-rose-200">必填</span>
            </div>
            <p className="text-sm text-slate-400">為任務命名並確認掃描週期，建議使用描述性的名稱（例如「K8s 集群每小時掃描」）。</p>
            <FormRow label="名稱 *">
              <input
                type="text"
                value={formData.name || ''}
                placeholder="例如：K8s 集群節點掃描"
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
              />
            </FormRow>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormRow label="掃描類型">
                <select
                  value={(formData.kind as DiscoveryJobKind) || ''}
                  onChange={(e) => handleFieldChange('kind', e.target.value as DiscoveryJobKind)}
                  className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
                  disabled={isLoadingOptions}
                >
                  {isLoadingOptions && <option>載入中...</option>}
                  {(autoDiscoveryOptions?.job_kinds || []).map((kind) => (
                    <option key={kind.value} value={kind.value}>
                      {kind.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-400">系統會依照掃描類型套用預設匯出模板，可於下方調整。</p>
              </FormRow>
              <FormRow label="掃描排程 (Cron)">
                <input
                  type="text"
                  value={formData.schedule || ''}
                  placeholder="0 2 * * *"
                  onChange={(e) => handleFieldChange('schedule', e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-mono"
                  aria-describedby="discovery-cron-help"
                />
                <p id="discovery-cron-help" className="mt-1 text-xs text-slate-400">
                  請輸入標準 5 欄位 Cron 表達式，例如 <code className="rounded bg-slate-900/60 px-1.5 py-0.5">0 * * * *</code>（每小時）或
                  <code className="ml-1 rounded bg-slate-900/60 px-1.5 py-0.5">30 3 * * 1</code>（每週一 03:30）。
                </p>
              </FormRow>
            </div>
          </section>

          <section
            id="discovery-target"
            ref={registerSectionRef('discovery-target')}
            className="space-y-4 rounded-lg border border-slate-700 bg-slate-800/20 p-4"
          >
            <h3 className="text-lg font-semibold text-white">2. 目標配置</h3>
            <p className="text-sm text-slate-400">請提供掃描所需的目標資訊，不同掃描類型會要求不同欄位。</p>
            {renderConfigFields()}
          </section>

          <section
            id="discovery-exporter"
            ref={registerSectionRef('discovery-exporter')}
            className="space-y-4 rounded-lg border border-slate-700 bg-slate-800/20 p-4"
          >
            <h3 className="text-lg font-semibold text-white">3. Exporter 綁定</h3>
            <p className="text-sm text-slate-400">選擇指派給新資源的監控模板，必要時可覆寫 MIB 或 YAML 設定。</p>
            <div className="space-y-4 rounded-lg border border-dashed border-slate-700/70 bg-slate-900/20 p-4">
              {renderExporterBindingSection()}
            </div>
          </section>

          <section
            id="discovery-edge"
            ref={registerSectionRef('discovery-edge')}
            className="space-y-4 rounded-lg border border-slate-700 bg-slate-800/20 p-4"
          >
            <h3 className="text-lg font-semibold text-white">4. 邊緣掃描</h3>
            <p className="text-sm text-slate-400">若目標網段無法直接連線，可啟用 Edge Gateway 由近端節點執行掃描。</p>
            {renderEdgeGatewaySection()}
          </section>

          <section
            id="discovery-tags"
            ref={registerSectionRef('discovery-tags')}
            className="space-y-4 rounded-lg border border-slate-700 bg-slate-800/20 p-4"
          >
            <h3 className="text-lg font-semibold text-white">5. 標籤與分類 (Metadata)</h3>
            <p className="text-sm text-slate-400">新增的資源會自動帶入這些標籤，協助後續篩選與自動化規則。</p>
            <FormRow label="標籤 (Tags)">
              <KeyValueInput
                values={formData.tags || []}
                onChange={(tags) => handleFieldChange('tags', tags)}
                keyPlaceholder="選擇標籤鍵"
                valuePlaceholder="輸入或選擇對應值"
                addLabel="新增標籤條目"
              />
            </FormRow>
          </section>
        </div>
      </div>
    </Modal>
  );
};

export default AutoDiscoveryEditModal;
