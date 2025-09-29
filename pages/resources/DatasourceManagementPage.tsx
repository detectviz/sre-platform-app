import React, { useState, useEffect, useCallback } from 'react';
import { Datasource, DatasourceFilters } from '../../types';
import Icon from '../../components/Icon';
import Toolbar, { ToolbarButton } from '../../components/Toolbar';
import TableContainer from '../../components/TableContainer';
import Modal from '../../components/Modal';
import api from '../../services/api';
import TableLoader from '../../components/TableLoader';
import TableError from '../../components/TableError';
import { showToast } from '../../services/toast';
import DatasourceEditModal from '../../components/DatasourceEditModal';

const DatasourceManagementPage: React.FC = () => {
    const [datasources, setDatasources] = useState<Datasource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<DatasourceFilters>({});
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDatasource, setEditingDatasource] = useState<Datasource | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingDatasource, setDeletingDatasource] = useState<Datasource | null>(null);

    const fetchDatasources = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get<Datasource[]>('/resources/datasources', { params: filters });
            setDatasources(data);
        } catch (err) {
            setError('無法獲取 Datasource 列表。');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchDatasources();
    }, [fetchDatasources]);

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
        if (deletingDatasource) {
            try {
                await api.del(`/resources/datasources/${deletingDatasource.id}`);
                showToast(`Datasource "${deletingDatasource.name}" 已成功刪除。`, 'success');
                fetchDatasources();
            } catch (err) {
                showToast('刪除 Datasource 失敗。', 'error');
            } finally {
                setIsDeleteModalOpen(false);
                setDeletingDatasource(null);
            }
        }
    };
    
    const handleSave = async (ds: Partial<Datasource>) => {
        try {
            if (ds.id) {
                await api.patch(`/resources/datasources/${ds.id}`, ds);
                showToast('Datasource 已成功更新。', 'success');
            } else {
                await api.post('/resources/datasources', ds);
                showToast('Datasource 已成功新增。', 'success');
            }
            fetchDatasources();
        } catch (err) {
            showToast('儲存 Datasource 失敗。', 'error');
        } finally {
            setIsEditModalOpen(false);
        }
    };
    
    const handleTestConnection = async (ds: Datasource) => {
        showToast(`正在測試對 "${ds.name}" 的連線...`, 'success');
        try {
            const { data } = await api.post<{ success: boolean; message: string }>(`/resources/datasources/${ds.id}/test`);
            showToast(data.message, data.success ? 'success' : 'error');
            fetchDatasources(); // Refetch to update status
        } catch (err) {
            showToast('連線測試失敗。', 'error');
        }
    };

    const getStatusIndicator = (status: Datasource['status']) => {
        switch (status) {
            case 'ok': return <div className="flex items-center text-green-400"><Icon name="check-circle" className="w-4 h-4 mr-2" /> 正常</div>;
            case 'error': return <div className="flex items-center text-red-400"><Icon name="x-circle" className="w-4 h-4 mr-2" /> 失敗</div>;
            case 'pending': return <div className="flex items-center text-yellow-400 animate-pulse"><Icon name="loader-circle" className="w-4 h-4 mr-2 animate-spin" /> 測試中...</div>;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <Toolbar 
                rightActions={
                    <ToolbarButton icon="plus" text="新增 Datasource" primary onClick={handleNew} />
                }
            />
            <TableContainer>
                <div className="h-full overflow-y-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3">名稱</th>
                                <th className="px-6 py-3">類型</th>
                                <th className="px-6 py-3">連線狀態</th>
                                <th className="px-6 py-3">建立時間</th>
                                <th className="px-6 py-3 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={5} />
                            ) : error ? (
                                <TableError colSpan={5} message={error} onRetry={fetchDatasources} />
                            ) : datasources.map((ds) => (
                                <tr key={ds.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                                    <td className="px-6 py-4 font-medium text-white">{ds.name}</td>
                                    <td className="px-6 py-4">{ds.type}</td>
                                    <td className="px-6 py-4">{getStatusIndicator(ds.status)}</td>
                                    <td className="px-6 py-4">{ds.createdAt}</td>
                                    <td className="px-6 py-4 text-center space-x-1">
                                        <button onClick={() => handleTestConnection(ds)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="測試連線"><Icon name="plug-zap" className="w-4 h-4" /></button>
                                        <button onClick={() => handleEdit(ds)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="編輯"><Icon name="edit-3" className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(ds)} className="p-1.5 rounded-md text-red-400 hover:bg-red-500/20 hover:text-red-300" title="刪除"><Icon name="trash-2" className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
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
                title="確認刪除 Datasource"
                width="w-1/3"
                footer={
                    <div className="flex justify-end space-x-2">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-md">取消</button>
                        <button onClick={handleConfirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md">刪除</button>
                    </div>
                }
            >
                <p>您確定要刪除 Datasource <strong className="text-amber-400">{deletingDatasource?.name}</strong> 嗎？</p>
                <p className="mt-2 text-slate-400">此操作無法復原。</p>
            </Modal>
        </div>
    );
};

export default DatasourceManagementPage;