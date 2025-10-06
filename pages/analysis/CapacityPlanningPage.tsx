import React, { useState, useEffect, useCallback, useMemo } from 'react';
import EChartsReact from '../../components/EChartsReact';
import Icon from '../../components/Icon';
import Toolbar, { ToolbarButton } from '../../components/Toolbar';
import Dropdown from '../../components/Dropdown';
import { exportToCsv } from '../../services/export';
import { showToast } from '../../services/toast';
import { CapacityPlanningData } from '../../types';
import api from '../../services/api';
import { useChartTheme } from '../../contexts/ChartThemeContext';
import { useContentSection } from '../../contexts/ContentContext';

const CapacityPlanningPage: React.FC = () => {
    const [data, setData] = useState<CapacityPlanningData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState('');
    const [expandedSuggestionMap, setExpandedSuggestionMap] = useState<Record<string, boolean>>({});

    const { theme: chartTheme } = useChartTheme();
    const content = useContentSection('CAPACITY_PLANNING');

    const formatUtilization = useCallback((value: number) => `${Math.round(value)}%`, []);
    const severityBadgeClasses = useMemo(
        () => ({
            critical: 'bg-red-500/30 text-red-300',
            warning: 'bg-yellow-500/30 text-yellow-300',
            info: 'bg-sky-500/20 text-sky-300',
        }),
        [],
    );

    const toRgba = useCallback((hex: string, alpha: number) => {
        const sanitized = hex.replace('#', '');
        if (sanitized.length !== 6) return hex;
        const r = parseInt(sanitized.slice(0, 2), 16);
        const g = parseInt(sanitized.slice(2, 4), 16);
        const b = parseInt(sanitized.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }, []);

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setIsRefreshing(true);
        else setIsLoading(true);
        setError(null);
        try {
            const response = await api.get<CapacityPlanningData>('/analysis/capacity-planning');
            setData(response.data);
            if (!isRefresh && response.data.options?.time_range_options?.length) {
                const defaultOption =
                    response.data.options.time_range_options.find(option => option.default) ||
                    response.data.options.time_range_options[0];
                if (defaultOption) {
                    setTimeRange(defaultOption.value);
                }
            }
        } catch (err) {
            setError(content?.FETCH_ERROR ?? '無法獲取容量規劃資料。');
        } finally {
            if (isRefresh) setIsRefreshing(false);
            else setIsLoading(false);
        }
    }, [content]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const series_labels = useMemo(
        () => ({
            cpu: content?.SERIES_LABELS?.CPU ?? 'CPU',
            cpu_forecast: content?.SERIES_LABELS?.CPU_FORECAST ?? 'CPU Forecast',
            memory: content?.SERIES_LABELS?.MEMORY ?? 'Memory',
            memory_forecast: content?.SERIES_LABELS?.MEMORY_FORECAST ?? 'Memory Forecast',
            storage: content?.SERIES_LABELS?.STORAGE ?? 'Storage',
            storage_forecast: content?.SERIES_LABELS?.STORAGE_FORECAST ?? 'Storage Forecast',
        }),
        [content],
    );

    const forecastAccent = '#f59e0b';

    const trendOption = useMemo(
        () => ({
            tooltip: { trigger: 'axis' as const },
            legend: {
                data: [
                    series_labels.cpu,
                    series_labels.cpu_forecast,
                    series_labels.memory,
                    series_labels.memory_forecast,
                    series_labels.storage,
                    series_labels.storage_forecast,
                ],
                textStyle: { color: chartTheme.text.primary },
            },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { type: 'time' as const, axisLine: { lineStyle: { color: chartTheme.grid.axis } } },
            yAxis: {
                type: 'value' as const,
                min: 0,
                max: 100,
                axisLabel: { formatter: '{value} %' },
                splitLine: { lineStyle: { color: chartTheme.grid.split_line } },
            },
            series: [
                { name: series_labels.cpu, type: 'line' as const, data: data?.trends.cpu.historical, showSymbol: false, lineStyle: { color: chartTheme.capacity_planning.cpu } },
                { name: series_labels.cpu_forecast, type: 'line' as const, data: data?.trends.cpu.forecast, showSymbol: false, lineStyle: { type: 'dashed' as const, color: forecastAccent, width: 2 }, emphasis: { focus: 'series' as const } },
                { name: series_labels.memory, type: 'line' as const, data: data?.trends.memory.historical, showSymbol: false, lineStyle: { color: chartTheme.capacity_planning.memory } },
                { name: series_labels.memory_forecast, type: 'line' as const, data: data?.trends.memory.forecast, showSymbol: false, lineStyle: { type: 'dashed' as const, color: toRgba(chartTheme.capacity_planning.memory, 0.85) }, emphasis: { focus: 'series' as const } },
                { name: series_labels.storage, type: 'line' as const, data: data?.trends.storage.historical, showSymbol: false, lineStyle: { color: chartTheme.capacity_planning.storage } },
                { name: series_labels.storage_forecast, type: 'line' as const, data: data?.trends.storage.forecast, showSymbol: false, lineStyle: { type: 'dashed' as const, color: toRgba(chartTheme.capacity_planning.storage, 0.85) }, emphasis: { focus: 'series' as const } },
            ],
        }),
        [chartTheme, data, series_labels, toRgba, forecastAccent],
    );

    const forecast_model_legend = useMemo(
        () => ({
            prediction: content?.FORECAST_MODEL_LEGEND?.PREDICTION ?? '預測',
            confidence_band: content?.FORECAST_MODEL_LEGEND?.CONFIDENCE_BAND ?? '信賴區間',
        }),
        [content],
    );

    const forecastModelOption = useMemo(
        () => ({
            tooltip: { trigger: 'axis' as const },
            legend: { data: [forecast_model_legend.prediction, forecast_model_legend.confidence_band], textStyle: { color: chartTheme.text.primary } },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { type: 'time' as const, axisLine: { lineStyle: { color: chartTheme.grid.axis } } },
            yAxis: {
                type: 'value' as const,
                min: 0,
                max: 100,
                axisLabel: { formatter: '{value} %' },
                splitLine: { lineStyle: { color: chartTheme.grid.split_line } },
            },
            series: [
                { name: forecast_model_legend.prediction, type: 'line' as const, data: data?.forecast_model.prediction, showSymbol: false, lineStyle: { color: forecastAccent, width: 3 } },
                { name: forecast_model_legend.confidence_band, type: 'line' as const, data: data?.forecast_model.confidence_band[0], lineStyle: { opacity: 0 }, stack: 'confidence-band', symbol: 'none' },
                {
                    name: forecast_model_legend.confidence_band,
                    type: 'line' as const,
                    data: data
                        ? data.forecast_model.confidence_band[1].map((point, i) => [point[0], point[1] - data.forecast_model.confidence_band[0][i][1]])
                        : [],
                    lineStyle: { opacity: 0 },
                    areaStyle: { color: toRgba(forecastAccent, 0.25) },
                    stack: 'confidence-band',
                    symbol: 'none',
                },
            ],
        }),
        [chartTheme, data, toRgba, forecast_model_legend, forecastAccent],
    );

    const handleExport = () => {
        if (!data?.resource_analysis || data.resource_analysis.length === 0) {
            showToast(content?.EXPORT_EMPTY_WARNING ?? '沒有可匯出的資料。', 'warning');
            return;
        }
        exportToCsv({
            filename: `capacity-planning-${new Date().toISOString().split('T')[0]}.csv`,
            data: data.resource_analysis.map(item => ({
                resource_name: item.resource_name,
                current_utilization: formatUtilization(item.current_utilization),
                forecast_utilization: formatUtilization(item.forecast_utilization),
                recommendation: item.recommendation.label,
                recommendation_severity: item.recommendation.severity,
                cost_impact: item.cost_impact.label,
                lastEvaluated_at: item.lastEvaluated_at,
            })),
        });
    };

    const toggleSuggestion = useCallback((id: string) => {
        setExpandedSuggestionMap(prev => ({ ...prev, [id]: !prev[id] }));
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Icon name="loader-circle" className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-red-400">
                <Icon name="alert-circle" className="w-12 h-12 mb-4" />
                <h2 className="text-xl font-bold">{error}</h2>
                <button onClick={() => fetchData()} className="mt-4 px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">
                    {content?.RETRY_BUTTON ?? '重試'}
                </button>
            </div>
        );
    }

    const timeRangeOptions = data?.options?.time_range_options || [];
    const dropdownValue = timeRange || timeRangeOptions[0]?.value || '';

    return (
        <div className="space-y-6">
            <Toolbar
                leftActions={
                    <Dropdown
                        label={content?.TIME_RANGE_LABEL ?? '時間範圍'}
                        options={timeRangeOptions}
                        value={dropdownValue}
                        onChange={setTimeRange}
                        minWidth="w-64"
                    />
                }
                rightActions={
                    <>
                        <ToolbarButton
                            icon="brain-circuit"
                            text={content?.TRIGGER_AI_ANALYSIS ?? '觸發 AI 分析'}
                            onClick={() => fetchData(true)}
                            disabled={isRefreshing}
                            ai
                        />
                        <ToolbarButton icon="download" text={content?.EXPORT_REPORT ?? '匯出報表'} onClick={handleExport} />
                    </>
                }
            />
            {data && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div className="lg:col-span-3 glass-card rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-4">{content?.TRENDS_CHART_TITLE ?? '資源使用趨勢 (含預測)'}</h2>
                            <div className="h-80">
                                <EChartsReact option={trendOption} />
                            </div>
                            <p className="mt-3 text-xs text-slate-400">實線呈現歷史數據，虛線使用高對比色標示預測趨勢。</p>
                        </div>
                        <div className="lg:col-span-2 glass-card rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-4">{content?.FORECAST_CHART_TITLE ?? 'CPU 容量預測模型'}</h2>
                            <div className="h-80">
                                <EChartsReact option={forecastModelOption} />
                            </div>
                            <p className="mt-3 text-xs text-slate-400">橙色實線為預測趨勢，陰影區域對應信賴區間。</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-1 glass-card rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-4">{content?.AI_SUGGESTIONS_TITLE ?? 'AI 優化建議'}</h2>
                            <div className="space-y-4 max-h-[200px] overflow-y-auto pr-1">
                                {data.suggestions.map(s => {
                                    const isExpanded = !!expandedSuggestionMap[s.id];
                                    const showToggle = s.details.length > 90;
                                    return (
                                        <div key={s.id} className="p-3 bg-slate-800/50 rounded-lg">
                                            <div className="flex justify-between items-start gap-3">
                                                <h3 className="font-semibold text-white">{s.title}</h3>
                                                <div className="flex space-x-2 text-xs shrink-0">
                                                    <span className="px-2 py-0.5 bg-red-500/30 text-red-300 rounded-full">{`${content?.IMPACT ?? '影響'}: ${s.impact}`}</span>
                                                    <span className="px-2 py-0.5 bg-yellow-500/30 text-yellow-300 rounded-full">{`${content?.EFFORT ?? '投入'}: ${s.effort}`}</span>
                                                </div>
                                            </div>
                                            <p
                                                className="text-sm text-slate-400 mt-1 leading-relaxed"
                                                style={
                                                    isExpanded
                                                        ? undefined
                                                        : {
                                                            display: '-webkit-box',
                                                            WebkitBoxOrient: 'vertical',
                                                            WebkitLineClamp: 3,
                                                            overflow: 'hidden',
                                                        }
                                                }
                                            >
                                                {s.details}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-2">{`${content?.SUGGESTION_DETECTED_AT_LABEL ?? '建議產生時間'}: ${new Date(s.detected_at).toLocaleString()}`}</p>
                                            {showToggle && (
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSuggestion(s.id)}
                                                    className="mt-2 text-xs text-sky-400 hover:text-sky-300 inline-flex items-center gap-1"
                                                >
                                                    <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} className="w-3 h-3" />
                                                    <span>{isExpanded ? '收合詳情' : '展開詳情'}</span>
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="lg:col-span-3 glass-card rounded-xl p-6 flex flex-col">
                            <h2 className="text-xl font-bold mb-4">{content?.DETAILED_ANALYSIS_TITLE ?? '詳細分析'}</h2>
                            <div className="flex-grow overflow-y-auto">
                                <table className="w-full text-sm text-left text-slate-300">
                                    <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2">{content?.TABLE_HEADERS?.RESOURCE_NAME ?? '資源名稱'}</th>
                                            <th className="px-4 py-2">{content?.TABLE_HEADERS?.CURRENT_USAGE ?? '目前用量'}</th>
                                            <th className="px-4 py-2">{content?.TABLE_HEADERS?.FORECAST_30D ?? '30 天預測'}</th>
                                            <th className="px-4 py-2">{content?.TABLE_HEADERS?.RECOMMENDATION ?? '建議'}</th>
                                            <th className="px-4 py-2">{content?.TABLE_HEADERS?.COST_ESTIMATE ?? '成本估算'}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {data.resource_analysis.map(r => {
                                            const recommendationLabel = content?.RECOMMENDATION_ACTION_LABELS?.[r.recommendation.action] ?? r.recommendation.label;
                                            const severityLabel = content?.RECOMMENDATION_SEVERITY_LABELS?.[r.recommendation.severity] ?? r.recommendation.severity;
                                            const badgeClass = severityBadgeClasses[r.recommendation.severity] ?? 'bg-slate-700 text-slate-200';
                                            return (
                                                <tr key={r.id}>
                                                    <td className="px-4 py-3 font-medium">
                                                        <div className="flex flex-col">
                                                            <span>{r.resource_name}</span>
                                                            <span className="text-xs text-slate-500">{`${content?.LAST_EVALUATED_AT_LABEL ?? '最後評估時間'}: ${new Date(r.lastEvaluated_at).toLocaleString()}`}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">{formatUtilization(r.current_utilization)}</td>
                                                    <td className="px-4 py-3">{formatUtilization(r.forecast_utilization)}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold">{recommendationLabel}</span>
                                                            <span className={`px-2 py-0.5 text-xs rounded-full ${badgeClass}`}>{severityLabel}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">{r.cost_impact.label}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CapacityPlanningPage;
