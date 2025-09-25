
import React from 'react';
import { Outlet } from 'react-router-dom';
import PageKPIs from '../components/PageKPIs';
import Tabs from '../components/Tabs';

const AutomationCenterPage: React.FC = () => {
    const tabs = [
        { label: 'Playbooks', path: '/automation' },
        { label: 'Run History', path: '/automation/history' },
        { label: 'Triggers', path: '/automation/triggers' },
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="mb-6">
                 <h1 className="text-3xl font-bold">Automation Center</h1>
            </div>
            
            <PageKPIs pageName="Automation Center" />

            <Tabs tabs={tabs} />
            
            <div className="mt-6 flex-grow">
                <Outlet />
            </div>
        </div>
    );
};

export default AutomationCenterPage;
