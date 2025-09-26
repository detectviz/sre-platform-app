import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { TagDefinition, TagValue } from '../../../types';
import Icon from '../../../components/Icon';
import Toolbar, { ToolbarButton } from '../../../components/Toolbar';
import TableContainer from '../../../components/TableContainer';
import Modal from '../../../components/Modal';
import TagValuesManageModal from '../../../components/TagValuesManageModal';
import TagDefinitionEditModal from '../../../components/TagDefinitionEditModal';
import api from '../../../services/api';
import TableLoader from '../../../components/TableLoader';
import TableError from '../../../components/TableError';

const TagManagementPage: React.FC = () => {
    const [tags, setTags] = useState<TagDefinition[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<string[]>(['All']);

    const [isValuesModalOpen, setIsValuesModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [managingTag, setManagingTag] = useState<TagDefinition | null>(null);
    const [editingTag, setEditingTag] = useState<Partial<TagDefinition> | null>(null);
    const [deletingTag, setDeletingTag] = useState<TagDefinition | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    const fetchTags = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [tagsRes, categoriesRes] = await Promise.all([
                api.get<TagDefinition[]>('/settings/tags'),
                api.get<{ categories: string[] }>('/settings/tags/options')
            ]);
            setTags(tagsRes.data);
            setCategories(['All', ...categoriesRes.data.categories]);
        } catch (err) {
            setError('無法獲取標籤定義。');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

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
            const matchesSearch = tag.key.toLowerCase().includes(searchTerm.toLowerCase()) || tag.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === 'All' || tag.category === filterCategory;
            return matchesSearch && matchesCategory;
        });
    }, [tags, searchTerm, filterCategory]);

    const leftActions = (
        <div className="flex items-center space-x-2">
            <div className="relative">
                <Icon name="search" className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder="搜尋標籤鍵或描述..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-64 bg-slate-800/80 border border-slate-700 rounded-md pl-9 pr-4 py-1.5 text-sm"
                />
            </div>
            <select 
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="bg-slate-800/80 border border-slate-700 rounded-md px-3 py-1.5 text-sm"
            >
                {categories.map(cat => <option key={cat} value={cat}>{cat === 'All' ? '所有分類' : cat}</option>)}
            </select>
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            <Toolbar 
                leftActions={leftActions}
                rightActions={<ToolbarButton icon="plus" text="新增標籤" primary onClick={handleNewTag} />}
            />
            <TableContainer>
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="px-6 py-3">標籤鍵</th>
                                <th scope="col" className="px-6 py-3">分類</th>
                                <th scope="col" className="px-6 py-3">必填</th>
                                <th scope="col" className="px-6 py-3">使用次數</th>
                                <th scope="col" className="px-6 py-3">允許值 (預覽)</th>
                                <th scope="col" className="px-6 py-3 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <TableLoader colSpan={6} />
                            ) : error ? (
                                <TableError colSpan={6} message={error} onRetry={fetchTags} />
                            ) : filteredTags.map((tag) => (
                                <tr key={tag.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                                    <td className="px-6 py-4 font-medium text-white">
                                        {tag.key}
                                        <p className="text-xs text-slate-400 font-normal">{tag.description}</p>
                                    </td>
                                    <td className="px-6 py-4">{tag.category}</td>
                                    <td className="px-6 py-4">
                                        {tag.required ? <Icon name="check-circle" className="w-5 h-5 text-green-400" /> : <Icon name="circle" className="w-5 h-5 text-slate-500" />}
                                    </td>
                                    <td className="px-6 py-4">{tag.usageCount}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {tag.allowedValues.slice(0, 3).map(v => (
                                                <span key={v.id} className="px-2 py-0.5 text-xs bg-slate-700 rounded-full">{v.value}</span>
                                            ))}
                                            {tag.allowedValues.length > 3 && <span className="text-xs text-slate-400">...</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => handleManageValues(tag)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white" title="管理允許值">
                                            <Icon name="list" className="w-4 h-4" />
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
        </div>
    );
};

export default TagManagementPage;