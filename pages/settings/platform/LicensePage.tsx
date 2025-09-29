
import React from 'react';
import Icon from '../../../components/Icon';
import { useContent } from '../../../contexts/ContentContext';

const LicensePage: React.FC = () => {
  const { content } = useContent();
  const pageContent = content?.LICENSE_PAGE;
  
  if (!pageContent) {
    return (
        <div className="flex items-center justify-center h-full">
            <Icon name="loader-circle" className="w-8 h-8 animate-spin text-slate-500" />
        </div>
    );
  }
  
  return (
    <div className="max-w-4xl">
      <div className="glass-card rounded-xl p-8">
        <div className="flex flex-col items-center text-center">
          <Icon name="award" className="w-16 h-16 mb-4 text-amber-400" />
          <h2 className="text-2xl font-bold text-white">{pageContent.TITLE}</h2>
          <p className="mt-2 max-w-md text-slate-400">
            {pageContent.DESCRIPTION}
          </p>
          <div className="mt-8 p-6 rounded-lg bg-slate-800/50 w-full text-left">
            <h3 className="font-semibold text-slate-200">{pageContent.COMMERCIAL_FEATURES_TITLE}</h3>
            <ul className="list-disc list-inside mt-3 text-sm text-slate-400 space-y-2">
              {pageContent.FEATURES_LIST.map((feature: string, index: number) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
          <a
            href={`mailto:${pageContent.CONTACT_EMAIL}`}
            className="mt-8 inline-flex items-center text-sm text-sky-400 hover:text-sky-300 px-4 py-2 rounded-md hover:bg-sky-500/20"
          >
            <Icon name="mail" className="w-4 h-4 mr-2" />
            {pageContent.CONTACT_LINK}
          </a>
        </div>
      </div>
    </div>
  );
};

export default LicensePage;
