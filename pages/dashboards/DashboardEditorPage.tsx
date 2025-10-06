import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Icon from '../../components/Icon';
import api from '../../services/api';
import { LayoutWidget, Dashboard, DashboardTemplate, DashboardLayoutItem, KpiDataEntry } from '../../types';
import KpiCard from '../../components/KpiCard';
import Modal from '../../components/Modal';
import { showToast } from '../../services/toast';
import { useUser } from '../../contexts/UserContext';
import { useOptions } from '../../contexts/OptionsContext';
import { useContent } from '../../contexts/ContentContext';
import IconButton from '../../components/IconButton';
import StatusTag from '../../components/StatusTag';
import { ROUTES } from '../../constants/routes';

const COLS = 12;
const ROW_HEIGHT = 80;
const MARGIN: [number, number] = [10, 10];

type InteractionState = {
    type: 'drag' | 'resize';
    item: DashboardLayoutItem;
    initialMouse: { x: number; y: number };
    initialLayout: DashboardLayoutItem;
} | null;

const DashboardEditorPage: React.FC = () => {
    const { dashboardId } = useParams<{ dashboardId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useUser();
    const { options, isLoading: isLoadingOptions } = useOptions();
    const { content } = useContent();
    const isEditMode = !!dashboardId;
    const pageContent = content?.DASHBOARD_EDITOR;
    const gridRef = useRef<HTMLDivElement>(null);

    const [dashboardName, setDashboardName] = useState('');
    const [isNamePristine, setIsNamePristine] = useState(false);

    const [widgets, setWidgets] = useState<LayoutWidget[]>([]);
    const [layout, setLayout] = useState<DashboardLayoutItem[]>([]);
    const [history, setHistory] = useState<DashboardLayoutItem[][]>([]);

    const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);
    const [interactionState, setInteractionState] = useState<InteractionState>(null);

    const [allWidgets, setAllWidgets] = useState<LayoutWidget[]>([]);
    const [kpi_data, setKpiData] = useState<Record<string, KpiDataEntry>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [defaultCategory, setDefaultCategory] = useState<string | null>(null);
    const [widgetSearch, setWidgetSearch] = useState('');
    const [selectedWidgetContext, setSelectedWidgetContext] = useState<'all' | string>('all');

    useEffect(() => {
        if (options?.dashboards?.categories?.length) {
            setDefaultCategory(options.dashboards.categories[0]);
        }
    }, [options]);

    const fetchAllData = useCallback(async () => {
        if (!pageContent) return;
        setIsLoading(true);
        setError(null);
        try {
            const [widgetsRes, kpiDataRes] = await Promise.all([
                api.get<LayoutWidget[]>('/settings/widgets'),
                api.get<Record<string, KpiDataEntry>>('/kpi-data'),
            ]);
            const allFetchedWidgets = widgetsRes.data;
            setAllWidgets(allFetchedWidgets);
            setKpiData(kpiDataRes.data);

            if (isEditMode) {
                const { data: dashboardData } = await api.get<Dashboard>(`/dashboards/${dashboardId}`);
                setDashboardName(dashboardData.name);
                setLayout(dashboardData.layout || []);
                const dashboardWidgetIds = (dashboardData.layout || []).map(item => item.i);
                setWidgets(allFetchedWidgets.filter(w => dashboardWidgetIds.includes(w.id)));
                setIsNamePristine(false);
            } else {
                const template = location.state?.template as DashboardTemplate | undefined;
                if (template) {
                    setDashboardName(template.name);
                    setIsNamePristine(false);
                } else {
                    setDashboardName(pageContent.DEFAULT_NAME);
                    setIsNamePristine(true);
                }
                setWidgets([]);
                setLayout([]);
            }
            setHistory([]);
        } catch (error) {
            const errorMessage = isEditMode ? pageContent.LOAD_ERROR : pageContent.EDITOR_LOAD_ERROR;
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [dashboardId, isEditMode, location.state, pageContent]);

    useEffect(() => {
        if (!isLoadingOptions && pageContent) {
            fetchAllData();
        }
    }, [fetchAllData, isLoadingOptions, pageContent]);

    useEffect(() => {
        if (!isAddWidgetModalOpen) {
            setWidgetSearch('');
            setSelectedWidgetContext('all');
        }
    }, [isAddWidgetModalOpen]);

    const availableWidgets = useMemo(
        () => allWidgets.filter(w => !widgets.some(sw => sw.id === w.id)),
        [allWidgets, widgets]
    );

    const widgetContextOptions = useMemo(() => {
        const contexts = new Set<string>();
        availableWidgets.forEach(widget => {
            widget.supported_pages.forEach(page => contexts.add(page));
        });
        return Array.from(contexts).sort();
    }, [availableWidgets]);

    const filteredWidgets = useMemo(() => {
        return availableWidgets.filter(widget => {
            const matchesKeyword = widgetSearch.trim().length === 0
                || widget.name.toLowerCase().includes(widgetSearch.toLowerCase())
                || widget.description.toLowerCase().includes(widgetSearch.toLowerCase())
                || widget.id.toLowerCase().includes(widgetSearch.toLowerCase());
            const matchesContext = selectedWidgetContext === 'all'
                || widget.supported_pages.includes(selectedWidgetContext);
            return matchesKeyword && matchesContext;
        });
    }, [availableWidgets, widgetSearch, selectedWidgetContext]);

    const findEmptySpace = (w: number, h: number): { x: number, y: number } => {
        let y = 0, x = 0;
        while (true) {
            for (x = 0; x <= COLS - w; x++) {
                const item = { i: 'temp', x, y, w, h };
                if (!checkCollision(item, layout)) {
                    return { x, y };
                }
            }
            y++;
        }
    };

    const addWidget = (widget: LayoutWidget) => {
        const newPos = findEmptySpace(4, 2);
        const newLayoutItem: DashboardLayoutItem = { i: widget.id, ...newPos, w: 4, h: 2 };

        pushToHistory();
        setWidgets([...widgets, widget]);
        setLayout([...layout, newLayoutItem]);
        setIsAddWidgetModalOpen(false);
    };

    const removeWidget = (widgetId: string) => {
        pushToHistory();
        setWidgets(widgets.filter(w => w.id !== widgetId));
        setLayout(layout.filter(item => item.i !== widgetId));
    };

    const handleSave = async () => {
        if (!pageContent) return;
        if (!dashboardName.trim()) {
            showToast(pageContent.NAME_REQUIRED_ERROR, 'error');
            return;
        }
        if (!isEditMode && !defaultCategory) {
            showToast('儀表板類別尚未載入，無法儲存。', 'error');
            return;
        }

        setIsSaving(true);
        const dashboardPayload: Partial<Dashboard> = { name: dashboardName, type: 'built-in', layout };
        try {
            if (isEditMode) {
                const { data: updatedDashboard } = await api.patch<Dashboard>(`/dashboards/${dashboardId}`, dashboardPayload);
                showToast(pageContent.UPDATE_SUCCESS.replace('{name}', updatedDashboard.name), 'success');
            } else {
                dashboardPayload.category = defaultCategory as string;
                dashboardPayload.description = pageContent.DEFAULT_DESCRIPTION;
                dashboardPayload.owner = currentUser?.name || 'System';
                dashboardPayload.updated_at = new Date().toISOString().slice(0, 16).replace('T', ' ');
                const { data: createdDashboard } = await api.post<Dashboard>('/dashboards', dashboardPayload);
                showToast(pageContent.SAVE_SUCCESS.replace('{name}', createdDashboard.name), 'success');
            }
            navigate(ROUTES.DASHBOARDS);
        } catch (error) {
            showToast(isEditMode ? pageContent.UPDATE_ERROR : pageContent.SAVE_ERROR, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // --- Drag and Resize Logic ---

    const pushToHistory = () => {
        setHistory(prev => [...prev.slice(-9), layout]); // Keep last 10 states
    };

    const handleUndo = () => {
        if (history.length > 0) {
            const lastState = history[history.length - 1];
            setLayout(lastState);
            setHistory(history.slice(0, -1));
        }
    };

    const checkCollision = (item: DashboardLayoutItem, currentLayout: DashboardLayoutItem[]): boolean => {
        return currentLayout.some(l =>
            l.i !== item.i &&
            item.x < l.x + l.w &&
            item.x + item.w > l.x &&
            item.y < l.y + l.h &&
            item.y + item.h > l.y
        );
    };

    const handleInteractionStart = (e: React.MouseEvent, type: 'drag' | 'resize', item: DashboardLayoutItem) => {
        e.preventDefault();
        e.stopPropagation();
        pushToHistory();
        setInteractionState({ type, item, initialMouse: { x: e.clientX, y: e.clientY }, initialLayout: item });
    };

    const handleInteractionMove = useCallback((e: MouseEvent) => {
        if (!interactionState || !gridRef.current) return;

        const { type, item, initialMouse, initialLayout } = interactionState;
        const gridRect = gridRef.current.getBoundingClientRect();
        const colWidth = (gridRect.width - (COLS + 1) * MARGIN[0]) / COLS;
        const xDelta = e.clientX - initialMouse.x;
        const yDelta = e.clientY - initialMouse.y;

        let newLayoutItem = { ...item };

        if (type === 'drag') {
            const newX = initialLayout.x + Math.round(xDelta / (colWidth + MARGIN[0]));
            const newY = initialLayout.y + Math.round(yDelta / (ROW_HEIGHT + MARGIN[1]));
            newLayoutItem.x = Math.max(0, Math.min(newX, COLS - newLayoutItem.w));
            newLayoutItem.y = Math.max(0, newY);
        } else { // resize
            const newW = initialLayout.w + Math.round(xDelta / (colWidth + MARGIN[0]));
            const newH = initialLayout.h + Math.round(yDelta / (ROW_HEIGHT + MARGIN[1]));
            newLayoutItem.w = Math.max(1, Math.min(newW, COLS - newLayoutItem.x));
            newLayoutItem.h = Math.max(1, newH);
        }

        setLayout(l => l.map(i => i.i === item.i ? newLayoutItem : i));
    }, [interactionState]);

    const handleInteractionEnd = useCallback(() => {
        if (!interactionState) return;
        const { item: movedItem, initialLayout } = interactionState;
        const currentItemState = layout.find(l => l.i === movedItem.i);

        if (currentItemState && checkCollision(currentItemState, layout)) {
            showToast("操作無效：小工具之間不能重疊。", "error");
            setLayout(l => l.map(i => i.i === movedItem.i ? initialLayout : i));
        }
        setInteractionState(null);
    }, [interactionState, layout]);

    useEffect(() => {
        if (interactionState) {
            window.addEventListener('mousemove', handleInteractionMove);
            window.addEventListener('mouseup', handleInteractionEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleInteractionMove);
            window.removeEventListener('mouseup', handleInteractionEnd);
        };
    }, [interactionState, handleInteractionMove, handleInteractionEnd]);

    const getPixelValues = (item: DashboardLayoutItem, gridWidth: number) => {
        const colWidth = (gridWidth - (COLS + 1) * MARGIN[0]) / COLS;
        return {
            width: item.w * colWidth + (item.w - 1) * MARGIN[0],
            height: item.h * ROW_HEIGHT + (item.h - 1) * MARGIN[1],
            top: item.y * (ROW_HEIGHT + MARGIN[1]) + MARGIN[1],
            left: item.x * (colWidth + MARGIN[0]) + MARGIN[0],
        };
    };

    const handleNameFocus = () => {
        if (isNamePristine && pageContent) {
            setDashboardName('');
            setIsNamePristine(false);
        }
    };

    const renderDescription = (descriptionText?: string) => {
        if (typeof descriptionText !== 'string' || !descriptionText) {
            return descriptionText ?? null;
        }

        const parts = descriptionText.split(/(↑\d+(\.\d+)?%|↓\d+(\.\d+)?%|\d+ 嚴重)/g).filter(Boolean);

        return parts.map((part, index) => {
            if (part.startsWith('↑')) return <span key={index} className="text-green-400">{part}</span>;
            if (part.startsWith('↓')) return <span key={index} className="text-red-400">{part}</span>;
            if (part.endsWith('嚴重')) return <span key={index} className="text-red-400 font-semibold">{part}</span>;
            return part;
        });
    };

    if (!pageContent) return <div className="flex items-center justify-center h-full"><Icon name="loader-circle" className="w-8 h-8 animate-spin" /></div>;

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center space-x-4">
                    <h1 className="text-3xl font-bold text-slate-400">{isEditMode ? pageContent.EDIT_TITLE : pageContent.CREATE_TITLE}</h1>
                    <input type="text" value={dashboardName} onChange={e => setDashboardName(e.target.value)} onFocus={handleNameFocus} className="bg-transparent border-b-2 border-slate-700 focus:border-sky-500 text-3xl font-bold focus:outline-none transition-colors w-96" />
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={handleUndo} disabled={history.length === 0} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                        <Icon name="undo-2" className="w-4 h-4 mr-2" /> 撤銷
                    </button>
                    <button onClick={() => navigate(ROUTES.DASHBOARDS)} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 rounded-md">
                        {pageContent.CANCEL_BUTTON}
                    </button>
                    <button onClick={handleSave} disabled={isSaving || isLoading || (isLoadingOptions && !isEditMode)} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSaving ? <Icon name="loader-circle" className="w-4 h-4 mr-2 animate-spin" /> : <Icon name="save" className="w-4 h-4 mr-2" />}
                        {isSaving ? '儲存中...' : pageContent.SAVE_DASHBOARD}
                    </button>
                </div>
            </div>

            <div className="shrink-0">
                <button onClick={() => setIsAddWidgetModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 rounded-md flex items-center">
                    <Icon name="plus" className="w-4 h-4 mr-2" /> {pageContent.ADD_WIDGET}
                </button>
            </div>

            <div ref={gridRef} className="flex-grow glass-card rounded-xl p-4 overflow-auto relative">
                {(isLoading || (isLoadingOptions && !isEditMode)) && <div className="h-full flex flex-col items-center justify-center text-slate-500"><Icon name="loader-circle" className="w-12 h-12 animate-spin" /></div>}
                {error && <div className="h-full flex flex-col items-center justify-center text-red-400"><Icon name="alert-circle" className="w-12 h-12 mb-4" /><p className="font-semibold">{error}</p></div>}
                {!isLoading && !isLoadingOptions && !error && widgets.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center gap-5 text-center text-slate-300">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-sky-500/10 text-sky-300">
                            <Icon name="layout-dashboard" className="h-12 w-12" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-xl font-semibold">{pageContent.EMPTY_STATE_TITLE}</h2>
                            <p className="mx-auto max-w-sm text-sm leading-6 text-slate-400">
                                {pageContent.EMPTY_STATE_MESSAGE}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsAddWidgetModalOpen(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
                        >
                            <Icon name="plus" className="h-4 w-4" />
                            {pageContent.ADD_WIDGET}
                        </button>
                    </div>
                )}

                {!isLoading && !isLoadingOptions && !error && gridRef.current && layout.map(item => {
                    const widget = widgets.find(w => w.id === item.i);
                    const isInteracting = interactionState?.item.i === item.i;
                    const { top, left, width, height } = getPixelValues(item, gridRef.current!.offsetWidth);

                    if (!widget) {
                        return (
                            <div key={item.i} className="absolute border border-dashed border-slate-700 bg-slate-900/40 rounded-xl flex items-center justify-center text-slate-400 text-sm" style={{ top, left, width, height }}>
                                <Icon name="alert-circle" className="w-4 h-4 mr-2" /> 缺少對應的小工具設定
                            </div>
                        );
                    }
                    const data = kpi_data[widget.id];
                    if (!data) {
                        return (
                            <div key={item.i} className="absolute border border-dashed border-slate-700 bg-slate-900/40 rounded-xl flex flex-col items-center justify-center text-slate-400 text-sm" style={{ top, left, width, height }}>
                                <Icon name="database" className="w-4 h-4 mb-1" />
                                <span>尚未取得 {widget.name} 資料</span>
                            </div>
                        );
                    }

                    return (
                        <div
                            key={item.i}
                            onMouseDown={(e) => handleInteractionStart(e, 'drag', item)}
                            className={`group absolute transition-all duration-200 ease-in-out ${isInteracting ? 'z-20 shadow-2xl opacity-90' : 'z-10'}`}
                            style={{ top, left, width, height }}
                        >
                            <div className="pointer-events-none absolute inset-0 rounded-xl border border-slate-700/50" />
                            <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-slate-900/70 px-2 py-1 text-[11px] font-medium text-slate-300 shadow-sm">
                                <Icon name="grip-vertical" className="h-3.5 w-3.5" />
                                <span>拖曳調整</span>
                            </div>
                            <div
                                className="absolute right-2 top-2 flex items-center gap-2"
                                onClick={(event) => event.stopPropagation()}
                                onMouseDown={(event) => event.stopPropagation()}
                            >
                                <IconButton
                                    icon="x"
                                    label={pageContent.REMOVE_WIDGET_TITLE}
                                    tone="danger"
                                    onClick={() => removeWidget(widget.id)}
                                    tooltip={pageContent.REMOVE_WIDGET_TITLE}
                                />
                            </div>
                            <KpiCard
                                title={widget.name}
                                value={data.value}
                                unit={data.unit}
                                description={renderDescription(data.description)}
                                color={data.color}
                                trend={data.trend ?? null}
                                change={data.change}
                            />
                            <div
                                onMouseDown={(e) => handleInteractionStart(e, 'resize', item)}
                                className="absolute bottom-2 right-2 flex h-6 w-6 cursor-se-resize items-center justify-center rounded-md bg-slate-900/80 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100"
                            >
                                <Icon name="move" className="h-3.5 w-3.5" />
                                <span className="sr-only">調整大小</span>
                            </div>
                        </div>
                    );
                })}

                {/* Ghost element for drag/resize feedback */}
                {interactionState && gridRef.current && (() => {
                    const ghostLayout = layout.find(l => l.i === interactionState.item.i);
                    if (!ghostLayout) {
                        return <span className="sr-only">沒有可顯示的預覽位置</span>;
                    }
                    const { top, left, width, height } = getPixelValues(ghostLayout, gridRef.current.offsetWidth);
                    const isColliding = checkCollision(ghostLayout, layout);
                    return <div className={`absolute z-10 rounded-xl transition-colors ${isColliding ? 'bg-red-500/30' : 'bg-sky-500/30'} border-2 border-dashed ${isColliding ? 'border-red-400' : 'border-sky-400'}`} style={{ top, left, width, height }} />;
                })()}

            </div>

            <Modal
                title={pageContent.ADD_WIDGET_MODAL_TITLE}
                isOpen={isAddWidgetModalOpen}
                onClose={() => setIsAddWidgetModalOpen(false)}
                width="w-1/2 max-w-3xl"
            >
                <div className="space-y-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:gap-3">
                            <label className="sr-only" htmlFor="widget-search">
                                {pageContent.ADD_WIDGET_MODAL_SEARCH_LABEL ?? '搜尋小工具'}
                            </label>
                            <div className="relative flex-1">
                                <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                <input
                                    id="widget-search"
                                    type="search"
                                    value={widgetSearch}
                                    onChange={(event) => setWidgetSearch(event.target.value)}
                                    placeholder={pageContent.ADD_WIDGET_MODAL_SEARCH_PLACEHOLDER ?? '搜尋小工具或輸入關鍵字'}
                                    className="w-full rounded-lg border border-slate-700/60 bg-slate-900/50 py-2 pl-10 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                                />
                            </div>
                            <div className="flex items-center gap-2 md:w-56">
                                <label htmlFor="widget-context-filter" className="text-xs text-slate-400">
                                    {pageContent.ADD_WIDGET_MODAL_FILTER_LABEL ?? '適用頁面'}
                                </label>
                                <select
                                    id="widget-context-filter"
                                    value={selectedWidgetContext}
                                    onChange={(event) => setSelectedWidgetContext(event.target.value as 'all' | string)}
                                    className="flex-1 rounded-lg border border-slate-700/60 bg-slate-900/50 px-3 py-2 text-sm text-slate-200 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                                >
                                    <option value="all">全部頁面</option>
                                    {widgetContextOptions.map((context) => (
                                        <option key={context} value={context}>
                                            {context}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500">
                            {pageContent.ADD_WIDGET_MODAL_HINT ?? '僅顯示尚未加入儀表板的小工具。'}
                        </p>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto pr-1">
                        {filteredWidgets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-700/70 bg-slate-900/40 p-10 text-center text-sm text-slate-400">
                                <Icon name="inbox" className="h-10 w-10 text-slate-600" />
                                <p>{pageContent.ADD_WIDGET_EMPTY_STATE ?? '沒有符合的結果，請嘗試其他關鍵字或條件。'}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {filteredWidgets.map((widget) => (
                                    <div
                                        key={widget.id}
                                        className="flex h-full flex-col justify-between gap-3 rounded-lg border border-slate-700/70 bg-slate-900/60 p-4 transition-colors hover:border-sky-500/50"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-semibold text-white">{widget.name}</p>
                                                    <p className="text-xs text-slate-500">ID：{widget.id}</p>
                                                </div>
                                                <IconButton
                                                    icon="plus"
                                                    label={pageContent.ADD_WIDGET_TITLE}
                                                    tone="primary"
                                                    onClick={() => addWidget(widget)}
                                                    tooltip={pageContent.ADD_WIDGET_TITLE}
                                                />
                                            </div>
                                            <p className="text-xs leading-6 text-slate-400">{widget.description}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {widget.supported_pages.map((page) => (
                                                <StatusTag key={`${widget.id}-${page}`} dense tone="neutral" label={page} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DashboardEditorPage;