
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '../../components/Icon';
import api from '../../services/api';
import { LayoutWidget, DashboardType, Dashboard } from '../../types';
import ContextualKPICard from '../../components/ContextualKPICard';
import Modal from '../../components/Modal';
import { showToast } from '../../services/toast';

const DashboardEditorPage: React.FC = () => {
    const { dashboardId } = useParams<{ dashboardId: string }>();
    const navigate = useNavigate();
    const isEditMode = !!dashboardId;

    const [dashboardName, setDashboardName] = useState('');
    const [widgets, setWidgets] = useState<LayoutWidget[]>([]);
    const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);

    const [allWidgets, setAllWidgets] = useState<LayoutWidget[]>([]);
    const [kpiData, setKpiData] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                const [widgetsRes, kpiDataRes] = await Promise.all([
                    api.get<LayoutWidget[]>('/settings/widgets'),
                    api.get<Record<string, any>>('/kpi-data'),
                ]);
                const allFetchedWidgets = widgetsRes.data;
                setAllWidgets(allFetchedWidgets);
                setKpiData(kpiDataRes.data);

                if (isEditMode) {
                    const { data: dashboardData } = await api.get<Dashboard>(`/dashboards/${dashboardId}`);
                    setDashboardName(dashboardData.name);
                    const dashboardWidgets = (dashboardData.layout || [])
                        .map(widgetId => allFetchedWidgets.find(w => w.id === widgetId))
                        .filter((w): w is LayoutWidget => !!w);
                    setWidgets(dashboardWidgets);
                } else {
                    setDashboardName('新的儀表板');
                    setWidgets([]);
                }

            } catch (error) {
                console.error("Failed to fetch dashboard editor data", error);
                showToast(isEditMode ? '無法載入儀表板資料。' : '無法載入編輯器所需資料。', 'error');
                navigate('/dashboards');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, [dashboardId, isEditMode, navigate]);

    const availableWidgets = allWidgets.filter(
        w => !widgets.some(sw => sw.id === w.id)
    );

    const addWidget = (widget: LayoutWidget) => {
        setWidgets([...widgets, widget]);
        setIsAddWidgetModalOpen(false);
    };

    const removeWidget = (widgetId: string) => {
        setWidgets(widgets.filter(w => w.id !== widgetId));
    };

    const handleSave = async () => {
        if (!dashboardName.trim()) {
            showToast('儀表板名稱為必填。', 'error');
            return;
        }

        const dashboardPayload: Partial<Dashboard> = {
            name: dashboardName,
            type: DashboardType.BuiltIn,
            layout: widgets.map(w => w.id),
        };

        try {
            if (isEditMode) {
                const { data: updatedDashboard } = await api.patch<Dashboard>(`/dashboards/${dashboardId}`, dashboardPayload);
                showToast(`儀表板 "${updatedDashboard.name}" 已成功更新。`, 'success');
            } else {
                dashboardPayload.category = '團隊自訂';
                dashboardPayload.description = '使用者建立的內建儀表板。';
                dashboardPayload.owner = 'Admin User';
                dashboardPayload.updatedAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
                const { data: createdDashboard } = await api.post<Dashboard>('/dashboards', dashboardPayload);
                showToast(`儀表板 "${createdDashboard.name}" 已成功儲存。`, 'success');
            }
            navigate('/dashboards');
        } catch (error) {
            console.error('Failed to save dashboard', error);
            showToast(isEditMode ? '更新儀表板失敗。' : '儲存儀表板失敗。', 'error');
        }
    };

    const renderDescription = (descriptionText: string): React.ReactNode => {
      if (!descriptionText) return null;
      
      const parts = descriptionText.split(/(↑\d+(\.\d+)?%|↓\d+(\.\d+)?%|\d+ 嚴重)/g);
      
      return parts.map((part, index) => {
          if (part?.startsWith('↑')) {
              return <span key={index} className="text-green-400">{part}</span>;
          }
          if (part?.startsWith('↓')) {
              return <span key={index} className="text-red-400">{part}</span>;
          }
          if (part?.endsWith('嚴重')) {
              return <span key={index} className="text-red-400 font-semibold">{part}</span>;
          }
          return part;
      });
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center space-x-4">
                    <h1 className="text-3xl font-bold text-slate-400">{isEditMode ? '編輯儀表板:' : '建立儀表板:'}</h1>
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
                 {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                        <Icon name="loader-circle" className="w-12 h-12 animate-spin" />
                    </div>
                ) : widgets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {widgets.map(widget => {
                            const data = kpiData[widget.id];
                            if (!data) return null;
                            return (
                                <div key={widget.id} className="relative group">
                                    <ContextualKPICard
                                        title={widget.name}
                                        value={data.value}
                                        description={renderDescription(data.description)}
                                        icon={data.icon}
                                        iconBgColor={data.iconBgColor}
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