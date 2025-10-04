import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { Link, useNavigate } from 'react-router-dom';
import { Resource, Incident, MetricsData, IncidentSeverity } from '../../types';
import Icon from '../../components/Icon';
import EChartsReact from '../../components/EChartsReact';
import api from '../../services/api';
import { useChartTheme } from '../../contexts/ChartThemeContext';
import StatusTag from '../../components/StatusTag';
import IconButton from '../../components/IconButton';
import { useOptions } from '../../contexts/OptionsContext';
import { formatTimestamp, formatRelativeTime } from '../../utils/time';
import { resolveResourceStatusPresentation } from '../../utils/resource';

interface ResourceDetailPageProps {
  resource_id: string;
}

const InfoItem = ({
  label,
  value,
  helper,
}: {
  label: string;
  value: React.ReactNode;
  helper?: React.ReactNode;
}) => (
  <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3 shadow-inner shadow-slate-950/20">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
    <div className="mt-1 text-sm font-semibold leading-snug text-white">{value}</div>
    {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
  </div>
);

const INCIDENT_STATUS_META: Record<Incident['status'], { label: string; tone: 'danger' | 'info' | 'success' | 'warning' | 'neutral'; icon: string }> = {
  new: { label: '待處理', tone: 'danger', icon: 'alert-triangle' },
  acknowledged: { label: '已確認', tone: 'warning', icon: 'clock' },
  resolved: { label: '已解決', tone: 'success', icon: 'check-circle' },
  silenced: { label: '已靜音', tone: 'neutral', icon: 'bell-off' },
};

const INCIDENT_SEVERITY_META: Record<IncidentSeverity, { label: string; tone: 'danger' | 'warning' | 'info' }> = {
  critical: { label: '嚴重', tone: 'danger' },
  warning: { label: '警告', tone: 'warning' },
  info: { label: '提示', tone: 'info' },
};

const ResourceDetailPage: React.FC<ResourceDetailPageProps> = ({ resource_id }) => {
  const [resource, setResource] = useState<Resource | null>(null);
  const [relatedIncidents, setRelatedIncidents] = useState<Incident[]>([]);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { theme: chartTheme } = useChartTheme();
  const { options } = useOptions();
  const navigate = useNavigate();

  const resourceOptions = options?.resources;

  const statusDescriptors = useMemo(() => resourceOptions?.statuses ?? [], [resourceOptions?.statuses]);
  const statusColorDescriptors = useMemo(() => resourceOptions?.status_colors ?? [], [resourceOptions?.status_colors]);
  const typeDescriptors = useMemo(() => resourceOptions?.types ?? [], [resourceOptions?.types]);

  const relativeFormatter = useMemo(() => new Intl.RelativeTimeFormat('zh-TW', { numeric: 'auto' }), []);

  const formatRelativeFromNow = useCallback((value?: string | null) => {
    if (!value) {
      return '—';
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    const diffMs = parsed.getTime() - Date.now();
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
  }, [relativeFormatter]);

  const fetchResourceDetails = useCallback(async () => {
    if (!resource_id) return;
    setIsLoading(true);
    setError(null);
    try {
      const resourceData = (await api.get<Resource>(`/resources/${resource_id}`)).data;

      const [incidentsRes, metricsRes] = await Promise.all([
        api.get<{ items: Incident[] }>('/incidents', { params: { resource_id: resourceData.id, page_size: 3 } }),
        api.get<MetricsData>(`/resources/${resource_id}/metrics`),
      ]);

      setResource(resourceData);
      setRelatedIncidents(incidentsRes.data.items);
      setMetrics(metricsRes.data);
    } catch (err) {
      setError(`無法獲取資源 ${resource_id} 的詳細資訊。`);
    } finally {
      setIsLoading(false);
    }
  }, [resource_id]);

  useEffect(() => {
    fetchResourceDetails();
  }, [fetchResourceDetails]);

  const toRgba = useCallback((hex: string, alpha: number) => {
    const sanitized = hex.replace('#', '');
    if (sanitized.length !== 6) return hex;
    const r = parseInt(sanitized.slice(0, 2), 16);
    const g = parseInt(sanitized.slice(2, 4), 16);
    const b = parseInt(sanitized.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }, []);

  const getMetricOption = useCallback((title: string, data: [string, number][] | undefined, color: string) => ({
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: number | string) => `${value}%`,
      borderColor: '#1e293b',
      backgroundColor: '#0f172a',
      textStyle: { color: '#e2e8f0' },
    },
    xAxis: {
      type: 'time',
      splitLine: { show: false },
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#334155' } },
      axisTick: { lineStyle: { color: '#475569' } },
      axisLabel: {
        color: '#cbd5f5',
        fontSize: 11,
        hideOverlap: true,
        formatter: (value: number | string) => dayjs(value).format('HH:mm'),
        margin: 12,
      },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#1e293b' } },
      axisLabel: { formatter: '{value}%', color: '#cbd5f5', fontSize: 11 },
    },
    series: [{
      name: title,
      type: 'line',
      smooth: true,
      showSymbol: false,
      data: data || [],
      lineStyle: { color, width: 2 },
      areaStyle: {
        color: typeof window !== 'undefined' && (window as any).echarts
          ? new (window as any).echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: toRgba(color, 0.28) },
            { offset: 1, color: toRgba(color, 0) },
          ])
          : toRgba(color, 0.18),
      },
    }],
    grid: { left: 48, right: 18, top: 26, bottom: 28, containLabel: true },
  }), [toRgba]);

  const cpuOption = useMemo(
    () => getMetricOption('CPU 使用率', metrics?.cpu, chartTheme.capacity_planning?.cpu || '#38bdf8'),
    [chartTheme.capacity_planning?.cpu, getMetricOption, metrics?.cpu],
  );

  const memoryOption = useMemo(
    () => getMetricOption('記憶體使用率', metrics?.memory, chartTheme.capacity_planning?.memory || '#a78bfa'),
    [chartTheme.capacity_planning?.memory, getMetricOption, metrics?.memory],
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Icon name="loader-circle" className="h-8 w-8 animate-spin text-slate-300" />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="space-y-3 rounded-2xl border border-rose-500/30 bg-rose-950/30 p-6 text-center text-rose-200">
        <Icon name="alert-circle" className="mx-auto h-12 w-12" />
        <h2 className="text-xl font-semibold">資源載入失敗</h2>
        <p className="text-sm text-rose-100/80">{error || `找不到 ID 為 "${resource_id}" 的資源。`}</p>
      </div>
    );
  }

  const statusDescriptor = statusDescriptors.find(item => item.value === resource.status);
  const statusColorDescriptor = statusColorDescriptors.find(item => item.value === resource.status);
  const statusPresentation = resolveResourceStatusPresentation(resource.status, statusDescriptor, statusColorDescriptor);

  const typeDescriptor = typeDescriptors.find(item => item.value === resource.type);
  const typeBadgeClass = typeDescriptor?.class_name ?? 'bg-slate-900/60 border border-slate-700 text-slate-200';

  const lastCheckInDisplay = resource.last_check_in_at
    ? `${formatTimestamp(resource.last_check_in_at, { showSeconds: false })}（${formatRelativeFromNow(resource.last_check_in_at)}）`
    : '—';

  const updatedDisplay = `${formatTimestamp(resource.updated_at, { showSeconds: false })}（${formatRelativeFromNow(resource.updated_at)}）`;

  const createdDisplay = `${formatTimestamp(resource.created_at, { showSeconds: false })}（${formatRelativeFromNow(resource.created_at)}）`;

  const renderTag = (key: string, value: string) => (
    <span
      key={`${key}-${value}`}
      className="inline-flex items-center gap-1 rounded-full border border-slate-700/70 bg-slate-900/60 px-2.5 py-1 text-[11px] font-medium text-slate-200"
    >
      <span className="text-slate-400">{key}</span>
      <Icon name="minus" className="h-3 w-3 text-slate-600" />
      <span>{value}</span>
    </span>
  );

  return (
    <div className="grid gap-4 xl:auto-rows-min xl:grid-cols-12">
      <section className="xl:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/30">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold text-white">{resource.name}</h2>
            <StatusTag
              tone={statusPresentation.tone}
              icon={statusPresentation.icon}
              tooltip={statusPresentation.tooltip}
              className={statusPresentation.className}
              label={(
                <span className="flex items-center gap-1.5">
                  {statusPresentation.dotColor ? (
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: statusPresentation.dotColor }}
                    />
                  ) : null}
                  <span>{statusPresentation.label}</span>
                </span>
              )}
            />
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${typeBadgeClass}`}>
              {typeDescriptor?.label ?? resource.type}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-800/70 bg-slate-950/45 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">資源 ID</p>
              <p className="mt-1 text-sm font-semibold leading-snug text-white break-all">{resource.id}</p>
            </div>
            <div className="rounded-xl border border-slate-800/70 bg-slate-950/45 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">最近檢查</p>
              <p className="mt-1 text-sm font-semibold leading-snug text-white">{lastCheckInDisplay}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <IconButton
              icon="refresh-cw"
              label="重新整理資源資料"
              tooltip="重新整理資源資料"
              onClick={fetchResourceDetails}
              isLoading={isLoading}
            />
            <IconButton
              icon="external-link"
              label="在資源列表開啟"
              tone="primary"
              onClick={() => navigate(`/resources/list/${resource.id}`)}
              tooltip="在資源列表開啟"
            />
          </div>
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">標籤</p>
            {resource.tags && resource.tags.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                {resource.tags.map(tag => renderTag(tag.key, tag.value))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">尚未設定任何標籤，可在編輯資源時補充環境或負責人資訊。</p>
            )}
          </div>
        </div>
      </section>

      <section className="xl:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/30">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">關鍵屬性</h3>
            <p className="text-xs text-slate-500">部署資訊與維運責任分工。</p>
          </div>
        </div>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <InfoItem label="提供商" value={resource.provider} helper="資料來源供應商" />
          <InfoItem label="部署區域" value={resource.region} helper="依照雲端或機房區域分類" />
          <InfoItem label="擁有者" value={resource.owner} helper="主要負責團隊" />
          <InfoItem label="監控代理" value={resource.monitoring_agent ?? '尚未指定'} helper="目前連線的監控 Agent" />
          <InfoItem label="建立時間" value={createdDisplay} />
          <InfoItem label="最近更新" value={updatedDisplay} />
        </dl>
      </section>

      <section className="xl:col-span-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/30">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">相關事件（最近 3 筆）</h3>
            <p className="text-xs text-slate-500">最新事件彙總，協助快速追蹤。</p>
          </div>
          <Link
            to="/incidents/list"
            className="inline-flex items-center gap-1 text-xs font-medium text-sky-300 transition-colors hover:text-sky-200"
          >
            查看全部
            <Icon name="arrow-up-right" className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-3 space-y-2">
          {relatedIncidents.length > 0 ? (
            relatedIncidents.map(incident => {
              const statusMeta = INCIDENT_STATUS_META[incident.status];
              const severityMeta = INCIDENT_SEVERITY_META[incident.severity];
              const occurredDisplay = `${formatTimestamp(incident.occurred_at, { showSeconds: false })}`;

              return (
                <Link
                  to={`/incidents/${incident.id}`}
                  key={incident.id}
                  className="group grid gap-1.5 rounded-xl border border-slate-800/80 bg-slate-950/45 p-2.5 transition-colors hover:border-sky-500/50 hover:bg-slate-900/75"
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusTag tone={severityMeta.tone} label={severityMeta.label} dense />
                    <StatusTag tone={statusMeta.tone} icon={statusMeta.icon} label={statusMeta.label} dense />
                  </div>
                  <p className="text-sm font-semibold leading-snug text-white">{incident.summary}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{occurredDisplay}</span>
                    <Icon name="chevron-right" className="h-4 w-4 text-slate-500 transition-colors group-hover:text-sky-300" />
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="rounded-xl border border-dashed border-slate-700/80 bg-slate-950/40 p-5 text-center text-slate-400">
              <Icon name="shield-check" className="mx-auto mb-3 h-7 w-7 text-slate-500" />
              <p className="text-sm">最近 24 小時內沒有與此資源相關的事件記錄。</p>
            </div>
          )}
        </div>
      </section>

      <section className="xl:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/30">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-white">CPU 使用率（最近 30 分鐘）</h3>
          <span className="text-[11px] text-slate-500">單位：百分比</span>
        </div>
        <div className="mt-3 h-40" aria-label="CPU 使用率折線圖">
          <EChartsReact option={cpuOption} />
        </div>
      </section>
      <section className="xl:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/30">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-white">記憶體使用率（最近 30 分鐘）</h3>
          <span className="text-[11px] text-slate-500">單位：百分比</span>
        </div>
        <div className="mt-3 h-40" aria-label="記憶體使用率折線圖">
          <EChartsReact option={memoryOption} />
        </div>
      </section>
    </div>
  );
};

export default ResourceDetailPage;