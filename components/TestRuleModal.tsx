
import React, { useState } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import { AlertRule } from '../types';

interface TestRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  rule: AlertRule | null;
}

const TestRuleModal: React.FC<TestRuleModalProps> = ({ isOpen, onClose, rule }) => {
    const [payload, setPayload] = useState('{\n  "metric": "cpu_usage_percent",\n  "value": 95,\n  "resource": "web-server-01"\n}');
    const [result, setResult] = useState<{ matches: boolean; preview: string } | null>(null);

    const handleTest = () => {
        // This is a mock test. A real implementation would send this to the backend.
        try {
            const parsedPayload = JSON.parse(payload);
            const condition = rule?.conditionGroups?.[0]?.conditions[0];
            if (condition && parsedPayload.metric === condition.metric && parsedPayload.value > condition.threshold) {
                 setResult({
                    matches: true,
                    preview: `事件: ${rule?.titleTemplate?.replace('{{resource.name}}', parsedPayload.resource).replace('{{severity}}', rule.severity)}`
                });
            } else {
                 setResult({
                    matches: false,
                    preview: `條件不匹配: ${condition?.metric} (${parsedPayload.value}) 未超過 ${condition?.threshold}`
                });
            }
        } catch (error) {
            setResult({ matches: false, preview: `JSON 格式錯誤: ${error instanceof Error ? error.message : 'Unknown error'}` });
        }
    };
    
  if (!rule) return null;

  return (
    <Modal
      title={`測試規則: ${rule.name}`}
      isOpen={isOpen}
      onClose={onClose}
      width="w-1/2"
      footer={
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">關閉</button>
          <button onClick={handleTest} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md flex items-center">
            <Icon name="play" className="w-4 h-4 mr-2" /> 執行測試
          </button>
        </div>
      }
    >
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">測試 Payload (JSON)</label>
                <textarea 
                    value={payload}
                    onChange={(e) => setPayload(e.target.value)}
                    rows={8}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
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
    </Modal>
  );
};

export default TestRuleModal;