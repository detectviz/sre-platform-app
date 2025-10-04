import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LayoutWidget } from '../../../types';
import Icon from '../../../components/Icon';
import Modal from '../../../components/Modal';
import api from '../../../services/api';
import { showToast } from '../../../services/toast';
import { useContent } from '../../../contexts/ContentContext';
import StatusTag from '../../../components/StatusTag';
import { formatTimestamp } from '../../../utils/time';

interface ListItemProps {
    widget: LayoutWidget;
    onAction: () => void;
    actionIcon: string;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    isSelectedList?: boolean;
}
const ListItem: React.FC<ListItemProps> = ({ widget, onAction, actionIcon, onMoveUp, onMoveDown, isSelectedList = false }) => {
    const handleMove = useCallback((moveFn?: () => void) => () => {
        if (moveFn) {
            moveFn();
        }
    }, []);

    return (
        <div className={`flex items-center justify-between rounded-lg border border-slate-800/70 bg-slate-900/60 px-3 py-2.5 transition-colors ${isSelectedList ? 'shadow-sm shadow-slate-900/40' : 'hover:border-slate-700/80 hover:bg-slate-800/60'}`}>
            <div className="flex items-start gap-3">
                <span className="mt-1 text-slate-500">
                    <Icon name={isSelectedList ? 'grip-vertical' : 'layout-dashboard'} className="w-4 h-4" />
                </span>
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">{widget.name}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{widget.description}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                        <StatusTag dense tone="neutral" icon="layers" label={`支援頁面 ${widget.supported_pages.length}`} />
                        {isSelectedList && <StatusTag dense tone="info" icon="eye" label="已顯示" />}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-1.5">
                {isSelectedList && (
                    <>
                        <button
                            onClick={handleMove(onMoveUp)}
                            disabled={!onMoveUp}
                            className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                            title="上移"
                        >
                            <Icon name="arrow-up" className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleMove(onMoveDown)}
                            disabled={!onMoveDown}
                            className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                            title="下移"
                        >
                            <Icon name="arrow-down" className="w-4 h-4" />
                        </button>
                    </>
                )}
                <button
                    onClick={onAction}
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
}

const DualListSelector: React.FC<DualListSelectorProps> = ({ available, selected, onChange }) => {
    const { content } = useContent();
    const pageContent = content?.LAYOUT_SETTINGS;

    const handleAdd = (widget: LayoutWidget) => {
        onChange([...selected, widget]);
    };

    const handleRemove = (widget: LayoutWidget) => {
        onChange(selected.filter(w => w.id !== widget.id));
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
                    <StatusTag dense tone="info" icon="layout-dashboard" label={`${selectedCount} 張`} />
                </div>
                <p className="mb-3 text-xs text-slate-400">調整順序以決定在儀表板中出現的先後，第一張將顯示在最左側。</p>
                {selectedCount > 0 ? (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {selected.map((w, i) => (
                            <ListItem
                                key={w.id}
                                widget={w}
                                onAction={() => handleRemove(w)}
                                actionIcon="chevron-left"
                                onMoveUp={i > 0 ? () => move(i, 'up') : undefined}
                                onMoveDown={i < selected.length - 1 ? () => move(i, 'down') : undefined}
                                isSelectedList={true}
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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<string | null>(null);
    const [modalWidgets, setModalWidgets] = useState<LayoutWidget[]>([]);
    const { content } = useContent();
    const pageContent = content?.LAYOUT_SETTINGS;
    const globalContent = content?.GLOBAL;

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [layoutsRes, widgetsRes] = await Promise.all([
                api.get<LayoutsData>('/settings/layouts'),
                api.get<LayoutWidget[]>('/settings/widgets')
            ]);
            setLayouts(layoutsRes.data);
            setAllWidgets(widgetsRes.data);
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

    const getWidgetById = (id: string) => allWidgets.find(w => w.id === id);

    const handleEditClick = (pageName: string) => {
        setEditingPage(pageName);
        const widget_ids = layouts[pageName]?.widget_ids || [];
        const selected = widget_ids.map(id => getWidgetById(id)).filter(Boolean) as LayoutWidget[];
        setModalWidgets(selected);
        setIsModalOpen(true);
    };

    const handleSaveLayout = async () => {
        if (editingPage) {
            const newSelectedIds = modalWidgets.map(w => w.id);
            const currentLayoutConfig = layouts[editingPage] || { widget_ids: [], updated_at: '', updated_by: '' };
            const updatedLayouts = { ...layouts, [editingPage]: { ...currentLayoutConfig, widget_ids: newSelectedIds } };

            try {
                const { data: savedLayouts } = await api.put<LayoutsData>('/settings/layouts', updatedLayouts);
                setLayouts(savedLayouts);
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
                width="w-full max-w-4xl"
                footer={
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsModalOpen(false)} className="rounded-md border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700/80">{globalContent.CANCEL}</button>
                        <button onClick={handleSaveLayout} className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500/90">{globalContent.SAVE}</button>
                    </div>
                }
            >
                {editingPage && (
                    <DualListSelector
                        available={availableWidgetsForModal}
                        selected={modalWidgets}
                        onChange={setModalWidgets}
                    />
                )}
            </Modal>
        </div>
    );
};

export default LayoutSettingsPage;