import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import AddDashboardModal from '@/features/dashboards/components/AddDashboardModal';
import DashboardEditModal from '@/features/dashboards/components/DashboardEditModal';
import { getContentString } from '@/assets/content';
import { useContent } from '@/contexts/ContentContext';
import { useOptions } from '@/contexts/OptionsContext';
import { usePageMetadata } from '@/contexts/PageMetadataContext';
import api from '@/services/api';
import { exportToCsv } from '@/services/export';
import { showToast } from '@/services/toast';
import StatusTag, { type StatusTagProps } from '@/shared/components/StatusTag';
import ColumnSettingsModal from '@/shared/components/ColumnSettingsModal';
import Icon from '@/shared/components/Icon';
import IconButton from '@/shared/components/IconButton';
import ImportFromCsvModal from '@/shared/components/ImportFromCsvModal';
import Modal from '@/shared/components/Modal';
import Pagination from '@/shared/components/Pagination';
import SortableColumnHeaderCell from '@/shared/components/SortableColumnHeaderCell';
import TableContainer from '@/shared/components/TableContainer';
import TableError from '@/shared/components/TableError';
import TableLoader from '@/shared/components/TableLoader';
import Toolbar, { ToolbarButton } from '@/shared/components/Toolbar';
import UnifiedSearchModal from '@/shared/components/UnifiedSearchModal';
import { Dashboard, DashboardFilters, TableColumn } from '@/shared/types';
import useTableSorting from '@/shared/hooks/useTableSorting';
import { ROUTES } from '@/shared/constants/routes';

const PAGE_IDENTIFIER = 'dashboards';
const DEFAULT_DASHBOARD_STORAGE_KEY = 'sre-platform.default-dashboard';
const FALLBACK_HOME_DASHBOARD_ID = 'sre-war-room';

