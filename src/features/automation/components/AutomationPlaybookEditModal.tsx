import React, { useState, useEffect, useRef, useMemo } from 'react';
import Modal from '@/shared/components/Modal';
import Icon from '@/shared/components/Icon';
import FormRow from '@/shared/components/FormRow';
import { AutomationPlaybook, ParameterDefinition } from '@/shared/types';
import GeneratePlaybookWithAIModal from './GeneratePlaybookWithAIModal';
import { useOptions } from '@/contexts/OptionsContext';
import { useContent } from '@/contexts/ContentContext';
import { showToast } from '@/services/toast';
import CodeEditor from './CodeEditor';
import IconButton from '@/shared/components/IconButton';

interface AutomationPlaybookEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (playbook: Partial<AutomationPlaybook>) => void;
  playbook: AutomationPlaybook | null;
}

const AutomationPlaybookEditModal: React.FC<AutomationPlaybookEditModalProps> = ({ isOpen, onClose, onSave, playbook }) => {
    const [formData, setFormData] = useState<Partial<AutomationPlaybook>>({});
    const [isAIOpen, setIsAIOpen] = useState(false);
    const { options, isLoading: isLoadingOptions, error: optionsError } = useOptions();
    const scriptOptions = options?.automation_scripts;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { content: pageContent } = useContent();
    const content = pageContent?.AUTOMATION_PLAYBOOK_EDIT_MODAL;
    const globalContent = pageContent?.GLOBAL;

    useEffect(() => {
        if (isOpen) {
            if (!scriptOptions) return;

            const getInitialFormData = (): Partial<AutomationPlaybook> => ({
                name: '',
                description: '',
                type: scriptOptions.playbook_types[0]?.value || 'shell',
                content: '',
                parameters: [],
            });

            setFormData(playbook || getInitialFormData());
        }
    }, [isOpen, playbook, scriptOptions]);

    const handleSave = () => {
        onSave(formData);
    };

    const scriptTypeLabel = useMemo(() => {
        if (!scriptOptions?.playbook_types || !formData.type) {
            return 'TEXT';
        }
        const match = scriptOptions.playbook_types.find(opt => opt.value === formData.type);
        return match?.label || formData.type.toUpperCase();
    }, [scriptOptions?.playbook_types, formData.type]);

    const handleChange = (field: keyof AutomationPlaybook, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleParamChange = (index: number, field: keyof ParameterDefinition, value: any) => {
        const newParams = (formData.parameters || []).map((param, i) => {
            if (i === index) {
                return { ...param, [field]: value };
            }
            return param;
        });
        handleChange('parameters', newParams);
    };
    
    const addParam = () => {
        const newParam: ParameterDefinition = { name: '', label: '', type: 'string', required: false, default_value: '', placeholder: '', options: [] };
        handleChange('parameters', [...(formData.parameters || []), newParam]);
    };
    
    const removeParam = (index: number) => {
        const newParams = [...(formData.parameters || [])];
        newParams.splice(index, 1);
        handleChange('parameters', newParams);
    };
    
    const handleOptionChange = (paramIndex: number, optionIndex: number, field: 'value' | 'label', value: string) => {
        const newParams = (formData.parameters || []).map((param, pIndex) => {
            if (pIndex === paramIndex) {
                const newOptions = (param.options || []).map((opt, oIndex) => {
                    if (oIndex === optionIndex) {
                        return { ...opt, [field]: value };
                    }
                    return opt;
                });
                return { ...param, options: newOptions };
            }
            return param;
        });
        handleChange('parameters', newParams);
    };

    const addOption = (paramIndex: number) => {
        const newParams = JSON.parse(JSON.stringify(formData.parameters || []));
        if (!newParams[paramIndex].options) {
            newParams[paramIndex].options = [];
        }
        newParams[paramIndex].options.push({ value: '', label: '' });
        handleChange('parameters', newParams);
    };
    
    const removeOption = (paramIndex: number, optionIndex: number) => {
        const newParams = JSON.parse(JSON.stringify(formData.parameters || []));
        newParams[paramIndex].options.splice(optionIndex, 1);
        handleChange('parameters', newParams);
    };


    const handleAIGenerate = (generated: { type: AutomationPlaybook['type'], content: string, parameters: ParameterDefinition[] }) => {
        setFormData(prev => ({
            ...prev,
            type: generated.type,
            content: generated.content,
            parameters: generated.parameters
        }));
    };
    
    const handleFileUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            let detectedType: AutomationPlaybook['type'] = formData.type || 'shell';

            if (file.name.endsWith('.sh')) detectedType = 'shell';
            if (file.name.endsWith('.py')) detectedType = 'python';

            setFormData(prev => ({ ...prev, content: text, type: detectedType }));
            showToast(`腳本 "${file.name}" 已成功載入。`, 'success');
        };
        reader.onerror = () => {
            showToast('讀取檔案時發生錯誤。', 'error');
        };
        reader.readAsText(file);

        // Reset input value to allow re-uploading the same file
        event.target.value = '';
    };

    const renderDefaultValueInput = (param: ParameterDefinition, index: number) => {
        const commonProps = {
            value: param.default_value as any,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleParamChange(index, 'default_value', e.target.value),
            className: "w-full bg-slate-700 rounded px-2 py-1 text-sm",
        };

        if (param.type === 'boolean') {
            return (
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={!!param.default_value}
                        onChange={(e) => handleParamChange(index, 'default_value', e.target.checked)}
                        className="form-checkbox h-4 w-4 bg-slate-600 rounded"
                    />
                    <span>{param.default_value ? content.BOOLEAN_ENABLED : content.BOOLEAN_DISABLED}</span>
                </label>
            );
        }
        if (param.type === 'number') {
            return <input type="number" {...commonProps} />;
        }
        return <input type="text" {...commonProps} />;
    };

    if (!content || !globalContent) {
        return (
            <div className="p-6 text-center text-slate-400">
                <Icon name="loader-circle" className="w-6 h-6 mx-auto mb-2 animate-spin" />
                <p>正在載入自動化編輯介面...</p>
            </div>
        );
    }

    return (
        <>
            <Modal
                title={playbook ? content.EDIT_TITLE : content.ADD_TITLE}
                isOpen={isOpen}
                onClose={onClose}
                width="w-2/3 max-w-5xl"
                footer={
                    <div className="flex justify-end space-x-2">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">{globalContent.CANCEL}</button>
                        <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">{globalContent.SAVE}</button>
                    </div>
                }
            >
                <div className="space-y-4 max-h-[70vh] flex flex-col">
                    {optionsError && (
                        <div className="p-3 bg-red-900/50 text-red-300 rounded-md text-sm">{optionsError}</div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormRow label={content.NAME_LABEL}>
                            <input type="text" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" />
                        </FormRow>
                        <FormRow label={content.TYPE_LABEL}>
                            <select value={formData.type || ''} onChange={e => handleChange('type', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm" disabled={isLoadingOptions || !!optionsError}>
                                {isLoadingOptions && <option>{globalContent.LOADING_OPTIONS}</option>}
                                {optionsError && <option>{globalContent.FAILED}</option>}
                                {!isLoadingOptions && !optionsError && scriptOptions?.playbook_types.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </FormRow>
                    </div>
                    <FormRow label={content.DESCRIPTION_LABEL}>
                        <textarea value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} rows={2} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm"></textarea>
                    </FormRow>

                    <div className="flex-grow flex flex-col space-y-4 overflow-y-auto pr-2 -mr-4 pt-4 border-t border-slate-700/50">
                        <FormRow label={content.CONTENT_LABEL}>
                            <CodeEditor
                                value={formData.content || ''}
                                onChange={value => handleChange('content', value)}
                                languageLabel={scriptTypeLabel}
                                placeholder={content.CONTENT_PLACEHOLDER}
                                ariaLabel={content.CONTENT_LABEL}
                                toolbar={(
                                    <>
                                        <IconButton
                                            icon="upload"
                                            label={content.UPLOAD_SCRIPT_BUTTON}
                                            tooltip={content.UPLOAD_SCRIPT_BUTTON}
                                            onClick={handleFileUploadClick}
                                            className="h-8 w-8"
                                        />
                                        <IconButton
                                            icon="brain-circuit"
                                            label={content.GENERATE_WITH_AI_BUTTON}
                                            tooltip={content.GENERATE_WITH_AI_BUTTON}
                                            onClick={() => setIsAIOpen(true)}
                                            tone="primary"
                                            className="h-8 w-8"
                                        />
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            onChange={handleFileSelect}
                                            accept=".sh,.py,.txt,application/x-sh,text/x-python"
                                        />
                                    </>
                                )}
                            />
                        </FormRow>

                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">{content.PARAMETERS_TITLE}</h3>
                            <div className="space-y-3">
                                {formData.parameters?.map((param, index) => (
                                    <div key={index} className="p-3 bg-slate-800/50 rounded-lg space-y-3 border border-slate-700/50">
                                        <div className="grid grid-cols-12 gap-x-3 items-center">
                                            <div className="col-span-3"><input type="text" placeholder={content.PARAM_NAME_PLACEHOLDER} value={param.name} onChange={e => handleParamChange(index, 'name', e.target.value)} className="w-full bg-slate-700 rounded px-2 py-1.5 text-sm" /></div>
                                            <div className="col-span-3"><input type="text" placeholder={content.PARAM_LABEL_PLACEHOLDER} value={param.label} onChange={e => handleParamChange(index, 'label', e.target.value)} className="w-full bg-slate-700 rounded px-2 py-1.5 text-sm" /></div>
                                            <div className="col-span-3">
                                                <select value={param.type} onChange={e => handleParamChange(index, 'type', e.target.value)} className="w-full bg-slate-700 rounded px-2 py-1.5 text-sm" disabled={isLoadingOptions || !!optionsError}>
                                                    {isLoadingOptions && <option>{globalContent.LOADING_OPTIONS}</option>}
                                                    {optionsError && <option>{globalContent.FAILED}</option>}
                                                    {!isLoadingOptions && !optionsError && scriptOptions?.parameter_types.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-span-2 flex items-center space-x-2 text-sm">
                                                <input type="checkbox" checked={param.required} onChange={e => handleParamChange(index, 'required', e.target.checked)} className="form-checkbox h-4 w-4 bg-slate-600 rounded" />
                                                <span>{content.PARAM_REQUIRED_LABEL}</span>
                                            </div>
                                            <button onClick={() => removeParam(index)} className="col-span-1 p-1.5 text-red-400 hover:bg-red-500/20 rounded-full"><Icon name="trash-2" className="w-4 h-4 mx-auto" /></button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-3">
                                            <div>
                                                <label className="text-xs text-slate-400 mb-1 block">{content.PARAM_DEFAULT_VALUE_LABEL}</label>
                                                {renderDefaultValueInput(param, index)}
                                            </div>
                                            {(param.type === 'string' || param.type === 'number') && (
                                                <div>
                                                    <label className="text-xs text-slate-400 mb-1 block">{content.PARAM_PLACEHOLDER_LABEL}</label>
                                                    <input type="text" value={param.placeholder || ''} onChange={e => handleParamChange(index, 'placeholder', e.target.value)} className="w-full bg-slate-700 rounded px-2 py-1.5 text-sm" />
                                                </div>
                                            )}
                                        </div>
                                        {param.type === 'enum' && (
                                            <div>
                                                <label className="text-xs text-slate-400 mb-1 block">{content.PARAM_OPTIONS_LABEL}</label>
                                                <div className="space-y-2">
                                                    {param.options?.map((opt, optIndex) => (
                                                        <div key={optIndex} className="flex items-center space-x-2">
                                                            <input type="text" placeholder={content.PARAM_OPTION_VALUE_PLACEHOLDER} value={opt.value} onChange={e => handleOptionChange(index, optIndex, 'value', e.target.value)} className="w-1/2 bg-slate-700 rounded px-2 py-1 text-xs" />
                                                            <input type="text" placeholder={content.PARAM_OPTION_LABEL_PLACEHOLDER} value={opt.label} onChange={e => handleOptionChange(index, optIndex, 'label', e.target.value)} className="w-1/2 bg-slate-700 rounded px-2 py-1 text-xs" />
                                                            <button onClick={() => removeOption(index, optIndex)} className="p-1 text-slate-400 hover:text-red-400"><Icon name="x" className="w-3 h-3" /></button>
                                                        </div>
                                                    ))}
                                                    <button onClick={() => addOption(index)} className="text-xs text-sky-400 hover:text-sky-300">{content.PARAM_ADD_OPTION_BUTTON}</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <button onClick={addParam} className="text-sm text-sky-400 hover:text-sky-300 flex items-center mt-2">
                                    <Icon name="plus" className="w-4 h-4 mr-1" /> {content.ADD_PARAMETER_BUTTON}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
            <GeneratePlaybookWithAIModal
                isOpen={isAIOpen}
                onClose={() => setIsAIOpen(false)}
                onApply={handleAIGenerate}
            />
        </>
    );
};

export default AutomationPlaybookEditModal;
