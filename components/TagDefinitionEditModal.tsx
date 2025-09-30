import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormRow from './FormRow';
import { TagDefinition, TagManagementOptions, TagScope } from '../types';
import Icon from './Icon';
import { useOptions } from '../contexts/OptionsContext';
import { showToast } from '../services/toast';

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

    const resolveDefaultForm = (opts: TagManagementOptions): Partial<TagDefinition> => ({
        key: '',
        description: '',
        scopes: opts.scopes.length ? [opts.scopes[0].value] : [],
        writableRoles: opts.writableRoles,
        required: false,
    });

    useEffect(() => {
        if (isOpen) {
            if (isLoadingOptions || !tagManagementOptions) return;

            if (tag) {
                setFormData({ ...tag });
            } else {
                setFormData(resolveDefaultForm(tagManagementOptions));
            }
        }
    }, [isOpen, tag, isLoadingOptions, tagManagementOptions]);

    const handleSave = () => {
        if (!formData.scopes || formData.scopes.length === 0) {
            showToast('請至少選擇一個標籤範圍。', 'error');
            return;
        }
        if (!formData.writableRoles || formData.writableRoles.length === 0) {
            showToast('請指定至少一個可寫入角色。', 'error');
            return;
        }
        onSave(formData);
    };

    const handleChange = (field: keyof TagDefinition, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const scopeOptions = tagManagementOptions?.scopes || [];
    const writableRoleOptions = tagManagementOptions?.writableRoles || [];
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
                <FormRow label="使用範圍 (Scopes)">
                    <div className={`grid grid-cols-2 gap-2 rounded-lg border border-slate-700 bg-slate-800/40 p-3 ${isLoading || !!error ? 'opacity-60 cursor-not-allowed' : ''}`}>
                        {scopeOptions.map(scope => {
                            const checked = (formData.scopes || []).includes(scope.value);
                            return (
                                <label key={scope.value} className="flex items-start space-x-2 text-sm cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="mt-1 h-4 w-4 rounded bg-slate-900 border-slate-600 text-sky-500 focus:ring-sky-500"
                                        checked={checked}
                                        disabled={isLoading || !!error}
                                        onChange={e => {
                                            const current = new Set(formData.scopes || []);
                                            if (e.target.checked) {
                                                current.add(scope.value as TagScope);
                                            } else {
                                                current.delete(scope.value as TagScope);
                                            }
                                            handleChange('scopes', Array.from(current));
                                        }}
                                    />
                                    <div>
                                        <p className="text-slate-200 font-medium">{scope.label}</p>
                                        <p className="text-xs text-slate-400">{scope.description}</p>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                    {(formData.scopes?.length ?? 0) === 0 && (
                        <p className="mt-1 text-xs text-amber-300">至少選擇一個適用範圍。</p>
                    )}
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
                <FormRow label="隱私與治理">
                    <div className="grid grid-cols-1 gap-3">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">可寫入角色</label>
                            <div className={`flex flex-wrap gap-2 rounded-lg border border-slate-700 bg-slate-800/40 p-3 ${isLoading || !!error ? 'opacity-60 cursor-not-allowed' : ''}`}>
                                {writableRoleOptions.map(role => {
                                    const checked = (formData.writableRoles || []).includes(role);
                                    return (
                                        <label key={role} className={`inline-flex items-center space-x-2 text-sm ${isLoading || !!error ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded bg-slate-900 border-slate-600 text-sky-500 focus:ring-sky-500"
                                                checked={checked}
                                                disabled={isLoading || !!error}
                                                onChange={e => {
                                                    const current = new Set(formData.writableRoles || []);
                                                    if (e.target.checked) {
                                                        current.add(role);
                                                    } else {
                                                        current.delete(role);
                                                    }
                                                    handleChange('writableRoles', Array.from(current));
                                                }}
                                            />
                                            <span className="text-slate-200">{role}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </FormRow>
                <FormRow label="標籤規則">
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