const DashboardListPage: React.FC = () => {
    const [dashboards, setDashboards] = useState<Dashboard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalDashboards, setTotalDashboards] = useState(0);
    const [allColumns, setAllColumns] = useState<TableColumn[]>([]);

    const { options: dashboardOptions, isLoading: isLoadingOptions } = useOptions();
    const { content } = useContent();
    const pageContent = content?.DASHBOARD_LIST;
    const globalContent = content?.GLOBAL;
    const globalMessages = globalContent?.MESSAGES;

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filters, setFilters] = useState<DashboardFilters>({});

    const [defaultDashboard, setDefaultDashboard] = useState<string>('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const navigate = useNavigate();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingDashboard, setDeletingDashboard] = useState<Dashboard | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDashboard, setEditingDashboard] = useState<Dashboard | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isColumnSettingsModalOpen, setIsColumnSettingsModalOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const preferText = useCallback((...candidates: Array<string | null | undefined>) => {
        return candidates.find(candidate => typeof candidate === 'string' && candidate.trim().length > 0) ?? undefined;
    }, []);

    const { metadata: pageMetadata } = usePageMetadata();
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.column_config_key;

    const { sortConfig, sortParams, handleSort } = useTableSorting({ defaultSortKey: 'updated_at', defaultSortDirection: 'desc' });
    const exportConfig = pageContent?.EXPORT;
    const importConfig = pageContent?.IMPORT;
    const typeMetadata = pageContent?.TYPE_METADATA ?? {};
    const setAsHomeLabel = preferText(
        pageContent?.ACTIONS?.SET_AS_HOME,
        getContentString('DASHBOARD_LIST.ACTIONS.SET_AS_HOME')
    );
    const homeBadgeLabel = preferText(
        pageContent?.HOME_BADGE,
        getContentString('DASHBOARD_LIST.HOME_BADGE')
    );
    const deleteModalTitle = preferText(
        pageContent?.DELETE_MODAL_TITLE,
        getContentString('DASHBOARD_LIST.DELETE_MODAL_TITLE'),
        globalContent?.CONFIRM_DELETE_TITLE,
        getContentString('GLOBAL.CONFIRM_DELETE_TITLE')
    );
    const deleteModalMessageTemplate = preferText(
        pageContent?.DELETE_MODAL_MESSAGE,
        getContentString('DASHBOARD_LIST.DELETE_MODAL_MESSAGE')
    );
    const confirmDeleteMessage = preferText(
        globalContent?.CONFIRM_DELETE_MESSAGE,
        getContentString('GLOBAL.CONFIRM_DELETE_MESSAGE')
    );
    const defaultBadgeTooltip = preferText(
        pageContent?.DEFAULT_DASHBOARD_TOOLTIP,
        getContentString('DASHBOARD_LIST.DEFAULT_DASHBOARD_TOOLTIP')
    );
    const defaultBadgeActiveTooltip = preferText(
        pageContent?.DEFAULT_DASHBOARD_ACTIVE_TOOLTIP,
        pageContent?.DEFAULT_DASHBOARD_TOOLTIP,
        getContentString('DASHBOARD_LIST.DEFAULT_DASHBOARD_ACTIVE_TOOLTIP'),
        getContentString('DASHBOARD_LIST.DEFAULT_DASHBOARD_TOOLTIP')
    );
    const importItemName = preferText(
        importConfig?.ITEM_NAME,
        getContentString('DASHBOARD_LIST.IMPORT.ITEM_NAME')
    );
    const importTemplateFilename = preferText(
        importConfig?.TEMPLATE_FILENAME,
        exportConfig?.FILENAME_PREFIX ? `${exportConfig.FILENAME_PREFIX}-template.csv` : undefined,
        getContentString('DASHBOARD_LIST.IMPORT.TEMPLATE_FILENAME')
    );

    const fetchDashboards = useCallback(async () => {
        if (!pageKey || !pageContent) return;
        setIsLoading(true);
        setError(null);
        try {
            const params: any = {
                page: currentPage,
                page_size: pageSize,
                ...filters,
                ...sortParams,
            };

            const [dashboardsRes, columnsRes, allColumnsRes] = await Promise.all([
                api.get<{ items: Dashboard[], total: number }>('/dashboards', { params }),
                api.get<string[]>(`/settings/column-config/${pageKey}`),
                api.get<TableColumn[]>(`/pages/columns/${pageKey}`),
            ]);

            setAllColumns(allColumnsRes.data);
            setDashboards(dashboardsRes.data.items);
            setTotalDashboards(dashboardsRes.data.total);
            setVisibleColumns(columnsRes.data.length > 0 ? columnsRes.data : allColumnsRes.data.map(c => c.key));
        } catch (err) {
            const fetchError = preferText(
                pageContent?.FETCH_ERROR,
                globalMessages?.GENERIC_FETCH_ERROR,
                globalMessages?.GENERIC_ERROR,
                getContentString('DASHBOARD_LIST.FETCH_ERROR'),
                getContentString('GLOBAL.MESSAGES.GENERIC_FETCH_ERROR'),
                getContentString('GLOBAL.MESSAGES.GENERIC_ERROR')
            );
            setError(fetchError ?? null);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, filters, pageKey, pageContent, sortParams, preferText, globalMessages]);

    useEffect(() => {
        if (pageKey && pageContent) {
            fetchDashboards();
        }
    }, [fetchDashboards, pageKey, pageContent]);

    useEffect(() => {
        const storedDefault = localStorage.getItem(DEFAULT_DASHBOARD_STORAGE_KEY);
        setDefaultDashboard(storedDefault ?? FALLBACK_HOME_DASHBOARD_ID);
    }, []);

    const handleSaveColumnConfig = async (newColumnKeys: string[]) => {
        if (!pageKey || !pageContent) {
            const message = preferText(
                pageContent?.COLUMN_CONFIG_MISSING_ERROR,
                getContentString('DASHBOARD_LIST.COLUMN_CONFIG_MISSING_ERROR'),
                globalMessages?.GENERIC_ERROR,
                getContentString('GLOBAL.MESSAGES.GENERIC_ERROR')
            );
            if (message) {
                showToast(message, 'error');
            }
            return;
        }
        try {
            await api.put(`/settings/column-config/${pageKey}`, newColumnKeys);
            setVisibleColumns(newColumnKeys);
            const successMessage = preferText(
                pageContent.COLUMN_CONFIG_SAVE_SUCCESS,
                getContentString('DASHBOARD_LIST.COLUMN_CONFIG_SAVE_SUCCESS')
            );
            if (successMessage) {
                showToast(successMessage, 'success');
            }
        } catch (err) {
            const errorMessage = preferText(
                pageContent.COLUMN_CONFIG_SAVE_ERROR,
                getContentString('DASHBOARD_LIST.COLUMN_CONFIG_SAVE_ERROR'),
                globalMessages?.GENERIC_ERROR,
                getContentString('GLOBAL.MESSAGES.GENERIC_ERROR')
            );
            if (errorMessage) {
                showToast(errorMessage, 'error');
            }
        } finally {
            setIsColumnSettingsModalOpen(false);
        }
    };

    const handleSetDefault = (dashboardId: string) => {
        localStorage.setItem(DEFAULT_DASHBOARD_STORAGE_KEY, dashboardId);
        setDefaultDashboard(dashboardId);
    };

    const handleRowClick = (dashboard: Dashboard) => {
        navigate(dashboard.path);
    };

    const handleSaveDashboard = async (newDashboardData: Partial<Dashboard>) => {
        try {
            await api.post('/dashboards', newDashboardData);
            setIsAddModalOpen(false);
            fetchDashboards();
        } catch (err) {
            const message = preferText(
                pageContent?.SAVE_ERROR,
                globalMessages?.GENERIC_SAVE_ERROR,
                globalMessages?.GENERIC_ERROR,
                getContentString('DASHBOARD_LIST.SAVE_ERROR'),
                getContentString('GLOBAL.MESSAGES.GENERIC_SAVE_ERROR'),
                getContentString('GLOBAL.MESSAGES.GENERIC_ERROR')
            );
            if (message) {
                showToast(message, 'error');
            }
        }
    };

    const handleDeleteClick = (dashboard: Dashboard) => {
        setDeletingDashboard(dashboard);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (deletingDashboard) {
            try {
                await api.del(`/dashboards/${deletingDashboard.id}`);
                if (defaultDashboard === deletingDashboard.id) {
                    localStorage.setItem(DEFAULT_DASHBOARD_STORAGE_KEY, FALLBACK_HOME_DASHBOARD_ID);
                    setDefaultDashboard(FALLBACK_HOME_DASHBOARD_ID);
                }
                setIsDeleteModalOpen(false);
                setDeletingDashboard(null);
                fetchDashboards(); // Re-fetch
            } catch (err) {
                const message = preferText(
                    pageContent?.DELETE_ERROR,
                    globalMessages?.GENERIC_DELETE_ERROR,
                    globalMessages?.GENERIC_ERROR,
                    getContentString('DASHBOARD_LIST.DELETE_ERROR'),
                    getContentString('GLOBAL.MESSAGES.GENERIC_DELETE_ERROR'),
                    getContentString('GLOBAL.MESSAGES.GENERIC_ERROR')
                );
                if (message) {
                    showToast(message, 'error');
                }
            }
        }
    };

    const handleEditClick = (dashboard: Dashboard) => {
        if (dashboard.type === 'built-in' || dashboard.type === 'grafana') {
            navigate(ROUTES.dashboardEdit(dashboard.id));
        } else {
            setEditingDashboard(dashboard);
            setIsEditModalOpen(true);
        }
    };

    const handleUpdateDashboard = async (updatedDashboard: Dashboard) => {
        try {
            await api.patch(`/dashboards/${updatedDashboard.id}`, updatedDashboard);
            setIsEditModalOpen(false);
            setEditingDashboard(null);
            fetchDashboards(); // Re-fetch
        } catch (err) {
            const message = preferText(
                pageContent?.UPDATE_ERROR,
                globalMessages?.GENERIC_UPDATE_ERROR,
                globalMessages?.GENERIC_ERROR,
                getContentString('DASHBOARD_LIST.UPDATE_ERROR'),
                getContentString('GLOBAL.MESSAGES.GENERIC_UPDATE_ERROR'),
                getContentString('GLOBAL.MESSAGES.GENERIC_ERROR')
            );
            if (message) {
                showToast(message, 'error');
            }
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedIds(e.target.checked ? dashboards.map(d => d.id) : []);
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        setSelectedIds(prev => e.target.checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id));
    };

    const isAllSelected = dashboards.length > 0 && selectedIds.length === dashboards.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < dashboards.length;

    const handleBatchDelete = async () => {
        try {
            await api.post('/dashboards/batch-actions', { action: 'delete', ids: selectedIds });
            setSelectedIds([]);
            fetchDashboards();
        } catch (err) {
            const message = preferText(
                pageContent?.BATCH_DELETE_ERROR,
                globalMessages?.GENERIC_BATCH_ACTION_ERROR,
                globalMessages?.GENERIC_DELETE_ERROR,
                getContentString('DASHBOARD_LIST.BATCH_DELETE_ERROR'),
                getContentString('GLOBAL.MESSAGES.GENERIC_BATCH_ACTION_ERROR'),
                getContentString('GLOBAL.MESSAGES.GENERIC_DELETE_ERROR'),
                getContentString('GLOBAL.MESSAGES.GENERIC_ERROR')
            );
            if (message) {
                showToast(message, 'error');
            }
        }
    };

    const handleExport = () => {
        const dataToExport = selectedIds.length > 0
            ? dashboards.filter(d => selectedIds.includes(d.id))
            : dashboards;

        if (dataToExport.length === 0) {
            const message = preferText(
                globalContent?.NO_DATA_TO_EXPORT,
                getContentString('GLOBAL.NO_DATA_TO_EXPORT'),
                globalMessages?.GENERIC_BATCH_ACTION_ERROR,
                globalMessages?.GENERIC_ERROR,
                getContentString('GLOBAL.MESSAGES.GENERIC_BATCH_ACTION_ERROR'),
                getContentString('GLOBAL.MESSAGES.GENERIC_ERROR')
            );
            if (message) {
                showToast(message, 'error');
            }
            return;
        }

        const filePrefix = preferText(
            exportConfig?.FILENAME_PREFIX,
            getContentString('DASHBOARD_LIST.EXPORT.FILENAME_PREFIX'),
            globalContent?.EXPORT
        );
        const dateSegment = new Date().toISOString().split('T')[0];
        const filename = `${filePrefix ? `${filePrefix}-` : ''}${dateSegment}.csv`;

        exportToCsv({
            filename,
            headers: exportConfig?.HEADERS,
            data: dataToExport,
        });
    };

    const typeToneMap: Record<string, StatusTagProps['tone']> = useMemo(() => ({
        'built-in': 'info',
        grafana: 'neutral',
        external: 'warning',
    }), []);

    const renderCellContent = (dashboard: Dashboard, columnKey: string) => {
        if (!pageContent) {
            const placeholder = preferText(globalContent?.NA, getContentString('GLOBAL.NA')) ?? '—';
            return <span className="text-slate-500">{placeholder}</span>;
        }
        switch (columnKey) {
            case 'name':
                return (
                    <>
                        <div className="flex items-start gap-2 cursor-pointer">
                            <div
                                className="mt-0.5"
                                title={dashboard.type === 'built-in' ? pageContent.BUILT_IN_TOOLTIP : pageContent.GRAFANA_TOOLTIP}
                            >
                                <Icon
                                    name={dashboard.type === 'built-in' ? 'layout-dashboard' : 'area-chart'}
                                    className={`h-5 w-5 ${dashboard.type === 'built-in' ? 'text-sky-400' : 'text-emerald-400'}`}
                                />
                            </div>
                            <div className="flex min-w-0 flex-col gap-1">
                                <span className="truncate font-medium text-white" title={dashboard.name}>
                                    {dashboard.name}
                                </span>
                                {dashboard.description && (
                                    <span className="truncate text-xs text-slate-400" title={dashboard.description}>
                                        {dashboard.description}
                                    </span>
                                )}
                            </div>
                            {defaultDashboard === dashboard.id && (
                                <StatusTag
                                    dense
                                    tone="info"
                                    label={homeBadgeLabel ?? pageContent.HOME_BADGE ?? ''}
                                    tooltip={defaultBadgeActiveTooltip ?? defaultBadgeTooltip ?? homeBadgeLabel ?? ''}
                                />
                            )}
                        </div>
                    </>
                );
            case 'type':
                {
                    const typeMeta = typeMetadata[dashboard.type] ?? {
                        label: dashboard.type,
                        tooltip: dashboard.type,
                    };
                    return (
                        <StatusTag
                            dense
                            tone={typeToneMap[dashboard.type] ?? 'neutral'}
                            label={typeMeta.label}
                            tooltip={typeMeta.tooltip}
                        />
                    );
                }
            case 'category': {
                const categoryDescriptor = dashboardOptions?.dashboards?.categories.find(c => c.value === dashboard.category);
                const label = categoryDescriptor?.label || dashboard.category;
                const tooltip = dashboardOptions?.dashboards
                    ? `${label}｜${dashboard.category}`
                    : dashboard.category;
                return (
                    <StatusTag
                        dense
                        className={categoryDescriptor?.class_name}
                        label={label}
                        tooltip={tooltip}
                    />
                );
            }
            case 'owner':
                return dashboard.owner;
            case 'updated_at':
                return dashboard.updated_at;
            default:
                const placeholder = preferText(globalContent?.NA, getContentString('GLOBAL.NA')) ?? '—';
                return <span className="text-slate-500">{placeholder}</span>;
        }
    };

    if (!pageContent || !globalContent) {
        return <div className="flex items-center justify-center h-full"><Icon name="loader-circle" className="w-8 h-8 animate-spin" /></div>;
    }

    const leftActions = (
        <ToolbarButton icon="search" text={pageContent.SEARCH_PLACEHOLDER} onClick={() => setIsSearchModalOpen(true)} />
    );

    const rightActions = (
        <>
            <ToolbarButton icon="upload" text={globalContent.IMPORT} onClick={() => setIsImportModalOpen(true)} />
            <ToolbarButton icon="download" text={globalContent.EXPORT} onClick={handleExport} />
            <ToolbarButton icon="settings-2" text={globalContent.COLUMN_SETTINGS} onClick={() => setIsColumnSettingsModalOpen(true)} />
            <ToolbarButton icon="plus" text={pageContent.ADD_DASHBOARD} primary onClick={() => setIsAddModalOpen(true)} />
        </>
    );

    const batchActions = (
        <ToolbarButton icon="trash-2" text={globalContent.DELETE} danger onClick={handleBatchDelete} />
    );

    return (
        <div className="h-full flex flex-col">
            <Toolbar
                leftActions={leftActions}
                rightActions={rightActions}
                selectedCount={selectedIds.length}
                onClearSelection={() => setSelectedIds([])}
                batchActions={batchActions}
            />
            <TableContainer>
                <div className="overflow-x-auto flex-grow">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0">
                            <tr>
                                <th scope="col" className="p-4 w-12">
                                    <input type="checkbox" className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600"
                                        checked={isAllSelected} ref={el => { if (el) el.indeterminate = isIndeterminate; }} onChange={handleSelectAll} />
                                </th>
                                {visibleColumns.map(key => {
                                    const column = allColumns.find(c => c.key === key);
                                    const getColumnWidth = (columnKey: string) => {
                                        switch (columnKey) {
                                            case 'name': return 'min-w-64 max-w-80'; // 儀表板名稱欄位彈性寬度
                                            case 'type': return 'w-20'; // 類型欄位較窄
                                            case 'category': return 'w-28'; // 分類欄位適中
                                            case 'owner': return 'w-24'; // 擁有者欄位適中
                                            case 'updated_at': return 'w-32'; // 最後更新欄位適中
                                            default: return 'w-20'; // 其他欄位預設寬度
                                        }
                                    };
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
                                <th scope="col" className="px-6 py-3 text-center w-28">{globalContent.OPERATIONS}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={visibleColumns.length + 2} />
                            ) : error ? (
                                <TableError colSpan={visibleColumns.length + 2} message={error} onRetry={fetchDashboards} />
                            ) : dashboards.map((d) => (
                                <tr key={d.id} className={`border-b border-slate-800 ${selectedIds.includes(d.id) ? 'bg-sky-900/50' : 'hover:bg-slate-800/40'}`}>
                                    <td className="p-4 w-12">
                                        <input type="checkbox" className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600"
                                            checked={selectedIds.includes(d.id)} onChange={(e) => handleSelectOne(e, d.id)} />
                                    </td>
                                    {visibleColumns.map(key => {
                                        const getColumnWidth = (key: string) => {
                                            switch (key) {
                                                case 'name': return 'min-w-64 max-w-80'; // 儀表板名稱欄位彈性寬度
                                                case 'type': return 'w-20'; // 類型欄位較窄
                                                case 'category': return 'w-28'; // 分類欄位適中
                                                case 'owner': return 'w-24'; // 擁有者欄位適中
                                                case 'updated_at': return 'w-32'; // 最後更新欄位適中
                                                default: return 'w-20'; // 其他欄位預設寬度
                                            }
                                        };
                                        return (
                                            <td key={key} className={`px-6 py-4 ${getColumnWidth(key)}`} onClick={() => key === 'name' && handleRowClick(d)}>
                                                {renderCellContent(d, key)}
                                            </td>
                                        );
                                    })}
                                    <td className="px-6 py-4 text-center w-28" onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1.5">
                                            <IconButton
                                                icon={defaultDashboard === d.id ? 'star' : 'star'}
                                                label={setAsHomeLabel ?? pageContent.ACTIONS?.SET_AS_HOME ?? ''}
                                                onClick={() => handleSetDefault(d.id)}
                                                tone={defaultDashboard === d.id ? 'primary' : 'default'}
                                                className={defaultDashboard === d.id ? 'bg-sky-500/10 text-sky-200' : ''}
                                                tooltip={
                                                    defaultDashboard === d.id
                                                        ? defaultBadgeActiveTooltip ?? setAsHomeLabel ?? ''
                                                        : setAsHomeLabel ?? ''
                                                }
                                            />
                                            <IconButton
                                                icon="edit-3"
                                                label={globalContent.EDIT}
                                                onClick={() => handleEditClick(d)}
                                                tooltip={globalContent.EDIT}
                                            />
                                            <IconButton
                                                icon="trash-2"
                                                label={globalContent.DELETE}
                                                tone="danger"
                                                onClick={() => handleDeleteClick(d)}
                                                tooltip={globalContent.DELETE}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination total={totalDashboards} page={currentPage} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
            </TableContainer>
            <AddDashboardModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleSaveDashboard} />
            <DashboardEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleUpdateDashboard} dashboard={editingDashboard} />
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title={deleteModalTitle ?? ''}
                width="w-1/3"
                footer={
                    <>
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-md">{globalContent.CANCEL}</button>
                        <button onClick={handleConfirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md">{globalContent.DELETE}</button>
                    </>
                }
            >
                <p>{(deleteModalMessageTemplate ?? '').replace('{name}', deletingDashboard?.name ?? '')}</p>
                {confirmDeleteMessage && (
                    <p className="mt-2 text-slate-400">{confirmDeleteMessage}</p>
                )}
            </Modal>
            <ColumnSettingsModal
                isOpen={isColumnSettingsModalOpen}
                onClose={() => setIsColumnSettingsModalOpen(false)}
                onSave={handleSaveColumnConfig}
                allColumns={allColumns}
                visibleColumnKeys={visibleColumns}
            />
            <UnifiedSearchModal
                page={PAGE_IDENTIFIER}
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onSearch={(newFilters) => {
                    setFilters(newFilters as DashboardFilters);
                    setIsSearchModalOpen(false);
                    setCurrentPage(1);
                }}
                initialFilters={filters}
            />
            <ImportFromCsvModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImportSuccess={fetchDashboards}
                itemName={importItemName ?? ''}
                importEndpoint="/dashboards/import"
                templateHeaders={importConfig?.TEMPLATE_HEADERS ?? []}
                templateFilename={importTemplateFilename ?? ''}
            />
        </div>
    );
};

export default DashboardListPage;