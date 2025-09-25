import React, { useState } from 'react';
import EChartsReact from '../../components/EChartsReact';
import Icon from '../../components/Icon';
import Toolbar, { ToolbarButton } from '../../components/Toolbar';
import Dropdown from '../../components/Dropdown';
import PlaceholderModal from '../../components/PlaceholderModal';

// Mock data generation
const generateTrendData = (base: number, trend: number, variance: number, historicalPoints = 60, forecastPoints = 30) => {
    const historical: [string, number][] = [];
    let lastValue = base;
    for (let i = historicalPoints; i > 0; i--) {
        const time = new Date(Date.now() - i * 24 * 3600 * 1000).toISOString();
        lastValue = Math.max(0, Math.min(100, lastValue + (Math.random() - 0.5) * variance));
        historical.push([time, Math.round(lastValue * 10) / 10]);
    }

    const forecast: [string, number][] = [[historical[historical.length - 1][0], historical[historical.length - 1][1]]];
    let forecastValue = lastValue;
    for (let i = 1; i < forecastPoints; i++) {
        const time = new Date(Date.now() + i * 24 * 3600 * 1000).toISOString();
        forecastValue = Math.max(0, Math.min(100, forecastValue + trend + (Math.random() - 0.5) * variance * 1.5));
        forecast.push([time, Math.round(forecastValue * 10) / 10]);
    }

    return { historical, forecast };
};

const MOCK_TRENDS = {
    cpu: generateTrendData(45, 0.5, 5),
    memory: generateTrendData(60, 0.2, 3),
    storage: generateTrendData(70, 0.1, 1),
};

const MOCK_RESOURCES_CAPACITY = [
    { name: 'api-gateway-prod-01', current: '55%', predicted: '75%', recommended: '擴展', cost: '+$150/月' },
    { name: 'rds-prod-main', current: '62%', predicted: '68%', recommended: '觀察', cost: '-' },
    { name: 'k8s-prod-cluster-node-1', current: '85%', predicted: '98%', recommended: '緊急擴展', cost: '+$200/月' },
    { name: 'elasticache-prod-03', current: '40%', predicted: '45%', recommended: '觀察', cost: '-' },
];

const MOCK_SUGGESTIONS = [
    { title: '擴展 Kubernetes 生產集群', impact: '高', effort: '中', details: '`k8s-prod-cluster` 的 CPU 預計在 15 天內達到 95%。建議增加 2 個節點以避免效能下降。' },
    { title: '升級 RDS 資料庫實例類型', impact: '中', effort: '高', details: '`rds-prod-main` 的記憶體使用率持續增長。建議從 `db.t3.large` 升級至 `db.t3.xlarge`。' },
    { title: '清理舊的 S3 儲存桶日誌', impact: '低', effort: '低', details: '`s3-log-archive` 儲存桶已超過 5TB。建議設定生命週期規則以降低成本。' },
];

