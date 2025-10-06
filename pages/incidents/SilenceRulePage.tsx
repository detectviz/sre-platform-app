import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { SilenceRule, TableColumn, RuleAnalysisReport } from '../../types';
import Icon from '../../components/Icon';
import SilenceRuleEditModal from '../../components/SilenceRuleEditModal';
import UnifiedSearchModal, { SilenceRuleFilters } from '../../components/UnifiedSearchModal';
import Toolbar, { ToolbarButton } from '../../components/Toolbar';
import TableContainer from '../../components/TableContainer';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import api from '../../services/api';
import TableLoader from '../../components/TableLoader';
import TableError from '../../components/TableError';
import { exportToCsv } from '../../services/export';
import ImportFromCsvModal from '../../components/ImportFromCsvModal';
import ColumnSettingsModal from '../../components/ColumnSettingsModal';
import { showToast } from '../../services/toast';
import { usePageMetadata } from '../../contexts/PageMetadataContext';
import { useOptions } from '../../contexts/OptionsContext';
import RuleAnalysisModal from '../../components/RuleAnalysisModal';
import SortableColumnHeaderCell from '../../components/SortableColumnHeaderCell';
import useTableSorting from '../../hooks/useTableSorting';

const PAGE_IDENTIFIER = 'silence_rules';

