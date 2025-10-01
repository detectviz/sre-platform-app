import React, { useState, useEffect, useCallback } from 'react';
import { LayoutWidget, TableColumn } from '../../../types';
import Icon from '../../../components/Icon';
import Modal from '../../../components/Modal';
import api from '../../../services/api';
import { showToast } from '../../../services/toast';
import { useContent } from '../../../contexts/ContentContext';

interface ListItemProps {
    widget: LayoutWidget;
    onAction: () => void;
    actionIcon: string;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    isSelectedList?: boolean;
}
const ListItem: React.FC<ListItemProps> = ({ widget, onAction, actionIcon, onMoveUp, onMoveDown, isSelectedList = false }) => (
    <div className="flex items-center justify-between p-2 rounded-md hover:bg-slate-700/50">
        <div>
            <p className="font-medium">{widget.name}</p>
            <p className="text-xs text-slate-400">{widget.description}</p>
        </div>
        <div className="flex items-center space-x-1">
            {isSelectedList && (
                <>
                    <button onClick={onMoveUp} disabled={!onMoveUp} className="p-1 rounded-full text-slate-400 hover:bg-slate-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"><Icon name="arrow-up" className="w-4 h-4" /></button>
                    <button onClick={onMoveDown} disabled={!onMoveDown} className="p-1 rounded-full text-slate-400 hover:bg-slate-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"><Icon name="arrow-down" className="w-4 h-4" /></button>
                </>
            )}
            <button onClick={onAction} className="p-1 rounded-full text-slate-400 hover:bg-slate-600 hover:text-white"><Icon name={actionIcon} className="w-4 h-4" /></button>
        </div>
    </div>
);


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

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="border border-slate-700 rounded-lg p-3">
                <h3 className="font-semibold mb-2">{pageContent.AVAILABLE_WIDGETS}</h3>
                <div className="space-y-2 h-64 overflow-y-auto">
                    {available.map(w => <ListItem key={w.id} widget={w} onAction={() => handleAdd(w)} actionIcon="chevron-right" />)}
                </div>
            </div>
            <div className="border border-slate-700 rounded-lg p-3">
                <h3 className="font-semibold mb-2">{pageContent.DISPLAYED_WIDGETS}</h3>
                <div className="space-y-2 h-64 overflow-y-auto">
                    {selected.map((w, i) => <ListItem key={w.id} widget={w} onAction={() => handleRemove(w)} actionIcon="chevron-left" onMoveUp={i > 0 ? () => move(i, 'up') : undefined} onMoveDown={i < selected.length - 1 ? () => move(i, 'down') : undefined} isSelectedList={true} />)}
                </div>
            </div>
        </div>
    );
};

interface LayoutConfig {
    widgetIds: string[];
    updatedAt: string;
    updatedBy: string;
}
type LayoutsData = Record<string, LayoutConfig>;

interface AccordionItemProps {
    pageName: string;
    layouts: LayoutsData;
    handleEditClick: (pageName: string) => void;
    allWidgets: LayoutWidget[];
}
const AccordionItem: React.FC<AccordionItemProps> = ({ pageName, layouts, handleEditClick, allWidgets }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { content } = useContent();
    const pageContent = content?.LAYOUT_SETTINGS;
    const pageLayout = layouts[pageName];
    const widgetIds = pageLayout?.widgetIds || [];
    const getWidgetById = (id: string) => allWidgets.find(w => w.id === id);

    if (!pageContent) {
        return (
            <div className="border-b border-slate-800 p-4 text-slate-500 flex items-center space-x-2">
                <Icon name="loader-circle" className="w-4 h-4 animate-spin" />
                <span>正在載入 {pageName} 的版面資訊...</span>
            </div>
        );
    }

    return (
        <div className="border-b border-slate-800">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 text-left hover:bg-slate-800/50 transition-colors">
                <span className="font-semibold text-lg">{pageName}</span>
                <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} className="w-5 h-5" />
            </button>
            {isOpen && (
                <div className="p-4 bg-slate-900/50">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-semibold mb-2">{pageContent.CURRENTLY_DISPLAYED}</h4>
                            {widgetIds.length > 0 ? (
                                <ol className="list-decimal list-inside text-slate-300 space-y-1">
                                    {widgetIds.map(id => {
                                        const widget = getWidgetById(id);
                                        return <li key={id}>{widget?.name || 'Unknown Widget'}</li>;
                                    })}
                                </ol>
                            ) : (
                                <p className="text-slate-400">{pageContent.NO_CARDS_DISPLAYED}</p>
                            )}
                        </div>
                        <button onClick={() => handleEditClick(pageName)} className="flex items-center text-sm text-sky-400 hover:text-sky-300 px-3 py-1 rounded-md hover:bg-sky-500/20">
                            <Icon name="edit-3" className="w-4 h-4 mr-1" />{pageContent.EDIT_BUTTON}
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-4">{pageContent.LAST_UPDATED?.replace('{date}', pageLayout?.updated_at || 'N/A').replace('{by}', pageLayout?.updated_by || 'N/A')}</p>
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
        const widgetIds = layouts[pageName]?.widgetIds || [];
        const selected = widgetIds.map(id => getWidgetById(id)).filter(Boolean) as LayoutWidget[];
        setModalWidgets(selected);
        setIsModalOpen(true);
    };

    const handleSaveLayout = async () => {
        if (editingPage) {
            const newSelectedIds = modalWidgets.map(w => w.id);
            const currentLayoutConfig = layouts[editingPage] || { widgetIds: [], updatedAt: '', updatedBy: '' };
            const updatedLayouts = { ...layouts, [editingPage]: { ...currentLayoutConfig, widgetIds: newSelectedIds } };

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
            <div className="p-4 rounded-lg bg-sky-900/30 border border-sky-700/50 text-sky-300 flex items-center">
                <Icon name="info" className="w-5 h-5 mr-3 text-sky-400 shrink-0" />
                <p>{pageContent.INFO_TEXT}</p>
            </div>

            <div className="glass-card rounded-xl">
                {Object.keys(layouts).map(pageName => <AccordionItem key={pageName} pageName={pageName} layouts={layouts} handleEditClick={handleEditClick} allWidgets={allWidgets} />)}
            </div>

            <Modal
                title={pageContent.EDIT_MODAL_TITLE?.replace('{pageName}', editingPage || '') || `Edit KPI Cards`}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                width="w-2/3"
                footer={
                    <div className="flex justify-end space-x-2">
                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">{globalContent.CANCEL}</button>
                        <button onClick={handleSaveLayout} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors">{globalContent.SAVE}</button>
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