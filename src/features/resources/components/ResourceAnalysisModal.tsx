import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Modal from '@/shared/components/Modal';
import Icon from '@/shared/components/Icon';
import { Resource, ResourceAnalysis } from '@/shared/types';
import api from '@/services/api';
import { buildRoute } from '@/shared/constants/routes';

interface ResourceAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    resources: Resource[];
}

const Section: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div>
        <h3 className="font-bold text-lg text-purple-400 mb-2 flex items-center">
            <Icon name={icon} className="w-5 h-5 mr-2" />
            {title}
        </h3>
        <div className="pl-7 text-sm">
            {children}
        </div>
    </div>
);

const RiskLevelPill: React.FC<{ level: 'high' | 'medium' | 'low' }> = ({ level }) => {
    const styles = {
        high: 'bg-red-500/20 text-red-400',
        medium: 'bg-yellow-500/20 text-yellow-400',
        low: 'bg-sky-500/20 text-sky-400',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[level]}`}>{level}</span>;
};

const OptimizationTypePill: React.FC<{ type: 'cost' | 'performance' | 'security' }> = ({ type }) => {
    const styles = {
        cost: 'bg-green-500/20 text-green-400',
        performance: 'bg-blue-500/20 text-blue-400',
        security: 'bg-purple-500/20 text-purple-400',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[type]}`}>{type}</span>;
};

const ResourceAnalysisModal: React.FC<ResourceAnalysisModalProps> = ({ isOpen, onClose, resources }) => {
    const [analysis, setAnalysis] = useState<ResourceAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && resources.length > 0) {
            const fetchAnalysis = async () => {
                setIsLoading(true);
                setError(null);
                setAnalysis(null);
                try {
                    const { data } = await api.post<ResourceAnalysis>('/ai/resources/analyze', {
                        resource_ids: resources.map(r => r.id),
                    });
                    setAnalysis(data);
                } catch (err) {
                    setError('無法生成 AI 分析報告。');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchAnalysis();
        }
    }, [isOpen, resources]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-64">
                    <Icon name="loader-circle" className="w-12 h-12 text-purple-400 animate-spin" />
                    <p className="mt-4 text-slate-300">正在分析資源風險，請稍候...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-64 text-red-400">
                    <Icon name="server-crash" className="w-12 h-12 mb-4" />
                    <p className="font-semibold">{error}</p>
                </div>
            );
        }

        if (!analysis) {
            return (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <Icon name="info" className="w-10 h-10 mb-3" />
                    <p className="font-medium">目前沒有可顯示的分析結果。</p>
                    <p className="text-sm text-slate-500">請確認已選擇資源，或稍後再試一次。</p>
                </div>
            );
        }

        return (
            <div className="space-y-6 text-slate-300">
                <Section title="總體分析摘要" icon="file-text">
                    <p>{analysis.summary}</p>
                </Section>
                <Section title="風險分析" icon="shield-alert">
                    <div className="space-y-3">
                        {analysis.risk_analysis.map((risk, i) => (
                            <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <Link to={buildRoute.resourceDetails(risk.resource_id)} className="font-semibold text-white hover:underline">{risk.resource_name}</Link>
                                    <RiskLevelPill level={risk.risk_level} />
                                </div>
                                <p className="text-sm text-slate-400 mt-1">原因: {risk.reason}</p>
                                <p className="text-sm text-sky-300 mt-1">建議: {risk.recommendation}</p>
                            </div>
                        ))}
                    </div>
                </Section>
                <Section title="優化建議" icon="wrench">
                    <div className="space-y-3">
                        {analysis.optimization_suggestions.map((suggestion, i) => (
                            <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <Link to={buildRoute.resourceDetails(suggestion.resource_id)} className="font-semibold text-white hover:underline">{suggestion.resource_name}</Link>
                                    <OptimizationTypePill type={suggestion.type} />
                                </div>
                                <p className="text-sm text-slate-300 mt-1">{suggestion.suggestion}</p>
                            </div>
                        ))}
                    </div>
                </Section>
            </div>
        );
    };

    return (
        <Modal
            title={`AI 資源分析 (${resources.length} 個資源)`}
            isOpen={isOpen}
            onClose={onClose}
            width="w-2/3"
            footer={
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md">
                    關閉
                </button>
            }
        >
            <div className="max-h-[60vh] overflow-y-auto pr-2 -mr-4">
                {renderContent()}
            </div>
        </Modal>
    );
};

export default ResourceAnalysisModal;