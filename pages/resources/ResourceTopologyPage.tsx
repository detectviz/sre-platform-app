
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import EChartsReact from '../../components/EChartsReact';
import { Resource, TopologyOptions } from '../../types';
import Icon from '../../components/Icon';
import StatusTag from '../../components/StatusTag';
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
        if (!options?.resources.status_colors) return {};
        return options.resources.status_colors.reduce((acc, curr) => {
            acc[curr.value] = curr.color;
            return acc;
        }, {} as Record<Resource['status'], string>);
    }, [options]);

    const statusDescriptors = options?.resources.statuses || [];
    const typeDescriptors = options?.resources.types || [];

    const typeLabelMap = useMemo(() => {
        return typeDescriptors.reduce((acc, curr) => {
            acc[curr.value] = curr.label;
            return acc;
        }, {} as Record<string, string>);
    }, [typeDescriptors]);

    const statusLabelMap = useMemo(() => {
        return statusDescriptors.reduce((acc, curr) => {
            acc[curr.value] = curr.label;
            return acc;
        }, {} as Record<Resource['status'], string>);
    }, [statusDescriptors]);

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

    const layoutOptions = topologyOptions?.layouts?.length
        ? topologyOptions.layouts
        : [
            { value: 'force', label: '力導向' },
            { value: 'circular', label: '環狀' },
        ];

    useEffect(() => {
        if (!layout && layoutOptions.length > 0) {
            setLayout(layoutOptions[0].value);
        }
    }, [layoutOptions, layout]);


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

    const resourceTypeOptions = useMemo(() => {
        const uniqueTypes = new Set<string>();
        topologyData.nodes.forEach(res => uniqueTypes.add(res.type));
        return [
            { value: 'all', label: '全部類型' },
            ...Array.from(uniqueTypes).map(value => ({ value, label: typeLabelMap[value] || value })),
        ];
    }, [topologyData.nodes, typeLabelMap]);

    const chartOption = useMemo(() => {
        const filteredNodesData = topologyData.nodes.filter(res => filterType === 'all' || res.type === filterType);
        const nodeIds = new Set(filteredNodesData.map(n => n.id));
        const filteredLinksData = topologyData.links.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));

        const nodes = filteredNodesData.map(res => ({
            id: res.id,
            name: res.name,
            symbolSize: 40,
            category: typeLabelMap[res.type] || res.type,
            itemStyle: {
                color: statusColorMap[res.status] || chartTheme.topology.edge,
                borderColor: chartTheme.topology.node_border,
                borderWidth: 2,
            },
            label: {
                show: true,
                position: 'bottom',
                color: chartTheme.topology.node_label,
            },
            tooltip: {
                formatter: () => {
                    const typeLabel = typeLabelMap[res.type] || res.type;
                    const statusLabel = statusLabelMap[res.status] || res.status;
                    const ownerLabel = res.owner || '—';
                    return `${res.name}<br/>類型：${typeLabel}<br/>狀態：${statusLabel}<br/>擁有者：${ownerLabel}`;
                }
            }
        }));

        const links = filteredLinksData.map(link => ({
            source: link.source,
            target: link.target,
            lineStyle: {
                color: chartTheme.topology.edge,
            }
        }));

        const categories = Array.from(new Set(filteredNodesData.map(res => typeLabelMap[res.type] || res.type))).map(name => ({ name }));
        const legendLabels = categories.map(category => category.name);

        return {
            tooltip: {},
            legend: [{
                data: legendLabels,
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
        
        const resource_id = contextMenu.nodeData.id;
        
        switch(action) {
            case 'details':
                navigate(`/resources/list/${resource_id}`);
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

    return (
        <div className="h-full flex flex-col">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="glass-card flex flex-wrap items-center gap-4 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-200" htmlFor="topology-layout-select">
                            佈局模式
                        </label>
                        <select
                            id="topology-layout-select"
                            value={layout}
                            onChange={e => setLayout(e.target.value)}
                            className="w-40 rounded-md border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-sm text-white"
                            aria-label="選擇拓撲佈局模式"
                        >
                            {layoutOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <Icon name="info" className="h-4 w-4 text-slate-400" title="選擇拓撲圖的佈局方式，如力導向或同心圓" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-200" htmlFor="topology-type-select">
                            篩選類型
                        </label>
                        <select
                            id="topology-type-select"
                            value={filterType}
                            onChange={e => setFilterType(e.target.value)}
                            className="w-44 rounded-md border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-sm text-white"
                            aria-label="依資源類型篩選節點"
                        >
                            {resourceTypeOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                        <Icon name="filter" className="h-4 w-4 text-slate-400" title="顯示指定類型的節點" />
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {statusDescriptors.map(descriptor => (
                        <StatusTag
                            key={descriptor.value}
                            label={descriptor.label}
                            className={descriptor.class_name}
                            dense
                            tooltip={`狀態：${descriptor.label}`}
                        />
                    ))}
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
