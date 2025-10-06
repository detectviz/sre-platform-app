import React, { useMemo, useState } from 'react';
import IconButton from './IconButton';
import { showToast } from '@/services/toast';

interface JsonPreviewProps {
    data: unknown;
    title?: string;
    className?: string;
    emptyHint?: string;
}

const JsonPreview: React.FC<JsonPreviewProps> = ({ data, title, className = '', emptyHint = '尚無可顯示的內容' }) => {
    const [isCopied, setIsCopied] = useState(false);

    const formatted = useMemo(() => {
        if (data === null || data === undefined) {
            return '';
        }
        try {
            return typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        } catch (error) {
            return '⚠️ 無法格式化資料';
        }
    }, [data]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(formatted);
            setIsCopied(true);
            showToast('已複製到剪貼簿。', 'success');
            setTimeout(() => setIsCopied(false), 1500);
        } catch (error) {
            showToast('無法複製內容，請手動選取。', 'error');
        }
    };

    return (
        <div className={`relative rounded-lg border border-slate-700/60 bg-slate-900/70 ${className}`}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
                <p className="text-sm font-semibold text-white">{title || '原始資料'}</p>
                <IconButton
                    icon={isCopied ? 'check' : 'copy'}
                    label={isCopied ? '已複製' : '複製 JSON'}
                    tooltip={isCopied ? '內容已複製' : '複製原始 JSON'}
                    onClick={handleCopy}
                />
            </div>
            <div className="max-h-80 overflow-auto">
                {formatted ? (
                    <pre className="p-4 text-sm leading-6 text-slate-200 font-mono whitespace-pre-wrap break-words">
                        {formatted}
                    </pre>
                ) : (
                    <div className="p-6 text-sm text-slate-400">{emptyHint}</div>
                )}
            </div>
        </div>
    );
};

export default JsonPreview;
