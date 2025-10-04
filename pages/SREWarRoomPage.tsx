

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EChartsReact from '../components/EChartsReact';
import Icon from '../components/Icon';
import IconButton from '../components/IconButton';
import api from '../services/api';
import PageKPIs from '../components/PageKPIs';
import { ServiceHealthData, ResourceGroupStatusData, ResourceGroupStatusKey } from '../types';
import { useContent } from '../contexts/ContentContext';
import { useChartTheme } from '../contexts/ChartThemeContext';
import StatusTag from '../components/StatusTag';
import { formatTimestamp } from '../utils/time';

interface BriefingData {
    stability_summary: string;
    key_anomaly: {
        description: string;
        resource_name: string;
        resource_path: string;
    };
    recommendation: {
        action_text: string;
        button_text: string;
        button_link: string;
    };
}

const SERVICE_HEALTH_RANGES = [
    { value: '1h', label: '近 1 小時' },
    { value: '6h', label: '近 6 小時' },
    { value: '24h', label: '近 24 小時' },
] as const;

type ServiceHealthRange = typeof SERVICE_HEALTH_RANGES[number]['value'];

const RESOURCE_GROUP_RANGES = [
    { value: '1d', label: '今日' },
    { value: '7d', label: '近 7 天' },
    { value: '30d', label: '近 30 天' },
] as const;

type ResourceGroupRange = typeof RESOURCE_GROUP_RANGES[number]['value'];

const STATUS_LABEL_MAP: Record<ResourceGroupStatusKey, string> = {
    healthy: '健康',
    warning: '警告',
    critical: '嚴重',
};

const STATUS_TONE_MAP: Record<ResourceGroupStatusKey, 'success' | 'warning' | 'danger'> = {
    healthy: 'success',
    warning: 'warning',
    critical: 'danger',
};


