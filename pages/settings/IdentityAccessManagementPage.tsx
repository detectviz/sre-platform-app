import React from 'react';
import { Outlet } from 'react-router-dom';
import PageKPIs from '../../components/PageKPIs';
import Tabs from '../../components/Tabs';

const IdentityAccessManagementPage: React.FC = () => {
  const tabs = [
    { label: 'Personnel Management', path: '/settings/identity-access-management' },
    { label: 'Team Management', path: '/settings/identity-access-management/teams' },
    { label: 'Role Management', path: '/settings/identity-access-management/roles' },
    { label: 'Audit Logs', path: '/settings/identity-access-management/audit-logs' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Identity & Access Management</h1>
      <PageKPIs pageName="Identity & Access Management" />
      <Tabs tabs={tabs} />
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
};
export default IdentityAccessManagementPage;
