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

const BacktestingPage: React.FC = () => {
    const now = useMemo(() => new Date(), []);
    const defaultStart = useMemo(() => {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        return date;
    }, []);

    const [availableRules, setAvailableRules] = useState<AlertRule[]>([]);
    const [isLoadingRules, setIsLoadingRules] = useState(false);
    const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);
    const [activeRuleId, setActiveRuleId] = useState<string | null>(null);

    const [startInput, setStartInput] = useState<string>(toInputValue(defaultStart));
    const [endInput, setEndInput] = useState<string>(toInputValue(now));

    const [includeRecommendations, setIncludeRecommendations] = useState(true);


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

    const handleSelectRule = (ruleId: string) => {
        setSelectedRuleIds([ruleId]); // Only allow single selection
    };

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
        if (selectedRuleIds.length === 0) {
            showToast('請至少選擇一條告警規則。', 'warning');
            return;
        }
        if (!startInput || !endInput) {
            showToast('請選擇完整的模擬時間範圍。', 'warning');
            return;
        }

        const payload: BacktestingRunRequest = {
            rule_ids: selectedRuleIds,
            time_range: {
                start_time: toISOValue(startInput),
                end_time: toISOValue(endInput),
            },
            actual_events: [],
            options: {
                evaluation_window_minutes: 15, // Default value
                sensitivity: 'balanced', // Default value
                include_recommendations: includeRecommendations,
            },
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

    const precision = activeRule?.precision ?? null;
    const recall = activeRule?.recall ?? null;
    const falsePositiveRate = useMemo(() => {
        if (!activeRule) return null;
        if (activeRule.triggered_count === 0) return 0;
        return activeRule.false_positive_count / activeRule.triggered_count;
    }, [activeRule]);

    const falseNegativeRate = useMemo(() => {
        if (!activeRule) return null;
        if (activeRule.actual_events.length === 0) return 0;
        return activeRule.false_negative_count / activeRule.actual_events.length;
    }, [activeRule]);

    const chartOption = useMemo(() => {
        if (!activeRule || activeRule.metric_series.length === 0) {
            return null;
        }
        const timestamps = activeRule.metric_series.map(point => formatDisplayTime(point.timestamp));
        const metricValues = activeRule.metric_series.map(point => point.value);
        const thresholdValues = activeRule.metric_series.map(point => point.threshold ?? null);
        const baselineValues = activeRule.metric_series.map(point => point.baseline ?? null);
        const triggerPoints = activeRule.trigger_points.map(point => [formatDisplayTime(point.timestamp), point.value]);
        const markAreas = [];

        return {
            tooltip: { trigger: 'axis' },
            legend: {
                data: ['指標值', '門檻值', '基準值', '觸發點'],
                textStyle: { color: '#cbd5f5' },
            },
            grid: { left: '3%', right: '4%', bottom: '8%', containLabel: true },
            xAxis: {
                type: 'category',
                data: timestamps,
                axisLabel: { rotate: 35 },
            },
            yAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: '#475569' } },
                splitLine: { lineStyle: { color: '#1f2937' } },
            },
            series: [
                {
                    name: '指標值',
                    type: 'line',
                    smooth: true,
                    symbol: 'none',
                    data: metricValues,
                },
                {
                    name: '門檻值',
                    type: 'line',
                    symbol: 'none',
                    data: thresholdValues,
                    lineStyle: { type: 'dashed' },
                },
                {
                    name: '基準值',
                    type: 'line',
                    symbol: 'none',
                    data: baselineValues,
                    lineStyle: { type: 'dotted' },
                },
                {
                    name: '觸發點',
                    type: 'scatter',
                    data: triggerPoints,
                    symbolSize: 12,
                    itemStyle: { color: '#f87171' },
                },
            ],
            ...(markAreas.length > 0 ? {
                markArea: {
                    data: markAreas,
                    label: {
                        color: '#cbd5f5',
                    },
                }
            } : {}),
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
            disabled={isSubmitting || selectedRuleIds.length === 0}
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

                    <div>
                        <label className="text-sm font-medium text-slate-300">選擇告警規則</label>
                        <select
                            value={selectedRuleIds[0] || ''}
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

                    <div>
                        <label className="flex items-center space-x-2 text-sm text-slate-300">
                            <input
                                type="checkbox"
                                checked={includeRecommendations}
                                onChange={event => setIncludeRecommendations(event.target.checked)}
                                className="h-4 w-4"
                            />
                            <span>產出策略調校建議</span>
                        </label>
                    </div>
                </div>

                <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4 space-y-4 xl:col-span-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-100">回放結果</h2>
                            <p className="text-sm text-slate-400">檢視觸發軌跡與誤報、漏報比率。</p>
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

                    {!results && (
                        <div className="flex flex-col items-center justify-center text-slate-500 py-12 space-y-3">
                            <Icon name="line-chart" className="w-10 h-10" />
                            <p className="text-sm">尚未執行回放或結果尚未產出。</p>
                            <p className="text-xs">選擇規則與時間範圍後點擊「執行回放」。</p>
                        </div>
                    )}

                    {results && activeRule && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                                <div className="bg-slate-900/60 border border-slate-800 rounded-md p-3">
                                    <div className="text-xs text-slate-400">觸發次數</div>
                                    <div className="text-2xl font-semibold text-slate-100">{activeRule.triggered_count}</div>
                                </div>
                                <div className="bg-slate-900/60 border border-slate-800 rounded-md p-3">
                                    <div className="text-xs text-slate-400">誤報率</div>
                                    <div className="text-2xl font-semibold text-slate-100">
                                        {falsePositiveRate !== null ? `${(falsePositiveRate * 100).toFixed(1)}%` : 'N/A'}
                                    </div>
                                    <div className="text-xs text-slate-500">誤報 {activeRule.false_positive_count} 次</div>
                                </div>
                                <div className="bg-slate-900/60 border border-slate-800 rounded-md p-3">
                                    <div className="text-xs text-slate-400">漏報率</div>
                                    <div className="text-2xl font-semibold text-slate-100">
                                        {falseNegativeRate !== null ? `${(falseNegativeRate * 100).toFixed(1)}%` : 'N/A'}
                                    </div>
                                    <div className="text-xs text-slate-500">漏報 {activeRule.false_negative_count} 次</div>
                                </div>
                                <div className="bg-slate-900/60 border border-slate-800 rounded-md p-3">
                                    <div className="text-xs text-slate-400">Precision / Recall</div>
                                    <div className="text-sm text-slate-100">
                                        P: {precision !== null ? precision.toFixed(2) : 'N/A'} | R: {recall !== null ? recall.toFixed(2) : 'N/A'}
                                    </div>
                                    {activeRule.suggested_threshold && (
                                        <div className="text-xs text-slate-500 mt-1">建議門檻 {activeRule.suggested_threshold}</div>
                                    )}
                                </div>
                            </div>

                            {chartOption ? (
                                <div className="h-80">
                                    <EChartsReact option={chartOption} />
                                </div>
                            ) : (
                                <div className="h-80 flex items-center justify-center text-slate-500">沒有可視化資料。</div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="bg-slate-900/60 border border-slate-800 rounded-md p-4 space-y-3">
                                    <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                                        <Icon name="activity" className="w-4 h-4" />
                                        <span>觸發詳情</span>
                                    </h3>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                        {activeRule.trigger_points.length === 0 && (
                                            <div className="text-sm text-slate-500">此規則在指定期間未觸發。</div>
                                        )}
                                        {activeRule.trigger_points.map(point => (
                                            <div key={`${point.timestamp}-${point.value}`} className="text-sm text-slate-300 border border-slate-800 rounded-md px-3 py-2">
                                                <div className="font-medium">{formatDisplayTime(point.timestamp)} · 值 {point.value}</div>
                                                <div className="text-xs text-slate-400">{point.condition_summary}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-slate-900/60 border border-slate-800 rounded-md p-4 space-y-3">
                                    <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                                        <Icon name="target" className="w-4 h-4" />
                                        <span>策略調校建議</span>
                                    </h3>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                        {activeRule.recommendations.length === 0 && (
                                            <div className="text-sm text-slate-500">沒有額外建議。</div>
                                        )}
                                        {activeRule.recommendations.map((recommendation, index) => (
                                            <div key={`${recommendation.type}-${index}`} className="border border-slate-800 rounded-md px-3 py-2">
                                                <div className="text-sm font-medium text-slate-200">{recommendation.title}</div>
                                                <div className="text-xs text-slate-400">{recommendation.description}</div>
                                                <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                                    {recommendation.suggested_threshold !== undefined && (
                                                        <span>建議門檻：{recommendation.suggested_threshold}</span>
                                                    )}
                                                    {recommendation.suggested_duration_minutes !== undefined && (
                                                        <span>建議持續：{recommendation.suggested_duration_minutes} 分鐘</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {results.batch_summary && (
                                <div className="bg-slate-900/60 border border-slate-800 rounded-md p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                                            <Icon name="layers" className="w-4 h-4" />
                                            <span>批次模擬摘要</span>
                                        </h3>
                                        <span className="text-xs text-slate-400">共 {results.batch_summary.total_rules} 條規則</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                        <div className="bg-slate-900/80 rounded-md p-3">
                                            <div className="text-xs text-slate-400">總觸發</div>
                                            <div className="text-xl text-slate-100">{results.batch_summary.total_triggers}</div>
                                        </div>
                                        <div className="bg-slate-900/80 rounded-md p-3">
                                            <div className="text-xs text-slate-400">平均誤報率</div>
                                            <div className="text-xl text-slate-100">
                                                {results.batch_summary.false_positive_rate !== null && results.batch_summary.false_positive_rate !== undefined
                                                    ? `${(results.batch_summary.false_positive_rate * 100).toFixed(1)}%`
                                                    : 'N/A'}
                                            </div>
                                        </div>
                                        <div className="bg-slate-900/80 rounded-md p-3">
                                            <div className="text-xs text-slate-400">平均漏報率</div>
                                            <div className="text-xl text-slate-100">
                                                {results.batch_summary.false_negative_rate !== null && results.batch_summary.false_negative_rate !== undefined
                                                    ? `${(results.batch_summary.false_negative_rate * 100).toFixed(1)}%`
                                                    : 'N/A'}
                                            </div>
                                        </div>
                                        <div className="bg-slate-900/80 rounded-md p-3">
                                            <div className="text-xs text-slate-400">平均 Precision / Recall</div>
                                            <div className="text-sm text-slate-100">
                                                P: {results.batch_summary.average_precision !== null && results.batch_summary.average_precision !== undefined ? results.batch_summary.average_precision.toFixed(2) : 'N/A'}
                                                {' '}| R: {results.batch_summary.average_recall !== null && results.batch_summary.average_recall !== undefined ? results.batch_summary.average_recall.toFixed(2) : 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                    {results.batch_summary.recommendations.length > 0 && (
                                        <div className="space-y-2">
                                            {results.batch_summary.recommendations.map((recommendation, index) => (
                                                <div key={`batch-rec-${index}`} className="text-xs text-slate-300">
                                                    • {recommendation.title} — {recommendation.description}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BacktestingPage;

