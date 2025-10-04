import React, { useCallback, useEffect, useState } from 'react';

export interface QuickFilterOption {
    label: string;             // 顯示文字
    value: string;             // 篩選值
    count?: number;            // 可選統計數
    icon?: React.ReactNode;    // 可選圖示
    tooltip?: string;          // 額外補充說明
}

export interface QuickFilterBarProps {
    options: QuickFilterOption[];
    mode?: 'single' | 'multiple';         // 單選或多選
    value?: string[];                     // 外部受控值
    defaultValue?: string[];              // 非受控預設值
    onChange?: (value: string[]) => void; // 值變更事件
    showCount?: boolean;                  // 是否顯示統計
    label?: React.ReactNode;              // 左側標籤文字
    className?: string;                   // 自訂樣式
    emptyText?: string;                   // 空狀態顯示文字
}

const QuickFilterBar: React.FC<QuickFilterBarProps> = ({
    options,
    mode = 'single',
    value,
    defaultValue,
    onChange,
    showCount = true,
    label,
    className = '',
    emptyText = '目前沒有可用的篩選項目',
}) => {
    // 是否由外部控制 value
    const isControlled = typeof value !== 'undefined';

    // 內部狀態支援非受控模式
    const [internalValue, setInternalValue] = useState<string[]>(() => {
        if (isControlled) {
            return value ?? [];
        }
        if (defaultValue && defaultValue.length > 0) {
            return defaultValue;
        }
        return [];
    });

    // 受控模式同步內部狀態
    useEffect(() => {
        if (isControlled) {
            setInternalValue(value ?? []);
        }
    }, [isControlled, value]);

    const selectedValues = isControlled ? (value ?? []) : internalValue;

    const handleUpdate = useCallback((next: string[]) => {
        if (!isControlled) {
            setInternalValue(next);
        }
        onChange?.(next);
    }, [isControlled, onChange]);

    const handleOptionClick = useCallback((optionValue: string) => {
        const current = selectedValues;
        let next: string[] = [];
        if (mode === 'single') {
            // 單選模式：點選相同值時允許反選為空陣列
            if (current.length === 1 && current[0] === optionValue) {
                next = [];
            } else {
                next = [optionValue];
            }
        } else {
            const isSelected = current.includes(optionValue);
            next = isSelected
                ? current.filter(item => item !== optionValue)
                : [...current, optionValue];
        }
        handleUpdate(next);
    }, [handleUpdate, mode, selectedValues]);

    return (
        <div className={`flex items-center gap-3 flex-wrap w-full px-4 py-3 bg-slate-900/30 border border-slate-700/50 rounded-lg ${className}`}>
            {label && (
                <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">
                    {label}
                </span>
            )}

            <div className="flex items-center flex-wrap gap-2 flex-1 min-h-[36px]">
                {options.length === 0 ? (
                    <span className="text-xs text-slate-500 inline-flex items-center">
                        {emptyText}
                    </span>
                ) : (
                    options.map(option => {
                        const isSelected = selectedValues.includes(option.value);
                        return (
                            <button
                                key={option.value}
                                type="button"
                                aria-pressed={isSelected}
                                className={`
                                    inline-flex items-center gap-1 px-2.5 py-1
                                    rounded-full text-[11px] font-medium
                                    transition-all duration-150 ease-in-out
                                    focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950
                                    active:translate-y-[1px]
                                    ${isSelected
                                        ? 'bg-sky-600 text-white border border-sky-500 hover:bg-sky-500'
                                        : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:border-slate-600'
                                    }
                                `}
                                onClick={() => handleOptionClick(option.value)}
                                title={option.tooltip}
                            >
                                {option.icon}
                                <span>{option.label}</span>
                                {showCount && typeof option.count === 'number' && (
                                    <span className={`text-[10px] ${isSelected ? 'opacity-90' : 'opacity-75'}`}>
                                        {option.count}
                                    </span>
                                )}
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default QuickFilterBar;
