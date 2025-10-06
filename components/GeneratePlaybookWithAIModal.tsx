import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Modal from './Modal';
import Icon from './Icon';
import { ParameterDefinition, AutomationPlaybook, AutomationPlaybookType } from '../types';
import FormRow from './FormRow';
import api from '../services/api';
import { useContent } from '../contexts/ContentContext';
import { useOptions } from '../contexts/OptionsContext';

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
    const { options } = useOptions();
    const scriptOptions = options?.automation_scripts;
    const typeOptions = useMemo(() => scriptOptions?.playbook_types ?? [], [scriptOptions?.playbook_types]);
    const [targetType, setTargetType] = useState<string>(() => typeOptions[0]?.value || 'shell');
    const resultContainerRef = useRef<HTMLDivElement | null>(null);
    const [showScrollHint, setShowScrollHint] = useState(false);
    const scriptTypeHelper = content?.SCRIPT_TYPE_HELPER ?? 'AI 將依此語言生成腳本，可於套用後再次調整內容。';
    const previewHintLabel = content?.RESULT_PREVIEW_HINT ?? '結果預覽提醒';
    const previewDescription = content?.RESULT_PREVIEW_DESCRIPTION ?? 'AI 會產生腳本內容與參數，套用前請檢查並測試。';

    useEffect(() => {
        if (!resultContainerRef.current) {
            setShowScrollHint(false);
            return;
        }
        const { current } = resultContainerRef;
        const shouldShow = current.scrollHeight > current.clientHeight + 8;
        setShowScrollHint(shouldShow);
    }, [result]);

    const handleResultScroll = useCallback(() => {
        if (!resultContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = resultContainerRef.current;
        setShowScrollHint(scrollTop + clientHeight < scrollHeight - 8);
    }, []);

    const handleGenerate = useCallback(async () => {
        if (!prompt || !content) return;
        setIsLoading(true);
        setResult(null);
        setError(null);
        try {
            const { data } = await api.post<GeneratedPlaybook>('/ai/automation/generate-script', { prompt, target_type: targetType });
            setResult({ ...data, type: (data.type || targetType) as AutomationPlaybookType });
        } catch (e) {
            console.error("AI Generation Error:", e);
            setError(content.ERROR_MESSAGE);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, content, targetType]);

    const handleApply = () => {
        if (result) {
            onApply({ ...result, type: (targetType || result.type) as AutomationPlaybookType });
            onClose();
        }
    };

    const modalTitle = content?.TITLE ?? 'AI 助手生成腳本';
    const cancelLabel = globalContent?.CANCEL ?? '取消';
    const generateLabel = isLoading ? content?.GENERATING_BUTTON ?? '生成中…' : content?.GENERATE_BUTTON ?? '生成腳本';

    useEffect(() => {
        if (!typeOptions.length) return;
        if (!targetType) {
            setTargetType(typeOptions[0].value);
        }
    }, [typeOptions, targetType]);

    if (!content || !globalContent) {
        return (
            <Modal
                title={modalTitle}
                isOpen={isOpen}
                onClose={onClose}
                width="w-2/3 max-w-4xl"
            >
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
                    <Icon name="loader-circle" className="w-6 h-6 animate-spin" />
                    <p className="text-sm">正在準備 AI 腳本產生器，請稍候...</p>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            title={modalTitle}
            isOpen={isOpen}
            onClose={onClose}
            width="w-2/3 max-w-4xl"
            footer={
                <div className="flex justify-between w-full">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">
                        {cancelLabel}
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

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FormRow label={content.SCRIPT_TYPE_LABEL}>
                        <select
                            value={targetType}
                            onChange={event => setTargetType(event.target.value)}
                            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
                        >
                            {typeOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-slate-400">{scriptTypeHelper}</p>
                    </FormRow>
                    <FormRow label={previewHintLabel}>
                        <p className="rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-400">
                            {previewDescription}
                        </p>
                    </FormRow>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-slate-600"
                >
                    {isLoading ? (
                        <Icon name="loader-circle" className="h-5 w-5 animate-spin" />
                    ) : (
                        <Icon name="brain-circuit" className="h-5 w-5" />
                    )}
                    <span>{generateLabel}</span>
                </button>

                {error && <div className="p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-md text-sm">{error}</div>}

                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-64">
                        <Icon name="loader-circle" className="w-12 h-12 text-purple-400 animate-spin" />
                        <p className="mt-4 text-slate-300">{content.LOADING_MESSAGE}</p>
                    </div>
                )}

                {result && (
                    <div
                        ref={resultContainerRef}
                        onScroll={handleResultScroll}
                        className="relative flex-grow space-y-4 overflow-y-auto border-t border-slate-700 pt-4"
                    >
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
                        {showScrollHint && (
                            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-950/95 to-transparent" />
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default GeneratePlaybookWithAIModal;