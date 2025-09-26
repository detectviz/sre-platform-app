
import React from 'react';
import PageKPIs from '../../components/PageKPIs';

interface GenericBuiltInDashboardPageProps {
    name: string;
    description: string;
    widgetIds: string[];
}

const GenericBuiltInDashboardPage: React.FC<GenericBuiltInDashboardPageProps> = ({ name, description, widgetIds }) => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">{name}</h1>
                    <p className="text-slate-400 mt-1">{description}</p>
                </div>
            </div>
            {/* Pass widgetIds directly to the enhanced PageKPIs component */}
            <PageKPIs pageName={`dashboard-${name}`} widgetIds={widgetIds} />
        </div>
    );
};

export default GenericBuiltInDashboardPage;
