import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormRow from './FormRow';
import { NotificationChannel, NotificationChannelType } from '../types';

interface NotificationChannelEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (channel: NotificationChannel) => void;
  channel: NotificationChannel | null;
}

const NotificationChannelEditModal: React.FC<NotificationChannelEditModalProps> = ({ isOpen, onClose, onSave, channel }) => {
    const [formData, setFormData] = useState<Partial<NotificationChannel>>({
        type: 'Email',
        enabled: true,
        config: {},
    });

    useEffect(() => {
        if (isOpen) {
            setFormData(channel || { type: 'Email', enabled: true, config: {} });
        }
    }, [isOpen, channel]);

    const handleSave = () => {
        onSave(formData as NotificationChannel);
    };
    
    const handleConfigChange = (key: string, value: string | number) => {
        setFormData(prev => ({ ...prev, config: { ...prev.config, [key]: value } }));
    };

    return (
        <Modal
            title={channel ? '編輯通知管道' : '新增通知管道'}
            isOpen={isOpen}
            onClose={onClose}
            width="w-1/2 max-w-2xl"
            footer={
                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">取消</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">儲存</button>
                </div>
            }
        >
            <div className="space-y-4">
                <FormRow label="管道名稱 *">
                    <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                </FormRow>
                <FormRow label="管道類型">
                    <select value={formData.type || 'Email'} onChange={e => setFormData({...formData, type: e.target.value as NotificationChannelType, config: {}})} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                        <option value="Email">Email</option>
                        <option value="Slack">Slack</option>
                        <option value="Webhook">Webhook</option>
                    </select>
                </FormRow>

                <div className="pt-4 mt-4 border-t border-slate-700/50 space-y-4">
                    {formData.type === 'Email' && (
                        <>
                            <FormRow label="SMTP 伺服器">
                                <input type="text" value={formData.config?.smtpServer || ''} onChange={e => handleConfigChange('smtpServer', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                            </FormRow>
                             <div className="grid grid-cols-2 gap-4">
                                <FormRow label="埠號">
                                    <input type="number" value={formData.config?.port || ''} onChange={e => handleConfigChange('port', parseInt(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                                </FormRow>
                                <FormRow label="使用者名稱">
                                    <input type="text" value={formData.config?.username || ''} onChange={e => handleConfigChange('username', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                                </FormRow>
                            </div>
                        </>
                    )}
                    {formData.type === 'Slack' && (
                        <FormRow label="Webhook URL">
                            <input type="text" value={formData.config?.webhookUrl || ''} onChange={e => handleConfigChange('webhookUrl', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                        </FormRow>
                    )}
                    {formData.type === 'Webhook' && (
                         <>
                            <FormRow label="Webhook URL">
                                <input type="text" value={formData.config?.webhookUrl || ''} onChange={e => handleConfigChange('webhookUrl', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                            </FormRow>
                            <FormRow label="HTTP Method">
                                <select value={formData.config?.httpMethod || 'POST'} onChange={e => handleConfigChange('httpMethod', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm">
                                    <option value="POST">POST</option>
                                    <option value="PUT">PUT</option>
                                    <option value="GET">GET</option>
                                </select>
                            </FormRow>
                            <FormRow label="Custom Headers (JSON format)">
                                <textarea value={formData.config?.headers || ''} onChange={e => handleConfigChange('headers', e.target.value)} rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 font-mono text-sm" placeholder='{ "Content-Type": "application/json" }'></textarea>
                            </FormRow>
                            <FormRow label="Body Template (JSON format)">
                                <textarea value={formData.config?.bodyTemplate || ''} onChange={e => handleConfigChange('bodyTemplate', e.target.value)} rows={5} className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 font-mono text-sm" placeholder='{ "text": "{{ event.summary }}" }'></textarea>
                            </FormRow>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default NotificationChannelEditModal;