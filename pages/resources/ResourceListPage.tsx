import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Resource, ResourceFilters } from '../../types';
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

const ResourceListPage: React.FC = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalResources, setTotalResources] = useState(0);

    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [filters, setFilters] = useState<ResourceFilters>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<Resource | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingResource, setDeletingResource] = useState<Resource | null>(null);
    
    const { resourceId } = useParams<{ resourceId: string }>();
    const navigate = useNavigate();

    const fetchResources = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                page_size: pageSize,
                ...filters,
            };
            const { data } = await api.get<{ items: Resource[], total: number }>('/resources', { params });
            setResources(data.items);
            setTotalResources(data.total);
        } catch (err) {
            setError('無法獲取資源列表。');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, filters]);
    
    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    const selectedResourceForDrawer = useMemo(() => {
        // Find in local state first, would be a separate API call in real app
        return resources.find(res => res.id === resourceId);
    }, [resourceId, resources]);

    const handleViewDetails = (id: string) => {
        navigate(`/resources/${id}`);
    };

    const handleCloseDrawer = () => {
        navigate('/resources');
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
            } else {
                await api.post('/resources', resourceData);
            }
            setIsEditModalOpen(false);
            fetchResources();
        } catch (err) {
            alert('Failed to save resource.');
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
                setIsDeleteModalOpen(false);
                setDeletingResource(null);
                fetchResources();
            } catch (err) {
                alert('Failed to delete resource.');
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
            setSelectedIds([]);
            fetchResources();
        } catch (err) {
            alert('Failed to delete selected resources.');
        }
    };
    
    const leftActions = (
         <ToolbarButton icon="search" text="搜索和篩選" onClick={() => setIsSearchModalOpen(true)} />
    );
    
    const batchActions = (
        <ToolbarButton icon="trash-2" text="刪除" danger onClick={handleBatchDelete} />
    );

    return (
        <div className="h-full flex flex-col">
            <Toolbar 
                leftActions={leftActions}
                rightActions={
                    <>
                        <ToolbarButton icon="upload" text="匯入" disabled title="功能開發中" />
                        <ToolbarButton icon="download" text="匯出" disabled title="功能開發中" />
                        <ToolbarButton icon="settings-2" text="欄位設定" disabled title="功能開發中" />
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
                                <th scope="col" className="px-6 py-3">狀態</th>
                                <th scope="col" className="px-6 py-3">名稱</th>
                                <th scope="col" className="px-6 py-3">類型</th>
                                <th scope="col" className="px-6 py-3">提供商 / 區域</th>
                                <th scope="col" className="px-6 py-3">擁有者</th>
                                <th scope="col" className="px-6 py-3">最後簽入</th>
                                <th scope="col" className="px-6 py-3 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={8} />
                            ) : error ? (
                                <TableError colSpan={8} message={error} onRetry={fetchResources} />
                            ) : resources.map((res) => (
                                <tr key={res.id} className={`border-b border-slate-800 ${selectedIds.includes(res.id) ? 'bg-sky-900/50' : 'hover:bg-slate-800/40'}`}>
                                    <td className="p-4 w-12">
                                        <input type="checkbox"
                                               className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600 rounded"
                                               checked={selectedIds.includes(res.id)} onChange={(e) => handleSelectOne(e, res.id)} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusPill(res.status)}`}>
                                            <span className={`w-2 h-2 mr-2 rounded-full ${res.status === 'healthy' ? 'bg-green-400' : res.status === 'warning' ? 'bg-yellow-400' : res.status === 'critical' ? 'bg-red-400' : 'bg-slate-400'}`}></span>
                                            {res.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-white">{res.name}</td>
                                    <td className="px-6 py-4">{res.type}</td>
                                    <td className="px-6 py-4">{res.provider} / {res.region}</td>
                                    <td className="px-6 py-4">{res.owner}</td>
                                    <td className="px-6 py-4">{res.lastCheckIn}</td>
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
                title={selectedResourceForDrawer ? `${selectedResourceForDrawer.name}` : "載入中..."}
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
        </div>
    );
};

export default ResourceListPage;
