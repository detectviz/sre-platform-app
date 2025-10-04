import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Segmented, theme } from 'antd';
import { LayoutWidget, KpiDataEntry, KpiCardColor } from '../../../types';
import Icon from '../../../components/Icon';
import Modal from '../../../components/Modal';
import api from '../../../services/api';
import { showToast } from '../../../services/toast';
import { useContent } from '../../../contexts/ContentContext';
import StatusTag from '../../../components/StatusTag';
import { formatTimestamp } from '../../../utils/time';
import KpiCard, { getKpiCardPalette } from '../../../components/KpiCard';

interface ListItemProps {
    widget: LayoutWidget;
    onAction: () => void;
    actionIcon: string;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    isSelectedList?: boolean;
    onSelect?: (widget: LayoutWidget) => void;
    isActive?: boolean;
}

const KPI_CARD_COLOR_LABELS: Record<KpiCardColor, string> = {
    default: '預設',
    primary: '主要',
    success: '成功',
    warning: '警示',
    error: '錯誤',
    info: '資訊',
    performance: '效能',
    resource: '資源',
    health: '健康',
    monitoring: '監控',
};
const ListItem: React.FC<ListItemProps> = ({ widget, onAction, actionIcon, onMoveUp, onMoveDown, isSelectedList = false, onSelect, isActive = false }) => {
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

    return (
        <div
            role="button"
            tabIndex={0}
            draggable={isSelectedList}
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
            className={`flex items-center justify-between rounded-lg border px-3 py-2.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 ${isSelectedList
                ? 'shadow-sm shadow-slate-900/40 hover:shadow-md hover:shadow-slate-900/60 cursor-grab active:cursor-grabbing'
                : 'hover:border-slate-700/80 hover:bg-slate-800/60'
                } ${isActive
                    ? 'border-sky-500/60 bg-sky-500/15 ring-1 ring-sky-500/30'
                    : 'border-slate-800/70 bg-slate-900/60'
                } cursor-pointer`}
        >
            <div className="flex items-start gap-3">
                <span className={`mt-1 ${isSelectedList ? 'text-slate-400 cursor-grab active:cursor-grabbing' : 'text-slate-500'}`}>
                    <Icon name={isSelectedList ? 'grip-vertical' : 'layout-dashboard'} className={`w-4 h-4 ${isSelectedList ? 'hover:text-slate-300' : ''}`} />
                </span>
                <div className="space-y-1 flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{widget.name}</p>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{widget.description}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                        <StatusTag dense tone="neutral" icon="layers" label={`支援頁面 ${widget.supported_pages.length}`} />
                        {isSelectedList && <StatusTag dense tone="info" icon="eye" label="已顯示" />}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {isSelectedList && (
                    <>
                        <button
                            onClick={(event) => handleMoveClick(event, onMoveUp)}
                            disabled={!onMoveUp}
                            className={`p-2 rounded-md transition-all duration-200 ${onMoveUp
                                ? 'text-slate-300 hover:text-white hover:bg-slate-700 hover:scale-105'
                                : 'text-slate-600 cursor-not-allowed opacity-30'
                                }`}
                            title={onMoveUp ? "上移" : "已到頂部，無法上移"}
                        >
                            <Icon name="arrow-up" className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(event) => handleMoveClick(event, onMoveDown)}
                            disabled={!onMoveDown}
                            className={`p-2 rounded-md transition-all duration-200 ${onMoveDown
                                ? 'text-slate-300 hover:text-white hover:bg-slate-700 hover:scale-105'
                                : 'text-slate-600 cursor-not-allowed opacity-30'
                                }`}
                            title={onMoveDown ? "下移" : "已到底部，無法下移"}
                        >
                            <Icon name="arrow-down" className="w-4 h-4" />
                        </button>
                    </>
                )}
                <button
                    onClick={handleActionClick}
                    className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-700"
                    title={isSelectedList ? '移除卡片' : '加入卡片'}
                >
                    <Icon name={actionIcon} className="w-4 h-4" />
                </button>
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
}

