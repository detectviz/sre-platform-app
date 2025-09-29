import React from 'react';
import Icon from '../components/Icon';
import PageKPIs from '../components/PageKPIs';
import { useContent } from '../contexts/ContentContext';

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  const { content } = useContent();
  const pageContent = content?.PLACEHOLDER_PAGE;
  
  return (
    <div className="h-full flex flex-col">
       <div className="mb-6">
         <h1 className="text-3xl font-bold">{title}</h1>
       </div>
      <PageKPIs pageName={title} />
      <div className="flex-grow flex flex-col items-center justify-center text-slate-500">
        <Icon name="construction" className="w-24 h-24 mb-4" />
        <h1 className="text-3xl font-bold text-slate-300">{title}</h1>
        <p className="mt-2">{pageContent?.UNDER_CONSTRUCTION || 'This page is under construction.'}</p>
      </div>
    </div>
  );
};

export default PlaceholderPage;