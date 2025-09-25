import React from 'react';
import { Outlet } from 'react-router-dom';
import PageKPIs from '../../components/PageKPIs';
import Tabs from '../../components/Tabs';

const NotificationManagementPage: React.FC = () => {
  const tabs = [
    { label: 'Notification Policies', path: '/settings/notification-management' },
    { label: 'Notification Channels', path: '/settings/notification-management/channels' },
    { label: 'Notification History', path: '/settings/notification-management/history' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Notification Management</h1>
      <PageKPIs pageName="Notification Management" />
      <Tabs tabs={tabs} />
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
};
export default NotificationManagementPage;