const SilenceRulePage: React.FC = () => {
    const [rules, setRules] = useState<SilenceRule[]>([]);
    const [allColumns, setAllColumns] = useState<TableColumn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

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
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [analysisReport, setAnalysisReport] = useState<RuleAnalysisReport | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
    const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
    const [extendingRule, setExtendingRule] = useState<SilenceRule | null>(null);
    const [extendChoice, setExtendChoice] = useState<number>(60);
    const [isCustomExtend, setIsCustomExtend] = useState(false);
    const [customExtendMinutes, setCustomExtendMinutes] = useState(120);

    const { metadata: pageMetadata } = usePageMetadata();
    const { options } = useOptions();
    const silenceRuleOptions = options?.silence_rules;
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.column_config_key;
    const extendPresets = [
        { label: '30 分鐘', value: 30 },
        { label: '1 小時', value: 60 },
        { label: '4 小時', value: 240 },
    ];
    const extendOptions = [...extendPresets, { label: '自訂', value: -1 }];

    const { sortConfig, sortParams, handleSort } = useTableSorting({ defaultSortKey: 'created_at', defaultSortDirection: 'desc' });

    const fetchRules = useCallback(async () => {
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

            const [rulesRes, columnConfigRes, allColumnsRes] = await Promise.all([
                api.get<{ items: SilenceRule[], total: number }>('/silence-rules', { params }),
                api.get<string[]>(`/settings/column-config/${pageKey}`),
                api.get<TableColumn[]>(`/pages/columns/${pageKey}`)
            ]);
            if (allColumnsRes.data.length === 0) {
                throw new Error('欄位定義缺失');
            }
            setRules(rulesRes.data.items);
            setTotal(rulesRes.data.total);
            setAllColumns(allColumnsRes.data);
            const resolvedVisibleColumns = columnConfigRes.data.length > 0
                ? columnConfigRes.data
                : allColumnsRes.data.map(c => c.key);
            setVisibleColumns(resolvedVisibleColumns);
        } catch (err) {
            setError('無法獲取靜音規則。');
        } finally {
            setIsLoading(false);
        }
    }, [filters, pageKey, currentPage, pageSize, sortParams]);

    useEffect(() => {
        if (pageKey) {
            fetchRules();
        }
    }, [fetchRules, pageKey]);

    useEffect(() => {
        setSelectedIds([]);
    }, [filters]);

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

    const handleNewRule = () => {
        setEditingRule(null);
        setIsModalOpen(true);
    };

    const handleEditRule = (rule: SilenceRule) => {
        setEditingRule(rule);
        setIsModalOpen(true);
    };

    const handleSaveRule = async (savedRule: Partial<SilenceRule>) => {
        try {
            if (savedRule.id) {
                await api.patch(`/silence-rules/${savedRule.id}`, savedRule);
                showToast(`規則 "${savedRule.name}" 已成功更新。`, 'success');
            } else {
                const { data: createdRule } = await api.post<SilenceRule>('/silence-rules', savedRule);
                showToast(`規則 "${createdRule.name}" 已成功新增。`, 'success');
                setCurrentPage(1); // Reset to first page when adding new item
            }
            fetchRules();
        } catch (err) {
            showToast('儲存規則失敗。', 'error');
        } finally {
            setIsModalOpen(false);
            setEditingRule(null);
        }
    };

    const handleExtendOptionSelect = (value: number) => {
        if (value === -1) {
            setIsCustomExtend(true);
        } else {
            setIsCustomExtend(false);
            setExtendChoice(value);
        }
    };

    const handleExtendRule = (rule: SilenceRule) => {
        setExtendingRule(rule);
        setExtendChoice(60);
        setCustomExtendMinutes(120);
        setIsCustomExtend(false);
        setIsExtendModalOpen(true);
    };

    const handleConfirmExtend = async () => {
        if (!extendingRule) {
            return;
        }
        const minutesToAdd = isCustomExtend ? customExtendMinutes : extendChoice;
        if (!minutesToAdd || minutesToAdd <= 0) {
            showToast('請輸入有效的延長時間。', 'error');
            return;
        }
        if ((extendingRule.schedule?.type || 'single') !== 'single') {
            showToast('週期性靜音請在編輯中調整排程設定。', 'info');
            setIsExtendModalOpen(false);
            setExtendingRule(null);
            return;
        }

        const currentEndsAt = extendingRule.schedule?.ends_at || dayjs().format('YYYY-MM-DDTHH:mm');
        const newEndsAt = dayjs(currentEndsAt).add(minutesToAdd, 'minute').format('YYYY-MM-DDTHH:mm');

        try {
            await api.patch(`/silence-rules/${extendingRule.id}`, {
                schedule: { ...extendingRule.schedule, ends_at: newEndsAt },
            });
            showToast(`靜音規則已延長 ${minutesToAdd} 分鐘。`, 'success');
            fetchRules();
        } catch (err) {
            showToast('延長靜音規則失敗。', 'error');
        } finally {
            setIsExtendModalOpen(false);
            setExtendingRule(null);
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
                showToast(`規則 "${deletingRule.name}" 已成功刪除。`, 'success');
                // Reset to first page if current page becomes empty
                if (rules.length === 1 && currentPage > 1) {
                    setCurrentPage(1);
                }
                fetchRules();
            } catch (err) {
                showToast('刪除規則失敗。', 'error');
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
            showToast('無法更新靜音規則狀態。', 'error');
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedIds(e.target.checked ? rules.map(r => r.id) : []);
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        setSelectedIds(prev => e.target.checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id));
    };

    const isAllSelected = rules.length > 0 && selectedIds.length === rules.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < rules.length;

    const handleBatchAction = async (action: 'enable' | 'disable' | 'delete') => {
        try {
            await api.post('/silence-rules/batch-actions', { action, ids: selectedIds });
            fetchRules();
        } catch (err) {
            showToast('批次操作失敗，請稍後再試。', 'error');
        } finally {
            setSelectedIds([]);
        }
    };

    const handleAIAnalysis = async () => {
        if (selectedIds.length === 0) {
            showToast('請先選擇至少一條靜音規則。', 'error');
            return;
        }
        setIsAnalysisModalOpen(true);
        setAnalysisReport(null);
        setAnalysisError(null);
        setIsAnalysisLoading(true);
        try {
            const { data } = await api.post<RuleAnalysisReport>('/ai/silence-rules/analyze', { rule_ids: selectedIds });
            setAnalysisReport(data);
        } catch (err: any) {
            const message = err?.response?.data?.message || '無法取得 AI 分析結果。';
            setAnalysisError(message);
        } finally {
            setIsAnalysisLoading(false);
        }
    };

    const handleExport = () => {
        if (rules.length === 0) {
            showToast('沒有可匯出的資料。', 'warning');
            return;
        }
        exportToCsv({
            filename: `silence-rules-${new Date().toISOString().split('T')[0]}.csv`,
            headers: ['id', 'name', 'enabled', 'type', 'creator', 'created_at'],
            data: rules.map(r => ({ ...r, matchers: JSON.stringify(r.matchers), schedule: JSON.stringify(r.schedule) })),
        });
    };

    const batchActions = (
        <>
            <ToolbarButton icon="brain-circuit" text="AI 分析" onClick={handleAIAnalysis} ai />
            <ToolbarButton icon="toggle-right" text="啟用" onClick={() => handleBatchAction('enable')} />
            <ToolbarButton icon="toggle-left" text="停用" onClick={() => handleBatchAction('disable')} />
            <ToolbarButton icon="trash-2" text="刪除" danger onClick={() => handleBatchAction('delete')} />
            <ToolbarButton icon="upload" text="匯入" onClick={() => setIsImportModalOpen(true)} />
            <ToolbarButton icon="download" text="匯出" onClick={handleExport} />
        </>
    );

    const renderCellContent = (rule: SilenceRule, columnKey: string) => {
        switch (columnKey) {
            case 'enabled':
                return (
                    <label className="relative inline-flex cursor-pointer items-center">
                        <input
                            type="checkbox"
                            checked={rule.enabled}
                            className="peer sr-only"
                            onChange={() => handleToggleEnable(rule)}
                            aria-label="切換靜音規則啟用狀態"
                        />
                        <div className="relative h-6 w-11 rounded-full bg-slate-700 transition-colors peer-focus:ring-2 peer-focus:ring-sky-600 peer-checked:bg-sky-500">
                            <div className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5"></div>
                        </div>
                    </label>
                );
            case 'name':
                return <span className="block max-w-[220px] truncate font-medium text-white" title={rule.name}>{rule.name}</span>;
            case 'type': {
                const typeDescriptor = silenceRuleOptions?.types.find(t => t.value === rule.type);
                const pillClass = typeDescriptor?.class_name || 'bg-slate-800/60 border border-slate-600 text-slate-200';
                const label = typeDescriptor?.label || rule.type;
                return (
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${pillClass}`}>
                        {label}
                    </span>
                );
            }
            case 'matchers':
                return (
                    <div className="flex flex-wrap gap-1">
                        {rule.matchers.map(m => (
                            <span key={`${m.key}-${m.operator}-${m.value}`} className="rounded-md bg-slate-800/60 px-2 py-1 text-xs font-mono text-slate-200">
                                {`${m.key} ${m.operator} "${m.value}"`}
                            </span>
                        ))}
                    </div>
                );
            case 'schedule':
                if (rule.schedule.type === 'single') {
                    const start = rule.schedule.starts_at ? dayjs(rule.schedule.starts_at).format('YYYY-MM-DD HH:mm') : '未設定';
                    const end = rule.schedule.ends_at ? dayjs(rule.schedule.ends_at).format('YYYY-MM-DD HH:mm') : '未設定';
                    return (
                        <div className="flex items-center text-sm text-white">
                            {start} - {end}
                        </div>
                    );
                }
                if (rule.schedule.type === 'recurring') {
                    return (
                        <div className="flex items-center text-sm text-white">
                            {rule.schedule.cron_description || rule.schedule.cron || 'N/A'}
                        </div>
                    );
                }
                return (
                    <div className="flex items-center text-sm text-slate-400">
                        無排程
                    </div>
                );
            case 'creator':
                return <span className="text-slate-200">{rule.creator}</span>;
            case 'created_at':
                return <span className="text-slate-400">{dayjs(rule.created_at).format('YYYY-MM-DD HH:mm')}</span>;
            default:
                return <span className="text-slate-400">--</span>;
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
                selectedCount={selectedIds.length}
                onClearSelection={() => setSelectedIds([])}
                batchActions={batchActions}
            />
            <TableContainer>
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="sticky top-0 z-10 bg-slate-800/50 text-xs uppercase text-slate-400">
                            <tr>
                                <th scope="col" className="w-12 px-4 py-3">
                                    <input type="checkbox" className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600"
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
                                            className="px-5"
                                        />
                                    );
                                })}
                                <th scope="col" className="px-5 py-3 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={visibleColumns.length + 2} />
                            ) : error ? (
                                <TableError colSpan={visibleColumns.length + 2} message={error} onRetry={fetchRules} />
                            ) : rules.map((rule) => (
                                <tr key={rule.id} className={`border-b border-slate-800 ${selectedIds.includes(rule.id) ? 'bg-sky-900/50' : 'hover:bg-slate-800/40'}`}>
                                    <td className="w-12 px-4 py-3 align-middle">
                                        <input type="checkbox" className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600"
                                            checked={selectedIds.includes(rule.id)} onChange={(e) => handleSelectOne(e, rule.id)} />
                                    </td>
                                    {visibleColumns.map(key => (
                                        <td key={key} className="px-5 py-3 align-middle">{renderCellContent(rule, key)}</td>
                                    ))}
                                    <td className="px-5 py-3 text-center align-middle">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button
                                                onClick={() => handleExtendRule(rule)}
                                                className="rounded-md px-2 py-1 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
                                                title="延長靜音"
                                                aria-label="延長靜音"
                                            >
                                                <Icon name="clock" className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleEditRule(rule)} className="rounded-md px-2 py-1 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white" title="編輯" aria-label="編輯靜音規則">
                                                <Icon name="edit-3" className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDeleteClick(rule)} className="rounded-md px-2 py-1 text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-200" title="刪除" aria-label="刪除靜音規則">
                                                <Icon name="trash-2" className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    total={total}
                    page={currentPage}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                />
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
            <Modal
                isOpen={isExtendModalOpen}
                onClose={() => setIsExtendModalOpen(false)}
                title="延長靜音時長"
                width="w-1/3"
                footer={
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsExtendModalOpen(false)} className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-600">取消</button>
                        <button onClick={handleConfirmExtend} className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700">確定延長</button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-300">選擇要在原結束時間後延長的時長。</p>
                    {extendingRule?.schedule?.ends_at && (
                        <p className="text-xs text-slate-500">目前結束時間：{dayjs(extendingRule.schedule.ends_at).format('YYYY-MM-DD HH:mm')}</p>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                        {extendOptions.map(opt => {
                            const isActive = opt.value === -1 ? isCustomExtend : (!isCustomExtend && extendChoice === opt.value);
                            return (
                                <button
                                    key={opt.label}
                                    type="button"
                                    onClick={() => {
                                        handleExtendOptionSelect(opt.value);
                                        if (opt.value !== -1) {
                                            setExtendChoice(opt.value);
                                        }
                                    }}
                                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${isActive ? 'border-sky-400 bg-sky-500/20 text-sky-100' : 'border-slate-700 bg-slate-900/40 text-slate-200 hover:border-slate-500 hover:bg-slate-800/60'}`}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                    {isCustomExtend && (
                        <div>
                            <label className="mb-1 block text-xs text-slate-400">自訂延長分鐘數</label>
                            <input
                                type="number"
                                min={15}
                                step={15}
                                value={customExtendMinutes}
                                onChange={e => setCustomExtendMinutes(Number(e.target.value))}
                                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                placeholder="輸入分鐘數，例如：90"
                            />
                            <p className="mt-2 text-xs text-slate-500">系統會在原結束時間後追加指定的分鐘數。</p>
                        </div>
                    )}
                </div>
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
                onImportSuccess={fetchRules}
                itemName="靜音規則"
                importEndpoint="/silence-rules/import"
                templateHeaders={['id', 'name', 'enabled', 'type', 'creator']}
                templateFilename="silence-rules-template.csv"
            />
            <RuleAnalysisModal
                isOpen={isAnalysisModalOpen}
                onClose={() => setIsAnalysisModalOpen(false)}
                title="AI 靜音規則分析"
                report={analysisReport}
                isLoading={isAnalysisLoading}
                error={analysisError}
            />
        </div>
    );
};

export default SilenceRulePage;