
import React, { useMemo, useState, useEffect } from 'react';
import Modal from '@/shared/components/Modal';
import FormRow from '@/shared/components/FormRow';
import { Resource } from '@/shared/types';
import { useOptions } from '@/contexts/OptionsContext';
import SearchableSelect, { SearchableSelectOption } from '@/shared/components/SearchableSelect';

interface ResourceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resource: Partial<Resource>) => void;
  resource: Resource | null;
}

const ResourceEditModal: React.FC<ResourceEditModalProps> = ({ isOpen, onClose, onSave, resource }) => {
    const [formData, setFormData] = useState<Partial<Resource>>({});
    const { options, isLoading: isLoadingOptions, error: optionsError } = useOptions();
    const resourceOptions = options?.resources;

    const typeOptions = useMemo<SearchableSelectOption[]>(() => (
        resourceOptions?.types?.map(option => ({ value: option.value, label: option.label })) || []
    ), [resourceOptions?.types]);

    const providerOptions = useMemo<SearchableSelectOption[]>(() => (
        resourceOptions?.providers?.map(value => ({ value, label: value })) || []
    ), [resourceOptions?.providers]);

    const regionOptions = useMemo<SearchableSelectOption[]>(() => (
        resourceOptions?.regions?.map(value => ({ value, label: value })) || []
    ), [resourceOptions?.regions]);

    const ownerOptions = useMemo<SearchableSelectOption[]>(() => (
        resourceOptions?.owners?.map(value => ({ value, label: value })) || []
    ), [resourceOptions?.owners]);

    useEffect(() => {
        if (isOpen) {
            setFormData(resource || {
                name: '',
                type: resourceOptions?.types?.[0]?.value || '',
                provider: resourceOptions?.providers?.[0] || '',
                region: resourceOptions?.regions?.[0] || '',
                owner: resourceOptions?.owners?.[0] || '',
            });
        }
    }, [isOpen, resource, resourceOptions]);

    const handleSave = () => {
        onSave(formData);
    };

    const handleChange = (field: keyof Resource, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Modal
            title={resource ? '編輯資源' : '新增資源'}
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
                {optionsError && (
                    <div className="p-3 bg-red-900/50 text-red-300 rounded-md text-sm">{optionsError}</div>
                )}
                <FormRow
                    label="資源名稱 *"
                    description="請輸入易於辨識的中文名稱，支援 64 個字元以內。"
                >
                    <input
                        type="text"
                        value={formData.name || ''}
                        onChange={e => handleChange('name', e.target.value)}
                        placeholder="例如：核心 API Gateway"
                        className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                    />
                </FormRow>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormRow
                        label="類型"
                        description="依據 SRE DS v0.8 內建類型快速搜尋或輸入英文關鍵字。"
                    >
                        <SearchableSelect
                            value={formData.type || ''}
                            onChange={value => handleChange('type', value)}
                            options={typeOptions}
                            disabled={isLoadingOptions || !!optionsError}
                            placeholder="輸入類型或英文縮寫"
                        />
                    </FormRow>
                    <FormRow
                        label="提供商"
                        description="支援多雲環境，輸入供應商關鍵字以縮小選項。"
                    >
                        <SearchableSelect
                            value={formData.provider || ''}
                            onChange={value => handleChange('provider', value)}
                            options={providerOptions}
                            disabled={isLoadingOptions || !!optionsError}
                            placeholder="輸入例如 AWS、GCP"
                        />
                    </FormRow>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormRow
                        label="區域"
                        description="輸入區域代碼以快速鎖定部署位置。"
                    >
                        <SearchableSelect
                            value={formData.region || ''}
                            onChange={value => handleChange('region', value)}
                            options={regionOptions}
                            disabled={isLoadingOptions || !!optionsError}
                            placeholder="輸入如 ap-northeast-1"
                        />
                    </FormRow>
                    <FormRow
                        label="擁有者"
                        description="指定負責團隊或服務擁有者，支援中文或英文搜尋。"
                    >
                        <SearchableSelect
                            value={formData.owner || ''}
                            onChange={value => handleChange('owner', value)}
                            options={ownerOptions}
                            disabled={isLoadingOptions || !!optionsError}
                            placeholder="輸入團隊名稱"
                        />
                    </FormRow>
                </div>
            </div>
        </Modal>
    );
};

export default ResourceEditModal;