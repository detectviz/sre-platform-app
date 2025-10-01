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
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.column_config_key;

    const fetchTags = useCallback(async () => {
        if (!pageKey) return;
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                page_size: pageSize,
                ...filters,
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
    }, [pageKey, currentPage, pageSize, filters]);

    useEffect(() => {
        if (pageKey) {
            fetchTags();
        }
    }, [fetchTags, pageKey]);

    useEffect(() => {
        setCurrentPage(1);
        setSelectedIds([]);
    }, [filters]);

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

    const handleBatchDelete = async () => {
        if (selectedIds.length === 0) {
            showToast('請先選擇要刪除的標籤。', 'error');
            return;
        }

        const confirmed = window.confirm(`您確定要刪除選中的 ${selectedIds.length} 個標籤嗎？此操作無法復原。`);
        if (!confirmed) return;

        try {
            await Promise.all(selectedIds.map(id => api.del(`/settings/tags/${id}`)));
            showToast(`成功刪除 ${selectedIds.length} 個標籤。`, 'success');
            setSelectedIds([]);
            fetchTags();
        } catch (error) {
            showToast('批次刪除失敗。', 'error');
        }
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
        setDeletingTag(tag);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (deletingTag) {
            try {
                await api.del(`/settings/tags/${deletingTag.id}`);
                showToast('標籤已刪除。', 'success');
                fetchTags();
            } catch (err: any) {
                const errorMessage = err?.response?.data?.message || '刪除標籤失敗。';
                showToast(errorMessage, 'error');
            } finally {
                setIsDeleteModalOpen(false);
                setDeletingTag(null);
            }
        }
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
            headers: ['key', 'scopes', 'enumValues', 'required'],
            data: filteredTags.map(tag => ({
                key: tag.key,
                scopes: (tag.scopes || []).join('|'),
                enumValues: (tag.allowed_values || []).map(v => v.value).join('|'),
                required: tag.required,
            })),
        });
    };

    const renderCellContent = (tag: TagDefinition, columnKey: string) => {
        switch (columnKey) {
            case 'key':
                return (
                    <span className="font-mono font-medium text-white flex items-center">
                        {tag.readonly && <Icon name="lock" className="w-3.5 h-3.5 mr-1.5 text-slate-400" />}
                        {tag.key}
                        {tag.required && <span className="text-red-400 ml-1">*</span>}
                    </span>
                );
            case 'description':
                return (
                    <div className="text-sm text-slate-300 leading-relaxed max-w-md">
                        {tag.description || <span className="text-slate-500 italic">無說明</span>}
                    </div>
                );
            case 'scopes':
                const scopes = tag.scopes || [];
                const maxDisplay = 5;
                return (
                    <div className="flex flex-wrap gap-1 items-center">
                        {scopes.slice(0, maxDisplay).map(scope => (
                            <span key={scope} className="px-2 py-0.5 text-xs bg-slate-700/70 text-slate-100 rounded-full font-mono">{scope}</span>
                        ))}
                        {scopes.length > maxDisplay && (
                            <span className="px-2 py-0.5 text-xs text-slate-400 font-medium">+{scopes.length - maxDisplay}</span>
                        )}
                    </div>
                );
            case 'enumValues':
                const values = tag.allowed_values || [];
                if (values.length === 0) {
                    return <span className="text-slate-500 text-xs italic">未定義值</span>;
                }
                const maxValuesDisplay = 3;
                const displayValues = values.slice(0, maxValuesDisplay);
                return (
                    <div className="flex flex-wrap gap-1 items-center">
                        {displayValues.map((value, idx) => (
                            <span key={idx} className="px-2 py-0.5 text-xs bg-indigo-900/30 border border-indigo-700/50 rounded-full text-indigo-200">
                                {value.value}
                            </span>
                        ))}
                        {values.length > maxValuesDisplay && (
                            <span className="px-2 py-0.5 text-xs text-slate-400 font-medium">
                                +{values.length - maxValuesDisplay} 更多
                            </span>
                        )}
                    </div>
                );
            case 'writable_roles':
                const roles = tag.writable_roles || [];
                const maxRolesDisplay = 3;
                return (
                    <div className="flex flex-wrap gap-1 items-center">
                        {roles.slice(0, maxRolesDisplay).map(role => (
                            <span key={role} className="px-2 py-0.5 text-xs bg-slate-800 border border-slate-700 rounded-full font-mono text-slate-200">
                                {role}
                            </span>
                        ))}
                        {roles.length > maxRolesDisplay && (
                            <span className="px-2 py-0.5 text-xs text-slate-400 font-medium">
                                +{roles.length - maxRolesDisplay} 更多
                            </span>
                        )}
                    </div>
                );
            case 'required':
                return tag.required ? <Icon name="check-circle" className="w-5 h-5 text-green-400" /> : <Icon name="circle" className="w-5 h-5 text-slate-500" />;
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
            <ToolbarButton icon="trash-2" text={`刪除 (${selectedIds.length})`} onClick={handleBatchDelete} />
            <ToolbarButton icon="x" text="取消選擇" onClick={() => setSelectedIds([])} />
        </>
    ) : null;

    return (
        <div className="h-full flex flex-col">
            {/* 管理員說明區塊 */}
            <div className="mb-4 p-4 bg-amber-950/30 border border-amber-700/50 rounded-lg">
                <div className="flex items-start space-x-3">
                    <Icon name="shield-alert" className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-amber-200 mb-1">標籤管理（Platform Admin 專用）</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            此頁面用於定義組織的<strong>標籤管理</strong>，包括標籤鍵、適用範圍及存取權限。
                            這些定義會影響整個系統中標籤的使用方式。一般使用者在建立資源、事件等實體時，會根據此處的標籤定義來新增標籤實例。
                        </p>
                        <p className="text-xs text-amber-300 mt-2 flex items-center">
                            <Icon name="alert-triangle" className="w-3.5 h-3.5 mr-1.5" />
                            變更標籤定義可能影響現有資源的標籤驗證與查詢功能，請謹慎操作。
                        </p>
                    </div>
                </div>
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
                                {visibleColumns.map(key => (
                                    <th key={key} scope="col" className="px-6 py-3">{allColumns.find(c => c.key === key)?.label || key}</th>
                                ))}
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
                                    <td className="px-6 py-4 text-right space-x-1">
                                        {tag.readonly ? (
                                            <div className="inline-flex items-center space-x-2 text-xs text-slate-500">
                                                <Icon name="lock" className="w-3.5 h-3.5" />
                                                <span>系統自動管理</span>
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleEditTag(tag)}
                                                    className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white"
                                                    title="編輯"
                                                >
                                                    <Icon name="edit-3" className="w-4 h-4" />
                                                </button>
                                                {
                                                    <button
                                                        onClick={() => handleManageValues(tag)}
                                                        className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white"
                                                        title="管理標籤值"
                                                    >
                                                        <Icon name="list" className="w-4 h-4" />
                                                    </button>
                                                }
                                                <button
                                                    onClick={() => handleDeleteTag(tag)}
                                                    className="p-1.5 rounded-md text-red-400 hover:bg-red-500/20 hover:text-red-300"
                                                    title="刪除"
                                                >
                                                    <Icon name="trash-2" className="w-4 h-4" />
                                                </button>
                                            </>
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
                    onClose={() => setIsDeleteModalOpen(false)}
                    width="w-1/3"
                    footer={
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">取消</button>
                            <button onClick={confirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md">刪除</button>
                        </div>
                    }
                >
                    <p>您確定要刪除標籤鍵 <strong className="font-mono text-amber-400">{deletingTag.key}</strong> 嗎？此操作無法復原。</p>
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
                templateHeaders={['key', 'scopes', 'enumValues', 'required']}
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