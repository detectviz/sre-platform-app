import React from 'react';
import { Outlet } from 'react-router-dom';
import PageKPIs from '../components/PageKPIs';
import Tabs from '../components/Tabs';

const ProfilePage: React.FC = () => {
  const tabs = [
    { label: 'Personal Information', path: '/profile' },
    { label: 'Security Settings', path: '/profile/security' },
    { label: 'Preferences', path: '/profile/preferences' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Personal Settings</h1>
      <PageKPIs pageName="Personal Settings" />
      <Tabs tabs={tabs} />
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
};

export default ProfilePage;