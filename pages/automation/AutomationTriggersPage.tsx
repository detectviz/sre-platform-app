import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MOCK_PLAYBOOKS } from '../../constants';
import { AutomationTrigger, TriggerType } from '../../types';
import Icon from '../../components/Icon';
import Toolbar, { ToolbarButton } from '../../components/Toolbar';
import TableContainer from '../../components/TableContainer';
import AutomationTriggerEditModal from '../../components/AutomationTriggerEditModal';
import Modal from '../../components/Modal';
import api from '../../services/api';

const AutomationTriggersPage: React.FC = () => {
    const [triggers, setTriggers] = useState<AutomationTrigger[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTrigger, setEditingTrigger] = useState<AutomationTrigger | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingTrigger, setDeletingTrigger] = useState<AutomationTrigger | null>(null);

    const fetchTriggers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get<AutomationTrigger[]>('/automation/triggers');
            setTriggers(data);
        } catch (err) {
            setError('Failed to fetch triggers.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTriggers();
    }, [fetchTriggers]);

    const handleNewTrigger = () => {
        setEditingTrigger(null);
        setIsModalOpen(true);
    };

    const handleEditTrigger = (trigger: AutomationTrigger) => {
        setEditingTrigger(trigger);
        setIsModalOpen(true);
    };

    const handleSaveTrigger = async (triggerData: Partial<AutomationTrigger>) => {
        try {
            if (editingTrigger) {
                await api.patch(`/automation/triggers/${editingTrigger.id}`, triggerData);
            } else {
                await api.post('/automation/triggers', triggerData);
            }
            fetchTriggers();
        } catch (err) {
            alert('Failed to save trigger.');
        } finally {
            setIsModalOpen(false);
        }
    };
    
    const handleDeleteClick = (trigger: AutomationTrigger) => {
        setDeletingTrigger(trigger);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (deletingTrigger) {
            try {
                await api.del(`/automation/triggers/${deletingTrigger.id}`);
                fetchTriggers();
            } catch (err) {
                alert('Failed to delete trigger.');
            } finally {
                setIsDeleteModalOpen(false);
                setDeletingTrigger(null);
            }
        }
    };
    
    const handleToggleEnable = async (trigger: AutomationTrigger) => {
        try {
            await api.patch(`/automation/triggers/${trigger.id}`, { ...trigger, enabled: !trigger.enabled });
            fetchTriggers();
        } catch (err) {
            alert('Failed to toggle trigger status.');
        }
    };

    const getTriggerTypePill = (type: TriggerType) => {
        switch (type) {
            case 'Schedule': return 'bg-blue-500/20 text-blue-300';
            case 'Webhook': return 'bg-purple-500/20 text-purple-300';
            case 'Event': return 'bg-amber-500/20 text-amber-300';
        }
    };
    
    const findPlaybookName = (playbookId: string) => MOCK_PLAYBOOKS.find(p => p.id === playbookId)?.name || 'Unknown Playbook';
    
    const filteredTriggers = useMemo(() => {
        return triggers.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [triggers, searchTerm]);

    return (
        <div className="h-full flex flex-col">
            <Toolbar
                leftActions={
                    <div className="relative">
                        <Icon name="search" className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input type="text" placeholder="搜尋觸發器..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                               className="w-64 bg-slate-800/80 border border-slate-700 rounded-md pl-9 pr-4 py-1.5 text-sm" />
                    </div>
                }
                rightActions={<ToolbarButton icon="plus" text="新增觸發器" primary onClick={handleNewTrigger} />}
            />
            <TableContainer>
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="px-6 py-3"></th>
                                <th scope="col" className="px-6 py-3">名稱</th>
                                <th scope="col" className="px-6 py-3">類型</th>
                                <th scope="col" className="px-6 py-3">目標腳本</th>
                                <th scope="col" className="px-6 py-3">上次觸發</th>
                                <th scope="col" className="px-6 py-3 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center py-10"><Icon name="loader-circle" className="w-6 h-6 animate-spin inline-block"/></td></tr>
                            ) : error ? (
                                <tr><td colSpan={6} className="text-center py-10 text-red-400">{error}</td></tr>
                            ) : filteredTriggers.map((trigger) => (
                                <tr key={trigger.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                                    <td className="px-6 py-4">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={trigger.enabled} className="sr-only peer" onChange={() => handleToggleEnable(trigger)} />
                                            <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-sky-600 peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                        </label>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-white">{trigger.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getTriggerTypePill(trigger.type)}`}>
                                            {trigger.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{findPlaybookName(trigger.targetPlaybookId)}</td>
                                    <td className="px-6 py-4">{trigger.lastTriggered}</td>
                                    <td className="px-6 py-4 text-center space-x-1">
                                        <button onClick={() => handleEditTrigger(trigger)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="編輯"><Icon name="edit-3" className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteClick(trigger)} className="p-1.5 rounded-md text-red-400 hover:bg-red-500/20 hover:text-red-300" title="刪除"><Icon name="trash-2" className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </TableContainer>
            {isModalOpen && (
                <AutomationTriggerEditModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveTrigger}
                    trigger={editingTrigger}
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
                <p>您確定要刪除觸發器 <strong className="text-amber-400">{deletingTrigger?.name}</strong> 嗎？</p>
                <p className="mt-2 text-slate-400">此操作無法復原。</p>
            </Modal>
        </div>
    );
};

export default AutomationTriggersPage;
