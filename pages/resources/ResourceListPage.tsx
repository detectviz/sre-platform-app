

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
// FIX: Import TableColumn from types.ts
import { Resource, ResourceFilters, TableColumn } from '../../types';
import Icon from '../../components/Icon';
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
// FIX: Import TableColumn from types.ts, not from ColumnSettingsModal
import ColumnSettingsModal from '../../components/ColumnSettingsModal';
import { showToast } from '../../services/toast';
import { usePageMetadata } from '../../contexts/PageMetadataContext';
import ResourceAnalysisModal from '../../components/ResourceAnalysisModal';

const PAGE_IDENTIFIER = 'resources';

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
    
    const { resourceId } = useParams<{ resourceId: string }>();

    const { metadata: pageMetadata } = usePageMetadata();
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.columnConfigKey;

    const fetchResources = useCallback(async () => {
        if (!pageKey) return;
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                page_size: pageSize,
                ...filters,
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
    }, [currentPage, pageSize, filters, pageKey]);
    
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

    const getStatusPill = (status: Resource['status']) => {
        switch (status) {
            case 'healthy': return 'bg-green-500/20 text-green-400';
            case 'warning': return 'bg-yellow-500/20 text-yellow-400';
            case 'critical': return 'bg-red-500/20 text-red-400';
            case 'offline': return 'bg-slate-500/20 text-slate-400';
        }
    };

    useEffect(() => {
        setSelectedIds([]);
    }, [currentPage, pageSize, filters]);

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
        
        exportToCsv({
            filename: `resources-${new Date().toISOString().split('T')[0]}.csv`,
            headers: ['id', 'name', 'status', 'type', 'provider', 'region', 'owner', 'lastCheckIn'],
            data: dataToExport,
        });
    };
    
    const renderCellContent = (res: Resource, columnKey: string) => {
        switch (columnKey) {
            case 'status':
                return (
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusPill(res.status)}`}>
                        <span className={`w-2 h-2 mr-2 rounded-full ${res.status === 'healthy' ? 'bg-green-400' : res.status === 'warning' ? 'bg-yellow-400' : res.status === 'critical' ? 'bg-red-400' : 'bg-slate-400'}`}></span>
                        {res.status}
                    </span>
                );
            case 'name': return <span className="font-medium text-white">{res.name}</span>;
            case 'type': return res.type;
            case 'provider': return res.provider;
            case 'region': return res.region;
            case 'owner': return res.owner;
            case 'lastCheckIn': return res.lastCheckIn;
            default: return null;
        }
    };

    const leftActions = (
         <ToolbarButton icon="search" text="搜索和篩選" onClick={() => setIsSearchModalOpen(true)} />
    );
    
    const batchActions = (
        <>
            <ToolbarButton icon="brain-circuit" text="AI 分析" onClick={handleAIAnalysis} ai />
            <ToolbarButton icon="trash-2" text="刪除" danger onClick={handleBatchDelete} />
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
                                           checked={isAllSelected} ref={el => { if(el) el.indeterminate = isIndeterminate; }} onChange={handleSelectAll} />
                                </th>
                                {visibleColumns.map(key => (
                                    <th key={key} scope="col" className="px-6 py-3">{allColumns.find(c => c.key === key)?.label || key}</th>
                                ))}
                                <th scope="col" className="px-6 py-3 text-center">操作</th>
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
                                        <td key={key} className="px-6 py-4">{renderCellContent(res, key)}</td>
                                    ))}
                                    <td className="px-6 py-4 text-center space-x-1">
                                         <button onClick={() => handleViewDetails(res.id)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="查看詳情">
                                            <Icon name="eye" className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleEditResource(res)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="編輯">
                                            <Icon name="edit-3" className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteResource(res)} className="p-1.5 rounded-md text-red-400 hover:bg-red-500/20 hover:text-red-300" title="刪除">
                                            <Icon name="trash-2" className="w-4 h-4" />
                                        </button>
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
                isOpen={!!resourceId}
                onClose={handleCloseDrawer}
                title={resources.find(res => res.id === resourceId)?.name || "載入中..."}
                width="w-3/5"
            >
                {resourceId && <ResourceDetailPage resourceId={resourceId} />}
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
            <ResourceAnalysisModal
                isOpen={isAnalysisModalOpen}
                onClose={() => setIsAnalysisModalOpen(false)}
                resources={analyzingResources}
            />
        </div>
    );
};

export default ResourceListPage;