import React from 'react';
import Icon from './Icon';
import { RuleAnalysisReport } from '../types';

interface RuleAnalysisDisplayProps {
    report: RuleAnalysisReport | null;
    isLoading: boolean;
    error: string | null;
}

const severityStyles: Record<'low' | 'medium' | 'high', string> = {
    low: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10',
    medium: 'text-amber-300 border-amber-500/40 bg-amber-500/10',
    high: 'text-red-300 border-red-500/40 bg-red-500/10',
};

const priorityLabels: Record<'low' | 'medium' | 'high', string> = {
    low: '低',
    medium: '中',
    high: '高',
};

const RuleAnalysisDisplay: React.FC<RuleAnalysisDisplayProps> = ({ report, isLoading, error }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Icon name="loader-circle" className="w-12 h-12 text-purple-400 animate-spin" />
                <p className="mt-4 text-slate-300">正在生成 AI 分析報告，請稍候...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-red-400">
                <Icon name="server-crash" className="w-12 h-12 mb-4" />
                <p className="font-semibold">AI 分析失敗</p>
                <p className="text-sm mt-2 text-center px-6">{error}</p>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Icon name="alert-circle" className="w-12 h-12 mb-4" />
                <p>沒有可顯示的分析結果。</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 text-slate-200">
            <section>
                <h3 className="text-lg font-semibold text-purple-300 mb-2 flex items-center">
                    <Icon name="file-text" className="w-5 h-5 mr-2" />
                    分析摘要
                </h3>
                <p className="leading-relaxed">{report.summary}</p>
            </section>

            {report.evaluatedRules.length > 0 && (
                <section>
                    <h3 className="text-lg font-semibold text-purple-300 mb-2 flex items-center">
                        <Icon name="list-checks" className="w-5 h-5 mr-2" />
                        分析範圍
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {report.evaluatedRules.map(rule => (
                            <div key={rule.id} className="glass-card border border-slate-700/60 rounded-lg p-3">
                                <p className="text-sm font-semibold text-white">{rule.name}</p>
                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                                    <span className="px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-600/80">
                                        狀態：{rule.status}
                                    </span>
                                    {rule.severity && (
                                        <span className={`px-2 py-0.5 rounded-full border ${severityStyles[rule.severity]} capitalize`}>
                                            嚴重度：{rule.severity}
                                        </span>
                                    )}
                                    {rule.type && (
                                        <span className="px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-600/80">
                                            類型：{rule.type}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {report.metrics.length > 0 && (
                <section>
                    <h3 className="text-lg font-semibold text-purple-300 mb-2 flex items-center">
                        <Icon name="activity" className="w-5 h-5 mr-2" />
                        關鍵指標
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {report.metrics.map((metric, idx) => (
                            <div key={`${metric.label}-${idx}`} className="glass-card border border-slate-700/60 rounded-lg p-4">
                                <p className="text-sm text-slate-400">{metric.label}</p>
                                <p className="text-2xl font-semibold text-white mt-2">{metric.value}</p>
                                {metric.description && (
                                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{metric.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {report.insights.length > 0 && (
                <section>
                    <h3 className="text-lg font-semibold text-purple-300 mb-2 flex items-center">
                        <Icon name="alert-triangle" className="w-5 h-5 mr-2" />
                        關鍵洞察
                    </h3>
                    <div className="space-y-3">
                        {report.insights.map((insight, idx) => (
                            <div key={`${insight.title}-${idx}`} className="glass-card border border-slate-700/60 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-white">{insight.title}</h4>
                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${severityStyles[insight.severity]}`}>
                                        風險：{priorityLabels[insight.severity]}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-300 mt-2 leading-relaxed">{insight.detail}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {report.recommendations.length > 0 && (
                <section>
                    <h3 className="text-lg font-semibold text-purple-300 mb-2 flex items-center">
                        <Icon name="wrench" className="w-5 h-5 mr-2" />
                        建議措施
                    </h3>
                    <div className="space-y-3">
                        {report.recommendations.map((recommendation, idx) => (
                            <div key={`${recommendation.action}-${idx}`} className="glass-card border border-slate-700/60 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-white">{recommendation.action}</h4>
                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${severityStyles[recommendation.priority]}`}>
                                        優先度：{priorityLabels[recommendation.priority]}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-300 mt-2 leading-relaxed">{recommendation.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default RuleAnalysisDisplay;