const SREWarRoomPage: React.FC = () => {
    const { content } = useContent();
    const pageContent = content?.SRE_WAR_ROOM;
    const globalContent = content?.GLOBAL;

    const [aiBriefing, setAiBriefing] = useState<BriefingData | null>(null);
    const [isBriefingLoading, setIsBriefingLoading] = useState(true);
    const [serviceHealthData, setServiceHealthData] = useState<ServiceHealthData | null>(null);
    const [resourceGroupData, setResourceGroupData] = useState<ResourceGroupStatusData | null>(null);
    const [serviceHealthRange, setServiceHealthRange] = useState<ServiceHealthRange>('1h');
    const [resourceGroupRange, setResourceGroupRange] = useState<ResourceGroupRange>('7d');
    const [isServiceHealthLoading, setIsServiceHealthLoading] = useState(true);
    const [isResourceGroupLoading, setIsResourceGroupLoading] = useState(true);
    const [serviceHealthError, setServiceHealthError] = useState<string | null>(null);
    const [resourceGroupError, setResourceGroupError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { theme: chartTheme } = useChartTheme();

    const formatRelativeFromNow = useCallback((value?: string | null) => {
        if (!value) {
            return '';
        }
        const timestamp = new Date(value).getTime();
        if (Number.isNaN(timestamp)) {
            return '';
        }
        const diffMs = Date.now() - timestamp;
        if (diffMs < 60_000) {
            return '剛剛';
        }
        const diffMinutes = Math.floor(diffMs / 60_000);
        if (diffMinutes < 60) {
            return `${diffMinutes} 分鐘前`;
        }
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) {
            return `${diffHours} 小時前`;
        }
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} 天前`;
    }, []);

    const serviceHealthErrorMessage = pageContent?.SERVICE_HEALTH_ERROR ?? '無法載入服務健康度資料。';
    const resourceGroupErrorMessage = pageContent?.RESOURCE_GROUP_ERROR ?? '無法載入資源群組狀態資料。';
    const refreshDataLabel = pageContent?.REFRESH_TOOLTIP ?? '重新整理資料';
    const refreshBriefingLabel = pageContent?.REFRESH_BRIEFING_TOOLTIP ?? '重新生成簡報';

    const fetchBriefing = useCallback(async () => {
        setIsBriefingLoading(true);
        try {
            const { data } = await api.get<BriefingData>('/ai/briefing');
            setAiBriefing(data);
        } catch (error) {
            // Fetch briefing error
            setAiBriefing(null);
        } finally {
            setIsBriefingLoading(false);
        }
    }, []);
    
    const fetchServiceHealth = useCallback(async () => {
        setIsServiceHealthLoading(true);
        setServiceHealthError(null);
        try {
            const { data } = await api.get<ServiceHealthData>('/dashboards/sre-war-room/service-health', {
                params: { time_range: serviceHealthRange },
            });
            setServiceHealthData(data);
        } catch (error) {
            console.error(error);
            setServiceHealthError(serviceHealthErrorMessage);
        } finally {
            setIsServiceHealthLoading(false);
        }
    }, [serviceHealthRange, serviceHealthErrorMessage]);

    const fetchResourceGroupStatus = useCallback(async () => {
        setIsResourceGroupLoading(true);
        setResourceGroupError(null);
        try {
            const { data } = await api.get<ResourceGroupStatusData>('/dashboards/sre-war-room/resource-group-status', {
                params: { period: resourceGroupRange },
            });
            setResourceGroupData(data);
        } catch (error) {
            console.error(error);
            setResourceGroupError(resourceGroupErrorMessage);
        } finally {
            setIsResourceGroupLoading(false);
        }
    }, [resourceGroupRange, resourceGroupErrorMessage]);

    useEffect(() => {
        fetchBriefing();
    }, [fetchBriefing]);

    useEffect(() => {
        fetchServiceHealth();
    }, [fetchServiceHealth]);

    useEffect(() => {
        fetchResourceGroupStatus();
    }, [fetchResourceGroupStatus]);


    const handleRefreshBriefing = useCallback(async () => {
        setIsBriefingLoading(true);
        try {
            const { data } = await api.post<BriefingData>('/ai/briefing/generate');
            setAiBriefing(data);
        } catch (error) {
            // AI briefing generation error
            setAiBriefing(null);
        } finally {
            setIsBriefingLoading(false);
        }
    }, []);

    const handleServiceHealthClick = (params: any) => {
        if (params.componentType === 'series' && serviceHealthData?.y_axis_labels) {
            const serviceName = serviceHealthData.y_axis_labels[params.data[1]];
            if (serviceName) {
                navigate('/resources', { state: { initialFilters: { type: serviceName } } });
            }
        }
    };
    
    const handleResourceGroupClick = (params: any) => {
        if (params.componentType === 'series' && params.name) {
            const groupName = params.name;
            navigate('/resources/groups', { state: { initialSearchTerm: groupName } });
        }
    };

    const serviceHealthOption = useMemo(() => ({
        tooltip: { trigger: 'item' },
        xAxis: { type: 'category', data: serviceHealthData?.x_axis_labels || [], axisLine: { lineStyle: { color: chartTheme.grid.axis } } },
        yAxis: { type: 'category', data: serviceHealthData?.y_axis_labels || [], axisLine: { lineStyle: { color: chartTheme.grid.axis } } },
        visualMap: {
            min: 0, max: 100, calculable: true, orient: 'horizontal', left: 'center', bottom: '2%',
            inRange: { color: [chartTheme.heatmap.critical, chartTheme.heatmap.warning, chartTheme.heatmap.healthy] },
            textStyle: { color: chartTheme.text.primary }
        },
        series: [{
            name: '服務健康度',
            type: 'heatmap',
            data: serviceHealthData?.heatmap_data || [],
            label: { show: true },
            emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
        }]
    }), [chartTheme, serviceHealthData]);

    const resourceGroupOption = useMemo(() => {
        if (!resourceGroupData) {
            return {
                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                legend: { data: [], textStyle: { color: chartTheme.text.primary } },
                grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                xAxis: { type: 'value', axisLine: { lineStyle: { color: chartTheme.grid.axis } } },
                yAxis: { type: 'category', data: [], axisLine: { lineStyle: { color: chartTheme.grid.axis } } },
                series: [],
            };
        }
        const colorMap: Record<ResourceGroupStatusKey, string> = {
            healthy: chartTheme.heatmap.healthy,
            warning: chartTheme.heatmap.warning,
            critical: chartTheme.heatmap.critical,
        };
        return {
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            legend: { data: resourceGroupData.series.map(s => s.label), textStyle: { color: chartTheme.text.primary } },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { type: 'value', axisLine: { lineStyle: { color: chartTheme.grid.axis } } },
            yAxis: { type: 'category', data: resourceGroupData.group_names || [], axisLine: { lineStyle: { color: chartTheme.grid.axis } } },
            series: resourceGroupData.series.map(s => ({
                name: s.label,
                type: 'bar',
                stack: 'total',
                data: s.data,
                label: { show: true },
                emphasis: { focus: 'series' },
                color: colorMap[s.key],
            })),
        };
    }, [chartTheme, resourceGroupData]);

    const serviceMetadata = serviceHealthData?.metadata;
    const serviceCoverage = serviceMetadata?.coverage ?? serviceHealthData?.y_axis_labels?.length ?? 0;
    const serviceCoverageLabel = serviceCoverage > 0
        ? (pageContent?.SERVICE_HEALTH_MONITORED_LABEL
            ? pageContent.SERVICE_HEALTH_MONITORED_LABEL.replace('{count}', String(serviceCoverage))
            : `監控服務 ${serviceCoverage} 項`)
        : '';
    const serviceSamplingWindow = serviceMetadata?.sampling_window;
    const serviceTimezone = serviceMetadata?.timezone;
    const serviceSummary = serviceMetadata?.summary;
    const serviceSummaryTone = (serviceMetadata?.status_tone ?? 'info') as 'info' | 'success' | 'warning' | 'danger' | 'neutral';
    const serviceUpdatedAbsolute = serviceMetadata?.refreshed_at
        ? formatTimestamp(serviceMetadata.refreshed_at, { showSeconds: false })
        : '';
    const serviceUpdatedRelative = formatRelativeFromNow(serviceMetadata?.refreshed_at);
    const serviceStatusCounts = serviceMetadata?.status_counts;
    const isServiceHealthEmpty = !isServiceHealthLoading && !serviceHealthError && (!serviceHealthData?.heatmap_data || serviceHealthData.heatmap_data.length === 0);

    const resourceMetadata = resourceGroupData?.metadata;
    const resourceGroupsTotal = resourceMetadata?.groups_total ?? resourceGroupData?.group_names?.length ?? 0;
    const resourceGroupsLabel = resourceGroupsTotal > 0
        ? (pageContent?.RESOURCE_GROUP_MONITORED_LABEL
            ? pageContent.RESOURCE_GROUP_MONITORED_LABEL.replace('{count}', String(resourceGroupsTotal))
            : `群組 ${resourceGroupsTotal} 個`)
        : '';
    const resourceSummary = resourceMetadata?.summary;
    const resourceSummaryTone = (resourceMetadata?.status_tone ?? 'info') as 'info' | 'success' | 'warning' | 'danger' | 'neutral';
    const resourceUpdatedAbsolute = resourceMetadata?.refreshed_at
        ? formatTimestamp(resourceMetadata.refreshed_at, { showSeconds: false })
        : '';
    const resourceUpdatedRelative = formatRelativeFromNow(resourceMetadata?.refreshed_at);
    const resourceTimezone = resourceMetadata?.timezone;
    const resourceStatusCounts = resourceMetadata?.status_counts;
    const resourceGroupLabelMap = useMemo(() => {
        const map: Record<ResourceGroupStatusKey, string> = { ...STATUS_LABEL_MAP };
        resourceGroupData?.series?.forEach(series => {
            map[series.key] = series.label;
        });
        return map;
    }, [resourceGroupData]);
    const isResourceGroupEmpty = !isResourceGroupLoading && !resourceGroupError && (!resourceGroupData?.series?.length || resourceGroupData.series.every(series => series.data.every(value => value === 0)));

    const serviceHealthEvents = { 'click': handleServiceHealthClick };
    const resourceGroupEvents = { 'click': handleResourceGroupClick };

    if (!pageContent) return <div className="flex items-center justify-center h-full"><Icon name="loader-circle" className="w-8 h-8 animate-spin" /></div>;

    const extractHighlight = (text: string | undefined) => {
        if (!text) return null;
        const percentMatch = text.match(/[-+]?\d+(\.\d+)?%/);
        if (percentMatch) return percentMatch[0];
        const severityMatch = text.match(/\d+\s*嚴重/);
        if (severityMatch) return severityMatch[0];
        return null;
    };

  return (
    <div className="space-y-6">
      <PageKPIs pageName="SREWarRoom" />

      <div className="glass-card rounded-xl p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-white">
                <Icon name="brain-circuit" className="h-6 w-6 text-purple-400" />
                <h2 className="text-xl font-bold">{pageContent.AI_BRIEFING_TITLE}</h2>
            </div>
            <IconButton
                icon={isBriefingLoading ? 'loader-2' : 'refresh-cw'}
                label={refreshBriefingLabel}
                tooltip={refreshBriefingLabel}
                onClick={handleRefreshBriefing}
                disabled={isBriefingLoading}
            />
        </div>
        {isBriefingLoading ? (
            <div className="space-y-2 animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-700 rounded w-2/3"></div>
            </div>
        ) : aiBriefing ? (
             <div className="space-y-5 text-slate-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-emerald-500/20 bg-slate-900/40 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white flex items-center"><Icon name="shield-check" className="w-5 h-5 mr-2 text-emerald-400"/> {pageContent.STABILITY_SUMMARY}</h3>
                            {extractHighlight(aiBriefing.stability_summary) && (
                                <StatusTag label={extractHighlight(aiBriefing.stability_summary)!} tone="success" dense />
                            )}
                        </div>
                        <p className="text-sm leading-relaxed">{aiBriefing.stability_summary}</p>
                    </div>
                    <div className="rounded-xl border border-orange-500/30 bg-slate-900/40 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white flex items-center"><Icon name="siren" className="w-5 h-5 mr-2 text-orange-400"/> {pageContent.KEY_ANOMALY}</h3>
                            {extractHighlight(aiBriefing.key_anomaly.description) && (
                                <StatusTag label={extractHighlight(aiBriefing.key_anomaly.description)!} tone="danger" dense />
                            )}
                        </div>
                        <p className="text-sm leading-relaxed">
                            {aiBriefing.key_anomaly.description}
                            <span className="ml-1">
                                <Link to={aiBriefing.key_anomaly.resource_path} className="text-sky-400 hover:underline font-semibold">
                                    {aiBriefing.key_anomaly.resource_name}
                                </Link>
                            </span>
                        </p>
                    </div>
                    <div className="rounded-xl border border-yellow-400/30 bg-slate-900/40 p-4 flex flex-col justify-between gap-3">
                        <div>
                            <h3 className="font-semibold text-white flex items-center mb-3"><Icon name="wrench" className="w-5 h-5 mr-2 text-yellow-300"/> {pageContent.RECOMMENDED_ACTION}</h3>
                            <p className="text-sm leading-relaxed">{aiBriefing.recommendation.action_text}</p>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-yellow-500/20">
                            <StatusTag label="建議" tone="warning" dense />
                            <Link to={aiBriefing.recommendation.button_link}>
                                <button className="flex items-center text-sm text-white bg-sky-600 hover:bg-sky-700 px-3 py-1.5 rounded-md shadow-sm">
                                    <Icon name="arrow-right" className="w-4 h-4 mr-2"/>
                                    {aiBriefing.recommendation.button_text}
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <p className="text-red-400">{pageContent.GENERATE_BRIEFING_ERROR}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="glass-card rounded-xl p-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-bold text-white">{pageContent.SERVICE_HEALTH_TITLE}</h2>
                          {serviceSummary && (
                              <StatusTag label={pageContent.SUMMARY_LABEL ?? '摘要'} tone={serviceSummaryTone} dense />
                          )}
                      </div>
                      <p className="text-sm text-slate-400">{pageContent.SERVICE_HEALTH_DESCRIPTION}</p>
                      {serviceSummary && (
                          <p className="text-xs text-slate-400">{serviceSummary}</p>
                      )}
                      {(serviceUpdatedAbsolute || serviceUpdatedRelative || serviceTimezone) && (
                          <p className="text-xs text-slate-500">
                              {(pageContent.LAST_UPDATED_LABEL ?? '資料更新')}：{serviceUpdatedAbsolute}
                              {serviceUpdatedRelative ? `（${serviceUpdatedRelative}）` : ''}
                              {serviceTimezone ? ` · ${(pageContent.TIMEZONE_LABEL ?? '時區')} ${serviceTimezone}` : ''}
                          </p>
                      )}
                  </div>
                  <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/40 p-1 text-xs font-medium">
                          {SERVICE_HEALTH_RANGES.map(option => {
                              const isActive = serviceHealthRange === option.value;
                              return (
                                  <button
                                      key={option.value}
                                      type="button"
                                      onClick={() => setServiceHealthRange(option.value)}
                                      className={`rounded-md px-3 py-1.5 transition-colors ${isActive ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-700/40'}`}
                                      aria-pressed={isActive}
                                  >
                                      {option.label}
                                  </button>
                              );
                          })}
                      </div>
                      <IconButton
                          icon={isServiceHealthLoading ? 'loader-2' : 'refresh-cw'}
                          label={refreshDataLabel}
                          tooltip={refreshDataLabel}
                          onClick={fetchServiceHealth}
                          disabled={isServiceHealthLoading}
                      />
                  </div>
              </div>
              <div className="flex flex-wrap gap-2">
                  {serviceCoverageLabel && <StatusTag label={serviceCoverageLabel} tone="info" dense />}
                  {serviceSamplingWindow && <StatusTag label={`取樣 ${serviceSamplingWindow}`} tone="neutral" dense />}
                  {serviceStatusCounts && (Object.entries(serviceStatusCounts) as [ResourceGroupStatusKey, number][]).map(([key, count]) => (
                      <StatusTag key={key} label={`${STATUS_LABEL_MAP[key]} ${count}`} tone={STATUS_TONE_MAP[key]} dense />
                  ))}
              </div>
              <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-4">
                  {isServiceHealthLoading ? (
                      <div className="h-[300px] animate-pulse rounded-lg bg-slate-800/40" />
                  ) : serviceHealthError ? (
                      <div className="flex h-[300px] flex-col items-center justify-center text-center text-rose-200">
                          <Icon name="alert-circle" className="mb-3 h-8 w-8" />
                          <p className="font-semibold">{serviceHealthError}</p>
                          <button
                              type="button"
                              onClick={fetchServiceHealth}
                              className="mt-4 rounded-md bg-sky-600 px-3 py-1.5 text-sm text-white hover:bg-sky-500"
                          >
                              {globalContent?.RETRY ?? '重試'}
                          </button>
                      </div>
                  ) : isServiceHealthEmpty ? (
                      <div className="flex h-[300px] flex-col items-center justify-center text-center text-slate-400">
                          <Icon name="database-off" className="mb-3 h-8 w-8 text-slate-500" />
                          <p className="text-sm font-semibold text-slate-200">{pageContent.SERVICE_HEALTH_EMPTY_TITLE ?? '尚無健康度資料'}</p>
                          <p className="mt-1 text-xs text-slate-400">{pageContent.SERVICE_HEALTH_EMPTY_DESCRIPTION ?? '稍後再試或調整觀測範圍。'}</p>
                      </div>
                  ) : (
                      <EChartsReact option={serviceHealthOption} style={{ height: '300px' }} onEvents={serviceHealthEvents} />
                  )}
              </div>
          </div>
          <div className="glass-card rounded-xl p-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-bold text-white">{pageContent.RESOURCE_GROUP_STATUS_TITLE}</h2>
                          {resourceSummary && (
                              <StatusTag label={pageContent.SUMMARY_LABEL ?? '摘要'} tone={resourceSummaryTone} dense />
                          )}
                      </div>
                      <p className="text-sm text-slate-400">{pageContent.RESOURCE_GROUP_DESCRIPTION}</p>
                      {resourceSummary && (
                          <p className="text-xs text-slate-400">{resourceSummary}</p>
                      )}
                      {(resourceUpdatedAbsolute || resourceUpdatedRelative || resourceTimezone) && (
                          <p className="text-xs text-slate-500">
                              {(pageContent.LAST_UPDATED_LABEL ?? '資料更新')}：{resourceUpdatedAbsolute}
                              {resourceUpdatedRelative ? `（${resourceUpdatedRelative}）` : ''}
                              {resourceTimezone ? ` · ${(pageContent.TIMEZONE_LABEL ?? '時區')} ${resourceTimezone}` : ''}
                          </p>
                      )}
                  </div>
                  <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/40 p-1 text-xs font-medium">
                          {RESOURCE_GROUP_RANGES.map(option => {
                              const isActive = resourceGroupRange === option.value;
                              return (
                                  <button
                                      key={option.value}
                                      type="button"
                                      onClick={() => setResourceGroupRange(option.value)}
                                      className={`rounded-md px-3 py-1.5 transition-colors ${isActive ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-700/40'}`}
                                      aria-pressed={isActive}
                                  >
                                      {option.label}
                                  </button>
                              );
                          })}
                      </div>
                      <IconButton
                          icon={isResourceGroupLoading ? 'loader-2' : 'refresh-cw'}
                          label={refreshDataLabel}
                          tooltip={refreshDataLabel}
                          onClick={fetchResourceGroupStatus}
                          disabled={isResourceGroupLoading}
                      />
                  </div>
              </div>
              <div className="flex flex-wrap gap-2">
                  {resourceGroupsLabel && <StatusTag label={resourceGroupsLabel} tone="info" dense />}
                  {resourceStatusCounts && (Object.entries(resourceStatusCounts) as [ResourceGroupStatusKey, number][]).map(([key, count]) => (
                      <StatusTag key={key} label={`${resourceGroupLabelMap[key]} ${count}`} tone={STATUS_TONE_MAP[key]} dense />
                  ))}
              </div>
              <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-4">
                  {isResourceGroupLoading ? (
                      <div className="h-[300px] animate-pulse rounded-lg bg-slate-800/40" />
                  ) : resourceGroupError ? (
                      <div className="flex h-[300px] flex-col items-center justify-center text-center text-rose-200">
                          <Icon name="alert-triangle" className="mb-3 h-8 w-8" />
                          <p className="font-semibold">{resourceGroupError}</p>
                          <button
                              type="button"
                              onClick={fetchResourceGroupStatus}
                              className="mt-4 rounded-md bg-sky-600 px-3 py-1.5 text-sm text-white hover:bg-sky-500"
                          >
                              {globalContent?.RETRY ?? '重試'}
                          </button>
                      </div>
                  ) : isResourceGroupEmpty ? (
                      <div className="flex h-[300px] flex-col items-center justify-center text-center text-slate-400">
                          <Icon name="package-search" className="mb-3 h-8 w-8 text-slate-500" />
                          <p className="text-sm font-semibold text-slate-200">{pageContent.RESOURCE_GROUP_EMPTY_TITLE ?? '尚無群組狀態資料'}</p>
                          <p className="mt-1 text-xs text-slate-400">{pageContent.RESOURCE_GROUP_EMPTY_DESCRIPTION ?? '暫無資源群組統計，請稍後再試。'}</p>
                      </div>
                  ) : (
                      <EChartsReact option={resourceGroupOption} style={{ height: '300px' }} onEvents={resourceGroupEvents} />
                  )}
              </div>
          </div>
      </div>

    </div>
  );
};

export default SREWarRoomPage;