import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormRow from './FormRow';
import Icon from './Icon';
import { NotificationChannel, NotificationChannelType, NotificationChannelTestResponse } from '../types';
import { useOptions } from '../contexts/OptionsContext';
import { showToast } from '../services/toast';
import api from '../services/api';

interface MultiEmailInputProps {
    value: string; // Comma-separated string
    onChange: (value: string) => void;
    label: string;
}

const MultiEmailInput: React.FC<MultiEmailInputProps> = ({ value, onChange, label }) => {
    const emails = value ? value.split(',').filter(e => e.trim() !== '') : [];
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (['Enter', ',', ' '].includes(e.key)) {
            e.preventDefault();
            addEmail();
        }
    };

    const addEmail = () => {
        const newEmail = inputValue.trim();
        if (newEmail && !emails.includes(newEmail)) {
            // Basic email format validation
            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
                onChange([...emails, newEmail].join(','));
                setInputValue('');
            } else {
                showToast(`"${newEmail}" 不是一個有效的電子郵件格式。`, 'error');
            }
        }
    };

    const removeEmail = (emailToRemove: string) => {
        onChange(emails.filter(email => email !== emailToRemove).join(','));
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text');
        const pastedEmails = paste.split(/[\s,;]+/).filter(str => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim()));
        if (pastedEmails.length > 0) {
            const newEmails = [...new Set([...emails, ...pastedEmails])];
            onChange(newEmails.join(','));
        }
    };


    return (
        <FormRow label={label}>
            <div className="w-full bg-slate-800 border border-slate-700 rounded-md px-2 py-1.5 flex flex-wrap items-center gap-2">
                {emails.map(email => (
                    <div key={email} className="bg-slate-700 text-slate-200 text-sm rounded-md px-2 py-1 flex items-center gap-1.5">
                        <span>{email}</span>
                        <button onClick={() => removeEmail(email)} className="text-slate-400 hover:text-white">
                            <Icon name="x" className="w-3 h-3" />
                        </button>
                    </div>
                ))}
                <input
                    type="email"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={addEmail}
                    onPaste={handlePaste}
                    className="flex-grow bg-transparent focus:outline-none text-sm p-1"
                    placeholder={emails.length === 0 ? '輸入電子郵件...' : ''}
                />
            </div>
        </FormRow>
    );
};


interface NotificationChannelEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (channel: NotificationChannel) => void;
    channel: NotificationChannel | null;
}

