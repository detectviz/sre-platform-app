import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_DASHBOARD_TEMPLATES } from '../../constants';
import Icon from '../../components/Icon';

const DashboardTemplatesPage: React.FC = () => {
    const navigate = useNavigate();

    const handleUseTemplate = (templateId: string) => {
        // In a real app, this would pass the template config to the new dashboard page
        console.log(`Using template ${templateId}`);
        navigate('/dashboards/new'); 
    };

    return (
        <div className="h-full flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_DASHBOARD_TEMPLATES.map((template) => (
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
                                onClick={() => handleUseTemplate(template.id)}
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