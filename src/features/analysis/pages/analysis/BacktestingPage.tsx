import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Icon from '@/shared/components/Icon';
import EChartsReact from '@/shared/components/EChartsReact';
import api from '@/services/api';
import { showToast } from '@/services/toast';
import type { TimeRangePickerProps } from 'antd';
import { DatePicker, Tooltip } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import StatusTag, { type StatusTagProps } from '@/shared/components/StatusTag';
import SearchableSelect from '@/shared/components/SearchableSelect';
import IconButton from '@/shared/components/IconButton';
import {
    AlertRule,
    BacktestingResultsResponse,
    BacktestingRuleResult,
    BacktestingRunRequest,
    BacktestingRunResponse,
    BacktestingTaskStatus,
} from '@/shared/types';


const toInputValue = (date: Date | Dayjs) => {
    const dayjsDate = dayjs(date);
    return dayjsDate.format('YYYY-MM-DDTHH:mm');
};

const toISOValue = (value: string | Dayjs) => {
    if (typeof value === 'string') {
        return new Date(value).toISOString();
    }
    return value.toISOString();
};

const formatDisplayTime = (value: string | Dayjs) => {
    const dayjsDate = dayjs(value);
    if (!dayjsDate.isValid()) {
        return String(value);
    }
    return dayjsDate.format('MM/DD HH:mm');
};

type MinimalManualEvent = {
    label: string;
    start_time: string;
    end_time: string;
};

const rangePresets: TimeRangePickerProps['presets'] = [
    { label: '過去 7 天', value: () => [dayjs().subtract(7, 'day'), dayjs()] },
    { label: '過去 14 天', value: () => [dayjs().subtract(14, 'day'), dayjs()] },
    { label: '過去 30 天', value: () => [dayjs().subtract(30, 'day'), dayjs()] },
    { label: '過去 90 天', value: () => [dayjs().subtract(90, 'day'), dayjs()] },
];

