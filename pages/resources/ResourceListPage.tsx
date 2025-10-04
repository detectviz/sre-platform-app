

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Resource, ResourceFilters, TableColumn } from '../../types';
import Toolbar, { ToolbarButton } from '../../components/Toolbar';
import TableContainer from '../../components/TableContainer';
import Drawer from '../../components/Drawer';
import ResourceDetailPage from './ResourceDetailPage';
import UnifiedSearchModal from '../../components/UnifiedSearchModal';
import Pagination from '../../components/Pagination';
import ResourceEditModal from '../../components/ResourceEditModal';
import Modal from '../../components/Modal';
import api from '../../services/api';
import TableLoader from '../../components/TableLoader';
import TableError from '../../components/TableError';
import { exportToCsv } from '../../services/export';
import ImportFromCsvModal from '../../components/ImportFromCsvModal';
import ColumnSettingsModal from '../../components/ColumnSettingsModal';
import { showToast } from '../../services/toast';
import { usePageMetadata } from '../../contexts/PageMetadataContext';
import ResourceAnalysisModal from '../../components/ResourceAnalysisModal';
import { useOptions } from '../../contexts/OptionsContext';
import { formatRelativeTime } from '../../utils/time';
import StatusTag from '../../components/StatusTag';
import IconButton from '../../components/IconButton';
import SortableColumnHeaderCell from '../../components/SortableColumnHeaderCell';
import useTableSorting from '../../hooks/useTableSorting';

const PAGE_IDENTIFIER = 'resources';

interface ResourceEventItem {
    id: string;
    title: string;
    severity: 'info' | 'warning' | 'critical';
    occurred_at: string;
    summary: string;
}

const EVENT_SEVERITY_STYLES: Record<ResourceEventItem['severity'], { badge: string; dot: string; label: string }> = {
    info: {
        badge: 'bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-700',
        dot: 'bg-slate-400 dark:bg-slate-500',
        label: '資訊',
    },
    warning: {
        badge: 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-200 dark:border-amber-400/60',
        dot: 'bg-amber-400 dark:bg-amber-300',
        label: '警告',
    },
    critical: {
        badge: 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/20 dark:text-red-200 dark:border-red-500/60',
        dot: 'bg-red-500 dark:bg-red-400',
        label: '嚴重',
    },
};

