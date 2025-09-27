import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormRow from './FormRow';
import { TagDefinition } from '../types';
import api from '../services/api';
import Icon from './Icon';
import { useOptions } from '../contexts/OptionsContext';

interface TagDefinitionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tag: Partial<TagDefinition>) => void;
  tag: Partial<TagDefinition> | null;
}

const TagDefinitionEditModal: React.FC<TagDefinitionEditModalProps> = ({ isOpen, onClose, onSave, tag }) => {
    const [formData, setFormData] = useState<Partial<TagDefinition>>({});
    const { options, isLoading: isLoadingOptions, error: optionsError } = useOptions();
    const tagManagementOptions = options?.tagManagement;

    useEffect(() => {
        if (isOpen) {
            if (isLoadingOptions || !tagManagementOptions) return;

            const categories = tagManagementOptions.categories || [];
            if (categories.length > 0) {
                setFormData(tag || { 
                    key: '', 
                    category: categories[0] as TagDefinition['category'], 
                    description: '', 
                    required: false 
                });
            } else {
                 setFormData(tag || { key: '', category: '' as TagDefinition['category'], description: '', required: false });
            }
        }
    }, [isOpen, tag, isLoadingOptions, tagManagementOptions]);

    const handleSave = () => {
        onSave(formData);
    };

    const handleChange = (field: keyof TagDefinition, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const categories = tagManagementOptions?.categories || [];
    const error = optionsError;
    const isLoading = isLoadingOptions;

    return (
        <Modal
            title={tag ? `編輯標籤: ${tag.key}` : '新增標籤'}
            isOpen={isOpen}
            onClose={onClose}
            width="w-1/2 max-w-2xl"
            footer={
                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">取消</button>
                    <button onClick={handleSave} disabled={isLoading || !!error} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md disabled:bg-slate-600 disabled:cursor-not-allowed">儲存</button>
                </div>
            }
        >
            <div className="space-y-4">
                 {error && (
                    <div className="p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-md text-sm flex items-center">
                        <Icon name="alert-circle" className="w-4 h-4 mr-2" />
                        {error}
                    </div>
                )}
                <FormRow label="標籤鍵 *">
                    <input 
                        type="text" 
                        value={formData.key || ''} 
                        onChange={e => handleChange('key', e.target.value)} 
                        disabled={!!tag || isLoading || !!error}
                        className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm disabled:bg-slate-800/50 disabled:cursor-not-allowed"
                    />
                    {!!tag && <p className="text-xs text-slate-500 mt-1">標籤鍵在建立後無法修改。</p>}
                </FormRow>
                <FormRow label="分類">
                    <select 
                        value={formData.category || ''} 
                        onChange={e => handleChange('category', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm disabled:bg-slate-800/50 disabled:cursor-not-allowed"
                        disabled={isLoading || !!error}
                    >
                        {isLoading ? <option>載入中...</option> : categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </FormRow>
                <FormRow label="描述">
                    <textarea 
                        value={formData.description || ''} 
                        onChange={e => handleChange('description', e.target.value)} 
                        rows={3} 
                        disabled={isLoading || !!error}
                        className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm disabled:bg-slate-800/50 disabled:cursor-not-allowed"
                    ></textarea>
                </FormRow>
                <FormRow label="設定">
                    <label className={`flex items-center space-x-3 p-3 bg-slate-800/30 rounded-lg ${isLoading || !!error ? 'cursor-not-allowed opacity-50' : 'hover:bg-slate-800/50 cursor-pointer'}`}>
                        <input 
                            type="checkbox" 
                            checked={formData.required || false} 
                            onChange={e => handleChange('required', e.target.checked)} 
                            disabled={isLoading || !!error}
                            className="form-checkbox h-5 w-5 rounded bg-slate-800 border-slate-600 text-sky-500 focus:ring-sky-500"
                        />
                        <span className="text-slate-300 font-semibold">此標籤為必填項目</span>
                    </label>
                </FormRow>
            </div>
        </Modal>
    );
};

export default TagDefinitionEditModal;