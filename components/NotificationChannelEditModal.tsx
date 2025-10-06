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
    placeholder?: string;
    helperText?: string;
}

const MultiEmailInput: React.FC<MultiEmailInputProps> = ({ value, onChange, label, placeholder, helperText }) => {
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
                    placeholder={emails.length === 0 ? (placeholder || '輸入電子郵件，按 Enter 新增') : ''}
                />
            </div>
            {helperText && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
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
    const getDefaultType = () => channelOptions?.channel_types[0]?.value ?? 'email';

    useEffect(() => {
        if (isOpen) {
            setIsTokenVisible(false); // Reset token visibility on open
            if (!isLoadingOptions && channelOptions) {
                const defaultType = getDefaultType();
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
        switch (formData.type ?? getDefaultType()) {
            case 'email':
                return (
                    <>
                        <MultiEmailInput
                            label="收件人 (To) *"
                            value={formData.config?.to || ''}
                            onChange={value => handleConfigChange('to', value)}
                            placeholder="user@example.com, admin@company.com"
                            helperText="使用逗號或 Enter 分隔多個收件人。"
                        />
                        <MultiEmailInput
                            label="副本 (CC)"
                            value={formData.config?.cc || ''}
                            onChange={value => handleConfigChange('cc', value)}
                            placeholder="cc@example.com"
                            helperText="選填，可通知額外關係人。"
                        />
                        <MultiEmailInput
                            label="密件副本 (BCC)"
                            value={formData.config?.bcc || ''}
                            onChange={value => handleConfigChange('bcc', value)}
                            placeholder="bcc@example.com"
                            helperText="選填，收件人將看不到彼此的地址。"
                        />
                    </>
                );
            case 'webhook':
                return (
                    <>
                        <FormRow label="Webhook URL *">
                            <div className="space-y-1">
                                <input
                                    type="url"
                                    value={formData.config?.webhook_url || ''}
                                    onChange={e => handleConfigChange('webhook_url', e.target.value)}
                                    placeholder="https://example.com/hooks/incident"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                                />
                                <p className="text-xs text-slate-500">請貼上可接受 POST 請求的完整 URL，系統將以 JSON 形式送出通知。</p>
                            </div>
                        </FormRow>
                        <FormRow label="HTTP 方法 (Method)">
                            <select
                                value={formData.config?.http_method || 'POST'}
                                onChange={e => handleConfigChange('http_method', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
                                disabled={isLoadingOptions}
                            >
                                {isLoadingOptions ? <option>載入中...</option> : channelOptions?.http_methods.map(method => (
                                    <option key={method} value={method}>{method.toUpperCase()}</option>
                                ))}
                            </select>
                        </FormRow>
                    </>
                );
            case 'slack':
                return (
                    <>
                        <FormRow label="Incoming Webhook URL *">
                            <div className="space-y-1">
                                <input
                                    type="url"
                                    value={formData.config?.webhook_url || ''}
                                    onChange={e => handleConfigChange('webhook_url', e.target.value)}
                                    placeholder="請貼上來自 Slack 的 Webhook URL"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                                />
                                <p className="text-xs text-slate-500">可於 Slack App 設定頁面取得 URL，系統將依此傳送通知訊息。</p>
                            </div>
                        </FormRow>
                        <FormRow label="提及對象 (Mention)">
                            <div className="space-y-1">
                                <input
                                    type="text"
                                    value={formData.config?.mention || ''}
                                    onChange={e => handleConfigChange('mention', e.target.value)}
                                    placeholder="@username, #channel"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                                />
                                <p className="text-xs text-slate-500">使用 Slack 支援的提及格式，可加入多個對象並以逗號分隔。</p>
                            </div>
                        </FormRow>
                    </>
                );
            case 'line':
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
                                aria-label={isTokenVisible ? "隱藏 Token" : "顯示 Token"}
                                title={isTokenVisible ? '隱藏 Token' : '顯示 Token'}
                            >
                                <Icon name={isTokenVisible ? 'eye' : 'eye-off'} className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">請貼上 LINE Notify 取得的 Access Token，點擊右側圖示可顯示或隱藏內容。</p>
                    </FormRow>
                );
            case 'sms':
                return (
                    <FormRow label="收件人手機號碼 *">
                        <div className="flex gap-2">
                            <select
                                value={formData.config?.country_code || '+886'}
                                onChange={e => handleConfigChange('country_code', e.target.value)}
                                className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
                            >
                                <option value="+886">+886 台灣</option>
                                <option value="+81">+81 日本</option>
                                <option value="+82">+82 韓國</option>
                                <option value="+1">+1 美國/加拿大</option>
                            </select>
                            <input
                                type="tel"
                                value={formData.config?.phone_number || ''}
                                onChange={e => handleConfigChange('phone_number', e.target.value)}
                                onBlur={e => {
                                    if (e.target.value && !/^\d{6,15}$/.test(e.target.value.replace(/[^\d]/g, ''))) {
                                        showToast('請輸入不含特殊符號的國際號碼，例如：912345678。', 'error');
                                    }
                                }}
                                placeholder="例如: 912345678"
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                            />
                        </div>
                        <p className="mt-1 text-xs text-slate-500">系統會自動帶入國碼，號碼僅需輸入本地段落。</p>
                    </FormRow>
                );
            default:
                return <div className="p-4 text-center text-slate-400">此管道類型目前無額外設定。</div>;
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