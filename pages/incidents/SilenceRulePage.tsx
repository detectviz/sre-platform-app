import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { SilenceRule } from '../../types';
import Icon from '../../components/Icon';
import SilenceRuleEditModal from '../../components/SilenceRuleEditModal';
import UnifiedSearchModal, { SilenceRuleFilters } from '../../components/UnifiedSearchModal';
import Toolbar, { ToolbarButton } from '../../components/Toolbar';
import TableContainer from '../../components/TableContainer';
import Modal from '../../components/Modal';
import api from '../../services/api';
import TableLoader from '../../components/TableLoader';
import TableError from '../../components/TableError';
import { exportToCsv } from '../../services/export';
import ImportFromCsvModal from '../../components/ImportFromCsvModal';
import ColumnSettingsModal, { TableColumn } from '../../components/ColumnSettingsModal';
import { showToast } from '../../services/toast';

const ALL_COLUMNS: TableColumn[] = [
    { key: 'enabled', label: '' },
    { key: 'name', label: '規則名稱' },
    { key: 'type', label: '類型' },
    { key: 'matchers', label: '靜音條件' },
    { key: 'schedule', label: '排程' },
    { key: 'creator', label: '創建者' },
    { key: 'createdAt', label: '創建時間' },
];
const PAGE_KEY = 'silence_rules';

