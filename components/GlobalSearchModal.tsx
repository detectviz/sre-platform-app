import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import Icon from './Icon';
import api from '../services/api';
import { Dashboard, Resource, User, AutomationPlaybook, Incident } from '../types';
import { showToast } from '../services/toast';
import { useContent } from '../contexts/ContentContext';
import NewIncidentModal from './NewIncidentModal';
import { useTheme } from '../contexts/ThemeContext';

// Interfaces
interface Command {
    id: string;
    name: string;
    description: string;
    icon: string;
    actionKey: string;
}

interface SearchResult {
    id: string;
    name: string;
    description: string;
    path: string;
    type: 'Dashboard' | 'Resource' | 'User' | 'Command' | 'Action' | 'Playbook';
    item: any;
    action?: (payload?: any) => void;
}

// Main Component
const GlobalSearchModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    // State management
    const [step, setStep] = useState('root');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [payload, setPayload] = useState<any>({});
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const { content } = useContent();
    const { theme, setTheme } = useTheme();
    const modalContent = content?.COMMAND_PALETTE;

    const [commands, setCommands] = useState<Command[]>([]);
    const [isNewIncidentModalOpen, setIsNewIncidentModalOpen] = useState(false);

    // Fetch commands
    useEffect(() => {
        if (isOpen) {
            api.get<Command[]>('/commands').then(res => setCommands(res.data));
        }
    }, [isOpen]);

    // Action mapping
    const handleOpenNewIncident = useCallback(() => {
        setIsNewIncidentModalOpen(true);
        onClose();
    }, [onClose]);

    const handleThemeChange = useCallback(() => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        showToast(nextTheme === 'dark' ? '已切換至深色主題。' : '已切換至淺色主題。', 'success');
        onClose();
    }, [theme, setTheme, onClose]);

    const commandActions: Record<string, (payload?: any) => void> = useMemo(() => ({
        'new_incident': handleOpenNewIncident,
        'silence_resource': () => setStep('silence_resource_search'),
        'run_playbook': () => setStep('run_playbook_search'),
        'change_theme': handleThemeChange,
    }), [handleOpenNewIncident, handleThemeChange]);

    const handleIncidentCreated = useCallback((incident: Incident) => {
        setIsNewIncidentModalOpen(false);
        navigate(`/incidents/${incident.id}`);
    }, [navigate]);


    // Reset state on open/close
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setStep('root');
                setQuery('');
                setResults([]);
                setPayload({});
                setActiveIndex(0);
            }, 200); // Wait for modal close animation
        } else {
             setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);
    
    const performSearch = useCallback(async (currentQuery: string) => {
        setIsLoading(true);
        try {
            const [dashboardsRes, resourcesRes, usersRes] = await Promise.all([
                api.get<{ items: Dashboard[] }>('/dashboards', { params: { keyword: currentQuery, page_size: 5 } }),
                api.get<{ items: Resource[] }>('/resources', { params: { keyword: currentQuery, page_size: 5 } }),
                api.get<{ items: User[] }>('/iam/users', { params: { keyword: currentQuery, page_size: 5 } }),
            ]);
            const combinedResults: SearchResult[] = [
                ...dashboardsRes.data.items.map(d => ({ id: d.id, name: d.name, description: d.description, path: d.path, type: 'Dashboard' as const, item: d })),
                ...resourcesRes.data.items.map(r => ({ id: r.id, name: r.name, description: `${r.type} in ${r.region}`, path: `/resources/${r.id}`, type: 'Resource' as const, item: r })),
                ...usersRes.data.items.map(u => ({ id: u.id, name: u.name, description: u.email, path: `/settings/identity-access-management`, type: 'User' as const, item: u })),
            ];
            setResults(combinedResults);
        } catch (error) {
            // Global search failed
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const searchForResource = useCallback(async (currentQuery: string) => {
        setIsLoading(true);
        try {
            const res = await api.get<{ items: Resource[] }>('/resources', { params: { keyword: currentQuery, page_size: 10 } });
            setResults(res.data.items.map(r => ({
                id: r.id,
                name: r.name,
                description: r.type,
                path: `/resources/${r.id}`,
                type: 'Resource',
                item: r,
            })));
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const searchForPlaybook = useCallback(async (currentQuery: string) => {
        setIsLoading(true);
        try {
            const res = await api.get<AutomationPlaybook[]>('/automation/scripts');
            const filtered = res.data.filter(p => p.name.toLowerCase().includes(currentQuery.toLowerCase()));
            setResults(filtered.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                path: `/automation`,
                type: 'Playbook',
                item: p,
            })));
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Effect for searching
    useEffect(() => {
        setActiveIndex(0);
        let debounce: ReturnType<typeof setTimeout>;
        
        switch (step) {
            case 'root':
                if (query.startsWith('>')) {
                    setIsLoading(false);
                    const commandQuery = query.substring(1).toLowerCase();
                    const filteredCommands = commands.filter(c => c.name.toLowerCase().includes(commandQuery) || c.description.toLowerCase().includes(commandQuery));
                    setResults(filteredCommands.map(c => ({ id: c.id, name: c.name, description: c.description, path: '#', type: 'Command', item: c, action: commandActions[c.actionKey] })));
                } else if (query.length > 1) {
                    setIsLoading(true);
                    debounce = setTimeout(() => performSearch(query), 300);
                } else {
                    setResults([]);
                }
                break;
            case 'silence_resource_search':
                 if (query.length > 0) {
                    setIsLoading(true);
                    debounce = setTimeout(() => searchForResource(query), 300);
                } else {
                    setResults([]);
                }
                break;
            case 'run_playbook_search':
                if (query.length > 0) {
                   setIsLoading(true);
                   debounce = setTimeout(() => searchForPlaybook(query), 300);
                } else {
                   setResults([]);
                }
                break;
            default:
                setResults([]);
        }
        
        return () => clearTimeout(debounce);
    }, [query, step, commands, commandActions, performSearch, searchForResource, searchForPlaybook]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!results.length && step !== 'silence_duration') return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(prev => (prev + 1) % results.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(prev => (prev - 1 + results.length) % results.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (step === 'silence_duration') {
                    handleSelect({} as SearchResult); // Special case for duration input
                } else {
                    const activeResult = results[activeIndex];
                    if (activeResult) handleSelect(activeResult);
                }
            } else if (e.key === 'Backspace' && query === '' && step !== 'root') {
                 e.preventDefault();
                 setStep('root');
            }
        };

        if(isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, results, activeIndex, query, step]);
    
    const handleSelect = (result: SearchResult) => {
        switch(step) {
            case 'root':
                if (result.type === 'Command' && result.action) {
                    result.action();
                } else {
                    navigate(result.path);
                    onClose();
                }
                break;
            case 'silence_resource_search':
                setPayload({ resource: result.item });
                setStep('silence_duration');
                setQuery('');
                break;
            case 'run_playbook_search':
                showToast(`Running playbook: ${result.name}`, 'success');
                api.post(`/automation/scripts/${result.id}/execute`, { parameters: {} });
                onClose();
                break;
            case 'silence_duration':
                 if (query.trim()) {
                    api.post(`/resources/${payload.resource.id}/silence`, { duration: query.trim() });
                    showToast(`Silencing resource "${payload.resource.name}" for ${query}...`, 'success');
                    onClose();
                 }
                 break;
        }
    };
    
    // Grouping and rendering
    const groupedResults = useMemo(() => {
        return results.reduce((acc, result) => {
            const typeKey = result.type === 'Action' ? 'Actions' : `${result.type}s`;
            if (!acc[typeKey]) acc[typeKey] = [];
            acc[typeKey].push(result);
            return acc;
        }, {} as Record<string, SearchResult[]>);
    }, [results]);

    const getTypeIcon = (type: SearchResult['type']) => {
        switch (type) {
            case 'Dashboard': return 'layout-dashboard';
            case 'Resource': return 'database-zap';
            case 'User': return 'user';
            case 'Command': return 'command';
            case 'Playbook': return 'play-circle';
            default: return 'search';
        }
    };
    
    const getPlaceholder = () => {
        if (!modalContent) return 'Loading...';
        switch(step) {
            case 'root': return modalContent.PLACEHOLDER_ROOT;
            case 'silence_resource_search': return modalContent.PLACEHOLDER_SILENCE_SEARCH;
            case 'silence_duration': return modalContent.PLACEHOLDER_SILENCE_DURATION;
            case 'run_playbook_search': return modalContent.PLACEHOLDER_RUN_PLAYBOOK;
            default: return modalContent.SEARCH_PLACEHOLDER;
        }
    };

    const silencePrefix = modalContent?.SILENCE_PREFIX_TEMPLATE?.replace('{name}', payload.resource?.name || '') || '';

    return (
        <>
        <Modal title="" isOpen={isOpen} onClose={onClose} width="w-1/2 max-w-3xl" className="glass-card rounded-xl border border-slate-700/50 shadow-2xl flex flex-col max-w-4xl max-h-[60vh] animate-fade-in-down">
            <div className="p-3 border-b border-slate-700/50">
                 <div className="relative flex items-center">
                    {step === 'silence_resource_search' && <span className="pl-4 pr-2 text-slate-400 font-semibold">{modalContent?.SILENCE_PREFIX_TEMPLATE?.replace('{name}', '')}</span>}
                    {step === 'silence_duration' && <span className="pl-4 pr-2 text-slate-400 font-semibold">{silencePrefix}</span>}
                    {step === 'run_playbook_search' && <span className="pl-4 pr-2 text-slate-400 font-semibold">{modalContent?.RUN_PLAYBOOK_PREFIX}</span>}
                    
                    <Icon name={isLoading ? "loader-circle" : "search"} className={`absolute ${step === 'root' ? 'left-4' : 'left-auto'} text-slate-400 w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} style={{ left: step === 'root' ? '1rem' : 'auto' }} />
                    
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={getPlaceholder()}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="w-full bg-transparent border-none pl-12 py-3 text-lg focus:outline-none focus:ring-0 text-slate-100 placeholder:text-slate-500"
                        autoFocus
                    />
                </div>
            </div>
            <div className="flex-grow overflow-y-auto">
                {!isLoading && query.length > 1 && results.length === 0 && <div className="text-center p-8 text-slate-400">{modalContent?.NO_RESULTS}</div>}
                {Object.entries(groupedResults).map(([type, items]) => (
                    <div key={type} className="px-2 pt-2">
                        <h3 className="text-xs font-semibold text-slate-400 px-3 py-1">{type}</h3>
                        <ul>
                            {(items as SearchResult[]).map((item, index) => {
                                let itemIndex = index;
                                const typeKeys = Object.keys(groupedResults);
                                const currentTypeIndex = typeKeys.indexOf(type);
                                for (let i = 0; i < currentTypeIndex; i++) {
                                    const group = groupedResults[typeKeys[i]];
                                    if (group) {
                                       itemIndex += group.length;
                                    }
                                }

                                return (
                                <li key={item.type + item.id}
                                    onClick={() => handleSelect(item)}
                                    className={`p-3 flex items-center rounded-lg cursor-pointer ${activeIndex === itemIndex ? 'bg-slate-700/50' : ''}`}>
                                    <Icon name={getTypeIcon(item.type)} className="w-5 h-5 mr-4 text-slate-300" />
                                    <div>
                                        <p className="font-medium text-white">{item.name}</p>
                                        <p className="text-sm text-slate-400">{item.description}</p>
                                    </div>
                                </li>
                            )})}
                        </ul>
                    </div>
                ))}
            </div>
        </Modal>
        <NewIncidentModal
            isOpen={isNewIncidentModalOpen}
            onClose={() => setIsNewIncidentModalOpen(false)}
            onSuccess={handleIncidentCreated}
        />
        </>
    );
};

export default GlobalSearchModal;
