import React, { useState, useEffect } from 'react';
import KpiCard from './KpiCard';
import Icon from './Icon';
import { LayoutWidget, KpiDataEntry } from '../types';
import api from '../services/api';

interface PageKPIsProps {
  pageName: string;
  widget_ids?: string[];
}

type KpiDataItem = KpiDataEntry;

interface LayoutsData {
  [key: string]: {
    widget_ids: string[];
    updated_at: string;
    updated_by: string;
  }
}

const PageKPIs: React.FC<PageKPIsProps> = ({ pageName, widget_ids: explicit_widget_ids }) => {
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

  const widget_ids = explicit_widget_ids || layouts[pageName]?.widget_ids || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="flex flex-col items-center justify-center rounded-lg border border-slate-700 bg-slate-900/60 py-10 text-slate-400 space-y-3">
          <Icon name="loader-circle" className="w-6 h-6 animate-spin" />
          <p className="text-sm">正在載入頁面 KPI，請稍候...</p>
        </div>
      </div>
    );
  }

  if (widget_ids.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center text-slate-400">
        <Icon name="layout-dashboard" className="w-6 h-6 mx-auto mb-3" />
        <p className="font-semibold">尚未為此頁面設定 KPI 卡片。</p>
        <p className="text-sm text-slate-500 mt-1">請至「版面設定」頁面挑選適合的指標小工具。</p>
      </div>
    );
  }

  const getWidgetById = (id: string): LayoutWidget | undefined => widgets.find(w => w.id === id);

  const renderDescription = (descriptionText?: string): React.ReactNode => {
    if (typeof descriptionText !== 'string' || !descriptionText) {
      return descriptionText ?? null;
    }

    const localizedText = descriptionText
      .replace(/From (\d+) unique IPs/i, (_, count: string) => `來自 ${count} 個獨立 IP`)
      .replace(/Saved (\d+) hours of toil/i, (_, hours: string) => `節省 ${hours} 小時人力`)
      .replace(/↑(\d+) new users this month/i, (_, value: string) => `↑本月新增 ${value} 位使用者`)
      .replace(/(\d+) new users this month/i, (_, value: string) => `本月新增 ${value} 位使用者`)
      .replace(/active rate/i, '活躍率')
      .replace(/critical alerts?/i, '重大告警')
      .replace(/Email, Slack, Webhook/i, 'Email、Slack、Webhook');

    // The regex captures groups, which can result in `undefined` or empty strings in the parts array. Filter them out.
    const parts = localizedText.split(/(↑\d+(\.\d+)?%|↓\d+(\.\d+)?%|\d+ 嚴重)/g).filter(Boolean);

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
      {widget_ids.map(id => {
        const widget = getWidgetById(id);
        const data = kpiData[id];
        if (!widget || !data) {
          return (
            <div key={id} className="flex flex-col items-center justify-center border border-dashed border-slate-700 bg-slate-900/40 rounded-lg p-6 text-center text-slate-400 space-y-2">
              <Icon name="alert-circle" className="w-5 h-5" />
              <p className="text-sm">無法載入代號為 {id} 的 KPI 配置。</p>
              <p className="text-xs text-slate-500">請檢查是否已於管理頁設定資料來源。</p>
            </div>
          );
        }

        return (
          <KpiCard
            key={id}
            title={widget.name}
            value={data.value}
            unit={data.unit}
            description={renderDescription(data.description)}
            color={data.color}
            trend={data.trend ?? null}
            change={data.change}
          />
        );
      })}
    </div>
  );
};

export default PageKPIs;