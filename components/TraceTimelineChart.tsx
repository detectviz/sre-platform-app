
import React, { useMemo } from 'react';
import EChartsReact from './EChartsReact';
import { Span } from '../types';

interface TraceTimelineChartProps {
  spans: Span[];
  selectedSpanId: string | null;
  onSpanSelect: (spanId: string) => void;
}

const TraceTimelineChart: React.FC<TraceTimelineChartProps> = ({ spans, selectedSpanId, onSpanSelect }) => {
    const { chartOption, yAxisData } = useMemo(() => {
        if (!spans || spans.length === 0) return { chartOption: {}, yAxisData: [] };

        const sortedSpans = [...spans].sort((a, b) => a.startTime - b.startTime);
        const traceStartTime = sortedSpans[0].startTime;

        const colors = ['#38bdf8', '#a78bfa', '#34d399', '#f87171', '#fbbf24', '#60a5fa'];
        const serviceColorMap = new Map<string, string>();
        let colorIndex = 0;
        const getServiceColor = (serviceName: string): string => {
            if (!serviceColorMap.has(serviceName)) {
                serviceColorMap.set(serviceName, colors[colorIndex % colors.length]);
                colorIndex++;
            }
            return serviceColorMap.get(serviceName)!;
        };

        const spanTree = new Map<string, Span[]>();
        sortedSpans.forEach(span => {
            const parentId = span.parentId || 'root';
            if (!spanTree.has(parentId)) {
                spanTree.set(parentId, []);
            }
            spanTree.get(parentId)!.push(span);
        });

        const flattenedSpans: { span: Span, depth: number }[] = [];
        const traverse = (parentId: string, depth: number) => {
            const children = spanTree.get(parentId);
            if (children) {
                children.sort((a,b) => a.startTime - b.startTime).forEach(child => {
                    flattenedSpans.push({ span: child, depth });
                    traverse(child.spanId, depth + 1);
                });
            }
        };
        traverse('root', 0);
        
        const yAxisData = flattenedSpans.map(item => ' '.repeat(item.depth * 4) + item.span.operationName);

        const seriesData = flattenedSpans.map(item => ({
            name: item.span.spanId,
            value: [
                item.span.startTime - traceStartTime, // Transparent offset
                item.span.duration, // Actual duration
            ],
            itemStyle: {
                color: item.span.status === 'error' ? '#ef4444' : getServiceColor(item.span.serviceName),
                borderColor: selectedSpanId === item.span.spanId ? '#ffffff' : 'transparent',
                borderWidth: 2,
            },
        }));

        const chartOption = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: (params: any[]) => {
                    if (!params || params.length === 0) {
                        return '';
                    }
                    const spanIndex = params[0].dataIndex;
                    const { span } = flattenedSpans[spanIndex];
                    return `
                        <b>${span.operationName}</b><br/>
                        Service: ${span.serviceName}<br/>
                        Duration: ${span.duration}ms<br/>
                        Status: ${span.status}
                    `;
                },
            },
            grid: { left: '2%', right: '4%', top: '5%', bottom: '10%', containLabel: true },
            xAxis: { 
                type: 'value',
                axisLabel: { formatter: '{value} ms' }
            },
            yAxis: {
                type: 'category',
                data: yAxisData,
                axisLabel: {
                    fontFamily: 'monospace',
                    fontSize: 12
                }
            },
            series: [
                {
                    name: 'Offset',
                    type: 'bar',
                    stack: 'total',
                    itemStyle: { color: 'transparent' },
                    emphasis: { itemStyle: { color: 'transparent' } },
                    data: seriesData.map(d => d.value[0]),
                },
                {
                    name: 'Duration',
                    type: 'bar',
                    stack: 'total',
                    label: { show: true, position: 'right', formatter: (params: any) => `${params.value}ms` },
                    data: seriesData,
                },
            ],
        };

        return { chartOption, yAxisData };
    }, [spans, selectedSpanId]);
    
    const echartsEvents = useMemo(() => ({
        'click': (params: any) => {
            if (params.seriesName === 'Duration' && params.data.name) {
                onSpanSelect(params.data.name);
            }
        }
    }), [onSpanSelect]);


    return <EChartsReact option={chartOption} style={{ height: '400px' }} onEvents={echartsEvents}/>;
};

export default TraceTimelineChart;