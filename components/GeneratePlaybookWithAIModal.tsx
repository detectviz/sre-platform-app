import React, { useState, useCallback } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import { ParameterDefinition, AutomationPlaybook } from '../types';
import FormRow from './FormRow';
import api from '../services/api';

interface GeneratedPlaybook {
  type: AutomationPlaybook['type'];
  content: string;
  parameters: ParameterDefinition[];
}

interface GeneratePlaybookWithAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (generated: GeneratedPlaybook) => void;
}

const GeneratePlaybookWithAIModal: React.FC<GeneratePlaybookWithAIModalProps> = ({ isOpen, onClose, onApply }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<GeneratedPlaybook | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!prompt) return;
        setIsLoading(true);
        setResult(null);
        setError(null);
        try {
            const { data } = await api.post<GeneratedPlaybook>('/automation/scripts/generate-with-ai', { prompt });
            setResult(data);
        } catch (e) {
            console.error("AI Generation Error:", e);
            setError("Failed to generate playbook. Please check your prompt or API key and try again.");
        } finally {
            setIsLoading(false);
        }
    }, [prompt]);
    
    const handleApply = () => {
        if (result) {
            onApply(result);
            onClose();
        }
    };
    
    return (
        <Modal
            title="使用 AI 生成腳本"
            isOpen={isOpen}
            onClose={onClose}
            width="w-2/3 max-w-4xl"
            footer={
                <div className="flex justify-between w-full">
                     <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">
                        取消
                    </button>
                    {result && (
                         <button onClick={handleApply} className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md flex items-center">
                            <Icon name="check" className="w-4 h-4 mr-2" />
                            套用
                        </button>
                    )}
                </div>
            }
        >
            <div className="space-y-4 max-h-[70vh] flex flex-col">
                <FormRow label="描述您的自動化需求">
                    <textarea
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        rows={3}
                        placeholder="例如: 建立一個 shell 腳本來重啟 Kubernetes pod，需要傳入 namespace 和 pod 名稱..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
                    />
                </FormRow>

                <button onClick={handleGenerate} disabled={isLoading || !prompt} className="w-full flex items-center justify-center text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md px-4 py-2 disabled:bg-slate-600 disabled:cursor-not-allowed">
                    {isLoading ? <Icon name="loader-circle" className="w-5 h-5 animate-spin" /> : <><Icon name="brain-circuit" className="w-5 h-5 mr-2" /> 生成腳本</>}
                </button>

                {error && <div className="p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-md text-sm">{error}</div>}
                
                {result && (
                    <div className="flex-grow space-y-4 overflow-y-auto pt-4 border-t border-slate-700">
                        <h3 className="text-lg font-semibold text-white">生成結果</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormRow label="腳本類型">
                                <p className="font-mono text-sm bg-slate-800/50 rounded px-3 py-2">{result.type}</p>
                            </FormRow>
                        </div>
                        <FormRow label="腳本內容">
                            <pre className="text-sm bg-slate-900/70 rounded-md p-3 font-mono text-slate-300 overflow-x-auto max-h-60">
                                <code>{result.content}</code>
                            </pre>
                        </FormRow>
                        <FormRow label="偵測到的參數">
                            {result.parameters && result.parameters.length > 0 ? (
                                <div className="space-y-2">
                                    {result.parameters.map(p => (
                                        <div key={p.name} className="p-2 bg-slate-800/50 rounded-md font-mono text-xs">
                                            {p.name} ({p.type}){p.required ? ' *' : ''}
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-slate-400">未偵測到參數。</p>}
                        </FormRow>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default GeneratePlaybookWithAIModal;