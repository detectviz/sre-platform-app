import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Segmented, Select, theme } from 'antd';
import { LayoutWidget, KpiDataEntry, KpiCardColor, TableColumn } from '@/shared/types';
import Icon from '@/shared/components/Icon';
import IconButton from '@/shared/components/IconButton';
import Modal from '@/shared/components/Modal';
import api from '@/services/api';
import { showToast } from '@/services/toast';
import { useContent } from '@/contexts/ContentContext';
import StatusTag from '@/shared/components/StatusTag';
import { formatTimestamp } from '@/shared/utils/time';
import KpiCard, { getKpiCardPalette } from '@/shared/components/KpiCard';
import { useTheme } from '@/contexts/ThemeContext';
import Toolbar, { ToolbarButton } from '@/shared/components/Toolbar';
import TableContainer from '@/shared/components/TableContainer';
import SortableColumnHeaderCell from '@/shared/components/SortableColumnHeaderCell';
import Pagination from '@/shared/components/Pagination';
import { useTableSorting } from '@/shared/hooks/useTableSorting';
import { usePageMetadata } from '@/contexts/PageMetadataContext';

interface ListItemProps {
    widget: LayoutWidget;
    onAction: () => void;
    actionIcon: string;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    isSelectedList?: boolean;
    onSelect?: (widget: LayoutWidget) => void;
    isActive?: boolean;
    color?: KpiCardColor;
    colorOptions?: { label: React.ReactNode; value: KpiCardColor; title: string }[];
    onColorChange?: (tone: KpiCardColor) => void;
}

