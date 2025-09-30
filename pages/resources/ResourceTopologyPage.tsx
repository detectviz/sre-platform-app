
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import EChartsReact from '../../components/EChartsReact';
import { Resource, TopologyOptions } from '../../types';
import Icon from '../../components/Icon';
import api from '../../services/api';
import { useOptions } from '../../contexts/OptionsContext';
import { useChartTheme } from '../../contexts/ChartThemeContext';

interface TopologyData {
    nodes: Resource[];
    links: { source: string; target: string }[];
}

const ResourceTopologyPage: React.FC = () => {
    const [topologyData, setTopologyData] = useState<TopologyData>({ nodes: [], links: [] });
    const { options, isLoading: isLoadingOptions } = useOptions();
    const topologyOptions = options?.topology;

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [layout, setLayout] = useState('force');
    const [filterType, setFilterType] = useState('all');
    const navigate = useNavigate();

    const { theme: chartTheme } = useChartTheme();

    const [contextMenu, setContextMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
        nodeData: any | null;
    }>({ visible: false, x: 0, y: 0, nodeData: null });

    const contextMenuRef = useRef<HTMLDivElement>(null);
    
    const statusColorMap = useMemo(() => {
        if (!options?.resources.statusColors) return {};
        return options.resources.statusColors.reduce((acc, curr) => {
            acc[curr.value] = curr.color;
            return acc;
        }, {} as Record<Resource['status'], string>);
    }, [options]);

    const fetchTopology = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get<TopologyData>('/resources/topology');
            setTopologyData(data);
        } catch (err) {
            setError('無法獲取拓撲資料。');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTopology();
    }, [fetchTopology]);

    useEffect(() => {
        if (topologyOptions?.layouts.length && !layout) {
            setLayout(topologyOptions.layouts[0].value);
        }
    }, [topologyOptions, layout]);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contextMenu.visible && contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
                setContextMenu(prev => ({ ...prev, visible: false }));
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [contextMenu.visible]);

    const chartOption = useMemo(() => {
        const filteredNodesData = topologyData.nodes.filter(res => filterType === 'all' || res.type === filterType);
        const nodeIds = new Set(filteredNodesData.map(n => n.id));
        const filteredLinksData = topologyData.links.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));

        const nodes = filteredNodesData.map(res => ({
            id: res.id,
            name: res.name,
            symbolSize: 40,
            category: res.type,
            itemStyle: {
                color: statusColorMap[res.status] || chartTheme.topology.edge,
                borderColor: chartTheme.topology.nodeBorder,
                borderWidth: 2,
            },
            label: {
                show: true,
                position: 'bottom',
                color: chartTheme.topology.nodeLabel,
            },
            tooltip: {
                formatter: `{b}<br/>Type: ${res.type}<br/>Status: ${res.status}<br/>Owner: ${res.owner}`
            }
        }));

        const links = filteredLinksData.map(link => ({
            source: link.source,
            target: link.target,
            lineStyle: {
                color: chartTheme.topology.edge,
            }
        }));

        const categories = Array.from(new Set(filteredNodesData.map(res => res.type))).map(type => ({ name: type }));

        return {
            tooltip: {},
            legend: [{
                data: categories.map(a => a.name),
                textStyle: { color: chartTheme.text.primary },
                orient: 'vertical',
                left: 'left',
                top: 'center',
                itemGap: 15,
            }],
            animationDurationUpdate: 1500,
            animationEasingUpdate: 'quinticInOut',
            series: [{
                type: 'graph',
                layout: layout,
                data: nodes,
                links: links,
                categories: categories,
                roam: true,
                label: {
                    position: 'right',
                    formatter: '{b}'
                },
                lineStyle: {
                    color: 'source',
                    curveness: 0.3
                },
                emphasis: {
                    focus: 'adjacency',
                    lineStyle: {
                        width: 10
                    }
                },
                force: {
                    repulsion: 100,
                    edgeLength: 80,
                }
            }]
        };
    }, [topologyData, filterType, layout, statusColorMap, chartTheme]);

    const echartsEvents = {
        contextmenu: (params: any) => {
            params.event.event.preventDefault();
            if (params.dataType === 'node') {
                setContextMenu({
                    visible: true,
                    x: params.event.offsetX,
                    y: params.event.offsetY,
                    nodeData: params.data,
                });
            } else if (contextMenu.visible) {
                setContextMenu(prev => ({ ...prev, visible: false }));
            }
        },
        click: () => {
            if (contextMenu.visible) {
                setContextMenu(prev => ({ ...prev, visible: false }));
            }
        }
    };

    const handleMenuAction = (action: 'details' | 'incidents' | 'automation') => {
        if (!contextMenu.nodeData) return;
        
        const resourceId = contextMenu.nodeData.id;
        
        switch(action) {
            case 'details':
                navigate(`/resources/list/${resourceId}`);
                break;
            case 'incidents':
                navigate('/incidents');
                break;
            case 'automation':
                navigate('/automation');
                break;
        }
        setContextMenu(prev => ({ ...prev, visible: false }));
    };

    const resourceTypes = ['all', ...Array.from(new Set(topologyData.nodes.map(res => res.type)))];

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2 p-2 glass-card rounded-lg">
                    <label className="text-sm font-medium flex items-center">
                        版型
                        <span className="ml-1 text-slate-400 cursor-help" title="選擇拓撲圖的布局方式，如力導向圖、圓形布局等">
                            <Icon name="info" className="w-3.5 h-3.5" />
                        </span>
                        :
                    </label>
                    <select value={layout} onChange={e => setLayout(e.target.value)} className="bg-slate-800 border-slate-700 rounded-md px-2 py-1 text-sm">
                        {topologyOptions?.layouts.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <label className="text-sm font-medium ml-4 flex items-center">
                        類型
                        <span className="ml-1 text-slate-400 cursor-help" title="依資源類型篩選顯示的節點">
                            <Icon name="info" className="w-3.5 h-3.5" />
                        </span>
                        :
                    </label>
                    <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-slate-800 border-slate-700 rounded-md px-2 py-1 text-sm">
                        {resourceTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex-grow glass-card rounded-xl relative">
                {isLoading || isLoadingOptions ? (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        <Icon name="loader-circle" className="w-8 h-8 animate-spin mr-2" /> 載入拓撲資料中...
                    </div>
                ) : error ? (
                     <div className="flex flex-col items-center justify-center h-full text-red-400">
                        <Icon name="alert-circle" className="w-12 h-12 mb-4" />
                        <h2 className="text-xl font-bold">{error}</h2>
                        <button onClick={fetchTopology} className="mt-4 px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">
                            重試
                        </button>
                    </div>
                ) : (
                    <EChartsReact option={chartOption} onEvents={echartsEvents} />
                )}
                 {contextMenu.visible && (
                    <div
                        ref={contextMenuRef}
                        className="absolute z-50 glass-card rounded-lg p-2 w-52 shadow-2xl animate-fade-in-down"
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                    >
                        <div className="p-2 border-b border-slate-700/50 mb-1">
                            <p className="font-bold text-white truncate">{contextMenu.nodeData?.name}</p>
                            <p className="text-xs text-slate-400">快捷操作</p>
                        </div>
                        <ul className="text-sm text-slate-300">
                            <li onClick={() => handleMenuAction('details')} className="flex items-center px-3 py-2 rounded-md hover:bg-slate-700/70 cursor-pointer">
                                <Icon name="eye" className="w-4 h-4 mr-3" /> 查看資源詳情
                            </li>
                            <li onClick={() => handleMenuAction('incidents')} className="flex items-center px-3 py-2 rounded-md hover:bg-slate-700/70 cursor-pointer">
                                <Icon name="shield-alert" className="w-4 h-4 mr-3" /> 檢視相關事件
                            </li>
                            <li onClick={() => handleMenuAction('automation')} className="flex items-center px-3 py-2 rounded-md hover:bg-slate-700/70 cursor-pointer">
                                <Icon name="bot" className="w-4 h-4 mr-3" /> 執行腳本
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResourceTopologyPage;
