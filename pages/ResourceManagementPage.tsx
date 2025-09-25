
import React from 'react';
import { Outlet } from 'react-router-dom';
import PageKPIs from '../components/PageKPIs';
import Tabs from '../components/Tabs';

const ResourceManagementPage: React.FC = () => {
    const tabs = [
        { label: 'Resource List', path: '/resources' },
        { label: 'Resource Groups', path: '/resources/groups' },
        { label: 'Topology View', path: '/resources/topology' },
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="mb-6">
                 <h1 className="text-3xl font-bold">Resource Management</h1>
            </div>
            
            <PageKPIs pageName="Resource Management" />
            <Tabs tabs={tabs} />
            
            <div className="mt-6 flex-grow">
                <Outlet />
            </div>
        </div>
    );
};

export default ResourceManagementPage;