const BacktestingPage: React.FC = () => {
    const defaultStart = useMemo(() => dayjs().subtract(7, 'day'), []);

    const defaultEnd = useMemo(() => dayjs(), []);

    const [availableRules, setAvailableRules] = useState<AlertRule[]>([]);
    const [isLoadingRules, setIsLoadingRules] = useState(false);
    const [selectedRuleId, setSelectedRuleId] = useState<string>('');
    const [activeRuleId, setActiveRuleId] = useState<string | null>(null);

    const [startInput, setStartInput] = useState<string>(toInputValue(defaultStart));
    const [endInput, setEndInput] = useState<string>(toInputValue(defaultEnd));
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([defaultStart, defaultEnd]);
    const [eventDateRange, setEventDateRange] = useState<[Dayjs, Dayjs] | null>(null);

    const [manualEvents, setManualEvents] = useState<MinimalManualEvent[]>([]);
    const [newEventLabel, setNewEventLabel] = useState('');
    const [isEventSectionExpanded, setIsEventSectionExpanded] = useState(false);

    const timezoneLabel = useMemo(() => `UTC${dayjs().format('Z')}`, []);
    const ruleOptions = useMemo(
        () =>
            availableRules.map(rule => ({
                value: rule.id,
                label: `${rule.name}｜${rule.conditions_summary}`,
            })),
        [availableRules],
    );
    const selectedRule = useMemo(
        () => availableRules.find(rule => rule.id === selectedRuleId) || null,
        [availableRules, selectedRuleId],
    );

    const severityToneMap: Record<AlertRule['severity'], { label: string; tone: StatusTagProps['tone']; icon: string }> = useMemo(
        () => ({
            critical: { label: '嚴重', tone: 'danger', icon: 'alert-octagon' },
            warning: { label: '警告', tone: 'warning', icon: 'alert-triangle' },
            info: { label: '資訊', tone: 'info', icon: 'info' },
        }),
        [],
    );

    const handleAddManualEvent = useCallback(() => {
        if (!eventDateRange || !eventDateRange[0] || !eventDateRange[1]) {
            showToast('請選擇事件時間段。', 'warning');
            return;
        }

        const startTimeMs = eventDateRange[0].toDate().getTime();
        const endTimeMs = eventDateRange[1].toDate().getTime();

        if (startTimeMs >= endTimeMs) {
            showToast('結束時間必須晚於開始時間。', 'warning');
            return;
        }

        const newEvent: MinimalManualEvent = {
            label: newEventLabel.trim() || '已標記事件',
            start_time: toISOValue(eventDateRange[0]),
            end_time: toISOValue(eventDateRange[1]),
        };

        setManualEvents(prev => [...prev, newEvent]);
        setNewEventLabel('');
        setEventDateRange(null);
        showToast('已新增實際事件。', 'success');
    }, [newEventLabel, eventDateRange]);

    const handleDeleteManualEvent = useCallback((index: number) => {
        setManualEvents(prev => prev.filter((_, idx) => idx !== index));
    }, []);


    const [taskId, setTaskId] = useState<string | null>(null);
    const [taskStatus, setTaskStatus] = useState<BacktestingTaskStatus>('pending');
    const [results, setResults] = useState<BacktestingResultsResponse | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pollingRef = useRef<number | null>(null);

    const fetchRules = useCallback(async () => {
        setIsLoadingRules(true);
        setError(null);
        try {
            const { data } = await api.get<{ items: AlertRule[] }>('/alert-rules', {
                params: { page: 1, page_size: 100, include_disabled: true },
            });
            setAvailableRules(data.items);
        } catch (err) {
            setError('無法載入告警規則，請稍後再試。');
        } finally {
            setIsLoadingRules(false);
        }
    }, []);

    useEffect(() => {
        fetchRules();
        return () => {
            if (pollingRef.current) {
                window.clearInterval(pollingRef.current);
            }
        };
    }, [fetchRules]);

    useEffect(() => {
        if (results?.rule_results?.length && !activeRuleId) {
            setActiveRuleId(results.rule_results[0].rule_id);
        }
    }, [results, activeRuleId]);

    const handleSelectRule = useCallback((ruleId: string) => {
        setSelectedRuleId(ruleId);
        setManualEvents([]);
        setNewEventLabel('');
        setEventDateRange(null);
        setActiveRuleId(ruleId);
    }, []);

    const handleDateRangeChange = useCallback((dates: [Dayjs, Dayjs] | null) => {
        if (dates) {
            setDateRange(dates);
            setStartInput(toInputValue(dates[0]));
            setEndInput(toInputValue(dates[1]));
        }
    }, []);

    const handleEventDateRangeChange = useCallback((dates: [Dayjs, Dayjs] | null) => {
        if (dates) {
            setEventDateRange(dates);
        }
    }, []);

    const stopPolling = () => {
        if (pollingRef.current) {
            window.clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    };

    const pollResults = useCallback(async (id: string) => {
        try {
            const { data } = await api.get<BacktestingResultsResponse>(`/backtesting/results/${id}`);
            setResults(data);
            setTaskStatus(data.status);
            if (data.status === 'completed' || data.status === 'failed') {
                stopPolling();
                if (data.status === 'failed') {
                    setError(data.message || '回放模擬失敗，請稍後再試。');
                }
            }
        } catch (err) {
            setError('取得回放結果失敗，已停止輪詢。');
            stopPolling();
        }
    }, []);

    const startPolling = useCallback((id: string) => {
        stopPolling();
        pollResults(id);
        pollingRef.current = window.setInterval(() => pollResults(id), 5000);
    }, [pollResults]);

    const handleRunBacktesting = async () => {
        if (!selectedRuleId) {
            showToast('請先選擇要回放的告警規則。', 'warning');
            return;
        }
        if (!startInput || !endInput) {
            showToast('請選擇完整的模擬時間範圍。', 'warning');
            return;
        }
        if (new Date(startInput) >= new Date(endInput)) {
            showToast('開始時間需早於結束時間。', 'warning');
            return;
        }

        const rangeStart = new Date(startInput).getTime();
        const rangeEnd = new Date(endInput).getTime();
        const outOfRangeEvent = manualEvents.find(event => {
            const eventStartTime = new Date(event.start_time).getTime();
            const eventEndTime = new Date(event.end_time).getTime();
            if (Number.isNaN(eventStartTime) || Number.isNaN(eventEndTime)) {
                return true;
            }
            return eventEndTime < rangeStart || eventStartTime > rangeEnd;
        });

        if (outOfRangeEvent) {
            showToast('人工事件時間需落在回放區間內。', 'warning');
            return;
        }

        const sanitizedEvents = manualEvents.map(event => ({
            label: event.label,
            start_time: event.start_time,
            end_time: event.end_time,
        }));

        const payload: BacktestingRunRequest = {
            rule_id: selectedRuleId,
            time_range: {
                start_time: toISOValue(startInput),
                end_time: toISOValue(endInput),
            },
            actual_events: sanitizedEvents,
        };

        setIsSubmitting(true);
        setError(null);
        setResults(null);
        stopPolling();

        try {
            const { data } = await api.post<BacktestingRunResponse>('/backtesting/run', payload);
            setTaskId(data.task_id);
            setTaskStatus(data.status);
            startPolling(data.task_id);
            showToast('已送出回放模擬請求。', 'success');
        } catch (err) {
            setError('送出回放模擬失敗，請稍後再試。');
        } finally {
            setIsSubmitting(false);
        }
    };

    const activeRule = useMemo<BacktestingRuleResult | null>(() => {
        if (!results?.rule_results?.length) {
            return null;
        }
        const matched = results.rule_results.find(rule => rule.rule_id === activeRuleId);
        return matched || results.rule_results[0];
    }, [results, activeRuleId]);


    useEffect(() => {
        if (!activeRule) {
            return;
        }
        if (manualEvents.length > 0) {
            return;
        }
        if (activeRule.actual_events.length === 0) {
            return;
        }
        const seeded = activeRule.actual_events.map(event => ({
            label: event.label,
            start_time: event.start_time,
            end_time: event.end_time || event.start_time,
        }));
        setManualEvents(seeded);
    }, [activeRule, manualEvents.length]);

    const chartOption = useMemo(() => {
        if (!activeRule || activeRule.metric_series.length === 0) {
            return null;
        }

        const metricSeries = activeRule.metric_series.map(point => ({
            value: [point.timestamp, point.value],
        }));

        const thresholdSeries = activeRule.metric_series.map(point => ({
            value: [point.timestamp, point.threshold ?? null],
        }));

        const triggerPoints = activeRule.trigger_points.map(point => ({
            value: [point.timestamp, point.value],
            name: point.condition_summary,
        }));

        const seriesStart = new Date(activeRule.metric_series[0].timestamp).getTime();
        const seriesEnd = new Date(activeRule.metric_series[activeRule.metric_series.length - 1].timestamp).getTime();

        const minimumEventDuration = 5 * 60 * 1000; // 5 分鐘最小顯示跨度

        const markAreaData = manualEvents
            .map(event => {
                const eventStart = new Date(event.start_time).getTime();
                const eventEnd = new Date(event.end_time).getTime();

                if (Number.isNaN(eventStart) || Number.isNaN(eventEnd)) {
                    return null;
                }

                if (eventEnd < seriesStart || eventStart > seriesEnd) {
                    return null;
                }

                const clampedStart = Math.max(eventStart, seriesStart);
                let clampedEnd = Math.min(eventEnd, seriesEnd);

                if (clampedEnd <= clampedStart) {
                    clampedEnd = Math.min(clampedStart + minimumEventDuration, seriesEnd);
                }

                if (clampedEnd <= clampedStart) {
                    return null;
                }

                const rangeLabel = `${event.label}\n${dayjs(event.start_time).format('MM/DD HH:mm')} ~ ${dayjs(event.end_time).format('MM/DD HH:mm')}`;

                return [
                    {
                        xAxis: clampedStart,
                        name: event.label,
                        itemStyle: {
                            color: 'rgba(16, 185, 129, 0.18)',
                            borderWidth: 0,
                        },
                        label: {
                            show: true,
                            color: '#0f766e',
                            fontSize: 10,
                            align: 'left',
                            backgroundColor: 'rgba(15, 118, 110, 0.08)',
                            borderRadius: 4,
                            padding: [6, 8],
                            formatter: rangeLabel,
                        },
                    },
                    {
                        xAxis: clampedEnd,
                    },
                ];
            })
            .filter((value): value is [any, any] => Boolean(value));

        const legendItems = ['CPU 使用率過高', '告警閾值', '模擬告警觸發點'];
        if (markAreaData.length > 0) {
            legendItems.push('標記事件時間段');
        }

        const tooltipFormatter = (params: any[]) => {
            if (!params || params.length === 0) {
                return '';
            }

            const primaryValue = params[0]?.value?.[0];
            const timestampLabel = dayjs(primaryValue).isValid()
                ? dayjs(primaryValue).format('YYYY/MM/DD HH:mm')
                : '';

            const rows = params
                .filter(item => item.seriesType !== 'markArea')
                .map(item => {
                    const rawValue = Array.isArray(item.value) ? item.value[1] : item.value;
                    const displayValue = rawValue === null || rawValue === undefined || Number.isNaN(Number(rawValue))
                        ? '—'
                        : `${Number(rawValue).toFixed(2)}%`;
                    const condition = item.seriesName === '模擬告警觸發點' && item.data?.name
                        ? `<div style="margin-left:16px;color:#94a3b8;">條件：${item.data.name}</div>`
                        : '';
                    return `
                        <div style="display:flex;align-items:center;margin-top:4px;gap:8px;">
                            <span style="display:inline-block;width:8px;height:8px;border-radius:9999px;background:${item.color};"></span>
                            <span style="color:#1f2937;">${item.seriesName}：${displayValue}</span>
                        </div>
                        ${condition}
                    `;
                })
                .join('');

            return `
                <div style="font-size:12px;color:#0f172a;">
                    <div style="margin-bottom:4px;">${timestampLabel}</div>
                    ${rows}
                </div>
            `;
        };

        return {
            backgroundColor: '#e5e7eb',
            tooltip: {
                trigger: 'axis' as const,
                axisPointer: { type: 'line' as const },
                formatter: tooltipFormatter,
                extraCssText: 'box-shadow:0 10px 25px rgba(15,23,42,0.12);border-radius:8px;padding:12px 14px;background:#fff;',
            },
            legend: {
                data: legendItems,
                textStyle: { color: '#374151' },
                bottom: 10,
                icon: 'roundRect',
                itemStyle: {
                    borderWidth: 0,
                },
            },
            grid: {
                left: 60,
                right: 40,
                top: 50,
                bottom: 80, // 為下方圖例留出更多空間
                containLabel: false,
            },
            xAxis: {
                type: 'time' as const,
                boundaryGap: ['0%', '0%'] as [string, string],
                axisLabel: {
                    color: '#6b7280',
                    rotate: 35,
                    fontSize: 11,
                    formatter: (value: number | string) => {
                        const parsed = dayjs(value);
                        return parsed.isValid() ? parsed.format('MM/DD HH:mm') : String(value);
                    },
                },
                axisLine: { lineStyle: { color: '#d1d5db' } },
                axisTick: { show: false },
                splitLine: { show: false },
            },
            yAxis: {
                type: 'value' as const,
                name: '數值 (%)',
                nameTextStyle: { color: '#374151' },
                axisLabel: { color: '#6b7280' },
                axisLine: { lineStyle: { color: '#d1d5db' } },
                splitLine: { lineStyle: { color: '#e5e7eb', type: 'solid' as const } },
            },
            series: [
                {
                    name: 'CPU 使用率過高',
                    type: 'line' as const,
                    data: metricSeries,
                    smooth: true,
                    showSymbol: false,
                    lineStyle: { width: 2, color: '#3b82f6' },
                    areaStyle: {
                        color: {
                            type: 'linear' as const,
                            x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [
                                { offset: 0, color: 'rgba(59, 130, 246, 0.2)' },
                                { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
                            ],
                        },
                    },
                    markArea: markAreaData.length > 0
                        ? {
                            silent: true,
                            data: markAreaData,
                        }
                        : undefined,
                },
                {
                    name: '告警閾值',
                    type: 'line' as const,
                    data: thresholdSeries,
                    showSymbol: false,
                    itemStyle: {
                        color: '#f97316',
                    },
                    lineStyle: {
                        width: 2,
                        color: '#f97316',
                        type: [6, 6],
                    },
                },
                {
                    name: '模擬告警觸發點',
                    type: 'scatter' as const,
                    data: triggerPoints,
                    symbol: 'triangle',
                    symbolSize: 16,
                    symbolRotate: 180,
                    itemStyle: {
                        color: '#ef4444',
                        borderColor: '#fff',
                        borderWidth: 1,
                    },
                    z: 10,
                },
                ...(markAreaData.length > 0
                    ? [
                        {
                            name: '標記事件時間段',
                            type: 'line' as const,
                            data: [],
                            showSymbol: false,
                            lineStyle: {
                                color: 'rgba(16, 185, 129, 0.5)',
                                width: 0,
                            },
                        },
                    ]
                    : []),
            ],
        };
    }, [activeRule, manualEvents]);

    const renderStatus = () => {
        if (!taskId) {
            return null;
        }
        const statusMap: Record<BacktestingTaskStatus, { icon: string; label: string; tone: StatusTagProps['tone']; helper: string }> = {
            queued: { icon: 'clock', label: '等待排程', tone: 'neutral', helper: '排程完成後會自動開始模擬。' },
            pending: { icon: 'clock', label: '準備中', tone: 'neutral', helper: '正在建立模擬環境，請稍候。' },
            running: { icon: 'loader', label: '模擬執行中', tone: 'info', helper: '狀態每 5 秒更新一次。' },
            completed: { icon: 'check-circle-2', label: '模擬完成', tone: 'success', helper: '結果已產出，可於右側檢視。' },
            failed: { icon: 'alert-triangle', label: '模擬失敗', tone: 'danger', helper: '請檢查設定或稍後再試。' },
        } as const;
        const statusInfo = statusMap[taskStatus] || { icon: 'info', label: taskStatus, tone: 'neutral', helper: '' };
        return (
            <div className="flex flex-wrap items-center gap-2 text-slate-400">
                <StatusTag dense tone={statusInfo.tone} icon={statusInfo.icon} label={statusInfo.label} />
                {statusInfo.helper && <span className="text-xs">{statusInfo.helper}</span>}
                <span className="text-xs text-slate-500">任務 ID：{taskId}</span>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            {taskId && (
                <div className="flex justify-end">{renderStatus()}</div>
            )}

            {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-200 px-4 py-3 rounded-md">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4 space-y-4 xl:col-span-1">
                    <h2 className="text-lg font-semibold text-slate-100">設定回放任務</h2>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-300">選擇告警規則</label>
                                <span className="text-xs text-slate-500">系統時區：{timezoneLabel}</span>
                            </div>
                            <SearchableSelect
                                value={selectedRuleId}
                                onChange={handleSelectRule}
                                options={ruleOptions}
                                disabled={isLoadingRules}
                                placeholder={isLoadingRules ? '告警規則載入中…' : '輸入名稱或條件關鍵字'}
                                emptyMessage="沒有符合的告警規則"
                            />
                            <p className="text-xs text-slate-500 leading-relaxed">
                                選擇後即可預覽規則描述、嚴重度與啟用狀態，並在下方設定回放區間。
                            </p>
                            {selectedRule && (
                                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <StatusTag
                                            dense
                                            icon={severityToneMap[selectedRule.severity].icon}
                                            tone={severityToneMap[selectedRule.severity].tone}
                                            label={`嚴重度｜${severityToneMap[selectedRule.severity].label}`}
                                        />
                                        <StatusTag
                                            dense
                                            icon={selectedRule.enabled ? 'check' : 'pause'}
                                            tone={selectedRule.enabled ? 'success' : 'neutral'}
                                            label={selectedRule.enabled ? '狀態｜已啟用' : '狀態｜未啟用'}
                                        />
                                        <span className="text-xs text-slate-500">
                                            更新時間：{dayjs(selectedRule.updated_at).format('YYYY/MM/DD HH:mm')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-200 leading-relaxed">
                                        {selectedRule.description || '此規則目前尚未提供描述。'}
                                    </p>
                                    <Tooltip title={selectedRule.conditions_summary || '—'} placement="top">
                                        <p className="text-xs text-slate-500 truncate">
                                            條件摘要：{selectedRule.conditions_summary || '—'}
                                        </p>
                                    </Tooltip>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">選擇時間段</label>
                            <DatePicker.RangePicker
                                value={dateRange}
                                onChange={handleDateRangeChange}
                                presets={[
                                    {
                                        label: <span aria-label="即刻到今日結束">即刻起 ~ 今日結束</span>,
                                        value: () => [dayjs(), dayjs().endOf('day')],
                                    },
                                    ...rangePresets,
                                ]}
                                placeholder={['開始時間', '結束時間']}
                                showTime
                                format="YYYY/MM/DD HH:mm"
                                className="w-full"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleRunBacktesting}
                            disabled={isSubmitting || !selectedRuleId}
                            className="w-full rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed px-3 py-2 text-sm font-medium text-white flex items-center justify-center space-x-2 transition-colors"
                        >
                            <Icon name="play" className="w-4 h-4" />
                            <span>{isSubmitting ? '回放中...' : '開始回放'}</span>
                        </button>

                        <div className="border-t border-slate-800 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsEventSectionExpanded(!isEventSectionExpanded)}
                                className="w-full flex items-center justify-between text-sm font-semibold text-slate-200 hover:text-slate-100 transition-colors"
                                aria-expanded={isEventSectionExpanded}
                                aria-controls="backtesting-event-panel"
                            >
                                <span className="flex items-center gap-2">
                                    <span>實際事件比對</span>
                                    <StatusTag
                                        dense
                                        icon="calendar-check"
                                        tone={manualEvents.length > 0 ? 'info' : 'neutral'}
                                        label={`已標記 ${manualEvents.length} 筆`}
                                    />
                                </span>
                                <Icon
                                    name={isEventSectionExpanded ? 'chevron-up' : 'chevron-down'}
                                    className="w-4 h-4"
                                />
                            </button>
                            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                                透過加入實際事件時間段，可比對規則在當下是否有正確觸發，協助調整閾值與條件。
                            </p>

                            {isEventSectionExpanded && (
                                <div id="backtesting-event-panel" className="mt-3 space-y-3">
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-medium text-slate-400">事件說明（選填）</label>
                                            <input
                                                type="text"
                                                value={newEventLabel}
                                                onChange={e => setNewEventLabel(e.target.value)}
                                                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                                                placeholder="例如：服務更新導致負載上升"
                                            />
                                            <p className="mt-1 text-xs text-slate-500">建議使用 20 字以內的描述，方便列表辨識。</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-slate-400">時間段</label>
                                            <DatePicker.RangePicker
                                                value={eventDateRange}
                                                onChange={handleEventDateRangeChange}
                                                presets={[
                                                    {
                                                        label: <span aria-label="即刻到今日結束">即刻起 ~ 今日結束</span>,
                                                        value: () => [dayjs(), dayjs().endOf('day')],
                                                    },
                                                    { label: '過去 1 小時', value: () => [dayjs().subtract(1, 'hour'), dayjs()] },
                                                    { label: '過去 6 小時', value: () => [dayjs().subtract(6, 'hour'), dayjs()] },
                                                    { label: '過去 24 小時', value: () => [dayjs().subtract(24, 'hour'), dayjs()] },
                                                ]}
                                                placeholder={['開始時間', '結束時間']}
                                                showTime
                                                format="YYYY/MM/DD HH:mm"
                                                className="w-full mt-1"
                                            />
                                            <p className="mt-1 text-xs text-slate-500">請確認時間落在回放區間內，避免資料無法比對。</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddManualEvent}
                                        className="w-full rounded-md bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-sm font-medium text-white flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Icon name="plus" className="w-4 h-4" />
                                        <span>新增標記事件</span>
                                    </button>

                                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                        {manualEvents.length === 0 && (
                                            <div className="text-sm text-slate-500">尚未新增實際事件。</div>
                                        )}
                                        {manualEvents.map((event, index) => (
                                            <div
                                                key={`${event.start_time}-${event.label}-${index}`}
                                                className="flex items-center justify-between gap-3 rounded-md border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-200"
                                            >
                                                <div className="min-w-0">
                                                    <p className="font-medium text-slate-100 truncate" title={event.label || '已標記事件'}>
                                                        {event.label || '已標記事件'}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {formatDisplayTime(event.start_time)} ~ {formatDisplayTime(event.end_time)}
                                                    </p>
                                                </div>
                                                <IconButton
                                                    icon="trash-2"
                                                    label="移除實際事件"
                                                    tone="danger"
                                                    onClick={() => handleDeleteManualEvent(index)}
                                                    tooltip="移除此事件"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4 space-y-4 xl:col-span-2">
                    <h2 className="text-lg font-semibold text-slate-100">數據趨勢與告警觸發</h2>

                    {results && results.status !== 'completed' && results.status !== 'failed' && (
                        <div className="flex items-center space-x-3 rounded-md border border-slate-800 bg-slate-900/60 px-4 py-3 text-slate-300">
                            <Icon name="loader-circle" className="h-4 w-4 animate-spin" />
                            <span>{results.message || '回放模擬執行中，請稍候...'}</span>
                        </div>
                    )}

                    {!results && (
                        <div className="flex flex-col items-center justify-center text-slate-500 py-12 space-y-3">
                            <Icon name="line-chart" className="w-10 h-10" />
                            <p className="text-sm">尚未執行回放或結果尚未產出。</p>
                            <p className="text-xs">選擇規則與時間範圍後點擊「執行回放」。</p>
                        </div>
                    )}

                    {results && activeRule && (
                        <>
                            {/* 圖表區域 */}
                            {chartOption ? (
                                <div className="h-80 bg-gray-200 border border-slate-700 rounded-md p-4">
                                    <EChartsReact option={chartOption} />
                                </div>
                            ) : (
                                <div className="h-80 flex items-center justify-center text-slate-500 border border-slate-800 rounded-md bg-slate-900/40">
                                    沒有可視化資料。
                                </div>
                            )}

                            {/* 回放結果總覽 - 統計指標 */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div className="bg-slate-900/60 border border-slate-800 rounded-md p-4">
                                    <p className="text-sm text-slate-400 mb-1">總數據點</p>
                                    <p className="text-3xl font-bold text-slate-300">{activeRule.metric_series.length}</p>
                                </div>
                                <div className="bg-slate-900/60 border border-slate-800 rounded-md p-4">
                                    <p className="text-sm text-slate-400 mb-1">觸發次數</p>
                                    <p className="text-3xl font-bold text-blue-400">{activeRule.triggered_count}</p>
                                </div>
                                <div className="bg-slate-900/60 border border-slate-800 rounded-md p-4">
                                    <p className="text-sm text-slate-400 mb-1">觸發率</p>
                                    <p className="text-3xl font-bold text-green-400">
                                        {activeRule.metric_series.length > 0
                                            ? ((activeRule.triggered_count / activeRule.metric_series.length) * 100).toFixed(2)
                                            : '0.00'}%
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        觸發 {activeRule.triggered_count} 次 / 總 {activeRule.metric_series.length} 點
                                    </p>
                                </div>
                                <div className="bg-slate-900/60 border border-slate-800 rounded-md p-4">
                                    <p className="text-sm text-slate-400 mb-1">告警閾值</p>
                                    <p className="text-3xl font-bold text-orange-400">
                                        {activeRule.metric_series[0]?.threshold ?? 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* 進階指標預留區域 */}
                            <div className="mt-6">
                                <p className="text-sm font-semibold text-slate-300 mb-3">進階指標</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                    <div className="bg-slate-900/40 border border-slate-700 rounded-md p-3 opacity-50">
                                        <p className="text-xs text-slate-400 mb-1">Precision</p>
                                        <p className="text-lg font-bold text-slate-500">預留</p>
                                    </div>
                                    <div className="bg-slate-900/40 border border-slate-700 rounded-md p-3 opacity-50">
                                        <p className="text-xs text-slate-400 mb-1">Recall</p>
                                        <p className="text-lg font-bold text-slate-500">預留</p>
                                    </div>
                                    <div className="bg-slate-900/40 border border-slate-700 rounded-md p-3 opacity-50">
                                        <p className="text-xs text-slate-400 mb-1">F1 Score</p>
                                        <p className="text-lg font-bold text-slate-500">預留</p>
                                    </div>
                                    <div className="bg-slate-900/40 border border-slate-700 rounded-md p-3 opacity-50">
                                        <p className="text-xs text-slate-400 mb-1">準確率</p>
                                        <p className="text-lg font-bold text-slate-500">預留</p>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mt-2 text-center">
                                    進階指標將在未來版本中提供更詳細的告警效能分析
                                </p>
                            </div>

                            {/* 觸發時間點詳情 */}
                            <div className="border-t border-slate-800 pt-4">
                                <p className="font-semibold text-slate-300 mb-3">觸發時間點詳情</p>
                                {activeRule.trigger_points.length === 0 ? (
                                    <p className="text-center text-slate-500 py-4">此時間範圍內未觸發任何告警。</p>
                                ) : (
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                        {activeRule.trigger_points.map(point => (
                                            <div
                                                key={`${point.timestamp}-${point.value}`}
                                                className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm"
                                            >
                                                <span className="text-slate-300">{formatDisplayTime(point.timestamp)}</span>
                                                <span className="font-bold text-slate-300">{point.value}%</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BacktestingPage;

