import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Icon from '../../components/Icon';
import EChartsReact from '../../components/EChartsReact';
import LogLevelPill from '../../components/LogLevelPill';
import JsonViewer from '../../components/JsonViewer';
import Toolbar, { ToolbarButton } from '../../components/Toolbar';
import PlaceholderModal from '../../components/PlaceholderModal';
import { LogEntry, LogLevel } from '../../types';
import api from '../../services/api';
import { exportToCsv } from '../../services/export';

const LogExplorerPage: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [query, setQuery] = useState('');
    const [timeRange, setTimeRange] = useState('15m');
    const [isLive, setIsLive] = useState(false);
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
    const liveIntervalRef = useRef<number | null>(null);
    const logContainerRef = useRef<HTMLDivElement>(null);
    const [isPlaceholderModalOpen, setIsPlaceholderModalOpen] = useState(false);
    const [modalFeatureName, setModalFeatureName] = useState('');

    const showPlaceholderModal = (featureName: string) => {
        setModalFeatureName(featureName);
        setIsPlaceholderModalOpen(true);
    };

    const fetchData = useCallback(() => {
        setIsLoading(true);
        setError(null);
        api.get<{ items: LogEntry[] }>('/logs', { params: { page: 1, page_size: 200, keyword: query } })
            .then(response => {
                setLogs(response.data.items);
            })
            .catch(() => {
                setError('無法獲取日誌數據。');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [query]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (isLive) {
            liveIntervalRef.current = window.setInterval(() => {
                const newLog: LogEntry = {
                    id: `log-live-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    level: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)] as LogLevel,
                    service: ['api-gateway', 'payment-service', 'auth-service'][Math.floor(Math.random() * 3)],
                    message: 'New live log entry generated',
                    details: { live: true, random: Math.random() }
                };
                setLogs(prev => [newLog, ...prev]);
            }, 2000);
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
    }, [isLive]);
    
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
        
        const sortedKeys = Object.keys(countsByLevel).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());

        return {
            timestamps: sortedKeys.map(key => new Date(key).toLocaleTimeString()),
            info: sortedKeys.map(key => countsByLevel[key].info),
            warning: sortedKeys.map(key => countsByLevel[key].warning),
            error: sortedKeys.map(key => countsByLevel[key].error),
        };
    }, [logs]);

    const histogramOption = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['Error', 'Warning', 'Info'], textStyle: { color: '#fff' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: histogramData.timestamps, axisLabel: { show: false } },
        yAxis: { type: 'value' },
        series: [
            { name: 'Error', type: 'bar', stack: 'total', data: histogramData.error, color: '#f87171' },
            { name: 'Warning', type: 'bar', stack: 'total', data: histogramData.warning, color: '#facc15' },
            { name: 'Info', type: 'bar', stack: 'total', data: histogramData.info, color: '#38bdf8' }
        ]
    };
    
    const toggleExpand = (id: string) => {
        setExpandedLogId(prevId => (prevId === id ? null : id));
    };

    const handleExport = () => {
        if (logs.length === 0) {
            alert("沒有可匯出的資料。");
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
        <>
            <div className="relative flex-grow">
                <Icon name="search" className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input type="text" placeholder='搜尋日誌... (例如: status:500 AND service:"payment-api")'
                       value={query} onChange={e => setQuery(e.target.value)}
                       className="w-full bg-slate-800/80 border border-slate-700 rounded-md pl-9 pr-4 py-1.5 text-sm" />
            </div>
            <div className="flex items-center space-x-1 bg-slate-800/80 border border-slate-700 rounded-md p-1 text-sm">
                {['15m', '1h', '6h', '24h'].map(t => (
                    <button 
                        key={t}
                        onClick={() => setTimeRange(t)}
                        className={`px-2 py-1 rounded ${timeRange === t ? 'bg-sky-600 text-white' : 'hover:bg-slate-700 text-slate-300'}`}
                    >
                        {t}
                    </button>
                ))}
            </div>
            <label className="flex items-center space-x-2 cursor-pointer">
                <span className={`text-sm font-medium ${isLive ? 'text-green-400' : 'text-slate-400'}`}>即時日誌</span>
                <div className="relative">
                    <input type="checkbox" checked={isLive} onChange={() => setIsLive(!isLive)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-green-600 peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </div>
            </label>
        </>
    );

    return (
        <div className="h-full flex flex-col space-y-4">
            <Toolbar 
                leftActions={leftActions}
                rightActions={<ToolbarButton icon="download" text="匯出報表" onClick={handleExport} />}
            />
            
            <div className="shrink-0 h-24">
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
            <PlaceholderModal
                isOpen={isPlaceholderModalOpen}
                onClose={() => setIsPlaceholderModalOpen(false)}
                featureName={modalFeatureName}
            />
        </div>
    );
};

export default LogExplorerPage;