import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import { DiscoveryJob, DiscoveredResource, DiscoveryJobExporterBinding } from '../types';
import api from '../services/api';
import { showToast } from '../services/toast';
import FormRow from './FormRow';
import { useOptions } from '../contexts/OptionsContext';

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
    const [exporterBinding, setExporterBinding] = useState<DiscoveryJobExporterBinding | undefined>(job.exporterBinding);
    const { options } = useOptions();
    const autoDiscoveryOptions = options?.autoDiscovery;
    const exporterTemplates = autoDiscoveryOptions?.exporterTemplates || [];
    const mibProfiles = autoDiscoveryOptions?.mibProfiles || [];

    useEffect(() => {
        if (isOpen) {
            setExporterBinding(job.exporterBinding);
            setImportProgress([]);
            setIsImporting(false);
        }
    }, [isOpen, job]);

    const handleExporterBindingChange = (updates: Partial<DiscoveryJobExporterBinding>) => {
        setExporterBinding((prev) => {
            const current = prev || { templateId: job.exporterBinding?.templateId || 'none' };
            const nextBinding: DiscoveryJobExporterBinding = { ...current, ...updates };
            if (updates.templateId) {
                delete nextBinding.overridesYaml;
                delete nextBinding.mibProfileId;
            }
            return nextBinding;
        });
    };

    const handleConfirmImport = async () => {
        setIsImporting(true);
        const initialProgress = resourcesToImport.map((r) => ({ id: r.id, name: r.name, status: 'importing' as ImportStatus }));
        setImportProgress(initialProgress);

        try {
            await api.post('/resources/import-discovered', {
                discoveredResourceIds: resourcesToImport.map((r) => r.id),
                jobId: job.id,
                exporterBinding,
            });

            for (let i = 0; i < resourcesToImport.length; i++) {
                const resource = resourcesToImport[i];
                if (exporterBinding && exporterBinding.templateId !== 'none') {
                    await new Promise((r) => setTimeout(r, 500));
                    setImportProgress((prev) => prev.map((p) => (p.id === resource.id ? { ...p, status: 'deploying' } : p)));
                }
                await new Promise((r) => setTimeout(r, 1000));
                setImportProgress((prev) => prev.map((p) => (p.id === resource.id ? { ...p, status: 'success' } : p)));
            }

            showToast(`${resourcesToImport.length} 個資源已成功匯入。`, 'success');
            onSuccess();
        } catch (error: any) {
            showToast(error.message || '匯入資源時發生錯誤。', 'error');
            setImportProgress((prev) => prev.map((p) => (p.status !== 'success' ? { ...p, status: 'failed' } : p)));
        } finally {
            setIsImporting(false);
        }
    };

    const allDone = importProgress.length > 0 && importProgress.every((p) => p.status === 'success' || p.status === 'failed');

    const getStatusIndicator = (status: ImportStatus) => {
        switch (status) {
            case 'pending':
                return <Icon name="clock" className="w-4 h-4 text-slate-400" />;
            case 'importing':
            case 'deploying':
                return <Icon name="loader-circle" className="w-4 h-4 text-sky-400 animate-spin" />;
            case 'success':
                return <Icon name="check-circle" className="w-4 h-4 text-green-400" />;
            case 'failed':
                return <Icon name="x-circle" className="w-4 h-4 text-red-400" />;
        }
    };

    const getStatusText = (status: ImportStatus) => {
        switch (status) {
            case 'pending':
                return '待處理';
            case 'importing':
                return '匯入中...';
            case 'deploying':
                return '部署 Agent...';
            case 'success':
                return '成功';
            case 'failed':
                return '失敗';
        }
    };

    const currentTemplateId = exporterBinding?.templateId || job.exporterBinding?.templateId || 'none';
    const templateMeta = exporterTemplates.find((tpl) => tpl.id === currentTemplateId);
    const availableProfiles = mibProfiles.filter((profile) => profile.templateId === currentTemplateId);

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
                        {(importProgress.length > 0 ? importProgress : resourcesToImport).map((res) => (
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

                <div className="pt-4 border-t border-slate-700/50 space-y-4">
                    <h3 className="text-lg font-semibold text-white">Exporter 配置覆寫</h3>
                    <p className="text-sm text-slate-400">
                        預設沿用掃描任務的 Exporter 綁定 ({job.exporterBinding?.templateId || 'none'})。您可以在此為本次匯入的資源覆寫設定。
                    </p>

                    <FormRow label="Exporter 模板">
                        <select
                            value={currentTemplateId}
                            onChange={(e) => handleExporterBindingChange({ templateId: e.target.value as DiscoveryJobExporterBinding['templateId'] })}
                            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
                        >
                            {exporterTemplates.map((tpl) => (
                                <option key={tpl.id} value={tpl.id}>
                                    {tpl.name}
                                </option>
                            ))}
                            {exporterTemplates.length === 0 && <option value="none">none</option>}
                        </select>
                        {templateMeta?.description && <p className="mt-1 text-xs text-slate-400">{templateMeta.description}</p>}
                    </FormRow>

                    {templateMeta?.supportsMibProfile && (
                        <FormRow label="MIB Profile">
                            <select
                                value={exporterBinding?.mibProfileId || ''}
                                onChange={(e) => handleExporterBindingChange({ mibProfileId: e.target.value || undefined })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
                            >
                                <option value="">選擇 Profile (可選)</option>
                                {availableProfiles.map((profile) => (
                                    <option key={profile.id} value={profile.id}>
                                        {profile.name}
                                    </option>
                                ))}
                            </select>
                            {availableProfiles.length === 0 && (
                                <p className="mt-1 text-xs text-slate-500">未找到對應的 Profile，沿用預設設定。</p>
                            )}
                        </FormRow>
                    )}

                    {templateMeta?.supportsOverrides && (
                        <FormRow label="自訂覆寫 YAML">
                            <textarea
                                rows={3}
                                value={exporterBinding?.overridesYaml || ''}
                                onChange={(e) => handleExporterBindingChange({ overridesYaml: e.target.value })}
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