const NotificationChannelEditModal: React.FC<NotificationChannelEditModalProps> = ({ isOpen, onClose, onSave, channel }) => {
    const [formData, setFormData] = useState<Partial<NotificationChannel>>({});
    const [isTokenVisible, setIsTokenVisible] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const { options, isLoading: isLoadingOptions } = useOptions();
    const channelOptions = options?.notification_channels;

    useEffect(() => {
        if (isOpen) {
            setIsTokenVisible(false); // Reset token visibility on open
            if (!isLoadingOptions && channelOptions) {
                const defaultType = channelOptions.channel_types[0]?.value || 'Email';
                setFormData(channel || {
                    name: '',
                    type: defaultType,
                    enabled: true,
                    config: {},
                });
            }
        }
    }, [isOpen, channel, channelOptions, isLoadingOptions]);

    const handleSave = () => {
        onSave(formData as NotificationChannel);
    };

    const handleConfigChange = (key: string, value: string | number) => {
        setFormData(prev => ({ ...prev, config: { ...prev.config, [key]: value } }));
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as NotificationChannelType;
        setFormData(prev => ({
            ...prev,
            type: newType,
            config: {}, // Reset config when type changes
        }));
    };

    const handleTest = async () => {
        if (!formData?.id) {
            showToast('請先儲存管道後再發送測試通知。', 'error');
            return;
        }

        setIsTesting(true);

        const recipients = (formData.config?.to || '')
            .split(/[\s,;]+/)
            .map(recipient => recipient.trim())
            .filter(Boolean);

        const payload: Record<string, unknown> = {
            message: formData.name ? `這是一則測試通知：${formData.name}` : '這是一則測試通知',
        };

        if (recipients.length > 0) {
            payload.recipients = recipients;
        }

        try {
            const { data } = await api.post<NotificationChannelTestResponse>(
                `/settings/notification-channels/${formData.id}/test`,
                payload,
            );

            showToast(data.message || '測試通知已發送。', data.success ? 'success' : 'error');

            setFormData(prev => ({
                ...prev,
                last_test_result: data.result,
                last_tested_at: data.tested_at,
            }));
        } catch (error: any) {
            const errorMessage =
                (error?.data?.message as string | undefined) ||
                (error?.message as string | undefined) ||
                '測試通知發送失敗，請稍後再試。';
            showToast(errorMessage, 'error');
        } finally {
            setIsTesting(false);
        }
    };

    const renderDynamicFields = () => {
        switch (formData.type) {
            case 'Email':
                return (
                    <>
                        <MultiEmailInput
                            label="收件人 (To) *"
                            value={formData.config?.to || ''}
                            onChange={value => handleConfigChange('to', value)}
                        />
                        <MultiEmailInput
                            label="副本 (CC)"
                            value={formData.config?.cc || ''}
                            onChange={value => handleConfigChange('cc', value)}
                        />
                        <MultiEmailInput
                            label="密件副本 (BCC)"
                            value={formData.config?.bcc || ''}
                            onChange={value => handleConfigChange('bcc', value)}
                        />
                    </>
                );
            case 'Webhook (通用)':
                return (
                    <>
                        <FormRow label="Webhook URL *">
                            <input type="url" value={formData.config?.webhook_url || ''} onChange={e => handleConfigChange('webhook_url', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                        </FormRow>
                        <FormRow label="HTTP 方法 (Method)">
                            <select
                                value={formData.config?.http_method || 'POST'}
                                onChange={e => handleConfigChange('http_method', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
                                disabled={isLoadingOptions}
                            >
                                {isLoadingOptions ? <option>載入中...</option> : channelOptions?.http_methods.map(method => (
                                    <option key={method} value={method}>{method}</option>
                                ))}
                            </select>
                        </FormRow>
                    </>
                );
            case 'Slack':
                return (
                    <>
                        <FormRow label="Incoming Webhook URL *">
                            <input type="url" value={formData.config?.webhook_url || ''} onChange={e => handleConfigChange('webhook_url', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                        </FormRow>
                        <FormRow label="提及對象 (Mention)">
                            <input type="text" value={formData.config?.mention || ''} onChange={e => handleConfigChange('mention', e.target.value)} placeholder="@channel, @here, or user_id" className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                        </FormRow>
                    </>
                );
            case 'LINE Notify':
                return (
                    <FormRow label="存取權杖 (Access Token) *">
                        <div className="relative">
                            <input
                                type={isTokenVisible ? 'text' : 'password'}
                                value={formData.config?.access_token || ''}
                                onChange={e => handleConfigChange('access_token', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setIsTokenVisible(!isTokenVisible)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-white"
                                aria-label={isTokenVisible ? "Hide token" : "Show token"}
                            >
                                <Icon name={isTokenVisible ? 'eye' : 'eye-off'} className="w-5 h-5" />
                            </button>
                        </div>
                    </FormRow>
                );
            case 'SMS':
                return (
                    <FormRow label="收件人手機號碼 *">
                        <input type="tel" value={formData.config?.phone_number || ''} onChange={e => handleConfigChange('phone_number', e.target.value)} placeholder="例如: +886912345678" className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                    </FormRow>
                );
            default:
                return <div className="p-4 text-center text-slate-400">此通知類型目前無額外設定。</div>;
        }
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
                    <button
                        onClick={handleTest}
                        disabled={!formData?.id || isTesting}
                        title={formData?.id ? undefined : '請先儲存管道後再測試'}
                        className="px-4 py-2 text-sm font-medium text-white bg-slate-600 hover:bg-slate-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isTesting ? '測試中...' : '發送測試'}
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">儲存</button>
                </div>
            }
        >
            <div className="space-y-4">
                <FormRow label="名稱 *">
                    <input type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" required />
                </FormRow>
                <FormRow label="管道類型 *">
                    <select
                        value={formData.type || ''}
                        onChange={handleTypeChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
                        disabled={isLoadingOptions}
                        required
                    >
                        {isLoadingOptions ? <option>載入中...</option> : channelOptions?.channel_types.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </FormRow>
                <div className="pt-4 mt-4 border-t border-slate-700/50 space-y-4">
                    {renderDynamicFields()}
                </div>
            </div>
        </Modal>
    );
};

export default NotificationChannelEditModal;