const ResourceListPage: React.FC = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [allColumns, setAllColumns] = useState<TableColumn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalResources, setTotalResources] = useState(0);

    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [filters, setFilters] = useState<ResourceFilters>(location.state?.initialFilters || {});

    useEffect(() => {
        if (location.state?.initialFilters) {
            // Clear the state from location history to prevent it being sticky
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, location.pathname]);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<Resource | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingResource, setDeletingResource] = useState<Resource | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isColumnSettingsModalOpen, setIsColumnSettingsModalOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [analyzingResources, setAnalyzingResources] = useState<Resource[]>([]);
    const [isEventDrawerOpen, setIsEventDrawerOpen] = useState(false);
    const [eventDrawerResource, setEventDrawerResource] = useState<Resource | null>(null);
    const [eventDrawerItems, setEventDrawerItems] = useState<ResourceEventItem[]>([]);

    const { resource_id } = useParams<{ resource_id: string }>();

    const { metadata: pageMetadata } = usePageMetadata();
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.column_config_key;

    const { options } = useOptions();
    const resourceOptions = options?.resources;

    const statusDescriptors = useMemo(() => resourceOptions?.statuses ?? [], [resourceOptions?.statuses]);
    const statusColorLookup = useMemo(() => {
        const colors: Record<string, string> = {};
        resourceOptions?.status_colors?.forEach(descriptor => {
            colors[descriptor.value] = descriptor.color;
        });
        return colors;
    }, [resourceOptions?.status_colors]);
    const typeDescriptors = useMemo(() => resourceOptions?.types ?? [], [resourceOptions?.types]);

    const englishFromValue = useCallback((value: string) => (
        value.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
    ), []);

    const { sortConfig, sortParams, handleSort } = useTableSorting();

    const fetchResources = useCallback(async () => {
        if (!pageKey) return;
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                page_size: pageSize,
                ...filters,
                ...sortParams,
            };
            const [resourcesRes, columnConfigRes, allColumnsRes] = await Promise.all([
                api.get<{ items: Resource[], total: number }>('/resources', { params }),
                api.get<string[]>(`/settings/column-config/${pageKey}`),
                api.get<TableColumn[]>(`/pages/columns/${pageKey}`)
            ]);

            if (allColumnsRes.data.length === 0) {
                throw new Error('欄位定義缺失');
            }

            setResources(resourcesRes.data.items);
            setTotalResources(resourcesRes.data.total);
            setAllColumns(allColumnsRes.data);
            const resolvedVisibleColumns = columnConfigRes.data.length > 0
                ? columnConfigRes.data
                : allColumnsRes.data.map(c => c.key);
            setVisibleColumns(resolvedVisibleColumns);
        } catch (err) {
            console.error(err);
            setError('無法獲取資源列表。');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, filters, pageKey, sortParams]);

    useEffect(() => {
        if (pageKey) {
            fetchResources();
        }
    }, [fetchResources, pageKey]);

    const handleSaveColumnConfig = async (newColumnKeys: string[]) => {
        if (!pageKey) {
            showToast('無法儲存欄位設定：頁面設定遺失。', 'error');
            return;
        }
        try {
            await api.put(`/settings/column-config/${pageKey}`, newColumnKeys);
            setVisibleColumns(newColumnKeys);
            showToast('欄位設定已儲存。', 'success');
        } catch (err) {
            showToast('無法儲存欄位設定。', 'error');
        } finally {
            setIsColumnSettingsModalOpen(false);
        }
    };

    const handleViewDetails = (id: string) => {
        navigate(`/resources/list/${id}`);
    };

    const handleCloseDrawer = () => {
        navigate('/resources/list');
    };

    const handleNewResource = () => {
        setEditingResource(null);
        setIsEditModalOpen(true);
    };

    const handleEditResource = (resource: Resource) => {
        setEditingResource(resource);
        setIsEditModalOpen(true);
    };

    const handleSaveResource = async (resourceData: Partial<Resource>) => {
        try {
            if (editingResource) {
                await api.patch(`/resources/${editingResource.id}`, resourceData);
                showToast(`資源 "${resourceData.name}" 已成功更新。`, 'success');
            } else {
                await api.post('/resources', resourceData);
                showToast(`資源 "${resourceData.name}" 已成功新增。`, 'success');
            }
            setIsEditModalOpen(false);
            fetchResources();
        } catch (err) {
            showToast('儲存資源失敗。', 'error');
        }
    };

    const handleDeleteResource = (resource: Resource) => {
        setDeletingResource(resource);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (deletingResource) {
            try {
                await api.del(`/resources/${deletingResource.id}`);
                showToast(`資源 "${deletingResource.name}" 已成功刪除。`, 'success');
                setIsDeleteModalOpen(false);
                setDeletingResource(null);
                fetchResources();
            } catch (err) {
                showToast('刪除資源失敗。', 'error');
            }
        }
    };

    useEffect(() => {
        setSelectedIds([]);
    }, [currentPage, pageSize, filters]);

    const getColumnWidth = useCallback((columnKey: string) => {
        switch (columnKey) {
            case 'status':
                return 'w-20';
            case 'name':
                return 'w-48';
            case 'type':
                return 'w-32';
            case 'event_count':
                return 'w-28';
            case 'cpu_usage':
            case 'memory_usage':
                return 'w-60';
            case 'provider':
                return 'w-28';
            case 'region':
                return 'w-28';
            case 'owner':
                return 'w-32';
            case 'last_check_in_at':
                return 'w-40';
            default:
                return 'w-24';
        }
    }, []);

    const getUtilizationTone = (value?: number) => {
        if (value === undefined || value === null || Number.isNaN(value)) {
            return {
                barColor: '#64748b',
                textClass: 'text-slate-500 dark:text-slate-500',
            };
        }
        if (value >= 80) {
            return {
                barColor: '#f5222d',
                textClass: 'text-red-600 dark:text-red-300',
            };
        }
        if (value >= 60) {
            return {
                barColor: '#faad14',
                textClass: 'text-amber-600 dark:text-amber-300',
            };
        }
        return {
            barColor: '#52c41a',
            textClass: 'text-emerald-600 dark:text-emerald-300',
        };
    };

    const renderUtilizationPill = (value: number | undefined, label: string) => {
        if (value === undefined || value === null || Number.isNaN(value)) {
            return <span className="text-slate-400 dark:text-slate-500">--</span>;
        }
        const normalized = Math.max(0, Math.min(100, value));
        const tone = getUtilizationTone(normalized);
        return (
            <div className="flex items-center gap-3" title={`${label}: ${normalized.toFixed(1)}%`}>
                <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700/70">
                    <div
                        className="h-full rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${normalized}%`, backgroundColor: tone.barColor }}
                    />
                </div>
                <span className={`min-w-[3.5rem] text-xs font-semibold tabular-nums ${tone.textClass}`}>
                    {normalized.toFixed(1)}%
                </span>
            </div>
        );
    };

    const getEventCountTone = (count: number) => {
        if (count >= 2) {
            return {
                className: 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/20 dark:text-red-200 dark:border-red-500/60',
                dotClass: 'bg-red-500 dark:bg-red-400',
            };
        }
        if (count >= 1) {
            return {
                className: 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-200 dark:border-amber-400/60',
                dotClass: 'bg-amber-400 dark:bg-amber-300',
            };
        }
        return {
            className: 'bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700',
            dotClass: 'bg-slate-400 dark:bg-slate-500',
        };
    };

    const generateMockEvents = useCallback((resource: Resource): ResourceEventItem[] => {
        const total = resource.event_count ?? 0;
        if (total <= 0) {
            return [];
        }
        const length = Math.min(5, total);
        return Array.from({ length }, (_, index) => {
            const severity: ResourceEventItem['severity'] = (() => {
                if (total >= 3) {
                    if (index === 0) return 'critical';
                    if (index <= 1) return 'warning';
                    return 'info';
                }
                if (total === 2) {
                    return index === 0 ? 'critical' : 'warning';
                }
                return 'warning';
            })();
            return {
                id: `${resource.id}-evt-${index + 1}`,
                title: severity === 'critical' ? '高優先級事件' : severity === 'warning' ? '警告事件' : '資訊事件',
                severity,
                occurred_at: new Date(Date.now() - (index + 1) * 45 * 60 * 1000).toISOString(),
                summary: `${resource.name} 在最近 24 小時內產生 ${severity === 'critical' ? '嚴重' : severity === 'warning' ? '警告' : '資訊'}訊號，請檢視詳細監控趨勢。`,
            };
        });
    }, []);

    const handleOpenEventDrawer = (resource: Resource) => {
        if ((resource.event_count ?? 0) === 0) {
            return;
        }
        setEventDrawerResource(resource);
        setEventDrawerItems(generateMockEvents(resource));
        setIsEventDrawerOpen(true);
    };

    const handleCloseEventDrawer = () => {
        setIsEventDrawerOpen(false);
        setEventDrawerResource(null);
        setEventDrawerItems([]);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedIds(e.target.checked ? resources.map(r => r.id) : []);
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        setSelectedIds(prev => e.target.checked ? [...prev, id] : prev.filter(sid => sid !== id));
    };

    const isAllSelected = resources.length > 0 && selectedIds.length === resources.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < resources.length;

    const handleBatchDelete = async () => {
        try {
            await api.post('/resources/batch-actions', { action: 'delete', ids: selectedIds });
            showToast(`已成功刪除 ${selectedIds.length} 個資源。`, 'success');
            setSelectedIds([]);
            fetchResources();
        } catch (err) {
            showToast('批次刪除資源失敗。', 'error');
        }
    };

    const handleAIAnalysis = () => {
        const selected = resources.filter(r => selectedIds.includes(r.id));
        if (selected.length > 0) {
            setAnalyzingResources(selected);
            setIsAnalysisModalOpen(true);
        } else {
            showToast('請至少選擇一個資源進行分析。', 'error');
        }
    };

    const handleExport = () => {
        const dataToExport = selectedIds.length > 0
            ? resources.filter(r => selectedIds.includes(r.id))
            : resources;

        if (dataToExport.length === 0) {
            showToast("沒有可匯出的資料。", 'error');
            return;
        }

        const normalized = dataToExport.map(resource => ({
            ...resource,
            metrics_cpu: resource.metrics?.cpu ?? '',
            metrics_memory: resource.metrics?.memory ?? '',
        }));

        exportToCsv({
            filename: `resources-${new Date().toISOString().split('T')[0]}.csv`,
            headers: ['id', 'name', 'status', 'type', 'provider', 'region', 'owner', 'event_count', 'metrics_cpu', 'metrics_memory', 'last_check_in_at'],
            data: normalized,
        });
    };

    const renderCellContent = (res: Resource, columnKey: string) => {
        switch (columnKey) {
            case 'status':
                const descriptor = statusDescriptors.find(item => item.value === res.status);
                const statusColor = statusColorLookup[res.status] || '#38bdf8';
                const readableLabel = descriptor?.label || res.status;
                const tooltip = `${readableLabel} (${englishFromValue(res.status)})`;
                return (
                    <StatusTag
                        dense
                        className={descriptor?.class_name}
                        tooltip={tooltip}
                        label={(
                            <span className="flex items-center gap-1.5">
                                <span
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{ backgroundColor: statusColor }}
                                />
                                <span className="text-slate-900 dark:text-slate-100">{readableLabel}</span>
                            </span>
                        )}
                    />
                );
            case 'name':
                return (
                    <span className="font-medium text-slate-900 dark:text-slate-100" title={res.name}>
                        {res.name}
                    </span>
                );
            case 'type': {
                const typeDescriptor = typeDescriptors.find(t => t.value === res.type);
                const pillClass = typeDescriptor?.class_name
                    || 'bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-700';
                const label = typeDescriptor?.label || res.type;
                return (
                    <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${pillClass}`}
                        title={typeDescriptor ? `${label}` : undefined}
                    >
                        {label}
                    </span>
                );
            }
            case 'event_count': {
                const eventCount = res.event_count ?? 0;
                const tone = getEventCountTone(eventCount);
                const isDisabled = eventCount === 0;
                return (
                    <button
                        type="button"
                        onClick={() => handleOpenEventDrawer(res)}
                        disabled={isDisabled}
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition ${tone.className} ${isDisabled ? 'cursor-default opacity-60' : 'hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/40 dark:focus-visible:ring-slate-300/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'}`}
                        title={eventCount === 0 ? '最近 24 小時內沒有事件' : `最近 24 小時內有 ${eventCount} 件事件`}
                    >
                        <span className={`h-2 w-2 rounded-full ${tone.dotClass}`} />
                        <span>{eventCount}</span>
                    </button>
                );
            }
            case 'cpu_usage':
                return renderUtilizationPill(res.metrics?.cpu, 'CPU 使用率');
            case 'memory_usage':
                return renderUtilizationPill(res.metrics?.memory, '記憶體使用率');
            case 'provider':
                return res.provider
                    ? <span className="text-slate-600 dark:text-slate-300">{res.provider}</span>
                    : <span className="text-slate-400 dark:text-slate-500">--</span>;
            case 'region':
                return res.region
                    ? <span className="text-slate-600 dark:text-slate-300">{res.region}</span>
                    : <span className="text-slate-400 dark:text-slate-500">--</span>;
            case 'owner':
                return res.owner
                    ? <span className="text-slate-600 dark:text-slate-300">{res.owner}</span>
                    : <span className="text-slate-400 dark:text-slate-500">--</span>;
            case 'last_check_in_at':
                return (
                    <span
                        className="text-slate-500 dark:text-slate-400"
                        title={new Date(res.last_check_in_at).toLocaleString()}
                    >
                        {formatRelativeTime(res.last_check_in_at)}
                    </span>
                );
            default:
                return <span className="text-slate-400 dark:text-slate-500">--</span>;
        }
    };

    const leftActions = (
        <ToolbarButton icon="search" text="搜索和篩選" onClick={() => setIsSearchModalOpen(true)} />
    );

    const batchActions = (
        <>
            <ToolbarButton icon="brain-circuit" text="AI 分析" onClick={handleAIAnalysis} ai />
            <ToolbarButton icon="trash-2" text="刪除" danger onClick={handleBatchDelete} />
            <ToolbarButton icon="upload" text="匯入" onClick={() => setIsImportModalOpen(true)} />
            <ToolbarButton icon="download" text="匯出" onClick={handleExport} />
        </>
    );

    return (
        <div className="h-full flex flex-col">
            <Toolbar
                leftActions={leftActions}
                rightActions={
                    <>
                        <ToolbarButton icon="upload" text="匯入" onClick={() => setIsImportModalOpen(true)} />
                        <ToolbarButton icon="download" text="匯出" onClick={handleExport} />
                        <ToolbarButton icon="settings-2" text="欄位設定" onClick={() => setIsColumnSettingsModalOpen(true)} />
                        <ToolbarButton icon="plus" text="新增資源" primary onClick={handleNewResource} />
                    </>
                }
                selectedCount={selectedIds.length}
                onClearSelection={() => setSelectedIds([])}
                batchActions={batchActions}
            />

            <TableContainer>
                <div className="h-full overflow-y-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="p-4 w-12">
                                    <input type="checkbox"
                                        className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600 rounded"
                                        checked={isAllSelected} ref={el => { if (el) el.indeterminate = isIndeterminate; }} onChange={handleSelectAll} />
                                </th>
                                {visibleColumns.map(key => {
                                    const column = allColumns.find(c => c.key === key);
                                    return (
                                        <SortableColumnHeaderCell
                                            key={key}
                                            column={column}
                                            columnKey={key}
                                            sortConfig={sortConfig}
                                            onSort={handleSort}
                                            className={getColumnWidth(key)}
                                        />
                                    );
                                })}
                                <th scope="col" className="px-6 py-3 text-center w-32">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={visibleColumns.length + 2} />
                            ) : error ? (
                                <TableError colSpan={visibleColumns.length + 2} message={error} onRetry={fetchResources} />
                            ) : resources.map((res) => (
                                <tr key={res.id} className={`border-b border-slate-800 ${selectedIds.includes(res.id) ? 'bg-sky-900/50' : 'hover:bg-slate-800/40'}`}>
                                    <td className="p-4 w-12">
                                        <input type="checkbox"
                                            className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600 rounded"
                                            checked={selectedIds.includes(res.id)} onChange={(e) => handleSelectOne(e, res.id)} />
                                    </td>
                                    {visibleColumns.map(key => (
                                        <td key={key} className={`px-6 py-4 ${getColumnWidth(key)}`}>
                                            {renderCellContent(res, key)}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <IconButton
                                                icon="eye"
                                                label="查看詳情"
                                                tooltip="查看詳情 View details"
                                                onClick={() => handleViewDetails(res.id)}
                                            />
                                            <IconButton
                                                icon="edit-3"
                                                label="編輯資源"
                                                tooltip="編輯資源 Edit resource"
                                                onClick={() => handleEditResource(res)}
                                            />
                                            <IconButton
                                                icon="trash-2"
                                                label="刪除資源"
                                                tooltip="刪除資源 Delete resource"
                                                onClick={() => handleDeleteResource(res)}
                                                tone="danger"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    total={totalResources}
                    page={currentPage}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                />
            </TableContainer>
            <Drawer
                isOpen={!!resource_id}
                onClose={handleCloseDrawer}
                title={resources.find(res => res.id === resource_id)?.name || "載入中..."}
                width="w-full max-w-6xl"
            >
                {resource_id && <ResourceDetailPage resource_id={resource_id} />}
            </Drawer>
            <UnifiedSearchModal
                page="resources"
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onSearch={(newFilters) => {
                    setFilters(newFilters as ResourceFilters);
                    setIsSearchModalOpen(false);
                    setCurrentPage(1);
                }}
                initialFilters={filters}
            />
            <ResourceEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveResource}
                resource={editingResource}
            />
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="確認刪除"
                width="w-1/3"
                footer={
                    <div className="flex justify-end space-x-2">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">取消</button>
                        <button onClick={handleConfirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md">刪除</button>
                    </div>
                }
            >
                <p>您確定要刪除資源 <strong className="text-amber-400">{deletingResource?.name}</strong> 嗎？</p>
                <p className="mt-2 text-slate-400">此操作無法復原。</p>
            </Modal>
            <ColumnSettingsModal
                isOpen={isColumnSettingsModalOpen}
                onClose={() => setIsColumnSettingsModalOpen(false)}
                onSave={handleSaveColumnConfig}
                allColumns={allColumns}
                visibleColumnKeys={visibleColumns}
            />
            <ImportFromCsvModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImportSuccess={fetchResources}
                itemName="資源"
                importEndpoint="/resources/import"
                templateHeaders={['id', 'name', 'status', 'type', 'provider', 'region', 'owner']}
                templateFilename="resources-template.csv"
            />
            <Drawer
                isOpen={isEventDrawerOpen}
                onClose={handleCloseEventDrawer}
                title={eventDrawerResource ? `${eventDrawerResource.name} 事件清單` : '事件清單'}
                width="w-full max-w-2xl"
            >
                {eventDrawerResource ? (
                    eventDrawerItems.length > 0 ? (
                        <div className="space-y-4">
                            {eventDrawerItems.map(event => {
                                const tone = EVENT_SEVERITY_STYLES[event.severity];
                                return (
                                    <div
                                        key={event.id}
                                        className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition dark:border-slate-700 dark:bg-slate-900"
                                    >
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between gap-3">
                                                <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${tone.badge}`}>
                                                    <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
                                                    {tone.label}
                                                </span>
                                                <span
                                                    className="text-xs text-slate-500 dark:text-slate-400"
                                                    title={new Date(event.occurred_at).toLocaleString()}
                                                >
                                                    {formatRelativeTime(event.occurred_at)}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{event.title}</h4>
                                                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{event.summary}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                            最近 24 小時內沒有事件。
                        </div>
                    )
                ) : null}
            </Drawer>
            <ResourceAnalysisModal
                isOpen={isAnalysisModalOpen}
                onClose={() => setIsAnalysisModalOpen(false)}
                resources={analyzingResources}
            />
        </div>
    );
};

export default ResourceListPage;