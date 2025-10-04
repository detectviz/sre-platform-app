import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../../components/Icon';
import EChartsReact from '../../components/EChartsReact';
import LogLevelPill from '../../components/LogLevelPill';
import JsonViewer from '../../components/JsonViewer';
import Toolbar, { ToolbarButton } from '../../components/Toolbar';
import { LogEntry, LogLevel, LogAnalysis, LogExplorerFilters } from '../../types';
import api from '../../services/api';
import { exportToCsv } from '../../services/export';
import { showToast } from '../../services/toast';
import LogAnalysisModal from '../../components/LogAnalysisModal';
import { useOptions } from '../../contexts/OptionsContext';
import UnifiedSearchModal from '../../components/UnifiedSearchModal';
import { useChartTheme } from '../../contexts/ChartThemeContext';
import { useLogOptions } from '../../hooks/useLogOptions';

type SeriesMeta = Record<'error' | 'warning' | 'info', { label: string; color: string }>;

const LogExplorerPage: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { options, isLoading: isLoadingOptions } = useOptions();
    const { timeRangeOptions } = useLogOptions();

    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const queryFromUrl = params.get('q');

    const [filters, setFilters] = useState<LogExplorerFilters>({
        keyword: queryFromUrl || '',
        time_range: '15m',
    });

    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [isLive, setIsLive] = useState(false);
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
    const liveIntervalRef = useRef<number | null>(null);
    const logContainerRef = useRef<HTMLDivElement>(null);

    // New state for AI Log Analysis
    const [isLogAnalysisModalOpen, setIsLogAnalysisModalOpen] = useState(false);
    const [logAnalysisReport, setLogAnalysisReport] = useState<LogAnalysis | null>(null);
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

    const { theme: chartTheme } = useChartTheme();

    const seriesMeta = useMemo<SeriesMeta>(() => ({
        error: { label: '錯誤', color: chartTheme.log_levels?.error ?? '#ef4444' },
        warning: { label: '警告', color: chartTheme.log_levels?.warning ?? '#facc15' },
        info: { label: '資訊', color: chartTheme.log_levels?.info ?? '#3b82f6' },
    }), [chartTheme.log_levels]);


    const fetchData = useCallback((isLiveUpdate = false) => {
        if (!isLiveUpdate) setIsLoading(true);
        setError(null);
        api.get<{ items: LogEntry[] }>('/logs', { params: { page: 1, page_size: isLiveUpdate ? 5 : 200, ...filters } })
            .then(response => {
                if (isLiveUpdate) {
                    setLogs(prev => [...response.data.items, ...prev].slice(0, 200));
                } else {
                    setLogs(response.data.items);
                }
            })
            .catch(() => {
                if (!isLiveUpdate) {
                    setError('無法獲取日誌數據。');
                }
            })
            .finally(() => {
                if (!isLiveUpdate) setIsLoading(false);
            });
    }, [filters]);

    useEffect(() => {
        // Initial fetch
        if (!isLive) {
            fetchData();
        }
    }, [fetchData, isLive]);

    useEffect(() => {
        if (isLive) {
            liveIntervalRef.current = window.setInterval(() => {
                fetchData(true);
            }, 5000);
        } else {
            if (liveIntervalRef.current) {
                clearInterval(liveIntervalRef.current);
            }
        }
        return () => {
            if (liveIntervalRef.current) {
                clearInterval(liveIntervalRef.current);
            }
        };
    }, [isLive, fetchData]);

    // The histogram is now calculated from the fetched logs.
    const histogramData = useMemo(() => {
        const countsByLevel: Record<string, Record<LogLevel, number>> = {};
        logs.forEach(log => {
            const date = new Date(log.timestamp);
            const minuteKey = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()).toISOString();
            if (!countsByLevel[minuteKey]) {
                countsByLevel[minuteKey] = { info: 0, warning: 0, error: 0, debug: 0 };
            }
            countsByLevel[minuteKey][log.level]++;
        });

        const sortedKeys = Object.keys(countsByLevel).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

        return {
            timestamps: sortedKeys.map(key => new Date(key).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })),
            info: sortedKeys.map(key => countsByLevel[key].info),
            warning: sortedKeys.map(key => countsByLevel[key].warning),
            error: sortedKeys.map(key => countsByLevel[key].error),
        };
    }, [logs]);

    const histogramOption = useMemo(() => ({
        tooltip: {
            trigger: 'axis',
            formatter: (params: any[]) => {
                if (!params?.length) {
                    return '';
                }
                const [first] = params;
                const header = `<div class="font-semibold mb-1">${first.axisValueLabel}</div>`;
                const rows = params
                    .map(series => {
                        return `<div style="display:flex;justify-content:space-between;gap:12px;">
                            <span>${series.marker} ${series.seriesName}</span>
                            <span>${series.data}</span>
                        </div>`;
                    })
                    .join('');
                return `${header}${rows}`;
            },
        },
        legend: { data: Object.values(seriesMeta).map(item => item.label), textStyle: { color: chartTheme.text.primary } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
            type: 'category',
            data: histogramData.timestamps,
            axisLabel: { show: false },
            axisLine: { lineStyle: { color: chartTheme.grid.axis } },
        },
        yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: chartTheme.grid.axis } },
            splitLine: { lineStyle: { color: chartTheme.grid.split_line } },
        },
        series: [
            { name: seriesMeta.error.label, type: 'bar', stack: 'total', data: histogramData.error, color: seriesMeta.error.color },
            { name: seriesMeta.warning.label, type: 'bar', stack: 'total', data: histogramData.warning, color: seriesMeta.warning.color },
            { name: seriesMeta.info.label, type: 'bar', stack: 'total', data: histogramData.info, color: seriesMeta.info.color }
        ]
    }), [chartTheme, histogramData, seriesMeta]);

    const toggleExpand = (id: string) => {
        setExpandedLogId(prevId => (prevId === id ? null : id));
    };

    const handleRunLogAnalysis = async () => {
        setIsLogAnalysisModalOpen(true);
        setIsAnalysisLoading(true);
        setLogAnalysisReport(null);
        try {
            const { data } = await api.post<LogAnalysis>('/ai/logs/summarize', { query: filters.keyword });
            setLogAnalysisReport(data);
        } catch (err) {
            console.error(err);
            // In a real app, might show an error inside the modal by setting a report string
            setLogAnalysisReport(null);
        } finally {
            setIsAnalysisLoading(false);
        }
    };

    const handleExport = () => {
        if (logs.length === 0) {
            showToast('沒有可匯出的資料。', 'warning');
            return;
        }
        exportToCsv({
            filename: `logs-${new Date().toISOString().split('T')[0]}.csv`,
            headers: ['id', 'timestamp', 'level', 'service', 'message'],
            data: logs.map(log => ({
                id: log.id,
                timestamp: log.timestamp,
                level: log.level,
                service: log.service,
                message: log.message,
            })),
        });
    };

    const leftActions = (
        <ToolbarButton icon="search" text="搜尋和篩選" onClick={() => setIsSearchModalOpen(true)} />
    );

    const rightActions = (
        <>
            <label className="flex items-center space-x-2 cursor-pointer">
                <span className={`text-sm font-medium ${isLive ? 'text-green-400' : 'text-slate-400'}`}>即時日誌</span>
                <div className="relative">
                    <input type="checkbox" checked={isLive} onChange={() => setIsLive(!isLive)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-green-600 peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </div>
            </label>
            <ToolbarButton icon="brain-circuit" text="AI 總結" ai onClick={handleRunLogAnalysis} disabled={isLoading} />
            <ToolbarButton icon="download" text="匯出報表" onClick={handleExport} />
        </>
    );

    return (
        <div className="h-full flex flex-col space-y-4">
            <Toolbar
                leftActions={leftActions}
                rightActions={rightActions}
            />

            {/* 時間範圍快速選擇 */}
            <div className="shrink-0">
                <div className="flex flex-wrap gap-2 p-2">
                    {timeRangeOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setFilters(prev => ({ ...prev, time_range: option.value }))}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filters.time_range === option.value
                                ? 'bg-sky-600 text-white'
                                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="shrink-0">
                <div className="flex items-center justify-between px-2 py-1">
                    <p className="text-xs text-slate-400">圖表顏色代表不同的日誌等級與事件數。</p>
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                        {Object.values(seriesMeta).map(meta => (
                            <div key={meta.label} className="flex items-center gap-2">
                                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                                <span>{meta.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="shrink-0 h-44">
                <EChartsReact option={histogramOption} />
            </div>

            <div className="flex-grow glass-card rounded-xl overflow-hidden flex flex-col">
                <div className="grid grid-cols-12 px-4 py-2 text-xs text-slate-400 font-semibold border-b border-slate-800 shrink-0">
                    <div className="col-span-2">時間戳</div>
                    <div className="col-span-1">級別</div>
                    <div className="col-span-2">服務</div>
                    <div className="col-span-7">訊息</div>
                </div>
                <div ref={logContainerRef} className="flex-grow overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full text-slate-400">
                            <Icon name="loader-circle" className="w-6 h-6 animate-spin mr-2" /> 載入日誌中...
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full text-red-400">
                            <Icon name="alert-circle" className="w-10 h-10 mb-2" />
                            <p className="font-semibold">{error}</p>
                        </div>
                    ) : (
                        logs.map(log => {
                            const isExpanded = expandedLogId === log.id;
                            const levelColor = log.level === 'error' ? 'border-red-500' : log.level === 'warning' ? 'border-yellow-500' : 'border-sky-500';
                            return (
                                <div key={log.id} className={`border-l-4 ${isExpanded ? levelColor : 'border-transparent'}`}>
                                    <div onClick={() => toggleExpand(log.id)}
                                        className={`grid grid-cols-12 px-4 py-2 text-sm font-mono cursor-pointer hover:bg-slate-800/50 ${isExpanded ? 'bg-slate-800/50' : ''}`}>
                                        <div className="col-span-2 text-slate-400">{new Date(log.timestamp).toLocaleString()}</div>
                                        <div className="col-span-1"><LogLevelPill level={log.level} /></div>
                                        <div className="col-span-2 text-purple-300">{log.service}</div>
                                        <div className="col-span-7 text-slate-200 truncate">{log.message}</div>
                                    </div>
                                    {isExpanded && <JsonViewer data={log.details} />}
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
            <LogAnalysisModal
                isOpen={isLogAnalysisModalOpen}
                onClose={() => setIsLogAnalysisModalOpen(false)}
                report={logAnalysisReport}
                isLoading={isAnalysisLoading}
            />
            <UnifiedSearchModal
                page="logs"
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onSearch={(newFilters) => {
                    setFilters(newFilters as LogExplorerFilters);
                    setIsSearchModalOpen(false);
                    setIsLive(false);
                }}
                initialFilters={filters}
            />
        </div>
    );
};

export default LogExplorerPage;