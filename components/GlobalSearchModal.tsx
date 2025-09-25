import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import Icon from './Icon';
import api from '../services/api';
import { Dashboard, Resource, User } from '../types';

interface SearchResult {
    id: string;
    name: string;
    description: string;
    path: string;
    type: 'Dashboard' | 'Resource' | 'User';
}

const GlobalSearchModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setResults([]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (searchTerm.length < 2) {
            setResults([]);
            return;
        }

        const debounce = setTimeout(() => {
            setIsLoading(true);
            // In a real app, this would be a single backend endpoint. Here we simulate it with parallel calls.
            Promise.all([
                api.get<{ items: Dashboard[] }>('/dashboards', { params: { keyword: searchTerm, page_size: 5 } }),
                api.get<{ items: Resource[] }>('/resources', { params: { keyword: searchTerm, page_size: 5 } }),
                api.get<{ items: User[] }>('/iam/users', { params: { keyword: searchTerm, page_size: 5 } }),
            ]).then(([dashboardsRes, resourcesRes, usersRes]) => {
                const combinedResults: SearchResult[] = [
                    ...dashboardsRes.data.items.map(d => ({ id: d.id, name: d.name, description: d.description, path: d.path, type: 'Dashboard' as const })),
                    ...resourcesRes.data.items.map(r => ({ id: r.id, name: r.name, description: `${r.type} in ${r.region}`, path: `/resources/${r.id}`, type: 'Resource' as const })),
                    ...usersRes.data.items.map(u => ({ id: u.id, name: u.name, description: u.email, path: `/settings/identity-access-management`, type: 'User' as const })),
                ];
                setResults(combinedResults);
            }).finally(() => {
                setIsLoading(false);
            });
        }, 300);

        return () => clearTimeout(debounce);
    }, [searchTerm]);

    const groupedResults = useMemo(() => {
        return results.reduce((acc, result) => {
            if (!acc[result.type]) {
                acc[result.type] = [];
            }
            acc[result.type].push(result);
            return acc;
        }, {} as Record<SearchResult['type'], SearchResult[]>);
    }, [results]);

    const handleResultClick = (path: string) => {
        navigate(path);
        onClose();
    };
    
    const getTypeIcon = (type: SearchResult['type']) => {
        switch (type) {
            case 'Dashboard': return 'layout-dashboard';
            case 'Resource': return 'database-zap';
            case 'User': return 'user';
            default: return 'search';
        }
    }

    return (
        <Modal title="全局搜索" isOpen={isOpen} onClose={onClose} width="w-1/2 max-w-3xl">
            <div className="relative">
                <Icon name="search" className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="搜索儀表板、資源、人員..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-12 pr-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    autoFocus
                />
            </div>
            <div className="mt-4 max-h-[60vh] overflow-y-auto">
                {isLoading && <div className="text-center p-4 text-slate-400">搜索中...</div>}
                {!isLoading && searchTerm.length > 1 && results.length === 0 && <div className="text-center p-4 text-slate-400">找不到結果</div>}
                
                {Object.entries(groupedResults).map(([type, items]) => (
                    <div key={type} className="mb-4">
                        <h3 className="text-sm font-semibold text-slate-400 px-2 mb-2">{type}</h3>
                        <ul>
                            {items.map(item => (
                                <li key={item.type + item.id}
                                    onClick={() => handleResultClick(item.path)}
                                    className="p-3 flex items-center rounded-lg hover:bg-slate-700/50 cursor-pointer">
                                    <Icon name={getTypeIcon(item.type)} className="w-5 h-5 mr-4 text-slate-300" />
                                    <div>
                                        <p className="font-medium text-white">{item.name}</p>
                                        <p className="text-sm text-slate-400">{item.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </Modal>
    );
};

export default GlobalSearchModal;
