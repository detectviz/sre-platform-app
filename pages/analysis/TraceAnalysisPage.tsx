import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Trace, Span } from '../../types';
import Icon from '../../components/Icon';
import TraceTimelineChart from '../../components/TraceTimelineChart';
import SpanDetail from '../../components/SpanDetail';
import Toolbar, { ToolbarButton } from '../../components/Toolbar';
import PlaceholderModal from '../../components/PlaceholderModal';
import api from '../../services/api';

const TraceAnalysisPage: React.FC = () => {
    const [traces, setTraces] = useState<Trace[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
    const [selectedSpanId, setSelectedSpanId] = useState<string | null>(null);
    const [traceSearchTerm, setTraceSearchTerm] = useState('');
    const [isPlaceholderModalOpen, setIsPlaceholderModalOpen] = useState(false);
    const [modalFeatureName, setModalFeatureName] = useState('');

    const showPlaceholderModal = (featureName: string) => {
        setModalFeatureName(featureName);
        setIsPlaceholderModalOpen(true);
    };
    
    const fetchTraces = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get<Trace[]>('/traces', { params: { keyword: traceSearchTerm } });
            setTraces(data);
        } catch (err) {
            setError("無法獲取追蹤列表。");
        } finally {
            setIsLoading(false);
        }
    }, [traceSearchTerm]);
    
    useEffect(() => {
        fetchTraces();
    }, [fetchTraces]);

    const selectedTrace = useMemo(() => {
        return traces.find(t => t.traceId === selectedTraceId);
    }, [traces, selectedTraceId]);

    const selectedSpan = useMemo(() => {
        return selectedTrace?.spans.find(s => s.spanId === selectedSpanId);
    }, [selectedTrace, selectedSpanId]);

    const handleTraceSelect = (traceId: string) => {
        setSelectedTraceId(traceId);
        setSelectedSpanId(null); // Reset selected span when trace changes
    };
    
    const handleSpanSelect = (spanId: string) => {
        setSelectedSpanId(prevId => (prevId === spanId ? null : spanId));
    }
    
    const handleExport = () => showPlaceholderModal('匯出追蹤分析報表');

    const leftActions = (
        <div className="relative">
            <Icon name="search" className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
                type="text" 
                placeholder='依服務、操作名稱搜尋...' 
                value={traceSearchTerm}
                onChange={e => setTraceSearchTerm(e.target.value)}
                className="w-80 bg-slate-800/80 border border-slate-700 rounded-md pl-9 pr-4 py-1.5 text-sm"
            />
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            <Toolbar 
                leftActions={leftActions} 
                rightActions={<ToolbarButton icon="download" text="匯出報表" onClick={handleExport} />} 
            />
            <div className="flex-grow flex space-x-4 mt-4">
                {/* Left Panel: Trace List */}
                <div className="w-1/3 flex flex-col">
                    <div className="h-full glass-card rounded-xl overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full text-slate-400">
                                <Icon name="loader-circle" className="w-6 h-6 animate-spin mr-2" /> 載入中...
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center h-full text-red-400">{error}</div>
                        ) : (
                            traces.map(trace => (
                                <div key={trace.traceId} 
                                     onClick={() => handleTraceSelect(trace.traceId)}
                                     className={`p-3 cursor-pointer border-l-4 hover:bg-slate-800/50
                                        ${selectedTraceId === trace.traceId ? 'bg-slate-800/50' : ''}
                                        ${selectedTraceId === trace.traceId ? (trace.errorCount > 0 ? 'border-red-500' : 'border-sky-500') : (trace.errorCount > 0 ? 'border-red-500/50' : 'border-transparent')}
                                     `}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-white truncate">{trace.root.serviceName}: {trace.root.operationName}</p>
                                            <p className="text-xs text-slate-400">{trace.traceId}</p>
                                        </div>
                                        <span className="text-sm font-semibold text-white">{trace.duration.toFixed(2)}ms</span>
                                    </div>
                                    <div className="flex justify-between items-end mt-2">
                                        <div className="text-xs text-slate-400">
                                            <span>{trace.spans.length} Spans</span> &bull; 
                                            <span> {trace.services.length} Services</span>
                                            {trace.errorCount > 0 && <span className="ml-2 text-red-400">{trace.errorCount} Errors</span>}
                                        </div>
                                        <span className="text-xs text-slate-500">{new Date(trace.startTime).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Panel: Trace Detail */}
                <div className="w-2/3 flex flex-col">
                    <div className="h-full glass-card rounded-xl p-4 overflow-y-auto">
                        {selectedTrace ? (
                            <div>
                                <h2 className="text-xl font-bold mb-2">Trace Details</h2>
                                <p className="text-xs text-slate-400 font-mono mb-4">{selectedTrace.traceId}</p>
                                <TraceTimelineChart 
                                    spans={selectedTrace.spans} 
                                    selectedSpanId={selectedSpanId}
                                    onSpanSelect={handleSpanSelect}
                                />
                                 <div className="mt-4">
                                    <SpanDetail span={selectedSpan || null} />
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-500">
                                <p>從左側列表中選擇一個追蹤以查看詳細資訊</p>
                            </div>
                        )}
                    </div>
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

export default TraceAnalysisPage;