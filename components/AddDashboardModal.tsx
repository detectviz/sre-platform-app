import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import Icon from './Icon';
import FormRow from './FormRow';
import { Dashboard, DashboardType } from '../types';
import { MOCK_DASHBOARDS, MOCK_AVAILABLE_GRAFANA_DASHBOARDS } from '../constants';

interface AvailableGrafanaDashboard {
  uid: string;
  title: string;
  url: string;
  folderTitle: string;
  folderUid: string;
}

interface AddDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newDashboard: Partial<Dashboard>) => void;
}

const AddDashboardModal: React.FC<AddDashboardModalProps> = ({ isOpen, onClose, onSave }) => {
    const [step, setStep] = useState(1);
    const [grafanaData, setGrafanaData] = useState({
        name: '',
        grafana_dashboard_uid: '',
        grafana_folder_uid: '',
        grafana_url: '',
    });
    const navigate = useNavigate();

    const [availableDashboards, setAvailableDashboards] = useState<AvailableGrafanaDashboard[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDashboardUid, setSelectedDashboardUid] = useState('');

    useEffect(() => {
        if (isOpen && step === 2) {
            setIsLoading(true);
            setTimeout(() => {
                const linkedUids = MOCK_DASHBOARDS
                    .filter(d => d.type === DashboardType.Grafana)
                    .map(d => d.grafana_dashboard_uid);
                
                const unlinked = MOCK_AVAILABLE_GRAFANA_DASHBOARDS.filter(d => !linkedUids.includes(d.uid));
                setAvailableDashboards(unlinked as AvailableGrafanaDashboard[]);
                setIsLoading(false);
            }, 500);
        }
    }, [isOpen, step]);


    const handleSelectType = (type: 'built-in' | 'grafana') => {
        if (type === 'built-in') {
            navigate('/dashboards/new');
            onClose();
        } else {
            setStep(2);
        }
    };

    const handleDashboardSelect = (uid: string) => {
        setSelectedDashboardUid(uid);
        const selected = availableDashboards.find(d => d.uid === uid);
        if (selected) {
            setGrafanaData({
                name: selected.title,
                grafana_dashboard_uid: selected.uid,
                grafana_folder_uid: selected.folderUid,
                grafana_url: selected.url,
            });
        } else {
            setGrafanaData({ name: '', grafana_dashboard_uid: '', grafana_folder_uid: '', grafana_url: '' });
        }
    };

    const handleGrafanaDataChange = (field: keyof typeof grafanaData, value: string) => {
        setGrafanaData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveGrafana = () => {
        if (!selectedDashboardUid) return;

        const newDashboard: Partial<Dashboard> = {
            name: grafanaData.name,
            type: DashboardType.Grafana,
            category: '團隊自訂',
            description: `Linked from Grafana: ${grafanaData.name}`,
            owner: 'Admin User',
            updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
            grafanaUrl: grafanaData.grafana_url,
            grafana_dashboard_uid: grafanaData.grafana_dashboard_uid,
            grafana_folder_uid: grafanaData.grafana_folder_uid,
            path: `/dashboard/new-${Date.now()}`
        };
        onSave(newDashboard);
        onClose();
    };
    
    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setGrafanaData({
                name: '',
                grafana_dashboard_uid: '',
                grafana_folder_uid: '',
                grafana_url: '',
            });
            setSelectedDashboardUid('');
            setAvailableDashboards([]);
        }
    }, [isOpen]);

    const renderStep1 = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
                onClick={() => handleSelectType('built-in')}
                className="p-6 text-left border border-slate-700 rounded-lg hover:bg-slate-700/50 hover:border-sky-500 transition-all duration-200"
            >
                <Icon name="layout-dashboard" className="w-8 h-8 mb-3 text-sky-400" />
                <h3 className="text-lg font-semibold text-white">建立內建儀表板</h3>
                <p className="text-sm text-slate-400 mt-1">使用平台提供的小工具，拖拽組合出新的儀表板。</p>
            </button>
            <button
                onClick={() => handleSelectType('grafana')}
                className="p-6 text-left border border-slate-700 rounded-lg hover:bg-slate-700/50 hover:border-green-500 transition-all duration-200"
            >
                <Icon name="area-chart" className="w-8 h-8 mb-3 text-green-400" />
                <h3 className="text-lg font-semibold text-white">連結外部 Grafana 儀表板</h3>
                <p className="text-sm text-slate-400 mt-1">貼上 Grafana URL 或 UID，統一在平台內管理。</p>
            </button>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4">
            <FormRow label="從 Grafana 選擇儀表板 *">
                <select 
                    value={selectedDashboardUid} 
                    onChange={e => handleDashboardSelect(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
                    required
                >
                    <option value="" disabled>{isLoading ? '載入中...' : '請選擇一個儀表板...'}</option>
                    {availableDashboards.map(d => (
                        <option key={d.uid} value={d.uid}>{d.folderTitle} / {d.title}</option>
                    ))}
                </select>
            </FormRow>
            <FormRow label="儀表板名稱 *">
                 <input type="text" value={grafanaData.name} onChange={e => handleGrafanaDataChange('name', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" placeholder="e.g., Production API Metrics" required />
            </FormRow>
        </div>
    );
    
    return (
        <Modal
            title={step === 1 ? '選擇儀表板類型' : '連結 Grafana 儀表板'}
            isOpen={isOpen}
            onClose={onClose}
            width={step === 1 ? 'w-2/3 max-w-3xl' : 'w-1/2 max-w-2xl'}
            footer={step === 2 && (
                <div className="flex items-center justify-between w-full">
                    <button onClick={() => setStep(1)} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">
                        返回
                    </button>
                    <button onClick={handleSaveGrafana} disabled={!selectedDashboardUid} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
                        儲存
                    </button>
                </div>
            )}
        >
            {step === 1 ? renderStep1() : renderStep2()}
        </Modal>
    );
};

export default AddDashboardModal;