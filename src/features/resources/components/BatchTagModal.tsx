import React, { useEffect, useState } from 'react';
import Modal from '@/shared/components/Modal';
import KeyValueInput from '@/shared/components/KeyValueInput';
import { KeyValueTag } from '@/shared/types';
import { showToast } from '@/services/toast';

interface KeyValueInputState {
    id: string;
    key: string;
    value: string;
}

interface BatchTagModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (tags: KeyValueTag[]) => void;
    isSubmitting?: boolean;
    resourceCount: number;
}

const createInitialInputs = (): KeyValueInputState[] => ([{ id: `kv-${Date.now()}`, key: '', value: '' }]);

const BatchTagModal: React.FC<BatchTagModalProps> = ({ isOpen, onClose, onSubmit, isSubmitting = false, resourceCount }) => {
    const [tagInputs, setTagInputs] = useState<KeyValueInputState[]>(createInitialInputs);

    useEffect(() => {
        if (isOpen) {
            setTagInputs(createInitialInputs());
        }
    }, [isOpen]);

    const handleSubmit = () => {
        const tags: KeyValueTag[] = [];
        tagInputs
            .filter(input => input.key.trim() && input.value.trim())
            .forEach(input => {
                const key = input.key.trim();
                input.value.split(',').map(v => v.trim()).filter(Boolean).forEach(value => {
                    tags.push({ id: `${key}-${value}`, key, value });
                });
            });

        if (tags.length === 0) {
            showToast('請至少新增一個標籤。', 'error');
            return;
        }
        onSubmit(tags);
    };

    return (
        <Modal
            title="批次新增標籤"
            isOpen={isOpen}
            onClose={onClose}
            width="w-1/2 max-w-2xl"
            footer={
                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md" disabled={isSubmitting}>取消</button>
                    <button onClick={handleSubmit} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting}>套用標籤</button>
                </div>
            }
        >
            <div className="space-y-4">
                <p className="text-sm text-slate-300">即將對 <span className="font-semibold text-white">{resourceCount}</span> 個資源新增以下標籤。</p>
                <KeyValueInput
                    values={tagInputs}
                    onChange={setTagInputs}
                    keyPlaceholder="標籤鍵 (例如 environment)"
                    valuePlaceholder="標籤值 (可用逗號分隔多個)"
                />
            </div>
        </Modal>
    );
};

export default BatchTagModal;
