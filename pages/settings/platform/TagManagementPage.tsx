import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { TagDefinition, TagValue, TagManagementFilters, TableColumn } from '../../../types';
import Icon from '../../../components/Icon';
import Toolbar, { ToolbarButton } from '../../../components/Toolbar';
import TableContainer from '../../../components/TableContainer';
import Modal from '../../../components/Modal';
import TagValuesManageModal from '../../../components/TagValuesManageModal';
import TagDefinitionEditModal from '../../../components/TagDefinitionEditModal';
import api from '../../../services/api';
import TableLoader from '../../../components/TableLoader';
import TableError from '../../../components/TableError';
import UnifiedSearchModal from '../../../components/UnifiedSearchModal';
import { exportToCsv } from '../../../services/export';
import { showToast } from '../../../services/toast';
import ImportFromCsvModal from '../../../components/ImportFromCsvModal';
import Pagination from '../../../components/Pagination';
import ColumnSettingsModal from '../../../components/ColumnSettingsModal';
import { usePageMetadata } from '../../../contexts/PageMetadataContext';
import StatusTag, { StatusTagProps } from '../../../components/StatusTag';
import IconButton from '../../../components/IconButton';
import { useOptions } from '../../../contexts/OptionsContext';
import { TAG_SCOPE_OPTIONS } from '../../../tag-registry';
import QuickFilterBar, { QuickFilterOption } from '../../../components/QuickFilterBar';
import SortableColumnHeaderCell from '../../../components/SortableColumnHeaderCell';
import useTableSorting from '../../../hooks/useTableSorting';

const PAGE_IDENTIFIER = 'tag_management';


