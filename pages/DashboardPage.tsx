
import React from 'react';
import { Outlet } from 'react-router-dom';
import PageKPIs from '../components/PageKPIs';
import Tabs from '../components/Tabs';

const DashboardPage: React.FC = () => {
  const tabs = [
    { label: 'Dashboard List', path: '/dashboards' },
    { label: 'Templates', path: '/dashboards/templates' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Management</h1>
      <PageKPIs pageName="Dashboard Management" />
      <Tabs tabs={tabs} />
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardPage;
