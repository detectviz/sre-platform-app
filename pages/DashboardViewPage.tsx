

import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import DashboardViewer from '../components/DashboardViewer';
import { Dashboard } from '../types';
import api from '../services/api';
import Icon from '../components/Icon';
import GenericBuiltInDashboardPage from './dashboards/GenericBuiltInDashboardPage';

const DashboardViewPage: React.FC = () => {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dashboardId) {
        setError('No dashboard ID provided.');
        setIsLoading(false);
        return;
    }

    const fetchDashboard = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get<Dashboard>(`/dashboards/${dashboardId}`);
            setDashboard(data);
        } catch (err) {
            setError('Dashboard not found!');
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchDashboard();
  }, [dashboardId]);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-full">
            <Icon name="loader-circle" className="w-8 h-8 animate-spin text-slate-400" />
        </div>
    );
  }

  if (error || !dashboard) {
    return <div className="text-center text-red-500">{error || 'Dashboard not found!'}</div>;
  }
  
  // FIX: Changed enum comparison to string literal comparison.
  if (dashboard.type === 'built-in') {
    // Handle special, hardcoded built-in dashboards that have their own page components
    if (dashboard.path === '/sre-war-room' || dashboard.path === '/dashboard/infrastructure-insights' || dashboard.path === '/dashboard/resource-overview') {
      return <Navigate to={dashboard.path} replace />;
    }
    // Handle generic, user-created built-in dashboards that have a layout property
    if (dashboard.layout) {
      return <GenericBuiltInDashboardPage name={dashboard.name} description={dashboard.description} widgetIds={dashboard.layout} />;
    }
    // Fallback for any other built-in dashboard without a specific page or layout
    return <Navigate to="/home" replace />;
  }

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