const CapacityPlanningPage: React.FC = () => {
    const [timeRange, setTimeRange] = useState('60_30');
    const [isPlaceholderModalOpen, setIsPlaceholderModalOpen] = useState(false);
    const [modalFeatureName, setModalFeatureName] = useState('');

    const showPlaceholderModal = (featureName: string) => {
        setModalFeatureName(featureName);
        setIsPlaceholderModalOpen(true);
    };

    const timeRangeOptions = [
        { label: '最近 30 天 + 預測 15 天', value: '30_15' },
        { label: '最近 60 天 + 預測 30 天', value: '60_30' },
        { label: '最近 90 天 + 預測 45 天', value: '90_45' },
    ];

    const trendOption = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['CPU', 'Memory', 'Storage'], textStyle: { color: '#fff' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'time', axisLine: { lineStyle: { color: '#888' } } },
        yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value} %' }, splitLine: { lineStyle: { color: '#374151' } } },
        series: [
            { name: 'CPU', type: 'line', data: MOCK_TRENDS.cpu.historical, showSymbol: false, lineStyle: { color: '#38bdf8' } },
            { name: 'CPU Forecast', type: 'line', data: MOCK_TRENDS.cpu.forecast, showSymbol: false, lineStyle: { type: 'dashed', color: '#38bdf8' } },
            { name: 'Memory', type: 'line', data: MOCK_TRENDS.memory.historical, showSymbol: false, lineStyle: { color: '#a78bfa' } },
            { name: 'Memory Forecast', type: 'line', data: MOCK_TRENDS.memory.forecast, showSymbol: false, lineStyle: { type: 'dashed', color: '#a78bfa' } },
            { name: 'Storage', type: 'line', data: MOCK_TRENDS.storage.historical, showSymbol: false, lineStyle: { color: '#34d399' } },
            { name: 'Storage Forecast', type: 'line', data: MOCK_TRENDS.storage.forecast, showSymbol: false, lineStyle: { type: 'dashed', color: '#34d399' } },
        ]
    };

    const forecastModelOption = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['預測', '最壞情況', '最佳情況'], textStyle: { color: '#fff' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'time', axisLine: { lineStyle: { color: '#888' } } },
        yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value} %' }, splitLine: { lineStyle: { color: '#374151' } } },
        series: [
            {
                name: '預測', type: 'line', data: MOCK_TRENDS.cpu.forecast, showSymbol: false,
                lineStyle: { color: '#facc15' },
            },
            {
                name: '最佳情況', type: 'line', data: MOCK_TRENDS.cpu.forecast.map(([time, val]) => [time, Math.max(0, val - 5 - Math.random() * 5)]),
                lineStyle: { opacity: 0 }, stack: 'confidence-band', symbol: 'none'
            },
            {
                name: '最壞情況', type: 'line', data: MOCK_TRENDS.cpu.forecast.map(([time, val], index) => {
                    const bestCaseVal = Math.max(0, val - 5 - Math.random() * 5);
                    const worstCaseVal = Math.min(100, val + 5 + Math.random() * 5);
                    return [time, worstCaseVal - bestCaseVal];
                }),
                lineStyle: { opacity: 0 }, areaStyle: { color: 'rgba(250, 204, 21, 0.2)' }, stack: 'confidence-band', symbol: 'none'
            }
        ]
    };

    const handleTriggerAI = () => showPlaceholderModal('觸發 AI 容量分析');
    const handleExport = () => showPlaceholderModal('匯出容量規劃報表');

    return (
        <div className="space-y-6">
            <Toolbar
                leftActions={
                    <Dropdown
                        label="時間範圍"
                        options={timeRangeOptions}
                        value={timeRange}
                        onChange={setTimeRange}
                        minWidth="w-64"
                    />
                }
                rightActions={
                    <>
                        <ToolbarButton icon="brain-circuit" text="觸發 AI 分析" onClick={handleTriggerAI} />
                        <ToolbarButton icon="download" text="匯出報表" onClick={handleExport} />
                    </>
                }
            />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 glass-card rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4">資源使用趨勢 (含預測)</h2>
                    <div className="h-80">
                        <EChartsReact option={trendOption} />
                    </div>
                </div>
                <div className="lg:col-span-2 glass-card rounded-xl p-6">
                     <h2 className="text-xl font-bold mb-4">CPU 容量預測模型</h2>
                     <div className="h-80">
                        <EChartsReact option={forecastModelOption} />
                     </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4">AI 優化建議</h2>
                    <div className="space-y-4">
                        {MOCK_SUGGESTIONS.map((s, i) => (
                            <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-white">{s.title}</h3>
                                    <div className="flex space-x-2 text-xs">
                                        <span className="px-2 py-0.5 bg-red-500/30 text-red-300 rounded-full">{s.impact} 影響</span>
                                        <span className="px-2 py-0.5 bg-yellow-500/30 text-yellow-300 rounded-full">{s.effort} 投入</span>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-400 mt-1">{s.details}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="glass-card rounded-xl p-6 flex flex-col">
                    <h2 className="text-xl font-bold mb-4">詳細分析</h2>
                    <div className="flex-grow overflow-y-auto">
                        <table className="w-full text-sm text-left text-slate-300">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2">資源名稱</th>
                                    <th className="px-4 py-2">目前用量</th>
                                    <th className="px-4 py-2">30 天預測</th>
                                    <th className="px-4 py-2">建議</th>
                                    <th className="px-4 py-2">成本估算</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {MOCK_RESOURCES_CAPACITY.map(r => (
                                    <tr key={r.name}>
                                        <td className="px-4 py-3 font-medium">{r.name}</td>
                                        <td className="px-4 py-3">{r.current}</td>
                                        <td className="px-4 py-3">{r.predicted}</td>
                                        <td className={`px-4 py-3 font-semibold ${r.recommended.includes('緊急') ? 'text-red-400' : r.recommended.includes('擴展') ? 'text-yellow-400' : ''}`}>{r.recommended}</td>
                                        <td className="px-4 py-3">{r.cost}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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

export default CapacityPlanningPage;
