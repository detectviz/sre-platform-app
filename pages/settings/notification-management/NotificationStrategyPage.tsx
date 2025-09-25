import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { NotificationStrategy } from '../../../types';
import Icon from '../../../components/Icon';
import Toolbar, { ToolbarButton } from '../../../components/Toolbar';
import TableContainer from '../../../components/TableContainer';
import NotificationStrategyEditModal from '../../../components/NotificationStrategyEditModal';
import Modal from '../../../components/Modal';
import api from '../../../services/api';
import TableLoader from '../../../components/TableLoader';
import TableError from '../../../components/TableError';

const NotificationStrategyPage: React.FC = () => {
    const [strategies, setStrategies] = useState<NotificationStrategy[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStrategy, setEditingStrategy] = useState<NotificationStrategy | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingStrategy, setDeletingStrategy] = useState<NotificationStrategy | null>(null);

    const fetchStrategies = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get<NotificationStrategy[]>('/settings/notification-strategies');
            // Mock search since API doesn't support it yet
            const filtered = data.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
            setStrategies(filtered);
        } catch(err) {
            setError('無法獲取通知策略。');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        fetchStrategies();
    }, [fetchStrategies]);


    const handleNewStrategy = () => {
        setEditingStrategy(null);
        setIsModalOpen(true);
    };

    const handleEditStrategy = (strategy: NotificationStrategy) => {
        setEditingStrategy(strategy);
        setIsModalOpen(true);
    };

    const handleDuplicateStrategy = (strategy: NotificationStrategy) => {
        const { id, ...rest } = strategy;
        setEditingStrategy({
            ...rest,
            name: `Copy of ${strategy.name}`,
        } as NotificationStrategy);
        setIsModalOpen(true);
    };
    
    const handleSaveStrategy = async (strategyDataFromModal: NotificationStrategy) => {
        try {
            if (editingStrategy && editingStrategy.id) {
                await api.patch(`/settings/notification-strategies/${editingStrategy.id}`, strategyDataFromModal);
            } else {
                await api.post('/settings/notification-strategies', strategyDataFromModal);
            }
            fetchStrategies();
        } catch(err) {
            alert('Failed to save strategy.');
        } finally {
            setIsModalOpen(false);
            setEditingStrategy(null);
        }
    };

    const handleDeleteClick = (strategy: NotificationStrategy) => {
        setDeletingStrategy(strategy);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (deletingStrategy) {
            try {
                await api.del(`/settings/notification-strategies/${deletingStrategy.id}`);
                fetchStrategies();
            } catch (err) {
                alert('Failed to delete strategy.');
            } finally {
                setIsDeleteModalOpen(false);
                setDeletingStrategy(null);
            }
        }
    };
    
    const handleToggleEnable = async (strategy: NotificationStrategy) => {
        try {
            await api.patch(`/settings/notification-strategies/${strategy.id}`, { ...strategy, enabled: !strategy.enabled });
            fetchStrategies();
        } catch(err) {
            alert('Failed to toggle strategy status.');
        }
    };

    const leftActions = (
         <div className="relative">
            <Icon name="search" className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
                type="text" 
                placeholder="搜尋策略..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-64 bg-slate-800/80 border border-slate-700 rounded-md pl-9 pr-4 py-1.5 text-sm"
            />
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            <Toolbar
                leftActions={leftActions}
                rightActions={<ToolbarButton icon="plus" text="新增策略" primary onClick={handleNewStrategy} />}
            />
            <TableContainer>
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="px-6 py-3"></th>
                                <th scope="col" className="px-6 py-3">策略名稱</th>
                                <th scope="col" className="px-6 py-3">觸發條件</th>
                                <th scope="col" className="px-6 py-3">管道數</th>
                                <th scope="col" className="px-6 py-3">優先級</th>
                                <th scope="col" className="px-6 py-3">創建者</th>
                                <th scope="col" className="px-6 py-3">最後更新</th>
                                <th scope="col" className="px-6 py-3 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={8} />
                            ) : error ? (
                                <TableError colSpan={8} message={error} onRetry={fetchStrategies} />
                            ) : strategies.map((strategy) => (
                                <tr key={strategy.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                                    <td className="px-6 py-4">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={strategy.enabled} className="sr-only peer" onChange={() => handleToggleEnable(strategy)} />
                                            <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-sky-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                                        </label>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-white">{strategy.name}</td>
                                    <td className="px-6 py-4 font-mono text-xs">{strategy.triggerCondition}</td>
                                    <td className="px-6 py-4">{strategy.channelCount}</td>
                                    <td className="px-6 py-4">{strategy.priority}</td>
                                    <td className="px-6 py-4">{strategy.creator}</td>
                                    <td className="px-6 py-4">{strategy.lastUpdated}</td>
                                    <td className="px-6 py-4 text-center space-x-1">
                                        <button onClick={() => handleEditStrategy(strategy)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="編輯"><Icon name="edit-3" className="w-4 h-4" /></button>
                                        <button onClick={() => handleDuplicateStrategy(strategy)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="複製"><Icon name="copy" className="w-4 h-4" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(strategy); }} className="p-1.5 rounded-md text-red-400 hover:bg-red-500/20 hover:text-red-300" title="刪除"><Icon name="trash-2" className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </TableContainer>
            {isModalOpen && (
                <NotificationStrategyEditModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveStrategy}
                    strategy={editingStrategy}
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
                <p>您確定要刪除策略 <strong className="text-amber-400">{deletingStrategy?.name}</strong> 嗎？</p>
                <p className="mt-2 text-slate-400">此操作無法復原。</p>
            </Modal>
        </div>
    );
};

export default NotificationStrategyPage;