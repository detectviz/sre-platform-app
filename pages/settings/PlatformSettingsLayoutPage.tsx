import React from 'react';
import { Outlet } from 'react-router-dom';
import PageKPIs from '../../components/PageKPIs';
import Tabs from '../../components/Tabs';

const PlatformSettingsLayoutPage: React.FC = () => {
  const tabs = [
    { label: 'Tag Management', path: '/settings/platform-settings' },
    { label: 'Mail Settings', path: '/settings/platform-settings/mail' },
    { label: 'Authentication', path: '/settings/platform-settings/auth' },
    { label: 'Layout Settings', path: '/settings/platform-settings/layout' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Platform Settings</h1>
      <PageKPIs pageName="Platform Settings" />
      <Tabs tabs={tabs} />
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
};
export default PlatformSettingsLayoutPage;
