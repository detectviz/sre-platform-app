
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FormRow from './FormRow';
import { AutomationPlaybook, ParameterDefinition } from '../types';

interface RunPlaybookModalProps {
  isOpen: boolean;
  onClose: () => void;
  playbook: AutomationPlaybook | null;
  onRun: (playbookId: string, params: Record<string, any>) => void;
}

const RunPlaybookModal: React.FC<RunPlaybookModalProps> = ({ isOpen, onClose, playbook, onRun }) => {
    const [paramValues, setParamValues] = useState<Record<string, any>>({});

    useEffect(() => {
        if (playbook?.parameters) {
            const initialParams = playbook.parameters.reduce((acc, param) => {
                acc[param.name] = param.defaultValue ?? (param.type === 'boolean' ? false : '');
                return acc;
            }, {} as Record<string, any>);
            setParamValues(initialParams);
        } else {
            setParamValues({});
        }
    }, [playbook]);

    const handleParamChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setParamValues(prev => ({ ...prev, [name]: checked }));
        } else {
            setParamValues(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleRunClick = () => {
        if (playbook) {
            onRun(playbook.id, paramValues);
        }
    };
    
    if (!playbook) return null;

    return (
        <Modal
            title={`運行腳本: ${playbook.name}`}
            isOpen={isOpen}
            onClose={onClose}
            width="w-1/2 max-w-2xl"
            footer={
                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">取消</button>
                    <button onClick={handleRunClick} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">確認執行</button>
                </div>
            }
        >
            <div className="space-y-4">
                <p className="text-slate-400">{playbook.description}</p>
                {playbook.parameters && playbook.parameters.length > 0 ? (
                    <div className="space-y-4 pt-4 mt-4 border-t border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white">腳本參數</h3>
                        {playbook.parameters.map(param => {
                            const commonProps = {
                                id: param.name,
                                name: param.name,
                                onChange: handleParamChange,
                                required: param.required,
                            };
                            const inputClassName = "w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500";

                            if (param.type === 'boolean') {
                                return (
                                    <div key={param.name} className="flex items-center">
                                        <label htmlFor={param.name} className="flex items-center space-x-3 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                {...commonProps} 
                                                checked={!!paramValues[param.name]} 
                                                className="form-checkbox h-5 w-5 rounded bg-slate-800 border-slate-600 text-sky-500 focus:ring-sky-500 cursor-pointer" 
                                            />
                                            <span className="text-slate-300">{param.label + (param.required ? ' *' : '')}</span>
                                        </label>
                                    </div>
                                );
                            }

                            let inputElement;
                            switch (param.type) {
                                case 'number':
                                    inputElement = <input type="number" {...commonProps} value={paramValues[param.name] ?? ''} placeholder={param.placeholder} className={inputClassName} />;
                                    break;
                                case 'enum':
                                    inputElement = (
                                        <select {...commonProps} value={paramValues[param.name] ?? ''} className={inputClassName}>
                                            {param.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                    );
                                    break;
                                case 'string':
                                default:
                                    inputElement = <input type="text" {...commonProps} value={paramValues[param.name] ?? ''} placeholder={param.placeholder} className={inputClassName} />;
                                    break;
                            }

                            return (
                                <FormRow key={param.name} label={param.label + (param.required ? ' *' : '')}>
                                    {inputElement}
                                </FormRow>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-4 mt-4 text-center bg-slate-800/50 rounded-md border border-slate-700/50">
                        <p className="text-slate-300">此腳本無需額外參數。您確定要立即執行嗎？</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default RunPlaybookModal;
