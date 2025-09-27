
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// FIX: Import DashboardFilters from types.ts
import { Dashboard, DashboardFilters } from '../../types';
import Icon from '../../components/Icon';
import TableContainer from '../../components/TableContainer';
import Toolbar, { ToolbarButton } from '../../components/Toolbar';
import AddDashboardModal from '../../components/AddDashboardModal';
import Modal from '../../components/Modal';
import DashboardEditModal from '../../components/DashboardEditModal';
import api from '../../services/api';
import Pagination from '../../components/Pagination';
import TableLoader from '../../components/TableLoader';
import TableError from '../../components/TableError';
import ColumnSettingsModal, { TableColumn } from '../../components/ColumnSettingsModal';
import { showToast } from '../../services/toast';
import { usePageMetadata } from '../../contexts/PageMetadataContext';
import { useOptions } from '../../contexts/OptionsContext';
// FIX: UnifiedSearchModal is a default export, DashboardFilters is not exported from here.
import UnifiedSearchModal from '../../components/UnifiedSearchModal';
import { exportToCsv } from '../../services/export';
import ImportFromCsvModal from '../../components/ImportFromCsvModal';

const ALL_COLUMNS: TableColumn[] = [
    { key: 'name', label: '名稱' },
    { key: 'type', label: '類型' },
    { key: 'category', label: '類別' },
    { key: 'owner', label: '擁有者' },
    { key: 'updatedAt', label: '最後更新' },
];
const PAGE_IDENTIFIER = 'dashboards';

