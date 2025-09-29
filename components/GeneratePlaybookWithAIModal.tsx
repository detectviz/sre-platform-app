


import React, { useState, useCallback } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import { ParameterDefinition, AutomationPlaybook } from '../types';
import FormRow from './FormRow';
import api from '../services/api';
import { useContent } from '../contexts/ContentContext';

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
    const { content: pageContent } = useContent();
    const content = pageContent?.GENERATE_PLAYBOOK_WITH_AI_MODAL;
    const globalContent = pageContent?.GLOBAL;

    const handleGenerate = useCallback(async () => {
        if (!prompt || !content) return;
        setIsLoading(true);
        setResult(null);
        setError(null);
        try {
            const { data } = await api.post<GeneratedPlaybook>('/ai/automation/generate-script', { prompt });
            setResult(data);
        } catch (e) {
            console.error("AI Generation Error:", e);
            setError(content.ERROR_MESSAGE);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, content]);
    
    const handleApply = () => {
        if (result) {
            onApply(result);
            onClose();
        }
    };

    if (!content || !globalContent) {
        return null;
    }
    
    return (
        <Modal
            title={content.TITLE}
            isOpen={isOpen}
            onClose={onClose}
            width="w-2/3 max-w-4xl"
            footer={
                <div className="flex justify-between w-full">
                     <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">
                        {globalContent.CANCEL}
                    </button>
                    {result && (
                         <button onClick={handleApply} className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md flex items-center">
                            <Icon name="check" className="w-4 h-4 mr-2" />
                            {content.APPLY_BUTTON}
                        </button>
                    )}
                </div>
            }
        >
            <div className="space-y-4 max-h-[70vh] flex flex-col">
                <FormRow label={content.PROMPT_LABEL}>
                    <textarea
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        rows={3}
                        placeholder={content.PROMPT_PLACEHOLDER}
                        className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"
                    />
                </FormRow>

                <button onClick={handleGenerate} disabled={isLoading || !prompt} className="w-full flex items-center justify-center text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-md px-4 py-2 disabled:bg-slate-600 disabled:cursor-not-allowed">
                    {isLoading ? <Icon name="loader-circle" className="w-5 h-5 animate-spin" /> : <><Icon name="brain-circuit" className="w-5 h-5 mr-2" /> {isLoading ? content.GENERATING_BUTTON : content.GENERATE_BUTTON}</>}
                </button>

                {error && <div className="p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-md text-sm">{error}</div>}
                
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-64">
                        <Icon name="loader-circle" className="w-12 h-12 text-purple-400 animate-spin" />
                        <p className="mt-4 text-slate-300">{content.LOADING_MESSAGE}</p>
                    </div>
                )}
                
                {result && (
                    <div className="flex-grow space-y-4 overflow-y-auto pt-4 border-t border-slate-700">
                        <h3 className="text-lg font-semibold text-white">{content.RESULTS_TITLE}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormRow label={content.SCRIPT_TYPE_LABEL}>
                                <p className="font-mono text-sm bg-slate-800/50 rounded px-3 py-2">{result.type}</p>
                            </FormRow>
                        </div>
                        <FormRow label={content.CONTENT_LABEL}>
                            <pre className="text-sm bg-slate-900/70 rounded-md p-3 font-mono text-slate-300 overflow-x-auto max-h-60">
                                <code>{result.content}</code>
                            </pre>
                        </FormRow>
                        <FormRow label={content.PARAMETERS_LABEL}>
                            {result.parameters && result.parameters.length > 0 ? (
                                <div className="space-y-2">
                                    {result.parameters.map(p => (
                                        <div key={p.name} className="p-2 bg-slate-800/50 rounded-md font-mono text-xs">
                                            {p.name} ({p.type}){p.required ? ' *' : ''}
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-slate-400">{content.NO_PARAMETERS_DETECTED}</p>}
                        </FormRow>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default GeneratePlaybookWithAIModal;