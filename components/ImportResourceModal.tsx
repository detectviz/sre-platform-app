import React, { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import { DiscoveryJob, DiscoveredResource, ExporterConfig } from '../types';
import api from '../services/api';
import { showToast } from '../services/toast';
import FormRow from './FormRow';

type ImportStatus = 'pending' | 'importing' | 'deploying' | 'success' | 'failed';

interface ImportItemStatus {
    id: string;
    name: string;
    status: ImportStatus;
    message?: string;
}

interface ImportResourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    resourcesToImport: DiscoveredResource[];
    job: DiscoveryJob;
}

const ImportResourceModal: React.FC<ImportResourceModalProps> = ({ isOpen, onClose, onSuccess, resourcesToImport, job }) => {
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState<ImportItemStatus[]>([]);
    const [exporterConfig, setExporterConfig] = useState<ExporterConfig | undefined>(job.exporterConfig);
    const [exporterTypes, setExporterTypes] = useState<Array<{ id: string; name: string; description: string }>>([]);
    const [isLoadingExporterTypes, setIsLoadingExporterTypes] = useState(false);
    const [exporterTypesError, setExporterTypesError] = useState<string | null>(null);

    const loadExporterTypes = useCallback(async () => {
        setIsLoadingExporterTypes(true);
        setExporterTypesError(null);
        try {
            const { data } = await api.get<Array<{ id: string; name: string; description: string }>>('/alert-rules/exporter-types');
            setExporterTypes(data);
        } catch (error: any) {
            console.error('Error loading exporter types:', error);
            const message =
                error?.data?.message ||
                error?.message ||
                error?.statusText ||
                '無法載入 Exporter 類型，請稍後重試。';
            setExporterTypesError(message);
            showToast(message, 'error');
        } finally {
            setIsLoadingExporterTypes(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            setExporterConfig(job.exporterConfig || { type: 'none' });
            setImportProgress([]);
            setIsImporting(false);
            loadExporterTypes();
        }
    }, [isOpen, job, loadExporterTypes]);
    
    const handleExporterConfigChange = (field: keyof ExporterConfig, value: any) => {
        const newConfig = { ...(exporterConfig || { type: 'none' }), [field]: value };
        if (field === 'type') {
            delete newConfig.mibProfile;
            delete newConfig.customConfigYaml;
        }
        setExporterConfig(newConfig);
    };

    const handleConfirmImport = async () => {
        setIsImporting(true);
        const initialProgress = resourcesToImport.map(r => ({ id: r.id, name: r.name, status: 'importing' as ImportStatus }));
        setImportProgress(initialProgress);

        try {
            await api.post('/resources/import-discovered', {
                discoveredResourceIds: resourcesToImport.map(r => r.id),
                jobId: job.id,
                exporterConfig: exporterConfig
            });
            
            for (let i = 0; i < resourcesToImport.length; i++) {
                const resource = resourcesToImport[i];
                if (exporterConfig && exporterConfig.type !== 'none') {
                     await new Promise(r => setTimeout(r, 500));
                     setImportProgress(prev => prev.map(p => p.id === resource.id ? { ...p, status: 'deploying' } : p));
                }
                await new Promise(r => setTimeout(r, 1000));
                setImportProgress(prev => prev.map(p => p.id === resource.id ? { ...p, status: 'success' } : p));
            }
            
            showToast(`${resourcesToImport.length} 個資源已成功匯入。`, 'success');
            onSuccess();

        } catch (error: any) {
             showToast(error.message || '匯入資源時發生錯誤。', 'error');
             setImportProgress(prev => prev.map(p => p.status !== 'success' ? { ...p, status: 'failed' } : p));
        } finally {
            setIsImporting(false); 
        }
    };
    
    const allDone = importProgress.length > 0 && importProgress.every(p => p.status === 'success' || p.status === 'failed');

    const getStatusIndicator = (status: ImportStatus) => {
        switch (status) {
            case 'pending': return <Icon name="clock" className="w-4 h-4 text-slate-400" />;
            case 'importing':
            case 'deploying':
                return <Icon name="loader-circle" className="w-4 h-4 text-sky-400 animate-spin" />;
            case 'success': return <Icon name="check-circle" className="w-4 h-4 text-green-400" />;
            case 'failed': return <Icon name="x-circle" className="w-4 h-4 text-red-400" />;
        }
    };
    
    const getStatusText = (status: ImportStatus) => {
        switch (status) {
            case 'pending': return '待處理';
            case 'importing': return '匯入中...';
            case 'deploying': return '部署 Agent...';
            case 'success': return '成功';
            case 'failed': return '失敗';
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`匯入 ${resourcesToImport.length} 個新資源`}
            width="w-1/2"
            footer={
                <div className="flex justify-end">
                    <button
                        onClick={allDone ? onClose : handleConfirmImport}
                        disabled={isImporting}
                        className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md flex items-center justify-center w-32 disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        {isImporting ? '處理中...' : allDone ? '關閉' : '確認匯入'}
                    </button>
                </div>
            }
        >
            <div className="space-y-4">
                <p>您即將匯入以下新發現的資源到主資源清單中。請確認操作。</p>
                <div className="max-h-40 overflow-y-auto border border-slate-700 rounded-lg p-2 bg-slate-900/50">
                    <ul className="divide-y divide-slate-700/50">
                        {(importProgress.length > 0 ? importProgress : resourcesToImport).map(res => (
                            <li key={res.id} className="p-2 flex justify-between items-center">
                                <span className="font-semibold text-white">{res.name}</span>
                                {importProgress.length > 0 && (
                                    <div className="flex items-center space-x-2 text-sm text-slate-300">
                                        {getStatusIndicator(res.status as ImportStatus)}
                                        <span>{getStatusText(res.status as ImportStatus)}</span>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="pt-4 border-t border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white mb-2">Exporter 配置覆寫</h3>
                    <p className="text-sm text-slate-400 mb-4">
                        預設使用掃描任務的 Exporter 配置 ({job.exporterConfig?.type || 'none'})。您可以在此為本次匯入的資源進行覆寫。
                    </p>

                    <FormRow label="Exporter 模板">
                        <select
                            value={exporterConfig?.type || 'none'}
                            onChange={e => handleExporterConfigChange('type', e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
                            disabled={isImporting || isLoadingExporterTypes || !!exporterTypesError}
                        >
                            {exporterTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            {exporterTypes.length === 0 && !isLoadingExporterTypes && (
                                <option value={exporterConfig?.type || 'none'}>
                                    {exporterConfig?.type || 'none'}
                                </option>
                            )}
                        </select>
                        {isLoadingExporterTypes && (
                            <p className="mt-2 text-sm text-slate-400">載入 Exporter 類型中...</p>
                        )}
                        {exporterTypesError && (
                            <div className="mt-2 flex items-center justify-between rounded border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                                <span>{exporterTypesError}</span>
                                <button
                                    type="button"
                                    onClick={loadExporterTypes}
                                    className="ml-4 rounded border border-red-400/60 px-2 py-1 text-xs font-medium text-red-200 hover:bg-red-500/20"
                                >
                                    重試
                                </button>
                            </div>
                        )}
                    </FormRow>

                    {exporterConfig?.type === 'snmp_exporter' && (
                        <FormRow label="MIB Profile">
                            <input
                                type="text"
                                value={exporterConfig.mibProfile || ''}
                                onChange={e => handleExporterConfigChange('mibProfile', e.target.value)}
                                placeholder="e.g., cisco_standard"
                                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
                                disabled={isImporting}
                            />
                        </FormRow>
                    )}
                     {(exporterConfig?.type === 'modbus_exporter' || exporterConfig?.type === 'ipmi_exporter') && (
                        <FormRow label="自訂 YAML 配置">
                            <textarea
                                rows={3}
                                value={exporterConfig.customConfigYaml || ''}
                                onChange={e => handleExporterConfigChange('customConfigYaml', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm font-mono"
                                disabled={isImporting}
                            />
                        </FormRow>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ImportResourceModal;