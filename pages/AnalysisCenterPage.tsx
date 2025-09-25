
import React from 'react';
import { Outlet } from 'react-router-dom';
import PageKPIs from '../components/PageKPIs';
import Tabs from '../components/Tabs';

const AnalysisCenterPage: React.FC = () => {
    const tabs = [
        { label: 'Overview', path: '/analyzing' },
        { label: 'Log Explorer', path: '/analyzing/logs' },
        { label: 'Trace Analysis', path: '/analyzing/traces' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Analysis Center</h1>
            <PageKPIs pageName="Analysis Center" />
            <Tabs tabs={tabs} />
            <div className="mt-6">
                <Outlet />
            </div>
        </div>
    );
};

export default AnalysisCenterPage;
