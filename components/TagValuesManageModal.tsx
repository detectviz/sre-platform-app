import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import { TagDefinition, TagValue } from '../types';

interface TagValuesManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tagId: string, newValues: TagValue[]) => void;
  tag: TagDefinition;
}

const TagValuesManageModal: React.FC<TagValuesManageModalProps> = ({ isOpen, onClose, onSave, tag }) => {
    const [values, setValues] = useState<TagValue[]>([]);
    const [newValue, setNewValue] = useState('');

    useEffect(() => {
        if (isOpen) {
            setValues(tag.allowedValues);
            setNewValue('');
        }
    }, [isOpen, tag]);

    const handleSave = () => {
        onSave(tag.id, values);
    };

    const handleAddValue = () => {
        if (newValue.trim()) {
            const newTagValue: TagValue = {
                id: `val-${Date.now()}`,
                value: newValue.trim(),
                usageCount: 0,
            };
            setValues([...values, newTagValue]);
            setNewValue('');
        }
    };
    
    const handleRemoveValue = (id: string) => {
        setValues(values.filter(v => v.id !== id));
    };

    return (
        <Modal
            title={`管理 "${tag.key}" 的標籤值`}
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
            <div className="max-h-[60vh] flex flex-col">
                <div className="flex items-center space-x-2 mb-4">
                    <input 
                        type="text" 
                        value={newValue}
                        onChange={e => setNewValue(e.target.value)}
                        placeholder="新增一個值..."
                        className="flex-grow bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
                    />
                    <button onClick={handleAddValue} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">新增</button>
                </div>

                <div className="flex-grow overflow-y-auto border-t border-slate-700/50 pt-4">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0">
                            <tr>
                                <th className="px-4 py-2">值</th>
                                <th className="px-4 py-2">使用次數</th>
                                <th className="px-4 py-2 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {values.map(v => (
                                <tr key={v.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/40">
                                    <td className="px-4 py-3">{v.value}</td>
                                    <td className="px-4 py-3">{v.usageCount}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => handleRemoveValue(v.id)} className="p-1.5 rounded-md text-red-400 hover:bg-red-500/20 hover:text-red-300" title="刪除">
                                            <Icon name="trash-2" className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Modal>
    );
};

export default TagValuesManageModal;