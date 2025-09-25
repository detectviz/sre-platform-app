import React, { useState, useEffect } from 'react';
import ContextualKPICard from './ContextualKPICard';
import { LayoutWidget } from '../types';
import api from '../services/api';

interface PageKPIsProps {
  pageName: string;
}

interface KpiDataItem {
    value: string;
    description: string;
    icon: string;
    iconBgColor: string;
}

const PageKPIs: React.FC<PageKPIsProps> = ({ pageName }) => {
  const [layouts, setLayouts] = useState<Record<string, string[]>>({});
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
                api.get<Record<string, string[]>>('/settings/layouts')
            ]);
            setKpiData(kpiRes.data);
            setWidgets(widgetsRes.data);
            setLayouts(layoutsRes.data);
        } catch (error) {
            console.error("Failed to fetch page KPI data", error);
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
            console.error("Failed to parse layouts from localStorage on change", e);
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const widgetIds = layouts[pageName] || [];

  if (isLoading || widgetIds.length === 0) {
    return null; // Don't show anything if loading or no widgets configured
  }
  
  const getWidgetById = (id: string): LayoutWidget | undefined => widgets.find(w => w.id === id);

  const renderDescription = (descriptionText: string): React.ReactNode => {
      if (!descriptionText) return null;
      
      const parts = descriptionText.split(/(↑\d+(\.\d+)?%|↓\d+(\.\d+)?%|\d+ 嚴重)/g);
      
      return parts.map((part, index) => {
          if (part?.startsWith('↑')) {
              return <span key={index} className="text-green-400">{part}</span>;
          }
          if (part?.startsWith('↓')) {
              return <span key={index} className="text-red-400">{part}</span>;
          }
          if (part?.endsWith('嚴重')) {
              return <span key={index} className="text-red-400 font-semibold">{part}</span>;
          }
          return part;
      });
  };


  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6 mb-6">
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