const SilenceRulePage: React.FC = () => {
    const [rules, setRules] = useState<SilenceRule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<SilenceRule | null>(null);
    const [deletingRule, setDeletingRule] = useState<SilenceRule | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [filters, setFilters] = useState<SilenceRuleFilters>({});
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isColumnSettingsModalOpen, setIsColumnSettingsModalOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

    const fetchRules = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [rulesRes, columnsRes] = await Promise.all([
                api.get<SilenceRule[]>('/silence-rules'),
                api.get<string[]>(`/settings/column-config/${PAGE_KEY}`)
            ]);
            setRules(rulesRes.data);
            setVisibleColumns(columnsRes.data.length > 0 ? columnsRes.data : ALL_COLUMNS.map(c => c.key));
        } catch (err) {
            setError('無法獲取靜音規則。');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRules();
    }, [fetchRules]);

    const handleSaveColumnConfig = async (newColumnKeys: string[]) => {
        try {
            await api.put(`/settings/column-config/${PAGE_KEY}`, newColumnKeys);
            setVisibleColumns(newColumnKeys);
            showToast('欄位設定已儲存。', 'success');
        } catch (err) {
            showToast('無法儲存欄位設定。', 'error');
        } finally {
            setIsColumnSettingsModalOpen(false);
        }
    };

    const handleNewRule = () => {
        setEditingRule(null);
        setIsModalOpen(true);
    };

    const handleEditRule = (rule: SilenceRule) => {
        setEditingRule(rule);
        setIsModalOpen(true);
    };

    const handleSaveRule = async (savedRule: SilenceRule) => {
        try {
            if (editingRule) {
                await api.patch(`/silence-rules/${savedRule.id}`, savedRule);
            } else {
                await api.post('/silence-rules', savedRule);
            }
            fetchRules();
        } catch (err) {
            alert('Failed to save rule.');
        } finally {
            setIsModalOpen(false);
            setEditingRule(null);
        }
    };

    const handleDeleteClick = (rule: SilenceRule) => {
        setDeletingRule(rule);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (deletingRule) {
            try {
                await api.del(`/silence-rules/${deletingRule.id}`);
                fetchRules();
            } catch (err) {
                alert('Failed to delete rule.');
            } finally {
                setIsDeleteModalOpen(false);
                setDeletingRule(null);
            }
        }
    };

    const handleToggleEnable = async (rule: SilenceRule) => {
        try {
            await api.patch(`/silence-rules/${rule.id}`, { ...rule, enabled: !rule.enabled });
            fetchRules();
        } catch (err) {
            alert('Failed to toggle rule status.');
        }
    };

    const filteredRules = useMemo(() => {
        return rules.filter(rule => {
            if (filters.keyword && !rule.name.toLowerCase().includes(filters.keyword.toLowerCase())) return false;
            if (filters.type && rule.type !== filters.type) return false;
            if (filters.enabled !== undefined && rule.enabled !== filters.enabled) return false;
            return true;
        });
    }, [rules, filters]);

    const handleExport = () => {
        if (filteredRules.length === 0) {
            alert("沒有可匯出的資料。");
            return;
        }
        exportToCsv({
            filename: `silence-rules-${new Date().toISOString().split('T')[0]}.csv`,
            headers: ['id', 'name', 'enabled', 'type', 'creator', 'createdAt'],
            data: filteredRules.map(r => ({ ...r, matchers: JSON.stringify(r.matchers), schedule: JSON.stringify(r.schedule) })),
        });
    };
    
    const renderCellContent = (rule: SilenceRule, columnKey: string) => {
        switch(columnKey) {
            case 'enabled':
                return (
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={rule.enabled} className="sr-only peer" onChange={() => handleToggleEnable(rule)} />
                        <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-sky-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                    </label>
                );
            case 'name': return <span className="font-medium text-white">{rule.name}</span>;
            case 'type': return <span className="capitalize">{rule.type}</span>;
            case 'matchers': return <code className="text-xs">{rule.matchers.map(m => `${m.key}${m.operator}"${m.value}"`).join(', ')}</code>;
            case 'schedule':
                 if (rule.schedule.type === 'single') return `${rule.schedule.startsAt} -> ${rule.schedule.endsAt}`;
                 if (rule.schedule.type === 'recurring') return `Cron: ${rule.schedule.cron}`;
                 return 'N/A';
            case 'creator': return rule.creator;
            case 'createdAt': return rule.createdAt;
            default: return null;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <Toolbar
                leftActions={<ToolbarButton icon="search" text="搜索和篩選" onClick={() => setIsSearchModalOpen(true)} />}
                rightActions={
                    <>
                        <ToolbarButton icon="upload" text="匯入" onClick={() => setIsImportModalOpen(true)} />
                        <ToolbarButton icon="download" text="匯出" onClick={handleExport} />
                        <ToolbarButton icon="settings-2" text="欄位設定" onClick={() => setIsColumnSettingsModalOpen(true)} />
                        <ToolbarButton icon="plus" text="新增規則" primary onClick={handleNewRule} />
                    </>
                }
            />
            <TableContainer>
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0 z-10">
                            <tr>
                                {visibleColumns.map(key => (
                                    <th key={key} scope="col" className="px-6 py-3">{ALL_COLUMNS.find(c => c.key === key)?.label || key}</th>
                                ))}
                                <th scope="col" className="px-6 py-3 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={visibleColumns.length + 1} />
                            ) : error ? (
                                <TableError colSpan={visibleColumns.length + 1} message={error} onRetry={fetchRules} />
                            ) : filteredRules.map((rule) => (
                                <tr key={rule.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                                    {visibleColumns.map(key => (
                                        <td key={key} className="px-6 py-4">{renderCellContent(rule, key)}</td>
                                    ))}
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => handleEditRule(rule)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="編輯"><Icon name="edit-3" className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteClick(rule)} className="p-1.5 rounded-md text-red-400 hover:bg-red-500/20 hover:text-red-300" title="刪除"><Icon name="trash-2" className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </TableContainer>
            {isModalOpen && <SilenceRuleEditModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveRule} rule={editingRule} />}
            <UnifiedSearchModal
                page="silence-rules"
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onSearch={(newFilters) => {
                    setFilters(newFilters as SilenceRuleFilters);
                    setIsSearchModalOpen(false);
                }}
                initialFilters={filters}
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
                <p>您確定要刪除靜音規則 <strong className="text-amber-400">{deletingRule?.name}</strong> 嗎？</p>
                <p className="mt-2 text-slate-400">此操作無法復原。</p>
            </Modal>
             <ColumnSettingsModal
                isOpen={isColumnSettingsModalOpen}
                onClose={() => setIsColumnSettingsModalOpen(false)}
                onSave={handleSaveColumnConfig}
                allColumns={ALL_COLUMNS}
                visibleColumnKeys={visibleColumns}
            />
            <ImportFromCsvModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImportSuccess={fetchRules}
                itemName="靜音規則"
                importEndpoint="/silence-rules/import"
                templateHeaders={['id', 'name', 'enabled', 'type', 'creator']}
                templateFilename="silence-rules-template.csv"
            />
        </div>
    );
};

export default SilenceRulePage;
