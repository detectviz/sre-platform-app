import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import api from '../services/api';
import { TagDefinition } from '../types';
import { showToast } from '../services/toast';

interface KeyValue {
    id: string;
    key: string;
    value: string;
}

interface KeyValueInputProps {
    values: KeyValue[];
    onChange: (values: KeyValue[]) => void;
    keyPlaceholder?: string;
    valuePlaceholder?: string;
}

const MultiSelectDropdown: React.FC<{
    options: { id: string; value: string; }[];
    selectedValues: string[];
    onChange: (newValues: string[]) => void;
    placeholder: string;
}> = ({ options, selectedValues, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggleOption = (valueToToggle: string) => {
        const newSelected = selectedValues.includes(valueToToggle)
            ? selectedValues.filter(v => v !== valueToToggle)
            : [...selectedValues, valueToToggle];
        onChange(newSelected);
    };

    return (
        <div ref={dropdownRef} className="relative w-full">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-slate-700 rounded-md px-3 py-1 text-sm flex items-center flex-wrap gap-1 cursor-pointer min-h-[40px]"
            >
                {selectedValues.length === 0 && <span className="text-slate-400">{placeholder}</span>}
                {selectedValues.map(val => (
                    <span key={val} className="bg-sky-600 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center">
                        {val}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleToggleOption(val); }}
                            className="ml-1.5 text-sky-200 hover:text-white"
                            aria-label={`Remove ${val}`}
                        >
                            <Icon name="x" className="w-3 h-3" />
                        </button>
                    </span>
                ))}
                <Icon name="chevron-down" className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {options.map(opt => (
                        <label key={opt.id} className="flex items-center space-x-3 px-3 py-2 hover:bg-slate-700 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedValues.includes(opt.value)}
                                onChange={() => handleToggleOption(opt.value)}
                                className="form-checkbox h-4 w-4 rounded bg-slate-900 border-slate-600 text-sky-500 focus:ring-sky-500"
                            />
                            <span className="text-slate-200">{opt.value}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

const KeyValueInput: React.FC<KeyValueInputProps> = ({ values, onChange, keyPlaceholder = "Key", valuePlaceholder = "Value" }) => {
    const [tagDefinitions, setTagDefinitions] = useState<TagDefinition[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get<{ items: TagDefinition[], total: number }>('/settings/tags')
            .then(res => setTagDefinitions(res.data.items))
            .catch(err => {
                console.error("Failed to load tag definitions", err);
                showToast('無法載入標籤定義。', 'error');
            })
            .finally(() => setIsLoading(false));
    }, []);

    const handleAdd = () => {
        onChange([...values, { id: `kv-${Date.now()}`, key: '', value: '' }]);
    };

    const handleRemove = (id: string) => {
        onChange(values.filter(v => v.id !== id));
    };

    const handleChange = (id: string, field: 'key' | 'value', fieldValue: string) => {
        onChange(values.map(v => {
            if (v.id === id) {
                const updated = { ...v, [field]: fieldValue };
                // Reset value if key changes
                if (field === 'key') {
                    updated.value = '';
                }
                return updated;
            }
            return v;
        }));
    };

    return (
        <div className="space-y-2">
            {values.map(item => {
                const tagDef = tagDefinitions.find(t => t.key === item.key);
                return (
                    <div key={item.id} className="flex items-center space-x-2">
                        <select
                            value={item.key}
                            onChange={(e) => handleChange(item.id, 'key', e.target.value)}
                            className="w-full bg-slate-700 rounded-md px-3 py-2 text-sm"
                            disabled={isLoading}
                        >
                            <option value="">{isLoading ? '載入中...' : keyPlaceholder}</option>
                            {tagDefinitions.map(tag => <option key={tag.key} value={tag.key}>{tag.key}</option>)}
                        </select>
                        <span className="text-slate-400">=</span>
                        {tagDef && tagDef.allowed_values.length > 0 ? (
                            <MultiSelectDropdown
                                options={tagDef.allowed_values}
                                selectedValues={item.value ? item.value.split(',').filter(Boolean) : []}
                                onChange={(newValues) => handleChange(item.id, 'value', newValues.join(','))}
                                placeholder={valuePlaceholder}
                            />
                        ) : (
                            <input
                                type="text"
                                placeholder={valuePlaceholder}
                                value={item.value}
                                onChange={(e) => handleChange(item.id, 'value', e.target.value)}
                                className="w-full bg-slate-700 rounded-md px-3 py-2 text-sm"
                                disabled={!item.key}
                            />
                        )}
                        <button type="button" onClick={() => handleRemove(item.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-full">
                            <Icon name="trash-2" className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
            <button type="button" onClick={handleAdd} className="text-sm text-sky-400 hover:text-sky-300 flex items-center">
                <Icon name="plus" className="w-4 h-4 mr-1" /> Add Tag
            </button>
        </div>
    );
};

export default KeyValueInput;
