import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import Modal from './Modal';
import FormRow from './FormRow';
import Icon from './Icon';
import KeyValueInput from './KeyValueInput';
import { Datasource, DatasourceTestResponse } from '../types';
import { showToast } from '../services/toast';
import { useOptions } from '../contexts/OptionsContext';
import api from '../services/api';
import StatusTag from './StatusTag';
import SearchableSelect from './SearchableSelect';
import { DATASOURCE_STATUS_META } from '../utils/datasource';

interface DatasourceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (datasource: Partial<Datasource>) => void;
  datasource: Datasource | null;
}

const formatDateTime = (value?: string) =>
  value ? dayjs(value).format('YYYY/MM/DD HH:mm') : '—';

const DatasourceEditModal: React.FC<DatasourceEditModalProps> = ({ isOpen, onClose, onSave, datasource }) => {
  const [formData, setFormData] = useState<Partial<Datasource>>({});
  const [isTesting, setIsTesting] = useState(false);

  const { options, isLoading: isLoadingOptions } = useOptions();
  const datasourceOptions = options?.datasources;

  const typeOptions = useMemo(
    () => (datasourceOptions?.types || []).map(option => ({ value: option.value, label: option.label })),
    [datasourceOptions?.types],
  );

  const authMethodOptions = useMemo(
    () => (datasourceOptions?.auth_methods || []).map(method => ({ value: method.value, label: method.label })),
    [datasourceOptions?.auth_methods],
  );

  useEffect(() => {
    if (!isOpen) return;
    if (!datasourceOptions) {
      setFormData(datasource || {});
      return;
    }

    setFormData(
      datasource || {
        name: '',
        type: datasourceOptions.types[0]?.value || 'prometheus',
        url: '',
        auth_method: datasourceOptions.auth_methods[0]?.value || 'none',
        tags: [],
      },
    );
  }, [isOpen, datasource, datasourceOptions]);

  const handleChange = (field: keyof Datasource, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const trimmedName = formData.name?.trim();
    const trimmedUrl = formData.url?.trim();
    if (!trimmedName || !trimmedUrl) {
      showToast('請填寫必填欄位（名稱與 URL）。', 'error');
      return;
    }
    onSave({ ...formData, name: trimmedName, url: trimmedUrl });
  };

  const handleTestConnection = async () => {
    if (!formData.url || !formData.url.trim()) {
      showToast('請先填寫連線 URL 後再進行測試。', 'error');
      return;
    }

    setIsTesting(true);
    try {
      const payload = {
        id: formData.id,
        name: formData.name,
        type: formData.type,
        url: formData.url,
        auth_method: formData.auth_method || datasourceOptions?.auth_methods[0]?.value || 'none',
        tags: Array.isArray(formData.tags) ? formData.tags : [],
      };
      const { data } = await api.post<DatasourceTestResponse>('/resources/datasources/test', payload);
      if (formData.id) {
        setFormData(prev => ({ ...prev, status: data.status }));
      }
      const latencyText = typeof data.latency_ms === 'number' ? `（延遲約 ${Math.round(data.latency_ms)} 毫秒）` : '';
      showToast(`${data.message}${latencyText}`, data.success ? 'success' : 'error');
    } catch (err: any) {
      const message = err?.response?.data?.message || '連線測試失敗，請稍後再試。';
      showToast(message, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const statusMeta = datasource ? DATASOURCE_STATUS_META[datasource.status] : null;

  return (
    <Modal
      title={datasource ? '編輯資料來源' : '新增資料來源'}
      isOpen={isOpen}
      onClose={onClose}
      width="w-full max-w-3xl"
      footer={(
        <div className="flex w-full items-center justify-between">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="inline-flex items-center gap-2 rounded-lg border border-sky-600/60 bg-sky-600/10 px-4 py-2 text-sm font-medium text-sky-100 transition-colors hover:bg-sky-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isTesting ? (
              <Icon name="loader-circle" className="h-4 w-4 animate-spin" />
            ) : (
              <Icon name="plug-zap" className="h-4 w-4" />
            )}
            {isTesting ? '測試中…' : '測試連線'}
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-600/70 bg-slate-800/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700/60"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500"
            >
              儲存
            </button>
          </div>
        </div>
      )}
    >
      <div className="space-y-6">
        {datasource && statusMeta && (
          <div className="flex items-center justify-between rounded-lg border border-slate-700/80 bg-slate-900/60 px-4 py-3">
            <div className="space-y-1">
              <span className="text-xs text-slate-400">目前連線狀態</span>
              <StatusTag label={statusMeta.label} tone={statusMeta.tone} icon={statusMeta.icon} dense tooltip={statusMeta.description} />
            </div>
            <div className="text-xs text-slate-500">
              最近更新：{formatDateTime(datasource.updated_at || datasource.created_at)}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormRow
            label="名稱 *"
            description="此名稱將顯示在所有列表與圖表中，建議包含用途或環境描述。"
          >
            <input
              type="text"
              value={formData.name || ''}
              onChange={event => handleChange('name', event.target.value)}
              className="w-full rounded-lg border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              placeholder="例如：Prometheus - 叢集 A"
            />
          </FormRow>
          <FormRow
            label="資料來源類型"
            description="選擇對應的資料來源種類，將自動套用預設格式與驗證提示。"
          >
            <SearchableSelect
              value={formData.type || ''}
              onChange={value => handleChange('type', value)}
              options={typeOptions}
              placeholder="輸入關鍵字搜尋類型"
              disabled={isLoadingOptions}
            />
          </FormRow>
          <FormRow
            label="驗證方式"
            description="依據資料來源的安全需求選擇對應的驗證方式，設定後可於下方標籤補充憑證資訊。"
          >
            <SearchableSelect
              value={formData.auth_method || ''}
              onChange={value => handleChange('auth_method', value)}
              options={authMethodOptions}
              placeholder="搜尋或輸入驗證方式"
              disabled={isLoadingOptions}
            />
          </FormRow>
          <FormRow
            label="URL / Endpoint *"
            description="請填寫完整的 HTTP(S) 或 gRPC 連線位址，例如：https://prometheus.example.com。"
          >
            <input
              type="text"
              value={formData.url || ''}
              onChange={event => handleChange('url', event.target.value)}
              className="w-full rounded-lg border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              placeholder="https://"
            />
          </FormRow>
        </div>

        <FormRow
          label="標籤"
          description="使用標籤記錄用途、環境或憑證資訊，支援多選值並可同步至資源總覽。"
        >
          <div className="rounded-lg border border-slate-700/70 bg-slate-900/40 p-3">
            <KeyValueInput
              values={formData.tags || []}
              onChange={tags => handleChange('tags', tags)}
              keyPlaceholder="標籤鍵（如 env）"
              valuePlaceholder="標籤值（可多選）"
              addLabel="新增標籤"
            />
          </div>
        </FormRow>

        <div className="rounded-lg border border-slate-700/70 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
          <div className="flex items-start gap-2">
            <Icon name="info" className="mt-0.5 h-4 w-4 text-sky-300" />
            <p className="leading-relaxed">
              儲存後即可在資料來源列表中觸發連線測試。若使用 Token 或 Basic 認證，請記得於標籤補充憑證識別以利追蹤。
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DatasourceEditModal;