const TagManagementPage: React.FC = () => {
    const [tags, setTags] = useState<TagDefinition[]>([]);
    const [allColumns, setAllColumns] = useState<TableColumn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isValuesModalOpen, setIsValuesModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);
    const [isBatchDeleting, setIsBatchDeleting] = useState(false);
    const [isDeletingSingle, setIsDeletingSingle] = useState(false);

    const [managingTag, setManagingTag] = useState<TagDefinition | null>(null);
    const [editingTag, setEditingTag] = useState<Partial<TagDefinition> | null>(null);
    const [deletingTag, setDeletingTag] = useState<TagDefinition | null>(null);

    const [filters, setFilters] = useState<TagManagementFilters>({});
    const [isColumnSettingsModalOpen, setIsColumnSettingsModalOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalTags, setTotalTags] = useState(0);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const { metadata: pageMetadata } = usePageMetadata();
    const { options } = useOptions();
    const tagManagementOptions = options?.tag_management;
    const fallbackKindOptions = useMemo(() => [
        { value: 'enum', label: '列舉 (Enum)', description: '使用者須從預設清單中選擇。' },
        { value: 'text', label: '文字 (Text)', description: '允許自由輸入，適用於描述性資訊。' },
        { value: 'boolean', label: '布林 (Boolean)', description: '以是/否或開/關形式呈現。' },
        { value: 'reference', label: '參考 (Reference)', description: '由系統依據其他實體自動帶入，不可直接編輯。' },
    ], []);
    const scopeOptions = useMemo(() => tagManagementOptions?.scopes ?? TAG_SCOPE_OPTIONS, [tagManagementOptions]);
    const kindOptions = useMemo(() => {
        if (tagManagementOptions?.kinds && tagManagementOptions.kinds.length > 0) {
            return tagManagementOptions.kinds;
        }
        return fallbackKindOptions;
    }, [tagManagementOptions, fallbackKindOptions]);
    const scopeFilterOptions = useMemo<QuickFilterOption[]>(() => [
        { value: 'all', label: '全部' },
        ...scopeOptions.map(scope => ({ value: scope.value, label: scope.label, tooltip: scope.description })),
    ], [scopeOptions]);
    const kindFilterOptions = useMemo<QuickFilterOption[]>(() => [
        { value: 'all', label: '全部' },
        ...kindOptions.map(kind => ({ value: kind.value, label: kind.label, tooltip: (kind as { description?: string }).description })),
    ], [kindOptions]);
    const scopeLabelMap = useMemo(() => {
        const map = new Map<string, string>();
        scopeOptions.forEach(scope => map.set(scope.value, scope.label));
        return map;
    }, [scopeOptions]);
    const kindLabelMap = useMemo(() => {
        const map = new Map<string, string>();
        kindOptions.forEach(kind => map.set(kind.value, kind.label));
        return map;
    }, [kindOptions]);
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.column_config_key;

    const { sortConfig, sortParams, handleSort } = useTableSorting({ defaultSortKey: 'updated_at', defaultSortDirection: 'desc' });

    const fetchTags = useCallback(async () => {
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
            const [tagsRes, columnConfigRes, allColumnsRes] = await Promise.all([
                api.get<{ items: TagDefinition[], total: number }>('/settings/tags', { params }),
                api.get<string[]>(`/settings/column-config/${pageKey}`),
                api.get<TableColumn[]>(`/pages/columns/${pageKey}`)
            ]);
            setTags(tagsRes.data.items);
            setTotalTags(tagsRes.data.total);
            if (allColumnsRes.data.length === 0) {
                throw new Error('欄位定義缺失');
            }
            setAllColumns(allColumnsRes.data);
            const resolvedVisibleColumns = columnConfigRes.data.length > 0
                ? columnConfigRes.data
                : allColumnsRes.data.map(c => c.key);
            setVisibleColumns(resolvedVisibleColumns);
        } catch (err) {
            setError('無法獲取標籤定義。');
        } finally {
            setIsLoading(false);
        }
    }, [pageKey, currentPage, pageSize, filters, sortParams]);

    useEffect(() => {
        if (pageKey) {
            fetchTags();
        }
    }, [fetchTags, pageKey]);

    useEffect(() => {
        setCurrentPage(1);
        setSelectedIds([]);
    }, [filters]);


    const filterBadges = useMemo(() => {
        const chips: string[] = [];
        if (filters.keyword) {
            chips.push(`關鍵字：${filters.keyword}`);
        }
        if (filters.scope) {
            chips.push(`範圍：${scopeLabelMap.get(filters.scope) || filters.scope}`);
        }
        if (filters.kind) {
            chips.push(`型別：${kindLabelMap.get(filters.kind) || filters.kind}`);
        }
        return chips;
    }, [filters, scopeLabelMap, kindLabelMap]);

    const handleClearFilters = useCallback(() => {
        setFilters({});
    }, []);

    const hasFilters = filterBadges.length > 0;

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(tags.map(tag => tag.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        if (e.target.checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(sid => sid !== id));
        }
    };

    const handleOpenBatchDelete = () => {
        if (selectedIds.length === 0) {
            showToast('請先選擇要刪除的標籤。', 'error');
            return;
        }
        setIsBatchDeleteModalOpen(true);
    };

    const confirmBatchDelete = async () => {
        if (selectedIds.length === 0) {
            setIsBatchDeleteModalOpen(false);
            return;
        }
        setIsBatchDeleting(true);
        try {
            await Promise.all(selectedIds.map(id => api.del(`/settings/tags/${id}`)));
            showToast(`成功刪除 ${selectedIds.length} 個標籤。`, 'success');
            setSelectedIds([]);
            fetchTags();
        } catch (error) {
            showToast('批次刪除失敗。', 'error');
        } finally {
            setIsBatchDeleting(false);
            setIsBatchDeleteModalOpen(false);
        }
    };

    const handleCloseBatchDeleteModal = () => {
        if (isBatchDeleting) {
            return;
        }
        setIsBatchDeleteModalOpen(false);
    };

    const isAllSelected = tags.length > 0 && selectedIds.length === tags.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < tags.length;

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

    const handleManageValues = (tag: TagDefinition) => {
        if (tag.kind !== 'enum') {
            showToast('僅列舉型標籤支援預設值管理。', 'warning');
            return;
        }
        setManagingTag(tag);
        setIsValuesModalOpen(true);
    };

    const handleSaveValues = async (tagId: string, newValues: TagValue[]) => {
        try {
            await api.put(`/settings/tags/${tagId}/values`, newValues);
            showToast('標籤值已儲存。', 'success');
            fetchTags();
        } catch (err) {
            showToast('儲存標籤值失敗。', 'error');
        } finally {
            setIsValuesModalOpen(false);
        }
    };

    const handleNewTag = () => {
        setEditingTag(null);
        setIsEditModalOpen(true);
    };

    const handleEditTag = (tag: TagDefinition) => {
        setEditingTag(tag);
        setIsEditModalOpen(true);
    };

    const handleSaveTag = async (tagData: Partial<TagDefinition>) => {
        try {
            if (editingTag && 'id' in editingTag) {
                await api.patch(`/settings/tags/${(editingTag as TagDefinition).id}`, tagData);
                showToast('標籤已更新。', 'success');
            } else {
                await api.post('/settings/tags', tagData);
                showToast('標籤已創建。', 'success');
            }
            fetchTags();
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || '儲存標籤失敗。';
            showToast(errorMessage, 'error');
        } finally {
            setIsEditModalOpen(false);
        }
    };

    const handleDeleteTag = (tag: TagDefinition) => {
        setIsDeletingSingle(false);
        setDeletingTag(tag);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingTag) {
            return;
        }
        setIsDeletingSingle(true);
        try {
            await api.del(`/settings/tags/${deletingTag.id}`);
            showToast('標籤已刪除。', 'success');
            fetchTags();
            setSelectedIds(prev => prev.filter(id => id !== deletingTag.id));
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || '刪除標籤失敗。';
            showToast(errorMessage, 'error');
        } finally {
            setIsDeletingSingle(false);
            setIsDeleteModalOpen(false);
            setDeletingTag(null);
        }
    };

    const handleCloseDeleteModal = () => {
        if (isDeletingSingle) {
            return;
        }
        setIsDeleteModalOpen(false);
        setDeletingTag(null);
        setIsDeletingSingle(false);
    };

    const filteredTags = useMemo(() => {
        return tags.filter(tag => {
            const keyword = filters.keyword?.toLowerCase() || '';
            const scopeFilter = filters.scope;
            const kindFilter = filters.kind;

            const matchesSearch =
                !keyword ||
                tag.key.toLowerCase().includes(keyword) ||
                (tag.description ?? '').toLowerCase().includes(keyword);
            const matchesScope = !scopeFilter || (tag.scopes || []).includes(scopeFilter);
            const matchesKind = !kindFilter || tag.kind === kindFilter;

            return matchesSearch && matchesScope && matchesKind;
        });
    }, [tags, filters]);

    const handleExport = () => {
        if (filteredTags.length === 0) {
            showToast("沒有可匯出的資料。", 'error');
            return;
        }
        exportToCsv({
            filename: `tag-definitions-${new Date().toISOString().split('T')[0]}.csv`,
            headers: ['key', 'kind', 'scopes', 'enum_values', 'required', 'writable_roles'],
            data: filteredTags.map(tag => ({
                key: tag.key,
                kind: tag.kind,
                scopes: (tag.scopes || []).join('|'),
                enum_values: (tag.allowed_values || []).map(v => v.value).join('|'),
                required: tag.required ? 'true' : 'false',
                writable_roles: (tag.writable_roles || []).join('|'),
            })),
        });
    };

    const renderCellContent = (tag: TagDefinition, columnKey: string) => {
        switch (columnKey) {
            case 'key':
                return (
                    <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-white">{tag.key}</span>
                        {tag.readonly && (
                            <StatusTag dense tone="warning" icon="lock" label="唯讀" tooltip="此標籤由系統自動維護。" />
                        )}
                    </div>
                );
            case 'description':
                return (
                    <div className="text-sm text-slate-300 leading-relaxed max-w-md">
                        {tag.description || <span className="text-slate-500 italic">無說明</span>}
                    </div>
                );
            case 'scopes':
                const scopes = tag.scopes || [];
                const maxDisplay = 4;
                if (scopes.length === 0) {
                    return <span className="text-xs text-slate-500">未設定</span>;
                }
                return (
                    <div className="flex flex-wrap gap-1.5 items-center">
                        {scopes.slice(0, maxDisplay).map(scope => (
                            <StatusTag key={scope} dense tone="neutral" label={scopeLabelMap.get(scope) || scope} />
                        ))}
                        {scopes.length > maxDisplay && (
                            <StatusTag dense tone="neutral" label={`+${scopes.length - maxDisplay}`} tooltip="更多範圍" />
                        )}
                    </div>
                );
            case 'enum_values':
                const values = tag.allowed_values || [];
                if (values.length === 0) {
                    return <span className="text-slate-500 text-xs italic">未定義值</span>;
                }
                const maxValuesDisplay = 3;
                return (
                    <div className="flex flex-wrap gap-1.5 items-center">
                        {values.slice(0, maxValuesDisplay).map(value => (
                            <StatusTag key={value.id} dense tone="info" label={value.value} />
                        ))}
                        {values.length > maxValuesDisplay && (
                            <StatusTag dense tone="neutral" label={`+${values.length - maxValuesDisplay} 更多`} />
                        )}
                    </div>
                );
            case 'writable_roles':
                const roles = tag.writable_roles || [];
                if (roles.length === 0) {
                    return <span className="text-xs text-slate-500">僅限系統</span>;
                }
                return (
                    <div className="flex flex-wrap gap-1.5 items-center">
                        {roles.map(role => (
                            <StatusTag key={role} dense tone="default" label={role} />
                        ))}
                    </div>
                );
            case 'required':
                return (
                    <StatusTag
                        dense
                        tone={tag.required ? 'danger' : 'neutral'}
                        icon={tag.required ? 'shield-check' : 'minus'}
                        label={tag.required ? '必填' : '選填'}
                        tooltip={tag.required ? '儲存表單時必須提供此標籤。' : '可視需求新增。'}
                    />
                );
            case 'kind':
                const kindLabel = kindLabelMap.get(tag.kind) || tag.kind;
                let kindTone: StatusTagProps['tone'] = 'neutral';
                let kindIcon = 'type';
                if (tag.kind === 'enum') {
                    kindTone = 'info';
                    kindIcon = 'list';
                } else if (tag.kind === 'reference') {
                    kindTone = 'warning';
                    kindIcon = 'link';
                } else if (tag.kind === 'boolean') {
                    kindTone = 'success';
                    kindIcon = 'toggle-left';
                }
                return <StatusTag dense tone={kindTone} icon={kindIcon} label={kindLabel} />;
            default:
                return <span className="text-slate-500">--</span>;
        }
    };

    const leftActions = (
        <ToolbarButton icon="search" text="搜索和篩選" onClick={() => setIsSearchModalOpen(true)} />
    );

    const rightActions = (
        <>
            <ToolbarButton icon="upload" text="匯入" onClick={() => setIsImportModalOpen(true)} />
            <ToolbarButton icon="download" text="匯出" onClick={handleExport} />
            <ToolbarButton icon="settings-2" text="欄位設定" onClick={() => setIsColumnSettingsModalOpen(true)} />
            <ToolbarButton icon="plus" text="新增標籤" primary onClick={handleNewTag} />
        </>
    );

    const batchActions = selectedIds.length > 0 ? (
        <>
            <ToolbarButton icon="trash-2" text={`刪除 (${selectedIds.length})`} onClick={handleOpenBatchDelete} />
            <ToolbarButton icon="x" text="取消選擇" onClick={() => setSelectedIds([])} />
        </>
    ) : null;

    return (
        <div className="h-full flex flex-col">
            {hasFilters && (
                <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2">
                    <span className="text-xs text-slate-400">篩選條件：</span>
                    {filterBadges.map(label => (
                        <StatusTag key={label} dense tone="neutral" label={label} />
                    ))}
                    <button onClick={handleClearFilters} className="px-2.5 py-1 text-xs font-medium text-sky-300 hover:text-sky-200">
                        清除
                    </button>
                </div>
            )}

            <div className="mb-4 space-y-3">
                <QuickFilterBar
                    label="範圍"
                    options={scopeFilterOptions}
                    mode="single"
                    value={[filters.scope ?? 'all']}
                    onChange={(values) => {
                        const selected = values[0];
                        setFilters(prev => {
                            if (!selected || selected === 'all') {
                                if (typeof prev.scope === 'undefined') {
                                    return prev;
                                }
                                const nextFilters = { ...prev };
                                delete nextFilters.scope;
                                return nextFilters;
                            }
                            if (prev.scope === selected) {
                                return prev;
                            }
                            return { ...prev, scope: selected as TagManagementFilters['scope'] };
                        });
                    }}
                    showSearch
                    placeholder="搜尋標籤鍵或說明"
                    onSearch={(keyword) => {
                        const normalized = keyword.trim();
                        setFilters(prev => {
                            const nextFilters = { ...prev };
                            if (normalized) {
                                if (prev.keyword === normalized) {
                                    return prev;
                                }
                                nextFilters.keyword = normalized;
                                return nextFilters;
                            }
                            if (!prev.keyword) {
                                return prev;
                            }
                            delete nextFilters.keyword;
                            return nextFilters;
                        });
                    }}
                    searchValue={filters.keyword ?? ''}
                />
                <QuickFilterBar
                    label="型別"
                    options={kindFilterOptions}
                    mode="single"
                    value={[filters.kind ?? 'all']}
                    onChange={(values) => {
                        const selected = values[0];
                        setFilters(prev => {
                            if (!selected || selected === 'all') {
                                if (typeof prev.kind === 'undefined') {
                                    return prev;
                                }
                                const nextFilters = { ...prev };
                                delete nextFilters.kind;
                                return nextFilters;
                            }
                            if (prev.kind === selected) {
                                return prev;
                            }
                            return { ...prev, kind: selected as TagManagementFilters['kind'] };
                        });
                    }}
                />
            </div>

            <Toolbar
                leftActions={leftActions}
                rightActions={rightActions}
                selectedCount={selectedIds.length}
                onClearSelection={() => setSelectedIds([])}
                batchActions={batchActions}
            />
            <TableContainer>
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="p-4 w-12">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600 rounded"
                                        checked={isAllSelected}
                                        ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                                        onChange={handleSelectAll}
                                    />
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
                                        />
                                    );
                                })}
                                <th scope="col" className="px-6 py-3 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={visibleColumns.length + 2} />
                            ) : error ? (
                                <TableError colSpan={visibleColumns.length + 2} message={error} onRetry={fetchTags} />
                            ) : filteredTags.map((tag) => (
                                <tr key={tag.id} className={`border-b border-slate-800 hover:bg-slate-800/40 ${selectedIds.includes(tag.id) ? 'bg-sky-900/50' : ''}`}>
                                    <td className="p-4 w-12" onClick={e => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-4 w-4 bg-slate-800 border-slate-600 rounded"
                                            checked={selectedIds.includes(tag.id)}
                                            onChange={(e) => handleSelectOne(e, tag.id)}
                                        />
                                    </td>
                                    {visibleColumns.map(key => (
                                        <td key={key} className="px-6 py-4">{renderCellContent(tag, key)}</td>
                                    ))}
                                    <td className="px-6 py-4 text-right">
                                        {tag.readonly ? (
                                            <div className="inline-flex items-center space-x-2 text-xs text-slate-500">
                                                <Icon name="lock" className="w-3.5 h-3.5" />
                                                <span>系統自動管理</span>
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-2">
                                                <IconButton icon="edit-3" label="編輯標籤" tooltip="編輯標籤" onClick={() => handleEditTag(tag)} />
                                                <IconButton
                                                    icon="list"
                                                    label="管理標籤值"
                                                    tooltip={tag.kind === 'enum' ? '管理列舉值' : '僅列舉型標籤支援預設值管理'}
                                                    onClick={() => handleManageValues(tag)}
                                                    disabled={tag.kind !== 'enum'}
                                                />
                                                <IconButton
                                                    icon="trash-2"
                                                    label="刪除標籤"
                                                    tone="danger"
                                                    tooltip="刪除此標籤"
                                                    onClick={() => handleDeleteTag(tag)}
                                                />
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </TableContainer>
            {isEditModalOpen && (
                <TagDefinitionEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSaveTag}
                    tag={editingTag}
                />
            )}
            {isValuesModalOpen && managingTag && (
                <TagValuesManageModal
                    isOpen={isValuesModalOpen}
                    onClose={() => setIsValuesModalOpen(false)}
                    onSave={handleSaveValues}
                    tag={managingTag}
                />
            )}
            {isDeleteModalOpen && deletingTag && (
                <Modal
                    title="確認刪除"
                    isOpen={isDeleteModalOpen}
                    onClose={handleCloseDeleteModal}
                    width="w-1/3"
                    footer={
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={handleCloseDeleteModal}
                                disabled={isDeletingSingle}
                                className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                取消
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeletingSingle}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:cursor-not-allowed disabled:bg-red-600/60"
                            >
                                {isDeletingSingle ? '刪除中…' : '刪除'}
                            </button>
                        </div>
                    }
                >
                    <p className="text-sm text-slate-200">您確定要刪除標籤鍵 <strong className="font-mono text-amber-400">{deletingTag.key}</strong> 嗎？此操作無法復原。</p>
                </Modal>
            )}
            {isBatchDeleteModalOpen && (
                <Modal
                    title="批次刪除標籤"
                    isOpen={isBatchDeleteModalOpen}
                    onClose={handleCloseBatchDeleteModal}
                    width="w-1/3 max-w-md"
                    footer={
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={handleCloseBatchDeleteModal}
                                disabled={isBatchDeleting}
                                className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                取消
                            </button>
                            <button
                                onClick={confirmBatchDelete}
                                disabled={isBatchDeleting}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:cursor-not-allowed disabled:bg-red-600/60"
                            >
                                {isBatchDeleting ? '刪除中…' : `刪除 ${selectedIds.length} 筆`}
                            </button>
                        </div>
                    }
                >
                    <p className="text-sm text-slate-200">您即將刪除 <strong>{selectedIds.length}</strong> 個標籤，相關標籤值也會一併移除。</p>
                    <p className="mt-2 text-xs text-slate-400">建議先匯出備份以便日後查閱，此操作完成後無法復原。</p>
                </Modal>
            )}
            <UnifiedSearchModal
                page="tag-management"
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onSearch={(newFilters) => {
                    setFilters(newFilters as TagManagementFilters);
                    setIsSearchModalOpen(false);
                }}
                initialFilters={filters}
            />
            <ImportFromCsvModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImportSuccess={fetchTags}
                itemName="標籤"
                importEndpoint="/settings/tags/import"
                templateHeaders={['key', 'kind', 'scopes', 'enum_values', 'required', 'writable_roles']}
                templateFilename="tags-template.csv"
            />
            <ColumnSettingsModal
                isOpen={isColumnSettingsModalOpen}
                onClose={() => setIsColumnSettingsModalOpen(false)}
                onSave={handleSaveColumnConfig}
                allColumns={allColumns}
                visibleColumnKeys={visibleColumns}
            />
            {!isLoading && !error && (
                <div className="mt-6">
                    <Pagination
                        total={totalTags}
                        page={currentPage}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={setPageSize}
                    />
                </div>
            )}
        </div>
    );
};

export default TagManagementPage;