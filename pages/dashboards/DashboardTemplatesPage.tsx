import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardTemplate } from '../../types';
import Icon from '../../components/Icon';
import api from '../../services/api';

const DashboardTemplatesPage: React.FC = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<DashboardTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        api.get<DashboardTemplate[]>('/dashboards/templates')
            .then(res => setTemplates(res.data))
            .catch(err => console.error("Failed to fetch dashboard templates", err))
            .finally(() => setIsLoading(false));
    }, []);

    const handleUseTemplate = (template: DashboardTemplate) => {
        navigate('/dashboards/new', { state: { template } }); 
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Icon name="loader-circle" className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                    <div key={template.id} className="glass-card rounded-xl p-6 flex flex-col justify-between group hover:border-sky-500/50 transition-all duration-300">
                        <div>
                            <div className="flex items-start justify-between">
                                <Icon name={template.icon} className="w-10 h-10 text-sky-400" />
                                <span className="text-xs bg-slate-700/80 px-2 py-1 rounded-full">{template.category}</span>
                            </div>
                            <h3 className="text-xl font-bold mt-4 text-white">{template.name}</h3>
                            <p className="text-sm text-slate-400 mt-2 flex-grow">{template.description}</p>
                        </div>
                        <div className="mt-6">
                            <button 
                                onClick={() => handleUseTemplate(template)}
                                className="w-full flex items-center justify-center text-sm font-semibold text-white bg-slate-700/70 hover:bg-sky-600 px-4 py-2 rounded-lg transition-colors duration-200 group-hover:bg-sky-600"
                            >
                                <Icon name="plus-circle" className="w-4 h-4 mr-2" />
                                使用此範本
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DashboardTemplatesPage;