import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormRow from './FormRow';
import { TagDefinition } from '../types';
import api from '../services/api';

interface TagDefinitionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tag: Partial<TagDefinition>) => void;
  tag: Partial<TagDefinition> | null;
}

const TagDefinitionEditModal: React.FC<TagDefinitionEditModalProps> = ({ isOpen, onClose, onSave, tag }) => {
    const [formData, setFormData] = useState<Partial<TagDefinition>>({});
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(tag || { key: '', category: 'Infrastructure', description: '', required: false });
            
            setIsLoading(true);
            api.get<{ categories: string[] }>('/settings/tags/options')
                .then(res => setCategories(res.data.categories))
                .catch(err => console.error("Failed to load tag categories", err))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, tag]);

    const handleSave = () => {
        onSave(formData);
    };

    const handleChange = (field: keyof TagDefinition, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Modal
            title={tag ? `編輯標籤: ${tag.key}` : '新增標籤'}
            isOpen={isOpen}
            onClose={onClose}
            width="w-1/2 max-w-2xl"
            footer={
                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">取消</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">儲存</button>
                </div>
            }
        >
            <div className="space-y-4">
                <FormRow label="標籤鍵 *">
                    <input 
                        type="text" 
                        value={formData.key || ''} 
                        onChange={e => handleChange('key', e.target.value)} 
                        disabled={!!tag}
                        className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm disabled:bg-slate-800/50 disabled:cursor-not-allowed"
                    />
                    {!!tag && <p className="text-xs text-slate-500 mt-1">標籤鍵在建立後無法修改。</p>}
                </FormRow>
                <FormRow label="分類">
                    <select 
                        value={formData.category || 'Infrastructure'} 
                        onChange={e => handleChange('category', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
                        disabled={isLoading}
                    >
                        {isLoading ? <option>載入中...</option> : categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </FormRow>
                <FormRow label="描述">
                    <textarea 
                        value={formData.description || ''} 
                        onChange={e => handleChange('description', e.target.value)} 
                        rows={3} 
                        className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
                    ></textarea>
                </FormRow>
                <FormRow label="設定">
                    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50">
                        <input 
                            type="checkbox" 
                            checked={formData.required || false} 
                            onChange={e => handleChange('required', e.target.checked)} 
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