const DashboardListPage: React.FC = () => {
    const [dashboards, setDashboards] = useState<Dashboard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalDashboards, setTotalDashboards] = useState(0);
    
    const { options, isLoading: isLoadingOptions } = useOptions();
    
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

    const { metadata: pageMetadata } = usePageMetadata();
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.columnConfigKey;

    const fetchDashboards = useCallback(async () => {
        if (!pageKey) return;
        setIsLoading(true);
        setError(null);
        try {
            const params: any = { 
                page: currentPage, 
                page_size: pageSize,
                ...filters
            };
            
            const [dashboardsRes, columnsRes] = await Promise.all([
                 api.get<{ items: Dashboard[], total: number }>('/dashboards', { params }),
                 api.get<string[]>(`/settings/column-config/${pageKey}`)
            ]);
            
            setDashboards(dashboardsRes.data.items);
            setTotalDashboards(dashboardsRes.data.total);
            setVisibleColumns(columnsRes.data.length > 0 ? columnsRes.data : ALL_COLUMNS.map(c => c.key));
        } catch (err) {
            setError('無法獲取儀表板列表。');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, filters, pageKey]);

    useEffect(() => {
        if (pageKey) {
            fetchDashboards();
        }
    }, [fetchDashboards, pageKey]);

    useEffect(() => {
        const storedDefault = localStorage.getItem('default-dashboard') || 'sre-war-room';
        setDefaultDashboard(storedDefault);
    }, []);

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

    const handleSetDefault = (dashboardId: string) => {
        localStorage.setItem('default-dashboard', dashboardId);
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
            alert('Failed to save dashboard.');
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
                    const fallbackDefault = 'sre-war-room';
                    localStorage.setItem('default-dashboard', fallbackDefault);
                    setDefaultDashboard(fallbackDefault);
                }
                setIsDeleteModalOpen(false);
                setDeletingDashboard(null);
                fetchDashboards(); // Re-fetch
            } catch (err) {
                alert('Failed to delete dashboard.');
            }
        }
    };

    const handleEditClick = (dashboard: Dashboard) => {
        if (dashboard.type === 'built-in') {
            navigate(`/dashboards/${dashboard.id}/edit`);
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
            alert('Failed to update dashboard.');
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
            alert('Failed to delete selected dashboards.');
        }
    };

    const handleExport = () => {
        const dataToExport = selectedIds.length > 0
            ? dashboards.filter(d => selectedIds.includes(d.id))
            : dashboards;
        
        if (dataToExport.length === 0) {
            showToast("沒有可匯出的資料。", 'error');
            return;
        }
        
        exportToCsv({
            filename: `dashboards-${new Date().toISOString().split('T')[0]}.csv`,
            headers: ['id', 'name', 'type', 'category', 'description', 'owner', 'updatedAt', 'path'],
            data: dataToExport,
        });
    };

    const renderCellContent = (dashboard: Dashboard, columnKey: string) => {
        switch (columnKey) {
            case 'name':
                return (
                    <>
                        <div className="flex items-center space-x-3 cursor-pointer">
                            <div title={dashboard.type === 'built-in' ? '內建儀表板' : 'Grafana 儀表板'}>
                                <Icon name={dashboard.type === 'built-in' ? "layout-dashboard" : "area-chart"} className={`w-5 h-5 ${dashboard.type === 'built-in' ? 'text-sky-400' : 'text-green-400'}`} />
                            </div>
                            <span>{dashboard.name}</span>
                            {defaultDashboard === dashboard.id && <span className="text-xs bg-sky-500 text-white px-2 py-0.5 rounded-full">首頁</span>}
                        </div>
                        <div className="text-xs text-slate-400 pl-8">{dashboard.description}</div>
                    </>
                );
            case 'type':
                return <span className={`px-2 py-1 text-xs rounded-full ${dashboard.type === 'built-in' ? 'bg-cyan-900 text-cyan-300' : 'bg-green-900 text-green-300'}`}>{dashboard.type}</span>;
            case 'category':
                return dashboard.category;
            case 'owner':
                return dashboard.owner;
            case 'updatedAt':
                return dashboard.updatedAt;
            default:
                return null;
        }
    };

    const leftActions = (
        <ToolbarButton icon="search" text="搜尋和篩選" onClick={() => setIsSearchModalOpen(true)} />
    );
    
    const rightActions = (
        <>
            <ToolbarButton icon="upload" text="匯入" onClick={() => setIsImportModalOpen(true)} />
            <ToolbarButton icon="download" text="匯出" onClick={handleExport} />
            <ToolbarButton icon="settings-2" text="欄位設定" onClick={() => setIsColumnSettingsModalOpen(true)} />
            <ToolbarButton icon="plus" text="新增儀表板" primary onClick={() => setIsAddModalOpen(true)} />
        </>
    );
    
    const batchActions = (
        <ToolbarButton icon="trash-2" text="刪除" danger onClick={handleBatchDelete} />
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
                                           checked={isAllSelected} ref={el => { if(el) el.indeterminate = isIndeterminate; }} onChange={handleSelectAll} />
                                </th>
                                {visibleColumns.map(key => (
                                    <th key={key} scope="col" className="px-6 py-3">{ALL_COLUMNS.find(c => c.key === key)?.label || key}</th>
                                ))}
                                <th scope="col" className="px-6 py-3 text-center">操作</th>
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
                                    {visibleColumns.map(key => (
                                        <td key={key} className="px-6 py-4" onClick={() => key === 'name' && handleRowClick(d)}>
                                            {renderCellContent(d, key)}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 text-center space-x-1" onClick={e => e.stopPropagation()}>
                                        <button onClick={() => handleSetDefault(d.id)} className={`p-1.5 rounded-md ${defaultDashboard === d.id ? 'text-yellow-400 hover:bg-yellow-500/20' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`} title="設為首頁">
                                            <Icon name="star" className={`w-4 h-4 ${defaultDashboard === d.id ? 'fill-current' : ''}`} />
                                        </button>
                                        <button onClick={() => handleEditClick(d)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="編輯">
                                            <Icon name="edit-3" className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteClick(d)} className="p-1.5 rounded-md text-red-400 hover:bg-red-500/20 hover:text-red-300" title="刪除">
                                            <Icon name="trash-2" className="w-4 h-4" />
                                        </button>
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
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="確認刪除" width="w-1/3"
                   footer={<><button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-md">取消</button><button onClick={handleConfirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md">刪除</button></>}>
                <p>您確定要刪除儀表板 <strong className="text-amber-400">{deletingDashboard?.name}</strong> 嗎？</p>
                <p className="mt-2 text-slate-400">此操作無法復原。</p>
            </Modal>
            <ColumnSettingsModal
                isOpen={isColumnSettingsModalOpen}
                onClose={() => setIsColumnSettingsModalOpen(false)}
                onSave={handleSaveColumnConfig}
                allColumns={ALL_COLUMNS}
                visibleColumnKeys={visibleColumns}
            />
            <UnifiedSearchModal
                page="dashboards"
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
                itemName="儀表板"
                importEndpoint="/dashboards/import"
                templateHeaders={['id', 'name', 'type', 'category', 'description', 'owner']}
                templateFilename="dashboards-template.csv"
            />
        </div>
    );
};

export default DashboardListPage;
