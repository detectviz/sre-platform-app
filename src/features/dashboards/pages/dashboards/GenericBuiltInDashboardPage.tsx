

import React from 'react';
import PageKPIs from '@/shared/components/PageKPIs';
import { DashboardLayoutItem } from '@/shared/types';

interface GenericBuiltInDashboardPageProps {
    name: string;
    description: string;
    widget_ids: DashboardLayoutItem[];
}

const GenericBuiltInDashboardPage: React.FC<GenericBuiltInDashboardPageProps> = ({ name, description, widget_ids }) => {
    const ids = widget_ids.map(item => item.i);
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">{name}</h1>
                    <p className="text-slate-400 mt-1">{description}</p>
                </div>
            </div>
            {/* Pass widget_ids directly to the enhanced PageKPIs component */}
            <PageKPIs pageName={`dashboard-${name}`} widget_ids={ids} />
        </div>
    );
};

export default GenericBuiltInDashboardPage;