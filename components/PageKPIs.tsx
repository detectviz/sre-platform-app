import React, { useState, useEffect } from 'react';
import ContextualKPICard from './ContextualKPICard';
import { LAYOUT_WIDGETS, DEFAULT_LAYOUTS, KPI_DATA } from '../constants';
import { LayoutWidget } from '../types';

interface PageKPIsProps {
  pageName: string;
}

const PageKPIs: React.FC<PageKPIsProps> = ({ pageName }) => {
  const [layouts, setLayouts] = useState<Record<string, string[]>>({});

  useEffect(() => {
    // This effect ensures the component re-renders if the layout is changed on the settings page.
    const handleStorageChange = () => {
        const storedLayouts = localStorage.getItem('sre-platform-layouts');
         try {
            if (storedLayouts) {
                setLayouts(JSON.parse(storedLayouts));
            } else {
                setLayouts(DEFAULT_LAYOUTS);
            }
        } catch (e) {
            console.error("Failed to parse layouts from localStorage on change", e);
            setLayouts(DEFAULT_LAYOUTS);
        }
    };
    
    handleStorageChange(); // Initial load

    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const widgetIds = layouts[pageName] || [];

  if (widgetIds.length === 0) {
    return null;
  }
  
  const getWidgetById = (id: string): LayoutWidget | undefined => LAYOUT_WIDGETS.find(w => w.id === id);

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 mb-6">
      {widgetIds.map(id => {
        const widget = getWidgetById(id);
        const kpiData = KPI_DATA[id];
        if (!widget || !kpiData) return null;
        
        return (
          <ContextualKPICard
            key={id}
            title={widget.name}
            value={kpiData.value}
            description={kpiData.description}
            icon={kpiData.icon}
            iconBgColor={kpiData.iconBgColor}
          />
        );
      })}
    </div>
  );
};

export default PageKPIs;