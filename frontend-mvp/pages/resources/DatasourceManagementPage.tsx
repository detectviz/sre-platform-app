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
import Pagination from '../../components/Pagination';
import api from '../../services/api';
import TableLoader from '../../components/TableLoader';
import TableError from '../../components/TableError';
import { showToast } from '../../services/toast';
import DatasourceEditModal from '../../components/DatasourceEditModal';
import { useOptions } from '../../contexts/OptionsContext';
import StatusTag from '../../components/StatusTag';
import IconButton from '../../components/IconButton';
import SearchableSelect from '../../components/SearchableSelect';
import QuickFilterBar, { type QuickFilterOption } from '../../components/QuickFilterBar';
import FormRow from '../../components/FormRow';
import SearchInput from '../../components/SearchInput';
import UnifiedSearchModal from '../../components/UnifiedSearchModal';
import { DATASOURCE_STATUS_META } from '../../utils/datasource';
import SortableHeader from '../../components/SortableHeader';
import useTableSorting from '../../hooks/useTableSorting';

const formatDateTime = (value?: string) =>
  value ? dayjs(value).format('YYYY/MM/DD HH:mm') : '—';

const DatasourceManagementPage: React.FC = () => {
  const [datasources, setDatasources] = useState<Datasource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<DatasourceFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDatasource, setEditingDatasource] = useState<Datasource | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingDatasource, setDeletingDatasource] = useState<Datasource | null>(null);
  const [testingDatasourceId, setTestingDatasourceId] = useState<string | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const { options } = useOptions();
  const datasourceOptions = options?.datasources;

  const updateFilters = useCallback(
    (updater: (prev: DatasourceFilters) => DatasourceFilters) => {
      setFilters(prev => {
        const next = updater(prev);
        if (next !== prev) {
          setCurrentPage(1);
        }
        return next;
      });
    },
    [setCurrentPage],
  );

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

  const statusFilterOptions = useMemo<QuickFilterOption[]>(
    () => [
      {
        value: 'all',
        label: '全部狀態',
        icon: <Icon name="sparkles" className="h-3.5 w-3.5 text-slate-300" aria-hidden />,
      },
      ...(['ok', 'pending', 'error'] as ConnectionStatus[]).map(status => {
        const meta = DATASOURCE_STATUS_META[status];
        return {
          value: status,
          label: meta.label,
          icon: <Icon name={meta.icon} className="h-3.5 w-3.5" aria-hidden />,
          tooltip: meta.description,
        } satisfies QuickFilterOption;
      }),
    ],
    [],
  );

  const appliedFilters = useMemo(() => {
    const items: Array<{ key: string; label: string }> = [];
    if (filters.keyword) {
      items.push({ key: 'keyword', label: `關鍵字：${filters.keyword}` });
    }
    if (filters.type) {
      const label = typeLookup.get(filters.type)?.label ?? filters.type;
      items.push({ key: 'type', label: `類型：${label}` });
    }
    if (filters.status) {
      const meta = DATASOURCE_STATUS_META[filters.status];
      items.push({ key: 'status', label: `狀態：${meta.label}` });
    }
    return items;
  }, [filters, typeLookup]);

  const hasAppliedFilters = appliedFilters.length > 0;

  const statusFilterValue = filters.status ? [filters.status] : ['all'];

  const { sortConfig, sortParams, handleSort } = useTableSorting({ defaultSortKey: 'updated_at', defaultSortDirection: 'desc' });

  useEffect(() => {
    const handler = window.setTimeout(() => {
      const normalizedTerm = searchTerm.trim();
      const keyword = normalizedTerm === '' ? undefined : normalizedTerm;
      updateFilters(prev => {
        if (!keyword) {
          if (!prev.keyword) return prev;
          const next = { ...prev };
          delete next.keyword;
          return next;
        }
        if (prev.keyword === keyword) {
          return prev;
        }
        return { ...prev, keyword };
      });
    }, 300);

    return () => window.clearTimeout(handler);
  }, [searchTerm, updateFilters]);

  const fetchDatasources = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        page_size: pageSize,
        ...filters,
        ...sortParams,
      };

      const { data } = await api.get<{ items: Datasource[]; total: number }>('/resources/datasources', { params });
      setDatasources(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
      setError('無法取得資料來源列表。');
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage, pageSize, sortParams]);

  useEffect(() => {
    fetchDatasources();
  }, [fetchDatasources]);

  const handleTypeFilterChange = (value: string) => {
    updateFilters(prev => {
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

  const handleStatusFilterChange = (values: string[]) => {
    const selected = values[0];
    updateFilters(prev => {
      if (!selected || selected === 'all') {
        if (!prev.status) return prev;
        const next = { ...prev };
        delete next.status;
        return next;
      }
      if (prev.status === selected) return prev;
      return { ...prev, status: selected as ConnectionStatus };
    });
  };

  const handleUnifiedSearch = (newFilters: any) => {
    // 將統一搜尋的篩選條件轉換為資料源篩選格式
    const datasourceFilters: DatasourceFilters = {};

    if (newFilters.keyword) {
      datasourceFilters.keyword = newFilters.keyword;
      setSearchTerm(newFilters.keyword);
    }

    if (newFilters.type) {
      datasourceFilters.type = newFilters.type;
    }

    if (newFilters.status && newFilters.status !== 'all') {
      datasourceFilters.status = newFilters.status as ConnectionStatus;
    }

    setFilters(datasourceFilters);
    setIsSearchModalOpen(false);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilters({});
    setCurrentPage(1);
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
      // Reset to first page if current page becomes empty
      if (datasources.length === 1 && currentPage > 1) {
        setCurrentPage(1);
      }
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
        setCurrentPage(1); // Reset to first page when adding new item
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
      {hasAppliedFilters && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2">
          <span className="text-xs text-slate-400">篩選條件：</span>
          {appliedFilters.map(filter => (
            <StatusTag key={filter.key} dense tone="neutral" label={filter.label} />
          ))}
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs font-medium text-sky-300 transition hover:text-sky-200"
          >
            清除全部
          </button>
        </div>
      )}

      {hasAppliedFilters && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2">
          <span className="text-xs text-slate-400">篩選條件：</span>
          {appliedFilters.map(filter => (
            <StatusTag key={filter.key} dense tone="neutral" label={filter.label} />
          ))}
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs font-medium text-sky-300 transition hover:text-sky-200"
          >
            清除全部
          </button>
        </div>
      )}

      <Toolbar
        leftActions={(
          <ToolbarButton icon="search" text="搜尋和篩選" onClick={() => setIsSearchModalOpen(true)} />
        )}
        rightActions={(
          <>
            <ToolbarButton icon="refresh-cw" text="重新整理" onClick={fetchDatasources} disabled={isLoading} />
            <ToolbarButton icon="plus" text="新增資料來源" primary onClick={handleNew} />
          </>
        )}
      />

      <TableContainer>
        <div className="h-full overflow-x-auto">
          <table className="w-full table-fixed text-left text-sm text-slate-200">
            <thead className="sticky top-0 z-10 bg-slate-900/70 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <SortableHeader
                  label="名稱"
                  sortKey="name"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  className="font-semibold w-52"
                />
                <SortableHeader
                  label="類型"
                  sortKey="type"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  className="font-semibold w-28"
                />
                <SortableHeader
                  label="連線位址"
                  sortKey="url"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  className="font-semibold w-60"
                />
                <SortableHeader
                  label="更新時間"
                  sortKey="updated_at"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  className="font-semibold w-44"
                />
                <SortableHeader
                  label="狀態"
                  sortKey="status"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  className="font-semibold w-28"
                />
                <th className="px-6 py-3 text-center font-semibold w-36">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <TableLoader colSpan={6} />
              ) : error ? (
                <TableError colSpan={6} message={error} onRetry={fetchDatasources} />
              ) : hasNoData ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
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
                      <td className="px-6 py-4 align-top w-52">
                        <div className="flex flex-col gap-2">
                          <span className="text-sm font-semibold text-white">{ds.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top w-28">
                        <div className="w-fit">
                          <StatusTag
                            label={typeMeta?.label || ds.type}
                            className={typeMeta?.className}
                            dense
                            tooltip="資料來源類型"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top w-60">
                        <div className="flex items-center gap-2 text-slate-400">
                          <span className="truncate flex-1" title={ds.url}>{ds.url}</span>
                          <IconButton
                            icon="copy"
                            label={`複製 ${ds.name} 連線位址`}
                            tooltip="複製連線位址"
                            onClick={() => {
                              if (typeof navigator !== 'undefined' && navigator?.clipboard?.writeText) {
                                navigator.clipboard
                                  .writeText(ds.url)
                                  .then(() => {
                                    showToast('已複製連線位址。', 'success');
                                  })
                                  .catch(() => {
                                    showToast('複製失敗，請手動選取。', 'error');
                                  });
                              } else {
                                showToast('瀏覽器不支援快速複製，請手動選取連線位址。', 'warning');
                              }
                            }}
                            tone="default"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top w-44 text-slate-300">
                        <span title={ds.updated_at}>{ds.updated_at}</span>
                      </td>
                      <td className="px-6 py-4 align-top w-28">
                        <div className="w-fit">
                          <StatusTag
                            label={statusMeta.label}
                            tone={statusMeta.tone}
                            dense
                            tooltip={statusMeta.description}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top w-36">
                        <div className="flex items-center justify-center gap-2">
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
        <Pagination
          total={total}
          page={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
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

      <UnifiedSearchModal
        page="datasources"
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSearch={handleUnifiedSearch}
        initialFilters={{
          keyword: searchTerm,
          type: filters.type,
          status: filters.status || 'all',
        }}
      />
    </div>
  );
};

export default DatasourceManagementPage;

