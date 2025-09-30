import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import FormRow from './FormRow';
import Icon from './Icon';
import KeyValueInput from './KeyValueInput';
import { DiscoveryJob, DiscoveryJobType, ExporterConfig, ExporterType } from '../types';
import { showToast } from '../services/toast';
import { useOptions } from '../contexts/OptionsContext';

interface AutoDiscoveryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: Partial<DiscoveryJob>) => void;
  job: DiscoveryJob | null;
}

const AutoDiscoveryEditModal: React.FC<AutoDiscoveryEditModalProps> = ({ isOpen, onClose, onSave, job }) => {
    const [formData, setFormData] = useState<Partial<DiscoveryJob>>({});
    const [isTesting, setIsTesting] = useState(false);
    const kubeconfigInputRef = useRef<HTMLInputElement>(null);
    const { options, isLoading: isLoadingOptions } = useOptions();
    const autoDiscoveryOptions = options?.autoDiscovery;
    
    useEffect(() => {
        if (isOpen && autoDiscoveryOptions) {
            const initialData = job || {
                name: '',
                type: autoDiscoveryOptions.jobTypes[0] || 'K8s',
                schedule: '0 * * * *', // every hour
                config: {},
                tags: [],
                exporterConfig: { type: 'node_exporter' } // Default for K8s
            };
            setFormData(initialData);
        }
    }, [isOpen, job, autoDiscoveryOptions]);
    
    const handleChange = (field: keyof DiscoveryJob, value: any) => {
        if (field === 'type') {
            const newType = value as DiscoveryJobType;
            let defaultExporter: ExporterType = 'none';
            switch (newType) {
                case 'K8s':
                case 'Static Range':
                case 'Cloud Provider':
                    defaultExporter = 'node_exporter';
                    break;
                case 'SNMP':
                    defaultExporter = 'snmp_exporter';
                    break;
                default:
                    defaultExporter = 'none';
            }
            setFormData(prev => ({ 
                ...prev, 
                type: newType, 
                config: {}, // Reset config on type change
                exporterConfig: { type: defaultExporter }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleConfigChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, config: { ...prev.config, [key]: value } }));
    };

    const handleExporterConfigChange = (field: keyof ExporterConfig, value: any) => {
        const newConfig = { ...(formData.exporterConfig || { type: 'none' }), [field]: value };
        if (field === 'type') {
            delete newConfig.mibProfile;
            delete newConfig.customConfigYaml;
        }
        setFormData(prev => ({ ...prev, exporterConfig: newConfig }));
    };
    
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            handleConfigChange('kubeconfig', text);
            showToast(`檔案 "${file.name}" 已成功載入。`, 'success');
        };
        reader.onerror = () => {
            showToast('讀取檔案時發生錯誤。', 'error');
        };
        reader.readAsText(file);

        // Reset input value to allow re-uploading the same file
        event.target.value = '';
    };

    const triggerFileSelect = () => {
        kubeconfigInputRef.current?.click();
    };


    const handleSave = () => {
        onSave(formData);
    };
    
    const handleTestScan = async () => {
        setIsTesting(true);
        showToast('正在測試掃描...', 'success');
        await new Promise(res => setTimeout(res, 2000));
        const success = Math.random() > 0.2;
        if (success) {
            const count = Math.floor(Math.random() * 20) + 1;
            showToast(`測試掃描成功！發現 ${count} 個資源。`, 'success');
        } else {
            showToast('測試掃描失敗，請檢查目標配置。', 'error');
        }
        setIsTesting(false);
    };

    const renderConfigFields = () => {
        switch (formData.type) {
            case 'K8s':
                return (
                    <>
                        <input
                            type="file"
                            ref={kubeconfigInputRef}
                            className="hidden"
                            accept=".yaml,.yml,.kubeconfig,text/plain"
                            onChange={handleFileSelect}
                        />
                        <div className="space-y-1">
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-slate-300">Kubeconfig</label>
                                <button
                                    type="button"
                                    onClick={triggerFileSelect}
                                    className="flex items-center text-xs text-sky-400 hover:text-sky-300 px-2 py-0.5 rounded-md hover:bg-sky-500/20"
                                >
                                    <Icon name="upload" className="w-3 h-3 mr-1.5"/>
                                    上傳檔案
                                </button>
                            </div>
                            <textarea
                                rows={5}
                                value={formData.config?.kubeconfig || ''}
                                onChange={e => handleConfigChange('kubeconfig', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm font-mono"
                                placeholder="在此貼上您的 kubeconfig YAML 或上傳檔案。"
                            />
                        </div>
                    </>
                );
            case 'SNMP':
                return <FormRow label="SNMP Community String"><input type="text" value={formData.config?.community || ''} onChange={e => handleConfigChange('community', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" /></FormRow>;
            case 'Static Range':
                return <FormRow label="IP Range"><input type="text" value={formData.config?.ipRange || ''} onChange={e => handleConfigChange('ipRange', e.target.value)} placeholder="e.g., 192.168.1.1/24" className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" /></FormRow>;
            case 'Cloud Provider':
                 return <FormRow label="API Key"><input type="password" value={formData.config?.apiKey || ''} onChange={e => handleConfigChange('apiKey', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" /></FormRow>;
            default:
                return <div className="text-center text-slate-400 p-4 bg-slate-800/50 rounded-md">此掃描類型無需額外配置。</div>;
        }
    };

    return (
        <Modal
            title={job ? '編輯自動掃描任務' : '新增自動掃描任務'}
            isOpen={isOpen}
            onClose={onClose}
            width="w-1/2 max-w-2xl"
            footer={
                <div className="flex justify-between w-full">
                    <button onClick={handleTestScan} disabled={isTesting} className="flex items-center text-sm px-4 py-2 rounded-md transition-colors text-white bg-slate-600 hover:bg-slate-500 disabled:opacity-50">
                        {isTesting ? <Icon name="loader-circle" className="w-4 h-4 mr-2 animate-spin" /> : <Icon name="scan-search" className="w-4 h-4 mr-2" />}
                        {isTesting ? '測試中...' : '測試掃描'}
                    </button>
                    <div className="flex space-x-2">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">取消</button>
                        <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">儲存</button>
                    </div>
                </div>
            }
        >
            <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-2 -mr-4">
                <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/20 space-y-4">
                    <h3 className="text-lg font-semibold text-white">1. 基本資訊</h3>
                    <FormRow label="名稱 *">
                        <input type="text" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                    </FormRow>
                    <div className="grid grid-cols-2 gap-4">
                        <FormRow label="掃描類型">
                            <select value={formData.type || ''} onChange={e => handleChange('type', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" disabled={isLoadingOptions}>
                                {isLoadingOptions && <option>載入中...</option>}
                                {autoDiscoveryOptions?.jobTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </FormRow>
                        <FormRow label="掃描排程 (Cron)">
                            <input type="text" value={formData.schedule || ''} onChange={e => handleChange('schedule', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm font-mono" />
                        </FormRow>
                    </div>
                </div>

                <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/20 space-y-4">
                    <h3 className="text-lg font-semibold text-white">2. 目標配置</h3>
                    <p className="text-sm text-slate-400 -mt-2">專注於 **如何找到資源**，只放掃描需要的連線參數。</p>
                    {renderConfigFields()}
                </div>

                <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/20 space-y-4">
                    <h3 className="text-lg font-semibold text-white">3. Exporter 綁定</h3>
                    <p className="text-sm text-slate-400 -mt-2">專注於 **如何持續監控**。系統會依「掃描類型」自動選擇常見 Exporter。</p>
                    <FormRow label="Exporter 模板">
                        <select value={formData.exporterConfig?.type || 'none'} onChange={e => handleExporterConfigChange('type', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" disabled={isLoadingOptions}>
                            {isLoadingOptions && <option>載入中...</option>}
                            {autoDiscoveryOptions?.exporterTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </FormRow>
                    {formData.exporterConfig?.type === 'snmp_exporter' && (
                        <FormRow label="MIB Profile">
                            <input type="text" value={formData.exporterConfig.mibProfile || ''} onChange={e => handleExporterConfigChange('mibProfile', e.target.value)} placeholder="例如：cisco_standard" className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                        </FormRow>
                    )}
                    {(formData.exporterConfig?.type === 'modbus_exporter' || formData.exporterConfig?.type === 'ipmi_exporter') && (
                        <FormRow label="自訂 YAML 配置">
                            <textarea rows={5} value={formData.exporterConfig.customConfigYaml || ''} onChange={e => handleExporterConfigChange('customConfigYaml', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm font-mono" />
                        </FormRow>
                    )}
                </div>
                
                <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/20 space-y-4">
                     <h3 className="text-lg font-semibold text-white">4. 標籤與分類 (Metadata)</h3>
                    <FormRow label="標籤 (Tags)">
                        <KeyValueInput values={formData.tags || []} onChange={(tags) => handleChange('tags', tags)} />
                    </FormRow>
                </div>
            </div>
        </Modal>
    );
};

export default AutoDiscoveryEditModal;