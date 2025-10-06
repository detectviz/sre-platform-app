import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/shared/components/Icon';
import { IncidentAnalysis, MultiIncidentAnalysis, Recommendation, GroupActionRecommendation } from '@/shared/types';

interface AIAnalysisDisplayProps {
  report: IncidentAnalysis | MultiIncidentAnalysis | string | null;
  isLoading: boolean;
}

const Section: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="rounded-xl border border-purple-500/20 bg-slate-900/40 p-4 shadow-inner shadow-purple-500/5">
        <h3 className="font-bold text-base text-purple-300 mb-3 flex items-center">
            <Icon name={icon} className="w-5 h-5 mr-2" />
            {title}
        </h3>
        <div className="pl-7 text-sm leading-relaxed text-slate-200">
            {children}
        </div>
    </div>
);

const RecommendationItem: React.FC<{ recommendation: Recommendation | GroupActionRecommendation }> = ({ recommendation }) => (
    <div className="glass-card p-3 rounded-lg flex justify-between items-center">
        <p className="flex-grow text-sm">{recommendation.description}</p>
        {recommendation.action_link && recommendation.action_text && (
            <Link to={recommendation.action_link} className="ml-4 shrink-0">
                <button className="flex items-center text-sm text-white bg-sky-600 hover:bg-sky-700 px-3 py-1.5 rounded-md">
                    <Icon name="arrow-right" className="w-4 h-4 mr-2" />
                    {recommendation.action_text}
                </button>
            </Link>
        )}
        {recommendation.playbook_id && recommendation.action_text && (
            <Link to={`/automation`} className="ml-4 shrink-0">
                <button className="flex items-center text-sm text-white bg-sky-600 hover:bg-sky-700 px-3 py-1.5 rounded-md">
                    <Icon name="play-circle" className="w-4 h-4 mr-2" />
                    {recommendation.action_text}
                </button>
            </Link>
        )}
    </div>
);

const SingleIncidentReport: React.FC<{ analysis: IncidentAnalysis }> = ({ analysis }) => (
    <div className="space-y-6 text-slate-300">
        <Section title="分析摘要" icon="file-text">
            <p>{analysis.summary}</p>
        </Section>
        <Section title="潛在根本原因" icon="search-code">
            <ul className="list-disc list-inside space-y-1">
                {(analysis.root_causes || []).map((cause, i) => <li key={i}>{cause}</li>)}
            </ul>
        </Section>
        <Section title="建議步驟" icon="wrench">
            <div className="space-y-3 -ml-7">
                {(analysis.recommendations || []).map((rec, i) => <RecommendationItem key={i} recommendation={rec} />)}
            </div>
        </Section>
    </div>
);

const MultiIncidentReport: React.FC<{ analysis: MultiIncidentAnalysis }> = ({ analysis }) => (
    <div className="space-y-6 text-slate-300">
        <Section title="總結" icon="file-text">
            <p>{analysis.summary}</p>
        </Section>
        <Section title="共同模式分析" icon="search-code">
            <ul className="list-disc list-inside space-y-1">
                {(analysis.common_patterns || []).map((pattern, i) => <li key={i}>{pattern}</li>)}
            </ul>
        </Section>
        <Section title="建議的批次操作" icon="wrench">
             <div className="space-y-3 -ml-7">
                {(analysis.group_actions || []).map((action, i) => <RecommendationItem key={i} recommendation={action} />)}
            </div>
        </Section>
    </div>
);


const AIAnalysisDisplay: React.FC<AIAnalysisDisplayProps> = ({ report, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Icon name="loader-circle" className="w-12 h-12 text-purple-400 animate-spin" />
        <p className="mt-4 text-slate-300">正在生成 AI 分析報告，請稍候...</p>
      </div>
    );
  }

  if (!report) {
    return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
             <Icon name="alert-circle" className="w-12 h-12 mb-4" />
             <p>無法載入分析報告。</p>
        </div>
    );
  }

  if (typeof report === 'string') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-400">
          <Icon name="server-crash" className="w-12 h-12 mb-4" />
          <p className="font-semibold">AI 分析失敗</p>
          <p className="text-sm mt-2">{report}</p>
      </div>
    );
  }

  if (report && 'root_causes' in report) {
    return <SingleIncidentReport analysis={report} />;
  }

  if (report && 'common_patterns' in report) {
    return <MultiIncidentReport analysis={report} />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-64 text-red-400">
        <Icon name="alert-triangle" className="w-12 h-12 mb-4" />
        <p>收到的分析報告格式無效。</p>
    </div>
  );
};

export default AIAnalysisDisplay;
