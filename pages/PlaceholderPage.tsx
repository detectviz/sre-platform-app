import React from 'react';
import Icon from '../components/Icon';
import PageKPIs from '../components/PageKPIs';
import { PAGE_CONTENT } from '../constants/pages';

const { PLACEHOLDER_PAGE: content } = PAGE_CONTENT;

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <div className="h-full flex flex-col">
       <div className="mb-6">
         <h1 className="text-3xl font-bold">{title}</h1>
       </div>
      <PageKPIs pageName={title} />
      <div className="flex-grow flex flex-col items-center justify-center text-slate-500">
        <Icon name="construction" className="w-24 h-24 mb-4" />
        <h1 className="text-3xl font-bold text-slate-300">{title}</h1>
        <p className="mt-2">{content.UNDER_CONSTRUCTION}</p>
      </div>
    </div>
  );
};

export default PlaceholderPage;