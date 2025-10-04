import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Input, theme, Tooltip } from 'antd';
import type { SearchProps } from 'antd/es/input/Search';
import styles from './QuickFilterBar.module.css';

export interface QuickFilterOption {
    label: string;             // 顯示文字
    value: string;             // 篩選值
    count?: number;            // 可選統計數
    color?: string;            // 可選主題色（覆寫預設主色）
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
    showSearch?: boolean;                 // 是否顯示搜尋框
    onSearch?: (keyword: string) => void; // 搜尋文字變更事件
    placeholder?: string;                 // 搜尋框佔位文字
    label?: React.ReactNode;              // 左側標籤文字
    className?: string;                   // 自訂樣式
    searchProps?: SearchProps;            // 轉傳給搜尋框的額外屬性
    emptyText?: string;                   // 空狀態顯示文字
    searchValue?: string;                 // 搜尋框外部受控值
}

const QuickFilterBar: React.FC<QuickFilterBarProps> = ({
    options,
    mode = 'single',
    value,
    defaultValue,
    onChange,
    showCount = true,
    showSearch = false,
    onSearch,
    placeholder = '輸入關鍵字',
    label = '快速篩選',
    className,
    searchProps,
    emptyText = '目前沒有可用的篩選項目',
    searchValue,
}) => {
    const { token } = theme.useToken();

    // 是否由外部控制 value
    const isControlled = typeof value !== 'undefined';
    const isSearchControlled = typeof searchValue !== 'undefined';

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

    const [keyword, setKeyword] = useState(() => searchValue ?? '');

    // 受控模式同步內部狀態
    useEffect(() => {
        if (isControlled) {
            setInternalValue(value ?? []);
        }
    }, [isControlled, value]);

    useEffect(() => {
        if (isSearchControlled) {
            setKeyword(searchValue ?? '');
        }
    }, [isSearchControlled, searchValue]);

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

    const handleSearchChange = useCallback((nextKeyword: string) => {
        if (!isSearchControlled) {
            setKeyword(nextKeyword);
        }
        onSearch?.(nextKeyword);
    }, [isSearchControlled, onSearch]);

    const { onChange: searchOnChange, onSearch: searchOnSearch, ...restSearchProps } = searchProps ?? {};

    // 按鈕基礎樣式
    const baseButtonStyle = useMemo(() => ({
        backgroundColor: token.colorBgElevated,
        borderColor: token.colorBorder,
        color: token.colorTextSecondary,
    }), [token.colorBgElevated, token.colorBorder, token.colorTextSecondary]);

    return (
        <div
            className={[styles.container, className].filter(Boolean).join(' ')}
            style={{ backgroundColor: 'transparent' }}
        >
            <div className={styles.options}>
                {label && (
                    <span
                        className={styles.label}
                        style={{ color: token.colorTextSecondary }}
                    >
                        {label}
                    </span>
                )}
                {options.length === 0 ? (
                    <span
                        className={styles.emptyText}
                        style={{ color: token.colorTextQuaternary }}
                    >
                        {emptyText}
                    </span>
                ) : (
                    options.map(option => {
                        const isSelected = selectedValues.includes(option.value);
                        const activeColor = option.color || token.colorPrimary;
                        const buttonStyle = isSelected
                            ? {
                                backgroundColor: activeColor,
                                borderColor: activeColor,
                                color: token.colorTextLightSolid,
                            }
                            : baseButtonStyle;
                        const content = (
                            <Button
                                key={option.value}
                                size="small"
                                shape="round"
                                aria-pressed={isSelected}
                                className={styles.optionButton}
                                style={buttonStyle}
                                onClick={() => handleOptionClick(option.value)}
                            >
                                {option.icon}
                                <span>{option.label}</span>
                                {showCount && typeof option.count === 'number' && (
                                    <span
                                        className={styles.count}
                                        style={{ color: isSelected ? token.colorTextLightSolid : token.colorTextSecondary }}
                                    >
                                        {option.count}
                                    </span>
                                )}
                            </Button>
                        );
                        if (option.tooltip) {
                            return (
                                <Tooltip key={option.value} title={option.tooltip}>
                                    {content}
                                </Tooltip>
                            );
                        }
                        return content;
                    })
                )}
            </div>
            {showSearch && (
                <div className={styles.trailing}>
                    <Input.Search
                        allowClear
                        className={styles.search}
                        value={keyword}
                        placeholder={placeholder}
                        onChange={(event) => {
                            handleSearchChange(event.target.value);
                            searchOnChange?.(event);
                        }}
                        onSearch={(nextValue, event, info) => {
                            handleSearchChange(nextValue);
                            searchOnSearch?.(nextValue, event, info);
                        }}
                        {...restSearchProps}
                    />
                </div>
            )}
        </div>
    );
};

export default QuickFilterBar;
