import React, { useState, useEffect } from 'react';
import ContextualKPICard from './ContextualKPICard';
import { LayoutWidget } from '../types';
import api from '../services/api';

interface PageKPIsProps {
  pageName: string;
  widgetIds?: string[];
}

interface KpiDataItem {
    value: string;
    description: string;
    icon: string;
    iconBgColor: string;
}

interface LayoutsData {
    [key: string]: {
        widgetIds: string[];
        updatedAt: string;
        updatedBy: string;
    }
}

const PageKPIs: React.FC<PageKPIsProps> = ({ pageName, widgetIds: explicitWidgetIds }) => {
  const [layouts, setLayouts] = useState<LayoutsData>({});
  const [kpiData, setKpiData] = useState<Record<string, KpiDataItem>>({});
  const [widgets, setWidgets] = useState<LayoutWidget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const [kpiRes, widgetsRes, layoutsRes] = await Promise.all([
                api.get<Record<string, KpiDataItem>>('/kpi-data'),
                api.get<LayoutWidget[]>('/settings/widgets'),
                api.get<LayoutsData>('/settings/layouts')
            ]);
            setKpiData(kpiRes.data);
            setWidgets(widgetsRes.data);
            setLayouts(layoutsRes.data);
        } catch (error) {
            // Failed to fetch page KPI data
            // Use defaults on error
            setLayouts({});
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchAllData();

    const handleStorageChange = () => {
        // Optimistic update from localStorage if layout is changed on settings page
        const storedLayouts = localStorage.getItem('sre-platform-layouts');
         try {
            if (storedLayouts) {
                setLayouts(JSON.parse(storedLayouts));
            }
        } catch (e) {
            // Failed to parse layouts from localStorage
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const widgetIds = explicitWidgetIds || layouts[pageName]?.widgetIds || [];

  if (isLoading || widgetIds.length === 0) {
    return null; // Don't show anything if loading or no widgets configured
  }
  
  const getWidgetById = (id: string): LayoutWidget | undefined => widgets.find(w => w.id === id);

  const renderDescription = (descriptionText: string): React.ReactNode => {
      if (typeof descriptionText !== 'string' || !descriptionText) {
        return descriptionText; // Return original value if not a processable string
      }
      
      // The regex captures groups, which can result in `undefined` or empty strings in the parts array. Filter them out.
      const parts = descriptionText.split(/(↑\d+(\.\d+)?%|↓\d+(\.\d+)?%|\d+ 嚴重)/g).filter(Boolean);
      
      return parts.map((part, index) => {
          if (part.startsWith('↑')) {
              return <span key={index} className="text-green-400">{part}</span>;
          }
          if (part.startsWith('↓')) {
              return <span key={index} className="text-red-400">{part}</span>;
          }
          if (part.endsWith('嚴重')) {
              return <span key={index} className="text-red-400 font-semibold">{part}</span>;
          }
          return part;
      });
  };


  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4 mb-6">
      {widgetIds.map(id => {
        const widget = getWidgetById(id);
        const data = kpiData[id];
        if (!widget || !data) return null;
        
        return (
          <ContextualKPICard
            key={id}
            title={widget.name}
            value={data.value}
            description={renderDescription(data.description)}
            icon={data.icon}
            iconBgColor={data.iconBgColor}
          />
        );
      })}
    </div>
  );
};

export default PageKPIs;