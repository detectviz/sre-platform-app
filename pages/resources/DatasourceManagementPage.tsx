import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  ConnectionStatus,
  Datasource,
  DatasourceFilters,
  DatasourceTestResponse,
} from '../../types';
import Icon from '../../components/Icon';
import Toolbar, { ToolbarButton } from '../../components/Toolbar';
import TableContainer from '../../components/TableContainer';
import Modal from '../../components/Modal';
import api from '../../services/api';
import TableLoader from '../../components/TableLoader';
import TableError from '../../components/TableError';
import { showToast } from '../../services/toast';
import DatasourceEditModal from '../../components/DatasourceEditModal';
import { useOptions } from '../../contexts/OptionsContext';
import StatusTag from '../../components/StatusTag';
import IconButton from '../../components/IconButton';
import SearchableSelect from '../../components/SearchableSelect';
import { DATASOURCE_STATUS_META } from '../../utils/datasource';

const STATUS_FILTERS: Array<{ value: ConnectionStatus | undefined; label: string; icon: string }> = [
  { value: undefined, label: '全部狀態', icon: 'sparkles' },
  { value: 'ok', label: DATASOURCE_STATUS_META.ok.label, icon: DATASOURCE_STATUS_META.ok.icon },
  { value: 'pending', label: DATASOURCE_STATUS_META.pending.label, icon: DATASOURCE_STATUS_META.pending.icon },
  { value: 'error', label: DATASOURCE_STATUS_META.error.label, icon: DATASOURCE_STATUS_META.error.icon },
];

const formatDateTime = (value?: string) =>
  value ? dayjs(value).format('YYYY/MM/DD HH:mm') : '—';

