import React, { useState, useEffect, useCallback } from 'react';
import { AutomationPlaybook } from '../../types';
import Icon from '../../components/Icon';
import TableContainer from '../../components/TableContainer';
import RunPlaybookModal from '../../components/RunPlaybookModal';
import Toolbar, { ToolbarButton } from '../../components/Toolbar';
import AutomationPlaybookEditModal from '../../components/AutomationPlaybookEditModal';
import Modal from '../../components/Modal';
import api from '../../services/api';
import TableLoader from '../../components/TableLoader';
import TableError from '../../components/TableError';
import ColumnSettingsModal, { TableColumn } from '../../components/ColumnSettingsModal';
import { usePageMetadata } from '../../contexts/PageMetadataContext';
import { showToast } from '../../services/toast';

const ALL_COLUMNS: TableColumn[] = [
    { key: 'name', label: '腳本名稱' },
    { key: 'trigger', label: '觸發器' },
    { key: 'lastRunStatus', label: '上次運行狀態' },
    { key: 'lastRun', label: '上次運行時間' },
    { key: 'runCount', label: '運行次數' },
];
const PAGE_IDENTIFIER = 'automation_playbooks';

const AutomationPlaybooksPage: React.FC = () => {
    const [playbooks, setPlaybooks] = useState<AutomationPlaybook[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isRunModalOpen, setIsRunModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [runningPlaybook, setRunningPlaybook] = useState<AutomationPlaybook | null>(null);
    const [editingPlaybook, setEditingPlaybook] = useState<AutomationPlaybook | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingPlaybook, setDeletingPlaybook] = useState<AutomationPlaybook | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isColumnSettingsModalOpen, setIsColumnSettingsModalOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
    
    const { metadata: pageMetadata } = usePageMetadata();
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.columnConfigKey;

    const fetchPlaybooks = useCallback(async () => {
        if (!pageKey) return;
        setIsLoading(true);
        setError(null);
        try {
            const [playbooksRes, columnsRes] = await Promise.all([
                 api.get<AutomationPlaybook[]>('/automation/scripts'),
                 api.get<string[]>(`/settings/column-config/${pageKey}`)
            ]);
            setPlaybooks(playbooksRes.data);
            setVisibleColumns(columnsRes.data.length > 0 ? columnsRes.data : ALL_COLUMNS.map(c => c.key));
        } catch (err) {
            setError('無法獲取自動化腳本。');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [pageKey]);

    useEffect(() => {
        if (pageKey) {
            fetchPlaybooks();
        }
    }, [fetchPlaybooks, pageKey]);

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

    const handleRunClick = (playbook: AutomationPlaybook) => {
        setRunningPlaybook(playbook);
        setIsRunModalOpen(true);
    };

    const handleNewPlaybook = () => {
        setEditingPlaybook(null);
        setIsEditModalOpen(true);
    };

    const handleEditPlaybook = (playbook: AutomationPlaybook) => {
        setEditingPlaybook(playbook);
        setIsEditModalOpen(true);
    };
    
    const handleSavePlaybook = async (playbookData: Partial<AutomationPlaybook>) => {
        try {
            if (editingPlaybook) {
                 await api.patch(`/automation/scripts/${editingPlaybook.id}`, playbookData);
            } else {
                await api.post('/automation/scripts', playbookData);
            }
            setIsEditModalOpen(false);
            fetchPlaybooks();
        } catch (err) {
            alert('Failed to save playbook.');
        }
    };

    const handleDeleteClick = (playbook: AutomationPlaybook) => {
        setDeletingPlaybook(playbook);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (deletingPlaybook) {
            try {
                await api.del(`/automation/scripts/${deletingPlaybook.id}`);
                setIsDeleteModalOpen(false);
                setDeletingPlaybook(null);
                fetchPlaybooks();
            } catch (err) {
                alert('Failed to delete playbook.');
            }
        }
    };
    
    const handleBatchDelete = async () => {
        try {
            await api.post('/automation/scripts/batch-actions', { action: 'delete', ids: selectedIds });
            setSelectedIds([]);
            fetchPlaybooks();
        } catch (err) {
            alert('Failed to delete selected playbooks.');
        }
    };

    const getStatusPill = (status: AutomationPlaybook['lastRunStatus']) => {
        switch (status) {
            case 'success': return 'bg-green-500/20 text-green-400';
            case 'failed': return 'bg-red-500/20 text-red-400';
            case 'running': return 'bg-sky-500/20 text-sky-400 animate-pulse';
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedIds(e.target.checked ? playbooks.map(p => p.id) : []);
    };
    
    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        setSelectedIds(prev => e.target.checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id));
    };

    const isAllSelected = playbooks.length > 0 && selectedIds.length === playbooks.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < playbooks.length;

    const batchActions = (
        <ToolbarButton icon="trash-2" text="刪除" danger onClick={handleBatchDelete} />
    );
    
    const renderCellContent = (pb: AutomationPlaybook, columnKey: string) => {
        switch (columnKey) {
            case 'name':
                return (
                    <>
                        <div className="font-medium text-white">{pb.name}</div>
                        <p className="text-xs text-slate-400 font-normal">{pb.description}</p>
                    </>
                );
            case 'trigger':
                return pb.trigger;
            case 'lastRunStatus':
                return (
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusPill(pb.lastRunStatus)}`}>
                        {pb.lastRunStatus}
                    </span>
                );
            case 'lastRun':
                return pb.lastRun;
            case 'runCount':
                return pb.runCount;
            default:
                return null;
        }
    };


    return (
        <div className="h-full flex flex-col">
            <Toolbar 
                rightActions={
                    <>
                        <ToolbarButton icon="settings-2" text="欄位設定" onClick={() => setIsColumnSettingsModalOpen(true)} />
                        <ToolbarButton icon="plus" text="新增腳本" primary onClick={handleNewPlaybook} />
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
                                <TableError colSpan={visibleColumns.length + 2} message={error} onRetry={fetchPlaybooks} />
                            ) : playbooks.map((pb) => (
                                <tr key={pb.id} className={`border-b border-slate-800 ${selectedIds.includes(pb.id) ? 'bg-sky-900/50' : 'hover:bg-slate-800/40'}`}>
                                     <td className="p-4 w-12">
                                        <input type="checkbox" className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600"
                                               checked={selectedIds.includes(pb.id)} onChange={(e) => handleSelectOne(e, pb.id)} />
                                    </td>
                                    {visibleColumns.map(key => (
                                        <td key={key} className="px-6 py-4">{renderCellContent(pb, key)}</td>
                                    ))}
                                    <td className="px-6 py-4 text-center space-x-1">
                                        <button onClick={() => handleRunClick(pb)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="運行">
                                            <Icon name="play" className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleEditPlaybook(pb)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="編輯">
                                            <Icon name="edit-3" className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteClick(pb)} className="p-1.5 rounded-md text-red-400 hover:bg-red-500/20 hover:text-red-300" title="刪除">
                                            <Icon name="trash-2" className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </TableContainer>
            <RunPlaybookModal 
                isOpen={isRunModalOpen} 
                onClose={() => setIsRunModalOpen(false)}
                playbook={runningPlaybook}
                onRunSuccess={fetchPlaybooks}
            />
            {isEditModalOpen && (
                 <AutomationPlaybookEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSavePlaybook}
                    playbook={editingPlaybook}
                />
            )}
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
                <p>您確定要刪除腳本 <strong className="text-amber-400">{deletingPlaybook?.name}</strong> 嗎？</p>
                <p className="mt-2 text-slate-400">此操作無法復原。</p>
            </Modal>
            <ColumnSettingsModal
                isOpen={isColumnSettingsModalOpen}
                onClose={() => setIsColumnSettingsModalOpen(false)}
                onSave={handleSaveColumnConfig}
                allColumns={ALL_COLUMNS}
                visibleColumnKeys={visibleColumns}
            />
        </div>
    );
};

export default AutomationPlaybooksPage;