import React, { useState, useEffect } from 'react';
import Modal from '@/shared/components/Modal';
import Icon from '@/shared/components/Icon';
import { AlertRule } from '@/shared/types';
import api from '@/services/api';

interface TestRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  rule: AlertRule | null;
}

const buildFallbackPayload = (targetRule: AlertRule): Record<string, unknown> | undefined => {
    const firstCondition = targetRule.condition_groups?.[0]?.conditions?.[0];
    if (!firstCondition) {
        return undefined;
    }

    const threshold = typeof firstCondition.threshold === 'number' ? firstCondition.threshold : 0;
    const operator = firstCondition.operator?.trim() ?? '>';
    const adjustment = operator.startsWith('<') ? -1 : 1;
    const resourceCandidate =
        (typeof targetRule.target === 'string' && targetRule.target.trim().length > 0 && targetRule.target) ||
        targetRule.labels?.[0] ||
        targetRule.name ||
        targetRule.id;

    return {
        metric: firstCondition.metric || `metric_${targetRule.id}`,
        value: threshold + adjustment,
        resource: resourceCandidate,
    };
};

const TestRuleModal: React.FC<TestRuleModalProps> = ({ isOpen, onClose, rule }) => {
    const [payload, setPayload] = useState('');
    const [result, setResult] = useState<{ matches: boolean; preview: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingPayload, setIsFetchingPayload] = useState(false);
    const [payloadError, setPayloadError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !rule) {
            return;
        }

        let isMounted = true;

        const loadSamplePayload = async () => {
            setIsFetchingPayload(true);
            setPayload('');
            setResult(null);
            setPayloadError(null);

            try {
                const { data } = await api.get<AlertRule>(`/alert-rules/${rule.id}`);
                if (!isMounted) {
                    return;
                }
                if (data.test_payload) {
                    setPayload(JSON.stringify(data.test_payload, null, 2));
                    return;
                }

                const fallbackPayload = buildFallbackPayload(data);
                if (fallbackPayload) {
                    setPayload(JSON.stringify(fallbackPayload, null, 2));
                    setPayloadError('此規則尚未提供範例資料，已依條件自動帶入建議值。');
                } else {
                    setPayload('');
                    setPayloadError('此規則尚未提供範例資料，請手動輸入測試 Payload。');
                }
            } catch (error) {
                if (!isMounted) {
                    return;
                }
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                const fallbackPayload = buildFallbackPayload(rule);
                if (fallbackPayload) {
                    setPayload(JSON.stringify(fallbackPayload, null, 2));
                } else {
                    setPayload('');
                }
                setPayloadError(`無法從伺服器載入範例資料：${errorMessage}`);
            } finally {
                if (isMounted) {
                    setIsFetchingPayload(false);
                }
            }
        };

        loadSamplePayload();

        return () => {
            isMounted = false;
        };
    }, [isOpen, rule]);

    const handleTest = async () => {
        if (!rule) return;
        setIsLoading(true);
        setResult(null);
        try {
            const parsedPayload = JSON.parse(payload);
            const { data } = await api.post<{ matches: boolean; preview: string }>(
                `/alert-rules/${rule.id}/test`, 
                { payload: parsedPayload }
            );
            setResult(data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            if (error instanceof SyntaxError) {
                setResult({ matches: false, preview: `JSON 格式錯誤: ${errorMessage}` });
            } else {
                setResult({ matches: false, preview: `測試執行失敗: ${errorMessage}` });
            }
        } finally {
            setIsLoading(false);
        }
    };
    
  const modalTitle = rule ? `測試規則: ${rule.name}` : '測試規則';

  return (
    <Modal
      title={modalTitle}
      isOpen={isOpen}
      onClose={onClose}
      width="w-1/2"
      footer={
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">關閉</button>
          <button onClick={handleTest} disabled={!rule || isLoading} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md flex items-center disabled:bg-slate-600 disabled:cursor-not-allowed">
            {isLoading ? <Icon name="loader-circle" className="w-4 h-4 mr-2 animate-spin" /> : <Icon name="play" className="w-4 h-4 mr-2" />}
            {isLoading ? '測試中...' : '執行測試'}
          </button>
        </div>
      }
    >
        {rule ? (
          <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">測試 Payload (JSON)</label>
                <textarea
                    value={payload}
                    onChange={(e) => setPayload(e.target.value)}
                    rows={8}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                    disabled={isFetchingPayload}
                />
                {isFetchingPayload && (
                    <p className="mt-1 text-xs text-slate-400">正在載入範例資料...</p>
                )}
                {payloadError && (
                    <p className="mt-1 text-xs text-red-400">{payloadError}</p>
                )}
            </div>
            {result && (
                 <div className={`p-4 rounded-md ${result.matches ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50'} border`}>
                    <h4 className={`font-semibold text-lg flex items-center ${result.matches ? 'text-green-300' : 'text-red-300'}`}>
                        <Icon name={result.matches ? 'check-circle' : 'x-circle'} className="w-5 h-5 mr-2" />
                        {result.matches ? '條件匹配' : '條件不匹配'}
                    </h4>
                    <p className="mt-1 text-sm text-slate-300 font-mono">{result.preview}</p>
                </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
            <Icon name="alert-triangle" className="w-6 h-6" />
            <p className="font-medium">尚未選擇要測試的告警規則。</p>
            <p className="text-sm text-slate-500">請先於告警規則列表中選擇目標，再開啟測試功能。</p>
          </div>
        )}
    </Modal>
  );
};

export default TestRuleModal;