const DatasourceManagementPage: React.FC = () => {
  const [datasources, setDatasources] = useState<Datasource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DatasourceFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDatasource, setEditingDatasource] = useState<Datasource | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingDatasource, setDeletingDatasource] = useState<Datasource | null>(null);
  const [testingDatasourceId, setTestingDatasourceId] = useState<string | null>(null);

  const { options } = useOptions();
  const datasourceOptions = options?.datasources;

  const typeLookup = useMemo(() => {
    const map = new Map<string, { label: string; className?: string }>();
    datasourceOptions?.types.forEach(descriptor => {
      map.set(descriptor.value, { label: descriptor.label, className: descriptor.class_name });
    });
    return map;
  }, [datasourceOptions?.types]);

  const authMethodLookup = useMemo(() => {
    const map = new Map<string, string>();
    datasourceOptions?.auth_methods.forEach(method => {
      map.set(method.value, method.label);
    });
    return map;
  }, [datasourceOptions?.auth_methods]);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setFilters(prev => {
        const normalized = searchTerm.trim() === '' ? undefined : searchTerm.trim();
        if (prev.keyword === normalized || (!prev.keyword && normalized === undefined)) {
          return prev;
        }
        return { ...prev, keyword: normalized };
      });
    }, 300);

    return () => window.clearTimeout(handler);
  }, [searchTerm]);

  const fetchDatasources = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ items: Datasource[]; total: number }>('/resources/datasources', { params: filters });
      setDatasources(data.items);
    } catch (err) {
      console.error(err);
      setError('無法取得資料來源列表。');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDatasources();
  }, [fetchDatasources]);

  const handleTypeFilterChange = (value: string) => {
    setFilters(prev => {
      if (!value) {
        if (!prev.type) return prev;
        const next = { ...prev };
        delete next.type;
        return next;
      }
      if (prev.type === value) return prev;
      return { ...prev, type: value as Datasource['type'] };
    });
  };

  const resetTypeFilter = () => {
    setFilters(prev => {
      if (!prev.type) return prev;
      const next = { ...prev };
      delete next.type;
      return next;
    });
  };

  const handleStatusFilterChange = (value: ConnectionStatus | undefined) => {
    setFilters(prev => {
      if (!value) {
        if (!prev.status) return prev;
        const next = { ...prev };
        delete next.status;
        return next;
      }
      if (prev.status === value) return prev;
      return { ...prev, status: value };
    });
  };

  const handleNew = () => {
    setEditingDatasource(null);
    setIsEditModalOpen(true);
  };

  const handleEdit = (ds: Datasource) => {
    setEditingDatasource(ds);
    setIsEditModalOpen(true);
  };

  const handleDelete = (ds: Datasource) => {
    setDeletingDatasource(ds);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDatasource) return;
    try {
      await api.del(`/resources/datasources/${deletingDatasource.id}`);
      showToast(`已刪除資料來源「${deletingDatasource.name}」。`, 'success');
      fetchDatasources();
    } catch (err) {
      console.error(err);
      showToast('刪除資料來源失敗，請稍後再試。', 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingDatasource(null);
    }
  };

  const handleSave = async (payload: Partial<Datasource>) => {
    try {
      if (payload.id) {
        await api.patch(`/resources/datasources/${payload.id}`, payload);
        showToast('資料來源已更新。', 'success');
      } else {
        await api.post('/resources/datasources', payload);
        showToast('資料來源已建立。', 'success');
      }
      fetchDatasources();
    } catch (err) {
      console.error(err);
      showToast('儲存資料來源失敗。', 'error');
    } finally {
      setIsEditModalOpen(false);
    }
  };

  const handleTestConnection = async (ds: Datasource) => {
    setTestingDatasourceId(ds.id);
    showToast(`已送出「${ds.name}」的連線測試。`, 'warning');
    try {
      const { data } = await api.post<DatasourceTestResponse>(`/resources/datasources/${ds.id}/test`);
      const latencyText = typeof data.latency_ms === 'number' ? `（延遲 ${Math.round(data.latency_ms)} ms）` : '';
      showToast(`${data.message}${latencyText}`, data.success ? 'success' : 'error');
      fetchDatasources();
    } catch (err) {
      console.error(err);
      showToast('連線測試失敗，請稍後再試。', 'error');
    } finally {
      setTestingDatasourceId(null);
    }
  };

  const hasNoData = !isLoading && !error && datasources.length === 0;

  return (
    <div className="flex h-full flex-col space-y-4">
      <Toolbar
        leftActions={(
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-400">快速搜尋</span>
              <div className="flex w-64 items-center gap-2 rounded-lg border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20">
                <Icon name="search" className="h-4 w-4 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={event => setSearchTerm(event.target.value)}
                  placeholder="輸入名稱、URL 或標籤"
                  className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                  aria-label="搜尋資料來源"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="text-slate-400 transition hover:text-white"
                    aria-label="清除搜尋條件"
                  >
                    <Icon name="x" className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                <span>資料來源類型</span>
                {filters.type && (
                  <button
                    type="button"
                    onClick={resetTypeFilter}
                    className="text-[11px] text-sky-300 transition hover:text-sky-200"
                  >
                    清除
                  </button>
                )}
              </div>
              <div className="w-48">
                <SearchableSelect
                  value={filters.type || ''}
                  onChange={handleTypeFilterChange}
                  options={(datasourceOptions?.types || []).map(option => ({ value: option.value, label: option.label }))}
                  placeholder="輸入關鍵字搜尋類型"
                  emptyMessage="沒有符合的資料來源類型"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-400">連線狀態</span>
              <div className="flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/60 px-1.5 py-1">
                {STATUS_FILTERS.map(option => {
                  const isActive = option.value ? filters.status === option.value : !filters.status;
                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => handleStatusFilterChange(option.value)}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 ${
                        isActive ? 'bg-sky-600/20 text-sky-200' : 'text-slate-300 hover:text-white'
                      }`}
                      aria-pressed={isActive}
                    >
                      <Icon name={option.icon} className="h-3.5 w-3.5" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        rightActions={(
          <div className="flex items-center gap-2">
            <IconButton icon="refresh-cw" label="重新整理" tooltip="重新整理列表" onClick={fetchDatasources} isLoading={isLoading} />
            <ToolbarButton icon="plus" text="新增資料來源" primary onClick={handleNew} />
          </div>
        )}
      />

      <TableContainer>
        <div className="h-full overflow-x-auto">
          <table className="w-full table-fixed text-left text-sm text-slate-200">
            <thead className="sticky top-0 z-10 bg-slate-900/70 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-3 font-semibold">名稱與標籤</th>
                <th className="px-6 py-3 font-semibold">類型 / 驗證</th>
                <th className="px-6 py-3 font-semibold">連線狀態</th>
                <th className="px-6 py-3 font-semibold">建立 / 更新時間</th>
                <th className="px-6 py-3 text-center font-semibold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <TableLoader colSpan={5} />
              ) : error ? (
                <TableError colSpan={5} message={error} onRetry={fetchDatasources} />
              ) : hasNoData ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                    <div className="mx-auto flex max-w-md flex-col items-center gap-3">
                      <Icon name="database" className="h-10 w-10 text-slate-500" />
                      <p className="text-base font-semibold text-slate-200">尚未建立任何資料來源</p>
                      <p className="text-sm text-slate-400">點擊右上角「新增資料來源」開始連結 Prometheus、Grafana 或其他監控來源。</p>
                    </div>
                  </td>
                </tr>
              ) : (
                datasources.map(ds => {
                  const typeMeta = typeLookup.get(ds.type);
                  const authLabel = authMethodLookup.get(ds.auth_method) || ds.auth_method;
                  const statusMeta = DATASOURCE_STATUS_META[ds.status];
                  return (
                    <tr key={ds.id} className="hover:bg-slate-800/40">
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-semibold text-white">{ds.name}</span>
                            <IconButton
                              icon="copy"
                              label={`複製 ${ds.name} URL`}
                              tooltip="複製 URL"
                              onClick={() => {
                                if (typeof navigator !== 'undefined' && navigator?.clipboard?.writeText) {
                                  navigator.clipboard
                                    .writeText(ds.url)
                                    .then(() => {
                                      showToast('已複製連線 URL。', 'success');
                                    })
                                    .catch(() => {
                                      showToast('複製失敗，請手動選取。', 'error');
                                    });
                                } else {
                                  showToast('瀏覽器不支援快速複製，請手動選取 URL。', 'warning');
                                }
                              }}
                              tone="primary"
                            />
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Icon name="link" className="h-3.5 w-3.5" />
                            <span className="truncate" title={ds.url}>{ds.url}</span>
                          </div>
                          {ds.tags && ds.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {ds.tags.map(tag => (
                                <span
                                  key={tag.id}
                                  className="rounded-full bg-slate-800/80 px-2 py-1 text-[11px] font-medium text-slate-200"
                                >
                                  {tag.key} = {tag.value}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">尚未設定標籤</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-col gap-2">
                          <StatusTag
                            label={typeMeta?.label || ds.type}
                            className={typeMeta?.className}
                            dense
                            tooltip="資料來源類型"
                          />
                          <span className="text-xs text-slate-400">驗證方式：{authLabel}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-col gap-2">
                          <StatusTag
                            label={statusMeta.label}
                            tone={statusMeta.tone}
                            icon={statusMeta.icon}
                            dense
                            tooltip={statusMeta.description}
                          />
                          <span className="text-xs text-slate-500">最近測試結果會即時反映於此。</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top text-xs text-slate-300">
                        <div className="flex flex-col gap-1.5">
                          <span title={ds.created_at}>建立：{formatDateTime(ds.created_at)}</span>
                          <span title={ds.updated_at}>更新：{formatDateTime(ds.updated_at)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center justify-center gap-2">
                          <IconButton
                            icon="plug-zap"
                            label={`測試 ${ds.name} 連線`}
                            tooltip="測試連線"
                            onClick={() => handleTestConnection(ds)}
                            tone="primary"
                            isLoading={testingDatasourceId === ds.id}
                          />
                          <IconButton
                            icon="edit-3"
                            label={`編輯 ${ds.name}`}
                            tooltip="編輯"
                            onClick={() => handleEdit(ds)}
                          />
                          <IconButton
                            icon="trash-2"
                            label={`刪除 ${ds.name}`}
                            tooltip="刪除"
                            onClick={() => handleDelete(ds)}
                            tone="danger"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </TableContainer>

      {isEditModalOpen && (
        <DatasourceEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSave}
          datasource={editingDatasource}
        />
      )}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="刪除資料來源"
        width="w-[420px]"
        footer={(
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="rounded-lg border border-slate-600/70 bg-slate-800/60 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700/60"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500"
            >
              確認刪除
            </button>
          </div>
        )}
      >
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-rose-500/20 p-2 text-rose-300">
            <Icon name="alert-triangle" className="h-5 w-5" />
          </div>
          <div className="space-y-2 text-sm leading-relaxed text-slate-200">
            <p>
              確定要刪除資料來源
              <span className="mx-1 font-semibold text-rose-200">{deletingDatasource?.name}</span>
              嗎？此動作將移除與其相關的連線設定與測試紀錄。
            </p>
            <p className="text-xs text-slate-400">刪除後無法還原，若需暫停請使用停用功能。</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DatasourceManagementPage;