const KPI_CARD_COLOR_LABELS: Record<KpiCardColor, string> = {
    default: '預設',
    success: '成功',
    warning: '警示',
    error: '錯誤',
    info: '資訊',
    performance: '效能',
    monitoring: '監控',
};
const ListItem: React.FC<ListItemProps> = ({
    widget,
    onAction,
    actionIcon,
    onMoveUp,
    onMoveDown,
    isSelectedList = false,
    onSelect,
    isActive = false,
    color,
    colorOptions,
    onColorChange,
}) => {
    const handleMove = useCallback((moveFn?: () => void) => () => {
        if (moveFn) {
            moveFn();
        }
    }, []);

    const handleSelect = useCallback(() => {
        if (onSelect) {
            onSelect(widget);
        }
    }, [onSelect, widget]);

    const handleActionClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onAction();
    }, [onAction]);

    const handleMoveClick = useCallback((event: React.MouseEvent<HTMLButtonElement>, moveFn?: () => void) => {
        event.stopPropagation();
        if (moveFn) {
            moveFn();
        }
    }, []);

    const resolvedColor = color ?? 'default';
    const selectedColorLabel = colorOptions?.find(option => option.value === resolvedColor)?.title;

    return (
        <div
            role="button"
            tabIndex={0}
            draggable={isSelectedList}
            data-widget-id={widget.id}
            onDragStart={(e) => {
                if (isSelectedList) {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', widget.id);
                    e.currentTarget.classList.add('opacity-50', 'scale-95');
                }
            }}
            onDragEnd={(e) => {
                e.currentTarget.classList.remove('opacity-50', 'scale-95');
            }}
            onClick={handleSelect}
            onKeyDown={(event) => {
                if ((event.key === 'Enter' || event.key === ' ') && onSelect) {
                    event.preventDefault();
                    onSelect(widget);
                }
            }}
            className={`flex items-center justify-between rounded-md border px-2 py-2 transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-500/50 ${isSelectedList
                ? 'border-slate-700/80 bg-slate-800/60 hover:bg-slate-700/80 cursor-grab'
                : 'border-slate-800/60 bg-slate-900/40 hover:border-slate-700/80 hover:bg-slate-800/40'
                } ${isActive ? 'border-sky-500/60 bg-sky-500/10' : ''}`}
        >
            <div className="flex items-start gap-4">
                <span className={`mt-1 ${isSelectedList ? 'text-slate-400 cursor-grab active:cursor-grabbing' : 'text-slate-500'}`}>
                    <Icon name={isSelectedList ? 'grip-vertical' : 'layout-dashboard'} className={`w-4 h-4 ${isSelectedList ? 'hover:text-slate-300' : ''}`} />
                </span>
                <div className="space-y-1 flex-1 min-w-0 max-w-[200px]">
                    <p className="text-sm font-medium text-white truncate">{widget.name}</p>
                    <p className="text-xs text-slate-400 line-clamp-1">{widget.description}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {isSelectedList && (
                    <>
                        <button
                            onClick={(event) => handleMoveClick(event, onMoveUp)}
                            disabled={!onMoveUp}
                            className={`p-1.5 rounded transition-colors ${onMoveUp
                                ? 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                                : 'text-slate-600 opacity-30 cursor-not-allowed'
                                }`}
                            title={onMoveUp ? "上移" : "已到頂部"}
                        >
                            <Icon name="chevron-up" className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={(event) => handleMoveClick(event, onMoveDown)}
                            disabled={!onMoveDown}
                            className={`p-1.5 rounded transition-colors ${onMoveDown
                                ? 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                                : 'text-slate-600 opacity-30 cursor-not-allowed'
                                }`}
                            title={onMoveDown ? "下移" : "已到底部"}
                        >
                            <Icon name="chevron-down" className="w-3.5 h-3.5" />
                        </button>
                    </>
                )}
                <button
                    onClick={handleActionClick}
                    className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
                    title={isSelectedList ? '移除卡片' : '加入卡片'}
                >
                    <Icon name={actionIcon} className="w-3.5 h-3.5" />
                </button>
                {isSelectedList && colorOptions && onColorChange && (
                    <div
                        onClick={(event) => event.stopPropagation()}
                        onMouseDown={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                    >
                        <Select
                            size="small"
                            value={resolvedColor}
                            options={colorOptions}
                            className="w-20"
                            popupClassName="kpi-color-select-dropdown"
                            dropdownMatchSelectWidth={false}
                            aria-label={`${widget.name} 顏色設定`}
                            title={selectedColorLabel}
                            onChange={(value) => onColorChange(value as KpiCardColor)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};


// Dual List Selector Component
interface DualListSelectorProps {
    available: LayoutWidget[];
    selected: LayoutWidget[];
    onChange: (newSelected: LayoutWidget[]) => void;
    activeWidgetId?: string | null;
    onActiveWidgetChange?: (widgetId: string | null) => void;
    draftKpiData: Record<string, KpiDataEntry>;
    baselineKpiData: Record<string, KpiDataEntry>;
    onColorChange: (widgetId: string, tone: KpiCardColor) => void;
    kpiColorOptions: { label: React.ReactNode; value: KpiCardColor; title: string }[];
}

const DualListSelector: React.FC<DualListSelectorProps> = ({
    available,
    selected,
    onChange,
    activeWidgetId,
    onActiveWidgetChange,
    draftKpiData,
    baselineKpiData,
    onColorChange,
    kpiColorOptions,
}) => {
    const { content } = useContent();
    const pageContent = content?.LAYOUT_SETTINGS;

    const handleAdd = (widget: LayoutWidget) => {
        onChange([...selected, widget]);
        onActiveWidgetChange?.(widget.id);
    };

    const handleRemove = (widget: LayoutWidget) => {
        const newSelected = selected.filter(w => w.id !== widget.id);
        onChange(newSelected);
        if (activeWidgetId === widget.id) {
            onActiveWidgetChange?.(newSelected[0]?.id ?? null);
        }
    };

    const move = (index: number, direction: 'up' | 'down') => {
        const newSelected = [...selected];
        if (direction === 'up' && index > 0) {
            [newSelected[index - 1], newSelected[index]] = [newSelected[index], newSelected[index - 1]];
        }
        if (direction === 'down' && index < newSelected.length - 1) {
            [newSelected[index + 1], newSelected[index]] = [newSelected[index], newSelected[index + 1]];
        }
        onChange(newSelected);
    };

    const autoSort = (mode: 'alphabetical' | 'frequency') => {
        const sorted = [...selected].sort((a, b) => {
            if (mode === 'alphabetical') {
                return a.name.localeCompare(b.name, 'zh-TW');
            } else {
                // 根據使用頻率排序（這裡簡化為按名稱長度作為示例）
                return b.name.length - a.name.length;
            }
        });
        onChange(sorted);
    };

    if (!pageContent) {
        return (
            <div className="col-span-2 flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900/40 p-6 text-slate-400">
                <Icon name="loader-circle" className="w-5 h-5 animate-spin mb-2" />
                <p className="text-sm">正在載入版面選項...</p>
            </div>
        );
    }

    const availableCount = available.length;
    const selectedCount = selected.length;

    return (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 md:grid-cols-2 items-start">
            <div className="rounded-lg border border-slate-800/60 bg-slate-900/50 p-4 min-h-[280px]">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">{pageContent.AVAILABLE_WIDGETS}</h3>
                    <StatusTag dense tone="neutral" icon="list" label={`${availableCount} 項`} />
                </div>
                <p className="mb-3 text-xs text-slate-400">選擇要顯示的指標卡片</p>
                {availableCount > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {available.map(w => (
                            <ListItem key={w.id} widget={w} onAction={() => handleAdd(w)} actionIcon="chevron-right" />
                        ))}
                    </div>
                ) : (
                    <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-700 text-xs text-slate-400">
                        <span className="flex items-center gap-2"><Icon name="check-circle" className="w-4 h-4" />所有支援卡片皆已顯示</span>
                    </div>
                )}
            </div>
            <div className="rounded-lg border border-slate-800/60 bg-slate-900/50 p-4 min-h-[280px]">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">{pageContent.DISPLAYED_WIDGETS}</h3>
                    <div className="flex items-center gap-1">
                        <StatusTag dense tone="info" icon="layout-dashboard" label={`${selectedCount} 張`} />
                        {selectedCount > 1 && (
                            <>
                                <button
                                    onClick={() => autoSort('alphabetical')}
                                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700/60"
                                    title="按字母順序自動排序"
                                >
                                    <Icon name="sort-asc" className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => autoSort('frequency')}
                                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700/60"
                                    title="按使用頻率自動排序"
                                >
                                    <Icon name="activity" className="w-3 h-3" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
                <p className="mb-3 text-xs text-slate-400">拖拽調整顯示順序</p>
                {selectedCount > 0 ? (
                    <div
                        className="space-y-2 min-h-[200px] max-h-64 overflow-y-auto pr-1"
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            const draggedId = e.dataTransfer.getData('text/plain');
                            const draggedIndex = selected.findIndex(w => w.id === draggedId);

                            if (draggedIndex !== -1) {
                                // 獲取拖拽目標位置
                                const dropTarget = e.target as HTMLElement;
                                const listItem = dropTarget.closest('[draggable="true"]');

                                if (listItem) {
                                    const targetId = listItem.getAttribute('data-widget-id');
                                    const targetIndex = selected.findIndex(w => w.id === targetId);

                                    if (targetIndex !== -1 && targetIndex !== draggedIndex) {
                                        // 重新排序陣列
                                        const newSelected = [...selected];
                                        const [draggedItem] = newSelected.splice(draggedIndex, 1);
                                        newSelected.splice(targetIndex, 0, draggedItem);
                                        onChange(newSelected);
                                    }
                                }
                            }
                        }}
                    >
                        {selected.map((w, i) => (
                            <ListItem
                                key={w.id}
                                widget={w}
                                onAction={() => handleRemove(w)}
                                actionIcon="chevron-left"
                                onMoveUp={i > 0 ? () => move(i, 'up') : undefined}
                                onMoveDown={i < selected.length - 1 ? () => move(i, 'down') : undefined}
                                isSelectedList={true}
                                onSelect={() => onActiveWidgetChange?.(w.id)}
                                isActive={activeWidgetId === w.id}
                                color={draftKpiData[w.id]?.color ?? baselineKpiData[w.id]?.color ?? 'default'}
                                colorOptions={kpiColorOptions}
                                onColorChange={(tone) => onColorChange(w.id, tone)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-700 text-xs text-slate-400">
                        <span className="flex items-center gap-2"><Icon name="inbox" className="w-4 h-4" />尚未選擇任何卡片</span>
                    </div>
                )}
            </div>
        </div>
    );
};

interface LayoutConfig {
    widget_ids: string[];
    updated_at: string;
    updated_by: string;
}
type LayoutsData = Record<string, LayoutConfig>;

const relativeFormatter = new Intl.RelativeTimeFormat('zh-TW', { numeric: 'auto' });

const formatRelativeFromNow = (value?: string) => {
    if (!value) {
        return '—';
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }
    const diffMs = parsed.getTime() - Date.now();
    const thresholds: { limit: number; divisor: number; unit: Intl.RelativeTimeFormatUnit }[] = [
        { limit: 60_000, divisor: 1_000, unit: 'second' },
        { limit: 3_600_000, divisor: 60_000, unit: 'minute' },
        { limit: 86_400_000, divisor: 3_600_000, unit: 'hour' },
        { limit: 604_800_000, divisor: 86_400_000, unit: 'day' },
        { limit: Number.POSITIVE_INFINITY, divisor: 604_800_000, unit: 'week' },
    ];
    for (const { limit, divisor, unit } of thresholds) {
        if (Math.abs(diffMs) < limit) {
            return relativeFormatter.format(Math.round(diffMs / divisor), unit);
        }
    }
    return relativeFormatter.format(Math.round(diffMs / 2_592_000_000), 'month');
};

// Main Page Component
const PAGE_IDENTIFIER = 'layout_settings';

const LayoutSettingsPage: React.FC = () => {
    const [layouts, setLayouts] = useState<LayoutsData>({});
    const [allWidgets, setAllWidgets] = useState<LayoutWidget[]>([]);
    const [kpiData, setKpiData] = useState<Record<string, KpiDataEntry>>({});
    const [draftKpiData, setDraftKpiData] = useState<Record<string, KpiDataEntry>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [allColumns, setAllColumns] = useState<TableColumn[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

    const { metadata: pageMetadata } = usePageMetadata();
    const pageKey = pageMetadata?.[PAGE_IDENTIFIER]?.column_config_key;

    const { sortConfig, sortParams, handleSort } = useTableSorting({ defaultSortKey: 'name', defaultSortDirection: 'asc' });

    // Initialize allColumns
    useEffect(() => {
        const columns: TableColumn[] = [
            { key: 'name', label: '頁面名稱', sortable: true },
            { key: 'displayed', label: '已顯示', sortable: false },
            { key: 'available', label: '可用', sortable: false },
            { key: 'maintainer', label: '維護人員', sortable: false },
            { key: 'updated', label: '最後更新', sortable: true },
            { key: 'actions', label: '操作', sortable: false },
        ];
        setAllColumns(columns);
        setVisibleColumns(columns.map(c => c.key));
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<string | null>(null);
    const [modalWidgets, setModalWidgets] = useState<LayoutWidget[]>([]);
    const [activeWidgetId, setActiveWidgetId] = useState<string | null>(null);
    const [isColumnSettingsModalOpen, setIsColumnSettingsModalOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const { content } = useContent();
    const pageContent = content?.LAYOUT_SETTINGS;
    const globalContent = content?.GLOBAL;
    const { token } = theme.useToken();
    const { theme: themeMode } = useTheme();
    const colorLabelOverrides = (pageContent?.KPI_CARD_COLOR_LABELS as Partial<Record<KpiCardColor, string>> | undefined) ?? undefined;
    const kpiColorOptions = useMemo(() => {
        // 只保留常用的顏色選項
        const tones: KpiCardColor[] = ['default', 'success', 'warning', 'error', 'info', 'performance', 'monitoring'];
        return tones.map((tone) => {
            const palette = getKpiCardPalette(token, tone);
            const labelText = colorLabelOverrides?.[tone] ?? KPI_CARD_COLOR_LABELS[tone];

            // 使用原始的背景色，讓選擇器顯示真正的背景色
            const backgroundColor = palette.background;

            return {
                label: (
                    <div className="flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                            background: backgroundColor,
                            color: palette.value,
                            border: `1px solid ${palette.swatchBorder ?? token.colorBorderSecondary ?? token.colorBorder}`,
                            minWidth: '44px',
                            maxWidth: '48px',
                            height: '18px',
                            fontSize: '11px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                        title={labelText}>
                        {labelText}
                    </div>
                ),
                value: tone,
                title: labelText,
            };
        });
    }, [colorLabelOverrides, themeMode, token]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [layoutsRes, widgetsRes, kpiDataRes] = await Promise.all([
                api.get<LayoutsData>('/settings/layouts'),
                api.get<LayoutWidget[]>('/settings/widgets'),
                api.get<Record<string, KpiDataEntry>>('/kpi-data')
            ]);
            setLayouts(layoutsRes.data);
            setAllWidgets(widgetsRes.data);
            setKpiData(kpiDataRes.data);
            const clonedKpiData = Object.fromEntries(
                Object.entries(kpiDataRes.data).map(([key, value]) => [key, { ...value }])
            ) as Record<string, KpiDataEntry>;
            setDraftKpiData(clonedKpiData);
        } catch (err) {
            setError(pageContent?.FETCH_ERROR || '無法獲取版面配置資料。');
        } finally {
            setIsLoading(false);
        }
    }, [pageContent]);

    useEffect(() => {
        if (pageContent) {
            fetchData();
        }
    }, [fetchData, pageContent]);

    useEffect(() => {
        if (!isModalOpen) {
            return;
        }
        const hasActive = activeWidgetId && modalWidgets.some(widget => widget.id === activeWidgetId);
        if (!hasActive) {
            setActiveWidgetId(modalWidgets[0]?.id ?? null);
        }
    }, [activeWidgetId, modalWidgets, isModalOpen]);

    const activeWidget = useMemo(
        () => modalWidgets.find(widget => widget.id === activeWidgetId) ?? null,
        [modalWidgets, activeWidgetId]
    );
    const activeKpiEntry = activeWidgetId ? draftKpiData[activeWidgetId] ?? kpiData[activeWidgetId] ?? null : null;
    const resolvedActiveColor: KpiCardColor = activeKpiEntry?.color ?? 'default';

    const getWidgetById = (id: string) => allWidgets.find(w => w.id === id);

    const handleEditClick = (pageName: string) => {
        setEditingPage(pageName);
        const widget_ids = layouts[pageName]?.widget_ids || [];
        const selected = widget_ids.map(id => getWidgetById(id)).filter(Boolean) as LayoutWidget[];
        setModalWidgets(selected);
        setActiveWidgetId(selected[0]?.id ?? null);
        const cloned = Object.fromEntries(
            Object.entries(kpiData).map(([key, value]) => [key, value && typeof value === 'object' ? { ...value } : value])
        ) as typeof kpiData;
        setDraftKpiData(cloned);
        setIsModalOpen(true);
    };

    const handleColorChange = useCallback((widgetId: string, tone: KpiCardColor) => {
        setDraftKpiData((prev) => {
            const existing = prev[widgetId] ?? kpiData[widgetId];
            const nextEntry: KpiDataEntry = existing ? { ...existing, color: tone } : { value: '—', color: tone };
            return { ...prev, [widgetId]: nextEntry };
        });
    }, [kpiData]);

    const handleSaveLayout = async () => {
        if (editingPage) {
            const newSelectedIds = modalWidgets.map(w => w.id);
            const currentLayoutConfig = layouts[editingPage] || { widget_ids: [], updated_at: '', updated_by: '' };
            const updatedLayouts = { ...layouts, [editingPage]: { ...currentLayoutConfig, widget_ids: newSelectedIds } };

            try {
                const [layoutsResponse, kpiResponse] = await Promise.all([
                    api.put<LayoutsData>('/settings/layouts', updatedLayouts),
                    api.put<Record<string, KpiDataEntry>>('/kpi-data', draftKpiData)
                ]);
                const savedLayouts = layoutsResponse.data;
                const savedKpiData = kpiResponse.data;
                setLayouts(savedLayouts);
                setKpiData(savedKpiData);
                const cloned = Object.fromEntries(
                    Object.entries(savedKpiData).map(([key, value]) => [key, { ...value }])
                ) as typeof savedKpiData;
                setDraftKpiData(cloned);
                // Also update localStorage for immediate UI feedback on other pages via PageKPIs
                localStorage.setItem('sre-platform-layouts', JSON.stringify(savedLayouts));
                window.dispatchEvent(new Event('storage'));
                showToast('版面配置已成功儲存。', 'success');
                setIsModalOpen(false);
                setEditingPage(null);
            } catch (err) {
                showToast(pageContent?.SAVE_ERROR || '儲存版面配置失敗。', 'error');
            }
        }
    };

    const handleSaveColumnConfig = async (newColumnKeys: string[]) => {
        if (!pageKey) {
            showToast('無法儲存欄位設定：頁面設定遺失。', 'error');
            return;
        }
        try {
            await api.put(`/settings/column-config/${pageKey}`, newColumnKeys);
            setVisibleColumns(newColumnKeys);
            showToast('欄位設定已儲存。', 'success');
        } catch (err) {
            showToast('無法儲存欄位設定。', 'error');
        } finally {
            setIsColumnSettingsModalOpen(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await api.get('/settings/layouts', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `layout-settings-${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            showToast('版面設定已匯出。', 'success');
        } catch (err) {
            showToast('匯出失敗。', 'error');
        }
    };

    const availableWidgetsForModal = allWidgets.filter(w =>
        !modalWidgets.some(selected => selected.id === w.id) &&
        w.supported_pages.includes(editingPage || '')
    );

    const leftActions = (
        <ToolbarButton icon="search" text="搜索和篩選" onClick={() => setIsSearchModalOpen(true)} />
    );

    const rightActions = (
        <>
            <ToolbarButton icon="upload" text="匯入" onClick={() => setIsImportModalOpen(true)} />
            <ToolbarButton icon="download" text="匯出" onClick={handleExport} />
            <ToolbarButton icon="settings-2" text="欄位設定" onClick={() => setIsColumnSettingsModalOpen(true)} />
        </>
    );

    if (isLoading || !pageContent || !globalContent) {
        return (
            <div className="flex items-center justify-center h-full">
                <Icon name="loader-circle" className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-red-400">
                <Icon name="alert-circle" className="w-12 h-12 mb-4" />
                <h2 className="text-xl font-bold">{error}</h2>
                <button onClick={fetchData} className="mt-4 px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">
                    {globalContent.RETRY}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Toolbar leftActions={leftActions} rightActions={rightActions} />

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0 z-10">
                            <tr>
                                <SortableColumnHeaderCell
                                    column={allColumns.find(c => c.key === 'name')}
                                    columnKey="name"
                                    sortConfig={sortConfig}
                                    onSort={handleSort}
                                />
                                <th scope="col" className="px-6 py-3 text-center">已顯示</th>
                                <th scope="col" className="px-6 py-3 text-center">可用</th>
                                <th scope="col" className="px-6 py-3">維護人員</th>
                                <SortableColumnHeaderCell
                                    column={allColumns.find(c => c.key === 'updated')}
                                    columnKey="updated"
                                    sortConfig={sortConfig}
                                    onSort={handleSort}
                                />
                                <th scope="col" className="px-6 py-3 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {Object.keys(layouts).map(pageName => {
                                const pageLayout = layouts[pageName];
                                const widget_ids = pageLayout?.widget_ids || [];
                                const displayedCount = widget_ids.length;
                                const supportedCount = allWidgets.filter(w => w.supported_pages.includes(pageName)).length;
                                const lastUpdatedAt = pageLayout?.updated_at;
                                const lastUpdatedAbsolute = lastUpdatedAt ? formatTimestamp(lastUpdatedAt, { showSeconds: false }) : '—';
                                const lastUpdatedRelative = formatRelativeFromNow(lastUpdatedAt);

                                return (
                                    <tr key={pageName} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-white">{pageName}</span>
                                                <span className="text-xs text-slate-400">
                                                    {widget_ids.length > 0 ? (
                                                        widget_ids.slice(0, 3).map(id => {
                                                            const widget = allWidgets.find(w => w.id === id);
                                                            return widget?.name || '未命名';
                                                        }).join('、') + (widget_ids.length > 3 ? '...' : '')
                                                    ) : '尚未設定'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <StatusTag dense tone="info" icon="layout-dashboard" label={displayedCount.toString()} />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <StatusTag dense tone="neutral" icon="layers" label={supportedCount.toString()} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-slate-200">{pageLayout?.updated_by || '—'}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-slate-200">{lastUpdatedAbsolute}</span>
                                                <span className="text-xs text-slate-400">{lastUpdatedRelative}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <IconButton
                                                icon="edit-3"
                                                label="編輯版面"
                                                tooltip="編輯版面設定"
                                                onClick={() => handleEditClick(pageName)}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    total={total}
                    page={currentPage}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                />
            </div>

            <Modal
                title={pageContent.EDIT_MODAL_TITLE?.replace('{pageName}', editingPage || '') || '編輯 KPI 卡片'}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                width="w-full max-w-5xl"
                footer={
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsModalOpen(false)} className="rounded-md border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700/80">{globalContent.CANCEL}</button>
                        <button onClick={handleSaveLayout} className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500/90">{globalContent.SAVE}</button>
                    </div>
                }
            >
                {editingPage && (
                    <div className="flex flex-col gap-4">
                        {/* 上半部：預覽 */}
                        <div className="flex flex-col gap-4">
                            <div className="flex h-full flex-col gap-5 rounded-xl border border-slate-800/60 bg-slate-900/50 p-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-white">已顯示欄位預覽</p>
                                    <span className="text-xs text-slate-500">{modalWidgets.length} 張卡片</span>
                                </div>
                                <div className="flex-1 min-h-0">
                                    {modalWidgets.length > 0 ? (
                                        <div className="flex gap-4">
                                            {modalWidgets.map(widget => {
                                                const kpiEntry = draftKpiData[widget.id] ?? kpiData[widget.id];
                                                const color = draftKpiData[widget.id]?.color ?? kpiData[widget.id]?.color ?? 'default';
                                                return (
                                                    <div className="flex-1 min-w-0">
                                                        <KpiCard
                                                            key={widget.id}
                                                            title={widget.name}
                                                            value={kpiEntry?.value ?? '—'}
                                                            unit={kpiEntry?.unit}
                                                            description={kpiEntry?.description || ''}
                                                            color={color as KpiCardColor}
                                                            trend={kpiEntry?.trend ?? null}
                                                            change={kpiEntry?.change}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/30 p-6 text-sm text-slate-400">
                                            尚未選擇任何 KPI 卡片
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 下半部：雙欄選擇器 */}
                        <div>
                            <DualListSelector
                                available={availableWidgetsForModal}
                                selected={modalWidgets}
                                onChange={setModalWidgets}
                                activeWidgetId={activeWidgetId}
                                onActiveWidgetChange={setActiveWidgetId}
                                draftKpiData={draftKpiData}
                                baselineKpiData={kpiData}
                                onColorChange={handleColorChange}
                                kpiColorOptions={kpiColorOptions}
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default LayoutSettingsPage;