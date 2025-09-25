import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { MOCK_DASHBOARDS } from '../constants';
import DashboardViewer from '../components/DashboardViewer';
import { DashboardType } from '../types';

const DashboardViewPage: React.FC = () => {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const dashboard = MOCK_DASHBOARDS.find(d => d.id === dashboardId);

  if (!dashboard) {
    return <div className="text-center text-red-500">Dashboard not found!</div>;
  }
  
  if (dashboard.type === DashboardType.BuiltIn) {
    // Built-in dashboards have their own routes (e.g., /sre-war-room)
    // Redirect to its dedicated path.
    return <Navigate to={dashboard.path} replace />;
  }

  // For Grafana dashboards, render the viewer
  return (
    <div className="h-full flex flex-col">
       <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{dashboard.name}</h1>
       </div>
      <DashboardViewer dashboard={dashboard} />
    </div>
  );
};

export default DashboardViewPage;
