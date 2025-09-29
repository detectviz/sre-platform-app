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

    const { metadata: pageMetadata } = usePageMetadata();
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.columnConfigKey;

    const fetchTags = useCallback(async () => {
        if (!pageKey) return;
        setIsLoading(true);
        setError(null);
        try {
            const [tagsRes, columnConfigRes, allColumnsRes] = await Promise.all([
                api.get<TagDefinition[]>('/settings/tags'),
                api.get<string[]>(`/settings/column-config/${pageKey}`),
                api.get<TableColumn[]>(`/pages/columns/${pageKey}`)
            ]);
            setTags(tagsRes.data);
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
    }, [pageKey]);

    useEffect(() => {
        if (pageKey) {
            fetchTags();
        }
    }, [fetchTags, pageKey]);
    
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
            fetchTags();
        } catch (err) {
            alert('Failed to save tag values.');
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
            } else {
                await api.post('/settings/tags', tagData);
            }
            fetchTags();
        } catch (err) {
            alert('Failed to save tag.');
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
                fetchTags();
            } catch (err) {
                alert('Failed to delete tag.');
            } finally {
                setIsDeleteModalOpen(false);
                setDeletingTag(null);
            }
        }
    };

    const filteredTags = useMemo(() => {
        return tags.filter(tag => {
            const keyword = filters.keyword?.toLowerCase() || '';
            const category = filters.category || '';
            
            const matchesSearch = !keyword || tag.key.toLowerCase().includes(keyword) || tag.description.toLowerCase().includes(keyword);
            const matchesCategory = !category || tag.category === category;
            
            return matchesSearch && matchesCategory;
        });
    }, [tags, filters]);

    const handleExport = () => {
        if (filteredTags.length === 0) {
            showToast("沒有可匯出的資料。", 'error');
            return;
        }
        exportToCsv({
            filename: `tag-definitions-${new Date().toISOString().split('T')[0]}.csv`,
            headers: ['key', 'category', 'description', 'required'],
            data: filteredTags.map(tag => ({
                key: tag.key,
                category: tag.category,
                description: tag.description,
                required: tag.required
            })),
        });
    };
    
    const renderCellContent = (tag: TagDefinition, columnKey: string) => {
        switch (columnKey) {
            case 'key':
                return (
                    <>
                        <div className="font-medium text-white">{tag.key}</div>
                        <p className="text-xs text-slate-400 font-normal">{tag.description}</p>
                    </>
                );
            case 'category':
                return tag.category;
            case 'required':
                return tag.required ? <Icon name="check-circle" className="w-5 h-5 text-green-400" /> : <Icon name="circle" className="w-5 h-5 text-slate-500" />;
            case 'usageCount':
                return tag.usageCount;
            case 'allowedValues':
                return (
                    <div className="flex flex-wrap gap-1">
                        {tag.allowedValues.slice(0, 3).map(v => (
                            <span key={v.id} className="px-2 py-0.5 text-xs bg-slate-700 rounded-full">{v.value}</span>
                        ))}
                        {tag.allowedValues.length > 3 && <span className="text-xs text-slate-400">...</span>}
                    </div>
                );
            default:
                return null;
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

    return (
        <div className="h-full flex flex-col">
            <Toolbar 
                leftActions={leftActions}
                rightActions={rightActions}
            />
            <TableContainer>
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0 z-10">
                            <tr>
                                {visibleColumns.map(key => (
                                    <th key={key} scope="col" className="px-6 py-3">{allColumns.find(c => c.key === key)?.label || key}</th>
                                ))}
                                <th scope="col" className="px-6 py-3 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={visibleColumns.length + 1} />
                            ) : error ? (
                                <TableError colSpan={visibleColumns.length + 1} message={error} onRetry={fetchTags} />
                            ) : filteredTags.map((tag) => (
                                <tr key={tag.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                                    {visibleColumns.map(key => (
                                        <td key={key} className="px-6 py-4">{renderCellContent(tag, key)}</td>
                                    ))}
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => handleManageValues(tag)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="管理標籤值">
                                            <Icon name="tags" className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleEditTag(tag)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="編輯">
                                            <Icon name="edit-3" className="w-4 h-4" />
                                        </button>
                                         <button onClick={() => handleDeleteTag(tag)} className="p-1.5 rounded-md text-red-400 hover:bg-red-500/20 hover:text-red-300" title="刪除">
                                            <Icon name="trash-2" className="w-4 h-4" />
                                        </button>
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
                templateHeaders={['key', 'category', 'description', 'required']}
                templateFilename="tags-template.csv"
            />
            <ColumnSettingsModal
                isOpen={isColumnSettingsModalOpen}
                onClose={() => setIsColumnSettingsModalOpen(false)}
                onSave={handleSaveColumnConfig}
                allColumns={allColumns}
                visibleColumnKeys={visibleColumns}
            />
        </div>
    );
};

export default TagManagementPage;