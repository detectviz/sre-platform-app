import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { GoogleGenAI, Type } from "@google/genai";
import Icon from '../../components/Icon';
import Toolbar, { ToolbarButton } from '../../components/Toolbar';
import PlaceholderModal from '../../components/PlaceholderModal';

// Define types for the structured data we expect from the AI
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
    const [healthScore, setHealthScore] = useState<{ score: number; summary: string } | null>(null);
    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isPlaceholderModalOpen, setIsPlaceholderModalOpen] = useState(false);
    const [modalFeatureName, setModalFeatureName] = useState('');

    const [isLoadingScore, setIsLoadingScore] = useState(true);
    const [isLoadingAnomalies, setIsLoadingAnomalies] = useState(true);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);

    const showPlaceholderModal = (featureName: string) => {
        setModalFeatureName(featureName);
        setIsPlaceholderModalOpen(true);
    };

    const MOCK_SYSTEM_METRICS = `
- CPU Usage (p95): 88% (Trending up)
- Memory Usage: 75% (Stable)
- API Latency (p99): 1200ms (Spike detected)
- Error Rate: 5.2% (Increased from 1.1%)
- Database Connections: 95/100 (Near capacity)
- Recent Deployments: api-service v2.5.1 (2 hours ago), payment-service v1.8.0 (4 hours ago)
    `;

    const generateHealthScore = useCallback(async () => {
        setIsLoadingScore(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `
You are an expert SRE AI. Analyze these metrics and provide an overall system health score from 0-100 and a concise one-sentence summary in Traditional Chinese.
Metrics:
${MOCK_SYSTEM_METRICS}

Respond in this JSON format: {"score": <number>, "summary": "<string>"}.
Example: {"score": 75, "summary": "系統因 API 延遲與錯誤率上升而處於警告狀態，但關鍵基礎設施尚屬穩定。"}
`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                }
            });

            const result = JSON.parse(response.text);
            setHealthScore(result);

        } catch (error) {
            console.error("AI Health Score Error:", error);
            setHealthScore({ score: 0, summary: "無法生成 AI 健康評分。" });
        } finally {
            setIsLoadingScore(false);
        }
    }, []);
    
    const generateAnomalies = useCallback(async () => {
        setIsLoadingAnomalies(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `
You are an expert SRE Anomaly Detection AI. Analyze these metrics and identify the top 3-4 most critical anomalies. Provide a severity ('critical', 'warning', or 'info'), a concise description, and a relative timestamp in Traditional Chinese.
Metrics:
${MOCK_SYSTEM_METRICS}
`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                severity: { type: Type.STRING, enum: ['critical', 'warning', 'info'] },
                                description: { type: Type.STRING },
                                timestamp: { type: Type.STRING },
                            },
                            required: ['severity', 'description', 'timestamp'],
                        }
                    }
                }
            });

            const result: Anomaly[] = JSON.parse(response.text);
            setAnomalies(result);

        } catch (error) {
            console.error("AI Anomalies Error:", error);
            setAnomalies([]);
        } finally {
            setIsLoadingAnomalies(false);
        }
    }, []);

    const generateSuggestions = useCallback(async () => {
        setIsLoadingSuggestions(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `
You are an expert SRE Optimization AI. Based on these metrics, provide 3 proactive optimization suggestions. For each, give a title, impact ('高', '中', '低'), effort ('高', '中', '低'), and details in Traditional Chinese.
If a suggestion relates to a specific resource mentioned in the metrics, also provide 'action_button_text' (e.g., "查看資源") and a corresponding 'action_link' using the mappings below. Make these fields optional.

Metrics:
${MOCK_SYSTEM_METRICS}

Resource Mappings for 'action_link':
- api-gateway-prod-01 -> /resources/res-001
- rds-prod-main -> /resources/res-002
- k8s-prod-cluster -> /resources/res-003
- user-service -> /resources/res-007
- payment-service -> /resources/res-006
`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                impact: { type: Type.STRING, enum: ['高', '中', '低'] },
                                effort: { type: Type.STRING, enum: ['高', '中', '低'] },
                                details: { type: Type.STRING },
                                action_button_text: { type: Type.STRING },
                                action_link: { type: Type.STRING },
                            },
                            required: ['title', 'impact', 'effort', 'details'],
                        }
                    }
                }
            });

            const result: Suggestion[] = JSON.parse(response.text);
            setSuggestions(result);

        } catch (error) {
            console.error("AI Suggestions Error:", error);
            setSuggestions([]);
        } finally {
            setIsLoadingSuggestions(false);
        }
    }, []);

    useEffect(() => {
        generateHealthScore();
        generateAnomalies();
        generateSuggestions();
    }, [generateHealthScore, generateAnomalies, generateSuggestions]);

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
                            onClick={() => {
                                generateHealthScore();
                                generateAnomalies();
                                generateSuggestions();
                            }}
                            disabled={isLoadingScore || isLoadingAnomalies || isLoadingSuggestions}
                        />
                        <ToolbarButton icon="download" text="匯出報表" onClick={() => showPlaceholderModal('匯出 AI 洞察報表')} />
                    </>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 glass-card rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <h2 className="text-xl font-bold mb-4">系統總體健康評分</h2>
                    {isLoadingScore || !healthScore ? (
                        <div className="animate-pulse flex flex-col items-center justify-center flex-grow">
                            <div className="w-32 h-32 bg-slate-700 rounded-full"></div>
                            <div className="h-4 bg-slate-700 rounded w-3/4 mt-4"></div>
                        </div>
                    ) : (
                        <>
                            <div className="relative w-32 h-32">
                                <svg className="w-full h-full" viewBox="0 0 36 36" transform="rotate(-90 18 18)">
                                    <path className="text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                                    <path className="text-purple-400 transition-all duration-500" strokeDasharray={`${healthScore.score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"></path>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-4xl font-bold text-white">{healthScore.score}</span>
                                </div>
                            </div>
                            <p className="mt-4 text-slate-300">{healthScore.summary}</p>
                        </>
                    )}
                </div>

                <div className="lg:col-span-2 glass-card rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4">AI 異常檢測</h2>
                    {isLoadingAnomalies ? (
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
                {isLoadingSuggestions ? (
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