const DualListSelector: React.FC<DualListSelectorProps> = ({ available, selected, onChange, activeWidgetId, onActiveWidgetChange }) => {
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
        <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">{pageContent.AVAILABLE_WIDGETS}</h3>
                    <StatusTag dense tone="neutral" icon="list" label={`${availableCount} 項`} />
                </div>
                <p className="mb-3 text-xs text-slate-400">拖曳或點擊右側箭頭即可加入儀表卡。僅顯示支援當前頁面的卡片。</p>
                {availableCount > 0 ? (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
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
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">{pageContent.DISPLAYED_WIDGETS}</h3>
                    <div className="flex items-center gap-2">
                        {selectedCount > 1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => autoSort('alphabetical')}
                                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-600 bg-slate-800/80 px-2 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700/80 hover:text-white transition-colors"
                                    title="按字母順序自動排序"
                                >
                                    <Icon name="sort-asc" className="w-3 h-3" />
                                    字母順序
                                </button>
                                <button
                                    onClick={() => autoSort('frequency')}
                                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-600 bg-slate-800/80 px-2 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700/80 hover:text-white transition-colors"
                                    title="按使用頻率自動排序"
                                >
                                    <Icon name="activity" className="w-3 h-3" />
                                    使用頻率
                                </button>
                            </div>
                        )}
                        <StatusTag dense tone="info" icon="layout-dashboard" label={`${selectedCount} 張`} />
                    </div>
                </div>
                <p className="mb-3 text-xs text-slate-400">調整順序以決定在儀表板中出現的先後，第一張將顯示在最左側。</p>
                {selectedCount > 0 ? (
                    <div
                        className="space-y-2 max-h-72 overflow-y-auto pr-1"
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            const draggedId = e.dataTransfer.getData('text/plain');
                            const draggedIndex = selected.findIndex(w => w.id === draggedId);
                            if (draggedIndex !== -1) {
                                // 這裡可以實現更複雜的拖拽邏輯
                                // 當前簡化為維持現有順序
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

interface AccordionItemProps {
    pageName: string;
    layouts: LayoutsData;
    handleEditClick: (pageName: string) => void;
    allWidgets: LayoutWidget[];
}
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

const AccordionItem: React.FC<AccordionItemProps> = ({ pageName, layouts, handleEditClick, allWidgets }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { content } = useContent();
    const pageContent = content?.LAYOUT_SETTINGS;
    const pageLayout = layouts[pageName];
    const widget_ids = pageLayout?.widget_ids || [];
    const getWidgetById = (id: string) => allWidgets.find(w => w.id === id);
    const displayedCount = widget_ids.length;
    const supportedCount = useMemo(() => allWidgets.filter(w => w.supported_pages.includes(pageName)).length, [allWidgets, pageName]);
    const lastUpdatedAt = pageLayout?.updated_at;
    const lastUpdatedAbsolute = lastUpdatedAt ? formatTimestamp(lastUpdatedAt, { showSeconds: false }) : '—';
    const lastUpdatedRelative = formatRelativeFromNow(lastUpdatedAt);

    if (!pageContent) {
        return (
            <div className="border-b border-slate-800 p-4 text-slate-500 flex items-center space-x-2">
                <Icon name="loader-circle" className="w-4 h-4 animate-spin" />
                <span>正在載入 {pageName} 的版面資訊...</span>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900/70">
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="w-full px-4 py-3 flex items-center justify-between text-left transition-colors hover:bg-slate-800/60 rounded-t-xl"
            >
                <div className="flex items-start gap-3">
                    <Icon
                        name="chevron-right"
                        className={`w-5 h-5 mt-0.5 text-slate-400 transition-transform ${isOpen ? 'rotate-90 text-sky-400' : ''}`}
                    />
                    <div>
                        <p className="text-base font-semibold text-white">{pageName}</p>
                        <p className="mt-1 text-xs text-slate-400">支援 {supportedCount} 張卡片，已顯示 {displayedCount} 張。</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <StatusTag dense tone="info" icon="layout-dashboard" label={`已顯示 ${displayedCount}`} />
                    <StatusTag dense tone="neutral" icon="layers" label={`可用 ${supportedCount}`} />
                </div>
            </button>
            {isOpen && (
                <div className="px-4 pb-4 pt-2">
                    <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-white">{pageContent.CURRENTLY_DISPLAYED}</h4>
                                {widget_ids.length > 0 ? (
                                    <ol className="list-decimal list-inside space-y-1 text-sm text-slate-200">
                                        {widget_ids.map(id => {
                                            const widget = getWidgetById(id);
                                            return <li key={id}>{widget?.name || '未命名卡片'}</li>;
                                        })}
                                    </ol>
                                ) : (
                                    <p className="text-sm text-slate-400">{pageContent.NO_CARDS_DISPLAYED}</p>
                                )}
                            </div>
                            <div className="flex flex-col items-start gap-2 text-xs text-slate-400 md:items-end">
                                <StatusTag dense tone="neutral" icon="user" label={`維護人員：${pageLayout?.updated_by || '—'}`} />
                                <p className="flex items-center gap-2"><Icon name="clock" className="w-3.5 h-3.5 text-slate-400" />{`最後更新 ${lastUpdatedAbsolute}（${lastUpdatedRelative}）`}</p>
                                <button
                                    onClick={() => handleEditClick(pageName)}
                                    className="inline-flex items-center gap-2 rounded-md border border-sky-500/40 bg-sky-900/20 px-3 py-1.5 text-xs font-medium text-sky-200 hover:bg-sky-500/20"
                                >
                                    <Icon name="edit-3" className="w-4 h-4" />{pageContent.EDIT_BUTTON}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Main Page Component
const LayoutSettingsPage: React.FC = () => {
    const [layouts, setLayouts] = useState<LayoutsData>({});
    const [allWidgets, setAllWidgets] = useState<LayoutWidget[]>([]);
    const [kpiData, setKpiData] = useState<Record<string, KpiDataEntry>>({});
    const [draftKpiData, setDraftKpiData] = useState<Record<string, KpiDataEntry>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<string | null>(null);
    const [modalWidgets, setModalWidgets] = useState<LayoutWidget[]>([]);
    const [activeWidgetId, setActiveWidgetId] = useState<string | null>(null);
    const { content } = useContent();
    const pageContent = content?.LAYOUT_SETTINGS;
    const globalContent = content?.GLOBAL;
    const { token } = theme.useToken();
    const colorLabelOverrides = (pageContent?.KPI_CARD_COLOR_LABELS as Partial<Record<KpiCardColor, string>> | undefined) ?? undefined;
    const kpiColorOptions = useMemo(() => {
        const tones: KpiCardColor[] = ['default', 'primary', 'success', 'warning', 'error', 'info', 'performance', 'resource', 'health', 'monitoring'];
        return tones.map((tone) => {
            const palette = getKpiCardPalette(token, tone);
            const labelText = colorLabelOverrides?.[tone] ?? KPI_CARD_COLOR_LABELS[tone];
            return {
                label: (
                    <div className="flex items-center gap-3">
                        <span
                            className="tone-swatch"
                            style={{
                                background: palette.background,
                                borderColor: palette.swatchBorder ?? token.colorBorderSecondary ?? token.colorBorder,
                            }}
                        />
                        <span className="text-xs font-medium tracking-wide" style={{ color: token.colorTextSecondary }}>
                            {labelText}
                        </span>
                    </div>
                ),
                value: tone,
            };
        });
    }, [colorLabelOverrides, token]);

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

    const availableWidgetsForModal = allWidgets.filter(w =>
        !modalWidgets.some(selected => selected.id === w.id) &&
        w.supported_pages.includes(editingPage || '')
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
            <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-5 text-slate-200">
                <Icon name="info" className="w-5 h-5 mt-0.5 text-sky-400" />
                <div className="space-y-2">
                    <p className="text-sm leading-relaxed">{pageContent.INFO_TEXT}</p>
                    <p className="text-xs text-slate-400">調整後的設定會即時套用至所有使用儀表板的頁面，建議於非尖峰時段更新。</p>
                </div>
            </div>

            <div className="space-y-4">
                {Object.keys(layouts).map(pageName => (
                    <AccordionItem key={pageName} pageName={pageName} layouts={layouts} handleEditClick={handleEditClick} allWidgets={allWidgets} />
                ))}
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
                    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                        <div className="space-y-4">
                            <DualListSelector
                                available={availableWidgetsForModal}
                                selected={modalWidgets}
                                onChange={setModalWidgets}
                                activeWidgetId={activeWidgetId}
                                onActiveWidgetChange={setActiveWidgetId}
                            />
                        </div>
                        <div className="flex h-full flex-col gap-4">
                            {activeWidget ? (
                                <div className="flex h-full flex-col gap-5 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/30">
                                    <div>
                                        <p className="text-sm font-semibold text-white">{activeWidget.name}</p>
                                        <p className="mt-1 text-xs leading-relaxed text-slate-400">{activeWidget.description}</p>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">背景樣式</p>
                                            <span className="text-[11px] text-slate-500">即時套用至預覽</span>
                                        </div>
                                        <Segmented
                                            block
                                            size="large"
                                            className="kpi-tone-segmented rounded-xl bg-slate-950/40 p-1.5"
                                            options={kpiColorOptions}
                                            value={resolvedActiveColor}
                                            onChange={(value) => handleColorChange(activeWidget.id, value as KpiCardColor)}
                                        />
                                    </div>
                                    <div
                                        className="flex-1 rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4 min-h-[280px]"
                                        style={{ boxShadow: `inset 0 1px 0 0 rgba(148, 163, 184, 0.08)` }}
                                    >
                                        <div className="mb-3 flex items-center justify-between">
                                            <p className="text-xs font-medium text-slate-400">預覽</p>
                                            <span className="text-[11px] text-slate-500">{pageContent.PREVIEW_HINT ?? '顯示選定卡片的實際樣式'}</span>
                                        </div>
                                        <KpiCard
                                            title={activeWidget.name}
                                            value={activeKpiEntry?.value ?? '—'}
                                            unit={activeKpiEntry?.unit}
                                            description={activeKpiEntry?.description}
                                            color={resolvedActiveColor}
                                            trend={activeKpiEntry?.trend ?? null}
                                            change={activeKpiEntry?.change}
                                        />
                                    </div>
                                    <div className="rounded-xl border border-dashed border-slate-700/70 bg-slate-950/40 p-3 text-[11px] text-slate-500">
                                        {pageContent.COLOR_HELPER_TEXT ?? '建議依據指標狀態選擇對應顏色，例如警示類型使用 Warning、失敗使用 Error。'}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-sm text-slate-400">
                                    請從左側列表選擇要調整的 KPI 卡片。
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default LayoutSettingsPage;