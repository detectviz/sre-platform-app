import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon';
import Toolbar, { ToolbarButton } from '../../components/Toolbar';
import PlaceholderModal from '../../components/PlaceholderModal';
import api from '../../services/api';
import { exportToCsv } from '../../services/export';
import EChartsReact from '../../components/EChartsReact';

interface HealthScore {
    score: number;
    summary: string;
}

interface Anomaly {
  severity: 'critical' | 'warning' | 'info';
  description: string;
  timestamp: string;
}

interface Suggestion {
  title: string;
  impact: '高' | '中' | '低';
  effort: '高' | '中' | '低';
  details: string;
  action_button_text?: string;
  action_link?: string;
}

const AIInsightsPage: React.FC = () => {
    const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isPlaceholderModalOpen, setIsPlaceholderModalOpen] = useState(false);
    const [modalFeatureName, setModalFeatureName] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    
    const showPlaceholderModal = (featureName: string) => {
        setModalFeatureName(featureName);
        setIsPlaceholderModalOpen(true);
    };

    const fetchAllInsights = useCallback(async () => {
        setIsLoading(true);
        try {
            const [scoreRes, anomaliesRes, suggestionsRes] = await Promise.all([
                api.get<HealthScore>('/ai/insights/health-score'),
                api.get<Anomaly[]>('/ai/insights/anomalies'),
                api.get<Suggestion[]>('/ai/insights/suggestions')
            ]);
            setHealthScore(scoreRes.data);
            setAnomalies(anomaliesRes.data);
            setSuggestions(suggestionsRes.data);
        } catch (error) {
            console.error("Failed to fetch AI insights:", error);
            // Set error states for components
            setHealthScore({ score: 0, summary: "無法生成 AI 健康評分。" });
            setAnomalies([]);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllInsights();
    }, [fetchAllInsights]);

    const healthScoreGaugeOption = healthScore ? {
        series: [{
            type: 'gauge',
            radius: '90%',
            center: ['50%', '55%'],
            axisLine: {
                lineStyle: {
                    width: 18,
                    color: [
                        [0.5, '#dc2626'], // red-600
                        [0.8, '#f97316'], // orange-500
                        [1, '#10b981']    // green-500
                    ]
                }
            },
            pointer: {
                itemStyle: {
                    color: 'auto'
                },
                length: '60%',
                width: 6,
            },
            axisTick: {
                distance: -18,
                length: 5,
                lineStyle: {
                    color: '#FFF',
                    width: 1
                }
            },
            splitLine: {
                distance: -18,
                length: 12,
                lineStyle: {
                    color: '#FFF',
                    width: 2
                }
            },
            axisLabel: {
                color: 'auto',
                distance: 25,
                fontSize: 12
            },
            detail: {
                valueAnimation: true,
                formatter: '{value}',
                color: 'auto',
                fontSize: 36,
                fontWeight: 'bold',
                offsetCenter: [0, '40%']
            },
            data: [{
                value: healthScore.score
            }]
        }]
    } : {};


    const handleExport = () => {
        const dataToExport = [
            ...anomalies.map(a => ({
                type: 'Anomaly',
                severity_or_impact: a.severity,
                description: a.description,
                timestamp_or_effort: a.timestamp,
                details: ''
            })),
            ...suggestions.map(s => ({
                type: 'Suggestion',
                severity_or_impact: s.impact,
                description: s.title,
                timestamp_or_effort: s.effort,
                details: s.details
            }))
        ];

        if (dataToExport.length === 0) {
            alert("沒有可匯出的資料。");
            return;
        }

        exportToCsv({
            filename: `ai-insights-${new Date().toISOString().split('T')[0]}.csv`,
            headers: ['type', 'severity_or_impact', 'description', 'timestamp_or_effort', 'details'],
            data: dataToExport,
        });
    };

    const getSeverityPill = (severity: Anomaly['severity']) => {
        switch (severity) {
            case 'critical': return 'bg-red-500/20 text-red-400';
            case 'warning': return 'bg-yellow-500/20 text-yellow-400';
            case 'info': return 'bg-sky-500/20 text-sky-400';
        }
    };
    
    const getImpactEffortPill = (level: Suggestion['impact'] | Suggestion['effort']) => {
        switch (level) {
            case '高': return 'bg-red-500/20 text-red-400';
            case '中': return 'bg-yellow-500/20 text-yellow-400';
            case '低': return 'bg-sky-500/20 text-sky-400';
        }
    };

    return (
        <div className="space-y-6">
            <Toolbar
                rightActions={
                    <>
                        <ToolbarButton
                            icon="refresh-cw"
                            text="重新分析"
                            onClick={fetchAllInsights}
                            disabled={isLoading}
                        />
                        <ToolbarButton icon="download" text="匯出報表" onClick={handleExport} />
                    </>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-1 glass-card rounded-xl p-6 flex flex-col text-center">
                    {isLoading || !healthScore ? (
                        <div className="animate-pulse flex flex-col items-center space-y-4">
                            <div className="h-6 w-3/4 bg-slate-700 rounded"></div>
                            <div className="w-48 h-32 bg-slate-700 rounded-lg mt-4"></div>
                            <div className="h-4 w-5/6 bg-slate-700 rounded"></div>
                             <div className="h-4 w-4/6 bg-slate-700 rounded"></div>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-xl font-bold mb-2">系統總體健康評分</h2>
                            <div className="flex-grow">
                                <EChartsReact option={healthScoreGaugeOption} style={{ height: '200px' }} />
                            </div>
                            <p className="text-sm text-slate-400 max-w-xs mx-auto">{healthScore.summary}</p>
                        </>
                    )}
                </div>

                <div className="lg:col-span-2 glass-card rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4">AI 異常檢測</h2>
                    {isLoading ? (
                        <div className="space-y-3 animate-pulse">
                            {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-slate-700 rounded-lg"></div>)}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {anomalies.map((anomaly, index) => (
                                <div key={index} className="flex items-center p-3 bg-slate-800/50 rounded-lg">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getSeverityPill(anomaly.severity)} mr-3 shrink-0`}>
                                        {anomaly.severity}
                                    </span>
                                    <p className="flex-grow text-slate-300 text-sm">{anomaly.description}</p>
                                    <span className="text-sm text-slate-400 ml-3 shrink-0">{anomaly.timestamp}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="glass-card rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">主動優化建議</h2>
                {isLoading ? (
                    <div className="space-y-4 animate-pulse">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                                <div className="h-5 bg-slate-700 rounded w-1/3 mb-2"></div>
                                <div className="h-4 bg-slate-700 rounded w-full"></div>
                                <div className="h-4 bg-slate-700 rounded w-3/4 mt-1"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {suggestions.map((s, i) => (
                            <div key={i} className="glass-card rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-white">{s.title}</h3>
                                    <div className="flex space-x-2 text-xs shrink-0 ml-4">
                                        <span className={`px-2 py-0.5 rounded-full ${getImpactEffortPill(s.impact)}`}>{s.impact} 影響</span>
                                        <span className={`px-2 py-0.5 rounded-full ${getImpactEffortPill(s.effort)}`}>{s.effort} 投入</span>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-400 mt-1">{s.details}</p>
                                {s.action_link && s.action_button_text && (
                                    <div className="mt-3 text-right">
                                        <Link to={s.action_link}>
                                            <button className="flex items-center text-sm text-white bg-sky-600 hover:bg-sky-700 px-3 py-1.5 rounded-md ml-auto">
                                                <Icon name="arrow-right" className="w-4 h-4 mr-2"/>
                                                {s.action_button_text}
                                            </button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <PlaceholderModal
                isOpen={isPlaceholderModalOpen}
                onClose={() => setIsPlaceholderModalOpen(false)}
                featureName={modalFeatureName}
            />
        </div>
    );
};

export default AIInsightsPage;