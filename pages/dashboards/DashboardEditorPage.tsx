import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon';
import { LAYOUT_WIDGETS, KPI_DATA } from '../../constants';
import { LayoutWidget } from '../../types';
import ContextualKPICard from '../../components/ContextualKPICard';
import Modal from '../../components/Modal';

const DashboardEditorPage: React.FC = () => {
    const navigate = useNavigate();
    const [dashboardName, setDashboardName] = useState('新的儀表板');
    const [widgets, setWidgets] = useState<LayoutWidget[]>([]);
    const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);

    const availableWidgets = LAYOUT_WIDGETS.filter(
        w => !widgets.some(sw => sw.id === w.id)
    );

    const addWidget = (widget: LayoutWidget) => {
        setWidgets([...widgets, widget]);
        setIsAddWidgetModalOpen(false);
    };

    const removeWidget = (widgetId: string) => {
        setWidgets(widgets.filter(w => w.id !== widgetId));
    };

    const handleSave = () => {
        console.log('Saving new dashboard:', {
            name: dashboardName,
            widgetIds: widgets.map(w => w.id),
        });
        // In a real app, this would make an API call.
        // For now, just navigate back to the list.
        // The new dashboard won't appear due to mock data re-initialization on page load.
        navigate('/dashboards');
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center space-x-4">
                    <h1 className="text-3xl font-bold text-slate-400">建立儀表板:</h1>
                    <input
                        type="text"
                        value={dashboardName}
                        onChange={e => setDashboardName(e.target.value)}
                        className="bg-transparent border-b-2 border-slate-700 focus:border-sky-500 text-3xl font-bold focus:outline-none transition-colors w-96"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={() => navigate('/dashboards')} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 rounded-md">
                        取消
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md flex items-center">
                        <Icon name="save" className="w-4 h-4 mr-2" />
                        儲存儀表板
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="shrink-0">
                <button onClick={() => setIsAddWidgetModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 rounded-md flex items-center">
                    <Icon name="plus" className="w-4 h-4 mr-2" />
                    新增小工具
                </button>
            </div>

            {/* Grid Area */}
            <div className="flex-grow glass-card rounded-xl p-4 overflow-y-auto">
                {widgets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {widgets.map(widget => {
                            const kpiData = KPI_DATA[widget.id];
                            if (!kpiData) return null;
                            return (
                                <div key={widget.id} className="relative group">
                                    <ContextualKPICard
                                        title={widget.name}
                                        value={kpiData.value}
                                        description={kpiData.description}
                                        icon={kpiData.icon}
                                        iconBgColor={kpiData.iconBgColor}
                                    />
                                    <button
                                        onClick={() => removeWidget(widget.id)}
                                        className="absolute top-2 right-2 p-1 bg-red-600/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="移除小工具"
                                    >
                                        <Icon name="x" className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                        <Icon name="layout-dashboard" className="w-24 h-24 mb-4" />
                        <h2 className="text-xl font-bold text-slate-300">空儀表板</h2>
                        <p className="mt-2">點擊「新增小工具」開始建立您的儀表板。</p>
                    </div>
                )}
            </div>
            
            {/* Add Widget Modal */}
            <Modal
                title="新增小工具至儀表板"
                isOpen={isAddWidgetModalOpen}
                onClose={() => setIsAddWidgetModalOpen(false)}
                width="w-1/2 max-w-3xl"
            >
                <div className="max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableWidgets.map(widget => (
                            <div key={widget.id} className="p-4 border border-slate-700 rounded-lg flex justify-between items-center hover:bg-slate-800/50">
                                <div>
                                    <p className="font-semibold text-white">{widget.name}</p>
                                    <p className="text-sm text-slate-400">{widget.description}</p>
                                </div>
                                <button onClick={() => addWidget(widget)} className="p-2 bg-sky-600 text-white rounded-full hover:bg-sky-500 shrink-0" title="新增">
                                    <Icon name="plus" className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DashboardEditorPage;