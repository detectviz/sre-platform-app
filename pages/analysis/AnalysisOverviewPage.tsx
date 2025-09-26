import React, { useState } from 'react';
import EChartsReact from '../../components/EChartsReact';
import Icon from '../../components/Icon';
import Toolbar, { ToolbarButton } from '../../components/Toolbar';
import PlaceholderModal from '../../components/PlaceholderModal';
import { exportToCsv } from '../../services/export';

const AnalysisOverviewPage: React.FC = () => {
    const [isPlaceholderModalOpen, setIsPlaceholderModalOpen] = useState(false);
    const [modalFeatureName, setModalFeatureName] = useState('');

    const showPlaceholderModal = (featureName: string) => {
        setModalFeatureName(featureName);
        setIsPlaceholderModalOpen(true);
    };

    // Generate random data for the health score chart
    const healthScoreData = () => {
        let data = [];
        let now = new Date();
        for (let i = 60; i > 0; i--) {
            let time = new Date(now.getTime() - i * 60000); // 60 minutes of data
            data.push({
                name: time.toString(),
                value: [
                    time,
                    Math.round((95 + Math.random() * 5 - (i < 10 ? Math.random() * 3 : 0)) * 100) / 100
                ]
            });
        }
        return data;
    };

    const healthScoreOption = {
        tooltip: { trigger: 'axis', formatter: (params: any) => `${new Date(params[0].value[0]).toLocaleTimeString()}<br/>Score: ${params[0].value[1]}` },
        xAxis: { type: 'time', splitLine: { show: false }, axisLine: { lineStyle: { color: '#888' } } },
        yAxis: { type: 'value', boundaryGap: [0, '10%'], axisLine: { lineStyle: { color: '#888' } }, splitLine: { lineStyle: { color: '#374151' } } },
        series: [{
            name: 'Health Score',
            type: 'line',
            showSymbol: false,
            data: healthScoreData(),
            lineStyle: { color: '#38bdf8' },
            areaStyle: {
                color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgba(56, 189, 248, 0.3)'
                }, {
                    offset: 1,
                    color: 'rgba(56, 189, 248, 0)'
                }])
            }
        }],
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    };

    const eventCorrelationOption = {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c}'
        },
        legend: {
            data: ['DB Alerts', 'API Errors', 'Infra Changes'],
            textStyle: { color: '#fff' }
        },
        series: [{
            name: 'Event Correlation',
            type: 'graph',
            layout: 'force',
            data: [
                { id: '0', name: 'High DB CPU', value: 10, symbolSize: 50, category: 0 },
                { id: '1', name: 'API Latency Spike', value: 8, symbolSize: 40, category: 1 },
                { id: '2', name: 'Deployment', value: 5, symbolSize: 30, category: 2 },
                { id: '3', name: '5xx Errors', value: 9, symbolSize: 45, category: 1 },
                { id: '4', name: 'Low Disk Space', value: 6, symbolSize: 35, category: 0 },
            ],
            links: [
                { source: '0', target: '1' },
                { source: '1', target: '3' },
                { source: '2', target: '1' },
                { source: '0', target: '4' },
            ],
            categories: [
                { name: 'DB Alerts' },
                { name: 'API Errors' },
                { name: 'Infra Changes' },
            ],
            roam: true,
            label: { show: true },
            force: { repulsion: 200 }
        }],
        color: ['#dc2626', '#f97316', '#10b981']
    };

    const handleExport = () => {
        const dataToExport = [
            { metric: 'System Health Score', value: '98.5', details: 'System is currently healthy.' },
            { metric: 'High DB CPU', value: '10 events', details: 'Correlated with API Latency Spike' },
            { metric: 'API Latency Spike', value: '8 events', details: 'Correlated with High DB CPU, Deployment, 5xx Errors' },
        ];
        exportToCsv({
            filename: `analysis-overview-${new Date().toISOString().split('T')[0]}.csv`,
            data: dataToExport,
        });
    };
    const handleLogSearch = () => showPlaceholderModal('日誌搜尋');

    return (
        <div className="space-y-6">
            <Toolbar rightActions={<ToolbarButton icon="download" text="匯出報表" onClick={handleExport} />} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center"><Icon name="line-chart" className="w-5 h-5 mr-2 text-sky-400" /> System Health Score (Last Hour)</h2>
                    <EChartsReact option={healthScoreOption} style={{ height: '300px' }} />
                </div>
                <div className="glass-card rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center"><Icon name="share-2" className="w-5 h-5 mr-2 text-green-400" /> Event Correlation Analysis</h2>
                    <EChartsReact option={eventCorrelationOption} style={{ height: '300px' }} />
                </div>
            </div>

             <div className="glass-card rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center"><Icon name="search" className="w-5 h-5 mr-2 text-yellow-400" /> Log Explorer</h2>
                <div className="flex space-x-2">
                    <input type="text" placeholder="Search logs... (e.g., error status:500)" className="flex-grow bg-slate-800/80 border border-slate-700 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    <button className="flex items-center text-sm text-white bg-slate-600 hover:bg-slate-700 px-4 py-2 rounded-md">
                        Last 15 minutes <Icon name="chevron-down" className="w-4 h-4 ml-2"/>
                    </button>
                    <button onClick={handleLogSearch} className="flex items-center text-sm text-white bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded-md">
                        Search
                    </button>
                </div>
                 <div className="mt-4 h-64 bg-slate-900/70 rounded-md p-4 font-mono text-xs text-slate-300 overflow-y-auto">
                    <p><span className="text-cyan-400">[2025-09-19 10:31:05]</span> <span className="text-red-400">[ERROR]</span> 500 Internal Server Error on /api/payment</p>
                    <p><span className="text-cyan-400">[2025-09-19 10:31:02]</span> <span className="text-yellow-400">[WARN]</span> DB connection pool nearing capacity</p>
                    <p><span className="text-cyan-400">[2025-09-19 10:30:58]</span> <span className="text-green-400">[INFO]</span> User 'admin' logged in successfully</p>
                     <p><span className="text-cyan-400">[2025-09-19 10:30:55]</span> <span className="text-red-400">[ERROR]</span> Failed to process message from queue: payment-queue</p>
                     <p><span className="text-cyan-400">[2025-09-19 10:30:51]</span> <span className="text-green-400">[INFO]</span> New deployment 'v2.1.5' started for service 'api-service'</p>
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

export default AnalysisOverviewPage;