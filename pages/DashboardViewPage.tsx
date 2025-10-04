

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import DashboardViewer from '../components/DashboardViewer';
import { Dashboard } from '../types';
import api from '../services/api';
import Icon from '../components/Icon';
import GenericBuiltInDashboardPage from './dashboards/GenericBuiltInDashboardPage';
import StatusTag from '../components/StatusTag';
import IconButton from '../components/IconButton';
import { useContentSection } from '../contexts/ContentContext';
import { formatTimestamp } from '../utils/time';

type DashboardErrorKey = 'missingId' | 'notFound' | 'loadFailed';

const FALLBACK_ERROR_MESSAGES: Record<DashboardErrorKey, string> = {
  missingId: '未提供儀表板識別碼，請回到列表重新選取。',
  notFound: '找不到對應的儀表板，可能已被移除或權限不足。',
  loadFailed: '無法載入儀表板資料，請稍後再試一次。',
};

const DashboardViewPage: React.FC = () => {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const navigate = useNavigate();
  const pageContent = useContentSection('DASHBOARD_VIEW_PAGE');
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorKey, setErrorKey] = useState<DashboardErrorKey | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!dashboardId) {
      setDashboard(null);
      setErrorKey('missingId');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorKey(null);

    try {
      const { data } = await api.get<Dashboard>(`/dashboards/${dashboardId}`);
      setDashboard(data);
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setErrorKey(status === 404 ? 'notFound' : 'loadFailed');
      setDashboard(null);
    } finally {
      setIsLoading(false);
    }
  }, [dashboardId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const relativeFormatter = useMemo(
    () => new Intl.RelativeTimeFormat('zh-TW', { numeric: 'auto' }),
    [],
  );

  const formatRelativeFromNow = useCallback(
    (value?: string | null) => {
      if (!value) {
        return '';
      }
      const target = new Date(value).getTime();
      if (Number.isNaN(target)) {
        return '';
      }
      const diffMs = target - Date.now();
      const thresholds: { limit: number; divisor: number; unit: Intl.RelativeTimeFormatUnit }[] = [
        { limit: 60_000, divisor: 1_000, unit: 'second' },
        { limit: 3_600_000, divisor: 60_000, unit: 'minute' },
        { limit: 86_400_000, divisor: 3_600_000, unit: 'hour' },
        { limit: 604_800_000, divisor: 86_400_000, unit: 'day' },
        { limit: Number.POSITIVE_INFINITY, divisor: 604_800_000, unit: 'week' },
      ];
      for (const { limit, divisor, unit } of thresholds) {
        if (Math.abs(diffMs) < limit) {
          return relativeFormatter.format(Math.round(diffMs / divisor), unit);
        }
      }
      return relativeFormatter.format(Math.round(diffMs / 2_592_000_000), 'month');
    },
    [relativeFormatter],
  );

  const handleBack = useCallback(() => {
    navigate('/dashboards');
  }, [navigate]);

  const handleRetry = useCallback(() => {
    loadDashboard();
  }, [loadDashboard]);

  const grafanaUrl = useMemo(() => {
    if (!dashboard) {
      return '';
    }
    const legacy = (dashboard as unknown as { grafanaUrl?: string | null | undefined }).grafanaUrl;
    return dashboard.grafana_url ?? legacy ?? '';
  }, [dashboard]);

  const handleOpenGrafana = useCallback(() => {
    if (!grafanaUrl) {
      return;
    }
    if (typeof window !== 'undefined') {
      window.open(grafanaUrl, '_blank', 'noopener');
    }
  }, [grafanaUrl]);

  if (isLoading && !dashboard) {
    return (
      <div className="space-y-6">
        <div className="glass-card rounded-2xl p-6">
          <div className="h-6 w-2/3 animate-pulse rounded bg-slate-700/50" />
          <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-700/40" />
          <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-700/40" />
        </div>
        <div className="glass-card rounded-2xl p-6">
          <div className="h-5 w-40 animate-pulse rounded bg-slate-700/50" />
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="h-20 animate-pulse rounded-xl bg-slate-800/40" />
            <div className="h-20 animate-pulse rounded-xl bg-slate-800/40" />
            <div className="h-20 animate-pulse rounded-xl bg-slate-800/40" />
            <div className="h-20 animate-pulse rounded-xl bg-slate-800/40" />
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    const derivedKey: DashboardErrorKey = errorKey ?? 'loadFailed';
    const errorDescription = pageContent
      ? derivedKey === 'missingId'
        ? pageContent.ERROR_NO_ID
        : derivedKey === 'notFound'
          ? pageContent.ERROR_NOT_FOUND
          : pageContent.ERROR_LOAD
      : FALLBACK_ERROR_MESSAGES[derivedKey];
    const errorTitle = pageContent?.ERROR_TITLE ?? '無法載入儀表板';

    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="glass-card w-full max-w-lg space-y-4 rounded-2xl p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-300">
            <Icon name="alert-triangle" className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">{errorTitle}</h2>
            <p className="text-sm leading-6 text-slate-300">{errorDescription}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-0"
            >
              {pageContent?.RETRY_LABEL ?? '重新嘗試'}
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-600 focus-visible:ring-offset-0"
            >
              {pageContent?.RETURN_TO_LIST ?? '返回列表'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (dashboard.type === 'built-in') {
    if (
      dashboard.path === '/sre-war-room' ||
      dashboard.path === '/dashboard/infrastructure-insights' ||
      dashboard.path === '/dashboard/resource-overview'
    ) {
      return <Navigate to={dashboard.path} replace />;
    }

    if (dashboard.layout) {
      return (
        <GenericBuiltInDashboardPage
          name={dashboard.name}
          description={dashboard.description}
          widget_ids={dashboard.layout}
        />
      );
    }

    return <Navigate to="/home" replace />;
  }

  const resourceCount = dashboard.resource_ids?.length ?? 0;
  const updatedDisplay = formatTimestamp(dashboard.updated_at, { showSeconds: false });
  const updatedRelative = formatRelativeFromNow(dashboard.updated_at);
  const emptyValue = pageContent?.EMPTY_VALUE ?? '—';
  const description = (dashboard.description ?? '').trim();

  const typeBadge = useMemo(() => {
    const mapping: Record<string, { label: string; tone: 'info' | 'neutral' | 'default'; icon: string }> = {
      'built-in': { label: pageContent?.TYPE_BUILT_IN ?? '內建儀表板', tone: 'info', icon: 'sparkles' },
      grafana: { label: pageContent?.TYPE_GRAFANA ?? 'Grafana 儀表板', tone: 'info', icon: 'area-chart' },
      custom: { label: pageContent?.TYPE_CUSTOM ?? '自訂儀表板', tone: 'neutral', icon: 'layout-dashboard' },
    };
    return mapping[dashboard.type] ?? mapping.custom;
  }, [dashboard.type, pageContent]);

  const resourceBadgeLabel = useMemo(
    () => pageContent?.RESOURCE_COUNT_BADGE?.replace('{count}', String(resourceCount)) ?? `${resourceCount} 個資源`,
    [pageContent, resourceCount],
  );

  const resourceBadgeTooltip = useMemo(
    () => pageContent?.RESOURCE_BADGE_TOOLTIP?.replace('{count}', String(resourceCount)),
    [pageContent, resourceCount],
  );

  const metadataItems = useMemo(
    () => [
      {
        key: 'owner',
        icon: 'user-round',
        label: pageContent?.OWNER_LABEL ?? '擁有者',
        value: dashboard.owner || emptyValue,
      },
      {
        key: 'category',
        icon: 'folder',
        label: pageContent?.CATEGORY_LABEL ?? '分類',
        value: dashboard.category || emptyValue,
      },
      {
        key: 'updated',
        icon: 'clock',
        label: pageContent?.UPDATED_AT_LABEL ?? '最後更新',
        value: updatedDisplay ? `${updatedDisplay}${updatedRelative ? `（${updatedRelative}）` : ''}` : emptyValue,
      },
      {
        key: 'resources',
        icon: 'layers',
        label: pageContent?.RESOURCE_COUNT_LABEL ?? '關聯資源',
        value: String(resourceCount),
      },
    ],
    [dashboard, emptyValue, pageContent, resourceCount, updatedDisplay, updatedRelative],
  );

  const backLabel = pageContent?.BACK_TO_LIST ?? '返回儀表板列表';
  const refreshLabel = pageContent?.REFRESH_LABEL ?? '重新載入資料';
  const openGrafanaLabel = pageContent?.OPEN_IN_GRAFANA ?? '於 Grafana 開啟';
  const descriptionLabel = pageContent?.DESCRIPTION_LABEL ?? '描述';

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <IconButton icon="arrow-left" label={backLabel} tooltip={backLabel} onClick={handleBack} />
              <div>
                <h1 className="text-2xl font-semibold text-white">{dashboard.name}</h1>
                {updatedDisplay && (
                  <p className="mt-1 text-sm text-slate-300">
                    {(pageContent?.LAST_UPDATED_PREFIX ?? pageContent?.UPDATED_AT_LABEL ?? '最後更新')}：
                    {updatedDisplay}
                    {updatedRelative ? `（${updatedRelative}）` : ''}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusTag label={typeBadge.label} tone={typeBadge.tone} icon={typeBadge.icon} dense />
              {dashboard.category && (
                <StatusTag label={dashboard.category} tone="neutral" icon="folder" dense />
              )}
              <StatusTag
                label={resourceBadgeLabel}
                tone="default"
                icon="layers"
                dense
                tooltip={resourceBadgeTooltip}
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{descriptionLabel}</span>
              <p className={`text-sm leading-6 ${description ? 'text-slate-200' : 'text-slate-400 italic'}`}>
                {description || pageContent?.EMPTY_DESCRIPTION || '尚未提供描述。'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start">
            <IconButton
              icon="refresh-cw"
              label={refreshLabel}
              tooltip={refreshLabel}
              onClick={handleRetry}
              disabled={isLoading}
            />
            <IconButton
              icon="external-link"
              label={openGrafanaLabel}
              tooltip={openGrafanaLabel}
              onClick={handleOpenGrafana}
              tone="primary"
              disabled={!grafanaUrl}
            />
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">{pageContent?.METADATA_TITLE ?? '儀表板資訊'}</h2>
        <dl className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
          {metadataItems.map(item => (
            <div key={item.key} className="rounded-xl border border-slate-800/60 bg-slate-900/50 p-4">
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Icon name={item.icon} className="h-3.5 w-3.5" />
                {item.label}
              </dt>
              <dd className="mt-2 text-sm text-slate-200">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <DashboardViewer dashboard={dashboard} />
    </div>
  );
};

export default DashboardViewPage;