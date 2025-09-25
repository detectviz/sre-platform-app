import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import PageKPIs from '../components/PageKPIs';
import Tabs from '../components/Tabs';
import Icon from '../components/Icon';
import PlaceholderModal from '../components/PlaceholderModal';

interface PageWithTabsLayoutProps {
  title: string;
  description: string;
  kpiPageName: string;
  tabs: { label: string; path: string; icon?: string }[];
  showRefresh?: boolean;
}

const PageWithTabsLayout: React.FC<PageWithTabsLayoutProps> = ({ title, description, kpiPageName, tabs, showRefresh = false }) => {
  const [isPlaceholderModalOpen, setIsPlaceholderModalOpen] = useState(false);
  const [modalFeatureName, setModalFeatureName] = useState('');

  const showPlaceholderModal = (featureName: string) => {
    setModalFeatureName(featureName);
    setIsPlaceholderModalOpen(true);
  };
  
  const handleRefresh = () => showPlaceholderModal(`刷新頁面: ${title}`);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-slate-400 mt-1">{description}</p>
        </div>
        {showRefresh && (
          <button onClick={handleRefresh} className="p-2 rounded-full hover:bg-slate-700/50">
            <Icon name="refresh-cw" className="w-5 h-5" />
          </button>
        )}
      </div>
      <PageKPIs pageName={kpiPageName} />
      <Tabs tabs={tabs} />
      <div className="mt-6 flex-grow flex flex-col">
        <Outlet />
      </div>
      <PlaceholderModal
        isOpen={isPlaceholderModalOpen}
        onClose={() => setIsPlaceholderModalOpen(false)}
        featureName={modalFeatureName}
      />
    </div>
  );
};

export default PageWithTabsLayout;
