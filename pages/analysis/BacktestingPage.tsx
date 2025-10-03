import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Toolbar, { ToolbarButton } from '../../components/Toolbar';
import Icon from '../../components/Icon';
import EChartsReact from '../../components/EChartsReact';
import api from '../../services/api';
import { showToast } from '../../services/toast';
import {
    AlertRule,
    BacktestingResultsResponse,
    BacktestingRuleResult,
    BacktestingRunRequest,
    BacktestingRunResponse,
    BacktestingTaskStatus,
} from '../../types';


const toInputValue = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

const toISOValue = (value: string) => new Date(value).toISOString();

const formatDisplayTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleString('zh-TW', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
};

type MinimalManualEvent = {
    label: string;
    timestamp: string;
};

const BacktestingPage: React.FC = () => {
    const defaultStart = useMemo(() => {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        return date;
    }, []);

    const [availableRules, setAvailableRules] = useState<AlertRule[]>([]);
    const [isLoadingRules, setIsLoadingRules] = useState(false);
    const [selectedRuleId, setSelectedRuleId] = useState<string>('');
    const [activeRuleId, setActiveRuleId] = useState<string | null>(null);

    const [startInput, setStartInput] = useState<string>(toInputValue(defaultStart));
    const [endInput, setEndInput] = useState<string>(toInputValue(new Date()));

    const [manualEvents, setManualEvents] = useState<MinimalManualEvent[]>([]);
    const [newEventLabel, setNewEventLabel] = useState('');
    const [newEventTime, setNewEventTime] = useState('');

    const handleAddManualEvent = useCallback(() => {
        if (!newEventLabel.trim()) {
            showToast('請輸入事件標題。', 'warning');
            return;
        }
        if (!newEventTime) {
            showToast('請選擇事件時間。', 'warning');
            return;
        }

        const isoTime = toISOValue(newEventTime);
        const newEvent: MinimalManualEvent = {
            label: newEventLabel.trim(),
            timestamp: isoTime,
        };

        setManualEvents(prev => [...prev, newEvent]);
        setNewEventLabel('');
        setNewEventTime('');
        showToast('已新增實際事件。', 'success');
    }, [newEventLabel, newEventTime]);

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
        setNewEventTime('');
        setActiveRuleId(ruleId);
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

    const applyQuickRange = useCallback((range: '1h' | '24h' | '7d' | 'custom') => {
        setQuickRange(range);
        if (range === 'custom') {
            return;
        }
        const end = new Date();
        const start = new Date(end.getTime());
        if (range === '1h') {
            start.setHours(end.getHours() - 1);
        } else if (range === '24h') {
            start.setDate(end.getDate() - 1);
        } else if (range === '7d') {
            start.setDate(end.getDate() - 7);
        }
        setStartInput(toInputValue(start));
        setEndInput(toInputValue(end));
    }, []);

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
            const eventTime = new Date(event.timestamp).getTime();
            if (Number.isNaN(eventTime)) {
                return true;
            }
            return eventTime < rangeStart || eventTime > rangeEnd;
        });

        if (outOfRangeEvent) {
            showToast('人工事件時間需落在回放區間內。', 'warning');
            return;
        }

        const sanitizedEvents = manualEvents.map(event => ({
            label: event.label,
            start_time: event.timestamp,
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

    const handleImportEventsFromResults = useCallback(() => {
        if (!activeRule) {
            showToast('目前沒有可匯入的回放結果。', 'info');
            return;
        }
        if (activeRule.actual_events.length === 0) {
            showToast('這次回放沒有人工標記事件。', 'info');
            return;
        }
        const imported = activeRule.actual_events.map(event => ({
            label: event.label,
            timestamp: event.start_time,
        }));
        setManualEvents(imported);
        setNewEventLabel('');
        setNewEventTime('');
        showToast('已匯入回放結果中的實際事件。', 'success');
    }, [activeRule]);

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
            timestamp: event.start_time,
        }));
        setManualEvents(seeded);
    }, [activeRule, manualEvents.length]);

    const chartOption = useMemo(() => {
        if (!activeRule || activeRule.metric_series.length === 0) {
            return null;
        }

        const labels = activeRule.metric_series.map(point => formatDisplayTime(point.timestamp));
        const metricValues = activeRule.metric_series.map(point => point.value);
        const thresholdValues = activeRule.metric_series.map(point => point.threshold ?? null);
        const triggerPoints = activeRule.trigger_points.map(point => [formatDisplayTime(point.timestamp), point.value]);

        return {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'line',
                    lineStyle: { color: '#334155' },
                },
                valueFormatter: (value: number | string | null) => {
                    if (value === null || value === undefined || Number.isNaN(Number(value))) {
                        return '—';
                    }
                    return Number(value).toFixed(2);
                },
            },
            legend: {
                data: ['指標值', '門檻值', '觸發點'],
                textStyle: { color: '#94a3b8' },
            },
            grid: {
                left: 40,
                right: 20,
                top: 30,
                bottom: 60,
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: labels,
                axisLabel: { color: '#94a3b8', rotate: 45 },
                axisLine: { lineStyle: { color: '#1e293b' } },
                axisTick: { show: false },
            },
            yAxis: {
                type: 'value',
                axisLabel: { color: '#94a3b8' },
                axisLine: { lineStyle: { color: '#1e293b' } },
                splitLine: { lineStyle: { color: '#1e293b' } },
            },
            series: [
                {
                    name: '指標值',
                    type: 'line',
                    data: metricValues,
                    showSymbol: false,
                    lineStyle: { width: 2, color: '#38bdf8' },
                },
                {
                    name: '門檻值',
                    type: 'line',
                    data: thresholdValues,
                    showSymbol: false,
                    lineStyle: { width: 1, color: '#f97316', type: 'dashed' },
                },
                {
                    name: '觸發點',
                    type: 'scatter',
                    data: triggerPoints,
                    symbolSize: 8,
                    itemStyle: {
                        color: '#facc15',
                        borderColor: '#0f172a',
                        borderWidth: 1,
                    },
                },
            ],
        };
    }, [activeRule]);

    const renderStatus = () => {
        if (!taskId) {
            return null;
        }
        const statusMap: Record<BacktestingTaskStatus, { icon: string; label: string; color: string }> = {
            queued: { icon: 'clock', label: '等待排程', color: 'text-slate-300' },
            pending: { icon: 'clock', label: '準備中', color: 'text-slate-300' },
            running: { icon: 'loader', label: '模擬執行中', color: 'text-sky-300' },
            completed: { icon: 'check-circle-2', label: '模擬完成', color: 'text-emerald-300' },
            failed: { icon: 'alert-triangle', label: '模擬失敗', color: 'text-rose-300' },
        } as const;
        const statusInfo = statusMap[taskStatus] || { icon: 'info', label: taskStatus, color: 'text-slate-300' };
        return (
            <div className={`flex items-center space-x-2 ${statusInfo.color}`}>
                <Icon name={statusInfo.icon} className="w-4 h-4" />
                <span className="text-sm">{statusInfo.label}</span>
                <span className="text-xs text-slate-500">Task ID: {taskId}</span>
            </div>
        );
    };

    const leftActions = (
        <ToolbarButton
            icon="play"
            text="執行回放"
            onClick={handleRunBacktesting}
            disabled={isSubmitting || !selectedRuleId}
        />
    );

    const rightActions = (
        <div className="flex items-center space-x-4">
            {renderStatus()}
            <ToolbarButton
                icon="refresh-cw"
                text="重新載入規則"
                onClick={fetchRules}
                disabled={isLoadingRules}
            />
        </div>
    );

    return (
        <div className="h-full flex flex-col space-y-4">
            <Toolbar leftActions={leftActions} rightActions={rightActions} />

            {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-200 px-4 py-3 rounded-md">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4 space-y-4 xl:col-span-1">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-100">回放設定</h2>
                        <p className="text-sm text-slate-400">選擇模擬所需的規則與時間區間。</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-300">選擇告警規則</label>
                            <select
                                value={selectedRuleId}
                                onChange={e => handleSelectRule(e.target.value)}
                                className="mt-1 w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                                disabled={isLoadingRules}
                            >
                                <option value="" disabled>
                                    {isLoadingRules ? '載入規則中...' : '選擇一個告警規則...'}
                                </option>
                                {!isLoadingRules && availableRules.map(rule => (
                                    <option key={rule.id} value={rule.id}>
                                        {rule.name} - {rule.conditions_summary}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-300">開始時間</label>
                                <input
                                    type="datetime-local"
                                    value={startInput}
                                    onChange={event => setStartInput(event.target.value)}
                                    className="mt-1 w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-300">結束時間</label>
                                <input
                                    type="datetime-local"
                                    value={endInput}
                                    onChange={event => setEndInput(event.target.value)}
                                    className="mt-1 w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                                />
                            </div>
                        </div>

                        <div className="border-t border-slate-800 pt-4 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                                        <Icon name="flag" className="w-4 h-4" />
                                        <span>實際事件</span>
                                    </h3>
                                    <p className="text-xs text-slate-500">新增或匯入事件標籤與時間，作為回放對照。</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleImportEventsFromResults}
                                    className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:border-sky-500 hover:text-sky-200"
                                    disabled={!activeRule}
                                >
                                    匯入回放結果
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="sm:col-span-2">
                                    <label className="text-xs font-medium text-slate-400">事件名稱</label>
                                    <input
                                        type="text"
                                        value={newEventLabel}
                                        onChange={e => setNewEventLabel(e.target.value)}
                                        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                                        placeholder="例如：CPU 過載"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-400">事件時間</label>
                                    <input
                                        type="datetime-local"
                                        value={newEventTime}
                                        onChange={e => setNewEventTime(e.target.value)}
                                        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddManualEvent}
                                className="w-full rounded-md border border-emerald-500/60 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-200 hover:border-emerald-400"
                            >
                                新增事件
                            </button>

                            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                {manualEvents.length === 0 && (
                                    <div className="text-sm text-slate-500">尚未新增實際事件。</div>
                                )}
                                {manualEvents.map((event, index) => (
                                    <div
                                        key={`${event.timestamp}-${event.label}-${index}`}
                                        className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-200"
                                    >
                                        <div>
                                            <div className="font-medium text-slate-100">{event.label}</div>
                                            <div className="text-xs text-slate-400">{formatDisplayTime(event.timestamp)}</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteManualEvent(index)}
                                            className="rounded border border-rose-500/40 px-2 py-1 text-xs text-rose-200 hover:border-rose-400"
                                        >
                                            刪除
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
    
                </div>

                <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4 space-y-4 xl:col-span-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-100">回放結果</h2>
                            <p className="text-sm text-slate-400">檢視觸發趨勢與時間分布。</p>
                        </div>
                        {results?.rule_results?.length ? (
                            <select
                                value={activeRule?.rule_id || ''}
                                onChange={event => setActiveRuleId(event.target.value)}
                                className="w-full sm:w-72 rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                            >
                                {results.rule_results.map(rule => (
                                    <option key={rule.rule_id} value={rule.rule_id}>
                                        {rule.rule_name}
                                    </option>
                                ))}
                            </select>
                        ) : null}
                    </div>

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
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                                <div className="bg-slate-900/60 border border-slate-800 rounded-md p-4">
                                    <div className="text-xs text-slate-400">觸發次數</div>
                                    <div className="text-3xl font-semibold text-slate-100">{activeRule.triggered_count}</div>
                                </div>
                                <div className="lg:col-span-2">
                                    {chartOption ? (
                                        <div className="h-80 bg-slate-950/40 border border-slate-800 rounded-md">
                                            <EChartsReact option={chartOption} />
                                        </div>
                                    ) : (
                                        <div className="h-80 flex items-center justify-center text-slate-500 border border-slate-800 rounded-md bg-slate-900/40">
                                            沒有可視化資料。
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-900/60 border border-slate-800 rounded-md p-4 space-y-3">
                                <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                                    <Icon name="activity" className="w-4 h-4" />
                                    <span>觸發時間</span>
                                </h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                    {activeRule.trigger_points.length === 0 && (
                                        <div className="text-sm text-slate-500">此規則在指定期間未觸發。</div>
                                    )}
                                    {activeRule.trigger_points.map(point => (
                                        <div
                                            key={`${point.timestamp}-${point.value}`}
                                            className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-200"
                                        >
                                            <div>
                                                <div className="font-medium text-slate-100">{formatDisplayTime(point.timestamp)}</div>
                                                <div className="text-xs text-slate-500">值 {point.value}</div>
                                            </div>
                                            {point.condition_summary && (
                                                <div className="text-xs text-slate-500 text-right max-w-xs truncate">{point.condition_summary}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                </div>
            </div>
        </div>
    );
};

export default BacktestingPage;

